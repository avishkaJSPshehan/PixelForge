/**
 * lib/pdfToExcel.ts
 *
 * Extracts text from every page of a PDF using pdfjs-dist, groups the items
 * into rows & columns using Y/X coordinate heuristics, then builds an Excel
 * workbook (one sheet per PDF page) via SheetJS and returns it as a Blob.
 *
 * All processing is done entirely in the browser — files never leave the device.
 */

export interface PageSheet {
  /** PDF page number (1-indexed) */
  page: number;
  /** 2-D array of strings — rows × columns */
  rows: string[][];
}

/**
 * Groups flat text items (each with x, y, text) into a 2-D table.
 *
 * Algorithm:
 *  1. Sort items top-to-bottom, then left-to-right within each row.
 *  2. Cluster into rows by Y-coordinate proximity (tolerance = fontHeight * 0.55).
 *  3. Within each row, sort by X and return as column values.
 */
function groupIntoRows(
  items: { x: number; y: number; str: string; height: number }[],
): string[][] {
  if (items.length === 0) return [];

  // Sort by descending Y (PDF origin is bottom-left), then ascending X
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);

  const rows: Array<Array<{ x: number; y: number; str: string; height: number }>> = [];
  let currentRow: Array<{ x: number; y: number; str: string; height: number }> = [sorted[0]];
  const avgH = sorted.reduce((s, t) => s + (t.height || 10), 0) / sorted.length;
  const tolerance = Math.max(avgH * 0.55, 3);

  for (let i = 1; i < sorted.length; i++) {
    const prev = currentRow[currentRow.length - 1];
    if (Math.abs(sorted[i].y - prev.y) <= tolerance) {
      currentRow.push(sorted[i]);
    } else {
      rows.push(currentRow);
      currentRow = [sorted[i]];
    }
  }
  rows.push(currentRow);

  // For each row, sort by X and map to strings
  return rows.map((row) =>
    row.sort((a, b) => a.x - b.x).map((t) => t.str.trim()),
  );
}

/**
 * Main export — converts a PDF File into an Excel Blob.
 * Calls `onProgress(currentPage, totalPages)` as each page is processed.
 */
export async function pdfToExcel(
  file: File,
  onProgress?: (current: number, total: number) => void,
): Promise<{ sheets: PageSheet[]; blob: Blob }> {
  // ── 1. Load pdfjs ─────────────────────────────────────────────────────────
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  const sheets: PageSheet[] = [];

  // ── 2. Extract text per page ───────────────────────────────────────────────
  for (let p = 1; p <= totalPages; p++) {
    onProgress?.(p, totalPages);
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();

    const items = content.items
      .filter((it): it is import('pdfjs-dist/types/src/display/api').TextItem =>
        'str' in it && typeof it.str === 'string',
      )
      .map((it) => ({
        str:    it.str,
        x:      it.transform[4],       // tx component of the 6-element matrix
        y:      it.transform[5],       // ty component
        height: Math.abs(it.transform[3]) || 10,
      }))
      .filter((it) => it.str.trim() !== '');

    const rows = groupIntoRows(items);
    sheets.push({ page: p, rows });
  }

  // ── 3. Build Excel workbook ────────────────────────────────────────────────
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ page, rows }) => {
    if (rows.length === 0) {
      // Empty page — add a placeholder row
      const ws = XLSX.utils.aoa_to_sheet([['(no text found on this page)']]);
      XLSX.utils.book_append_sheet(wb, ws, `Page ${page}`);
      return;
    }

    // Pad rows to equal length for a proper rectangular sheet
    const maxCols = Math.max(...rows.map((r) => r.length));
    const padded  = rows.map((r) => {
      const copy = [...r];
      while (copy.length < maxCols) copy.push('');
      return copy;
    });

    const ws = XLSX.utils.aoa_to_sheet(padded);

    // Auto column widths (capped at 60 chars)
    const colWidths = Array.from({ length: maxCols }, (_, ci) => ({
      wch: Math.min(
        60,
        Math.max(8, ...padded.map((r) => (r[ci] ?? '').length)),
      ),
    }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, `Page ${page}`);
  });

  // ── 4. Write to Blob ───────────────────────────────────────────────────────
  const xlsxArrayBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const blob = new Blob([xlsxArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  return { sheets, blob };
}
