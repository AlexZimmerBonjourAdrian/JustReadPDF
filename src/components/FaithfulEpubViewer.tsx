'use client';

import { useEffect, useRef, useState } from 'react';
import { LoggerService } from '@/services/LoggerService';

interface FaithfulEpubViewerProps {
  file: File;
}

// View fiel EPUB: epubjs con flow scrolled-doc, TOC y estilos originales
export default function FaithfulEpubViewer({ file }: FaithfulEpubViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>('');

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
        });
        rendition.themes.default({
          body: { 'background': '#fff !important', 'color': '#111 !important', 'font-family': 'Georgia, serif !important', 'padding': '24px 32px !important' },
          'p': { 'line-height': '1.7 !important' },
        });
        await rendition.display();
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
  }, [file]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#0f0f0f]">
      {error && <p className="text-[12px] text-[#C0392B] text-center py-2 shrink-0">{error}</p>}
      <div ref={viewerRef} className="flex-1 min-h-0 overflow-auto bg-white mx-4 my-4 rounded-[8px]" style={{ minHeight: '60vh' }} />
    </div>
  );
}
