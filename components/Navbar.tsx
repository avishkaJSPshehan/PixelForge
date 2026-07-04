'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link href="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <img src="/logo.jpg" alt="PixelForge logo" className="navbar-logo-img" />
          </div>
          <span className="navbar-logo-text">PixelForge</span>
        </Link>

        <div className="navbar-nav">
          <Link
            href="/"
            className={`navbar-link${pathname === '/' ? ' active' : ''}`}
          >
            Home
          </Link>
          <Link
            href="/pdf-to-image"
            className={`navbar-link${pathname === '/pdf-to-image' ? ' active' : ''}`}
          >
            PDF → Images
          </Link>
          <Link
            href="/image-to-pdf"
            className={`navbar-link${pathname === '/image-to-pdf' ? ' active' : ''}`}
          >
            Images → PDF
          </Link>
          <Link
            href="/merge-pdf"
            className={`navbar-link${pathname === '/merge-pdf' ? ' active' : ''}`}
          >
            Merge PDFs
          </Link>
        </div>
      </div>
    </nav>
  );
}
