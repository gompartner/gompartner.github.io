"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import {
  BookOpen,
  CalendarCheck,
  Car,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Moon,
  Phone,
  RotateCcw,
  Sun,
  Sunrise,
  TrainFront,
  Users,
} from "lucide-react";
import { Black_Han_Sans, JetBrains_Mono } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, fmtMD, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 성인 영어회화 학원 홈페이지 샘플: 가상의 곰파트너영어회화.
   학원명, 강사, 주소, 전화번호, 교습비는 모두 가상이다. 합격, 점수 실적, 수강생 실명과 후기는 넣지 않는다.

   국내 성인 회화 학원 사이트 공통 구성(참고): 메뉴는 학원소개, 강좌안내, 레벨테스트, 시간표, 수강료,
   무료 체험수업, 오시는 길. 첫 화면에는 직장인 새벽반, 저녁반, 주말반 시간과 레벨테스트 바로가기를 크게 둔다.
   관용 문구는 "소수정예", "레벨테스트 후 반 배정", "교재비 별도", "조기 마감될 수 있습니다", "역 도보 3분".
   교습비는 교육지원청에 신고한 월 교습비로 게시하고 환불은 학원법 시행령 기준을 따른다고 적는 게 보통이다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 레벨테스트 5문항: 대화창처럼 문제가 말풍선으로 나오고 고른 답이 내 말풍선으로 붙는다. 끝나면 레벨과 맞는 반.
   2. 시간표: 새벽반, 저녁반, 주말반 탭과 레벨 칩. 반을 고르면 수강료와 체험 신청에 그대로 이어진다.
   3. 월 수강료: 주 횟수별 월 교습비 표. 고른 반의 줄이 표시되고 개월 수를 바꾸면 합계가 나온다.
   4. 무료 체험 신청: 이름, 휴대폰, 체험 반, 그 반이 열리는 가까운 날짜 3개 중 하나. 접수 번호와 회신 예정일.

   포스터 첫 화면(et-poster): 빨강 바탕에 크림색 큰 문장 "출근 전 7시 반, 50분 회화" 하나만 둔다.
   오른쪽(휴대폰은 아래)에 입체 말풍선 다섯 개가 좌우 번갈아 튀어 올라 쌓이고 안에 짧은 영어 문장이 한 글자씩 찍힌다.
   말풍선은 앞면 그라디언트, 두께 면, 바닥 그림자, 윗가장자리 하이라이트로 입체감을 준다. 등장 뒤에는 7초 주기로 살짝 뜬다.
   스크롤하면 말풍선이 서로 다른 속도로 위로 흘러가고 문장도 위로 빠진다. 동작 줄이기면 다 찍힌 대화로 고정한다. */

const sfx = { fontFamily: `${Black_Han_Sans.style.fontFamily}, sans-serif` } as const;
const mono = { fontFamily: `${JetBrains_Mono.style.fontFamily}, ui-monospace, monospace` } as const;

const BRAND = "곰파트너영어회화";
const TEL = "02-000-0000";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 5층";
const KAKAO = "카카오톡 채널 곰파트너";

const C = {
  red: "#c8202f",
  redDeep: "#9e1622",
  redTint: "#f6d9d3",
  cream: "#fbf1e1",
  paper: "#f8efdf",
  card: "#fffaf1",
  ink: "#2b1a17",
  muted: "#6a5650",
  line: "#e6d6bd",
  error: "#a3141f",
};

/* 모션 상수. 시간은 ms, 이징은 cubic-bezier */
/** 화면 안 전환(탭, 결과, 숫자) */
const EASE = [0.22, 1, 0.36, 1] as const;
const DUR = 0.32;
/** 말풍선이 튀어나올 때 살짝 넘쳤다 돌아오는 곡선 */
const EASE_POP = [0.34, 1.56, 0.64, 1] as const;
/** 포스터 말풍선 하나가 튀어 오르는 시간 */
const POP_MS = 420;
/** 말풍선 사이 간격. 다섯 개라 마지막은 1.12초에 나온다 */
const BUBBLE_GAP_MS = 280;
/** 한 글자 찍히는 시간. 가장 긴 문장도 0.6초 안에 끝나 전체 등장은 2초 안쪽 */
const TYPE_MS = 24;
/** 등장 뒤 말풍선이 떠 있는 주기 */
const FLOAT_MS = 7200;
/** 포스터 스크롤 진행도 중 퇴장이 끝나는 지점 */
const EXIT_END = 0.7;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- 레벨 ---------- */

type Level = "starter" | "basic" | "inter" | "upper";
const LEVELS: { key: Level; name: string; ko: string; can: string }[] = [
  { key: "starter", name: "Starter", ko: "기초", can: "인사, 자기소개, 주문처럼 짧은 문장" },
  { key: "basic", name: "Basic", ko: "초급", can: "하루 일과와 주말 이야기를 과거형까지" },
  { key: "inter", name: "Intermediate", ko: "중급", can: "회의 일정, 출장, 내 의견 말하기" },
  { key: "upper", name: "Upper", ko: "중상급", can: "토론, 발표, 숫자 설명과 협상 표현" },
];
const levelOf = (k: Level) => LEVELS.find((l) => l.key === k) ?? LEVELS[0];
const levelByScore = (s: number): Level => (s <= 1 ? "starter" : s <= 3 ? "basic" : s === 4 ? "inter" : "upper");

interface Question {
  ask: string;
  hint: string;
  choices: string[];
  answer: number;
}
const QUESTIONS: Question[] = [
  { ask: "A: How's it going?\nB: ____", hint: "B의 대답으로 알맞은 것", choices: ["It goes by bus.", "Pretty good, thanks.", "Yes, I'm going."], answer: 1 },
  { ask: "I ____ to work by subway every day.", hint: "빈칸에 맞는 말", choices: ["go", "goes", "going"], answer: 0 },
  {
    ask: "회의가 3시로 미뤄졌어요.",
    hint: "영어로 자연스러운 것",
    choices: ["The meeting is back at 3 behind.", "The meeting pushed 3 o'clock.", "The meeting got pushed back to 3."],
    answer: 2,
  },
  { ask: "If I ____ more time, I'd join the evening class.", hint: "빈칸에 맞는 말", choices: ["have", "had", "will have"], answer: 1 },
  {
    ask: "Could you walk me through the numbers?",
    hint: "이 말의 뜻",
    choices: ["숫자를 지워 주시겠어요?", "숫자를 하나씩 설명해 주시겠어요?", "숫자를 걸어서 가져다주시겠어요?"],
    answer: 1,
  },
];

