import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert PDF to Word Online Free – PDF to DOCX | PixelForge',
  description:
    'Convert PDF files to Word documents (.docx) online for free. Extract text from PDFs into structured paragraphs - no sign-up, no watermarks, 100% browser-based.',
  keywords: [
    'PDF to Word',
    'convert PDF to Word online free',
    'PDF to DOCX converter free no sign up',
    'extract text from PDF to Word free',
    'PDF to Word document converter online',
    'how to convert PDF to Word without software',
    'PDF to Word no watermark free tool',
    'turn PDF into Word online free',
    'extract data from PDF to Word browser',
    'free PDF to Word converter online no upload',
    'convert PDF table to Word document free',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/pdf-to-word',
  },
  openGraph: {
    title: 'PDF to Word Converter Free Online - PDF to DOCX | PixelForge',
    description:
      'Extract text from PDFs into Word documents - free, no sign-up, no watermarks. All processing in your browser.',
    url: 'https://www.pixel-forge.online/pdf-to-word',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function PdfToWordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
