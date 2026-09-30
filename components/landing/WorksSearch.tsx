"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Search, X } from "lucide-react";
import type { Project } from "@/lib/types";
import { WorksGrid } from "./WorksGrid";

const kinds = ["전체", "신규 제작", "유지보수"] as const;
type Kind = (typeof kinds)[number];

// 띄어쓰기와 대소문자 차이는 무시한다 ("피부과홈페이지"도 찾히도록)
const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");

const searchText = (p: Project) => normalize([p.title, p.category, p.description, ...p.features].join(" "));

// 제작 사례가 늘어나도 찾기 쉽도록 검색어와 구분으로 목록을 거른다
export function WorksSearch({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<Kind>("전체");
  const reduce = useReducedMotion();

  const indexed = useMemo(() => projects.map((p) => ({ p, text: searchText(p) })), [projects]);

  // 검색어를 띄어 쓰면 모든 단어가 들어간 사례만 보여 준다
  const terms = query.split(/\s+/).map(normalize).filter(Boolean);
  const results = indexed.filter(({ p, text }) => (kind === "전체" || p.kind === kind) && terms.every((t) => text.includes(t))).map(({ p }) => p);

  const countOf = (k: Kind) => (k === "전체" ? projects.length : projects.filter((p) => p.kind === k).length);

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-[400px]">
          <label htmlFor="works-search" className="sr-only">
            제작 사례 검색
          </label>
          <Search size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-foreground-tertiary" aria-hidden />
          <input
            id="works-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예: 병원, 예약, 지도"
            autoComplete="off"
            className="min-h-12 w-full rounded-md border border-[#6d7882] bg-white py-3 pr-12 pl-12 text-[17px] leading-[1.5] text-foreground placeholder:text-foreground-tertiary focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="검색어 지우기"
              className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-foreground-secondary hover:bg-surface"
            >
              <X size={20} aria-hidden />
            </button>
          )}
        </div>

        <div role="group" aria-label="구분" className="flex flex-wrap gap-2">
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={`h-10 rounded-md border px-4 text-[15px] font-bold leading-[1.5] transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] motion-reduce:active:scale-100 ${
                kind === k ? "border-accent bg-accent text-accent-foreground" : "border-border bg-white text-foreground-secondary hover:bg-surface"
              }`}
            >
              {k} <span className="tabular-nums">{countOf(k)}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[15px] leading-[1.5] text-foreground-secondary" aria-live="polite">
        {results.length}건
      </p>

      <div className="mt-4">
        {results.length > 0 ? (
          <WorksGrid projects={results} />
        ) : (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(8px)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px)" }}
            transition={{
              duration: 0.22,
              ease: [0.23, 1, 0.32, 1],
              delay: 0.1,
            }}
            className="rounded-[10px] border border-border bg-surface px-6 py-12 text-center"
          >
            <p className="text-[17px] font-bold leading-[1.5]">찾는 사례가 없습니다.</p>
            <p className="mt-1 text-[17px] leading-[1.5] text-foreground-secondary">비슷한 작업이 가능한지 채팅으로 물어보셔도 됩니다.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setKind("전체");
              }}
              className="mt-6 inline-flex h-12 items-center justify-center rounded-md border border-[#6d7882] bg-white px-6 text-[17px] font-bold text-foreground transition-colors hover:bg-surface"
            >
              전체 사례 보기
            </button>
          </motion.div>
        )}
      </div>
    </>
  );
}
