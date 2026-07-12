import Link from 'next/link';

const convertLinks = [
  { href: '/image-to-pdf',  label: 'Image to PDF' },
  { href: '/word-to-pdf',   label: 'Word to PDF' },
  { href: '/excel-to-pdf',  label: 'Excel to PDF' },
  { href: '/pdf-to-excel',  label: 'PDF to Excel' },
  { href: '/pdf-to-word',   label: 'PDF to Word' },
  { href: '/pptx-to-pdf',   label: 'PowerPoint to PDF' },
  { href: '/html-to-pdf',   label: 'HTML to PDF' },
  { href: '/url-to-pdf',    label: 'URL to PDF' },
  { href: '/pdf-to-image',  label: 'PDF to JPG' },
  { href: '/merge-pdf',     label: 'Merge PDF' },
  { href: '/split-pdf',     label: 'Split PDF' },
  { href: '/remove-pages',  label: 'Remove Pages' },
  { href: '/watermark-pdf', label: 'Watermark PDF' },
  { href: '/page-numbers',  label: 'Add Page Numbers' },
];

const companyLinks = [
  { href: '/about',   label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms',   label: 'Terms & Conditions' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">

      {/* ── Main footer columns ── */}
      <div className="container footer-cols">

        {/* Brand */}
        <div className="footer-col footer-brand-col">
          <Link href="/" className="footer-logo" aria-label="PixelForge home">
            <img src="/logo.jpg" alt="PixelForge" className="footer-logo-img" />
            <span className="footer-logo-text">PixelForge</span>
          </Link>
          <p className="footer-tagline">
            Free, private, browser-based PDF tools.<br />
            Your files never leave your device.
          </p>
          <p className="footer-copy">
            &copy; {year}{' '}
            <span className="footer-brand-name">Bytebuilder</span>.
            All rights reserved.
          </p>
        </div>

        {/* Convert Tools */}
        <div className="footer-col">
          <h3 className="footer-col-heading">PDF Tools</h3>
          <ul className="footer-link-list">
            {convertLinks.map(({ href, label }) => (
              <li key={href + label}>
                <Link href={href} className="footer-link">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div className="footer-col">
          <h3 className="footer-col-heading">Company</h3>
          <ul className="footer-link-list">
            {companyLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="footer-link">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <span className="footer-bottom-copy">
          &copy; {year} Bytebuilder. All rights reserved.
        </span>
        <span className="footer-bottom-links">
          <Link href="/privacy" className="footer-link">Privacy</Link>
          <span aria-hidden>·</span>
          <Link href="/terms" className="footer-link">Terms</Link>
          <span aria-hidden>·</span>
          <Link href="/contact" className="footer-link">Contact</Link>
        </span>
      </div>

    </footer>
  );
}
