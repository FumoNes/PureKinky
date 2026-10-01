export type CatalogProduct = {
  id: string;
  name: string;
  price: number | null;
  category: string;
  label: string;
  availability: string;
  description: string;
  image: string;
  hoverImage: string;
  imageAlt: string;
  sizes: string[];
  featured?: boolean;
};

export const catalogProducts: CatalogProduct[] = [
  {
    id: "camiseta-drop-1-golfo-puro",
    name: "Camiseta Drop 1 x Golfo & Puro",
    price: 29.99,
    category: "Camisetas",
    label: "Drop 01",
    availability: "Disponible ahora",
    description: "PureKinky x Golfo & Puro. Rosa, negro y animal print para jugar fuera del guion.",
    image: "https://res.cloudinary.com/ly6rnez4/image/upload/f_auto,q_auto/parking_1ratirada",
    hoverImage: "https://res.cloudinary.com/ly6rnez4/image/upload/f_auto,q_auto/espalda_parking",
    imageAlt: "Modelo con la camiseta rosa Drop 1 de PureKinky y Golfo & Puro en una campaña nocturna",
    sizes: ["12", "14", "XS", "S", "M", "L", "XL", "2XL"],
    featured: true,
  },
];

export const catalogCategories = ["Todo", ...Array.from(new Set(catalogProducts.map(product => product.category)))];

export function formatPrice(amount: number | null) {
  if (amount === null) return "PVP por confirmar";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);
}
