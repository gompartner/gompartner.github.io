"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { asm } from "@/components/classic/assembleState";
import { holdScroll } from "@/components/classic/scrollHold";

// 11-25 메인 첫 화면 아래 칸의 조립. 사용자와 여러 번 고치며 정한 것:
//  - 조립의 단위는 카드 한 장이 아니라 그 안의 작은 부품이다(11-26 "작은 부품 컴포넌트가 조립되는 느낌, 지금은 도장 찍는 느낌").
//    카드가 통째로 나타나면 도장이고, 판 조각이 맞물린 뒤 번호, 제목, 설명, 금액, 화살표, 무늬가 하나씩 제자리에 끼워져야 조립이다.
//  - 그래서 [data-part] 하나가 차례가 되면: (1) 카드 바탕을 비스듬한 판 세 조각으로 나눠 가까이에서 맞물리고
//    (2) 그 안의 작은 요소들을 찾아 하나씩, 제각각 방향에서 짧게 다가와 딱 끼워지게 한다(끼워지는 순간 한 번 밝아진다).
//  - 부품이 화면 가운데 근처까지 올라왔을 때 시작하고(아래 끝에 걸치자마자 시작하면 보기도 전에 끝난다), 칸마다 처음 한 번은 조립이 끝날 때까지 스크롤을 붙잡는다
//  - 한 번만. 다시 지나갈 때는 아무것도 하지 않고, 새로고침 전에 다른 페이지에 갔다 와도 다시 조립하지 않는다
//  - 조립할 틈 없이 지나친 부품은 바로 보인다. 움직임 줄이기 설정이면 처음부터 그대로 보인다
// 부품을 숨기는 표시(data-asm)는 브라우저에서 붙인다. 스크립트가 돌지 않으면 내용이 그대로 보인다.

const css = `
@keyframes asm-piece {
  0% { opacity: 0; transform: translate(var(--px), var(--py)) rotate(var(--pr)) scale(var(--ps)); animation-timing-function: ease-out; }
  40% { opacity: 1; transform: translate(calc(var(--px) * 0.75), calc(var(--py) * 0.75)) rotate(calc(var(--pr) * 0.75)) scale(1); filter: brightness(1); animation-timing-function: cubic-bezier(0.85, 0, 1, 0.45); }
  78% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); filter: brightness(1.9); animation-timing-function: ease-out; }
  100% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) scale(1); filter: brightness(1); }
}
.asm-piece { animation: asm-piece 0.46s linear both; animation-delay: var(--pd); will-change: transform, opacity; }
.asm-plate { position: absolute; inset: 0; pointer-events: none; }
[data-asm] { overflow-x: clip; }
[data-asm] [data-part]:not([data-go]) { opacity: 0; }
`;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const MAX = 14;
const SLICES = ["polygon(0% 0%, 40% 0%, 28% 100%, 0% 100%)", "polygon(40% 0%, 74% 0%, 62% 100%, 28% 100%)", "polygon(74% 0%, 100% 0%, 100% 100%, 62% 100%)"];
const clear = (c: string) => c === "transparent" || c === "rgba(0, 0, 0, 0)";

