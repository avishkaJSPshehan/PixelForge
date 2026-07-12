import { PDFDocument } from 'pdf-lib';

/**
 * Removes specified pages from a PDF and returns the new PDF Blob.
 *
 * @param file The original PDF file
 * @param pagesToRemove A set of 1-indexed page numbers to remove
 * @returns A promise that resolves to a Blob of the new PDF
 */
export async function removePagesFromPdf(
  file: File,
  pagesToRemove: Set<number>
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const originalPdf = await PDFDocument.load(arrayBuffer);
  
  const totalPages = originalPdf.getPageCount();
  
  // Determine which 0-indexed pages to keep
  const pagesToKeep = [];
  for (let i = 0; i < totalPages; i++) {
    // i + 1 because pagesToRemove uses 1-indexed page numbers
    if (!pagesToRemove.has(i + 1)) {
      pagesToKeep.push(i);
    }
  }

  // Create a new empty document
  const newPdf = await PDFDocument.create();
  
  // Copy the pages we want to keep
  if (pagesToKeep.length > 0) {
    const copiedPages = await newPdf.copyPages(originalPdf, pagesToKeep);
    for (const page of copiedPages) {
      newPdf.addPage(page);
    }
  } else {
    // If all pages are removed, just add a blank page to avoid invalid PDF
    newPdf.addPage();
  }

  return newPdf.save();
}
