import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export class PdfToImageConverterService {
  private static pdfjs: any = null;
  private static MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  private static async getPdfjs() {
    if (!this.pdfjs && typeof window !== 'undefined') {
      const { pdfjs } = await import('react-pdf');
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      this.pdfjs = pdfjs;
    }
    return this.pdfjs;
  }

  static async convertPdfToPngZip(
    file: File,
    progressCallback?: (progress: number) => void
  ): Promise<void> {
    try {
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo permitido: 50MB`);
      }

      console.log(`Iniciando conversión de PDF a PNG: ${file.name}`);

      const pdfjs = await this.getPdfjs();
      if (!pdfjs) {
        throw new Error('pdfjs no está disponible en este entorno');
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      console.log(`PDF cargado, ${pdf.numPages} páginas`);

      const zip = new JSZip();
      const folder = zip.folder('pdf_pages');
      
      if (!folder) {
        throw new Error('No se pudo crear carpeta en ZIP');
      }

      const batchSize = 5;
      
      for (let i = 1; i <= pdf.numPages; i += batchSize) {
        const endIndex = Math.min(i + batchSize - 1, pdf.numPages);
        const batchPromises = [];
        
        for (let pageNum = i; pageNum <= endIndex; pageNum++) {
          batchPromises.push(
            this.convertPageToPng(pdf, pageNum, folder, progressCallback, pdf.numPages)
          );
        }
        
        await Promise.all(batchPromises);
        
        if (progressCallback) {
          const progress = (endIndex / pdf.numPages) * 100;
          progressCallback(progress);
        }
        
        console.log(`Páginas ${i}-${endIndex}/${pdf.numPages} convertidas`);
        
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      console.log('Generando archivo ZIP...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      const zipFileName = file.name.replace('.pdf', '') + '_pages.zip';
      saveAs(zipBlob, zipFileName);
      
      console.log('ZIP generado y descargado exitosamente');
      
    } catch (error) {
      console.error('Error en PdfToImageConverterService.convertPdfToPngZip:', error);
      throw new Error(`Error al convertir PDF a PNG: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private static async convertPageToPng(
    pdf: any,
    pageNumber: number,
    folder: JSZip,
    progressCallback?: (progress: number) => void,
    totalPages?: number
  ): Promise<void> {
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo obtener contexto del canvas');
      }
      
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png');
      });
      
      const fileName = `page_${String(pageNumber).padStart(3, '0')}.png`;
      folder.file(fileName, blob);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (progressCallback && totalPages) {
        const progress = (pageNumber / totalPages) * 100;
        progressCallback(progress);
      }
      
    } catch (error) {
      console.error(`Error convirtiendo página ${pageNumber}:`, error);
      throw error;
    }
  }

  static async convertPdfToPngArray(
    file: File,
    progressCallback?: (progress: number) => void
  ): Promise<Blob[]> {
    try {
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo permitido: 50MB`);
      }

      console.log(`Iniciando conversión de PDF a array de PNG: ${file.name}`);

      const pdfjs = await this.getPdfjs();
      if (!pdfjs) {
        throw new Error('pdfjs no está disponible en este entorno');
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      console.log(`PDF cargado, ${pdf.numPages} páginas`);

      const pngBlobs: Blob[] = [];
      const batchSize = 5;
      
      for (let i = 1; i <= pdf.numPages; i += batchSize) {
        const endIndex = Math.min(i + batchSize - 1, pdf.numPages);
        const batchPromises = [];
        
        for (let pageNum = i; pageNum <= endIndex; pageNum++) {
          batchPromises.push(
            this.convertPageToPngBlob(pdf, pageNum, progressCallback, pdf.numPages)
          );
        }
        
        const batchResults = await Promise.all(batchPromises);
        pngBlobs.push(...batchResults);
        
        console.log(`Páginas ${i}-${endIndex}/${pdf.numPages} convertidas`);
        
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      console.log(`Conversión completada: ${pngBlobs.length} imágenes PNG`);
      return pngBlobs;
      
    } catch (error) {
      console.error('Error en PdfToImageConverterService.convertPdfToPngArray:', error);
      throw new Error(`Error al convertir PDF a PNG: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private static async convertPageToPngBlob(
    pdf: any,
    pageNumber: number,
    progressCallback?: (progress: number) => void,
    totalPages?: number
  ): Promise<Blob> {
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo obtener contexto del canvas');
      }
      
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png');
      });
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (progressCallback && totalPages) {
        const progress = (pageNumber / totalPages) * 100;
        progressCallback(progress);
      }
      
      return blob;
      
    } catch (error) {
      console.error(`Error convirtiendo página ${pageNumber} a blob:`, error);
      throw error;
    }
  }
}