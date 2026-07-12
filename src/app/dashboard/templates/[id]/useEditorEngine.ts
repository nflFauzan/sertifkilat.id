"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type ZoomLevel = 50 | 75 | 100 | 125 | 150;
export const ZOOM_PRESETS: ZoomLevel[] = [50, 75, 100, 125, 150];

export interface EditorSettings {
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  snapToGrid: boolean;
  showRulers: boolean;
  showSafeArea: boolean;
  showGuides: boolean;
  gridSize: number;
}

export const DEFAULT_SETTINGS: EditorSettings = {
  zoom: 100,
  panX: 0,
  panY: 0,
  showGrid: false,
  snapToGrid: false,
  showRulers: true,
  showSafeArea: true,
  showGuides: true,
  gridSize: 20,
};

export interface GuideLines {
  vertical: number[];
  horizontal: number[];
}

export function useEditorEngine(canvasWidth: number, canvasHeight: number) {
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS);
  const [guides, setGuides] = useState<GuideLines>({ vertical: [], horizontal: [] });
  const viewportRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const setZoom = useCallback((zoom: number) => {
    setSettings(s => ({ ...s, zoom: Math.max(25, Math.min(300, zoom)) }));
  }, []);

  const zoomIn = useCallback(() => {
    setSettings(s => {
      const next = ZOOM_PRESETS.find(p => p > s.zoom) ?? 150;
      return { ...s, zoom: next };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setSettings(s => {
      const prev = [...ZOOM_PRESETS].reverse().find(p => p < s.zoom) ?? 50;
      return { ...s, zoom: prev };
    });
  }, []);

  const fitWidth = useCallback(() => {
    if (!viewportRef.current) return;
    const vw = viewportRef.current.clientWidth - 80;
    const zoom = Math.floor((vw / canvasWidth) * 100);
    setSettings(s => ({ ...s, zoom: Math.max(25, Math.min(300, zoom)), panX: 0, panY: 0 }));
  }, [canvasWidth]);

  const fitScreen = useCallback(() => {
    if (!viewportRef.current) return;
    const vw = viewportRef.current.clientWidth - 80;
    const vh = viewportRef.current.clientHeight - 80;
    const zoomW = (vw / canvasWidth) * 100;
    const zoomH = (vh / canvasHeight) * 100;
    const zoom = Math.floor(Math.min(zoomW, zoomH));
    setSettings(s => ({ ...s, zoom: Math.max(25, Math.min(300, zoom)), panX: 0, panY: 0 }));
  }, [canvasWidth, canvasHeight]);

  // Ctrl+Wheel zoom
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 10 : -10;
      setSettings(s => ({ ...s, zoom: Math.max(25, Math.min(300, s.zoom + delta)) }));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // Middle-mouse or Space+drag pan
  const startPan = useCallback((e: React.MouseEvent) => {
    isPanningRef.current = true;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: settings.panX,
      panY: settings.panY,
    };
  }, [settings.panX, settings.panY]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setSettings(s => ({
        ...s,
        panX: panStartRef.current.panX + dx,
        panY: panStartRef.current.panY + dy,
      }));
    };
    const onUp = () => {
      isPanningRef.current = false;
      setIsPanning(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const updateSetting = useCallback(<K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => {
    setSettings(s => ({ ...s, [key]: value }));
  }, []);

  const clearGuides = useCallback(() => {
    setGuides({ vertical: [], horizontal: [] });
  }, []);

  const showSmartGuides = useCallback((
    fieldX: number, fieldY: number,
    allFields: Array<{ x: number; y: number }>
  ) => {
    const vLines: number[] = [];
    const hLines: number[] = [];
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;

    if (Math.abs(fieldX - cx) < 8) vLines.push(cx);
    if (Math.abs(fieldY - cy) < 8) hLines.push(cy);

    for (const f of allFields) {
      if (Math.abs(fieldX - f.x) < 8) vLines.push(f.x);
      if (Math.abs(fieldY - f.y) < 8) hLines.push(f.y);
    }
    setGuides({ vertical: vLines, horizontal: hLines });
  }, [canvasWidth, canvasHeight]);

  const snapToGridFn = useCallback((val: number, gridSize: number): number => {
    return Math.round(val / gridSize) * gridSize;
  }, []);

  return {
    settings,
    setZoom,
    zoomIn,
    zoomOut,
    fitWidth,
    fitScreen,
    updateSetting,
    viewportRef,
    isPanning,
    startPan,
    guides,
    showSmartGuides,
    clearGuides,
    snapToGridFn,
  };
}
