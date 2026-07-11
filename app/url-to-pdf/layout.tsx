import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert URL to PDF Online Free – Save Any Webpage as PDF | PixelForge',
  description:
    'Convert any website URL or webpage to a PDF file online for free. Paste a link and download the full-page PDF instantly - no browser extension or software needed.',
  keywords: [
    'convert URL to PDF online free',
    'save webpage as PDF from link',
    'website to PDF converter free online',
    'download any webpage as PDF free',
    'URL to PDF no extension needed',
    'convert web page link to PDF browser tool',
    'save URL as PDF online without software',
    'webpage to PDF free no sign up',
    'online URL PDF generator free',
    'convert any website page to PDF file free',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/url-to-pdf',
  },
  openGraph: {
    title: 'URL to PDF Converter Free Online – Save Any Webpage as PDF | PixelForge',
    description:
      'Paste any URL and download the webpage as a PDF instantly. Free, no sign-up, no browser extension.',
    url: 'https://www.pixel-forge.online/url-to-pdf',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function UrlToPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
