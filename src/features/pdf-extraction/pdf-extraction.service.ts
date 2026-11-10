import { PdfExtractionRepository } from './pdf-extraction.repository';
import { LoggerService } from '@/business/services/LoggerService';
import type { ExtractionResult, ExtractionOptions } from './pdf-extraction.types';

export const PdfExtractionService = {
  async extract(file: File, options?: Partial<ExtractionOptions>, onProgress?: (progress: number) => void): Promise<ExtractionResult> {
    const opts: ExtractionOptions = {
      useOCR: true,
      ocrLanguage: 'spa',
      minTextLength: 50,
      ...options,
    };

    // Intentar primero con pdf2md (ya existe en PdfTextExtractor)
    // Aquí simplificamos: intentar react-pdf primero
    try {
      LoggerService.info('PdfExtractionService', `extrayendo ${file.name} con react-pdf`);
      const text = await PdfExtractionRepository.extractWithReactPdf(file);

      if (text.trim().length >= opts.minTextLength) {
        LoggerService.info('PdfExtractionService', `react-pdf OK: ${text.length} caracteres`);
        return { text, method: 'react-pdf', success: true };
      }

      LoggerService.warn('PdfExtractionService', `react-pdf texto corto (${text.length} chars), intentando OCR`);
    } catch (error) {
      LoggerService.warn('PdfExtractionService', 'react-pdf falló, intentando OCR:', error);
    }

    // Fallback a OCR
    if (opts.useOCR) {
      try {
        LoggerService.info('PdfExtractionService', `extrayendo ${file.name} con OCR`);
        const text = await PdfExtractionRepository.extractWithOCR(file, onProgress);

        if (text.trim().length >= opts.minTextLength) {
          LoggerService.info('PdfExtractionService', `OCR OK: ${text.length} caracteres`);
          return { text, method: 'ocr', success: true };
        }

        LoggerService.warn('PdfExtractionService', `OCR texto corto (${text.length} chars)`);
        return { text, method: 'ocr', success: true }; // Devolver de todos modos
      } catch (error) {
        LoggerService.error('PdfExtractionService', 'OCR falló:', error);
        return { text: '', method: 'ocr', success: false };
      }
    }

    return { text: '', method: 'react-pdf', success: false };
  },
};
