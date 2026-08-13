'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PdfTextExtractor } from '@/services/PdfTextExtractor';
import { StorageService } from '@/services/StorageService';
import { FileProcessorFactory } from '@/services/FileProcessorFactory';
import { ProcessedFile } from '@/services/FileProcessorStrategy';
import { ViewerFactory } from '@/components/ViewerFactory';
import { ViewerProps } from '@/components/strategies/ViewerStrategy';

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [viewerFile, setViewerFile] = useState<File | null>(null);
  const [viewerType, setViewerType] = useState<'document' | 'html' | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ocrProgress, setOcrProgress] = useState<number>(0);

  useEffect(() => {
    loadStoredDocument();
  }, []);

  const loadStoredDocument = async () => {
    try {
      const stored = await StorageService.loadDocument();
      if (stored) {
        setPdfFile(stored.file);
        setExtractedText(stored.extractedText);
        
        // Use strategy pattern for stored document
        const strategy = FileProcessorFactory.getStrategy(stored.file);
        if (strategy) {
          // Special handling for PDF which needs extracted text from storage
          if (stored.file.type === 'application/pdf' || stored.file.name.endsWith('.pdf')) {
            const textBlob = new Blob([stored.extractedText], { type: 'text/markdown' });
            const textFileObj = new File([textBlob], `${stored.file.name.replace('.pdf', '')}.md`, { type: 'text/markdown' });
            setViewerFile(textFileObj);
            setViewerType('document');
            setExtractedText(stored.extractedText);
          } else {
            const processed = await strategy.processStored(stored.file);
            setExtractedText(processed.text);
            setViewerFile(processed.file);
            setViewerType(processed.viewer);
            setOriginalFileName(processed.originalFileName || '');
          }
        }
      }
    } catch (error) {
      console.error('Error loading stored document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type using factory
    if (!FileProcessorFactory.isValidFile(file)) {
      alert('Por favor sube un archivo PDF, TXT, RTF, DOC, DOCX o EPUB');
      return;
    }

    setPdfFile(file);
    setExtractedText('');
    setViewerFile(null);
    setViewerType(null);
    setOriginalFileName('');
    setIsExtracting(true);

    try {
      const strategy = FileProcessorFactory.getStrategy(file);
      if (!strategy) {
        throw new Error('No strategy found for file type');
      }

      let processed: ProcessedFile;
      
      // Special handling for PDF with OCR progress
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const text = await PdfTextExtractor.extractText(file, setOcrProgress);
        setExtractedText(text);
        const textBlob = new Blob([text], { type: 'text/markdown' });
        const textFileObj = new File([textBlob], `${file.name.replace('.pdf', '')}.md`, { type: 'text/markdown' });
        processed = { file: textFileObj, text, viewer: 'document' };
      } else {
        processed = await strategy.process(file);
        setExtractedText(processed.text);
      }

      // Set appropriate viewer
      setViewerFile(processed.file);
      setViewerType(processed.viewer);
      setOriginalFileName(processed.originalFileName || '');

      // Save to IndexedDB
      await StorageService.saveDocument(file, processed.text);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error al procesar el archivo');
    } finally {
      setIsExtracting(false);
      setOcrProgress(0);
    }
  };

  const handleClearStorage = async () => {
    await StorageService.clearDocuments();
    setPdfFile(null);
    setExtractedText('');
    setViewerFile(null);
    setViewerType(null);
    setOriginalFileName('');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative">
      {/* Botón flotante de carga - Solo cuando hay DocumentViewer o HtmlViewer activo */}
      <AnimatePresence>
        {(viewerFile) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 right-4 z-50"
          >
            <div className="flex gap-2">
              <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm shadow-lg">
                <span>Cargar archivo</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.rtf,.doc,.docx,.epub"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleClearStorage}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm shadow-lg"
                title="Limpiar almacenamiento"
              >
                Limpiar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DocumentView - Prioridad máxima */}
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex-1 bg-gray-800 rounded-lg p-8 text-center text-gray-300 flex items-center justify-center">
            <p className="text-lg">Cargando documento almacenado...</p>
          </div>
        ) : isExtracting ? (
          <div className="flex-1 bg-gray-800 rounded-lg p-8 text-center text-gray-300 flex flex-col items-center justify-center">
            <p className="text-lg mb-4">
              {ocrProgress > 0 
                ? `Procesando PDF con OCR... ${ocrProgress.toFixed(1)}%`
                : 'Extrayendo texto del PDF...'}
            </p>
            {ocrProgress > 0 && (
              <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewerFile && viewerType ? (() => {
              const strategy = ViewerFactory.getStrategy(viewerType);
              if (!strategy) return null;
              
              const viewerProps: ViewerProps = {
                file: viewerFile,
                extractedText,
                originalFileName
              };
              
              return (
                <motion.div
                  key={`${viewerType}-viewer`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex-1"
                >
                  {strategy.render(viewerProps)}
                </motion.div>
              );
            })() : (
              <motion.div
                key="welcome-screen"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex-1 bg-gray-800 rounded-lg p-8 text-center text-gray-300 flex items-center justify-center"
              >
                <div className="max-w-2xl">
                  <h2 className="text-2xl font-bold mb-4">JustReadPDF</h2>
                  <p className="text-lg mb-2">Sube un archivo PDF, TXT, RTF, DOC, DOCX o EPUB para ver su contenido</p>
                  <p className="text-sm mb-4">
                    El texto se muestra con formato preservado, listo para copiar y traducir
                  </p>
                  <div className="text-xs text-gray-400">
                    <p>• Extracción con formato preservado</p>
                    <p>• Sin imágenes pero con estructura</p>
                    <p>• Procesamiento 100% local</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Botones de carga - Debajo del panel - Solo cuando NO hay DocumentViewer ni HtmlViewer activo */}
      <AnimatePresence>
        {!viewerFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-gray-900 border-t border-gray-700"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
              <label className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-center">
                <span className="block text-sm md:text-base">Cargar archivo</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.rtf,.doc,.docx,.epub"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
