"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SLICES, clear, pieces, rnd } from "@/components/classic/assembleParts";

// 판의 조립. 메인(Assemble)과 같은 방식: 부품 상자(.bd-in)의 바탕이 판 세 조각으로 맞물리고 그 안의 작은 요소가 하나씩 끼워진다.
//  - 화면에 들어온 상자부터 차례로. 첫 화면의 상자는 큰 제목이 조립된 뒤에 시작한다. 판은 고르고 계산하는 화면이라 스크롤은 붙잡지 않는다
//  - 새로고침 전까지 판마다 한 번만(11-25 사용자 "한번 만들면 새로고침 전까지는 다시 그릴 필요 없이"). 이미 본 판으로 돌아오면 data-built를 붙여 완성된 화면을 보여 준다
//  - 탭을 눌러 새로 나온 상자도 처음 한 번만 조립한다. 같은 내용으로 돌아오면 바로 보인다
const seen = new Set<string>();
const shown = new Set<string>();
const STEP = 0.16; // 상자와 상자 사이
const FIRST = 0.4; // 첫 화면: 큰 제목이 먼저

/** 상자 하나를 조립한다. 끝나는 시각(초)을 돌려준다 */
function build(el: HTMLElement, start: number, timers: number[], open: Set<() => void>) {
  const cs = getComputedStyle(el);
  const undo: (() => void)[] = [];
  let t = start;
  if (!clear(cs.backgroundColor)) {
    // 바탕과 테두리는 판 조각이 맡고, 상자 자신은 조립이 끝날 때 돌아온다
    const prev = { bg: el.style.backgroundColor, border: el.style.borderColor, iso: el.style.isolation, tr: el.style.transition };
    // 계산된 스타일은 살아 있는 값이라, 바탕을 비우기 전에 색과 모서리를 적어 둔다
    const bg = cs.backgroundColor;
    const radius = cs.borderRadius;
    const bw = parseFloat(cs.borderTopWidth) || 0;
    el.style.transition = "none";
    el.style.isolation = "isolate";
    el.style.backgroundColor = "transparent";
    el.style.borderColor = "transparent";
    const plates = SLICES.map((clip, i) => {
      const p = document.createElement("span");
      p.className = "asm-plate asm-piece";
      p.setAttribute("aria-hidden", "true");
      p.style.cssText = `inset:${-bw}px;background:${bg};border-radius:${radius};clip-path:${clip};--px:${[-56, 0, 56][i] + Math.round(rnd(-14, 14))}px;--py:${[40, -70, 50][i] + Math.round(rnd(-15, 15))}px;--pr:${[-7, 4, 8][i]}deg;--ps:1;--pd:${(t + i * 0.07).toFixed(2)}s`;
      el.insertBefore(p, el.firstChild);
      return p;
    });
    t += 0.3;
    undo.push(() => {
      plates.forEach((p) => p.remove());
      el.style.backgroundColor = prev.bg;
      el.style.borderColor = prev.border;
      el.style.isolation = prev.iso;
      // 색이 돌아오는 순간 색 전환 효과가 끼어 깜빡이지 않게, 한 번 그린 뒤에 전환을 되돌린다
      void el.offsetWidth;
      el.style.transition = prev.tr;
    });
  }
  const list: HTMLElement[] = [];
  pieces(el, list, 0, 36);
  const set = list.length > 0 ? list : [el];
  // 요소가 많아도 끼워지는 시간은 0.5초 안
  const gap = Math.min(0.05, 0.5 / set.length);
  set.forEach((c, i) => {
    const a = rnd(0, Math.PI * 2);
    const far = rnd(26, 64);
    c.style.setProperty("--px", `${Math.round(Math.cos(a) * far)}px`);
    c.style.setProperty("--py", `${Math.round(Math.sin(a) * far)}px`);
    c.style.setProperty("--pr", `${rnd(-9, 9).toFixed(1)}deg`);
    c.style.setProperty("--ps", rnd(0.8, 1.12).toFixed(2));
    c.style.setProperty("--pd", `${(t + i * gap).toFixed(2)}s`);
    c.classList.add("asm-piece");
  });
  const end = t + set.length * gap + 0.5;
  undo.push(() =>
    set.forEach((c) => {
      c.classList.remove("asm-piece");
      for (const k of ["--px", "--py", "--pr", "--ps", "--pd"]) c.style.removeProperty(k);
    }),
  );
  el.dataset.go = "";
  const finish = () => {
    open.delete(finish);
    undo.forEach((f) => f());
  };
  open.add(finish);
  timers.push(window.setTimeout(finish, end * 1000 + 60));
  return end;
}

const sign = (path: string, el: HTMLElement) => `${path}|${(el.textContent ?? "").trim().slice(0, 80) || el.querySelector("img")?.getAttribute("src") || ""}`;

export function BoardGate({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (seen.has(pathname) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.dataset.built = "";
      return;
    }
    delete root.dataset.built;
    // 여기서부터는 스크립트가 차례를 맡는다(3초 뒤 그냥 보이게 하는 대비책을 끈다)
    root.dataset.live = "";
    // 잠깐 머문 뒤에 "본 판"으로 적는다(개발 모드에서 효과가 두 번 도는 경우에도 조립이 빠지지 않게)
    const timers: number[] = [window.setTimeout(() => seen.add(pathname), 1200)];
    const open = new Set<() => void>();
    let first = true;
    const io = new IntersectionObserver(
      (entries) => {
        const fresh = entries.filter((e) => e.isIntersecting || e.boundingClientRect.top < 0).map((e) => e.target as HTMLElement);
        if (fresh.length === 0) return;
        // 문서 순서대로 차례를 준다
        fresh.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        let t = first ? FIRST : 0;
        first = false;
        for (const el of fresh) {
          io.unobserve(el);
          if ("go" in el.dataset) continue;
          shown.add(sign(pathname, el));
          build(el, t, timers, open);
          t += STEP;
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const watch = () => {
      for (const el of root.querySelectorAll<HTMLElement>(".bd-in:not([data-go])")) {
        // 이미 조립해 보여 준 내용(탭을 오가며 다시 나온 상자)은 바로 보인다
        if (shown.has(sign(pathname, el))) el.dataset.go = "";
        else io.observe(el);
      }
    };
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      timers.forEach((x) => window.clearTimeout(x));
      delete root.dataset.live;
      // 조립 도중 판을 떠나도 판 조각과 숨긴 바탕이 남지 않게 바로 마무리한다
      [...open].forEach((f) => f());
    };
  }, [pathname]);
  return <div ref={ref}>{children}</div>;
}
