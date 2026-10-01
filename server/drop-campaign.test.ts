import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { catalogProducts } from "../shared/catalog";

const homePath = new URL("../client/src/pages/Home.tsx", import.meta.url);
const campaignAssets = {
  front: "/manus-storage/purekinky-drop-01-model-hero_0381ed6e.webp",
  back: "/manus-storage/purekinky-drop-01-model-back_15d97ea1.webp",
  street: "/manus-storage/purekinky-drop-01-model-street_567e7264.webp",
};

describe("campaña visual del Drop 01", () => {
  it("conserva la imagen frontal y la trasera en el producto único", () => {
    expect(catalogProducts).toHaveLength(1);
    expect(catalogProducts[0]).toMatchObject({
      name: "Camiseta Drop 1 x Golfo & Puro",
      price: 30,
      image: campaignAssets.front,
      hoverImage: campaignAssets.back,
    });
  });

  it("asigna los assets de campaña al hero y lookbook sin reintroducir Focus piece", async () => {
    const source = await readFile(homePath, "utf8");

    expect(source).toContain(campaignAssets.front);
    expect(source).toContain(campaignAssets.back);
    expect(source).toContain(campaignAssets.street);
    expect(source).toContain("hero__media");
    expect(source).not.toContain("Focus piece / 01");
    expect(source).not.toContain("statement-product__visual--main");
    expect(source).toContain("lookbook__image--one");
    expect(source).toContain("lookbook__image--two");
  });

  it("conecta Drop In directamente con Lookbook sin una sección editorial intermedia", async () => {
    const source = await readFile(homePath, "utf8");
    const showcaseStart = source.indexOf('className="drop-showcase"');
    const lookbookStart = source.indexOf('className="lookbook section"');
    const transition = source.slice(showcaseStart, lookbookStart);

    expect(showcaseStart).toBeGreaterThan(-1);
    expect(lookbookStart).toBeGreaterThan(showcaseStart);
    expect(transition).not.toContain("statement-product");
    expect(transition).not.toContain("Focus piece");
  });
});
