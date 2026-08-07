import { mmToPdfPoints } from "@/lib/units/millimeters";

export function pdfContainsSpotColor(pdf: Buffer, spotName = "CutContour"): boolean {
  const text = pdf.toString("latin1");
  return text.includes("/Separation") && text.includes(`/${spotName}`) && text.includes(" SCN");
}

export function pdfHasExpectedMediaBox(pdf: Buffer, widthMm: number, heightMm: number): boolean {
  const text = pdf.toString("latin1");
  const width = mmToPdfPoints(widthMm).toFixed(3);
  const height = mmToPdfPoints(heightMm).toFixed(3);
  return text.includes(`/MediaBox [0 0 ${width} ${height}]`);
}

export function pdfLooksVectorOnly(pdf: Buffer): boolean {
  const text = pdf.toString("latin1");
  return !/\/Subtype\s*\/Image| BI\s/i.test(text);
}
