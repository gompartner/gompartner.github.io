"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, CircleHelp } from "lucide-react";
import type { TourStep } from "@/data/tours";

// 샘플 화면 위에는 '사용법 보기' 버튼 하나만 띄운다. 금액·만든 이야기·다른 샘플은 샘플 표지(/sample/[slug])가 맡는다.
// 사용법 가이드는 프라이빗 짐 데모(HomepageDemo)의 스포트라이트 가이드와 같은 방식이다.
// 버튼은 PC에서 왼쪽 아래, 휴대폰에서 오른쪽 아래에 두고, 데모 자체의 하단 고정 바가 있으면 그 위로 올린다.
// 곰파트너 쪽 버튼이라 업종 사이트와 섞이지 않게 웹툰 톤(크림 바탕·먹선·단단한 그림자)으로 둔다.
const pill =
  "inline-flex h-10 items-center gap-2 rounded-full border-[2.5px] border-[#1d1d1f] bg-[#fffdf8] px-4 text-sm font-bold text-[#1d1d1f] shadow-[3px_3px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 hover:bg-[#fff3b0] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none";

type Rect = { top: number; left: number; width: number; height: number };


/** 선택자로 찾은 요소가 제목이면 그 제목이 속한 구역 전체를 비춘다. */
function resolve(selector: string): HTMLElement | null {
  const el = document.querySelector<HTMLElement>(selector);
  // 숨겨진 화면(하위 화면에 있을 때의 첫 화면 등)에 있는 요소는 없는 것으로 본다
  if (!el || el.getClientRects().length === 0) return null;
  if (/^H[1-6]$/.test(el.tagName)) return el.closest<HTMLElement>("section") ?? el.parentElement;
  return el;
}

