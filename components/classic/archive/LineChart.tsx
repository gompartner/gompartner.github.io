"use client";

import { useEffect, useRef, useState } from "react";
import type { Series } from "@/data/classic/trendData";

// 아카이브 선 차트(11-21). 2px 선, 한 축, 범례 + 한 해 직접 라벨, 마우스를 올리면 그해 값, 표로 보기.
// 폭에 맞춰 다시 그려 휴대폰에서도 글자 크기가 유지된다.
export function LineChart({ title, sub, series, labelYear, unit = "%", max = 100, source }: { title: string; sub?: string; series: Series[]; labelYear?: number; unit?: string; max?: number; source: { label: string; href: string; note?: string } }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(760);
  const [hover, setHover] = useState<{ year: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const years = [...new Set(series.flatMap((s) => s.points.map((p) => p[0])))].sort((a, b) => a - b);
  const y0 = years[0];
  const y1 = years[years.length - 1];
  const narrow = W < 500;
  const H = narrow ? 280 : 300;
  const L = max >= 1000 ? 46 : 34;
  const R = narrow ? 72 : 60;
  const T = 14;
  const B = 30;
  const x = (yr: number) => L + ((yr - y0) / (y1 - y0)) * (W - L - R);
  const y = (v: number) => T + ((max - v) / max) * (H - T - B);
  const fmt = (v: number) => (max >= 1000 ? Math.round(v).toLocaleString("ko-KR") : String(Math.round(v)));
  const ticks = narrow ? [y0, Math.round((y0 + y1) / 2), y1] : [y0, ...[1, 2, 3].map((i) => Math.round(y0 + ((y1 - y0) * i) / 4)), y1];
  const valueAt = (s: Series, yr: number) => s.points.find((p) => p[0] === yr)?.[1];

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const r = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const px = e.clientX - r.left;
    const yr = Math.max(y0, Math.min(y1, Math.round(y0 + ((px - L) / (W - L - R)) * (y1 - y0))));
    const box = wrapRef.current!.getBoundingClientRect();
    setHover({ year: yr, x: e.clientX - box.left, y: e.clientY - box.top });
  }

  return (
    <figure className="relative mt-4 rounded-[10px] border border-[#e6e9ee] px-4 pb-8 pt-4 md:px-5">
      <figcaption>
        <span className="block text-[16px] font-[800] tracking-[-0.02em]">{title}</span>
        {sub ? <span className="block text-[13px] text-[#5b6370]">{sub}</span> : null}
      </figcaption>
      <ul role="list" className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px] text-[#3d4450]">
        {series.map((s) => (
          <li key={s.key} className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-[3px] w-3.5 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>
      <div ref={wrapRef} className="relative mt-1">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={`${title}. ${series.map((s) => `${s.label} ${s.points[0][1]}${unit}에서 ${s.points[s.points.length - 1][1]}${unit}`).join(", ")}`} className="block">
          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={y((v / 100) * max)} y2={y((v / 100) * max)} stroke="#e6e9ee" />
              <text x={L - 8} y={y((v / 100) * max) + 4} fontSize="11" fill="#8a93a1" textAnchor="end">
                {fmt((v / 100) * max)}
              </text>
            </g>
          ))}
          {ticks.map((t) => (
            <text key={t} x={x(t)} y={H - 10} fontSize="11" fill="#8a93a1" textAnchor="middle">
              {t}
            </text>
          ))}
          {series.map((s) => (
            <polyline key={s.key} points={s.points.map(([a, b]) => `${x(a)},${y(b)}`).join(" ")} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {labelYear
            ? (() => {
                // 라벨끼리 14px 안으로 붙으면 위아래로 벌린다. 오른쪽 끝 해는 점 왼쪽에 적는다
                const ls = series
                  .map((s) => ({ s, v: valueAt(s, labelYear) }))
                  .filter((d): d is { s: Series; v: number } => d.v !== undefined)
                  .map((d) => ({ ...d, ty: y(d.v) + 4 }))
                  .sort((p, q) => p.ty - q.ty);
                for (let k = 1; k < ls.length; k++) if (ls[k].ty - ls[k - 1].ty < 14) ls[k].ty = ls[k - 1].ty + 14;
                const atEnd = x(labelYear) > W - R - 10;
                return ls.map(({ s, v, ty }) => (
                  <g key={s.key}>
                    <circle cx={x(labelYear)} cy={y(v)} r={4} fill={s.color} stroke="#fff" strokeWidth={2} />
                    <text x={atEnd ? x(labelYear) - 8 : x(labelYear) + 8} y={atEnd ? ty + 12 : ty} fontSize="12" fontWeight={700} fill="#15171c" textAnchor={atEnd ? "end" : "start"}>
                      {s.label} {fmt(v)}
                      {unit}
                    </text>
                  </g>
                ));
              })()
            : null}
          {hover ? <line x1={x(hover.year)} x2={x(hover.year)} y1={T} y2={H - B} stroke="#5b6370" strokeDasharray="3 3" /> : null}
          <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
        </svg>
        {hover ? (
          <div className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md bg-[#15171c] px-2.5 py-2 text-[13px] leading-[1.55] text-white" style={{ left: Math.min(hover.x + 14, W - 120), top: Math.max(0, hover.y - 10) }}>
            <b>{hover.year}</b>
            {series.map((s) => (
              <span key={s.key} className="block">
                {s.label} {valueAt(s, hover.year) === undefined ? "자료 없음" : `${valueAt(s, hover.year)}${unit}`}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[#5b6370]">
        출처:{" "}
        <a href={source.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#15171c]">
          {source.label}
        </a>
        {source.note ? `. ${source.note}` : ""}
      </p>
      <details className="mt-2 text-[14px]">
        <summary className="cursor-pointer list-none font-bold text-[#256ef4] [&::-webkit-details-marker]:hidden">표로 보기</summary>
        <div className="mt-2 max-h-[320px] overflow-y-auto">
          <table className="w-full border-collapse text-right tabular-nums">
            <thead>
              <tr className="border-b border-[#d9dee5] text-[#5b6370]">
                <th scope="col" className="py-1.5 pr-2 text-left font-bold">연도</th>
                {series.map((s) => (
                  <th key={s.key} scope="col" className="px-2 py-1.5 font-bold">{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {years.map((yr) => (
                <tr key={yr} className="border-b border-[#eef0f3]">
                  <th scope="row" className="py-1.5 pr-2 text-left font-normal">{yr}</th>
                  {series.map((s) => (
                    <td key={s.key} className="px-2 py-1.5">{valueAt(s, yr) ?? "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      {/* 출처 표시: 그림과 같은 오른쪽 아래 */}
      <p aria-hidden className="pointer-events-none absolute bottom-2.5 right-4 text-[11px] text-[#6b7380] md:right-5">곰파트너 gompartner.co.kr</p>
    </figure>
  );
}
