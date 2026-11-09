'use client';

import { useEffect, useRef, useState } from 'react';
import { ViewerInteractionService } from '@/business/services/ViewerInteractionService';
import { DocPaletteName } from '@/business/services/TextFormatterService';
import { ViewerDisplayData } from '@/data/ViewerData';
import ViewerToolbar from './ViewerToolbar';

interface HtmlViewerProps {
  displayData: ViewerDisplayData;
  toolbarActions?: React.ReactNode;
  palette?: DocPaletteName;
  onPaletteChange?: (palette: DocPaletteName) => void;
  initialScrollY?: number;
  onScroll?: (y: number) => void;
}

export default function HtmlViewer({ displayData, toolbarActions, palette = 'dark', onPaletteChange, initialScrollY = 0, onScroll }: HtmlViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const { fileData, content } = displayData;

  const handleResultClick = (lineNumber: number) => {
    ViewerInteractionService.scrollToLineInIframe(iframeRef.current, content.plainText, lineNumber);
  };

  useEffect(() => {
    let cancelled = false;
    ViewerInteractionService.loadHtmlFileContent(fileData.file).then(t => { if (!cancelled) setHtmlContent(t); });
    return () => { cancelled = true; };
  }, [fileData.file]);

  useEffect(() => {
    if (iframeRef.current && htmlContent) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        ViewerInteractionService.applyPaletteToIframe(iframe, palette);
        // Restaurar posición guardada
        try {
          iframe.contentWindow?.scrollTo(0, initialScrollY || 0);
        } catch {
          // ignore
        }
      }
    }
  }, [htmlContent, initialScrollY, palette]);

  useEffect(() => {
    ViewerInteractionService.applyPaletteToIframe(iframeRef.current, palette);
  }, [palette]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !onScroll) return;
    const win = iframe.contentWindow;
    if (!win) return;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const handler = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => onScroll(win.scrollY || win.pageYOffset || 0), 300);
    };
    // El documento se escribe de forma asíncrona; esperar a que exista.
    const attach = () => {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      win.addEventListener('scroll', handler);
    };
    attach();
    return () => {
      win.removeEventListener('scroll', handler);
      if (timeout) clearTimeout(timeout);
    };
  }, [htmlContent, onScroll]);

  return (
    <div id="html-viewer" className="flex-1 min-h-0 bg-[#0f0f0f] overflow-hidden flex flex-col">
      <ViewerToolbar fileName={fileData.originalFileName || fileData.fileName} plainText={content.plainText} onSearchNavigate={handleResultClick} actions={toolbarActions} palette={palette} onPaletteChange={onPaletteChange} />
      <iframe
        ref={iframeRef}
        title={fileData.fileName}
        className="flex-1 min-h-0 w-full border-0 block bg-[#1a1a1a]"
        style={{ minHeight: '65vh' }}
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
