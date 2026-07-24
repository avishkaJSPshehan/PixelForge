'use client';
import { incrementFileCount } from '@/lib/fileCounter';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DropZone from '@/components/DropZone';

type State = 'idle' | 'protecting' | 'done' | 'error';

function downloadBlob(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 8000);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ProtectPdfPage() {
  const [file,         setFile]         = useState<File | null>(null);
  const [state,        setState]        = useState<State>('idle');
  const [password,     setPassword]     = useState('');
  const [confirmPwd,   setConfirmPwd]   = useState('');
  const [showPwd,      setShowPwd]      = useState(false);
  const [resultBytes,  setResultBytes]  = useState<Uint8Array | null>(null);
  const [baseName,     setBaseName]     = useState('');
  const [error,        setError]        = useState('');
  const [toast,        setToast]        = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFiles = useCallback((files: File[]) => {
    const f = files[0];
    if (!f || (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf'))) {
      showToast('⚠️ Please upload a valid PDF file.', 'error');
      return;
    }
    setFile(f);
    setBaseName(f.name.replace(/\.pdf$/i, ''));
    setResultBytes(null);
    setError('');
    setState('idle');
  }, []);

  const handleProtect = useCallback(async () => {
    if (!file) return;

    if (!password.trim()) {
      showToast('⚠️ Please enter a password.', 'error');
      return;
    }
    if (password !== confirmPwd) {
      showToast('⚠️ Passwords do not match.', 'error');
      return;
    }
    if (password.length < 4) {
      showToast('⚠️ Password must be at least 4 characters.', 'error');
      return;
    }

    setState('protecting');
    setError('');

    try {
      const { protectPdf } = await import('@/lib/protectPdf');
      const bytes = await protectPdf(file, password);
      setResultBytes(bytes);
      incrementFileCount();
      setState('done');
    } catch (err) {
      console.error(err);
      setError('Failed to protect the PDF. Make sure it is a valid, non-corrupted PDF file.');
      setState('error');
      showToast('⚠️ Protection failed.', 'error');
    }
  }, [file, password, confirmPwd]);

  const handleDownload = () => {
    if (!resultBytes) return;
    downloadBlob(resultBytes, `${baseName}_protected.pdf`);
    showToast('✓ Protected PDF downloaded!');
  };

  const reset = () => {
    setFile(null);
    setResultBytes(null);
    setPassword('');
    setConfirmPwd('');
    setShowPwd(false);
    setError('');
    setState('idle');
    setBaseName('');
  };

  const passwordStrength = (() => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: 'Weak', color: '#ef4444', width: '33%' };
    if (password.length < 10) return { label: 'Medium', color: '#f59e0b', width: '66%' };
    return { label: 'Strong', color: '#22c55e', width: '100%' };
  })();

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">

          {/* Back */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-protect">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="tool-header animate-in">
            <div
              className="tool-header-icon"
              style={{
                background: 'linear-gradient(135deg,rgba(239,68,68,.18),rgba(220,38,38,.1))',
                border: '1px solid rgba(239,68,68,.25)',
              }}
            >
              🔐
            </div>
            <h1>PDF Password Protect</h1>
            <p>
              Encrypt your PDF with a password instantly — free, browser-based, 100% private.
              Your file never leaves your device.
            </p>
          </div>

          {/* ── Idle: Drop Zone ── */}
          {state === 'idle' && (
            <div className="animate-in delay-1">
              {!file ? (
                <>
                  <DropZone
                    accept="application/pdf"
                    multiple={false}
                    onFiles={handleFiles}
                    icon="🔐"
                    title="Drop your PDF here"
                    subtitle="Drag & drop a PDF file, or click to browse"
                    badge="PDF → Password Protected PDF"
                  />

                  {/* Info cards */}
                  <div className="p2e-info-grid">
                    <div className="p2e-info-card">
                      <span className="p2e-info-icon">🔐</span>
                      <div>
                        <div className="p2e-info-title">Strong Encryption</div>
                        <div className="p2e-info-body">Your PDF is encrypted with RC4-128 — compatible with all PDF readers.</div>
                      </div>
                    </div>
                    <div className="p2e-info-card">
                      <span className="p2e-info-icon">🔒</span>
                      <div>
                        <div className="p2e-info-title">100% Private</div>
                        <div className="p2e-info-body">All processing in your browser. Your password and file never leave your device.</div>
                      </div>
                    </div>
                    <div className="p2e-info-card">
                      <span className="p2e-info-icon">⚡</span>
                      <div>
                        <div className="p2e-info-title">Instant Protection</div>
                        <div className="p2e-info-body">Password is applied in seconds without any server processing.</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* File selected — show password form */
                <div className="glass-card animate-in" style={{ padding: '32px', marginTop: 8 }}>

                  {/* Uploaded file info */}
                  <div className="action-bar" style={{ marginBottom: 28 }}>
                    <div className="action-bar-left">
                      <span style={{ fontSize: 24 }}>📄</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', wordBreak: 'break-all' }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {formatBytes(file.size)}
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={reset}>🗑 Remove</button>
                  </div>

                  {/* Password inputs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPwd ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter a strong password"
                          style={{
                            width: '100%',
                            padding: '14px 48px 14px 16px',
                            borderRadius: 6,
                            border: '1.5px solid var(--border)',
                            background: 'var(--bg-card)',
                            color: 'var(--text)',
                            fontSize: 15,
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                          id="input-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd(!showPwd)}
                          style={{
                            position: 'absolute',
                            right: 14,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--text-muted)',
                          }}
                          aria-label="Toggle password visibility"
                        >
                          {showPwd ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Password strength bar */}
                      {passwordStrength && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: passwordStrength.width, background: passwordStrength.color, transition: 'width 0.3s, background 0.3s', borderRadius: 4 }} />
                          </div>
                          <div style={{ fontSize: 12, color: passwordStrength.color, marginTop: 4, fontWeight: 600 }}>
                            {passwordStrength.label}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Confirm Password
                      </label>
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        placeholder="Re-enter your password"
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          borderRadius: 6,
                          border: `1.5px solid ${confirmPwd && confirmPwd !== password ? '#ef4444' : 'var(--border)'}`,
                          background: 'var(--bg-card)',
                          color: 'var(--text)',
                          fontSize: 15,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        id="input-confirm-password"
                        onKeyDown={(e) => e.key === 'Enter' && handleProtect()}
                      />
                      {confirmPwd && confirmPwd !== password && (
                        <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>Passwords do not match</div>
                      )}
                      {confirmPwd && confirmPwd === password && password.length > 0 && (
                        <div style={{ fontSize: 12, color: '#22c55e', marginTop: 4 }}>✓ Passwords match</div>
                      )}
                    </div>
                  </div>

                  <div className="html2pdf-note" style={{ marginTop: 20 }}>
                    <span style={{ fontSize: 16 }}>💡</span>
                    <span>
                      Remember your password — there is no way to recover it if forgotten.
                    </span>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleProtect}
                    style={{ width: '100%', padding: '16px', fontSize: 16, marginTop: 20 }}
                    disabled={!password || password !== confirmPwd}
                    id="btn-protect-pdf"
                  >
                    🔐 Protect PDF
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Protecting: Spinner ── */}
          {state === 'protecting' && (
            <div className="glass-card animate-fade p2e-progress-card">
              <div className="p2e-progress-icon">🔐</div>
              <h3 className="p2e-progress-title">Encrypting your PDF…</h3>
              <p className="p2e-progress-sub">Applying password protection in your browser</p>
              <div style={{ margin: '24px auto 0', width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}

          {/* ── Error ── */}
          {state === 'error' && (
            <div className="glass-card animate-fade" style={{ padding: '36px 28px', textAlign: 'center', marginTop: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
              <h3 style={{ marginBottom: 8 }}>Protection Failed</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>{error}</p>
              <button className="btn btn-secondary" onClick={reset}>Try Again</button>
            </div>
          )}

          {/* ── Done: Result ── */}
          {state === 'done' && file && resultBytes && (
            <div className="animate-in delay-1" style={{ marginTop: 24 }}>
              <div className="split-main-layout">

                {/* Left: success visual */}
                <div className="split-main-left">
                  <div className="glass-card p2e-result-preview">
                    <div className="p2e-result-icon">✅</div>
                    <h3 className="p2e-result-title">PDF Protected!</h3>
                    <p className="p2e-result-sub">
                      Your PDF is now encrypted with a password. Anyone who opens it will be asked to enter the password.
                    </p>

                    {/* Security info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(34,197,94,0.06)', borderRadius: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Encryption</span>
                        <span style={{ fontWeight: 700, color: '#22c55e', fontSize: 14 }}>RC4-128</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(34,197,94,0.06)', borderRadius: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>File Size</span>
                        <span style={{ fontWeight: 700, color: '#22c55e', fontSize: 14 }}>{formatBytes(resultBytes.byteLength)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(34,197,94,0.06)', borderRadius: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Password Set</span>
                        <span style={{ fontWeight: 700, color: '#22c55e', fontSize: 14 }}>✓ Yes</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: controls */}
                <div className="split-main-right">

                  {/* File info */}
                  <div className="action-bar" style={{ marginTop: 0 }}>
                    <div className="action-bar-left">
                      <span style={{ fontSize: 20 }}>🔐</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', wordBreak: 'break-all' }}>
                          {baseName}_protected.pdf
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {formatBytes(file.size)} → {formatBytes(resultBytes.byteLength)}
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={reset} id="btn-reset-protect">
                      🗑 Remove
                    </button>
                  </div>

                  {/* Warning note */}
                  <div className="html2pdf-note" style={{ marginTop: 16 }}>
                    <span style={{ fontSize: 16 }}>⚠️</span>
                    <span>
                      Keep your password safe. If you forget it, the PDF cannot be unlocked.
                    </span>
                  </div>

                  {/* Download button */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleDownload}
                      id="btn-download-protected"
                      style={{ width: '100%', padding: '16px', fontSize: 16 }}
                    >
                      ⬇️ Download {baseName}_protected.pdf
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={reset}
                      id="btn-protect-another"
                      style={{ width: '100%' }}
                    >
                      Protect Another PDF
                    </button>
                  </div>

                  {/* Steps */}
                  <div className="html2pdf-steps" style={{ marginTop: 20 }}>
                    {[
                      { n: '1', text: 'PDF loaded in your browser' },
                      { n: '2', text: 'Password applied using RC4-128 encryption' },
                      { n: '3', text: 'Encrypted PDF generated locally' },
                      { n: '4', text: 'Download and share securely' },
                    ].map((s) => (
                      <div key={s.n} className="html2pdf-step">
                        <div className="html2pdf-step-num">{s.n}</div>
                        <div className="html2pdf-step-text">{s.text}</div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
              <div style={{ height: 60 }} />
            </div>
          )}

        </div>
      </main>

      {/* ── Content & FAQ section ── */}
      <div className="tool-content-section">
        <div className="tool-how-to">
          <h2>How to Password-Protect a PDF</h2>
          <div className="tool-steps">
            <div className="tool-step">
              <div className="tool-step-num">1</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Upload your PDF</div>
                <div className="tool-step-desc">Click the upload area or drag your PDF file onto the page. PixelForge reads the file in your browser and prepares it for encryption. The file size and page count will be shown so you can confirm it&apos;s the right document.</div>
              </div>
            </div>
            <div className="tool-step">
              <div className="tool-step-num">2</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Set a password</div>
                <div className="tool-step-desc">Enter the password you want to set for the PDF. Use a strong password — a mix of upper and lowercase letters, numbers, and symbols. Make sure you keep a record of the password somewhere safe, as there is no way to recover an encrypted PDF if the password is lost.</div>
              </div>
            </div>
            <div className="tool-step">
              <div className="tool-step-num">3</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Protect and download</div>
                <div className="tool-step-desc">Click &quot;Protect PDF&quot;. The file is encrypted using PDF standard encryption entirely within your browser. Download the protected PDF and share it securely — recipients will need to enter the password to open it in any PDF viewer.</div>
              </div>
            </div>
          </div>
          <div className="tool-privacy-note">
            <span className="tool-privacy-note-icon">🔒</span>
            <span>
              <strong>Encryption is applied in your browser — your password and document stay private.</strong> Cloud-based PDF protection tools require you to send both your document AND your chosen password to a remote server for encryption. This is a significant security risk — it means both the unencrypted file and the key to access it pass through someone else&apos;s infrastructure. PixelForge encrypts your PDF using pdf-lib entirely in your browser. Neither your document nor your password is ever transmitted to any server.
            </span>
          </div>
        </div>

        <div className="tool-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question">What type of encryption does PixelForge use to protect PDFs?</div>
              <div className="faq-answer">PixelForge uses the PDF standard&apos;s built-in password encryption, which is applied via the pdf-lib library in your browser. The resulting protected PDF follows the PDF specification&apos;s encryption standard and can be opened by any standard PDF reader (Adobe Acrobat, Foxit, Preview on Mac, etc.) that prompts for a password.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Can I remove the password from a PDF I protected with PixelForge?</div>
              <div className="faq-answer">Yes, but you need to know the original password. Use a PDF tool that supports decryption — open the protected PDF, enter the password, and then save/export it without encryption. PixelForge does not currently offer a dedicated &quot;remove password&quot; tool, but most desktop PDF applications can do this.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Will a password-protected PDF work on all devices?</div>
              <div className="faq-answer">Yes. PDF password protection is a standard feature that is universally supported by PDF viewers on all platforms — Windows, Mac, iOS, Android, and Linux. Recipients will be prompted to enter the password when they try to open the file.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">What happens if I lose the password?</div>
              <div className="faq-answer">If you lose the password to a PDF you protected, there is no way to recover it from within PixelForge. We do not store your passwords anywhere. Password recovery for encrypted PDFs requires specialised (and often paid) tools that attempt to crack the password — a process that is not guaranteed to succeed. Always store your password securely before protecting a PDF.</div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What type of encryption does PixelForge use to protect PDFs?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "PixelForge uses the PDF standard's built-in password encryption via the pdf-lib library. The result follows the PDF specification and can be opened by any standard PDF reader that prompts for a password."
                }
              },
              {
                "@type": "Question",
                "name": "Can I remove the password from a PDF I protected with PixelForge?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, if you know the original password. Open the protected PDF in any PDF application, enter the password, and save/export it without encryption. PixelForge does not currently offer a dedicated remove password tool."
                }
              },
              {
                "@type": "Question",
                "name": "Will a password-protected PDF work on all devices?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. PDF password protection is universally supported by PDF viewers on all platforms — Windows, Mac, iOS, Android, and Linux."
                }
              },
              {
                "@type": "Question",
                "name": "What happens if I lose the password for a PDF I protected?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "PixelForge does not store your passwords. Password recovery requires specialised third-party tools. Always store your password securely before protecting a PDF."
                }
              }
            ]
          })
        }}
      />

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}

