import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert PDF to JPG PNG Images Online Free – High Resolution | PixelForge',
  description:
    'Convert PDF pages to high-quality JPG or PNG images online for free. Download every page as a separate image with no quality loss. Works entirely in your browser - no sign-up.',
  keywords: [
    'convert PDF to JPG online free high resolution',
    'PDF to image converter free no watermark',
    'PDF to PNG online without sign up',
    'extract images from PDF free',
    'convert PDF pages to pictures online',
    'best PDF to JPG converter online',
    'turn PDF into image free browser',
    'PDF to JPEG converter no email required',
    'download PDF pages as images free',
    'convert scanned PDF to image online',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/pdf-to-image',
  },
  openGraph: {
    title: 'PDF to JPG / PNG Converter Free Online – High Quality | PixelForge',
    description:
      'Convert PDF pages to crisp JPG or PNG images instantly. 100% free, no sign-up, no watermarks.',
    url: 'https://www.pixel-forge.online/pdf-to-image',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function PdfToImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
