"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { asm } from "@/components/classic/assembleState";

// 11-25 조립형 메인(?v=build)의 스크롤 조립. 첫 화면 아래 칸의 [data-part] 요소가 화면에 들어올 때
// 화면 밖에서 돌며 날아와 맞물리고 테두리가 한 번 빛난다. 한 번만, 충분히 화면에 들어왔을 때. 다른 시안과 움직임 줄이기에서는 그대로 보인다.

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
/* 11-25 아래 칸 조립. 날아오는 것은 괜찮고(사용자), 문제는 때였다: 화면 아래 끝에 살짝 걸치자마자 시작해서
   태블릿, 휴대폰에서는 보기도 전에 끝나 있었고, 다시 지나갈 때마다 반짝여 계속 반복되는 것처럼 보였다.
   그래서 부품 윗변이 화면 아래에서 4분의 1쯤 올라왔을 때 한 번만 조립하고, 다시 지나갈 때는 아무것도 하지 않는다. */
@keyframes gp-dock2 {
  0% { opacity: 0; transform: perspective(900px) translate3d(var(--dx), var(--dy), 0) rotateY(var(--ry)) rotate(var(--rot)) scale(0.82); }
  60% { opacity: 1; }
  84% { transform: perspective(900px) translate3d(calc(var(--dx) * -0.02), calc(var(--dy) * -0.02), 0) rotateY(0deg) rotate(0deg) scale(1.012); }
  100% { opacity: 1; transform: none; }
}
@keyframes gp-glow { 0%, 100% { outline-color: rgba(122, 167, 255, 0); } 35% { outline-color: rgba(122, 167, 255, 0.95); } }
[data-asm], [data-asm-built] { overflow-x: clip; }
[data-asm] [data-part]:not([data-go]) { opacity: 0; }
[data-asm] [data-part][data-go] {
  outline: 1.5px solid transparent; outline-offset: 5px;
  animation: gp-dock2 0.6s cubic-bezier(0.16, 0.84, 0.3, 1) both, gp-glow 0.5s ease-out none;
  animation-delay: var(--delay), calc(var(--delay) + 0.5s);
}
/* 조립할 틈 없이 지나친 부품(빠르게 넘겼거나 아래쪽 주소로 바로 들어온 경우)은 바로 보인다 */
[data-asm] [data-part][data-go][data-instant] { animation: none; }
@media (prefers-reduced-motion: reduce) {
  [data-asm] [data-part]:not([data-go]) { opacity: 1; }
  [data-asm] [data-part][data-go] { animation: none !important; }
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
    if (!on || built || !root || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (on) asm.sections = true;
      return;
    }
    asm.sections = true;
    const parts = [...root.querySelectorAll<HTMLElement>("[data-part]")];
    const order = new Map(parts.map((el, i) => [el, i]));
    const fly = (els: HTMLElement[]) => {
      const mid = window.innerWidth / 2;
      const far = Math.min(window.innerWidth * 0.9, 520);
      els.forEach((el, k) => {
        const r = el.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const i = order.get(el) ?? 0;
        // 왼쪽 부품은 왼쪽에서, 오른쪽 부품은 오른쪽에서. 화면 폭을 다 쓰는 부품(휴대폰)은 번갈아 온다
        const wide = r.width > window.innerWidth * 0.6 || Math.abs(c - mid) < 24;
        const side = wide ? (i % 2 ? 1 : -1) : c < mid ? -1 : 1;
        el.style.setProperty("--dx", `${side * far}px`);
        el.style.setProperty("--dy", `${60 + (i % 3) * 40}px`);
        el.style.setProperty("--ry", `${side * 50}deg`);
        el.style.setProperty("--rot", `${side * (6 + (i % 4) * 3)}deg`);
        el.style.setProperty("--delay", `${k * 0.08}s`);
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
    };
  }, [on, built]);

  return (
    <div ref={ref} data-asm={on && !built ? "" : undefined} data-asm-built={on && built ? "" : undefined} data-blue={on ? "" : undefined}>
      {on && <style>{css}</style>}
      {children}
    </div>
  );
}
