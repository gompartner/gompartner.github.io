"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  House,
  List,
  Menu,
  Minus,
  Phone,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 세무회계 사무소 홈페이지 데모: 가상의 ○○ 세무회계.
   사무소 이름, 세무사 이름, 주소, 전화번호, 사업자 정보, 기장료는 모두 가상이다.
   신고 기한은 실제 세법의 기본 기한을 따르되, 음력 공휴일은 해마다 바뀌어 계산에서 뺀다.

   구조: 개인 세무사무소에서 흔한 포털형. 첫 화면은 사무소명·전화 줄 아래 이달 신고일정과 기장료 안내 두 박스,
   그 아래 세무소식·세무사 인사말·관련 사이트를 선으로만 나눈 목록으로 둔다.
   메뉴(사무소 소개, 업무분야, 세무일정, 요금안내, 세무자료실, 오시는 길, 상담신청)는 라우트 없이
   컴포넌트 상태로 하위 화면을 바꾼다.

   디자인: 장부 느낌의 따뜻한 흰 바탕(#fbfaf6), 짙은 초록(#1f5c45), 먹색 글자(#1d2422).
   D-day는 화면마다 가장 가까운 기한 하나에만 형광펜 노랑(#f4d35e)으로 달고, 나머지는 날짜로만 적는다.

   세무일정은 사업자 유형, 직원 유무와 원천세 납부 방법, 성실신고확인대상 여부로
   올해 1월부터 다음 해 3월까지의 신고 기한을 계산해 월 탭과 목록으로 보여 준다.
   기한이 주말이나 공휴일이면 다음 영업일로 옮겨 적고, 기한을 고르면 준비 서류 체크 목록이 나온다.
   메인 박스에서 고른 사업자 유형은 세무일정 화면으로 그대로 이어진다.
   요금안내는 연 매출 구간 x 개인·법인 요금표의 칸을 고르는 방식이고, 직원 수를 더해 월 합계를 낸다.
   고른 조건은 상담신청서 문의 내용에 채워 넘긴다. 접수 화면에는 이름과 번호를 가려 보여 준다.

   사진 출처(public/images/demo-tax):
   AI 생성(Z-Image-Turbo, Apache 2.0) office */

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

/* ---------- 요금 ---------- */

const BANDS = [
  { label: "3천만 원 미만", short: "3천만 미만", fee: 100_000, adjust: 300_000 },
  { label: "3천만 ~ 1억 원", short: "3천만~1억", fee: 120_000, adjust: 400_000 },
  { label: "1억 ~ 3억 원", short: "1억~3억", fee: 140_000, adjust: 550_000 },
  { label: "3억 ~ 5억 원", short: "3억~5억", fee: 170_000, adjust: 750_000 },
  { label: "5억 ~ 10억 원", short: "5억~10억", fee: 200_000, adjust: 1_100_000 },
  { label: "10억 ~ 30억 원", short: "10억~30억", fee: 260_000, adjust: 1_600_000 },
  { label: "30억 원 이상", short: "30억 이상", fee: 350_000, adjust: 2_500_000 },
];

const CORP_ADD = 50_000;
const monthlyFee = (band: number, corp: boolean) => BANDS[band].fee + (corp ? CORP_ADD : 0);
const adjustFee = (band: number, corp: boolean) => (corp ? Math.round((BANDS[band].adjust * 1.3) / 50_000) * 50_000 : BANDS[band].adjust);
const staffFee = (n: number) => Math.min(n, 5) * 10_000 + Math.max(0, n - 5) * 5_000;

type FeePick = { band: number; corp: boolean; staff: number };

/* ---------- 세무자료실 ---------- */

type BoardId = "news" | "column" | "notice";
const BOARDS: { id: BoardId; label: string }[] = [
  { id: "news", label: "세무소식" },
  { id: "column", label: "세무칼럼" },
  { id: "notice", label: "공지사항" },
];

type Post = { id: number; board: BoardId; cat: string; date: string; title: string; body: string };

const POSTS: Post[] = [
  { id: 12, board: "news", cat: "신고일정", date: "2026.09.30", title: "10월 부가세, 개인은 고지서로 냅니다", body: "개인 일반과세자는 직전 기 납부세액의 절반이 고지됩니다. 신고는 필요 없고 고지서 금액만 기한 안에 내면 됩니다. 법인은 예정신고를 해야 합니다." },
  { id: 11, board: "column", cat: "절세", date: "2026.09.12", title: "노란우산공제, 12월 전에 넣으면 올해 소득공제에 들어갑니다", body: "사업소득 금액에 따라 연 200만 원에서 600만 원까지 소득공제를 받습니다. 연말에 한꺼번에 넣어도 그해 납입액으로 인정됩니다." },
  { id: 10, board: "news", cat: "세법개정", date: "2026.08.28", title: "올해 세법 개정안에서 소상공인이 볼 부분", body: "고용을 늘린 사업장의 세액공제, 업무용 승용차 기준, 간편장부 대상 기준이 어떻게 바뀌는지 표로 정리했습니다. 사무실에 인쇄본도 둡니다." },
  { id: 9, board: "column", cat: "절세", date: "2026.08.05", title: "사업용 카드 홈택스 등록 안내", body: "개인사업자는 사업에 쓰는 카드를 홈택스에 등록해 두면 사용 내역이 자동으로 모입니다. 영수증을 따로 모으지 않아도 매입세액공제를 챙길 수 있습니다." },
  { id: 8, board: "news", cat: "신고일정", date: "2026.07.20", title: "간이과세자 7월 부가세 고지서 금액 확인", body: "작년 세액의 절반이 고지됩니다. 상반기 매출이 작년보다 크게 줄었다면 신고로 대신해 덜 낼 수 있습니다." },
  { id: 7, board: "notice", cat: "사무소", date: "2026.07.01", title: "토요일 상담은 1월과 5월에만 엽니다", body: "부가세 확정신고와 종합소득세 신고가 몰리는 1월, 5월에는 토요일 오전 10시부터 오후 3시까지 상담합니다." },
  { id: 6, board: "column", cat: "경비", date: "2026.06.15", title: "업무용 승용차, 운행기록부가 필요한 경우", body: "차량 관련 비용이 연 1,500만 원을 넘으면 운행기록부가 있어야 넘는 금액을 경비로 인정받습니다. 성실신고확인대상은 업무용 자동차 보험도 확인합니다." },
  { id: 5, board: "news", cat: "세법개정", date: "2026.05.10", title: "간이과세 기준 금액은 연 매출 1억 400만 원입니다", body: "직전 연도 매출이 1억 400만 원 미만이면 간이과세자가 될 수 있습니다. 부동산 임대업과 과세 유흥업은 4,800만 원 기준이 그대로입니다." },
  { id: 4, board: "notice", cat: "사무소", date: "2026.04.02", title: "△△구 소상공인 무료 세무 상담에 참여합니다", body: "매달 둘째 수요일 오후, △△구 소상공인지원센터에서 김ㅅ우 세무사가 상담합니다. 예약은 센터로 해 주세요." },
  { id: 3, board: "column", cat: "인건비", date: "2026.03.18", title: "직원 4대보험 취득신고는 입사일 다음 달 15일까지", body: "신고가 늦으면 과태료가 붙고 두루누리 지원도 놓칠 수 있습니다. 입사자 정보는 입사 당일 보내 주시면 사무소에서 신고합니다." },
  { id: 2, board: "notice", cat: "사무소", date: "2026.02.03", title: "자료 전달 방법이 바뀌었습니다", body: "증빙 자료는 이메일이나 카카오톡 채널로 보내 주시면 됩니다. 원본이 필요한 서류는 따로 안내드립니다." },
];

/* 게시판에 쌓인 전체 글 수. 데모에는 최근 글만 넣어 두고 첫 쪽만 보여 준다. */
const BOARD_TOTAL: Record<BoardId, number> = { news: 213, column: 86, notice: 41 };

/* ---------- 업무분야 ---------- */

const SERVICES: { name: string; desc: string; topic: string }[] = [
  { name: "세무기장/신고", desc: "장부 작성과 부가가치세, 원천세, 종합소득세, 법인세 신고를 맡습니다.", topic: "신규 기장" },
  { name: "세무조정", desc: "결산 뒤 회계 이익을 세법 기준으로 맞춰 법인세와 종합소득세를 계산합니다.", topic: "법인세" },
  { name: "양도소득세", desc: "부동산과 주식 양도 전에 세액을 미리 계산하고 신고합니다.", topic: "양도·상속·증여" },
  { name: "상속세·증여세", desc: "재산 평가와 공제 검토, 신고와 분할 납부 신청까지 진행합니다.", topic: "양도·상속·증여" },
  { name: "법인설립·법인전환", desc: "개인사업자의 법인전환 시점을 검토하고 설립 뒤 첫 신고까지 돕습니다.", topic: "법인전환" },
  { name: "세무조사대응", desc: "조사 통지를 받은 날부터 자료 준비와 의견 진술을 함께합니다.", topic: "세무조사대응" },
  { name: "4대보험", desc: "직원 입사와 퇴사 신고, 보수총액 신고, 두루누리 지원 신청을 처리합니다.", topic: "원천세·인건비" },
];

const SHORTCUTS = [
  { name: "홈택스", href: "https://www.hometax.go.kr" },
  { name: "위택스", href: "https://www.wetax.go.kr" },
  { name: "4대사회보험 정보연계센터", href: "https://www.4insure.or.kr" },
  { name: "정부24", href: "https://www.gov.kr" },
  { name: "국세법령정보시스템", href: "https://taxlaw.nts.go.kr" },
  { name: "대법원 인터넷등기소", href: "https://www.iros.go.kr" },
];

/* ---------- 페이지 ---------- */

const BIZ_CHOICES = ["개인 일반과세자", "개인 간이과세자", "법인", "프리랜서", "사업 준비 중"];
const BIZ_TO_CHOICE: Record<BizType, string> = { general: "개인 일반과세자", simple: "개인 간이과세자", corp: "법인", free: "프리랜서" };

type Prefill = { key: number; topics: string[]; biz: string; memo: string };
type AskFn = (p: Omit<Prefill, "key">) => void;

type View = "home" | "about" | "services" | "schedule" | "fee" | "board" | "map" | "contact";

const NAV: { id: Exclude<View, "home" | "contact">; label: string }[] = [
  { id: "about", label: "사무소 소개" },
  { id: "services", label: "업무분야" },
  { id: "schedule", label: "세무일정" },
  { id: "fee", label: "요금안내" },
  { id: "board", label: "세무자료실" },
  { id: "map", label: "오시는 길" },
];

const VIEW_TITLE: Record<Exclude<View, "home">, string> = {
  about: "사무소 소개",
  services: "업무분야",
  schedule: "사업자별 세무일정",
  fee: "기장료 안내",
  board: "세무자료실",
  map: "오시는 길",
  contact: "상담신청",
};

type Go = (v: View) => void;

export function TaxOfficeDemo() {
  const minute = useNowMinute();
  const [view, setView] = useState<View>("home");
  const [profile, setProfile] = useState<Profile>({ type: "general", staff: false, half: false, freelancePay: false, sincere: false });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [fee, setFee] = useState<FeePick>({ band: 2, corp: false, staff: 0 });
  const [board, setBoard] = useState<BoardId>("news");
  const [postId, setPostId] = useState<number | null>(null);
  const [prefill, setPrefill] = useState<Prefill>({ key: 0, topics: [], biz: "", memo: "" });
  const moved = useRef(false);

  const go: Go = (v) => {
    moved.current = true;
    setView(v);
  };

  // 화면을 바꾸면 맨 위로 올리고 제목에 초점을 둔다
  useEffect(() => {
    if (!moved.current) return;
    window.scrollTo({ top: 0, behavior: "auto" });
    document.getElementById(view === "home" ? "tax-home-title" : "tax-page-title")?.focus({ preventScroll: true });
  }, [view]);

  const ask: AskFn = (p) => {
    setPrefill((prev) => ({ ...p, key: prev.key + 1 }));
    go("contact");
  };

  const openDeadline = (id: string, m: number) => {
    setSelectedId(id);
    setMonth(m);
    go("schedule");
  };

  const openPost = (p: Post) => {
    setBoard(p.board);
    setPostId(p.id);
    go("board");
  };

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.paper, color: C.ink }}>
      <Header view={view} go={go} />
      <main>
        {view === "home" ? (
          <Home
            minute={minute}
            profile={profile}
            setProfile={(p) => {
              setProfile(p);
              setSelectedId(null);
            }}
            fee={fee}
            setFee={setFee}
            go={go}
            ask={ask}
            openDeadline={openDeadline}
            openPost={openPost}
          />
        ) : (
          <SubPage view={view} go={go}>
            {view === "schedule" && (
              <Schedule
                minute={minute}
                profile={profile}
                setProfile={(p) => {
                  setProfile(p);
                  setSelectedId(null);
                }}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                month={month}
                setMonth={setMonth}
                onAsk={ask}
              />
            )}
            {view === "fee" && <FeeTable fee={fee} setFee={setFee} onAsk={ask} />}
            {view === "board" && (
              <Board
                board={board}
                setBoard={(b) => {
                  setBoard(b);
                  setPostId(null);
                }}
                postId={postId}
                setPostId={setPostId}
              />
            )}
            {view === "about" && <About />}
            {view === "services" && <Services onAsk={ask} />}
            {view === "map" && <Location />}
            {view === "contact" && <Contact prefill={prefill} minute={minute} />}
          </SubPage>
        )}
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

function Header({ view, go }: { view: View; go: Go }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const pick = (v: View) => {
    setOpen(false);
    go(v);
  };

  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: "rgba(251,250,246,0.97)", borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <button type="button" onClick={() => pick("home")} aria-label={`${OFFICE} 처음 화면`} className="min-w-0">
          <Logo />
        </button>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => {
              const on = view === n.id;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => pick(n.id)}
                    aria-current={on ? "page" : undefined}
                    className="h-10 rounded-[6px] px-3 text-[15px] font-semibold transition-colors hover:text-[#1f5c45]"
                    style={{ color: on ? C.green : C.muted, boxShadow: on ? `inset 0 -2px 0 ${C.green}` : undefined }}
                  >
                    {n.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <a href={`tel:${TEL}`} className="hidden h-10 items-center gap-1.5 px-2 text-[15px] font-semibold tabular-nums xl:inline-flex" style={{ color: C.green }}>
            <Phone size={16} aria-hidden />
            {TEL}
          </a>
          <button
            type="button"
            onClick={() => pick("contact")}
            aria-current={view === "contact" ? "page" : undefined}
            className="hidden h-10 items-center rounded-[6px] px-4 text-[15px] font-semibold sm:inline-flex"
            style={{ background: C.green, color: "#fff" }}
          >
            상담신청
          </button>
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
            <ul className="grid grid-cols-2 gap-x-4 px-4 py-2">
              {[...NAV, { id: "contact" as const, label: "상담신청" }].map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => pick(n.id)}
                    aria-current={view === n.id ? "page" : undefined}
                    className="flex h-12 w-full items-center text-left text-[17px]"
                    style={{ color: view === n.id ? C.green : C.ink, fontWeight: view === n.id ? 700 : 400 }}
                  >
                    {n.label}
                  </button>
                </li>
              ))}
              <li className="col-span-2">
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

