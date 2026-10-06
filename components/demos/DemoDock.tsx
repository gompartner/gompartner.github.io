"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, CircleHelp, NotebookPen } from "lucide-react";
import type { TourStep } from "@/data/tours";

// 데모 왼쪽 아래 버튼 묶음: 다른 데모 보기, 만든 이야기, 사용법 가이드.
// 사용법 가이드는 프라이빗 짐 데모(HomepageDemo)의 스포트라이트 가이드와 같은 방식이다.
// 첫 단계 영역이 처음 화면에 들어오면 한 번 자동으로 열고, 이후에는 물음표 버튼으로 다시 연다.

const pill =
  "inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3.5 text-sm font-medium text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/75 sm:px-4";

type Rect = { top: number; left: number; width: number; height: number };

/** 선택자로 찾은 요소가 제목이면 그 제목이 속한 구역 전체를 비춘다. */
function resolve(selector: string): HTMLElement | null {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return null;
  if (/^H[1-6]$/.test(el.tagName)) return el.closest<HTMLElement>("section") ?? el.parentElement;
  return el;
}

export function DemoDock({ projectId, story, tour }: { projectId: string; story?: string[]; tour?: TourStep[] }) {
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

  // 화면에 실제로 있는 단계만 쓴다 (탭에 가려진 영역 등)
  const start = useCallback(() => {
    const list = (tour ?? []).filter((s) => resolve(s.target));
    if (!list.length) return;
    resolve(list[0].target)?.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
    setSteps(list);
    setStep(0);
  }, [tour]);

  // 첫 단계 영역이 처음 보이면 한 번만 자동으로 연다
  useEffect(() => {
    if (!tour?.length) return;
    const key = `demo-tour-seen:${projectId}`;
    try {
      if (localStorage.getItem(key)) return;
    } catch {
      return;
    }
    let io: IntersectionObserver | null = null;
    const arm = () => {
      const first = resolve(tour[0].target);
      if (!first) return;
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io?.disconnect();
          try {
            localStorage.setItem(key, "1");
          } catch {}
          start();
        },
        { threshold: 0.3 },
      );
      io.observe(first);
    };
    // 공지 팝업(DemoPopup)이 떠 있으면 모두 닫힌 뒤에 연다
    const timer = window.setTimeout(() => {
      if (document.body.hasAttribute("data-demo-popup")) window.addEventListener("demo-popup-closed", arm, { once: true });
      else arm();
    }, 600);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("demo-popup-closed", arm);
      io?.disconnect();
    };
  }, [projectId, tour, start]);

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
      <div className="print:hidden fixed bottom-5 left-5 z-50 flex items-end gap-2">
        <Link href="/works" aria-label="다른 데모 보기" className={pill}>
          <ArrowLeft size={15} aria-hidden />
          <span className="hidden sm:inline">다른 데모 보기</span>
        </Link>

        {story?.length ? (
          <details className="group relative">
            <summary className={`${pill} cursor-pointer list-none [&::-webkit-details-marker]:hidden`} aria-label="만든 이야기">
              <NotebookPen size={15} aria-hidden />
              <span className="hidden sm:inline">만든 이야기</span>
            </summary>
            <div className="absolute bottom-full left-0 mb-2 max-h-[60vh] w-[min(360px,calc(100vw-40px))] overflow-y-auto rounded-[12px] border border-black/10 bg-white p-5 text-[15px] leading-[1.7] text-[#1d2327] shadow-xl">
              <p className="font-bold">만든 이야기</p>
              <div className="mt-2 space-y-2 text-[#3d474f]">
                {story.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </details>
        ) : null}

        {tour?.length ? (
          <button type="button" onClick={start} aria-label="사용법 보기" title="사용법 보기" className={pill}>
            <CircleHelp size={16} aria-hidden />
          </button>
        ) : null}
      </div>

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
            className="absolute inset-x-0 bottom-6 mx-auto w-[min(92vw,380px)] rounded-2xl bg-white p-5 text-[#1d2327] shadow-2xl"
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
                    className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-semibold"
                  >
                    이전
                  </button>
                )}
                <button
                  type="button"
                  autoFocus
                  onClick={() => (last ? close() : open(step! + 1))}
                  className="rounded-lg bg-[#111] px-4 py-2 text-sm font-bold text-white"
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
