"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { asm } from "@/components/classic/assembleState";

// 11-25 조립형 메인(?v=build)의 스크롤 조립. 첫 화면 아래 칸의 [data-part] 요소가 화면에 들어올 때
// 제자리에서 살짝 떠오르며 나타나고 테두리가 한 번 빛난다(11-25 날아오는 연출은 첫 화면만). 다른 시안과 움직임 줄이기에서는 그대로 보인다.

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
/* 11-25 아래 칸 조립: 멀리 날아오면 "계속 날아다녀", 제자리에서 떠오르기만 하면 "파도 타기 느낌"이라
   왼쪽 부품은 왼쪽에서, 오른쪽 부품은 오른쪽에서, 가운데는 아래에서 짧게(48px) 다가와 딱 맞물리게 한다. 회전 없음 */
@keyframes gp-dock2 {
  0% { opacity: 0; transform: translate(var(--dx, 0px), var(--dy, 24px)) scale(0.97); }
  72% { opacity: 1; transform: translate(calc(var(--dx, 0px) * -0.05), calc(var(--dy, 24px) * -0.05)) scale(1.004); }
  100% { opacity: 1; transform: none; }
}
}
@keyframes gp-glow { 0%, 100% { outline-color: rgba(122, 167, 255, 0); } 35% { outline-color: rgba(122, 167, 255, 0.95); } }
[data-asm], [data-asm-built] { overflow-x: clip; }
[data-asm] [data-part]:not([data-go]) { opacity: 0; }
[data-asm] [data-part][data-go] {
  outline: 1.5px solid transparent; outline-offset: 5px;
  animation: gp-dock2 0.36s cubic-bezier(0.2, 0.8, 0.3, 1) both, gp-glow 0.5s ease-out none;
  animation-delay: var(--delay), calc(var(--delay) + 0.26s);
}
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
  [data-asm] [data-part][data-go], [data-shine] { animation: none !important; }
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
        // 화면 가운데를 기준으로 왼쪽 부품은 왼쪽에서, 오른쪽 부품은 오른쪽에서, 가운데(넓은) 부품은 아래에서 짧게 다가온다.
        // 한 묶음은 거의 동시에 맞물린다(차례로 떠오르면 파도처럼 보인다)
        const mid = window.innerWidth / 2;
        fresh.forEach((el, k) => {
          const r = el.getBoundingClientRect();
          const c = r.left + r.width / 2;
          const wide = r.width > window.innerWidth * 0.6 || Math.abs(c - mid) < 24;
          el.style.setProperty("--dx", wide ? "0px" : c < mid ? "-48px" : "48px");
          el.style.setProperty("--dy", wide ? "28px" : "0px");
          el.style.setProperty("--delay", `${Math.min(k, 3) * 0.03}s`);
          el.dataset.go = "";
        });
        // 이미 조립한 부품이 다시 들어오면 반짝과 광택만
        hits.filter((el) => !fresh.includes(el) && seen.has(el)).forEach((el, k) => shine(el, k * 80));
        hits.forEach((el) => seen.add(el));
        // 조립된 화면으로 돌아왔을 때 처음 보이는 부품도 반짝
        if (built) hits.filter((el) => !el.dataset.shown).forEach((el, k) => {
          el.dataset.shown = "";
          shine(el, k * 80);
        });
      },
      { rootMargin: "0px 0px -4% 0px" },
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
