'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DropZone from '@/components/DropZone';

type State = 'idle' | 'loading' | 'ready' | 'printing';

// ─── Accepted Excel MIME types ────────────────────────────────────────────────
const EXCEL_ACCEPT = [
  '.xlsx',
  '.xls',
  '.xlsm',
  '.xlsb',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
].join(',');

function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.xlsx') ||
    name.endsWith('.xls') ||
    name.endsWith('.xlsm') ||
    name.endsWith('.xlsb')
  );
}

// ─── Build a printable HTML document from SheetJS HTML output ────────────────
function buildPrintHtml(sheetsHtml: { name: string; html: string }[]): string {
  const sheetBlocks = sheetsHtml
    .map(
      ({ name, html }) => `
        <div class="sheet-block">
          <h2 class="sheet-title">${escapeHtml(name)}</h2>
          ${html}
        </div>
      `,
    )
    .join('<div class="sheet-break"></div>');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { margin: 1.2cm 1.4cm; size: A4 landscape; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 9pt;
    color: #000;
    background: #fff;
    margin: 0;
    padding: 0;
  }
  .sheet-block { margin-bottom: 2em; }
  .sheet-title {
    font-size: 12pt;
    font-weight: bold;
    border-bottom: 2px solid #333;
    padding-bottom: 4px;
    margin-bottom: 12px;
    color: #1a1a2e;
  }
  .sheet-break { page-break-after: always; height: 0; }
  table {
    border-collapse: collapse;
    width: 100%;
    table-layout: auto;
    font-size: 8.5pt;
    margin-bottom: 1em;
  }
  th, td {
    border: 1px solid #bbb;
    padding: 4px 7px;
    text-align: left;
    vertical-align: top;
    word-break: break-word;
    white-space: pre-wrap;
  }
  thead tr { background: #d6e4f0; font-weight: bold; }
  tr:nth-child(even) { background: #f4f8fc; }
  @media screen {
    body { padding: 28px 32px; }
  }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .sheet-block { page-break-inside: avoid; }
  }
</style>
</head>
<body>
${sheetBlocks}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ExcelToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sheetsHtml, setSheetsHtml] = useState<{ name: string; html: string }[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Parse Excel file ────────────────────────────────────────────────────────
  const handleFiles = useCallback(async (files: File[]) => {
    const f = files.find(isExcelFile);
    if (!f) {
      showToast('⚠️ Please upload an Excel file (.xlsx, .xls, .xlsm)', 'error');
      return;
    }

    setState('loading');
    setError(null);
    setFile(f);
    setSheetsHtml([]);
    setActiveSheet(0);

    try {
      // Dynamic import so SheetJS is only bundled when needed
      const XLSX = await import('xlsx');

      const buffer = await f.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellStyles: true });

      const results: { name: string; html: string }[] = [];

      for (const sheetName of workbook.SheetNames) {
        const ws = workbook.Sheets[sheetName];
        // SheetJS utility that converts a worksheet to an HTML <table>
        const html = XLSX.utils.sheet_to_html(ws, { editable: false });
        results.push({ name: sheetName, html });
      }

      if (results.length === 0) {
        throw new Error('No sheets found in the workbook.');
      }

      setSheetsHtml(results);
      setState('ready');
    } catch (err) {
      console.error(err);
      setError(
        'Failed to read the Excel file. Make sure it is a valid .xlsx / .xls file and is not password-protected.',
      );
      setState('idle');
      showToast('⚠️ Could not load Excel file.', 'error');
    }
  }, []);

  // ── Sync preview iframe when sheet/content changes ──────────────────────────
  useEffect(() => {
    const iframe = previewIframeRef.current;
    if (!iframe || sheetsHtml.length === 0) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    const current = sheetsHtml[activeSheet];
    if (!current) return;
    doc.open();
    doc.write(buildPrintHtml([current]));
    doc.close();
  }, [sheetsHtml, activeSheet]);

  // ── Print all sheets as PDF ─────────────────────────────────────────────────
  const handleConvert = () => {
    if (sheetsHtml.length === 0) return;
    setState('printing');

    const iframe = printIframeRef.current;
    if (!iframe) { setState('ready'); return; }

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) { setState('ready'); return; }

    doc.open();
    doc.write(buildPrintHtml(sheetsHtml));
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        showToast('✓ Print dialog opened - choose "Save as PDF" to download.');
      } catch {
        showToast('⚠️ Could not open print dialog.', 'error');
      }
      setState('ready');
    }, 700);
  };

  const reset = () => {
    setFile(null);
    setSheetsHtml([]);
    setActiveSheet(0);
    setState('idle');
    setError(null);
  };

  const isPrinting = state === 'printing';
  const isLoading  = state === 'loading';

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">

          {/* Back */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-excel2pdf">
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
            <h1>Excel to PDF</h1>
            <p>
              Upload an Excel spreadsheet (.xlsx, .xls) and convert it to a PDF instantly -
              free, browser-based, no sign-up required.
            </p>
          </div>

          {/* ── Drop Zone ── */}
          {!file && (
            <div className="animate-in delay-1">
              <DropZone
                accept={EXCEL_ACCEPT}
                multiple={false}
                onFiles={handleFiles}
                icon="📊"
                title="Drop your Excel file here"
                subtitle="Supports .xlsx, .xls, .xlsm - all sheets converted to one PDF"
                badge="Excel supported"
                disabled={isLoading}
              />
            </div>
          )}

          {/* ── Loading ── */}
          {isLoading && (
            <div
              className="glass-card animate-fade"
              style={{ padding: '40px 32px', textAlign: 'center', marginTop: 24 }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <h3 style={{ marginBottom: 8 }}>Reading Excel file…</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Parsing sheets and generating preview
              </p>
              <div style={{ marginTop: 20 }}>
                <div
                  className="spinner"
                  style={{ margin: '0 auto', borderTopColor: 'var(--primary)', width: 28, height: 28 }}
                />
              </div>
            </div>
          )}

          {/* ── Main panel ── */}
          {file && !isLoading && sheetsHtml.length > 0 && (
            <>
              <div className="split-main-layout animate-in delay-1" style={{ marginTop: 24 }}>

                {/* ── LEFT: preview ── */}
                <div className="split-main-left">

                  {/* Sheet tabs (if multiple) */}
                  {sheetsHtml.length > 1 && (
                    <div className="excel-sheet-tabs">
                      {sheetsHtml.map((s, i) => (
                        <button
                          key={i}
                          className={`excel-sheet-tab${i === activeSheet ? ' excel-sheet-tab--active' : ''}`}
                          onClick={() => setActiveSheet(i)}
                        >
                          📋 {s.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Preview label */}
                  <div className="html2pdf-preview-wrap" style={{ marginTop: sheetsHtml.length > 1 ? 0 : 0 }}>
                    <div className="html2pdf-preview-label">
                      <span>
                        Spreadsheet Preview
                        {sheetsHtml.length > 1 && (
                          <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                            - {sheetsHtml[activeSheet]?.name}
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                        {sheetsHtml.length} sheet{sheetsHtml.length !== 1 ? 's' : ''} total
                      </span>
                    </div>
                    <div className="html2pdf-preview-frame-wrap" style={{ height: 520 }}>
                      <iframe
                        ref={previewIframeRef}
                        className="html2pdf-preview-frame"
                        title="Excel Preview"
                        sandbox="allow-same-origin"
                        id="excel-preview-frame"
                      />
                    </div>
                  </div>
                </div>

                {/* ── RIGHT: controls ── */}
                <div className="split-main-right">

                  {/* File info */}
                  <div className="action-bar" style={{ marginTop: 0 }}>
                    <div className="action-bar-left">
                      <span style={{ fontSize: 20 }}>📊</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', wordBreak: 'break-all' }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {(file.size / 1024).toFixed(1)} KB · {sheetsHtml.length} sheet{sheetsHtml.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={reset} id="btn-reset-excel2pdf">
                      🗑 Remove
                    </button>
                  </div>

                  {/* Info note */}
                  <div className="html2pdf-note" style={{ marginTop: 16 }}>
                    <span style={{ fontSize: 16 }}>ℹ️</span>
                    <span>
                      Click <strong>Convert to PDF</strong> below. Your browser&apos;s print dialog
                      will open - select <strong>&quot;Save as PDF&quot;</strong> as the destination.
                      {sheetsHtml.length > 1 && (
                        <> All <strong>{sheetsHtml.length} sheets</strong> will be included.</>
                      )}
                    </span>
                  </div>

                  {error && (
                    <p style={{ color: 'var(--secondary)', fontSize: 13, marginTop: 10 }}>
                      ⚠️ {error}
                    </p>
                  )}

                  {/* Action button */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleConvert}
                      disabled={isPrinting || !!error}
                      id="btn-convert-excel-pdf"
                      style={{ width: '100%', padding: '16px', fontSize: 16 }}
                    >
                      {isPrinting ? (
                        <><div className="spinner" /> Opening print dialog…</>
                      ) : (
                        '🖨️ Convert to PDF'
                      )}
                    </button>
                  </div>

                  {/* Steps */}
                  <div className="html2pdf-steps" style={{ marginTop: 16 }}>
                    {[
                      { n: '1', text: 'Click "Convert to PDF"' },
                      { n: '2', text: 'Browser print dialog opens' },
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
              <div style={{ height: 60 }} />
            </>
          )}

          {/* Hidden print iframe */}
          <iframe
            ref={printIframeRef}
            style={{ width: 0, height: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}
            title="Print Frame"
            sandbox="allow-same-origin allow-modals"
            id="excel-print-iframe"
          />

        </div>
      </main>

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}
