import { RtfViewerService } from '../RtfViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';

export class RtfProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return RtfViewerService.isValidRtfFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const rtfFile = await RtfViewerService.readRtfFile(file);
    const text = await rtfFile.text();
    
    return {
      file: rtfFile,
      text,
      viewer: 'document'
    };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const rtfFile = await RtfViewerService.readRtfFile(storedFile);
    const text = await rtfFile.text();
    
    return {
      file: rtfFile,
      text,
      viewer: 'document'
    };
  }
}
