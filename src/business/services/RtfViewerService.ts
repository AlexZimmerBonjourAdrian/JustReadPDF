import { ViewerFormatterService } from './ViewerFormatterService';

export class RtfViewerService {
  static async readRtfFileAsHtml(file: File): Promise<{ htmlFile: File; plainText: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const plainText = this.extractTextFromRtf(content);
        const escaped = plainText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const htmlContent = escaped.split('\n\n').map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`).join('\n');
        const html = ViewerFormatterService.formatComfortableHtml(htmlContent, file.name);
        const blob = new Blob([html], { type: 'text/html' });
        const htmlFile = new File([blob], `${file.name.replace(/\.rtf$/i,'')}.html`, { type: 'text/html' });
        resolve({ htmlFile, plainText });
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo RTF'));
      reader.readAsText(file);
    });
  }

  static extractTextFromRtf(rtf: string): string {
    let text = this.removeRtfGroups(rtf, [
      '\\fonttbl',
      '\\colortbl',
      '\\stylesheet',
      '\\info',
      '\\pict',
      '\\themedata',
      '\\colorschememapping',
      '\\datastore',
      '\\latentstyles',
      '\\listtable',
      '\\listoverridetable',
      '\\generator',
      '\\*',
    ]);

    // Saltos de línea y párrafos RTF
    text = text.replace(/\\par[d]?\b[ ]?/g, '\n\n');
    text = text.replace(/\\line\b[ ]?/g, '\n');
    text = text.replace(/\\tab\b[ ]?/g, ' ');

    // Caracteres hexadecimales \'hh
    text = text.replace(/\\'[0-9a-fA-F]{2}/g, '');

    // Caracteres escapados (\{, \}, \\, \~, etc.)
    text = text.replace(/\\[^a-zA-Z0-9]/g, '');

    // Palabras de control restantes
    text = text.replace(/\\[a-zA-Z]+-?\d*[ ]?/g, '');

    // Llaves de grupo
    text = text.replace(/[{}]/g, '');

    // Limpieza de espacios y saltos
    text = text.replace(/[ \t]+\n/g, '\n');
    text = text.replace(/\n[ \t]+/g, '\n');
    text = text.replace(/[ \t]{2,}/g, ' ');
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
  }

  // Elimina grupos RTF que no contienen texto útil (fuentes, colores, imágenes, metadatos)
  private static removeRtfGroups(rtf: string, destinations: string[]): string {
    let out = '';
    let i = 0;
    while (i < rtf.length) {
      if (rtf[i] === '{') {
        const rest = rtf.slice(i, i + 120);
        const isDestination = destinations.some(d => rest.startsWith(`{${d}`));
        if (isDestination) {
          let depth = 0;
          let j = i;
          while (j < rtf.length) {
            const ch = rtf[j];
            if (ch === '\\' && j + 1 < rtf.length) { j += 2; continue; }
            if (ch === '{') depth++;
            else if (ch === '}') {
              depth--;
              if (depth === 0) { j++; break; }
            }
            j++;
          }
          i = j;
          continue;
        }
      }
      out += rtf[i];
      i++;
    }
    return out;
  }

  static isValidRtfFile(file: File): boolean {
    const name = file.name.toLowerCase();
    const type = (file.type || '').toLowerCase();
    return (
      type === 'application/rtf' ||
      type === 'text/rtf' ||
      type === 'application/x-rtf' ||
      name.endsWith('.rtf')
    );
  }
}
