"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Check, ChevronDown, Clock, FileText, Lightbulb, MapPin, MessageCircle, Minus, Plus, Search, X } from "lucide-react";
import { IBM_Plex_Sans_KR, JetBrains_Mono } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 특허사무소 홈페이지 샘플: 가상의 곰파트너특허사무소. 특허, 실용신안, 상표, 디자인 출원을 맡는다.
   상호, 주소, 변리사 이름, 손님 이름, 아래 상표 목록은 모두 가상이다.

   국내 특허사무소 사이트 공통 구성(참고): 메뉴는 사무소 소개, 업무분야(특허, 상표, 디자인, 해외출원), 비용안내,
   출원절차, 상담신청, 오시는 길. 첫 화면에는 상표 검색창이나 "무료 상표 조사"와 상담 전화를 크게 둔다.
   비용은 관납료(특허청에 내는 돈)와 수수료(사무소 보수)를 나눠 적고 "부가세 별도"를 붙인다.
   상표는 상품류(제30류, 제43류처럼) 단위로 출원하고, 선출원주의라 먼저 낸 사람이 등록받는다는 안내가 흔하다.
   변리사 광고 규정에 맞춰 등록률, 성공 사례 숫자, 보장 표현은 쓰지 않는다.

   관납료 기준(특허청 수수료, 전자출원): 상표 출원료 1상품류 52,000원, 고시 상품명만 쓰면 46,000원(지정상품 10개까지, 넘으면 1개당 2,000원).
   상표 설정등록료 10년분 1상품류 201,000원(특허료 등의 징수규칙 제5조). 사무소 수수료는 이 샘플이 정한 개략 금액이다.
   특허 심사 기간은 심사청구 뒤 1차 결과까지 1년 안팎, 우선심사는 결정 뒤 몇 달 안으로 잡은 개략이다.

   포스터 첫 화면(po-poster): 흰 바탕, 검정 글자, 형광 빨강 형광펜. 큰 문장 "상표는 먼저 낸 사람이 가져가요".
   오른쪽(휴대폰은 아래)에 전구 특허 도면(분해도)이 있다. 유리구, 필라멘트, 나사 베이스, 절연체, 접점 다섯 부품이
   흩어져 있다가 제자리로 조립되고, 점선 지시선과 부호(10~50)가 그어진다. 필라멘트 뒤 빨간 빛이 8초 주기로 숨 쉰다.
   스크롤하면 부품이 축을 따라 위아래로 벌어지며(분해도) 중심선이 나타나고 문장은 위로 빠진다.
   동작 줄이기면 조립 완성 상태와 지시선을 그대로 두고 빛과 스크롤 분해는 멈춘다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 상표 출원 비용 계산: 상품류 개수, 고시 상품명 여부, 등록까지 포함 여부로 관납료와 수수료 개략.
   2. 특허 출원부터 등록까지: 일반심사, 우선심사를 바꾸면 기간 막대와 단계 위치가 바뀌고 단계를 누르면 설명.
   3. 상표 검색: 이름을 넣으면 비슷한 상표 예시 목록(상품류, 상태, 출원일, 유사 정도)이 빨간 선이 훑으며 나온다.
   4. 상담신청: 분야, 이름, 휴대폰, 내용. 접수 번호, 담당 창구, 회신 예정일을 보여 준다. */

const plexF = { fontFamily: `${IBM_Plex_Sans_KR.style.fontFamily}, sans-serif` } as const;
const monoF = { fontFamily: `${JetBrains_Mono.style.fontFamily}, ui-monospace, monospace` } as const;

const BRAND = "곰파트너특허사무소";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 7층";
const KAKAO = "카카오톡 채널 곰파트너";
const TEL = "02-000-0000";

const C = {
  paper: "#ffffff",
  ink: "#111111",
  /** 형광 빨강. 바탕으로만 쓰고 그 위 글자는 검정(대비 4.96) */
  red: "#ff1f3d",
  /** 흰 바탕 위 빨간 글자용(대비 5.5) */
  redInk: "#d4001f",
  redSoft: "#ffe3e7",
  gray: "#5c5c5c",
  line: "#d9d9d9",
  soft: "#f5f5f3",
  error: "#b42318",
};

/* 모션 상수. 시간은 초 */
/** 부품이 날아와 맞물리는 곡선 */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 조립 시간 0.95초, 지시선은 조립이 끝나갈 때 0.5초 동안 그린다. 전체 1.7초 안에 끝남 */
const ASSEMBLE = 0.95;
const LEADER_AT = 0.85;
const LEADER_DUR = 0.5;
const LEADER_GAP = 0.07;
/** 필라멘트 빛이 숨 쉬는 주기 */
const GLOW_LOOP = 8;
/** 포스터 스크롤 진행도 중 분해가 끝나는 지점 */
const EXIT_END = 0.6;
/** 검색 결과를 훑는 빨간 선 */
const SCAN_DUR = 0.9;
const ROW_GAP = 0.11;
/** 칩, 막대 전환 */
const DUR = 0.35;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/* ---------- 포스터 도면 데이터 ---------- */

type Part = {
  no: number;
  name: string;
  /** 흩어져 있을 때 자리와 기울기 */
  from: [number, number, number];
  /** 스크롤 분해 때 세로 이동량 */
  explode: number;
  /** 지시선. 부품 쪽 끝점부터 부호 쪽 끝점까지 */
  leader: string;
  label: [number, number];
  anchor: "start" | "end";
};

const PARTS: Part[] = [
  { no: 10, name: "유리구", from: [-150, -70, -16], explode: -150, leader: "M436 232 C470 214 492 200 522 192", label: [530, 198], anchor: "start" },
  { no: 20, name: "필라멘트", from: [190, -150, 28], explode: -50, leader: "M262 300 C210 300 150 318 98 330", label: [88, 336], anchor: "end" },
  { no: 30, name: "나사 베이스", from: [-170, 120, 32], explode: 40, leader: "M354 532 C410 532 460 528 512 524", label: [520, 530], anchor: "start" },
  { no: 40, name: "절연체", from: [170, 150, -38], explode: 100, leader: "M276 612 C220 620 160 636 108 644", label: [98, 650], anchor: "end" },
  { no: 50, name: "접점", from: [70, 210, 70], explode: 160, leader: "M308 640 C360 660 420 690 478 706", label: [486, 712], anchor: "start" },
];

const BULB_D =
  "M300 108 C392 108 454 178 454 268 C454 342 406 388 374 428 C361 444 356 458 356 478 L244 478 C244 458 239 444 226 428 C194 388 146 342 146 268 C146 178 208 108 300 108 Z";
/** 필라멘트 코일. 두 도입선 사이를 지그재그로 잇는다 */
const COIL_D = "M262 300 l6 -10 l6 20 l6 -20 l6 20 l6 -20 l6 20 l6 -20 l6 20 l6 -20 l6 20 l6 -20 l6 10";
/** 나사산 다섯 줄 */
const THREADS = [492, 512, 532, 552, 572];

