// Servicio de interacción View - lógica de negocio fuera del View
// View solo llama a estos métodos, no los implementa

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
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const lines = extractedText?.split('\n') || [];
    const targetText = lines[lineNumber];
    if (!targetText) return;

    const textNodes: Text[] = [];
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.includes(targetText.trim())) {
        textNodes.push(node as Text);
      }
    }
    if (textNodes.length === 0) return;
    const element = textNodes[0].parentElement;
    if (!element) return;
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const originalBg = element.style.backgroundColor;
    element.style.backgroundColor = '#FEF3C7'; // amber-100 editorial, no gray
    setTimeout(() => { element.style.backgroundColor = originalBg; }, 1800);
  }

  /**
   * Para DocumentViewer legacy - placeholder sin DOM
   */
  static scrollToLineInDocument(lineNumber: number): void {
    console.log('Navigating to line:', lineNumber);
  }

  static async loadHtmlFileContent(file: File): Promise<string> {
    return file.text();
  }
}