/* ---------- 시간표 ---------- */

type Slot = "dawn" | "evening" | "weekend";
const SLOTS: { key: Slot; label: string; time: string; Icon: typeof Sunrise }[] = [
  { key: "dawn", label: "새벽반", time: "평일 07:30~08:20", Icon: Sunrise },
  { key: "evening", label: "저녁반", time: "평일 19:00~21:00", Icon: Moon },
  { key: "weekend", label: "주말반", time: "토, 일 100분", Icon: Sun },
];

interface Klass {
  id: string;
  slot: Slot;
  level: Level;
  days: number[];
  time: string;
  teacher: "원어민" | "한국인";
  /** 정원 6명 중 남은 자리 */
  seats: number;
}
const CAP = 6;
const CLASSES: Klass[] = [
  { id: "d-st", slot: "dawn", level: "starter", days: [1, 2, 3, 4, 5], time: "07:30~08:20", teacher: "한국인", seats: 3 },
  { id: "d-ba", slot: "dawn", level: "basic", days: [1, 3, 5], time: "07:30~08:20", teacher: "원어민", seats: 2 },
  { id: "d-in", slot: "dawn", level: "inter", days: [2, 4], time: "07:30~08:20", teacher: "원어민", seats: 1 },
  { id: "d-up", slot: "dawn", level: "upper", days: [1, 3, 5], time: "07:30~08:20", teacher: "원어민", seats: 0 },
  { id: "e-st", slot: "evening", level: "starter", days: [1, 3], time: "19:00~19:50", teacher: "한국인", seats: 4 },
  { id: "e-ba", slot: "evening", level: "basic", days: [2, 4], time: "19:00~19:50", teacher: "원어민", seats: 1 },
  { id: "e-in", slot: "evening", level: "inter", days: [1, 3, 5], time: "20:10~21:00", teacher: "원어민", seats: 2 },
  { id: "e-up", slot: "evening", level: "upper", days: [2, 4], time: "20:10~21:00", teacher: "원어민", seats: 3 },
  { id: "w-st", slot: "weekend", level: "starter", days: [0], time: "10:00~11:40", teacher: "한국인", seats: 5 },
  { id: "w-ba", slot: "weekend", level: "basic", days: [6], time: "10:00~11:40", teacher: "원어민", seats: 3 },
  { id: "w-in", slot: "weekend", level: "inter", days: [6], time: "13:00~14:40", teacher: "원어민", seats: 2 },
];
const classOf = (id: string) => CLASSES.find((c) => c.id === id) ?? CLASSES[1];
const slotOf = (s: Slot) => SLOTS.find((x) => x.key === s) ?? SLOTS[0];
const daysText = (days: number[]) => (days.length === 5 ? "월~금" : days.map((d) => DOW[d]).join(", "));
const classLabel = (c: Klass) => `${slotOf(c.slot).label} ${levelOf(c.level).name}`;

/* ---------- 월 교습비 (교육지원청 신고 기준으로 가정) ---------- */

interface Fee {
  key: string;
  label: string;
  /** 반의 수업 요일 수. 주말반은 0으로 따로 구분 */
  per: number;
  weekend?: boolean;
  fee: number;
  hours: string;
}
const FEES: Fee[] = [
  { key: "f5", label: "주 5회 50분", per: 5, fee: 290000, hours: "월 약 20회" },
  { key: "f3", label: "주 3회 50분", per: 3, fee: 210000, hours: "월 약 12회" },
  { key: "f2", label: "주 2회 50분", per: 2, fee: 160000, hours: "월 약 8회" },
  { key: "fw", label: "주말 주 1회 100분", per: 1, weekend: true, fee: 150000, hours: "월 약 4회" },
];
const feeOf = (c: Klass) => FEES.find((f) => (c.slot === "weekend" ? f.weekend : !f.weekend && f.per === c.days.length)) ?? FEES[1];
const BOOK = "교재비 별도(권당 18,000~22,000원)";

/* ---------- 포스터 말풍선 ---------- */

interface BubbleDef {
  side: "L" | "R";
  text: string;
  time: string;
}
const BUBBLES: BubbleDef[] = [
  { side: "L", text: "Morning! Ready?", time: "07:30" },
  { side: "R", text: "Coffee first, please.", time: "07:30" },
  { side: "L", text: "How was your weekend?", time: "07:31" },
  { side: "R", text: "I finally went hiking.", time: "07:31" },
  { side: "L", text: "See you tomorrow, 7:30!", time: "08:20" },
];
/** viewBox 600x820. 글자 크기 26, 고정폭 글꼴 한 글자 약 15.6 */
const B_FONT = 26;
const B_CHAR = 15.8;
const B_PAD = 32;
const B_H = 80;
const B_STEP = 138;
const B_TOP = 70;
const B_DEPTH: [number, number] = [9, 11];
/** 퇴장할 때 말풍선마다 다른 위로 흐르는 거리(viewBox 단위) */
const B_RISE = [520, 640, 760, 880, 1000];

const bubbleW = (t: string) => Math.round(t.length * B_CHAR + B_PAD * 2);

/** 꼬리가 왼쪽 아래에 달린 둥근 말풍선. 오른쪽 말풍선은 뒤집어 쓴다 */
function bubblePath(w: number, h: number) {
  const r = h / 2;
  return [
    `M${r} 0 H${w - r}`,
    `A${r} ${r} 0 0 1 ${w} ${r}`,
    `A${r} ${r} 0 0 1 ${w - r} ${h}`,
    `H62`,
    `C48 ${h} 30 ${h + 14} 6 ${h + 20}`,
    `C16 ${h + 8} 8 ${h - 4} 4 ${h - 14}`,
    `A${r} ${r} 0 0 1 ${r} 0 Z`,
  ].join(" ");
}

/* ---------- 체험 신청 ---------- */

interface Receipt {
  no: string;
  name: string;
  phone: string;
  klass: Klass;
  date: Date;
  reply: Date;
}

function nextClassDates(today: Date, days: number[], n: number) {
  const out: Date[] = [];
  for (let k = 1; out.length < n && k < 30; k++) {
    const d = daysAgo(today, -k);
    if (days.includes(d.getDay())) out.push(d);
  }
  return out;
}
function nextWeekday(today: Date) {
  let d = daysAgo(today, -1);
  while (d.getDay() === 0 || d.getDay() === 6) d = daysAgo(d, -1);
  return d;
}

