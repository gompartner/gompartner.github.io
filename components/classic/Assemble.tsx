"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { asm } from "@/components/classic/assembleState";

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
[data-asm], [data-asm-built] { overflow-x: clip; }
[data-asm] [data-part]:not([data-go]) { opacity: 0; }
[data-asm] [data-part][data-go] {
  outline: 1.5px solid transparent; outline-offset: 5px;
  animation: gp-dock2 0.9s cubic-bezier(0.16, 0.84, 0.3, 1) both, gp-glow 0.6s ease-out none;
  animation-delay: var(--delay), calc(var(--delay) + 0.72s);
}
[data-asm] [data-clunk] { animation: gp-clunk2 0.3s ease-out both; }
/* 이미 조립한 부품이 다시 보일 때: 테두리 반짝과 광택만 */
@keyframes gp-sheen { from { background-position: 160% 0; } to { background-position: -60% 0; } }
[data-asm] [data-part][data-go][data-shine], [data-asm-built] [data-part][data-shine] {
  outline: 1.5px solid transparent; outline-offset: 5px;
  background-image: linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, 0.3) 50%, transparent 65%);
  background-size: 250% 100%; background-repeat: no-repeat;
  animation: gp-glow 0.8s ease-out both, gp-sheen 1s ease-in-out both;
}
@media (prefers-reduced-motion: reduce) {
  [data-asm] [data-part]:not([data-go]) { opacity: 1; }
  [data-asm] [data-part][data-go], [data-asm] [data-clunk], [data-shine] { animation: none !important; }
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
  // 새로고침 전에 이미 조립했으면 다시 조립하지 않는다
  const [built] = useState(() => asm.sections);

  useEffect(() => {
    const root = ref.current;
    if (!on || !root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    asm.sections = true;
    const parts = [...root.querySelectorAll<HTMLElement>("[data-part]")];
    if (!built) {
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
    }
    const timers: number[] = [];
    const shine = (el: HTMLElement, delay: number) => {
      timers.push(window.setTimeout(() => {
        el.dataset.shine = "";
        timers.push(window.setTimeout(() => delete el.dataset.shine, 1100));
      }, delay));
    };
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        const hits = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        const fresh = hits.filter((el) => !built && !("go" in el.dataset));
        // 처음 보는 부품은 조립
        fresh.forEach((el, k) => {
          el.style.setProperty("--delay", `${k * 0.12}s`);
          el.dataset.go = "";
        });
        const sec = fresh[0]?.closest("section");
        if (sec) {
          timers.push(window.setTimeout(() => {
            sec.dataset.clunk = "";
            timers.push(window.setTimeout(() => delete sec.dataset.clunk, 320));
          }, (fresh.length - 1) * 120 + 760));
        }
        // 이미 조립한 부품이 다시 들어오면 반짝과 광택만
        hits.filter((el) => !fresh.includes(el) && seen.has(el)).forEach((el, k) => shine(el, k * 80));
        hits.forEach((el) => seen.add(el));
        // 조립된 화면으로 돌아왔을 때 처음 보이는 부품도 반짝
        if (built) hits.filter((el) => !el.dataset.shown).forEach((el, k) => {
          el.dataset.shown = "";
          shine(el, k * 80);
        });
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    parts.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [on, built]);

  return (
    <div ref={ref} data-asm={on && !built ? "" : undefined} data-asm-built={on && built ? "" : undefined}>
      {on && <style>{css}</style>}
      {children}
    </div>
  );
}
