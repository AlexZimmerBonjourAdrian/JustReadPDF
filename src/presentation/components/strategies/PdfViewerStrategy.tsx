import { ReactElement } from 'react';
import FaithfulViewer from '../FaithfulViewer';
import { ViewerStrategy, ViewerProps } from './ViewerStrategy';
import { ViewerType } from '@/data/ViewerData';

export class PdfViewerStrategy implements ViewerStrategy {
  canRender(viewerType: ViewerType): boolean {
    return viewerType === 'pdf';
  }

  render(props: ViewerProps): ReactElement {
    return <FaithfulViewer kind="pdf" data={props.faithful} toolbarActions={props.toolbarActions} />;
  }
}
