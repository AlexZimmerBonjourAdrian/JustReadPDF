import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About JustReadPDF - Private Document Reader',
  description: 'JustReadPDF is a 100% local, private document reader for PDF, TXT, RTF, DOC, DOCX and EPUB files. No uploads, no tracking.',
  alternates: { canonical: 'https://justreadpdf.netlify.app/about' },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5] px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-6">About JustReadPDF</h1>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          JustReadPDF is a single-purpose tool designed to make reading and translating long documents easier.
          It converts PDF, TXT, RTF, DOC, DOCX and EPUB files into clean, structured HTML while preserving
          formatting, lists, headings and paragraphs.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-3">100% local and private</h2>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          All processing happens in your browser. Your documents are never uploaded to any server, which means
          complete privacy for sensitive or confidential files.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-3">Key features</h2>
        <ul className="list-disc pl-6 space-y-2 text-[#9CA3AF]">
          <li>Preserved formatting (bold, italics, headings, lists)</li>
          <li>Integrated search within documents</li>
          <li>Dark mode interface</li>
          <li>OCR support for scanned PDFs</li>
          <li>Ready to translate with Google Translate</li>
        </ul>
        <h2 className="text-2xl font-semibold mt-8 mb-3">About the creator</h2>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          JustReadPDF is built by an independent developer focused on privacy-first, local-first tools.
          The project is open to feedback and continuous improvement.
        </p>
        <div className="mt-10">
          <Link href="/" className="text-[#C0392B] hover:underline">← Back to JustReadPDF</Link>
        </div>
      </div>
    </main>
  );
}