/* ---------- 상표 검색 예시 ---------- */

const CLASSES = [
  { no: 30, goods: "커피, 빵, 과자" },
  { no: 43, goods: "카페업, 식당업" },
  { no: 35, goods: "도소매업, 광고업" },
  { no: 25, goods: "의류, 신발" },
  { no: 3, goods: "화장품, 비누" },
  { no: 9, goods: "앱, 소프트웨어" },
  { no: 41, goods: "교육업, 학원업" },
  { no: 29, goods: "육류, 김치, 반찬" },
];
const STATUSES = ["등록", "출원", "등록", "거절", "소멸", "출원"] as const;
type Level = "높음" | "중간" | "낮음";
const SWAP = ["담", "봄", "솔", "온", "빛", "루", "결", "숲"];
const PREFIX = ["더", "참", "새", "한"];

function hashOf(s: string) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0)!, 16777619);
  return h >>> 0;
}

type Mark = { name: string; cls: (typeof CLASSES)[number]; status: (typeof STATUSES)[number]; daysBefore: number; level: Level; no: string };

/** 입력한 이름으로 비슷한 상표 예시 6건을 만든다. 같은 이름이면 늘 같은 목록 */
function similarMarks(raw: string): Mark[] {
  const s = raw.replace(/\s+/g, "").slice(0, 10) || "곰빵";
  const chars = [...s];
  const h = hashOf(s);
  const pick = <T,>(arr: readonly T[], k: number) => arr[(h >>> k) % arr.length];
  const last = chars[chars.length - 1];
  const head = chars.slice(0, -1).join("");
  const names: [string, Level][] = [
    [`${s}하우스`, "높음"],
    [`${pick(PREFIX, 3)}${s}`, "높음"],
    [chars.length > 1 ? `${head}${pick(SWAP, 5)}` : `${s}${pick(SWAP, 5)}`, "중간"],
    [`${s} 랩`, "중간"],
    [chars.length > 1 ? [...chars].reverse().join("") : `${pick(SWAP, 7)}${s}`, "낮음"],
    [`${pick(SWAP, 9)}${last}`, "낮음"],
  ];
  return names.map(([name, level], i) => {
    const k = (h >>> (i * 3)) ^ (i * 2654435761);
    const days = 40 + ((k >>> 0) % 2400);
    return {
      name,
      level,
      cls: CLASSES[((k >>> 4) >>> 0) % CLASSES.length],
      status: STATUSES[((k >>> 8) >>> 0) % STATUSES.length],
      daysBefore: days,
      no: `40-${p2(((k >>> 2) >>> 0) % 7 + 19)}-${String(((k >>> 6) >>> 0) % 900000 + 100000).padStart(7, "0")}`,
    };
  });
}

/* ---------- 비용 ---------- */

/** 특허청 관납료(전자출원, 1상품류) */
const FEE_FILE = 52000;
const FEE_FILE_NOTICED = 46000;
const FEE_REG_10Y = 201000;
/** 사무소 수수료 개략(부가세 별도). 첫 류와 추가 류를 나눈다 */
const AGENT_FILE_FIRST = 200000;
const AGENT_FILE_MORE = 150000;
const AGENT_REG = 150000;

/* ---------- 특허 단계 ---------- */

type Track = "일반심사" | "우선심사";
type Step = { name: string; at: Record<Track, number>; when: Record<Track, string>; body: string };
/** at은 출원일부터 몇 개월째인지(개략) */
const STEPS: Step[] = [
  {
    name: "출원",
    at: { 일반심사: 0, 우선심사: 0 },
    when: { 일반심사: "상담 뒤 2~4주", 우선심사: "상담 뒤 2~4주" },
    body: "발명 내용을 듣고 명세서와 도면을 써서 특허청에 냅니다. 출원한 날이 권리의 기준일이 돼요.",
  },
  {
    name: "심사청구",
    at: { 일반심사: 0, 우선심사: 1 },
    when: { 일반심사: "보통 출원과 같이", 우선심사: "출원 뒤 우선심사 신청" },
    body: "심사청구를 해야 심사가 시작됩니다. 출원일부터 3년 안에 하면 되지만 보통 출원과 같이 냅니다.",
  },
  {
    name: "1차 심사 결과",
    at: { 일반심사: 14, 우선심사: 4 },
    when: { 일반심사: "심사청구 뒤 1년 안팎", 우선심사: "우선심사 결정 뒤 2~3개월" },
    body: "심사관이 먼저 나온 기술과 비교합니다. 거절이유가 있으면 의견제출통지서가 와요.",
  },
  {
    name: "의견서, 보정서",
    at: { 일반심사: 16, 우선심사: 6 },
    when: { 일반심사: "통지 뒤 2개월 안", 우선심사: "통지 뒤 2개월 안" },
    body: "거절이유에 맞춰 청구범위를 고치거나 의견서를 냅니다. 기한은 연장할 수 있어요.",
  },
  {
    name: "등록결정",
    at: { 일반심사: 18, 우선심사: 8 },
    when: { 일반심사: "의견서 뒤 2개월 안팎", 우선심사: "의견서 뒤 1~2개월" },
    body: "등록결정서를 받은 날부터 3개월 안에 설정등록료(1~3년분)를 냅니다.",
  },
  {
    name: "등록",
    at: { 일반심사: 19, 우선심사: 9 },
    when: { 일반심사: "등록료 납부 뒤 바로", 우선심사: "등록료 납부 뒤 바로" },
    body: "특허권이 생기고 등록공고가 납니다. 권리는 출원일부터 20년이에요. 4년차부터 해마다 연차료를 냅니다.",
  },
];
const TRACK_TOTAL: Record<Track, string> = { 일반심사: "약 1년 6개월 ~ 2년", 우선심사: "약 6개월 ~ 1년" };
const SCALE_MONTHS = 21;

/* ---------- 영업시간 ---------- */
const HOURS = [
  ["평일", "09:00 ~ 18:00"],
  ["토요일", "예약 상담만"],
  ["일요일, 공휴일", "휴무"],
] as const;

const nextWorkday = (d: Date) => {
  let n = daysAgo(d, -1);
  while (n.getDay() === 0 || n.getDay() === 6) n = daysAgo(n, -1);
  return n;
};

const TOPICS = ["상표", "특허", "디자인", "기타"] as const;
type Topic = (typeof TOPICS)[number];

