"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ExternalLink, Lightbulb, MapPin, MessageCircle, Search, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 특허사무소 홈페이지 샘플: 가상의 곰파트너 특허사무소. 특허, 실용신안, 상표, 디자인 출원을 맡는다.
   상호, 주소, 변리사 이름, 손님 이름은 모두 가상이다.

   국내 특허사무소 사이트 공통 구성(참고): 메뉴는 사무소 소개, 업무분야(특허, 상표, 디자인, 해외출원), 비용안내,
   출원절차, 상담신청, 오시는 길. 첫 화면에는 상표 검색창이나 "무료 상표 조사"와 상담 전화를 크게 둔다.
   비용은 관납료(특허청에 내는 돈)와 수수료(사무소 보수)를 나눠 적고 "부가세 별도"를 붙인다.
   상표는 상품류(제30류, 제43류처럼) 단위로 출원하고, 선출원주의라 먼저 낸 사람이 등록받는다는 안내가 흔하다.
   변리사 광고 규정에 맞춰 등록률, 성공 사례 숫자, 보장 표현은 쓰지 않는다.

   관납료 기준(특허청 수수료, 전자출원): 상표 출원료 1상품류 52,000원, 고시 상품명만 쓰면 46,000원(지정상품 10개까지, 넘으면 1개당 2,000원).
   상표 설정등록료 10년분 1상품류 201,000원(특허료 등의 징수규칙 제5조). 사무소 수수료는 이 샘플이 정한 개략 금액이다.
   특허 심사 기간은 심사청구 뒤 1차 결과까지 1년 안팎, 우선심사는 결정 뒤 몇 달 안으로 잡은 개략이다.

   사진 출처: Pexels 사진 6615086, 직원 사진은 AI 생성(Z-Image-Turbo)
   첫 화면(po-poster): 상단 메뉴, 가로로 긴 도면 사진 띠, 그 아래 특허, 상표, 디자인 업무영역 세 칸.
   칸마다 보호하는 것, 준비할 자료, 출원 상담 버튼(상담신청의 분야를 미리 고른다).

   구간
   1. 상표 출원 절차: 선행 조사부터 등록까지 단계와 기간, 키프리스 바로가기, 상표 조사 요청 버튼.
   2. 비용 안내: 상표 관납료와 수수료 정적 표(부가세 별도). 특허, 디자인은 상담 뒤 견적.
   3. 특허 출원부터 등록까지: 단계별로 일반심사, 우선심사 기간을 함께 적은 표.
   4. 상담신청: 분야, 이름, 휴대폰, 내용. 접수 번호, 담당 창구, 회신 예정일을 보여 준다. */

const IMG = "/images/demo-patent-office";

const BRAND = "특허사무소";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 7층";
const KAKAO = "카카오톡 채널 특허사무소";
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

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/* ---------- 상표 ---------- */

/** 자주 쓰는 상품류 */
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

