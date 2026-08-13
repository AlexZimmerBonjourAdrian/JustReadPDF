import { TextFormatterService } from './TextFormatterService';

export class RtfViewerService {
  static async readRtfFile(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const plainText = this.extractTextFromRtf(content);
        const formattedContent = TextFormatterService.formatTextToMarkdown(plainText);
        
        // Crear archivo markdown para mostrar con DocumentViewer (preserva formato)
        const textBlob = new Blob([formattedContent], { type: 'text/markdown' });
        const textFileObj = new File([textBlob], `${file.name.replace('.rtf', '')}.md`, { type: 'text/markdown' });
        resolve(textFileObj);
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo RTF'));
      };
      
      reader.readAsText(file);
    });
  }

  static extractTextFromRtf(rtf: string): string {
    // Extraer texto plano de RTF eliminando códigos de formato
    let text = rtf;
    
    // Eliminar cabeceras RTF
    text = text.replace(/\\[a-z]+\d*/g, '');
    
    // Eliminar caracteres especiales RTF
    text = text.replace(/\\[\'\~\-\_\|\\\{\}\*]/g, '');
    
    // Eliminar códigos de control
    text = text.replace(/\\[a-z]+/g, '');
    
    // Eliminar caracteres hexadecimales
    text = text.replace(/\\'[0-9a-fA-F]{2}/g, '');
    
    // Eliminar llaves de grupo
    text = text.replace(/[{}]/g, '');
    
    // Eliminar espacios múltiples
    text = text.replace(/\s+/g, ' ');
    
    // Eliminar saltos de línea excesivos
    text = text.replace(/\n\s*\n/g, '\n\n');
    
    return text.trim();
  }

  static isValidRtfFile(file: File): boolean {
    return file.type === 'application/rtf' || file.name.endsWith('.rtf');
  }
}
