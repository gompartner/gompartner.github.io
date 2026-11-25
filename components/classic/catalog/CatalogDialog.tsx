"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { LongShot } from "@/components/classic/board/LongShot";

// 카탈로그 화면 한 장을 크게 보는 팝업과 그림 틀. 카탈로그 판(CatalogBoard)과 통합검색 결과(SearchResults)가 함께 쓴다.
// 11-26 사용자 "검색에서 레이어팝업을 닫으면 통합검색이 유지되도록": 검색 결과에서는 카탈로그로 옮겨 가지 않고 그 자리에서 이 팝업을 연다.

/** long: 페이지 전체를 찍은 긴 캡처(있으면 창 안에서 저절로 내려가며 보여 주고, 크게 보기에서는 통째로 편다) */
export type Shot = { src: string; frame: "browser" | "scene" | "phone" | "screen"; ratio: string; alt: string; long?: { src: string; w: number; h: number } };
/** tag: 연도와 기법처럼 제목 옆에 붙는 이름표(그 해의 연출로 만든 화면) */
export type CatalogItem = { id: string; cat: string; title: string; thumb: string; main: Shot; side?: Shot; features: string[]; tag?: string };
export type CatalogStoryView = CatalogItem & { headline: string; wantLabel: string; want: string; think: string; made: string };

/** 그림 한 장을 브라우저, 휴대폰, 키오스크 틀에 넣는다. scene은 기기를 이미 담은 그림이라 테두리만 둔다 */
export function Frame({ shot, sizes, full = false }: { shot: Shot; sizes: string; full?: boolean }) {
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

/** 크게 보기 팝업. item이 있으면 열리고, 닫으면 onClose를 부른다. PC와 모바일 화면을 골라 한 장씩 본다 */
export function CatalogDialog({ item, onClose, start = "main" }: { item: CatalogItem | null; onClose: () => void; start?: "main" | "side" }) {
  const dlg = useRef<HTMLDialogElement>(null);
  // 11-26 사용자 "선택해서 볼 수 있도록, 지금은 스크롤이 너무 길어요"
  const [view, setView] = useState<"main" | "side">("main");
  const [shownId, setShownId] = useState<string | null>(null);
  // 다른 화면을 열 때마다 고른 쪽(기본은 PC 화면)부터 보여 준다
  if ((item?.id ?? null) !== shownId) {
    setShownId(item?.id ?? null);
    if (item) setView(start === "side" && item.side ? "side" : "main");
  }
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (item && !d.open) {
      d.showModal();
      // 열릴 때 첫 버튼(닫기)에 파란 초점 테두리가 뜨지 않게 팝업 자신에 초점을 둔다. 키보드는 Tab으로 이어 간다
      d.focus();
    }
    if (!item && d.open) d.close();
  }, [item]);
  return (
    // keep-light: 옛 밝은 페이지(통합검색 등)에서도 어두운 화면 색표가 팝업 안 색을 다시 바꾸지 않게 한다
    <div className="keep-light">
      <dialog ref={dlg} tabIndex={-1} onClose={() => onClose()} onClick={(e) => e.target === dlg.current && onClose()} aria-labelledby="ct-dlg-title" className="outline-none focus:outline-none m-auto w-[min(1180px,calc(100vw-24px))] max-w-none rounded-[24px] bg-[#121722] p-0 text-white backdrop:bg-black/80">
        {item && (
          // 제목과 닫기는 위에 붙여 두고 그림만 스크롤한다(11-26 사용자 "제목이 고정이 아니라서 모바일에서 닫기 불편")
          <div className="flex max-h-[calc(100dvh-24px)] flex-col">
            {/* 휴대폰을 가로로 눕힌 낮은 화면(높이 520 아래)에서는 제목, 화면 종류, 닫기를 한 줄에 둔다. 두 줄이면 그림 볼 자리가 절반도 안 남는다 */}
            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 border-b border-white/12 [@media(max-height:520px)]:grid-cols-[minmax(0,1fr)_auto_auto] [@media(max-height:520px)]:items-center">
              <div className="order-1 px-5 py-4 md:px-8 md:py-5 [@media(max-height:520px)]:flex [@media(max-height:520px)]:items-baseline [@media(max-height:520px)]:gap-2 [@media(max-height:520px)]:py-1.5 [@media(max-height:520px)]:pl-4 [@media(max-height:520px)]:pr-0">
                <p className="shrink-0 text-[14px] font-bold text-[#7aa7ff]">
                  {item.cat}
                  {item.tag ? ` | ${item.tag}` : ""}
                </p>
                <h2 id="ct-dlg-title" className="mt-1 break-keep text-[22px] font-[800] leading-[1.3] tracking-[-0.04em] md:text-[28px] [@media(max-height:520px)]:mt-0 [@media(max-height:520px)]:truncate [@media(max-height:520px)]:text-[18px]">
                  {item.title}
                </h2>
              </div>
              <button type="button" onClick={() => onClose()} aria-label="닫기" className="order-2 mr-3 mt-3 grid h-11 w-11 shrink-0 place-items-center rounded-full text-white hover:bg-white/10 md:mr-6 md:mt-4 [@media(max-height:520px)]:order-3 [@media(max-height:520px)]:mr-2 [@media(max-height:520px)]:mt-0">
                <X size={22} aria-hidden />
              </button>
              {item.side && (
                <div className="order-3 col-span-2 flex gap-2 border-t border-white/12 px-5 py-3 md:px-8 [@media(max-height:520px)]:order-2 [@media(max-height:520px)]:col-span-1 [@media(max-height:520px)]:border-t-0 [@media(max-height:520px)]:p-0" role="tablist" aria-label="화면 종류">
                  {([["main", item.main.frame === "browser" ? "PC" : "전체"], ["side", item.side.frame === "screen" ? "키오스크" : "모바일"]] as const).map(([k, label]) => (
                    <button key={k} type="button" role="tab" aria-selected={view === k} onClick={() => setView(k)} className={`min-h-11 rounded-full px-5 text-[15px] font-bold transition-colors [@media(max-height:520px)]:px-4 ${view === k ? "bg-white text-[#0b0d12]" : "border border-white/25 text-white hover:border-white"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div key={view} className="min-h-0 overflow-y-auto p-5 md:p-8 [@media(max-height:520px)]:p-3">
            {view === "side" && item.side ? (
              <span className="mx-auto block w-full max-w-[420px]">
                <Frame shot={item.side} sizes="(min-width: 768px) 420px, 94vw" full />
              </span>
            ) : (
              <Frame shot={item.main} sizes="(min-width: 768px) 1100px, 94vw" full />
            )}
            {item.features.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2 border-t border-white/12 pt-5" role="list" aria-label="구성">
                {item.features.map((f) => (
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
    </div>
  );
}