/** 상표 출원부터 등록까지 */
const TM_STEPS: [string, string, string][] = [
  ["선행 상표 조사", "상담 당일 ~ 3일", "같거나 비슷한 상표가 먼저 출원, 등록됐는지 키프리스와 자체 자료로 확인합니다."],
  ["출원", "조사 뒤 1~3일", "상표 견본과 지정상품(상품류)을 정해 특허청에 냅니다. 출원한 날이 권리의 기준일입니다."],
  ["심사", "출원 뒤 12개월 안팎", "심사관이 식별력과 선행 상표를 봅니다. 거절이유가 있으면 의견서로 다툽니다."],
  ["출원공고", "심사 통과 뒤", "2개월 동안 다른 사람이 이의신청을 할 수 있습니다."],
  ["등록결정, 등록료 납부", "공고 뒤 2개월", "등록료(10년분)를 내면 상표권이 생깁니다. 10년마다 갱신합니다."],
];

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
type Step = { name: string; when: Record<Track, string>; body: string };
const STEPS: Step[] = [
  {
    name: "출원",
    when: { 일반심사: "상담 뒤 2~4주", 우선심사: "상담 뒤 2~4주" },
    body: "발명 내용을 듣고 명세서와 도면을 써서 특허청에 냅니다. 출원한 날이 권리의 기준일이 돼요.",
  },
  {
    name: "심사청구",
    when: { 일반심사: "보통 출원과 같이", 우선심사: "출원 뒤 우선심사 신청" },
    body: "심사청구를 해야 심사가 시작됩니다. 출원일부터 3년 안에 하면 되지만 보통 출원과 같이 냅니다.",
  },
  {
    name: "1차 심사 결과",
    when: { 일반심사: "심사청구 뒤 1년 안팎", 우선심사: "우선심사 결정 뒤 2~3개월" },
    body: "심사관이 먼저 나온 기술과 비교합니다. 거절이유가 있으면 의견제출통지서가 와요.",
  },
  {
    name: "의견서, 보정서",
    when: { 일반심사: "통지 뒤 2개월 안", 우선심사: "통지 뒤 2개월 안" },
    body: "거절이유에 맞춰 청구범위를 고치거나 의견서를 냅니다. 기한은 연장할 수 있어요.",
  },
  {
    name: "등록결정",
    when: { 일반심사: "의견서 뒤 2개월 안팎", 우선심사: "의견서 뒤 1~2개월" },
    body: "등록결정서를 받은 날부터 3개월 안에 설정등록료(1~3년분)를 냅니다.",
  },
  {
    name: "등록",
    when: { 일반심사: "등록료 납부 뒤 바로", 우선심사: "등록료 납부 뒤 바로" },
    body: "특허권이 생기고 등록공고가 납니다. 권리는 출원일부터 20년이에요. 4년차부터 해마다 연차료를 냅니다.",
  },
];
const TRACK_TOTAL: Record<Track, string> = { 일반심사: "약 1년 6개월 ~ 2년", 우선심사: "약 6개월 ~ 1년" };

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
      <Poster go={go} onConsult={(t) => toConsult(t)} />

      {/* 상표 출원 */}
      <section id="po-trademark" aria-labelledby="po-trademark-title" className="mx-auto mt-12 max-w-[1200px] scroll-mt-4 px-4 md:mt-16 md:px-6">
        <SectionTitle id="po-trademark-title" title="상표 출원 절차" />
        <TrademarkGuide onConsult={() => toConsult("상표", "상표 선행 조사를 요청합니다.")} />
      </section>

      {/* 비용 */}
      <section id="po-fee" aria-labelledby="po-fee-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="po-fee-title" title="비용 안내" />
        <FeeTable onConsult={() => toConsult("상표")} />
      </section>

      {/* 특허 단계 */}
      <section id="po-steps" aria-labelledby="po-steps-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="po-steps-title" title="특허 출원부터 등록까지" />
        <PatentSteps />
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

/* ---------- 첫 화면: 메뉴 + 사진 띠 + 업무영역 ---------- */

type Right = "특허" | "상표" | "디자인";

const RIGHTS: { name: Right; protects: string; term: string; prep: string }[] = [
  { name: "특허", protects: "제품 구조, 장치, 앱 기능, 제조 방법", term: "출원일부터 20년", prep: "도면이나 사진, 비슷한 제품 링크" },
  { name: "상표", protects: "가게 이름, 브랜드, 로고, 상품 이름", term: "등록부터 10년, 갱신 가능", prep: "이름, 로고 파일, 팔 상품이나 서비스" },
  { name: "디자인", protects: "제품 겉모양, 포장 용기, 아이콘", term: "출원일부터 20년", prep: "제품 사진 여러 각도" },
];

const MENU: [string, string][] = [
  ["po-office", "사무소 소개"],
  ["po-rights", "업무영역"],
  ["po-fee", "비용안내"],
  ["po-steps", "출원절차"],
  ["po-trademark", "상표 출원"],
  ["po-visit", "오시는 길"],
];

