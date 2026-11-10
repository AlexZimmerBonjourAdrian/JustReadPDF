import { ReactElement } from 'react';
import HtmlViewer from '../HtmlViewer';
import { ViewerStrategy, ViewerProps } from './ViewerStrategy';
import { ViewerType } from '@/data/ViewerData';

export class HtmlViewerStrategy implements ViewerStrategy {
  canRender(viewerType: ViewerType): boolean {
    return viewerType === 'html';
  }

  render(props: ViewerProps): ReactElement {
    return <HtmlViewer displayData={props.displayData} toolbarActions={props.toolbarActions} palette={props.palette} onPaletteChange={props.onPaletteChange} initialScrollY={props.initialScrollY} onScroll={props.onScroll} />;
  }
}
