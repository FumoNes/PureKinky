import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { assertSiteAccess } from "./maintenance";
import type { TrpcContext } from "./context";

const PRIMARY_ADMIN_EMAIL = "danandgal@yahoo.com";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    const accountEmail = ctx.user?.email?.trim().toLowerCase();
    if (!ctx.user || ctx.user.role !== "admin" || accountEmail !== PRIMARY_ADMIN_EMAIL) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

const requireSiteAccess = t.middleware(async opts => {
  const { ctx, next } = opts;

  await assertSiteAccess(ctx.user);

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const siteProtectedProcedure = t.procedure.use(requireSiteAccess);

