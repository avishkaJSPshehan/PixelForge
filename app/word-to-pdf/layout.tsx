import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert Word to PDF Online Free – DOCX to PDF Instantly | PixelForge',
  description:
    'Convert Word DOCX documents to PDF online for free without losing formatting. Drag and drop your Word file and download a perfect PDF instantly - no Office installation needed.',
  keywords: [
    'convert Word to PDF online free',
    'DOCX to PDF converter free no sign up',
    'how to convert Word document to PDF for free',
    'Word to PDF without losing formatting',
    'doc to pdf free online no watermark',
    'microsoft word to PDF online converter',
    'convert .docx to .pdf free browser',
    'best Word to PDF tool online free',
    'free DOCX PDF converter no installation',
    'turn Word file into PDF without Microsoft Office',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/word-to-pdf',
  },
  openGraph: {
    title: 'Word to PDF Converter Free Online – DOCX to PDF | PixelForge',
    description:
      'Convert DOCX files to PDF in seconds - free, no sign-up, no watermarks, no formatting loss.',
    url: 'https://www.pixel-forge.online/word-to-pdf',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function WordToPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
