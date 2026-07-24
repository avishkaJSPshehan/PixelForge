'use client';
import { incrementFileCount } from '@/lib/fileCounter';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DropZone from '@/components/DropZone';
import { addPageNumbers, type PageNumberPosition } from '@/lib/addPageNumbers';
import type * as pdfjsLib from 'pdfjs-dist';

// ─── Types ───────────────────────────────────────────────────────────────────

type ProcessState = 'idle' | 'rendering' | 'applying' | 'done' | 'error';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

async function renderPageDataUrl(
  doc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  scale = 0.5,
): Promise<string> {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.8);
}

// ─── Position picker grid ────────────────────────────────────────────────────

const POSITIONS: { pos: PageNumberPosition; label: string }[] = [
  { pos: 'top-left',      label: 'Top Left' },
  { pos: 'top-center',    label: 'Top Center' },
  { pos: 'top-right',     label: 'Top Right' },
  { pos: 'bottom-left',   label: 'Bottom Left' },
  { pos: 'bottom-center', label: 'Bottom Center' },
  { pos: 'bottom-right',  label: 'Bottom Right' },
];

function PositionPicker({
  value,
  onChange,
}: {
  value: PageNumberPosition;
  onChange: (p: PageNumberPosition) => void;
}) {
  // Grid: top row (3 cols) + bottom row (3 cols), with a blank middle for the page body
  const grid: (PageNumberPosition | null)[] = [
    'top-left',    'top-center',    'top-right',
    null,           null,            null,
    'bottom-left', 'bottom-center', 'bottom-right',
  ];

  return (
    <div className="pn-pos-picker" aria-label="Page number position">
      {grid.map((pos, i) => {
        if (pos === null) {
          // Middle row blank cells
          return <div key={i} className="pn-pos-blank" />;
        }
        const isActive = value === pos;
        return (
          <button
            key={pos}
            className={`pn-pos-dot${isActive ? ' pn-pos-dot--active' : ''}`}
            onClick={() => onChange(pos)}
            title={POSITIONS.find((p) => p.pos === pos)?.label}
            aria-pressed={isActive}
            aria-label={POSITIONS.find((p) => p.pos === pos)?.label}
          />
        );
      })}
    </div>
  );
}

// ─── Page preview card with live page-number overlay ─────────────────────────

interface PageCardProps {
  dataUrl: string;
  pageIndex: number;   // 1-based
  totalPages: number;
  position: PageNumberPosition;
  startNumber: number;
  fromPage: number;
  toPage: number;
  fontSize: number;
  color: string;
}

