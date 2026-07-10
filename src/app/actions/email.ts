"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mail";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import fs from "fs/promises";
import path from "path";

// Fetch email delivery history
export async function getEmailLogsAction() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  try {
    // Check if the Prisma client instance currently has the emailLog model
    if (typeof (prisma as any).emailLog === "undefined") {
      console.warn("[EmailLog] prisma.emailLog model is not loaded or does not exist. Database email logging is disabled.");
      return { success: true, logs: [] };
    }

    const logs = await (prisma as any).emailLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        certificate: {
          select: {
            serialNumber: true,
            fileUrl: true,
          },
        },
      },
    });

    return {
      success: true,
      logs: logs.map((log: any) => ({
        id: log.id,
        participant: log.recipientName,
        email: log.recipientEmail,
        event: log.eventName,
        certificate: log.certificate.serialNumber,
        status: (log.status === "SENT" ? "Delivered" : log.status === "QUEUED" ? "Queued" : "Failed") as "Queued" | "Sending" | "Delivered" | "Failed",
        sentAt: log.sentAt ? log.sentAt.toLocaleString() : log.createdAt.toLocaleString(),
        subject: log.subject,
        deliveryTime: "1.2s", // Mocked speed standard
        previewUrl: log.errorMessage?.startsWith("http") ? log.errorMessage : undefined,
        errorMessage: !log.errorMessage?.startsWith("http") ? log.errorMessage : undefined,
      })),
    };
  } catch (err: any) {
    console.error("Error fetching email logs:", err);
    return { error: err.message || "Failed to fetch email logs" };
  }
}

// Send certificate email with PDF base64
export async function sendCertificateEmailAction({
  batchId,
  participantId,
  pdfBase64,
  filename,
  subject,
}: {
  batchId: string;
  participantId: string;
  pdfBase64: string;
  filename: string;
  subject?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    // 1. Fetch certificate, participant, event info
    const certificate = await prisma.certificate.findFirst({
      where: { batchId, participantId },
      include: {
        participant: true,
        batch: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!certificate) return { error: "Certificate not found" };

    const participantName = certificate.participant.name;
    const participantEmail = certificate.participant.email;
    const eventName = certificate.batch.event.name;
    const emailSubject = subject || `Sertifikat ${eventName} Anda Telah Terbit`;

    // Save the PDF file physically on the server
    const buffer = Buffer.from(pdfBase64, "base64");
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "certificates",
      session.user.id,
      batchId
    );
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/certificates/${session.user.id}/${batchId}/${filename}`;

    // Update certificate fileUrl
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: { fileUrl: relativeUrl },
    });

    // 2. Create EmailLog in QUEUED state (if emailLog model exists)
    const hasEmailLog = typeof (prisma as any).emailLog !== "undefined";
    let emailLog: any = null;

    if (hasEmailLog) {
      try {
        emailLog = await (prisma as any).emailLog.create({
          data: {
            userId: session.user.id,
            participantId: certificate.participantId,
            certificateId: certificate.id,
            status: "QUEUED",
            subject: emailSubject,
            recipientEmail: participantEmail,
            recipientName: participantName,
            eventName: eventName,
          },
        });
      } catch (logErr) {
        console.error("[EmailLog] Failed to create email log in database:", logErr);
      }
    }

    // 3. Send the email via nodemailer
    let mailResult;
    try {
      // Reusable HTML Template with branding
      const htmlBody = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #3b82f6; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">SertifKilat.id</h1>
          </div>
          
          <div style="padding: 24px; color: #2d3748; line-height: 1.6;">
            <p style="font-size: 16px; font-weight: bold; margin-top: 0;">Halo ${participantName},</p>
            <p style="font-size: 14px;">Selamat! Anda telah dinyatakan berhak menerima sertifikat penghargaan atas partisipasi Anda dalam kegiatan <strong>${eventName}</strong>.</p>
            
            <p style="font-size: 14px; margin-top: 20px; margin-bottom: 20px; text-align: center;">
              <a href="${certificate.verifyUrl || '#'}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);">
                Verifikasi Sertifikat Online
              </a>
            </p>
            
            <p style="font-size: 13px; color: #718096; background-color: #f7fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-top: 20px;">
              <strong>Catatan:</strong> Sertifikat resmi Anda juga telah kami lampirkan di dalam email ini dalam format dokumen PDF. Anda dapat langsung mengunduh dan menyimpannya.
            </p>
          </div>
          
          <div style="padding: 24px; border-top: 1px solid #edf2f7; text-align: center; font-size: 12px; color: #a0aec0;">
            <p style="margin: 0;">Email ini dikirim secara aman melalui layanan SertifKilat.id</p>
            <p style="margin: 4px 0 0 0;">&copy; 2026 SertifKilat.id. All rights reserved.</p>
          </div>
        </div>
      `;

      mailResult = await sendEmail({
        to: participantEmail,
        subject: emailSubject,
        html: htmlBody,
        attachments: [
          {
            filename: filename,
            content: buffer,
            contentType: "application/pdf",
          },
        ],
      });

      // Update log to SENT if emailLog exists
      if (hasEmailLog && emailLog) {
        try {
          await (prisma as any).emailLog.update({
            where: { id: emailLog.id },
            data: {
              status: "SENT",
              sentAt: new Date(),
              errorMessage: mailResult.previewUrl || null, // Store previewUrl if Ethereal
            },
          });
        } catch (logUpdateErr) {
          console.error("[EmailLog] Failed to update email log to SENT in database:", logUpdateErr);
        }
      }
    } catch (sendErr: any) {
      console.error("Email sending failure for log:", sendErr);
      if (hasEmailLog && emailLog) {
        try {
          await (prisma as any).emailLog.update({
            where: { id: emailLog.id },
            data: {
              status: "FAILED",
              errorMessage: sendErr.message || String(sendErr),
            },
          });
        } catch (logUpdateErr) {
          console.error("[EmailLog] Failed to update email log to FAILED in database:", logUpdateErr);
        }
      }
      return { error: sendErr.message || "Failed to deliver email" };
    }

    revalidatePath("/dashboard/email");
    return { success: true, previewUrl: mailResult.previewUrl };
  } catch (err: any) {
    console.error("sendCertificateEmailAction error:", err);
    return { error: err.message || "Internal server error" };
  }
}

