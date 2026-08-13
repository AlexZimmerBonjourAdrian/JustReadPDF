import { ViewerStrategy, ViewerProps } from './strategies/ViewerStrategy';
import { DocumentViewerStrategy } from './strategies/DocumentViewerStrategy';
import { HtmlViewerStrategy } from './strategies/HtmlViewerStrategy';

export class ViewerFactory {
  private static strategies: ViewerStrategy[] = [
    new DocumentViewerStrategy(),
    new HtmlViewerStrategy(),
  ];

  static getStrategy(viewerType: 'document' | 'html'): ViewerStrategy | null {
    const strategy = this.strategies.find(s => s.canRender(viewerType));
    return strategy || null;
  }
}
