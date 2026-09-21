import JSZip from 'jszip';
import { TextFormatterService } from './TextFormatterService';

export class EpubViewerService {
  // LEGACY MD - desconectado
  static async readEpubFile(file: File): Promise<File> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const opfFile = this.findOpfFile(zip);
      if (!opfFile) throw new Error('No se encontró archivo .opf en el EPUB');
      const opfContent = await opfFile.async('string');
      const spineItems = this.parseSpine(opfContent);
      let fullText = '';
      for (const item of spineItems) {
        try { const f = zip.file(item); if (f) fullText += this.extractTextFromHtml(await f.async('string')) + '\n\n'; } catch {}
      }
      if (!fullText.trim()) {
        for (const n of Object.keys(zip.files).filter(n=>n.match(/\.(html|xhtml)$/i) && !n.includes('META-INF'))) {
          try { const f = zip.file(n); if (f) fullText += this.extractTextFromHtml(await f.async('string')) + '\n\n'; } catch {}
        }
      }
      const formattedText = TextFormatterService.formatTextToMarkdown(fullText);
      return new File([new Blob([formattedText], { type: 'text/markdown' })], `${file.name.replace('.epub', '')}.md`, { type: 'text/markdown' });
    } catch (error) {
      throw new Error(`Error al leer el archivo EPUB: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // HTML primario - preserva HTML original para Google Translate
  static async readEpubFileAsHtml(file: File): Promise<{ htmlFile: File; plainText: string }> {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const opfFile = this.findOpfFile(zip);
    if (!opfFile) throw new Error('No se encontró archivo .opf en el EPUB');
    const opfContent = await opfFile.async('string');
    const opfDir = opfFile.name.includes('/') ? opfFile.name.substring(0, opfFile.name.lastIndexOf('/')+1) : '';
    const spineItems = this.parseSpine(opfContent);
    let combinedHtml = '';
    let fullText = '';
    const resolvePath = (p: string) => p.startsWith('../') ? p.replace(/^\.\.\//,'') : opfDir + p;
    for (const item of spineItems) {
      const path = resolvePath(item);
      const f = zip.file(path) || zip.file(item);
      if (f) { const c = await f.async('string'); combinedHtml += c + '\n'; fullText += this.extractTextFromHtml(c) + '\n\n'; }
    }
    if (!combinedHtml.trim()) {
      for (const n of Object.keys(zip.files).filter(n=>n.match(/\.(html|xhtml)$/i) && !n.includes('META-INF'))) {
        const f = zip.file(n); if (f) { const c = await f.async('string'); combinedHtml += c + '\n'; fullText += this.extractTextFromHtml(c) + '\n\n'; }
      }
    }
    const html = TextFormatterService.applyFormattingTemplate(combinedHtml, file.name);
    const htmlFile = new File([new Blob([html], { type: 'text/html' })], `${file.name.replace(/\.epub$/i,'')}.html`, { type: 'text/html' });
    return { htmlFile, plainText: fullText.trim() };
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
