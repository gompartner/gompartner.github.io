"use client";

import { Check } from "lucide-react";
import { statusOf, useReadAll } from "@/lib/readState";

// 11-22 목록 옆 읽음 표시: 바뀜(읽은 뒤 수정됨), 읽음, 읽는 중 비율. 안 읽은 문서는 아무것도 없다
export function ReadMark({ href, ver }: { href?: string; ver?: string }) {
  const all = useReadAll();
  if (!href || !all) return null;
  const rec = all[href];
  const s = statusOf(rec, ver);
  if (s === "none") return null;
  if (s === "changed") return <span className="shrink-0 rounded bg-[#256ef4] px-1.5 py-0.5 text-[11.5px] font-bold leading-none text-white">바뀜</span>;
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
