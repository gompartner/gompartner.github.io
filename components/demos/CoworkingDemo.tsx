"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Building2, Car, Check, Clock, Coffee, Mail, Minus, Plus, Printer, TrainFront, Users, Wifi } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 공유오피스 지점 홈페이지 샘플: 가상의 곰파트너 공유오피스 한 지점. 상호, 주소, 이름은 모두 가상이다.

   국내 공유오피스 지점 페이지(패스트파이브, 스파크플러스, 위워크 지점 소개)의 공통 구성을 따른다.
   메뉴는 공간 소개, 멤버십 요금, 회의실, 입주 혜택, 투어 신청, 오시는 길. 첫 화면에 지점 사진과 투어 신청 버튼.
   요금은 자유석, 지정석, 1인실, 4인실처럼 좌석 유형별 월 요금(부가세 별도)과 계약 기간 할인.
   회의실은 멤버 무료 크레딧 시간, 혜택은 사업자등록 주소 제공, 24시간 출입, 우편물 수령, 커피 무제한, 복합기, 주차가 관용 항목.
   오시는 길은 역 출구와 도보 시간, 주차, 운영시간.

   첫 화면의 지점 사진 자리에 실시간 좌석 평면도를 둔다. 좌석 점유가 몇 초마다 한두 자리씩 바뀌고
   옆 "지금 빈 자리" 숫자가 세로로 굴러 바뀐다. 롤링 숫자는 이 숫자판 한 곳에만 쓰고 요금은 바로 바뀐다.
   빈 자리는 테두리만, 찬 자리는 채움으로 색과 모양을 같이 구분한다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 좌석 유형 고르기: 자유석, 지정석, 1인실, 4인실 중 하나를 누르거나 평면도의 자리를 직접 누르면 그 유형만 밝아진다.
   2. 요금 계산: 기간(1, 3, 6, 12개월), 인원, 추가 옵션을 고르면 월 요금과 총액이 바로 바뀐다.
   3. 회의실 예약 현황: 회의실 2곳의 오늘 시간대 막대(09~21시). 빈 시간을 누르면 예약 가능 표시.
   4. 투어 신청: 날짜(오늘부터 7일, 평일만), 시간, 이름, 휴대폰, 인원. 접수 완료 화면에 접수번호, 담당 창구, 회신 예정일.
   5. 입주 혜택과 오시는 길: 역에서 걷는 시간, 주차, 운영시간. 오늘 요일 진하게.

   포스터 첫 화면(cw-poster): 공유오피스 라운지 사진 한 장이 화면을 채우고, 아래 왼쪽에 문장 "오늘 하루만 앉아도 돼요".
   들어올 때 사진이 1.06배에서 1배로 1.6초 동안 다가오고, 문장은 0.3초 뒤 12px 아래에서 올라온다(CSS keyframes).
   스크롤하면 사진만 조금 느리게 움직인다. 좌석이 바뀔 때 튀던 효과는 빼고 색만 천천히 바뀐다.

   사진 출처: Pexels 사진 36356065 */

const BRAND = "곰파트너";
const BRANCH = "ㅇㅇ역점";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, ㅇㅇ빌딩 5층";
const KAKAO = "카카오톡 채널 곰파트너";

/** 모션 공통 곡선 */
const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
/** 숫자 한 자리가 굴러가는 시간 (ms) */
const ROLL_MS = 320;
/** 좌석 색이 바뀌고 한 번 튀는 시간 (ms) */
const SEAT_MS = 400;
/** 좌석 점유가 바뀌는 간격 (ms) */
const TICK_MS = 2600;

/* 색: 바탕은 흰색과 옅은 회색, 강조색은 짙은 청록 하나만 버튼, 선택 칩, 사용 중 좌석에 쓴다. */
const C = {
  ink: "#111111",
  accent: "#2c4f58",
  inkSoft: "#eaeff0",
  text: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  edge: "#d0d0d0",
  paper: "#f7f7f5",
  error: "#b42318",
};

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/* ---------- 좌석 데이터 ---------- */

type SeatType = "자유석" | "지정석" | "1인실" | "4인실";
const TYPES: SeatType[] = ["자유석", "지정석", "1인실", "4인실"];

/** 월 요금(부가세 별도). 서울 공유오피스 시세 기준 */
const PRICE: Record<SeatType, number> = { 자유석: 250000, 지정석: 350000, "1인실": 600000, "4인실": 1600000 };
/** 인원 상한. 자유석과 지정석은 인원수대로 요금, 1인실은 1명, 4인실은 4명까지 같은 요금 */
const MAX_PEOPLE: Record<SeatType, number> = { 자유석: 6, 지정석: 6, "1인실": 1, "4인실": 4 };
const PER_PERSON: Record<SeatType, boolean> = { 자유석: true, 지정석: true, "1인실": false, "4인실": false };
const TYPE_NOTE: Record<SeatType, string> = {
  자유석: "라운지와 공용 테이블 어디든, 짐은 개인 사물함에",
  지정석: "내 자리 고정, 모니터와 서랍 포함, 24시간 출입",
  "1인실": "문 닫히는 1인 공간, 사업자등록 주소 제공 포함",
  "4인실": "4인까지 같은 요금, 회의실 크레딧 월 20시간",
};

const TERMS = [
  { months: 1, off: 0 },
  { months: 3, off: 0.05 },
  { months: 6, off: 0.1 },
  { months: 12, off: 0.15 },
] as const;

const OPTIONS = [
  { id: "biz", label: "사업자등록 주소 제공", price: 33000 },
  { id: "allday", label: "24시간 출입", price: 22000 },
  { id: "mail", label: "우편물 수령", price: 11000 },
] as const;
type OptionId = (typeof OPTIONS)[number]["id"];

