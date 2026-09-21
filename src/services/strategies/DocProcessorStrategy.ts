import { DocLegacyViewerService } from '../DocLegacyViewerService';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';

export class DocProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return DocLegacyViewerService.isValidDocFile(file);
  }

  async process(file: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await DocLegacyViewerService.readDocFileAsHtml(file);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: file.name };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    const { htmlFile, plainText } = await DocLegacyViewerService.readDocFileAsHtml(storedFile);
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: storedFile.name };
  }
}