export function EnglishTalkDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [selected, setSelected] = useState("d-ba");
  const [slot, setSlot] = useState<Slot>("dawn");
  const [levelFilter, setLevelFilter] = useState<Level | "all">("all");
  const [result, setResult] = useState<Level | null>(null);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const pick = (id: string) => {
    setSelected(id);
    setSlot(classOf(id).slot);
  };

  const showLevel = (lv: Level) => {
    setResult(lv);
    setLevelFilter(lv);
    const first = CLASSES.find((c) => c.level === lv && c.slot === slot && c.seats > 0) ?? CLASSES.find((c) => c.level === lv && c.seats > 0);
    if (first) pick(first.id);
    go("et-schedule");
  };

  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("et-trial")} />

      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:px-6">
        <h2 className="inline-flex items-center gap-2 text-[22px] leading-none" style={sfx}>
          <BrandMark size={26} />
          {BRAND}
        </h2>
        <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center">
          {[
            ["et-test", "레벨테스트"],
            ["et-schedule", "시간표"],
            ["et-fee", "수강료"],
            ["et-trial", "무료 체험"],
            ["et-location", "오시는 길"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.red }}>
              {label}
            </button>
          ))}
          <a
            href={`tel:${TEL.replace(/-/g, "")}`}
            data-gtm-cta="english-talk_tel"
            className={`ml-1 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[15px] font-bold ${focusRing}`}
            style={{ background: C.ink, color: C.cream, outlineColor: C.red }}
          >
            <Phone size={16} aria-hidden />
            {TEL}
          </a>
        </nav>
      </header>

      {/* 짧은 소개 띠 */}
      <section className="mx-auto max-w-[1200px] px-4 pb-4 pt-6 md:px-6 md:pt-10">
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <h2 className="text-[34px] leading-[1.18] md:text-[52px]" style={{ ...sfx, wordBreak: "keep-all" }}>
              직장인 영어회화
              <br />
              <span style={{ color: C.red }}>한 반 6명</span>
            </h2>
            <p className="mt-4 text-[17px] leading-[1.6]" style={{ color: C.muted }}>
              레벨테스트 후 반 배정, 수업은 50분 회화만 해요.
            </p>
          </div>
          <ul className="grid grid-cols-3 gap-2 text-[15px]">
            {SLOTS.map((s) => (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => {
                    setSlot(s.key);
                    go("et-schedule");
                  }}
                  className={`flex h-full w-full flex-col items-start gap-1 rounded-[10px] border px-3 py-3 text-left ${focusRing}`}
                  style={{ borderColor: C.line, background: C.card, outlineColor: C.red }}
                >
                  <s.Icon size={20} aria-hidden style={{ color: C.red }} />
                  <span className="font-bold">{s.label}</span>
                  <span className="text-[14px]" style={{ color: C.muted }}>
                    {s.time}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <main className="mx-auto max-w-[1200px] px-4 md:px-6">
        <LevelTest reduce={reduce} result={result} onDone={setResult} onShow={showLevel} />
        <Schedule
          reduce={reduce}
          slot={slot}
          setSlot={setSlot}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          result={result}
          selected={selected}
          onPick={pick}
          onTrial={() => go("et-trial")}
        />
        <Fees reduce={reduce} selected={classOf(selected)} />
        <Trial reduce={reduce} today={today} selected={classOf(selected)} onPick={pick} result={result} />
        <Location />
      </main>

      <footer className="mt-16" style={{ background: C.ink, color: C.cream }}>
        <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
          <p className="inline-flex items-center gap-2 text-[20px]" style={sfx}>
            <BrandMark size={22} back={C.cream} />
            {BRAND}
          </p>
          <p className="mt-3 text-[15px] leading-[1.7]">
            {ADDRESS}, 전화 {TEL}
            <br />
            상담 평일 07:00~21:30, 토 09:30~15:00, 일 09:30~12:00
            <br />
            교습비는 ㅇㅇ교육지원청 신고 금액, 환불은 학원법 시행령 기준
          </p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

/* ---------- 상호 표시 ---------- */

function BrandMark({ size, back = C.ink }: { size: number; back?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M4 6 H20 A4 4 0 0 1 24 10 V16 A4 4 0 0 1 20 20 H11 L6 24 V20 H8 A4 4 0 0 1 4 16 Z" fill={C.red} />
      <path d="M14 13 H26 A3 3 0 0 1 29 16 V22 A3 3 0 0 1 26 25 H25 V28 L21 25 H17 A3 3 0 0 1 14 22 Z" fill={back} />
    </svg>
  );
}

/* ---------- 포스터 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 0 : Math.min(1, v / EXIT_END)));
  const textY = useTransform(p, (v) => `${-v * 46}svh`);
  const textO = useTransform(p, (v) => Math.max(0, 1 - Math.max(0, v - 0.25) / 0.55));

  return (
    <section id="et-poster" ref={ref} aria-labelledby="et-poster-title" className="relative" style={{ height: reduce ? undefined : "180svh", background: C.red }}>
      <style>{`
        @keyframes et-pop {
          0% { transform: translateY(40px) scale(0.3); opacity: 0; }
          55% { transform: translateY(-6px) scale(1.05); opacity: 1; }
          80% { transform: translateY(2px) scale(0.985); }
          100% { transform: none; opacity: 1; }
        }
        @keyframes et-type {
          from { clip-path: inset(-20% 100% -20% 0); }
          to { clip-path: inset(-20% 0 -20% 0); }
        }
        @keyframes et-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @media (prefers-reduced-motion: reduce) { .et-anim { animation: none !important; } }
      `}</style>
      <div
        className={`${reduce ? "relative min-h-svh" : "sticky top-0 h-svh"} overflow-hidden`}
        style={{ background: `radial-gradient(90% 70% at 78% 60%, #d93a45 0%, ${C.red} 48%, #ad1826 100%)`, color: C.cream }}
      >
        {/* 말풍선 대화 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[50svh] items-end justify-center px-3 pb-[2svh] md:inset-y-0 md:left-auto md:right-[3vw] md:h-full md:items-center md:pb-0">
          <svg
            viewBox="0 0 600 820"
            className="h-full w-auto max-w-full overflow-visible md:h-[84svh] md:max-w-[44vw]"
            role="img"
            aria-label="영어 문장이 적힌 말풍선 다섯 개가 대화처럼 좌우로 번갈아 쌓인 그림"
          >
            <BubbleDefs />
            {BUBBLES.map((b, i) => (
              <Bubble key={i} b={b} i={i} p={p} reduce={reduce} />
            ))}
          </svg>
        </div>

        {/* 로고와 핵심 행동 하나 */}
        <motion.div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4 md:px-12 md:pt-7" style={{ y: textY }}>
          <p className="inline-flex items-center gap-2 text-[17px] leading-none" style={sfx}>
            <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden>
              <path d="M4 6 H20 A4 4 0 0 1 24 10 V16 A4 4 0 0 1 20 20 H11 L6 24 V20 H8 A4 4 0 0 1 4 16 Z" fill={C.cream} />
              <path d="M14 13 H26 A3 3 0 0 1 29 16 V22 A3 3 0 0 1 26 25 H25 V28 L21 25 H17 A3 3 0 0 1 14 22 Z" fill={C.ink} />
            </svg>
            {BRAND}
          </p>
          <button
            type="button"
            onClick={onCta}
            aria-label="무료 체험 신청"
            title="무료 체험 신청"
            data-gtm-cta="english-talk_poster_cta"
            className={`pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full ${focusRing}`}
            style={{ background: C.cream, color: C.red, outlineColor: C.cream }}
          >
            <CalendarCheck size={22} aria-hidden />
          </button>
        </motion.div>

        {/* 큰 문장 */}
        <motion.div
          className="relative z-[1] flex h-full flex-col px-4 pt-[13svh] md:justify-center md:px-12 md:pb-[6svh] md:pt-0"
          style={{ y: textY, opacity: textO }}
        >
          <h1
            id="et-poster-title"
            className="text-[clamp(52px,16vw,72px)] leading-[1.1] tracking-[-0.01em] md:text-[clamp(96px,9.2vw,170px)] md:leading-[1.04]"
            style={{ ...sfx, wordBreak: "keep-all" }}
          >
            <span className="block">출근 전</span>
            <span className="block">7시 반,</span>
            <span className="block">50분 회화</span>
          </h1>
          <p className="mt-5 text-[16px] md:mt-8 md:text-[19px]">{BRAND}, 평일 새벽반 07:30~08:20</p>
        </motion.div>
      </div>
    </section>
  );
}

