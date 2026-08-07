import { describe, expect, it } from "vitest";
import { calculateCopiesPerRow, calculateMaterialUsage, calculateSafeWidth } from "@/lib/layout/calculate-grid";

describe("imposicion en bobina", () => {
  it("calcula ancho seguro", () => {
    expect(calculateSafeWidth(1370, 20, 20)).toBe(1330);
  });

  it("optimiza el caso requerido 1370/250/3/10", () => {
    const usage = calculateMaterialUsage({
      rollWidthMm: 1370,
      leftMarginMm: 20,
      rightMarginMm: 20,
      pieceWidthMm: 250,
      pieceHeightMm: 250,
      bleedMm: 3,
      horizontalGapMm: 10,
      verticalGapMm: 10,
      quantity: 20,
      mode: "automatic",
    });
    expect(usage.copiesPerRow).toBe(5);
    expect(usage.occupiedWidthMm).toBe(1320);
  });

  it("rechaza ancho igual al rollo", () => {
    const usage = calculateMaterialUsage({
      rollWidthMm: 1370,
      leftMarginMm: 20,
      rightMarginMm: 20,
      pieceWidthMm: 1370,
      pieceHeightMm: 100,
      bleedMm: 0,
      horizontalGapMm: 10,
      verticalGapMm: 10,
      quantity: 1,
      mode: "automatic",
    });
    expect(usage.exportAllowed).toBe(false);
  });

  it("calcula copias manuales invalidas", () => {
    expect(calculateCopiesPerRow({ safeWidthMm: 1330, pieceWidthMm: 256, horizontalGapMm: 10 })).toBe(5);
    const usage = calculateMaterialUsage({
      rollWidthMm: 1370,
      leftMarginMm: 20,
      rightMarginMm: 20,
      pieceWidthMm: 250,
      pieceHeightMm: 250,
      bleedMm: 3,
      horizontalGapMm: 10,
      verticalGapMm: 10,
      quantity: 20,
      mode: "manual",
      manualCopiesPerRow: 6,
    });
    expect(usage.exportAllowed).toBe(false);
  });
});