function PageCard({
  dataUrl,
  pageIndex,
  totalPages,
  position,
  startNumber,
  fromPage,
  toPage,
  fontSize,
  color,
}: PageCardProps) {
  const inRange = pageIndex >= fromPage && pageIndex <= toPage;
  const displayNum = inRange ? startNumber + (pageIndex - fromPage) : null;

  // Map position string → CSS positioning on the card overlay
  const posStyle: React.CSSProperties = (() => {
    const m = '6%';
    switch (position) {
      case 'top-left':      return { top: m, left: m };
      case 'top-center':    return { top: m, left: '50%', transform: 'translateX(-50%)' };
      case 'top-right':     return { top: m, right: m };
      case 'bottom-left':   return { bottom: m, left: m };
      case 'bottom-center': return { bottom: m, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-right':  return { bottom: m, right: m };
    }
  })();

  const scaledFont = Math.max(7, Math.min(13, fontSize * 0.8));

  return (
    <div className="wm-page-card">
      <div className="wm-page-badge">{pageIndex}</div>
      <img src={dataUrl} alt={`Page ${pageIndex}`} className="wm-page-img" />

      {displayNum !== null && (
        <div
          className="pn-number-overlay"
          style={{
            ...posStyle,
            fontSize: scaledFont,
            color,
          }}
        >
          {displayNum}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PageNumbersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageDataUrls, setPageDataUrls] = useState<string[]>([]);
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [renderProgress, setRenderProgress] = useState(0);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Options
  const [position, setPosition] = useState<PageNumberPosition>('bottom-center');
  const [startNumber, setStartNumber] = useState(1);
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [fontSize, setFontSize] = useState(11);
  const [color, setColor] = useState('#111111');
  const [margin, setMargin] = useState(28);

  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load PDF ──────────────────────────────────────────────────────────────

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files.find((f) => f.type === 'application/pdf');
    if (!f) { showToast('⚠️ Please upload a PDF file.', 'error'); return; }

    setFile(f);
    setPageDataUrls([]);
    setProcessState('rendering');
    setRenderProgress(0);
    setError('');

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      const buffer = await f.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
      pdfDocRef.current = doc;
      const n = doc.numPages;
      setTotalPages(n);
      setFromPage(1);
      setToPage(n);

      const urls: string[] = [];
      for (let i = 1; i <= n; i++) {
        const url = await renderPageDataUrl(doc, i);
        urls.push(url);
        setPageDataUrls([...urls]);
        setRenderProgress(Math.round((i / n) * 100));
      }
      setProcessState('idle');
    } catch {
      setError('Failed to read the PDF. Make sure it is not password-protected.');
      setProcessState('error');
      showToast('⚠️ Could not load PDF.', 'error');
    }
  }, []);

  // ── Apply & download ──────────────────────────────────────────────────────

  const handleApply = async () => {
    if (!file || pageDataUrls.length === 0) return;
    setProcessState('applying');
    setError('');
    try {
      const bytes = await addPageNumbers(file, {
        position,
        startNumber,
        fromPage,
        toPage,
        fontSize,
        color,
        margin,
      });
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = file.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `${baseName}_numbered.pdf`);
      incrementFileCount();
      setProcessState('done');
      showToast('✓ Numbered PDF downloaded!');
    } catch {
      setError('Failed to add page numbers.');
      setProcessState('error');
      showToast('⚠️ Could not process PDF.', 'error');
    }
  };

  const reset = () => {
    setFile(null);
    setTotalPages(0);
    setPageDataUrls([]);
    setProcessState('idle');
    setRenderProgress(0);
    setError('');
    pdfDocRef.current = null;
  };

  const isRendering = processState === 'rendering';
  const isApplying  = processState === 'applying';

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">

          {/* Back */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-pagenumbers">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="tool-header animate-in">
            <div
              className="tool-header-icon"
              style={{
                background: 'linear-gradient(135deg,rgba(26,143,216,.18),rgba(56,178,248,.1))',
                border: '1px solid rgba(26,143,216,.25)',
              }}
            >
              🔢
            </div>
            <h1>Add Page Numbers</h1>
            <p>Upload a PDF and stamp page numbers at any position - instantly in your browser, no uploads.</p>
          </div>

          {/* ── Drop Zone ── */}
          {!file && (
            <div className="animate-in delay-1">
              <DropZone
                accept="application/pdf"
                multiple={false}
                onFiles={handleFiles}
                icon="🔢"
                title="Drop a PDF file here"
                subtitle="Upload a single PDF to add page numbers to every page"
                badge="Single PDF"
                disabled={false}
              />
            </div>
          )}

          {/* ── Rendering progress ── */}
          {isRendering && (
            <div className="glass-card animate-fade" style={{ padding: '36px 32px', textAlign: 'center', marginTop: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔢</div>
              <h3 style={{ marginBottom: 8 }}>Loading pages…</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                Rendering page previews ({renderProgress}%)
              </p>
              <div className="progress-wrap" style={{ maxWidth: 320, margin: '0 auto' }}>
                <div className="progress-bar" style={{ width: `${renderProgress}%` }} />
              </div>
            </div>
          )}

          {/* ── Applying progress ── */}
          {isApplying && (
            <div className="glass-card animate-fade" style={{ padding: '36px 32px', textAlign: 'center', marginTop: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔢</div>
              <h3 style={{ marginBottom: 8 }}>Adding Page Numbers…</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Processing {totalPages} page{totalPages !== 1 ? 's' : ''}
              </p>
              <div style={{ marginTop: 20 }}>
                <div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--primary)', width: 28, height: 28 }} />
              </div>
            </div>
          )}

          {/* ── Main panel ── */}
          {file && !isRendering && !isApplying && (
            <>
              {/* File info bar */}
              <div className="action-bar animate-in" style={{ marginTop: 24 }}>
                <div className="action-bar-left">
                  <span style={{ fontSize: 20 }}>📄</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{totalPages} pages</div>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={reset} id="btn-reset-pagenumbers">
                  🗑 Remove
                </button>
              </div>

              {/* Two-column layout */}
              <div className="split-main-layout animate-in delay-1" style={{ marginTop: 24 }}>

                {/* ── LEFT: page previews ── */}
                <div className="split-main-left">
                  <div className="wm-preview-header">
                    <span className="wm-preview-title">Page Previews</span>
                    <span className="wm-preview-count">{pageDataUrls.length} / {totalPages} pages</span>
                  </div>

                  <div className="wm-page-grid">
                    {pageDataUrls.map((url, i) => (
                      <PageCard
                        key={i}
                        dataUrl={url}
                        pageIndex={i + 1}
                        totalPages={totalPages}
                        position={position}
                        startNumber={startNumber}
                        fromPage={fromPage}
                        toPage={toPage}
                        fontSize={fontSize}
                        color={color}
                      />
                    ))}

                    {/* Ghost placeholders */}
                    {Array.from({ length: totalPages - pageDataUrls.length }).map((_, i) => (
                      <div key={`ghost-${i}`} className="wm-page-card wm-page-card-ghost">
                        <div className="wm-page-badge">{pageDataUrls.length + i + 1}</div>
                        <div className="wm-page-ghost-inner">
                          <div className="spinner" style={{ borderTopColor: 'var(--primary)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── RIGHT: options panel ── */}
                <div className="split-main-right">
                  <div className="wm-controls-panel" style={{ marginTop: 0 }}>
                    <div className="wm-controls-title">Page Number Options</div>

                    {/* Position picker */}
                    <div className="wm-control-group">
                      <label className="wm-control-label">Position</label>
                      <PositionPicker value={position} onChange={setPosition} />
                      <p className="pn-pos-label-text">
                        {POSITIONS.find((p) => p.pos === position)?.label}
                      </p>
                    </div>

                    {/* Start number */}
                    <div className="wm-control-group">
                      <label htmlFor="pn-start" className="wm-control-label">First Page Number</label>
                      <div className="pn-number-input-row">
                        <input
                          id="pn-start"
                          type="number"
                          min={1}
                          max={9999}
                          value={startNumber}
                          onChange={(e) => setStartNumber(Math.max(1, Number(e.target.value)))}
                          className="pn-number-input"
                        />
                      </div>
                    </div>

                    {/* Page range */}
                    <div className="wm-control-group">
                      <label className="wm-control-label">Number which pages?</label>
                      <div className="pn-range-row">
                        <span className="pn-range-label">From</span>
                        <input
                          id="pn-from"
                          type="number"
                          min={1}
                          max={totalPages}
                          value={fromPage}
                          onChange={(e) => setFromPage(Math.min(toPage, Math.max(1, Number(e.target.value))))}
                          className="pn-range-input"
                        />
                        <span className="pn-range-label">to</span>
                        <input
                          id="pn-to"
                          type="number"
                          min={fromPage}
                          max={totalPages}
                          value={toPage}
                          onChange={(e) => setToPage(Math.min(totalPages, Math.max(fromPage, Number(e.target.value))))}
                          className="pn-range-input"
                        />
                      </div>
                      <p className="pn-range-hint">Total pages: {totalPages}</p>
                    </div>

                    {/* Font size */}
                    <div className="wm-control-group">
                      <label className="wm-control-label">
                        Font Size&nbsp;<span className="wm-control-value">{fontSize} pt</span>
                      </label>
                      <input
                        id="pn-font-size"
                        type="range"
                        min={8}
                        max={24}
                        step={1}
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="wm-slider"
                      />
                      <div className="wm-slider-hints"><span>8 pt</span><span>24 pt</span></div>
                    </div>

                    {/* Margin */}
                    <div className="wm-control-group">
                      <label className="wm-control-label">
                        Margin&nbsp;<span className="wm-control-value">{margin} pt</span>
                      </label>
                      <input
                        id="pn-margin"
                        type="range"
                        min={10}
                        max={60}
                        step={2}
                        value={margin}
                        onChange={(e) => setMargin(Number(e.target.value))}
                        className="wm-slider"
                      />
                      <div className="wm-slider-hints"><span>Close</span><span>Far</span></div>
                    </div>

                    {/* Color */}
                    <div className="wm-control-group">
                      <label className="wm-control-label">Color</label>
                      <div className="wm-color-row">
                        <input
                          id="pn-color"
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="wm-color-picker"
                          title="Pick page number color"
                        />
                        <span className="wm-color-hex">{color.toUpperCase()}</span>
                      </div>
                      <div className="wm-color-swatches" style={{ marginTop: 10 }}>
                        {['#111111', '#CC0000', '#1A56DB', '#047857', '#6B21A8', '#92400E'].map((c) => (
                          <button
                            key={c}
                            className={`wm-swatch${color.toLowerCase() === c.toLowerCase() ? ' wm-swatch-active' : ''}`}
                            style={{ background: c }}
                            onClick={() => setColor(c)}
                            title={c}
                            aria-label={`Set color to ${c}`}
                          />
                        ))}
                      </div>
                    </div>

                    {error && (
                      <p style={{ color: 'var(--secondary)', fontSize: 13, marginTop: 8 }}>⚠️ {error}</p>
                    )}

                    {/* Apply button */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                      <button
                        className="btn btn-primary"
                        onClick={handleApply}
                        disabled={pageDataUrls.length === 0}
                        id="btn-apply-pagenumbers"
                        style={{ width: '100%', padding: '16px', fontSize: 16 }}
                      >
                        🔢 Add Page Numbers
                      </button>

                      {processState === 'done' && (
                        <span className="badge badge-success" style={{ padding: '8px 14px', alignSelf: 'center', width: '100%', textAlign: 'center' }}>
                          ✓ Numbered PDF Downloaded!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ height: 60 }} />
            </>
          )}

        </div>
      </main>

      {/* ── Content & FAQ section ── */}
      <div className="tool-content-section">
        <div className="tool-how-to">
          <h2>How to Add Page Numbers to a PDF</h2>
          <div className="tool-steps">
            <div className="tool-step">
              <div className="tool-step-num">1</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Upload your PDF</div>
                <div className="tool-step-desc">Click the upload area or drag your PDF file onto the page. PixelForge loads the document in your browser and shows you a live preview so you can see how the page numbers will be positioned before committing.</div>
              </div>
            </div>
            <div className="tool-step">
              <div className="tool-step-num">2</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Configure your page number style</div>
                <div className="tool-step-desc">Choose where to place the numbers (top-left, top-center, top-right, bottom-left, bottom-center, or bottom-right), the starting number, font size, and optionally a prefix or suffix (e.g. &quot;Page 1 of N&quot; format). Adjust until the preview looks exactly right.</div>
              </div>
            </div>
            <div className="tool-step">
              <div className="tool-step-num">3</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Apply and download</div>
                <div className="tool-step-desc">Click &quot;Add Page Numbers&quot;. The numbers are stamped onto every page of the PDF within your browser. Once done, download the resulting file. The whole process is instant and offline — no server required.</div>
              </div>
            </div>
          </div>
          <div className="tool-privacy-note">
            <span className="tool-privacy-note-icon">🔒</span>
            <span>
              <strong>Page numbers are added entirely in your browser.</strong> Server-based PDF tools that add page numbers must receive your full document before they can process it. PixelForge uses pdf-lib to embed page number stamps directly into your PDF within your browser. Your document never leaves your device at any point. This is particularly important when numbering confidential multi-page reports, legal briefs, or financial statements that should not be transmitted to third parties.
            </span>
          </div>
        </div>

        <div className="tool-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question">Can I start the page numbering from a number other than 1?</div>
              <div className="faq-answer">Yes. You can set any starting number you choose. This is useful when this PDF is one section of a larger document — for example, if the preceding section ends on page 24, you can start numbering this document at 25 so that page numbers are continuous across the full report.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Can I skip the first page (e.g. a title or cover page) when numbering?</div>
              <div className="faq-answer">Yes. You can configure the tool to skip the first N pages when stamping numbers, so your cover page or table of contents is left unmarked while the rest of the document is numbered correctly.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Will existing content on the PDF be covered by the page numbers?</div>
              <div className="faq-answer">Page numbers are small and placed at the margins. If your PDF has text or images that extend to the very edge of the page with no margin, there may be overlap. In practice, most professionally laid-out PDFs leave enough margin space for page numbers to sit clearly without obscuring any content.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Can I remove page numbers from a PDF?</div>
              <div className="faq-answer">Once page numbers are embedded into a PDF, removing them requires a full PDF editing tool that can identify and delete content elements. PixelForge does not currently offer a &quot;remove page numbers&quot; feature. We recommend keeping the original un-numbered PDF as a backup before applying numbers.</div>
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
                "name": "Can I start the page numbering from a number other than 1?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. You can set any starting number you choose. This is useful when this PDF is one section of a larger document and you want continuous page numbers across the full report."
                }
              },
              {
                "@type": "Question",
                "name": "Can I skip the first page when numbering a PDF?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. You can configure the tool to skip the first N pages when stamping numbers, so your cover page or table of contents is left unmarked."
                }
              },
              {
                "@type": "Question",
                "name": "Will existing content on the PDF be covered by the page numbers?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Page numbers are placed at the margins. Most professionally laid-out PDFs leave enough margin space for page numbers to sit clearly without obscuring content."
                }
              },
              {
                "@type": "Question",
                "name": "Can I remove page numbers from a PDF?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Once embedded, page numbers require a full PDF editor to remove. PixelForge does not currently offer a remove page numbers feature. Keep the original un-numbered PDF as a backup."
                }
              }
            ]
          })
        }}
      />

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </>
  );
}

