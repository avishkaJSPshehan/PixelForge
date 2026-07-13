'use client';

import Link from 'next/link';

const organizePdf = [
  { href: '/merge-pdf', label: 'Merge PDF', icon: '🔗', color: '#ff6b6b' },
  { href: '/split-pdf', label: 'Split PDF', icon: '✂️', color: '#f39c12' },
  { href: '/remove-pages', label: 'Remove pages', icon: '🗑️', color: '#ff6b6b' },
];

const convertToPdf = [
  { href: '/image-to-pdf', label: 'JPG to PDF', icon: '🖼️', color: '#f1c40f' },
  { href: '/word-to-pdf', label: 'WORD to PDF', icon: '📝', color: '#3498db' },
  { href: '/pptx-to-pdf', label: 'POWERPOINT to PDF', icon: '📊', color: '#e74c3c' },
  { href: '/excel-to-pdf', label: 'EXCEL to PDF', icon: '📊', color: '#2ecc71' },
  { href: '/html-to-pdf', label: 'HTML to PDF', icon: '🌐', color: '#f1c40f' },
  { href: '/url-to-pdf', label: 'URL to PDF', icon: '🔗', color: '#9b59b6' },
];

const convertFromPdf = [
  { href: '/pdf-to-image', label: 'PDF to JPG', icon: '🖼️', color: '#f1c40f' },
  { href: '/pdf-to-word', label: 'PDF to WORD', icon: '📝', color: '#3498db' },
  { href: '/pdf-to-excel', label: 'PDF to EXCEL', icon: '📊', color: '#2ecc71' },
];

const editPdf = [
  { href: '/page-numbers', label: 'Add page numbers', icon: '🔢', color: '#9b59b6' },
  { href: '/watermark-pdf', label: 'Add watermark', icon: '🔏', color: '#9b59b6' },
];

const companyLinks = [
  { href: '/about', label: 'About Us', icon: '🏢', color: '#95a5a6' },
  { href: '/contact', label: 'Contact Us', icon: '✉️', color: '#95a5a6' },
  { href: '/privacy', label: 'Privacy Policy', icon: '🛡️', color: '#95a5a6' },
  { href: '/terms', label: 'Terms', icon: '📜', color: '#95a5a6' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  const renderList = (items: any[]) => (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {items.map(({ href, label, icon, color }) => (
        <li key={href + label}>
          <Link href={href} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#333', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = color} onMouseLeave={(e) => e.currentTarget.style.color = '#333'}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              background: `${color}20`,
              fontSize: '12px',
              color: color
            }}>
              {icon}
            </span>
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <footer style={{ background: '#fdfdfd', borderTop: '1px solid #eaeaea', paddingTop: '60px', paddingBottom: '30px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>

        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '50px' }}>
          <img src="/logo.jpg" alt="PixelForge" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#e74c3c' }}>PixelForge</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>Free, private, browser-based PDF tools.</p>
          </div>
        </div>

        {/* Tools Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '60px' }}>

          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '24px', margin: 0 }}>ORGANIZE PDF</h3>
            {renderList(organizePdf)}
          </div>

          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '24px', margin: 0 }}>CONVERT TO PDF</h3>
            {renderList(convertToPdf)}
          </div>

          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '24px', margin: 0 }}>CONVERT FROM PDF</h3>
            {renderList(convertFromPdf)}
          </div>

          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '24px', margin: 0 }}>EDIT PDF</h3>
            {renderList(editPdf)}
          </div>

          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '24px', margin: 0 }}>COMPANY</h3>
            {renderList(companyLinks)}
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid #eaeaea', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#888' }}>
          <div>&copy; {year} <strong style={{ color: '#e74c3c' }}>Bytebuilder</strong>. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/privacy" style={{ color: '#888', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: '#888', textDecoration: 'none' }}>Terms & Conditions</Link>
            <Link href="/contact" style={{ color: '#888', textDecoration: 'none' }}>Contact Us</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
