import { parseSvgDimensions } from "./parse-svg";
import { sanitizeSvg } from "./sanitize-svg";
import { textToPathData } from "./text-to-paths";

function getInnerSvg(svg: string): string {
  return svg
    .replace(/<\?xml[^>]*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^[\s\S]*?<svg\b[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "");
}

export function renderCustomAdrSvg(input: {
  sanitizedSvg: string;
  division: string;
  compatibilityGroup: string;
  classNumber: string;
  widthMm: number;
  heightMm: number;
  bleedMm: number;
  spotName: string;
  includeCut: boolean;
}): string {
  const clean = sanitizeSvg(input.sanitizedSvg).svg;
  const dimensions = parseSvgDimensions(clean);
  const [minX, minY, vbWidth, vbHeight] = dimensions.viewBox;
  const bleedX = (input.bleedMm / input.widthMm) * vbWidth;
  const bleedY = (input.bleedMm / input.heightMm) * vbHeight;
  const centerX = minX + vbWidth / 2;
  const divisionY = minY + vbHeight * 0.69;
  const groupY = minY + vbHeight * 0.79;
  const classY = minY + vbHeight * 0.91;
  const divisionPath = textToPathData(input.division, centerX, divisionY, vbHeight * 0.075);
  const groupPath = textToPathData(input.compatibilityGroup, centerX, groupY, vbHeight * 0.07);
  const classPath = textToPathData(input.classNumber, centerX, classY, vbHeight * 0.06);
  const cut = input.includeCut
    ? `<path id="CutContour" data-spot-name="${input.spotName}" d="M${minX} ${minY}H${minX + vbWidth}V${minY + vbHeight}H${minX}Z" fill="none" stroke="${input.spotName}" stroke-width="1" vector-effect="non-scaling-stroke"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX - bleedX} ${minY - bleedY} ${vbWidth + bleedX * 2} ${vbHeight + bleedY * 2}" width="${input.widthMm + input.bleedMm * 2}mm" height="${input.heightMm + input.bleedMm * 2}mm" role="img" aria-label="Senal ADR personalizada">
<g id="adr-uploaded-template">${getInnerSvg(clean)}</g>
<g id="adr-division"><path d="${divisionPath}" fill="#111827"/></g>
<g id="adr-compatibility"><path d="${groupPath}" fill="#111827"/></g>
<g id="adr-class-number"><path d="${classPath}" fill="#111827"/></g>
<g id="adr-cut-shape">${cut}</g>
</svg>`;
}
