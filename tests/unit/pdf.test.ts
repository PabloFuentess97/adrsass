import { describe, expect, it } from "vitest";
import { createProductionPdf } from "@/lib/pdf/create-production-pdf";
import { pdfContainsSpotColor, pdfHasExpectedMediaBox, pdfLooksVectorOnly } from "@/lib/pdf/inspect-pdf";

describe("PDF CutContour", () => {
  it("crea separacion nombrada y media box exacto", async () => {
    const pdf = await createProductionPdf({ widthMm: 100, heightMm: 100, spotName: "CutContour", svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 0L100 50L50 100L0 50Z" fill="#ed6b28"/></svg>' });
    expect(pdfContainsSpotColor(pdf)).toBe(true);
    expect(pdfHasExpectedMediaBox(pdf, 100, 100)).toBe(true);
    expect(pdfLooksVectorOnly(pdf)).toBe(true);
  });
});
