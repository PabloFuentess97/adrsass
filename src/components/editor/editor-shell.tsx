"use client";

import { useCallback, useEffect } from "react";
import { Download, FileDown, LogOut, PackageCheck } from "lucide-react";
import { compatibilityGroups, explosiveDivisions, quickSizesMm } from "@/lib/adr/catalog";
import { buildAdrFilename } from "@/lib/adr/filenames";
import { validateAdrClassification } from "@/lib/adr/rules";
import { sanitizeSvg } from "@/lib/svg/sanitize-svg";
import { parseSvgDimensions } from "@/lib/svg/parse-svg";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { AdrPreview } from "./adr-preview";
import { selectSvg, selectUsage, useEditorStore } from "./editor-store";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function EditorShell() {
  const state = useEditorStore();
  const set = useEditorStore((store) => store.set);
  const usage = selectUsage(state);
  const filenameBase = {
    division: state.division,
    compatibilityGroup: state.compatibilityGroup,
    widthMm: state.widthMm,
    heightMm: state.heightMm,
    quantity: state.quantity,
  };

  const loadDefaultTemplate = useCallback(async () => {
    try {
      const response = await fetch("/templates/adr/adr-default.svg?v=3", { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudo cargar la plantilla");
      const raw = await response.text();
      const sanitized = sanitizeSvg(raw);
      set({
        uploadedSvg: sanitized.svg,
        uploadedName: "ADR 1-1 D-1 10x10.svg",
        widthMm: 100,
        heightMm: 100,
        status: "Plantilla ADR por defecto cargada",
      });
    } catch {
      set({ status: "No se pudo cargar la plantilla por defecto; usando demo tecnica" });
    }
  }, [set]);

  useEffect(() => {
    if (!state.uploadedSvg) {
      void loadDefaultTemplate();
    }
  }, [loadDefaultTemplate, state.uploadedSvg]);

  async function downloadSvg() {
    try {
      validateAdrClassification(state);
      const svg = selectSvg(state);
      sanitizeSvg(svg);
      downloadBlob(new Blob([svg], { type: "image/svg+xml" }), buildAdrFilename({ ...filenameBase, extension: "svg" }));
      set({ status: "SVG exportado correctamente" });
    } catch {
      set({ status: "No se pudo exportar el SVG" });
    }
  }

  async function downloadPdf(proof = false) {
    if (!usage.exportAllowed) {
      set({ status: "Corrige las advertencias de ancho antes de exportar" });
      return;
    }
    set({ status: "Generando PDF en memoria" });
    const pieces = Array.from({ length: state.quantity }).map((_, index) => {
      const col = index % usage.copiesPerRow;
      const row = Math.floor(index / usage.copiesPerRow);
      return {
        xMm: state.leftMarginMm + col * (usage.printablePieceWidthMm + state.horizontalGapMm),
        yMm: row * (usage.printablePieceHeightMm + state.verticalGapMm),
        widthMm: state.widthMm,
        heightMm: state.heightMm,
        bleedMm: state.bleedMm,
      };
    });
    const filename = buildAdrFilename({ ...filenameBase, extension: "pdf", proof });
    const response = await fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        svg: selectSvg(state, !proof),
        document: { widthMm: state.rollWidthMm, heightMm: Math.max(usage.totalLengthMm, usage.printablePieceHeightMm) },
        classification: { division: state.division, compatibilityGroup: state.compatibilityGroup, classNumber: state.classNumber },
        cut: { enabled: !proof, spotName: state.spotName, mode: state.cutMode },
        pieces,
        proof,
        filename,
      }),
    });
    if (!response.ok) {
      set({ status: "Error de exportacion PDF" });
      return;
    }
    downloadBlob(await response.blob(), filename);
    set({ status: proof ? "PDF de prueba exportado" : "PDF de produccion exportado" });
  }

  async function uploadTemplate(file?: File) {
    if (!file) return;
    try {
      set({ status: "Saneando plantilla SVG" });
      const raw = await file.text();
      const sanitized = sanitizeSvg(raw);
      const dimensions = parseSvgDimensions(sanitized.svg);
      const ratio = dimensions.widthMm / dimensions.heightMm;
      if (ratio > 0.8 && ratio < 1.2) {
        set({ widthMm: 100, heightMm: 100 });
      }
      set({
        uploadedSvg: sanitized.svg,
        uploadedName: file.name,
        status: `Plantilla temporal cargada (${sanitized.nodeCount} nodos, ${sanitized.removed.length} elementos/atributos limpiados)`,
      });
    } catch {
      set({ status: "SVG no valido o demasiado complejo" });
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Generador ADR privado</p>
          <h1 className="text-xl font-semibold">Senales vectoriales para HP Latex Print & Cut</h1>
        </div>
        <form action="/api/auth/sign-out" method="post">
          <Button className="bg-slate-800 hover:bg-slate-950" type="submit">
            <LogOut size={16} /> Salir
          </Button>
        </form>
      </header>
      <main className="grid gap-4 p-4 lg:grid-cols-[330px_minmax(0,1fr)_360px]">
        <section className="grid content-start gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold">Plantilla y clasificacion</h2>
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-950">
            {state.uploadedName ? `Plantilla activa: ${state.uploadedName}` : "Cargando plantilla ADR por defecto. Puedes subir otro SVG local sin guardarlo en servidor."}
          </div>
          <Field label="Subir SVG temporal" hint="Se sanea en el navegador y no se almacena en disco ni base de datos.">
            <Input type="file" accept=".svg,image/svg+xml" onChange={(event) => uploadTemplate(event.target.files?.[0])} />
          </Field>
          {state.uploadedSvg ? (
            <Button type="button" className="bg-slate-700 hover:bg-slate-900" onClick={() => void loadDefaultTemplate()}>
              Restaurar ADR por defecto
            </Button>
          ) : null}
          <Field label="Division">
            <Select value={state.division} onChange={(event) => set({ division: event.target.value })}>
              {explosiveDivisions.map((division) => (
                <option key={division}>{division}</option>
              ))}
            </Select>
          </Field>
          <Field label="Grupo de compatibilidad">
            <Select value={state.compatibilityGroup} onChange={(event) => set({ compatibilityGroup: event.target.value })}>
              {compatibilityGroups.map((group) => (
                <option key={group}>{group}</option>
              ))}
            </Select>
          </Field>
          <Field label="Numero inferior de clase">
            <Input value={state.classNumber} readOnly />
          </Field>
          <Field label="Medida final">
            <div className="grid grid-cols-3 gap-2">
              {quickSizesMm.map((size) => (
                <Button key={size} type="button" className="bg-slate-800 hover:bg-slate-950" onClick={() => set({ widthMm: size, heightMm: size })}>
                  {size}
                </Button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ancho mm">
              <Input type="number" value={state.widthMm} onChange={(event) => set({ widthMm: Number(event.target.value), heightMm: Number(event.target.value) })} />
            </Field>
            <Field label="Alto mm">
              <Input type="number" value={state.heightMm} readOnly />
            </Field>
          </div>
          <p className="text-xs leading-5 text-slate-500">
            La aplicacion fabrica la senal desde una clasificacion proporcionada por el usuario. No determina conformidad legal ADR.
          </p>
        </section>

        <section className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-md border border-slate-300 bg-white p-1">
              <button className={`rounded px-3 py-2 text-sm ${state.previewMode === "single" ? "bg-blue-700 text-white" : ""}`} onClick={() => set({ previewMode: "single" })}>
                Senal
              </button>
              <button className={`rounded px-3 py-2 text-sm ${state.previewMode === "roll" ? "bg-blue-700 text-white" : ""}`} onClick={() => set({ previewMode: "roll" })}>
                Bobina
              </button>
            </div>
            <span className="text-sm text-slate-600">{state.status}</span>
          </div>
          <AdrPreview />
        </section>

        <section className="grid content-start gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold">Produccion y exportacion</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cantidad">
              <Input type="number" min={1} max={500} value={state.quantity} onChange={(event) => set({ quantity: Number(event.target.value) })} />
            </Field>
            <Field label="Sangrado mm">
              <Input type="number" min={0} max={20} value={state.bleedMm} onChange={(event) => set({ bleedMm: Number(event.target.value) })} />
            </Field>
            <div className="col-span-2 grid grid-cols-4 gap-2">
              {[0, 2, 3, 5].map((bleed) => (
                <Button key={bleed} type="button" className="min-h-9 bg-slate-700 px-2 py-1 hover:bg-slate-900" onClick={() => set({ bleedMm: bleed })}>
                  {bleed} mm
                </Button>
              ))}
            </div>
            <Field label="Separacion H">
              <Input type="number" min={0} value={state.horizontalGapMm} onChange={(event) => set({ horizontalGapMm: Number(event.target.value) })} />
            </Field>
            <Field label="Separacion V">
              <Input type="number" min={0} value={state.verticalGapMm} onChange={(event) => set({ verticalGapMm: Number(event.target.value) })} />
            </Field>
            <Field label="Rollo mm">
              <Input type="number" value={state.rollWidthMm} onChange={(event) => set({ rollWidthMm: Number(event.target.value) })} />
            </Field>
            <div className="col-span-2 grid grid-cols-3 gap-2">
              {[1370, 1524, 1600].map((roll) => (
                <Button key={roll} type="button" className="min-h-9 bg-slate-700 px-2 py-1 hover:bg-slate-900" onClick={() => set({ rollWidthMm: roll })}>
                  {roll}
                </Button>
              ))}
            </div>
            <Field label="Margen izq.">
              <Input type="number" min={10} value={state.leftMarginMm} onChange={(event) => set({ leftMarginMm: Number(event.target.value) })} />
            </Field>
            <Field label="Margen der.">
              <Input type="number" min={10} value={state.rightMarginMm} onChange={(event) => set({ rightMarginMm: Number(event.target.value) })} />
            </Field>
            <Field label="Modo">
              <Select value={state.layoutMode} onChange={(event) => set({ layoutMode: event.target.value as "automatic" | "manual" })}>
                <option value="automatic">Automatico</option>
                <option value="manual">Manual</option>
              </Select>
            </Field>
            <Field label="Copias/fila manual">
              <Input type="number" min={1} value={state.manualCopiesPerRow} onChange={(event) => set({ manualCopiesPerRow: Number(event.target.value) })} />
            </Field>
            <Field label="Tipo de corte">
              <Select value={state.cutMode} onChange={(event) => set({ cutMode: event.target.value as "kiss-cut" | "flex-cut" })}>
                <option value="kiss-cut">Kiss Cut</option>
                <option value="flex-cut">FlexCut</option>
              </Select>
            </Field>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6">
            <div>Ancho seguro: <b>{usage.safeWidthMm} mm</b></div>
            <div>Ocupado: <b>{usage.occupiedWidthMm} mm</b> · Libre: <b>{usage.freeWidthMm} mm</b></div>
            <div>Copias/fila: <b>{usage.copiesPerRow}</b> · Filas: <b>{usage.rows}</b></div>
            <div>Metros ATP: <b>{usage.linearMeters}</b> · Aprovechamiento: <b>{usage.utilizationPercent}%</b></div>
          </div>
          {usage.errors.length ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{usage.errors.join(" ")}</div> : null}
          <div className="grid gap-2">
            <Button type="button" onClick={downloadSvg}>
              <Download size={16} /> Descargar SVG
            </Button>
            <Button type="button" className="bg-slate-800 hover:bg-slate-950" onClick={() => downloadPdf(true)}>
              <FileDown size={16} /> PDF de prueba
            </Button>
            <Button type="button" disabled={!usage.exportAllowed} onClick={() => downloadPdf(false)}>
              <PackageCheck size={16} /> PDF produccion CutContour
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
