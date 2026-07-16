"use client";

import Link from "next/link";
import { motion, useScroll, useSpring, type Variants } from "framer-motion";
import {
  ArrowRight,
  Gauge,
  Globe2,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  RefreshCcw,
} from "lucide-react";

/* ── 모션 프리셋 ─────────────────────────────────────────────
   스프링 물리(stiffness 100 / damping 20)로 탄력 있게 등장하고,
   섹션 블록은 뷰포트 30% 진입 시 한 번만 나타난다. */

const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: spring },
};

const sectionReveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: spring,
} as const;

const cardHover = {
  whileHover: {
    scale: 1.03,
    y: -5,
    transition: { type: "spring", stiffness: 300, damping: 22 },
  },
  whileTap: { scale: 0.98 },
} as const;

/* ── 콘텐츠 ── */

const features = [
  {
    icon: Globe2,
    title: "홈페이지 제작",
    description: "검색에 잡히고, 신뢰를 주고, 문의로 이어지는 홈페이지를 만듭니다.",
  },
  {
    icon: Megaphone,
    title: "랜딩페이지 제작",
    description: "광고비가 아깝지 않도록, 방문자가 신청까지 도달하는 흐름을 설계합니다.",
  },
  {
    icon: MessageSquare,
    title: "예약·문의 시스템",
    description: "전화를 놓쳐도 예약과 문의가 쌓입니다. 접수부터 알림까지 자동으로.",
  },
  {
    icon: LayoutDashboard,
    title: "관리자 시스템",
    description: "엑셀로 하던 일을 화면 하나로. 운영자 눈높이에 맞춰 만듭니다.",
  },
  {
    icon: Gauge,
    title: "검색 노출·속도",
    description: "네이버·구글 검색 노출과 빠른 로딩은 옵션이 아니라 기본값입니다.",
  },
  {
    icon: RefreshCcw,
    title: "유지보수·운영",
    description: "오픈 후가 진짜 시작입니다. 수정과 개선까지 끝까지 함께합니다.",
  },
];

const steps = ["상담", "기획", "디자인", "개발", "검수", "오픈", "운영"];

