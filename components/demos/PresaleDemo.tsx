"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { CalendarCheck, Check, CircleAlert, GraduationCap, MapPin, MessageCircle, Minus, Phone, Plus, ShoppingCart, TrainFront, Trees } from "lucide-react";
import { Noto_Serif_KR } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 아파트 분양 홍보관 샘플: 가상의 곰파트너 아파트(ㅎㄷ시). 사업지, 견본주택 주소, 분양가, 손님 이름은 모두 가상이다.
   첫 화면 사진 출처: Pexels 사진 28456460

   국내 분양 홈페이지 공통 구성(참고): 메뉴는 사업개요, 입지환경, 단지안내, 세대안내(타입별 평면도), 분양안내(분양 일정,
   입주자모집공고, 분양가), 견본주택(방문예약, 오시는 길), 관심고객등록. 첫 화면은 큰 조감도와 "견본주택 오픈" 문구,
   아래에 대표번호와 방문예약 버튼이 붙어 다닌다. 관용 문구는 주택형, 전용면적, 공급면적, 계약금 10%, 중도금 60% 이자후불제,
   잔금 30%, 발코니 확장 별도, "견본주택 방문은 사전 예약제로 운영됩니다", "이해를 돕기 위한 것으로 실제와 다를 수 있습니다".

   핵심 모션: 첫 화면(pv-poster)은 밝은 복층 거실 사진 한 장이 화면을 채운다. 들어올 때 사진이 1.6초 동안 천천히 다가오고
   (scale 1.06 -> 1), 문장과 정보 줄은 0.3초 늦게 아래에서 올라온다(CSS keyframes, 끝 상태가 기본값이라 JS 없이도 보인다).
   스크롤하면 사진만 조금 느리게 움직인다(y 0 -> 8%). 본문에서는 타입을 바꿀 때 평면도 벽선이 다시 그려지는 것 하나만 남겼다.
   동작 줄이기면 모두 멈춘 완성 상태다. 제목(h1, h2)만 명조, 나머지는 기본 고딕.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 타입 고르기: 59, 84, 109 를 누르면 평면도 벽선이 다시 그려지고 전용, 공급면적과 방 구성이 바뀐다.
   2. 분양가 계산: 타입, 층, 발코니 확장을 고르면 분양가와 계약금, 중도금 6회, 잔금 일정이 날짜와 함께 나온다.
   3. 견본주택 방문예약: 날짜, 시간(남은 팀 수), 관심 타입, 인원, 이름, 휴대폰. 완료하면 예약 번호와 담당 창구, 확인 연락일.
   4. 입지환경: 그린 지도에서 교통, 교육, 생활, 자연을 고르면 사업지에서 이어지는 점선과 거리가 나온다. */

/** 명조는 h1, h2 에만 쓴다 */
const serifF = { fontFamily: `${Noto_Serif_KR.style.fontFamily}, serif` } as const;

const IMG = "/images/demo-presale";

