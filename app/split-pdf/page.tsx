'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DropZone from '@/components/DropZone';
import { splitPdf } from '@/lib/splitPdf';
import { incrementFileCount } from '@/lib/fileCounter';
import type * as pdfjsLib from 'pdfjs-dist';

type State = 'idle' | 'splitting' | 'done' | 'error';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Renders a single page of a PDF to a data URL */
async function renderPage(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  scale = 0.6
): Promise<string> {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.8);
}

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Preview thumbnails for the first and last selected page
  const [previewFirst, setPreviewFirst] = useState<string>('');
  const [previewLast, setPreviewLast] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Keep a reference to the loaded PDFDocument so we don't re-parse on every preview update
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load the PDF when the file changes
  const handleFiles = useCallback(async (files: File[]) => {
    const f = files.find((f) => f.type === 'application/pdf');
    if (!f) {
      showToast('⚠️ Please upload a PDF file.', 'error');
      return;
    }
    setFile(f);
    setState('idle');
    setError('');
    setPreviewFirst('');
    setPreviewLast('');

    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const buffer = await f.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
    pdfDocRef.current = doc;
    const n = doc.numPages;
    setTotalPages(n);
    setFromPage(1);
    setToPage(n);
  }, []);

  // Re-render previews whenever fromPage / toPage change
  useEffect(() => {
    if (!pdfDocRef.current || totalPages === 0) return;

    let cancelled = false;
    const doc = pdfDocRef.current;

    const update = async () => {
      setPreviewLoading(true);
      const clamped = (n: number) => Math.max(1, Math.min(n, totalPages));
      const from = clamped(fromPage);
      const to = clamped(toPage);

      const [first, last] = await Promise.all([
        renderPage(doc, from),
        from === to ? Promise.resolve('') : renderPage(doc, to),
      ]);
      if (cancelled) return;
      setPreviewFirst(first);
      setPreviewLast(from === to ? '' : last);
      setPreviewLoading(false);
    };

    // Debounce by 300 ms so typing doesn't spam renders
    const timer = setTimeout(update, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fromPage, toPage, totalPages]);

  const handleSplit = async () => {
    if (!file || totalPages === 0) return;

    const from = Math.max(1, Math.min(fromPage, totalPages));
    const to = Math.max(from, Math.min(toPage, totalPages));

    if (from > to) {
      showToast('⚠️ "From" page must be ≤ "To" page.', 'error');
      return;
    }

    setState('splitting');
    setError('');

    try {
      const bytes = await splitPdf(file, from, to);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `${baseName}_pages_${from}-${to}.pdf`);
      incrementFileCount();
      setState('done');
      showToast(`✓ Extracted pages ${from}–${to} successfully!`);
    } catch (err) {
      console.error(err);
      setError('Split failed. Make sure the PDF is not encrypted or corrupted.');
      setState('error');
      showToast('⚠️ Split failed.', 'error');
    }
  };

  const reset = () => {
    setFile(null);
    setTotalPages(0);
    setFromPage(1);
    setToPage(1);
    setPreviewFirst('');
    setPreviewLast('');
    setState('idle');
    setError('');
    pdfDocRef.current = null;
  };

  const clamp = (v: number) => Math.max(1, Math.min(v, totalPages || 1));

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">

          {/* Back button */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-split">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="tool-header animate-in">
            <div className="tool-header-icon" style={{ background: 'linear-gradient(135deg,rgba(255,152,0,.18),rgba(255,193,7,.1))', border: '1px solid rgba(255,152,0,.25)' }}>✂️</div>
            <h1>Split PDF</h1>
            <p>Upload a PDF, choose a page range, and download just those pages.</p>
          </div>

          {/* DropZone - hide once file is loaded */}
          {!file && (
            <div className="animate-in delay-1">
              <DropZone
                accept="application/pdf"
                multiple={false}
                onFiles={handleFiles}
                icon="✂️"
                title="Drop a PDF file here"
                subtitle="Upload a single PDF to extract a page range from it"
                badge="Single PDF"
                disabled={false}
              />
            </div>
          )}

          {/* ── Main panel (file loaded) ── */}
          {file && state !== 'splitting' && (
            <>
              {/* File info bar */}
              <div className="action-bar animate-in" style={{ marginTop: 24 }}>
                <div className="action-bar-left">
                  <span style={{ fontSize: 20 }}>📄</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{totalPages} pages total</div>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={reset} id="btn-reset-split">
                  🗑 Remove
                </button>
              </div>

              {/* ── Main Layout ── */}
              <div className="split-main-layout animate-in delay-1">
                {/* ── Left: Previews ── */}
                <div className="split-main-left">
                  <div className="split-preview-row" style={{ marginTop: 0 }}>
                    {/* First page preview */}
                    <div className="split-preview-box">
                      <div className="split-preview-label">First page (page {clamp(fromPage)})</div>
                      <div className="split-preview-thumb">
                        {previewLoading ? (
                          <div className="split-preview-loading">
                            <div className="spinner" style={{ borderTopColor: 'var(--primary)' }} />
                          </div>
                        ) : previewFirst ? (
                          <img src={previewFirst} alt={`Page ${clamp(fromPage)} preview`} />
                        ) : (
                          <div className="split-preview-placeholder">📄</div>
                        )}
                      </div>
                    </div>

                    {/* Last page preview - only shown when range has 2+ pages */}
                    <div className={`split-preview-box${clamp(fromPage) === clamp(toPage) ? ' split-preview-box-hidden' : ''}`}>
                      <div className="split-preview-label">Last page (page {clamp(toPage)})</div>
                      <div className="split-preview-thumb">
                        {previewLoading ? (
                          <div className="split-preview-loading">
                            <div className="spinner" style={{ borderTopColor: 'var(--primary)' }} />
                          </div>
                        ) : previewLast ? (
                          <img src={previewLast} alt={`Page ${clamp(toPage)} preview`} />
                        ) : (
                          <div className="split-preview-placeholder">📄</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Right: Controls ── */}
                <div className="split-main-right">
                  <div className="split-range-wrap" style={{ marginTop: 0 }}>
                    <div className="split-range-label">Select page range to extract</div>

                    <div className="split-range-inputs" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 24 }}>
                      {/* FROM */}
                      <div className="split-input-group">
                        <label htmlFor="split-from">Start page</label>
                        <div className="split-stepper">
                          <button
                            className="split-stepper-btn"
                            onClick={() => {
                              const v = clamp(fromPage - 1);
                              setFromPage(v);
                            }}
                            disabled={fromPage <= 1}
                            aria-label="Decrease start page"
                            id="btn-from-dec"
                          >−</button>
                          <input
                            id="split-from"
                            type="number"
                            min={1}
                            max={totalPages}
                            value={fromPage}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 1;
                              setFromPage(v);
                              if (v > toPage) setToPage(v);
                            }}
                            onBlur={() => setFromPage(clamp(fromPage))}
                            className="split-num-input"
                          />
                          <button
                            className="split-stepper-btn"
                            onClick={() => {
                              const v = clamp(fromPage + 1);
                              setFromPage(v);
                              if (v > toPage) setToPage(v);
                            }}
                            disabled={fromPage >= totalPages}
                            aria-label="Increase start page"
                            id="btn-from-inc"
                          >+</button>
                        </div>
                        <div className="split-input-hint">min: 1</div>
                      </div>

                      {/* TO */}
                      <div className="split-input-group">
                        <label htmlFor="split-to">End page</label>
                        <div className="split-stepper">
                          <button
                            className="split-stepper-btn"
                            onClick={() => {
                              const v = clamp(toPage - 1);
                              setToPage(v);
                              if (v < fromPage) setFromPage(v);
                            }}
                            disabled={toPage <= 1}
                            aria-label="Decrease end page"
                            id="btn-to-dec"
                          >−</button>
                          <input
                            id="split-to"
                            type="number"
                            min={fromPage}
                            max={totalPages}
                            value={toPage}
                            onChange={(e) => {
                              const v = parseInt(e.target.value) || 1;
                              setToPage(v);
                              if (v < fromPage) setFromPage(v);
                            }}
                            onBlur={() => setToPage(clamp(toPage))}
                            className="split-num-input"
                          />
                          <button
                            className="split-stepper-btn"
                            onClick={() => {
                              const v = clamp(toPage + 1);
                              setToPage(v);
                            }}
                            disabled={toPage >= totalPages}
                            aria-label="Increase end page"
                            id="btn-to-inc"
                          >+</button>
                        </div>
                        <div className="split-input-hint">max: {totalPages}</div>
                      </div>
                    </div>

                    {/* Pages count badge */}
                    <div style={{ marginTop: 24, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      {Math.max(0, clamp(toPage) - clamp(fromPage) + 1)} page{Math.max(0, clamp(toPage) - clamp(fromPage) + 1) !== 1 ? 's' : ''} will be extracted
                    </div>
                  </div>

                  {error && (
                    <p style={{ color: 'var(--secondary)', fontSize: 14, marginTop: 10 }}>⚠️ {error}</p>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 12, marginTop: 12, flexDirection: 'column' }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleSplit}
                      disabled={totalPages === 0}
                      id="btn-split-pdf"
                      style={{ width: '100%', padding: '16px', fontSize: 16 }}
                    >
                      ✂️ Extract & Download
                    </button>
                    {state === 'done' && (
                      <span className="badge badge-success" style={{ padding: '8px 14px', alignSelf: 'center', width: '100%', textAlign: 'center' }}>✓ PDF Extracted!</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ height: 60 }} />
            </>
          )}

          {/* Splitting progress */}
          {state === 'splitting' && (
            <div className="glass-card animate-fade" style={{ padding: '36px 32px', textAlign: 'center', marginTop: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✂️</div>
              <h3 style={{ marginBottom: 8 }}>Splitting PDF…</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Extracting pages {fromPage}–{toPage}</p>
              <div style={{ marginTop: 20 }}>
                <div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--primary)', width: 28, height: 28 }} />
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
