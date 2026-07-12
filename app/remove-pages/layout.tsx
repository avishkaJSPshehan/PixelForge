import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remove PDF Pages Online Free – Delete Pages from PDF | PixelForge',
  description:
    'Easily remove pages from your PDF documents online for free. Delete blank or unwanted pages instantly - no sign-up, no watermarks, 100% browser-based privacy.',
  keywords: [
    'remove PDF pages',
    'delete pages from PDF',
    'remove pages from PDF free',
    'delete PDF pages online',
    'remove blank pages PDF',
    'PDF page remover online free no sign up',
    'extract pages from PDF by deleting',
    'PDF page deletion tool free',
    'remove pages from PDF document browser',
    'free PDF page remover no upload',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/remove-pages',
  },
  openGraph: {
    title: 'Remove PDF Pages Free Online - Delete PDF Pages | PixelForge',
    description:
      'Delete unwanted pages from your PDFs - free, no sign-up, no watermarks. All processing in your browser ensures 100% privacy.',
    url: 'https://www.pixel-forge.online/remove-pages',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function RemovePagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
