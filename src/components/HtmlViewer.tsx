'use client';

import { useEffect, useRef, useState } from 'react';
import { ViewerInteractionService } from '@/services/ViewerInteractionService';
import { ViewerDisplayData } from '@/types/ViewerData';
import ViewerToolbar from './ViewerToolbar';

interface HtmlViewerProps {
  displayData: ViewerDisplayData;
  toolbarActions?: React.ReactNode;
}

export default function HtmlViewer({ displayData, toolbarActions }: HtmlViewerProps) {
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
      }
    }
  }, [htmlContent]);

  return (
    <div id="html-viewer" className="flex-1 min-h-0 bg-[#0f0f0f] overflow-hidden flex flex-col">
      <ViewerToolbar fileName={fileData.originalFileName || fileData.fileName} plainText={content.plainText} onSearchNavigate={handleResultClick} actions={toolbarActions} />
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
