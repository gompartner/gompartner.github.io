"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, List, Menu, MessageSquareText, RotateCcw, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";


/* 필라테스 스튜디오 홈페이지 데모: 가상의 ○○ 필라테스.
   스튜디오명, 강사, 주소, 전화번호, 사업자 정보, 수강료는 모두 가상이다.

   디자인: 따뜻한 흰 종이색(#f5f2ec) 바탕에 쪽빛(#24365a)을 주색으로, 모래색과 흙색을 보조로 쓴다.
   제목은 굵은 고딕(Pretendard Bold), 본문은 보통 고딕. 첫 화면에는 붓으로 한 번에 그린 듯한
   원이 그려지고, 로고의 ○은 숨 쉬듯 천천히 커졌다 작아진다.
   카드 격자 대신 문장, 표, 점으로 정보를 보여 준다.

   상호작용
   1. 수업 고르기: 불편한 곳, 운동 경험, 1:1과 소그룹 중 선호를 질문 카드 세 장으로 하나씩 묻고
      마지막에 맞는 수업과 이유가 먹이 번지듯 원형으로 드러난다. 전체 수업 목록으로 바꿔 볼 수도 있다.
   2. 주간 시간표: 요일과 시간 표에 남은 자리를 점으로 보여 주고, 강사와 난이도로 거른다.
      수업을 누르면 체험 수업 신청 창이 열린다. 신청은 실제로 보내지 않는다.
   3. 회원권: 수업 형태와 횟수를 고르면 횟수만큼 점이 채워지고 총액, 회당 금액, 유효기간이 나온다.

   사진 출처(public/images/demo-pilates):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, teacher, mat, studio */


const IMG = "/images/demo-pilates";
const STUDIO = "○○ 필라테스";
const TEL = "02-000-0000";
const ADDRESS = "□□시 □□로 88 □□빌딩 2층";

const C = {
  paper: "#f5f2ec",
  sand: "#ece6db",
  ink: "#1f2430",
  muted: "#5d5a55",
  indigo: "#24365a",
  indigoSoft: "#dfe3ec",
  clay: "#b9876a",
  clayDeep: "#8a5a3f",
  line: "#ddd5c8",
  onIndigo: "#eef1f7",
};

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_INK = [0.65, 0, 0.35, 1] as const;

const NAV = [
  { id: "find", label: "수업 고르기" },
  { id: "schedule", label: "시간표" },
  { id: "price", label: "회원권" },
  { id: "teachers", label: "강사" },
];

/* ---------- 시간 ---------- */

