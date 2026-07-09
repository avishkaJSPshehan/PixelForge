import Navbar from '@/components/Navbar';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy – PixelForge | How We Protect Your Data',
  description:
    'Read the PixelForge Privacy Policy. We process all PDF files entirely in your browser — no file uploads, no data collection, no cookies for tracking.',
  alternates: { canonical: 'https://www.pixel-forge.online/privacy' },
};

const LAST_UPDATED = 'July 9, 2026';

export default function PrivacyPage() {
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
                  background: 'linear-gradient(135deg,rgba(215,38,38,.15),rgba(255,101,132,.08))',
                  border: '1px solid rgba(215,38,38,.2)',
                }}
              >
                🔒
              </div>
              <h1>Privacy Policy</h1>
              <p>Last updated: {LAST_UPDATED}</p>
            </div>

            <div className="static-page-content animate-in delay-1">
              <div className="policy-highlight">
                <strong>🛡️ The short version:</strong> PixelForge processes all your files
                entirely inside your browser. Your documents are <strong>never uploaded</strong> to
                any server, never stored, and never shared. We do not collect personal data.
              </div>

              <h2>1. Information We Do Not Collect</h2>
              <p>
                When you use any PixelForge tool (merge, split, convert, watermark, etc.),
                your PDF and image files are processed <strong>entirely on your local device</strong>
                using browser-based technologies (WebAssembly, JavaScript APIs). We do not
                receive, store, or process your files on any server.
              </p>
              <p>We do <strong>not</strong> collect:</p>
              <ul>
                <li>The content of your uploaded or processed files</li>
                <li>Personal identification information</li>
                <li>Email addresses (unless you contact us voluntarily)</li>
                <li>Payment information</li>
              </ul>

              <h2>2. Analytics & Cookies</h2>
              <p>
                PixelForge may use privacy-respecting analytics (e.g. page view counts)
                to understand how our tools are used. We do not use cross-site tracking
                cookies or serve third-party advertising. Any analytics we use do not
                identify individual users.
              </p>

              <h2>3. Contact Submissions</h2>
              <p>
                If you contact us via the <Link href="/contact">Contact page</Link>, your
                name, email address, and message are used solely to respond to your enquiry.
                This information is not shared with third parties.
              </p>

              <h2>4. Third-Party Services</h2>
              <p>
                PixelForge loads fonts from Google Fonts (fonts.googleapis.com). Google may
                collect basic request data such as your IP address. Please review
                Google&apos;s privacy policy for details.
              </p>

              <h2>5. Data Security</h2>
              <p>
                Because we do not receive your files, there is no server-side risk of your
                documents being exposed. All file processing happens locally on your device.
              </p>

              <h2>6. Children&apos;s Privacy</h2>
              <p>
                PixelForge is a general-purpose productivity tool not directed at children
                under 13. We do not knowingly collect data from minors.
              </p>

              <h2>7. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be
                reflected on this page with an updated &quot;Last updated&quot; date.
              </p>

              <h2>8. Contact</h2>
              <p>
                Questions about this policy? <Link href="/contact">Contact us</Link> or
                email us at{' '}
                <a href="mailto:support@pixel-forge.online">support@pixel-forge.online</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
