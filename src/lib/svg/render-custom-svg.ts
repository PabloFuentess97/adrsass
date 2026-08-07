import { parseSvgDimensions } from "./parse-svg";
import { sanitizeSvg } from "./sanitize-svg";
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
  const topX = minX + vbWidth / 2;
  const topY = minY;
  const rightX = minX + vbWidth;
  const rightY = minY + vbHeight / 2;
  const bottomX = topX;
  const bottomY = minY + vbHeight;
  const leftX = minX;
  const leftY = rightY;
  const diamondPath = `M${topX} ${topY}L${rightX} ${rightY}L${bottomX} ${bottomY}L${leftX} ${leftY}Z`;
  const divisionY = minY + vbHeight * 0.655;
  const groupY = minY + vbHeight * 0.745;
  const classY = minY + vbHeight * 0.84;
  const cut = input.includeCut
    ? `<path id="CutContour" data-spot-name="${input.spotName}" d="${diamondPath}" fill="none" stroke="${input.spotName}" stroke-width="1" vector-effect="non-scaling-stroke"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX - bleedX} ${minY - bleedY} ${vbWidth + bleedX * 2} ${vbHeight + bleedY * 2}" width="${input.widthMm + input.bleedMm * 2}mm" height="${input.heightMm + input.bleedMm * 2}mm" role="img" aria-label="Senal ADR personalizada">
<g id="adr-uploaded-template">${getInnerSvg(clean)}</g>
<g id="adr-editable-text" fill="#111827" font-family="Noto Sans ADR, Noto Sans, Arial, Helvetica, sans-serif" font-weight="800" text-anchor="middle">
<text id="adr-division" x="${centerX}" y="${divisionY}" font-size="${vbHeight * 0.092}" dominant-baseline="middle">${input.division}</text>
<text id="adr-compatibility" x="${centerX}" y="${groupY}" font-size="${vbHeight * 0.088}" dominant-baseline="middle">${input.compatibilityGroup}</text>
<text id="adr-class-number" x="${centerX}" y="${classY}" font-size="${vbHeight * 0.078}" dominant-baseline="middle">${input.classNumber}</text>
</g>
<g id="adr-cut-shape">${cut}</g>
</svg>`;
}
