'use client';

import { useEffect, useRef, useState } from 'react';

interface FaithfulDocxViewerProps {
  file: File;
}

// View fiel DOCX: renderAsync de docx-preview preserva estilos/tablas/headers
export default function FaithfulDocxViewer({ file }: FaithfulDocxViewerProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const { renderAsync } = await import('docx-preview');
        if (cancelled || !bodyRef.current) return;
        bodyRef.current.innerHTML = '';
        await renderAsync(file, bodyRef.current, undefined, {
          className: 'faithful-docx',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
        });
        if (!cancelled) setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error al renderizar DOCX');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [file]);

  return (
    <div className="flex-1 min-h-0 overflow-auto bg-[#0f0f0f] py-6 px-4">
      <style>{`
        .faithful-docx-wrapper { background: transparent !important; padding: 0 !important; }
        .faithful-docx { background: #fff !important; color: #111 !important; max-width: 816px; margin: 0 auto; box-shadow: 0 8px 30px rgba(0,0,0,0.45); }
        .faithful-docx section { box-shadow: none !important; margin-bottom: 16px !important; }
      `}</style>
      {loading && <p className="text-[12px] text-[#6B7280] text-center">Renderizando DOCX…</p>}
      {error && <p className="text-[12px] text-[#C0392B] text-center">{error}</p>}
      <div ref={bodyRef} />
    </div>
  );
}
