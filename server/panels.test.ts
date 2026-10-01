import { describe, expect, it } from "vitest";
import { closePanels, openPanel } from "../shared/panels";

describe("paneles interactivos de PureKinky", () => {
  it("abre el menú y lo cierra sin dejar un panel activo", () => {
    expect(openPanel("menu")).toBe("menu");
    expect(closePanels()).toBeNull();
  });

  it("abre el pedido y lo cierra sin dejar un panel activo", () => {
    expect(openPanel("cart")).toBe("cart");
    expect(closePanels()).toBeNull();
  });
});
