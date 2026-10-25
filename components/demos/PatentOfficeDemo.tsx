"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Clock, FileText, Lightbulb, MapPin, MessageCircle, Minus, Plus, Search, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 특허사무소 홈페이지 샘플: 가상의 곰파트너 특허사무소. 특허, 실용신안, 상표, 디자인 출원을 맡는다.
   상호, 주소, 변리사 이름, 손님 이름, 아래 상표 목록은 모두 가상이다.

   국내 특허사무소 사이트 공통 구성(참고): 메뉴는 사무소 소개, 업무분야(특허, 상표, 디자인, 해외출원), 비용안내,
   출원절차, 상담신청, 오시는 길. 첫 화면에는 상표 검색창이나 "무료 상표 조사"와 상담 전화를 크게 둔다.
   비용은 관납료(특허청에 내는 돈)와 수수료(사무소 보수)를 나눠 적고 "부가세 별도"를 붙인다.
   상표는 상품류(제30류, 제43류처럼) 단위로 출원하고, 선출원주의라 먼저 낸 사람이 등록받는다는 안내가 흔하다.
   변리사 광고 규정에 맞춰 등록률, 성공 사례 숫자, 보장 표현은 쓰지 않는다.

   관납료 기준(특허청 수수료, 전자출원): 상표 출원료 1상품류 52,000원, 고시 상품명만 쓰면 46,000원(지정상품 10개까지, 넘으면 1개당 2,000원).
   상표 설정등록료 10년분 1상품류 201,000원(특허료 등의 징수규칙 제5조). 사무소 수수료는 이 샘플이 정한 개략 금액이다.
   특허 심사 기간은 심사청구 뒤 1차 결과까지 1년 안팎, 우선심사는 결정 뒤 몇 달 안으로 잡은 개략이다.

   사진 출처: Pexels 사진 6615086, 직원 사진은 AI 생성(Z-Image-Turbo)
   첫 화면(po-poster): 상단 메뉴, 가로로 긴 도면 사진 띠, 그 아래 특허, 상표, 디자인 3열 비교표(권리 비교표형).
   열 머리(휴대폰은 탭)를 고르면 그 열이 강조되고 표 아래 진행 순서가 바뀐다. 열마다 출원 상담 버튼은 상담신청의 분야를 미리 고른다.
   핵심 모션: 사진 띠가 1.06배에서 1배로 1.6초 동안 천천히 다가오고, 진행 순서는 짧게 바뀐다. 동작 줄이기면 모두 멈춘다.
   본문에서 움직임은 상표 검색 결과를 훑는 선 하나와 기간 막대 전환만 남겼다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 상표 출원 비용 계산: 상품류 개수, 고시 상품명 여부, 등록까지 포함 여부로 관납료와 수수료 개략.
   2. 특허 출원부터 등록까지: 일반심사, 우선심사를 바꾸면 기간 막대와 단계 위치가 바뀌고 단계를 누르면 설명.
   3. 상표 검색: 이름을 넣으면 비슷한 상표 예시 목록(상품류, 상태, 출원일, 유사 정도)이 빨간 선이 훑으며 나온다.
   4. 상담신청: 분야, 이름, 휴대폰, 내용. 접수 번호, 담당 창구, 회신 예정일을 보여 준다. */

const IMG = "/images/demo-patent-office";

const BRAND = "곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 7층";
const KAKAO = "카카오톡 채널 곰파트너";
const TEL = "02-000-0000";

const C = {
  paper: "#ffffff",
  ink: "#111111",
  body: "#4b4b4b",
  /** 강조색. 버튼, 선택된 칩, 작은 표시에만 쓴다(흰 글자 대비 7.6) */
  red: "#9b2c2c",
  /** 강조색을 옅게 깐 작은 표시 바탕 */
  redSoft: "#f5e9e9",
  gray: "#767676",
  line: "#e5e5e5",
  /** 입력칸 테두리 */
  field: "#c4c4c4",
  soft: "#f7f7f5",
  error: "#b42318",
};

