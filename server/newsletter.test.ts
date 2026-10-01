import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  subscribeToNewsletter: vi.fn(),
}));

import { appRouter } from "./routers";
import { subscribeToNewsletter } from "./db";
import type { TrpcContext } from "./_core/context";
import { isValidEmail, normalizeEmail } from "../shared/email";

const mockedSubscribe = vi.mocked(subscribeToNewsletter);
const context = {
  user: { id: 1, openId: "pureclub-test", email: "drops@purekinky.es", role: "user" },
} as unknown as TrpcContext;

describe("newsletter.subscribe", () => {
  beforeEach(() => vi.clearAllMocks());

  it("usa el email verificado de la cuenta y expone una suscripción creada", async () => {
    mockedSubscribe.mockResolvedValue({ status: "created" });
    const caller = appRouter.createCaller(context);

    await expect(caller.newsletter.subscribe({ consent: true, consentVersion: "2026-08-28" })).resolves.toEqual({ status: "created" });
    expect(mockedSubscribe).toHaveBeenCalledWith("drops@purekinky.es", "2026-08-28");
  });

  it("normaliza el email de cuenta cuando tiene caracteres invisibles", async () => {
    mockedSubscribe.mockResolvedValue({ status: "created" });
    const caller = appRouter.createCaller({ ...context, user: { ...context.user, email: "drops\u200B@purekinky.es\uFEFF" } });

    await expect(caller.newsletter.subscribe({ consent: true, consentVersion: "2026-08-28" })).resolves.toEqual({ status: "created" });
    expect(mockedSubscribe).toHaveBeenCalledWith("drops@purekinky.es", "2026-08-28");
  });

  it("normaliza el texto copiado y distingue un email inválido", () => {
    expect(normalizeEmail("  CLUB\u200B@PUREKINKY.ES\uFEFF ")).toBe("club@purekinky.es");
    expect(isValidEmail("club@purekinky.es")).toBe(true);
    expect(isValidEmail(normalizeEmail("purekinky@"))).toBe(false);
  });

  it("rechaza una cuenta autenticada que no aporta un email válido", async () => {
    const caller = appRouter.createCaller({ ...context, user: { ...context.user, email: undefined } } as unknown as TrpcContext);

    await expect(caller.newsletter.subscribe({ consent: true, consentVersion: "2026-08-28" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(mockedSubscribe).not.toHaveBeenCalled();
  });

  it("exige iniciar sesión antes de crear una suscripción", async () => {
    const caller = appRouter.createCaller({ ...context, user: null } as unknown as TrpcContext);

    await expect(caller.newsletter.subscribe({ consent: true, consentVersion: "2026-08-28" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    expect(mockedSubscribe).not.toHaveBeenCalled();
  });

  it("preserva el estado de una suscripción ya registrada", async () => {
    mockedSubscribe.mockResolvedValue({ status: "existing" });
    const caller = appRouter.createCaller(context);

    await expect(caller.newsletter.subscribe({ consent: true, consentVersion: "2026-08-28" })).resolves.toEqual({ status: "existing" });
  });
});
