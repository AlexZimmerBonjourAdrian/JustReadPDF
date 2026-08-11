import { convert } from '@pdf2md/core';
import Tesseract from 'tesseract.js';

export class PdfTextExtractor {
  private static MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private static pdfjs: any = null;

  // Inicializar pdfjs solo en el cliente
  private static async getPdfjs() {
    if (!this.pdfjs && typeof window !== 'undefined') {
      const { pdfjs } = await import('react-pdf');
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      this.pdfjs = pdfjs;
    }
    return this.pdfjs;
  }

  /**
   * Extrae texto de un archivo PDF manteniendo formato (markdown)
   * @param file Archivo PDF a procesar
   * @param progressCallback Callback opcional para reportar progreso de OCR
   * @returns Texto markdown extraído del PDF con estructura preservada
   */
  static async extractText(file: File, progressCallback?: (progress: number) => void): Promise<string> {
    try {
      // Validar tamaño del archivo
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo permitido: 50MB`);
      }

      console.log(`Procesando PDF: ${file.name}, Tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      
      // Intentar primero con pdf2md para archivos pequeños (< 10MB)
      if (file.size < 10 * 1024 * 1024) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          console.log('ArrayBuffer creado, iniciando conversión con pdf2md...');
          
          const result = await convert(arrayBuffer);
          console.log('Conversión pdf2md completada, status:', result.status);
          
          if (result.status === 'success' && typeof result.markdown === 'string' && result.markdown.length > 0) {
            console.log(`Texto extraído con pdf2md: ${result.markdown.length} caracteres`);
            return result.markdown;
          }
          
          console.warn('pdf2md falló o devolvió resultado vacío, intentando fallback con react-pdf');
        } catch (pdf2mdError) {
          console.warn('Error con pdf2md, intentando fallback con react-pdf:', pdf2mdError);
        }
      } else {
        console.log('Archivo grande (>10MB), usando react-pdf directamente para mejor rendimiento');
      }
      
