import JSZip from 'jszip';
import { TextFormatterService } from './TextFormatterService';

export class EpubViewerService {
  static async readEpubFile(file: File): Promise<File> {
    try {
      console.log('Procesando archivo EPUB:', file.name);

      // Crear ArrayBuffer del archivo
      const arrayBuffer = await file.arrayBuffer();

      // Cargar el EPUB como ZIP
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Encontrar el archivo de contenido (.opf)
      const opfFile = this.findOpfFile(zip);
      if (!opfFile) {
        throw new Error('No se encontró archivo .opf en el EPUB');
      }

      // Leer el archivo OPF para obtener el spine (orden de páginas)
      const opfContent = await opfFile.async('string');
      const spineItems = this.parseSpine(opfContent);

      // Extraer texto de todas las páginas del spine
      let fullText = '';

      for (const item of spineItems) {
        try {
          const htmlFile = zip.file(item);
          if (htmlFile) {
            const htmlContent = await htmlFile.async('string');
            const textContent = this.extractTextFromHtml(htmlContent);
            fullText += textContent + '\n\n';
          }
        } catch (error) {
          console.warn(`Error al procesar ${item}:`, error);
        }
      }

      // Si no se encontraron items en el spine, buscar todos los archivos HTML
      if (fullText.trim().length === 0) {
        const htmlFiles = Object.keys(zip.files).filter(name => 
          name.match(/\.(html|xhtml)$/i) && !name.includes('META-INF')
        );

        for (const fileName of htmlFiles) {
          try {
            const htmlFile = zip.file(fileName);
            if (htmlFile) {
              const htmlContent = await htmlFile.async('string');
              const textContent = this.extractTextFromHtml(htmlContent);
              fullText += textContent + '\n\n';
            }
          } catch (error) {
            console.warn(`Error al procesar ${fileName}:`, error);
          }
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

  private static findOpfFile(zip: JSZip): JSZip.JSZipObject | null {
    // Buscar archivo .opf en el directorio OEBPS o raíz
    const files = Object.keys(zip.files);
    
    // Primero buscar en META-INF/container.xml para encontrar la ruta del OPF
    const containerFile = zip.file('META-INF/container.xml');
    if (containerFile) {
      const containerContent = containerFile.async('string');
      // Esta es una búsqueda simplificada
    }

    // Buscar archivos .opf directamente
    for (const fileName of files) {
      if (fileName.endsWith('.opf') && !fileName.includes('META-INF')) {
        return zip.file(fileName);
      }
    }

    // Buscar en directorio OEBPS
    for (const fileName of files) {
      if (fileName.includes('OEBPS') && fileName.endsWith('.opf')) {
        return zip.file(fileName);
      }
    }

    return null;
  }

  private static parseSpine(opfContent: string): string[] {
    // Extraer los archivos del spine del OPF
    const spineMatch = opfContent.match(/<spine[^>]*>([\s\S]*?)<\/spine>/i);
    if (!spineMatch) return [];

    const spineContent = spineMatch[1];
    const itemrefs = spineContent.match(/<itemref[^>]*idref=["']([^"']+)["'][^>]*>/gi);
    
    if (!itemrefs) return [];

    const ids = itemrefs.map(match => {
      const idMatch = match.match(/idref=["']([^"']+)["']/);
      return idMatch ? idMatch[1] : '';
    }).filter(id => id);

    // Mapear IDs a rutas de archivo usando el manifest
    const manifestMatch = opfContent.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/i);
    if (!manifestMatch) return [];

    const manifestContent = manifestMatch[1];
    const items = manifestContent.match(/<item[^>]*id=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi);
    
    if (!items) return [];

    const idToPath: Record<string, string> = {};
    for (const item of items) {
      const idMatch = item.match(/id=["']([^"']+)["']/);
      const hrefMatch = item.match(/href=["']([^"']+)["']/);
      if (idMatch && hrefMatch) {
        idToPath[idMatch[1]] = hrefMatch[1];
      }
    }

    // Devolver las rutas en orden del spine
    const paths: string[] = [];
    for (const id of ids) {
      const path = idToPath[id];
      if (path) {
        // Normalizar ruta (quitar ../ si existe)
        const normalizedPath = path.replace(/^\.\.\//, '');
        paths.push(normalizedPath);
      }
    }

    return paths;
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
