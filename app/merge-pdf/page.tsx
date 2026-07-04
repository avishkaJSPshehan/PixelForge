'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DropZone from '@/components/DropZone';
import { mergePdfs } from '@/lib/mergePdfs';
import type * as pdfjsLib from 'pdfjs-dist';

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

interface PdfItem {
  id: string;
  file: File;
  name: string;
  size: string;
  thumbnail?: string; // base64 data URL of first page
}

type State = 'idle' | 'merging' | 'done' | 'error';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Renders the first page of a PDF file to a small thumbnail data URL */
async function generateThumbnail(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 0.4 });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.75);
}

export default function MergePdfPage() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [state, setState] = useState<State>('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addFiles = useCallback((files: File[]) => {
    const accepted = files.filter((f) => f.type === 'application/pdf');
    if (accepted.length === 0) {
      showToast('⚠️ Please upload PDF files only.', 'error');
      return;
    }
    const newItems: PdfItem[] = accepted.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      name: f.name,
      size: formatSize(f.size),
      thumbnail: undefined,
    }));
    setItems((prev) => [...prev, ...newItems]);
    setState('idle');
    setError('');

    // Generate thumbnails asynchronously
    newItems.forEach((item) => {
      generateThumbnail(item.file).then((thumb) => {
        setItems((prev) =>
          prev.map((p) => (p.id === item.id ? { ...p, thumbnail: thumb } : p))
        );
      });
    });
  }, []);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setItems(updated);
  };

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const onDragStart = (index: number) => setDraggingIndex(index);

  const onDragEnterCard = (index: number, id: string) => {
    if (draggingIndex === null || draggingIndex === index) return;
    moveItem(draggingIndex, index);
    setDraggingIndex(index);
    setDragOverId(id);
  };

  const onDragEnd = () => {
    setDraggingIndex(null);
    setDragOverId(null);
  };

  const merge = async () => {
    if (items.length < 2) {
      showToast('⚠️ Please add at least 2 PDF files to merge.', 'error');
      return;
    }
    setState('merging');
    setProgress(0);
    setProgressText('');

    try {
      const pdfBytes = await mergePdfs(
        items.map((i) => i.file),
        (current, total) => {
          setProgress(Math.round((current / total) * 100));
          setProgressText(`Processing file ${current} of ${total}…`);
        }
      );

      const header = String.fromCharCode(pdfBytes[0], pdfBytes[1], pdfBytes[2], pdfBytes[3]);
      if (header !== '%PDF') {
        throw new Error(`Output is not a valid PDF (header: ${header})`);
      }

      const blob = new Blob([pdfBytes.slice()], { type: 'application/pdf' });
      downloadBlob(blob, 'PixelForge_merged.pdf');

      setState('done');
      showToast(`✓ Merged ${items.length} PDFs successfully!`);
    } catch (err) {
      console.error(err);
      setError('Merge failed. Make sure all files are valid, non-encrypted PDFs.');
      setState('error');
      showToast('⚠️ Merge failed.', 'error');
    }
  };

  const reset = () => {
    setItems([]);
    setState('idle');
    setProgress(0);
    setProgressText('');
    setError('');
  };

  return (
    <>
      <Navbar />
      <main className="page-content">
        <div className="container">

          {/* Back button */}
          <div style={{ paddingTop: 28 }}>
            <Link href="/" className="back-btn" id="btn-back-home-merge">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="tool-header animate-in">
            <div className="tool-header-icon pdf-icon">🔗</div>
            <h1>Merge PDFs</h1>
            <p>Combine two or more PDF files into a single document. Drag to reorder, then download.</p>
          </div>

          {/* DropZone */}
          <div className="animate-in delay-1">
            <DropZone
              accept="application/pdf"
              multiple
              onFiles={addFiles}
              icon="📑"
              title="Drop PDF files here"
              subtitle="Drag & drop two or more PDF files — or click to browse"
              badge="Multiple PDFs supported"
              disabled={state === 'merging'}
            />
          </div>

          {/* Merging progress */}
          {state === 'merging' && (
            <div className="glass-card animate-fade" style={{ padding: '36px 32px', textAlign: 'center', marginTop: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔗</div>
              <h3 style={{ marginBottom: 8 }}>Merging PDFs…</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>{progressText}</p>
              <div className="progress-wrap" style={{ maxWidth: 480, margin: '0 auto 12px' }}>
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{progress}%</span>
            </div>
          )}

          {/* PDF Tile Grid + controls */}
          {items.length > 0 && state !== 'merging' && (
            <>
              {/* Action bar */}
              <div className="action-bar animate-in" style={{ marginTop: 28 }}>
                <div className="action-bar-left">
                  <span className="badge badge-info">📑 {items.length} PDF{items.length > 1 ? 's' : ''} selected</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Drag tiles to reorder</span>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-danger btn-sm" onClick={reset} id="btn-clear-pdfs">
                    🗑 Clear all
                  </button>
                  {state === 'done' && (
                    <span className="badge badge-success" style={{ padding: '8px 14px' }}>✓ Merged PDF Downloaded!</span>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={merge}
                    disabled={(state as string) === 'merging' || items.length < 2}
                    id="btn-merge-pdfs"
                  >
                    {(state as string) === 'merging' ? (
                      <><div className="spinner" /> Merging…</>
                    ) : (
                      '⬇ Merge & Download PDF'
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p style={{ color: 'var(--secondary)', fontSize: 14, marginTop: 10 }}>⚠️ {error}</p>
              )}

              {/* PDF Thumbnail Tiles */}
              <div className="pdf-tile-grid animate-in delay-2">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`pdf-tile${dragOverId === item.id ? ' pdf-tile-dragging' : ''}`}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragEnter={() => onDragEnterCard(index, item.id)}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    id={`pdf-tile-${index + 1}`}
                    title={item.name}
                  >
                    {/* Order badge */}
                    <div className="pdf-tile-order">#{index + 1}</div>

                    {/* Remove button */}
                    <button
                      className="pdf-tile-remove"
                      onClick={() => removeItem(item.id)}
                      title={`Remove ${item.name}`}
                      id={`btn-remove-pdf-${index + 1}`}
                    >
                      ×
                    </button>

                    {/* Thumbnail */}
                    <div className="pdf-tile-thumb">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={`Page 1 of ${item.name}`} />
                      ) : (
                        <div className="pdf-tile-placeholder">
                          <span>📄</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loading…</span>
                        </div>
                      )}
                    </div>

                    {/* Filename */}
                    <div className="pdf-tile-name" title={item.name}>
                      {item.name.length > 22 ? item.name.slice(0, 19) + '…' : item.name}
                    </div>
                    <div className="pdf-tile-size">{item.size}</div>
                  </div>
                ))}

                {/* Add more tile */}
                <div
                  className="pdf-tile pdf-tile-add"
                  onClick={() => document.getElementById('dropzone-upload')?.click()}
                  id="btn-add-more-pdfs"
                >
                  <div className="pdf-tile-add-icon">+</div>
                  <div className="pdf-tile-name">Add more…</div>
                </div>
              </div>

              <div style={{ height: 60 }} />
            </>
          )}

          {/* Empty state */}
          {items.length === 0 && state === 'idle' && (
            <div className="empty-state animate-in delay-2">
              <div className="empty-state-icon">🔗</div>
              <p>Your PDF files will appear here once uploaded. Add at least 2 to merge.</p>
            </div>
          )}

        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
