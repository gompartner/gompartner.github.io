"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroMockup } from "@/components/home/HeroMockup";
import { HeroBlobs } from "@/components/home/HeroBlobs";

// H1은 LCP 요소라 애니메이션 없이 즉시 렌더하고,
// 보조 요소만 스프링 물리 스태거로 등장시킨다.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

export function Hero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // 스크롤에 따라 목업이 미세하게 커지는 패럴랙스 줌
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mockupScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-6 pt-24 pb-20 md:px-12 md:pt-32 md:pb-24 lg:px-24 lg:pt-36"
    >
      <HeroBlobs />

      <motion.div
        variants={container}
        initial={reduceMotion ? false : "hidden"}
        animate="show"
        className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="flex flex-col items-start gap-6">
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-foreground-secondary"
          >
            <span
              className="h-2 w-2 rounded-full bg-success animate-pulse motion-reduce:animate-none"
              aria-hidden
            />
            상담부터 제작·운영까지 직접 진행합니다
          </motion.span>

          <h1 className="break-keep text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-[3rem]">
            홈페이지를 만드는 것에서 끝나지 않습니다.
            <br />
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
              오픈 이후의 운영까지
            </span>{" "}
            함께합니다.
          </h1>

          <motion.p
            variants={item}
            className="max-w-xl break-keep text-lg leading-relaxed text-foreground-secondary"
          >
            소상공인과 기업을 위한 홈페이지 제작 및 운영. 제작부터 유지보수,
            검색 노출까지 직접 챙깁니다.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap items-center gap-3 pt-1">
            <Button href="/contact" data-gtm-cta="hero_contact">
              무료 상담하기
              <ArrowRight size={18} aria-hidden />
            </Button>
            <Button href="#showcase" variant="outline" data-gtm-cta="hero_portfolio">
              포트폴리오 보기
            </Button>
          </motion.div>

          <motion.p variants={item} className="text-sm text-foreground-tertiary">
            상담과 견적은 무료입니다.
          </motion.p>
        </div>

        {/* 목업은 데스크톱에서만 — 모바일 LCP 보호 */}
        <motion.div variants={item} className="hidden lg:block">
          <motion.div style={reduceMotion ? undefined : { scale: mockupScale }}>
            <HeroMockup />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
