import { TextFormatterService } from './TextFormatterService';

export class TxtViewerService {
  static async readTxtFile(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const formattedContent = TextFormatterService.formatTextToMarkdown(content);
        
        // Crear archivo markdown para mostrar con DocumentViewer (preserva formato)
        const textBlob = new Blob([formattedContent], { type: 'text/markdown' });
        const textFileObj = new File([textBlob], `${file.name.replace('.txt', '')}.md`, { type: 'text/markdown' });
        resolve(textFileObj);
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo TXT'));
      };
      
      reader.readAsText(file);
    });
  }

  static isValidTxtFile(file: File): boolean {
    return file.type === 'text/plain' || file.name.endsWith('.txt');
  }
}
