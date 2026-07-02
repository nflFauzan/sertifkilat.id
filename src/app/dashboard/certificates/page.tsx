import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import CertificatesClient from "./CertificatesClient";
import { TemplateField } from "@/lib/certificateGenerator";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Daftar Sertifikat — SertifKilat.id",
};

export default async function CertificatesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // Fetch all certificates generated across events owned by this user
  const certificates = await prisma.certificate.findMany({
    where: {
      batch: {
        event: { userId: session.user.id },
      },
    },
    include: {
      participant: {
        select: {
          name: true,
          email: true,
        },
      },
      batch: {
        select: {
          name: true,
          template: {
            select: {
              fileUrl: true,
              fields: true,
              width: true,
              height: true,
            },
          },
          event: {
            select: {
              name: true,
              date: true,
            },
          },
        },
      },
    },
    orderBy: { issuedAt: "desc" },
  });

  const serializedCertificates = certificates.map((c) => ({
    id: c.id,
    serialNumber: c.serialNumber,
    fileUrl: c.fileUrl,
    verifyUrl: c.verifyUrl,
    verifiedCount: c.verifiedCount,
    issuedAt: c.issuedAt,
    participantName: c.participant.name,
    participantEmail: c.participant.email,
    batchName: c.batch.name,
    eventName: c.batch.event.name,
    eventDate: c.batch.event.date,
    templateUrl: c.batch.template.fileUrl,
    templateFields: (c.batch.template.fields as unknown as TemplateField[]) || [],
    templateWidth: c.batch.template.width,
    templateHeight: c.batch.template.height,
  }));

  return <CertificatesClient certificates={serializedCertificates} />;
}
