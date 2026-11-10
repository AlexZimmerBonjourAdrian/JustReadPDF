import { ReactElement } from 'react';
import { ViewerDisplayData, ViewerType, FaithfulViewerData } from '@/data/ViewerData';
import type { DocPaletteName } from '@/business/services/TextFormatterService';

export interface ViewerProps {
  displayData: ViewerDisplayData;
  toolbarActions?: React.ReactNode;
  palette?: DocPaletteName;
  onPaletteChange?: (palette: DocPaletteName) => void;
  initialScrollY?: number;
  onScroll?: (y: number) => void;
  // Presente solo cuando la Factory resolvió una vista fiel (pdf/docx/epub)
  faithful?: FaithfulViewerData;
}

export interface ViewerStrategy {
  canRender(viewerType: ViewerType): boolean;
  render(props: ViewerProps): ReactElement;
}
