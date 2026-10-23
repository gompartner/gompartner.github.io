"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { AlertCircle, CalendarCheck, Car, Check, Clock, Eye, MapPin, MessageCircle, Phone, RotateCcw } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 안과 홈페이지 샘플: 가상의 안과 의원 곰파트너. 시력교정과 백내장을 주로 보는 동네 안과.
   병원명, 의료진, 주소, 전화번호, 진료비는 모두 가상이다.

   국내 안과 사이트 공통 구성(참고): 메뉴는 병원소개, 시력교정(라식, 라섹, 스마일라식), 백내장, 노안, 망막, 진료안내(진료시간, 오시는 길),
   상담예약, 비급여 진료비 안내. 첫 화면에는 수술 전 정밀검사 예약과 진료시간이 있다. 정밀검사 안내에는 소요 시간(2~3시간),
   렌즈 착용 중단 기간, 산동 검사 뒤 운전 자제, 대중교통 이용 문구가 늘 붙는다. 백내장은 단초점 렌즈 건강보험 적용, 다초점 렌즈 비급여로 나눠 적는다.
   의료법 광고 규정에 맞춰 효과 보장, 최고, 유일, 수술 전후 사진, 환자 후기, 할인 강조는 넣지 않는다. 진료비는 비급여 진료비 안내 표로만 공개한다.

   사진 출처: Pexels 사진 5752267

   첫 화면(ec-poster): 시험테 사진 한 장이 한 화면을 채우고 아래 왼쪽에 문장 "수술 전 검사만 받아 봐도 돼요".
   들어오면 사진이 1.6초 동안 천천히 다가오고(1.06배에서 1배), 문장은 0.3초 늦게 아래에서 올라온다(CSS keyframes, JS 없이도 보인다).
   스크롤하면 사진만 조금 느리게 움직인다. 동작 줄이기면 전부 멈춘다.

   본문 핵심 모션: 수술을 고르면 각막 단면 그림에서 라식은 절편이 열리고, 라섹은 상피가 벗겨지고, 스마일은 작은 절개로 조직이 빠진다.
   정밀검사 단계를 고르면 눈 그림 둘레에 누적 시간이 차고, 산동 검사에서 동공이 커진다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 시력교정 수술 비교: 라식, 라섹, 스마일라식을 고르면 각막 단면 그림, 회복 기간 막대, 비교표 열이 바뀐다.
   2. 수술 전 검사 단계: 8단계를 고르면 단계 설명과 시작 후 누적 시간이 바뀐다.
   3. 백내장 진료 안내: 백내장 있을 때, 단초점 렌즈, 다초점 렌즈를 고르면 거리별로 보이는 예시 그림이 바뀐다.
   4. 상담 예약: 진료 분야, 날짜, 시간, 이름, 휴대폰. 완료하면 예약번호, 담당 창구, 회신 예정일을 보여 준다. */

