import Navbar from '@/components/Navbar';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us – PixelForge | Free Online PDF Tools',
  description:
    'Learn about PixelForge - a free, private, browser-based PDF toolkit. No sign-up, no file uploads to servers. Built for everyone who works with documents.',
  alternates: { canonical: 'https://www.pixel-forge.online/about' },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">
          <div style={{ maxWidth: 760, margin: '0 auto', paddingTop: 28, paddingBottom: 80 }}>

            <Link href="/" className="back-btn">← Back to Home</Link>

            <div className="tool-header animate-in" style={{ textAlign: 'left', marginBottom: 40 }}>
              <div
                className="tool-header-icon"
                style={{
                  background: 'linear-gradient(135deg,rgba(108,99,255,.18),rgba(56,178,248,.1))',
                  border: '1px solid rgba(108,99,255,.25)',
                }}
              >
                🛠️
              </div>
              <h1>About PixelForge</h1>
              <p>Free, private, and powerful PDF tools - built for everyone.</p>
            </div>

            <div className="static-page-content animate-in delay-1">
              <h2>What is PixelForge?</h2>
              <p>
                PixelForge is a free, browser-based PDF toolkit designed to make document
                management simple and accessible to everyone. Whether you need to merge
                PDFs, split them, convert a Word document, add a watermark, or stamp page
                numbers - PixelForge does it all without requiring you to sign up, install
                software, or pay anything.
              </p>

              <h2>Our Mission</h2>
              <p>
                We believe that essential document tools should be free, fast, and private.
                Most PDF software charges subscription fees or forces you to upload your
                files to remote servers. PixelForge processes everything <strong>entirely
                inside your browser</strong> - your files never leave your device.
              </p>

              <h2>Why PixelForge?</h2>
              <ul>
                <li><strong>100% Free</strong> - No hidden fees, no premium tiers, no watermarks.</li>
                <li><strong>Private by Design</strong> - Files are processed in your browser and never uploaded to any server.</li>
                <li><strong>No Sign-Up Required</strong> - Use every tool instantly without creating an account.</li>
                <li><strong>Works Everywhere</strong> - Any modern browser on any device.</li>
                <li><strong>Open & Transparent</strong> - No ads tracking your documents, no data harvesting.</li>
              </ul>

              <h2>Our Tools</h2>
              <p>PixelForge currently offers the following free PDF tools:</p>
              <ul>
                <li><Link href="/merge-pdf">Merge PDF</Link> - Combine multiple PDFs into one.</li>
                <li><Link href="/split-pdf">Split PDF</Link> - Extract pages or split by range.</li>
                <li><Link href="/pdf-to-image">PDF to Images</Link> - Convert pages to JPG or PNG.</li>
                <li><Link href="/image-to-pdf">Image to PDF</Link> - Turn photos into a PDF.</li>
                <li><Link href="/word-to-pdf">Word to PDF</Link> - Convert DOCX documents to PDF.</li>
                <li><Link href="/pptx-to-pdf">PowerPoint to PDF</Link> - Convert PPTX slides to PDF.</li>
                <li><Link href="/html-to-pdf">HTML to PDF</Link> - Convert HTML files to PDF.</li>
                <li><Link href="/url-to-pdf">URL to PDF</Link> - Save any webpage as a PDF.</li>
                <li><Link href="/watermark-pdf">Watermark PDF</Link> - Add custom text watermarks.</li>
                <li><Link href="/page-numbers">Add Page Numbers</Link> - Stamp page numbers at any position.</li>
              </ul>

              <h2>Contact</h2>
              <p>
                Have feedback, found a bug, or want to suggest a new tool?{' '}
                <Link href="/contact">Reach out to us</Link> - we'd love to hear from you.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
