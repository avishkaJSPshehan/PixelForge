import type { Metadata } from 'next';
// @ts-ignore
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pixel-forge.online'),
  title: 'PixelForge – Free Online PDF & Image Converter',
  description: 'Convert PDF pages to high-quality images or combine multiple images into a single PDF. Free, fast, and 100% private — all processing happens in your browser.',
  keywords: ['PDF to image', 'image to PDF', 'PDF converter', 'PNG from PDF', 'free PDF tool', 'merge PDF', 'split PDF', 'word to PDF', 'pptx to PDF', 'watermark PDF', 'html to PDF'],
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
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
          <footer className="site-footer">
            <p>
              &copy; {new Date().getFullYear()} <span className="footer-brand">Bytebuilder</span>. All rights reserved.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