/* 모션 상수. 시간은 초 */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 첫 화면 사진이 다가오는 시간과 시작 배율 */
const ZOOM = 1.6;
const ZOOM_FROM = 1.06;
/** 검색 결과를 훑는 선 */
const SCAN_DUR = 0.9;
const ROW_GAP = 0.11;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

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

  return (
    <div className="min-h-screen overflow-x-clip pb-24" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} go={go} onConsult={(t) => toConsult(t)} />


      {/* 상표 검색 */}
      <section id="po-search" aria-labelledby="po-search-title" className="mx-auto mt-12 max-w-[1200px] scroll-mt-4 px-4 md:mt-16 md:px-6">
        <h2 id="po-search-title" className="text-[30px] font-bold leading-tight tracking-[-0.02em] md:text-[40px]">
          상표 검색
        </h2>
        <TrademarkSearch reduce={reduce} today={today} onConsult={(name) => toConsult("상표", `"${name}" 상표 출원 문의`)} />
      </section>

      {/* 비용 */}
      <section id="po-fee" aria-labelledby="po-fee-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="po-fee-title" title="상표 출원 비용" />
        <FeeCalc onConsult={() => toConsult("상표")} />
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

      <footer className="mx-auto mt-20 max-w-[1200px] border-t px-4 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.gray }}>
        <p className="text-[15px] font-bold" style={{ color: C.ink }}>
          <SampleLogo size={18} />
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
    <div className="mb-6 flex items-end gap-4 border-b pb-3 md:mb-8" style={{ borderColor: C.line }}>
      <h2 id={id} className="text-[26px] font-bold leading-tight tracking-[-0.02em] md:text-[32px]">
        {title}
      </h2>
    </div>
  );
}

/* ---------- 첫 화면: 메뉴 + 사진 띠 + 권리 비교표 ---------- */

type Right = "특허" | "상표" | "디자인";
const RIGHT_LIST: Right[] = ["특허", "상표", "디자인"];

const RIGHT_ROWS: { label: string; v: Record<Right, string> }[] = [
  { label: "보호하는 것", v: { 특허: "제품 구조, 장치, 앱 기능, 제조 방법", 상표: "가게 이름, 브랜드, 로고, 상품 이름", 디자인: "제품 겉모양, 포장 용기, 아이콘" } },
  { label: "권리 기간", v: { 특허: "출원일부터 20년", 상표: "등록부터 10년분, 갱신", 디자인: "상담 때 안내" } },
  { label: "출원부터 등록까지", v: { 특허: `일반심사 ${TRACK_TOTAL.일반심사}, 우선심사 ${TRACK_TOTAL.우선심사}`, 상표: "상담 때 안내", 디자인: "상담 때 안내" } },
  { label: "관납료", v: { 특허: "상담 때 견적", 상표: `1상품류 ${won(FEE_FILE)}, 고시 상품명 ${won(FEE_FILE_NOTICED)}`, 디자인: "상담 때 견적" } },
  { label: "수수료", v: { 특허: "상담 때 견적", 상표: `첫 류 ${won(AGENT_FILE_FIRST)}, 부가세 별도`, 디자인: "상담 때 견적" } },
  { label: "준비할 자료", v: { 특허: "도면이나 사진, 비슷한 제품 링크", 상표: "이름, 로고 파일, 팔 상품이나 서비스", 디자인: "제품 사진 여러 각도" } },
];

const RIGHT_FLOW: Record<Right, { steps: string[]; links: [string, string][] }> = {
  특허: { steps: STEPS.map((s) => s.name), links: [["po-steps", "출원절차"]] },
  상표: { steps: ["선행 조사", "출원", "심사", "등록결정", "등록료 납부", "등록"], links: [["po-search", "상표 검색"], ["po-fee", "비용 계산"]] },
  디자인: { steps: ["상담", "출원", "심사", "등록결정", "등록"], links: [] },
};

const MENU: [string, string][] = [
  ["po-office", "사무소 소개"],
  ["po-rights", "업무영역"],
  ["po-fee", "비용안내"],
  ["po-steps", "출원절차"],
  ["po-search", "상표 검색"],
  ["po-visit", "오시는 길"],
];

const isAsk = (v: string) => v.startsWith("상담 때");