export function PatentOfficeDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [topic, setTopic] = useState<Topic>("상표");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const toConsult = (t: Topic, note?: string) => {
    setTopic(t);
    if (note) setMemo(note);
    go("po-consult");
  };

  const navBtn = `rounded-[2px] px-2.5 py-1.5 text-[15px] font-semibold underline-offset-[6px] hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip pb-24" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("po-consult")} />

      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b px-4 py-4 md:px-6" style={{ borderColor: C.ink }}>
        <p className="inline-flex items-center gap-2 text-[19px] font-bold leading-none" style={plexF}>
          <BulbMark size={22} />
          {BRAND}
        </p>
        <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center" style={{ outlineColor: C.ink }}>
          {[
            ["po-search", "상표 검색"],
            ["po-fee", "비용안내"],
            ["po-steps", "출원절차"],
            ["po-office", "사무소 소개"],
            ["po-consult", "상담신청"],
            ["po-visit", "오시는 길"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.ink }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* 상표 검색 */}
      <section id="po-search" aria-labelledby="po-search-title" className="mx-auto mt-12 max-w-[1200px] scroll-mt-4 px-4 md:mt-16 md:px-6">
        <h2 id="po-search-title" className="text-[30px] font-bold leading-tight tracking-[-0.02em] md:text-[40px]" style={plexF}>
          상표 검색
        </h2>
        <TrademarkSearch reduce={reduce} today={today} onConsult={(name) => toConsult("상표", `"${name}" 상표 출원 문의`)} />
      </section>

      {/* 비용 */}
      <section id="po-fee" aria-labelledby="po-fee-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="po-fee-title" title="상표 출원 비용" />
        <FeeCalc reduce={reduce} onConsult={() => toConsult("상표")} />
      </section>

      {/* 특허 단계 */}
      <section id="po-steps" aria-labelledby="po-steps-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="po-steps-title" title="특허 출원부터 등록까지" />
        <PatentSteps reduce={reduce} />
      </section>

      {/* 사무소 소개 */}
      <section id="po-office" aria-labelledby="po-office-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="po-office-title" title="사무소 소개" />
        <Office />
      </section>

      {/* 상담신청 */}
      <section id="po-consult" aria-labelledby="po-consult-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="po-consult-title" title="상담신청" />
        <ConsultForm reduce={reduce} today={today} topic={topic} setTopic={setTopic} memo={memo} setMemo={setMemo} />
      </section>

      {/* 오시는 길 */}
      <section id="po-visit" aria-labelledby="po-visit-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="po-visit-title" title="오시는 길" />
        <Visit today={today} />
      </section>

      <footer className="mx-auto mt-20 max-w-[1200px] border-t px-4 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.ink, color: C.gray }}>
        <p className="text-[15px] font-bold" style={{ color: C.ink }}>
          {BRAND}
        </p>
        <p>
          {ADDRESS} / 전화 {TEL} / {KAKAO}
        </p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

/* ---------- 공용 ---------- */

function SectionTitle({ id, title }: { id: string; title: string }) {
  return (
    <div className="mb-6 flex items-end gap-4 border-b pb-3 md:mb-8" style={{ borderColor: C.ink }}>
      <h2 id={id} className="text-[26px] font-bold leading-tight tracking-[-0.02em] md:text-[32px]" style={plexF}>
        {title}
      </h2>
    </div>
  );
}

function BulbMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2.5c4 0 6.8 2.9 6.8 6.6 0 2.6-1.6 4.2-2.7 5.6-.6.8-.9 1.5-.9 2.4H8.8c0-.9-.3-1.6-.9-2.4C6.8 13.3 5.2 11.7 5.2 9.1 5.2 5.4 8 2.5 12 2.5z" fill={C.red} stroke={C.ink} strokeWidth="1.6" />
      <path d="M8.8 17.1h6.4v2.2H8.8zM10 19.3h4l-.6 2.2h-2.8z" fill={C.ink} />
    </svg>
  );
}

/* ---------- 포스터 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 0 : Math.min(1, v / EXIT_END)));
  // 문장은 위로 빠지고, 도면은 축을 따라 벌어진 뒤 옅어진다
  const textY = useTransform(p, (v) => `${-v * 42}svh`);
  const textO = useTransform(p, (v) => Math.max(0, 1 - Math.max(0, v - 0.3) / 0.7));
  const drawO = useTransform(p, (v) => Math.max(0, 1 - Math.max(0, v - 0.75) / 0.25));
  const axisO = useTransform(p, (v) => Math.min(1, v / 0.4));
  const spread = [
    useTransform(p, (v) => PARTS[0].explode * v),
    useTransform(p, (v) => PARTS[1].explode * v),
    useTransform(p, (v) => PARTS[2].explode * v),
    useTransform(p, (v) => PARTS[3].explode * v),
    useTransform(p, (v) => PARTS[4].explode * v),
  ];

  return (
    <section id="po-poster" ref={ref} aria-labelledby="po-poster-title" className="relative" style={{ height: reduce ? undefined : "180svh", background: C.paper }}>
      <div className={`${reduce ? "relative min-h-svh" : "sticky top-0 h-svh"} overflow-hidden`} style={{ background: C.paper, color: C.ink }}>
        {/* 도면 */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-[1svh] flex h-[55svh] justify-center md:inset-y-0 md:left-auto md:right-[2vw] md:h-full md:items-center"
          style={{ opacity: drawO }}
        >
          <svg viewBox="0 0 640 800" className="h-full w-auto md:h-[88svh]" role="img" aria-label="전구 특허 도면. 유리구, 필라멘트, 나사 베이스, 절연체, 접점에 부호 10부터 50까지 지시선이 달려 있다">
            <defs>
              <radialGradient id="po-glass" cx="0.38" cy="0.32" r="0.75">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="0.55" stopColor="#f3f3f1" />
                <stop offset="0.85" stopColor="#d9d9d6" />
                <stop offset="1" stopColor="#b9b9b5" />
              </radialGradient>
              <linearGradient id="po-glass-edge" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#000" stopOpacity="0" />
                <stop offset="0.7" stopColor="#000" stopOpacity="0" />
                <stop offset="1" stopColor="#000" stopOpacity="0.18" />
              </linearGradient>
              <linearGradient id="po-metal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#6d6d6a" />
                <stop offset="0.28" stopColor="#e9e9e6" />
                <stop offset="0.42" stopColor="#ffffff" />
                <stop offset="0.7" stopColor="#9b9b97" />
                <stop offset="1" stopColor="#4a4a47" />
              </linearGradient>
              <linearGradient id="po-black" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#050505" />
                <stop offset="0.35" stopColor="#4a4a4a" />
                <stop offset="0.55" stopColor="#1a1a1a" />
                <stop offset="1" stopColor="#000" />
              </linearGradient>
              <radialGradient id="po-tip" cx="0.4" cy="0.3" r="0.8">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="0.5" stopColor="#b8b8b4" />
                <stop offset="1" stopColor="#5a5a57" />
              </radialGradient>
              <radialGradient id="po-glow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor={C.red} stopOpacity="0.85" />
                <stop offset="0.45" stopColor={C.red} stopOpacity="0.3" />
                <stop offset="1" stopColor={C.red} stopOpacity="0" />
              </radialGradient>
              <radialGradient id="po-floor" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#000" stopOpacity="0.28" />
                <stop offset="1" stopColor="#000" stopOpacity="0" />
              </radialGradient>
              {PARTS.map((pt, i) => (
                <mask key={pt.no} id={`po-lm-${pt.no}`} maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="800">
                  <motion.path
                    d={pt.leader}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="10"
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: reduce ? 0 : LEADER_DUR, delay: reduce ? 0 : LEADER_AT + i * LEADER_GAP, ease: "easeOut" }}
                  />
                </mask>
              ))}
            </defs>

            {/* 바닥 그림자 */}
            <ellipse cx="300" cy="752" rx="150" ry="16" fill="url(#po-floor)" />

            {/* 분해 때 보이는 중심선(일점쇄선) */}
            <motion.line x1="300" y1="40" x2="300" y2="790" stroke={C.ink} strokeWidth="1.2" strokeDasharray="22 6 3 6" style={{ opacity: axisO }} />

            {PARTS.map((pt, i) => (
              <motion.g key={pt.no} style={{ y: spread[i] }}>
                <motion.g
                  initial={reduce ? false : { x: pt.from[0], y: pt.from[1], rotate: pt.from[2] }}
                  animate={{ x: 0, y: 0, rotate: 0 }}
                  transition={{ duration: reduce ? 0 : ASSEMBLE, delay: reduce ? 0 : i * 0.04, ease: EASE }}
                  style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
                >
                  <PartShape no={pt.no} reduce={reduce} />
                </motion.g>
                {/* 지시선과 부호 */}
                <g mask={`url(#po-lm-${pt.no})`}>
                  <path d={pt.leader} fill="none" stroke={C.ink} strokeWidth="1.6" strokeDasharray="5 5" />
                </g>
                <motion.text
                  x={pt.label[0]}
                  y={pt.label[1]}
                  textAnchor={pt.anchor}
                  fontSize="26"
                  fontWeight="600"
                  fill={C.ink}
                  style={monoF}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduce ? 0 : 0.2, delay: reduce ? 0 : LEADER_AT + LEADER_DUR * 0.8 + i * LEADER_GAP }}
                >
                  {pt.no}
                </motion.text>
              </motion.g>
            ))}

            <text x="300" y="792" textAnchor="middle" fontSize="22" fontWeight="600" fill={C.ink} style={monoF}>
              도 1
            </text>
          </svg>
        </motion.div>

        {/* 로고와 핵심 행동 하나 */}
        <motion.div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4 md:px-12 md:pt-7" style={{ y: textY }}>
          <p className="inline-flex items-center gap-2 text-[17px] font-bold leading-none" style={plexF}>
            <BulbMark size={20} />
            {BRAND}
          </p>
          <button
            type="button"
            onClick={onCta}
            aria-label="상담신청"
            title="상담신청"
            data-gtm-cta="patent-office_poster_cta"
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full border-2 ${focusRing}`}
            style={{ background: C.red, color: C.ink, borderColor: C.ink, outlineColor: C.ink }}
          >
            <MessageCircle size={22} aria-hidden />
          </button>
        </motion.div>

        {/* 큰 문장 */}
        <motion.div className="relative z-[1] flex h-full flex-col px-4 pt-[13svh] md:justify-center md:px-12 md:pb-[4svh] md:pt-0" style={{ y: textY, opacity: textO }}>
          <h1
            id="po-poster-title"
            className="text-[clamp(52px,13.4vw,72px)] font-bold leading-[1.12] tracking-[-0.045em] md:text-[clamp(104px,8.6vw,176px)] md:leading-[1.06]"
            style={{ ...plexF, wordBreak: "keep-all" }}
          >
            <span className="block">상표는</span>
            <span className="relative block w-fit">
              <motion.span
                aria-hidden
                className="absolute -inset-x-[0.06em] bottom-[0.06em] top-[0.18em] -z-10 origin-left"
                style={{ background: C.red }}
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.35, ease: EASE }}
              />
              먼저 낸 사람이
            </span>
            <span className="block">가져가요</span>
          </h1>
          <p className="mt-5 text-[16px] font-semibold md:mt-8 md:text-[19px]" style={{ color: C.gray }}>
            특허, 상표, 디자인 출원 / 평일 09:00 ~ 18:00
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function PartShape({ no, reduce }: { no: number; reduce: boolean }) {
  if (no === 10)
    return (
      <g>
        <path d={BULB_D} fill="url(#po-glass)" />
        <path d={BULB_D} fill="url(#po-glass-edge)" />
        <path d={BULB_D} fill="none" stroke={C.ink} strokeWidth="3.2" strokeLinejoin="round" />
        {/* 유리 하이라이트 */}
        <path d="M196 214 C212 172 246 146 282 136" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
        <path d="M188 262 C188 250 190 240 193 232" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        {/* 단면 해칭 몇 줄 */}
        <g stroke={C.ink} strokeWidth="1" opacity="0.55">
          <path d="M412 330 L436 306" />
          <path d="M402 346 L432 316" />
          <path d="M392 362 L424 330" />
        </g>
      </g>
    );
  if (no === 20)
    return (
      <g>
        {/* 빛. 필라멘트 뒤에서 숨 쉰다 */}
        <motion.ellipse
          cx="300"
          cy="296"
          rx="96"
          ry="78"
          fill="url(#po-glow)"
          initial={false}
          animate={reduce ? { opacity: 0.55 } : { opacity: [0.35, 0.8, 0.35] }}
          transition={reduce ? { duration: 0 } : { duration: GLOW_LOOP, repeat: Infinity, ease: "easeInOut", delay: ASSEMBLE }}
        />
        {/* 유리 스템 */}
        <path d="M282 470 C284 430 290 410 292 380 L308 380 C310 410 316 430 318 470 Z" fill="#ececea" stroke={C.ink} strokeWidth="2" />
        {/* 도입선 */}
        <path d="M262 300 L262 330 L290 400 L290 476" fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M338 300 L338 330 L310 400 L310 476" fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinejoin="round" />
        <path d={COIL_D} fill="none" stroke={C.ink} strokeWidth="3" strokeLinejoin="round" />
        <path d="M300 380 L300 296" stroke={C.ink} strokeWidth="1.6" />
      </g>
    );
  if (no === 30)
    return (
      <g>
        <rect x="244" y="478" width="112" height="106" rx="6" fill="url(#po-metal)" stroke={C.ink} strokeWidth="3" />
        {THREADS.map((y) => (
          <g key={y}>
            <path d={`M246 ${y + 4} Q300 ${y + 16} 354 ${y - 2}`} fill="none" stroke="#3a3a37" strokeWidth="2.4" />
            <path d={`M246 ${y + 8} Q300 ${y + 19} 354 ${y + 2}`} fill="none" stroke="#fff" strokeWidth="1.4" opacity="0.7" />
          </g>
        ))}
        <path d="M262 486 L262 578" stroke="#fff" strokeWidth="4" opacity="0.7" strokeLinecap="round" />
      </g>
    );
  if (no === 40)
    return (
      <g>
        <path d="M256 584 L344 584 L330 620 L270 620 Z" fill="url(#po-black)" stroke={C.ink} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M270 590 L282 590" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
      </g>
    );
  return (
    <g>
      <path d="M278 620 L322 620 C322 638 312 648 300 648 C288 648 278 638 278 620 Z" fill="url(#po-tip)" stroke={C.ink} strokeWidth="2.5" />
      <path d="M287 627 C289 634 293 638 298 640" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  );
}

/* ---------- 3. 상표 검색 ---------- */

const LEVEL_STYLE: Record<Level, { bg: string; color: string; bar: number }> = {
  높음: { bg: C.red, color: C.ink, bar: 3 },
  중간: { bg: C.redSoft, color: C.ink, bar: 2 },
  낮음: { bg: C.soft, color: C.gray, bar: 1 },
};

function TrademarkSearch({ reduce, today, onConsult }: { reduce: boolean; today: Date; onConsult: (name: string) => void }) {
  const [input, setInput] = useState("곰빵");
  const [query, setQuery] = useState("곰빵");
  const [scan, setScan] = useState(0);
  const marks = useMemo(() => similarMarks(query), [query]);
  const high = marks.filter((m) => m.level === "높음" && m.status !== "거절" && m.status !== "소멸").length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim();
    if (!v) return;
    setQuery(v);
    setScan((n) => n + 1);
  };
  const animateRows = scan > 0 && !reduce;

  return (
    <div className="mt-5">
      <form onSubmit={submit} role="search" className="flex max-w-[720px] items-stretch border-2" style={{ borderColor: C.ink }}>
        <label htmlFor="po-q" className="sr-only">
          상표 이름
        </label>
        <input
          id="po-q"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 14))}
          placeholder="상표 이름 입력"
          className="min-w-0 flex-1 px-4 py-3 text-[19px] font-semibold outline-none md:text-[22px]"
          style={{ background: C.paper, color: C.ink }}
          autoComplete="off"
        />
        <button type="submit" data-gtm-cta="patent-office_search" className={`inline-flex flex-none items-center gap-2 px-5 text-[17px] font-bold ${focusRing}`} style={{ background: C.red, color: C.ink, outlineColor: C.ink }}>
          <Search size={20} aria-hidden />
          검색
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[17px]" aria-live="polite">
          <b>&quot;{query}&quot;</b>와 비슷한 상표 {marks.length}건
          {high > 0 && (
            <span className="ml-2 font-bold" style={{ color: C.redInk }}>
              살아 있는 비슷한 상표 {high}건
            </span>
          )}
        </p>
        <p className="text-[14px]" style={{ color: C.gray }}>
          {fmtDot(today)} 기준
        </p>
      </div>

      <div className="relative mt-3 overflow-hidden border-t-2" style={{ borderColor: C.ink }}>
        {/* 결과를 훑는 빨간 선 */}
        {animateRows && (
          <motion.div
            key={`scan-${scan}`}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
            style={{ borderTop: `4px solid ${C.red}` }}
            initial={{ y: "0%", opacity: 1 }}
            animate={{ y: ["0%", "100%"], opacity: [1, 1, 0] }}
            transition={{ duration: SCAN_DUR, ease: "easeInOut", times: [0, 0.9, 1] }}
          />
        )}
        <ul key={`list-${scan}`}>
          {marks.map((m, i) => {
            const lv = LEVEL_STYLE[m.level];
            const dead = m.status === "거절" || m.status === "소멸";
            return (
              <motion.li
                key={m.name + i}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b py-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.3fr)_90px_120px_130px] md:py-4"
                style={{ borderColor: C.line }}
                initial={animateRows ? { clipPath: "inset(0 0 100% 0)" } : false}
                animate={{ clipPath: "inset(0 0 0% 0)" }}
                transition={{ duration: animateRows ? 0.28 : 0, delay: animateRows ? 0.08 + i * ROW_GAP : 0, ease: EASE }}
              >
                <p className="min-w-0 truncate text-[19px] font-bold md:text-[21px]" style={{ ...plexF, textDecoration: dead ? "line-through" : undefined, color: dead ? C.gray : C.ink }}>
                  {m.name}
                </p>
                <p className="col-start-2 row-start-1 md:col-start-5">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[14px] font-bold" style={{ background: lv.bg, color: lv.color }}>
                    <span aria-hidden className="inline-flex gap-[2px]">
                      {[1, 2, 3].map((k) => (
                        <span key={k} className="h-3 w-[4px]" style={{ background: k <= lv.bar ? C.ink : "rgba(17,17,17,0.18)" }} />
                      ))}
                    </span>
                    유사 {m.level}
                  </span>
                </p>
                <p className="text-[14px] md:text-[15px]" style={{ color: C.gray }}>
                  제{m.cls.no}류 {m.cls.goods}
                </p>
                <p className="text-[14px] font-bold md:text-[15px]">{m.status}</p>
                <p className="text-[13px] md:text-[14px]" style={{ ...monoF, color: C.gray }}>
                  {m.no}
                  <span className="ml-2 md:ml-0 md:block">{fmtDot(daysAgo(today, m.daysBefore))}</span>
                </p>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-l-4 py-1 pl-4 md:flex-row md:items-center md:justify-between" style={{ borderColor: C.ink }}>
        <p className="text-[16px] leading-relaxed">
          같은 상품류에 비슷한 이름이 먼저 출원돼 있으면 거절될 수 있어요. 출원 전에 변리사가 직접 조사해 드려요.
        </p>
        <button
          type="button"
          onClick={() => onConsult(query)}
          data-gtm-cta="patent-office_search_consult"
          className={`inline-flex flex-none items-center justify-center gap-2 border-2 px-4 py-2.5 text-[16px] font-bold ${focusRing}`}
          style={{ borderColor: C.ink, outlineColor: C.ink }}
        >
          <FileText size={18} aria-hidden />이 이름으로 상담신청
        </button>
      </div>
    </div>
  );
}

/* ---------- 1. 상표 출원 비용 ---------- */

function FeeCalc({ reduce, onConsult }: { reduce: boolean; onConsult: () => void }) {
  const [n, setN] = useState(1);
  const [noticed, setNoticed] = useState(true);
  const [withReg, setWithReg] = useState(true);

  const govFile = (noticed ? FEE_FILE_NOTICED : FEE_FILE) * n;
  const agentFile = AGENT_FILE_FIRST + AGENT_FILE_MORE * (n - 1);
  const govReg = FEE_REG_10Y * n;
  const agentReg = AGENT_REG * n;
  const fileSum = govFile + agentFile;
  const regSum = govReg + agentReg;
  const total = fileSum + (withReg ? regSum : 0);

  const rows: { label: string; gov: number; agent: number; show: boolean }[] = [
    { label: "출원할 때", gov: govFile, agent: agentFile, show: true },
    { label: "등록할 때(10년분)", gov: govReg, agent: agentReg, show: withReg },
  ];

  const step = `inline-flex h-11 w-11 items-center justify-center border-2 disabled:opacity-30 ${focusRing}`;

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12">
      <div>
        <p className="text-[16px] font-bold">상품류 개수</p>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" className={step} style={{ borderColor: C.ink, outlineColor: C.ink }} onClick={() => setN((v) => Math.max(1, v - 1))} disabled={n <= 1} aria-label="상품류 줄이기">
            <Minus size={18} aria-hidden />
          </button>
          <output className="w-20 text-center text-[44px] font-bold leading-none" style={monoF} aria-live="polite">
            {n}
          </output>
          <button type="button" className={step} style={{ borderColor: C.ink, outlineColor: C.ink }} onClick={() => setN((v) => Math.min(10, v + 1))} disabled={n >= 10} aria-label="상품류 늘리기">
            <Plus size={18} aria-hidden />
          </button>
          <span className="text-[16px]" style={{ color: C.gray }}>
            개 류
          </span>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed" style={{ color: C.gray }}>
          카페라면 보통 제30류(커피, 빵)와 제43류(카페업) 두 개를 냅니다.
        </p>

        <fieldset className="mt-6 space-y-3">
          <legend className="sr-only">조건</legend>
          <Toggle checked={noticed} onChange={setNoticed} label="고시 상품명만 쓰기" sub="특허청이 정해 둔 상품 이름으로만 지정하면 관납료가 줄어요" />
          <Toggle checked={withReg} onChange={setWithReg} label="등록까지 포함" sub="심사를 통과하면 등록료를 한 번 더 냅니다" />
        </fieldset>
      </div>

      <div className="border-2 p-4 md:p-6" style={{ borderColor: C.ink }}>
        <table className="w-full text-left text-[15px] md:text-[16px]">
          <caption className="sr-only">상표 출원 비용 개략</caption>
          <thead>
            <tr className="border-b-2" style={{ borderColor: C.ink }}>
              <th scope="col" className="pb-2 font-bold">
                구분
              </th>
              <th scope="col" className="pb-2 text-right font-bold">
                관납료
              </th>
              <th scope="col" className="pb-2 text-right font-bold">
                수수료
              </th>
            </tr>
          </thead>
          <tbody style={monoF}>
            {rows.map((r) => (
              <tr key={r.label} className="border-b" style={{ borderColor: C.line, opacity: r.show ? 1 : 0.35 }}>
                <th scope="row" className="py-3 font-semibold" style={plexF}>
                  {r.label}
                  {!r.show && <span className="sr-only"> (빼고 계산)</span>}
                </th>
                <td className="py-3 text-right">{won(r.gov)}</td>
                <td className="py-3 text-right">{won(r.agent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <p className="text-[15px] font-bold">개략 합계</p>
          <p className="relative text-[34px] font-bold leading-none md:text-[42px]" style={monoF} aria-live="polite">
            <motion.span
              key={total}
              aria-hidden
              className="absolute -inset-x-1 bottom-0 top-[40%] -z-10 origin-left"
              style={{ background: C.red }}
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
            />
            <span className="relative">{won(total)}</span>
          </p>
        </div>
        <p className="mt-4 text-[14px] leading-relaxed" style={{ color: C.gray }}>
          수수료는 부가세 별도입니다. 지정상품이 류마다 10개를 넘으면 1개당 2,000원이 더 붙어요. 거절이유가 나와 의견서를 내면 따로 안내해 드립니다.
        </p>
        <button
          type="button"
          onClick={onConsult}
          data-gtm-cta="patent-office_fee_consult"
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-[17px] font-bold ${focusRing}`}
          style={{ background: C.ink, color: C.paper, outlineColor: C.ink }}
        >
          견적 상담신청
        </button>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: string; sub: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center border-2 peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2"
        style={{ borderColor: C.ink, background: checked ? C.red : C.paper, outlineColor: C.ink }}
      >
        {checked && <Check size={16} strokeWidth={3} />}
      </span>
      <span>
        <span className="block text-[16px] font-bold">{label}</span>
        <span className="block text-[14px] leading-relaxed" style={{ color: C.gray }}>
          {sub}
        </span>
      </span>
    </label>
  );
}

