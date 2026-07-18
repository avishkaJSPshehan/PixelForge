'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DropZone from '@/components/DropZone';
import { imagesToPdf } from '@/lib/imagesToPdf';
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

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  name: string;
}

type State = 'idle' | 'converting' | 'done' | 'error';

export default function ImageToPdfPage() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [state, setState] = useState<State>('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addFiles = useCallback((files: File[]) => {
    const accepted = files.filter((f) =>
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'image/gif'].includes(f.type)
    );
    if (accepted.length === 0) {
      showToast('⚠️ Please upload image files (JPG, PNG, WebP).', 'error');
      return;
    }
    const newItems: ImageItem[] = accepted.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
      name: f.name,
    }));
    setItems((prev) => [...prev, ...newItems]);
    setState('idle');
    setError('');
  }, []);

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setItems(updated);
  };

  // Drag-to-reorder within grid
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const onDragStart = (index: number) => setDraggingIndex(index);

  const onDragEnterCard = (index: number) => {
    if (draggingIndex === null || draggingIndex === index) return;
    moveItem(draggingIndex, index);
    setDraggingIndex(index);
    setDragOver(items[index]?.id ?? null);
  };

  const onDragEnd = () => {
    setDraggingIndex(null);
    setDragOver(null);
  };

  const convert = async () => {
    if (items.length === 0) {
      showToast('⚠️ Please add at least one image.', 'error');
      return;
    }
    setState('converting');
    setProgress(0);
    setProgressText('');

    try {
      const pdfBytes = await imagesToPdf(
        items.map((i) => i.file),
        (current, total) => {
          setProgress(Math.round((current / total) * 100));
          setProgressText(`Processing image ${current} of ${total}…`);
        }
      );

      // Basic sanity check - a valid PDF starts with "%PDF"
      const header = String.fromCharCode(pdfBytes[0], pdfBytes[1], pdfBytes[2], pdfBytes[3]);
      if (header !== '%PDF') {
        throw new Error(`Generated file is not a valid PDF (got header: ${header})`);
      }

      // Use file-saver for reliable cross-browser named download
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(pdfBlob, 'PixelForge_output.pdf');

      incrementFileCount();

      setState('done');
      showToast(`✓ PDF created with ${items.length} page${items.length > 1 ? 's' : ''}!`);
    } catch (err) {
      console.error(err);
      setError('Conversion failed. Please try again with different images.');
      setState('error');
      showToast('⚠️ Conversion failed.', 'error');
    }
  };

  const reset = () => {
    items.forEach((i) => URL.revokeObjectURL(i.preview));
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
            <Link href="/" className="back-btn" id="btn-back-home-img2pdf">
              ← Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="tool-header animate-in">
            <div className="tool-header-icon img-icon">🖼️</div>
            <h1>Images to PDF</h1>
            <p>Combine multiple images into a single polished PDF document.</p>
          </div>

          {/* DropZone */}
          <div className="animate-in delay-1">
            <DropZone
              accept="image/*"
              multiple
              onFiles={addFiles}
              icon="🖼️"
              title="Drop images here"
              subtitle="Drag & drop JPG, PNG, or WebP files - or click to browse"
              badge="Multiple images supported"
              disabled={state === 'converting'}
            />
          </div>

          {/* Converting */}
          {state === 'converting' && (
            <div className="glass-card animate-fade" style={{ padding: '36px 32px', textAlign: 'center', marginTop: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⚙️</div>
              <h3 style={{ marginBottom: 8 }}>Generating PDF…</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>{progressText}</p>
              <div className="progress-wrap" style={{ maxWidth: 480, margin: '0 auto 12px' }}>
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{progress}%</span>
            </div>
          )}

          {/* Image List + Controls */}
          {items.length > 0 && state !== 'converting' && (
            <>
              {/* Action Bar */}
              <div className="action-bar animate-in" style={{ marginTop: 28 }}>
                <div className="action-bar-left">
                  <span className="badge badge-info">🖼 {items.length} image{items.length > 1 ? 's' : ''} selected</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Drag cards to reorder pages</span>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-danger btn-sm" onClick={reset} id="btn-clear-images">
                    🗑 Clear all
                  </button>
                  {state === 'done' && (
                    <span className="badge badge-success" style={{ padding: '8px 14px' }}>✓ PDF Downloaded!</span>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={convert}
                    disabled={(state as State) === 'converting' || items.length === 0}
                    id="btn-convert-to-pdf"
                  >
                    {(state as State) === 'converting' ? (
                      <><div className="spinner" /> Converting…</>
                    ) : (
                      '⬇ Convert & Download PDF'
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p style={{ color: 'var(--secondary)', fontSize: 14, marginTop: 10 }}>⚠️ {error}</p>
              )}

              {/* Image Thumbnails Grid */}
              <div className="upload-grid">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`upload-thumb-card${dragOver === item.id ? ' dragging' : ''}`}
                    draggable
                    onDragStart={() => onDragStart(index)}
                    onDragEnter={() => onDragEnterCard(index)}
                    onDragEnd={onDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    id={`thumb-card-${index + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.preview} alt={item.name} />
                    <div className="upload-thumb-number">#{index + 1}</div>
                    <button
                      className="upload-thumb-remove"
                      onClick={() => removeItem(item.id)}
                      title={`Remove ${item.name}`}
                      id={`btn-remove-image-${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Add More tile */}
                <div
                  className="upload-thumb-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 8,
                    cursor: 'pointer',
                    border: '2px dashed var(--border)',
                    background: 'transparent',
                    opacity: 0.7,
                    fontSize: 13,
                    color: 'var(--text-muted)',
                  }}
                  onClick={() => document.getElementById('file-input')?.click()}
                  id="btn-add-more-images"
                >
                  <span style={{ fontSize: 28 }}>+</span>
                  <span>Add more</span>
                </div>
              </div>
              <div style={{ height: 60 }} />
            </>
          )}

          {/* Empty State (no items yet) */}
          {items.length === 0 && state === 'idle' && (
            <div className="empty-state animate-in delay-2">
              <div className="empty-state-icon">🗂️</div>
              <p>Your images will appear here once uploaded.</p>
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