/* ---------- 공용 조각 ---------- */

function DdayBadge({ n, big = false }: { n: number; big?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[4px] font-bold tabular-nums ${big ? "px-2.5 py-1 text-[20px]" : "min-w-[58px] px-2 py-0.5 text-[14px]"}`}
      style={{ background: n <= 7 ? C.yellow : C.yellowSoft, color: C.ink }}
    >
      {dday(n)}
    </span>
  );
}

function Radio({ name, checked, onChange, children }: { name: string; checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-[15px] leading-[1.4]">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="h-[18px] w-[18px] shrink-0 accent-[#1f5c45]" />
      {children}
    </label>
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

/** 메인 박스. 일정과 기장료 두 곳만 박스로 묶는다. */
function Box({ id, title, more, onMore, className = "", children }: { id: string; title: string; more?: string; onMore?: () => void; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`flex min-w-0 flex-col rounded-[8px] border bg-white ${className}`} style={{ borderColor: C.line }}>
      <div className="flex items-center justify-between gap-3 border-b py-2 pl-5 pr-3" style={{ borderColor: C.line }}>
        <h2 id={`${id}-title`} className="py-1 text-[18px] font-bold tracking-[-0.02em]">
          {title}
        </h2>
        {onMore && more && (
          <button type="button" onClick={onMore} className="inline-flex h-10 items-center gap-0.5 text-[14px] hover:underline" style={{ color: C.muted }}>
            {more}
            <ChevronRight size={15} aria-hidden />
          </button>
        )}
      </div>
      <div className="flex-1 p-4 md:p-5">{children}</div>
    </section>
  );
}

/** 박스 없이 선으로만 나누는 목록 제목 */
function ListHead({ id, title, onMore }: { id: string; title: string; onMore?: () => void }) {
  return (
    <div className="flex items-end justify-between border-b-2 pb-2" style={{ borderColor: C.ink }}>
      <h2 id={id} className="text-[19px] font-bold tracking-[-0.02em]">
        {title}
      </h2>
      {onMore && (
        <button type="button" onClick={onMore} aria-label={`${title} 더보기`} className="inline-flex h-9 items-center gap-0.5 text-[14px] hover:underline" style={{ color: C.muted }}>
          더보기
          <ChevronRight size={15} aria-hidden />
        </button>
      )}
    </div>
  );
}

const inputCls = "mt-1.5 h-12 w-full rounded-[6px] border bg-white px-3 outline-none focus:border-[#1f5c45]";

/* ---------- 메인 ---------- */

/** 이번 달 기한(지난 것 포함)과, 남은 게 적으면 다음 달 기한을 붙인다 */
function monthDigest(today: Date, p: Profile) {
  const y = today.getFullYear();
  const all = scheduleFor(y, p);
  const thisMonth = all.filter((d) => d.due.getFullYear() === y && d.due.getMonth() === today.getMonth());
  const upcoming = thisMonth.filter((d) => d.real >= today).length;
  const nm = new Date(y, today.getMonth() + 1, 1);
  const nextMonth = upcoming < 3 ? all.filter((d) => d.due.getFullYear() === nm.getFullYear() && d.due.getMonth() === nm.getMonth()).slice(0, 3 - upcoming) : [];
  return { thisMonth, nextMonth, nm };
}

function Home({
  minute,
  profile,
  setProfile,
  fee,
  setFee,
  go,
  ask,
  openDeadline,
  openPost,
}: {
  minute: number;
  profile: Profile;
  setProfile: (p: Profile) => void;
  fee: FeePick;
  setFee: (f: FeePick) => void;
  go: Go;
  ask: AskFn;
  openDeadline: (id: string, monthIdx: number) => void;
  openPost: (p: Post) => void;
}) {
  const today = todayOf(minute);
  const digest = today ? monthDigest(today, profile) : null;
  const latest = POSTS.slice(0, 5);
  const boardLabel = (b: BoardId) => BOARDS.find((x) => x.id === b)?.label ?? "";
  const monthIdxOf = (d: Date) => (today ? (d.getFullYear() - today.getFullYear()) * 12 + d.getMonth() : 0);
  // D-day는 가장 가까운 기한 하나에만 단다
  const nearest = digest && today ? [...digest.thisMonth, ...digest.nextMonth].find((d) => d.real >= today) ?? null : null;

  const row = (d: Deadline) => {
    const past = today ? d.real < today : false;
    return (
      <tr key={d.id} className="border-b" style={{ borderColor: C.line, color: past ? C.muted : C.ink }}>
        <td className="whitespace-nowrap py-2.5 pr-3 align-top tabular-nums">{md(d.real)}</td>
        <td className="py-1 pr-2 align-top">
          <button type="button" onClick={() => openDeadline(d.id, monthIdxOf(d.due))} className="block py-1.5 text-left font-semibold leading-[1.45] underline-offset-4 hover:underline">
            {d.title}
          </button>
        </td>
        <td className="whitespace-nowrap py-2.5 text-right align-top text-[14px] tabular-nums">
          {past ? (
            "지남"
          ) : nearest?.id === d.id && today ? (
            <span className="px-1 font-bold" style={{ background: C.yellow, color: C.ink }}>
              {dday(dayDiff(d.real, today))}
            </span>
          ) : d.shifted ? (
            `${d.shifted}로 연기`
          ) : (
            ""
          )}
        </td>
      </tr>
    );
  };

  return (
    <>
      <section aria-labelledby="tax-home-title" className="border-b bg-white px-4 md:px-6" style={{ borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-4 py-6 md:flex-row md:items-end md:justify-between md:py-8">
          <div>
            <h1 id="tax-home-title" tabIndex={-1} className="text-[30px] font-bold leading-[1.3] tracking-[-0.03em] outline-none md:text-[34px]">
              {OFFICE}
            </h1>
            <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
              개인사업자·법인 세무기장, 신고대리 / 대표세무사 김ㅅ우
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
            <div>
              <a href={`tel:${TEL}`} className="inline-flex items-center gap-2 text-[26px] font-bold tabular-nums tracking-[-0.01em]" style={{ color: C.green }}>
                <Phone size={22} aria-hidden />
                {TEL}
              </a>
              <p className="text-[14px] tabular-nums" style={{ color: C.muted }}>
                평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00), 토요일은 1월과 5월만
              </p>
            </div>
            <button type="button" onClick={() => go("contact")} className="h-12 rounded-[6px] px-5 text-[16px] font-bold" style={{ background: C.green, color: "#fff" }}>
              상담신청
            </button>
          </div>
        </div>
      </section>

      <div className="px-4 pb-16 pt-6 md:px-6 md:pt-8">
        <div className="mx-auto grid max-w-[1200px] items-start gap-5 lg:grid-cols-12">
          {/* 이달의 신고일정 */}
          <Box id="tax-schedule" title={today ? `${today.getMonth() + 1}월 신고일정` : "이달의 신고일정"} more="전체 일정" onMore={() => go("schedule")} className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <label className="flex items-center gap-2 text-[15px] font-semibold">
                사업자 유형
                <select
                  value={profile.type}
                  onChange={(e) => setProfile({ ...profile, type: e.target.value as BizType })}
                  className="h-10 rounded-[6px] border bg-white px-2 font-normal"
                  style={{ borderColor: C.line }}
                >
                  {BIZ.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 text-[15px]">
                <input type="checkbox" checked={profile.staff} onChange={(e) => setProfile({ ...profile, staff: e.target.checked })} className="h-5 w-5 accent-[#1f5c45]" />
                직원 있음
              </label>
            </div>
            <div className="mt-3 min-h-[220px]" aria-live="polite">
              {digest && today && (
                <table className="w-full border-t-2 text-[15px]" style={{ borderColor: C.ink }}>
                  <caption className="sr-only">신고, 납부 기한</caption>
                  <thead>
                    <tr className="border-b text-[13px]" style={{ borderColor: C.line, color: C.muted }}>
                      <th scope="col" className="w-[120px] py-2 text-left font-semibold">
                        기한
                      </th>
                      <th scope="col" className="py-2 text-left font-semibold">
                        신고·납부
                      </th>
                      <th scope="col" className="w-[96px] py-2 text-right font-semibold">
                        비고
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {digest.thisMonth.length === 0 ? (
                      <tr className="border-b" style={{ borderColor: C.line }}>
                        <td colSpan={3} className="py-3 text-[15px]" style={{ color: C.muted }}>
                          이번 달은 신고 기한이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      digest.thisMonth.map(row)
                    )}
                    {digest.nextMonth.map(row)}
                  </tbody>
                </table>
              )}
            </div>
          </Box>

          {/* 기장료 안내 */}
          <Box id="tax-fee" title="기장료 안내" more="요금표" onMore={() => go("fee")} className="lg:col-span-5">
            <FeeGrid fee={fee} setFee={setFee} compact />
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t pt-3" style={{ borderColor: C.ink }} aria-live="polite">
              <p className="text-[15px] leading-[1.5]">
                {fee.corp ? "법인" : "개인"}, {BANDS[fee.band].label}
                <span className="block text-[20px] font-bold tabular-nums">월 {comma(monthlyFee(fee.band, fee.corp) + staffFee(fee.staff))}원부터</span>
              </p>
              <button
                type="button"
                onClick={() => ask({ topics: ["신규 기장"], biz: fee.corp ? "법인" : "", memo: `${fee.corp ? "법인" : "개인사업자"}, 작년 매출 ${BANDS[fee.band].label}, 기장료 상담 원합니다.` })}
                className="h-11 rounded-[6px] border px-4 text-[15px] font-semibold"
                style={{ borderColor: C.green, color: C.green }}
              >
                기장 상담 신청
              </button>
            </div>
            <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
              부가세 별도, 직원 {fee.staff}명 기준
            </p>
          </Box>
        </div>

        <div className="mx-auto mt-12 grid max-w-[1200px] gap-10 lg:grid-cols-12">
          {/* 세무소식 */}
          <section id="tax-news" aria-labelledby="tax-news-title" className="min-w-0 lg:col-span-7">
            <ListHead id="tax-news-title" title="세무소식" onMore={() => go("board")} />
            <ul>
              {latest.map((p) => (
                <li key={p.id} className="border-b" style={{ borderColor: C.line }}>
                  <button type="button" onClick={() => openPost(p)} className="grid w-full grid-cols-[auto_1fr] items-baseline gap-x-3 py-2.5 text-left sm:grid-cols-[auto_1fr_auto]">
                    <span className="text-[13px] font-semibold" style={{ color: C.green }}>
                      [{boardLabel(p.board)}]
                    </span>
                    <span className="truncate text-[15px] hover:underline">{p.title}</span>
                    <span className="col-start-2 text-[13px] tabular-nums sm:col-start-auto" style={{ color: C.muted }}>
                      {p.date}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <div className="min-w-0 space-y-10 lg:col-span-5">
            {/* 세무사 인사말 */}
            <section id="tax-about" aria-labelledby="tax-about-title">
              <ListHead id="tax-about-title" title="세무사 인사말" />
              <div className="mt-3 flex items-start gap-4">
                <span className="relative h-[84px] w-[112px] shrink-0 overflow-hidden rounded-[4px]">
                  <Image src={`${IMG}/office.jpg`} alt="" fill sizes="112px" className="object-cover" />
                </span>
                <p className="text-[15px] leading-[1.6]" style={{ color: C.muted }}>
                  맡은 장부는 세무사가 직접 봅니다. 신고서를 내기 전에 숫자를 사장님과 한 번 더 맞춰 봅니다.{" "}
                  <button type="button" onClick={() => go("about")} className="font-semibold underline underline-offset-4" style={{ color: C.ink }}>
                    인사말 전체
                  </button>
                </p>
              </div>
            </section>

            {/* 바로가기 */}
            <section id="tax-links" aria-labelledby="tax-links-title">
              <ListHead id="tax-links-title" title="관련 사이트" />
              <ul className="grid grid-cols-2 text-[15px]">
                {SHORTCUTS.map((s) => (
                  <li key={s.name} className="border-b" style={{ borderColor: C.line }}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="flex min-h-[44px] items-center gap-1.5 py-2 pr-2 leading-[1.35] hover:underline">
                      {s.name}
                      <ExternalLink size={13} className="shrink-0" style={{ color: C.muted }} aria-hidden />
                      <span className="sr-only">(새 창)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- 하위 페이지 틀 ---------- */

function SubPage({ view, go, children }: { view: Exclude<View, "home">; go: Go; children: React.ReactNode }) {
  const parent = view === "contact" ? "고객센터" : NAV.find((n) => n.id === view)?.label;
  return (
    <>
      <div className="border-b px-4 md:px-6" style={{ borderColor: C.line, background: "#fff" }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-end justify-between gap-x-6 gap-y-2 py-6 md:py-8">
          <h1 id="tax-page-title" tabIndex={-1} className="text-[28px] font-bold leading-[1.3] tracking-[-0.03em] outline-none md:text-[34px]">
            {VIEW_TITLE[view]}
          </h1>
          <nav aria-label="현재 위치" className="text-[14px]" style={{ color: C.muted }}>
            <ol className="flex items-center gap-1">
              <li>
                <button type="button" onClick={() => go("home")} className="inline-flex h-9 items-center gap-1 hover:underline">
                  <House size={15} aria-hidden />홈
                </button>
              </li>
              <li aria-hidden>
                <ChevronRight size={14} />
              </li>
              <li aria-current="page" className="font-semibold" style={{ color: C.ink }}>
                {parent}
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="px-4 pb-20 pt-8 md:px-6 md:pt-10">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </div>
    </>
  );
}

/* ---------- 세무일정 ---------- */

function Schedule({
  minute,
  profile,
  setProfile,
  selectedId,
  setSelectedId,
  month,
  setMonth,
  onAsk,
}: {
  minute: number;
  profile: Profile;
  setProfile: (p: Profile) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  month: number | null;
  setMonth: (m: number) => void;
  onAsk: AskFn;
}) {
  const reduce = useReducedMotionSafe();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const tabsRef = useRef<HTMLDivElement>(null);

  const today = todayOf(minute);
  const year = today ? today.getFullYear() : 0;
  const { type, staff, half, freelancePay } = profile;
  const sincereOk = type !== "simple";
  const eff: Profile = { ...profile, sincere: profile.sincere && sincereOk };
  const items = today ? scheduleFor(year, eff) : [];
  const next = today ? items.find((d) => d.real >= today) ?? null : null;
  const remainThisYear = today ? items.filter((d) => d.real >= today && d.due.getFullYear() === year).length : 0;

  const cur = month ?? (today ? today.getMonth() : 0);
  const ym = { y: year + Math.floor(cur / 12), m: (cur % 12) + 1 };
  const inMonth = items.filter((d) => d.due.getFullYear() === ym.y && d.due.getMonth() + 1 === ym.m);
  const selected = items.find((d) => d.id === selectedId) ?? inMonth.find((d) => today && d.real >= today) ?? inMonth[0] ?? null;

  const set = (p: Partial<Profile>) => setProfile({ ...profile, ...p });
  const moveMonth = (m: number) => {
    setMonth(m);
    setSelectedId(null);
  };

  // 고른 달 탭이 탭 줄 안에서 보이게 옮긴다
  useEffect(() => {
    const box = tabsRef.current;
    const tab = box?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (box && tab) box.scrollLeft = Math.max(0, tab.offsetLeft - box.clientWidth / 2 + tab.offsetWidth / 2);
  }, [cur, year]);

  const toggleCheck = (key: string) =>
    setChecked((prev) => {
      const s = new Set(prev);
      if (s.has(key)) s.delete(key);
      else s.add(key);
      return s;
    });

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[290px_1fr]">
      <div className="space-y-5 border-t-2 pt-4" style={{ borderColor: C.ink }}>
        <fieldset>
          <legend className="text-[15px] font-bold">사업자 유형</legend>
          <div className="mt-1 grid grid-cols-2 gap-x-3 lg:grid-cols-1">
            {BIZ.map((b) => (
              <Radio key={b.id} name="sch-biz" checked={type === b.id} onChange={() => set({ type: b.id })}>
                {b.label}
              </Radio>
            ))}
          </div>
        </fieldset>
        <fieldset className="border-t pt-4" style={{ borderColor: C.line }}>
          <legend className="float-left w-full text-[15px] font-bold">직원</legend>
          <div className="clear-both flex flex-wrap gap-x-5">
            <Radio name="sch-staff" checked={!staff} onChange={() => set({ staff: false })}>
              없음
            </Radio>
            <Radio name="sch-staff" checked={staff} onChange={() => set({ staff: true })}>
              있음
            </Radio>
          </div>
          <label className="mt-3 flex min-h-11 cursor-pointer items-start gap-2.5 text-[15px] leading-[1.45]">
            <input type="checkbox" checked={freelancePay} onChange={(e) => set({ freelancePay: e.target.checked })} className="mt-0.5 h-5 w-5 shrink-0 accent-[#1f5c45]" />
            사업소득 지급(3.3%) 있음
          </label>
          {(staff || freelancePay) && (
            <div className="mt-3">
              <p className="text-[14px] font-semibold" style={{ color: C.muted }}>
                원천세 납부
              </p>
              <div className="flex flex-wrap gap-x-5">
                <Radio name="sch-half" checked={!half} onChange={() => set({ half: false })}>
                  매월
                </Radio>
                <Radio name="sch-half" checked={half} onChange={() => set({ half: true })}>
                  반기 (승인받음)
                </Radio>
              </div>
            </div>
          )}
        </fieldset>
        <label className={`flex min-h-11 items-start gap-2.5 border-t pt-4 text-[15px] leading-[1.45] ${sincereOk ? "cursor-pointer" : "opacity-50"}`} style={{ borderColor: C.line }}>
          <input type="checkbox" disabled={!sincereOk} checked={eff.sincere} onChange={(e) => set({ sincere: e.target.checked })} className="mt-0.5 h-5 w-5 shrink-0 accent-[#1f5c45]" />
          <span>
            <span className="font-bold">성실신고확인대상</span>
            <span className="block text-[14px]" style={{ color: C.muted }}>
              {!sincereOk ? "간이과세자는 해당하지 않습니다" : type === "corp" ? "성실신고 사업자가 전환한 지 3년 안 된 법인 등" : "업종별 매출 기준을 넘은 사업자"}
            </span>
          </span>
        </label>
      </div>

      <div className="min-w-0 space-y-4">
        <div className="flex min-h-[72px] flex-wrap items-center justify-between gap-3 border-b-2 pb-3" style={{ borderColor: C.ink }} aria-live="polite">
          {today && next && (
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
          )}
        </div>

        <div className="rounded-[10px] border bg-white" style={{ borderColor: C.line }}>
          <div className="flex items-center gap-1 border-b px-2 py-2" style={{ borderColor: C.line }}>
            <button
              type="button"
              onClick={() => moveMonth(Math.max(0, cur - 1))}
              disabled={!today || cur === 0}
              aria-label="이전 달"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] disabled:opacity-30"
            >
              <ChevronLeft size={20} aria-hidden />
            </button>
            <div ref={tabsRef} className="flex min-w-0 flex-1 gap-1 overflow-x-auto" role="group" aria-label="월 선택">
              {today &&
                Array.from({ length: 15 }, (_, i) => {
                  const m = (i % 12) + 1;
                  const on = i === cur;
                  const has = items.some((d) => d.due.getFullYear() === year + Math.floor(i / 12) && d.due.getMonth() + 1 === m);
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-pressed={on}
                      onClick={() => moveMonth(i)}
                      aria-label={`${year + Math.floor(i / 12)}년 ${m}월`}
                      className="h-10 min-w-[48px] shrink-0 rounded-[6px] px-2 text-[15px] font-semibold tabular-nums"
                      style={on ? { background: C.green, color: "#fff" } : { color: has ? C.ink : "#a5aca9" }}
                    >
                      {i >= 12 ? `${(year + 1) % 100}년 ${m}월` : `${m}월`}
                    </button>
                  );
                })}
            </div>
            <button
              type="button"
              onClick={() => moveMonth(Math.min(14, cur + 1))}
              disabled={!today || cur === 14}
              aria-label="다음 달"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] disabled:opacity-30"
            >
              <ChevronRight size={20} aria-hidden />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pt-3 text-[14px]" style={{ color: C.muted }}>
            <span className="mr-auto font-bold tabular-nums" style={{ color: C.ink }}>
              {today ? `${ym.y}년 ${ym.m}월` : ""}
            </span>
            {(Object.keys(GROUP_STYLE) as Group[]).map((g) => (
              <span key={g} className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-1 rounded-[1px]" style={{ background: GROUP_STYLE[g].bar }} aria-hidden />
                {GROUP_STYLE[g].label}
              </span>
            ))}
          </div>

          <ul className="min-h-[180px] p-2" aria-live="polite">
            {today && inMonth.length === 0 && (
              <li className="px-3 py-6 text-center text-[15px]" style={{ color: C.muted }}>
                이 달은 신고 기한이 없습니다.
              </li>
            )}
            {today &&
              inMonth.map((d) => {
                const past = d.real < today;
                const on = selected?.id === d.id;
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setSelectedId(d.id)}
                      className="grid w-full grid-cols-[64px_1fr_auto] items-center gap-3 rounded-[6px] px-3 py-2.5 text-left transition-colors"
                      style={{ background: on ? C.greenSoft : undefined, boxShadow: `inset 3px 0 0 ${GROUP_STYLE[KIND_GROUP[d.kind]].bar}`, opacity: past && !on ? 0.55 : 1 }}
                    >
                      <span className="tabular-nums">
                        <span className="block font-bold">{d.due.getDate()}일</span>
                        {d.shifted && (
                          <span className="block text-[13px] font-semibold" style={{ color: C.red }}>
                            {d.real.getMonth() + 1}/{d.real.getDate()}로
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 font-semibold leading-[1.4]">{d.title}</span>
                      <span className="text-[13px] tabular-nums" style={{ color: C.muted }}>
                        {past ? "지남" : DAY_NAMES[d.real.getDay()] + "요일"}
                      </span>
                    </button>
                  </li>
                );
              })}
          </ul>
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
                    <p className="text-[14px] font-semibold" style={{ color: C.muted }}>
                      {GROUP_STYLE[KIND_GROUP[selected.kind]].label}
                    </p>
                    <h2 className="text-[22px] font-bold leading-[1.35] tracking-[-0.02em]">{selected.title}</h2>
                  </div>
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
                        {md(selected.real)} ({selected.shifted}이라 다음 영업일로 연기)
                      </dd>
                    </>
                  )}
                </dl>
                <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
                  {KIND_INFO[selected.kind].about}
                </p>
                <h3 className="mt-4 font-bold">
                  준비 서류
                </h3>
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
                      memo: `${selected.title} (${md(selected.real)}까지) 신고 대리를 맡기고 싶습니다.`,
                    })
                  }
                  className="mt-4 inline-flex h-11 items-center rounded-[6px] px-4 text-[15px] font-semibold"
                  style={{ background: C.green, color: "#fff" }}
                >
                  신고 대리 상담신청
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-[14px]" style={{ color: C.muted }}>
          실제 일정은 국세청 공지를 따릅니다. 설, 추석 등 음력 공휴일은 반영하지 않았습니다.
        </p>
      </div>
    </div>
  );
}

/* ---------- 요금안내 ---------- */

/** 매출 구간 x 개인·법인 요금표. 칸을 누르면 그 조건이 선택된다. */
function FeeGrid({ fee, setFee, compact = false }: { fee: FeePick; setFee: (f: FeePick) => void; compact?: boolean }) {
  const cell = (band: number, corp: boolean) => {
    const on = fee.band === band && fee.corp === corp;
    const v = monthlyFee(band, corp);
    return (
      <td className="p-0">
        <button
          type="button"
          aria-pressed={on}
          onClick={() => setFee({ ...fee, band, corp })}
          aria-label={`${corp ? "법인" : "개인"} ${BANDS[band].label}, 월 ${comma(v)}원`}
          className={`w-full px-2 text-right tabular-nums underline-offset-4 hover:underline ${compact ? "h-10 text-[15px]" : "h-11 text-[16px]"} ${on ? "font-bold underline" : ""}`}
          style={{ color: on ? C.green : C.ink }}
        >
          {compact ? `${v / 10_000}만` : `${comma(v)}원`}
        </button>
      </td>
    );
  };
  return (
    <table className="w-full border-collapse text-[15px]">
      <caption className="sr-only">연 매출 구간별 월 기장료 (부가세 별도)</caption>
      <thead>
        <tr className="text-[14px]" style={{ color: C.muted }}>
          <th scope="col" className="pb-1.5 text-left font-semibold">
            연 매출
          </th>
          <th scope="col" className="pb-1.5 pr-2 text-right font-semibold">
            개인
          </th>
          <th scope="col" className="pb-1.5 pr-2 text-right font-semibold">
            법인
          </th>
          {!compact && (
            <>
              <th scope="col" className="hidden pb-1.5 pr-2 text-right font-semibold sm:table-cell">
                조정료 개인
              </th>
              <th scope="col" className="hidden pb-1.5 pr-2 text-right font-semibold sm:table-cell">
                조정료 법인
              </th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {BANDS.map((b, i) => (
          <tr key={b.label} className="border-t" style={{ borderColor: C.line, background: fee.band === i ? C.greenSoft : undefined }}>
            <th scope="row" className="py-0.5 pl-1 pr-2 text-left font-normal tabular-nums" style={{ color: fee.band === i ? C.ink : C.muted, fontWeight: fee.band === i ? 700 : 400 }}>
              {compact ? b.short : b.label}
            </th>
            {cell(i, false)}
            {cell(i, true)}
            {!compact && (
              <>
                <td className="hidden pr-2 text-right tabular-nums sm:table-cell" style={{ color: C.muted }}>
                  {comma(adjustFee(i, false))}원
                </td>
                <td className="hidden pr-2 text-right tabular-nums sm:table-cell" style={{ color: C.muted }}>
                  {comma(adjustFee(i, true))}원
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FeeTable({ fee, setFee, onAsk }: { fee: FeePick; setFee: (f: FeePick) => void; onAsk: AskFn }) {
  const base = monthlyFee(fee.band, fee.corp);
  const sFee = staffFee(fee.staff);
  const total = base + sFee;
  const adjust = adjustFee(fee.band, fee.corp);
  const rows = [
    { k: `기장료 (${fee.corp ? "법인" : "개인"}, ${BANDS[fee.band].label})`, v: base },
    { k: `인건비 신고 (직원 ${fee.staff}명)`, v: sFee },
  ];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0 rounded-[10px] border bg-white p-4 md:p-6" style={{ borderColor: C.line }}>
        <h2 className="text-[20px] font-bold tracking-[-0.02em]">세무기장대행, 결산세무조정료</h2>
        <div className="mt-4">
          <FeeGrid fee={fee} setFee={setFee} />
        </div>
        <ul className="mt-4 space-y-1 text-[14px]" style={{ color: C.muted }}>
          <li>부가세 신고와 원천세 신고는 기장료에 들어 있습니다.</li>
          <li>종합소득세나 법인세 신고 때 1년에 한 번 조정료가 따로 붙습니다.</li>
          <li>신규사업자는 첫 3개월 기장료를 받지 않습니다. 모든 금액은 부가세 별도입니다.</li>
        </ul>
      </div>

      <div className="rounded-[10px] border bg-white p-5 md:p-6 lg:sticky lg:top-20" style={{ borderColor: C.line }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[15px] font-bold" id="fee-people-label">
            직원 수 (대표자 제외)
          </p>
          <div className="flex items-center gap-1" role="group" aria-labelledby="fee-people-label">
            <button type="button" aria-label="직원 한 명 빼기" onClick={() => setFee({ ...fee, staff: Math.max(0, fee.staff - 1) })} className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] border" style={{ borderColor: C.line }}>
              <Minus size={18} aria-hidden />
            </button>
            <span className="w-14 text-center text-[20px] font-bold tabular-nums" aria-live="polite">
              {fee.staff}명
            </span>
            <button type="button" aria-label="직원 한 명 더하기" onClick={() => setFee({ ...fee, staff: Math.min(50, fee.staff + 1) })} className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] border" style={{ borderColor: C.line }}>
              <Plus size={18} aria-hidden />
            </button>
          </div>
        </div>
        <div aria-live="polite">
          <p className="mt-5 text-[15px] font-bold" style={{ color: C.muted }}>
            월 합계
          </p>
          <p className="mt-1 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] tabular-nums">{comma(total)}원~</p>
          <table className="mt-4 w-full text-[15px] tabular-nums">
            <caption className="sr-only">월 기장료 내역</caption>
            <tbody>
              {rows.map((r) => (
                <tr key={r.k} className="border-t" style={{ borderColor: C.line }}>
                  <th scope="row" className="py-2.5 pr-3 text-left font-normal" style={{ color: C.muted }}>
                    {r.k}
                  </th>
                  <td className="py-2.5 text-right">{comma(r.v)}원</td>
                </tr>
              ))}
              <tr className="border-t-2" style={{ borderColor: C.ink }}>
                <th scope="row" className="py-2.5 text-left font-bold">
                  조정료 (연 1회)
                </th>
                <td className="py-2.5 text-right font-bold">{comma(adjust)}원~</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={() =>
            onAsk({
              topics: ["신규 기장"],
              biz: fee.corp ? "법인" : "",
              memo: `${fee.corp ? "법인" : "개인사업자"}, 작년 매출 ${BANDS[fee.band].label}, 직원 ${fee.staff}명. 요금표 기준 월 ${comma(total)}원부터`,
            })
          }
          className="mt-5 h-12 w-full rounded-[6px] text-[16px] font-bold"
          style={{ background: C.green, color: "#fff" }}
        >
          기장 상담 신청
        </button>
        <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
          거래 건수와 장부 상태에 따라 달라질 수 있습니다.
        </p>
      </div>
    </div>
  );
}

/* ---------- 세무자료실 ---------- */

function Board({ board, setBoard, postId, setPostId }: { board: BoardId; setBoard: (b: BoardId) => void; postId: number | null; setPostId: (id: number | null) => void }) {
  const [query, setQuery] = useState("");
  const q = query.trim();
  const list = POSTS.filter((p) => p.board === board && (!q || p.title.includes(q) || p.body.includes(q)));
  const post = POSTS.find((p) => p.id === postId && p.board === board) ?? null;
  const inBoard = POSTS.filter((p) => p.board === board);
  const total = q ? list.length : BOARD_TOTAL[board];
  const pages = Math.ceil(total / 10);
  const numOf = (p: Post) => BOARD_TOTAL[board] - inBoard.indexOf(p);

  return (
    <div className="grid items-start gap-6 md:grid-cols-[200px_1fr]">
      <nav aria-label="세무자료실 메뉴">
        <ul className="flex gap-1 overflow-x-auto md:flex-col md:rounded-[10px] md:border md:bg-white md:p-2" style={{ borderColor: C.line }}>
          {BOARDS.map((b) => {
            const on = board === b.id;
            return (
              <li key={b.id} className="shrink-0">
                <button
                  type="button"
                  aria-current={on ? "page" : undefined}
                  onClick={() => setBoard(b.id)}
                  className="flex h-11 w-full items-center justify-between rounded-[6px] px-3 text-left text-[15px] font-semibold"
                  style={on ? { background: C.green, color: "#fff" } : { background: "#fff", border: `1px solid ${C.line}` }}
                >
                  {b.label}
                  <ChevronRight size={16} className="hidden md:block" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0">
        {post ? (
          <article aria-labelledby="post-title" className="rounded-[10px] border bg-white" style={{ borderColor: C.line }}>
            <div className="border-b px-5 py-4 md:px-7" style={{ borderColor: C.ink }}>
              <p className="text-[14px] font-semibold" style={{ color: C.green }}>
                {post.cat}
              </p>
              <h2 id="post-title" className="text-[21px] font-bold leading-[1.45] tracking-[-0.02em]">
                {post.title}
              </h2>
              <p className="mt-1 text-[14px] tabular-nums" style={{ color: C.muted }}>
                {post.date} · {OFFICE}
              </p>
            </div>
            <p className="px-5 py-6 md:px-7">{post.body}</p>
            <div className="border-t px-5 py-3 md:px-7" style={{ borderColor: C.line }}>
              <button type="button" onClick={() => setPostId(null)} className="inline-flex h-10 items-center gap-1.5 rounded-[6px] border px-4 text-[15px] font-semibold" style={{ borderColor: C.line }}>
                <List size={16} aria-hidden />
                목록
              </button>
            </div>
          </article>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[15px] tabular-nums" style={{ color: C.muted }}>
                전체 <span className="font-bold" style={{ color: C.ink }}>{total}</span>건
              </p>
              <label className="relative block w-full sm:w-[280px]">
                <span className="sr-only">게시글 검색</span>
                <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="제목, 내용"
                  className="h-11 w-full rounded-[6px] border bg-white pl-10 pr-3 outline-none focus:border-[#1f5c45]"
                  style={{ borderColor: C.line }}
                />
              </label>
            </div>
            <table className="mt-3 w-full border-t-2 text-[15px]" style={{ borderColor: C.ink }}>
              <caption className="sr-only">{BOARDS.find((b) => b.id === board)?.label} 목록</caption>
              <thead className="hidden sm:table-header-group">
                <tr className="border-b text-[14px]" style={{ borderColor: C.line, color: C.muted }}>
                  <th scope="col" className="w-[64px] py-2.5 font-semibold">
                    번호
                  </th>
                  <th scope="col" className="w-[90px] py-2.5 font-semibold">
                    분류
                  </th>
                  <th scope="col" className="py-2.5 text-left font-semibold">
                    제목
                  </th>
                  <th scope="col" className="w-[110px] py-2.5 font-semibold">
                    등록일
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-b" style={{ borderColor: C.line }}>
                    <td className="hidden py-3 text-center tabular-nums sm:table-cell" style={{ color: C.muted }}>
                      {numOf(p)}
                    </td>
                    <td className="hidden py-3 text-center text-[14px] sm:table-cell" style={{ color: C.green }}>
                      {p.cat}
                    </td>
                    <td className="py-1">
                      <button type="button" onClick={() => setPostId(p.id)} className="block w-full py-2 text-left font-semibold leading-[1.45] hover:underline">
                        {p.title}
                        <span className="block text-[13px] font-normal tabular-nums sm:hidden" style={{ color: C.muted }}>
                          {p.cat} · {p.date}
                        </span>
                      </button>
                    </td>
                    <td className="hidden py-3 text-center text-[14px] tabular-nums sm:table-cell" style={{ color: C.muted }}>
                      {p.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && (
              <p className="py-10 text-center" style={{ color: C.muted }}>
                검색 결과가 없습니다.
              </p>
            )}
            {pages > 1 && (
              <p className="mt-6 flex justify-center gap-1 text-[15px] tabular-nums" aria-label="쪽 번호">
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => (
                  <span
                    key={i}
                    aria-current={i === 0 ? "page" : undefined}
                    className="inline-flex h-9 min-w-9 items-center justify-center rounded-[4px] px-1"
                    style={i === 0 ? { background: C.ink, color: "#fff", fontWeight: 700 } : { color: C.muted }}
                  >
                    {i + 1}
                  </span>
                ))}
                {pages > 5 && (
                  <span className="inline-flex h-9 items-center px-1" style={{ color: C.muted }}>
                    ... {pages}
                  </span>
                )}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- 사무소 소개 ---------- */

function About() {
  return (
    <div className="space-y-12">
      <section aria-labelledby="greet-title" className="grid items-start gap-6 md:grid-cols-[1fr_1fr] md:gap-10">
        <div>
          <h2 id="greet-title" className="text-[22px] font-bold tracking-[-0.02em]">
            세무사 인사말
          </h2>
          <div className="mt-4 space-y-3" style={{ color: C.muted }}>
            <p>{OFFICE}는 개인사업자와 소규모 법인의 장부와 신고를 맡는 사무소입니다.</p>
            <p>음식점과 소매점 장부를 가장 많이 봅니다. 맡은 장부는 세무사가 직접 보고, 신고서를 내기 전에 숫자를 사장님과 전화로 한 번 더 맞춰 봅니다.</p>
            <p>상담실은 문이 닫히는 별도 방입니다. 상담 내용은 세무사법에 따라 비밀이 지켜집니다.</p>
          </div>
          <p className="mt-5 font-bold">대표세무사 김ㅅ우</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[10px]">
          <Image src={`${IMG}/office.jpg`} alt="책상과 의자 네 개가 놓인 작은 상담실" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section aria-labelledby="member-title">
        <h2 id="member-title" className="text-[22px] font-bold tracking-[-0.02em]">
          구성원 소개
        </h2>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { name: "김ㅅ우", role: "대표세무사", area: "개인사업자 기장, 종합소득세, 세무조사대응", career: ["세무사 등록 2012년", "△△세무서 개인납세과 8년", "△△구 소상공인지원센터 세무 상담 위원"] },
            { name: "이ㄷ현", role: "세무사", area: "법인 신고, 법인전환, 양도소득세", career: ["세무사 등록 2017년", "△△회계법인 세무본부"] },
            { name: "박ㅇ진", role: "실장", area: "기장, 4대보험, 인건비 신고", career: ["전산세무 1급", "세무사무소 실무 11년"] },
          ].map((m) => (
            <li key={m.name} className="rounded-[10px] border bg-white p-5" style={{ borderColor: C.line }}>
              <p className="text-[14px] font-semibold" style={{ color: C.green }}>
                {m.role}
              </p>
              <p className="text-[21px] font-bold tracking-[-0.02em]">{m.name}</p>
              <p className="mt-2 text-[15px]">{m.area}</p>
              <ul className="mt-3 space-y-1 border-t pt-3 text-[14px]" style={{ borderColor: C.line, color: C.muted }}>
                {m.career.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ---------- 업무분야 ---------- */

function Services({ onAsk }: { onAsk: AskFn }) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-[10px] border md:grid-cols-2" style={{ borderColor: C.line, background: C.line }}>
      {SERVICES.map((s) => (
        <li key={s.name} className="flex flex-col bg-white p-5 md:p-6">
          <h2 className="text-[19px] font-bold tracking-[-0.02em]">{s.name}</h2>
          <p className="mt-1.5 flex-1 text-[15px]" style={{ color: C.muted }}>
            {s.desc}
          </p>
          <button
            type="button"
            onClick={() => onAsk({ topics: [s.topic], biz: "", memo: `${s.name} 상담을 원합니다.` })}
            className="mt-3 inline-flex h-10 w-fit items-center gap-1 text-[15px] font-semibold"
            style={{ color: C.green }}
          >
            상담신청
            <ChevronRight size={16} aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}

/* ---------- 오시는 길 ---------- */

function Location() {
  return (
    <div className="grid items-start gap-6 md:grid-cols-[1.2fr_1fr]">
      <div className="overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: C.line }}>
        <svg viewBox="0 0 600 380" className="h-auto w-full" role="img" aria-label="□□역 3번 출구에서 △△은행 옆 □□빌딩까지의 약도">
          <rect width="600" height="380" fill="#f3f1ea" />
          <rect x="0" y="170" width="600" height="44" fill="#fff" />
          <rect x="250" y="0" width="36" height="380" fill="#fff" />
          <rect x="40" y="40" width="180" height="104" rx="4" fill="#e6e2d6" />
          <rect x="316" y="40" width="110" height="104" rx="4" fill="#e6e2d6" />
          <rect x="40" y="240" width="180" height="104" rx="4" fill="#e6e2d6" />
          <rect x="316" y="240" width="110" height="104" rx="4" fill="#e6e2d6" />
          <rect x="440" y="240" width="130" height="104" rx="4" fill={C.green} />
          <text x="505" y="290" fontSize="15" fill="#fff" textAnchor="middle" fontWeight={700}>
            □□빌딩
          </text>
          <text x="505" y="312" fontSize="13" fill="#e5eee9" textAnchor="middle">
            5층
          </text>
          <text x="371" y="296" fontSize="13" fill={C.muted} textAnchor="middle">
            △△은행
          </text>
          <rect x="300" y="146" width="44" height="22" rx="11" fill={C.ink} />
          <text x="322" y="162" fontSize="12" fill="#fff" textAnchor="middle" fontWeight={700}>
            3번
          </text>
          <text x="130" y="198" fontSize="14" fill={C.muted} textAnchor="middle">
            □□로
          </text>
          <path d="M322 168 V226 H505 V240" stroke={C.red} strokeWidth="3" strokeDasharray="6 5" fill="none" />
          <text x="130" y="96" fontSize="14" fill={C.muted} textAnchor="middle">
            □□역
          </text>
        </svg>
      </div>
      <dl className="rounded-[10px] border bg-white text-[15px]" style={{ borderColor: C.line }}>
        {[
          ["주소", ADDRESS],
          ["지하철", "□□역 3번 출구, △△은행 옆 건물 (도보 2분)"],
          ["주차", "건물 지하 주차장, 상담 고객 1시간 무료"],
          ["상담 시간", "평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00), 1월과 5월은 토요일 10:00 ~ 15:00"],
          ["전화", TEL],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[84px_1fr] gap-3 border-b px-5 py-3.5 last:border-b-0" style={{ borderColor: C.line }}>
            <dt className="font-bold">{k}</dt>
            <dd className="tabular-nums" style={{ color: C.muted }}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ---------- 상담신청 ---------- */

const TOPICS = ["신규 기장", "세무대리인 변경", "부가세", "종합소득세", "법인세", "원천세·인건비", "양도·상속·증여", "법인전환", "세무조사대응"];
const TIMES = ["오전 9시 ~ 12시", "오후 1시 ~ 6시", "문자로 먼저 연락"];

function Contact({ prefill, minute }: { prefill: Prefill; minute: number }) {
  return (
    <div className="grid items-start gap-10 lg:grid-cols-[1.25fr_1fr]">
      <div>
        <p style={{ color: C.muted }}>첫 상담 30분은 비용을 받지 않습니다. 남겨 주신 시간에 세무사가 직접 전화드립니다.</p>
        <ContactForm key={prefill.key} prefill={prefill} />
      </div>
      <Faq minute={minute} />
    </div>
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
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ no: string; name: string; phone: string; time: string; topics: string[] } | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topics.length === 0) return setError("상담 분야를 하나 이상 선택해 주세요.");
    if (name.trim().length < 2) return setError("이름을 입력해 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setError("휴대전화 번호를 입력해 주세요.");
    if (!biz) return setError("사업자 형태를 선택해 주세요.");
    if (!time) return setError("통화 가능 시간을 선택해 주세요.");
    if (!agree) return setError("개인정보 수집·이용에 동의해 주세요.");
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
    setAgree(false);
  };

  return (
    <div className="mt-5" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="rounded-[10px] border bg-white p-6 md:p-8"
            style={{ borderColor: C.line }}
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full" style={{ background: C.green, color: "#fff" }}>
              <Check size={22} aria-hidden />
            </span>
            <p className="mt-4 text-[22px] font-bold tracking-[-0.02em]">{done.name}님, 상담신청이 접수되었습니다</p>
            <dl className="mt-5 divide-y border-y text-[15px]" style={{ borderColor: C.line }}>
              {[
                ["접수 번호", done.no],
                ["상담 분야", done.topics.join(", ")],
                ["연락처", done.phone],
                ["통화 시간", done.time],
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
              {done.time === "문자로 먼저 연락" ? "오늘 안에 문자로 통화 가능한 시간을 여쭙겠습니다." : "선택하신 시간에 세무사가 직접 전화드립니다."} 급하시면 {TEL}로 접수 번호를 말씀해 주세요.
            </p>
            <button type="button" onClick={reset} className="mt-5 inline-flex h-10 items-center gap-1.5 text-[15px] font-semibold" style={{ color: C.green }}>
              <RotateCcw size={16} aria-hidden />
              새로 작성
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" exit={{ opacity: 0 }} onSubmit={submit} noValidate className="grid gap-6 rounded-[10px] border bg-white p-5 md:grid-cols-2 md:gap-x-6 md:p-7" style={{ borderColor: C.line }}>
            <fieldset className="md:col-span-2">
              <legend className="text-[15px] font-bold">상담 분야 (복수 선택)</legend>
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
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputCls} style={{ borderColor: C.line }} />
            </label>
            <label className="block">
              <span className="text-[15px] font-bold">휴대전화</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={`${inputCls} tabular-nums`} style={{ borderColor: C.line }} />
            </label>
            <fieldset>
              <legend className="text-[15px] font-bold">사업자 형태</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {BIZ_CHOICES.map((b) => (
                  <Pill key={b} on={biz === b} onClick={() => setBiz(b)}>
                    {b}
                  </Pill>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-[15px] font-bold">통화 가능 시간</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {TIMES.map((t) => (
                  <Pill key={t} on={time === t} onClick={() => setTime(t)}>
                    {t}
                  </Pill>
                ))}
              </div>
            </fieldset>
            <label className="block md:col-span-2">
              <span className="text-[15px] font-bold">문의 내용 (선택)</span>
              <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} className="mt-1.5 w-full rounded-[6px] border px-3 py-2.5 outline-none focus:border-[#1f5c45]" style={{ borderColor: C.line }} />
            </label>
            <label className="flex min-h-11 cursor-pointer items-start gap-2.5 text-[15px] leading-[1.5] md:col-span-2">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#1f5c45]" />
              <span>
                개인정보 수집·이용 동의 (필수)
                <span className="block text-[14px]" style={{ color: C.muted }}>
                  이름, 휴대전화를 상담 연락에만 쓰고 상담이 끝나면 1년 안에 파기합니다.
                </span>
              </span>
            </label>
            <div className="md:col-span-2">
              {error && (
                <p className="mb-3 text-[15px] font-semibold" style={{ color: C.red }} role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="h-12 w-full rounded-[6px] text-[17px] font-bold md:w-auto md:px-10" style={{ background: C.green, color: "#fff" }}>
                상담신청
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

/* ---------- 자주 묻는 질문 ---------- */

// 답 끝에 다는 기한은 세무일정과 같은 계산(buildYear)에서 가져온다.
const FAQ_PROFILE: Profile = { type: "general", staff: true, half: false, freelancePay: true, sincere: false };

const FAQS: { q: string; a: string; kinds: Kind[] }[] = [
  {
    q: "부가세 고지서가 왔는데 신고도 따로 해야 하나요?",
    a: "개인 일반과세자는 고지서 금액만 내면 됩니다. 매출이 직전 기의 3분의 1 아래로 줄었다면 예정신고로 바꿔 덜 낼 수 있습니다.",
    kinds: ["vatPrepay"],
  },
  {
    q: "프리랜서에게 3.3%를 떼고 줬습니다. 따로 낼 서류가 있나요?",
    a: "다음 달 10일까지 원천세를 신고하고, 말일까지 간이지급명세서를 냅니다. 기장을 맡기셨다면 지급 내역만 보내 주시면 됩니다.",
    kinds: ["withhold", "simpleStatement"],
  },
  {
    q: "기존에 다른 세무사와 거래 중인데 변경이 번거롭지 않나요?",
    a: "이전 사무소에 자료 인계를 요청하는 일은 저희가 합니다. 홈택스 수임 동의만 해 주시면 됩니다.",
    kinds: [],
  },
  {
    q: "상담만 받아도 비용이 발생하나요?",
    a: "첫 상담 30분은 비용을 받지 않습니다. 신고서 검토처럼 자료를 직접 봐야 하는 경우에는 미리 금액을 알려 드립니다.",
    kinds: [],
  },
];

function nextOf(kind: Kind, today: Date) {
  const y = today.getFullYear();
  return [...buildYear(y, FAQ_PROFILE), ...buildYear(y + 1, FAQ_PROFILE)]
    .filter((d) => d.kind === kind && d.real >= today)
    .sort((a, b) => a.real.getTime() - b.real.getTime())[0];
}

function Faq({ minute }: { minute: number }) {
  const today = todayOf(minute);
  return (
    <section aria-labelledby="faq-title">
      <h2 id="faq-title" className="text-[22px] font-bold tracking-[-0.02em]">
        자주 묻는 질문
      </h2>
      <ul className="mt-4 border-t-2" style={{ borderColor: C.ink }}>
        {FAQS.map((f) => {
          const dues = today ? f.kinds.map((k) => nextOf(k, today)).filter((d): d is Deadline => !!d) : [];
          return (
            <li key={f.q} className="border-b py-5" style={{ borderColor: C.line }}>
              <h3 className="font-bold leading-[1.5]">{f.q}</h3>
              <p className="mt-1.5 text-[15px]" style={{ color: C.muted }}>
                {f.a}
              </p>
              {dues.length > 0 && (
                <p className="mt-1.5 text-[14px] tabular-nums" style={{ color: C.green }}>
                  {dues.map((d) => `${d.title} ${md(d.real)}까지`).join(", ")}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-4 pb-24 pt-12 md:px-6" style={{ background: C.greenDeep, color: "#e5eee9" }}>
      <div className="mx-auto max-w-[1200px]">
        <Logo light />
        <div className="mt-6 space-y-1 text-[15px]">
          <p>
            {ADDRESS} (□□역 3번 출구, △△은행 옆), 건물 지하 주차 1시간 무료
          </p>
          <p className="tabular-nums">상담 시간 평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00), 1월과 5월은 토요일 10:00 ~ 15:00</p>
        </div>
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: "#a9c4b8" }}>
          {[
            ["상호", OFFICE],
            ["대표세무사", "김ㅅ우"],
            ["사업자등록번호", "000-00-00000"],
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
