import { ViewerStrategy } from './strategies/ViewerStrategy';
import { HtmlViewerStrategy } from './strategies/HtmlViewerStrategy';
import { ViewerType } from '@/types/ViewerData';

export class ViewerFactory {
  private static strategies: ViewerStrategy[] = [new HtmlViewerStrategy()];

  static getStrategy(viewerType: 'html'): ViewerStrategy | null;
  static getStrategy(context: { viewerType: ViewerType; mimeType?: string }): ViewerStrategy | null;
  static getStrategy(arg: any): ViewerStrategy | null {
    const viewerType: ViewerType = typeof arg === 'string' ? arg : arg.viewerType;
    return this.strategies.find(s => s.canRender(viewerType)) || null;
  }
}
