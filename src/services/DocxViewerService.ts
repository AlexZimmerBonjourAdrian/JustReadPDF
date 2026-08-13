import { docxToHtml } from '@omer-go/docx-parser-converter-ts';
import { TextFormatterService } from './TextFormatterService';

export class DocxViewerService {
  static async readDocxFile(file: File): Promise<File> {
    try {
      console.log('Procesando archivo DOCX:', file.name);
      
      // Convertir DOCX a HTML con formato preservado
      const html = await docxToHtml(file, { title: file.name });
      
      // Aplicar template HTML con estilos CSS para visualización
      const formattedHtml = TextFormatterService.applyFormattingTemplate(html, file.name);
      
      // Crear archivo HTML para mostrar con DocumentViewer
      const htmlBlob = new Blob([formattedHtml], { type: 'text/html' });
      const htmlFileObj = new File([htmlBlob], `${file.name.replace('.docx', '')}.html`, { type: 'text/html' });
      
      console.log('DOCX procesado exitosamente');
      return htmlFileObj;
    } catch (error) {
      console.error('Error al procesar DOCX:', error);
      throw new Error(`Error al leer el archivo DOCX: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static isValidDocxFile(file: File): boolean {
    // Solo aceptar archivos DOCX reales (son archivos ZIP)
    // NO aceptar archivos .doc legacy (son binarios OLE2)
    return file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
           file.name.endsWith('.docx');
  }
}
