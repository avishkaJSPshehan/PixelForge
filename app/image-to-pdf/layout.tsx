import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert Images to PDF Online Free – JPG PNG to PDF | PixelForge',
  description:
    'Convert multiple JPG, PNG, or other images into a single PDF file online for free. Reorder pages, adjust layout, and download instantly — no installation, no sign-up required.',
  keywords: [
    'convert images to PDF online free',
    'turn multiple JPG into one PDF',
    'PNG to PDF converter free no watermark',
    'combine photos into PDF online',
    'JPG to PDF free no email required',
    'how to convert image to PDF on PC free',
    'multiple images to PDF in one click',
    'image to PDF converter browser based',
    'make PDF from pictures free',
    'convert screenshots to PDF free online',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/image-to-pdf',
  },
  openGraph: {
    title: 'Image to PDF Converter Free Online – JPG PNG to PDF | PixelForge',
    description:
      'Turn multiple photos or screenshots into a single PDF in seconds. Free, private, and no sign-up required.',
    url: 'https://www.pixel-forge.online/image-to-pdf',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function ImageToPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
