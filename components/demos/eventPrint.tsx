"use client";

import { useMemo } from "react";
import QRCode from "qrcode";

/* 행사 랜딩 샘플들이 같이 쓰는 인쇄물 조각: 바코드와 QR.
   바코드는 값에서 막대 굵기를 정하는 그림이고(실제 규격 아님), QR은 qrcode로 만든 진짜 QR이다. */

function hash(s: string) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

/** 값이 같으면 같은 모양이 나오는 바코드 그림 */
export function Barcode({ value, color = "#111", height = 52, className = "" }: { value: string; color?: string; height?: number; className?: string }) {
  const bars = useMemo(() => {
    let h = hash(value);
    const out: { x: number; w: number }[] = [];
    let x = 0;
    // 시작 표시
    for (const w of [1, 1, 1]) {
      out.push({ x, w });
      x += w * 2;
    }
    for (let i = 0; i < value.length * 5 + 20; i++) {
      h ^= h << 13;
      h ^= h >>> 17;
      h ^= h << 5;
      const w = ((h >>> 0) % 3) + 1;
      const gap = ((h >>> 3) % 2) + 1;
      out.push({ x, w });
      x += w + gap;
    }
    for (const w of [1, 1, 1]) {
      out.push({ x, w });
      x += w * 2;
    }
    return { out, total: x };
  }, [value]);
  return (
    <svg viewBox={`0 0 ${bars.total} 10`} preserveAspectRatio="none" className={`block w-full ${className}`} style={{ height }} aria-hidden>
      {bars.out.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={10} fill={color} />
      ))}
    </svg>
  );
}

/** 휴대폰 카메라로 읽히는 진짜 QR */
export function RealQr({ value, color = "#111", bg = "#fff", label }: { value: string; color?: string; bg?: string; label: string }) {
  const { size, cells } = useMemo(() => {
    const m = QRCode.create(value, { errorCorrectionLevel: "M" }).modules;
    const cells: [number, number][] = [];
    for (let y = 0; y < m.size; y++) for (let x = 0; x < m.size; x++) if (m.get(y, x)) cells.push([x, y]);
    return { size: m.size, cells };
  }, [value]);
  const path = cells.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join("");
  return (
    <svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} className="block h-auto w-full" role="img" aria-label={label} shapeRendering="crispEdges">
      <rect x={-2} y={-2} width={size + 4} height={size + 4} fill={bg} />
      <path d={path} fill={color} />
    </svg>
  );
}
