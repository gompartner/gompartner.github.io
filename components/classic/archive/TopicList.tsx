"use client";

import Link from "next/link";
import { useState } from "react";
import { ReadMark } from "@/components/classic/archive/ReadMark";
import { statusOf, useReadAll } from "@/lib/readState";

// 11-22 주제 페이지: 묶음 제목 대신 항목마다 종류 태그와 소분류 태그, 위에 태그 필터, 읽은 정도
export type TopicRow = { label: string; href?: string; kind: string; group?: string; ver?: string; children?: { label: string; href: string }[] };

const tone: Record<string, string> = {
  문서: "bg-[#eef3ff] text-[#1d5fd6]",
  "운영 노트": "bg-[#e9f6ef] text-[#17734a]",
  용어: "bg-[#f3effc] text-[#5b3fb0]",
  도구: "bg-[#fff4e5] text-[#9a5300]",
  자료: "bg-[#eef1f5] text-[#3d4450]",
};

function Chip({ on, label, n, onClick }: { on: boolean; label: string; n: number; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-bold ${on ? "border-[#256ef4] bg-[#256ef4] text-white" : "border-[#d9dee5] bg-white text-[#3d4450] hover:border-[#256ef4] hover:text-[#256ef4]"}`}
    >
      {label}
      <span className={`text-[12.5px] font-semibold tabular-nums ${on ? "text-white/75" : "text-[#6b7380]"}`}>{n}</span>
    </button>
  );
}

export function TopicList({ rows, kinds }: { rows: TopicRow[]; kinds: string[] }) {
  const [sel, setSel] = useState("전체");
  const all = useReadAll();
  const hasKinds = kinds.filter((k) => rows.some((r) => r.kind === k));
  const groups = [...new Set(rows.map((r) => r.group).filter(Boolean))] as string[];
  const match = (r: TopicRow, f: string) => f === "전체" || r.kind === f || r.group === f || (f === "안 읽은 것" && !!r.href && statusOf(all?.[r.href], r.ver) !== "done");
  const shown = rows.filter((r) => match(r, sel));
  const docs = rows.filter((r) => r.href);
  const done = all ? docs.filter((r) => statusOf(all[r.href!], r.ver) === "done").length : 0;
  const changed = all ? docs.filter((r) => statusOf(all[r.href!], r.ver) === "changed").length : 0;
  return (
    <div className="mt-8">
      {all && (done > 0 || changed > 0) ? (
        <div className="mb-5 max-w-[820px]">
          <p className="flex flex-wrap items-baseline gap-x-3 text-[14px] text-[#3d4450]">
            <b className="text-[15px] font-[800] text-[#15171c]">{docs.length}개 중 {done}개 읽음</b>
            {changed ? <span className="font-bold text-[#1d5fd6]">업데이트 {changed}개</span> : null}
          </p>
          <div aria-hidden className="mt-2 h-[6px] overflow-hidden rounded-full bg-[#e6e9ee]">
            <div className="h-full rounded-full bg-[#17734a]" style={{ width: `${Math.round((done / Math.max(1, docs.length)) * 100)}%` }} />
          </div>
        </div>
      ) : null}
      <div role="group" aria-label="태그로 거르기" className="flex flex-wrap items-center gap-2">
        <Chip on={sel === "전체"} label="전체" n={rows.length} onClick={() => setSel("전체")} />
        {hasKinds.length > 1 ? hasKinds.map((k) => <Chip key={k} on={sel === k} label={k} n={rows.filter((r) => r.kind === k).length} onClick={() => setSel(k)} />) : null}
        {groups.length ? <span aria-hidden className="mx-0.5 h-5 w-px bg-[#d9dee5]" /> : null}
        {groups.map((g) => <Chip key={g} on={sel === g} label={g} n={rows.filter((r) => r.group === g).length} onClick={() => setSel(g)} />)}
        {all && done > 0 ? <Chip on={sel === "안 읽은 것"} label="안 읽은 것" n={docs.length - done} onClick={() => setSel("안 읽은 것")} /> : null}
      </div>
      <ul role="list" className="mt-4 border-t border-[#e6e9ee]">
        {shown.map((r) => {
          const tags = (
            <span className="flex shrink-0 flex-col items-start gap-1 sm:w-[64px]">
              <span className={`inline-flex w-[64px] justify-center rounded px-1.5 py-0.5 text-[12px] font-bold ${tone[r.kind] ?? tone["자료"]}`}>{r.kind}</span>
            </span>
          );
          const sub = r.group ? <span className="mt-0.5 block text-[12.5px] font-semibold text-[#6b7380]">{r.group}</span> : null;
          return (
            <li key={r.label + (r.href ?? "")} className="border-b border-[#eef0f3]">
              {r.href ? (
                <Link href={r.href} className="group flex items-start gap-3 py-3">
                  {tags}
                  <span className="min-w-0 flex-1">
                    <span className="text-[15.5px] font-bold leading-[1.5] text-[#15171c] group-hover:text-[#256ef4] group-hover:underline underline-offset-4">{r.label}</span>
                    {sub}
                  </span>
                  <span className="mt-0.5"><ReadMark href={r.href} ver={r.ver} /></span>
                </Link>
              ) : (
                <div className="flex items-start gap-3 py-3">
                  {tags}
                  <div className="min-w-0">
                    <p className="text-[15.5px] font-[800] leading-[1.5]">{r.label}</p>
                    {sub}
                    {r.children ? (
                      <ul role="list" className="mt-1.5 flex flex-wrap gap-1.5">
                        {r.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="inline-flex items-center gap-1.5 rounded-md border border-[#d9dee5] bg-white px-2.5 py-1 text-[13.5px] text-[#3d4450] hover:border-[#256ef4] hover:text-[#256ef4]">
                              {c.label}
                              <ReadMark href={c.href} />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
