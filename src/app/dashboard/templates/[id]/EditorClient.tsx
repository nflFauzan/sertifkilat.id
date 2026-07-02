"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import {
  CaretLeft,
  FloppyDisk,
  TextT,
  Palette,
  TextAa,
  TextAlignCenter,
  TextAlignLeft,
  TextAlignRight,
  CircleNotch,
  Image as ImageIcon,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import { updateTemplateFieldsAction } from "@/app/actions/templates";
import Link from "next/link";

type Field = {
  key: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
  align?: string;
  text?: string;
  hidden?: boolean;
  width?: number;
  height?: number;
  fileUrl?: string;
};

type Template = {
  id: string;
  name: string;
  fileUrl: string;
  width: number;
  height: number;
  fields: Field[];
};

const FIELD_LABELS: Record<string, string> = {
  ornament: "Ornamen Atas",
  title: "Judul Sertifikat",
  subtitle: "Sub Judul",
  name: "Nama Peserta",
  participation: "Teks Partisipasi",
  event: "Nama Event / Kegiatan",
  divider: "Garis Pemisah",
  date: "Tanggal Kegiatan",
  location: "Tempat Kegiatan",
  signer1Name: "Nama Ketua Panitia",
  signer1Title: "Jabatan Ketua",
  signer2Name: "Nama Pimpinan Instansi",
  signer2Title: "Jabatan Pimpinan",
  serial: "Kode Sertifikat (Serial)",
  qr: "Area QR Code",
  qrText: "Teks Bawah QR",
  logo: "Logo Instansi",
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  ornament: "✦",
  title: "SERTIFIKAT",
  subtitle: "DIBERIKAN KEPADA",
  name: "Bagas Santoso, S.Kom",
  participation: "ATAS PARTISIPASINYA SEBAGAI",
  event: "Webinar Nasional Desain UI/UX 2026",
  divider: "— — — — — — — — — — — — — — —",
  date: "12 Juni 2026",
  location: "Jakarta, Indonesia",
  signer1Name: "NAMA KETUA PANITIA",
  signer1Title: "Ketua Panitia",
  signer2Name: "NAMA PIMPINAN INSTANSI",
  signer2Title: "Direktur Instansi",
  serial: "SK-2026-0001",
  qr: "[QR Code Area]",
  qrText: "SCAN UNTUK VERIFIKASI",
  logo: "[Logo Instansi]",
};

const DEFAULT_FIELDS_MAP: Record<string, Field> = {
  ornament: { key: "ornament", x: 561, y: 120, fontSize: 32, color: "#D4AF37", fontWeight: "normal", align: "center", text: "✦" },
  title: { key: "title", x: 561, y: 180, fontSize: 48, color: "#0D1B2A", fontWeight: "bold", align: "center", text: "SERTIFIKAT" },
  subtitle: { key: "subtitle", x: 561, y: 240, fontSize: 18, color: "#D4AF37", fontWeight: "bold", align: "center", text: "DIBERIKAN KEPADA" },
  name: { key: "name", x: 561, y: 340, fontSize: 44, color: "#0D1B2A", fontWeight: "normal", align: "center", text: "Nama Peserta" },
  participation: { key: "participation", x: 561, y: 410, fontSize: 14, color: "#475569", fontWeight: "normal", align: "center", text: "ATAS PARTISIPASINYA SEBAGAI" },
  event: { key: "event", x: 561, y: 460, fontSize: 24, color: "#0D1B2A", fontWeight: "bold", align: "center", text: "Webinar Nasional Desain UI/UX 2026" },
  divider: { key: "divider", x: 561, y: 505, fontSize: 16, color: "#D4AF37", fontWeight: "normal", align: "center", text: "— — — — — — — — — — — — — — —" },
  date: { key: "date", x: 480, y: 540, fontSize: 14, color: "#475569", fontWeight: "normal", align: "right", text: "12 Juni 2026" },
  location: { key: "location", x: 640, y: 540, fontSize: 14, color: "#475569", fontWeight: "normal", align: "left", text: "Jakarta, Indonesia" },
  qr: { key: "qr", x: 180, y: 645, fontSize: 80, color: "#000000", fontWeight: "normal", align: "center" },
  qrText: { key: "qrText", x: 180, y: 705, fontSize: 10, color: "#64748b", fontWeight: "normal", align: "center", text: "SCAN UNTUK VERIFIKASI" },
  signer1Name: { key: "signer1Name", x: 450, y: 670, fontSize: 16, color: "#0D1B2A", fontWeight: "bold", align: "center", text: "NAMA KETUA PANITIA" },
  signer1Title: { key: "signer1Title", x: 450, y: 695, fontSize: 14, color: "#475569", fontWeight: "normal", align: "center", text: "Jabatan" },
  signer2Name: { key: "signer2Name", x: 750, y: 670, fontSize: 16, color: "#0D1B2A", fontWeight: "bold", align: "center", text: "NAMA PIMPINAN INSTANSI" },
  signer2Title: { key: "signer2Title", x: 750, y: 695, fontSize: 14, color: "#475569", fontWeight: "normal", align: "center", text: "Jabatan" },
  serial: { key: "serial", x: 1020, y: 730, fontSize: 12, color: "#64748b", fontWeight: "normal", align: "right", text: "SK-2026-0001" },
  logo: { key: "logo", x: 970, y: 120, width: 80, height: 80, fileUrl: "", hidden: false },
};