const subscribeMinute = (cb: () => void) => {
  const timer = window.setInterval(cb, 30_000);
  return () => window.clearInterval(timer);
};
const noopSubscribe = () => () => {};
const subscribeWide = (cb: () => void) => {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** 서버 렌더와 첫 화면에서는 0, 브라우저에서는 현재 시각(분 단위)을 돌려준다. */
function useNowMinute() {
  return useSyncExternalStore(
    subscribeMinute,
    () => Math.floor(Date.now() / 60_000),
    () => 0,
  );
}

const HOURS = [
  { label: "평일", days: [1, 2, 3, 4, 5], time: "07:00 ~ 22:00", open: [420, 1320] },
  { label: "토요일", days: [6], time: "09:00 ~ 15:00", open: [540, 900] },
  { label: "일요일·공휴일", days: [0], time: "쉽니다", open: null },
] as const;

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function todayStatus(minute: number) {
  if (!minute) return null;
  const now = new Date(minute * 60_000);
  const day = now.getDay();
  const m = now.getHours() * 60 + now.getMinutes();
  const row = HOURS.find((h) => (h.days as readonly number[]).includes(day))!;
  const label = `오늘 ${DAY_NAMES[day]}요일`;
  if (!row.open) return { label, time: "쉬는 날", text: "오늘은 쉽니다", open: false };
  const [start, end] = row.open;
  if (m < start) return { label, time: row.time, text: "아직 문을 열기 전입니다", open: false };
  if (m >= end) return { label, time: row.time, text: "오늘 수업이 끝났습니다", open: false };
  return { label, time: row.time, text: `지금 운영 중입니다 (${row.time.split(" ~ ")[1]}까지)`, open: true };
}

/* ---------- 수업 ---------- */

type ClassType = "private" | "duet" | "reformer" | "mat";

const CLASS_INFO: Record<ClassType, { name: string; cap: number; desc: string; from: string }> = {
  private: {
    name: "1:1 리포머",
    cap: 1,
    desc: "강사 한 명이 한 사람만 봅니다. 체형 상담을 하고 몸 상태에 맞춰 동작을 고릅니다.",
    from: "회당 6만 원부터",
  },
  duet: {
    name: "2:1 듀엣 리포머",
    cap: 2,
    desc: "가족, 친구와 둘이 함께 듣습니다. 1:1보다 부담이 적고 자세 교정도 자주 받습니다.",
    from: "한 사람 회당 3만 9천 원부터",
  },
  reformer: {
    name: "소그룹 리포머",
    cap: 4,
    desc: "4명이 리포머 기구로 함께 운동합니다. 입문반과 중급반을 나눠 엽니다.",
    from: "회당 2만 4천 원부터",
  },
  mat: {
    name: "그룹 매트",
    cap: 6,
    desc: "기구 없이 매트에서 호흡과 기본 동작을 배웁니다. 최대 6명입니다.",
    from: "회당 2만 4천 원부터",
  },
};

type Part = "back" | "shoulder" | "knee" | "none";
type Exp = "new" | "sometimes" | "steady";
type Pref = "solo" | "group";

const PART_OPTIONS: { id: Part; label: string }[] = [
  { id: "back", label: "허리" },
  { id: "shoulder", label: "목·어깨" },
  { id: "knee", label: "무릎" },
  { id: "none", label: "딱히 없어요" },
];

const EXP_OPTIONS: { id: Exp; label: string }[] = [
  { id: "new", label: "처음이에요" },
  { id: "sometimes", label: "조금 해 봤어요" },
  { id: "steady", label: "꾸준히 해요" },
];

const PREF_OPTIONS: { id: Pref; label: string }[] = [
  { id: "solo", label: "1:1로 배우고 싶어요" },
  { id: "group", label: "소그룹이 편해요" },
];

const PART_REASON: Record<Part, string> = {
  back: "허리를 직접 쓰기보다 배와 골반 주변 근육을 먼저 깨우는 동작부터 합니다.",
  shoulder: "목과 어깨에 들어간 힘을 빼고, 등 근육으로 팔을 쓰는 연습을 합니다.",
  knee: "무릎에 체중이 덜 실리도록 누워서 하는 동작으로 허벅지와 엉덩이 근육부터 키웁니다.",
  none: "",
};

type Rec = { type: ClassType; level?: Level; reasons: string[] };

function recommend(part: Part, exp: Exp, pref: Pref): Rec {
  const base = recommendBase(part, exp);
  const partReason = PART_REASON[part];
  if (pref === "solo" && base.type !== "private")
    return {
      type: "private",
      reasons: [
        partReason || "운동 경험에 맞춰 강사가 동작 난이도를 그때그때 조절합니다.",
        "강사 한 명이 한 사람만 보고, 수업 시간도 원하는 때로 잡습니다.",
      ],
    };
  if (pref === "group" && (base.type === "private" || base.type === "duet"))
    return {
      type: "reformer",
      level: exp === "steady" ? "중급" : "입문",
      reasons: [partReason, "4명 수업이라 강사가 한 사람씩 자세를 봐 줍니다. 불편한 곳은 수업 전에 강사에게 알려 주세요."],
    };
  return base;
}

function recommendBase(part: Part, exp: Exp): Rec {
  const partReason = PART_REASON[part];
  if (part !== "none") {
    if (exp === "new")
      return {
        type: "private",
        reasons: [partReason, "처음에는 강사가 한 사람만 보며 자세를 잡아 주는 편이 다치지 않고 빨리 익힙니다."],
      };
    if (exp === "sometimes")
      return {
        type: "duet",
        reasons: [partReason, "둘이 함께 들으면 1:1보다 부담이 적고, 강사가 자세를 자주 고쳐 줄 수 있습니다."],
      };
    return {
      type: "reformer",
      level: "중급",
      reasons: [partReason, "운동 습관이 있으니 4명 수업도 충분히 따라옵니다. 불편한 곳은 수업 전에 강사에게 알려 주세요."],
    };
  }
  if (exp === "new")
    return { type: "mat", level: "입문", reasons: ["기구 없이 매트에서 호흡과 기본 동작부터 배웁니다.", "6명이 함께 들어 부담 없이 시작하기 좋습니다."] };
  if (exp === "sometimes")
    return { type: "reformer", level: "입문", reasons: ["리포머 기구에 익숙해지는 입문반부터 시작합니다.", "스프링 강도를 낮게 두고 동작을 하나씩 익힙니다."] };
  return { type: "reformer", level: "중급", reasons: ["기본 동작을 아는 분들이 모인 중급반입니다.", "한 시간 동안 쉬는 시간을 줄여 더 오래 움직입니다."] };
}

/* ---------- 시간표 ---------- */

type Teacher = "박○○" | "최○○" | "정○○";
type Level = "입문" | "중급";

interface Session {
  id: string;
  day: number; // 1 월 ~ 6 토
  time: string;
  type: Exclude<ClassType, "private">;
  teacher: Teacher;
  level: Level;
  booked: number;
}

const TIMES = ["07:00", "10:00", "12:30", "19:00", "20:30"];
const WEEK = [1, 2, 3, 4, 5, 6];

const SESSIONS: Session[] = [
  { id: "s1", day: 1, time: "07:00", type: "mat", teacher: "최○○", level: "입문", booked: 4 },
  { id: "s2", day: 1, time: "10:00", type: "reformer", teacher: "박○○", level: "입문", booked: 2 },
  { id: "s3", day: 1, time: "12:30", type: "mat", teacher: "정○○", level: "입문", booked: 5 },
  { id: "s4", day: 1, time: "19:00", type: "reformer", teacher: "박○○", level: "중급", booked: 4 },
  { id: "s5", day: 1, time: "20:30", type: "mat", teacher: "최○○", level: "중급", booked: 3 },
  { id: "s6", day: 2, time: "07:00", type: "reformer", teacher: "정○○", level: "입문", booked: 1 },
  { id: "s7", day: 2, time: "10:00", type: "mat", teacher: "최○○", level: "입문", booked: 6 },
  { id: "s8", day: 2, time: "19:00", type: "reformer", teacher: "정○○", level: "입문", booked: 3 },
  { id: "s9", day: 2, time: "20:30", type: "duet", teacher: "박○○", level: "중급", booked: 1 },
  { id: "s10", day: 3, time: "07:00", type: "mat", teacher: "최○○", level: "입문", booked: 2 },
  { id: "s11", day: 3, time: "10:00", type: "reformer", teacher: "박○○", level: "중급", booked: 3 },
  { id: "s12", day: 3, time: "12:30", type: "reformer", teacher: "정○○", level: "입문", booked: 1 },
  { id: "s13", day: 3, time: "19:00", type: "mat", teacher: "최○○", level: "입문", booked: 5 },
  { id: "s14", day: 3, time: "20:30", type: "reformer", teacher: "박○○", level: "중급", booked: 2 },
  { id: "s15", day: 4, time: "07:00", type: "reformer", teacher: "정○○", level: "입문", booked: 2 },
  { id: "s16", day: 4, time: "10:00", type: "mat", teacher: "최○○", level: "중급", booked: 4 },
  { id: "s17", day: 4, time: "19:00", type: "reformer", teacher: "정○○", level: "중급", booked: 4 },
  { id: "s18", day: 4, time: "20:30", type: "mat", teacher: "최○○", level: "입문", booked: 1 },
  { id: "s19", day: 5, time: "07:00", type: "mat", teacher: "최○○", level: "입문", booked: 3 },
  { id: "s20", day: 5, time: "10:00", type: "reformer", teacher: "박○○", level: "입문", booked: 0 },
  { id: "s21", day: 5, time: "12:30", type: "mat", teacher: "정○○", level: "입문", booked: 2 },
  { id: "s22", day: 5, time: "19:00", type: "duet", teacher: "박○○", level: "입문", booked: 2 },
  { id: "s23", day: 6, time: "10:00", type: "reformer", teacher: "박○○", level: "입문", booked: 3 },
  { id: "s24", day: 6, time: "12:30", type: "mat", teacher: "정○○", level: "입문", booked: 2 },
];

const TEACHERS: Teacher[] = ["박○○", "최○○", "정○○"];

/** 오늘 다음부터 해당 요일이 처음 오는 날짜 */
function nextDate(todayKey: string, day: number) {
  const d = new Date(todayKey);
  for (let i = 1; i <= 7; i++) {
    const c = new Date(d);
    c.setDate(d.getDate() + i);
    if (c.getDay() === day) return c;
  }
  return d;
}

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘 → 김ㅎ늘 */
function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return chars.join("");
  const hide = (ch: string) => {
    const code = ch.charCodeAt(0) - 0xac00;
    return code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*";
  };
  if (chars.length === 2) return chars[0] + hide(chars[1]);
  return chars.map((ch, i) => (i === 0 || i === chars.length - 1 ? ch : hide(ch))).join("");
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

/* ---------- 회원권 ---------- */

type PassType = "private" | "duet" | "group";
const PASS_TYPES: { id: PassType; label: string }[] = [
  { id: "private", label: "1:1" },
  { id: "duet", label: "2:1 듀엣" },
  { id: "group", label: "그룹" },
];
const COUNTS = [10, 20, 30] as const;
const PRICE: Record<PassType, Record<(typeof COUNTS)[number], number>> = {
  private: { 10: 700_000, 20: 1_300_000, 30: 1_800_000 },
  duet: { 10: 450_000, 20: 840_000, 30: 1_170_000 },
  group: { 10: 300_000, 20: 540_000, 30: 720_000 },
};
const VALID_MONTHS: Record<(typeof COUNTS)[number], number> = { 10: 3, 20: 5, 30: 7 };

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const manwon = (n: number) => `${(n / 10_000).toLocaleString("ko-KR")}만 원`;

/* ============================================================ */

export function PilatesStudioDemo() {
  const minute = useNowMinute();
  const status = todayStatus(minute);
  const [booking, setBooking] = useState<Session | "private" | null>(null);
  const [highlight, setHighlight] = useState<{ type: ClassType; level?: Level } | null>(null);

  const goSchedule = (type: ClassType, level?: Level) => {
    setHighlight({ type, level });
    document.getElementById("schedule")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.paper, color: C.ink }}>
      <Header />
      <main>
        <Hero status={status} />
        <Finder onSchedule={goSchedule} onPrivate={() => setBooking("private")} />
        <Schedule highlight={highlight} onClearHighlight={() => setHighlight(null)} onPick={setBooking} />
        <Pricing />
        <Teachers />
        <Space />
      </main>
      <Footer />
      <BookingDrawer target={booking} onClose={() => setBooking(null)} />
    </div>
  );
}

