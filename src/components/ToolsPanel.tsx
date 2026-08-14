'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PdfToImageConverterService } from '@/services/PdfToImageConverterService';
import { ReadingFormatterService, ReadingTheme, ReadingTypography } from '@/services/ReadingFormatterService';

interface ToolsPanelProps {
  pdfFile: File | null;
  extractedText: string;
  onPngConversionStart?: () => void;
  onPngConversionEnd?: () => void;
}

export default function ToolsPanel({ 
  pdfFile, 
  extractedText,
  onPngConversionStart,
  onPngConversionEnd 
}: ToolsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConvertingToPng, setIsConvertingToPng] = useState(false);
  const [pngProgress, setPngProgress] = useState(0);
  
  const [isFormattingReading, setIsFormattingReading] = useState(false);
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('dark');
  const [readingTypography, setReadingTypography] = useState<ReadingTypography>('serif');
  const [downloadFormat, setDownloadFormat] = useState<'html' | 'pdf'>('html');

  const handleConvertToPng = async () => {
    if (!pdfFile) return;

    setIsConvertingToPng(true);
    setPngProgress(0);
    onPngConversionStart?.();

    try {
      await PdfToImageConverterService.convertPdfToPngZip(pdfFile, setPngProgress);
    } catch (error) {
      console.error('Error converting PDF to PNG:', error);
      alert('Error al convertir PDF a PNG');
    } finally {
      setIsConvertingToPng(false);
      setPngProgress(0);
      onPngConversionEnd?.();
    }
  };

  const handleFormatReading = async () => {
    if (!extractedText || !pdfFile) return;

    setIsFormattingReading(true);

    try {
      const options = {
        theme: readingTheme,
        typography: readingTypography
      };

      if (downloadFormat === 'html') {
        await ReadingFormatterService.downloadAsHtml(extractedText, pdfFile.name, options);
      } else {
        await ReadingFormatterService.downloadAsPdf(extractedText, pdfFile.name, options);
      }
    } catch (error) {
      console.error('Error formatting for reading:', error);
      alert('Error al formatear para lectura');
    } finally {
      setIsFormattingReading(false);
    }
  };

  const themes = ReadingFormatterService.getAvailableThemes();
  const typographyOptions = ReadingFormatterService.getAvailableTypography();

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
        title="Herramientas secretas (Ctrl+Shift+P)"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-sm">Herramientas</span>
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
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Herramientas Secretas
            </h3>

            {/* Herramienta 1: PDF a PNG */}
            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <span className="text-lg">📷</span>
                  PDF a Imágenes PNG
                </h4>
                {isConvertingToPng && (
                  <span className="text-xs text-purple-400">{pngProgress.toFixed(1)}%</span>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-3">
                Convierte cada página del PDF en imagen PNG y descarga como ZIP
              </p>
              <button
                onClick={handleConvertToPng}
                disabled={!pdfFile || isConvertingToPng}
                className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConvertingToPng ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Convirtiendo...
                  </>
                ) : (
                  'Convertir a PNG'
                )}
              </button>
              {isConvertingToPng && (
                <div className="mt-2 h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${pngProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Herramienta 2: Formato de lectura */}
            <div className="p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <span className="text-lg">📖</span>
                  Formato de Lectura Cómoda
                </h4>
                {isFormattingReading && (
                  <span className="text-xs text-blue-400">Procesando...</span>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-3">
                Formatea el documento para lectura cómoda y descarga como HTML o PDF
              </p>

              <div className="space-y-3 mb-3">
                {/* Tema */}
                <div>
                  <label className="text-gray-300 text-xs block mb-1">Tema</label>
                  <select
                    value={readingTheme}
                    onChange={(e) => setReadingTheme(e.target.value as ReadingTheme)}
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {themes.map(theme => (
                      <option key={theme.value} value={theme.value}>
                        {theme.label} - {theme.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipografía */}
                <div>
                  <label className="text-gray-300 text-xs block mb-1">Tipografía</label>
                  <select
                    value={readingTypography}
                    onChange={(e) => setReadingTypography(e.target.value as ReadingTypography)}
                    className="w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {typographyOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} - {opt.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Formato de descarga */}
                <div>
                  <label className="text-gray-300 text-xs block mb-1">Formato de descarga</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDownloadFormat('html')}
                      className={`flex-1 px-2 py-1 rounded text-sm transition-colors ${
                        downloadFormat === 'html'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      HTML
                    </button>
                    <button
                      onClick={() => setDownloadFormat('pdf')}
                      className={`flex-1 px-2 py-1 rounded text-sm transition-colors ${
                        downloadFormat === 'pdf'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      PDF
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFormatReading}
                disabled={!extractedText || isFormattingReading}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isFormattingReading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  `Descargar como ${downloadFormat.toUpperCase()}`
                )}
              </button>
            </div>

            <div className="mt-3 text-xs text-gray-500 text-center">
              Atajo: Ctrl+Shift+P
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}