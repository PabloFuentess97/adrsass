"use client";

import { create } from "zustand";
import { calculateMaterialUsage } from "@/lib/layout/calculate-grid";
import type { MaterialUsage } from "@/lib/layout/types";
import { renderCustomAdrSvg } from "@/lib/svg/render-custom-svg";
import { renderAdrSvg } from "@/lib/svg/render-adr-svg";

export type CutMode = "kiss-cut" | "flex-cut";
export type LayoutMode = "automatic" | "manual";

export interface EditorState {
  division: string;
  compatibilityGroup: string;
  classNumber: "1";
  widthMm: number;
  heightMm: number;
  bleedMm: number;
  quantity: number;
  rollWidthMm: number;
  leftMarginMm: number;
  rightMarginMm: number;
  horizontalGapMm: number;
  verticalGapMm: number;
  layoutMode: LayoutMode;
  manualCopiesPerRow: number;
  cutMode: CutMode;
  spotName: string;
  previewMode: "single" | "roll";
  status: string;
  uploadedSvg?: string;
  uploadedName?: string;
  set: (patch: Partial<EditorState>) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  division: "1.4",
  compatibilityGroup: "S",
  classNumber: "1",
  widthMm: 250,
  heightMm: 250,
  bleedMm: 3,
  quantity: 20,
  rollWidthMm: 1370,
  leftMarginMm: 20,
  rightMarginMm: 20,
  horizontalGapMm: 10,
  verticalGapMm: 10,
  layoutMode: "automatic",
  manualCopiesPerRow: 5,
  cutMode: "kiss-cut",
  spotName: "CutContour",
  previewMode: "single",
  status: "Listo",
  set: (patch) => set(patch),
}));

export function selectUsage(state: EditorState): MaterialUsage {
  return calculateMaterialUsage({
    rollWidthMm: state.rollWidthMm,
    leftMarginMm: state.leftMarginMm,
    rightMarginMm: state.rightMarginMm,
    pieceWidthMm: state.widthMm,
    pieceHeightMm: state.heightMm,
    bleedMm: state.bleedMm,
    horizontalGapMm: state.horizontalGapMm,
    verticalGapMm: state.verticalGapMm,
    quantity: state.quantity,
    mode: state.layoutMode,
    manualCopiesPerRow: state.manualCopiesPerRow,
  });
}

export function selectSvg(state: EditorState, includeCut = true): string {
  if (state.uploadedSvg) {
    return renderCustomAdrSvg({
      sanitizedSvg: state.uploadedSvg,
      division: state.division,
      compatibilityGroup: state.compatibilityGroup,
      classNumber: state.classNumber,
      widthMm: state.widthMm,
      heightMm: state.heightMm,
      bleedMm: state.bleedMm,
      spotName: state.spotName,
      includeCut,
    });
  }
  return renderAdrSvg({
    division: state.division,
    compatibilityGroup: state.compatibilityGroup,
    classNumber: state.classNumber,
    widthMm: state.widthMm,
    heightMm: state.heightMm,
    bleedMm: state.bleedMm,
    spotName: state.spotName,
    includeCut,
  });
}
