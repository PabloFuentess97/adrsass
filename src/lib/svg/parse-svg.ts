export interface SvgDimensions {
  viewBox: [number, number, number, number];
  widthMm: number;
  heightMm: number;
}

function parseMm(value: string | null): number | null {
  if (!value) return null;
  const match = value.trim().match(/^([0-9.]+)\s*(mm|cm)?$/i);
  if (!match) return null;
  const numeric = Number(match[1]);
  return match[2]?.toLowerCase() === "cm" ? numeric * 10 : numeric;
}

export function parseSvgDimensions(svg: string): SvgDimensions {
  const viewBoxMatch = svg.match(/\bviewBox=["']([^"']+)["']/i);
  if (!viewBoxMatch) throw new Error("La plantilla necesita viewBox.");
  const parts = viewBoxMatch[1].split(/[,\s]+/).map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part))) {
    throw new Error("viewBox no valido.");
  }
  const width = parseMm(svg.match(/\bwidth=["']([^"']+)["']/i)?.[1] ?? null);
  const height = parseMm(svg.match(/\bheight=["']([^"']+)["']/i)?.[1] ?? null);
  if (!width || !height) throw new Error("La plantilla necesita width y height fisicos en mm o cm.");
  return { viewBox: [parts[0], parts[1], parts[2], parts[3]], widthMm: width, heightMm: height };
}
