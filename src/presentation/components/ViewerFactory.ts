import { ViewerStrategy } from './strategies/ViewerStrategy';
import { HtmlViewerStrategy } from './strategies/HtmlViewerStrategy';
import { PdfViewerStrategy } from './strategies/PdfViewerStrategy';
import { DocxViewerStrategy } from './strategies/DocxViewerStrategy';
import { EpubViewerStrategy } from './strategies/EpubViewerStrategy';
import { ViewerType, FaithfulKind } from '@/data/ViewerData';

export class ViewerFactory {
  private static strategies: ViewerStrategy[] = [
    new HtmlViewerStrategy(),
    new PdfViewerStrategy(),
    new DocxViewerStrategy(),
    new EpubViewerStrategy(),
  ];

  static getStrategy(viewerType: ViewerType): ViewerStrategy | null {
    return this.strategies.find(s => s.canRender(viewerType)) || null;
  }

  // Única fuente de verdad para decidir la vista fiel nativa a partir del archivo original.
  static resolveViewerType(file: File): FaithfulKind | null {
    const name = file.name.toLowerCase();
    if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx')) return 'docx';
    if (file.type === 'application/epub+zip' || name.endsWith('.epub')) return 'epub';
    return null;
  }
}
