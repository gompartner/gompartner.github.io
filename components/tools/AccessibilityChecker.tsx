"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Printer, RotateCcw } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { kwcag } from "@/data/kwcag";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 웹접근성 자가 점검표 (KWCAG 2.2, 33개 항목).
   항목마다 예·아니오·해당 없음을 고르면 원칙별 준수율과 고칠 항목을 보여 주고, 결과를 인쇄할 수 있다.
   답변은 이 브라우저에만 저장한다. */

const EASE = [0.23, 1, 0.32, 1] as const;
const STORAGE_KEY = "gs-tool:a11y-check:v1";

type Answer = "yes" | "no" | "na";
const ANSWERS: [Answer, string][] = [
  ["yes", "예"],
  ["no", "아니오"],
  ["na", "해당 없음"],
];

const allItems = kwcag.flatMap((p) => p.items);

export function AccessibilityChecker() {
  const reduce = useReducedMotionSafe();
  const [answers, setAnswers] = useLocalStorage<Record<string, Answer>>(STORAGE_KEY, {});
  const set = (no: string, a: Answer) => setAnswers((s) => ({ ...s, [no]: a }));

  const answered = allItems.filter((i) => answers[i.no]).length;
  const scored = allItems.filter((i) => answers[i.no] && answers[i.no] !== "na");
  const passed = scored.filter((i) => answers[i.no] === "yes").length;
  const rate = scored.length ? Math.round((passed / scored.length) * 100) : 0;
  const failed = allItems.filter((i) => answers[i.no] === "no");

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="min-w-0 print:hidden">
        {kwcag.map((p, pi) => (
          <section key={p.name} aria-labelledby={`principle-${pi}`} className="mt-8 first:mt-0">
            <h2 id={`principle-${pi}`} className="border-b-2 border-foreground pb-2 text-[19px] font-bold">
              원칙 {pi + 1}. {p.name}
              <span className="ml-2 text-[15px] font-normal text-foreground-secondary">{p.items.length}개 항목</span>
            </h2>
            <ol>
              {p.items.map((it) => {
                const a = answers[it.no];
                return (
                  <li key={it.no} className="border-b border-border py-4">
                    <fieldset>
                      <legend className="text-[17px] font-bold">
                        <span className="mr-2 tabular-nums text-foreground-tertiary">{it.no}</span>
                        {it.title}
                      </legend>
                      <p className="mt-1 text-[16px] leading-[1.6] text-foreground-secondary">{it.how}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {ANSWERS.map(([v, label]) => {
                          const on = a === v;
                          const tone = v === "yes" ? "border-[#228738] bg-[#e8f5eb] text-[#1b6b2d]" : v === "no" ? "border-[#b42318] bg-[#fde7e9] text-[#b42318]" : "border-[#6d7882] bg-surface text-foreground";
                          return (
                            <label
                              key={v}
                              className={`inline-flex h-10 cursor-pointer items-center rounded-md border px-4 text-[15px] font-bold transition-colors ${on ? tone : "border-border hover:bg-surface"}`}
                            >
                              <input type="radio" name={it.no} checked={on} onChange={() => set(it.no, v)} className="sr-only" />
                              {label}
                            </label>
                          );
                        })}
                      </div>
                      <AnimatePresence initial={false}>
                        {a === "no" && (
                          <motion.p
                            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                            transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE }}
                            className="overflow-hidden text-[15px] leading-[1.6] text-[#b42318]"
                          >
                            <span className="mt-3 block rounded-md bg-[#fde7e9] px-3 py-2">개선 방법: {it.fix}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </fieldset>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      <aside aria-labelledby="result-title" className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-auto">
        <div className="rounded-[10px] border border-border p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 id="result-title" className="text-[19px] font-bold">
              점검 결과
            </h2>
            <span className="text-[15px] text-foreground-secondary tabular-nums">
              {answered}/{allItems.length}개 답함
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-secondary print:hidden" aria-hidden>
            <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${(answered / allItems.length) * 100}%` }} transition={{ duration: reduce ? 0 : 0.3, ease: EASE }} />
          </div>

          <p className="mt-5 text-[15px] text-foreground-secondary">준수율 (해당 없음 제외)</p>
          <p className="text-[40px] font-bold leading-tight tabular-nums">
            {rate}
            <span className="text-[20px]">%</span>
            <span className="ml-2 text-[15px] font-normal text-foreground-secondary">
              {passed}/{scored.length}개 준수
            </span>
          </p>

          <ul className="mt-4 grid gap-2.5">
            {kwcag.map((p) => {
              const s = p.items.filter((i) => answers[i.no] && answers[i.no] !== "na");
              const ok = s.filter((i) => answers[i.no] === "yes").length;
              const r = s.length ? ok / s.length : 0;
              return (
                <li key={p.name} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-2 text-[15px]">
                  <span>{p.name}</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-surface-secondary">
                    <motion.span className="block h-full rounded-full bg-[#228738]" style={{ originX: 0 }} animate={{ width: `${r * 100}%` }} transition={{ duration: reduce ? 0 : 0.4, ease: EASE }} />
                  </span>
                  <span className="text-right tabular-nums text-foreground-secondary">{s.length ? `${Math.round(r * 100)}%` : "-"}</span>
                </li>
              );
            })}
          </ul>

          {failed.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <h3 className="text-[16px] font-bold text-[#b42318]">고칠 항목 {failed.length}개</h3>
              <ul className="mt-2 grid gap-2 text-[15px] leading-[1.5]">
                <AnimatePresence initial={false}>
                  {failed.map((it) => (
                    <motion.li
                      key={it.no}
                      layout={!reduce}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reduce ? 0.12 : 0.2, ease: EASE }}
                    >
                      <b className="tabular-nums">{it.no}</b> {it.title}
                      <span className="hidden print:block text-foreground-secondary">개선 방법: {it.fix}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2 print:hidden">
            <button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center gap-1.5 rounded-md bg-accent px-4 text-[15px] font-bold text-accent-foreground hover:bg-accent-hover">
              <Printer size={16} aria-hidden />
              결과 인쇄
            </button>
            <button type="button" onClick={() => setAnswers({})} className="inline-flex h-11 items-center gap-1.5 rounded-md border border-[#6d7882] px-4 text-[15px] font-bold hover:bg-surface">
              <RotateCcw size={16} aria-hidden />
              다시 점검
            </button>
          </div>
        </div>
        <p className="mt-3 text-[14px] leading-[1.6] text-foreground-secondary print:hidden">
          담당자가 스스로 점검하는 표입니다. 웹접근성 인증 심사를 대신하지 않으며, 답변은 이 브라우저에만 저장됩니다.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-surface p-5 print:hidden">
          <p className="text-[16px] font-bold">고칠 항목이 많거나 인증 심사를 앞두고 있나요?</p>
          <ChannelTalkButton cta="tool_a11y_chat" className="inline-flex h-11 items-center rounded-md bg-accent px-4 text-[15px] font-bold text-accent-foreground hover:bg-accent-hover">
            채팅 상담
          </ChannelTalkButton>
        </div>
      </aside>
    </div>
  );
}
