'use client';

import { useRef, useState } from 'react';
import { PdfSearchService } from './pdf-tools.service';

interface PdfToolsPanelProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  onScaleChange: (scale: number) => void;
  onFit: () => void;
}

export default function PdfToolsPanel({ containerRef, scale, onScaleChange, onFit }: PdfToolsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [matchIndex, setMatchIndex] = useState(0);
  const highlightsRef = useRef<HTMLElement[]>([]);

  const clearHighlights = () => {
    PdfSearchService.clearHighlights(highlightsRef.current);
    highlightsRef.current = [];
    setMatchCount(0);
    setMatchIndex(0);
  };

  const performSearch = () => {
    clearHighlights();
    if (!searchQuery.trim() || !containerRef.current) return;
    const nodes = PdfSearchService.findTextNodes(containerRef.current, searchQuery);
    const els = PdfSearchService.highlight(nodes);
    highlightsRef.current = els;
    setMatchCount(els.length);
    if (els.length > 0) {
      PdfSearchService.scrollTo(els[0]);
      setMatchIndex(0);
    }
  };

  const nextMatch = () => {
    if (highlightsRef.current.length === 0) return;
    const next = (matchIndex + 1) % highlightsRef.current.length;
    PdfSearchService.scrollTo(highlightsRef.current[next]);
    setMatchIndex(next);
  };

  return (
    <div className="absolute top-14 right-4 z-40 w-[min(90vw,280px)] rounded-[10px] bg-[#1a1a1a]/95 border border-[#2A2E33] shadow-2xl p-3 space-y-3 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.12em] text-[#6B7280]">Zoom</p>
      <div className="flex items-center gap-2">
        <button onClick={() => onScaleChange(Math.max(0.5, +(scale - 0.1).toFixed(2)))} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white text-[11px]">−</button>
        <span className="text-[#9CA3AF] font-mono text-[11px] w-[40px] text-center">{Math.round(scale * 100)}%</span>
        <button onClick={() => onScaleChange(Math.min(2.5, +(scale + 0.1).toFixed(2)))} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white text-[11px]">+</button>
        <button onClick={onFit} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white text-[11px]">Ajustar</button>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#6B7280] mb-2">Buscar</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') performSearch(); }}
            placeholder="Palabra..."
            className="flex-1 min-w-0 px-2 py-1.5 rounded-[6px] bg-[#0f0f0f] border border-[#3A3E44] text-white text-[12px]"
          />
          <button onClick={performSearch} className="px-2 py-1.5 rounded-[6px] bg-[#C0392B] text-white text-[11px] font-medium hover:bg-[#A93226]">Buscar</button>
        </div>
        {matchCount > 0 && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-[#9CA3AF]">{matchIndex + 1} de {matchCount}</span>
            <button onClick={nextMatch} className="text-[11px] text-[#C0392B] hover:underline">Siguiente</button>
          </div>
        )}
        {matchCount === 0 && searchQuery && (
          <p className="text-[11px] text-[#6B7280] mt-2">Sin resultados</p>
        )}
      </div>
    </div>
  );
}
