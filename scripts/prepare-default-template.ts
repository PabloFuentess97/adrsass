import { readFileSync, writeFileSync } from "node:fs";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { sanitizeSvg } from "../src/lib/svg/sanitize-svg";

const source = process.argv[2] ?? "C:/Users/pablo/Downloads/ADR 1-1 D-1 10x10.svg";
const destination = process.argv[3] ?? "public/templates/adr/adr-default.svg";

function collectTransformBounds(svg: string) {
  const values = [...svg.matchAll(/transform="matrix\(([^)]*)\)"/g)]
    .map((match) => match[1].split(/[,\s]+/).map(Number))
    .filter((parts) => parts.length === 6 && parts.every(Number.isFinite))
    .map((parts) => ({ tx: parts[4], ty: parts[5] }));

  if (!values.length) return null;
  const xs = values.map((item) => item.tx);
  const ys = values.map((item) => item.ty);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const size = Math.max(maxX - minX, maxY - minY) * 1.35;
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return {
    x: Math.max(0, centerX - size / 2),
    y: Math.max(0, centerY - size / 2),
    size,
  };
}

const raw = readFileSync(source, "utf8");
const sanitized = sanitizeSvg(raw, { maxBytes: 5_242_880, maxNodes: 20_000 });
const crop = collectTransformBounds(sanitized.svg);
const parser = new XMLParser({ ignoreAttributes: false, preserveOrder: false, trimValues: false });
const parsed = parser.parse(sanitized.svg) as { svg: Record<string, unknown> };

parsed.svg["@_width"] = "100mm";
parsed.svg["@_height"] = "100mm";
parsed.svg["@_id"] = "adr-default-template";
if (crop) {
  parsed.svg["@_viewBox"] = `${crop.x.toFixed(3)} ${crop.y.toFixed(3)} ${crop.size.toFixed(3)} ${crop.size.toFixed(3)}`;
}

const builder = new XMLBuilder({ ignoreAttributes: false, suppressEmptyNode: true, format: true });
writeFileSync(destination, builder.build(parsed));
console.log(`DEFAULT_TEMPLATE_READY ${destination}`);
