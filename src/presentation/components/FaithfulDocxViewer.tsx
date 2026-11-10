'use client';

import { useEffect, useRef, useState } from 'react';
import { LoggerService } from '@/business/services/LoggerService';

interface FaithfulDocxViewerProps {
  file: File;
  submode?: 'compact' | 'pdf' | 'book';
  bookmarkScrollY?: number;
  onToggleBookmark?: (page: number) => void;
}

// View fiel DOCX: renderAsync de docx-preview preserva estilos/tablas/headers
export default function FaithfulDocxViewer({ file, submode = 'compact', bookmarkScrollY, onToggleBookmark }: FaithfulDocxViewerProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const { renderAsync } = await import('docx-preview');
        if (cancelled || !bodyRef.current) return;
        bodyRef.current.innerHTML = '';
        await renderAsync(file, bodyRef.current, undefined, {
          className: 'faithful-docx',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
        });
        if (!cancelled) {
          const el = bodyRef.current?.querySelector('.faithful-docx');
          if (el) el.classList.toggle('book-mode', submode === 'book');
          // Restaurar scroll guardado si hay bookmark
          if (bookmarkScrollY !== undefined && bookmarkScrollY > 0) {
            setTimeout(() => {
              const scrollContainer = containerRef.current;
              if (scrollContainer) {
                scrollContainer.scrollTop = bookmarkScrollY;
              }
            }, 100);
          }
          LoggerService.info('FaithfulDOCX', `render OK ${file.name}`);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          LoggerService.error('FaithfulDOCX', `render ${file.name} falló:`, e);
          setError(e instanceof Error ? e.message : 'Error al renderizar DOCX');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [file, submode, bookmarkScrollY]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (container && onToggleBookmark) {
      const y = container.scrollTop;
      onToggleBookmark(y);
    }
  };

  return (
    <div className="flex-1 min-h-0 overflow-auto bg-[#0f0f0f] py-6 px-4 relative" ref={containerRef} onScroll={handleScroll}>
      <style>{`
        .faithful-docx-wrapper { background: transparent !important; padding: 0 !important; }
        .faithful-docx { background: #fff !important; color: #111 !important; width: 100%; max-width: min(100%, 816px); margin: 0 auto; box-shadow: 0 8px 30px rgba(0,0,0,0.45); }
        .faithful-docx.book-mode { column-count: 2; column-gap: 40px; column-rule: 1px solid #e5e7eb; }
        @media (max-width: 640px) { .faithful-docx { max-width: 100%; box-shadow: none; } .faithful-docx.book-mode { column-count: 1; } }
        .faithful-docx section { box-shadow: none !important; margin-bottom: 16px !important; }
      `}</style>
      {loading && <p className="text-[12px] text-[#6B7280] text-center">Renderizando DOCX…</p>}
      {error && <p className="text-[12px] text-[#C0392B] text-center">{error}</p>}
      <div ref={bodyRef} />
      {bookmarkScrollY && bookmarkScrollY > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] shadow-lg border border-white" title="Marcador" style={{ top: bookmarkScrollY }}>
          🔖
        </div>
      )}
      {onToggleBookmark && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            const container = containerRef.current;
            if (container) onToggleBookmark(container.scrollTop);
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
