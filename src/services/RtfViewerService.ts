export class RtfViewerService {
  static async readRtfFile(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const plainText = this.extractTextFromRtf(content);
        const formattedContent = this.formatTextToMarkdown(plainText);
        
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

  static formatTextToMarkdown(text: string): string {
    const lines = text.split('\n');
    const formattedLines: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detectar líneas que podrían ser títulos (cortas, solas, sin punto al final)
      if (trimmedLine.length > 0 && 
          trimmedLine.length < 80 && 
          !trimmedLine.endsWith('.') &&
          !trimmedLine.endsWith(',') &&
          !trimmedLine.endsWith(';') &&
          !trimmedLine.endsWith(':') &&
          /^[A-ZÁÉÍÓÚÑ]/.test(trimmedLine)) {
        // Es probable que sea un título
        formattedLines.push(`## ${trimmedLine}`);
      } 
      // Detectar listas (líneas que comienzan con -, *, números)
      else if (/^[\-\*\•]\s/.test(trimmedLine) || /^\d+[\.\)]\s/.test(trimmedLine)) {
        formattedLines.push(trimmedLine);
      }
      // Detectar párrafos vacíos
      else if (trimmedLine === '') {
        formattedLines.push('');
      }
      // Texto normal - mantener como párrafo
      else if (trimmedLine.length > 0) {
        formattedLines.push(trimmedLine);
      }
    }
    
    return formattedLines.join('\n\n');
  }

  static isValidRtfFile(file: File): boolean {
    return file.type === 'application/rtf' || file.name.endsWith('.rtf');
  }
}
