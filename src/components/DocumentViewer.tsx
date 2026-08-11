'use client';

import DocViewer, { DocViewerRenderers } from '@iamjariwala/react-doc-viewer';
import '@iamjariwala/react-doc-viewer/dist/index.css';

interface DocumentViewerProps {
  textFile: File;
}

export default function DocumentViewer({ textFile }: DocumentViewerProps) {
  return (
    <div id="doc-viewer" className="flex-1 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
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
        style={{ height: 'calc(100vh - 100px)' }}
        className="flex-1"
      />
    </div>
  );
}
