import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log("🌱 Seeding database SertifKilat.id...");

  // ─── Demo User ────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("Demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@sertifkilat.id" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@sertifkilat.id",
      password: hashedPassword,
      plan: "PRO",
    },
  });

  console.log("✅ User created:", user.email);

  // ─── Demo Events ─────────────────────────────────────────────────────────
  const event1 = await prisma.event.upsert({
    where: { id: "event-demo-001" },
    update: {},
    create: {
      id: "event-demo-001",
      name: "Webinar Nasional Desain UI/UX 2026",
      description: "Webinar tentang tren UI/UX terkini untuk product designer Indonesia.",
      type: "WEBINAR",
      date: new Date("2026-06-12"),
      location: "Online (Zoom)",
      status: "COMPLETED",
      userId: user.id,
    },
  });

  const event2 = await prisma.event.upsert({
    where: { id: "event-demo-002" },
    update: {},
    create: {
      id: "event-demo-002",
      name: "Pelatihan Manajemen Talenta Digital",
      description: "Pelatihan intensif 2 hari untuk HR dan talent manager.",
      type: "PELATIHAN",
      date: new Date("2026-05-05"),
      location: "Jakarta Convention Center",
      status: "COMPLETED",
      userId: user.id,
    },
  });

  const event3 = await prisma.event.upsert({
    where: { id: "event-demo-003" },
    update: {},
    create: {
      id: "event-demo-003",
      name: "Workshop Next.js & TypeScript",
      description: "Workshop hands-on membangun aplikasi modern dengan Next.js 15.",
      type: "WORKSHOP",
      date: new Date("2026-07-15"),
      location: "Bandung Tech Hub",
      status: "ACTIVE",
      userId: user.id,
    },
  });

  console.log("✅ Events created:", [event1.name, event2.name, event3.name].join(", "));

  // ─── Demo Participants ────────────────────────────────────────────────────
  const participants = [
    { name: "Bagas Santoso", email: "bagas@kelasonline.id", eventId: event1.id },
    { name: "Dini Rahmawati", email: "dini@ngomestic.org", eventId: event1.id },
    { name: "Putri Lestari", email: "putri@skn.co.id", eventId: event1.id },
    { name: "Rizky Firmansyah", email: "rizky@techindo.id", eventId: event1.id },
    { name: "Siti Aminah", email: "siti@edufoundation.or.id", eventId: event1.id },
    { name: "Ahmad Fauzi", email: "ahmad@digitalcorps.id", eventId: event2.id },
    { name: "Dewi Kusuma", email: "dewi@hrpro.co.id", eventId: event2.id },
    { name: "Budi Santoso", email: "budi@hrconnect.id", eventId: event2.id },
  ];

  for (let i = 0; i < participants.length; i++) {
    const p = participants[i];
    await prisma.participant.upsert({
      where: { eventId_email: { eventId: p.eventId, email: p.email } },
      update: {},
      create: {
        name: p.name,
        email: p.email,
        eventId: p.eventId,
        rowIndex: i,
      },
    });
  }

  console.log(`✅ ${participants.length} participants created`);

  // ─── Demo Template ────────────────────────────────────────────────────────
  const template = await prisma.template.upsert({
    where: { id: "template-demo-001" },
    update: {},
    create: {
      id: "template-demo-001",
      name: "Elegant Gold",
      fileUrl: "/templates/elegant-gold.png",
      userId: user.id,
      eventId: event1.id,
      fields: [
        { key: "name", x: 561, y: 310, fontSize: 36, color: "#1E293F", fontWeight: "bold", align: "center" },
        { key: "event", x: 561, y: 380, fontSize: 18, color: "#5A6B8C", fontWeight: "normal", align: "center" },
        { key: "date", x: 561, y: 430, fontSize: 16, color: "#5A6B8C", fontWeight: "normal", align: "center" },
        { key: "serial", x: 150, y: 700, fontSize: 12, color: "#5A6B8C", fontWeight: "normal", align: "left" },
        { key: "qr", x: 972, y: 644, fontSize: 90, color: "#000000", fontWeight: "normal", align: "center" },
      ],
    },
  });

  console.log("✅ Template created:", template.name);

  // ─── Demo Batch & Certificates ────────────────────────────────────────────
  const batch = await prisma.batch.upsert({
    where: { id: "batch-demo-001" },
    update: {},
    create: {
      id: "batch-demo-001",
      name: "Batch Webinar UI/UX - Juni 2026",
      eventId: event1.id,
      templateId: template.id,
      status: "DONE",
      totalCount: 5,
      doneCount: 5,
    },
  });

  // Create certificates for event1 participants
  const event1Participants = await prisma.participant.findMany({ where: { eventId: event1.id } });
  let certIndex = 1;
  for (const p of event1Participants) {
    const serial = `SK-2026-${String(certIndex).padStart(4, "0")}`;
    await prisma.certificate.upsert({
      where: { serialNumber: serial },
      update: {},
      create: {
        serialNumber: serial,
        batchId: batch.id,
        participantId: p.id,
        verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${serial}`,
        verifiedCount: Math.floor(Math.random() * 5),
        issuedAt: new Date("2026-06-12"),
      },
    });
    certIndex++;
  }

  console.log(`✅ ${event1Participants.length} certificates created`);
  console.log("\n🎉 Seed selesai!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 Email    : demo@sertifkilat.id");
  console.log("🔑 Password : Demo1234");
  console.log("🔗 URL      : http://localhost:3000/auth/login");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
