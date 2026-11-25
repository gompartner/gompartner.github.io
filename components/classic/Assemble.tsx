"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

// 11-25 조립형 메인(?v=build)의 스크롤 조립. 첫 화면 아래 칸의 [data-part] 요소가 화면에 들어올 때
// 화면 밖에서 비스듬히 날아와 맞물린다(테두리가 한 번 빛나고, 그 칸이 살짝 쿵). 다른 시안과 움직임 줄이기에서는 그대로 보인다.

const css = `
@keyframes gp-dock2 {
  0% { opacity: 0; transform: perspective(1000px) translate3d(var(--dx), var(--dy), 0) rotateY(var(--ry)) rotate(var(--rot)) scale(0.85); }
  60% { opacity: 1; }
  82% { transform: perspective(1000px) translate3d(calc(var(--dx) * -0.015), calc(var(--dy) * -0.015), 0) scale(1.012); }
  100% { opacity: 1; transform: none; }
}
@keyframes gp-glow { 0%, 100% { outline-color: rgba(122, 167, 255, 0); } 35% { outline-color: rgba(122, 167, 255, 0.95); } }
@keyframes gp-clunk2 { 0%, 100% { transform: none; } 35% { transform: translateY(3px); } 65% { transform: translateY(-1px); } }
[data-asm] { overflow-x: clip; }
[data-asm] [data-part]:not([data-go]) { opacity: 0; }
[data-asm] [data-part][data-go] {
  outline: 1.5px solid transparent; outline-offset: 5px;
  animation: gp-dock2 0.9s cubic-bezier(0.16, 0.84, 0.3, 1) both, gp-glow 0.6s ease-out none;
  animation-delay: var(--delay), calc(var(--delay) + 0.72s);
}
[data-asm] [data-clunk] { animation: gp-clunk2 0.3s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  [data-asm] [data-part]:not([data-go]) { opacity: 1; }
  [data-asm] [data-part][data-go], [data-asm] [data-clunk] { animation: none; }
}
`;

const readV = () => new URLSearchParams(window.location.search).get("v") ?? "us";

export function Assemble({ children }: { children: ReactNode }) {
  const v = useSyncExternalStore(
    (cb) => {
      window.addEventListener("popstate", cb);
      return () => window.removeEventListener("popstate", cb);
    },
    readV,
    () => "us",
  );
  const on = v === "build";
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!on || !root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const parts = [...root.querySelectorAll<HTMLElement>("[data-part]")];
    // 부품마다 날아올 방향을 정한다(왼쪽, 오른쪽, 아래를 번갈아)
    parts.forEach((el, i) => {
      const side = i % 3;
      const dx = side === 0 ? -700 : side === 1 ? 700 : (i % 2 ? 240 : -240);
      const dy = side === 2 ? 420 : 120 + (i % 4) * 40;
      el.style.setProperty("--dx", `${dx}px`);
      el.style.setProperty("--dy", `${dy}px`);
      el.style.setProperty("--ry", `${dx > 0 ? 55 : -55}deg`);
      el.style.setProperty("--rot", `${(i % 2 ? 1 : -1) * (8 + (i % 5) * 4)}deg`);
    });
    const io = new IntersectionObserver(
      (entries) => {
        const hits = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        hits.forEach((el, k) => {
          el.style.setProperty("--delay", `${k * 0.12}s`);
          el.dataset.go = "";
          io.unobserve(el);
        });
        // 한 묶음이 다 맞물릴 즈음 그 칸을 쿵
        const sec = hits[0]?.closest("section");
        if (sec) {
          window.setTimeout(() => {
            sec.dataset.clunk = "";
            window.setTimeout(() => delete sec.dataset.clunk, 320);
          }, (hits.length - 1) * 120 + 760);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    parts.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [on]);

  return (
    <div ref={ref} data-asm={on ? "" : undefined}>
      {on && <style>{css}</style>}
      {children}
    </div>
  );
}
