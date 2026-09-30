"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/lib/types";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

const secondaryButton =
  "inline-flex h-12 items-center justify-center rounded-md border border-[#6d7882] bg-white px-6 text-[17px] font-bold text-foreground transition-colors hover:bg-surface";

// 신규 제작과 유지보수를 한 목록에 보여 주고, 구분은 썸네일 왼쪽 위 라벨로 표시한다.
// 검색으로 목록이 바뀌면 빠지는 카드는 흐려지며 사라지고, 남는 카드는 새 자리로 미끄러진다.
// 동작 줄이기 설정이면 자리 이동과 크기 변화 없이 흐려지기만 한다.
export function WorksGrid({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotion();
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, transform: "scale(0.96)" };
  const shown = reduce ? { opacity: 1 } : { opacity: 1, transform: "scale(1)" };

  return (
    <ul className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {projects.map((w, i) => (
          <motion.li
            key={w.id}
            layout={!reduce}
            initial={hidden}
            animate={{
              ...shown,
              transition: {
                duration: 0.22,
                ease: EASE_OUT,
                delay: Math.min(i, 5) * 0.04,
              },
            }}
            exit={{ ...hidden, transition: { duration: 0.15, ease: EASE_OUT } }}
            transition={{ layout: { duration: 0.28, ease: EASE_IN_OUT } }}
            className="flex flex-col overflow-hidden rounded-[10px] border border-border bg-white"
          >
            <Link href={w.demoUrl} aria-label={`${w.title} 데모 보기`} className="relative block border-b border-border">
              <Image src={w.imageUrl} alt={w.imageAlt} width={1440} height={900} className="aspect-[16/10] h-auto w-full object-cover object-top" />
              <span
                className={`absolute top-3 left-3 rounded-[4px] px-2 py-0.5 text-[15px] font-bold leading-[1.5] text-white ${
                  w.kind === "유지보수" ? "bg-[#464c53]" : "bg-accent"
                }`}
              >
                {w.kind}
              </span>
            </Link>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-[15px] font-bold leading-[1.5] text-accent">{w.category}</p>
              <h3 className="mt-1 text-[19px] font-bold leading-[1.5]">{w.title}</h3>
              <p className="mt-2 text-[17px] leading-[1.5] text-foreground-secondary">{w.description}</p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="주요 기능">
                {w.features.map((f) => (
                  <li key={f} className="rounded-[4px] bg-surface px-3 py-1 text-[15px] leading-[1.5] text-foreground-secondary">
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <Link href={w.demoUrl} data-gtm-cta={`demo_open_${w.id}`} className={secondaryButton}>
                  데모 보기
                </Link>
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
