export class RtfViewerService {
  static async readRtfFile(file: File): Promise<File> {
    // RTF files can be displayed directly by DocViewer
    // This service validates and returns the file for the viewer
    return file;
  }

  static isValidRtfFile(file: File): boolean {
    return file.type === 'application/rtf' || file.name.endsWith('.rtf');
  }
}