interface Unit {
  id: string;
  type: SeatType;
  n: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 평면도 좌표(viewBox 720 x 450). 왼쪽 자유석과 지정석, 오른쪽 1인실, 4인실, 회의실 */
function makeUnits(): Unit[] {
  const u: Unit[] = [];
  // 자유석: 긴 테이블 두 개, 위아래 4자리씩
  [
    [50, 98],
    [132, 180],
  ].forEach(([top, bottom], t) => {
    for (let i = 0; i < 4; i++) {
      u.push({ id: `free-${t * 8 + i + 1}`, type: "자유석", n: t * 8 + i + 1, x: 58 + i * 68, y: top, w: 24, h: 18 });
      u.push({ id: `free-${t * 8 + i + 5}`, type: "자유석", n: t * 8 + i + 5, x: 58 + i * 68, y: bottom, w: 24, h: 18 });
    }
  });
  // 지정석: 3줄 x 4개 책상
  [252, 306, 360].forEach((y, r) => {
    [44, 116, 188, 260].forEach((x, c) => {
      const n = r * 4 + c + 1;
      u.push({ id: `fixed-${n}`, type: "지정석", n, x, y, w: 56, h: 34 });
    });
  });
  // 1인실: 작은 방 6개
  [380, 434, 488, 542, 596, 650].forEach((x, i) => {
    u.push({ id: `solo-${i + 1}`, type: "1인실", n: i + 1, x, y: 52, w: 46, h: 76 });
  });
  // 4인실: 방 4개
  [380, 460, 540, 620].forEach((x, i) => {
    u.push({ id: `quad-${i + 1}`, type: "4인실", n: i + 1, x, y: 172, w: 72, h: 100 });
  });
  return u;
}
const UNITS = makeUnits();

/** 자리가 바뀔 때 뽑는 주머니. 자유석이 가장 자주 바뀐다 */
const POOL = UNITS.flatMap((u, i) => Array<number>(u.type === "자유석" ? 3 : u.type === "지정석" ? 2 : 1).fill(i));

function hash(a: number, b: number) {
  let h = (a + 11) * 2654435761 + (b + 7) * 40503;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 1000;
  return h;
}

/** 처음 점유 상태. 서버 렌더와 같아야 하므로 난수 대신 해시 */
const BUSY: Record<SeatType, number> = { 자유석: 560, 지정석: 760, "1인실": 830, "4인실": 750 };
const INITIAL_OCC = UNITS.map((u, i) => hash(i, 3) < BUSY[u.type]);

/* ---------- 회의실 ---------- */

const ROOMS = [
  { id: "A", name: "회의실 A", cap: 6 },
  { id: "B", name: "회의실 B", cap: 10 },
] as const;
const HOURS = Array.from({ length: 12 }, (_, i) => 9 + i);
/** 오늘 이미 예약된 시간. 점심 전후가 먼저 찬다 */
function roomTaken(room: number, hour: number) {
  const mid = hour >= 13 && hour <= 16 ? 350 : hour >= 10 && hour <= 12 ? 200 : 0;
  return hash(room * 31 + hour, 5) < 280 + mid;
}

/* ---------- 투어 ---------- */

const TOUR_TIMES = ["10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const isWeekday = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5;
function nextBusinessDay(from: Date) {
  let d = daysAgo(from, -1);
  while (!isWeekday(d)) d = daysAgo(d, -1);
  return d;
}

/* ---------- 롤링 숫자 ---------- */

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Digit({ d, reduce }: { d: number; reduce: boolean }) {
  return (
    <span className="relative inline-block h-[1em] w-[1ch] overflow-hidden align-baseline">
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: `${-d * 10}%` }}
        transition={reduce ? { duration: 0 } : { duration: ROLL_MS / 1000, ease: EASE }}
      >
        {DIGITS.map((n) => (
          <span key={n} className="block h-[1em] leading-none">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** 자리마다 세로로 굴러가는 숫자. 자릿수가 바뀌면 왼쪽에 자리가 더해진다 */
function Roll({ value, reduce, className = "", style }: { value: number; reduce: boolean; className?: string; style?: CSSProperties }) {
  const s = value.toLocaleString("ko-KR");
  const chars = [...s];
  return (
    <span className={`inline-flex leading-none ${className}`} style={style}>
      <span className="sr-only">{s}</span>
      <span aria-hidden className="inline-flex leading-none">
        {chars.map((ch, i) => {
          const k = chars.length - i;
          return /\d/.test(ch) ? (
            <Digit key={`d${k}`} d={Number(ch)} reduce={reduce} />
          ) : (
            <span key={`c${k}`} className="inline-block h-[1em] leading-none">
              {ch}
            </span>
          );
        })}
      </span>
    </span>
  );
}

/* ---------- 메인 ---------- */

export function CoworkingDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [occ, setOcc] = useState<boolean[]>(INITIAL_OCC);
  const [selected, setSelected] = useState<SeatType | null>(null);

  // 몇 초마다 한두 자리가 들고 난다. 실제로는 출입 게이트나 좌석 예약 시스템에서 읽는다.
  useEffect(() => {
    const id = window.setInterval(() => {
      const count = Math.random() < 0.4 ? 2 : 1;
      const picks = new Set<number>();
      while (picks.size < count) picks.add(POOL[Math.floor(Math.random() * POOL.length)]);
      setOcc((prev) => {
        const next = [...prev];
        picks.forEach((i) => {
          next[i] = !next[i];
        });
        return next;
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const free: Record<SeatType, number> = { 자유석: 0, 지정석: 0, "1인실": 0, "4인실": 0 };
  UNITS.forEach((u, i) => {
    if (!occ[i]) free[u.type] += 1;
  });
  const totalFree = TYPES.reduce((s, t) => s + free[t], 0);

  const pickType = (t: SeatType) => setSelected((s) => (s === t ? null : t));
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const NAV = [
    ["cw-plan", "공간 소개"],
    ["cw-price", "멤버십 요금"],
    ["cw-rooms", "회의실"],
    ["cw-perks", "입주 혜택"],
    ["cw-tour", "투어 신청"],
    ["cw-map", "오시는 길"],
  ] as const;

  return (
    <div className="min-h-screen overflow-x-clip bg-white" style={{ color: C.text }}>
      <Poster reduce={reduce} onCta={() => go("cw-tour")} />

      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-[2px]" style={{ borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <a href="#cw-plan" onClick={(e) => (e.preventDefault(), go("cw-plan"))} className={`inline-flex items-center gap-2 rounded-[4px] ${focusRing}`} style={{ color: C.ink, outlineColor: C.accent }}>
            <SampleLogo />
          </a>
          <nav aria-label="페이지 안 이동" className="-mx-4 min-w-0 flex-1 overflow-x-auto px-4 md:mx-0 md:flex md:justify-end md:px-0">
            <ul className="flex gap-1 whitespace-nowrap text-[14px] font-bold">
              {NAV.map(([id, label]) => (
                <li key={id}>
                  <button type="button" onClick={() => go(id)} className={`rounded-[4px] px-2.5 py-1.5 hover:underline hover:underline-offset-4 ${focusRing}`} style={{ color: C.ink, outlineColor: C.accent }}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <button type="button" onClick={() => go("cw-tour")} className={`hidden flex-none rounded-[4px] px-4 py-2 text-[14px] font-semibold text-white md:inline-flex ${focusRing}`} style={{ background: C.accent, outlineColor: C.accent }}>
            투어 신청
          </button>
        </div>
      </header>

      {/* 첫 화면: 실시간 좌석 평면도와 빈 자리 숫자판 */}
      <section id="cw-plan" aria-labelledby="cw-title" className="mx-auto max-w-[1200px] scroll-mt-16 px-4 pt-8 md:px-6 md:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2 className="text-[30px] font-bold leading-[1.2] md:text-[40px]" style={{ color: C.ink }} id="cw-title">
            {BRAND} {BRANCH}
          </h2>
          <p className="text-[15px]" style={{ color: C.muted }}>
            {ADDRESS}, ㅇㅇ역 3번 출구 도보 4분
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">
          <div className="rounded-[6px] border p-2 md:p-3" style={{ borderColor: C.line, backgroundColor: C.paper }}>
            <FloorPlan occ={occ} selected={selected} reduce={reduce} onPick={pickType} />
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 px-1 text-[13px]" style={{ color: C.muted }}>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="inline-block h-3.5 w-3.5 rounded-[3px] border bg-white" style={{ borderColor: C.edge }} />
                빈 자리
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="inline-block h-3.5 w-3.5 rounded-[3px]" style={{ background: C.accent }} />
                사용 중
              </span>
              <span className="ml-auto">
                {fmtKo(today)} 평일 09:00~21:00
              </span>
            </div>
          </div>

          <aside id="cw-count" aria-label="지금 빈 자리" className="rounded-[6px] border p-5" style={{ borderColor: C.line }}>
            <p className="text-[15px] font-bold" style={{ color: C.muted }}>
              지금 빈 자리
            </p>
            <p className="mt-1 flex items-baseline gap-2" style={{ color: C.ink }}>
              <Roll value={totalFree} reduce={reduce} className="text-[64px] font-semibold md:text-[72px]" />
              <span className="text-[18px]">
                / {UNITS.length}
              </span>
            </p>
            <ul className="mt-4 divide-y" style={{ borderColor: C.line }}>
              {TYPES.map((t) => {
                const total = UNITS.filter((u) => u.type === t).length;
                const on = selected === t;
                return (
                  <li key={t} style={{ borderColor: C.line }}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => pickType(t)}
                      className={`flex w-full items-center justify-between gap-3 rounded-[4px] px-2 py-2.5 text-left transition-colors duration-150 ${focusRing}`}
                      style={{ background: on ? C.inkSoft : "transparent", color: on ? C.accent : C.text, outlineColor: C.accent }}
                    >
                      <span className="inline-flex items-center gap-2 text-[16px] font-bold">
                        <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: on ? C.accent : "transparent", border: `1.5px solid ${C.accent}` }} />
                        {t}
                      </span>
                      <span className="inline-flex items-baseline gap-1 text-[18px]">
                        <Roll value={free[t]} reduce={reduce} className="font-semibold" />
                        <span className="text-[13px]" style={{ color: on ? C.ink : C.muted }}>
                          / {total}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 min-h-[44px] text-[14px] leading-[1.6]" style={{ color: C.muted }}>
              {selected ? TYPE_NOTE[selected] : "평일 09:00~21:00, 멤버는 24시간 출입. 회의실 2곳."}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => go("cw-price")} className={`rounded-[4px] border px-3 py-2.5 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.edge, color: C.ink, outlineColor: C.accent }}>
                요금 보기
              </button>
              <button type="button" onClick={() => go("cw-tour")} data-gtm-cta="coworking_tour_top" className={`rounded-[4px] px-3 py-2.5 text-[15px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.accent }}>
                투어 신청
              </button>
            </div>
          </aside>
        </div>
      </section>

      {/* 멤버십 요금 */}
      <section id="cw-price" aria-labelledby="cw-price-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-16 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cw-price-title">멤버십 요금</SectionTitle>
        <PriceCalc selected={selected} onType={(t) => setSelected(t)} onTour={() => go("cw-tour")} />
      </section>

      {/* 회의실 */}
      <section id="cw-rooms" aria-labelledby="cw-rooms-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-16 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cw-rooms-title">회의실</SectionTitle>
        <RoomBoard today={today} />
      </section>

      {/* 입주 혜택 */}
      <section id="cw-perks" aria-labelledby="cw-perks-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-16 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cw-perks-title">입주 혜택</SectionTitle>
        <Perks />
      </section>

      {/* 투어 신청 */}
      <section id="cw-tour" aria-labelledby="cw-tour-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-16 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cw-tour-title">투어 신청</SectionTitle>
        <TourForm today={today} reduce={reduce} selected={selected} />
      </section>

      {/* 오시는 길 */}
      <section id="cw-map" aria-labelledby="cw-map-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-16 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cw-map-title">오시는 길</SectionTitle>
        <Directions today={today} />
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 py-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted }}>
        <p>
          <SampleLogo />
        </p>
        <p>
          {BRANCH}, {ADDRESS}
        </p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

/* ---------- 포스터 첫 화면 ---------- */

const IMG = "/images/demo-coworking";

/* 포스터 모션(ms). 사진 다가오기 1600, 문장은 300 늦게 700 동안 12px 올라오며 나타난다(CSS keyframes, 끝 상태가 기본값).
   스크롤하면 사진만 포스터 높이의 8%까지 느리게 내려간다. 동작 줄이기면 모두 끈다. */
const HERO_IN_MS = 1600;
const HERO_TEXT_DELAY_MS = 300;
const HERO_TEXT_MS = 700;
const HERO_PARALLAX = 8;

const HERO_CSS = `
@keyframes cw-hero-in { from { transform: scale(1.06); } }
@keyframes cw-hero-rise { from { opacity: 0; transform: translateY(12px); } }
.cw-hero-photo { animation: cw-hero-in ${HERO_IN_MS}ms ${EASE_CSS} both; }
.cw-hero-rise { animation: cw-hero-rise ${HERO_TEXT_MS}ms ${EASE_CSS} ${HERO_TEXT_DELAY_MS}ms both; }
@media (prefers-reduced-motion: reduce) { .cw-hero-photo, .cw-hero-rise { animation: none; } }
`;

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const wrapRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, (v) => `${v * HERO_PARALLAX}%`);

  return (
    <section id="cw-poster" ref={wrapRef} aria-labelledby="cw-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden text-white" style={{ background: "#141414" }}>
      <style>{HERO_CSS}</style>
      <motion.div aria-hidden className="absolute inset-0" style={{ y: reduce ? 0 : photoY }}>
        <div className={`absolute inset-0 ${reduce ? "" : "cw-hero-photo"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="조명이 켜진 공유오피스 라운지와 창가 좌석이 흐리게 보이는 사진"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 45%" }}
          />
        </div>
      </motion.div>
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.74), rgba(0,0,0,0.38) 50%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.5))" }} />

      {/* 왼쪽 위 상호, 오른쪽 위 투어 신청 */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 pt-4 md:px-6 lg:pt-7">
        <p>
          <SampleLogo light small />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta="coworking_poster_cta"
          className={`rounded-[6px] bg-white px-4 py-2.5 text-[15px] font-semibold transition-colors duration-150 hover:bg-[#f0f0f0] ${focusRing}`}
          style={{ color: C.ink, outlineColor: "#ffffff" }}
        >
          투어 신청
        </button>
      </div>

      <div className="relative z-10 mx-auto mt-auto w-full max-w-[1200px] px-4 pb-14 md:px-6 md:pb-20">
        <div className={reduce ? "" : "cw-hero-rise"}>
          <h1 id="cw-poster-title" className="max-w-[14em] text-[36px] font-bold md:text-[clamp(40px,5vw,72px)]" style={{ letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}>
            오늘 하루만 앉아도 돼요
          </h1>
          <p className="mt-4 text-[16px] font-medium text-white/90 md:text-[18px]">
            {BRAND} {BRANCH}, 평일 09:00~21:00
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- 공통 조각 ---------- */

function SectionTitle({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="border-b pb-3 text-[26px] font-bold leading-[1.2] md:text-[32px]" style={{ color: C.ink, borderColor: C.line }}>
      {children}
    </h2>
  );
}

/* ---------- 평면도 ---------- */

function FloorPlan({
  occ,
  selected,
  reduce,
  onPick,
}: {
  occ: boolean[];
  selected: SeatType | null;
  reduce: boolean;
  onPick: (t: SeatType) => void;
}) {
  const fillT = reduce ? "none" : `fill ${SEAT_MS}ms ${EASE_CSS}, stroke ${SEAT_MS}ms ${EASE_CSS}`;
  const zoneStyle = (t: SeatType): CSSProperties => ({
    opacity: selected && selected !== t ? 0.22 : 1,
    transition: reduce ? "none" : `opacity ${SEAT_MS}ms ${EASE_CSS}`,
  });
  const key = (e: KeyboardEvent<SVGGElement>, t: SeatType) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPick(t);
    }
  };
  const byType = (t: SeatType) => UNITS.map((u, i) => ({ u, i })).filter(({ u }) => u.type === t);

  const unitGroup = (u: Unit, i: number, children: ReactNode, focus: { x: number; y: number; w: number; h: number }) => (
    <g
      key={u.id}
      role="button"
      tabIndex={0}
      aria-label={`${u.type} ${u.n}번, ${occ[i] ? "사용 중" : "빈 자리"}`}
      aria-pressed={selected === u.type}
      onClick={() => onPick(u.type)}
      onKeyDown={(e) => key(e, u.type)}
      className="cursor-pointer outline-none [&:focus-visible>.cw-focus]:opacity-100"
    >
      <rect className="cw-focus opacity-0" x={focus.x - 3} y={focus.y - 3} width={focus.w + 6} height={focus.h + 6} rx={6} fill="none" stroke={C.accent} strokeWidth={2} />
      {children}
    </g>
  );

  const seatFill = (on: boolean) => (on ? C.accent : "#fff");

  return (
    <svg viewBox="0 0 720 450" className="block h-auto w-full" role="group" aria-label="지점 평면도. 자리를 누르면 그 유형이 선택됩니다">
      {/* 외벽과 출입구 */}
      <rect x="10" y="10" width="700" height="430" rx="4" fill="#fff" stroke={C.accent} strokeWidth="1.5" />
      <rect x="150" y="436" width="70" height="8" fill="#fff" />
      <line x1="150" y1="440" x2="220" y2="440" stroke={C.accent} strokeWidth="3" />
      <text x="156" y="432" fontSize="11" fill={C.muted}>
        출입구
      </text>
      {/* 복도 */}
      <line x1="350" y1="24" x2="350" y2="426" stroke={C.line} strokeWidth="1" strokeDasharray="4 6" />
      <text x="300" y="232" fontSize="11" fill={C.muted} textAnchor="end">
        커피바, 복합기
      </text>
      <rect x="236" y="212" width="80" height="12" rx="2" fill={C.inkSoft} />

      {/* 자유석 */}
      <g style={zoneStyle("자유석")}>
        <text x="28" y="42" fontSize="13" fontWeight="700" fill={C.ink}>
          자유석
        </text>
        <rect x="44" y="72" width="272" height="22" rx="4" fill={C.inkSoft} />
        <rect x="44" y="154" width="272" height="22" rx="4" fill={C.inkSoft} />
        {byType("자유석").map(({ u, i }) =>
          unitGroup(u, i, <rect x={u.x} y={u.y} width={u.w} height={u.h} rx="4" fill={seatFill(occ[i])} stroke={C.accent} strokeWidth="1.5" style={{ transition: fillT }} />, u),
        )}
      </g>

      {/* 지정석 */}
      <g style={zoneStyle("지정석")}>
        <text x="28" y="242" fontSize="13" fontWeight="700" fill={C.ink}>
          지정석
        </text>
        {byType("지정석").map(({ u, i }) =>
          unitGroup(
            u,
            i,
            <>
              <rect x={u.x} y={u.y} width={u.w} height={u.h} rx="4" fill={seatFill(occ[i])} stroke={C.accent} strokeWidth="1.5" style={{ transition: fillT }} />
              <rect x={u.x + 20} y={u.y + u.h + 3} width="16" height="6" rx="2" fill={occ[i] ? C.accent : "#fff"} stroke={C.accent} strokeWidth="1.2" style={{ transition: fillT }} />
            </>,
            { x: u.x, y: u.y, w: u.w, h: u.h + 9 },
          ),
        )}
      </g>

      {/* 1인실 */}
      <g style={zoneStyle("1인실")}>
        <text x="380" y="42" fontSize="13" fontWeight="700" fill={C.ink}>
          1인실
        </text>
        {byType("1인실").map(({ u, i }) =>
          unitGroup(
            u,
            i,
            <>
              <rect x={u.x} y={u.y} width={u.w} height={u.h} fill={occ[i] ? C.inkSoft : "#fff"} stroke={C.accent} strokeWidth="1.2" style={{ transition: fillT }} />
              <line x1={u.x + 8} y1={u.y + u.h} x2={u.x + 22} y2={u.y + u.h} stroke="#fff" strokeWidth="3" />
              <rect x={u.x + 9} y={u.y + 14} width="28" height="34" rx="3" fill={seatFill(occ[i])} stroke={C.accent} strokeWidth="1.5" style={{ transition: fillT }} />
              <text x={u.x + u.w / 2} y={u.y + 66} fontSize="10" fill={occ[i] ? C.ink : C.muted} textAnchor="middle">
                {u.n}
              </text>
            </>,
            u,
          ),
        )}
      </g>

      {/* 4인실 */}
      <g style={zoneStyle("4인실")}>
        <text x="380" y="162" fontSize="13" fontWeight="700" fill={C.ink}>
          4인실
        </text>
        {byType("4인실").map(({ u, i }) =>
          unitGroup(
            u,
            i,
            <>
              <rect x={u.x} y={u.y} width={u.w} height={u.h} fill={occ[i] ? C.inkSoft : "#fff"} stroke={C.accent} strokeWidth="1.2" style={{ transition: fillT }} />
              <line x1={u.x + 10} y1={u.y + u.h} x2={u.x + 26} y2={u.y + u.h} stroke="#fff" strokeWidth="3" />
              <rect x={u.x + 18} y={u.y + 32} width="36" height="36" rx="6" fill={seatFill(occ[i])} stroke={C.accent} strokeWidth="1.5" style={{ transition: fillT }} />
              {[
                [u.x + 36, u.y + 20],
                [u.x + 36, u.y + 80],
                [u.x + 8, u.y + 50],
                [u.x + 64, u.y + 50],
              ].map(([cx, cy], k) => (
                <circle key={k} cx={cx} cy={cy} r="5" fill={seatFill(occ[i])} stroke={C.accent} strokeWidth="1.5" style={{ transition: fillT }} />
              ))}
              <text x={u.x + u.w / 2} y={u.y + 96} fontSize="10" fill={occ[i] ? C.ink : C.muted} textAnchor="middle">
                {u.n}
              </text>
            </>,
            u,
          ),
        )}
      </g>

      {/* 회의실 (예약 현황은 아래 구역에서) */}
      <g>
        <text x="380" y="304" fontSize="13" fontWeight="700" fill={C.ink}>
          회의실
        </text>
        <rect x="380" y="312" width="156" height="112" fill="#fff" stroke={C.accent} strokeWidth="1.2" />
        <rect x="404" y="344" width="108" height="46" rx="23" fill={C.inkSoft} />
        <text x="458" y="372" fontSize="12" fill={C.ink} textAnchor="middle">
          A 6인
        </text>
        <rect x="548" y="312" width="148" height="112" fill="#fff" stroke={C.accent} strokeWidth="1.2" />
        <rect x="568" y="344" width="108" height="46" rx="23" fill={C.inkSoft} />
        <text x="622" y="372" fontSize="12" fill={C.ink} textAnchor="middle">
          B 10인
        </text>
      </g>
    </svg>
  );
}

/* ---------- 요금 계산 ---------- */

function PriceCalc({ selected, onType, onTour }: { selected: SeatType | null; onType: (t: SeatType) => void; onTour: () => void }) {
  const type: SeatType = selected ?? "자유석";
  const [termIdx, setTermIdx] = useState(1);
  const [people, setPeople] = useState(1);
  const [opts, setOpts] = useState<OptionId[]>([]);

  const headcount = Math.min(people, MAX_PEOPLE[type]);
  const term = TERMS[termIdx];
  const seatMonthly = PER_PERSON[type] ? PRICE[type] * headcount : PRICE[type];
  const discount = Math.round((seatMonthly * term.off) / 1000) * 1000;
  // 1인실과 4인실은 사업자등록 주소가 포함이다. 지정석 이상은 24시간 출입이 포함
  const included: OptionId[] = type === "1인실" || type === "4인실" ? ["biz", "allday"] : type === "지정석" ? ["allday"] : [];
  const optMonthly = OPTIONS.filter((o) => opts.includes(o.id) && !included.includes(o.id)).reduce((s, o) => s + o.price, 0);
  const monthly = seatMonthly - discount + optMonthly;
  const total = monthly * term.months;

  const chip = (on: boolean): CSSProperties => ({
    background: on ? C.accent : "#fff",
    color: on ? "#fff" : C.ink,
    borderColor: on ? C.accent : C.edge,
    outlineColor: C.accent,
  });
  const chipCls = `rounded-[4px] border px-3 py-2 text-[15px] font-semibold transition-colors duration-150 ${focusRing}`;
  const label = "text-[14px] font-bold";

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
      <div className="grid gap-6">
        <fieldset>
          <legend className={label} style={{ color: C.muted }}>
            좌석 유형
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TYPES.map((t) => (
              <button key={t} type="button" aria-pressed={type === t} onClick={() => onType(t)} className={`${chipCls} text-left`} style={chip(type === t)}>
                <span className="block">{t}</span>
                <span className="mt-0.5 block text-[13px] font-semibold">
                  월 {won(PRICE[t])}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
            {TYPE_NOTE[type]}
          </p>
        </fieldset>

        <fieldset>
          <legend className={label} style={{ color: C.muted }}>
            계약 기간
          </legend>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {TERMS.map((t, i) => (
              <button key={t.months} type="button" aria-pressed={termIdx === i} onClick={() => setTermIdx(i)} className={`${chipCls} text-left`} style={chip(termIdx === i)}>
                <span className="block">{t.months}개월</span>
                <span className="mt-0.5 block text-[13px] font-semibold">
                  {t.off ? `${Math.round(t.off * 100)}% 할인` : "할인 없음"}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-[200px_minmax(0,1fr)]">
          <div>
            <p id="cw-people-label" className={label} style={{ color: C.muted }}>
              인원
            </p>
            <div role="group" aria-labelledby="cw-people-label" className="mt-2 inline-flex items-stretch rounded-[4px] border" style={{ borderColor: C.edge }}>
              <button type="button" aria-label="인원 줄이기" disabled={headcount <= 1} onClick={() => setPeople(Math.max(1, headcount - 1))} className={`px-3 disabled:opacity-30 ${focusRing}`} style={{ color: C.ink, outlineColor: C.accent }}>
                <Minus size={18} aria-hidden />
              </button>
              <span className="inline-flex min-w-[56px] items-center justify-center border-x px-2 py-2 text-[18px] font-semibold" style={{ borderColor: C.edge, color: C.ink }} aria-live="polite">
                {headcount}명
              </span>
              <button type="button" aria-label="인원 늘리기" disabled={headcount >= MAX_PEOPLE[type]} onClick={() => setPeople(Math.min(MAX_PEOPLE[type], headcount + 1))} className={`px-3 disabled:opacity-30 ${focusRing}`} style={{ color: C.ink, outlineColor: C.accent }}>
                <Plus size={18} aria-hidden />
              </button>
            </div>
            <p className="mt-1.5 text-[13px]" style={{ color: C.muted }}>
              {PER_PERSON[type] ? "인원수대로 월 요금" : `${MAX_PEOPLE[type]}명까지 같은 요금`}
            </p>
          </div>

          <fieldset>
            <legend className={label} style={{ color: C.muted }}>
              추가 옵션 (월)
            </legend>
            <ul className="mt-2 grid gap-2">
              {OPTIONS.map((o) => {
                const inc = included.includes(o.id);
                const on = inc || opts.includes(o.id);
                return (
                  <li key={o.id}>
                    <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-[4px] border px-3 py-2 text-[15px] has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 ${inc ? "cursor-default" : ""}`} style={{ borderColor: on ? C.accent : C.line, background: on ? C.inkSoft : "#fff", outlineColor: C.accent }}>
                      <span className="inline-flex items-center gap-2 font-bold">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={on}
                          disabled={inc}
                          onChange={(e) => setOpts((s) => (e.target.checked ? [...s, o.id] : s.filter((x) => x !== o.id)))}
                        />
                        <span aria-hidden className="inline-flex h-5 w-5 items-center justify-center rounded-[3px] border" style={{ borderColor: on ? C.accent : C.edge, background: on ? C.accent : "#fff", color: "#fff" }}>
                          {on && <Check size={14} strokeWidth={3} />}
                        </span>
                        {o.label}
                      </span>
                      <span className="text-[14px] font-semibold" style={{ color: inc ? C.ink : C.muted }}>
                        {inc ? "포함" : `+${won(o.price)}`}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        </div>
      </div>

      <div className="rounded-[6px] border p-5" style={{ borderColor: C.line, background: C.paper }} aria-live="polite">
        <p className="text-[14px] font-bold" style={{ color: C.muted }}>
          월 요금
        </p>
        <p className="mt-1 flex items-baseline gap-1" style={{ color: C.ink }}>
          <span className="text-[40px] font-semibold leading-none tabular-nums md:text-[46px]">{monthly.toLocaleString("ko-KR")}</span>
          <span className="text-[20px] font-bold">원</span>
        </p>
        <dl className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 border-t pt-4 text-[14px]" style={{ borderColor: C.line }}>
          <dt>
            {type} {PER_PERSON[type] ? `${headcount}명` : ""}
          </dt>
          <dd className="text-right">
            {won(seatMonthly)}
          </dd>
          <dt>{term.months}개월 계약 할인</dt>
          <dd className="text-right">
            {discount ? `-${won(discount)}` : "0원"}
          </dd>
          {OPTIONS.filter((o) => opts.includes(o.id) && !included.includes(o.id)).map((o) => (
            <div key={o.id} className="contents">
              <dt>{o.label}</dt>
              <dd className="text-right">
                +{won(o.price)}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-baseline justify-between gap-3 border-t pt-4" style={{ borderColor: C.line }}>
          <p className="text-[15px] font-bold">총액 ({term.months}개월)</p>
          <p className="flex items-baseline gap-0.5" style={{ color: C.ink }}>
            <span className="text-[24px] font-semibold leading-none tabular-nums">{total.toLocaleString("ko-KR")}</span>
            <span className="text-[15px] font-bold">원</span>
          </p>
        </div>
        <p className="mt-1 text-right text-[13px]" style={{ color: C.muted }}>
          부가세 별도, 보증금 1개월분
        </p>
        <button type="button" onClick={onTour} data-gtm-cta="coworking_tour_price" className={`mt-5 w-full rounded-[4px] px-4 py-3 text-[16px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.accent }}>
          이 조건으로 투어 신청
        </button>
      </div>
    </div>
  );
}

/* ---------- 회의실 예약 현황 ---------- */

function RoomBoard({ today }: { today: Date }) {
  const [pick, setPick] = useState<{ room: number; hour: number } | null>(null);
  const picked = pick ? ROOMS[pick.room] : null;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[14px]" style={{ color: C.muted }}>
        <p>{fmtKo(today)} 09:00~21:00</p>
        <p className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-3.5 w-3.5 rounded-[2px]" style={{ background: C.accent }} />
            예약됨
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-3.5 w-3.5 rounded-[2px] border bg-white" style={{ borderColor: C.edge }} />
            빈 시간
          </span>
        </p>
      </div>

      <div className="mt-4 grid gap-6">
        {ROOMS.map((r, ri) => (
          <div key={r.id}>
            <div className="flex items-baseline justify-between">
              <h3 className="text-[18px] font-bold">
                {r.name} <span style={{ color: C.muted }}>{r.cap}인</span>
              </h3>
              <p className="text-[13px]" style={{ color: C.muted }}>
                빈 시간 {HOURS.filter((h) => !roomTaken(ri, h)).length}시간
              </p>
            </div>
            <div role="group" aria-label={`${r.name} 오늘 예약 현황`} className="mt-2 grid grid-cols-12 gap-[3px]">
              {HOURS.map((h) => {
                const taken = roomTaken(ri, h);
                const on = pick?.room === ri && pick.hour === h;
                const range = `${p2(h)}:00~${p2(h + 1)}:00`;
                return taken ? (
                  <span key={h} role="img" aria-label={`${range} 예약됨`} className="h-11 rounded-[3px]" style={{ background: C.accent }} />
                ) : (
                  <button
                    key={h}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${range} 빈 시간`}
                    onClick={() => setPick(on ? null : { room: ri, hour: h })}
                    className={`h-11 rounded-[3px] border transition-colors duration-150 hover:bg-[#eaeff0] ${focusRing}`}
                    style={{ borderColor: on ? C.accent : C.edge, background: on ? C.accent : "#fff", outlineColor: C.accent }}
                  />
                );
              })}
            </div>
            <div aria-hidden className="mt-1 grid grid-cols-12 text-[11px]" style={{ color: C.muted }}>
              {HOURS.map((h) => (
                <span key={h} className={h % 3 === 0 ? "" : "invisible"}>
                  {p2(h)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[6px] border px-4 py-3 text-[15px] leading-[1.6]" style={{ borderColor: pick ? C.accent : C.line, background: pick ? C.inkSoft : "#fff" }} aria-live="polite">
        {pick && picked ? (
          <>
            <p className="font-bold" style={{ color: C.ink }}>
              {picked.name} {p2(pick.hour)}:00~{p2(pick.hour + 1)}:00 예약 가능
            </p>
            <p style={{ color: C.muted }}>멤버 무료 크레딧 월 10시간, 이후 시간당 11,000원. 멤버 앱에서 바로 예약돼요.</p>
          </>
        ) : (
          <p style={{ color: C.muted }}>멤버 무료 크레딧 월 10시간, 이후 시간당 11,000원. 비멤버는 시간당 22,000원.</p>
        )}
      </div>
    </div>
  );
}

/* ---------- 입주 혜택 ---------- */

const PERKS = [
  { Icon: Building2, title: "사업자등록 주소 제공", desc: "자유석부터 가능, 월 33,000원. 1인실 이상은 포함" },
  { Icon: Users, title: "회의실 무료 크레딧", desc: "월 10시간, 4인실은 20시간. 이후 시간당 11,000원" },
  { Icon: Clock, title: "24시간 출입", desc: "지정석 이상 기본. 자유석은 월 22,000원" },
  { Icon: Coffee, title: "커피, 음료", desc: "라운지 커피머신과 탄산수 무제한" },
  { Icon: Printer, title: "복합기", desc: "흑백 월 300장 무료, 컬러 장당 200원" },
  { Icon: Mail, title: "우편물, 택배 수령", desc: "데스크 보관 후 카카오톡 알림. 월 11,000원" },
  { Icon: Car, title: "주차", desc: "건물 지하 1~3층 2시간 무료, 이후 10분 1,000원" },
  { Icon: Wifi, title: "인터넷", desc: "유선 1Gbps, 좌석마다 랜 포트" },
] as const;

function Perks() {
  return (
    <ul className="mt-6 grid gap-x-10 md:grid-cols-2">
      {PERKS.map(({ Icon, title, desc }) => (
        <li key={title} className="flex items-start gap-4 border-b py-4" style={{ borderColor: C.line }}>
          <Icon size={22} aria-hidden className="mt-0.5 flex-none" style={{ color: C.ink }} />
          <div className="min-w-0">
            <p className="text-[17px] font-bold">
              {title}
            </p>
            <p className="mt-0.5 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
              {desc}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------- 투어 신청 ---------- */

interface Tour {
  day: Date;
  time: string;
  name: string;
  phone: string;
  people: number;
  type: SeatType | null;
}

function TourForm({ today, reduce, selected }: { today: Date; reduce: boolean; selected: SeatType | null }) {
  const days = Array.from({ length: 7 }, (_, i) => daysAgo(today, -i));
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState<Tour | null>(null);

  const field = "w-full rounded-[4px] border bg-white px-3 py-2.5 text-[16px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
  const label = "block text-[14px] font-bold";
  const chip = (on: boolean, off = false): CSSProperties => ({
    background: on ? C.accent : "#fff",
    color: off ? C.muted : on ? "#fff" : C.ink,
    borderColor: off ? C.line : on ? C.accent : C.edge,
    outlineColor: C.accent,
  });

  const submit = () => {
    const e: string[] = [];
    if (day === null) e.push("날짜를 골라 주세요.");
    if (!time) e.push("시간을 골라 주세요.");
    if (name.trim().length < 2) e.push("이름을 적어 주세요.");
    if (phone.replace(/\D/g, "").length < 10) e.push("휴대폰 번호를 확인해 주세요.");
    setErrors(e);
    if (e.length || day === null || !time) return;
    setDone({ day: days[day], time, name, phone, people, type: selected });
  };

  if (done) {
    const no = `T${today.getFullYear()}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${String(40 + (today.getDate() % 7) * 3).padStart(3, "0")}`;
    const reply = nextBusinessDay(today);
    const row = "grid grid-cols-[96px_1fr] gap-x-4 gap-y-2 text-[15px]";
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="mt-6 max-w-[640px] rounded-[6px] border p-5 md:p-6"
        style={{ borderColor: C.line, background: C.paper }}
        role="status"
      >
        <p className="inline-flex items-center gap-2 text-[22px] font-bold" style={{ color: C.ink }}>
          <Check size={22} strokeWidth={3} aria-hidden /> 투어 신청 접수
        </p>
        <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
          접수번호
        </p>
        <p className="text-[28px] font-semibold" style={{ color: C.ink }}>
          {no}
        </p>
        <dl className={`mt-4 border-t pt-4 ${row}`} style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>투어 일시</dt>
          <dd className="font-bold">
            {fmtKo(done.day)} {done.time}
          </dd>
          <dt style={{ color: C.muted }}>이름</dt>
          <dd>{maskName(done.name)}</dd>
          <dt style={{ color: C.muted }}>휴대폰</dt>
          <dd>{maskPhone(done.phone)}</dd>
          <dt style={{ color: C.muted }}>인원</dt>
          <dd>{done.people}명</dd>
          <dt style={{ color: C.muted }}>관심 좌석</dt>
          <dd>{done.type ?? "미정"}</dd>
        </dl>
        <dl className={`mt-4 border-t pt-4 ${row}`} style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>담당 창구</dt>
          <dd className="font-bold">{KAKAO}</dd>
          <dt style={{ color: C.muted }}>회신 예정일</dt>
          <dd className="font-bold">{fmtKo(reply)} 오전 중</dd>
        </dl>
        <p className="mt-4 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
          투어 당일 1층 안내데스크에서 {BRAND} 방문이라고 말씀해 주세요. 주차는 2시간 무료예요.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(null);
            setDay(null);
            setTime(null);
            setName("");
            setPhone("");
            setPeople(1);
          }}
          className={`mt-5 rounded-[4px] border px-4 py-2 text-[14px] font-bold ${focusRing}`}
          style={{ borderColor: C.edge, color: C.ink, outlineColor: C.accent }}
        >
          다시 신청
        </button>
      </motion.div>
    );
  }

  return (
    <form
      className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
    >
      <div className="grid gap-6">
        <fieldset>
          <legend className={label} style={{ color: C.muted }}>
            날짜 (평일)
          </legend>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
            {days.map((d, i) => {
              const off = !isWeekday(d);
              const on = day === i;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={off}
                  aria-pressed={on}
                  aria-label={`${fmtKo(d)}${off ? " 휴무" : ""}`}
                  onClick={() => setDay(i)}
                  className={`rounded-[4px] border px-1 py-2 text-center transition-colors duration-150 disabled:cursor-not-allowed ${focusRing}`}
                  style={chip(on, off)}
                >
                  <span className="block text-[12px] font-bold">{i === 0 ? "오늘" : `${DOW[d.getDay()]}요일`}</span>
                  <span className="block text-[18px] font-semibold">
                    {d.getDate()}
                  </span>
                  <span className="block text-[11px]" style={{ color: off ? C.muted : "inherit" }}>
                    {off ? "휴무" : `${d.getMonth() + 1}월`}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className={label} style={{ color: C.muted }}>
            시간
          </legend>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {TOUR_TIMES.map((t) => (
              <button key={t} type="button" aria-pressed={time === t} onClick={() => setTime(t)} className={`rounded-[4px] border px-2 py-2.5 text-[16px] font-semibold transition-colors duration-150 ${focusRing}`} style={{ ...chip(time === t) }}>
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_140px]">
          <div>
            <label htmlFor="cw-name" className={label} style={{ color: C.muted }}>
              이름
            </label>
            <input id="cw-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`${field} mt-2`} style={{ borderColor: C.edge, outlineColor: C.accent }} />
          </div>
          <div>
            <label htmlFor="cw-phone" className={label} style={{ color: C.muted }}>
              휴대폰
            </label>
            <input id="cw-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" className={`${field} mt-2`} style={{ borderColor: C.edge, outlineColor: C.accent }} />
          </div>
          <div>
            <p id="cw-tour-people" className={label} style={{ color: C.muted }}>
              인원
            </p>
            <div role="group" aria-labelledby="cw-tour-people" className="mt-2 inline-flex w-full items-stretch rounded-[4px] border" style={{ borderColor: C.edge }}>
              <button type="button" aria-label="인원 줄이기" disabled={people <= 1} onClick={() => setPeople((p) => Math.max(1, p - 1))} className={`px-3 disabled:opacity-30 ${focusRing}`} style={{ color: C.ink, outlineColor: C.accent }}>
                <Minus size={18} aria-hidden />
              </button>
              <span className="inline-flex flex-1 items-center justify-center border-x py-2 text-[18px] font-semibold" style={{ borderColor: C.edge, color: C.ink }}>
                {people}
              </span>
              <button type="button" aria-label="인원 늘리기" disabled={people >= 6} onClick={() => setPeople((p) => Math.min(6, p + 1))} className={`px-3 disabled:opacity-30 ${focusRing}`} style={{ color: C.ink, outlineColor: C.accent }}>
                <Plus size={18} aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <ul className="grid gap-1 rounded-[4px] border px-4 py-3 text-[14px] font-bold" style={{ borderColor: C.error, color: C.error }} role="alert">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-[6px] border p-5" style={{ borderColor: C.line, background: C.paper }}>
        <p className="text-[14px] font-bold" style={{ color: C.muted }}>
          신청 내용
        </p>
        <dl className="mt-3 grid grid-cols-[88px_1fr] gap-x-4 gap-y-2 text-[15px]">
          <dt style={{ color: C.muted }}>일시</dt>
          <dd className="font-bold">{day !== null ? `${fmtKo(days[day])} ${time ?? ""}` : "미선택"}</dd>
          <dt style={{ color: C.muted }}>인원</dt>
          <dd>{people}명</dd>
          <dt style={{ color: C.muted }}>관심 좌석</dt>
          <dd>{selected ?? "미정 (투어 때 상담)"}</dd>
          <dt style={{ color: C.muted }}>소요 시간</dt>
          <dd>20분 안팎</dd>
        </dl>
        <button type="submit" data-gtm-cta="coworking_tour_submit" className={`mt-5 w-full rounded-[4px] px-4 py-3 text-[16px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.accent }}>
          투어 신청
        </button>
        <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
          접수 뒤 {KAKAO}에서 다음 영업일 오전에 회신해요. 당일 투어는 전화로만 받아요.
        </p>
      </div>
    </form>
  );
}

/* ---------- 오시는 길 ---------- */

const HOURS_ROWS = [
  { days: [1, 2, 3, 4, 5], label: "월~금", hours: "09:00~21:00" },
  { days: [6], label: "토요일", hours: "10:00~18:00" },
  { days: [0], label: "일요일, 공휴일", hours: "휴무 (멤버 24시간 출입)" },
];

function Directions({ today }: { today: Date }) {
  const dow = today.getDay();
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8">
      <div className="overflow-hidden rounded-[6px] border" style={{ borderColor: C.line }}>
        <MiniMap />
      </div>
      <div className="grid gap-5 text-[15px] leading-[1.7]">
        <div>
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>
            주소
          </p>
          <p className="text-[17px] font-bold">
            {ADDRESS}
          </p>
        </div>
        <ul className="grid gap-3">
          <li className="flex items-start gap-3">
            <TrainFront size={20} aria-hidden className="mt-1 flex-none" style={{ color: C.ink }} />
            <span>
              ㅇㅇ역 3번 출구 <b>도보 4분</b>. 출구에서 직진 후 첫 사거리 왼쪽 ㅇㅇ빌딩
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Car size={20} aria-hidden className="mt-1 flex-none" style={{ color: C.ink }} />
            <span>건물 지하 1~3층 주차. 멤버와 투어 방문 2시간 무료, 이후 10분 1,000원</span>
          </li>
        </ul>
        <div>
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>
            운영시간
          </p>
          <table className="mt-1 w-full border-collapse text-left">
            <tbody>
              {HOURS_ROWS.map((r) => {
                const on = r.days.includes(dow);
                return (
                  <tr key={r.label} className={on ? "font-bold" : ""} style={{ color: on ? C.ink : C.text, background: on ? C.inkSoft : "transparent" }}>
                    <th scope="row" className="w-[48%] border-b px-2 py-2 font-[inherit]" style={{ borderColor: C.line }}>
                      {r.label}
                      {on && <span className="ml-2 rounded-[3px] px-1.5 py-0.5 text-[12px] font-bold" style={{ background: C.accent, color: "#fff" }}>오늘</span>}
                    </th>
                    <td className="border-b px-2 py-2" style={{ borderColor: C.line }}>
                      {r.hours}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniMap() {
  return (
    <svg viewBox="0 0 520 360" className="block h-auto w-full" role="img" aria-label="ㅇㅇ역 3번 출구에서 직진 후 첫 사거리 왼쪽 ㅇㅇ빌딩 약도">
      <rect width="520" height="360" fill={C.paper} />
      {/* 큰길과 골목 */}
      <rect x="0" y="236" width="520" height="44" fill="#fff" stroke={C.line} />
      <rect x="296" y="0" width="34" height="360" fill="#fff" stroke={C.line} />
      <rect x="120" y="0" width="22" height="236" fill="#fff" stroke={C.line} />
      <text x="20" y="266" fontSize="13" fill={C.muted}>
        ㅇㅇ대로
      </text>
      <text x="313" y="40" fontSize="12" fill={C.muted} transform="rotate(90 313 40)">
        ㅇㅇ로
      </text>
      {/* 걷는 길 */}
      <path d="M 330 300 L 313 300 L 313 180 L 240 180" fill="none" stroke={C.accent} strokeWidth="3" strokeDasharray="7 6" strokeLinecap="round" />
      <text x="322" y="170" fontSize="12" fontWeight="700" fill={C.ink}>
        도보 4분
      </text>
      {/* 역 */}
      <circle cx="352" cy="304" r="16" fill="#fff" stroke={C.accent} strokeWidth="2" />
      <text x="352" y="309" fontSize="12" fontWeight="700" fill={C.ink} textAnchor="middle">
        역
      </text>
      <text x="376" y="300" fontSize="13" fontWeight="700" fill={C.ink}>
        ㅇㅇ역
      </text>
      <text x="376" y="318" fontSize="12" fill={C.muted}>
        3번 출구
      </text>
      {/* 건물 */}
      <rect x="160" y="130" width="80" height="80" rx="3" fill={C.inkSoft} stroke={C.accent} strokeWidth="1.5" />
      <text x="200" y="166" fontSize="13" fontWeight="700" fill={C.ink} textAnchor="middle">
        ㅇㅇ빌딩
      </text>
      <text x="200" y="186" fontSize="12" fontWeight="700" fill={C.ink} textAnchor="middle">
        5층
      </text>
      <text x="200" y="120" fontSize="12" fill={C.muted} textAnchor="middle">
        주차 지하 1~3층
      </text>
      {/* 주변 */}
      <rect x="170" y="296" width="100" height="44" rx="2" fill="#fff" stroke={C.line} />
      <text x="220" y="322" fontSize="12" fill={C.muted} textAnchor="middle">
        편의점
      </text>
      <rect x="360" y="40" width="120" height="70" rx="2" fill="#fff" stroke={C.line} />
      <text x="420" y="80" fontSize="12" fill={C.muted} textAnchor="middle">
        우체국
      </text>
    </svg>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className={small ? "h-6 w-6 shrink-0" : "h-7 w-7 shrink-0"} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold leading-none tracking-[-0.03em]`}>곰파트너</span>
        <span className="text-[12px] font-semibold leading-none opacity-75">공유오피스 샘플</span>
      </span>
    </span>
  );
}
