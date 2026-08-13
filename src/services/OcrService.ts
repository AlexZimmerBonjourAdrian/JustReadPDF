import Tesseract from 'tesseract.js';
import { TextFormatterService } from './TextFormatterService';

export class OcrService {
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
   * Extrae texto de un PDF usando OCR para PDFs escaneados
   * @param file Archivo PDF a procesar
   * @param progressCallback Callback opcional para reportar progreso de OCR
   * @returns Texto extraído del PDF
   */
  static async extractTextFromPDF(file: File, progressCallback?: (progress: number) => void): Promise<string> {
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
          const viewport = page.getViewport({ scale: 3.0 }); // 216 DPI para mejor precisión
          
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
          
          // Convertir a PNG para mejor precisión de OCR
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob!);
            }, 'image/png');
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
      
      // Post-procesar texto para limpiar headers/footers y mejorar formato
      const cleanedText = TextFormatterService.cleanOcrText(fullText);
      
      return cleanedText;
      
    } catch (error) {
      console.error('Error en OcrService.extractTextFromPDF:', error);
      throw new Error(`Error al extraer texto con OCR: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}
