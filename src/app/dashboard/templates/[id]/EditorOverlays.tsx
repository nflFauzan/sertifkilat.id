"use client";

import React from "react";
import { GuideLines } from "./useEditorEngine";

interface SmartGuidesProps {
  guides: GuideLines;
  zoom: number;
  panX: number;
  panY: number;
  canvasW: number;
  canvasH: number;
}

interface GridProps {
  gridSize: number;
  zoom: number;
  canvasW: number;
  canvasH: number;
}

interface SafeAreaProps {
  zoom: number;
  canvasW: number;
  canvasH: number;
  margin?: number;
}

export function SmartGuides({ guides, zoom, panX, panY, canvasW, canvasH }: SmartGuidesProps) {
  const scale = zoom / 100;

  if (!guides.vertical.length && !guides.horizontal.length) return null;

  const cw = canvasW * scale;
  const ch = canvasH * scale;

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
        zIndex: 30,
      }}
    >
      {guides.vertical.map((x, i) => {
        const px = x * scale + panX;
        return (
          <line
            key={`v${i}`}
            x1={px} y1={-9999} x2={px} y2={9999}
            stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 2" opacity={0.8}
          />
        );
      })}
      {guides.horizontal.map((y, i) => {
        const py = y * scale + panY;
        return (
          <line
            key={`h${i}`}
            x1={-9999} y1={py} x2={9999} y2={py}
            stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 2" opacity={0.8}
          />
        );
      })}
      {/* Center crosshair */}
      <line
        x1={canvasW / 2 * scale + panX} y1={panY}
        x2={canvasW / 2 * scale + panX} y2={ch + panY}
        stroke="#3b82f6" strokeWidth={0.5} opacity={0.3}
      />
      <line
        x1={panX} y1={canvasH / 2 * scale + panY}
        x2={cw + panX} y2={canvasH / 2 * scale + panY}
        stroke="#3b82f6" strokeWidth={0.5} opacity={0.3}
      />
    </svg>
  );
}

export function GridOverlay({ gridSize, zoom, canvasW, canvasH }: GridProps) {
  const scale = zoom / 100;
  const scaledGrid = gridSize * scale;
  const cw = canvasW * scale;
  const ch = canvasH * scale;

  const vLines: React.ReactNode[] = [];
  const hLines: React.ReactNode[] = [];

  for (let x = 0; x <= cw; x += scaledGrid) {
    vLines.push(
      <line key={x} x1={x} y1={0} x2={x} y2={ch}
        stroke="#94a3b8" strokeWidth={0.5} opacity={0.4} />
    );
  }
  for (let y = 0; y <= ch; y += scaledGrid) {
    hLines.push(
      <line key={y} x1={0} y1={y} x2={cw} y2={y}
        stroke="#94a3b8" strokeWidth={0.5} opacity={0.4} />
    );
  }

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: cw,
        height: ch,
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      {vLines}
      {hLines}
    </svg>
  );
}

export function SafeArea({ zoom, canvasW, canvasH, margin = 36 }: SafeAreaProps) {
  const scale = zoom / 100;
  const m = margin * scale;
  const cw = canvasW * scale;
  const ch = canvasH * scale;

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: cw,
        height: ch,
        pointerEvents: "none",
        zIndex: 6,
      }}
    >
      <rect
        x={m} y={m}
        width={cw - m * 2} height={ch - m * 2}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={1}
        strokeDasharray="6 3"
        opacity={0.6}
      />
      <text x={m + 4} y={m + 11} fontSize="8" fill="#f59e0b" opacity={0.8} fontFamily="monospace">
        Safe Area
      </text>
    </svg>
  );
}
