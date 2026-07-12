"use client";

import React from "react";

interface RulerProps {
  zoom: number;
  pan: number;
  length: number;
  canvasSize: number;
  orientation: "horizontal" | "vertical";
}

const RULER_SIZE = 20;

export function Ruler({ zoom, pan, length, canvasSize, orientation }: RulerProps) {
  const scale = zoom / 100;
  const isH = orientation === "horizontal";

  const ticks: React.ReactNode[] = [];
  const step = scale < 0.6 ? 100 : scale < 1.2 ? 50 : 20;
  const totalNative = canvasSize;
  const offsetPx = pan;

  for (let native = 0; native <= totalNative; native += step) {
    const px = native * scale + offsetPx;
    if (px < -50 || px > length + 50) continue;

    const isMajor = native % (step * 5) === 0;
    const label = `${native}`;

    if (isH) {
      ticks.push(
        <g key={native}>
          <line
            x1={px} y1={isMajor ? 0 : RULER_SIZE * 0.5}
            x2={px} y2={RULER_SIZE}
            stroke="#94a3b8" strokeWidth={isMajor ? 1 : 0.5}
          />
          {isMajor && (
            <text x={px + 2} y={RULER_SIZE - 4}
              fontSize="7" fill="#64748b" fontFamily="monospace">
              {label}
            </text>
          )}
        </g>
      );
    } else {
      ticks.push(
        <g key={native}>
          <line
            x1={isMajor ? 0 : RULER_SIZE * 0.5} y1={px}
            x2={RULER_SIZE} y2={px}
            stroke="#94a3b8" strokeWidth={isMajor ? 1 : 0.5}
          />
          {isMajor && (
            <text
              x={RULER_SIZE - 3} y={px - 2}
              fontSize="7" fill="#64748b" fontFamily="monospace"
              transform={`rotate(-90, ${RULER_SIZE - 3}, ${px - 2})`}
            >
              {label}
            </text>
          )}
        </g>
      );
    }
  }

  if (isH) {
    return (
      <svg
        width={length}
        height={RULER_SIZE}
        style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "block", flexShrink: 0 }}
      >
        {ticks}
      </svg>
    );
  }

  return (
    <svg
      width={RULER_SIZE}
      height={length}
      style={{ background: "#f8fafc", borderRight: "1px solid #e2e8f0", display: "block", flexShrink: 0 }}
    >
      {ticks}
    </svg>
  );
}

export { RULER_SIZE };
