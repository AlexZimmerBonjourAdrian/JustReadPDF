import { DocLegacyViewerService } from '../DocLegacyViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';
import { LoggerService } from '../LoggerService';

export class DocProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return DocLegacyViewerService.isValidDocFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await DocLegacyViewerService.readDocFileAsHtml(file);
    LoggerService.info('DocStrategy', `OK ${file.name} (texto ${plainText.length} chars)`);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: file.name };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await DocLegacyViewerService.readDocFileAsHtml(storedFile);
    LoggerService.info('DocStrategy', `OK stored ${storedFile.name}`);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: storedFile.name };
  }
}
