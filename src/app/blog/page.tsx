import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog - JustReadPDF',
  description: 'Articles about reading, translating and processing documents privately in your browser.',
  alternates: { canonical: 'https://justreadpdf.netlify.app/blog' },
};

const posts = [
  {
    slug: 'how-to-read-long-pdfs',
    title: 'How to read long PDFs without losing formatting',
    description: 'Tips for reading and navigating long PDF documents while preserving structure.',
    date: '2026-11-05',
  },
  {
    slug: 'translate-pdf-preserving-format',
    title: 'How to translate a PDF while preserving its format',
    description: 'A practical guide to translating PDFs to HTML for easy translation.',
    date: '2026-11-05',
  },
];

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5] px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-6">Blog</h1>
        <p className="text-[#9CA3AF] leading-relaxed mb-10">
          Guides and tips for reading, translating and processing documents privately in your browser.
        </p>
        <div className="space-y-8">
          {posts.map((p) => (
            <article key={p.slug} className="border-b border-[#2A2E33] pb-6">
              <h2 className="text-2xl font-semibold mb-2">
                <Link href={`/blog/${p.slug}`} className="hover:text-[#C0392B] transition-colors">
                  {p.title}
                </Link>
              </h2>
              <p className="text-[#9CA3AF] leading-relaxed mb-2">{p.description}</p>
              <p className="text-[11px] text-[#6B7280] uppercase tracking-[0.08em]">Published {p.date}</p>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <Link href="/" className="text-[#C0392B] hover:underline">← Back to JustReadPDF</Link>
        </div>
      </div>
    </main>
  );
}