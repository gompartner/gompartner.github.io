"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Menu, MessageSquareText, Phone, RotateCcw, Search, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 필라테스 스튜디오 홈페이지 데모: 가상의 ○○ 필라테스.
   스튜디오명, 강사, 주소, 전화번호, 사업자 정보, 수강료는 모두 가상이다.

   뼈대: 실제 필라테스 사이트(프로그램 안내형)를 따른다. 첫 화면은 사진 대신 짧은 소개 띠와
   요일 x 시간 그룹 시간표다. 그 아래로 프로그램 안내(개인, 듀엣, 그룹 비교 표), 수강료 안내 표,
   강사 소개, 스튜디오 소개, 오시는 길 순서. 상담 신청은 넓은 화면에서 오른쪽 가장자리 가운데에
   고정 탭으로, 좁은 화면에서는 상단 머리글에 둔다(화면 아래 양쪽 모서리는 사이트 공용 버튼 자리).

   상호작용
   1. 그룹 시간표: 칸마다 수업명, 강사, 남은 자리를 적고 강사와 난이도로 거른다.
      수업을 누르면 체험레슨 신청 창이 열린다. 신청은 실제로 보내지 않는다.
   2. 나에게 맞는 레슨 찾기: 프로그램 안내 표 위 버튼으로 열고, 질문 카드 세 장(불편한 부위,
      운동 경력, 희망 레슨)에 답하면 맞는 레슨과 이유가 나온다. 그룹이면 시간표에서 해당 수업만 비춘다.
   3. 강사 소개에서 강사별 시간표 보기를 누르면 시간표가 그 강사 수업으로 걸러진다.

   사진 출처(public/images/demo-pilates):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, teacher, mat, studio */

const IMG = "/images/demo-pilates";
const STUDIO = "○○ 필라테스";
const TEL = "02-000-0000";
const ADDRESS = "□□시 □□로 88 □□빌딩 2층";

const C = {
  paper: "#f5f2ec",
  sand: "#ece6db",
  card: "#fffdf9",
  ink: "#1f2430",
  muted: "#5d5a55",
  indigo: "#24365a",
  indigoSoft: "#dfe3ec",
  clay: "#b9876a",
  clayDeep: "#8a5a3f",
  line: "#ddd5c8",
  onIndigo: "#eef1f7",
  onIndigoMuted: "#b9c3d8",
};

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_INK = [0.65, 0, 0.35, 1] as const;

const NAV = [
  { id: "about", label: "스튜디오 소개" },
  { id: "program", label: "프로그램" },
  { id: "schedule", label: "시간표" },
  { id: "price", label: "수강료" },
  { id: "teachers", label: "강사 소개" },
  { id: "location", label: "오시는 길" },
];

/* ---------- 시간 ---------- */

const subscribeMinute = (cb: () => void) => {
  const timer = window.setInterval(cb, 30_000);
  return () => window.clearInterval(timer);
};
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
  { label: "일요일·공휴일", days: [0], time: "휴무", open: null },
] as const;

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

/** 운영시간 표에서 오늘 요일 줄을 짚기 위한 요일 값. 서버 렌더에서는 null. */
function todayStatus(minute: number) {
  if (!minute || minute < 0) return null;
  return { day: new Date(minute * 60_000).getDay() };
}

type Status = ReturnType<typeof todayStatus>;

/* ---------- 레슨 ---------- */

type ClassType = "private" | "duet" | "reformer" | "mat";
type Level = "입문" | "중급";

const CLASS_INFO: Record<ClassType, { name: string; cap: number; from: string }> = {
  private: { name: "1:1 개인레슨", cap: 1, from: "회당 60,000원부터" },
  duet: { name: "2:1 듀엣레슨", cap: 2, from: "1인 회당 39,000원부터" },
  reformer: { name: "그룹 리포머", cap: 4, from: "회당 24,000원부터" },
  mat: { name: "그룹 매트", cap: 6, from: "회당 24,000원부터" },
};

const PROGRAMS = [
  {
    id: "private",
    name: "1:1 개인레슨",
    rows: {
      정원: "1명",
      "수업 시간": "50분",
      "회당 금액": "60,000원부터",
      "추천 대상": "통증이 있거나 처음 시작하는 분",
      예약: "상담 후 시간 확정",
    },
  },
  {
    id: "duet",
    name: "2:1 듀엣레슨",
    rows: {
      정원: "2명",
      "수업 시간": "50분",
      "회당 금액": "39,000원부터 (1인)",
      "추천 대상": "가족, 친구와 함께 시작하는 분",
      예약: "상담 후 시간 확정",
    },
  },
  {
    id: "group",
    name: "그룹레슨",
    rows: {
      정원: "리포머 4명, 매트 6명",
      "수업 시간": "50분",
      "회당 금액": "24,000원부터",
      "추천 대상": "기본 동작을 익히고 꾸준히 운동하려는 분",
      예약: "그룹 시간표에서 선택",
    },
  },
] as const;

const PROGRAM_ROWS = ["정원", "수업 시간", "회당 금액", "추천 대상", "예약"] as const;

type Part = "back" | "shoulder" | "knee" | "none";
type Exp = "new" | "sometimes" | "steady";
type Pref = "solo" | "group";

const PART_OPTIONS: { id: Part; label: string }[] = [
  { id: "back", label: "허리" },
  { id: "shoulder", label: "목·어깨" },
  { id: "knee", label: "무릎" },
  { id: "none", label: "없음" },
];

const EXP_OPTIONS: { id: Exp; label: string }[] = [
  { id: "new", label: "없음" },
  { id: "sometimes", label: "6개월 미만" },
  { id: "steady", label: "6개월 이상" },
];

const PREF_OPTIONS: { id: Pref; label: string }[] = [
  { id: "solo", label: "1:1 개인레슨" },
  { id: "group", label: "그룹레슨" },
];

