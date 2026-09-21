import { EpubViewerService } from '../EpubViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';
import { LoggerService } from '../LoggerService';

export class EpubProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return EpubViewerService.isValidEpubFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await EpubViewerService.readEpubFileAsHtml(file);
    LoggerService.info('EpubStrategy', `OK ${file.name} (texto ${plainText.length} chars)`);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: file.name };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await EpubViewerService.readEpubFileAsHtml(storedFile);
    LoggerService.info('EpubStrategy', `OK stored ${storedFile.name}`);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: storedFile.name };
  }
}
