"use client";

// 첫 화면 배너: 대표 제작 사례를 5초마다 넘긴다.
// 마우스를 올리거나 포커스가 들어오면 멈추고, 동작 줄이기 설정이면 자동으로 넘기지 않는다.
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

const INTERVAL = 5000;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const control =
  "grid h-10 w-10 place-items-center rounded-md border border-border bg-white text-foreground transition-[background-color,transform] duration-150 hover:bg-surface active:scale-[0.97]";

export function HeroSlider({ slides }: { slides: Project[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [hold, setHold] = useState(false);
  const reduce = useReducedMotionSafe();
  const auto = playing && !hold && !reduce;

  useEffect(() => {
    if (!auto) return;
    const id = setTimeout(() => {
      setDir(1);
      setIndex((i) => (i + 1) % slides.length);
    }, INTERVAL);
    return () => clearTimeout(id);
  }, [auto, index, slides.length]);

  const go = (step: number) => {
    setDir(step);
    setIndex((i) => (i + step + slides.length) % slides.length);
  };

  const work = slides[index];

  return (
    <div
      className="lg:col-span-7"
      role="region"
      aria-roledescription="carousel"
      aria-label="대표 제작 사례"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
    >
      <Link
        href={work.demoUrl}
        data-gtm-cta={`hero_slide_${work.id}`}
        aria-label={`${work.title} 데모 보기`}
        className="relative block aspect-[16/10] overflow-hidden rounded-[10px] border border-border bg-white"
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={work.id}
            custom={dir}
            className="absolute inset-0"
            variants={{
              enter: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: `${d * 4}%` }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: `${d * -4}%` }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0.15 : 0.45, ease: EASE_OUT }}
          >
            <Image
              src={work.imageUrl}
              alt={work.imageAlt}
              width={1440}
              height={900}
              priority={index === 0}
              className="h-full w-full object-cover object-top"
            />
          </motion.div>
        </AnimatePresence>
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <div className="min-w-0 flex-1" aria-live={auto ? "off" : "polite"}>
          <p className="text-[15px] font-bold leading-[1.5] text-accent">{work.category}</p>
          <p className="text-[17px] font-bold leading-[1.5]">{work.title}</p>
        </div>
        <span className="text-[15px] tabular-nums text-foreground-secondary">
          <b className="text-foreground">{index + 1}</b> / {slides.length}
        </span>
        <button type="button" onClick={() => go(-1)} aria-label="이전 사례" className={control}>
          <ChevronLeft size={20} aria-hidden />
        </button>
        <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "자동 넘김 멈춤" : "자동 넘김 시작"} className={control}>
          {playing ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
        </button>
        <button type="button" onClick={() => go(1)} aria-label="다음 사례" className={control}>
          <ChevronRight size={20} aria-hidden />
        </button>
      </div>
    </div>
  );
}
