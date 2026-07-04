"use client";

import {
  TextT, Palette, TextAa, TextAlignCenter, TextAlignLeft,
  TextAlignRight, Image as ImageIcon,
} from "@phosphor-icons/react";

type Field = {
  key: string; x: number; y: number;
  fontSize?: number; color?: string; fontWeight?: string;
  align?: string; text?: string; hidden?: boolean;
  width?: number; height?: number; fileUrl?: string;
};

const LABELS: Record<string, string> = {
  ornament:"Ornamen",title:"Judul",subtitle:"Sub Judul",name:"Nama Peserta",
  participation:"Teks Partisipasi",event:"Event",divider:"Garis",date:"Tanggal",
  location:"Lokasi",signer1Name:"Ketua Panitia",signer1Title:"Jabatan Ketua",
  signer2Name:"Pimpinan Instansi",signer2Title:"Jabatan Pimpinan",
  serial:"Kode Serial",qr:"Area QR",qrText:"Teks QR",logo:"Logo",
};

const PLACEHOLDERS: Record<string, string> = {
  title:"SERTIFIKAT",name:"Bagas Santoso, S.Kom",event:"Webinar Nasional",
  date:"12 Juni 2026",location:"Jakarta, Indonesia",serial:"SK-2026-0001",
  qrText:"SCAN UNTUK VERIFIKASI",
};

interface Props {
  fields: Field[];
  selectedKey: string;
  onSelect: (k: string) => void;
  onUpdate: (key: string, prop: keyof Field, val: unknown) => void;
}

export function EditorSidebar({ fields, selectedKey, onSelect, onUpdate }: Props) {
  const active = fields.find(f => f.key === selectedKey) || fields[0];

  return (
    <div style={{
      width: 260, flexShrink: 0, background: "#fff", borderLeft: "1px solid #e2e8f0",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Element list */}
      <div style={{ padding: "10px 10px 6px", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
          Elemen Template
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 220, overflowY: "auto" }}>
          {fields.map(f => (
            <button key={f.key} onClick={() => onSelect(f.key)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "5px 8px", borderRadius: 6, border: "none", textAlign: "left",
              background: selectedKey === f.key ? "#eff6ff" : "transparent",
              color: selectedKey === f.key ? "#1d4ed8" : "#475569",
              fontWeight: selectedKey === f.key ? 600 : 400,
              fontSize: 11, cursor: "pointer", opacity: f.hidden ? 0.5 : 1,
            }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {LABELS[f.key] || f.key}
              </span>
              <span style={{ fontSize: 9, color: "#94a3b8", flexShrink: 0, marginLeft: 4 }}>
                {f.x},{f.y}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Properties */}
      {active && (
        <div style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>
            Properti — {LABELS[active.key]}
          </div>

          {/* Visible toggle */}
          <Row label="Tampilkan">
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={!active.hidden}
                onChange={e => onUpdate(active.key, "hidden", !e.target.checked)}
                style={{ accentColor: "#2f6fed", width: 14, height: 14 }} />
              <span style={{ fontSize: 11, color: "#475569" }}>{active.hidden ? "Tersembunyi" : "Terlihat"}</span>
            </label>
          </Row>

          {/* Position */}
          <Row label="Posisi (X, Y)">
            <div style={{ display: "flex", gap: 4 }}>
              <NumInput value={active.x} min={0} max={2000}
                onChange={v => onUpdate(active.key, "x", v)} />
              <NumInput value={active.y} min={0} max={2000}
                onChange={v => onUpdate(active.key, "y", v)} />
            </div>
          </Row>

          {/* Text content */}
          {active.key !== "qr" && active.key !== "logo" && (
            <Row label={<><TextT size={11} /> Teks</>}>
              <input
                type="text"
                value={active.text ?? PLACEHOLDERS[active.key] ?? ""}
                onChange={e => onUpdate(active.key, "text", e.target.value)}
                style={inputStyle}
              />
            </Row>
          )}

          {/* Font size */}
          {active.key !== "logo" && (
            <Row label={<><TextT size={11} /> {active.key === "qr" ? "Ukuran QR" : "Ukuran Font"}</>}>
              <NumInput value={active.fontSize ?? 24} min={8} max={150}
                onChange={v => onUpdate(active.key, "fontSize", v)} />
            </Row>
          )}

          {/* Logo size */}
          {active.key === "logo" && (
            <Row label={<><ImageIcon size={11} /> Ukuran Logo</>}>
              <div style={{ display: "flex", gap: 4 }}>
                <NumInput value={active.width ?? 80} min={10} max={400}
                  onChange={v => onUpdate(active.key, "width", v)} />
                <NumInput value={active.height ?? 80} min={10} max={400}
                  onChange={v => onUpdate(active.key, "height", v)} />
              </div>
            </Row>
          )}

          {/* Logo upload */}
          {active.key === "logo" && (
            <Row label="Upload Logo">
              <input type="file" accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => onUpdate(active.key, "fileUrl", ev.target?.result as string);
                  reader.readAsDataURL(file);
                }}
                style={{ fontSize: 10, color: "#475569" }}
              />
            </Row>
          )}

          {/* Color */}
          {active.key !== "qr" && active.key !== "logo" && (
            <Row label={<><Palette size={11} /> Warna</>}>
              <div style={{ display: "flex", gap: 4 }}>
                <input type="color" value={active.color ?? "#000000"}
                  onChange={e => onUpdate(active.key, "color", e.target.value)}
                  style={{ width: 32, height: 28, borderRadius: 6, border: "1px solid #e2e8f0", cursor: "pointer", padding: 2 }} />
                <input type="text" value={active.color ?? "#000000"}
                  onChange={e => onUpdate(active.key, "color", e.target.value)}
                  style={{ ...inputStyle, flex: 1 }} />
              </div>
            </Row>
          )}

          {/* Font weight */}
          {active.key !== "qr" && active.key !== "logo" && (
            <Row label={<><TextAa size={11} /> Ketebalan</>}>
              <select value={active.fontWeight ?? "normal"}
                onChange={e => onUpdate(active.key, "fontWeight", e.target.value)}
                style={inputStyle}>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Bold</option>
              </select>
            </Row>
          )}

          {/* Alignment */}
          {active.key !== "qr" && active.key !== "logo" && (
            <Row label={<><TextAlignCenter size={11} /> Alignment</>}>
              <div style={{ display: "flex", gap: 3 }}>
                {[
                  { val: "left", icon: <TextAlignLeft size={13} /> },
                  { val: "center", icon: <TextAlignCenter size={13} /> },
                  { val: "right", icon: <TextAlignRight size={13} /> },
                ].map(opt => (
                  <button key={opt.val} onClick={() => onUpdate(active.key, "align", opt.val)}
                    style={{
                      flex: 1, padding: "5px 0", borderRadius: 6, border: "1px solid",
                      borderColor: (active.align ?? "center") === opt.val ? "#2f6fed" : "#e2e8f0",
                      background: (active.align ?? "center") === opt.val ? "#eff6ff" : "#f8fafc",
                      color: (active.align ?? "center") === opt.val ? "#2f6fed" : "#94a3b8",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                    {opt.icon}
                  </button>
                ))}
              </div>
            </Row>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function NumInput({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <input type="number" min={min} max={max} value={value}
      onChange={e => onChange(parseInt(e.target.value) || 0)}
      style={{ ...inputStyle, width: 64 }} />
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "4px 8px", borderRadius: 6,
  border: "1px solid #e2e8f0", fontSize: 11, color: "#334155",
  background: "#f8fafc", outline: "none",
};
