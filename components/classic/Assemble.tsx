"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { asm } from "@/components/classic/assembleState";

// 11-25 메인 첫 화면 아래 칸의 조립. [data-part] 부품이 화면 밖에서 날아와 제자리에 맞물린다.
// 사용자와 여러 번 고치며 정한 것:
//  - 부품마다 방향, 거리, 회전, 크기, 빠르기를 제각각으로(규칙적이면 단조롭고 파도처럼 보인다)
//  - 부품 윗변이 화면 아래에서 4분의 1쯤 올라왔을 때 시작한다(아래 끝에 걸치자마자 시작하면 태블릿, 휴대폰에서는 보기도 전에 끝난다)
//  - 한 번만. 다시 지나갈 때는 아무것도 하지 않고, 새로고침 전에 다른 페이지에 갔다 와도 다시 조립하지 않는다
//  - 조립할 틈 없이 지나친 부품은 바로 보인다. 움직임 줄이기 설정이면 처음부터 그대로 보인다
// 부품을 숨기는 표시(data-asm)는 브라우저에서 붙인다. 스크립트가 돌지 않으면 내용이 그대로 보인다.

const css = `
@keyframes gp-dock2 {
  0% { opacity: 0; transform: perspective(900px) translate3d(var(--dx), var(--dy), 0) rotateX(var(--rx)) rotateY(var(--ry)) rotate(var(--rot)) scale(var(--sc)); }
  55% { opacity: 1; }
  86% { transform: perspective(900px) translate3d(calc(var(--dx) * -0.02), calc(var(--dy) * -0.02), 0) rotateX(0deg) rotateY(0deg) rotate(0deg) scale(1.012); }
  100% { opacity: 1; transform: none; }
}
[data-asm] { overflow-x: clip; }
[data-asm] [data-part]:not([data-go]) { opacity: 0; }
[data-asm] [data-part][data-go] { animation: gp-dock2 var(--dur, 0.7s) cubic-bezier(0.16, 0.84, 0.3, 1) both; animation-delay: var(--delay, 0s); }
[data-asm] [data-part][data-go][data-instant] { animation: none; }
`;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export function Assemble({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const built = asm.sections;
    asm.sections = true;
    if (!root || built || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.dataset.asm = "";
    const parts = [...root.querySelectorAll<HTMLElement>("[data-part]")];
    const order = new Map(parts.map((el, i) => [el, i]));
    const fly = (els: HTMLElement[]) => {
      const reach = Math.max(420, Math.min(window.innerWidth, 900));
      els.forEach((el, k) => {
        const ang = rnd(0, Math.PI * 2);
        const far = rnd(300, reach);
        el.style.setProperty("--dx", `${Math.round(Math.cos(ang) * far)}px`);
        el.style.setProperty("--dy", `${Math.round(Math.sin(ang) * far * 0.7)}px`);
        el.style.setProperty("--rx", `${Math.round(rnd(-60, 60))}deg`);
        el.style.setProperty("--ry", `${Math.round(rnd(-70, 70))}deg`);
        el.style.setProperty("--rot", `${Math.round(rnd(-35, 35))}deg`);
        el.style.setProperty("--sc", rnd(0.4, 1.35).toFixed(2));
        el.style.setProperty("--dur", `${rnd(0.55, 0.9).toFixed(2)}s`);
        el.style.setProperty("--delay", `${(k * 0.05 + rnd(0, 0.12)).toFixed(2)}s`);
        el.dataset.go = "";
      });
    };
    const io = new IntersectionObserver(
      (entries) => {
        const fresh: HTMLElement[] = [];
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if ("go" in el.dataset) continue;
          if (e.isIntersecting) fresh.push(el);
          else if (e.boundingClientRect.top < 0) {
            // 조립선에 닿지 않고 화면 위로 지나갔다
            el.dataset.go = "";
            el.dataset.instant = "";
          } else continue;
          io.unobserve(el);
        }
        fly(fresh.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0)));
      },
      // 부품 윗변이 화면 아래에서 26% 올라온 선을 넘을 때
      { rootMargin: "0px 0px -26% 0px" },
    );
    parts.forEach((el) => io.observe(el));
    // 페이지 맨 아래에 닿으면 조립선까지 올라오지 못한 나머지도 조립한다
    const onScroll = () => {
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 8) return;
      const rest = parts.filter((el) => !("go" in el.dataset) && el.getBoundingClientRect().top < window.innerHeight);
      rest.forEach((el) => io.unobserve(el));
      fly(rest);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      delete root.dataset.asm;
    };
  }, []);

  return (
    <div ref={ref}>
      <style>{css}</style>
      {children}
    </div>
  );
}
