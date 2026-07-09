import Navbar from '@/components/Navbar';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions – PixelForge | Terms of Use',
  description:
    'Read the PixelForge Terms & Conditions. By using our free PDF tools you agree to these terms of service.',
  alternates: { canonical: 'https://www.pixel-forge.online/terms' },
};

const LAST_UPDATED = 'July 9, 2026';

export default function TermsPage() {
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
                  background: 'linear-gradient(135deg,rgba(26,143,216,.18),rgba(56,178,248,.1))',
                  border: '1px solid rgba(26,143,216,.25)',
                }}
              >
                📋
              </div>
              <h1>Terms &amp; Conditions</h1>
              <p>Last updated: {LAST_UPDATED}</p>
            </div>

            <div className="static-page-content animate-in delay-1">
              <p>
                Please read these Terms &amp; Conditions (&quot;Terms&quot;) carefully before using
                PixelForge (the &quot;Service&quot;). By accessing or using the Service, you agree
                to be bound by these Terms.
              </p>

              <h2>1. Use of the Service</h2>
              <p>
                PixelForge provides free, browser-based PDF tools. You may use the Service
                for lawful purposes only. You agree not to use the Service to process,
                distribute, or create materials that are illegal, infringe on third-party
                intellectual property rights, or violate any applicable law.
              </p>

              <h2>2. No Account Required</h2>
              <p>
                The Service does not require account registration. All tools are freely
                accessible without creating an account or providing personal information.
              </p>

              <h2>3. Intellectual Property</h2>
              <p>
                You retain full ownership of any files you process using PixelForge. We
                make no claim to your documents. The PixelForge name, logo, and underlying
                software code are the intellectual property of Bytebuilder and may not be
                reproduced without permission.
              </p>

              <h2>4. Privacy &amp; File Processing</h2>
              <p>
                All file processing occurs locally in your browser. PixelForge does not
                upload, store, or access your files. Please see our{' '}
                <Link href="/privacy">Privacy Policy</Link> for full details.
              </p>

              <h2>5. Disclaimer of Warranties</h2>
              <p>
                The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranty of
                any kind. We do not guarantee that the Service will be uninterrupted,
                error-free, or that output files will meet your requirements. Use the
                Service at your own risk and always keep backups of important documents.
              </p>

              <h2>6. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, Bytebuilder shall not
                be liable for any indirect, incidental, special, consequential, or punitive
                damages arising from your use of the Service, including but not limited to
                loss of data or document corruption.
              </p>

              <h2>7. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use the Service to process unlawful, harmful, or offensive content.</li>
                <li>Attempt to reverse-engineer, scrape, or overload the Service.</li>
                <li>Misrepresent your identity or affiliation with any person or entity.</li>
              </ul>

              <h2>8. Changes to These Terms</h2>
              <p>
                We reserve the right to update these Terms at any time. Continued use of
                the Service after changes constitutes acceptance of the new Terms. The
                &quot;Last updated&quot; date above will reflect any modifications.
              </p>

              <h2>9. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the jurisdiction in which Bytebuilder
                operates. Any disputes will be resolved in the courts of that jurisdiction.
              </p>

              <h2>10. Contact</h2>
              <p>
                Questions about these Terms? <Link href="/contact">Contact us</Link> or
                email{' '}
                <a href="mailto:support@pixel-forge.online">support@pixel-forge.online</a>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
