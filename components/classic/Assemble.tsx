"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { asm } from "@/components/classic/assembleState";

// 11-25 메인 첫 화면 아래 칸의 조립. [data-part] 부품이 화면 밖에서 날아와 제자리에 맞물린다.
// 사용자와 여러 번 고치며 정한 것:
//  - 부품마다 방향과 거리를 제각각으로(규칙적이면 단조롭고 파도처럼 보인다). 팔랑거리지 않고 자석처럼 딱 붙게
//  - 부품 윗변이 화면 아래에서 4분의 1쯤 올라왔을 때 시작한다(아래 끝에 걸치자마자 시작하면 태블릿, 휴대폰에서는 보기도 전에 끝난다)
//  - 한 번만. 다시 지나갈 때는 아무것도 하지 않고, 새로고침 전에 다른 페이지에 갔다 와도 다시 조립하지 않는다
//  - 조립할 틈 없이 지나친 부품은 바로 보인다. 움직임 줄이기 설정이면 처음부터 그대로 보인다
// 부품을 숨기는 표시(data-asm)는 브라우저에서 붙인다. 스크립트가 돌지 않으면 내용이 그대로 보인다.

const css = `
/* 11-25 밤 "팔랑거리는 것 말고 자석처럼 딱 붙는 느낌": 뒤집히거나 크게 돌지 않는다.
   가까이에서 머뭇거리듯 천천히 다가오다가(0~38%), 끌려가듯 점점 빨라져 딱 붙고(76%, 그 순간 한 번 밝아진다), 아주 조금 되튕긴 뒤 멈춘다 */
@keyframes gp-dock2 {
  0% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(1); filter: brightness(1); animation-timing-function: ease-out; }
  38% { opacity: 1; transform: translate(calc(var(--dx) * 0.8), calc(var(--dy) * 0.8)) rotate(calc(var(--rot) * 0.8)) scale(1); filter: brightness(1); animation-timing-function: cubic-bezier(0.85, 0, 1, 0.45); }
  76% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); filter: brightness(1.7); animation-timing-function: ease-out; }
  85% { transform: translate(calc(var(--dx) * -0.03), calc(var(--dy) * -0.03)) rotate(0deg) scale(0.992); filter: brightness(1.15); }
  100% { opacity: 1; transform: none; filter: none; }
}
[data-asm] { overflow-x: clip; }
[data-asm] [data-part]:not([data-go]) { opacity: 0; }
[data-asm] [data-part][data-go] { animation: gp-dock2 var(--dur, 0.55s) linear both; animation-delay: var(--delay, 0s); }
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
      els.forEach((el, k) => {
        // 방향은 제각각, 거리는 가깝게(자석이 끌어당기는 거리)
        const ang = rnd(0, Math.PI * 2);
        const far = rnd(90, 190);
        el.style.setProperty("--dx", `${Math.round(Math.cos(ang) * far)}px`);
        el.style.setProperty("--dy", `${Math.round(Math.sin(ang) * far)}px`);
        el.style.setProperty("--rot", `${rnd(-5, 5).toFixed(1)}deg`);
        el.style.setProperty("--dur", `${rnd(0.5, 0.62).toFixed(2)}s`);
        el.style.setProperty("--delay", `${(k * 0.09 + rnd(0, 0.05)).toFixed(2)}s`);
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
    // 다 붙은 부품은 애니메이션을 걷어 낸다(끝난 뒤에도 밝기 필터와 변형이 남아 글자가 흐려지거나 무거워지지 않게)
    const onEnd = (e: AnimationEvent) => {
      const el = e.target as HTMLElement;
      if (e.animationName === "gp-dock2" && el.dataset && "part" in el.dataset) el.dataset.instant = "";
    };
    root.addEventListener("animationend", onEnd);
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
      root.removeEventListener("animationend", onEnd);
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
