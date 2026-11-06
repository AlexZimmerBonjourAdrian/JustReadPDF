import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to translate a PDF while preserving its format - JustReadPDF Blog',
  description: 'Translate PDF documents to HTML for easy translation while keeping structure and formatting.',
  alternates: { canonical: 'https://justreadpdf.netlify.app/blog/translate-pdf-preserving-format' },
};

export default function Article() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5] px-6 lg:px-8 py-16">
      <article className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-4">
          How to translate a PDF while preserving its format
        </h1>
        <p className="text-[11px] text-[#6B7280] uppercase tracking-[0.08em] mb-8">Published 2026-11-05 · Last updated 2026-11-05</p>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          Translating a PDF directly often breaks its layout. Converting it to structured HTML first keeps
          headings, lists and paragraphs intact, making translation with tools like Google Translate much
          easier.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-3">Why HTML helps</h2>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          HTML preserves semantic structure. Translating HTML instead of raw PDF text avoids losing bold,
          italics and list formatting.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-3">A private workflow</h2>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          With JustReadPDF, the conversion happens locally in your browser. No files are uploaded, so you can
          translate sensitive documents safely.
        </p>
        <div className="mt-10">
          <Link href="/blog" className="text-[#C0392B] hover:underline">← Back to blog</Link>
        </div>
      </article>
    </main>
  );
}