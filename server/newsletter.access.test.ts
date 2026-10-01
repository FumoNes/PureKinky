import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  listNewsletterSubscribers: vi.fn(),
  listSubscribedEmails: vi.fn(),
  subscribeToNewsletter: vi.fn(),
}));
vi.mock("./mailer", () => ({ sendPureClubCampaign: vi.fn() }));

import { listNewsletterSubscribers } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const primaryAdmin = { user: { id: 1, email: "danandgal@yahoo.com", role: "admin" } } as unknown as TrpcContext;
const otherAdmin = { user: { id: 2, email: "other-admin@example.com", role: "admin" } } as unknown as TrpcContext;
const member = { user: { id: 3, email: "member@example.com", role: "user" } } as unknown as TrpcContext;

describe("newsletter.subscribers", () => {
  beforeEach(() => vi.clearAllMocks());
  it("devuelve todos los contactos a la cuenta administradora principal", async () => {
    vi.mocked(listNewsletterSubscribers).mockResolvedValue([
      { id: 1, email: "active@example.com", isSubscribed: true, consentedAt: new Date(), consentVersion: "2026-08-28" },
      { id: 2, email: "inactive@example.com", isSubscribed: false, consentedAt: new Date(), consentVersion: "2026-08-28" },
    ]);

    await expect(appRouter.createCaller(primaryAdmin).newsletter.subscribers()).resolves.toHaveLength(2);
    expect(listNewsletterSubscribers).toHaveBeenCalledOnce();
  });

  it("rechaza el listado completo a cualquier otra cuenta", async () => {
    await expect(appRouter.createCaller(otherAdmin).newsletter.subscribers()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(member).newsletter.subscribers()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(listNewsletterSubscribers).not.toHaveBeenCalled();
  });
});
