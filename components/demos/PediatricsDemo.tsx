"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionTemplate, useScroll, useTransform, type MotionValue } from "framer-motion";
import {
  AlertCircle,
  Baby,
  CalendarDays,
  Car,
  Check,
  ClipboardCheck,
  Clock,
  MapPin,
  MessageCircle,
  Moon,
  Phone,
  RotateCw,
  Stethoscope,
  Syringe,
  Users,
} from "lucide-react";
import { Jua } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtDot, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 소아청소년과 홈페이지 샘플: 가상의 곰파트너소아청소년과의원.
   병원명, 의료진, 주소, 전화번호, 진료비는 모두 가상이다. 의료법 광고 규칙에 맞춰 치료 효과, 후기, 할인 문구는 넣지 않는다.

   국내 동네 소아청소년과 사이트 공통 구성(참고): 메뉴는 병원소개, 진료안내(진료시간, 의료진), 진료과목, 예방접종,
   영유아검진, 비급여 진료비 안내, 오시는 길. 첫 화면에는 진료시간(점심시간, 토요일, 야간진료 요일)과 모바일 접수,
   실시간 대기 현황을 크게 둔다. 관용 문구는 "접수 마감은 진료 종료 30분 전", "일요일, 공휴일 휴진",
   "국가예방접종", "영유아 건강검진 지정 의료기관", "주차 가능".

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 실시간 대기와 진료 접수: 대기 인원(일정 간격으로 바뀜, 새로고침 가능), 오늘 접수 마감 시각과 남은 시간,
      아이 이름과 보호자 휴대폰으로 접수하면 접수 번호, 대기 순번, 호출 예정 시각을 보여 준다. 포스터 숫자와 같은 상태다.
   2. 예방접종 일정 계산: 아이 생년월일을 넣으면 국가예방접종 표준 일정 일부로 다음 접종 이름과 날짜, 남은 날을 보여 준다.
   3. 영유아 건강검진 시기: 같은 생년월일로 1차~8차 검진 기간을 날짜로 바꿔 지금 받을 차수를 표시한다. 차수를 누르면 내용.
   4. 진료 시간표: 요일별 진료와 접수 마감, 오늘 요일과 야간진료 요일 강조.

   포스터 첫 화면(pd-poster): 해바라기 노랑 바탕에 큰 문장 "지금 대기 3명이에요" 하나만 둔다. 숫자는 대기 인원 상태와 연결된다.
   원목 블록(나뭇결, 모서리 하이라이트)이 하나씩 떨어져 탑으로 쌓이고 맨 위에 대기 숫자가 적힌 블록이 올라간다.
   등장은 CSS 키프레임이라 스크립트 없이도 탑이 완성되어 보인다. 스크롤하면 블록마다 다른 방향으로 기울며 탑이 무너진다.
   동작 줄이기면 쌓인 탑으로 고정하고 스크롤 무너짐도 없다. */

const juaF = { fontFamily: `${Jua.style.fontFamily}, sans-serif` } as const;

const BRAND = "곰파트너소아청소년과의원";
const TEL = "02-000-0000";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";
const KAKAO = "카카오톡 채널 곰파트너";

const C = {
  paper: "#fffbf0",
  paperDeep: "#fdf1cf",
  ink: "#1f2a22",
  green: "#2d6a3e",
  greenDeep: "#1f5a33",
  greenTint: "#e3efe2",
  sun: "#f6c33b",
  sunSoft: "#fbe4a0",
  wood: "#c8955a",
  muted: "#5b6459",
  line: "#e8dfc4",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 칩, 숫자, 표시 전환 */
const DUR = 0.35;
/** 블록 하나가 떨어지는 시간(ms). 착지 뒤 작게 한 번 튄다 */
const DROP_MS = 620;
/** 블록 사이 떨어지는 간격(ms). 6개라 마지막 착지는 약 1.6초 */
const DROP_GAP_MS = 190;
/** 포스터 스크롤 진행도 중 무너짐이 끝나는 지점 */
const EXIT_END = 0.62;
/** 대기 인원이 바뀌는 간격(ms) */
const WAIT_TICK_MS = 25000;
/** 한 명 진료에 드는 평균 분 */
const MIN_PER_CHILD = 8;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const hm = (min: number) => `${p2(Math.floor(min / 60))}:${p2(min % 60)}`;

/* ---------- 진료 시간 ---------- */

interface Hours {
  dow: number;
  label: string;
  /** 분 단위. closed면 휴진 */
  open?: number;
  close?: number;
  lunch?: boolean;
  night?: boolean;
}
const HOURS: Hours[] = [
  { dow: 1, label: "월", open: 540, close: 1140, lunch: true },
  { dow: 2, label: "화", open: 540, close: 1230, lunch: true, night: true },
  { dow: 3, label: "수", open: 540, close: 1140, lunch: true },
  { dow: 4, label: "목", open: 540, close: 1230, lunch: true, night: true },
  { dow: 5, label: "금", open: 540, close: 1140, lunch: true },
  { dow: 6, label: "토", open: 540, close: 780 },
  { dow: 0, label: "일" },
];
const LUNCH = [780, 840];
/** 접수 마감은 진료 종료 30분 전 */
const LAST_CALL = 30;
const hoursOf = (dow: number) => HOURS.find((h) => h.dow === dow) ?? HOURS[0];

type Status = "진료 중" | "점심시간" | "접수 마감" | "진료 전" | "진료 끝" | "휴진";
function statusAt(dow: number, min: number): Status {
  const h = hoursOf(dow);
  if (h.open === undefined || h.close === undefined) return "휴진";
  if (min < h.open) return "진료 전";
  if (min >= h.close) return "진료 끝";
  if (h.lunch && min >= LUNCH[0] && min < LUNCH[1]) return "점심시간";
  if (min >= h.close - LAST_CALL) return "접수 마감";
  return "진료 중";
}

/** 오늘 이후 첫 진료일 */
function nextOpenDay(today: Date) {
  let d = daysAgo(today, -1);
  while (hoursOf(d.getDay()).open === undefined) d = daysAgo(d, -1);
  return d;
}

/** 대기 인원 변화. 호출되고 새로 오고를 반복한다 */
const WAIT_STEPS = [3, 2, 3, 4, 3, 2];

/* ---------- 예방접종 (질병관리청 표준 일정 일부) ---------- */

interface Visit {
  /** 생후 개월. days가 있으면 일 단위 */
  m: number;
  days?: number;
  label: string;
  items: string[];
}
const VISITS: Visit[] = [
  { m: 0, days: 0, label: "출생 직후", items: ["B형간염 1차"] },
  { m: 0, days: 28, label: "생후 4주 이내", items: ["BCG(결핵)"] },
  { m: 1, label: "생후 1개월", items: ["B형간염 2차"] },
  { m: 2, label: "생후 2개월", items: ["DTaP 1차", "IPV 1차", "Hib 1차", "폐렴구균 1차", "로타바이러스 1차"] },
  { m: 4, label: "생후 4개월", items: ["DTaP 2차", "IPV 2차", "Hib 2차", "폐렴구균 2차", "로타바이러스 2차"] },
  { m: 6, label: "생후 6개월", items: ["DTaP 3차", "IPV 3차", "Hib 3차", "폐렴구균 3차", "로타바이러스 3차(5가)", "B형간염 3차", "인플루엔자(매년)"] },
  { m: 12, label: "생후 12~15개월", items: ["MMR 1차", "수두", "Hib 4차", "폐렴구균 4차"] },
  { m: 12, label: "생후 12~23개월", items: ["A형간염 1~2차", "일본뇌염 1~2차"] },
  { m: 15, label: "생후 15~18개월", items: ["DTaP 4차"] },
  { m: 24, label: "생후 24~35개월", items: ["일본뇌염 3차"] },
  { m: 48, label: "만 4~6세", items: ["DTaP 5차", "IPV 4차", "MMR 2차"] },
  { m: 72, label: "만 6세", items: ["일본뇌염 4차(불활성화)"] },
  { m: 132, label: "만 11~12세", items: ["Tdap 6차", "일본뇌염 5차(불활성화)", "HPV 1차(만 12세 여아)"] },
];

function addMonths(d: Date, m: number) {
  const y = d.getFullYear();
  const mo = d.getMonth() + m;
  const last = new Date(y, mo + 1, 0).getDate();
  return new Date(y, mo, Math.min(d.getDate(), last));
}
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const dayDiff = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86400000);
const parseDate = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
};
const visitDate = (birth: Date, v: Visit) => (v.days !== undefined ? addDays(birth, v.days) : addMonths(birth, v.m));

