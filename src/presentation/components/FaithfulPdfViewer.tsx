'use client';

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { LoggerService } from '@/business/services/LoggerService';
import { PdfToolsPanel } from '@/features/pdf-tools';
import type { Bookmark } from '@/features/bookmark';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
}

type FaithfulSubmode = 'compact' | 'pdf' | 'book';

interface FaithfulPdfViewerProps {
  file: File;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  submode?: FaithfulSubmode;
  onSubmodeChange?: (submode: FaithfulSubmode) => void;
  bookmarkPage?: number;
  bookmarkSubmode?: FaithfulSubmode;
  onToggleBookmark?: (page: number) => void;
  onGoToBookmark?: () => void;
}

export default function FaithfulPdfViewer({ file, initialPage = 1, onPageChange, submode = 'compact', onSubmodeChange, bookmarkPage, bookmarkSubmode, onToggleBookmark, onGoToBookmark }: FaithfulPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [baseScale, setBaseScale] = useState<number>(1.25);
  const [zoomFactor, setZoomFactor] = useState<number>(1);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isBook = submode === 'book';
  const isPdfMode = submode === 'pdf';

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    setPageNumber(initialPage && initialPage >= 1 ? initialPage : 1);
    setIsLoading(true);
    return () => URL.revokeObjectURL(url);
  }, [file, initialPage]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth || 0;
      const pageWidth = 612;
      const gap = 24;
      const next = isBook
        ? Math.max(0.35, Math.min(2.5, (w - 64) / (pageWidth * 2 + gap)))
        : Math.max(0.5, Math.min(2.5, (w - 32) / pageWidth));
      setBaseScale(next);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isBook]);

  useEffect(() => {
    onPageChange?.(pageNumber);
  }, [pageNumber, onPageChange]);

  const goPrev = () => {
    const step = isBook ? 2 : 1;
    setPageNumber(p => Math.max(1, p - step));
  };

  const goNext = () => {
    const step = isBook ? 2 : 1;
    setPageNumber(p => Math.min(numPages, p + step));
  };

  const secondPage = Math.min(pageNumber + 1, numPages);

  const isPageMarked = (p: number) => {
    if (!bookmarkPage) return false;
    if (bookmarkSubmode === 'book') {
      return bookmarkPage === p || bookmarkPage === p + 1;
    }
    return bookmarkPage === p;
  };

  const pageStyle = {
    transform: `scale(${zoomFactor})`,
    transformOrigin: 'top center',
    transition: 'transform 0.15s ease',
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#0f0f0f] relative">
      {/* Barra de controles sticky */}
      <div className="sticky top-0 z-30 flex items-center justify-center gap-2 px-4 h-[40px] bg-[#1a1a1a] border-b border-[#2A2E33] shrink-0 text-[12px]">
        {submode !== 'pdf' && (
          <>
            <button onClick={goPrev} disabled={pageNumber <= 1} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white disabled:opacity-40">←</button>
            <span className="text-[#9CA3AF] font-mono">
              {isBook ? `${pageNumber}–${secondPage}` : pageNumber} / {numPages || '…'}
            </span>
            <button onClick={goNext} disabled={pageNumber >= numPages} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white disabled:opacity-40">→</button>
            <span className="w-px h-4 bg-[#2A2E33] mx-1" />
          </>
        )}
        {bookmarkPage && onGoToBookmark && (
          <button
            onClick={onGoToBookmark}
            className="px-2 py-1 rounded-[6px] bg-[#5B21B6] text-white text-[11px] font-medium hover:bg-[#4C1D95]"
            title="Ir al marcador"
          >
            🔖 Ir al marcador
          </button>
        )}
      </div>

      {/* Panel flotante de herramientas tipo YouTube */}
      {submode === 'pdf' && (
        <>
          <button
            onClick={() => setShowPdfTools(!showPdfTools)}
            className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-[8px] bg-[#C0392B] text-white text-[12px] font-medium shadow-lg hover:bg-[#A93226] transition-all"
            aria-label="Herramientas PDF"
          >
            🛠️
          </button>
          {showPdfTools && (
            <PdfToolsPanel
              containerRef={containerRef}
              zoom={zoomFactor}
              onZoomChange={setZoomFactor}
              onFit={() => setZoomFactor(1)}
            />
          )}
        </>
      )}

      {/* Contenedor de páginas: centrado horizontalmente */}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-auto py-6 px-4 flex flex-col items-center">
        {/* Overlay de carga mientras se inicializa el PDF */}
        {isLoading && numPages === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f0f]/90 z-40 backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-[#C0392B] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#9CA3AF] text-sm">Cargando PDF…</p>
          </div>
        )}
        <div style={pageStyle} className="flex flex-col items-center gap-6 w-full min-h-full">
        {fileUrl && (
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => {
              LoggerService.info('FaithfulPDF', `${file.name}: ${numPages} páginas`);
              setNumPages(numPages);
              setIsLoading(false);
              if (initialPage && initialPage >= 1 && initialPage <= numPages) {
                setPageNumber(initialPage);
              }
            }}
            onLoadError={(err) => {
              LoggerService.error('FaithfulPDF', `load ${file.name} falló:`, err);
              setIsLoading(false);
            }}
            loading={<p className="text-[12px] text-[#6B7280]">Cargando PDF…</p>}
            error={<p className="text-[12px] text-[#C0392B]">No se pudo renderizar el PDF.</p>}
          >
            {submode === 'pdf' ? (
              <div className="flex flex-col items-center gap-6 w-full">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => {
                  const isMarked = isPageMarked(p);
                  return (
                    <div key={`page-${p}`} className="relative w-full max-w-[612px] min-h-[792px] mx-auto">
                      <div className="relative">
                        <Page
                          pageNumber={p}
                          scale={baseScale}
                          renderTextLayer
                          renderAnnotationLayer={false}
                          loading={
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f0f]/50 rounded-lg border border-dashed border-[#2A2E33]">
                              <div className="w-8 h-8 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin mb-2"></div>
                              <p className="text-[11px] text-[#6B7280]">Página {p}…</p>
                            </div>
                          }
                          className={`shadow-lg mx-auto ${isMarked ? 'border-4 border-purple-600 rounded-[4px] shadow-[0_0_20px_rgba(168,85,247,0.5)]' : ''}`}
                        />
                      </div>
                      {onToggleBookmark && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(p);
                          }}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isMarked ? 'bg-purple-600 text-white' : 'bg-[#1a1a1a]/80 border border-[#2A2E33] text-[#9CA3AF]'}`}
                          title={isMarked ? 'Quitar marcador' : 'Marcar página'}
                        >
                          {isMarked ? '✔' : '🔖'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : isBook ? (
              <div className={`flex gap-6 ${isBook ? 'min-w-max mx-auto' : ''} justify-center relative`}>
                <div className="relative min-h-[792px] mx-auto">
                  <Page
                    key={`left-${pageNumber}`}
                    pageNumber={pageNumber}
                    scale={baseScale}
                    renderTextLayer
                    renderAnnotationLayer={false}
                    loading={
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f0f]/50 rounded-lg border border-dashed border-[#2A2E33]">
                        <div className="w-8 h-8 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-[11px] text-[#6B7280]">Página…</p>
                      </div>
                    }
                    className={`shadow-lg mx-auto ${isPageMarked(pageNumber) ? 'border-4 border-purple-600 rounded-[4px] shadow-[0_0_20px_rgba(168,85,247,0.5)]' : ''}`}
                  />
                  {onToggleBookmark && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(pageNumber);
                      }}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isPageMarked(pageNumber) ? 'bg-purple-600 text-white' : 'bg-[#1a1a1a]/80 border border-[#2A2E33] text-[#9CA3AF]'}`}
                      title={isPageMarked(pageNumber) ? 'Quitar marcador' : 'Marcar página'}
                    >
                      {isPageMarked(pageNumber) ? '✔' : '🔖'}
                    </button>
                  )}
                </div>
                {secondPage > pageNumber && (
                  <div className="relative min-h-[792px] mx-auto">
                    <Page
                      key={`right-${secondPage}`}
                      pageNumber={secondPage}
                      scale={baseScale}
                      renderTextLayer
                      renderAnnotationLayer={false}
                      loading={
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f0f]/50 rounded-lg border border-dashed border-[#2A2E33]">
                          <div className="w-8 h-8 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin mb-2"></div>
                          <p className="text-[11px] text-[#6B7280]">Página…</p>
                        </div>
                      }
                      className={`shadow-lg mx-auto ${isPageMarked(secondPage) ? 'border-4 border-purple-600 rounded-[4px] shadow-[0_0_20px_rgba(168,85,247,0.5)]' : ''}`}
                    />
                    {onToggleBookmark && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBookmark(secondPage);
                        }}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isPageMarked(secondPage) ? 'bg-purple-600 text-white' : 'bg-[#1a1a1a]/80 border border-[#2A2E33] text-[#9CA3AF]'}`}
                        title={isPageMarked(secondPage) ? 'Quitar marcador' : 'Marcar página'}
                      >
                        {isPageMarked(secondPage) ? '✔' : '🔖'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-center relative">
                <div className="relative min-h-[792px] mx-auto">
                  <Page
                    pageNumber={pageNumber}
                    scale={baseScale}
                    renderTextLayer
                    renderAnnotationLayer={false}
                    loading={
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f0f]/50 rounded-lg border border-dashed border-[#2A2E33]">
                        <div className="w-8 h-8 border-2 border-[#C0392B] border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-[11px] text-[#6B7280]">Página…</p>
                      </div>
                    }
                    className={`shadow-lg mx-auto ${isPageMarked(pageNumber) ? 'border-4 border-purple-600 rounded-[4px] shadow-[0_0_20px_rgba(168,85,247,0.5)]' : ''}`}
                  />
                  {onToggleBookmark && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(pageNumber);
                      }}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 z-50 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isPageMarked(pageNumber) ? 'bg-purple-600 text-white' : 'bg-[#1a1a1a]/80 border border-[#2A2E33] text-[#9CA3AF]'}`}
                      title={isPageMarked(pageNumber) ? 'Quitar marcador' : 'Marcar página'}
                    >
                      {isPageMarked(pageNumber) ? '✔' : '🔖'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </Document>
        )}
        </div>
      </div>
    </div>
  );
}
