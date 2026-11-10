'use client';

import { useEffect, useRef, useState } from 'react';

type FaithfulSubmode = 'compact' | 'pdf' | 'book';

interface HamburgerMenuProps {
  submode: FaithfulSubmode;
  onSubmodeChange: (submode: FaithfulSubmode) => void;
}

export default function HamburgerMenu({ submode, onSubmodeChange }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false);
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
        </div>
      )}
    </div>
  );
}
