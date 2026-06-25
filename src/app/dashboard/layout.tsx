"use client";

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
} from "@phosphor-icons/react";
import { useState } from "react";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/dashboard/events", label: "Events", icon: CalendarBlank },
  { href: "/dashboard/participants", label: "Participants", icon: Users },
  { href: "/dashboard/templates", label: "Templates", icon: Palette },
  { href: "/dashboard/generate", label: "Generate", icon: Certificate },
  { href: "/dashboard/certificates", label: "Certificates", icon: FileText },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartBar },
  { href: "/dashboard/settings", label: "Settings", icon: Gear },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = session?.user;
  const initials = user?.name ? getInitials(user.name) : "?";

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-ink-100 flex flex-col transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink-100">
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

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
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
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-ink-100 space-y-1">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-ink-50 hover:text-ink-900 transition-all"
          >
            <Gear className="w-5 h-5 text-ink-400" />
            Pengaturan
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
          >
            <SignOut className="w-5 h-5 text-ink-400" />
            Keluar
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl bg-ink-50">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-ink-900 truncate">
                {user?.name ?? "Pengguna"}
              </p>
              <p className="text-xs text-ink-400 truncate">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-4 h-14 bg-white border-b border-ink-100 lg:hidden">
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

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
