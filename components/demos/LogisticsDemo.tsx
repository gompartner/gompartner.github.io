"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useTime, useTransform, type MotionValue } from "framer-motion";
import {
  Calculator,
  Check,
  ChevronRight,
  Clock,
  Forklift,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  PackageOpen,
  Phone,
  RotateCcw,
  Snowflake,
  Truck,
  Undo2,
  Warehouse,
} from "lucide-react";
import { Black_Han_Sans, JetBrains_Mono } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 물류 대행(3PL) 회사 홈페이지 샘플: 가상의 곰파트너물류. 온라인 쇼핑몰 상품을 맡아 보관하고, 주문이 들어오면 포장해 택배로 보낸다.
   상호, 주소, 전화번호, 손님 이름은 모두 가상이다.

   국내 풀필먼트, 3PL 사이트 공통 구성(참고): 메뉴는 서비스 소개, 이용 요금, 물류센터, 입점 절차, 견적 문의.
   첫 화면에 "오후 2시 주문까지 당일 출고", "스마트스토어, 쿠팡, 카페24 주문 자동 연동"을 크게 두고 견적 문의 버튼을 붙인다.
   요금은 보관비(팔레트당 월), 입고비, 출고 작업비(건당, 물량 구간별), 택배비(크기별), 합포장 추가 요금으로 나눠 표로 공개하고,
   "부가세 별도", "포장재 실비"를 적는다. 상온 팔레트 월 25,000~40,000원, 출고 작업비 건당 800~1,200원, 극소형 택배 2,000원대가 흔하다.
   고객사 로고, 출고량 같은 실적 숫자는 넣지 않는다.

   포스터 첫 화면(lg-poster): 노란 바탕에 큰 문장 "오후 2시 전 주문은 오늘 나가요" 하나만 둔다. 메뉴, 카드, 표는 없다.
   아래쪽에 컨베이어 벨트가 화면을 가로지르고, 골판지 상자(앞, 윗면, 옆면 세 면과 테이프)가 벨트 위로 지나간다.
   오른쪽의 송장 부착기 머리가 내려올 때마다 지나가는 상자 앞면에 송장이 착 붙는다. 들어올 때 상자들이 벨트 위로 툭 떨어지고(등장),
   그 뒤에는 벨트가 계속 돈다(반복 움직임은 이것 하나, 상자 하나가 6초마다 부착기 아래를 지난다).
   스크롤하면 벨트가 빨라지며 상자들이 오른쪽 화면 밖으로 빠져나가고 문장은 위로 빠진다.
   동작 줄이기면 송장이 붙은 상자가 부착기 아래 멈춘 장면으로 고정하고, 떨어짐, 벨트, 스크롤 퇴장이 없다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 견적 계산: 월 출고 건수, 보관 팔레트 수, 택배 크기를 고르면 보관비, 출고 작업비, 택배비와 월 합계, 건당 평균이 나온다.
   2. 출고 마감 시계: 지금 시각 기준 오늘 오후 2시 마감까지 남은 시간. 지났거나 주말이면 다음 출고일과 남은 시간을 보여 준다.
   3. 물류센터 안내: 그린 지도에서 1센터(상온), 2센터(냉장, 냉동)를 고르면 지도가 그 센터로 옮겨 가고 입고 시간, 화물차 진입을 바꿔 보여 준다.
   4. 도입 상담 신청: 견적 조건을 이어 받아 쇼핑몰, 담당자, 판매 채널, 상품 종류를 받는다. 완료 화면에 접수 번호, 담당 창구, 회신 예정일. */

const sfxF = { fontFamily: `${Black_Han_Sans.style.fontFamily}, var(--font-sfx), sans-serif`, fontWeight: 400 } as const;
const monoF = { fontFamily: `${JetBrains_Mono.style.fontFamily}, ui-monospace, monospace` } as const;

const BRAND = "곰파트너물류";
const ADDRESS = "경기 ㅇㅊ시 ㅇㅇ면 ㅇㅇ로 00";
const TEL = "031-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";

const C = {
  yellow: "#ffcd00",
  yellowDeep: "#e9b800",
  black: "#141414",
  ink: "#1b1b1a",
  paper: "#f6f4ee",
  paperDeep: "#ebe7dc",
  white: "#ffffff",
  kraft: "#b9874e",
  kraftDeep: "#8a5c2e",
  muted: "#5c5a55",
  line: "#d6d1c4",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 상자가 벨트에 떨어질 때 살짝 튀는 곡선 */
const EASE_DROP = [0.34, 1.45, 0.64, 1] as const;
/** 상자 떨어지는 시간 */
const DROP_DUR = 0.6;
/** 상자마다 떨어지는 시각 */
const DROP_DELAY = [0.2, 0, 0.32, 0.4, 0.4, 0.12];
/** 막대, 지도, 패널 전환 */
const DUR = 0.45;
/** 포스터 퇴장이 끝나는 스크롤 진행도(포스터 래퍼 180svh 기준, 고정이 풀리는 0.44 직전) */
const EXIT_END = 0.42;

/* ---------- 포스터 장면 좌표(SVG 단위) ---------- */

/** 상자 사이 거리 */
const GAP = 700;
/** 벨트 속도. 6초마다 상자 하나가 부착기 아래를 지난다 */
const BELT_V = GAP / 6;
const BOXES = 6;
const LOOP = GAP * BOXES;
const LOOP_START = -1300;
/** 송장 부착기 가운데 */
const HIT_X = 1150;
/** 첫 송장이 붙는 시각 */
const FIRST_HIT = 1.4;
const PHASE = (((HIT_X - LOOP_START - FIRST_HIT * BELT_V - GAP) % LOOP) + LOOP) % LOOP;
/** 동작 줄이기 때 멈춰 둘 시각. 두 번째 상자가 송장을 붙이고 부착기 바로 아래 있다 */
const T_FIXED = FIRST_HIT + 0.45;
/** 송장이 머리에서 상자 앞면까지 내려가는 시간 */
const SLAP = 0.12;
/** 벨트 위 상자 바닥 */
const BELT_Y = 410;
/** 상자 앞면 크기와 깊이 방향 */
const BW = 340;
const BH = 240;
const DX = 80;
const DY = -50;
const BOX_SCALE = [1, 0.86, 0.94, 0.9, 1, 0.84];
/** 부착기 머리 바닥 높이(대기) */
const HEAD_IDLE = 150;
const HEAD_H = 70;
/** 벨트 고무 돌기 간격 */
const RIB = 44;

const mod = (a: number, n: number) => ((a % n) + n) % n;
const baseX = (i: number, t: number) => mod(t * BELT_V + i * GAP + PHASE, LOOP) + LOOP_START;
/** 부착기 아래를 지난 뒤 흐른 시간(초). 음수면 아직 오는 중 */
const sinceHit = (i: number, t: number) => (baseX(i, t) - HIT_X) / BELT_V;
/** 머리가 내려간 정도 0~1. 0.35초 전부터 내려가고, 붙인 뒤 0.33초에 걸쳐 올라온다 */
const press = (ts: number) => {
  if (ts < -0.35 || ts > 0.45) return 0;
  if (ts < 0) return 1 - (-ts / 0.35) ** 2;
  if (ts < SLAP) return 1;
  return 1 - (ts - SLAP) / 0.33;
};
const headBottom = (t: number) => {
  let y = HEAD_IDLE;
  for (let i = 0; i < BOXES; i++) {
    const f = press(sinceHit(i, t));
    if (f > 0) y = Math.max(y, HEAD_IDLE + (BELT_Y - BH * BOX_SCALE[i] - 2 - HEAD_IDLE) * f);
  }
  return y;
};

/* ---------- 요금 ---------- */

const PALLET_FEE = 30000;
type ParcelSize = "극소" | "소형" | "중형";
const PARCEL: Record<ParcelSize, { fee: number; spec: string }> = {
  극소: { fee: 2300, spec: "세 변 합 80cm, 2kg 이하" },
  소형: { fee: 2700, spec: "세 변 합 100cm, 5kg 이하" },
  중형: { fee: 3300, spec: "세 변 합 120cm, 10kg 이하" },
};
const WORK_TIERS = [
  { from: 0, label: "월 999건까지", fee: 1000 },
  { from: 1000, label: "월 1,000 ~ 4,999건", fee: 900 },
  { from: 5000, label: "월 5,000건 이상", fee: 800 },
];
const workFee = (orders: number) => [...WORK_TIERS].reverse().find((t) => orders >= t.from)!.fee;

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const num = (n: number) => n.toLocaleString("ko-KR");
const p2 = (n: number) => String(n).padStart(2, "0");
const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";

/* ---------- 출고 마감 ---------- */

const CUTOFF_H = 14;
const isWeekday = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5;
/** 지금 주문하면 나가는 날과 그날 마감 시각 */
function nextCutoff(now: Date) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), CUTOFF_H);
  if (isWeekday(now) && now < d) return { at: d, today: true };
  let n = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, CUTOFF_H);
  while (!isWeekday(n)) n = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, CUTOFF_H);
  return { at: n, today: false };
}
const nextBizDay = (d: Date) => {
  let n = daysAgo(d, -1);
  while (!isWeekday(n)) n = daysAgo(n, -1);
  return n;
};
/** 하루 흐름 막대 눈금(시). 오른쪽 끝은 다음 날 도착 글자 자리 */
const DAY_FROM = 8;
const DAY_TO = 21;
const DAY_MARKS = [
  { h: 9, label: "주문 수집" },
  { h: 14, label: "출고 마감" },
  { h: 17, label: "택배사 집하" },
];

