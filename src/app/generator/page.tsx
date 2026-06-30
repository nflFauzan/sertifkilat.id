"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  UploadSimple,
  FileCsv,
  CheckCircle,
  CircleNotch,
  Warning,
  X,
  Download,
  Lightning,
  Coins,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  QrCode,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  GridFour,
  Ruler,
  Check,
  Envelope,
  Copy,
  ArrowClockwise,
} from "@phosphor-icons/react";

// Types for local state
interface Participant {
  nama: string;
  email: string;
  acara: string;
  tanggal: string;
}

interface ValidationError {
  row: number;
  nama: string;
  email: string;
  errors: string[];
}

interface DraggableElement {
  id: string;
  label: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number;
  height: number;
}

const DEFAULT_PARTICIPANTS: Participant[] = [
  { nama: "Bagas Santoso", email: "bagas@kelasonline.id", acara: "Webinar UI/UX", tanggal: "12 Jun 2026" },
  { nama: "Dini Rahmawati", email: "dini@ngomestic.org", acara: "Webinar UI/UX", tanggal: "12 Jun 2026" },
  { nama: "Putri Lestari", email: "putri@skn.co.id", acara: "Webinar UI/UX", tanggal: "12 Jun 2026" },
];

const DEFAULT_TEMPLATE_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='566' viewBox='0 0 800 566'><rect width='800' height='566' fill='%23FBF8F0'/><rect x='20' y='20' width='760' height='526' fill='none' stroke='%23C9A227' stroke-width='2' stroke-dasharray='10 5'/><rect x='30' y='30' width='740' height='506' fill='none' stroke='%23C9A227' stroke-width='1'/><text x='400' y='100' font-family='Georgia, serif' font-size='24' fill='%230B1220' text-anchor='middle' letter-spacing='4'>SERTIFIKAT PENGHARGAAN</text><text x='400' y='150' font-family='sans-serif' font-size='12' fill='%235A6B8C' text-anchor='middle'>Diberikan Kepada:</text><line x1='300' y1='300' x2='500' y2='300' stroke='%23C9A227' stroke-width='1'/><text x='400' y='330' font-family='sans-serif' font-size='11' fill='%235A6B8C' text-anchor='middle'>Atas partisipasi aktifnya dalam acara tersebut</text></svg>";

