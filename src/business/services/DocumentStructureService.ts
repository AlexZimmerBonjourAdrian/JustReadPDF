// Detector de estructura basado en layout - fontSize, posición, patrones
// Inspirado en pdf-header-detector / pdf_2_json_extractor (histograma + scoring) 100% local

export interface TextLine {
  text: string;
  avgFontSize: number;
  isBold: boolean;
  x: number;
  y: number;
  pageWidth: number;
}

export class DocumentStructureService {
  // Umbral auto: body = moda de fontSizes
  static detectBodyFontSize(fontSizes: number[]): number {
    const freq = new Map<number, number>();
    for (const s of fontSizes) {
      const r = Math.round(s * 10) / 10; // precisión 0.1
      freq.set(r, (freq.get(r) || 0) + 1);
    }
    let body = 10, max = 0;
    for (const [size, count] of freq) {
      if (count > max) { max = count; body = size; }
    }
    return body;
  }

  // Scoring híbrido: fontRatio + bold + posición + patrón (como pdf_heading_extractor)
  static scoreHeading(line: TextLine, bodySize: number): number {
    let score = 0;
    const ratio = line.avgFontSize / bodySize;
    if (ratio >= 1.35) score += 30;
    else if (ratio >= 1.2) score += 20;
    else if (ratio >= 1.1) score += 10;

    if (line.isBold) score += 15;

    // Centrado o indentado grande sugiere título
    const centered = line.x > line.pageWidth * 0.25 && line.x < line.pageWidth * 0.75 && line.text.length < 80;
    if (centered) score += 5;

    // Patrones numerados 1. / 1.1 / I. II.
    if (/^\s*(\d+[\.\)]|\d+\.\d+|[IVX]+\.)\s+/.test(line.text)) score += 12;
    // Palabras clave sección
    if (/^(CAPÍTULO|CAPITULO|INTRODUCCIÓN|CONCLUSIÓN|REFERENCIAS|RESUMEN|ABSTRACT|CHAPTER|SECTION|TABLE|FIGURE)/i.test(line.text.trim())) score += 10;
    // Todo mayúsculas corto
    if (line.text === line.text.toUpperCase() && line.text.length > 3 && line.text.length < 60) score += 7;
    // Longitud inapropiada penaliza
    if (line.text.length > 120) score -= 10;
    if (line.text.length < 4) score -= 5;

    return score;
  }

  static classifyHeadingLevel(line: TextLine, bodySize: number): number | null {
    const score = this.scoreHeading(line, bodySize);
    if (score < 18) return null; // no heading
    const ratio = line.avgFontSize / bodySize;
    if (ratio >= 1.4 || score >= 35) return 1;
    if (ratio >= 1.22 || score >= 25) return 2;
    return 3;
  }

  // Agrupa items pdfjs por línea (y con tolerancia 2px)
  static groupItemsByLine(items: any[], pageWidth: number): TextLine[] {
    const sorted = [...items].sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]); // y desc, x asc
    const lines: { y: number; items: any[] }[] = [];
    for (const it of sorted) {
      const y = it.transform[5];
      let line = lines.find(l => Math.abs(l.y - y) < 2);
      if (!line) { line = { y, items: [] }; lines.push(line); }
      line.items.push(it);
    }
    return lines.map(l => {
      const text = l.items.sort((a, b) => a.transform[4] - b.transform[4]).map((i: any) => i.str).join(' ').trim();
      const sizes = l.items.map((i: any) => Math.abs(i.transform[0]) || i.height || 10);
      const avgFontSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
      const isBold = l.items.some((i: any) => /bold|black|heavy/i.test(i.fontName || ''));
      const x = Math.min(...l.items.map((i: any) => i.transform[4]));
      return { text, avgFontSize, isBold, x, y: l.y, pageWidth };
    }).filter(l => l.text);
  }
}
