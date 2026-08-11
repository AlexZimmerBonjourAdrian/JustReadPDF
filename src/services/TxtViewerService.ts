export class TxtViewerService {
  static async readTxtFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo TXT'));
      };
      
      reader.readAsText(file);
    });
  }

  static isValidTxtFile(file: File): boolean {
    return file.type === 'text/plain' || file.name.endsWith('.txt');
  }
}
