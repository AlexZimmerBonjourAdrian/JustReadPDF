'use client';

import { useEffect, useRef, useState } from 'react';

interface HtmlViewerProps {
  htmlFile: File;
}

export default function HtmlViewer({ htmlFile }: HtmlViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    const loadHtml = async () => {
      const text = await htmlFile.text();
      setHtmlContent(text);
    };
    loadHtml();
  }, [htmlFile]);

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
    <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-3 bg-gray-900 border-b border-gray-700">
        <span className="text-sm text-gray-300 truncate">{htmlFile.name}</span>
      </div>
      <iframe
        ref={iframeRef}
        title={htmlFile.name}
        className="flex-1 border-0"
        style={{ height: 'calc(100vh - 140px)' }}
        sandbox="allow-same-origin"
      />
    </div>
  );
}
