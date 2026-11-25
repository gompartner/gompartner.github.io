"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { asm } from "@/components/classic/assembleState";

// 조립형 첫 화면 감싸개. 이미 조립했으면 data-built(조립 연출 끔), 다시 화면에 들어오면 data-shine(선 반짝, 광택)
export function BuildGate({ children }: { children: ReactNode }) {
  const [built] = useState(() => asm.hero);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    asm.hero = true;
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const shine = () => {
      el.dataset.shine = "";
      window.clearTimeout(timer);
      timer = window.setTimeout(() => delete el.dataset.shine, 1200);
    };
    // 조립된 화면으로 돌아왔을 때 한 번만 반짝인다. 스크롤로 다시 지나갈 때는 반복하지 않는다(사용자 "반복되어서")
    if (built) window.setTimeout(shine, 150);
    // 휴대폰에서는 창이 첫 화면 아래에 있어, 창이 보일 때 창 쪽 조립을 시작한다(그 전에는 멈춰 둔다)
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
      window.clearTimeout(timer);
    };
  }, [built]);

  return (
    <div ref={ref} data-built={built ? "" : undefined}>
      {children}
    </div>
  );
}
