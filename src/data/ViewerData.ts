// Capa de Data Types - View sin lógica de negocio
// Solo DTOs inmutables que fluyen Container -> Formatter -> View

export interface ViewerFileData {
  readonly file: File;
  readonly fileName: string;
  readonly mimeType: string;
  readonly originalFileName?: string;
}

export interface DocumentContentData {
  readonly plainText: string; // para SearchService
  readonly html: string; // html completo para HtmlViewer
  readonly structure?: DocumentStructureMeta; // para factory elegir formato excelente
}

export interface DocumentStructureMeta {
  readonly headingLevels: ReadonlyArray<{ level: 1|2|3; text: string }>;
  readonly hasTable: boolean;
  readonly hasToc: boolean;
  readonly pageCount?: number;
}

export interface ViewerDisplayData {
  readonly fileData: ViewerFileData;
  readonly content: DocumentContentData;
  readonly readingOptions?: ViewerReadingOptions;
}

export interface ViewerReadingOptions {
  readonly theme: 'light' | 'sepia' | 'dark';
  readonly typography: 'serif' | 'sans-serif';
  readonly fontSize: number;
  readonly maxWidthCh: number;
}

export interface SearchHighlightData {
  readonly query: string;
  readonly caseSensitive: boolean;
  readonly results: ReadonlyArray<{ line: number; text: string; index: number }>;
}

export type ViewerType = 'html' | 'pdf' | 'docx' | 'epub';

// Formatos con vista "fiel" nativa (render del original, sin conversión a HTML)
export type FaithfulKind = 'pdf' | 'docx' | 'epub';

export type FaithfulSubmode = 'compact' | 'pdf' | 'book';

// Datos que consume la vista fiel. La Factory resuelve el tipo; la Strategy renderiza.
export interface FaithfulViewerData {
  readonly originalFile: File;
  readonly plainText: string;
  readonly submode: FaithfulSubmode;
  readonly onSubmodeChange: (submode: FaithfulSubmode) => void;
  readonly initialPage?: number;
  readonly onPageChange?: (page: number) => void;
  readonly bookmarkPage?: number;
  readonly bookmarkSubmode?: FaithfulSubmode;
  readonly bookmarkScrollY?: number;
  readonly onToggleBookmark?: (position: number) => void;
  readonly onGoToBookmark?: () => void;
  readonly onSearchNavigate: (lineNumber: number) => void;
}

export interface HtmlViewerViewProps {
  readonly displayData: ViewerDisplayData;
  readonly onSearchNavigate: (lineNumber: number) => void;
}

import type { DocPaletteName } from '@/business/services/TextFormatterService';

export interface ViewerToolbarViewProps {
  readonly fileName: string;
  readonly onSearchNavigate: (lineNumber: number) => void;
  readonly plainText: string;
  readonly palette?: DocPaletteName;
  readonly onPaletteChange?: (palette: DocPaletteName) => void;
}


