import { ReactElement } from 'react';
import { ViewerDisplayData } from '@/types/ViewerData';

export interface ViewerProps {
  displayData: ViewerDisplayData;
  toolbarActions?: React.ReactNode;
}

export interface ViewerStrategy {
  canRender(viewerType: 'html'): boolean;
  render(props: ViewerProps): ReactElement;
}
