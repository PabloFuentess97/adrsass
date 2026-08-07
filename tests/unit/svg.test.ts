import { describe, expect, it } from "vitest";
import { renderAdrSvg } from "@/lib/svg/render-adr-svg";
import { sanitizeSvg } from "@/lib/svg/sanitize-svg";
import { validateTemplate } from "@/lib/svg/validate-template";

describe("SVG", () => {
  it("sanea contenido activo", () => {
    expect(() => sanitizeSvg('<svg><script>alert(1)</script></svg>')).toThrow();
    const safe = sanitizeSvg('<svg viewBox="0 0 10 10"><rect onload="x" width="10" height="10"/></svg>');
    expect(safe.svg).not.toContain("onload");
  });

  it("renderiza texto como paths", () => {
    const svg = renderAdrSvg({
      division: "1.4",
      compatibilityGroup: "S",
      classNumber: "1",
      widthMm: 250,
      heightMm: 250,
      bleedMm: 3,
      spotName: "CutContour",
      includeCut: true,
    });
    expect(svg).toContain("<path");
    expect(svg).not.toContain("<text");
  });

  it("valida ids de plantilla", () => {
    const svg = renderAdrSvg({
      division: "1.4",
      compatibilityGroup: "S",
      classNumber: "1",
      widthMm: 100,
      heightMm: 100,
      bleedMm: 0,
      spotName: "CutContour",
      includeCut: true,
    });
    expect(validateTemplate(svg).valid).toBe(true);
  });
});