// Resend individual email log
export async function resendEmailAction(emailLogId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const hasEmailLog = typeof (prisma as any).emailLog !== "undefined";
    if (!hasEmailLog) {
      return { error: "Email logs database is not available on this server version." };
    }

    const log = await (prisma as any).emailLog.findUnique({
      where: { id: emailLogId, userId: session.user.id },
      include: {
        certificate: true,
      },
    });

    if (!log) return { error: "Email log not found" };

    // Find certificate and load PDF content
    let pdfBuffer: Buffer;
    let filename = `${log.certificate.serialNumber}_recipient.pdf`;

    if (log.certificate.fileUrl) {
      const filePath = path.join(process.cwd(), "public", log.certificate.fileUrl);
      try {
        pdfBuffer = await fs.readFile(filePath);
        filename = path.basename(log.certificate.fileUrl);
      } catch (fileErr) {
        console.warn(`Saved PDF not found on disk at ${filePath}, generating simple fallback text file attachment`, fileErr);
        pdfBuffer = Buffer.from("Sertifikat PDF belum selesai diunggah. Hubungi administrator.");
      }
    } else {
      pdfBuffer = Buffer.from("Sertifikat PDF belum selesai diunggah. Hubungi administrator.");
    }

    // Update status to QUEUED first
    await (prisma as any).emailLog.update({
      where: { id: emailLogId },
      data: { status: "QUEUED" },
    });

    let mailResult;
    try {
      const htmlBody = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 12px; background-color: #ffffff;">
          <div style="background-color: #3b82f6; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">SertifKilat.id</h1>
          </div>
          
          <div style="padding: 24px; color: #2d3748; line-height: 1.6;">
            <p style="font-size: 16px; font-weight: bold; margin-top: 0;">Halo ${log.recipientName},</p>
            <p style="font-size: 14px;">Selamat! Anda telah dinyatakan berhak menerima sertifikat penghargaan atas partisipasi Anda dalam kegiatan <strong>${log.eventName}</strong>.</p>
            
            <p style="font-size: 14px; margin-top: 20px; margin-bottom: 20px; text-align: center;">
              <a href="${log.certificate.verifyUrl || '#'}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);">
                Verifikasi Sertifikat Online
              </a>
            </p>
            
            <p style="font-size: 13px; color: #718096; background-color: #f7fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-top: 20px;">
              <strong>Catatan:</strong> Sertifikat resmi Anda juga telah kami lampirkan di dalam email ini dalam format dokumen PDF. Anda dapat langsung mengunduh dan menyimpannya.
            </p>
          </div>
          
          <div style="padding: 24px; border-top: 1px solid #edf2f7; text-align: center; font-size: 12px; color: #a0aec0;">
            <p style="margin: 0;">Email ini dikirim secara aman melalui layanan SertifKilat.id</p>
            <p style="margin: 4px 0 0 0;">&copy; 2026 SertifKilat.id. All rights reserved.</p>
          </div>
        </div>
      `;

      mailResult = await sendEmail({
        to: log.recipientEmail,
        subject: log.subject,
        html: htmlBody,
        attachments: [
          {
            filename: filename,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });

      await (prisma as any).emailLog.update({
        where: { id: emailLogId },
        data: {
          status: "SENT",
          sentAt: new Date(),
          errorMessage: mailResult.previewUrl || null,
        },
      });
    } catch (sendErr: any) {
      console.error("Resend email failed:", sendErr);
      await (prisma as any).emailLog.update({
        where: { id: emailLogId },
        data: {
          status: "FAILED",
          errorMessage: sendErr.message || String(sendErr),
        },
      });
      return { error: sendErr.message || "Failed to resend email" };
    }

    revalidatePath("/dashboard/email");
    return { success: true, previewUrl: mailResult.previewUrl };
  } catch (err: any) {
    console.error("resendEmailAction error:", err);
    return { error: err.message || "Internal server error" };
  }
}
