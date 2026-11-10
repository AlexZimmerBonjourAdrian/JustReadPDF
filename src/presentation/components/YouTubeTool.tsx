'use client';

import { useState } from 'react';
import { YouTubeUrlService } from '@/business/services/YouTubeUrlService';
import YouTubeViewer from './YouTubeViewer';

export default function YouTubeTool() {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [draftUrl, setDraftUrl] = useState<string>('');

  const load = (raw: string) => {
    const embed = YouTubeUrlService.toEmbedUrl(raw);
    if (embed) {
      setEmbedUrl(embed);
      setDraftUrl('');
    } else {
      alert('Enlace de YouTube no válido');
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#0f0f0f]">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#2A2E33] bg-[#1a1a1a]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <input
            type="url"
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') load(draftUrl); }}
            placeholder="Pegar enlace de YouTube"
            className="flex-1 min-w-0 px-3 py-2 rounded-[8px] bg-[#0f0f0f] border border-[#3A3E44] text-white text-[13px]"
          />
          <button
            onClick={() => load(draftUrl)}
            className="px-3 py-2 rounded-[8px] bg-[#C0392B] text-white text-[12px] font-medium hover:bg-[#A93226] shrink-0"
          >
            Cargar video
          </button>
          {embedUrl && (
            <button
              onClick={() => setEmbedUrl('')}
              className="px-3 py-2 rounded-[8px] bg-[#25282B] border border-[#2A2E33] text-[#9CA3AF] text-[12px] hover:text-white shrink-0"
            >
              Quitar
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {embedUrl ? (
          <YouTubeViewer url={embedUrl} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[13px] text-[#6B7280] text-center px-6">
              Pega un enlace de YouTube para previsualizar el video. Esta herramienta es independiente de los documentos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