const BRAND = "곰파트너";
const GALLERY = `${BRAND} 견본주택`;
const GALLERY_ADDR = "ㅎㄷ시 ㅇㅇ구 ㅇㅇ로 00 (ㅎㄷ역 2번 출구 앞)";
const SITE_ADDR = "ㅎㄷ시 ㅇㅇ구 ㅇㅇ동 일원";
const TEL = "1600-0000";
const KAKAO = "카카오톡 채널 곰파트너";

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
/** 첫 화면 사진이 다가오는 시간 */
const HERO_IN = 1.6;
/** 평면도 벽선 다시 그리기 */
const PLAN_DUR = 0.6;
const PLAN_STAGGER = 0.035;

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
interface Room {
  n: string;
  r: [number, number, number, number];
  kind: "live" | "bed" | "wet" | "etc" | "bal";
}
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
  w: number;
  d: number;
  plan: Room[];
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
    w: 11,
    d: 9.7,
    plan: [
      { n: "침실3", r: [0, 0, 3, 3.6], kind: "bed" },
      { n: "욕실1", r: [3, 0, 5, 2.4], kind: "wet" },
      { n: "현관", r: [5, 0, 7, 2.4], kind: "etc" },
      { n: "", r: [3, 2.4, 7, 3.6], kind: "etc" },
      { n: "주방", r: [7, 0, 9.2, 3.6], kind: "live" },
      { n: "욕실2", r: [9.2, 0, 11, 2.2], kind: "wet" },
      { n: "드레스룸", r: [9.2, 2.2, 11, 3.6], kind: "etc" },
      { n: "침실2", r: [0, 3.6, 3, 8.4], kind: "bed" },
      { n: "거실", r: [3, 3.6, 7.4, 8.4], kind: "live" },
      { n: "안방", r: [7.4, 3.6, 11, 8.4], kind: "bed" },
      { n: "발코니", r: [0, 8.4, 11, 9.7], kind: "bal" },
    ],
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
    w: 14,
    d: 10.4,
    plan: [
      { n: "현관", r: [0, 0, 2.2, 2.6], kind: "etc" },
      { n: "욕실1", r: [2.2, 0, 4.4, 2.6], kind: "wet" },
      { n: "팬트리", r: [4.4, 0, 6, 2.6], kind: "etc" },
      { n: "", r: [0, 2.6, 6, 4.6], kind: "etc" },
      { n: "주방", r: [6, 0, 10.2, 4], kind: "live" },
      { n: "거실", r: [6, 4, 10.2, 9], kind: "live" },
      { n: "침실2", r: [0, 4.6, 3, 9], kind: "bed" },
      { n: "침실3", r: [3, 4.6, 6, 9], kind: "bed" },
      { n: "드레스룸", r: [10.2, 0, 12.2, 3.4], kind: "etc" },
      { n: "욕실2", r: [12.2, 0, 14, 3.4], kind: "wet" },
      { n: "안방", r: [10.2, 3.4, 14, 9], kind: "bed" },
      { n: "발코니", r: [0, 9, 14, 10.4], kind: "bal" },
    ],
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
    w: 16,
    d: 11,
    plan: [
      { n: "침실4", r: [0, 0, 3, 3.8], kind: "bed" },
      { n: "욕실1", r: [3, 0, 5, 2.6], kind: "wet" },
      { n: "현관", r: [5, 0, 7.4, 2.6], kind: "etc" },
      { n: "", r: [3, 2.6, 7.4, 3.8], kind: "etc" },
      { n: "주방", r: [7.4, 0, 11.4, 3.8], kind: "live" },
      { n: "드레스룸", r: [11.4, 0, 13.8, 3.8], kind: "etc" },
      { n: "욕실2", r: [13.8, 0, 16, 3.8], kind: "wet" },
      { n: "침실2", r: [0, 3.8, 3.2, 9.6], kind: "bed" },
      { n: "침실3", r: [3.2, 3.8, 6.4, 9.6], kind: "bed" },
      { n: "거실", r: [6.4, 3.8, 11.4, 9.6], kind: "live" },
      { n: "안방", r: [11.4, 3.8, 16, 9.6], kind: "bed" },
      { n: "발코니", r: [0, 9.6, 16, 11], kind: "bal" },
    ],
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
type FloorId = (typeof FLOORS)[number]["id"];

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
const FIRST_DEPOSIT = 10000000;

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
const SITE_C: [number, number] = [250, 215];
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

