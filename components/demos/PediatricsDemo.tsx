"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Baby,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
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
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtDot, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 소아청소년과 홈페이지 샘플: 가상의 소아청소년과 의원 곰파트너.
   병원명, 의료진, 주소, 전화번호, 진료비는 모두 가상이다. 첫 화면 사진 출처: Pexels 사진 39192342, 직원 사진은 AI 생성(Z-Image-Turbo)
   의료법 광고 규칙에 맞춰 치료 효과, 후기, 할인 문구는 넣지 않는다.

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

   포스터 첫 화면(pd-poster): 위에 메뉴(진료시간표, 예방접종, 영유아검진, 실시간 대기, 비급여항목, 오시는길, 휴대폰은 3칸 2줄).
   사진을 배경으로 깔지 않고 왼쪽 2/3을 오늘 진료판으로 쓴다. 큰 문장 "지금 대기 3명"(대기 인원 상태와 연결), 날짜와 앞뒤 버튼,
   시간대 줄(오전, 오후, 화 목 야간)마다 진료 시간, 원장, 접수 마감 시각, 지금 상태(접수 중, 접수 마감, 진료 끝).
   지금 시간대 줄만 초록 바탕. 판 아래 접수 방식 한 줄과 진료 접수, 접종 검진 예약 버튼. 오른쪽 1/3은 세로 사진 한 장(막 없음).
   휴대폰은 사진이 판 위 120px 띠로 줄어든다. 모션은 사진이 천천히 다가오고 문장이 0.3초 늦게 올라오는 것뿐, 동작 줄이기면 정지.
   본문은 흰색과 #f7f7f5 바탕, 강조색은 짙은 초록 하나. 동작 줄이기면 전부 정지 상태다. */

