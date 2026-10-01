import nodemailer from "nodemailer";
import { describe, expect, it } from "vitest";

describe("configuración SMTP de Yahoo", () => {
  it("autentica el remitente de PureClub sin enviar ningún correo", async () => {
    expect(process.env.YAHOO_SMTP_USER).toBe("fumones@yahoo.com");
    expect(process.env.YAHOO_SMTP_APP_PASSWORD).toBeTruthy();

    const transport = nodemailer.createTransport({
      host: "smtp.mail.yahoo.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.YAHOO_SMTP_USER,
        pass: process.env.YAHOO_SMTP_APP_PASSWORD,
      },
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 15_000,
    });

    await expect(transport.verify()).resolves.toBe(true);
  }, 20_000);
});
