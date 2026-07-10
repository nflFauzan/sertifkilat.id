import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { headers } from "next/headers";
import VerifyClient from "./VerifyClient";

interface Props {
  params: Promise<{ certificateId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { certificateId } = await params;
  const decodedId = decodeURIComponent(certificateId);
  return {
    title: `Verifikasi Sertifikat ${decodedId} — SertifKilat.id`,
    description: `Cek keaslian sertifikat dengan nomor seri ${decodedId} di SertifKilat.id`,
  };
}

export default async function VerifyPage({ params }: Props) {
  const { certificateId } = await params;
  const decodedId = decodeURIComponent(certificateId);

  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent") || undefined;
  const ipAddress = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || undefined;

  let certificateData = null;
  let isFromDatabase = false;

  // 1. Try to search in the Database
  try {
    const dbCert = await prisma.certificate.findUnique({
      where: { serialNumber: decodedId },
      include: {
        participant: true,
        batch: {
          include: {
            event: true,
            template: true,
          },
        },
      },
    });

    if (dbCert) {
      certificateData = {
        id: dbCert.serialNumber,
        recipientName: dbCert.participant.name,
        eventName: dbCert.batch.event.name,
        issuer: dbCert.batch.event.location || "SertifKilat.id Partner",
        date: dbCert.batch.event.date.toISOString(),
        issuedAt: dbCert.issuedAt.toISOString(),
        templateName: dbCert.batch.template.name,
        verifiedCount: dbCert.verifiedCount + 1,
        templateUrl: dbCert.batch.template.fileUrl,
        templateFields: dbCert.batch.template.fields,
        templateWidth: dbCert.batch.template.width,
        templateHeight: dbCert.batch.template.height,
        lastVerifiedAt: dbCert.lastVerifiedAt ? dbCert.lastVerifiedAt.toISOString() : null,
      };
      isFromDatabase = true;

      // Update scan statistics asynchronously in background (fail-safe)
      prisma.certificate.update({
        where: { id: dbCert.id },
        data: {
          verifiedCount: { increment: 1 },
          lastVerifiedAt: new Date(),
        },
      }).catch(() => {});

      // Record successful verification log
      prisma.verificationLog.create({
        data: {
          serialNumber: decodedId,
          certificateId: dbCert.id,
          status: "SUCCESS",
          ipAddress,
          userAgent,
        },
      }).catch(() => {});
    } else {
      // Record failed verification log
      prisma.verificationLog.create({
        data: {
          serialNumber: decodedId,
          status: "FAILED",
          ipAddress,
          userAgent,
        },
      }).catch(() => {});
    }
  } catch (err) {
    // Database connection failed or tables don't exist
    console.warn("Database lookup failed:", err);
  }

  return (
    <VerifyClient
      decodedId={decodedId}
      certificateData={certificateData}
      isFromDatabase={isFromDatabase}
    />
  );
}
