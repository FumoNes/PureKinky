import { describe, expect, it } from "vitest";
import { catalogCategories, catalogProducts, formatPrice } from "../shared/catalog";

describe("catálogo PureKinky", () => {
  it("expone productos comprables con los datos necesarios para la interfaz", () => {
    expect(catalogProducts.length).toBeGreaterThan(0);
    catalogProducts.forEach(product => {
      expect(product.id).toBeTruthy();
      expect(product.name).toBeTruthy();
      expect(product.price).toBe(30);
      expect(product.image).toMatch(/^\/manus-storage\/purekinky-drop-01-/);
      expect(product.sizes).toEqual(["12", "14", "XS", "S", "M", "L", "XL", "2XL"]);
    });
  });

  it("deriva filtros que cubren todas las categorías previstas", () => {
    expect(catalogCategories).toEqual(["Todo", "Camisetas"]);
  });

  it("formatea los totales del pedido directo en euros", () => {
    expect(formatPrice(30)).toBe("30 €");
  });
});
