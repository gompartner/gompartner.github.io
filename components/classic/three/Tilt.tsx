"use client";

import { useEffect, useRef, type ReactNode } from "react";

// 11-27 대표 "사람들은 시각적인 걸 선호하니 시각적인 부분에 신경 써": /3d 큰 화면이 뒤로 눕혀진 채 아래에서 들어오다가
// 화면 가운데쯤 오면 제자리로 펴진다. 내리는 위치에 바로 묶여 있어(시간 연출이 아님) 멈추면 같이 멈춘다. 동작 줄이기 설정이면 그냥 둔다.
export function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = el.current;
    if (!node || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let on = false;
    const draw = () => {
      raf = 0;
      const r = node.getBoundingClientRect();
      const vh = window.innerHeight;
      // 화면 아래 끝에 걸칠 때 1, 위 끝이 화면 35% 지점에 오면 0
      const t = Math.min(1, Math.max(0, (r.top - vh * 0.35) / (vh * 0.65)));
      const e = t * t;
      node.style.transform = e > 0.001 ? `perspective(1600px) rotateX(${(e * 22).toFixed(2)}deg) scale(${(1 - e * 0.08).toFixed(4)})` : "";
      node.style.opacity = String(1 - e * 0.35);
    };
    const tick = () => { if (on && !raf) raf = requestAnimationFrame(draw); };
    const io = new IntersectionObserver(([x]) => { on = x.isIntersecting; tick(); }, { rootMargin: "0px 0px 20% 0px" });
    io.observe(node);
    addEventListener("scroll", tick, { passive: true });
    addEventListener("resize", tick);
    draw();
    return () => { io.disconnect(); removeEventListener("scroll", tick); removeEventListener("resize", tick); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={el} className={`origin-[50%_100%] will-change-transform ${className}`}>
      {children}
    </div>
  );
}
