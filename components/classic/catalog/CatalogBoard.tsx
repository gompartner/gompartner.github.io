"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { BoardClose, BoardShell } from "@/components/classic/board/ui";

// 11-26 카탈로그 한 판. 방향 셋: (1) 업종별 목록 12쪽 + 데모 195개(지금) (2) 대표작 몇 개만 (3) 화면을 그림으로 진열하고 종류로 거르는 판.
// 데모, 샘플 주소는 내리기로 했으므로(사용자) 눌러서 들어가는 화면이 없다. 그래서 (3): 한 판에 화면을 깔고, 누르면 그 자리에서 크게 보며 구성을 읽는다.

export type CatalogItem = { id: string; cat: string; title: string; desc: string; features: string[]; thumb: string; big: string };

export function CatalogBoard({ items, cats }: { items: CatalogItem[]; cats: string[] }) {
  const [cat, setCat] = useState("전체");
  const [open, setOpen] = useState<CatalogItem | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const list = cat === "전체" ? items : items.filter((i) => i.cat === cat);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <BoardShell no="04" en="CATALOG" ice="이런 " title="화면을 만듭니다" lead="종류를 고르고, 화면을 누르면 크게 볼 수 있습니다.">
      <div className="mt-10 flex flex-wrap gap-2 md:mt-14" role="group" aria-label="종류">
        {["전체", ...cats].map((c) => {
          const n = c === "전체" ? items.length : items.filter((i) => i.cat === c).length;
          return (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={`min-h-12 rounded-full border px-5 text-[16px] font-[800] tracking-[-0.03em] transition-colors md:text-[17px] ${cat === c ? "border-white bg-white text-[#0b0d12]" : "border-white/20 text-white/70 hover:border-white/60 hover:text-white"}`}>
              {c} <span className={`ml-1 text-[14px] font-bold tabular-nums ${cat === c ? "text-[#256ef4]" : "text-white/40"}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <ul key={cat} className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4" role="list">
        {list.map((it, i) => (
          <li key={it.id} className="bd-in" style={{ "--d": `${Math.min(i, 11) * 0.03}s` } as React.CSSProperties}>
            <button type="button" onClick={() => setOpen(it)} className="group block w-full overflow-hidden rounded-[20px] border border-white/12 bg-[#121722] text-left hover:border-[#7aa7ff]">
              <span className="relative block aspect-[16/10] overflow-hidden bg-[#0f131b]">
                <Image src={it.thumb} alt={`${it.title} 화면`} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none" />
              </span>
              <span className="block p-3 md:p-4">
                <span className="block text-[12px] font-bold text-[#7aa7ff] md:text-[13px]">{it.cat}</span>
                <span className="mt-0.5 block break-keep text-[15px] font-[800] leading-[1.35] tracking-[-0.03em] md:text-[17px]">{it.title}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog ref={dlg} onClose={() => setOpen(null)} onClick={(e) => e.target === dlg.current && setOpen(null)} className="m-auto w-[min(1100px,calc(100vw-24px))] rounded-[24px] bg-[#121722] p-0 text-white backdrop:bg-black/75">
        {open && (
          <div className="grid max-h-[calc(100dvh-24px)] overflow-y-auto lg:grid-cols-[1.5fr_1fr]">
            <span className="relative block aspect-[16/10] bg-[#0f131b] lg:aspect-auto lg:min-h-[520px]">
              <Image src={open.big} alt={`${open.title} 화면`} fill sizes="(min-width: 1024px) 660px, 100vw" className="object-cover object-top" />
            </span>
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[14px] font-bold text-[#7aa7ff]">{open.cat}</p>
                <button type="button" onClick={() => setOpen(null)} aria-label="닫기" className="-mr-2 -mt-2 grid h-11 w-11 place-items-center rounded-full text-white hover:bg-white/10">
                  <X size={22} aria-hidden />
                </button>
              </div>
              <h2 className="mt-1 break-keep text-[24px] font-[800] leading-[1.3] tracking-[-0.04em] md:text-[28px]">{open.title}</h2>
              <p className="mt-4 break-keep text-[16px] leading-[1.7] text-[#c9ced6]">{open.desc}</p>
              {open.features.length > 0 && (
                <ul className="mt-6 space-y-2 border-t border-white/12 pt-5" role="list">
                  {open.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 break-keep text-[15px] leading-[1.5]">
                      <i aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7aa7ff]" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </dialog>

      <BoardClose text="비슷한 화면이 필요하면 어떤 것인지 한 줄만 남겨 주세요." />
    </BoardShell>
  );
}