export function DemoDock({ projectId, tour }: { projectId: string; tour?: TourStep[] }) {
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [steps, setSteps] = useState<TourStep[]>([]);

  const open = (n: number, list = steps) => {
    const el = resolve(list[n].target);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
    setStep(n);
  };

  const close = () => {
    setStep(null);
    setRect(null);
  };

  // 화면에 실제로 있는 단계만 쓴다 (탭에 가려진 영역 등).
  // 하위 화면에 있어 안내할 영역이 없으면 데모에 첫 화면으로 돌아가라고 알리고 잠시 뒤 다시 찾는다.
  const start = useCallback(() => {
    const begin = () => {
      const list = (tour ?? []).filter((s) => resolve(s.target));
      if (!list.length) return false;
      resolve(list[0].target)?.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
      setSteps(list);
      setStep(0);
      return true;
    };
    if (begin()) return;
    window.dispatchEvent(new Event("demo:go-home"));
    window.setTimeout(begin, 350);
  }, [tour]);

  // 가이드는 자동으로 열지 않는다. 한 번도 열지 않았으면 물음표 버튼을 반짝여 알린다.
  const seenKey = `demo-guide-opened:${projectId}`;
  const [fresh, setFresh] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setFresh(!localStorage.getItem(seenKey));
      } catch {}
    });
    return () => cancelAnimationFrame(frame);
  }, [seenKey]);

  const openGuide = () => {
    setFresh(false);
    try {
      localStorage.setItem(seenKey, "1");
    } catch {}
    start();
  };

  // 가이드가 열려 있는 동안 비추는 영역 좌표를 스크롤·리사이즈에 맞춘다
  useEffect(() => {
    if (step === null) return;
    const el = resolve(steps[step].target);
    if (!el) return;
    const sync = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    sync();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("keydown", onKey);
    };
  }, [step, steps]);

  const current = step !== null ? steps[step] : null;
  const last = step !== null && step === steps.length - 1;

  return (
    <>
      {tour?.length ? <GuideButton fresh={fresh} onClick={openGuide} projectId={projectId} /> : null}

      {current && rect && (
        <div className="fixed inset-0 z-[70]" onClick={close} role="dialog" aria-modal="true" aria-label="사용법">
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-2xl border-2 border-[#16A34A] transition-all duration-300 motion-reduce:transition-none"
            style={(() => {
              // 영역이 화면보다 크거나 가장자리에 붙어도 테두리 네 변이 보이게 화면 안쪽으로 맞춘다
              const inset = 6;
              const left = Math.max(rect.left - 8, inset);
              const top = Math.max(rect.top - 8, inset);
              const right = Math.min(rect.left + rect.width + 8, window.innerWidth - inset);
              const bottom = Math.min(rect.top + rect.height + 8, window.innerHeight - inset);
              return {
                top,
                left,
                width: Math.max(right - left, 0),
                height: Math.max(bottom - top, 0),
                boxShadow: "0 0 0 9999px rgba(0,0,0,.55)",
              };
            })()}
          />
          <div
            className="absolute inset-x-0 bottom-6 mx-auto w-[min(92vw,380px)] rounded-[6px] border-[3px] border-[#1d1d1f] bg-[#fffdf8] p-5 text-[#1d1d1f] shadow-[5px_5px_0_#1d1d1f]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="font-bold">{current.title}</p>
              {steps.length > 1 && (
                <span className="text-xs tabular-nums text-stone-400">
                  {step! + 1} / {steps.length}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[15px] leading-relaxed text-stone-600">{current.desc}</p>
            {/* 안내 영역이 충분히 보이지 않으면(살짝 걸친 경우 포함) 방향을 알려 주고 눌러서 되돌아가게 한다 (프라이빗 짐 가이드와 같은 동작) */}
            {(() => {
              const vh = window.innerHeight;
              const topBound = 72; // 데모 상단 고정 머리글에 가려지는 영역
              const visible = Math.min(rect.top + rect.height, vh) - Math.max(rect.top, topBound);
              const needed = Math.min(rect.height * 0.5, 200);
              const dir = visible >= needed ? null : rect.top + rect.height / 2 < vh / 2 ? "up" : "down";
              return (
                dir && (
                  <button
                    type="button"
                    onClick={() => open(step!)}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#16A34A]/10 py-2.5 text-sm font-semibold text-[#15803d] transition-colors hover:bg-[#16A34A]/20"
                  >
                    {dir === "up" ? <ArrowUp size={14} aria-hidden /> : <ArrowDown size={14} aria-hidden />}
                    안내 영역이 {dir === "up" ? "위" : "아래"}에 있어요
                  </button>
                )
              );
            })()}
            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={close} className="text-sm text-stone-400 hover:text-stone-600">
                건너뛰기
              </button>
              <div className="flex gap-2">
                {step! > 0 && (
                  <button
                    type="button"
                    onClick={() => open(step! - 1)}
                    className="rounded-[6px] border-[2.5px] border-[#1d1d1f] bg-white px-4 py-2 text-sm font-bold"
                  >
                    이전
                  </button>
                )}
                <button
                  type="button"
                  autoFocus
                  onClick={() => (last ? close() : open(step! + 1))}
                  className="rounded-[6px] border-[2.5px] border-[#1d1d1f] bg-[#256ef4] px-4 py-2 text-sm font-bold text-white"
                >
                  {last ? "시작하기" : "다음"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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

/** 사용법 보기 버튼. 한 번도 열지 않았으면 초록으로 반짝인다. */
function GuideButton({ fresh, onClick, projectId }: { fresh: boolean; onClick: () => void; projectId: string }) {
  const own = useRef<HTMLButtonElement>(null);
  const [lift, setLift] = useState(0);
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
  return (
    <button
      ref={own}
      type="button"
      onClick={onClick}
      data-gtm-cta={`demo_guide_${projectId}`}
      style={{ bottom: `calc(${lift}px + 16px + env(safe-area-inset-bottom))` }}
      className={`${pill} print:hidden fixed right-4 z-50 transition-[bottom,transform,box-shadow,background-color] md:left-5 md:right-auto ${fresh ? "bg-[#d9f7e3]" : ""}`}
    >
      {fresh && <span aria-hidden className="absolute inset-0 rounded-full bg-[#4ade80] opacity-50 motion-safe:animate-ping" />}
      <CircleHelp size={16} aria-hidden className="relative" />
      <span className="relative">사용법 보기</span>
    </button>
  );
}
