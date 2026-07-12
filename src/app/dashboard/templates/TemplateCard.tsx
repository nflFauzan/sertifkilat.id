"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Sliders, Trash, Eye, CheckCircle, Star, Lock, Heart,
} from "@phosphor-icons/react";
import { useTranslation } from "@/lib/hooks/useTranslation";

export type TemplateItem = {
  id: string;
  name: string;
  fileUrl: string;
  width?: number;
  height?: number;
  eventId: string | null;
  createdAt: Date;
  event: { name: string } | null;
};

const TEMPLATE_META: Record<string, { desc: { id: string; en: string }; category: { id: string; en: string }; usage: { id: string; en: string }; badge: "free" | "premium" | "custom" }> = {
  sertifikat1: { 
    desc: { id: "Desain elegan navy & gold klasik.", en: "Classic navy & gold elegant design." }, 
    category: { id: "Formal", en: "Formal" }, 
    usage: { id: "Seminar, Konferensi, Workshop", en: "Seminar, Conference, Workshop" }, 
    badge: "free" 
  },
  sertifikat2: { 
    desc: { id: "Desain modern appreciation maroon.", en: "Modern maroon appreciation design." }, 
    category: { id: "Formal", en: "Formal" }, 
    usage: { id: "Apresiasi, Penghargaan, Lomba", en: "Appreciation, Awards, Competition" }, 
    badge: "free" 
  },
  "elegan-navy-gold": { 
    desc: { id: "Minimalis navy gold premium.", en: "Minimalist navy gold premium." }, 
    category: { id: "Premium", en: "Premium" }, 
    usage: { id: "Konferensi Formal, Wisuda", en: "Formal Conference, Graduation" }, 
    badge: "premium" 
  },
  "luxury-achievement": { 
    desc: { id: "Desain mewah pencapaian profesional.", en: "Luxury professional achievement design." }, 
    category: { id: "Premium", en: "Premium" }, 
    usage: { id: "Penghargaan VIP, Sertifikasi", en: "VIP Awards, Certification" }, 
    badge: "premium" 
  },
  "elegant-gold": { 
    desc: { id: "Perpaduan emas dan gelap premium.", en: "Premium gold & dark fusion." }, 
    category: { id: "Premium", en: "Premium" }, 
    usage: { id: "Event Eksklusif, Gala", en: "Exclusive Event, Gala" }, 
    badge: "premium" 
  },
  "modern-appreciation": { 
    desc: { id: "Desain modern minimalis bersih.", en: "Clean minimalist modern design." }, 
    category: { id: "Modern", en: "Modern" }, 
    usage: { id: "Workshop, Training, Kursus", en: "Workshop, Training, Course" }, 
    badge: "premium" 
  },
};

export function getMeta(fileUrl: string) {
  const key = Object.keys(TEMPLATE_META).find(k => fileUrl.includes(k));
  return key ? TEMPLATE_META[key] : { 
    desc: { id: "Desain sertifikat kustom Anda.", en: "Your custom certificate design." }, 
    category: { id: "Kustom", en: "Custom" }, 
    usage: { id: "Bebas", en: "General" }, 
    badge: "custom" as const 
  };
}

