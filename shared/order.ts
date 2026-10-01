import type { CatalogProduct } from "./catalog";

export type Personalization = { playerName: string; playerNumber: string };
export type OrderLine = CatalogProduct & Personalization & { quantity: number; size: string };

export function addProductToOrder(current: OrderLine[], product: CatalogProduct, size: string, personalization: Personalization = { playerName: "", playerNumber: "" }): OrderLine[] {
  const playerName = personalization.playerName.trim().toUpperCase();
  const playerNumber = personalization.playerNumber.replace(/\D/g, "").slice(0, 3);
  const existing = current.find(item => item.id === product.id && item.size === size && item.playerName === playerName && item.playerNumber === playerNumber);
  return existing
    ? current.map(item => item.id === product.id && item.size === size && item.playerName === playerName && item.playerNumber === playerNumber ? { ...item, quantity: item.quantity + 1 } : item)
    : [...current, { ...product, quantity: 1, size, playerName, playerNumber }];
}

export function setOrderQuantity(current: OrderLine[], id: string, size: string, quantity: number, personalization: Personalization = { playerName: "", playerNumber: "" }): OrderLine[] {
  const playerName = personalization.playerName.trim().toUpperCase();
  const playerNumber = personalization.playerNumber.replace(/\D/g, "").slice(0, 3);
  return quantity < 1
    ? current.filter(item => item.id !== id || item.size !== size || item.playerName !== playerName || item.playerNumber !== playerNumber)
    : current.map(item => item.id === id && item.size === size && item.playerName === playerName && item.playerNumber === playerNumber ? { ...item, quantity } : item);
}

export function createBizumWhatsAppUrl(items: OrderLine[], total: string, bizumNumber: string, whatsappNumber: string): string {
  const order = items.map(item => {
    const personalization = [item.playerName && `nombre ${item.playerName}`, item.playerNumber && `dorsal ${item.playerNumber}`].filter(Boolean).join(", ");
    return `${item.quantity} × ${item.name} (talla ${item.size}${personalization ? ` · ${personalization}` : ""})`;
  }).join(", ");
  const message = `Hola PureKinky, quiero confirmar mi pedido: ${order}. Total: ${total}. Haré Bizum al ${bizumNumber}.`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
