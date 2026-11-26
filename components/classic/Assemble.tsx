"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { asm } from "@/components/classic/assembleState";
import { SLICES, clear, pieceCss, pieces, rnd } from "@/components/classic/assembleParts";
import { cssMin } from "@/lib/cssMin";

// 메인 첫 화면 아래 칸의 조립. 사용자와 여러 번 고치며 정한 것:
//  - 조립의 단위는 카드 한 장이 아니라 그 안의 작은 부품이다(11-26 "작은 부품 컴포넌트가 조립되는 느낌, 지금은 도장 찍는 느낌").
//    카드 바탕이 비스듬한 판 세 조각으로 맞물리고, 번호, 제목, 설명, 금액, 화살표, 무늬가 제각각 방향에서 다가와 제자리에 끼워진다.
//  - 11-26 조립은 시간이 아니라 스크롤에 맞춰 진행한다. 부품이 화면 아래 끝에서 가운데까지 올라오는 동안 조각이 모이고, 가운데에 닿으면 다 맞물려 한 번 밝아진다.
//    지나온 경위: 조립이 끝날 때까지 스크롤을 붙잡았다가("잘 안 되는 듯, 자연스럽게 냅두자") 뺐고, 시간에 맞춰 조립하니
//    빨리 내리면 "속도가 못 따라감", 빠르게 줄이니 "연출이 그냥 스쳐 지나감". 스크롤한 만큼 진행하면 빨리 내려도 늦게 내려도 눈앞에서 조립된다.
//  - 스크롤을 멈추면 화면 안에서 조립되다 만 부품은 그 자리에서 마저 조립한다(반쯤 흩어진 채 서 있지 않게).
//  - 한 번만. 다 조립된 부품은 다시 지나가도 그대로이고, 새로고침 전에 다른 페이지에 갔다 와도 다시 조립하지 않는다.
//  - 스크롤을 붙잡거나 자리를 옮기지 않는다. 움직임 줄이기 설정이면 처음부터 그대로 보인다.
// 부품을 숨기는 표시(data-asm)는 브라우저에서 붙인다. 스크립트가 돌지 않으면 내용이 그대로 보인다.

// --asm-p: 부품 하나의 조립 진행(0 흩어짐, 1 완성). 부품에 적으면 그 안의 조각들이 물려받아 자기 차례(--s)와 폭(--w)으로 움직인다.
const css = `${pieceCss}
@property --asm-p { syntax: "<number>"; inherits: true; initial-value: 1; }
@keyframes asm-snap { from { filter: brightness(1.8); } to { filter: brightness(1); } }
[data-asm] { overflow-x: clip; }
[data-asm] [data-part]:not([data-go]) { opacity: 0; }
[data-asm] [data-part][data-scrub] { transition: --asm-p 0.14s linear; }
[data-asm] [data-part][data-finish] { transition: --asm-p 0.42s cubic-bezier(0.3, 0.8, 0.3, 1); }
[data-asm] [data-part][data-snap] { animation: asm-snap 0.4s ease-out; }
.asm-scrub {
  --q: clamp(0, calc((var(--asm-p) - var(--s)) / var(--w)), 1);
  opacity: clamp(0, calc(var(--q) * 2.4), 1);
  transform: translate(calc(var(--px) * (1 - var(--q))), calc(var(--py) * (1 - var(--q)))) rotate(calc(var(--pr) * (1 - var(--q)))) scale(calc(var(--ps) + (1 - var(--ps)) * var(--q)));
  will-change: transform, opacity;
}
`;

const VARS = ["--px", "--py", "--pr", "--ps", "--s", "--w"];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
type Live = { el: HTMLElement; undo: (() => void)[]; p: number; lag: number; closing: boolean };

