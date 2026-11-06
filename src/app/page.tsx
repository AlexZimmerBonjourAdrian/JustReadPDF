import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'JustReadPDF - Private PDF, TXT & RTF Reader | 100% Local',
  description: 'Read PDF, TXT, RTF, DOC, DOCX and EPUB documents with preserved formatting. Search within documents, dark mode, 100% local and private processing. No file uploads.',
  alternates: { canonical: 'https://justreadpdf.netlify.app/' },
};

export default function HomePage() {
  return (
    <>
      <HomeClient />
      <section className="bg-[#0f0f0f] text-[#9CA3AF] px-6 lg:px-8 py-12 border-t border-[#2A2E33]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-4">Why JustReadPDF?</h2>
          <p className="leading-relaxed mb-4 max-w-[70ch]">
            JustReadPDF is a private, local-first document reader. It converts PDF, TXT, RTF, DOC, DOCX and
            EPUB files into clean, structured HTML while preserving headings, lists and paragraphs. Everything
            runs in your browser, so your documents never leave your device.
          </p>
          <p className="leading-relaxed mb-6 max-w-[70ch]">
            Ideal for reading long documents, searching within them and translating with Google Translate without
            losing formatting.
          </p>
          <nav className="flex flex-wrap gap-4 text-[12px]">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </nav>
        </div>
      </section>
    </>
  );
}