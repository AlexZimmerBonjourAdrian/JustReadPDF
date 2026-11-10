import { ReactElement } from 'react';
import FaithfulViewer from '../FaithfulViewer';
import { ViewerStrategy, ViewerProps } from './ViewerStrategy';
import { ViewerType } from '@/data/ViewerData';

export class DocxViewerStrategy implements ViewerStrategy {
  canRender(viewerType: ViewerType): boolean {
    return viewerType === 'docx';
  }

  render(props: ViewerProps): ReactElement {
    return <FaithfulViewer kind="docx" data={props.faithful} toolbarActions={props.toolbarActions} />;
  }
}
