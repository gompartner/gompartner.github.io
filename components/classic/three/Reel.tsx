"use client";

import { useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 11-26 3D 화면 카드 줄. 넓은 화면에서는 두 칸 격자로 펼쳐 두고, 휴대폰에서는 옆으로 넘겨 본다(한 장씩 가운데에 멈춘다).
// 휴대폰에서는 아래에 지금 몇 번째인지와 앞뒤 버튼을 둔다. 저절로 넘어가지 않는다.
export function Reel({ count, label, children }: { count: number; label: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [at, setAt] = useState(0);
  const cards = () => Array.from(ref.current?.children ?? []) as HTMLElement[];
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    const i = cards().findIndex((c) => c.offsetLeft + c.offsetWidth > mid);
    setAt(i < 0 ? count - 1 : i);
  };
  const go = (i: number) => {
    const el = ref.current;
    const c = cards()[i];
    if (el && c) el.scrollTo({ left: c.offsetLeft - (el.clientWidth - c.offsetWidth) / 2, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const round = "grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white disabled:opacity-35";
  return (
    <>
      <ul ref={ref} onScroll={onScroll} role="list" aria-label={label} className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
        {children}
      </ul>
      <div className="mt-4 flex items-center justify-between md:hidden">
        <p className="text-[15px] font-bold tabular-nums text-[#aab2bf]" aria-live="polite">
          <span className="text-white">{at + 1}</span> / {count}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(at - 1)} disabled={at === 0} aria-label="이전 화면" className={round}>
            <ChevronLeft size={20} aria-hidden />
          </button>
          <button type="button" onClick={() => go(at + 1)} disabled={at === count - 1} aria-label="다음 화면" className={round}>
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>
      </div>
    </>
  );
}