/* ---------- 로고, 머리글 ---------- */

function Logo({ light = false }: { light?: boolean }) {
  const reduce = useReducedMotionSafe();
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
        <motion.circle
          cx="15"
          cy="15"
          r="10"
          fill="none"
          stroke={light ? C.onIndigo : C.indigo}
          strokeWidth="2.4"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={reduce ? undefined : { scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        />
        <circle cx="15" cy="15" r="2.2" fill={light ? C.onIndigo : C.clay} />
      </svg>
      <span className={`text-[19px] font-bold tracking-[-0.01em]`}>{STUDIO}</span>
    </span>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ background: "rgba(245,242,236,0.9)", borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-6">
        <a href="#top" aria-label={`${STUDIO} 처음으로`}>
          <Logo />
        </a>
        <nav aria-label="주 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-7 text-[15px]">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="transition-colors hover:text-[#24365a]" style={{ color: C.muted }}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={`tel:${TEL}`}
          className="hidden h-10 items-center rounded-full px-5 text-[15px] font-semibold md:inline-flex"
          style={{ background: C.indigo, color: C.onIndigo }}
        >
          {TEL}
        </a>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full md:hidden"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="pilates-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="pilates-menu"
            aria-label="주 메뉴"
            className="overflow-hidden border-t md:hidden"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { height: 0 }}
            animate={{ height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <ul className="px-4 py-2">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} onClick={() => setOpen(false)} className="flex h-12 items-center text-[17px]">
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={`tel:${TEL}`} className="flex h-12 items-center text-[17px] font-semibold" style={{ color: C.indigo }}>
                  전화 {TEL}
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- 첫 화면 ---------- */

/** 붓으로 한 번에 그린 원. 끝이 살짝 열려 있다. */
function InkCircle({ className = "" }: { className?: string }) {
  const reduce = useReducedMotionSafe();
  const fid = useId().replace(/:/g, "");
  const d = "M225 47 A130 130 0 1 1 137 32";
  return (
    <svg viewBox="0 0 320 320" className={className} aria-hidden>
      <defs>
        <filter id={`brush-${fid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="5" />
        </filter>
      </defs>
      <g filter={`url(#brush-${fid})`} fill="none" strokeLinecap="round">
        <motion.path
          d={d}
          stroke={C.indigo}
          strokeOpacity="0.16"
          strokeWidth="16"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: EASE_INK, delay: 0.2 }}
        />
        <motion.path
          d={d}
          stroke={C.indigo}
          strokeOpacity="0.28"
          strokeWidth="3"
          transform="translate(4 3)"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: EASE_INK, delay: 0.35 }}
        />
      </g>
    </svg>
  );
}

type Status = ReturnType<typeof todayStatus>;

function TodayCard({ status }: { status: Status }) {
  return (
    <div className="rounded-[10px] border px-5 py-4" style={{ background: "rgba(245,242,236,0.94)", borderColor: C.line }}>
      <p className="text-[14px]" style={{ color: C.muted }}>
        {status?.label ?? "운영시간"}
      </p>
      <p className={`tracking-[-0.02em] mt-0.5 text-[24px] font-bold`}>{status?.time ?? "평일 07:00 ~ 22:00"}</p>
      <p className="mt-1 flex items-center gap-2 text-[14px]" style={{ color: status?.open ? C.indigo : C.muted }}>
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: status?.open ? C.indigo : C.clay }} aria-hidden />
        {status?.text ?? "토요일 09:00 ~ 15:00, 일요일 쉼"}
      </p>
    </div>
  );
}

