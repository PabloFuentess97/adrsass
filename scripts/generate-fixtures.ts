import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { createProductionPdf } from "../src/lib/pdf/create-production-pdf";
import { renderCustomAdrSvg } from "../src/lib/svg/render-custom-svg";

async function main() {
  const fixturesDir = join(process.cwd(), "tests", "fixtures");
  mkdirSync(fixturesDir, { recursive: true });

  const template = readFileSync(join(process.cwd(), "public", "templates", "adr", "adr-default.svg"), "utf8");
  const svg = renderCustomAdrSvg({
    sanitizedSvg: template,
    division: "1.4",
    compatibilityGroup: "S",
    classNumber: "1",
    widthMm: 100,
    heightMm: 100,
    bleedMm: 0,
    spotName: "CutContour",
    includeCut: false,
  });

  writeFileSync(
    join(fixturesDir, "adr-100x100-cutcontour.pdf"),
    await createProductionPdf({
      widthMm: 100,
      heightMm: 100,
      spotName: "CutContour",
      title: "ADR 100x100 CutContour fixture",
      svg,
    }),
  );

  writeFileSync(join(fixturesDir, "adr-100x100-demo.svg"), svg);

  console.log("FIXTURES_GENERATED");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
