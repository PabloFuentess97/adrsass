declare module "svg-to-pdfkit" {
  import type PDFDocument from "pdfkit";

  export default function SVGtoPDF(
    doc: PDFKit.PDFDocument,
    svg: string,
    x: number,
    y: number,
    options?: {
      width?: number;
      height?: number;
      preserveAspectRatio?: string;
      assumePt?: boolean;
    },
  ): PDFDocument;
}
