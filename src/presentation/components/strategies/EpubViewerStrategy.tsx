import { ReactElement } from 'react';
import FaithfulViewer from '../FaithfulViewer';
import { ViewerStrategy, ViewerProps } from './ViewerStrategy';
import { ViewerType } from '@/data/ViewerData';

export class EpubViewerStrategy implements ViewerStrategy {
  canRender(viewerType: ViewerType): boolean {
    return viewerType === 'epub';
  }

  render(props: ViewerProps): ReactElement {
    return <FaithfulViewer kind="epub" data={props.faithful} toolbarActions={props.toolbarActions} />;
  }
}
