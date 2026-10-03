"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calculator,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  ClipboardList,
  Menu,
  Minus,
  Phone,
  Plus,
  RotateCcw,
  Search,
  TrainFront,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 세무회계 사무소 홈페이지 데모: 가상의 ○○ 세무회계.
   사무소 이름, 세무사 이름, 주소, 전화번호, 사업자 정보, 기장료는 모두 가상이다.
   신고 기한은 실제 세법의 기본 기한을 따르되, 음력 공휴일은 해마다 바뀌어 계산에서 뺀다.

   디자인: 장부 느낌의 따뜻한 흰 바탕(#fbfaf6)에 옅은 괘선, 짙은 초록(#1f5c45), 먹색 글자(#1d2422).
   다가오는 기한의 D-day는 형광펜 노랑(#f4d35e)으로 칠하고, 숫자는 모두 고정폭 숫자로 맞춘다.

   내 세금 달력은 사업자 유형, 직원 유무와 원천세 납부 방법, 성실신고확인대상 여부를 고르면
   올해 1월부터 다음 해 3월까지의 신고 기한을 달별 띠로 펼치고, 오늘 기준 다음 기한까지 D-day를 센다.
   기한이 주말이나 공휴일이면 다음 영업일로 옮겨 적고, 기한을 누르면 준비할 서류 목록이 나온다.
   기장료 계산기는 업종, 연 매출 구간, 직원 수, 법인 여부로 월 기장료와 조정료를 어림하고
   그 조건을 그대로 상담 신청서에 채워 넘긴다. 상담 신청이 끝나면 이름과 번호를 가려 접수 번호와 함께 보여 준다.

   사진 출처(public/images/demo-tax):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, office */

const IMG = "/images/demo-tax";
const OFFICE = "○○ 세무회계";
const TEL = "02-000-0000";
const ADDRESS = "□□시 □□로 88 □□빌딩 5층";

const C = {
  paper: "#fbfaf6",
  card: "#ffffff",
  green: "#1f5c45",
  greenDeep: "#164433",
  greenSoft: "#e5eee9",
  ink: "#1d2422",
  muted: "#56615d",
  line: "#e2dfd3",
  rule: "rgba(31,92,69,0.07)",
  yellow: "#f4d35e",
  yellowSoft: "#fbf0c4",
  margin: "#e2aaa3",
  red: "#b3261e",
};

const RULED = `repeating-linear-gradient(to bottom, transparent 0, transparent 31px, ${C.rule} 31px, ${C.rule} 32px)`;

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV = [
  { id: "calendar", label: "세금 달력" },
  { id: "fee", label: "기장료 계산" },
  { id: "news", label: "세무 소식" },
  { id: "about", label: "세무사 소개" },
  { id: "faq", label: "자주 묻는 질문" },
];

/* ---------- 시간 ---------- */

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const subscribeMinute = (cb: () => void) => {
  const id = window.setInterval(cb, 30_000);
  return () => window.clearInterval(id);
};

/** 분 단위 현재 시각. 서버 렌더에서는 -1을 돌려 날짜에 따른 화면 차이를 막는다. */
function useNowMinute() {
  return useSyncExternalStore(subscribeMinute, () => Math.floor(Date.now() / 60_000), () => -1);
}

function todayOf(minute: number) {
  if (minute < 0) return null;
  const now = new Date(minute * 60_000);
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// 날짜가 고정된 공휴일. 음력 공휴일(설, 추석, 부처님오신날)은 해마다 바뀌어 데모에서는 뺀다.
const FIXED_HOLIDAYS: { m: number; d: number; sub: boolean }[] = [
  { m: 1, d: 1, sub: false },
  { m: 3, d: 1, sub: true },
  { m: 5, d: 5, sub: true },
  { m: 6, d: 6, sub: false },
  { m: 8, d: 15, sub: true },
  { m: 10, d: 3, sub: true },
  { m: 10, d: 9, sub: true },
  { m: 12, d: 25, sub: true },
];

const offCache = new Map<number, Set<string>>();

/** 그해 쉬는 날(고정 공휴일과 대체공휴일). 키는 "월-일". */
function holidaysOf(year: number) {
  const hit = offCache.get(year);
  if (hit) return hit;
  const set = new Set<string>();
  const isHoliday = (d: Date) => FIXED_HOLIDAYS.some((h) => h.m === d.getMonth() + 1 && h.d === d.getDate());
  for (const h of FIXED_HOLIDAYS) {
    set.add(`${h.m}-${h.d}`);
    const date = new Date(year, h.m - 1, h.d);
    if (h.sub && (date.getDay() === 0 || date.getDay() === 6)) {
      const s = new Date(date);
      do s.setDate(s.getDate() + 1);
      while (s.getDay() === 0 || s.getDay() === 6 || isHoliday(s) || set.has(`${s.getMonth() + 1}-${s.getDate()}`));
      set.add(`${s.getMonth() + 1}-${s.getDate()}`);
    }
  }
  offCache.set(year, set);
  return set;
}

function offReason(d: Date) {
  if (d.getDay() === 0 || d.getDay() === 6) return "주말";
  if (holidaysOf(d.getFullYear()).has(`${d.getMonth() + 1}-${d.getDate()}`)) return "공휴일";
  return null;
}

/** 기한이 쉬는 날이면 다음 영업일로 미룬다. */
function nextBusinessDay(d: Date) {
  const r = new Date(d);
  while (offReason(r)) r.setDate(r.getDate() + 1);
  return r;
}

const md = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`;
const dayDiff = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86_400_000);
const dday = (n: number) => (n === 0 ? "D-day" : n > 0 ? `D-${n}` : `D+${-n}`);
const comma = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const man = (n: number) => (n % 10000 === 0 ? `${n / 10000}만` : `${(n / 10000).toFixed(1)}만`);

/* ---------- 신고 일정 ---------- */

type BizType = "general" | "simple" | "corp" | "free";

const BIZ: { id: BizType; label: string; short: string }[] = [
  { id: "general", label: "개인 일반과세자", short: "일반과세자" },
  { id: "simple", label: "개인 간이과세자", short: "간이과세자" },
  { id: "corp", label: "법인 (12월 결산)", short: "법인" },
  { id: "free", label: "프리랜서 (3.3%)", short: "프리랜서" },
];

type Profile = { type: BizType; staff: boolean; half: boolean; freelancePay: boolean; sincere: boolean };

type Kind =
  | "vatFinal"
  | "vatPrepay"
  | "vatPrelim"
  | "vatSimple"
  | "vatSimplePrepay"
  | "income"
  | "incomeSincere"
  | "incomeMid"
  | "corp"
  | "corpLocal"
  | "corpMid"
  | "withhold"
  | "withholdHalf"
  | "payStatement"
  | "simpleStatement";

type Group = "vat" | "income" | "withhold";

const KIND_GROUP: Record<Kind, Group> = {
  vatFinal: "vat",
  vatPrepay: "vat",
  vatPrelim: "vat",
  vatSimple: "vat",
  vatSimplePrepay: "vat",
  income: "income",
  incomeSincere: "income",
  incomeMid: "income",
  corp: "income",
  corpLocal: "income",
  corpMid: "income",
  withhold: "withhold",
  withholdHalf: "withhold",
  payStatement: "withhold",
  simpleStatement: "withhold",
};

const GROUP_STYLE: Record<Group, { label: string; bar: string }> = {
  vat: { label: "부가가치세", bar: C.green },
  income: { label: "소득세·법인세", bar: C.ink },
  withhold: { label: "원천세·지급명세서", bar: "#9bb5a8" },
};

const KIND_INFO: Record<Kind, { about: string; prep: string[]; topic: string }> = {
  vatFinal: {
    about: "6개월 동안의 매출과 매입을 모아 부가세를 확정해 신고하고 냅니다.",
    prep: ["매출·매입 세금계산서 합계", "카드 매출과 현금영수증 매출 내역", "사업용 카드 사용 내역", "수출이 있으면 수출 신고 필증", "예정고지나 예정신고로 이미 낸 세액"],
    topic: "부가세",
  },
  vatPrepay: {
    about: "개인 일반과세자는 예정신고 대신 직전 기 납부세액의 절반이 고지됩니다. 고지서 금액만 내면 됩니다.",
    prep: ["홈택스나 우편으로 받은 고지서", "매출이 직전 기의 3분의 1 아래로 줄었으면 예정신고로 바꿀지 검토"],
    topic: "부가세",
  },
  vatPrelim: {
    about: "법인은 3개월마다 부가세를 신고합니다. 직전 기 공급가액이 1억 5천만 원 미만이면 고지로 대신할 수 있습니다.",
    prep: ["3개월치 매출·매입 세금계산서", "법인카드 사용 내역", "카드 매출과 현금영수증 매출 내역", "수입이 있으면 수입 세금계산서"],
    topic: "부가세",
  },
  vatSimple: {
    about: "간이과세자는 1년에 한 번, 작년 1년분 부가세를 신고합니다. 연 매출 4,800만 원 미만이면 납부할 세액이 없습니다.",
    prep: ["1년치 매출 합계(카드, 현금영수증, 현금)", "매입 세금계산서와 카드 영수증", "7월 예정부과로 낸 세액"],
    topic: "부가세",
  },
  vatSimplePrepay: {
    about: "간이과세자는 7월에 작년 세액의 절반이 고지됩니다. 상반기 매출이 크게 줄었으면 신고로 대신할 수 있습니다.",
    prep: ["고지서 금액 확인", "상반기 매출이 많이 줄었다면 상반기 매출 합계"],
    topic: "부가세",
  },
  income: {
    about: "작년 한 해의 사업소득과 다른 소득을 합쳐 종합소득세를 신고하고 냅니다. 지방소득세도 함께 신고합니다.",
    prep: ["장부 또는 경비 증빙", "근로, 연금, 2천만 원 넘는 이자·배당 소득 내역", "노란우산공제, 연금저축 납입 증명", "부양가족 정보", "11월에 낸 중간예납 세액"],
    topic: "종합소득세",
  },
  incomeSincere: {
    about: "성실신고확인대상은 세무사가 장부를 확인한 확인서를 붙여 6월 말까지 신고합니다. 확인 비용 일부는 세액공제됩니다.",
    prep: ["복식부기 장부와 증빙 원본", "사업용 계좌 1년치 거래 내역", "업무용 승용차 운행기록부", "인건비 지급 내역과 4대 보험 자료", "11월에 낸 중간예납 세액"],
    topic: "종합소득세",
  },
  incomeMid: {
    about: "작년 종합소득세의 절반이 고지됩니다. 올해 실적이 많이 줄었으면 직접 계산해 신고할 수 있습니다.",
    prep: ["고지서 금액 확인", "실적이 줄었다면 상반기 장부"],
    topic: "종합소득세",
  },
  corp: {
    about: "작년 사업연도의 법인세를 신고하고 냅니다. 납부할 세액이 1천만 원을 넘으면 나눠 낼 수 있습니다.",
    prep: ["재무상태표와 손익계산서", "법인 통장 1년치 거래 내역", "법인카드 사용 내역", "주주 명부와 지분 변동 내역", "투자나 고용 증가로 받을 세액공제 자료"],
    topic: "법인세",
  },
  corpLocal: {
    about: "법인세와 별도로 사업장이 있는 시군구에 법인 지방소득세를 신고합니다.",
    prep: ["법인세 신고서 사본", "사업장이 여러 곳이면 사업장별 직원 수와 면적"],
    topic: "법인세",
  },
  corpMid: {
    about: "상반기분 법인세를 미리 냅니다. 작년 세액의 절반으로 내거나 상반기 실적으로 계산해 냅니다.",
    prep: ["작년 법인세 신고서", "상반기 손익계산서(직접 계산할 때)"],
    topic: "법인세",
  },
  withhold: {
    about: "지난달 급여나 외주비를 줄 때 뗀 세금을 신고하고 냅니다.",
    prep: ["지난달 급여 대장", "입사·퇴사한 직원 명단", "3.3%를 떼고 준 외주 지급 내역"],
    topic: "원천세·인건비",
  },
  withholdHalf: {
    about: "반기납부 승인을 받으면 6개월치 원천세를 한 번에 신고하고 냅니다.",
    prep: ["6개월치 급여 대장", "입사·퇴사한 직원 명단", "반기 동안의 외주 지급 내역"],
    topic: "원천세·인건비",
  },
  payStatement: {
    about: "작년 한 해 동안 지급한 급여의 지급명세서를 연말정산 결과와 함께 제출합니다. 늦으면 가산세가 붙습니다.",
    prep: ["직원별 연말정산 결과와 공제 증빙", "중도 퇴사자 정산 내역", "2월분 원천세 신고 자료"],
    topic: "원천세·인건비",
  },
  simpleStatement: {
    about: "프리랜서에게 3.3%를 떼고 지급했다면 다음 달 말일까지 간이지급명세서를 냅니다.",
    prep: ["지난달 외주 인력별 지급 금액", "받는 사람 이름과 주민등록번호"],
    topic: "원천세·인건비",
  },
};

type Deadline = { id: string; kind: Kind; title: string; due: Date; real: Date; shifted: string | null };

function buildYear(y: number, p: Profile): Deadline[] {
  const out: Deadline[] = [];
  const add = (kind: Kind, title: string, m: number, d: number) => {
    const due = new Date(y, m - 1, d);
    const real = nextBusinessDay(due);
    out.push({ id: `${kind}-${y}-${m}-${d}`, kind, title, due, real, shifted: real.getTime() !== due.getTime() ? offReason(due) : null });
  };
  const last = (m: number) => new Date(y, m, 0).getDate();

  if (p.type === "general") {
    add("vatFinal", "부가세 확정신고 (작년 2기)", 1, 25);
    add("vatPrepay", "부가세 예정고지 납부 (1기)", 4, 25);
    add("vatFinal", "부가세 확정신고 (1기)", 7, 25);
    add("vatPrepay", "부가세 예정고지 납부 (2기)", 10, 25);
  }
  if (p.type === "simple") {
    add("vatSimple", "부가세 신고 (작년 1년분)", 1, 25);
    add("vatSimplePrepay", "부가세 예정부과 납부", 7, 25);
  }
  if (p.type === "corp") {
    add("vatFinal", "부가세 확정신고 (작년 2기)", 1, 25);
    add("corp", p.sincere ? "법인세 신고 (성실신고확인)" : "법인세 신고", p.sincere ? 4 : 3, p.sincere ? 30 : 31);
    add("vatPrelim", "부가세 예정신고 (1기)", 4, 25);
    add("corpLocal", "법인 지방소득세 신고", p.sincere ? 5 : 4, p.sincere ? 31 : 30);
    add("vatFinal", "부가세 확정신고 (1기)", 7, 25);
    add("corpMid", "법인세 중간예납", 8, 31);
    add("vatPrelim", "부가세 예정신고 (2기)", 10, 25);
  } else {
    if (p.sincere) add("incomeSincere", "종합소득세 신고 (성실신고확인)", 6, 30);
    else add("income", "종합소득세 신고", 5, 31);
    add("incomeMid", "종합소득세 중간예납", 11, 30);
  }

  if (p.staff || p.freelancePay) {
    if (p.half) {
      add("withholdHalf", "원천세 반기 신고 (작년 하반기분)", 1, 10);
      add("withholdHalf", "원천세 반기 신고 (상반기분)", 7, 10);
    } else {
      for (let m = 1; m <= 12; m++) add("withhold", `원천세 신고 (${m === 1 ? 12 : m - 1}월분)`, m, 10);
    }
  }
  if (p.staff) add("payStatement", "근로소득 지급명세서 제출", 3, 10);
  if (p.freelancePay) {
    for (let m = 1; m <= 12; m++) add("simpleStatement", `사업소득 간이지급명세서 (${m === 1 ? 12 : m - 1}월분)`, m, last(m));
  }
  return out;
}

/** 올해 1월부터 다음 해 3월까지 */
function scheduleFor(y: number, p: Profile) {
  const end = new Date(y + 1, 2, 31);
  return [...buildYear(y, p), ...buildYear(y + 1, p)]
    .filter((d) => d.due <= end)
    .sort((a, b) => a.due.getTime() - b.due.getTime() || a.title.localeCompare(b.title));
}

/** 첫 화면에 보여 줄 다가오는 주요 기한(개인과 법인을 합친다) */
function upcomingAll(today: Date) {
  const y = today.getFullYear();
  const personal = scheduleFor(y, { type: "general", staff: true, half: false, freelancePay: false, sincere: false });
  const corp = scheduleFor(y, { type: "corp", staff: false, half: false, freelancePay: false, sincere: false });
  const map = new Map<string, { d: Deadline; who: string }>();
  for (const d of personal) map.set(`${d.kind}-${d.due.getTime()}`, { d, who: KIND_GROUP[d.kind] === "withhold" ? "직원 있는 곳" : "개인" });
  for (const d of corp) {
    const key = `${d.kind}-${d.due.getTime()}`;
    const hit = map.get(key);
    if (hit) hit.who = "개인·법인";
    else map.set(key, { d, who: "법인" });
  }
  return [...map.values()]
    .filter((x) => x.d.real >= today)
    .sort((a, b) => a.d.real.getTime() - b.d.real.getTime())
    .slice(0, 3);
}

/* ---------- 마스킹 ---------- */

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘은 김ㅎ늘로 */
function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return chars.join("");
  const hide = (ch: string) => {
    const code = ch.charCodeAt(0) - 0xac00;
    return code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*";
  };
  if (chars.length === 2) return chars[0] + hide(chars[1]);
  return chars.map((ch, i) => (i === 0 || i === chars.length - 1 ? ch : hide(ch))).join("");
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

/* ---------- 페이지 ---------- */

const BIZ_CHOICES = ["개인 일반과세자", "개인 간이과세자", "법인", "프리랜서", "사업 준비 중"];
const BIZ_TO_CHOICE: Record<BizType, string> = { general: "개인 일반과세자", simple: "개인 간이과세자", corp: "법인", free: "프리랜서" };

type Prefill = { key: number; topics: string[]; biz: string; memo: string };

export function TaxOfficeDemo() {
  const minute = useNowMinute();
  const reduce = useReducedMotionSafe();
  const [prefill, setPrefill] = useState<Prefill>({ key: 0, topics: [], biz: "", memo: "" });

  const toContact = (p: Omit<Prefill, "key">) => {
    setPrefill((prev) => ({ ...p, key: prev.key + 1 }));
    window.requestAnimationFrame(() => document.getElementById("contact")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.paper, backgroundImage: RULED, color: C.ink }}>
      <Header />
      <main>
        <Hero minute={minute} />
        <TaxCalendar minute={minute} onAsk={toContact} />
        <FeeCalculator onAsk={toContact} />
        <Contact prefill={prefill} />
        <News />
        <About />
        <Faq />
        <Location />
      </main>
      <Footer />
    </div>
  );
}

/* ---------- 로고, 머리글 ---------- */

function Logo({ light = false }: { light?: boolean }) {
  const fg = light ? C.greenDeep : "#fff";
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
        <rect width="30" height="30" rx="6" fill={light ? "#fff" : C.green} />
        <path d="M8 9 H22 M8 14 H22 M8 19 H16" stroke={fg} strokeWidth="2" strokeLinecap="round" />
        <path d="M11 6 V24" stroke={light ? C.margin : "#e9a49b"} strokeWidth="1.4" />
        <path d="M17.5 21.5 L19.5 23.5 L23.5 18.5" stroke={fg} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[19px] font-bold tracking-[-0.02em]">{OFFICE}</span>
    </span>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ background: "rgba(251,250,246,0.94)", borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <a href="#top" aria-label={`${OFFICE} 처음으로`}>
          <Logo />
        </a>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-[15px]">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="transition-colors hover:text-[#1f5c45]" style={{ color: C.muted }}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a href={`tel:${TEL}`} className="hidden h-10 items-center gap-1.5 px-2 text-[15px] font-semibold tabular-nums xl:inline-flex" style={{ color: C.green }}>
            <Phone size={16} aria-hidden />
            {TEL}
          </a>
          <a href="#contact" className="hidden h-10 items-center rounded-[6px] px-4 text-[15px] font-semibold sm:inline-flex" style={{ background: C.green, color: "#fff" }}>
            상담 신청
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] lg:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            aria-controls="tax-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="tax-menu"
            aria-label="주 메뉴"
            className="overflow-hidden border-t lg:hidden"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { height: 0 }}
            animate={{ height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <ul className="px-4 py-2">
              {[...NAV, { id: "contact", label: "상담 신청" }, { id: "location", label: "오시는 길" }].map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} onClick={() => setOpen(false)} className="flex h-12 items-center text-[17px]">
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={`tel:${TEL}`} className="flex h-12 items-center text-[17px] font-semibold tabular-nums" style={{ color: C.green }}>
                  전화 {TEL}
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- 첫 화면 ---------- */

function DdayBadge({ n, big = false }: { n: number; big?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-[4px] font-bold tabular-nums ${big ? "px-2.5 py-1 text-[20px]" : "px-2 py-0.5 text-[14px]"}`}
      style={{ background: n <= 7 ? C.yellow : C.yellowSoft, color: C.ink }}
    >
      {dday(n)}
    </span>
  );
}

