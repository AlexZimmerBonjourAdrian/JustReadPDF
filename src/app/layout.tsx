import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JustReadPDF - PDF, TXT & RTF Reader with Search | 100% Local Processing",
  description: "Read PDF, TXT and RTF documents with preserved formatting. Search within documents, dark mode, 100% local and private processing. No file uploads to servers.",
  keywords: ["PDF reader", "read PDF", "PDF viewer", "TXT reader", "RTF reader", "document search", "local document reader", "document privacy", "dark mode PDF", "JustReadPDF"],
  authors: [{ name: "JustReadPDF" }],
  creator: "JustReadPDF",
  publisher: "JustReadPDF",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://justreadpdf.netlify.app'),
  alternates: {
    canonical: 'https://justreadpdf.netlify.app',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://justreadpdf.netlify.app",
    title: "JustReadPDF - Private & Local Document Reader",
    description: "Read PDF, TXT and RTF with preserved formatting. Integrated search, dark mode and 100% private.",
    siteName: "JustReadPDF",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JustReadPDF - Private Document Reader",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JustReadPDF - Private Document Reader",
    description: "Read PDF, TXT and RTF with preserved formatting. Integrated search and 100% private.",
    images: ["/twitter-image.png"],
    creator: "@justreadpdf",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = [
    {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'JustReadPDF',
    alternateName: ['JustReadPDF - PDF Reader', 'JustReadPDF - Document Reader'],
    description: 'Read PDF, TXT and RTF documents with preserved formatting. Integrated search, dark mode, and 100% local processing for complete privacy.',
    url: 'https://justreadpdf.netlify.app',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'PDF file reading',
      'TXT file reading',
      'RTF file reading',
      'Document search functionality',
      'Dark mode interface',
      '100% local processing',
      'Complete privacy',
      'Preserved formatting',
    ],
    browserRequirements: 'Requires JavaScript. Compatible with modern browsers.',
    inLanguage: ['en', 'es'],
    audience: {
      '@type': 'Audience',
      audienceType: 'General users',
    },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'JustReadPDF',
      url: 'https://justreadpdf.netlify.app',
      logo: 'https://justreadpdf.netlify.app/Icon/ajuste_avatar_Documents-3.png',
      sameAs: [],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://justreadpdf.netlify.app',
        },
      ],
    },
  ];

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://justreadpdf.netlify.app" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0f0f0f" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
