'use client';

import { useState } from 'react';
import Link from 'next/link';
import { saveAs } from 'file-saver';
import DropZone from '@/components/DropZone';
import Navbar from '@/components/Navbar';
import { convertPdfToWord } from '@/lib/pdfToWord';
import { incrementFileCount } from '@/lib/fileCounter';

export default function PdfToWordPage() {
  const [state, setState] = useState<'idle' | 'converting' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const [file, setFile] = useState<File | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    const uploadedFile = files[0];
    setFile(uploadedFile);
    setFileName(uploadedFile.name.replace(/\.[^/.]+$/, ''));
    setError(null);
    setState('converting');
    setProgress(0);

    try {
      const blob = await convertPdfToWord(uploadedFile, (p) => {
        setProgress(p);
      });
      setResultBlob(blob);
      incrementFileCount();
      setState('done');
    } catch (err) {
      console.error(err);
      setError('Failed to convert PDF. Make sure the file is a valid, non-password-protected PDF.');
      setState('idle');
    }
  };

  const downloadFile = () => {
    if (!resultBlob) return;
    saveAs(resultBlob, `${fileName}_converted.docx`);
    showToast('✓ File downloaded!');
  };

  const reset = () => {
    setState('idle');
    setResultBlob(null);
    setProgress(0);
    setFile(null);
  };

  return (
    <>
      <Navbar />
      <main className="page-content">
        {toastMsg && <div className="toast-notification animate-in">{toastMsg}</div>}

        <div className="container">
          {/* Back */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-pdf2word">
              ← Back to Home
            </Link>
          </div>

          {state === 'idle' && (
          <>
            <div className="tool-header animate-in">
              <div className="tool-header-icon" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                <span style={{ fontSize: '32px' }}>📝</span>
              </div>
              <h1>PDF to Word</h1>
              <p>
                Upload a PDF and extract text into a Word document (.docx) -
                free, browser-based, no sign-up, your files never leave your device.
              </p>
            </div>

            <div className="tool-workspace animate-in delay-1">
              <DropZone
                onFiles={handleFiles}
                accept=".pdf,application/pdf"
                icon="📝"
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
                  <span className="p2e-info-icon">🔍</span>
                  <div>
                    <div className="p2e-info-title">Text Extraction</div>
                    <div className="p2e-info-body">Native support for Unicode text, including Sinhala characters.</div>
                  </div>
                </div>
                <div className="p2e-info-card">
                  <span className="p2e-info-icon">🔒</span>
                  <div>
                    <div className="p2e-info-title">100% Private</div>
                    <div className="p2e-info-body">We extract text entirely in your browser. No server uploads.</div>
                  </div>
                </div>
                <div className="p2e-info-card">
                  <span className="p2e-info-icon">⚡</span>
                  <div>
                    <div className="p2e-info-title">Instant Download</div>
                    <div className="p2e-info-body">Get your .docx file immediately - no waiting for server processing.</div>
                  </div>
                </div>
              </div>

              <div className="info-note" style={{ marginTop: 24 }}>
                <strong>Note:</strong> This tool extracts embedded text from PDFs. It works perfectly for PDFs saved from Word or browsers. It will <strong>not</strong> work on scanned image-only PDFs since they don&apos;t contain an embedded text layer.
              </div>
            </div>
          </>
        )}

        {state === 'converting' && (
          <div className="p2e-progress-card animate-in">
            <div className="p2e-progress-icon">⚙️</div>
            <h2 className="p2e-progress-title">Converting to Word...</h2>
            <p className="p2e-progress-sub">Reading text layers and building DOCX structure</p>
            
            <div className="p2e-bar-wrap">
              <div className="p2e-bar">
                <div className="p2e-bar-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="p2e-bar-pct">{progress}%</div>
            </div>
          </div>
        )}

        {state === 'done' && file && resultBlob && (
          <div className="animate-in delay-1" style={{ marginTop: 24 }}>
            <div className="split-main-layout">

              {/* Left: success visual */}
              <div className="split-main-left">
                <div className="glass-card p2e-result-preview">
                  <div className="p2e-result-icon">✅</div>
                  <h3 className="p2e-result-title">Extraction Complete</h3>
                  <p className="p2e-result-sub">
                    Your PDF has been successfully converted into a Word document.
                  </p>
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
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={reset}>
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
                    onClick={downloadFile}
                    style={{ width: '100%', padding: '16px', fontSize: 16 }}
                  >
                    ⬇️ Download {fileName}.docx
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={reset}
                    style={{ width: '100%' }}
                  >
                    Convert Another PDF
                  </button>
                </div>

                {/* Step hint */}
                <div className="html2pdf-steps" style={{ marginTop: 20 }}>
                  {[
                    { n: '1', text: 'PDF text layer read in browser' },
                    { n: '2', text: 'Text grouped into paragraphs' },
                    { n: '3', text: 'Word DOCX document built' },
                    { n: '4', text: 'Click Download - open in Word' },
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
        <h2>How to Convert PDF to Word</h2>
        <div className="tool-steps">
          <div className="tool-step">
            <div className="tool-step-num">1</div>
            <div className="tool-step-body">
              <div className="tool-step-title">Upload your PDF</div>
              <div className="tool-step-desc">Click the upload area or drag your PDF file onto the page. PixelForge reads the document in your browser and extracts the text and structural content using PDF.js, preparing it for conversion to Word format.</div>
            </div>
          </div>
          <div className="tool-step">
            <div className="tool-step-num">2</div>
            <div className="tool-step-body">
              <div className="tool-step-title">Wait for extraction</div>
              <div className="tool-step-desc">The tool analyses each page of your PDF, extracting text, detecting paragraphs and structure, and building the Word document content. A progress bar shows you which page is being processed. Larger PDFs take longer.</div>
            </div>
          </div>
          <div className="tool-step">
            <div className="tool-step-num">3</div>
            <div className="tool-step-body">
              <div className="tool-step-title">Download the Word file</div>
              <div className="tool-step-desc">Click &quot;Download Word Document&quot; to save the .docx file. Open it in Microsoft Word, Google Docs, LibreOffice, or any other word processor to edit the extracted content. Review the output and make any formatting adjustments needed.</div>
            </div>
          </div>
        </div>
        <div className="tool-privacy-note">
          <span className="tool-privacy-note-icon">🔒</span>
          <span>
            <strong>PDF text is extracted and converted in your browser.</strong> Cloud-based PDF-to-Word converters upload your document to a remote server where text extraction and DOCX generation occur. If your PDF contains confidential reports, legal documents, or proprietary content, this exposes your data unnecessarily. PixelForge extracts text using PDF.js and generates the .docx file using docx.js — both running entirely in your browser. Your PDF never leaves your device.
          </span>
        </div>
      </div>

      <div className="tool-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          <div className="faq-item">
            <div className="faq-question">How accurately does PDF-to-Word conversion preserve formatting?</div>
            <div className="faq-answer">PDF-to-Word conversion accuracy depends heavily on how the original PDF was created. PDFs generated from Word documents or other text-based applications convert well — with most paragraphs, headings, and basic structure intact. Scanned PDFs (images of text) do not convert accurately because there is no embedded text to extract — only image data.</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">Will images from the PDF be included in the Word document?</div>
            <div className="faq-answer">Images embedded as graphic objects in the PDF may or may not be included in the output .docx file, depending on how they are encoded in the PDF. Text and paragraph structure are the primary focus of this conversion. For complex PDFs with many embedded images, the output may require manual cleanup.</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">Why does my converted Word document look different from the PDF?</div>
            <div className="faq-answer">PDFs are fixed-layout documents — they store precise positions of every element on the page. Word documents are flow-based — text reflows based on the document&apos;s margins and styles. Converting between these two fundamentally different formats inevitably causes some layout differences. Tables, multi-column layouts, and decorative elements are particularly likely to need adjustment after conversion.</div>
          </div>
          <div className="faq-item">
            <div className="faq-question">Can I convert a scanned PDF to an editable Word document?</div>
            <div className="faq-answer">No. Scanned PDFs are essentially images — they contain no selectable text, only pixel data. PixelForge&apos;s PDF-to-Word tool extracts embedded text, which scanned documents do not have. To convert a scanned PDF to an editable Word file, you would need OCR (Optical Character Recognition) software such as Adobe Acrobat Pro, ABBYY FineReader, or a dedicated OCR online service.</div>
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
              "name": "How accurately does PDF-to-Word conversion preserve formatting?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Accuracy depends on the original PDF. Text-based PDFs convert well with most paragraphs and headings intact. Scanned PDFs do not convert accurately as they contain only image data, not embedded text."
              }
            },
            {
              "@type": "Question",
              "name": "Will images from the PDF be included in the Word document?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Images may or may not be included depending on how they are encoded in the PDF. Text and paragraph structure are the primary focus. Complex PDFs with many images may require manual cleanup."
              }
            },
            {
              "@type": "Question",
              "name": "Why does the converted Word document look different from the PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "PDFs use fixed layouts while Word documents are flow-based. Converting between these formats causes layout differences, especially for tables, multi-column layouts, and decorative elements."
              }
            },
            {
              "@type": "Question",
              "name": "Can I convert a scanned PDF to an editable Word document?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "No. Scanned PDFs contain only image data without selectable text. You need OCR software such as Adobe Acrobat Pro or ABBYY FineReader to convert scanned PDFs to editable Word files."
              }
            }
          ]
        })
      }}
    />
    </>
  );
}

