import { FileProcessorStrategy } from './FileProcessorStrategy';
import { PdfProcessorStrategy } from './strategies/PdfProcessorStrategy';
import { TxtProcessorStrategy } from './strategies/TxtProcessorStrategy';
import { RtfProcessorStrategy } from './strategies/RtfProcessorStrategy';
import { DocxProcessorStrategy } from './strategies/DocxProcessorStrategy';
import { DocProcessorStrategy } from './strategies/DocProcessorStrategy';
import { EpubProcessorStrategy } from './strategies/EpubProcessorStrategy';

export class FileProcessorFactory {
  private static strategies: FileProcessorStrategy[] = [
    new PdfProcessorStrategy(),
    new TxtProcessorStrategy(),
    new RtfProcessorStrategy(),
    new DocxProcessorStrategy(),
    new DocProcessorStrategy(),
    new EpubProcessorStrategy(),
  ];

  static getStrategy(file: File): FileProcessorStrategy | null {
    const strategy = this.strategies.find(s => s.canProcess(file));
    return strategy || null;
  }

  static isValidFile(file: File): boolean {
    return this.strategies.some(s => s.canProcess(file));
  }
}
