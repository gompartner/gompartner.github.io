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
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold tabular-nums text-[#5b6370]">
      <span aria-hidden className="relative block h-[4px] w-[28px] overflow-hidden rounded-full bg-[#e1e5eb]">
        <span className="absolute inset-y-0 left-0 bg-[#256ef4]" style={{ width: `${rec!.p}%` }} />
      </span>
      {rec!.p}%
    </span>
  );
}
