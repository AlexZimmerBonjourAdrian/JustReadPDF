import { LoggerService } from './LoggerService';

// Paletas del documento (iframe). El template usa variables CSS --jr-*;
// cambiar de paleta es reasignar variables, sin reprocesar el HTML.
export type DocPaletteName = 'dark' | 'light' | 'sepia';

export interface DocPalette {
  scheme: 'dark' | 'light';
  bg: string;
  text: string;
  heading: string;
  muted: string;
  border: string;
  codeBg: string;
  quoteBg: string;
  accent: string;
  link: string;
}

export const DOC_PALETTES: Record<DocPaletteName, DocPalette> = {
  dark: { scheme: 'dark', bg: '#1a1a1a', text: '#e5e5e5', heading: '#f5f5f5', muted: '#9CA3AF', border: '#2A2E33', codeBg: '#25282B', quoteBg: '#1F2225', accent: '#C0392B', link: '#E07856' },
  light: { scheme: 'light', bg: '#ffffff', text: '#1f1f1f', heading: '#111214', muted: '#6B6560', border: '#E6E2DB', codeBg: '#F4F3EF', quoteBg: '#FFFBF7', accent: '#C0392B', link: '#A93226' },
  sepia: { scheme: 'light', bg: '#FDF6E3', text: '#5b4636', heading: '#3d2e22', muted: '#7a6352', border: '#E3D9C2', codeBg: '#F4ECD8', quoteBg: '#F8EFDC', accent: '#8b5a2b', link: '#8b5a2b' },
};

export const DOC_PALETTE_VARS: Array<keyof Omit<DocPalette, 'scheme'>> = ['bg', 'text', 'heading', 'muted', 'border', 'codeBg', 'quoteBg', 'accent', 'link'];

export class TextFormatterService {
  /**
   * Limpia el texto OCR removiendo headers, footers y mejorando formato
   * @param text Texto OCR crudo
   * @returns Texto limpio
   */  private static escapeHtml(str: string): string {
    return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
  }

  static cleanOcrText(text: string): string {
    const lines = text.split('\n');
    const cleanedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip líneas vacías
      if (line.length === 0) {
        continue;
      }
      
      // Solo remover números de página aislados, NO headers en mayúsculas (preserva títulos como INTRODUCTION)
      const isPageNumber = /^\d+$/.test(line) && line.length < 4;
      
      if (isPageNumber) {
        LoggerService.debug('TextFormat', `removiendo número de página: "${line}"`);
        continue;
      }
      
      // Detectar fragmentos muy cortos que probablemente son ruido
      if (line.length < 3 && !/^[a-zA-Z]$/.test(line)) {
        continue;
      }
      
      cleanedLines.push(line);
    }
    
    // Unir líneas y limpiar espacios múltiples
    let result = cleanedLines.join('\n');
    result = result.replace(/\n{3,}/g, '\n\n'); // Máximo 2 saltos de línea
    result = result.replace(/[ \t]{2,}/g, ' '); // Múltiples espacios a uno
    