/* ---------- 2. 특허 단계 ---------- */

function PatentSteps({ reduce }: { reduce: boolean }) {
  const [track, setTrack] = useState<Track>("일반심사");
  const [sel, setSel] = useState(2);
  const step = STEPS[sel];
  const last = STEPS[STEPS.length - 1].at[track];
  const t = { duration: reduce ? 0 : 0.6, ease: EASE };

  return (
    <div>
      <div role="radiogroup" aria-label="심사 방식" className="inline-flex border-2" style={{ borderColor: C.ink }}>
        {(["일반심사", "우선심사"] as Track[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={track === k}
            onClick={() => setTrack(k)}
            className={`px-4 py-2 text-[16px] font-bold ${focusRing}`}
            style={{ background: track === k ? C.ink : C.paper, color: track === k ? C.paper : C.ink, outlineColor: C.ink }}
          >
            {k}
          </button>
        ))}
      </div>
      <p className="mt-4 text-[17px]">
        출원부터 등록까지 <b>{TRACK_TOTAL[track]}</b>
        <span className="ml-2 text-[14px]" style={{ color: C.gray }}>
          (개략)
        </span>
      </p>

      {/* 기간 막대. 눈금은 개월 */}
      <div className="relative mt-8 h-[92px] select-none" aria-hidden>
        <div className="absolute inset-x-0 top-[38px] h-[2px]" style={{ background: C.line }} />
        <motion.div className="absolute inset-x-0 top-[36px] h-[6px] origin-left" style={{ background: C.red }} initial={false} animate={{ scaleX: last / SCALE_MONTHS }} transition={t} />
        {[0, 6, 12, 18].map((m) => (
          <span key={m} className="absolute top-[56px] text-[13px]" style={{ ...monoF, left: `${(m / SCALE_MONTHS) * 100}%`, color: C.gray }}>
            {m === 0 ? "출원" : `${m}개월`}
          </span>
        ))}
        {STEPS.map((s, i) => (
          <motion.div key={s.name} className="pointer-events-none absolute inset-x-0 top-[30px]" initial={false} animate={{ x: `${(s.at[track] / SCALE_MONTHS) * 100}%` }} transition={t}>
            <span
              className="block h-[18px] w-[18px] -translate-x-1/2 rounded-full border-2"
              style={{ borderColor: C.ink, background: i === sel ? C.ink : C.paper }}
            />
          </motion.div>
        ))}
      </div>

      <div className="mt-2 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
        <ol className="border-t-2" style={{ borderColor: C.ink }}>
          {STEPS.map((s, i) => (
            <li key={s.name} className="border-b" style={{ borderColor: C.line }}>
              <button
                type="button"
                onClick={() => setSel(i)}
                aria-pressed={i === sel}
                className={`flex w-full items-center justify-between gap-3 py-3 text-left ${focusRing}`}
                style={{ outlineColor: C.ink }}
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-[58px] flex-none items-center justify-center text-[13px] font-bold" style={{ ...monoF, background: i === sel ? C.red : C.soft }}>
                    {s.at[track] === 0 ? "출원일" : `${s.at[track]}개월`}
                  </span>
                  <span className={`text-[17px] ${i === sel ? "font-bold" : "font-semibold"}`}>{s.name}</span>
                </span>
                <span className="text-right text-[14px]" style={{ color: C.gray }}>
                  {s.when[track]}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${sel}-${track}`}
            className="border-2 p-5 md:p-6"
            style={{ borderColor: C.ink }}
            initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            exit={reduce ? undefined : { clipPath: "inset(0 0 0 100%)" }}
            transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
          >
            <p className="text-[14px] font-bold" style={{ ...monoF, color: C.redInk }}>
              출원 뒤 {step.at[track]}개월 무렵
            </p>
            <h3 className="mt-2 text-[24px] font-bold" style={plexF}>
              {step.name}
            </h3>
            <p className="mt-3 text-[16px] leading-relaxed">{step.body}</p>
            <p className="mt-4 inline-flex items-center gap-2 text-[15px]" style={{ color: C.gray }}>
              <Clock size={16} aria-hidden />
              {step.when[track]}
            </p>
            {track === "우선심사" && sel === 1 && (
              <p className="mt-3 text-[15px] leading-relaxed">우선심사는 실제로 제품을 만들고 있거나 남이 따라 하고 있을 때처럼 정해진 사유가 있어야 신청할 수 있어요.</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="mt-4 text-[14px]" style={{ color: C.gray }}>
        출원일부터 1년 6개월이 지나면 등록 전이라도 출원 내용이 공개됩니다.
      </p>
    </div>
  );
}

/* ---------- 사무소 소개 ---------- */

function Office() {
  const fields = [
    { name: "특허, 실용신안", items: "제품 구조, 장치, 앱 기능, 제조 방법" },
    { name: "상표", items: "가게 이름, 브랜드, 로고, 상품 이름" },
    { name: "디자인", items: "제품 겉모양, 포장 용기, 아이콘" },
    { name: "심판, 분쟁", items: "거절결정 불복, 무효심판, 경고장 대응" },
  ];
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12">
      <div className="flex gap-5">
        <div className="relative h-[132px] w-[108px] flex-none border-2" style={{ borderColor: C.ink, background: C.soft }} aria-hidden>
          <svg viewBox="0 0 108 132" className="h-full w-full">
            <circle cx="54" cy="50" r="22" fill="#cfcfcb" />
            <path d="M14 132 C16 100 34 84 54 84 C74 84 92 100 94 132 Z" fill="#cfcfcb" />
          </svg>
        </div>
        <div>
          <p className="text-[14px] font-bold" style={{ color: C.redInk }}>
            대표 변리사
          </p>
          <p className="mt-1 text-[24px] font-bold" style={plexF}>
            김ㅎ늘
          </p>
          <p className="mt-3 text-[16px] leading-relaxed">상담부터 출원서 작성, 의견서까지 변리사가 직접 봅니다. 상표 출원 전 조사는 따로 비용을 받지 않아요.</p>
        </div>
      </div>
      <ul className="border-t-2" style={{ borderColor: C.ink }}>
        {fields.map((f) => (
          <li key={f.name} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-b py-3 md:grid-cols-[150px_minmax(0,1fr)]" style={{ borderColor: C.line }}>
            <span className="text-[17px] font-bold">{f.name}</span>
            <span className="text-[16px]" style={{ color: C.gray }}>
              {f.items}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- 4. 상담신청 ---------- */

type Sent = { no: string; name: string; phone: string; topic: Topic; reply: Date };

function ConsultForm({
  reduce,
  today,
  topic,
  setTopic,
  memo,
  setMemo,
}: {
  reduce: boolean;
  today: Date;
  topic: Topic;
  setTopic: (t: Topic) => void;
  memo: string;
  setMemo: (v: string) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState<Sent | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) return setErr("이름을 2글자 이상 적어 주세요.");
    if (!/^01\d{8,9}$/.test(digits)) return setErr("휴대폰 번호를 확인해 주세요.");
    if (!agree) return setErr("개인정보 수집에 동의해 주세요.");
    setErr(null);
    const seq = (hashOf(name + digits) % 900) + 100;
    setSent({
      no: `PO-${String(today.getFullYear()).slice(2)}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${seq}`,
      name: name.trim(),
      phone: digits,
      topic,
      reply: nextWorkday(today),
    });
  };

  const reset = () => {
    setSent(null);
    setName("");
    setPhone("");
    setMemo("");
    setAgree(false);
  };

  const field = `mt-1.5 w-full border-2 px-3 py-2.5 text-[16px] outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-1`;

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:gap-12">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="done"
            className="border-2 p-5 md:p-7"
            style={{ borderColor: C.ink }}
            initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
            role="status"
          >
            <p className="inline-flex items-center gap-2 px-2 py-1 text-[15px] font-bold" style={{ background: C.red }}>
              <Check size={18} strokeWidth={3} aria-hidden />
              상담신청 접수
            </p>
            <dl className="mt-5 grid grid-cols-[96px_minmax(0,1fr)] gap-y-3 text-[16px]">
              <dt style={{ color: C.gray }}>접수 번호</dt>
              <dd className="font-bold" style={monoF}>
                {sent.no}
              </dd>
              <dt style={{ color: C.gray }}>신청인</dt>
              <dd>
                {maskName(sent.name)} / {maskPhone(sent.phone)}
              </dd>
              <dt style={{ color: C.gray }}>분야</dt>
              <dd>{sent.topic}</dd>
              <dt style={{ color: C.gray }}>담당 창구</dt>
              <dd>
                {KAKAO} 또는 전화 {TEL}
              </dd>
              <dt style={{ color: C.gray }}>회신 예정</dt>
              <dd className="font-bold">{fmtKo(sent.reply)} 오전, 변리사가 직접 전화드려요</dd>
            </dl>
            <button type="button" onClick={reset} className={`mt-6 inline-flex items-center gap-2 border-2 px-4 py-2 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.ink, outlineColor: C.ink }}>
              <X size={16} aria-hidden />
              새로 신청
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate className="space-y-5" exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.15 }}>
            <fieldset>
              <legend className="text-[16px] font-bold">분야</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <label key={t} className="cursor-pointer">
                    <input type="radio" name="po-topic" className="peer sr-only" checked={topic === t} onChange={() => setTopic(t)} />
                    <span
                      className="inline-flex items-center gap-1.5 border-2 px-4 py-2 text-[16px] font-bold peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2"
                      style={{ borderColor: C.ink, background: topic === t ? C.ink : C.paper, color: topic === t ? C.paper : C.ink, outlineColor: C.ink }}
                    >
                      {topic === t && <Check size={15} strokeWidth={3} aria-hidden />}
                      {t}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-[15px] font-bold">
                이름
                <input value={name} onChange={(e) => setName(e.target.value)} className={field} style={{ borderColor: C.ink, outlineColor: C.ink }} autoComplete="name" />
              </label>
              <label className="block text-[15px] font-bold">
                휴대폰
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="010-0000-0000" className={field} style={{ borderColor: C.ink, outlineColor: C.ink }} autoComplete="tel" />
              </label>
            </div>
            <label className="block text-[15px] font-bold">
              문의 내용
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={4}
                placeholder="상표 이름, 쓰실 업종, 발명 내용을 간단히 적어 주세요"
                className={`${field} resize-y`}
                style={{ borderColor: C.ink, outlineColor: C.ink }}
              />
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-[15px]">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 flex-none" style={{ accentColor: C.ink }} />
              <span>개인정보 수집, 이용에 동의합니다(이름, 휴대폰. 상담 뒤 1년 보관)</span>
            </label>
            {err && (
              <p role="alert" className="text-[15px] font-bold" style={{ color: C.error }}>
                {err}
              </p>
            )}
            <button
              type="submit"
              data-gtm-cta="patent-office_consult_submit"
              className={`inline-flex w-full items-center justify-center gap-2 px-4 py-3.5 text-[18px] font-bold sm:w-auto sm:px-10 ${focusRing}`}
              style={{ background: C.red, color: C.ink, outlineColor: C.ink }}
            >
              상담신청
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <aside className="space-y-5">
        <div className="border-t-2 pt-4" style={{ borderColor: C.ink }}>
          <p className="text-[16px] font-bold">전화 상담</p>
          <p className="mt-1 text-[28px] font-bold" style={monoF}>
            {TEL}
          </p>
          <p className="mt-1 text-[15px]" style={{ color: C.gray }}>
            평일 09:00 ~ 18:00
          </p>
        </div>
        <div className="border-t-2 pt-4" style={{ borderColor: C.ink }}>
          <p className="inline-flex items-center gap-2 text-[16px] font-bold">
            <MessageCircle size={18} aria-hidden />
            {KAKAO}
          </p>
          <p className="mt-1 text-[15px] leading-relaxed" style={{ color: C.gray }}>
            로고 파일이나 제품 사진을 바로 보내실 수 있어요.
          </p>
        </div>
        <details className="group border-t-2 pt-4" style={{ borderColor: C.ink }}>
          <summary className={`flex cursor-pointer list-none items-center justify-between text-[16px] font-bold ${focusRing}`} style={{ outlineColor: C.ink }}>
            상담 때 있으면 좋은 것
            <ChevronDown size={18} aria-hidden className="transition-transform group-open:rotate-180" />
          </summary>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px] leading-relaxed">
            <li>상표: 이름, 로고 파일, 팔 상품이나 서비스</li>
            <li>특허: 도면이나 사진, 비슷한 제품 링크</li>
            <li>디자인: 제품 사진 여러 각도</li>
          </ul>
        </details>
      </aside>
    </div>
  );
}

