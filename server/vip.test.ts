import { describe, expect, it } from "vitest";
import { isValidVipCode, VIP_QUIZ_ANSWER_KEY } from "./vip";

describe("puerta VIP", () => {
  it("acepta el código configurado y rechaza una variante incorrecta", () => {
    expect(isValidVipCode("6460")).toBe(true);
    expect(isValidVipCode("6461")).toBe(false);
  });

  it("mantiene la clave de cinco respuestas correctas del test VIP", () => {
    expect(VIP_QUIZ_ANSWER_KEY).toEqual([2, 0, 2, 0, 0]);
  });
});
