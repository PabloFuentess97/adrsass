import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { calculateMaterialUsage } from "@/lib/layout/calculate-grid";
import { createProductionPdf } from "@/lib/pdf/create-production-pdf";
import { pdfContainsSpotColor, pdfLooksVectorOnly } from "@/lib/pdf/inspect-pdf";
import { renderCustomAdrSvg } from "@/lib/svg/render-custom-svg";

describe("PDF de produccion con plantilla ADR real", () => {
  it("incluye el SVG real vectorial y CutContour para 20 copias", async () => {
    const template = readFileSync("public/templates/adr/adr-default.svg", "utf8");
    const svg = renderCustomAdrSvg({
      sanitizedSvg: template,
      division: "1.1",
      compatibilityGroup: "S",
      classNumber: "1",
      widthMm: 100,
      heightMm: 100,
      bleedMm: 3,
      spotName: "CutContour",
      includeCut: true,
    });
    const usage = calculateMaterialUsage({
      rollWidthMm: 1370,
      leftMarginMm: 20,
      rightMarginMm: 20,
      pieceWidthMm: 100,
      pieceHeightMm: 100,
      bleedMm: 3,
      horizontalGapMm: 10,
      verticalGapMm: 10,
      quantity: 20,
      mode: "automatic",
    });
    const pieces = Array.from({ length: 20 }).map((_, index) => {
      const col = index % usage.copiesPerRow;
      const row = Math.floor(index / usage.copiesPerRow);
      return {
        xMm: 20 + col * (usage.printablePieceWidthMm + 10),
        yMm: row * (usage.printablePieceHeightMm + 10),
        widthMm: 100,
        heightMm: 100,
        bleedMm: 3,
      };
    });
    const pdf = await createProductionPdf({
      widthMm: 1370,
      heightMm: usage.totalLengthMm,
      spotName: "CutContour",
      pieces,
      svg,
    });
    const text = pdf.toString("latin1");
    expect(pdf.length).toBeGreaterThan(100_000);
    expect(text).toMatch(/0\.9294117647058824\s+0\.4196078431372549\s+0\.1568627450980392\s+scn/);
    expect(pdfContainsSpotColor(pdf)).toBe(true);
    expect(pdfLooksVectorOnly(pdf)).toBe(true);
  });
});
