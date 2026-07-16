"use client";

import { motion, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

// 히어로 배경: 마우스를 따라 부드럽게 움직이는 모프 그라디언트 블롭.
// 바깥 motion.div가 커서 추적(translate), 안쪽 div가 형태 모프(.animate-blob)를 담당한다.
export function HeroBlobs() {
  const reduceMotion = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);

  const ax = useSpring(0, { stiffness: 40, damping: 18 });
  const ay = useSpring(0, { stiffness: 40, damping: 18 });
  const bx = useSpring(0, { stiffness: 26, damping: 18 });
  const by = useSpring(0, { stiffness: 26, damping: 18 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setFinePointer(fine);
    if (!fine || reduceMotion) return;

    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      ax.set(nx * 90);
      ay.set(ny * 90);
      bx.set(nx * -130);
      by.set(ny * -130);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion, ax, ay, bx, by]);

  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        style={finePointer && !reduceMotion ? { x: ax, y: ay } : undefined}
        className="absolute -top-[30%] -left-[12%] h-[34rem] w-[34rem]"
      >
        <div className="animate-blob h-full w-full bg-[radial-gradient(circle_at_35%_35%,rgba(0,113,227,0.16),transparent_65%)] blur-3xl dark:bg-[radial-gradient(circle_at_35%_35%,rgba(41,151,255,0.22),transparent_65%)]" />
      </motion.div>
      <motion.div
        style={finePointer && !reduceMotion ? { x: bx, y: by } : undefined}
        className="absolute -bottom-[35%] -right-[10%] h-[30rem] w-[30rem]"
      >
        <div
          className="animate-blob h-full w-full bg-[radial-gradient(circle_at_60%_40%,rgba(122,60,255,0.10),transparent_65%)] blur-3xl dark:bg-[radial-gradient(circle_at_60%_40%,rgba(122,60,255,0.16),transparent_65%)]"
          style={{ animationDelay: "-4.5s" }}
        />
      </motion.div>
    </div>
  );
}
