import { convert } from '@pdf2md/core';
import { OcrService } from './OcrService';
import { DocumentStructureService } from './DocumentStructureService';

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
        return await OcrService.extractTextFromPDF(file, progressCallback);
      }
      
      console.log(`Texto extraído con react-pdf (structure-aware): ${fullText.length} caracteres`);
      // Ya viene con # ## ### por detector, no re-aplicar formatTextToMarkdown que duplicaría headings
      return fullText.replace(/\n{3,}/g, '\n\n').trim();
      
    } catch (error) {
      console.error('Error en extractWithReactPdf:', error);
      throw new Error(`Error al extraer texto con react-pdf: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Extrae texto de una página específica con detección de headings por fontSize/posición
   */
  private static async extractPageText(pdf: any, pageNumber: number): Promise<string> {
    try {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1 });
      const pageWidth = viewport.width;
      const items = textContent.items.filter((i: any) => i.str && i.str.trim());

      if (items.length === 0) {
        console.warn(`Página ${pageNumber} no tiene texto extraíble`);
        return '';
      }

      // Estructura-aware: agrupar por línea y clasificar heading
      const fontSizes = items.map((i: any) => Math.abs(i.transform[0]) || i.height || 10);
      const bodySize = DocumentStructureService.detectBodyFontSize(fontSizes);
      const lines = DocumentStructureService.groupItemsByLine(items, pageWidth);

      const mdLines: string[] = [];
      for (const line of lines) {
        // Filtrar índice con puntos suspensivos ......... (TOC) -> preservar pero como texto normal con saltos
        if (line.text.includes('..') && line.text.length > 40) {
          mdLines.push(line.text);
          continue;
        }
        const level = DocumentStructureService.classifyHeadingLevel(line, bodySize);
        if (level === 1) mdLines.push(`# ${line.text}`);
        else if (level === 2) mdLines.push(`## ${line.text}`);
        else if (level === 3) mdLines.push(`### ${line.text}`);
        else mdLines.push(line.text);
      }

      // Unir con saltos: headings separados por doble salto, texto continuo por espacio
      return mdLines.join('\n\n');
    } catch (error) {
      console.error(`Error extrayendo página ${pageNumber}:`, error);
      return '';
    }
  }

  /**
   * Extrae texto de un PDF y lo convierte a HTML para mejor preservación de formato
   * @param file Archivo PDF a procesar
   * @returns HTML extraído del PDF con estructura y formato preservados
   */
  static async extractHtml(file: File): Promise<string> {
    const markdown = await this.extractText(file);

    const blocks = markdown.split(/\n\n+/).map(block => {
      const b = block.trim();
      if (!b) return '';
      // Headings directos (ya detectados por DocumentStructureService)
      if (/^#{1,6}\s/.test(b)) {
        return b
          .replace(/^######\s+(.*)$/s, '<h6>$1</h6>')
          .replace(/^#####\s+(.*)$/s, '<h5>$1</h5>')
          .replace(/^####\s+(.*)$/s, '<h4>$1</h4>')
          .replace(/^###\s+(.*)$/s, '<h3>$1</h3>')
          .replace(/^##\s+(.*)$/s, '<h2>$1</h2>')
          .replace(/^#\s+(.*)$/s, '<h1>$1</h1>');
      }
      // TOC con leader dots ........ -> estructura legible
      if (/\.{4,}/.test(b) && b.length > 30) {
        const parts = b.split(/\.{4,}/);
        if (parts.length >= 2) {
          const title = parts[0].trim().replace(/</g,'&lt;');
          const page = parts[parts.length-1].trim().replace(/</g,'&lt;');
          return `<div class="toc-entry"><span class="toc-title">${title}</span><span class="toc-dots"></span><span class="toc-page">${page}</span></div>`;
        }
      }
      let inline = b
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/!\[(.*?)\]\(.*?\)/g, '<figure><div class="img-placeholder">[Figura: $1]</div><figcaption>$1</figcaption></figure>')
        .replace(/\n/g, '<br>');
      if (/^<figure/.test(inline)) return inline;
      return `<p>${inline}</p>`;
    }).filter(Boolean);

    return `<div class="pdf-content">\n${blocks.join('\n')}\n</div>`;
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
