import { ReactElement } from 'react';
import HtmlViewer from '../HtmlViewer';
import { ViewerStrategy, ViewerProps } from './ViewerStrategy';

export class HtmlViewerStrategy implements ViewerStrategy {
  canRender(viewerType: 'html'): boolean {
    return viewerType === 'html';
  }

  render(props: ViewerProps): ReactElement {
    return <HtmlViewer displayData={props.displayData} toolbarActions={props.toolbarActions} />;
  }
}
