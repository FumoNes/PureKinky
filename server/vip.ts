import { timingSafeEqual } from "node:crypto";
import { ENV } from "./_core/env";

export const VIP_QUIZ_ANSWER_KEY = [2, 0, 2, 0, 0] as const;

export function isValidVipCode(submittedCode: string) {
  const expected = Buffer.from(ENV.vipAccessCode, "utf8");
  const submitted = Buffer.from(submittedCode, "utf8");
  return expected.length > 0 && expected.length === submitted.length && timingSafeEqual(expected, submitted);
}
