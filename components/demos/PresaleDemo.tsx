"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Check, CircleAlert, GraduationCap, MapPin, MessageCircle, Minus, Phone, Plus, ShoppingCart, TrainFront, Trees } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 아파트 분양 홍보관 샘플: 가상의 곰파트너 아파트(ㅎㄷ시). 사업지, 견본주택 주소, 분양가, 손님 이름은 모두 가상이다.
   첫 화면 사진 출처: Pexels 사진 28456460. 세대안내 평면도 그림(plan-59, 84, 109): AI 생성 (Z-Image-Turbo)

   국내 분양 홈페이지 공통 구성(참고): 메뉴는 사업개요, 입지환경, 단지안내, 세대안내(타입별 평면도), 분양안내(분양 일정,
   입주자모집공고, 분양가), 견본주택(방문예약, 오시는 길), 관심고객등록. 첫 화면은 큰 조감도와 "견본주택 오픈" 문구,
   아래에 대표번호와 방문예약 버튼이 붙어 다닌다. 관용 문구는 주택형, 전용면적, 공급면적, 계약금 10%, 중도금 60% 이자후불제,
   잔금 30%, 발코니 확장 별도, "견본주택 방문은 사전 예약제로 운영됩니다", "이해를 돕기 위한 것으로 실제와 다를 수 있습니다".

   첫 화면(pv-poster): 실제 분양 사이트처럼 상단 메뉴, 왼쪽 2/3 단지 사진(16:10, 글자 얹지 않음)과 분양개요 표,
   오른쪽 1/3 은 스크롤을 따라오는 관심고객 등록 패널(관심 타입, 방문 희망일). 패널에서 고른 타입과 날짜는
   아래 평면도, 분양가, 방문예약 폼과 같은 값이다. 휴대폰은 사진, 단지명, 개요 표 순서로 쌓고 패널 대신 하단 고정 바.
   제목(h1, h2)은 굵게, 글꼴은 모두 Pretendard.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 타입 고르기: 59, 84, 109 를 누르면 평면도와 전용, 공급면적, 방 구성이 바뀐다.
   2. 분양가: 주택형과 층별 분양가 표, 계약금, 중도금, 잔금 납부조건 표.
   3. 견본주택 방문예약: 날짜, 시간(남은 팀 수), 관심 타입, 인원, 이름, 휴대폰. 완료하면 예약 번호와 담당 창구, 확인 연락일.
   4. 입지환경: 사업지 주변 약도 한 장과 교통, 교육, 생활, 자연 분류별 시설과 거리 목록. */

/* 제목은 본문과 같은 Pretendard, 굵게 */
const serifF = { fontWeight: 700 } as const;

const IMG = "/images/demo-presale";

const BRAND = "아파트 분양";
const GALLERY = `${BRAND} 견본주택`;
const GALLERY_ADDR = "ㅎㄷ시 ㅇㅇ구 ㅇㅇ로 00 (ㅎㄷ역 2번 출구 앞)";
const SITE_ADDR = "ㅎㄷ시 ㅇㅇ구 ㅇㅇ동 일원";
const TEL = "1600-0000";
const KAKAO = "카카오톡 채널 아파트 분양";