const IMG = "/images/demo-eye-clinic";
const BRAND = "곰파트너";
const TEL = "02-000-0000";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 5층";
const KAKAO = "카카오톡 채널 곰파트너";

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className={small ? "h-6 w-6 shrink-0" : "h-7 w-7 shrink-0"} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold tracking-[-0.03em]`}>곰파트너</span>
        <span className="text-[12px] font-semibold opacity-75">안과 샘플</span>
      </span>
    </span>
  );
}

const C = {
  paper: "#f7f7f5",
  card: "#ffffff",
  line: "#e5e5e5",
  text: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  /** 강조색 하나. 차분한 청록 */
  teal: "#2c5f5b",
  tealSoft: "#edf2f1",
  /** 그림 안에서만 쓰는 옅은 청록 */
  tealMid: "#a9c2be",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 첫 화면 사진이 다가오는 시간 */
const PHOTO_IN = 1.6;
/** 칩, 막대, 그림 전환 */
const DUR = 0.45;
/** 패널 전환 */
const DUR_FAST = 0.2;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const p2 = (n: number) => String(n).padStart(2, "0");
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/* ---------- 1. 시력교정 수술 비교 ---------- */

type Surgery = "lasik" | "lasek" | "smile";
const SURGERIES: { id: Surgery; name: string; how: string }[] = [
  { id: "lasik", name: "라식", how: "각막 겉을 얇게 절편으로 열고 그 아래를 레이저로 깎은 뒤 절편을 덮어요." },
  { id: "lasek", name: "라섹", how: "각막 맨 겉의 상피를 벗기고 레이저로 깎아요. 상피는 며칠 동안 다시 자라요." },
  { id: "smile", name: "스마일라식", how: "각막 속 조직을 레이저로 렌즈 모양으로 분리해 작은 절개로 꺼내요." },
];

/** 비교표 행. 순서는 라식, 라섹, 스마일라식 */
const COMPARE_ROWS: { label: string; v: [string, string, string] }[] = [
  { label: "각막 절개", v: ["약 20mm", "절개 없음", "2~4mm"] },
  { label: "수술 후 통증", v: ["적은 편", "2~3일 따가움", "적은 편"] },
  { label: "일상생활", v: ["다음 날", "3~5일 뒤", "다음 날"] },
  { label: "시력 안정", v: ["1~2주", "1~3개월", "1~2주"] },
  { label: "세안, 화장", v: ["1주 뒤", "1주 뒤", "3일 뒤"] },
  { label: "충격 있는 운동", v: ["절편 밀림 주의", "제한 적음", "제한 적음"] },
  { label: "각막이 얇을 때", v: ["어려울 수 있음", "가능한 경우 많음", "검사 후 결정"] },
  { label: "수술비(양안)", v: [won(1700000), won(1500000), won(2900000)] },
];

/** 회복 막대. 일상 복귀일과 시력 안정까지 걸리는 날 */
const RECOVERY: Record<Surgery, { back: number; stable: number }> = {
  lasik: { back: 1, stable: 14 },
  lasek: { back: 4, stable: 60 },
  smile: { back: 1, stable: 14 },
};
const AXIS: [number, string][] = [
  [0, "당일"],
  [1, "다음 날"],
  [7, "1주"],
  [30, "1개월"],
  [90, "3개월"],
];
/** 날짜를 막대 위치(0~1)로. 앞쪽 며칠이 잘 보이게 구간마다 다르게 늘린다 */
function axisPos(d: number) {
  const stops: [number, number][] = [
    [0, 0],
    [1, 0.16],
    [7, 0.42],
    [30, 0.72],
    [90, 1],
  ];
  for (let i = 1; i < stops.length; i++) {
    const [d0, p0] = stops[i - 1];
    const [d1, pp1] = stops[i];
    if (d <= d1) return p0 + ((d - d0) / (d1 - d0)) * (pp1 - p0);
  }
  return 1;
}

/* ---------- 2. 수술 전 정밀검사 ---------- */

const EXAM_STEPS: { name: string; min: number; body: string }[] = [
  { name: "접수와 문진", min: 10, body: "지금 쓰는 안경이나 렌즈, 앓은 눈 질환, 복용 중인 약을 여쭤봐요." },
  { name: "시력, 굴절 검사", min: 15, body: "맨눈 시력과 근시, 난시 도수를 재요. 지금 안경 도수와도 비교해요." },
  { name: "안압 검사", min: 5, body: "눈에 바람이 짧게 나오는 검사예요. 녹내장 위험이 있는지 봐요." },
  { name: "각막 지형도", min: 15, body: "각막 겉면 모양과 난시 방향을 지도처럼 찍어요. 원추각막이 있는지도 여기서 봐요." },
  { name: "각막 두께", min: 10, body: "얼마나 깎을 수 있는지 정하는 검사예요. 수술 방법이 여기서 많이 정해져요." },
  { name: "동공 크기, 눈물 검사", min: 15, body: "어두운 곳의 동공 크기로 빛 번짐 가능성을 보고, 눈물 양으로 안구건조를 확인해요." },
  { name: "산동 검사", min: 50, body: "동공을 키우는 안약을 넣고 기다린 뒤 망막 끝까지 봐요. 끝나고 4~6시간은 눈이 부시고 가까운 글씨가 흐려요." },
  { name: "원장 상담", min: 30, body: "검사 결과를 같이 보고 수술 가능 여부와 맞는 수술 방법을 정해요." },
];
const EXAM_TOTAL = EXAM_STEPS.reduce((a, s) => a + s.min, 0);
const DILATE_STEP = 6;
const hm = (m: number) => (m < 60 ? `${m}분` : m % 60 === 0 ? `${m / 60}시간` : `${Math.floor(m / 60)}시간 ${m % 60}분`);

const PREP = [
  ["소프트렌즈", "검사 1주 전부터"],
  ["난시용 렌즈, 하드렌즈", "검사 2~3주 전부터"],
  ["드림렌즈", "검사 1개월 이상 전부터"],
] as const;

/* ---------- 3. 백내장 ---------- */

type Lens = "cataract" | "mono" | "multi";
const LENSES: { id: Lens; name: string; note: string }[] = [
  { id: "cataract", name: "백내장 있을 때", note: "수정체가 뿌옇게 흐려져 거리와 상관없이 안개 낀 것처럼 보여요." },
  { id: "mono", name: "단초점 렌즈", note: "먼 곳에 초점을 맞춰요. 가까운 글씨는 돋보기를 써야 해요. 건강보험이 적용돼요." },
  { id: "multi", name: "다초점 렌즈", note: "먼 곳과 가까운 곳에 초점이 나뉘어 있어요. 밤에 불빛 번짐이 생길 수 있어요. 비급여예요." },
];
/** 거리별 흐림 정도(px)와 뿌연 막. 가까이, 중간, 멀리 순서 */
const VISION: Record<Lens, { blur: [number, number, number]; haze: number }> = {
  cataract: { blur: [2.4, 2.4, 2.8], haze: 0.5 },
  mono: { blur: [2.6, 1.3, 0], haze: 0 },
  multi: { blur: [0.4, 0.9, 0.3], haze: 0 },
};
const DISTANCES = ["가까이 40cm", "중간 70cm", "멀리 5m"] as const;

const CATARACT_SIGNS = ["안개 낀 것처럼 뿌옇게 보여요", "밤에 불빛이 번져 보여요", "안경 도수가 자주 바뀌어요", "색이 누렇게 바래 보여요"];

/* ---------- 비급여, 진료시간 ---------- */

const FEES: { item: string; unit: string; price: string }[] = [
  { item: "라식", unit: "양안", price: won(1700000) },
  { item: "라섹", unit: "양안", price: won(1500000) },
  { item: "스마일라식", unit: "양안", price: won(2900000) },
  { item: "시력교정 수술 전 정밀검사", unit: "1회", price: won(50000) },
  { item: "다초점 인공수정체(백내장)", unit: "한쪽 눈", price: `${won(3000000)} ~ ${won(4500000)}` },
  { item: "드림렌즈(검사 포함)", unit: "양안", price: won(1300000) },
  { item: "일반진단서", unit: "1통", price: won(20000) },
];

const HOURS: { dow: number; label: string; open: string }[] = [
  { dow: 1, label: "월", open: "09:00 ~ 18:00" },
  { dow: 2, label: "화", open: "09:00 ~ 18:00" },
  { dow: 3, label: "수", open: "09:00 ~ 18:00" },
  { dow: 4, label: "목", open: "09:00 ~ 20:00 (야간)" },
  { dow: 5, label: "금", open: "09:00 ~ 18:00" },
  { dow: 6, label: "토", open: "09:00 ~ 13:00" },
  { dow: 0, label: "일", open: "휴진" },
];

const DOCTORS = [
  { name: "김ㅎ늘", role: "대표원장", field: "시력교정, 백내장" },
  { name: "이ㅅ우", role: "원장", field: "망막, 녹내장" },
];

/* ---------- 4. 상담 예약 ---------- */

const FIELDS = ["시력교정 정밀검사", "백내장 상담", "일반 진료"] as const;
type Field = (typeof FIELDS)[number];

/** 요일별 예약 칸. 점심 13:00 ~ 14:00 제외, 목요일은 19:30까지, 토요일은 12:30까지 */
function slotsFor(d: Date) {
  const dow = d.getDay();
  if (dow === 0) return [];
  const last = dow === 6 ? 12.5 : dow === 4 ? 19.5 : 17.5;
  const out: string[] = [];
  for (let h = 9; h <= last; h += 0.5) {
    if (h >= 13 && h < 14) continue;
    out.push(`${p2(Math.floor(h))}:${h % 1 ? "30" : "00"}`);
  }
  return out;
}
/** 이미 찬 칸. 실제로는 예약 시스템에서 읽는다 */
function isTaken(d: Date, i: number) {
  const h = Math.abs(((d.getMonth() + 1) * 131 + d.getDate() * 977 + i * 389) ^ 0x5bd1e995) % 10;
  return h < 3;
}
const nextBizDay = (d: Date) => {
  let n = daysAgo(d, -1);
  while (n.getDay() === 0) n = daysAgo(n, -1);
  return n;
};

export function EyeClinicDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const todayHours = HOURS.find((h) => h.dow === today.getDay()) ?? HOURS[0];
  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.card, color: C.text }}>
      <Poster reduce={reduce} onCta={() => go("ec-book")} />

      {/* 동공 안으로 들어온 뒤 이어지는 어두운 머리글 */}
      <header className="border-b" style={{ background: C.card, color: C.text, borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pb-3 pt-6 md:px-6">
          <h2 className="leading-none">
            <SampleLogo />
          </h2>
          <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center">
            {[
              ["ec-compare", "시력교정"],
              ["ec-exam", "정밀검사"],
              ["ec-cataract", "백내장"],
              ["ec-fees", "비급여 진료비"],
              ["ec-hours", "진료안내"],
              ["ec-book", "상담예약"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.teal }}>
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="border-t" style={{ borderColor: C.line }}>
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-[15px] md:px-6" style={{ color: C.body }}>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={16} aria-hidden style={{ color: C.teal }} />
              오늘 진료 <b style={{ color: C.text }}>{todayHours.open}</b>
            </span>
            <span>점심시간 13:00 ~ 14:00</span>
            <a href={`tel:${TEL.replace(/-/g, "")}`} data-gtm-cta="eye-clinic_tel" className={`inline-flex items-center gap-1.5 rounded-[4px] ${focusRing}`} style={{ outlineColor: C.teal }}>
              <Phone size={16} aria-hidden style={{ color: C.teal }} />
              <span className="tabular-nums" style={{ color: C.text }}>{TEL}</span>
            </a>
          </div>
        </div>
      </header>

      <section id="ec-compare" aria-labelledby="ec-compare-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="ec-compare-title" title="시력교정 수술 비교" />
        <Compare reduce={reduce} />
      </section>

      <section id="ec-exam" aria-labelledby="ec-exam-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="ec-exam-title" title="수술 전 정밀검사" />
        <ExamSteps reduce={reduce} onBook={() => go("ec-book")} />
      </section>

      <section id="ec-cataract" aria-labelledby="ec-cataract-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="ec-cataract-title" title="백내장" />
        <Cataract reduce={reduce} />
      </section>

      <section id="ec-fees" aria-labelledby="ec-fees-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="ec-fees-title" title="비급여 진료비 안내" />
        <Fees />
      </section>

      <section id="ec-hours" aria-labelledby="ec-hours-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="ec-hours-title" title="의료진과 진료안내" />
        <HoursAndMap today={today} />
      </section>

      <section id="ec-book" aria-labelledby="ec-book-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="ec-book-title" title="상담 예약" />
        <Booking today={today} reduce={reduce} />
      </section>

      <footer className="mt-20 border-t md:mt-28" style={{ background: C.card, color: C.muted, borderColor: C.line }}>
        <div className="mx-auto max-w-[1200px] px-4 py-10 text-[14px] leading-[1.8] md:px-6">
          <p>
            <SampleLogo />
          </p>
          <p>
            {ADDRESS} | 전화 {TEL} | {KAKAO}
          </p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="mb-6 text-[28px] font-bold leading-tight tracking-[-0.02em] md:mb-8 md:text-[36px]">
      {title}
    </h2>
  );
}

/* ---------- 포스터 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // 스크롤하면 사진만 조금 느리게 내려간다
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  return (
    <section id="ec-poster" ref={ref} aria-labelledby="ec-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: "#141414", color: "#ffffff" }}>
      <style>{`@keyframes ec-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.ec-rise{animation:ec-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both}@media (prefers-reduced-motion: reduce){.ec-rise{animation:none}}`}</style>
      <motion.div className="absolute inset-x-0 top-[-10%] h-[110%]" style={{ y: photoY }}>
        <motion.div className="h-full w-full" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : PHOTO_IN, ease: EASE }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="검안 상자 위에 놓인 시력 검사용 시험테와 렌즈"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "40% 50%" }}
          />
        </motion.div>
      </motion.div>
      {/* 글자 대비를 위한 막. 위는 상호, 아래는 문장 */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.42) 50%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.5))" }} />

      <div className="relative z-[1] flex items-center justify-between gap-3 px-4 pt-4 md:px-12 md:pt-7">
        <p className="leading-none">
          <SampleLogo light small />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta="eye-clinic_poster_cta"
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`}
          style={{ background: C.teal, color: "#ffffff", outlineColor: "#ffffff" }}
        >
          <CalendarCheck size={17} aria-hidden />
          상담 예약
        </button>
      </div>

      <div className={`relative z-[1] mt-auto px-4 pb-14 md:px-12 md:pb-20 ${reduce ? "" : "ec-rise"}`}>
        <h1
          id="ec-poster-title"
          className="max-w-[12em] text-[36px] font-bold md:text-[clamp(40px,5vw,72px)]"
          style={{ letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}
        >
          수술 전 검사만 받아 봐도 돼요
        </h1>
        <p className="mt-4 text-[16px] md:mt-6 md:text-[18px]" style={{ color: "rgba(255,255,255,0.86)" }}>
          {BRAND}, 정밀검사 약 {hm(EXAM_TOTAL)}
        </p>
      </div>
    </section>
  );
}

