'use client';

import { useState } from 'react';
import { DocumentViewer } from '@shahajimbhosle/local-doc-viewer';
import '@shahajimbhosle/local-doc-viewer/style.css';
import { PdfTextExtractor } from '@/services/PdfTextExtractor';

export default function Home() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [textFile, setTextFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor sube un archivo PDF');
      return;
    }

    setPdfFile(file);
    setExtractedText('');
    setTextFile(null);
    setIsExtracting(true);

    try {
      const text = await PdfTextExtractor.extractPlainText(file);
      setExtractedText(text);
      
      // Crear archivo de texto para mostrar con DocumentViewer
      const textBlob = new Blob([text], { type: 'text/plain' });
      const textFileObj = new File([textBlob], `${file.name.replace('.pdf', '')}.txt`, { type: 'text/plain' });
      setTextFile(textFileObj);
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Error al extraer el texto del PDF');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* DocumentView - Prioridad máxima */}
      <div className="flex-1 flex flex-col">
        {isExtracting ? (
          <div className="flex-1 bg-gray-800 rounded-lg p-8 text-center text-gray-300 flex items-center justify-center">
            <p className="text-lg">Extrayendo texto del PDF...</p>
          </div>
        ) : textFile ? (
          <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600 flex-shrink-0">
              <h2 className="text-lg font-semibold text-white">
                {textFile.name}
              </h2>
              <p className="text-sm text-gray-300">
                Texto extraído del PDF - Sin imágenes
              </p>
            </div>
            <div className="flex-1 overflow-hidden">
              <DocumentViewer
                source={textFile}
                className="h-full"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-gray-800 rounded-lg p-8 text-center text-gray-300 flex items-center justify-center">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-4">JustReadPDF</h2>
              <p className="text-lg mb-2">Sube un archivo PDF para extraer su texto</p>
              <p className="text-sm mb-4">
                El texto se extrae sin imágenes, listo para copiar y traducir
              </p>
              <div className="text-xs text-gray-400">
                <p>• Extracción de texto plano</p>
                <p>• Sin imágenes ni formato complejo</p>
                <p>• Procesamiento 100% local</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de carga - Debajo del panel */}
      <div className="p-4 bg-gray-900 border-t border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <label className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-center">
            <span className="block text-sm md:text-base">Cargar PDF</span>
            <input
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
