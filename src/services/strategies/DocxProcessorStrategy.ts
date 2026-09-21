import { DocxViewerService } from '../DocxViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';

export class DocxProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return DocxViewerService.isValidDocxFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await DocxViewerService.readDocxFileAsHtml(file);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: file.name };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await DocxViewerService.readDocxFileAsHtml(storedFile);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: storedFile.name };
  }
}