const TEL = "02-000-0000";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";
const KAKAO = "카카오톡 채널 곰파트너";

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className={small ? "h-6 w-6 shrink-0" : "h-7 w-7 shrink-0"} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold tracking-[-0.03em]`}>곰파트너</span>
        <span className="text-[12px] font-semibold opacity-75">카탈로그</span>
      </span>
    </span>
  );
}
const IMG = "/images/demo-pediatrics";

const C = {
  paper: "#ffffff",
  paperDeep: "#f7f7f5",
  ink: "#111111",
  body: "#4b4b4b",
  green: "#2f5e46",
  greenDeep: "#2f5e46",
  greenTint: "#edf2ee",
  muted: "#6b6b6b",
  line: "#e5e5e5",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 칩, 숫자, 표시 전환 */
const DUR = 0.35;
/** 첫 화면 사진이 scale 1.06 -> 1 로 다가오는 시간(ms) */
const HERO_MS = 1600;
/** 문장과 정보 줄이 아래 12px 에서 올라오는 시간과 지연(ms) */
const RISE_MS = 700;
const RISE_DELAY_MS = 300;
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


  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} today={today} nowMin={nowMin} wait={wait} go={go} />

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
            <li key={d.name} className="border-t pt-3" style={{ borderColor: C.line }}>
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
              ["대표원장", "김ㅎ늘", `${IMG}/staff-1.jpg`],
              ["원장", "박ㅅ윤", `${IMG}/staff-2.jpg`],
            ].map(([role, name, photo]) => (
              <li key={name} className="flex items-center gap-4 rounded-[6px] border px-4 py-4" style={{ borderColor: C.line, background: "#fff" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                <img
                  src={photo}
                  alt={`${role} ${name}`}
                  width={56}
                  height={56}
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                  style={{ objectPosition: "50% 20%", background: C.greenTint }}
                />
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

      <footer className="mt-20 border-t px-4 py-10 md:px-6" style={{ background: C.paperDeep, borderColor: C.line, color: C.body }}>
        <div className="mx-auto max-w-[1200px]">
          <p>
            <SampleLogo />
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
    <h2 id={id} className="inline-flex items-center gap-2.5 text-[26px] font-bold leading-tight md:text-[30px]" style={{ color: C.ink, letterSpacing: "-0.02em" }}>
      <span style={{ color: C.green }}>{icon}</span>
      {title}
    </h2>
  );
}

/* ---------- 포스터 ---------- */

const HERO_CSS = `
@keyframes pd-rise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}
.pd-rise { animation: pd-rise ${RISE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${RISE_DELAY_MS}ms both; }
@media (prefers-reduced-motion: reduce) {
  .pd-rise { animation: none; }
}
`;

/** 위쪽 메뉴. 휴대폰은 3칸 2줄 */
const NAV: [string, string][] = [
  ["pd-hours", "진료시간표"],
  ["pd-vaccine", "예방접종"],
  ["pd-checkup", "영유아검진"],
  ["pd-queue", "실시간 대기"],
  ["pd-fees", "비급여항목"],
  ["pd-visit", "오시는길"],
];

interface Slot {
  label: string;
  from: number;
  to: number;
  who: string;
}
/** 그 요일 시간대 줄(오전, 오후, 야간)과 진료 원장 */
function slotsOf(dow: number): Slot[] {
  const h = hoursOf(dow);
  if (h.open === undefined || h.close === undefined) return [];
  if (!h.lunch) return [{ label: "오전", from: h.open, to: h.close, who: "김ㅎ늘, 박ㅅ윤" }];
  const out: Slot[] = [
    { label: "오전", from: h.open, to: LUNCH[0], who: "김ㅎ늘, 박ㅅ윤" },
    { label: "오후", from: LUNCH[1], to: Math.min(h.close, 1140), who: "김ㅎ늘, 박ㅅ윤" },
  ];
  if (h.night) out.push({ label: "야간", from: 1140, to: h.close, who: dow === 2 ? "김ㅎ늘" : "박ㅅ윤" });
  return out;
}
type SlotState = "진료 전" | "접수 중" | "접수 마감" | "진료 끝";
function slotState(s: Slot, now: number): SlotState {
  if (now < s.from) return "진료 전";
  if (now >= s.to) return "진료 끝";
  if (now >= s.to - LAST_CALL) return "접수 마감";
  return "접수 중";
}
const BOARD_DAYS = 7;

function Poster({
  reduce,
  today,
  nowMin,
  wait,
  go,
}: {
  reduce: boolean;
  today: Date;
  nowMin: number;
  wait: number;
  go: (id: string) => void;
}) {
  const [off, setOff] = useState(0);
  const day = daysAgo(today, -off);
  const dow = day.getDay();
  const slots = slotsOf(dow);
  const isToday = off === 0;
  const navBtn = `min-h-11 rounded-[4px] px-2.5 text-[15px] font-semibold hover:underline underline-offset-4 ${focusRing}`;
  const arrowBtn = `inline-flex h-11 w-11 items-center justify-center rounded-[6px] border disabled:opacity-35 ${focusRing}`;

  return (
    <section id="pd-poster" aria-labelledby="pd-poster-title" style={{ background: C.paper, color: C.ink }}>
      <style>{HERO_CSS}</style>
      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pt-3 md:px-6 md:py-3">
        <p className="leading-none">
          <SampleLogo small />
        </p>
        <nav aria-label="주요 메뉴" className="hidden items-center md:flex">
          {NAV.map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.green }}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      {/* 휴대폰 메뉴: 3칸 2줄 */}
      <nav aria-label="주요 메뉴" className="mx-4 mt-3 grid grid-cols-3 overflow-hidden rounded-[6px] border md:hidden" style={{ borderColor: C.line }}>
        {NAV.map(([id, label], i) => (
          <button
            key={id}
            type="button"
            onClick={() => go(id)}
            className={`min-h-11 px-1 text-[14px] font-semibold ${i % 3 !== 2 ? "border-r" : ""} ${i < 3 ? "border-b" : ""} ${focusRing}`}
            style={{ borderColor: C.line, outlineColor: C.green, outlineOffset: -3 }}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="mx-auto grid max-w-[1200px] gap-5 px-4 pb-10 pt-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-6 md:px-6 md:pt-6">
        {/* 진료판 */}
        <div className="order-2 flex flex-col justify-center md:order-1">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 id="pd-poster-title" className={`text-[30px] font-bold md:text-[clamp(32px,3.4vw,46px)] ${reduce ? "" : "pd-rise"}`} style={{ letterSpacing: "-0.03em", lineHeight: 1.2 }}>
              지금 대기 <span className="tabular-nums">{wait}</span>명
            </h1>
            <p className="pb-1 text-[15px]" style={{ color: C.muted }}>
              접수는 시간대마다 끝나기 {LAST_CALL}분 전에 마감
            </p>
          </div>

          <div className="mt-4 rounded-[8px] border" style={{ borderColor: C.line }}>
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2 md:px-5" style={{ borderColor: C.line, background: C.paperDeep }}>
              <button type="button" className={arrowBtn} style={{ borderColor: C.line, background: "#fff", outlineColor: C.green }} onClick={() => setOff((v) => Math.max(0, v - 1))} disabled={off === 0} aria-label="앞 날짜">
                <ChevronLeft size={20} aria-hidden />
              </button>
              <p className="text-center text-[17px] font-bold md:text-[19px]" aria-live="polite">
                {fmtKo(day)}
                {isToday && (
                  <span className="ml-2 rounded-[4px] px-2 py-0.5 align-middle text-[13px] font-semibold" style={{ background: C.green, color: "#fff" }}>
                    오늘
                  </span>
                )}
              </p>
              <button type="button" className={arrowBtn} style={{ borderColor: C.line, background: "#fff", outlineColor: C.green }} onClick={() => setOff((v) => Math.min(BOARD_DAYS - 1, v + 1))} disabled={off === BOARD_DAYS - 1} aria-label="다음 날짜">
                <ChevronRight size={20} aria-hidden />
              </button>
            </div>

            {slots.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-4 py-8 md:px-5">
                <p className="text-[18px] font-semibold" style={{ color: C.muted }}>
                  일요일, 공휴일 휴진
                </p>
                {off < BOARD_DAYS - 1 && (
                  <button type="button" onClick={() => setOff((v) => v + 1)} className={`min-h-11 rounded-[6px] border px-4 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.line, background: "#fff", outlineColor: C.green }}>
                    {fmtKo(daysAgo(day, -1))} 진료 보기
                  </button>
                )}
              </div>
            ) : (
              <ul>
                {slots.map((s) => {
                  const st = isToday ? slotState(s, nowMin) : null;
                  const live = st === "접수 중" || st === "접수 마감";
                  return (
                    <li
                      key={s.label}
                      className="grid grid-cols-[3.2em_minmax(0,1fr)_auto] items-center gap-x-3 border-b px-4 py-4 last:border-b-0 md:grid-cols-[4em_minmax(0,1fr)_minmax(0,1fr)_auto] md:px-5 md:py-5"
                      style={{ borderColor: C.line, background: live ? C.greenTint : "transparent", opacity: st === "진료 끝" ? 0.55 : 1 }}
                    >
                      <span className="text-[18px] font-bold md:text-[20px]">{s.label}</span>
                      <span className="min-w-0">
                        <span className="block text-[17px] font-semibold tabular-nums md:text-[18px]">
                          {hm(s.from)} ~ {hm(s.to)}
                        </span>
                        <span className="block text-[14px] md:hidden" style={{ color: C.muted }}>
                          {s.who} 원장
                        </span>
                        <span className="block text-[14px] tabular-nums" style={{ color: C.muted }}>
                          접수 마감 {hm(s.to - LAST_CALL)}
                        </span>
                      </span>
                      <span className="hidden text-[16px] md:block">{s.who} 원장</span>
                      <span
                        className="rounded-[4px] px-2 py-1 text-[14px] font-semibold"
                        style={
                          st === "접수 중"
                            ? { background: C.green, color: "#fff" }
                            : st === "접수 마감"
                              ? { background: "#fff", color: C.error, border: `1px solid ${C.error}` }
                              : { background: C.paperDeep, color: C.body }
                        }
                      >
                        {st ?? "진료"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px]" style={{ color: C.body }}>
              일반 진료는 실시간 접수, 예방접종과 검진은 예약
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => go("pd-queue")}
                data-gtm-cta="pediatrics_poster_cta"
                className={`inline-flex min-h-11 items-center rounded-[6px] px-4 text-[16px] font-semibold ${focusRing}`}
                style={{ background: C.green, color: "#ffffff", outlineColor: C.green }}
              >
                진료 접수
              </button>
              <button
                type="button"
                onClick={() => go("pd-vaccine")}
                className={`inline-flex min-h-11 items-center rounded-[6px] border px-4 text-[16px] font-semibold ${focusRing}`}
                style={{ borderColor: C.green, color: C.green, background: "#fff", outlineColor: C.green }}
              >
                접종, 검진 예약
              </button>
            </div>
          </div>
        </div>

        {/* 세로 사진 한 장, 막 없이 액자처럼 */}
        <div className="relative order-1 h-[120px] overflow-hidden rounded-[6px] md:order-2 md:h-auto md:min-h-[420px]">
          <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : HERO_MS / 1000, ease: EASE }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
            <img
              src={`${IMG}/hero.jpg`}
              srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
              sizes="(min-width: 768px) 34vw, 100vw"
              alt="의사가 청진기로 아이의 가슴 소리를 듣는 모습"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "40% 45%" }}
            />
          </motion.div>
        </div>
      </div>
    </section>
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
    <section id="pd-queue" aria-labelledby="pd-queue-title" className="scroll-mt-4 rounded-[8px] border p-5 md:p-7" style={{ background: C.paperDeep, borderColor: C.line, color: C.ink }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 id="pd-queue-title" className="inline-flex items-center gap-2 text-[24px] font-bold">
          <Users size={22} aria-hidden />
          실시간 대기
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-[4px] px-3 py-1 text-[14px] font-bold" style={{ background: C.ink, color: "#ffffff" }}>
          <Clock size={15} aria-hidden />
          {status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3" aria-live="polite">
        <p className="leading-none">
          <span className="text-[15px] font-bold">진료 대기</span>
          <span className="ml-2 text-[56px] font-bold tabular-nums md:text-[68px]" style={{ color: C.ink, letterSpacing: "-0.03em" }}>
            {wait}
          </span>
          <span className="ml-1 text-[22px] font-bold">
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
                  background: isMine ? C.green : C.paper,
                  border: `1px solid ${isMine ? C.green : C.line}`,
                  color: isMine ? "#fff" : C.body,
                }}
              >
                {isMine ? "내 차례" : k + 1}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]" style={{ color: C.body }}>
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
            style={{ background: C.paper, border: `1px solid ${C.line}` }}
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
            style={{ background: C.paper, border: `1px solid ${C.line}` }}
          >
            <fieldset>
              <legend className="mb-2 text-[15px] font-bold">진료 구분</legend>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((t) => (
                  <label key={t} className="cursor-pointer">
                    <input type="radio" name="pd-type" value={t} checked={type === t} onChange={() => setType(t)} className="peer sr-only" />
                    <span
                      className="inline-flex items-center gap-1 rounded-[6px] border px-3 py-1.5 text-[15px] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2"
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
    <section id="pd-hours" aria-labelledby="pd-hours-title" className="scroll-mt-4 rounded-[8px] border p-5 md:p-7" style={{ borderColor: C.line, background: "#fff" }}>
      <h2 id="pd-hours-title" className="inline-flex items-center gap-2 text-[24px] font-bold">
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
              <tr key={d} className="border-t" style={{ borderColor: C.line, background: isToday ? C.greenTint : undefined, fontWeight: isToday ? 700 : 400 }}>
                <th scope="row" className="py-2.5 pl-2 pr-2 text-left">
                  {h.label}
                  {isToday && <span className="ml-1.5 rounded-[3px] px-1.5 py-0.5 text-[12px]" style={{ background: C.green, color: "#ffffff" }}>오늘</span>}
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

          <div className="mt-5 rounded-[8px] border p-5 md:p-6" style={{ background: C.paperDeep, borderColor: C.line, color: C.ink }} aria-live="polite">
            {error ? (
              <p className="inline-flex items-center gap-2 text-[16px]">
                <AlertCircle size={18} aria-hidden />
                {error}
              </p>
            ) : next ? (
              <>
                <p className="text-[15px]" style={{ color: C.muted }}>
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
                    <p className="mt-1 text-[26px] font-bold leading-tight md:text-[30px]" style={{ letterSpacing: "-0.02em" }}>
                      {next.v.items.join(", ")}
                    </p>
                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[17px]">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={18} aria-hidden />
                        {next.v.days === 28 ? `${fmtKo(next.date)}까지` : `${fmtKo(next.date)}부터`}
                      </span>
                      <span className="rounded-[4px] px-2 py-0.5 text-[15px] font-bold" style={{ background: C.green, color: "#ffffff" }}>
                        {dleft === 0 ? "오늘" : `D-${dleft}`}
                      </span>
                    </p>
                    <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
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
                      <motion.span layoutId={reduce ? undefined : "pd-next-mark"} className="relative h-5 w-5 rounded-[3px]" style={{ background: C.green }} />
                    ) : (
                      <span className="relative h-4 w-4 rounded-[3px]" style={{ background: state === "지남" ? C.line : C.paper, border: `1px solid ${state === "지남" ? C.line : "#bdbdbd"}` }} />
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
                background: isNow || isNext ? C.greenTint : past ? C.paperDeep : C.paper,
                border: `1px solid ${active ? C.green : C.line}`,
                color: C.ink,
                boxShadow: active ? `inset 0 0 0 1px ${C.green}` : "none",
                outlineColor: C.green,
              }}
            >
              {(isNow || isNext) && (
                <span className="absolute left-2 top-2 rounded-[3px] px-1.5 py-0.5 text-[12px] font-bold" style={{ background: C.greenDeep, color: "#fff" }}>
                  {isNow ? "지금" : "다음"}
                </span>
              )}
              <span className="text-[20px] font-bold leading-none">
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
          className="mt-5 grid gap-4 rounded-[8px] border p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:p-6"
          style={{ borderColor: C.line, background: "#fff" }}
        >
          <div>
            <p className="text-[22px] font-bold">
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
    <svg viewBox="0 0 320 220" className="h-auto w-full rounded-[8px]" role="img" aria-label="ㅇㅇ역 2번 출구에서 도보 5분, 큰길 모퉁이 건물 3층 약도" style={{ background: "#f3f3f1" }}>
      <rect x="0" y="92" width="320" height="34" fill="#fff" />
      <rect x="196" y="0" width="30" height="220" fill="#fff" />
      <path d="M0 109 H320 M211 0 V220" stroke={C.line} strokeWidth="2" strokeDasharray="8 8" />
      <rect x="236" y="34" width="62" height="48" rx="4" fill={C.green} />
      <text x="267" y="63" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff">
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
