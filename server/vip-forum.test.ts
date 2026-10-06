import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  createVipForumPost: vi.fn(),
  grantVipAccess: vi.fn(),
  hasVipQuizCompletion: vi.fn(),
  recordVipQuizCompletion: vi.fn(),
  hasVipAccess: vi.fn(),
  isVipUserBanned: vi.fn(),
  listSubscribedEmails: vi.fn(),
  listVipForumPosts: vi.fn(),
  subscribeToNewsletter: vi.fn(),
}));
vi.mock("./mailer", () => ({ sendPureClubCampaign: vi.fn() }));

import { createVipForumPost, grantVipAccess, hasVipAccess, hasVipQuizCompletion, isVipUserBanned, listVipForumPosts, recordVipQuizCompletion } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const vipContext = { user: { id: 44, role: "user" } } as unknown as TrpcContext;
const noVipContext = { user: { id: 45, role: "user" } } as unknown as TrpcContext;

describe("vip.forum", () => {
  beforeEach(() => vi.clearAllMocks());

  it("devuelve el canal privado solo a un miembro con acceso VIP", async () => {
    vi.mocked(hasVipAccess).mockResolvedValue(true);
    vi.mocked(listVipForumPosts).mockResolvedValue([]);

    await expect(appRouter.createCaller(vipContext).vip.forum.list()).resolves.toEqual([]);
    expect(listVipForumPosts).toHaveBeenCalledOnce();
  });

  it("impide leer o publicar cuando la cuenta no tiene acceso VIP", async () => {
    vi.mocked(hasVipAccess).mockResolvedValue(false);
    const caller = appRouter.createCaller(noVipContext);

    await expect(caller.vip.forum.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.vip.forum.publish({ body: "x".repeat(12) })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(createVipForumPost).not.toHaveBeenCalled();
  });

  it("vincula cada publicación autorizada al usuario de su sesión", async () => {
    vi.mocked(hasVipAccess).mockResolvedValue(true);
    vi.mocked(createVipForumPost).mockResolvedValue({ created: true });

    await expect(appRouter.createCaller(vipContext).vip.forum.publish({ body: "x".repeat(12) })).resolves.toEqual({ created: true });
    expect(createVipForumPost).toHaveBeenCalledWith(44, "x".repeat(12));
  });

  it("calcula el 100 % y persiste la aprobación antes de entregar el código", async () => {
    vi.mocked(recordVipQuizCompletion).mockResolvedValue({ completed: true, score: 5 });
    const result = await appRouter.createCaller(vipContext).vip.quiz.submit({ answers: [2, 0, 2, 0, 0] });
    expect(result).toEqual({ completed: true, score: 5 });
    expect(recordVipQuizCompletion).toHaveBeenCalledWith(44, 5);
  });

  it("rechaza un resultado parcial y no persiste una aprobación", async () => {
    const result = await appRouter.createCaller(vipContext).vip.quiz.submit({ answers: [2, 0, 0, 0, 0] });
    expect(result).toEqual({ completed: false, score: 4 });
    expect(recordVipQuizCompletion).not.toHaveBeenCalled();
  });

  it("bloquea el código hasta que exista una aprobación persistida", async () => {
    vi.mocked(hasVipQuizCompletion).mockResolvedValue(false);
    await expect(appRouter.createCaller(vipContext).vip.unlock({ code: "3317" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(grantVipAccess).not.toHaveBeenCalled();
  });

  it("acepta el código correcto solo con un quiz aprobado", async () => {
    vi.mocked(hasVipQuizCompletion).mockResolvedValue(true);
    vi.mocked(grantVipAccess).mockResolvedValue({ granted: true });
    await expect(appRouter.createCaller(vipContext).vip.unlock({ code: "3317" })).resolves.toEqual({ granted: true });
    expect(grantVipAccess).toHaveBeenCalledWith(44);
  });

  it("bloquea a un usuario VIP vetado aunque conserve su concesión", async () => {
    vi.mocked(hasVipAccess).mockResolvedValue(true);
    vi.mocked(isVipUserBanned).mockResolvedValue(true);
    const caller = appRouter.createCaller(vipContext);

    await expect(caller.vip.status()).resolves.toBe(false);
    await expect(caller.vip.forum.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.vip.forum.publish({ body: "x".repeat(12) })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
