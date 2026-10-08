"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/lib/types";
import { SMALL_IMAGE_HEIGHT, SMALL_IMAGE_WIDTH, smallImage } from "@/lib/images";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { estimateFor, manwon } from "@/data/pricing";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

const secondaryButton =
  "inline-flex h-12 items-center justify-center rounded-md border border-[#6d7882] bg-white px-6 text-[17px] font-bold text-foreground transition-colors hover:bg-surface";

// 신규 제작과 유지보수를 한 목록에 보여 주고, 구분은 썸네일 왼쪽 위 라벨로 표시한다.
// 조건이 바뀌면 빠지는 카드는 흐려지고, 남는 카드는 새 자리로 미끄러지고,
// 새로 들어오는 카드는 위에서 아래로 인쇄되듯 드러난다.
// 동작 줄이기 설정이면 자리 이동 없이 흐려지기만 한다.
export function WorksGrid({ projects }: { projects: Project[] }) {
  const reduce = useReducedMotionSafe();
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0% 0% 100% 0% round 10px)" };
  const shown = reduce ? { opacity: 1 } : { opacity: 1, clipPath: "inset(0% 0% 0% 0% round 10px)" };

  return (
    <ul className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {projects.map((w, i) => (
          <motion.li
            key={w.id}
            layout={!reduce}
            initial={hidden}
            animate={{ ...shown, transition: { duration: 0.3, ease: EASE_OUT, delay: 0.08 + Math.min(i, 5) * 0.05 } }}
            exit={{ opacity: 0, transition: { duration: 0.12, ease: EASE_OUT } }}
            transition={{ layout: { duration: 0.28, ease: EASE_IN_OUT } }}
            className="flex flex-col overflow-hidden rounded-[10px] border border-border bg-white"
          >
            <Link href={w.demoUrl} prefetch={false} aria-label={`${w.title} 데모 보기`} className="relative block border-b border-border">
              <Image
                src={smallImage(w.imageUrl)}
                alt={w.imageAlt}
                width={SMALL_IMAGE_WIDTH}
                height={SMALL_IMAGE_HEIGHT}
                className="aspect-[16/10] h-auto w-full object-cover object-top"
              />
              <span
                className={`absolute top-3 left-3 rounded-[4px] px-2 py-0.5 text-[15px] font-bold leading-[1.5] text-white ${
                  w.kind === "유지보수" ? "bg-[#464c53]" : "bg-accent"
                }`}
              >
                {w.kind}
              </span>
            </Link>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-[15px] font-bold leading-[1.5] text-accent">
                {w.category}·{w.layout}
              </p>
              <h3 className="mt-1 text-[19px] font-bold leading-[1.5]">{w.title}</h3>
              <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                <Link href={w.demoUrl} prefetch={false} data-gtm-cta={`demo_open_${w.id}`} className={secondaryButton}>
                  데모 보기
                </Link>
                <PlanPrice projectId={w.id} />
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

/** 데모 수준으로 만들 때의 예상 금액. 업무 프로그램은 별도 견적으로 적는다. */
function PlanPrice({ projectId }: { projectId: string }) {
  const est = estimateFor(projectId);
  return (
    <p className="text-right leading-[1.4]">
      <span className="block text-[15px] text-foreground-secondary">{est ? "예상 금액" : "업무 프로그램"}</span>
      <span className="text-[19px] font-bold tabular-nums">{est ? manwon(est.total) : "별도 견적"}</span>
    </p>
  );
}
