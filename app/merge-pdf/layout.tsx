import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merge PDF Files Online Free – Combine Multiple PDFs into One | PixelForge',
  description:
    'Merge multiple PDF files into one document online for free. No sign-up, no installation required. Drag and drop your PDFs and combine them instantly in your browser.',
  keywords: [
    'merge PDF files online free',
    'combine multiple PDF files into one',
    'merge PDF no sign up',
    'how to merge PDF documents online',
    'join PDF files free no watermark',
    'PDF merge tool browser based',
    'online PDF combiner free',
    'combine PDF pages free',
    'free PDF joiner tool',
    'merge PDF without uploading to server',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/merge-pdf',
  },
  openGraph: {
    title: 'Merge PDF Files Online Free – Combine PDFs Instantly | PixelForge',
    description:
      'Combine multiple PDF files into one instantly - free, fast, and 100% private. All processing happens in your browser.',
    url: 'https://www.pixel-forge.online/merge-pdf',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function MergePdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
