import { eq } from "drizzle-orm";
import { shoppingCartItems } from "../drizzle/schema.ts";
import { getDb, getShoppingCart, saveShoppingCart } from "../server/db.ts";

const userId = 2_000_000_001;
let exitCode = 0;

try {
  await saveShoppingCart(userId, [{ productId: "camiseta-drop-1-golfo-puro", size: "XL", playerName: "REINA", playerNumber: "7", quantity: 2 }]);
  const restored = await getShoppingCart(userId);
  if (restored.length !== 1 || restored[0]?.playerName !== "REINA" || restored[0]?.playerNumber !== "7" || restored[0]?.quantity !== 2) {
    throw new Error("El carrito personalizado no se restauró como se esperaba.");
  }
  await saveShoppingCart(userId, []);
  const cleared = await getShoppingCart(userId);
  if (cleared.length !== 0) throw new Error("El carrito temporal no se limpió correctamente.");
  console.log(JSON.stringify({ restored: true, personalized: true, cleaned: true }));
} catch (error) {
  console.error(error);
  exitCode = 1;
} finally {
  const db = await getDb();
  if (db) await db.delete(shoppingCartItems).where(eq(shoppingCartItems.userId, userId));
  process.exit(exitCode);
}
