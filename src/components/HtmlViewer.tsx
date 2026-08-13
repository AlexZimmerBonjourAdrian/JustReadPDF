'use client';

import { useEffect, useRef, useState } from 'react';
import SearchBar from './SearchBar';

interface HtmlViewerProps {
  htmlFile: File;
  extractedText?: string;
  originalFileName?: string;
}

export default function HtmlViewer({ htmlFile, extractedText, originalFileName }: HtmlViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');

  const handleResultClick = (lineNumber: number) => {
    console.log('Navigating to line:', lineNumber);
    
    if (!iframeRef.current) return;
    
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    
    // Split extracted text into lines and find the text at the given line number
    const lines = extractedText?.split('\n') || [];
    const targetText = lines[lineNumber];
    
    if (!targetText) {
      console.log('Line not found:', lineNumber);
      return;
    }
    
    // Search for the text in the iframe document
    const textNodes: Text[] = [];
    const walker = doc.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node: Node | null;
    while (node = walker.nextNode()) {
      if (node.textContent && node.textContent.includes(targetText)) {
        textNodes.push(node as Text);
      }
    }
    
    if (textNodes.length > 0) {
      // Scroll to the first matching element
      const element = textNodes[0].parentElement;
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the element temporarily
        const originalBg = element.style.backgroundColor;
        element.style.backgroundColor = '#4b5563';
        setTimeout(() => {
          element.style.backgroundColor = originalBg;
        }, 2000);
      }
    }
  };

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
    <div id="html-viewer" className="flex-1 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-3 bg-gray-900 border-b border-gray-700">
        <span className="text-sm text-gray-300 truncate">{originalFileName || htmlFile.name}</span>
        {extractedText && <SearchBar text={extractedText} onResultClick={handleResultClick} />}
      </div>
      <style jsx global>{`
        #html-viewer {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
        }
        #html-viewer * {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
        }
        #html-viewer iframe {
          background-color: #1f2937 !important;
        }
      `}</style>
      <iframe
        ref={iframeRef}
        title={htmlFile.name}
        className="flex-1 border-0"
        style={{ height: '100%' }}
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
