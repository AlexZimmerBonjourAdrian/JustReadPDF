'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StorageService } from '@/services/StorageService';
import { FileProcessorFactory } from '@/services/FileProcessorFactory';
import { ProcessedFile } from '@/services/FileProcessorStrategy';
import { ViewerFactory } from '@/components/ViewerFactory';
import { ViewerProps } from '@/components/strategies/ViewerStrategy';
import ToolsPanel from '@/components/ToolsPanel';

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [viewerFile, setViewerFile] = useState<File | null>(null);
  const [viewerType, setViewerType] = useState<'document' | 'html' | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [isConvertingToPng, setIsConvertingToPng] = useState(false);
  const [pngConversionProgress, setPngConversionProgress] = useState<number>(0);
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);

  useEffect(() => {
    loadStoredDocument();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Secret key combination: Ctrl + Shift + P
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsToolsPanelOpen(!isToolsPanelOpen);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isToolsPanelOpen]);

  const loadStoredDocument = async () => {
    try {
      const stored = await StorageService.loadDocument();
      if (stored) {
        setPdfFile(stored.file);
        setExtractedText(stored.extractedText);
        
        const strategy = FileProcessorFactory.getStrategy(stored.file);
        if (strategy) {
          if (stored.file.type === 'application/pdf' || stored.file.name.endsWith('.pdf')) {
            // PDF HTML desde texto almacenado (legacy md desconectado -> generar html)
            const html = `<html><body><pre style="white-space:pre-wrap">${stored.extractedText.replace(/</g,'&lt;')}</pre></body></html>`;
            const blob = new Blob([html], { type: 'text/html' });
            const htmlFile = new File([blob], `${stored.file.name.replace(/\.pdf$/i,'')}.html`, { type: 'text/html' });
            setViewerFile(htmlFile);
            setViewerType('html');
            setOriginalFileName(stored.file.name);
            setExtractedText(stored.extractedText);
          } else {
            const processed = await strategy.processStored(stored.file);
            setExtractedText(processed.text);
            setViewerFile(processed.file);
            setViewerType(processed.viewer);
            setOriginalFileName(processed.originalFileName || stored.file.name);
          }
        }
      }
    } catch (error) {
      console.error('Error loading stored document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type using factory
    if (!FileProcessorFactory.isValidFile(file)) {
      alert('Por favor sube un archivo PDF, TXT, RTF, DOC, DOCX o EPUB');
      return;
    }

    setPdfFile(file);
    setExtractedText('');
    setViewerFile(null);
    setViewerType(null);
    setOriginalFileName('');
    setIsExtracting(true);

    try {
      const strategy = FileProcessorFactory.getStrategy(file);
      if (!strategy) {
        throw new Error('No strategy found for file type');
      }

      // HTML primario - toda estrategia retorna viewer:'html' (md legacy desconectado)
      const processed: ProcessedFile = await strategy.process(file);
      setExtractedText(processed.text);

      // Set appropriate viewer
      setViewerFile(processed.file);
      setViewerType(processed.viewer);
      setOriginalFileName(processed.originalFileName || '');

      // Save to IndexedDB
      await StorageService.saveDocument(file, processed.text);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error al procesar el archivo');
    } finally {
      setIsExtracting(false);
      setOcrProgress(0);
    }
  };

  const handleClearStorage = async () => {
    await StorageService.clearDocuments();
    setPdfFile(null);
    setExtractedText('');
    setViewerFile(null);
    setViewerType(null);
    setOriginalFileName('');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col relative">
      {/* Barra superior editorial cuando hay viewer */}
      <AnimatePresence>
        {(viewerFile) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="sticky top-[68px] z-40 bg-[#FAFAF8]/95 backdrop-blur-[6px] border-b border-[#E6E2DB]"
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-[44px] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="hidden sm:inline text-[10px] tracking-[0.12em] uppercase text-[#9A9590]">Documento</span>
                <span className="text-[12px] font-mono text-[#6B6560] truncate max-w-[28ch]">{viewerFile.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <label className="px-3 py-[7px] bg-[#111214] text-white rounded-[8px] hover:bg-black transition-colors cursor-pointer text-[12px] tracking-wide font-medium">
                  <span>Cargar otro</span>
                  <input type="file" accept=".pdf,.txt,.rtf,.doc,.docx,.epub" onChange={handleFileUpload} className="hidden" />
                </label>
                <ToolsPanel pdfFile={pdfFile} extractedText={extractedText} onPngConversionStart={() => setIsConvertingToPng(true)} onPngConversionEnd={() => { setIsConvertingToPng(false); setPngConversionProgress(0); }} />
                <button onClick={handleClearStorage} className="px-3 py-[7px] bg-white border border-[#E6E2DB] text-[#6B6560] rounded-[8px] hover:border-[#111214] hover:text-[#111214] transition-colors text-[12px]" title="Limpiar">Limpiar</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DocumentView - Prioridad máxima */}
      <div className="flex-1 flex flex-col bg-[#FAFAF8]">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <p className="text-[13px] tracking-[0.08em] uppercase text-[#9A9590]">Cargando documento…</p>
          </div>
        ) : isExtracting ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-[14px] text-[#111214] font-medium">
              {ocrProgress > 0 ? `Procesando con OCR — ${ocrProgress.toFixed(0)}%` : 'Extrayendo texto…'}
            </p>
            {ocrProgress > 0 && (
              <div className="w-[320px] h-[3px] bg-[#E6E2DB] rounded-full overflow-hidden">
                <div className="h-full bg-[#C0392B] transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
              </div>
            )}
          </div>
        ) : isConvertingToPng ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-[14px] text-[#111214] font-medium">Convirtiendo a PNG — {pngConversionProgress.toFixed(0)}%</p>
            <div className="w-[320px] h-[3px] bg-[#E6E2DB] rounded-full overflow-hidden">
              <div className="h-full bg-[#111214] transition-all duration-300" style={{ width: `${pngConversionProgress}%` }} />
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewerFile && viewerType ? (() => {
              const strategy = ViewerFactory.getStrategy(viewerType);
              if (!strategy) return null;
              
              const viewerProps: ViewerProps = {
                file: viewerFile,
                extractedText,
                originalFileName
              };
              
              return (
                <motion.div
                  key={`${viewerType}-viewer`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex-1"
                >
                  {strategy.render(viewerProps)}
                </motion.div>
              );
            })() : (
              <motion.div
                key="welcome-screen"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex-1 flex items-center justify-center px-6 lg:px-8 py-12"
              >
                <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                  <div className="lg:col-span-7">
                    <p className="text-[11px] tracking-[0.14em] uppercase text-[#C0392B] font-semibold mb-3">Lector privado · 100% local</p>
                    <h1 className="font-serif text-[42px] md:text-[52px] font-bold tracking-[-0.03em] leading-[0.95] text-[#111214] mb-4">Lee documentos<br />largos sin perder<br /><span className="font-normal italic">el formato.</span></h1>
                    <p className="text-[15px] leading-[1.7] text-[#6B6560] max-w-[48ch] mb-8">Sube PDF, DOCX, EPUB, TXT, RTF o DOC. Extraemos el texto con estructura preservada, listo para copiar, buscar y traducir con Google Translate.</p>
                    <div className="flex flex-wrap gap-3 text-[12px] leading-none">
                      <span className="px-3 py-2 rounded-full bg-white border border-[#E6E2DB] text-[#6B6560]">→ Formato preservado</span>
                      <span className="px-3 py-2 rounded-full bg-white border border-[#E6E2DB] text-[#6B6560]">→ Sin subidas</span>
                      <span className="px-3 py-2 rounded-full bg-white border border-[#E6E2DB] text-[#6B6560]">→ Búsqueda integrada</span>
                    </div>
                  </div>
                  <div className="lg:col-span-5">
                    <div className="bg-white border border-[#E6E2DB] rounded-[14px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[11px] tracking-[0.12em] uppercase font-semibold text-[#111214]">Cargar documento</h3>
                        <span className="text-[11px] text-[#9A9590]">PDF · DOCX · EPUB · TXT · RTF · DOC</span>
                      </div>
                      <label className="group block rounded-[12px] border border-dashed border-[#C9C5BF] hover:border-[#111214] bg-[#FAFAF8] hover:bg-white transition-colors cursor-pointer p-8 text-center">
                        <div className="mx-auto w-9 h-9 rounded-full bg-[#111214] text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 16V4"/><path d="M8 8l4-4 4 4"/><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
                        </div>
                        <span className="block text-[14px] font-medium text-[#111214]">Arrastra o haz clic para cargar</span>
                        <span className="block text-[12px] text-[#9A9590] mt-1">Máx 50MB · Procesado en tu navegador</span>
                        <input type="file" accept=".pdf,.txt,.rtf,.doc,.docx,.epub" onChange={handleFileUpload} className="hidden" />
                      </label>
                      <p className="text-[11px] leading-[1.6] text-[#9A9590] mt-4">El texto se muestra con títulos, listas y párrafos. Ideal para traducir sin perder estructura.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Sin barra inferior - el CTA ya está en welcome asimétrico */}
    </div>
  );
}
