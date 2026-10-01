import { describe, expect, it } from "vitest";
import { catalogProducts, formatPrice } from "../shared/catalog";
import { contrastRatio } from "../shared/contrast";
import { addProductToOrder, createBizumWhatsAppUrl, setOrderQuantity } from "../shared/order";

describe("flujo de pedido PureKinky", () => {
  const tee = catalogProducts[0]!;

  it("añade, incrementa y elimina líneas del pedido", () => {
    const initial = addProductToOrder([], tee, "M");
    const increased = addProductToOrder(initial, tee, "M");
    const withTee = addProductToOrder(increased, tee, "M");

    expect(withTee).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: tee.id, quantity: 3 }),
    ]));
    expect(setOrderQuantity(withTee, tee.id, "M", 0)).toEqual([]);
  });

  it("mantiene líneas independientes cuando una misma camiseta se añade en tallas distintas", () => {
    const medium = addProductToOrder([], tee, "M");
    const multiSize = addProductToOrder(medium, tee, "L");
    const mediumIncreased = addProductToOrder(multiSize, tee, "M");

    expect(mediumIncreased).toEqual(expect.arrayContaining([
      expect.objectContaining({ size: "M", quantity: 2 }),
      expect.objectContaining({ size: "L", quantity: 1 }),
    ]));
    expect(setOrderQuantity(mediumIncreased, tee.id, "M", 0)).toEqual([expect.objectContaining({ size: "L", quantity: 1 })]);
  });

  it("mantiene personalizaciones distintas como variantes independientes de la misma talla", () => {
    const first = addProductToOrder([], tee, "M", { playerName: "Reina", playerNumber: "7" });
    const both = addProductToOrder(first, tee, "M", { playerName: "Rosa", playerNumber: "10" });
    const repeated = addProductToOrder(both, tee, "M", { playerName: "Reina", playerNumber: "7" });

    expect(repeated).toEqual(expect.arrayContaining([
      expect.objectContaining({ size: "M", playerName: "REINA", playerNumber: "7", quantity: 2 }),
      expect.objectContaining({ size: "M", playerName: "ROSA", playerNumber: "10", quantity: 1 }),
    ]));
  });

  it("prepara una URL de confirmación por WhatsApp con el total y el Bizum", () => {
    const order = addProductToOrder([], tee, "L");
    const url = createBizumWhatsAppUrl(order, formatPrice(tee.price), "722516474", "34722516474");

    expect(url).toMatch(/^https:\/\/wa\.me\/34722516474\?text=/);
    expect(decodeURIComponent(url)).toContain("1 × Camiseta Drop 1 x Golfo & Puro (talla L)");
    expect(decodeURIComponent(url)).toContain("30 €");
    expect(decodeURIComponent(url)).toContain("Bizum al 722516474");
  });

  it("incluye nombre y dorsal personalizados en la confirmación por WhatsApp", () => {
    const order = addProductToOrder([], tee, "L", { playerName: "Reina", playerNumber: "7" });
    const url = createBizumWhatsAppUrl(order, formatPrice(tee.price), "722516474", "34722516474");

    expect(decodeURIComponent(url)).toContain("talla L · nombre REINA, dorsal 7");
  });

  it("mantiene contraste suficiente para los textos y CTAs clave", () => {
    expect(contrastRatio("#ffffff", "#0d0d0d")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#ff3fa4", "#0d0d0d")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#0d0d0d", "#ff3fa4")).toBeGreaterThanOrEqual(4.5);
  });
});