function BubbleDefs() {
  return (
    <defs>
      {/* 크림 말풍선: 위에서 빛이 닿고 아래로 갈수록 종이색이 짙어진다 */}
      <linearGradient id="et-cream-face" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="#fffdf6" />
        <stop offset="0.55" stopColor="#f8ecd6" />
        <stop offset="1" stopColor="#ecd9b8" />
      </linearGradient>
      <linearGradient id="et-cream-side" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c9ac83" />
        <stop offset="1" stopColor="#a68660" />
      </linearGradient>
      {/* 먹색 말풍선 */}
      <linearGradient id="et-ink-face" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="#4a302a" />
        <stop offset="0.6" stopColor="#2f1d19" />
        <stop offset="1" stopColor="#1f1210" />
      </linearGradient>
      <linearGradient id="et-ink-side" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#150b09" />
        <stop offset="1" stopColor="#0b0504" />
      </linearGradient>
      <radialGradient id="et-floor" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#4a050c" stopOpacity="0.5" />
        <stop offset="1" stopColor="#4a050c" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

function Bubble({ b, i, p, reduce }: { b: BubbleDef; i: number; p: MotionValue<number>; reduce: boolean }) {
  const w = bubbleW(b.text);
  const x = b.side === "L" ? 26 : 600 - 26 - w - B_DEPTH[0];
  const top = B_TOP + i * B_STEP;
  const y = useTransform(p, (v) => -B_RISE[i] * Math.pow(v, 1.25));
  const o = useTransform(p, (v) => Math.max(0, 1 - Math.max(0, v - 0.35 - i * 0.04) / 0.4));

  const delay = i * BUBBLE_GAP_MS;
  const typeDelay = delay + POP_MS * 0.55;
  const isL = b.side === "L";
  const d = bubblePath(w, B_H);
  const flip = isL ? undefined : `translate(${w} 0) scale(-1 1)`;

  return (
    <motion.g style={{ y, opacity: o }}>
      <g transform={`translate(${x} ${top})`}>
        <g
          className="et-anim"
          style={reduce ? undefined : { animation: `et-float ${FLOAT_MS}ms ease-in-out ${2000 + i * 650}ms infinite`, transformBox: "fill-box" }}
        >
          <g
            className="et-anim"
            style={{
              transformBox: "fill-box",
              transformOrigin: isL ? "0% 100%" : "100% 100%",
              animation: reduce ? undefined : `et-pop ${POP_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both`,
            }}
          >
            {/* 바닥에 떨어진 그림자 */}
            <ellipse cx={w / 2 + 14} cy={B_H + 30} rx={w * 0.46} ry="12" fill="url(#et-floor)" />
            <g transform={flip}>
              {/* 두께 면 */}
              <path d={d} transform={`translate(${B_DEPTH[0]} ${B_DEPTH[1]})`} fill={isL ? "url(#et-cream-side)" : "url(#et-ink-side)"} />
              {/* 앞면 */}
              <path d={d} fill={isL ? "url(#et-cream-face)" : "url(#et-ink-face)"} />
              {/* 윗가장자리 하이라이트 */}
              <path
                d={`M${B_H / 2 - 6} 5 H${w - B_H / 2 - 4}`}
                stroke={isL ? "rgba(255,255,255,0.95)" : "rgba(255,226,214,0.32)"}
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M8 ${B_H / 2 - 4} A${B_H / 2 - 6} ${B_H / 2 - 6} 0 0 1 ${B_H / 2 - 6} 6`}
                stroke={isL ? "rgba(255,255,255,0.7)" : "rgba(255,226,214,0.22)"}
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
            <text
              className="et-anim"
              x={B_PAD}
              y={B_H / 2 + B_FONT * 0.36}
              fontSize={B_FONT}
              fontWeight="600"
              fill={isL ? C.ink : C.cream}
              style={{
                ...mono,
                animation: reduce ? undefined : `et-type ${b.text.length * TYPE_MS}ms steps(${b.text.length}, end) ${typeDelay}ms both`,
              }}
            >
              {b.text}
            </text>
            <text x={isL ? w + 22 : -14} y={B_H - 6} fontSize="18" textAnchor={isL ? "start" : "end"} fill="rgba(251,241,225,0.82)" style={mono}>
              {b.time}
            </text>
          </g>
        </g>
      </g>
    </motion.g>
  );
}

/* ---------- 구역 제목 ---------- */

function SectionHead({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <h2 id={`${id}-title`} className="text-[28px] leading-tight md:text-[36px]" style={sfx}>
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ---------- 1. 레벨테스트 ---------- */

function LevelTest({
  reduce,
  result,
  onDone,
  onShow,
}: {
  reduce: boolean;
  result: Level | null;
  onDone: (l: Level) => void;
  onShow: (l: Level) => void;
}) {
  const [answers, setAnswers] = useState<number[]>([]);
  const idx = answers.length;
  const done = idx >= QUESTIONS.length;
  const score = answers.filter((a, i) => a === QUESTIONS[i].answer).length;
  const lv = levelOf(levelByScore(score));
  const logRef = useRef<HTMLDivElement>(null);

  const choose = (c: number) => {
    const next = [...answers, c];
    setAnswers(next);
    if (next.length === QUESTIONS.length) onDone(levelByScore(next.filter((a, i) => a === QUESTIONS[i].answer).length));
  };

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [answers.length, reduce]);

  const pop = () =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0, scale: 0.6, y: 14 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: { duration: 0.38, ease: EASE_POP },
        };

  return (
    <section id="et-test" aria-labelledby="et-test-title" className="scroll-mt-4 pt-14">
      <SectionHead id="et-test" title="레벨테스트">
        <p className="text-[15px]" style={{ color: C.muted }}>
          5문항, 1분
        </p>
      </SectionHead>

      <div className="mt-5 grid gap-5 md:grid-cols-[1.25fr_1fr]">
        <div className="rounded-[12px] border" style={{ borderColor: C.line, background: C.card }}>
          <div className="flex items-center justify-between border-b px-4 py-3 text-[15px]" style={{ borderColor: C.line }}>
            <span className="inline-flex items-center gap-2 font-bold">
              <MessagesSquare size={18} aria-hidden style={{ color: C.red }} />
              테스트 담당 강사
            </span>
            <span aria-live="polite" style={{ color: C.muted }}>
              {done ? "끝" : `${idx + 1} / ${QUESTIONS.length}`}
            </span>
          </div>
          <div className="h-1.5 w-full" style={{ background: C.line }} aria-hidden>
            <motion.div
              className="h-full origin-left"
              style={{ background: C.red }}
              initial={false}
              animate={{ scaleX: idx / QUESTIONS.length }}
              transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
            />
          </div>

          <div ref={logRef} className="flex max-h-[440px] min-h-[300px] flex-col gap-3 overflow-y-auto px-4 py-5" role="log" aria-label="레벨테스트 대화">
            {QUESTIONS.slice(0, Math.min(idx + 1, QUESTIONS.length)).map((q, i) => (
              <div key={i} className="flex flex-col gap-3">
                <motion.div {...pop()} className="max-w-[88%] self-start rounded-[18px] rounded-bl-[4px] px-4 py-3" style={{ background: C.redTint, transformOrigin: "0% 100%" }}>
                  <p className="text-[13px] font-bold" style={{ color: C.redDeep }}>
                    문제 {i + 1}, {q.hint}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-[17px] leading-[1.5]" style={/[A-Za-z]/.test(q.ask) ? mono : undefined}>
                    {q.ask}
                  </p>
                </motion.div>
                {answers[i] !== undefined && (
                  <motion.p
                    {...pop()}
                    className="max-w-[80%] self-end rounded-[18px] rounded-br-[4px] px-4 py-3 text-[16px]"
                    style={{ background: C.ink, color: C.cream, transformOrigin: "100% 100%" }}
                  >
                    {q.choices[answers[i]]}
                  </motion.p>
                )}
              </div>
            ))}
            {done && (
              <motion.div {...pop()} className="max-w-[92%] self-start rounded-[18px] rounded-bl-[4px] px-4 py-4" style={{ background: C.red, color: C.cream, transformOrigin: "0% 100%" }}>
                <p className="text-[15px]">5문항 중 {score}개 맞혔어요</p>
                <p className="mt-1 text-[26px] leading-tight" style={sfx}>
                  {lv.name} {lv.ko}
                </p>
                <p className="mt-1 text-[15px]">{lv.can}부터 시작해요.</p>
              </motion.div>
            )}
          </div>

          <div className="border-t px-4 py-4" style={{ borderColor: C.line }}>
            {!done ? (
              <div className="grid gap-2" role="group" aria-label={`문제 ${idx + 1} 보기`}>
                {QUESTIONS[idx].choices.map((c, k) => (
                  <button
                    key={`${idx}-${k}`}
                    type="button"
                    onClick={() => choose(k)}
                    className={`rounded-[10px] border px-4 py-3 text-left text-[16px] hover:border-current ${focusRing}`}
                    style={{ borderColor: C.line, background: "#fff", outlineColor: C.red, ...(/[A-Za-z]/.test(c) ? mono : {}) }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onShow(lv.key)}
                  data-gtm-cta="english-talk_test_result"
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-[16px] font-bold ${focusRing}`}
                  style={{ background: C.red, color: C.cream, outlineColor: C.ink }}
                >
                  <CalendarCheck size={18} aria-hidden />
                  {lv.name} 반 시간표 보기
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers([])}
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-[16px] ${focusRing}`}
                  style={{ borderColor: C.ink, outlineColor: C.red }}
                >
                  <RotateCcw size={17} aria-hidden />
                  다시 풀기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 레벨 단계 */}
        <ol className="grid content-start gap-2" aria-label="레벨 단계">
          {LEVELS.map((l) => {
            const on = result === l.key;
            return (
              <li
                key={l.key}
                className="flex items-start gap-3 rounded-[10px] border px-4 py-3"
                style={{ borderColor: on ? C.red : C.line, background: on ? C.redTint : C.card, borderWidth: on ? 2 : 1 }}
              >
                <span className="mt-0.5 w-[116px] shrink-0 whitespace-nowrap text-[15px] font-bold md:w-[128px] md:text-[17px]" style={mono}>
                  {l.name}
                </span>
                <span className="text-[15px] leading-[1.55]">
                  <span className="font-bold">{l.ko}</span> {l.can}
                  {on && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[14px] font-bold" style={{ color: C.redDeep }}>
                      <Check size={14} aria-hidden />내 레벨
                    </span>
                  )}
                </span>
              </li>
            );
          })}
          <li className="px-1 pt-2 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
            처음 오시는 날 강사와 5분 말하기로 한 번 더 맞춰요.
          </li>
        </ol>
      </div>
    </section>
  );
}

/* ---------- 2. 시간표 ---------- */

function Schedule({
  reduce,
  slot,
  setSlot,
  levelFilter,
  setLevelFilter,
  result,
  selected,
  onPick,
  onTrial,
}: {
  reduce: boolean;
  slot: Slot;
  setSlot: (s: Slot) => void;
  levelFilter: Level | "all";
  setLevelFilter: (l: Level | "all") => void;
  result: Level | null;
  selected: string;
  onPick: (id: string) => void;
  onTrial: () => void;
}) {
  const list = CLASSES.filter((c) => c.slot === slot && (levelFilter === "all" || c.level === levelFilter));
  const sel = classOf(selected);

  return (
    <section id="et-schedule" aria-labelledby="et-schedule-title" className="scroll-mt-4 pt-16">
      <SectionHead id="et-schedule" title="시간표">
        <p className="text-[15px]" style={{ color: C.muted }}>
          반 정원 {CAP}명, 자리가 차면 조기 마감될 수 있습니다
        </p>
      </SectionHead>

      <div className="mt-5 flex flex-wrap items-center gap-2" role="tablist" aria-label="반 시간대">
        {SLOTS.map((s) => {
          const on = s.key === slot;
          return (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setSlot(s.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[16px] ${on ? "font-bold" : ""} ${focusRing}`}
              style={{ borderColor: on ? C.ink : C.line, background: on ? C.ink : C.card, color: on ? C.cream : C.ink, outlineColor: C.red }}
            >
              <s.Icon size={17} aria-hidden />
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="레벨 고르기">
        {(["all", ...LEVELS.map((l) => l.key)] as const).map((k) => {
          const on = levelFilter === k;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={on}
              onClick={() => setLevelFilter(k)}
              className={`rounded-[6px] border px-3 py-1.5 text-[15px] ${focusRing}`}
              style={{ borderColor: on ? C.red : C.line, color: on ? C.redDeep : C.ink, fontWeight: on ? 700 : 400, background: on ? C.redTint : "transparent", outlineColor: C.red }}
            >
              {k === "all" ? "전체 레벨" : levelOf(k).name}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((c, i) => {
            const on = c.id === selected;
            const full = c.seats === 0;
            return (
              <motion.button
                key={c.id}
                type="button"
                layout={!reduce}
                aria-pressed={on}
                disabled={full}
                onClick={() => onPick(c.id)}
                initial={reduce ? false : { opacity: 0, rotate: i % 2 ? 3 : -3, scale: 0.85 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.85, transition: { duration: 0.18 } }}
                transition={{ duration: reduce ? 0 : 0.34, ease: EASE_POP }}
                className={`relative flex flex-col items-start rounded-[14px] rounded-bl-[4px] border px-4 pb-4 pt-3.5 text-left disabled:cursor-not-allowed ${focusRing}`}
                style={{
                  borderColor: on ? C.red : C.line,
                  borderWidth: on ? 2 : 1,
                  background: full ? "#efe6d6" : on ? C.card : "#fff",
                  outlineColor: C.red,
                }}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="text-[19px] font-bold" style={mono}>
                    {levelOf(c.level).name}
                  </span>
                  {result === c.level && (
                    <span className="rounded-[4px] px-1.5 py-0.5 text-[13px] font-bold" style={{ background: C.red, color: C.cream }}>
                      추천
                    </span>
                  )}
                </span>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[16px]">
                  <Clock size={15} aria-hidden style={{ color: C.red }} />
                  <span className="tabular-nums">{c.time}</span>
                </span>
                <span className="mt-2 flex gap-1" aria-label={`수업 요일 ${daysText(c.days)}`}>
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                    const has = c.days.includes(d);
                    return (
                      <span
                        key={d}
                        aria-hidden
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[13px]"
                        style={{ background: has ? C.ink : "transparent", color: has ? C.cream : "#a8988a", fontWeight: has ? 700 : 400, border: has ? "none" : `1px solid ${C.line}` }}
                      >
                        {DOW[d]}
                      </span>
                    );
                  })}
                </span>
                <span className="mt-3 flex w-full items-center justify-between text-[15px]" style={{ color: C.muted }}>
                  <span>{c.teacher} 강사</span>
                  <span className="inline-flex items-center gap-1 font-bold" style={{ color: full ? C.muted : C.ink }}>
                    <Users size={14} aria-hidden />
                    {full ? "마감" : `남은 자리 ${c.seats}`}
                  </span>
                </span>
                {on && (
                  <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-bold" style={{ color: C.redDeep }}>
                    <Check size={15} aria-hidden />
                    고른 반
                  </span>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
        {list.length === 0 && (
          <p className="rounded-[10px] border px-4 py-5 text-[15px] sm:col-span-2" style={{ borderColor: C.line, color: C.muted }}>
            {slotOf(slot).label}에는 이 레벨 반이 없어요. 다른 시간대를 눌러 보세요.
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] px-4 py-3" style={{ background: C.ink, color: C.cream }}>
        <p className="text-[16px]">
          <span className="font-bold">{classLabel(sel)}</span> {daysText(sel.days)} {sel.time}
        </p>
        <button
          type="button"
          onClick={onTrial}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-bold ${focusRing}`}
          style={{ background: C.cream, color: C.red, outlineColor: C.cream }}
        >
          <CalendarCheck size={16} aria-hidden />이 반 무료 체험
        </button>
      </div>
    </section>
  );
}

/* ---------- 3. 월 수강료 ---------- */

function Fees({ reduce, selected }: { reduce: boolean; selected: Klass }) {
  const [months, setMonths] = useState(1);
  const fee = feeOf(selected);
  const total = fee.fee * months;

  return (
    <section id="et-fee" aria-labelledby="et-fee-title" className="scroll-mt-4 pt-16">
      <SectionHead id="et-fee" title="월 수강료" />

      <div className="mt-5 grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <div className="overflow-x-auto rounded-[12px] border" style={{ borderColor: C.line, background: C.card }}>
          <table className="w-full min-w-[340px] text-left text-[16px]">
            <caption className="px-4 pt-3 text-left text-[14px]" style={{ color: C.muted }}>
              ㅇㅇ교육지원청 신고 월 교습비, 반 정원 {CAP}명
            </caption>
            <thead>
              <tr className="border-b text-[14px]" style={{ borderColor: C.line, color: C.muted }}>
                <th scope="col" className="px-4 py-3 font-normal">
                  과정
                </th>
                <th scope="col" className="px-2 py-3 font-normal">
                  수업 횟수
                </th>
                <th scope="col" className="px-4 py-3 text-right font-normal">
                  월 교습비
                </th>
              </tr>
            </thead>
            <tbody>
              {FEES.map((f) => {
                const on = f.key === fee.key;
                return (
                  <tr key={f.key} className="border-b last:border-b-0" style={{ borderColor: C.line, background: on ? C.redTint : undefined }}>
                    <th scope="row" className="px-4 py-3.5 font-bold">
                      {f.label}
                      {on && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[13px]" style={{ color: C.redDeep }}>
                          <Check size={13} aria-hidden />
                          고른 반
                        </span>
                      )}
                    </th>
                    <td className="whitespace-nowrap px-2 py-3.5" style={{ color: C.muted }}>
                      {f.hours}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold tabular-nums">{won(f.fee)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="flex items-center gap-1.5 px-4 pb-3 text-[14px]" style={{ color: C.muted }}>
            <BookOpen size={14} aria-hidden />
            {BOOK}
          </p>
        </div>

        <div className="rounded-[12px] px-5 py-5" style={{ background: C.red, color: C.cream }}>
          <p className="text-[15px]">고른 반</p>
          <p className="mt-1 text-[22px] leading-snug" style={sfx}>
            {classLabel(selected)}
          </p>
          <p className="mt-1 text-[15px]">
            {daysText(selected.days)} {selected.time}, {fee.label}
          </p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-[15px]">등록 개월</span>
            <div className="flex overflow-hidden rounded-full border" style={{ borderColor: "rgba(251,241,225,0.6)" }} role="group" aria-label="등록 개월 수">
              {[1, 2, 3].map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={months === m}
                  onClick={() => setMonths(m)}
                  className={`px-4 py-2 text-[15px] ${focusRing}`}
                  style={{ background: months === m ? C.cream : "transparent", color: months === m ? C.red : C.cream, fontWeight: months === m ? 700 : 400, outlineColor: C.cream }}
                >
                  {m}개월
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t pt-4" style={{ borderColor: "rgba(251,241,225,0.4)" }}>
            <p className="text-[15px]">교습비 합계</p>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={total}
                className="text-[38px] leading-tight tabular-nums"
                style={sfx}
                initial={reduce ? false : { y: "-40%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: "40%", opacity: 0 }}
                transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
              >
                {won(total)}
              </motion.p>
            </AnimatePresence>
            <p className="mt-1 text-[14px]">{BOOK}</p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
        환불은 학원의 설립, 운영 및 과외교습에 관한 법률 시행령 기준을 따릅니다.
      </p>
    </section>
  );
}

/* ---------- 4. 무료 체험 신청 ---------- */

function Trial({
  reduce,
  today,
  selected,
  onPick,
  result,
}: {
  reduce: boolean;
  today: Date;
  selected: Klass;
  onPick: (id: string) => void;
  result: Level | null;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateIdx, setDateIdx] = useState(0);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const dates = useMemo(() => nextClassDates(today, selected.days, 3), [today, selected.days]);
  const date = dates[Math.min(dateIdx, dates.length - 1)];
  const open = CLASSES.filter((c) => c.seats > 0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) return setError("이름을 2글자 이상 적어 주세요.");
    if (!/^01\d{8,9}$/.test(digits)) return setError("휴대폰 번호를 확인해 주세요.");
    if (!agree) return setError("개인정보 수집에 동의해 주세요.");
    setError(null);
    const n = String(Math.floor(Math.random() * 900) + 100);
    setReceipt({
      no: `ET-${fmtMD(today).replace(".", "")}-${n}`,
      name: name.trim(),
      phone: digits,
      klass: selected,
      date,
      reply: nextWeekday(today),
    });
  };

  const reset = () => {
    setReceipt(null);
    setName("");
    setPhone("");
    setAgree(false);
    setDateIdx(0);
  };

  const field = `mt-1.5 w-full rounded-[8px] border px-3.5 py-3 text-[16px] ${focusRing}`;

  return (
    <section id="et-trial" aria-labelledby="et-trial-title" className="scroll-mt-4 pt-16">
      <SectionHead id="et-trial" title="무료 체험 신청">
        <p className="text-[15px]" style={{ color: C.muted }}>
          50분 수업 한 번, 무료
        </p>
      </SectionHead>

      <div className="mt-5 rounded-[12px] border" style={{ borderColor: C.line, background: C.card }}>
        <AnimatePresence mode="wait" initial={false}>
          {receipt ? (
            <motion.div
              key="done"
              className="px-5 py-6 md:px-8 md:py-8"
              initial={reduce ? false : { opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.36, ease: EASE_POP }}
              role="status"
            >
              <p className="inline-flex items-center gap-2 text-[15px] font-bold" style={{ color: C.redDeep }}>
                <Check size={18} aria-hidden />
                체험 신청이 접수됐어요
              </p>
              <p className="mt-2 text-[26px] leading-tight md:text-[32px]" style={sfx}>
                {fmtKo(receipt.date)} {receipt.klass.time.split("~")[0]}
              </p>
              <dl className="mt-5 grid gap-x-6 gap-y-2.5 text-[16px] sm:grid-cols-[120px_1fr]">
                <dt style={{ color: C.muted }}>접수 번호</dt>
                <dd className="font-bold tabular-nums" style={mono}>
                  {receipt.no}
                </dd>
                <dt style={{ color: C.muted }}>신청자</dt>
                <dd>
                  {maskName(receipt.name)}, {maskPhone(receipt.phone)}
                </dd>
                <dt style={{ color: C.muted }}>체험 수업</dt>
                <dd>
                  {classLabel(receipt.klass)}, {daysText(receipt.klass.days)} {receipt.klass.time}
                </dd>
                <dt style={{ color: C.muted }}>회신 예정</dt>
                <dd>{fmtKo(receipt.reply)} 오후 6시까지 문자로 확정 연락</dd>
                <dt style={{ color: C.muted }}>담당 창구</dt>
                <dd>
                  {KAKAO}, 전화 {TEL}
                </dd>
              </dl>
              <button
                type="button"
                onClick={reset}
                className={`mt-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[15px] ${focusRing}`}
                style={{ borderColor: C.ink, outlineColor: C.red }}
              >
                <RotateCcw size={16} aria-hidden />
                새로 신청
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              noValidate
              className="grid gap-5 px-5 py-6 md:grid-cols-2 md:gap-x-8 md:px-8 md:py-8"
              initial={false}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transition: { duration: 0.16 } }}
            >
              <label className="block text-[15px] font-bold">
                이름
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={{ borderColor: C.line, background: "#fff", outlineColor: C.red }} />
              </label>
              <label className="block text-[15px] font-bold">
                휴대폰
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="010-0000-0000"
                  className={field}
                  style={{ borderColor: C.line, background: "#fff", outlineColor: C.red }}
                />
              </label>
              <label className="block text-[15px] font-bold">
                체험할 반
                <select
                  value={selected.id}
                  onChange={(e) => {
                    onPick(e.target.value);
                    setDateIdx(0);
                  }}
                  className={field}
                  style={{ borderColor: C.line, background: "#fff", outlineColor: C.red }}
                >
                  {open.map((c) => (
                    <option key={c.id} value={c.id}>
                      {classLabel(c)} ({daysText(c.days)} {c.time})
                    </option>
                  ))}
                </select>
                {result && (
                  <span className="mt-1.5 block text-[14px] font-normal" style={{ color: C.muted }}>
                    레벨테스트 결과 {levelOf(result).name}도 같이 보내요
                  </span>
                )}
              </label>
              <fieldset>
                <legend className="text-[15px] font-bold">체험 날짜</legend>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {dates.map((d, k) => {
                    const on = k === Math.min(dateIdx, dates.length - 1);
                    return (
                      <button
                        key={d.getTime()}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setDateIdx(k)}
                        className={`rounded-[8px] border px-2 py-2.5 text-center text-[15px] ${focusRing}`}
                        style={{ borderColor: on ? C.red : C.line, background: on ? C.redTint : "#fff", fontWeight: on ? 700 : 400, outlineColor: C.red }}
                      >
                        {fmtKo(d)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="md:col-span-2">
                <label className="inline-flex cursor-pointer items-start gap-2.5 text-[15px]">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-[18px] w-[18px] accent-[#c8202f]" />
                  <span>
                    개인정보 수집, 이용 동의(필수)
                    <span className="block text-[14px]" style={{ color: C.muted }}>
                      이름, 휴대폰 번호. 체험 연락에만 쓰고 3개월 뒤 지워요.
                    </span>
                  </span>
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:col-span-2">
                <button
                  type="submit"
                  data-gtm-cta="english-talk_trial_submit"
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-[17px] font-bold ${focusRing}`}
                  style={{ background: C.red, color: C.cream, outlineColor: C.ink }}
                >
                  <CalendarCheck size={19} aria-hidden />
                  무료 체험 신청하기
                </button>
                <p aria-live="polite" className="text-[15px] font-bold" style={{ color: C.error }}>
                  {error}
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

function Location() {
  return (
    <section id="et-location" aria-labelledby="et-location-title" className="scroll-mt-4 pt-16">
      <SectionHead id="et-location" title="오시는 길" />
      <div className="mt-5 grid gap-5 md:grid-cols-[1.2fr_1fr]">
        <svg viewBox="0 0 520 300" className="h-auto w-full rounded-[12px]" role="img" aria-label="ㅇㅇ역 2번 출구에서 큰길을 따라 걸어 3분 거리에 학원 건물이 있는 약도">
          <rect width="520" height="300" fill="#efe3cd" />
          <rect x="0" y="128" width="520" height="44" fill="#fffaf1" />
          <rect x="300" y="0" width="34" height="300" fill="#fffaf1" />
          <path d="M0 150 H520 M317 0 V300" stroke="#e1cfb0" strokeWidth="2" strokeDasharray="10 10" />
          {[
            [30, 30, 110, 76],
            [160, 26, 110, 80],
            [30, 196, 120, 80],
            [180, 200, 90, 72],
            [364, 196, 130, 82],
            [364, 24, 60, 82],
          ].map(([x, y, w, h], k) => (
            <rect key={k} x={x} y={y} width={w} height={h} rx="4" fill="#e3d4b9" />
          ))}
          {/* 학원 건물 */}
          <rect x="436" y="24" width="64" height="82" rx="4" fill={C.red} />
          <text x="468" y="72" textAnchor="middle" fontSize="15" fill={C.cream} fontWeight="700">
            5층
          </text>
          {/* 역 출구 */}
          <circle cx="96" cy="150" r="17" fill={C.ink} />
          <text x="96" y="156" textAnchor="middle" fontSize="16" fill={C.cream} fontWeight="700">
            2
          </text>
          <path d="M118 150 H450 V112" fill="none" stroke={C.red} strokeWidth="4" strokeDasharray="2 9" strokeLinecap="round" />
          <text x="96" y="194" textAnchor="middle" fontSize="15" fill={C.ink}>
            ㅇㅇ역
          </text>
          <text x="250" y="122" fontSize="14" fill={C.muted}>
            도보 3분
          </text>
        </svg>
        <ul className="grid content-start gap-3 text-[16px] leading-[1.6]">
          <li className="flex gap-2.5">
            <MapPin size={19} aria-hidden className="mt-0.5 shrink-0" style={{ color: C.red }} />
            {ADDRESS}
          </li>
          <li className="flex gap-2.5">
            <TrainFront size={19} aria-hidden className="mt-0.5 shrink-0" style={{ color: C.red }} />
            ㅇㅇ역 2번 출구 도보 3분
          </li>
          <li className="flex gap-2.5">
            <Car size={19} aria-hidden className="mt-0.5 shrink-0" style={{ color: C.red }} />
            건물 주차 1시간 지원(새벽반은 07:00부터 입차)
          </li>
          <li className="flex gap-2.5">
            <Clock size={19} aria-hidden className="mt-0.5 shrink-0" style={{ color: C.red }} />
            상담 평일 07:00~21:30, 토 09:30~15:00, 일 09:30~12:00
          </li>
          <li className="flex gap-2.5">
            <MessageCircle size={19} aria-hidden className="mt-0.5 shrink-0" style={{ color: C.red }} />
            {KAKAO}
          </li>
        </ul>
      </div>
    </section>
  );
}
