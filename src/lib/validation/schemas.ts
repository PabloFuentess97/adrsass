import { z } from "zod";
import { compatibilityGroups, explosiveDivisions } from "@/lib/adr/catalog";

export const exportPdfSchema = z.object({
  svg: z.string().min(20).max(Number(process.env.MAX_SVG_BYTES ?? 5_242_880)),
  document: z.object({
    widthMm: z.number().positive().max(Number(process.env.MAX_DOCUMENT_WIDTH_MM ?? 1600)),
    heightMm: z.number().positive().max(Number(process.env.MAX_DOCUMENT_HEIGHT_MM ?? 10000)),
  }),
  classification: z.object({
    division: z.enum(explosiveDivisions),
    compatibilityGroup: z.enum(compatibilityGroups),
    classNumber: z.literal("1"),
  }),
  cut: z.object({
    enabled: z.boolean(),
    spotName: z.string().default("CutContour"),
    mode: z.enum(["kiss-cut", "flex-cut"]),
  }),
  pieces: z
    .array(
      z.object({
        xMm: z.number().min(0),
        yMm: z.number().min(0),
        widthMm: z.number().positive(),
        heightMm: z.number().positive(),
        bleedMm: z.number().min(0).max(20),
      }),
    )
    .max(Number(process.env.MAX_COPIES ?? 500))
    .optional(),
  proof: z.boolean().optional(),
  filename: z.string().regex(/^[A-Za-z0-9_.-]+\.pdf$/),
});

export type ExportPdfInput = z.infer<typeof exportPdfSchema>;
