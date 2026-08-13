import ePub from 'epub.js';
import { TextFormatterService } from './TextFormatterService';

export class EpubViewerService {
  static async readEpubFile(file: File): Promise<File> {
    try {
      console.log('Procesando archivo EPUB:', file.name);
      
      // Crear ArrayBuffer del archivo
      const arrayBuffer = await file.arrayBuffer();
      
      // Cargar el EPUB
      const book = ePub(arrayBuffer);
      
      // Esperar a que el libro esté listo
      await book.ready;
      
      console.log(`EPUB cargado: ${book.spine.length} secciones`);
      
      // Extraer texto de todas las secciones
      let fullText = '';
      
      for (const item of book.spine.items) {
        try {
          const section = await book.section(item.href);
          if (section) {
            const sectionText = await section.load(book.load.bind(book));
            // Extraer texto del HTML
            const textContent = this.extractTextFromHtml(sectionText);
            fullText += textContent + '\n\n';
          }
        } catch (error) {
          console.warn(`Error al procesar sección ${item.href}:`, error);
        }
      }
      
      // Aplicar formateo de texto
      const formattedText = TextFormatterService.formatTextToMarkdown(fullText);
      
      // Crear archivo markdown para mostrar con DocumentViewer
      const textBlob = new Blob([formattedText], { type: 'text/markdown' });
      const textFileObj = new File([textBlob], `${file.name.replace('.epub', '')}.md`, { type: 'text/markdown' });
      
      console.log('EPUB procesado exitosamente');
      return textFileObj;
    } catch (error) {
      console.error('Error al procesar EPUB:', error);
      throw new Error(`Error al leer el archivo EPUB: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private static extractTextFromHtml(html: string): string {
    // Crear un elemento DOM temporal para extraer texto
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Extraer texto preservando estructura básica
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

  static isValidEpubFile(file: File): boolean {
    return file.type === 'application/epub+zip' || 
           file.type === 'application/octet-stream' ||
           file.name.endsWith('.epub');
  }
}
