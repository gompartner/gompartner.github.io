"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useEffect, useState } from "react";
import type { PointerEvent, ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** 최대 기울기 (deg) */
  maxTilt?: number;
}

// 커서 위치를 따라 카드가 3D로 기울어지는 래퍼.
// 터치 기기·모션 감소 설정에서는 틸트 없이 눌림 피드백만 유지한다.
export function TiltCard({ children, className, maxTilt = 8 }: TiltCardProps) {
  const reduceMotion = useReducedMotion();
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    setFinePointer(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 260, damping: 22 });
  const springY = useSpring(rotateY, { stiffness: 260, damping: 22 });

  const tiltEnabled = finePointer && !reduceMotion;

  function handleMove(e: PointerEvent<HTMLDivElement>) {
    if (!tiltEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-py * maxTilt * 2);
    rotateY.set(px * maxTilt * 2);
  }

  function handleLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      className={className}
      style={
        tiltEnabled
          ? { rotateX: springX, rotateY: springY, transformPerspective: 1100 }
          : undefined
      }
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}
