import { docxToHtml } from '@omer-go/docx-parser-converter-ts';
import { TextFormatterService } from './TextFormatterService';

export class DocxViewerService {
  // LEGACY MD - desconectado
  static async readDocxFile(file: File): Promise<File> {
    try {
      const html = await docxToHtml(file, { title: file.name });
      const plainText = this.extractTextFromHtml(html);
      const formattedText = TextFormatterService.formatTextToMarkdown(plainText);
      const textBlob = new Blob([formattedText], { type: 'text/markdown' });
      return new File([textBlob], `${file.name.replace('.docx', '')}.md`, { type: 'text/markdown' });
    } catch (error) {
      throw new Error(`Error al leer el archivo DOCX: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // HTML primario - preserva tablas/estilos para Google Translate
  static async readDocxFileAsHtml(file: File): Promise<{ htmlFile: File; plainText: string }> {
    const rawHtml = await docxToHtml(file, { title: file.name });
    const plainText = this.extractTextFromHtml(rawHtml);
    const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const bodyContent = bodyMatch && bodyMatch[1] ? bodyMatch[1] : rawHtml;
    const html = TextFormatterService.applyFormattingTemplate(bodyContent, file.name);
    const blob = new Blob([html], { type: 'text/html' });
    const htmlFile = new File([blob], `${file.name.replace(/\.docx$/i,'')}.html`, { type: 'text/html' });
    return { htmlFile, plainText };
  }

  private static extractTextFromHtml(html: string): string {
    // Extraer texto plano del HTML generado por docxToHtml
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

  static isValidDocxFile(file: File): boolean {
    // Solo aceptar archivos DOCX reales (son archivos ZIP)
    return file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
           file.name.endsWith('.docx');
  }
}
