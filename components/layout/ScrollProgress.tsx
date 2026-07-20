"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

// 페이지 스크롤 진행도를 보여주는 상단 인디케이터 바
export function ScrollProgress() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  // 오버슈트 없는 감쇠 설정 — 스크롤보다 더 나갔다 돌아오는 출렁임을 방지
  const progress = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 45,
    restDelta: 0.001,
  });

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[60] h-0.5 origin-left bg-[linear-gradient(to_right,#db2777,#7c3aed,#2563eb,#9333ea)]"
      style={{ scaleX: progress }}
    />
  );
}
