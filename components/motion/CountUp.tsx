"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

interface CountUpProps {
  to: number;
  suffix?: string;
  className?: string;
}

// SSR에는 최종값을 렌더하고, 뷰포트 진입 시에만 textContent를 직접 갱신한다.
// (하이드레이션 불일치 없음, JS 미동작/reduced-motion 환경에서도 값이 보임)
export function CountUp({ to, suffix = "", className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!inView || !node || reduceMotion) return;

    const controls = animate(0, to, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (value) => {
        node.textContent = `${Math.round(value)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduceMotion, to, suffix]);

  return (
    <span ref={ref} className={className}>
      {to}
      {suffix}
    </span>
  );
}
