'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

/* ─── Tool data ─────────────────────────────────────────────────────────── */

/** Items shown under "ORGANIZE PDF" column */
const organizePdf = [
  { href: '/merge-pdf',     label: 'Merge PDF',       emoji: '🔗' },
  { href: '/split-pdf',    label: 'Split PDF',       emoji: '✂️' },
  { href: '/remove-pages', label: 'Remove Pages',    emoji: '🗑️' },
  { href: '/compress-pdf', label: 'Compress PDF',    emoji: '🗜️' },
  { href: '/protect-pdf',  label: 'Protect PDF',     emoji: '🔐' },
];

/** Items shown under "CONVERT TO PDF" column */
const convertToPdf = [
  { href: '/image-to-pdf', label: 'Image to PDF',       emoji: '🖼️' },
  { href: '/word-to-pdf',  label: 'Word to PDF',         emoji: '📝' },
  { href: '/pptx-to-pdf',  label: 'PowerPoint to PDF',   emoji: '📊' },
  { href: '/html-to-pdf',  label: 'HTML to PDF',          emoji: '🌐' },
  { href: '/url-to-pdf',   label: 'URL to PDF',           emoji: '🔗' },
];

/** Items shown under "CONVERT FROM PDF" column */
const convertFromPdf = [
  { href: '/pdf-to-image', label: 'PDF to Images', emoji: '📄' },
  { href: '/pdf-to-excel', label: 'PDF to Excel',  emoji: '📊' },
  { href: '/pdf-to-word',  label: 'PDF to Word',   emoji: '📝' },
];

const allTools = [
  { href: '/merge-pdf',     icon: '🔗', label: 'Merge PDF' },
  { href: '/split-pdf',     icon: '✂️', label: 'Split PDF' },
  { href: '/remove-pages',  icon: '🗑️', label: 'Remove Pages' },
  { href: '/compress-pdf',  icon: '🗜️', label: 'Compress PDF' },
  { href: '/protect-pdf',   icon: '🔐', label: 'Protect PDF' },
  { href: '/watermark-pdf', icon: '🔏', label: 'Watermark PDF' },
  { href: '/page-numbers',  icon: '🔢', label: 'Add Page Numbers' },
  { href: '/pdf-to-image',  icon: '📄', label: 'PDF to Images' },
  { href: '/pdf-to-excel',  icon: '📊', label: 'PDF to Excel' },
  { href: '/pdf-to-word',   icon: '📝', label: 'PDF to Word' },
  { href: '/image-to-pdf',  icon: '🖼️', label: 'Image to PDF' },
  { href: '/html-to-pdf',   icon: '🌐', label: 'HTML to PDF' },
  { href: '/url-to-pdf',    icon: '🔗', label: 'URL to PDF' },
  { href: '/word-to-pdf',   icon: '📝', label: 'Word to PDF' },
  { href: '/excel-to-pdf',  icon: '📊', label: 'Excel to PDF' },
  { href: '/pptx-to-pdf',   icon: '📊', label: 'PowerPoint to PDF' },
];

/* ─── SVG Icons ─────────────────────────────────────────────────────────── */

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 4l14 14M18 4L4 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

/** Plain emoji icon - same fixed width as the simple dropdown's icon span */
function FileIcon({ emoji }: { emoji: string }) {
  return <span className="nb-file-icon" aria-hidden="true">{emoji}</span>;
}

/* ─── Simple single-column dropdown (All PDF Tools) ─────────────────────── */

interface SimpleDropdownProps {
  label: string;
  items: { href: string; icon: string; label: string }[];
  isAnyActive: boolean;
}

