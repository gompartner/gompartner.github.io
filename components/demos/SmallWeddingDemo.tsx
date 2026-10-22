"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { Bus, Car, ChevronLeft, ChevronRight, DoorOpen, Flower2, MessageCircle, TrainFront, Trees } from "lucide-react";
import { Noto_Serif_KR } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 스몰웨딩 홀 홈페이지 샘플: 가상의 곰파트너홀. 하객 30~120명, 홀 하나와 야외 정원, 식사와 꽃장식 패키지.
   상호, 주소, 직원, 손님 이름은 모두 가상이다.

   국내 스몰웨딩 홀 사이트의 공통 구성을 따랐다. 메뉴는 공간 소개, 패키지와 비용, 예약 현황, 상담신청, 오시는 길.
   첫 화면에는 예약 가능한 날짜(토, 일 중심)와 시간대(11시, 13시, 15시, 17시)가 바로 보이고,
   패키지는 대관료 + 식사(1인 단가 x 하객 수) + 꽃장식 + 추가 옵션으로 적는다(부가세 별도 표기).
   하객 주차 2시간 무료, 신부 대기실, 지하철역 셔틀 운행은 거의 모든 홀이 적는 관용 문구다.

   핵심 모션: 첫 진입 인트로(상호가 글자 한 자씩 선으로 그려지고 커튼 두 장이 열림, 한 세션에 한 번),
   섹션 와이프(다음 섹션이 아래에서 clip-path로 덮으며 올라옴, 앞 섹션은 sticky로 뒤에 남음), D-day 숫자 롤링.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 날짜와 시간 고르기: 12개월 달력(토, 일 예약, 마감 표시)과 시간대 4개. 고르면 D-day가 롤링하고 홀 그림의 햇빛 방향이 바뀐다.
   2. 하객 수에 따른 홀 배치: 슬라이더(30~120)에 맞춰 8인 원형 테이블이 평면도에 늘고 줄며, 야외 정원 사용을 켤 수 있다.
   3. 패키지 견적: 대관(시간대별), 식사(코스 또는 뷔페 x 하객 수), 꽃장식(기본, 풍성), 음향과 사진 추가. 합계 롤링.
   4. 상담신청과 방문 예약: 두 사람 이름, 휴대폰, 희망 예식일, 방문 희망일. 완료 화면에 접수번호, 담당 창구, 회신 예정일.
   5. 공간 안내와 오시는 길: 홀, 정원, 신부 대기실, 주차, 지하철과 셔틀, 상담 운영시간(오늘 요일 진하게). */

const BRAND = "곰파트너홀";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00";
const KAKAO = "카카오톡 채널 곰파트너";
const HALL_MIN = 30;
const HALL_MAX = 120;
const SEAT = 8;
const MONTHS = 12;
const HEADER_H = 56;

const C = {
  ivory: "#f4eee3",
  ivoryDeep: "#e9e1d0",
  paper: "#fffdf8",
  olive: "#3f5a36",
  oliveDeep: "#2c4026",
  sage: "#8a9a7b",
  ink: "#1f2419",
  muted: "#5f6657",
  line: "#d6cdbb",
  error: "#b42318",
};

const serif = { fontFamily: `${Noto_Serif_KR.style.fontFamily}, serif` } as const;

/* 모션 값(ms). 모두 reduce면 0 */
const EASE = [0.22, 1, 0.36, 1] as const;
const INTRO_LETTER_MS = 450; // 글자 하나를 선으로 그리는 시간
const INTRO_STAGGER_MS = 110; // 다음 글자가 시작하는 간격
const CURTAIN_DELAY_MS = 720; // 커튼이 열리기 시작하는 시점
const CURTAIN_MS = 520; // 커튼이 열리는 시간
const INTRO_TOTAL_MS = 1300; // 인트로 전체(이후 덮개를 지운다)
const ROLL_MS = 650; // 숫자 롤링
const LIGHT_MS = 800; // 홀 그림의 햇빛 방향 전환
const TABLE_MS = 320; // 테이블 하나 등장
const TABLE_STAGGER_MS = 60; // 테이블 등장 간격
const WIPE_RADIUS = 40; // 와이프 윗모서리 둥글기(px)
const INTRO_DASH = 900; // 글자 윤곽선 길이 추정값. 획이 많은 글자도 이 안에 든다
const INTRO_KEY = "sw-intro-seen";

const SLOTS = [
  { time: "11:00", rent: 2200000, note: "오전 햇빛" },
  { time: "13:00", rent: 3000000, note: "가장 먼저 마감" },
  { time: "15:00", rent: 2600000, note: "오후 햇빛" },
  { time: "17:00", rent: 1500000, note: "노을과 조명" },
];
const MEALS = [
  { id: "course", name: "코스", price: 85000, desc: "전채, 수프, 메인, 디저트 4코스" },
  { id: "buffet", name: "뷔페", price: 65000, desc: "한식과 양식 60여 가지" },
];
const FLOWERS = [
  { id: "basic", name: "기본", price: 1200000, desc: "단상 아치, 버진로드, 테이블 센터피스" },
  { id: "full", name: "풍성", price: 2500000, desc: "기본에 천장 설치와 포토존 추가" },
];
const EXTRAS = [
  { id: "sound", name: "음향과 사회자 마이크", price: 300000 },
  { id: "photo", name: "본식 스냅 사진", price: 800000 },
];
const GARDEN_FEE = 300000;

/* 시간대별 햇빛. shift는 창에서 바닥으로 뻗는 빛의 가로 이동, spread는 바닥에서 퍼지는 폭 */
const LIGHT = [
  { shift: 70, spread: 24, color: "#fff6d2", alpha: 0.5, glass: "#dfe9ee" },
  { shift: 12, spread: 10, color: "#fffbea", alpha: 0.42, glass: "#d9e6f0" },
  { shift: -50, spread: 24, color: "#ffeec4", alpha: 0.5, glass: "#e6e1cf" },
  { shift: -120, spread: 60, color: "#f6c58f", alpha: 0.66, glass: "#efb77d" },
];

const DAY_MS = 86400000;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const DOW_FULL = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const manwon = (n: number) => `${Math.round(n / 10000).toLocaleString("ko-KR")}만원`;
const diffDays = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / DAY_MS);
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

function hash(n: number) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) % 1000;
}
const dayKey = (d: Date) => d.getFullYear() * 1000 + Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / DAY_MS);

