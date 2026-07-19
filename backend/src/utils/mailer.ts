import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;
let warnedNoConfig = false;

function getTransporter(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (!warnedNoConfig) {
      console.warn(
        '[mailer] SMTP_HOST/SMTP_USER/SMTP_PASS are not set - emails will be logged to the console instead of sent. ' +
          'Set these in backend/.env to actually deliver emails (see .env.example).'
      );
      warnedNoConfig = true;
    }
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
  }

  return transporter;
}

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailInput): Promise<void> {
  const t = getTransporter();
  const from = process.env.MAIL_FROM || 'Takhayir <no-reply@takhayir.com>';

  if (!t) {
    // No SMTP configured - don't block the request/flow, just log it so this is
    // still usable/testable in dev without real mail credentials.
    console.log(`[mailer] (SMTP not configured) Would send email to ${to}: "${subject}"\n${html}`);
    return;
  }

  await t.sendMail({ from, to, subject, html });
}
