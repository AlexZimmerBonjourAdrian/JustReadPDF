import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ - JustReadPDF',
  description: 'Frequently asked questions about JustReadPDF: supported formats, privacy, OCR and translation.',
  alternates: { canonical: 'https://justreadpdf.netlify.app/faq' },
};

const faqs = [
  {
    q: 'Which file formats does JustReadPDF support?',
    a: 'PDF, TXT, RTF, DOC, DOCX and EPUB. Files are processed locally in your browser.',
  },
  {
    q: 'Are my documents uploaded to a server?',
    a: 'No. All processing happens in your browser. Your documents never leave your device.',
  },
  {
    q: 'Can I translate documents while keeping the format?',
    a: 'Yes. JustReadPDF extracts text into structured HTML, making it easy to translate with Google Translate while preserving headings, lists and paragraphs.',
  },
  {
    q: 'Does it work with scanned PDFs?',
    a: 'Yes, via built-in OCR for scanned PDFs. OCR runs locally and may take longer for large files.',
  },
  {
    q: 'Is there a file size limit?',
    a: 'Files up to 50 MB are supported, depending on your device memory.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5] px-6 lg:px-8 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-6">Frequently Asked Questions</h1>
        <div className="space-y-6">
          {faqs.map((f) => (
            <div key={f.q} className="border-b border-[#2A2E33] pb-6">
              <h2 className="text-xl font-semibold mb-2">{f.q}</h2>
              <p className="text-[#9CA3AF] leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link href="/" className="text-[#C0392B] hover:underline">← Back to JustReadPDF</Link>
        </div>
      </div>
    </main>
  );
}