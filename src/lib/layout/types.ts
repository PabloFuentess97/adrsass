export type LayoutMode = "automatic" | "manual";

export interface RollLayoutInput {
  rollWidthMm: number;
  leftMarginMm: number;
  rightMarginMm: number;
  pieceWidthMm: number;
  pieceHeightMm: number;
  bleedMm: number;
  horizontalGapMm: number;
  verticalGapMm: number;
  quantity: number;
  mode: LayoutMode;
  manualCopiesPerRow?: number;
}

export interface MaterialUsage {
  safeWidthMm: number;
  printablePieceWidthMm: number;
  printablePieceHeightMm: number;
  automaticCopiesPerRow: number;
  copiesPerRow: number;
  rows: number;
  occupiedWidthMm: number;
  totalLengthMm: number;
  usedAreaM2: number;
  rollAreaM2: number;
  wasteAreaM2: number;
  utilizationPercent: number;
  linearMeters: number;
  freeWidthMm: number;
  exportAllowed: boolean;
  errors: string[];
}
