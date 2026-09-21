import { ViewerFormatterService } from './ViewerFormatterService';

export class TxtViewerService {
  static async readTxtFileAsHtml(file: File): Promise<{ htmlFile: File; plainText: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const escaped = content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
        const html = ViewerFormatterService.formatComfortableHtml(`<pre style="white-space:pre-wrap; font-family:inherit">${escaped}</pre>`, file.name);
        const blob = new Blob([html], { type: 'text/html' });
        const htmlFile = new File([blob], `${file.name.replace('.txt', '')}.html`, { type: 'text/html' });
        resolve({ htmlFile, plainText: content });
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo TXT'));
      reader.readAsText(file);
    });
  }

  static isValidTxtFile(file: File): boolean {
    return file.type === 'text/plain' || file.name.endsWith('.txt');
  }
}
