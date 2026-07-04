import { PDFDocument } from 'pdf-lib';

/**
 * Merges two or more PDF files into a single PDF.
 * @param files   Array of PDF File objects (must be valid PDFs)
 * @param onProgress  Called after each source file is processed
 * @returns       Uint8Array of the merged PDF bytes
 */
export async function mergePdfs(
  files: File[],
  onProgress: (current: number, total: number) => void
): Promise<Uint8Array> {
  const merged = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const buffer = await files[i].arrayBuffer();
    const srcDoc = await PDFDocument.load(buffer);
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await merged.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((page) => merged.addPage(page));
    onProgress(i + 1, files.length);
    // Let the browser breathe between files
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  return merged.save();
}
