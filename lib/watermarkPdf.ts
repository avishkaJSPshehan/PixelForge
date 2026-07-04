import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

/**
 * Stamps a diagonal text watermark on every page of a PDF.
 *
 * @param file     Source PDF File object
 * @param text     Watermark text (supports Sinhala and other Unicode scripts)
 * @param angle    Rotation in degrees (default 45)
 * @param hexColor Hex color string e.g. "#CC0000" (default "#CC0000")
 * @param opacity  0–1 opacity (default 0.25)
 * @returns        Uint8Array of the watermarked PDF bytes
 */
export async function watermarkPdf(
  file: File,
  text: string,
  angle = 45,
  hexColor = '#CC0000',
  opacity = 0.25,
): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer);

  // Detect whether the text contains Sinhala characters (U+0D80–U+0DFF).
  // If yes, embed a Unicode-capable font (Noto Sans Sinhala, which also
  // includes Basic Latin). If not, use the built-in Helvetica Bold (faster,
  // no network request needed).
  const hasSinhala = /[\u0D80-\u0DFF]/.test(text);

  let font;
  if (hasSinhala) {
    pdfDoc.registerFontkit(fontkit);
    // NotoSansSinhala.ttf is served from /public/fonts — same origin, no CORS.
    // It contains both Sinhala and Latin glyphs in a single file.
    const fontResponse = await fetch('/fonts/NotoSansSinhala.ttf');
    if (!fontResponse.ok) {
      throw new Error('Failed to load NotoSansSinhala.ttf from /fonts/');
    }
    const fontBytes = await fontResponse.arrayBuffer();
    font = await pdfDoc.embedFont(fontBytes);
  } else {
    font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  }

  // Convert hex → rgb (0–1 range)
  const { r, g, b } = hexToRgb(hexColor);

  // Pre-compute angle in radians once — used for the centering offset below.
  const angleRad = (angle * Math.PI) / 180;

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();

    // Font size scales with the shorter page dimension so it looks proportional.
    const fontSize = Math.max(24, Math.min(width, height) * 0.08);
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    // pdf-lib's drawText places the *start* of the text at (x, y) and then
    // rotates everything around that same point.  To make the *visual centre*
    // of the text string land at the page centre we offset the start position
    // backwards by half the text width projected along the rotation angle:
    //
    //   centre_x = x + (textWidth/2) · cos(angle)  →  x = pageW/2 - (textWidth/2)·cos(angle)
    //   centre_y = y + (textWidth/2) · sin(angle)  →  y = pageH/2 - (textWidth/2)·sin(angle)
    const x = width / 2 - (textWidth / 2) * Math.cos(angleRad);
    const y = height / 2 - (textWidth / 2) * Math.sin(angleRad);

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(r, g, b),
      opacity,
      rotate: degrees(angle),
    });
  }

  return pdfDoc.save();
}

/** Converts a CSS hex color (#RRGGBB or #RGB) to rgb components in 0–1 range */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;

  const num = parseInt(full, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}
