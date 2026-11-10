'use client';

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { LoggerService } from '@/business/services/LoggerService';

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
}

// View fiel PDF: render vectorial canvas vía PDF.js, sin extracción a texto
export default function FaithfulPdfViewer({ file, initialPage = 1, onPageChange, submode = 'compact', onSubmodeChange }: FaithfulPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.25);
  const [userZoom, setUserZoom] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [matchCount, setMatchCount] = useState<number>(0);
  const [matchIndex, setMatchIndex] = useState<number>(0);
  const highlightEls = useRef<HTMLElement[]>([]);

  const isBook = submode === 'book';
  const isPdfMode = submode === 'pdf';

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    setPageNumber(initialPage && initialPage >= 1 ? initialPage : 1);
    setUserZoom(false);
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
      if (!userZoom) setScale(next);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [userZoom, isBook]);

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

  const clearHighlights = () => {
    highlightEls.current.forEach((el) => { el.style.backgroundColor = ''; });
    highlightEls.current = [];
    setMatchCount(0);
    setMatchIndex(0);
  };

  const performSearch = () => {
    clearHighlights();
    if (!searchQuery.trim() || !containerRef.current) return;
    const walker = document.createTreeWalker(containerRef.current, NodeFilter.SHOW_TEXT, null);
    const found: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.toLowerCase().includes(searchQuery.toLowerCase())) {
        found.push(node as Text);
      }
    }
    const els: HTMLElement[] = [];
    found.forEach((tn) => {
      const parent = tn.parentElement;
      if (parent) {
        parent.style.backgroundColor = '#FEF3C7';
        els.push(parent);
      }
    });
    highlightEls.current = els;
    setMatchCount(els.length);
    if (els.length > 0) {
      els[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      setMatchIndex(0);
    }
  };

  const nextMatch = () => {
    if (highlightEls.current.length === 0) return;
    const next = (matchIndex + 1) % highlightEls.current.length;
    highlightEls.current[next].scrollIntoView({ behavior: 'smooth', block: 'center' });
    setMatchIndex(next);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#0f0f0f] relative">
      <div className="flex items-center justify-center gap-2 px-4 h-[40px] bg-[#1a1a1a] border-b border-[#2A2E33] shrink-0 text-[12px]">
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
        {submode === 'compact' && (
          <>
            <span className="w-px h-4 bg-[#2A2E33] mx-1" />
            <button onClick={() => { setUserZoom(true); setScale(s => Math.max(0.75, +(s - 0.25).toFixed(2))); }} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white">−</button>
            <span className="text-[#9CA3AF] font-mono w-[44px] text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => { setUserZoom(true); setScale(s => Math.min(2.5, +(s + 0.25).toFixed(2))); }} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white">+</button>
            <button onClick={() => { setUserZoom(false); }} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white text-[11px]">Ajustar</button>
          </>
        )}
      </div>
      {submode === 'pdf' && (
        <div className="absolute top-14 right-4 z-40 w-[min(90vw,280px)] rounded-[10px] bg-[#1a1a1a]/95 border border-[#2A2E33] shadow-2xl p-3 space-y-3 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#6B7280]">Zoom</p>
          <div className="flex items-center gap-2">
            <button onClick={() => { setUserZoom(true); setScale(s => Math.max(0.5, +(s - 0.1).toFixed(2))); }} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white text-[11px]">−</button>
            <span className="text-[#9CA3AF] font-mono text-[11px] w-[40px] text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => { setUserZoom(true); setScale(s => Math.min(2.5, +(s + 0.1).toFixed(2))); }} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white text-[11px]">+</button>
            <button onClick={() => { setUserZoom(false); }} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white text-[11px]">Ajustar</button>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#6B7280] mb-2">Buscar</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') performSearch(); }}
                placeholder="Palabra..."
                className="flex-1 min-w-0 px-2 py-1.5 rounded-[6px] bg-[#0f0f0f] border border-[#3A3E44] text-white text-[12px]"
              />
              <button onClick={performSearch} className="px-2 py-1.5 rounded-[6px] bg-[#C0392B] text-white text-[11px] font-medium hover:bg-[#A93226]">Buscar</button>
            </div>
            {matchCount > 0 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-[#9CA3AF]">{matchIndex + 1} de {matchCount}</span>
                <button onClick={nextMatch} className="text-[11px] text-[#C0392B] hover:underline">Siguiente</button>
              </div>
            )}
            {matchCount === 0 && searchQuery && (
              <p className="text-[11px] text-[#6B7280] mt-2">Sin resultados</p>
            )}
          </div>
        </div>
      )}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-auto py-6 px-4">
        {fileUrl && (
          <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => {
              LoggerService.info('FaithfulPDF', `${file.name}: ${numPages} páginas`);
              setNumPages(numPages);
              if (initialPage && initialPage >= 1 && initialPage <= numPages) {
                setPageNumber(initialPage);
              }
            }}
            onLoadError={(err) => LoggerService.error('FaithfulPDF', `load ${file.name} falló:`, err)}
            loading={<p className="text-[12px] text-[#6B7280]">Cargando PDF…</p>}
            error={<p className="text-[12px] text-[#C0392B]">No se pudo renderizar el PDF.</p>}
          >
            {submode === 'pdf' ? (
              <div className="flex flex-col items-center gap-6 w-full">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                  <Page
                    key={`page-${p}`}
                    pageNumber={p}
                    scale={scale}
                    renderTextLayer
                    renderAnnotationLayer={false}
                    loading={<p className="text-[12px] text-[#6B7280]">Cargando página {p}…</p>}
                    className="shadow-lg"
                  />
                ))}
              </div>
            ) : isBook ? (
              <div className={`flex gap-6 ${isBook ? 'min-w-max mx-auto' : ''} justify-center`}>
                <Page
                  key={`left-${pageNumber}`}
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer
                  renderAnnotationLayer={false}
                  loading={<p className="text-[12px] text-[#6B7280]">Cargando página…</p>}
                />
                {secondPage > pageNumber && (
                  <Page
                    key={`right-${secondPage}`}
                    pageNumber={secondPage}
                    scale={scale}
                    renderTextLayer
                    renderAnnotationLayer={false}
                    loading={<p className="text-[12px] text-[#6B7280]">Cargando página…</p>}
                  />
                )}
              </div>
            ) : (
              <div className="flex justify-center">
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer
                  renderAnnotationLayer={false}
                  loading={<p className="text-[12px] text-[#6B7280]">Cargando página…</p>}
                />
              </div>
            )}
          </Document>
        )}
      </div>
    </div>
  );
}
