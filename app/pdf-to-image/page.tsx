'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DropZone from '@/components/DropZone';
import ImageCard from '@/components/ImageCard';
import { pdfToImages, ConversionResult } from '@/lib/pdfToImages';
import { incrementFileCount } from '@/lib/fileCounter';
// Native download helper - more reliable than file-saver for named files
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

type State = 'idle' | 'converting' | 'done' | 'error';

export default function PdfToImagePage() {
  const [state, setState] = useState<State>('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [images, setImages] = useState<ConversionResult[]>([]);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      setState('error');
      return;
    }

    setState('converting');
    setImages([]);
    setError('');
    setProgress(0);
    setFileName(file.name.replace(/\.pdf$/i, ''));

    try {
      const results = await pdfToImages(file, (current, total) => {
        setProgress(Math.round((current / total) * 100));
        setProgressText(`Converting page ${current} of ${total}…`);
      });
      setImages(results);
      incrementFileCount();
      setState('done');
      showToast(`✓ ${results.length} page${results.length > 1 ? 's' : ''} converted!`);
    } catch (err) {
      console.error(err);
      setError('Conversion failed. Please try a different PDF file.');
      setState('error');
    }
  }, []);

  const downloadSingle = (result: ConversionResult) => {
    const byteString = atob(result.dataUrl.split(',')[1]);
    const arr = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) arr[i] = byteString.charCodeAt(i);
    const blob = new Blob([arr], { type: 'image/png' });
    downloadBlob(blob, `${fileName}_page_${result.pageNumber}.png`);
  };

  const downloadAll = async () => {
    if (images.length === 0) return;

    // Dynamically import JSZip to avoid SSR issues
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const folder = zip.folder(fileName || 'pages')!;

    for (const img of images) {
      const base64 = img.dataUrl.split(',')[1];
      folder.file(`page_${img.pageNumber}.png`, base64, { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${fileName || 'pages'}.zip`);
    showToast('✓ ZIP downloaded!');
  };

  const reset = () => {
    setState('idle');
    setImages([]);
    setProgress(0);
    setProgressText('');
    setError('');
    setFileName('');
  };

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">

          {/* Back button */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-pdf2img">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="tool-header animate-in">
            <div className="tool-header-icon pdf-icon">📄</div>
            <h1>PDF to Images</h1>
            <p>Upload a PDF and convert each page into a high-quality PNG image.</p>
          </div>

          {/* Drop Zone */}
          {(state === 'idle' || state === 'error') && (
            <div className="animate-in delay-1">
              <DropZone
                accept="application/pdf"
                onFiles={handleFiles}
                icon="📂"
                title="Drop your PDF here"
                subtitle="Drag &amp; drop a PDF file, or click to browse"
                badge="PDF files only"
              />
              {state === 'error' && (
                <p style={{ color: 'var(--secondary)', textAlign: 'center', marginTop: 16, fontSize: 14 }}>
                  ⚠️ {error}
                </p>
              )}
            </div>
          )}

          {/* Converting */}
          {state === 'converting' && (
            <div className="glass-card animate-fade" style={{ padding: '40px 32px', textAlign: 'center', marginTop: 8 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
              <h3 style={{ marginBottom: 8, fontSize: 20 }}>Converting your PDF…</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 14 }}>{progressText}</p>
              <div className="progress-wrap" style={{ maxWidth: 480, margin: '0 auto 14px' }}>
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{progress}%</span>
            </div>
          )}

          {/* Results */}
          {state === 'done' && images.length > 0 && (
            <>
              {/* Action Bar */}
              <div className="action-bar animate-in">
                <div className="action-bar-left">
                  <span className="badge badge-success">✓ {images.length} pages converted</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{fileName}.pdf</span>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={reset}
                    id="btn-reset-pdf"
                  >
                    ↩ New PDF
                  </button>
                  <button
                    className="btn btn-accent"
                    onClick={downloadAll}
                    id="btn-download-all-zip"
                  >
                    ⬇ Download All as ZIP
                  </button>
                </div>
              </div>

              {/* Image Grid */}
              <div className="image-grid">
                {images.map((img) => (
                  <ImageCard
                    key={img.pageNumber}
                    src={img.dataUrl}
                    pageNumber={img.pageNumber}
                    onDownload={() => downloadSingle(img)}
                  />
                ))}
              </div>
              <div style={{ height: 60 }} />
            </>
          )}
        </div>
      </main>

      {/* ── Content & FAQ section ── */}
      <div className="tool-content-section">
        <div className="tool-how-to">
          <h2>How to Convert a PDF to Images</h2>
          <div className="tool-steps">
            <div className="tool-step">
              <div className="tool-step-num">1</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Upload your PDF</div>
                <div className="tool-step-desc">Click the upload area or drag your PDF file onto the page. PixelForge loads the document entirely in your browser using PDF.js and will display how many pages it contains.</div>
              </div>
            </div>
            <div className="tool-step">
              <div className="tool-step-num">2</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Choose your settings</div>
                <div className="tool-step-desc">Select the output format (JPG for smaller files, PNG for higher quality with transparency support) and the resolution/scale. Higher scale values produce sharper images suitable for printing; lower values are better for web or email sharing.</div>
              </div>
            </div>
            <div className="tool-step">
              <div className="tool-step-num">3</div>
              <div className="tool-step-body">
                <div className="tool-step-title">Convert and download</div>
                <div className="tool-step-desc">Click &quot;Convert to Images&quot;. Each page is rendered to a separate image file in your browser. You can then download individual pages or save all images at once as a ZIP archive — all without any file leaving your device.</div>
              </div>
            </div>
          </div>
          <div className="tool-privacy-note">
            <span className="tool-privacy-note-icon">🔒</span>
            <span>
              <strong>PDF pages are rendered on your device, not in the cloud.</strong> Most PDF-to-image conversion services require uploading your document to a remote server where pages are rendered and sent back as images. This creates a window during which your PDF exists on someone else&apos;s infrastructure. PixelForge renders every page directly in your browser using WebAssembly-powered PDF.js — your document is never transmitted, and image generation is instant with no waiting for server round-trips.
            </span>
          </div>
        </div>

        <div className="tool-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question">Should I choose JPG or PNG when converting a PDF to images?</div>
              <div className="faq-answer">Choose JPG if you need smaller file sizes and the PDF does not contain transparent elements. JPG works well for scanned documents and photo-heavy PDFs. Choose PNG if you need lossless quality or the PDF contains text, diagrams, or transparency — PNG will preserve crispness and any transparent backgrounds that exist in the original.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">How do I convert only specific pages of a PDF to images?</div>
              <div className="faq-answer">After converting, you can simply download the individual page images you want and ignore the rest. Alternatively, use the <a href="/split-pdf">Split PDF tool</a> first to extract only the pages you need, then convert the resulting smaller PDF to images.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">What resolution are the output images?</div>
              <div className="faq-answer">The output resolution depends on the scale setting you choose. A scale of 1.5x produces images roughly equivalent to 108 DPI; 2x produces approximately 144 DPI; and 3x produces approximately 216 DPI. Higher scale settings are recommended if you plan to print the images.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Can I convert a password-protected PDF to images?</div>
              <div className="faq-answer">If the PDF is password-protected, the tool will not be able to render it unless you provide the password. Use the browser&apos;s built-in PDF viewer to unlock the file first, or use our <a href="/protect-pdf">Protect PDF</a> tool to manage encryption, then convert.</div>
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
                "name": "Should I choose JPG or PNG when converting a PDF to images?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Choose JPG for smaller file sizes. Choose PNG for lossless quality, especially if the PDF contains text, diagrams, or transparent elements — PNG preserves crispness and transparency."
                }
              },
              {
                "@type": "Question",
                "name": "How do I convert only specific pages of a PDF to images?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "After converting, download only the individual page images you want. Alternatively, use the Split PDF tool first to extract specific pages, then convert that smaller PDF to images."
                }
              },
              {
                "@type": "Question",
                "name": "What resolution are the output images when converting PDF to images?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Output resolution depends on the scale setting chosen. Higher scale settings produce sharper images and are recommended for printing."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert a password-protected PDF to images?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Password-protected PDFs cannot be converted until unlocked. Unlock the file in your browser's PDF viewer first, then convert."
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

