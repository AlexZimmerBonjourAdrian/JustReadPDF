export interface Bookmark {
  page?: number;      // Solo PDF / Compacto / Book (número de página)
  scrollY?: number;   // DOCX / EPUB / TXT (posición de scroll)
  submode?: 'compact' | 'pdf' | 'book';
}

export const DEFAULT_BOOKMARK: Bookmark = {};
