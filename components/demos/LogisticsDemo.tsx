"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Clock,
  Forklift,
  MapPin,
  Menu,
  MessageCircle,
  PackageCheck,
  PackageOpen,
  Phone,
  RotateCcw,
  Snowflake,
  Truck,
  Undo2,
  Warehouse,
  X,
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

   첫 화면(lg-poster): 메뉴 줄, 막 없는 물류센터 사진과 왼쪽 위 짙은 제목 판, 사진 경계에 걸친 상담 바(대표전화, 견적 문의), 운영 정보 띠 4칸.
   핵심 모션: 사진만 1.6초 동안 천천히 다가온다(scale 1.06 -> 1). 동작 줄이기면 끈다.

   구성: 서비스 흐름, 평일 출고 일정(고정 안내), 이용 요금표, 물류센터 2곳 안내, 도입 상담 신청.
   도입 상담 신청은 브라우저 안에서만 돈다. 쇼핑몰, 담당자, 판매 채널, 상품 종류를 받고 완료 화면에 접수 번호, 담당 창구, 회신 예정일. */

const IMG = "/images/demo-logistics";

const ADDRESS = "경기 ㅇㅊ시 ㅇㅇ면 ㅇㅇ로 00";
const TEL = "031-000-0000";
const KAKAO = "카카오톡 채널 물류 대행";

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

/** 첫 화면 사진이 다가오는 시간(초) */
const HERO_IN = 1.6;
const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- 요금 ---------- */

const PALLET_FEE = 30000;
const COLD_PALLET_FEE = 45000;
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

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";

const isWeekday = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5;
const nextBizDay = (d: Date) => {
  let n = daysAgo(d, -1);
  while (!isWeekday(n)) n = daysAgo(n, -1);
  return n;
};

/* ---------- 물류센터 ---------- */

type CenterId = "c1" | "c2";
const CENTERS: Record<CenterId, { name: string; kind: string; icon: typeof Warehouse; rows: [string, string][] }> = {
  c1: {
    name: "ㅇㅊ 1센터",
    kind: "상온",
    icon: Warehouse,
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
    rows: [
      ["주소", "경기 ㅇㅊ시 ㅇㅇ읍 ㅇㅇ길 00"],
      ["보관", "냉장 0 ~ 10도, 냉동 영하 18도 이하"],
      ["입고 시간", "평일 09:00 ~ 14:00, 온도 기록지 함께"],
      ["화물차", "5톤 냉동탑차까지"],
      ["가는 길", "1센터에서 차로 10분"],
    ],
  },
};

export function LogisticsDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div className="min-h-screen overflow-x-clip pb-24" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} go={go} />

      {/* 하는 일과 출고 일정 */}
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
        </div>
        <ShipSchedule />
      </section>

      {/* 서비스 */}
      <section id="lg-service" aria-labelledby="lg-service-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="lg-service-title" title="서비스 흐름" />
        <ServiceLine />
      </section>

      {/* 이용 요금 */}
      <section id="lg-quote" aria-labelledby="lg-quote-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="lg-quote-title" title="이용 요금" />
        <FeeTable />
      </section>

      {/* 물류센터 */}
      <section id="lg-center" aria-labelledby="lg-center-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="lg-center-title" title="물류센터" />
        <Centers />
      </section>

      {/* 도입 상담 */}
      <section id="lg-contact" aria-labelledby="lg-contact-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="lg-contact-title" title="도입 상담 신청" />
        <Contact today={today} reduce={reduce} />
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

/* 첫 화면 구조(국내 풀필먼트 사이트 조사, 2026-10): 흰 메뉴 줄 오른쪽에 견적 문의, 그 아래 막 없는 물류센터 사진,
   사진 아래 경계에 반쯤 걸친 흰 상담 바(대표전화, 견적 문의), 그 아래 운영 정보 띠 4칸. 제목은 사진 왼쪽 위 짙은 판 위에 한 줄.
   휴대폰에서는 메뉴를 햄버거로 접고, 사진은 낮게, 상담 바는 사진 아래로 내리고, 정보 띠는 2x2,
   상담 바를 지나 내려가면 하단에 견적 문의 고정 줄.
   모션: 사진만 1.06배에서 1배로 1.6초 동안 다가온다. 동작 줄이기면 끈다. */

const NAV: [string, string][] = [
  ["lg-service", "서비스"],
  ["lg-quote", "요금 안내"],
  ["lg-center", "센터 소개"],
  ["lg-contact", "도입 상담"],
];

