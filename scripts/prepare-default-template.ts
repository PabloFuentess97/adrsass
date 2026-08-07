import { readFileSync, writeFileSync } from "node:fs";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { sanitizeSvg } from "../src/lib/svg/sanitize-svg";

const source = process.argv[2] ?? "C:/Users/pablo/Downloads/ADR 1-1 D-1 10x10.svg";
const destination = process.argv[3] ?? "public/templates/adr/adr-default.svg";

const raw = readFileSync(source, "utf8");
const sanitized = sanitizeSvg(raw, { maxBytes: 5_242_880, maxNodes: 20_000 });
const parser = new XMLParser({ ignoreAttributes: false, preserveOrder: false, trimValues: false });
const parsed = parser.parse(sanitized.svg) as { svg: Record<string, unknown> };

parsed.svg["@_width"] = "100mm";
parsed.svg["@_height"] = "100mm";
parsed.svg["@_id"] = "adr-default-template";
parsed.svg["@_viewBox"] = "230 285 570 570";

const builder = new XMLBuilder({ ignoreAttributes: false, suppressEmptyNode: true, format: true });
writeFileSync(destination, builder.build(parsed));
console.log(`DEFAULT_TEMPLATE_READY ${destination}`);
