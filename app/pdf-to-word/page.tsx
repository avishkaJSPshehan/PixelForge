'use client';

import { useState } from 'react';
import Link from 'next/link';
import { saveAs } from 'file-saver';
import DropZone from '@/components/DropZone';
import Navbar from '@/components/Navbar';
import { convertPdfToWord } from '@/lib/pdfToWord';
import { incrementFileCount } from '@/lib/fileCounter';

export default function PdfToWordPage() {
  const [state, setState] = useState<'idle' | 'converting' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const [file, setFile] = useState<File | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const uploadedFile = files[0];
    setFile(uploadedFile);
    setFileName(uploadedFile.name.replace(/\.[^/.]+$/, ''));
    setError(null);
    setState('converting');
    setProgress(0);

    try {
      const blob = await convertPdfToWord(uploadedFile, (p) => {
        setProgress(p);
      });
      setResultBlob(blob);
      incrementFileCount();
      setState('done');
    } catch (err) {
      console.error(err);
      setError('Failed to convert PDF. Make sure the file is a valid, non-password-protected PDF.');
      setState('idle');
    }
  };

  const downloadFile = () => {
    if (!resultBlob) return;
    saveAs(resultBlob, `${fileName}_converted.docx`);
    showToast('✓ File downloaded!');
  };

  const reset = () => {
    setState('idle');
    setResultBlob(null);
    setProgress(0);
    setFile(null);
  };

  return (
    <>
      <Navbar />
      <main className="page-content">
        {toastMsg && <div className="toast-notification animate-in">{toastMsg}</div>}

        <div className="container">
          {/* Back */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-pdf2word">
              ← Back to Home
            </Link>
          </div>

          {state === 'idle' && (
          <>
            <div className="tool-header animate-in">
              <div className="tool-header-icon" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                <span style={{ fontSize: '32px' }}>📝</span>
              </div>
              <h1>PDF to Word</h1>
              <p>
                Upload a PDF and extract text into a Word document (.docx) -
                free, browser-based, no sign-up, your files never leave your device.
              </p>
            </div>

            <div className="tool-workspace animate-in delay-1">
              <DropZone
                onFiles={handleFiles}
                accept=".pdf,application/pdf"
                icon="📝"
                title="Drop your PDF here"
                subtitle="Only PDF files are supported"
                badge="Max size: Browser limit"
              />

              {error && (
                <div className="alert-error" style={{ marginTop: '24px' }}>
                  <strong>Error:</strong> {error}
                </div>
              )}

              <div className="p2e-info-grid">
                <div className="p2e-info-card">
                  <span className="p2e-info-icon">🔍</span>
                  <div>
                    <div className="p2e-info-title">Text Extraction</div>
                    <div className="p2e-info-body">Native support for Unicode text, including Sinhala characters.</div>
                  </div>
                </div>
                <div className="p2e-info-card">
                  <span className="p2e-info-icon">🔒</span>
                  <div>
                    <div className="p2e-info-title">100% Private</div>
                    <div className="p2e-info-body">We extract text entirely in your browser. No server uploads.</div>
                  </div>
                </div>
                <div className="p2e-info-card">
                  <span className="p2e-info-icon">⚡</span>
                  <div>
                    <div className="p2e-info-title">Instant Download</div>
                    <div className="p2e-info-body">Get your .docx file immediately - no waiting for server processing.</div>
                  </div>
                </div>
              </div>

              <div className="info-note" style={{ marginTop: 24 }}>
                <strong>Note:</strong> This tool extracts embedded text from PDFs. It works perfectly for PDFs saved from Word or browsers. It will <strong>not</strong> work on scanned image-only PDFs since they don&apos;t contain an embedded text layer.
              </div>
            </div>
          </>
        )}

        {state === 'converting' && (
          <div className="p2e-progress-card animate-in">
            <div className="p2e-progress-icon">⚙️</div>
            <h2 className="p2e-progress-title">Converting to Word...</h2>
            <p className="p2e-progress-sub">Reading text layers and building DOCX structure</p>
            
            <div className="p2e-bar-wrap">
              <div className="p2e-bar">
                <div className="p2e-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="p2e-bar-pct">{progress}%</div>
            </div>
          </div>
        )}

        {state === 'done' && file && resultBlob && (
          <div className="animate-in delay-1" style={{ marginTop: 24 }}>
            <div className="split-main-layout">

              {/* Left: success visual */}
              <div className="split-main-left">
                <div className="glass-card p2e-result-preview">
                  <div className="p2e-result-icon">✅</div>
                  <h3 className="p2e-result-title">Extraction Complete</h3>
                  <p className="p2e-result-sub">
                    Your PDF has been successfully converted into a Word document.
                  </p>
                </div>
              </div>

              {/* Right: controls */}
              <div className="split-main-right">

                {/* File info */}
                <div className="action-bar" style={{ marginTop: 0 }}>
                  <div className="action-bar-left">
                    <span style={{ fontSize: 20 }}>📄</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', wordBreak: 'break-all' }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={reset}>
                    🗑 Remove
                  </button>
                </div>

                {/* Info note */}
                <div className="html2pdf-note" style={{ marginTop: 16 }}>
                  <span style={{ fontSize: 16 }}>ℹ️</span>
                  <span>
                    Text was extracted by reading the PDF&apos;s internal text layer.
                    Scanned image-based PDFs or PDFs without a text layer may produce empty or partial results.
                  </span>
                </div>

                {/* Download button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                  <button
                    className="btn btn-primary"
                    onClick={downloadFile}
                    style={{ width: '100%', padding: '16px', fontSize: 16 }}
                  >
                    ⬇️ Download {fileName}.docx
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={reset}
                    style={{ width: '100%' }}
                  >
                    Convert Another PDF
                  </button>
                </div>

                {/* Step hint */}
                <div className="html2pdf-steps" style={{ marginTop: 20 }}>
                  {[
                    { n: '1', text: 'PDF text layer read in browser' },
                    { n: '2', text: 'Text grouped into paragraphs' },
                    { n: '3', text: 'Word DOCX document built' },
                    { n: '4', text: 'Click Download - open in Word' },
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
    </>
  );
}
