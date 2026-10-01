import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  grantVipAccess: vi.fn(),
  hasVipAccess: vi.fn(),
  listSubscribedEmails: vi.fn(),
  subscribeToNewsletter: vi.fn(),
}));
vi.mock("./mailer", () => ({ sendPureClubCampaign: vi.fn() }));

import { listSubscribedEmails } from "./db";
import { sendPureClubCampaign } from "./mailer";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const adminContext = { user: { id: 1, email: "danandgal@yahoo.com", role: "admin" } } as TrpcContext;
const userContext = { user: { id: 2, role: "user" } } as TrpcContext;

describe("newsletter.sendCampaign", () => {
  beforeEach(() => vi.clearAllMocks());

  it("entrega una campaña solo a suscriptores activos cuando la solicita un administrador", async () => {
    vi.mocked(listSubscribedEmails).mockResolvedValue(["one@example.com", "two@example.com"]);
    vi.mocked(sendPureClubCampaign).mockResolvedValue({ sent: 2 });

    const caller = appRouter.createCaller(adminContext);
    await expect(caller.newsletter.sendCampaign({ subject: "DROP 01", body: "Acceso anticipado para PureClub." })).resolves.toEqual({ sent: 2 });
    expect(sendPureClubCampaign).toHaveBeenCalledWith(["one@example.com", "two@example.com"], "DROP 01", "Acceso anticipado para PureClub.");
  });

  it("devuelve cero destinatarios sin intentar enviar cuando no hay suscripciones activas", async () => {
    vi.mocked(listSubscribedEmails).mockResolvedValue([]);
    const caller = appRouter.createCaller(adminContext);

    await expect(caller.newsletter.sendCampaign({ subject: "DROP 01", body: "Acceso anticipado para PureClub." })).resolves.toEqual({ sent: 0 });
    expect(sendPureClubCampaign).not.toHaveBeenCalled();
  });

  it("propaga el fallo del transporte para que el panel lo comunique", async () => {
    vi.mocked(listSubscribedEmails).mockResolvedValue(["one@example.com"]);
    vi.mocked(sendPureClubCampaign).mockRejectedValue(new Error("El envío de PureClub todavía no está configurado."));
    const caller = appRouter.createCaller(adminContext);

    await expect(caller.newsletter.sendCampaign({ subject: "DROP 01", body: "Acceso anticipado para PureClub." })).rejects.toThrow("El envío de PureClub todavía no está configurado.");
  });

  it("rechaza el envío de una campaña desde una cuenta que no es administradora", async () => {
    const caller = appRouter.createCaller(userContext);
    await expect(caller.newsletter.sendCampaign({ subject: "DROP 01", body: "Acceso anticipado para PureClub." })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
