import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import { mmToPdfPoints } from "@/lib/units/millimeters";

export interface ProductionPdfInput {
  widthMm: number;
  heightMm: number;
  spotName: string;
  proof?: boolean;
  title?: string;
  pieces?: Array<{ xMm: number; yMm: number; widthMm: number; heightMm: number; bleedMm: number }>;
  svg?: string;
}

function collectPdf(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function drawCutContour(
  doc: PDFKit.PDFDocument,
  piece: { xMm: number; yMm: number; widthMm: number; heightMm: number; bleedMm: number },
  spotName: string,
) {
  const x = mmToPdfPoints(piece.xMm + piece.bleedMm);
  const y = mmToPdfPoints(piece.yMm + piece.bleedMm);
  const w = mmToPdfPoints(piece.widthMm);
  const h = mmToPdfPoints(piece.heightMm);
  const cx = x + w / 2;
  const cy = y + h / 2;
  doc
    .save()
    .strokeColor(spotName)
    .lineWidth(0.35)
    .moveTo(cx, y)
    .lineTo(x + w, cy)
    .lineTo(cx, y + h)
    .lineTo(x, cy)
    .closePath()
    .stroke()
    .restore();
}

export async function createProductionPdf(input: ProductionPdfInput): Promise<Buffer> {
  const widthPt = mmToPdfPoints(input.widthMm);
  const heightPt = mmToPdfPoints(input.heightMm);
  const pieces = input.pieces?.length ? input.pieces : [{ xMm: 0, yMm: 0, widthMm: input.widthMm, heightMm: input.heightMm, bleedMm: 0 }];
  const doc = new PDFDocument({
    size: [widthPt, heightPt],
    margin: 0,
    compress: false,
    info: {
      Title: input.title ?? "ADR CutContour",
      Producer: "ADR Generator",
    },
  });
  const done = collectPdf(doc);
  (doc as PDFKit.PDFDocument & { addSpotColor: (name: string, c: number, m: number, y: number, k: number) => PDFKit.PDFDocument }).addSpotColor(
    input.spotName || "CutContour",
    0,
    1,
    0,
    0,
  );

  const svg = input.svg;
  for (const piece of pieces) {
    const x = mmToPdfPoints(piece.xMm);
    const y = mmToPdfPoints(piece.yMm);
    const w = mmToPdfPoints(piece.widthMm + piece.bleedMm * 2);
    const h = mmToPdfPoints(piece.heightMm + piece.bleedMm * 2);
    if (svg) {
      SVGtoPDF(doc, svg, x, y, {
        width: w,
        height: h,
        preserveAspectRatio: "xMidYMid meet",
        assumePt: false,
        fontCallback: (_family, bold) => (bold ? "Helvetica-Bold" : "Helvetica"),
      });
    }
    if (!input.proof) {
      drawCutContour(doc, piece, input.spotName || "CutContour");
    } else {
      doc
        .save()
        .strokeColor("#d946ef")
        .lineWidth(0.35)
        .rect(mmToPdfPoints(piece.xMm + piece.bleedMm), mmToPdfPoints(piece.yMm + piece.bleedMm), mmToPdfPoints(piece.widthMm), mmToPdfPoints(piece.heightMm))
        .stroke()
        .restore();
    }
  }
  doc.end();
  return done;
}
