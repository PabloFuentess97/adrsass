import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/export/pdf/route";
import { renderAdrSvg } from "@/lib/svg/render-adr-svg";

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdminRequest: vi.fn(async () => ({ ok: true, session: { user: { role: "ADMIN" } } })),
}));

describe("POST /api/export/pdf", () => {
  it("devuelve PDF sin cache", async () => {
    const request = new Request("http://localhost/api/export/pdf", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        svg: renderAdrSvg({
          division: "1.4",
          compatibilityGroup: "S",
          classNumber: "1",
          widthMm: 100,
          heightMm: 100,
          bleedMm: 3,
          spotName: "CutContour",
          includeCut: true,
        }),
        document: { widthMm: 1370, heightMm: 266 },
        classification: { division: "1.4", compatibilityGroup: "S", classNumber: "1" },
        cut: { enabled: true, spotName: "CutContour", mode: "kiss-cut" },
        filename: "ADR-1.4-S-100x100mm-1uds-produccion.pdf",
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("Content-Type")).toContain("application/pdf");
  });
});
