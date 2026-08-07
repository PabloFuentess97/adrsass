import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createProductionPdf } from "../src/lib/pdf/create-production-pdf";
import { renderAdrSvg } from "../src/lib/svg/render-adr-svg";

const fixturesDir = join(process.cwd(), "tests", "fixtures");
mkdirSync(fixturesDir, { recursive: true });

writeFileSync(
  join(fixturesDir, "adr-100x100-cutcontour.pdf"),
  createProductionPdf({
    widthMm: 100,
    heightMm: 100,
    spotName: "CutContour",
    title: "ADR 100x100 CutContour fixture",
  }),
);

writeFileSync(
  join(fixturesDir, "adr-100x100-demo.svg"),
  renderAdrSvg({
    division: "1.4",
    compatibilityGroup: "S",
    classNumber: "1",
    widthMm: 100,
    heightMm: 100,
    bleedMm: 3,
    spotName: "CutContour",
    includeCut: true,
  }),
);

console.log("FIXTURES_GENERATED");
