import { describe, expect, it } from "vitest";
import { createProductionPdf } from "@/lib/pdf/create-production-pdf";
import { pdfContainsSpotColor, pdfHasExpectedMediaBox, pdfLooksVectorOnly } from "@/lib/pdf/inspect-pdf";

describe("PDF CutContour", () => {
  it("crea separacion nombrada y media box exacto", () => {
    const pdf = createProductionPdf({ widthMm: 100, heightMm: 100, spotName: "CutContour" });
    expect(pdfContainsSpotColor(pdf)).toBe(true);
    expect(pdfHasExpectedMediaBox(pdf, 100, 100)).toBe(true);
    expect(pdfLooksVectorOnly(pdf)).toBe(true);
  });
});
