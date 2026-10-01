// @vitest-environment happy-dom
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mutateAsync = vi.fn().mockResolvedValue({ status: "created" });
const vipMutateAsync = vi.fn().mockResolvedValue({ granted: true });
const vipForumMutateAsync = vi.fn().mockResolvedValue({ created: true });
const quizSubmitMutateAsync = vi.fn().mockResolvedValue({ completed: true, score: 5 });
const campaignMutateAsync = vi.fn().mockResolvedValue({ sent: 0 });
const newsletterSubscribersMock = vi.hoisted(() => ({ data: [] as Array<{ id: number; email: string; isSubscribed: boolean; consentedAt: Date | null; consentVersion: string | null }>, isLoading: false }));
const moderationMutateAsync = vi.fn().mockResolvedValue({ deleted: true });
const cartMock = vi.hoisted(() => ({ data: [] as Array<{ productId: string; size: string; playerName: string; playerNumber: string; quantity: number }>, isSuccess: false, save: vi.fn().mockResolvedValue({ saved: 0 }) }));
const authMock = vi.hoisted(() => ({
  state: { user: null as { id?: number; name?: string; email?: string; role?: string } | null, loading: false, isAuthenticated: false, logout: vi.fn() },
  startLogin: vi.fn(),
}));
const vipUiMock = vi.hoisted(() => ({
  status: false,
  quizCompleted: true,
  posts: [] as Array<{ id: number; authorUserId: number | null; body: string; createdAt: Date; authorName: string | null }>,
  members: [] as Array<{ userId: number; name: string | null; email: string | null; bannedAt: Date | null }>,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    cart: {
      get: { useQuery: () => ({ data: cartMock.data, isSuccess: cartMock.isSuccess }) },
      save: { useMutation: () => ({ mutateAsync: cartMock.save, isPending: false }) },
    },
    newsletter: {
      subscribe: {
        useMutation: () => ({ mutateAsync, isPending: false }),
      },
      sendCampaign: {
        useMutation: () => ({ mutateAsync: campaignMutateAsync, isPending: false }),
      },
      subscribers: {
        useQuery: () => newsletterSubscribersMock,
      },
    },
    vip: {
      status: {
        useQuery: () => ({ data: vipUiMock.status, refetch: vi.fn() }),
      },
      quiz: {
        status: { useQuery: () => ({ data: { completed: vipUiMock.quizCompleted }, isLoading: false, refetch: vi.fn() }) },
        submit: { useMutation: () => ({ mutateAsync: quizSubmitMutateAsync, isPending: false }) },
      },
      unlock: {
        useMutation: () => ({ mutateAsync: vipMutateAsync, isPending: false }),
      },
      forum: {
        list: { useQuery: () => ({ data: vipUiMock.posts, isLoading: false, refetch: vi.fn() }) },
        publish: { useMutation: () => ({ mutateAsync: vipForumMutateAsync, isPending: false }) },
      },
      moderation: {
        members: { useQuery: () => ({ data: vipUiMock.members, isLoading: false, refetch: vi.fn() }) },
        deletePost: { useMutation: () => ({ mutate: moderationMutateAsync, isPending: false }) },
        banUser: { useMutation: () => ({ mutate: moderationMutateAsync, isPending: false }) },
        unbanUser: { useMutation: () => ({ mutate: moderationMutateAsync, isPending: false }) },
      },
    },
  },
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }),
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authMock.state,
}));

vi.mock("@/const", () => ({
  startLogin: authMock.startLogin,
}));

import Home from "./Home";

