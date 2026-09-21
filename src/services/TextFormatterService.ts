export class TextFormatterService {
  /**
   * Limpia el texto OCR removiendo headers, footers y mejorando formato
   * @param text Texto OCR crudo
   * @returns Texto limpio
   */
  private static escapeHtml(str: string): string {
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
        console.log(`Removiendo header/footer: "${line}"`);
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
  static applyFormattingTemplate(content: string, fileName: string): string {
    const safeFileName = this.escapeHtml(fileName);
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
    :root { color-scheme: dark; }
    body {
      font-family: 'Georgia', 'Merriweather', 'Times New Roman', serif;
      font-size: clamp(16px, 0.55vw + 13.5px, 19px);
      line-height: 1.6;
      color: #e5e5e5;
      margin: 0;
      padding: clamp(24px, 4vw, 48px) clamp(20px, 4vw, 48px);
      background: #1a1a1a;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      font-feature-settings: "onum" 1, "liga" 1, "kern" 1;
    }
    .content {
      max-width: 66ch;
      margin: 0 auto;
    }
    ::selection { background: #C0392B; color: #fff; }
    h1, h2, h3, h4, p, li { scroll-margin-top: 24px; }
    h1, h2, h3, h4, h5, h6 {
      color: #f5f5f5;
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
      border-bottom: 2px solid #2A2E33; 
      padding-bottom: 0.35em; 
      margin-top: 0;
      letter-spacing: -0.02em;
    }
    h2 { 
      font-size: 1.35em; 
      border-bottom: 1px solid #2A2E33; 
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
      color: #e5e5e5;
      orphans: 3;
      widows: 3;
    }
    p + p { text-indent: 1.5em; margin-top: -0.4em; }
    h1 + p, h2 + p, h3 + p { text-indent: 0; margin-top: 0; }
    h1 + p::first-letter {
      initial-letter: 2;
      font-weight: 700;
      color: #f5f5f5;
      padding-right: 6px;
    }
    .toc-entry {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin: 0.3em 0;
    }
    .toc-entry .toc-title { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .toc-entry .toc-dots { flex: 1 1 auto; border-bottom: 1px dotted #4b5563; transform: translateY(-4px); min-width: 24px; }
    .toc-entry .toc-page { flex: 0 0 auto; font-variant-numeric: tabular-nums; color: #9CA3AF; letter-spacing: 0.04em; }
    figcaption { letter-spacing: 0.04em; }
    code {
      background: #25282B;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: ui-monospace, 'Cascadia Code', monospace;
      color: #e5e5e5;
      font-size: 0.85em;
      border: 1px solid #2A2E33;
    }
    pre {
      background: #25282B;
      padding: 16px 20px;
      border-radius: 8px;
      overflow-x: auto;
      border: 1px solid #2A2E33;
      margin: 1.4em 0;
      line-height: 1.6;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 3px solid #C0392B;
      padding-left: 18px;
      margin: 1.4em 0;
      color: #9CA3AF;
      font-style: italic;
      background: #1F2225;
      padding-top: 10px;
      padding-bottom: 10px;
      border-radius: 0 8px 8px 0;
    }
    figure { margin: 1.6em 0; }
    figcaption { font-size: 0.82em; color: #9CA3AF; font-family: 'Inter', sans-serif; margin-top: 8px; }
    .img-placeholder {
      border: 1px dashed #4b5563;
      border-radius: 8px;
      padding: 14px;
      color: #9CA3AF;
      font-size: 0.85em;
      background: #1F2225;
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
      border: 1px solid #2A2E33;
      padding: 10px 12px;
      text-align: left;
    }
    th {
      background: #25282B;
      font-weight: 600;
      color: #f5f5f5;
    }
    td {
      background: #1a1a1a;
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
    li::marker { color: #C0392B; }
    a { 
      color: #C0392B; 
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    a:hover { 
      color: #922B21; 
    }
    strong, b { 
      color: #f5f5f5; 
      font-weight: 700;
    }
    em, i { 
      color: #e5e5e5; 
    }
    hr {
      border: none;
      border-top: 1px solid #4b5563;
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
}