const BADGE_STYLES: Record<string, React.CSSProperties> = {
  free: { background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" },
  premium: { background: "#fefce8", color: "#b45309", border: "1px solid #fde68a" },
  custom: { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" },
};

interface Props {
  template: TemplateItem;
  isSelected: boolean;
  isActive: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPreview: (t: TemplateItem) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
  userPlan?: string;
  onUpgradeRequired?: () => void;
}

export function TemplateCard({
  template,
  isSelected,
  isActive,
  isFavorite,
  onToggleFavorite,
  onPreview,
  onDelete,
  isPending,
  userPlan = "FREE",
  onUpgradeRequired,
}: Props) {
  const { lang } = useTranslation();
  const meta = getMeta(template.fileUrl);

  const localizedDesc = lang === "id" ? meta.desc.id : meta.desc.en;
  const localizedCategory = lang === "id" ? meta.category.id : meta.category.en;
  const localizedUsage = lang === "id" ? meta.usage.id : meta.usage.en;

  const badgeText = meta.badge === "free" 
    ? (lang === "id" ? "Gratis" : "Free") 
    : meta.badge === "premium" 
    ? "Premium" 
    : (lang === "id" ? "Kustom" : "Custom");

  return (
    <div style={{
      background: "var(--bg-card)",
      borderRadius: 16,
      border: `2px solid ${isActive ? "#2563eb" : isSelected ? "#3b82f6" : "var(--ink-150)"}`,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "pointer",
      boxShadow: isActive
        ? "0 0 0 4px rgba(37,99,235,0.15), 0 0 20px rgba(37,99,235,0.3)"
        : isSelected
        ? "0 0 0 4px rgba(59,130,246,0.15), 0 8px 32px rgba(59,130,246,0.12)"
        : "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
      position: "relative",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px) scale(1.02)";
        if (!isActive) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.04)";
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0) scale(1)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = isActive
          ? "0 0 0 4px rgba(37,99,235,0.15), 0 0 20px rgba(37,99,235,0.3)"
          : isSelected
          ? "0 0 0 4px rgba(59,130,246,0.15), 0 8px 32px rgba(59,130,246,0.12)"
          : "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)";
      }}
    >
      {/* Preview image */}
      <div style={{ position: "relative", aspectRatio: "1122/794", background: "var(--ink-50)", overflow: "hidden" }}>
        <Image
          src={template.fileUrl}
          alt={template.name}
          fill
          loading="lazy"
          style={{ objectFit: "contain", padding: 8 }}
        />

        {/* Free / Premium Badge top-left */}
        <div style={{
          position: "absolute", top: 10, left: 10, zIndex: 5,
          padding: "3px 9px", borderRadius: 6, fontSize: 10, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: 0.5,
          ...BADGE_STYLES[meta.badge],
        }}>
          {badgeText}
        </div>

        {/* Active badge on top-right */}
        {isActive && (
          <div style={{
            position: "absolute", top: 10, right: 10, zIndex: 5,
            background: "#2563eb", color: "#fff", borderRadius: 20,
            padding: "4px 12px", fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", gap: 4,
            boxShadow: "0 2px 10px rgba(37,99,235,0.3)",
          }}>
            <CheckCircle size={12} weight="fill" />
            {lang === "id" ? "✓ Aktif Sekarang" : "✓ Currently Active"}
          </div>
        )}

        {/* Hover overlay with Preview Button */}
        <div className="card-hover-overlay" style={{
          position: "absolute", inset: 0, background: "rgba(11,18,32,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0, transition: "opacity 0.2s ease", zIndex: 6,
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(template); }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 18px", borderRadius: 10,
              background: "rgba(255,255,255,0.95)", color: "#1e293b",
              border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Eye size={14} /> {lang === "id" ? "Preview" : "Preview"}
          </button>
        </div>

        {/* Favorite Heart Button bottom-left */}
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleFavorite(template.id);
          }}
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            zIndex: 10,
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "var(--bg-card)",
            border: "1px solid var(--ink-200)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: isFavorite ? "#ef4444" : "#64748b",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.95)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <Heart size={15} weight={isFavorite ? "fill" : "regular"} />
        </button>

        {/* Delete btn overlay (only on custom templates) */}
        {meta.badge === "custom" && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(template.id); }}
            disabled={isPending}
            title={lang === "id" ? "Hapus Template" : "Delete Template"}
            style={{
              position: "absolute", bottom: 10, right: 10, zIndex: 10,
              width: 30, height: 30, borderRadius: 8,
              background: "var(--bg-card)", border: "1px solid var(--ink-200)",
              cursor: "pointer", color: "#ef4444",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: 0, transition: "opacity 0.2s",
            }}
            className="delete-btn"
          >
            <Trash size={13} />
          </button>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-900)" }}>{template.name}</div>
          <div style={{ fontSize: 11, color: "var(--ink-500)", marginTop: 3 }}>{localizedDesc}</div>
        </div>

        {/* Meta badges (Category, Dimensions, SVG format) */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center" }}>
          <span style={tagStyle}>{localizedCategory}</span>
          <span style={tagStyle}>SVG</span>
          <span style={tagStyle}>
            {template.width && template.height ? `${template.width}x${template.height}px` : "1122x794px"}
          </span>
          {template.event && (
            <span style={{ ...tagStyle, background: "#eff6ff", color: "#3b82f6", border: "1px solid #bfdbfe" }}>
              {template.event.name}
            </span>
          )}
        </div>

        <div style={{ fontSize: 10, color: "var(--ink-400)", display: "flex", alignItems: "center", gap: 4 }}>
          <Star size={10} />
          {localizedUsage}
        </div>

        {/* Actions */}
        <div style={{ marginTop: 4, display: "flex", gap: 8 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(template); }}
            style={{
              flex: 0, padding: "7px 12px", borderRadius: 9, border: "1px solid var(--ink-200)",
              background: "var(--ink-50)", fontSize: 11, fontWeight: 600, cursor: "pointer",
              color: "var(--ink-700)", display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <Eye size={13} /> {lang === "id" ? "Preview" : "Preview"}
          </button>
          <Link
            href={userPlan === "FREE" && meta.badge === "premium" ? "#" : `/dashboard/templates/${template.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (userPlan === "FREE" && meta.badge === "premium") {
                e.preventDefault();
                onUpgradeRequired?.();
                return;
              }
              localStorage.setItem("activeTemplateId", template.id);
            }}
            style={{
              flex: 1, padding: "7px 12px", borderRadius: 9, border: "none",
              background: "#2563eb", fontSize: 11, fontWeight: 700, cursor: "pointer",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              textDecoration: "none",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#1d4ed8")}
            onMouseLeave={e => (e.currentTarget.style.background = "#2563eb")}
          >
            <Sliders size={13} /> {lang === "id" ? "Gunakan" : "Use"}
          </Link>
        </div>
      </div>

      <style>{`
        .delete-btn { opacity: 0 !important; }
        div:hover > div > .delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}

const tagStyle: React.CSSProperties = {
  display: "inline-block", padding: "2px 8px", borderRadius: 20,
  fontSize: 10, fontWeight: 600, background: "var(--ink-100)",
  color: "var(--ink-700)", border: "1px solid var(--ink-200)",
};

export function PremiumCard() {
  const { lang } = useTranslation();
  return (
    <div style={{
      background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)",
      borderRadius: 16, border: "2px dashed rgba(139,92,246,0.4)",
      overflow: "hidden", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", minHeight: 240,
      padding: 24, textAlign: "center", gap: 12,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Lock size={20} color="#a78bfa" />
      </div>
      <div style={{ color: "#c4b5fd", fontSize: 13, fontWeight: 700 }}>Premium Templates</div>
      <div style={{ color: "#c4b5fd", opacity: 0.7, fontSize: 11 }}>
        {lang === "id" ? "Upgrade untuk akses lebih banyak desain eksklusif" : "Upgrade to access more exclusive designs"}
      </div>
      <div style={{
        padding: "6px 16px", borderRadius: 8, background: "rgba(139,92,246,0.2)",
        color: "#c4b5fd", fontSize: 10, fontWeight: 700,
        border: "1px solid rgba(139,92,246,0.3)",
      }}>
        Coming Soon
      </div>
    </div>
  );
}