function Hero({ status }: { status: Status }) {
  const reduce = useReducedMotionSafe();
  return (
    <section id="top" className="relative overflow-hidden">
      {/* 모바일: 사진 위, 글 아래 */}
      <div className="relative aspect-[4/3] w-full md:hidden">
        <Image src={`${IMG}/hero.jpg`} alt="한지 창으로 빛이 드는 스튜디오에서 리포머 동작을 하는 회원" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "78% center" }} />
      </div>

      <div className="relative md:min-h-[min(86vh,760px)]">
        <div className="absolute inset-0 hidden md:block">
          <Image src={`${IMG}/hero.jpg`} alt="한지 창으로 빛이 드는 스튜디오에서 리포머 동작을 하는 회원" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "70% center" }} />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(90deg, ${C.paper} 0%, rgba(245,242,236,0.92) 30%, rgba(245,242,236,0) 58%)` }}
          />
        </div>

        <div className="relative mx-auto flex max-w-[1200px] flex-col px-4 py-10 md:min-h-[min(86vh,760px)] md:justify-center md:px-6 md:py-20">
          <div className="relative max-w-[520px]">
            <InkCircle className="pointer-events-none absolute -left-10 -top-16 w-[260px] md:-left-16 md:-top-24 md:w-[380px]" />
            <p className="relative text-[15px] font-semibold" style={{ color: C.clayDeep }}>
              1:1 리포머, 6명 이하 소그룹 수업
            </p>
            <motion.h1
              className={`relative mt-3 text-[40px] font-bold leading-[1.25] tracking-[-0.02em] md:text-[58px]`}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
            >
              {STUDIO}
            </motion.h1>
            <p className="relative mt-5 text-[17px] leading-[1.75]" style={{ color: C.muted }}>
              호흡을 먼저 배우고, 몸 상태에 맞춰 동작을 고릅니다. 첫 수업은 체형 상담을 함께 하는 50분 체험 수업입니다.
            </p>
            <div className="relative mt-7 flex flex-wrap gap-3">
              <a
                href="#schedule"
                className="inline-flex h-12 items-center rounded-full px-6 text-[16px] font-semibold"
                style={{ background: C.indigo, color: C.onIndigo }}
              >
                체험 수업 신청
              </a>
              <a
                href="#find"
                className="inline-flex h-12 items-center rounded-full border px-6 text-[16px] font-semibold"
                style={{ borderColor: C.indigo, color: C.indigo }}
              >
                나에게 맞는 수업
              </a>
            </div>
            <div className="relative mt-9 max-w-[320px]">
              <TodayCard status={status} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 구역 제목 ---------- */

function SectionHead({ title, desc, id }: { title: string; desc?: string; id: string }) {
  return (
    <div>
      <h2 id={id} className={`text-[28px] font-bold leading-[1.35] tracking-[-0.02em] md:text-[36px]`}>
        {title}
      </h2>
      {desc && (
        <p className="mt-3 max-w-[620px]" style={{ color: C.muted }}>
          {desc}
        </p>
      )}
    </div>
  );
}

/* ---------- 수업 고르기 ---------- */

function Finder({ onSchedule, onPrivate }: { onSchedule: (t: ClassType, level?: Level) => void; onPrivate: () => void }) {
  const [mode, setMode] = useState<"quiz" | "list">("quiz");
  const [step, setStep] = useState(0);
  const [part, setPart] = useState<Part | null>(null);
  const [exp, setExp] = useState<Exp | null>(null);
  const [pref, setPref] = useState<Pref | null>(null);
  const reduce = useReducedMotionSafe();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const rec = part && exp && pref ? recommend(part, exp, pref) : null;
  const info = rec ? CLASS_INFO[rec.type] : null;

  // 카드를 넘기면 새 질문 제목으로 초점을 옮겨 키보드와 화면 읽기 사용자가 이어서 고를 수 있게 한다.
  useEffect(() => {
    if (!moved.current) return;
    headingRef.current?.focus();
  }, [step]);

  const go = (next: number) => {
    moved.current = true;
    setStep(next);
  };
  const restart = () => {
    setPart(null);
    setExp(null);
    setPref(null);
    go(0);
  };

  const questions = [
    { title: "어디가 불편하세요?", options: PART_OPTIONS, value: part, pick: (v: string) => setPart(v as Part) },
    { title: "운동은 해 보셨어요?", options: EXP_OPTIONS, value: exp, pick: (v: string) => setExp(v as Exp) },
    { title: "어떤 수업이 편하세요?", options: PREF_OPTIONS, value: pref, pick: (v: string) => setPref(v as Pref) },
  ];
  const q = step < questions.length ? questions[step] : null;

  return (
    <section aria-labelledby="find-title" id="find" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead id="find-title" title="어떤 수업이 맞을까요?" />
          <div className="inline-flex rounded-full border p-1" style={{ borderColor: C.line }} role="group" aria-label="보기 방식">
            {(
              [
                { id: "quiz", label: "질문으로 고르기", icon: MessageSquareText },
                { id: "list", label: "전체 수업 보기", icon: List },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={mode === m.id}
                onClick={() => setMode(m.id)}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[14px] font-semibold transition-colors"
                style={mode === m.id ? { background: C.indigo, color: C.onIndigo } : { color: C.muted }}
              >
                <m.icon size={16} aria-hidden />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "quiz" ? (
          <div className="mt-10 max-w-[720px]">
            <div className="rounded-[12px] border p-6 md:p-8" style={{ background: "#fffdf9", borderColor: C.line }}>
              {q ? (
                <>
                  <p className="text-[15px]" style={{ color: C.muted }}>
                    {step + 1} / {questions.length}
                  </p>
                  <h3 ref={headingRef} tabIndex={-1} className="mt-1 text-[24px] font-bold tracking-[-0.02em] outline-none md:text-[28px]">
                    {q.title}
                  </h3>
                  <div className="mt-6 grid gap-2.5 sm:grid-cols-2" role="group" aria-label={q.title}>
                    {q.options.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={q.value === o.id}
                        onClick={() => {
                          q.pick(o.id);
                          go(step + 1);
                        }}
                        className="flex h-14 items-center rounded-[10px] border px-5 text-left text-[17px] font-semibold transition-colors hover:bg-[#ece6db]"
                        style={q.value === o.id ? { borderColor: C.indigo, color: C.indigo, boxShadow: `inset 0 0 0 1px ${C.indigo}` } : { borderColor: C.line }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                rec &&
                info && (
                  <div aria-live="polite">
                    <h3 ref={headingRef} tabIndex={-1} className="sr-only">
                      추천 결과
                    </h3>
                    <motion.div
                      key={`${rec.type}-${part}-${exp}-${pref}`}
                      className="rounded-[12px] p-6 md:p-8"
                      style={{ background: C.indigo, color: C.onIndigo }}
                      initial={reduce ? false : { clipPath: "circle(0% at 0% 0%)" }}
                      animate={{ clipPath: "circle(150% at 0% 0%)" }}
                      transition={{ duration: 0.7, ease: EASE_INK }}
                    >
                      <p className="text-[14px]" style={{ color: "#b9c3d8" }}>
                        추천 수업
                      </p>
                      <p className={`tracking-[-0.02em] mt-1 text-[28px] font-bold`}>
                        {info.name}
                        {rec.level && <span className="ml-2 align-middle text-[16px] font-medium">{rec.level}반</span>}
                      </p>
                      <ul className="mt-4 space-y-2.5">
                        {rec.reasons.filter(Boolean).map((r) => (
                          <li key={r} className="flex gap-2.5">
                            <span className="mt-[0.7em] inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: C.clay }} aria-hidden />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-[15px]" style={{ color: "#b9c3d8" }}>
                        {info.from}
                      </p>
                      {rec.type === "private" ? (
                        <button
                          type="button"
                          onClick={onPrivate}
                          className="mt-6 inline-flex h-12 items-center rounded-full px-6 font-semibold"
                          style={{ background: C.paper, color: C.indigo }}
                        >
                          1:1 체험 수업 신청
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSchedule(rec.type, rec.level)}
                          className="mt-6 inline-flex h-12 items-center rounded-full px-6 font-semibold"
                          style={{ background: C.paper, color: C.indigo }}
                        >
                          시간표에서 이 수업 보기
                        </button>
                      )}
                    </motion.div>
                  </div>
                )
              )}

              {step > 0 && (
                <div className="mt-6 flex flex-wrap gap-2 border-t pt-5" style={{ borderColor: C.line }}>
                  <button
                    type="button"
                    onClick={() => go(step - 1)}
                    className="inline-flex h-11 items-center gap-1.5 rounded-full border px-4 text-[15px] font-semibold"
                    style={{ borderColor: C.line, color: C.ink }}
                  >
                    <ArrowLeft size={16} aria-hidden />
                    이전으로
                  </button>
                  <button
                    type="button"
                    onClick={restart}
                    className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-[15px] font-semibold"
                    style={{ color: C.muted }}
                  >
                    <RotateCcw size={16} aria-hidden />
                    처음부터 다시
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ol className="mt-10 border-t" style={{ borderColor: C.line }}>
            {(Object.keys(CLASS_INFO) as ClassType[]).map((t, i) => (
              <li key={t} className="grid gap-2 border-b py-6 md:grid-cols-[60px_240px_1fr_200px] md:items-baseline md:gap-6" style={{ borderColor: C.line }}>
                <span className={`tracking-[-0.02em] text-[15px]`} style={{ color: C.clayDeep }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`tracking-[-0.02em] text-[22px] font-bold`}>
                  {CLASS_INFO[t].name}
                  <span className="ml-2 font-sans text-[14px] font-normal" style={{ color: C.muted }}>
                    {CLASS_INFO[t].cap === 1 ? "1명" : `최대 ${CLASS_INFO[t].cap}명`}, 50분
                  </span>
                </span>
                <span style={{ color: C.muted }}>{CLASS_INFO[t].desc}</span>
                <span className="text-[15px] font-semibold md:text-right" style={{ color: C.indigo }}>
                  {CLASS_INFO[t].from}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

/* ---------- 시간표 ---------- */

function Seats({ cap, booked }: { cap: number; booked: number }) {
  return (
    <span className="inline-flex gap-1" aria-hidden>
      {Array.from({ length: cap }, (_, i) => (
        <span
          key={i}
          className="inline-block h-2 w-2 rounded-full border"
          style={{ borderColor: C.indigo, background: i < booked ? C.indigo : "transparent" }}
        />
      ))}
    </span>
  );
}

function seatText(s: Session) {
  const cap = CLASS_INFO[s.type].cap;
  const left = cap - s.booked;
  return left <= 0 ? "마감" : `${cap}자리 중 ${left}자리 남음`;
}

function Chips<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="mr-1 text-[14px]" style={{ color: C.muted }}>
        {label}
      </span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className="h-9 rounded-full border px-3.5 text-[14px] font-medium transition-colors"
          style={value === o ? { background: C.indigo, borderColor: C.indigo, color: C.onIndigo } : { borderColor: C.line, color: C.ink }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Schedule({
  highlight,
  onClearHighlight,
  onPick,
}: {
  highlight: { type: ClassType; level?: Level } | null;
  onClearHighlight: () => void;
  onPick: (s: Session) => void;
}) {
  const [teacher, setTeacher] = useState<"전체" | Teacher>("전체");
  const [level, setLevel] = useState<"전체" | Level>("전체");
  const [mobileDay, setMobileDay] = useState(1);

  const matches = (s: Session) =>
    (teacher === "전체" || s.teacher === teacher) &&
    (level === "전체" || s.level === level) &&
    (!highlight || (s.type === highlight.type && (!highlight.level || s.level === highlight.level)));

  const cell = (s: Session, compact: boolean) => {
    const on = matches(s);
    const full = CLASS_INFO[s.type].cap - s.booked <= 0;
    return (
      <button
        type="button"
        disabled={full}
        onClick={() => onPick(s)}
        aria-label={`${DAY_NAMES[s.day]}요일 ${s.time} ${CLASS_INFO[s.type].name} ${s.level}, ${s.teacher} 강사, ${seatText(s)}`}
        className={`group w-full rounded-[6px] border text-left transition-[opacity,background-color] duration-200 ${compact ? "p-2.5" : "p-4"} ${full ? "cursor-not-allowed" : "hover:bg-[#dfe3ec]"}`}
        style={{
          borderColor: on ? C.indigo : C.line,
          background: on && highlight ? C.indigoSoft : "#fffdf9",
          opacity: on ? 1 : 0.32,
        }}
      >
        <span className="block text-[13px] font-semibold" style={{ color: C.clayDeep }}>
          {s.level}
        </span>
        <span className={`block font-semibold leading-[1.35] ${compact ? "text-[14px]" : "text-[17px]"}`}>{CLASS_INFO[s.type].name}</span>
        <span className="mt-1 block text-[13px]" style={{ color: C.muted }}>
          {s.teacher}
        </span>
        <span className="mt-2 flex items-center gap-2">
          <Seats cap={CLASS_INFO[s.type].cap} booked={s.booked} />
          <span className="text-[12px]" style={{ color: full ? C.clayDeep : C.muted }}>
            {full ? "마감" : `${CLASS_INFO[s.type].cap - s.booked}자리`}
          </span>
        </span>
      </button>
    );
  };

  return (
    <section aria-labelledby="schedule-title" id="schedule" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.sand }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="schedule-title"
          title="이번 주 그룹 수업"
          desc="수업을 누르면 체험 수업을 신청할 수 있습니다. 점 하나가 자리 하나이고, 채워진 점은 이미 예약된 자리입니다. 1:1 수업은 시간표와 따로 원하는 시간에 잡습니다."
        />

        <div className="mt-8 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-8">
          <Chips label="강사" value={teacher} options={["전체", ...TEACHERS]} onChange={setTeacher} />
          <Chips label="난이도" value={level} options={["전체", "입문", "중급"] as ("전체" | Level)[]} onChange={setLevel} />
          {highlight && (
            <button
              type="button"
              onClick={onClearHighlight}
              className="inline-flex h-9 w-fit items-center gap-1.5 rounded-full px-3.5 text-[14px] font-semibold"
              style={{ background: C.indigo, color: C.onIndigo }}
              aria-label={`추천 수업만 보기 해제: ${CLASS_INFO[highlight.type].name}`}
            >
              추천: {CLASS_INFO[highlight.type].name}
              {highlight.level ? ` ${highlight.level}` : ""}
              <X size={15} aria-hidden />
            </button>
          )}
        </div>

        {/* 넓은 화면: 요일 x 시간 표 */}
        <div className="mt-8 hidden md:block">
          <table className="w-full table-fixed border-separate border-spacing-2">
            <caption className="sr-only">요일별, 시간별 그룹 수업 시간표</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[80px]" />
                {WEEK.map((d) => (
                  <th key={d} scope="col" className={`tracking-[-0.02em] pb-2 text-[17px] font-bold`}>
                    {DAY_NAMES[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMES.map((t) => (
                <tr key={t}>
                  <th scope="row" className="align-top pt-3 text-left text-[15px] font-semibold" style={{ color: C.muted }}>
                    {t}
                  </th>
                  {WEEK.map((d) => {
                    const s = SESSIONS.find((x) => x.day === d && x.time === t);
                    return (
                      <td key={d} className="align-top">
                        {s ? cell(s, true) : <span className="block h-full min-h-[96px] rounded-[6px] border border-dashed" style={{ borderColor: C.line }} />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 좁은 화면: 요일 고르고 목록 */}
        <div className="mt-6 md:hidden">
          <div className="grid grid-cols-6 gap-1.5" role="group" aria-label="요일">
            {WEEK.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={mobileDay === d}
                onClick={() => setMobileDay(d)}
                className={`tracking-[-0.02em] h-11 rounded-[6px] text-[17px] font-bold`}
                style={mobileDay === d ? { background: C.indigo, color: C.onIndigo } : { background: "#fffdf9", color: C.ink }}
              >
                {DAY_NAMES[d]}
              </button>
            ))}
          </div>
          <ul className="mt-4 space-y-2.5">
            {SESSIONS.filter((s) => s.day === mobileDay).map((s) => (
              <li key={s.id} className="grid grid-cols-[64px_1fr] items-start gap-3">
                <span className="pt-4 text-[15px] font-semibold" style={{ color: C.muted }}>
                  {s.time}
                </span>
                {cell(s, false)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 체험 신청 창 ---------- */

function BookingDrawer({ target, onClose }: { target: Session | "private" | null; onClose: () => void }) {
  const reduce = useReducedMotionSafe();
  const todayKey = useSyncExternalStore(noopSubscribe, () => new Date().toDateString(), () => "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [part, setPart] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [lastTarget, setLastTarget] = useState(target);

  // 다른 수업을 열면 입력 상태를 비운다
  if (target !== lastTarget) {
    setLastTarget(target);
    if (target) {
      setError("");
      setDone(null);
    }
  }

  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  const isOpen = target !== null;
  useEffect(() => {
    if (!isOpen) return;
    headingRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);
  const desktop = useSyncExternalStore(subscribeWide, () => window.matchMedia("(min-width: 768px)").matches, () => false);
  const hidden = reduce ? { opacity: 0 } : desktop ? { x: "100%" } : { y: "100%" };

  const isPrivate = target === "private";
  const session = target && target !== "private" ? target : null;
  const date = session && todayKey ? nextDate(todayKey, session.day) : null;
  const when = session
    ? date
      ? `${date.getMonth() + 1}월 ${date.getDate()}일(${DAY_NAMES[session.day]}) ${session.time}`
      : `다가오는 ${DAY_NAMES[session.day]}요일 ${session.time}`
    : "상담 전화로 정하는 시간";
  const className = session ? `${CLASS_INFO[session.type].name} ${session.level}` : CLASS_INFO.private.name;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) return setError("이름을 두 글자 이상 적어 주세요.");
    if (!/^01\d{8,9}$/.test(digits)) return setError("휴대전화 번호를 확인해 주세요. 예: 010-1234-5678");
    if (!agree) return setError("개인정보 수집과 이용에 동의해 주세요.");
    setError("");
    setDone(
      isPrivate
        ? `${maskName(name)} 님, 1:1 리포머 체험 신청을 받았습니다. 하루 안에 ${maskPhone(phone)}로 전화드려 수업 시간을 정하겠습니다.`
        : `${maskName(name)} 님, ${when} ${className} 체험 신청을 받았습니다. 하루 안에 ${maskPhone(phone)}로 전화드려 확인하겠습니다.`,
    );
    setName("");
    setPhone("");
    setPart("");
    setAgree(false);
  };

  const field = "mt-1.5 h-12 w-full rounded-[6px] border bg-white px-3.5 text-[16px] outline-none focus:border-[#24365a]";

  return (
    <AnimatePresence>
      {target && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-[#1f2430]/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-[12px] p-6 md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[440px] md:rounded-none md:p-8"
            style={{ background: C.paper }}
            initial={hidden}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={hidden}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[14px] font-semibold" style={{ color: C.clayDeep }}>
                  체험 수업 신청
                </p>
                <h3 id="booking-title" ref={headingRef} tabIndex={-1} className={`tracking-[-0.02em] mt-1 text-[24px] font-bold outline-none`}>
                  {className}
                </h3>
              </div>
              <button type="button" onClick={onClose} aria-label="닫기" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-[#ece6db]">
                <X size={22} aria-hidden />
              </button>
            </div>

            <dl className="mt-5 grid grid-cols-[72px_1fr] gap-y-2 border-y py-4 text-[15px]" style={{ borderColor: C.line }}>
              <dt style={{ color: C.muted }}>일시</dt>
              <dd>{when}</dd>
              {session && (
                <>
                  <dt style={{ color: C.muted }}>강사</dt>
                  <dd>{session.teacher}</dd>
                  <dt style={{ color: C.muted }}>자리</dt>
                  <dd className="flex items-center gap-2">
                    <Seats cap={CLASS_INFO[session.type].cap} booked={session.booked} />
                    {seatText(session)}
                  </dd>
                </>
              )}
              <dt style={{ color: C.muted }}>체험비</dt>
              <dd>{isPrivate ? "30,000원" : "20,000원"} (등록하면 수강료에서 뺍니다)</dd>
            </dl>

            {done ? (
              <div className="mt-6" role="status">
                <p className={`tracking-[-0.02em] text-[20px] font-bold`}>신청을 받았습니다</p>
                <p className="mt-2">{done}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full font-semibold"
                  style={{ background: C.indigo, color: C.onIndigo }}
                >
                  닫기
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-[15px] font-semibold">이름</span>
                  <input className={field} style={{ borderColor: C.line }} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </label>
                <label className="block">
                  <span className="text-[15px] font-semibold">휴대전화</span>
                  <input
                    className={field}
                    style={{ borderColor: C.line }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="010-0000-0000"
                  />
                </label>
                <label className="block">
                  <span className="text-[15px] font-semibold">불편한 곳 (선택)</span>
                  <select className={field} style={{ borderColor: C.line }} value={part} onChange={(e) => setPart(e.target.value)}>
                    <option value="">고르지 않음</option>
                    <option>허리</option>
                    <option>목, 어깨</option>
                    <option>골반</option>
                    <option>무릎</option>
                    <option>출산 후 회복</option>
                  </select>
                </label>
                <label className="flex items-start gap-2.5 text-[15px]">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 accent-[#24365a]" />
                  <span>상담 연락을 위해 이름과 휴대전화 번호를 수집하고, 체험 수업 후 3개월 뒤 지우는 데 동의합니다.</span>
                </label>
                {error && (
                  <p role="alert" className="text-[15px] font-semibold" style={{ color: "#a33a2a" }}>
                    {error}
                  </p>
                )}
                <button type="submit" className="inline-flex h-12 w-full items-center justify-center rounded-full font-semibold" style={{ background: C.indigo, color: C.onIndigo }}>
                  체험 신청하기
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- 회원권 ---------- */

function Pricing() {
  const [type, setType] = useState<PassType>("private");
  const [count, setCount] = useState<(typeof COUNTS)[number]>(10);
  const reduce = useReducedMotionSafe();
  const total = PRICE[type][count];
  const per = Math.round(total / count);
  const base = PRICE[type][10] / 10;
  const saving = base - per;

  return (
    <section aria-labelledby="price-title" id="price" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="price-title" title="회원권 금액" desc="수업 형태와 횟수를 고르면 총액과 한 번에 드는 금액을 보여 드립니다." />

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div className="space-y-7">
            <fieldset>
              <legend className="text-[15px] font-semibold">수업 형태</legend>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {PASS_TYPES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={type === p.id}
                    onClick={() => setType(p.id)}
                    className="h-12 rounded-[6px] border text-[16px] font-semibold transition-colors"
                    style={type === p.id ? { background: C.indigo, borderColor: C.indigo, color: C.onIndigo } : { borderColor: C.line, background: "#fffdf9" }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-[15px] font-semibold">횟수</legend>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {COUNTS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={count === n}
                    onClick={() => setCount(n)}
                    className="h-12 rounded-[6px] border text-[16px] font-semibold transition-colors"
                    style={count === n ? { background: C.indigo, borderColor: C.indigo, color: C.onIndigo } : { borderColor: C.line, background: "#fffdf9" }}
                  >
                    {n}회
                  </button>
                ))}
              </div>
            </fieldset>
            <ul className="space-y-1.5 text-[15px]" style={{ color: C.muted }}>
              <li>체험 수업: 1:1 30,000원, 그룹 20,000원</li>
              <li>유효기간 안에서 한 번, 최대 2주까지 멈출 수 있습니다.</li>
              {type === "duet" && <li>2:1 듀엣은 한 사람 기준 금액입니다.</li>}
            </ul>
          </div>

          <div className="rounded-[12px] border p-6 md:p-8" style={{ borderColor: C.line, background: "#fffdf9" }} aria-live="polite">
            <div className="grid grid-cols-10 gap-2 md:gap-2.5" aria-hidden>
              {Array.from({ length: count }, (_, i) => (
                <motion.span
                  key={`${type}-${count}-${i}`}
                  className="aspect-square rounded-full"
                  style={{ background: C.indigo }}
                  initial={reduce ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2, ease: EASE, delay: reduce ? 0 : i * 0.012 }}
                />
              ))}
            </div>
            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5">
              <div className="col-span-2">
                <dt className="text-[14px]" style={{ color: C.muted }}>
                  {PASS_TYPES.find((p) => p.id === type)!.label} {count}회 총액
                </dt>
                <dd className={`tracking-[-0.02em] text-[36px] font-bold leading-tight md:text-[44px]`} style={{ color: C.indigo }}>
                  {manwon(total)}
                </dd>
              </div>
              <div>
                <dt className="text-[14px]" style={{ color: C.muted }}>
                  회당
                </dt>
                <dd className="text-[20px] font-semibold">{won(per)}</dd>
              </div>
              <div>
                <dt className="text-[14px]" style={{ color: C.muted }}>
                  유효기간
                </dt>
                <dd className="text-[20px] font-semibold">{VALID_MONTHS[count]}개월</dd>
              </div>
            </dl>
            <p className="mt-5 border-t pt-4 text-[15px]" style={{ borderColor: C.line, color: saving > 0 ? C.clayDeep : C.muted }}>
              {saving > 0 ? `10회권보다 회당 ${won(saving)} 적게 냅니다.` : "횟수를 늘리면 회당 금액이 내려갑니다."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 강사 ---------- */

const OTHER_TEACHERS = [
  { name: "최○○ 강사", role: "그룹 매트, 아침 수업", career: ["필라테스 지도자 자격", "요가 지도 경력 6년"] },
  { name: "정○○ 강사", role: "소그룹 리포머, 체형 교정", career: ["필라테스 지도자 자격", "생활스포츠지도사 2급"] },
];

function Teachers() {
  return (
    <section aria-labelledby="teachers-title" id="teachers" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.sand }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="teachers-title" title="가르치는 사람들" />
        <div className="mt-10 grid gap-10 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[12px]">
            <Image src={`${IMG}/teacher.jpg`} alt="박○○ 원장" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" style={{ objectPosition: "50% 30%" }} />
          </div>
          <div>
            <p className="text-[15px] font-semibold" style={{ color: C.clayDeep }}>
              원장, 1:1 리포머
            </p>
            <h3 className={`tracking-[-0.02em] mt-1 text-[30px] font-bold`}>박○○</h3>
            <p className="mt-4" style={{ color: C.muted }}>
              물리치료사로 병원에서 일하다 필라테스를 가르치기 시작했습니다. 아픈 곳이 있는 분은 첫 시간에 꼭 몸 상태를 먼저 묻습니다.
            </p>
            <ul className="mt-5 space-y-1.5">
              {["물리치료사 면허", "국제 필라테스 지도자 자격", "재활 필라테스 교육 과정 수료", "필라테스 지도 9년"].map((c) => (
                <li key={c} className="flex gap-2.5">
                  <span className="mt-[0.7em] inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: C.indigo }} aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
            <ul className="mt-8 border-t" style={{ borderColor: C.line }}>
              {OTHER_TEACHERS.map((t) => (
                <li key={t.name} className="flex gap-4 border-b py-4" style={{ borderColor: C.line }}>
                  <span
                    className={`tracking-[-0.02em] inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-[17px] font-bold`}
                    style={{ borderColor: C.indigo, color: C.indigo }}
                    aria-hidden
                  >
                    {t.name[0]}
                  </span>
                  <div>
                    <p className="font-semibold">
                      {t.name}
                      <span className="ml-2 text-[14px] font-normal" style={{ color: C.muted }}>
                        {t.role}
                      </span>
                    </p>
                    <p className="text-[15px]" style={{ color: C.muted }}>
                      {t.career.join(", ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 공간 ---------- */

function Space() {
  return (
    <section aria-labelledby="space-title" className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="space-title" title="스튜디오 둘러보기" />
        <div className="mt-10 grid gap-6 md:grid-cols-[1.5fr_1fr] md:gap-8">
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[12px]">
              <Image src={`${IMG}/studio.jpg`} alt="리포머 기구가 놓인 스튜디오" fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-2.5 text-[15px]" style={{ color: C.muted }}>
              리포머실. 기구 6대를 넉넉한 간격으로 두었습니다.
            </figcaption>
          </figure>
          <div className="flex flex-col gap-6 md:pt-24">
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[12px]">
                <Image src={`${IMG}/mat.jpg`} alt="매트 여섯 장이 깔린 매트실" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
              </div>
              <figcaption className="mt-2.5 text-[15px]" style={{ color: C.muted }}>
                매트실. 그룹 수업은 최대 6명입니다.
              </figcaption>
            </figure>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-5 text-[15px]" style={{ borderColor: C.line }}>
              {[
                ["리포머", "6대"],
                ["샤워실", "2곳"],
                ["사물함", "개인별"],
                ["수건, 운동복", "무료로 빌려 드림"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt style={{ color: C.muted }}>{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-4 pb-24 pt-12 md:px-6" style={{ background: C.indigo, color: C.onIndigo }}>
      <div className="mx-auto max-w-[1200px]">
        <Logo light />
        <p className="mt-5 text-[16px] font-semibold">{ADDRESS} (□□역 3번 출구에서 걸어서 3분)</p>
        <p className="mt-1 text-[15px]" style={{ color: "#b9c3d8" }}>
          주차는 건물 지하 주차장 2시간 무료, 안내 데스크에서 차량 번호를 등록해 주세요.
        </p>
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: "#b9c3d8" }}>
          {[
            ["상호", STUDIO],
            ["대표자", "박○○"],
            ["사업자등록번호", "000-00-00000"],
            ["주소", ADDRESS],
            ["전화", TEL],
            ["이메일", "hello@example.com"],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt>{k}</dt>
              <dd style={{ color: C.onIndigo }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </footer>
  );
}
