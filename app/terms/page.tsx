import Navbar from '@/components/Navbar';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service – PixelForge | Terms of Use',
  description:
    'Read the PixelForge Terms of Service. By using our free, browser-based PDF tools you agree to these terms. No account required, no file uploads — learn about our service conditions and limitations.',
  alternates: { canonical: 'https://www.pixel-forge.online/terms' },
};

const LAST_UPDATED = 'July 24, 2026';

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
              <h1>Terms of Service</h1>
              <p>Last updated: {LAST_UPDATED}</p>
            </div>

            <div className="static-page-content animate-in delay-1">

              <p>
                Please read these Terms of Service (&quot;Terms&quot;) carefully before using PixelForge
                (the &quot;Service&quot;), operated by <strong>ByteBuilders</strong>. By accessing or
                using the Service, you agree to be bound by these Terms. If you do not agree, please
                do not use the Service.
              </p>

              <h2>1. Use of Service</h2>
              <p>
                PixelForge provides free, browser-based file tools including but not limited to PDF
                merging, splitting, compressing, converting, watermarking, and page numbering. You may
                use the Service for personal, educational, or commercial purposes, provided you do so
                lawfully.
              </p>
              <p>
                You agree not to use the Service to process, distribute, or create materials that
                are illegal, infringe on any third party&apos;s intellectual property rights, contain
                malware or malicious code, or violate any applicable local, national, or international
                law or regulation.
              </p>

              <h2>2. No Account, No Warranty of Uptime</h2>
              <p>
                The Service does not require account registration. All tools are freely accessible
                without creating an account or providing any personal information. While we strive
                to keep PixelForge available at all times, we make <strong>no guarantee of uptime,
                availability, or continuous access</strong>. The Service may be interrupted for
                maintenance, updates, or circumstances beyond our control without prior notice.
              </p>
              <p>
                We reserve the right to modify, suspend, or discontinue the Service (or any part
                of it) at any time without liability to you.
              </p>

              <h2>3. Your Responsibility</h2>
              <p>
                You are solely responsible for the files you choose to process using PixelForge.
                By using the Service, you confirm that:
              </p>
              <ul>
                <li>You have the legal right to process, convert, or modify the files you upload into the tool.</li>
                <li>The files do not contain content that violates any law or the rights of any third party, including copyright, trademark, privacy, or defamation laws.</li>
                <li>You will not use the Service to circumvent copy protection, digital rights management, or encryption on any file.</li>
                <li>You accept full responsibility for any consequences arising from the files you process and how you use the output.</li>
              </ul>
              <p>
                ByteBuilders takes no responsibility for the legality or appropriateness of files
                processed by users of the Service.
              </p>

              <h2>4. File Privacy</h2>
              <p>
                All file processing on PixelForge occurs locally within your browser. Your files are
                never transmitted to our servers, never stored on our infrastructure, and are not
                accessible to ByteBuilders or any third party. For full details on how your data
                is handled, please review our <Link href="/privacy">Privacy Policy</Link>.
              </p>

              <h2>5. Limitation of Liability</h2>
              <p>
                The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranty
                of any kind, express or implied, including but not limited to warranties of
                merchantability, fitness for a particular purpose, or non-infringement.
              </p>
              <p>
                <strong>We strongly recommend keeping backups of all important documents before
                processing them.</strong> To the maximum extent permitted by applicable law,
                ByteBuilders shall not be liable for any indirect, incidental, special, consequential,
                or punitive damages arising from your use of the Service, including but not limited to:
              </p>
              <ul>
                <li>Loss of data or document corruption resulting from tool use.</li>
                <li>Inaccurate conversion output (e.g., formatting loss in document conversions).</li>
                <li>Any business losses incurred as a result of relying on the Service&apos;s output.</li>
              </ul>
              <p>
                You use the Service at your own risk.
              </p>

              <h2>6. Advertising</h2>
              <p>
                PixelForge is a free service supported in part by advertising. Third-party advertisements
                may be displayed on pages of this website. These ads are served by Google AdSense and
                may use cookies to show relevant advertisements based on your interests. ByteBuilders
                does not control the content of these advertisements and is not responsible for any
                products or services advertised.
              </p>
              <p>
                You can manage your ad preferences or opt out of personalised advertising at{' '}
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.
              </p>

              <h2>7. Intellectual Property</h2>
              <p>
                You retain full ownership of any files you process using PixelForge. ByteBuilders
                makes no claim to your documents, their contents, or the output files generated by
                the Service.
              </p>
              <p>
                The PixelForge name, logo, branding, and underlying application code are the
                intellectual property of <strong>ByteBuilders</strong> and may not be reproduced,
                copied, distributed, or used commercially without prior written permission from
                ByteBuilders.
              </p>

              <h2>8. Changes to These Terms</h2>
              <p>
                We reserve the right to update these Terms of Service at any time. Changes will
                be posted on this page with an updated &quot;Last updated&quot; date. Continued
                use of the Service after changes are posted constitutes your acceptance of the
                revised Terms. If you do not agree to the updated Terms, you should stop using
                the Service.
              </p>

              <h2>9. Contact</h2>
              <p>
                Questions about these Terms? <Link href="/contact">Contact us</Link> or email us at{' '}
                <a href="mailto:[YOUR EMAIL]">[YOUR EMAIL]</a>.
              </p>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
