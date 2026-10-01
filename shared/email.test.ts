import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail } from "./email";

describe("normalización de email", () => {
  it("elimina espacios y caracteres invisibles antes de validar", () => {
    const normalized = normalizeEmail("  CLUB\u200B@PUREKINKY.ES\uFEFF ");
    expect(normalized).toBe("club@purekinky.es");
    expect(isValidEmail(normalized)).toBe(true);
  });

  it("no acepta direcciones incompletas", () => {
    expect(isValidEmail(normalizeEmail("purekinky@"))).toBe(false);
  });
});