const PART_REASON: Record<Part, string> = {
  back: "허리 통증이 있으시다면 배와 골반 주변 근육을 먼저 쓰는 동작부터 시작합니다.",
  shoulder: "목과 어깨에 들어간 힘을 빼고 등 근육으로 팔을 쓰는 연습부터 합니다.",
  knee: "무릎에 체중이 덜 실리도록 누워서 하는 동작으로 허벅지와 엉덩이 근육을 먼저 키웁니다.",
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
        partReason || "운동 경력에 맞춰 강사가 동작 난이도를 수업마다 조절합니다.",
        "강사 한 명이 한 분만 지도하고, 수업 시간은 상담 후 정합니다.",
      ],
    };
  if (pref === "group" && (base.type === "private" || base.type === "duet"))
    return {
      type: "reformer",
      level: exp === "steady" ? "중급" : "입문",
      reasons: [partReason, "4명 정원이라 강사가 한 분씩 자세를 확인합니다. 불편한 부위는 수업 전에 강사에게 알려 주시기 바랍니다."],
    };
  return base;
}

function recommendBase(part: Part, exp: Exp): Rec {
  const partReason = PART_REASON[part];
  if (part !== "none") {
    if (exp === "new")
      return {
        type: "private",
        reasons: [partReason, "통증이 있고 운동 경력이 없으시다면 개인레슨을 받으시길 권장합니다."],
      };
    if (exp === "sometimes")
      return {
        type: "duet",
        reasons: [partReason, "듀엣레슨은 개인레슨보다 부담이 적고, 강사가 자세를 자주 교정합니다."],
      };
    return {
      type: "reformer",
      level: "중급",
      reasons: [partReason, "운동 경력이 있으시면 4명 그룹 수업도 충분히 따라올 수 있습니다. 불편한 부위는 수업 전에 알려 주시기 바랍니다."],
    };
  }
  if (exp === "new")
    return { type: "mat", level: "입문", reasons: ["기구 없이 매트에서 호흡과 기본 동작부터 배웁니다.", "정원 6명 입문반이라 부담 없이 시작할 수 있습니다."] };
  if (exp === "sometimes")
    return { type: "reformer", level: "입문", reasons: ["리포머 기구에 익숙해지는 입문반부터 시작합니다.", "스프링 강도를 낮게 두고 동작을 하나씩 익힙니다."] };
  return { type: "reformer", level: "중급", reasons: ["기본 동작을 아는 분들이 모인 중급반입니다.", "쉬는 시간을 줄이고 연속 동작 위주로 진행합니다."] };
}

/* ---------- 시간표 ---------- */

type Teacher = "박ㅅ연" | "최ㅇ진" | "정ㅎ윤";

interface Session {
  id: string;
  day: number; // 1 월 ~ 6 토
  time: string;
  type: "reformer" | "mat";
  teacher: Teacher;
  level: Level;
  booked: number;
}

const TIMES = ["07:00", "10:00", "12:30", "19:00", "20:30"];
const WEEK = [1, 2, 3, 4, 5, 6];

const SESSIONS: Session[] = [
  { id: "s1", day: 1, time: "07:00", type: "mat", teacher: "최ㅇ진", level: "입문", booked: 4 },
  { id: "s2", day: 1, time: "10:00", type: "reformer", teacher: "박ㅅ연", level: "입문", booked: 2 },
  { id: "s3", day: 1, time: "12:30", type: "mat", teacher: "정ㅎ윤", level: "입문", booked: 5 },
  { id: "s4", day: 1, time: "19:00", type: "reformer", teacher: "박ㅅ연", level: "중급", booked: 4 },
  { id: "s5", day: 1, time: "20:30", type: "mat", teacher: "최ㅇ진", level: "중급", booked: 3 },
  { id: "s6", day: 2, time: "07:00", type: "reformer", teacher: "정ㅎ윤", level: "입문", booked: 1 },
  { id: "s7", day: 2, time: "10:00", type: "mat", teacher: "최ㅇ진", level: "입문", booked: 6 },
  { id: "s8", day: 2, time: "19:00", type: "reformer", teacher: "정ㅎ윤", level: "입문", booked: 3 },
  { id: "s9", day: 2, time: "20:30", type: "reformer", teacher: "박ㅅ연", level: "중급", booked: 1 },
  { id: "s10", day: 3, time: "07:00", type: "mat", teacher: "최ㅇ진", level: "입문", booked: 2 },
  { id: "s11", day: 3, time: "10:00", type: "reformer", teacher: "박ㅅ연", level: "중급", booked: 3 },
  { id: "s12", day: 3, time: "12:30", type: "reformer", teacher: "정ㅎ윤", level: "입문", booked: 1 },
  { id: "s13", day: 3, time: "19:00", type: "mat", teacher: "최ㅇ진", level: "입문", booked: 5 },
  { id: "s14", day: 3, time: "20:30", type: "reformer", teacher: "박ㅅ연", level: "중급", booked: 2 },
  { id: "s15", day: 4, time: "07:00", type: "reformer", teacher: "정ㅎ윤", level: "입문", booked: 2 },
  { id: "s16", day: 4, time: "10:00", type: "mat", teacher: "최ㅇ진", level: "중급", booked: 4 },
  { id: "s17", day: 4, time: "19:00", type: "reformer", teacher: "정ㅎ윤", level: "중급", booked: 4 },
  { id: "s18", day: 4, time: "20:30", type: "mat", teacher: "최ㅇ진", level: "입문", booked: 1 },
  { id: "s19", day: 5, time: "07:00", type: "mat", teacher: "최ㅇ진", level: "입문", booked: 3 },
  { id: "s20", day: 5, time: "10:00", type: "reformer", teacher: "박ㅅ연", level: "입문", booked: 0 },
  { id: "s21", day: 5, time: "12:30", type: "mat", teacher: "정ㅎ윤", level: "입문", booked: 2 },
  { id: "s22", day: 5, time: "19:00", type: "reformer", teacher: "박ㅅ연", level: "입문", booked: 3 },
  { id: "s23", day: 6, time: "10:00", type: "reformer", teacher: "박ㅅ연", level: "입문", booked: 3 },
  { id: "s24", day: 6, time: "12:30", type: "mat", teacher: "정ㅎ윤", level: "입문", booked: 2 },
];

