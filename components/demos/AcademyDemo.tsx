"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Bus, CalendarCheck, Check, ChevronDown, ChevronLeft, ChevronRight, Menu, Phone, RotateCcw, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtDot, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 학원 홈페이지 데모: 가상의 곰파트너 수학·영어학원(초4~중3 보습학원).
   학원명, 강사, 주소, 전화번호, 등록번호, 교습비, 학교명, 정류장은 모두 가상이다.

   뼈대: 반 찾기형. 실제 학원 사이트(수학의아침, 탑플수학, 청담어학원, 시대인재, 대형 입시학원)의
   메뉴 이름을 따랐다. 학원 소개, 강사 소개, 반 편성·시간표, 교습비 안내, 레벨테스트 예약,
   차량 운행, 공지사항. 하위 화면 없이 한 페이지에 구역을 쌓고 머리글 메뉴는 구역으로 내려간다.
   첫 화면은 사진 한 장 위에 학원명, 바로 아래에 사진에 걸친 반 찾기 문장이 놓인다.

   상호작용
   1. 반 찾기: "중2 학생이고 수학은 학교 시험 70점대, 주 3회" 문장 안의 칸을 고르면
      맞는 반이 학년별 시간표에서 형광펜으로 칠해지고 남은 자리가 보인다.
   2. 레벨테스트 예약: 날짜, 시간, 학생 정보를 거쳐 확인 화면과 보호자에게 가는 문자 미리보기.
   3. 교습비: 교습비 등 게시 표와 계산(주 횟수, 과목 추가, 차량 이용). 교재비는 별도.
   4. 차량 운행: 정류장을 고르면 찾은 반 기준으로 등원 탑승 시간과 하원 도착 시간이 나온다.
   5. 공지사항 펼쳐 보기.

   사진(public/images/demo-academy): hero, classroom, study, teacher1, teacher2 */

const IMG = "/images/demo-academy";
const ACADEMY = "곰파트너";
const TEL = "02-000-0000";
const ADDRESS = "ㅁㄹ시 ㅎㄷ로 120 ㅁㄹ빌딩 3층";

const C = {
  paper: "#f6f5f0",
  card: "#ffffff",
  ink: "#1a2420",
  muted: "#4f5953",
  board: "#1e3b31",
  boardDeep: "#142a22",
  boardSoft: "#e3ece6",
  onBoard: "#eef3ef",
  onBoardMuted: "#b8c9be",
  marker: "#ffe15c",
  line: "#d6dad2",
  red: "#a3271f",
};

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- 반, 시간표 ---------- */

type Grade = "초4" | "초5" | "초6" | "중1" | "중2" | "중3";
type Subject = "수학" | "영어";
type Level = "심화반" | "정규반" | "기초반";
type Score = "90점 이상" | "80점대" | "70점대" | "60점대 이하" | "아직 몰라요";
type Times = 2 | 3;
type Band = "초등" | "중등";

const GRADES: Grade[] = ["초4", "초5", "초6", "중1", "중2", "중3"];
const SUBJECTS: Subject[] = ["수학", "영어"];
const LEVELS: Level[] = ["심화반", "정규반", "기초반"];
const SCORES: Score[] = ["90점 이상", "80점대", "70점대", "60점대 이하", "아직 몰라요"];
const DAY = ["일", "월", "화", "수", "목", "금", "토"];
const WEEK = [1, 2, 3, 4, 5, 6];

const bandOf = (g: Grade): Band => (g.startsWith("초") ? "초등" : "중등");
const gradeLabel = (g: Grade) => (g.startsWith("초") ? `초등학교 ${g.slice(1)}학년` : `중학교 ${g.slice(1)}학년`);

/* 수학은 월·수·금, 영어는 화·목·토. 주 2회는 앞의 두 요일만 나온다. */
const SUBJECT_DAYS: Record<Subject, number[]> = { 수학: [1, 3, 5], 영어: [2, 4, 6] };

const SLOTS: Record<Band, { week: [string, string][]; sat: [string, string][] }> = {
  초등: {
    week: [
      ["14:30", "16:00"],
      ["16:10", "17:40"],
      ["17:50", "19:20"],
    ],
    sat: [
      ["10:00", "11:30"],
      ["11:40", "13:10"],
      ["13:20", "14:50"],
    ],
  },
  중등: {
    week: [
      ["15:30", "17:30"],
      ["17:40", "19:40"],
      ["19:50", "21:50"],
    ],
    sat: [
      ["10:00", "12:00"],
      ["12:10", "14:10"],
      ["14:20", "16:20"],
    ],
  },
};

const CAP: Record<Band, number> = { 초등: 8, 중등: 10 };
const MINUTES: Record<Band, number> = { 초등: 90, 중등: 120 };

type ClassItem = {
  id: string;
  grade: Grade;
  subject: Subject;
  level: Level;
  slot: number;
  cap: number;
  left: number;
};

const FULL = new Set(["중2-수학-심화반", "초6-영어-심화반"]);

const CLASSES: ClassItem[] = GRADES.flatMap((grade, gi) =>
  SUBJECTS.flatMap((subject, si) =>
    LEVELS.map((level, li) => {
      const id = `${grade}-${subject}-${level}`;
      const cap = CAP[bandOf(grade)];
      const h = [...id].reduce((a, ch) => a + ch.charCodeAt(0), 0);
      const booked = FULL.has(id) ? cap : 2 + (h % (cap - 2));
      return { id, grade, subject, level, slot: (gi + li + si) % 3, cap, left: cap - booked };
    }),
  ),
);

const classById = (id: string) => CLASSES.find((c) => c.id === id)!;
const className = (c: ClassItem) => `${c.grade} ${c.subject} ${c.level}`;

function timeOf(c: ClassItem, day: number) {
  const s = SLOTS[bandOf(c.grade)];
  return day === 6 ? s.sat[c.slot] : s.week[c.slot];
}

function daysText(c: ClassItem, times: Times) {
  return SUBJECT_DAYS[c.subject]
    .slice(0, times)
    .map((d) => DAY[d])
    .join(", ");
}

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const p2 = (n: number) => String(n).padStart(2, "0");
const fmtMin = (m: number) => `${p2(Math.floor(m / 60))}:${p2(m % 60)}`;

/** 점수 구간에 맞는 반과, 레벨테스트 결과에 따라 갈 수 있는 다른 반 */
function levelFor(score: Score): { main: Level | null; alt: Level | null } {
  switch (score) {
    case "90점 이상":
      return { main: "심화반", alt: null };
    case "80점대":
      return { main: "정규반", alt: "심화반" };
    case "70점대":
      return { main: "정규반", alt: "기초반" };
    case "60점대 이하":
      return { main: "기초반", alt: null };
    default:
      return { main: null, alt: null };
  }
}

type Pick = { grade: Grade; subject: Subject; score: Score; times: Times };

/* ---------- 교습비 ---------- */

const FEES: Record<Band, Record<Subject, Record<Times, number>>> = {
  초등: { 수학: { 2: 200000, 3: 280000 }, 영어: { 2: 190000, 3: 270000 } },
  중등: { 수학: { 2: 290000, 3: 400000 }, 영어: { 2: 270000, 3: 370000 } },
};
const SHUTTLE_FEE = 30000;
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/* ---------- 이름 가리기 ---------- */

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 김하늘 > 김ㅎ늘 (병원 대기 화면처럼 둘째 글자를 초성만 남긴다) */
function maskName(name: string) {
  const s = [...name.trim()];
  if (s.length < 2) return s.join("");
  const code = s[1].charCodeAt(0);
  const second = code >= 0xac00 && code <= 0xd7a3 ? CHO[Math.floor((code - 0xac00) / 588)] : "*";
  return s[0] + second + s.slice(2).join("");
}

