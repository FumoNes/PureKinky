import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const homePath = new URL("../client/src/pages/Home.tsx", import.meta.url);
const cssPath = new URL("../client/src/index.css", import.meta.url);

describe("inicio PureKinky: accesibilidad y pedido", () => {
  it("incluye un salto de teclado y controles nombrados para menú y pedido", async () => {
    const source = await readFile(homePath, "utf8");

    expect(source).toContain('className="skip-link"');
    expect(source).toContain('aria-label="Abrir pedido"');
    expect(source).toContain('aria-label="Abrir menú"');
    expect(source).toContain('aria-label="Cerrar pedido"');
  });

  it("genera una confirmación de WhatsApp que incluye el pago por Bizum", async () => {
    const source = await readFile(homePath, "utf8");

    expect(source).toContain("createBizumWhatsAppUrl");
    expect(source).toContain("BIZUM_NUMBER");
    expect(source).toContain("Confirmar por WhatsApp");
  });

  it("define una señal de foco visible para los controles interactivos", async () => {
    const css = await readFile(cssPath, "utf8");

    expect(css).toContain("button:focus-visible");
    expect(css).toContain("outline: 2px solid #ff78be");
  });
});
