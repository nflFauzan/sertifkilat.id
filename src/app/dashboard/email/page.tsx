"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Envelope,
  CheckCircle,
  CircleNotch,
  Warning,
  ArrowRight,
  Clock,
  X,
  Gear,
  Users,
  Calendar,
  PaperPlaneTilt,
  ChartBar,
  ArrowCounterClockwise,
  Eye,
  EnvelopeOpen,
  Bell,
  Lock,
  Plus,
  ArrowLeft
} from "@phosphor-icons/react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import UpgradeModal from "@/components/UpgradeModal";
import { getEmailLogsAction, resendEmailAction } from "@/app/actions/email";

interface ToastType {
  id: number;
  message: string;
  type: "success" | "info" | "warning";
}

interface EmailQueueItem {
  id: string;
  participant: string;
  email: string;
  event: string;
  certificate: string;
  status: "Queued" | "Sending" | "Delivered" | "Opened" | "Failed";
  sentAt: string;
  subject: string;
  deliveryTime: string;
}

const INITIAL_QUEUE: EmailQueueItem[] = [
  { id: "EM-1081", participant: "Rahma Fitria", email: "rahma.fitria@gmail.com", event: "Webinar Nasional AI 2026", certificate: "CERT-AI-081", status: "Opened", sentAt: "05 July 2026 14:22", subject: "Sertifikat Webinar Nasional AI 2026 Anda Telah Terbit", deliveryTime: "1.1s" },
  { id: "EM-1082", participant: "Fauzan Ahsan", email: "fauzan.ahsan@ui.ac.id", event: "Webinar Nasional AI 2026", certificate: "CERT-AI-082", status: "Delivered", sentAt: "05 July 2026 14:22", subject: "Sertifikat Webinar Nasional AI 2026 Anda Telah Terbit", deliveryTime: "1.4s" },
  { id: "EM-1083", participant: "Budi Santoso", email: "budi.santoso@yahoo.com", event: "Bootcamp React Specialist", certificate: "CERT-BC-109", status: "Failed", sentAt: "04 July 2026 09:15", subject: "Sertifikat Kelulusan React Specialist Bootcamp", deliveryTime: "N/A" },
  { id: "EM-1084", participant: "Aisyah Putri", email: "aisyah.putri@hotmail.com", event: "Webinar Nasional AI 2026", certificate: "CERT-AI-083", status: "Queued", sentAt: "Pending Schedule", subject: "Sertifikat Webinar Nasional AI 2026 Anda Telah Terbit", deliveryTime: "Pending" },
  { id: "EM-1085", participant: "Rian Hidayat", email: "rian.hidayat@outlook.com", event: "Workshop UI/UX Premium", certificate: "CERT-UX-204", status: "Sending", sentAt: "Just Now", subject: "Sertifikat Workshop UI/UX Premium - SertifKilat", deliveryTime: "Processing" },
];

