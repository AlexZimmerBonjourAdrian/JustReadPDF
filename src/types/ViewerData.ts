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

export type ViewerType = 'html';

export interface HtmlViewerViewProps {
  readonly displayData: ViewerDisplayData;
  readonly onSearchNavigate: (lineNumber: number) => void;
}

export interface ViewerToolbarViewProps {
  readonly fileName: string;
  readonly onSearchNavigate: (lineNumber: number) => void;
  readonly plainText: string;
}

export interface ViewerFactoryContext {
  readonly viewerType: ViewerType;
  readonly mimeType: string;
  readonly structure?: DocumentStructureMeta;
  readonly readingOptions?: ViewerReadingOptions;
}
