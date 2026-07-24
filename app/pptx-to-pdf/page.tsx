'use client';
import { incrementFileCount } from '@/lib/fileCounter';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DropZone from '@/components/DropZone';
import { pptxToHtml } from '@jvmr/pptx-to-html';

type State = 'idle' | 'loading' | 'ready' | 'printing';

/** Injects a minimal print-reset stylesheet into raw HTML before printing */
function preparePrintHtml(slidesHtml: string[]): string {
  const printStyles = `
    <style>
      @page { margin: 0; size: A4 landscape; }
      body {
        margin: 0;
        padding: 0;
        background: #f5f5f5;
      }
      .slide-container {
        page-break-after: always;
        position: relative;
        overflow: hidden;
        background: #fff;
        width: 100vw;
        height: 100vh;
        margin: 0 auto;
        box-shadow: none;
      }
      @media screen {
        body { padding: 40px 0; display: flex; flex-direction: column; align-items: center; gap: 40px; }
        .slide-container {
          width: 960px;
          height: 540px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 1px solid #ddd;
        }
      }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: transparent; }
        .slide-container { width: 100%; height: 100%; box-shadow: none; border: none; }
      }
    </style>
  `;

  const slidesMarkup = slidesHtml.map(slide => `<div class="slide-container">${slide}</div>`).join('\n');
  return `<!DOCTYPE html><html><head>${printStyles}</head><body>${slidesMarkup}</body></html>`;
}

