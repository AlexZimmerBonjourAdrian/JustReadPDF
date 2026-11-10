'use client';

import { useEffect, useRef, useState } from 'react';
import { PdfSearchService } from './pdf-tools.service';

interface PdfToolsPanelProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFit: () => void;
}

const STORAGE_KEY = 'jr_pdf_tools_panel';

type PanelState = {
  x: number;
  y: number;
  w: number;
  h: number;
  minimized: boolean;
};

const DEFAULT_STATE: PanelState = {
  x: 24,
  y: 24,
  w: 280,
  h: 320,
  minimized: false,
};

export default function PdfToolsPanel({ containerRef, zoom, onZoomChange, onFit }: PdfToolsPanelProps) {
  const [state, setState] = useState<PanelState>(DEFAULT_STATE);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const [matchIndex, setMatchIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const resizing = useRef(false);
  const highlightsRef = useRef<HTMLElement[]>([]);

  // Load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PanelState>;
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  // Drag/resize handlers
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) {
        setState((prev) => ({
          ...prev,
          x: Math.max(0, e.clientX - dragOffset.current.x),
          y: Math.max(0, e.clientY - dragOffset.current.y),
        }));
      }
      if (resizing.current) {
        const rect = panelRef.current?.getBoundingClientRect();
        if (rect) {
          setState((prev) => ({
            ...prev,
            w: Math.max(240, e.clientX - rect.left),
            h: Math.max(200, e.clientY - rect.top),
          }));
        }
      }
    };
    const onUp = () => {
      dragging.current = false;
      resizing.current = false;
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  };

  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    resizing.current = true;
  };

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

  if (state.minimized) {
    return (
      <button
        onClick={() => setState((prev) => ({ ...prev, minimized: false }))}
        className="fixed z-50 px-3 py-2 rounded-[8px] bg-[#C0392B] text-white text-[12px] font-medium shadow-lg hover:bg-[#A93226]"
        style={{ left: state.x, top: state.y }}
        aria-label="Mostrar panel de herramientas PDF"
      >
        PDF
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      className="fixed z-50 rounded-[10px] bg-[#1a1a1a]/95 border border-[#2A2E33] shadow-2xl p-3 space-y-3 backdrop-blur-sm"
      style={{ left: state.x, top: state.y, width: state.w, height: state.h }}
    >
      <div
        onMouseDown={onHeaderMouseDown}
        className="flex items-center justify-between cursor-move select-none -mt-1 -mx-1 px-1 py-1"
      >
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#6B7280]">Herramientas PDF</p>
        <button
          onClick={() => setState((prev) => ({ ...prev, minimized: true }))}
          className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] text-[11px] hover:text-white"
        >
          ▼
        </button>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#6B7280] mb-2">Zoom</p>
        <div className="flex items-center gap-2">
          <button onClick={() => onZoomChange(Math.max(0.5, +(zoom - 0.1).toFixed(2)))} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white text-[11px]">−</button>
          <span className="text-[#9CA3AF] font-mono text-[11px] w-[40px] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => onZoomChange(Math.min(2.5, +(zoom + 0.1).toFixed(2)))} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white text-[11px]">+</button>
          <button onClick={onFit} className="px-2 py-1 rounded-[6px] bg-[#25282B] text-[#9CA3AF] hover:text-white text-[11px]">Ajustar</button>
        </div>
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

      <div
        onMouseDown={onResizeMouseDown}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
        style={{ background: 'linear-gradient(135deg, transparent 50%, #6B7280 50%)' }}
      />
    </div>
  );
}
