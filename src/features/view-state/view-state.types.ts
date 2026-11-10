import type { DocPaletteName } from '@/business/services/TextFormatterService';

export type ViewState = {
  schemaVersion: 1;
  viewMode: 'comfortable' | 'faithful';
  scrollY: number;
  pageNumber: number;
  palette: DocPaletteName;
  faithfulSubmode: 'compact' | 'pdf' | 'book';
};

export const DEFAULT_VIEW_STATE: ViewState = {
  schemaVersion: 1,
  viewMode: 'comfortable',
  scrollY: 0,
  pageNumber: 1,
  palette: 'dark',
  faithfulSubmode: 'compact',
};
