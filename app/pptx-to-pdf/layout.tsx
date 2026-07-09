import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert PowerPoint to PDF Online Free – PPTX to PDF | PixelForge',
  description:
    'Convert PowerPoint PPTX presentations to PDF online for free. Preserve all slides, animations layout, and fonts — download your PDF instantly without Microsoft Office.',
  keywords: [
    'convert PowerPoint to PDF online free',
    'PPTX to PDF converter free no sign up',
    'how to convert PowerPoint presentation to PDF',
    'PowerPoint to PDF without losing formatting',
    'pptx to pdf free no watermark',
    'presentation to PDF online converter free',
    'save PowerPoint as PDF online free',
    'convert slides to PDF free browser',
    'best PPTX to PDF converter online',
    'turn PowerPoint into PDF without Microsoft Office',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/pptx-to-pdf',
  },
  openGraph: {
    title: 'PowerPoint to PDF Converter Free Online – PPTX to PDF | PixelForge',
    description:
      'Convert PPTX presentations to PDF instantly — free, no sign-up, all slides preserved.',
    url: 'https://www.pixel-forge.online/pptx-to-pdf',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function PptxToPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