function Hero({ minute }: { minute: number }) {
  const today = todayOf(minute);
  const list = today ? upcomingAll(today) : [];

  return (
    <section id="top" className="px-4 pb-14 pt-8 md:px-6 md:pb-20 md:pt-14">
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 md:grid-cols-[1fr_1.1fr] md:gap-12">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold" style={{ color: C.green }}>
            □□역 3번 출구 앞 세무사 사무소
          </p>
          <h1 className="mt-2 text-[38px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[52px]">{OFFICE}</h1>
          <p className="mt-4 max-w-[520px]" style={{ color: C.muted }}>
            개인사업자, 법인, 프리랜서의 장부 정리와 세금 신고를 맡고 있습니다. 세무사 두 명이 맡은 사업장을 처음부터 끝까지 직접 봅니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <a href="#contact" className="inline-flex h-12 items-center rounded-[6px] px-5 font-semibold" style={{ background: C.green, color: "#fff" }}>
              상담 신청
            </a>
            <a href="#calendar" className="inline-flex h-12 items-center gap-2 rounded-[6px] border bg-white px-5 font-semibold" style={{ borderColor: C.line }}>
              <CalendarDays size={18} style={{ color: C.green }} aria-hidden />내 세금 달력 보기
            </a>
          </div>

          <div className="mt-7 rounded-[10px] border bg-white p-4 md:p-5" style={{ borderColor: C.line }} aria-live="polite">
            <p className="text-[15px] font-bold">다가오는 신고 기한</p>
            <ul className="mt-2 divide-y" style={{ borderColor: C.line }}>
              {today
                ? list.map(({ d, who }) => (
                    <li key={d.id} className="flex items-center gap-3 py-2.5" style={{ borderColor: C.line }}>
                      <DdayBadge n={dayDiff(d.real, today)} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold leading-[1.4]">{d.title}</span>
                        <span className="block text-[14px] tabular-nums" style={{ color: C.muted }}>
                          {md(d.real)}
                          {d.shifted ? `까지 (${d.shifted}이라 미뤄짐)` : "까지"}, {who}
                        </span>
                      </span>
                    </li>
                  ))
                : [0, 1, 2].map((i) => <li key={i} className="h-[68px]" />)}
            </ul>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] md:aspect-[7/6]">
          <Image src={`${IMG}/hero.jpg`} alt="서류와 계산기, 노트북이 놓인 밝은 사무실 책상" fill priority sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}

