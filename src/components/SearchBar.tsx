'use client';

import { useState } from 'react';
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

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim() === '') {
      setResults([]);
      return;
    }
    const searchResults = SearchService.searchInText(text, searchQuery, caseSensitive);
    setResults(searchResults);
  };

  const toggleCaseSensitive = () => {
    setCaseSensitive(!caseSensitive);
    if (query.trim() !== '') {
      handleSearch(query);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="text-sm">Buscar</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 z-50"
          >
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar en el documento..."
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={toggleCaseSensitive}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  caseSensitive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title="Distinguir mayúsculas/minúsculas"
              >
                Aa
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {results.length === 0 && query.trim() !== '' && (
                <p className="text-gray-400 text-sm text-center py-4">No se encontraron resultados</p>
              )}
              {results.length > 0 && (
                <>
                  <p className="text-gray-400 text-xs mb-2">{results.length} resultado(s)</p>
                  {results.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onResultClick?.(result.line);
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded transition-colors mb-1"
                    >
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {result.text.substring(0, 100)}{result.text.length > 100 ? '...' : ''}
                      </p>
                      <p className="text-xs text-gray-500">Línea {result.line + 1}</p>
                    </button>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
