import nodemailer from "nodemailer";

// Cached transporter — only used for env-based SMTP (NOT Ethereal).
// We intentionally do NOT cache the Ethereal fallback so that
// switching to real SMTP (via env) on next restart always works.
let envTransporter: nodemailer.Transporter | null = null;

export async function getTransporter(customSmtp?: {
  host?: string;
  port?: string | number;
  user?: string;
  pass?: string;
}) {
  // 1. Per-user custom SMTP (from dashboard settings)
  if (customSmtp && customSmtp.host && customSmtp.port && customSmtp.user && customSmtp.pass) {
    try {
      const smtpPort = typeof customSmtp.port === "string" ? parseInt(customSmtp.port, 10) : customSmtp.port;
      const isSecure = smtpPort === 465;
      const customTransporter = nodemailer.createTransport({
        host: customSmtp.host,
        port: smtpPort,
        secure: isSecure,
        auth: {
          user: customSmtp.user,
          pass: customSmtp.pass,
        },
      });
      console.log(`[Email] Created custom SMTP Transporter using host: ${customSmtp.host}`);
      return customTransporter;
    } catch (error) {
      console.error("[Email] Failed to create custom SMTP transporter:", error);
    }
  }

  // 2. Global env-based SMTP
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    if (envTransporter) return envTransporter;
    try {
      const smtpPort = parseInt(port, 10);
      const isSecure = smtpPort === 465;
      envTransporter = nodemailer.createTransport({
        host,
        port: smtpPort,
        secure: isSecure,
        auth: {
          user,
          pass,
        },
      });
      console.log(`[Email] Created env SMTP Transporter using host: ${host}`);
      return envTransporter;
    } catch (error) {
      console.error("[Email] Failed to create configured SMTP transporter:", error);
    }
  }

  // 3. Ethereal test account (development only — NOT cached to avoid sticky fallback)
  console.warn("[Email] No SMTP configured. Falling back to Ethereal test mailbox. Emails will NOT reach real inboxes.");
  try {
    const testAccount = await nodemailer.createTestAccount();
    const etherealTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email] Created Ethereal SMTP Transporter. Username: ${testAccount.user}`);
    return etherealTransporter;
  } catch (error) {
    console.error("[Email] Failed to create Ethereal SMTP transporter, falling back to mock:", error);
    // Fallback mock transporter
    return {
      sendMail: async (options: any) => {
        console.log("[Email MOCK SEND] Options:", {
          to: options.to,
          subject: options.subject,
          attachmentsCount: options.attachments?.length || 0,
        });
        return { messageId: "mock-msg-" + Math.random().toString(36).substring(7) };
      }
    } as any;
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
  customSmtp,
  fromName,
  fromEmail,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    encoding?: string;
    contentType?: string;
  }>;
  customSmtp?: {
    host?: string;
    port?: string | number;
    user?: string;
    pass?: string;
  };
  fromName?: string;
  fromEmail?: string;
}) {
  const mailTransporter = await getTransporter(customSmtp);
  
  // Build the "from" address with proper fallback chain:
  // 1. Explicit fromEmail param  2. Custom SMTP user  3. Env SMTP_FROM  4. Env SMTP_USER  5. Default
  let from: string;
  if (fromEmail) {
    from = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;
  } else if (customSmtp?.user) {
    from = fromName ? `"${fromName}" <${customSmtp.user}>` : `"SertifKilat.id" <${customSmtp.user}>`;
  } else if (process.env.SMTP_FROM) {
    from = process.env.SMTP_FROM;
  } else if (process.env.SMTP_USER) {
    const name = fromName || "SertifKilat.id";
    from = `"${name}" <${process.env.SMTP_USER}>`;
  } else {
    from = '"SertifKilat.id" <no-reply@sertifkilat.id>';
  }

  console.log(`[Email] Sending to: ${to}, from: ${from}, subject: ${subject}`);

  const info = await mailTransporter.sendMail({
    from,
    to,
    subject,
    html,
    attachments,
  });

  console.log(`[Email] Sent successfully! MessageId: ${info.messageId}`);

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[Email] Received by Ethereal. Preview URL: ${previewUrl}`);
  }
  return { messageId: info.messageId, previewUrl };
}

