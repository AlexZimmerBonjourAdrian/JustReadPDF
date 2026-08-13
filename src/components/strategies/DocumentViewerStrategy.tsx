import { ReactElement } from 'react';
import DocumentViewer from '../DocumentViewer';
import { ViewerStrategy, ViewerProps } from './ViewerStrategy';

export class DocumentViewerStrategy implements ViewerStrategy {
  canRender(viewerType: 'document' | 'html'): boolean {
    return viewerType === 'document';
  }

  render(props: ViewerProps): ReactElement {
    return <DocumentViewer textFile={props.file} extractedText={props.extractedText} />;
  }
}
