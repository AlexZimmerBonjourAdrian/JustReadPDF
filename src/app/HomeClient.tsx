'use client';

import { useState, useEffect, useRef } from 'react';
import { useViewState } from '@/features/view-state';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { StorageService } from '@/data/StorageService';
import { FileProcessorFactory, ProcessedFile } from '@/features/documents';
import { ViewerFactory } from '@/features/documents';
import { ViewerProps } from '@/presentation/components/strategies/ViewerStrategy';
import { LoggerService } from '@/business/services/LoggerService';
import { DocumentValidationService } from '@/features/documents';
import { DocPaletteName } from '@/business/services/TextFormatterService';
import EmptyDocumentModal from '@/presentation/components/EmptyDocumentModal';
import dynamic from 'next/dynamic';

const FaithfulViewer = dynamic(() => import('@/presentation/components/FaithfulViewer'), { ssr: false });
const HamburgerMenu = dynamic(() => import('@/presentation/components/HamburgerMenu'), { ssr: false });
const YouTubeTool = dynamic(() => import('@/features/youtube').then(m => m.YouTubeTool), { ssr: false });
export default function HomeClient() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [viewerFile, setViewerFile] = useState<File | null>(null);
  const [viewerType, setViewerType] = useState<'html' | null>(null);
  const [appMode, setAppMode] = useState<'document' | 'youtube'>('document');
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const { state: viewState, update: updateViewState, flush: flushViewState } = useViewState();
  const viewMode = viewState.viewMode;
  const palette = viewState.palette;
  const initialScrollY = viewState.scrollY;
  const initialPage = viewState.pageNumber;
  const faithfulSubmode = viewState.faithfulSubmode;
  const [isExtracting, setIsExtracting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ocrProgress, setOcrProgress] = useState<number>(0);

  const saveViewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [emptyDoc, setEmptyDoc] = useState<{ fileName: string; detail: string } | null>(null);

  const resetViewer = () => {
    setPdfFile(null);
    setExtractedText('');
    setViewerFile(null);
    setViewerType(null);
    setOriginalFileName('');
    setFaithfulSubmode('compact');
    updateViewState({ scrollY: 0, pageNumber: 1, viewMode: 'comfortable' });
  };



  useEffect(() => {
    loadStoredDocument();
  }, []);

  useEffect(() => {
    const flush = () => {
      flushViewState();
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, []);

  const loadStoredDocument = async () => {
    LoggerService.debug('App', 'loadStoredDocument ...');
    try {
      const stored = await StorageService.loadDocument();
      if (stored) {
        LoggerService.info('App', `stored encontrado: ${stored.file.name}`);
        setPdfFile(stored.file);
        setExtractedText(stored.extractedText);
        updateViewState({
          viewMode: stored.viewMode === 'faithful' ? 'faithful' : 'comfortable',
          scrollY: stored.scrollY ?? 0,
          pageNumber: stored.pageNumber ?? 1,
          palette: (stored.palette as DocPaletteName) ?? 'dark',
          faithfulSubmode: stored.faithfulSubmode === 'pdf' || stored.faithfulSubmode === 'book' ? stored.faithfulSubmode : 'compact',
        });
        
        const strategy = FileProcessorFactory.getStrategy(stored.file);
        if (strategy) {
          if (!DocumentValidationService.hasExtractableText(stored.extractedText)) {
            LoggerService.warn('App', `stored sin texto: ${stored.file.name}`);
            setEmptyDoc({ fileName: stored.file.name, detail: DocumentValidationService.emptyDetail(stored.extractedText) });
          } else if (stored.html) {
            // Restaurar el HTML "cómodo" exacto guardado en IndexedDB (preserva formato)
            const blob = new Blob([stored.html], { type: 'text/html' });
            const htmlFile = new File([blob], `${stored.file.name}.html`, { type: 'text/html' });
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
      LoggerService.error('App', 'loadStoredDocument falló:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    LoggerService.info('App', `upload ${file.name} (${file.type || 'sin-type'}, ${(file.size / 1024).toFixed(1)}KB)`);
    setEmptyDoc(null);

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
      LoggerService.info('App', `procesado OK: viewer=${processed.viewer}, texto ${processed.text.length} chars`);

      // Validación: sin texto extraíble -> popup, no viewer vacío
      if (!DocumentValidationService.hasExtractableText(processed.text)) {
        resetViewer();
        await StorageService.clearDocuments();
        setEmptyDoc({ fileName: file.name, detail: DocumentValidationService.emptyDetail(processed.text) });
        return;
      }

      setExtractedText(processed.text);

      // Set appropriate viewer
      setViewerFile(processed.file);
      setViewerType(processed.viewer);
      setOriginalFileName(processed.originalFileName || '');

      // Save to IndexedDB (incluye el HTML "cómodo" para preservar formato al recargar)
      const formattedHtml = await processed.file.text();
      await StorageService.saveDocument(file, processed.text, formattedHtml, { viewMode: 'comfortable', scrollY: 0, pageNumber: 1, palette, faithfulSubmode: 'compact' });
    } catch (error) {
      LoggerService.error('App', 'handleFileUpload falló:', error);
      resetViewer();
      setEmptyDoc({
        fileName: file.name,
        detail: `No se pudo procesar el archivo${error instanceof Error ? `: ${error.message}` : '.'} Puede estar dañado, protegido o ser una imagen sin texto legible.`,
      });
    } finally {
      setIsExtracting(false);
      setOcrProgress(0);
    }
  };

  const handleClearStorage = async () => {
    LoggerService.debug('App', 'clear storage');
    await StorageService.clearDocuments();
    setPdfFile(null);
    setExtractedText('');
    setViewerFile(null);
    setViewerType(null);
    setOriginalFileName('');
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col relative">

      <div className="flex items-center justify-center gap-2 py-2 border-b border-[#2A2E33] bg-[#0f0f0f] shrink-0">
        <button
          onClick={() => setAppMode('document')}
          className={`px-3 py-1.5 rounded-[8px] text-[12px] transition-colors ${appMode === 'document' ? 'bg-white text-[#0f0f0f] font-medium' : 'bg-[#25282B] text-[#9CA3AF] hover:text-white'}`}
        >
          Documentos
        </button>
        <button
          onClick={() => setAppMode('youtube')}
          className={`px-3 py-1.5 rounded-[8px] text-[12px] transition-colors ${appMode === 'youtube' ? 'bg-white text-[#0f0f0f] font-medium' : 'bg-[#25282B] text-[#9CA3AF] hover:text-white'}`}
        >
          YouTube
        </button>
      </div>

      {/* DocumentView - Prioridad máxima */}
      <div className="flex-1 flex flex-col bg-[#0f0f0f]">
        {appMode === 'youtube' ? (
          <YouTubeTool />
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <p className="text-[13px] tracking-[0.08em] uppercase text-[#6B7280]">Cargando documento…</p>
          </div>
        ) : isExtracting ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-[14px] text-[#e5e5e5] font-medium">
              {ocrProgress > 0 ? `Procesando con OCR — ${ocrProgress.toFixed(0)}%` : 'Extrayendo texto…'}
            </p>
            {ocrProgress > 0 && (
              <div className="w-[320px] h-[3px] bg-[#25282B] rounded-full overflow-hidden">
                <div className="h-full bg-[#C0392B] transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewerFile && viewerType ? (() => {
              const strategy = ViewerFactory.getStrategy(viewerType);
              if (!strategy) return null;
              const displayData = {
                fileData: { file: viewerFile, fileName: viewerFile.name, mimeType: viewerFile.type, originalFileName },
                content: { plainText: extractedText, html: extractedText }
              } as const;
              const toolbarActions = (
                <>
                  <div className="flex items-center rounded-[8px] overflow-hidden border border-[#2A2E33] shrink-0">
                    <button onClick={() => { updateViewState({ viewMode: 'comfortable' }); }} className={`px-2.5 py-[6px] text-[12px] transition-colors ${viewMode === 'comfortable' ? 'bg-white text-[#0f0f0f] font-medium' : 'bg-[#25282B] text-[#9CA3AF] hover:text-white'}`}>Cómodo</button>
                    <button onClick={() => { updateViewState({ viewMode: 'faithful' }); }} className={`px-2.5 py-[6px] text-[12px] transition-colors ${viewMode === 'faithful' ? 'bg-white text-[#0f0f0f] font-medium' : 'bg-[#25282B] text-[#9CA3AF] hover:text-white'}`}>Fiel</button>
                  </div>
                  <label className="px-3 py-[6px] bg-[#C0392B] text-white rounded-[8px] hover:bg-[#A93226] transition-colors cursor-pointer text-[12px] font-medium shrink-0">
                    <span>Cargar otro</span>
                    <input type="file" accept=".pdf,.txt,.rtf,.doc,.docx,.epub,application/pdf,text/plain,application/rtf,text/rtf,application/x-rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/epub+zip" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button onClick={handleClearStorage} className="px-3 py-[6px] bg-[#25282B] border border-[#2A2E33] text-[#9CA3AF] rounded-[8px] hover:border-[#3A3E44] hover:text-white transition-colors text-[12px] shrink-0">Limpiar</button>
                </>
              );
              if (viewMode === 'faithful' && pdfFile) {
                return (
                  <motion.div
                    key="faithful-viewer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex-1 min-h-0 flex flex-col"
                  >
                    <div className="relative flex-1 min-h-0 flex flex-col">
                      <FaithfulViewer originalFile={pdfFile} plainText={extractedText} onSearchNavigate={() => {}} toolbarActions={toolbarActions} initialPage={initialPage} onPageChange={(p: number) => updateViewState({ pageNumber: p })} submode={faithfulSubmode} onSubmodeChange={(m) => { updateViewState({ faithfulSubmode: m }); }} />
                      <HamburgerMenu
                        submode={faithfulSubmode}
                        onSubmodeChange={(m) => { updateViewState({ faithfulSubmode: m }); }}
                      />
                    </div>
                  </motion.div>
                );
              }
              const viewerProps = { displayData, toolbarActions, palette, onPaletteChange: (p: DocPaletteName) => { updateViewState({ palette: p }); }, initialScrollY, onScroll: (y: number) => updateViewState({ scrollY: y }) } as ViewerProps;
              
              return (
                <motion.div
                  key={`${viewerType}-viewer`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex-1 min-h-0 flex flex-col"
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
<p className="text-[10px] tracking-[0.12em] uppercase text-[#6B7280] mb-4">Versión 1.0.0</p>
                    <h1 className="font-serif text-[42px] md:text-[52px] font-bold tracking-[-0.03em] leading-[0.95] text-white mb-4">Lee documentos<br />largos sin perder<br /><span className="font-normal italic text-[#9CA3AF]">el formato.</span></h1>
                    <p className="text-[15px] leading-[1.7] text-[#9CA3AF] max-w-[48ch] mb-8">Sube PDF, DOCX, EPUB, TXT, RTF o DOC. Extraemos el texto con estructura preservada, listo para copiar, buscar y traducir con Google Translate.</p>
                    <div className="flex flex-wrap gap-3 text-[12px] leading-none">
                      <span className="px-3 py-2 rounded-full bg-[#1a1a1a] border border-[#2A2E33] text-[#9CA3AF]">→ Formato preservado</span>
                      <span className="px-3 py-2 rounded-full bg-[#1a1a1a] border border-[#2A2E33] text-[#9CA3AF]">→ Sin subidas</span>
                      <span className="px-3 py-2 rounded-full bg-[#1a1a1a] border border-[#2A2E33] text-[#9CA3AF]">→ Búsqueda integrada</span>
                    </div>
                  </div>
                  <div className="lg:col-span-5">
                    <div className="bg-[#1a1a1a] border border-[#2A2E33] rounded-[14px] p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[11px] tracking-[0.12em] uppercase font-semibold text-white">Cargar documento</h3>
                        <span className="text-[11px] text-[#6B7280]">PDF · DOCX · EPUB · TXT · RTF · DOC</span>
                      </div>
                      <label className="group block rounded-[12px] border border-dashed border-[#3A3E44] hover:border-[#6B7280] bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-colors cursor-pointer p-8 text-center">
                        <div className="mx-auto w-9 h-9 rounded-full bg-white text-[#0f0f0f] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 16V4"/><path d="M8 8l4-4 4 4"/><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
                        </div>
                        <span className="block text-[14px] font-medium text-white">Arrastra o haz clic para cargar</span>
                        <span className="block text-[12px] text-[#6B7280] mt-1">Máx 50MB · Procesado en tu navegador</span>
                        <input type="file" accept=".pdf,.txt,.rtf,.doc,.docx,.epub,application/pdf,text/plain,application/rtf,text/rtf,application/x-rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/epub+zip" onChange={handleFileUpload} className="hidden" />
                      </label>
                      <p className="text-[11px] leading-[1.6] text-[#6B7280] mt-4">El texto se muestra con títulos, listas y párrafos. Ideal para traducir sin perder estructura.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Sin barra inferior - el CTA ya está en welcome asimétrico */}

      {/* Footer con enlaces internos para SEO */}
      <footer className="border-t border-[#2A2E33] px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-[12px] text-[#6B7280]">
          <span>© {new Date().getFullYear()} JustReadPDF — 100% local</span>
          <nav className="flex flex-wrap gap-4">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </nav>
        </div>
      </footer>

      {/* Popup validación: documento sin texto */}
      <AnimatePresence>
        {emptyDoc && (
          <EmptyDocumentModal
            fileName={emptyDoc.fileName}
            detail={emptyDoc.detail}
            onClose={() => setEmptyDoc(null)}
            onSelectFile={(f) => { setEmptyDoc(null); processFile(f); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
