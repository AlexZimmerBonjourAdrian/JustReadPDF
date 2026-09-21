// Servicio de interacción View - lógica de negocio fuera del View
// View solo llama a estos métodos, no los implementa

import { LoggerService } from './LoggerService';
import { DOC_PALETTES, DOC_PALETTE_VARS, DocPaletteName } from './TextFormatterService';

export class ViewerInteractionService {
  /**
   * Localiza texto de línea en iframe y hace scroll + highlight
   * Extraído de HtmlViewer.tsx:16 handleResultClick (negocio)
   */
  static scrollToLineInIframe(
    iframe: HTMLIFrameElement | null,
    extractedText: string | undefined,
    lineNumber: number
  ): void {
    if (!iframe) {
      LoggerService.debug('Viewer', 'scrollToLine sin iframe');
      return;
    }
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      LoggerService.warn('Viewer', 'scrollToLine sin acceso al doc del iframe');
      return;
    }

    const lines = extractedText?.split('\n') || [];
    const targetText = lines[lineNumber];
    if (!targetText) {
      LoggerService.debug('Viewer', `scrollToLine línea ${lineNumber} no encontrada`);
      return;
    }

    const textNodes: Text[] = [];
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.includes(targetText.trim())) {
        textNodes.push(node as Text);
      }
    }
    if (textNodes.length === 0) {
      LoggerService.debug('Viewer', `scrollToLine sin coincidencias para línea ${lineNumber}`);
      return;
    }
    const element = textNodes[0].parentElement;
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    LoggerService.debug('Viewer', `scrollToLine línea ${lineNumber} -> highlight`);
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = '#FEF3C7'; // amber-100 editorial, no gray
    setTimeout(() => { element.style.backgroundColor = originalBg; }, 1800);
  }

  /**
   * Para DocumentViewer legacy - placeholder sin DOM
   */
  static scrollToLineInDocument(lineNumber: number): void {
    LoggerService.debug('Viewer', `scrollToLine documento legacy, línea ${lineNumber}`);
  }

  static async loadHtmlFileContent(file: File): Promise<string> {
    const text = await file.text();
    LoggerService.debug('Viewer', `html cargado ${file.name} (${text.length} chars)`);
    return text;
  }

  /** Aplica paleta al documento del iframe reasignando variables --jr-* (sin reprocesar). */
  static applyPaletteToIframe(iframe: HTMLIFrameElement | null, palette: DocPaletteName): void {
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc?.documentElement) return;
    const pal = DOC_PALETTES[palette] ?? DOC_PALETTES.dark;
    for (const key of DOC_PALETTE_VARS) {
      doc.documentElement.style.setProperty(`--jr-${key}`, pal[key]);
    }
    doc.documentElement.style.setProperty('color-scheme', pal.scheme);
    LoggerService.debug('Viewer', `paleta aplicada: ${palette}`);
  }
}
