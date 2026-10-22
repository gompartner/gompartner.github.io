"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Bus, CalendarCheck, Check, Clock, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { Black_Han_Sans } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 태권도장 홈페이지 샘플: 가상의 곰파트너태권도. 유치부, 초등부, 중고등부, 성인부를 가르친다.
   상호, 관장과 사범 이름, 주소, 전화번호, 학교와 아파트 이름, 손님 이름은 모두 가상이다.

   국내 태권도장 사이트 공통 구성(참고): 메뉴는 도장 소개, 관장 인사말, 수련 프로그램(유치부, 초등부, 중고등부, 성인부),
   수련 시간표, 차량 운행, 승급 심사, 공지사항, 상담 문의, 오시는 길. 학부모가 제일 먼저 찾는 건 차량 운행 노선과
   탑승 시간이라 첫 화면 가까이에 둔다. 요일별 수련 내용(품새, 발차기, 겨루기, 줄넘기, 태권체조)과 월 수련비,
   어린이 통학버스 신고와 보호자 동승, 체험 수업 1회 무료 같은 문구를 그대로 쓴다.

   포스터 첫 화면(tk-poster): 흰 바탕에 큰 문장 "학교 앞까지 차로 데리러 가요" 하나만 둔다.
   노랑, 빨강, 검정 띠 세 가닥이 화면 밖에서 크게 휘감으며 날아와 오른쪽(휴대폰은 아래) 가운데에서 매듭으로 묶인다.
   띠는 천 결(가장자리 어둡게, 박음질 줄, 윗면 하이라이트)과 바닥 그림자로 입체감을 주고, 묶인 뒤에는 매듭이 8초 주기로 아주 살짝 흔들린다.
   스크롤하면 띠 끝이 매듭에서 빠져나가며 세 방향으로 흩어지고 매듭은 돌며 사라진다. 동작 줄이기면 묶인 상태로 고정한다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 차량 운행: 호차와 부를 고르면 정류장별 등원 탑승 시간과 하원 도착 시간이 나오고, 정류장을 고르면 차가 그 자리로 간다.
   2. 부별 시간표: 부를 고르면 그 부의 줄이 칠해지고 요일별 수련 내용과 월 수련비가 보인다.
   3. 승급 심사: 지금 띠를 고르면 다음 띠, 심사 품새와 항목, 다음 심사일과 신청 마감일이 나온다.
   4. 상담 신청: 구분, 상담 방법, 차량 이용, 희망일, 보호자 이름과 연락처. 완료 화면에 접수 번호, 담당 창구, 회신 예정일. */

const sfxF = { fontFamily: `${Black_Han_Sans.style.fontFamily}, var(--font-sfx), sans-serif`, fontWeight: 400 } as const;

const BRAND = "곰파트너태권도";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 2층";

/* 포스터 색 */
const P = {
  bg: "#fbfaf7",
  edge: "#ecebe5",
  ink: "#141414",
  sub: "#55524c",
  red: "#c01e26",
};

