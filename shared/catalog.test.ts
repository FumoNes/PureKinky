import { describe, expect, it } from "vitest";
import { catalogCategories, catalogProducts, formatPrice } from "./catalog";

describe("catálogo PureKinky", () => {
  it("expone productos comprables con sus datos de presentación", () => {
    expect(catalogProducts.length).toBeGreaterThan(0);
    catalogProducts.forEach(product => {
      expect(product.id).toBeTruthy();
      expect(product.name).toBeTruthy();
      expect(product.price).toBeGreaterThan(0);
      expect(product.image).toMatch(/^\/manus-storage\//);
    });
  });

  it("deriva filtros de categorías que cubren los productos del catálogo", () => {
    expect(catalogCategories).toContain("Todo");
    expect(catalogCategories).toContain("Sudaderas");
    expect(catalogCategories).toContain("Camisetas");
    expect(catalogCategories).toContain("Accesorios");
  });

  it("presenta los precios en euros para el flujo de Bizum", () => {
    expect(formatPrice(68)).toBe("68 €");
  });
});
