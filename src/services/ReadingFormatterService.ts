import { saveAs } from 'file-saver';

export type ReadingTheme = 'dark' | 'light' | 'sepia' | 'night';
export type ReadingTypography = 'serif' | 'sans-serif';

export interface ReadingOptions {
  theme: ReadingTheme;
  typography: ReadingTypography;
  fontSize: number;
  lineHeight: number;
  maxWidth: number;
}

export class ReadingFormatterService {
  private static defaultOptions: ReadingOptions = {
    theme: 'dark',
    typography: 'serif',
    fontSize: 18,
    lineHeight: 1.7,
    maxWidth: 75
  };

  private static themeColors = {
    dark: {
      background: '#1a1a1a',
      text: '#e5e5e5',
      heading: '#f5f5f5',
      link: '#60a5fa',
      code: '#374151',
      quote: '#9ca3af'
    },
    light: {
      background: '#ffffff',
      text: '#1a1a1a',
      heading: '#000000',
      link: '#2563eb',
      code: '#f3f4f6',
      quote: '#6b7280'
    },
    sepia: {
      background: '#f4ecd8',
      text: '#5b4636',
      heading: '#3d2e22',
      link: '#8b5a2b',
      code: '#e8dcc8',
      quote: '#7a6352'
    },
    night: {
      background: '#000000',
      text: '#737373',
      heading: '#a3a3a3',
      link: '#525252',
      code: '#262626',
      quote: '#525252'
    }
  };

  private static typographyFonts = {
    'serif': "'Georgia', 'Merriweather', 'Times New Roman', serif",
    'sans-serif': "'Inter', 'Arial', 'Helvetica Neue', sans-serif"
  };

  static formatForReading(
    text: string,
    fileName: string,
    options: Partial<ReadingOptions> = {}
  ): string {
    const opts = { ...this.defaultOptions, ...options };
    const colors = this.themeColors[opts.theme];
    const fontFamily = this.typographyFonts[opts.typography];

    const formattedContent = this.applyReadingFormatting(text, opts);

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName} - Modo Lectura</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: ${fontFamily};
      font-size: ${opts.fontSize}px;
      line-height: ${opts.lineHeight};
      color: ${colors.text};
      margin: 0;
      padding: 40px 50px;
      background: ${colors.background};
      min-height: 100vh;
    }
    .content {
      max-width: ${opts.maxWidth}ch;
      margin: 0 auto;
    }
    h1, h2, h3, h4, h5, h6 {
      color: ${colors.heading};
      margin-top: 2em;
      margin-bottom: 0.8em;
      font-weight: 600;
      line-height: 1.3;
    }
    h1 { 
      font-size: 2.2em; 
      border-bottom: 2px solid ${colors.quote}; 
      padding-bottom: 0.5em; 
      margin-top: 0;
    }
    h2 { 
      font-size: 1.8em; 
      border-bottom: 1px solid ${colors.quote}; 
      padding-bottom: 0.3em; 
    }
    h3 { font-size: 1.5em; }
    h4 { font-size: 1.3em; }
    h5 { font-size: 1.1em; }
    h6 { font-size: 1em; }
    p { 
      margin-bottom: 1.5em;
      text-align: justify;
      hyphens: auto;
    }
    strong, b { 
      color: ${colors.heading};
      font-weight: 600;
    }
    em, i { 
      font-style: italic;
    }
    a { 
      color: ${colors.link}; 
      text-decoration: underline;
    }
    a:hover { 
      text-decoration: none;
    }
    code {
      background: ${colors.code};
      padding: 3px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background: ${colors.code};
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.5em 0;
      border: 1px solid ${colors.quote};
    }
    pre code {
      background: none;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid ${colors.quote};
      padding-left: 20px;
      margin: 1.5em 0;
      color: ${colors.quote};
      font-style: italic;
    }
    ul, ol { 
      margin: 1.5em 0; 
      padding-left: 2em; 
    }
    li { 
      margin: 0.8em 0;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.5em 0;
    }
    th, td {
      border: 1px solid ${colors.quote};
      padding: 12px 16px;
      text-align: left;
    }
    th {
      background: ${colors.code};
      font-weight: 600;
      color: ${colors.heading};
    }
    hr {
      border: none;
      border-top: 1px solid ${colors.quote};
      margin: 2em 0;
    }
    @media print {
      body {
        background: white;
        color: black;
      }
    }
  </style>
