'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PdfTextExtractor } from '@/services/PdfTextExtractor';
import { TxtViewerService } from '@/services/TxtViewerService';
import { RtfViewerService } from '@/services/RtfViewerService';
import { DocxViewerService } from '@/services/DocxViewerService';
import { EpubViewerService } from '@/services/EpubViewerService';
import { StorageService } from '@/services/StorageService';
import DocumentViewer from '@/components/DocumentViewer';

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [textFile, setTextFile] = useState<File | null>(null);
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
        
        // Recrear el archivo formateado según el tipo
        const isPdf = stored.file.type === 'application/pdf' || stored.file.name.endsWith('.pdf');
        const isTxt = TxtViewerService.isValidTxtFile(stored.file);
        const isRtf = RtfViewerService.isValidRtfFile(stored.file);
        const isDocx = DocxViewerService.isValidDocxFile(stored.file);
        const isEpub = EpubViewerService.isValidEpubFile(stored.file);

        if (isPdf) {
          const textBlob = new Blob([stored.extractedText], { type: 'text/markdown' });
          const textFileObj = new File([textBlob], `${stored.file.name.replace('.pdf', '')}.md`, { type: 'text/markdown' });
          setTextFile(textFileObj);
        } else if (isTxt) {
          const textFile = await TxtViewerService.readTxtFile(stored.file);
          setExtractedText(await textFile.text());
          setTextFile(textFile);
        } else if (isRtf) {
          const rtfFile = await RtfViewerService.readRtfFile(stored.file);
          setExtractedText(await rtfFile.text());
          setTextFile(rtfFile);
        } else if (isDocx) {
          const docxFile = await DocxViewerService.readDocxFile(stored.file);
          setExtractedText(await docxFile.text());
          setTextFile(docxFile);
        } else if (isEpub) {
          const epubFile = await EpubViewerService.readEpubFile(stored.file);
          setExtractedText(await epubFile.text());
          setTextFile(epubFile);
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

    // Validar tipo de archivo
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isTxt = TxtViewerService.isValidTxtFile(file);
    const isRtf = RtfViewerService.isValidRtfFile(file);
    const isDocx = DocxViewerService.isValidDocxFile(file);
    const isEpub = EpubViewerService.isValidEpubFile(file);

    if (!isPdf && !isTxt && !isRtf && !isDocx && !isEpub) {
      alert('Por favor sube un archivo PDF, TXT, RTF, DOCX o EPUB');
      return;
    }

    setPdfFile(file);
    setExtractedText('');
    setTextFile(null);
    setIsExtracting(true);

    try {
      if (isPdf) {
        // Procesar PDF
        const text = await PdfTextExtractor.extractText(file, setOcrProgress);
        setExtractedText(text);
        
        // Crear archivo markdown para mostrar con DocumentViewer (preserva formato)
        const textBlob = new Blob([text], { type: 'text/markdown' });
        const textFileObj = new File([textBlob], `${file.name.replace('.pdf', '')}.md`, { type: 'text/markdown' });
        setTextFile(textFileObj);
        // Guardar en IndexedDB
        await StorageService.saveDocument(file, text);
      } else if (isTxt) {
        // Procesar TXT - el servicio ya devuelve un archivo formateado
        const textFile = await TxtViewerService.readTxtFile(file);
        // Leer el texto para búsqueda
        const text = await textFile.text();
        setExtractedText(text);
        setTextFile(textFile);
        // Guardar en IndexedDB
        await StorageService.saveDocument(file, text);
      } else if (isRtf) {
        // Procesar RTF - el DocViewer puede mostrar RTF directamente
        const rtfFile = await RtfViewerService.readRtfFile(file);
        // Leer el texto para búsqueda
        const text = await rtfFile.text();
        setExtractedText(text);
        setTextFile(rtfFile);
        // Guardar en IndexedDB
        await StorageService.saveDocument(file, text);
      } else if (isDocx) {
        // Procesar DOCX
        const docxFile = await DocxViewerService.readDocxFile(file);
        const text = await docxFile.text();
        setExtractedText(text);
        setTextFile(docxFile);
        // Guardar en IndexedDB
        await StorageService.saveDocument(file, text);
      } else if (isEpub) {
        // Procesar EPUB
        const epubFile = await EpubViewerService.readEpubFile(file);
        const text = await epubFile.text();
        setExtractedText(text);
        setTextFile(epubFile);
        // Guardar en IndexedDB
        await StorageService.saveDocument(file, text);
      }
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
    setTextFile(null);
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
            <div className="flex gap-2">
              <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm shadow-lg">
                <span>Cargar archivo</span>
                <input
                  type="file"
                  accept=".pdf,.txt,.rtf,.docx,.epub"
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
            {textFile ? (
              <motion.div
                key="document-viewer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex-1"
              >
                <DocumentViewer textFile={textFile} extractedText={extractedText} />
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
                  <p className="text-lg mb-2">Sube un archivo PDF, TXT, RTF, DOCX o EPUB para ver su contenido</p>
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
                  accept=".pdf,.txt,.rtf,.docx,.epub"
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
