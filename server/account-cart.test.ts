import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  createVipForumPost: vi.fn(),
  getShoppingCart: vi.fn(),
  grantVipAccess: vi.fn(),
  hasVipAccess: vi.fn(),
  listSubscribedEmails: vi.fn(),
  listVipForumPosts: vi.fn(),
  saveShoppingCart: vi.fn(),
  subscribeToNewsletter: vi.fn(),
}));
vi.mock("./mailer", () => ({ sendPureClubCampaign: vi.fn() }));

import { getShoppingCart, saveShoppingCart } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const accountContext = { user: { id: 71, role: "user" } } as unknown as TrpcContext;

describe("cart", () => {
  beforeEach(() => vi.clearAllMocks());

  it("devuelve únicamente las líneas asociadas a la cuenta con sesión", async () => {
    vi.mocked(getShoppingCart).mockResolvedValue([{ productId: "camiseta-drop-1-golfo-puro", size: "M", playerName: "REINA", playerNumber: "7", quantity: 1 }]);

    await expect(appRouter.createCaller(accountContext).cart.get({ accountKey: 71 })).resolves.toHaveLength(1);
    expect(getShoppingCart).toHaveBeenCalledWith(71);
  });

  it("guarda las variantes con talla, nombre y dorsal para la cuenta actual", async () => {
    vi.mocked(saveShoppingCart).mockResolvedValue({ saved: 1 });
    const items = [{ productId: "camiseta-drop-1-golfo-puro", size: "M", playerName: "REINA", playerNumber: "7", quantity: 2 }];

    await expect(appRouter.createCaller(accountContext).cart.save({ items })).resolves.toEqual({ saved: 1 });
    expect(saveShoppingCart).toHaveBeenCalledWith(71, items);
  });

  it("rechaza carritos sin sesión o con un dorsal fuera del formato permitido", async () => {
    const anonymous = appRouter.createCaller({ user: null } as unknown as TrpcContext);
    const account = appRouter.createCaller(accountContext);

    await expect(anonymous.cart.get({ accountKey: 71 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(account.cart.save({ items: [{ productId: "camiseta-drop-1-golfo-puro", size: "M", playerName: "REINA", playerNumber: "A7", quantity: 1 }] })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