/* ---------- 오시는 길 ---------- */

function Visit({ today }: { today: Date }) {
  const dow = today.getDay();
  const todayRow = dow === 0 ? 2 : dow === 6 ? 1 : 0;
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-12">
      {/* 그린 약도 */}
      <div className="relative aspect-[4/3] w-full border-2" style={{ borderColor: C.ink, background: C.soft }}>
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label="ㅇㅇ역 2번 출구에서 큰길을 따라 오른쪽으로 걸어 두 번째 건물에 사무소가 있는 약도">
          <path d="M0 170 H400" stroke="#fff" strokeWidth="34" />
          <path d="M120 0 V300" stroke="#fff" strokeWidth="24" />
          <path d="M0 170 H400" stroke={C.ink} strokeWidth="1.2" strokeDasharray="10 8" />
          {[
            [150, 92, 60, 52],
            [222, 92, 52, 52],
            [290, 92, 74, 52],
            [150, 200, 90, 60],
            [256, 200, 104, 60],
            [20, 92, 80, 52],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} fill="#e4e4e0" stroke={C.ink} strokeWidth="1" />
          ))}
          <rect x="222" y="92" width="52" height="52" fill={C.red} stroke={C.ink} strokeWidth="2" />
          <path d="M98 150 l14 0 l0 14" fill="none" stroke={C.ink} strokeWidth="2.4" />
          <text x="62" y="214" fontSize="15" fontWeight="700" fill={C.ink}>
            ㅇㅇ역 2번 출구
          </text>
          <path d="M138 186 C170 196 210 190 246 150" fill="none" stroke={C.ink} strokeWidth="2.4" strokeDasharray="6 6" />
          <text x="214" y="82" fontSize="15" fontWeight="700" fill={C.ink}>
            {BRAND}
          </text>
        </svg>
      </div>
      <div>
        <p className="inline-flex items-start gap-2 text-[18px] font-bold">
          <MapPin size={20} aria-hidden className="mt-0.5 flex-none" />
          {ADDRESS}
        </p>
        <ul className="mt-3 space-y-1 text-[16px] leading-relaxed">
          <li>ㅇㅇ역 2번 출구에서 걸어서 4분</li>
          <li>건물 지하 주차 가능, 상담 시 1시간 무료</li>
          <li>방문 상담은 예약해 주세요</li>
        </ul>
        <table className="mt-6 w-full border-t-2 text-[16px]" style={{ borderColor: C.ink }}>
          <caption className="sr-only">상담 시간</caption>
          <tbody>
            {HOURS.map(([d, h], i) => (
              <tr key={d} className="border-b" style={{ borderColor: C.line, fontWeight: i === todayRow ? 700 : 400 }}>
                <th scope="row" className="py-2.5 text-left font-[inherit]">
                  {d}
                  {i === todayRow && (
                    <span className="ml-2 px-1.5 py-0.5 text-[13px] font-bold" style={{ background: C.red }}>
                      오늘
                    </span>
                  )}
                </th>
                <td className="py-2.5 text-right" style={monoF}>
                  {h}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 inline-flex items-center gap-2 text-[15px]" style={{ color: C.gray }}>
          <Lightbulb size={16} aria-hidden />
          화상 상담도 가능해요
        </p>
      </div>
    </div>
  );
}
