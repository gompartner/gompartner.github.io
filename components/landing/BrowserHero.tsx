"use client";

// 첫 화면: 브라우저 창 하나에 업종을 탭으로 두고, 고른 데모를 그 자리에서 띄운다.
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ExternalLink, Lock, RotateCw } from "lucide-react";
import type { Project } from "@/lib/types";
import { estimateFor, manwon } from "@/data/pricing";
import { smallImage } from "@/lib/images";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { LiveDemoFrame } from "./LiveDemoFrame";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const container = "mx-auto w-full max-w-[1248px] px-4 md:px-6";

export function BrowserHero({ tabs, promises }: { tabs: { label: string; project: Project }[]; promises: string[] }) {
  const [active, setActive] = useState(0);
  const [reload, setReload] = useState(0);
  const reduce = useReducedMotionSafe();
  const { label, project } = tabs[active];
  const est = estimateFor(project.id);

  return (
    <section aria-labelledby="hero-title" className="border-b border-border bg-surface">
      <div className={`${container} py-8 md:py-10`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <h1 id="hero-title" className="text-[32px] font-bold leading-[1.4] tracking-[-0.02em] md:text-[44px]">
            홈페이지·업무 프로그램 제작
          </h1>
          <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="작업 조건">
            {promises.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-[16px] font-bold leading-[1.5]">
                <Check size={18} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 overflow-hidden rounded-[12px] border border-[#b9bec4] bg-white shadow-[0_12px_32px_-12px_rgba(30,33,36,0.25)]">
          <div role="tablist" aria-label="업종별 데모" className="flex items-end gap-1 overflow-x-auto bg-[#dfe2e5] px-2 pt-2 [scrollbar-width:none]">
            {tabs.map((t, i) => {
              const on = i === active;
              return (
                <button
                  key={t.project.id}
                  id={`hero-tab-${t.project.id}`}
                  role="tab"
                  aria-selected={on}
                  aria-controls="hero-panel"
                  data-gtm-cta={`hero_tab_${t.project.id}`}
                  onClick={() => setActive(i)}
                  className={`relative shrink-0 px-2.5 pb-2.5 pt-2 text-[15px] sm:px-4 transition-colors duration-150 ${
                    on ? "font-bold text-foreground" : "text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId={reduce ? undefined : "hero-tab"}
                      aria-hidden
                      className="absolute inset-0 rounded-t-[8px] bg-white"
                      transition={{ duration: 0.22, ease: EASE_OUT }}
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <button
              type="button"
              aria-label="새로 고침"
              onClick={() => setReload((n) => n + 1)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-foreground-secondary hover:bg-surface"
            >
              <RotateCw size={16} aria-hidden />
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-surface px-4 py-1.5 text-[14px] text-foreground-secondary">
              <Lock size={13} className="shrink-0" aria-hidden />
              <span className="truncate">gompartner.co.kr{project.demoUrl}</span>
            </div>
            {est && (
              <p className="hidden shrink-0 pl-2 text-[15px] leading-[1.5] text-foreground-secondary md:block">
                이 화면처럼 만들면 <b className="text-foreground tabular-nums">{manwon(est.total)}</b>
                <span className="ml-2 text-foreground-tertiary">작업 기간 {est.days}일</span>
              </p>
            )}
            <Link
              href={project.demoUrl}
              target="_blank"
              prefetch={false}
              aria-label={`${project.title} 새 창에서 보기`}
              data-gtm-cta={`hero_open_${project.id}`}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-foreground-secondary hover:bg-surface"
            >
              <ExternalLink size={16} aria-hidden />
            </Link>
          </div>
          <div id="hero-panel" role="tabpanel" aria-labelledby={`hero-tab-${project.id}`}>
            <LiveDemoFrame
              key={`${project.id}-${reload}`}
              src={project.demoUrl}
              title={`${label} 데모: ${project.title}`}
              poster={project.imageUrl}
              posterSmall={smallImage(project.imageUrl)}
              ctaId={`hero_open_${project.id}`}
            />
          </div>
        </div>

        {est && (
          <p className="mt-4 text-right text-[16px] md:hidden leading-[1.5] text-foreground-secondary">
            이 화면처럼 만들면 <b className="text-foreground tabular-nums">{manwon(est.total)}</b>
            <span className="ml-3 text-foreground-tertiary">작업 기간 {est.days}일</span>
          </p>
        )}
      </div>
    </section>
  );
}
