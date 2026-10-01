import { TRPCError } from "@trpc/server";
import { getSiteSettings } from "../db";

const PRIMARY_ADMIN_EMAIL = "danandgal@yahoo.com";

export async function assertSiteAccess(user: {
  role: "user" | "admin";
  email: string | null;
} | null) {
  const settings = await getSiteSettings();

  // La web está abierta.
  if (!settings.maintenanceEnabled) {
    return;
  }

  // El administrador principal siempre puede acceder.
  const accountEmail = user?.email?.trim().toLowerCase();

  if (
    user?.role === "admin" &&
    accountEmail === PRIMARY_ADMIN_EMAIL
  ) {
    return;
  }

  // Si hay una fecha de finalización y ya ha pasado,
  // consideramos que la web vuelve a estar abierta.
  if (
    settings.maintenanceEndsAt &&
    settings.maintenanceEndsAt.getTime() <= Date.now()
  ) {
    return;
  }

  throw new TRPCError({
    code: "FORBIDDEN",
    message: "La web está temporalmente cerrada.",
  });
}