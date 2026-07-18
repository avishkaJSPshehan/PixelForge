'use client';
import { incrementFileCount } from '@/lib/fileCounter';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

type State = 'idle' | 'fetching' | 'ready' | 'printing';

/** Rewrites relative asset URLs in the fetched HTML to absolute ones */
function resolveRelativeUrls(html: string, base: string): string {
  try {
    const baseUrl = new URL(base);
    const origin = baseUrl.origin;
    const basePath = base.endsWith('/') ? base : base.substring(0, base.lastIndexOf('/') + 1);

    // Add a <base> tag so the browser resolves remaining relative links automatically
    const baseTag = `<base href="${base}" />`;

    if (/<head[\s>]/i.test(html)) {
      return html.replace(/(<head[^>]*>)/i, `$1\n${baseTag}`);
    }
    if (/<html[\s>]/i.test(html)) {
      return html.replace(/(<html[^>]*>)/i, `$1\n<head>${baseTag}</head>`);
    }
    return `<!DOCTYPE html><html><head>${baseTag}</head><body>${html}</body></html>`;
  } catch {
    return html;
  }
}

/** Injects print-friendly styles into the HTML before printing */
function preparePrintHtml(html: string): string {
  const printStyles = `
    <style>
      @page { margin: 1cm; }
      body {
        font-size: 12pt;
        line-height: 1.5;
        background: #fff !important;
        color: #000 !important;
        margin: 0;
        padding: 0;
      }
      img { max-width: 100%; height: auto; }
      pre, code { white-space: pre-wrap; word-break: break-all; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .cookie-banner, .cookie-notice, .gdpr-banner,
        [class*="cookie"], [id*="cookie"],
        [class*="popup"], [id*="popup"],
        [class*="modal"], [id*="modal"],
        nav, .nav, .navbar, header .top-bar,
        .ad, .ads, .advertisement, [class*="advert"] { display: none !important; }
      }
    </style>
  `;

  if (/<head[\s>]/i.test(html)) {
    return html.replace(/(<\/head>)/i, `${printStyles}$1`);
  }
  return html;
}

