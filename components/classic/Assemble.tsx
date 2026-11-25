"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { asm } from "@/components/classic/assembleState";

// 11-25 조립형 메인(?v=build)의 스크롤 조립. 첫 화면 아래 칸의 [data-part] 요소가 화면에 들어올 때
// 화면 밖에서 비스듬히 날아와 맞물린다(테두리가 한 번 빛나고, 그 칸이 살짝 쿵). 다른 시안과 움직임 줄이기에서는 그대로 보인다.

const css = `

/* 11-25 "혼합돼서 별로": 조립형에서는 첫 화면 아래도 같은 설계도 톤(어두운 바탕, 모눈, 파란 가는 선 틀) */
[data-blue] {
  background-color: #0b0d12; color: #fff;
  background-image: linear-gradient(rgba(122,167,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(122,167,255,.06) 1px, transparent 1px);
  background-size: 48px 48px;
}
[data-blue] section { background: transparent !important; color: #fff; border-color: rgba(122,167,255,.22) !important; }
[data-blue] section + section { border-top: 1px solid rgba(122,167,255,.22); }
[data-blue] [class~="bg-white"], [data-blue] [class*="bg-[#f4f6fa]"], [data-blue] [class*="bg-[#0f1115]"] { background-color: rgba(17,21,30,.72) !important; }
[data-blue] [class*="text-[#15171c]"] { color: #fff !important; }
[data-blue] [class*="text-[#5b6370]"], [data-blue] [class*="text-[#3d4450]"], [data-blue] [class*="text-[#c9ced6]"] { color: #aab2bf !important; }
[data-blue] [class*="text-[#256ef4]"], [data-blue] [class*="text-[#7aa7ff]"] { color: #7aa7ff !important; }
[data-blue] [class*="border-[#d9dee5]"], [data-blue] [class*="border-[#e6e9ee]"], [data-blue] [class*="border-[#15171c]"], [data-blue] [class*="border-white"] { border-color: rgba(122,167,255,.3) !important; }
[data-blue] li[data-part], [data-blue] details[data-part] { border-radius: 4px !important; }
[data-blue] li[data-part][class*="rounded-[14px]"] { border: 1px solid rgba(122,167,255,.3); }
/* 카드 네 모서리 표시(설계도 꺾쇠) */
[data-blue] li[data-part][class*="rounded-[14px]"] { background-image:
  linear-gradient(#7aa7ff,#7aa7ff), linear-gradient(#7aa7ff,#7aa7ff), linear-gradient(#7aa7ff,#7aa7ff), linear-gradient(#7aa7ff,#7aa7ff),
  linear-gradient(#7aa7ff,#7aa7ff), linear-gradient(#7aa7ff,#7aa7ff), linear-gradient(#7aa7ff,#7aa7ff), linear-gradient(#7aa7ff,#7aa7ff);
  background-repeat: no-repeat;
  background-size: 14px 2px, 2px 14px, 14px 2px, 2px 14px, 14px 2px, 2px 14px, 14px 2px, 2px 14px;
  background-position: 0 0, 0 0, 100% 0, 100% 0, 0 100%, 0 100%, 100% 100%, 100% 100%;
}
/* 문의하기 같은 검은 테두리 버튼은 흰 선으로 */
[data-blue] a[class*="border-2"] { color: #fff !important; border-color: rgba(255,255,255,.5) !important; }
/* 신청서 상자만은 읽기 쉽게 흰 바탕 유지(안의 입력 칸도 원래 색) */
[data-blue] #apply [data-part][class*="rounded-[14px]"] { background-color: #fff !important; color: #15171c !important; border-radius: 4px !important; }
[data-blue] #apply [data-part][class*="rounded-[14px]"] [class~="bg-white"] { background-color: #fff !important; }
[data-blue] #apply [data-part][class*="rounded-[14px]"] [class*="text-[#15171c]"] { color: #15171c !important; }
[data-blue] #apply [data-part][class*="rounded-[14px]"] [class*="text-[#5b6370]"], [data-blue] #apply [data-part][class*="rounded-[14px]"] [class*="text-[#3d4450]"] { color: #5b6370 !important; }
[data-blue] #apply [data-part][class*="rounded-[14px]"] [class*="border-[#d9dee5]"], [data-blue] #apply [data-part][class*="rounded-[14px]"] [class*="border-[#e6e9ee]"] { border-color: #d9dee5 !important; }
[data-blue] #apply [data-part][class*="rounded-[14px]"] [class*="bg-[#f6f7f9]"] { background-color: #f6f7f9 !important; }
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
  animation: gp-dock2 0.55s cubic-bezier(0.16, 0.84, 0.3, 1) both, gp-glow 0.5s ease-out none;
  animation-delay: var(--delay), calc(var(--delay) + 0.44s);
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
          el.style.setProperty("--delay", `${k * 0.06}s`);
          el.dataset.go = "";
        });
        const sec = fresh[0]?.closest("section");
        if (sec) {
          timers.push(window.setTimeout(() => {
            sec.dataset.clunk = "";
            timers.push(window.setTimeout(() => delete sec.dataset.clunk, 320));
          }, (fresh.length - 1) * 60 + 460));
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
    <div ref={ref} data-asm={on && !built ? "" : undefined} data-asm-built={on && built ? "" : undefined} data-blue={on ? "" : undefined}>
      {on && <style>{css}</style>}
      {children}
    </div>
  );
}