export function LandingB() {
  // 상단 스크롤 진행 인디케이터 — useScroll 진행도를 스프링으로 부드럽게
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 스크롤 진행 바 */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-50 h-1 origin-left bg-gradient-to-r from-accent to-accent-hover"
        style={{ scaleX: progress }}
      />

      {/* 미니멀 헤더 */}
      <header className="fixed top-1 left-0 right-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-12">
          <span className="text-lg font-semibold tracking-tight">
            곰<span className="text-accent">선임</span>
          </span>
          <motion.span {...cardHover} className="inline-block">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
            >
              상담 문의
            </Link>
          </motion.span>
        </nav>
      </header>

      <main>
        {/* ── 1. 히어로: 스프링 스태거 진입 ── */}
        <section className="relative overflow-hidden px-6 pt-40 pb-28 md:px-12">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_45%_at_50%_-5%,rgba(0,113,227,0.12),transparent)] dark:bg-[radial-gradient(ellipse_60%_45%_at_50%_-5%,rgba(41,151,255,0.16),transparent)]"
          />
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="show"
            className="mx-auto flex max-w-4xl flex-col items-center text-center"
          >
            <motion.span
              variants={heroItem}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-foreground-secondary"
            >
              <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
              상담부터 제작·운영까지 직접 진행합니다
            </motion.span>

            <motion.h1
              variants={heroItem}
              className="mt-8 break-keep text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl"
            >
              홈페이지는 예쁘게 만드는 것보다
              <br />
              <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
                문의가 들어오게
              </span>{" "}
              만드는 것이 중요합니다
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="mt-7 max-w-2xl break-keep text-lg leading-relaxed text-foreground-secondary"
            >
              소상공인과 기업을 위한 홈페이지 제작 및 운영. 제작부터 유지보수,
              검색 노출까지 직접 챙깁니다.
            </motion.p>

            <motion.div variants={heroItem} className="mt-10 flex flex-wrap justify-center gap-3">
              <motion.span {...cardHover} className="inline-block">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-medium text-accent-foreground"
                >
                  무료 상담하기
                  <ArrowRight size={18} aria-hidden />
                </Link>
              </motion.span>
              <motion.span {...cardHover} className="inline-block">
                <Link
                  href="/portfolio"
                  className="inline-flex items-center rounded-full border border-border px-7 py-3.5 font-medium text-foreground"
                >
                  포트폴리오 보기
                </Link>
              </motion.span>
            </motion.div>

            <motion.p variants={heroItem} className="mt-6 text-sm text-foreground-tertiary">
              상담과 견적은 무료입니다.
            </motion.p>
          </motion.div>
        </section>

        {/* ── 2. 스테이트먼트 ── */}
        <section className="border-y border-border bg-surface/40 px-6 py-24 md:px-12">
          <motion.blockquote {...sectionReveal} className="mx-auto max-w-4xl text-center">
            <p className="break-keep text-3xl font-semibold leading-snug tracking-tight md:text-4xl">
              홈페이지를 만드는 사람은 많습니다.
              <br />
              <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
                끝까지 운영하는 사람
              </span>
              은 많지 않습니다.
            </p>
            <p className="mt-6 text-foreground-secondary">
              상담한 사람이 만들고, 만든 사람이 끝까지 운영합니다.
            </p>
          </motion.blockquote>
        </section>

        {/* ── 3. 기능 카드: hover 부양 + tap 눌림 ── */}
        <section className="px-6 py-28 md:px-12">
          <div className="mx-auto max-w-6xl">
            <motion.div {...sectionReveal}>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
                Services
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                필요한 것만, 제대로
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-foreground-secondary">
                과한 기능을 권하지 않습니다. 지금 사업에 필요한 범위만 제안하고,
                오래 쓸 수 있게 만듭니다.
              </p>
            </motion.div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }, i) => (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ ...spring, delay: (i % 3) * 0.08 }}
                  {...cardHover}
                  className="cursor-default rounded-3xl border border-border bg-surface p-7 shadow-sm hover:shadow-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Icon size={22} aria-hidden />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground-secondary">
                    {description}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. 프로세스 스트립 ── */}
        <section className="border-y border-border bg-surface/40 px-6 py-24 md:px-12">
          <div className="mx-auto max-w-6xl">
            <motion.h2
              {...sectionReveal}
              className="text-center text-3xl font-semibold tracking-tight md:text-4xl"
            >
              진행은 이렇게 됩니다
            </motion.h2>
            <motion.ol
              {...sectionReveal}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-3 gap-y-4"
            >
              {steps.map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  <motion.span
                    {...cardHover}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium"
                  >
                    <span className="text-accent">{i + 1}</span>
                    {step}
                  </motion.span>
                  {i < steps.length - 1 && (
                    <ArrowRight size={14} className="text-foreground-tertiary" aria-hidden />
                  )}
                </li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* ── 5. CTA ── */}
        <section className="px-6 py-28 md:px-12">
          <motion.div
            {...sectionReveal}
            className="mx-auto max-w-4xl rounded-[2.5rem] border border-accent/15 bg-gradient-to-br from-accent/12 via-accent/6 to-transparent p-10 text-center md:p-16"
          >
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              지금 필요한 것부터, 가볍게 시작하세요
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-foreground-secondary">
              홈페이지 제작을 고민하고 계신다면 부담 없이 상담해보세요.
            </p>
            <motion.span {...cardHover} className="mt-9 inline-block">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-medium text-accent-foreground"
              >
                무료 상담하기
                <ArrowRight size={18} aria-hidden />
              </Link>
            </motion.span>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-12 text-center text-sm text-foreground-tertiary">
        © 2026 곰선임 — Framer Motion 랜딩 시안 B
      </footer>
    </div>
  );
}
