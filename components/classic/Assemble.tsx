"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { asm } from "@/components/classic/assembleState";
import { coarsePointer } from "@/components/classic/scrollHold";
import { SLICES, clear, pieceCss, pieces, rnd } from "@/components/classic/assembleParts";

// 11-25 메인 첫 화면 아래 칸의 조립. 사용자와 여러 번 고치며 정한 것:
//  - 조립의 단위는 카드 한 장이 아니라 그 안의 작은 부품이다(11-26 "작은 부품 컴포넌트가 조립되는 느낌, 지금은 도장 찍는 느낌").
//    카드가 통째로 나타나면 도장이고, 판 조각이 맞물린 뒤 번호, 제목, 설명, 금액, 화살표, 무늬가 하나씩 제자리에 끼워져야 조립이다.
//  - 그래서 [data-part] 하나가 차례가 되면: (1) 카드 바탕을 비스듬한 판 세 조각으로 나눠 가까이에서 맞물리고
//    (2) 그 안의 작은 요소들을 찾아 하나씩, 제각각 방향에서 짧게 다가와 딱 끼워지게 한다(끼워지는 순간 한 번 밝아진다).
//  - 부품이 화면 아래에서 조금 올라왔을 때 시작한다. 스크롤은 붙잡지 않는다(11-26 "스크롤 블럭은 하지 말자. 잘 안 되는 듯. 자연스럽게 냅두자")
//  - 한 번만. 다시 지나갈 때는 아무것도 하지 않고, 새로고침 전에 다른 페이지에 갔다 와도 다시 조립하지 않는다
//  - 조립할 틈 없이 지나친 부품은 바로 보인다. 움직임 줄이기 설정이면 처음부터 그대로 보인다
// 부품을 숨기는 표시(data-asm)는 브라우저에서 붙인다. 스크립트가 돌지 않으면 내용이 그대로 보인다.

const css = `${pieceCss}
[data-asm] { overflow-x: clip; }
[data-asm] [data-part]:not([data-go]) { opacity: 0; }
`;

export function Assemble({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const built = asm.sections;
    asm.sections = true;
    if (!root || built || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.dataset.asm = "";
    // 손가락으로 넘기는 기기(휴대폰, 태블릿)는 넘기는 속도가 빨라 조립이 따라가지 못한다(11-26 사용자 "태블릿과 모바일에서는 조립이 선행되어야, 속도가 못 따라감").
    // 그래서 부품이 화면에 들어오기 조금 전에 미리 시작하고, 조각이 붙는 시간과 부품 사이 간격을 줄인다. PC는 그대로.
    const fast = coarsePointer();
    if (fast) root.style.setProperty("--pt", "0.32s");
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
          p.style.cssText = `background:${bg};border-radius:${cs.borderRadius};clip-path:${clip};--px:${[-90, 0, 90][i] + Math.round(rnd(-20, 20))}px;--py:${[40, -70, 50][i] + Math.round(rnd(-15, 15))}px;--pr:${[-7, 4, 8][i]}deg;--ps:1;--pd:${(t + i * (fast ? 0.04 : 0.07)).toFixed(2)}s`;
          el.insertBefore(p, el.firstChild);
          return p;
        });
        t += fast ? 0.16 : 0.3;
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
        c.style.setProperty("--pd", `${(t + i * (fast ? 0.028 : 0.05)).toFixed(2)}s`);
        c.classList.add("asm-piece");
      });
      const end = t + set.length * (fast ? 0.028 : 0.05) + (fast ? 0.36 : 0.5);
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
        // PC는 앞 부품이 반쯤 조립됐을 때 다음을 시작하고, 손가락 기기는 기다리지 않고 짧은 간격으로 잇따라 시작한다
        t = fast ? t + 0.1 : Math.max(t, end - 0.45);
      }
      return end;
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
        if (fresh.length === 0) return;
        // 스크롤은 붙잡지 않는다(11-26 사용자 "스크롤 블럭은 하지 말자, 자연스럽게 냅두자"). 들어온 부품을 차례대로 조립만 한다
        run(fresh.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0)));
      },
      // 부품 윗변이 화면 아래에서 4분의 1쯤 올라왔을 때. 붙잡지 않으니 조금 일찍 시작해야 내려가는 동안 조립되는 것이 보인다
      // 손가락 기기는 화면 아래 끝에 닿기 조금 전(화면 높이의 8% 밖)부터 시작한다. 더 일찍 시작하면 보기도 전에 조립이 끝나 버린다
      { rootMargin: fast ? "0px 0px 8% 0px" : "0px 0px -24% 0px" },
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
      timers.forEach((x) => window.clearTimeout(x));
      delete root.dataset.asm;
      root.style.removeProperty("--pt");
    };
  }, []);

  return (
    <div ref={ref}>
      <style>{css}</style>
      {children}
    </div>
  );
}
