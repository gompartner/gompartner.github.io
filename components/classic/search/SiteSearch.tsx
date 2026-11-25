"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import type { SearchItem, SearchKind } from "./index";
import { matches, norm } from "./match";
import { SearchBox } from "./SearchBox";
import { ORDER, SearchResults } from "./SearchResults";

const SUGGEST = ["홈페이지 제작", "오류 수정", "업체 변경", "워드프레스", "PHP", "예약", "견적 계산", "치과", "학원"];

// 통합검색. 주소의 ?q= 와 ?kind= 를 읽고, 바뀔 때마다 주소도 바꿔 둔다(뒤로 가기, 공유)
// 11-26 종류 필터(사용자 "통합검색 필요합니다 필터 기능 포함"): 결과가 있는 종류만 버튼으로 나오고 여러 개를 함께 고를 수 있다. 아무것도 안 고르면 전체.
export function SiteSearch({ index }: { index: SearchItem[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [kinds, setKinds] = useState<SearchKind[]>(() => (params.get("kind") ?? "").split(",").filter((k): k is SearchKind => (ORDER as string[]).includes(k)));
  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams();
      if (q.trim()) sp.set("q", q.trim());
      if (q.trim() && kinds.length) sp.set("kind", kinds.join(","));
      const qs = sp.toString();
      router.replace(qs ? `/search?${qs}` : "/search", { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [q, kinds, router]);

  // 빈칸만 친 것은 검색어가 없는 것으로 본다
  const term = q.trim();
  const found = useMemo(() => {
    // 같은 주소와 제목이 두 번 들어온 결과는 한 번만 센다
    const seen = new Set<string>();
    const list = index.filter((i) => matches(`${i.title} ${i.desc} ${i.hay} ${i.kind}`, term)).filter((i) => !seen.has(`${i.href}|${i.title}`) && seen.add(`${i.href}|${i.title}`));
    // 제목에 검색어가 든 결과를 그 종류 안에서 먼저 보여 준다(순서는 그대로 두고 앞으로만 당긴다)
    const words = term.split(/\s+/).map(norm).filter(Boolean);
    const inTitle = (i: SearchItem) => words.every((w) => norm(i.title).includes(w));
    return [...list.filter(inTitle), ...list.filter((i) => !inTitle(i))];
  }, [index, term]);
  const counts = useMemo(() => ORDER.map((k) => ({ k, n: found.filter((i) => i.kind === k).length })).filter((c) => c.n > 0), [found]);
  // 검색어가 바뀌어 결과가 없어진 종류는 선택에서 뺀 것으로 본다
  const active = kinds.filter((k) => counts.some((c) => c.k === k));
  const shown = active.length ? found.filter((i) => active.includes(i.kind)) : found;
  const toggle = (k: SearchKind) => setKinds((v) => (v.includes(k) ? v.filter((x) => x !== k) : [...v, k]));
  const chip = (on: boolean) => `inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[15px] font-bold transition-colors ${on ? "border-[#256ef4] bg-[#256ef4] text-white" : "border-[#d9dee5] bg-white text-[#3d4450] hover:border-[#256ef4]"}`;

  return (
    <div>
      <SearchBox id="site-search" value={q} onChange={setQ} placeholder="서비스, 카탈로그, 위키, 자주 묻는 질문 검색" suggestions={SUGGEST} />
      {term && counts.length > 1 ? (
        <div className="-mx-4 mt-7 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          <ul className="flex gap-2 md:flex-wrap" role="list" aria-label="종류로 거르기">
            <li>
              <button type="button" aria-pressed={active.length === 0} onClick={() => setKinds([])} className={chip(active.length === 0)}>
                전체 <span className={`tabular-nums ${active.length === 0 ? "" : "opacity-80"}`}>{found.length}</span>
              </button>
            </li>
            {counts.map((c) => {
              const on = active.includes(c.k);
              return (
                <li key={c.k}>
                  <button type="button" aria-pressed={on} onClick={() => toggle(c.k)} className={chip(on)}>
                    {on ? <Check size={15} aria-hidden /> : null}
                    {c.k} <span className={`tabular-nums ${on ? "" : "opacity-80"}`}>{c.n}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      <p className="mt-7 text-[15px] text-[#5b6370]" role="status">
        {term ? (
          <>
            <b className="break-all text-[#15171c]">{term}</b> 검색 결과 <b className="tabular-nums text-[#15171c]">{shown.length}</b>건{active.length ? <span> ({active.join(", ")})</span> : null}
          </>
        ) : (
          "검색어를 입력해 주십시오."
        )}
      </p>
      {term && shown.length > 0 ? (
        <div className="mt-8">
          <SearchResults items={shown} />
        </div>
      ) : null}
      {term && found.length === 0 ? <p className="mt-6 text-[16px]">다른 검색어로 찾아보시거나 Contact로 문의해 주십시오.</p> : null}
    </div>
  );
}
