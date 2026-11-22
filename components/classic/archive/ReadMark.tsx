"use client";

import { Check } from "lucide-react";
import { statusOf, useReadAll } from "@/lib/readState";

// 11-22 목록 옆 읽음 표시: 업데이트(읽은 뒤 고쳐짐, 다시 읽어 볼 만함), 읽음, 읽는 중 비율. 안 읽은 문서는 아무것도 없다
export function ReadMark({ href, ver }: { href?: string; ver?: string }) {
  const all = useReadAll();
  if (!href || !all) return null;
  const rec = all[href];
  const s = statusOf(rec, ver);
  if (s === "none") return null;
  if (s === "changed") return <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-bold text-[#1d5fd6]"><span aria-hidden className="h-[6px] w-[6px] rounded-full bg-[#256ef4]" />업데이트</span>;
  if (s === "done") return <span className="inline-flex shrink-0 items-center gap-0.5 text-[12px] font-bold text-[#17734a]"><Check size={13} aria-hidden strokeWidth={3} />읽음</span>;
  // 11-22 읽는 중은 원형(막대 대신). 지름 16, 둘레에 읽은 비율만큼 파랑
  const r = 6.5;
  const c = 2 * Math.PI * r;
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold tabular-nums text-[#5b6370]">
      <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" className="-rotate-90">
        <circle cx="8" cy="8" r={r} fill="none" stroke="#e6e9ee" strokeWidth="2.5" />
        <circle cx="8" cy="8" r={r} fill="none" stroke="#256ef4" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${(c * rec!.p) / 100} ${c}`} />
      </svg>
      {rec!.p}%
    </span>
  );
}
