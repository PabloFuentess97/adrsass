import { describe, expect, it } from "vitest";
import { buildAdrFilename } from "@/lib/adr/filenames";
import { validateAdrClassification } from "@/lib/adr/rules";

describe("ADR", () => {
  it("valida clasificaciones", () => {
    expect(validateAdrClassification({ division: "1.4", compatibilityGroup: "s", classNumber: "1" }).compatibilityGroup).toBe("S");
    expect(() => validateAdrClassification({ division: "9", compatibilityGroup: "S", classNumber: "1" })).toThrow();
  });

  it("genera nombres seguros", () => {
    expect(
      buildAdrFilename({
        division: "1.4",
        compatibilityGroup: "S",
        widthMm: 250,
        heightMm: 250,
        quantity: 20,
        extension: "svg",
      }),
    ).toBe("ADR-1.4-S-250x250mm-20uds-editable.svg");
  });
});
