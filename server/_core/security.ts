import type { NextFunction, Request, Response } from "express";

type RateLimitEntry = { count: number; resetAt: number };

const apiRateLimit = new Map<string, RateLimitEntry>();
const API_WINDOW_MS = 60_000;
const API_MAX_REQUESTS = 120;

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
}

export function secureErrorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error("[Server] Unhandled request error", error);
  if (res.headersSent) return;
  res.status(500).json({ error: "Ha ocurrido un error inesperado. Inténtalo de nuevo." });
}

export function apiRateLimiter(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const current = apiRateLimit.get(key);
  const entry = !current || current.resetAt <= now
    ? { count: 1, resetAt: now + API_WINDOW_MS }
    : { count: current.count + 1, resetAt: current.resetAt };

  if (entry.count > API_MAX_REQUESTS) {
    res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
    res.status(429).json({ error: "Demasiadas solicitudes. Inténtalo de nuevo en un minuto." });
    return;
  }

  apiRateLimit.set(key, entry);
  if (apiRateLimit.size > 10_000) {
    apiRateLimit.forEach((entryValue, entryKey) => {
      if (entryValue.resetAt <= now) apiRateLimit.delete(entryKey);
    });
  }
  next();
}
