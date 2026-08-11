import { convert } from '@pdf2md/core';

export class PdfTextExtractor {
  /**
   * Extrae texto de un archivo PDF manteniendo formato (markdown)
   * @param file Archivo PDF a procesar
   * @returns Texto markdown extraído del PDF con estructura preservada
   */
  static async extractText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await convert(arrayBuffer);
      
      if (result.status === 'failed') {
        throw new Error('La conversión del PDF falló');
      }
      
      // Asegurarse de que result.markdown sea un string
      const markdown = result.markdown;
      
      if (typeof markdown !== 'string') {
        console.error('result.markdown no es un string:', markdown);
        return '';
      }
      
      return markdown;
    } catch (error) {
      console.error('Error en PdfTextExtractor.extractText:', error);
      throw error;
    }
  }

  /**
   * Extrae texto de un PDF y lo convierte a HTML para mejor preservación de formato
   * @param file Archivo PDF a procesar
   * @returns HTML extraído del PDF con estructura y formato preservados
   */
  static async extractHtml(file: File): Promise<string> {
    const markdown = await this.extractText(file);
    
    // Convertir markdown a HTML básico manteniendo estructura
    let html = markdown
      // Headers
      .replace(/^######\s+(.*)$/gm, '<h6>$1</h6>')
      .replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>')
      .replace(/^####\s+(.*)$/gm, '<h4>$1</h4>')
      .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
      .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
      .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code inline
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      // Images (removerlas pero mantener referencia)
      .replace(/!\[(.*?)\]\((.*?)\)/g, '[Imagen: $1]')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    // Envolver en párrafos
    html = `<div class="pdf-content"><p>${html}</p></div>`;
    
    return html;
  }

  /**
   * Extrae texto de un PDF y lo convierte a texto plano (sin formato markdown)
   * @param file Archivo PDF a procesar
   * @returns Texto plano extraído del PDF
   */
  static async extractPlainText(file: File): Promise<string> {
    const markdown = await this.extractText(file);
    
    // Remover formato markdown básico
    return markdown
      .replace(/#{1,6}\s/g, '') // Headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/`(.*?)`/g, '$1') // Code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      .replace(/!\[.*?\]\(.*?\)/g, '') // Images
      .replace(/\n{3,}/g, '\n\n') // Multiple newlines
      .trim();
  }
}
