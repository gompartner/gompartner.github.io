"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle2, Circle, Lock, Pause, Play, Printer, RotateCcw, Send, X } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 온라인 강의·수료 관리 LMS 데모 (학원·교육기관용).
   수강생 화면: 차시 영상(슬라이드로 대신함)을 보면 실제로 본 구간만 진도로 잡고, 이어보기와 수료 조건을 보여 준다.
   전 차시 90% 이상 시청과 평가 60점 이상을 채우면 수료증을 출력한다.
   관리자 화면: 수강생 진도 현황, 독려 대상 거르기, 차시별 이탈 구간을 본다.
   기관명·강의·수강생은 모두 가상 데이터다.

   색 (흰 카드 기준 대비): 본문 #1f2421(15:1), 보조 #56605a(6.6:1), 브랜드 #1f5f46(7.6:1, 버튼은 흰 글자),
   이어보기 강조 #c2410c(5.2:1, 한 곳에만 쓴다) */

const C = {
  bg: "#f6f3ec",
  surface: "#ffffff",
  line: "#e4ded2",
  text: "#1f2421",
  muted: "#56605a",
  brand: "#1f5f46",
  brandSoft: "#e5f0ea",
  accent: "#c2410c",
  warn: "#9a3412",
  warnSoft: "#fdecdf",
} as const;

const EASE = [0.23, 1, 0.32, 1] as const;
const STORAGE_KEY = "gs-demo:lms:v1";
const DONE_RATIO = 0.9;
const PASS_SCORE = 60;

interface Lesson {
  title: string;
  duration: number;
  slides: string[];
}

const COURSE = "엑셀 실무 기초";
const LESSONS: Lesson[] = [
  { title: "화면 구성과 데이터 입력", duration: 240, slides: ["리본 메뉴와 시트 구성", "셀 이동 단축키", "자동 채우기", "입력 실수 줄이는 법"] },
  { title: "자주 쓰는 함수 SUM·AVERAGE", duration: 300, slides: ["함수 입력 방법", "SUM으로 합계 내기", "AVERAGE와 반올림", "범위 고정($) 이해하기"] },
  { title: "IF와 조건부 서식", duration: 360, slides: ["IF 함수 구조", "중첩 IF 대신 IFS", "조건부 서식 규칙", "실습: 미납자 표시"] },
  { title: "VLOOKUP으로 표 합치기", duration: 420, slides: ["VLOOKUP 인수 4개", "정확히 일치 찾기", "#N/A 오류 처리", "실습: 단가표 붙이기"] },
  { title: "피벗 테이블로 요약하기", duration: 300, slides: ["피벗 테이블 만들기", "행·열·값 배치", "필터와 슬라이서", "실습: 월별 매출 요약"] },
];

const QUIZ = [
  { q: "여러 칸의 합계를 구하는 함수는?", options: ["SUM", "COUNT", "IF"], answer: 0 },
  { q: "수식을 복사해도 참조 칸이 바뀌지 않게 하는 기호는?", options: ["#", "$", "@"], answer: 1 },
  { q: "다른 표에서 값을 찾아 붙일 때 쓰는 함수는?", options: ["VLOOKUP", "AVERAGE", "ROUND"], answer: 0 },
];

type Seg = [number, number];
interface Progress {
  pos: number;
  segs: Seg[];
}
interface State {
  lessons: Progress[];
  current: number;
  quiz: number | null;
  certNo: string | null;
}

const initialState: State = {
  // 1차시는 다 봤고 2차시는 중간까지 본 상태로 시작한다 (이어보기가 보이도록)
  lessons: LESSONS.map((l, i) => (i === 0 ? { pos: l.duration, segs: [[0, l.duration]] } : i === 1 ? { pos: 132, segs: [[0, 132]] } : { pos: 0, segs: [] })),
  current: 1,
  quiz: null,
  certNo: null,
};

