import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  banVipUser: vi.fn(),
  createVipForumPost: vi.fn(),
  deleteVipForumPost: vi.fn(),
  getShoppingCart: vi.fn(),
  grantVipAccess: vi.fn(),
  hasVipAccess: vi.fn(),
  isVipUserBanned: vi.fn(),
  listSubscribedEmails: vi.fn(),
  listVipForumPosts: vi.fn(),
  listVipModerationMembers: vi.fn(),
  saveShoppingCart: vi.fn(),
  subscribeToNewsletter: vi.fn(),
  unbanVipUser: vi.fn(),
}));
vi.mock("./mailer", () => ({ sendPureClubCampaign: vi.fn() }));

import { banVipUser, deleteVipForumPost, listVipModerationMembers, unbanVipUser } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const adminContext = { user: { id: 1, email: "danandgal@yahoo.com", role: "admin" } } as unknown as TrpcContext;
const otherAdminContext = { user: { id: 2, email: "other-admin@example.com", role: "admin" } } as unknown as TrpcContext;
const userContext = { user: { id: 3, email: "member@example.com", role: "user" } } as unknown as TrpcContext;

describe("vip.moderation y administrador único", () => {
  it("permite a la cuenta principal listar miembros, borrar y bloquear", async () => {
    vi.mocked(listVipModerationMembers).mockResolvedValue([{ userId: 7, name: "Member", email: "member@example.com", bannedAt: null }]);
    vi.mocked(deleteVipForumPost).mockResolvedValue({ deleted: true });
    vi.mocked(banVipUser).mockResolvedValue({ banned: true });

    const caller = appRouter.createCaller(adminContext);
    await expect(caller.vip.moderation.members()).resolves.toHaveLength(1);
    await expect(caller.vip.moderation.deletePost({ postId: 12 })).resolves.toEqual({ deleted: true });
    await expect(caller.vip.moderation.banUser({ userId: 7 })).resolves.toEqual({ banned: true });
    expect(deleteVipForumPost).toHaveBeenCalledWith(12);
    expect(banVipUser).toHaveBeenCalledWith(7, 1);
  });

  it("permite desbloquear y no permite bloquear la propia cuenta", async () => {
    vi.mocked(unbanVipUser).mockResolvedValue({ unbanned: true });
    const caller = appRouter.createCaller(adminContext);

    await expect(caller.vip.moderation.unbanUser({ userId: 7 })).resolves.toEqual({ unbanned: true });
    await expect(caller.vip.moderation.banUser({ userId: 1 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(unbanVipUser).toHaveBeenCalledWith(7);
    expect(banVipUser).not.toHaveBeenCalledWith(1, 1);
  });

  it("rechaza tanto a otros roles admin como a cuentas admin con otro email", async () => {
    await expect(appRouter.createCaller(otherAdminContext).vip.moderation.members()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(otherAdminContext).newsletter.sendCampaign({ subject: "DROP 02", body: "Mensaje de prueba para PureClub." })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(userContext).vip.moderation.deletePost({ postId: 12 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