function Poster({ reduce, go, onConsult }: { reduce: boolean; go: (id: string) => void; onConsult: (t: Topic) => void }) {
  const [right, setRight] = useState<Right>("상표");
  const flow = RIGHT_FLOW[right];
  const menuBtn = `inline-flex min-h-11 flex-none items-center whitespace-nowrap rounded-[4px] px-3 text-[15px] font-semibold underline-offset-[6px] hover:underline ${focusRing}`;

  return (
    <section id="po-poster" aria-labelledby="po-poster-title" style={{ background: C.paper, color: C.ink }}>
      {/* 상단 메뉴. 넓은 화면은 한 줄, 좁으면 아래 줄을 가로로 민다 */}
      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <p className="inline-flex items-center gap-2 text-[19px] font-bold leading-none">
            <SampleLogo />
          </p>
          <nav aria-label="주요 메뉴" className="hidden items-center lg:flex">
            {MENU.map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={menuBtn} style={{ outlineColor: C.ink }}>
                {label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => onConsult(right)}
            data-gtm-cta="patent-office_poster_cta"
            className={`inline-flex min-h-11 flex-none items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`}
            style={{ background: C.red, color: "#fff", outlineColor: C.ink }}
          >
            <MessageCircle size={17} aria-hidden />
            상담신청
          </button>
        </div>
        <nav aria-label="주요 메뉴" className="flex overflow-x-auto border-t px-2 lg:hidden" style={{ borderColor: C.line, scrollbarWidth: "none" }}>
          {MENU.map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={menuBtn} style={{ outlineColor: C.ink }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* 가로로 긴 사진 띠. 사진 위에는 글자를 얹지 않는다 */}
      <div className="mx-auto max-w-[1200px] md:px-6 md:pt-6">
        <div className="relative aspect-[16/9] overflow-hidden md:aspect-auto md:h-[clamp(170px,24vh,260px)] md:rounded-[6px]" style={{ background: C.soft }}>
          <motion.div className="absolute inset-0" initial={reduce ? false : { scale: ZOOM_FROM }} animate={{ scale: 1 }} transition={reduce ? { duration: 0 } : { duration: ZOOM, ease: EASE }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
            <img
              src={`${IMG}/hero.jpg`}
              srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
              sizes="(min-width: 1200px) 1152px, 100vw"
              alt="짙은 남색 도면 위에 세운 제도용 컴퍼스"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "55% 45%" }}
            />
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 pt-6 md:px-6 md:pt-7">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h1 id="po-poster-title" className="text-[28px] font-bold md:text-[34px]" style={{ letterSpacing: "-0.03em", lineHeight: 1.25, wordBreak: "keep-all" }}>
            상표는 먼저 출원한 사람의 권리입니다
          </h1>
          <p className="text-[16px]" style={{ color: C.body }}>
            특허, 상표, 디자인 출원 / 평일 09:00 ~ 18:00
          </p>
        </div>
      </div>

      {/* 권리 비교 */}
      <div id="po-rights" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pb-4 pt-6 md:px-6 md:pt-8">
        <h2 className="sr-only">업무영역 비교</h2>

        {/* 좁은 화면: 탭 세 개와 고른 권리 한 열 */}
        <div className="md:hidden">
          <div role="tablist" aria-label="권리 종류" className="grid grid-cols-3 overflow-hidden rounded-[6px] border" style={{ borderColor: C.field }}>
            {RIGHT_LIST.map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={right === r}
                aria-controls="po-right-panel"
                onClick={() => setRight(r)}
                className={`min-h-11 text-[16px] font-semibold ${focusRing}`}
                style={{ background: right === r ? C.red : C.paper, color: right === r ? "#fff" : C.ink, outlineColor: C.ink }}
              >
                {r}
              </button>
            ))}
          </div>
          <dl id="po-right-panel" role="tabpanel" aria-label={`${right} 안내`} className="mt-3 border-t" style={{ borderColor: C.ink }}>
            {RIGHT_ROWS.map((row) => (
              <div key={row.label} className="grid grid-cols-[104px_minmax(0,1fr)] gap-3 border-b py-3 text-[15px]" style={{ borderColor: C.line }}>
                <dt className="font-bold">{row.label}</dt>
                <dd style={{ color: isAsk(row.v[right]) ? C.gray : C.ink }}>{row.v[right]}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* 넓은 화면: 3열 비교표. 열 머리를 누르면 그 열이 강조된다 */}
        <table className="hidden w-full table-fixed border-collapse text-left text-[15px] md:table">
          <caption className="sr-only">특허, 상표, 디자인 비교</caption>
          <colgroup>
            <col className="w-[150px] lg:w-[180px]" />
            {RIGHT_LIST.map((r) => (
              <col key={r} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <td />
              {RIGHT_LIST.map((r) => {
                const on = right === r;
                return (
                  <th key={r} scope="col" className="p-0 align-bottom">
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setRight(r)}
                      className={`flex min-h-12 w-full items-center gap-2 rounded-t-[6px] px-4 text-[19px] font-bold ${focusRing}`}
                      style={{ background: on ? C.red : C.soft, color: on ? "#fff" : C.ink, outlineColor: C.ink }}
                    >
                      {on && <Check size={17} strokeWidth={3} aria-hidden />}
                      {r}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {RIGHT_ROWS.map((row) => (
              <tr key={row.label} className="border-b" style={{ borderColor: C.line }}>
                <th scope="row" className="py-3 pr-3 align-top font-bold">
                  {row.label}
                </th>
                {RIGHT_LIST.map((r) => (
                  <td key={r} className="px-4 py-3 align-top" style={{ background: right === r ? C.redSoft : undefined, color: isAsk(row.v[r]) ? C.gray : C.ink }}>
                    {row.v[r]}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td />
              {RIGHT_LIST.map((r) => (
                <td key={r} className="px-4 pb-4 pt-4" style={{ background: right === r ? C.redSoft : undefined }}>
                  <button
                    type="button"
                    onClick={() => onConsult(r)}
                    data-gtm-cta={`patent-office_rights_${r}`}
                    className={`inline-flex min-h-11 items-center rounded-[6px] border px-4 text-[15px] font-semibold ${focusRing}`}
                    style={right === r ? { background: C.red, borderColor: C.red, color: "#fff", outlineColor: C.ink } : { background: C.paper, borderColor: C.field, color: C.ink, outlineColor: C.ink }}
                  >
                    {r} 출원 상담
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* 고른 권리의 진행 순서 */}
        <div className="mt-5 rounded-[6px] border p-4 md:p-5" style={{ borderColor: C.line }}>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-[16px] font-bold">{right} 진행 순서</p>
            <div className="flex flex-wrap gap-2">
              {flow.links.map(([id, label]) => (
                <button key={id} type="button" onClick={() => go(id)} className={`inline-flex min-h-11 items-center rounded-[6px] border px-3 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.field, outlineColor: C.ink }}>
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onConsult(right)}
                className={`inline-flex min-h-11 items-center rounded-[6px] px-3 text-[15px] font-semibold md:hidden ${focusRing}`}
                style={{ background: C.red, color: "#fff", outlineColor: C.ink }}
              >
                {right} 출원 상담
              </button>
            </div>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.ol
              key={right}
              className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-2"
              initial={reduce ? false : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: -8 }}
              transition={{ duration: reduce ? 0 : 0.2, ease: EASE }}
            >
              {flow.steps.map((s, i) => (
                <li key={s} className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-[15px]" style={{ background: C.soft }}>
                    <span className="text-[13px] font-bold tabular-nums" style={{ color: C.red }}>
                      {i + 1}
                    </span>
                    {s}
                  </span>
                  {i < flow.steps.length - 1 && <span aria-hidden className="h-px w-3 md:w-5" style={{ background: C.field }} />}
                </li>
              ))}
            </motion.ol>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. 상표 검색 ---------- */

const LEVEL_STYLE: Record<Level, { bg: string; color: string; bar: number }> = {
  높음: { bg: C.red, color: "#fff", bar: 3 },
  중간: { bg: C.redSoft, color: C.red, bar: 2 },
  낮음: { bg: C.soft, color: C.body, bar: 1 },
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
      <form onSubmit={submit} role="search" className="flex max-w-[720px] items-stretch overflow-hidden rounded-[6px] border" style={{ borderColor: C.field }}>
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
        <button type="submit" data-gtm-cta="patent-office_search" className={`inline-flex flex-none items-center gap-2 px-5 text-[17px] font-semibold ${focusRing}`} style={{ background: C.red, color: "#fff", outlineColor: C.ink }}>
          <Search size={20} aria-hidden />
          검색
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[17px]" aria-live="polite">
          <b>&quot;{query}&quot;</b>와 비슷한 상표 {marks.length}건
          {high > 0 && (
            <span className="ml-2 font-bold" style={{ color: C.red }}>
              살아 있는 비슷한 상표 {high}건
            </span>
          )}
        </p>
        <p className="text-[14px]" style={{ color: C.gray }}>
          {fmtDot(today)} 기준
        </p>
      </div>

      <div className="relative mt-3 overflow-hidden border-t" style={{ borderColor: C.line }}>
        {/* 결과를 훑는 빨간 선 */}
        {animateRows && (
          <motion.div
            key={`scan-${scan}`}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
            style={{ borderTop: `2px solid ${C.red}` }}
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
                <p className="min-w-0 truncate text-[19px] font-bold md:text-[21px]" style={{ textDecoration: dead ? "line-through" : undefined, color: dead ? C.gray : C.ink }}>
                  {m.name}
                </p>
                <p className="col-start-2 row-start-1 md:col-start-5">
                  <span className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-[14px] font-semibold" style={{ background: lv.bg, color: lv.color }}>
                    <span aria-hidden className="inline-flex gap-[2px]">
                      {[1, 2, 3].map((k) => (
                        <span key={k} className="h-3 w-[4px]" style={{ background: k <= lv.bar ? "currentColor" : "rgba(17,17,17,0.18)" }} />
                      ))}
                    </span>
                    유사 {m.level}
                  </span>
                </p>
                <p className="text-[14px] md:text-[15px]" style={{ color: C.gray }}>
                  제{m.cls.no}류 {m.cls.goods}
                </p>
                <p className="text-[14px] font-bold md:text-[15px]">{m.status}</p>
                <p className="text-[13px] md:text-[14px]" style={{ color: C.gray }}>
                  {m.no}
                  <span className="ml-2 md:ml-0 md:block">{fmtDot(daysAgo(today, m.daysBefore))}</span>
                </p>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-[6px] p-4 md:flex-row md:items-center md:justify-between" style={{ background: C.soft }}>
        <p className="text-[16px] leading-relaxed">
          같은 상품류에 비슷한 이름이 먼저 출원돼 있으면 거절될 수 있어요. 출원 전에 변리사가 직접 조사해 드려요.
        </p>
        <button
          type="button"
          onClick={() => onConsult(query)}
          data-gtm-cta="patent-office_search_consult"
          className={`inline-flex flex-none items-center justify-center gap-2 rounded-[6px] border bg-white px-4 py-2.5 text-[16px] font-semibold ${focusRing}`}
          style={{ borderColor: C.field, outlineColor: C.ink }}
        >
          <FileText size={18} aria-hidden />이 이름으로 상담신청
        </button>
      </div>
    </div>
  );
}

/* ---------- 1. 상표 출원 비용 ---------- */

function FeeCalc({ onConsult }: { onConsult: () => void }) {
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

  const step = `inline-flex h-11 w-11 items-center justify-center rounded-[6px] border disabled:opacity-30 ${focusRing}`;

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12">
      <div>
        <p className="text-[16px] font-bold">상품류 개수</p>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" className={step} style={{ borderColor: C.field, outlineColor: C.ink }} onClick={() => setN((v) => Math.max(1, v - 1))} disabled={n <= 1} aria-label="상품류 줄이기">
            <Minus size={18} aria-hidden />
          </button>
          <output className="w-20 text-center text-[44px] font-bold leading-none tabular-nums" aria-live="polite">
            {n}
          </output>
          <button type="button" className={step} style={{ borderColor: C.field, outlineColor: C.ink }} onClick={() => setN((v) => Math.min(10, v + 1))} disabled={n >= 10} aria-label="상품류 늘리기">
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

      <div className="rounded-[6px] border p-4 md:p-6" style={{ borderColor: C.line }}>
        <table className="w-full text-left text-[15px] md:text-[16px]">
          <caption className="sr-only">상표 출원 비용 개략</caption>
          <thead>
            <tr className="border-b" style={{ borderColor: C.ink }}>
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
          <tbody className="tabular-nums">
            {rows.map((r) => (
              <tr key={r.label} className="border-b" style={{ borderColor: C.line, opacity: r.show ? 1 : 0.35 }}>
                <th scope="row" className="py-3 font-semibold">
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
          <p className="text-[34px] font-bold leading-none md:text-[42px] tabular-nums" aria-live="polite">
            {won(total)}
          </p>
        </div>
        <p className="mt-4 text-[14px] leading-relaxed" style={{ color: C.gray }}>
          수수료는 부가세 별도입니다. 지정상품이 류마다 10개를 넘으면 1개당 2,000원이 더 붙어요. 거절이유가 나와 의견서를 내면 따로 안내해 드립니다.
        </p>
        <button
          type="button"
          onClick={onConsult}
          data-gtm-cta="patent-office_fee_consult"
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[6px] px-4 py-3 text-[17px] font-semibold ${focusRing}`}
          style={{ background: C.red, color: "#fff", outlineColor: C.ink }}
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
        className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-[4px] border-[1.5px] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2"
        style={{ borderColor: checked ? C.red : C.field, background: checked ? C.red : C.paper, outlineColor: C.ink }}
      >
        {checked && <Check size={16} strokeWidth={3} color="#fff" />}
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
      <div role="radiogroup" aria-label="심사 방식" className="inline-flex overflow-hidden rounded-[6px] border" style={{ borderColor: C.field }}>
        {(["일반심사", "우선심사"] as Track[]).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={track === k}
            onClick={() => setTrack(k)}
            className={`px-4 py-2 text-[16px] font-semibold ${focusRing}`}
            style={{ background: track === k ? C.red : C.paper, color: track === k ? "#fff" : C.ink, outlineColor: C.ink }}
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
        <motion.div className="absolute inset-x-0 top-[37px] h-[4px] origin-left" style={{ background: C.red }} initial={false} animate={{ scaleX: last / SCALE_MONTHS }} transition={t} />
        {[0, 6, 12, 18].map((m) => (
          <span key={m} className="absolute top-[56px] text-[13px]" style={{ left: `${(m / SCALE_MONTHS) * 100}%`, color: C.gray }}>
            {m === 0 ? "출원" : `${m}개월`}
          </span>
        ))}
        {STEPS.map((s, i) => (
          <motion.div key={s.name} className="pointer-events-none absolute inset-x-0 top-[30px]" initial={false} animate={{ x: `${(s.at[track] / SCALE_MONTHS) * 100}%` }} transition={t}>
            <span
              className="block h-[18px] w-[18px] -translate-x-1/2 rounded-full border-[1.5px]"
              style={{ borderColor: i === sel ? C.red : C.gray, background: i === sel ? C.red : C.paper }}
            />
          </motion.div>
        ))}
      </div>

      <div className="mt-2 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
        <ol className="border-t" style={{ borderColor: C.line }}>
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
                  <span className="inline-flex h-7 w-[58px] flex-none items-center justify-center rounded-[4px] text-[13px] font-semibold tabular-nums" style={{ background: i === sel ? C.red : C.soft, color: i === sel ? "#fff" : C.body }}>
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
            className="rounded-[6px] border p-5 md:p-6"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            exit={reduce ? undefined : { clipPath: "inset(0 0 0 100%)" }}
            transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
          >
            <p className="text-[14px] font-bold" style={{ color: C.red }}>
              출원 뒤 {step.at[track]}개월 무렵
            </p>
            <h3 className="mt-2 text-[24px] font-bold">
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
        <div className="relative h-[132px] w-[108px] flex-none overflow-hidden rounded-[6px] border" style={{ borderColor: C.line, background: C.soft }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/staff-1.jpg`}
            alt="대표 변리사 김ㅎ늘"
            width={108}
            height={132}
            loading="lazy"
            className="h-full w-full object-cover"
            style={{ objectPosition: "50% 20%" }}
          />
        </div>
        <div>
          <p className="text-[14px] font-bold" style={{ color: C.red }}>
            대표 변리사
          </p>
          <p className="mt-1 text-[24px] font-bold">
            김ㅎ늘
          </p>
          <p className="mt-3 text-[16px] leading-relaxed">상담부터 출원서 작성, 의견서까지 변리사가 직접 봅니다. 상표 출원 전 조사는 따로 비용을 받지 않아요.</p>
        </div>
      </div>
      <ul className="border-t" style={{ borderColor: C.line }}>
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

  const field = `mt-1.5 w-full rounded-[6px] border px-3 py-2.5 text-[16px] outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-1`;

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:gap-12">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="done"
            className="rounded-[6px] border p-5 md:p-7"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
            role="status"
          >
            <p className="inline-flex items-center gap-2 rounded-[4px] px-2 py-1 text-[15px] font-bold" style={{ background: C.redSoft, color: C.red }}>
              <Check size={18} strokeWidth={3} aria-hidden />
              상담신청 접수
            </p>
            <dl className="mt-5 grid grid-cols-[96px_minmax(0,1fr)] gap-y-3 text-[16px]">
              <dt style={{ color: C.gray }}>접수 번호</dt>
              <dd className="font-bold tabular-nums">
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
            <button type="button" onClick={reset} className={`mt-6 inline-flex items-center gap-2 rounded-[6px] border px-4 py-2 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.field, outlineColor: C.ink }}>
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
                      className="inline-flex items-center gap-1.5 rounded-[6px] border px-4 py-2 text-[16px] font-semibold peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2"
                      style={{ borderColor: topic === t ? C.red : C.field, background: topic === t ? C.red : C.paper, color: topic === t ? "#fff" : C.ink, outlineColor: C.ink }}
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
                <input value={name} onChange={(e) => setName(e.target.value)} className={field} style={{ borderColor: C.field, outlineColor: C.ink }} autoComplete="name" />
              </label>
              <label className="block text-[15px] font-bold">
                휴대폰
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="010-0000-0000" className={field} style={{ borderColor: C.field, outlineColor: C.ink }} autoComplete="tel" />
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
                style={{ borderColor: C.field, outlineColor: C.ink }}
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
              className={`inline-flex w-full items-center justify-center gap-2 rounded-[6px] px-4 py-3.5 text-[18px] font-semibold sm:w-auto sm:px-10 ${focusRing}`}
              style={{ background: C.red, color: "#fff", outlineColor: C.ink }}
            >
              상담신청
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <aside className="space-y-5">
        <div className="border-t pt-4" style={{ borderColor: C.line }}>
          <p className="text-[16px] font-bold">전화 상담</p>
          <p className="mt-1 text-[28px] font-bold tabular-nums">
            {TEL}
          </p>
          <p className="mt-1 text-[15px]" style={{ color: C.gray }}>
            평일 09:00 ~ 18:00
          </p>
        </div>
        <div className="border-t pt-4" style={{ borderColor: C.line }}>
          <p className="inline-flex items-center gap-2 text-[16px] font-bold">
            <MessageCircle size={18} aria-hidden />
            {KAKAO}
          </p>
          <p className="mt-1 text-[15px] leading-relaxed" style={{ color: C.gray }}>
            로고 파일이나 제품 사진을 바로 보내실 수 있어요.
          </p>
        </div>
        <details className="group border-t pt-4" style={{ borderColor: C.line }}>
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
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[6px] border" style={{ borderColor: C.line, background: C.soft }}>
        <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label="ㅇㅇ역 2번 출구에서 큰길을 따라 오른쪽으로 걸어 두 번째 건물에 사무소가 있는 약도">
          <path d="M0 170 H400" stroke="#fff" strokeWidth="34" />
          <path d="M120 0 V300" stroke="#fff" strokeWidth="24" />
          <path d="M0 170 H400" stroke="#c4c4c4" strokeWidth="1.2" strokeDasharray="10 8" />
          {[
            [150, 92, 60, 52],
            [222, 92, 52, 52],
            [290, 92, 74, 52],
            [150, 200, 90, 60],
            [256, 200, 104, 60],
            [20, 92, 80, 52],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} fill="#e9e9e6" stroke="#d4d4d0" strokeWidth="1" />
          ))}
          <rect x="222" y="92" width="52" height="52" fill={C.red} />
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
        <table className="mt-6 w-full border-t text-[16px]" style={{ borderColor: C.line }}>
          <caption className="sr-only">상담 시간</caption>
          <tbody>
            {HOURS.map(([d, h], i) => (
              <tr key={d} className="border-b" style={{ borderColor: C.line, fontWeight: i === todayRow ? 700 : 400 }}>
                <th scope="row" className="py-2.5 text-left font-[inherit]">
                  {d}
                  {i === todayRow && (
                    <span className="ml-2 rounded-[4px] px-1.5 py-0.5 text-[13px] font-bold" style={{ background: C.redSoft, color: C.red }}>
                      오늘
                    </span>
                  )}
                </th>
                <td className="py-2.5 text-right tabular-nums">
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

function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#fff" : "#111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          곰파트너
        </span>
        <span className="text-[12px] font-semibold opacity-75">특허사무소 샘플</span>
      </span>
    </span>
  );
}
