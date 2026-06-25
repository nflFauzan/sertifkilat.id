// LogoStrip: Menampilkan nama organisasi/institusi dari pengguna terdaftar.
// Data diambil dari props (server-side) berdasarkan nama event yang ada di database.
// Jika database kosong, komponen ini tidak akan ditampilkan sama sekali.

interface LogoStripProps {
  orgs: string[];
}

export default function LogoStrip({ orgs }: LogoStripProps) {
  // Jika belum ada data dari database, sembunyikan section ini
  if (orgs.length === 0) return null;

  return (
    <div className="border-t border-ink-100 bg-white">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10">
        <p className="text-center text-xs text-ink-400 mb-6 font-medium tracking-wider uppercase">
          Dipercaya oleh tim event dan pelatihan dari berbagai organisasi
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
          {orgs.map((org) => (
            <span
              key={org}
              className="font-display text-base text-ink-300 hover:text-ink-400 transition-colors select-none"
            >
              {org}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