const C = {
  paper: "#ffffff",
  soft: "#f7f7f5",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  /** 입력칸, 버튼 테두리 */
  field: "#c4c4c4",
  /** 강조색 하나. 짙은 숲색 */
  accent: "#1f3d33",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const p2 = (n: number) => String(n).padStart(2, "0");

/** 7억 1,900만 원 */
function eok(n: number) {
  const e = Math.floor(n / 1e8);
  const m = Math.round((n % 1e8) / 1e4);
  if (e === 0) return `${m.toLocaleString("ko-KR")}만 원`;
  return m === 0 ? `${e}억 원` : `${e}억 ${m.toLocaleString("ko-KR")}만 원`;
}
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const ym = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월`;

function M2() {
  return (
    <>
      m<sup className="text-[0.62em]">2</sup>
    </>
  );
}

/* ---------- 타입 ---------- */

type TypeId = "59" | "84" | "109";
interface UnitType {
  id: TypeId;
  excl: number;
  common: number;
  supply: number;
  pyeong: number;
  households: number;
  rooms: number;
  baths: number;
  tags: string[];
  /** 기준층 분양가 */
  price: number;
  balcony: number;
}

const TYPES: UnitType[] = [
  {
    id: "59",
    excl: 59.97,
    common: 24.83,
    supply: 84.8,
    pyeong: 25,
    households: 214,
    rooms: 3,
    baths: 2,
    tags: ["3Bay 판상형", "안방 드레스룸", "주방 창 있음"],
    price: 548000000,
    balcony: 12800000,
  },
  {
    id: "84",
    excl: 84.98,
    common: 29.41,
    supply: 114.39,
    pyeong: 34,
    households: 326,
    rooms: 3,
    baths: 2,
    tags: ["4Bay 판상형", "주방 팬트리", "안방 드레스룸"],
    price: 719000000,
    balcony: 16500000,
  },
  {
    id: "109",
    excl: 109.95,
    common: 36.52,
    supply: 146.47,
    pyeong: 44,
    households: 72,
    rooms: 4,
    baths: 2,
    tags: ["4Bay 판상형", "침실 4개", "안방 드레스룸"],
    price: 926000000,
    balcony: 19800000,
  },
];
const typeById = (id: TypeId) => TYPES.find((t) => t.id === id) ?? TYPES[1];
const TOTAL_HOUSEHOLDS = TYPES.reduce((a, t) => a + t.households, 0);

/* ---------- 분양 일정, 층, 납부 ---------- */

const FLOORS = [
  { id: "low", label: "1~2층", rate: 0.94 },
  { id: "mid", label: "3~5층", rate: 0.97 },
  { id: "std", label: "6층 이상", rate: 1 },
] as const;

/** 오늘 기준 일정(일). 견본주택은 이미 열려 있다 */
const SCHEDULE: [string, number, number?][] = [
  ["입주자모집공고", -6],
  ["견본주택 개관", -3],
  ["특별공급 접수", 4],
  ["1순위 접수", 5],
  ["2순위 접수", 6],
  ["당첨자 발표", 13],
  ["정당 계약", 24, 26],
];
const CONTRACT_IN = 24;
const MOVE_IN_MONTHS = 30;

/* ---------- 방문예약 ---------- */

const SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const CAP = 12;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/** 날짜, 시간별로 이미 찬 팀 수. 실제로는 예약 시트에서 읽는다. 오늘 오전 회차는 지나서 마감 */
function taken(day: number, slot: number, weekend: boolean) {
  if (day === 0 && slot < 2) return CAP;
  let h = (day + 5) * 2654435761 + (slot + 3) * 40503;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 101;
  return Math.min(CAP, (h % 8) + (weekend ? 5 : 1) + (slot >= 3 && slot <= 5 ? 2 : 0));
}

/* ---------- 입지 ---------- */

type Cat = "교통" | "교육" | "생활" | "자연";
const CATS: { id: Cat; icon: typeof TrainFront }[] = [
  { id: "교통", icon: TrainFront },
  { id: "교육", icon: GraduationCap },
  { id: "생활", icon: ShoppingCart },
  { id: "자연", icon: Trees },
];
const PLACES: Record<Cat, { n: string; t: string; x: number; y: number }[]> = {
  교통: [
    { n: "ㅎㄷ역", t: "도보 6분", x: 470, y: 119 },
    { n: "광역버스 정류장", t: "도보 3분", x: 330, y: 150 },
    { n: "ㅎㄷIC", t: "차로 5분", x: 575, y: 66 },
  ],
  교육: [
    { n: "ㅎㄷ초등학교", t: "도보 4분", x: 232, y: 316 },
    { n: "ㅎㄷ중학교", t: "도보 9분", x: 110, y: 170 },
    { n: "시립도서관", t: "도보 10분", x: 430, y: 300 },
  ],
  생활: [
    { n: "대형마트", t: "차로 5분", x: 560, y: 245 },
    { n: "종합병원", t: "차로 7분", x: 580, y: 305 },
    { n: "주민센터", t: "도보 7분", x: 395, y: 205 },
  ],
  자연: [
    { n: "근린공원", t: "도보 2분", x: 115, y: 335 },
    { n: "하천 산책로", t: "도보 5분", x: 340, y: 392 },
  ],
};

/* ====================================================================== */

/** 상단 메뉴. 실제 분양 홈페이지 표준 순서(사업개요, 입지환경, 평면도, 분양가, 일정, 방문예약) */
const MENU: [string, string][] = [
  ["pv-overview", "사업개요"],
  ["pv-map", "입지환경"],
  ["pv-types", "평면도"],
  ["pv-price", "분양가"],
  ["pv-schedule", "분양일정"],
  ["pv-visit", "방문예약"],
];

export function PresaleDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [typeId, setTypeId] = useState<TypeId>("84");
  /** 방문 희망일(오늘부터 0~6일 뒤). 첫 화면 패널과 방문예약 폼이 같이 쓴다 */
  const [visitDay, setVisitDay] = useState(0);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div className="min-h-screen overflow-x-clip pb-[76px] md:pb-0" style={{ background: C.paper, color: C.ink }}>
      <TopBar go={go} />
      <Poster today={today} typeId={typeId} setTypeId={setTypeId} visitDay={visitDay} setVisitDay={setVisitDay} go={go} />

      <Schedule today={today} />

      <section id="pv-types" aria-labelledby="pv-types-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="pv-types-title" title="세대안내" />
        <TypePicker typeId={typeId} setTypeId={setTypeId} />
      </section>

      <section id="pv-price" aria-labelledby="pv-price-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="pv-price-title" title="분양가와 납부조건" />
        <PriceTable />
      </section>

      <section id="pv-visit" aria-labelledby="pv-visit-title" className="mt-16 scroll-mt-4 md:mt-24" style={{ background: C.soft, color: C.ink }}>
        <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-6 md:py-16">
          <SectionTitle id="pv-visit-title" title="견본주택 방문예약" />
          <VisitForm reduce={reduce} today={today} typeId={typeId} setTypeId={setTypeId} day={visitDay} setDay={setVisitDay} />
        </div>
      </section>

      <section id="pv-map" aria-labelledby="pv-map-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="pv-map-title" title="입지환경" />
        <LocationMap />
      </section>

      <footer className="mt-16 border-t md:mt-24" style={{ borderColor: C.line }}>
        <div className="mx-auto max-w-[1200px] px-4 py-8 text-[14px] leading-[1.8] md:px-6" style={{ color: C.muted }}>
          <p className="text-[16px] font-bold" style={{ color: C.ink }}>
            <SampleLogo size={18} />
          </p>
          <p>
            {GALLERY} {GALLERY_ADDR}, 분양 문의 {TEL}, 매일 10:00 ~ 18:00
          </p>
          <p>평면도와 그림은 이해를 돕기 위한 것으로 실제와 다를 수 있습니다. 분양가와 일정은 입주자모집공고를 따릅니다.</p>
          <div style={{ color: C.ink }}>
            <DemoMakerInfo className="mt-6" />
          </div>
        </div>
      </footer>

      {/* 휴대폰: 관심고객 등록 패널 대신 하단 고정 바(태블릿부터는 패널이 보인다). */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t md:hidden" style={{ background: C.paper, borderColor: C.line, paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-2 px-4 py-2.5">
          <a href={`tel:${TEL.replace(/-/g, "")}`} className={`inline-flex min-h-12 items-center justify-center gap-1.5 rounded-[4px] border text-[16px] font-semibold ${focusRing}`} style={{ borderColor: C.field, color: C.ink, outlineColor: C.accent }}>
            <Phone size={17} aria-hidden />
            전화
          </a>
          <button type="button" onClick={() => go("pv-visit")} data-gtm-cta="presale_bar_interest" className={`inline-flex min-h-12 items-center justify-center gap-1.5 rounded-[4px] text-[16px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.accent }}>
            <CalendarCheck size={18} aria-hidden />
            관심고객 등록
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ id, title }: { id: string; title: string }) {
  return (
    <div className="mb-7 flex items-center gap-4">
      <h2 id={id} className="flex-none text-[27px] font-bold leading-tight tracking-[-0.02em] md:text-[34px]" style={{ ...serifF, color: C.ink }}>
        {title}
      </h2>
      <span aria-hidden className="h-px flex-1" style={{ background: C.line }} />
    </div>
  );
}