function SectionHead({ id, tag, title, desc }: { id: string; tag: string; title: string; desc?: string }) {
  return (
    <div>
      <p className="inline-flex items-center gap-2 text-[15px] font-bold" style={{ color: C.green }}>
        <span className="inline-block h-[2px] w-5" style={{ background: C.green }} aria-hidden />
        {tag}
      </p>
      <h2 id={id} className="mt-1.5 text-[28px] font-bold leading-[1.35] tracking-[-0.03em] md:text-[36px]">
        {title}
      </h2>
      {desc && (
        <p className="mt-3 max-w-[660px]" style={{ color: C.muted }}>
          {desc}
        </p>
      )}
    </div>
  );
}

function Pill({ on, onClick, children, disabled }: { on: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className="min-h-11 rounded-[6px] border px-3.5 py-2 text-left text-[15px] font-semibold leading-[1.35] transition-colors disabled:opacity-40"
      style={on ? { background: C.green, color: "#fff", borderColor: C.green } : { background: C.card, borderColor: C.line, color: C.ink }}
    >
      {children}
    </button>
  );
}

/* ---------- 내 세금 달력 ---------- */

type AskFn = (p: Omit<Prefill, "key">) => void;

function TaxCalendar({ minute, onAsk }: { minute: number; onAsk: AskFn }) {
  const reduce = useReducedMotionSafe();
  const [type, setType] = useState<BizType>("general");
  const [staff, setStaff] = useState(false);
  const [half, setHalf] = useState(false);
  const [freelancePay, setFreelancePay] = useState(false);
  const [sincere, setSincere] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const stripRef = useRef<HTMLDivElement>(null);

  const today = todayOf(minute);
  const ready = !!today;
  const year = today ? today.getFullYear() : 0;
  const sincereOk = type !== "simple";
  const profile: Profile = { type, staff, half, freelancePay, sincere: sincere && sincereOk };
  const items = today ? scheduleFor(year, profile) : [];
  const next = today ? items.find((d) => d.real >= today) ?? null : null;
  const selected = items.find((d) => d.id === selectedId) ?? next;
  const remainThisYear = today ? items.filter((d) => d.real >= today && d.due.getFullYear() === year).length : 0;

  const months = ready ? Array.from({ length: 15 }, (_, i) => ({ y: year + Math.floor(i / 12), m: (i % 12) + 1 })) : [];

  // 처음 그릴 때 띠를 이번 달 위치로 옮긴다(띠 안에서만 움직인다)
  useEffect(() => {
    if (!ready) return;
    const box = stripRef.current;
    const cur = box?.querySelector<HTMLElement>('[data-current="true"]');
    if (box && cur) box.scrollLeft = Math.max(0, cur.offsetLeft - 12);
  }, [ready]);

  const toggleCheck = (key: string) =>
    setChecked((prev) => {
      const s = new Set(prev);
      if (s.has(key)) s.delete(key);
      else s.add(key);
      return s;
    });

  return (
    <section aria-labelledby="calendar-title" id="calendar" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: "rgba(255,255,255,0.6)" }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="calendar-title"
          tag="내 세금 달력"
          title="내 사업에 맞는 신고 기한만 모아 봅니다"
          desc="사업자 유형과 직원 여부를 고르면 올해 1월부터 다음 해 3월까지의 기한이 펼쳐집니다. 기한을 누르면 준비할 서류가 나옵니다."
        />

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[300px_1fr]">
          <div className="space-y-6 rounded-[10px] border bg-white p-5" style={{ borderColor: C.line }}>
            <fieldset>
              <legend className="text-[15px] font-bold">사업자 유형</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-1">
                {BIZ.map((b) => (
                  <Pill key={b.id} on={type === b.id} onClick={() => { setType(b.id); setSelectedId(null); }}>
                    {b.label}
                  </Pill>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-[15px] font-bold">직원</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill on={!staff} onClick={() => { setStaff(false); setSelectedId(null); }}>
                  없음
                </Pill>
                <Pill on={staff} onClick={() => { setStaff(true); setSelectedId(null); }}>
                  있음
                </Pill>
              </div>
              <label className="mt-3 flex min-h-11 cursor-pointer items-start gap-2.5 text-[15px] leading-[1.45]">
                <input type="checkbox" checked={freelancePay} onChange={(e) => { setFreelancePay(e.target.checked); setSelectedId(null); }} className="mt-0.5 h-5 w-5 shrink-0 accent-[#1f5c45]" />
                프리랜서에게 3.3%를 떼고 일을 맡깁니다
              </label>
              {(staff || freelancePay) && (
                <div className="mt-3">
                  <p className="text-[14px] font-semibold" style={{ color: C.muted }}>
                    원천세 납부
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <Pill on={!half} onClick={() => { setHalf(false); setSelectedId(null); }}>
                      매월
                    </Pill>
                    <Pill on={half} onClick={() => { setHalf(true); setSelectedId(null); }}>
                      반기 (승인받음)
                    </Pill>
                  </div>
                </div>
              )}
            </fieldset>
            <label className={`flex min-h-11 items-start gap-2.5 text-[15px] leading-[1.45] ${sincereOk ? "cursor-pointer" : "opacity-50"}`}>
              <input
                type="checkbox"
                disabled={!sincereOk}
                checked={sincere && sincereOk}
                onChange={(e) => { setSincere(e.target.checked); setSelectedId(null); }}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[#1f5c45]"
              />
              <span>
                <span className="font-bold">성실신고확인대상</span>
                <span className="block text-[14px]" style={{ color: C.muted }}>
                  {!sincereOk ? "간이과세자는 해당하지 않습니다" : type === "corp" ? "성실신고 사업자가 전환한 지 3년 안 된 법인 등" : "업종별 매출 기준을 넘은 사업자"}
                </span>
              </span>
            </label>
          </div>

          <div className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border bg-white px-5 py-4" style={{ borderColor: C.line }} aria-live="polite">
              {today && next ? (
                <>
                  <div className="flex min-w-0 items-center gap-3">
                    <DdayBadge n={dayDiff(next.real, today)} big />
                    <div className="min-w-0">
                      <p className="text-[14px]" style={{ color: C.muted }}>
                        다음 기한
                      </p>
                      <p className="font-bold leading-[1.4]">
                        {next.title}, <span className="tabular-nums">{md(next.real)}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-[15px] tabular-nums" style={{ color: C.muted }}>
                    올해 남은 기한 <span className="font-bold" style={{ color: C.ink }}>{remainThisYear}건</span>
                  </p>
                </>
              ) : (
                <p className="h-[52px]" />
              )}
            </div>

            <div className="rounded-[10px] border bg-white" style={{ borderColor: C.line }}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-4 py-3 text-[14px]" style={{ borderColor: C.line, color: C.muted }}>
                {(Object.keys(GROUP_STYLE) as Group[]).map((g) => (
                  <span key={g} className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-3 w-1 rounded-[1px]" style={{ background: GROUP_STYLE[g].bar }} aria-hidden />
                    {GROUP_STYLE[g].label}
                  </span>
                ))}
                <span className="ml-auto hidden text-[13px] sm:inline">옆으로 밀어 다른 달 보기</span>
              </div>
              <div ref={stripRef} className="overflow-x-auto" tabIndex={0} role="region" aria-label="달별 신고 기한">
                <ol className="flex min-h-[260px]">
                  {months.map(({ y, m }) => {
                    const list = items.filter((d) => d.due.getFullYear() === y && d.due.getMonth() + 1 === m);
                    const current = today && today.getFullYear() === y && today.getMonth() + 1 === m;
                    return (
                      <li
                        key={`${y}-${m}`}
                        data-current={current ? "true" : undefined}
                        className="w-[172px] shrink-0 border-r last:border-r-0"
                        style={{ borderColor: C.line, background: current ? "rgba(244,211,94,0.12)" : undefined }}
                      >
                        <p className="flex items-baseline gap-1.5 border-b px-3 py-2" style={{ borderColor: C.line }}>
                          <span className="text-[18px] font-bold tabular-nums">{m}월</span>
                          {(m === 1 || current) && (
                            <span className="text-[13px] tabular-nums" style={{ color: C.muted }}>
                              {current ? "이번 달" : `${y}년`}
                            </span>
                          )}
                        </p>
                        <ul className="space-y-1.5 p-2">
                          {list.length === 0 && (
                            <li className="px-1.5 py-2 text-[13px]" style={{ color: "#9aa39f" }}>
                              기한 없음
                            </li>
                          )}
                          {list.map((d) => {
                            const past = today ? d.real < today : false;
                            const on = selected?.id === d.id;
                            const isNext = next?.id === d.id;
                            return (
                              <li key={d.id}>
                                <button
                                  type="button"
                                  aria-pressed={on}
                                  onClick={() => setSelectedId(d.id)}
                                  aria-label={`${d.title}, ${md(d.real)}까지${d.shifted ? `, ${d.shifted}이라 미뤄짐` : ""}${past ? ", 지남" : ""}`}
                                  className="block w-full rounded-[4px] py-1.5 pl-2.5 pr-2 text-left text-[14px] leading-[1.4] transition-colors"
                                  style={{
                                    borderTop: `1px solid ${on ? C.green : "transparent"}`,
                                    borderRight: `1px solid ${on ? C.green : "transparent"}`,
                                    borderBottom: `1px solid ${on ? C.green : "transparent"}`,
                                    borderLeft: `3px solid ${GROUP_STYLE[KIND_GROUP[d.kind]].bar}`,
                                    background: on ? C.greenSoft : isNext ? C.yellowSoft : "#f6f5f0",
                                    opacity: past && !on ? 0.5 : 1,
                                  }}
                                >
                                  <span className="flex items-center justify-between gap-1 tabular-nums">
                                    <span className="font-bold">
                                      {d.due.getDate()}일
                                      {d.shifted && (
                                        <span className="ml-1 font-semibold" style={{ color: C.red }}>
                                          {d.real.getMonth() !== d.due.getMonth() ? `${d.real.getMonth() + 1}/${d.real.getDate()}` : `${d.real.getDate()}일`}로
                                        </span>
                                      )}
                                    </span>
                                    {past ? <span className="text-[12px]">지남</span> : isNext && today ? <span className="rounded-[3px] px-1 text-[12px] font-bold" style={{ background: C.yellow }}>{dday(dayDiff(d.real, today))}</span> : null}
                                  </span>
                                  <span className="block">{d.title}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            <div aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {selected && today && (
                  <motion.div
                    key={selected.id}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="relative overflow-hidden rounded-[10px] border bg-white py-5 pl-8 pr-5 md:pl-12 md:pr-7"
                    style={{ borderColor: C.line, backgroundImage: RULED, backgroundPosition: "0 10px" }}
                  >
                    <span className="absolute inset-y-0 left-4 w-[3px] border-x md:left-7" style={{ borderColor: C.margin }} aria-hidden />
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold" style={{ color: GROUP_STYLE[KIND_GROUP[selected.kind]].bar === C.ink ? C.muted : C.green }}>
                          {GROUP_STYLE[KIND_GROUP[selected.kind]].label}
                        </p>
                        <h3 className="text-[22px] font-bold leading-[1.35] tracking-[-0.02em]">{selected.title}</h3>
                      </div>
                      <DdayBadge n={dayDiff(selected.real, today)} />
                    </div>
                    <dl className="mt-3 grid gap-1 text-[15px] tabular-nums sm:grid-cols-[auto_1fr] sm:gap-x-4">
                      <dt style={{ color: C.muted }}>법정 기한</dt>
                      <dd className="font-semibold">
                        {selected.due.getFullYear()}년 {md(selected.due)}
                      </dd>
                      {selected.shifted && (
                        <>
                          <dt style={{ color: C.muted }}>실제 기한</dt>
                          <dd className="font-semibold" style={{ color: C.red }}>
                            {md(selected.due).slice(0, -4)}이 {selected.shifted}이라 다음 영업일인 {md(selected.real)}까지 내면 됩니다
                          </dd>
                        </>
                      )}
                    </dl>
                    <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
                      {KIND_INFO[selected.kind].about}
                    </p>
                    <p className="mt-4 flex items-center gap-1.5 font-bold">
                      <ClipboardList size={18} style={{ color: C.green }} aria-hidden />
                      준비할 서류
                    </p>
                    <ul className="mt-1">
                      {KIND_INFO[selected.kind].prep.map((p, i) => {
                        const key = `${selected.id}:${i}`;
                        const on = checked.has(key);
                        return (
                          <li key={key}>
                            <label className="flex min-h-[32px] cursor-pointer items-start gap-2.5 py-0.5 text-[15px] leading-[2]">
                              <input type="checkbox" checked={on} onChange={() => toggleCheck(key)} className="mt-[9px] h-4 w-4 shrink-0 accent-[#1f5c45]" />
                              <span style={on ? { textDecoration: "line-through", color: C.muted } : undefined}>{p}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      type="button"
                      onClick={() =>
                        onAsk({
                          topics: [KIND_INFO[selected.kind].topic],
                          biz: BIZ_TO_CHOICE[type],
                          memo: `${selected.title} (${md(selected.real)}까지) 준비를 맡기고 싶습니다.`,
                        })
                      }
                      className="mt-4 inline-flex h-11 items-center rounded-[6px] px-4 text-[15px] font-semibold"
                      style={{ background: C.green, color: "#fff" }}
                    >
                      이 신고 상담 신청
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-[14px]" style={{ color: C.muted }}>
              실제 일정은 국세청 공지를 따릅니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 기장료 계산기 ---------- */

const INDUSTRIES = [
  { id: "retail", label: "도소매", base: 100_000 },
  { id: "service", label: "음식·서비스", base: 100_000 },
  { id: "maker", label: "제조", base: 130_000 },
  { id: "pro", label: "전문직", base: 120_000 },
];

const BANDS = [
  { label: "3천만 원 미만", add: 0, adjust: 300_000 },
  { label: "3천만 ~ 1억 원", add: 20_000, adjust: 400_000 },
  { label: "1억 ~ 3억 원", add: 40_000, adjust: 550_000 },
  { label: "3억 ~ 5억 원", add: 70_000, adjust: 750_000 },
  { label: "5억 ~ 10억 원", add: 100_000, adjust: 1_100_000 },
  { label: "10억 ~ 30억 원", add: 160_000, adjust: 1_600_000 },
  { label: "30억 원 이상", add: 250_000, adjust: 2_500_000 },
];

function FeeCalculator({ onAsk }: { onAsk: AskFn }) {
  const [industry, setIndustry] = useState("service");
  const [band, setBand] = useState(2);
  const [people, setPeople] = useState(2);
  const [corp, setCorp] = useState(false);

  const ind = INDUSTRIES.find((i) => i.id === industry) ?? INDUSTRIES[0];
  const b = BANDS[band];
  const staffFee = Math.min(people, 5) * 10_000 + Math.max(0, people - 5) * 5_000;
  const corpFee = corp ? 50_000 : 0;
  const low = ind.base + b.add + staffFee + corpFee;
  const high = Math.round((low * 1.2) / 5_000) * 5_000;
  const adjust = corp ? Math.round((b.adjust * 1.3) / 50_000) * 50_000 : b.adjust;

  const rows = [
    { k: `기본 기장료 (${ind.label})`, v: ind.base },
    { k: `매출 구간 (${b.label})`, v: b.add },
    { k: `인건비 신고 (직원 ${people}명)`, v: staffFee },
    ...(corp ? [{ k: "법인 장부", v: corpFee }] : []),
  ];

  return (
    <section aria-labelledby="fee-title" id="fee" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="fee-title"
          tag="기장료 계산"
          title="한 달 기장료를 미리 어림해 보세요"
          desc="부가세 신고와 원천세 신고는 기장료에 들어 있습니다. 종합소득세나 법인세 신고 때는 1년에 한 번 조정료가 따로 붙습니다."
        />
        <div className="mt-10 grid items-start gap-6 md:grid-cols-[1fr_400px] md:gap-8">
          <div className="space-y-7 rounded-[10px] border bg-white p-5 md:p-7" style={{ borderColor: C.line }}>
            <fieldset>
              <legend className="text-[15px] font-bold">업종</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {INDUSTRIES.map((i) => (
                  <Pill key={i.id} on={industry === i.id} onClick={() => setIndustry(i.id)}>
                    {i.label}
                  </Pill>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="fee-band" className="flex flex-wrap items-baseline justify-between gap-2 text-[15px] font-bold">
                작년 매출
                <span className="text-[20px] tabular-nums" style={{ color: C.green }}>
                  {b.label}
                </span>
              </label>
              <input
                id="fee-band"
                type="range"
                min={0}
                max={BANDS.length - 1}
                step={1}
                value={band}
                onChange={(e) => setBand(Number(e.target.value))}
                aria-valuetext={b.label}
                className="mt-3 w-full accent-[#1f5c45]"
              />
              <div className="mt-1 flex justify-between text-[13px] tabular-nums" style={{ color: C.muted }} aria-hidden>
                <span>3천만</span>
                <span>3억</span>
                <span>30억 이상</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[15px] font-bold" id="fee-people-label">
                직원 수
                <span className="block text-[14px] font-normal" style={{ color: C.muted }}>
                  대표자는 빼고 세어 주세요
                </span>
              </p>
              <div className="flex items-center gap-1" role="group" aria-labelledby="fee-people-label">
                <button type="button" aria-label="직원 한 명 빼기" onClick={() => setPeople((n) => Math.max(0, n - 1))} className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] border" style={{ borderColor: C.line }}>
                  <Minus size={18} aria-hidden />
                </button>
                <span className="w-16 text-center text-[20px] font-bold tabular-nums" aria-live="polite">
                  {people}명
                </span>
                <button type="button" aria-label="직원 한 명 더하기" onClick={() => setPeople((n) => Math.min(50, n + 1))} className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] border" style={{ borderColor: C.line }}>
                  <Plus size={18} aria-hidden />
                </button>
              </div>
            </div>
            <fieldset>
              <legend className="text-[15px] font-bold">사업자 형태</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill on={!corp} onClick={() => setCorp(false)}>
                  개인사업자
                </Pill>
                <Pill on={corp} onClick={() => setCorp(true)}>
                  법인
                </Pill>
              </div>
            </fieldset>
          </div>

          <div className="rounded-[10px] border bg-white p-5 md:p-6" style={{ borderColor: C.line }} aria-live="polite">
            <p className="flex items-center gap-2 text-[15px] font-bold" style={{ color: C.muted }}>
              <Calculator size={18} style={{ color: C.green }} aria-hidden />
              예상 월 기장료
            </p>
            <p className="mt-1 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] tabular-nums">
              {man(low)} ~ {man(high)} 원
            </p>
            <table className="mt-5 w-full text-[15px] tabular-nums">
              <caption className="sr-only">월 기장료 내역</caption>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.k} className="border-t" style={{ borderColor: C.line }}>
                    <th scope="row" className="py-2.5 pr-3 text-left font-normal" style={{ color: C.muted }}>
                      {r.k}
                    </th>
                    <td className="py-2.5 text-right">{r.v === 0 ? "0원" : `${comma(r.v)}원`}</td>
                  </tr>
                ))}
                <tr className="border-t-2" style={{ borderColor: C.ink }}>
                  <th scope="row" className="py-2.5 text-left font-bold">
                    월 합계 (부가세 별도)
                  </th>
                  <td className="py-2.5 text-right font-bold">{comma(low)}원부터</td>
                </tr>
                <tr className="border-t" style={{ borderColor: C.line }}>
                  <th scope="row" className="py-2.5 text-left font-bold">
                    조정료 (1년에 한 번)
                  </th>
                  <td className="py-2.5 text-right font-bold">{comma(adjust)}원부터</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
              거래 건수와 장부 상태에 따라 범위 안에서 정합니다.
            </p>
            <button
              type="button"
              onClick={() =>
                onAsk({
                  topics: ["기장 맡기기"],
                  biz: corp ? "법인" : "",
                  memo: `업종 ${ind.label}, 작년 매출 ${b.label}, 직원 ${people}명, ${corp ? "법인" : "개인사업자"}. 계산기 예상 월 ${man(low)} ~ ${man(high)} 원`,
                })
              }
              className="mt-5 h-12 w-full rounded-[6px] text-[16px] font-bold"
              style={{ background: C.green, color: "#fff" }}
            >
              이 조건으로 상담 신청
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 상담 신청 ---------- */

const TOPICS = ["기장 맡기기", "기장 옮기기", "부가세", "종합소득세", "법인세", "원천세·인건비", "법인 전환", "세무 조사"];
const TIMES = ["오전 9시 ~ 12시", "오후 1시 ~ 6시", "문자로 먼저 연락"];

function Contact({ prefill }: { prefill: Prefill }) {
  return (
    <section aria-labelledby="contact-title" id="contact" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.greenSoft }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="contact-title" tag="상담 신청" title="첫 상담 30분은 비용을 받지 않습니다" desc="남겨 주신 시간에 세무사가 직접 전화드립니다. 자료를 미리 보내지 않으셔도 됩니다." />
        <ContactForm key={prefill.key} prefill={prefill} />
      </div>
    </section>
  );
}

function ContactForm({ prefill }: { prefill: Prefill }) {
  const reduce = useReducedMotionSafe();
  const [topics, setTopics] = useState<string[]>(prefill.topics);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [biz, setBiz] = useState(prefill.biz);
  const [time, setTime] = useState("");
  const [memo, setMemo] = useState(prefill.memo);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ no: string; name: string; phone: string; time: string; topics: string[] } | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topics.length === 0) return setError("상담 주제를 하나 이상 골라 주세요.");
    if (name.trim().length < 2) return setError("이름을 두 글자 이상 적어 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setError("연락받을 휴대전화 번호를 적어 주세요.");
    if (!biz) return setError("사업자 유형을 골라 주세요.");
    if (!time) return setError("연락받기 편한 시간을 골라 주세요.");
    setError("");
    const n = new Date();
    const p2 = (v: number) => String(v).padStart(2, "0");
    const no = `${String(n.getFullYear()).slice(2)}${p2(n.getMonth() + 1)}${p2(n.getDate())}-${String((n.getHours() * 60 + n.getMinutes()) % 1000).padStart(3, "0")}`;
    setDone({ no, name: maskName(name), phone: maskPhone(phone), time, topics });
  };

  const reset = () => {
    setDone(null);
    setTopics([]);
    setName("");
    setPhone("");
    setBiz("");
    setTime("");
    setMemo("");
  };

  return (
    <div className="mt-10" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mx-auto max-w-[560px] rounded-[10px] border bg-white p-6 md:p-8"
            style={{ borderColor: C.line }}
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full" style={{ background: C.green, color: "#fff" }}>
              <Check size={22} aria-hidden />
            </span>
            <p className="mt-4 text-[22px] font-bold tracking-[-0.02em]">{done.name}님, 상담 신청을 받았습니다</p>
            <dl className="mt-5 divide-y border-y text-[15px]" style={{ borderColor: C.line }}>
              {[
                ["접수 번호", done.no],
                ["상담 주제", done.topics.join(", ")],
                ["연락처", done.phone],
                ["연락 시간", done.time],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4 py-2.5" style={{ borderColor: C.line }}>
                  <dt className="w-[76px] shrink-0" style={{ color: C.muted }}>
                    {k}
                  </dt>
                  <dd className="min-w-0 font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[15px]" style={{ color: C.muted }}>
              {done.time === "문자로 먼저 연락" ? "오늘 안에 문자로 통화 가능한 시간을 여쭙겠습니다." : "고르신 시간에 세무사가 직접 전화드립니다."} 급하시면 {TEL}로 접수 번호를 말씀해 주세요.
            </p>
            <button type="button" onClick={reset} className="mt-5 inline-flex h-10 items-center gap-1.5 text-[15px] font-semibold" style={{ color: C.green }}>
              <RotateCcw size={16} aria-hidden />
              새로 작성
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" exit={{ opacity: 0 }} onSubmit={submit} noValidate className="grid gap-6 rounded-[10px] border bg-white p-5 md:grid-cols-2 md:gap-x-8 md:p-8" style={{ borderColor: C.line }}>
            <fieldset className="md:col-span-2">
              <legend className="text-[15px] font-bold">상담 주제 (여러 개 고를 수 있어요)</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <Pill key={t} on={topics.includes(t)} onClick={() => setTopics((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))}>
                    {t}
                  </Pill>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className="text-[15px] font-bold">이름</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="김하늘" className="mt-1.5 h-12 w-full rounded-[6px] border px-3 outline-none focus:border-[#1f5c45]" style={{ borderColor: C.line }} />
            </label>
            <label className="block">
              <span className="text-[15px] font-bold">휴대전화</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" className="mt-1.5 h-12 w-full rounded-[6px] border px-3 tabular-nums outline-none focus:border-[#1f5c45]" style={{ borderColor: C.line }} />
            </label>
            <fieldset>
              <legend className="text-[15px] font-bold">사업자 유형</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {BIZ_CHOICES.map((b) => (
                  <Pill key={b} on={biz === b} onClick={() => setBiz(b)}>
                    {b}
                  </Pill>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-[15px] font-bold">연락받기 편한 시간</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {TIMES.map((t) => (
                  <Pill key={t} on={time === t} onClick={() => setTime(t)}>
                    {t}
                  </Pill>
                ))}
              </div>
            </fieldset>
            <label className="block md:col-span-2">
              <span className="text-[15px] font-bold">남길 말 (선택)</span>
              <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} placeholder="지금 상황을 짧게 적어 주시면 통화가 빨라집니다." className="mt-1.5 w-full rounded-[6px] border px-3 py-2.5 outline-none focus:border-[#1f5c45]" style={{ borderColor: C.line }} />
            </label>
            <div className="md:col-span-2">
              {error && (
                <p className="mb-3 text-[15px] font-semibold" style={{ color: C.red }} role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="h-12 w-full rounded-[6px] text-[17px] font-bold md:w-auto md:px-10" style={{ background: C.green, color: "#fff" }}>
                상담 신청하기
              </button>
              <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
                데모 화면이라 입력한 내용은 어디에도 보내지 않습니다.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- 세무 소식 ---------- */

type NewsCat = "일정" | "절세" | "개정" | "소식";
const NEWS_CATS: { id: NewsCat | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "일정", label: "신고 일정" },
  { id: "절세", label: "절세" },
  { id: "개정", label: "세법 개정" },
  { id: "소식", label: "사무소 소식" },
];

const NEWS: { id: number; cat: NewsCat; date: string; title: string; body: string }[] = [
  { id: 1, cat: "일정", date: "2026.09.30", title: "10월 부가세, 개인은 고지서로 냅니다", body: "개인 일반과세자는 직전 기 납부세액의 절반이 고지됩니다. 신고는 필요 없고 고지서 금액만 기한 안에 내면 됩니다. 법인은 예정신고를 해야 합니다." },
  { id: 2, cat: "절세", date: "2026.09.12", title: "노란우산공제, 12월 전에 넣으면 올해 소득공제에 들어갑니다", body: "사업소득 금액에 따라 연 200만 원에서 600만 원까지 소득공제를 받습니다. 연말에 한꺼번에 넣어도 그해 납입액으로 인정됩니다." },
  { id: 3, cat: "개정", date: "2026.08.28", title: "올해 세법 개정안에서 소상공인이 볼 부분", body: "고용을 늘린 사업장의 세액공제, 업무용 승용차 기준, 간편장부 대상 기준이 어떻게 바뀌는지 표로 정리했습니다. 사무실에 인쇄본도 둡니다." },
  { id: 4, cat: "절세", date: "2026.08.05", title: "사업용 카드를 홈택스에 등록하셨나요", body: "개인사업자는 사업에 쓰는 카드를 홈택스에 등록해 두면 사용 내역이 자동으로 모입니다. 영수증을 따로 모으지 않아도 매입세액공제를 챙길 수 있습니다." },
  { id: 5, cat: "일정", date: "2026.07.20", title: "간이과세자 7월 고지서, 금액이 맞는지 보세요", body: "작년 세액의 절반이 고지됩니다. 상반기 매출이 작년보다 크게 줄었다면 신고로 대신해 덜 낼 수 있습니다." },
  { id: 6, cat: "소식", date: "2026.07.01", title: "토요일 상담은 1월과 5월에만 엽니다", body: "부가세 확정신고와 종합소득세 신고가 몰리는 1월, 5월에는 토요일 오전 10시부터 오후 3시까지 상담합니다." },
  { id: 7, cat: "절세", date: "2026.06.15", title: "업무용 승용차, 운행기록부가 필요한 경우", body: "차량 관련 비용이 연 1,500만 원을 넘으면 운행기록부가 있어야 넘는 금액을 경비로 인정받습니다. 성실신고확인대상은 업무용 자동차 보험도 확인합니다." },
  { id: 8, cat: "개정", date: "2026.05.10", title: "간이과세 기준 금액은 연 매출 1억 400만 원입니다", body: "직전 연도 매출이 1억 400만 원 미만이면 간이과세자가 될 수 있습니다. 부동산 임대업과 과세 유흥업은 4,800만 원 기준이 그대로입니다." },
  { id: 9, cat: "소식", date: "2026.04.02", title: "△△구 소상공인 무료 세무 상담에 참여합니다", body: "매달 둘째 수요일 오후, △△구 소상공인지원센터에서 김○○ 세무사가 상담합니다. 예약은 센터로 해 주세요." },
];

function News() {
  const reduce = useReducedMotionSafe();
  const [cat, setCat] = useState<NewsCat | "all">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const q = query.trim();
  const list = NEWS.filter((n) => (cat === "all" || n.cat === cat) && (!q || n.title.includes(q) || n.body.includes(q)));
  const catLabel = (c: NewsCat) => NEWS_CATS.find((x) => x.id === c)?.label ?? c;

  return (
    <section aria-labelledby="news-title" id="news" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="news-title" tag="세무 소식" title="사장님이 알아 두면 좋은 짧은 글" />
        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative block md:w-[300px]">
            <span className="sr-only">세무 소식 검색</span>
            <Search size={19} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="부가세, 카드, 노란우산"
              className="h-12 w-full rounded-[6px] border bg-white pl-11 pr-4 outline-none focus:border-[#1f5c45]"
              style={{ borderColor: C.line }}
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="글 분류">
            {NEWS_CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
                className="h-11 rounded-[6px] border px-4 text-[15px] font-semibold"
                style={cat === c.id ? { background: C.ink, color: "#fff", borderColor: C.ink } : { background: C.card, borderColor: C.line }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-6 border-t" style={{ borderColor: C.ink }}>
          {list.map((n) => {
            const isOpen = open === n.id;
            return (
              <li key={n.id} className="border-b" style={{ borderColor: C.line }}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`news-${n.id}`}
                  onClick={() => setOpen(isOpen ? null : n.id)}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 py-4 text-left md:grid-cols-[110px_1fr_110px_auto]"
                >
                  <span className="text-[14px] font-semibold" style={{ color: C.green }}>
                    {catLabel(n.cat)}
                  </span>
                  <ChevronDown size={20} className="row-span-2 shrink-0 transition-transform md:order-last md:row-span-1" style={{ transform: isOpen ? "rotate(180deg)" : undefined, color: C.muted }} aria-hidden />
                  <span className="font-semibold leading-[1.45]">{n.title}</span>
                  <span className="hidden text-[14px] tabular-nums md:block" style={{ color: C.muted }}>
                    {n.date}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`news-${n.id}`}
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-[15px] md:pl-[126px] md:pr-[150px]" style={{ color: C.muted }}>
                        <span className="mb-1 block tabular-nums md:hidden">{n.date}</span>
                        {n.body}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
        {list.length === 0 && (
          <p className="mt-6 rounded-[10px] bg-white p-6 text-center" style={{ color: C.muted }}>
            찾는 글이 없어요. 궁금한 내용은 {TEL}로 물어봐 주세요.
          </p>
        )}
      </div>
    </section>
  );
}

/* ---------- 세무사 소개 ---------- */

function About() {
  return (
    <section aria-labelledby="about-title" id="about" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: "rgba(255,255,255,0.6)" }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="about-title" tag="세무사 소개" title="맡은 장부는 세무사가 직접 봅니다" />
        <div className="mt-10 grid items-start gap-8 md:grid-cols-[1fr_1fr] md:gap-12">
          <div className="rounded-[10px] border bg-white p-6 md:p-8" style={{ borderColor: C.line }}>
            <div className="flex items-center gap-4">
              <span className="inline-flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[6px] p-[3px]" style={{ border: `2px solid ${C.green}` }} aria-hidden>
                <span className="flex h-full w-full items-center justify-center rounded-[3px] text-[30px] font-bold" style={{ border: `1px solid ${C.green}`, color: C.green }}>
                  김
                </span>
              </span>
              <div>
                <p className="text-[14px] font-semibold" style={{ color: C.green }}>
                  대표세무사
                </p>
                <p className="text-[24px] font-bold tracking-[-0.02em]">김○○</p>
              </div>
            </div>
            <p className="mt-5" style={{ color: C.muted }}>
              음식점과 소매점 장부를 가장 많이 봅니다. 신고서를 내기 전에는 숫자를 사장님과 전화로 한 번 더 맞춰 봅니다.
            </p>
            <ul className="mt-5 space-y-2 border-t pt-5 text-[15px]" style={{ borderColor: C.line }}>
              {["세무사 등록 2012년", "△△세무서 개인납세과 8년 근무", "△△회계법인 세무본부", "△△구 소상공인지원센터 세무 상담 위원"].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check size={17} className="mt-[5px] shrink-0" style={{ color: C.green }} aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <dl className="mt-6 grid grid-cols-2 gap-3 text-[15px]">
              {[
                ["이○○ 세무사", "법인 신고, 법인 전환"],
                ["박○○ 실장", "기장, 인건비 신고"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[6px] px-3 py-2.5" style={{ background: C.paper }}>
                  <dt className="font-bold">{k}</dt>
                  <dd className="text-[14px]" style={{ color: C.muted }}>
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[10px]">
              <Image src={`${IMG}/office.jpg`} alt="책상과 의자 네 개가 놓인 작은 상담실" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
              상담실은 문이 닫히는 별도 방입니다. 매출이나 가족 이야기를 편하게 하셔도 됩니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 자주 묻는 질문 ---------- */

const FAQS = [
  {
    q: "기장을 다른 사무소에서 옮기면 자료는 어떻게 옮기나요?",
    a: "홈택스에서 저희 사무소 수임 동의만 해 주시면 됩니다. 이전 사무소에 장부 파일과 지난 신고서 사본은 저희가 요청하고, 보통 2주 안에 옮기기가 끝납니다. 이전 사무소에 따로 연락하지 않으셔도 됩니다.",
  },
  {
    q: "기장을 맡기면 제가 따로 할 일이 있나요?",
    a: "사업용 카드를 홈택스에 등록하고, 현금으로 낸 경비 영수증만 매달 사진으로 보내 주시면 됩니다. 세금계산서와 카드 내역은 저희가 홈택스에서 가져옵니다.",
  },
  {
    q: "매출이 적은데도 기장을 해야 하나요?",
    a: "새로 시작했거나 매출이 업종 기준보다 적으면 간편장부 대상이라 직접 적어도 됩니다. 다만 간편장부 대상자가 복식부기로 신고하면 산출세액의 20%, 100만 원까지 기장세액공제를 받습니다.",
  },
  {
    q: "종합소득세 신고만 따로 맡길 수 있나요?",
    a: "네. 1년치 경비 자료를 받아 신고만 대행합니다. 비용은 매출과 자료 양을 보고 미리 알려 드립니다.",
  },
  {
    q: "세무 조사 통지를 받았어요. 어떻게 해야 하나요?",
    a: "통지서를 받은 날 바로 전화 주세요. 조사 대상 기간과 항목을 확인하고, 필요하면 조사 연기 신청부터 함께 준비합니다.",
  },
  {
    q: "계약 기간이 정해져 있나요?",
    a: "월 단위 계약입니다. 그만두실 때는 한 달 전에만 말씀해 주시면 되고, 장부 파일은 다음 사무소에 그대로 넘겨 드립니다.",
  },
];

function Faq() {
  const reduce = useReducedMotionSafe();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section aria-labelledby="faq-title" id="faq" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-[320px_1fr] md:gap-12">
        <SectionHead id="faq-title" tag="자주 묻는 질문" title="상담 전에 많이 묻는 것들" />
        <ul className="border-t" style={{ borderColor: C.ink }}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q} className="border-b" style={{ borderColor: C.line }}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-start gap-3 py-4 text-left font-semibold leading-[1.5]"
                  >
                    <span className="font-bold tabular-nums" style={{ color: C.green }}>
                      Q
                    </span>
                    <span className="flex-1">{f.q}</span>
                    <ChevronDown size={20} className="mt-1 shrink-0 transition-transform" style={{ transform: isOpen ? "rotate(180deg)" : undefined, color: C.muted }} aria-hidden />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-${i}`}
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 pl-7 text-[15px]" style={{ color: C.muted }}>
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

function MiniMap() {
  return (
    <svg viewBox="0 0 640 360" className="h-auto w-full" role="img" aria-label="□□역 3번 출구에서 길을 건너 □□빌딩 5층에 있는 사무소 약도">
      <rect width="640" height="360" fill={C.card} />
      {[60, 120, 180, 240, 300].map((y) => (
        <path key={y} d={`M0 ${y} H640`} stroke={C.rule} strokeWidth="1" />
      ))}
      <path d="M0 210 H640" stroke={C.line} strokeWidth="32" />
      <path d="M420 0 V360" stroke={C.line} strokeWidth="20" />
      <text x="24" y="258" fontSize="15" fill={C.muted}>
        □□로
      </text>
      <circle cx="160" cy="210" r="16" fill={C.ink} />
      <text x="160" y="215" fontSize="13" fill="#fff" textAnchor="middle" fontWeight={700}>
        3
      </text>
      <text x="96" y="176" fontSize="15" fill={C.ink}>
        □□역 3번 출구
      </text>
      <path d="M178 210 H300 V140" stroke={C.green} strokeWidth="3" strokeDasharray="6 7" fill="none" />
      <rect x="250" y="40" width="130" height="96" rx="4" fill={C.paper} stroke={C.green} strokeWidth="2" />
      <text x="315" y="78" fontSize="15" fill={C.ink} textAnchor="middle" fontWeight={700}>
        □□빌딩
      </text>
      <text x="315" y="104" fontSize="13" fill={C.green} textAnchor="middle" fontWeight={700}>
        5층 {OFFICE}
      </text>
      <rect x="460" y="250" width="140" height="70" rx="4" fill={C.greenSoft} />
      <text x="530" y="290" fontSize="13" fill={C.muted} textAnchor="middle">
        △△은행
      </text>
    </svg>
  );
}

function Location() {
  return (
    <section aria-labelledby="location-title" id="location" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: "rgba(255,255,255,0.6)" }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="location-title" tag="오시는 길" title="□□역 3번 출구에서 걸어서 2분" />
        <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div className="overflow-hidden rounded-[10px] border" style={{ borderColor: C.line }}>
            <MiniMap />
          </div>
          <div>
            <p className="text-[22px] font-bold tracking-[-0.02em]">{ADDRESS}</p>
            <ul className="mt-5 space-y-4">
              {[
                { icon: TrainFront, title: "지하철", body: "□□역 3번 출구로 나와 △△은행 옆 건물" },
                { icon: Car, title: "주차", body: "건물 지하 주차장 1시간 무료, 상담 때 차량 번호를 말씀해 주세요." },
              ].map((r) => (
                <li key={r.title} className="flex gap-3">
                  <r.icon size={20} className="mt-1 shrink-0" style={{ color: C.green }} aria-hidden />
                  <span>
                    <span className="font-semibold">{r.title}</span>
                    <span className="block text-[15px]" style={{ color: C.muted }}>
                      {r.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <table className="mt-7 w-full border-t text-[15px] tabular-nums" style={{ borderColor: C.ink }}>
              <caption className="sr-only">상담 시간</caption>
              <tbody>
                {[
                  ["평일", "09:00 ~ 18:00"],
                  ["점심시간", "12:00 ~ 13:00"],
                  ["1월, 5월 토요일", "10:00 ~ 15:00"],
                  ["그 밖의 주말, 공휴일", "쉽니다"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b" style={{ borderColor: C.line }}>
                    <th scope="row" className="py-3 text-left font-normal" style={{ color: C.muted }}>
                      {k}
                    </th>
                    <td className="py-3 text-right font-semibold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a href={`tel:${TEL}`} className="mt-6 inline-flex h-12 items-center gap-2 rounded-[6px] px-6 font-semibold tabular-nums" style={{ background: C.green, color: "#fff" }}>
              <Phone size={18} aria-hidden />
              전화 {TEL}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-4 pb-24 pt-12 md:px-6" style={{ background: C.greenDeep, color: "#e5eee9" }}>
      <div className="mx-auto max-w-[1200px]">
        <Logo light />
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: "#a9c4b8" }}>
          {[
            ["상호", OFFICE],
            ["대표세무사", "김○○"],
            ["사업자등록번호", "000-00-00000"],
            ["주소", ADDRESS],
            ["전화", TEL],
            ["이메일", "hello@example.com"],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt>{k}</dt>
              <dd style={{ color: "#fff" }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </footer>
  );
}
