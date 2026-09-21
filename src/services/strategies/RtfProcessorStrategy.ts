import { RtfViewerService } from '../RtfViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';

export class RtfProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return RtfViewerService.isValidRtfFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await RtfViewerService.readRtfFileAsHtml(file);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: file.name };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await RtfViewerService.readRtfFileAsHtml(storedFile);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: storedFile.name };
  }
}