describe("interacciones del inicio PureKinky", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    vi.clearAllMocks();
    authMock.state = { user: null, loading: false, isAuthenticated: false, logout: vi.fn() };
    vipUiMock.status = false; vipUiMock.quizCompleted = true; vipUiMock.posts = []; vipUiMock.members = [];
    quizSubmitMutateAsync.mockResolvedValue({ completed: true, score: 5 });
    newsletterSubscribersMock.data = []; newsletterSubscribersMock.isLoading = false;
    cartMock.data = []; cartMock.isSuccess = false;
    window.open = vi.fn();
    window.scrollTo = vi.fn();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("abre y cierra el menú desde sus controles reales", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(document.querySelector(".menu-panel")?.classList.contains("is-open")).toBe(true);

    await user.click(screen.getByRole("button", { name: "Cerrar menú" }));
    expect(document.querySelector(".menu-panel")?.classList.contains("is-open")).toBe(false);
  });

  it("añade una pieza, abre el pedido y confirma por WhatsApp", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: "Añadir talla M" }));
    const cartPanel = document.querySelector(".cart-panel")!;
    expect(cartPanel.classList.contains("is-open")).toBe(true);
    expect(within(cartPanel as HTMLElement).getByText("Camiseta Drop 1 x Golfo & Puro")).toBeTruthy();

    expect(within(cartPanel as HTMLElement).getByText(/talla M/i)).toBeTruthy();
    await user.click(within(cartPanel as HTMLElement).getByRole("button", { name: /confirmar por whatsapp/i }));
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining("https://wa.me/34722516474?text="), "_blank", "noopener,noreferrer");
  });

  it("mantiene una personalización independiente e incluye sus datos en el pedido", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.type(screen.getByLabelText("Nombre para camiseta"), "kinky");
    await user.type(screen.getByLabelText("Número para camiseta"), "10");
    await user.click(screen.getByRole("button", { name: "Añadir talla M" }));

    const cartPanel = document.querySelector(".cart-panel")!;
    expect(within(cartPanel as HTMLElement).getByText("Personalización: KINKY · #10")).toBeTruthy();
    await user.click(within(cartPanel as HTMLElement).getByRole("button", { name: /confirmar por whatsapp/i }));
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent("nombre KINKY, dorsal 10")), "_blank", "noopener,noreferrer");
  });

  it("desde catálogo obliga a configurar la camiseta en Drop 01 antes de añadirla", async () => {
    const user = userEvent.setup();
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
    render(<Home />);

    await user.click(screen.getByRole("button", { name: "Configurar Camiseta Drop 1 x Golfo & Puro en Drop 01" }));

    expect(scrollIntoView).toHaveBeenCalled();
    expect(screen.getByText("Configura talla, nombre y dorsal en Drop 01 antes de añadir.")).toBeTruthy();
    expect(document.querySelector(".cart-panel")?.classList.contains("is-open")).toBe(false);
  });

  it("al tocar la foto del expositor alterna frontal y trasera", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const imageControl = screen.getByRole("button", { name: /mostrar vista trasera/i });
    expect(within(imageControl).getByAltText(/modelo con la camiseta rosa/i)).toBeTruthy();
    await user.click(imageControl);
    expect(screen.getByRole("button", { name: /mostrar vista frontal/i })).toBeTruthy();
    expect(within(screen.getByRole("button", { name: /mostrar vista frontal/i })).getByAltText(/vista trasera de la camiseta/i)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /mostrar vista frontal/i }));
    expect(within(screen.getByRole("button", { name: /mostrar vista trasera/i })).getByAltText(/modelo con la camiseta rosa/i)).toBeTruthy();
  });

  it("recorre el test VIP completo y envía las cinco respuestas correctas", async () => {
    const user = userEvent.setup();
    authMock.state = { user: { name: "Club", email: "club@purekinky.es", role: "user" }, loading: false, isAuthenticated: true, logout: vi.fn() };
    vipUiMock.quizCompleted = false;
    render(<Home />);
    await user.click(screen.getAllByRole("button").find(button => button.textContent?.trim() === "VIP")!);
    const answers = ["No respira", "Justa", "El Jaro", "El Torete", "Juan José Moreno Cuenca"];
    for (const answer of answers) {
      await user.click(screen.getByRole("button", { name: answer }));
      await user.click(screen.getByRole("button", { name: /siguiente|finalizar test/i }));
    }
    expect(quizSubmitMutateAsync).toHaveBeenCalledWith({ answers: [2, 0, 2, 0, 0] });
  });

  it("muestra el código 6460 en el acceso posterior a un quiz aprobado", async () => {
    const user = userEvent.setup();
    authMock.state = { user: { name: "Club", email: "club@purekinky.es", role: "user" }, loading: false, isAuthenticated: true, logout: vi.fn() };
    vipUiMock.quizCompleted = true;
    render(<Home />);
    await user.click(screen.getAllByRole("button").find(button => button.textContent?.trim() === "VIP")!);
    expect(screen.getByText("6460")).toBeTruthy();
    expect(screen.getByLabelText("Código de acceso")).toBeTruthy();
  });

  it("restaura las líneas personalizadas del carrito asociadas a una cuenta", async () => {
    cartMock.data = [{ productId: "camiseta-drop-1-golfo-puro", size: "XL", playerName: "REINA", playerNumber: "7", quantity: 2 }];
    cartMock.isSuccess = true;
    authMock.state = { user: { name: "Club", email: "club@purekinky.es", role: "user" }, loading: false, isAuthenticated: true, logout: vi.fn() };
    render(<Home />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Abrir pedido" }).textContent).toContain("2"));
    await userEvent.setup().click(screen.getByRole("button", { name: "Abrir pedido" }));
    expect(screen.getByText("Personalización: REINA · #7")).toBeTruthy();
  });

  it("muestra un aviso y ofrece reintento si falla el guardado del carrito de una cuenta", async () => {
    cartMock.data = [{ productId: "camiseta-drop-1-golfo-puro", size: "M", playerName: "", playerNumber: "", quantity: 1 }];
    cartMock.isSuccess = true;
    cartMock.save.mockRejectedValueOnce(new Error("network"));
    authMock.state = { user: { name: "Club", email: "club@purekinky.es", role: "user" }, loading: false, isAuthenticated: true, logout: vi.fn() };
    render(<Home />);

    await waitFor(() => expect(screen.getByText(/No se ha podido guardar el pedido en tu cuenta/i)).toBeTruthy());
    expect(screen.getByText("Reintentar ahora")).toBeTruthy();
  });

  it("abre y cierra el pedido vacío mediante los controles visibles", () => {
    render(<Home />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir pedido" }));
    expect(document.querySelector(".cart-panel")?.classList.contains("is-open")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Cerrar pedido" }));
    expect(document.querySelector(".cart-panel")?.classList.contains("is-open")).toBe(false);
  });

  it("usa el email de la cuenta consentida de PureClub y confirma el resultado en pantalla", async () => {
    const user = userEvent.setup();
    authMock.state = { user: { name: "Club", email: "club@purekinky.es", role: "user" }, loading: false, isAuthenticated: true, logout: vi.fn() };
    render(<Home />);

    expect(screen.queryByLabelText("Tu email")).toBeNull();
    expect(screen.getByText("club@purekinky.es")).toBeTruthy();
    await user.click(screen.getByLabelText(/Acepto recibir comunicaciones de PureClub/i));
    await user.click(screen.getByRole("button", { name: /unirme/i }));

    expect(mutateAsync).toHaveBeenCalledWith({ consent: true, consentVersion: "2026-08-28" });
    expect(screen.getByRole("status").textContent).toMatch(/Estás dentro/i);
  });

  it("dirige al inicio de sesión a un visitante antes de permitir el alta", async () => {
    const user = userEvent.setup();
    render(<Home />);

    await user.click(screen.getByRole("button", { name: /entrar para unirme/i }));

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(authMock.startLogin).toHaveBeenCalledOnce();
    expect(screen.getByRole("status").textContent).toBe("Inicia sesión o crea una cuenta para unirte a PureClub.");
  });

  it("explica que la sesión necesita email sin invocar el servidor", async () => {
    const user = userEvent.setup();
    authMock.state = { user: { name: "Club", role: "user" }, loading: false, isAuthenticated: true, logout: vi.fn() };
    render(<Home />);

    await user.click(screen.getByLabelText(/Acepto recibir comunicaciones de PureClub/i));
    await user.click(screen.getByRole("button", { name: /unirme/i }));

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toMatch(/cuenta no tiene un email válido/i);
  });

  it("no expone el error técnico del servidor al rechazar una inscripción", async () => {
    const user = userEvent.setup();
    authMock.state = { user: { name: "Club", email: "club@purekinky.es", role: "user" }, loading: false, isAuthenticated: true, logout: vi.fn() };
    mutateAsync.mockRejectedValueOnce(new Error('[{"code":"bad_request","message":"invalid account email"}]'));
    render(<Home />);

    await user.click(screen.getByLabelText(/Acepto recibir comunicaciones de PureClub/i));
    await user.click(screen.getByRole("button", { name: /unirme/i }));

    expect(screen.getByRole("status").textContent).toBe("No hemos podido registrar tu email. Revisa la dirección e inténtalo de nuevo.");
  });

  it("abre contacto, FAQ y documentos legales desde el footer y enlaza el Instagram real", async () => {
    const user = userEvent.setup();
    render(<Home />);

    expect(screen.getByRole("link", { name: /Instagram/i }).getAttribute("href")).toBe("https://www.instagram.com/fumones.shop/");
    await user.click(screen.getByRole("button", { name: "Contacto" }));
    const contactPanel = screen.getByRole("complementary", { name: "contacto" });
    expect(contactPanel).toBeTruthy();
    expect(within(contactPanel).getAllByRole("link", { name: /WhatsApp/i }).some(link => link.getAttribute("href") === "https://wa.me/34722516474")).toBe(true);
    await user.click(screen.getByRole("button", { name: "Cerrar contacto" }));

    await user.click(screen.getByRole("button", { name: "FAQ" }));
    expect(screen.getByRole("complementary", { name: "preguntas frecuentes" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Cerrar preguntas frecuentes" }));
    await user.click(screen.getByRole("button", { name: "Envíos" }));
    expect(screen.getByRole("complementary", { name: "envíos" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Cerrar envíos" }));
    await user.click(screen.getByRole("button", { name: "Devoluciones" }));
    expect(screen.getByRole("complementary", { name: "devoluciones" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Cerrar devoluciones" }));
    await user.click(screen.getByRole("button", { name: "Privacidad" }));
    expect(screen.getByRole("complementary", { name: "privacidad" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Cerrar privacidad" }));
    await user.click(screen.getByRole("button", { name: "Términos" }));
    expect(screen.getByRole("complementary", { name: "términos" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Cerrar términos" }));
  });

  it("permite al administrador abrir el panel y confirmar una campaña entregada", async () => {
    const user = userEvent.setup();
    authMock.state = { user: { name: "Admin", email: "danandgal@yahoo.com", role: "admin" }, loading: false, isAuthenticated: true, logout: vi.fn() };
    newsletterSubscribersMock.data = [{ id: 1, email: "member@example.com", isSubscribed: true, consentedAt: new Date(), consentVersion: "2026-08-28" }, { id: 2, email: "old@example.com", isSubscribed: false, consentedAt: new Date(), consentVersion: "2026-08-28" }];
    campaignMutateAsync.mockResolvedValueOnce({ sent: 2 });
    render(<Home />);

    await user.click(screen.getByRole("button", { name: "Enviar campaña" }));
    expect(screen.getByRole("heading", { name: /CONTACTOS \(2\)/i })).toBeTruthy();
    expect(screen.getByText("member@example.com")).toBeTruthy();
    expect(screen.getByText("old@example.com")).toBeTruthy();
    await user.type(screen.getByLabelText("Asunto"), "DROP 02 / SEÑAL");
    await user.type(screen.getByLabelText("Mensaje"), "Acceso anticipado para el próximo drop de PureClub.");
    await user.click(screen.getByRole("button", { name: "Enviar campaña ahora" }));

    expect(campaignMutateAsync).toHaveBeenCalledWith({ subject: "DROP 02 / SEÑAL", body: "Acceso anticipado para el próximo drop de PureClub." });
    const campaignPanel = document.querySelector(".campaign-panel") as HTMLElement;
    expect(within(campaignPanel).getByRole("status").textContent).toMatch(/2 suscriptores/i);
  });

  it("no renderiza campañas ni contactos para una cuenta no autorizada", async () => {
    authMock.state = { user: { id: 2, name: "Otro", email: "other-admin@example.com", role: "admin" }, loading: false, isAuthenticated: true, logout: vi.fn() };
    newsletterSubscribersMock.data = [{ id: 1, email: "private@example.com", isSubscribed: true, consentedAt: new Date(), consentVersion: "2026-08-28" }];
    render(<Home />);

    expect(screen.queryByText("PureClub / Admin only")).toBeNull();
    expect(screen.queryByRole("heading", { name: /CONTACTOS/i })).toBeNull();
    expect(screen.queryByLabelText("Asunto")).toBeNull();
  });

  it("muestra el error del transporte cuando una campaña no puede confirmarse", async () => {
    const user = userEvent.setup();
    authMock.state = { user: { name: "Admin", email: "danandgal@yahoo.com", role: "admin" }, loading: false, isAuthenticated: true, logout: vi.fn() };
    campaignMutateAsync.mockRejectedValueOnce(new Error("El envío de PureClub todavía no está configurado."));
    render(<Home />);

    await user.click(screen.getByRole("button", { name: "Enviar campaña" }));
    await user.type(screen.getByLabelText("Asunto"), "DROP 02 / SEÑAL");
    await user.type(screen.getByLabelText("Mensaje"), "Acceso anticipado para el próximo drop de PureClub.");
    await user.click(screen.getByRole("button", { name: "Enviar campaña ahora" }));

    const campaignPanel = document.querySelector(".campaign-panel") as HTMLElement;
    expect(within(campaignPanel).getByRole("status").textContent).toBe("El envío de PureClub todavía no está configurado.");
  });

  it("muestra los controles de moderación VIP solo a la cuenta administradora principal", async () => {
    const user = userEvent.setup();
    vipUiMock.status = true;
    vipUiMock.posts = [{ id: 9, authorUserId: 7, body: "Mensaje VIP", createdAt: new Date("2026-08-28T00:00:00Z"), authorName: "Miembro" }];
    vipUiMock.members = [{ userId: 7, name: "Miembro", email: "member@example.com", bannedAt: null }];
    authMock.state = { user: { id: 1, name: "Admin", email: "danandgal@yahoo.com", role: "admin" }, loading: false, isAuthenticated: true, logout: vi.fn() };
    render(<Home />);

    await user.click(screen.getAllByRole("button").find(button => button.textContent?.trim() === "VIP")!);
    expect(screen.getByRole("button", { name: "Borrar mensaje de Miembro" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Bloquear a Miembro" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /MODERAR VIP/i })).toBeTruthy();
  });

  it("permite a cualquier miembro VIP publicar y silenciar o activar los avisos del chat", async () => {
    const user = userEvent.setup();
    vipUiMock.status = true;
    authMock.state = { user: { id: 7, name: "Miembro", email: "member@example.com", role: "user" }, loading: false, isAuthenticated: true, logout: vi.fn() };
    render(<Home />);
    await user.click(screen.getAllByRole("button").find(button => button.textContent?.trim() === "VIP")!);
    expect(screen.getByLabelText("Publicar en el foro")).toBeTruthy();
    const silenceButton = screen.getByRole("button", { name: "Silenciar notificaciones del chat VIP" });
    await user.click(silenceButton);
    expect(screen.getByRole("button", { name: "Activar notificaciones del chat VIP" })).toBeTruthy();
    expect(window.localStorage.getItem("purekinky-vip-notifications")).toBe("off");
    await user.click(screen.getByRole("button", { name: "Activar notificaciones del chat VIP" }));
    expect(window.localStorage.getItem("purekinky-vip-notifications")).toBeNull();
  });
  it("muestra nueva actividad VIP al moderador cuando publica otro miembro", async () => {
    const user = userEvent.setup();
    vipUiMock.status = true;
    authMock.state = { user: { id: 1, name: "Admin", email: "danandgal@yahoo.com", role: "admin" }, loading: false, isAuthenticated: true, logout: vi.fn() };
    const { rerender } = render(<Home />);
    await user.click(screen.getAllByRole("button").find(button => button.textContent?.trim() === "VIP")!);
    vipUiMock.posts = [{ id: 21, authorUserId: 7, body: "Tengo una duda sobre el drop", createdAt: new Date("2026-08-28T00:00:00Z"), authorName: "Miembro" }];
    rerender(<Home />);
    await waitFor(() => expect(screen.getByText(/NUEVA ACTIVIDAD · 1/i)).toBeTruthy());
  });

  it("oculta los controles de moderación a un usuario que no es el administrador principal", async () => {
    const user = userEvent.setup();
    vipUiMock.status = true;
    vipUiMock.posts = [{ id: 9, authorUserId: 7, body: "Mensaje VIP", createdAt: new Date("2026-08-28T00:00:00Z"), authorName: "Miembro" }];
    authMock.state = { user: { id: 2, name: "Otro", email: "other-admin@example.com", role: "admin" }, loading: false, isAuthenticated: true, logout: vi.fn() };
    render(<Home />);

    await user.click(screen.getAllByRole("button").find(button => button.textContent?.trim() === "VIP")!);
    expect(screen.queryByRole("button", { name: "Borrar mensaje de Miembro" })).toBeNull();
    expect(screen.queryByRole("heading", { name: /MODERAR VIP/i })).toBeNull();
  });

  it("muestra los controles de sesión correctos para visitantes y miembros", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Home />);
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(authMock.startLogin).toHaveBeenCalledOnce();
    unmount();

    const logout = vi.fn();
    authMock.state = { user: { name: "Pure", email: "pure@purekinky.es", role: "user" }, loading: false, isAuthenticated: true, logout };
    render(<Home />);
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(logout).toHaveBeenCalledOnce();
  });
});
