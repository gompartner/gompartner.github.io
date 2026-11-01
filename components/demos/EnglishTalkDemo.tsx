"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  CalendarCheck,
  Car,
  Check,
  Clock,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Phone,
  RotateCcw,
  Sun,
  Sunrise,
  TrainFront,
  Users,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, fmtMD, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 성인 영어회화 학원 홈페이지 샘플: 가상의 영어회화 학원 곰파트너.
   학원명, 강사, 주소, 전화번호, 교습비는 모두 가상이다. 합격, 점수 실적, 수강생 실명과 후기는 넣지 않는다.
   첫 화면 사진 출처: AI 생성(Z-Image-Turbo, Apache 2.0)

   국내 성인 회화 학원 사이트 공통 구성(참고): 메뉴는 학원소개, 강좌안내, 레벨테스트, 시간표, 수강료,
   무료 체험수업, 오시는 길. 첫 화면에는 직장인 새벽반, 저녁반, 주말반 시간과 레벨테스트 바로가기를 크게 둔다.
   관용 문구는 "소수정예", "레벨테스트 후 반 배정", "교재비 별도", "조기 마감될 수 있습니다", "역 도보 3분".
   교습비는 교육지원청에 신고한 월 교습비로 게시하고 환불은 학원법 시행령 기준을 따른다고 적는 게 보통이다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 레벨테스트 예약: 이름, 휴대폰, 희망 날짜와 시간, 지금 실력. 접수 번호와 회신 예정일. 옆에는 레벨 단계 기준표.
   2. 시간표: 새벽반, 저녁반, 주말반 탭과 레벨 칩. 반을 고르면 체험 신청에 그대로 이어진다.
   3. 월 수강료: 주 횟수별 월 교습비 게시표.
   4. 무료 체험 신청: 이름, 휴대폰, 체험 반, 그 반이 열리는 가까운 날짜 3개 중 하나. 접수 번호와 회신 예정일.

   첫 화면(et-poster): 상단 메뉴, 역 출구와 다음 개강일 한 줄, 문장 "출근 전 50분, 새벽 회화반", 레벨테스트 예약과 무료 체험 버튼,
   시간대 세 줄 안내, 강사 4명(원어민 2, 한국인 2) 소개 카드와 맡은 반. 휴대폰에서는 카드가 옆으로 넘어간다(한 장 85% 폭).
   모션은 강사 사진이 1.6초 동안 1.06배에서 제자리로 다가오는 것뿐. 동작 줄이기면 없음. */

const TEL = "02-000-0000";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 5층";
const KAKAO = "카카오톡 채널 영어회화 학원";
const IMG = "/images/demo-english-talk";

const C = {
  accent: "#9b2c2c",
  accentDeep: "#7f2323",
  tint: "#f6eeee",
  bg: "#ffffff",
  alt: "#f7f7f5",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  dark: "#141414",
  error: "#a3141f",
};

/* 모션 상수. 시간은 ms, 이징은 cubic-bezier */
/** 화면 안 전환(탭, 접수 완료) */
const EASE = [0.22, 1, 0.36, 1] as const;

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
/* ---------- 시간표 ---------- */

type Slot = "dawn" | "evening" | "weekend";
const SLOTS: { key: Slot; label: string; time: string; Icon: typeof Sunrise }[] = [
  { key: "dawn", label: "새벽반", time: "평일 07:30~08:20", Icon: Sunrise },
  { key: "evening", label: "저녁반", time: "평일 19:00~21:00", Icon: Moon },
  { key: "weekend", label: "주말반", time: "토, 일 100분", Icon: Sun },
];

