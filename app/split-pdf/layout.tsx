import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Split PDF Online Free – Extract Pages from PDF Without Software | PixelForge',
  description:
    'Split a PDF into individual pages or extract specific page ranges online for free. No watermarks, no email required — instant results processed entirely in your browser.',
  keywords: [
    'split PDF online free',
    'extract pages from PDF without software',
    'how to split a PDF file into separate pages',
    'PDF page extractor free online',
    'split PDF by page range online',
    'separate PDF pages online no sign up',
    'PDF splitter tool free browser',
    'divide PDF into multiple files',
    'extract specific pages from PDF online',
    'split large PDF into smaller files free',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/split-pdf',
  },
  openGraph: {
    title: 'Split PDF Online Free – Extract Pages Instantly | PixelForge',
    description:
      'Split or extract pages from any PDF instantly for free. Works entirely in your browser — no uploads, no sign-up.',
    url: 'https://www.pixel-forge.online/split-pdf',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function SplitPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
