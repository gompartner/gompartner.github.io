"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { SearchBox } from "@/components/classic/search/SearchBox";
import { termGroups, termLabels, termSections, type TermSection } from "@/data/classic/glossary";

/** 웹 용어 사전 화면. 큰 분류 탭, 작은 분류 칩, 검색(세 분류를 함께 찾음) */
export function TermsBrowser() {
  const [sec, setSec] = useState<TermSection>("화면 부품");
  const [cat, setCat] = useState("전체");
  const [q, setQ] = useState("");

  // 주소 끝 #t12 로 들어오면 그 용어가 있는 분류를 열고 그 자리로 간다(통합검색에서 넘어올 때)
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const g = termGroups.find((x) => x.terms.some((t) => t.id === id));
    if (!g) return;
    setSec(g.sec);
    setCat("전체");
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "center" }));
  }, []);

  const words = q.trim().split(/\s+/).filter(Boolean);
  const cats = useMemo(() => ["전체", ...new Set(termGroups.filter((g) => g.sec === sec).map((g) => g.cat))], [sec]);
  const shown = termGroups
    .filter((g) => (words.length ? true : g.sec === sec && (cat === "전체" || g.cat === cat)))
    .map((g) => ({ ...g, terms: g.terms.filter((t) => words.every((w) => [t.name, t.alt, t.look, t.use, t.say, g.title].join(" ").includes(w))) }))
    .filter((g) => g.terms.length > 0);
  const total = shown.reduce((a, g) => a + g.terms.length, 0);

  return (
    <div>
      <SearchBox id="terms-q" value={q} onChange={setQ} placeholder="예: 하트 버튼, 행간, 도메인 연장" suggestions={["달력", "팝업", "자물쇠", "행간", "도메인"]} />
      {!words.length ? (
        <>
          <div role="tablist" aria-label="큰 분류" className="mt-8 flex gap-1 overflow-x-auto border-b-2 border-[#e1e5eb]">
            {termSections.map((s) => {
              const n = termGroups.filter((g) => g.sec === s).reduce((a, g) => a + g.terms.length, 0);
              return (
                <button key={s} type="button" role="tab" aria-selected={s === sec} onClick={() => { setSec(s); setCat("전체"); }} className={`-mb-0.5 min-h-12 shrink-0 border-b-[3px] px-3 text-[16px] font-bold md:px-4 ${s === sec ? "border-[#256ef4] text-[#15171c]" : "border-transparent text-[#5b6370] hover:text-[#15171c]"}`}>
                  {s} <span className="tabular-nums">{n}</span>
                </button>
              );
            })}
          </div>
          {cats.length > 2 ? (
            <ul className="mt-4 flex flex-wrap gap-2" role="list" aria-label="작은 분류">
              {cats.map((c) => (
                <li key={c}>
                  <button type="button" aria-pressed={c === cat} onClick={() => setCat(c)} className={`min-h-9 rounded-full border px-3.5 text-[14px] font-bold ${c === cat ? "border-[#15171c] bg-[#15171c] text-white" : "border-[#d9dee5] bg-white text-[#3d4450] hover:border-[#256ef4] hover:text-[#256ef4]"}`}>
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
      <p className="mt-6 text-[14px] text-[#5b6370]" aria-live="polite">
        {words.length ? `"${q.trim()}" 찾은 용어 ` : ""}
        <span className="tabular-nums">{total}</span>개
      </p>
      {shown.length === 0 ? <p className="py-16 text-center text-[16px] text-[#5b6370]">찾는 용어가 없습니다. 형태를 설명하는 말로 다시 검색하십시오.</p> : null}
      <div className="space-y-12">
        {shown.map((g) => (
          <section key={g.id} aria-labelledby={`${g.id}-h`} className="mt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-[#15171c] pb-3">
              <h2 id={`${g.id}-h`} className="text-[20px] font-[800] tracking-[-0.03em]">
                {g.title} {words.length ? <span className="text-[14px] font-bold text-[#5b6370]">{g.sec}</span> : null}
              </h2>
              {g.post ? (
                <a href={g.post} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[14px] font-bold text-[#256ef4] hover:underline">
                  글로 자세히 보기 <ArrowUpRight size={15} aria-hidden />
                  <span className="sr-only">(새 창 열림)</span>
                </a>
              ) : null}
            </div>
            <ul role="list" className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {g.terms.map((t) => (
                <li key={t.id} id={t.id} className="flex min-w-0 scroll-mt-28 flex-col gap-2 rounded-md border border-[#e1e5eb] bg-white p-5 target:border-[#256ef4] target:ring-2 target:ring-[#256ef4]/20">
                  <h3 className="text-[18px] font-[800] tracking-[-0.02em]">{t.name}</h3>
                  <p className="text-[14px] text-[#5b6370]">{t.alt}</p>
                  <dl className="grid grid-cols-[5.2em_1fr] gap-x-2 gap-y-1 text-[15px] leading-[1.55]">
                    <dt className="text-[#5b6370]">{termLabels[g.sec][0]}</dt>
                    <dd className="min-w-0">{t.look}</dd>
                    <dt className="text-[#5b6370]">{termLabels[g.sec][1]}</dt>
                    <dd className="min-w-0">{t.use}</dd>
                  </dl>
                  {t.say ? (
                    <p className="mt-1 rounded bg-[#eef3ff] px-3 py-2.5 text-[15px] leading-[1.55]">
                      <span className="mb-0.5 block text-[12px] font-bold text-[#256ef4]">요청 예시</span>"{t.say}"
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
