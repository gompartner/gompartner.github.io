"use client";

import { useEffect, useState } from "react";

// 이번 달 진료일정(11-21 사례 분석: 동네 치과 사이트가 메인에 휴진일, 야간 진료일 달력을 둔다).
// 기본은 화, 목 야간 진료, 일요일 휴진. 달은 보는 날 기준으로 바뀐다.
export function MonthSchedule({ accent, night = "#2a7f86", rounded = 20, bg = "#ffffff", marks = { 2: "~21시", 4: "~21시" }, markLabel = "야간 진료" }: { accent: string; night?: string; rounded?: number; bg?: string; marks?: Record<number, string>; markLabel?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const d = now ?? new Date(2026, 10, 1);
  const y = d.getFullYear(), m = d.getMonth();
  const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const today = now && now.getMonth() === m ? now.getDate() : -1;
  return (
    <div className="p-5 md:p-8" style={{ background: bg, borderRadius: rounded }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="text-[24px] font-bold tracking-[-0.03em] md:text-[30px]">{m + 1}월 진료일정</h3>
        <p className="flex gap-4 text-[13px] font-bold">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: night }} />{markLabel}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />휴진</span>
        </p>
      </div>
      <div className="mt-6 grid grid-cols-7 text-center text-[13px] font-bold" style={{ color: "#7a7f88" }}>
        {["일", "월", "화", "수", "목", "금", "토"].map((w) => (
          <span key={w} className="pb-2">{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {cells.map((n, i) => {
          const w = i % 7, off = w === 0, late = marks[w];
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 py-1.5">
              {n && (
                <>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold tabular-nums md:h-10 md:w-10" style={n === today ? { background: "#1a1c1f", color: "#fff" } : off ? { color: accent } : undefined}>
                    {n}
                  </span>
                  <span className="h-4 text-[10px] font-bold md:text-[11px]" style={{ color: off ? accent : night }}>{off ? "휴진" : late ?? ""}</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
