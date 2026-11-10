'use client';

import { useEffect, useRef, useState } from 'react';
import { LoggerService } from '@/business/services/LoggerService';

interface FaithfulEpubViewerProps {
  file: File;
  submode?: 'compact' | 'pdf' | 'book';
  bookmarkScrollY?: number;
  onToggleBookmark?: (page: number) => void;
}

// View fiel EPUB: epubjs con flow scrolled-doc, TOC y estilos originales
export default function FaithfulEpubViewer({ file, submode = 'compact', bookmarkScrollY, onToggleBookmark }: FaithfulEpubViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>('');
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let book: any = null;
    (async () => {
      try {
        const { default: ePub } = await import('epubjs');
        if (cancelled || !viewerRef.current) return;
        viewerRef.current.innerHTML = '';
        const arrayBuffer = await file.arrayBuffer();
        book = ePub(arrayBuffer);
        const rendition = book.renderTo(viewerRef.current, {
          flow: 'scrolled-doc',
          width: '100%',
          height: '100%',
          spread: submode === 'book' ? 'always' : 'none',
        });
        rendition.themes.default({
          body: { 'background': '#fff !important', 'color': '#111 !important', 'font-family': 'Georgia, serif !important', 'padding': '16px 20px !important' },
          'p': { 'line-height': '1.7 !important' },
        });
        await rendition.display();
        // Restaurar scroll guardado si hay bookmark
        if (bookmarkScrollY !== undefined && bookmarkScrollY > 0 && !hasRestored) {
          setTimeout(() => {
            try {
              rendition.scrollTo(bookmarkScrollY);
            } catch {
              // ignore
            }
          }, 200);
          setHasRestored(true);
        }
        if (!cancelled) LoggerService.info('FaithfulEPUB', `render OK ${file.name}`);
      } catch (e) {
        if (!cancelled) {
          LoggerService.error('FaithfulEPUB', `render ${file.name} falló:`, e);
          setError(e instanceof Error ? e.message : 'Error al renderizar EPUB');
        }
      }
    })();
    return () => {
      cancelled = true;
      try { book?.destroy(); } catch { /* noop */ }
    };
  }, [file, submode, bookmarkScrollY, hasRestored]);

  const handleScroll = () => {
    const container = viewerRef.current;
    if (container && onToggleBookmark) {
      // epubjs no expone scrollTop directo, usamos el contenedor
      const y = container.scrollTop || 0;
      onToggleBookmark(y);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#0f0f0f] relative" ref={viewerRef} onScroll={handleScroll}>
      {error && <p className="text-[12px] text-[#C0392B] text-center py-2 shrink-0">{error}</p>}
      <div ref={viewerRef} className="flex-1 min-h-0 overflow-auto bg-white mx-2 sm:mx-4 my-2 sm:my-4 rounded-[8px]" style={{ minHeight: '60vh' }} />
      {bookmarkScrollY && bookmarkScrollY > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] shadow-lg border border-white" title="Marcador" style={{ top: bookmarkScrollY }}>
          🔖
        </div>
      )}
      {onToggleBookmark && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            const container = viewerRef.current;
            if (container) onToggleBookmark(container.scrollTop || 0);
          }}
          className="absolute right-4 top-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-[#1a1a1a]/80 border border-[#2A2E33] text-[#9CA3AF] hover:bg-purple-600 hover:text-white transition-all"
          title="Marcar posición"
        >
          🔖
        </button>
      )}
    </div>
  );
}
