import { FileProcessorStrategy } from './FileProcessorStrategy';
import { LoggerService } from './LoggerService';
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
    LoggerService.info('Factory', `getStrategy ${file.name} (${file.type || 'sin-type'}, ${(file.size / 1024).toFixed(1)}KB) -> ${strategy?.constructor.name ?? 'null'}`);
    return strategy || null;
  }

  static isValidFile(file: File): boolean {
    const valid = this.strategies.some(s => s.canProcess(file));
    LoggerService.debug('Factory', `isValidFile ${file.name} -> ${valid}`);
    return valid;
  }
}
