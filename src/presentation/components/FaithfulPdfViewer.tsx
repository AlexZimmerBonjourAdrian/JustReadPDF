'use client';

import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { LoggerService } from '@/business/services/LoggerService';

// Worker en el mismo módulo que renderiza (evita overwrite por orden de módulos)
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
}

interface FaithfulPdfViewerProps {
  file: File;
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

// View fiel PDF: render vectorial canvas vía PDF.js, sin extracción a texto
export default function FaithfulPdfViewer({ file, initialPage = 1, onPageChange }: FaithfulPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.25);
  const [userZoom, setUserZoom] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>('');

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
      const next = Math.max(0.5, Math.min(2.5, (w - 32) / 612));
      if (!userZoom) setScale(next);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [userZoom]);

  useEffect(() => {
    onPageChange?.(pageNumber);
  }, [pageNumber, onPageChange]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#0f0f0f]">
      <div className="flex items-center justify-center gap-2 px-4 h-[40px] bg-[#1a1a1a] border-b border-[#2A2E33] shrink-0 text-[12px]">
        <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white disabled:opacity-40">←</button>
        <span className="text-[#9CA3AF] font-mono">{pageNumber} / {numPages || '…'}</span>
        <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white disabled:opacity-40">→</button>
        <span className="w-px h-4 bg-[#2A2E33] mx-1" />
        <button onClick={() => { setUserZoom(true); setScale(s => Math.max(0.75, +(s - 0.25).toFixed(2))); }} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white">−</button>
        <span className="text-[#9CA3AF] font-mono w-[44px] text-center">{Math.round(scale * 100)}%</span>
        <button onClick={() => { setUserZoom(true); setScale(s => Math.min(2.5, +(s + 0.25).toFixed(2))); }} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white">+</button>
        <button onClick={() => { setUserZoom(false); }} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white text-[11px]">Ajustar</button>
      </div>
      <div ref={containerRef} className="flex-1 min-h-0 overflow-auto flex justify-center py-6 px-4">
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
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer
              renderAnnotationLayer={false}
              loading={<p className="text-[12px] text-[#6B7280]">Cargando página…</p>}
            />
          </Document>
        )}
      </div>
    </div>
  );
}
