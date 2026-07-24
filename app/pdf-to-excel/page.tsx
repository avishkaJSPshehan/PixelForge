'use client';
import { incrementFileCount } from '@/lib/fileCounter';

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
      incrementFileCount();
      setState('done');
      showToast(`✓ ${sheets.length} page${sheets.length !== 1 ? 's' : ''} extracted - ready to download!`);
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
              Upload a PDF and extract all text into a structured Excel spreadsheet (.xlsx) -
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
                    <div className="p2e-info-body">Get your .xlsx file immediately - no waiting for server processing.</div>
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
                      { n: '4', text: 'Click Download - open in Excel or Sheets' },
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

      {/* ── Content & FAQ section ── */}
      <div className="tool-content-section">
        <div className="tool-how-to">
          <h2>How to Convert PDF to Excel</h2>
          <div className="tool-steps">
            <div className="tool-step">
              <div className="tool-step-num">1</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Upload your PDF</div>
                <div className="tool-step-desc">Click the upload area or drag your PDF file onto the page. PixelForge reads the document in your browser and analyses the page content to detect tables and structured data, using PDF.js for text extraction.</div>
              </div>
            </div>
            <div className="tool-step">
              <div className="tool-step-num">2</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Wait for table detection</div>
                <div className="tool-step-desc">The tool processes your PDF page by page, identifying rows and columns based on text position and alignment. A progress indicator will show you which page is currently being analysed. Longer PDFs will take proportionally more time.</div>
              </div>
            </div>
            <div className="tool-step">
              <div className="tool-step-num">3</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Download the Excel file</div>
                <div className="tool-step-desc">Once extraction is complete, click &quot;Download Excel&quot; to save the .xlsx file. Each detected table section is placed in the spreadsheet. Open it in Excel, Google Sheets, or LibreOffice Calc to review and edit the extracted data.</div>
              </div>
            </div>
          </div>
          <div className="tool-privacy-note">
            <span className="tool-privacy-note-icon">🔒</span>
            <span>
              <strong>PDF tables are extracted in your browser — your data stays private.</strong> Financial reports, inventory sheets, budget PDFs, and similar data-heavy documents often contain information you would not want sent to a third-party server. PixelForge extracts table data entirely in your browser using PDF.js text extraction and the SheetJS library for Excel generation. No data from your PDF is ever transmitted to a server.
            </span>
          </div>
        </div>

        <div className="tool-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question">What kinds of PDFs work best for conversion to Excel?</div>
              <div className="faq-answer">PDFs with clear, text-based table structures work best — such as financial reports, price lists, data exports, or bank statements generated directly from software. Scanned PDFs (photos of documents) will not work well because they do not contain selectable text — only image pixels — which means the text extraction step cannot identify table content.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Will all the tables from my PDF be extracted?</div>
              <div className="faq-answer">PixelForge attempts to extract all tables across all pages of the PDF. The accuracy of extraction depends on how the tables were created in the original PDF. PDFs with embedded, machine-generated text and clear column alignment will convert most accurately. Complex multi-column layouts or merged cells may require manual cleanup in Excel after conversion.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Why does my Excel output look different from the PDF table?</div>
              <div className="faq-answer">PDF does not store explicit table structure — it only stores text positions and visual formatting. PixelForge infers table rows and columns from text coordinates, which works well for standard tables but may misalign cells in complex or irregularly formatted layouts. For precise data extraction, consider using Adobe Acrobat Pro&apos;s Export to Excel function, which has deeper access to the PDF&apos;s internal structure.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Can I convert a multi-page PDF with many tables?</div>
              <div className="faq-answer">Yes. PixelForge processes all pages of the PDF and combines the extracted data into a single .xlsx file. Each table section detected across all pages will be included. Longer PDFs may take more time to process, as all processing happens locally in your browser.</div>
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
                "name": "What kinds of PDFs work best for conversion to Excel?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "PDFs with clear, text-based table structures work best — such as financial reports, price lists, or data exports generated directly from software. Scanned PDFs do not work as they contain only image pixels."
                }
              },
              {
                "@type": "Question",
                "name": "Will all tables from my PDF be extracted to Excel?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "PixelForge attempts to extract all tables across all pages. Accuracy depends on how the tables were created. Complex layouts or merged cells may require manual cleanup in Excel."
                }
              },
              {
                "@type": "Question",
                "name": "Why does my Excel output look different from the PDF table?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "PDF does not store explicit table structure — only text positions. PixelForge infers rows and columns from coordinates, which works well for standard tables but may misalign in complex layouts."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert a multi-page PDF with many tables to Excel?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. PixelForge processes all pages and combines extracted data into a single .xlsx file. Longer PDFs may take more time since processing happens locally in your browser."
                }
              }
            ]
          })
        }}
      />

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}

