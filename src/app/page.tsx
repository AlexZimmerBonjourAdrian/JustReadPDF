'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PdfTextExtractor } from '@/services/PdfTextExtractor';
import { TxtViewerService } from '@/services/TxtViewerService';
import { RtfViewerService } from '@/services/RtfViewerService';
import DocumentViewer from '@/components/DocumentViewer';

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [textFile, setTextFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isTxt = TxtViewerService.isValidTxtFile(file);
    const isRtf = RtfViewerService.isValidRtfFile(file);

    if (!isPdf && !isTxt && !isRtf) {
      alert('Por favor sube un archivo PDF, TXT o RTF');
      return;
    }

    setPdfFile(file);
    setExtractedText('');
    setTextFile(null);
    setIsExtracting(true);

    try {
      if (isPdf) {
        // Procesar PDF
        const text = await PdfTextExtractor.extractText(file);
        setExtractedText(text);
        
        // Crear archivo markdown para mostrar con DocumentViewer (preserva formato)
        const textBlob = new Blob([text], { type: 'text/markdown' });
        const textFileObj = new File([textBlob], `${file.name.replace('.pdf', '')}.md`, { type: 'text/markdown' });
        setTextFile(textFileObj);
      } else if (isTxt) {
        // Procesar TXT - leer contenido y crear archivo para el viewer
        const text = await TxtViewerService.readTxtFile(file);
        setExtractedText(text);
        
        // Crear archivo para mostrar con DocumentViewer
        const textBlob = new Blob([text], { type: 'text/plain' });
        const textFileObj = new File([textBlob], file.name, { type: 'text/plain' });
        setTextFile(textFileObj);
      } else if (isRtf) {
        // Procesar RTF - el DocViewer puede mostrar RTF directamente
        const rtfFile = await RtfViewerService.readRtfFile(file);
        setTextFile(rtfFile);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error al procesar el archivo');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative">
      {/* Botón flotante de carga - Solo cuando hay DocumentViewer activo */}
      <AnimatePresence>
        {textFile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 right-4 z-50"
          >
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm shadow-lg">
              <span>Cargar archivo</span>
              <input
                type="file"
                accept=".pdf,.txt,.rtf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DocumentView - Prioridad máxima */}
      <div className="flex-1 flex flex-col">
        {isExtracting ? (
          <div className="flex-1 bg-gray-800 rounded-lg p-8 text-center text-gray-300 flex items-center justify-center">
            <p className="text-lg">Extrayendo texto del PDF...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {textFile ? (
              <motion.div
                key="document-viewer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex-1"
              >
                <DocumentViewer textFile={textFile} />
              </motion.div>
            ) : (
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
                  <p className="text-lg mb-2">Sube un archivo PDF, TXT o RTF para ver su contenido</p>
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

      {/* Botones de carga - Debajo del panel - Solo cuando NO hay DocumentViewer activo */}
      <AnimatePresence>
        {!textFile && (
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
                  accept=".pdf,.txt,.rtf"
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
