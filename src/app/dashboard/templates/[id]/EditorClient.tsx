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
  name: "Nama Peserta",
  event: "Nama Event",
  date: "Tanggal Event",
  serial: "Kode Sertifikat (Serial)",
  qr: "QR Code Verifikasi",
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  name: "Bagas Santoso, S.Kom",
  event: "Webinar Nasional Desain UI/UX 2026",
  date: "12 Juni 2026",
  serial: "SK-2026-0001",
  qr: "[QR Code]",
};

export default function EditorClient({ template }: { template: Template }) {
  const [fields, setFields] = useState<Field[]>(template.fields);
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

  function updateFieldProperty(key: string, property: keyof Field, value: string | number) {
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
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium border text-left transition-all ${
                  selectedKey === f.key
                    ? "bg-brand-50 border-brand-300 text-brand-700 shadow-sm"
                    : "border-ink-100 text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                }`}
              >
                <span>{FIELD_LABELS[f.key] || f.key}</span>
                <span className="text-xxs px-2 py-0.5 rounded-full bg-ink-100 text-ink-500 font-normal">
                  X:{f.x}, Y:{f.y}
                </span>
              </button>
            ))}
          </div>

          {activeField && (
            <div className="border-t border-ink-100 pt-5 space-y-4">
              <h4 className="font-semibold text-ink-900 text-xs uppercase tracking-wider">
                Gaya {FIELD_LABELS[activeField.key]}
              </h4>

              {/* Font Size */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 mb-1.5">
                  <TextT className="w-4 h-4 text-ink-400" />
                  Ukuran Font (px)
                </label>
                <input
                  type="number"
                  min="8"
                  max="120"
                  value={activeField.fontSize || 24}
                  onChange={(e) =>
                    updateFieldProperty(activeField.key, "fontSize", parseInt(e.target.value) || 24)
                  }
                  className="input-field py-1.5 px-3"
                />
              </div>

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
                    className="input-field flex-1 py-1.5 px-3"
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
                  className="input-field py-1.5 px-3"
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
              src={template.fileUrl}
              alt="Template Workspace"
              onLoad={handleImageLoad}
              className="w-full h-auto select-none rounded-xl"
              draggable={false}
            />

            {/* Draggable Text Fields over Template */}
            {imageLoaded &&
              fields.map((field) => {
                const isSelected = selectedKey === field.key;
                
                // Display coordinates calculated from native coordinates
                const displayX = (field.x * dimensions.width) / template.width;
                const displayY = (field.y * dimensions.height) / template.height;

                // Adjust for alignment offsets
                let alignTransform = "translate(-50%, -50%)";
                if (field.align === "left") alignTransform = "translate(0%, -50%)";
                if (field.align === "right") alignTransform = "translate(-100%, -50%)";

                return (
                  <div
                    key={field.key}
                    onMouseDown={(e) => handleMouseDown(e, field.key, field)}
                    className={`absolute cursor-move px-2.5 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap transition-shadow duration-100 select-none ${
                      isSelected
                        ? "bg-brand-500 border-white text-white shadow-glow scale-[1.03] z-20"
                        : "bg-white/90 border-ink-200 text-ink-900 shadow-sm hover:bg-white z-10"
                    }`}
                    style={{
                      left: `${displayX}px`,
                      top: `${displayY}px`,
                      transform: alignTransform,
                      fontSize: `${(field.fontSize || 24) * (dimensions.width / template.width)}px`,
                      color: isSelected ? "#ffffff" : field.color || "#000000",
                      fontWeight: field.fontWeight || "normal",
                    }}
                  >
                    {FIELD_PLACEHOLDERS[field.key] || field.key}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
