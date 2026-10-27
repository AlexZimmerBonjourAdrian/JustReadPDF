import { RtfViewerService } from '../RtfViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';
import { LoggerService } from '../LoggerService';

export class RtfProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return RtfViewerService.isValidRtfFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await RtfViewerService.readRtfFileAsHtml(file);
    LoggerService.info('RtfStrategy', `OK ${file.name} (texto ${plainText.length} chars)`);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: file.name };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await RtfViewerService.readRtfFileAsHtml(storedFile);
    LoggerService.info('RtfStrategy', `OK stored ${storedFile.name}`);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: storedFile.name };
  }
}
