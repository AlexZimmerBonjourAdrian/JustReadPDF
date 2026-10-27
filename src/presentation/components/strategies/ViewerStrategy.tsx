import { ReactElement } from 'react';
import { ViewerDisplayData } from '@/data/ViewerData';
import type { DocPaletteName } from '@/business/services/TextFormatterService';

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
