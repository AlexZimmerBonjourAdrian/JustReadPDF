import { TxtViewerService } from '../TxtViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';

export class TxtProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return TxtViewerService.isValidTxtFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const textFile = await TxtViewerService.readTxtFile(file);
    const text = await textFile.text();
    
    return {
      file: textFile,
      text,
      viewer: 'document'
    };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const textFile = await TxtViewerService.readTxtFile(storedFile);
    const text = await textFile.text();
    
    return {
      file: textFile,
      text,
      viewer: 'document'
    };
  }
}
