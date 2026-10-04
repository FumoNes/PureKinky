import { and, asc, desc, eq, gt, isNull, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  authSessions,
  passwordResetTokens,
  User,
  newsletterSubscribers,
  shoppingCartItems,
  users,
  siteSettings,
  productPrices,
  vipAccessGrants,
  vipBans,
  vipForumPosts,
  vipQuizCompletions,
} from "../drizzle/schema";

import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}


export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function subscribeToNewsletter(email: string, consentVersion: string) {
  const db = await getDb();
  if (!db) throw new Error("La suscripción no está disponible en este momento.");

  const existing = await db
    .select({ id: newsletterSubscribers.id, isSubscribed: newsletterSubscribers.isSubscribed })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].isSubscribed) return { status: "existing" as const };
    await db.update(newsletterSubscribers)
      .set({ isSubscribed: true, consentedAt: new Date(), consentVersion })
      .where(eq(newsletterSubscribers.id, existing[0].id));
    return { status: "renewed" as const };
  }

  await db.insert(newsletterSubscribers).values({ email, consentedAt: new Date(), consentVersion });
  return { status: "created" as const };
}

export async function listNewsletterSubscribers() {
  const db = await getDb();
  if (!db) throw new Error("La lista de PureClub no está disponible en este momento.");
  return db
    .select({ id: newsletterSubscribers.id, email: newsletterSubscribers.email, isSubscribed: newsletterSubscribers.isSubscribed, consentedAt: newsletterSubscribers.consentedAt, consentVersion: newsletterSubscribers.consentVersion })
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.consentedAt));
}

export async function listSubscribedEmails() {
  const db = await getDb();
  if (!db) throw new Error("La lista de PureClub no está disponible en este momento.");
  const rows = await db
    .select({ email: newsletterSubscribers.email })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.isSubscribed, true));
  return rows.map(row => row.email);
}

export async function hasVipQuizCompletion(userId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select({ id: vipQuizCompletions.id })
    .from(vipQuizCompletions)
    .where(eq(vipQuizCompletions.userId, userId))
    .limit(1);
  return result.length > 0;
}

export async function recordVipQuizCompletion(userId: number, score: number) {
  const db = await getDb();
  if (!db) throw new Error("La validación VIP no está disponible en este momento.");
  await db.insert(vipQuizCompletions).values({ userId, score }).onDuplicateKeyUpdate({ set: { score, completedAt: new Date() } });
  return { completed: true as const, score };
}

export async function grantVipAccess(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("El acceso VIP no está disponible en este momento.");
  const existing = await db
    .select({ id: vipAccessGrants.id })
    .from(vipAccessGrants)
    .where(eq(vipAccessGrants.userId, userId))
    .limit(1);
  if (existing.length === 0) await db.insert(vipAccessGrants).values({ userId });
  return { granted: true as const };
}

export async function hasVipAccess(userId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select({ id: vipAccessGrants.id })
    .from(vipAccessGrants)
    .where(and(eq(vipAccessGrants.userId, userId)))
    .limit(1);
  return result.length > 0;
}

export async function isVipUserBanned(userId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select({ id: vipBans.id }).from(vipBans).where(eq(vipBans.userId, userId)).limit(1);
  return result.length > 0;
}

export async function listVipModerationMembers() {
  const db = await getDb();
  if (!db) throw new Error("La moderación VIP no está disponible en este momento.");
  return db
    .select({ userId: users.id, name: users.name, email: users.email, bannedAt: vipBans.bannedAt })
    .from(users)
    .innerJoin(vipAccessGrants, eq(vipAccessGrants.userId, users.id))
    .leftJoin(vipBans, eq(vipBans.userId, users.id))
    .orderBy(asc(users.name));
}

export async function banVipUser(userId: number, bannedByUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("La moderación VIP no está disponible en este momento.");
  await db.insert(vipBans).values({ userId, bannedByUserId }).onDuplicateKeyUpdate({ set: { bannedByUserId, bannedAt: new Date() } });
  return { banned: true as const };
}

export async function unbanVipUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("La moderación VIP no está disponible en este momento.");
  await db.delete(vipBans).where(eq(vipBans.userId, userId));
  return { unbanned: true as const };
}

export async function deleteVipForumPost(postId: number) {
  const db = await getDb();
  if (!db) throw new Error("La moderación VIP no está disponible en este momento.");
  await db.delete(vipForumPosts).where(eq(vipForumPosts.id, postId));
  return { deleted: true as const };
}

export async function listVipForumPosts() {
  const db = await getDb();
  if (!db) throw new Error("El foro VIP no está disponible en este momento.");
  return db
    .select({
      id: vipForumPosts.id,
      authorUserId: users.id,
      body: vipForumPosts.body,
      createdAt: vipForumPosts.createdAt,
      authorName: users.name,
    })
    .from(vipForumPosts)
    .leftJoin(users, eq(vipForumPosts.userId, users.id))
    .leftJoin(vipBans, eq(vipForumPosts.userId, vipBans.userId))
    .where(isNull(vipBans.userId))
    .orderBy(desc(vipForumPosts.createdAt))
    .limit(60);
}

export async function createVipForumPost(userId: number, body: string) {
  const db = await getDb();
  if (!db) throw new Error("El foro VIP no está disponible en este momento.");
  await db.insert(vipForumPosts).values({ userId, body });
  return { created: true as const };
}

