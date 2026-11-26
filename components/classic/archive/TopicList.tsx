"use client";

import Link from "next/link";
import { useState } from "react";
import { ReadMark } from "@/components/classic/archive/ReadMark";
import { statusOf, useReadAll } from "@/lib/readState";

// 11-22 주제 페이지: 묶음 제목 대신 항목마다 종류 태그와 소분류 태그, 위에 태그 필터, 읽은 정도
export type TopicRow = { label: string; href?: string; kind: string; group?: string; ver?: string; children?: { label: string; href: string }[] };

// 11-26 종류마다 다르던 색 면(파랑, 초록, 보라, 노랑)은 목록(WikiBoard)의 종류 표시와 같은 테두리 알약 하나로
const tag = "inline-flex w-[68px] justify-center rounded-full border border-[#d9dee5] px-1.5 py-0.5 text-[12.5px] text-[#5b6370]";

function Chip({ on, label, n, onClick }: { on: boolean; label: string; n: number; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-bold ${on ? "gp-primary border-transparent" : "border-[#d9dee5] text-[#3d4450] hover:border-[#15171c]"}`}
    >
      {label}
      <span className={`text-[12.5px] font-semibold tabular-nums ${on ? "" : "text-[#6b7380]"}`}>{n}</span>
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
            {changed ? <span className="font-bold text-[#15171c]">업데이트 {changed}개</span> : null}
          </p>
          <div aria-hidden className="mt-2 h-[3px] overflow-hidden rounded-full bg-[#e6e9ee]">
            <div className="h-full rounded-full bg-[#5b6370]" style={{ width: `${Math.round((done / Math.max(1, docs.length)) * 100)}%` }} />
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
            <span className="mt-0.5 flex shrink-0 flex-col items-start gap-1">
              <span className={tag}>{r.kind}</span>
            </span>
          );
          const sub = r.group ? <span className="mt-0.5 block text-[12.5px] font-semibold text-[#6b7380]">{r.group}</span> : null;
          return (
            <li key={r.label + (r.href ?? "")} className="border-b border-[#eef0f3]">
              {r.href ? (
                <Link href={r.href} className="group flex items-start gap-3 py-3.5">
                  {tags}
                  <span className="min-w-0 flex-1">
                    <span className="text-[16.5px] font-bold leading-[1.5] text-[#15171c] underline-offset-4 group-hover:underline">{r.label}</span>
                    {sub}
                  </span>
                  <span className="mt-0.5"><ReadMark href={r.href} ver={r.ver} /></span>
                </Link>
              ) : (
                <div className="flex items-start gap-3 py-3.5">
                  {tags}
                  <div className="min-w-0">
                    <p className="text-[16.5px] font-[800] leading-[1.5]">{r.label}</p>
                    {sub}
                    {r.children ? (
                      <ul role="list" className="mt-1.5 flex flex-wrap gap-1.5">
                        {r.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#d9dee5] px-3 text-[14px] text-[#3d4450] hover:border-[#15171c]">
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
