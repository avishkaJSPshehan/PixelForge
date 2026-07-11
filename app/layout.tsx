import type { Metadata } from 'next';
import Footer from '@/components/Footer';
// @ts-ignore
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pixel-forge.online'),
  title: 'PixelForge – Free Online PDF Tools | Merge, Split, Convert & Edit PDFs',
  description:
    'PixelForge offers 100% free online PDF tools - merge PDF, split PDF, convert PDF to JPG, Word to PDF, PowerPoint to PDF, HTML to PDF, add watermarks, page numbers and more. No sign-up, no file uploads to servers, all processing in your browser.',
  keywords: [
    // High-volume exact-match PDF converter queries
    'PDF converter online free',
    'pdf converter online free',
    'PDF converter to PDF',
    'PDF converter Word to PDF',
    'free PDF converter online',
    'convert PDF online free',
    // Site-wide broad + long-tail
    'free online PDF tools no sign up',
    'best free PDF converter website',
    'online PDF editor free no watermark',
    'free PDF tools browser based no upload',
    'all in one PDF tool free online',
    'online PDF toolkit free and private',
    // Merge
    'merge PDF files online free',
    'combine multiple PDF into one free',
    // Split
    'split PDF pages online free',
    'extract pages from PDF online free',
    // Convert
    'convert PDF to JPG online free high resolution',
    'JPG PNG images to PDF free online',
    'Word DOCX to PDF online free',
    'PowerPoint PPTX to PDF free online',
    'HTML to PDF converter free browser',
    'URL webpage to PDF free online',
    'Excel XLSX to PDF online free',
    'PDF to Excel converter online free',
    // Watermark / Page numbers
    'add watermark to PDF online free',
    'add page numbers to PDF free',
    // Trust signals
    'PDF tools no file upload private secure',
    'free PDF tool without Adobe Acrobat',
  ],

  alternates: {
    canonical: 'https://www.pixel-forge.online/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: 'PixelForge – Free Online PDF Tools | No Sign-Up, No Watermarks',
    description:
      'Merge, split, convert, watermark, and number PDF pages - completely free, instant, and 100% private. All processing happens in your browser.',
    url: 'https://www.pixel-forge.online/',
    siteName: 'PixelForge',
    type: 'website',
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="site-wrapper">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