function Poster({ go, onConsult }: { go: (id: string) => void; onConsult: (t: Topic) => void }) {
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
            onClick={() => onConsult("상표")}
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

      {/* 업무영역 */}
      <div id="po-rights" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pb-4 pt-6 md:px-6 md:pt-8">
        <h2 className="sr-only">업무영역</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {RIGHTS.map((r) => (
            <li key={r.name} className="flex flex-col rounded-[6px] border p-5" style={{ borderColor: C.line }}>
              <h3 className="text-[22px] font-bold">{r.name}</h3>
              <dl className="mt-3 grid gap-2 text-[15px]">
                <div>
                  <dt className="font-bold">보호하는 것</dt>
                  <dd style={{ color: C.body }}>{r.protects}</dd>
                </div>
                <div>
                  <dt className="font-bold">권리 기간</dt>
                  <dd style={{ color: C.body }}>{r.term}</dd>
                </div>
                <div>
                  <dt className="font-bold">준비할 자료</dt>
                  <dd style={{ color: C.body }}>{r.prep}</dd>
                </div>
              </dl>
              <div className="mt-auto pt-4">
                <button
                  type="button"
                  onClick={() => onConsult(r.name)}
                  data-gtm-cta={`patent-office_rights_${r.name}`}
                  className={`inline-flex min-h-11 items-center rounded-[6px] border px-4 text-[15px] font-semibold ${focusRing}`}
                  style={{ background: C.paper, borderColor: C.field, color: C.ink, outlineColor: C.ink }}
                >
                  {r.name} 출원 상담
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 1. 상표 출원 절차 ---------- */

function TrademarkGuide({ onConsult }: { onConsult: () => void }) {
  return (
    <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-12">
      <ol className="border-t" style={{ borderColor: C.ink }} aria-label="상표 출원부터 등록까지">
        {TM_STEPS.map(([name, when, body], i) => (
          <li key={name} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3 border-b py-4" style={{ borderColor: C.line }}>
            <span className="grid h-8 w-8 place-items-center rounded-full text-[14px] font-bold tabular-nums text-white" style={{ background: C.red }}>
              {i + 1}
            </span>
            <span>
              <span className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-[18px] font-bold">{name}</span>
                <span className="text-[14px] font-semibold" style={{ color: C.gray }}>
                  {when}
                </span>
              </span>
              <span className="mt-1 block text-[15px] leading-[1.7]" style={{ color: C.body }}>
                {body}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <div>
        <h3 className="text-[18px] font-bold">자주 쓰는 상품류</h3>
        <table className="mt-3 w-full text-[15px]">
          <caption className="sr-only">자주 쓰는 상품류와 지정상품 예</caption>
          <tbody>
            {CLASSES.map((c) => (
              <tr key={c.no} className="border-b" style={{ borderColor: C.line }}>
                <th scope="row" className="w-[80px] py-2.5 text-left font-bold tabular-nums">
                  제{c.no}류
                </th>
                <td className="py-2.5" style={{ color: C.body }}>
                  {c.goods}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onConsult}
            data-gtm-cta="patent-office_tm_consult"
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`}
            style={{ background: C.red, color: "#fff", outlineColor: C.ink }}
          >
            <Search size={17} aria-hidden />
            상표 조사 요청
          </button>
          <a
            href="https://www.kipris.or.kr"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] border px-4 text-[15px] font-semibold ${focusRing}`}
            style={{ borderColor: C.field, color: C.ink, outlineColor: C.ink }}
          >
            키프리스 바로가기
            <ExternalLink size={15} aria-hidden />
            <span className="sr-only">(새 창)</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---------- 2. 비용 안내 ---------- */

const FEE_ROWS: { label: string; gov: string; agent: string }[] = [
  { label: "상표 출원 (1상품류)", gov: `${won(FEE_FILE)}, 고시 상품명 ${won(FEE_FILE_NOTICED)}`, agent: `첫 류 ${won(AGENT_FILE_FIRST)}, 추가 류 ${won(AGENT_FILE_MORE)}` },
  { label: "상표 등록 (10년분, 1상품류)", gov: won(FEE_REG_10Y), agent: won(AGENT_REG) },
  { label: "특허 출원", gov: "청구항 수에 따라", agent: "상담 뒤 견적" },
  { label: "디자인 출원", gov: "디자인 수에 따라", agent: "상담 뒤 견적" },
];

function FeeTable({ onConsult }: { onConsult: () => void }) {
  return (
    <div>
      <div className="overflow-hidden rounded-[6px] border" style={{ borderColor: C.line }}>
        <table className="w-full text-left text-[15px]">
          <caption className="sr-only">출원, 등록 비용 (부가세 별도)</caption>
          <thead>
            <tr className="text-[14px]" style={{ background: C.soft }}>
              <th scope="col" className="px-4 py-3 font-bold">
                구분
              </th>
              <th scope="col" className="hidden px-4 py-3 font-bold sm:table-cell">
                관납료 (특허청)
              </th>
              <th scope="col" className="hidden px-4 py-3 font-bold sm:table-cell">
                수수료 (사무소)
              </th>
            </tr>
          </thead>
          <tbody>
            {FEE_ROWS.map((r) => (
              <tr key={r.label} className="border-t align-top" style={{ borderColor: C.line }}>
                <th scope="row" className="px-4 py-3 font-bold">
                  {r.label}
                  <span className="mt-1 block font-normal sm:hidden" style={{ color: C.body }}>
                    관납료 {r.gov}
                    <br />
                    수수료 {r.agent}
                  </span>
                </th>
                <td className="hidden px-4 py-3 tabular-nums sm:table-cell" style={{ color: C.body }}>
                  {r.gov}
                </td>
                <td className="hidden px-4 py-3 tabular-nums sm:table-cell" style={{ color: C.body }}>
                  {r.agent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px]" style={{ color: C.gray }}>
          수수료는 부가세 별도입니다. 고시 상품명은 지정상품 10개까지이고, 넘으면 1개당 2,000원이 더해집니다.
        </p>
        <button
          type="button"
          onClick={onConsult}
          data-gtm-cta="patent-office_fee_consult"
          className={`inline-flex min-h-11 items-center rounded-[6px] border px-4 text-[15px] font-semibold ${focusRing}`}
          style={{ borderColor: C.field, color: C.ink, outlineColor: C.ink }}
        >
          견적 상담
        </button>
      </div>
    </div>
  );
}

/* ---------- 3. 특허 단계 ---------- */

function PatentSteps() {
  return (
    <div className="overflow-hidden rounded-[6px] border" style={{ borderColor: C.line }}>
      <table className="w-full text-left text-[15px]">
        <caption className="sr-only">특허 출원부터 등록까지 단계별 기간</caption>
        <thead>
          <tr className="text-[14px]" style={{ background: C.soft }}>
            <th scope="col" className="px-4 py-3 font-bold">
              단계
            </th>
            <th scope="col" className="hidden px-4 py-3 font-bold md:table-cell">
              일반심사
            </th>
            <th scope="col" className="hidden px-4 py-3 font-bold md:table-cell">
              우선심사
            </th>
          </tr>
        </thead>
        <tbody>
          {STEPS.map((st, i) => (
            <tr key={st.name} className="border-t align-top" style={{ borderColor: C.line }}>
              <th scope="row" className="px-4 py-3 font-normal">
                <span className="block text-[16px] font-bold">
                  {i + 1}. {st.name}
                </span>
                <span className="mt-1 block leading-[1.6]" style={{ color: C.body }}>
                  {st.body}
                </span>
                <span className="mt-1 block text-[14px] md:hidden" style={{ color: C.gray }}>
                  일반 {st.when.일반심사}, 우선 {st.when.우선심사}
                </span>
              </th>
              <td className="hidden px-4 py-3 md:table-cell" style={{ color: C.body }}>
                {st.when.일반심사}
              </td>
              <td className="hidden px-4 py-3 md:table-cell" style={{ color: C.body }}>
                {st.when.우선심사}
              </td>
            </tr>
          ))}
          <tr className="border-t-2" style={{ borderColor: C.ink }}>
            <th scope="row" className="px-4 py-3 font-bold">
              출원부터 등록까지
              <span className="mt-1 block text-[14px] font-normal md:hidden" style={{ color: C.gray }}>
                일반 {TRACK_TOTAL.일반심사}, 우선 {TRACK_TOTAL.우선심사}
              </span>
            </th>
            <td className="hidden px-4 py-3 font-bold md:table-cell">{TRACK_TOTAL.일반심사}</td>
            <td className="hidden px-4 py-3 font-bold md:table-cell">{TRACK_TOTAL.우선심사}</td>
          </tr>
        </tbody>
      </table>
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
            alt="대표 변리사 오ㅈ후"
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
            오ㅈ후
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
    const seq = (Number(digits.slice(-4)) % 900) + 100;
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
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          특허사무소
        </span>
      </span>
    </span>
  );
}
