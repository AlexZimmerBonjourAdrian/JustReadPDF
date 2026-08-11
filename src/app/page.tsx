'use client';

import { useState } from 'react';
import { DocumentViewer } from '@shahajimbhosle/local-doc-viewer';
import '@shahajimbhosle/local-doc-viewer/style.css';
import { convert } from '@pdf2md/core';

export default function Home() {
  const [markdownFile, setMarkdownFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Por favor sube un archivo PDF');
      return;
    }

    setLoading(true);
    setError(null);
    setPdfFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await convert(arrayBuffer, {
        includeMetadata: true,
      });

      // @ts-ignore - convert returns ConversionResult which has content property
      const markdown = (result as any).content || (result as any).markdown || String(result);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const mdFile = new File([blob], `${file.name.replace('.pdf', '')}.md`, { type: 'text/markdown' });
      setMarkdownFile(mdFile);
    } catch (err) {
      setError('Error al procesar el PDF: ' + (err as Error).message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">JustReadPDF - PDF a Markdown con Formato</h1>
          <div className="flex items-center gap-4">
            <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer">
              <span>Cargar PDF</span>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-300">
            <p className="text-lg mb-2">Procesando PDF...</p>
            <p className="text-sm">Extrayendo texto con formato (negritas, cursivas, estructura)</p>
          </div>
        )}

        {markdownFile && !loading && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
              <h2 className="text-lg font-semibold text-white">
                {pdfFile?.name} → Markdown con formato
              </h2>
              <p className="text-sm text-gray-300">
                El texto mantiene negritas, cursivas, headings (H1-H6), listas y estructura original
              </p>
            </div>
            <DocumentViewer
              source={markdownFile}
              height="70vh"
              className="rounded-lg overflow-hidden"
            />
          </div>
        )}

        {!markdownFile && !loading && (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-300">
            <p className="text-lg mb-2">Sube un archivo PDF para extraer su texto con formato</p>
            <p className="text-sm mb-4">
              La conversión mantiene: negritas, cursivas, headings (H1-H6), listas, párrafos
            </p>
            <div className="text-xs text-gray-400">
              <p>• Procesamiento 100% local (sin servidor)</p>
              <p>• Detección automática de estructura</p>
              <p>• Markdown limpio y semántico</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
