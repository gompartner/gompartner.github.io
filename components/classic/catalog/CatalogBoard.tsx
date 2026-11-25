"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Maximize2, Plus, X } from "lucide-react";
import { LongShot } from "@/components/classic/board/LongShot";
import { BoardClose, BoardShell } from "@/components/classic/board/ui";

// 11-26 카탈로그 한 판(사용자 "기대한 것, 불편한 점을 모아 어떤 고민을 해서 결과를 만들었는지. 잘 이야기하고 진열을 잘하는 게 중요. 이미지 대충 넣지 말고").
// 배치 셋을 놓고 골랐다.
// (1) 왼쪽 목록에서 하나를 고르면 오른쪽 무대가 바뀌는 판: 제작 판과 같은 모양이지만 누르지 않으면 이야기 열 개가 숨는다.
// (2) 이야기 카드 격자 + 누르면 팝업: 격자에서는 그림이 다시 작아지고, 이야기가 팝업 안으로 들어가 버린다.
// (3) 화면 하나에 판 하나, 아래로 이어 보기: 찾는 것, 고민한 것, 만든 화면이 큰 그림 옆에 처음부터 펼쳐져 있다.
// (3)으로 했다. 내려가며 읽기만 하면 이야기가 다 보이고, PC와 휴대폰 화면을 틀에 넣어 크게 둘 자리가 나온다.
// 길어지는 것은 맨 위 종류 버튼으로 줄인다(이야기와 아래 격자를 함께 거른다). 나머지 화면은 아래에 작은 격자로 두고 8개만 먼저 보여 준다.

/** long: 페이지 전체를 찍은 긴 캡처(있으면 창 안에서 저절로 내려가며 보여 주고, 크게 보기에서는 통째로 편다) */
export type Shot = { src: string; frame: "browser" | "scene" | "phone" | "screen"; ratio: string; alt: string; long?: { src: string; w: number; h: number } };
export type CatalogItem = { id: string; cat: string; title: string; thumb: string; main: Shot; side?: Shot; features: string[] };
export type CatalogStoryView = CatalogItem & { headline: string; wantLabel: string; want: string; think: string; made: string };

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

/** 그림 한 장을 브라우저, 휴대폰, 키오스크 틀에 넣는다. scene은 기기를 이미 담은 그림이라 테두리만 둔다 */
function Frame({ shot, sizes, full = false }: { shot: Shot; sizes: string; full?: boolean }) {
  const img = shot.long ? (
    full ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={shot.long.src} alt={shot.alt} width={shot.long.w} height={shot.long.h} loading="lazy" decoding="async" className="block h-auto w-full" />
    ) : (
      <LongShot src={shot.long.src} alt={shot.alt} w={shot.long.w} h={shot.long.h} ratio={shot.ratio} />
    )
  ) : (
    <span className="relative block w-full bg-[#0f131b]" style={{ aspectRatio: shot.ratio }}>
      <Image src={shot.src} alt={shot.alt} fill sizes={sizes} className="object-cover object-top" />
    </span>
  );
  if (shot.frame === "browser")
    return (
      <span className="block overflow-hidden rounded-[10px] border border-white/15 bg-[#1b2130] shadow-[0_30px_70px_-24px_rgba(0,0,0,.85)] sm:rounded-[14px]">
        <span aria-hidden className="flex h-5 items-center gap-1 px-2.5 sm:h-8 sm:gap-1.5 sm:px-3.5">
          <i className="h-1.5 w-1.5 rounded-full bg-white/25 sm:h-2 sm:w-2" />
          <i className="h-1.5 w-1.5 rounded-full bg-white/25 sm:h-2 sm:w-2" />
          <i className="h-1.5 w-1.5 rounded-full bg-white/25 sm:h-2 sm:w-2" />
          <i className="ml-2 h-2 w-[38%] rounded-full bg-white/10 sm:ml-3 sm:h-3.5" />
        </span>
        {img}
      </span>
    );
  if (shot.frame === "phone")
    return <span className="block overflow-hidden rounded-[14px] border-[3px] border-[#2b3346] bg-[#0b0d12] shadow-[0_24px_50px_-12px_rgba(0,0,0,.9)] ring-1 ring-white/25 sm:rounded-[24px] sm:border-[5px]">{img}</span>;
  if (shot.frame === "screen")
    return <span className="block overflow-hidden rounded-[8px] border-[3px] border-[#e6eaf1] bg-white shadow-[0_24px_50px_-12px_rgba(0,0,0,.9)] sm:rounded-[12px] sm:border-[6px]">{img}</span>;
  return <span className="block overflow-hidden rounded-[10px] border border-white/15 shadow-[0_30px_70px_-24px_rgba(0,0,0,.85)] sm:rounded-[14px]">{img}</span>;
}

