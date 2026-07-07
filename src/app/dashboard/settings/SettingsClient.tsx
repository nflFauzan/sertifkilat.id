"use client";

import { useState, useEffect, useRef } from "react";
import {
  User as UserIcon, Palette,
  Calendar, Clock, SignOut,
  Moon, Sun, Key, Check, GoogleLogo, Cpu, Sliders,
  CreditCard, Warning, ShieldCheck, ArrowRight, Hourglass, Receipt, Sparkle, Lock
} from "@phosphor-icons/react";
import { signOut } from "next-auth/react";
import { formatDate } from "@/lib/utils";
import { useSettings } from "@/lib/hooks/useSettings";
import { updatePasswordAction } from "@/app/actions/auth";
import UpgradeModal from "@/components/UpgradeModal";

type UserType = {
  name: string;
  email: string;
  role: string;
  plan: string;
  image: string | null;
  createdAt: Date | string;
  provider: string;
};

interface ToastType {
  id: number;
  message: string;
  type: "success" | "info" | "warning";
}

const TRANSLATIONS = {
  id: {
    title: "Pengaturan Sistem",
    subtitle: "Kelola preferensi tema, bahasa, format tanggal, zona waktu, informasi sistem, dan akun.",
    
    // Appearance
    appearanceTitle: "Tampilan & Gaya",
    appearanceDesc: "Sesuaikan tema visual, bahasa antarmuka, dan bahasa sertifikat Anda.",
    themeLabel: "Tema Aplikasi",
    themeDesc: "Pilih tema warna untuk antarmuka dashboard.",
    themeLight: "Terang",
    themeDark: "Gelap",
    appLangLabel: "Bahasa Aplikasi",
    appLangDesc: "Bahasa untuk menu, label, dan tombol dashboard.",
    certLangLabel: "Bahasa Sertifikat",
    certLangDesc: "Bahasa default untuk teks template sertifikat baru.",
    
    // Regional
    regionalTitle: "Regional & Waktu",
    regionalDesc: "Pilih format penanggalan dan zona waktu untuk seluruh data di aplikasi.",
    dateFormatLabel: "Format Tanggal",
    dateFormatDesc: "Format tampilan tanggal pada dashboard dan sertifikat.",
    timezoneLabel: "Zona Waktu",
    timezoneDesc: "Zona waktu lokal untuk pencatatan waktu penerbitan.",

    // Application Info
    appTitle: "Informasi Aplikasi",
    appDesc: "Detail spesifikasi teknis, framework, database, dan status sistem saat ini.",
    
    // Account
    accountTitle: "Keamanan & Akun",
    accountDesc: "Lihat ringkasan profil Anda, ubah kata sandi, atau keluar dari sesi ini.",
    profileCardTitle: "Profil Pengguna",
    fullName: "Nama Lengkap",
    email: "Alamat Email",
    role: "Peran Akun",
    createdAt: "Bergabung Sejak",
    saveBtn: "Simpan Nama",
    picChange: "Ganti Foto Profil",
    loginMethod: "Metode Masuk",
    connectedGoogle: "Terhubung dengan Google",
    
    // Password
    passwordTitle: "Ubah Kata Sandi",
    currentPass: "Kata Sandi Saat Ini",
    newPass: "Kata Sandi Baru",
    confirmNewPass: "Konfirmasi Kata Sandi Baru",
    changePassBtn: "Perbarui Kata Sandi",

    // Logout
    logoutTitle: "Keluar dari Perangkat",
    logoutDesc: "Sesi Anda pada browser ini akan dihentikan secara aman.",
    logoutBtn: "Keluar dari Akun",

    // Advanced
    advancedTitle: "Pengaturan Lanjutan",
    advancedDesc: "Kembalikan semua preferensi aplikasi ke setelan pabrik.",
    resetBtn: "Reset Ke Default",
    
    // Toasts
    toastTheme: "Tema berhasil diperbarui",
    toastLang: "Bahasa aplikasi diubah",
    toastCertLang: "Bahasa sertifikat diperbarui",
    toastDate: "Format tanggal diperbarui",
    toastTimezone: "Zona waktu diperbarui",
    toastReset: "Pengaturan berhasil direset",
    toastPass: "Kata sandi berhasil diperbarui.",
    toastProfile: "Profil berhasil diperbarui",

    // System Modal
    modalTitle: "Reset semua pengaturan?",
    modalDesc: "Tindakan ini akan mengembalikan seluruh preferensi aplikasi Anda ke setelan default bawaan.",
    modalCancel: "Batal",
    modalReset: "Reset",
  },
  en: {
    title: "System Settings",
    subtitle: "Manage your appearance themes, languages, date formats, timezones, application info, and account.",
    
    // Appearance
    appearanceTitle: "Appearance & Style",
    appearanceDesc: "Customize your visual theme, interface language, and certificate output language.",
    themeLabel: "Application Theme",
    themeDesc: "Choose the color scheme for the dashboard interface.",
    themeLight: "Light",
    themeDark: "Dark",
    appLangLabel: "Application Language",
    appLangDesc: "Language used for dashboard menus, labels, and buttons.",
    certLangLabel: "Certificate Language",
    certLangDesc: "Default language used for newly generated certificate templates.",

    // Regional
    regionalTitle: "Regional & Formats",
    regionalDesc: "Set your preferred date presentation and local timezone across the platform.",
    dateFormatLabel: "Date Format",
    dateFormatDesc: "How dates are styled on the dashboard, analytics, and templates.",
    timezoneLabel: "Timezone",
    timezoneDesc: "Local timezone for accurate date and time calculations.",

    // Application Info
    appTitle: "Application Specifications",
    appDesc: "Technical details, environment status, framework, database, and system logs.",

    // Account
    accountTitle: "Account & Security",
    accountDesc: "View your user profile overview, manage passwords, or securely log out.",
    profileCardTitle: "User Profile",
    fullName: "Full Name",
    email: "Email Address",
    role: "Account Role",
    createdAt: "Member Since",
    saveBtn: "Save Profile Name",
    picChange: "Change Avatar",
    loginMethod: "Login Method",
    connectedGoogle: "Connected with Google",

    // Password
    passwordTitle: "Change Password",
    currentPass: "Current Password",
    newPass: "New Password",
    confirmNewPass: "Confirm New Password",
    changePassBtn: "Update Password",

    // Logout
    logoutTitle: "Log Out of Device",
    logoutDesc: "Your active session on this device will be terminated securely.",
    logoutBtn: "Log Out",

    // Advanced
    advancedTitle: "Advanced Maintenance",
    advancedDesc: "Wipe custom configurations and restore system values back to default.",
    resetBtn: "Reset to Default",

    // Toasts
    toastTheme: "Theme updated successfully",
    toastLang: "Language changed",
    toastCertLang: "Certificate language updated",
    toastDate: "Date format updated",
    toastTimezone: "Timezone updated",
    toastReset: "Settings restored",
    toastPass: "Password updated successfully.",
    toastProfile: "Profile saved successfully",

    // System Modal
    modalTitle: "Reset all settings?",
    modalDesc: "This will restore all application settings back to their default values.",
    modalCancel: "Cancel",
    modalReset: "Reset",
  }
};

