export function buildAdrFilename(input: {
  division: string;
  compatibilityGroup: string;
  widthMm: number;
  heightMm: number;
  quantity: number;
  extension: "svg" | "pdf";
  proof?: boolean;
}): string {
  const suffix = input.proof ? "prueba" : input.extension === "svg" ? "editable" : "produccion";
  const safeGroup = input.compatibilityGroup.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const safeDivision = input.division.replace(/[^0-9.]/g, "");
  return `ADR-${safeDivision}-${safeGroup}-${input.widthMm}x${input.heightMm}mm-${input.quantity}uds-${suffix}.${input.extension}`;
}
