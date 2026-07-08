import Navbar from '@/components/Navbar';
import Link from 'next/link';

const tools = [
  {
    href: '/merge-pdf',
    id: 'home-card-merge-pdf',
    icon: '🔗',
    iconBg: 'tool-icon-red',
    title: 'Merge PDF',
    description: 'Combine PDFs in the order you want with the easiest PDF merger available.',
  },
  {
    href: '/split-pdf',
    id: 'home-card-split-pdf',
    icon: '✂️',
    iconBg: 'tool-icon-orange',
    title: 'Split PDF',
    description: 'Extract a range of pages from a PDF and download them as a separate file.',
  },
  {
    href: '/pdf-to-image',
    id: 'home-card-pdf-to-image',
    icon: '📄',
    iconBg: 'tool-icon-blue',
    title: 'PDF to Images',
    description: 'Upload any PDF and extract each page as a high-quality PNG image.',
  },
  {
    href: '/image-to-pdf',
    id: 'home-card-image-to-pdf',
    icon: '🖼️',
    iconBg: 'tool-icon-green',
    title: 'Images to PDF',
    description: 'Combine JPG, PNG, or WebP files into a single PDF document instantly.',
  },
  {
    href: '/html-to-pdf',
    id: 'home-card-html-to-pdf',
    icon: '🌐',
    iconBg: 'tool-icon-purple',
    title: 'HTML to PDF',
    description: 'Upload an HTML file and convert it into a PDF using your browser\'s print engine.',
  },
  {
    href: '/watermark-pdf',
    id: 'home-card-watermark-pdf',
    icon: '🔏',
    iconBg: 'tool-icon-teal',
    title: 'Watermark PDF',
    description: 'Stamp a custom text watermark on every page with adjustable angle, color, and opacity.',
  },
  {
    href: '/word-to-pdf',
    id: 'home-card-word-to-pdf',
    icon: '📝',
    iconBg: 'tool-icon-blue',
    title: 'Word to PDF',
    description: 'Upload a Word Document (.docx) and securely convert it to a PDF inside your browser.',
  },
  {
    href: '/pptx-to-pdf',
    id: 'home-card-pptx-to-pdf',
    icon: '📊',
    iconBg: 'tool-icon-orange',
    title: 'PowerPoint to PDF',
    description: 'Convert PowerPoint (.pptx) slides to a PDF sequentially in your browser.',
  },
  {
    href: '/url-to-pdf',
    id: 'home-card-url-to-pdf',
    icon: '🔗',
    iconBg: 'tool-icon-blue',
    title: 'URL to PDF',
    description: 'Paste any webpage URL and instantly convert it to a downloadable PDF.',
  },
  {
    href: '/page-numbers',
    id: 'home-card-page-numbers',
    icon: '🔢',
    iconBg: 'tool-icon-teal',
    title: 'Add Page Numbers',
    description: 'Stamp page numbers at any position on every page of your PDF — free and browser-based.',
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="page-content">
        {/* ===== PAGE HEADER ===== */}
        <div className="tools-page-header">
          <h1 className="tools-page-title">
            Every tool you need to work with PDFs in one place
          </h1>
          <p className="tools-page-subtitle">
            All tools are free, browser-based, and process files locally — your files never leave your device.
          </p>
        </div>

        {/* ===== TOOLS GRID ===== */}
        <div className="container">
          <div className="tools-grid animate-in">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="tool-grid-card"
                id={tool.id}
              >
                <div className={`tool-grid-icon ${tool.iconBg}`}>
                  {tool.icon}
                </div>
                <h3 className="tool-grid-title">{tool.title}</h3>
                <p className="tool-grid-desc">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ===== FEATURES STRIP ===== */}
        <div className="features-strip animate-in delay-3" style={{ maxWidth: 900, margin: '48px auto 0', padding: '28px 24px' }}>
          {[
            '100% Browser-Based',
            'No File Uploads',
            'High-Quality Output',
            'Bulk Download',
            'Supports WebP',
            'Completely Free',
          ].map((f) => (
            <div key={f} className="feature-item">
              <div className="feature-item-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
