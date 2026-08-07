export const requiredTemplateIds = [
  "adr-background",
  "adr-symbol",
  "adr-border",
  "adr-division",
  "adr-compatibility",
  "adr-class-number",
  "adr-cut-shape",
] as const;

export function validateTemplate(svg: string): { valid: boolean; missingIds: string[] } {
  const missingIds = requiredTemplateIds.filter((id) => !new RegExp(`id=["']${id}["']`).test(svg));
  return { valid: missingIds.length === 0, missingIds };
}
