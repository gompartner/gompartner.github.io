"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
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
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 물류 대행(3PL) 회사 홈페이지 샘플: 가상의 물류 회사 곰파트너. 온라인 쇼핑몰 상품을 맡아 보관하고, 주문이 들어오면 포장해 택배로 보낸다.
   상호, 주소, 전화번호, 손님 이름은 모두 가상이다.

   국내 풀필먼트, 3PL 사이트 공통 구성(참고): 메뉴는 서비스 소개, 이용 요금, 물류센터, 입점 절차, 견적 문의.
   첫 화면에 "오후 2시 주문까지 당일 출고", "스마트스토어, 쿠팡, 카페24 주문 자동 연동"을 크게 두고 견적 문의 버튼을 붙인다.
   요금은 보관비(팔레트당 월), 입고비, 출고 작업비(건당, 물량 구간별), 택배비(크기별), 합포장 추가 요금으로 나눠 표로 공개하고,
   "부가세 별도", "포장재 실비"를 적는다. 상온 팔레트 월 25,000~40,000원, 출고 작업비 건당 800~1,200원, 극소형 택배 2,000원대가 흔하다.
   고객사 로고, 출고량 같은 실적 숫자는 넣지 않는다.
   첫 화면 사진 출처: AI 생성(Z-Image-Turbo, Apache 2.0)

   핵심 모션: 첫 화면(lg-poster)은 물류센터 통로 사진 한 장이 화면을 채운다. 들어올 때 사진이 1.6초 동안 천천히 다가오고
   (scale 1.06 -> 1), 문장과 정보 줄은 0.3초 늦게 아래에서 올라온다(CSS keyframes, 끝 상태가 기본값이라 JS 없이도 보인다).
   스크롤하면 사진만 조금 느리게 움직인다(y 0 -> 8%). 본문에서는 견적 막대가 금액 비율만큼 늘어나는 것과 센터 지도가 옮겨 가는 것만 남겼다.
   동작 줄이기면 모두 멈춘 완성 상태다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 견적 계산: 월 출고 건수, 보관 팔레트 수, 택배 크기를 고르면 보관비, 출고 작업비, 택배비와 월 합계, 건당 평균이 나온다.
   2. 출고 마감 시계: 지금 시각 기준 오늘 오후 2시 마감까지 남은 시간. 지났거나 주말이면 다음 출고일과 남은 시간을 보여 준다.
   3. 물류센터 안내: 그린 지도에서 1센터(상온), 2센터(냉장, 냉동)를 고르면 지도가 그 센터로 옮겨 가고 입고 시간, 화물차 진입을 바꿔 보여 준다.
   4. 도입 상담 신청: 견적 조건을 이어 받아 쇼핑몰, 담당자, 판매 채널, 상품 종류를 받는다. 완료 화면에 접수 번호, 담당 창구, 회신 예정일. */

const IMG = "/images/demo-logistics";

const ADDRESS = "경기 ㅇㅊ시 ㅇㅇ면 ㅇㅇ로 00";
const TEL = "031-000-0000";
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
  /** 강조색 하나. 노란 안전색을 낮춘 짙은 황토 */
  accent: "#7a5a10",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 첫 화면 사진이 다가오는 시간 */
