"use client";

import { useState } from "react";
import { X, MagnifyingGlassPlus, MagnifyingGlassMinus, CornersOut } from "@phosphor-icons/react";
import Image from "next/image";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface Props {
  template: { name: string; fileUrl: string } | null;
  onClose: () => void;
}

export function PreviewModal({ template, onClose }: Props) {
  const [zoom, setZoom] = useState(100);
  const { lang } = useTranslation();
  if (!template) return null;

  const handleFitScreen = () => {
    setZoom(100);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(11, 18, 32, 0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fadeIn 0.25s ease-out forwards",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 24,
          overflow: "hidden",
          width: "min(92vw, 1000px)",
          height: "min(85vh, 680px)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid #f1f5f9",
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{template.name}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, fontWeight: 500 }}>
              {lang === "id" ? "Pratinjau Sertifikat — Mode Lihat Saja" : "Certificate Preview — Read Only Mode"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setZoom(z => Math.max(30, z - 15))}
              style={iconBtnStyle}
              title={lang === "id" ? "Perkecil" : "Zoom Out"}
            >
              <MagnifyingGlassMinus size={16} />
            </button>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#334155", minWidth: 46, textAlign: "center" }}>
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(z => Math.min(250, z + 15))}
              style={iconBtnStyle}
              title={lang === "id" ? "Perbesar" : "Zoom In"}
            >
              <MagnifyingGlassPlus size={16} />
            </button>
            <button
              onClick={handleFitScreen}
              style={iconBtnStyle}
              title={lang === "id" ? "Sesuaikan Layar" : "Fit Screen"}
            >
              <CornersOut size={16} />
            </button>
            <div style={{ width: 1, height: 24, background: "#e2e8f0", margin: "0 6px" }} />
            <button onClick={onClose} style={closeBtnStyle} title={lang === "id" ? "Tutup" : "Close"}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div style={{
          flex: 1,
          overflow: "auto",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}>
          <div style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center center",
            transition: "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}>
            <div style={{
              width: 780,
              aspectRatio: "1122/794",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.05)",
              borderRadius: 12,
              overflow: "hidden",
              background: "#fff",
              border: "1px solid #e2e8f0",
            }}>
              <Image
                src={template.fileUrl}
                alt={template.name}
                fill
                style={{ objectFit: "fill" }}
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  background: "#fff",
  cursor: "pointer",
  color: "#475569",
  transition: "all 0.15s",
};

const closeBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: 8,
  border: "none",
  background: "#fee2e2",
  cursor: "pointer",
  color: "#ef4444",
  transition: "all 0.15s",
};
