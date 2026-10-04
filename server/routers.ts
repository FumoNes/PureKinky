import { COOKIE_NAME } from "@shared/const";
import {
  createAuthSession,
  createPureKinkyUser,
  deleteAuthSession,
  getSiteSettings,
  updateSiteSettings,
  getProductPrices,
upsertProductPrice,
  deleteUserAuthSessions,
  getUserByEmail,
  updateUserPassword,
  updateUserProfile,
} from "./db";
import {
  generateToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "./auth";
import { PUREKINKY_SESSION_COOKIE } from "@shared/const";
import { getPureKinkySessionCookieOptions } from "./_core/cookies";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { normalizeEmail } from "../shared/email";
import { banVipUser, createVipForumPost, deleteVipForumPost, getShoppingCart, grantVipAccess, hasVipAccess, hasVipQuizCompletion, isVipUserBanned, listNewsletterSubscribers, listSubscribedEmails, listVipForumPosts, listVipModerationMembers, recordVipQuizCompletion, saveShoppingCart, subscribeToNewsletter, unbanVipUser } from "./db";
import { sendPureClubCampaign } from "./mailer";
import { isValidVipCode, VIP_QUIZ_ANSWER_KEY } from "./vip";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
  siteProtectedProcedure,
} from "./_core/trpc";

async function assertVipAccess(userId: number) {
  if (await isVipUserBanned(userId) || !await hasVipAccess(userId)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Tu acceso VIP está bloqueado o no está concedido." });
  }
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
  me: publicProcedure.query(opts => opts.ctx.user),
  register: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(100),
        email: z.string().trim().email(),
        password: z.string().min(8).max(128),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const email = normalizeEmail(input.email);

      const existingUser = await getUserByEmail(email);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ya existe una cuenta con ese email.",
        });
      }

      const passwordHash = await hashPassword(input.password);

      const user = await createPureKinkyUser({
        name: input.name,
        email,
        passwordHash,
      });

      const token = generateToken();
      const tokenHash = hashToken(token);

      const expiresAt = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 30,
      );

      await createAuthSession(user.id, tokenHash, expiresAt);

      const cookieOptions = getPureKinkySessionCookieOptions(ctx.req);

      ctx.res.cookie(
        PUREKINKY_SESSION_COOKIE,
        token,
        {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 24 * 30,
        },
      );

      return {
        success: true,
        user,
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().trim().email(),
        password: z.string().min(1).max(128),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const email = normalizeEmail(input.email);

      let user;
try {
  user = await getUserByEmail(email);
} catch (error) {
  console.error("[LOGIN DATABASE ERROR]", error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Error de conexión con la base de datos.",
  });
}

      if (!user?.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email o contraseña incorrectos.",
        });
      }

      const validPassword = await verifyPassword(
        input.password,
        user.passwordHash,
      );

      if (!validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email o contraseña incorrectos.",
        });
      }

      const token = generateToken();
      const tokenHash = hashToken(token);

      const expiresAt = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 30,
      );

      await createAuthSession(user.id, tokenHash, expiresAt);

      const cookieOptions = getPureKinkySessionCookieOptions(ctx.req);

      ctx.res.cookie(
        PUREKINKY_SESSION_COOKIE,
        token,
        {
          ...cookieOptions,
          maxAge: 1000 * 60 * 60 * 24 * 30,
        },
      );

      return {
        success: true,
        user,
      };
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    const token = ctx.req.cookies?.[PUREKINKY_SESSION_COOKIE];

    if (token) {
      await deleteAuthSession(hashToken(token));
    }

    const cookieOptions = getPureKinkySessionCookieOptions(ctx.req);

    ctx.res.clearCookie(PUREKINKY_SESSION_COOKIE, {
      ...cookieOptions,
      maxAge: -1,
    });

    const manusCookieOptions = getSessionCookieOptions(ctx.req);

    ctx.res.clearCookie(COOKIE_NAME, {
      ...manusCookieOptions,
      maxAge: -1,
    });

    return {
      success: true,
    } as const;
  }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8).max(128),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.passwordHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Esta cuenta no tiene una contraseña local.",
        });
      }

      const validPassword = await verifyPassword(
        input.currentPassword,
        ctx.user.passwordHash,
      );

      if (!validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "La contraseña actual no es correcta.",
        });
      }

      const newPasswordHash = await hashPassword(input.newPassword);

      await updateUserPassword(ctx.user.id, newPasswordHash);

      await deleteUserAuthSessions(ctx.user.id);

      return {
        success: true,
      } as const;
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(100).optional(),
        email: z.string().trim().email().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.email) {
        const email = normalizeEmail(input.email);

        const existingUser = await getUserByEmail(email);

        if (existingUser && existingUser.id !== ctx.user.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Ese email ya está utilizado.",
          });
        }

        input.email = email;
      }

      const user = await updateUserProfile(ctx.user.id, input);

      return {
        success: true,
        user,
      };
    }),
}),

