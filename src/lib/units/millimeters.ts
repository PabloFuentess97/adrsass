export const PDF_POINTS_PER_INCH = 72;
export const MM_PER_INCH = 25.4;

export function mmToPdfPoints(mm: number): number {
  return (mm / MM_PER_INCH) * PDF_POINTS_PER_INCH;
}

export function pdfPointsToMm(points: number): number {
  return (points / PDF_POINTS_PER_INCH) * MM_PER_INCH;
}

export function roundMm(value: number, precision = 3): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function assertPositiveMm(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} debe ser un numero positivo en milimetros.`);
  }
}
