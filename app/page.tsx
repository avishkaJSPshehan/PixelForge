import Navbar from '@/components/Navbar';
import Link from 'next/link';

/* ─── Tool data ─────────────────────────────────────────────────────────── */

const tools = [
  {
    href: '/merge-pdf',
    id: 'home-card-merge-pdf',
    icon: '🔗',
    iconBg: 'tool-icon-red',
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one document online - free, instant, no sign-up required.',
  },
  {
    href: '/split-pdf',
    id: 'home-card-split-pdf',
    icon: '✂️',
    iconBg: 'tool-icon-orange',
    title: 'Split PDF',
    description: 'Extract pages or split PDF by range online free. Download as separate files instantly.',
  },
  {
    href: '/remove-pages',
    id: 'home-card-remove-pages',
    icon: '🗑️',
    iconBg: 'tool-icon-red',
    title: 'Remove Pages',
    description: 'Delete unwanted pages from your PDF online. Visual selection, free and 100% private.',
  },
  {
    href: '/compress-pdf',
    id: 'home-card-compress-pdf',
    icon: '🗜️',
    iconBg: 'tool-icon-purple',
    title: 'Compress PDF',
    description: 'Reduce PDF file size online free. Choose compression level and download instantly.',
  },
  {
    href: '/protect-pdf',
    id: 'home-card-protect-pdf',
    icon: '🔐',
    iconBg: 'tool-icon-red',
    title: 'PDF Password Protect',
    description: 'Add password protection to your PDF online free. Encrypt and secure your documents instantly.',
  },
  {
    href: '/pdf-to-image',
    id: 'home-card-pdf-to-image',
    icon: '📄',
    iconBg: 'tool-icon-blue',
    title: 'PDF to Images',
    description: 'Convert PDF pages to high-resolution JPG or PNG images online free - no quality loss.',
  },
  {
    href: '/image-to-pdf',
    id: 'home-card-image-to-pdf',
    icon: '🖼️',
    iconBg: 'tool-icon-green',
    title: 'Image to PDF',
    description: 'Turn multiple JPG, PNG photos into a single PDF file online - free and no watermark.',
  },
  {
    href: '/html-to-pdf',
    id: 'home-card-html-to-pdf',
    icon: '🌐',
    iconBg: 'tool-icon-purple',
    title: 'HTML to PDF',
    description: 'Convert HTML files or code to PDF online free without installing any software.',
  },
  {
    href: '/watermark-pdf',
    id: 'home-card-watermark-pdf',
    icon: '🔏',
    iconBg: 'tool-icon-teal',
    title: 'Watermark PDF',
    description: 'Add custom text watermarks to PDF pages online free - adjust angle, color, and opacity.',
  },
  {
    href: '/word-to-pdf',
    id: 'home-card-word-to-pdf',
    icon: '📝',
    iconBg: 'tool-icon-blue',
    title: 'Word to PDF',
    description: 'Convert Word DOCX to PDF online free without losing formatting. No Office needed.',
  },
  {
    href: '/pptx-to-pdf',
    id: 'home-card-pptx-to-pdf',
    icon: '📊',
    iconBg: 'tool-icon-orange',
    title: 'PowerPoint to PDF',
    description: 'Convert PowerPoint PPTX presentations to PDF online free - all slides preserved.',
  },
  {
    href: '/url-to-pdf',
    id: 'home-card-url-to-pdf',
    icon: '🔗',
    iconBg: 'tool-icon-indigo',
    title: 'URL to PDF',
    description: 'Save any webpage as PDF from a URL online free - no browser extension required.',
  },
  {
    href: '/page-numbers',
    id: 'home-card-page-numbers',
    icon: '🔢',
    iconBg: 'tool-icon-teal',
    title: 'Add Page Numbers',
    description: 'Stamp page numbers at any position on PDF pages free - choose top, bottom, left, right.',
  },
  {
    href: '/excel-to-pdf',
    id: 'home-card-excel-to-pdf',
    icon: '📊',
    iconBg: 'tool-icon-green',
    title: 'Excel to PDF',
    description: 'Convert Excel spreadsheets (.xlsx, .xls) to PDF online free - all sheets included, no sign-up.',
  },
  {
    href: '/pdf-to-excel',
    id: 'home-card-pdf-to-excel',
    icon: '📋',
    iconBg: 'tool-icon-green',
    title: 'PDF to Excel',
    description: 'Extract text and tables from PDF into a structured Excel spreadsheet (.xlsx) - free, browser-based.',
  },
  {
    href: '/pdf-to-word',
    id: 'home-card-pdf-to-word',
    icon: '📝',
    iconBg: 'tool-icon-blue',
    title: 'PDF to Word',
    description: 'Convert PDF files to Word documents (.docx) - extract text preserving lines, 100% free and private.',
  },
];



