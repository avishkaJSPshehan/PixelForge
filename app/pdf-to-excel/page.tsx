'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DropZone from '@/components/DropZone';

type State = 'idle' | 'converting' | 'done' | 'error';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 8000);
}

export default function PdfToExcelPage() {
  const [file,        setFile]        = useState<File | null>(null);
  const [state,       setState]       = useState<State>('idle');
  const [progress,    setProgress]    = useState(0);
  const [progressTxt, setProgressTxt] = useState('');
  const [sheetCount,  setSheetCount]  = useState(0);
  const [resultBlob,  setResultBlob]  = useState<Blob | null>(null);
  const [baseName,    setBaseName]    = useState('');
  const [error,       setError]       = useState('');
  const [toast,       setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files[0];
    if (!f || f.type !== 'application/pdf') {
      showToast('⚠️ Please upload a valid PDF file.', 'error');
      return;
    }

    setState('converting');
    setFile(f);
    setError('');
    setProgress(0);
    setProgressTxt('Reading PDF…');
    setResultBlob(null);
    setBaseName(f.name.replace(/\.pdf$/i, ''));

    try {
      const { pdfToExcel } = await import('@/lib/pdfToExcel');

      const { sheets, blob } = await pdfToExcel(f, (current, total) => {
        const pct = Math.round((current / total) * 100);
        setProgress(pct);
        setProgressTxt(`Extracting page ${current} of ${total}…`);
      });

      setSheetCount(sheets.length);
      setResultBlob(blob);
      setState('done');
      showToast(`✓ ${sheets.length} page${sheets.length !== 1 ? 's' : ''} extracted — ready to download!`);
    } catch (err) {
      console.error(err);
      setError('Failed to convert PDF. Make sure the file is a valid, non-password-protected PDF.');
      setState('error');
      showToast('⚠️ Conversion failed.', 'error');
    }
  }, []);

  const handleDownload = () => {
    if (!resultBlob) return;
    downloadBlob(resultBlob, `${baseName}.xlsx`);
    showToast('✓ Excel file downloaded!');
  };

  const reset = () => {
    setFile(null);
    setState('idle');
    setProgress(0);
    setProgressTxt('');
    setSheetCount(0);
    setResultBlob(null);
    setBaseName('');
    setError('');
  };

  const isConverting = state === 'converting';

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">

          {/* Back */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-pdf2excel">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="tool-header animate-in">
            <div
              className="tool-header-icon"
              style={{
                background: 'linear-gradient(135deg,rgba(29,167,93,.18),rgba(56,178,100,.1))',
                border: '1px solid rgba(29,167,93,.25)',
              }}
            >
              📊
            </div>
            <h1>PDF to Excel</h1>
            <p>
              Upload a PDF and extract all text into a structured Excel spreadsheet (.xlsx) —
              free, browser-based, no sign-up, your files never leave your device.
            </p>
          </div>

          {/* ── Idle: Drop Zone ── */}
          {state === 'idle' && (
            <div className="animate-in delay-1">
              <DropZone
                accept=".pdf,application/pdf"
                multiple={false}
                onFiles={handleFiles}
                icon="📊"
                title="Drop your PDF here"
                subtitle="Text will be extracted and structured into rows & columns"
                badge="PDF → XLSX"
                disabled={false}
              />

              {/* Info callout */}
              <div className="p2e-info-grid">
                <div className="p2e-info-card">
                  <span className="p2e-info-icon">📋</span>
                  <div>
                    <div className="p2e-info-title">One sheet per page</div>
                    <div className="p2e-info-body">Each PDF page becomes its own Excel sheet for easy navigation.</div>
                  </div>
                </div>
                <div className="p2e-info-card">
                  <span className="p2e-info-icon">🔒</span>
                  <div>
                    <div className="p2e-info-title">100% Private</div>
                    <div className="p2e-info-body">All extraction happens in your browser. No uploads, no servers.</div>
                  </div>
                </div>
                <div className="p2e-info-card">
                  <span className="p2e-info-icon">⚡</span>
                  <div>
                    <div className="p2e-info-title">Instant Download</div>
                    <div className="p2e-info-body">Get your .xlsx file immediately — no waiting for server processing.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Converting: Progress ── */}
          {isConverting && (
            <div className="glass-card animate-fade p2e-progress-card">
              <div className="p2e-progress-icon">📊</div>
              <h3 className="p2e-progress-title">Extracting text from PDF…</h3>
              <p className="p2e-progress-sub">{progressTxt}</p>

              <div className="p2e-bar-wrap">
                <div className="p2e-bar">
                  <div className="p2e-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="p2e-bar-pct">{progress}%</span>
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {state === 'error' && (
            <div className="glass-card animate-fade" style={{ padding: '36px 28px', textAlign: 'center', marginTop: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
              <h3 style={{ marginBottom: 8 }}>Conversion Failed</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>{error}</p>
              <button className="btn btn-secondary" onClick={reset}>Try Again</button>
            </div>
          )}

          {/* ── Done: Result ── */}
          {state === 'done' && file && resultBlob && (
            <div className="animate-in delay-1" style={{ marginTop: 24 }}>
              <div className="split-main-layout">

                {/* Left: success visual */}
                <div className="split-main-left">
                  <div className="glass-card p2e-result-preview">
                    <div className="p2e-result-icon">✅</div>
                    <h3 className="p2e-result-title">Extraction Complete</h3>
                    <p className="p2e-result-sub">
                      {sheetCount} page{sheetCount !== 1 ? 's' : ''} converted into{' '}
                      {sheetCount} Excel sheet{sheetCount !== 1 ? 's' : ''}.
                    </p>

                    {/* Sheet breakdown */}
                    <div className="p2e-sheet-list">
                      {Array.from({ length: Math.min(sheetCount, 8) }, (_, i) => (
                        <div key={i} className="p2e-sheet-pill">
                          📋 Page {i + 1}
                        </div>
                      ))}
                      {sheetCount > 8 && (
                        <div className="p2e-sheet-pill p2e-sheet-pill--more">
                          +{sheetCount - 8} more…
                        </div>
                      )}
                    </div>
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
                          {(file.size / 1024).toFixed(1)} KB · {sheetCount} page{sheetCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={reset} id="btn-reset-pdf2excel">
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
                      onClick={handleDownload}
                      id="btn-download-excel"
                      style={{ width: '100%', padding: '16px', fontSize: 16 }}
                    >
                      ⬇️ Download {baseName}.xlsx
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={reset}
                      id="btn-convert-another"
                      style={{ width: '100%' }}
                    >
                      Convert Another PDF
                    </button>
                  </div>

                  {/* Step hint */}
                  <div className="html2pdf-steps" style={{ marginTop: 20 }}>
                    {[
                      { n: '1', text: 'PDF text layer read in browser' },
                      { n: '2', text: 'Text grouped into rows & columns' },
                      { n: '3', text: 'Excel workbook built (1 sheet per page)' },
                      { n: '4', text: 'Click Download — open in Excel or Sheets' },
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

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}
