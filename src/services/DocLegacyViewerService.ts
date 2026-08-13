import { parseMsDocToHtml } from '@file-viewer/doc';
import { TextFormatterService } from './TextFormatterService';

export class DocLegacyViewerService {
  static async readDocFile(file: File): Promise<File> {
    try {
      console.log('Procesando archivo DOC (legacy):', file.name);
      
      // Crear ArrayBuffer del archivo
      const arrayBuffer = await file.arrayBuffer();
      
      // Parsear DOC a HTML usando @file-viewer/doc
      const rendered = await parseMsDocToHtml(arrayBuffer);
      
      // Extraer texto plano del HTML generado
      const plainText = this.extractTextFromHtml(rendered.html);
      
      // Aplicar formateo de texto a markdown (siguiendo patrón de otros servicios)
      const formattedText = TextFormatterService.formatTextToMarkdown(plainText);
      
      // Crear archivo markdown para mostrar con DocumentViewer
      const textBlob = new Blob([formattedText], { type: 'text/markdown' });
      const textFileObj = new File([textBlob], `${file.name.replace('.doc', '')}.md`, { type: 'text/markdown' });
      
      console.log('DOC (legacy) procesado exitosamente');
      return textFileObj;
    } catch (error) {
      console.error('Error al procesar DOC (legacy):', error);
      throw new Error(`Error al leer el archivo DOC: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private static extractTextFromHtml(html: string): string {
    // Extraer texto plano del HTML generado
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let content = bodyMatch && bodyMatch[1] ? bodyMatch[1] : html;
    
    // Crear un elemento DOM temporal para extraer texto
    const div = document.createElement('div');
    div.innerHTML = content;
    
    let text = '';
    const processNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();

        // Agregar saltos de línea para ciertos elementos
        if (['p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tagName)) {
          text += '\n';
        }

        // Procesar hijos recursivamente
        for (const child of Array.from(element.childNodes)) {
          processNode(child);
        }

        // Agregar saltos de línea después de ciertos elementos
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tagName)) {
          text += '\n';
        }
      }
    };

    processNode(div);

    // Limpiar espacios múltiples y saltos de línea excesivos
    return text
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  static isValidDocFile(file: File): boolean {
    // Validar archivos .doc legacy (Word 97-2003)
    // NOTA: .docx ya está manejado por DocxViewerService
    return file.type === 'application/msword' || 
           (file.name.endsWith('.doc') && !file.name.endsWith('.docx'));
  }
}
