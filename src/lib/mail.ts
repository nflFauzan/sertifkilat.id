import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    try {
      const smtpPort = parseInt(port, 10);
      const isSecure = smtpPort === 465;
      transporter = nodemailer.createTransport({
        host,
        port: smtpPort,
        secure: isSecure,
        auth: {
          user,
          pass,
        },
      });
      console.log(`[Email] Created SMTP Transporter using host: ${host}`);
      return transporter;
    } catch (error) {
      console.error("[Email] Failed to create configured SMTP transporter:", error);
    }
  }

  // We automatically generate a test account on Ethereal Email for development/testing
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email] Created Ethereal SMTP Transporter. Username: ${testAccount.user}`);
    return transporter;
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
}) {
  const mailTransporter = await getTransporter();
  const from = process.env.SMTP_FROM || '"SertifKilat.id" <no-reply@sertifkilat.id>';
  const info = await mailTransporter.sendMail({
    from,
    to,
    subject,
    html,
    attachments,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[Email] Received by Ethereal. Preview URL: ${previewUrl}`);
  }
  return { messageId: info.messageId, previewUrl };
}