</head>
<body>
  <h1>${fileName}</h1>
  <div class="content">
    ${formattedContent}
  </div>
</body>
</html>
    `.trim();
  }

  private static applyReadingFormatting(text: string, options: ReadingOptions): string {
    const lines = text.split('\n');
    const formattedLines: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        formattedLines.push('');
        continue;
      }
      
      // Headers mejorados para lectura
      if (trimmedLine.length > 0 && 
          trimmedLine.length < 80 && 
          !trimmedLine.endsWith('.') &&
          !trimmedLine.endsWith(',') &&
          !trimmedLine.endsWith(';') &&
          /^[A-ZÁÉÍÓÚÑ]/.test(trimmedLine)) {
        formattedLines.push(`## ${trimmedLine}`);
      }
      else if (trimmedLine.length > 0 && trimmedLine.length < 100 && 
          (trimmedLine === trimmedLine.toUpperCase() || 
           /^(CHAPTER|SECTION|PART|INTRODUCTION|CONCLUSION|REFERENCES|ABSTRACT|TABLE|FIGURE|CAPÍTULO|SECCIÓN|PARTE|INTRODUCCIÓN|CONCLUSIÓN|REFERENCIAS|RESUMEN|TABLA|FIGURA)/i.test(trimmedLine))) {
        formattedLines.push(`## ${trimmedLine}`);
      }
      else if (/^[\-\*\•]\s/.test(trimmedLine) || /^\d+[\.\)]\s/.test(trimmedLine)) {
        formattedLines.push(trimmedLine);
      }
      else if (trimmedLine.length > 0) {
        formattedLines.push(trimmedLine);
      }
    }
    
    const basicMarkdown = formattedLines.join('\n\n');
    return this.markdownToHtml(basicMarkdown);
  }

  private static markdownToHtml(markdown: string): string {
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
      // Images
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;">')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    // Envolver en párrafos
    html = `<p>${html}</p>`;
    
    // Limpiar párrafos vacíos
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, '');
    
    return html;
  }

  static async downloadAsHtml(
    text: string,
    fileName: string,
    options: Partial<ReadingOptions> = {}
  ): Promise<void> {
    const html = this.formatForReading(text, fileName, options);
    const blob = new Blob([html], { type: 'text/html' });
    const htmlFileName = fileName.replace(/\.[^/.]+$/, '') + '_reading.html';
    saveAs(blob, htmlFileName);
  }

  static async downloadAsPdf(
    text: string,
    fileName: string,
    options: Partial<ReadingOptions> = {}
  ): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('PDF generation is only available in the browser');
    }

    const html = this.formatForReading(text, fileName, options);
    
    const element = document.createElement('div');
    element.innerHTML = html;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    document.body.appendChild(element);

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const pdfOptions = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: fileName.replace(/\.[^/.]+$/, '') + '_reading.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm' as const, 
          format: 'a4' as const, 
          orientation: 'portrait' as const 
        }
      };

      await html2pdf().set(pdfOptions).from(element).save();
    } finally {
      document.body.removeChild(element);
    }
  }

  static getAvailableThemes(): { value: ReadingTheme; label: string; description: string }[] {
    return [
      { value: 'dark', label: 'Oscuro', description: 'Fondo oscuro con texto claro' },
      { value: 'light', label: 'Claro', description: 'Fondo claro con texto oscuro' },
      { value: 'sepia', label: 'Sepia', description: 'Tono cálido como Kindle' },
      { value: 'night', label: 'Noche', description: 'Alto contraste para lectura nocturna' }
    ];
  }

  static getAvailableTypography(): { value: ReadingTypography; label: string; description: string }[] {
    return [
      { value: 'serif', label: 'Serif', description: 'Georgia, Merriweather - Ideal para lectura prolongada' },
      { value: 'sans-serif', label: 'Sans-serif', description: 'Inter, Arial - Para lectura rápida' }
    ];
  }
}