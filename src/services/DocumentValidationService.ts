import { LoggerService } from './LoggerService';

// Umbral mínimo de caracteres para considerar que un documento tiene texto útil.
// Por debajo: popup de "sin texto" en lugar de un viewer vacío.
export const MIN_EXTRACTED_TEXT_LENGTH = 10;

export class DocumentValidationService {
  static textLength(text: string | undefined | null): number {
    return (text ?? '').trim().length;
  }

  static hasExtractableText(text: string | undefined | null): boolean {
    const len = this.textLength(text);
    const ok = len >= MIN_EXTRACTED_TEXT_LENGTH;
    if (!ok) {
      LoggerService.warn('Validation', `sin texto extraíble (${len} chars, mínimo ${MIN_EXTRACTED_TEXT_LENGTH})`);
    }
    return ok;
  }

  static emptyDetail(text: string | undefined | null): string {
    const len = this.textLength(text);
    if (len === 0) {
      return 'No se encontró ningún texto. Puede ser un PDF escaneado sin OCR válido, un archivo de solo imágenes o un documento vacío.';
    }
    return `Solo se extrajeron ${len} caracteres (mínimo ${MIN_EXTRACTED_TEXT_LENGTH}). El documento puede ser una imagen o estar protegido.`;
  }
}
