"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Award, Bus, CalendarCheck, Check, Clock, MapPin, MessageCircle, Phone, ShieldCheck, Users } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 태권도장 홈페이지 샘플: 가상의 태권도장 곰파트너. 유치부, 초등부, 중고등부, 성인부를 가르친다.
   상호, 관장과 사범 이름, 주소, 전화번호, 학교와 아파트 이름, 손님 이름은 모두 가상이다.
   첫 화면 사진 출처: AI 생성(Z-Image-Turbo, Apache 2.0)

   국내 태권도장 사이트 공통 구성(참고): 메뉴는 도장 소개, 관장 인사말, 수련 프로그램(유치부, 초등부, 중고등부, 성인부),
   수련 시간표, 차량 운행, 승급 심사, 공지사항, 상담 문의, 오시는 길. 학부모가 제일 먼저 찾는 건 차량 운행 노선과
   탑승 시간이라 첫 화면 가까이에 둔다. 요일별 수련 내용(품새, 발차기, 겨루기, 줄넘기, 태권체조)과 월 수련비,
   어린이 통학버스 신고와 보호자 동승, 체험 수업 1회 무료 같은 문구를 그대로 쓴다.

   핵심 모션: 첫 화면(tk-poster)은 흰 도복에 검은 띠를 맨 수련생 사진 한 장이 화면을 채운다.
   들어올 때 사진이 1.06배에서 1배로 천천히 다가오고, 문장 "학교 앞까지 차량 운행"와 정보 줄이 조금 늦게
   아래에서 올라온다(CSS keyframes). 스크롤하면 사진만 조금 느리게 움직인다.
   본문에서는 정류장을 고르면 차 표시가 그 자리로 미끄러져 간다. 동작 줄이기면 모두 바로 바뀐다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 차량 운행: 호차와 부를 고르면 정류장별 등원 탑승 시간과 하원 도착 시간이 나오고, 정류장을 고르면 차가 그 자리로 간다.
   2. 부별 시간표: 부를 고르면 그 부의 줄이 칠해지고 요일별 수련 내용과 월 수련비가 보인다.
   3. 승급 심사: 지금 띠를 고르면 다음 띠, 심사 품새와 항목, 다음 심사일과 신청 마감일이 나온다.
   4. 상담 신청: 구분, 상담 방법, 차량 이용, 희망일, 보호자 이름과 연락처. 완료 화면에 접수 번호, 담당 창구, 회신 예정일. */

const BRAND = "곰파트너";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 2층";
const IMG = "/images/demo-taekwondo";

/* 색. 바탕은 흰색과 옅은 회색을 번갈아 쓰고 강조색은 짙은 빨강 하나 */
const STAFF = [
  { id: "1", name: "정ㄷ현", role: "관장", note: "공인 6단, 국기원 사범 자격, 지도 18년" },
  { id: "2", name: "한ㅅ우", role: "사범", note: "공인 4단, 초등부 담당, 차량 운행 동승" },
  { id: "3", name: "오ㅈ민", role: "사범", note: "공인 4단, 품새 선수 출신, 유치부 담당" },
];

