import { PdfTextExtractor } from '../PdfTextExtractor';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';

export class PdfProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return file.type === 'application/pdf' || file.name.endsWith('.pdf');
  }

  async process(file: File, setOcrProgress?: (progress: number) => void): Promise<ProcessedFile> {
    const text = await PdfTextExtractor.extractText(file, setOcrProgress || (() => {}));
    const textBlob = new Blob([text], { type: 'text/markdown' });
    const textFile = new File([textBlob], `${file.name.replace('.pdf', '')}.md`, { type: 'text/markdown' });
    
    return {
      file: textFile,
      text,
      viewer: 'document'
    };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    // For stored PDF, we need the extracted text from storage
    // This will be handled by the caller passing the stored text
    throw new Error('PDF stored processing requires extracted text from storage');
  }
}
