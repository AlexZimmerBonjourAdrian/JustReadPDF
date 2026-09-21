import { PdfTextExtractor } from '../PdfTextExtractor';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';
import { LoggerService } from '../LoggerService';

export class PdfProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return file.type === 'application/pdf' || file.name.endsWith('.pdf');
  }

  async process(file: File, setOcrProgress?: (progress: number) => void): Promise<ProcessedFile> {
    const end = LoggerService.start('PdfStrategy', `process ${file.name}`);
    const plainText = await PdfTextExtractor.extractPlainText(file);
    const htmlBody = await PdfTextExtractor.extractHtml(file);
    const body = htmlBody && htmlBody.length > 50 ? htmlBody : `<pre style="white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:13px;line-height:1.7">${plainText.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre>`;
    const { ViewerFormatterService } = await import('../ViewerFormatterService');
    const styledHtml = ViewerFormatterService.formatComfortableHtml(body, file.name);
    const blob = new Blob([styledHtml], { type: 'text/html' });
    const htmlFile = new File([blob], `${file.name.replace(/\.pdf$/i,'')}.html`, { type: 'text/html' });
    LoggerService.info('PdfStrategy', `OK ${file.name} -> html ${styledHtml.length} chars, texto ${plainText.length} chars`);
    end();
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: file.name };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    // For stored PDF, we need the extracted text from storage
    // This will be handled by the caller passing the stored text
    throw new Error('PDF stored processing requires extracted text from storage');
  }
}
