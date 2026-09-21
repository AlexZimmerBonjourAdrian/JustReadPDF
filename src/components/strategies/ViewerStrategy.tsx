import { ReactElement } from 'react';
import { ViewerDisplayData } from '@/types/ViewerData';
import type { DocPaletteName } from '@/services/TextFormatterService';

export interface ViewerProps {
  displayData: ViewerDisplayData;
  toolbarActions?: React.ReactNode;
  palette?: DocPaletteName;
  onPaletteChange?: (palette: DocPaletteName) => void;
}

export interface ViewerStrategy {
  canRender(viewerType: 'html'): boolean;
  render(props: ViewerProps): ReactElement;
}
