import { DocxViewerService } from '../DocxViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';

export class DocxProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return DocxViewerService.isValidDocxFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const docxFile = await DocxViewerService.readDocxFile(file);
    const text = await docxFile.text();
    
    return {
      file: docxFile,
      text,
      viewer: 'document'
    };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const docxFile = await DocxViewerService.readDocxFile(storedFile);
    const text = await docxFile.text();
    
    return {
      file: docxFile,
      text,
      viewer: 'document'
    };
  }
}
