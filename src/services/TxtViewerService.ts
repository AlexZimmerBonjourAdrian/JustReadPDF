export class TxtViewerService {
  static async readTxtFile(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const formattedContent = this.formatTextToMarkdown(content);
        
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

  static isValidTxtFile(file: File): boolean {
    return file.type === 'text/plain' || file.name.endsWith('.txt');
  }
}
