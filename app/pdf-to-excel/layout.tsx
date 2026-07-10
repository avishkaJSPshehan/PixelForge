import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert PDF to Excel Online Free – PDF to XLSX | PixelForge',
  description:
    'Convert PDF files to Excel spreadsheets (.xlsx) online for free. Extract tables and text from PDFs into structured rows and columns — no sign-up, no watermarks, 100% browser-based.',
  keywords: [
    'convert PDF to Excel online free',
    'PDF to XLSX converter free no sign up',
    'extract tables from PDF to Excel free',
    'PDF to spreadsheet converter online',
    'how to convert PDF to Excel without software',
    'PDF to Excel no watermark free tool',
    'turn PDF into Excel online free',
    'extract data from PDF to Excel browser',
    'free PDF to Excel converter online no upload',
    'convert PDF table to Excel spreadsheet free',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/pdf-to-excel',
  },
  openGraph: {
    title: 'PDF to Excel Converter Free Online – PDF to XLSX | PixelForge',
    description:
      'Extract text and tables from PDFs into Excel spreadsheets — free, no sign-up, no watermarks. All processing in your browser.',
    url: 'https://www.pixel-forge.online/pdf-to-excel',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function PdfToExcelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