type TeacherId = "daniel" | "emma" | "kim" | "park";
interface Teacher {
  id: TeacherId;
  name: string;
  kind: "원어민" | "한국인";
  note: string;
  img: string;
  alt: string;
}
const TEACHER_LIST: Teacher[] = [
  { id: "daniel", name: "Daniel R.", kind: "원어민", note: "Basic, Intermediate 반, 영어로만 진행", img: "teacher-native.jpg", alt: "교실 칠판 앞에서 웃고 있는 남색 니트 차림의 원어민 남성 강사" },
  { id: "emma", name: "Emma K.", kind: "원어민", note: "Intermediate, Upper 반, 회의와 발표 표현", img: "teacher-native-2.jpg", alt: "밝은 회색 벽 앞에서 웃고 있는 하늘색 니트 차림의 원어민 여성 강사" },
  { id: "kim", name: "김ㅎ늘", kind: "한국인", note: "Starter 반, 막히는 표현은 한국어로", img: "teacher-korean.jpg", alt: "교실에서 웃고 있는 흰 블라우스 차림의 한국인 여성 강사" },
  { id: "park", name: "박ㅈ우", kind: "한국인", note: "Starter, Basic 반, 문법 설명은 한국어로", img: "teacher-korean-2.jpg", alt: "회색 벽 앞에서 웃고 있는 남색 카디건 차림의 한국인 남성 강사" },
];
const teacherOf = (id: TeacherId) => TEACHER_LIST.find((t) => t.id === id) ?? TEACHER_LIST[0];

interface Klass {
  id: string;
  slot: Slot;
  level: Level;
  days: number[];
  time: string;
  teacher: TeacherId;
  /** 정원 6명 중 남은 자리 */
  seats: number;
}
const CAP = 6;
const CLASSES: Klass[] = [
  { id: "d-st", slot: "dawn", level: "starter", days: [1, 2, 3, 4, 5], time: "07:30~08:20", teacher: "kim", seats: 3 },
  { id: "d-ba", slot: "dawn", level: "basic", days: [1, 3, 5], time: "07:30~08:20", teacher: "daniel", seats: 2 },
  { id: "d-in", slot: "dawn", level: "inter", days: [2, 4], time: "07:30~08:20", teacher: "daniel", seats: 1 },
  { id: "d-up", slot: "dawn", level: "upper", days: [1, 3, 5], time: "07:30~08:20", teacher: "emma", seats: 0 },
  { id: "e-st", slot: "evening", level: "starter", days: [1, 3], time: "19:00~19:50", teacher: "park", seats: 4 },
  { id: "e-ba", slot: "evening", level: "basic", days: [2, 4], time: "19:00~19:50", teacher: "park", seats: 1 },
  { id: "e-in", slot: "evening", level: "inter", days: [1, 3, 5], time: "20:10~21:00", teacher: "emma", seats: 2 },
  { id: "e-up", slot: "evening", level: "upper", days: [2, 4], time: "20:10~21:00", teacher: "emma", seats: 3 },
  { id: "w-st", slot: "weekend", level: "starter", days: [0], time: "10:00~11:40", teacher: "kim", seats: 5 },
  { id: "w-ba", slot: "weekend", level: "basic", days: [6], time: "10:00~11:40", teacher: "park", seats: 3 },
  { id: "w-in", slot: "weekend", level: "inter", days: [6], time: "13:00~14:40", teacher: "daniel", seats: 2 },
];
const classOf = (id: string) => CLASSES.find((c) => c.id === id) ?? CLASSES[1];
const slotOf = (s: Slot) => SLOTS.find((x) => x.key === s) ?? SLOTS[0];
const daysText = (days: number[]) => (days.length === 5 ? "월~금" : days.map((d) => DOW[d]).join(", "));
const classLabel = (c: Klass) => `${slotOf(c.slot).label} ${levelOf(c.level).name}`;

/* ---------- 월 교습비 (교육지원청 신고 기준으로 가정) ---------- */