/* ---------- 물류센터 ---------- */

type CenterId = "c1" | "c2";
const CENTERS: Record<CenterId, { name: string; kind: string; icon: typeof Warehouse; at: [number, number]; rows: [string, string][] }> = {
  c1: {
    name: "ㅇㅊ 1센터",
    kind: "상온",
    icon: Warehouse,
    at: [372, 168],
    rows: [
      ["주소", "경기 ㅇㅊ시 ㅇㅇ면 ㅇㅇ로 00"],
      ["보관", "상온 랙, 팔레트와 소량 선반"],
      ["입고 시간", "평일 09:00 ~ 16:00, 하루 전 입고 예정 등록"],
      ["화물차", "11톤 윙바디까지 도크 접안"],
      ["가는 길", "ㅇㅊ IC에서 차로 7분"],
    ],
  },
  c2: {
    name: "ㅇㅊ 2센터",
    kind: "냉장, 냉동",
    icon: Snowflake,
    at: [478, 300],
    rows: [
      ["주소", "경기 ㅇㅊ시 ㅇㅇ읍 ㅇㅇ길 00"],
      ["보관", "냉장 0 ~ 10도, 냉동 영하 18도 이하"],
      ["입고 시간", "평일 09:00 ~ 14:00, 온도 기록지 함께"],
      ["화물차", "5톤 냉동탑차까지"],
      ["가는 길", "1센터에서 차로 10분"],
    ],
  },
};

type Prefill = { orders: number; pallets: number; size: ParcelSize } | null;

export function LogisticsDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [prefill, setPrefill] = useState<Prefill>(null);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] font-semibold underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip pb-24" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("lg-quote")} />

      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:px-6">
        <p className="inline-flex items-center gap-2 text-[22px] leading-none" style={sfxF}>
          <BoxMark size={26} />
          {BRAND}
        </p>
        <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center">
          {[
            ["lg-service", "서비스"],
            ["lg-quote", "이용 요금"],
            ["lg-center", "물류센터"],
            ["lg-contact", "도입 상담"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.black }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* 하는 일과 오늘 출고 마감 */}
      <section aria-labelledby="lg-hero-title" className="mx-auto grid max-w-[1200px] gap-8 px-4 pt-4 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12 lg:pt-10">
        <div>
          <h2 id="lg-hero-title" className="text-[34px] leading-[1.2] md:text-[52px]" style={{ ...sfxF, wordBreak: "keep-all" }}>
            쇼핑몰 상품 보관, 포장,
            <br />
            택배 출고 대행
          </h2>
          <ul className="mt-6 flex flex-wrap gap-2 text-[15px]" aria-label="주문 자동 연동 채널">
            {["스마트스토어", "쿠팡", "카페24", "자사몰"].map((c) => (
              <li key={c} className="rounded-[4px] border-2 px-3 py-1 font-semibold" style={{ borderColor: C.black }}>
                {c}
              </li>
            ))}
            <li className="px-1 py-1 font-semibold" style={{ color: C.muted }}>
              주문 자동 연동
            </li>
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => go("lg-quote")}
              className={`inline-flex items-center gap-2 rounded-[6px] px-5 py-3 text-[16px] font-bold ${focusRing}`}
              style={{ background: C.yellow, color: C.black, outlineColor: C.black, boxShadow: `inset 0 0 0 2px ${C.black}` }}
            >
              <Calculator size={18} aria-hidden />
              견적 계산
            </button>
            <button
              type="button"
              data-gtm-cta="logistics_header_cta"
              onClick={() => go("lg-contact")}
              className={`inline-flex items-center gap-2 rounded-[6px] px-5 py-3 text-[16px] font-bold text-white ${focusRing}`}
              style={{ background: C.black, outlineColor: C.black }}
            >
              <MessageCircle size={18} aria-hidden />
              도입 상담
            </button>
          </div>
        </div>
        <CutoffBoard reduce={reduce} />
      </section>

      {/* 서비스 */}
      <section id="lg-service" aria-labelledby="lg-service-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="lg-service-title" title="맡기시면 이렇게 돌아가요" />
        <ServiceLine />
      </section>

      {/* 견적 계산 */}
      <section id="lg-quote" aria-labelledby="lg-quote-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="lg-quote-title" title="이용 요금" />
        <Quote
          reduce={reduce}
          onApply={(v) => {
            setPrefill(v);
            go("lg-contact");
          }}
        />
      </section>

      {/* 물류센터 */}
      <section id="lg-center" aria-labelledby="lg-center-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="lg-center-title" title="물류센터" />
        <CenterMap reduce={reduce} />
      </section>

      {/* 도입 상담 */}
      <section id="lg-contact" aria-labelledby="lg-contact-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="lg-contact-title" title="도입 상담 신청" />
        <Contact key={prefill ? `${prefill.orders}-${prefill.pallets}-${prefill.size}` : "blank"} prefill={prefill} today={today} reduce={reduce} />
      </section>

      <footer className="mt-20 px-4 pb-10 pt-10 text-[14px] leading-[1.8] md:px-6" style={{ background: C.black, color: "rgba(255,255,255,0.78)" }}>
        <div className="mx-auto max-w-[1200px]">
          <p className="inline-flex items-center gap-2 text-[20px] leading-none text-white" style={sfxF}>
            <BoxMark size={22} />
            {BRAND}
          </p>
          <p className="mt-3">
            {ADDRESS} / 대표전화 <span style={monoF}>{TEL}</span> / {KAKAO}
          </p>
          <p>평일 09:00 ~ 18:00, 출고 마감 오후 2시, 토요일, 일요일, 공휴일 휴무</p>
          <DemoMakerInfo className="mt-6 text-white" />
        </div>
      </footer>
    </div>
  );
}