export default function UrlToPdfPage() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fetchedHtml, setFetchedHtml] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState<string>('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Push fetched HTML into the preview iframe
  useEffect(() => {
    const iframe = previewIframeRef.current;
    if (!iframe || !fetchedHtml) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(fetchedHtml);
    doc.close();

    // Try to read the page title from the iframe after it renders
    setTimeout(() => {
      try {
        const iframeTitle = iframe.contentDocument?.title;
        if (iframeTitle) setPageTitle(iframeTitle);
      } catch {
        // cross-origin restriction - ignore
      }
    }, 300);
  }, [fetchedHtml]);

  const handleFetch = async () => {
    setError(null);
    setFetchedHtml(null);
    setPageTitle('');

    let normalized = url.trim();
    if (!normalized) return;

    // Auto-prepend https:// if missing
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
      setUrl(normalized);
    }

    setState('fetching');

    try {
      const apiUrl = `/api/fetch-url?url=${encodeURIComponent(normalized)}`;
      const res = await fetch(apiUrl);

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error from server.' }));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      const html = await res.text();
      const resolved = resolveRelativeUrls(html, normalized);
      setFetchedHtml(resolved);
      setState('ready');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
      setState('idle');
    }
  };

  const handleConvert = () => {
    if (!fetchedHtml) return;
    setState('printing');

    const iframe = printIframeRef.current;
    if (!iframe) { setState('ready'); return; }

    const printReady = preparePrintHtml(fetchedHtml);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) { setState('ready'); return; }

    doc.open();
    doc.write(printReady);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        incrementFileCount();
        showToast('✓ Print dialog opened - choose "Save as PDF" to download.');
      } catch {
        showToast('⚠️ Could not open print dialog. Try your browser\'s Print menu.', 'error');
      }
      setState('ready');
    }, 800);
  };

  const reset = () => {
    setUrl('');
    setFetchedHtml(null);
    setPageTitle('');
    setError(null);
    setState('idle');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleFetch();
  };

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">

          {/* Back button */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-url2pdf">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="tool-header animate-in">
            <div
              className="tool-header-icon"
              style={{
                background: 'linear-gradient(135deg, rgba(26,143,216,.18), rgba(56,178,248,.1))',
                border: '1px solid rgba(26,143,216,.25)',
              }}
            >
              🔗
            </div>
            <h1>URL to PDF</h1>
            <p>Paste any webpage URL and download it as a PDF - instantly, right in your browser.</p>
          </div>

          {/* URL Input card */}
          <div className="url2pdf-input-card animate-in delay-1">
            <div className="url2pdf-input-label">
              <span>🌐</span>
              <span>Enter the webpage URL</span>
            </div>
            <div className="url2pdf-input-row">
              <input
                id="url2pdf-url-input"
                type="url"
                className="url2pdf-input"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={state === 'fetching'}
                autoComplete="url"
                spellCheck={false}
              />
              <button
                id="btn-fetch-url"
                className="btn btn-primary"
                onClick={handleFetch}
                disabled={state === 'fetching' || !url.trim()}
              >
                {state === 'fetching' ? (
                  <><div className="spinner" /> Fetching…</>
                ) : (
                  '🔍 Load Page'
                )}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="url2pdf-error animate-fade" id="url2pdf-error-msg">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Hint */}
            {state === 'idle' && !error && (
              <p className="url2pdf-hint">
                Press <kbd>Enter</kbd> or click <strong>Load Page</strong>. Your browser will print the page as a PDF.
              </p>
            )}
          </div>

          {/* ── Ready state ── */}
          {state !== 'idle' && state !== 'fetching' && fetchedHtml && (
            <>
              {/* Page info bar */}
              <div className="action-bar animate-in" style={{ marginTop: 24 }}>
                <div className="action-bar-left">
                  <span style={{ fontSize: 20 }}>🔗</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                      {pageTitle || 'Webpage loaded'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                      {url}
                    </div>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={reset} id="btn-reset-url2pdf">
                  🗑 Clear
                </button>
              </div>

              {/* Info note */}
              <div className="url2pdf-note animate-in delay-1">
                <span style={{ fontSize: 16 }}>ℹ️</span>
                <span>
                  Click <strong>Convert to PDF</strong> below. Your browser's print dialog will open -
                  select <strong>"Save as PDF"</strong> as the destination.
                </span>
              </div>

              {/* Live Preview */}
              <div className="url2pdf-preview-wrap animate-in delay-2">
                <div className="url2pdf-preview-label">
                  <span>Live Preview</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                    Rendered output of the fetched page
                  </span>
                </div>
                <div className="url2pdf-preview-frame-wrap">
                  <iframe
                    ref={previewIframeRef}
                    className="url2pdf-preview-frame"
                    title="URL Preview"
                    sandbox="allow-same-origin allow-scripts"
                    id="url-preview-frame"
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleConvert}
                  disabled={state === 'printing'}
                  id="btn-convert-url-pdf"
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
                  id="btn-load-another-url"
                >
                  Load another URL
                </button>
              </div>

              {/* Step hints */}
              <div className="url2pdf-steps animate-in delay-3">
                {[
                  { n: '1', text: 'Click "Convert to PDF"' },
                  { n: '2', text: 'A print dialog opens' },
                  { n: '3', text: 'Set destination to "Save as PDF"' },
                  { n: '4', text: 'Click Save - done!' },
                ].map((s) => (
                  <div key={s.n} className="url2pdf-step">
                    <div className="url2pdf-step-num">{s.n}</div>
                    <div className="url2pdf-step-text">{s.text}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 60 }} />
            </>
          )}

          {/* Loading skeleton */}
          {state === 'fetching' && (
            <div className="url2pdf-skeleton animate-fade">
              <div className="url2pdf-skeleton-bar url2pdf-skeleton-bar--wide" />
              <div className="url2pdf-skeleton-bar url2pdf-skeleton-bar--medium" />
              <div className="url2pdf-skeleton-frame" />
            </div>
          )}

        </div>
      </main>

      {/* Hidden print iframe */}
      <iframe
        ref={printIframeRef}
        style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, opacity: 0, border: 'none' }}
        title="Print Frame"
        sandbox="allow-same-origin allow-modals allow-scripts"
        id="url-print-iframe"
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
