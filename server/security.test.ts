import { describe, expect, it, vi } from "vitest";
import { apiRateLimiter, secureErrorHandler, securityHeaders } from "./_core/security";

function responseStub() {
  const headers = new Map<string, string | number>();
  return {
    headers,
    setHeader: vi.fn((name: string, value: string | number) => headers.set(name, value)),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

function requestStub(ip: string) {
  return { ip, socket: { remoteAddress: ip } } as never;
}

describe("security middleware", () => {
  it("adds browser hardening headers and continues", () => {
    const response = responseStub();
    const next = vi.fn();

    securityHeaders({} as never, response as never, next);

    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("Permissions-Policy")).toContain("camera=()");
    expect(response.headers.get("Cross-Origin-Opener-Policy")).toBe("same-origin");
    expect(next).toHaveBeenCalledOnce();
  });

  it("hides unexpected server error details from the client", () => {
    const response = responseStub();
    const error = new Error("database password must not leak");

    secureErrorHandler(error, {} as never, response as never, vi.fn());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      error: "Ha ocurrido un error inesperado. Inténtalo de nuevo.",
    });
    expect(JSON.stringify(response.json.mock.calls)).not.toContain("database password");
  });

  it("returns 429 after the per-IP API budget is exhausted", () => {
    const ip = `security-test-${Date.now()}-${Math.random()}`;
    const next = vi.fn();
    const allowedResponse = responseStub();

    for (let index = 0; index < 120; index += 1) {
      apiRateLimiter(requestStub(ip), allowedResponse as never, next);
    }

    const blockedResponse = responseStub();
    apiRateLimiter(requestStub(ip), blockedResponse as never, next);

    expect(next).toHaveBeenCalledTimes(120);
    expect(blockedResponse.status).toHaveBeenCalledWith(429);
    expect(blockedResponse.headers.get("Retry-After")).toBeTypeOf("number");
    expect(blockedResponse.json).toHaveBeenCalledWith({
      error: "Demasiadas solicitudes. Inténtalo de nuevo en un minuto.",
    });
  });
});