site: router({
  settings: publicProcedure.query(() => getSiteSettings()),

  adminSettings: adminProcedure.query(() => getSiteSettings()),

  update: adminProcedure
    .input(
      z.object({
        maintenanceEnabled: z.boolean(),
        maintenanceEndsAt: z.coerce.date().nullable(),
        maintenanceTitle: z.string().trim().min(1).max(120),
        maintenanceMessage: z.string().trim().max(1000).nullable(),
      }),
    )
    .mutation(({ input }) =>
      updateSiteSettings(input),
    ),

    prices: adminProcedure.query(() => getProductPrices()),

updatePrice: adminProcedure
  .input(
    z.object({
      productId: z.string(),
      priceCents: z.number().int().min(0),
    }),
  )
  .mutation(({ input }) =>
    upsertProductPrice(
      input.productId,
      input.priceCents,
    ),
  ),
}),

  newsletter: router({
    subscribe: protectedProcedure
      .input(z.object({ consent: z.literal(true), consentVersion: z.string().min(1).max(32) }))
      .mutation(({ ctx, input }) => {
        const email = normalizeEmail(ctx.user.email ?? "");
        if (!z.string().email().max(320).safeParse(email).success) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Tu cuenta no tiene un email válido." });
        }
        return subscribeToNewsletter(email, input.consentVersion);
      }),
    subscribers: adminProcedure.query(() => listNewsletterSubscribers()),
    sendCampaign: adminProcedure
      .input(z.object({ subject: z.string().trim().min(4).max(120), body: z.string().trim().min(10).max(5000) }))
      .mutation(async ({ input }) => {
        const recipients = await listSubscribedEmails();
        if (recipients.length === 0) return { sent: 0 };
        return sendPureClubCampaign(recipients, input.subject, input.body);
      }),
  }),
  cart: router({
  get: protectedProcedure
    .input(z.object({ accountKey: z.number().int().positive() }))
    .query(({ ctx }) => getShoppingCart(ctx.user.id)),

  save: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.string().min(1).max(80),
            size: z.string().min(1).max(16),
            playerName: z.string().trim().max(20),
            playerNumber: z.string().regex(/^\d{0,3}$/),
            quantity: z.number().int().min(1).max(20),
          }),
        ).max(20),
      }),
    )
    .mutation(({ ctx, input }) =>
      saveShoppingCart(ctx.user.id, input.items),
    ),
}),
  vip: router({
      status: protectedProcedure.query(async ({ ctx }) => !await isVipUserBanned(ctx.user.id) && await hasVipAccess(ctx.user.id)),
      quiz: router({
        status: protectedProcedure.query(async ({ ctx }) => ({ completed: await hasVipQuizCompletion(ctx.user.id) })),
        submit: protectedProcedure
          .input(z.object({ answers: z.array(z.number().int().min(0).max(3)).length(VIP_QUIZ_ANSWER_KEY.length) }))
          .mutation(async ({ ctx, input }) => {
            const score = input.answers.reduce((total, answer, index) => total + (answer === VIP_QUIZ_ANSWER_KEY[index] ? 1 : 0), 0);
            if (score !== VIP_QUIZ_ANSWER_KEY.length) return { completed: false as const, score };
            return recordVipQuizCompletion(ctx.user.id, score);
          }),
      }),
      unlock: protectedProcedure
  .input(z.object({ code: z.string().trim().min(1).max(64) }))
  .mutation(async ({ ctx, input }) => {
    if (await isVipUserBanned(ctx.user.id)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Tu acceso VIP está bloqueado.",
      });
    }

    if (!isValidVipCode(input.code)) {
      return { granted: false as const };
    }

    return grantVipAccess(ctx.user.id);
  }),
    forum: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        await assertVipAccess(ctx.user.id);
        return listVipForumPosts();
      }),
      publish: protectedProcedure
        .input(z.object({ body: z.string().trim().min(1).max(800) }))
        .mutation(async ({ ctx, input }) => {
          await assertVipAccess(ctx.user.id);
          return createVipForumPost(ctx.user.id, input.body.trim());
        }),
    }),
    moderation: router({
      members: adminProcedure.query(() => listVipModerationMembers()),
      deletePost: adminProcedure
        .input(z.object({ postId: z.number().int().positive() }))
        .mutation(({ input }) => deleteVipForumPost(input.postId)),
      banUser: adminProcedure
        .input(z.object({ userId: z.number().int().positive() }))
        .mutation(async ({ ctx, input }) => {
          if (input.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "La cuenta administradora no se puede bloquear." });
          return banVipUser(input.userId, ctx.user.id);
        }),
      unbanUser: adminProcedure
        .input(z.object({ userId: z.number().int().positive() }))
        .mutation(({ input }) => unbanVipUser(input.userId)),
    }),
  }),
});

export type AppRouter = typeof appRouter;
