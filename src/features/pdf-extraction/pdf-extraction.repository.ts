import { LoggerService } from '@/business/services/LoggerService';

export const PdfExtractionRepository = {
  async extractWithReactPdf(file: File): Promise<string> {
    try {
      const { pdfjs } = await import('react-pdf');
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items.filter((item: any) => item.str && item.str.trim());
        const pageText = items.map((item: any) => item.str).join(' ');
        if (pageText.trim()) {
          fullText += pageText + '\n\n';
        }
        LoggerService.debug('PdfExtractionRepo', `página ${i}/${pdf.numPages} extraída`);
      }

      return fullText.trim();
    } catch (error) {
      LoggerService.error('PdfExtractionRepo', 'extractWithReactPdf falló:', error);
      throw error;
    }
  },

  async extractWithOCR(file: File, onProgress?: (progress: number) => void): Promise<string> {
    try {
      const { createWorker } = await import('tesseract.js');
      const { pdfjs } = await import('react-pdf');
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvas, canvasContext: context, viewport }).promise;

        const worker = await createWorker('spa');
        const { data } = await worker.recognize(canvas);
        await worker.terminate();

        if (data.text.trim()) {
          fullText += data.text + '\n\n';
        }

        if (onProgress) {
          onProgress(Math.round((i / pdf.numPages) * 100));
        }

        LoggerService.debug('PdfExtractionRepo', `OCR página ${i}/${pdf.numPages} procesada`);
      }

      return fullText.trim();
    } catch (error) {
      LoggerService.error('PdfExtractionRepo', 'extractWithOCR falló:', error);
      throw error;
    }
  },
};
