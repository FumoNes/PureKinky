import { TRPCError } from "@trpc/server";
import { getSiteSettings } from "../db";

const PRIMARY_ADMIN_EMAIL = "danandgal@yahoo.com";

export async function assertSiteAccess(
  user: {
    role: "user" | "admin";
    email: string | null;
  } | null,
  path?: string
) {
  const settings = await getSiteSettings();

  // Si el mantenimiento está desactivado, la web está abierta.
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
  // consideramos que el bloqueo ha terminado.
  if (
    settings.maintenanceEndsAt &&
    settings.maintenanceEndsAt.getTime() <= Date.now()
  ) {
    return;
  }

  const maintenanceMode =
    settings.maintenanceMode === "purefilms"
      ? "purefilms"
      : "all";

  // Si solo está bloqueado PureFilms,
  // el resto de la web continúa funcionando.
  if (
    maintenanceMode === "purefilms" &&
    path !== "/purefilms"
  ) {
    return;
  }

  throw new TRPCError({
    code: "FORBIDDEN",
    message: "La web está temporalmente cerrada.",
  });
}