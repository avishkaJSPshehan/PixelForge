/**
 * lib/protectPdf.ts
 *
 * Adds password encryption to a PDF using pdf-lib-plus-encrypt.
 * The resulting PDF requires the password to open in any PDF viewer.
 *
 * All processing happens entirely in the browser — files never leave the device.
 */

/**
 * Encrypts a PDF with the provided user password.
 *
 * @param file          Source PDF File object
 * @param userPassword  Password required to open the PDF
 * @returns             Encrypted PDF as Uint8Array
 */
export async function protectPdf(
  file: File,
  userPassword: string,
): Promise<Uint8Array> {
  // Dynamically import to avoid SSR issues
  const { PDFDocument } = await import('pdf-lib-plus-encrypt');

  const arrayBuffer = await file.arrayBuffer();

  // Load the existing PDF
  const pdfDoc = await PDFDocument.load(arrayBuffer, {
    ignoreEncryption: true,
  });

  // Apply password encryption
  await pdfDoc.encrypt({
    userPassword,
    ownerPassword: userPassword + '_owner',
    permissions: {
      printing: 'highResolution',
      modifying: false,
      copying: false,
      annotating: true,
      fillingForms: true,
      contentAccessibility: true,
      documentAssembly: false,
    },
  });

  return pdfDoc.save();
}