const TEACHERS: Teacher[] = ["박ㅅ연", "최ㅇ진", "정ㅎ윤"];

const noopSubscribe = () => () => {};

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

/** 병원식 마스킹: 김하늘 → 김ㅎ늘, 두 글자는 김* */
function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return chars.join("");
  if (chars.length === 2) return `${chars[0]}*`;
  const hide = (ch: string) => {
    const code = ch.charCodeAt(0) - 0xac00;
    return code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*";
  };
  return chars.map((ch, i) => (i === 0 || i === chars.length - 1 ? ch : hide(ch))).join("");
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

/* ---------- 수강료 ---------- */

type PassType = "private" | "duet" | "group";
const PASS_TYPES: { id: PassType; label: string; note?: string }[] = [
  { id: "private", label: "1:1 개인레슨" },
  { id: "duet", label: "2:1 듀엣레슨", note: "1인 기준" },
  { id: "group", label: "그룹레슨" },
];
const COUNTS = [10, 20, 30] as const;
const PRICE: Record<PassType, Record<(typeof COUNTS)[number], number>> = {
  private: { 10: 700_000, 20: 1_300_000, 30: 1_800_000 },
  duet: { 10: 450_000, 20: 840_000, 30: 1_170_000 },
  group: { 10: 300_000, 20: 540_000, 30: 720_000 },
};
const VALID_MONTHS: Record<(typeof COUNTS)[number], number> = { 10: 3, 20: 5, 30: 7 };

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/* ============================================================ */

type BookingTarget = Session | "private" | "duet" | "consult";
type Highlight = { type: ClassType; level?: Level } | null;

export function PilatesStudioDemo() {
  const minute = useNowMinute();
  const status = todayStatus(minute);
  const [booking, setBooking] = useState<BookingTarget | null>(null);
  const [highlight, setHighlight] = useState<Highlight>(null);
  const [teacher, setTeacher] = useState<"전체" | Teacher>("전체");

  const toSchedule = () => document.getElementById("schedule")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const goSchedule = (type: ClassType, level?: Level) => {
    setHighlight({ type, level });
    setTeacher("전체");
    toSchedule();
  };

  const showTeacher = (t: Teacher) => {
    setTeacher(t);
    setHighlight(null);
    toSchedule();
  };

  const consult = () => setBooking("consult");

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.paper, color: C.ink }}>
      <Header onConsult={consult} />
      <main>
        <Intro onConsult={consult} />
        <Schedule
          highlight={highlight}
          onClearHighlight={() => setHighlight(null)}
          teacher={teacher}
          onTeacher={setTeacher}
          onPick={setBooking}
        />
        <Program onSchedule={goSchedule} onBook={setBooking} />
        <Pricing />
        <Teachers onShow={showTeacher} />
        <About />
        <Location status={status} />
      </main>
      <Footer />
      <ConsultTab onConsult={consult} />
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
      <span className="text-[19px] font-bold tracking-[-0.01em]">{STUDIO}</span>
    </span>
  );
}

