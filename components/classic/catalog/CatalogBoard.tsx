"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Maximize2, Search } from "lucide-react";
import { CatalogDialog, Frame, type CatalogItem, type CatalogStoryView } from "@/components/classic/catalog/CatalogDialog";
import { BoardClose, BoardShell } from "@/components/classic/board/ui";

// 11-26 카탈로그 한 판(사용자 "기대한 것, 불편한 점을 모아 어떤 고민을 해서 결과를 만들었는지. 잘 이야기하고 진열을 잘하는 게 중요. 이미지 대충 넣지 말고").
// 배치 셋을 놓고 골랐다.
// (1) 왼쪽 목록에서 하나를 고르면 오른쪽 무대가 바뀌는 판: 제작 판과 같은 모양이지만 누르지 않으면 이야기 열 개가 숨는다.
// (2) 이야기 카드 격자 + 누르면 팝업: 격자에서는 그림이 다시 작아지고, 이야기가 팝업 안으로 들어가 버린다.
// (3) 화면 하나에 판 하나, 아래로 이어 보기: 찾는 것, 고민한 것, 만든 화면이 큰 그림 옆에 처음부터 펼쳐져 있다.
// (3)으로 했다. 내려가며 읽기만 하면 이야기가 다 보이고, PC와 휴대폰 화면을 틀에 넣어 크게 둘 자리가 나온다.
// 길어지는 것은 맨 위 종류 버튼으로 줄인다(이야기와 아래 격자를 함께 거른다). 나머지 화면은 아래에 작은 격자로 두고 8개만 먼저 보여 준다.

export type { CatalogItem, CatalogStoryView, Shot } from "@/components/classic/catalog/CatalogDialog";

const css = `
/* 내려가며 볼 때 그림이 제자리로 올라온다. 글자와 그림은 처음부터 다 보이고(투명하게 숨기지 않는다), 지원하지 않는 브라우저에서는 그냥 서 있다 */
@keyframes ct-main { from { transform: translateY(26px) scale(.975); } to { transform: none; } }
@keyframes ct-side { from { transform: translateY(18%); } to { transform: none; } }
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .ct-main { animation: ct-main linear both; animation-timeline: view(); animation-range: entry 0% entry 70%; }
    .ct-side { animation: ct-side linear both; animation-timeline: view(); animation-range: entry 0% cover 42%; }
  }
}
`;

