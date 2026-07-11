import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';

if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  // Use the same worker configured for the Excel converter
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * Extracts text from a PDF and constructs a DOCX Blob.
 */
export async function convertPdfToWord(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const docxParagraphs: Paragraph[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Group items into rows based on their Y coordinate
    const items = textContent.items.map((item: any) => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5],
      height: item.height || 10,
      width: item.width || 0,
    }));

    // PDF origin is bottom-left. Sort by Y descending, then X ascending.
    items.sort((a, b) => b.y - a.y || a.x - b.x);

    const rows: Array<Array<{ str: string; x: number; y: number; height: number; width: number }>> = [];
    if (items.length > 0) {
      let currentRow = [items[0]];
      const avgH = items.reduce((s, t) => s + t.height, 0) / items.length;
      // Heuristic for rows: ~50% of average character height
      const tolerance = Math.max(avgH * 0.5, 3);

      for (let j = 1; j < items.length; j++) {
        const item = items[j];
        const lastItem = currentRow[currentRow.length - 1];
        if (Math.abs(item.y - lastItem.y) <= tolerance) {
          currentRow.push(item);
        } else {
          rows.push(currentRow);
          currentRow = [item];
        }
      }
      rows.push(currentRow);
    }

    // Convert rows into docx Paragraphs
    for (const row of rows) {
      let currentStr = '';
      let lastX = -1;
      let lastWidth = 0;

      for (const item of row) {
        if (lastX !== -1) {
          const gap = item.x - (lastX + lastWidth);
          // If there's a significant gap between text items, insert a space.
          // This handles PDF text blocks being disjointed.
          if (gap > item.height * 0.2) {
            currentStr += ' ';
          }
        }
        currentStr += item.str;
        lastX = item.x;
        lastWidth = item.width;
      }

      // Add trimmed paragraph (if it's not totally empty)
      const trimmed = currentStr.trim();
      if (trimmed.length > 0) {
        docxParagraphs.push(
          new Paragraph({
            children: [new TextRun(trimmed)],
          })
        );
      } else {
        // preserve empty lines
        docxParagraphs.push(new Paragraph({ children: [new TextRun('')] }));
      }
    }

    // Add a page break after each page except the last
    if (i < numPages) {
      docxParagraphs.push(
        new Paragraph({
          pageBreakBefore: true,
        })
      );
    }

    if (onProgress) {
      onProgress(Math.round((i / numPages) * 100));
    }
  }

  // Construct Word document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docxParagraphs.length > 0 ? docxParagraphs : [new Paragraph({ children: [new TextRun('No text found in this document.')] })],
      },
    ],
  });

  // Pack the document to a Blob
  return Packer.toBlob(doc);
}
