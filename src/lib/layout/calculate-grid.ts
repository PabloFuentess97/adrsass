import { roundMm } from "@/lib/units/millimeters";
import type { MaterialUsage, RollLayoutInput } from "./types";

export const MIN_PRINT_CUT_MARGIN_MM = 10;

export function calculateSafeWidth(rollWidthMm: number, leftMarginMm: number, rightMarginMm: number): number {
  if (leftMarginMm < MIN_PRINT_CUT_MARGIN_MM || rightMarginMm < MIN_PRINT_CUT_MARGIN_MM) {
    throw new Error("Los margenes laterales minimos para Print & Cut son 10 mm.");
  }
  return roundMm(rollWidthMm - leftMarginMm - rightMarginMm);
}

export function calculateOccupiedWidth(copiesPerRow: number, pieceWidthMm: number, gapMm: number): number {
  if (copiesPerRow <= 0) return 0;
  return roundMm(copiesPerRow * pieceWidthMm + (copiesPerRow - 1) * gapMm);
}

export function calculateCopiesPerRow(input: {
  safeWidthMm: number;
  pieceWidthMm: number;
  horizontalGapMm: number;
}): number {
  if (input.pieceWidthMm > input.safeWidthMm) return 0;
  return Math.floor((input.safeWidthMm + input.horizontalGapMm) / (input.pieceWidthMm + input.horizontalGapMm));
}

export function calculateMaterialUsage(input: RollLayoutInput): MaterialUsage {
  const errors: string[] = [];
  const printablePieceWidthMm = input.pieceWidthMm + input.bleedMm * 2;
  const printablePieceHeightMm = input.pieceHeightMm + input.bleedMm * 2;
  let safeWidthMm = 0;

  try {
    safeWidthMm = calculateSafeWidth(input.rollWidthMm, input.leftMarginMm, input.rightMarginMm);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Margenes invalidos.");
  }

  if (printablePieceWidthMm >= input.rollWidthMm) {
    errors.push("El documento iguala o supera el ancho fisico de la bobina.");
  }

  const automaticCopiesPerRow = calculateCopiesPerRow({
    safeWidthMm,
    pieceWidthMm: printablePieceWidthMm,
    horizontalGapMm: input.horizontalGapMm,
  });

  const requestedManual = input.manualCopiesPerRow ?? automaticCopiesPerRow;
  const copiesPerRow = input.mode === "manual" ? requestedManual : automaticCopiesPerRow;
  const occupiedWidthMm = calculateOccupiedWidth(copiesPerRow, printablePieceWidthMm, input.horizontalGapMm);

  if (automaticCopiesPerRow < 1) {
    errors.push("La pieza con sangrado no cabe dentro del ancho seguro.");
  }
  if (input.mode === "manual" && requestedManual > automaticCopiesPerRow) {
    errors.push(`Demasiadas copias por fila. Maximo permitido: ${automaticCopiesPerRow}.`);
  }
  if (occupiedWidthMm > safeWidthMm) {
    errors.push("El ancho ocupado supera el ancho seguro de la bobina.");
  }

  const rows = copiesPerRow > 0 ? Math.ceil(input.quantity / copiesPerRow) : 0;
  const totalLengthMm = rows > 0 ? rows * printablePieceHeightMm + Math.max(0, rows - 1) * input.verticalGapMm : 0;
  const rollAreaM2 = (input.rollWidthMm * totalLengthMm) / 1_000_000;
  const usedAreaM2 = (input.quantity * printablePieceWidthMm * printablePieceHeightMm) / 1_000_000;
  const wasteAreaM2 = Math.max(0, rollAreaM2 - usedAreaM2);
  const utilizationPercent = rollAreaM2 > 0 ? (usedAreaM2 / rollAreaM2) * 100 : 0;

  return {
    safeWidthMm,
    printablePieceWidthMm: roundMm(printablePieceWidthMm),
    printablePieceHeightMm: roundMm(printablePieceHeightMm),
    automaticCopiesPerRow,
    copiesPerRow,
    rows,
    occupiedWidthMm,
    totalLengthMm: roundMm(totalLengthMm),
    usedAreaM2: roundMm(usedAreaM2, 4),
    rollAreaM2: roundMm(rollAreaM2, 4),
    wasteAreaM2: roundMm(wasteAreaM2, 4),
    utilizationPercent: roundMm(utilizationPercent, 2),
    linearMeters: roundMm(totalLengthMm / 1000, 3),
    freeWidthMm: roundMm(Math.max(0, safeWidthMm - occupiedWidthMm)),
    exportAllowed: errors.length === 0,
    errors,
  };
}
