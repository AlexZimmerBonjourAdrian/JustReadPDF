// Capa de Formateo separada - única fuente de verdad para HTML cómodo
// Separa extracción (FileProcessor) de presentación (Viewer)

import { TextFormatterService } from './TextFormatterService';
import { LoggerService } from './LoggerService';
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
  // Usado por todos los ViewerServices para no duplicar CSS.
  // 1) normaliza negros/blancos del documento (heredan paleta, colores reales se preservan)
  // 2) envuelve con template de la paleta indicada (variables CSS --jr-*)
  static formatComfortableHtml(htmlBody: string, fileName: string, options: Partial<ViewerFormatOptions> = {}): string {
    const opts = { ...this.defaultOptions, ...options };
    const normalized = TextFormatterService.normalizeTextColors(htmlBody);
    let html = TextFormatterService.applyFormattingTemplate(normalized, fileName, opts.theme);
    LoggerService.debug('Formatter', `comfortable html ${fileName} (body ${htmlBody.length} -> html ${html.length} chars, theme ${opts.theme})`);
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
