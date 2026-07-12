"use client";

import { useState, useEffect, useRef } from "react";
import {
  CalendarBlank,
  Users,
  Certificate,
  TrendUp,
  CheckCircle,
  Clock,
  ArrowRight,
  DownloadSimple,
  Bell,
  Lightning,
  QrCode,
  ChartBar,
  Gear,
  UserPlus,
  Palette,
  CaretUp,
  Envelope,
  Warning,
  Sparkle,
  Info,
  X,
  FileText,
  PaperPlane,
  ShieldCheck,
  Funnel,
  Briefcase,
  Globe,
  Sliders,
  Database,
  ArrowSquareOut
} from "@phosphor-icons/react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "@/lib/hooks/useTranslation";
import DashboardPlanCard from "./DashboardPlanCard";

type DashboardClientProps = {
  sessionUser: { name?: string | null; email?: string | null };
  totalTemplates: number;
  userPlan: string;
  data: {
    totalEvents: number;
    totalParticipants: number;
    totalCertificates: number;
    totalVerifications: number;
    eventsThisMonth: number;
    recentEvents: Array<{
      id: string;
      name: string;
      status: string;
      date: Date | string;
      _count: { participants: number };
    }>;
    recentCertificates: Array<{
      id: string;
      serialNumber: string;
      verifiedCount: number;
      issuedAt: Date | string;
      participant: { name: string; email?: string | null };
      batch: { event: { name: string } };
    }>;
    recentParticipants: Array<{
      id: string;
      name: string;
      email: string;
      createdAt: Date | string;
      event: { name: string };
    }>;
    upcomingEvents: Array<{
      id: string;
      name: string;
      status: string;
      date: Date | string;
      _count: { participants: number };
    }>;
  };
};

type NotificationItem = {
  id: string;
  type: "welcome" | "cert_generated" | "participant_imported" | "event_created" | "qr_verified" | "email_delivered" | "subscription_expiring" | "system_update";
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const STATUS_CONFIG: Record<
  string,
  { label: { id: string; en: string }; className: string }
> = {
  DRAFT: { label: { id: "Draft", en: "Draft" }, className: "badge-amber" },
  ACTIVE: { label: { id: "Aktif", en: "Active" }, className: "badge-brand" },
  COMPLETED: { label: { id: "Selesai", en: "Completed" }, className: "badge-green" },
  ARCHIVED: {
    label: { id: "Diarsipkan", en: "Archived" },
    className: "bg-ink-100 text-ink-500 inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-2.5 py-1"
  },
};

const NOTIFICATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  welcome: Sparkle,
  cert_generated: Certificate,
  participant_imported: Users,
  event_created: CalendarBlank,
  qr_verified: QrCode,
  email_delivered: Envelope,
  subscription_expiring: Warning,
  system_update: Sparkle,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  welcome: "bg-brand-50 text-brand-600 border border-brand-100",
  cert_generated: "bg-amber-50 text-amber-600 border border-amber-100",
  participant_imported: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  event_created: "bg-blue-50 text-blue-600 border border-blue-100",
  qr_verified: "bg-purple-50 text-purple-600 border border-purple-100",
  email_delivered: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  subscription_expiring: "bg-rose-50 text-rose-600 border border-rose-100",
  system_update: "bg-pink-50 text-pink-600 border border-pink-100",
};

