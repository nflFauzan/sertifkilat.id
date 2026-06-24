const orgs = [
  "KelasOnline.id",
  "Studio Kreatif Nusantara",
  "Komunitas Ngomestic",
  "EduCamp Indonesia",
  "Wirausaha Muda Hub",
];

export default function LogoStrip() {
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
