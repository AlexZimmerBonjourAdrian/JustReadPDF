import { docxToHtml, docxToText } from '@omer-go/docx-parser-converter-ts';
import { TextFormatterService } from './TextFormatterService';

export class DocxViewerService {
  static async readDocxFile(file: File): Promise<File> {
    try {
      console.log('Procesando archivo DOCX:', file.name);
      
      // Convertir DOCX a HTML
      const html = await docxToHtml(file, { title: file.name });
      
      // Convertir HTML a texto plano para formateo
      const text = await docxToText(file);
      
      // Aplicar formateo de texto
      const formattedText = TextFormatterService.formatTextToMarkdown(text);
      
      // Crear archivo markdown para mostrar con DocumentViewer
      const textBlob = new Blob([formattedText], { type: 'text/markdown' });
      const textFileObj = new File([textBlob], `${file.name.replace('.docx', '')}.md`, { type: 'text/markdown' });
      
      console.log('DOCX procesado exitosamente');
      return textFileObj;
    } catch (error) {
      console.error('Error al procesar DOCX:', error);
      throw new Error(`Error al leer el archivo DOCX: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  static isValidDocxFile(file: File): boolean {
    return file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
           file.type === 'application/msword' ||
           file.name.endsWith('.docx') ||
           file.name.endsWith('.doc');
  }
}
