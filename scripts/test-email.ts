/**
 * Skrip tes pengiriman email asli ke 2 alamat.
 */

import * as dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const TARGET_EMAILS = [
  "naufalmnf1692006@gmail.com",
  "245172010008.naufal@student.stmik.tazkia.ac.id",
];

async function main() {
  console.log("=== SertifKilat.id - Tes Pengiriman Email Asli ===\n");

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;

  console.log(`SMTP_HOST : ${host || "(KOSONG!)"}`);
  console.log(`SMTP_PORT : ${port || "(KOSONG!)"}`);
  console.log(`SMTP_USER : ${user || "(KOSONG!)"}`);
  console.log(`SMTP_PASS : ${pass ? "***" + pass.slice(-4) : "(KOSONG!)"}`);
  console.log(`SMTP_FROM : ${smtpFrom || "(default)"}`);
  console.log();

  if (!host || !port || !user || !pass) {
    console.error("❌  SMTP belum dikonfigurasi di file .env!");
    process.exit(1);
  }

  const smtpPort = parseInt(port, 10);
  const isSecure = smtpPort === 465;

  console.log(`Membuat transporter ke ${host}:${smtpPort}...`);

  const transporter = nodemailer.createTransport({
    host,
    port: smtpPort,
    secure: isSecure,
    auth: { user, pass },
  });

  console.log("Memverifikasi koneksi SMTP...");
  try {
    await transporter.verify();
    console.log("✅  Koneksi SMTP berhasil!\n");
  } catch (err: any) {
    console.error("❌  Koneksi SMTP GAGAL:", err.message);
    process.exit(1);
  }

  // Use a safe from format — just the email address with optional ASCII display name
  const fromAddress = smtpFrom || user;
  console.log(`From address: ${fromAddress}\n`);

  const timestamp = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  for (const targetEmail of TARGET_EMAILS) {
    console.log(`📧 Mengirim email ke: ${targetEmail}`);
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: targetEmail,
        subject: "Tes Pengiriman Email - SertifKilat.id",
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 12px; background-color: #ffffff;">
            <div style="background-color: #3b82f6; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">SertifKilat.id</h1>
            </div>
            <div style="padding: 24px; color: #2d3748; line-height: 1.6; font-size: 14px;">
              <p style="font-size: 16px; font-weight: bold; margin-top: 0;">Halo!</p>
              <p>Ini adalah <strong>email tes</strong> dari sistem SertifKilat.id.</p>
              <p>Jika Anda menerima email ini, berarti konfigurasi SMTP sudah benar dan pengiriman email sertifikat ke peserta event sudah siap digunakan!</p>
              <p style="font-size: 13px; color: #718096; background-color: #f7fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-top: 20px;">
                <strong>Detail Teknis:</strong><br/>
                Dikirim ke: ${targetEmail}<br/>
                SMTP Host: ${host}<br/>
                Waktu: ${timestamp} WIB
              </p>
            </div>
            <div style="padding: 24px; border-top: 1px solid #edf2f7; text-align: center; font-size: 12px; color: #a0aec0;">
              <p style="margin: 0;">2026 SertifKilat.id - Email Delivery Test.</p>
            </div>
          </div>
        `,
      });

      console.log(`   ✅ BERHASIL! Message ID: ${info.messageId}`);
    } catch (err: any) {
      console.error(`   ❌ GAGAL ke ${targetEmail}:`, err.message);
    }
  }

  console.log("\nSelesai! Silakan cek inbox kedua email (periksa juga folder Spam).");
}

main().catch(console.error);
