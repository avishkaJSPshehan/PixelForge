import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Watermark to PDF Online Free – Text Watermark PDF | PixelForge',
  description:
    'Add a custom text watermark to your PDF documents online for free. Choose position, opacity, angle, and color. No sign-up, no file uploads to servers — fully browser-based.',
  keywords: [
    'add watermark to PDF online free',
    'text watermark PDF free no sign up',
    'how to add watermark to PDF document free',
    'PDF watermark tool online no upload',
    'stamp text on PDF pages free',
    'custom watermark PDF browser tool',
    'watermark PDF without Adobe Acrobat',
    'confidential watermark PDF online',
    'add diagonal text watermark PDF free',
    'secure PDF with watermark free tool',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/watermark-pdf',
  },
  openGraph: {
    title: 'Add Watermark to PDF Free Online | PixelForge',
    description:
      'Stamp custom text watermarks on PDF pages — free, instant, and 100% private. No Adobe Acrobat needed.',
    url: 'https://www.pixel-forge.online/watermark-pdf',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function WatermarkPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