/* ─── Features data ──────────────────────────────────────────────────────── */

const features = [
  {
    icon: '🛡️',
    title: '100% Private & Secure',
    body: 'All PDF processing happens entirely inside your browser. Your files are never uploaded to any server - not even ours. Your documents stay on your device.',
  },
  {
    icon: '⚡',
    title: 'Free with No Sign-Up',
    body: 'Every tool is completely free to use. No account creation, no email address, no subscription. Open the tool and start working immediately.',
  },
  {
    icon: '🌍',
    title: 'Works on Any Device',
    body: 'PixelForge runs in any modern browser on Windows, Mac, Linux, and mobile. No software installation required - just open and use.',
  },
];

/* ─── Stats data ─────────────────────────────────────────────────────────── */

const stats = [
  { value: '10+', label: 'Free PDF Tools' },
  { value: '0', label: 'Files Uploaded to Server' },
  { value: '100%', label: 'Browser-Based Processing' },
  { value: '∞', label: 'Free Forever' },
];

/* ─── Page component ──────────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="page-content hp-main">

        {/* ══════════════ HERO ══════════════ */}
        <section className="hp-hero">
          <div className="container hp-hero-inner">
            <h1 className="hp-hero-title">
              Every tool you need to work with PDFs in one place
            </h1>
            <p className="hp-hero-sub">
              Merge, split, compress, convert, watermark, and number PDF pages - all free,
              all private, all in your browser. Your files never leave your device.
            </p>
          </div>
        </section>

        {/* ══════════════ TOOLS GRID ══════════════ */}
        <section className="hp-tools-section">
          <div className="container">
            <div className="hp-tools-grid animate-in">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="hp-tool-card"
                  id={tool.id}
                >
                  <div className={`hp-tool-icon ${tool.iconBg}`}>
                    {tool.icon}
                  </div>
                  <h3 className="hp-tool-title">{tool.title}</h3>
                  <p className="hp-tool-desc">{tool.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ WHY PIXELFORGE ══════════════ */}
        <section className="hp-features-section animate-in">
          <div className="container">
            <div className="hp-section-label">Why PixelForge?</div>
            <h2 className="hp-section-title">
              Work your way - free, private, and powerful
            </h2>
            <p className="hp-section-sub">
              The best free online PDF tools for everyone who works with documents every day.
              No subscriptions, no watermarks, no file size limits.
            </p>

            <div className="hp-features-grid">
              {features.map((f) => (
                <div key={f.title} className="hp-feature-card">
                  <div className="hp-feature-icon">{f.icon}</div>
                  <h3 className="hp-feature-title">{f.title}</h3>
                  <p className="hp-feature-body">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ SEO CONTENT STRIP ══════════════ */}
        <section className="hp-seo-section">
          <div className="container">
            <div className="hp-seo-inner">
              <div className="hp-seo-text">
                <h2 className="hp-seo-title">
                  The free PDF toolkit trusted for everyday document tasks
                </h2>
                <p className="hp-seo-body">
                  Whether you need to <strong>merge multiple PDF files into one</strong>,{' '}
                  use a <strong>PDF converter Word to PDF</strong> to keep your formatting intact, or{' '}
                  need a reliable <strong>PDF converter to PDF</strong> tool for your daily workflow - PixelForge has you covered.
                </p>
                <p className="hp-seo-body">
                  Looking for a <strong>PDF converter online free</strong>? You&apos;ve found it. 
                  Unlike desktop software, PixelForge runs entirely in your browser as a 100% <strong>pdf converter online free</strong> of charge. There is{' '}
                  <strong>no software installation required</strong>, no Adobe Acrobat subscription,
                  and no sign-up.
                </p>
                <div className="hp-seo-tags">
                  {[
                    'PDF converter online free',
                    'PDF converter Word to PDF',
                    'PDF converter to PDF',
                    'pdf converter online free',
                    'Free PDF Merger',
                    'PDF to JPG Converter',
                    'Split PDF Online',
                    'PPTX to PDF',
                    'HTML to PDF',
                  ].map((tag) => (
                    <span key={tag} className="hp-seo-tag">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="hp-stats-grid">
                {stats.map((s) => (
                  <div key={s.label} className="hp-stat-card">
                    <div className="hp-stat-value">{s.value}</div>
                    <div className="hp-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ CTA ══════════════ */}
        <section className="hp-cta-section animate-in">
          <div className="container">
            <div className="hp-cta-inner">
              <h2 className="hp-cta-title">Start working with your PDFs right now</h2>
              <p className="hp-cta-sub">
                Pick any free tool above - no sign-up, no installation, no catch.
              </p>
              <Link href="#tools" className="btn btn-primary hp-cta-btn">
                🚀 Explore All Free Tools
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
