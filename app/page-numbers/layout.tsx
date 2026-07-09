import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Page Numbers to PDF Online Free – Stamp Pages Instantly | PixelForge',
  description:
    'Add page numbers to any PDF document online for free. Choose position (top, bottom, left, right), start number, font size, and color. Fully browser-based — no sign-up required.',
  keywords: [
    'add page numbers to PDF online free',
    'stamp page numbers on PDF free',
    'insert page numbers in PDF without Acrobat',
    'how to add page numbers to PDF document free',
    'number PDF pages free online tool',
    'PDF page numbering tool no sign up',
    'add footer page number to PDF free',
    'page number position in PDF online',
    'free tool to add sequential page numbers PDF',
    'add custom page numbers to PDF browser based',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/page-numbers',
  },
  openGraph: {
    title: 'Add Page Numbers to PDF Free Online | PixelForge',
    description:
      'Stamp custom page numbers at any position on your PDF pages — free, instant, no Adobe Acrobat.',
    url: 'https://www.pixel-forge.online/page-numbers',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function PageNumbersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
