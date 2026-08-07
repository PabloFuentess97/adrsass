import { textToPathData } from "./text-to-paths";

export interface RenderAdrSvgInput {
  division: string;
  compatibilityGroup: string;
  classNumber: string;
  widthMm: number;
  heightMm: number;
  bleedMm: number;
  spotName: string;
  includeCut: boolean;
}

export function renderAdrSvg(input: RenderAdrSvgInput): string {
  const view = 1000;
  const bleedUnits = (input.bleedMm / input.widthMm) * view;
  const outer = -bleedUnits;
  const full = view + bleedUnits * 2;
  const divisionPath = textToPathData(input.division, 500, 688, 122);
  const groupPath = textToPathData(input.compatibilityGroup, 500, 805, 112);
  const classPath = textToPathData(input.classNumber, 500, 928, 96);
  const cut = input.includeCut
    ? `<path id="CutContour" data-spot-name="${input.spotName}" d="M0 0H1000V1000H0Z" fill="none" stroke="${input.spotName}" stroke-width="1" vector-effect="non-scaling-stroke"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${outer} ${outer} ${full} ${full}" width="${input.widthMm + input.bleedMm * 2}mm" height="${input.heightMm + input.bleedMm * 2}mm" role="img" aria-label="Senal ADR clase 1">
<g id="adr-background"><rect x="${outer}" y="${outer}" width="${full}" height="${full}" fill="#f47b20"/></g>
<g id="adr-border"><rect x="22" y="22" width="956" height="956" fill="none" stroke="#111827" stroke-width="32"/></g>
<g id="adr-symbol" fill="#111827">
<path d="M500 95 546 237 696 237 575 325 621 467 500 379 379 467 425 325 304 237 454 237Z"/>
<path d="M238 225 322 282 250 326 386 360 310 430 455 392 432 550 500 410 568 550 545 392 690 430 614 360 750 326 678 282 762 225 620 246 610 120 548 232 500 130 452 232 390 120 380 246Z"/>
</g>
<g id="adr-division"><path d="${divisionPath}" fill="#111827"/></g>
<g id="adr-compatibility"><path d="${groupPath}" fill="#111827"/></g>
<g id="adr-class-number"><path d="${classPath}" fill="#111827"/></g>
<g id="adr-safe-area"><rect x="70" y="70" width="860" height="860" fill="none" stroke="#2563eb" stroke-width="6" stroke-dasharray="18 14" opacity=".35"/></g>
<g id="adr-cut-shape">${cut}</g>
</svg>`;
}
