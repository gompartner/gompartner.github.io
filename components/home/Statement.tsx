"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import Section from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";

// 줄 단위 마스크 리빌 — 문장이 마스크 아래에서 올라오며 등장
function MaskLine({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      className="block overflow-hidden pb-[0.12em] -mb-[0.12em]"
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
    >
      <motion.span
        className="block"
        variants={{
          hidden: { y: "110%" },
          show: {
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 20, delay },
          },
        }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

export function Statement() {
  return (
    <Section
      aria-label="곰선임의 차별점"
      className="bg-surface py-24 md:py-32 lg:py-40"
    >
      <blockquote className="max-w-4xl">
        <p className="break-keep text-[clamp(1.875rem,4.6vw,3.25rem)] font-light leading-[1.2] tracking-tight text-foreground">
          <MaskLine>홈페이지를 만드는 사람은 많습니다.</MaskLine>
          <MaskLine delay={0.14}>
            <span className="font-extrabold text-accent">끝까지 운영하는 사람</span>
            은 많지 않습니다.
          </MaskLine>
        </p>
        <Reveal delay={0.3}>
          <p className="mt-6 text-lg text-foreground-secondary md:text-xl">
            상담한 사람이 만들고, 만든 사람이 끝까지 운영합니다.
          </p>
        </Reveal>
      </blockquote>
    </Section>
  );
}