/* ---------- 상단 메뉴 ---------- */

function TopBar({ go }: { go: (id: string) => void }) {
  const item = `inline-flex min-h-11 flex-none items-center whitespace-nowrap rounded-[4px] px-3 text-[15px] font-semibold hover:underline underline-offset-4 ${focusRing}`;
  return (
    <header className="border-b" style={{ background: C.paper, borderColor: C.line }}>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 pt-3 lg:py-3 md:px-6">
        <p className="inline-flex items-center gap-2 text-[17px] font-bold leading-none">
          <SampleLogo size={18} />
        </p>
        <nav aria-label="주요 메뉴" className="hidden items-center lg:flex">
          {MENU.map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={item} style={{ color: C.ink, outlineColor: C.accent }}>
              {label}
            </button>
          ))}
        </nav>
        <a href={`tel:${TEL.replace(/-/g, "")}`} className={`inline-flex min-h-11 flex-none items-center gap-1.5 rounded-[4px] px-2 text-[16px] font-bold tabular-nums ${focusRing}`} style={{ color: C.accent, outlineColor: C.accent }}>
          <Phone size={17} aria-hidden />
          {TEL}
        </a>
      </div>
      {/* 휴대폰, 태블릿: 가로로 밀어 보는 메뉴 한 줄 */}
      <nav aria-label="주요 메뉴" className="-mb-px flex gap-1 overflow-x-auto px-2 pb-1 lg:hidden" style={{ scrollbarWidth: "none" }}>
        {MENU.map(([id, label]) => (
          <button key={id} type="button" onClick={() => go(id)} className={item} style={{ color: C.ink, outlineColor: C.accent }}>
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}

/* ---------- 첫 화면: 단지 사진, 분양개요 표, 따라오는 관심고객 등록 패널 ---------- */

function Poster({
  today,
  typeId,
  setTypeId,
  visitDay,
  setVisitDay,
  go,
}: {
  today: Date;
  typeId: TypeId;
  setTypeId: (t: TypeId) => void;
  visitDay: number;
  setVisitDay: (d: number) => void;
  go: (id: string) => void;
}) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => daysAgo(today, -i)), [today]);
  const moveIn = addMonths(daysAgo(today, -CONTRACT_IN), MOVE_IN_MONTHS);
  const rows: [string, React.ReactNode][] = [
    ["대지위치", SITE_ADDR],
    ["건축규모", "지하 2층, 지상 25층, 8개동"],
    ["세대수", `총 ${TOTAL_HOUSEHOLDS}세대`],
    [
      "타입 구성",
      <>
        {TYPES.map((t, i) => (
          <span key={t.id}>
            {i > 0 && ", "}
            {t.id}타입 {t.households}세대
          </span>
        ))}
      </>,
    ],
    ["입주예정", ym(moveIn)],
    ["견본주택", GALLERY_ADDR],
  ];
  const chip = (on: boolean) => ({
    background: on ? C.accent : "#fff",
    color: on ? "#fff" : C.ink,
    borderColor: on ? C.accent : C.field,
    outlineColor: C.accent,
  });
  const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  return (
    <section
      id="pv-poster"
      aria-labelledby="pv-poster-title"
      className="mx-auto grid max-w-[1200px] gap-x-8 gap-y-6 px-4 pt-4 md:px-6 md:pt-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
    >
      {/* 단지 사진. 위에 글자를 얹지 않는다 */}
      <figure className="min-w-0 lg:col-start-1 lg:row-start-1">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[4px]" style={{ background: C.soft }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="(min-width: 1024px) 66vw, 100vw"
            alt="천장이 높은 복층 세대 내부. 위층 거실 난간 아래로 주방과 식탁이 보인다"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "55% 40%" }}
          />
        </div>
      </figure>

      {/* 단지명과 관심고객 등록. PC 에서는 오른쪽 1/3 에서 스크롤을 따라온다 */}
      <aside className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1" aria-label="관심고객 등록">
        <div className="md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8 lg:sticky lg:top-6 lg:block lg:rounded-[6px] lg:border lg:p-6" style={{ borderColor: C.line }}>
          <div>
            <p className="text-[15px] font-semibold" style={{ color: C.accent }}>
              {BRAND}, 총 {TOTAL_HOUSEHOLDS}세대
            </p>
            <h1 id="pv-poster-title" className="mt-2 text-[28px] font-bold md:text-[32px]" style={{ ...serifF, letterSpacing: "-0.03em", lineHeight: 1.25, wordBreak: "keep-all" }}>
              ㅎㄷ역 도보 6분,
              <br />
              초등학교 도보 4분
            </h1>
            <p className="mt-3 inline-flex items-start gap-1.5 text-[15px] leading-[1.6]" style={{ color: C.body }}>
              <MapPin size={17} aria-hidden className="mt-0.5 flex-none" style={{ color: C.accent }} />
              {GALLERY}, 매일 10:00 ~ 18:00
            </p>
          </div>

          <div className="hidden space-y-5 md:block lg:mt-6 lg:border-t lg:pt-5" style={{ borderColor: C.line }}>
            <fieldset>
              <legend className="mb-2 text-[15px] font-bold">관심 타입</legend>
              <div className="grid grid-cols-3 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={typeId === t.id}
                    onClick={() => setTypeId(t.id)}
                    className={`flex min-h-14 flex-col items-center justify-center rounded-[4px] border px-1 ${focusRing}`}
                    style={chip(typeId === t.id)}
                  >
                    <span className="text-[17px] font-bold">{t.id}</span>
                    <span className="text-[12px]">{t.pyeong}평형</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-[15px] font-bold">방문 희망일</legend>
              <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={visitDay === i}
                    aria-label={`${fmtKo(d)}${weekend(d) ? ", 주말" : ""}`}
                    onClick={() => setVisitDay(i)}
                    className={`flex min-h-14 min-w-0 flex-col items-center justify-center rounded-[4px] border ${focusRing}`}
                    style={chip(visitDay === i)}
                  >
                    <span className="text-[12px]">{i === 0 ? "오늘" : DOW[d.getDay()]}</span>
                    <span className="text-[16px] font-bold tabular-nums">{d.getDate()}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <button
              type="button"
              onClick={() => go("pv-visit")}
              data-gtm-cta="presale_poster_cta"
              className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[4px] text-[17px] font-semibold text-white ${focusRing}`}
              style={{ background: C.accent, outlineColor: C.accent }}
            >
              <CalendarCheck size={19} aria-hidden />
              관심고객 등록
            </button>
            <p className="text-[14px] leading-[1.6]" style={{ color: C.muted }}>
              선택 {typeId}타입, {fmtKo(days[visitDay])}
            </p>
          </div>
        </div>
      </aside>

      {/* 분양개요 표 */}
      <div id="pv-overview" className="min-w-0 scroll-mt-4 lg:col-start-1 lg:row-start-2">
        <h2 className="mb-3 text-[20px] font-bold md:text-[22px]">분양개요</h2>
        <dl className="grid border-t text-[15px] md:grid-cols-2 md:text-[16px]" style={{ borderColor: C.ink }}>
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b py-3 md:grid-cols-[96px_minmax(0,1fr)] md:pr-4" style={{ borderColor: C.line }}>
              <dt className="font-semibold" style={{ color: C.ink }}>
                {k}
              </dt>
              <dd style={{ color: C.body }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ---------- 분양 일정 ---------- */

function Schedule({ today }: { today: Date }) {
  return (
    <section id="pv-schedule" aria-labelledby="pv-schedule-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionTitle id="pv-schedule-title" title="분양 일정" />
      <ol className="grid border-t md:grid-cols-2 md:gap-x-10" style={{ borderColor: C.ink }}>
        {SCHEDULE.map(([name, from, to]) => {
          const d1 = daysAgo(today, -from);
          const done = from < 0;
          const label = to ? (
            <>
              <span className="whitespace-nowrap">{fmtKo(d1)} ~</span> <span className="whitespace-nowrap">{fmtKo(daysAgo(today, -to))}</span>
            </>
          ) : (
            <span className="whitespace-nowrap">{fmtKo(d1)}</span>
          );
          return (
            <li key={name} className="flex items-center justify-between gap-3 border-b py-3 text-[16px]" style={{ borderColor: C.line, color: done ? C.muted : C.ink }}>
              <span className="inline-flex items-center gap-2 font-bold">
                {name}
                {done && (
                  <span className="rounded-[3px] px-1.5 py-0.5 text-[12px] font-bold" style={{ background: C.soft, color: C.muted }}>
                    완료
                  </span>
                )}
              </span>
              <span className="text-right text-[15px] tabular-nums">{label}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ---------- 1. 타입 고르기와 평면도 ---------- */

function TypePicker({ typeId, setTypeId }: { typeId: TypeId; setTypeId: (t: TypeId) => void }) {
  const t = typeById(typeId);
  return (
    <div>
      <div role="group" aria-label="주택형 고르기" className="grid grid-cols-3 gap-2 md:max-w-[560px]">
        {TYPES.map((x) => {
          const on = x.id === typeId;
          return (
            <button
              key={x.id}
              type="button"
              aria-pressed={on}
              onClick={() => setTypeId(x.id)}
              className={`flex flex-col items-start rounded-[6px] border px-3 py-2.5 text-left transition-colors duration-150 md:px-4 ${focusRing}`}
              style={{ background: on ? C.accent : "#fff", color: on ? "#fff" : C.ink, borderColor: on ? C.accent : C.field, outlineColor: C.accent }}
            >
              <span className="text-[26px] font-bold leading-none tabular-nums md:text-[32px]">
                {x.id}
                <span className="ml-0.5 text-[15px] md:text-[17px]">타입</span>
              </span>
              <span className="mt-1.5 text-[13px] md:text-[14px]" style={{ color: on ? "rgba(255,255,255,0.8)" : C.muted }}>
                {x.households}세대
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:items-start">
        <div className="overflow-hidden rounded-[6px] border bg-white" style={{ borderColor: C.line }}>
          <FloorPlan t={t} />
        </div>
        <div>
          <p className="text-[15px] font-semibold" style={{ color: C.accent }}>
            {t.id}타입, {t.pyeong}평형
          </p>
          <dl className="mt-3 border-t text-[16px]" style={{ borderColor: C.ink }}>
            {(
              [
                ["전용면적", t.excl],
                ["주거공용면적", t.common],
                ["공급면적", t.supply],
              ] as [string, number][]
            ).map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between border-b py-3" style={{ borderColor: C.line }}>
                <dt>{k}</dt>
                <dd className="text-[18px] font-bold tabular-nums">
                  {v.toFixed(2)}
                  <M2 />
                </dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between border-b py-3" style={{ borderColor: C.line }}>
              <dt>방, 욕실</dt>
              <dd className="font-bold">
                방 {t.rooms}개, 욕실 {t.baths}개
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-b py-3" style={{ borderColor: C.line }}>
              <dt>공급 세대</dt>
              <dd className="font-bold">{t.households}세대</dd>
            </div>
          </dl>
          <ul className="mt-4 flex flex-wrap gap-2">
            {t.tags.map((g) => (
              <li key={g} className="rounded-[4px] border px-2.5 py-1 text-[14px]" style={{ borderColor: C.line, color: C.body }}>
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** 타입별 평면도 그림(AI 생성, Z-Image-Turbo). 방 이름은 그림에 얹지 않고 오른쪽 표로 둔다 */
function FloorPlan({ t }: { t: UnitType }) {
  return (
    <div className="aspect-[4/3]" style={{ background: "#fff" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
      <img key={t.id} src={`${IMG}/plan-${t.id}.jpg`} alt={`${t.id}타입 평면도`} width={1200} height={900} loading="lazy" decoding="async" className="block h-full w-full object-contain" />
    </div>
  );
}

/* ---------- 2. 분양가와 납부조건 ---------- */

const PAY_ROWS: [string, string, string][] = [
  ["계약금", "10%", "계약 시 1,000만 원 정액, 나머지는 계약 후 30일 이내"],
  ["중도금", "60%", "6회 분납, 계약 후 4개월부터 4개월마다. 이자후불제"],
  ["잔금", "30%", "입주 지정기간"],
  ["발코니 확장", "별도 계약", "계약 시 10%, 입주 시 90%"],
];

function PriceTable() {
  return (
    <div className="grid gap-10">
      <div>
        <h3 className="mb-3 text-[18px] font-bold">주택형별 분양가</h3>
        {/* 휴대폰: 주택형마다 카드 한 장 */}
        <ul className="grid gap-3 md:hidden" aria-label="주택형과 층에 따른 분양가 (발코니 확장 별도)">
          {TYPES.map((t) => (
            <li key={t.id} className="rounded-[6px] border px-4 py-3.5" style={{ borderColor: C.line }}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-[17px] font-bold">{t.id}타입</span>
                <span className="whitespace-nowrap text-[14px] tabular-nums" style={{ color: C.muted }}>
                  확장 {eok(t.balcony)}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 border-t pt-3" style={{ borderColor: C.line }}>
                {[...FLOORS].reverse().map((f) => (
                  <div key={f.id} className="min-w-0">
                    <dt className="whitespace-nowrap text-[13px]" style={{ color: C.muted }}>
                      {f.label}
                    </dt>
                    <dd className="mt-0.5 whitespace-nowrap text-[14px] font-semibold tabular-nums tracking-[-0.01em]">
                      {eok(Math.round((t.price * f.rate) / 1e6) * 1e6)}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-hidden rounded-[6px] border md:block" style={{ borderColor: C.line }}>
          <table className="w-full text-left text-[14px] md:text-[16px]">
            <caption className="sr-only">주택형과 층에 따른 분양가 (발코니 확장 별도)</caption>
            <thead>
              <tr style={{ background: C.soft }}>
                <th scope="col" className="px-3 py-3 font-bold md:px-4">
                  주택형
                </th>
                {[...FLOORS].reverse().map((f) => (
                  <th key={f.id} scope="col" className="px-2 py-3 text-right font-bold md:px-4">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TYPES.map((t) => (
                <tr key={t.id} className="border-t align-top" style={{ borderColor: C.line }}>
                  <th scope="row" className="px-3 py-3 font-bold md:px-4">
                    {t.id}타입
                    <span className="block text-[13px] font-normal" style={{ color: C.muted }}>
                      확장 {eok(t.balcony)}
                    </span>
                  </th>
                  {[...FLOORS].reverse().map((f) => (
                    <td key={f.id} className="px-2 py-3 text-right font-semibold tabular-nums md:px-4">
                      {eok(Math.round((t.price * f.rate) / 1e6) * 1e6)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
          부가가치세, 취득세는 빠진 금액입니다. 동, 호수별 분양가는 입주자모집공고를 따릅니다.
        </p>
      </div>

      <div>
        <h3 className="mb-3 text-[18px] font-bold">납부조건</h3>
        <dl className="border-t" style={{ borderColor: C.ink }}>
          {PAY_ROWS.map(([k, r, v]) => (
            <div key={k} className="grid grid-cols-[96px_minmax(0,1fr)] gap-x-3 border-b py-3 md:grid-cols-[140px_90px_minmax(0,1fr)]" style={{ borderColor: C.line }}>
              <dt className="text-[16px] font-bold">{k}</dt>
              <dd className="text-[16px] font-bold tabular-nums md:order-none">{r}</dd>
              <dd className="col-span-2 text-[15px] md:col-span-1" style={{ color: C.body }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ---------- 3. 견본주택 방문예약 ---------- */

type Done = { no: string; date: Date; slot: string; type: TypeId; people: number; name: string; phone: string };

function VisitForm({
  reduce,
  today,
  typeId,
  setTypeId,
  day,
  setDay,
}: {
  reduce: boolean;
  today: Date;
  typeId: TypeId;
  setTypeId: (t: TypeId) => void;
  day: number;
  setDay: (d: number) => void;
}) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => daysAgo(today, -i)), [today]);
  /* 날짜는 첫 화면 패널에서도 바뀌므로, 고른 시간은 그 날짜에만 붙여 둔다 */
  const [pick, setPick] = useState<{ day: number; i: number } | null>(null);
  const slot = pick && pick.day === day ? pick.i : null;
  const setSlot = (i: number | null) => setPick(i === null ? null : { day, i });
  const type = typeId;
  const setType = setTypeId;
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  const weekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  const left = (i: number) => CAP - taken(day, i, weekend(days[day]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slot === null) return setErr("방문 시간을 골라 주세요.");
    if (name.trim().length < 2) return setErr("이름을 적어 주세요.");
    if (!/^01\d{8,9}$/.test(phone.replace(/\D/g, ""))) return setErr("휴대폰 번호를 확인해 주세요.");
    if (!agree) return setErr("개인정보 수집, 이용에 동의해 주세요.");
    setErr("");
    const d = days[day];
    const seed = (name.length * 37 + slot * 11 + day * 7 + phone.length) % 900;
    setDone({ no: `PV-${p2(d.getMonth() + 1)}${p2(d.getDate())}-${100 + seed}`, date: d, slot: SLOTS[slot], type, people, name, phone });
  };

  const input = `w-full rounded-[4px] border px-3 py-2.5 text-[16px] ${focusRing}`;
  const inputStyle = { background: "#fff", borderColor: C.field, color: C.ink, outlineColor: C.accent };
  const chipStyle = (on: boolean, disabled = false) => ({
    background: on ? C.accent : disabled ? C.soft : "#fff",
    color: on ? "#fff" : disabled ? C.muted : C.ink,
    borderColor: on ? C.accent : disabled ? C.line : C.field,
    outlineColor: C.accent,
  });

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="text-[16px] leading-[1.8]">
        <p className="text-[19px] font-bold">
          견본주택 방문은 사전 예약제로 운영됩니다
        </p>
        <ul className="mt-3 space-y-1" style={{ color: C.body }}>
          <li>매일 10:00 ~ 18:00, 입장 마감 17:00</li>
          <li>한 시간에 {CAP}팀, 한 팀 4명까지</li>
          <li>84타입 유니트는 주말에도 열어요</li>
          <li>{GALLERY_ADDR}</li>
          <li>주차 가능(견본주택 옆 임시 주차장)</li>
        </ul>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
            className="min-w-0 rounded-[6px] border p-5 md:p-7"
            style={{ background: "#fff", borderColor: C.line, color: C.ink }}
            role="status"
          >
            <p className="inline-flex items-center gap-2 text-[20px] font-bold">
              <Check size={22} aria-hidden style={{ color: C.accent }} />
              방문예약이 접수됐어요
            </p>
            <dl className="mt-4 grid grid-cols-[96px_minmax(0,1fr)] gap-y-2 text-[16px]">
              <dt style={{ color: C.muted }}>예약 번호</dt>
              <dd className="font-bold tabular-nums">
                {done.no}
              </dd>
              <dt style={{ color: C.muted }}>방문 일시</dt>
              <dd className="font-bold">
                <span className="whitespace-nowrap">{fmtKo(done.date)}</span> <span className="tabular-nums">{done.slot}</span>
              </dd>
              <dt style={{ color: C.muted }}>관심 타입</dt>
              <dd>
                {done.type}타입, {done.people}명
              </dd>
              <dt style={{ color: C.muted }}>예약자</dt>
              <dd>
                {maskName(done.name)} <span className="tabular-nums">{maskPhone(done.phone)}</span>
              </dd>
              <dt style={{ color: C.muted }}>담당 창구</dt>
              <dd>
                {KAKAO}, 분양 문의 {TEL}
              </dd>
              <dt style={{ color: C.muted }}>확인 연락</dt>
              <dd><span className="whitespace-nowrap">{fmtKo(today)} 중</span> 확인 문자, 방문 전날 안내 문자</dd>
            </dl>
            <button type="button" onClick={() => setDone(null)} className={`mt-5 rounded-[4px] border px-4 py-2 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.field, color: C.ink, outlineColor: C.accent }}>
              다른 날로 다시 예약
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={false} exit={reduce ? undefined : { opacity: 0 }} className="min-w-0 space-y-5">
            <fieldset className="min-w-0">
              <legend className="mb-2 text-[15px] font-bold">방문 날짜</legend>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                {days.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={i === day}
                    onClick={() => {
                      setDay(i);
                      setSlot(null);
                    }}
                    className={`flex min-w-[64px] flex-none flex-col items-center rounded-[4px] border px-2 py-2 ${focusRing}`}
                    style={chipStyle(i === day)}
                  >
                    <span className="text-[13px]">{i === 0 ? "오늘" : DOW[d.getDay()]}</span>
                    <span className="text-[18px] font-bold tabular-nums">
                      {d.getMonth() + 1}.{d.getDate()}
                    </span>
                    {weekend(d) && <span className="text-[12px] font-bold">주말</span>}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-[15px] font-bold">방문 시간</legend>
              <div className="grid grid-cols-4 gap-2">
                {SLOTS.map((s, i) => {
                  const n = left(i);
                  const full = n <= 0;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={full}
                      aria-pressed={slot === i}
                      onClick={() => setSlot(i)}
                      className={`flex flex-col items-center rounded-[4px] border px-1 py-2 disabled:cursor-not-allowed ${focusRing}`}
                      style={chipStyle(slot === i, full)}
                    >
                      <span className="text-[16px] font-bold tabular-nums">
                        {s}
                      </span>
                      <span className="text-[12px]">{full ? "마감" : `${n}팀 남음`}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <fieldset>
                <legend className="mb-2 text-[15px] font-bold">관심 타입</legend>
                <div className="flex gap-2">
                  {TYPES.map((x) => (
                    <button key={x.id} type="button" aria-pressed={type === x.id} onClick={() => setType(x.id)} className={`flex-1 rounded-[4px] border px-2 py-2 text-[15px] font-semibold ${focusRing}`} style={chipStyle(type === x.id)}>
                      {x.id}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 text-[15px] font-bold">인원</legend>
                <div className="flex items-center gap-3">
                  <button type="button" aria-label="인원 줄이기" onClick={() => setPeople((n) => Math.max(1, n - 1))} className={`inline-flex h-10 w-10 items-center justify-center rounded-[4px] border ${focusRing}`} style={chipStyle(false)}>
                    <Minus size={18} aria-hidden />
                  </button>
                  <span className="min-w-[40px] text-center text-[18px] font-bold" aria-live="polite">
                    {people}명
                  </span>
                  <button type="button" aria-label="인원 늘리기" onClick={() => setPeople((n) => Math.min(4, n + 1))} className={`inline-flex h-10 w-10 items-center justify-center rounded-[4px] border ${focusRing}`} style={chipStyle(false)}>
                    <Plus size={18} aria-hidden />
                  </button>
                </div>
              </fieldset>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-[15px] font-bold">
                이름
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`${input} mt-1.5 font-normal`} style={inputStyle} />
              </label>
              <label className="block text-[15px] font-bold">
                휴대폰
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={`${input} mt-1.5 font-normal placeholder:opacity-50`} style={inputStyle} />
              </label>
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-[15px]">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 flex-none accent-[#1f3d33]" />
              <span>개인정보 수집, 이용 동의(이름, 휴대폰, 방문 확인 후 6개월 보관)</span>
            </label>

            {err && (
              <p className="inline-flex items-center gap-2 rounded-[4px] px-3 py-2 text-[15px] font-bold" style={{ background: "#fff", color: C.error }} role="alert">
                <CircleAlert size={18} aria-hidden />
                {err}
              </p>
            )}

            <button type="submit" data-gtm-cta="presale_visit_submit" className={`inline-flex w-full items-center justify-center gap-2 rounded-[4px] px-5 py-3.5 text-[17px] font-semibold text-white sm:w-auto ${focusRing}`} style={{ background: C.accent, outlineColor: C.accent }}>
              <CalendarCheck size={20} aria-hidden />
              방문예약 하기
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- 4. 입지환경 지도 ---------- */

/** 약도와 목록이 같이 쓰는 번호 */
const NUMBERED = CATS.flatMap(({ id }) => PLACES[id].map((p) => ({ ...p, cat: id }))).map((p, i) => ({ ...p, no: i + 1 }));

function LocationMap() {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:items-start">
      <div className="overflow-hidden rounded-[6px] border" style={{ borderColor: C.line }}>
        <svg viewBox="0 0 640 420" className="block h-auto w-full" role="img" aria-label={`사업지 주변 약도. ${NUMBERED.map((p) => `${p.no} ${p.n} ${p.t}`).join(", ")}`}>
          <rect width="640" height="420" fill="#f0f0ee" />
          {/* 블록 */}
          {[
            [20, 20, 150, 110],
            [190, 20, 150, 90],
            [20, 200, 140, 80],
            [380, 170, 120, 90],
            [520, 180, 110, 80],
            [380, 280, 110, 70],
            [520, 280, 110, 70],
            [400, 20, 100, 70],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="#e4e4e2" />
          ))}
          {/* 공원과 하천 */}
          <path d="M50 300 L180 292 L196 362 L60 372 Z" fill="#dce3d8" />
          <path d="M0 392 C120 368 220 404 340 386 C460 368 540 404 640 378 L640 420 L0 420 Z" fill="#d9e0e2" />
          {/* 길 */}
          <g fill="none" strokeLinecap="round">
            <path d="M0 150 H640" stroke="#fff" strokeWidth="22" />
            <path d="M360 0 V385" stroke="#fff" strokeWidth="18" />
            <path d="M360 150 L640 40" stroke="#fff" strokeWidth="16" />
            <path d="M175 150 V385" stroke="#fff" strokeWidth="10" />
            <path d="M0 280 H640" stroke="#fff" strokeWidth="10" />
            <path d="M500 150 V385" stroke="#fff" strokeWidth="10" />
          </g>
          {/* 지하철 */}
          <path d="M0 60 L640 140" stroke="#9a9a9a" strokeWidth="6" fill="none" />
          <path d="M0 60 L640 140" stroke="#fff" strokeWidth="2" strokeDasharray="10 14" fill="none" />

          {/* 사업지 */}
          <rect x="196" y="172" width="118" height="88" rx="4" fill={C.accent} />
          <text x="255" y="216" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="700" fill="#fff">
            사업지
          </text>

          {/* 견본주택 */}
          <g transform="translate(468 186)">
            <path d="M0 -14 L14 0 L0 14 L-14 0 Z" fill={C.ink} stroke="#fff" strokeWidth="2" />
            <text x="20" y="1" dominantBaseline="central" fontSize="20" fontWeight="700" fill={C.ink}>
              견본주택
            </text>
          </g>

          {/* 주변 시설 번호 */}
          {NUMBERED.map((p) => (
            <g key={p.n} transform={`translate(${p.x} ${p.y})`}>
              <circle r="14" fill="#fff" stroke={C.accent} strokeWidth="3" />
              <text textAnchor="middle" dominantBaseline="central" fontSize="15" fontWeight="700" fill={C.accent}>
                {p.no}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          {CATS.map(({ id, icon: Icon }) => (
            <div key={id}>
              <h3 className="flex items-center gap-1.5 border-b-2 pb-1.5 text-[16px] font-bold" style={{ borderColor: C.ink }}>
                <Icon size={18} aria-hidden style={{ color: C.accent }} />
                {id}
              </h3>
              <ul>
                {NUMBERED.filter((p) => p.cat === id).map((p) => (
                  <li key={p.n} className="flex items-center justify-between gap-2 border-b py-2 text-[15px]" style={{ borderColor: C.line }}>
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 text-[12px] font-bold tabular-nums" style={{ borderColor: C.accent, color: C.accent }}>
                        {p.no}
                      </span>
                      {p.n}
                    </span>
                    <span className="flex-none" style={{ color: C.body }}>
                      {p.t}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-[6px] p-4 text-[15px] leading-[1.75]" style={{ background: C.soft }}>
          <p className="font-bold">
            견본주택 오시는 길
          </p>
          <p>{GALLERY_ADDR}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <a href={`tel:${TEL.replace(/-/g, "")}`} className={`inline-flex items-center gap-1.5 font-bold underline-offset-4 hover:underline ${focusRing}`} style={{ color: C.accent, outlineColor: C.accent }}>
              <Phone size={16} aria-hidden />
              분양 문의 {TEL}
            </a>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle size={16} aria-hidden />
              {KAKAO}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#fff" : "#111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          아파트 분양
        </span>
      </span>
    </span>
  );
}
