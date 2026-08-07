export const explosiveDivisions = ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6"] as const;

export const compatibilityGroups = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "N",
  "S",
] as const;

export type ExplosiveDivision = (typeof explosiveDivisions)[number];
export type CompatibilityGroup = (typeof compatibilityGroups)[number];

export const quickSizesMm = [100, 250, 400] as const;