interface Fee {
  key: string;
  label: string;
  fee: number;
  hours: string;
}
const FEES: Fee[] = [
  { key: "f5", label: "주 5회 50분", fee: 290000, hours: "월 약 20회" },
  { key: "f3", label: "주 3회 50분", fee: 210000, hours: "월 약 12회" },
  { key: "f2", label: "주 2회 50분", fee: 160000, hours: "월 약 8회" },
  { key: "fw", label: "주말 주 1회 100분", fee: 150000, hours: "월 약 4회" },
];
const BOOK = "교재비 별도(권당 18,000~22,000원)";

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

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.ink }}>
      <Poster reduce={reduce} today={today} go={go} />

      <main className="mx-auto max-w-[1200px] px-4 md:px-6">
        <LevelTest reduce={reduce} today={today} />
        <Schedule
          reduce={reduce}
          slot={slot}
          setSlot={setSlot}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          selected={selected}
          onPick={pick}
          onTrial={() => go("et-trial")}
        />
        <Fees />
        <Trial reduce={reduce} today={today} selected={classOf(selected)} onPick={pick} />
        <Location />
      </main>

      <footer className="mt-16" style={{ background: C.dark, color: "#ededed" }}>
        <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6">
          <p>
            <SampleLogo light size={18} />
          </p>
          <p className="mt-3 text-[15px] leading-[1.7]" style={{ color: "#bdbdbd" }}>
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

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  const mark = size + 8;
  return (
    <span className="inline-flex items-center gap-2 leading-none" style={{ color: light ? "#fff" : "#111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          영어회화 학원
        </span>
      </span>
    </span>
  );
}

/* ---------- 첫 화면: 강사 소개 카드 ---------- */

const NAV: [string, string][] = [
  ["et-schedule", "회화 과정"],
  ["et-test", "레벨테스트"],
  ["et-fee", "수강료"],
  ["et-trial", "무료 체험"],
  ["et-location", "오시는 길"],
];

/** 다음 달 첫 평일 */
function nextOpening(today: Date) {
  let d = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  while (d.getDay() === 0 || d.getDay() === 6) d = daysAgo(d, -1);
  return d;
}

function Poster({ reduce, today, go }: { reduce: boolean; today: Date; go: (id: string) => void }) {
  const [menu, setMenu] = useState(false);
  const navTo = (id: string) => {
    setMenu(false);
    // 메뉴가 닫혀 높이가 줄어든 뒤에 이동한다
    requestAnimationFrame(() => go(id));
  };

  return (
    <section id="et-poster" aria-labelledby="et-poster-title" style={{ background: C.bg }}>
      <style>{`
        @keyframes et-photo-in { from { transform: scale(1.06); } to { transform: none; } }
        .et-photo-in { animation: et-photo-in 1.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) { .et-photo-in { animation: none; } }
      `}</style>

      {/* 상단 메뉴 */}
      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 md:px-6">
          <p>
            <SampleLogo size={18} />
          </p>
          <nav aria-label="주요 메뉴" className="hidden items-center md:flex">
            {NAV.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => navTo(id)}
                className={`min-h-[44px] rounded-[4px] px-3 text-[16px] font-semibold underline-offset-4 hover:underline ${focusRing}`}
                style={{ color: C.ink, outlineColor: C.accent }}
              >
                {label}
              </button>
            ))}
            <a
              href={`tel:${TEL.replace(/-/g, "")}`}
              data-gtm-cta="english-talk_tel"
              className={`ml-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] px-3.5 text-[15px] font-semibold tabular-nums ${focusRing}`}
              style={{ background: C.ink, color: "#fff", outlineColor: C.accent }}
            >
              <Phone size={16} aria-hidden />
              {TEL}
            </a>
          </nav>
          <button
            type="button"
            aria-expanded={menu}
            aria-controls="et-menu"
            aria-label={menu ? "메뉴 닫기" : "메뉴 열기"}
            onClick={() => setMenu((m) => !m)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-[6px] md:hidden ${focusRing}`}
            style={{ outlineColor: C.accent }}
          >
            {menu ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
          </button>
        </div>
        {menu && (
          <nav id="et-menu" aria-label="메뉴" className="border-t md:hidden" style={{ borderColor: C.line }}>
            <ul className="px-4 py-2">
              {NAV.map(([id, label]) => (
                <li key={id} className="border-b last:border-b-0" style={{ borderColor: C.line }}>
                  <button type="button" onClick={() => navTo(id)} className={`flex min-h-[52px] w-full items-center text-left text-[17px] font-semibold ${focusRing}`} style={{ outlineColor: C.accent }}>
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <a href={`tel:${TEL.replace(/-/g, "")}`} className={`flex min-h-[52px] items-center gap-2 text-[17px] font-semibold tabular-nums ${focusRing}`} style={{ outlineColor: C.accent }}>
                  <Phone size={18} aria-hidden />
                  {TEL}
                </a>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* 위치와 개강 한 줄 */}
      <div className="border-b" style={{ background: C.alt, borderColor: C.line }}>
        <p className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2.5 text-[15px] md:px-6">
          <span className="inline-flex items-center gap-1.5">
            <TrainFront size={16} aria-hidden style={{ color: C.accent }} />
            ㅇㅇ역 2번 출구 도보 3분
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarCheck size={16} aria-hidden style={{ color: C.accent }} />
            다음 개강 {fmtKo(nextOpening(today))}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users size={16} aria-hidden style={{ color: C.accent }} />한 반 {CAP}명
          </span>
        </p>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 pb-12 pt-7 md:px-6 md:pt-9">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <h1 id="et-poster-title" className="text-[32px] font-bold leading-[1.2] tracking-[-0.03em] md:text-[44px]" style={{ wordBreak: "keep-all" }}>
            출근 전 50분, 새벽 회화반
          </h1>
          {/* 레벨테스트와 무료 체험. 오른쪽 끝 작은 칸 */}
          <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 md:flex md:w-auto">
            <button
              type="button"
              onClick={() => go("et-test")}
              data-gtm-cta="english-talk_poster_cta"
              className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[6px] px-5 text-[16px] font-bold ${focusRing}`}
              style={{ background: C.accent, color: "#fff", outlineColor: C.accent }}
            >
              <BookOpen size={18} aria-hidden />
              레벨테스트 예약
            </button>
            <button
              type="button"
              onClick={() => go("et-trial")}
              className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[6px] border px-5 text-[16px] font-semibold ${focusRing}`}
              style={{ borderColor: C.ink, color: C.ink, outlineColor: C.accent }}
            >
              <CalendarCheck size={18} aria-hidden />
              무료 체험
            </button>
          </div>
        </div>

        {/* 시간대 안내 */}
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[15px]" aria-label="운영 시간대">
          {SLOTS.map((s) => (
            <li key={s.key} className="inline-flex items-center gap-2">
              <s.Icon size={17} aria-hidden style={{ color: C.accent }} />
              <span className="font-semibold">{s.label}</span>
              <span className="tabular-nums" style={{ color: C.muted }}>
                {s.time}
              </span>
            </li>
          ))}
        </ul>

        {/* 강사 카드 4장. 휴대폰은 옆으로 넘긴다 */}
        <div className="-mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-[repeat(2,minmax(0,1fr))] md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
          {TEACHER_LIST.map((t, i) => {
            const mine = CLASSES.filter((c) => c.teacher === t.id);
            return (
              <article key={t.id} className="w-[85%] flex-none snap-start overflow-hidden rounded-[8px] border md:w-auto" style={{ borderColor: C.line }}>
                <div className="relative aspect-[4/3] overflow-hidden md:aspect-[16/10] lg:aspect-[5/4]" style={{ background: C.alt }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                  <img
                    src={`${IMG}/${t.img}`}
                    alt={t.alt}
                    width={t.img.endsWith("-2.jpg") ? 999 : 900}
                    height={t.img.endsWith("-2.jpg") ? 1200 : 900}
                    loading={i === 0 ? undefined : "lazy"}
                    fetchPriority={i === 0 ? "high" : undefined}
                    className={`absolute inset-0 h-full w-full object-cover ${reduce ? "" : "et-photo-in"}`}
                    style={{ objectPosition: t.img.endsWith("-2.jpg") ? "50% 22%" : "50% 30%" }}
                  />
                </div>
                <div className="p-4">
                  <h2 className="flex flex-wrap items-baseline gap-x-2 text-[19px] font-bold">
                    {t.name}
                    <span className="text-[14px] font-semibold" style={{ color: C.muted }}>
                      {t.kind} 강사
                    </span>
                  </h2>
                  <p className="mt-0.5 text-[15px]" style={{ color: C.body, wordBreak: "keep-all" }}>
                    {t.note}
                  </p>
                  <ul className="mt-3 divide-y border-t" style={{ borderColor: C.line }}>
                    {mine.map((c) => (
                      <li key={c.id} className="py-2" style={{ borderColor: C.line }}>
                        <span className="block text-[15px] font-semibold">{classLabel(c)}</span>
                        <span className="block text-[14px] tabular-nums" style={{ color: C.muted }}>
                          {daysText(c.days)} {c.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


/* ---------- 구역 제목 ---------- */

function SectionHead({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <h2 id={`${id}-title`} className="text-[26px] font-bold leading-tight tracking-[-0.03em] md:text-[34px]">
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ---------- 1. 레벨테스트 신청 ---------- */

const TEST_TIMES = ["07:00", "12:30", "18:30", "20:00"];

interface TestReceipt {
  no: string;
  name: string;
  phone: string;
  date: Date;
  time: string;
  level: string;
  reply: Date;
}

function LevelTest({ reduce, today }: { reduce: boolean; today: Date }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateIdx, setDateIdx] = useState(0);
  const [time, setTime] = useState(TEST_TIMES[2]);
  const [level, setLevel] = useState("모름");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<TestReceipt | null>(null);

  const dates = useMemo(() => nextClassDates(today, [1, 2, 3, 4, 5, 6], 6), [today]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) return setError("이름을 2글자 이상 적어 주세요.");
    if (!/^01\d{8,9}$/.test(digits)) return setError("휴대폰 번호를 확인해 주세요.");
    if (!agree) return setError("개인정보 수집에 동의해 주세요.");
    setError(null);
    const n = String(Math.floor(Math.random() * 900) + 100);
    setReceipt({
      no: `LT-${fmtMD(today).replace(".", "")}-${n}`,
      name: name.trim(),
      phone: digits,
      date: dates[dateIdx],
      time,
      level,
      reply: nextWeekday(today),
    });
  };

  const reset = () => {
    setReceipt(null);
    setName("");
    setPhone("");
    setAgree(false);
    setDateIdx(0);
    setLevel("모름");
  };

  const field = `mt-1.5 w-full rounded-[8px] border px-3.5 py-3 text-[16px] ${focusRing}`;
  const fieldStyle = { borderColor: C.line, background: "#fff", outlineColor: C.accent };

  return (
    <section id="et-test" aria-labelledby="et-test-title" className="scroll-mt-4 pt-14">
      <SectionHead id="et-test" title="레벨테스트 예약">
        <p className="text-[15px]" style={{ color: C.muted }}>
          방문 20분, 무료
        </p>
      </SectionHead>

      <div className="mt-5 grid gap-5 md:grid-cols-[1.25fr_1fr]">
        <div className="rounded-[8px] border" style={{ borderColor: C.line, background: "#fff" }}>
          <AnimatePresence mode="wait" initial={false}>
            {receipt ? (
              <motion.div
                key="done"
                className="px-5 py-6 md:px-7"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
                role="status"
              >
                <p className="inline-flex items-center gap-2 text-[15px] font-semibold" style={{ color: C.accent }}>
                  <Check size={18} aria-hidden />
                  레벨테스트 예약이 접수됐어요
                </p>
                <p className="mt-2 text-[26px] font-bold leading-tight tracking-[-0.02em]">
                  {fmtKo(receipt.date)} {receipt.time}
                </p>
                <dl className="mt-5 grid gap-x-6 gap-y-2.5 text-[16px] sm:grid-cols-[120px_1fr]">
                  <dt style={{ color: C.muted }}>접수 번호</dt>
                  <dd className="font-semibold tabular-nums">{receipt.no}</dd>
                  <dt style={{ color: C.muted }}>신청자</dt>
                  <dd>
                    {maskName(receipt.name)}, {maskPhone(receipt.phone)}
                  </dd>
                  <dt style={{ color: C.muted }}>지금 실력</dt>
                  <dd>{receipt.level}</dd>
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
                  className={`mt-6 inline-flex items-center gap-2 rounded-[6px] border px-5 py-2.5 text-[15px] font-semibold ${focusRing}`}
                  style={{ borderColor: "#cfcfcf", outlineColor: C.accent }}
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
                className="grid gap-5 px-5 py-6 sm:grid-cols-2 md:px-7"
                initial={false}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transition: { duration: 0.16 } }}
              >
                <label className="block text-[15px] font-semibold">
                  이름
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={fieldStyle} />
                </label>
                <label className="block text-[15px] font-semibold">
                  휴대폰
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={field} style={fieldStyle} />
                </label>
                <label className="block text-[15px] font-semibold">
                  희망 날짜
                  <select value={dateIdx} onChange={(e) => setDateIdx(Number(e.target.value))} className={field} style={fieldStyle}>
                    {dates.map((d, k) => (
                      <option key={d.getTime()} value={k}>
                        {fmtKo(d)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-[15px] font-semibold">
                  희망 시간
                  <select value={time} onChange={(e) => setTime(e.target.value)} className={field} style={fieldStyle}>
                    {TEST_TIMES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-[15px] font-semibold sm:col-span-2">
                  지금 실력
                  <select value={level} onChange={(e) => setLevel(e.target.value)} className={field} style={fieldStyle}>
                    <option value="모름">잘 모르겠어요</option>
                    {LEVELS.map((l) => (
                      <option key={l.key} value={`${l.name} ${l.ko}`}>
                        {l.name} {l.ko}, {l.can}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="sm:col-span-2">
                  <label className="inline-flex cursor-pointer items-start gap-2.5 text-[15px]">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-[18px] w-[18px] accent-[#9b2c2c]" />
                    <span>
                      개인정보 수집, 이용 동의(필수)
                      <span className="block text-[14px]" style={{ color: C.muted }}>
                        이름, 휴대폰 번호. 예약 연락에만 쓰고 3개월 뒤 지워요.
                      </span>
                    </span>
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                  <button
                    type="submit"
                    data-gtm-cta="english-talk_test_submit"
                    className={`inline-flex items-center gap-2 rounded-[6px] px-6 py-3.5 text-[17px] font-semibold ${focusRing}`}
                    style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}
                  >
                    <BookOpen size={19} aria-hidden />
                    레벨테스트 예약하기
                  </button>
                  <p aria-live="polite" className="text-[15px] font-bold" style={{ color: C.error }}>
                    {error}
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* 레벨 단계 */}
        <ol className="grid content-start gap-2" aria-label="레벨 단계">
          {LEVELS.map((l) => (
            <li key={l.key} className="flex items-start gap-3 rounded-[8px] border px-4 py-3" style={{ borderColor: C.line, background: "#fff" }}>
              <span className="mt-0.5 w-[116px] shrink-0 whitespace-nowrap text-[15px] font-bold md:w-[128px] md:text-[17px]">{l.name}</span>
              <span className="text-[15px] leading-[1.55]" style={{ color: C.body }}>
                <span className="font-semibold" style={{ color: C.ink }}>
                  {l.ko}
                </span>{" "}
                {l.can}
              </span>
            </li>
          ))}
          <li className="px-1 pt-2 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
            강사와 1:1 말하기 10분, 짧은 듣기 문항으로 레벨을 정하고 맞는 반을 안내해 드려요.
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
  selected,
  onPick,
  onTrial,
}: {
  reduce: boolean;
  slot: Slot;
  setSlot: (s: Slot) => void;
  levelFilter: Level | "all";
  setLevelFilter: (l: Level | "all") => void;
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
              className={`inline-flex items-center gap-2 rounded-[6px] border px-4 py-2.5 text-[16px] ${on ? "font-semibold" : ""} ${focusRing}`}
              style={{ borderColor: on ? C.ink : C.line, background: on ? C.ink : "#fff", color: on ? "#fff" : C.ink, outlineColor: C.accent }}
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
              style={{ borderColor: on ? C.accent : C.line, color: on ? C.accent : C.body, fontWeight: on ? 600 : 400, background: on ? C.tint : "#fff", outlineColor: C.accent }}
            >
              {k === "all" ? "전체 레벨" : levelOf(k).name}
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((c) => {
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
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transition: { duration: 0.16 } }}
                transition={{ duration: reduce ? 0 : 0.24, ease: EASE }}
                className={`relative flex flex-col items-start rounded-[8px] border px-4 pb-4 pt-3.5 text-left disabled:cursor-not-allowed ${focusRing}`}
                style={{
                  borderColor: on ? C.accent : C.line,
                                    background: full ? C.alt : on ? C.tint : "#fff",
                  outlineColor: C.accent,
                }}
              >
                <span className="text-[19px] font-bold">{levelOf(c.level).name}</span>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[16px]">
                  <Clock size={15} aria-hidden style={{ color: C.accent }} />
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
                        style={{ background: has ? C.ink : "transparent", color: has ? "#fff" : C.muted, fontWeight: has ? 700 : 400, border: has ? "none" : `1px solid ${C.line}` }}
                      >
                        {DOW[d]}
                      </span>
                    );
                  })}
                </span>
                <span className="mt-3 flex w-full items-center justify-between text-[15px]" style={{ color: C.muted }}>
                  <span className="inline-flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                    <img src={`${IMG}/${teacherOf(c.teacher).img}`} alt="" loading="lazy" width={36} height={36} className="h-9 w-9 flex-none rounded-full object-cover" style={{ objectPosition: "50% 25%" }} />
                    {teacherOf(c.teacher).name}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold" style={{ color: full ? C.muted : C.ink }}>
                    <Users size={14} aria-hidden />
                    {full ? "마감" : `남은 자리 ${c.seats}`}
                  </span>
                </span>
                {on && (
                  <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-bold" style={{ color: C.accent }}>
                    <Check size={15} aria-hidden />
                    고른 반
                  </span>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
        {list.length === 0 && (
          <p className="rounded-[8px] border px-4 py-5 text-[15px] sm:col-span-2" style={{ borderColor: C.line, color: C.muted }}>
            {slotOf(slot).label}에는 이 레벨 반이 없어요. 다른 시간대를 눌러 보세요.
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[8px] px-4 py-3" style={{ background: C.ink, color: "#fff" }}>
        <p className="text-[16px]">
          <span className="font-bold">{classLabel(sel)}</span> {daysText(sel.days)} {sel.time}
        </p>
        <button
          type="button"
          onClick={onTrial}
          className={`inline-flex items-center gap-2 rounded-[6px] px-4 py-2 text-[15px] font-semibold ${focusRing}`}
          style={{ background: "#fff", color: C.accent, outlineColor: "#fff" }}
        >
          <CalendarCheck size={16} aria-hidden />이 반 무료 체험
        </button>
      </div>
    </section>
  );
}

/* ---------- 3. 월 수강료 ---------- */

function Fees() {
  return (
    <section id="et-fee" aria-labelledby="et-fee-title" className="scroll-mt-4 pt-16">
      <SectionHead id="et-fee" title="월 수강료" />

      <div className="mt-5 overflow-x-auto rounded-[8px] border" style={{ borderColor: C.line, background: "#fff" }}>
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
            {FEES.map((f) => (
              <tr key={f.key} className="border-b last:border-b-0" style={{ borderColor: C.line }}>
                <th scope="row" className="px-4 py-3.5 font-bold">
                  {f.label}
                </th>
                <td className="whitespace-nowrap px-2 py-3.5" style={{ color: C.muted }}>
                  {f.hours}
                </td>
                <td className="px-4 py-3.5 text-right font-bold tabular-nums">{won(f.fee)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="flex items-center gap-1.5 px-4 pb-3 text-[14px]" style={{ color: C.muted }}>
          <BookOpen size={14} aria-hidden />
          {BOOK}
        </p>
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
}: {
  reduce: boolean;
  today: Date;
  selected: Klass;
  onPick: (id: string) => void;
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

      <div className="mt-5 rounded-[8px] border" style={{ borderColor: C.line, background: "#fff" }}>
        <AnimatePresence mode="wait" initial={false}>
          {receipt ? (
            <motion.div
              key="done"
              className="px-5 py-6 md:px-8 md:py-8"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
              role="status"
            >
              <p className="inline-flex items-center gap-2 text-[15px] font-semibold" style={{ color: C.accent }}>
                <Check size={18} aria-hidden />
                체험 신청이 접수됐어요
              </p>
              <p className="mt-2 text-[26px] font-bold leading-tight tracking-[-0.02em] md:text-[32px]">
                {fmtKo(receipt.date)} {receipt.klass.time.split("~")[0]}
              </p>
              <dl className="mt-5 grid gap-x-6 gap-y-2.5 text-[16px] sm:grid-cols-[120px_1fr]">
                <dt style={{ color: C.muted }}>접수 번호</dt>
                <dd className="font-semibold tabular-nums">
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
                className={`mt-6 inline-flex items-center gap-2 rounded-[6px] border px-5 py-2.5 text-[15px] font-semibold ${focusRing}`}
                style={{ borderColor: "#cfcfcf", outlineColor: C.accent }}
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
              <label className="block text-[15px] font-semibold">
                이름
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={{ borderColor: C.line, background: "#fff", outlineColor: C.accent }} />
              </label>
              <label className="block text-[15px] font-semibold">
                휴대폰
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="010-0000-0000"
                  className={field}
                  style={{ borderColor: C.line, background: "#fff", outlineColor: C.accent }}
                />
              </label>
              <label className="block text-[15px] font-semibold">
                체험할 반
                <select
                  value={selected.id}
                  onChange={(e) => {
                    onPick(e.target.value);
                    setDateIdx(0);
                  }}
                  className={field}
                  style={{ borderColor: C.line, background: "#fff", outlineColor: C.accent }}
                >
                  {open.map((c) => (
                    <option key={c.id} value={c.id}>
                      {classLabel(c)} ({daysText(c.days)} {c.time})
                    </option>
                  ))}
                </select>
              </label>
              <fieldset>
                <legend className="text-[15px] font-semibold">체험 날짜</legend>
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
                        style={{ borderColor: on ? C.accent : C.line, background: on ? C.tint : "#fff", fontWeight: on ? 700 : 400, outlineColor: C.accent }}
                      >
                        {fmtKo(d)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="md:col-span-2">
                <label className="inline-flex cursor-pointer items-start gap-2.5 text-[15px]">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-[18px] w-[18px] accent-[#9b2c2c]" />
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
                  className={`inline-flex items-center gap-2 rounded-[6px] px-6 py-3.5 text-[17px] font-semibold ${focusRing}`}
                  style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}
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
        <svg viewBox="0 0 520 300" className="h-auto w-full rounded-[8px] border" style={{ borderColor: C.line }} role="img" aria-label="ㅇㅇ역 2번 출구에서 큰길을 따라 걸어 3분 거리에 학원 건물이 있는 약도">
          <rect width="520" height="300" fill="#f2f2f0" />
          <rect x="0" y="128" width="520" height="44" fill="#ffffff" />
          <rect x="300" y="0" width="34" height="300" fill="#ffffff" />
          <path d="M0 150 H520 M317 0 V300" stroke="#dedede" strokeWidth="2" strokeDasharray="10 10" />
          {[
            [30, 30, 110, 76],
            [160, 26, 110, 80],
            [30, 196, 120, 80],
            [180, 200, 90, 72],
            [364, 196, 130, 82],
            [364, 24, 60, 82],
          ].map(([x, y, w, h], k) => (
            <rect key={k} x={x} y={y} width={w} height={h} rx="4" fill="#e4e4e2" />
          ))}
          {/* 학원 건물 */}
          <rect x="436" y="24" width="64" height="82" rx="4" fill={C.accent} />
          <text x="468" y="72" textAnchor="middle" fontSize="15" fill={"#fff"} fontWeight="700">
            5층
          </text>
          {/* 역 출구 */}
          <circle cx="96" cy="150" r="17" fill={C.ink} />
          <text x="96" y="156" textAnchor="middle" fontSize="16" fill={"#fff"} fontWeight="700">
            2
          </text>
          <path d="M118 150 H450 V112" fill="none" stroke={C.accent} strokeWidth="4" strokeDasharray="2 9" strokeLinecap="round" />
          <text x="96" y="194" textAnchor="middle" fontSize="15" fill={C.ink}>
            ㅇㅇ역
          </text>
          <text x="250" y="122" fontSize="14" fill={C.muted}>
            도보 3분
          </text>
        </svg>
        <ul className="grid content-start gap-3 text-[16px] leading-[1.6]">
          <li className="flex gap-2.5">
            <MapPin size={19} aria-hidden className="mt-0.5 shrink-0" style={{ color: C.accent }} />
            {ADDRESS}
          </li>
          <li className="flex gap-2.5">
            <TrainFront size={19} aria-hidden className="mt-0.5 shrink-0" style={{ color: C.accent }} />
            ㅇㅇ역 2번 출구 도보 3분
          </li>
          <li className="flex gap-2.5">
            <Car size={19} aria-hidden className="mt-0.5 shrink-0" style={{ color: C.accent }} />
            건물 주차 1시간 지원(새벽반은 07:00부터 입차)
          </li>
          <li className="flex gap-2.5">
            <Clock size={19} aria-hidden className="mt-0.5 shrink-0" style={{ color: C.accent }} />
            상담 평일 07:00~21:30, 토 09:30~15:00, 일 09:30~12:00
          </li>
          <li className="flex gap-2.5">
            <MessageCircle size={19} aria-hidden className="mt-0.5 shrink-0" style={{ color: C.accent }} />
            {KAKAO}
          </li>
        </ul>
      </div>
    </section>
  );
}