export function CatalogBoard({ stories, rest, cats, total }: { stories: CatalogStoryView[]; rest: CatalogItem[]; cats: { name: string; count: number }[]; total: number }) {
  const [cat, setCat] = useState("전체");
  const [more, setMore] = useState(false);
  const [open, setOpen] = useState<CatalogItem | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const told = cat === "전체" ? stories : stories.filter((s) => s.cat === cat);
  const others = cat === "전체" ? rest : rest.filter((i) => i.cat === cat);
  const shown = more ? others : others.slice(0, 8);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // 제목 뒷부분은 줄바꿈 없는 공백으로 묶었다. 휴대폰에서 "찾는 것을 / 첫 화면에 둡니다" 두 줄로 나뉜다
  return (
    <BoardShell no="04" en="CATALOG" ice="찾는 것을 " title={"첫\u00a0화면에\u00a0둡니다"} lead="업종마다 방문자가 무엇을 찾는지 조사하고, 그 답이 먼저 보이게 만든 화면입니다.">
      <style>{css}</style>

      <div className="-mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:mt-14 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden" role="group" aria-label="종류">
        {[{ name: "전체", count: total }, ...cats].map((c) => (
          <button
            key={c.name}
            type="button"
            aria-pressed={cat === c.name}
            onClick={() => {
              setCat(c.name);
              setMore(false);
            }}
            className={`min-h-12 shrink-0 whitespace-nowrap rounded-full border px-5 text-[16px] font-[800] tracking-[-0.03em] transition-colors md:text-[17px] ${cat === c.name ? "border-white bg-white text-[#0b0d12]" : "border-white/20 text-white/70 hover:border-white/60 hover:text-white"}`}
          >
            {c.name} <span className={`ml-1 text-[14px] font-bold tabular-nums ${cat === c.name ? "text-[#256ef4]" : "text-white/40"}`}>{c.count}</span>
          </button>
        ))}
      </div>

      {/* 이야기와 함께 보는 화면: 화면 하나에 판 하나 */}
      <div key={cat} className="mt-6 space-y-4 md:space-y-5">
        {told.map((s, i) => {
          const steps = [
            { label: s.wantLabel, text: s.want, c: "#ffd84d" },
            { label: "고민한 것", text: s.think, c: "#7aa7ff" },
            { label: "만든 화면", text: s.made, c: "#ffffff" },
          ];
          return (
            <article key={s.id} className="bd-in grid gap-x-12 gap-y-6 rounded-[24px] border border-white/12 bg-[#121722] p-5 md:rounded-[28px] md:p-9 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:grid-rows-[auto_1fr] lg:p-11" style={{ "--d": `${Math.min(i, 3) * 0.05}s` } as React.CSSProperties}>
              <header className="lg:col-start-1 lg:row-start-1">
                <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] font-bold md:text-[15px]">
                  <span className="tabular-nums text-white/40">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[#7aa7ff]">{s.cat}</span>
                  <span aria-hidden className="h-3 w-px bg-white/25" />
                  <span className="text-[#c9ced6]">{s.title}</span>
                </p>
                <h2 className="mt-3 break-keep text-[25px] font-[800] leading-[1.3] tracking-[-0.045em] md:text-[34px]">{s.headline}</h2>
              </header>

              <button type="button" onClick={() => setOpen(s)} aria-label={`${s.title} 화면 크게 보기`} className="group block w-full self-center text-left lg:col-start-2 lg:row-span-2 lg:row-start-1">
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
                      <p className={`mt-1 break-keep text-[16px] leading-[1.68] ${n === 2 ? "text-white" : "text-[#c9ced6]"}`}>{st.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          );
        })}
      </div>

      {/* 나머지 화면: 작은 그림으로 두고 누르면 크게 */}
      {others.length > 0 && (
        <section className="mt-14 md:mt-20" aria-labelledby="ct-rest">
          <h2 id="ct-rest" className="text-[24px] font-[800] tracking-[-0.045em] md:text-[32px]">
            이 밖에 만든 화면 <span className="ml-1 text-[18px] tabular-nums text-[#7aa7ff] md:text-[22px]">{others.length}</span>
          </h2>
          <ul className="mt-5 grid grid-cols-2 gap-3 md:mt-6 md:grid-cols-3 md:gap-4 lg:grid-cols-4" role="list">
            {shown.map((it) => (
              <li key={it.id}>
                <button type="button" onClick={() => setOpen(it)} className="group block h-full w-full overflow-hidden rounded-[18px] border border-white/12 bg-[#121722] text-left hover:border-[#7aa7ff] md:rounded-[20px]">
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
          {!more && others.length > shown.length && (
            <div className="mt-6 flex justify-center">
              <button type="button" onClick={() => setMore(true)} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-[16px] font-bold text-white hover:border-white">
                <Plus size={17} aria-hidden /> 더보기 <span className="tabular-nums text-white/50">{others.length - shown.length}</span>
              </button>
            </div>
          )}
        </section>
      )}

      <dialog ref={dlg} onClose={() => setOpen(null)} onClick={(e) => e.target === dlg.current && setOpen(null)} aria-labelledby="ct-dlg-title" className="m-auto w-[min(1180px,calc(100vw-24px))] max-w-none rounded-[24px] bg-[#121722] p-0 text-white backdrop:bg-black/80">
        {open && (
          // 제목과 닫기는 위에 붙여 두고 그림만 스크롤한다(11-26 사용자 "제목이 고정이 아니라서 모바일에서 닫기 불편")
          <div className="flex max-h-[calc(100dvh-24px)] flex-col">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/12 px-5 py-4 md:px-8 md:py-5">
              <div>
                <p className="text-[14px] font-bold text-[#7aa7ff]">{open.cat}</p>
                <h2 id="ct-dlg-title" className="mt-1 break-keep text-[22px] font-[800] leading-[1.3] tracking-[-0.04em] md:text-[28px]">
                  {open.title}
                </h2>
              </div>
              <button type="button" onClick={() => setOpen(null)} aria-label="닫기" className="-mr-2 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-white hover:bg-white/10">
                <X size={22} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto p-5 md:p-8">
            <div className={`grid gap-5 md:gap-7 ${open.main.long ? "items-start" : "items-end"} ${open.side ? "md:grid-cols-[minmax(0,1fr)_minmax(0,0.26fr)]" : ""}`}>
              <Frame shot={open.main} sizes="(min-width: 768px) 860px, 94vw" full />
              {open.side && (
                <span className="mx-auto block w-[62%] md:w-full">
                  <Frame shot={open.side} sizes="(min-width: 768px) 230px, 60vw" full />
                </span>
              )}
            </div>
            {open.features.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2 border-t border-white/12 pt-5" role="list" aria-label="구성">
                {open.features.map((f) => (
                  <li key={f} className="rounded-full border border-white/20 px-3.5 py-1.5 text-[15px] text-[#e3e7ee]">
                    {f}
                  </li>
                ))}
              </ul>
            )}
            </div>
          </div>
        )}
      </dialog>

      <BoardClose text="비슷한 화면이 필요하면 업종과 하려는 일을 한 줄만 남겨 주세요." />
    </BoardShell>
  );
}
