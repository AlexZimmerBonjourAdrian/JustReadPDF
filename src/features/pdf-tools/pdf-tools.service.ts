export const PdfSearchService = {
  findTextNodes(container: HTMLElement, query: string): Text[] {
    const found: Text[] = [];
    if (!query.trim()) return found;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.toLowerCase().includes(query.toLowerCase())) {
        found.push(node as Text);
      }
    }
    return found;
  },

  highlight(nodes: Text[]): HTMLElement[] {
    const els: HTMLElement[] = [];
    nodes.forEach((tn) => {
      const parent = tn.parentElement;
      if (parent) {
        parent.style.backgroundColor = '#FEF3C7';
        els.push(parent);
      }
    });
    return els;
  },

  clearHighlights(els: HTMLElement[]) {
    els.forEach((el) => { el.style.backgroundColor = ''; });
  },

  scrollTo(el: HTMLElement | null) {
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },
};
