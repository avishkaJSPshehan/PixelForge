import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type PageNumberPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface AddPageNumbersOptions {
  /** Position of the number on each page */
  position: PageNumberPosition;
  /** Number to start counting from (default 1) */
  startNumber?: number;
  /** First page index to number (1-based, inclusive, default 1) */
  fromPage?: number;
  /** Last page index to number (1-based, inclusive, default = total pages) */
  toPage?: number;
  /** Font size in pt (default 11) */
  fontSize?: number;
  /** Hex color string e.g. "#111111" */
  color?: string;
  /** Margin from page edge in pt (default 28) */
  margin?: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean;
  const num = parseInt(full, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

/**
 * Stamps page numbers onto the specified pages of a PDF.
 * All processing happens in the browser — no file is uploaded to any server.
 *
 * @returns Uint8Array of the modified PDF bytes
 */
export async function addPageNumbers(
  file: File,
  opts: AddPageNumbersOptions,
): Promise<Uint8Array> {
  const {
    position = 'bottom-center',
    startNumber = 1,
    fromPage = 1,
    fontSize = 11,
    color = '#111111',
    margin = 28,
  } = opts;

  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer);
  const pages = pdfDoc.getPages();
  const toPage = opts.toPage ?? pages.length;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { r, g, b } = hexToRgb(color);

  for (let i = 0; i < pages.length; i++) {
    const pageIndex = i + 1; // 1-based
    if (pageIndex < fromPage || pageIndex > toPage) continue;

    const page = pages[i];
    const { width, height } = page.getSize();
    const pageNumber = startNumber + (pageIndex - fromPage);
    const label = String(pageNumber);
    const textWidth = font.widthOfTextAtSize(label, fontSize);

    let x: number;
    let y: number;

    // ── Horizontal position ──
    if (position.endsWith('left')) {
      x = margin;
    } else if (position.endsWith('right')) {
      x = width - margin - textWidth;
    } else {
      // center
      x = (width - textWidth) / 2;
    }

    // ── Vertical position ──
    if (position.startsWith('top')) {
      y = height - margin - fontSize;
    } else {
      y = margin;
    }

    page.drawText(label, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(r, g, b),
      opacity: 1,
    });
  }

  return pdfDoc.save();
}
