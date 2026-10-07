"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronRight, List, Menu, MessageSquareText, Phone, RotateCcw, Search, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, fmtKo, useDemoToday } from "@/hooks/useDemoToday";

/* 필라테스 스튜디오 홈페이지 데모: 가상의 곰파트너 필라테스.
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

   하위 화면: 스튜디오 소개(스튜디오 소개, 강사진, 오시는 길), 프로그램(개인, 듀엣, 그룹레슨),
   시간표·수강료(그룹 시간표, 수강료 안내), 커뮤니티(공지사항, 이벤트). 새 주소 없이 nav 상태로 바꿔 그리고,
   첫 화면 구역(시간표, 레슨 비교, 수강료 표 등)은 bare 모드로 하위 화면에서 다시 쓴다.

   사진 출처(public/images/demo-pilates):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, teacher, mat, studio */

const IMG = "/images/demo-pilates";
const STUDIO = "곰파트너 필라테스";
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
  back: "허리 통증이 있다면 코어와 골반 안정화 동작부터 시작합니다.",
  shoulder: "굽은 어깨와 거북목 교정을 위한 상체 정렬 위주로 진행합니다.",
  knee: "누워서 하는 동작 위주로 무릎 부담을 줄여 진행합니다.",
  none: "",
};

type Rec = { type: ClassType; level?: Level; reasons: string[] };

function recommend(part: Part, exp: Exp, pref: Pref): Rec {
  const base = recommendBase(part, exp);
  const partReason = PART_REASON[part];
  if (pref === "solo" && base.type !== "private")
    return {
      type: "private",
      reasons: [partReason || "그날 컨디션에 맞춰 난이도를 조절해 드립니다."],
    };
  if (pref === "group" && (base.type === "private" || base.type === "duet"))
    return {
      type: "reformer",
      level: exp === "steady" ? "중급" : "입문",
      reasons: [partReason, "4:1 소수정예라 자세를 꼼꼼하게 잡아 드립니다."],
    };
  return base;
}

