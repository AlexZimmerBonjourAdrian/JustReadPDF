import { PdfTextExtractor } from '../PdfTextExtractor';
import { FileProcessorStrategy, ProcessedFile } from '../FileProcessorStrategy';

export class PdfProcessorStrategy implements FileProcessorStrategy {
  canProcess(file: File): boolean {
    return file.type === 'application/pdf' || file.name.endsWith('.pdf');
  }

  async process(file: File, setOcrProgress?: (progress: number) => void): Promise<ProcessedFile> {
    // HTML primario - usa extractHtml para preservar estructura (md queda legacy)
    const html = await PdfTextExtractor.extractHtml(file);
    const plainText = await PdfTextExtractor.extractPlainText(file);
    // Fallback: si html vacío, usar texto plano envuelto
    const htmlContent = html && html.length > 50 ? html : `<pre>${plainText.replace(/</g,'&lt;')}</pre>`;
    const fullHtml = htmlContent.includes('<!DOCTYPE') ? htmlContent : `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${htmlContent}</body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const htmlFile = new File([blob], `${file.name.replace(/\.pdf$/i,'')}.html`, { type: 'text/html' });
    return { file: htmlFile, text: plainText, viewer: 'html', originalFileName: file.name };
  }

  async processStored(storedFile: File): Promise<ProcessedFile> {
    // For stored PDF, we need the extracted text from storage
    // This will be handled by the caller passing the stored text
    throw new Error('PDF stored processing requires extracted text from storage');
  }
}
