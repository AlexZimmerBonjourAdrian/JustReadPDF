import { ReactElement } from 'react';
import HtmlViewer from '../HtmlViewer';
import { ViewerStrategy, ViewerProps } from './ViewerStrategy';

export class HtmlViewerStrategy implements ViewerStrategy {
  canRender(viewerType: 'document' | 'html'): boolean {
    return viewerType === 'html';
  }

  render(props: ViewerProps): ReactElement {
    return <HtmlViewer htmlFile={props.file} extractedText={props.extractedText} originalFileName={props.originalFileName} />;
  }
}
