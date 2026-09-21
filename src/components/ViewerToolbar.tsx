'use client';

import SearchBar from './SearchBar';
import { ViewerToolbarViewProps } from '@/types/ViewerData';

// View puro - una sola línea: DOCUMENTO + Buscar expandible + acciones inyectadas
export default function ViewerToolbar({ fileName, plainText, onSearchNavigate, actions }: ViewerToolbarViewProps & { actions?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 h-[44px] bg-[#1a1a1a] border-b border-[#2A2E33] shrink-0">
      <span className="hidden sm:inline text-[10px] tracking-[0.12em] uppercase text-[#6B7280] shrink-0">Documento</span>
      <span className="text-[11px] font-mono tracking-wide text-[#9CA3AF] truncate min-w-0 flex-1" title={fileName}>{fileName}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {plainText && <SearchBar text={plainText} onResultClick={onSearchNavigate} />}
        {actions}
      </div>
    </div>
  );
}
