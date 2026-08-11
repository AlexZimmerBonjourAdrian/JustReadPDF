import { convert } from '@pdf2md/core';

export class PdfTextExtractor {
  /**
   * Extrae texto de un archivo PDF y lo retorna como string plano
   * @param file Archivo PDF a procesar
   * @returns Texto extraído del PDF
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
