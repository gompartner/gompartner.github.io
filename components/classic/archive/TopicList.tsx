"use client";

import Link from "next/link";
import { useState } from "react";

// 11-22 주제 페이지: 묶음 제목(문서, 운영 노트, 도구) 대신 항목마다 종류 태그, 위에 태그 필터
export type TopicRow = { label: string; href?: string; kind: string; children?: { label: string; href: string }[] };

const tone: Record<string, string> = {
  문서: "bg-[#eef3ff] text-[#1d5fd6]",
  "운영 노트": "bg-[#e9f6ef] text-[#17734a]",
  용어: "bg-[#f3effc] text-[#5b3fb0]",
  도구: "bg-[#fff4e5] text-[#9a5300]",
  자료: "bg-[#eef1f5] text-[#3d4450]",
};

export function TopicList({ rows, kinds }: { rows: TopicRow[]; kinds: string[] }) {
  const [sel, setSel] = useState("전체");
  const has = kinds.filter((k) => rows.some((r) => r.kind === k));
  const shown = sel === "전체" ? rows : rows.filter((r) => r.kind === sel);
  const chips = [["전체", rows.length] as const, ...has.map((k) => [k, rows.filter((r) => r.kind === k).length] as const)];
  return (
    <div className="mt-8">
      {has.length > 1 ? (
        <div role="group" aria-label="종류로 거르기" className="flex flex-wrap gap-2">
          {chips.map(([k, n]) => (
            <button
              key={k}
              type="button"
              aria-pressed={sel === k}
              onClick={() => setSel(k)}
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-bold ${sel === k ? "border-[#15171c] bg-[#15171c] text-white" : "border-[#d9dee5] bg-white text-[#3d4450] hover:border-[#256ef4] hover:text-[#256ef4]"}`}
            >
              {k}
              <span className={`text-[12.5px] font-semibold tabular-nums ${sel === k ? "text-white/75" : "text-[#6b7380]"}`}>{n}</span>
            </button>
          ))}
        </div>
      ) : null}
      <ul role="list" className="mt-4 border-t border-[#e6e9ee]">
        {shown.map((r) => (
          <li key={r.label + (r.href ?? "")} className="border-b border-[#eef0f3]">
            {r.href ? (
              <Link href={r.href} className="group flex items-start gap-3 py-3">
                <span className={`mt-[1px] inline-flex w-[64px] shrink-0 justify-center rounded px-1.5 py-0.5 text-[12px] font-bold ${tone[r.kind] ?? tone["자료"]}`}>{r.kind}</span>
                <span className="text-[15.5px] font-bold leading-[1.5] text-[#15171c] group-hover:text-[#256ef4] group-hover:underline underline-offset-4">{r.label}</span>
              </Link>
            ) : (
              <div className="flex items-start gap-3 py-3">
                <span className={`mt-[1px] inline-flex w-[64px] shrink-0 justify-center rounded px-1.5 py-0.5 text-[12px] font-bold ${tone[r.kind] ?? tone["자료"]}`}>{r.kind}</span>
                <div className="min-w-0">
                  <p className="text-[15.5px] font-[800] leading-[1.5]">{r.label}</p>
                  {r.children ? (
                    <ul role="list" className="mt-1.5 flex flex-wrap gap-1.5">
                      {r.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="inline-flex rounded-md border border-[#d9dee5] bg-white px-2.5 py-1 text-[13.5px] text-[#3d4450] hover:border-[#256ef4] hover:text-[#256ef4]">{c.label}</Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