function SimpleDropdown({ label, items, isAnyActive }: SimpleDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, []);

  return (
    <div className="nb-dropdown" ref={ref}>
      <button
        className={`nb-link nb-link--btn${isAnyActive ? ' nb-link--active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <span className={`nb-chevron${open ? ' nb-chevron--open' : ''}`}>
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <div className="nb-dropdown-panel" role="menu">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nb-dropdown-item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <span className="nb-dropdown-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Two-column Convert PDF mega dropdown ───────────────────────────────── */

function ConvertDropdown({ isAnyActive }: { isAnyActive: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOut);
    return () => document.removeEventListener('mousedown', onOut);
  }, []);

  return (
    <div className="nb-dropdown" ref={ref}>
      <button
        className={`nb-link nb-link--btn${isAnyActive ? ' nb-link--active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        id="navbar-convert-pdf-btn"
      >
        Convert PDF
        <span className={`nb-chevron${open ? ' nb-chevron--open' : ''}`}>
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <div className="nb-mega-panel" role="menu">
          {/* ── Column 1: Convert TO PDF ── */}
          <div className="nb-mega-col">
            <p className="nb-mega-heading">Convert to PDF</p>
            {convertToPdf.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nb-mega-item"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <FileIcon emoji={item.emoji} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* ── Divider ── */}
          <div className="nb-mega-divider" />

          {/* ── Column 2: Convert FROM PDF ── */}
          <div className="nb-mega-col">
            <p className="nb-mega-heading">Convert from PDF</p>
            {convertFromPdf.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nb-mega-item"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <FileIcon emoji={item.emoji} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Navbar ────────────────────────────────────────────────────────── */

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const allConvertHrefs = [...convertToPdf, ...convertFromPdf].map((t) => t.href);
  const convertActive   = allConvertHrefs.includes(pathname);
  const allActive       = allTools.some((t) => t.href === pathname);

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">

          {/* ── Logo ── */}
          <Link href="/" className="navbar-logo" id="navbar-logo">
            <div className="navbar-logo-icon">
              <img src="/logo.jpg" alt="PixelForge logo" className="navbar-logo-img" />
            </div>
            <span className="navbar-logo-text">PixelForge</span>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="nb-nav" id="navbar-desktop-nav">
            <Link
              href="/merge-pdf"
              className={`nb-link${pathname === '/merge-pdf' ? ' nb-link--active' : ''}`}
              id="navbar-merge-pdf"
            >
              Merge PDF
            </Link>

            <Link
              href="/split-pdf"
              className={`nb-link${pathname === '/split-pdf' ? ' nb-link--active' : ''}`}
              id="navbar-split-pdf"
            >
              Split PDF
            </Link>

            <ConvertDropdown isAnyActive={convertActive} />

            <SimpleDropdown
              label="All PDF Tools"
              items={allTools}
              isAnyActive={allActive && !convertActive}
            />
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="nb-mobile-toggle"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            id="navbar-mobile-toggle"
          >
            {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="nb-mobile-drawer animate-fade" id="navbar-mobile-drawer">
          <Link href="/merge-pdf"  className="nb-mobile-link" onClick={() => setMobileOpen(false)}>🔗 Merge PDF</Link>
          <Link href="/split-pdf"  className="nb-mobile-link" onClick={() => setMobileOpen(false)}>✂️ Split PDF</Link>
          <div className="nb-mobile-divider">Convert to PDF</div>
          {convertToPdf.map((t) => (
            <Link key={t.href} href={t.href} className="nb-mobile-link nb-mobile-link--sub" onClick={() => setMobileOpen(false)}>
              {t.label}
            </Link>
          ))}
          <div className="nb-mobile-divider">Convert from PDF</div>
          {convertFromPdf.map((t) => (
            <Link key={t.href} href={t.href} className="nb-mobile-link nb-mobile-link--sub" onClick={() => setMobileOpen(false)}>
              {t.label}
            </Link>
          ))}
          <div className="nb-mobile-divider">More Tools</div>
          <Link href="/watermark-pdf" className="nb-mobile-link nb-mobile-link--sub" onClick={() => setMobileOpen(false)}>🔏 Watermark PDF</Link>
        </div>
      )}
    </>
  );
}