    return result;
  }

  /**
   * Aplica template HTML para visualización
   * @param content Contenido del documento
   * @param fileName Nombre del archivo
   * @returns HTML formateado
   */
  static applyFormattingTemplate(content: string, fileName: string, palette: DocPaletteName = 'dark'): string {
    const safeFileName = this.escapeHtml(fileName);
    const pal = DOC_PALETTES[palette] ?? DOC_PALETTES.dark;
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeFileName} - JustReadPDF</title>
  <style>
    * {
      box-sizing: border-box;
    }
    :root {
      color-scheme: ${pal.scheme};
      --jr-bg: ${pal.bg};
      --jr-text: ${pal.text};
      --jr-heading: ${pal.heading};
      --jr-muted: ${pal.muted};
      --jr-border: ${pal.border};
      --jr-code-bg: ${pal.codeBg};
      --jr-quote-bg: ${pal.quoteBg};
      --jr-accent: ${pal.accent};
      --jr-link: ${pal.link};
    }
    body {
      font-family: 'Georgia', 'Merriweather', 'Times New Roman', serif;
      font-size: clamp(16px, 0.55vw + 13.5px, 19px);
      line-height: 1.6;
      color: var(--jr-text);
      margin: 0;
      padding: clamp(24px, 4vw, 48px) clamp(20px, 4vw, 48px);
      background: var(--jr-bg);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      font-feature-settings: "onum" 1, "liga" 1, "kern" 1;
    }
    .content {
      max-width: 66ch;
      margin: 0 auto;
    }
    ::selection { background: var(--jr-accent); color: #fff; }
    h1, h2, h3, h4, p, li { scroll-margin-top: 24px; }
    h1, h2, h3, h4, h5, h6 {
      color: var(--jr-heading);
      margin-top: 1.8em;
      margin-bottom: 0.6em;
      font-weight: 700;
      line-height: 1.25;
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    }
    h1, h2, h3 {
      text-wrap: balance;
    }
    h6 {
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    h1 { 
      font-size: 1.95em; 
      border-bottom: 2px solid var(--jr-border); 
      padding-bottom: 0.35em; 
      margin-top: 0;
      letter-spacing: -0.02em;
    }
    h2 { 
      font-size: 1.35em; 
      border-bottom: 1px solid var(--jr-border); 
      padding-bottom: 0.25em; 
    }
    h3 { font-size: 1.15em; }
    h4 { font-size: 1em; }
    p { 
      margin: 0 0 0.85em 0;
      line-height: 1.6;
      text-align: start;
      text-wrap: pretty;
      hyphens: auto;
      hanging-punctuation: first;
      color: var(--jr-text);
      orphans: 3;
      widows: 3;
    }
    p + p { text-indent: 1.5em; margin-top: -0.4em; }
    h1 + p, h2 + p, h3 + p { text-indent: 0; margin-top: 0; }
    h1 + p::first-letter {
      initial-letter: 2;
      font-weight: 700;
      color: var(--jr-heading);
      padding-right: 6px;
    }
    .toc-entry {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin: 0.3em 0;
    }
    .toc-entry .toc-title { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .toc-entry .toc-dots { flex: 1 1 auto; border-bottom: 1px dotted var(--jr-border); transform: translateY(-4px); min-width: 24px; }
    .toc-entry .toc-page { flex: 0 0 auto; font-variant-numeric: tabular-nums; color: var(--jr-muted); letter-spacing: 0.04em; }
    figcaption { letter-spacing: 0.04em; }
    code {
      background: var(--jr-code-bg);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: ui-monospace, 'Cascadia Code', monospace;
      color: var(--jr-text);
      font-size: 0.85em;
      border: 1px solid var(--jr-border);
    }
    pre {
      background: var(--jr-code-bg);
      padding: 16px 20px;
      border-radius: 8px;
      overflow-x: auto;
      border: 1px solid var(--jr-border);
      margin: 1.4em 0;
      line-height: 1.6;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 3px solid var(--jr-accent);
      padding-left: 18px;
      margin: 1.4em 0;
      color: var(--jr-muted);
      font-style: italic;
      background: var(--jr-quote-bg);
      padding-top: 10px;
      padding-bottom: 10px;
      border-radius: 0 8px 8px 0;
    }
    figure { margin: 1.6em 0; }
    figcaption { font-size: 0.82em; color: var(--jr-muted); font-family: 'Inter', sans-serif; margin-top: 8px; }
    .img-placeholder {
      border: 1px dashed var(--jr-border);
      border-radius: 8px;
      padding: 14px;
      color: var(--jr-muted);
      font-size: 0.85em;
      background: var(--jr-quote-bg);
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.4em 0;
      font-size: 0.9em;
      font-family: 'Inter', sans-serif;
      display: block;
      overflow-x: auto;
    }
    th, td {
      border: 1px solid var(--jr-border);
      padding: 10px 12px;
      text-align: left;
    }
    th {
      background: var(--jr-code-bg);
      font-weight: 600;
      color: var(--jr-heading);
    }
    td {
      background: transparent;
    }
    ul, ol { 
      margin: 1em 0; 
      padding-left: 1.6em; 
    }
    li { 
      margin: 0.45em 0; 
      line-height: 1.65;
      padding-left: 0.2em;
    }
    li::marker { color: var(--jr-accent); }
    a { 
      color: var(--jr-link); 
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    a:hover { 
      color: #922B21; 
    }
    strong, b { 
      color: var(--jr-heading); 
      font-weight: 700;
    }
    em, i { 
      color: var(--jr-text); 
    }
    hr {
      border: none;
      border-top: 1px solid var(--jr-border);
      margin: 2em 0;
    }
  </style>
</head>
<body>
  <h1>${safeFileName}</h1>
  <div class="content">
    ${content}
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Normaliza colores de texto del cuerpo HTML: elimina negros/blancos
   * "típicos de documento" (heredan el color de la paleta) y PRESERVA
   * cualquier otro color explícito (rojos, azules, etc.).
   */
  static normalizeTextColors(htmlBody: string): string {
    if (!htmlBody || typeof DOMParser === 'undefined') return htmlBody;
    try {
      const doc = new DOMParser().parseFromString(`<div>${htmlBody}</div>`, 'text/html');
      const root = doc.body.firstElementChild;
      if (!root) return htmlBody;
      const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      const elements: Element[] = [root];
      let node: Node | null;
      while ((node = walker.nextNode())) elements.push(node as Element);

      for (const el of elements) {
        if (el.tagName.toLowerCase() === 'font' && el.hasAttribute('color')) {
          if (this.isDefaultTextColor(el.getAttribute('color') ?? '')) {
            el.removeAttribute('color');
          }
        }
        const style = el.getAttribute('style');
        if (!style) continue;
        const kept: string[] = [];
        let changed = false;
        for (const decl of style.split(';')) {
          const trimmed = decl.trim();
          if (!trimmed) continue;
          const colon = trimmed.indexOf(':');
          if (colon === -1) { kept.push(trimmed); continue; }
          const prop = trimmed.slice(0, colon).trim().toLowerCase();
          const value = trimmed.slice(colon + 1).trim();
          if (prop === 'color' && this.isDefaultTextColor(value)) {
            changed = true;
            continue;
          }
          kept.push(trimmed);
        }
        if (changed) {
          if (kept.length > 0) el.setAttribute('style', kept.join('; '));
          else el.removeAttribute('style');
        }
      }
      return root.innerHTML;
    } catch {
      return htmlBody;
    }
  }

  /** true si el color es negro/blanco "típico" (cerca de #000 o #fff). */
  static isDefaultTextColor(value: string): boolean {
    const rgb = this.parseColorToRgb(value);
    if (!rgb) return false;
    const [r, g, b] = rgb;
    const nearBlack = r < 48 && g < 48 && b < 48;
    const nearWhite = r > 232 && g > 232 && b > 232;
    return nearBlack || nearWhite;
  }

  private static parseColorToRgb(value: string): [number, number, number] | null {
    const v = value.trim().toLowerCase();
    if (v === 'black' || v === '#000' || v === '#000000') return [0, 0, 0];
    if (v === 'white' || v === '#fff' || v === '#ffffff') return [255, 255, 255];
    let m = v.match(/^#([0-9a-f]{6})$/);
    if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
    m = v.match(/^#([0-9a-f]{3})$/);
    if (m) return [parseInt(m[1][0] + m[1][0], 16), parseInt(m[1][1] + m[1][1], 16), parseInt(m[1][2] + m[1][2], 16)];
    m = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
    return null;
  }
}
