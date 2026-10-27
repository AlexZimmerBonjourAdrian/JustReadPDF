'use client';

import dynamic from 'next/dynamic';
import ViewerToolbar from './ViewerToolbar';

const FaithfulPdfViewer = dynamic(() => import('./FaithfulPdfViewer'), { ssr: false });
const FaithfulDocxViewer = dynamic(() => import('./FaithfulDocxViewer'), { ssr: false });
const FaithfulEpubViewer = dynamic(() => import('./FaithfulEpubViewer'), { ssr: false });

export type FaithfulKind = 'pdf' | 'docx' | 'epub' | 'unsupported';

export function detectFaithfulKind(file: File): FaithfulKind {
  const name = file.name.toLowerCase();
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx')) return 'docx';
  if (file.type === 'application/epub+zip' || name.endsWith('.epub')) return 'epub';
  return 'unsupported';
}

interface FaithfulViewerProps {
  originalFile: File;
  plainText: string;
  onSearchNavigate: (lineNumber: number) => void;
  toolbarActions?: React.ReactNode;
}

// View fiel: render nativo por formato. TXT/RTF/DOC legacy caen a cómodo (ya es fiel).
export default function FaithfulViewer({ originalFile, plainText, onSearchNavigate, toolbarActions }: FaithfulViewerProps) {
  const kind = detectFaithfulKind(originalFile);
  const fileName = originalFile.name;

  return (
    <div className="flex-1 min-h-0 bg-[#0f0f0f] overflow-hidden flex flex-col">
      <ViewerToolbar fileName={fileName} plainText={kind === 'pdf' ? '' : plainText} onSearchNavigate={onSearchNavigate} actions={toolbarActions} />
      {kind === 'pdf' && <FaithfulPdfViewer file={originalFile} />}
      {kind === 'docx' && <FaithfulDocxViewer file={originalFile} />}
      {kind === 'epub' && <FaithfulEpubViewer file={originalFile} />}
      {kind === 'unsupported' && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[13px] text-[#9CA3AF]">Vista fiel no disponible para este formato — usa modo cómodo.</p>
        </div>
      )}
    </div>
  );
}