const maskPhone = (p: string) => {
  const d = p.replace(/\D/g, "");
  return d.length >= 10 ? `${d.slice(0, 3)}-****-${d.slice(-4)}` : p;
};

/* ---------- 차량 ---------- */

type Stop = { name: string; min: number };
type Route = { id: string; name: string; area: string; stops: Stop[] };

/* min: 정류장에서 학원까지 걸리는 시간(분). 등원 차는 수업 10분 전에 학원에 닿고, 하원 차는 끝나고 5분 뒤 출발한다. */
const ROUTES: Route[] = [
  {
    id: "r1",
    name: "1호차",
    area: "ㅎㄷ동, ㅂㅅ동 방면",
    stops: [
      { name: "ㅎㄷ마을 3단지 정문", min: 19 },
      { name: "ㅎㄷ초 후문", min: 16 },
      { name: "ㅂㅅ아파트 102동 앞", min: 12 },
      { name: "ㅂㅅ동 주민센터", min: 8 },
      { name: "ㄷㅊ중 정문 건너편", min: 4 },
    ],
  },
  {
    id: "r2",
    name: "2호차",
    area: "ㅅㄴ동, ㅁㄷ동 방면",
    stops: [
      { name: "ㅅㄴ e편한 1단지 후문", min: 21 },
      { name: "ㅅㄴ중 앞 버스정류장", min: 17 },
      { name: "ㅁㄷ힐스 정문", min: 13 },
      { name: "ㅁㄷ초 정문", min: 9 },
      { name: "ㅁㄷ도서관 앞", min: 5 },
    ],
  },
];

/* ---------- 메뉴 ---------- */

const NAV = [
  { id: "classes", label: "반 편성, 시간표" },
  { id: "leveltest", label: "레벨테스트 예약" },
  { id: "fee", label: "교습비 안내" },
  { id: "shuttle", label: "차량 운행" },
  { id: "teachers", label: "강사 소개" },
  { id: "about", label: "학원 소개" },
  { id: "notice", label: "공지사항" },
] as const;

const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/* ================================================================== */