function merge(segs: Seg[]): Seg[] {
  const s = [...segs].sort((a, b) => a[0] - b[0]);
  const out: Seg[] = [];
  for (const [a, b] of s) {
    const last = out[out.length - 1];
    if (last && a <= last[1] + 0.5) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}
const watched = (segs: Seg[]) => segs.reduce((t, [a, b]) => t + (b - a), 0);
const ratio = (p: Progress, l: Lesson) => Math.min(1, watched(p.segs) / l.duration);
// 이름 가운데 글자를 초성으로 가린다 (김하늘 → 김ㅎ늘, 2글자는 김*)
const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
function maskName(name: string) {
  if (name.length < 3) return name[0] + "*";
  const code = name.charCodeAt(1) - 0xac00;
  return name[0] + (code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*") + name.slice(2);
}
const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// 관리자 화면의 가상 수강생 (지금 학습 중인 수강생은 실제 진도와 이어진다)
const LEARNERS = [
  { name: "이서준", progress: 100, days: 1, quiz: 90 },
  { name: "박지민", progress: 86, days: 2, quiz: null },
  { name: "최유나", progress: 100, days: 3, quiz: 70 },
  { name: "정도윤", progress: 32, days: 9, quiz: null },
  { name: "강민서", progress: 64, days: 1, quiz: null },
  { name: "조하은", progress: 12, days: 14, quiz: null },
  { name: "윤시우", progress: 100, days: 5, quiz: 50 },
  { name: "장예린", progress: 0, days: 21, quiz: null },
  { name: "임준호", progress: 48, days: 8, quiz: null },
  { name: "한소율", progress: 92, days: 1, quiz: null },
  { name: "오태민", progress: 20, days: 11, quiz: null },
];
// 차시별로 영상 구간(10칸)마다 남아 있던 수강생 비율 (%)
const DROPOFF = [
  [100, 98, 97, 95, 94, 93, 92, 92, 91, 90],
  [100, 96, 92, 90, 88, 80, 72, 70, 69, 68],
  [100, 97, 93, 85, 70, 66, 64, 63, 62, 61],
  [100, 95, 90, 84, 79, 74, 58, 55, 54, 52],
  [100, 97, 95, 93, 91, 89, 88, 87, 86, 85],
];

type LearnerStatus = "수료" | "학습중" | "독려대상" | "평가미응시";
const statusOf = (progress: number, days: number, quiz: number | null): LearnerStatus =>
  progress >= 90 && quiz !== null && quiz >= PASS_SCORE ? "수료" : progress >= 90 ? "평가미응시" : days >= 7 || progress < 30 ? "독려대상" : "학습중";

export function LmsDemo() {
  const reduce = useReducedMotionSafe();
  const [state, setState, hydrated] = useLocalStorage<State>(STORAGE_KEY, initialState);
  const [view, setView] = useState<"learner" | "admin">("learner");
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const notify = useCallback((text: string) => setToast((t) => ({ id: (t?.id ?? 0) + 1, text })), []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const ratios = state.lessons.map((p, i) => ratio(p, LESSONS[i]));
  const done = ratios.map((r) => r >= DONE_RATIO);
  const courseProgress = Math.round((ratios.reduce((s, r) => s + r, 0) / LESSONS.length) * 100);

  return (
    <div className="min-h-screen pb-24" style={{ background: C.bg, color: C.text }}>
      <header className="border-b bg-white" style={{ borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-3 px-4 py-3 md:px-6">
          <p className="mr-auto text-[18px] font-bold" style={{ color: C.brand }}>
            곰파트너 아카데미
          </p>
          <div role="tablist" aria-label="화면 선택" className="relative flex rounded-full p-1" style={{ background: C.bg }}>
            {(
              [
                ["learner", "내 강의실"],
                ["admin", "관리자"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={view === id}
                onClick={() => setView(id)}
                className="relative rounded-full px-4 py-1.5 text-[15px] font-bold"
                style={{ color: view === id ? "#fff" : C.muted }}
              >
                {view === id && (
                  <motion.span
                    layoutId="lms-view"
                    className="absolute inset-0 rounded-full"
                    style={{ background: C.brand }}
                    transition={reduce ? { duration: 0 } : { duration: 0.25, ease: EASE }}
                  />
                )}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setState(initialState);
              notify("초기화했습니다.");
            }}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[14px] font-bold"
            style={{ color: C.muted }}
          >
            <RotateCcw size={14} aria-hidden />
            초기화
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 pt-6 md:px-6" aria-busy={!hydrated}>
        {view === "learner" ? (
          <Learner state={state} setState={setState} ratios={ratios} done={done} courseProgress={courseProgress} notify={notify} />
        ) : (
          <Admin mine={{ progress: courseProgress, quiz: state.quiz }} notify={notify} />
        )}
      </main>

      <p role="status" aria-live="polite" className="sr-only">
        {toast?.text}
      </p>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4" aria-hidden>
        <AnimatePresence>
          {toast && (
            <motion.p
              key={toast.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE }}
              className="max-w-[520px] rounded-lg px-5 py-3 text-[15px] font-bold text-white shadow-lg"
              style={{ background: C.text }}
            >
              {toast.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

type SetState = (updater: State | ((prev: State) => State)) => void;

function Ring({ value }: { value: number }) {
  const reduce = useReducedMotionSafe();
  const r = 26;
  const len = 2 * Math.PI * r;
  return (
    <div className="relative grid size-16 place-items-center">
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="32" cy="32" r={r} fill="none" stroke={C.line} strokeWidth="6" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={C.brand}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={len}
          animate={{ strokeDashoffset: len * (1 - value / 100) }}
          transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
        />
      </svg>
      <span className="text-[13px] font-bold tabular-nums">{value}%</span>
    </div>
  );
}

function Learner({
  state,
  setState,
  ratios,
  done,
  courseProgress,
  notify,
}: {
  state: State;
  setState: SetState;
  ratios: number[];
  done: boolean[];
  courseProgress: number;
  notify: (t: string) => void;
}) {
  const reduce = useReducedMotionSafe();
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [answers, setAnswers] = useState<(number | null)[]>(QUIZ.map(() => null));
  const [showCert, setShowCert] = useState(false);

  const i = state.current;
  const lesson = LESSONS[i];
  const prog = state.lessons[i];
  const allDone = done.every(Boolean);
  const passed = state.quiz !== null && state.quiz >= PASS_SCORE;

  // 타이머 안에서 최신 진도를 읽기 위해 렌더가 끝난 뒤 값을 옮겨 둔다
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  });

  // 재생 중에는 0.25초마다 위치를 옮기고, 지나온 구간만 본 구간으로 쌓는다.
  // 끝까지 보면 멈추고, 이번에 처음 90%를 넘긴 차시는 완료로 알린다.
  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      const s = latest.current;
      const k = s.current;
      const l = LESSONS[k];
      const p = s.lessons[k];
      const next = Math.min(l.duration, p.pos + 0.25 * speed);
      const segs = merge([...p.segs, [p.pos, next]]);
      const before = ratio(p, l) >= DONE_RATIO;
      const after = watched(segs) / l.duration >= DONE_RATIO;
      const updated = { ...s, lessons: s.lessons.map((x, j) => (j === k ? { pos: next, segs } : x)) };
      latest.current = updated;
      setState(updated);
      if (!before && after) notify(`${k + 1}차시 학습을 완료했습니다.`);
      if (next >= l.duration) setPlaying(false);
    }, 250);
    return () => window.clearInterval(t);
  }, [playing, speed, setState, notify]);

  const seek = (sec: number) => setState((s) => ({ ...s, lessons: s.lessons.map((x, k) => (k === s.current ? { ...x, pos: sec } : x)) }));
  const open = (k: number) => {
    setPlaying(false);
    setState((s) => ({ ...s, current: k }));
  };

  const slide = lesson.slides[Math.min(lesson.slides.length - 1, Math.floor((prog.pos / lesson.duration) * lesson.slides.length))];
  const canResume = prog.pos > 5 && prog.pos < lesson.duration && !playing;

  const submitQuiz = () => {
    const score = Math.round((answers.filter((a, k) => a === QUIZ[k].answer).length / QUIZ.length) * 100);
    setState((s) => ({ ...s, quiz: score, certNo: score >= PASS_SCORE ? s.certNo ?? `GSA-2026-${String(1000 + Math.floor(score * 7.3)).padStart(5, "0")}` : s.certNo }));
    notify(score >= PASS_SCORE ? `최종평가 ${score}점으로 합격입니다. 수료증 출력이 가능합니다.` : `최종평가 ${score}점으로 불합격입니다. 합격 기준은 ${PASS_SCORE}점 이상입니다.`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section aria-label="강의 보기" className="min-w-0">
        <div className="overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: C.line }}>
          <div className="relative aspect-video" style={{ background: "#16211c" }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${i}-${slide}`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="absolute inset-0 flex flex-col justify-center px-8 text-white md:px-14"
              >
                <p className="text-[14px] opacity-70">
                  {i + 1}차시 · {lesson.title}
                </p>
                <p className="mt-2 text-[26px] font-bold leading-[1.3] md:text-[40px]">{slide}</p>
              </motion.div>
            </AnimatePresence>
            {canResume && (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="absolute bottom-4 left-4 inline-flex h-11 items-center gap-1.5 rounded-md px-4 text-[15px] font-bold text-white"
                style={{ background: C.accent }}
              >
                <Play size={16} aria-hidden />
                이어 학습하기 ({clock(prog.pos)})
              </button>
            )}
          </div>

          <div className="px-4 pt-3 pb-4">
            {/* 본 구간은 진하게, 건너뛴 구간은 빗금으로 보여 준다 */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="재생 위치"
              aria-valuemin={0}
              aria-valuemax={lesson.duration}
              aria-valuenow={Math.round(prog.pos)}
              aria-valuetext={`${clock(prog.pos)} / ${clock(lesson.duration)}`}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") seek(Math.min(lesson.duration, prog.pos + 10));
                if (e.key === "ArrowLeft") seek(Math.max(0, prog.pos - 10));
              }}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                seek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * lesson.duration);
              }}
              className="relative h-3 cursor-pointer rounded-full"
              style={{ background: `repeating-linear-gradient(135deg, ${C.line} 0 4px, #f3efe6 4px 8px)` }}
            >
              {prog.segs.map(([a, b]) => (
                <span key={a} className="absolute inset-y-0 rounded-full" style={{ left: `${(a / lesson.duration) * 100}%`, width: `${((b - a) / lesson.duration) * 100}%`, background: C.brand }} />
              ))}
              <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white shadow" style={{ left: `${(prog.pos / lesson.duration) * 100}%`, borderColor: C.brand }} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (prog.pos >= lesson.duration) seek(0);
                  setPlaying((p) => !p);
                }}
                aria-label={playing ? "일시정지" : "재생"}
                className="grid size-11 place-items-center rounded-full text-white"
                style={{ background: C.brand }}
              >
                {playing ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
              </button>
              <span className="text-[15px] tabular-nums">
                {clock(prog.pos)} / {clock(lesson.duration)}
              </span>
              <label className="ml-auto flex items-center gap-2 text-[14px]" style={{ color: C.muted }}>
                배속
                <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="h-9 rounded-md border bg-white px-2 text-[14px]" style={{ borderColor: C.line, color: C.text }}>
                  <option value={1}>1.0배속</option>
                  <option value={1.5}>1.5배속</option>
                  <option value={2}>2.0배속</option>
                  <option value={30}>30배속(시연용)</option>
                </select>
              </label>
            </div>
            <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
              차시 진도율 <b className="tabular-nums" style={{ color: C.text }}>{Math.round(ratios[i] * 100)}%</b> (학습 인정 기준 90% 이상, 실제 재생 구간만 인정)
            </p>
          </div>
        </div>

        {allDone && (
          <section aria-labelledby="quiz-title" className="mt-6 rounded-[10px] border bg-white p-5" style={{ borderColor: C.line }}>
            <h2 id="quiz-title" className="text-[18px] font-bold">
              최종평가
            </h2>
            <ol className="mt-3 grid gap-4">
              {QUIZ.map((q, k) => (
                <li key={q.q}>
                  <p className="text-[16px] font-bold">
                    {k + 1}. {q.q}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {q.options.map((o, oi) => (
                      <label key={o} className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-[15px]" style={{ borderColor: answers[k] === oi ? C.brand : C.line, background: answers[k] === oi ? C.brandSoft : "#fff" }}>
                        <input type="radio" name={`q${k}`} checked={answers[k] === oi} onChange={() => setAnswers((a) => a.map((x, j) => (j === k ? oi : x)))} className="sr-only" />
                        {o}
                      </label>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
            <button
              type="button"
              disabled={answers.some((a) => a === null)}
              onClick={submitQuiz}
              className="mt-4 h-11 rounded-md px-5 text-[15px] font-bold text-white disabled:opacity-40"
              style={{ background: C.brand }}
            >
              제출
            </button>
          </section>
        )}
      </section>

      <aside className="grid content-start gap-4">
        <section aria-labelledby="course-title" className="rounded-[10px] border bg-white p-5" style={{ borderColor: C.line }}>
          <div className="flex items-center gap-4">
            <Ring value={courseProgress} />
            <div>
              <p className="text-[14px]" style={{ color: C.muted }}>
                수강과정
              </p>
              <h2 id="course-title" className="text-[18px] font-bold">
                {COURSE}
              </h2>
            </div>
          </div>
          <h3 className="mt-5 text-[15px] font-bold">수료기준</h3>
          <ul className="mt-2 grid gap-1.5 text-[15px]">
            {[
              [`차시별 진도율 90% 이상 (${done.filter(Boolean).length}/${LESSONS.length}차시)`, allDone],
              [`최종평가 ${PASS_SCORE}점 이상${state.quiz !== null ? ` (${state.quiz}점)` : ""}`, passed],
            ].map(([t, ok]) => (
              <li key={String(t)} className="flex items-center gap-2">
                {ok ? <CheckCircle2 size={18} style={{ color: C.brand }} aria-hidden /> : <Circle size={18} style={{ color: C.line }} aria-hidden />}
                <span style={{ color: ok ? C.text : C.muted }}>{t}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            disabled={!passed}
            onClick={() => setShowCert(true)}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md text-[15px] font-bold text-white disabled:opacity-40"
            style={{ background: C.brand }}
          >
            {passed ? <Printer size={16} aria-hidden /> : <Lock size={16} aria-hidden />}
            수료증 출력
          </button>
        </section>

        <section aria-labelledby="lessons-title" className="rounded-[10px] border bg-white" style={{ borderColor: C.line }}>
          <h2 id="lessons-title" className="border-b px-5 py-3 text-[16px] font-bold" style={{ borderColor: C.line }}>
            차시 목록
          </h2>
          <ol>
            {LESSONS.map((l, k) => (
              <li key={l.title}>
                <button
                  type="button"
                  aria-current={k === i ? "true" : undefined}
                  onClick={() => open(k)}
                  className="flex w-full items-center gap-3 border-b px-5 py-3 text-left"
                  style={{ borderColor: C.line, background: k === i ? C.brandSoft : undefined }}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-bold" style={done[k] ? { background: C.brand, color: "#fff" } : { background: C.bg, color: C.muted }}>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={done[k] ? "ok" : "no"}
                        initial={reduce ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 500, damping: 22 }}
                      >
                        {done[k] ? <Check size={15} aria-hidden /> : k + 1}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold">{l.title}</span>
                    <span className="mt-1 block h-1.5 overflow-hidden rounded-full" style={{ background: C.bg }}>
                      <span className="block h-full rounded-full" style={{ width: `${Math.round(ratios[k] * 100)}%`, background: C.brand }} />
                    </span>
                  </span>
                  <span className="shrink-0 text-[13px] tabular-nums" style={{ color: C.muted }}>
                    {Math.floor(l.duration / 60)}분
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      </aside>

      <AnimatePresence>
        {showCert && state.certNo && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center overflow-auto bg-black/50 p-4 print:static print:bg-white print:p-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setShowCert(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="수료증"
              onClick={(e) => e.stopPropagation()}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="relative w-full max-w-[560px] rounded-[10px] bg-white p-8 text-center shadow-2xl print:max-w-none print:shadow-none md:p-12"
              style={{ border: `6px double ${C.brand}` }}
            >
              <button type="button" aria-label="닫기" onClick={() => setShowCert(false)} className="absolute top-3 right-3 grid size-10 place-items-center rounded-md print:hidden" style={{ color: C.muted }}>
                <X size={20} aria-hidden />
              </button>
              <p className="text-[14px] tabular-nums" style={{ color: C.muted }}>
                제 {state.certNo} 호
              </p>
              <h2 className="mt-4 text-[34px] font-bold tracking-[0.3em]">수료증</h2>
              <p className="mt-8 text-[18px]">
                성명 <b>{maskName("김하늘")}</b>
              </p>
              <p className="mt-1 text-[18px]">
                과정명 <b>{COURSE}</b> (총 {LESSONS.length}차시)
              </p>
              <p className="mt-8 text-[16px] leading-[1.8]">위 사람은 본 기관에서 실시한 위 과정을 수료하였으므로 이 증서를 수여합니다.</p>
              <p className="mt-8 text-[16px]">2026년 10월 1일</p>
              <div className="relative mx-auto mt-4 w-fit">
                <p className="text-[20px] font-bold">곰파트너 아카데미 원장</p>
                <motion.span
                  aria-hidden
                  className="absolute -top-3 -right-14 grid size-14 place-items-center rounded-full border-[3px] text-[13px] font-bold"
                  style={{ borderColor: C.accent, color: C.accent }}
                  initial={reduce ? false : { scale: 1.8, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 0.9, rotate: -12 }}
                  transition={{ duration: 0.35, ease: EASE, delay: 0.25 }}
                >
                  직인
                </motion.span>
              </div>
              <div className="mt-10 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-11 items-center gap-1.5 rounded-md px-5 text-[15px] font-bold text-white"
                  style={{ background: C.brand }}
                >
                  <Printer size={16} aria-hidden />
                  인쇄
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Admin({ mine, notify }: { mine: { progress: number; quiz: number | null }; notify: (t: string) => void }) {
  const reduce = useReducedMotionSafe();
  const [filter, setFilter] = useState<LearnerStatus | "전체">("전체");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lesson, setLesson] = useState(3);

  const rows = useMemo(
    () =>
      [{ name: "김하늘", progress: mine.progress, days: 0, quiz: mine.quiz, live: true }, ...LEARNERS.map((l) => ({ ...l, live: false }))].map((l) => ({
        ...l,
        status: statusOf(l.progress, l.days, l.quiz),
      })),
    [mine],
  );
  const list = rows.filter((r) => filter === "전체" || r.status === filter).sort((a, b) => a.progress - b.progress);
  const avg = Math.round(rows.reduce((s, r) => s + r.progress, 0) / rows.length);
  const count = (s: LearnerStatus) => rows.filter((r) => r.status === s).length;

  const statusColor: Record<LearnerStatus, { fg: string; bg: string }> = {
    수료: { fg: C.brand, bg: C.brandSoft },
    평가미응시: { fg: "#1d4ed8", bg: "#e8eefc" },
    학습중: { fg: C.muted, bg: C.bg },
    독려대상: { fg: C.warn, bg: C.warnSoft },
  };

  const drop = DROPOFF[lesson];
  // 바로 앞 구간보다 가장 많이 줄어든 구간
  let worst = 1;
  for (let k = 2; k < drop.length; k++) if (drop[k - 1] - drop[k] > drop[worst - 1] - drop[worst]) worst = k;

  return (
    <div className="grid gap-6">
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["수강인원", `${rows.length}명`],
          ["평균 진도율", `${avg}%`],
          ["수료인원", `${count("수료")}명`],
          ["독려대상", `${count("독려대상")}명`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[10px] border bg-white px-4 py-3" style={{ borderColor: C.line }}>
            <dt className="text-[14px]" style={{ color: C.muted }}>
              {label}
            </dt>
            <dd className="mt-0.5 text-[24px] font-bold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="learners-title" className="rounded-[10px] border bg-white" style={{ borderColor: C.line }}>
        <div className="flex flex-wrap items-center gap-2 border-b p-4" style={{ borderColor: C.line }}>
          <h2 id="learners-title" className="mr-2 text-[17px] font-bold">
            {COURSE} 수강생 현황
          </h2>
          {(["전체", "독려대상", "학습중", "평가미응시", "수료"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => {
                setFilter(f);
                setSelected(new Set());
              }}
              className="rounded-full border px-3 py-1.5 text-[14px] font-bold"
              style={filter === f ? { background: C.text, borderColor: C.text, color: "#fff" } : { borderColor: C.line, color: C.muted }}
            >
              {f} {f === "전체" ? rows.length : count(f)}
            </button>
          ))}
          <button
            type="button"
            disabled={!selected.size}
            onClick={() => {
              notify(`${selected.size}명에게 학습독려 문자를 발송했습니다.`);
              setSelected(new Set());
            }}
            className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-md px-3.5 text-[14px] font-bold text-white disabled:opacity-40"
            style={{ background: C.brand }}
          >
            <Send size={15} aria-hidden />
            학습독려 문자 발송
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[15px]">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: C.line, color: C.muted }}>
                <th scope="col" className="w-10 px-4 py-2.5">
                  <span className="sr-only">선택</span>
                </th>
                <th scope="col" className="py-2.5">성명</th>
                <th scope="col" className="w-56 py-2.5">진도율</th>
                <th scope="col" className="py-2.5">최종 학습일</th>
                <th scope="col" className="py-2.5">평가점수</th>
                <th scope="col" className="px-4 py-2.5">학습상태</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {list.map((r) => (
                  <motion.tr
                    key={r.name}
                    layout={!reduce}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE }}
                    className="border-b"
                    style={{ borderColor: C.line }}
                  >
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        aria-label={`${maskName(r.name)} 선택`}
                        checked={selected.has(r.name)}
                        onChange={() =>
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (next.has(r.name)) next.delete(r.name);
                            else next.add(r.name);
                            return next;
                          })
                        }
                      />
                    </td>
                    <td className="py-2.5 font-bold">
                      {maskName(r.name)}
                      {r.live && (
                        <span className="ml-2 rounded px-1.5 py-0.5 text-[12px]" style={{ background: C.brandSoft, color: C.brand }}>
                          내 강의실 연동
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 pr-8">
                      <span className="flex items-center gap-2">
                        <span className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: C.bg }}>
                          <span className="block h-full rounded-full" style={{ width: `${r.progress}%`, background: C.brand }} />
                        </span>
                        <span className="w-10 text-right tabular-nums">{r.progress}%</span>
                      </span>
                    </td>
                    <td className="py-2.5 tabular-nums" style={{ color: r.days >= 7 ? C.warn : C.text }}>
                      {r.days === 0 ? "오늘" : `${r.days}일 전`}
                    </td>
                    <td className="py-2.5 tabular-nums">{r.quiz === null ? "-" : `${r.quiz}점`}</td>
                    <td className="px-4 py-2.5">
                      <span className="rounded px-2 py-0.5 text-[13px] font-bold" style={{ color: statusColor[r.status].fg, background: statusColor[r.status].bg }}>
                        {r.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="drop-title" className="rounded-[10px] border bg-white p-5" style={{ borderColor: C.line }}>
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="drop-title" className="mr-auto text-[17px] font-bold">
            차시별 이탈 구간
          </h2>
          <select value={lesson} onChange={(e) => setLesson(Number(e.target.value))} aria-label="차시 선택" className="h-10 rounded-md border bg-white px-2 text-[15px]" style={{ borderColor: C.line }}>
            {LESSONS.map((l, k) => (
              <option key={l.title} value={k}>
                {k + 1}차시 {l.title}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
          최다 이탈 구간 {clock((LESSONS[lesson].duration / 10) * (worst - 1))}~{clock((LESSONS[lesson].duration / 10) * worst)} (이탈률 {drop[worst - 1] - drop[worst]}%p)
        </p>
        <div className="mt-4 flex h-40 items-end gap-1.5" role="img" aria-label={`${lesson + 1}차시 구간별 잔존율: ${drop.join(", ")}%`}>
          {drop.map((v, k) => (
            <motion.div
              key={`${lesson}-${k}`}
              className="flex-1 rounded-t"
              style={{ background: k === worst ? C.warn : C.brand, opacity: k === worst ? 1 : 0.75, originY: 1, height: `${v}%` }}
              initial={reduce ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.4, ease: EASE, delay: k * 0.03 }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[13px] tabular-nums" style={{ color: C.muted }}>
          <span>00:00</span>
          <span>{clock(LESSONS[lesson].duration)}</span>
        </div>
      </section>
    </div>
  );
}
