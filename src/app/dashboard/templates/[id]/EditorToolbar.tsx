"use client";

import React from "react";
import {
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  ArrowsOut,
  GridFour,
  Ruler,
  Crosshair,
  FrameCorners,
  ArrowCounterClockwise,
  FloppyDisk,
  CircleNotch,
  CaretLeft,
} from "@phosphor-icons/react";
import Link from "next/link";
import { EditorSettings, ZOOM_PRESETS } from "./useEditorEngine";

interface EditorToolbarProps {
  templateName: string;
  templates: Array<{ id: string; name: string }>;
  activeTemplateId: string;
  onTemplateChange: (id: string) => void;
  settings: EditorSettings;
  isPending: boolean;
  saveSuccess: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitWidth: () => void;
  onFitScreen: () => void;
  onSetZoom: (z: number) => void;
  onToggle: (key: keyof EditorSettings) => void;
  onSave: () => void;
  onReset: () => void;
}

export function EditorToolbar({
  templateName,
  templates,
  activeTemplateId,
  onTemplateChange,
  settings,
  isPending,
  saveSuccess,
  onZoomIn,
  onZoomOut,
  onFitWidth,
  onFitScreen,
  onSetZoom,
  onToggle,
  onSave,
  onReset,
}: EditorToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "0 16px",
        height: 52,
        background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        flexShrink: 0,
      }}
    >
      {/* Left: Back + Dropdown Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <Link
          href="/dashboard/templates"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 32, height: 32, borderRadius: 8,
            background: "#f1f5f9", color: "#64748b", flexShrink: 0,
            textDecoration: "none",
          }}
        >
          <CaretLeft size={16} weight="bold" />
        </Link>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>Template</span>
          <select
            value={activeTemplateId}
            onChange={(e) => onTemplateChange(e.target.value)}
            style={{
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              padding: "4px 28px 4px 10px",
              fontSize: 12,
              fontWeight: 700,
              color: "#1e293b",
              cursor: "pointer",
              outline: "none",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
              backgroundSize: "10px",
              minWidth: 160,
              maxWidth: 240,
            }}
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: View Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Zoom controls */}
        <div style={toolGroupStyle}>
          <ToolBtn onClick={onZoomOut} title="Zoom Out (Ctrl+Wheel)">
            <MagnifyingGlassMinus size={14} />
          </ToolBtn>

          <select
            value={ZOOM_PRESETS.includes(settings.zoom as typeof ZOOM_PRESETS[number]) ? settings.zoom : settings.zoom}
            onChange={e => onSetZoom(Number(e.target.value))}
            style={{
              background: "transparent", border: "none", fontSize: 11,
              fontWeight: 600, color: "#334155", cursor: "pointer",
              outline: "none", padding: "0 4px", width: 60, textAlign: "center",
            }}
          >
            {ZOOM_PRESETS.map(z => (
              <option key={z} value={z}>{z}%</option>
            ))}
            {!ZOOM_PRESETS.includes(settings.zoom as typeof ZOOM_PRESETS[number]) && (
              <option value={settings.zoom}>{Math.round(settings.zoom)}%</option>
            )}
          </select>

          <ToolBtn onClick={onZoomIn} title="Zoom In (Ctrl+Wheel)">
            <MagnifyingGlassPlus size={14} />
          </ToolBtn>
        </div>

        <div style={dividerStyle} />

        {/* Fit controls */}
        <div style={toolGroupStyle}>
          <ToolBtn onClick={onFitWidth} title="Fit Width">
            <ArrowsOut size={14} />
          </ToolBtn>
          <ToolBtn onClick={onFitScreen} title="Fit Screen">
            <FrameCorners size={14} />
          </ToolBtn>
        </div>

        <div style={dividerStyle} />

        {/* Toggles */}
        <div style={toolGroupStyle}>
          <ToggleBtn
            active={settings.showRulers}
            onClick={() => onToggle("showRulers")}
            title="Toggle Rulers"
          >
            <Ruler size={14} />
          </ToggleBtn>
          <ToggleBtn
            active={settings.showGrid}
            onClick={() => onToggle("showGrid")}
            title="Toggle Grid"
          >
            <GridFour size={14} />
          </ToggleBtn>
          <ToggleBtn
            active={settings.showGuides}
            onClick={() => onToggle("showGuides")}
            title="Toggle Smart Guides"
          >
            <Crosshair size={14} />
          </ToggleBtn>
          <ToggleBtn
            active={settings.showSafeArea}
            onClick={() => onToggle("showSafeArea")}
            title="Toggle Safe Area"
          >
            <FrameCorners size={14} />
          </ToggleBtn>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={onReset}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
            color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0",
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          <ArrowCounterClockwise size={13} />
          Reset
        </button>
        {saveSuccess && (
          <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>Tersimpan ✓</span>
        )}
        <button
          onClick={onSave}
          disabled={isPending}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700,
            color: "#fff", background: "#2f6fed", border: "none",
            cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {isPending ? <CircleNotch size={13} style={{ animation: "spin 1s linear infinite" }} /> : <FloppyDisk size={13} />}
          Simpan
        </button>
      </div>
    </div>
  );
}

const toolGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  padding: 2,
};

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 24,
  background: "#e2e8f0",
  margin: "0 4px",
};

function ToolBtn({ children, onClick, title }: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 26, height: 26, borderRadius: 6, border: "none",
        background: "transparent", cursor: "pointer", color: "#475569",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "#e2e8f0")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );
}

function ToggleBtn({ children, onClick, title, active }: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  active: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 26, height: 26, borderRadius: 6, border: "none",
        background: active ? "#dbeafe" : "transparent",
        cursor: "pointer",
        color: active ? "#2563eb" : "#94a3b8",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}
