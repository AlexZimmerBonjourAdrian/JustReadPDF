import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Use - JustReadPDF',
  description: 'Terms of use for JustReadPDF, a free, local-first document reader.',
  alternates: { canonical: 'https://justreadpdf.netlify.app/terms' },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-[#e5e5e5] px-6 lg:px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl font-bold tracking-tight mb-6">Terms of Use</h1>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          JustReadPDF is provided free of charge, as-is, without warranties of any kind. By using the service
          you agree to these terms.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-3">Acceptable use</h2>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          You may use JustReadPDF to read and process documents you own or are authorized to use. You are
          responsible for the content you process.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-3">Limitation of liability</h2>
        <p className="text-[#9CA3AF] leading-relaxed mb-6">
          JustReadPDF is not liable for any loss or damage arising from the use of the service, including
          data loss or processing errors.
        </p>
        <div className="mt-10">
          <Link href="/" className="text-[#C0392B] hover:underline">← Back to JustReadPDF</Link>
        </div>
      </div>
    </main>
  );
}