export default function EmailCenterPage() {
  const { data: session } = useSession();
  const { lang } = useTranslation();
  const userPlan = session?.user?.plan || "FREE"; // Fallback to FREE to display premium lock banner correctly

  // Toast notification state
  const [toasts, setToasts] = useState<ToastType[]>([]);

  // Navigation states
  const [activeTab, setActiveTab] = useState<"dashboard" | "queue" | "send" | "templates" | "settings">("dashboard");
  const [emptyStateMode, setEmptyStateMode] = useState<"none" | "no_emails" | "no_failed" | "no_scheduled">("none");

  // Email Queue data states
  const [queue, setQueue] = useState<EmailQueueItem[]>(INITIAL_QUEUE);
  const [selectedEmail, setSelectedEmail] = useState<EmailQueueItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    const res = await getEmailLogsAction();
    if (res.success && res.logs && res.logs.length > 0) {
      setQueue(res.logs as any);
    } else {
      setQueue(INITIAL_QUEUE);
    }
    setIsLoadingLogs(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Template Builder states
  const [templateSubject, setTemplateSubject] = useState("Sertifikat Kelulusan: {{event}}");
  const [templateGreeting, setTemplateGreeting] = useState("Halo {{participant}},");
  const [templateBody, setTemplateBody] = useState("Selamat! Anda telah dinyatakan lulus dan berhak menerima sertifikat penghargaan untuk partisipasi Anda dalam kegiatan {{event}}.\n\nSertifikat digital Anda dapat diakses dan diunduh secara resmi melalui tautan di bawah ini.");
  const [templateFooter, setTemplateFooter] = useState("Salam hangat,\nTim Penyelenggara SertifKilat.id");

  // Send & Schedule states
  const [targetAudience, setTargetAudience] = useState<"all" | "selected" | "failed" | "test">("all");
  const [deliveryMethod, setDeliveryMethod] = useState<"now" | "later">("now");
  const [scheduleDate, setScheduleDate] = useState("2026-07-06");
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [scheduleTimezone, setScheduleTimezone] = useState("Asia/Jakarta");
  const [testEmailAddress, setTestEmailAddress] = useState("tester@example.com");

  // Upgrade Modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // SMTP Settings states
  const [senderName, setSenderName] = useState("SertifKilat Auto-mailer");
  const [replyEmail, setReplyEmail] = useState("no-reply@sertifkilat.id");
  const [emailSignature, setEmailSignature] = useState("Sent securely via SertifKilat.id");
  const [brandColor, setBrandColor] = useState("#3b82f6");

  // Simulate timeline process for selected email
  const getTimelineSteps = (status: string) => {
    const steps = [
      { key: "queued", label: lang === "id" ? "Dalam Antrean (Queued)" : "Email Queued", done: true },
      { key: "sending", label: lang === "id" ? "Proses Pengiriman (Sending)" : "Sending Process", done: status !== "Queued" },
      { key: "delivered", label: lang === "id" ? "Diterima (Delivered)" : "Delivered to Inbox", done: status !== "Queued" && status !== "Sending" && status !== "Failed" },
      { key: "opened", label: lang === "id" ? "Dibuka (Opened)" : "Opened by Recipient", done: status === "Opened" },
      { key: "downloaded", label: lang === "id" ? "Sertifikat Diunduh" : "Certificate Downloaded", done: status === "Opened" } // Mock download status
    ];
    return steps;
  };

  // Helper toast notification launcher
  const showToast = (message: string, type: "success" | "info" | "warning" = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  // Variables injector function
  const injectVariable = (variable: string, field: "subject" | "greeting" | "body" | "footer") => {
    const tag = `{{${variable}}}`;
    if (field === "subject") setTemplateSubject(prev => prev + " " + tag);
    else if (field === "greeting") setTemplateGreeting(prev => prev + " " + tag);
    else if (field === "body") setTemplateBody(prev => prev + " " + tag);
    else if (field === "footer") setTemplateFooter(prev => prev + " " + tag);
    showToast(lang === "id" ? `Variabel ${tag} disisipkan` : `Variable ${tag} inserted`, "info");
  };

  // Resend or Retry Actions
  const handleRetryEmail = async (emailId: string) => {
    // If it's a mock ID (e.g. EM-1081), just mock the response to prevent DB errors
    if (emailId.startsWith("EM-")) {
      showToast(lang === "id" ? `Mencoba mengirim ulang ${emailId}...` : `Retrying delivery for ${emailId}...`, "info");
      setQueue(prev => prev.map(item => {
        if (item.id === emailId) {
          return { ...item, status: "Sending" };
        }
        return item;
      }));
      setTimeout(() => {
        setQueue(prev => prev.map(item => {
          if (item.id === emailId) {
            showToast(lang === "id" ? `Email ${emailId} berhasil dikirim!` : `Email ${emailId} successfully sent!`, "success");
            return { ...item, status: "Delivered", sentAt: "Just Now", deliveryTime: "1.2s" };
          }
          return item;
        }));
      }, 1500);
      if (isDrawerOpen) setIsDrawerOpen(false);
      return;
    }

    showToast(lang === "id" ? "Mengirim ulang email..." : "Resending email...", "info");
    setQueue(prev => prev.map(item => {
      if (item.id === emailId) {
        return { ...item, status: "Sending" };
      }
      return item;
    }));

    const res = await resendEmailAction(emailId);
    if (res.success) {
      showToast(lang === "id" ? "Email berhasil dikirim ulang!" : "Email resent successfully!", "success");
      loadLogs();
    } else {
      showToast(res.error || (lang === "id" ? "Gagal mengirim ulang" : "Resend failed"), "warning");
      loadLogs();
    }
    if (isDrawerOpen) setIsDrawerOpen(false);
  };

  // Batch send mock submission
  const handleBatchSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userPlan === "FREE") {
      setShowUpgradeModal(true);
      return;
    }

    if (deliveryMethod === "now") {
      showToast(lang === "id" ? "Kampanye email berhasil diluncurkan!" : "Email delivery campaign launched successfully!", "success");
      // Add fake items to queue representing progress
      const newItems: EmailQueueItem[] = [
        { id: `EM-${Math.floor(1000 + Math.random()*9000)}`, participant: "Ali Wardana", email: "ali.wardana@gmail.com", event: "Webinar AI 2026", certificate: "CERT-AI-090", status: "Sending", sentAt: "Just Now", subject: templateSubject, deliveryTime: "Processing" },
        { id: `EM-${Math.floor(1000 + Math.random()*9000)}`, participant: "Siti Aminah", email: "siti.aminah@gmail.com", event: "Webinar AI 2026", certificate: "CERT-AI-091", status: "Queued", sentAt: "Just Now", subject: templateSubject, deliveryTime: "Pending" }
      ];
      setQueue(prev => [...newItems, ...prev]);
    } else {
      showToast(lang === "id" ? `Pengiriman dijadwalkan pada ${scheduleDate} ${scheduleTime} (${scheduleTimezone})` : `Delivery scheduled at ${scheduleDate} ${scheduleTime} (${scheduleTimezone})`, "success");
    }
    setActiveTab("queue");
  };

  return (
    <div className="pb-24 relative text-ink-900 dark:text-ink-50">
      {/* Toast Alert popups */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3.5 card text-ink-900 dark:text-white shadow-lg pointer-events-auto min-w-[280px] transition-all duration-300 animate-in slide-in-from-top-4"
          >
            <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white shrink-0">
              <CheckCircle className="w-4 h-4" weight="fill" />
            </div>
            <span className="text-xs font-bold leading-tight">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Upgrade Modal Integration */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={userPlan}
      />

      {/* Detail Drawer overlay */}
      {isDrawerOpen && selectedEmail && (
        <div className="fixed inset-0 z-[8000] flex justify-end bg-ink-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-bg-card h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-250 border-l border-ink-150"
          >
            <div className="space-y-6 flex-1">
              <div className="flex justify-between items-center pb-4 border-b border-ink-100 dark:border-ink-800">
                <div>
                  <span className="text-[10px] font-bold text-ink-600 uppercase tracking-widest">Detail Log Email</span>
                  <h3 className="text-base font-extrabold text-ink-900">{selectedEmail.id}</h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800 text-ink-600 hover:text-ink-900 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Header Badge details */}
              <div className="grid grid-cols-2 gap-4 bg-ink-50 dark:bg-ink-850 p-4 rounded-xl border border-ink-100 dark:border-ink-800">
                <div>
                  <span className="text-[9px] font-bold text-ink-600 uppercase tracking-wider block">Recipient</span>
                  <p className="text-xs font-bold text-ink-900 truncate">{selectedEmail.participant}</p>
                  <p className="text-[10px] text-ink-600 truncate">{selectedEmail.email}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-ink-600 uppercase tracking-wider block">Status</span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase mt-1 ${
                    selectedEmail.status === "Opened" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                    selectedEmail.status === "Delivered" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                    selectedEmail.status === "Failed" ? "bg-rose-100 text-rose-800 border border-rose-250" :
                    selectedEmail.status === "Sending" ? "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse" :
                    "bg-ink-100 text-ink-600 border border-ink-200"
                  }`}>
                    {selectedEmail.status}
                  </span>
                </div>
              </div>

              {/* Technical logs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">Log Metadata</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 card rounded-xl space-y-1">
                    <span className="text-[9px] text-ink-600 block">Event</span>
                    <span className="font-semibold text-ink-800 block truncate">{selectedEmail.event}</span>
                  </div>
                  <div className="p-3 card rounded-xl space-y-1">
                    <span className="text-[9px] text-ink-600 block">Certificate ID</span>
                    <span className="font-semibold text-ink-800 block truncate">{selectedEmail.certificate}</span>
                  </div>
                  <div className="p-3 card rounded-xl space-y-1">
                    <span className="text-[9px] text-ink-600 block">Delivery Speed</span>
                    <span className="font-semibold text-ink-800 block">{selectedEmail.deliveryTime}</span>
                  </div>
                  <div className="p-3 card rounded-xl space-y-1">
                    <span className="text-[9px] text-ink-600 block">Sent Timestamp</span>
                    <span className="font-semibold text-ink-800 block">{selectedEmail.sentAt}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Timeline Node list */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">Timeline Proses Pengiriman</h4>
                <div className="space-y-3.5 pl-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-ink-150 dark:before:bg-ink-800">
                  {getTimelineSteps(selectedEmail.status).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4 relative">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 z-10 ${
                        step.done ? "bg-brand-500 ring-4 ring-brand-100 dark:ring-brand-950/40" : "bg-ink-250 dark:bg-ink-700"
                      }`} />
                      <span className={`text-xs ${step.done ? "font-bold text-ink-900" : "text-ink-600"}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {(selectedEmail as any).previewUrl && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-250 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
                  <span className="font-bold block">✨ Ethereal Email (Received)</span>
                  <p className="text-xxs">Anda dapat memverifikasi email yang diterima dan membuka file PDF lampiran dengan mengklik link di bawah ini:</p>
                  <a 
                    href={(selectedEmail as any).previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xxs transition-colors cursor-pointer"
                  >
                    Buka Ethereal Mailbox ↗
                  </a>
                </div>
              )}

              {/* Email Content Preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">Visual Preview Email</h4>
                <div className="border border-ink-200 dark:border-ink-800 rounded-xl p-4 bg-ink-50 dark:bg-ink-950/60 font-sans text-xs space-y-4 shadow-inner">
                  <div className="border-b border-ink-200 dark:border-ink-850 pb-2 text-[10px] text-ink-600 space-y-1">
                    <div><strong>Subject:</strong> {selectedEmail.subject}</div>
                    <div><strong>From:</strong> SertifKilat Auto-mailer &lt;no-reply@sertifkilat.id&gt;</div>
                  </div>
                  <div className="space-y-2 text-ink-750">
                    <p>Halo {selectedEmail.participant},</p>
                    <p>Selamat! Anda telah dinyatakan lulus and berhak menerima sertifikat penghargaan untuk partisipasi Anda dalam kegiatan <strong>{selectedEmail.event}</strong>.</p>
                    <p>Sertifikat digital Anda dapat diakses dan diunduh secara resmi melalui tautan di bawah ini.</p>
                    <div className="py-2.5">
                      <span className="inline-block px-4 py-2 bg-brand-500 text-white rounded-lg font-bold text-[10px] uppercase shadow-sm">
                        Unduh Sertifikat ({selectedEmail.certificate})
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-ink-200 dark:border-ink-850 pt-2 text-[9px] text-ink-600 italic">
                    Sent securely via SertifKilat.id
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons footer */}
            <div className="border-t border-ink-100 dark:border-ink-800 pt-4 flex gap-3 mt-6">
              <button
                onClick={() => handleRetryEmail(selectedEmail.id)}
                className="btn-primary flex-1 justify-center py-2 text-xs cursor-pointer"
              >
                <ArrowCounterClockwise className="w-4 h-4" /> {lang === "id" ? "Kirim Ulang" : "Resend Email"}
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 rounded-xl border border-ink-250 dark:border-ink-800 text-ink-700 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-all flex-1 text-center cursor-pointer"
              >
                {lang === "id" ? "Tutup" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Lock Banner for FREE Accounts */}
      {userPlan === "FREE" && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-600 text-white shadow-glow flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Lock className="w-5 h-5" weight="bold" />
            </div>
            <div>
              <h4 className="text-sm font-black tracking-wide uppercase">Email Delivery is available in PRO</h4>
              <p className="text-xxs text-brand-100 mt-0.5">
                Unlock Unlimited Email Delivery, Batch Sending Campaigns, Custom Templates, and Detailed Delivery Analytics.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-white hover:bg-brand-50 text-brand-700 font-extrabold text-xxs rounded-xl transition-all shadow-sm"
            >
              Upgrade to PRO
            </button>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xxs rounded-xl transition-all border border-white/10"
            >
              Compare Plans
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-ink-100 dark:border-ink-800 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold tracking-tight flex items-center gap-2 text-ink-900">
            <Envelope className="w-6.5 h-6.5 text-brand-500" />
            {lang === "id" ? "Pusat Pengiriman Email" : "Email Delivery Center"}
          </h1>
          <p className="text-xs text-ink-600 mt-1">
            {lang === "id" 
              ? "Kirim sertifikat langsung ke email peserta, pantau log antrean, dan kelola template pesan." 
              : "Deliver certificates directly to participants' inboxes, check delivery queues, and style email bodies."}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="bg-ink-100 dark:bg-ink-850 p-1 rounded-2xl flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: "dashboard", label: lang === "id" ? "Dasbor" : "Dashboard" },
            { id: "queue", label: lang === "id" ? "Antrean" : "Queue Table" },
            { id: "send", label: lang === "id" ? "Kirim Sertifikat" : "Send Batch" },
            { id: "templates", label: lang === "id" ? "Template" : "Templates" },
            { id: "settings", label: lang === "id" ? "Setelan SMTP" : "Email Settings" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as never)}
              className={`px-3.5 py-2 rounded-xl text-xxs font-bold transition-all shrink-0 ${
                activeTab === tab.id 
                  ? "bg-bg-card text-brand-500 shadow-sm" 
                  : "text-ink-600 hover:text-ink-950"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT 1: DASHBOARD OVERVIEW */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Notification Alert Center cards (Requirement 12) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { text: "500 emails delivered successfully", type: "success" },
              { text: "12 emails failed delivery check", type: "warning" },
              { text: "Email campaign 'AI Webinar' finished", type: "info" },
              { text: "Manual queue retry complete", type: "success" }
            ].map((noti, idx) => (
              <div key={idx} className="p-3 card rounded-xl flex items-start gap-2.5 shadow-sm">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  noti.type === "success" ? "bg-emerald-500" :
                  noti.type === "warning" ? "bg-rose-500" : "bg-brand-500"
                }`} />
                <span className="text-[10px] font-bold text-ink-700 leading-normal">{noti.text}</span>
              </div>
            ))}
          </div>

          {/* Premium statistic cards (Requirement 2) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Total Emails Sent", num: "1,450", trend: "+14.8%", icon: Envelope, trendColor: "text-emerald-500" },
              { title: "Delivered Status", num: "1,422", trend: "+98.0%", icon: CheckCircle, trendColor: "text-emerald-500" },
              { title: "Failed Log", num: "16", trend: "-2.4%", icon: Warning, trendColor: "text-rose-500" },
              { title: "Average Speed", num: "1.2s", trend: "-0.3s", icon: Clock, trendColor: "text-emerald-500" }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="card shadow-sm p-5 hover:-translate-y-1.5 hover:shadow-soft hover:border-brand-500/50 transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-ink-600 uppercase tracking-widest block">{stat.title}</span>
                      <p className="text-2xl font-black tracking-tight text-ink-900">{stat.num}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center text-brand-500 shrink-0">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xxs font-bold">
                    <span className={stat.trendColor}>{stat.trend}</span>
                    <span className="text-ink-650 font-semibold">{lang === "id" ? "vs bulan lalu" : "vs last month"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery success progress stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 card shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">{lang === "id" ? "Rasio Pengiriman & Open Rate" : "Delivery & Open Rates"}</h4>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Delivery Success</span>
                    <span className="text-emerald-500">98.9%</span>
                  </div>
                  <div className="h-2 w-full bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "98.9%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Email Open Rate</span>
                    <span className="text-brand-500">87.5%</span>
                  </div>
                  <div className="h-2 w-full bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: "87.5%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Analytics chart placeholder (Requirement 8) */}
            <div className="p-6 card shadow-sm space-y-4 md:col-span-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">{lang === "id" ? "Volume Pengiriman Email" : "Email Sent Volume"}</h4>
                <div className="flex items-center gap-1.5 bg-ink-50 dark:bg-ink-800 p-0.5 rounded-xl">
                  {["Daily", "Weekly", "Monthly"].map(filter => (
                    <button
                      key={filter}
                      className="px-2.5 py-1 text-[9px] font-bold text-ink-650 hover:text-ink-950 rounded-lg hover:bg-bg-card transition-all"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar Chart Simulator CSS-rendered */}
              <div className="h-32 flex items-end justify-between gap-2.5 pt-4 border-b border-ink-100 dark:border-ink-800">
                {[
                  { label: "Mon", height: "35%" },
                  { label: "Tue", height: "60%" },
                  { label: "Wed", height: "85%" },
                  { label: "Thu", height: "45%" },
                  { label: "Fri", height: "95%" },
                  { label: "Sat", height: "30%" },
                  { label: "Sun", height: "20%" }
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer">
                    <div
                      className="w-full bg-brand-500/85 hover:bg-brand-500 rounded-t-md transition-all duration-200 shadow-soft"
                      style={{ height: bar.height }}
                    />
                    <span className="text-[9px] font-bold text-ink-600 group-hover:text-ink-900 shrink-0">{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: EMAIL QUEUE TABLE */}
      {activeTab === "queue" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Interactive Demo State Toggler for Empty States */}
          <div className="flex justify-between items-center bg-ink-50 dark:bg-ink-850 p-4 rounded-2xl border border-ink-100 dark:border-ink-800 flex-wrap gap-4">
            <div>
              <span className="text-xs font-extrabold text-ink-900 block">
                {lang === "id" ? "Simulasi Halaman Kosong (Empty States)" : "Simulate Page Empty States"}
              </span>
              <p className="text-[10px] text-ink-600 mt-0.5">
                {lang === "id" ? "Gunakan tombol simulator untuk menguji tampilan data kosong." : "Toggle state configurations to preview empty queue illustrations."}
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-bg-card p-1 rounded-xl border border-ink-150">
              {[
                { key: "none", label: "With Queue Data" },
                { key: "no_emails", label: "No Emails" },
                { key: "no_failed", label: "No Failed" },
                { key: "no_scheduled", label: "No Scheduled" }
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setEmptyStateMode(opt.key as never)}
                  className={`px-2.5 py-1 text-[9px] font-extrabold rounded-lg transition-all ${
                    emptyStateMode === opt.key 
                      ? "bg-brand-500 text-white" 
                      : "text-ink-600 hover:text-ink-950"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Render Empty States illustrations (Requirement 13) */}
          {emptyStateMode === "no_emails" && (
            <div className="text-center py-20 card rounded-3xl space-y-4 max-w-lg mx-auto shadow-sm animate-in zoom-in-95 duration-150">
              <div className="w-16 h-16 rounded-full bg-ink-50 dark:bg-ink-800 flex items-center justify-center mx-auto text-ink-500">
                <Envelope className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-ink-900 text-base">No Emails in Queue</h4>
                <p className="text-xs text-ink-600 max-w-xs mx-auto leading-relaxed">
                  You haven&apos;t initiated any email delivery campaign yet. Open the Batch Send tab to send your first batch.
                </p>
              </div>
              <div>
                <button
                  onClick={() => setActiveTab("send")}
                  className="btn-primary py-2 px-5 text-xs font-bold"
                >
                  Send Certificates Now
                </button>
              </div>
            </div>
          )}

          {emptyStateMode === "no_failed" && (
            <div className="text-center py-20 card rounded-3xl space-y-4 max-w-lg mx-auto shadow-sm animate-in zoom-in-95 duration-150">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-ink-900 text-base">All Clear! No Failed Deliveries</h4>
                <p className="text-xs text-ink-600 max-w-xs mx-auto leading-relaxed">
                  Excellent! Every single email has been successfully queued or accepted by recipient servers.
                </p>
              </div>
              <div>
                <button
                  onClick={() => setEmptyStateMode("none")}
                  className="px-4 py-2 border border-ink-200 dark:border-ink-800 rounded-xl text-xs font-bold text-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800 transition-all"
                >
                  Back to Queue
                </button>
              </div>
            </div>
          )}

          {emptyStateMode === "no_scheduled" && (
            <div className="text-center py-20 card rounded-3xl space-y-4 max-w-lg mx-auto shadow-sm animate-in zoom-in-95 duration-150">
              <div className="w-16 h-16 rounded-full bg-ink-50 dark:bg-ink-800 flex items-center justify-center mx-auto text-ink-500">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-ink-900 text-base">No Scheduled Campaigns</h4>
                <p className="text-xs text-ink-600 max-w-xs mx-auto leading-relaxed">
                  There are no campaigns waiting for temporal triggers. Schedule one under Send Batch options.
                </p>
              </div>
              <div>
                <button
                  onClick={() => setActiveTab("send")}
                  className="btn-primary py-2 px-5 text-xs font-bold"
                >
                  Schedule Delivery
                </button>
              </div>
            </div>
          )}

          {/* Standard Queue Table Data */}
          {emptyStateMode === "none" && (
            <div className="card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-ink-100 dark:border-ink-850 text-ink-600 font-bold uppercase tracking-wider text-[10px] bg-ink-50/50 dark:bg-ink-950/20">
                      <th className="p-4">Participant</th>
                      <th className="p-4">Event</th>
                      <th className="p-4">Certificate</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Sent At</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-ink-50 dark:border-ink-850 hover:bg-ink-50/40 dark:hover:bg-ink-950/20 text-ink-700 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-extrabold text-ink-900">{row.participant}</p>
                            <p className="text-[10px] text-ink-600 font-mono mt-0.5">{row.email}</p>
                          </div>
                        </td>
                        <td className="p-4 font-semibold max-w-[150px] truncate">{row.event}</td>
                        <td className="p-4 font-mono font-bold text-brand-500">{row.certificate}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                            row.status === "Opened" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            row.status === "Delivered" ? "bg-blue-50 text-blue-600 border-blue-100" :
                            row.status === "Failed" ? "bg-rose-50 text-rose-600 border-rose-150" :
                            row.status === "Sending" ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" :
                            "bg-ink-100 text-ink-600 border-ink-150"
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-4 text-ink-600">{row.sentAt}</td>
                        <td className="p-4 text-right space-x-2.5">
                          <button
                            onClick={() => {
                              setSelectedEmail(row);
                              setIsDrawerOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xxs font-bold bg-ink-50 dark:bg-ink-800 text-ink-700 rounded-lg hover:bg-ink-100 hover:text-ink-900 transition-all border border-ink-200 dark:border-ink-700 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Detail
                          </button>
                          {(row.status === "Failed" || row.status === "Delivered") && (
                            <button
                              onClick={() => handleRetryEmail(row.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xxs font-bold bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-lg transition-all border border-brand-100 cursor-pointer"
                            >
                              <ArrowCounterClockwise className="w-3.5 h-3.5" /> {lang === "id" ? "Kirim Ulang" : "Resend"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: BATCH EMAIL PAGE */}
      {activeTab === "send" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
          
          {/* Scheduling UI configuration */}
          <form onSubmit={handleBatchSendSubmit} className="lg:col-span-2 card shadow-sm p-6 md:p-8 space-y-6">
            <h3 className="text-base font-extrabold text-ink-900 flex items-center gap-2 border-b border-ink-100 dark:border-ink-800 pb-4">
              <PaperPlaneTilt className="w-5 h-5 text-brand-500" />
              {lang === "id" ? "Konfigurasi Kampanye Pengiriman" : "Configure Batch Campaign"}
            </h3>

            {/* Target Options */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-ink-700 block">{lang === "id" ? "Penerima Sertifikat" : "Target Recipients"}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "all", title: "All Participants", desc: "Send to all registered batch participants (150 recipients)" },
                  { key: "selected", title: "Selected Participants", desc: "Choose specific row items manually from the table list" },
                  { key: "failed", title: "Resend Failed Only", desc: "Trigger re-delivery campaign to failed recipient logs" },
                  { key: "test", title: "Send Test Email", desc: "Deliver a test instance of the selected template style" }
                ].map(opt => (
                  <div
                    key={opt.key}
                    onClick={() => setTargetAudience(opt.key as never)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      targetAudience === opt.key 
                        ? "border-brand-500 bg-brand-50/10" 
                        : "border-ink-150 dark:border-ink-800 hover:border-ink-250"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-ink-900">{opt.title}</span>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        targetAudience === opt.key ? "border-brand-500 bg-brand-500" : "border-ink-300"
                      }`}>
                        {targetAudience === opt.key && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                    <p className="text-[10px] text-ink-600 mt-1 leading-normal">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Email Field if selected */}
            {targetAudience === "test" && (
              <div className="space-y-2 p-4 bg-ink-50 dark:bg-ink-850 rounded-xl border border-ink-150 animate-in slide-in-from-top-3">
                <label className="text-xxs font-bold text-ink-700 uppercase block">Test Email Address</label>
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={e => setTestEmailAddress(e.target.value)}
                  className="input-field max-w-md text-xs"
                  placeholder="name@company.com"
                />
              </div>
            )}

            {/* Delivery Schedule Options (Requirement 7) */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-ink-700 block">{lang === "id" ? "Waktu Pengiriman" : "Scheduling & Timing"}</label>
              
              <div className="flex gap-4 border-b border-ink-150 pb-3">
                {[
                  { key: "now", label: "Send Now" },
                  { key: "later", label: "Schedule Later" }
                ].map(method => (
                  <button
                    key={method.key}
                    type="button"
                    onClick={() => setDeliveryMethod(method.key as never)}
                    className={`pb-2 text-xs font-bold border-b-2 transition-all ${
                      deliveryMethod === method.key 
                        ? "border-brand-500 text-brand-600" 
                        : "border-transparent text-ink-500 hover:text-ink-900"
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>

              {deliveryMethod === "later" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 animate-in slide-in-from-top-3">
                  <div>
                    <label className="text-[10px] font-bold text-ink-650 uppercase block mb-1.5">Date Picker</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={e => setScheduleDate(e.target.value)}
                      className="input-field text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-ink-650 uppercase block mb-1.5">Time Picker</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={e => setScheduleTime(e.target.value)}
                      className="input-field text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-ink-650 uppercase block mb-1.5">Timezone</label>
                    <select
                      value={scheduleTimezone}
                      onChange={e => setScheduleTimezone(e.target.value)}
                      className="input-field text-xs font-semibold"
                    >
                      <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                      <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                      <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-ink-100 dark:border-ink-800">
              <button
                type="button"
                onClick={() => showToast(lang === "id" ? "Pratinjau email sedang dimuat." : "Email preview loading.", "info")}
                className="px-4 py-2 rounded-xl border border-ink-250 dark:border-ink-700 text-ink-600 font-bold text-xs hover:bg-ink-50 dark:hover:bg-ink-800 transition-all cursor-pointer"
              >
                Preview Mail
              </button>
              <button
                type="submit"
                className="btn-primary py-2 px-5 text-xs font-bold"
              >
                {deliveryMethod === "now" ? "Send Certificates" : "Schedule Campaign"}
              </button>
            </div>
          </form>

          {/* Quick tips panel sidebar */}
          <div className="p-6 card space-y-4 shadow-sm h-fit">
            <h4 className="text-xs font-bold text-ink-900 uppercase tracking-wider">{lang === "id" ? "Bantuan Pengiriman" : "Delivery Checklist"}</h4>
            <ul className="space-y-3.5 text-xs text-ink-700 leading-relaxed">
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" weight="fill" />
                <span>Make sure all recipient rows contain valid email addresses.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" weight="fill" />
                <span>Variables mapped in the template builder will dynamically grab attendee information.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" weight="fill" />
                <span>Test your templates by triggering a single test instance first.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: EMAIL TEMPLATE BUILDER */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
          
          {/* Template Edit inputs (Requirement 5) */}
          <div className="card shadow-sm p-6 md:p-8 space-y-6">
            <h3 className="text-base font-extrabold text-ink-900 flex items-center gap-2 border-b border-ink-100 dark:border-ink-800 pb-4">
              <Gear className="w-5 h-5 text-brand-500" />
              {lang === "id" ? "Penyunting Template Email" : "Email Template Editor"}
            </h3>

            {/* Variable injectors tags */}
            <div className="space-y-2">
              <label className="text-xxs font-bold text-ink-600 uppercase tracking-wider block">Sisipkan Variabel (Click to inject)</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "participant", label: "{{participant}}" },
                  { key: "event", label: "{{event}}" },
                  { key: "certificate", label: "{{certificate}}" },
                  { key: "date", label: "{{date}}" },
                  { key: "verification", label: "{{verification}}" }
                ].map(v => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => injectVariable(v.key, "body")}
                    className="px-2.5 py-1 text-[10px] font-mono font-bold bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-lg transition-all border border-brand-100 cursor-pointer"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject text input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-700 block">Email Subject</label>
              <input
                type="text"
                value={templateSubject}
                onChange={e => setTemplateSubject(e.target.value)}
                className="input-field font-semibold text-xs"
                placeholder="Subject"
              />
            </div>

            {/* Greeting input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-700 block">Greeting Header</label>
              <input
                type="text"
                value={templateGreeting}
                onChange={e => setTemplateGreeting(e.target.value)}
                className="input-field text-xs"
                placeholder="Greeting"
              />
            </div>

            {/* Body textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-700 block">Email Body Message</label>
              <textarea
                value={templateBody}
                onChange={e => setTemplateBody(e.target.value)}
                className="input-field text-xs min-h-[140px] font-medium leading-relaxed"
                placeholder="Write your email body..."
              />
            </div>

            {/* Footer textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink-700 block">Email Footer Signature</label>
              <textarea
                value={templateFooter}
                onChange={e => setTemplateFooter(e.target.value)}
                className="input-field text-xs min-h-[60px] font-medium leading-relaxed"
                placeholder="Signatures, links..."
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => showToast(lang === "id" ? "Template email berhasil disimpan!" : "Email template saved!", "success")}
                className="btn-primary py-2 px-5 text-xs font-bold shadow-sm"
              >
                Save Template Styling
              </button>
            </div>
          </div>

          {/* Real-time live preview box */}
          <div className="space-y-4 h-full">
            <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">{lang === "id" ? "Pratinjau Email Real-time" : "Real-time Live Preview"}</h4>
            
            <div className="card rounded-3xl p-6 shadow-sm space-y-6">
              {/* Fake Email client header */}
              <div className="border-b border-ink-100 dark:border-ink-850 pb-4 space-y-1.5 text-xs text-ink-600">
                <div><span className="font-semibold text-ink-700">Subject:</span> {templateSubject.replace("{{event}}", "Webinar AI 2026")}</div>
                <div><span className="font-semibold text-ink-700">From:</span> SertifKilat Auto-mailer &lt;no-reply@sertifkilat.id&gt;</div>
                <div><span className="font-semibold text-ink-700">To:</span> rahma.fitria@gmail.com</div>
              </div>

              {/* Email Content body styled */}
              <div className="space-y-4 font-sans text-xs text-ink-700 leading-relaxed">
                <p>{templateGreeting.replace("{{participant}}", "Rahma Fitria")}</p>
                <p className="whitespace-pre-line">
                  {templateBody
                    .replace("{{event}}", "Webinar AI 2026")
                    .replace("{{participant}}", "Rahma Fitria")
                    .replace("{{certificate}}", "CERT-AI-081")
                    .replace("{{date}}", "05 July 2026")
                    .replace("{{verification}}", "sertifkilat.id/verify/CERT-AI-081")
                  }
                </p>
                
                {/* Download Button mock */}
                <div className="py-2">
                  <span className="inline-block px-5 py-2.5 bg-brand-500 text-white font-extrabold text-[10px] uppercase rounded-xl shadow-md cursor-pointer select-none">
                    Download Certificate (CERT-AI-081)
                  </span>
                </div>

                <p className="whitespace-pre-line text-ink-600 text-[10px] border-t border-ink-100 dark:border-ink-850 pt-4">
                  {templateFooter}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: EMAIL SETTINGS */}
      {activeTab === "settings" && (
        <div className="card shadow-sm p-6 md:p-8 space-y-8 animate-in fade-in duration-200">
          
          <div className="flex justify-between items-start border-b border-ink-100 dark:border-ink-800 pb-4 gap-4 flex-wrap">
            <div>
              <h3 className="text-base font-extrabold text-ink-900 flex items-center gap-2">
                <Gear className="w-5 h-5 text-brand-500" />
                SMTP & Brand Settings
              </h3>
              <p className="text-[10px] text-ink-600 mt-0.5">
                Configure your custom delivery address, reply inbox, branding, and SMTP server integrations.
              </p>
            </div>
            <span className="text-[9px] font-extrabold text-brand-600 bg-brand-50 px-2.5 py-1 rounded border border-brand-100 uppercase tracking-widest animate-pulse">
              Coming Soon
            </span>
          </div>

          {/* Settings forms mock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sender configurations */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">Sender Info</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1.5">Sender Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    className="input-field text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1.5">Reply-to Email Address</label>
                  <input
                    type="email"
                    value={replyEmail}
                    onChange={e => setReplyEmail(e.target.value)}
                    className="input-field text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1.5">Signature Footer Default</label>
                  <input
                    type="text"
                    value={emailSignature}
                    onChange={e => setEmailSignature(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Branding configurations */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">Email Branding</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1.5">Brand Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={e => setBrandColor(e.target.value)}
                      className="w-10 h-10 border border-ink-200 rounded-xl cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandColor}
                      onChange={e => setBrandColor(e.target.value)}
                      className="input-field max-w-[100px] text-xs font-mono font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-ink-700 block mb-1.5">Upload Logo Header</label>
                  <div className="border border-dashed border-ink-200 dark:border-ink-800 rounded-xl p-4 text-center hover:border-brand-500 transition-all cursor-pointer">
                    <span className="text-[10px] text-ink-700 font-bold block">Choose Logo Image File</span>
                    <span className="text-[8px] text-ink-600 block mt-0.5">PNG, JPG up to 1MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SMTP Details coming soon */}
          <div className="border-t border-ink-100 dark:border-ink-800 pt-6 space-y-4">
            <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider">SMTP Server Settings (Locked)</h4>
            <div className="p-4 bg-ink-50 dark:bg-ink-850 rounded-xl border border-ink-150 dark:border-ink-800 text-xs text-ink-700 leading-normal flex items-start gap-3">
              <Lock className="w-5 h-5 text-ink-500 shrink-0 mt-0.5" />
              <div>
                <strong>Custom SMTP configuration is coming in next release.</strong>
                <p className="text-[10px] text-ink-600 mt-1">
                  You will be able to input your own custom SMTP servers (Host, Port, User, Password) to route emails through Amazon SES, Mailgun, SendGrid, or direct host mailers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
