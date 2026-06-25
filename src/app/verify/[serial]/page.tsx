import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { headers } from "next/headers";
import {
  CheckCircle,
  XCircle,
  Certificate,
  Lightning,
  CalendarBlank,
  User,
  Hash,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ serial: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { serial } = await params;
  return {
    title: `Verifikasi Sertifikat ${serial} — SertifKilat.id`,
    description: `Cek keaslian sertifikat dengan nomor ${serial} di SertifKilat.id`,
  };
}

export default async function VerifyPage({ params }: Props) {
  const { serial } = await params;
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get("user-agent");
  const ipAddress = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip");

  // Fetch certificate details
  const certificate = await prisma.certificate.findUnique({
    where: { serialNumber: serial },
    include: {
      participant: true,
      batch: {
        include: {
          event: true,
        },
      },
    },
  });

  const isValid = !!certificate;

  // Log verification scan to VerificationLog
  await prisma.verificationLog.create({
    data: {
      serialNumber: serial,
      certificateId: certificate ? certificate.id : null,
      ipAddress,
      userAgent,
      status: isValid ? "VALID" : "INVALID",
    },
  });

  if (certificate) {
    // Update verification count and last verified timestamp
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        verifiedCount: { increment: 1 },
        lastVerifiedAt: new Date(),
      },
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink-50 via-brand-50/20 to-ink-100 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Lightning weight="fill" className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-ink-900">
              SertifKilat<span className="text-brand-500">.id</span>
            </span>
          </Link>
          <p className="text-xs text-ink-400 mt-2">Sistem Verifikasi Sertifikat</p>
        </div>

        {/* Certificate Card */}
        <div className="card overflow-hidden shadow-soft">
          {/* Status banner */}
          <div
            className={`px-6 py-4 flex items-center gap-3 ${
              isValid ? "bg-emerald-500" : "bg-rose-500"
            }`}
          >
            {isValid ? (
              <CheckCircle weight="fill" className="w-6 h-6 text-white flex-shrink-0" />
            ) : (
              <XCircle weight="fill" className="w-6 h-6 text-white flex-shrink-0" />
            )}
            <div>
              <p className="font-bold text-white text-lg">
                {isValid ? "✓ Sertifikat Valid" : "✗ Sertifikat Tidak Ditemukan"}
              </p>
              <p className="text-white/80 text-xs mt-0.5">
                {isValid
                  ? `Diverifikasi ${certificate!.verifiedCount + 1} kali`
                  : "Nomor sertifikat ini tidak ada dalam sistem"}
              </p>
            </div>
          </div>

          {/* Content */}
          {isValid && certificate ? (
            <div className="p-6 space-y-5">
              {/* Recipient */}
              <div className="text-center py-4 border-b border-ink-100">
                <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-3">
                  <Certificate className="w-8 h-8 text-brand-500" weight="fill" />
                </div>
                <p className="text-2xl font-bold text-ink-900">
                  {certificate.participant.name}
                </p>
                <p className="text-sm text-ink-500 mt-1">
                  {certificate.participant.email}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <DetailRow
                  icon={<Hash className="w-4 h-4" />}
                  label="Nomor Sertifikat"
                  value={
                    <span className="font-mono font-bold text-brand-600">
                      {certificate.serialNumber}
                    </span>
                  }
                />
                <DetailRow
                  icon={<CalendarBlank className="w-4 h-4" />}
                  label="Nama Event"
                  value={certificate.batch.event.name}
                />
                <DetailRow
                  icon={<User className="w-4 h-4" />}
                  label="Tipe Event"
                  value={certificate.batch.event.type}
                />
                {certificate.batch.event.location && (
                  <DetailRow
                    icon={<MapPin className="w-4 h-4" />}
                    label="Lokasi"
                    value={certificate.batch.event.location}
                  />
                )}
                <DetailRow
                  icon={<CalendarBlank className="w-4 h-4" />}
                  label="Tanggal Diterbitkan"
                  value={formatDate(certificate.issuedAt)}
                />
                <DetailRow
                  icon={<CalendarBlank className="w-4 h-4" />}
                  label="Tanggal Event"
                  value={formatDate(certificate.batch.event.date)}
                />
              </div>

              {/* Valid badge */}
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 py-3">
                <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-700">
                  Dokumen ini sah dan terverifikasi oleh SertifKilat.id
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-4">
              <p className="text-sm text-ink-500">
                Nomor sertifikat{" "}
                <span className="font-mono font-bold text-ink-900">
                  {serial}
                </span>{" "}
                tidak ditemukan dalam database kami.
              </p>
              <p className="text-xs text-ink-400">
                Pastikan URL QR code yang kamu scan sudah benar. Jika masih
                bermasalah, hubungi penyelenggara event.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-ink-400 mt-6">
          Halaman verifikasi otomatis oleh{" "}
          <Link href="/" className="text-brand-600 hover:underline">
            SertifKilat.id
          </Link>
          . Diperbarui real-time.
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-ink-50 flex items-center justify-center flex-shrink-0 text-ink-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-ink-400">{label}</p>
        <p className="text-sm font-semibold text-ink-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