/** 조립할 작은 요소를 고른다: 글자를 직접 품었거나, 작거나(원, 버튼, 아이콘), 안에 블록 요소가 없으면 그 자체가 부품. 아니면 안으로 더 들어간다 */
function pieces(root: Element, out: HTMLElement[], depth: number) {
  for (const child of Array.from(root.children) as HTMLElement[]) {
    if (out.length >= MAX) return;
    if (child.classList.contains("asm-plate") || child.tagName === "STYLE") continue;
    const display = getComputedStyle(child).display;
    if (display === "none" || display === "inline") continue;
    if (display === "contents") {
      pieces(child, out, depth);
      continue;
    }
    const r = child.getBoundingClientRect();
    const text = Array.from(child.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? "").trim().length > 0);
    const blocks = (Array.from(child.children) as HTMLElement[]).filter((c) => !["inline", "none"].includes(getComputedStyle(c).display));
    const small = r.width < 150 && r.height < 150;
    if (text || small || blocks.length === 0 || depth >= 3 || child.tagName.toLowerCase() === "svg") out.push(child);
    else pieces(child, out, depth + 1);
  }
}

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
    const timers: number[] = [];

    const build = (el: HTMLElement, start: number) => {
      // 카드 바탕: 감싸는 요소(li) 안에 바탕색 있는 카드가 하나 들어 있는 경우
      const first = el.firstElementChild as HTMLElement | null;
      const face = first && el.children.length === 1 && clear(getComputedStyle(el).backgroundColor) && !clear(getComputedStyle(first).backgroundColor) ? first : null;
      const undo: (() => void)[] = [];
      let t = start;
      // (1) 바탕을 판 세 조각으로 나눠 맞물린다
      if (face) {
        const cs = getComputedStyle(face);
        const bg = cs.backgroundColor;
        const prevBg = face.style.backgroundColor;
        const prevPos = el.style.position;
        if (getComputedStyle(el).position === "static") el.style.position = "relative";
        face.style.backgroundColor = "transparent";
        const plates = SLICES.map((clip, i) => {
          const p = document.createElement("span");
          p.className = "asm-plate asm-piece";
          p.setAttribute("aria-hidden", "true");
          p.style.cssText = `background:${bg};border-radius:${cs.borderRadius};clip-path:${clip};--px:${[-90, 0, 90][i] + Math.round(rnd(-20, 20))}px;--py:${[40, -70, 50][i] + Math.round(rnd(-15, 15))}px;--pr:${[-7, 4, 8][i]}deg;--ps:1;--pd:${(t + i * 0.07).toFixed(2)}s`;
          el.insertBefore(p, el.firstChild);
          return p;
        });
        t += 0.3;
        undo.push(() => {
          plates.forEach((p) => p.remove());
          face.style.backgroundColor = prevBg;
          el.style.position = prevPos;
        });
      }
      // (2) 안의 작은 요소들을 하나씩 끼운다
      const list: HTMLElement[] = [];
      pieces(face ?? el, list, 0);
      const set = list.length > 0 ? list : [el];
      set.forEach((c, i) => {
        const a = rnd(0, Math.PI * 2);
        const far = rnd(26, 64);
        c.style.setProperty("--px", `${Math.round(Math.cos(a) * far)}px`);
        c.style.setProperty("--py", `${Math.round(Math.sin(a) * far)}px`);
        c.style.setProperty("--pr", `${rnd(-9, 9).toFixed(1)}deg`);
        c.style.setProperty("--ps", rnd(0.8, 1.12).toFixed(2));
        c.style.setProperty("--pd", `${(t + i * 0.05).toFixed(2)}s`);
        c.classList.add("asm-piece");
      });
      const end = t + set.length * 0.05 + 0.5;
      undo.push(() =>
        set.forEach((c) => {
          c.classList.remove("asm-piece");
          for (const k of ["--px", "--py", "--pr", "--ps", "--pd"]) c.style.removeProperty(k);
        }),
      );
      el.dataset.go = "";
      timers.push(
        window.setTimeout(() => {
          undo.forEach((f) => f());
          el.dataset.instant = "";
        }, end * 1000 + 60),
      );
      return end;
    };

    // 한 번에 들어온 부품들은 앞 부품이 반쯤 조립됐을 때 다음 부품을 시작한다
    const run = (els: HTMLElement[]) => {
      let t = 0;
      let end = 0;
      for (const el of els) {
        end = build(el, t);
        t = Math.max(t, end - 0.45);
      }
      return end;
    };

    // 칸마다 처음 한 번, 조립이 끝날 때까지 스크롤을 붙잡는다(scrollHold). 길어도 1.2초. 머리글 메뉴로 건너뛸 때는 붙잡지 않는다.
    const held = new WeakSet<Element>();
    let skipUntil = 0;
    let release: (() => void) | null = null;
    const hold = (y: number, ms: number) => {
      release = holdScroll(y, ms);
    };
    const jump = (e: Event) => {
      if ((e.target as HTMLElement)?.closest?.('a[href*="#"]')) skipUntil = performance.now() + 1600;
    };
    document.addEventListener("click", jump, true);

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
        if (fresh.length === 0) return;
        const sorted = () => fresh.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
        const sec = fresh[0].closest("section");
        if (!sec || held.has(sec) || performance.now() < skipUntil) {
          if (sec) held.add(sec);
          run(sorted());
          return;
        }
        // 그 칸에서 처음이면: 칸 머리를 머리글 바로 아래로 올려 화면에 가득 들어오게 한 뒤, 보이는 부품을 함께 조립하고 끝날 때까지 스크롤을 붙잡는다
        held.add(sec);
        const headH = document.querySelector("header")?.getBoundingClientRect().height ?? 72;
        // 칸 위 여백의 절반쯤은 머리글 뒤로 넘겨, 붙잡힌 동안 카드가 더 많이 보이게 한다
        const delta = Math.max(0, sec.getBoundingClientRect().top - headH + (window.innerWidth >= 768 ? 64 : 36));
        const y = window.scrollY + delta;
        for (const el of parts) {
          if (!("go" in el.dataset) && !fresh.includes(el) && el.closest("section") === sec && el.getBoundingClientRect().top - delta < window.innerHeight * 0.94) {
            fresh.push(el);
            io.unobserve(el);
          }
        }
        const list = sorted();
        if (delta > 4) window.scrollTo({ top: y, behavior: "smooth" });
        const wait = delta > 4 ? 380 : 0;
        hold(y, wait + 200);
        timers.push(
          window.setTimeout(() => {
            const end = run(list);
            hold(y, Math.min(end, 1.2) * 1000);
          }, wait),
        );
      },
      // 부품 윗변이 화면 가운데 조금 아래(위에서 58%)까지 올라왔을 때. 그래야 붙잡힌 동안 조립되는 부품이 화면 안에 다 보인다
      { rootMargin: "0px 0px -42% 0px" },
    );
    parts.forEach((el) => io.observe(el));
    // 페이지 맨 아래에 닿으면 조립선까지 올라오지 못한 나머지도 조립한다
    const onScroll = () => {
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 8) return;
      const rest = parts.filter((el) => !("go" in el.dataset) && el.getBoundingClientRect().top < window.innerHeight);
      rest.forEach((el) => io.unobserve(el));
      run(rest);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", jump, true);
      release?.();
      timers.forEach((x) => window.clearTimeout(x));
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
