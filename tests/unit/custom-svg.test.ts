import { describe, expect, it } from "vitest";
import { renderCustomAdrSvg } from "@/lib/svg/render-custom-svg";
import { sanitizeSvg } from "@/lib/svg/sanitize-svg";

const inkscapeLikeSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="4913.3867" height="5669.2935" viewBox="0 0 4913.3867 5669.2935"><defs><color-profile xlink:href="data:application/vnd.iccprofile;base64,AAAA"/></defs><g id="g1"><path id="path1" d="M0 0H100V100H0Z" style="fill:#ed6b28;stroke:#ec008c;stroke-width:0.5"/></g></svg>`;

describe("SVG personalizado", () => {
  it("permite sanear SVG de Inkscape sin guardar ni perder estilos seguros", () => {
    const sanitized = sanitizeSvg(inkscapeLikeSvg);
    expect(sanitized.svg).toContain("style=");
    expect(sanitized.svg).not.toContain("color-profile");
    const rendered = renderCustomAdrSvg({
      sanitizedSvg: sanitized.svg,
      division: "1.1",
      compatibilityGroup: "D",
      classNumber: "1",
      widthMm: 100,
      heightMm: 100,
      bleedMm: 3,
      spotName: "CutContour",
      includeCut: true,
    });
    expect(rendered).toContain("adr-uploaded-template");
    expect(rendered).toContain("CutContour");
    expect(rendered).not.toContain("<text");
  });
});