/** 이미 예약된 시간대. 실제로는 예약 장부에서 읽는다. 가까운 날과 13시가 먼저 찬다. */
function slotTaken(today: Date, d: Date, i: number) {
  const diff = diffDays(d, today);
  const near = diff < 60 ? 520 : diff < 180 ? 330 : 200;
  return hash(dayKey(d) * 7 + i) < near + (i === 1 ? 150 : 0);
}
const dayFull = (today: Date, d: Date) => SLOTS.every((_, i) => slotTaken(today, d, i));

/** 처음 보여 줄 날: 넉 달쯤 뒤 첫 토요일 중 자리가 남은 날 */
function defaultDate(today: Date) {
  let d = daysAgo(today, -120);
  while (d.getDay() !== 6) d = daysAgo(d, -1);
  while (dayFull(today, d)) d = daysAgo(d, -7);
  return d;
}
function firstOpenSlot(today: Date, d: Date) {
  const order = [1, 2, 0, 3];
  return order.find((i) => !slotTaken(today, d, i)) ?? 1;
}
/** 다음 영업일. 상담은 월요일에 쉰다. */
function nextBizDay(today: Date) {
  let r = daysAgo(today, -1);
  if (r.getDay() === 1) r = daysAgo(r, -1);
  return r;
}

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const btnBase = `inline-flex items-center justify-center gap-1.5 font-bold transition-[background-color,color] duration-150 ${focusRing}`;

/* 테이블 자리. 버진로드(가운데) 가까운 앞줄부터 채운다. */
const COLS_L = [92, 152, 212];
const COLS_R = [308, 368, 428];
const ROWS = [132, 196, 260];
const SPOTS: [number, number][] = [];
for (const y of ROWS) for (let k = 0; k < 3; k++) SPOTS.push([COLS_L[2 - k], y], [COLS_R[k], y]);

type Pick = { date: Date | null; slot: number | null };
type Lead = { no: string; groom: string; bride: string; phone: string; wedding: string; visit: string };