export default function PptxToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFiles = useCallback(async (files: File[]) => {
    const f = files.find((f) => f.name.toLowerCase().endsWith('.pptx'));
    if (!f) {
      showToast('⚠️ Please upload a PowerPoint (.pptx) file.', 'error');
      return;
    }
    
    setState('loading');
    setError(null);
    setFile(f);
    
    try {
      const arrayBuffer = await f.arrayBuffer();
      const slidesHtml = await pptxToHtml(arrayBuffer, {
        width: 960,
        height: 540,
        scaleToFit: true,
        letterbox: true,
      });
      
      const fullHtml = preparePrintHtml(slidesHtml);
      setHtmlContent(fullHtml);
      setState('ready');
    } catch (err) {
      console.error(err);
      setError('Failed to process the PowerPoint document. Make sure it is a valid .pptx file.');
      setState('idle');
    }
  }, []);

  // Push HTML into the preview iframe whenever content changes
  useEffect(() => {
    const iframe = previewIframeRef.current;
    if (!iframe || !htmlContent) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(htmlContent);
    doc.close();
  }, [htmlContent]);

  const handleConvert = () => {
    if (!htmlContent) return;
    setState('printing');

    const iframe = printIframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      setState('ready');
      return;
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Give the browser a moment to render images/fonts before printing
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        incrementFileCount();
        showToast('✓ Print dialog opened - choose "Save as PDF" to download.');
      } catch {
        showToast('⚠️ Could not open print dialog. Try using your browser\'s Print menu.', 'error');
      }
      setState('ready');
    }, 1000);
  };

  const reset = () => {
    setFile(null);
    setHtmlContent('');
    setState('idle');
    setError(null);
  };

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">

          {/* Back button */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-pptx2pdf">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="tool-header animate-in">
            <div
              className="tool-header-icon"
              style={{
                background: 'linear-gradient(135deg, rgba(208,68,35,.18), rgba(208,68,35,.1))',
                border: '1px solid rgba(208,68,35,.25)',
              }}
            >
              📊
            </div>
            <h1>PowerPoint to PDF</h1>
            <p>Upload a PowerPoint (.pptx) file and securely convert it to a PDF inside your browser.</p>
          </div>

          {/* DropZone */}
          {!file && (
            <div className="animate-in delay-1">
              <DropZone
                accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                multiple={false}
                onFiles={handleFiles}
                icon="📊"
                title="Drop a PowerPoint file here"
                subtitle="Drag & drop a .pptx file - or click to browse"
                badge="PPTX supported"
                disabled={state === 'loading'}
              />
            </div>
          )}

          {/* ── Loaded state ── */}
          {file && (
            <div className="split-main-layout animate-in delay-1" style={{ marginTop: 24 }}>
              
              {/* ── Left: Previews ── */}
              <div className="split-main-left">
                {state === 'loading' ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div className="spinner" style={{ borderTopColor: 'var(--primary)', marginBottom: 16 }} />
                    <p>Rendering presentation slides...</p>
                  </div>
                ) : (
                  <div className="html2pdf-preview-wrap" style={{ marginTop: 0 }}>
                    <div className="html2pdf-preview-label">
                      <span>Presentation Preview</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                        Extracted slides
                      </span>
                    </div>
                    <div className="html2pdf-preview-frame-wrap" style={{ height: '500px', overflow: 'hidden' }}>
                      <iframe
                        ref={previewIframeRef}
                        className="html2pdf-preview-frame"
                        title="Presentation Preview"
                        sandbox="allow-same-origin"
                        id="pptx-preview-frame"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right: Controls ── */}
              <div className="split-main-right">
                
                {/* File info bar */}
                <div className="action-bar" style={{ marginTop: 0 }}>
                  <div className="action-bar-left">
                    <span style={{ fontSize: 20 }}>📊</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', wordBreak: 'break-all' }}>{file.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {(file.size / 1024).toFixed(1)} KB · PowerPoint Document
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={reset} id="btn-reset-pptx2pdf">
                    🗑 Remove
                  </button>
                </div>

                <div className="html2pdf-note">
                  <span style={{ fontSize: 16 }}>ℹ️</span>
                  <span>
                    Click <strong>Convert to PDF</strong> below. Your browser's print dialog will open -
                    select <strong>"Save as PDF"</strong> and ensure the layout is set to <strong>Landscape</strong>.
                  </span>
                </div>

                {error && (
                  <p style={{ color: 'var(--secondary)', fontSize: 14, marginTop: 10 }}>⚠️ {error}</p>
                )}

                {/* Action */}
                <div style={{ display: 'flex', gap: 12, marginTop: 12, flexDirection: 'column' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleConvert}
                    disabled={state === 'printing' || state === 'loading' || !!error}
                    id="btn-convert-pptx-pdf"
                    style={{ width: '100%', padding: '16px', fontSize: 16 }}
                  >
                    {state === 'printing' ? (
                      <><div className="spinner" /> Opening print dialog…</>
                    ) : (
                      '🖨️ Convert to PDF'
                    )}
                  </button>
                </div>

                {/* Step hint */}
                <div className="html2pdf-steps" style={{ marginTop: 16 }}>
                  {[
                    { n: '1', text: 'Click "Convert to PDF"' },
                    { n: '2', text: 'A print dialog opens' },
                    { n: '3', text: 'Set destination to "Save as PDF" (Landscape)' },
                    { n: '4', text: 'Click Save - done!' },
                  ].map((s) => (
                    <div key={s.n} className="html2pdf-step">
                      <div className="html2pdf-step-num">{s.n}</div>
                      <div className="html2pdf-step-text">{s.text}</div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* Hidden iframe for printing */}
          <iframe
            ref={printIframeRef}
            style={{ width: 0, height: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}
            title="Print Frame"
            sandbox="allow-same-origin allow-modals"
            id="print-iframe"
          />

        </div>
      </main>

      {/* ── Content & FAQ section ── */}
      <div className="tool-content-section">
        <div className="tool-how-to">
          <h2>How to Convert PowerPoint to PDF</h2>
          <div className="tool-steps">
            <div className="tool-step">
              <div className="tool-step-num">1</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Upload your PowerPoint file</div>
                <div className="tool-step-desc">Click the upload area or drag your .pptx file onto the page. PixelForge reads the presentation file directly in your browser using a JavaScript-based PPTX parser. No PowerPoint, Google Slides, or Office 365 subscription is needed.</div>
              </div>
            </div>
            <div className="tool-step">
              <div className="tool-step-num">2</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Preview your slides</div>
                <div className="tool-step-desc">PixelForge renders a preview of your presentation slides so you can verify that text, shapes, and layout are being interpreted correctly. Check the preview to ensure the content looks as expected before converting.</div>
              </div>
            </div>
            <div className="tool-step">
              <div className="tool-step-num">3</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Convert to PDF and download</div>
                <div className="tool-step-desc">Click &quot;Convert to PDF&quot;. The tool uses your browser&apos;s built-in print engine to produce a PDF document where each slide becomes a separate page. The PDF is generated and available for download in seconds, entirely offline.</div>
              </div>
            </div>
          </div>
          <div className="tool-privacy-note">
            <span className="tool-privacy-note-icon">🔒</span>
            <span>
              <strong>Your presentation slides are converted in your browser, not on a server.</strong> Cloud-based PowerPoint-to-PDF converters upload your full presentation — which may contain confidential product roadmaps, financial projections, or client proposals — to an external server. PixelForge parses and renders your PPTX file entirely within your browser. Your slides never leave your device.
            </span>
          </div>
        </div>

        <div className="tool-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question">Does PixelForge support .ppt files (older PowerPoint format)?</div>
              <div className="faq-answer">No. PixelForge supports the modern .pptx format (PowerPoint 2007 and later). If you have a .ppt file, open it in PowerPoint or Google Slides and save/export it as .pptx, then convert here.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Will animations and transitions appear in the PDF?</div>
              <div className="faq-answer">No. PDF is a static format and does not support animations or slide transitions. The PDF will capture each slide in its default state — the final, post-animation appearance. If a slide uses animation to reveal content progressively, the PDF will show the final fully-revealed state of the slide.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Why do some slides look different from my original presentation?</div>
              <div className="faq-answer">Complex PowerPoint features — such as embedded videos, custom fonts not available in the browser, complex SmartArt, or gradient fills on shapes — may not render perfectly. For pixel-perfect conversion, PowerPoint&apos;s native &quot;Export to PDF&quot; feature in Microsoft Office will give the most accurate result.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Do I need Microsoft PowerPoint to use this tool?</div>
              <div className="faq-answer">No. PixelForge uses a browser-based PPTX parser to read your presentation file without requiring any version of Microsoft Office or any other software installed on your device.</div>
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
                "name": "Does PixelForge support .ppt files (older PowerPoint format)?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. PixelForge supports the modern .pptx format. For .ppt files, open them in PowerPoint or Google Slides and save as .pptx first."
                }
              },
              {
                "@type": "Question",
                "name": "Will animations and transitions appear in the PDF when converting from PowerPoint?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. PDF is a static format. Each slide will be captured in its final, post-animation state."
                }
              },
              {
                "@type": "Question",
                "name": "Why do some slides look different from my original PowerPoint presentation?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Complex features like embedded videos, custom fonts, or SmartArt may not render perfectly. For pixel-perfect conversion, use PowerPoint's native Export to PDF feature."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need Microsoft PowerPoint to convert PPTX to PDF?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. PixelForge uses a browser-based PPTX parser. No version of Microsoft Office or any other software is required."
                }
              }
            ]
          })
        }}
      />

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}

