import { eq } from "drizzle-orm";
import { newsletterSubscribers } from "../drizzle/schema.ts";
import { getDb } from "../server/db.ts";
import { appRouter } from "../server/routers.ts";

const email = `pureclub.integration.${Date.now()}@example.test`;
const copiedEmail = `${email}\u200B\uFEFF`;
const ctx = { user: { id: 1, email, role: "user" }, req: {}, res: {} };
const caller = appRouter.createCaller(ctx);
let exitCode = 0;
let db;

try {
  const created = await caller.newsletter.subscribe({
    consent: true,
    consentVersion: "2026-08-28",
  });

  db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible para la comprobación.");

  await db
    .update(newsletterSubscribers)
    .set({ isSubscribed: false })
    .where(eq(newsletterSubscribers.email, email));
  const renewed = await caller.newsletter.subscribe({
    consent: true,
    consentVersion: "2026-08-28",
  });

  const rows = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);
  const subscriber = rows[0];
  if (!subscriber?.isSubscribed || !subscriber.consentedAt || subscriber.consentVersion !== "2026-08-28") {
    throw new Error("La suscripción no conservó el consentimiento esperado.");
  }

  if (created.status !== "created" || renewed.status !== "renewed") {
    throw new Error("La alta o reactivación no devolvió el estado esperado.");
  }
  console.log(JSON.stringify({ created: created.status, renewed: renewed.status, persisted: true, consentVersion: subscriber.consentVersion }));
} catch (error) {
  console.error(error);
  exitCode = 1;
} finally {
  if (db) await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
  process.exit(exitCode);
}
