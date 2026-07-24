import Navbar from '@/components/Navbar';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us – PixelForge | Built by ByteBuilders',
  description:
    'PixelForge is a free, browser-based PDF toolkit built by ByteBuilders. Every file is processed entirely in your browser — nothing is ever uploaded, stored, or seen by us. No sign-up, no limits, genuinely free.',
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
              <p>Free, private, and powerful file tools — built for everyone who works with documents.</p>
            </div>

            <div className="static-page-content animate-in delay-1">

              <h2>Who We Are</h2>
              <p>
                PixelForge is a product of <strong>ByteBuilders</strong>, a software development company
                focused on building practical, privacy-first tools for everyday users. We created PixelForge
                because we were frustrated with the existing landscape of PDF and file tools — almost every
                free option either uploads your documents to a third-party server, slaps a watermark on the
                result, or hits you with a paywall after one use.
              </p>
              <p>
                We wanted to build something different: a toolkit where the first thing we guarantee isn&apos;t
                features or speed — it&apos;s <strong>your privacy</strong>.
              </p>

              <h2>How PixelForge Works</h2>
              <p>
                The core principle behind PixelForge is simple: <strong>your files never leave your device</strong>.
                Every tool on this site — whether you&apos;re merging PDFs, converting a Word document, compressing
                a file, or adding a watermark — runs entirely inside your web browser using JavaScript and
                WebAssembly APIs.
              </p>
              <p>
                When you drop a file into PixelForge, it is loaded into your browser&apos;s memory. The processing
                happens locally on your computer, phone, or tablet. When you close the tab, the file is gone.
                It was never transmitted to our servers, because we don&apos;t have a file-processing server at all.
                No upload. No storage. No risk of a data breach exposing your documents.
              </p>
              <p>
                Most online PDF tools — even the popular, well-funded ones — upload your files to a cloud
                server, process them remotely, then send the result back to you. That means your contracts,
                your medical records, your business plans, and your personal documents sit on someone else&apos;s
                infrastructure, however briefly. PixelForge removes that step entirely.
              </p>

              <h2>Why PixelForge?</h2>

              <div className="about-features-grid">
                <div className="about-feature-card">
                  <div className="about-feature-icon">🔒</div>
                  <div className="about-feature-title">Private by Design</div>
                  <div className="about-feature-body">Files are processed in your browser and never transmitted to any server. What you open stays with you.</div>
                </div>
                <div className="about-feature-card">
                  <div className="about-feature-icon">💸</div>
                  <div className="about-feature-title">Genuinely Free</div>
                  <div className="about-feature-body">No hidden fees, no premium tiers, no watermarks, no artificial file size caps. Every tool works in full, always.</div>
                </div>
                <div className="about-feature-card">
                  <div className="about-feature-icon">🚫</div>
                  <div className="about-feature-title">No Account Required</div>
                  <div className="about-feature-body">Use every tool instantly without creating an account, verifying an email address, or handing over personal information.</div>
                </div>
                <div className="about-feature-card">
                  <div className="about-feature-icon">🌐</div>
                  <div className="about-feature-title">Works Everywhere</div>
                  <div className="about-feature-body">Any modern browser on any device — Windows, Mac, Linux, Android, or iOS. No software to install, ever.</div>
                </div>
              </div>

              <h2>Our Mission</h2>
              <p>
                We believe that essential productivity tools should be free, fast, and should respect your
                time and your privacy. The internet is full of tools that offer &quot;free&quot; service in exchange
                for your data, your attention, or your patience with dark UI patterns designed to push you
                toward a paid plan. PixelForge takes none of that.
              </p>
              <p>
                Our mission is to give every person — students, small business owners, freelancers, educators,
                researchers — access to professional-grade document tools without barriers. You shouldn&apos;t need
                a subscription to split a PDF or convert a Word document. It&apos;s that simple.
              </p>

              <h2>Our Tools</h2>
              <p>PixelForge currently offers the following free, browser-based tools:</p>
              <ul>
                <li><Link href="/merge-pdf">Merge PDF</Link> — Combine multiple PDF files into a single document. Drag to reorder pages before merging.</li>
                <li><Link href="/split-pdf">Split PDF</Link> — Extract specific pages or split a PDF into separate files by page range.</li>
                <li><Link href="/remove-pages">Remove PDF Pages</Link> — Select and delete individual pages from any PDF document.</li>
                <li><Link href="/compress-pdf">Compress PDF</Link> — Reduce PDF file size using image quality optimisation, fully in-browser.</li>
                <li><Link href="/protect-pdf">Protect PDF</Link> — Add a password to a PDF to restrict unauthorised access.</li>
                <li><Link href="/image-to-pdf">Image to PDF</Link> — Convert JPG, PNG, or other images into a single PDF document.</li>
                <li><Link href="/word-to-pdf">Word to PDF</Link> — Convert DOCX files to PDF format without uploading to a server.</li>
                <li><Link href="/pptx-to-pdf">PowerPoint to PDF</Link> — Convert PPTX presentation slides to a PDF file.</li>
                <li><Link href="/excel-to-pdf">Excel to PDF</Link> — Convert XLSX spreadsheets to PDF format, in your browser.</li>
                <li><Link href="/html-to-pdf">HTML to PDF</Link> — Convert local HTML files to a PDF document.</li>
                <li><Link href="/url-to-pdf">URL to PDF</Link> — Save any public webpage as a PDF via a proxy conversion.</li>
                <li><Link href="/pdf-to-image">PDF to Images</Link> — Extract pages from a PDF and save them as JPG or PNG images.</li>
                <li><Link href="/pdf-to-word">PDF to Word</Link> — Convert PDF documents to editable DOCX format.</li>
                <li><Link href="/pdf-to-excel">PDF to Excel</Link> — Extract tables from PDF files into an editable spreadsheet.</li>
                <li><Link href="/watermark-pdf">Watermark PDF</Link> — Add custom text watermarks to every page of a PDF.</li>
                <li><Link href="/page-numbers">Add Page Numbers</Link> — Stamp page numbers at any position and in any style on a PDF.</li>
              </ul>

              <h2>Get in Touch</h2>
              <p>
                Have a bug to report, a feature you&apos;d love to see, or just want to share feedback?
                We built PixelForge to be useful, and we genuinely read every message we receive.
                {' '}<Link href="/contact">Reach out to us</Link> — your input directly shapes what gets
                built next.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
