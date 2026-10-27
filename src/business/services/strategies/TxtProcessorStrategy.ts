import { TxtViewerService } from '../TxtViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';
import { LoggerService } from '../LoggerService';

export class TxtProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return TxtViewerService.isValidTxtFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await TxtViewerService.readTxtFileAsHtml(file);
    LoggerService.info('TxtStrategy', `OK ${file.name} (texto ${plainText.length} chars)`);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: file.name };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await TxtViewerService.readTxtFileAsHtml(storedFile);
    LoggerService.info('TxtStrategy', `OK stored ${storedFile.name}`);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: storedFile.name };
  }
}
