import { PDFDocument } from 'pdf-lib';

/**
 * Convert a WebP/other format File to PNG via canvas (pdf-lib doesn't support WebP natively)
 */
async function toPngDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = url;
  });
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}

export async function imagesToPdf(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<Uint8Array<ArrayBuffer>> {
  const doc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
    const isPng = file.type === 'image/png';

    let imgBytes: Uint8Array;
    let embedded;

    if (isJpeg) {
      imgBytes = new Uint8Array(await file.arrayBuffer());
      embedded = await doc.embedJpg(imgBytes);
    } else if (isPng) {
      imgBytes = new Uint8Array(await file.arrayBuffer());
      embedded = await doc.embedPng(imgBytes);
    } else {
      // Convert WebP/BMP/etc. to PNG via canvas
      const pngDataUrl = await toPngDataUrl(file);
      imgBytes = dataUrlToUint8Array(pngDataUrl);
      embedded = await doc.embedPng(imgBytes);
    }

    const { width, height } = embedded;
    // Fit to A4 if image is very large, otherwise use natural size
    const maxW = 595;
    const maxH = 842;
    let w = width;
    let h = height;
    const scale = Math.min(maxW / w, maxH / h, 1);
    w = w * scale;
    h = h * scale;

    const page = doc.addPage([w, h]);
    page.drawImage(embedded, { x: 0, y: 0, width: w, height: h });

    onProgress?.(i + 1, files.length);
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  return doc.save() as unknown as Uint8Array<ArrayBuffer>;
}
