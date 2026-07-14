import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compress PDF Online Free – Reduce PDF Size | PixelForge',
  description:
    'Compress PDF files online for free and reduce PDF file size instantly. No sign-up, no watermarks, 100% browser-based. Your files never leave your device.',
  keywords: [
    'compress PDF online free',
    'reduce PDF size',
    'PDF compressor free',
    'compress PDF file size online',
    'PDF file size reducer',
    'make PDF smaller online free',
    'PDF compression tool no sign up',
    'compress PDF without losing quality',
    'shrink PDF online free',
    'PDF optimizer free browser',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/compress-pdf',
  },
  openGraph: {
    title: 'Compress PDF Online Free – Reduce PDF Size | PixelForge',
    description:
      'Reduce your PDF file size online for free. No uploads, no sign-up, 100% private browser-based compression.',
    url: 'https://www.pixel-forge.online/compress-pdf',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function CompressPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
