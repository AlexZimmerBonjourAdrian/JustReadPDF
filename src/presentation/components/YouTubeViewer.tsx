'use client';

import { useState } from 'react';

interface YouTubeViewerProps {
  url: string;
  title?: string;
}

export default function YouTubeViewer({ url, title = 'YouTube' }: YouTubeViewerProps) {
  const [error, setError] = useState<string>('');

  if (!url) {
    return <p className="text-[12px] text-[#6B7280] text-center py-8">Sin enlace de YouTube.</p>;
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#0f0f0f]">
      {error && <p className="text-[12px] text-[#C0392B] text-center py-2 shrink-0">{error}</p>}
      <div className="flex-1 min-h-0 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl aspect-video rounded-[12px] overflow-hidden shadow-lg bg-black">
          <iframe
            src={url}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            onError={() => setError('No se pudo cargar el video.')}
          />
        </div>
      </div>
      <p className="text-[11px] text-[#6B7280] text-center pb-4">
        El video se reproduce desde YouTube. Se aplican sus políticas de privacidad.
      </p>
    </div>
  );
}