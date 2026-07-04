'use client';

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DropZone from '@/components/DropZone';
import { watermarkPdf } from '@/lib/watermarkPdf';
import type * as pdfjsLib from 'pdfjs-dist';

type ProcessState = 'idle' | 'rendering' | 'applying' | 'done' | 'error';

// ─── helpers ────────────────────────────────────────────────────────────────

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

/** Renders a single PDF page to a data URL */
async function renderPageDataUrl(
  doc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  scale = 0.55,
): Promise<string> {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.82);
}

/** Draws the watermark preview onto a canvas element */
function drawWatermarkPreview(
  canvas: HTMLCanvasElement,
  text: string,
  angle: number,
  color: string,
  opacity: number,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!text.trim()) return;

  const fontSize = Math.max(14, Math.min(canvas.width, canvas.height) * 0.1);
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = color;
  ctx.globalAlpha = opacity;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((-angle * Math.PI) / 180);
  ctx.fillText(text, 0, 0);
  ctx.restore();

  ctx.globalAlpha = 1;
}

// ─── WatermarkPageCard component ────────────────────────────────────────────

interface PageCardProps {
  dataUrl: string;
  pageNum: number;
  text: string;
  angle: number;
  color: string;
  opacity: number;
}

function WatermarkPageCard({
  dataUrl,
  pageNum,
  text,
  angle,
  color,
  opacity,
}: PageCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Whenever watermark settings change, redraw the canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const sync = () => {
      canvas.width = img.offsetWidth;
      canvas.height = img.offsetHeight;
      drawWatermarkPreview(canvas, text, angle, color, opacity);
    };

    if (img.complete && img.naturalWidth > 0) {
      sync();
    } else {
      img.onload = sync;
    }
  }, [text, angle, color, opacity]);

  return (
    <div className="wm-page-card">
      {/* Page number badge */}
      <div className="wm-page-badge">{pageNum}</div>

      {/* PDF page thumbnail */}
      <img
        ref={imgRef}
        src={dataUrl}
        alt={`Page ${pageNum}`}
        className="wm-page-img"
      />

      {/* Watermark overlay canvas */}
      <canvas ref={canvasRef} className="wm-canvas-overlay" />
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function WatermarkPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageDataUrls, setPageDataUrls] = useState<string[]>([]);
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [renderProgress, setRenderProgress] = useState(0);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);

  // Watermark settings
  const [wmText, setWmText] = useState('CONFIDENTIAL');
  const [wmAngle, setWmAngle] = useState(45);
  const [wmColor, setWmColor] = useState('#CC0000');
  const [wmOpacity, setWmOpacity] = useState(0.25);

  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load PDF and render all pages when file is selected
  const handleFiles = useCallback(async (files: File[]) => {
    const f = files.find((f) => f.type === 'application/pdf');
    if (!f) {
      showToast('⚠️ Please upload a PDF file.', 'error');
      return;
    }

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

      // Render pages one by one, updating progress as we go
      const urls: string[] = [];
      for (let i = 1; i <= n; i++) {
        const url = await renderPageDataUrl(doc, i);
        urls.push(url);
        setPageDataUrls([...urls]);
        setRenderProgress(Math.round((i / n) * 100));
      }

      setProcessState('idle');
    } catch (err) {
      console.error(err);
      setError('Failed to read the PDF. Make sure it is not encrypted.');
      setProcessState('error');
      showToast('⚠️ Could not load PDF.', 'error');
    }
  }, []);

  // Apply watermark and download
  const handleApply = async () => {
    if (!file || pageDataUrls.length === 0) return;
    if (!wmText.trim()) {
      showToast('⚠️ Please enter watermark text first.', 'error');
      return;
    }

    setProcessState('applying');
    setError('');

    try {
      const bytes = await watermarkPdf(file, wmText, wmAngle, wmColor, wmOpacity);
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: 'application/pdf',
      });
      const baseName = file.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `${baseName}_watermarked.pdf`);
      setProcessState('done');
      showToast('✓ Watermarked PDF downloaded!');
    } catch (err) {
      console.error(err);
      setError('Failed to apply watermark.');
      setProcessState('error');
      showToast('⚠️ Watermark failed.', 'error');
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

  const isApplying = processState === 'applying';
  const isRendering = processState === 'rendering';

  // Memoised opacity label
  const opacityLabel = useMemo(
    () => `${Math.round(wmOpacity * 100)}%`,
    [wmOpacity],
  );

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">

          {/* Back button */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-watermark">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="tool-header animate-in">
            <div
              className="tool-header-icon"
              style={{
                background:
                  'linear-gradient(135deg,rgba(29,184,160,.18),rgba(56,178,248,.1))',
                border: '1px solid rgba(29,184,160,.25)',
              }}
            >
              🔏
            </div>
            <h1>Watermark PDF</h1>
            <p>
              Upload a PDF, customise your watermark, preview on every page,
              and download — all in your browser.
            </p>
          </div>

          {/* ── Drop Zone ── */}
          {!file && (
            <div className="animate-in delay-1">
              <DropZone
                accept="application/pdf"
                multiple={false}
                onFiles={handleFiles}
                icon="🔏"
                title="Drop a PDF file here"
                subtitle="Upload a single PDF to add a text watermark to every page"
                badge="Single PDF"
                disabled={false}
              />
            </div>
          )}

          {/* ── Rendering progress ── */}
          {isRendering && (
            <div
              className="glass-card animate-fade"
              style={{
                padding: '36px 32px',
                textAlign: 'center',
                marginTop: 24,
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔏</div>
              <h3 style={{ marginBottom: 8 }}>Loading pages…</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                Rendering page previews ({renderProgress}%)
              </p>
              <div className="progress-wrap" style={{ maxWidth: 320, margin: '0 auto' }}>
                <div
                  className="progress-bar"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Main panel (file loaded & not applying) ── */}
          {file && !isRendering && processState !== 'applying' && (
            <>
              {/* File info bar */}
              <div className="action-bar animate-in" style={{ marginTop: 24 }}>
                <div className="action-bar-left">
                  <span style={{ fontSize: 20 }}>📄</span>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--text)',
                      }}
                    >
                      {file.name}
                    </div>
                    <div
                      style={{ fontSize: 12, color: 'var(--text-muted)' }}
                    >
                      {totalPages} pages
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={reset}
                  id="btn-reset-watermark"
                >
                  🗑 Remove
                </button>
              </div>

              {/* ── Main Layout ── */}
              <div className="split-main-layout animate-in delay-1" style={{ marginTop: 24 }}>
                {/* ── Left: Previews ── */}
                <div className="split-main-left">
                  {/* ── Page preview grid ── */}
                  {pageDataUrls.length > 0 ? (
                    <div style={{ marginTop: 0 }}>
                      <div className="wm-preview-header">
                        <span className="wm-preview-title">
                          Page Previews
                        </span>
                        <span className="wm-preview-count">
                          {pageDataUrls.length} / {totalPages} pages rendered
                        </span>
                      </div>

                      <div className="wm-page-grid">
                        {pageDataUrls.map((url, i) => (
                          <WatermarkPageCard
                            key={i}
                            dataUrl={url}
                            pageNum={i + 1}
                            text={wmText}
                            angle={wmAngle}
                            color={wmColor}
                            opacity={wmOpacity}
                          />
                        ))}

                        {/* Ghost placeholders for pages still rendering */}
                        {Array.from({
                          length: totalPages - pageDataUrls.length,
                        }).map((_, i) => (
                          <div
                            key={`ghost-${i}`}
                            className="wm-page-card wm-page-card-ghost"
                          >
                            <div className="wm-page-badge">
                              {pageDataUrls.length + i + 1}
                            </div>
                            <div className="wm-page-ghost-inner">
                              <div
                                className="spinner"
                                style={{ borderTopColor: 'var(--primary)' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading previews...</div>
                  )}
                </div>

                {/* ── Right: Controls ── */}
                <div className="split-main-right">
                  {/* ── Watermark controls ── */}
                  <div className="wm-controls-panel" style={{ marginTop: 0 }}>
                    <div className="wm-controls-title">Watermark Settings</div>

                    {/* Text input */}
                    <div className="wm-control-row">
                      <label htmlFor="wm-text" className="wm-control-label">
                        Watermark Text
                      </label>
                      <input
                        id="wm-text"
                        type="text"
                        className="wm-text-input"
                        value={wmText}
                        onChange={(e) => setWmText(e.target.value)}
                        placeholder="e.g. CONFIDENTIAL"
                        maxLength={60}
                      />
                    </div>

                    <div className="wm-controls-grid" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {/* Angle */}
                      <div className="wm-control-group">
                        <label className="wm-control-label">
                          Angle&nbsp;
                          <span className="wm-control-value">{wmAngle}°</span>
                        </label>
                        <input
                          id="wm-angle"
                          type="range"
                          min={-90}
                          max={90}
                          step={1}
                          value={wmAngle}
                          onChange={(e) => setWmAngle(Number(e.target.value))}
                          className="wm-slider"
                        />
                        <div className="wm-slider-hints">
                          <span>−90°</span>
                          <span>0°</span>
                          <span>+90°</span>
                        </div>
                      </div>

                      {/* Opacity */}
                      <div className="wm-control-group">
                        <label className="wm-control-label">
                          Opacity&nbsp;
                          <span className="wm-control-value">{opacityLabel}</span>
                        </label>
                        <input
                          id="wm-opacity"
                          type="range"
                          min={0.05}
                          max={1}
                          step={0.05}
                          value={wmOpacity}
                          onChange={(e) => setWmOpacity(Number(e.target.value))}
                          className="wm-slider"
                        />
                        <div className="wm-slider-hints">
                          <span>Subtle</span>
                          <span>Full</span>
                        </div>
                      </div>

                      {/* Color */}
                      <div className="wm-control-group">
                        <label className="wm-control-label">Color</label>
                        <div className="wm-color-row">
                          <input
                            id="wm-color"
                            type="color"
                            value={wmColor}
                            onChange={(e) => setWmColor(e.target.value)}
                            className="wm-color-picker"
                            title="Pick watermark color"
                          />
                          <span className="wm-color-hex">{wmColor.toUpperCase()}</span>
                        </div>
                        {/* Preset swatches */}
                        <div className="wm-color-swatches">
                          {[
                            '#CC0000',
                            '#1A56DB',
                            '#047857',
                            '#6B21A8',
                            '#92400E',
                            '#111111',
                          ].map((c) => (
                            <button
                              key={c}
                              className={`wm-swatch${wmColor.toLowerCase() === c.toLowerCase() ? ' wm-swatch-active' : ''}`}
                              style={{ background: c }}
                              onClick={() => setWmColor(c)}
                              title={c}
                              aria-label={`Set watermark color to ${c}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p
                      style={{
                        color: 'var(--secondary)',
                        fontSize: 14,
                        marginTop: 10,
                      }}
                    >
                      ⚠️ {error}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      marginTop: 12,
                      flexDirection: 'column',
                    }}
                  >
                    <button
                      className="btn btn-primary"
                      onClick={handleApply}
                      disabled={
                        pageDataUrls.length === 0 || !wmText.trim() || isApplying
                      }
                      id="btn-apply-watermark"
                      style={{ width: '100%', padding: '16px', fontSize: 16 }}
                    >
                      🔏 Apply &amp; Download
                    </button>
                    {processState === 'done' && (
                      <span
                        className="badge badge-success"
                        style={{ padding: '8px 14px', alignSelf: 'center', width: '100%', textAlign: 'center' }}
                      >
                        ✓ Watermarked PDF Downloaded!
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ height: 60 }} />
            </>
          )}

          {/* ── Applying progress ── */}
          {isApplying && (
            <div
              className="glass-card animate-fade"
              style={{
                padding: '36px 32px',
                textAlign: 'center',
                marginTop: 24,
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔏</div>
              <h3 style={{ marginBottom: 8 }}>Applying Watermark…</h3>
              <p
                style={{ color: 'var(--text-secondary)', fontSize: 14 }}
              >
                Stamping "{wmText}" on {totalPages} page
                {totalPages !== 1 ? 's' : ''}
              </p>
              <div style={{ marginTop: 20 }}>
                <div
                  className="spinner"
                  style={{
                    margin: '0 auto',
                    borderTopColor: 'var(--primary)',
                    width: 28,
                    height: 28,
                  }}
                />
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}