export function AcademyDemo() {
  const [pick, setPick] = useState<Pick>({ grade: "중2", subject: "수학", score: "70점대", times: 3 });
  const [viewGrade, setViewGrade] = useState<Grade>("중2");
  const [bookingReset, setBookingReset] = useState(0);

  const change = (p: Partial<Pick>) => {
    setPick((prev) => ({ ...prev, ...p }));
    if (p.grade) setViewGrade(p.grade);
  };

  // 사용법 가이드가 첫 화면으로 돌려 달라고 하면 예약 단계를 처음으로 돌린다
  useEffect(() => {
    const f = () => setBookingReset((n) => n + 1);
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const { main, alt } = levelFor(pick.score);
  const matched = main ? classById(`${pick.grade}-${pick.subject}-${main}`) : null;

  return (
    <div className="min-h-screen overflow-x-hidden text-[17px] leading-[1.7]" style={{ background: C.paper, color: C.ink }}>
      <Header />
      <main>
        <Hero />
        <ClassSection pick={pick} onChange={change} viewGrade={viewGrade} onView={setViewGrade} matched={matched} alt={alt} />
        <LevelTest key={bookingReset} pick={pick} />
        <Fee pick={pick} onChange={change} />
        <Shuttle pick={pick} matched={matched} />
        <Results />
        <Teachers />
        <About />
        <Notices />
      </main>
      <Footer />
    </div>
  );
}

/* ---------- 로고, 머리글 ---------- */

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-[19px] font-bold tracking-[-0.01em]">곰파트너</span>
        <span className="text-[12px] font-semibold" style={{ opacity: light ? 0.85 : 0.8 }}>
          카탈로그
        </span>
      </span>
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

  const move = (id: string) => {
    setOpen(false);
    goTo(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: C.card, borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label={`${ACADEMY} 처음으로`} className="shrink-0">
          <Logo />
        </button>
        <nav aria-label="주 메뉴" className="hidden xl:block">
          <ul className="flex items-center gap-6 text-[15px]">
            {NAV.map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => move(n.id)} className="flex h-16 items-center transition-colors hover:text-[#1e3b31]" style={{ color: C.muted }}>
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <a href={`tel:${TEL}`} className="hidden items-center gap-1.5 px-2 text-[15px] font-semibold md:inline-flex" style={{ color: C.board }}>
            <Phone size={16} aria-hidden />
            입학 상담 {TEL}
          </a>
          <a
            href={`tel:${TEL}`}
            aria-label={`입학 상담 전화 ${TEL}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] md:hidden"
            style={{ color: C.board }}
          >
            <Phone size={20} aria-hidden />
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] xl:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            aria-controls="academy-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="academy-menu"
            aria-label="주 메뉴"
            className="overflow-hidden border-t xl:hidden"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { height: 0 }}
            animate={{ height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <ul className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-4 px-4 py-2 sm:grid-cols-4">
              {NAV.map((n) => (
                <li key={n.id}>
                  <button type="button" onClick={() => move(n.id)} className="flex h-12 w-full items-center text-left text-[17px]">
                    {n.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- 첫 화면 ---------- */

function Hero() {
  return (
    <section aria-labelledby="academy-name" className="relative">
      <div className="relative h-[440px] md:h-[520px]">
        <Image
          src={`${IMG}/hero.jpg`}
          alt="저녁 불이 켜진 학원 교실, 책상 위에 펼친 문제집과 연필"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,42,34,0.25) 0%, rgba(20,42,34,0.82) 78%)" }} aria-hidden />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-24 md:px-6 md:pb-28">
          <div className="mx-auto max-w-[1200px]" style={{ color: C.onBoard }}>
            <p className="text-[16px] font-semibold md:text-[17px]" style={{ color: C.onBoardMuted }}>
              초등 4학년부터 중학교 3학년까지, ㄷㅊ중 ㅁㄷ중 ㅅㄴ중 내신
            </p>
            <h1 id="academy-name" className="mt-2 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] md:text-[52px]">
              {ACADEMY}
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => goTo("leveltest")}
                className="inline-flex h-12 items-center gap-2 rounded-[4px] px-5 text-[17px] font-bold transition-colors hover:bg-[#ffd633]"
                style={{ background: C.marker, color: C.ink }}
              >
                <CalendarCheck size={18} aria-hidden />
                레벨테스트 예약
              </button>
              <a
                href={`tel:${TEL}`}
                className="inline-flex h-12 items-center gap-2 rounded-[4px] border px-5 text-[17px] font-semibold transition-colors hover:bg-white/10"
                style={{ borderColor: "rgba(238,243,239,0.6)", color: C.onBoard }}
              >
                <Phone size={17} aria-hidden />
                입학 상담
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-[26px] font-bold leading-[1.35] tracking-[-0.02em] md:text-[32px]">
      {children}
    </h2>
  );
}

/* ---------- 반 찾기 + 학년별 시간표 ---------- */

/** 문장 안에 들어가는 선택 칸. 네이티브 select라 키보드와 휴대폰에서 그대로 쓴다. */
function Blank<T extends string | number>({
  label,
  value,
  options,
  onChange,
  render = (v) => String(v),
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  render?: (v: T) => string;
}) {
  return (
    <span className="relative inline-flex align-baseline">
      <select
        aria-label={label}
        value={String(value)}
        onChange={(e) => onChange(options.find((o) => String(o) === e.target.value)!)}
        className="cursor-pointer appearance-none rounded-none border-b-[3px] bg-transparent py-0.5 pl-1 pr-7 font-bold focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ borderColor: C.board, color: C.board, outlineColor: C.board }}
      >
        {options.map((o) => (
          <option key={String(o)} value={String(o)}>
            {render(o)}
          </option>
        ))}
      </select>
      <ChevronDown size={18} aria-hidden className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2" style={{ color: C.board }} />
    </span>
  );
}

function ClassSection({
  pick,
  onChange,
  viewGrade,
  onView,
  matched,
  alt,
}: {
  pick: Pick;
  onChange: (p: Partial<Pick>) => void;
  viewGrade: Grade;
  onView: (g: Grade) => void;
  matched: ClassItem | null;
  alt: Level | null;
}) {
  const altClass = matched && alt ? classById(`${pick.grade}-${pick.subject}-${alt}`) : null;
  const unknown = pick.score === "아직 몰라요";
  const ending = unknown ? "." : pick.score === "90점 이상" ? "이에요." : pick.score === "60점대 이하" ? "예요." : "쯤이에요.";
  const examName = bandOf(pick.grade) === "초등" ? "단원평가" : "학교 시험";

  return (
    <section id="classes" aria-labelledby="classes-title" className="scroll-mt-16 px-4 pb-16 md:px-6 md:pb-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="relative -mt-14 rounded-[10px] border p-5 shadow-[0_6px_24px_rgba(20,42,34,0.12)] md:-mt-16 md:p-8" style={{ background: C.card, borderColor: C.line }}>
          <SectionTitle id="classes-title">반 편성, 시간표</SectionTitle>
          <p className="mt-4 text-[19px] leading-[2.2] md:text-[22px]">
            <Blank label="학년" value={pick.grade} options={GRADES} onChange={(grade) => onChange({ grade })} /> 학생이고,{" "}
            <Blank label="과목" value={pick.subject} options={SUBJECTS} onChange={(subject) => onChange({ subject })} /> {examName} 점수는{" "}
            <Blank label="점수" value={pick.score} options={SCORES} onChange={(score) => onChange({ score })} />
            {ending} 주{" "}
            <Blank label="주 횟수" value={pick.times} options={[2, 3] as const} onChange={(times) => onChange({ times })} render={(v) => `${v}회`} /> 다닐
            생각이에요.
          </p>

          <div className="mt-5 border-t pt-5" style={{ borderColor: C.line }} aria-live="polite">
            {matched ? (
              <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-[15px] font-semibold" style={{ color: C.muted }}>
                    맞는 반
                  </p>
                  <p className="text-[22px] font-bold md:text-[24px]">
                    <Marked>{className(matched)}</Marked>
                  </p>
                  <p className="mt-1 tabular-nums">
                    {daysText(matched, pick.times)} {timeOf(matched, SUBJECT_DAYS[matched.subject][0]).join("~")}
                    {pick.times === 3 && matched.subject === "영어" && <span style={{ color: C.muted }}> (토 {timeOf(matched, 6).join("~")})</span>}
                    <span style={{ color: C.muted }}>, 정원 {matched.cap}명</span>
                  </p>
                  {altClass && (
                    <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                      레벨테스트 결과에 따라 {altClass.level}({altClass.left > 0 ? `${altClass.left}자리 남음` : "마감"})으로 배정할 수 있습니다.
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <SeatBadge left={matched.left} large />
                  <button
                    type="button"
                    onClick={() => goTo("leveltest")}
                    className="inline-flex h-12 items-center rounded-[4px] px-5 text-[17px] font-bold transition-colors hover:bg-[#142a22]"
                    style={{ background: C.board, color: C.onBoard }}
                  >
                    {matched.left > 0 ? "레벨테스트 예약" : "대기 신청하고 레벨테스트 예약"}
                  </button>
                </div>
              </div>
            ) : (
              <p>
                {unknown && (
                  <>
                    <span className="font-bold">{pick.grade} {pick.subject}</span>{pick.subject === "수학" ? "은" : "는"} 심화반, 정규반, 기초반이 있습니다. 레벨테스트 뒤 원장 상담에서 반을 정합니다.{" "}
                  </>
                )}
                <button type="button" onClick={() => goTo("leveltest")} className="font-bold underline underline-offset-4" style={{ color: C.board }}>
                  레벨테스트 예약
                </button>
              </p>
            )}
          </div>
        </div>

        <Timetable grade={viewGrade} onView={onView} pick={pick} matched={matched} unknown={unknown} />
      </div>
    </section>
  );
}

/** 형광펜으로 칠한 글자. 칠하는 움직임은 동작 줄이기 설정이면 생략한다. */
function Marked({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const reduce = useReducedMotionSafe();
  return (
    <span className="relative inline-block">
      <motion.span
        aria-hidden
        className="absolute -inset-x-1 bottom-[0.08em] top-[0.35em] -skew-x-6 rounded-[2px]"
        style={{ background: C.marker, originX: 0 }}
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.45, ease: EASE, delay }}
      />
      <span className="relative">{children}</span>
    </span>
  );
}

function SeatBadge({ left, large = false }: { left: number; large?: boolean }) {
  const full = left <= 0;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-[4px] border font-semibold tabular-nums ${large ? "h-12 px-4 text-[17px]" : "px-1.5 text-[14px]"}`}
      style={full ? { borderColor: C.red, color: C.red } : { borderColor: C.line, color: C.ink }}
    >
      {full ? "마감" : `${left}자리 남음`}
    </span>
  );
}

function Timetable({
  grade,
  onView,
  pick,
  matched,
  unknown,
}: {
  grade: Grade;
  onView: (g: Grade) => void;
  pick: Pick;
  matched: ClassItem | null;
  unknown: boolean;
}) {
  const band = bandOf(grade);
  const list = CLASSES.filter((c) => c.grade === grade);

  /** 이 요일 칸이 찾은 반인지: 주 2회면 세 번째 요일은 칠하지 않는다 */
  const state = (c: ClassItem, day: number): "on" | "extra" | "maybe" | null => {
    if (grade !== pick.grade || c.subject !== pick.subject) return null;
    const idx = SUBJECT_DAYS[c.subject].indexOf(day);
    if (unknown) return idx < pick.times ? "maybe" : null;
    if (!matched || c.id !== matched.id) return null;
    return idx < pick.times ? "on" : "extra";
  };

  const cellAt = (day: number, slot: number) => list.find((c) => SUBJECT_DAYS[c.subject].includes(day) && c.slot === slot) ?? null;

  return (
    <div className="mt-12">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h3 className="text-[22px] font-bold tracking-[-0.02em]">학년별 시간표</h3>
        <div role="group" aria-label="학년 선택" className="flex flex-wrap gap-1.5">
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={g === grade}
              onClick={() => onView(g)}
              className="h-10 min-w-[52px] rounded-[4px] border px-3 text-[16px] font-semibold transition-colors"
              style={g === grade ? { background: C.board, borderColor: C.board, color: C.onBoard } : { background: C.card, borderColor: C.line, color: C.ink }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
        {gradeLabel(grade)}, 수학 월, 수, 금, 영어 화, 목, 토, 회당 {MINUTES[band]}분, 주 2회반은 앞의 두 요일
      </p>

      {/* 넓은 화면: 요일 x 시간 칸 */}
      <div className="mt-4 hidden overflow-hidden rounded-[6px] border md:block" style={{ borderColor: C.line, background: C.card }}>
        <table className="w-full table-fixed border-collapse text-[15px]">
          <caption className="sr-only">{grade} 주간 시간표</caption>
          <thead>
            <tr style={{ background: C.boardSoft }}>
              <th scope="col" className="w-[92px] py-2.5 text-[14px] font-semibold" style={{ color: C.muted }}>
                시간
              </th>
              {WEEK.map((d) => (
                <th key={d} scope="col" className="py-2.5 font-bold">
                  {DAY[d]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2].map((slot) => (
              <tr key={slot} className="border-t" style={{ borderColor: C.line }}>
                <th scope="row" className="py-3 text-[14px] font-semibold tabular-nums" style={{ color: C.muted }}>
                  {SLOTS[band].week[slot][0]}
                </th>
                {WEEK.map((d, di) => {
                  const c = cellAt(d, slot);
                  if (!c) return <td key={d} className="border-l" style={{ borderColor: C.line }} />;
                  const st = state(c, d);
                  const [s, e] = timeOf(c, d);
                  return (
                    <td
                      key={d}
                      className="border-l p-2 align-top"
                      style={{ borderColor: C.line, background: st === "on" ? "#fffbe3" : undefined, boxShadow: st === "on" ? `inset 0 0 0 2px ${C.ink}` : undefined }}
                    >
                      <p className="font-bold leading-[1.4]">
                        {st === "on" || st === "maybe" ? (
                          <Marked key={`${c.id}-${pick.times}-${pick.score}`} delay={di * 0.06}>
                            {c.subject} {c.level}
                          </Marked>
                        ) : (
                          `${c.subject} ${c.level}`
                        )}
                      </p>
                      <p className="mt-0.5 tabular-nums" style={{ color: C.muted }}>
                        {s}~{e}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-1">
                        <SeatBadge left={c.left} />
                        {st === "on" && <span className="text-[14px] font-semibold">맞는 반</span>}
                        {st === "extra" && (
                          <span className="text-[14px]" style={{ color: C.muted }}>
                            주 3회만
                          </span>
                        )}
                      </p>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 좁은 화면: 요일별 목록 */}
      <ul className="mt-4 space-y-3 md:hidden">
        {WEEK.map((d, di) => {
          const items = list.filter((c) => SUBJECT_DAYS[c.subject].includes(d)).sort((a, b) => a.slot - b.slot);
          return (
            <li key={d} className="rounded-[6px] border" style={{ borderColor: C.line, background: C.card }}>
              <p className="border-b px-4 py-2 font-bold" style={{ borderColor: C.line, background: C.boardSoft }}>
                {DAY[d]}요일
              </p>
              <ul>
                {items.map((c) => {
                  const st = state(c, d);
                  const [s, e] = timeOf(c, d);
                  return (
                    <li
                      key={c.id}
                      className="flex items-center justify-between gap-2 border-t px-4 py-2.5 first:border-t-0"
                      style={{ borderColor: C.line, background: st === "on" ? "#fffbe3" : undefined }}
                    >
                      <span className="min-w-0">
                        <span className="block font-bold">
                          {st === "on" || st === "maybe" ? (
                            <Marked key={`${c.id}-${pick.times}-${pick.score}`} delay={di * 0.04}>
                              {c.subject} {c.level}
                            </Marked>
                          ) : (
                            `${c.subject} ${c.level}`
                          )}
                          {st === "on" && <span className="ml-1.5 text-[14px] font-semibold">맞는 반</span>}
                          {st === "extra" && (
                            <span className="ml-1.5 text-[14px] font-normal" style={{ color: C.muted }}>
                              주 3회만
                            </span>
                          )}
                        </span>
                        <span className="text-[15px] tabular-nums" style={{ color: C.muted }}>
                          {s}~{e}
                        </span>
                      </span>
                      <SeatBadge left={c.left} />
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- 레벨테스트 예약 ---------- */

const TEST_SLOTS = { week: ["16:00", "17:30", "19:00"], sat: ["10:00", "11:30", "13:00"] };
const TEST_MIN: Record<string, number> = { 수학: 50, 영어: 40, "수학, 영어": 90 };

function LevelTest({ pick }: { pick: Pick }) {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [step, setStep] = useState<"pick" | "info" | "done">("pick");
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState<string>(pick.subject);
  const [grade, setGrade] = useState<Grade>(pick.grade);
  const [tried, setTried] = useState(false);
  const headRef = useRef<HTMLHeadingElement>(null);

  // 반 찾기에서 고른 학년과 과목을 예약서에 미리 채운다
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setGrade(pick.grade);
      setSubject(pick.subject);
    });
    return () => cancelAnimationFrame(frame);
  }, [pick.grade, pick.subject]);

  const days = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => daysAgo(today, -(i + 1)))
        .filter((d) => d.getDay() === 2 || d.getDay() === 4 || d.getDay() === 6)
        .slice(0, 6),
    [today],
  );

  const chosen = days.find((d) => fmtDash(d) === date) ?? null;
  const slots = chosen ? (chosen.getDay() === 6 ? TEST_SLOTS.sat : TEST_SLOTS.week) : [];
  const taken = (d: Date, i: number) => (d.getDate() + i * 2) % 5 === 0;

  const phoneOk = /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.trim());
  const nameOk = name.trim().length >= 2;

  const goStep = (s: typeof step) => {
    setStep(s);
    requestAnimationFrame(() => headRef.current?.focus({ preventScroll: true }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (nameOk && phoneOk) goStep("done");
  };

  const reset = () => {
    setDate(null);
    setTime(null);
    setName("");
    setSchool("");
    setPhone("");
    setTried(false);
    goStep("pick");
  };

  const testMin = TEST_MIN[subject];

  return (
    <section id="leveltest" aria-labelledby="leveltest-title" className="scroll-mt-16 border-y px-4 py-16 md:px-6 md:py-24" style={{ background: C.card, borderColor: C.line }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <SectionTitle id="leveltest-title">레벨테스트 예약</SectionTitle>
          <p className="mt-3" style={{ color: C.muted }}>
            테스트는 학원에서 봅니다. 수학 50분, 영어 40분이고 끝나면 원장 상담 20분이 이어집니다.
          </p>
          <h3 className="mt-8 text-[18px] font-bold">입학 절차</h3>
          <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-[16px]">
            {["테스트 예약", "레벨테스트", "원장 상담", "반 배정, 등록"].map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                {i > 0 && <ChevronRight size={16} aria-hidden style={{ color: C.muted }} />}
                <span className="rounded-[4px] border px-3 py-1.5" style={{ borderColor: C.line, background: i === 0 ? C.boardSoft : undefined }}>
                  {s}
                </span>
              </li>
            ))}
          </ol>
          <dl className="mt-8 divide-y border-y text-[16px]" style={{ borderColor: C.line }}>
            {[
              ["시험 요일", "화, 목 16:00, 17:30, 19:00 / 토 10:00, 11:30, 13:00"],
              ["준비물", "필기구, 최근 학교 시험지(있으면)"],
              ["비용", "무료"],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[88px_1fr] gap-3 py-2.5" style={{ borderColor: C.line }}>
                <dt className="font-semibold" style={{ color: C.muted }}>
                  {k}
                </dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-[10px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.paper }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              {step === "pick" && (
                <>
                  <h3 ref={headRef} tabIndex={-1} className="text-[20px] font-bold outline-none">
                    날짜와 시간
                  </h3>
                  <div role="group" aria-label="날짜" className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {days.map((d) => {
                      const key = fmtDash(d);
                      const on = key === date;
                      return (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={on}
                          onClick={() => {
                            setDate(key);
                            setTime(null);
                          }}
                          className="flex h-[68px] flex-col items-center justify-center rounded-[6px] border transition-colors"
                          style={on ? { background: C.board, borderColor: C.board, color: C.onBoard } : { background: C.card, borderColor: C.line }}
                        >
                          <span className="text-[14px]" style={{ opacity: 0.85 }}>
                            {d.getMonth() + 1}월 {DAY[d.getDay()]}
                          </span>
                          <span className="text-[22px] font-bold leading-none tabular-nums">{d.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                  {chosen && (
                    <div role="group" aria-label="시간" className="mt-4 grid grid-cols-3 gap-2">
                      {slots.map((t, i) => {
                        const off = taken(chosen, i);
                        const on = t === time;
                        return (
                          <button
                            key={t}
                            type="button"
                            disabled={off}
                            aria-pressed={on}
                            onClick={() => setTime(t)}
                            className="h-12 rounded-[6px] border text-[17px] font-semibold tabular-nums transition-colors disabled:cursor-not-allowed"
                            style={
                              off
                                ? { background: "transparent", borderColor: C.line, color: "#6b7570", textDecoration: "line-through" }
                                : on
                                  ? { background: C.marker, borderColor: C.ink, color: C.ink }
                                  : { background: C.card, borderColor: C.line }
                            }
                          >
                            {t}
                            {off && <span className="sr-only"> 예약 마감</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={!date || !time}
                    onClick={() => goStep("info")}
                    className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[4px] text-[17px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-45"
                    style={{ background: C.board, color: C.onBoard }}
                  >
                    {chosen && time ? `${fmtKo(chosen)} ${time} 다음` : "날짜와 시간을 고르면 다음으로"}
                  </button>
                </>
              )}

              {step === "info" && chosen && time && (
                <form onSubmit={submit} noValidate>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => goStep("pick")} aria-label="날짜 다시 고르기" className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-[4px]">
                      <ChevronLeft size={20} aria-hidden />
                    </button>
                    <h3 ref={headRef} tabIndex={-1} className="text-[20px] font-bold outline-none">
                      학생 정보
                    </h3>
                  </div>
                  <p className="mt-1 tabular-nums" style={{ color: C.muted }}>
                    {fmtKo(chosen)} {time}
                  </p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Field label="학생 이름" error={tried && !nameOk ? "이름을 두 글자 이상 적어 주세요" : null}>
                      {(p) => <input {...p} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />}
                    </Field>
                    <Field label="학교">
                      {(p) => <input {...p} value={school} onChange={(e) => setSchool(e.target.value)} placeholder="ㄷㅊ중" />}
                    </Field>
                    <Field label="학년">
                      {(p) => (
                        <select {...p} value={grade} onChange={(e) => setGrade(e.target.value as Grade)}>
                          {GRADES.map((g) => (
                            <option key={g}>{g}</option>
                          ))}
                        </select>
                      )}
                    </Field>
                    <Field label="보호자 휴대폰" error={tried && !phoneOk ? "010-0000-0000 형식으로 적어 주세요" : null}>
                      {(p) => <input {...p} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" />}
                    </Field>
                  </div>
                  <fieldset className="mt-4">
                    <legend className="text-[15px] font-semibold">시험 과목</legend>
                    <div className="mt-1.5 grid grid-cols-3 gap-2">
                      {["수학", "영어", "수학, 영어"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          aria-pressed={subject === s}
                          onClick={() => setSubject(s)}
                          className="h-11 rounded-[4px] border text-[16px] font-semibold"
                          style={subject === s ? { background: C.board, borderColor: C.board, color: C.onBoard } : { background: C.card, borderColor: C.line }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <button type="submit" className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[4px] text-[17px] font-bold" style={{ background: C.board, color: C.onBoard }}>
                    예약하기
                  </button>
                </form>
              )}

              {step === "done" && chosen && time && (
                <div>
                  <h3 ref={headRef} tabIndex={-1} className="flex items-center gap-2 text-[20px] font-bold outline-none">
                    <Check size={22} aria-hidden style={{ color: C.board }} />
                    예약했습니다
                  </h3>
                  <dl className="mt-4 divide-y border-y text-[16px]" style={{ borderColor: C.line }}>
                    {[
                      ["학생", `${maskName(name)} (${grade}${school ? `, ${school}` : ""})`],
                      ["일시", `${fmtKo(chosen)} ${time}`],
                      ["시험", `${subject} ${testMin}분, 이어서 원장 상담 20분`],
                      ["끝나는 시간", fmtMin(toMin(time) + testMin + 20)],
                    ].map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[96px_1fr] gap-3 py-2.5" style={{ borderColor: C.line }}>
                        <dt className="font-semibold" style={{ color: C.muted }}>
                          {k}
                        </dt>
                        <dd className="tabular-nums">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  <p className="mt-6 text-[15px] font-semibold" style={{ color: C.muted }}>
                    {maskPhone(phone)}로 가는 문자
                  </p>
                  <div className="mt-2 max-w-[360px] rounded-[18px] p-3" style={{ background: "#e9ece8" }}>
                    <p className="whitespace-pre-line rounded-[14px] rounded-tl-[4px] bg-white px-4 py-3 text-[15px] leading-[1.65]">
                      {`[${ACADEMY}]
${maskName(name)} 학생 레벨테스트 예약
${fmtKo(chosen)} ${time}
${subject} ${testMin}분, 원장 상담 20분
필기구와 최근 학교 시험지를 가져와 주세요.
일정 변경: ${TEL}`}
                    </p>
                  </div>
                  <button type="button" onClick={reset} className="mt-6 inline-flex h-11 items-center gap-2 rounded-[4px] border px-4 text-[16px] font-semibold" style={{ borderColor: C.line, background: C.card }}>
                    <RotateCcw size={16} aria-hidden />
                    다른 시간 예약
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

type FieldProps = {
  id: string;
  className: string;
  style: React.CSSProperties;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

function Field({ label, error = null, children }: { label: string; error?: string | null; children: (p: FieldProps) => React.ReactNode }) {
  const id = `lt-${label.replace(/\s/g, "")}`;
  return (
    <div>
      <label htmlFor={id} className="text-[15px] font-semibold">
        {label}
      </label>
      {children({
        id,
        className: "mt-1.5 h-12 w-full rounded-[4px] border bg-white px-3 text-[17px]",
        style: { borderColor: error ? C.red : "#9aa39d" },
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? `${id}-err` : undefined,
      })}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-[15px]" style={{ color: C.red }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- 교습비 ---------- */

function Fee({ pick, onChange }: { pick: Pick; onChange: (p: Partial<Pick>) => void }) {
  const [both, setBoth] = useState(false);
  const [shuttle, setShuttle] = useState(false);
  const band = bandOf(pick.grade);
  const other: Subject = pick.subject === "수학" ? "영어" : "수학";

  const lines: [string, number][] = [[`${pick.subject} 주 ${pick.times}회`, FEES[band][pick.subject][pick.times]]];
  if (both) lines.push([`${other} 주 ${pick.times}회`, FEES[band][other][pick.times]]);
  if (shuttle) lines.push(["차량비", SHUTTLE_FEE]);
  const total = lines.reduce((a, [, n]) => a + n, 0);

  const rows = (["초등", "중등"] as Band[]).flatMap((b) => SUBJECTS.flatMap((s) => ([2, 3] as Times[]).map((t) => ({ b, s, t }))));
  const isOn = (r: { b: Band; s: Subject; t: Times }) => r.b === band && r.t === pick.times && (r.s === pick.subject || (both && r.s === other));

  return (
    <section id="fee" aria-labelledby="fee-title" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle id="fee-title">교습비 안내</SectionTitle>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div className="rounded-[10px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
            <h3 className="text-[19px] font-bold">한 달 교습비 계산</h3>
            <div className="mt-4 space-y-4">
              <Seg label="학년" value={pick.grade} options={GRADES} onChange={(grade) => onChange({ grade })} cols="grid-cols-6" />
              <Seg label="과목" value={pick.subject} options={SUBJECTS} onChange={(subject) => onChange({ subject })} cols="grid-cols-2" />
              <Seg label="주 횟수" value={pick.times} options={[2, 3] as Times[]} onChange={(times) => onChange({ times })} cols="grid-cols-2" render={(v) => `주 ${v}회`} />
              <div className="space-y-1">
                <Check2 checked={both} onChange={setBoth}>
                  {other}도 함께 다녀요
                </Check2>
                <Check2 checked={shuttle} onChange={setShuttle}>
                  학원 차량을 타요
                </Check2>
              </div>
            </div>
            <dl className="mt-5 space-y-1.5 border-t pt-4 text-[16px] tabular-nums" style={{ borderColor: C.line }} aria-live="polite">
              {lines.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt style={{ color: C.muted }}>{k}</dt>
                  <dd>{won(v)}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-3 border-t pt-2.5" style={{ borderColor: C.line }}>
                <dt className="font-bold">한 달 합계</dt>
                <dd className="text-[24px] font-bold">{won(total)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
              교재비 별도. 교재는 시중 교재로 학기 초에 직접 구입합니다(1권 13,000~18,000원).
            </p>
          </div>

          <div className="min-w-0">
            <div tabIndex={0} role="region" aria-labelledby="fee-caption" className="overflow-x-auto rounded-[6px] border" style={{ borderColor: C.line, background: C.card }}>
              <table className="w-full min-w-[640px] border-collapse text-[15px]">
                <caption id="fee-caption" className="px-4 pb-1 pt-4 text-left">
                  <span className="block text-[18px] font-bold">교습비 등 게시</span>
                  <span className="block text-[14px] font-normal" style={{ color: C.muted }}>
                    교습계열 입시, 검정 및 보습, 교습과정 보통교과, 교습기간 1개월(4주)
                  </span>
                </caption>
                <thead>
                  <tr className="border-b text-[14px]" style={{ borderColor: C.line, color: C.muted }}>
                    {["과정", "과목", "정원", "교습시간", "총 교습시간", "교습비", "기타경비"].map((h) => (
                      <th key={h} scope="col" className="whitespace-nowrap px-3 py-2.5 text-left font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {rows.map((r) => {
                    const on = isOn(r);
                    return (
                      <tr key={`${r.b}${r.s}${r.t}`} className="border-t" style={{ borderColor: C.line, background: on ? "#fffbe3" : undefined }}>
                        <td className="whitespace-nowrap px-3 py-2.5">{r.b}</td>
                        <th scope="row" className="whitespace-nowrap px-3 py-2.5 text-left font-semibold">
                          {r.s} 주 {r.t}회
                          {on && <span className="sr-only"> (계산에 넣은 과목)</span>}
                        </th>
                        <td className="px-3 py-2.5">{CAP[r.b]}명</td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          주 {r.t}회 × {MINUTES[r.b]}분
                        </td>
                        <td className="px-3 py-2.5">{(r.t * 4 * MINUTES[r.b]).toLocaleString("ko-KR")}분</td>
                        <td className="px-3 py-2.5 font-semibold">{on ? <Marked key={`${pick.times}${pick.grade}${both}`}>{won(FEES[r.b][r.s][r.t])}</Marked> : won(FEES[r.b][r.s][r.t])}</td>
                        <td className="whitespace-nowrap px-3 py-2.5" style={{ color: C.muted }}>
                          차량비 {won(SHUTTLE_FEE)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ul className="mt-3 space-y-1 text-[15px]" style={{ color: C.muted }}>
              <li>교습비등은 ㅁㄹ교육지원청에 등록한 금액입니다. 학원 등록번호 제2026-00호.</li>
              <li>차량비는 학원 차량을 이용하는 학생만 냅니다.</li>
            </ul>
            <details className="group mt-4 rounded-[6px] border" style={{ borderColor: C.line, background: C.card }}>
              <summary className="flex h-12 cursor-pointer list-none items-center justify-between px-4 font-semibold [&::-webkit-details-marker]:hidden">
                교습비 반환 기준
                <ChevronDown size={18} aria-hidden className="transition-transform group-open:rotate-180" />
              </summary>
              <table className="w-full border-t text-[15px]" style={{ borderColor: C.line }}>
                <caption className="sr-only">교습기간 1개월 이내 반환 기준</caption>
                <tbody>
                  {[
                    ["교습 시작 전", "낸 교습비 전액"],
                    ["총 교습시간의 1/3이 지나기 전", "낸 교습비의 2/3"],
                    ["총 교습시간의 1/2이 지나기 전", "낸 교습비의 1/2"],
                    ["총 교습시간의 1/2이 지난 뒤", "반환하지 않음"],
                  ].map(([k, v]) => (
                    <tr key={k} className="border-t first:border-t-0" style={{ borderColor: C.line }}>
                      <th scope="row" className="px-4 py-2.5 text-left font-normal">
                        {k}
                      </th>
                      <td className="px-4 py-2.5 text-right font-semibold">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}

function Seg<T extends string | number>({
  label,
  value,
  options,
  onChange,
  cols,
  render = (v) => String(v),
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  cols: string;
  render?: (v: T) => string;
}) {
  return (
    <div role="group" aria-label={label}>
      <p className="text-[15px] font-semibold" style={{ color: C.muted }} aria-hidden>
        {label}
      </p>
      <div className={`mt-1.5 grid gap-1 ${cols}`}>
        {options.map((o) => {
          const on = o === value;
          return (
            <button
              key={String(o)}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(o)}
              className="h-11 min-w-0 rounded-[4px] border px-1 text-[16px] font-semibold transition-colors"
              style={on ? { background: C.board, borderColor: C.board, color: C.onBoard } : { background: C.card, borderColor: C.line }}
            >
              {render(o)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Check2({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 shrink-0" style={{ accentColor: C.board }} />
      <span>{children}</span>
    </label>
  );
}

/* ---------- 차량 운행 ---------- */

function Shuttle({ pick, matched }: { pick: Pick; matched: ClassItem | null }) {
  const [routeId, setRouteId] = useState(ROUTES[0].id);
  const [stopName, setStopName] = useState<string | null>(ROUTES[0].stops[2].name);
  const route = ROUTES.find((r) => r.id === routeId)!;
  const stop = route.stops.find((s) => s.name === stopName) ?? null;

  // 반을 못 정했으면 같은 학년·과목의 정규반 시간으로 보여 준다
  const base = matched ?? classById(`${pick.grade}-${pick.subject}-정규반`);
  const usedDays = SUBJECT_DAYS[base.subject].slice(0, pick.times);
  const groups = [
    { label: usedDays.filter((d) => d !== 6).map((d) => DAY[d]).join(", "), time: timeOf(base, usedDays[0]) },
    ...(usedDays.includes(6) ? [{ label: "토", time: timeOf(base, 6) }] : []),
  ];

  return (
    <section id="shuttle" aria-labelledby="shuttle-title" className="scroll-mt-16 border-y px-4 py-16 md:px-6 md:py-24" style={{ background: C.boardSoft, borderColor: C.line }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle id="shuttle-title">차량 운행 노선</SectionTitle>
        <p className="mt-2" style={{ color: C.muted }}>
          15인승 2대, 어린이통학버스 신고 차량이며 모든 운행에 동승 보호자가 탑니다.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="rounded-[10px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
            <div role="group" aria-label="노선" className="grid grid-cols-2 gap-1.5">
              {ROUTES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={r.id === routeId}
                  onClick={() => {
                    setRouteId(r.id);
                    setStopName(null);
                  }}
                  className="flex min-h-[56px] flex-col items-start justify-center rounded-[4px] border px-3 text-left"
                  style={r.id === routeId ? { background: C.board, borderColor: C.board, color: C.onBoard } : { background: C.card, borderColor: C.line }}
                >
                  <span className="font-bold">{r.name}</span>
                  <span className="text-[14px]" style={{ opacity: 0.85 }}>
                    {r.area}
                  </span>
                </button>
              ))}
            </div>

            <ol className="relative mt-5" aria-label={`${route.name} 정류장`}>
              <span aria-hidden className="absolute bottom-6 left-[15px] top-6 w-[3px] rounded-full" style={{ background: C.board, opacity: 0.25 }} />
              {route.stops.map((s) => {
                const on = s.name === stopName;
                return (
                  <li key={s.name} className="relative">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setStopName(s.name)}
                      className="flex min-h-12 w-full items-center gap-3 rounded-[4px] py-1.5 pr-2 text-left transition-colors hover:bg-black/[0.03]"
                    >
                      <span
                        aria-hidden
                        className="relative z-10 grid h-[33px] w-[33px] shrink-0 place-items-center rounded-full border-[3px]"
                        style={on ? { background: C.marker, borderColor: C.ink } : { background: C.card, borderColor: C.board }}
                      >
                        {on && <Bus size={15} />}
                      </span>
                      <span className={`flex-1 ${on ? "font-bold" : ""}`}>{s.name}</span>
                      <span className="text-[15px] tabular-nums" style={{ color: C.muted }}>
                        학원까지 {s.min}분
                      </span>
                    </button>
                  </li>
                );
              })}
              <li className="relative flex min-h-12 items-center gap-3 py-1.5">
                <span aria-hidden className="relative z-10 grid h-[33px] w-[33px] shrink-0 place-items-center rounded-[6px]" style={{ background: C.board, color: C.onBoard }}>
                  <span className="text-[13px] font-bold">학원</span>
                </span>
                <span className="font-semibold">{ACADEMY}</span>
              </li>
            </ol>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-[10px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }} aria-live="polite">
              {stop ? (
                <>
                  <p className="text-[15px] font-semibold" style={{ color: C.muted }}>
                    {className(base)} 기준
                  </p>
                  <h3 className="mt-0.5 text-[21px] font-bold">{stop.name}</h3>
                  <table className="mt-4 w-full text-[16px] tabular-nums">
                    <caption className="sr-only">{stop.name} 탑승, 하원 시간</caption>
                    <thead>
                      <tr className="text-[14px]" style={{ color: C.muted }}>
                        <th scope="col" className="pb-2 text-left font-semibold">
                          요일
                        </th>
                        <th scope="col" className="pb-2 text-left font-semibold">
                          수업
                        </th>
                        <th scope="col" className="pb-2 text-left font-semibold">
                          등원 탑승
                        </th>
                        <th scope="col" className="pb-2 text-left font-semibold">
                          하원 도착
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((g) => {
                        const [s, e] = g.time;
                        return (
                          <tr key={g.label} className="border-t" style={{ borderColor: C.line }}>
                            <th scope="row" className="py-3 pr-2 text-left font-semibold">
                              {g.label}
                            </th>
                            <td className="py-3 pr-2" style={{ color: C.muted }}>
                              {s}~{e}
                            </td>
                            <td className="py-3 pr-2 text-[20px] font-bold">{fmtMin(toMin(s) - 10 - stop.min)}</td>
                            <td className="py-3 text-[20px] font-bold">{fmtMin(toMin(e) + 5 + stop.min)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
                    차는 정류장에서 1분 기다립니다. 늦으면 차량 기사님 번호로 문자 주세요.
                  </p>
                </>
              ) : (
                <p className="py-6 text-center" style={{ color: C.muted }}>
                  정류장을 고르면 등원, 하원 시간이 나옵니다.
                </p>
              )}
            </div>

            <div className="rounded-[10px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
              <h3 className="text-[19px] font-bold">학원 위치</h3>
              <dl className="mt-3 space-y-1.5 text-[16px]">
                {[
                  ["주소", ADDRESS],
                  ["걸어서", "ㅁㄹ역 2번 출구에서 5분, ㄷㅊ중 정문 건너편 건물"],
                  ["주차", "건물 지하 1층, 상담 방문 1시간 무료"],
                  ["전화", TEL],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[72px_1fr] gap-3">
                    <dt className="font-semibold" style={{ color: C.muted }}>
                      {k}
                    </dt>
                    <dd>{k === "전화" ? <a href={`tel:${TEL}`} className="font-semibold underline underline-offset-4">{v}</a> : v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 반별 성적 변화 ---------- */

const RESULTS = [
  { name: "중3 수학 심화반", n: 9, before: 86.2, after: 89.0 },
  { name: "중3 수학 정규반", n: 10, before: 71.5, after: 76.8 },
  { name: "중2 수학 정규반", n: 10, before: 68.9, after: 73.4 },
  { name: "중2 영어 정규반", n: 8, before: 74.1, after: 77.6 },
  { name: "중1 수학 기초반", n: 7, before: 58.3, after: 64.0 },
  { name: "중1 영어 심화반", n: 9, before: 90.4, after: 90.9 },
];

/** 점수(50~100점)를 막대 안 위치(%)로 */
const pos = (v: number) => Math.round(((v - 50) / 50) * 1000) / 10;

function Results() {
  return (
    <section aria-labelledby="results-title" className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle id="results-title">반별 성적 변화</SectionTitle>
        <p className="mt-2" style={{ color: C.muted }}>
          2026년 1학기 중간고사와 기말고사, 석 달 넘게 다닌 학생의 학교 시험 점수 반 평균입니다.
        </p>
        <div className="mt-6 rounded-[10px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[15px]" style={{ color: C.muted }}>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="h-3 w-3 rounded-full border-2" style={{ borderColor: C.muted, background: C.card }} />
              중간고사
            </span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: C.board }} />
              기말고사
            </span>
          </div>
          <table className="mt-3 w-full text-[16px]">
            <caption className="sr-only">반별 중간고사, 기말고사 평균 점수</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">반</th>
                <th scope="col">점수 변화</th>
                <th scope="col">변화</th>
              </tr>
            </thead>
            <tbody>
              {RESULTS.map((r) => {
                const diff = Math.round((r.after - r.before) * 10) / 10;
                const a = pos(r.before);
                const b = pos(r.after);
                return (
                  <tr key={r.name} className="border-t first:border-t-0" style={{ borderColor: C.line }}>
                    <th scope="row" className="w-[42%] py-3 pr-3 text-left font-semibold md:w-[240px]">
                      {r.name}
                      <span className="block text-[14px] font-normal md:inline md:pl-1.5" style={{ color: C.muted }}>
                        {r.n}명
                      </span>
                    </th>
                    <td className="py-3">
                      <span className="sr-only">
                        {r.before}점에서 {r.after}점
                      </span>
                      <span aria-hidden className="relative block h-5">
                        <span className="absolute inset-x-0 top-1/2 h-px" style={{ background: C.line }} />
                        <span className="absolute top-1/2 h-[3px] -translate-y-1/2" style={{ left: `${a}%`, width: `${b - a}%`, background: C.board, opacity: 0.45 }} />
                        <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2" style={{ left: `${a}%`, borderColor: C.muted, background: C.card }} />
                        <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${b}%`, background: C.board }} />
                      </span>
                    </td>
                    <td className="w-[64px] py-3 pl-3 text-right font-semibold tabular-nums">+{diff.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div aria-hidden className="ml-[42%] mr-[64px] flex justify-between text-[13px] tabular-nums md:ml-[240px]" style={{ color: C.muted }}>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 강사 소개 ---------- */

const TEACHERS = [
  {
    name: "김ㅎ늘",
    role: "원장, 수학",
    photo: `${IMG}/teacher1.jpg`,
    alt: "화이트보드 앞에 선 남색 스웨터 차림의 수학 강사",
    classes: "중2, 중3 수학 심화반, 정규반",
    career: ["수학교육과 졸업", "중등 수학 지도 14년", "ㄷㅊ중, ㅁㄷ중 내신 기출 분석 자료 직접 제작"],
    way: "수업 끝 15분은 확인 테스트입니다. 틀린 문제는 다음 수업 전 클리닉에서 다시 풉니다.",
  },
  {
    name: "박ㅈ우",
    role: "영어",
    photo: `${IMG}/teacher2.jpg`,
    alt: "책장 앞에 선 베이지색 카디건 차림의 영어 강사",
    classes: "초5~중3 영어 전 반",
    career: ["영어영문학과 졸업", "초중등 영어 지도 9년", "TESOL 과정 수료"],
    way: "단어 시험은 매 수업, 서술형은 문장 하나씩 첨삭해서 돌려줍니다.",
  },
];

function Teachers() {
  return (
    <section id="teachers" aria-labelledby="teachers-title" className="scroll-mt-16 border-t px-4 py-16 md:px-6 md:py-24" style={{ borderColor: C.line }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle id="teachers-title">강사 소개</SectionTitle>
        <ul className="mt-6 grid gap-8 md:grid-cols-2">
          {TEACHERS.map((t) => (
            <li key={t.name} className="overflow-hidden rounded-[10px] border" style={{ borderColor: C.line, background: C.card }}>
              <div className="relative aspect-[4/3]">
                <Image src={t.photo} alt={t.alt} fill sizes="(min-width: 768px) 600px, 100vw" className="object-cover object-[50%_25%]" />
              </div>
              <div className="p-5 md:p-6">
                <p className="text-[15px] font-semibold" style={{ color: C.muted }}>
                  {t.role}
                </p>
                <h3 className="text-[22px] font-bold">{t.name}</h3>
                <p className="mt-1">{t.classes}</p>
                <ul className="mt-3 space-y-0.5 text-[16px]" style={{ color: C.muted }}>
                  {t.career.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <p className="mt-4 border-t pt-4" style={{ borderColor: C.line }}>
                  {t.way}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 학원 소개 ---------- */

function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.board, color: C.onBoard }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-2">
        <div>
          <SectionTitle id="about-title">학원 소개</SectionTitle>
          <p className="mt-4" style={{ color: C.onBoardMuted }}>
            2016년 ㅁㄹ시 ㅎㄷ동에서 수학 교습소로 시작해 2021년 영어를 더했습니다. 한 반은 초등 8명, 중등 10명까지 받습니다.
          </p>
          <dl className="mt-6 divide-y text-[16px]" style={{ borderColor: "rgba(238,243,239,0.18)" }}>
            {[
              ["반 편성", "학년과 레벨테스트 점수로 심화반, 정규반, 기초반, 중등은 학교별 내신 대비반을 시험 4주 전에 따로 엽니다."],
              ["확인 테스트", "매 수업 끝 15분, 점수는 그날 보호자 문자로 보냅니다."],
              ["클리닉", "확인 테스트에서 틀린 문제를 수업 없는 날 자습실에서 다시 풉니다."],
              ["자습실", "평일 14:00~22:00, 토 10:00~17:00, 재원생 누구나"],
              ["보강", "결석한 수업은 같은 주 안에 다른 반 수업이나 영상으로 보강합니다."],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[100px_1fr] gap-3 py-3" style={{ borderColor: "rgba(238,243,239,0.18)" }}>
                <dt className="font-semibold">{k}</dt>
                <dd style={{ color: C.onBoardMuted }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="grid grid-cols-2 gap-3 self-start">
          <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-[6px]">
            <Image src={`${IMG}/classroom.jpg`} alt="교복 입은 학생들이 화이트보드 앞 책상에 앉아 있는 강의실" fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
          </div>
          <div className="relative col-span-2 aspect-[16/7] overflow-hidden rounded-[6px]">
            <Image src={`${IMG}/study.jpg`} alt="계산기 옆에서 연습장에 수학 문제를 푸는 손" fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 공지사항 ---------- */

const NOTICES = [
  { ago: 1, title: "11월 레벨테스트 일정", body: "11월은 화, 목 16:00, 17:30, 19:00과 토요일 오전에 봅니다. 홈페이지 레벨테스트 예약이나 전화로 잡아 주세요." },
  { ago: 4, title: "ㄷㅊ중, ㅁㄷ중 2학기 기말고사 대비 일정", body: "시험 4주 전부터 학교별 내신 대비반을 엽니다. 토요일 기출 풀이반(10:00~13:00)은 재원생 누구나 들을 수 있습니다." },
  { ago: 9, title: "2호차 정류장 변경 (ㅁㄷ도서관 앞)", body: "도서관 앞 공사로 2호차 정류장을 도서관 정문에서 맞은편 버스정류장 쪽으로 옮깁니다. 시간은 같습니다." },
  { ago: 15, title: "10월 교습비 납부 안내", body: "교습비는 매달 5일까지 결제 문자 링크나 학원 방문 카드 결제로 냅니다. 형제가 함께 다니면 상담 때 말씀해 주세요." },
  { ago: 26, title: "추석 연휴 휴원", body: "추석 연휴 기간은 쉽니다. 빠진 수업은 연휴 다음 주 토요일에 보강합니다." },
];

function Notices() {
  const today = useDemoToday();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="notice" aria-labelledby="notice-title" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[900px]">
        <SectionTitle id="notice-title">공지사항</SectionTitle>
        <ul className="mt-6 border-t-2" style={{ borderColor: C.ink }}>
          {NOTICES.map((n, i) => {
            const on = open === i;
            return (
              <li key={n.title} className="border-b" style={{ borderColor: C.line }}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={`notice-${i}`}
                    onClick={() => setOpen(on ? null : i)}
                    className="flex min-h-14 w-full items-center gap-3 py-3 text-left"
                  >
                    <span className="flex-1 font-semibold">{n.title}</span>
                    <span className="shrink-0 text-[15px] tabular-nums" style={{ color: C.muted }}>
                      {fmtDot(daysAgo(today, n.ago))}
                    </span>
                    <ChevronDown size={18} aria-hidden className={`shrink-0 transition-transform ${on ? "rotate-180" : ""}`} />
                  </button>
                </h3>
                <div id={`notice-${i}`} hidden={!on} className="pb-5 pr-8" style={{ color: C.muted }}>
                  {n.body}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-4 pb-28 pt-10 md:px-6" style={{ background: C.boardDeep, color: C.onBoardMuted }}>
      <div className="mx-auto max-w-[1200px] text-[15px] leading-[1.8]">
        <span style={{ color: C.onBoard }}>
          <Logo light />
        </span>
        <DemoMakerInfo className="mt-4" />
      </div>
    </footer>
  );
}
