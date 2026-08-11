'use client';

import DocViewer, { DocViewerRenderers } from '@iamjariwala/react-doc-viewer';
import '@iamjariwala/react-doc-viewer/dist/index.css';
import SearchBar from './SearchBar';

interface DocumentViewerProps {
  textFile: File;
  extractedText?: string;
}

export default function DocumentViewer({ textFile, extractedText }: DocumentViewerProps) {
  const handleResultClick = (lineNumber: number) => {
    console.log('Navigating to line:', lineNumber);
    // Implementar scroll a la línea específica
  };

  return (
    <div id="doc-viewer" className="flex-1 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-3 bg-gray-900 border-b border-gray-700">
        <span className="text-sm text-gray-300 truncate">{textFile.name}</span>
        {extractedText && <SearchBar text={extractedText} onResultClick={handleResultClick} />}
      </div>
      <style jsx global>{`
        #doc-viewer {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
        }
        #doc-viewer * {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
        }
        #doc-viewer .react-doc-viewer {
          background-color: #1f2937 !important;
        }
        #doc-viewer .react-doc-viewer-header {
          background-color: #111827 !important;
          color: #e5e7eb !important;
          border-bottom: 1px solid #374151 !important;
        }
        #doc-viewer .react-doc-viewer-body {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
        }
        #doc-viewer .react-doc-viewer-main {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
        }
        #doc-viewer .react-doc-viewer-content {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
        }
        #doc-viewer pre,
        #doc-viewer code {
          background-color: #111827 !important;
          color: #e5e7eb !important;
        }
        #doc-viewer .header-btn {
          background-color: #374151 !important;
          color: #e5e7eb !important;
        }
        #doc-viewer .header-btn:hover {
          background-color: #4b5563 !important;
        }
      `}</style>
      <DocViewer
        documents={[{ uri: URL.createObjectURL(textFile) }]}
        pluginRenderers={DocViewerRenderers}
        config={{
          header: {
            disableHeader: false,
            disableFileName: false,
            retainURLParams: false,
          },
          themeMode: "dark",
        }}
        style={{ height: 'calc(100vh - 140px)' }}
        className="flex-1"
      />
    </div>
  );
}
