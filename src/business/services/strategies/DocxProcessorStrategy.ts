import { DocxViewerService } from '../DocxViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';
import { LoggerService } from '../LoggerService';

export class DocxProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return DocxViewerService.isValidDocxFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await DocxViewerService.readDocxFileAsHtml(file);
    LoggerService.info('DocxStrategy', `OK ${file.name} (texto ${plainText.length} chars)`);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: file.name };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await DocxViewerService.readDocxFileAsHtml(storedFile);
    LoggerService.info('DocxStrategy', `OK stored ${storedFile.name}`);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: storedFile.name };
  }
}