/* ---------- 영유아 건강검진 ---------- */

interface Checkup {
  n: number;
  /** [시작, 끝]. unit이 day면 일, 아니면 개월 */
  range: [number, number];
  unit?: "day";
  edu: string;
  dental?: boolean;
}
const CHECKUPS: Checkup[] = [
  { n: 1, range: [14, 35], unit: "day", edu: "영아 돌연사 예방, 수유, 안전한 잠자리" },
  { n: 2, range: [4, 6], edu: "이유식 시작, 수면, 안전사고 예방" },
  { n: 3, range: [9, 12], edu: "이유식, 안전사고 예방, 첫니 관리" },
  { n: 4, range: [18, 24], edu: "대소변 가리기, 전자미디어 노출, 영양", dental: true },
  { n: 5, range: [30, 36], edu: "정서와 사회성, 안전사고 예방, 영양", dental: true },
  { n: 6, range: [42, 48], edu: "개인위생, 정서와 사회성, 영양", dental: true },
  { n: 7, range: [54, 60], edu: "안전사고 예방, 취학 전 준비, 영양", dental: true },
  { n: 8, range: [66, 71], edu: "취학 전 준비, 시력, 영양" },
];
const checkupLabel = (c: Checkup) => (c.unit === "day" ? `생후 ${c.range[0]}~${c.range[1]}일` : `생후 ${c.range[0]}~${c.range[1]}개월`);
function checkupWindow(birth: Date, c: Checkup): [Date, Date] {
  if (c.unit === "day") return [addDays(birth, c.range[0]), addDays(birth, c.range[1])];
  return [addMonths(birth, c.range[0]), addDays(addMonths(birth, c.range[1] + 1), -1)];
}

/* ---------- 비급여 진료비 ---------- */

const FEES: { name: string; kind: string; price: number }[] = [
  { name: "인플루엔자 예방접종(만 14세 이상, 보호자)", kind: "예방접종", price: 40000 },
  { name: "수막구균 예방접종(MenACWY) 1회", kind: "예방접종", price: 150000 },
  { name: "사람유두종바이러스(9가) 1회", kind: "예방접종", price: 220000 },
  { name: "일반진단서", kind: "제증명", price: 20000 },
  { name: "영문진단서", kind: "제증명", price: 20000 },
  { name: "진료확인서", kind: "제증명", price: 3000 },
];

const DEPTS: { name: string; desc: string }[] = [
  { name: "소아청소년 일반진료", desc: "감기, 장염, 중이염, 열, 기침" },
  { name: "예방접종", desc: "국가예방접종, 인플루엔자" },
  { name: "영유아 건강검진", desc: "1차~8차, 발달 확인" },
  { name: "알레르기 검사", desc: "혈액 검사, 아토피 상담" },
  { name: "성장 상담", desc: "키, 몸무게 측정과 성장 곡선" },
];

/* ---------- 포스터 블록 ---------- */

type Kind = "maple" | "walnut" | "green" | "number";
interface BlockDef {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: Kind;
  /** 무너질 때 [가로 이동, 세로 이동, 회전] */
  fall: [number, number, number];
}
/** viewBox 600x860, 바닥은 y=800. 아래에서 위로 쌓는 순서 */
const BLOCKS: BlockDef[] = [
  { x: 96, y: 716, w: 352, h: 84, kind: "maple", fall: [-30, 40, -6] },
  { x: 128, y: 590, w: 126, h: 126, kind: "green", fall: [-170, 150, -38] },
  { x: 292, y: 590, w: 126, h: 126, kind: "walnut", fall: [150, 130, 30] },
  { x: 470, y: 736, w: 64, h: 64, kind: "maple", fall: [70, 20, 24] },
  { x: 150, y: 516, w: 268, h: 74, kind: "maple", fall: [-60, 250, -52] },
  { x: 210, y: 366, w: 150, h: 150, kind: "number", fall: [190, 380, 78] },
];
/** 블록 옆면과 윗면 깊이 */
const DX = 24;
const DY = -18;

const FACE: Record<Exclude<Kind, "number">, [string, string, string]> = {
  maple: ["url(#pd-maple-front)", "url(#pd-maple-top)", "url(#pd-maple-side)"],
  walnut: ["url(#pd-walnut-front)", "url(#pd-walnut-top)", "url(#pd-walnut-side)"],
  green: ["url(#pd-green-front)", "url(#pd-green-top)", "url(#pd-green-side)"],
};

/** 앞면 나뭇결. 블록 크기에 맞춰 늘린다 */
const grain = (w: number, h: number) => [
  `M0 ${h * 0.22} C${w * 0.3} ${h * 0.14} ${w * 0.62} ${h * 0.32} ${w} ${h * 0.24}`,
  `M0 ${h * 0.46} C${w * 0.22} ${h * 0.4} ${w * 0.5} ${h * 0.56} ${w} ${h * 0.47}`,
  `M0 ${h * 0.7} C${w * 0.34} ${h * 0.62} ${w * 0.66} ${h * 0.8} ${w} ${h * 0.72}`,
  `M${w * 0.06} ${h * 0.9} C${w * 0.4} ${h * 0.86} ${w * 0.7} ${h * 0.96} ${w * 0.94} ${h * 0.9}`,
];

