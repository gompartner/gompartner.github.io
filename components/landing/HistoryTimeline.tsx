"use client";

// 주요 경력: 연도로 소속을 짐작할 수 없도록 연도 없이 발주처 유형별로 실제 작업만 보여 준다.
// 같은 종류로 다시 만든 데모가 있으면 작업 옆에 데모 링크를 단다.
import Link from "next/link";
import { motion } from "framer-motion";
import type { HistoryGroup } from "@/lib/history";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function HistoryTimeline({ groups }: { groups: HistoryGroup[] }) {
  const reduce = useReducedMotionSafe();

  return (
    <div className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-2">
      {groups.map((g, i) => (
        <motion.section
          key={g.group}
          aria-labelledby={`history-${i}`}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: reduce ? 0.15 : 0.32, ease: EASE_OUT, delay: reduce ? 0 : (i % 2) * 0.05 }}
        >
          <h3 id={`history-${i}`} className="border-b border-foreground pb-2 text-[19px] font-bold leading-[1.5]">
            {g.group}
          </h3>
          <ul>
            {g.items.map((h) => (
              <li key={h.work} className="flex items-baseline gap-3 border-b border-border py-3">
                <span className="w-[68px] shrink-0 text-[15px] leading-[1.5] text-foreground-secondary">{h.kind}</span>
                <span className="flex-1 text-[17px] leading-[1.5]">{h.work}</span>
                {h.demoUrl && (
                  <Link
                    href={h.demoUrl}
                    aria-label={`${h.demoTitle} 데모 보기`}
                    className="shrink-0 text-[15px] font-bold leading-[1.5] text-accent underline-offset-4 hover:underline"
                  >
                    데모
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </motion.section>
      ))}
    </div>
  );
}
