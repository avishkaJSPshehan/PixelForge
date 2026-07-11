import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Convert Excel to PDF Online Free – XLSX to PDF Instantly | PixelForge',
  description:
    'Convert Excel spreadsheets (.xlsx, .xls) to PDF online for free. All sheets are included, no sign-up, no watermarks, fully browser-based - your files never leave your device.',
  keywords: [
    'convert Excel to PDF online free',
    'XLSX to PDF converter free no sign up',
    'how to convert Excel spreadsheet to PDF',
    'Excel to PDF without losing formatting',
    'xls to pdf free no watermark',
    'turn Excel file into PDF online',
    'spreadsheet to PDF converter free browser',
    'convert Excel to PDF without Microsoft Office',
    'free xlsx pdf converter online',
    'save Excel as PDF online free tool',
  ],
  alternates: {
    canonical: 'https://www.pixel-forge.online/excel-to-pdf',
  },
  openGraph: {
    title: 'Excel to PDF Converter Free Online – XLSX to PDF | PixelForge',
    description:
      'Convert Excel files to PDF instantly - free, no sign-up, no watermarks. All sheets included.',
    url: 'https://www.pixel-forge.online/excel-to-pdf',
    siteName: 'PixelForge',
    type: 'website',
  },
};

export default function ExcelToPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