/* 본문 색 */
const C = {
  bg: "#ffffff",
  paper: "#f6f5f1",
  ink: "#141414",
  muted: "#5a5750",
  line: "#dedbd3",
  yellow: "#f5c518",
  yellowSoft: "#fff4c2",
  red: "#c01e26",
  belt: "#d7262e",
  black: "#18181a",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 띠가 날아올 때. 천천히 출발해 크게 휘돌고 매듭 쪽에서 감속한다 */
const EASE_FLY = [0.45, 0, 0.2, 1] as const;
/** 띠 한 가닥이 화면 밖에서 매듭까지 오는 시간 */
const FLY_DUR = 1.25;
/** 띠 사이 출발 간격 */
const FLY_GAP = 0.12;
/** 매듭이 조여지는 시각(스프링 시작) */
const KNOT_AT = 1.05;
/** 묶인 뒤 매듭이 살짝 흔들리는 주기 */
const SWAY_LOOP = 8;
/** 포스터 스크롤 진행도 중 퇴장이 끝나는 지점 */
const EXIT_END = 0.8;
/** 결과 숫자, 칠하기 전환 */
const DUR = 0.35;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const p2 = (n: number) => String(n).padStart(2, "0");
const hm = (m: number) => `${Math.floor(m / 60)}:${p2(m % 60)}`;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- 포스터 띠 ---------- */

/* 띠 한 가닥은 하나의 패스다. 앞부분(swirl)은 화면 밖에서 크게 휘도는 비행 경로,
   뒷부분(tail)은 한쪽 끝, 매듭(500, 470), 다른 쪽 끝. 날아오는 동안 보이는 구간이 패스를 따라 미끄러지고
   마지막에는 뒷부분만 남는다. k 는 전체 길이 중 앞부분 비율(따로 잰 값). */
type BeltDef = {
  key: string;
  d: string;
  k: number;
  base: string;
  dark: string;
  seam: string;
  hi: string;
  out: [number, number];
};

const BELTS: BeltDef[] = [
  {
    key: "b",
    d: "M 700 -1900 C 1500 -900 640 660 800 900 C 900 1050 380 1100 400 940 C 420 800 470 600 500 470 C 530 620 560 800 600 960",
    k: 0.776,
    base: "#1d1d20",
    dark: "#000000",
    seam: "#3b3b41",
    hi: "#8a8a92",
    out: [60, 760],
  },
  {
    key: "r",
    d: "M 1900 900 C 1400 1150 600 1100 300 900 C 0 700 120 200 420 140 C 700 90 950 160 900 260 C 880 290 860 300 830 300 C 700 300 580 400 500 470 C 600 560 820 650 760 830",
    k: 0.788,
    base: "#d7262e",
    dark: "#8f0f17",
    seam: "#b51b23",
    hi: "#ff9da0",
    out: [820, -80],
  },
  {
    key: "y",
    d: "M -900 120 C -400 -120 300 -80 760 120 C 1080 260 780 400 620 760 C 460 1120 -40 1060 -60 600 C -70 420 80 320 180 330 C 300 350 420 420 500 470 C 380 600 200 700 250 820",
    k: 0.826,
    base: "#f5c518",
    dark: "#b98c00",
    seam: "#d6a70a",
    hi: "#fff7cc",
    out: [-820, -160],
  },
];

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
          <h2 className="inline-flex items-center gap-2 text-[22px] leading-none" style={sfxF}>
            <KnotMark size={26} />
            {BRAND}
          </h2>
          <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center">
            {[
              ["tk-bus", "차량 운행"],
              ["tk-time", "수련 시간표"],
              ["tk-belt", "승급 심사"],
              ["tk-consult", "상담 문의"],
              ["tk-visit", "오시는 길"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.ink }}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* 차량 운행 */}
      <section id="tk-bus" aria-labelledby="tk-bus-title" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pt-12 md:px-6 md:pt-16">
        <SectionTitle id="tk-bus-title" icon={<Bus size={26} aria-hidden />} title="차량 운행" />
        <BusRoute
          reduce={reduce}
          onConsult={(pick) => {
            setBusPick(pick);
            setPart("초등부");
            go("tk-consult");
          }}
        />
      </section>

      {/* 시간표 */}
      <section id="tk-time" aria-labelledby="tk-time-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="tk-time-title" icon={<Clock size={26} aria-hidden />} title="수련 시간표" />
        <Timetable part={part} setPart={setPart} reduce={reduce} />
      </section>

      {/* 승급 심사 */}
      <section id="tk-belt" aria-labelledby="tk-belt-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="tk-belt-title" icon={<BeltIcon />} title="승급 심사" />
        <BeltTest today={today} reduce={reduce} />
      </section>

      {/* 상담 */}
      <section id="tk-consult" aria-labelledby="tk-consult-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="tk-consult-title" icon={<MessageCircle size={26} aria-hidden />} title="상담 문의" />
        <ConsultForm today={today} reduce={reduce} part={part} setPart={setPart} busPick={busPick} setBusPick={setBusPick} />
      </section>

      {/* 오시는 길과 공지사항 */}
      <div className="mx-auto mt-16 grid max-w-[1200px] gap-10 px-4 md:mt-24 md:grid-cols-2 md:gap-8 md:px-6">
        <section id="tk-visit" aria-labelledby="tk-visit-title" className="scroll-mt-4">
          <SectionTitle id="tk-visit-title" icon={<MapPin size={26} aria-hidden />} title="오시는 길" />
          <dl className="grid grid-cols-[88px_minmax(0,1fr)] gap-y-3 text-[16px] leading-[1.6]">
            <dt className="font-bold">주소</dt>
            <dd>{ADDRESS}</dd>
            <dt className="font-bold">수련 시간</dt>
            <dd>평일 13:30 ~ 21:30, 토요일 성인부 10:00</dd>
            <dt className="font-bold">주차</dt>
            <dd>건물 뒤 2대 주차 가능</dd>
            <dt className="font-bold">전화</dt>
            <dd>
              <a href={`tel:${TEL.replace(/-/g, "")}`} className={`font-bold underline underline-offset-4 ${focusRing}`} style={{ outlineColor: C.ink }}>
                {TEL}
              </a>
            </dd>
          </dl>
        </section>
        <section aria-labelledby="tk-notice-title">
          <SectionTitle id="tk-notice-title" icon={<CalendarCheck size={26} aria-hidden />} title="공지사항" />
          <ul className="divide-y border-y" style={{ borderColor: C.line }}>
            {[
              [daysAgo(today, 2), "이번 달 승급 심사 신청 받아요"],
              [daysAgo(today, 9), "2호차 ㅇㄹ빌라 정류장 추가"],
              [daysAgo(today, 16), "겨울방학 오전반 미리 신청"],
            ].map(([d, t]) => (
              <li key={t as string} className="flex items-baseline justify-between gap-4 py-3 text-[16px]" style={{ borderColor: C.line }}>
                <span className="min-w-0 font-semibold">{t as string}</span>
                <span className="flex-none text-[14px] tabular-nums" style={{ color: C.muted }}>
                  {(d as Date).getMonth() + 1}.{p2((d as Date).getDate())}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="mt-16 px-4 pb-28 pt-10 text-[14px] leading-[1.8] md:px-6" style={{ background: C.black, color: "#d8d6cf" }}>
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[18px] text-white" style={sfxF}>
            {BRAND}
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
    <h2 id={id} className="mb-6 flex items-center gap-2.5 text-[28px] leading-tight md:text-[34px]" style={sfxF}>
      {icon}
      {title}
    </h2>
  );
}

/** 작은 매듭 로고. 검정 매듭에 노랑, 빨강 띠 */
function KnotMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="flex-none">
      <path d="M12 12 L4 21 M12 12 L20 21" stroke={C.black} strokeWidth="4" strokeLinecap="butt" />
      <path d="M12 12 L2 6" stroke={C.yellow} strokeWidth="4" />
      <path d="M12 12 L22 6" stroke={C.belt} strokeWidth="4" />
      <rect x="7" y="8" width="10" height="8" rx="2" fill={C.black} />
    </svg>
  );
}

function BeltIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden className="flex-none">
      <path d="M2 9 H22" stroke="currentColor" strokeWidth="4" />
      <path d="M12 9 L7 21 M12 9 L17 21" stroke="currentColor" strokeWidth="3.4" />
      <rect x="8.5" y="5.5" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function chipStyle(on: boolean) {
  return on ? { background: C.black, color: "#fff", borderColor: C.black, outlineColor: C.ink } : { background: "#fff", color: C.ink, borderColor: C.line, outlineColor: C.ink };
}
const chip = `inline-flex min-h-[44px] items-center gap-1.5 rounded-[4px] border px-3.5 text-[15px] font-semibold ${focusRing}`;

/* ---------- 포스터 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 0 : clamp01(v / EXIT_END)));
  // 문장은 위로 빠진다
  const textY = useTransform(p, (v) => `${-v * 42}svh`);
  const textO = useTransform(p, (v) => 1 - clamp01((v - 0.25) / 0.55));

  return (
    <section id="tk-poster" ref={ref} aria-labelledby="tk-poster-title" className="relative" style={{ height: reduce ? undefined : "180svh", background: P.bg }}>
      <div
        className={`${reduce ? "relative min-h-svh" : "sticky top-0 h-svh"} overflow-hidden`}
        style={{ background: `radial-gradient(110% 85% at 70% 58%, #ffffff 0%, ${P.bg} 52%, ${P.edge} 100%)`, color: P.ink }}
      >
        {/* 도장 매트 이음선. 아주 옅게 */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] opacity-[0.5]" style={{ backgroundImage: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.035)), repeating-linear-gradient(90deg, transparent 0 calc(25% - 1px), rgba(0,0,0,0.06) calc(25% - 1px) 25%)" }} />

        {/* 띠와 매듭 */}
        <div className="pointer-events-none absolute -left-[15vw] -right-[15vw] bottom-0 h-[62svh] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[54vw]">
          <BeltKnot reduce={reduce} p={p} />
        </div>

        {/* 로고와 핵심 행동 하나 */}
        <motion.div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4 md:px-12 md:pt-7" style={{ y: textY }}>
          <p className="inline-flex items-center gap-2 text-[17px] leading-none" style={sfxF}>
            <KnotMark size={20} />
            {BRAND}
          </p>
          <button
            type="button"
            onClick={onCta}
            aria-label="상담 신청"
            title="상담 신청"
            data-gtm-cta="taekwondo_poster_cta"
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${focusRing}`}
            style={{ background: C.black, color: C.yellow, outlineColor: C.ink }}
          >
            <CalendarCheck size={22} aria-hidden />
          </button>
        </motion.div>

        {/* 큰 문장 */}
        <motion.div className="relative z-[1] flex h-full flex-col px-4 pt-[13svh] md:px-12 lg:justify-center lg:pb-[6svh] lg:pt-0" style={{ y: textY, opacity: textO }}>
          <h1
            id="tk-poster-title"
            className="text-[clamp(52px,15vw,68px)] leading-[1.1] tracking-[-0.01em] lg:text-[clamp(84px,7.6vw,150px)] lg:leading-[1.06]"
            style={{ ...sfxF, wordBreak: "keep-all" }}
          >
            <span className="block">학교 앞까지</span>
            <span className="block">
              <span className="block lg:inline" style={{ color: P.red }}>
                차로
              </span>
              <span className="hidden lg:inline"> </span>
              데리러 가요
            </span>
          </h1>
          <p className="mt-5 inline-flex items-center gap-2 text-[16px] font-semibold md:mt-8 md:text-[19px]" style={{ color: P.sub }}>
            <Bus size={20} aria-hidden />
            1호차, 2호차 평일 매일 운행
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function BeltKnot({ reduce, p }: { reduce: boolean; p: MotionValue<number> }) {
  // 매듭은 커지고 돌며 풀려 사라진다
  const knotS = useTransform(p, (v) => 1 + v * 0.5);
  const knotR = useTransform(p, (v) => v * 50);
  const knotO = useTransform(p, (v) => 1 - clamp01(v / 0.55));

  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible" role="img" aria-label="노랑, 빨강, 검정 띠 세 가닥이 날아와 가운데에서 하나의 매듭으로 묶인 그림">
      <defs>
        <radialGradient id="tk-floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.2" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tk-knot-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#45454b" />
          <stop offset="0.5" stopColor="#1d1d20" />
          <stop offset="1" stopColor="#060607" />
        </linearGradient>
        <radialGradient id="tk-knot-light" cx="0.3" cy="0.22" r="0.9">
          <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.75" stopColor="#000" stopOpacity="0.1" />
          <stop offset="1" stopColor="#000" stopOpacity="0.4" />
        </radialGradient>
        <clipPath id="tk-knot-clip">
          <rect x="-82" y="-60" width="164" height="120" rx="24" />
        </clipPath>
      </defs>

      {/* 바닥 그림자 */}
      <ellipse cx="500" cy="985" rx="340" ry="22" fill="url(#tk-floor)" />

      <g>
        {!reduce && <animateTransform attributeName="transform" type="rotate" values="0 500 470; 1.4 500 470; 0 500 470; -1.4 500 470; 0 500 470" dur={`${SWAY_LOOP}s`} begin="2.2s" repeatCount="indefinite" />}
        {BELTS.map((b, i) => (
          <Belt key={b.key} b={b} delay={i * FLY_GAP} reduce={reduce} p={p} />
        ))}

        {/* 매듭 */}
        <g transform="translate(500 470) rotate(-6)">
          <motion.g style={{ scale: knotS, rotate: knotR, opacity: knotO }}>
            <motion.g
              initial={reduce ? false : { scale: 0.25, rotate: -120 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 13, delay: KNOT_AT }}
            >
              <ellipse cx="10" cy="18" rx="92" ry="66" fill="rgba(20,16,10,0.18)" />
              <rect x="-82" y="-60" width="164" height="120" rx="24" fill="url(#tk-knot-base)" />
              <g clipPath="url(#tk-knot-clip)">
                {/* 매듭 안으로 감겨 들어간 노랑, 빨강 띠 */}
                <g transform="rotate(-24)">
                  <rect x="-130" y="-30" width="260" height="40" fill="#f5c518" />
                  <rect x="-130" y="-30" width="260" height="40" fill="none" stroke="#b98c00" strokeWidth="3" />
                  <path d="M-130 -20 H130 M-130 0 H130" stroke="#d6a70a" strokeWidth="1.6" />
                </g>
                <g transform="rotate(20)">
                  <rect x="-130" y="2" width="260" height="38" fill="#d7262e" />
                  <rect x="-130" y="2" width="260" height="38" fill="none" stroke="#8f0f17" strokeWidth="3" />
                  <path d="M-130 12 H130 M-130 30 H130" stroke="#b51b23" strokeWidth="1.6" />
                </g>
                {/* 검정 띠가 위로 한 번 더 감긴 접힘 */}
                <path d="M-90 -64 C -40 -30 30 -34 92 -70 L 92 -40 C 30 -6 -40 -2 -90 -34 Z" fill="#1d1d20" />
                <path d="M-90 -34 C -40 -2 30 -6 92 -40" fill="none" stroke="#000" strokeWidth="3" opacity="0.6" />
                <path d="M-70 64 C -30 30 30 30 76 64" fill="none" stroke="#000" strokeWidth="5" opacity="0.35" />
              </g>
              <rect x="-82" y="-60" width="164" height="120" rx="24" fill="url(#tk-knot-light)" />
              <path d="M-58 -50 Q 0 -60 58 -52" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="3.5" strokeLinecap="round" />
            </motion.g>
          </motion.g>
        </g>
      </g>
    </svg>
  );
}

/* 띠 한 가닥. 그림(천 결 다섯 겹)은 패스 전체에 그려 두고, 마스크 두 장으로 보이는 구간을 정한다.
   entry 마스크는 날아오는 구간, exit 마스크는 스크롤하면 매듭 쪽부터 빠져나가는 구간. */
const MASK_W = 90;

function Belt({ b, delay, reduce, p }: { b: BeltDef; delay: number; reduce: boolean; p: MotionValue<number> }) {
  const x = useTransform(p, (v) => v * v * b.out[0]);
  const y = useTransform(p, (v) => v * v * b.out[1]);
  const exitOff = useTransform(p, (v) => (v <= 0 ? 0 : b.k + (1 - b.k) * clamp01(v * 1.15)));
  const exitLen = useTransform(exitOff, (v) => Math.max(0.0001, 1 - v));
  const entry = `tk-me-${b.key}`;
  const exit = `tk-mx-${b.key}`;
  const tailLen = 1 - b.k;

  return (
    <motion.g style={{ x, y }}>
      <defs>
        <mask id={entry} maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="7000" height="7000">
          <motion.path
            d={b.d}
            fill="none"
            stroke="#fff"
            strokeWidth={MASK_W}
            strokeLinecap="butt"
            initial={reduce ? false : { pathLength: 0.001, pathOffset: 0 }}
            animate={reduce ? { pathLength: tailLen, pathOffset: b.k } : { pathLength: [0.001, 0.3, tailLen], pathOffset: [0, b.k * 0.45, b.k] }}
            transition={reduce ? { duration: 0 } : { duration: FLY_DUR, delay, ease: EASE_FLY, times: [0, 0.55, 1] }}
          />
        </mask>
        <mask id={exit} maskUnits="userSpaceOnUse" x="-3000" y="-3000" width="7000" height="7000">
          <motion.path d={b.d} fill="none" stroke="#fff" strokeWidth={MASK_W} strokeLinecap="butt" style={{ pathLength: exitLen, pathOffset: exitOff }} />
        </mask>
      </defs>
      <g mask={`url(#${exit})`}>
        <g mask={`url(#${entry})`} fill="none" strokeLinecap="butt" strokeLinejoin="round">
          <path d={b.d} stroke="rgba(20,16,10,0.14)" strokeWidth="46" transform="translate(10 18)" />
          <path d={b.d} stroke={b.dark} strokeWidth="50" />
          <path d={b.d} stroke={b.base} strokeWidth="43" />
          <path d={b.d} stroke={b.seam} strokeWidth="31" />
          <path d={b.d} stroke={b.base} strokeWidth="28" />
          <path d={b.d} stroke={b.hi} strokeOpacity="0.55" strokeWidth="7" transform="translate(-2 -4)" />
        </g>
      </g>
    </motion.g>
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
            <div aria-hidden className="absolute bottom-[32px] left-[19px] top-[32px] w-[6px] rounded-full" style={{ background: "#c9c5bb" }} />
            {/* 차. 고른 정류장으로 간다 */}
            <motion.div
              aria-hidden
              className="absolute left-0 top-[10px] z-[1] flex h-11 w-11 items-center justify-center rounded-full border-[3px]"
              style={{ background: C.yellow, borderColor: C.black, color: C.black }}
              initial={false}
              animate={{ y: Math.min(stopIdx, stops.length - 1) * STOP_ROW }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 26 }}
            >
              <Bus size={20} />
            </motion.div>
            <ul role="radiogroup" aria-label="정류장" aria-describedby={legendId}>
              {route.stops.map((s, i) => {
                const last = i === route.stops.length - 1;
                const on = !last && i === Math.min(stopIdx, stops.length - 1);
                return (
                  <li key={s.name} className="relative" style={{ height: STOP_ROW }}>
                    <span aria-hidden className="absolute left-[12px] top-[25px] h-[20px] w-[20px] rounded-full border-[3px]" style={{ background: last ? C.black : "#fff", borderColor: C.black }} />
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
                        style={{ background: on ? C.yellowSoft : "transparent", outlineColor: C.ink }}
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
      <aside className="self-start rounded-[6px] border-2 p-5 md:p-6 lg:sticky lg:top-6" style={{ borderColor: C.black }} aria-live="polite">
        <p className="text-[15px] font-bold" style={{ color: C.muted }}>
          {route.label}, {cls.label}
        </p>
        <p className="mt-1 text-[22px] font-bold leading-snug">{stop.name}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-[4px] p-3" style={{ background: C.yellowSoft }}>
            <dt className="text-[14px] font-bold">등원 탑승</dt>
            <dd className="mt-1 text-[32px] leading-none tabular-nums" style={sfxF}>
              {hm(pickupAt(stop))}
            </dd>
          </div>
          <div className="rounded-[4px] p-3" style={{ background: C.paper }}>
            <dt className="text-[14px] font-bold">하원 도착</dt>
            <dd className="mt-1 text-[32px] leading-none tabular-nums" style={sfxF}>
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
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[4px] px-5 py-3 text-[17px] font-bold ${focusRing}`}
          style={{ background: C.black, color: "#fff", outlineColor: C.ink }}
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
        <div className="overflow-x-auto rounded-[6px] border" style={{ borderColor: C.line }} tabIndex={0} aria-label="수련 시간표, 좌우로 밀어서 보기" role="region">
          <table className="w-full min-w-[640px] border-collapse text-[15px]">
            <caption className="sr-only">부별 요일 수련 내용</caption>
            <thead>
              <tr style={{ background: C.black, color: "#fff" }}>
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
                        style={{ background: C.yellow }}
                        initial={false}
                        animate={{ scaleY: on ? 1 : 0 }}
                        transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
                      />
                      {r.label}
                      {on && <span className="sr-only"> (고른 부)</span>}
                    </th>
                    <td className="whitespace-nowrap px-3 py-3 tabular-nums" style={{ background: on ? C.yellowSoft : undefined }}>
                      {r.time}
                    </td>
                    {r.week.map((w, i) => (
                      <td key={i} className="px-2 py-3 text-center" style={{ background: on ? C.yellowSoft : undefined, color: w ? C.ink : C.muted, fontWeight: on && w ? 700 : 400 }}>
                        {w || "쉬어요"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-[6px] p-5" style={{ background: C.paper }} aria-live="polite">
          <p className="text-[15px] font-bold" style={{ color: C.muted }}>
            {part} 월 수련비
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={part}
              className="mt-1 text-[36px] leading-none tabular-nums"
              style={sfxF}
              initial={reduce ? false : { y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: -10, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.22, ease: EASE }}
            >
              {won(fee.fee)}
            </motion.p>
          </AnimatePresence>
          <ul className="mt-4 space-y-1.5 text-[15px] leading-[1.6]">
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

function BeltTest({ today, reduce }: { today: Date; reduce: boolean }) {
  const [idx, setIdx] = useState(1);
  const step = BELT_STEPS[idx];
  const nextColor = BELT_STEPS[idx + 1] ?? { color: C.black, edge: "#000" };
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
              className={`flex flex-col items-center gap-2 rounded-[4px] border-2 px-1 pb-2.5 pt-3 text-[15px] font-bold ${focusRing}`}
              style={{ borderColor: idx === i ? C.black : C.line, background: idx === i ? C.paper : "#fff", outlineColor: C.ink }}
            >
              <BeltSwatch color={b.color} edge={b.edge} split={b.name === "품띠"} />
              {b.name}
              {idx === i && <Check size={16} aria-hidden />}
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-[6px] border-2 p-5 md:p-6" style={{ borderColor: C.black }} aria-live="polite">
          <div className="flex items-center gap-3">
            <BeltSwatch color={step.color} edge={step.edge} split={step.name === "품띠"} />
            <span className="text-[15px] font-bold" style={{ color: C.muted }}>
              다음 띠
            </span>
            <motion.span key={step.next} initial={reduce ? false : { x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: reduce ? 0 : DUR, ease: EASE }}>
              <BeltSwatch color={nextColor.color} edge={nextColor.edge} split={step.next === "품띠"} />
            </motion.span>
          </div>
          <p className="mt-3 text-[28px] leading-tight" style={sfxF}>
            {step.next}
          </p>
          <dl className="mt-4 grid grid-cols-[92px_minmax(0,1fr)] gap-y-2.5 text-[16px] leading-[1.55]">
            <dt className="font-bold">심사 품새</dt>
            <dd>{step.poomsae}</dd>
            <dt className="font-bold">심사 항목</dt>
            <dd>{step.items}</dd>
            <dt className="font-bold">수련 기간</dt>
            <dd>{step.period}</dd>
            <dt className="font-bold">심사비</dt>
            <dd>{idx === BELT_STEPS.length - 1 ? "국기원 심사비 따로 안내" : `${won(TEST_FEE)}(새 띠, 수료증 포함)`}</dd>
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
              <li key={test.getTime()} className="flex items-center gap-4 rounded-[6px] border p-4" style={{ borderColor: i === 0 ? C.black : C.line, borderWidth: i === 0 ? 2 : 1 }}>
                <div className="flex h-[64px] w-[64px] flex-none flex-col items-center justify-center rounded-[4px]" style={{ background: i === 0 ? C.black : C.paper, color: i === 0 ? "#fff" : C.ink }}>
                  <span className="text-[13px] font-bold">{test.getMonth() + 1}월</span>
                  <span className="text-[26px] leading-none tabular-nums" style={sfxF}>
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
    <svg width="52" height="22" viewBox="0 0 52 22" aria-hidden className="flex-none">
      <rect x="1" y="3" width="50" height="16" rx="2" fill={color} stroke={edge} strokeWidth="2" />
      {split && <rect x="1" y="11" width="50" height="8" rx="1" fill={C.black} />}
      <path d="M2 8 H50 M2 14 H50" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
      <rect x="20" y="1" width="12" height="20" rx="2.5" fill={color} stroke={edge} strokeWidth="2" />
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
    <div className="rounded-[6px] border-2 p-5 md:p-8" style={{ borderColor: C.black }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={reduce ? false : { y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: reduce ? 0 : DUR, ease: EASE }} aria-live="polite">
            <p className="inline-flex items-center gap-2 text-[15px] font-bold" style={{ color: C.muted }}>
              <Check size={18} aria-hidden />
              접수 번호 <span className="tabular-nums">{done.no}</span>
            </p>
            <p className="mt-2 text-[28px] leading-tight" style={sfxF}>
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
              className={`mt-6 rounded-[4px] border px-4 py-2.5 text-[15px] font-bold ${focusRing}`}
              style={{ borderColor: C.black, outlineColor: C.ink }}
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
                <input id={agreeId} type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`h-5 w-5 ${focusRing}`} style={{ accentColor: C.black, outlineColor: C.ink }} />
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
                className={`inline-flex items-center gap-2 rounded-[4px] px-6 py-3 text-[17px] font-bold ${focusRing}`}
                style={{ background: C.yellow, color: C.ink, outlineColor: C.ink }}
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
