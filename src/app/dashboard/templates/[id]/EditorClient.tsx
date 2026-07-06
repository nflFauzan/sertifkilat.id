"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { Image as ImageIcon } from "@phosphor-icons/react";
import { updateTemplateFieldsAction } from "@/app/actions/templates";
import { useEditorEngine } from "./useEditorEngine";
import { EditorToolbar } from "./EditorToolbar";
import { EditorSidebar } from "./EditorSidebar";
import { Ruler, RULER_SIZE } from "./EditorRulers";
import { SmartGuides, GridOverlay, SafeArea } from "./EditorOverlays";
import { translateCertificateText } from "@/lib/certificateGenerator";
import { useTranslation } from "@/lib/hooks/useTranslation";

type Field = {
  key: string; x: number; y: number;
  fontSize?: number; color?: string; fontWeight?: string;
  align?: string; text?: string; hidden?: boolean;
  width?: number; height?: number; fileUrl?: string;
};

type Template = {
  id: string; name: string; fileUrl: string;
  width: number; height: number; fields: Field[];
};

const FIELD_PLACEHOLDERS: Record<string, string> = {
  ornament:"✦",title:"SERTIFIKAT",subtitle:"DIBERIKAN KEPADA",name:"Bagas Santoso, S.Kom",
  participation:"ATAS PARTISIPASINYA SEBAGAI",event:"Webinar Nasional Desain UI/UX 2026",
  divider:"— — — — — — — — — — — — — — —",date:"12 Juni 2026",location:"Jakarta, Indonesia",
  signer1Name:"NAMA KETUA PANITIA",signer1Title:"Ketua Panitia",
  signer2Name:"NAMA PIMPINAN INSTANSI",signer2Title:"Direktur Instansi",
  serial:"SK-2026-0001",qr:"[QR]",qrText:"SCAN UNTUK VERIFIKASI",logo:"[Logo]",
};

const DEFAULT_FIELDS: Field[] = [
  { key:"ornament",x:561,y:120,fontSize:32,color:"#D4AF37",fontWeight:"normal",align:"center",text:"✦" },
  { key:"title",x:561,y:180,fontSize:48,color:"#0D1B2A",fontWeight:"bold",align:"center",text:"SERTIFIKAT" },
  { key:"subtitle",x:561,y:240,fontSize:18,color:"#D4AF37",fontWeight:"bold",align:"center",text:"DIBERIKAN KEPADA" },
  { key:"name",x:561,y:340,fontSize:44,color:"#0D1B2A",fontWeight:"normal",align:"center",text:"Nama Peserta" },
  { key:"participation",x:561,y:410,fontSize:14,color:"#475569",fontWeight:"normal",align:"center",text:"ATAS PARTISIPASINYA SEBAGAI" },
  { key:"event",x:561,y:460,fontSize:24,color:"#0D1B2A",fontWeight:"bold",align:"center",text:"Webinar Nasional Desain UI/UX 2026" },
  { key:"divider",x:561,y:505,fontSize:16,color:"#D4AF37",fontWeight:"normal",align:"center",text:"— — — — — — — — — — — — — — —" },
  { key:"date",x:480,y:540,fontSize:14,color:"#475569",fontWeight:"normal",align:"right",text:"12 Juni 2026" },
  { key:"location",x:640,y:540,fontSize:14,color:"#475569",fontWeight:"normal",align:"left",text:"Jakarta, Indonesia" },
  { key:"qr",x:180,y:645,fontSize:80,color:"#000000",fontWeight:"normal",align:"center" },
  { key:"qrText",x:180,y:705,fontSize:10,color:"#64748b",fontWeight:"normal",align:"center",text:"SCAN UNTUK VERIFIKASI" },
  { key:"signer1Name",x:450,y:670,fontSize:16,color:"#0D1B2A",fontWeight:"bold",align:"center",text:"NAMA KETUA PANITIA" },
  { key:"signer1Title",x:450,y:695,fontSize:14,color:"#475569",fontWeight:"normal",align:"center",text:"Jabatan" },
  { key:"signer2Name",x:750,y:670,fontSize:16,color:"#0D1B2A",fontWeight:"bold",align:"center",text:"NAMA PIMPINAN INSTANSI" },
  { key:"signer2Title",x:750,y:695,fontSize:14,color:"#475569",fontWeight:"normal",align:"center",text:"Jabatan" },
  { key:"serial",x:1020,y:730,fontSize:12,color:"#64748b",fontWeight:"normal",align:"right",text:"SK-2026-0001" },
  { key:"logo",x:970,y:120,width:80,height:80,fileUrl:"",hidden:false },
];

