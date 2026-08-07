import { compatibilityGroups, explosiveDivisions, type CompatibilityGroup, type ExplosiveDivision } from "./catalog";

export interface AdrClassification {
  division: ExplosiveDivision;
  compatibilityGroup: CompatibilityGroup;
  classNumber: "1";
}

export function isExplosiveDivision(value: string): value is ExplosiveDivision {
  return explosiveDivisions.includes(value as ExplosiveDivision);
}

export function isCompatibilityGroup(value: string): value is CompatibilityGroup {
  return compatibilityGroups.includes(value as CompatibilityGroup);
}

export function validateAdrClassification(input: {
  division: string;
  compatibilityGroup: string;
  classNumber: string;
}): AdrClassification {
  const division = input.division.trim();
  const compatibilityGroup = input.compatibilityGroup.trim().toUpperCase();
  const classNumber = input.classNumber.trim();

  if (!isExplosiveDivision(division)) {
    throw new Error("Division ADR no permitida.");
  }
  if (!isCompatibilityGroup(compatibilityGroup)) {
    throw new Error("Grupo de compatibilidad no permitido.");
  }
  if (classNumber !== "1") {
    throw new Error("La clase inferior inicial soportada es 1.");
  }
  return { division, compatibilityGroup, classNumber };
}
