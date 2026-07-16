"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import Section from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";

// 줄 단위 마스크 리빌 — 문장이 마스크 아래에서 올라오며 등장.
// 주의: 마스크에 가려진(클리핑된) 요소는 IntersectionObserver 교차 판정이 0이라
// 애니메이션 대상이 아닌 바깥 마스크를 관찰하고 variants로 전파한다.
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
        className="block text-balance"
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

// 히어로 바로 아래, 곰선임의 차별점을 한 문장으로 못 박는 영역
export function Statement() {
  return (
    <Section
      aria-label="곰선임의 차별점"
      className="border-y border-border bg-surface/40 py-20 md:py-24"
    >
      <blockquote className="mx-auto max-w-4xl text-center">
        <p className="break-keep text-[1.75rem] font-semibold leading-snug tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-[2.75rem]">
          {/* 모바일에서는 문장 안에서 한 번 더 줄을 내려 균형을 맞춘다 */}
          <MaskLine>
            홈페이지를 만드는 <br className="md:hidden" />
            사람은 많습니다.
          </MaskLine>
          <MaskLine delay={0.14}>
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
              끝까지 운영하는 사람
            </span>
            은 <br className="md:hidden" />
            많지 않습니다.
          </MaskLine>
        </p>
        <Reveal delay={0.3}>
          <p className="mt-6 text-base text-foreground-secondary md:text-lg">
            상담한 사람이 만들고, 만든 사람이 끝까지 운영합니다.
          </p>
        </Reveal>
      </blockquote>
    </Section>
  );
}
