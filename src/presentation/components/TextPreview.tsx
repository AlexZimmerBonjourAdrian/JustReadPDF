'use client';

import { useState } from 'react';
import { FiMinus, FiPlus, FiSun, FiMoon, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

interface TextPreviewProps {
  text: string;
  title?: string;
}

export default function TextPreview({ text, title = 'Vista Previa' }: TextPreviewProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [isExpanded, setIsExpanded] = useState(true);

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const containerClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-300';

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 32));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  return (
    <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto p-4">
        {/* Header with controls */}
        <div className={`${containerClass} ${borderClass} border rounded-lg shadow-lg overflow-hidden`}>
          {/* Title bar */}
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} px-4 py-3 flex items-center justify-between`}>
            <h2 className={`text-lg font-semibold ${textClass}`}>{title}</h2>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`${textClass} hover:opacity-70 transition-opacity`}
              aria-label={isExpanded ? 'Minimizar' : 'Maximizar'}
            >
              {isExpanded ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
            </button>
          </div>

          {/* Controls bar */}
          {isExpanded && (
            <div className={`${isDarkMode ? 'bg-gray-750' : 'bg-gray-100'} px-4 py-2 flex items-center gap-4 border-b ${borderClass}`}>
              {/* Font size controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={decreaseFontSize}
                  className={`${textClass} hover:opacity-70 transition-opacity p-1`}
                  aria-label="Disminuir tamaño de fuente"
                >
                  <FiMinus size={16} />
                </button>
                <span className={`${textClass} text-sm min-w-[3rem] text-center`}>
                  {fontSize}px
                </span>
                <button
                  onClick={increaseFontSize}
                  className={`${textClass} hover:opacity-70 transition-opacity p-1`}
                  aria-label="Aumentar tamaño de fuente"
                >
                  <FiPlus size={16} />
                </button>
              </div>

              <div className={`h-6 w-px ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />

              {/* Theme toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`${textClass} hover:opacity-70 transition-opacity flex items-center gap-2`}
                aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
                <span className="text-sm">{isDarkMode ? 'Claro' : 'Oscuro'}</span>
              </button>
            </div>
          )}

          {/* Text content */}
          {isExpanded && (
            <div className="p-6 overflow-auto max-h-[70vh]">
              <div
                className={`max-w-3xl mx-auto leading-relaxed ${textClass}`}
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: 'Georgia, "Times New Roman", Times, serif',
                  lineHeight: '1.8',
                }}
              >
                {text.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
