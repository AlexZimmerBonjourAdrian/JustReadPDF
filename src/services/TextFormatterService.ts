export class TextFormatterService {
  /**
   * Limpia el texto OCR removiendo headers, footers y mejorando formato
   * @param text Texto OCR crudo
   * @returns Texto limpio
   */
  static cleanOcrText(text: string): string {
    const lines = text.split('\n');
    const cleanedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip líneas vacías
      if (line.length === 0) {
        continue;
      }
      
      // Detectar y remover headers/footers de página
      // Patrones: líneas muy cortas con números, o títulos en mayúsculas solos
      const isPageHeader = /^(\d+\s+)?[A-Z\s]{3,30}$/.test(line) && line.length < 50;
      const isPageNumber = /^\d+$/.test(line) && line.length < 4;
      
      if (isPageHeader || isPageNumber) {
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
   * Formatea texto plano a markdown básico
   * @param text Texto plano a formatear
   * @returns Texto formateado en markdown
   */
  static formatTextToMarkdown(text: string): string {
    const lines = text.split('\n');
    const formattedLines: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detectar líneas que podrían ser títulos (cortas, solas, sin punto al final)
      if (trimmedLine.length > 0 && 
          trimmedLine.length < 80 && 
          !trimmedLine.endsWith('.') &&
          !trimmedLine.endsWith(',') &&
          !trimmedLine.endsWith(';') &&
          !trimmedLine.endsWith(':') &&
          /^[A-ZÁÉÍÓÚÑ]/.test(trimmedLine)) {
        // Es probable que sea un título
        formattedLines.push(`## ${trimmedLine}`);
      } 
      // Detectar headers específicos de capítulos/palabras clave
      else if (trimmedLine.length > 0 && trimmedLine.length < 100 && 
          (trimmedLine === trimmedLine.toUpperCase() || 
           /^(CHAPTER|SECTION|PART|INTRODUCTION|CONCLUSION|REFERENCES|ABSTRACT|TABLE|FIGURE)/i.test(trimmedLine))) {
        formattedLines.push(`## ${trimmedLine}`);
      }
      // Detectar listas (líneas que comienzan con -, *, números)
      else if (/^[\-\*\•]\s/.test(trimmedLine) || /^\d+[\.\)]\s/.test(trimmedLine)) {
        formattedLines.push(trimmedLine);
      }
      // Detectar párrafos vacíos
      else if (trimmedLine === '') {
        formattedLines.push('');
      }
      // Texto normal - mantener como párrafo
      else if (trimmedLine.length > 0) {
        formattedLines.push(trimmedLine);
      }
    }
    
    return formattedLines.join('\n\n');
  }

  /**
   * Aplica template HTML para visualización
   * @param content Contenido del documento
   * @param fileName Nombre del archivo
   * @returns HTML formateado
   */
  static applyFormattingTemplate(content: string, fileName: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName} - JustReadPDF</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #fff;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #1a1a1a;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    h1 { font-size: 2em; border-bottom: 2px solid #e0e0e0; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.2em; }
    p { margin-bottom: 1em; }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 16px;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 16px;
      margin: 1em 0;
      color: #666;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
    }
    ul, ol { margin: 1em 0; padding-left: 2em; }
    li { margin: 0.5em 0; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>${fileName}</h1>
  <div class="content">
    ${content}
  </div>
</body>
</html>
    `.trim();
  }
}
