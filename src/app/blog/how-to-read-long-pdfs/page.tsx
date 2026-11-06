import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to read long PDFs without losing formatting - JustReadPDF Blog',
  description: 'Practical tips for reading and navigating long PDF documents while preserving structure and formatting.',
  alternates: { canonical: 'https://justreadpdf.netlify.app/blog/how-to-read-long-pdfs' },
};

export default function Article() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5] px-6 lg:px-8 py-16">
      <article className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-4">
          How to read long PDFs without losing formatting
        </h1>
        <p className="text-[11px] text-[#6B7280] uppercase tracking-[0.08em] mb-8">Published 2026-11-05 · Last updated 2026-11-05</p>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          Long PDFs can be hard to read, especially when you need to translate or extract text. Preserving
          headings, lists and paragraphs makes the content easier to scan and reuse.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-3">Use a local reader</h2>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          A local-first reader processes the file in your browser, keeping your documents private and avoiding
          upload limits. JustReadPDF converts PDFs into structured HTML so you can read comfortably and search
          within the text.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-3">Keep structure intact</h2>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          Headings, bold text, italics and lists carry meaning. Preserving them helps you understand the
          document and makes translation far easier.
        </p>
        <div className="mt-10">
          <Link href="/blog" className="text-[#C0392B] hover:underline">← Back to blog</Link>
        </div>
      </article>
    </main>
  );
}