/** 휴대폰 폭에서 PC 화면과 모바일 화면을 좌우로 넘겨 보는 띠. 그림을 누르면 그쪽 화면부터 크게 본다 */
function Swipe({ s, onOpen }: { s: CatalogStoryView; onOpen: (v: "main" | "side") => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState<"main" | "side">("main");
  const onScroll = () => {
    const el = ref.current;
    if (el) setAt(el.scrollLeft > (el.scrollWidth - el.clientWidth) / 2 ? "side" : "main");
  };
  const go = (v: "main" | "side") => {
    const el = ref.current;
    if (el) el.scrollTo({ left: v === "side" ? el.scrollWidth : 0, behavior: "smooth" });
  };
  const name = `${s.title}${s.tag ? ` ${s.tag}` : ""}`;
  const side = s.side!;
  const sideLabel = side.frame === "screen" ? "키오스크" : "모바일";
  return (
    <>
      <div ref={ref} onScroll={onScroll} role="group" aria-label={`${name} PC 화면과 ${sideLabel} 화면`} className="-mx-5 flex snap-x snap-mandatory items-center gap-3 overflow-x-auto overscroll-x-contain px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button type="button" onClick={() => onOpen("main")} aria-label={`${name} PC 화면 크게 보기`} className="block w-[86%] shrink-0 snap-center text-left">
          <Frame shot={{ ...s.main, ratio: s.main.frame === "browser" && !s.main.video ? "4/3" : s.main.ratio }} sizes="86vw" />
        </button>
        <button type="button" onClick={() => onOpen("side")} aria-label={`${name} ${sideLabel} 화면 크게 보기`} className="flex w-[86%] shrink-0 snap-center justify-center">
          <span className="block w-[50%]">
            <Frame shot={side} sizes="45vw" />
          </span>
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex gap-1.5" role="group" aria-label="화면 종류">
          {(["main", "side"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={at === v} onClick={() => go(v)} className={`min-h-10 rounded-full px-4 text-[14px] font-bold transition-colors ${at === v ? "bg-white text-[#0b0d12]" : "border border-white/25 text-white"}`}>
              {v === "main" ? "PC" : sideLabel}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => onOpen(at)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 px-4 text-[14px] font-bold text-white">
          <Maximize2 size={15} aria-hidden /> 크게 보기
        </button>
      </div>
    </>
  );
}

export function CatalogBoard({ stories, trends, rest, cats, total }: { stories: CatalogStoryView[]; trends: CatalogStoryView[]; rest: CatalogItem[]; cats: { name: string; count: number }[]; total: number }) {
  const [cat, setCat] = useState("전체");
  const [more, setMore] = useState(false);
  // 낱말로 찾기는 통합검색에 맡긴다(종류 필터를 카탈로그로 맞춰서 넘긴다). 거기서 화면을 눌러도 그 자리에서 크게 열리고, 닫으면 검색이 그대로 남는다
  const router = useRouter();
  const [q, setQ] = useState("");
  const find = (e: React.FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    router.push(t ? `/search?q=${encodeURIComponent(t)}&kind=${encodeURIComponent("카탈로그")}` : "/search");
  };
  const [open, setOpen] = useState<CatalogItem | null>(null);
  // 크게 보기에서 먼저 보여 줄 쪽(휴대폰에서 모바일 화면을 넘겨 보다 누르면 모바일부터)
  const [openView, setOpenView] = useState<"main" | "side">("main");
  const show = (it: CatalogItem, v: "main" | "side" = "main") => {
    setOpenView(v);
    setOpen(it);
  };
  const told = cat === "전체" ? stories : stories.filter((s) => s.cat === cat);
  const byYear = cat === "전체" ? trends : trends.filter((s) => s.cat === cat);
  const others = cat === "전체" ? rest : rest.filter((i) => i.cat === cat);

  // 통합검색 결과(/works#id)로 들어오면 그 화면을 바로 크게 연다
  useEffect(() => {
    const byHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const it = id ? [...stories, ...trends, ...rest].find((i) => i.id === id) : undefined;
      if (it) show(it);
    };
    byHash();
    window.addEventListener("hashchange", byHash);
    return () => window.removeEventListener("hashchange", byHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // 이야기와 함께 보는 판 하나(대표 화면, 그 해의 연출로 만든 화면이 함께 쓴다)
  const board = (s: CatalogStoryView, i: number) => {
          const steps = [
            { label: s.wantLabel, text: s.want, c: "#ffd84d" },
            { label: "고민한 것", text: s.think, c: "#7aa7ff" },
            { label: "만든 화면", text: s.made, c: "#ffffff" },
          ];
          return (
            <article key={s.id} className="bd-in grid gap-x-12 gap-y-6 rounded-[24px] border border-white/12 bg-[#121722] p-5 md:rounded-[28px] md:p-9 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:grid-rows-[auto_1fr] lg:p-11" style={{ "--d": `${Math.min(i, 3) * 0.05}s` } as React.CSSProperties}>
              <header className="lg:col-start-1 lg:row-start-1">
                <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] font-bold md:text-[15px]">
                  <span className="tabular-nums text-white/55">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[#7aa7ff]">{s.cat}</span>
                  <span aria-hidden className="h-3 w-px bg-white/25" />
                  <span className="text-[#c9ced6]">{s.title}</span>
                  {s.tag ? <span className="rounded-full bg-[#ffd84d] px-2.5 py-0.5 text-[13px] font-[800] text-[#0b0d12]">{s.tag}</span> : null}
                </p>
                <h2 className="mt-3 break-keep text-[25px] font-[800] leading-[1.3] tracking-[-0.045em] md:text-[34px]">{s.headline}</h2>
              </header>

              <div className="self-center lg:col-start-2 lg:row-span-2 lg:row-start-1">
                {/* 휴대폰: PC 화면과 모바일 화면을 겹쳐 두지 않고 좌우로 넘겨 본다(11-26 사용자 "모바일에서는 좌우로 슬라이드 하면서") */}
                {s.side ? (
                  <div className="sm:hidden">
                    <Swipe s={s} onOpen={(v) => show(s, v)} />
                  </div>
                ) : null}
                <button type="button" onClick={() => show(s)} aria-label={`${s.title}${s.tag ? ` ${s.tag}` : ""} 화면 크게 보기`} className={`group w-full text-left ${s.side ? "hidden sm:block" : "block"}`}>
                  <span className={`relative block ${s.side ? "pb-[20%] pr-[4%] sm:pb-[9%] sm:pr-[7%]" : ""}`}>
                    <span className="ct-main block">
                      <Frame shot={s.main} sizes="(min-width: 1024px) 640px, 92vw" />
                    </span>
                    {s.side && (
                      <span className="ct-side absolute bottom-0 right-0 block w-[31%] sm:w-[25%]">
                        <span className="block transition-transform duration-500 group-hover:-translate-y-2 motion-reduce:transition-none">
                          <Frame shot={s.side} sizes="(min-width: 1024px) 180px, 32vw" />
                        </span>
                      </span>
                    )}
                    <span className={`inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 px-4 text-[14px] font-bold text-white group-hover:border-white ${s.side ? "absolute bottom-0 left-0" : "mt-4"}`}>
                      <Maximize2 size={15} aria-hidden /> 크게 보기
                    </span>
                  </span>
                </button>
              </div>

              <ol className="lg:col-start-1 lg:row-start-2" role="list">
                {steps.map((st, n) => (
                  <li key={st.label} className="grid grid-cols-[16px_1fr] gap-3 pb-5 last:pb-0 md:pb-6">
                    <span aria-hidden className="relative flex justify-center">
                      <i className="mt-[6px] h-2.5 w-2.5 rounded-full" style={{ background: st.c }} />
                      {n < 2 && <i className="absolute bottom-[-26px] top-[22px] w-px bg-white/15" />}
                    </span>
                    <div>
                      <p className="text-[14px] font-bold md:text-[15px]" style={{ color: st.c }}>
                        {st.label}
                      </p>
                      <p className={`mt-1 break-keep text-[16px] leading-[1.68] ${n === 2 ? "text-white" : "text-[#c9ced6]"}`}>
                        {/* 적용한 트렌드: 용어마다 위키 용어 설명으로 잇는다(11-26). 용어집에 없는 말은 글자 그대로 */}
                        {n === 0 && s.wantLinks
                          ? s.wantLinks.map((w, k) => (
                              <Fragment key={w.name}>
                                {k > 0 ? ", " : null}
                                {w.href ? (
                                  <Link href={w.href} className="text-white underline decoration-white/45 underline-offset-4 hover:decoration-white">
                                    {w.name}
                                  </Link>
                                ) : (
                                  w.name
                                )}
                              </Fragment>
                            ))
                          : st.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          );
  };

  // 11-26 제목 "찾는 것을 첫 화면에 둡니다"는 무엇을 두는지 알 수 없어(사용자 "문구 점검") 페이지 이름 그대로 "업종별 화면 카탈로그". 공유 카드, 메타 제목과 같다
  // 제목 뒷부분은 줄바꿈 없는 공백으로 묶었다. 휴대폰에서 "업종별 / 화면 카탈로그" 두 줄로 나뉜다
  return (
    <BoardShell no="04" en="CATALOG" ice="업종별 " title={"화면\u00a0카탈로그"} lead="업종마다 방문자가 찾는 정보를 조사해 첫 화면에 먼저 보이게 만들었습니다.">
      <style>{css}</style>

      <div className="-mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:mt-14 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden" role="group" aria-label="종류">
        {[{ name: "전체", count: total }, ...cats].map((c) => (
          <button
            key={c.name}
            type="button"
            aria-pressed={cat === c.name}
            onClick={() => setCat(c.name)}
            className={`min-h-12 shrink-0 whitespace-nowrap rounded-full border px-5 text-[16px] font-[800] tracking-[-0.03em] transition-colors md:text-[17px] ${cat === c.name ? "border-white bg-white text-[#0b0d12]" : "border-white/20 text-white/70 hover:border-white/60 hover:text-white"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <form role="search" onSubmit={find} className="mt-4 flex h-12 max-w-[460px] items-center gap-2.5 overflow-hidden rounded-full border border-white/30 bg-[#121722] pl-4 pr-1.5 text-white focus-within:border-white/70 md:mt-5">
        <Search size={18} aria-hidden className="shrink-0 text-[#aab2bf]" />
        <label htmlFor="ct-q" className="sr-only">
          카탈로그 검색
        </label>
        <input id="ct-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="업종이나 화면 이름 (예: 치과, 랜딩)" autoComplete="off" enterKeyHint="search" className="on-dark h-full min-w-0 flex-1 bg-transparent text-[16px] text-white outline-none placeholder:text-[#8a94a6] [&::-webkit-search-cancel-button]:hidden" />
        <button type="submit" className="gp-ghost h-9 shrink-0 rounded-full px-4 text-[14px] font-bold">
          검색
        </button>
      </form>

      {/* 웹 트렌드를 반영한 화면을 맨 위에 둔다(11-26 사용자 "문구도 이상하고, 고친 후 위로 올려 줘"). 같은 병원 홈페이지를 그 해의 트렌드로 만든 다섯 장 */}
      {byYear.length > 0 && (
        <section className="mt-10 md:mt-14" aria-labelledby="ct-year">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
            <h2 id="ct-year" className="text-[24px] font-[800] tracking-[-0.045em] md:text-[32px]">
              웹 트렌드를 반영한 화면
            </h2>
            <p className="max-w-[440px] break-keep text-[15px] leading-[1.7] text-[#aab2bf] md:text-[16px]">병원 홈페이지에 3D, 스크롤 인터랙션, 타이포그래피 연출을 적용한 화면입니다.</p>
          </div>
          <div className="mt-5 space-y-4 md:mt-6 md:space-y-5">{byYear.map((s, i) => board(s, i))}</div>
        </section>
      )}

      {/* 이야기와 함께 보는 화면: 화면 하나에 판 하나 */}
      {told.length > 0 && (
        <section className={byYear.length > 0 ? "mt-14 md:mt-20" : "mt-6"} aria-labelledby="ct-told">
          <h2 id="ct-told" className={byYear.length > 0 ? "text-[24px] font-[800] tracking-[-0.045em] md:text-[32px]" : "sr-only"}>
            업종별 대표 화면
          </h2>
          <div key={cat} className={`space-y-4 md:space-y-5 ${byYear.length > 0 ? "mt-5 md:mt-6" : ""}`}>
            {told.map((s, i) => board(s, i))}
          </div>
        </section>
      )}

      {/* 나머지 화면: 접어 둔다(11-26 사용자 "카탈로그가 많다고 좋은 건 아니니까", "접기 넣고 숫자 빼고"). 펼치면 작은 그림으로 나오고 누르면 크게 */}
      {others.length > 0 && (
        <section className="mt-14 md:mt-20" aria-labelledby="ct-rest">
          <h2 id="ct-rest" className="sr-only">
            업종별 화면
          </h2>
          <button type="button" aria-expanded={more} aria-controls="ct-rest-list" onClick={() => setMore((v) => !v)} className="flex w-full items-center justify-between gap-4 rounded-[20px] border border-white/15 px-5 py-5 text-left hover:border-white/40 md:rounded-[24px] md:px-8 md:py-6">
            <span>
              <span className="block text-[20px] font-[800] tracking-[-0.04em] md:text-[24px]">업종별 화면 {more ? "접기" : "더 보기"}</span>
              <span className="mt-1 block break-keep text-[15px] leading-[1.6] text-[#aab2bf] md:text-[16px]">병원, 매장, 전문직, 기업, 학원 화면을 업종별로 모았습니다.</span>
            </span>
            <ChevronDown size={24} aria-hidden className={`shrink-0 transition-transform motion-reduce:transition-none ${more ? "rotate-180" : ""}`} />
          </button>
          {more && (
            <ul id="ct-rest-list" className="mt-4 grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-3 md:gap-4 lg:grid-cols-4" role="list">
              {others.map((it) => (
                <li key={it.id}>
                  <button type="button" onClick={() => show(it)} className="group block h-full w-full overflow-hidden rounded-[18px] border border-white/12 bg-[#121722] text-left hover:border-[#7aa7ff] md:rounded-[20px]">
                    <span className="relative block aspect-[16/10] overflow-hidden bg-[#0f131b]">
                      <Image src={it.thumb} alt={`${it.title} 화면`} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none" />
                    </span>
                    <span className="block p-3 md:p-4">
                      <span className="block text-[13px] font-bold text-[#7aa7ff]">{it.cat}</span>
                      <span className="mt-0.5 block break-keep text-[15px] font-[800] leading-[1.35] tracking-[-0.03em] md:text-[17px]">{it.title}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <CatalogDialog item={open} start={openView} onClose={() => setOpen(null)} />

      <BoardClose text="비슷한 화면이 필요하시면 업종과 요청 사항을 남겨 주세요." />
    </BoardShell>
  );
}