export default function DashboardClient({
  sessionUser,
  totalTemplates,
  userPlan,
  data,
}: DashboardClientProps) {
  const { t, lang } = useTranslation();
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  const activePlan = (userPlan || "FREE").toUpperCase();

  // Load notifications from localStorage to persist read states across reloads
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("sertifkilat_notifications");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notifications", e);
      }
    } else {
      const initial: NotificationItem[] = [
        {
          id: "1",
          type: "welcome",
          title: lang === "id" ? "Welcome to SertifKilat.id" : "Welcome to SertifKilat.id",
          description: lang === "id" ? "Mulai dengan membuat event pertamamu dan terbitkan sertifikat." : "Get started by creating your first event and generating credentials.",
          time: lang === "id" ? "Baru saja" : "Just now",
          read: false,
        },
        {
          id: "2",
          type: "event_created",
          title: lang === "id" ? "Event Created" : "Event Created",
          description: lang === "id" ? "Event 'Webinar UI/UX' berhasil didaftarkan." : "Event 'UI/UX Webinar' successfully registered.",
          time: lang === "id" ? "5 menit yang lalu" : "5 mins ago",
          read: false,
        },
        {
          id: "3",
          type: "participant_imported",
          title: lang === "id" ? "Excel Imported" : "Excel Imported",
          description: lang === "id" ? "120 peserta baru diimpor ke event 'Lomba Poster'." : "120 new participants imported to event 'Poster Competition'.",
          time: lang === "id" ? "1 jam yang lalu" : "1 hour ago",
          read: false,
        },
        {
          id: "4",
          type: "cert_generated",
          title: lang === "id" ? "Certificates Generated" : "Certificates Generated",
          description: lang === "id" ? "Batch 'Webinar UI/UX' telah selesai dibuat (25 sertifikat)." : "Batch 'UI/UX Webinar' successfully generated (25 certificates).",
          time: lang === "id" ? "2 jam yang lalu" : "2 hours ago",
          read: true,
        },
        {
          id: "5",
          type: "system_update",
          title: lang === "id" ? "Template Updated" : "Template Updated",
          description: lang === "id" ? "Template 'Sertifikat Formal' diperbarui oleh system." : "Template 'Sertifikat Formal' updated by system.",
          time: lang === "id" ? "1 hari yang lalu" : "1 day ago",
          read: true,
        },
      ];
      setNotifications(initial);
      localStorage.setItem("sertifkilat_notifications", JSON.stringify(initial));
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [lang]);

  // Client-side greeting banner & current date
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      setGreeting(lang === "id" ? "Selamat Pagi" : "Good Morning");
    } else if (hours >= 12 && hours < 18) {
      setGreeting(lang === "id" ? "Selamat Siang" : "Good Afternoon");
    } else {
      setGreeting(lang === "id" ? "Selamat Malam" : "Good Evening");
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(new Date().toLocaleDateString(lang === "id" ? "id-ID" : "en-US", options));
  }, [lang]);

  // Click outside & Escape hooks for notifications dropdown
  const notificationRef = useRef<HTMLDivElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const saveNotificationsState = (updatedList: NotificationItem[]) => {
    setNotifications(updatedList);
    localStorage.setItem("sertifkilat_notifications", JSON.stringify(updatedList));
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotificationsState(updated);
  };

  const handleClearAll = () => {
    saveNotificationsState([]);
  };

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotificationsState(updated);
  };

  // Recent Activity Timeline items
  const activities = [
    {
      type: "event_created",
      title: lang === "id" ? "Event Created" : "Event Created",
      desc: lang === "id" ? "Event 'Webinar UI/UX' dibuat." : "Event 'UI/UX Webinar' created.",
      time: lang === "id" ? "5 menit yang lalu" : "5 mins ago",
      icon: CalendarBlank,
      color: "bg-blue-50 text-blue-600 border border-blue-100",
    },
    {
      type: "participant_imported",
      title: lang === "id" ? "Participant Imported" : "Participant Imported",
      desc: lang === "id" ? "Mengimpor 120 peserta baru ke event 'Lomba Poster'." : "Imported 120 new participants to 'Poster Competition' event.",
      time: lang === "id" ? "45 menit yang lalu" : "45 mins ago",
      icon: UserPlus,
      color: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
    {
      type: "cert_generated",
      title: lang === "id" ? "Certificate Generated" : "Certificate Generated",
      desc: lang === "id" ? "25 Sertifikat massal diterbitkan." : "25 bulk certificates generated.",
      time: lang === "id" ? "2 jam yang lalu" : "2 hours ago",
      icon: Certificate,
      color: "bg-amber-50 text-amber-600 border border-amber-100",
    },
    {
      type: "zip_downloaded",
      title: lang === "id" ? "ZIP Downloaded" : "ZIP Downloaded",
      desc: lang === "id" ? "ZIP file unduhan diekspor." : "ZIP download archive exported.",
      time: lang === "id" ? "1 hari yang lalu" : "1 day ago",
      icon: DownloadSimple,
      color: "bg-rose-50 text-rose-600 border border-rose-100",
    },
    {
      type: "qr_verified",
      title: lang === "id" ? "QR Verified" : "QR Verified",
      desc: lang === "id" ? "Sertifikat #SK-9281-A01 berhasil diverifikasi." : "Certificate #SK-9281-A01 verified.",
      time: lang === "id" ? "2 hari yang lalu" : "2 days ago",
      icon: QrCode,
      color: "bg-purple-50 text-purple-600 border border-purple-100",
    },
    {
      type: "template_updated",
      title: lang === "id" ? "Template Updated" : "Template Updated",
      desc: lang === "id" ? "Template 'Sertifikat Formal' diperbarui." : "Template 'Sertifikat Formal' updated.",
      time: lang === "id" ? "3 hari yang lalu" : "3 days ago",
      icon: Palette,
      color: "bg-pink-50 text-pink-600 border border-pink-100",
    },
    {
      type: "email_sent",
      title: lang === "id" ? "Email Sent (Placeholder)" : "Email Sent (Placeholder)",
      desc: lang === "id" ? "Email pengiriman laporan disiapkan." : "Certificate email delivery logs generated.",
      time: lang === "id" ? "4 hari yang lalu" : "4 days ago",
      icon: PaperPlane,
      color: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    },
  ];

  // 5 Statistics definition (Always visible)
  const stats = [
    {
      label: lang === "id" ? "Sertifikat Diterbitkan" : "Certificates Issued",
      value: data.totalCertificates,
      icon: Certificate,
      color: "from-amber-500/10 to-amber-500/20 text-amber-600 border-amber-200/60",
      growth: "+14.2%",
      desc: lang === "id" ? "Sertifikat berhasil dibuat" : "Successfully generated certs",
    },
    {
      label: lang === "id" ? "Total Peserta" : "Total Participants",
      value: data.totalParticipants,
      icon: Users,
      color: "from-emerald-500/10 to-emerald-500/20 text-emerald-600 border-emerald-200/60",
      growth: "+8.5%",
      desc: lang === "id" ? "Peserta terdaftar di sistem" : "Registered across all events",
    },
    {
      label: lang === "id" ? "Event Dibuat" : "Events Created",
      value: data.totalEvents,
      icon: CalendarBlank,
      color: "from-blue-500/10 to-blue-500/20 text-blue-600 border-blue-200/60",
      growth: "+12.0%",
      desc: lang === "id" ? "Kegiatan aktif & selesai" : "Active & completed events",
    },
    {
      label: lang === "id" ? "Verifikasi QR Scans" : "QR Verified Scans",
      value: data.totalVerifications,
      icon: CheckCircle,
      color: "from-purple-500/10 to-purple-500/20 text-purple-600 border-purple-200/60",
      growth: "+22.4%",
      desc: lang === "id" ? "Scan validasi keaslian" : "Authenticity checks passed",
    },
    {
      label: lang === "id" ? "Total Unduhan" : "Total Downloads",
      value: Math.floor(data.totalCertificates * 0.94),
      icon: DownloadSimple,
      color: "from-rose-500/10 to-rose-500/20 text-rose-600 border-rose-200/60",
      growth: "+15.8%",
      desc: lang === "id" ? "PDF & ZIP berhasil diunduh" : "PDFs & ZIP archives downloaded",
    },
  ];

  // Quick Actions shortcuts
  const quickActions = [
    {
      href: "/dashboard/events?new=1",
      icon: CalendarBlank,
      title: lang === "id" ? "Buat Event" : "Create Event",
      desc: lang === "id" ? "Mulai event baru & kelola sertifikat" : "Start a new event and configure certificate",
      borderColor: "hover:border-blue-300 hover:bg-blue-50/10",
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      href: "/dashboard/participants",
      icon: UserPlus,
      title: lang === "id" ? "Impor Peserta" : "Import Participants",
      desc: lang === "id" ? "Unggah file Excel/CSV peserta" : "Upload participant database from Excel/CSV",
      borderColor: "hover:border-emerald-300 hover:bg-emerald-50/10",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      href: "/dashboard/generator",
      icon: Certificate,
      title: lang === "id" ? "Terbitkan Sertifikat" : "Generate Certificate",
      desc: lang === "id" ? "Generate sertifikat massal otomatis" : "Generate certificates for all participants instantly",
      borderColor: "hover:border-amber-300 hover:bg-amber-50/10",
      iconBg: "bg-amber-50 text-amber-600",
    },
    {
      href: "/dashboard/templates",
      icon: Palette,
      title: lang === "id" ? "Kelola Template" : "Manage Templates",
      desc: lang === "id" ? "Kustomisasi template sertifikat" : "Explore and customize professional templates",
      borderColor: "hover:border-purple-300 hover:bg-purple-50/10",
      iconBg: "bg-purple-50 text-purple-600",
    },
    {
      href: "/verify/scan",
      icon: QrCode,
      title: lang === "id" ? "Verifikasi Sertifikat" : "Verify Certificate",
      desc: lang === "id" ? "Periksa keaslian file via QR Code" : "Verify certificate authenticity using QR validation",
      borderColor: "hover:border-rose-300 hover:bg-rose-50/10",
      iconBg: "bg-rose-50 text-rose-600",
    },
    {
      href: "/dashboard/analytics",
      icon: ChartBar,
      title: lang === "id" ? "Analisis Data" : "Analytics Data",
      desc: lang === "id" ? "Lihat grafik scan & statistik detail" : "Track generation logs and real-time QR scans",
      borderColor: "hover:border-indigo-300 hover:bg-indigo-50/10",
      iconBg: "bg-indigo-50 text-indigo-600",
    },
    {
      href: "/dashboard/settings",
      icon: Gear,
      title: lang === "id" ? "Pengaturan" : "Settings",
      desc: lang === "id" ? "Kelola profil & konfigurasi akun" : "Manage your platform settings & profile",
      borderColor: "hover:border-ink-300 hover:bg-ink-50",
      iconBg: "bg-ink-100 text-ink-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Sticky Top Action Bar ── */}
      <div className="sticky top-0 z-30 bg-ink-50/80 backdrop-blur-md border-b border-ink-100 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between -mt-4 md:-mt-6 lg:-mt-8 mb-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-ink-950 tracking-tight uppercase bg-bg-card border border-ink-150 px-3 py-1.5 rounded-xl">
            {t("dashboard.sidebar.dashboard")}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-bg-card border border-ink-150 rounded-xl px-3 py-1.5 shadow-sm">
            <Lightning weight="fill" className={`w-3.5 h-3.5 ${activePlan === "FREE" ? "text-ink-400" : activePlan === "PRO" ? "text-brand-500" : "text-amber-500"}`} />
            <span className="text-[10px] font-extrabold text-ink-800 tracking-wider">
              {activePlan} PLAN
            </span>
          </div>

          {/* Notification bell dropdown */}
          <div className="relative">
            <button
              ref={bellButtonRef}
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="w-9 h-9 rounded-xl border border-ink-150 bg-bg-card hover:bg-ink-50 flex items-center justify-center text-ink-600 transition-all cursor-pointer relative shadow-sm"
            >
              <Bell className="w-5 h-5" />
              {isMounted && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div
                ref={notificationRef}
                className="absolute right-0 mt-2 w-[360px] bg-bg-card border border-ink-150 rounded-2xl shadow-xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-ink-50/50 border-b border-ink-100">
                  <span className="text-xs font-extrabold text-ink-900">{lang === "id" ? "Notifikasi" : "Notifications"}</span>
                  {notifications.length > 0 && (
                    <div className="flex gap-2">
                      <button onClick={handleMarkAllAsRead} className="text-[10px] text-brand-600 hover:text-brand-700 font-bold">
                        {lang === "id" ? "Tandai dibaca" : "Mark all read"}
                      </button>
                      <span className="text-ink-300">·</span>
                      <button onClick={handleClearAll} className="text-[10px] text-rose-600 hover:text-rose-700 font-bold">
                        {lang === "id" ? "Bersihkan" : "Clear all"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-ink-50">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                        <CheckCircle className="w-5 h-5" weight="fill" />
                      </div>
                      <p className="text-xs font-bold text-ink-900">{lang === "id" ? "Semua Beres!" : "You're all caught up."}</p>
                      <p className="text-[10px] text-ink-400">{lang === "id" ? "Tidak ada notifikasi baru." : "No new notifications."}</p>
                    </div>
                  ) : (
                    notifications.map((item) => {
                      const Icon = NOTIFICATION_ICONS[item.type] || Info;
                      const colorClass = NOTIFICATION_COLORS[item.type] || "bg-ink-50 text-ink-600";
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleMarkAsRead(item.id)}
                          className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-ink-50/50 ${
                            !item.read ? "bg-brand-50/10" : ""
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-xs font-bold truncate ${!item.read ? "text-ink-900" : "text-ink-600"}`}>
                                {item.title}
                              </p>
                              <span className="text-[9px] text-ink-450 font-semibold">{item.time}</span>
                            </div>
                            <p className="text-[10px] text-ink-500 mt-0.5 leading-normal">{item.description}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/dashboard/generator"
            className="btn-primary shadow-sm hover:shadow-md transition-all font-bold text-xs !py-2"
          >
            <Certificate className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === "id" ? "Generate Sertifikat" : "Generate Certificate"}</span>
            <span className="sm:hidden">{lang === "id" ? "Generate" : "Generate"}</span>
          </Link>
        </div>
      </div>

      {/* ── Page Greeting & Title ── */}
      <div className="card p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink-400 uppercase tracking-widest bg-ink-50 px-2.5 py-1 rounded-lg">
              {greeting || "Welcome"}
            </span>
            {currentDate && <span className="text-xs text-ink-400 font-semibold">· {currentDate}</span>}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink-950 tracking-tight">
            {lang === "id" ? "Halo, " : "Hello, "}{sessionUser.name || "User"} 👋
          </h1>
          <p className="text-sm text-ink-500 font-medium">
            {lang === "id" ? "Kelola platform sertifikat Anda dengan efisien." : "Manage your certificate platform efficiently."}
          </p>
        </div>
      </div>

      {/* ── Plan Summary / Limit Card ── */}
      <DashboardPlanCard 
        plan={activePlan} 
        templatesCount={totalTemplates} 
        certificatesCount={data.totalCertificates} 
        participantsCount={data.totalParticipants} 
      />

      {/* ── 5 Premium Statistics Cards (Always visible on all plans!) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="card p-5 hover:scale-[1.02] hover:shadow-md transition-all duration-300 shadow-sm relative overflow-hidden group flex flex-col justify-between"
            >
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">{stat.label}</span>
                  <div className="w-8 h-8 bg-ink-50 rounded-lg flex items-center justify-center border border-ink-100 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4 text-ink-800" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-ink-950 tracking-tight tabular-nums">{stat.value}</h2>
                  <p className="text-[10px] text-ink-400 mt-1 font-medium truncate">{stat.desc}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-ink-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                  <CaretUp className="w-3 h-3" weight="fill" />
                  {stat.growth}
                </span>
                <span className="text-[9px] text-ink-400 font-semibold uppercase">{lang === "id" ? "Bulan Ini" : "This Month"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Quick Actions Grid ── */}
      <div className="card p-5 shadow-sm space-y-4">
        <div>
          <h2 className="font-extrabold text-ink-900 text-sm">{t("dashboard.home.quickActions")}</h2>
          <p className="text-[11px] text-ink-400 mt-0.5">{lang === "id" ? "Akses fitur utama platform dengan cepat" : "Quick access shortcuts for key platform services"}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className={`flex items-start gap-4 p-4 rounded-2xl border border-ink-150 transition-all duration-300 group ${action.borderColor} hover:scale-[1.02] hover:shadow-sm`}
              >
                <div className={`w-10 h-10 rounded-xl ${action.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="w-5 h-5" weight="fill" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-bold text-ink-900 group-hover:text-brand-600 transition-colors">{action.title}</p>
                  <p className="text-[10px] text-ink-400 font-medium leading-relaxed">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Main Multi-Column Content Section ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Analytics (Pro/Business Only) + Lists & Tables (Always visible) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* 1. Pro / Business Analytics Overview charts */}
          {(activePlan === "PRO" || activePlan === "BUSINESS") && (
            <div className="card p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-ink-100">
                <div>
                  <h2 className="font-extrabold text-ink-900 text-sm">{lang === "id" ? "Ikhtisar Analitik (PRO)" : "Analytics Overview (PRO)"}</h2>
                  <p className="text-[10px] text-ink-400">{lang === "id" ? "Pertumbuhan sertifikat, scan QR, dan konversi." : "Certificate generation, QR scans, and conversion logs."}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-ink-50 px-2 py-1 rounded-lg border border-ink-150">
                  <Funnel className="w-3.5 h-3.5 text-ink-500" />
                  <span className="text-[10px] font-bold text-ink-700">6 {lang === "id" ? "Bulan Terakhir" : "Months"}</span>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-44 bg-ink-50 rounded-xl animate-pulse flex flex-col justify-between p-4" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Chart A: Certificates Per Month */}
                  <div className="border border-ink-150 rounded-xl p-4 space-y-4">
                    <span className="text-[10px] font-extrabold text-ink-400 uppercase tracking-widest">{lang === "id" ? "Sertifikat Dibuat / Bulan" : "Certificates Generated / Mo"}</span>
                    <div className="h-28 flex items-end justify-between pt-4 gap-2">
                      {[
                        { m: "Jan", v: 45 },
                        { m: "Feb", v: 80 },
                        { m: "Mar", v: 120 },
                        { m: "Apr", v: 95 },
                        { m: "May", v: 150 },
                        { m: "Jun", v: 210 },
                      ].map((item) => (
                        <div key={item.m} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                          <div className="relative w-full flex justify-center">
                            <div 
                              style={{ height: `${(item.v / 210) * 80}px` }}
                              className="w-5 bg-gradient-to-t from-brand-500 to-brand-400 rounded-t group-hover:from-brand-600 group-hover:to-brand-500 transition-all duration-300"
                            />
                          </div>
                          <span className="text-[9px] font-bold text-ink-400">{item.m}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart B: Participants Growth */}
                  <div className="border border-ink-150 rounded-xl p-4 space-y-4">
                    <span className="text-[10px] font-extrabold text-ink-400 uppercase tracking-widest">{lang === "id" ? "Pertumbuhan Peserta" : "Participants Cumulative Growth"}</span>
                    <div className="h-28 relative pt-2">
                      <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M 0 50 Q 20 38 40 25 T 80 12 T 100 5 L 100 50 Z" fill="url(#areaGrad)" />
                        <path d="M 0 50 Q 20 38 40 25 T 80 12 T 100 5" fill="none" stroke="rgb(16, 185, 129)" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      <div className="flex justify-between mt-2 border-t border-ink-100 pt-1">
                        <span className="text-[8px] font-bold text-ink-400">Jan</span>
                        <span className="text-[8px] font-bold text-ink-400">Jun</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart C: QR Verification Trend */}
                  <div className="border border-ink-150 rounded-xl p-4 space-y-4">
                    <span className="text-[10px] font-extrabold text-ink-400 uppercase tracking-widest">{lang === "id" ? "Aktivitas Scan QR" : "QR Verification Logs"}</span>
                    <div className="h-28 relative pt-2">
                      <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                        <path d="M 0 45 L 20 20 L 40 38 L 60 10 L 80 25 L 100 8" fill="none" stroke="rgb(139, 92, 246)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {/* Chart D: Download stats Horizontal Bars */}
                  <div className="border border-ink-150 rounded-xl p-4 space-y-4">
                    <span className="text-[10px] font-extrabold text-ink-400 uppercase tracking-widest">{lang === "id" ? "Format File Diunduh" : "Download Format Conversion"}</span>
                    <div className="h-28 flex flex-col justify-around">
                      {[
                        { fmt: "PDF Document", pct: "75%", color: "bg-rose-500" },
                        { fmt: "ZIP Bundle", pct: "18%", color: "bg-brand-500" },
                        { fmt: "PNG/JPG Image", pct: "7%", color: "bg-amber-500" },
                      ].map((item) => (
                        <div key={item.fmt} className="space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-bold text-ink-700">
                            <span>{item.fmt}</span>
                            <span>{item.pct}</span>
                          </div>
                          <div className="h-2 w-full bg-ink-100 rounded-full overflow-hidden">
                            <div style={{ width: item.pct }} className={`h-full ${item.color} rounded-full`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart E: Email Delivery Statistics spark card */}
                  <div className="md:col-span-2 border border-ink-150 rounded-xl p-4 flex items-center justify-between gap-6">
                    <div className="space-y-1">
                      <span className="text-[9px] font-extrabold text-ink-400 uppercase tracking-wider">Email Delivery Stats</span>
                      <h4 className="text-xl font-black text-ink-950">98.4% Success</h4>
                      <p className="text-[10px] text-ink-450">74.2% Open Rate · 0.2% Bounce Rate</p>
                    </div>
                    <div className="w-36 h-12">
                      <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <path d="M 0 15 L 20 18 L 40 10 L 60 14 L 80 5 L 100 2" fill="none" stroke="rgb(79, 70, 229)" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* 2. Recent Certificates Table (Always visible) */}
          <div className="card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
              <div>
                <h2 className="font-extrabold text-ink-900 text-sm">{lang === "id" ? "Sertifikat Terbaru" : "Recent Certificates"}</h2>
                <p className="text-[10px] text-ink-400">{lang === "id" ? "Sertifikat yang baru saja diterbitkan." : "Credentials recently issued in this workspace."}</p>
              </div>
              <Link href="/dashboard/certificates" className="text-xs text-brand-600 font-bold hover:text-brand-700 flex items-center gap-1">
                {t("dashboard.home.viewAll")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-ink-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : data.totalCertificates === 0 ? (
              /* Widget-specific Empty State */
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-100">
                  <Certificate className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-ink-900">{lang === "id" ? "Belum ada sertifikat dibuat." : "No certificates generated yet."}</p>
                <p className="text-[10px] text-ink-400">{lang === "id" ? "Terbitkan sertifikat massal pertamamu sekarang." : "Start by issuing your first batch of certificates."}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-ink-50/50 border-b border-ink-100 text-[10px] font-bold text-ink-400 uppercase tracking-wider">
                      <th className="px-5 py-3">Certificate ID</th>
                      <th className="px-5 py-3">Participant</th>
                      <th className="px-5 py-3">Event</th>
                      <th className="px-5 py-3">Generated Date</th>
                      <th className="px-5 py-3 text-center">{lang === "id" ? "Jumlah Scan" : "Scan Count"}</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50 text-[11px] font-medium text-ink-700">
                    {data.recentCertificates.map((cert) => {
                      return (
                        <tr key={cert.id} className="hover:bg-ink-50/20 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-bold text-ink-900 tracking-tight">{cert.serialNumber}</td>
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-ink-900">{cert.participant.name}</p>
                            <p className="text-[9px] text-ink-450">{cert.participant.email}</p>
                          </td>
                          <td className="px-5 py-3.5 truncate max-w-[150px]">{cert.batch.event.name}</td>
                          <td className="px-5 py-3.5 text-ink-400">{formatDate(cert.issuedAt)}</td>
                          <td className="px-5 py-3.5 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold">
                              <QrCode className="w-3.5 h-3.5" />
                              {cert.verifiedCount}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Link href={`/verify/${cert.serialNumber}`} className="text-[10px] text-brand-600 hover:text-brand-700 font-bold">
                              {lang === "id" ? "Lihat" : "View"}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. Recent Events Card List (Always visible) */}
          <div className="card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
              <div>
                <h2 className="font-extrabold text-ink-900 text-sm">{lang === "id" ? "Event Terbaru" : "Recent Events"}</h2>
                <p className="text-[10px] text-ink-450">{lang === "id" ? "Daftar event yang baru saja didaftarkan." : "List of events recently registered."}</p>
              </div>
              <Link href="/dashboard/events" className="text-xs text-brand-600 font-bold hover:text-brand-700 flex items-center gap-1">
                {t("dashboard.home.viewAll")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 bg-ink-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : data.recentEvents.length === 0 ? (
              <div className="p-8 text-center text-xs text-ink-400 border border-dashed border-ink-150 m-5 rounded-xl">
                {lang === "id" ? "Belum ada event didaftarkan." : "No events created yet."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                {data.recentEvents.map((event) => {
                  const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.DRAFT;
                  const statusLabel = lang === "id" ? cfg.label.id : cfg.label.en;
                  return (
                    <div key={event.id} className="p-4 border border-ink-150 rounded-xl hover:border-brand-200 transition-colors flex flex-col justify-between gap-3 shadow-sm">
                      <div className="space-y-1">
                        <span className={`${cfg.className} text-[8px] font-extrabold px-2 py-0.5 rounded-full`}>
                          {statusLabel}
                        </span>
                        <h3 className="text-xs font-bold text-ink-950 truncate pt-1">{event.name}</h3>
                        <p className="text-[10px] text-ink-400 font-semibold">{formatDate(event.date)}</p>
                      </div>
                      <p className="text-[10px] text-ink-500 font-bold">
                        {event._count.participants} {lang === "id" ? "Peserta" : "Participants"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Recent Participants List (Always visible) */}
          <div className="card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
              <div>
                <h2 className="font-extrabold text-ink-900 text-sm">{lang === "id" ? "Pendaftaran Peserta Terakhir" : "Recent Participants"}</h2>
                <p className="text-[10px] text-ink-400">{lang === "id" ? "Daftar peserta yang baru saja ditambahkan." : "Recipient database records recently created."}</p>
              </div>
              <Link href="/dashboard/participants" className="text-xs text-brand-600 font-bold hover:text-brand-700 flex items-center gap-1">
                {t("dashboard.home.viewAll")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-5 space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-10 bg-ink-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : data.recentParticipants.length === 0 ? (
              <div className="p-8 text-center text-xs text-ink-400 border border-dashed border-ink-150 m-5 rounded-xl">
                {lang === "id" ? "Belum ada peserta diimpor." : "No participants imported yet."}
              </div>
            ) : (
              <div className="divide-y divide-ink-50">
                {data.recentParticipants.map((part) => (
                  <div key={part.id} className="flex items-center justify-between px-5 py-3 hover:bg-ink-50/50 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-ink-900">{part.name}</p>
                      <p className="text-[9px] text-ink-450">{part.email}</p>
                    </div>
                    <div className="text-right space-y-0.5 text-[9px] text-ink-400 font-semibold">
                      <span className="bg-ink-50 border border-ink-150 px-2 py-0.5 rounded text-ink-600">{part.event.name}</span>
                      <p className="pt-0.5">{formatDate(part.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Notification Center + Activities Timeline + Upcoming Widget */}
        <div className="space-y-6">
          
          {/* 1. Notification Center (Always visible) */}
          <div className="card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100">
              <div>
                <h2 className="font-extrabold text-ink-900 text-sm">{lang === "id" ? "Pusat Notifikasi" : "Notification Center"}</h2>
                <p className="text-[10px] text-ink-450">{lang === "id" ? "Pemberitahuan penting untuk akun Anda." : "Important alerts for your account."}</p>
              </div>
              {notifications.length > 0 && (
                <button onClick={handleMarkAllAsRead} className="text-[10px] text-brand-600 hover:text-brand-700 font-bold transition-colors">
                  {lang === "id" ? "Tandai dibaca" : "Mark all read"}
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-10 bg-ink-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2 border border-dashed border-ink-150 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto" weight="fill" />
                <p className="text-xs font-bold text-ink-950">{lang === "id" ? "Semua Beres!" : "No new notifications."}</p>
              </div>
            ) : (
              <div className="divide-y divide-ink-50 max-h-[300px] overflow-y-auto pr-1">
                {notifications.map((item) => {
                  const Icon = NOTIFICATION_ICONS[item.type] || Info;
                  const colorClass = NOTIFICATION_COLORS[item.type] || "bg-ink-50 text-ink-600";
                  return (
                    <div key={item.id} className="flex items-start gap-3 py-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-bold truncate ${!item.read ? "text-ink-900" : "text-ink-650"}`}>{item.title}</p>
                          <span className="text-[9px] text-ink-400 font-semibold">{item.time}</span>
                        </div>
                        <p className="text-[10px] text-ink-500 mt-0.5 leading-normal">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Recent Activity Timeline (Always visible) */}
          <div className="card p-5 shadow-sm space-y-4">
            <div>
              <h2 className="font-extrabold text-ink-900 text-sm">{lang === "id" ? "Log Aktivitas Workspace" : "Recent Activity Timeline"}</h2>
              <p className="text-[10px] text-ink-450">{lang === "id" ? "Aktivitas terbaru di akun Anda." : "Realtime activity timeline logs."}</p>
            </div>

            {loading ? (
              <div className="space-y-4 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-ink-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="relative border-l border-ink-150 pl-4 ml-3 py-2 space-y-5">
                {activities.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div key={act.title} className="relative group">
                      <span className="absolute -left-[27px] top-0.5 w-6.5 h-6.5 rounded-full bg-bg-card border border-ink-150 flex items-center justify-center">
                        <span className={`w-4.5 h-4.5 rounded-md flex items-center justify-center ${act.color}`}>
                          <Icon className="w-2.5 h-2.5" />
                        </span>
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-xs font-bold text-ink-900">{act.title}</h3>
                          <span className="text-[9px] text-ink-400 font-semibold uppercase">{act.time}</span>
                        </div>
                        <p className="text-[10px] text-ink-500">{act.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Upcoming Events Widget (Always visible) */}
          <div className="card p-5 shadow-sm space-y-4">
            <div>
              <h2 className="font-extrabold text-ink-900 text-sm">{lang === "id" ? "Event Mendatang" : "Upcoming Events"}</h2>
              <p className="text-[10px] text-ink-450">{lang === "id" ? "Jadwal kegiatan dalam waktu dekat." : "Scheduled participant batches."}</p>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-10 bg-ink-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : data.upcomingEvents.length === 0 ? (
              <div className="py-6 text-center text-xs text-ink-400 border border-dashed border-ink-150 rounded-xl">
                {lang === "id" ? "Tidak ada event mendatang." : "No upcoming events scheduled."}
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingEvents.map((event) => {
                  const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.DRAFT;
                  const statusLabel = lang === "id" ? cfg.label.id : cfg.label.en;
                  return (
                    <div key={event.id} className="p-3 border border-ink-150 rounded-xl hover:border-brand-200 transition-colors flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-ink-900 truncate">{event.name}</p>
                        <p className="text-[9px] text-ink-400 font-semibold">{formatDate(event.date)}</p>
                      </div>
                      <div className="text-right shrink-0 space-y-0.5">
                        <span className={`${cfg.className} text-[8px] font-extrabold px-1.5 py-0.5 rounded-full`}>
                          {statusLabel}
                        </span>
                        <p className="text-[9px] text-ink-450 font-bold">{event._count.participants} {lang === "id" ? "Peserta" : "Participants"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ── 4. BUSINESS PLAN (Visible only to Business) ── */}
      {activePlan === "BUSINESS" && (
        <div className="card p-5 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-ink-100">
            <div>
              <h2 className="font-extrabold text-amber-600 text-sm flex items-center gap-1.5">
                <Briefcase weight="fill" className="text-amber-500" />
                {lang === "id" ? "Panel Administrasi Bisnis & Tim" : "Business & Team Administration"}
              </h2>
              <p className="text-[10px] text-ink-400">{lang === "id" ? "Kelola multi-admin, API token, status white label, dan audit log organisasi." : "Organization analytics, audit logs, API usage limits, and whitelabel domains."}</p>
            </div>
            <span className="text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
              BUSINESS COMPLIANCE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Organization Analytics & API Usage */}
            <div className="border border-ink-150 rounded-xl p-4 space-y-4">
              <span className="text-[10px] font-extrabold text-ink-400 uppercase tracking-widest flex items-center gap-1">
                <Database />
                API Usage & Quota
              </span>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-ink-700 flex justify-between">
                    <span>Endpoint Requests</span>
                    <span>4,520 / 10,000</span>
                  </p>
                  <div className="w-full bg-ink-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full rounded-full" style={{ width: "45.2%" }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-ink-700 flex justify-between">
                    <span>Rate Limits (Req/Min)</span>
                    <span>180 / 500</span>
                  </p>
                  <div className="w-full bg-ink-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "36%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* White Label Status */}
            <div className="border border-ink-150 rounded-xl p-4 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-ink-400 uppercase tracking-widest flex items-center gap-1">
                  <Globe />
                  White Label Settings
                </span>
                <div className="p-3 bg-ink-50 rounded-lg border border-ink-150">
                  <p className="text-[10px] font-bold text-ink-450">CUSTOM DOMAIN</p>
                  <p className="text-xs font-black text-ink-800 flex items-center gap-1.5 mt-0.5">
                    sertifikat.mycompany.com
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  </p>
                </div>
              </div>
              <button className="text-[10px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5">
                Manage Domain DNS Settings
                <ArrowSquareOut />
              </button>
            </div>

            {/* Multi Admin Overview */}
            <div className="border border-ink-150 rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-extrabold text-ink-400 uppercase tracking-widest flex items-center gap-1">
                <Users />
                Multi-Admin Members (3)
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {[
                  { n: "Budi Santoso", r: "Owner", active: "Active now" },
                  { n: "Siti Rahma", r: "Editor", active: "2 hours ago" },
                  { n: "John Doe", r: "Viewer", active: "Yesterday" },
                ].map((adm) => (
                  <div key={adm.n} className="flex items-center justify-between text-[11px]">
                    <div>
                      <p className="font-bold text-ink-900">{adm.n}</p>
                      <p className="text-[9px] text-ink-400">{adm.active}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-ink-100 text-ink-700 text-[9px] font-extrabold">
                      {adm.r}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
            {/* Team Activity audit log */}
            <div className="border border-ink-150 rounded-xl p-4 space-y-4">
              <span className="text-[10px] font-extrabold text-ink-400 uppercase tracking-widest">
                Team Activity Audit Log
              </span>
              <div className="space-y-3.5">
                {[
                  { act: "Siti Rahma updated design template 'Certificate Premium'", t: "12 mins ago" },
                  { act: "Budi Santoso generated 120 verification serial codes", t: "1 hour ago" },
                  { act: "John Doe downloaded analytics report PDF", t: "4 hours ago" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-4 text-[10px]">
                    <p className="font-bold text-ink-700 leading-normal">{item.act}</p>
                    <span className="text-ink-400 font-semibold uppercase text-[9px] shrink-0 mt-0.5">{item.t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Reports Export widget */}
            <div className="border border-ink-150 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-ink-400 uppercase tracking-widest">
                  Advanced PDF/CSV Reports
                </span>
                <p className="text-[10px] text-ink-450 leading-relaxed">
                  Generate and compile detailed spreadsheets and audit files containing recipient parameters, QR scanned locations, and timeline analytics logs.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-ink-100 text-ink-800 rounded-lg text-[10px] font-bold hover:bg-ink-150 transition-colors flex items-center justify-center gap-1">
                  <DownloadSimple className="w-3.5 h-3.5" />
                  Export CSV Report
                </button>
                <button className="flex-1 py-2 bg-brand-500 text-white rounded-lg text-[10px] font-bold hover:bg-brand-600 transition-colors flex items-center justify-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  Export PDF Audit
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