function recommendBase(part: Part, exp: Exp): Rec {
  const partReason = PART_REASON[part];
  if (part !== "none") {
    if (exp === "new")
      return {
        type: "private",
        reasons: [partReason, "통증이 있거나 운동이 처음이시라면 1:1 개인레슨을 권장합니다."],
      };
    if (exp === "sometimes")
      return {
        type: "duet",
        reasons: [partReason, "가성비 높은 비용으로 함께 운동할 수 있습니다."],
      };
    return {
      type: "reformer",
      level: "중급",
      reasons: [partReason, "운동 경험이 있다면 그룹레슨도 충분히 따라오실 수 있습니다."],
    };
  }
  if (exp === "new")
    return { type: "mat", level: "입문", reasons: ["매트에서 호흡과 기본 동작을 배우는 입문반"] };
  if (exp === "sometimes")
    return { type: "reformer", level: "입문", reasons: ["리포머에 익숙해지는 초급반"] };
  return { type: "reformer", level: "중급", reasons: ["동작을 쉬지 않고 이어 가는 중급반"] };
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

/* ---------- 하위 화면 메뉴 ---------- */

type ProgramId = "private" | "duet" | "group";
type Page = "home" | "about" | "teachers" | "location" | "program" | "schedule" | "price" | "notice" | "event";
type Target = { page: Page; program?: ProgramId };
type Go = (t: Target) => void;

const GROUPS: { id: string; label: string; items: (Target & { label: string })[] }[] = [
  {
    id: "studio",
    label: "스튜디오 소개",
    items: [
      { page: "about", label: "스튜디오 소개" },
      { page: "teachers", label: "강사진" },
      { page: "location", label: "오시는 길" },
    ],
  },
  {
    id: "program",
    label: "프로그램",
    items: [
      { page: "program", program: "private", label: "개인레슨" },
      { page: "program", program: "duet", label: "듀엣레슨" },
      { page: "program", program: "group", label: "그룹레슨" },
    ],
  },
  {
    id: "schedule",
    label: "시간표·수강료",
    items: [
      { page: "schedule", label: "그룹 시간표" },
      { page: "price", label: "수강료 안내" },
    ],
  },
  {
    id: "community",
    label: "커뮤니티",
    items: [
      { page: "notice", label: "공지사항" },
      { page: "event", label: "이벤트" },
    ],
  },
];

const NAV: (Target & { label: string })[] = [
  { page: "about", label: "스튜디오 소개" },
  { page: "teachers", label: "강사진" },
  { page: "program", program: "private", label: "프로그램" },
  { page: "schedule", label: "시간표" },
  { page: "price", label: "수강료" },
  { page: "notice", label: "커뮤니티" },
  { page: "location", label: "오시는 길" },
];

const groupOf = (p: Page) => GROUPS.find((g) => g.items.some((it) => it.page === p)) ?? null;
const sameTarget = (a: Target, b: Target) => a.page === b.page && (a.page !== "program" || a.program === b.program);
const navOn = (n: Target, cur: Target) => (n.page === "notice" ? cur.page === "notice" || cur.page === "event" : n.page === cur.page);

export function PilatesStudioDemo() {
  const minute = useNowMinute();
  const status = todayStatus(minute);
  const [nav, setNav] = useState<Target>({ page: "home" });
  const [booking, setBooking] = useState<BookingTarget | null>(null);
  const [highlight, setHighlight] = useState<Highlight>(null);
  const [teacher, setTeacher] = useState<"전체" | Teacher>("전체");

  const go: Go = (t) => {
    setNav(t.page === "program" ? { page: "program", program: t.program ?? "private" } : { page: t.page });
    window.scrollTo({ top: 0 });
  };

  // 사용법 가이드를 하위 화면에서 열면 첫 화면으로 돌아간다
  useEffect(() => {
    const f = () => {
      setNav({ page: "home" });
      setBooking(null);
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  /* 첫 화면에서는 시간표 구역으로 내려가고, 하위 화면에서는 그룹 시간표 화면으로 넘어간다 */
  const toSchedule = () => {
    if (nav.page === "home") document.getElementById("schedule")?.scrollIntoView({ behavior: "smooth", block: "start" });
    else go({ page: "schedule" });
  };

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

  const timetable = () => {
    setTeacher("전체");
    setHighlight(null);
    toSchedule();
  };

  const consult = () => setBooking("consult");

  const schedule = (
    <Schedule
      highlight={highlight}
      onClearHighlight={() => setHighlight(null)}
      teacher={teacher}
      onTeacher={setTeacher}
      onPick={setBooking}
      bare={nav.page !== "home"}
    />
  );

  let body: React.ReactNode = null;
  switch (nav.page) {
    case "about":
      body = <AboutPage onConsult={consult} />;
      break;
    case "teachers":
      body = <TeachersPage onShow={showTeacher} />;
      break;
    case "location":
      body = <Location status={status} bare />;
      break;
    case "program":
      body = <ProgramPage key={nav.program} program={nav.program ?? "private"} onSchedule={goSchedule} onBook={setBooking} onConsult={consult} onTimetable={timetable} />;
      break;
    case "schedule":
      body = schedule;
      break;
    case "price":
      body = <PricePage onConsult={consult} />;
      break;
    case "notice":
      body = <Board key="notice" items={NOTICES} label="공지사항" />;
      break;
    case "event":
      body = <Board key="event" items={EVENTS} label="이벤트" />;
      break;
  }

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.paper, color: C.ink }}>
      <Header nav={nav} go={go} onConsult={consult} />
      <main key={`${nav.page}-${nav.program ?? ""}`} className="soft-in">
        {nav.page === "home" ? (
          <>
            <Intro onConsult={consult} />
            {schedule}
            <Program onSchedule={goSchedule} onBook={setBooking} />
            <Pricing />
            <Teachers onShow={showTeacher} />
            <About />
            <Location status={status} />
          </>
        ) : (
          <SubPage nav={nav} go={go}>
            {body}
          </SubPage>
        )}
      </main>
      <Footer />
      <ConsultTab onConsult={consult} />
      <BookingDrawer target={booking} onClose={() => setBooking(null)} />
    </div>
  );
}

/* ---------- 로고, 머리글 ---------- */

function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.svg" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-[19px] font-bold tracking-[-0.01em]">곰파트너</span>
        <span className="text-[12px] font-semibold opacity-80">필라테스</span>
      </span>
    </span>
  );
}

