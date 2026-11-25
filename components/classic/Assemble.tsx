"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { asm } from "@/components/classic/assembleState";
import { assembleCss } from "@/components/classic/board/assembleCss";

// 11-25 메인 첫 화면 아래 칸의 조립. [data-part] 부품이 그 자리에서 선과 면으로 조립된다(연출은 board/assembleCss).
// 사용자와 여러 번 고치며 정한 것:
//  - 날아오거나(11-25 "계속 날아다녀") 끌려와 붙는 것이 아니라 조립이다(11-26 "조립이라고"): 선이 먼저, 면이 차오른다
//  - 부품 윗변이 화면 아래에서 4분의 1쯤 올라왔을 때 시작한다(아래 끝에 걸치자마자 시작하면 태블릿, 휴대폰에서는 보기도 전에 끝난다)
//  - 한 번만. 다시 지나갈 때는 아무것도 하지 않고, 새로고침 전에 다른 페이지에 갔다 와도 다시 조립하지 않는다
//  - 조립할 틈 없이 지나친 부품은 바로 보인다. 움직임 줄이기 설정이면 처음부터 그대로 보인다
// 부품을 숨기는 표시(data-asm)는 브라우저에서 붙인다. 스크립트가 돌지 않으면 내용이 그대로 보인다.

const css = `${assembleCss}
[data-asm] { overflow-x: clip; }
/* 차례가 오기 전에는 보이지 않고, 조립이 끝났거나 틈 없이 지나친 부품은 그대로 보인다 */
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
    const parts = [...root.querySelectorAll<HTMLElement>("[data-part]")];
    const order = new Map(parts.map((el, i) => [el, i]));
    const fly = (els: HTMLElement[]) => {
      els.forEach((el, k) => {
        el.style.setProperty("--delay", `${(k * 0.09).toFixed(2)}s`);
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
      if (e.animationName === "asm-flash" && el.dataset && "part" in el.dataset) el.dataset.instant = "";
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