const HERO_IN = 1.6;
/** 막대, 지도, 패널 전환 */
const DUR = 0.45;

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
        <p>
          <SampleLogo />
        </p>
        <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center">
          {[
            ["lg-service", "서비스"],
            ["lg-quote", "이용 요금"],
            ["lg-center", "물류센터"],
            ["lg-contact", "도입 상담"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.accent }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* 하는 일과 오늘 출고 마감 */}
      <section aria-labelledby="lg-hero-title" className="mx-auto grid max-w-[1200px] gap-8 px-4 pt-4 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12 lg:pt-10">
        <div>
          <h2 id="lg-hero-title" className="text-[32px] font-bold leading-[1.25] tracking-[-0.02em] md:text-[44px]" style={{ wordBreak: "keep-all" }}>
            쇼핑몰 상품 보관, 포장,
            <br />
            택배 출고 대행
          </h2>
          <ul className="mt-6 flex flex-wrap gap-2 text-[15px]" aria-label="주문 자동 연동 채널">
            {["스마트스토어", "쿠팡", "카페24", "자사몰"].map((c) => (
              <li key={c} className="rounded-[4px] border px-3 py-1 font-medium" style={{ borderColor: C.field }}>
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
              className={`inline-flex items-center gap-2 rounded-[6px] border bg-white px-5 py-3 text-[16px] font-semibold ${focusRing}`}
              style={{ borderColor: C.field, color: C.ink, outlineColor: C.accent }}
            >
              <Calculator size={18} aria-hidden />
              견적 계산
            </button>
            <button
              type="button"
              data-gtm-cta="logistics_header_cta"
              onClick={() => go("lg-contact")}
              className={`inline-flex items-center gap-2 rounded-[6px] px-5 py-3 text-[16px] font-semibold text-white ${focusRing}`}
              style={{ background: C.accent, outlineColor: C.accent }}
            >
              <MessageCircle size={18} aria-hidden />
              도입 상담
            </button>
          </div>
        </div>
        <CutoffBoard />
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

      <footer className="mt-20 px-4 pb-10 pt-10 text-[14px] leading-[1.8] md:px-6" style={{ background: C.soft, color: C.muted }}>
        <div className="mx-auto max-w-[1200px]">
          <p>
            <SampleLogo size={18} />
          </p>
          <p className="mt-3">
            {ADDRESS} / 대표전화 <span className="tabular-nums">{TEL}</span> / {KAKAO}
          </p>
          <p>평일 09:00 ~ 18:00, 출고 마감 오후 2시, 토요일, 일요일, 공휴일 휴무</p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

/* ---------- 첫 화면 ---------- */

/** 문장 등장. 끝 상태가 기본값이라 JS 가 없어도 보인다 */
const RISE_CSS = `@keyframes lg-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.lg-rise{animation:lg-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both}
@media (prefers-reduced-motion: reduce){.lg-rise{animation:none}}`;

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  return (
    <section id="lg-poster" ref={ref} aria-labelledby="lg-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: "#141414", color: "#fff" }}>
      <style>{RISE_CSS}</style>
      <motion.div className="absolute inset-0" style={{ y: photoY }}>
        <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : HERO_IN, ease: EASE }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="물류센터 랙 사이 통로에서 직원 두 명이 상자를 들고 걸어오는 모습"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 45%" }}
          />
        </motion.div>
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0) 22%), linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1))" }}
      />

      {/* 로고와 핵심 행동 하나 */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 pt-4 md:px-12 md:pt-7">
        <p>
          <SampleLogo light size={18} />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta="logistics_poster_cta"
          className={`inline-flex h-11 flex-none items-center rounded-[6px] bg-white px-4 text-[15px] font-semibold ${focusRing}`}
          style={{ color: C.ink, outlineColor: "#fff" }}
        >
          견적 계산
        </button>
      </div>

      {/* 문장 */}
      <div className={`relative z-[1] mt-auto max-w-[1200px] px-4 pb-[10svh] md:px-12 ${reduce ? "" : "lg-rise"}`}>
        <h1
          id="lg-poster-title"
          className="text-[36px] font-bold md:text-[clamp(40px,5vw,72px)]"
          style={{ letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}
        >
          오후 2시 전 주문은
          <br />
          오늘 나가요
        </h1>
        <p className="mt-4 text-[16px] md:mt-5 md:text-[18px]" style={{ color: "rgba(255,255,255,0.85)" }}>
          경기 ㅇㅊ 물류센터, 평일 출고
        </p>
      </div>
    </section>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  const mark = size + 8;
  return (
    <span className="inline-flex items-center gap-2 leading-none" style={{ color: light ? "#fff" : "#111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={mark} height={mark} className="shrink-0" style={{ width: mark, height: mark }} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          곰파트너
        </span>
        <span className="text-[12px] font-semibold opacity-75">물류 샘플</span>
      </span>
    </span>
  );
}

function SectionTitle({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="text-[28px] font-bold leading-tight tracking-[-0.02em] md:text-[36px]">
      {title}
    </h2>
  );
}

/* ---------- 2. 출고 마감 시계 ---------- */

function CutoffBoard() {
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
    <div id="lg-cutoff" className="scroll-mt-4 rounded-[8px] border p-5 md:p-7" style={{ background: C.soft, borderColor: C.line, color: C.ink }} aria-labelledby="lg-cutoff-title">
      <p id="lg-cutoff-title" className="inline-flex items-center gap-2 text-[16px] font-bold" style={{ color: C.body }}>
        <Clock size={18} aria-hidden />
        {cut && !cut.today ? "다음 출고 마감까지" : "오늘 출고 마감까지"}
      </p>
      <p className="mt-2 flex items-baseline gap-3 text-[48px] font-semibold leading-none tracking-[-0.02em] tabular-nums md:text-[72px]" style={{ color: C.accent }} aria-live="off">
        {days > 0 && <span className="text-[26px] md:text-[34px]">{days}일</span>}
        <span>{timer}</span>
      </p>
      <p className="mt-3 text-[16px] leading-snug" role="status">
        {status}
      </p>

      {/* 하루 흐름 */}
      <div className="relative mt-8 pb-12" aria-label="하루 출고 흐름">
        <div className="relative h-[6px] rounded-full" style={{ background: "#dcdcda" }}>
          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pos(CUTOFF_H)}%`, background: C.accent }} />
        </div>
        {DAY_MARKS.map((m) => (
          <div key={m.h} className="absolute top-[-5px] -translate-x-1/2 text-center" style={{ left: `${pos(m.h)}%` }}>
            <span className="mx-auto block h-4 w-4 rounded-full border-[3px]" style={{ borderColor: m.h === CUTOFF_H ? C.accent : "#9a9a9a", background: C.soft }} />
            <span className="mt-2 block whitespace-nowrap text-[13px] leading-tight" style={{ color: m.h === CUTOFF_H ? C.accent : C.muted }}>
              <span className="block tabular-nums">
                {p2(m.h)}:00
              </span>
              {m.label}
            </span>
          </div>
        ))}
        <span className="absolute right-0 top-[18px] text-[13px]" style={{ color: C.muted }}>
          다음 날 도착
        </span>
        {showNow && (
          <span className="absolute top-[-30px] -translate-x-1/2" style={{ left: `${pos(hourNow)}%` }}>
            <span className="flex items-center gap-1 whitespace-nowrap rounded-[4px] px-1.5 py-0.5 text-[12px] font-bold text-white" style={{ background: C.ink }}>
              <Package size={13} aria-hidden />
              지금
            </span>
          </span>
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
    <ol className="mt-6 grid rounded-[8px] border md:grid-cols-4" style={{ borderColor: C.line }}>
      {SERVICES.map((s, k) => {
        const Icon = s.icon;
        return (
          <li key={s.name} className={`relative p-5 md:p-6 ${k > 0 ? "border-t md:border-l md:border-t-0" : ""}`} style={{ borderColor: C.line, background: k === 2 ? C.soft : C.paper }}>
            <p className="flex items-center gap-2 text-[20px] font-bold">
              <Icon size={22} aria-hidden style={{ color: C.accent }} />
              {s.name}
            </p>
            <p className="mt-2 text-[16px] leading-[1.6]" style={{ wordBreak: "keep-all", color: C.body }}>
              {s.desc}
            </p>
            {k < SERVICES.length - 1 && (
              <span
                aria-hidden
                className="absolute bottom-[-15px] left-1/2 z-[1] flex h-7 w-7 -translate-x-1/2 rotate-90 items-center justify-center rounded-full md:bottom-auto md:left-auto md:right-[-15px] md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:rotate-0"
                style={{ background: C.paper, color: C.ink, border: `1px solid ${C.line}` }}
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
    { key: "보관비", v: storage, bg: "#3a3a3a", pattern: "" },
    { key: "출고 작업비", v: work, bg: "#a8a8a6", pattern: "repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 8px)" },
    { key: "택배비", v: parcel, bg: C.accent, pattern: "repeating-linear-gradient(45deg, rgba(255,255,255,0.22) 0 2px, transparent 2px 9px)" },
  ];
  const t = { duration: reduce ? 0 : DUR, ease: EASE };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      <div className="rounded-[8px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.paper }}>
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
                  className={`rounded-[6px] border px-2 py-2.5 text-left ${focusRing}`}
                  style={{ borderColor: on ? C.accent : C.field, background: on ? C.accent : C.paper, color: on ? "#fff" : C.ink, outlineColor: C.accent }}
                >
                  <span className="flex items-center gap-1 text-[16px] font-semibold">
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
      <div className="flex flex-col rounded-[8px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.paper }} aria-live="polite">
        <p className="flex items-center justify-between gap-3 text-[15px] font-bold">
          <span>월 예상 비용</span>
          <span className="rounded-[3px] px-2 py-0.5 text-[12px]" style={{ background: C.soft, color: C.body }}>
            개략, 부가세 별도
          </span>
        </p>
        <p className="mt-2 text-[44px] font-semibold leading-none tracking-[-0.03em] tabular-nums md:text-[56px]">
          {won(total)}
        </p>
        <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
          주문 1건당 평균 <b className="tabular-nums" style={{ color: C.ink }}>{won(per)}</b>
        </p>

        {/* 쌓인 막대: 겹친 띠를 누적 비율만큼 가로로 늘린다 */}
        <div className="relative mt-6 h-9 overflow-hidden rounded-[4px]" style={{ background: C.soft }} aria-hidden>
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
                <span className="inline-block h-3.5 w-3.5 flex-none rounded-[2px]" style={{ background: part.pattern ? `${part.pattern}, ${part.bg}` : part.bg }} aria-hidden />
                {part.key}
                <span className="text-[13px]" style={{ color: C.muted }}>
                  {part.key === "보관비" && `${pallets}개 x ${won(PALLET_FEE)}`}
                  {part.key === "출고 작업비" && `${num(orders)}건 x ${won(workFee(orders))}`}
                  {part.key === "택배비" && `${num(orders)}건 x ${won(PARCEL[size].fee)}`}
                </span>
              </dt>
              <dd className="tabular-nums">
                {won(part.v)}
              </dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          data-gtm-cta="logistics_quote_to_contact"
          onClick={() => onApply({ orders, pallets, size })}
          className={`mt-6 inline-flex items-center justify-center gap-2 rounded-[6px] px-5 py-3.5 text-[16px] font-semibold text-white ${focusRing}`}
          style={{ background: C.accent, outlineColor: C.accent }}
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
            <tr className="border-b" style={{ background: C.soft, borderColor: C.field }}>
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
              <tr key={k} className="border-b" style={{ borderColor: C.line, background: C.paper }}>
                <th scope="row" className="whitespace-nowrap px-4 py-2.5 font-semibold">
                  {a}
                </th>
                <td className="px-4 py-2.5">{b}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">
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
        <span className="text-[26px] font-semibold tabular-nums">
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
        style={{ accentColor: C.accent, outlineColor: C.accent }}
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
      <div className="relative overflow-hidden rounded-[8px] border" style={{ borderColor: C.line, background: "#f2f2f0" }}>
        <svg viewBox="0 0 640 420" className="block h-auto w-full" role="img" aria-label={`${c.name} 위치를 보여 주는 그린 지도`}>
          <defs>
            <pattern id="lg-map-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0 H0 V32" fill="none" stroke="#e6e6e4" strokeWidth="1" />
            </pattern>
          </defs>
          <motion.g initial={false} animate={cam} transition={{ duration: reduce ? 0 : 0.8, ease: EASE }} style={{ transformOrigin: "0 0" }}>
            <rect x="-400" y="-300" width="1440" height="1020" fill="url(#lg-map-grid)" />
            {/* 논밭과 산 */}
            <path d="M-200 40 C40 10 110 90 60 160 C20 220 -80 230 -200 210 Z" fill="#dfe3d8" />
            <path d="M560 -60 C700 -40 760 80 700 140 C640 190 560 120 540 60 Z" fill="#dfe3d8" />
            <path d="M120 300 h120 v70 h-120 Z M260 320 h90 v60 h-90 Z" fill="#e7e9e1" />
            {/* 하천 */}
            <path d="M-200 340 C40 300 160 400 320 370 C480 340 560 420 840 380" fill="none" stroke="#cfdbe0" strokeWidth="22" strokeLinecap="round" />
            {/* 지방도 */}
            <g fill="none" strokeLinecap="round">
              <path d="M372 168 L372 -100 M372 168 L478 300 L478 520 M478 300 L760 300" stroke="#c4c4c4" strokeWidth="13" />
              <path d="M372 168 L372 -100 M372 168 L478 300 L478 520 M478 300 L760 300" stroke="#fff" strokeWidth="8" />
            </g>
            {/* 고속도로 */}
            <g fill="none" strokeLinecap="round">
              <path d="M-200 110 C120 120 260 90 420 110 C560 128 680 160 860 150" stroke="#9a9a9a" strokeWidth="20" />
              <path d="M-200 110 C120 120 260 90 420 110 C560 128 680 160 860 150" stroke="#f2f2f0" strokeWidth="12" />
            </g>
            <g>
              <rect x="336" y="74" width="72" height="26" rx="4" fill={C.ink} />
              <text x="372" y="92" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">
                ㅇㅊ IC
              </text>
            </g>
            {/* 센터 표시 */}
            {(Object.keys(CENTERS) as CenterId[]).map((id) => {
              const [x, y] = CENTERS[id].at;
              const on = id === sel;
              return (
                <g key={id} transform={`translate(${x} ${y})`}>
                  <path d="M0 0 C-14 -16 -20 -26 -20 -36 A20 20 0 1 1 20 -36 C20 -26 14 -16 0 0 Z" fill={on ? C.accent : "#fff"} stroke={on ? C.accent : C.ink} strokeWidth="1.5" />
                  <text x="0" y="-30" textAnchor="middle" fontSize="17" fontWeight="700" fill={on ? "#fff" : C.ink}>
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
                className={`rounded-[6px] border px-3 py-1.5 text-[14px] font-semibold md:text-[15px] ${focusRing}`}
                style={{ borderColor: on ? C.accent : C.field, background: on ? C.accent : C.paper, color: on ? "#fff" : C.ink, outlineColor: C.accent }}
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
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
          >
            <p className="flex flex-wrap items-center gap-2 text-[24px] font-bold">
              <c.icon size={24} aria-hidden style={{ color: C.accent }} />
              {c.name}
              <span className="rounded-[4px] border px-2 py-0.5 text-[14px] font-medium" style={{ borderColor: C.line, color: C.body }}>
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
        <p className="mt-6 flex items-start gap-2 rounded-[8px] p-4 text-[15px] leading-[1.6]" style={{ background: C.soft }}>
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

  const input = `mt-1.5 w-full rounded-[6px] border bg-white px-3 py-2.5 text-[16px] ${focusRing}`;
  const label = "block text-[15px] font-semibold";
  const errText = (k: string) =>
    err[k] ? (
      <p id={`lg-e-${k}`} className="mt-1 text-[14px] font-semibold" style={{ color: C.error }}>
        {err[k]}
      </p>
    ) : null;

  return (
    <div className="mt-6 overflow-hidden rounded-[8px] border" style={{ borderColor: C.line, background: C.paper }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            className="grid gap-6 p-5 md:grid-cols-[auto_1fr] md:items-start md:p-8"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.accent, color: "#fff" }}>
              <Check size={34} strokeWidth={2.5} aria-hidden />
            </span>
            <div>
              <p className="text-[26px] font-bold" role="status">
                상담 신청이 접수됐어요
              </p>
              <dl className="mt-5 grid gap-x-6 gap-y-2.5 text-[16px] sm:grid-cols-[auto_1fr]">
                <dt className="font-bold">접수 번호</dt>
                <dd className="tabular-nums">{done.no}</dd>
                <dt className="font-bold">쇼핑몰</dt>
                <dd>{done.shop}</dd>
                <dt className="font-bold">담당자</dt>
                <dd>
                  {maskName(done.name)} / {maskPhone(done.phone)}
                </dd>
                <dt className="font-bold">담당 창구</dt>
                <dd>
                  영업팀 전화 <span className="tabular-nums">{TEL}</span>, {KAKAO}
                </dd>
                <dt className="font-bold">회신 예정일</dt>
                <dd>{fmtKo(done.reply)} 오전 중 전화</dd>
              </dl>
              <button
                type="button"
                onClick={reset}
                className={`mt-6 inline-flex items-center gap-2 rounded-[6px] border px-4 py-2 text-[15px] font-semibold ${focusRing}`}
                style={{ borderColor: C.field, outlineColor: C.accent }}
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
              <input id="lg-f-shop" value={shop} onChange={(e) => setShop(e.target.value)} className={input} style={{ borderColor: err.shop ? C.error : C.field, outlineColor: C.accent }} aria-invalid={!!err.shop} aria-describedby={err.shop ? "lg-e-shop" : undefined} autoComplete="organization" />
              {errText("shop")}
            </div>
            <div>
              <label htmlFor="lg-f-name" className={label}>
                담당자 이름
              </label>
              <input id="lg-f-name" value={name} onChange={(e) => setName(e.target.value)} className={input} style={{ borderColor: err.name ? C.error : C.field, outlineColor: C.accent }} aria-invalid={!!err.name} aria-describedby={err.name ? "lg-e-name" : undefined} autoComplete="name" />
              {errText("name")}
            </div>
            <div>
              <label htmlFor="lg-f-phone" className={label}>
                휴대폰
              </label>
              <input id="lg-f-phone" type="tel" inputMode="numeric" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} style={{ borderColor: err.phone ? C.error : C.field, outlineColor: C.accent }} aria-invalid={!!err.phone} aria-describedby={err.phone ? "lg-e-phone" : undefined} autoComplete="tel" />
              {errText("phone")}
            </div>
            <div>
              <label htmlFor="lg-f-orders" className={label}>
                월 출고 건수
              </label>
              <input id="lg-f-orders" inputMode="numeric" placeholder="예: 1500" value={orders} onChange={(e) => setOrders(e.target.value.replace(/\D/g, ""))} className={input} style={{ borderColor: C.field, outlineColor: C.accent }} />
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
                      className={`inline-flex items-center gap-1.5 rounded-[6px] border px-3.5 py-2 text-[15px] font-semibold ${focusRing}`}
                      style={{ borderColor: err.channels ? C.error : on ? C.accent : C.field, background: on ? C.accent : C.paper, color: on ? "#fff" : C.ink, outlineColor: C.accent }}
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
              <select id="lg-f-goods" value={goods} onChange={(e) => setGoods(e.target.value)} className={input} style={{ borderColor: C.field, outlineColor: C.accent }}>
                {GOODS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lg-f-start" className={label}>
                시작 희망 시기
              </label>
              <select id="lg-f-start" value={start} onChange={(e) => setStart(e.target.value)} className={input} style={{ borderColor: C.field, outlineColor: C.accent }}>
                {STARTS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="lg-f-memo" className={label}>
                문의 내용 <span className="font-normal" style={{ color: C.muted }}>(선택)</span>
              </label>
              <textarea id="lg-f-memo" rows={3} value={memo} onChange={(e) => setMemo(e.target.value)} className={`${input} resize-y`} style={{ borderColor: C.field, outlineColor: C.accent }} />
            </div>
            <div className="flex flex-col gap-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 text-[15px]">
                  <input id="lg-f-agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`h-5 w-5 ${focusRing}`} style={{ accentColor: C.accent, outlineColor: C.accent }} aria-describedby={err.agree ? "lg-e-agree" : undefined} />
                  개인정보 수집, 이용 동의(상담 회신용, 1년 보관)
                </label>
                {errText("agree")}
              </div>
              <button
                type="submit"
                data-gtm-cta="logistics_submit"
                className={`inline-flex items-center justify-center gap-2 rounded-[6px] px-6 py-3.5 text-[16px] font-semibold text-white ${focusRing}`}
                style={{ background: C.accent, outlineColor: C.accent }}
              >
                <MessageCircle size={18} aria-hidden />
                상담 신청
              </button>
            </div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] md:col-span-2" style={{ color: C.muted }}>
              <span className="inline-flex items-center gap-1.5">
                <Phone size={15} aria-hidden />
                대표전화 <span className="tabular-nums">{TEL}</span>
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
