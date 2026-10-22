"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Building2, CalendarCheck, Car, Check, Clock, Coffee, Mail, Minus, Plus, Printer, TrainFront, Users, Wifi } from "lucide-react";
import { Black_Han_Sans, IBM_Plex_Sans_KR, JetBrains_Mono } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 공유오피스 지점 홈페이지 샘플: 가상의 곰파트너워크 한 지점. 상호, 주소, 이름은 모두 가상이다.

   국내 공유오피스 지점 페이지(패스트파이브, 스파크플러스, 위워크 지점 소개)의 공통 구성을 따른다.
   메뉴는 공간 소개, 멤버십 요금, 회의실, 입주 혜택, 투어 신청, 오시는 길. 첫 화면에 지점 사진과 투어 신청 버튼.
   요금은 자유석, 지정석, 1인실, 4인실처럼 좌석 유형별 월 요금(부가세 별도)과 계약 기간 할인.
   회의실은 멤버 무료 크레딧 시간, 혜택은 사업자등록 주소 제공, 24시간 출입, 우편물 수령, 커피 무제한, 복합기, 주차가 관용 항목.
   오시는 길은 역 출구와 도보 시간, 주차, 운영시간.

   첫 화면의 지점 사진 자리에 실시간 좌석 평면도를 둔다. 좌석 점유가 몇 초마다 한두 자리씩 바뀌고
   옆 "지금 빈 자리" 숫자가 슬롯머신처럼 세로로 롤링한다. 요금 계산 결과도 같은 롤링 숫자 부품을 쓴다.
   빈 자리는 테두리만, 찬 자리는 채움으로 색과 모양을 같이 구분한다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 좌석 유형 고르기: 자유석, 지정석, 1인실, 4인실 중 하나를 누르거나 평면도의 자리를 직접 누르면 그 유형만 밝아진다.
   2. 요금 계산: 기간(1, 3, 6, 12개월), 인원, 추가 옵션을 고르면 월 요금과 총액이 롤링으로 바뀐다.
   3. 회의실 예약 현황: 회의실 2곳의 오늘 시간대 막대(09~21시). 빈 시간을 누르면 예약 가능 표시.
   4. 투어 신청: 날짜(오늘부터 7일, 평일만), 시간, 이름, 휴대폰, 인원. 접수 완료 화면에 접수번호, 담당 창구, 회신 예정일.
   5. 입주 혜택과 오시는 길: 역에서 걷는 시간, 주차, 운영시간. 오늘 요일 진하게.

   포스터 첫 화면: 거의 검정 바탕에 밤의 빌딩 한 채. 앞면 창문 80칸이 책상 칸이다.
   들어오면 칸들이 랜덤 순서로 켜졌다 꺼지고 9칸만 라임으로 남는다. 오른쪽 아래 "빈 자리 9"가 굴러 맞춰진다.
   등장 뒤에는 몇 칸이 9초 주기로 가끔 켜졌다 꺼진다(야근하는 책상 불빛).
   스크롤하면 빌딩 앞면이 뒤로 눕듯 기울어(perspective) 바닥 평면이 되고, 흰 화면으로 넘어가 아래 좌석 평면도로 이어진다. */

const BRAND = "곰파트너워크";
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

const C = {
  ink: "#0f4c5c",
  inkSoft: "#d9eef2",
  point: "#ffb703",
  text: "#1d2a2e",
  muted: "#5b6b70",
  line: "#c9d6da",
  paper: "#f6fafb",
  error: "#b42318",
};

