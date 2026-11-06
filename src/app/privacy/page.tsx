import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - JustReadPDF',
  description: 'JustReadPDF does not collect, store or transmit your documents. All processing is local to your browser.',
  alternates: { canonical: 'https://justreadpdf.netlify.app/privacy' },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5] px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-6">Privacy Policy</h1>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          JustReadPDF processes your documents entirely in your browser. We do not upload, store, or transmit
          your files to any server.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-3">Data collection</h2>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          We do not collect personal data, account information, or document contents. Any document you open is
          kept in your browser's local storage (IndexedDB) on your own device and can be cleared at any time.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-3">Cookies and analytics</h2>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          This site may use basic, privacy-friendly analytics to understand aggregate usage. No tracking of
          document contents is performed.
        </p>
        <div className="mt-10">
          <Link href="/" className="text-[#C0392B] hover:underline">← Back to JustReadPDF</Link>
        </div>
      </div>
    </main>
  );
}