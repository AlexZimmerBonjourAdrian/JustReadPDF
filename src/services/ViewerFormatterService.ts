// Capa de Formateo separada - única fuente de verdad para HTML cómodo
// Separa extracción (FileProcessor) de presentación (Viewer)

import { TextFormatterService } from './TextFormatterService';
import { ReadingOptions } from './ReadingFormatterService';

export type ComfortableTheme = 'light' | 'sepia' | 'dark';
export interface ViewerFormatOptions {
  theme: ComfortableTheme;
  typography: 'serif' | 'sans-serif';
  fontSize: number;
  maxWidthCh: number;
}

export class ViewerFormatterService {
  private static defaultOptions: ViewerFormatOptions = {
    theme: 'dark',
    typography: 'serif',
    fontSize: 18,
    maxWidthCh: 66,
  };

  // Formatea htmlBody crudo (tablas/listas ya preservadas) con template editorial cómodo
  // Usado por todos los ViewerServices para no duplicar CSS
  static formatComfortableHtml(htmlBody: string, fileName: string, options: Partial<ViewerFormatOptions> = {}): string {
    const opts = { ...this.defaultOptions, ...options };
    // Reutiliza TextFormatterService que ya tiene serif 18px 66ch cómodo
    // Inyecta opciones via reemplazo ligero para no duplicar template
    let html = TextFormatterService.applyFormattingTemplate(htmlBody, fileName);
    // Template ya es dark por defecto, ajustar si piden light/sepia
    if (opts.theme === 'light') {
      html = html.replace(/background:\s*#1a1a1a/g, 'background: #ffffff').replace(/color:\s*#e5e5e5/g, 'color: #1f1f1f').replace(/#f5f5f5/g, '#111214');
    } else if (opts.theme === 'sepia') {
      html = html.replace(/background:\s*#1a1a1a/g, 'background: #FDF6E3').replace(/color:\s*#e5e5e5/g, 'color: #5b4636');
    }
    if (opts.typography === 'sans-serif') {
      html = html.replace(/'Georgia'[^;]+serif/g, "'Inter', 'Helvetica Neue', sans-serif");
    }
    if (opts.maxWidthCh !== 66) {
      html = html.replace(/max-width:\s*66ch/g, `max-width: ${opts.maxWidthCh}ch`);
    }
    return html;
  }

  // Para texto plano (TXT/RTF) -> html cómodo
  static formatPlainTextAsHtml(plainText: string, fileName: string, options: Partial<ViewerFormatOptions> = {}): string {
    const escaped = plainText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const blocks = escaped.split(/\n\n+/).map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`).join('\n');
    return this.formatComfortableHtml(blocks, fileName, options);
  }
}
