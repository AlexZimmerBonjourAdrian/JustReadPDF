import { ReactElement } from 'react';

export interface ViewerProps {
  file: File;
  extractedText?: string;
  originalFileName?: string;
}

export interface ViewerStrategy {
  canRender(viewerType: 'document' | 'html'): boolean;
  render(props: ViewerProps): ReactElement;
}
