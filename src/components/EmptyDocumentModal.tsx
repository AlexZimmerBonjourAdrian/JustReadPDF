'use client';

import { motion } from 'framer-motion';

interface EmptyDocumentModalProps {
  fileName: string;
  detail: string;
  onClose: () => void;
  onSelectFile: (file: File) => void;
}

// Popup editorial oscuro: documento sin texto extraíble
export default function EmptyDocumentModal({ fileName, detail, onClose, onSelectFile }: EmptyDocumentModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-label="Documento sin texto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-[420px] bg-[#1a1a1a] border border-[#2A2E33] rounded-[14px] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#C0392B]/15 border border-[#C0392B]/40 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h7l3 3v8a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v5M12 18.5v.01" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-white leading-snug">Sin texto para mostrar</h2>
            <p className="text-[11px] font-mono text-[#6B7280] truncate mt-0.5" title={fileName}>{fileName}</p>
          </div>
        </div>
        <p className="text-[13px] leading-[1.65] text-[#9CA3AF] mb-5">{detail}</p>
        <div className="flex items-center gap-2">
          <label className="flex-1 px-3 py-2 bg-[#C0392B] text-white rounded-[8px] hover:bg-[#A93226] transition-colors cursor-pointer text-[13px] font-medium text-center">
            Elegir otro archivo
            <input
              type="file"
              accept=".pdf,.txt,.rtf,.doc,.docx,.epub"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onSelectFile(f);
              }}
            />
          </label>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#25282B] border border-[#2A2E33] text-[#9CA3AF] rounded-[8px] hover:border-[#3A3E44] hover:text-white transition-colors text-[13px]"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
