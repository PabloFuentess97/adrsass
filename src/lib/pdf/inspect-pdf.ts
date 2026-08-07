import { mmToPdfPoints } from "@/lib/units/millimeters";

export function pdfContainsSpotColor(pdf: Buffer, spotName = "CutContour"): boolean {
  const text = pdf.toString("latin1");
  return text.includes("/Separation") && text.includes(`/${spotName}`) && text.includes(" SCN");
}

export function pdfHasExpectedMediaBox(pdf: Buffer, widthMm: number, heightMm: number): boolean {
  const text = pdf.toString("latin1");
  const match = text.match(/\/MediaBox\s*\[\s*0\s+0\s+([0-9.]+)\s+([0-9.]+)\s*\]/);
  if (!match) return false;
  const width = Number(match[1]);
  const height = Number(match[2]);
  return Math.abs(width - mmToPdfPoints(widthMm)) < 0.01 && Math.abs(height - mmToPdfPoints(heightMm)) < 0.01;
}

export function pdfLooksVectorOnly(pdf: Buffer): boolean {
  const text = pdf.toString("latin1");
  return !/\/Subtype\s*\/Image| BI\s/i.test(text);
}
