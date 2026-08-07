import { NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/auth/require-admin";
import { createProductionPdf } from "@/lib/pdf/create-production-pdf";
import { sanitizeSvg } from "@/lib/svg/sanitize-svg";
import { exportPdfSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function POST(request: Request) {
  const auth = await requireAdminRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? "No autorizado" : "Prohibido" }, { status: auth.status, headers: noStoreHeaders });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  const maxBytes = Number(process.env.MAX_SVG_BYTES ?? 5_242_880) + 20_000;
  if (contentLength > maxBytes) {
    return NextResponse.json({ error: "Peticion demasiado grande" }, { status: 413, headers: noStoreHeaders });
  }

  try {
    const body = await request.json();
    const parsed = exportPdfSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Peticion invalida" }, { status: 400, headers: noStoreHeaders });
    }
    const sanitized = sanitizeSvg(parsed.data.svg);
    if (!sanitized.svg.includes("adr-cut-shape")) {
      return NextResponse.json({ error: "Contorno no procesable" }, { status: 422, headers: noStoreHeaders });
    }
    const pdf = createProductionPdf({
      widthMm: parsed.data.document.widthMm,
      heightMm: parsed.data.document.heightMm,
      spotName: parsed.data.cut.spotName,
      proof: parsed.data.proof || !parsed.data.cut.enabled,
      pieces: parsed.data.pieces,
      title: parsed.data.filename,
    });
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        ...noStoreHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${parsed.data.filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF_EXPORT_FAILED", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Error interno" }, { status: 500, headers: noStoreHeaders });
  }
}
