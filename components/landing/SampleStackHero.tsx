"use client";

// 첫 화면: 왼쪽은 소개, 오른쪽은 업종별 샘플 화면 카드를 겹쳐 쌓아 옆으로 넘겨 본다.
// 맨 위 카드는 끌어서 넘기거나 눌러서 샘플로 들어간다.
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ArrowRight, Check, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/types";
import { estimateFor, manwon } from "@/data/pricing";
import { smallImage } from "@/lib/images";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const container = "mx-auto w-full max-w-[1248px] px-4 md:px-6";
// 뒤에 깔리는 카드 수(맨 위 포함)
const DEPTH = 3;
const SWIPE = 80;

type Tab = { label: string; project: Project };

export function SampleStackHero({ tabs, promises }: { tabs: Tab[]; promises: string[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotionSafe();
  const dragged = useRef(false);
  const n = tabs.length;
  const current = tabs[index];

  const go = (step: number) => {
    setDir(step);
    setIndex((i) => (i + step + n) % n);
  };

  const stack = Array.from({ length: DEPTH }, (_, d) => ({ d, tab: tabs[(index + d) % n] }));

  // 다음: 맨 위 카드가 왼쪽으로 날아가고 새 카드가 맨 뒤에 깔린다. 이전: 그 반대.
  const variants = {
    enter: (dir: number) =>
      reduce
        ? { opacity: 0 }
        : dir > 0
          ? { opacity: 0, scale: 0.85, y: -66, x: 0, rotate: 0 }
          : { opacity: 0, x: "-105%", rotate: -8, zIndex: DEPTH + 1 },
    exit: (dir: number) =>
      reduce
        ? { opacity: 0, transition: { duration: 0.15 } }
        : dir > 0
          ? { opacity: 0, x: "-105%", rotate: -8, zIndex: DEPTH + 1, transition: { duration: 0.32, ease: EASE_OUT } }
          : { opacity: 0, scale: 0.85, y: -66, transition: { duration: 0.2, ease: EASE_OUT } },
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE) go(1);
    else if (info.offset.x > SWIPE) go(-1);
  };

  return (
    <section aria-labelledby="hero-title" className="overflow-hidden border-b border-border bg-surface">
      <div className={`${container} grid items-center gap-10 py-10 md:py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16`}>
        {/* 넘겨지는 카드가 글자 뒤로 지나가게 소개 쪽을 위에 둔다. */}
        <div className="relative z-10">
          <h1 id="hero-title" className="text-[32px] font-bold leading-[1.4] tracking-[-0.02em] md:text-[44px]">
            홈페이지·업무
            <br />
            프로그램 제작
          </h1>
          <ul className="mt-6 flex flex-col gap-2" aria-label="작업 조건">
            {promises.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[17px] font-bold leading-[1.5]">
                <Check size={20} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href={current.project.demoUrl}
            prefetch={false}
            data-gtm-cta={`hero_open_${current.project.id}`}
            className="group mt-8 inline-flex h-14 items-center gap-2 rounded-[6px] bg-accent px-6 text-[17px] font-bold text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            {current.label} 샘플 둘러보기
            <ArrowRight size={20} aria-hidden className="transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div>
          <div className="relative mx-auto w-full max-w-[680px] pt-12" aria-roledescription="carousel" aria-label="업종별 샘플">
            {/* 카드 높이를 잡아 두는 자리. 실제 카드는 그 위에 겹쳐 놓는다. */}
            <div aria-hidden className="invisible">
              <CardBody tab={current} />
            </div>
            <AnimatePresence initial={false} custom={dir}>
              {stack
                .slice()
                .reverse()
                .map(({ d, tab }) => {
                  const top = d === 0;
                  return (
                    <motion.div
                      key={tab.project.id}
                      custom={dir}
                      variants={variants}
                      initial="enter"
                      exit="exit"
                      animate={{
                        opacity: 1,
                        x: 0,
                        rotate: 0,
                        scale: reduce ? 1 : 1 - d * 0.05,
                        y: reduce ? 0 : -d * 22,
                        zIndex: DEPTH - d,
                      }}
                      transition={{ duration: 0.32, ease: EASE_OUT }}
                      drag={top ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.7}
                      onDragStart={() => (dragged.current = true)}
                      onDragEnd={onDragEnd}
                      aria-hidden={!top}
                      className={`absolute inset-x-0 bottom-0 origin-top ${top ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
                    >
                      <Link
                        href={tab.project.demoUrl}
                        prefetch={false}
                        tabIndex={top ? undefined : -1}
                        draggable={false}
                        data-gtm-cta={`hero_card_${tab.project.id}`}
                        onPointerDown={() => (dragged.current = false)}
                        onClick={(e) => dragged.current && e.preventDefault()}
                        className="block"
                      >
                        <CardBody tab={tab} dim={!top} />
                      </Link>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              aria-label="이전 샘플"
              onClick={() => go(-1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-white text-foreground-secondary transition-colors hover:border-foreground-tertiary hover:text-foreground"
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <p aria-live="polite" className="min-w-[96px] text-center text-[15px] leading-[1.5] text-foreground-secondary tabular-nums">
              <b className="text-foreground">{index + 1}</b> / {n}
            </p>
            <button
              type="button"
              aria-label="다음 샘플"
              onClick={() => go(1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-white text-foreground-secondary transition-colors hover:border-foreground-tertiary hover:text-foreground"
            >
              <ChevronRight size={20} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CardBody({ tab, dim = false }: { tab: Tab; dim?: boolean }) {
  const { label, project } = tab;
  const est = estimateFor(project.id);
  return (
    <div className="group overflow-hidden rounded-[12px] border border-[#cdd1d5] bg-white shadow-[0_16px_40px_-16px_rgba(30,33,36,0.35)]">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-surface">
        <picture>
          <source media="(min-width: 1024px)" srcSet={project.imageUrl} />
          <img
            src={smallImage(project.imageUrl)}
            alt={dim ? "" : project.imageAlt}
            draggable={false}
            decoding="async"
            className="h-full w-full object-cover object-left-top transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        </picture>
        {dim && <span aria-hidden className="absolute inset-0 bg-[#1e2124]/10" />}
      </div>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <p className="text-[17px] font-bold leading-[1.5]">{label} 샘플</p>
          <p className="truncate text-[15px] leading-[1.5] text-foreground-secondary">{project.title}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {est && <b className="text-[17px] tabular-nums">{manwon(est.total)}</b>}
          <ExternalLink size={18} aria-hidden className="text-foreground-tertiary transition-colors group-hover:text-accent" />
        </div>
      </div>
    </div>
  );
}