export default function EditorClient({ template, templates = [] }: { template: Template; templates?: Template[] }) {
  const { lang } = useTranslation();
  const [currentTemplate, setCurrentTemplate] = useState<Template>(template);
  const [fields, setFields] = useState<Field[]>(() => {
    const loaded = template.fields || [];
    return DEFAULT_FIELDS.map(def => {
      const ex = loaded.find(f => f.key === def.key);
      return ex ? { ...def, ...ex } : def;
    });
  });
  const [selectedKey, setSelectedKey] = useState("name");
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const viewportInnerRef = useRef<HTMLDivElement>(null);

  // Reset imageLoaded when template background changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentTemplate.fileUrl]);

  // Viewport size tracking
  const [vpSize, setVpSize] = useState({ w: 900, h: 600 });

  const engine = useEditorEngine(currentTemplate.width, currentTemplate.height);
  const { settings, viewportRef, isPanning, startPan, guides, showSmartGuides, clearGuides, snapToGridFn } = engine;

  const scale = settings.zoom / 100;
  const canvasW = currentTemplate.width * scale;
  const canvasH = currentTemplate.height * scale;

  // Track viewport size
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      setVpSize({ w: el.clientWidth, h: el.clientHeight });
    });
    obs.observe(el);
    setVpSize({ w: el.clientWidth, h: el.clientHeight });
    return () => obs.disconnect();
  }, [viewportRef]);

  // Fit screen on first image load
  useEffect(() => {
    if (imageLoaded) engine.fitScreen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageLoaded]);

  // Prevent page scroll in editor
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const prevent = (e: WheelEvent) => { if (!e.ctrlKey) e.preventDefault(); };
    el.addEventListener("wheel", prevent, { passive: false });
    return () => el.removeEventListener("wheel", prevent);
  }, [viewportRef]);

  // Drag fields
  const dragRef = useRef<{
    fieldKey: string; startX: number; startY: number;
    startFX: number; startFY: number;
  } | null>(null);

  const handleFieldMouseDown = useCallback((e: React.MouseEvent, fieldKey: string, field: Field) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedKey(fieldKey);
    dragRef.current = {
      fieldKey,
      startX: e.clientX,
      startY: e.clientY,
      startFX: field.x,
      startFY: field.y,
    };
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = (e.clientX - dragRef.current.startX) / scale;
      const dy = (e.clientY - dragRef.current.startY) / scale;
      let nx = dragRef.current.startFX + dx;
      let ny = dragRef.current.startFY + dy;

      if (settings.snapToGrid) {
        nx = snapToGridFn(nx, settings.gridSize);
        ny = snapToGridFn(ny, settings.gridSize);
      }

      nx = Math.max(0, Math.min(currentTemplate.width, nx));
      ny = Math.max(0, Math.min(currentTemplate.height, ny));

      if (settings.showGuides) {
        const others = fields.filter(f => f.key !== dragRef.current?.fieldKey);
        showSmartGuides(nx, ny, others);
      }

      setFields(prev => prev.map(f =>
        f.key === dragRef.current?.fieldKey ? { ...f, x: Math.round(nx), y: Math.round(ny) } : f
      ));
    };
    const onUp = () => {
      dragRef.current = null;
      clearGuides();
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [scale, fields, settings.snapToGrid, settings.gridSize, settings.showGuides, showSmartGuides, clearGuides, snapToGridFn, currentTemplate.width, currentTemplate.height]);

  // Space+drag for panning
  const spaceRef = useRef(false);
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => { if (e.code === "Space") { spaceRef.current = true; e.preventDefault(); } };
    const onUp = (e: KeyboardEvent) => { if (e.code === "Space") spaceRef.current = false; };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, []);

  const handleViewportMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || spaceRef.current) {
      e.preventDefault();
      startPan(e);
    }
  }, [startPan]);

  function updateField(key: string, prop: keyof Field, val: unknown) {
    setFields(prev => prev.map(f => f.key === key ? { ...f, [prop]: val } : f));
  }

  const handleTemplateChange = useCallback((newId: string) => {
    const target = templates.find(t => t.id === newId);
    if (!target) return;

    setCurrentTemplate(target);

    // Merge layout fields of the target template, fallback to current edits
    const newLoaded = target.fields || [];
    setFields(prev => {
      return prev.map(currentField => {
        const targetField = newLoaded.find(f => f.key === currentField.key);
        return targetField ? { ...currentField, ...targetField } : currentField;
      });
    });

    // Update URL via pushState to reflect active template
    window.history.pushState(null, "", `/dashboard/templates/${target.id}`);
  }, [templates]);

  function handleSave() {
    startTransition(async () => {
      const res = await updateTemplateFieldsAction(currentTemplate.id, fields);
      if (res.error) alert(res.error);
      else { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }
    });
  }

  function handleReset() {
    if (confirm("Reset semua elemen ke posisi bawaan?")) setFields(DEFAULT_FIELDS);
  }

  // Canvas position: centered in viewport
  const canvasLeft = settings.panX + (vpSize.w - canvasW) / 2;
  const canvasTop = settings.panY + (vpSize.h - canvasH) / 2;

  const rulerSize = settings.showRulers ? RULER_SIZE : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f1f5f9", overflow: "hidden" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Toolbar */}
      <EditorToolbar
        templateName={currentTemplate.name}
        templates={templates}
        activeTemplateId={currentTemplate.id}
        onTemplateChange={handleTemplateChange}
        settings={settings}
        isPending={isPending}
        saveSuccess={saveSuccess}
        onZoomIn={engine.zoomIn}
        onZoomOut={engine.zoomOut}
        onFitWidth={engine.fitWidth}
        onFitScreen={engine.fitScreen}
        onSetZoom={engine.setZoom}
        onToggle={(key) => engine.updateSetting(key, !settings[key] as never)}
        onSave={handleSave}
        onReset={handleReset}
      />

      {/* Editor body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Viewport */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

          {/* Top ruler + corner */}
          {settings.showRulers && (
            <div style={{ display: "flex", flexShrink: 0 }}>
              <div style={{ width: rulerSize, height: rulerSize, background: "#f8fafc", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }} />
              <Ruler
                zoom={settings.zoom}
                pan={canvasLeft}
                length={vpSize.w - rulerSize}
                canvasSize={currentTemplate.width}
                orientation="horizontal"
              />
            </div>
          )}

          {/* Canvas row */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {settings.showRulers && (
              <Ruler
                zoom={settings.zoom}
                pan={canvasTop}
                length={vpSize.h - rulerSize}
                canvasSize={currentTemplate.height}
                orientation="vertical"
              />
            )}

            {/* Scrollable canvas viewport */}
            <div
              ref={viewportRef}
              onMouseDown={handleViewportMouseDown}
              style={{
                flex: 1,
                position: "relative",
                overflow: "hidden",
                background: "repeating-conic-gradient(#e2e8f0 0% 25%, #f8fafc 0% 50%) 0 0 / 20px 20px",
                cursor: isPanning ? "grabbing" : spaceRef.current ? "grab" : "default",
                userSelect: "none",
              }}
            >
              {/* Canvas positioned absolutely */}
              <div
                ref={viewportInnerRef}
                style={{
                  position: "absolute",
                  left: canvasLeft,
                  top: canvasTop,
                  width: canvasW,
                  height: canvasH,
                  boxShadow: "0 4px 40px rgba(0,0,0,0.18)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                {/* Template image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={currentTemplate.fileUrl || "/templates/elegan-navy-gold.svg"}
                  alt="Template"
                  onLoad={() => setImageLoaded(true)}
                  draggable={false}
                  style={{ width: "100%", height: "100%", display: "block", objectFit: "fill", userSelect: "none" }}
                />

                {/* Grid */}
                {settings.showGrid && (
                  <GridOverlay gridSize={settings.gridSize} zoom={settings.zoom} canvasW={currentTemplate.width} canvasH={currentTemplate.height} />
                )}

                {/* Safe area */}
                {settings.showSafeArea && (
                  <SafeArea zoom={settings.zoom} canvasW={currentTemplate.width} canvasH={currentTemplate.height} />
                )}

                {/* Smart guides */}
                {settings.showGuides && (
                  <SmartGuides guides={guides} zoom={settings.zoom} panX={0} panY={0} canvasW={currentTemplate.width} canvasH={currentTemplate.height} />
                )}

                {/* Fields */}
                {imageLoaded && fields.map(field => {
                  const isSelected = selectedKey === field.key;
                  if (field.hidden && !isSelected) return null;

                  const fx = field.x * scale;
                  const fy = field.y * scale;

                  if (field.key === "logo") {
                    const lw = (field.width ?? 80) * scale;
                    const lh = (field.height ?? 80) * scale;
                    return (
                      <div key={field.key} onMouseDown={e => handleFieldMouseDown(e, field.key, field)}
                        style={{
                          position: "absolute", left: fx, top: fy,
                          width: lw, height: lh,
                          border: `2px ${isSelected ? "solid #2f6fed" : "dashed #94a3b8"}`,
                          borderRadius: 6, overflow: "hidden",
                          background: "rgba(255,255,255,0.8)",
                          cursor: "move", zIndex: isSelected ? 20 : 10,
                          boxShadow: isSelected ? "0 0 0 3px rgba(47,111,237,0.25)" : "none",
                          transform: "translate(-50%,-50%)",
                        }}>
                        {field.fileUrl
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={field.fileUrl} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} draggable={false} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                              <ImageIcon size={20} />
                              <span style={{ fontSize: 8 }}>LOGO</span>
                            </div>
                        }
                      </div>
                    );
                  }

                  if (field.key === "qr") {
                    const sz = (field.fontSize ?? 80) * scale;
                    return (
                      <div key={field.key} onMouseDown={e => handleFieldMouseDown(e, field.key, field)}
                        style={{
                          position: "absolute", left: fx, top: fy,
                          width: sz, height: sz,
                          border: `2px dashed ${isSelected ? "#2f6fed" : "#64748b"}`,
                          background: "rgba(255,255,255,0.8)",
                          cursor: "move", zIndex: isSelected ? 20 : 10,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexDirection: "column",
                          boxShadow: isSelected ? "0 0 0 3px rgba(47,111,237,0.25)" : "none",
                          transform: "translate(-50%,-50%)",
                        }}>
                        <div style={{ width: 16, height: 16, border: "1.5px solid #475569", borderStyle: "dashed" }} />
                        <span style={{ fontSize: 7, fontWeight: 700, color: "#475569", marginTop: 3, letterSpacing: 0.5 }}>QR CODE</span>
                      </div>
                    );
                  }

                  let text = field.text ?? (FIELD_PLACEHOLDERS[field.key] ?? field.key);
                  text = translateCertificateText(text);
                  const fs = (field.fontSize ?? 14) * scale;
                  let transform = "translate(-50%,-50%)";
                  if (field.align === "left") transform = "translate(0,-50%)";
                  if (field.align === "right") transform = "translate(-100%,-50%)";

                  return (
                    <div key={field.key} onMouseDown={e => handleFieldMouseDown(e, field.key, field)}
                      style={{
                        position: "absolute", left: fx, top: fy,
                        transform,
                        padding: "3px 6px",
                        borderRadius: 4,
                        border: `1.5px ${isSelected ? "solid #2f6fed" : "solid transparent"}`,
                        background: isSelected ? "rgba(47,111,237,0.12)" : "transparent",
                        cursor: "move", zIndex: isSelected ? 20 : 10,
                        fontSize: fs,
                        color: field.color ?? "#000",
                        fontWeight: field.fontWeight ?? "normal",
                        textAlign: (field.align as "left" | "center" | "right") ?? "center",
                        whiteSpace: "nowrap",
                        opacity: field.hidden ? 0.4 : 1,
                        boxShadow: isSelected ? "0 0 0 3px rgba(47,111,237,0.2)" : "none",
                        userSelect: "none",
                        fontFamily: field.key === "name"
                          ? "var(--font-alex-brush), Alex Brush, cursive"
                          : "var(--font-plus-jakarta), Inter, sans-serif",
                      }}>
                      {text}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <EditorSidebar
          fields={fields}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
          onUpdate={updateField}
        />
      </div>
    </div>
  );
}
