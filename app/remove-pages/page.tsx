'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DropZone from '@/components/DropZone';
import { pdfToImages, ConversionResult } from '@/lib/pdfToImages';
import { removePagesFromPdf } from '@/lib/removePdfPages';
import { saveAs } from 'file-saver';

type State = 'idle' | 'rendering' | 'selecting' | 'converting' | 'done' | 'error';

export default function RemovePagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<State>('idle');
  const [thumbnails, setThumbnails] = useState<ConversionResult[]>([]);
  const [removedPages, setRemovedPages] = useState<Set<number>>(new Set());
  
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files.find((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (!f) {
      showToast('⚠️ Please upload a PDF file.', 'error');
      return;
    }
    setFile(f);
    setFileName(f.name.replace(/\.[^/.]+$/, ''));
    setState('rendering');
    setError('');
    setProgress(0);
    setRemovedPages(new Set());
    setThumbnails([]);

    try {
      // Use scale 0.5 for fast thumbnail generation
      const results = await pdfToImages(
        f,
        (current, total) => {
          setProgress(Math.round((current / total) * 100));
        },
        0.5
      );
      setThumbnails(results);
      setState('selecting');
    } catch (err) {
      console.error(err);
      setError('Failed to load PDF pages. Please try a different file.');
      setState('error');
    }
  }, []);

  const togglePage = (pageNum: number) => {
    setRemovedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  };

  const handleConvert = async () => {
    if (!file) return;
    if (removedPages.size === thumbnails.length) {
      showToast('⚠️ You cannot remove all pages.', 'error');
      return;
    }
    
    setState('converting');
    try {
      const bytes = await removePagesFromPdf(file, removedPages);
      const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
      setResultBlob(blob);
      setState('done');
      showToast('✓ Pages removed successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to remove pages. Please try again.');
      setState('error');
    }
  };

  const downloadFile = () => {
    if (!resultBlob) return;
    saveAs(resultBlob, `${fileName}_modified.pdf`);
    showToast('✓ File downloaded!');
  };

  const reset = () => {
    setState('idle');
    setFile(null);
    setThumbnails([]);
    setRemovedPages(new Set());
    setResultBlob(null);
    setProgress(0);
    setError('');
    setFileName('');
  };

  // Remaining pages count
  const remainingCount = thumbnails.length - removedPages.size;

  return (
    <>
      <Navbar />
      <main className="page-content">
        {toast && (
          <div className={`toast-notification animate-in ${toast.type === 'error' ? 'toast-error' : ''}`}>
            {toast.msg}
          </div>
        )}

        <div className="container">
          {/* Back button */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-removepages">
              ← Back to Home
            </Link>
          </div>

          {(state === 'idle' || state === 'error') && (
            <>
              <div className="tool-header animate-in">
                <div className="tool-header-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <span style={{ fontSize: '32px' }}>🗑️</span>
                </div>
                <h1>Remove PDF Pages</h1>
                <p>
                  Delete unwanted pages from your PDF online for free. Visual page selection, completely private and browser-based.
                </p>
              </div>

              <div className="tool-workspace animate-in delay-1">
                <DropZone
                  onFiles={handleFiles}
                  accept="application/pdf"
                  icon="🗑️"
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
                    <span className="p2e-info-icon">👁️</span>
                    <div>
                      <div className="p2e-info-title">Visual Selection</div>
                      <div className="p2e-info-body">See thumbnails of every page before deleting them.</div>
                    </div>
                  </div>
                  <div className="p2e-info-card">
                    <span className="p2e-info-icon">🔒</span>
                    <div>
                      <div className="p2e-info-title">100% Private</div>
                      <div className="p2e-info-body">Processing happens in your browser. No server uploads.</div>
                    </div>
                  </div>
                  <div className="p2e-info-card">
                    <span className="p2e-info-icon">⚡</span>
                    <div>
                      <div className="p2e-info-title">Instant Download</div>
                      <div className="p2e-info-body">Get your modified PDF immediately without waiting.</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {state === 'rendering' && (
            <div className="p2e-progress-card animate-in">
              <div className="p2e-progress-icon">👁️</div>
              <h2 className="p2e-progress-title">Loading PDF Preview...</h2>
              <p className="p2e-progress-sub">Generating thumbnails so you can select pages</p>
              
              <div className="p2e-bar-wrap">
                <div className="p2e-bar">
                  <div className="p2e-bar-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="p2e-bar-pct">{progress}%</div>
              </div>
            </div>
          )}

          {state === 'selecting' && file && (
            <div className="animate-in delay-1">
              <div className="action-bar">
                <div className="action-bar-left">
                  <span style={{ fontSize: 20 }}>📄</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Total: {thumbnails.length} pages · Removing: {removedPages.size} · Keeping: {remainingCount}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setRemovedPages(new Set())}>
                    Clear Selection
                  </button>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={handleConvert}
                    disabled={removedPages.size === thumbnails.length}
                  >
                    Remove Pages & Download
                  </button>
                </div>
              </div>

              <div className="info-note" style={{ marginBottom: '24px' }}>
                <strong>Instructions:</strong> Click on the pages you want to remove. They will be highlighted in red with a trash icon.
              </div>

              <div className="remove-pages-grid">
                {thumbnails.map((thumb) => {
                  const isRemoved = removedPages.has(thumb.pageNumber);
                  return (
                    <div 
                      key={thumb.pageNumber} 
                      className={`page-thumbnail-card ${isRemoved ? 'removed' : ''}`}
                      onClick={() => togglePage(thumb.pageNumber)}
                    >
                      <div className="page-thumbnail-img-wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={thumb.dataUrl} 
                          alt={`Page ${thumb.pageNumber}`} 
                          className="page-thumbnail-img"
                        />
                        {isRemoved && (
                          <div className="page-thumbnail-overlay animate-in">
                            <span className="overlay-icon">🗑️</span>
                          </div>
                        )}
                      </div>
                      <div className="page-thumbnail-label">
                        Page {thumb.pageNumber}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {state === 'converting' && (
            <div className="p2e-progress-card animate-in">
              <div className="p2e-progress-icon">⚙️</div>
              <h2 className="p2e-progress-title">Processing PDF...</h2>
              <p className="p2e-progress-sub">Removing {removedPages.size} pages from your document</p>
              
              <div className="spinner" style={{ margin: '30px auto 10px', width: '32px', height: '32px', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {state === 'done' && file && resultBlob && (
            <div className="animate-in delay-1" style={{ marginTop: 24 }}>
              <div className="split-main-layout">
                {/* Left: success visual */}
                <div className="split-main-left">
                  <div className="glass-card p2e-result-preview">
                    <div className="p2e-result-icon">✅</div>
                    <h3 className="p2e-result-title">Pages Removed</h3>
                    <p className="p2e-result-sub">
                      Successfully removed {removedPages.size} page{removedPages.size !== 1 ? 's' : ''}. The remaining {remainingCount} page{remainingCount !== 1 ? 's' : ''} have been saved.
                    </p>
                  </div>
                </div>

                {/* Right: controls */}
                <div className="split-main-right">
                  <div className="action-bar" style={{ marginTop: 0 }}>
                    <div className="action-bar-left">
                      <span style={{ fontSize: 20 }}>📄</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', wordBreak: 'break-all' }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {(resultBlob.size / 1024).toFixed(1)} KB (Modified)
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={reset}>
                      🗑 Remove
                    </button>
                  </div>

                  <div className="html2pdf-note" style={{ marginTop: 16 }}>
                    <span style={{ fontSize: 16 }}>ℹ️</span>
                    <span>
                      Original PDF structure and quality have been fully preserved. Only the selected pages were removed.
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                    <button
                      className="btn btn-primary"
                      onClick={downloadFile}
                      style={{ width: '100%', padding: '16px', fontSize: 16 }}
                    >
                      ⬇️ Download {fileName}_modified.pdf
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={reset}
                      style={{ width: '100%' }}
                    >
                      Process Another PDF
                    </button>
                  </div>

                  <div className="html2pdf-steps" style={{ marginTop: 20 }}>
                    {[
                      { n: '1', text: 'PDF loaded in browser' },
                      { n: '2', text: 'Selected pages removed' },
                      { n: '3', text: 'New PDF document generated' },
                      { n: '4', text: 'Ready for download' },
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
