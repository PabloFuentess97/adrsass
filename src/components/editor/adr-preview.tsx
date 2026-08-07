"use client";

import { useMemo } from "react";
import { selectSvg, selectUsage, useEditorStore } from "./editor-store";

export function AdrPreview() {
  const state = useEditorStore();
  const svg = useMemo(() => selectSvg(state), [state]);
  const usage = useMemo(() => selectUsage(state), [state]);

  if (state.previewMode === "roll") {
    const scale = 760 / state.rollWidthMm;
    const safeX = state.leftMarginMm * scale;
    const safeW = usage.safeWidthMm * scale;
    const pieceW = usage.printablePieceWidthMm * scale;
    const pieceH = usage.printablePieceHeightMm * scale;
    const gap = state.horizontalGapMm * scale;
    const shown = Math.min(state.quantity, 80);
    return (
      <div className="h-full min-h-[520px] rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between text-sm text-slate-600">
          <span>Vista de bobina</span>
          <span>{state.rollWidthMm} mm</span>
        </div>
        <svg viewBox="0 0 760 520" className="h-[520px] w-full">
          <rect x="0" y="0" width="760" height="520" fill="#f8fafc" stroke="#cbd5e1" />
          <rect x="0" y="0" width={safeX} height="520" fill="#fee2e2" />
          <rect x={safeX + safeW} y="0" width={760 - safeX - safeW} height="520" fill="#fee2e2" />
          <rect x={safeX} y="0" width={safeW} height="520" fill="#eff6ff" />
          {Array.from({ length: shown }).map((_, index) => {
            const col = index % Math.max(1, usage.copiesPerRow);
            const row = Math.floor(index / Math.max(1, usage.copiesPerRow));
            const x = safeX + col * (pieceW + gap);
            const y = 24 + row * (pieceH + state.verticalGapMm * scale);
            if (y > 485) return null;
            return (
              <g key={index}>
                <rect x={x} y={y} width={pieceW} height={pieceH} fill="#fed7aa" stroke="#fb923c" />
                <rect
                  x={x + state.bleedMm * scale}
                  y={y + state.bleedMm * scale}
                  width={state.widthMm * scale}
                  height={state.heightMm * scale}
                  fill="none"
                  stroke="#d946ef"
                  strokeWidth="1"
                />
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-[520px] place-items-center rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <div className="w-full max-w-[560px]" dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