export function SmallWeddingDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  // 인트로는 한 세션에 한 번. 서버 렌더에는 넣지 않아 JS가 없어도 첫 화면이 보인다.
  const [intro, setIntro] = useState(false);
  useEffect(() => {
    if (reduce) return;
    let seen = true;
    try {
      seen = !!sessionStorage.getItem(INTRO_KEY);
      if (!seen) sessionStorage.setItem(INTRO_KEY, "1");
    } catch {}
    if (seen) return;
    const frame = requestAnimationFrame(() => setIntro(true));
    const t = window.setTimeout(() => setIntro(false), INTRO_TOTAL_MS);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t);
    };
    // 첫 마운트 때 한 번만 판단한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [pick, setPick] = useState<Pick>({ date: null, slot: null });
  const date = pick.date ?? defaultDate(today);
  const slot = pick.slot ?? firstOpenSlot(today, date);
  const dday = diffDays(date, today);

  const [guests, setGuests] = useState({ n: 80, from: 10 });
  const tables = Math.ceil(guests.n / SEAT);
  const [garden, setGarden] = useState(false);

  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  /** 겹쳐 있는 섹션은 getBoundingClientRect가 붙은 자리라서, 앞에 둔 기준 요소(id-top)의 위치로 옮긴다 */
  const go = (id: string) => {
    const mark = document.getElementById(`${id}-top`) ?? document.getElementById(id);
    if (!mark) return;
    const top = mark.getBoundingClientRect().top + window.scrollY - HEADER_H;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
  };

  const NAV = [
    ["sw-hero", "예약 현황"],
    ["sw-layout", "홀 배치"],
    ["sw-package", "패키지와 비용"],
    ["sw-space", "공간 안내"],
    ["sw-consult", "상담신청"],
  ] as const;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.ivory, color: C.ink }}>
      <AnimatePresence>{intro && <Intro key="intro" />}</AnimatePresence>

      {/* 머리글과 스크롤 진행 바 */}
      <header className="fixed inset-x-0 top-0 z-40 border-b" style={{ height: HEADER_H, background: C.ivory, borderColor: C.line }}>
        <motion.div aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left" style={{ background: C.olive, scaleX: scrollYProgress }} />
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
          <button type="button" onClick={() => go("sw-hero")} className={`${focusRing} text-[20px] leading-none`} style={{ ...serif, color: C.olive, fontWeight: 700, outlineColor: C.olive }}>
            {BRAND}
          </button>
          <nav aria-label="메뉴" className="hidden items-center gap-5 text-[15px] md:flex">
            {NAV.slice(0, 4).map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={`${focusRing} underline-offset-4 hover:underline`} style={{ outlineColor: C.olive }}>
                {label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => go("sw-consult")}
            data-gtm-cta="small-wedding_consult_go"
            className={`${btnBase} rounded-[4px] px-4 py-2 text-[14px]`}
            style={{ background: C.olive, color: C.ivory, outlineColor: C.olive }}
          >
            상담신청
          </button>
        </div>
      </header>

      {/* 첫 화면. 겹침 없이 보통 흐름에 둔다. 가이드와 메뉴가 바로 찾아올 수 있게 */}
      <section id="sw-hero" aria-labelledby="sw-title" className="relative mx-auto grid max-w-[1200px] gap-10 px-4 pb-16 md:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12 lg:pb-24" style={{ paddingTop: HEADER_H + 36 }}>
        <div className="min-w-0">
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>
            스몰웨딩 홀, {ADDRESS}
          </p>
          <h1 id="sw-title" className="mt-2 text-[40px] leading-[1.15] md:text-[52px]" style={{ ...serif, fontWeight: 700, color: C.olive }}>
            {BRAND}
          </h1>
          <p className="mt-3 text-[17px] leading-[1.6]">하객 30명부터 120명까지. 홀 하나와 야외 정원, 식사와 꽃장식까지 한 곳에서 해요.</p>

          <div id="sw-dday" className="mt-8 rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.paper }}>
            <p className="text-[14px] font-bold" style={{ color: C.muted }}>
              고른 예식일까지
            </p>
            <p className="mt-1 text-[64px] leading-none md:text-[80px]" style={{ ...serif, fontWeight: 700, color: C.olive }}>
              <Roll text={`D-${dday}`} reduce={reduce} />
            </p>
            <p className="mt-3 text-[17px] leading-[1.6]">
              {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일 <b>{DOW_FULL[date.getDay()]}</b> {SLOTS[slot].time}
              <span className="ml-2 text-[15px]" style={{ color: C.muted }}>
                {Math.floor(dday / 7)}주 {dday % 7}일 남음
              </span>
            </p>
          </div>

          <HallScene slot={slot} reduce={reduce} />
        </div>

        <div id="sw-date" className="min-w-0 rounded-[6px] border p-4 md:p-6" style={{ borderColor: C.line, background: C.paper }}>
          <h2 className="text-[22px]" style={{ ...serif, fontWeight: 700 }}>
            예약 현황
          </h2>
          <Calendar today={today} date={date} onPick={(d) => setPick({ date: d, slot: slotTaken(today, d, slot) ? null : slot })} />
          <p className="mt-5 text-[15px] font-bold">시간대</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="예식 시간대">
            {SLOTS.map((s, i) => {
              const taken = slotTaken(today, date, i);
              const on = i === slot;
              return (
                <button
                  key={s.time}
                  type="button"
                  disabled={taken}
                  aria-pressed={on}
                  onClick={() => setPick({ date, slot: i })}
                  className={`${focusRing} rounded-[4px] border px-2 py-2.5 text-left leading-[1.4] disabled:cursor-not-allowed`}
                  style={{
                    borderColor: on ? C.olive : C.line,
                    background: on ? C.olive : taken ? C.ivoryDeep : C.paper,
                    color: on ? C.ivory : taken ? C.muted : C.ink,
                    outlineColor: C.olive,
                  }}
                >
                  <span className="block text-[17px] font-bold tabular-nums">{s.time}</span>
                  <span className="block text-[13px]">{taken ? "마감" : `대관 ${manwon(s.rent)}`}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => go("sw-consult")}
            data-gtm-cta="small-wedding_date_consult"
            className={`${btnBase} mt-5 w-full rounded-[4px] py-3 text-[16px]`}
            style={{ background: C.olive, color: C.ivory, outlineColor: C.olive }}
          >
            이 날짜로 상담신청
          </button>
          <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
            평일 예식은 상담으로 문의해 주세요. 조기 마감될 수 있습니다.
          </p>
        </div>
      </section>

      {/* 아래 섹션들은 sticky로 겹치고, 다음 섹션이 clip-path 와이프로 덮으며 올라온다. 첫 와이프가 걷히기 전 바탕은 짙은 올리브 */}
      <div className="relative" style={{ background: C.oliveDeep }}>
        <Panel id="sw-layout" z={2} bg={C.olive} color={C.ivory} reduce={reduce}>
          <LayoutSection guests={guests} setGuests={setGuests} tables={tables} garden={garden} setGarden={setGarden} reduce={reduce} />
        </Panel>

        <Panel id="sw-package" z={3} bg={C.ivory} color={C.ink} reduce={reduce}>
          <PackageSection slot={slot} guests={guests.n} garden={garden} reduce={reduce} />
        </Panel>

        <Panel id="sw-space" z={4} bg={C.ivoryDeep} color={C.ink} reduce={reduce}>
          <SpaceSection today={today} />
        </Panel>

        <Panel id="sw-consult" z={5} bg={C.olive} color={C.ivory} reduce={reduce}>
          <ConsultSection today={today} date={date} />
        </Panel>
      </div>

      <footer className="relative z-10 border-t px-4 pb-24 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ background: C.ivory, borderColor: C.line, color: C.muted }}>
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[18px]" style={{ ...serif, fontWeight: 700, color: C.olive }}>
            {BRAND}
          </p>
          <p>
            {ADDRESS}, 상담 화~일 10:00~19:00, 월요일 휴무, {KAKAO}
          </p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

/* 인트로: 상호 글자가 한 자씩 윤곽선으로 그려지고 채워진 뒤, 올리브색 커튼 두 장이 양옆으로 열린다 */
function Intro() {
  const letters = BRAND.split("");
  const w = 92;
  const st = INTRO_STAGGER_MS / 1000;
  return (
    <motion.div className="fixed inset-0 z-[80] overflow-hidden" aria-hidden exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
      <motion.div className="absolute inset-y-0 left-0 w-1/2" style={{ background: C.olive }} initial={{ x: 0 }} animate={{ x: "-101%" }} transition={{ delay: CURTAIN_DELAY_MS / 1000, duration: CURTAIN_MS / 1000, ease: EASE }} />
      <motion.div className="absolute inset-y-0 right-0 w-1/2" style={{ background: C.olive }} initial={{ x: 0 }} animate={{ x: "101%" }} transition={{ delay: CURTAIN_DELAY_MS / 1000, duration: CURTAIN_MS / 1000, ease: EASE }} />
      <motion.svg
        viewBox={`0 0 ${w * letters.length + 40} 120`}
        className="absolute left-1/2 top-1/2 w-[min(84vw,560px)] -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: CURTAIN_DELAY_MS / 1000, duration: 0.28 }}
      >
        {letters.map((ch, i) => (
          <motion.text
            key={i}
            x={20 + w * i + w / 2}
            y={86}
            textAnchor="middle"
            fontSize={78}
            style={{ ...serif, fontWeight: 700 }}
            fill={C.ivory}
            stroke={C.ivory}
            strokeWidth={1.3}
            strokeLinejoin="round"
            strokeDasharray={INTRO_DASH}
            initial={{ strokeDashoffset: INTRO_DASH, fillOpacity: 0 }}
            animate={{ strokeDashoffset: 0, fillOpacity: 1 }}
            transition={{
              strokeDashoffset: { delay: i * st, duration: INTRO_LETTER_MS / 1000, ease: "easeInOut" },
              fillOpacity: { delay: i * st + 0.28, duration: 0.22 },
            }}
          >
            {ch}
          </motion.text>
        ))}
      </motion.svg>
    </motion.div>
  );
}

/* 겹침 섹션. 앞 섹션은 화면에 붙어 남고(화면보다 길면 바닥을 맞춰 붙는다), 이 섹션은 아래에서 올라오며
   위쪽이 clip-path로 가려져 있다가 위치에 따라 걷힌다. 가려지는 높이 = 섹션 윗변의 화면 위치라서 걷히는 선이 스크롤의 두 배 속도로 올라간다. */
function Panel({ id, z, bg, color, reduce, children }: { id: string; z: number; bg: string; color: string; reduce: boolean; children: React.ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [top, setTop] = useState(0);
  const start = useMotionValue(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    if (!el) return;
    const mark = el.previousElementSibling as HTMLElement | null;
    const measure = () => {
      setTop(Math.min(0, window.innerHeight - el.offsetHeight));
      if (mark) start.set(mark.getBoundingClientRect().top + window.scrollY);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [el, start]);

  const clip = useTransform([scrollY, start], ([s, st]) => {
    const y = Math.max(0, (st as number) - (s as number));
    const r = Math.min(WIPE_RADIUS, y);
    return `inset(${y}px 0 0 0 round ${r}px ${r}px 0 0)`;
  });

  return (
    <>
      <div id={`${id}-top`} aria-hidden className="h-0" />
      <motion.section
        id={id}
        ref={setEl}
        aria-labelledby={`${id}-title`}
        style={{
          background: bg,
          color,
          zIndex: z,
          position: reduce ? "relative" : "sticky",
          top: reduce ? undefined : top,
          clipPath: reduce ? "none" : clip,
        }}
      >
        {/* 짧은 섹션은 한 화면 높이를 채우고 내용을 세로 가운데에 둔다 */}
        <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col justify-center px-4 pb-20 md:px-6" style={{ paddingTop: HEADER_H + 40 }}>
          {children}
        </div>
      </motion.section>
    </>
  );
}

/* 숫자 롤링. 숫자 자리마다 0~9 띠가 세로로 움직인다. 글자 수가 바뀌면 오른쪽 자리부터 그대로 둔다 */
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
function Roll({ text, reduce }: { text: string; reduce: boolean }) {
  const chars = text.split("");
  return (
    <span className="inline-flex tabular-nums">
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex" style={{ lineHeight: 1 }}>
        {chars.map((ch, i) => {
          const key = chars.length - i;
          if (!/\d/.test(ch)) return <span key={`c${key}`}>{ch}</span>;
          return (
            <span key={`d${key}`} className="relative inline-block overflow-hidden" style={{ height: "1em", width: "1ch" }}>
              <motion.span className="absolute left-0 top-0 block" initial={false} animate={{ y: `${-Number(ch)}em` }} transition={reduce ? { duration: 0 } : { duration: ROLL_MS / 1000, ease: EASE }}>
                {DIGITS.map((n) => (
                  <span key={n} className="block" style={{ height: "1em", lineHeight: 1 }}>
                    {n}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
}

/* 홀 그림. 뒤쪽 창 세 개로 들어오는 빛이 시간대에 따라 방향과 색을 바꾼다 */
function HallScene({ slot, reduce }: { slot: number; reduce: boolean }) {
  const L = LIGHT[slot];
  const tr = reduce ? { duration: 0 } : { duration: LIGHT_MS / 1000, ease: EASE };
  const windows = [60, 200, 340];
  const beam = (x: number) => `${x},200 ${x + 80},200 ${x + 80 + L.shift + L.spread},298 ${x + L.shift - L.spread},298`;
  return (
    <figure className="mt-6">
      <svg viewBox="0 0 480 300" role="img" aria-label={`${SLOTS[slot].time} 예식 때 홀에 드는 빛`} className="block w-full rounded-[6px] border" style={{ borderColor: C.line }}>
        <rect width="480" height="210" fill="#efe8da" />
        <rect y="210" width="480" height="90" fill="#dcd1bb" />
        <rect y="208" width="480" height="3" fill="#c9bda4" />
        {windows.map((x) => (
          <g key={x}>
            <path d={`M${x},200 V90 a40,40 0 0 1 80,0 V200 Z`} fill="#c7bda7" />
            <motion.path d={`M${x + 6},200 V92 a34,34 0 0 1 68,0 V200 Z`} initial={false} animate={{ fill: L.glass }} transition={tr} />
            <line x1={x + 40} y1="60" x2={x + 40} y2="200" stroke="#c7bda7" strokeWidth="3" />
            <line x1={x + 6} y1="130" x2={x + 74} y2="130" stroke="#c7bda7" strokeWidth="3" />
          </g>
        ))}
        {windows.map((x) => (
          <motion.polygon key={`b${x}`} initial={false} animate={{ points: beam(x), fill: L.color, fillOpacity: L.alpha }} transition={tr} />
        ))}
        {/* 단상 아치와 꽃 */}
        <path d="M200,200 V120 a40,40 0 0 1 80,0 V200" fill="none" stroke={C.olive} strokeWidth="9" strokeLinecap="round" />
        {[196, 212, 232, 248, 268, 284].map((cx, i) => (
          <circle key={cx} cx={cx} cy={[150, 116, 92, 92, 116, 150][i]} r="7" fill={C.paper} stroke={C.sage} strokeWidth="2" />
        ))}
        <rect x="170" y="196" width="140" height="10" rx="2" fill="#b8ad95" />
        {/* 테이블 */}
        {[70, 150, 330, 410].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy="252" rx="34" ry="12" fill={C.paper} stroke="#c9bda4" />
            <ellipse cx={cx} cy="246" rx="5" ry="3" fill={C.sage} />
          </g>
        ))}
        {/* 샹들리에 */}
        <line x1="240" y1="0" x2="240" y2="34" stroke="#b8ad95" strokeWidth="2" />
        <path d="M212,46 a28,14 0 0 0 56,0 Z" fill="#b8ad95" />
      </svg>
      <figcaption className="mt-2 text-[14px]" style={{ color: C.muted }}>
        {SLOTS[slot].time} 예식, {SLOTS[slot].note}. 창은 남서쪽이라 오후에 빛이 깊게 들어와요.
      </figcaption>
    </figure>
  );
}

/* 달력: 오늘부터 12개월. 토, 일만 예약 버튼, 마감된 날은 표시만 */
function Calendar({ today, date, onPick }: { today: Date; date: Date; onPick: (d: Date) => void }) {
  const [off, setOff] = useState(4);
  const first = new Date(today.getFullYear(), today.getMonth() + off, 1);
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1))];
  const navBtn = `${focusRing} inline-flex h-9 w-9 items-center justify-center rounded-[4px] border disabled:opacity-40`;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setOff((o) => Math.max(0, o - 1))} disabled={off === 0} aria-label="이전 달" className={navBtn} style={{ borderColor: C.line, outlineColor: C.olive }}>
          <ChevronLeft size={18} aria-hidden />
        </button>
        <p className="text-[18px] font-bold tabular-nums" aria-live="polite">
          {first.getFullYear()}년 {first.getMonth() + 1}월
        </p>
        <button type="button" onClick={() => setOff((o) => Math.min(MONTHS - 1, o + 1))} disabled={off === MONTHS - 1} aria-label="다음 달" className={navBtn} style={{ borderColor: C.line, outlineColor: C.olive }}>
          <ChevronRight size={18} aria-hidden />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[13px] font-bold" style={{ color: C.muted }} aria-hidden>
        {DOW.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1" role="group" aria-label="예식일 선택">
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const past = d.getTime() < today.getTime();
          const weekend = isWeekend(d);
          const full = weekend && !past && dayFull(today, d);
          const on = sameDay(d, date);
          const can = weekend && !past && !full;
          const label = `${d.getMonth() + 1}월 ${d.getDate()}일 ${DOW_FULL[d.getDay()]}${full ? " 마감" : can ? " 예약 가능" : ""}`;
          return (
            <button
              key={d.getTime()}
              type="button"
              disabled={!can}
              aria-pressed={on}
              aria-label={label}
              onClick={() => onPick(d)}
              className={`${focusRing} relative flex h-11 flex-col items-center justify-center rounded-[4px] text-[15px] tabular-nums disabled:cursor-default`}
              style={{
                background: on ? C.olive : can ? C.ivory : "transparent",
                color: on ? C.ivory : can ? C.ink : C.muted,
                outlineColor: C.olive,
                textDecoration: full ? "line-through" : undefined,
                fontWeight: can || on ? 700 : 400,
              }}
            >
              {d.getDate()}
              {full && <span className="text-[10px] leading-none">마감</span>}
              {sameDay(d, today) && <span aria-hidden className="absolute bottom-1 h-[3px] w-4 rounded-full" style={{ background: on ? C.ivory : C.olive }} />}
            </button>
          );
        })}
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px]" style={{ color: C.muted }}>
        <span>진한 글자: 예약 가능</span>
        <span>줄 그어진 날: 마감</span>
        <span>밑줄: 오늘</span>
      </p>
    </div>
  );
}

/* 2. 하객 수에 따른 홀 배치 */
function LayoutSection({
  guests,
  setGuests,
  tables,
  garden,
  setGarden,
  reduce,
}: {
  guests: { n: number; from: number };
  setGuests: (g: { n: number; from: number }) => void;
  tables: number;
  garden: boolean;
  setGarden: (v: boolean) => void;
  reduce: boolean;
}) {
  const spare = tables * SEAT - guests.n;
  const tr = (i: number) => (reduce ? { duration: 0 } : { duration: TABLE_MS / 1000, ease: EASE, delay: (Math.max(0, i - guests.from) * TABLE_STAGGER_MS) / 1000 });
  return (
    <>
      <h2 id="sw-layout-title" className="text-[30px] leading-[1.25] md:text-[38px]" style={{ ...serif, fontWeight: 700 }}>
        하객 수에 맞춘 홀 배치
      </h2>
      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-12">
        <div>
          <label htmlFor="sw-guests" className="block text-[16px] font-bold">
            하객 수 <span className="tabular-nums text-[28px]">{guests.n}</span>명
          </label>
          <input
            id="sw-guests"
            type="range"
            min={HALL_MIN}
            max={HALL_MAX}
            step={2}
            value={guests.n}
            onChange={(e) => setGuests({ n: Number(e.target.value), from: tables })}
            className={`${focusRing} mt-3 w-full`}
            style={{ accentColor: C.ivory, outlineColor: C.ivory }}
          />
          <div className="mt-1 flex justify-between text-[13px] tabular-nums" style={{ color: C.ivoryDeep }}>
            <span>{HALL_MIN}명</span>
            <span>{HALL_MAX}명</span>
          </div>
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[16px]">
            <dt style={{ color: C.ivoryDeep }}>테이블</dt>
            <dd className="tabular-nums">
              <b>{tables}개</b> (8인 원형)
            </dd>
            <dt style={{ color: C.ivoryDeep }}>남는 자리</dt>
            <dd className="tabular-nums">{spare}석</dd>
            <dt style={{ color: C.ivoryDeep }}>동선</dt>
            <dd>{tables <= 8 ? "앞쪽 두 줄만 써서 단상이 가까워요" : tables <= 12 ? "세 줄, 버진로드 양쪽으로 나눠요" : "세 줄 가득, 뒷줄은 통로를 넓혀요"}</dd>
          </dl>
          <button
            type="button"
            role="switch"
            aria-checked={garden}
            onClick={() => setGarden(!garden)}
            className={`${focusRing} mt-6 flex w-full items-center justify-between rounded-[4px] border-2 px-4 py-3 text-left text-[16px]`}
            style={{ borderColor: C.ivory, background: garden ? C.ivory : "transparent", color: garden ? C.olive : C.ivory, outlineColor: C.ivory }}
          >
            <span className="inline-flex items-center gap-2 font-bold">
              <Trees size={18} aria-hidden /> 야외 정원 사용
            </span>
            <span className="text-[14px]">{garden ? `켬, ${won(GARDEN_FEE)}` : "끔"}</span>
          </button>
          <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: C.ivoryDeep }}>
            정원은 식전 음료와 사진 촬영에 써요. 비가 오면 홀 로비로 바꿔요.
          </p>
        </div>

        <figure className="min-w-0">
          <svg viewBox="0 0 760 320" role="img" aria-label={`하객 ${guests.n}명, 테이블 ${tables}개 배치도${garden ? ", 야외 정원 사용" : ""}`} className="block w-full rounded-[6px]" style={{ background: C.ivory }}>
            {/* 홀 */}
            <rect x="20" y="20" width="480" height="280" rx="4" fill={C.paper} stroke={C.olive} strokeWidth="2" />
            <rect x="190" y="34" width="140" height="42" rx="3" fill={C.ivoryDeep} stroke={C.sage} />
            <text x="260" y="60" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.olive}>
              단상
            </text>
            <rect x="248" y="76" width="24" height="224" fill={C.ivoryDeep} />
            <text x="260" y="312" textAnchor="middle" fontSize="11" fill={C.muted}>
              입구
            </text>
            <text x="30" y="40" fontSize="12" fill={C.muted}>
              홀 (최대 120명)
            </text>
            <AnimatePresence>
              {SPOTS.slice(0, tables).map(([x, y], i) => (
                <motion.g
                  key={`${x}-${y}`}
                  initial={reduce ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                  transition={tr(i)}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                >
                  {DIGITS.slice(0, SEAT).map((k) => {
                    const a = (Math.PI * 2 * k) / SEAT;
                    return <circle key={k} cx={x + Math.cos(a) * 22} cy={y + Math.sin(a) * 22} r="3.4" fill={C.sage} />;
                  })}
                  <circle cx={x} cy={y} r="15" fill={C.paper} stroke={C.olive} strokeWidth="2" />
                  <circle cx={x} cy={y} r="4" fill={C.sage} />
                </motion.g>
              ))}
            </AnimatePresence>
            {/* 정원 */}
            <motion.rect x="530" y="20" width="210" height="280" rx="4" strokeWidth="2" strokeDasharray={garden ? "0" : "8 6"} initial={false} animate={{ fill: garden ? "#d9e3cf" : "rgba(217,227,207,0)", stroke: garden ? C.olive : C.sage }} transition={reduce ? { duration: 0 } : { duration: 0.4 }} />
            <text x="540" y="40" fontSize="12" fill={C.muted}>
              {garden ? "야외 정원 (식전 음료, 사진)" : "야외 정원 (사용 안 함)"}
            </text>
            <AnimatePresence>
              {garden &&
                [
                  [580, 110],
                  [690, 110],
                  [635, 170],
                  [580, 230],
                  [690, 230],
                ].map(([x, y], i) => (
                  <motion.g key={`g${x}-${y}`} initial={reduce ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={reduce ? { duration: 0 } : { duration: 0.3, delay: i * 0.05 }} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
                    <circle cx={x} cy={y} r="9" fill={C.paper} stroke={C.olive} strokeWidth="2" />
                  </motion.g>
                ))}
            </AnimatePresence>
            {garden && (
              <>
                <path d="M560,290 q20,-14 40,0 t40,0 t40,0 t40,0" fill="none" stroke={C.olive} strokeWidth="2" />
                <text x="635" y="70" textAnchor="middle" fontSize="11" fill={C.olive}>
                  포토존
                </text>
              </>
            )}
            <path d="M500,150 h30" stroke={C.olive} strokeWidth="2" strokeDasharray="4 3" />
          </svg>
          <figcaption className="mt-2 text-[14px]" style={{ color: C.ivoryDeep }}>
            8인 원형 테이블. 가운데 통로가 버진로드, 아래가 입구예요.
          </figcaption>
        </figure>
      </div>
    </>
  );
}

/* 3. 패키지 견적 */
function PackageSection({ slot, guests, garden, reduce }: { slot: number; guests: number; garden: boolean; reduce: boolean }) {
  const [meal, setMeal] = useState("course");
  const [flower, setFlower] = useState("basic");
  const [extras, setExtras] = useState<string[]>([]);
  const m = MEALS.find((x) => x.id === meal) ?? MEALS[0];
  const f = FLOWERS.find((x) => x.id === flower) ?? FLOWERS[0];
  const rent = SLOTS[slot].rent + (garden ? GARDEN_FEE : 0);
  const mealTotal = m.price * guests;
  const extraTotal = EXTRAS.filter((e) => extras.includes(e.id)).reduce((s, e) => s + e.price, 0);
  const total = rent + mealTotal + f.price + extraTotal;

  const opt = (on: boolean) => ({
    borderColor: on ? C.olive : C.line,
    background: on ? C.olive : C.paper,
    color: on ? C.ivory : C.ink,
    outlineColor: C.olive,
  });
  const optCls = `${focusRing} rounded-[4px] border-2 px-4 py-3 text-left leading-[1.5]`;

  return (
    <>
      <h2 id="sw-package-title" className="text-[30px] leading-[1.25] md:text-[38px]" style={{ ...serif, fontWeight: 700, color: C.olive }}>
        패키지와 비용
      </h2>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        <div className="grid gap-7">
          <div>
            <p className="text-[16px] font-bold">식사 (1인)</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-label="식사">
              {MEALS.map((x) => (
                <button key={x.id} type="button" aria-pressed={meal === x.id} onClick={() => setMeal(x.id)} className={optCls} style={opt(meal === x.id)}>
                  <span className="flex items-baseline justify-between gap-2">
                    <b className="text-[17px]">{x.name}</b>
                    <span className="tabular-nums">{won(x.price)}</span>
                  </span>
                  <span className="block text-[14px]">{x.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[16px] font-bold">꽃장식</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-label="꽃장식">
              {FLOWERS.map((x) => (
                <button key={x.id} type="button" aria-pressed={flower === x.id} onClick={() => setFlower(x.id)} className={optCls} style={opt(flower === x.id)}>
                  <span className="flex items-baseline justify-between gap-2">
                    <b className="inline-flex items-center gap-1.5 text-[17px]">
                      <Flower2 size={16} aria-hidden /> {x.name}
                    </b>
                    <span className="tabular-nums">{won(x.price)}</span>
                  </span>
                  <span className="block text-[14px]">{x.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[16px] font-bold">추가</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-label="추가 옵션">
              {EXTRAS.map((x) => {
                const on = extras.includes(x.id);
                return (
                  <button key={x.id} type="button" aria-pressed={on} onClick={() => setExtras((s) => (on ? s.filter((v) => v !== x.id) : [...s, x.id]))} className={optCls} style={opt(on)}>
                    <span className="flex items-baseline justify-between gap-2">
                      <b className="text-[17px]">{x.name}</b>
                      <span className="tabular-nums">{won(x.price)}</span>
                    </span>
                    <span className="block text-[14px]">{on ? "담았어요" : "누르면 담겨요"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-[6px] border-2 p-5 md:p-6" style={{ borderColor: C.olive, background: C.paper }}>
          <p className="text-[20px]" style={{ ...serif, fontWeight: 700 }}>
            견적
          </p>
          <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-3 text-[15px] leading-[1.5]">
            <dt>
              대관 {SLOTS[slot].time}
              {garden && <span style={{ color: C.muted }}> (정원 포함)</span>}
            </dt>
            <dd className="tabular-nums">{won(rent)}</dd>
            <dt>
              식사 {m.name} <span style={{ color: C.muted }}>{won(m.price)} x {guests}명</span>
            </dt>
            <dd className="tabular-nums">{won(mealTotal)}</dd>
            <dt>꽃장식 {f.name}</dt>
            <dd className="tabular-nums">{won(f.price)}</dd>
            {EXTRAS.filter((e) => extras.includes(e.id)).map((e) => (
              <div key={e.id} className="contents">
                <dt>{e.name}</dt>
                <dd className="tabular-nums">{won(e.price)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 border-t pt-4" style={{ borderColor: C.line }}>
            <p className="text-[14px] font-bold" style={{ color: C.muted }}>
              합계 (부가세 별도)
            </p>
            <p className="mt-1 text-[34px] md:text-[40px]" style={{ ...serif, fontWeight: 700, color: C.olive }}>
              <Roll text={total.toLocaleString("ko-KR")} reduce={reduce} />원
            </p>
            <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
              하객 1인당 {won(Math.round(total / guests / 1000) * 1000)} 꼴. 하객 수와 날짜는 위에서 바꾼 값이 그대로 들어가요.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* 5. 공간 안내와 오시는 길 */
function SpaceSection({ today }: { today: Date }) {
  const spaces = [
    { icon: DoorOpen, name: "홀", lines: ["하객 120명까지, 천장 높이 6m", "남서쪽 아치창 3개, 자연광 예식", "단상 뒤 LED 없이 꽃 아치만"] },
    { icon: Trees, name: "정원", lines: ["식전 음료와 사진 촬영", "포토존, 야외 의자 40석", "우천 시 홀 로비로 변경"] },
    { icon: Flower2, name: "신부 대기실", lines: ["2실, 메이크업 수정 공간", "가족 대기 소파와 다과", "예식 2시간 전부터 사용"] },
    { icon: Car, name: "주차", lines: ["건물 지하 1~3층 150대", "하객 주차 2시간 무료", "만차 시 옆 건물 공영주차장 안내"] },
  ];
  const hours = [
    ["월", "휴무"],
    ["화", "10:00~19:00"],
    ["수", "10:00~19:00"],
    ["목", "10:00~19:00"],
    ["금", "10:00~19:00"],
    ["토", "09:00~18:00"],
    ["일", "09:00~18:00"],
  ];
  const todayDow = DOW[today.getDay()];

  return (
    <>
      <h2 id="sw-space-title" className="text-[30px] leading-[1.25] md:text-[38px]" style={{ ...serif, fontWeight: 700, color: C.olive }}>
        공간 안내
      </h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {spaces.map((s) => (
          <li key={s.name} className="rounded-[6px] border p-5" style={{ borderColor: C.line, background: C.paper }}>
            <p className="inline-flex items-center gap-2 text-[19px]" style={{ ...serif, fontWeight: 700, color: C.olive }}>
              <s.icon size={20} aria-hidden /> {s.name}
            </p>
            <ul className="mt-3 grid gap-1.5 text-[15px] leading-[1.5]">
              {s.lines.map((l) => (
                <li key={l} className="flex gap-2">
                  <span aria-hidden className="mt-[9px] h-[5px] w-[5px] flex-none rounded-full" style={{ background: C.sage }} />
                  {l}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <h2 id="sw-way-title" className="mt-14 text-[30px] leading-[1.25] md:text-[38px]" style={{ ...serif, fontWeight: 700, color: C.olive }}>
        오시는 길
      </h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <figure className="min-w-0">
          <svg viewBox="0 0 640 300" role="img" aria-label="ㅇㅇ역 3번 출구에서 홀까지 약도" className="block w-full rounded-[6px]" style={{ background: C.paper }}>
            <rect width="640" height="300" fill={C.paper} />
            <path d="M0,150 H640" stroke={C.ivoryDeep} strokeWidth="38" />
            <path d="M160,0 V300 M460,0 V300" stroke={C.ivoryDeep} strokeWidth="26" />
            <path d="M0,150 H640" stroke={C.paper} strokeWidth="2" strokeDasharray="12 10" />
            <path d="M172,150 L172,100 Q172,92 180,92 L380,92" fill="none" stroke={C.olive} strokeWidth="3" strokeDasharray="7 6" />
            <rect x="140" y="138" width="40" height="24" rx="4" fill={C.olive} />
            <text x="160" y="155" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.ivory}>
              역
            </text>
            <text x="160" y="186" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink}>
              ㅇㅇ역 3번 출구
            </text>
            <text x="160" y="204" textAnchor="middle" fontSize="12" fill={C.muted}>
              걸어서 5분
            </text>
            <rect x="380" y="52" width="110" height="80" rx="4" fill={C.olive} />
            <text x="435" y="86" textAnchor="middle" fontSize="15" fontWeight="700" fill={C.ivory} style={serif}>
              {BRAND}
            </text>
            <text x="435" y="108" textAnchor="middle" fontSize="11" fill={C.ivory}>
              지하 주차 입구 뒤편
            </text>
            <rect x="500" y="52" width="100" height="80" rx="4" fill={C.ivoryDeep} />
            <text x="550" y="96" textAnchor="middle" fontSize="12" fill={C.muted}>
              공영주차장
            </text>
            <rect x="210" y="190" width="120" height="70" rx="4" fill={C.ivoryDeep} />
            <text x="270" y="230" textAnchor="middle" fontSize="12" fill={C.muted}>
              ㅇㅇ공원
            </text>
            <circle cx="120" cy="150" r="8" fill={C.paper} stroke={C.olive} strokeWidth="3" />
            <text x="120" y="128" textAnchor="middle" fontSize="12" fill={C.ink}>
              셔틀 승차
            </text>
          </svg>
          <figcaption className="mt-2 text-[14px]" style={{ color: C.muted }}>
            {ADDRESS}. 네이버 지도, 카카오맵에서 {BRAND}으로 검색하세요.
          </figcaption>
        </figure>

        <div className="grid gap-4">
          <ul className="grid gap-3 rounded-[6px] border p-5 text-[15px] leading-[1.6]" style={{ borderColor: C.line, background: C.paper }}>
            <li className="flex gap-3">
              <TrainFront size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.olive }} />
              <span>
                <b>지하철</b> ㅇㅇ역 3번 출구에서 걸어서 5분
              </span>
            </li>
            <li className="flex gap-3">
              <Bus size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.olive }} />
              <span>
                <b>셔틀</b> ㅇㅇ역 2번 출구 앞, 예식 2시간 전부터 20분마다
              </span>
            </li>
            <li className="flex gap-3">
              <Car size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.olive }} />
              <span>
                <b>자가용</b> 건물 지하 주차장, 하객 주차 2시간 무료
              </span>
            </li>
          </ul>
          <table className="w-full border-collapse rounded-[6px] text-[15px]" style={{ background: C.paper }}>
            <caption className="py-2 text-left text-[15px] font-bold">상담 운영시간</caption>
            <tbody>
              {hours.map(([d, h]) => {
                const now = d === todayDow;
                return (
                  <tr key={d} aria-current={now ? "date" : undefined} style={{ background: now ? C.ivory : undefined, fontWeight: now ? 700 : 400 }}>
                    <th scope="row" className="border-t px-4 py-2 text-left" style={{ borderColor: C.line }}>
                      {d}
                      {now && <span className="ml-2 text-[12px]">오늘</span>}
                    </th>
                    <td className="border-t px-4 py-2 text-right tabular-nums" style={{ borderColor: C.line }}>
                      {h}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* 4. 상담신청과 방문 예약 */
function ConsultSection({ today, date }: { today: Date; date: Date }) {
  const [groom, setGroom] = useState("");
  const [bride, setBride] = useState("");
  const [phone, setPhone] = useState("");
  const [wedding, setWedding] = useState("");
  const [visit, setVisit] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lead, setLead] = useState<Lead | null>(null);
  const [count, setCount] = useState(17);

  const weddingValue = wedding || fmtDash(date);
  const minVisit = fmtDash(daysAgo(today, -1));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (groom.trim().length < 2) err.groom = "이름을 두 글자 이상 적어 주세요";
    if (bride.trim().length < 2) err.bride = "이름을 두 글자 이상 적어 주세요";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) err.phone = "휴대폰 번호를 확인해 주세요";
    if (!visit) err.visit = "방문 희망일을 골라 주세요";
    setErrors(err);
    if (Object.keys(err).length) return;
    const no = `W-${fmtDash(today).replace(/-/g, "")}-${String(count).padStart(3, "0")}`;
    setCount((c) => c + 1);
    setLead({ no, groom: maskName(groom), bride: maskName(bride), phone: maskPhone(phone), wedding: weddingValue, visit });
  };

  const field = "mt-1 w-full rounded-[4px] border-2 px-3 py-2.5 text-[16px]";
  const fieldStyle = (k: string) => ({ borderColor: errors[k] ? C.error : C.line, background: C.paper, color: C.ink, outlineColor: C.ivory });
  const lab = "block text-[15px] font-bold";
  const reply = nextBizDay(today);

  return (
    <>
      <h2 id="sw-consult-title" className="text-[30px] leading-[1.25] md:text-[38px]" style={{ ...serif, fontWeight: 700 }}>
        상담신청
      </h2>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <div className="text-[16px] leading-[1.7]">
          <p>방문 상담은 한 팀씩 60분. 홀과 정원을 같이 보고 날짜별 남은 시간대를 그 자리에서 확인해요.</p>
          <ul className="mt-4 grid gap-2">
            <li className="flex gap-2">
              <MessageCircle size={18} aria-hidden className="mt-1 flex-none" /> 담당 플래너가 {KAKAO}로 답해요
            </li>
            <li className="flex gap-2">
              <DoorOpen size={18} aria-hidden className="mt-1 flex-none" /> 방문 상담 때 홀 식사 시식 가능 (2인)
            </li>
          </ul>
          <p className="mt-4 text-[14px]" style={{ color: C.ivoryDeep }}>
            회신은 다음 영업일 안에 드려요. 월요일은 상담을 쉬어요.
          </p>
        </div>

        <div className="rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.sage, background: C.oliveDeep }} aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {lead ? (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <p className="text-[22px]" style={{ ...serif, fontWeight: 700 }}>
                  접수 완료
                </p>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[16px] leading-[1.6]">
                  <dt style={{ color: C.ivoryDeep }}>접수번호</dt>
                  <dd className="font-bold tabular-nums">{lead.no}</dd>
                  <dt style={{ color: C.ivoryDeep }}>신청인</dt>
                  <dd>
                    {lead.groom}, {lead.bride}
                  </dd>
                  <dt style={{ color: C.ivoryDeep }}>연락처</dt>
                  <dd className="tabular-nums">{lead.phone}</dd>
                  <dt style={{ color: C.ivoryDeep }}>희망 예식일</dt>
                  <dd className="tabular-nums">{lead.wedding}</dd>
                  <dt style={{ color: C.ivoryDeep }}>방문 희망일</dt>
                  <dd className="tabular-nums">{lead.visit}</dd>
                  <dt style={{ color: C.ivoryDeep }}>담당 창구</dt>
                  <dd>{KAKAO} (플래너 박ㅅ연)</dd>
                  <dt style={{ color: C.ivoryDeep }}>회신 예정일</dt>
                  <dd>{fmtKo(reply)}</dd>
                </dl>
                <button type="button" onClick={() => setLead(null)} className={`${btnBase} mt-5 rounded-[4px] border-2 px-4 py-2 text-[14px]`} style={{ borderColor: C.ivory, color: C.ivory, outlineColor: C.ivory }}>
                  다른 날짜로 다시 신청
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" noValidate onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sw-groom" className={lab}>
                      신랑 이름
                    </label>
                    <input id="sw-groom" value={groom} onChange={(e) => setGroom(e.target.value)} autoComplete="off" aria-invalid={!!errors.groom} aria-describedby={errors.groom ? "sw-groom-err" : undefined} className={`${field} ${focusRing}`} style={fieldStyle("groom")} />
                    {errors.groom && (
                      <p id="sw-groom-err" className="mt-1 text-[13px]" style={{ color: "#ffd9d2" }}>
                        {errors.groom}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="sw-bride" className={lab}>
                      신부 이름
                    </label>
                    <input id="sw-bride" value={bride} onChange={(e) => setBride(e.target.value)} autoComplete="off" aria-invalid={!!errors.bride} aria-describedby={errors.bride ? "sw-bride-err" : undefined} className={`${field} ${focusRing}`} style={fieldStyle("bride")} />
                    {errors.bride && (
                      <p id="sw-bride-err" className="mt-1 text-[13px]" style={{ color: "#ffd9d2" }}>
                        {errors.bride}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="sw-phone" className={lab}>
                    휴대폰
                  </label>
                  <input id="sw-phone" type="tel" inputMode="numeric" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="off" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "sw-phone-err" : undefined} className={`${field} ${focusRing}`} style={fieldStyle("phone")} />
                  {errors.phone && (
                    <p id="sw-phone-err" className="mt-1 text-[13px]" style={{ color: "#ffd9d2" }}>
                      {errors.phone}
                    </p>
                  )}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sw-wedding" className={lab}>
                      희망 예식일
                    </label>
                    <input id="sw-wedding" type="date" min={fmtDash(today)} value={weddingValue} onChange={(e) => setWedding(e.target.value)} className={`${field} ${focusRing}`} style={fieldStyle("wedding")} />
                  </div>
                  <div>
                    <label htmlFor="sw-visit" className={lab}>
                      방문 희망일
                    </label>
                    <input id="sw-visit" type="date" min={minVisit} value={visit} onChange={(e) => setVisit(e.target.value)} aria-invalid={!!errors.visit} aria-describedby={errors.visit ? "sw-visit-err" : undefined} className={`${field} ${focusRing}`} style={fieldStyle("visit")} />
                    {errors.visit && (
                      <p id="sw-visit-err" className="mt-1 text-[13px]" style={{ color: "#ffd9d2" }}>
                        {errors.visit}
                      </p>
                    )}
                  </div>
                </div>
                <button type="submit" data-gtm-cta="small-wedding_consult_submit" className={`${btnBase} mt-6 w-full rounded-[4px] py-3 text-[16px]`} style={{ background: C.ivory, color: C.olive, outlineColor: C.ivory }}>
                  상담신청
                </button>
                <p className="mt-2 text-[13px]" style={{ color: C.ivoryDeep }}>
                  방문 상담은 화~일 10:00~18:00 사이에 잡아 드려요.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