function Header({ onConsult }: { onConsult: () => void }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: C.paper, borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <a href="#top" aria-label={`${STUDIO} 처음으로`} className="shrink-0">
          <Logo />
        </a>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-[15px]">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="transition-colors hover:text-[#24365a]" style={{ color: C.muted }}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <a href={`tel:${TEL}`} className="hidden items-center gap-1.5 text-[15px] font-semibold lg:inline-flex" style={{ color: C.indigo }}>
            <Phone size={16} aria-hidden />
            {TEL}
          </a>
          <button
            type="button"
            onClick={onConsult}
            className="inline-flex h-10 items-center rounded-[4px] px-4 text-[15px] font-semibold md:hidden"
            style={{ background: C.indigo, color: C.onIndigo }}
          >
            상담 신청
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] lg:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            aria-controls="pilates-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="pilates-menu"
            aria-label="주 메뉴"
            className="overflow-hidden border-t lg:hidden"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { height: 0 }}
            animate={{ height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <ul className="grid grid-cols-2 px-4 py-2">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} onClick={() => setOpen(false)} className="flex h-12 items-center text-[17px]">
                    {n.label}
                  </a>
                </li>
              ))}
              <li className="col-span-2">
                <a href={`tel:${TEL}`} className="flex h-12 items-center gap-2 text-[17px] font-semibold" style={{ color: C.indigo }}>
                  <Phone size={17} aria-hidden />
                  {TEL}
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/** 넓은 화면에서 오른쪽 가장자리 가운데에 고정되는 상담 신청 탭. 아래 모서리는 사이트 공용 버튼 자리라 피한다. */
function ConsultTab({ onConsult }: { onConsult: () => void }) {
  return (
    <button
      type="button"
      onClick={onConsult}
      className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-2 rounded-l-[10px] px-3 py-5 text-[16px] font-semibold shadow-md transition-colors hover:bg-[#1a2846] md:flex"
      style={{ background: C.indigo, color: C.onIndigo }}
    >
      <MessageSquareText size={18} aria-hidden />
      <span style={{ writingMode: "vertical-rl", letterSpacing: "0.12em" }}>상담 신청</span>
    </button>
  );
}

/* ---------- 첫 화면: 소개 띠 ---------- */

function Intro({ onConsult }: { onConsult: () => void }) {
  return (
    <section id="top" aria-labelledby="studio-name" className="border-b px-4 pb-8 pt-6 md:px-6 md:pb-10 md:pt-8" style={{ borderColor: C.line }}>
      <div className="mx-auto max-w-[1200px]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] sm:aspect-[21/9]">
          <Image
            src={`${IMG}/hero.jpg`}
            alt="한지 창으로 빛이 드는 리포머실"
            fill
            priority
            sizes="(min-width: 1200px) 1200px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end md:gap-10">
          <div>
            <h1 id="studio-name" className="text-[32px] font-bold leading-[1.25] tracking-[-0.02em] md:text-[44px]">
              {STUDIO}
            </h1>
            <p className="mt-3 max-w-[40em]" style={{ color: C.muted }}>
              1:1 개인레슨, 2:1 듀엣레슨, 최대 6명 그룹레슨을 합니다. 물리치료사 출신 원장이 첫 수업 때 체형 상담을 함께 하고,
              □□역 3번 출구에서 걸어서 3분입니다. 건물 주차는 2시간 무료입니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="text-[15px] tabular-nums">
              <span style={{ color: C.muted }}>평일 </span>
              <span className="font-semibold">07:00 ~ 22:00</span>
              <span style={{ color: C.muted }}>, 토요일 </span>
              <span className="font-semibold">09:00 ~ 15:00</span>
            </p>
            <button
              type="button"
              onClick={onConsult}
              className="hidden h-12 items-center rounded-[4px] px-6 text-[16px] font-semibold transition-colors hover:bg-[#1a2846] md:inline-flex"
              style={{ background: C.indigo, color: C.onIndigo }}
            >
              상담 신청
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 구역 제목 ---------- */

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-[26px] font-bold leading-[1.35] tracking-[-0.02em] md:text-[32px]">
      {children}
    </h2>
  );
}

/* ---------- 그룹 시간표 ---------- */

function seatsLeft(s: Session) {
  return CLASS_INFO[s.type].cap - s.booked;
}

function seatText(s: Session) {
  const left = seatsLeft(s);
  return left <= 0 ? "마감" : `${left}자리 남음`;
}

function Filter<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-[14px]">
      <span style={{ color: C.muted }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-10 min-w-[104px] rounded-[4px] border px-2.5 text-[15px]"
        style={{ borderColor: C.line, background: C.card, color: C.ink }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "전체" ? `${label} 전체` : o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Schedule({
  highlight,
  onClearHighlight,
  teacher,
  onTeacher,
  onPick,
}: {
  highlight: Highlight;
  onClearHighlight: () => void;
  teacher: "전체" | Teacher;
  onTeacher: (t: "전체" | Teacher) => void;
  onPick: (s: Session) => void;
}) {
  const [level, setLevel] = useState<"전체" | Level>("전체");
  const [mobileDay, setMobileDay] = useState(1);

  const matches = (s: Session) =>
    (teacher === "전체" || s.teacher === teacher) &&
    (level === "전체" || s.level === level) &&
    (!highlight || (s.type === highlight.type && (!highlight.level || s.level === highlight.level)));

  const cell = (s: Session, compact: boolean) => {
    const on = matches(s);
    const full = seatsLeft(s) <= 0;
    return (
      <button
        type="button"
        disabled={full}
        onClick={() => onPick(s)}
        aria-label={`${DAY_NAMES[s.day]}요일 ${s.time} ${CLASS_INFO[s.type].name} ${s.level}, ${s.teacher} 강사, ${seatText(s)}, 체험레슨 신청`}
        className={`w-full rounded-[4px] border text-left transition-[opacity,background-color] duration-200 ${compact ? "px-2.5 py-2" : "px-4 py-3"} ${full ? "cursor-not-allowed" : "hover:bg-[#dfe3ec]"}`}
        style={{
          borderColor: on && highlight ? C.indigo : C.line,
          background: on && highlight ? C.indigoSoft : C.card,
          opacity: on ? 1 : 0.3,
        }}
      >
        <span className={`block font-semibold leading-[1.35] ${compact ? "text-[14px]" : "text-[16px]"}`}>
          {CLASS_INFO[s.type].name}
          <span className="ml-1 text-[12px] font-semibold" style={{ color: C.clayDeep }}>
            {s.level}
          </span>
        </span>
        <span className="block text-[13px]" style={{ color: C.muted }}>
          {s.teacher}
        </span>
        <span className="mt-1 block text-[13px] font-semibold tabular-nums" style={{ color: full ? C.clayDeep : C.indigo }}>
          {seatText(s)}
          {!full && (
            <span className="font-normal" style={{ color: C.muted }}>
              {" "}
              / 정원 {CLASS_INFO[s.type].cap}명
            </span>
          )}
        </span>
      </button>
    );
  };

  return (
    <section aria-labelledby="schedule-title" id="schedule" className="scroll-mt-16 px-4 py-10 md:px-6 md:py-14" style={{ background: C.sand }}>
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle id="schedule-title">그룹 시간표</SectionTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <Filter label="강사" value={teacher} options={["전체", ...TEACHERS]} onChange={onTeacher} />
            <Filter label="난이도" value={level} options={["전체", "입문", "중급"] as ("전체" | Level)[]} onChange={setLevel} />
            {highlight && (
              <button
                type="button"
                onClick={onClearHighlight}
                className="inline-flex h-10 w-fit items-center gap-1.5 rounded-[4px] px-3.5 text-[14px] font-semibold"
                style={{ background: C.indigo, color: C.onIndigo }}
                aria-label={`추천 레슨 표시 해제: ${CLASS_INFO[highlight.type].name}`}
              >
                추천 {CLASS_INFO[highlight.type].name}
                {highlight.level ? ` ${highlight.level}` : ""}
                <X size={15} aria-hidden />
              </button>
            )}
          </div>
        </div>

        {/* 넓은 화면: 요일 x 시간 표 */}
        <div className="mt-6 hidden md:block">
          <table className="w-full table-fixed border-collapse">
            <caption className="sr-only">요일별, 시간별 그룹레슨 시간표. 칸을 누르면 체험레슨 신청 창이 열립니다.</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[72px] border-b-2 pb-2 text-left text-[14px] font-semibold" style={{ borderColor: C.indigo, color: C.muted }}>
                  시간
                </th>
                {WEEK.map((d) => (
                  <th key={d} scope="col" className="border-b-2 pb-2 text-[16px] font-bold" style={{ borderColor: C.indigo }}>
                    {DAY_NAMES[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMES.map((t) => (
                <tr key={t} className="border-b" style={{ borderColor: C.line }}>
                  <th scope="row" className="py-1.5 pr-2 text-left align-top text-[15px] font-semibold" style={{ color: C.muted }}>
                    <span className="block pt-2">{t}</span>
                  </th>
                  {WEEK.map((d) => {
                    const s = SESSIONS.find((x) => x.day === d && x.time === t);
                    return (
                      <td key={d} className="p-1 align-top">
                        {s ? cell(s, true) : <span className="sr-only">수업 없음</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 좁은 화면: 요일 탭과 목록 */}
        <div className="mt-6 md:hidden">
          <div className="grid grid-cols-6 border-b-2" style={{ borderColor: C.indigo }} role="group" aria-label="요일">
            {WEEK.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={mobileDay === d}
                onClick={() => setMobileDay(d)}
                className="h-11 rounded-t-[4px] text-[17px] font-bold"
                style={mobileDay === d ? { background: C.indigo, color: C.onIndigo } : { color: C.ink }}
              >
                {DAY_NAMES[d]}
              </button>
            ))}
          </div>
          <ul>
            {SESSIONS.filter((s) => s.day === mobileDay).map((s) => (
              <li key={s.id} className="grid grid-cols-[56px_1fr] items-start gap-2 border-b py-2" style={{ borderColor: C.line }}>
                <span className="pt-3 text-[15px] font-semibold" style={{ color: C.muted }}>
                  {s.time}
                </span>
                {cell(s, false)}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
          레슨 시간은 각 50분입니다. 개인·듀엣레슨은 시간표와 별도로 예약합니다.
        </p>
      </div>
    </section>
  );
}

/* ---------- 프로그램 안내 ---------- */

function Program({ onSchedule, onBook }: { onSchedule: (t: ClassType, level?: Level) => void; onBook: (t: "private" | "duet") => void }) {
  const [finder, setFinder] = useState(false);

  return (
    <section aria-labelledby="program-title" id="program" className="scroll-mt-16 px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle id="program-title">프로그램 안내</SectionTitle>
          <button
            id="lesson-finder"
            type="button"
            aria-expanded={finder}
            aria-controls="lesson-finder-panel"
            onClick={() => setFinder((v) => !v)}
            className="inline-flex h-10 items-center gap-1.5 rounded-[4px] border px-4 text-[15px] font-semibold transition-colors hover:bg-[#ece6db]"
            style={{ borderColor: C.indigo, color: C.indigo }}
          >
            {finder ? <X size={16} aria-hidden /> : <Search size={16} aria-hidden />}
            나에게 맞는 레슨 찾기
          </button>
        </div>

        {finder && (
          <div id="lesson-finder-panel" className="mt-6">
            <Finder onSchedule={onSchedule} onBook={onBook} />
          </div>
        )}

        {/* 넓은 화면: 세 칸 비교 표 */}
        <table className="mt-8 hidden w-full table-fixed border-collapse text-left md:table">
          <caption className="sr-only">개인레슨, 듀엣레슨, 그룹레슨 비교</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[140px] border-b-2 pb-3" style={{ borderColor: C.indigo }}>
                <span className="sr-only">항목</span>
              </th>
              {PROGRAMS.map((p) => (
                <th key={p.id} scope="col" className="border-b-2 px-4 pb-3 text-[20px] font-bold tracking-[-0.01em]" style={{ borderColor: C.indigo }}>
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROGRAM_ROWS.map((r) => (
              <tr key={r} className="border-b" style={{ borderColor: C.line }}>
                <th scope="row" className="py-3.5 text-[15px] font-semibold" style={{ color: C.muted }}>
                  {r}
                </th>
                {PROGRAMS.map((p) => (
                  <td key={p.id} className={`px-4 py-3.5 ${r === "회당 금액" ? "font-semibold" : ""}`} style={r === "회당 금액" ? { color: C.indigo } : undefined}>
                    {p.rows[r]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* 좁은 화면: 레슨별 목록 */}
        <div className="mt-6 space-y-5 md:hidden">
          {PROGRAMS.map((p) => (
            <div key={p.id} className="border-t-2 pt-3" style={{ borderColor: C.indigo }}>
              <h3 className="text-[19px] font-bold">{p.name}</h3>
              <dl className="mt-2 grid grid-cols-[84px_1fr] gap-y-1.5 text-[15px]">
                {PROGRAM_ROWS.map((r) => (
                  <div key={r} className="contents">
                    <dt style={{ color: C.muted }}>{r}</dt>
                    <dd className={r === "회당 금액" ? "font-semibold" : ""} style={r === "회당 금액" ? { color: C.indigo } : undefined}>
                      {p.rows[r]}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
          사용 기구: 리포머, 체어, 캐딜락, 바렐
        </p>
      </div>
    </section>
  );
}

/* ---------- 나에게 맞는 레슨 찾기 (질문 카드 세 장) ---------- */

function Finder({ onSchedule, onBook }: { onSchedule: (t: ClassType, level?: Level) => void; onBook: (t: "private" | "duet") => void }) {
  const [step, setStep] = useState(0);
  const [part, setPart] = useState<Part | null>(null);
  const [exp, setExp] = useState<Exp | null>(null);
  const [pref, setPref] = useState<Pref | null>(null);
  const reduce = useReducedMotionSafe();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rec = part && exp && pref ? recommend(part, exp, pref) : null;
  const info = rec ? CLASS_INFO[rec.type] : null;

  // 패널이 열리거나 카드를 넘기면 질문 제목으로 초점을 옮겨 키보드와 화면 읽기 사용자가 이어서 고를 수 있게 한다.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const restart = () => {
    setPart(null);
    setExp(null);
    setPref(null);
    setStep(0);
  };

  const questions = [
    { title: "불편한 부위", options: PART_OPTIONS, value: part, pick: (v: string) => setPart(v as Part) },
    { title: "운동 경력", options: EXP_OPTIONS, value: exp, pick: (v: string) => setExp(v as Exp) },
    { title: "희망 레슨", options: PREF_OPTIONS, value: pref, pick: (v: string) => setPref(v as Pref) },
  ];
  const q = step < questions.length ? questions[step] : null;

  return (
    <div className="max-w-[720px] rounded-[12px] border p-5 md:p-7" style={{ background: C.card, borderColor: C.line }}>
      {q ? (
        <>
          <p className="text-[14px]" style={{ color: C.muted }}>
            {step + 1} / {questions.length}
          </p>
          <h3 ref={headingRef} tabIndex={-1} className="mt-0.5 text-[22px] font-bold tracking-[-0.02em] outline-none md:text-[26px]">
            {q.title}
          </h3>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2" role="group" aria-label={q.title}>
            {q.options.map((o) => (
              <button
                key={o.id}
                type="button"
                aria-pressed={q.value === o.id}
                onClick={() => {
                  q.pick(o.id);
                  setStep(step + 1);
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
              추천 레슨
            </h3>
            <motion.div
              key={`${rec.type}-${part}-${exp}-${pref}`}
              className="rounded-[10px] p-5 md:p-7"
              style={{ background: C.indigo, color: C.onIndigo }}
              initial={reduce ? false : { clipPath: "circle(0% at 0% 0%)" }}
              animate={{ clipPath: "circle(150% at 0% 0%)" }}
              transition={{ duration: 0.7, ease: EASE_INK }}
            >
              <p className="text-[26px] font-bold tracking-[-0.02em]">
                {info.name}
                {rec.level && <span className="ml-2 align-middle text-[16px] font-medium">{rec.level}반</span>}
              </p>
              <ul className="mt-3 space-y-2">
                {rec.reasons.filter(Boolean).map((r) => (
                  <li key={r} className="flex gap-2.5">
                    <span className="mt-[0.7em] inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: C.clay }} aria-hidden />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[15px]" style={{ color: C.onIndigoMuted }}>
                {info.from}
              </p>
              {rec.type === "private" || rec.type === "duet" ? (
                <button
                  type="button"
                  onClick={() => onBook(rec.type as "private" | "duet")}
                  className="mt-5 inline-flex h-12 items-center rounded-[4px] px-6 font-semibold"
                  style={{ background: C.paper, color: C.indigo }}
                >
                  체험레슨 신청
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSchedule(rec.type, rec.level)}
                  className="mt-5 inline-flex h-12 items-center rounded-[4px] px-6 font-semibold"
                  style={{ background: C.paper, color: C.indigo }}
                >
                  시간표 보기
                </button>
              )}
            </motion.div>
          </div>
        )
      )}

      {step > 0 && (
        <div className="mt-5 flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: C.line }}>
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="inline-flex h-11 items-center gap-1.5 rounded-[4px] border px-4 text-[15px] font-semibold"
            style={{ borderColor: C.line, color: C.ink }}
          >
            <ArrowLeft size={16} aria-hidden />
            이전
          </button>
          <button type="button" onClick={restart} className="inline-flex h-11 items-center gap-1.5 rounded-[4px] px-4 text-[15px] font-semibold" style={{ color: C.muted }}>
            <RotateCcw size={16} aria-hidden />
            다시 하기
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- 수강료 안내 ---------- */

function Pricing() {
  return (
    <section aria-labelledby="price-title" id="price" className="scroll-mt-16 px-4 py-14 md:px-6 md:py-20" style={{ background: C.sand }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle id="price-title">수강료 안내</SectionTitle>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-left">
            <caption className="sr-only">레슨 종류와 횟수별 수강료, 회당 금액, 유효기간</caption>
            <thead>
              <tr>
                <th scope="col" className="border-b-2 pb-2.5 text-[14px] font-semibold" style={{ borderColor: C.indigo, color: C.muted }}>
                  레슨
                </th>
                {COUNTS.map((n) => (
                  <th key={n} scope="col" className="border-b-2 px-1.5 pb-2.5 text-right text-[16px] font-bold md:px-4" style={{ borderColor: C.indigo }}>
                    {n}회
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PASS_TYPES.map((p) => (
                <tr key={p.id} className="border-b" style={{ borderColor: C.line }}>
                  <th scope="row" className="py-3.5 pr-1.5 align-top text-[14px] font-semibold md:text-[16px]">
                    {p.label}
                    {p.note && (
                      <span className="block text-[13px] font-normal" style={{ color: C.muted }}>
                        {p.note}
                      </span>
                    )}
                  </th>
                  {COUNTS.map((n) => (
                    <td key={n} className="px-1.5 py-3.5 text-right align-top md:px-4">
                      <span className="block text-[14px] font-bold md:text-[18px]" style={{ color: C.indigo }}>
                        {won(PRICE[p.id][n])}
                      </span>
                      <span className="block text-[12px] md:text-[14px]" style={{ color: C.muted }}>
                        회당 {won(Math.round(PRICE[p.id][n] / n))}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="py-3 text-[14px] font-semibold" style={{ color: C.muted }}>
                  유효기간
                </th>
                {COUNTS.map((n) => (
                  <td key={n} className="px-1.5 py-3 text-right text-[15px] md:px-4">
                    {VALID_MONTHS[n]}개월
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <ul className="mt-4 space-y-1 text-[14px]" style={{ color: C.muted }}>
          <li>체험레슨: 1:1 개인레슨 30,000원, 그룹레슨 20,000원 (등록 시 수강료에서 차감)</li>
          <li>유효기간 안에서 1회, 최대 2주까지 일시정지할 수 있습니다.</li>
          <li>부가세 포함 금액입니다.</li>
        </ul>
      </div>
    </section>
  );
}

/* ---------- 강사 소개 ---------- */

const TEACHER_INFO: { name: Teacher; role: string; lessons: string; career: string[]; photo: string }[] = [
  {
    name: "박ㅅ연",
    role: "원장",
    lessons: "1:1 개인레슨, 그룹 리포머",
    career: ["물리치료사 면허", "국제 필라테스 지도자 자격", "재활 필라테스 교육 과정 수료", "필라테스 지도 9년"],
    photo: `${IMG}/teacher.jpg`,
  },
  {
    name: "최ㅇ진",
    role: "강사",
    lessons: "그룹 매트, 아침 수업",
    career: ["필라테스 지도자 자격", "요가 지도 경력 6년"],
    photo: `${IMG}/teacher-2.jpg`,
  },
  {
    name: "정ㅎ윤",
    role: "강사",
    lessons: "그룹 리포머, 체형 교정",
    career: ["필라테스 지도자 자격", "생활스포츠지도사 2급"],
    photo: `${IMG}/teacher-3.jpg`,
  },
];

function Teachers({ onShow }: { onShow: (t: Teacher) => void }) {
  return (
    <section aria-labelledby="teachers-title" id="teachers" className="scroll-mt-16 px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle id="teachers-title">강사 소개</SectionTitle>
        <ul className="mt-6 grid gap-x-8 md:grid-cols-3">
          {TEACHER_INFO.map((t) => (
            <li key={t.name} className="border-t-2 py-5" style={{ borderColor: C.indigo }}>
              <div className="flex items-center gap-4">
                <span className="relative block h-[96px] w-[76px] shrink-0 overflow-hidden rounded-[4px]" style={{ background: C.sand }}>
                  <Image src={t.photo} alt={`${t.name} ${t.role}`} fill sizes="76px" className="object-cover" style={{ objectPosition: "50% 25%" }} />
                </span>
                <div>
                  <h3 className="text-[21px] font-bold tracking-[-0.01em]">
                    {t.name}
                    <span className="ml-1.5 text-[15px] font-medium" style={{ color: C.clayDeep }}>
                      {t.role}
                    </span>
                  </h3>
                  <p className="text-[14px]" style={{ color: C.muted }}>
                    {t.lessons}
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-1 text-[15px]">
                {t.career.map((c) => (
                  <li key={c} className="flex gap-2.5">
                    <span className="mt-[0.7em] inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: C.indigo }} aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onShow(t.name)}
                className="mt-4 inline-flex h-10 items-center rounded-[4px] border px-4 text-[14px] font-semibold transition-colors hover:bg-[#ece6db]"
                style={{ borderColor: C.line, color: C.indigo }}
                aria-label={`${t.name} 강사 그룹 시간표 보기`}
              >
                강사별 시간표
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 스튜디오 소개 ---------- */

const FACILITIES = [
  ["리포머", "6대"],
  ["체어, 캐딜락, 바렐", "각 2대"],
  ["샤워실", "2곳"],
  ["사물함", "개인별"],
  ["수건, 운동복", "무료 대여"],
  ["면적", "132㎡ (40평)"],
];

function About() {
  return (
    <section aria-labelledby="about-title" id="about" className="scroll-mt-16 px-4 py-14 md:px-6 md:py-20" style={{ background: C.sand }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle id="about-title">스튜디오 소개</SectionTitle>
        <p className="mt-3 max-w-[720px]" style={{ color: C.muted }}>
          호흡을 먼저 배우고, 몸 상태에 맞춰 동작을 고릅니다. 모든 첫 수업은 체형 상담을 함께 하는 50분 체험레슨입니다.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-[3fr_2fr] md:gap-4">
          {[
            { src: `${IMG}/studio.jpg`, alt: "리포머 기구가 놓인 스튜디오", cap: "리포머실, 기구 6대", wide: true },
            { src: `${IMG}/mat.jpg`, alt: "매트 여섯 장이 깔린 매트실", cap: "매트실", wide: false },
          ].map((p) => (
            <figure key={p.cap}>
              <div className={`relative overflow-hidden rounded-[6px] ${p.wide ? "aspect-[4/3]" : "aspect-[4/3] md:aspect-auto md:h-full"}`}>
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <figcaption className="mt-1.5 text-[14px]" style={{ color: C.muted }}>
                {p.cap}
              </figcaption>
            </figure>
          ))}
        </div>
        <h3 className="mt-10 text-[20px] font-bold">시설 안내</h3>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 border-t md:grid-cols-3" style={{ borderColor: C.line }}>
          {FACILITIES.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b py-2.5 text-[15px]" style={{ borderColor: C.line }}>
              <dt style={{ color: C.muted }}>{k}</dt>
              <dd className="text-right font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

function Location({ status }: { status: Status }) {
  return (
    <section aria-labelledby="location-title" id="location" className="scroll-mt-16 px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <SectionTitle id="location-title">오시는 길</SectionTitle>
          <dl className="mt-5 grid grid-cols-[64px_1fr] gap-y-2.5 text-[15px] md:text-[16px]">
            <dt style={{ color: C.muted }}>주소</dt>
            <dd>{ADDRESS}</dd>
            <dt style={{ color: C.muted }}>지하철</dt>
            <dd>□□역 3번 출구 도보 3분</dd>
            <dt style={{ color: C.muted }}>주차</dt>
            <dd>건물 지하 주차장 2시간 무료 (안내 데스크에서 차량 번호 등록)</dd>
            <dt style={{ color: C.muted }}>전화</dt>
            <dd>
              <a href={`tel:${TEL}`} className="font-semibold underline underline-offset-4" style={{ color: C.indigo }}>
                {TEL}
              </a>
            </dd>
          </dl>
        </div>
        <div>
          <h3 className="text-[20px] font-bold md:mt-2">운영시간</h3>
          <table className="mt-4 w-full border-collapse text-left text-[15px] md:text-[16px]">
            <caption className="sr-only">요일별 운영시간</caption>
            <tbody>
              {HOURS.map((h) => {
                const today = status ? (h.days as readonly number[]).includes(status.day) : false;
                return (
                  <tr key={h.label} className="border-b" style={{ borderColor: C.line, background: today ? C.indigoSoft : undefined }}>
                    <th scope="row" className="px-2 py-3 font-semibold">
                      {h.label}
                      {today && <span className="ml-2 text-[13px] font-semibold" style={{ color: C.indigo }}>오늘</span>}
                    </th>
                    <td className="px-2 py-3 text-right">{h.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
            마지막 수업은 운영 종료 1시간 전에 시작합니다.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- 체험레슨·상담 신청 창 ---------- */

function BookingDrawer({ target, onClose }: { target: BookingTarget | null; onClose: () => void }) {
  const reduce = useReducedMotionSafe();
  const todayKey = useSyncExternalStore(noopSubscribe, () => new Date().toDateString(), () => "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [part, setPart] = useState("");
  const [lesson, setLesson] = useState("체험레슨");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [lastTarget, setLastTarget] = useState(target);
  const ids = { name: "pl-name", phone: "pl-phone", part: "pl-part", lesson: "pl-lesson" };

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
    const opener = document.activeElement as HTMLElement | null;
    headingRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [isOpen]);
  const desktop = useSyncExternalStore(subscribeWide, () => window.matchMedia("(min-width: 768px)").matches, () => false);
  const hidden = reduce ? { opacity: 0 } : desktop ? { x: "100%" } : { y: "100%" };

  const isConsult = target === "consult";
  const session = target && typeof target !== "string" ? target : null;
  const lessonType: ClassType | null = session ? session.type : target === "private" || target === "duet" ? target : null;
  const date = session && todayKey ? nextDate(todayKey, session.day) : null;
  const when = session
    ? date
      ? `${date.getMonth() + 1}월 ${date.getDate()}일(${DAY_NAMES[session.day]}) ${session.time}`
      : `${DAY_NAMES[session.day]}요일 ${session.time}`
    : "상담 후 시간 확정";
  const lessonName = session ? `${CLASS_INFO[session.type].name} ${session.level}` : lessonType ? CLASS_INFO[lessonType].name : "";
  const fee = lessonType === "private" || lessonType === "duet" ? "30,000원" : "20,000원";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) return setError("이름을 두 글자 이상 입력해 주십시오.");
    if (!/^01\d{8,9}$/.test(digits)) return setError("휴대전화 번호를 확인해 주십시오. 예: 010-1234-5678");
    if (!agree) return setError("개인정보 수집·이용에 동의해 주십시오.");
    setError("");
    const who = `${maskName(name)} 님`;
    setDone(
      isConsult
        ? `${who}, ${lesson} 상담 신청을 받았습니다. 하루 안에 ${maskPhone(phone)}로 연락드립니다.`
        : session
          ? `${who}, ${when} ${lessonName} 체험레슨 신청을 받았습니다. 하루 안에 ${maskPhone(phone)}로 연락드려 확정합니다.`
          : `${who}, ${lessonName} 체험레슨 신청을 받았습니다. 하루 안에 ${maskPhone(phone)}로 연락드려 수업 시간을 정합니다.`,
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
              <h3 id="booking-title" ref={headingRef} tabIndex={-1} className="pt-1.5 text-[24px] font-bold tracking-[-0.02em] outline-none">
                {isConsult ? "상담 신청" : "체험레슨 신청"}
              </h3>
              <button type="button" onClick={onClose} aria-label="닫기" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[4px] hover:bg-[#ece6db]">
                <X size={22} aria-hidden />
              </button>
            </div>

            {!isConsult && (
              <dl className="mt-5 grid grid-cols-[72px_1fr] gap-y-2 border-y py-4 text-[15px]" style={{ borderColor: C.line }}>
                <dt style={{ color: C.muted }}>레슨</dt>
                <dd className="font-semibold">{lessonName}</dd>
                <dt style={{ color: C.muted }}>일시</dt>
                <dd>{when}</dd>
                {session && (
                  <>
                    <dt style={{ color: C.muted }}>강사</dt>
                    <dd>{session.teacher}</dd>
                    <dt style={{ color: C.muted }}>자리</dt>
                    <dd className="tabular-nums">
                      {seatText(session)} (정원 {CLASS_INFO[session.type].cap}명)
                    </dd>
                  </>
                )}
                <dt style={{ color: C.muted }}>체험비</dt>
                <dd>{fee} (등록 시 수강료에서 차감)</dd>
              </dl>
            )}

            {done ? (
              <div className="mt-6" role="status">
                <p className="text-[20px] font-bold tracking-[-0.02em]">신청 완료</p>
                <p className="mt-2">{done}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[4px] font-semibold"
                  style={{ background: C.indigo, color: C.onIndigo }}
                >
                  닫기
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="mt-6 space-y-4">
                <div>
                  <label htmlFor={ids.name} className="text-[15px] font-semibold">
                    이름
                  </label>
                  <input id={ids.name} className={field} style={{ borderColor: C.line }} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                </div>
                <div>
                  <label htmlFor={ids.phone} className="text-[15px] font-semibold">
                    휴대전화
                  </label>
                  <input
                    id={ids.phone}
                    className={field}
                    style={{ borderColor: C.line }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="010-0000-0000"
                  />
                </div>
                {isConsult && (
                  <div>
                    <label htmlFor={ids.lesson} className="text-[15px] font-semibold">
                      희망 레슨
                    </label>
                    <select id={ids.lesson} className={field} style={{ borderColor: C.line }} value={lesson} onChange={(e) => setLesson(e.target.value)}>
                      <option>체험레슨</option>
                      <option>1:1 개인레슨</option>
                      <option>2:1 듀엣레슨</option>
                      <option>그룹레슨</option>
                    </select>
                  </div>
                )}
                <div>
                  <label htmlFor={ids.part} className="text-[15px] font-semibold">
                    불편한 부위 (선택)
                  </label>
                  <select id={ids.part} className={field} style={{ borderColor: C.line }} value={part} onChange={(e) => setPart(e.target.value)}>
                    <option value="">선택 안 함</option>
                    <option>허리</option>
                    <option>목·어깨</option>
                    <option>골반</option>
                    <option>무릎</option>
                    <option>출산 후 회복</option>
                  </select>
                </div>
                <label className="flex items-start gap-2.5 text-[15px]">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#24365a]" />
                  <span>개인정보 수집·이용 동의 (수집 항목: 이름, 휴대전화 / 보관 기간: 상담 후 3개월)</span>
                </label>
                {error && (
                  <p role="alert" className="text-[15px] font-semibold" style={{ color: "#a33a2a" }}>
                    {error}
                  </p>
                )}
                <button type="submit" className="inline-flex h-12 w-full items-center justify-center rounded-[4px] font-semibold" style={{ background: C.indigo, color: C.onIndigo }}>
                  {isConsult ? "상담 신청" : "체험레슨 신청"}
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-4 pb-24 pt-12 md:px-6" style={{ background: C.indigo, color: C.onIndigo }}>
      <div className="mx-auto max-w-[1200px]">
        <Logo light />
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: C.onIndigoMuted }}>
          {[
            ["상호", STUDIO],
            ["대표자", "박ㅅ연"],
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
