import { XMLParser, XMLBuilder } from "fast-xml-parser";

const allowedTags = new Set([
  "svg",
  "g",
  "path",
  "rect",
  "circle",
  "ellipse",
  "polygon",
  "polyline",
  "line",
  "defs",
  "clipPath",
  "text",
  "tspan",
  "title",
  "desc",
]);

const allowedAttrs = new Set([
  "id",
  "class",
  "xmlns",
  "viewBox",
  "width",
  "height",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "d",
  "points",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linejoin",
  "stroke-linecap",
  "stroke-miterlimit",
  "fill-rule",
  "clip-rule",
  "clip-path",
  "transform",
  "font-family",
  "font-size",
  "font-weight",
  "text-anchor",
  "dominant-baseline",
  "aria-label",
  "style",
]);

const blockedPattern = /<!ENTITY|<!DOCTYPE|<\s*(script|foreignObject|iframe|object|embed)\b|javascript:|file:/i;

export interface SanitizedSvg {
  svg: string;
  nodeCount: number;
  removed: string[];
}

function localName(name: string): string {
  return name.replace(/^.*:/, "");
}

function sanitizeNode(value: unknown, key: string, removed: string[], count: { value: number }): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeNode(item, key, removed, count)).filter(Boolean);
  }
  if (value === null || typeof value !== "object") {
    return value;
  }

  const source = value as Record<string, unknown>;
  const target: Record<string, unknown> = {};
  for (const [childKey, childValue] of Object.entries(source)) {
    if (childKey.startsWith("@_")) {
      const attr = childKey.slice(2);
      const attrValue = String(childValue);
      const isSvgNamespace = attr === "xmlns" && attrValue === "http://www.w3.org/2000/svg";
      const isNamespace = attr === "xmlns" || attr.startsWith("xmlns:");
      if (
        !allowedAttrs.has(attr) ||
        (!isNamespace && attr.toLowerCase().startsWith("on")) ||
        (!isSvgNamespace && !isNamespace && !/^url\(#[-_A-Za-z0-9]+\)$/.test(attrValue) && /url\(|javascript:|https?:\/\/|file:|@import/i.test(attrValue))
      ) {
        removed.push(`${key}.${attr}`);
        continue;
      }
      target[childKey] = childValue;
      continue;
    }

    if (childKey === "#text") {
      target[childKey] = childValue;
      continue;
    }

    const tag = localName(childKey);
    if (!allowedTags.has(tag)) {
      removed.push(tag);
      continue;
    }
    count.value += 1;
    target[childKey] = sanitizeNode(childValue, tag, removed, count);
  }
  return target;
}

export function sanitizeSvg(input: string, limits = { maxBytes: 5_242_880, maxNodes: 5000 }): SanitizedSvg {
  const bytes = new TextEncoder().encode(input).length;
  if (bytes > limits.maxBytes) throw new Error("SVG demasiado grande.");
  if (blockedPattern.test(input)) throw new Error("SVG contiene contenido remoto o activo no permitido.");

  const parser = new XMLParser({ ignoreAttributes: false, preserveOrder: false, trimValues: false });
  const parsed = parser.parse(input) as Record<string, unknown>;
  if (!parsed.svg) throw new Error("El documento no contiene un elemento svg raiz.");

  const removed: string[] = [];
  const count = { value: 1 };
  const sanitized = sanitizeNode({ svg: parsed.svg }, "svg", removed, count);
  if (count.value > limits.maxNodes) throw new Error("SVG demasiado complejo.");

  const builder = new XMLBuilder({ ignoreAttributes: false, suppressEmptyNode: true, format: false });
  const svg = builder.build(sanitized);
  return { svg, nodeCount: count.value, removed };
}
