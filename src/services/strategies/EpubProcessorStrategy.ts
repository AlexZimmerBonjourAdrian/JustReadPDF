import { EpubViewerService } from '../EpubViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';

export class EpubProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return EpubViewerService.isValidEpubFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await EpubViewerService.readEpubFileAsHtml(file);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: file.name };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await EpubViewerService.readEpubFileAsHtml(storedFile);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: storedFile.name };
  }
}
