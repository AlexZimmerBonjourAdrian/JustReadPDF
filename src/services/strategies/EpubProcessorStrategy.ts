import { EpubViewerService } from '../EpubViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';

export class EpubProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return EpubViewerService.isValidEpubFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const epubFile = await EpubViewerService.readEpubFile(file);
    const text = await epubFile.text();
    
    return {
      file: epubFile,
      text,
      viewer: 'document'
    };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const epubFile = await EpubViewerService.readEpubFile(storedFile);
    const text = await epubFile.text();
    
    return {
      file: epubFile,
      text,
      viewer: 'document'
    };
  }
}
