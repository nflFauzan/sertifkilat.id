"use client";

import { useParams } from "next/navigation";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Lightning,
  ChartBar,
  CalendarBlank,
  Certificate,
  Gear,
  SignOut,
  List,
  X,
  Palette,
  House,
  Users,
  FileText,
  Envelope,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { getInitials } from "@/lib/utils";
import { useTranslation } from "@/lib/hooks/useTranslation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/dashboard/events", label: "Events", icon: CalendarBlank },
  { href: "/dashboard/participants", label: "Participants", icon: Users },
  { href: "/dashboard/templates", label: "Templates", icon: Palette },
  { href: "/dashboard/generator", label: "Generate", icon: Certificate },
  { href: "/dashboard/certificates", label: "Certificates", icon: FileText },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartBar },
  { href: "/dashboard/email", label: "Email Center", icon: Envelope },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, lang } = useTranslation();

  // Local state for profile sync with settings changes without modifying session
  const [displayName, setDisplayName] = useState<string>("");
  const [displayPic, setDisplayPic] = useState<string | null>(null);

  useEffect(() => {
    const handleProfileUpdate = () => {
      const savedName = localStorage.getItem("settings_user_fullname");
      const savedPic = localStorage.getItem("settings_user_pic");
      if (savedName) setDisplayName(savedName);
      else if (session?.user?.name) setDisplayName(session.user.name);

      if (savedPic) setDisplayPic(savedPic);
      else if (session?.user?.image) setDisplayPic(session.user.image);
    };

    handleProfileUpdate();
    window.addEventListener("profileUpdate", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdate", handleProfileUpdate);
    };
  }, [session]);

  // Template editor takes over full viewport — skip dashboard chrome
  const isTemplateEditor = pathname.startsWith("/dashboard/templates/") && !!params?.id;
  if (isTemplateEditor) return <>{children}</>;

  const user = session?.user;

  return (
    <div className="h-screen w-screen overflow-hidden bg-ink-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
         className={`fixed inset-y-0 left-0 z-50 w-64 h-full bg-bg-card border-r border-ink-100 flex flex-col transform transition-transform duration-200 lg:relative lg:translate-x-0 lg:shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-ink-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow">
              <Lightning weight="fill" className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink-900 text-sm">
              SertifKilat<span className="text-brand-500">.id</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg text-ink-400 hover:text-ink-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav (Scrollable on small heights, pushes content below) */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            
            // Translate navigation item label
            let translatedLabel = item.label;
            if (item.href === "/dashboard") translatedLabel = t("dashboard.sidebar.dashboard");
            else if (item.href === "/dashboard/events") translatedLabel = t("dashboard.sidebar.events");
            else if (item.href === "/dashboard/participants") translatedLabel = t("dashboard.sidebar.participants");
            else if (item.href === "/dashboard/templates") translatedLabel = t("dashboard.sidebar.templates");
            else if (item.href === "/dashboard/generator") translatedLabel = t("dashboard.sidebar.generate");
            else if (item.href === "/dashboard/certificates") translatedLabel = t("dashboard.sidebar.history");
            else if (item.href === "/dashboard/analytics") translatedLabel = t("dashboard.sidebar.analytics");
            else if (item.href === "/dashboard/email") translatedLabel = lang === "id" ? "Pusat Email" : "Email Center";

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-50 text-brand-600 shadow-sm"
                    : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-brand-500" : "text-ink-400"}`}
                  weight={isActive ? "fill" : "regular"}
                />
                {translatedLabel}
              </Link>
            );
          })}
        </nav>

        {/* User (Always pinned at the bottom) */}
        <div className="flex-shrink-0 px-3 py-4 border-t border-ink-100 space-y-1 bg-bg-card">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900 transition-all"
          >
            <Gear className="w-5 h-5 text-ink-400" />
            {t("dashboard.sidebar.settings")}
          </Link>
          <button
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = "/";
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <SignOut className="w-5 h-5 text-ink-400" />
            {t("dashboard.sidebar.logout")}
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl bg-ink-50">
            {displayPic ? (
              <img
                src={displayPic}
                alt={displayName || "User"}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-brand-100"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {displayName ? getInitials(displayName) : "?"}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-bold text-ink-900 truncate max-w-[100px]">
                  {displayName || "Pengguna"}
                </p>
                {user?.plan === "BUSINESS" ? (
                  <span className="bg-amber-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wider shadow-glow-sm shrink-0">
                    GOLD
                  </span>
                ) : user?.plan === "PRO" ? (
                  <span className="bg-brand-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wider shadow-glow-sm shrink-0">
                    PRO
                  </span>
                ) : (
                  <span className="bg-ink-200 text-ink-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wider shrink-0">
                    FREE
                  </span>
                )}
              </div>
              <p className="text-[10px] text-ink-400 truncate mt-0.5">
                {user?.plan === "FREE" ? (lang === "id" ? "Batas 25 Peserta" : "25 Limit") : (lang === "id" ? "27 Hari Tersisa" : "27 Days Left")}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex-shrink-0 flex items-center gap-4 px-4 h-14 bg-bg-card border-b border-ink-100 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-ink-600 hover:bg-ink-50"
          >
            <List className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Lightning weight="fill" className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink-900 text-sm">
              SertifKilat<span className="text-brand-500">.id</span>
            </span>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
