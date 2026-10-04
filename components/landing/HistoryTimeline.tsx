"use client";

// 작업 이력: 연도로 소속을 짐작할 수 없도록 연도 없이 분야별 건수와 대표 프로젝트만 보여 준다.
import { motion } from "framer-motion";
import type { HistoryField } from "@/lib/history";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

interface Props {
  fields: HistoryField[];
  total: number;
}

export function HistoryTimeline({ fields, total }: Props) {
  const reduce = useReducedMotionSafe();

  return (
    <>
      <dl className="mt-8 grid grid-cols-2 gap-3 md:max-w-[430px]">
        {[
          ["프로젝트", `${total}건`],
          ["분야", `${fields.length}개`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[10px] bg-surface px-4 py-4 md:px-5">
            <dt className="text-[15px] leading-[1.5] text-foreground-secondary">{label}</dt>
            <dd className="mt-1 text-[24px] font-bold leading-[1.3] tabular-nums md:text-[32px]">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f, i) => (
          <motion.li
            key={f.field}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: reduce ? 0.15 : 0.32, ease: EASE_OUT, delay: reduce ? 0 : (i % 3) * 0.05 }}
            className="flex flex-col rounded-[10px] border border-border p-5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[19px] font-bold leading-[1.5]">{f.field}</h3>
              <p className="shrink-0 text-[24px] font-bold leading-none tabular-nums text-accent">
                {f.count}
                <span className="ml-0.5 text-[15px] text-foreground-secondary">건</span>
              </p>
            </div>
            <ul className="mt-3 grid gap-1.5 border-t border-border pt-3">
              {f.examples.map((e) => (
                <li key={e} className="text-[15px] leading-[1.5] text-foreground-secondary">
                  {e}
                </li>
              ))}
            </ul>
          </motion.li>
        ))}
      </ul>

    </>
  );
}
