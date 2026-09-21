'use client';

import SearchBar from './SearchBar';
import { DOC_PALETTES, DocPaletteName } from '@/services/TextFormatterService';
import { ViewerToolbarViewProps } from '@/types/ViewerData';

const PALETTE_ORDER: DocPaletteName[] = ['dark', 'light', 'sepia'];
const PALETTE_LABELS: Record<DocPaletteName, string> = {
  dark: 'Oscuro',
  light: 'Claro',
  sepia: 'Sepia',
};

// View puro - una sola línea: DOCUMENTO + Buscar expandible + paleta + acciones inyectadas
export default function ViewerToolbar({ fileName, plainText, onSearchNavigate, actions, palette, onPaletteChange }: ViewerToolbarViewProps & { actions?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 h-[44px] bg-[#1a1a1a] border-b border-[#2A2E33] shrink-0">
      <span className="hidden sm:inline text-[10px] tracking-[0.12em] uppercase text-[#6B7280] shrink-0">Documento</span>
      <span className="text-[11px] font-mono tracking-wide text-[#9CA3AF] truncate min-w-0 flex-1" title={fileName}>{fileName}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {plainText && <SearchBar text={plainText} onResultClick={onSearchNavigate} />}
        {onPaletteChange && (
          <div className="flex items-center gap-1 px-1.5 py-1 rounded-[8px] bg-[#25282B] border border-[#2A2E33]" title="Paleta del documento">
            {PALETTE_ORDER.map((name) => (
              <button
                key={name}
                onClick={() => onPaletteChange(name)}
                title={PALETTE_LABELS[name]}
                aria-label={`Paleta ${PALETTE_LABELS[name]}`}
                className={`w-5 h-5 rounded-full border transition-all ${palette === name ? 'border-white scale-110' : 'border-[#3A3E44] hover:border-[#6B7280]'}`}
                style={{ backgroundColor: DOC_PALETTES[name].bg }}
              />
            ))}
          </div>
        )}
        {actions}
      </div>
    </div>
  );
}