const plexF = { fontFamily: `${IBM_Plex_Sans_KR.style.fontFamily}, sans-serif` } as const;
const monoF = { fontFamily: `${JetBrains_Mono.style.fontFamily}, ui-monospace, monospace` } as const;

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
    [58, 116],
    [134, 192],
  ].forEach(([top, bottom], t) => {
    for (let i = 0; i < 4; i++) {
      u.push({ id: `free-${t * 8 + i + 1}`, type: "자유석", n: t * 8 + i + 1, x: 58 + i * 68, y: top, w: 24, h: 20 });
      u.push({ id: `free-${t * 8 + i + 5}`, type: "자유석", n: t * 8 + i + 5, x: 58 + i * 68, y: bottom, w: 24, h: 20 });
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
    <span className={`inline-flex leading-none ${className}`} style={{ ...monoF, ...style }}>
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
  const reduceRef = useRef(reduce);
  useEffect(() => {
    reduceRef.current = reduce;
  }, [reduce]);

  const [occ, setOcc] = useState<boolean[]>(INITIAL_OCC);
  const [selected, setSelected] = useState<SeatType | null>(null);
  const seatEls = useRef(new Map<string, SVGGraphicsElement>());

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
      if (reduceRef.current) return;
      picks.forEach((i) => {
        const el = seatEls.current.get(UNITS[i].id);
        if (!el || typeof el.animate !== "function") return;
        el.animate([{ transform: "scale(1)" }, { transform: "scale(1.3)", offset: 0.4 }, { transform: "scale(1)" }], { duration: SEAT_MS, easing: EASE_CSS });
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
          <a href="#cw-plan" onClick={(e) => (e.preventDefault(), go("cw-plan"))} className={`inline-flex items-center gap-2 rounded-[4px] ${focusRing}`} style={{ color: C.ink, outlineColor: C.ink }}>
            <GridMark />
            <span className="text-[19px] font-bold leading-none" style={plexF}>
              {BRAND}
            </span>
          </a>
          <nav aria-label="페이지 안 이동" className="-mx-4 min-w-0 flex-1 overflow-x-auto px-4 md:mx-0 md:flex md:justify-end md:px-0">
            <ul className="flex gap-1 whitespace-nowrap text-[14px] font-bold">
              {NAV.map(([id, label]) => (
                <li key={id}>
                  <button type="button" onClick={() => go(id)} className={`rounded-[4px] px-2.5 py-1.5 hover:underline hover:underline-offset-4 ${focusRing}`} style={{ color: C.ink, outlineColor: C.ink }}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <button type="button" onClick={() => go("cw-tour")} className={`hidden flex-none rounded-[4px] px-4 py-2 text-[14px] font-bold text-white md:inline-flex ${focusRing}`} style={{ background: C.ink, outlineColor: C.ink }}>
            투어 신청
          </button>
        </div>
      </header>

      {/* 첫 화면: 실시간 좌석 평면도와 빈 자리 숫자판 */}
      <section id="cw-plan" aria-labelledby="cw-title" className="mx-auto max-w-[1200px] scroll-mt-16 px-4 pt-8 md:px-6 md:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2 className="text-[30px] font-bold leading-[1.2] md:text-[40px]" style={{ ...plexF, color: C.ink }} id="cw-title">
            {BRAND} {BRANCH}
          </h2>
          <p className="text-[15px]" style={{ color: C.muted }}>
            {ADDRESS}, ㅇㅇ역 3번 출구 도보 4분
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">
          <div className="rounded-[6px] border-2 p-2 md:p-3" style={{ borderColor: C.ink, backgroundColor: C.paper, backgroundImage: `radial-gradient(${C.line} 1px, transparent 1.3px)`, backgroundSize: "14px 14px" }}>
            <FloorPlan occ={occ} selected={selected} reduce={reduce} onPick={pickType} register={(id, el) => (el ? seatEls.current.set(id, el) : seatEls.current.delete(id))} />
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 px-1 text-[13px]" style={{ color: C.muted }}>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="inline-block h-3.5 w-3.5 rounded-[3px] border-2 bg-white" style={{ borderColor: C.ink }} />
                빈 자리
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden className="inline-block h-3.5 w-3.5 rounded-[3px]" style={{ background: C.ink }} />
                사용 중
              </span>
              <span className="ml-auto" style={monoF}>
                {fmtKo(today)} 평일 09:00~21:00
              </span>
            </div>
          </div>

          <aside id="cw-count" aria-label="지금 빈 자리" className="rounded-[6px] border-2 p-5" style={{ borderColor: C.ink }}>
            <p className="text-[15px] font-bold" style={{ color: C.muted }}>
              지금 빈 자리
            </p>
            <p className="mt-1 flex items-baseline gap-2" style={{ color: C.ink }}>
              <Roll value={totalFree} reduce={reduce} className="text-[64px] font-semibold md:text-[72px]" />
              <span className="text-[18px]" style={monoF}>
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
                      style={{ background: on ? C.point : "transparent", color: on ? C.ink : C.text, outlineColor: C.ink }}
                    >
                      <span className="inline-flex items-center gap-2 text-[16px] font-bold">
                        <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: on ? C.ink : "transparent", border: `2px solid ${C.ink}` }} />
                        {t}
                      </span>
                      <span className="inline-flex items-baseline gap-1 text-[18px]" style={monoF}>
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
              <button type="button" onClick={() => go("cw-price")} className={`rounded-[4px] border-2 px-3 py-2.5 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.ink, color: C.ink, outlineColor: C.ink }}>
                요금 보기
              </button>
              <button type="button" onClick={() => go("cw-tour")} data-gtm-cta="coworking_tour_top" className={`rounded-[4px] px-3 py-2.5 text-[15px] font-bold text-white ${focusRing}`} style={{ background: C.ink, outlineColor: C.ink }}>
                투어 신청
              </button>
            </div>
          </aside>
        </div>
      </section>

      {/* 멤버십 요금 */}
      <section id="cw-price" aria-labelledby="cw-price-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-16 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cw-price-title">멤버십 요금</SectionTitle>
        <PriceCalc selected={selected} onType={(t) => setSelected(t)} reduce={reduce} onTour={() => go("cw-tour")} />
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
        <p className="text-[16px] font-bold" style={{ ...plexF, color: C.ink }}>
          {BRAND} {BRANCH}
        </p>
        <p>{ADDRESS}</p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

/* ---------- 포스터 첫 화면 ---------- */

const P = {
  bg: "#0b0d0c",
  lime: "#c8ff3d",
  text: "#eef2ea",
  muted: "#9aa39c",
};
const sfxF = { fontFamily: `${Black_Han_Sans.style.fontFamily}, sans-serif` } as const;

/** 빌딩 앞면 책상 칸: 8열 x 10행 = 80칸 (viewBox 560 x 520) */
const B = { x: 40, y: 70, w: 380, h: 420, dx: 90, dy: -50 };
const COLS = 8;
const ROWS = 10;
const CELL_PX = 43;
const CELL_PY = 38;
const WIN_W = 33;
const WIN_H = 28;
/** 끝까지 라임으로 남는 칸 수. 오른쪽 아래 숫자와 같다 */
const POSTER_FREE = INITIAL_OCC.filter((o) => !o).length;
/** 칸이 켜지기 시작하는 시점이 퍼지는 폭 (s) */
const CELL_SPREAD = 0.9;
/** 한 칸이 켜졌다 꺼지는 시간 (s) */
const CELL_BLINK = 0.7;
/** 숫자가 굴러 맞춰지는 시간과 시작 (s). 등장은 1.6초 안에 끝난다 */
const COUNT_ROLL = 1.0;
const COUNT_DELAY = 0.6;
/** 등장 뒤 가끔 켜지는 칸의 주기 (s) */
const AMBIENT_CYCLE = 9;

interface Cell {
  i: number;
  x: number;
  y: number;
  lime: boolean;
  lit: boolean;
  delay: number;
}

const CELLS: Cell[] = (() => {
  const order = Array.from({ length: COLS * ROWS }, (_, i) => i).sort((a, b) => hash(a, 21) - hash(b, 21));
  const limeSet = new Set(order.slice(0, POSTER_FREE));
  return Array.from({ length: COLS * ROWS }, (_, i) => {
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    return {
      i,
      x: B.x + 18 + c * CELL_PX + (CELL_PX - WIN_W) / 2 - 3,
      y: B.y + 22 + r * CELL_PY,
      lime: limeSet.has(i),
      lit: !limeSet.has(i) && hash(i, 9) < 620,
      delay: (hash(i, 13) / 1000) * CELL_SPREAD,
    };
  });
})();
/** 등장 뒤 가끔 켜지는 칸 6개 (라임 칸 제외) */
const AMBIENT = CELLS.filter((c) => !c.lime && hash(c.i, 31) < 120).slice(0, 6);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** 옆면 기울기: 옆면 위의 x 에서 y 가 얼마나 올라가는지 */
const sideShift = (x: number) => (B.dy * (x - (B.x + B.w))) / B.dx;

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const wrapRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });
  // 래퍼 180svh 중 고정 구간은 앞의 80svh (진행도 0 ~ 0.44)
  const textY = useTransform(scrollYProgress, [0, 0.3], [0, -160]);
  // opacity 는 함수형으로 둔다. 범위형이면 framer-motion 이 ViewTimeline 으로 가속하면서 값이 1에 멈춘다
  const textO = useTransform(scrollYProgress, (v) => 1 - clamp01(v / 0.22));
  const tilt = useTransform(scrollYProgress, [0, 0.38], [0, 70]);
  const bScale = useTransform(scrollYProgress, [0, 0.38], [1, 1.5]);
  const bY = useTransform(scrollYProgress, [0, 0.38], [0, -40]);
  const veil = useTransform(scrollYProgress, (v) => clamp01((v - 0.24) / 0.16));

  return (
    <section id="cw-poster" ref={wrapRef} aria-labelledby="cw-poster-title" className="relative h-[180svh]">
      <div className="sticky top-0 h-svh overflow-hidden" style={{ background: P.bg }}>
        {/* 상호와 투어 신청 */}
        <motion.div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-4 lg:px-10 lg:pt-7" style={reduce ? undefined : { opacity: textO }}>
          <p className="inline-flex items-center gap-2 text-[17px] font-bold leading-none" style={{ ...plexF, color: P.text }}>
            <PosterMark />
            {BRAND}
          </p>
          <button
            type="button"
            onClick={onCta}
            aria-label="투어 신청"
            data-gtm-cta="coworking_poster_cta"
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${focusRing}`}
            style={{ background: P.lime, color: P.bg, outlineColor: P.lime }}
          >
            <CalendarCheck size={22} strokeWidth={2.2} aria-hidden />
          </button>
        </motion.div>

        {/* 큰 문장 */}
        <motion.div className="absolute inset-x-4 top-[76px] z-10 lg:left-10 lg:right-10 lg:top-[96px]" style={reduce ? undefined : { y: textY, opacity: textO }}>
          <h1
            id="cw-poster-title"
            className="text-[clamp(48px,14vw,72px)] leading-[1.06] tracking-[-0.02em] lg:text-[clamp(96px,11.2vw,196px)] lg:leading-[1.04]"
            style={{ ...sfxF, color: P.text, wordBreak: "keep-all" }}
          >
            <span className="block">오늘 하루만</span>
            <span className="block">앉아도</span>
            <span className="block">돼요</span>
          </h1>
          <p className="mt-4 text-[15px] lg:mt-6 lg:text-[17px]" style={{ ...plexF, color: P.muted }}>
            {BRAND} {BRANCH}, 평일 09:00~21:00
          </p>
        </motion.div>

        {/* 바탕이 아래 흰 화면 색으로 바뀐다. 빌딩은 그 위에서 눕고 평면도로 이어진다 */}
        {!reduce && <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-white" style={{ opacity: veil }} />}

        {/* 빌딩 */}
        <motion.div
          className="absolute inset-x-4 bottom-6 top-[330px] lg:left-auto lg:right-[16vw] lg:top-auto lg:bottom-[5svh] lg:h-[min(60svh,42vw)] lg:w-[calc(min(60svh,42vw)*560/520)]"
          style={reduce ? { transformOrigin: "50% 100%" } : { rotateX: tilt, scale: bScale, y: bY, transformPerspective: 800, transformOrigin: "50% 100%" }}
        >
          <Building reduce={reduce} />
        </motion.div>

        {/* 빈 자리 숫자 */}
        <motion.div className="absolute right-4 top-[150px] z-10 text-right lg:bottom-10 lg:right-10 lg:top-auto" style={reduce ? undefined : { opacity: textO }}>
          <p style={{ color: P.lime }}>
            <span className="block text-[14px] font-bold lg:text-[18px]" style={plexF}>
              빈 자리
            </span>
            <PosterCount reduce={reduce} />
          </p>
        </motion.div>

      </div>
    </section>
  );
}

function PosterMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 26 26" aria-hidden>
      <rect x="1.5" y="1.5" width="23" height="23" rx="3" fill="none" stroke={P.lime} strokeWidth="2" />
      <rect x="5" y="5" width="7" height="7" rx="1" fill={P.lime} />
      <rect x="14" y="5" width="7" height="7" rx="1" fill="none" stroke={P.lime} strokeWidth="1.6" />
      <rect x="5" y="14" width="7" height="7" rx="1" fill="none" stroke={P.lime} strokeWidth="1.6" />
      <rect x="14" y="14" width="7" height="7" rx="1" fill={P.text} />
    </svg>
  );
}

/** 0~9를 두 바퀴 늘어놓고 첫 9에서 둘째 9까지 굴린다. 서버 렌더에서도 9가 보인다 */
function PosterCount({ reduce }: { reduce: boolean }) {
  const digits = [...DIGITS, ...DIGITS];
  return (
    <span className="relative mt-1 inline-block h-[1em] w-[0.62em] overflow-hidden text-[88px] leading-none lg:text-[clamp(120px,11vw,180px)]" style={sfxF}>
      <span className="sr-only">{POSTER_FREE}</span>
      <motion.span
        aria-hidden
        className="absolute left-0 top-0 flex w-full flex-col items-center"
        initial={reduce ? false : { y: "-45%" }}
        animate={{ y: "-95%" }}
        transition={reduce ? { duration: 0 } : { duration: COUNT_ROLL, delay: COUNT_DELAY, ease: EASE }}
      >
        {digits.map((n, k) => (
          <span key={k} className="block h-[1em] leading-none">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function Building({ reduce }: { reduce: boolean }) {
  const right = B.x + B.w;
  const bottom = B.y + B.h;
  return (
    <svg viewBox="0 0 560 520" preserveAspectRatio="xMidYMax meet" className="block h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="cwp-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#262c27" />
          <stop offset="1" stopColor="#121513" />
        </linearGradient>
        <linearGradient id="cwp-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.09" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cwp-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0e100f" />
          <stop offset="1" stopColor="#1b1f1c" />
        </linearGradient>
        <linearGradient id="cwp-top" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#3a423b" />
          <stop offset="1" stopColor="#262b26" />
        </linearGradient>
        <linearGradient id="cwp-off" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1e1b" />
          <stop offset="1" stopColor="#0c0e0d" />
        </linearGradient>
        <linearGradient id="cwp-on" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6d6" />
          <stop offset="1" stopColor="#e8d9a4" />
        </linearGradient>
        <linearGradient id="cwp-lime" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2ff86" />
          <stop offset="1" stopColor="#a6dc12" />
        </linearGradient>
        <radialGradient id="cwp-floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={P.lime} stopOpacity="0.2" />
          <stop offset="1" stopColor={P.lime} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cwp-shadow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.9" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 바닥 빛과 그림자 */}
      <ellipse cx="280" cy={bottom + 6} rx="275" ry="24" fill="url(#cwp-floor)" />
      <ellipse cx="290" cy={bottom + 2} rx="250" ry="12" fill="url(#cwp-shadow)" />

      {/* 윗면, 옆면, 앞면 */}
      <polygon points={`${B.x},${B.y} ${B.x + B.dx},${B.y + B.dy} ${right + B.dx},${B.y + B.dy} ${right},${B.y}`} fill="url(#cwp-top)" />
      <rect x={B.x + 150} y={B.y - 30} width="70" height="16" fill="#2c322d" />
      <polygon points={`${B.x + 150},${B.y - 30} ${B.x + 166},${B.y - 39} ${B.x + 236},${B.y - 39} ${B.x + 220},${B.y - 30}`} fill="#434b44" />
      <polygon points={`${B.x + 220},${B.y - 30} ${B.x + 236},${B.y - 39} ${B.x + 236},${B.y - 23} ${B.x + 220},${B.y - 14}`} fill="#181b19" />
      <polygon points={`${right},${B.y} ${right + B.dx},${B.y + B.dy} ${right + B.dx},${bottom + B.dy} ${right},${bottom}`} fill="url(#cwp-side)" />
      <rect x={B.x} y={B.y} width={B.w} height={B.h} fill="url(#cwp-front)" />

      {/* 옆면 창: 비스듬한 띠 */}
      {Array.from({ length: ROWS }, (_, r) =>
        [0, 1].map((c) => {
          const x1 = right + 10 + c * 40;
          const x2 = x1 + 30;
          const y = B.y + 22 + r * CELL_PY;
          const on = hash(r * 2 + c, 41) < 220;
          return (
            <polygon
              key={`s${r}-${c}`}
              points={`${x1},${y + sideShift(x1)} ${x2},${y + sideShift(x2)} ${x2},${y + WIN_H + sideShift(x2)} ${x1},${y + WIN_H + sideShift(x1)}`}
              fill={on ? "#5c5640" : "#101311"}
            />
          );
        }),
      )}

      {/* 앞면 책상 칸 */}
      {CELLS.map((c) => (
        <g key={c.i}>
          <rect x={c.x} y={c.y} width={WIN_W} height={WIN_H} rx="1.5" fill="url(#cwp-off)" />
          {(c.lit || c.lime) && (
            <motion.rect
              x={c.x}
              y={c.y}
              width={WIN_W}
              height={WIN_H}
              rx="1.5"
              fill="url(#cwp-on)"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: reduce ? 0 : c.lime ? [0, 1, 0] : [0, 1, 1, 0] }}
              transition={
                reduce
                  ? { duration: 0 }
                  : c.lime
                    ? { duration: 0.5, delay: c.delay, times: [0, 0.3, 1], ease: "linear" }
                    : { duration: CELL_BLINK, delay: c.delay, times: [0, 0.12, 0.65, 1], ease: "linear" }
              }
            />
          )}
          {c.lime && (
            <motion.rect
              x={c.x}
              y={c.y}
              width={WIN_W}
              height={WIN_H}
              rx="1.5"
              fill="url(#cwp-lime)"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={reduce ? { duration: 0 } : { duration: 0.3, delay: c.delay + 0.3, ease: EASE }}
            />
          )}
          {/* 책상과 모니터 실루엣: 불 켜진 칸에서만 드러난다 */}
          <rect x={c.x + 5} y={c.y + WIN_H - 8} width={WIN_W - 10} height="2.5" fill="#0d0f0e" opacity="0.8" />
          <rect x={c.x + WIN_W / 2 - 6} y={c.y + WIN_H - 16} width="12" height="7" rx="1" fill="#0d0f0e" opacity="0.8" />
          <rect x={c.x + WIN_W / 2 - 1} y={c.y + WIN_H - 9} width="2" height="2" fill="#0d0f0e" opacity="0.8" />
        </g>
      ))}

      {/* 등장 뒤 가끔 켜지는 책상 */}
      {!reduce &&
        AMBIENT.map((c, k) => (
          <motion.rect
            key={`a${c.i}`}
            x={c.x}
            y={c.y}
            width={WIN_W}
            height={WIN_H}
            rx="1.5"
            fill="url(#cwp-on)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.75, 0.75, 0, 0] }}
            transition={{ duration: AMBIENT_CYCLE, delay: 2 + k * 1.5, times: [0, 0.5, 0.52, 0.8, 0.82, 1], repeat: Infinity, ease: "linear" }}
          />
        ))}

      {/* 앞면 광택과 모서리 하이라이트 */}
      <rect x={B.x} y={B.y} width={B.w} height={B.h} fill="url(#cwp-sheen)" pointerEvents="none" />
      <line x1={B.x} y1={B.y} x2={right} y2={B.y} stroke="#ffffff" strokeOpacity="0.32" strokeWidth="1.5" />
      <line x1={right} y1={B.y} x2={right} y2={bottom} stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.5" />
      <line x1={right} y1={B.y} x2={right + B.dx} y2={B.y + B.dy} stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
      <rect x={B.x - 6} y={bottom - 4} width={B.w + 12} height="6" fill="#1d221e" />
    </svg>
  );
}

/* ---------- 공통 조각 ---------- */

function GridMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
      <rect x="1.5" y="1.5" width="23" height="23" rx="3" fill="none" stroke={C.ink} strokeWidth="2" />
      <rect x="5" y="5" width="7" height="7" rx="1" fill={C.ink} />
      <rect x="14" y="5" width="7" height="7" rx="1" fill="none" stroke={C.ink} strokeWidth="1.6" />
      <rect x="5" y="14" width="7" height="7" rx="1" fill="none" stroke={C.ink} strokeWidth="1.6" />
      <rect x="14" y="14" width="7" height="7" rx="1" fill={C.point} />
    </svg>
  );
}

function SectionTitle({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="border-b-2 pb-3 text-[26px] font-bold leading-[1.2] md:text-[32px]" style={{ ...plexF, color: C.ink, borderColor: C.ink }}>
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
  register,
}: {
  occ: boolean[];
  selected: SeatType | null;
  reduce: boolean;
  onPick: (t: SeatType) => void;
  register: (id: string, el: SVGGraphicsElement | null) => void;
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
      <rect className="cw-focus opacity-0" x={focus.x - 3} y={focus.y - 3} width={focus.w + 6} height={focus.h + 6} rx={6} fill="none" stroke={C.point} strokeWidth={3} />
      <g ref={(el) => register(u.id, el)} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        {children}
      </g>
    </g>
  );

  const seatFill = (on: boolean) => (on ? C.ink : "#fff");

  return (
    <svg viewBox="0 0 720 450" className="block h-auto w-full" role="group" aria-label="지점 평면도. 자리를 누르면 그 유형이 선택됩니다">
      {/* 외벽과 출입구 */}
      <rect x="10" y="10" width="700" height="430" rx="4" fill="#fff" stroke={C.ink} strokeWidth="2.5" />
      <rect x="150" y="436" width="70" height="8" fill="#fff" />
      <line x1="150" y1="440" x2="220" y2="440" stroke={C.point} strokeWidth="4" />
      <text x="156" y="432" fontSize="11" fill={C.muted} style={plexF}>
        출입구
      </text>
      {/* 복도 */}
      <line x1="350" y1="24" x2="350" y2="426" stroke={C.line} strokeWidth="1" strokeDasharray="4 6" />
      <text x="300" y="232" fontSize="11" fill={C.muted} style={plexF} textAnchor="end">
        커피바, 복합기
      </text>
      <rect x="236" y="212" width="80" height="12" rx="2" fill={C.inkSoft} />

      {/* 자유석 */}
      <g style={zoneStyle("자유석")}>
        <text x="28" y="42" fontSize="13" fontWeight="700" fill={C.ink} style={plexF}>
          자유석
        </text>
        <rect x="44" y="84" width="272" height="26" rx="4" fill={C.inkSoft} />
        <rect x="44" y="160" width="272" height="26" rx="4" fill={C.inkSoft} />
        {byType("자유석").map(({ u, i }) =>
          unitGroup(u, i, <rect x={u.x} y={u.y} width={u.w} height={u.h} rx="4" fill={seatFill(occ[i])} stroke={C.ink} strokeWidth="1.5" style={{ transition: fillT }} />, u),
        )}
      </g>

      {/* 지정석 */}
      <g style={zoneStyle("지정석")}>
        <text x="28" y="242" fontSize="13" fontWeight="700" fill={C.ink} style={plexF}>
          지정석
        </text>
        {byType("지정석").map(({ u, i }) =>
          unitGroup(
            u,
            i,
            <>
              <rect x={u.x} y={u.y} width={u.w} height={u.h} rx="4" fill={seatFill(occ[i])} stroke={C.ink} strokeWidth="1.5" style={{ transition: fillT }} />
              <rect x={u.x + 20} y={u.y + u.h + 3} width="16" height="6" rx="2" fill={occ[i] ? C.ink : "#fff"} stroke={C.ink} strokeWidth="1.2" style={{ transition: fillT }} />
            </>,
            { x: u.x, y: u.y, w: u.w, h: u.h + 9 },
          ),
        )}
      </g>

      {/* 1인실 */}
      <g style={zoneStyle("1인실")}>
        <text x="380" y="42" fontSize="13" fontWeight="700" fill={C.ink} style={plexF}>
          1인실
        </text>
        {byType("1인실").map(({ u, i }) =>
          unitGroup(
            u,
            i,
            <>
              <rect x={u.x} y={u.y} width={u.w} height={u.h} fill={occ[i] ? C.inkSoft : "#fff"} stroke={C.ink} strokeWidth="1.2" style={{ transition: fillT }} />
              <line x1={u.x + 8} y1={u.y + u.h} x2={u.x + 22} y2={u.y + u.h} stroke="#fff" strokeWidth="3" />
              <rect x={u.x + 9} y={u.y + 14} width="28" height="34" rx="3" fill={seatFill(occ[i])} stroke={C.ink} strokeWidth="1.5" style={{ transition: fillT }} />
              <text x={u.x + u.w / 2} y={u.y + 66} fontSize="10" fill={occ[i] ? C.ink : C.muted} textAnchor="middle" style={monoF}>
                {u.n}
              </text>
            </>,
            u,
          ),
        )}
      </g>

      {/* 4인실 */}
      <g style={zoneStyle("4인실")}>
        <text x="380" y="162" fontSize="13" fontWeight="700" fill={C.ink} style={plexF}>
          4인실
        </text>
        {byType("4인실").map(({ u, i }) =>
          unitGroup(
            u,
            i,
            <>
              <rect x={u.x} y={u.y} width={u.w} height={u.h} fill={occ[i] ? C.inkSoft : "#fff"} stroke={C.ink} strokeWidth="1.2" style={{ transition: fillT }} />
              <line x1={u.x + 10} y1={u.y + u.h} x2={u.x + 26} y2={u.y + u.h} stroke="#fff" strokeWidth="3" />
              <rect x={u.x + 18} y={u.y + 32} width="36" height="36" rx="6" fill={seatFill(occ[i])} stroke={C.ink} strokeWidth="1.5" style={{ transition: fillT }} />
              {[
                [u.x + 36, u.y + 20],
                [u.x + 36, u.y + 80],
                [u.x + 8, u.y + 50],
                [u.x + 64, u.y + 50],
              ].map(([cx, cy], k) => (
                <circle key={k} cx={cx} cy={cy} r="5" fill={seatFill(occ[i])} stroke={C.ink} strokeWidth="1.5" style={{ transition: fillT }} />
              ))}
              <text x={u.x + u.w / 2} y={u.y + 96} fontSize="10" fill={occ[i] ? C.ink : C.muted} textAnchor="middle" style={monoF}>
                {u.n}
              </text>
            </>,
            u,
          ),
        )}
      </g>

      {/* 회의실 (예약 현황은 아래 구역에서) */}
      <g>
        <text x="380" y="304" fontSize="13" fontWeight="700" fill={C.ink} style={plexF}>
          회의실
        </text>
        <rect x="380" y="312" width="156" height="112" fill="#fff" stroke={C.ink} strokeWidth="1.2" />
        <rect x="404" y="344" width="108" height="46" rx="23" fill={C.inkSoft} />
        <text x="458" y="372" fontSize="12" fill={C.ink} textAnchor="middle" style={monoF}>
          A 6인
        </text>
        <rect x="548" y="312" width="148" height="112" fill="#fff" stroke={C.ink} strokeWidth="1.2" />
        <rect x="568" y="344" width="108" height="46" rx="23" fill={C.inkSoft} />
        <text x="622" y="372" fontSize="12" fill={C.ink} textAnchor="middle" style={monoF}>
          B 10인
        </text>
      </g>
    </svg>
  );
}

/* ---------- 요금 계산 ---------- */

function PriceCalc({ selected, onType, reduce, onTour }: { selected: SeatType | null; onType: (t: SeatType) => void; reduce: boolean; onTour: () => void }) {
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
    background: on ? C.point : "#fff",
    color: C.ink,
    borderColor: C.ink,
    outlineColor: C.ink,
  });
  const chipCls = `rounded-[4px] border-2 px-3 py-2 text-[15px] font-bold transition-colors duration-150 ${focusRing}`;
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
                <span className="mt-0.5 block text-[13px] font-semibold" style={monoF}>
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
                <span className="mt-0.5 block text-[13px] font-semibold" style={monoF}>
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
            <div role="group" aria-labelledby="cw-people-label" className="mt-2 inline-flex items-stretch rounded-[4px] border-2" style={{ borderColor: C.ink }}>
              <button type="button" aria-label="인원 줄이기" disabled={headcount <= 1} onClick={() => setPeople(Math.max(1, headcount - 1))} className={`px-3 disabled:opacity-30 ${focusRing}`} style={{ color: C.ink, outlineColor: C.ink }}>
                <Minus size={18} aria-hidden />
              </button>
              <span className="inline-flex min-w-[56px] items-center justify-center border-x-2 px-2 py-2 text-[18px] font-semibold" style={{ ...monoF, borderColor: C.ink, color: C.ink }} aria-live="polite">
                {headcount}명
              </span>
              <button type="button" aria-label="인원 늘리기" disabled={headcount >= MAX_PEOPLE[type]} onClick={() => setPeople(Math.min(MAX_PEOPLE[type], headcount + 1))} className={`px-3 disabled:opacity-30 ${focusRing}`} style={{ color: C.ink, outlineColor: C.ink }}>
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
                    <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-[4px] border-2 px-3 py-2 text-[15px] has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 ${inc ? "cursor-default" : ""}`} style={{ borderColor: on ? C.ink : C.line, background: on ? C.inkSoft : "#fff", outlineColor: C.ink }}>
                      <span className="inline-flex items-center gap-2 font-bold">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={on}
                          disabled={inc}
                          onChange={(e) => setOpts((s) => (e.target.checked ? [...s, o.id] : s.filter((x) => x !== o.id)))}
                        />
                        <span aria-hidden className="inline-flex h-5 w-5 items-center justify-center rounded-[3px] border-2" style={{ borderColor: C.ink, background: on ? C.ink : "#fff", color: "#fff" }}>
                          {on && <Check size={14} strokeWidth={3} />}
                        </span>
                        {o.label}
                      </span>
                      <span className="text-[14px] font-semibold" style={{ ...monoF, color: inc ? C.ink : C.muted }}>
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

      <div className="rounded-[6px] border-2 p-5" style={{ borderColor: C.ink, background: C.paper }} aria-live="polite">
        <p className="text-[14px] font-bold" style={{ color: C.muted }}>
          월 요금
        </p>
        <p className="mt-1 flex items-baseline gap-1" style={{ color: C.ink }}>
          <Roll value={monthly} reduce={reduce} className="text-[40px] font-semibold md:text-[46px]" />
          <span className="text-[20px] font-bold">원</span>
        </p>
        <dl className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 border-t pt-4 text-[14px]" style={{ borderColor: C.line }}>
          <dt>
            {type} {PER_PERSON[type] ? `${headcount}명` : ""}
          </dt>
          <dd className="text-right" style={monoF}>
            {won(seatMonthly)}
          </dd>
          <dt>{term.months}개월 계약 할인</dt>
          <dd className="text-right" style={monoF}>
            {discount ? `-${won(discount)}` : "0원"}
          </dd>
          {OPTIONS.filter((o) => opts.includes(o.id) && !included.includes(o.id)).map((o) => (
            <div key={o.id} className="contents">
              <dt>{o.label}</dt>
              <dd className="text-right" style={monoF}>
                +{won(o.price)}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-baseline justify-between gap-3 border-t pt-4" style={{ borderColor: C.line }}>
          <p className="text-[15px] font-bold">총액 ({term.months}개월)</p>
          <p className="flex items-baseline gap-0.5" style={{ color: C.ink }}>
            <Roll value={total} reduce={reduce} className="text-[24px] font-semibold" />
            <span className="text-[15px] font-bold">원</span>
          </p>
        </div>
        <p className="mt-1 text-right text-[13px]" style={{ color: C.muted }}>
          부가세 별도, 보증금 1개월분
        </p>
        <button type="button" onClick={onTour} data-gtm-cta="coworking_tour_price" className={`mt-5 w-full rounded-[4px] px-4 py-3 text-[16px] font-bold text-white ${focusRing}`} style={{ background: C.ink, outlineColor: C.ink }}>
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
        <p style={monoF}>{fmtKo(today)} 09:00~21:00</p>
        <p className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-3.5 w-3.5 rounded-[2px]" style={{ background: C.ink }} />
            예약됨
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block h-3.5 w-3.5 rounded-[2px] border-2 bg-white" style={{ borderColor: C.ink }} />
            빈 시간
          </span>
        </p>
      </div>

      <div className="mt-4 grid gap-6">
        {ROOMS.map((r, ri) => (
          <div key={r.id}>
            <div className="flex items-baseline justify-between">
              <h3 className="text-[18px] font-bold" style={plexF}>
                {r.name} <span style={{ ...monoF, color: C.muted }}>{r.cap}인</span>
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
                  <span key={h} role="img" aria-label={`${range} 예약됨`} className="h-11 rounded-[3px]" style={{ background: C.ink }} />
                ) : (
                  <button
                    key={h}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${range} 빈 시간`}
                    onClick={() => setPick(on ? null : { room: ri, hour: h })}
                    className={`h-11 rounded-[3px] border-2 transition-colors duration-150 hover:bg-[#d9eef2] ${focusRing}`}
                    style={{ borderColor: C.ink, background: on ? C.point : "#fff", outlineColor: C.ink }}
                  />
                );
              })}
            </div>
            <div aria-hidden className="mt-1 grid grid-cols-12 text-[11px]" style={{ ...monoF, color: C.muted }}>
              {HOURS.map((h) => (
                <span key={h} className={h % 3 === 0 ? "" : "invisible"}>
                  {p2(h)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[6px] border-2 px-4 py-3 text-[15px] leading-[1.6]" style={{ borderColor: pick ? C.ink : C.line, background: pick ? C.inkSoft : "#fff" }} aria-live="polite">
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
            <p className="text-[17px] font-bold" style={plexF}>
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

  const field = "w-full rounded-[4px] border-2 bg-white px-3 py-2.5 text-[16px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
  const label = "block text-[14px] font-bold";
  const chip = (on: boolean, off = false): CSSProperties => ({
    background: on ? C.point : "#fff",
    color: off ? C.muted : C.ink,
    borderColor: off ? C.line : C.ink,
    outlineColor: C.ink,
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
        className="mt-6 max-w-[640px] rounded-[6px] border-2 p-5 md:p-6"
        style={{ borderColor: C.ink, background: C.paper }}
        role="status"
      >
        <p className="inline-flex items-center gap-2 text-[22px] font-bold" style={{ ...plexF, color: C.ink }}>
          <Check size={22} strokeWidth={3} aria-hidden /> 투어 신청 접수
        </p>
        <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
          접수번호
        </p>
        <p className="text-[28px] font-semibold" style={{ ...monoF, color: C.ink }}>
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
          <dd style={monoF}>{maskPhone(done.phone)}</dd>
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
          className={`mt-5 rounded-[4px] border-2 px-4 py-2 text-[14px] font-bold ${focusRing}`}
          style={{ borderColor: C.ink, color: C.ink, outlineColor: C.ink }}
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
                  className={`rounded-[4px] border-2 px-1 py-2 text-center transition-colors duration-150 disabled:cursor-not-allowed ${focusRing}`}
                  style={chip(on, off)}
                >
                  <span className="block text-[12px] font-bold">{i === 0 ? "오늘" : `${DOW[d.getDay()]}요일`}</span>
                  <span className="block text-[18px] font-semibold" style={monoF}>
                    {d.getDate()}
                  </span>
                  <span className="block text-[11px]" style={{ color: off ? C.muted : C.ink }}>
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
              <button key={t} type="button" aria-pressed={time === t} onClick={() => setTime(t)} className={`rounded-[4px] border-2 px-2 py-2.5 text-[16px] font-semibold transition-colors duration-150 ${focusRing}`} style={{ ...monoF, ...chip(time === t) }}>
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
            <input id="cw-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`${field} mt-2`} style={{ borderColor: C.ink, outlineColor: C.ink }} />
          </div>
          <div>
            <label htmlFor="cw-phone" className={label} style={{ color: C.muted }}>
              휴대폰
            </label>
            <input id="cw-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" className={`${field} mt-2`} style={{ ...monoF, borderColor: C.ink, outlineColor: C.ink }} />
          </div>
          <div>
            <p id="cw-tour-people" className={label} style={{ color: C.muted }}>
              인원
            </p>
            <div role="group" aria-labelledby="cw-tour-people" className="mt-2 inline-flex w-full items-stretch rounded-[4px] border-2" style={{ borderColor: C.ink }}>
              <button type="button" aria-label="인원 줄이기" disabled={people <= 1} onClick={() => setPeople((p) => Math.max(1, p - 1))} className={`px-3 disabled:opacity-30 ${focusRing}`} style={{ color: C.ink, outlineColor: C.ink }}>
                <Minus size={18} aria-hidden />
              </button>
              <span className="inline-flex flex-1 items-center justify-center border-x-2 py-2 text-[18px] font-semibold" style={{ ...monoF, borderColor: C.ink, color: C.ink }}>
                {people}
              </span>
              <button type="button" aria-label="인원 늘리기" disabled={people >= 6} onClick={() => setPeople((p) => Math.min(6, p + 1))} className={`px-3 disabled:opacity-30 ${focusRing}`} style={{ color: C.ink, outlineColor: C.ink }}>
                <Plus size={18} aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <ul className="grid gap-1 rounded-[4px] border-2 px-4 py-3 text-[14px] font-bold" style={{ borderColor: C.error, color: C.error }} role="alert">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-[6px] border-2 p-5" style={{ borderColor: C.ink, background: C.paper }}>
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
        <button type="submit" data-gtm-cta="coworking_tour_submit" className={`mt-5 w-full rounded-[4px] px-4 py-3 text-[16px] font-bold text-white ${focusRing}`} style={{ background: C.ink, outlineColor: C.ink }}>
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
      <div className="rounded-[6px] border-2 overflow-hidden" style={{ borderColor: C.ink }}>
        <MiniMap />
      </div>
      <div className="grid gap-5 text-[15px] leading-[1.7]">
        <div>
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>
            주소
          </p>
          <p className="text-[17px] font-bold" style={plexF}>
            {ADDRESS}
          </p>
        </div>
        <ul className="grid gap-3">
          <li className="flex items-start gap-3">
            <TrainFront size={20} aria-hidden className="mt-1 flex-none" style={{ color: C.ink }} />
            <span>
              ㅇㅇ역 3번 출구 <b style={monoF}>도보 4분</b>. 출구에서 직진 후 첫 사거리 왼쪽 ㅇㅇ빌딩
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
                      {on && <span className="ml-2 rounded-[3px] px-1.5 py-0.5 text-[12px] font-bold" style={{ background: C.point, color: C.ink }}>오늘</span>}
                    </th>
                    <td className="border-b px-2 py-2" style={{ ...monoF, borderColor: C.line }}>
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
      <text x="20" y="266" fontSize="13" fill={C.muted} style={plexF}>
        ㅇㅇ대로
      </text>
      <text x="313" y="40" fontSize="12" fill={C.muted} style={plexF} transform="rotate(90 313 40)">
        ㅇㅇ로
      </text>
      {/* 걷는 길 */}
      <path d="M 330 300 L 313 300 L 313 180 L 240 180" fill="none" stroke={C.ink} strokeWidth="3" strokeDasharray="7 6" strokeLinecap="round" />
      <text x="322" y="170" fontSize="12" fontWeight="700" fill={C.ink} style={monoF}>
        도보 4분
      </text>
      {/* 역 */}
      <circle cx="352" cy="304" r="16" fill="#fff" stroke={C.ink} strokeWidth="3" />
      <text x="352" y="309" fontSize="12" fontWeight="700" fill={C.ink} textAnchor="middle" style={plexF}>
        역
      </text>
      <text x="376" y="300" fontSize="13" fontWeight="700" fill={C.ink} style={plexF}>
        ㅇㅇ역
      </text>
      <text x="376" y="318" fontSize="12" fill={C.muted} style={plexF}>
        3번 출구
      </text>
      {/* 건물 */}
      <rect x="160" y="130" width="80" height="80" rx="3" fill={C.point} stroke={C.ink} strokeWidth="2.5" />
      <text x="200" y="166" fontSize="13" fontWeight="700" fill={C.ink} textAnchor="middle" style={plexF}>
        ㅇㅇ빌딩
      </text>
      <text x="200" y="186" fontSize="12" fontWeight="700" fill={C.ink} textAnchor="middle" style={plexF}>
        5층
      </text>
      <text x="200" y="120" fontSize="12" fill={C.muted} textAnchor="middle" style={plexF}>
        주차 지하 1~3층
      </text>
      {/* 주변 */}
      <rect x="170" y="296" width="100" height="44" rx="2" fill="#fff" stroke={C.line} />
      <text x="220" y="322" fontSize="12" fill={C.muted} textAnchor="middle" style={plexF}>
        편의점
      </text>
      <rect x="360" y="40" width="120" height="70" rx="2" fill="#fff" stroke={C.line} />
      <text x="420" y="80" fontSize="12" fill={C.muted} textAnchor="middle" style={plexF}>
        우체국
      </text>
    </svg>
  );
}
