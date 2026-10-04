import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, unique, varchar } from "drizzle-orm/mysql-core";



/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),

  openId: varchar("openId", { length: 64 }).unique(),

  name: text("name"),

  email: varchar("email", { length: 320 }),

  passwordHash: varchar("passwordHash", { length: 255 }),

  emailVerified: boolean("emailVerified").default(false).notNull(),

  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),

  maintenanceEnabled: boolean("maintenanceEnabled")
    .default(false)
    .notNull(),

  maintenanceMode: varchar("maintenanceMode", {
  length: 20,
})
  .default("all")
  .notNull(),  

  maintenanceEndsAt: timestamp("maintenanceEndsAt"),

  maintenanceTitle: varchar("maintenanceTitle", {
    length: 120,
  }).default("PRÓXIMO DROP").notNull(),

  maintenanceMessage: text("maintenanceMessage"),

  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .onUpdateNow()
    .notNull(),
});

export type SiteSettings = typeof siteSettings.$inferSelect;

export const authSessions = mysqlTable(
  "auth_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("auth_sessions_user_id_idx").on(table.userId),
    index("auth_sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export type AuthSession = typeof authSessions.$inferSelect;


export const passwordResetTokens = mysqlTable(
  "password_reset_tokens",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expiresAt").notNull(),
    usedAt: timestamp("usedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("password_reset_tokens_user_id_idx").on(table.userId),
    index("password_reset_tokens_expires_at_idx").on(table.expiresAt),
  ],
);

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export const newsletterSubscribers = mysqlTable("newsletterSubscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  isSubscribed: boolean("isSubscribed").default(true).notNull(),
  consentedAt: timestamp("consentedAt"),
  consentVersion: varchar("consentVersion", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

export const vipAccessGrants = mysqlTable("vipAccessGrants", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  grantedAt: timestamp("grantedAt").defaultNow().notNull(),
}, table => [unique("vipAccessGrants_userId_unique").on(table.userId)]);

export type VipAccessGrant = typeof vipAccessGrants.$inferSelect;

export const vipQuizCompletions = mysqlTable("vipQuizCompletions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  score: int("score").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
}, table => [unique("vipQuizCompletions_userId_unique").on(table.userId)]);

export type VipQuizCompletion = typeof vipQuizCompletions.$inferSelect;

export const vipForumPosts = mysqlTable("vipForumPosts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("vipForumPosts_createdAt_idx").on(table.createdAt)]);

export type VipForumPost = typeof vipForumPosts.$inferSelect;

export const vipBans = mysqlTable("vipBans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bannedByUserId: int("bannedByUserId").notNull(),
  bannedAt: timestamp("bannedAt").defaultNow().notNull(),
}, table => [unique("vipBans_userId_unique").on(table.userId)]);

export type VipBan = typeof vipBans.$inferSelect;

export const shoppingCartItems = mysqlTable("shoppingCartItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: varchar("productId", { length: 80 }).notNull(),
  size: varchar("size", { length: 16 }).notNull(),
  playerName: varchar("playerName", { length: 20 }).notNull().default(""),
  playerNumber: varchar("playerNumber", { length: 3 }).notNull().default(""),
  quantity: int("quantity").notNull().default(1),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [unique("shoppingCartItems_variant_unique").on(table.userId, table.productId, table.size, table.playerName, table.playerNumber)]);

export type ShoppingCartItem = typeof shoppingCartItems.$inferSelect;

export const productPrices = mysqlTable("productPrices", {
  id: int("id").autoincrement().primaryKey(),

  productId: varchar("productId", { length: 80 })
    .notNull()
    .unique(),

  price: int("priceCents").notNull(),

  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .onUpdateNow()
    .notNull(),
});

export type ProductPrice = typeof productPrices.$inferSelect;
export type InsertProductPrice = typeof productPrices.$inferInsert;