# 🚀 SertifKilat.id - Platform Generator Sertifikat Modern

SertifKilat.id adalah platform berbasis web modern yang dirancang untuk mempermudah pembuatan, pengelolaan, dan verifikasi sertifikat digital (menggunakan QR Code dan nomor seri unik) secara massal dan instan. Proyek ini dibangun menggunakan **Next.js 15 (App Router)**, **Prisma ORM**, dan **PostgreSQL**.

Dokumen ini berisi panduan lengkap bagi tim developer untuk mengkloning, menjalankan, serta menguji aplikasi ini di lingkungan lokal.

---

## 📌 Daftar Isi
1. [Prasyarat Sistem](#-prasyarat-sistem)
2. [Langkah Instalasi & Setup Lokal](#-langkah-instalasi--setup-lokal)
3. [Kredensial Akun Pengujian Lokal (Seed)](#-kredensial-akun-pengujian-lokal-seed)
4. [Perintah/Skrip yang Tersedia](#-perintahskrip-yang-tersedia)
5. [Alur Kontribusi Tim](#-alur-kontribusi-tim)

---

## 🛠️ Prasyarat Sistem

Sebelum memulai, pastikan perangkat lokal Anda sudah terinstal perangkat lunak berikut:
* **Node.js** (Rekomendasi versi `v20.x` LTS ke atas)
* **npm** (Bawaan dari Node.js)
* **PostgreSQL Database** (Lokal atau Cloud instance)
* **Git**

---

## 💻 Langkah Instalasi & Setup Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek di komputer lokal Anda:

### Langkah 1: Klon Repositori
Jalankan perintah berikut pada terminal Anda untuk mengunduh kode proyek:
```bash
git clone <URL_REPOSITORI_ANDA>
cd sertifkilat.id
```

### Langkah 2: Instalasi Dependensi
Instal semua pustaka yang dibutuhkan menggunakan `npm`:
```bash
npm install
```

### Langkah 3: Konfigurasi Environment Variables (`.env`)
Salin file template `.env.example` menjadi `.env` baru:
```bash
cp .env.example .env
```
Setelah disalin, buka file `.env` dan sesuaikan nilainya:
1. **DATABASE_URL**: Ganti dengan kredensial koneksi PostgreSQL lokal Anda.
   * Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
   * Contoh default: `postgresql://postgres:password@localhost:5432/sertifkilat?schema=public`
2. **AUTH_SECRET**: Kunci enkripsi untuk sesi NextAuth. Anda bisa membuat kunci acak baru menggunakan perintah terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Salin output-nya ke field `AUTH_SECRET` di dalam `.env`.

### Langkah 4: Setup Database & Migrasi (Prisma)
Proyek ini menggunakan Prisma ORM untuk mengelola database. Jalankan langkah berikut secara berurutan untuk mempersiapkan skema database dan mengisi data awal (seed):

1. **Sinkronisasi Skema Database:**
   ```bash
   npm run db:push
   ```
   *Atau gunakan `npm run db:migrate` jika Anda ingin menjalankan migrasi berbasis file migration log.*

2. **Generate Prisma Client:**
   ```bash
   npm run db:generate
   ```

3. **Isi Data Awal (Seeding):**
   ```bash
   npm run db:seed
   ```
   Perintah ini akan memasukkan data awal pengujian berupa akun developer, contoh event, templat sertifikat, dan daftar partisipan ke dalam database Anda.

### Langkah 5: Jalankan Server Development
Jika semua konfigurasi di atas sudah siap, Anda tinggal menjalankan perintah berikut untuk memulai server lokal:
```bash
npm run dev
```

> [!TIP]
> **Pengecekan Port Cerdas (Fitur Baru)**
> Skrip `npm run dev` dan `npm run start` sudah dilengkapi dengan pemantau port otomatis (`scripts/check-port.js`). Jika port `3000` sedang digunakan oleh aplikasi lain, sistem akan membatalkan eksekusi dengan memberikan pesan kesalahan yang informatif tanpa mematikan proses Node.js lain yang sedang berjalan secara diam-diam. Hal ini mencegah Next.js untuk secara tidak sengaja berpindah ke port `3001` secara otomatis.

Setelah berjalan, buka browser dan akses alamat berikut:
👉 [**http://localhost:3000**](http://localhost:3000)

---

## 🔑 Kredensial Akun Pengujian Lokal (Seed)

Setelah Anda berhasil menjalankan database seed pada Langkah 4, gunakan akun pengujian lokal berikut untuk masuk ke dashboard aplikasi:

* **Halaman Login:** [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
* **Gmail:** `developer@sertifkilat.id`
* **Password:** `DevPassword123`
* **Catatan:** Anda juga dapat menggunakan tombol **Register** pada halaman masuk untuk membuat akun baru secara real langsung ke database lokal Anda.

---

## 🌐 Konfigurasi Google OAuth

SertifKilat.id mendukung login menggunakan Akun Google (Google OAuth). Jika environment variable Google OAuth belum dikonfigurasi, tombol login Google akan dinonaktifkan secara otomatis pada halaman Login & Register disertai penjelasan variabel yang kurang.

### 1. Konfigurasi di Google Cloud Console

Ikuti langkah berikut untuk mendapatkan kredensial Client ID dan Client Secret:
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat proyek baru atau pilih proyek yang sudah ada.
3. Masuk ke menu **APIs & Services** > **OAuth consent screen**:
   * Pilih User Type **External** (jika untuk publik) lalu klik *Create*.
   * Isi informasi wajib seperti nama aplikasi, email dukungan, dan email developer.
   * Pada tab *Scopes*, tambahkan scope `.../auth/userinfo.profile` dan `.../auth/userinfo.email` (biasanya sudah default).
   * Pada tab *Test users*, tambahkan email Google yang akan Anda gunakan untuk pengujian lokal.
4. Masuk ke menu **APIs & Services** > **Credentials**:
   * Klik **+ Create Credentials** > **OAuth client ID**.
   * Pilih Application Type: **Web application**.
   * Isi nama client (contoh: `SertifKilat Dev Client`).

### 2. Pengaturan URI & Callback (Lokal & Produksi)

Pada konfigurasi OAuth Client ID tersebut, atur kolom berikut:

#### A. Authorized JavaScript Origins
Asal (Origin) domain dari aplikasi Anda yang diizinkan untuk memicu request autentikasi:
* **Lokal:** `http://localhost:3000`
* **Produksi:** `https://domain-anda.com` (Ganti dengan domain asli aplikasi Anda)

#### B. Authorized Redirect URIs
Alamat callback NextAuth yang akan menerima kode verifikasi dari Google:
* **Lokal:** `http://localhost:3000/api/auth/callback/google`
* **Produksi:** `https://domain-anda.com/api/auth/callback/google`

*Harap pastikan tidak ada garis miring (`/`) di akhir Authorized JavaScript Origins.*

### 3. Variabel Environment yang Diperlukan (`.env`)

Tambahkan variabel berikut ke dalam file `.env` lokal Anda:
```env
GOOGLE_CLIENT_ID="kunci-client-id-dari-google-console"
GOOGLE_CLIENT_SECRET="kunci-client-secret-dari-google-console"
```

### 4. Instruksi Deployment Produksi (Vercel, VPS, dll)
Saat mendeploy aplikasi ke lingkungan produksi, Anda harus mengonfigurasi variabel-variabel berikut di dashboard platform hosting Anda:
1. `NEXT_PUBLIC_APP_URL` dan `NEXTAUTH_URL` harus bernilai URL domain produksi Anda (misal: `https://sertifkilat.id`).
2. `AUTH_TRUST_HOST` harus diset ke `true`.
3. Konfigurasikan `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` menggunakan kredensial produksi Google Cloud Console yang sesuai.
4. Update **Authorized JavaScript Origins** dan **Authorized Redirect URIs** di Google Cloud Console agar mencantumkan domain produksi Anda.

### 5. Panduan Troubleshooting & Error Google OAuth

| Pesan Kesalahan / Kode | Kemungkinan Penyebab | Solusi |
| :--- | :--- | :--- |
| **Error 401: invalid_client** | `GOOGLE_CLIENT_ID` di file `.env` salah, tidak cocok, atau baru saja dibuat dan belum aktif (butuh beberapa menit di server Google). | Periksa kembali apakah nilai `GOOGLE_CLIENT_ID` di `.env` sudah sama persis dengan yang ada di Google Cloud Console. |
| **Error 400: redirect_uri_mismatch** | URL callback yang Anda daftarkan di Google Cloud Console tidak cocok dengan URL yang dipanggil oleh NextAuth. | Pastikan Anda menambahkan `http://localhost:3000/api/auth/callback/google` di bagian **Authorized Redirect URIs** di GCP, dan bukan hanya domain dasar saja. |
| **Missing GOOGLE_CLIENT_ID / SECRET** | Tombol Google login dinonaktifkan di halaman Login/Register dan menampilkan warning box. | Buat file `.env` (atau salin dari `.env.example`) dan isi variabel `GOOGLE_CLIENT_ID` serta `GOOGLE_CLIENT_SECRET` dengan benar. |
| **Callback Errors / Session Issues** | Variabel `AUTH_SECRET` tidak diset atau session cookie tidak dapat dibuat karena perbedaan protokol HTTP/HTTPS. | 1. Generate `AUTH_SECRET` baru dengan aman.<br>2. Set `AUTH_TRUST_HOST=true` pada environment hosting.<br>3. Pastikan `NEXTAUTH_URL` menggunakan `https://` di server produksi. |

---

## 📦 Perintah/Skrip yang Tersedia

Berikut adalah daftar perintah yang bisa digunakan selama proses pengembangan:

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | **[REKOMENDASI]** Memeriksa ketersediaan port 3000 lalu menjalankan server lokal mode pengembangan (hot-reload). |
| `npm run build` | Membuat build aplikasi Next.js untuk siap diproduksi (production build). |
| `npm run start` | Memeriksa ketersediaan port 3000 serta keberadaan production build, lalu menjalankan aplikasi hasil build produksi di server lokal. |
| `npm run lint` | Menjalankan pemeriksaan ESLint untuk mendeteksi kesalahan penulisan kode. |
| `npm run type-check` | Menjalankan verifikasi TypeScript (`tsc --noEmit`) tanpa menghasilkan file JS output. |
| `npm run db:deploy` | Menjalankan file migrasi database ke lingkungan produksi (production-safe). |
| `npm run db:studio` | Membuka antarmuka grafis Prisma Studio di browser untuk melihat data database. |
| `npm run db:reset` | Menghapus seluruh data, melakukan reset skema database, dan mengulang proses migrasi. |

---

## 👥 Alur Kontribusi Tim

Agar kolaborasi tim berjalan lancar dan rapi, harap ikuti aturan berikut sebelum membuat perubahan:

1. **Selalu Tarik Kode Terbaru:** Sebelum membuat branch baru, lakukan `git pull origin main` di branch main lokal Anda.
2. **Buat Branch Fitur Baru:** Gunakan penamaan branch yang deskriptif:
   * Fitur baru: `feat/nama-fitur`
   * Perbaikan bug: `fix/nama-bug`
   * Refaktor kode: `refactor/nama-refactor`
3. **Verifikasi Kualitas Kode Sebelum Push:**
   Sebelum melakukan commit atau push, pastikan kode Anda bebas dari error linter maupun compile typescript:
   ```bash
   npm run lint
   ```
   ```bash
   npm run type-check
   ```
4. **Buat Pull Request (PR):** Push branch Anda ke remote repository dan ajukan Pull Request ke branch `main`. Pastikan deskripsi PR menjelaskan perubahan yang Anda lakukan dengan jelas.
