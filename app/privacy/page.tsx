import Navbar from '@/components/Navbar';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy – PixelForge | How We Protect Your Data',
  description:
    'Read the PixelForge Privacy Policy. Your files are never uploaded to any server — all processing happens locally in your browser. We explain exactly what we do and do not collect.',
  alternates: { canonical: 'https://www.pixel-forge.online/privacy' },
};

const LAST_UPDATED = 'July 24, 2026';

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
                <strong>🛡️ The short version:</strong> PixelForge processes all your files entirely inside
                your browser. Your documents are <strong>never uploaded</strong> to any server, never stored,
                and never seen by us or anyone else. The only data we collect is anonymous analytics about
                page visits — not about you or your files.
              </div>

              <h2>1. Your Files Are Never Uploaded</h2>
              <p>
                When you use any PixelForge tool — whether you&apos;re merging, splitting, compressing,
                converting, watermarking, or otherwise processing a PDF or other file — your document is
                loaded directly into your browser&apos;s local memory (RAM). All processing is performed
                using client-side JavaScript and WebAssembly running on your own device.
              </p>
              <p>
                Your file is <strong>never transmitted to our servers</strong> or any third-party server
                for processing. It never leaves your device. The moment you close the tab or navigate away,
                the file is cleared from your browser&apos;s memory automatically. We have no copy of it —
                no temporary copy, no cached copy, no backup. There is nothing for us to store, share, or
                lose in a data breach, because we simply never receive it.
              </p>
              <p>
                This architecture is not a marketing claim — it is a technical reality. PixelForge has no
                file-processing backend. Our servers only serve the application code (HTML, CSS, JavaScript).
                Once that code loads in your browser, everything else happens locally on your machine.
              </p>

              <h2>2. Information We Do Collect</h2>
              <p>
                While your files are never collected, we do collect limited anonymous data to understand
                how our tools are being used so we can improve them:
              </p>
              <ul>
                <li>
                  <strong>Page visit analytics:</strong> We use Google Analytics to collect anonymised data
                  including which pages are visited, approximate geographic location (country/city level,
                  not your precise address), device type (e.g. mobile vs. desktop), and browser type. This
                  data does not identify you personally.
                </li>
                <li>
                  <strong>Cookies:</strong> Google Analytics uses cookies to distinguish unique visitors and
                  track sessions. These are analytics cookies, not tracking cookies linked to your browsing
                  history across other websites.
                </li>
                <li>
                  <strong>Google AdSense:</strong> PixelForge may display Google AdSense advertisements
                  to support the free service. Google may use cookies to serve ads based on your prior
                  visits to this website and other websites. You can opt out of personalised advertising
                  at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.
                </li>
              </ul>

              <h2>3. What We Don&apos;t Do</h2>
              <ul>
                <li>We do <strong>not</strong> require you to create an account or provide any personal information to use any tool.</li>
                <li>We do <strong>not</strong> sell, rent, or share your personal data with any third party for marketing purposes.</li>
                <li>We do <strong>not</strong> store, retain, or log any files you process through PixelForge.</li>
                <li>We do <strong>not</strong> use cross-site tracking technologies that follow you across unrelated websites (beyond standard Google Analytics behaviour).</li>
                <li>We do <strong>not</strong> collect payment information — PixelForge is entirely free.</li>
              </ul>

              <h2>4. Contact Submissions</h2>
              <p>
                If you contact us via the <Link href="/contact">Contact page</Link>, your name, email
                address, and message are used solely to respond to your enquiry. This information is
                not shared with third parties and is retained only as long as necessary to address your
                request.
              </p>

              <h2>5. Third-Party Services</h2>
              <p>
                PixelForge uses the following third-party services, each with their own privacy practices:
              </p>
              <ul>
                <li>
                  <strong>Google Analytics</strong> — For anonymous usage statistics. See{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.
                </li>
                <li>
                  <strong>Google AdSense</strong> — For displaying advertisements. See{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>{' '}
                  and manage ad preferences at{' '}
                  <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.
                </li>
                <li>
                  <strong>Google Fonts</strong> — We load typography from fonts.googleapis.com, which may
                  collect basic request data such as your IP address.
                </li>
              </ul>

              <h2>6. Children&apos;s Privacy</h2>
              <p>
                PixelForge is a general-purpose productivity tool and is not directed at children under
                the age of 13. We do not knowingly collect personal data from minors. If you believe a
                child has inadvertently submitted personal information through our contact form, please
                contact us so we can delete it promptly.
              </p>

              <h2>7. Data Security</h2>
              <p>
                Because we do not receive, transmit, or store your files, there is no server-side risk
                of your documents being exposed in a breach. All file processing happens locally on your
                device. For the limited analytics data we do collect, we rely on Google&apos;s security
                infrastructure, which is subject to industry-standard protections.
              </p>

              <h2>8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices
                or applicable laws. When we do, we will update the &quot;Last updated&quot; date at the
                top of this page. We encourage you to review this page periodically. Continued use of
                PixelForge after changes are posted constitutes your acceptance of the revised policy.
              </p>

              <h2>9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, how your data is handled, or wish
                to exercise any data rights you may have, please{' '}
                <Link href="/contact">contact us</Link> or email us at{' '}
                <a href="mailto:[YOUR EMAIL]">[YOUR EMAIL]</a>.
              </p>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
