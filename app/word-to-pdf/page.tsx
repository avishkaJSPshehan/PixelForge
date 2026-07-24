'use client';
import { incrementFileCount } from '@/lib/fileCounter';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DropZone from '@/components/DropZone';
import * as mammoth from 'mammoth';

type State = 'idle' | 'loading' | 'ready' | 'printing';

/** Injects a minimal print-reset stylesheet into raw HTML before printing */
function preparePrintHtml(rawHtml: string): string {
  const printStyles = `
    <style>
      @page { margin: 1.5cm; }
      body {
        font-family: 'Calibri', 'Arial', sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #000;
        background: #fff;
        margin: 0;
        padding: 0;
      }
      img { max-width: 100%; height: auto; }
      a { color: #000; text-decoration: underline; }
      pre, code { white-space: pre-wrap; word-break: break-all; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
      th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
      p { margin-bottom: 1em; }
      h1, h2, h3, h4, h5, h6 { color: #000; margin-top: 1.5em; margin-bottom: 0.5em; }
      @media screen {
        body { padding: 40px 48px; box-sizing: border-box; }
      }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
  `;

  return `<!DOCTYPE html><html><head>${printStyles}</head><body>${rawHtml}</body></html>`;
}

export default function WordToPdfPage() {
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
    const f = files.find((f) => f.name.toLowerCase().endsWith('.docx'));
    if (!f) {
      showToast('⚠️ Please upload a Word Document (.docx) file.', 'error');
      return;
    }
    
    setState('loading');
    setError(null);
    setFile(f);
    
    try {
      const arrayBuffer = await f.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      if (result.messages && result.messages.length > 0) {
        console.warn('Mammoth messages:', result.messages);
      }
      
      setHtmlContent(result.value);
      setState('ready');
    } catch (err) {
      console.error(err);
      setError('Failed to process the Word document. Make sure it is a valid .docx file.');
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
    doc.write(preparePrintHtml(htmlContent));
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
        incrementFileCount();
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
    setError(null);
  };

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">

          {/* Back button */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-word2pdf">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="tool-header animate-in">
            <div
              className="tool-header-icon"
              style={{
                background: 'linear-gradient(135deg, rgba(43,87,154,.18), rgba(43,87,154,.1))',
                border: '1px solid rgba(43,87,154,.25)',
              }}
            >
              📝
            </div>
            <h1>Word to PDF</h1>
            <p>Upload a Word Document (.docx) and convert it to a PDF securely in your browser.</p>
          </div>

          {/* DropZone */}
          {!file && (
            <div className="animate-in delay-1">
              <DropZone
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple={false}
                onFiles={handleFiles}
                icon="📝"
                title="Drop a Word file here"
                subtitle="Drag & drop a .docx file - or click to browse"
                badge="DOCX supported"
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
                    <p>Extracting Word document...</p>
                  </div>
                ) : (
                  <div className="html2pdf-preview-wrap" style={{ marginTop: 0 }}>
                    <div className="html2pdf-preview-label">
                      <span>Document Preview</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                        Extracted text and formatting
                      </span>
                    </div>
                    <div className="html2pdf-preview-frame-wrap" style={{ height: '500px' }}>
                      <iframe
                        ref={previewIframeRef}
                        className="html2pdf-preview-frame"
                        title="Document Preview"
                        sandbox="allow-same-origin"
                        id="word-preview-frame"
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
                    <span style={{ fontSize: 20 }}>📝</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', wordBreak: 'break-all' }}>{file.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {(file.size / 1024).toFixed(1)} KB · Word Document
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={reset} id="btn-reset-word2pdf">
                    🗑 Remove
                  </button>
                </div>

                <div className="html2pdf-note">
                  <span style={{ fontSize: 16 }}>ℹ️</span>
                  <span>
                    Click <strong>Convert to PDF</strong> below. Your browser's print dialog will open -
                    select <strong>"Save as PDF"</strong> to download the file. Note: Complex layouts may be simplified.
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
                    id="btn-convert-word-pdf"
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
                    { n: '3', text: 'Set destination to "Save as PDF"' },
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
          <h2>How to Convert Word to PDF</h2>
          <div className="tool-steps">
            <div className="tool-step">
              <div className="tool-step-num">1</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Upload your Word document</div>
                <div className="tool-step-desc">Click the upload area or drag your .docx file onto the page. PixelForge reads the document directly in your browser — no Word or Microsoft 365 subscription needed. Most standard DOCX formatting including headings, paragraphs, tables, and inline images is supported.</div>
              </div>
            </div>
            <div className="tool-step">
              <div className="tool-step-num">2</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Preview the document</div>
                <div className="tool-step-desc">PixelForge renders a preview of your Word document so you can check that the content is being interpreted correctly before converting. Review the text, images, and layout to ensure they look as expected.</div>
              </div>
            </div>
            <div className="tool-step">
              <div className="tool-step-num">3</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Convert to PDF and download</div>
                <div className="tool-step-desc">Click &quot;Convert to PDF&quot;. The tool uses your browser&apos;s built-in print engine to produce a PDF with proper margins and page breaks. The PDF is generated locally and ready to download immediately — no upload, no waiting.</div>
              </div>
            </div>
          </div>
          <div className="tool-privacy-note">
            <span className="tool-privacy-note-icon">🔒</span>
            <span>
              <strong>Your Word documents are converted privately, on your device.</strong> Many Word-to-PDF converters work by sending your document to a cloud server for processing. If your DOCX contains proprietary business content, personal information, or confidential contracts, this creates unnecessary exposure. PixelForge converts Word to PDF using the Mammoth.js library and your browser&apos;s native print-to-PDF capability — entirely offline, with no file ever leaving your machine.
            </span>
          </div>
        </div>

        <div className="tool-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question">Does PixelForge support .doc files (older Word format)?</div>
              <div className="faq-answer">Currently, PixelForge supports the modern .docx format (Word 2007 and later). The older .doc binary format is not supported. If you have a .doc file, open it in Word or Google Docs and save/export it as .docx first, then convert it here.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Why does the PDF look different from my original Word document?</div>
              <div className="faq-answer">PixelForge converts Word documents using browser-based HTML rendering, which may not perfectly replicate all Word-specific formatting — particularly complex layouts, custom fonts not available in the browser, or advanced page layout features. For pixel-perfect output, Microsoft Word or LibreOffice&apos;s own &quot;Save as PDF&quot; feature will give the most accurate result.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Can I convert a Word document with images to PDF?</div>
              <div className="faq-answer">Yes. Images embedded in your .docx file will be included in the PDF output. The layout may vary slightly depending on how images are anchored in the Word document, but inline images generally convert well.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Do I need Microsoft Word installed to use this tool?</div>
              <div className="faq-answer">No. PixelForge uses the open-source Mammoth.js library to parse and render .docx files entirely in your browser. You do not need Microsoft Word, Microsoft 365, or any other software installed on your device.</div>
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
                "name": "Does PixelForge support .doc files (older Word format)?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Currently, PixelForge supports the modern .docx format (Word 2007 and later). For .doc files, open them in Word or Google Docs and save as .docx first."
                }
              },
              {
                "@type": "Question",
                "name": "Why does the PDF look different from my original Word document?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "PixelForge converts using browser-based HTML rendering, which may not replicate all Word-specific formatting. For pixel-perfect output, use Microsoft Word's own Save as PDF feature."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert a Word document with images to PDF?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Images embedded in your .docx file will be included in the PDF output. Inline images generally convert well."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need Microsoft Word installed to convert Word to PDF?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. PixelForge uses the open-source Mammoth.js library to parse .docx files entirely in your browser. No Microsoft Word or Microsoft 365 subscription required."
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