function Header({ nav, go, onConsult }: { nav: Target; go: Go; onConsult: () => void }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const move = (t: Target) => {
    setOpen(false);
    go(t);
  };

  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: C.paper, borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <button type="button" onClick={() => move({ page: "home" })} aria-label={`${STUDIO} 처음으로`} className="shrink-0">
          <Logo />
        </button>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-5 text-[15px] xl:gap-6">
            {NAV.map((n) => {
              const on = navOn(n, nav);
              return (
                <li key={n.label}>
                  <button
                    type="button"
                    onClick={() => move(n)}
                    aria-current={on ? "page" : undefined}
                    className={`flex h-16 items-center transition-colors hover:text-[#24365a] ${on ? "font-semibold" : ""}`}
                    style={on ? { color: C.indigo, boxShadow: `inset 0 -2px 0 ${C.indigo}` } : { color: C.muted }}
                  >
                    {n.label}
                  </button>
                </li>
              );
            })}
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
            <div className="grid gap-x-6 px-4 pb-3 pt-2 sm:grid-cols-2">
              {GROUPS.map((g) => (
                <div key={g.id} className="py-2">
                  <p className="text-[13px] font-semibold" style={{ color: C.clayDeep }}>
                    {g.label}
                  </p>
                  <ul className="flex flex-wrap gap-x-5">
                    {g.items.map((it) => {
                      const on = sameTarget(it, nav);
                      return (
                        <li key={it.label}>
                          <button
                            type="button"
                            onClick={() => move(it)}
                            aria-current={on ? "page" : undefined}
                            className={`flex h-11 items-center text-[17px] ${on ? "font-semibold" : ""}`}
                            style={on ? { color: C.indigo } : undefined}
                          >
                            {it.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t px-4" style={{ borderColor: C.line }}>
              <a href={`tel:${TEL}`} className="flex h-12 items-center gap-2 text-[17px] font-semibold" style={{ color: C.indigo }}>
                <Phone size={17} aria-hidden />
                {TEL}
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- 하위 화면 틀: 상단 띠, 현재 위치, 하위 메뉴 탭 ---------- */

function SubPage({ nav, go, children }: { nav: Target; go: Go; children: React.ReactNode }) {
  const group = groupOf(nav.page)!;
  const label = group.items.find((it) => sameTarget(it, nav))?.label ?? group.label;
  const headRef = useRef<HTMLHeadingElement>(null);
  const key = `${nav.page}:${nav.program ?? ""}`;

  useEffect(() => {
    headRef.current?.focus({ preventScroll: true });
  }, [key]);

  return (
    <>
      <div className="relative h-[120px] md:h-[180px]">
        <Image src={`${IMG}/studio.jpg`} alt="" fill sizes="100vw" className="object-cover" style={{ objectPosition: "center 55%" }} />
        <div className="absolute inset-0" style={{ background: "rgba(36,54,90,0.8)" }} aria-hidden />
        <div className="absolute inset-0 flex items-center px-4 md:px-6">
          <p className="mx-auto w-full max-w-[1200px] text-[26px] font-bold tracking-[-0.02em] md:text-[36px]" style={{ color: C.onIndigo }}>
            {group.label}
          </p>
        </div>
      </div>

      <div className="border-b px-4 md:px-6" style={{ borderColor: C.line, background: C.card }}>
        <div className="mx-auto flex max-w-[1200px] flex-col md:flex-row md:items-center md:justify-between">
          <nav aria-label={`${group.label} 하위 메뉴`} className="-mx-4 order-2 overflow-x-auto px-4 md:order-1 md:mx-0 md:px-0">
            <ul className="flex whitespace-nowrap">
              {group.items.map((it) => {
                const on = sameTarget(it, nav);
                return (
                  <li key={it.label} className="flex">
                    <button
                      type="button"
                      onClick={() => go(it)}
                      aria-current={on ? "page" : undefined}
                      className={`flex h-12 items-center px-3.5 text-[15px] transition-colors md:h-14 md:px-5 md:text-[16px] ${on ? "font-bold" : "hover:text-[#24365a]"}`}
                      style={on ? { color: C.indigo, boxShadow: `inset 0 -3px 0 ${C.indigo}` } : { color: C.muted }}
                    >
                      {it.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <nav aria-label="현재 위치" className="order-1 border-b md:order-2 md:border-b-0" style={{ borderColor: C.line }}>
            <ol className="flex h-11 items-center gap-1.5 text-[13px] md:text-[14px]" style={{ color: C.muted }}>
              <li>
                <button type="button" onClick={() => go({ page: "home" })} className="inline-flex h-11 items-center hover:underline">
                  홈
                </button>
              </li>
              <li aria-hidden>
                <ChevronRight size={14} />
              </li>
              <li>{group.label}</li>
              {label !== group.label && (
                <>
                  <li aria-hidden>
                    <ChevronRight size={14} />
                  </li>
                  <li aria-current="page" className="font-semibold" style={{ color: C.indigo }}>
                    {label}
                  </li>
                </>
              )}
            </ol>
          </nav>
        </div>
      </div>

      <div className="px-4 pb-20 pt-10 md:px-6 md:pb-28 md:pt-14">
        <div className="mx-auto max-w-[1200px]">
          <h1 ref={headRef} tabIndex={-1} className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em] outline-none md:text-[36px]">
            {label}
          </h1>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </>
  );
}

function SubTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="border-b-2 pb-2 text-[22px] font-bold tracking-[-0.02em] md:text-[24px]" style={{ borderColor: C.indigo }}>
      {children}
    </h2>
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
              □□역 3번 출구 도보 3분 · 건물 주차 2시간 무료
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

/** hidden: 하위 화면에서는 화면 제목(h1)이 같은 이름이라 읽기 도구에만 남긴다 */
function SectionTitle({ id, children, hidden = false }: { id: string; children: React.ReactNode; hidden?: boolean }) {
  return (
    <h2 id={id} className={hidden ? "sr-only" : "text-[26px] font-bold leading-[1.35] tracking-[-0.02em] md:text-[32px]"}>
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
  bare = false,
}: {
  highlight: Highlight;
  onClearHighlight: () => void;
  teacher: "전체" | Teacher;
  onTeacher: (t: "전체" | Teacher) => void;
  onPick: (s: Session) => void;
  bare?: boolean;
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
    <section
      aria-labelledby="schedule-title"
      id="schedule"
      className={bare ? "scroll-mt-16" : "scroll-mt-16 px-4 py-10 md:px-6 md:py-14"}
      style={bare ? undefined : { background: C.sand }}
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle id="schedule-title" hidden={bare}>
            그룹 시간표
          </SectionTitle>
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
          <ul key={mobileDay} className="soft-in">
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

function Program({
  onSchedule,
  onBook,
  bare = false,
}: {
  onSchedule: (t: ClassType, level?: Level) => void;
  onBook: (t: "private" | "duet") => void;
  /** 프로그램 하위 화면 아래에 레슨 비교로 넣을 때 */
  bare?: boolean;
}) {
  const [finder, setFinder] = useState(false);

  return (
    <section aria-labelledby="program-title" id="program" className={bare ? "scroll-mt-16" : "scroll-mt-16 px-4 py-14 md:px-6 md:py-20"}>
      <div className="mx-auto max-w-[1200px]">
        <div className={`flex flex-wrap items-end justify-between gap-4 ${bare ? "border-b-2 pb-2" : ""}`} style={bare ? { borderColor: C.indigo } : undefined}>
          {bare ? (
            <h2 id="program-title" className="text-[22px] font-bold tracking-[-0.02em] md:text-[24px]">
              레슨 비교
            </h2>
          ) : (
            <SectionTitle id="program-title">프로그램 안내</SectionTitle>
          )}
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
        <div key={step} className="soft-in">
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
        </div>
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

function Pricing({ bare = false }: { bare?: boolean }) {
  return (
    <section
      aria-labelledby="price-title"
      id="price"
      className={bare ? "scroll-mt-16" : "scroll-mt-16 px-4 py-14 md:px-6 md:py-20"}
      style={bare ? undefined : { background: C.sand }}
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle id="price-title" hidden={bare}>
          수강료 안내
        </SectionTitle>
        <div className={`${bare ? "" : "mt-6 "}overflow-x-auto`}>
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

function About({ bare = false }: { bare?: boolean }) {
  return (
    <section
      aria-labelledby="about-title"
      id="about"
      className={bare ? "scroll-mt-16" : "scroll-mt-16 px-4 py-14 md:px-6 md:py-20"}
      style={bare ? undefined : { background: C.sand }}
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle id="about-title" hidden={bare}>
          스튜디오 소개
        </SectionTitle>
        <p className={`${bare ? "" : "mt-3 "}max-w-[720px]`} style={{ color: C.muted }}>
          첫 수업은 체형 상담을 같이 하는 50분 체험레슨이에요.
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

function Location({ status, bare = false }: { status: Status; bare?: boolean }) {
  return (
    <section aria-labelledby="location-title" id="location" className={bare ? "scroll-mt-16" : "scroll-mt-16 px-4 py-14 md:px-6 md:py-20"}>
      <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-2 md:gap-16">
        <div className="min-w-0">
          <SectionTitle id="location-title" hidden={bare}>
            오시는 길
          </SectionTitle>
          <dl className={`${bare ? "" : "mt-5 "}grid grid-cols-[64px_1fr] gap-y-2.5 text-[15px] md:text-[16px]`}>
            <dt style={{ color: C.muted }}>주소</dt>
            <dd>{ADDRESS}</dd>
            <dt style={{ color: C.muted }}>지하철</dt>
            <dd>□□역 3번 출구 도보 3분</dd>
            {bare && (
              <>
                <dt style={{ color: C.muted }}>버스</dt>
                <dd>□□역 정류장 하차 후 도보 3분 (간선 000, 지선 0000)</dd>
              </>
            )}
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

/* ---------- 하위 화면: 스튜디오 소개 ---------- */

const RULES: [string, string][] = [
  ["예약", "그룹레슨 100% 예약제 (예약 앱)"],
  ["취소", "수업 3시간 전까지, 이후 취소 및 노쇼 시 1회 차감"],
  ["입실", "수업 시작 10분 전부터"],
  ["지각", "수업 시작 10분 이후 입실 불가"],
  ["준비물", "미끄럼 방지 양말 (수건, 운동복은 무료 대여)"],
  ["일시정지", "유효기간 안에서 1회, 최대 2주"],
];

const TRIAL_STEPS = ["상담 신청", "체형 상담", "체험레슨 50분", "수강 등록"];

function AboutPage({ onConsult }: { onConsult: () => void }) {
  return (
    <div className="space-y-14">
      <About bare />

      <section aria-labelledby="trial-title">
        <SubTitle id="trial-title">체험레슨 안내</SubTitle>
        <ol className="mt-5 grid gap-3 sm:grid-cols-4">
          {TRIAL_STEPS.map((t, i) => (
            <li key={t} className="flex items-center gap-3 rounded-[4px] border px-4 py-3.5" style={{ borderColor: C.line, background: C.card }}>
              <span className="text-[20px] font-bold tabular-nums" style={{ color: C.clayDeep }}>
                {i + 1}
              </span>
              <span className="font-semibold">{t}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
          체험레슨: 1:1 개인레슨 30,000원, 그룹레슨 20,000원 (등록 시 수강료에서 차감)
        </p>
        <button
          type="button"
          onClick={onConsult}
          className="mt-5 inline-flex h-12 items-center rounded-[4px] px-6 font-semibold transition-colors hover:bg-[#1a2846]"
          style={{ background: C.indigo, color: C.onIndigo }}
        >
          상담 신청
        </button>
      </section>

      <section aria-labelledby="rules-title">
        <SubTitle id="rules-title">이용 안내</SubTitle>
        <dl className="text-[15px] md:text-[16px]">
          {RULES.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[84px_1fr] gap-3 border-b py-3 md:grid-cols-[140px_1fr]" style={{ borderColor: C.line }}>
              <dt style={{ color: C.muted }}>{k}</dt>
              <dd className="min-w-0">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

/* ---------- 하위 화면: 강사진 ---------- */

function TeachersPage({ onShow }: { onShow: (t: Teacher) => void }) {
  return (
    <div>
      <p style={{ color: C.muted }}>총 {TEACHER_INFO.length}명의 강사진이 함께합니다.</p>
      <ul className="mt-6 border-t-2" style={{ borderColor: C.indigo }}>
        {TEACHER_INFO.map((t) => {
          const classes = SESSIONS.filter((s) => s.teacher === t.name);
          return (
            <li key={t.name} className="grid gap-6 border-b py-8 sm:grid-cols-[180px_1fr] md:grid-cols-[220px_1fr] md:gap-10" style={{ borderColor: C.line }}>
              <div className="relative aspect-[3/4] w-[160px] overflow-hidden rounded-[4px] sm:w-full" style={{ background: C.sand }}>
                <Image src={t.photo} alt={`${t.name} ${t.role}`} fill sizes="220px" className="object-cover" style={{ objectPosition: "50% 25%" }} />
              </div>
              <div className="min-w-0">
                <h2 className="text-[24px] font-bold tracking-[-0.01em]">
                  {t.name}
                  <span className="ml-2 text-[16px] font-medium" style={{ color: C.clayDeep }}>
                    {t.role}
                  </span>
                </h2>
                <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                  {t.lessons}
                </p>

                <h3 className="mt-5 text-[15px] font-semibold" style={{ color: C.indigo }}>
                  경력
                </h3>
                <ul className="mt-1.5 space-y-1 text-[15px]">
                  {t.career.map((c) => (
                    <li key={c} className="flex gap-2.5">
                      <span className="mt-[0.7em] inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: C.indigo }} aria-hidden />
                      {c}
                    </li>
                  ))}
                </ul>

                <h3 className="mt-5 text-[15px] font-semibold" style={{ color: C.indigo }}>
                  그룹 수업 ({classes.length}개)
                </h3>
                <ul className="mt-1.5 grid gap-x-6 gap-y-1 text-[15px] tabular-nums sm:grid-cols-2 lg:grid-cols-3">
                  {classes.map((s) => (
                    <li key={s.id}>
                      <span className="font-semibold">
                        {DAY_NAMES[s.day]} {s.time}
                      </span>{" "}
                      <span style={{ color: C.muted }}>
                        {CLASS_INFO[s.type].name} {s.level}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => onShow(t.name)}
                  className="mt-5 inline-flex h-10 items-center rounded-[4px] border px-4 text-[14px] font-semibold transition-colors hover:bg-[#ece6db]"
                  style={{ borderColor: C.line, color: C.indigo }}
                  aria-label={`${t.name} 강사 그룹 시간표 보기`}
                >
                  강사별 시간표
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- 하위 화면: 프로그램 (개인, 듀엣, 그룹) ---------- */

const PROGRAM_DETAIL: Record<ProgramId, { img: string; alt: string; lines: string[] }> = {
  private: {
    img: "studio",
    alt: "리포머 기구가 놓인 스튜디오",
    lines: ["개인의 운동목적에 따라 레슨이 가능하므로 단기간에 최대의 운동효과를 가져올 수 있습니다.", "척추관련 질환이 있으시다면, 개인레슨을 받으시길 권장합니다."],
  },
  duet: {
    img: "hero",
    alt: "한지 창으로 빛이 드는 리포머실",
    lines: ["친구, 가족, 파트너와 함께하는 소규모 레슨", "가성비 높은 비용으로 함께 운동할 수 있습니다."],
  },
  group: {
    img: "mat",
    alt: "매트 여섯 장이 깔린 매트실",
    lines: ["리포머 4:1, 매트 6:1 소수정예 그룹레슨", "그룹레슨은 100% 예약제로 운영합니다."],
  },
};

const GROUP_CLASSES: { type: "reformer" | "mat"; level: Level; desc: string }[] = [
  { type: "reformer", level: "입문", desc: "리포머에 익숙해지는 초급반" },
  { type: "reformer", level: "중급", desc: "동작을 쉬지 않고 이어 가는 중급반" },
  { type: "mat", level: "입문", desc: "매트에서 호흡과 기본 동작을 배우는 입문반" },
  { type: "mat", level: "중급", desc: "" },
];

function ProgramPage({
  program,
  onSchedule,
  onBook,
  onConsult,
  onTimetable,
}: {
  program: ProgramId;
  onSchedule: (t: ClassType, level?: Level) => void;
  onBook: (t: "private" | "duet") => void;
  onConsult: () => void;
  onTimetable: () => void;
}) {
  const p = PROGRAMS.find((x) => x.id === program)!;
  const d = PROGRAM_DETAIL[program];
  const btn = "inline-flex h-12 items-center rounded-[4px] px-6 font-semibold transition-colors";

  return (
    <div className="space-y-14">
      <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-[6px]">
          <Image src={`${IMG}/${d.img}.jpg`} alt={d.alt} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />
        </div>
        <div className="min-w-0">
          <h2 className="text-[24px] font-bold tracking-[-0.02em] md:text-[28px]">{p.name}</h2>
          <div className="mt-3 space-y-1">
            {d.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
          <dl className="mt-6 border-t-2 text-[15px] md:text-[16px]" style={{ borderColor: C.indigo }}>
            {PROGRAM_ROWS.map((r) => (
              <div key={r} className="grid grid-cols-[84px_1fr] gap-3 border-b py-2.5" style={{ borderColor: C.line }}>
                <dt style={{ color: C.muted }}>{r}</dt>
                <dd className={`min-w-0 ${r === "회당 금액" ? "font-semibold" : ""}`} style={r === "회당 금액" ? { color: C.indigo } : undefined}>
                  {p.rows[r]}
                </dd>
              </div>
            ))}
            <div className="grid grid-cols-[84px_1fr] gap-3 border-b py-2.5" style={{ borderColor: C.line }}>
              <dt style={{ color: C.muted }}>사용 기구</dt>
              <dd className="min-w-0">{program === "group" ? "리포머, 매트" : "리포머, 체어, 캐딜락, 바렐"}</dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            {program === "group" ? (
              <>
                <button type="button" onClick={onTimetable} className={`${btn} hover:bg-[#1a2846]`} style={{ background: C.indigo, color: C.onIndigo }}>
                  그룹 시간표
                </button>
                <button type="button" onClick={onConsult} className={`${btn} border hover:bg-[#ece6db]`} style={{ borderColor: C.indigo, color: C.indigo }}>
                  상담 신청
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => onBook(program)} className={`${btn} hover:bg-[#1a2846]`} style={{ background: C.indigo, color: C.onIndigo }}>
                  체험레슨 신청
                </button>
                <button type="button" onClick={onConsult} className={`${btn} border hover:bg-[#ece6db]`} style={{ borderColor: C.indigo, color: C.indigo }}>
                  상담 신청
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {program === "group" ? (
        <section aria-labelledby="group-classes-title">
          <SubTitle id="group-classes-title">수업 구성</SubTitle>
          <ul>
            {GROUP_CLASSES.map((g) => {
              const count = SESSIONS.filter((s) => s.type === g.type && s.level === g.level).length;
              return (
                <li key={`${g.type}-${g.level}`} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b py-4" style={{ borderColor: C.line }}>
                  <div className="min-w-0">
                    <p className="text-[17px] font-bold">
                      {CLASS_INFO[g.type].name} {g.level}
                      <span className="ml-2 text-[14px] font-medium" style={{ color: C.muted }}>
                        정원 {CLASS_INFO[g.type].cap}명, 주 {count}회
                      </span>
                    </p>
                    {g.desc && (
                      <p className="text-[15px]" style={{ color: C.muted }}>
                        {g.desc}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onSchedule(g.type, g.level)}
                    className="inline-flex h-10 items-center rounded-[4px] border px-4 text-[14px] font-semibold transition-colors hover:bg-[#ece6db]"
                    style={{ borderColor: C.line, color: C.indigo }}
                    aria-label={`${CLASS_INFO[g.type].name} ${g.level} 시간표 보기`}
                  >
                    시간표 보기
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section aria-labelledby="program-fee-title">
          <SubTitle id="program-fee-title">수강료</SubTitle>
          <table className="w-full max-w-[720px] border-collapse text-left text-[15px] md:text-[16px]">
            <caption className="sr-only">{p.name} 횟수별 수강료</caption>
            <thead>
              <tr className="border-b" style={{ borderColor: C.line, color: C.muted }}>
                <th scope="col" className="py-2.5 font-semibold">
                  횟수
                </th>
                <th scope="col" className="py-2.5 text-right font-semibold">
                  수강료{program === "duet" ? " (1인)" : ""}
                </th>
                <th scope="col" className="py-2.5 text-right font-semibold">
                  회당
                </th>
                <th scope="col" className="py-2.5 text-right font-semibold">
                  유효기간
                </th>
              </tr>
            </thead>
            <tbody>
              {COUNTS.map((n) => (
                <tr key={n} className="border-b" style={{ borderColor: C.line }}>
                  <th scope="row" className="py-3 font-semibold">
                    {n}회
                  </th>
                  <td className="py-3 text-right font-semibold tabular-nums" style={{ color: C.indigo }}>
                    {won(PRICE[program][n])}
                  </td>
                  <td className="py-3 text-right tabular-nums">{won(Math.round(PRICE[program][n] / n))}</td>
                  <td className="py-3 text-right">{VALID_MONTHS[n]}개월</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <Program onSchedule={onSchedule} onBook={onBook} bare />
    </div>
  );
}

/* ---------- 하위 화면: 수강료 안내 ---------- */

function PricePage({ onConsult }: { onConsult: () => void }) {
  return (
    <div className="space-y-14">
      <Pricing bare />
      <section aria-labelledby="pay-title">
        <SubTitle id="pay-title">결제·환불 안내</SubTitle>
        <ul className="mt-4 space-y-2">
          {[
            "카드/현금 동일가격입니다.",
            "수강료는 등록 횟수와 기간에 따라 달라지므로 방문상담 시 확인해 주시기 바랍니다.",
            "수강료 환불은 「체육시설의 설치·이용에 관한 법률」 기준에 따릅니다.",
          ].map((t) => (
            <li key={t} className="flex gap-2.5">
              <span className="mt-[0.7em] inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: C.indigo }} aria-hidden />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onConsult}
          className="mt-6 inline-flex h-12 items-center rounded-[4px] px-6 font-semibold transition-colors hover:bg-[#1a2846]"
          style={{ background: C.indigo, color: C.onIndigo }}
        >
          상담 신청
        </button>
      </section>
    </div>
  );
}

/* ---------- 하위 화면: 공지사항, 이벤트 ---------- */

interface Post {
  no: number;
  title: string;
  /** 작성일이 오늘에서 며칠 전인지 */
  ago: number;
  /** 함수면 작성일 기준으로 날짜를 넣어 만든다 */
  body: string[] | ((t: Date) => string[]);
  /** 이벤트만: 기간(오늘 기준 며칠 전 ~ 며칠 전, 음수는 뒤). 종료 여부는 끝 날짜로 계산 */
  period?: [number, number];
}

const NOTICES: Post[] = [
  {
    no: 7,
    title: "그룹 시간표 변경 안내",
    ago: 12,
    body: ["화요일 12:30 그룹 수업은 쉽니다.", "목요일 19:00 그룹 리포머는 중급반으로 바뀝니다."],
  },
  {
    no: 6,
    title: "명절 연휴 휴무 안내",
    ago: 22,
    body: (t) => [`${fmtKo(daysAgo(t, -9))}부터 ${fmtKo(daysAgo(t, -11))}까지 휴무입니다.`, "휴무 기간은 수강권 유효기간에서 제외됩니다."],
  },
  {
    no: 5,
    title: "예약 앱 이용 안내",
    ago: 67,
    body: ["그룹레슨은 예약 앱에서 예약합니다.", "수업 3시간 전까지 취소할 수 있습니다.", "이후 취소 및 노쇼 시 1회 차감됩니다."],
  },
  {
    no: 4,
    title: "주차 등록 안내",
    ago: 98,
    body: ["건물 지하 주차장 2시간 무료입니다.", "안내 데스크에서 차량 번호를 등록해 주십시오."],
  },
  {
    no: 3,
    title: "샤워실 이용 안내",
    ago: 119,
    body: ["샤워실은 수업 전후로 이용할 수 있습니다.", "수건과 운동복은 무료로 대여합니다."],
  },
  {
    no: 2,
    title: "개인 사물함 배정 안내",
    ago: 140,
    body: ["10회 이상 등록 회원께 개인 사물함을 배정합니다.", "사물함 번호는 안내 데스크에 문의해 주십시오."],
  },
  {
    no: 1,
    title: "곰파트너 필라테스 오픈 안내",
    ago: 219,
    body: ["□□역 3번 출구 □□빌딩 2층에 문을 열었습니다.", "평일 07:00 ~ 22:00, 토요일 09:00 ~ 15:00 운영합니다."],
  },
];

const EVENTS: Post[] = [
  {
    no: 4,
    title: "그룹/개인레슨 횟수추가 제공 이벤트",
    ago: 6,
    period: [6, -24],
    body: ["기간 중 20회 등록 시 2회, 30회 등록 시 3회를 추가로 드립니다.", "1:1 개인레슨, 2:1 듀엣레슨, 그룹레슨 모두 해당됩니다."],
  },
  {
    no: 3,
    title: "듀엣레슨 함께 등록 이벤트",
    ago: 6,
    period: [6, -54],
    body: ["두 분이 함께 2:1 듀엣레슨 20회 이상 등록 시 1인 수강료 5% 할인"],
  },
  {
    no: 2,
    title: "해피타임 무료기구체험",
    ago: 36,
    period: [36, 7],
    body: ["평일 14:00 ~ 16:00 리포머 기구를 무료로 체험할 수 있습니다.", "방문 전 전화로 예약해 주십시오."],
  },
  {
    no: 1,
    title: "체험레슨 할인",
    ago: 98,
    period: [98, 37],
    body: ["체험레슨 1:1 개인레슨 20,000원, 그룹레슨 10,000원"],
  },
];

function Board({ items, label }: { items: Post[]; label: string }) {
  const today = useDemoToday();
  const day = (n: number) => fmtDot(daysAgo(today, n));
  const periodText = (p: Post) => (p.period ? `${day(p.period[0])} ~ ${day(p.period[1])}` : "");
  const ended = (p: Post) => !!p.period && p.period[1] > 0;
  const [open, setOpen] = useState<number | null>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const isEvent = items.some((p) => p.period);
  const idx = items.findIndex((p) => p.no === open);
  const item = idx >= 0 ? items[idx] : null;

  useEffect(() => {
    if (open !== null) headRef.current?.focus();
  }, [open]);

  if (item) {
    const prev = items[idx + 1];
    const next = items[idx - 1];
    return (
      <article key={item.no} aria-labelledby="post-title" className="soft-in">
        <div className="border-b border-t-2 py-4" style={{ borderTopColor: C.indigo, borderBottomColor: C.line }}>
          <h2 id="post-title" ref={headRef} tabIndex={-1} className="text-[21px] font-bold leading-[1.4] tracking-[-0.02em] outline-none md:text-[24px]">
            {item.title}
          </h2>
          <p className="mt-1 text-[14px] tabular-nums" style={{ color: C.muted }}>
            {item.period ? `기간 ${periodText(item)}` : `작성일 ${day(item.ago)}`}
            {item.period && <span className="ml-3 font-semibold">{ended(item) ? "종료" : "진행중"}</span>}
          </p>
        </div>
        <div className="space-y-1 py-8">
          {(typeof item.body === "function" ? item.body(daysAgo(today, item.ago)) : item.body).map((b) => (
            <p key={b}>{b}</p>
          ))}
        </div>
        <dl className="border-y text-[15px]" style={{ borderColor: C.line }}>
          {(
            [
              ["이전글", prev],
              ["다음글", next],
            ] as const
          ).map(([k, n], i) => (
            <div key={k} className={`grid grid-cols-[64px_1fr] items-center gap-3 ${i ? "border-t" : ""}`} style={{ borderColor: C.line }}>
              <dt className="py-3" style={{ color: C.muted }}>
                {k}
              </dt>
              <dd className="min-w-0">
                {n ? (
                  <button type="button" onClick={() => setOpen(n.no)} className="block w-full truncate py-3 text-left hover:underline">
                    {n.title}
                  </button>
                ) : (
                  <span className="block py-3" style={{ color: C.muted }}>
                    없음
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={() => setOpen(null)}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-[4px] border px-5 text-[15px] font-semibold transition-colors hover:bg-[#ece6db]"
          style={{ borderColor: C.line }}
        >
          <List size={16} aria-hidden />
          목록
        </button>
      </article>
    );
  }

  return (
    <section aria-label={`${label} 목록`} className="soft-in">
      <p className="text-[15px]" style={{ color: C.muted }}>
        전체 <b className="font-semibold" style={{ color: C.ink }}>{items.length}</b>건
      </p>
      <div
        className="mt-3 hidden grid-cols-[64px_1fr_140px] border-b border-t-2 py-3 text-center text-[15px] font-semibold sm:grid"
        style={{ borderTopColor: C.indigo, borderBottomColor: C.line }}
        aria-hidden
      >
        <span>번호</span>
        <span>제목</span>
        <span>{isEvent ? "상태" : "작성일"}</span>
      </div>
      <ul className="border-t-2 sm:border-t-0" style={{ borderColor: C.indigo }}>
        {items.map((p) => (
          <li key={p.no} className="border-b" style={{ borderColor: C.line }}>
            <button
              type="button"
              onClick={() => setOpen(p.no)}
              className="grid w-full gap-1 px-1 py-4 text-left transition-colors hover:bg-[#ece6db]/60 sm:grid-cols-[64px_1fr_140px] sm:items-center sm:gap-0 sm:px-0"
            >
              <span className="hidden text-center text-[15px] tabular-nums sm:block" style={{ color: C.muted }}>
                {p.no}
              </span>
              <span className="min-w-0">
                <span className="block font-medium">{p.title}</span>
                {p.period && (
                  <span className="block text-[14px] tabular-nums" style={{ color: C.muted }}>
                    {periodText(p)}
                  </span>
                )}
              </span>
              <span className="text-[14px] tabular-nums sm:text-center" style={p.period && !ended(p) ? { color: C.indigo, fontWeight: 600 } : { color: C.muted }}>
                {p.period ? (ended(p) ? "종료" : "진행중") : day(p.ago)}
              </span>
            </button>
          </li>
        ))}
      </ul>
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
    if (name.trim().length < 2) return setError("이름을 입력해 주십시오.");
    if (!/^01\d{8,9}$/.test(digits)) return setError("휴대전화 번호를 확인해 주십시오. 예: 010-1234-5678");
    if (!agree) return setError("개인정보 수집·이용에 동의해 주십시오.");
    setError("");
    const who = `${maskName(name)} 님`;
    setDone(
      isConsult
        ? `${who}, ${lesson} 상담 신청이 접수되었습니다. 1일 이내 ${maskPhone(phone)}로 연락드립니다.`
        : session
          ? `${who}, ${when} ${lessonName} 체험레슨 신청이 접수되었습니다. 1일 이내 ${maskPhone(phone)}로 연락드려 확정해 드립니다.`
          : `${who}, ${lessonName} 체험레슨 신청이 접수되었습니다. 1일 이내 ${maskPhone(phone)}로 연락드려 수업 시간을 안내해 드립니다.`,
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
        <Logo />
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: C.onIndigoMuted }}>
          {[
            ["상호", "ㅅㄱ 필라테스"],
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
