import { mmToPdfPoints } from "@/lib/units/millimeters";

export interface ProductionPdfInput {
  widthMm: number;
  heightMm: number;
  spotName: string;
  proof?: boolean;
  title?: string;
  pieces?: Array<{ xMm: number; yMm: number; widthMm: number; heightMm: number; bleedMm: number }>;
}

function escPdf(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function pdfName(value: string): string {
  return value.replace(/[^A-Za-z0-9_.-]/g, "");
}

export function createProductionPdf(input: ProductionPdfInput): Buffer {
  const widthPt = mmToPdfPoints(input.widthMm);
  const heightPt = mmToPdfPoints(input.heightMm);
  const pieces = input.pieces?.length ? input.pieces : [{ xMm: 0, yMm: 0, widthMm: input.widthMm, heightMm: input.heightMm, bleedMm: 0 }];
  const spotResource = pdfName(input.spotName || "CutContour");
  const content: string[] = ["q"];

  for (const piece of pieces) {
    const x = mmToPdfPoints(piece.xMm);
    const y = heightPt - mmToPdfPoints(piece.yMm + piece.heightMm + piece.bleedMm * 2);
    const w = mmToPdfPoints(piece.widthMm + piece.bleedMm * 2);
    const h = mmToPdfPoints(piece.heightMm + piece.bleedMm * 2);
    const cutX = mmToPdfPoints(piece.xMm + piece.bleedMm);
    const cutY = heightPt - mmToPdfPoints(piece.yMm + piece.bleedMm + piece.heightMm);
    const cutW = mmToPdfPoints(piece.widthMm);
    const cutH = mmToPdfPoints(piece.heightMm);

    content.push("0.956 0.482 0.125 rg");
    content.push(`${x.toFixed(3)} ${y.toFixed(3)} ${w.toFixed(3)} ${h.toFixed(3)} re f`);
    content.push("0.067 0.094 0.153 RG 9 w");
    content.push(`${cutX.toFixed(3)} ${cutY.toFixed(3)} ${cutW.toFixed(3)} ${cutH.toFixed(3)} re S`);
    content.push("0.067 0.094 0.153 rg");
    content.push(`${(cutX + cutW * 0.42).toFixed(3)} ${(cutY + cutH * 0.56).toFixed(3)} m ${(cutX + cutW * 0.5).toFixed(3)} ${(cutY + cutH * 0.76).toFixed(3)} l ${(cutX + cutW * 0.58).toFixed(3)} ${(cutY + cutH * 0.56).toFixed(3)} l h f`);

    if (!input.proof) {
      content.push(`/${spotResource} CS`);
      content.push("1 SCN");
      content.push("0.35 w");
      content.push(`${cutX.toFixed(3)} ${cutY.toFixed(3)} ${cutW.toFixed(3)} ${cutH.toFixed(3)} re S`);
    } else {
      content.push("0.85 0 0.85 RG 0.35 w");
      content.push(`${cutX.toFixed(3)} ${cutY.toFixed(3)} ${cutW.toFixed(3)} ${cutH.toFixed(3)} re S`);
    }
  }
  content.push("Q");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt.toFixed(3)} ${heightPt.toFixed(3)}] /Resources << /ColorSpace << /${spotResource} 5 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${content.join("\n").length} >>\nstream\n${content.join("\n")}\nendstream`,
    `[/Separation /${spotResource} /DeviceCMYK << /FunctionType 2 /Domain [0 1] /C0 [0 0 0 0] /C1 [0 1 0 0] /N 1 >>]`,
    `<< /Title (${escPdf(input.title ?? "ADR CutContour")}) /Producer (ADR Generator) >>`,
  ];

  let pdf = "%PDF-1.6\n%\u00e2\u00e3\u00cf\u00d3\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "binary"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "binary");
}
