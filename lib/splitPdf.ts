import { PDFDocument } from 'pdf-lib';

/**
 * Extracts a range of pages from a PDF file and returns a new PDF.
 * @param file       Source PDF File object
 * @param fromPage   First page to include (1-indexed)
 * @param toPage     Last page to include (1-indexed, inclusive)
 * @returns          Uint8Array of the extracted PDF bytes
 */
export async function splitPdf(
  file: File,
  fromPage: number,
  toPage: number
): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(buffer);
  const totalPages = srcDoc.getPageCount();

  // Clamp to valid range
  const start = Math.max(1, Math.min(fromPage, totalPages));
  const end = Math.max(start, Math.min(toPage, totalPages));

  // Build 0-indexed array of pages to copy
  const indices: number[] = [];
  for (let i = start - 1; i <= end - 1; i++) {
    indices.push(i);
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, indices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  return newDoc.save();
}