const P = {
  bg: "#f6c33b",
  bgDeep: "#eeb21c",
  ink: "#22301f",
  green: "#1f5a33",
  sub: "#3d4a33",
};

export function PediatricsDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  /* 1. 대기 */
  const [step, setStep] = useState(0);
  const [mine, setMine] = useState<Receipt | null>(null);
  const [updated, setUpdated] = useState<number | null>(null);
  const [nowMin, setNowMin] = useState(630);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    };
    const f = requestAnimationFrame(() => {
      tick();
      setUpdated(new Date().getHours() * 60 + new Date().getMinutes());
    });
    const clock = window.setInterval(tick, 30000);
    const wait = window.setInterval(() => {
      setStep((s) => (s + 1) % WAIT_STEPS.length);
      setUpdated(new Date().getHours() * 60 + new Date().getMinutes());
    }, WAIT_TICK_MS);
    return () => {
      cancelAnimationFrame(f);
      window.clearInterval(clock);
      window.clearInterval(wait);
    };
  }, []);
  const wait = WAIT_STEPS[step] + (mine ? 1 : 0);
  const refresh = () => {
    setStep((s) => (s + 1) % WAIT_STEPS.length);
    setUpdated(nowMin);
  };

  /* 2, 3. 생년월일은 접종 계산과 검진 시기가 같이 쓴다 */
  const [birthStr, setBirthStr] = useState<string | null>(null);
  const birthInput = birthStr ?? fmtDash(daysAgo(today, 150));

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const h = hoursOf(today.getDay());
  const lastCall = h.close !== undefined ? h.close - LAST_CALL : null;

  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] hover:underline underline-offset-4 ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} wait={wait} lastCall={lastCall} onCta={() => go("pd-queue")} />

      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:px-6">
        <h2 className="inline-flex items-center gap-2 text-[22px] leading-none" style={juaF}>
          <BlockMark size={26} />
          {BRAND}
        </h2>
        <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center">
          {[
            ["pd-hours", "진료시간"],
            ["pd-queue", "실시간 대기"],
            ["pd-vaccine", "예방접종"],
            ["pd-checkup", "영유아검진"],
            ["pd-fees", "비급여 진료비"],
            ["pd-visit", "오시는 길"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.green }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* 대기와 진료시간 */}
      <div className="mx-auto grid max-w-[1200px] gap-5 px-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start md:gap-6 md:px-6">
        <QueuePanel reduce={reduce} today={today} nowMin={nowMin} wait={wait} base={WAIT_STEPS[step]} updated={updated} onRefresh={refresh} mine={mine} setMine={setMine} />
        <HoursPanel today={today} nowMin={nowMin} />
      </div>

      <VaccineSection reduce={reduce} today={today} birthInput={birthInput} setBirth={setBirthStr} />
      <CheckupSection reduce={reduce} today={today} birthInput={birthInput} />

      {/* 진료과목 */}
      <section aria-labelledby="pd-dept-title" className="mx-auto mt-16 max-w-[1200px] px-4 md:mt-20 md:px-6">
        <SectionTitle id="pd-dept-title" icon={<Stethoscope size={22} aria-hidden />} title="진료과목" />
        <ul className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
          {DEPTS.map((d) => (
            <li key={d.name} className="border-t-[3px] pt-3" style={{ borderColor: C.green }}>
              <p className="text-[17px] font-bold">{d.name}</p>
              <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                {d.desc}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* 비급여 진료비 */}
      <section id="pd-fees" aria-labelledby="pd-fees-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="pd-fees-title" icon={<ClipboardCheck size={22} aria-hidden />} title="비급여 진료비 안내" />
        <div className="mt-6 overflow-x-auto rounded-[6px] border" style={{ borderColor: C.line, background: "#fff" }}>
          <table className="w-full min-w-[340px] border-collapse text-left text-[15px]">
            <caption className="sr-only">비급여 진료비</caption>
            <thead>
              <tr style={{ background: C.paperDeep }}>
                <th scope="col" className="px-4 py-3 font-bold">
                  항목
                </th>
                <th scope="col" className="hidden px-4 py-3 font-bold sm:table-cell">
                  구분
                </th>
                <th scope="col" className="px-4 py-3 text-right font-bold">
                  비용
                </th>
              </tr>
            </thead>
            <tbody>
              {FEES.map((f) => (
                <tr key={f.name} className="border-t" style={{ borderColor: C.line }}>
                  <td className="px-4 py-3">{f.name}</td>
                  <td className="hidden px-4 py-3 sm:table-cell" style={{ color: C.muted }}>
                    {f.kind}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums">{won(f.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
          국가예방접종 대상 백신은 접종비가 없어요. 비용은 부가세 포함, 기준일 {fmtDot(daysAgo(today, 14))}.
        </p>
      </section>

      {/* 의료진과 오시는 길 */}
      <section id="pd-visit" aria-labelledby="pd-visit-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="pd-visit-title" icon={<MapPin size={22} aria-hidden />} title="의료진, 오시는 길" />
        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <ul className="grid content-start gap-3">
            {[
              ["대표원장", "김ㅎ늘"],
              ["원장", "박ㅅ윤"],
            ].map(([role, name]) => (
              <li key={name} className="flex items-center gap-4 rounded-[6px] border px-4 py-4" style={{ borderColor: C.line, background: "#fff" }}>
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: C.greenTint, color: C.greenDeep }}>
                  <Stethoscope size={22} aria-hidden />
                </span>
                <span>
                  <span className="block text-[18px] font-bold">
                    {role} {name}
                  </span>
                  <span className="block text-[15px]" style={{ color: C.muted }}>
                    소아청소년과 전문의
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <MiniMap />
            <dl className="grid content-start gap-3 text-[15px]">
              {[
                [<MapPin key="i" size={18} aria-hidden />, "주소", ADDRESS],
                [<Car key="i" size={18} aria-hidden />, "주차", "건물 지하 주차장, 진료 시 1시간 무료"],
                [<Baby key="i" size={18} aria-hidden />, "유모차", "엘리베이터로 바로 올라와요. 수유실 있음"],
                [<Phone key="i" size={18} aria-hidden />, "전화", TEL],
              ].map(([icon, k, v]) => (
                <div key={k as string} className="flex gap-3">
                  <dt className="inline-flex w-[76px] shrink-0 items-center gap-1.5 font-bold" style={{ color: C.greenDeep }}>
                    {icon}
                    {k}
                  </dt>
                  <dd>{v}</dd>
                </div>
              ))}
              <a
                href={`tel:${TEL.replace(/-/g, "")}`}
                data-gtm-cta="pediatrics_tel"
                className={`mt-2 inline-flex w-fit items-center gap-2 rounded-[6px] px-4 py-2.5 font-bold ${focusRing}`}
                style={{ background: C.green, color: "#fff", outlineColor: C.green }}
              >
                <Phone size={18} aria-hidden />
                전화 걸기
              </a>
            </dl>
          </div>
        </div>
      </section>

      <footer className="mt-20 px-4 py-10 md:px-6" style={{ background: C.greenDeep, color: "#f3f1e4" }}>
        <div className="mx-auto max-w-[1200px]">
          <p className="inline-flex items-center gap-2 text-[19px]" style={juaF}>
            <BlockMark size={22} />
            {BRAND}
          </p>
          <p className="mt-2 text-[15px] leading-[1.7]">
            {ADDRESS}, 전화 {TEL}
            <br />
            평일 09:00~19:00, 화, 목 야간 20:30까지, 토 09:00~13:00, 일요일 공휴일 휴진
          </p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

/* ---------- 공통 조각 ---------- */

function SectionTitle({ id, icon, title }: { id: string; icon: React.ReactNode; title: string }) {
  return (
    <h2 id={id} className="inline-flex items-center gap-2.5 text-[26px] leading-tight md:text-[30px]" style={{ ...juaF, color: C.ink }}>
      <span style={{ color: C.green }}>{icon}</span>
      {title}
    </h2>
  );
}

/** 작은 원목 블록 로고 */
function BlockMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M6 12 L12 6 L28 6 L22 12 Z" fill="#f3d39a" />
      <path d="M22 12 L28 6 L28 22 L22 28 Z" fill="#a8703c" />
      <rect x="6" y="12" width="16" height="16" rx="1.5" fill="#d9a865" />
      <rect x="9" y="15" width="10" height="10" rx="1" fill="none" stroke={C.green} strokeWidth="2" />
    </svg>
  );
}

/* ---------- 포스터 ---------- */

function Poster({ reduce, wait, lastCall, onCta }: { reduce: boolean; wait: number; lastCall: number | null; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 0 : Math.min(1, v / EXIT_END)));
  const textY = useTransform(p, (v) => `${-v * 40}svh`);
  const textO = useTransform(p, (v) => Math.max(0, 1 - Math.max(0, v - 0.3) / 0.6));
  // 무너질수록 바닥 그림자가 옆으로 퍼진다
  const shadowSx = useTransform(p, (v) => 1 + v * 0.6);
  const shadowO = useTransform(p, (v) => 1 - v * 0.5);
  const shadowT = useMotionTemplate`scale(${shadowSx}, 1)`;

  return (
    <section id="pd-poster" ref={ref} aria-labelledby="pd-poster-title" className="relative" style={{ height: reduce ? undefined : "180svh", background: P.bg }}>
      <style>{`
        @keyframes pd-drop {
          0% { transform: translateY(-1000px); animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45); }
          62% { transform: translateY(0); animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
          80% { transform: translateY(-16px); animation-timing-function: cubic-bezier(0.55, 0, 1, 0.45); }
          100% { transform: translateY(0); }
        }
        .pd-drop { animation: pd-drop ${DROP_MS}ms both; }
        .pd-still .pd-drop { animation: none; }
        @media (prefers-reduced-motion: reduce) { .pd-drop { animation: none; } }
      `}</style>
      <div
        className={`${reduce ? "pd-still relative min-h-svh" : "sticky top-0 h-svh"} overflow-hidden`}
        style={{ background: `radial-gradient(110% 80% at 72% 96%, #fbd664 0%, ${P.bg} 50%, ${P.bgDeep} 100%)`, color: P.ink }}
      >
        {/* 블록 탑 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[52svh] items-end justify-center md:inset-y-0 md:left-auto md:right-[2vw] md:h-full md:pb-[3svh]">
          <svg viewBox="50 290 560 560" className="h-auto w-full max-w-[440px] overflow-visible md:h-[86svh] md:w-auto md:max-w-none" role="img" aria-label={`원목 블록이 탑으로 쌓이고 맨 위에 숫자 ${wait}이 적힌 블록이 올라간 그림`}>
            <BlockDefs />
            <motion.ellipse cx="300" cy="812" rx="260" ry="26" fill="url(#pd-floor)" style={{ opacity: shadowO, transform: shadowT, transformBox: "fill-box", transformOrigin: "50% 50%" }} />
            {BLOCKS.map((b, i) => (
              <WoodBlock key={i} b={b} i={i} p={p} wait={wait} reduce={reduce} />
            ))}
          </svg>
        </div>

        {/* 로고와 핵심 행동 하나 */}
        <motion.div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4 md:px-12 md:pt-7" style={{ y: textY }}>
          <p className="inline-flex items-center gap-2 text-[17px] leading-none" style={juaF}>
            <BlockMark size={20} />
            {BRAND}
          </p>
          <button
            type="button"
            onClick={onCta}
            aria-label="진료 접수"
            title="진료 접수"
            data-gtm-cta="pediatrics_poster_cta"
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${focusRing}`}
            style={{ background: P.green, color: "#fff7dc", outlineColor: P.ink }}
          >
            <ClipboardCheck size={22} aria-hidden />
          </button>
        </motion.div>

        {/* 큰 문장 */}
        <motion.div className="relative z-[1] flex h-full flex-col px-4 pt-[14svh] md:justify-center md:px-12 md:pb-[8svh] md:pt-0" style={{ y: textY, opacity: textO }}>
          <h1 id="pd-poster-title" className="text-[clamp(56px,16.5vw,72px)] leading-[1.12] tracking-[-0.02em] md:text-[clamp(88px,9.6vw,176px)] md:leading-[1.06]" style={{ ...juaF, wordBreak: "keep-all" }}>
            <span className="block">지금 대기</span>
            <span className="block">
              <span className="relative inline-block tabular-nums" style={{ color: P.green }}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={wait}
                    className="inline-block"
                    initial={reduce ? false : { y: "-0.6em", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: "0.6em", opacity: 0 }}
                    transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
                  >
                    {wait}
                  </motion.span>
                </AnimatePresence>
              </span>
              명이에요
            </span>
          </h1>
          <p className="mt-5 text-[16px] md:mt-8 md:text-[19px]" style={{ color: P.sub }}>
            {lastCall !== null ? `오늘 접수 마감 ${hm(lastCall)}` : "일요일, 공휴일 휴진"}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function BlockDefs() {
  return (
    <defs>
      <linearGradient id="pd-maple-front" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f2d29c" />
        <stop offset="0.55" stopColor="#deb072" />
        <stop offset="1" stopColor="#c58f55" />
      </linearGradient>
      <linearGradient id="pd-maple-top" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#f6dcab" />
        <stop offset="1" stopColor="#fbecc8" />
      </linearGradient>
      <linearGradient id="pd-maple-side" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#b47c45" />
        <stop offset="1" stopColor="#8c5a2e" />
      </linearGradient>
      <linearGradient id="pd-walnut-front" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#a8703f" />
        <stop offset="0.6" stopColor="#8a562c" />
        <stop offset="1" stopColor="#6c4120" />
      </linearGradient>
      <linearGradient id="pd-walnut-top" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#bd8550" />
        <stop offset="1" stopColor="#d29c66" />
      </linearGradient>
      <linearGradient id="pd-walnut-side" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5e3819" />
        <stop offset="1" stopColor="#452812" />
      </linearGradient>
      <linearGradient id="pd-green-front" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#4c9a60" />
        <stop offset="0.6" stopColor="#2f7043" />
        <stop offset="1" stopColor="#225a33" />
      </linearGradient>
      <linearGradient id="pd-green-top" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#62ad74" />
        <stop offset="1" stopColor="#80c18e" />
      </linearGradient>
      <linearGradient id="pd-green-side" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1f5130" />
        <stop offset="1" stopColor="#163d23" />
      </linearGradient>
      <radialGradient id="pd-floor" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#5a3d07" stopOpacity="0.42" />
        <stop offset="1" stopColor="#5a3d07" stopOpacity="0" />
      </radialGradient>
      {/* 앞면 위쪽으로 빛이 닿는 느낌 */}
      <linearGradient id="pd-sheen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff8e6" stopOpacity="0.38" />
        <stop offset="0.35" stopColor="#fff8e6" stopOpacity="0" />
        <stop offset="1" stopColor="#3a2208" stopOpacity="0.14" />
      </linearGradient>
    </defs>
  );
}

const ease2 = (v: number) => v * v;

function WoodBlock({ b, i, p, wait, reduce }: { b: BlockDef; i: number; p: MotionValue<number>; wait: number; reduce: boolean }) {
  const x = useTransform(p, (v) => b.fall[0] * ease2(v));
  const y = useTransform(p, (v) => b.fall[1] * ease2(v));
  const rotate = useTransform(p, (v) => b.fall[2] * ease2(v));
  const faces = b.kind === "number" ? FACE.maple : FACE[b.kind];
  const lines = grain(b.w, b.h);
  const grainColor = b.kind === "green" ? "rgba(10,40,20,0.22)" : b.kind === "walnut" ? "rgba(40,20,6,0.35)" : "rgba(130,80,30,0.3)";
  return (
    <motion.g style={{ x, y, rotate, transformBox: "fill-box", transformOrigin: "50% 100%" }}>
      <g className="pd-drop" style={{ animationDelay: `${i * DROP_GAP_MS}ms` }}>
        <g transform={`translate(${b.x} ${b.y})`}>
          {/* 윗면, 옆면, 앞면 */}
          <path d={`M0 0 L${DX} ${DY} L${b.w + DX} ${DY} L${b.w} 0 Z`} fill={faces[1]} />
          <path d={`M${b.w} 0 L${b.w + DX} ${DY} L${b.w + DX} ${b.h + DY} L${b.w} ${b.h} Z`} fill={faces[2]} />
          <rect width={b.w} height={b.h} rx="3" fill={faces[0]} />
          {lines.map((d) => (
            <path key={d} d={d} fill="none" stroke={grainColor} strokeWidth="1.6" strokeLinecap="round" />
          ))}
          {b.kind !== "green" && b.w > 200 && <ellipse cx={b.w * 0.72} cy={b.h * 0.5} rx="9" ry="4" fill="none" stroke={grainColor} strokeWidth="1.6" />}
          <rect width={b.w} height={b.h} rx="3" fill="url(#pd-sheen)" />
          {/* 모서리 하이라이트 */}
          <path d={`M2 1.2 L${b.w - 2} 1.2`} stroke="rgba(255,250,236,0.9)" strokeWidth="2.4" strokeLinecap="round" />
          <path d={`M1.2 3 L1.2 ${b.h - 4}`} stroke="rgba(255,250,236,0.4)" strokeWidth="1.6" strokeLinecap="round" />
          <path d={`M${b.w + 1} 1 L${b.w + DX - 1} ${DY + 1}`} stroke="rgba(255,250,236,0.55)" strokeWidth="1.6" strokeLinecap="round" />
          {b.kind === "number" && (
            <>
              <rect x="14" y="14" width={b.w - 28} height={b.h - 28} rx="10" fill="none" stroke={P.green} strokeWidth="7" />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.text
                  key={wait}
                  x={b.w / 2}
                  y={b.h / 2 + 34}
                  textAnchor="middle"
                  fontSize="98"
                  fill={P.green}
                  style={juaF}
                  initial={reduce ? false : { opacity: 0, y: -24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: 24 }}
                  transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
                >
                  {wait}
                </motion.text>
              </AnimatePresence>
            </>
          )}
        </g>
      </g>
    </motion.g>
  );
}

/* ---------- 1. 실시간 대기와 진료 접수 ---------- */

interface Receipt {
  no: string;
  name: string;
  phone: string;
  type: string;
  order: number;
  at: number;
}
const TYPES = ["일반 진료", "예방접종", "영유아검진"] as const;

function QueuePanel({
  reduce,
  today,
  nowMin,
  wait,
  base,
  updated,
  onRefresh,
  mine,
  setMine,
}: {
  reduce: boolean;
  today: Date;
  nowMin: number;
  wait: number;
  base: number;
  updated: number | null;
  onRefresh: () => void;
  mine: Receipt | null;
  setMine: (r: Receipt | null) => void;
}) {
  const dow = today.getDay();
  const h = hoursOf(dow);
  const status = statusAt(dow, nowMin);
  const lastCall = h.close !== undefined ? h.close - LAST_CALL : null;
  const left = lastCall !== null ? lastCall - nowMin : 0;
  const open = status === "진료 중" || status === "점심시간" || status === "진료 전";
  const next = nextOpenDay(today);

  const [form, setForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("일반 진료");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setErr("아이 이름을 두 글자 이상 적어 주세요.");
    const d = phone.replace(/\D/g, "");
    if (d.length < 10 || d.length > 11) return setErr("보호자 휴대폰 번호를 확인해 주세요.");
    setErr(null);
    const order = base + 1;
    setMine({ no: `P${p2(today.getMonth() + 1)}${p2(today.getDate())}-0${20 + base * 3}`, name, phone, type, order, at: nowMin });
    setForm(false);
  };

  const callAt = mine ? Math.max(mine.at, h.open ?? 0) + Math.max(0, mine.order - 2) * MIN_PER_CHILD : 0;
  const input = `w-full rounded-[6px] border px-3 py-2.5 text-[16px] ${focusRing}`;

  return (
    <section id="pd-queue" aria-labelledby="pd-queue-title" className="scroll-mt-4 rounded-[10px] p-5 md:p-7" style={{ background: C.sun, color: C.ink }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 id="pd-queue-title" className="inline-flex items-center gap-2 text-[24px]" style={juaF}>
          <Users size={22} aria-hidden />
          실시간 대기
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: C.ink, color: C.sun }}>
          <Clock size={15} aria-hidden />
          {status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3" aria-live="polite">
        <p className="leading-none">
          <span className="text-[15px] font-bold">진료 대기</span>
          <span className="ml-2 text-[64px] tabular-nums md:text-[76px]" style={{ ...juaF, color: C.greenDeep }}>
            {wait}
          </span>
          <span className="ml-1 text-[22px]" style={juaF}>
            명
          </span>
        </p>
        <p className="pb-2 text-[15px]">
          예상 대기 약 {wait * MIN_PER_CHILD}분
          <br />
          {lastCall !== null ? (
            <>
              오늘 접수 마감 <b>{hm(lastCall)}</b>
              {open && left > 0 && <span> (마감까지 {left >= 60 ? `${Math.floor(left / 60)}시간 ${left % 60}분` : `${left}분`})</span>}
            </>
          ) : (
            "오늘은 휴진이에요"
          )}
        </p>
      </div>

      {/* 대기 블록. 한 칸이 한 명 */}
      <ol className="mt-4 flex min-h-[44px] flex-wrap items-end gap-1.5" aria-label={`대기 ${wait}명${mine ? `, 그중 ${mine.order}번째가 내 차례` : ""}`}>
        <AnimatePresence initial={false}>
          {Array.from({ length: wait }, (_, k) => {
            const isMine = mine !== null && k === wait - 1;
            return (
              <motion.li
                key={isMine ? "mine" : `w${k}`}
                layout={!reduce}
                initial={reduce ? false : { y: -28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { y: 12, opacity: 0 }}
                transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-[4px] px-2 text-[13px] font-bold"
                style={{
                  background: isMine ? C.greenDeep : "linear-gradient(135deg, #f2d29c, #c58f55)",
                  color: isMine ? "#fff" : "#5a3a17",
                  boxShadow: "inset 0 2px 0 rgba(255,250,236,0.7), inset -3px -3px 0 rgba(90,58,23,0.18)",
                }}
              >
                {isMine ? "내 차례" : k + 1}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]" style={{ color: "#3d3a22" }}>
        <span>{updated !== null ? `${hm(updated)} 기준` : "불러오는 중"}</span>
        <button type="button" onClick={onRefresh} className={`inline-flex items-center gap-1 rounded-[4px] px-1.5 py-1 font-bold underline underline-offset-4 ${focusRing}`} style={{ outlineColor: C.ink }}>
          <RotateCw size={14} aria-hidden />
          새로고침
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {mine ? (
          <motion.div
            key="done"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }}
            transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
            className="mt-5 rounded-[8px] p-4 md:p-5"
            style={{ background: "#fffaf0" }}
            role="status"
          >
            <p className="inline-flex items-center gap-2 text-[18px] font-bold" style={{ color: C.greenDeep }}>
              <Check size={20} aria-hidden />
              접수됐어요
            </p>
            <dl className="mt-3 grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[15px]">
              <dt style={{ color: C.muted }}>접수 번호</dt>
              <dd className="font-bold tabular-nums">{mine.no}</dd>
              <dt style={{ color: C.muted }}>아이</dt>
              <dd>
                {maskName(mine.name)}, {mine.type}
              </dd>
              <dt style={{ color: C.muted }}>대기 순번</dt>
              <dd>{mine.order}번째</dd>
              <dt style={{ color: C.muted }}>호출 예정</dt>
              <dd>
                {open ? `오늘 ${hm(Math.min(callAt, 1439))} 무렵, 두 명 전에 문자 드려요` : `${fmtKo(next)} 09:00 진료 시작 뒤 순서대로 문자 드려요`}
              </dd>
              <dt style={{ color: C.muted }}>문자 받을 번호</dt>
              <dd>{maskPhone(mine.phone)}</dd>
              <dt style={{ color: C.muted }}>문의</dt>
              <dd>
                데스크 {TEL}, {KAKAO}
              </dd>
            </dl>
            <button type="button" onClick={() => setMine(null)} className={`mt-4 rounded-[6px] border px-3 py-2 text-[14px] font-bold ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.green }}>
              접수 취소
            </button>
          </motion.div>
        ) : form ? (
          <motion.form
            key="form"
            onSubmit={submit}
            noValidate
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }}
            transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
            className="mt-5 grid gap-3 rounded-[8px] p-4 md:p-5"
            style={{ background: "#fffaf0" }}
          >
            <fieldset>
              <legend className="mb-2 text-[15px] font-bold">진료 구분</legend>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <label key={t} className="cursor-pointer">
                    <input type="radio" name="pd-type" value={t} checked={type === t} onChange={() => setType(t)} className="peer sr-only" />
                    <span
                      className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[15px] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2"
                      style={{ borderColor: type === t ? C.greenDeep : C.line, background: type === t ? C.greenDeep : "#fff", color: type === t ? "#fff" : C.ink, outlineColor: C.green }}
                    >
                      {type === t && <Check size={14} aria-hidden />}
                      {t}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-[15px] font-bold">
                아이 이름
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" className={input} style={{ borderColor: C.line, outlineColor: C.green, fontWeight: 400 }} />
              </label>
              <label className="grid gap-1 text-[15px] font-bold">
                보호자 휴대폰
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={input} style={{ borderColor: C.line, outlineColor: C.green, fontWeight: 400 }} />
              </label>
            </div>
            {err && (
              <p className="inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: C.error }} role="alert">
                <AlertCircle size={16} aria-hidden />
                {err}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="submit" data-gtm-cta="pediatrics_queue_submit" className={`rounded-[6px] px-5 py-2.5 text-[16px] font-bold ${focusRing}`} style={{ background: C.greenDeep, color: "#fff", outlineColor: C.green }}>
                접수하기
              </button>
              <button type="button" onClick={() => setForm(false)} className={`rounded-[6px] border px-4 py-2.5 text-[15px] ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.green }}>
                닫기
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div key="cta" initial={false} exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.12 } }} className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setForm(true)}
              data-gtm-cta="pediatrics_queue_open"
              className={`inline-flex items-center gap-2 rounded-[6px] px-5 py-3 text-[17px] font-bold ${focusRing}`}
              style={{ background: C.greenDeep, color: "#fff", outlineColor: C.ink }}
            >
              <ClipboardCheck size={20} aria-hidden />
              진료 접수
            </button>
            <span className="text-[14px]">접수 마감은 진료 종료 30분 전이에요</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------- 4. 진료 시간표 ---------- */

function HoursPanel({ today, nowMin }: { today: Date; nowMin: number }) {
  const dow = today.getDay();
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <section id="pd-hours" aria-labelledby="pd-hours-title" className="scroll-mt-4 rounded-[10px] border p-5 md:p-7" style={{ borderColor: C.line, background: "#fff" }}>
      <h2 id="pd-hours-title" className="inline-flex items-center gap-2 text-[24px]" style={juaF}>
        <Clock size={22} aria-hidden style={{ color: C.green }} />
        진료시간
      </h2>
      <table className="mt-4 w-full border-collapse text-[15px]">
        <caption className="sr-only">요일별 진료시간과 접수 마감</caption>
        <thead>
          <tr className="text-left" style={{ color: C.muted }}>
            <th scope="col" className="py-2 pr-2 font-normal">
              요일
            </th>
            <th scope="col" className="py-2 pr-2 font-normal">
              진료
            </th>
            <th scope="col" className="py-2 text-right font-normal">
              접수 마감
            </th>
          </tr>
        </thead>
        <tbody>
          {order.map((d) => {
            const h = hoursOf(d);
            const isToday = d === dow;
            const closed = h.open === undefined || h.close === undefined;
            return (
              <tr key={d} className="border-t" style={{ borderColor: C.line, background: isToday ? C.sunSoft : undefined, fontWeight: isToday ? 700 : 400 }}>
                <th scope="row" className="py-2.5 pl-2 pr-2 text-left">
                  {h.label}
                  {isToday && <span className="ml-1.5 rounded-[3px] px-1.5 py-0.5 text-[12px]" style={{ background: C.ink, color: C.sun }}>오늘</span>}
                </th>
                <td className="py-2.5 pr-2">
                  {closed ? (
                    "휴진"
                  ) : (
                    <>
                      {hm(h.open!)}~{hm(h.close!)}
                      {h.night && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-[3px] px-1.5 py-0.5 align-middle text-[12px] font-bold" style={{ background: C.greenDeep, color: "#fff" }}>
                          <Moon size={11} aria-hidden />
                          야간
                        </span>
                      )}
                    </>
                  )}
                </td>
                <td className="py-2.5 pr-2 text-right tabular-nums">{closed ? "-" : hm(h.close! - LAST_CALL)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-4 text-[15px]">
        점심시간 {hm(LUNCH[0])}~{hm(LUNCH[1])}, 토요일은 점심시간 없이 진료해요.
        <br />
        일요일, 공휴일 휴진.
      </p>
      <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
        지금 {hm(nowMin)}
      </p>
    </section>
  );
}

/* ---------- 2. 예방접종 일정 계산 ---------- */

function VaccineSection({ reduce, today, birthInput, setBirth }: { reduce: boolean; today: Date; birthInput: string; setBirth: (s: string) => void }) {
  const birth = parseDate(birthInput);
  const [all, setAll] = useState(false);

  const rows = useMemo(() => {
    if (!birth) return [];
    return VISITS.map((v) => ({ v, date: visitDate(birth, v) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birthInput]);

  const error = !birth ? "생년월일을 넣어 주세요." : birth > today ? "생년월일이 오늘보다 뒤예요." : dayDiff(today, birth) > 365 * 13 ? "만 12세 이후 일정은 진료 때 안내해 드려요." : null;
  const nextIdx = error ? -1 : rows.findIndex((r) => dayDiff(r.date, today) >= 0);
  const next = nextIdx >= 0 ? rows[nextIdx] : null;
  const dleft = next ? dayDiff(next.date, today) : 0;

  // 지난 일정은 바로 앞 하나만 보이고 나머지는 접는다
  const shown = all || nextIdx < 0 ? rows : rows.filter((_, i) => i >= nextIdx - 1 && i <= nextIdx + 3);

  return (
    <section id="pd-vaccine" aria-labelledby="pd-vaccine-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
      <SectionTitle id="pd-vaccine-title" icon={<Syringe size={22} aria-hidden />} title="예방접종 일정 계산" />
      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-8">
        <div>
          <label className="grid max-w-[320px] gap-1.5 text-[16px] font-bold">
            아이 생년월일
            <input
              type="date"
              value={birthInput}
              max={fmtDash(today)}
              onChange={(e) => setBirth(e.target.value)}
              className={`rounded-[6px] border px-3 py-2.5 text-[17px] ${focusRing}`}
              style={{ borderColor: C.line, background: "#fff", outlineColor: C.green, fontWeight: 400 }}
            />
          </label>

          <div className="mt-5 rounded-[10px] p-5 md:p-6" style={{ background: C.greenDeep, color: "#fff8e6" }} aria-live="polite">
            {error ? (
              <p className="inline-flex items-center gap-2 text-[16px]">
                <AlertCircle size={18} aria-hidden />
                {error}
              </p>
            ) : next ? (
              <>
                <p className="text-[15px]" style={{ color: "#d7e8d6" }}>
                  다음 접종
                </p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${next.v.label}-${fmtDash(next.date)}`}
                    initial={reduce ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: reduce ? 0 : -16, transition: { duration: reduce ? 0 : 0.15 } }}
                    transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
                  >
                    <p className="mt-1 text-[28px] leading-tight md:text-[32px]" style={juaF}>
                      {next.v.items.join(", ")}
                    </p>
                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[17px]">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={18} aria-hidden />
                        {next.v.days === 28 ? `${fmtKo(next.date)}까지` : `${fmtKo(next.date)}부터`}
                      </span>
                      <span className="rounded-[4px] px-2 py-0.5 text-[15px] font-bold" style={{ background: C.sun, color: C.ink }}>
                        {dleft === 0 ? "오늘" : `D-${dleft}`}
                      </span>
                    </p>
                    <p className="mt-2 text-[15px]" style={{ color: "#d7e8d6" }}>
                      {next.v.label}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </>
            ) : (
              <p className="text-[16px]">표준 일정 안의 접종 시기가 모두 지났어요.</p>
            )}
          </div>
          <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
            질병관리청 국가예방접종 표준 일정 일부 기준
          </p>
        </div>

        <div>
          <ol className="grid gap-0">
            {shown.map(({ v, date }) => {
              const i = rows.findIndex((r) => r.v === v);
              const state = error ? "예정" : i < nextIdx || nextIdx < 0 ? "지남" : i === nextIdx ? "다음" : "예정";
              return (
                <li key={v.label + v.items[0]} className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-3 pb-4">
                  <span className="relative flex justify-center pt-1" aria-hidden>
                    <span className="absolute bottom-[-16px] top-6 w-[2px]" style={{ background: C.line }} />
                    {state === "다음" ? (
                      <motion.span layoutId={reduce ? undefined : "pd-next-mark"} className="relative h-5 w-5 rounded-[3px]" style={{ background: C.sun, boxShadow: `inset 0 2px 0 rgba(255,250,236,0.8), 0 0 0 3px ${C.greenDeep}` }} />
                    ) : (
                      <span className="relative h-4 w-4 rounded-[3px]" style={{ background: state === "지남" ? C.line : "linear-gradient(135deg, #f2d29c, #c58f55)" }} />
                    )}
                  </span>
                  <div style={{ opacity: state === "지남" ? 0.62 : 1 }}>
                    <p className="flex flex-wrap items-baseline gap-x-2 text-[15px]">
                      <span className="font-bold">{v.label}</span>
                      <span className="tabular-nums" style={{ color: C.muted }}>
                        {error ? "" : fmtDot(date)}
                      </span>
                      {!error && <span className="text-[13px] font-bold" style={{ color: state === "다음" ? C.greenDeep : C.muted }}>{state === "지남" ? "지난 일정" : state === "다음" ? "다음 접종" : ""}</span>}
                    </p>
                    <p className="mt-0.5 text-[15px]">{v.items.join(", ")}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          {nextIdx >= 0 && (
            <button type="button" onClick={() => setAll((a) => !a)} aria-expanded={all} className={`rounded-[6px] border px-4 py-2 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.line, background: "#fff", outlineColor: C.green }}>
              {all ? "가까운 일정만 보기" : "전체 일정 보기"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. 영유아 건강검진 시기 ---------- */

function CheckupSection({ reduce, today, birthInput }: { reduce: boolean; today: Date; birthInput: string }) {
  const birth = parseDate(birthInput);
  const valid = birth !== null && birth <= today;

  const wins = valid ? CHECKUPS.map((c) => checkupWindow(birth, c)) : [];
  const nowIdx = valid ? wins.findIndex(([a, b]) => today >= a && today <= b) : -1;
  const nextIdx = valid && nowIdx < 0 ? wins.findIndex(([a]) => a > today) : -1;
  const focus = nowIdx >= 0 ? nowIdx : nextIdx >= 0 ? nextIdx : 0;

  const [picked, setPicked] = useState<number | null>(null);
  const sel = picked ?? focus;
  const c = CHECKUPS[sel];
  const w = wins[sel];

  return (
    <section id="pd-checkup" aria-labelledby="pd-checkup-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
      <SectionTitle id="pd-checkup-title" icon={<Baby size={22} aria-hidden />} title="영유아 건강검진 시기" />
      <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
        생년월일 {valid ? fmtDot(birth) : "미입력"} 기준, 영유아 건강검진 지정 의료기관
      </p>

      {/* 차수 블록. 차수가 올라갈수록 블록이 높아진다 */}
      <div role="tablist" aria-label="검진 차수" className="mt-6 grid grid-cols-4 items-end gap-2 md:grid-cols-8 md:gap-3">
        {CHECKUPS.map((k, i) => {
          const active = i === sel;
          const isNow = i === nowIdx;
          const isNext = i === nextIdx;
          const past = valid && wins[i][1] < today;
          return (
            <button
              key={k.n}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="pd-checkup-panel"
              onClick={() => setPicked(i)}
              className={`relative flex h-[92px] flex-col justify-end rounded-[6px] px-2 pb-2 pt-3 text-left md:h-[var(--pd-h)] ${focusRing}`}
              style={{
                ["--pd-h" as string]: `${84 + i * 9}px`,
                background: isNow || isNext ? C.sun : past ? "#efe8d6" : "linear-gradient(135deg, #f2d29c, #d4a165)",
                color: C.ink,
                boxShadow: active ? `0 0 0 3px ${C.greenDeep}` : "inset 0 2px 0 rgba(255,250,236,0.75), inset -4px -4px 0 rgba(90,58,23,0.14)",
                outlineColor: C.green,
              }}
            >
              {(isNow || isNext) && (
                <span className="absolute left-2 top-2 rounded-[3px] px-1.5 py-0.5 text-[12px] font-bold" style={{ background: C.greenDeep, color: "#fff" }}>
                  {isNow ? "지금" : "다음"}
                </span>
              )}
              <span className="text-[22px] leading-none" style={juaF}>
                {k.n}차
              </span>
              <span className="mt-1 text-[12px] leading-tight md:text-[13px]">{k.unit === "day" ? `${k.range[0]}~${k.range[1]}일` : `${k.range[0]}~${k.range[1]}개월`}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={sel}
          id="pd-checkup-panel"
          role="tabpanel"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.12 } }}
          transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
          className="mt-5 grid gap-4 rounded-[10px] border p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:p-6"
          style={{ borderColor: C.line, background: "#fff" }}
        >
          <div>
            <p className="text-[24px]" style={juaF}>
              {c.n}차 검진
            </p>
            <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
              {checkupLabel(c)}
            </p>
            {w && (
              <p className="mt-3 text-[17px] font-bold tabular-nums" style={{ color: C.greenDeep }}>
                {fmtDot(w[0])} ~ {fmtDot(w[1])}
              </p>
            )}
          </div>
          <dl className="grid gap-2 text-[15px]">
            <div className="flex gap-3">
              <dt className="w-[72px] shrink-0 font-bold">검사</dt>
              <dd>문진과 진찰, 키, 몸무게, 머리둘레, 발달 확인</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-[72px] shrink-0 font-bold">건강교육</dt>
              <dd>{c.edu}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-[72px] shrink-0 font-bold">비용</dt>
              <dd>국민건강보험 부담, 본인 부담 없음</dd>
            </div>
            {c.dental && (
              <div className="flex gap-3">
                <dt className="w-[72px] shrink-0 font-bold">구강검진</dt>
                <dd>같은 시기에 치과에서 받아요</dd>
              </div>
            )}
          </dl>
        </motion.div>
      </AnimatePresence>
      <p className="mt-3 inline-flex items-center gap-1.5 text-[14px]" style={{ color: C.muted }}>
        <MessageCircle size={15} aria-hidden />
        검진 예약은 데스크 {TEL}, {KAKAO}
      </p>
    </section>
  );
}

/* ---------- 오시는 길 약도 ---------- */

function MiniMap() {
  return (
    <svg viewBox="0 0 320 220" className="h-auto w-full rounded-[8px]" role="img" aria-label="ㅇㅇ역 2번 출구에서 도보 5분, 큰길 모퉁이 건물 3층 약도" style={{ background: "#f4eedc" }}>
      <rect x="0" y="92" width="320" height="34" fill="#fff" />
      <rect x="196" y="0" width="30" height="220" fill="#fff" />
      <path d="M0 109 H320 M211 0 V220" stroke={C.line} strokeWidth="2" strokeDasharray="8 8" />
      <rect x="236" y="34" width="62" height="48" rx="4" fill={C.sun} stroke={C.ink} strokeWidth="2" />
      <text x="267" y="63" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink}>
        3층
      </text>
      <rect x="40" y="136" width="58" height="34" rx="4" fill={C.greenDeep} />
      <text x="69" y="158" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">
        ㅇㅇ역
      </text>
      <path d="M98 150 C150 150 170 130 200 118 S236 96 248 84" fill="none" stroke={C.greenDeep} strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />
      <text x="120" y="190" fontSize="12" fill={C.muted}>
        2번 출구, 도보 5분
      </text>
    </svg>
  );
}
