import { convert } from '@pdf2md/core';

export class PdfTextExtractor {
  private static MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  /**
   * Extrae texto de un archivo PDF manteniendo formato (markdown)
   * @param file Archivo PDF a procesar
   * @returns Texto markdown extraído del PDF con estructura preservada
   */
  static async extractText(file: File): Promise<string> {
    try {
      // Validar tamaño del archivo
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error(`El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo permitido: 50MB`);
      }

      console.log(`Procesando PDF: ${file.name}, Tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      
      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer creado, iniciando conversión...');
      
      const result = await convert(arrayBuffer);
      console.log('Conversión completada, status:', result.status);
      
      if (result.status === 'failed') {
        throw new Error(`La conversión del PDF falló. El archivo puede tener un formato no compatible.`);
      }
      
      // Asegurarse de que result.markdown sea un string
      const markdown = result.markdown;
      
      if (typeof markdown !== 'string') {
        console.error('result.markdown no es un string:', markdown);
        throw new Error('El resultado de la conversión no es válido');
      }
      
      if (markdown.length === 0) {
        throw new Error('No se pudo extraer texto del PDF. El archivo puede estar vacío o ser una imagen escaneada.');
      }
      
      console.log(`Texto extraído exitosamente: ${markdown.length} caracteres`);
      return markdown;
    } catch (error) {
      console.error('Error en PdfTextExtractor.extractText:', error);
      
      if (error instanceof Error) {
        throw new Error(`Error al procesar PDF: ${error.message}`);
      }
      
      throw new Error('Error desconocido al procesar el PDF');
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