export type SavedCartItem = { productId: string; size: string; playerName: string; playerNumber: string; quantity: number };

export async function getShoppingCart(userId: number): Promise<SavedCartItem[]> {
  const db = await getDb();
  if (!db) throw new Error("El carrito no está disponible en este momento.");
  return db
    .select({ productId: shoppingCartItems.productId, size: shoppingCartItems.size, playerName: shoppingCartItems.playerName, playerNumber: shoppingCartItems.playerNumber, quantity: shoppingCartItems.quantity })
    .from(shoppingCartItems)
    .where(eq(shoppingCartItems.userId, userId))
    .orderBy(desc(shoppingCartItems.updatedAt));
}

export async function saveShoppingCart(userId: number, items: SavedCartItem[]) {
  const db = await getDb();
  if (!db) throw new Error("El carrito no está disponible en este momento.");
  await db.delete(shoppingCartItems).where(eq(shoppingCartItems.userId, userId));
  if (items.length > 0) await db.insert(shoppingCartItems).values(items.map(item => ({ userId, ...item })));
  return { saved: items.length };
}

export async function getSiteSettings() {
  const db = await getDb();

  if (!db) {
    throw new Error("La configuración de la web no está disponible.");
  }

  const rows = await db
    .select()
    .from(siteSettings)
    .limit(1);

  if (rows.length > 0) {
    return rows[0];
  }

  await db.insert(siteSettings).values({
    maintenanceEnabled: false,
    maintenanceTitle: "ACCESS LOCKED",
    maintenanceMessage:
      "El próximo acceso estará disponible muy pronto.",
  });

  const created = await db
    .select()
    .from(siteSettings)
    .limit(1);

  return created[0];
}

export async function updateSiteSettings(data: {
  maintenanceEnabled?: boolean;
  maintenanceEndsAt?: Date | null;
  maintenanceTitle?: string;
  maintenanceMessage?: string | null;
}) {
  const db = await getDb();

  if (!db) {
    throw new Error("La configuración de la web no está disponible.");
  }

  const current = await getSiteSettings();

  await db
    .update(siteSettings)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, current.id));

  return getSiteSettings();
}

export async function getProductPrices() {
  const db = await getDb();

  if (!db) {
    throw new Error("Los precios no están disponibles.");
  }

  return db
    .select()
    .from(productPrices);
}

export async function upsertProductPrice(
  productId: string,
  priceCents: number,
) {
  const db = await getDb();

  if (!db) {
    throw new Error("Los precios no están disponibles en este momento.");
  }

  await db
    .insert(productPrices)
    .values({
      productId,
      price: priceCents,
    })
    .onDuplicateKeyUpdate({
      set: {
        price: priceCents,
        updatedAt: new Date(),
      },
    });

  const rows = await db
    .select({
      productId: productPrices.productId,
      priceCents: productPrices.price,
      updatedAt: productPrices.updatedAt,
    })
    .from(productPrices)
    .where(eq(productPrices.productId, productId))
    .limit(1);

  return rows[0] ?? null;
}

export async function getAuthSession(tokenHash: string) {
  const db = await getDb();

  if (!db) return null;

  const result = await db
    .select({
      session: authSessions,
      user: users,
    })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .where(
      and(
        eq(authSessions.tokenHash, tokenHash),
gt(authSessions.expiresAt, new Date())      )
    )
    .limit(1);

  return result[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return rows[0] ?? null;
}

export async function getUserById(userId: number): Promise<User | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return rows[0] ?? null;
}

export async function createPureKinkyUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<User> {
  const db = await getDb();

  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(users).values({
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    emailVerified: false,
    loginMethod: "purekinky",
    role: "user",
  });

  const userId = Number(result[0].insertId);

  const user = await getUserById(userId);

  if (!user) {
    throw new Error("Failed to create user");
  }

  return user;
}

export async function updateUserPassword(
  userId: number,
  passwordHash: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function updateUserProfile(
  userId: number,
  data: {
    name?: string;
    email?: string;
  }
): Promise<User | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.email !== undefined ? { email: data.email } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return getUserById(userId);
}

export async function createAuthSession(
  userId: number,
  tokenHash: string,
  expiresAt: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(authSessions).values({
    userId,
    tokenHash,
    expiresAt,
  });
}

export async function deleteAuthSession(tokenHash: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(authSessions)
    .where(eq(authSessions.tokenHash, tokenHash));
}

export async function deleteUserAuthSessions(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(authSessions)
    .where(eq(authSessions.userId, userId));
}

export async function createPasswordResetToken(
  userId: number,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(passwordResetTokens).values({
    userId,
    tokenHash,
    expiresAt,
  });
}

export async function getPasswordResetToken(tokenHash: string) {
  const db = await getDb();
  if (!db) return null;

  const rows = await db
    .select({
      token: passwordResetTokens,
      user: users,
    })
    .from(passwordResetTokens)
    .innerJoin(users, eq(passwordResetTokens.userId, users.id))
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        gt(passwordResetTokens.expiresAt, new Date()),
        isNull(passwordResetTokens.usedAt),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function markPasswordResetTokenUsed(
  tokenHash: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(passwordResetTokens)
    .set({
      usedAt: new Date(),
    })
    .where(eq(passwordResetTokens.tokenHash, tokenHash));
}