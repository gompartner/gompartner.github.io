"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { markReturning } from "@/lib/listReturn";
import { ArrowLeft, CircleHelp, ExternalLink, Info, LayoutDashboard, X } from "lucide-react";

// 휴대폰에서 데모 아래 도구(제작비, 만든 이야기, 사용법, 다른 샘플)를 버튼 하나와 아래 시트로 묶는다.
// 버튼은 오른쪽 아래에 두고, 데모 자체의 하단 고정 바(장바구니, 신청 버튼)가 있으면 그 위로 올린다.

/** 화면 맨 아래에 붙은 데모의 고정 바 높이. 없으면 0. */
function bottomBarHeight(own: HTMLElement | null): number {
  const vh = window.innerHeight;
  let top = vh;
  for (const x of [24, window.innerWidth / 2, window.innerWidth - 24]) {
    for (const el of document.elementsFromPoint(x, vh - 6)) {
      if (own?.contains(el)) continue;
      for (let n: HTMLElement | null = el as HTMLElement; n && n !== document.body; n = n.parentElement) {
        if (getComputedStyle(n).position !== "fixed") continue;
        // 화면 아래에 붙은 넓은 바만 친다(떠 있는 작은 버튼, 표의 고정 칸은 빼고)
        const r = n.getBoundingClientRect();
        if (r.bottom >= vh - 40 && r.width >= window.innerWidth * 0.6) top = Math.min(top, r.top);
        break;
      }
    }
  }
  return Math.max(vh - top, 0);
}

export function MobileDemoSheet({
  projectId,
  priceLabel,
  plan,
  story,
  blogUrl,
  adminHref,
  backHref: back,
  hasTour,
  fresh,
  onTour,
}: {
  projectId: string;
  priceLabel: string;
  plan: ReactNode;
  story?: string[];
  blogUrl?: string;
  adminHref?: string;
  backHref: string;
  hasTour: boolean;
  fresh: boolean;
  onTour: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"plan" | "story">("plan");
  const [lift, setLift] = useState(0);
  const [drag, setDrag] = useState(0);
  const own = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);

  // 데모 하단 바 위로 버튼을 올린다. 스크롤하면 바가 생기거나 사라지는 데모도 있다.
  useEffect(() => {
    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setLift(bottomBarHeight(own.current)));
    };
    sync();
    const timer = window.setInterval(sync, 1000);
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(timer);
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setDrag(0);
  };

  const tabBtn = (id: "plan" | "story", label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => setTab(id)}
      className={`h-10 flex-1 rounded-lg text-[15px] font-bold transition-colors ${tab === id ? "bg-white text-[#1d2327] shadow-sm" : "text-[#5a6670]"}`}
    >
      {label}
    </button>
  );

  return (
    <div ref={own} className="md:hidden print:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-gtm-cta={`demo_sheet_${projectId}`}
        aria-haspopup="dialog"
        className="fixed right-4 z-50 inline-flex h-11 items-center gap-2 rounded-full border-[2.5px] border-[#1d1d1f] bg-[#fffdf8] pl-3.5 pr-4 text-[15px] font-bold text-[#1d1d1f] shadow-[3px_3px_0_#1d1d1f] transition-[bottom] duration-200"
        style={{ bottom: `calc(${lift}px + 12px + env(safe-area-inset-bottom))` }}
      >
        <span className="relative">
          <Info size={18} aria-hidden />
          {fresh && hasTour && <span aria-hidden className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#4ade80] ring-2 ring-[#fffdf8]" />}
        </span>
        {priceLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[75]" role="dialog" aria-modal="true" aria-label="샘플 정보">
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <div
            className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-[12px] border-t-[3px] border-[#1d1d1f] bg-[#fffdf8] text-[15px] leading-[1.6] text-[#1d1d1f]"
            style={{ transform: `translateY(${drag}px)`, paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            {/* 손잡이를 아래로 끌면 닫힌다 */}
            <div
              className="flex touch-none items-center justify-between px-5 pb-2 pt-3"
              onPointerDown={(e) => {
                startY.current = e.clientY;
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => startY.current !== null && setDrag(Math.max(e.clientY - startY.current, 0))}
              onPointerUp={() => {
                startY.current = null;
                if (drag > 80) close();
                else setDrag(0);
              }}
            >
              <span className="w-8" />
              <span aria-hidden className="h-1.5 w-10 rounded-full bg-black/15" />
              <button type="button" autoFocus onClick={close} aria-label="닫기" className="-mr-2 flex h-9 w-9 items-center justify-center rounded-full text-[#5a6670]">
                <X size={20} aria-hidden />
              </button>
            </div>

            {story?.length ? (
              <div role="tablist" className="mx-5 flex gap-1 rounded-xl bg-[#f1f3f5] p-1">
                {tabBtn("plan", "제작비")}
                {tabBtn("story", "만든 이야기")}
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-4">
              {tab === "plan" || !story?.length ? (
                plan
              ) : (
                <>
                  <div className="space-y-2 text-[#3d474f]">
                    {story.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                  {blogUrl && (
                    <a
                      href={blogUrl}
                      target="_blank"
                      rel="noopener"
                      data-gtm-cta={`story_blog_${projectId}`}
                      className="mt-4 inline-flex items-center gap-1.5 font-bold text-[#256ef4]"
                    >
                      블로그 글
                      <ExternalLink size={15} aria-hidden />
                    </a>
                  )}
                </>
              )}
            </div>

            <nav aria-label="샘플 이동" className="grid auto-cols-fr grid-flow-col border-t-[3px] border-[#1d1d1f]">
              <Link href={back} onClick={markReturning} className="flex h-14 flex-col items-center justify-center gap-0.5 text-[13px] font-bold text-[#3d474f]">
                <ArrowLeft size={18} aria-hidden />
                다른 샘플
              </Link>
              {adminHref && (
                <Link href={adminHref} prefetch={false} className="flex h-14 flex-col items-center justify-center gap-0.5 text-[13px] font-bold text-[#3d474f]">
                  <LayoutDashboard size={18} aria-hidden />
                  관리자 화면
                </Link>
              )}
              {hasTour && (
                <button
                  type="button"
                  onClick={() => {
                    close();
                    onTour();
                  }}
                  className="relative flex h-14 flex-col items-center justify-center gap-0.5 text-[13px] font-bold text-[#15803d]"
                >
                  <CircleHelp size={18} aria-hidden />
                  사용법 보기
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
