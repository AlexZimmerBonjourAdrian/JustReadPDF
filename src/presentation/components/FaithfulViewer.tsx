'use client';

import dynamic from 'next/dynamic';
import ViewerToolbar from './ViewerToolbar';
import type { FaithfulKind, FaithfulViewerData } from '@/data/ViewerData';

const FaithfulPdfViewer = dynamic(() => import('./FaithfulPdfViewer'), { ssr: false });
const FaithfulDocxViewer = dynamic(() => import('./FaithfulDocxViewer'), { ssr: false });
const FaithfulEpubViewer = dynamic(() => import('./FaithfulEpubViewer'), { ssr: false });

interface FaithfulViewerProps {
  kind: FaithfulKind;
  data: FaithfulViewerData;
  toolbarActions?: React.ReactNode;
}

// Shell de la vista fiel: toolbar común + render nativo del formato ya resuelto por ViewerFactory.
export default function FaithfulViewer({ kind, data, toolbarActions }: FaithfulViewerProps) {
  const { originalFile, plainText, submode, onSubmodeChange, initialPage, onPageChange, bookmarkPage, bookmarkSubmode, bookmarkScrollY, onToggleBookmark, onGoToBookmark, onSearchNavigate } = data;

  return (
    <div className="flex-1 min-h-0 bg-[#0f0f0f] overflow-hidden flex flex-col">
      <ViewerToolbar fileName={originalFile.name} plainText={kind === 'pdf' ? '' : plainText} onSearchNavigate={onSearchNavigate} actions={toolbarActions} />
      {kind === 'pdf' && <FaithfulPdfViewer file={originalFile} initialPage={initialPage} onPageChange={onPageChange} submode={submode} onSubmodeChange={onSubmodeChange} bookmarkPage={bookmarkPage} bookmarkSubmode={bookmarkSubmode} onToggleBookmark={onToggleBookmark} onGoToBookmark={onGoToBookmark} />}
      {kind === 'docx' && <FaithfulDocxViewer file={originalFile} submode={submode} bookmarkScrollY={bookmarkScrollY} onToggleBookmark={onToggleBookmark} />}
      {kind === 'epub' && <FaithfulEpubViewer file={originalFile} submode={submode} bookmarkScrollY={bookmarkScrollY} onToggleBookmark={onToggleBookmark} />}
    </div>
  );
}
