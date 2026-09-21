import { TxtViewerService } from '../TxtViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';

export class TxtProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return TxtViewerService.isValidTxtFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await TxtViewerService.readTxtFileAsHtml(file);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: file.name };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await TxtViewerService.readTxtFileAsHtml(storedFile);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: storedFile.name };
  }
}
