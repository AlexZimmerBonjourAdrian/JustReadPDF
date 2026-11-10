'use client';

import { useEffect, useRef, useState } from 'react';
import { YouTubeUrlService } from './youtube.service';

const STORAGE_KEY = 'jr_youtube_panel';

type PanelState = {
  visible: boolean;
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minimized: boolean;
};

const DEFAULT_STATE: PanelState = {
  visible: false,
  url: '',
  x: 24,
  y: 24,
  w: 360,
  h: 240,
  minimized: false,
};

export default function YouTubePanel() {
  const [state, setState] = useState<PanelState>(DEFAULT_STATE);
  const [draftUrl, setDraftUrl] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizing = useRef(false);
  const dragging = useRef(false);

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

  // Drag handlers
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
            w: Math.max(280, e.clientX - rect.left),
            h: Math.max(180, e.clientY - rect.top),
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

  const loadUrl = () => {
    const embed = YouTubeUrlService.toEmbedUrl(draftUrl);
    if (embed) {
      setState((prev) => ({ ...prev, url: embed, visible: true, minimized: false }));
      setDraftUrl('');
    } else {
      alert('Enlace de YouTube no válido');
    }
  };

  if (!state.visible) {
    return (
      <button
        onClick={() => setState((prev) => ({ ...prev, visible: true }))}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 rounded-[8px] bg-[#C0392B] text-white text-[12px] font-medium shadow-lg hover:bg-[#A93226]"
        aria-label="Mostrar panel de YouTube"
      >
        YouTube
      </button>
    );
  }

  return (
    <div
      ref={panelRef}
      className="fixed z-50 rounded-[12px] overflow-hidden shadow-2xl border border-[#2A2E33] bg-[#1a1a1a]"
      style={{ left: state.x, top: state.y, width: state.w, height: state.minimized ? 40 : state.h }}
    >
      <div
        onMouseDown={onHeaderMouseDown}
        className="flex items-center justify-between gap-2 px-3 py-2 bg-[#25282B] cursor-move select-none"
      >
        <span className="text-[12px] text-white font-medium">YouTube</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setState((prev) => ({ ...prev, minimized: !prev.minimized }))}
            className="px-2 py-1 rounded-[6px] bg-[#1a1a1a] text-[#9CA3AF] text-[11px] hover:text-white"
          >
            {state.minimized ? '▲' : '▼'}
          </button>
          <button
            onClick={() => setState((prev) => ({ ...prev, visible: false }))}
            className="px-2 py-1 rounded-[6px] bg-[#1a1a1a] text-[#9CA3AF] text-[11px] hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>

      {!state.minimized && (
        <div className="flex flex-col h-[calc(100%-40px)]">
          {!state.url && (
            <div className="p-3 space-y-2">
              <input
                type="url"
                value={draftUrl}
                onChange={(e) => setDraftUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') loadUrl(); }}
                placeholder="Pegar enlace de YouTube"
                className="w-full px-2 py-1.5 rounded-[6px] bg-[#0f0f0f] border border-[#3A3E44] text-white text-[12px]"
              />
              <button
                onClick={loadUrl}
                className="w-full px-2 py-1.5 rounded-[6px] bg-[#C0392B] text-white text-[11px] font-medium hover:bg-[#A93226]"
              >
                Cargar video
              </button>
            </div>
          )}

          {state.url && (
            <div className="flex-1 min-h-0 relative">
              <button
                onClick={() => setState((prev) => ({ ...prev, url: '' }))}
                className="absolute top-2 right-2 z-10 px-2 py-1 rounded-[6px] bg-black/60 text-white text-[10px] hover:bg-black/80"
              >
                Quitar
              </button>
              <iframe
                src={state.url}
                title="YouTube"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          )}
        </div>
      )}

      <div
        onMouseDown={onResizeMouseDown}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
        style={{ background: 'linear-gradient(135deg, transparent 50%, #6B7280 50%)' }}
      />
    </div>
  );
}
