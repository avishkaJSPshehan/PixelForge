import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert HTML to PDF Online Free – Save Webpage as PDF | PixelForge',
  description:
    'Convert any HTML file or webpage to a PDF document online for free. Paste your HTML code and download a perfectly formatted PDF in seconds — no software needed.',
  keywords: [
    'convert HTML to PDF online free',
    'HTML file to PDF converter free',
    'save HTML page as PDF online',
    'html to pdf no installation required',
    'convert webpage HTML code to PDF',
    'generate PDF from HTML browser tool',
    'HTML to PDF free download online',
    'best online HTML to PDF converter',
    'create PDF from HTML code free',
    'convert local HTML file to PDF without software',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/html-to-pdf',
  },
  openGraph: {
    title: 'HTML to PDF Converter Free Online | PixelForge',
    description:
      'Convert HTML files or code to PDF instantly in your browser — free, no sign-up, no software needed.',
    url: 'https://www.pixel-forge.online/html-to-pdf',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function HtmlToPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
