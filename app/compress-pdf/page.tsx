'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DropZone from '@/components/DropZone';
import { type CompressionLevel, COMPRESSION_CONFIGS } from '@/lib/compressPdf';

type State = 'idle' | 'compressing' | 'done' | 'error';

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

export default function CompressPdfPage() {
  const [file,         setFile]         = useState<File | null>(null);
  const [state,        setState]        = useState<State>('idle');
  const [progress,     setProgress]     = useState(0);
  const [progressTxt,  setProgressTxt]  = useState('');
  const [level,        setLevel]        = useState<CompressionLevel>('medium');
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

  const handleCompress = useCallback(async () => {
    if (!file) return;
    setState('compressing');
    setProgress(0);
    setProgressTxt('Preparing…');

    try {
      const { compressPdf } = await import('@/lib/compressPdf');

      const bytes = await compressPdf(file, level, (pct) => {
        setProgress(pct);
        if (pct < 10)  setProgressTxt('Loading PDF…');
        else if (pct < 90) setProgressTxt(`Compressing pages… ${pct}%`);
        else setProgressTxt('Finalising compressed PDF…');
      });

      setResultBytes(bytes);
      setState('done');
    } catch (err) {
      console.error(err);
      setError('Compression failed. Make sure the PDF is valid and not password-protected.');
      setState('error');
      showToast('⚠️ Compression failed.', 'error');
    }
  }, [file, level]);

  const handleDownload = () => {
    if (!resultBytes) return;
    downloadBlob(resultBytes, `${baseName}_compressed.pdf`);
    showToast('✓ Compressed PDF downloaded!');
  };

  const reset = () => {
    setFile(null);
    setResultBytes(null);
    setProgress(0);
    setProgressTxt('');
    setError('');
    setState('idle');
    setBaseName('');
  };

  const savedBytes = file && resultBytes ? file.size - resultBytes.byteLength : 0;
  const savingPct  = file && resultBytes ? Math.max(0, Math.round((savedBytes / file.size) * 100)) : 0;

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">

          {/* Back */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-compress">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="tool-header animate-in">
            <div
              className="tool-header-icon"
              style={{
                background: 'linear-gradient(135deg,rgba(139,92,246,.18),rgba(167,139,250,.1))',
                border: '1px solid rgba(139,92,246,.25)',
              }}
            >
              🗜️
            </div>
            <h1>Compress PDF</h1>
            <p>
              Reduce your PDF file size instantly — free, browser-based, no uploads to servers.
              Choose your compression level and download the optimised PDF.
            </p>
          </div>

          {/* ── Idle: Drop Zone + Settings ── */}
          {state === 'idle' && (
            <div className="animate-in delay-1">
              {!file ? (
                <>
                  <DropZone
                    accept="application/pdf"
                    multiple={false}
                    onFiles={handleFiles}
                    icon="🗜️"
                    title="Drop your PDF here"
                    subtitle="Drag & drop a PDF file, or click to browse"
                    badge="PDF → Compressed PDF"
                  />

                  {/* Info cards */}
                  <div className="p2e-info-grid">
                    <div className="p2e-info-card">
                      <span className="p2e-info-icon">📉</span>
                      <div>
                        <div className="p2e-info-title">Reduce file size</div>
                        <div className="p2e-info-body">Significantly shrink large PDFs for sharing or storage.</div>
                      </div>
                    </div>
                    <div className="p2e-info-card">
                      <span className="p2e-info-icon">🔒</span>
                      <div>
                        <div className="p2e-info-title">100% Private</div>
                        <div className="p2e-info-body">All processing in your browser. Files never leave your device.</div>
                      </div>
                    </div>
                    <div className="p2e-info-card">
                      <span className="p2e-info-icon">⚡</span>
                      <div>
                        <div className="p2e-info-title">Three Levels</div>
                        <div className="p2e-info-body">Choose Low, Medium or High compression to suit your needs.</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* File selected - show settings panel */
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
                          Original size: {formatBytes(file.size)}
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={reset}>🗑 Remove</button>
                  </div>

                  {/* Compression level picker */}
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Compression Level
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {(Object.entries(COMPRESSION_CONFIGS) as [CompressionLevel, { label: string }][]).map(([key, cfg]) => (
                        <label
                          key={key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '14px 18px',
                            borderRadius: 10,
                            border: `2px solid ${level === key ? 'var(--primary)' : 'var(--border)'}`,
                            background: level === key ? 'rgba(139,92,246,.06)' : 'var(--bg-card)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <input
                            type="radio"
                            name="compressionLevel"
                            value={key}
                            checked={level === key}
                            onChange={() => setLevel(key)}
                            style={{ accentColor: 'var(--primary)', width: 16, height: 16 }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{cfg.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {key === 'low'    && 'Smaller reduction, highest visual quality'}
                              {key === 'medium' && 'Good balance between size and quality'}
                              {key === 'high'   && 'Maximum reduction, reduced quality'}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleCompress}
                    style={{ width: '100%', padding: '16px', fontSize: 16 }}
                  >
                    🗜️ Compress PDF
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Compressing: Progress ── */}
          {state === 'compressing' && (
            <div className="glass-card animate-fade p2e-progress-card">
              <div className="p2e-progress-icon">🗜️</div>
              <h3 className="p2e-progress-title">Compressing your PDF…</h3>
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
              <h3 style={{ marginBottom: 8 }}>Compression Failed</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>{error}</p>
              <button className="btn btn-secondary" onClick={reset}>Try Again</button>
            </div>
          )}

          {/* ── Done: Result ── */}
          {state === 'done' && file && resultBytes && (
            <div className="animate-in delay-1" style={{ marginTop: 24 }}>
              <div className="split-main-layout">

                {/* Left: stats visual */}
                <div className="split-main-left">
                  <div className="glass-card p2e-result-preview">
                    <div className="p2e-result-icon">✅</div>
                    <h3 className="p2e-result-title">Compression Complete</h3>
                    <p className="p2e-result-sub">
                      {savingPct > 0
                        ? `File size reduced by ${savingPct}% (${formatBytes(savedBytes)} saved).`
                        : 'Compression applied. This PDF may already be optimised.'}
                    </p>

                    {/* Size comparison */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(239,68,68,0.06)', borderRadius: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Original Size</span>
                        <span style={{ fontWeight: 700, color: '#ef4444', fontSize: 15 }}>{formatBytes(file.size)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(34,197,94,0.06)', borderRadius: 8 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Compressed Size</span>
                        <span style={{ fontWeight: 700, color: '#22c55e', fontSize: 15 }}>{formatBytes(resultBytes.byteLength)}</span>
                      </div>
                      {savingPct > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(139,92,246,0.06)', borderRadius: 8 }}>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Space Saved</span>
                          <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>{savingPct}%</span>
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
                          {formatBytes(file.size)} → {formatBytes(resultBytes.byteLength)}
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={reset} id="btn-reset-compress">
                      🗑 Remove
                    </button>
                  </div>

                  {/* Info note */}
                  <div className="html2pdf-note" style={{ marginTop: 16 }}>
                    <span style={{ fontSize: 16 }}>ℹ️</span>
                    <span>
                      Pages were re-rendered at reduced image quality using the{' '}
                      <strong>{COMPRESSION_CONFIGS[level].label}</strong> setting.
                    </span>
                  </div>

                  {/* Download button */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleDownload}
                      id="btn-download-compressed"
                      style={{ width: '100%', padding: '16px', fontSize: 16 }}
                    >
                      ⬇️ Download {baseName}_compressed.pdf
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={reset}
                      id="btn-compress-another"
                      style={{ width: '100%' }}
                    >
                      Compress Another PDF
                    </button>
                  </div>

                  {/* Step hint */}
                  <div className="html2pdf-steps" style={{ marginTop: 20 }}>
                    {[
                      { n: '1', text: 'PDF pages rendered in browser' },
                      { n: '2', text: 'Pages encoded as JPEG at reduced quality' },
                      { n: '3', text: 'New PDF rebuilt with compressed images' },
                      { n: '4', text: 'Ready to download — no data sent anywhere' },
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