const C = {
  bg: "#ffffff",
  paper: "#f7f7f5",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  accent: "#9b2c2c",
  accentSoft: "#f6eeee",
  dark: "#141414",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 칠하기, 차 이동, 완료 화면 전환 */
const DUR = 0.35;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const hm = (m: number) => `${Math.floor(m / 60)}:${p2(m % 60)}`;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- 차량 운행 ---------- */

type Stop = { name: string; off: number; note?: string };
type Route = { id: string; label: string; area: string; stops: Stop[] };

/** off 는 첫 정류장에서 그 정류장까지 걸리는 분. 마지막은 도장 */
const ROUTES: Route[] = [
  {
    id: "1",
    label: "1호차",
    area: "학교 방면",
    stops: [
      { name: "ㅎㄷ초등학교 정문", off: 0, note: "정문 횡단보도 앞" },
      { name: "ㄱㅁ초등학교 후문", off: 7, note: "후문 문구점 앞" },
      { name: "ㅎㄷ유치원 앞", off: 12 },
      { name: "도장 도착", off: 18 },
    ],
  },
  {
    id: "2",
    label: "2호차",
    area: "아파트 방면",
    stops: [
      { name: "ㅅㅁ아파트 정문", off: 0, note: "경비실 앞" },
      { name: "ㅅㅁ아파트 상가 앞", off: 4 },
      { name: "ㄷㅅ초등학교 정문", off: 10, note: "정문 횡단보도 앞" },
      { name: "ㅇㄹ빌라 앞", off: 15 },
      { name: "도장 도착", off: 21 },
    ],
  },
];

/** 차량을 타는 부. 시작 시각은 분 */
const BUS_CLASSES = [
  { id: "k", label: "유치부", start: 13 * 60 + 30 },
  { id: "e1", label: "초등 1부", start: 14 * 60 + 30 },
  { id: "e2", label: "초등 2부", start: 15 * 60 + 30 },
  { id: "e3", label: "초등 3부", start: 16 * 60 + 30 },
  { id: "e4", label: "초등 4부", start: 17 * 60 + 30 },
];
const CLASS_MIN = 50;
/** 수업 시작 몇 분 전에 도장에 내리는지, 수업 끝나고 몇 분 뒤 출발하는지 */
const ARRIVE_BEFORE = 8;
const LEAVE_AFTER = 5;
const STOP_ROW = 64;

/* ---------- 시간표 ---------- */

type Part = "유치부" | "초등부" | "중고등부" | "성인부";
const PARTS: Part[] = ["유치부", "초등부", "중고등부", "성인부"];

const KIDS_WEEK = ["품새", "발차기", "겨루기", "줄넘기", "태권체조"];
const ROWS: { part: Part; label: string; time: string; week: string[] }[] = [
  { part: "유치부", label: "유치부", time: "13:30 ~ 14:20", week: ["품새", "놀이체육", "발차기", "줄넘기", "태권체조"] },
  { part: "초등부", label: "초등 1부", time: "14:30 ~ 15:20", week: KIDS_WEEK },
  { part: "초등부", label: "초등 2부", time: "15:30 ~ 16:20", week: KIDS_WEEK },
  { part: "초등부", label: "초등 3부", time: "16:30 ~ 17:20", week: KIDS_WEEK },
  { part: "초등부", label: "초등 4부", time: "17:30 ~ 18:20", week: KIDS_WEEK },
  { part: "중고등부", label: "중고등부", time: "19:00 ~ 19:50", week: ["품새", "", "겨루기", "", "체력"] },
  { part: "성인부", label: "성인부", time: "20:30 ~ 21:30", week: ["품새", "체력", "겨루기", "체력", "품새"] },
];

const FEES: Record<Part, { per: string; fee: number; bus: boolean }> = {
  유치부: { per: "주 5회", fee: 150000, bus: true },
  초등부: { per: "주 5회", fee: 160000, bus: true },
  중고등부: { per: "주 3회", fee: 140000, bus: false },
  성인부: { per: "주 3회", fee: 120000, bus: false },
};

/* ---------- 승급 심사 ---------- */

type BeltStep = { name: string; color: string; edge: string; next: string; poomsae: string; items: string; period: string };

const BELT_STEPS: BeltStep[] = [
  { name: "흰띠", color: "#f4f3ef", edge: "#bdb9ae", next: "노랑띠", poomsae: "태극 1장", items: "기본 동작, 앞차기, 줄넘기 20개", period: "입관하고 2개월 안팎" },
  { name: "노랑띠", color: "#f5c518", edge: "#b98c00", next: "초록띠", poomsae: "태극 2장", items: "앞차기, 돌려차기, 줄넘기 50개", period: "2개월 안팎" },
  { name: "초록띠", color: "#2f8f4e", edge: "#1d6233", next: "파랑띠", poomsae: "태극 3장, 4장", items: "옆차기, 겨루기 기본 스텝", period: "3개월 안팎" },
  { name: "파랑띠", color: "#2b5fb8", edge: "#183f83", next: "빨강띠", poomsae: "태극 5장, 6장", items: "뒤차기, 약속 겨루기", period: "3개월 안팎" },
  { name: "빨강띠", color: "#d7262e", edge: "#8f0f17", next: "품띠", poomsae: "태극 7장, 8장", items: "겨루기, 송판 격파", period: "3개월 안팎" },
  { name: "품띠", color: "#d7262e", edge: "#18181a", next: "검정띠(1품)", poomsae: "고려", items: "국기원 품 심사 준비반", period: "국기원 심사 일정에 맞춰요" },
];
const TEST_FEE = 30000;

/** 그 달 마지막 토요일 */
function lastSaturday(y: number, m: number) {
  const d = new Date(y, m + 1, 0);
  d.setDate(d.getDate() - ((d.getDay() + 1) % 7));
  return d;
}

/** 신청 마감(심사 7일 전)이 지나지 않은 심사일 n개 */
function upcomingTests(today: Date, n: number) {
  const out: { test: Date; deadline: Date }[] = [];
  for (let i = 0; out.length < n && i < 6; i++) {
    const test = lastSaturday(today.getFullYear(), today.getMonth() + i);
    const deadline = daysAgo(test, 7);
    if (deadline.getTime() >= today.getTime()) out.push({ test, deadline });
  }
  return out;
}

/** 일요일과 토요일을 뺀 다음 영업일 */
function nextWeekday(from: Date) {
  let d = daysAgo(from, -1);
  while (d.getDay() === 0 || d.getDay() === 6) d = daysAgo(d, -1);
  return d;
}

/* ---------- 상담 ---------- */

const WAYS = ["체험 수업", "방문 상담", "전화 상담"] as const;
type Way = (typeof WAYS)[number];
type BusPick = { route: string; stop: string } | null;

export function TaekwondoDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [busPick, setBusPick] = useState<BusPick>(null);
  const [part, setPart] = useState<Part>("초등부");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] font-semibold underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("tk-consult")} />

      <header className="border-b" style={{ background: C.bg, borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:px-6">
          <h2>
            <SampleLogo />
          </h2>
          <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center">
            {[
              ["tk-bus", "차량 운행"],
              ["tk-time", "수련 시간표"],
              ["tk-belt", "승급 심사"],
              ["tk-consult", "상담 문의"],
              ["tk-visit", "오시는 길"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ color: C.body, outlineColor: C.ink }}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* 관장, 사범 */}
      <section id="tk-staff" aria-labelledby="tk-staff-title" className="scroll-mt-0 py-14 md:py-20" style={{ background: C.paper }}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <SectionTitle id="tk-staff-title" icon={<Users size={24} aria-hidden />} title="관장, 사범" />
          <ul className="grid gap-8 sm:grid-cols-3 md:gap-6">
            {STAFF.map((t) => (
              <li key={t.id}>
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                <img src={`${IMG}/staff-${t.id}.jpg`} alt={`${t.role} ${t.name}`} className="block aspect-[4/5] w-full rounded-[8px] object-cover" />
                <p className="mt-3 text-[18px] font-bold" style={{ color: C.ink }}>
                  {t.name} <span className="text-[15px] font-semibold" style={{ color: C.muted }}>{t.role}</span>
                </p>
                <p className="mt-1 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
                  {t.note}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 차량 운행 */}
      <section id="tk-bus" aria-labelledby="tk-bus-title" className="scroll-mt-0 py-14 md:py-20" style={{ background: C.bg }}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <SectionTitle id="tk-bus-title" icon={<Bus size={24} aria-hidden />} title="차량 운행" />
          <BusRoute
            reduce={reduce}
            onConsult={(pick) => {
              setBusPick(pick);
              setPart("초등부");
              go("tk-consult");
            }}
          />
        </div>
      </section>

      {/* 시간표 */}
      <section id="tk-time" aria-labelledby="tk-time-title" className="scroll-mt-0 py-14 md:py-20" style={{ background: C.paper }}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <SectionTitle id="tk-time-title" icon={<Clock size={24} aria-hidden />} title="수련 시간표" />
          <Timetable part={part} setPart={setPart} reduce={reduce} />
        </div>
      </section>

      {/* 승급 심사 */}
      <section id="tk-belt" aria-labelledby="tk-belt-title" className="scroll-mt-0 py-14 md:py-20" style={{ background: C.bg }}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <SectionTitle id="tk-belt-title" icon={<Award size={24} aria-hidden />} title="승급 심사" />
          <BeltTest today={today} />
        </div>
      </section>

      {/* 상담 */}
      <section id="tk-consult" aria-labelledby="tk-consult-title" className="scroll-mt-0 py-14 md:py-20" style={{ background: C.paper }}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <SectionTitle id="tk-consult-title" icon={<MessageCircle size={24} aria-hidden />} title="상담 문의" />
          <ConsultForm today={today} reduce={reduce} part={part} setPart={setPart} busPick={busPick} setBusPick={setBusPick} />
        </div>
      </section>

      {/* 오시는 길과 공지사항 */}
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 md:grid-cols-2 md:gap-8 md:px-6 md:py-20">
        <section id="tk-visit" aria-labelledby="tk-visit-title" className="scroll-mt-4">
          <SectionTitle id="tk-visit-title" icon={<MapPin size={24} aria-hidden />} title="오시는 길" />
          <dl className="grid grid-cols-[88px_minmax(0,1fr)] gap-y-3 text-[16px] leading-[1.6]">
            <dt className="font-semibold">주소</dt>
            <dd style={{ color: C.body }}>{ADDRESS}</dd>
            <dt className="font-semibold">수련 시간</dt>
            <dd style={{ color: C.body }}>평일 13:30 ~ 21:30, 토요일 성인부 10:00</dd>
            <dt className="font-semibold">주차</dt>
            <dd style={{ color: C.body }}>건물 뒤 2대 주차 가능</dd>
            <dt className="font-semibold">전화</dt>
            <dd>
              <a href={`tel:${TEL.replace(/-/g, "")}`} className={`font-semibold underline underline-offset-4 ${focusRing}`} style={{ outlineColor: C.ink }}>
                {TEL}
              </a>
            </dd>
          </dl>
        </section>
        <section aria-labelledby="tk-notice-title">
          <SectionTitle id="tk-notice-title" icon={<CalendarCheck size={24} aria-hidden />} title="공지사항" />
          <ul className="divide-y border-y" style={{ borderColor: C.line }}>
            {[
              [daysAgo(today, 2), "이번 달 승급 심사 신청 받아요"],
              [daysAgo(today, 9), "2호차 ㅇㄹ빌라 정류장 추가"],
              [daysAgo(today, 16), "겨울방학 오전반 미리 신청"],
            ].map(([d, t]) => (
              <li key={t as string} className="flex items-baseline justify-between gap-4 py-3 text-[16px]" style={{ borderColor: C.line }}>
                <span className="min-w-0 font-medium">{t as string}</span>
                <span className="flex-none text-[14px] tabular-nums" style={{ color: C.muted }}>
                  {(d as Date).getMonth() + 1}.{p2((d as Date).getDate())}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="px-4 pb-28 pt-10 text-[14px] leading-[1.8] md:px-6" style={{ background: C.dark, color: "#bdbdbd" }}>
        <div className="mx-auto max-w-[1200px]">
          <p>
            <SampleLogo light size={18} />
          </p>
          <p className="mt-2">
            {ADDRESS}, 전화 {TEL}, {KAKAO}
          </p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

/* ---------- 공용 조각 ---------- */

function SectionTitle({ id, icon, title }: { id: string; icon: React.ReactNode; title: string }) {
  return (
    <h2 id={id} className="mb-6 flex items-center gap-2.5 text-[26px] font-bold leading-tight tracking-[-0.02em] md:text-[32px]">
      {icon}
      {title}
    </h2>
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
        <span className="text-[12px] font-semibold opacity-75">태권도장 샘플</span>
      </span>
    </span>
  );
}

function chipStyle(on: boolean) {
  return on ? { background: C.accent, color: "#fff", borderColor: C.accent, outlineColor: C.ink } : { background: "#fff", color: C.ink, borderColor: C.line, outlineColor: C.ink };
}
const chip = `inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] border px-3.5 text-[15px] font-semibold ${focusRing}`;

/* ---------- 포스터 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // 스크롤하면 사진만 조금 느리게 내려간다
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  return (
    <section ref={ref} id="tk-poster" aria-labelledby="tk-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: C.dark, color: "#fff" }}>
      <style>{`
        @keyframes tk-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        .tk-rise { animation: tk-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }
        @media (prefers-reduced-motion: reduce) { .tk-rise { animation: none; } }
      `}</style>
      <motion.div
        className="absolute inset-0"
        style={{ y: photoY }}
        initial={reduce ? false : { scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: reduce ? 0 : 1.6, ease: EASE }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
        <img
          src={`${IMG}/hero.jpg`}
          srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
          sizes="100vw"
          alt="흰 도복에 검은 띠를 맨 수련생과 뒤로 보이는 파랑, 빨강 도장 매트"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "50% 40%" }}
        />
      </motion.div>
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.32) 55%, rgba(0,0,0,0.4))" }} />

      {/* 상호와 핵심 행동 하나 */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 pt-4 md:px-12 md:pt-7">
        <p>
          <SampleLogo light size={18} />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta="taekwondo_poster_cta"
          className={`inline-flex h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`}
          style={{ background: "#fff", color: C.ink, outlineColor: "#fff" }}
        >
          <CalendarCheck size={18} aria-hidden />
          상담 신청
        </button>
      </div>

      {/* 문장 */}
      <div className={`relative z-10 mt-auto px-4 pb-14 md:px-12 md:pb-20 ${reduce ? "" : "tk-rise"}`}>
        <h1 id="tk-poster-title" className="text-[36px] font-bold leading-[1.2] tracking-[-0.03em] md:text-[clamp(40px,5vw,72px)]" style={{ wordBreak: "keep-all" }}>
          <span className="block">학교 앞까지</span>
          <span className="block">차량 운행</span>
        </h1>
        <p className="mt-4 inline-flex items-center gap-2 text-[16px] md:text-[18px]" style={{ color: "rgba(255,255,255,0.88)" }}>
          <Bus size={18} aria-hidden />
          1호차, 2호차 평일 매일 운행
        </p>
      </div>
    </section>
  );
}


/* ---------- 1. 차량 운행 ---------- */

function BusRoute({ reduce, onConsult }: { reduce: boolean; onConsult: (pick: { route: string; stop: string }) => void }) {
  const [routeId, setRouteId] = useState(ROUTES[0].id);
  const [classId, setClassId] = useState(BUS_CLASSES[1].id);
  const [stopIdx, setStopIdx] = useState(0);
  const route = ROUTES.find((r) => r.id === routeId) ?? ROUTES[0];
  const cls = BUS_CLASSES.find((c) => c.id === classId) ?? BUS_CLASSES[0];
  const total = route.stops[route.stops.length - 1].off;
  const pickupAt = (s: Stop) => cls.start - ARRIVE_BEFORE - (total - s.off);
  const dropAt = (s: Stop) => cls.start + CLASS_MIN + LEAVE_AFTER + (total - s.off);
  const stops = route.stops.slice(0, -1);
  const stop = stops[Math.min(stopIdx, stops.length - 1)];
  const legendId = useId();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
      <div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="호차">
          {ROUTES.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={routeId === r.id}
              onClick={() => {
                setRouteId(r.id);
                setStopIdx(0);
              }}
              className={chip}
              style={chipStyle(routeId === r.id)}
            >
              <Bus size={18} aria-hidden />
              {r.label} {r.area}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="타는 부">
          {BUS_CLASSES.map((c) => (
            <button key={c.id} type="button" aria-pressed={classId === c.id} onClick={() => setClassId(c.id)} className={chip} style={chipStyle(classId === c.id)}>
              {c.label} <span className="tabular-nums">{hm(c.start)}</span>
            </button>
          ))}
        </div>

        {/* 노선 */}
        <div className="mt-6 rounded-[6px] border p-4 md:p-6" style={{ borderColor: C.line, background: C.paper }}>
          <div id={legendId} className="mb-3 grid grid-cols-[minmax(0,1fr)_64px_64px] gap-2 pl-12 text-[13px] font-bold md:grid-cols-[minmax(0,1fr)_84px_84px] md:text-[14px]" style={{ color: C.muted }}>
            <span>정류장</span>
            <span className="text-right">등원 탑승</span>
            <span className="text-right">하원 도착</span>
          </div>
          <div className="relative">
            {/* 길 */}
            <div aria-hidden className="absolute bottom-[32px] left-[19px] top-[32px] w-[6px] rounded-full" style={{ background: "#d4d4d4" }} />
            {/* 차. 고른 정류장으로 간다 */}
            <motion.div
              aria-hidden
              className="absolute left-0 top-[10px] z-[1] flex h-11 w-11 items-center justify-center rounded-full"
              style={{ background: C.accent, color: "#fff" }}
              initial={false}
              animate={{ y: Math.min(stopIdx, stops.length - 1) * STOP_ROW }}
              transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
            >
              <Bus size={20} />
            </motion.div>
            <ul role="radiogroup" aria-label="정류장" aria-describedby={legendId}>
              {route.stops.map((s, i) => {
                const last = i === route.stops.length - 1;
                const on = !last && i === Math.min(stopIdx, stops.length - 1);
                return (
                  <li key={s.name} className="relative" style={{ height: STOP_ROW }}>
                    <span aria-hidden className="absolute left-[12px] top-[25px] h-[20px] w-[20px] rounded-full border-2" style={{ background: last ? C.ink : "#fff", borderColor: last ? C.ink : "#9a9a9a" }} />
                    {last ? (
                      <div className="grid h-full grid-cols-[minmax(0,1fr)_64px_64px] items-center gap-2 pl-12 md:grid-cols-[minmax(0,1fr)_84px_84px]">
                        <span className="text-[16px] font-bold">{BRAND}</span>
                        <span className="text-right text-[15px] font-bold tabular-nums">{hm(cls.start - ARRIVE_BEFORE)}</span>
                        <span className="text-right text-[15px] font-bold tabular-nums">{hm(cls.start + CLASS_MIN + LEAVE_AFTER)}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setStopIdx(i)}
                        className={`grid h-full w-full grid-cols-[minmax(0,1fr)_64px_64px] items-center gap-2 rounded-[4px] pl-12 pr-2 text-left md:grid-cols-[minmax(0,1fr)_84px_84px] ${focusRing}`}
                        style={{ background: on ? C.accentSoft : "transparent", outlineColor: C.ink }}
                      >
                        <span className="min-w-0">
                          <span className={`block truncate text-[16px] ${on ? "font-bold" : "font-semibold"}`}>{s.name}</span>
                          {s.note && (
                            <span className="block truncate text-[13px]" style={{ color: C.muted }}>
                              {s.note}
                            </span>
                          )}
                        </span>
                        <span className="text-right text-[16px] font-bold tabular-nums">{hm(pickupAt(s))}</span>
                        <span className="text-right text-[16px] tabular-nums">{hm(dropAt(s))}</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* 고른 정류장 결과 */}
      <aside className="self-start rounded-[8px] border p-5 md:p-6 lg:sticky lg:top-6" style={{ borderColor: C.line, background: "#fff" }} aria-live="polite">
        <p className="text-[15px] font-bold" style={{ color: C.muted }}>
          {route.label}, {cls.label}
        </p>
        <p className="mt-1 text-[22px] font-bold leading-snug">{stop.name}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[6px] p-3" style={{ background: C.accentSoft }}>
            <dt className="text-[14px] font-bold">등원 탑승</dt>
            <dd className="mt-1 text-[30px] font-bold leading-none tracking-[-0.02em] tabular-nums">
              {hm(pickupAt(stop))}
            </dd>
          </div>
          <div className="rounded-[6px] p-3" style={{ background: C.paper }}>
            <dt className="text-[14px] font-bold">하원 도착</dt>
            <dd className="mt-1 text-[30px] font-bold leading-none tracking-[-0.02em] tabular-nums">
              {hm(dropAt(stop))}
            </dd>
          </div>
        </dl>
        <ul className="mt-4 space-y-2 text-[15px] leading-[1.6]">
          <li className="flex gap-2">
            <ShieldCheck size={18} className="mt-0.5 flex-none" aria-hidden />
            어린이 통학버스 신고 차량, 사범님이 함께 타요
          </li>
          <li className="flex gap-2">
            <MessageCircle size={18} className="mt-0.5 flex-none" aria-hidden />
            출발하면 보호자에게 문자가 가요
          </li>
        </ul>
        <button
          type="button"
          onClick={() => onConsult({ route: route.label, stop: stop.name })}
          data-gtm-cta="taekwondo_bus_consult"
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[4px] px-5 py-3 text-[16px] font-semibold ${focusRing}`}
          style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}
        >
          <CalendarCheck size={20} aria-hidden />이 정류장으로 상담 신청
        </button>
      </aside>
    </div>
  );
}

/* ---------- 2. 부별 시간표 ---------- */

function Timetable({ part, setPart, reduce }: { part: Part; setPart: (p: Part) => void; reduce: boolean }) {
  const fee = FEES[part];
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="부 고르기">
        {PARTS.map((p) => (
          <button key={p} type="button" aria-pressed={part === p} onClick={() => setPart(p)} className={chip} style={chipStyle(part === p)}>
            {p}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-x-auto rounded-[8px] border" style={{ borderColor: C.line, background: "#fff" }} tabIndex={0} aria-label="수련 시간표, 좌우로 밀어서 보기" role="region">
          <table className="w-full min-w-[640px] border-collapse text-[15px]">
            <caption className="sr-only">부별 요일 수련 내용</caption>
            <thead>
              <tr style={{ background: C.paper, color: C.ink }}>
                <th scope="col" className="px-3 py-3 text-left font-bold">
                  부
                </th>
                <th scope="col" className="px-3 py-3 text-left font-bold">
                  시간
                </th>
                {["월", "화", "수", "목", "금"].map((d) => (
                  <th key={d} scope="col" className="px-2 py-3 text-center font-bold">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => {
                const on = r.part === part;
                return (
                  <tr key={r.label} className="border-t" style={{ borderColor: C.line }}>
                    <th scope="row" className="relative whitespace-nowrap px-3 py-3 text-left font-bold">
                      <motion.span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-[6px] origin-top"
                        style={{ background: C.accent }}
                        initial={false}
                        animate={{ scaleY: on ? 1 : 0 }}
                        transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
                      />
                      {r.label}
                      {on && <span className="sr-only"> (고른 부)</span>}
                    </th>
                    <td className="whitespace-nowrap px-3 py-3 tabular-nums" style={{ background: on ? C.accentSoft : undefined }}>
                      {r.time}
                    </td>
                    {r.week.map((w, i) => (
                      <td key={i} className="px-2 py-3 text-center" style={{ background: on ? C.accentSoft : undefined, color: w ? (on ? C.ink : C.body) : C.muted, fontWeight: on && w ? 600 : 400 }}>
                        {w || "쉬어요"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-[8px] border p-5" style={{ background: "#fff", borderColor: C.line }} aria-live="polite">
          <p className="text-[15px] font-bold" style={{ color: C.muted }}>
            {part} 월 수련비
          </p>
          <p className="mt-1 text-[34px] font-bold leading-none tracking-[-0.02em] tabular-nums">{won(fee.fee)}</p>
          <ul className="mt-4 space-y-1.5 text-[15px] leading-[1.6]" style={{ color: C.body }}>
            <li>{fee.per} 수련</li>
            <li>{fee.bus ? "차량 운행 포함" : "차량 운행 없음"}</li>
            <li>도복과 흰띠 처음 한 번 45,000원</li>
            <li>형제 함께 다니면 둘째부터 10,000원 빼 드려요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---------- 3. 승급 심사 ---------- */

function BeltTest({ today }: { today: Date }) {
  const [idx, setIdx] = useState(1);
  const step = BELT_STEPS[idx];
  const nextColor = BELT_STEPS[idx + 1] ?? { color: C.ink, edge: "#000" };
  const tests = upcomingTests(today, 3);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      <div>
        <p className="text-[16px] font-bold">지금 매고 있는 띠</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6" role="radiogroup" aria-label="지금 띠">
          {BELT_STEPS.map((b, i) => (
            <button
              key={b.name}
              type="button"
              role="radio"
              aria-checked={idx === i}
              onClick={() => setIdx(i)}
              className={`flex flex-col items-center gap-2 rounded-[6px] border px-1 pb-2.5 pt-3 text-[15px] font-semibold ${focusRing}`}
              style={{ borderColor: idx === i ? C.accent : C.line, background: idx === i ? C.accentSoft : "#fff", outlineColor: C.ink }}
            >
              <BeltSwatch color={b.color} edge={b.edge} split={b.name === "품띠"} />
              {b.name}
              {idx === i && <Check size={16} aria-hidden />}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[8px] border p-5 md:p-6" style={{ borderColor: C.line }} aria-live="polite">
          <div className="flex items-center gap-3">
            <BeltSwatch color={step.color} edge={step.edge} split={step.name === "품띠"} />
            <span className="text-[15px] font-bold" style={{ color: C.muted }}>
              다음 띠
            </span>
            <BeltSwatch color={nextColor.color} edge={nextColor.edge} split={step.next === "품띠"} />
          </div>
          <p className="mt-3 text-[26px] font-bold leading-tight tracking-[-0.02em]">
            {step.next}
          </p>
          <dl className="mt-4 grid grid-cols-[92px_minmax(0,1fr)] gap-y-2.5 text-[16px] leading-[1.55]">
            <dt className="font-bold">심사 품새</dt>
            <dd style={{ color: C.body }}>{step.poomsae}</dd>
            <dt className="font-bold">심사 항목</dt>
            <dd style={{ color: C.body }}>{step.items}</dd>
            <dt className="font-bold">수련 기간</dt>
            <dd style={{ color: C.body }}>{step.period}</dd>
            <dt className="font-bold">심사비</dt>
            <dd style={{ color: C.body }}>{idx === BELT_STEPS.length - 1 ? "국기원 심사비 따로 안내" : `${won(TEST_FEE)}(새 띠, 수료증 포함)`}</dd>
          </dl>
        </div>
      </div>

      <div>
        <p className="text-[16px] font-bold">도장 승급 심사 일정</p>
        <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
          매달 마지막 토요일 오전 10시, 신청은 일주일 전까지
        </p>
        <ol className="mt-4 space-y-3">
          {tests.map(({ test, deadline }, i) => {
            const left = Math.round((deadline.getTime() - today.getTime()) / 86_400_000);
            return (
              <li key={test.getTime()} className="flex items-center gap-4 rounded-[6px] border p-4" style={{ borderColor: i === 0 ? C.accent : C.line }}>
                <div className="flex h-[64px] w-[64px] flex-none flex-col items-center justify-center rounded-[4px]" style={{ background: i === 0 ? C.accent : C.paper, color: i === 0 ? "#fff" : C.ink }}>
                  <span className="text-[13px] font-bold">{test.getMonth() + 1}월</span>
                  <span className="text-[24px] font-bold leading-none tabular-nums">
                    {test.getDate()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[17px] font-bold">{fmtKo(test)} 승급 심사</p>
                  <p className="text-[15px]" style={{ color: C.muted }}>
                    신청 마감 {fmtKo(deadline)}
                    {i === 0 && (left === 0 ? ", 오늘까지" : `, ${left}일 남음`)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
          품띠부터는 국기원 품 심사예요. 날짜가 잡히면 공지사항에 올려요.
        </p>
      </div>
    </div>
  );
}

function BeltSwatch({ color, edge, split = false }: { color: string; edge: string; split?: boolean }) {
  return (
    <svg width="32" height="12" viewBox="0 0 32 12" aria-hidden className="flex-none">
      <rect x="0.5" y="0.5" width="31" height="11" rx="2" fill={color} stroke={edge} strokeOpacity="0.5" strokeWidth="1" />
      {split && <rect x="1" y="6" width="30" height="5" rx="1" fill={C.ink} />}
    </svg>
  );
}

/* ---------- 4. 상담 신청 ---------- */

type Done = { no: string; name: string; phone: string; way: Way; day: Date; reply: Date; part: Part; bus: string };

function ConsultForm({
  today,
  reduce,
  part,
  setPart,
  busPick,
  setBusPick,
}: {
  today: Date;
  reduce: boolean;
  part: Part;
  setPart: (p: Part) => void;
  busPick: BusPick;
  setBusPick: (b: BusPick) => void;
}) {
  const [way, setWay] = useState<Way>("체험 수업");
  const [day, setDay] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const nameId = useId();
  const phoneId = useId();
  const agreeId = useId();
  const busId = useId();

  // 일요일을 뺀 다음 5일
  const days: Date[] = [];
  for (let i = 1; days.length < 5 && i < 10; i++) {
    const d = daysAgo(today, -i);
    if (d.getDay() !== 0) days.push(d);
  }

  const busValue = busPick ? `${busPick.route}|${busPick.stop}` : "";
  const busLabel = busPick ? `${busPick.route} ${busPick.stop}` : "이용 안 함";
  const busOk = FEES[part].bus;
  const nameOk = name.trim().length >= 2;
  const phoneOk = phone.replace(/\D/g, "").length >= 10;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!nameOk || !phoneOk || !agree) return;
    const yymmdd = `${String(today.getFullYear()).slice(2)}${p2(today.getMonth() + 1)}${p2(today.getDate())}`;
    setDone({
      no: `TK-${yymmdd}-${String(100 + (Number(phone.replace(/\D/g, "").slice(-4)) % 900))}`,
      name: maskName(name),
      phone: maskPhone(phone),
      way,
      day: days[day],
      reply: nextWeekday(today),
      part,
      bus: busOk ? busLabel : "이용 안 함",
    });
  };

  const field = `mt-2 block min-h-[48px] w-full rounded-[4px] border px-3 text-[16px] ${focusRing}`;

  return (
    <div className="rounded-[8px] border p-5 md:p-8" style={{ borderColor: C.line, background: "#fff" }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={reduce ? false : { y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: reduce ? 0 : DUR, ease: EASE }} aria-live="polite">
            <p className="inline-flex items-center gap-2 text-[15px] font-bold" style={{ color: C.muted }}>
              <Check size={18} aria-hidden />
              접수 번호 <span className="tabular-nums">{done.no}</span>
            </p>
            <p className="mt-2 text-[26px] font-bold leading-tight tracking-[-0.02em]">
              {done.way} 신청 받았어요
            </p>
            <dl className="mt-5 grid grid-cols-[100px_minmax(0,1fr)] gap-y-2.5 text-[16px] leading-[1.55]">
              <dt className="font-bold">신청</dt>
              <dd>
                {done.part}, {done.name}, {done.phone}
              </dd>
              <dt className="font-bold">희망일</dt>
              <dd>{fmtKo(done.day)}</dd>
              <dt className="font-bold">차량</dt>
              <dd>{done.bus}</dd>
              <dt className="font-bold">담당 창구</dt>
              <dd>
                {KAKAO}, 전화 {TEL}
              </dd>
              <dt className="font-bold">회신 예정</dt>
              <dd>{fmtKo(done.reply)} 오후 6시 전에 관장님이 전화드려요</dd>
            </dl>
            {done.way === "체험 수업" && <p className="mt-4 text-[15px]">체험 수업 날엔 편한 운동복이면 돼요. 도복은 빌려 드려요.</p>}
            <button
              type="button"
              onClick={() => {
                setDone(null);
                setTried(false);
                setName("");
                setPhone("");
                setAgree(false);
              }}
              className={`mt-6 rounded-[6px] border px-4 py-2.5 text-[15px] font-semibold ${focusRing}`}
              style={{ borderColor: C.line, outlineColor: C.ink }}
            >
              다시 신청
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" noValidate onSubmit={submit} className="grid gap-6 md:grid-cols-2" initial={false} animate={{ opacity: 1 }}>
            <fieldset>
              <legend className="text-[16px] font-bold">수련생 구분</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {PARTS.map((p) => (
                  <button key={p} type="button" aria-pressed={part === p} onClick={() => setPart(p)} className={chip} style={chipStyle(part === p)}>
                    {p}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-[16px] font-bold">상담 방법</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {WAYS.map((w) => (
                  <button key={w} type="button" aria-pressed={way === w} onClick={() => setWay(w)} className={chip} style={chipStyle(way === w)}>
                    {w}
                    {w === "체험 수업" && <span className="text-[13px] font-semibold opacity-80">1회 무료</span>}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="md:col-span-2">
              <legend className="text-[16px] font-bold">희망일</legend>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {days.map((d, i) => (
                  <button key={d.getTime()} type="button" aria-pressed={day === i} onClick={() => setDay(i)} className={`rounded-[4px] border py-2.5 text-center ${focusRing}`} style={chipStyle(day === i)}>
                    <span className="block text-[13px] font-semibold">{DOW[d.getDay()]}</span>
                    <span className="block text-[15px] font-bold tabular-nums sm:text-[18px]">
                      {d.getMonth() + 1}.{d.getDate()}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="md:col-span-2">
              <label htmlFor={busId} className="text-[16px] font-bold">
                차량 이용
              </label>
              {busOk ? (
                <select
                  id={busId}
                  value={busValue}
                  onChange={(e) => {
                    const [route, stop] = e.target.value.split("|");
                    setBusPick(e.target.value ? { route, stop } : null);
                  }}
                  className={`${field} bg-white`}
                  style={{ borderColor: C.line, outlineColor: C.ink }}
                >
                  <option value="">이용 안 함</option>
                  {ROUTES.map((r) => (
                    <optgroup key={r.id} label={`${r.label} ${r.area}`}>
                      {r.stops.slice(0, -1).map((s) => (
                        <option key={s.name} value={`${r.label}|${s.name}`}>
                          {r.label} {s.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              ) : (
                <p id={busId} className="mt-2 text-[15px]" style={{ color: C.muted }}>
                  {part}는 차량 운행이 없어요.
                </p>
              )}
            </div>
            <div>
              <label htmlFor={nameId} className="text-[16px] font-bold">
                {part === "성인부" ? "이름" : "보호자 이름"}
              </label>
              <input id={nameId} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={{ borderColor: tried && !nameOk ? C.error : C.line, outlineColor: C.ink }} aria-invalid={tried && !nameOk} />
              {tried && !nameOk && (
                <p className="mt-1 text-[14px] font-semibold" style={{ color: C.error }}>
                  이름을 두 글자 이상 넣어 주세요.
                </p>
              )}
            </div>
            <div>
              <label htmlFor={phoneId} className="text-[16px] font-bold">
                연락처
              </label>
              <input id={phoneId} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={`${field} tabular-nums`} style={{ borderColor: tried && !phoneOk ? C.error : C.line, outlineColor: C.ink }} aria-invalid={tried && !phoneOk} />
              {tried && !phoneOk && (
                <p className="mt-1 text-[14px] font-semibold" style={{ color: C.error }}>
                  휴대폰 번호를 확인해 주세요.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-2">
              <label htmlFor={agreeId} className="inline-flex cursor-pointer items-center gap-2 text-[15px]">
                <input id={agreeId} type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`h-5 w-5 ${focusRing}`} style={{ accentColor: C.accent, outlineColor: C.ink }} />
                개인정보 수집 및 이용 동의(필수)
                {tried && !agree && (
                  <span className="font-semibold" style={{ color: C.error }}>
                    동의가 필요해요
                  </span>
                )}
              </label>
              <button
                type="submit"
                data-gtm-cta="taekwondo_consult_submit"
                className={`inline-flex items-center gap-2 rounded-[6px] px-6 py-3 text-[16px] font-semibold ${focusRing}`}
                style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}
              >
                <CalendarCheck size={20} aria-hidden />
                상담 신청
              </button>
            </div>
            <p className="inline-flex items-center gap-2 text-[14px] md:col-span-2" style={{ color: C.muted }}>
              <Phone size={16} aria-hidden />
              급하시면 {TEL}, 수련 중엔 {KAKAO}로 남겨 주세요.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