/** 운영 정보 띠. 실적 숫자가 아니라 이 샘플 안 센터, 요금 데이터에 있는 값만 쓴다 */
const FACTS: [string, string, string][] = [
  ["오후 2시", "당일 출고 마감", "평일 기준"],
  ["4곳", "주문 자동 연동", "스마트스토어, 쿠팡, 카페24, 자사몰"],
  ["2곳", "물류센터", "1센터 상온, 2센터 냉장, 냉동"],
  ["11톤", "도크 접안 화물차", "1센터 윙바디 기준"],
];

function Poster({ reduce, go }: { reduce: boolean; go: (id: string) => void }) {
  const [menu, setMenu] = useState(false);
  /* 하단 고정 줄은 첫 화면 상담 바가 화면에서 벗어난 뒤에만 올라온다 */
  const formRef = useRef<HTMLDivElement>(null);
  const [barOn, setBarOn] = useState(false);
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBarOn(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const navBtn = `inline-flex h-11 items-center rounded-[4px] px-3 text-[15px] font-semibold underline-offset-4 hover:underline ${focusRing}`;

  return (
    <section id="lg-poster" aria-labelledby="lg-poster-title" style={{ background: C.paper, color: C.ink }}>
      <style>{`@keyframes lg-in{from{transform:scale(1.06)}}.lg-in{animation:lg-in ${HERO_IN}s cubic-bezier(0.22,1,0.36,1) both}@media (prefers-reduced-motion: reduce){.lg-in{animation:none}}`}</style>

      {/* 메뉴 */}
      <header className="relative z-20 border-b" style={{ borderColor: C.line, background: C.paper }}>
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
          <p>
            <SampleLogo />
          </p>
          <nav aria-label="주요 메뉴" className="hidden items-center lg:flex">
            {NAV.map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.accent }}>
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go("lg-contact")}
              data-gtm-cta="logistics_header_cta"
              className={`hidden h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold text-white sm:inline-flex ${focusRing}`}
              style={{ background: C.accent, outlineColor: C.accent }}
            >
              <MessageCircle size={17} aria-hidden />
              견적 문의
            </button>
            <button
              type="button"
              aria-expanded={menu}
              aria-controls="lg-menu"
              aria-label={menu ? "메뉴 닫기" : "메뉴 열기"}
              onClick={() => setMenu((v) => !v)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-[6px] border lg:hidden ${focusRing}`}
              style={{ borderColor: C.field, outlineColor: C.accent }}
            >
              {menu ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>
        {menu && (
          <nav id="lg-menu" aria-label="주요 메뉴" className="absolute inset-x-0 top-full border-b px-4 pb-4 pt-2 lg:hidden" style={{ background: C.paper, borderColor: C.line }}>
            <ul>
              {NAV.map(([id, label]) => (
                <li key={id} className="border-b" style={{ borderColor: C.line }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      go(id);
                    }}
                    className={`flex h-12 w-full items-center text-left text-[16px] font-semibold ${focusRing}`}
                    style={{ outlineColor: C.accent }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* 센터 사진과 제목 판 */}
      <div className="relative h-[40svh] min-h-[260px] overflow-hidden md:h-[48svh] lg:h-[56svh] lg:max-h-[560px]" style={{ background: "#d9d9d6" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
        <img
          src={`${IMG}/hero.jpg`}
          srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
          sizes="100vw"
          alt="물류센터 상자 랙 앞에서 직원 두 명이 태블릿으로 입고 수량을 확인하는 모습"
          fetchPriority="high"
          className={`absolute inset-0 h-full w-full object-cover ${reduce ? "" : "lg-in"}`}
          style={{ objectPosition: "60% 45%" }}
        />
        <div className="relative mx-auto max-w-[1200px] px-4 pt-4 md:px-6 md:pt-8">
          <div className="inline-block max-w-full rounded-[6px] px-4 py-3 md:px-6 md:py-5" style={{ background: C.ink, color: "#fff" }}>
            <h1 id="lg-poster-title" className="text-[24px] font-bold md:text-[34px] lg:text-[40px]" style={{ letterSpacing: "-0.03em", lineHeight: 1.25, wordBreak: "keep-all" }}>
              오후 2시 주문까지 당일 출고
            </h1>
            <p className="mt-1 text-[15px] md:mt-2 md:text-[17px]" style={{ color: "rgba(255,255,255,0.82)" }}>
              경기 ㅇㅊ 물류센터, 평일 출고
            </p>
          </div>
        </div>
      </div>

      {/* 사진 경계에 걸친 상담 바 */}
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-6">
        <div
          ref={formRef}
          className="mt-4 flex flex-col gap-4 rounded-[8px] border p-4 md:p-5 lg:-mt-[60px] lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:p-6"
          style={{ borderColor: C.line, background: C.paper }}
        >
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.body }}>
              도입 상담
            </p>
            <p className="mt-1 flex items-center gap-2 text-[24px] font-bold tabular-nums md:text-[28px]">
              <Phone size={22} aria-hidden style={{ color: C.accent }} />
              {TEL}
            </p>
            <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
              평일 09:00 ~ 18:00, {KAKAO}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => go("lg-quote")}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-[6px] border px-5 text-[16px] font-semibold ${focusRing}`}
              style={{ borderColor: C.field, outlineColor: C.accent }}
            >
              요금 안내
            </button>
            <button
              type="button"
              onClick={() => go("lg-contact")}
              data-gtm-cta="logistics_poster_cta"
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-[6px] px-6 text-[16px] font-semibold text-white ${focusRing}`}
              style={{ background: C.ink, outlineColor: C.ink }}
            >
              <MessageCircle size={18} aria-hidden />
              견적 문의
            </button>
          </div>
        </div>

        {/* 운영 정보 띠 */}
        <dl className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border-t lg:grid-cols-4" style={{ borderColor: C.ink }}>
          {FACTS.map(([big, label, note], i) => (
            <div key={label} className={`border-b px-1 py-4 lg:border-b-0 lg:px-5 lg:py-5 ${i % 2 === 1 ? "pl-4 lg:pl-5" : ""} ${i > 0 ? "lg:border-l" : ""} ${i % 2 === 1 ? "border-l" : ""}`} style={{ borderColor: C.line }}>
              <dt className="text-[14px] font-semibold" style={{ color: C.body }}>
                {label}
              </dt>
              <dd className="mt-1 text-[24px] font-bold tabular-nums tracking-[-0.02em] md:text-[28px]">{big}</dd>
              <dd className="mt-1 text-[13px] leading-[1.5]" style={{ color: C.muted, wordBreak: "keep-all" }}>
                {note}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* 휴대폰 하단 고정 견적 문의 */}
      <div
        aria-hidden={!barOn}
        inert={!barOn}
        className={`fixed inset-x-0 bottom-0 z-30 border-t px-4 py-3 md:hidden ${reduce ? "" : "transition-transform duration-300"} ${barOn ? "translate-y-0" : "translate-y-full"}`}
        style={{ background: C.paper, borderColor: C.line, paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}>
        <button
          type="button"
          onClick={() => go("lg-contact")}
          data-gtm-cta="logistics_sticky_cta"
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-[6px] text-[16px] font-semibold text-white ${focusRing}`}
          style={{ background: C.accent, outlineColor: C.accent }}
        >
          <MessageCircle size={18} aria-hidden />
          견적 문의
        </button>
      </div>
    </section>
  );
}