/* ---------- 포스터 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 0 : Math.min(1, v / EXIT_END)));
  // 문장은 위로 빠진다
  const textY = useTransform(p, (v) => `${-v * 42}svh`);
  const textO = useTransform(p, (v) => 1 - Math.max(0, (v - 0.3) / 0.7));
  // 상자들은 점점 빨라지며 오른쪽으로 빠져나간다
  const extra = useTransform(p, (v) => v ** 1.6 * 2900);

  // 벨트 시계. 스크롤하는 동안은 멈춰 두고(상자가 새로 들어오지 않게), 돌아오면 멈춘 자리에서 다시 돈다
  const time = useTime();
  const frozenAt = useMotionValue(-1);
  const pausedFor = useMotionValue(0);
  // 멈추는 순간 화면 왼쪽 밖에 있던 상자는 퇴장 때 따라 들어오지 않게 숨긴다(벨트 좌표 기준 경계)
  const hideBelow = useMotionValue(-1e9);
  const svgBox = useRef<HTMLDivElement>(null);
  useMotionValueEvent(p, "change", (v) => {
    if (v > 0.001) {
      if (frozenAt.get() < 0) {
        frozenAt.set(time.get());
        const r = svgBox.current?.getBoundingClientRect();
        if (r && r.height) hideBelow.set(-r.left / (r.height / 600) - (BW / 2 + DX + 20));
      }
    } else if (frozenAt.get() >= 0) {
      pausedFor.set(pausedFor.get() + time.get() - frozenAt.get());
      frozenAt.set(-1);
    }
  });
  const te = useTransform([time, frozenAt, pausedFor], ([t, f, off]) => {
    if (reduce) return T_FIXED;
    const ms = (f as number) >= 0 ? (f as number) : (t as number);
    return (ms - (off as number)) / 1000;
  });

  const ribX = useTransform([te, extra], ([t, e]) => mod((t as number) * BELT_V + (e as number), RIB) - RIB);
  const headY = useTransform(te, (t) => headBottom(t) - HEAD_IDLE);
  const lamp = useTransform(te, (t) => {
    let f = 0;
    for (let i = 0; i < BOXES; i++) f = Math.max(f, press(sinceHit(i, t)));
    return 0.25 + f * 0.75;
  });

  return (
    <section id="lg-poster" ref={ref} aria-labelledby="lg-poster-title" className="relative" style={{ height: reduce ? undefined : "180svh", background: C.yellow }}>
      <div
        className={`${reduce ? "relative min-h-svh" : "sticky top-0 h-svh"} overflow-hidden [--hx:56%] [--ph:46svh] md:[--hx:72%] md:[--ph:62svh]`}
        style={{ background: `linear-gradient(180deg, ${C.yellow} 0%, ${C.yellow} 62%, ${C.yellowDeep} 100%)`, color: C.black }}
      >
        {/* 컨베이어 장면. 부착기가 가로 --hx 지점에 오도록 SVG를 옮긴다 */}
        <div
          ref={svgBox}
          className="pointer-events-none absolute bottom-0"
          style={{ height: "var(--ph)", width: "calc(var(--ph) * 2.6667)", left: `calc(var(--hx) - var(--ph) * ${(HIT_X / 600).toFixed(4)})` }}
        >
          <svg viewBox="0 0 1600 600" className="h-full w-full overflow-visible" role="img" aria-label="컨베이어 벨트 위로 골판지 상자가 지나가고 송장 부착기가 상자마다 송장을 붙이는 장면">
            <PosterDefs />

            {/* 바닥 그림자 */}
            <ellipse cx="800" cy="596" rx="2600" ry="26" fill="url(#lg-floor)" />

            {/* 부착기 기둥(벨트 뒤) */}
            {[HIT_X - 215, HIT_X + 215].map((x) => (
              <g key={x}>
                <rect x={x - 17} y="40" width="34" height="440" fill="url(#lg-post)" />
                <rect x={x - 17} y="40" width="4" height="440" fill="rgba(255,255,255,0.18)" />
              </g>
            ))}

            {/* 벨트 윗면 */}
            <path d="M-1700 352 H3300 V420 H-1700 Z" fill="url(#lg-rubber)" />
            <clipPath id="lg-belt-clip">
              <path d="M-1700 352 H3300 V420 H-1700 Z" />
            </clipPath>
            <g clipPath="url(#lg-belt-clip)">
              <motion.g style={{ x: ribX }}>
                <rect x="-1760" y="352" width="5120" height="68" fill="url(#lg-ribs)" />
              </motion.g>
            </g>
            <rect x="-1700" y="350" width="5000" height="3" fill="rgba(0,0,0,0.5)" />

            {/* 상자들 */}
            {Array.from({ length: BOXES }, (_, i) => (
              <PosterBox key={i} i={i} te={te} extra={extra} hideBelow={hideBelow} reduce={reduce} />
            ))}

            {/* 벨트 앞 레일, 경고 띠, 볼트 */}
            <rect x="-1700" y="418" width="5000" height="8" fill="#0b0b0b" />
            <rect x="-1700" y="426" width="5000" height="48" fill="url(#lg-rail)" />
            <rect x="-1700" y="427" width="5000" height="2" fill="rgba(255,255,255,0.28)" />
            <rect x="-1700" y="452" width="5000" height="14" fill="url(#lg-hazard)" />
            {Array.from({ length: 42 }, (_, k) => -1650 + k * 120).map((x) => (
              <circle key={x} cx={x} cy="439" r="4.5" fill="url(#lg-bolt)" />
            ))}

            {/* 다리와 가새 */}
            {Array.from({ length: 17 }, (_, k) => -1600 + k * 300).map((x) => (
              <g key={x}>
                <rect x={x} y="474" width="26" height="118" fill="url(#lg-post)" />
                <rect x={x - 8} y="586" width="42" height="8" rx="2" fill="#0d0d0d" />
              </g>
            ))}
            <path d={Array.from({ length: 16 }, (_, k) => `M${-1574 + k * 300} 490 L${-1600 + (k + 1) * 300} 570`).join(" ")} stroke="#262626" strokeWidth="7" />

            {/* 송장 부착기 */}
            <g>
              <rect x={HIT_X - 240} y="28" width="480" height="48" fill="url(#lg-rail)" />
              <rect x={HIT_X - 240} y="56" width="480" height="12" fill="url(#lg-hazard)" />
              <rect x={HIT_X - 240} y="29" width="480" height="2" fill="rgba(255,255,255,0.3)" />
              <rect x={HIT_X - 9} y="76" width="18" height="70" fill="url(#lg-chrome)" />
              <motion.g style={{ y: headY }}>
                {/* 송장 두루마리 */}
                <circle cx={HIT_X + 104} cy={HEAD_IDLE - HEAD_H / 2} r="30" fill="url(#lg-roll)" />
                <circle cx={HIT_X + 104} cy={HEAD_IDLE - HEAD_H / 2} r="10" fill="#2a2a2a" />
                <rect x={HIT_X - 82} y={HEAD_IDLE - HEAD_H} width="164" height={HEAD_H} rx="6" fill="url(#lg-head)" />
                <rect x={HIT_X - 82} y={HEAD_IDLE - HEAD_H + 2} width="164" height="3" rx="1.5" fill="rgba(255,255,255,0.3)" />
                <rect x={HIT_X - 70} y={HEAD_IDLE - 20} width="140" height="10" fill="url(#lg-hazard)" />
                <motion.circle cx={HIT_X - 56} cy={HEAD_IDLE - HEAD_H + 22} r="7" fill={C.yellow} style={{ opacity: lamp }} />
                <rect x={HIT_X - 66} y={HEAD_IDLE - 6} width="132" height="6" fill="#050505" />
              </motion.g>
            </g>
          </svg>
        </div>

        {/* 로고와 핵심 행동 하나 */}
        <motion.div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4 md:px-12 md:pt-7" style={{ y: textY }}>
          <p className="inline-flex items-center gap-2 text-[17px] leading-none" style={sfxF}>
            <BoxMark size={20} />
            {BRAND}
          </p>
          <button
            type="button"
            onClick={onCta}
            aria-label="견적 계산하기"
            title="견적 계산하기"
            data-gtm-cta="logistics_poster_cta"
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${focusRing}`}
            style={{ background: C.black, color: C.yellow, outlineColor: C.black }}
          >
            <Calculator size={22} aria-hidden />
          </button>
        </motion.div>

        {/* 큰 문장 */}
        <motion.div className="relative z-[1] px-4 pt-[13svh] md:px-12 md:pt-[11svh]" style={{ y: textY, opacity: textO }}>
          <h1 id="lg-poster-title" className="text-[clamp(52px,15vw,72px)] leading-[1.12] tracking-[-0.02em] md:text-[clamp(96px,9.2vw,180px)] md:leading-[1.06]" style={{ ...sfxF, wordBreak: "keep-all" }}>
            <span className="block">
              오후 2시 전<span className="md:hidden">
                <br />
              </span>{" "}
              주문은
            </span>
            <span className="mt-2 inline-block px-[0.12em] pb-[0.04em] md:mt-3" style={{ background: C.black, color: C.yellow }}>
              오늘 나가요
            </span>
          </h1>
          <p className="mt-5 text-[16px] font-semibold md:mt-7 md:text-[19px]">경기 ㅇㅊ 물류센터, 평일 출고</p>
        </motion.div>
      </div>
    </section>
  );
}

function PosterBox({ i, te, extra, hideBelow, reduce }: { i: number; te: MotionValue<number>; extra: MotionValue<number>; hideBelow: MotionValue<number>; reduce: boolean }) {
  const s = BOX_SCALE[i];
  const base = useTransform(te, (t) => baseX(i, t));
  const x = useTransform([base, extra], ([b, e]) => (b as number) + (e as number));
  const shown = useTransform([base, extra, hideBelow], ([b, e, h]) => ((e as number) > 0 && (b as number) < (h as number) ? 0 : 1));
  const ts = useTransform(base, (b) => (b - HIT_X) / BELT_V);
  // 송장: 부착기 머리에서 앞면까지 내려와 착 붙고, 붙는 순간 살짝 눌린다
  const labelY = useTransform(ts, (v) => (v < 0 ? -70 : v < SLAP ? -70 * (1 - v / SLAP) ** 2 : 0));
  const labelO = useTransform(ts, (v) => (v < 0 ? 0 : 1));
  const labelSy = useTransform(ts, (v) => (v >= SLAP && v < SLAP + 0.1 ? 0.92 + 0.08 * ((v - SLAP) / 0.1) : 1));
  const burst = useTransform(ts, (v) => (reduce ? 0 : v >= SLAP && v < SLAP + 0.35 ? 1 - (v - SLAP) / 0.35 : 0));

  return (
    <motion.g style={{ x, opacity: shown }}>
      <g transform={`translate(0 ${BELT_Y})`}>
        <motion.g initial={reduce ? false : { y: -620 }} animate={{ y: 0 }} transition={{ duration: reduce ? 0 : DROP_DUR, delay: reduce ? 0 : DROP_DELAY[i], ease: EASE_DROP }}>
          <g transform={`scale(${s})`}>
            <BoxArt />
            <motion.g style={{ y: labelY, opacity: labelO, scaleY: labelSy, transformBox: "fill-box", transformOrigin: "50% 0%" }}>
              <ShippingLabel />
            </motion.g>
            <motion.g style={{ opacity: burst }} stroke={C.black} strokeWidth="5" strokeLinecap="round">
              <path d={`M-92 ${-BH + 70} l-26 -14 M-96 ${-BH + 110} l-30 0 M92 ${-BH + 70} l26 -14 M96 ${-BH + 110} l30 0`} />
            </motion.g>
          </g>
        </motion.g>
      </g>
    </motion.g>
  );
}

/** 골판지 상자. 앞면 아래 가운데가 (0, 0) */
function BoxArt() {
  const L = -BW / 2;
  const R = BW / 2;
  const T = -BH;
  return (
    <g>
      {/* 벨트 위 그림자 */}
      <path d={`M${L - 4} 4 L${R + 10} 4 L${R + DX + 26} ${DY + 2} L${L + DX} ${DY + 2} Z`} fill="rgba(0,0,0,0.42)" />
      {/* 옆면 */}
      <path d={`M${R} 0 L${R} ${T} L${R + DX} ${T + DY} L${R + DX} ${DY} Z`} fill="url(#lg-k-side)" />
      {/* 윗면 */}
      <path d={`M${L} ${T} L${R} ${T} L${R + DX} ${T + DY} L${L + DX} ${T + DY} Z`} fill="url(#lg-k-top)" />
      {/* 윗면 날개 이음새와 테이프 */}
      <path d={`M-26 ${T} L26 ${T} L${26 + DX} ${T + DY} L${-26 + DX} ${T + DY} Z`} fill="url(#lg-tape)" />
      <path d={`M0 ${T} L${DX} ${T + DY}`} stroke="rgba(90,55,20,0.45)" strokeWidth="2" />
      {/* 앞면 */}
      <rect x={L} y={T} width={BW} height={BH} fill="url(#lg-k-front)" />
      <rect x={L} y={T} width={BW} height={BH} fill="url(#lg-k-ao)" />
      {/* 앞면 테이프 */}
      <rect x="-26" y={T} width="52" height="58" fill="url(#lg-tape)" />
      <rect x="-26" y={T + 56} width="52" height="3" fill="rgba(90,55,20,0.25)" />
      <rect x="-14" y={T + 4} width="5" height="50" fill="rgba(255,255,255,0.35)" />
      {/* 모서리 빛과 그늘 */}
      <path d={`M${L} ${T + 1} H${R}`} stroke="rgba(255,236,200,0.75)" strokeWidth="2.5" />
      <path d={`M${R} ${T} V0`} stroke="rgba(60,35,10,0.35)" strokeWidth="2" />
      <path d={`M${L + 1} ${T} V0`} stroke="rgba(255,236,200,0.3)" strokeWidth="2" />
      {/* 위 방향 표시(인쇄) */}
      <g fill="none" stroke="rgba(70,40,15,0.55)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d={`M${L + 34} ${T + 70} V${T + 34} M${L + 22} ${T + 46} L${L + 34} ${T + 34} L${L + 46} ${T + 46}`} />
        <path d={`M${L + 62} ${T + 70} V${T + 34} M${L + 50} ${T + 46} L${L + 62} ${T + 34} L${L + 74} ${T + 46}`} />
        <path d={`M${L + 18} ${T + 80} H${L + 78}`} />
      </g>
    </g>
  );
}

/** 송장 바코드 막대(x, 폭) */
const BARS = [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2].reduce<[number, number][]>((acc, w) => {
  const prev = acc[acc.length - 1];
  acc.push([prev ? prev[0] + prev[1] + 1.9 : -54, w * 1.6]);
  return acc;
}, []);

/** 송장 스티커. 상자 앞면 가운데, 테이프 아래 */
function ShippingLabel() {
  const top = -BH + 70;
  return (
    <g>
      <rect x="-68" y={top + 3} width="140" height="104" rx="3" fill="rgba(60,35,10,0.25)" />
      <rect x="-70" y={top} width="140" height="104" rx="3" fill="url(#lg-paper)" />
      <rect x="-70" y={top} width="140" height="18" rx="3" fill={C.black} />
      <rect x="-60" y={top + 6} width="44" height="6" fill={C.yellow} />
      <rect x="34" y={top + 4} width="28" height="10" fill="#fff" />
      <rect x="-58" y={top + 26} width="70" height="6" fill="#3a3a3a" />
      <rect x="-58" y={top + 37} width="96" height="5" fill="#9a9a9a" />
      <rect x="-58" y={top + 47} width="82" height="5" fill="#9a9a9a" />
      <rect x="34" y={top + 24} width="26" height="28" fill="none" stroke={C.black} strokeWidth="4" />
      {BARS.map(([x, w]) => (
        <rect key={x} x={x} y={top + 62} width={w} height="30" fill={C.black} />
      ))}
    </g>
  );
}

function PosterDefs() {
  return (
    <defs>
      <linearGradient id="lg-k-front" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#d4a066" />
        <stop offset="0.55" stopColor="#bf8b50" />
        <stop offset="1" stopColor="#a5713d" />
      </linearGradient>
      <linearGradient id="lg-k-ao" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.7" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.2" />
      </linearGradient>
      <linearGradient id="lg-k-top" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#e2b77c" />
        <stop offset="1" stopColor="#cfa067" />
      </linearGradient>
      <linearGradient id="lg-k-side" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#94622f" />
        <stop offset="1" stopColor="#6f4721" />
      </linearGradient>
      <linearGradient id="lg-tape" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#c9a46c" stopOpacity="0.9" />
        <stop offset="0.35" stopColor="#f1d9a8" stopOpacity="0.95" />
        <stop offset="0.5" stopColor="#fff2d4" stopOpacity="0.95" />
        <stop offset="1" stopColor="#caa36a" stopOpacity="0.9" />
      </linearGradient>
      <linearGradient id="lg-paper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#e9e7e1" />
      </linearGradient>
      <linearGradient id="lg-rubber" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#151515" />
        <stop offset="1" stopColor="#2e2e2e" />
      </linearGradient>
      <pattern id="lg-ribs" width={RIB} height="68" patternUnits="userSpaceOnUse" patternTransform="skewX(-58)">
        <rect x="0" y="0" width="5" height="68" fill="#3d3d3d" />
        <rect x="5" y="0" width="2" height="68" fill="#0c0c0c" />
      </pattern>
      <linearGradient id="lg-rail" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a3a3a" />
        <stop offset="0.5" stopColor="#1e1e1e" />
        <stop offset="1" stopColor="#0f0f0f" />
      </linearGradient>
      <pattern id="lg-hazard" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="14" height="28" fill={C.yellow} />
        <rect x="14" width="14" height="28" fill="#111" />
      </pattern>
      <radialGradient id="lg-bolt" cx="0.35" cy="0.35" r="0.7">
        <stop offset="0" stopColor="#bdbdbd" />
        <stop offset="1" stopColor="#3a3a3a" />
      </radialGradient>
      <linearGradient id="lg-post" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#3b3b3b" />
        <stop offset="0.4" stopColor="#222" />
        <stop offset="1" stopColor="#0e0e0e" />
      </linearGradient>
      <linearGradient id="lg-chrome" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#6d6d6d" />
        <stop offset="0.35" stopColor="#e6e6e6" />
        <stop offset="1" stopColor="#4a4a4a" />
      </linearGradient>
      <linearGradient id="lg-head" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3a3a3a" />
        <stop offset="1" stopColor="#0d0d0d" />
      </linearGradient>
      <radialGradient id="lg-roll" cx="0.38" cy="0.35" r="0.75">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.7" stopColor="#dedbd3" />
        <stop offset="1" stopColor="#a9a59b" />
      </radialGradient>
      <radialGradient id="lg-floor" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#000" stopOpacity="0.28" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

function BoxMark({ size }: { size: number }) {
  return (
    <span className="inline-flex flex-none items-center justify-center rounded-[4px]" style={{ width: size, height: size, background: C.black, color: C.yellow }}>
      <Package size={Math.round(size * 0.68)} strokeWidth={2.4} aria-hidden />
    </span>
  );
}

function SectionTitle({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="flex items-center gap-3 text-[28px] leading-tight md:text-[36px]" style={sfxF}>
      <span aria-hidden className="inline-block h-[0.8em] w-[0.8em] flex-none" style={{ background: `repeating-linear-gradient(45deg, ${C.black} 0 6px, ${C.yellow} 6px 12px)` }} />
      {title}
    </h2>
  );
}

/* ---------- 2. 출고 마감 시계 ---------- */

function CutoffBoard({ reduce }: { reduce: boolean }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const f = requestAnimationFrame(tick);
    const id = window.setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(f);
      window.clearInterval(id);
    };
  }, []);

  const cut = now ? nextCutoff(now) : null;
  const left = cut && now ? Math.max(0, Math.floor((cut.at.getTime() - now.getTime()) / 1000)) : 0;
  const days = Math.floor(left / 86400);
  const hh = Math.floor((left % 86400) / 3600);
  const mm = Math.floor((left % 3600) / 60);
  const ss = left % 60;
  const timer = now ? `${p2(hh)}:${p2(mm)}:${p2(ss)}` : "--:--:--";

  let status = "지금 시각을 불러오는 중";
  if (now && cut) {
    if (cut.today) status = `지금 주문하면 오늘 ${fmtKo(now)} 출고`;
    else if (isWeekday(now)) status = `오늘 출고는 마감됐어요. 지금 주문은 ${fmtKo(cut.at)} 출고`;
    else status = `주말은 출고를 쉬어요. 지금 주문은 ${fmtKo(cut.at)} 출고`;
  }

  // 하루 흐름 막대 위 지금 위치(평일 08~19시 사이일 때만)
  const hourNow = now ? now.getHours() + now.getMinutes() / 60 : -1;
  const showNow = !!now && isWeekday(now) && hourNow >= DAY_FROM && hourNow <= 18;
  const pos = (h: number) => ((h - DAY_FROM) / (DAY_TO - DAY_FROM)) * 100;

  return (
    <div id="lg-cutoff" className="scroll-mt-4 rounded-[10px] p-5 md:p-7" style={{ background: C.black, color: "#fff" }} aria-labelledby="lg-cutoff-title">
      <p id="lg-cutoff-title" className="inline-flex items-center gap-2 text-[16px] font-bold" style={{ color: C.yellow }}>
        <Clock size={18} aria-hidden />
        {cut && !cut.today ? "다음 출고 마감까지" : "오늘 출고 마감까지"}
      </p>
      <p className="mt-2 flex items-baseline gap-3 text-[48px] font-semibold leading-none tracking-[-0.02em] tabular-nums md:text-[72px]" style={{ ...monoF, color: C.yellow }} aria-live="off">
        {days > 0 && <span className="text-[26px] md:text-[34px]">{days}일</span>}
        <span>{timer}</span>
      </p>
      <p className="mt-3 text-[16px] leading-snug" role="status">
        {status}
      </p>

      {/* 하루 흐름 */}
      <div className="relative mt-8 pb-12" aria-label="하루 출고 흐름">
        <div className="relative h-[6px] rounded-full" style={{ background: "#3a3a3a" }}>
          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pos(CUTOFF_H)}%`, background: C.yellow }} />
        </div>
        {DAY_MARKS.map((m) => (
          <div key={m.h} className="absolute top-[-5px] -translate-x-1/2 text-center" style={{ left: `${pos(m.h)}%` }}>
            <span className="mx-auto block h-4 w-4 rounded-full border-[3px]" style={{ borderColor: m.h === CUTOFF_H ? C.yellow : "#8a8a8a", background: C.black }} />
            <span className="mt-2 block whitespace-nowrap text-[13px] leading-tight" style={{ color: m.h === CUTOFF_H ? C.yellow : "#cfcfcf" }}>
              <span className="block" style={monoF}>
                {p2(m.h)}:00
              </span>
              {m.label}
            </span>
          </div>
        ))}
        <span className="absolute right-0 top-[18px] text-[13px]" style={{ color: "#cfcfcf" }}>
          다음 날 도착
        </span>
        {showNow && (
          <motion.span
            className="absolute top-[-30px] -translate-x-1/2"
            style={{ left: `${pos(hourNow)}%` }}
            initial={reduce ? false : { y: -6 }}
            animate={{ y: 0 }}
            transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
          >
            <span className="flex items-center gap-1 whitespace-nowrap rounded-[4px] px-1.5 py-0.5 text-[12px] font-bold" style={{ background: C.yellow, color: C.black }}>
              <Package size={13} aria-hidden />
              지금
            </span>
          </motion.span>
        )}
      </div>
    </div>
  );
}

