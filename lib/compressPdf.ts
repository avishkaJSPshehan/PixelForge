/**
 * lib/compressPdf.ts
 *
 * Compresses a PDF by rendering each page to a JPEG canvas at reduced quality
 * using pdfjs-dist, then rebuilding the PDF using pdf-lib.
 *
 * All processing happens entirely in the browser — files never leave the device.
 */

export type CompressionLevel = 'low' | 'medium' | 'high';

interface CompressionConfig {
  scale: number;       // canvas render scale (lower = smaller)
  quality: number;     // JPEG quality 0-1 (lower = smaller)
  label: string;
}

const COMPRESSION_CONFIGS: Record<CompressionLevel, CompressionConfig> = {
  low:    { scale: 1.5, quality: 0.85, label: 'Low Compression (Best Quality)' },
  medium: { scale: 1.2, quality: 0.65, label: 'Medium Compression (Balanced)' },
  high:   { scale: 0.9, quality: 0.40, label: 'High Compression (Smallest Size)' },
};

export { COMPRESSION_CONFIGS };

/**
 * Compresses a PDF file by re-rendering pages as JPEG images.
 *
 * @param file       Source PDF File object
 * @param level      Compression level: 'low' | 'medium' | 'high'
 * @param onProgress Progress callback (0-100)
 * @returns          Compressed PDF as a Uint8Array
 */
export async function compressPdf(
  file: File,
  level: CompressionLevel = 'medium',
  onProgress?: (progress: number) => void
): Promise<Uint8Array> {
  const { scale, quality } = COMPRESSION_CONFIGS[level];

  // ── 1. Load pdfjs-dist dynamically (avoids SSR issues) ─────────────────────
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdfDoc.numPages;

  // ── 2. Load pdf-lib dynamically ─────────────────────────────────────────────
  const { PDFDocument } = await import('pdf-lib');
  const newPdf = await PDFDocument.create();

  // ── 3. Render each page to JPEG and embed into new PDF ──────────────────────
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    onProgress?.(Math.round(((pageNum - 1) / totalPages) * 90));

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Create an off-screen canvas
    const canvas = document.createElement('canvas');
    canvas.width  = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    // Render the PDF page onto canvas
    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    // Encode canvas as compressed JPEG
    const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
    const jpegBase64  = jpegDataUrl.split(',')[1];
    const jpegBytes   = Uint8Array.from(atob(jpegBase64), (c) => c.charCodeAt(0));

    // Embed into the new PDF and add a full-page image
    const jpegImage = await newPdf.embedJpg(jpegBytes);
    const pdfPage   = newPdf.addPage([viewport.width, viewport.height]);
    pdfPage.drawImage(jpegImage, {
      x: 0,
      y: 0,
      width:  viewport.width,
      height: viewport.height,
    });

    // Allow browser to breathe between pages
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  onProgress?.(95);
  const compressedBytes = await newPdf.save();
  onProgress?.(100);

  return compressedBytes;
}
