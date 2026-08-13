import { parseMsDocToHtml } from '@file-viewer/doc';
import { TextFormatterService } from './TextFormatterService';

export class DocLegacyViewerService {
  static async readDocFile(file: File): Promise<File> {
    try {
      console.log('Procesando archivo DOC (legacy):', file.name);
      
      // Crear ArrayBuffer del archivo
      const arrayBuffer = await file.arrayBuffer();
      
      // Parsear DOC a HTML usando @file-viewer/doc
      const rendered = await parseMsDocToHtml(arrayBuffer);
      
      // Aplicar template HTML con estilos CSS para visualización
      const formattedHtml = TextFormatterService.applyFormattingTemplate(rendered.html, file.name);
      
      // Crear archivo HTML para mostrar con DocumentViewer
      const htmlBlob = new Blob([formattedHtml], { type: 'text/html' });
      const htmlFileObj = new File([htmlBlob], `${file.name.replace('.doc', '')}.html`, { type: 'text/html' });
      
      console.log('DOC (legacy) procesado exitosamente');
      return htmlFileObj;
    } catch (error) {
      console.error('Error al procesar DOC (legacy):', error);
      throw new Error(`Error al leer el archivo DOC: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static isValidDocFile(file: File): boolean {
    // Validar archivos .doc legacy (Word 97-2003)
    // NOTA: .docx ya está manejado por DocxViewerService
    return file.type === 'application/msword' || 
           (file.name.endsWith('.doc') && !file.name.endsWith('.docx'));
  }
}