export default function GeneratorWorkspace() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Step 1: Template
  const [templateFile, setTemplateFile] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Upload Excel / CSV
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [dataError, setDataError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const dataInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Editor Workspace Options
  const [elements, setElements] = useState<DraggableElement[]>([
    { id: "nama", label: "Nama Penerima", x: 50, y: 40, width: 160, height: 32 },
    { id: "tanggal", label: "Tanggal Event", x: 50, y: 65, width: 120, height: 28 },
    { id: "tandaTangan", label: "Tanda Tangan", x: 25, y: 80, width: 130, height: 36 },
    { id: "qr", label: "QR Code Verifikasi", x: 75, y: 80, width: 70, height: 70 },
  ]);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showVGuide, setShowVGuide] = useState(false);
  const [showHGuide, setShowHGuide] = useState(false);

  // Canvas zoom/grid controls
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(false);

  // Step 5: Checkout & Payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"qris" | "va" | "cc">("qris");
  const [selectedBank, setSelectedBank] = useState<"mandiri" | "bca" | "bni">("bca");
  const [copiedText, setCopiedText] = useState(false);
  const [countdown, setCountdown] = useState(900); // 15 mins in seconds

  // Credit Card state
  const [ccNum, setCcNum] = useState("");
  const [ccExp, setCcExp] = useState("");
  const [ccCvc, setCcCvc] = useState("");
  const [ccName, setCcName] = useState("");

  // Generation Progress
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationLog, setGenerationLog] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  // Drag coordinates reference
  const dragStartRef = useRef({ x: 0, y: 0, elX: 0, elY: 0 });

  // Countdown timer for Payment
  useEffect(() => {
    if (!showPaymentModal) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showPaymentModal]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // ───────────────────────────────────────────────────────────────────────────
  // BUSINESS LOGIC & PRICE CALCULATOR
  // ───────────────────────────────────────────────────────────────────────────
  const hasUploaded = participants.length > 0;
  const totalCount = participants.length;
  const freeLimit = 25;
  const freeQuotaUsed = Math.min(totalCount, freeLimit);
  const paidCount = Math.max(0, totalCount - freeLimit);

  // Rate Tier: <= 50 total = Rp1.500/cert, 51-200 total = Rp1.200/cert, 200+ = Rp900/cert
  let rate = 1500;
  if (totalCount > 50 && totalCount <= 200) rate = 1200;
  else if (totalCount > 200) rate = 900;

  const totalPrice = paidCount * rate;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // FILE DOWNLOAD TEMPLATE
  // ───────────────────────────────────────────────────────────────────────────
  const downloadExcelTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Nama,Email\nBagas Santoso,bagas@kelasonline.id\nDini Rahmawati,dini@ngomestic.org\nPutri Lestari,putri@skn.co.id\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sertifkilat_template_peserta.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 1 HANDLERS (Template)
  // ───────────────────────────────────────────────────────────────────────────
  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setTemplateError("Berkas harus berupa gambar (PNG atau JPG).");
      return;
    }

    setTemplateError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTemplateFile(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const useDefaultTemplate = () => {
    setTemplateFile(DEFAULT_TEMPLATE_IMAGE);
    setTemplateError("");
  };

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 2 HANDLERS (Excel/CSV Parser & Validasi)
  // ───────────────────────────────────────────────────────────────────────────
  const handleDataUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setDataError("Format berkas harus berupa CSV atau Excel (.xlsx, .xls).");
      return;
    }

    setDataError("");
    const reader = new FileReader();
    reader.onload = () => {
      // Simulate raw lines parsing
      // We will parse a couple of valid rows, and inject some errors to demo validation if needed
      // To provide a robust user experience, let's parse a mix of correct and incorrect data
      const parsedData: Participant[] = [
        { nama: "Budi Raharjo", email: "budi.raharjo@gmail.com", acara: "Webinar UI/UX", tanggal: "12 Jun 2026" },
        { nama: "Siti Aminah", email: "siti.aminah@yahoo.com", acara: "Webinar UI/UX", tanggal: "12 Jun 2026" },
        { nama: "Farhan Hakim", email: "farhan.hakim@gmail.com", acara: "Webinar UI/UX", tanggal: "12 Jun 2026" },
        { nama: "", email: "aditya.p@gmail.com", acara: "Webinar UI/UX", tanggal: "12 Jun 2026" }, // Name empty
        { nama: "Citra Lestari", email: "citra.lestari", acara: "Webinar UI/UX", tanggal: "12 Jun 2026" }, // Invalid email
        { nama: "Rizky Amelia", email: "siti.aminah@yahoo.com", acara: "Webinar UI/UX", tanggal: "12 Jun 2026" }, // Duplicate email
      ];

      runDataValidation(parsedData);
    };
    reader.readAsText(file);
  };

  const loadSampleData = () => {
    runDataValidation(DEFAULT_PARTICIPANTS);
  };

  const runDataValidation = (dataList: Participant[]) => {
    const errors: ValidationError[] = [];
    const emailsSeen = new Set<string>();

    dataList.forEach((item, index) => {
      const rowNum = index + 1;
      const rowErrors: string[] = [];

      if (!item.nama.trim()) {
        rowErrors.push("Nama tidak boleh kosong");
      }

      if (!item.email.trim()) {
        rowErrors.push("Email tidak boleh kosong");
      } else {
        // format check
        if (!item.email.includes("@") || !item.email.includes(".")) {
          rowErrors.push("Format email tidak valid");
        }
        // duplicate check
        if (emailsSeen.has(item.email.toLowerCase())) {
          rowErrors.push("Email duplikat ditemukan");
        } else {
          emailsSeen.add(item.email.toLowerCase());
        }
      }

      if (rowErrors.length > 0) {
        errors.push({
          row: rowNum,
          nama: item.nama || "[Kosong]",
          email: item.email || "[Kosong]",
          errors: rowErrors,
        });
      }
    });

    setParticipants(dataList);
    setValidationErrors(errors);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 3 HANDLERS (Editor Coordinate Drag & Snap)
  // ───────────────────────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setActiveElementId(id);
    const element = elements.find((el) => el.id === id);
    if (!element || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      elX: (element.x / 100) * rect.width,
      elY: (element.y / 100) * rect.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeElementId || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const dx = (e.clientX - dragStartRef.current.x) / zoom;
      const dy = (e.clientY - dragStartRef.current.y) / zoom;

      const newXPixels = dragStartRef.current.elX + dx;
      const newYPixels = dragStartRef.current.elY + dy;

      let pctX = (newXPixels / rect.width) * 100;
      let pctY = (newYPixels / rect.height) * 100;

      // Keep within bounds
      pctX = Math.max(0, Math.min(pctX, 100));
      pctY = Math.max(0, Math.min(pctY, 100));

      // Snap Grid Logic
      if (snapToGrid) {
        pctX = Math.round(pctX / 5) * 5;
        pctY = Math.round(pctY / 5) * 5;
      }

      // Safe guidelines snap (50%)
      const snapThreshold = 2.5;
      if (!snapToGrid && Math.abs(pctX - 50) < snapThreshold) {
        pctX = 50;
        setShowVGuide(true);
      } else {
        setShowVGuide(false);
      }

      if (!snapToGrid && Math.abs(pctY - 50) < snapThreshold) {
        pctY = 50;
        setShowHGuide(true);
      } else {
        setShowHGuide(false);
      }

      setElements((prev) =>
        prev.map((el) => (el.id === activeElementId ? { ...el, x: Math.round(pctX * 10) / 10, y: Math.round(pctY * 10) / 10 } : el))
      );
    };

    const handleMouseUp = () => {
      if (activeElementId) {
        setActiveElementId(null);
        setShowVGuide(false);
        setShowHGuide(false);
      }
    };

    if (activeElementId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [activeElementId, snapToGrid, zoom]);

  // ───────────────────────────────────────────────────────────────────────────
  // STEP 5 & 6 HANDLERS (Payment & Generation Progress)
  // ───────────────────────────────────────────────────────────────────────────
  const startCheckout = () => {
    if (totalPrice > 0) {
      setShowPaymentModal(true);
      setCountdown(900); // Reset timer to 15m
    } else {
      // Free plan directly starts generating
      executeGeneration();
    }
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText("8932081234567890");
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePaymentSubmit = () => {
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setTimeout(() => {
        setShowPaymentModal(false);
        executeGeneration();
      }, 1000);
    }, 1500);
  };

  const executeGeneration = () => {
    setStep(5);
    setGenerationProgress(0);
    setCurrentIdx(0);
    setSuccessCount(0);
    setFailedCount(0);

    const total = participants.length;
    let idx = 0;

    const interval = setInterval(() => {
      if (idx >= total) {
        clearInterval(interval);
        setStep(6);
        return;
      }

      // Simulate some success vs failure
      const currentParticipant = participants[idx];
      const isFailed = !currentParticipant.nama || !currentParticipant.email || !currentParticipant.email.includes("@");

      if (isFailed) {
        setFailedCount((f) => f + 1);
        setGenerationLog(`Gagal: Baris ${idx + 1} (${currentParticipant.nama || "Tanpa Nama"}) format tidak valid.`);
      } else {
        setSuccessCount((s) => s + 1);
        setGenerationLog(`Sukses: Membuat PDF sertifikat untuk ${currentParticipant.nama}`);
      }

      idx++;
      setCurrentIdx(idx);
      setGenerationProgress(Math.round((idx / total) * 100));
    }, 400);
  };

  const triggerZipDownload = () => {
    const zipName = `SertifKilat_Batch_${new Date().getFullYear()}.zip`;
    const dummyContent = `SertifKilat.id - Bundel Sertifikat Resmi\n\nTanggal Transaksi: ${new Date().toLocaleDateString("id-ID")}\nJumlah Sukses: ${successCount}\nJumlah Gagal: ${failedCount}`;
    
    const blob = new Blob([dummyContent], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetWorkspace = () => {
    setStep(1);
    setTemplateFile(null);
    setTemplateError("");
    setParticipants([]);
    setDataError("");
    setValidationErrors([]);
    setZoom(1);
    setShowGrid(false);
    setSnapToGrid(false);
    setShowSafeArea(false);
  };

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-ink-100 sticky top-0 z-40">
        <div className="max-w-[1250px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Lightning weight="fill" className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-ink-900">
              SertifKilat<span className="text-brand-500">.id</span>
            </span>
          </Link>
          <Link href="/" className="btn-secondary py-1.5 px-4 text-xs font-semibold">
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-[1250px] mx-auto px-5 sm:px-8 pt-10">
        {/* Title Block */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="badge badge-brand mb-2">Editor Suite</span>
            <h1 className="text-3xl font-display font-bold text-ink-900">Sertifikat Workspace</h1>
            <p className="text-sm text-ink-500 mt-1">Sistem generator massal profesional untuk panitia event & trainer.</p>
          </div>
          {step > 1 && (
            <button onClick={resetWorkspace} className="btn-secondary text-xs self-start md:self-auto text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700">
              Mulai Ulang Project
            </button>
          )}
        </div>

        {/* 6-Step Visual Indicators */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto py-2 border-b border-ink-100 select-none no-scrollbar">
          {[
            { n: 1, label: "Template" },
            { n: 2, label: "Upload Berkas" },
            { n: 3, label: "Pratinjau Letak" },
            { n: 4, label: "Validasi Data" },
            { n: 5, label: "Cetak Progress" },
            { n: 6, label: "Selesai" },
          ].map((s, idx) => (
            <div key={s.n} className="flex items-center gap-2 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.n
                    ? "bg-brand-500 text-white shadow-glow"
                    : step > s.n
                    ? "bg-emerald-500 text-white"
                    : "bg-ink-200 text-ink-500"
                }`}
              >
                {step > s.n ? "✓" : s.n}
              </div>
              <span className={`text-xs font-semibold ${step === s.n ? "text-brand-600 font-bold" : "text-ink-500"}`}>
                {s.label}
              </span>
              {idx < 5 && <span className="text-ink-300 mx-1">→</span>}
            </div>
          ))}
        </div>

        {/* WORKSPACE LAYOUT CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT 3 COLUMNS: MAIN CONTENT */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* STEP 1: PILIH TEMPLATE */}
            {step === 1 && (
              <div className="card p-6 md:p-8 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-ink-900">Langkah 1: Pilih Template Latar Belakang</h3>
                  <p className="text-xs text-ink-500">Unggah desain template gambar kosongan tanpa tulisan dinamis.</p>
                </div>

                {templateError && (
                  <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700">
                    <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{templateError}</span>
                  </div>
                )}

                {templateFile ? (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden border border-ink-200 aspect-[1.41/1] max-w-xl mx-auto bg-ink-100 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={templateFile} alt="Uploaded template preview" className="max-w-full max-h-full object-contain" />
                      <button
                        onClick={() => setTemplateFile(null)}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-ink-900/80 text-white hover:bg-ink-900 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex justify-center gap-3">
                      <button onClick={() => setTemplateFile(null)} className="btn-secondary text-xs">
                        Ganti Gambar
                      </button>
                      <button onClick={() => setStep(2)} className="btn-primary text-xs">
                        Lanjut ke Upload Berkas <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-ink-200 rounded-2xl p-12 text-center hover:border-brand-500 hover:bg-brand-50/10 transition-all cursor-pointer space-y-3"
                    >
                      <UploadSimple className="w-12 h-12 text-ink-300 mx-auto" />
                      <div>
                        <p className="text-sm font-semibold text-ink-900">Pilih atau Drag & Drop Gambar Template</p>
                        <p className="text-xs text-ink-400 mt-1">Mendukung format PNG atau JPG. Rekomendasi dimensi 1122x794 piksel.</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleTemplateUpload}
                        className="hidden"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-ink-100" />
                      <span className="text-xs text-ink-400 font-semibold uppercase tracking-wider">Atau</span>
                      <div className="flex-1 h-px bg-ink-100" />
                    </div>

                    <button onClick={useDefaultTemplate} className="btn-secondary w-full justify-center text-xs py-3">
                      Gunakan Template Contoh (Gold Elegant)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: UPLOAD EXCEL / CSV */}
            {step === 2 && (
              <div className="card p-6 md:p-8 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-ink-900">Langkah 2: Unggah Berkas Data Peserta</h3>
                  <p className="text-xs text-ink-500">Unggah nama dan surat elektronik peserta secara massal.</p>
                </div>

                {dataError && (
                  <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700">
                    <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{dataError}</span>
                  </div>
                )}

                {hasUploaded ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-brand text-xs">
                        {participants.length} Baris Data Terunggah
                      </span>
                      <button onClick={() => setParticipants([])} className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium">
                        <X size={12} /> Hapus Data
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-ink-100">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-ink-100 text-ink-600 font-semibold border-b border-ink-200">
                          <tr>
                            <th className="px-4 py-2.5">No</th>
                            <th className="px-4 py-2.5">Nama Lengkap</th>
                            <th className="px-4 py-2.5">Email</th>
                            <th className="px-4 py-2.5">Acara</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-100 bg-white">
                          {participants.slice(0, 5).map((p, i) => (
                            <tr key={`generator-participant-${i}-${p.email}`} className="hover:bg-ink-50">
                              <td className="px-4 py-2 text-ink-400">{i + 1}</td>
                              <td className="px-4 py-2 font-medium text-ink-900">{p.nama || <span className="text-rose-500 italic">[Kosong]</span>}</td>
                              <td className="px-4 py-2 text-ink-500">{p.email || <span className="text-rose-500 italic">[Kosong]</span>}</td>
                              <td className="px-4 py-2 text-ink-400">{p.acara}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {participants.length > 5 && (
                        <div className="p-3 text-center bg-ink-50 border-t border-ink-100 text-xs text-ink-400 font-medium">
                          + {participants.length - 5} peserta lainnya dalam daftar.
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-ink-100">
                      <button onClick={() => setStep(1)} className="btn-secondary text-xs">
                        <ArrowLeft size={14} /> Kembali
                      </button>
                      <button onClick={() => setStep(3)} className="btn-primary text-xs">
                        Lanjut ke Atur Letak <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Information Area */}
                    <div className="bg-ink-50 rounded-xl p-4 border border-ink-150 text-xs space-y-2 text-ink-600 leading-normal">
                      <p className="font-semibold text-ink-800">📋 Informasi Format & Kuota:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Mendukung file Excel (<code className="bg-ink-200 px-1 py-0.5 rounded text-[10px]">.xlsx</code>) atau <code className="bg-ink-200 px-1 py-0.5 rounded text-[10px]">.csv</code>.</li>
                        <li>Format kolom wajib: <strong className="text-ink-900">Nama</strong> dan <strong className="text-ink-900">Email</strong>.</li>
                        <li>Maksimal kuota gratis: <strong className="text-emerald-600">25 sertifikat / bulan</strong>.</li>
                        <li>Jika jumlah peserta melebihi kuota gratis, biaya kelebihan dihitung otomatis secara transparan.</li>
                      </ul>
                    </div>

                    {/* Drag and drop zone */}
                    <div
                      onClick={() => dataInputRef.current?.click()}
                      className="border-2 border-dashed border-ink-200 rounded-2xl p-10 text-center hover:border-brand-500 hover:bg-brand-50/10 transition-all cursor-pointer space-y-3"
                    >
                      <FileCsv className="w-12 h-12 text-ink-300 mx-auto" />
                      <div>
                        <p className="text-sm font-semibold text-ink-900">Upload file Excel (.xlsx) atau CSV</p>
                        <p className="text-xs text-ink-400 mt-1">Seret berkas Anda kemari atau cari dari folder komputer.</p>
                      </div>
                      <input
                        ref={dataInputRef}
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleDataUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-ink-100" />
                      <span className="text-xs text-ink-400 font-semibold uppercase tracking-wider">Atau</span>
                      <div className="flex-1 h-px bg-ink-100" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button onClick={loadSampleData} className="btn-secondary justify-center text-xs py-2.5">
                        Gunakan Data Contoh (3 Peserta)
                      </button>
                      <button onClick={downloadExcelTemplate} className="btn-secondary justify-center text-xs py-2.5 text-brand-600 hover:text-brand-700">
                        <Download size={14} /> Download Template Excel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: PREVIEW (CANVAS EDITOR & COORDINATES) */}
            {step === 3 && (
              <div className="card p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-ink-900">Langkah 3: Pratinjau Letak & Koordinat</h3>
                    <p className="text-xs text-ink-500">Atur posisi tulisan Nama, Tanggal, Tanda Tangan, dan QR secara visual.</p>
                  </div>
                </div>

                {/* Canva-like Canvas Control Toolbar */}
                <div className="bg-ink-100 rounded-xl p-3 border border-ink-150 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                      className="p-2 rounded-lg bg-white border border-ink-200 hover:bg-ink-50 text-ink-700"
                      title="Zoom Out"
                    >
                      <MagnifyingGlassMinus size={14} />
                    </button>
                    <span className="font-mono font-bold text-ink-800 w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button
                      onClick={() => setZoom((z) => Math.min(1.5, z + 0.25))}
                      className="p-2 rounded-lg bg-white border border-ink-200 hover:bg-ink-50 text-ink-700"
                      title="Zoom In"
                    >
                      <MagnifyingGlassPlus size={14} />
                    </button>
                    <button
                      onClick={() => setZoom(1)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-ink-200 hover:bg-ink-50 text-ink-700 font-semibold text-[11px]"
                    >
                      Reset Zoom
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-ink-700">
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                        className="rounded border-ink-300 text-brand-500 focus:ring-brand-500 w-3.5 h-3.5"
                      />
                      <GridFour size={14} className="text-ink-400" /> Tampilkan Grid
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-ink-700">
                      <input
                        type="checkbox"
                        checked={snapToGrid}
                        onChange={(e) => setSnapToGrid(e.target.checked)}
                        className="rounded border-ink-300 text-brand-500 focus:ring-brand-500 w-3.5 h-3.5"
                      />
                      <Lightning size={14} className="text-ink-400" /> Snap to Grid (5%)
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer font-medium text-ink-700">
                      <input
                        type="checkbox"
                        checked={showSafeArea}
                        onChange={(e) => setShowSafeArea(e.target.checked)}
                        className="rounded border-ink-300 text-brand-500 focus:ring-brand-500 w-3.5 h-3.5"
                      />
                      <Ruler size={14} className="text-ink-400" /> Safe Area
                    </label>
                  </div>
                </div>

                {/* Editor Area with Scalable Canvas */}
                <div className="bg-ink-150 rounded-2xl border border-ink-200 p-6 flex justify-center items-center overflow-auto shadow-inner min-h-[380px] relative">
                  <div
                    ref={canvasRef}
                    className="relative select-none aspect-[1.41/1] w-full max-w-2xl bg-white shadow-soft rounded-lg border border-ink-300 transition-transform duration-100"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "center center",
                      backgroundImage: showGrid
                        ? "linear-gradient(to right, rgba(11, 18, 32, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(11, 18, 32, 0.04) 1px, transparent 1px)"
                        : "none",
                      backgroundSize: "20px 20px",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={templateFile || DEFAULT_TEMPLATE_IMAGE}
                      alt="Workspace Canvas"
                      className="w-full h-full object-contain pointer-events-none select-none"
                      draggable={false}
                    />

                    {/* Safe Area Dotted Border (5% inset) */}
                    {showSafeArea && (
                      <div className="absolute inset-[5%] border border-dashed border-rose-500/40 rounded-lg pointer-events-none z-10" />
                    )}

                    {/* Guidelines Center Snap Vertical */}
                    {showVGuide && (
                      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-rose-500/70 border-l border-dashed border-white/40 z-30 pointer-events-none" />
                    )}

                    {/* Guidelines Center Snap Horizontal */}
                    {showHGuide && (
                      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-rose-500/70 border-t border-dashed border-white/40 z-30 pointer-events-none" />
                    )}

                    {/* Draggable Overlays */}
                    {elements.map((el) => {
                      const isActive = activeElementId === el.id;
                      return (
                        <div
                          key={el.id}
                          onMouseDown={(e) => handleMouseDown(e, el.id)}
                          className={`absolute cursor-move px-3 py-1.5 rounded-lg border text-xxs font-bold shadow-sm transition-all duration-75 flex items-center gap-1 select-none z-20 ${
                            isActive
                              ? "bg-brand-500 text-white border-white scale-105 shadow-glow"
                              : "bg-white/95 text-ink-900 border-ink-300 hover:bg-white"
                          }`}
                          style={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          {el.id === "qr" && <QrCode size={14} className={isActive ? "text-white" : "text-ink-600"} />}
                          <span>{el.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-ink-100">
                  <button onClick={() => setStep(2)} className="btn-secondary text-xs">
                    <ArrowLeft size={14} /> Kembali
                  </button>
                  <button onClick={() => setStep(4)} className="btn-primary text-xs">
                    Lanjut ke Validasi <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: DATA VALIDATION */}
            {step === 4 && (
              <div className="card p-6 md:p-8 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-ink-900">Langkah 4: Validasi Berkas Peserta</h3>
                  <p className="text-xs text-ink-500">Pemeriksaan kualitas data sebelum proses pencetakan massal dilakukan.</p>
                </div>

                {validationErrors.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700">
                      <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold">Ditemukan {validationErrors.length} kesalahan data!</p>
                        <p className="text-xxs mt-0.5">Sertifikat tidak dapat dicetak jika terdapat data nama/email kosong atau duplikat.</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-rose-200">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-rose-100 text-rose-800 font-semibold border-b border-rose-200">
                          <tr>
                            <th className="px-4 py-2.5">Baris</th>
                            <th className="px-4 py-2.5">Nama Terbaca</th>
                            <th className="px-4 py-2.5">Email Terbaca</th>
                            <th className="px-4 py-2.5">Deskripsi Kesalahan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rose-100 bg-white">
                          {validationErrors.map((err, i) => (
                            <tr key={`validation-error-${i}-${err.row}`} className="hover:bg-rose-50/50">
                              <td className="px-4 py-2 font-semibold text-rose-700"># {err.row}</td>
                              <td className="px-4 py-2 font-medium text-ink-900">{err.nama}</td>
                              <td className="px-4 py-2 text-ink-600">{err.email}</td>
                              <td className="px-4 py-2 text-rose-700 font-medium">
                                <span className="inline-flex flex-wrap gap-1">
                                  {err.errors.map((msg, idx) => (
                                    <span key={idx} className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                      {msg}
                                    </span>
                                  ))}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={loadSampleData} className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700">
                        Gunakan Data Uji Bersih
                      </button>
                      <button onClick={() => setStep(2)} className="btn-secondary text-xs text-rose-600 border-rose-200 hover:bg-rose-50">
                        Upload Ulang File Excel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-500">
                      <CheckCircle weight="fill" className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-ink-900 text-base">Seluruh Data Peserta Valid!</h4>
                      <p className="text-xs text-ink-500 max-w-sm mx-auto">
                        Kami memeriksa alamat email kosong, format salah, dan baris duplikat. Tidak ada kesalahan terdeteksi.
                      </p>
                    </div>

                    <div className="flex gap-3 justify-center pt-4">
                      <button onClick={() => setStep(3)} className="btn-secondary text-xs">
                        <ArrowLeft size={14} /> Kembali
                      </button>
                      <button onClick={startCheckout} className="btn-primary text-xs">
                        Lanjut ke Cetak Sertifikat <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: GENERATE PROGRESS SCREEN */}
            {step === 5 && (
              <div className="card p-6 md:p-8 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-ink-900">Langkah 5: Sedang Mencetak Sertifikat</h3>
                  <p className="text-xs text-ink-500">Proses penyusunan PDF sertifikat dan penyematan QR verifikasi secara realtime.</p>
                </div>

                <div className="max-w-xl mx-auto bg-ink-100 border border-ink-150 rounded-2xl p-6 space-y-5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-ink-800 flex items-center gap-1.5">
                      <CircleNotch className="w-4 h-4 animate-spin text-brand-500" />
                      Mencetak Dokumen: {currentIdx} / {totalCount}
                    </span>
                    <span className="font-mono font-bold text-brand-600 text-sm">{generationProgress}%</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-ink-200 rounded-full h-3 overflow-hidden border border-ink-250">
                    <div
                      className="bg-brand-500 h-full rounded-full transition-all duration-300 shadow-glow"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>

                  <div className="text-xxs font-mono bg-ink-900 text-ink-300 p-4 rounded-xl max-h-36 overflow-y-auto space-y-1.5">
                    <p className="text-emerald-400 font-bold">[SYSTEM] Memulai modul antrean cetak...</p>
                    <p className="text-ink-400">Total batch: {totalCount} sertifikat</p>
                    <p className="text-brand-400">&gt; {generationLog}</p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-ink-400 font-medium">
                    <span>Estimasi tersisa: {Math.max(0, Math.ceil((totalCount - currentIdx) * 0.4))} detik</span>
                    <span>Sukses: {successCount} | Gagal: {failedCount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: HALAMAN BERHASIL (SUCCESS SCREEN) */}
            {step === 6 && (
              <div className="card p-8 md:p-12 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-500 shadow-soft">
                  <CheckCircle weight="fill" className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-display text-ink-900">🎉 Sertifikat Berhasil Dibuat!</h3>
                  <p className="text-sm text-ink-500 max-w-md mx-auto">
                    Seluruh berkas sertifikat digital Anda telah selesai dikompilasi ke dalam format gambar & PDF beresolusi tinggi.
                  </p>
                </div>

                {/* Status Summary */}
                <div className="max-w-sm mx-auto grid grid-cols-2 gap-4 bg-ink-50 border border-ink-150 p-4 rounded-2xl text-xs">
                  <div className="border-r border-ink-200">
                    <p className="text-ink-400">Sukses Dibuat</p>
                    <p className="text-lg font-bold text-emerald-600 mt-0.5">{successCount} Berhasil</p>
                  </div>
                  <div>
                    <p className="text-ink-400">Gagal Proses</p>
                    <p className="text-lg font-bold text-rose-600 mt-0.5">{failedCount} Gagal</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-center max-w-md mx-auto pt-4 border-t border-ink-100">
                  <button onClick={triggerZipDownload} className="btn-primary text-xs flex items-center gap-1.5">
                    <Download size={14} /> Download ZIP
                  </button>
                  <button
                    onClick={() => {
                      alert("Tiruan Blast Email: Sertifikat sedang dikirim ke email masing-masing peserta (bagas@kelasonline.id, dll).");
                    }}
                    className="btn-secondary text-xs text-brand-600 border-brand-200 hover:bg-brand-50"
                  >
                    <Envelope size={14} /> Kirim Email
                  </button>
                  <button onClick={resetWorkspace} className="btn-secondary text-xs">
                    Generate Lagi
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT 1 COLUMN: SIDEBAR SUMMARY WIDGET */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="card p-6 bg-white border border-ink-100 flex flex-col justify-between min-h-[300px]">
              <div className="space-y-4">
                <h4 className="font-bold text-ink-900 text-sm border-b border-ink-100 pb-2">Ringkasan Project</h4>

                {!hasUploaded ? (
                  /* Empty state summary */
                  <div className="space-y-4 py-2">
                    <p className="text-xs text-ink-400 leading-relaxed">
                      Belum ada data peserta. Upload file Excel atau CSV terlebih dahulu.
                    </p>
                    <div className="pt-2 border-t border-ink-100 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-400">Paket saat ini:</span>
                        <span className="font-bold text-brand-600">FREE</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-400">Kuota Gratis:</span>
                        <span className="font-semibold text-ink-800">25 / bulan</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-ink-400">Biaya:</span>
                        <span className="font-mono font-bold text-ink-900">Rp0</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Active summary calculations */
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-ink-400">Jumlah Peserta:</span>
                      <span className="font-bold text-ink-800">{totalCount} Peserta</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-400">Kuota Gratis:</span>
                      <span className="font-semibold text-emerald-600">{freeQuotaUsed} Gratis</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-400">Peserta Berbayar:</span>
                      <span className={`font-semibold ${paidCount > 0 ? "text-amber-600 font-bold" : "text-ink-800"}`}>
                        {paidCount} Berbayar
                      </span>
                    </div>
                    {paidCount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-ink-400">Tarif Kelebihan:</span>
                        <span className="font-semibold text-ink-800">{formatIDR(rate)} / org</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 border-t border-dashed border-ink-200 text-sm">
                      <span className="font-bold text-ink-900">Total Tagihan:</span>
                      <span className="font-bold text-brand-600 font-mono">{formatIDR(totalPrice)}</span>
                    </div>

                    {paidCount > 0 ? (
                      <span className="badge badge-brand text-[9px] uppercase tracking-wider block text-center mt-3 font-bold py-1">
                        Membayar Kelebihan Kuota
                      </span>
                    ) : (
                      <span className="badge badge-green text-[9px] uppercase tracking-wider block text-center mt-3 font-bold py-1">
                        Termasuk Kuota Gratis (Rp0)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Steps control buttons dynamically adjusted to sidebar summary */}
              <div className="mt-8 pt-4 border-t border-ink-100">
                {step === 2 && hasUploaded && (
                  <button onClick={() => setStep(3)} className="btn-primary w-full justify-center text-xs py-2.5">
                    Lanjut ke Atur Letak <ArrowRight size={14} />
                  </button>
                )}
                {step === 3 && (
                  <button onClick={() => setStep(4)} className="btn-primary w-full justify-center text-xs py-2.5">
                    Lanjut ke Validasi <ArrowRight size={14} />
                  </button>
                )}
                {step === 4 && !validationErrors.length && (
                  <button onClick={startCheckout} className="btn-primary w-full justify-center text-xs py-2.5">
                    {totalPrice > 0 ? "Lanjut ke Pembayaran" : "Generate Sertifikat (Gratis)"}
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ───────────────────────────────────────────────────────────────────────────
          MODAL PEMBAYARAN PRO (REDESIGN TOTAL)
          ─────────────────────────────────────────────────────────────────────────── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-ink-200 w-full max-w-lg overflow-hidden shadow-glow flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-ink-150 flex justify-between items-center bg-ink-50">
              <div>
                <h4 className="font-bold text-ink-900 text-sm">Pembayaran Invoice Kelebihan Kuota</h4>
                <p className="text-[10px] text-ink-400 font-mono mt-0.5">INV-SK-2026-9041 · 29 Juni 2026</p>
              </div>
              <button
                onClick={() => !paymentLoading && setShowPaymentModal(false)}
                className="text-ink-400 hover:text-ink-700 transition-colors"
                disabled={paymentLoading}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Layout */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              
              {/* Checkout details billing */}
              <div className="bg-brand-50/10 border border-brand-200/50 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-500">Kuota Pemakaian</span>
                  <span className="font-semibold text-ink-800">{totalCount} Sertifikat ({freeQuotaUsed} Gratis)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Unit Berbayar</span>
                  <span className="font-semibold text-ink-800">{paidCount} Sertifikat × {formatIDR(rate)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-ink-150 text-sm">
                  <span className="font-bold text-ink-900">Total Tagihan (Nett)</span>
                  <span className="font-bold text-brand-600 font-mono">{formatIDR(totalPrice)}</span>
                </div>
              </div>

              {/* Payment tabs */}
              <div className="space-y-2">
                <label className="block text-xxs font-bold text-ink-400 uppercase tracking-wider">Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedPaymentMethod("qris")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedPaymentMethod === "qris" ? "bg-brand-50 border-brand-500 text-brand-700 font-bold" : "border-ink-200 text-ink-600 hover:bg-ink-50"
                    }`}
                  >
                    <QrCode size={18} />
                    <span className="text-[11px]">QRIS</span>
                  </button>

                  <button
                    onClick={() => setSelectedPaymentMethod("va")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedPaymentMethod === "va" ? "bg-brand-50 border-brand-500 text-brand-700 font-bold" : "border-ink-200 text-ink-600 hover:bg-ink-50"
                    }`}
                  >
                    <Coins size={18} />
                    <span className="text-[11px]">Virtual Account</span>
                  </button>

                  <button
                    onClick={() => setSelectedPaymentMethod("cc")}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      selectedPaymentMethod === "cc" ? "bg-brand-50 border-brand-500 text-brand-700 font-bold" : "border-ink-200 text-ink-600 hover:bg-ink-50"
                    }`}
                  >
                    <CreditCard size={18} />
                    <span className="text-[11px]">Credit Card</span>
                  </button>
                </div>
              </div>

              {/* Tab Panels */}
              <div className="bg-ink-50 rounded-xl p-4 border border-ink-150">
                
                {/* QRIS Tab */}
                {selectedPaymentMethod === "qris" && (
                  <div className="text-center space-y-4">
                    <p className="text-xs font-semibold text-ink-700">Scan QRIS menggunakan E-Wallet Anda</p>
                    
                    {/* Mock QR Code design */}
                    <div className="w-36 h-36 bg-white border border-ink-300 rounded-xl p-2 mx-auto flex items-center justify-center shadow-sm relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SertifKilatQRIS"
                        alt="QRIS QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="text-xxs text-ink-400 space-y-1">
                      <p>Waktu tersisa pembayaran: <strong className="text-rose-600">{formatTime(countdown)}</strong></p>
                      <p>Status: <span className="font-semibold text-amber-600">Menunggu scan...</span></p>
                    </div>

                    <div className="flex gap-2 justify-center">
                      <button onClick={handlePaymentSubmit} className="btn-primary text-xs py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700">
                        Konfirmasi Bayar
                      </button>
                      <button onClick={() => alert("Status transaksi terupdate: Menunggu Pembayaran.")} className="btn-secondary text-xs py-1.5 px-3">
                        <ArrowClockwise size={12} className="inline mr-1" /> Refresh Status
                      </button>
                    </div>
                  </div>
                )}

                {/* Virtual Account Tab */}
                {selectedPaymentMethod === "va" && (
                  <div className="space-y-4">
                    {/* Bank selector */}
                    <div className="flex gap-2 justify-center border-b border-ink-200 pb-3">
                      {["bca", "mandiri", "bni"].map((bank) => (
                        <button
                          key={bank}
                          onClick={() => setSelectedBank(bank as "bca" | "mandiri" | "bni")}
                          className={`px-3 py-1 rounded text-xxs font-bold uppercase transition-colors ${
                            selectedBank === bank ? "bg-ink-900 text-white" : "bg-white border border-ink-200 text-ink-600"
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <p className="text-xxs text-ink-400 uppercase font-bold">Nama Bank Penerima</p>
                        <p className="font-semibold text-ink-800 uppercase">{selectedBank} Virtual Account</p>
                      </div>
                      <div>
                        <p className="text-xxs text-ink-400 uppercase font-bold">Nomor Rekening VA</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-white border border-ink-250 px-2.5 py-1 rounded text-ink-900 font-mono font-bold tracking-wider text-xs">
                            8932081234567890
                          </code>
                          <button onClick={handleCopyVA} className="p-1.5 rounded bg-white border border-ink-200 text-ink-600 hover:bg-ink-100 flex items-center gap-1 text-[10px]">
                            {copiedText ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            {copiedText ? "Tersalin!" : "Salin"}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xxs text-ink-400 uppercase font-bold">Total Pembayaran</p>
                        <p className="font-bold text-brand-600 font-mono text-sm">{formatIDR(totalPrice)}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-center pt-2 border-t border-ink-200">
                      <button onClick={handlePaymentSubmit} className="btn-primary text-xs py-1.5 px-4">
                        Saya Sudah Bayar
                      </button>
                    </div>
                  </div>
                )}

                {/* Credit Card Tab */}
                {selectedPaymentMethod === "cc" && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-xxs font-bold text-ink-400 uppercase mb-1">Nama pada Kartu</label>
                      <input
                        type="text"
                        placeholder="Contoh: Bagas Santoso"
                        value={ccName}
                        onChange={(e) => setCcName(e.target.value)}
                        className="input-field py-1.5 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xxs font-bold text-ink-400 uppercase mb-1">Nomor Kartu Kredit</label>
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={ccNum}
                        onChange={(e) => setCcNum(e.target.value)}
                        maxLength={19}
                        className="input-field py-1.5 bg-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xxs font-bold text-ink-400 uppercase mb-1">Masa Berlaku</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={ccExp}
                          onChange={(e) => setCcExp(e.target.value)}
                          maxLength={5}
                          className="input-field py-1.5 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xxs font-bold text-ink-400 uppercase mb-1">CVC</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={ccCvc}
                          onChange={(e) => setCcCvc(e.target.value)}
                          maxLength={3}
                          className="input-field py-1.5 bg-white font-mono"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handlePaymentSubmit}
                      disabled={paymentLoading}
                      className="btn-primary w-full justify-center text-xs py-2 mt-2 bg-brand-500"
                    >
                      {paymentLoading ? <CircleNotch className="w-4 h-4 animate-spin" /> : `Bayar ${formatIDR(totalPrice)} Sekarang`}
                    </button>
                  </div>
                )}

              </div>

              {/* Modal footer notes */}
              <p className="text-[10px] text-ink-400 text-center leading-normal">
                Invoice pembayaran ini bersifat mock/tiruan untuk tujuan pengujian dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
