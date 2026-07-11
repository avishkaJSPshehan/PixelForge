'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DropZone from '@/components/DropZone';

type State = 'idle' | 'ready' | 'printing';

/** Injects a minimal print-reset stylesheet into raw HTML before printing */
function preparePrintHtml(rawHtml: string): string {
  const printStyles = `
    <style>
      @page { margin: 1cm; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12pt;
        line-height: 1.5;
        color: #000;
        background: #fff;
        margin: 0;
        padding: 0;
      }
      img { max-width: 100%; height: auto; }
      a { color: #000; text-decoration: underline; }
      pre, code { white-space: pre-wrap; word-break: break-all; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
  `;

  // If the HTML already has a <head>, inject inside it; otherwise prepend
  if (/<head[\s>]/i.test(rawHtml)) {
    return rawHtml.replace(/(<head[^>]*>)/i, `$1\n${printStyles}`);
  }
  if (/<html[\s>]/i.test(rawHtml)) {
    return rawHtml.replace(/(<html[^>]*>)/i, `$1\n<head>${printStyles}</head>`);
  }
  // Plain fragment (no <html>) - wrap it
  return `<!DOCTYPE html><html><head>${printStyles}</head><body>${rawHtml}</body></html>`;
}

export default function HtmlToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [state, setState] = useState<State>('idle');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFiles = useCallback((files: File[]) => {
    const f = files.find((f) => f.name.endsWith('.html') || f.name.endsWith('.htm') || f.type === 'text/html');
    if (!f) {
      showToast('⚠️ Please upload an HTML (.html or .htm) file.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setHtmlContent(content);
      setFile(f);
      setState('ready');
    };
    reader.readAsText(f);
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

    const printReady = preparePrintHtml(htmlContent);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      setState('ready');
      return;
    }

    doc.open();
    doc.write(printReady);
    doc.close();

    // Give the browser a moment to render images/fonts before printing
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        showToast('✓ Print dialog opened - choose "Save as PDF" to download.');
      } catch {
        showToast('⚠️ Could not open print dialog. Try using your browser\'s Print menu.', 'error');
      }
      setState('ready');
    }, 600);
  };

  const reset = () => {
    setFile(null);
    setHtmlContent('');
    setState('idle');
  };

  const baseName = file?.name.replace(/\.(html|htm)$/i, '') ?? 'document';

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">

          {/* Back button */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-html2pdf">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="tool-header animate-in">
            <div
              className="tool-header-icon"
              style={{
                background: 'linear-gradient(135deg, rgba(108,99,255,.18), rgba(147,112,219,.1))',
                border: '1px solid rgba(108,99,255,.25)',
              }}
            >
              🌐
            </div>
            <h1>HTML to PDF</h1>
            <p>Upload an HTML file and convert it to a PDF using your browser's print engine.</p>
          </div>

          {/* DropZone */}
          {!file && (
            <div className="animate-in delay-1">
              <DropZone
                accept=".html,.htm,text/html"
                multiple={false}
                onFiles={handleFiles}
                icon="🌐"
                title="Drop an HTML file here"
                subtitle="Drag & drop an .html or .htm file - or click to browse"
                badge="HTML / HTM supported"
                disabled={false}
              />
            </div>
          )}

          {/* ── Loaded state ── */}
          {file && (
            <>
              {/* File info bar */}
              <div className="action-bar animate-in" style={{ marginTop: 24 }}>
                <div className="action-bar-left">
                  <span style={{ fontSize: 20 }}>🌐</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {(file.size / 1024).toFixed(1)} KB · HTML document
                    </div>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={reset} id="btn-reset-html2pdf">
                  🗑 Remove
                </button>
              </div>

              {/* How it works note */}
              <div className="html2pdf-note animate-in delay-1">
                <span style={{ fontSize: 16 }}>ℹ️</span>
                <span>
                  Click <strong>Convert to PDF</strong> below. Your browser's print dialog will open -
                  select <strong>"Save as PDF"</strong> as the destination to download the file.
                </span>
              </div>

              {/* Live HTML Preview */}
              <div className="html2pdf-preview-wrap animate-in delay-2">
                <div className="html2pdf-preview-label">
                  <span>Live Preview</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                    Rendered output of <code style={{ fontSize: 11 }}>{file.name}</code>
                  </span>
                </div>
                <div className="html2pdf-preview-frame-wrap">
                  <iframe
                    ref={previewIframeRef}
                    className="html2pdf-preview-frame"
                    title="HTML Preview"
                    sandbox="allow-same-origin"
                    id="html-preview-frame"
                  />
                </div>
              </div>

              {/* Action */}
              <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleConvert}
                  disabled={state === 'printing'}
                  id="btn-convert-html-pdf"
                >
                  {state === 'printing' ? (
                    <><div className="spinner" /> Opening print dialog…</>
                  ) : (
                    '🖨️ Convert to PDF'
                  )}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={reset}
                  id="btn-upload-another"
                >
                  Upload another file
                </button>
              </div>

              {/* Step hint */}
              <div className="html2pdf-steps animate-in delay-3">
                {[
                  { n: '1', text: 'Click "Convert to PDF"' },
                  { n: '2', text: 'A print dialog opens' },
                  { n: '3', text: 'Set destination to "Save as PDF"' },
                  { n: '4', text: 'Click Save - done!' },
                ].map((s) => (
                  <div key={s.n} className="html2pdf-step">
                    <div className="html2pdf-step-num">{s.n}</div>
                    <div className="html2pdf-step-text">{s.text}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 60 }} />
            </>
          )}
        </div>
      </main>

      {/* Hidden print iframe - invisible to user */}
      <iframe
        ref={printIframeRef}
        style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, opacity: 0, border: 'none' }}
        title="Print Frame"
        sandbox="allow-same-origin allow-modals"
        id="print-iframe"
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