/* ---------- 1. 시력교정 수술 비교 ---------- */

function Compare({ reduce }: { reduce: boolean }) {
  const [pick, setPick] = useState<Surgery>("lasik");
  const idx = SURGERIES.findIndex((s) => s.id === pick);
  const s = SURGERIES[idx];
  const rec = RECOVERY[pick];
  const t = { duration: reduce ? 0 : DUR, ease: EASE };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
      <div>
        <div role="group" aria-label="수술 고르기" className="flex flex-wrap gap-2">
          {SURGERIES.map((x) => {
            const on = x.id === pick;
            return (
              <button
                key={x.id}
                type="button"
                aria-pressed={on}
                onClick={() => setPick(x.id)}
                className={`min-h-11 rounded-[6px] border px-5 text-[16px] font-bold transition-colors ${focusRing}`}
                style={{ background: on ? C.teal : C.card, color: on ? "#fff" : C.text, borderColor: on ? C.teal : C.line, outlineColor: C.teal }}
              >
                {x.name}
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-[8px] border p-4 md:p-6" style={{ background: C.card, borderColor: C.line }}>
          <CorneaDiagram key={pick} kind={pick} reduce={reduce} />
          <p className="mt-3 text-[16px] leading-[1.7]">
            <b>{s.name}</b> {s.how}
          </p>
        </div>

        <div className="mt-6" aria-label={`${s.name} 회복 기간`}>
          <p className="text-[15px] font-bold">회복 기간</p>
          <div className="relative mt-3 h-[44px]">
            <div className="absolute inset-x-0 top-[10px] h-[10px] rounded-full" style={{ background: C.tealSoft }} />
            <motion.div
              className="absolute left-0 top-[10px] h-[10px] w-full rounded-full"
              style={{ background: C.tealMid, originX: 0 }}
              initial={false}
              animate={{ scaleX: axisPos(rec.stable) }}
              transition={t}
            />
            <motion.div className="absolute left-0 top-[10px] h-[10px] w-full rounded-full" style={{ background: C.teal, originX: 0 }} initial={false} animate={{ scaleX: Math.max(0.03, axisPos(rec.back)) }} transition={t} />
            {AXIS.map(([d, label], i) => (
              <span
                key={d}
                className={`absolute top-[26px] whitespace-nowrap text-[12px] ${i === 0 ? "" : i === AXIS.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`}
                style={{ left: `${axisPos(d) * 100}%`, color: C.muted }}
              >
                {label}
              </span>
            ))}
          </div>
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[15px]">
            <div className="inline-flex items-center gap-2">
              <span aria-hidden className="inline-block h-3 w-6 rounded-full" style={{ background: C.teal }} />
              <dt>일상생활</dt>
              <dd className="font-bold">{COMPARE_ROWS[2].v[idx]}</dd>
            </div>
            <div className="inline-flex items-center gap-2">
              <span aria-hidden className="inline-block h-3 w-6 rounded-full" style={{ background: C.tealMid }} />
              <dt>시력 안정</dt>
              <dd className="font-bold">{COMPARE_ROWS[3].v[idx]}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div>
        <div className="overflow-hidden rounded-[8px] border" style={{ background: C.card, borderColor: C.line }}>
          <table className="w-full table-fixed border-collapse text-[13px] md:text-[15px]">
            <caption className="sr-only">라식, 라섹, 스마일라식 비교표</caption>
            <colgroup>
              <col className="w-[24%]" />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="px-2 py-3 text-left font-normal md:px-4" style={{ color: C.muted }}>
                  구분
                </th>
                {SURGERIES.map((x, i) => (
                  <th key={x.id} scope="col" className="p-1 md:p-2" style={{ background: i === idx ? C.tealSoft : undefined }}>
                    <button
                      type="button"
                      onClick={() => setPick(x.id)}
                      aria-pressed={i === idx}
                      className={`w-full rounded-[6px] px-1 py-2 font-bold ${focusRing}`}
                      style={{ color: i === idx ? C.teal : C.text, outlineColor: C.teal, textDecoration: i === idx ? "underline" : undefined, textUnderlineOffset: 5 }}
                    >
                      {x.name}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.label} className="border-t" style={{ borderColor: C.line }}>
                  <th scope="row" className="px-2 py-3 text-left font-normal md:px-4" style={{ color: C.muted }}>
                    {row.label}
                  </th>
                  {row.v.map((v, i) => (
                    <td key={i} className="px-1 py-3 text-center leading-snug tracking-[-0.02em] transition-colors md:px-2 md:tracking-normal" style={{ background: i === idx ? C.tealSoft : undefined, fontWeight: i === idx ? 700 : 400 }}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[14px] leading-[1.7]" style={{ color: C.muted }}>
          회복 기간은 사람마다 달라요. 수술 뒤 빛 번짐, 안구건조, 시력 퇴행이 생길 수 있어요.
        </p>
      </div>
    </div>
  );
}

/** 각막 단면. 수술마다 무엇이 열리고 빠지는지 */
function CorneaDiagram({ kind, reduce }: { kind: Surgery; reduce: boolean }) {
  const t = (d: number, delay = 0) => (reduce ? { duration: 0 } : { duration: d, delay, ease: EASE });
  const label = kind === "lasik" ? "각막 절편이 열리고 레이저가 비치는 단면 그림" : kind === "lasek" ? "각막 상피가 벗겨지고 레이저가 비치는 단면 그림" : "각막 속 조직이 작은 절개로 빠져나오는 단면 그림";
  // 바깥 곡선 Q(20,140)(160,10)(300,140)의 가운데 구간(t 0.18~0.82)과 양 끝 구간
  const CENTER = "M70.4 101.6 Q160 48.4 249.6 101.6";
  return (
    <svg viewBox="0 0 320 170" className="mx-auto block h-auto w-full max-w-[460px]" role="img" aria-label={label}>
      <defs>
        <linearGradient id="ec-stroma" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3ebea" />
          <stop offset="1" stopColor="#bccfcc" />
        </linearGradient>
        <linearGradient id="ec-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.teal} stopOpacity="0" />
          <stop offset="1" stopColor={C.teal} stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="164" rx="130" ry="5" fill="#000" fillOpacity="0.08" />
      {/* 실질 */}
      <path d="M20 140 Q160 10 300 140 L296 158 Q160 50 24 158 Z" fill="url(#ec-stroma)" />
      <path d="M40 128 Q160 30 280 128" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.5" />
      {/* 양 끝 상피 */}
      <path d="M20 140 Q45.2 116.6 70.4 101.6 M249.6 101.6 Q274.8 116.6 300 140" fill="none" stroke="#b9b4a8" strokeWidth="4" />
      <text x="292" y="120" fontSize="10" textAnchor="end" fill={C.muted}>
        상피
      </text>
      <text x="160" y="96" fontSize="10" textAnchor="middle" fill={C.teal}>
        실질
      </text>

      {kind === "lasik" && (
        <>
          <motion.path d="M100 78 L160 84 L220 78" fill="none" stroke={C.teal} strokeWidth="1.5" strokeDasharray="3 3" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={t(0.3, 0.9)} />
          <motion.polygon points="160,0 128,80 192,80" fill="url(#ec-beam)" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 0.7 }} transition={t(0.8, 0.9)} />
          <motion.g style={{ originX: 0, originY: 1 }} initial={reduce ? false : { rotate: 0 }} animate={{ rotate: -26 }} transition={t(0.8, 0.15)}>
            <path d="M70.4 106 Q160 53 249.6 106" fill="none" stroke="#cbdad8" strokeWidth="8" strokeLinecap="round" />
            <path d={CENTER} fill="none" stroke="#b9b4a8" strokeWidth="4" />
          </motion.g>
          <text x="66" y="122" fontSize="10" textAnchor="middle" fill={C.text}>
            절편
          </text>
        </>
      )}

      {kind === "lasek" && (
        <>
          <motion.polygon points="160,0 128,80 192,80" fill="url(#ec-beam)" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 0.7 }} transition={t(0.8, 0.8)} />
          <motion.path d={CENTER} fill="none" stroke="#b9b4a8" strokeWidth="4" initial={reduce ? false : { y: 0, opacity: 1 }} animate={{ y: -28, opacity: 0 }} transition={t(0.8, 0.15)} />
        </>
      )}

      {kind === "smile" && (
        <>
          <path d={CENTER} fill="none" stroke="#b9b4a8" strokeWidth="4" />
          <path d="M236 95 L246 106" stroke={C.text} strokeWidth="2" strokeLinecap="round" />
          {/* 조직이 빠진 자리 */}
          <path d="M118 92 Q160 77 202 92 Q160 103 118 92 Z" fill="none" stroke={C.teal} strokeWidth="1.2" strokeDasharray="3 3" />
          <text x="252" y="92" fontSize="10" fill={C.text}>
            절개 2~4mm
          </text>
          <motion.path
            d="M118 92 Q160 77 202 92 Q160 103 118 92 Z"
            fill={C.teal}
            fillOpacity="0.55"
            stroke={C.teal}
            strokeWidth="1"
            initial={reduce ? false : { x: 0, y: 0, opacity: 1 }}
            animate={reduce ? { x: 0, y: 0, opacity: 0.35 } : { x: [0, 0, 80], y: [0, 0, 16], opacity: [1, 1, 0] }}
            transition={reduce ? { duration: 0 } : { duration: 1.4, delay: 0.2, ease: EASE, times: [0, 0.35, 1] }}
          />
        </>
      )}
    </svg>
  );
}

/* ---------- 2. 수술 전 정밀검사 ---------- */

function ExamSteps({ reduce, onBook }: { reduce: boolean; onBook: () => void }) {
  const [step, setStep] = useState(0);
  const done = EXAM_STEPS.slice(0, step + 1).reduce((a, s) => a + s.min, 0);
  const startAt = done - EXAM_STEPS[step].min;
  const t = { duration: reduce ? 0 : DUR, ease: EASE };
  const dilated = step >= DILATE_STEP;
  const R = 66;
  const CIRC = 2 * Math.PI * R;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
      <ol className="grid gap-1.5" aria-label="정밀검사 순서">
        {EXAM_STEPS.map((s, i) => {
          const on = i === step;
          return (
            <li key={s.name}>
              <button
                type="button"
                aria-current={on ? "step" : undefined}
                onClick={() => setStep(i)}
                className={`flex w-full items-center gap-3 rounded-[8px] border px-3 py-2.5 text-left transition-colors md:px-4 ${focusRing}`}
                style={{ background: on ? C.teal : C.card, color: on ? "#fff" : C.text, borderColor: on ? C.teal : C.line, outlineColor: C.teal }}
              >
                <span
                  className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-full text-[13px] font-bold"
                  style={{ background: on ? "#fff" : i < step ? C.tealSoft : C.paper, color: C.teal }}
                >
                  {i < step ? <Check size={15} aria-label="지난 단계" /> : i + 1}
                </span>
                <span className="min-w-0 flex-1 text-[16px] font-bold">{s.name}</span>
                <span className="flex-none text-[14px]" style={{ opacity: 0.85 }}>
                  {s.min}분
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="rounded-[8px] border p-5 md:p-7" style={{ background: C.card, borderColor: C.line }}>
        <div className="flex flex-wrap items-center gap-6">
          <svg viewBox="0 0 160 160" className="h-[150px] w-[150px] flex-none" role="img" aria-label={`검사 시작 후 ${hm(done)} 지점, ${dilated ? "동공을 키운 상태" : "평소 동공"}`}>
            <defs>
              <radialGradient id="ec-mini-iris" cx="0.45" cy="0.42" r="0.6">
                <stop offset="0" stopColor="#8f8a7e" />
                <stop offset="0.45" stopColor="#56706d" />
                <stop offset="1" stopColor="#2d3d3b" />
              </radialGradient>
            </defs>
            <circle cx="80" cy="80" r={R} fill="none" stroke={C.tealSoft} strokeWidth="9" />
            <motion.circle
              cx="80"
              cy="80"
              r={R}
              fill="none"
              stroke={C.teal}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              transform="rotate(-90 80 80)"
              initial={false}
              animate={{ strokeDashoffset: CIRC * (1 - done / EXAM_TOTAL) }}
              transition={t}
            />
            <circle cx="80" cy="80" r="44" fill="url(#ec-mini-iris)" />
            <motion.circle cx="80" cy="80" fill="#111111" initial={false} animate={{ r: dilated ? 30 : 14 }} transition={{ duration: reduce ? 0 : 1.1, ease: EASE }} />
            <ellipse cx="66" cy="64" rx="8" ry="5" fill="#fff" fillOpacity="0.8" transform="rotate(-30 66 64)" />
          </svg>
          <div className="min-w-0">
            <p className="text-[14px]" style={{ color: C.muted }}>
              시작 후
            </p>
            <p className="text-[30px] font-bold leading-tight" style={{ color: C.teal }}>
              {hm(done)}
            </p>
            <p className="text-[14px]" style={{ color: C.muted }}>
              전체 약 {hm(EXAM_TOTAL)}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? { opacity: 1 } : { opacity: 0 }} transition={{ duration: reduce ? 0 : DUR_FAST }} className="mt-5">
            <h3 className="text-[20px] font-bold">
              {step + 1}. {EXAM_STEPS[step].name}
              <span className="ml-2 text-[14px] font-normal" style={{ color: C.muted }}>
                {startAt === 0 ? "도착하면 바로" : `${hm(startAt)} 지나서`}
              </span>
            </h3>
            <p className="mt-2 text-[16px] leading-[1.7]">{EXAM_STEPS[step].body}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 rounded-[8px] p-4" style={{ background: C.paper }}>
          <p className="inline-flex items-center gap-1.5 text-[15px] font-bold">
            <AlertCircle size={17} aria-hidden style={{ color: C.teal }} />
            검사 전 렌즈 빼는 시기
          </p>
          <dl className="mt-2 grid gap-1 text-[15px]">
            {PREP.map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-x-3">
                <dt>{k}</dt>
                <dd className="font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 inline-flex items-start gap-1.5 text-[15px] leading-[1.6]">
            <Car size={17} aria-hidden className="mt-0.5 flex-none" />
            산동 검사 뒤에는 운전이 어려워요. 대중교통으로 오세요.
          </p>
        </div>

        <button
          type="button"
          onClick={onBook}
          data-gtm-cta="eye-clinic_exam_book"
          className={`mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[8px] px-5 text-[16px] font-bold text-white sm:w-auto ${focusRing}`}
          style={{ background: C.teal, outlineColor: C.teal }}
        >
          <CalendarCheck size={18} aria-hidden />
          정밀검사 예약하기
        </button>
      </div>
    </div>
  );
}

/* ---------- 3. 백내장 ---------- */

function Cataract({ reduce }: { reduce: boolean }) {
  const [lens, setLens] = useState<Lens>("cataract");
  const v = VISION[lens];
  const info = LENSES.find((l) => l.id === lens) ?? LENSES[0];
  const t = { duration: reduce ? 0 : 0.7, ease: EASE };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12">
      <div>
        <div role="group" aria-label="보이는 모습 고르기" className="flex flex-wrap gap-2">
          {LENSES.map((l) => {
            const on = l.id === lens;
            return (
              <button
                key={l.id}
                type="button"
                aria-pressed={on}
                onClick={() => setLens(l.id)}
                className={`min-h-11 rounded-[6px] border px-4 text-[15px] font-bold transition-colors md:px-5 md:text-[16px] ${focusRing}`}
                style={{ background: on ? C.teal : C.card, color: on ? "#fff" : C.text, borderColor: on ? C.teal : C.line, outlineColor: C.teal }}
              >
                {l.name}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 md:gap-3" aria-live="polite">
          {DISTANCES.map((d, i) => (
            <figure key={d} className="relative overflow-hidden rounded-[8px] border" style={{ background: "#eef3f2", borderColor: C.line }}>
              <motion.div initial={false} animate={{ filter: `blur(${v.blur[i]}px)` }} transition={t} className="aspect-[3/4]">
                <VisionThing i={i} />
              </motion.div>
              <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "#e9dcb4" }} initial={false} animate={{ opacity: v.haze }} transition={t} />
              <figcaption className="relative border-t px-2 py-2 text-center text-[13px] md:text-[14px]" style={{ background: C.card, borderColor: C.line }}>
                {d}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-3 text-[15px] leading-[1.7]">
          <b>{info.name}</b> {info.note}
        </p>
        <p className="mt-1 text-[13px]" style={{ color: C.muted }}>
          예시 그림이에요. 렌즈는 검사 뒤 생활 습관에 맞춰 정해요.
        </p>
      </div>

      <div className="grid content-start gap-5">
        <div className="rounded-[8px] border p-5" style={{ background: C.card, borderColor: C.line }}>
          <h3 className="text-[18px] font-bold">
            이럴 때 검사 받아 보세요
          </h3>
          <ul className="mt-3 grid gap-2 text-[15px]">
            {CATARACT_SIGNS.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <Check size={17} aria-hidden className="mt-0.5 flex-none" style={{ color: C.teal }} />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border text-[15px]" style={{ background: C.line, borderColor: C.line }}>
          {[
            ["수술 시간", "한쪽 눈 15~20분"],
            ["입원", "없이 당일 귀가"],
            ["단초점 렌즈", "건강보험 적용"],
            ["다초점 렌즈", "비급여"],
          ].map(([k, val]) => (
            <div key={k} className="p-4" style={{ background: C.card }}>
              <dt style={{ color: C.muted }}>{k}</dt>
              <dd className="mt-1 font-bold">{val}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/** 거리별 예시 사물. 0 휴대폰 문자, 1 모니터 달력, 2 버스 정류장 표지판 */
function VisionThing({ i }: { i: number }) {
  if (i === 0)
    return (
      <svg viewBox="0 0 120 160" className="h-full w-full" aria-hidden>
        <rect x="26" y="14" width="68" height="132" rx="10" fill="#2a2a2a" />
        <rect x="31" y="22" width="58" height="116" rx="4" fill="#f9fbfb" />
        <rect x="36" y="32" width="38" height="12" rx="6" fill={C.tealSoft} />
        <rect x="46" y="50" width="38" height="12" rx="6" fill={C.teal} />
        <rect x="36" y="68" width="30" height="12" rx="6" fill={C.tealSoft} />
        <text x="60" y="104" fontSize="9" textAnchor="middle" fill={C.text}>
          내일 오전 10시
        </text>
        <text x="60" y="118" fontSize="9" textAnchor="middle" fill={C.text}>
          약 드세요
        </text>
      </svg>
    );
  if (i === 1)
    return (
      <svg viewBox="0 0 120 160" className="h-full w-full" aria-hidden>
        <rect x="12" y="40" width="96" height="66" rx="5" fill="#2a2a2a" />
        <rect x="17" y="45" width="86" height="56" rx="2" fill="#f9fbfb" />
        {Array.from({ length: 15 }, (_, k) => (
          <text key={k} x={26 + (k % 5) * 17} y={60 + Math.floor(k / 5) * 15} fontSize="9" textAnchor="middle" fill={k === 7 ? C.teal : C.text} fontWeight={k === 7 ? 700 : 400}>
            {k + 8}
          </text>
        ))}
        <rect x="54" y="106" width="12" height="18" fill="#3a4747" />
        <rect x="38" y="124" width="44" height="5" rx="2" fill="#3a4747" />
      </svg>
    );
  return (
    <svg viewBox="0 0 120 160" className="h-full w-full" aria-hidden>
      <rect x="0" y="118" width="120" height="42" fill="#d7dfdd" />
      <rect x="57" y="56" width="6" height="74" fill="#5b6767" />
      <rect x="26" y="20" width="68" height="40" rx="5" fill={C.teal} />
      <text x="60" y="38" fontSize="11" textAnchor="middle" fill="#fff" fontWeight="700">
        ㅇㅇ역
      </text>
      <text x="60" y="52" fontSize="9" textAnchor="middle" fill="#fff">
        버스 7번
      </text>
    </svg>
  );
}

/* ---------- 비급여 진료비 ---------- */

function Fees() {
  return (
    <div className="overflow-hidden rounded-[8px] border" style={{ background: C.card, borderColor: C.line }}>
      <table className="w-full border-collapse text-[15px]">
        <caption className="sr-only">비급여 진료비 목록</caption>
        <thead style={{ background: C.tealSoft }}>
          <tr>
            <th scope="col" className="px-3 py-3 text-left md:px-5">
              항목
            </th>
            <th scope="col" className="px-2 py-3 text-left">
              기준
            </th>
            <th scope="col" className="px-3 py-3 text-right md:px-5">
              금액
            </th>
          </tr>
        </thead>
        <tbody>
          {FEES.map((f) => (
            <tr key={f.item} className="border-t" style={{ borderColor: C.line }}>
              <th scope="row" className="px-3 py-3 text-left font-normal md:px-5">
                {f.item}
              </th>
              <td className="whitespace-nowrap px-2 py-3" style={{ color: C.muted }}>
                {f.unit}
              </td>
              <td className="px-3 py-3 text-right font-bold tabular-nums md:px-5">
                {f.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t px-3 py-3 text-[14px] md:px-5" style={{ borderColor: C.line, color: C.muted }}>
        의료법 제45조에 따라 비급여 진료비용을 안내해요. 부가세 없음.
      </p>
    </div>
  );
}

/* ---------- 의료진, 진료시간, 오시는 길 ---------- */

function HoursAndMap({ today }: { today: Date }) {
  const dow = today.getDay();
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="grid content-start gap-3">
        {DOCTORS.map((d) => (
          <div key={d.name} className="flex items-center gap-4 rounded-[8px] border p-4" style={{ background: C.card, borderColor: C.line }}>
            <span aria-hidden className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-full" style={{ background: C.tealSoft, color: C.teal }}>
              <Eye size={22} />
            </span>
            <div>
              <p className="text-[18px] font-bold">
                {d.name} <span className="text-[15px] font-normal">{d.role}</span>
              </p>
              <p className="text-[14px]" style={{ color: C.muted }}>
                안과 전문의, {d.field}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[8px] border p-5" style={{ background: C.card, borderColor: C.line }}>
        <h3 className="inline-flex items-center gap-1.5 text-[18px] font-bold">
          <Clock size={18} aria-hidden style={{ color: C.teal }} />
          진료시간
        </h3>
        <ul className="mt-3 grid gap-1 text-[15px]">
          {HOURS.map((h) => {
            const on = h.dow === dow;
            return (
              <li key={h.dow} className="flex justify-between gap-3 rounded-[6px] px-2 py-1.5" style={{ background: on ? C.tealSoft : undefined, fontWeight: on ? 700 : 400 }}>
                <span>
                  {h.label}
                  {on && <span className="ml-1.5 text-[13px]" style={{ color: C.teal }}>오늘</span>}
                </span>
                <span className="tabular-nums">{h.open}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
          점심시간 13:00 ~ 14:00, 공휴일 휴진
        </p>
      </div>

      <div className="overflow-hidden rounded-[8px] border" style={{ background: C.card, borderColor: C.line }}>
        <svg viewBox="0 0 300 170" className="block h-auto w-full" role="img" aria-label="ㅇㅇ역 2번 출구에서 큰길을 따라 걸어 두 번째 건물에 있는 병원 위치 약도">
          <rect width="300" height="170" fill="#f1f1ef" />
          <rect x="0" y="74" width="300" height="22" fill="#fff" />
          <rect x="132" y="0" width="18" height="170" fill="#fff" />
          {[
            [16, 14, 96, 48],
            [16, 108, 96, 50],
            [164, 14, 60, 48],
            [236, 14, 50, 48],
            [164, 108, 122, 50],
          ].map(([x, y, w, h], k) => (
            <rect key={k} x={x} y={y} width={w} height={h} rx="3" fill={k === 3 ? C.teal : "#dcdcd8"} />
          ))}
          <text x="261" y="42" fontSize="11" textAnchor="middle" fill="#fff" fontWeight="700">
            병원
          </text>
          <circle cx="120" cy="85" r="8" fill={C.text} />
          <text x="120" y="88.5" fontSize="9" textAnchor="middle" fill="#fff" fontWeight="700">
            2
          </text>
          <path d="M128 85 L250 85 L258 66" fill="none" stroke={C.teal} strokeWidth="2.5" strokeDasharray="5 4" strokeLinecap="round" />
          <text x="60" y="89" fontSize="10" textAnchor="middle" fill={C.text}>
            ㅇㅇ역
          </text>
        </svg>
        <div className="grid gap-1.5 p-4 text-[15px]">
          <p className="inline-flex items-start gap-1.5">
            <MapPin size={17} aria-hidden className="mt-0.5 flex-none" style={{ color: C.teal }} />
            {ADDRESS}, ㅇㅇ역 2번 출구 도보 3분
          </p>
          <p className="inline-flex items-start gap-1.5">
            <Car size={17} aria-hidden className="mt-0.5 flex-none" style={{ color: C.teal }} />
            건물 지하 주차 가능, 진료 시 2시간 무료
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- 4. 상담 예약 ---------- */

type Done = { no: string; name: string; phone: string; field: Field; date: Date; time: string };

function Booking({ today, reduce }: { today: Date; reduce: boolean }) {
  const days = useMemo(() => {
    const out: Date[] = [];
    for (let k = 1; out.length < 12; k++) {
      const d = daysAgo(today, -k);
      if (d.getDay() !== 0) out.push(d);
    }
    return out;
  }, [today]);

  const [field, setField] = useState<Field>("시력교정 정밀검사");
  const [dayIdx, setDayIdx] = useState(0);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const day = days[Math.min(dayIdx, days.length - 1)];
  const slots = slotsFor(day);
  const digits = phone.replace(/\D/g, "");
  const errors = {
    time: !time ? "시간을 골라 주세요" : "",
    name: name.trim().length < 2 ? "이름을 두 글자 이상 적어 주세요" : "",
    phone: !/^01\d{8,9}$/.test(digits) ? "휴대폰 번호를 확인해 주세요" : "",
    agree: !agree ? "개인정보 수집에 동의해 주세요" : "",
  };
  const ok = !Object.values(errors).some(Boolean);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok || !time) return;
    const n = (day.getDate() * 37 + Number(time.slice(0, 2)) * 11 + digits.length * 3) % 900;
    setDone({
      no: `EC-${String(day.getFullYear()).slice(2)}${p2(day.getMonth() + 1)}${p2(day.getDate())}-${100 + n}`,
      name: maskName(name),
      phone: maskPhone(phone),
      field,
      date: day,
      time,
    });
  };
  const reset = () => {
    setDone(null);
    setTime(null);
    setName("");
    setPhone("");
    setAgree(false);
    setTried(false);
  };

  const err = (k: keyof typeof errors) =>
    tried && errors[k] ? (
      <p id={`ec-err-${k}`} className="mt-1.5 inline-flex items-center gap-1 text-[14px]" style={{ color: C.error }}>
        <AlertCircle size={15} aria-hidden />
        {errors[k]}
      </p>
    ) : null;
  const input = `mt-1.5 block min-h-12 w-full rounded-[8px] border px-3 text-[16px] ${focusRing}`;

  return (
    <div className="overflow-hidden rounded-[8px] border" style={{ background: C.card, borderColor: C.line }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : DUR_FAST }} className="grid gap-6 p-5 md:grid-cols-[auto_1fr] md:p-8" role="status">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full" style={{ background: C.tealSoft, color: C.teal }}>
              <Check size={28} aria-hidden />
            </span>
            <div>
              <h3 className="text-[24px] font-bold">
                예약 신청이 접수됐어요
              </h3>
              <dl className="mt-4 grid gap-x-8 gap-y-2 text-[16px] sm:grid-cols-[auto_1fr]">
                <dt style={{ color: C.muted }}>예약번호</dt>
                <dd className="font-bold tabular-nums">
                  {done.no}
                </dd>
                <dt style={{ color: C.muted }}>예약 내용</dt>
                <dd>
                  {done.field}, {fmtKo(done.date)} {done.time}
                </dd>
                <dt style={{ color: C.muted }}>신청하신 분</dt>
                <dd>
                  {done.name}, {done.phone}
                </dd>
                <dt style={{ color: C.muted }}>담당 창구</dt>
                <dd>
                  {KAKAO} 또는 전화 {TEL}
                </dd>
                <dt style={{ color: C.muted }}>확인 연락</dt>
                <dd>{fmtKo(today.getDay() === 0 ? nextBizDay(today) : today)} 진료시간 안에 확인 문자를 보내 드려요</dd>
              </dl>
              {done.field === "시력교정 정밀검사" && (
                <p className="mt-4 rounded-[8px] p-3 text-[15px] leading-[1.6]" style={{ background: C.paper }}>
                  소프트렌즈는 검사 1주 전부터 빼 주세요. 산동 검사가 있어 차는 두고 오시는 게 좋아요.
                </p>
              )}
              <button type="button" onClick={reset} className={`mt-5 inline-flex min-h-11 items-center gap-1.5 rounded-[8px] border px-4 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.teal }}>
                <RotateCcw size={16} aria-hidden />
                다른 시간 예약하기
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : DUR_FAST }} className="grid gap-8 p-5 md:p-8 lg:grid-cols-2 lg:gap-12">
            <div className="grid content-start gap-6">
              <fieldset>
                <legend className="text-[16px] font-bold">진료 분야</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FIELDS.map((f) => {
                    const on = f === field;
                    return (
                      <label key={f} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[6px] border px-4 text-[15px] has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2`} style={{ background: on ? C.teal : C.card, color: on ? "#fff" : C.text, borderColor: on ? C.teal : C.line, outlineColor: C.teal }}>
                        <input type="radio" name="ec-field" value={f} checked={on} onChange={() => setField(f)} className="sr-only" />
                        {on && <Check size={15} aria-hidden />}
                        {f}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-[16px] font-bold">날짜</legend>
                <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                  {days.map((d, i) => {
                    const on = i === dayIdx;
                    return (
                      <button
                        key={d.getTime()}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setDayIdx(i);
                          setTime(null);
                        }}
                        className={`flex min-h-14 flex-col items-center justify-center rounded-[8px] border text-[14px] leading-tight ${focusRing}`}
                        style={{ background: on ? C.teal : C.card, color: on ? "#fff" : C.text, borderColor: on ? C.teal : C.line, outlineColor: C.teal }}
                      >
                        <span className="tabular-nums">
                          {d.getMonth() + 1}.{d.getDate()}
                        </span>
                        <span className={d.getDay() === 6 ? "font-bold" : ""}>{"일월화수목금토"[d.getDay()]}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset aria-describedby={tried && errors.time ? "ec-err-time" : undefined}>
                <legend className="text-[16px] font-bold">
                  시간 <span className="text-[14px] font-normal" style={{ color: C.muted }}>{fmtKo(day)}</span>
                </legend>
                <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                  {slots.map((s, i) => {
                    const full = isTaken(day, i);
                    const on = s === time;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={full}
                        aria-pressed={on}
                        aria-label={full ? `${s} 예약 마감` : s}
                        onClick={() => setTime(s)}
                        className={`min-h-11 rounded-[8px] border text-[14px] disabled:cursor-not-allowed ${focusRing}`}
                        style={{
                          background: on ? C.teal : full ? C.paper : C.card,
                          color: on ? "#fff" : full ? C.muted : C.text,
                          borderColor: on ? C.teal : C.line,
                          textDecoration: full ? "line-through" : undefined,
                          outlineColor: C.teal,
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {err("time")}
              </fieldset>
            </div>

            <div className="grid content-start gap-5">
              <label className="block text-[16px] font-bold">
                이름
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={tried && !!errors.name} aria-describedby={tried && errors.name ? "ec-err-name" : undefined} className={input} style={{ borderColor: C.line, outlineColor: C.teal }} />
              </label>
              {err("name")}
              <label className="block text-[16px] font-bold">
                휴대폰
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="010-0000-0000"
                  aria-invalid={tried && !!errors.phone}
                  aria-describedby={tried && errors.phone ? "ec-err-phone" : undefined}
                  className={input}
                  style={{ borderColor: C.line, outlineColor: C.teal }}
                />
              </label>
              {err("phone")}
              <label className="flex items-start gap-2 text-[15px]">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`mt-1 h-5 w-5 flex-none ${focusRing}`} style={{ accentColor: C.teal, outlineColor: C.teal }} aria-describedby={tried && errors.agree ? "ec-err-agree" : undefined} />
                <span>예약 확인을 위한 개인정보(이름, 휴대폰) 수집에 동의합니다</span>
              </label>
              {err("agree")}

              <div className="rounded-[8px] p-4 text-[15px]" style={{ background: C.paper }}>
                <p className="font-bold">{time ? `${fmtKo(day)} ${time}` : "시간을 고르면 여기에 표시돼요"}</p>
                <p className="mt-1" style={{ color: C.body }}>
                  {field}
                  {field === "시력교정 정밀검사" ? `, 약 ${hm(EXAM_TOTAL)}` : ""}
                </p>
              </div>

              <button
                type="submit"
                data-gtm-cta="eye-clinic_book_submit"
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[8px] px-5 text-[17px] font-bold text-white ${focusRing}`}
                style={{ background: C.teal, outlineColor: C.teal }}
              >
                <CalendarCheck size={19} aria-hidden />
                예약하기
              </button>
              <p className="inline-flex items-center gap-1.5 text-[14px]" style={{ color: C.muted }}>
                <MessageCircle size={15} aria-hidden />
                급하면 {KAKAO}이나 전화 {TEL}
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