export default function EditorClient({ template }: { template: Template }) {
  // Merge loaded fields with DEFAULT_FIELDS_MAP to support older/incomplete templates seamlessly
  const [fields, setFields] = useState<Field[]>(() => {
    const loaded = template.fields || [];
    return Object.values(DEFAULT_FIELDS_MAP).map((def) => {
      const existing = loaded.find((f) => f.key === def.key);
      return existing ? { ...def, ...existing } : def;
    });
  });
  
  const [selectedKey, setSelectedKey] = useState<string>("name");
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Monitor image load to handle positioning correctly
  const [dimensions, setDimensions] = useState({ width: 800, height: 566 });
  const [imageLoaded, setImageLoaded] = useState(false);

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    setDimensions({
      width: img.clientWidth,
      height: img.clientHeight,
    });
    setImageLoaded(true);
  }

  // Handle window resizing
  useEffect(() => {
    function handleResize() {
      if (imageRef.current) {
        setDimensions({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight,
        });
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imageLoaded]);

  const activeField = fields.find((f) => f.key === selectedKey) || fields[0];

  function updateFieldProperty(key: string, property: keyof Field, value: unknown) {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, [property]: value } : f))
    );
  }

  // Drag and drop logic inside canvas
  const [dragState, setDragState] = useState<{
    fieldKey: string;
    startX: number;
    startY: number;
    startFieldX: number;
    startFieldY: number;
  } | null>(null);

  function handleMouseDown(e: React.MouseEvent, fieldKey: string, field: Field) {
    e.preventDefault();
    setSelectedKey(fieldKey);

    setDragState({
      fieldKey,
      startX: e.clientX,
      startY: e.clientY,
      // Convert native coordinates to display coordinates for drag starting point
      startFieldX: (field.x * dimensions.width) / template.width,
      startFieldY: (field.y * dimensions.height) / template.height,
    });
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragState || !containerRef.current) return;

      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;

      // Calculate new display coordinates
      let displayX = dragState.startFieldX + dx;
      let displayY = dragState.startFieldY + dy;

      // Restrain coordinates inside canvas
      displayX = Math.max(0, Math.min(displayX, dimensions.width));
      displayY = Math.max(0, Math.min(displayY, dimensions.height));

      // Translate display coordinates back to native template coordinates
      const nativeX = Math.round((displayX * template.width) / dimensions.width);
      const nativeY = Math.round((displayY * template.height) / dimensions.height);

      setFields((prev) =>
        prev.map((f) =>
          f.key === dragState.fieldKey ? { ...f, x: nativeX, y: nativeY } : f
        )
      );
    }

    function handleMouseUp() {
      if (dragState) {
        setDragState(null);
      }
    }

    if (dragState) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, dimensions, template.width, template.height]);

  function handleSave() {
    startTransition(async () => {
      const res = await updateTemplateFieldsAction(template.id, fields);
      if (res.error) {
        alert(res.error);
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    });
  }

  function handleReset() {
    if (confirm("Apakah Anda yakin ingin mengatur ulang posisi dan gaya semua elemen ke bawaan?")) {
      const defaultFields = Object.values(DEFAULT_FIELDS_MAP);
      setFields(defaultFields);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] min-h-[500px]">
      {/* Top Navbar */}
      <div className="flex items-center justify-between pb-4 border-b border-ink-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/templates"
            className="p-2 rounded-xl text-ink-600 hover:bg-ink-150 transition-all"
          >
            <CaretLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-ink-900">{template.name}</h1>
            <p className="text-xs text-ink-400">Geser elemen di canvas untuk mengatur tata letak sertifikat.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-ink-600 border border-ink-200 hover:bg-ink-50 hover:text-ink-800 transition-all"
          >
            <ArrowCounterClockwise className="w-3.5 h-3.5" />
            Reset Bawaan
          </button>
          
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-600 font-medium animate-pulse">
                Tata letak tersimpan!
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isPending}
              className="btn-primary"
            >
              {isPending ? (
                <CircleNotch className="w-4 h-4 animate-spin" />
              ) : (
                <FloppyDisk className="w-4 h-4" />
              )}
              Simpan Tata Letak
            </button>
          </div>
        </div>
      </div>

      {/* Editor Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 pt-6 overflow-hidden">
        
        {/* Sidebar Controls */}
        <div className="w-full lg:w-80 flex-shrink-0 bg-white border border-ink-150 rounded-2xl p-5 flex flex-col gap-5 overflow-y-auto">
          <div>
            <h3 className="font-semibold text-ink-900 text-sm">Elemen Template</h3>
            <p className="text-xs text-ink-400 mt-0.5">Pilih elemen untuk mengonfigurasi gaya tulisan.</p>
          </div>

          {/* Element Selection Buttons */}
          <div className="grid grid-cols-1 gap-2">
            {fields.map((f) => (
              <button
                key={f.key}
                onClick={() => setSelectedKey(f.key)}
                className={`flex items-center justify-between px-4 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                  selectedKey === f.key
                    ? "bg-brand-50 border-brand-300 text-brand-700 shadow-sm"
                    : "border-ink-100 text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                } ${f.hidden ? "opacity-60 bg-ink-50/50" : ""}`}
              >
                <span className="truncate max-w-[130px]">{FIELD_LABELS[f.key] || f.key}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink-100 text-ink-500 font-normal shrink-0">
                  X:{f.x}, Y:{f.y}
                </span>
              </button>
            ))}
          </div>

          {activeField && (
            <div className="border-t border-ink-100 pt-5 space-y-4">
              <h4 className="font-semibold text-ink-900 text-xs uppercase tracking-wider">
                Pengaturan {FIELD_LABELS[activeField.key]}
              </h4>

              {/* Show / Hide Toggle */}
              <div className="flex items-center justify-between py-2 border-b border-ink-100">
                <span className="text-xs font-semibold text-ink-700">Tampilkan Elemen</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!activeField.hidden}
                    onChange={(e) => updateFieldProperty(activeField.key, "hidden", !e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-ink-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-ink-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
              </div>

              {/* Edit Text Content (if not QR or Logo) */}
              {activeField.key !== "qr" && activeField.key !== "logo" && (
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                    Isi Teks
                  </label>
                  <input
                    type="text"
                    value={activeField.text !== undefined ? activeField.text : (FIELD_PLACEHOLDERS[activeField.key] || "")}
                    onChange={(e) =>
                      updateFieldProperty(activeField.key, "text", e.target.value)
                    }
                    className="input-field py-1.5 px-3 text-xs"
                  />
                </div>
              )}

              {/* Font Size controls (hidden for logo) */}
              {activeField.key !== "logo" && (
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 mb-1.5">
                    <TextT className="w-4 h-4 text-ink-400" />
                    {activeField.key === "qr" ? "Ukuran QR Code (px)" : "Ukuran Font (px)"}
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="150"
                    value={activeField.fontSize || (activeField.key === "qr" ? 80 : 24)}
                    onChange={(e) =>
                      updateFieldProperty(activeField.key, "fontSize", parseInt(e.target.value) || 24)
                    }
                    className="input-field py-1.5 px-3 text-xs"
                  />
                </div>
              )}

              {/* Logo Size and Upload Controls */}
              {activeField.key === "logo" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                      Ukuran Logo (Lebar x Tinggi px)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-ink-400">Lebar</span>
                        <input
                          type="number"
                          min="10"
                          max="400"
                          value={activeField.width || 80}
                          onChange={(e) =>
                            updateFieldProperty(activeField.key, "width", parseInt(e.target.value) || 80)
                          }
                          className="input-field py-1.5 px-3 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-ink-400">Tinggi</span>
                        <input
                          type="number"
                          min="10"
                          max="400"
                          value={activeField.height || 80}
                          onChange={(e) =>
                            updateFieldProperty(activeField.key, "height", parseInt(e.target.value) || 80)
                          }
                          className="input-field py-1.5 px-3 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                      Upload Gambar Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            const base64 = evt.target?.result as string;
                            updateFieldProperty(activeField.key, "fileUrl", base64);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Font Color & Style (hidden for QR and Logo) */}
              {activeField.key !== "qr" && activeField.key !== "logo" && (
                <>
                  {/* Font Color */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 mb-1.5">
                      <Palette className="w-4 h-4 text-ink-400" />
                      Warna Teks (Hex)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={activeField.color || "#000000"}
                        onChange={(e) =>
                          updateFieldProperty(activeField.key, "color", e.target.value)
                        }
                        className="w-10 h-9 rounded-lg border border-ink-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={activeField.color || "#000000"}
                        onChange={(e) =>
                          updateFieldProperty(activeField.key, "color", e.target.value)
                        }
                        className="input-field flex-1 py-1.5 px-3 text-xs"
                      />
                    </div>
                  </div>

                  {/* Font Weight */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 mb-1.5">
                      <TextAa className="w-4 h-4 text-ink-400" />
                      Ketebalan Font
                    </label>
                    <select
                      value={activeField.fontWeight || "normal"}
                      onChange={(e) =>
                        updateFieldProperty(activeField.key, "fontWeight", e.target.value)
                      }
                      className="input-field py-1.5 px-3 text-xs"
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="semibold">Semibold</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>

                  {/* Text Align */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 mb-1.5">
                      <TextAlignCenter className="w-4 h-4 text-ink-400" />
                      Rata Kiri/Kanan
                    </label>
                    <div className="flex rounded-lg border border-ink-200 p-0.5 bg-ink-50">
                      {[
                        { val: "left", icon: TextAlignLeft },
                        { val: "center", icon: TextAlignCenter },
                        { val: "right", icon: TextAlignRight },
                      ].map((alignOpt) => {
                        const Icon = alignOpt.icon;
                        return (
                          <button
                            key={alignOpt.val}
                            type="button"
                            onClick={() =>
                              updateFieldProperty(activeField.key, "align", alignOpt.val)
                            }
                            className={`flex-1 flex justify-center py-1.5 rounded-md transition-all ${
                              (activeField.align || "center") === alignOpt.val
                                ? "bg-white text-brand-600 shadow-sm border border-ink-100"
                                : "text-ink-500 hover:text-ink-800"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Canvas Editor Area */}
        <div className="flex-1 bg-ink-100 border border-ink-200 rounded-2xl p-6 flex items-center justify-center overflow-auto">
          <div
            ref={containerRef}
            className="relative shadow-soft select-none max-w-full max-h-full aspect-[1122/794]"
            style={{ width: "100%", height: "auto" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={template.fileUrl || "/templates/elegan-navy-gold.svg"}
              alt="Template Workspace"
              onLoad={handleImageLoad}
              className="w-full h-auto select-none rounded-xl"
              draggable={false}
            />

            {/* Draggable Fields over Template */}
            {imageLoaded &&
              fields.map((field) => {
                const isSelected = selectedKey === field.key;
                if (field.hidden && !isSelected) return null;

                // Display coordinates calculated from native coordinates
                const displayX = (field.x * dimensions.width) / template.width;
                const displayY = (field.y * dimensions.height) / template.height;

                // Adjust for alignment offsets
                let alignTransform = "translate(-50%, -50%)";
                if (field.align === "left") alignTransform = "translate(0%, -50%)";
                if (field.align === "right") alignTransform = "translate(-100%, -50%)";

                // SPECIAL FIELD: LOGO DRAWING
                if (field.key === "logo") {
                  const lw = (field.width || 80) * (dimensions.width / template.width);
                  const lh = (field.height || 80) * (dimensions.height / template.height);

                  return (
                    <div
                      key={field.key}
                      onMouseDown={(e) => handleMouseDown(e, field.key, field)}
                      className={`absolute cursor-move rounded-lg border flex items-center justify-center overflow-hidden transition-all duration-100 select-none ${
                        isSelected
                          ? "border-white bg-brand-500/10 ring-2 ring-brand-500 z-20"
                          : "border-ink-200 bg-white/90 hover:bg-white z-10"
                      } ${field.hidden ? "opacity-40 border-dashed" : ""}`}
                      style={{
                        left: `${displayX}px`,
                        top: `${displayY}px`,
                        width: `${lw}px`,
                        height: `${lh}px`,
                        transform: alignTransform,
                      }}
                    >
                      {field.fileUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={field.fileUrl}
                          alt="Logo Instansi"
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-1 text-center">
                          <ImageIcon className="w-5 h-5 text-ink-400" />
                          <span className="text-[8px] text-ink-500 mt-0.5">LOGO</span>
                        </div>
                      )}
                    </div>
                  );
                }

                // SPECIAL FIELD: QR CODE PLACEHOLDER BOX
                if (field.key === "qr") {
                  const size = (field.fontSize || 80) * (dimensions.width / template.width);

                  return (
                    <div
                      key={field.key}
                      onMouseDown={(e) => handleMouseDown(e, field.key, field)}
                      className={`absolute cursor-move border-2 border-dashed flex flex-col items-center justify-center bg-white/80 transition-all duration-100 select-none ${
                        isSelected
                          ? "border-brand-500 bg-brand-50/50 z-20"
                          : "border-ink-400 bg-ink-50/50 z-10"
                      } ${field.hidden ? "opacity-30" : ""}`}
                      style={{
                        left: `${displayX}px`,
                        top: `${displayY}px`,
                        width: `${size}px`,
                        height: `${size}px`,
                        transform: alignTransform,
                      }}
                    >
                      <div className="text-center p-1">
                        <div className="w-4 h-4 border border-ink-500 border-dashed mx-auto mb-0.5"></div>
                        <span className="text-[8px] font-bold text-ink-600 uppercase tracking-wider block">QR CODE</span>
                      </div>
                    </div>
                  );
                }

                // STANDARD TEXT FIELDS
                const textValue = field.text !== undefined ? field.text : (FIELD_PLACEHOLDERS[field.key] || field.key);

                return (
                  <div
                    key={field.key}
                    onMouseDown={(e) => handleMouseDown(e, field.key, field)}
                    className={`absolute cursor-move px-2.5 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-shadow duration-100 select-none ${
                      isSelected
                        ? "bg-brand-500 border-white text-white shadow-glow scale-[1.03] z-20"
                        : "bg-white/90 border-ink-200 text-ink-900 shadow-sm hover:bg-white z-10"
                    } ${field.hidden ? "opacity-40 border-dashed" : ""}`}
                    style={{
                      left: `${displayX}px`,
                      top: `${displayY}px`,
                      transform: alignTransform,
                      fontSize: `${(field.fontSize || 24) * (dimensions.width / template.width)}px`,
                      color: isSelected ? "#ffffff" : field.color || "#000000",
                      fontWeight: field.fontWeight || "normal",
                      fontFamily: field.key === "name" ? "var(--font-alex-brush), Alex Brush, cursive" : "var(--font-plus-jakarta), Inter, sans-serif",
                    }}
                  >
                    {textValue}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
