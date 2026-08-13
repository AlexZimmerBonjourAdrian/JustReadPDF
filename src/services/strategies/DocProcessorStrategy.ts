import { DocLegacyViewerService } from '../DocLegacyViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';

export class DocProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return DocLegacyViewerService.isValidDocFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const docFile = await DocLegacyViewerService.readDocFile(file);
    const text = await docFile.text();
    
    return {
      file: docFile,
      text,
      viewer: 'document'
    };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const docFile = await DocLegacyViewerService.readDocFile(storedFile);
    const text = await docFile.text();
    
    return {
      file: docFile,
      text,
      viewer: 'document'
    };
  }
}
