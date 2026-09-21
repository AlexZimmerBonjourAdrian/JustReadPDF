import { ViewerFormatterService } from './ViewerFormatterService';

export class RtfViewerService {
  static async readRtfFileAsHtml(file: File): Promise<{ htmlFile: File; plainText: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const plainText = this.extractTextFromRtf(content);
        const escaped = plainText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const htmlContent = escaped.split('\n\n').map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`).join('\n');
        const html = ViewerFormatterService.formatComfortableHtml(htmlContent, file.name);
        const blob = new Blob([html], { type: 'text/html' });
        const htmlFile = new File([blob], `${file.name.replace(/\.rtf$/i,'')}.html`, { type: 'text/html' });
        resolve({ htmlFile, plainText });
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo RTF'));
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
