import { ViewerFormatterService } from './ViewerFormatterService';

export class RtfViewerService {
  static async readRtfFileAsHtml(file: File): Promise<{ htmlFile: File; plainText: string }> {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    const headerSample = new TextDecoder('latin1').decode(bytes.slice(0, Math.min(bytes.length, 8192)));
    const cpMatch = headerSample.match(/\\ansicpg(\d+)/);
    let codepage = cpMatch ? Number(cpMatch[1]) : 1252;
    if (!cpMatch) {
      if (/\\mac\b/.test(headerSample)) codepage = 10000;
      else if (/\\pc\b/.test(headerSample)) codepage = 437;
    }

    let rtfText: string;
    try {
      rtfText = new TextDecoder(this.codepageToEncoding(codepage)).decode(bytes);
    } catch {
      rtfText = new TextDecoder('windows-1252').decode(bytes);
    }

    const plainText = this.extractTextFromRtf(rtfText);

    const escaped = plainText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const htmlContent = escaped
      .split(/\n\n+/)
      .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .filter((p) => p !== '<p></p>')
      .join('\n');

    const html = ViewerFormatterService.formatComfortableHtml(htmlContent, file.name);
    const blob = new Blob([html], { type: 'text/html' });
    const htmlFile = new File([blob], `${file.name.replace(/\.rtf$/i, '')}.html`, { type: 'text/html' });

    return { htmlFile, plainText };
  }

  static extractTextFromRtf(rtf: string): string {
    const cpMatch = rtf.match(/\\ansicpg(\d+)/);
    let codepage = cpMatch ? Number(cpMatch[1]) : 1252;
    if (!cpMatch) {
      const sample = rtf.slice(0, 4096);
      if (/\\mac\b/.test(sample)) codepage = 10000;
      else if (/\\pc\b/.test(sample)) codepage = 437;
    }
    const decodeByte = this.createByteDecoder(codepage);

    const destinations = new Set([
      'fonttbl', 'colortbl', 'stylesheet', 'info', 'pict', 'themedata',
      'colorschememapping', 'datastore', 'latentstyles', 'listtable',
      'listoverridetable', 'generator',
    ]);

    const isDestinationGroup = (source: string, idx: number): boolean => {
      const rest = source.slice(idx, idx + 200);
      const m = rest.match(/^\{\s*\\(\*|[a-zA-Z]+)/);
      if (!m) return false;
      const word = m[1].toLowerCase();
      if (word === '*') return true;
      return destinations.has(word);
    };

    let out = '';
    let i = 0;
    const n = rtf.length;

    while (i < n) {
      const ch = rtf[i];

      if (ch === '{') {
        if (isDestinationGroup(rtf, i)) {
          let depth = 0;
          let j = i;
          while (j < n) {
            const c = rtf[j];
            if (c === '\\') {
              if (j + 1 < n && (rtf[j + 1] === '{' || rtf[j + 1] === '}' || rtf[j + 1] === '\\')) {
                j += 2;
                continue;
              }
              j++;
              while (j < n && /[a-zA-Z]/.test(rtf[j])) j++;
              if (j < n && rtf[j] === '-') j++;
              while (j < n && /\d/.test(rtf[j])) j++;
              if (j < n && rtf[j] === ' ') j++;
              continue;
            }
            if (c === '{') depth++;
            else if (c === '}') {
              depth--;
              if (depth === 0) {
                j++;
                break;
              }
            }
            j++;
          }
          i = j;
          continue;
        }
        i++;
        continue;
      }

      if (ch === '}') {
        i++;
        continue;
      }

      if (ch === '\\') {
        if (i + 1 < n) {
          const next = rtf[i + 1];

          if (next === '\\') { out += '\\'; i += 2; continue; }
          if (next === '{') { out += '{'; i += 2; continue; }
          if (next === '}') { out += '}'; i += 2; continue; }
          if (next === '~') { out += '\u00A0'; i += 2; continue; }
          if (next === '-') { i += 2; continue; }
          if (next === '_') { out += '-'; i += 2; continue; }
          if (next === '*') { i += 2; continue; }

          if (next === '\'') {
            const hex = rtf.slice(i + 2, i + 4);
            if (/^[0-9a-fA-F]{2}$/.test(hex)) {
              out += decodeByte(parseInt(hex, 16));
              i += 4;
              continue;
            }
          }

          if (next === 'u') {
            let j = i + 2;
            let sign = 1;
            if (j < n && rtf[j] === '-') {
              sign = -1;
              j++;
            }
            let numStr = '';
            while (j < n && /\d/.test(rtf[j])) {
              numStr += rtf[j];
              j++;
            }
            if (numStr) {
              let code = sign * Number(numStr);
              if (code < 0) code += 65536;
              try {
                out += String.fromCharCode(code);
              } catch {
                // ignore
              }
              if (j < n && rtf[j] !== '\\' && rtf[j] !== '{' && rtf[j] !== '}') {
                j++;
              }
              i = j;
              continue;
            }
          }

          if (/[a-zA-Z]/.test(next)) {
            let j = i + 1;
            let word = '';
            while (j < n && /[a-zA-Z]/.test(rtf[j])) {
              word += rtf[j];
              j++;
            }
            if (j < n && (rtf[j] === '-' || /\d/.test(rtf[j]))) {
              if (rtf[j] === '-') j++;
              while (j < n && /\d/.test(rtf[j])) j++;
            }
            if (j < n && rtf[j] === ' ') j++;

            const w = word.toLowerCase();
            if (w === 'par') out += '\n\n';
            else if (w === 'line') out += '\n';
            else if (w === 'tab') out += '\t';
            else if (w === 'page') out += '\n\n';

            i = j;
            continue;
          }
        }

        i++;
        continue;
      }

      if (ch === '\r' || ch === '\n') {
        // Los saltos de línea del archivo RTF son formato del fuente, no texto.
        i++;
        continue;
      }

      out += ch;
      i++;
    }

    out = out.replace(/\t/g, ' ');
    out = out.replace(/[ \t]+\n/g, '\n');
    out = out.replace(/\n[ \t]+/g, '\n');
    out = out.replace(/[ \t]{2,}/g, ' ');
    out = out.replace(/\n{3,}/g, '\n\n');

    return out.trim();
  }

  private static codepageToEncoding(codepage: number): string {
    if (codepage === 65001) return 'utf-8';
    if (codepage >= 1250 && codepage <= 1258) return `windows-${codepage}`;
    if (codepage === 932) return 'shift_jis';
    if (codepage === 936) return 'gbk';
    if (codepage === 949) return 'euc-kr';
    if (codepage === 950) return 'big5';
    if (codepage === 10000) return 'macintosh';
    if (codepage === 437) return 'ibm437';
    return 'windows-1252';
  }

  private static createByteDecoder(codepage: number): (byte: number) => string {
    const encoding = this.codepageToEncoding(codepage);
    let decoder: TextDecoder;
    try {
      decoder = new TextDecoder(encoding);
    } catch {
      decoder = new TextDecoder('windows-1252');
    }
    const bytes = new Uint8Array(256);
    for (let b = 0; b < 256; b++) bytes[b] = b;
    const decoded = decoder.decode(bytes);
    return (byte: number) => decoded.charAt(byte);
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