"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { asm } from "@/components/classic/assembleState";

// 조립형 첫 화면 감싸개.
//  - 새로고침 전에 이미 조립했으면 data-built(조립 연출 끔)를 붙이고, 돌아온 그때 한 번만 data-shine(창틀 반짝, 광택).
//    스크롤로 다시 지나갈 때는 반복하지 않는다(사용자 "반복되어서").
//  - 휴대폰, 태블릿에서는 창이 첫 화면 아래에 있어, 창이 충분히 보일 때 창 쪽 조립을 시작한다(그 전에는 멈춰 둔다).
// 표시는 그리기 전에(useLayoutEffect) 직접 붙인다. 뒤로 가기로 화면이 되살아날 때 상태가 그대로 남아 있어도 다시 판단하게.
export function BuildGate({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const built = asm.hero;
    asm.hero = true;
    let timer = 0;
    let start = 0;
    if (built) {
      el.dataset.built = "";
      start = window.setTimeout(() => {
        el.dataset.shine = "";
        timer = window.setTimeout(() => delete el.dataset.shine, 1200);
      }, 150);
    }
    const win = el.querySelector<HTMLElement>("[data-win]");
    const wio = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && win) {
        win.dataset.winOn = "";
        wio.disconnect();
      }
    }, { threshold: 0.6 });
    if (win) wio.observe(win);
    return () => {
      wio.disconnect();
      window.clearTimeout(start);
      window.clearTimeout(timer);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
