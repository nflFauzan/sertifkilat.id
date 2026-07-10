import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export async function getTransporter() {
  if (transporter) return transporter;

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
  const info = await mailTransporter.sendMail({
    from: '"SertifKilat.id" <no-reply@sertifkilat.id>',
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