const DUMMY_HISTORY = [
  { id: "TX-9011", plan: "PRO PLAN", started: "01 July 2026", expired: "01 August 2026", status: "Active", amount: "Rp149.000" },
  { id: "TX-8902", plan: "PRO PLAN", started: "01 June 2026", expired: "01 July 2026", status: "Expired", amount: "Rp149.000" },
  { id: "TX-7109", plan: "FREE PLAN", started: "25 June 2025", expired: "01 June 2026", status: "Expired", amount: "Rp0" },
];

export default function SettingsClient({ user }: { user: UserType }) {
  const {
    theme,
    lang,
    certLang,
    dateFormat,
    timezone,
    setTheme,
    setLang,
    setCertLang,
    setDateFormat,
    setTimezone,
    resetToDefaults,
  } = useSettings();

  // Local Account profile states
  const [fullName, setFullName] = useState(user.name);
  const [profilePic, setProfilePic] = useState<string | null>(user.image);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // UI state variables
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [activeSection, setActiveSection] = useState("appearance");
  const isManualScrollRef = useRef(false);

  // Subscription Modal & Locks states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState("");
  const [simulatedWarningDays, setSimulatedWarningDays] = useState<number | null>(7);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  // Helper to show modern toasts
  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  // Sync profile details from localStorage if they exist
  useEffect(() => {
    const savedName = localStorage.getItem("settings_user_fullname");
    const savedPic = localStorage.getItem("settings_user_pic");
    if (savedName) setFullName(savedName);
    if (savedPic) setProfilePic(savedPic);
  }, []);

  // Update visual appearance scroll active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      if (isManualScrollRef.current) return;
      const sections = ["appearance", "regional", "application", "account", "subscription", "advanced"];
      
      // Check if we are scrolled to the bottom of the page
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (isAtBottom) {
        setActiveSection("advanced");
        return;
      }

      const scrollPos = window.scrollY + 200;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Theme switch logic
  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme);
    showToast(t.toastTheme, "success");
  };

  // Language switch logic
  const handleLangChange = (newLang: typeof lang) => {
    setLang(newLang);
    showToast(t.toastLang + ` (${newLang === "id" ? "Indonesian" : "English"})`, "success");
  };

  // Certificate Language logic
  const handleCertLangChange = (newCertLang: typeof certLang) => {
    setCertLang(newCertLang);
    showToast(t.toastCertLang, "success");
  };

  // Date format change
  const handleDateFormatChange = (newFormat: string) => {
    setDateFormat(newFormat);
    showToast(t.toastDate, "success");
  };

  // Timezone change
  const handleTimezoneChange = (newTz: string) => {
    setTimezone(newTz);
    showToast(t.toastTimezone, "success");
  };

  // Profile Save with loading effect
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      showToast(lang === "id" ? "Nama tidak boleh kosong." : "Name cannot be empty.", "warning");
      return;
    }
    setIsSavingProfile(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem("settings_user_fullname", fullName);
    setIsSavingProfile(false);
    showToast(t.toastProfile, "success");
  };

  // Change Profile Photo
  const handleUploadPic = () => {
    const fakePics = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    ];
    const picked = fakePics[Math.floor(Math.random() * fakePics.length)];
    setProfilePic(picked);
    localStorage.setItem("settings_user_pic", picked);
    showToast(lang === "id" ? "Foto profil diperbarui." : "Profile picture updated.", "success");
  };

  // Password submission action (direct secure DB modification via server action)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast(lang === "id" ? "Semua kolom kata sandi wajib diisi." : "All password fields are required.", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(lang === "id" ? "Konfirmasi kata sandi tidak cocok." : "Confirm password does not match.", "warning");
      return;
    }
    setIsSavingPassword(true);
    try {
      const res = await updatePasswordAction(currentPassword, newPassword);
      if (res && res.error) {
        showToast(lang === "id" ? `Gagal: ${res.error}` : `Error: ${res.error}`, "warning");
      } else {
        showToast(t.toastPass, "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      showToast(lang === "id" ? "Terjadi kesalahan sistem saat menyimpan." : "System error occurred during save.", "warning");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Reset setting confirm action
  const handleConfirmReset = () => {
    resetToDefaults();
    setShowResetModal(false);
    showToast(t.toastReset, "success");
  };

  // Scroll handler helper
  const scrollToId = (id: string) => {
    setActiveSection(id);
    isManualScrollRef.current = true;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        isManualScrollRef.current = false;
      }, 800);
    }
  };

  // Trigger Pro Lock Modal
  const triggerProLock = (feature: string) => {
    setLockedFeatureName(feature);
    setShowLockModal(true);
  };

  return (
    <div className="pb-24 relative text-ink-900 dark:text-ink-50">
      {/* Toast Alert System (Top Right) */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3.5 card text-ink-900 dark:text-white shadow-lg pointer-events-auto min-w-[280px] transition-all duration-300 animate-in slide-in-from-top-4"
          >
            <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white shrink-0">
              <Check className="w-3.5 h-3.5" weight="bold" />
            </div>
            <span className="text-xs font-bold leading-tight">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Modern Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md card p-6 shadow-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-ink-900 mb-2">
              {t.modalTitle}
            </h3>
            <p className="text-xs text-ink-600 mb-6 leading-relaxed">
              {t.modalDesc}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 border border-ink-250 dark:border-ink-700 text-ink-750 rounded-xl text-xs font-bold hover:bg-ink-50 dark:hover:bg-ink-800 transition-all"
              >
                {t.modalCancel}
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition-all"
              >
                {t.modalReset}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Subscription Modal Integration */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={user.plan}
      />

      {/* Premium Feature Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md card rounded-3xl p-6 md:p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center mx-auto text-amber-500">
              <Lock className="w-6 h-6" weight="bold" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-ink-900">
                {lang === "id" ? `Fitur "${lockedFeatureName}" Terkunci` : `"${lockedFeatureName}" is Available in PRO`}
              </h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                {lang === "id" 
                  ? "Tingkatkan akun Anda ke paket PRO untuk membuka fitur premium ini dan nikmati batas cetak tak terbatas." 
                  : "Upgrade your workspace to our PRO plan to unlock this advanced feature and generate massive high-quality certificates."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setShowLockModal(false);
                  setShowUpgradeModal(true);
                }}
                className="btn-primary py-2.5 text-xs font-bold w-full justify-center"
              >
                Upgrade Plan
              </button>
              <button
                onClick={() => setShowLockModal(false)}
                className="px-4 py-2.5 rounded-xl border border-ink-250 dark:border-ink-700 text-ink-650 font-bold text-xs hover:bg-ink-50 dark:hover:bg-ink-800 transition-all w-full"
              >
                {lang === "id" ? "Nanti Saja" : "Maybe Later"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="border-b border-ink-100 dark:border-ink-800 pb-6 mb-8">
        <h1 className="text-2xl font-display font-extrabold tracking-tight text-ink-900">{t.title}</h1>
        <p className="text-sm text-ink-500 mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sticky Sidebar Navigation (SaaS Style) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 space-y-1">
            {[
              { id: "appearance", label: t.appearanceTitle, icon: Palette },
              { id: "regional", label: t.regionalTitle, icon: Clock },
              { id: "application", label: t.appTitle, icon: Cpu },
              { id: "account", label: t.accountTitle, icon: UserIcon },
              { id: "subscription", label: lang === "id" ? "Langganan & Tagihan" : "Subscription & Billing", icon: CreditCard },
              { id: "advanced", label: t.advancedTitle, icon: Sliders },
            ].map(item => {
              const Icon = item.icon;
              const isSelected = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToId(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left
                    ${isSelected 
                      ? "bg-brand-500 text-white shadow-sm" 
                      : "text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-900"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Panel Area */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Section 1: Appearance */}
          <section id="appearance" className="card shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4 pb-4 border-b border-ink-100 dark:border-ink-800">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-ink-900">{t.appearanceTitle}</h2>
                <p className="text-xs text-ink-600 mt-0.5">{t.appearanceDesc}</p>
              </div>
            </div>

            {/* Theme Preference Settings */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-ink-800 block">{t.themeLabel}</label>
                <span className="text-xxs text-ink-600 block mt-0.5">{t.themeDesc}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "light", label: t.themeLight, icon: Sun },
                  { id: "dark", label: t.themeDark, icon: Moon },
                ].map(themeOption => {
                  const Icon = themeOption.icon;
                  const active = theme === themeOption.id;
                  return (
                    <button
                      key={themeOption.id}
                      onClick={() => handleThemeChange(themeOption.id as never)}
                      className={`
                        flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer
                        ${active 
                          ? "bg-brand-500 border-brand-500 text-white shadow-sm" 
                          : "border-ink-200 dark:border-ink-800 text-ink-600 hover:bg-ink-50 dark:hover:bg-ink-800"
                        }
                      `}
                    >
                      <Icon className="w-4.5 h-4.5 shrink-0" />
                      <span>{themeOption.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Application Interface Language */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-ink-800 block">{t.appLangLabel}</label>
                <span className="text-xxs text-ink-600 block mt-0.5">{t.appLangDesc}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "id", label: "Bahasa Indonesia" },
                  { id: "en", label: "English" },
                ].map(langOption => {
                  const active = lang === langOption.id;
                  return (
                    <button
                      key={langOption.id}
                      onClick={() => handleLangChange(langOption.id as never)}
                      className={`
                        p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center
                        ${active 
                          ? "bg-brand-500 border-brand-500 text-white shadow-sm" 
                          : "border-ink-200 dark:border-ink-800 text-ink-600 hover:bg-ink-50 dark:hover:bg-ink-800"
                        }
                      `}
                    >
                      {langOption.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Default Certificate Language */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold text-ink-800 block">{t.certLangLabel}</label>
                <span className="text-xxs text-ink-600 block mt-0.5">{t.certLangDesc}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "id", label: lang === "id" ? "Bahasa Indonesia" : "Indonesian" },
                  { id: "en", label: "English" },
                ].map(certLangOption => {
                  const active = certLang === certLangOption.id;
                  return (
                    <button
                      key={certLangOption.id}
                      onClick={() => handleCertLangChange(certLangOption.id as never)}
                      className={`
                        p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center
                        ${active 
                          ? "bg-brand-500 border-brand-500 text-white shadow-sm" 
                          : "border-ink-200 dark:border-ink-800 text-ink-600 hover:bg-ink-50 dark:hover:bg-ink-800"
                        }
                      `}
                    >
                      {certLangOption.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section 2: Regional */}
          <section id="regional" className="card shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4 pb-4 border-b border-ink-100 dark:border-ink-800">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-ink-900">{t.regionalTitle}</h2>
                <p className="text-xs text-ink-600 mt-0.5">{t.regionalDesc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Format Select Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-800 block">{t.dateFormatLabel}</label>
                <span className="text-xxs text-ink-600 block leading-normal">{t.dateFormatDesc}</span>
                <select
                  value={dateFormat}
                  onChange={e => handleDateFormatChange(e.target.value)}
                  className="input-field mt-2 w-full text-xs font-semibold"
                >
                  <option value="DD Month YYYY">DD Month YYYY (e.g. 12 Juni 2026)</option>
                  <option value="Month DD, YYYY">Month DD, YYYY (e.g. June 12, 2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-06-12)</option>
                </select>
              </div>

              {/* Timezone Select Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink-800 block">{t.timezoneLabel}</label>
                <span className="text-xxs text-ink-600 block leading-normal">{t.timezoneDesc}</span>
                <select
                  value={timezone}
                  onChange={e => handleTimezoneChange(e.target.value)}
                  className="input-field mt-2 w-full text-xs font-semibold"
                >
                  <option value="Asia/Jakarta">WIB — Asia/Jakarta (GMT+7)</option>
                  <option value="Asia/Makassar">WITA — Asia/Makassar (GMT+8)</option>
                  <option value="Asia/Jayapura">WIT — Asia/Jayapura (GMT+9)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 3: Application */}
          <section id="application" className="card shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4 pb-4 border-b border-ink-100 dark:border-ink-800">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-ink-900">{t.appTitle}</h2>
                <p className="text-xs text-ink-600 mt-0.5">{t.appDesc}</p>
              </div>
            </div>

            {/* Read-Only Modern Grid Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { label: lang === "id" ? "Nama Aplikasi" : "Application Name", value: "SertifKilat.id" },
                { label: lang === "id" ? "Versi" : "Version", value: "v2.0" },
                { label: lang === "id" ? "Build" : "Build", value: "Production" },
                { label: lang === "id" ? "Status" : "Status", value: "Online", isStatus: true },
                { label: "Framework", value: "Next.js 15" },
                { label: "Database", value: "PostgreSQL" },
                { label: "ORM", value: "Prisma" },
                { label: lang === "id" ? "Mesin Sertifikat" : "Certificate Engine", value: "SVG Dynamic Renderer" },
                { label: lang === "id" ? "Verifikasi QR" : "QR Verification", value: "Enabled" },
                { label: lang === "id" ? "Penyimpanan" : "Storage", value: "Local Storage" },
              ].map((spec, index) => (
                <div key={index} className="p-4 bg-ink-50/50 dark:bg-ink-800/40 border border-ink-100 dark:border-ink-800/60 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-ink-500 uppercase tracking-wider block">{spec.label}</span>
                  {spec.isStatus ? (
                    <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {spec.value}
                    </span>
                  ) : (
                    <span className="text-xs font-extrabold text-ink-800 block truncate">{spec.value}</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Account */}
          <section id="account" className="card shadow-sm p-6 md:p-8 space-y-8">
            <div className="flex items-start gap-4 pb-4 border-b border-ink-100 dark:border-ink-800">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 shrink-0">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-ink-900">{t.accountTitle}</h2>
                <p className="text-xs text-ink-600 mt-0.5">{t.accountDesc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Card Summary */}
              <div className="p-6 bg-ink-50/50 dark:bg-ink-800/40 border border-ink-100 dark:border-ink-800/60 rounded-2xl flex flex-col items-center text-center space-y-4">
                <span className="text-[10px] font-bold text-ink-500 uppercase tracking-wider block self-start">{t.profileCardTitle}</span>
                
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-ink-800 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center text-white text-2xl font-extrabold border-4 border-white dark:border-ink-850 shadow-sm">
                    {fullName ? fullName.split(" ").slice(0,2).map(x=>x[0]).join("").toUpperCase() : "?"}
                  </div>
                )}

                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-ink-900 leading-tight">{fullName}</h4>
                  <p className="text-[10px] text-ink-500 font-mono truncate max-w-[170px]">{user.email}</p>
                  <span className="inline-flex px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900 text-brand-700 dark:text-brand-400 font-extrabold text-[9px] uppercase tracking-wider">
                    {user.plan}
                  </span>
                </div>

                <div className="w-full border-t border-ink-100 dark:border-ink-800 pt-3 text-[10px] text-ink-500 space-y-1 text-left">
                  <div className="flex justify-between">
                    <span>{t.createdAt}</span>
                    <span className="font-semibold text-ink-700">{formatDate(user.createdAt)}</span>
                  </div>
                </div>

                <button
                  onClick={handleUploadPic}
                  className="w-full px-3 py-2 rounded-xl border border-ink-250 dark:border-ink-700 hover:bg-ink-100 dark:hover:bg-ink-800 font-bold text-xxs transition-all cursor-pointer"
                >
                  {t.picChange}
                </button>
              </div>

              {/* Name Info form */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-700 mb-1.5">{t.fullName}</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-700 mb-1.5">{t.email}</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="input-field bg-ink-100/40 dark:bg-ink-800/50 text-ink-500 cursor-not-allowed border border-ink-200 dark:border-ink-800"
                    />
                  </div>
                </div>

                {/* Login Method info */}
                <div className="pt-2">
                  <span className="block text-xs font-bold text-ink-700 mb-1.5">{t.loginMethod}</span>
                  {user.provider === "google" ? (
                    <div className="p-3 bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/30 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-450">
                        <GoogleLogo className="w-4 h-4 text-rose-500" weight="bold" />
                        {t.connectedGoogle}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-ink-50/50 dark:bg-ink-800/40 border border-ink-150 dark:border-ink-800/60 rounded-xl flex items-center gap-2 text-xs font-bold text-ink-600">
                      <Key className="w-4 h-4 text-ink-500" />
                      {lang === "id" ? "Pendaftaran via Email & Kata Sandi" : "Registered via Email & Password"}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="btn-primary py-2 px-5 text-xs font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingProfile ? (lang === "id" ? "Menyimpan..." : "Saving...") : t.saveBtn}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t border-ink-100 dark:border-ink-800 pt-6 space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-ink-900 flex items-center gap-2">
                  <Key className="w-4.5 h-4.5 text-brand-500" />
                  {t.passwordTitle}
                </h3>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-700 mb-1.5">{t.currentPass}</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="input-field placeholder:text-ink-400 dark:placeholder:text-ink-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-700 mb-1.5">{t.newPass}</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="input-field placeholder:text-ink-400 dark:placeholder:text-ink-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-700 mb-1.5">{t.confirmNewPass}</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="input-field placeholder:text-ink-400 dark:placeholder:text-ink-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="btn-primary py-2 px-5 text-xs font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingPassword ? (lang === "id" ? "Memproses..." : "Processing...") : t.changePassBtn}
                </button>
              </form>
            </div>

            {/* Logout warning style card */}
            <div className="border-t border-ink-100 dark:border-ink-800 pt-6 space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-ink-900 flex items-center gap-2">
                  <SignOut className="w-4.5 h-4.5 text-rose-500" />
                  {t.logoutTitle}
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-rose-150 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 rounded-xl">
                <p className="text-xxs text-rose-700 dark:text-rose-400 leading-relaxed max-w-md">
                  {t.logoutDesc}
                </p>
                <button
                  onClick={async () => {
                     await signOut({ redirect: false });
                     window.location.href = "/";
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer self-start sm:self-auto shrink-0"
                >
                  {t.logoutBtn}
                </button>
              </div>
            </div>
          </section>

          {/* Section 5: Subscription & Billing Management */}
          <section id="subscription" className="card shadow-sm p-6 md:p-8 space-y-8">
            <div className="flex items-start gap-4 pb-4 border-b border-ink-100 dark:border-ink-800">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-ink-900">{lang === "id" ? "Langganan & Tagihan" : "Subscription & Billing"}</h2>
                <p className="text-xs text-ink-600 mt-0.5">
                  {lang === "id" ? "Kelola paket langganan Anda, pantau riwayat tagihan, dan lihat kuota penggunaan fitur." : "Manage your subscription packages, view billing histories, and inspect feature usage metrics."}
                </p>
              </div>
            </div>

            {/* Interactive Expiration Warning Banners Simulator */}
            {user.plan !== "FREE" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">
                    {lang === "id" ? "Simulasi Banner Kedaluwarsa" : "Simulate Expiration Warning Banner"}
                  </h4>
                  <div className="flex items-center gap-1.5 bg-ink-50 dark:bg-ink-800 p-1 rounded-xl">
                    {[
                      { days: 7, label: "7 Days", color: "bg-amber-500 text-white" },
                      { days: 3, label: "3 Days", color: "bg-orange-500 text-white" },
                      { days: 0, label: "Expired", color: "bg-rose-500 text-white" },
                      { days: null, label: "None", color: "bg-ink-200 text-ink-700" }
                    ].map(btn => (
                      <button
                        key={btn.days ?? "none"}
                        onClick={() => setSimulatedWarningDays(btn.days)}
                        className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${
                          simulatedWarningDays === btn.days ? btn.color : "text-ink-500 hover:text-ink-900"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {simulatedWarningDays === 7 && (
                  <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-850 dark:text-amber-400 animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-2.5 text-xs font-bold">
                      <Warning className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>
                        {lang === "id" 
                          ? `⚠ Langganan ${user.plan} Anda akan berakhir dalam 7 hari.` 
                          : `⚠ Your ${user.plan} subscription expires in 7 days.`}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg transition-all shrink-0"
                    >
                      {lang === "id" ? "Perpanjang" : "Renew Now"}
                    </button>
                  </div>
                )}

                {simulatedWarningDays === 3 && (
                  <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-850 dark:text-orange-400 animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-2.5 text-xs font-bold">
                      <Warning className="w-5 h-5 text-orange-500 shrink-0" />
                      <span>
                        {lang === "id" 
                          ? `⚠ Perhatian! Langganan ${user.plan} Anda akan berakhir dalam 3 hari.` 
                          : `⚠ Warning! Your ${user.plan} subscription expires in 3 days.`}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] rounded-lg transition-all shrink-0"
                    >
                      {lang === "id" ? "Perpanjang" : "Renew Now"}
                    </button>
                  </div>
                )}

                {simulatedWarningDays === 0 && (
                  <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-400 animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-2.5 text-xs font-bold">
                      <Warning className="w-5 h-5 text-rose-500 shrink-0" />
                      <span>
                        {lang === "id" 
                          ? `⚠ Langganan ${user.plan} Anda telah Kedaluwarsa. Batas fitur standar diberlakukan.` 
                          : `⚠ Your ${user.plan} subscription has Expired. Standard limits applied.`}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] rounded-lg transition-all shrink-0"
                    >
                      {lang === "id" ? "Perbarui" : "Renew Now"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Current Plan Overview Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 p-6 bg-gradient-to-br from-brand-500 to-indigo-600 text-white rounded-2xl shadow-glow relative overflow-hidden flex flex-col justify-between h-[230px]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl -mr-6 -mt-6" />
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-brand-100 uppercase tracking-widest block">
                    {lang === "id" ? "Paket Aktif" : "Current Plan"}
                  </span>
                  <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    {user.plan === "BUSINESS" ? "BUSINESS" : user.plan === "PRO" ? "PRO PLAN" : "FREE PLAN"}
                  </h3>
                  <div className="inline-flex px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-bold uppercase tracking-wider mt-1 border border-white/10">
                    Active
                  </div>
                </div>

                <div className="space-y-3.5 pt-4">
                  <div className="flex justify-between items-center text-[10px] text-brand-100">
                    <span>{lang === "id" ? "Berakhir Pada" : "Expires On"}</span>
                    <span className="font-bold text-white">
                      {user.plan === "FREE" ? "Never" : "01 August 2026"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-brand-100">
                    <span>{lang === "id" ? "Perpanjangan Otomatis" : "Auto Renewal"}</span>
                    <span className="font-bold text-white">
                      {user.plan === "FREE" ? "OFF" : "ON"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-brand-100 border-t border-white/10 pt-2">
                    <span>{lang === "id" ? "Sisa Waktu" : "Remaining"}</span>
                    <span className="font-bold text-white">
                      {user.plan === "FREE" ? "Unlimited" : "27 Days"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Usage stats grids */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">
                  {lang === "id" ? "Statistik Penggunaan Fitur" : "Feature Usage Statistics"}
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Events Used", current: 2, limit: user.plan === "FREE" ? 3 : "∞" },
                    { label: "Participants Limit", current: 45, limit: user.plan === "FREE" ? 100 : "∞" },
                    { label: "Active Templates", current: 1, limit: user.plan === "FREE" ? 2 : "∞" },
                    { label: "Certificates Generated", current: 140, limit: user.plan === "FREE" ? 500 : "∞" },
                    { label: "Emails Sent", current: 12, limit: user.plan === "FREE" ? 100 : "∞" },
                    { label: "Storage Used", current: "12 MB", limit: user.plan === "FREE" ? "100 MB" : "∞" }
                  ].map((stat, i) => {
                    const isPercentage = typeof stat.limit === "number" && typeof stat.current === "number";
                    const percent = isPercentage ? Math.min(((stat.current as number) / (stat.limit as number)) * 100, 100) : 0;
                    return (
                      <div key={i} className="p-4 bg-ink-50/50 dark:bg-ink-800/40 border border-ink-100 dark:border-ink-850 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-ink-650">{stat.label}</span>
                          <span className="text-xs font-extrabold text-ink-800">
                            {stat.current} <span className="text-[10px] text-ink-500 font-semibold">/ {stat.limit}</span>
                          </span>
                        </div>
                        {isPercentage && (
                          <div className="w-full h-1.5 bg-ink-150 dark:bg-ink-800 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="btn-primary py-2 px-5 text-xs font-bold shadow-sm"
                  >
                    {lang === "id" ? "Tingkatkan Paket / Upgrade" : "Upgrade Plan"}
                  </button>
                  <button
                    onClick={() => triggerProLock("Email Delivery Service")}
                    className="px-4 py-2 text-xs font-bold text-brand-600 hover:bg-brand-50/50 rounded-xl border border-brand-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{lang === "id" ? "Uji Fitur PRO" : "Test PRO Feature Lock"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Locked Premium Features Showcase */}
            <div className="border-t border-ink-100 dark:border-ink-800 pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">
                    {lang === "id" ? "Fitur Eksklusif PRO & BUSINESS" : "Exclusive PRO & BUSINESS Features"}
                  </h4>
                  <p className="text-[10px] text-ink-600 mt-0.5">
                    {lang === "id" ? "Klik fitur untuk melihat detail lisensi dan membuka batasan." : "Click on features to view licensing options and trigger the lock preview."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: "White Labeling", plan: "BUSINESS" },
                  { name: "Custom Domain", plan: "BUSINESS" },
                  { name: "Approval Workflow", plan: "BUSINESS" },
                  { name: "Email Delivery API", plan: "PRO" },
                ].map((feat, idx) => (
                  <div
                    key={idx}
                    onClick={() => triggerProLock(feat.name)}
                    className="p-4 card rounded-xl flex items-center justify-between cursor-pointer hover:border-brand-500/50 hover:shadow-soft transition-all"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-extrabold text-ink-800">{feat.name}</p>
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-100/30">
                        {feat.plan}
                      </span>
                    </div>
                    <Lock className="w-4 h-4 text-ink-550 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Placeholder section */}
            <div className="border-t border-ink-100 dark:border-ink-800 pt-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-ink-900 flex items-center gap-2">
                    <Receipt className="w-4.5 h-4.5 text-indigo-500" />
                    {lang === "id" ? "Informasi Tagihan & Metode Pembayaran" : "Billing Info & Payment Options"}
                  </h3>
                  <p className="text-[10px] text-ink-600 mt-1 leading-normal">
                    {lang === "id" ? "Rincian metode pembayaran utama dan siklus penagihan reguler Anda." : "Overview of primary billing cycles and registered payment options."}
                  </p>
                </div>
                <span className="text-[9px] font-extrabold text-brand-600 bg-brand-50 px-2 py-1 rounded border border-brand-100 animate-pulse uppercase tracking-wider shrink-0">
                  Coming Soon
                </span>
              </div>

              {/* Payment Gateway Announcement */}
              <div className="p-4 border border-brand-100 bg-brand-50/15 rounded-xl text-brand-700 dark:text-brand-350 text-xs font-semibold leading-relaxed">
                🚀 {lang === "id" ? "Integrasi Gateway Pembayaran (Payment Gateway Coming Soon)" : "Payment Gateway Integration (Coming Soon)"}
                <p className="text-xxs text-ink-500 mt-1">
                  {lang === "id"
                    ? "Kami sedang mengintegrasikan Xendit & Midtrans untuk pembayaran otomatis. Saat ini Anda dapat memicu simulasi upgrade paket menggunakan menu Pembayaran Manual di atas."
                    : "We are actively integrating Stripe, Xendit, and Midtrans for automated transactions. In the meantime, you can simulate upgrades using manual payment proof verification."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-4 bg-ink-50/40 dark:bg-ink-800/25 border border-ink-100 dark:border-ink-850 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-bold text-ink-500 uppercase tracking-wider block">Siklus Penagihan</span>
                  <span className="text-xs font-extrabold text-ink-800 block">
                    {user.plan === "FREE" ? "Tidak Ada" : "Bulanan (Billed Monthly)"}
                  </span>
                </div>
                <div className="p-4 bg-ink-50/40 dark:bg-ink-800/25 border border-ink-100 dark:border-ink-850 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-bold text-ink-500 uppercase tracking-wider block">Metode Pembayaran</span>
                  <span className="text-xs font-extrabold text-ink-800 block">
                    {user.plan === "FREE" ? "None" : "QRIS / Bank Transfer"}
                  </span>
                </div>
                <div className="p-4 bg-ink-50/40 dark:bg-ink-800/25 border border-ink-100 dark:border-ink-850 rounded-xl space-y-1.5">
                  <span className="text-[9px] font-bold text-ink-500 uppercase tracking-wider block">Nominal Tagihan</span>
                  <span className="text-xs font-extrabold text-ink-800 block">
                    {user.plan === "FREE" ? "Rp0" : "Rp149.000 / month"}
                  </span>
                </div>
              </div>
            </div>

            {/* Subscription Invoice History table */}
            <div className="border-t border-ink-100 dark:border-ink-800 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">
                {lang === "id" ? "Riwayat Transaksi & Invoice" : "Transaction & Invoice History"}
              </h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-ink-100 dark:border-ink-800 text-ink-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5">Invoice ID</th>
                      <th className="py-2.5">Plan</th>
                      <th className="py-2.5">Started</th>
                      <th className="py-2.5">Expired</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DUMMY_HISTORY.map((row, i) => (
                      <tr key={i} className="border-b border-ink-50 dark:border-ink-850 text-ink-700">
                        <td className="py-3 font-mono font-bold text-brand-600">{row.id}</td>
                        <td className="py-3 font-bold">{row.plan}</td>
                        <td className="py-3">{row.started}</td>
                        <td className="py-3">{row.expired}</td>
                        <td className="py-3 font-semibold">{row.amount}</td>
                        <td className="py-3 text-right">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            row.status === "Active" 
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                              : "bg-ink-100 text-ink-500"
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 6: Advanced */}
          <section id="advanced" className="card shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4 pb-4 border-b border-ink-100 dark:border-ink-800">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-ink-900">{t.advancedTitle}</h2>
                <p className="text-xs text-ink-600 mt-0.5">{t.advancedDesc}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-ink-200 dark:border-ink-800 bg-ink-50/30 dark:bg-ink-800/10 rounded-xl">
              <div className="max-w-md">
                <span className="text-xs font-bold text-ink-800 block">{lang === "id" ? "Kembalikan Preferensi Default" : "Restore Default Preferences"}</span>
                <p className="text-xxs text-ink-600 mt-1 leading-relaxed">
                  {lang === "id" 
                    ? "Tindakan ini akan mengatur ulang tema, bahasa, format tanggal, dan zona waktu ke setelan awal." 
                    : "This action will reset theme, language, date format, and timezone back to defaults."}
                </p>
              </div>
              <button
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer self-start sm:self-auto shrink-0"
              >
                {t.resetBtn}
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