export function Assemble({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const built = asm.sections;
    asm.sections = true;
    if (!root || built || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.dataset.asm = "";
    const parts = [...root.querySelectorAll<HTMLElement>("[data-part]")];
    const live = new Map<HTMLElement, Live>();
    const timers: number[] = [];

    // 부품 하나를 흩어 놓는다: 바탕은 판 세 조각으로, 안의 작은 요소는 제각각 방향으로
    const prepare = (el: HTMLElement) => {
      const first = el.firstElementChild as HTMLElement | null;
      // 카드 바탕: 감싸는 요소(li) 안에 바탕색 있는 카드가 하나 들어 있는 경우
      const face = first && el.children.length === 1 && clear(getComputedStyle(el).backgroundColor) && !clear(getComputedStyle(first).backgroundColor) ? first : null;
      const undo: (() => void)[] = [];
      if (face) {
        const cs = getComputedStyle(face);
        const bg = cs.backgroundColor;
        const prevBg = face.style.backgroundColor;
        const prevPos = el.style.position;
        if (getComputedStyle(el).position === "static") el.style.position = "relative";
        face.style.backgroundColor = "transparent";
        const plates = SLICES.map((clip, i) => {
          const p = document.createElement("span");
          p.className = "asm-plate asm-scrub";
          p.setAttribute("aria-hidden", "true");
          p.style.cssText = `background:${bg};border-radius:${cs.borderRadius};clip-path:${clip};--px:${[-90, 0, 90][i] + Math.round(rnd(-20, 20))}px;--py:${[40, -70, 50][i] + Math.round(rnd(-15, 15))}px;--pr:${[-7, 4, 8][i]}deg;--ps:1;--s:${(i * 0.05).toFixed(2)};--w:0.45`;
          el.insertBefore(p, el.firstChild);
          return p;
        });
        undo.push(() => {
          plates.forEach((p) => p.remove());
          face.style.backgroundColor = prevBg;
          el.style.position = prevPos;
        });
      }
      const list: HTMLElement[] = [];
      pieces(face ?? el, list, 0);
      const set = list.length > 0 ? list : [el];
      // 판이 먼저 맞물리고(앞 0.18), 그 뒤로 요소들이 차례로 끼워진다. 마지막 요소도 진행 1에서 딱 끝난다
      const base = face ? 0.18 : 0;
      const step = Math.min(0.05, 0.4 / set.length);
      set.forEach((c, i) => {
        const a = rnd(0, Math.PI * 2);
        const far = rnd(30, 70);
        c.style.setProperty("--px", `${Math.round(Math.cos(a) * far)}px`);
        c.style.setProperty("--py", `${Math.round(Math.sin(a) * far)}px`);
        c.style.setProperty("--pr", `${rnd(-9, 9).toFixed(1)}deg`);
        c.style.setProperty("--ps", rnd(0.8, 1.12).toFixed(2));
        c.style.setProperty("--s", (base + i * step).toFixed(3));
        c.style.setProperty("--w", "0.42");
        c.classList.add("asm-scrub");
      });
      undo.push(() =>
        set.forEach((c) => {
          c.classList.remove("asm-scrub");
          for (const k of VARS) c.style.removeProperty(k);
        }),
      );
      // 같은 줄에 나란히 놓인 부품은 왼쪽부터 조금씩 늦게 시작한다(끝나는 자리는 같다)
      const top = el.getBoundingClientRect().top;
      const sameRow = [...live.values()].filter((l) => !l.closing && Math.abs(l.el.getBoundingClientRect().top - top) < 8).length;
      el.style.setProperty("--asm-p", "0");
      el.dataset.go = "";
      el.dataset.scrub = "";
      live.set(el, { el, undo, p: 0, lag: Math.min(0.3, sameRow * 0.1), closing: false });
    };

    // 다 조립된 부품을 원래 모습으로 돌려놓고(판 조각 걷기), 맞물리는 순간 한 번 밝아지게 한다
    const done = (l: Live) => {
      live.delete(l.el);
      l.undo.forEach((f) => f());
      delete l.el.dataset.scrub;
      delete l.el.dataset.finish;
      l.el.style.removeProperty("--asm-p");
      l.el.dataset.instant = "";
      l.el.dataset.snap = "";
      timers.push(window.setTimeout(() => delete l.el.dataset.snap, 450));
    };
    const close = (l: Live, ms: number, ease: boolean) => {
      l.closing = true;
      if (ease) l.el.dataset.finish = "";
      l.el.style.setProperty("--asm-p", "1");
      timers.push(window.setTimeout(() => done(l), ms));
    };

    // 스크롤한 만큼 진행: 부품 윗변이 화면 아래 끝이면 0, 화면 가운데까지 올라오면 1
    const update = () => {
      const vh = window.innerHeight;
      for (const l of live.values()) {
        if (l.closing) continue;
        const raw = clamp01((vh - l.el.getBoundingClientRect().top) / (vh * 0.5));
        const p = clamp01((raw - l.lag) / (1 - l.lag));
        if (raw >= 1) close(l, 170, false);
        else if (Math.abs(p - l.p) > 0.004) {
          l.p = p;
          l.el.style.setProperty("--asm-p", p.toFixed(3));
        }
      }
    };
    // 멈추면: 화면 안에서 조립되다 만 부품을 그 자리에서 마저 조립한다
    const settle = () => {
      const vh = window.innerHeight;
      for (const l of live.values()) if (!l.closing && l.el.getBoundingClientRect().top < vh * 0.94) close(l, 440, true);
    };

    let raf = 0;
    let idle = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          update();
        });
      window.clearTimeout(idle);
      idle = window.setTimeout(settle, 160);
    };

    // 화면 아래 반 장 거리까지 다가온 부품을 미리 흩어 놓는다. 이미 위로 지나간 부품(머리글 메뉴로 건너뛴 경우 등)은 그대로 보여 준다
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if ("go" in el.dataset) continue;
          if (e.isIntersecting) prepare(el);
          else if (e.boundingClientRect.top < 0) {
            el.dataset.go = "";
            el.dataset.instant = "";
          } else continue;
          io.unobserve(el);
        }
        onScroll();
      },
      { rootMargin: "0px 0px 50% 0px" },
    );
    parts.forEach((el) => io.observe(el));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      window.clearTimeout(idle);
      timers.forEach((x) => window.clearTimeout(x));
      // 조립 도중 페이지를 떠나도 흩어진 조각이 남지 않게
      for (const l of [...live.values()]) {
        l.undo.forEach((f) => f());
        l.el.style.removeProperty("--asm-p");
      }
      delete root.dataset.asm;
    };
  }, []);

  return (
    <div ref={ref}>
      <style>{cssMin(css)}</style>
      {children}
    </div>
  );
}