export function PresaleDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [typeId, setTypeId] = useState<TypeId>("84");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] font-medium underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("pv-visit")} />

      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:px-6">
          <h2 className="inline-flex items-center gap-2 text-[21px] font-bold leading-none">
            <SampleLogo />
          </h2>
          <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center">
            {[
              ["pv-overview", "사업개요"],
              ["pv-types", "세대안내"],
              ["pv-price", "분양안내"],
              ["pv-visit", "견본주택"],
              ["pv-map", "입지환경"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.accent }}>
                {label}
              </button>
            ))}
            <a href={`tel:${TEL.replace(/-/g, "")}`} className={`ml-1 inline-flex items-center gap-1.5 rounded-[4px] px-3 py-1.5 text-[15px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.accent }}>
              <Phone size={16} aria-hidden />
              {TEL}
            </a>
          </nav>
        </div>
      </header>

      <Overview today={today} />

      <section id="pv-types" aria-labelledby="pv-types-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="pv-types-title" title="세대안내" />
        <TypePicker reduce={reduce} typeId={typeId} setTypeId={setTypeId} />
      </section>

      <section id="pv-price" aria-labelledby="pv-price-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="pv-price-title" title="분양가와 납부 일정" />
        <PriceCalc today={today} typeId={typeId} setTypeId={setTypeId} />
      </section>

      <section id="pv-visit" aria-labelledby="pv-visit-title" className="mt-16 scroll-mt-4 md:mt-24" style={{ background: C.soft, color: C.ink }}>
        <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-6 md:py-16">
          <SectionTitle id="pv-visit-title" title="견본주택 방문예약" />
          <VisitForm reduce={reduce} today={today} typeId={typeId} />
        </div>
      </section>

      <section id="pv-map" aria-labelledby="pv-map-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="pv-map-title" title="입지환경" />
        <LocationMap reduce={reduce} />
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

/* ---------- 첫 화면 ---------- */

/** 문장 등장. 끝 상태가 기본값이라 JS 가 없어도 보인다 */
const RISE_CSS = `@keyframes pv-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.pv-rise{animation:pv-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both}
@media (prefers-reduced-motion: reduce){.pv-rise{animation:none}}`;

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  return (
    <section id="pv-poster" ref={ref} aria-labelledby="pv-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: C.soft, color: C.ink }}>
      <style>{RISE_CSS}</style>
      <motion.div className="absolute inset-0" style={{ y: photoY }}>
        <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : HERO_IN, ease: EASE }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="천장이 높은 복층 세대 내부. 위층 거실 난간 아래로 주방과 식탁이 보인다"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "55% 35%" }}
          />
        </motion.div>
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0) 22%), linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.8) 38%, rgba(255,255,255,0.1) 72%)" }}
      />

      {/* 로고와 핵심 행동 하나 */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 pt-4 md:px-12 md:pt-7">
        <p className="inline-flex items-center gap-2 text-[17px] font-bold leading-none">
          <SampleLogo size={18} />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta="presale_poster_cta"
          className={`inline-flex h-11 flex-none items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold text-white ${focusRing}`}
          style={{ background: C.accent, outlineColor: C.accent }}
        >
          <CalendarCheck size={18} aria-hidden />
          방문예약
        </button>
      </div>

      {/* 문장 */}
      <div className={`relative z-[1] mt-auto max-w-[1200px] px-4 pb-[10svh] md:px-12 ${reduce ? "" : "pv-rise"}`}>
        <h1
          id="pv-poster-title"
          className="text-[36px] font-bold md:text-[clamp(40px,5vw,72px)]"
          style={{ ...serifF, letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}
        >
          84타입 견본주택,
          <br />
          주말 관람 가능
        </h1>
        <p className="mt-4 text-[16px] md:mt-5 md:text-[18px]" style={{ color: C.body }}>
          {GALLERY}, 매일 10:00 ~ 18:00
        </p>
      </div>
    </section>
  );
}

/* ---------- 사업개요와 분양 일정 ---------- */

function Overview({ today }: { today: Date }) {
  const moveIn = addMonths(daysAgo(today, -CONTRACT_IN), MOVE_IN_MONTHS);
  const rows: [string, React.ReactNode][] = [
    ["대지위치", SITE_ADDR],
    ["건축규모", "지하 2층, 지상 25층, 8개동"],
    ["세대수", `총 ${TOTAL_HOUSEHOLDS}세대 (59타입, 84타입, 109타입)`],
    ["입주예정", ym(moveIn)],
    ["견본주택", GALLERY_ADDR],
  ];
  return (
    <section id="pv-overview" aria-labelledby="pv-overview-title" className="mx-auto mt-12 grid max-w-[1200px] scroll-mt-4 gap-10 px-4 md:mt-16 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:px-6">
      <div>
        <SectionTitle id="pv-overview-title" title="사업개요" />
        <dl className="grid grid-cols-[88px_minmax(0,1fr)] border-t text-[16px] md:grid-cols-[110px_minmax(0,1fr)]" style={{ borderColor: C.ink }}>
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="border-b py-3 font-semibold" style={{ borderColor: C.line, color: C.ink }}>
                {k}
              </dt>
              <dd className="border-b py-3" style={{ borderColor: C.line }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <h3 className="mb-7 text-[22px] font-bold leading-[42px] md:text-[26px] md:leading-[51px]" style={{ color: C.ink }}>
          분양 일정
        </h3>
        <ol className="border-t" style={{ borderColor: C.ink }}>
          {SCHEDULE.map(([name, from, to]) => {
            const d1 = daysAgo(today, -from);
            const done = from < 0;
            const label = to ? `${fmtKo(d1)} ~ ${fmtKo(daysAgo(today, -to))}` : fmtKo(d1);
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
                <span className="text-right text-[15px] tabular-nums">
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ---------- 1. 타입 고르기와 평면도 ---------- */

const ROOM_FILL: Record<Room["kind"], string> = {
  live: "#f3f2ee",
  bed: "#eef0ee",
  wet: "#e9eced",
  etc: "#f7f7f5",
  bal: "#efefed",
};
const PLAN_U = 40;

function TypePicker({ reduce, typeId, setTypeId }: { reduce: boolean; typeId: TypeId; setTypeId: (t: TypeId) => void }) {
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
        <div className="rounded-[6px] border bg-white p-3 md:p-6" style={{ borderColor: C.line }}>
          <FloorPlan key={t.id} t={t} reduce={reduce} />
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

function FloorPlan({ t, reduce }: { t: UnitType; reduce: boolean }) {
  const W = t.w * PLAN_U;
  const D = t.d * PLAN_U;
  return (
    <svg viewBox={`-10 -10 ${W + 20} ${D + 20}`} className="block h-auto w-full" role="img" aria-label={`${t.id}타입 평면도. ${t.plan.filter((r) => r.n).map((r) => r.n).join(", ")}`}>
      {t.plan.map((room, i) => {
        const [x0, y0, x1, y1] = room.r.map((v) => v * PLAN_U);
        const w = x1 - x0;
        const hgt = y1 - y0;
        const d = `M${x0} ${y0} H${x1} V${y1} H${x0} Z`;
        const fs = room.n ? Math.min(24, (w * 0.86) / room.n.length) : 0;
        return (
          <g key={i}>
            <motion.path
              d={d}
              fill={ROOM_FILL[room.kind]}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : PLAN_DUR * 0.6 + i * PLAN_STAGGER }}
            />
            <motion.path
              d={d}
              fill="none"
              stroke={room.kind === "bal" ? C.muted : "#333333"}
              strokeWidth={room.kind === "bal" ? 1.5 : 4}
              strokeDasharray={room.kind === "bal" ? "6 5" : undefined}
              strokeLinejoin="miter"
              initial={reduce || room.kind === "bal" ? false : { pathLength: 0 }}
              animate={room.kind === "bal" ? undefined : { pathLength: 1 }}
              transition={{ duration: reduce ? 0 : PLAN_DUR, delay: reduce ? 0 : i * PLAN_STAGGER, ease: EASE }}
            />
            {room.n && (
              <text x={x0 + w / 2} y={y0 + hgt / 2} textAnchor="middle" dominantBaseline="central" fontSize={fs} fontWeight={700} fill={room.kind === "bal" ? C.muted : C.ink}>
                {room.n}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- 2. 분양가와 납부 일정 ---------- */

function PriceCalc({ today, typeId, setTypeId }: { today: Date; typeId: TypeId; setTypeId: (t: TypeId) => void }) {
  const [floor, setFloor] = useState<FloorId>("std");
  const [ext, setExt] = useState(true);
  const t = typeById(typeId);
  const rate = FLOORS.find((f) => f.id === floor)?.rate ?? 1;
  const price = Math.round((t.price * rate) / 1e6) * 1e6;
  const contract = daysAgo(today, -CONTRACT_IN);
  const moveIn = addMonths(contract, MOVE_IN_MONTHS);

  const deposit = price * 0.1;
  const mid = price * 0.1;
  const rest = price * 0.3;
  const rows: { name: string; when: string; amount: number; note?: string }[] = [
    { name: "계약금 1차", when: fmtKo(contract), amount: FIRST_DEPOSIT, note: "계약 시 정액" },
    { name: "계약금 2차", when: fmtKo(daysAgo(contract, -30)), amount: deposit - FIRST_DEPOSIT, note: "계약 후 30일 이내" },
    ...[1, 2, 3, 4, 5, 6].map((n) => ({ name: `중도금 ${n}회`, when: ym(addMonths(contract, n * 4)), amount: mid })),
    { name: "잔금", when: `${ym(moveIn)} 입주 지정기간`, amount: rest },
  ];

  const chip = `rounded-[4px] border px-3 py-2 text-[15px] font-semibold transition-colors duration-150 ${focusRing}`;
  const chipStyle = (on: boolean) => ({ background: on ? C.accent : "#fff", color: on ? "#fff" : C.ink, borderColor: on ? C.accent : C.field, outlineColor: C.accent });

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:items-start">
      <div className="space-y-6">
        <fieldset>
          <legend className="mb-2 text-[15px] font-bold">주택형</legend>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((x) => (
              <button key={x.id} type="button" aria-pressed={x.id === typeId} onClick={() => setTypeId(x.id)} className={chip} style={chipStyle(x.id === typeId)}>
                {x.id}타입
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-[15px] font-bold">층</legend>
          <div className="flex flex-wrap gap-2">
            {FLOORS.map((f) => (
              <button key={f.id} type="button" aria-pressed={f.id === floor} onClick={() => setFloor(f.id)} className={chip} style={chipStyle(f.id === floor)}>
                {f.label}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="flex cursor-pointer items-center gap-3 text-[16px]">
          <input type="checkbox" checked={ext} onChange={(e) => setExt(e.target.checked)} className="h-5 w-5 accent-[#1f3d33]" />
          발코니 확장
          <span className="text-[15px]" style={{ color: C.muted }}>
            ({eok(t.balcony)}, 별도 계약)
          </span>
        </label>

        <div className="rounded-[6px] border p-5" style={{ background: C.soft, borderColor: C.line, color: C.ink }}>
          <p className="text-[15px]" style={{ color: C.muted }}>
            {t.id}타입 {FLOORS.find((f) => f.id === floor)?.label} 분양가
          </p>
          <p className="mt-1 text-[34px] font-bold leading-tight tabular-nums md:text-[40px]" aria-live="polite">
            {eok(price)}
          </p>
          {ext && (
            <p className="mt-2 text-[15px]" style={{ color: C.body }}>
              발코니 확장 포함 {eok(price + t.balcony)}
            </p>
          )}
          {/* 계약금, 중도금, 잔금 비율 띠 */}
          <div className="mt-5 flex h-9 overflow-hidden rounded-[3px] text-[13px] font-bold" aria-hidden>
            <span className="flex w-[10%] items-center justify-center text-white" style={{ background: C.accent }}>
              10%
            </span>
            <span className="flex w-[60%] items-center justify-center border-x" style={{ background: "#dcdcda", borderColor: C.soft }}>
              중도금 60%
            </span>
            <span className="flex w-[30%] items-center justify-center" style={{ background: "#ececea" }}>
              잔금 30%
            </span>
          </div>
          <p className="mt-3 text-[14px]" style={{ color: C.body }}>
            계약금 10%, 중도금 60% 이자후불제, 잔금 30%
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[18px] font-bold">
          납부 일정
        </h3>
        <ol className="border-t" style={{ borderColor: C.ink }}>
          {rows.map((r) => (
            <li key={r.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 border-b py-2.5" style={{ borderColor: C.line }}>
              <span className="text-[16px] font-bold">
                {r.name}
                <span className="ml-2 text-[14px] font-normal" style={{ color: C.muted }}>
                  {r.when}
                </span>
              </span>
              <span className="text-right text-[16px] font-bold tabular-nums">
                {eok(r.amount)}
              </span>
              {r.note && (
                <span className="col-span-2 text-[13px]" style={{ color: C.muted }}>
                  {r.note}
                </span>
              )}
            </li>
          ))}
          {ext && (
            <li className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 border-b py-2.5" style={{ borderColor: C.line }}>
              <span className="text-[16px] font-bold">
                발코니 확장
                <span className="ml-2 text-[14px] font-normal" style={{ color: C.muted }}>
                  계약 시 10%, 입주 시 90%
                </span>
              </span>
              <span className="text-right text-[16px] font-bold tabular-nums">
                {eok(t.balcony)}
              </span>
            </li>
          )}
        </ol>
        <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
          부가가치세, 취득세는 빠진 금액이에요. 층과 향에 따라 금액이 달라져요.
        </p>
      </div>
    </div>
  );
}

/* ---------- 3. 견본주택 방문예약 ---------- */

type Done = { no: string; date: Date; slot: string; type: TypeId; people: number; name: string; phone: string };

function VisitForm({ reduce, today, typeId }: { reduce: boolean; today: Date; typeId: TypeId }) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => daysAgo(today, -i)), [today]);
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<number | null>(null);
  const [typePick, setType] = useState<TypeId | null>(null);
  const type = typePick ?? typeId;
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
                {fmtKo(done.date)} {done.slot}
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
              <dd>{fmtKo(today)} 중 확인 문자, 방문 전날 안내 문자</dd>
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

function LocationMap({ reduce }: { reduce: boolean }) {
  const [cat, setCat] = useState<Cat>("교통");
  const places = PLACES[cat];
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:items-start">
      <div className="overflow-hidden rounded-[6px] border" style={{ borderColor: C.line }}>
        <svg viewBox="0 0 640 420" className="block h-auto w-full" role="img" aria-label={`사업지 주변 지도. ${cat}: ${places.map((p) => `${p.n} ${p.t}`).join(", ")}`}>
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

          {/* 고른 분류 */}
          <AnimatePresence initial={false}>
            {places.map((p) => (
              <motion.g key={`${cat}-${p.n}`} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }}>
                <path d={`M${SITE_C[0]} ${SITE_C[1]} L${p.x} ${p.y}`} stroke={C.accent} strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" fill="none" />
                <circle cx={p.x} cy={p.y} r="11" fill={C.accent} stroke="#fff" strokeWidth="3" />
                <g transform={`translate(${p.x} ${p.y - 30})`}>
                  <rect x={-(p.n.length * 10.5 + 10)} y="-17" width={p.n.length * 21 + 20} height="32" rx="3" fill="#fff" stroke={C.field} strokeWidth="1" />
                  <text textAnchor="middle" dominantBaseline="central" y="-1" fontSize="19" fontWeight="700" fill={C.ink}>
                    {p.n}
                  </text>
                </g>
              </motion.g>
            ))}
          </AnimatePresence>
        </svg>
      </div>

      <div>
        <div role="group" aria-label="생활 시설 분류" className="grid grid-cols-4 gap-2">
          {CATS.map(({ id, icon: Icon }) => {
            const on = id === cat;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setCat(id)}
                className={`flex flex-col items-center gap-1 rounded-[6px] border px-1 py-2.5 text-[15px] font-semibold ${focusRing}`}
                style={{ background: on ? C.accent : "#fff", color: on ? "#fff" : C.ink, borderColor: on ? C.accent : C.field, outlineColor: C.accent }}
              >
                <Icon size={20} aria-hidden />
                {id}
              </button>
            );
          })}
        </div>
        <ul className="mt-4 border-t" style={{ borderColor: C.ink }}>
          {places.map((p) => (
            <li key={p.n} className="flex items-center justify-between border-b py-3 text-[16px]" style={{ borderColor: C.line }}>
              <span className="inline-flex items-center gap-2 font-bold">
                <MapPin size={17} aria-hidden style={{ color: C.accent }} />
                {p.n}
              </span>
              <span>{p.t}</span>
            </li>
          ))}
        </ul>
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
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          곰파트너
        </span>
        <span className="text-[12px] font-semibold opacity-75">분양 홍보관 샘플</span>
      </span>
    </span>
  );
}
