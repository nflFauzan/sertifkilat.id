import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import JSZip from "jszip";

export type CertificateData = {
  name: string;
  event: string;
  date: string;
  serial: string;
  verifyUrl: string;
  templateWidth?: number;
  templateHeight?: number;
};

export type TemplateField = {
  key: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
  align?: string;
};

/**
 * Loads an image from a URL and returns a Promise.
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Avoid CORS canvas taint issues
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

/**
 * Renders a certificate on an offscreen canvas and returns it.
 */
export async function generateCertificateCanvas(
  templateUrl: string,
  fields: TemplateField[],
  data: CertificateData
): Promise<HTMLCanvasElement> {
  const img = await loadImage(templateUrl);
  
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || 1122; // default A4 Landscape width
  canvas.height = img.naturalHeight || 794; // default A4 Landscape height
  
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2D context");

  // Draw background template image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Sync fonts before rendering
  if (typeof document !== "undefined" && (document as any).fonts) {
    try {
      await (document as any).fonts.ready;
    } catch (e) {
      console.warn("Fonts loading sync failed:", e);
    }
  }

  // Calculate coordinates scaling factor
  const tWidth = data.templateWidth || 1122;
  const tHeight = data.templateHeight || 794;
  const scaleX = canvas.width / tWidth;
  const scaleY = canvas.height / tHeight;

  // Draw fields
  for (const field of fields) {
    if (field.key === "qr") {
      try {
        // Generate QR code as DataURL
        const qrSize = (field.fontSize || 100) * scaleX;
        const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, {
          margin: 1,
          width: qrSize * 2, // Generate higher res QR
          errorCorrectionLevel: "H",
        });
        
        const qrImg = await loadImage(qrDataUrl);
        
        // Draw centered QR code
        const qx = (field.x * scaleX) - qrSize / 2;
        const qy = (field.y * scaleY) - qrSize / 2;
        ctx.drawImage(qrImg, qx, qy, qrSize, qrSize);
      } catch (err) {
        console.error("Failed to draw QR code:", err);
      }
    } else {
      // Draw text fields
      let text = "";
      if (field.key === "name") text = data.name;
      else if (field.key === "event") text = data.event;
      else if (field.key === "date") text = data.date;
      else if (field.key === "serial") text = data.serial;
      else continue;

      const fontSize = (field.fontSize || 24) * scaleX;
      const fontWeight = field.fontWeight || "normal";
      const fontColor = field.color || "#000000";
      const align = (field.align || "center") as CanvasTextAlign;

      ctx.save();
      ctx.font = `${fontWeight} ${fontSize}px "Plus Jakarta Sans", "Inter", sans-serif`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = align;
      ctx.textBaseline = "middle";
      ctx.fillText(text, field.x * scaleX, field.y * scaleY);
      ctx.restore();
    }
  }

  return canvas;
}

/**
 * Downloads a canvas as a PNG image.
 */
export function downloadCertificatePNG(canvas: HTMLCanvasElement, filename: string): void {
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = dataUrl;
  link.click();
}

/**
 * Downloads a canvas as a PDF document.
 */
export function downloadCertificatePDF(canvas: HTMLCanvasElement, filename: string): void {
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  
  // Set orientation based on aspect ratio
  const orientation = imgWidth >= imgHeight ? "l" : "p";
  
  // Create jsPDF instance (using points matching canvas size)
  const pdf = new jsPDF({
    orientation: orientation,
    unit: "px",
    format: [imgWidth, imgHeight],
  });

  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  pdf.addImage(dataUrl, "JPEG", 0, 0, imgWidth, imgHeight);
  pdf.save(`${filename}.pdf`);
}

/**
 * Generates and downloads a ZIP file containing all certificates (both PDF or PNG).
 */
export async function downloadCertificatesZip({
  certificates,
  templateUrl,
  fields,
  zipFilename,
  format = "pdf",
  onProgress,
}: {
  certificates: CertificateData[];
  templateUrl: string;
  fields: TemplateField[];
  zipFilename: string;
  format?: "pdf" | "png" | "both";
  onProgress?: (current: number, total: number) => void;
}): Promise<void> {
  const zip = new JSZip();
  const total = certificates.length;

  for (let i = 0; i < total; i++) {
    const cert = certificates[i];
    if (onProgress) onProgress(i + 1, total);

    try {
      const canvas = await generateCertificateCanvas(templateUrl, fields, cert);
      const safeName = cert.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const baseFilename = `${cert.serial}_${safeName}`;

      if (format === "png" || format === "both") {
        const pngDataUrl = canvas.toDataURL("image/png");
        const pngBase64 = pngDataUrl.split(",")[1];
        zip.file(`${baseFilename}.png`, pngBase64, { base64: true });
      }

      if (format === "pdf" || format === "both") {
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const orientation = imgWidth >= imgHeight ? "l" : "p";
        const pdf = new jsPDF({
          orientation: orientation,
          unit: "px",
          format: [imgWidth, imgHeight],
        });
        const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(jpegDataUrl, "JPEG", 0, 0, imgWidth, imgHeight);
        
        // Add PDF to ZIP
        const pdfArray = pdf.output("arraybuffer");
        zip.file(`${baseFilename}.pdf`, pdfArray);
      }
    } catch (err) {
      console.error(`Failed to generate ZIP item for ${cert.name}:`, err);
    }
  }

  const content = await zip.generateAsync({
    type: "blob",
    mimeType: "application/zip",
    platform: "DOS",
    compression: "DEFLATE",
    compressionOptions: {
      level: 9,
    },
  });
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${zipFilename}.zip`;
  link.click();
  
  // Clean up URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