      // Fallback a react-pdf (procesamiento página por página)
      return await this.extractWithReactPdf(file, progressCallback);
      
    } catch (error) {
      console.error('Error en PdfTextExtractor.extractText:', error);
      
      if (error instanceof Error) {
        throw new Error(`Error al procesar PDF: ${error.message}`);
      }
      
      throw new Error('Error desconocido al procesar el PDF');
    }
  }

  /**
   * Extrae texto usando react-pdf con procesamiento página por página
   * @param file Archivo PDF a procesar
   * @param progressCallback Callback opcional para reportar progreso de OCR
   * @returns Texto extraído del PDF
   */
  private static async extractWithReactPdf(file: File, progressCallback?: (progress: number) => void): Promise<string> {
    try {
      console.log('Iniciando extracción con react-pdf (procesamiento página por página)...');
      
      const pdfjs = await this.getPdfjs();
      if (!pdfjs) {
        throw new Error('pdfjs no está disponible en este entorno');
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      console.log(`PDF cargado con react-pdf, ${pdf.numPages} páginas`);
      
      let fullText = '';
      const batchSize = 5; // Procesar 5 páginas a la vez para evitar bloqueos
      
      for (let i = 1; i <= pdf.numPages; i += batchSize) {
        const endIndex = Math.min(i + batchSize - 1, pdf.numPages);
        const batchPromises = [];
        
        for (let pageNum = i; pageNum <= endIndex; pageNum++) {
          batchPromises.push(this.extractPageText(pdf, pageNum));
        }
        
        const batchResults = await Promise.all(batchPromises);
        fullText += batchResults.join('\n\n');
        
        console.log(`Páginas ${i}-${endIndex}/${pdf.numPages} procesadas`);
        
        // Pequeña pausa para no bloquear el UI
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      if (fullText.trim().length === 0) {
        console.warn('Texto vacío detectado, PDF probablemente escaneado. Iniciando OCR...');
        return await this.extractWithOCR(file, progressCallback);
      }
      
      console.log(`Texto extraído con react-pdf: ${fullText.length} caracteres`);
      
      // Aplicar formato básico al texto extraído
      return this.formatTextToMarkdown(fullText);
      
    } catch (error) {
      console.error('Error en extractWithReactPdf:', error);
      throw new Error(`Error al extraer texto con react-pdf: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Extrae texto usando OCR para PDFs escaneados
   * @param file Archivo PDF a procesar
   * @param progressCallback Callback opcional para reportar progreso de OCR
   * @returns Texto extraído del PDF
   */
  private static async extractWithOCR(file: File, progressCallback?: (progress: number) => void): Promise<string> {
    try {
      console.log('Iniciando OCR para PDF escaneado...');
      
      const pdfjs = await this.getPdfjs();
      if (!pdfjs) {
        throw new Error('pdfjs no está disponible en este entorno');
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      console.log(`PDF cargado para OCR, ${pdf.numPages} páginas`);
      
      // Crear 2 workers para procesamiento paralelo
      const worker1 = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text' && progressCallback) {
            progressCallback(m.progress * 100);
          }
          console.log(`OCR Worker 1: ${m.status}${m.status === 'recognizing text' ? ` ${(m.progress * 100).toFixed(1)}%` : ''}`);
        }
      });
      
      const worker2 = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          console.log(`OCR Worker 2: ${m.status}${m.status === 'recognizing text' ? ` ${(m.progress * 100).toFixed(1)}%` : ''}`);
        }
      });
      
      let fullText = '';
      const totalPages = pdf.numPages;
      
      // Procesar páginas en paralelo con 2 workers
      const promises: Promise<string>[] = [];
      
      for (let i = 1; i <= totalPages; i++) {
        const worker = i % 2 === 0 ? worker2 : worker1;
        
        const pagePromise = (async () => {
          console.log(`Procesando página ${i}/${totalPages} con OCR...`);
          
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // 144 DPI para mejor velocidad
          
          // Crear canvas
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            throw new Error('No se pudo obtener contexto del canvas');
          }
          
          // Fondo blanco para evitar ruido
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Renderizar página al canvas
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          
          // Convertir a BMP para encoding más rápido
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob!);
            }, 'image/bmp');
          });
          
          // OCR del canvas
          const { data: { text } } = await worker.recognize(blob);
          
          console.log(`Página ${i}/${totalPages} completada con OCR`);
          
          // Limpiar canvas para liberar memoria
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          return text;
        })();
        
        promises.push(pagePromise);
        
        // Procesar hasta 4 páginas en paralelo para no saturar memoria
        if (promises.length >= 4 || i === totalPages) {
          const results = await Promise.all(promises);
          fullText += results.join('\n\n');
          promises.length = 0; // Limpiar array de promesas
        }
      }
      
      await worker1.terminate();
      await worker2.terminate();
      
      if (fullText.trim().length === 0) {
        throw new Error('No se pudo extraer texto con OCR. El PDF puede no tener texto legible.');
      }
      
      console.log(`Texto extraído con OCR: ${fullText.length} caracteres`);
      
      // Aplicar formato básico al texto extraído
      return this.formatTextToMarkdown(fullText);
      
    } catch (error) {
      console.error('Error en extractWithOCR:', error);
      throw new Error(`Error al extraer texto con OCR: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Extrae texto de una página específica
   * @param pdf Documento PDF cargado
   * @param pageNumber Número de página
   * @returns Texto de la página
   */
  private static async extractPageText(pdf: any, pageNumber: number): Promise<string> {
    try {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .filter((str: string) => str.trim().length > 0) // Filtrar strings vacíos
        .join(' ');
      
      if (pageText.trim().length === 0) {
        console.warn(`Página ${pageNumber} no tiene texto extraíble`);
      }
      
      return pageText;
    } catch (error) {
      console.error(`Error extrayendo página ${pageNumber}:`, error);
      return '';
    }
  }

  /**
   * Formatea texto plano a markdown básico
   * @param text Texto plano a formatear
   * @returns Texto formateado en markdown
   */
  private static formatTextToMarkdown(text: string): string {
    // Detectar posibles headers (líneas en mayúsculas o con palabras clave)
    const lines = text.split('\n');
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      
      // Detectar headers (líneas cortas en mayúsculas o con patrones específicos)
      if (trimmed.length > 0 && trimmed.length < 100 && 
          (trimmed === trimmed.toUpperCase() || 
           /^(CHAPTER|SECTION|PART|INTRODUCTION|CONCLUSION|REFERENCES|ABSTRACT|TABLE|FIGURE)/i.test(trimmed))) {
        return `## ${trimmed}`;
      }
      
      return line;
    });
    
    return formattedLines.join('\n');
  }

  /**
   * Extrae texto de un PDF y lo convierte a HTML para mejor preservación de formato
   * @param file Archivo PDF a procesar
   * @returns HTML extraído del PDF con estructura y formato preservados
   */
  static async extractHtml(file: File): Promise<string> {
    const markdown = await this.extractText(file);
    
    // Convertir markdown a HTML básico manteniendo estructura
    let html = markdown
      // Headers
      .replace(/^######\s+(.*)$/gm, '<h6>$1</h6>')
      .replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>')
      .replace(/^####\s+(.*)$/gm, '<h4>$1</h4>')
      .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
      .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
      .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code inline
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      // Images (removerlas pero mantener referencia)
      .replace(/!\[(.*?)\]\((.*?)\)/g, '[Imagen: $1]')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    // Envolver en párrafos
    html = `<div class="pdf-content"><p>${html}</p></div>`;
    
    return html;
  }

  /**
   * Extrae texto de un PDF y lo convierte a texto plano (sin formato markdown)
   * @param file Archivo PDF a procesar
   * @returns Texto plano extraído del PDF
   */
  static async extractPlainText(file: File): Promise<string> {
    const markdown = await this.extractText(file);
    
    // Remover formato markdown básico
    return markdown
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      .replace(/!\[.*?\]\(.*?\)/g, '') // Images
      .replace(/\n{3,}/g, '\n\n') // Multiple newlines
      .trim();
  }
}
