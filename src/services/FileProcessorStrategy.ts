export interface ProcessedFile {
  file: File;
  text: string;
  viewer: 'document' | 'html';
  originalFileName?: string;
}

export interface FileProcessorStrategy {
  canProcess(file: File): boolean;
  process(file: File, setOcrProgress?: (progress: number) => void): Promise<ProcessedFile>;
  processStored(storedFile: File): Promise<ProcessedFile>;
}
