"use client";

import { useState, useEffect } from "react";
import {
  X,
  Check,
  Copy,
  Sparkle,
  ArrowRight,
  UploadSimple,
  CheckCircle,
  CircleNotch,
  CreditCard,
  QrCode,
  Warning,
} from "@phosphor-icons/react";
import { upgradeUserPlanAction } from "@/app/actions/subscription";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  initialSelectedPlan?: "PRO" | "BUSINESS";
}

export default function UpgradeModal({
  isOpen,
  onClose,
  currentPlan,
  initialSelectedPlan,
}: UpgradeModalProps) {
  const [step, setStep] = useState<"select" | "pay">("select");
  const [selectedPlan, setSelectedPlan] = useState<"PRO" | "BUSINESS">("PRO");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "bank" | "va">("qris");
  const [paymentStatus, setPaymentStatus] = useState<"waiting" | "verifying" | "paid" | "expired" | "cancelled">("waiting");
  const [copiedText, setCopiedText] = useState(false);
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialSelectedPlan) {
      setSelectedPlan(initialSelectedPlan);
      setStep("pay");
    } else {
      setStep("select");
    }
    setPaymentStatus("waiting");
    setProofFile(null);
  }, [isOpen, initialSelectedPlan]);

  if (!isOpen) return null;

  const planPrice = {
    PRO: billingPeriod === "monthly" ? 149000 : 119200 * 12,
    BUSINESS: billingPeriod === "monthly" ? 379000 : 303200 * 12,
  };

  const planName = selectedPlan === "PRO" ? "Pro Plan" : "Business Plan";

  function formatIDR(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file.name);
    }
  }

  async function handleConfirmPayment() {
    setPaymentStatus("verifying");
    setIsSubmitting(true);

    // Simulate verification
    setTimeout(async () => {
      try {
        const res = await upgradeUserPlanAction(selectedPlan);
        if (res.success) {
          setPaymentStatus("paid");
        } else {
          setPaymentStatus("waiting");
          alert(res.error || "Gagal melakukan upgrade.");
        }
      } catch (err) {
        console.error(err);
        setPaymentStatus("waiting");
      } finally {
        setIsSubmitting(false);
      }
    }, 2000);
  }

  const featuresList = {
    FREE: [
      "Maksimum 25 peserta per batch",
      "Maksimum 1 active template",
      "Basic certificate generation",
      "Standard QR verification",
    ],
    PRO: [
      "Maksimum 150 peserta per batch",
      "Hingga 5 active template",
      "Premium Templates (Unlocked)",
      "Bulk Export ZIP",
      "Standard QR verification",
      "Email support",
    ],
    BUSINESS: [
      "Unlimited participants",
      "Unlimited active templates",
      "Premium Templates (Unlocked)",
      "Bulk Export ZIP & Excel",
      "Verification QR + Analytics",
      "Priority Support (24/7)",
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-bg-card rounded-3xl shadow-glow overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col md:flex-row my-8 max-h-[90vh]">
        {/* Left Side: Pricing Info & Current Plan comparison */}
        <div className="w-full md:w-5/12 bg-ink-50 p-6 md:p-8 border-r border-ink-150 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Sparkle className="w-6 h-6 text-brand-500" weight="fill" />
              <span className="font-display font-bold text-ink-900 text-lg">SertifKilat Subscription</span>
            </div>

            <div className="bg-bg-card rounded-2xl p-5 border border-ink-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Paket Saat Ini</span>
                <span className="badge badge-brand text-xxs font-bold uppercase">{currentPlan}</span>
              </div>
              <p className="text-xs text-ink-600 leading-relaxed">
                Kamu saat ini berada pada paket <strong className="text-ink-900">{currentPlan}</strong>.
                {currentPlan === "FREE" && " Batas cetak maksimal 25 peserta per batch dan hanya dapat memiliki 1 template aktif."}
                {currentPlan === "PRO" && " Batas cetak maksimal 150 peserta per batch dan hanya dapat memiliki 5 template aktif."}
                {currentPlan === "BUSINESS" && " Semua fitur premium terbuka tanpa batas kuota."}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-ink-800 uppercase tracking-wider">Keuntungan Upgrade:</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-xs text-ink-600">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" weight="bold" />
                  <span>Cetak sertifikat hingga ratusan/ribuan peserta sekaligus.</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-ink-600">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" weight="bold" />
                  <span>Gunakan template premium yang modern & elegan.</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-ink-600">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" weight="bold" />
                  <span>Dukungan pelanggan prioritas 24 jam.</span>
                </li>
                <li className="flex items-start gap-2.5 text-xs text-ink-600">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" weight="bold" />
                  <span>Ekspor bundel sertifikat langsung dalam format ZIP tanpa korup.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-ink-200 mt-6 text-xxs text-ink-400">
            Butuh bantuan transaksi? Hubungi <a href="mailto:billing@sertifkilat.id" className="text-brand-600 font-semibold hover:underline">billing@sertifkilat.id</a>
          </div>
        </div>

        {/* Right Side: Step view */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[80vh] md:max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-start gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-ink-900">
                {step === "select" ? "Pilih Paket Upgrade Anda" : `Pembayaran ${planName}`}
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                {step === "select" ? "Pilih paket yang paling sesuai dengan kebutuhan sertifikasi Anda." : "Selesaikan transaksi untuk segera mengaktifkan paket layanan premium Anda."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-700 transition-all shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP 1: SELECT PLAN */}
          {step === "select" && (
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              {/* Billing Period Selector */}
              <div className="bg-ink-50 p-1.5 rounded-xl flex items-center gap-2 max-w-sm mx-auto w-full">
                <button
                  type="button"
                  onClick={() => setBillingPeriod("monthly")}
                  className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
                    billingPeriod === "monthly"
                      ? "bg-bg-card text-ink-900 shadow-sm"
                      : "text-ink-500 hover:text-ink-900"
                  }`}
                >
                  Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod("yearly")}
                  className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    billingPeriod === "yearly"
                      ? "bg-bg-card text-ink-900 shadow-sm"
                      : "text-ink-500 hover:text-ink-900"
                  }`}
                >
                  Tahunan
                  <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Hemat 20%</span>
                </button>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pro Plan Card */}
                <div
                  onClick={() => setSelectedPlan("PRO")}
                  className={`rounded-2xl p-5 border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between h-72 ${
                    selectedPlan === "PRO"
                      ? "border-brand-500 bg-brand-50/10 shadow-soft"
                      : "border-ink-200 hover:border-ink-300"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-ink-900 text-base">Pro Plan</span>
                      {selectedPlan === "PRO" && <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
                    </div>
                    <p className="text-[11px] text-ink-400 mt-1">Sempurna untuk panitia aktif</p>
                    <div className="mt-3">
                      <span className="text-2xl font-bold text-ink-900">
                        {formatIDR(billingPeriod === "monthly" ? 149000 : 119200 * 12)}
                      </span>
                      <span className="text-[10px] text-ink-400">/{billingPeriod === "monthly" ? "bulan" : "tahun"}</span>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {featuresList.PRO.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[11px] text-ink-600">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" weight="bold" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Business Plan Card */}
                <div
                  onClick={() => setSelectedPlan("BUSINESS")}
                  className={`rounded-2xl p-5 border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between h-72 ${
                    selectedPlan === "BUSINESS"
                      ? "border-brand-500 bg-brand-50/10 shadow-soft"
                      : "border-ink-200 hover:border-ink-300"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-ink-900 text-base">Business Plan</span>
                      {selectedPlan === "BUSINESS" && <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />}
                    </div>
                    <p className="text-[11px] text-ink-400 mt-1">Untuk institusi skala besar</p>
                    <div className="mt-3">
                      <span className="text-2xl font-bold text-ink-900">
                        {formatIDR(billingPeriod === "monthly" ? 379000 : 303200 * 12)}
                      </span>
                      <span className="text-[10px] text-ink-400">/{billingPeriod === "monthly" ? "bulan" : "tahun"}</span>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {featuresList.BUSINESS.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[11px] text-ink-600">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" weight="bold" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-ink-150">
                <button onClick={onClose} className="btn-secondary">
                  Batal
                </button>
                <button onClick={() => setStep("pay")} className="btn-primary">
                  Lanjut ke Pembayaran <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT PAGE */}
          {step === "pay" && (
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              {paymentStatus === "paid" ? (
                <div className="text-center py-10 space-y-4 my-auto">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
                    <CheckCircle className="w-10 h-10" weight="fill" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-ink-900 text-lg">Pembayaran Sukses Diverifikasi!</h4>
                    <p className="text-xs text-ink-500 max-w-sm mx-auto leading-relaxed">
                      Selamat! Akun Anda telah sukses ditingkatkan menjadi <strong className="text-brand-600">{planName}</strong>. 
                      Nikmati semua fitur premium tanpa hambatan.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button onClick={onClose} className="btn-primary px-8">
                      Kembali ke Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[55vh]">
                  {/* Price Summary */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-brand-100 bg-brand-50/20">
                    <div>
                      <p className="text-xxs text-ink-400 font-bold uppercase tracking-wider">Total Pembayaran</p>
                      <p className="text-lg font-bold text-ink-900 mt-0.5">
                        {formatIDR(planPrice[selectedPlan])}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                        {planName}
                      </p>
                      <p className="text-[10px] text-ink-400 mt-0.5">
                        {billingPeriod === "monthly" ? "Per Bulan" : "Per 12 Bulan"}
                      </p>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="block text-xxs font-bold text-ink-400 uppercase tracking-wider">
                      Pilih Metode Pembayaran
                    </label>
                    <div className="flex border-b border-ink-150">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("qris")}
                        className={`flex-1 pb-2 text-xs font-semibold border-b-2 text-center transition-all ${
                          paymentMethod === "qris"
                            ? "border-brand-500 text-brand-600 font-bold"
                            : "border-transparent text-ink-400 hover:text-ink-700"
                        }`}
                      >
                        QRIS
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bank")}
                        className={`flex-1 pb-2 text-xs font-semibold border-b-2 text-center transition-all ${
                          paymentMethod === "bank"
                            ? "border-brand-500 text-brand-600 font-bold"
                            : "border-transparent text-ink-400 hover:text-ink-700"
                        }`}
                      >
                        BCA (Manual)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("va")}
                        className={`flex-1 pb-2 text-xs font-semibold border-b-2 text-center transition-all ${
                          paymentMethod === "va"
                            ? "border-brand-500 text-brand-600 font-bold"
                            : "border-transparent text-ink-400 hover:text-ink-700"
                        }`}
                      >
                        Virtual Account
                      </button>
                    </div>
                  </div>

                  {/* Tab Details */}
                  <div className="min-h-[140px] flex flex-col justify-center">
                    {paymentMethod === "qris" && (
                      <div className="text-center space-y-2">
                        <div className="w-28 h-28 border border-ink-200 rounded-xl mx-auto flex items-center justify-center bg-white p-2 relative shadow-sm">
                          <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                            <rect width="100" height="100" fill="#ffffff" />
                            <rect x="5" y="5" width="20" height="20" />
                            <rect x="8" y="8" width="14" height="14" fill="#ffffff" />
                            <rect x="11" y="11" width="8" height="8" />

                            <rect x="75" y="5" width="20" height="20" />
                            <rect x="78" y="8" width="14" height="14" fill="#ffffff" />
                            <rect x="81" y="81" width="8" height="8" />

                            <rect x="5" y="75" width="20" height="20" />
                            <rect x="8" y="78" width="14" height="14" fill="#ffffff" />
                            <rect x="11" y="81" width="8" height="8" />

                            <rect x="35" y="10" width="10" height="5" />
                            <rect x="50" y="15" width="5" height="15" />
                            <rect x="40" y="40" width="20" height="20" />
                            <rect x="45" y="45" width="10" height="10" fill="#ffffff" />
                            <rect x="15" y="35" width="15" height="5" />
                            <rect x="10" y="50" width="5" height="10" />
                            <rect x="70" y="35" width="10" height="10" />
                            <rect x="80" y="55" width="15" height="5" />
                            <rect x="65" y="65" width="5" height="20" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-xl">
                            <span className="bg-brand-500 text-white font-bold text-[8px] tracking-wider px-1.5 py-0.5 rounded shadow-glow">
                              QRIS
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-ink-500 max-w-xs mx-auto leading-normal">
                          Pindai kode QRIS dengan e-wallet (GoPay, OVO, Dana) atau Mobile Banking Anda.
                        </p>
                      </div>
                    )}

                    {paymentMethod === "bank" && (
                      <div className="space-y-3 bg-ink-50 p-4 rounded-xl border border-ink-150">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-ink-400 uppercase">Bank Tujuan</p>
                            <p className="text-xs font-bold text-ink-900">BCA (Bank Central Asia)</p>
                          </div>
                          <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">BCA</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t border-ink-100 pt-2">
                          <div>
                            <p className="text-[10px] font-bold text-ink-400 uppercase">Atas Nama</p>
                            <p className="text-xs font-bold text-ink-900 truncate">PT SertifKilat Teknologi</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-ink-400 uppercase">No Rekening</p>
                              <p className="text-xs font-mono font-bold text-brand-600">8040 9283 11</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy("8040928311")}
                              className="text-xxs text-ink-500 hover:text-brand-600 hover:bg-bg-card px-2 py-1 rounded border border-ink-200 transition-all font-semibold flex items-center gap-1 shrink-0"
                            >
                              <Copy className="w-3 h-3" />
                              {copiedText ? "Tersalin" : "Salin"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "va" && (
                      <div className="space-y-3 bg-ink-50 p-4 rounded-xl border border-ink-150">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-ink-400 uppercase">Virtual Account</p>
                            <p className="text-xs font-bold text-ink-900">Mandiri Virtual Account</p>
                          </div>
                          <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">MANDIRI</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-ink-100 pt-2">
                          <div>
                            <p className="text-[10px] font-bold text-ink-400 uppercase">Nomor Virtual Account</p>
                            <p className="text-xs font-mono font-bold text-brand-600">88012 0812 3456 789</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy("8801208123456789")}
                            className="text-xxs text-ink-500 hover:text-brand-600 hover:bg-bg-card px-2 py-1 rounded border border-ink-200 transition-all font-semibold flex items-center gap-1 shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedText ? "Tersalin" : "Salin"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Instructions */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-ink-700">Instruksi Pembayaran</label>
                    <ol className="list-decimal pl-4 text-[11px] text-ink-500 space-y-1">
                      <li>Transfer nominal sesuai jumlah total di atas ke rekening tujuan.</li>
                      <li>Simpan bukti transfer dalam format JPG atau PNG.</li>
                      <li>Unggah bukti transfer di bawah untuk verifikasi instan.</li>
                    </ol>
                  </div>

                  {/* Proof Upload */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-ink-700">Unggah Bukti Pembayaran (Opsional)</label>
                    <div className="border border-dashed border-ink-200 hover:border-brand-500 rounded-xl p-3 text-center cursor-pointer transition-colors relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <UploadSimple className="w-5 h-5 text-ink-400 mx-auto mb-1" />
                      <p className="text-xxs text-ink-600 font-medium">
                        {proofFile ? `File terpilih: ${proofFile}` : "Pilih gambar bukti transfer"}
                      </p>
                    </div>
                  </div>

                  {/* Payment Status Indicator */}
                  <div className="flex justify-between items-center p-3 rounded-xl bg-ink-50 border border-ink-150">
                    <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">Status Pembayaran:</span>
                    <span className="text-[11px] font-bold flex items-center gap-1">
                      {paymentStatus === "waiting" && (
                        <span className="text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100 flex items-center gap-1 animate-pulse">
                          Waiting for Payment
                        </span>
                      )}
                      {paymentStatus === "verifying" && (
                        <span className="text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100 flex items-center gap-1">
                          <CircleNotch className="w-3.5 h-3.5 animate-spin" /> Verifying Payment...
                        </span>
                      )}
                      {paymentStatus === "expired" && (
                        <span className="text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                          Expired
                        </span>
                      )}
                      {paymentStatus === "cancelled" && (
                        <span className="text-ink-400 bg-ink-100 px-2.5 py-0.5 rounded-full">
                          Cancelled
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {paymentStatus !== "paid" && (
                <div className="flex gap-3 justify-end pt-4 border-t border-ink-150">
                  <button
                    onClick={() => {
                      setPaymentStatus("cancelled");
                      setTimeout(() => onClose(), 1000);
                    }}
                    className="btn-secondary"
                    disabled={isSubmitting}
                  >
                    Batalkan Transaksi
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <CircleNotch className="w-3.5 h-3.5 animate-spin" /> Memverifikasi...
                      </>
                    ) : (
                      "Konfirmasi & Kirim Bukti"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