/* ---------- 서비스 흐름 ---------- */

const SERVICES = [
  { icon: PackageOpen, name: "입고", desc: "택배나 화물로 보내 주시면 수량과 상태를 검수해요." },
  { icon: Forklift, name: "보관", desc: "상품마다 바코드를 붙이고 자리를 정해 둬요." },
  { icon: PackageCheck, name: "출고", desc: "오후 2시까지 들어온 주문은 그날 포장해 보내요." },
  { icon: Undo2, name: "반품", desc: "돌아온 상품은 상태를 보고 재입고하거나 따로 모아 둬요." },
];

function ServiceLine() {
  return (
    <ol className="mt-6 grid overflow-hidden rounded-[10px] border-2 md:grid-cols-4" style={{ borderColor: C.black }}>
      {SERVICES.map((s, k) => {
        const Icon = s.icon;
        return (
          <li key={s.name} className={`relative p-5 md:p-6 ${k > 0 ? "border-t-2 md:border-l-2 md:border-t-0" : ""}`} style={{ borderColor: C.black, background: k === 2 ? C.yellow : C.white }}>
            <p className="flex items-center gap-2 text-[22px]" style={sfxF}>
              <Icon size={24} aria-hidden />
              {s.name}
            </p>
            <p className="mt-2 text-[16px] leading-[1.6]" style={{ wordBreak: "keep-all" }}>
              {s.desc}
            </p>
            {k < SERVICES.length - 1 && (
              <span
                aria-hidden
                className="absolute bottom-[-15px] left-1/2 z-[1] flex h-7 w-7 -translate-x-1/2 rotate-90 items-center justify-center rounded-full md:bottom-auto md:left-auto md:right-[-15px] md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:rotate-0"
                style={{ background: C.black, color: C.yellow }}
              >
                <ChevronRight size={18} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- 1. 견적 계산 ---------- */

function Quote({ reduce, onApply }: { reduce: boolean; onApply: (v: { orders: number; pallets: number; size: ParcelSize }) => void }) {
  const [orders, setOrders] = useState(1500);
  const [pallets, setPallets] = useState(6);
  const [size, setSize] = useState<ParcelSize>("극소");

  const storage = pallets * PALLET_FEE;
  const work = orders * workFee(orders);
  const parcel = orders * PARCEL[size].fee;
  const total = storage + work + parcel;
  const per = orders ? total / orders : 0;
  const parts = [
    { key: "보관비", v: storage, bg: C.black, pattern: "" },
    { key: "출고 작업비", v: work, bg: C.kraft, pattern: "repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 8px)" },
    { key: "택배비", v: parcel, bg: C.yellow, pattern: "repeating-linear-gradient(45deg, rgba(0,0,0,0.16) 0 2px, transparent 2px 9px)" },
  ];
  const t = { duration: reduce ? 0 : DUR, ease: EASE };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      <div className="rounded-[10px] border-2 p-5 md:p-7" style={{ borderColor: C.black, background: C.white }}>
        <RangeField
          id="lg-q-orders"
          label="월 출고 건수"
          value={orders}
          min={100}
          max={20000}
          step={100}
          unit="건"
          onChange={setOrders}
        />
        <RangeField id="lg-q-pallets" label="보관 팔레트 수" value={pallets} min={1} max={60} step={1} unit="개" onChange={setPallets} />
        <fieldset className="mt-7">
          <legend className="text-[16px] font-bold">택배 크기</legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(Object.keys(PARCEL) as ParcelSize[]).map((k) => {
              const on = size === k;
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSize(k)}
                  className={`rounded-[6px] border-2 px-2 py-2.5 text-left ${focusRing}`}
                  style={{ borderColor: C.black, background: on ? C.black : C.white, color: on ? C.yellow : C.ink, outlineColor: C.black }}
                >
                  <span className="flex items-center gap-1 text-[16px] font-bold">
                    {on && <Check size={16} aria-hidden />}
                    {k}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-tight opacity-80">{PARCEL[k].spec}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* 결과: 송장처럼 */}
      <div className="flex flex-col rounded-[10px] border-2 p-5 md:p-7" style={{ borderColor: C.black, background: C.white }} aria-live="polite">
        <p className="flex items-center justify-between gap-3 text-[15px] font-bold">
          <span>월 예상 비용</span>
          <span className="rounded-[3px] px-2 py-0.5 text-[12px]" style={{ background: C.black, color: C.yellow }}>
            개략, 부가세 별도
          </span>
        </p>
        <p className="mt-2 text-[44px] font-semibold leading-none tracking-[-0.03em] tabular-nums md:text-[56px]" style={monoF}>
          {won(total)}
        </p>
        <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
          주문 1건당 평균 <b style={{ ...monoF, color: C.ink }}>{won(per)}</b>
        </p>

        {/* 쌓인 막대: 겹친 띠를 누적 비율만큼 가로로 늘린다 */}
        <div className="relative mt-6 h-9 overflow-hidden rounded-[4px] border-2" style={{ borderColor: C.black }} aria-hidden>
          {[...parts].reverse().map((part, k) => {
            const upto = parts.slice(0, parts.length - k).reduce((a, b) => a + b.v, 0);
            return (
              <motion.div
                key={part.key}
                className="absolute inset-0 origin-left"
                style={{ background: part.pattern ? `${part.pattern}, ${part.bg}` : part.bg }}
                initial={false}
                animate={{ scaleX: total ? upto / total : 0 }}
                transition={t}
              />
            );
          })}
        </div>

        <dl className="mt-5 grid gap-2.5 text-[16px]">
          {parts.map((part) => (
            <div key={part.key} className="flex items-center justify-between gap-3 border-b border-dashed pb-2.5" style={{ borderColor: C.line }}>
              <dt className="inline-flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 flex-none rounded-[2px] border" style={{ borderColor: C.black, background: part.pattern ? `${part.pattern}, ${part.bg}` : part.bg }} aria-hidden />
                {part.key}
                <span className="text-[13px]" style={{ color: C.muted }}>
                  {part.key === "보관비" && `${pallets}개 x ${won(PALLET_FEE)}`}
                  {part.key === "출고 작업비" && `${num(orders)}건 x ${won(workFee(orders))}`}
                  {part.key === "택배비" && `${num(orders)}건 x ${won(PARCEL[size].fee)}`}
                </span>
              </dt>
              <dd className="tabular-nums" style={monoF}>
                {won(part.v)}
              </dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          data-gtm-cta="logistics_quote_to_contact"
          onClick={() => onApply({ orders, pallets, size })}
          className={`mt-6 inline-flex items-center justify-center gap-2 rounded-[6px] px-5 py-3.5 text-[16px] font-bold ${focusRing}`}
          style={{ background: C.yellow, color: C.black, outlineColor: C.black, boxShadow: `inset 0 0 0 2px ${C.black}` }}
        >
          이 조건으로 상담 신청
          <ChevronRight size={18} aria-hidden />
        </button>
      </div>

      {/* 요금 기준 */}
      <div className="overflow-x-auto lg:col-span-2">
        <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
          <caption className="pb-3 text-left text-[17px] font-bold">요금 기준</caption>
          <thead>
            <tr style={{ background: C.black, color: "#fff" }}>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                항목
              </th>
              <th scope="col" className="px-4 py-2.5 font-semibold">
                기준
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-semibold">
                요금
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["보관비", "상온 팔레트 1개(1,100 x 1,100mm, 높이 1.5m), 월", won(PALLET_FEE)],
              ["입고비", "박스 1개 검수와 적치", won(300)],
              ...WORK_TIERS.map((w) => ["출고 작업비", `${w.label}, 피킹과 포장 1건`, won(w.fee)]),
              ["합포장", "상품 1개 추가될 때마다", won(200)],
              ...(Object.keys(PARCEL) as ParcelSize[]).map((k) => [`택배비 ${k}`, PARCEL[k].spec, won(PARCEL[k].fee)]),
              ["포장재", "박스, 완충재, 테이프", "실비"],
            ].map(([a, b, c], k) => (
              <tr key={k} className="border-b" style={{ borderColor: C.line, background: k % 2 ? C.paper : C.white }}>
                <th scope="row" className="whitespace-nowrap px-4 py-2.5 font-semibold">
                  {a}
                </th>
                <td className="px-4 py-2.5">{b}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums" style={monoF}>
                  {c}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RangeField({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mt-6 first:mt-0">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[16px] font-bold">
          {label}
        </label>
        <span className="text-[26px] font-semibold tabular-nums" style={monoF}>
          {num(value)}
          <span className="ml-1 text-[15px]">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${num(value)}${unit}`}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-2 h-8 w-full cursor-pointer ${focusRing}`}
        style={{ accentColor: C.black, outlineColor: C.black }}
      />
      <div className="flex justify-between text-[13px]" style={{ color: C.muted }}>
        <span>
          {num(min)}
          {unit}
        </span>
        <span>
          {num(max)}
          {unit}
        </span>
      </div>
    </div>
  );
}

/* ---------- 3. 물류센터 지도 ---------- */

function CenterMap({ reduce }: { reduce: boolean }) {
  const [sel, setSel] = useState<CenterId>("c1");
  const c = CENTERS[sel];
  // 고른 센터가 지도 가운데쯤 오도록 지도 전체를 옮긴다
  const [cx, cy] = c.at;
  const cam = { x: 320 - cx * 1.25, y: 190 - cy * 1.25, scale: 1.25 };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-10">
      <div className="relative overflow-hidden rounded-[10px] border-2" style={{ borderColor: C.black, background: "#efece3" }}>
        <svg viewBox="0 0 640 420" className="block h-auto w-full" role="img" aria-label={`${c.name} 위치를 보여 주는 그린 지도`}>
          <defs>
            <pattern id="lg-map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0 H0 V32" fill="none" stroke="#e0dccf" strokeWidth="1" />
            </pattern>
          </defs>
          <motion.g initial={false} animate={cam} transition={{ duration: reduce ? 0 : 0.8, ease: EASE }} style={{ transformOrigin: "0 0" }}>
            <rect x="-400" y="-300" width="1440" height="1020" fill="url(#lg-map-grid)" />
            {/* 논밭과 산 */}
            <path d="M-200 40 C40 10 110 90 60 160 C20 220 -80 230 -200 210 Z" fill="#d9dfc6" />
            <path d="M560 -60 C700 -40 760 80 700 140 C640 190 560 120 540 60 Z" fill="#d9dfc6" />
            <path d="M120 300 h120 v70 h-120 Z M260 320 h90 v60 h-90 Z" fill="#e4e6cf" />
            {/* 하천 */}
            <path d="M-200 340 C40 300 160 400 320 370 C480 340 560 420 840 380" fill="none" stroke="#bcd3dc" strokeWidth="22" strokeLinecap="round" />
            {/* 지방도 */}
            <g fill="none" strokeLinecap="round">
              <path d="M372 168 L372 -100 M372 168 L478 300 L478 520 M478 300 L760 300" stroke="#b9b4a5" strokeWidth="13" />
              <path d="M372 168 L372 -100 M372 168 L478 300 L478 520 M478 300 L760 300" stroke="#fff" strokeWidth="8" />
            </g>
            {/* 고속도로 */}
            <g fill="none" strokeLinecap="round">
              <path d="M-200 110 C120 120 260 90 420 110 C560 128 680 160 860 150" stroke={C.black} strokeWidth="20" />
              <path d="M-200 110 C120 120 260 90 420 110 C560 128 680 160 860 150" stroke={C.yellow} strokeWidth="12" />
            </g>
            <g>
              <rect x="336" y="74" width="72" height="26" rx="4" fill={C.black} />
              <text x="372" y="92" textAnchor="middle" fontSize="14" fontWeight="700" fill={C.yellow}>
                ㅇㅊ IC
              </text>
            </g>
            {/* 센터 표시 */}
            {(Object.keys(CENTERS) as CenterId[]).map((id) => {
              const [x, y] = CENTERS[id].at;
              const on = id === sel;
              return (
                <g key={id} transform={`translate(${x} ${y})`}>
                  <ellipse cx="0" cy="4" rx="16" ry="5" fill="rgba(0,0,0,0.25)" />
                  <path d="M0 0 C-14 -16 -20 -26 -20 -36 A20 20 0 1 1 20 -36 C20 -26 14 -16 0 0 Z" fill={on ? C.black : "#fff"} stroke={C.black} strokeWidth="3" />
                  <text x="0" y="-30" textAnchor="middle" fontSize="17" fontWeight="800" fill={on ? C.yellow : C.black}>
                    {id === "c1" ? "1" : "2"}
                  </text>
                </g>
              );
            })}
          </motion.g>
        </svg>
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2" role="group" aria-label="센터 고르기">
          {(Object.keys(CENTERS) as CenterId[]).map((id) => {
            const on = id === sel;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setSel(id)}
                className={`rounded-[6px] border-2 px-3 py-1.5 text-[14px] font-bold md:text-[15px] ${focusRing}`}
                style={{ borderColor: C.black, background: on ? C.black : C.white, color: on ? C.yellow : C.ink, outlineColor: C.black }}
              >
                {id === "c1" ? "1센터" : "2센터"} {CENTERS[id].kind}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={sel}
            initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 0 100%)" }}
            transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
          >
            <p className="flex items-center gap-2 text-[26px]" style={sfxF}>
              <c.icon size={26} aria-hidden />
              {c.name}
              <span className="rounded-[4px] px-2 py-0.5 text-[15px]" style={{ background: C.yellow, color: C.black, fontFamily: "inherit" }}>
                {c.kind}
              </span>
            </p>
            <dl className="mt-5 grid gap-x-5 gap-y-3 text-[16px] sm:grid-cols-[auto_1fr]">
              {c.rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="font-bold">{k}</dt>
                  <dd className="-mt-2 sm:mt-0" style={{ wordBreak: "keep-all" }}>
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </AnimatePresence>
        <p className="mt-6 flex items-start gap-2 rounded-[8px] p-4 text-[15px] leading-[1.6]" style={{ background: C.paperDeep }}>
          <Truck size={18} className="mt-0.5 flex-none" aria-hidden />
          택배사 집하는 평일 오후 5시예요. 센터 견학은 상담 때 날짜를 잡아 드려요.
        </p>
      </div>
    </div>
  );
}

/* ---------- 4. 도입 상담 신청 ---------- */

const CHANNELS = ["스마트스토어", "쿠팡", "자사몰", "오픈마켓 기타"];
const GOODS = ["의류, 잡화", "화장품", "식품(상온)", "식품(냉장, 냉동)", "생활용품", "기타"];
const STARTS = ["바로", "1개월 안", "2~3개월 안", "아직 미정"];

type Done = { no: string; shop: string; name: string; phone: string; reply: Date };

function Contact({ prefill, today, reduce }: { prefill: Prefill; today: Date; reduce: boolean }) {
  const [shop, setShop] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [channels, setChannels] = useState<string[]>([]);
  const [goods, setGoods] = useState(GOODS[0]);
  const [orders, setOrders] = useState(prefill ? String(prefill.orders) : "");
  const [start, setStart] = useState(STARTS[1]);
  const [memo, setMemo] = useState(prefill ? `보관 팔레트 ${prefill.pallets}개, 택배 ${prefill.size} 크기 기준 견적 계산을 봤어요.` : "");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Done | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!shop.trim()) next.shop = "쇼핑몰 이름을 적어 주세요.";
    if (!name.trim()) next.name = "담당자 이름을 적어 주세요.";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) next.phone = "휴대폰 번호를 숫자 10~11자리로 적어 주세요.";
    if (!channels.length) next.channels = "판매 채널을 하나 이상 골라 주세요.";
    if (!agree) next.agree = "개인정보 수집에 동의해 주세요.";
    setErr(next);
    if (Object.keys(next).length) {
      document.getElementById(`lg-f-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    const seq = (Number(digits.slice(-3)) % 900) + 100;
    setDone({ no: `LG-${fmtDash(today).replace(/-/g, "")}-${seq}`, shop: shop.trim(), name: name.trim(), phone: digits, reply: nextBizDay(today) });
  };

  const reset = () => {
    setDone(null);
    setShop("");
    setName("");
    setPhone("");
    setChannels([]);
    setMemo("");
    setAgree(false);
  };

  const input = `mt-1.5 w-full rounded-[6px] border-2 bg-white px-3 py-2.5 text-[16px] ${focusRing}`;
  const label = "block text-[15px] font-bold";
  const errText = (k: string) =>
    err[k] ? (
      <p id={`lg-e-${k}`} className="mt-1 text-[14px] font-semibold" style={{ color: C.error }}>
        {err[k]}
      </p>
    ) : null;

  return (
    <div className="mt-6 overflow-hidden rounded-[10px] border-2" style={{ borderColor: C.black, background: C.white }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            className="grid gap-6 p-5 md:grid-cols-[auto_1fr] md:items-start md:p-8"
            initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.yellow, color: C.black }}>
              <Check size={34} strokeWidth={3} aria-hidden />
            </span>
            <div>
              <p className="text-[26px]" style={sfxF} role="status">
                상담 신청이 접수됐어요
              </p>
              <dl className="mt-5 grid gap-x-6 gap-y-2.5 text-[16px] sm:grid-cols-[auto_1fr]">
                <dt className="font-bold">접수 번호</dt>
                <dd style={monoF}>{done.no}</dd>
                <dt className="font-bold">쇼핑몰</dt>
                <dd>{done.shop}</dd>
                <dt className="font-bold">담당자</dt>
                <dd>
                  {maskName(done.name)} / {maskPhone(done.phone)}
                </dd>
                <dt className="font-bold">담당 창구</dt>
                <dd>
                  영업팀 전화 <span style={monoF}>{TEL}</span>, {KAKAO}
                </dd>
                <dt className="font-bold">회신 예정일</dt>
                <dd>{fmtKo(done.reply)} 오전 중 전화</dd>
              </dl>
              <button
                type="button"
                onClick={reset}
                className={`mt-6 inline-flex items-center gap-2 rounded-[6px] border-2 px-4 py-2 text-[15px] font-bold ${focusRing}`}
                style={{ borderColor: C.black, outlineColor: C.black }}
              >
                <RotateCcw size={16} aria-hidden />
                새로 작성
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate className="grid gap-5 p-5 md:grid-cols-2 md:gap-x-8 md:p-8" initial={false} exit={reduce ? { opacity: 0 } : { opacity: 0, transition: { duration: 0.15 } }}>
            <div>
              <label htmlFor="lg-f-shop" className={label}>
                쇼핑몰 이름
              </label>
              <input id="lg-f-shop" value={shop} onChange={(e) => setShop(e.target.value)} className={input} style={{ borderColor: err.shop ? C.error : C.black, outlineColor: C.black }} aria-invalid={!!err.shop} aria-describedby={err.shop ? "lg-e-shop" : undefined} autoComplete="organization" />
              {errText("shop")}
            </div>
            <div>
              <label htmlFor="lg-f-name" className={label}>
                담당자 이름
              </label>
              <input id="lg-f-name" value={name} onChange={(e) => setName(e.target.value)} className={input} style={{ borderColor: err.name ? C.error : C.black, outlineColor: C.black }} aria-invalid={!!err.name} aria-describedby={err.name ? "lg-e-name" : undefined} autoComplete="name" />
              {errText("name")}
            </div>
            <div>
              <label htmlFor="lg-f-phone" className={label}>
                휴대폰
              </label>
              <input id="lg-f-phone" type="tel" inputMode="numeric" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} style={{ borderColor: err.phone ? C.error : C.black, outlineColor: C.black }} aria-invalid={!!err.phone} aria-describedby={err.phone ? "lg-e-phone" : undefined} autoComplete="tel" />
              {errText("phone")}
            </div>
            <div>
              <label htmlFor="lg-f-orders" className={label}>
                월 출고 건수
              </label>
              <input id="lg-f-orders" inputMode="numeric" placeholder="예: 1500" value={orders} onChange={(e) => setOrders(e.target.value.replace(/\D/g, ""))} className={input} style={{ borderColor: C.black, outlineColor: C.black }} />
            </div>
            <fieldset className="md:col-span-2">
              <legend className={label}>판매 채널</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {CHANNELS.map((ch, k) => {
                  const on = channels.includes(ch);
                  return (
                    <button
                      key={ch}
                      id={k === 0 ? "lg-f-channels" : undefined}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setChannels((cs) => (on ? cs.filter((x) => x !== ch) : [...cs, ch]))}
                      className={`inline-flex items-center gap-1.5 rounded-[6px] border-2 px-3.5 py-2 text-[15px] font-semibold ${focusRing}`}
                      style={{ borderColor: err.channels ? C.error : C.black, background: on ? C.black : C.white, color: on ? C.yellow : C.ink, outlineColor: C.black }}
                    >
                      {on && <Check size={15} aria-hidden />}
                      {ch}
                    </button>
                  );
                })}
              </div>
              {errText("channels")}
            </fieldset>
            <div>
              <label htmlFor="lg-f-goods" className={label}>
                상품 종류
              </label>
              <select id="lg-f-goods" value={goods} onChange={(e) => setGoods(e.target.value)} className={input} style={{ borderColor: C.black, outlineColor: C.black }}>
                {GOODS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lg-f-start" className={label}>
                시작 희망 시기
              </label>
              <select id="lg-f-start" value={start} onChange={(e) => setStart(e.target.value)} className={input} style={{ borderColor: C.black, outlineColor: C.black }}>
                {STARTS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="lg-f-memo" className={label}>
                문의 내용 <span className="font-normal" style={{ color: C.muted }}>(선택)</span>
              </label>
              <textarea id="lg-f-memo" rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} className={`${input} resize-y`} style={{ borderColor: C.black, outlineColor: C.black }} />
            </div>
            <div className="flex flex-col gap-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-[15px]">
                  <input id="lg-f-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`h-5 w-5 ${focusRing}`} style={{ accentColor: C.black, outlineColor: C.black }} aria-describedby={err.agree ? "lg-e-agree" : undefined} />
                  개인정보 수집, 이용 동의(상담 회신용, 1년 보관)
                </label>
                {errText("agree")}
              </div>
              <button
                type="submit"
                data-gtm-cta="logistics_submit"
                className={`inline-flex items-center justify-center gap-2 rounded-[6px] px-6 py-3.5 text-[16px] font-bold text-white ${focusRing}`}
                style={{ background: C.black, outlineColor: C.black }}
              >
                <MessageCircle size={18} aria-hidden />
                상담 신청
              </button>
            </div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] md:col-span-2" style={{ color: C.muted }}>
              <span className="inline-flex items-center gap-1.5">
                <Phone size={15} aria-hidden />
                대표전화 <span style={monoF}>{TEL}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} aria-hidden />
                {ADDRESS}
              </span>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
