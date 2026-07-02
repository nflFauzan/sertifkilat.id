import Link from "next/link";


export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2.5 mb-3">
            <span className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                <path d="M13.2 2.2 4 14h6.6l-1 8.5L19 9.5h-6.6z" />
              </svg>
            </span>
            <span className="font-bold tracking-tight text-ink-900">SertifKilat<span className="text-brand-500">.id</span></span>
          </Link>
          <p className="text-sm text-ink-500 max-w-xs leading-relaxed">
            Platform generator sertifikat massal untuk webinar, pelatihan, dan kompetisi - lengkap dengan verifikasi QR.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink-900 mb-3">Produk</h4>
          <ul className="space-y-2 text-sm text-ink-500">
            <li><a href="#fitur" className="hover:text-brand-500 transition-colors">Fitur</a></li>
            <li><a href="#harga" className="hover:text-brand-500 transition-colors">Harga</a></li>
            <li><Link href="/auth/register" className="hover:text-brand-500 transition-colors">Daftar Gratis</Link></li>
            <li><Link href="/verify/SK-2026-0001" className="hover:text-brand-500 transition-colors">Verifikasi Sertifikat</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink-900 mb-3">Akun</h4>
          <ul className="space-y-2 text-sm text-ink-500">
            <li><Link href="/auth/login" className="hover:text-brand-500 transition-colors">Masuk</Link></li>
            <li><Link href="/auth/register" className="hover:text-brand-500 transition-colors">Daftar</Link></li>
            <li><Link href="/dashboard" className="hover:text-brand-500 transition-colors">Dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink-900 mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-ink-500">
            <li><span className="text-ink-300 cursor-default">Kebijakan Privasi</span></li>
            <li><span className="text-ink-300 cursor-default">Syarat Layanan</span></li>
            <li>
              <a href="mailto:support@sertifkilat.id" className="hover:text-brand-500 transition-colors">
                Hubungi Kami
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-100 py-5 text-center text-xs text-ink-400">
        &copy; 2026 SertifKilat.id &mdash; Platform Generator Sertifikat Indonesia
      </div>
    </footer>
  );
}
