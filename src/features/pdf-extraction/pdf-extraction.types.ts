export interface ExtractionResult {
  text: string;
  method: 'react-pdf' | 'ocr' | 'pdf2md';
  success: boolean;
}

export interface ExtractionOptions {
  useOCR: boolean;
  ocrLanguage: string;
  minTextLength: number;
}
