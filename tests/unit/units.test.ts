import { describe, expect, it } from "vitest";
import { mmToPdfPoints, pdfPointsToMm } from "@/lib/units/millimeters";

describe("unidades", () => {
  it("convierte mm a puntos PDF y vuelta", () => {
    expect(mmToPdfPoints(25.4)).toBeCloseTo(72, 5);
    expect(pdfPointsToMm(72)).toBeCloseTo(25.4, 5);
  });
});