/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  const mark = size + 8;
  return (
    <span className="inline-flex items-center gap-2 leading-none" style={{ color: light ? "#fff" : "#111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          물류 대행
        </span>
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

/* ---------- 출고 일정 ---------- */

const DAY_STEPS: [string, string, string][] = [
  ["09:00", "주문 수집", "연동된 쇼핑몰 주문을 모아 출고 목록을 만듭니다."],
  ["14:00", "출고 마감", "평일 오후 2시까지 들어온 주문은 그날 포장해 보냅니다."],
  ["17:00", "택배사 집하", "포장을 마친 상자를 택배사에 넘깁니다."],
  ["다음 날", "도착", "수도권 기준 다음 날 받아 보실 수 있습니다."],
];

function ShipSchedule() {
  return (
    <div id="lg-schedule" className="rounded-[8px] border p-5 md:p-7" style={{ background: C.soft, borderColor: C.line, color: C.ink }}>
      <p className="inline-flex items-center gap-2 text-[16px] font-bold" style={{ color: C.body }}>
        <Clock size={18} aria-hidden />
        평일 출고 일정
      </p>
      <p className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.02em] md:text-[36px]" style={{ color: C.accent }}>
        오후 2시 이전 주문 당일 출고
      </p>
      <ol className="mt-6 grid gap-0 border-t" style={{ borderColor: C.line }}>
        {DAY_STEPS.map(([time, name, desc]) => (
          <li key={name} className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 border-b py-3 text-[15px]" style={{ borderColor: C.line }}>
            <span className="font-bold tabular-nums">{time}</span>
            <span>
              <b className="block text-[16px]">{name}</b>
              <span style={{ color: C.body, wordBreak: "keep-all" }}>{desc}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
        토요일, 일요일, 공휴일 주문은 다음 평일에 출고합니다.
      </p>
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
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
            <img src={`${IMG}/service-${k + 1}.jpg`} alt={`${s.name} 작업 사진`} className="mb-4 block aspect-[4/3] w-full rounded-[6px] object-cover" />
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

/* ---------- 이용 요금 ---------- */

const FEE_ROWS: [string, string, string][] = [
  ["입고비", "박스 1개 검수와 적치", won(300)],
  ["보관비", "상온 팔레트 1개(1,100 x 1,100mm, 높이 1.5m), 월", won(PALLET_FEE)],
  ["보관비", "냉장, 냉동 팔레트 1개, 월", won(COLD_PALLET_FEE)],
  ...WORK_TIERS.map((w): [string, string, string] => ["출고 작업비", `${w.label}, 피킹과 포장 1건`, won(w.fee)]),
  ["합포장", "상품 1개 추가될 때마다", won(200)],
  ...(Object.keys(PARCEL) as ParcelSize[]).map((k): [string, string, string] => [`택배비 ${k}`, PARCEL[k].spec, won(PARCEL[k].fee)]),
  ["반품 처리", "회수 상품 검수와 재입고 1건", won(1000)],
  ["포장재", "박스, 완충재, 테이프", "실비"],
];

function FeeTable() {
  return (
    <div className="mt-6">
      <ul className="border-t md:hidden" style={{ borderColor: C.field, background: C.paper }}>
        {FEE_ROWS.map(([a, b, c], k) => (
          <li key={`m${k}`} className="border-b px-4 py-2.5" style={{ borderColor: C.line }}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 font-semibold">{a}</span>
              <span className="whitespace-nowrap tabular-nums">{c}</span>
            </div>
            <p className="mt-0.5 text-[14px]" style={{ color: C.muted }}>
              {b}
            </p>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
          <caption className="sr-only">항목별 이용 요금</caption>
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
            {FEE_ROWS.map(([a, b, c], k) => (
              <tr key={k} className="border-b" style={{ borderColor: C.line, background: C.paper }}>
                <th scope="row" className="whitespace-nowrap px-4 py-2.5 font-semibold">
                  {a}
                </th>
                <td className="px-4 py-2.5">{b}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
        부가세 별도. 월 출고량과 상품 특성에 따라 상담 후 최종 견적을 드립니다.
      </p>
    </div>
  );
}

/* ---------- 물류센터 ---------- */

function Centers() {
  return (
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      {(Object.keys(CENTERS) as CenterId[]).map((id) => {
        const c = CENTERS[id];
        return (
          <article key={id} className="rounded-[8px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.paper }}>
            <h3 className="flex flex-wrap items-center gap-2 text-[22px] font-bold">
              <c.icon size={22} aria-hidden style={{ color: C.accent }} />
              {c.name}
              <span className="rounded-[4px] border px-2 py-0.5 text-[14px] font-medium" style={{ borderColor: C.line, color: C.body }}>
                {c.kind}
              </span>
            </h3>
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
          </article>
        );
      })}
      <p className="flex items-start gap-2 rounded-[8px] p-4 text-[15px] leading-[1.6] md:col-span-2" style={{ background: C.soft }}>
        <Truck size={18} className="mt-0.5 flex-none" aria-hidden />
        택배사 집하는 평일 오후 5시입니다. 센터 견학은 상담 때 날짜를 잡아 드립니다.
      </p>
    </div>
  );
}

/* ---------- 4. 도입 상담 신청 ---------- */

const CHANNELS = ["스마트스토어", "쿠팡", "자사몰", "오픈마켓 기타"];
const GOODS = ["의류, 잡화", "화장품", "식품(상온)", "식품(냉장, 냉동)", "생활용품", "기타"];
const STARTS = ["바로", "1개월 안", "2~3개월 안", "아직 미정"];

type Done = { no: string; shop: string; name: string; phone: string; reply: Date };

function Contact({ today, reduce }: { today: Date; reduce: boolean }) {
  const [shop, setShop] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [channels, setChannels] = useState<string[]>([]);
  const [goods, setGoods] = useState(GOODS[0]);
  const [orders, setOrders] = useState("");
  const [start, setStart] = useState(STARTS[1]);
  const [memo, setMemo] = useState("");
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
