import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

const RECIPIENTS_PER_BATCH = 45;

function getTransport() {
  if (!ENV.yahooSmtpUser || !ENV.yahooSmtpAppPassword) {
    throw new Error("El envío de PureClub todavía no está configurado.");
  }
  return nodemailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 465,
    secure: true,
    auth: { user: ENV.yahooSmtpUser, pass: ENV.yahooSmtpAppPassword },
  });
}

export async function sendPureClubCampaign(recipients: string[], subject: string, body: string) {
  if (recipients.length === 0) return { sent: 0 };
  const transport = getTransport();
  await transport.verify();
  const batches = Array.from({ length: Math.ceil(recipients.length / RECIPIENTS_PER_BATCH) }, (_, index) =>
    recipients.slice(index * RECIPIENTS_PER_BATCH, (index + 1) * RECIPIENTS_PER_BATCH)
  );
  for (const batch of batches) {
    const result = await transport.sendMail({
      from: `PureKinky <${ENV.yahooSmtpUser}>`,
      to: ENV.yahooSmtpUser,
      bcc: batch,
      subject,
      text: body,
    });
    if (result.rejected.length > 0) throw new Error("El servidor de correo no ha aceptado todos los destinatarios de esta campaña.");
  }
  return { sent: recipients.length, batches: batches.length };
}
