import { readFileSync, writeFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import { renderCustomAdrSvg } from "../src/lib/svg/render-custom-svg";

const template = readFileSync("public/templates/adr/adr-default.svg", "utf8");
const svg = renderCustomAdrSvg({
  sanitizedSvg: template,
  division: "1.4",
  compatibilityGroup: "S",
  classNumber: "1",
  widthMm: 100,
  heightMm: 100,
  bleedMm: 3,
  spotName: "CutContour",
  includeCut: true,
});

writeFileSync("tests/fixtures/default-template-composed.svg", svg);
writeFileSync("tests/fixtures/default-template-preview.png", new Resvg(svg, { fitTo: { mode: "width", value: 700 } }).render().asPng());
console.log("PREVIEW_READY");
