import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Password Protect Online Free – Encrypt PDF | PixelForge',
  description:
    'Add password protection to your PDF files online for free. Encrypt your PDF with a password instantly — no sign-up, no watermarks, 100% browser-based. Files never leave your device.',
  keywords: [
    'PDF password protect online free',
    'encrypt PDF with password',
    'add password to PDF free',
    'PDF password protection tool',
    'lock PDF with password online',
    'secure PDF online free',
    'PDF encryption online no upload',
    'password protect PDF browser',
    'add password to PDF without Adobe',
    'free PDF password tool',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/protect-pdf',
  },
  openGraph: {
    title: 'PDF Password Protect Online Free – Encrypt PDF | PixelForge',
    description:
      'Protect your PDF with a password for free. Encrypt PDFs instantly in your browser — no uploads, no sign-up.',
    url: 'https://www.pixel-forge.online/protect-pdf',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function ProtectPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
