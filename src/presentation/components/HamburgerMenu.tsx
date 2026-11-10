'use client';

import { useEffect, useRef, useState } from 'react';

type FaithfulSubmode = 'compact' | 'pdf' | 'book';

interface HamburgerMenuProps {
  submode: FaithfulSubmode;
  onSubmodeChange: (submode: FaithfulSubmode) => void;
  showYouTubeOverlay: boolean;
  onToggleYouTube: (checked: boolean) => void;
  youtubeUrl: string;
  onSetYouTubeUrl: (url: string) => void;
}

export default function HamburgerMenu({
  submode,
  onSubmodeChange,
  showYouTubeOverlay,
  onToggleYouTube,
  youtubeUrl,
  onSetYouTubeUrl,
}: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
  const [draftUrl, setDraftUrl] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleLoadUrl = () => {
    if (draftUrl.trim()) {
      onSetYouTubeUrl(draftUrl.trim());
      setDraftUrl('');
    }
  };

  return (
    <div ref={containerRef} className="absolute top-3 right-3 z-50">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-9 h-9 flex items-center justify-center rounded-[8px] bg-[#1a1a1a]/90 border border-[#2A2E33] text-white hover:bg-[#25282B]"
        aria-label="Opciones"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 w-[min(80vw,300px)] rounded-[10px] bg-[#1a1a1a] border border-[#2A2E33] shadow-2xl p-3 space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#6B7280] mb-2">Modo de lectura</p>
            <div className="flex rounded-[8px] overflow-hidden border border-[#2A2E33]">
              {(['compact', 'pdf', 'book'] as FaithfulSubmode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => onSubmodeChange(m)}
                  className={`flex-1 px-2 py-1.5 text-[11px] transition-colors ${submode === m ? 'bg-white text-[#0f0f0f] font-medium' : 'bg-[#25282B] text-[#9CA3AF] hover:text-white'}`}
                >
                  {m === 'compact' ? 'Compacto' : m === 'pdf' ? 'PDF' : 'Book'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#6B7280] mb-2">Video de YouTube</p>
            <label className="flex items-center gap-2 text-[12px] text-[#9CA3AF] cursor-pointer">
              <input
                type="checkbox"
                checked={showYouTubeOverlay}
                onChange={(e) => onToggleYouTube(e.target.checked)}
                className="accent-[#C0392B]"
              />
              <span>Mostrar overlay</span>
            </label>

            {showYouTubeOverlay && !youtubeUrl && (
              <div className="mt-2 space-y-2">
                <input
                  type="url"
                  value={draftUrl}
                  onChange={(e) => setDraftUrl(e.target.value)}
                  placeholder="Pegar enlace de YouTube"
                  className="w-full px-2 py-1.5 rounded-[6px] bg-[#0f0f0f] border border-[#3A3E44] text-white text-[12px]"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLoadUrl(); }}
                />
                <button
                  onClick={handleLoadUrl}
                  className="w-full px-2 py-1.5 rounded-[6px] bg-[#C0392B] text-white text-[11px] font-medium hover:bg-[#A93226]"
                >
                  Cargar video
                </button>
              </div>
            )}

            {youtubeUrl && (
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#9CA3AF] truncate">Video cargado</span>
                <button
                  onClick={() => onSetYouTubeUrl('')}
                  className="text-[11px] text-[#C0392B] hover:underline"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
