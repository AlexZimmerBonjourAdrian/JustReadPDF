'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchService, SearchResult } from '@/services/SearchService';

interface SearchBarProps {
  text: string;
  onResultClick?: (lineNumber: number) => void;
}

export default function SearchBar({ text, onResultClick }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isOpen) inputRef.current?.focus(); }, [isOpen]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim() === '') { setResults([]); return; }
    setResults(SearchService.searchInText(text, searchQuery, caseSensitive));
  };

  const toggleCaseSensitive = () => {
    const next = !caseSensitive;
    setCaseSensitive(next);
    if (query.trim() !== '') setResults(SearchService.searchInText(text, query, next));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-[6px] bg-[#25282B] border border-[#2A2E33] text-[#9CA3AF] hover:text-white hover:border-[#3A3E44] rounded-[8px] flex items-center gap-1.5 text-[12px] transition-colors shrink-0"
      >
        <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        Buscar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-1 min-w-0 max-w-[420px]">
      <div className="relative flex-1 flex items-center">
        <svg className="absolute left-2.5 w-[14px] h-[14px] text-[#6B7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') { setIsOpen(false); setQuery(''); setResults([]); }}}
          placeholder="Buscar…"
          className="w-full pl-8 pr-8 py-[6px] bg-[#0f0f0f] text-white rounded-[8px] border border-[#2A2E33] focus:border-[#6B7280] focus:outline-none text-[12px] placeholder:text-[#6B7280]"
        />
        <button onClick={() => { setIsOpen(false); setQuery(''); setResults([]); }} className="absolute right-1 p-1 text-[#6B7280] hover:text-white">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <button onClick={toggleCaseSensitive} className={`px-2 py-[6px] rounded-[8px] text-[11px] border shrink-0 ${caseSensitive ? 'bg-white text-[#0f0f0f] border-white' : 'bg-[#25282B] text-[#9CA3AF] border-[#2A2E33] hover:text-white'}`} title="Mayúsculas">Aa</button>
      <span className="text-[11px] text-[#6B7280] shrink-0 hidden sm:inline">{results.length ? `${results.length}` : ''}</span>

      <AnimatePresence>
        {query.trim() !== '' && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-[44px] right-6 lg:right-8 w-[360px] bg-[#1a1a1a] border border-[#2A2E33] rounded-[10px] shadow-[0_16px_40px_rgba(0,0,0,0.4)] p-3 z-50">
            <div className="max-h-64 overflow-y-auto">
              {results.length === 0 && <p className="text-[#6B7280] text-[12px] text-center py-3">Sin resultados</p>}
              {results.length > 0 && results.slice(0,20).map((r,i)=>(
                <button key={i} onClick={()=>{ onResultClick?.(r.line); setIsOpen(false); }} className="w-full text-left px-2.5 py-2 hover:bg-[#25282B] rounded-[8px] transition-colors mb-0.5">
                  <p className="text-[12px] text-[#e5e5e5] line-clamp-2 leading-[1.5]">{r.text.substring(0,110)}{r.text.length>110?'…':''}</p>
                  <p className="text-[10px] text-[#6B7280]">L. {r.line+1} · pos {r.index}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
