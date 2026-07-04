
export interface ConversionResult {
  dataUrl: string;
  pageNumber: number;
}

export async function pdfToImages(
  file: File,
  onProgress: (current: number, total: number) => void,
  scale = 2
): Promise<ConversionResult[]> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const results: ConversionResult[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL('image/png');
    results.push({ dataUrl, pageNumber: pageNum });
    onProgress(pageNum, totalPages);

    // Allow the browser to breathe between pages
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  return results;
}
