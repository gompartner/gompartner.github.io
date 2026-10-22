"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import {
  AlertTriangle,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  Check,
  ChevronRight,
  Clock,
  FileText,
  HardHat,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Scale,
  ShieldAlert,
  Users,
  Wallet,
} from "lucide-react";
import { Black_Han_Sans, JetBrains_Mono } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 노무법인 홈페이지 샘플: 가상의 곰파트너노무법인. 근로자 사건(부당해고, 임금체불, 산재)과 사업장 노무 자문을 함께 한다.
   상호, 노무사 이름, 주소, 전화번호, 손님 이름은 모두 가상이다.

   국내 노무법인 사이트 공통 구성(참고): 메뉴는 법인소개, 업무분야(부당해고 구제신청, 임금체불 진정, 산재 신청,
   직장 내 괴롭힘, 노무 자문, 급여 아웃소싱), 노무사 소개, 상담신청, 오시는 길. 첫 화면에 "무료 상담", "상담신청" 버튼과
   대표번호를 크게 둔다. 노무 자문은 직원 수 구간별 월 자문료(부가세 별도)로 안내하는 곳이 많다.
   변호사 광고 규정과 같은 기준으로 승소율, 성공 사례 숫자, 결과 보장 표현은 쓰지 않는다.

   기준이 있는 숫자만 쓴다.
   부당해고 구제신청은 해고가 있었던 날부터 3개월 안에 지방노동위원회에 낸다(근로기준법 제28조). 기간은 민법대로
   해고 다음 날부터 세어 3개월 뒤 같은 날 끝나고, 그 날이 토요일이나 공휴일이면 다음 날 끝난다.
   퇴직하면 14일 안에 임금과 퇴직금을 받아야 하고, 지나면 연 20% 지연이자가 붙는다(근로기준법 제36조, 제37조, 시행령 제17조).
   2025년 10월 23일부터는 재직 중 밀린 임금도 정기 지급일 다음 날부터 같은 지연이자가 붙는다.
   퇴직금은 1년 이상 일했을 때 평균임금 30일분 x 근속 연수다. 계산기는 월급으로 바꿔 개략만 보여 준다.

   포스터 첫 화면(lf-poster): 진회색 바탕에 큰 문장 "해고된 날부터 3개월 안에 신청해요" 하나만 둔다.
   오른쪽(휴대폰은 아래)에 벽에 걸린 큰 일력이 있고, 들어오면 맨 위 장부터 한 장씩 찢겨 날아가며 남은 날 숫자가 줄어든다.
   찢고 난 뒤에는 맨 위 장 아래 끝이 바람에 살짝 들리는 움직임 하나만 7초 주기로 반복한다.
   스크롤하면 남은 장이 위로 한꺼번에 넘어가며 숫자가 빠르게 줄고, 문장은 위로 빠진다.
   동작 줄이기면 찢는 장 없이 마지막 장으로 고정하고, 들림과 스크롤 넘김도 없다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 부당해고 구제신청 기한 계산: 해고일을 넣으면 신청 마감일과 남은 날, 3개월 막대 위 오늘 위치가 나온다.
   2. 임금체불 개략 계산: 월급, 밀린 달, 퇴직 여부와 근속 연수를 넣으면 밀린 임금과 퇴직금 개략 합계가 나온다.
   3. 노무 자문 요금: 직원 수를 움직이면 해당 구간 월 자문료와 연간 금액이 나온다.
   4. 상담신청: 분야, 방법, 희망일, 시간대, 이름, 연락처. 완료 화면에 접수 번호, 담당 창구, 회신 예정일. */

const sfxF = { fontFamily: `${Black_Han_Sans.style.fontFamily}, var(--font-sfx), sans-serif`, fontWeight: 400 } as const;
const monoF = { fontFamily: `${JetBrains_Mono.style.fontFamily}, ui-monospace, monospace` } as const;

const BRAND = "곰파트너노무법인";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 5층";

/* 포스터 색 */
const P = {
  bg: "#2a2c30",
  bgDeep: "#1c1d20",
  yellow: "#f5c400",
  yellowDeep: "#c99a00",
  paper: "#f6f3ea",
  paperEdge: "#ddd7c8",
  ink: "#1f2124",
  sub: "#cfccc4",
};

/* 본문 색 */
const C = {
  bg: "#f2f1ec",
  card: "#ffffff",
  ink: "#24262a",
  gray: "#2a2c30",
  yellow: "#f5c400",
  yellowSoft: "#fff3bf",
  yellowDeep: "#b58a00",
  muted: "#5b5e64",
  line: "#d9d7cf",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 찢긴 장이 날아갈 때. 처음엔 천천히 당겨지다 확 뜯긴다 */
const EASE_TEAR = [0.55, 0, 0.75, 0.3] as const;
/** 첫 장을 찢기 시작하는 시각 */
const TEAR_START = 0.3;
/** 장과 장 사이 간격 */
const TEAR_GAP = 0.2;
/** 한 장이 뜯겨 사라지는 시간 */
const TEAR_DUR = 0.6;
/** 종이 아래 끝이 보는 사람 쪽으로 들리는 rotateX 부호 */
const LIFT = -1;
/** 맨 위 장 아래 끝이 들렸다 내려오는 주기 */
const SWAY_LOOP = 7;
/** 포스터 스크롤 진행도 중 퇴장이 끝나는 지점 */
const EXIT_END = 0.8;
/** 결과 숫자, 막대 전환 */
const DUR = 0.4;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const md = (d: Date) => `${d.getMonth() + 1}.${d.getDate()}`;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* ---------- 일력 숫자 ---------- */

/** 들어올 때 찢겨 나가는 장(맨 위부터) */
const TORN = [92, 91, 90, 89, 88, 87];
/** 찢고 남은 장. 스크롤하면 위에서부터 차례로 넘어간다 */
const STACK = [86, 85, 84, 83, 82, 81, 80, 79, 78, 77];
/** 스크롤 넘김에서 장과 장 사이 진행도 간격, 한 장이 넘어가는 진행도 길이 */
const FLIP_STEP = 0.05;
const FLIP_LEN = 0.22;

/* ---------- 날짜 ---------- */

const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const DAY_MS = 86_400_000;
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY_MS);

/** "2026-10-07" 를 그 날 0시 Date 로 */
function parseDash(s: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 날짜가 고정된 공휴일(월-일). 설, 추석, 부처님오신날, 대체공휴일은 넣지 않았다 */
const FIXED_HOLIDAYS = ["1-1", "3-1", "5-5", "6-6", "8-15", "10-3", "10-9", "12-25"];
const isOffDay = (d: Date) => d.getDay() === 0 || d.getDay() === 6 || FIXED_HOLIDAYS.includes(`${d.getMonth() + 1}-${d.getDate()}`);

/** 해고일부터 3개월 되는 날. 해당 날이 없으면 그 달 말일, 토요일이나 공휴일이면 그다음 평일(민법 제161조) */
function reliefDeadline(fired: Date) {
  const y = fired.getFullYear();
  const m = fired.getMonth() + 3;
  const last = new Date(y, m + 1, 0).getDate();
  const raw = new Date(y, m, Math.min(fired.getDate(), last));
  let end = raw;
  while (isOffDay(end)) end = daysAgo(end, -1);
  return { raw, end, moved: end.getTime() !== raw.getTime() };
}

/** 다음 영업일(토, 일 제외) n개 */
function nextBizDays(from: Date, n: number) {
  const out: Date[] = [];
  let d = from;
  while (out.length < n) {
    d = daysAgo(d, -1);
    if (d.getDay() !== 0 && d.getDay() !== 6) out.push(d);
  }
  return out;
}

/* ---------- 업무분야 ---------- */

const AREAS = [
  { icon: ShieldAlert, name: "부당해고 구제신청", desc: "노동위원회 신청, 화해, 심문 회의 대리" },
  { icon: Wallet, name: "임금체불 진정", desc: "노동청 진정, 체불 확인서, 대지급금 신청" },
  { icon: HardHat, name: "산재 신청", desc: "업무상 사고, 질병 요양급여와 장해급여" },
  { icon: Users, name: "직장 내 괴롭힘", desc: "신고 대리, 사업장 조사와 조치 자문" },
  { icon: Briefcase, name: "노무 자문", desc: "취업규칙, 근로계약서, 노무 상담" },
  { icon: FileText, name: "급여 아웃소싱", desc: "급여 계산, 4대보험 신고, 연말정산" },
];

/* ---------- 노무 자문 요금(월, 부가세 별도) ---------- */

const TIERS: { from: number; to: number | null; label: string; fee: number | null }[] = [
  { from: 1, to: 4, label: "5인 미만", fee: 150_000 },
  { from: 5, to: 29, label: "5인 ~ 29인", fee: 250_000 },
  { from: 30, to: 49, label: "30인 ~ 49인", fee: 350_000 },
  { from: 50, to: 99, label: "50인 ~ 99인", fee: 500_000 },
  { from: 100, to: null, label: "100인 이상", fee: null },
];
const tierOf = (n: number) => TIERS.findIndex((t) => n >= t.from && (t.to === null || n <= t.to));
const ADVISORY_INCLUDES = ["전화, 카카오톡 노무 상담 횟수 제한 없음", "근로계약서, 취업규칙 검토", "징계, 해고 절차 자문", "노동청 점검 대응"];

/* ---------- 상담 ---------- */

const TOPICS = ["부당해고", "임금체불", "산재", "직장 내 괴롭힘", "노무 자문"] as const;
const METHODS = ["방문 상담", "전화 상담", "화상 상담"] as const;
const SLOTS = ["오전 10:00 ~ 12:00", "오후 2:00 ~ 6:00"] as const;

const HOURS = [
  { label: "평일", time: "09:00 ~ 18:00" },
  { label: "토요일", time: "10:00 ~ 13:00 (예약 상담)" },
  { label: "일요일, 공휴일", time: "휴무" },
];

const NOTICES = [
  { d: 3, t: "최저임금 고시에 따른 급여 계산 기준 안내" },
  { d: 11, t: "토요일 예약 상담 시간 변경" },
  { d: 26, t: "직장 내 괴롭힘 신고 절차 정리" },
];

export function LaborFirmDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("부당해고");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const consult = (t: (typeof TOPICS)[number]) => {
    setTopic(t);
    go("lf-consult");
  };

  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] font-semibold underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("lf-consult")} />

      <header className="border-b" style={{ background: C.gray, borderColor: "#3a3d42" }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:px-6">
          <h2 className="inline-flex items-center gap-2 text-[22px] leading-none text-white" style={sfxF}>
            <PageMark size={24} />
            {BRAND}
          </h2>
          <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center text-white">
            {[
              ["lf-deadline", "부당해고"],
              ["lf-wage", "임금체불"],
              ["lf-advisory", "노무 자문"],
              ["lf-people", "노무사 소개"],
              ["lf-consult", "상담신청"],
              ["lf-visit", "오시는 길"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: P.yellow }}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* 업무분야 */}
      <section aria-labelledby="lf-areas-title" className="mx-auto max-w-[1200px] px-4 pt-10 md:px-6 md:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="lf-areas-title" className="text-[26px] leading-tight md:text-[32px]" style={sfxF}>
            업무분야
          </h2>
          <a
            href={`tel:${TEL.replace(/-/g, "")}`}
            className={`inline-flex items-center gap-2 rounded-[4px] px-4 py-2.5 text-[16px] font-bold ${focusRing}`}
            style={{ background: C.yellow, color: C.ink, outlineColor: C.ink }}
          >
            <Phone size={18} aria-hidden />
            대표번호 <span style={monoF}>{TEL}</span>
          </a>
        </div>
        <ul className="mt-6 grid border-t sm:grid-cols-2 lg:grid-cols-3" style={{ borderColor: C.ink }}>
          {AREAS.map(({ icon: Icon, name, desc }) => (
            <li key={name} className="flex gap-3 border-b py-4 sm:pr-6" style={{ borderColor: C.line }}>
              <Icon size={22} className="mt-0.5 flex-none" aria-hidden />
              <div>
                <p className="text-[17px] font-bold">{name}</p>
                <p className="mt-0.5 text-[15px]" style={{ color: C.muted }}>
                  {desc}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="lf-deadline" aria-labelledby="lf-deadline-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="lf-deadline-title" icon={<CalendarClock size={24} aria-hidden />} title="부당해고 구제신청 기한" />
        <DeadlineCalc today={today} reduce={reduce} onConsult={() => consult("부당해고")} />
      </section>

      <section id="lf-wage" aria-labelledby="lf-wage-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="lf-wage-title" icon={<Wallet size={24} aria-hidden />} title="임금체불 개략 계산" />
        <WageCalc reduce={reduce} onConsult={() => consult("임금체불")} />
      </section>

      <section id="lf-advisory" aria-labelledby="lf-advisory-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="lf-advisory-title" icon={<Briefcase size={24} aria-hidden />} title="사업장 노무 자문" />
        <Advisory reduce={reduce} onConsult={() => consult("노무 자문")} />
      </section>

      <section id="lf-people" aria-labelledby="lf-people-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="lf-people-title" icon={<Scale size={24} aria-hidden />} title="노무사 소개" />
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            { name: "김ㅎ늘", role: "대표 공인노무사", areas: "부당해고, 직장 내 괴롭힘, 징계 자문" },
            { name: "박ㅈ민", role: "공인노무사", areas: "임금체불, 산재, 급여 아웃소싱" },
          ].map((p) => (
            <li key={p.name} className="flex items-center gap-4 rounded-[6px] border p-5" style={{ borderColor: C.line, background: C.card }}>
              <span className="grid h-14 w-14 flex-none place-items-center rounded-[4px] text-[22px]" style={{ ...sfxF, background: C.gray, color: P.yellow }} aria-hidden>
                {p.name[0]}
              </span>
              <div className="min-w-0">
                <p className="text-[18px] font-bold">
                  {p.name} <span className="text-[15px] font-semibold" style={{ color: C.muted }}>{p.role}</span>
                </p>
                <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                  {p.areas}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="lf-consult" aria-labelledby="lf-consult-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="lf-consult-title" icon={<MessageCircle size={24} aria-hidden />} title="상담신청" />
        <ConsultForm today={today} reduce={reduce} topic={topic} setTopic={setTopic} />
      </section>

      <div className="mx-auto mt-14 grid max-w-[1200px] gap-10 px-4 md:mt-20 md:grid-cols-[1.2fr_1fr] md:px-6">
        <section id="lf-visit" aria-labelledby="lf-visit-title" className="scroll-mt-4">
          <SectionTitle id="lf-visit-title" icon={<MapPin size={24} aria-hidden />} title="오시는 길" />
          <dl className="mt-5 grid gap-x-6 gap-y-3 text-[16px] sm:grid-cols-[auto_1fr]">
            <dt className="font-bold">주소</dt>
            <dd>{ADDRESS}</dd>
            <dt className="font-bold">지하철</dt>
            <dd>ㅇㅇ역 3번 출구에서 걸어서 5분</dd>
            <dt className="font-bold">주차</dt>
            <dd>건물 지하 주차장, 상담 시 1시간 무료</dd>
            <dt className="font-bold">상담 시간</dt>
            <dd>
              <ul>
                {HOURS.map((h) => (
                  <li key={h.label}>
                    <span className="inline-block w-[7.5em] font-semibold">{h.label}</span>
                    <span style={monoF}>{h.time}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </dl>
        </section>
        <section aria-labelledby="lf-notice-title">
          <SectionTitle id="lf-notice-title" icon={<FileText size={24} aria-hidden />} title="공지사항" />
          <ul className="mt-5 border-t" style={{ borderColor: C.ink }}>
            {NOTICES.map((n) => (
              <li key={n.t} className="flex items-baseline justify-between gap-4 border-b py-3 text-[16px]" style={{ borderColor: C.line }}>
                <span className="min-w-0">{n.t}</span>
                <span className="flex-none text-[14px]" style={{ ...monoF, color: C.muted }}>
                  {fmtDash(daysAgo(today, n.d))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="mt-16 px-4 pb-28 pt-10 text-[14px] leading-[1.8] md:px-6" style={{ background: C.gray, color: P.sub }}>
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[17px] text-white" style={sfxF}>
            {BRAND}
          </p>
          <p>
            {ADDRESS} / 대표번호 {TEL} / {KAKAO}
          </p>
          <DemoMakerInfo className="mt-6 text-white" />
        </div>
      </footer>
    </div>
  );
}

/* ---------- 공용 조각 ---------- */

function SectionTitle({ id, icon, title }: { id: string; icon: React.ReactNode; title: string }) {
  return (
    <h2 id={id} className="flex items-center gap-2.5 text-[26px] leading-tight md:text-[32px]" style={sfxF}>
      <span className="grid h-10 w-10 flex-none place-items-center rounded-[4px]" style={{ background: C.yellow, color: C.ink }}>
        {icon}
      </span>
      {title}
    </h2>
  );
}

/** 작은 상호 표시. 일력 한 장 */
function PageMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="2" width="18" height="6" rx="1.5" fill={P.yellow} />
      <rect x="4" y="7" width="16" height="15" rx="1" fill={P.paper} />
      <rect x="8" y="11" width="8" height="7" rx="1" fill={P.ink} />
    </svg>
  );
}

function Stepper({ label, value, set, min, max, unit }: { label: string; value: number; set: (n: number) => void; min: number; max: number; unit: string }) {
  const btn = `grid h-11 w-11 place-items-center rounded-[4px] border disabled:opacity-40 ${focusRing}`;
  return (
    <div>
      <p className="text-[15px] font-bold">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <button type="button" className={btn} style={{ borderColor: C.line, background: C.card, outlineColor: C.ink }} onClick={() => set(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${label} 줄이기`}>
          <Minus size={18} aria-hidden />
        </button>
        <output className="min-w-[4.5em] text-center text-[20px] font-bold" aria-live="polite" style={monoF}>
          {value}
          <span className="ml-0.5 text-[15px]" style={{ fontFamily: "inherit" }}>
            {unit}
          </span>
        </output>
        <button type="button" className={btn} style={{ borderColor: C.line, background: C.card, outlineColor: C.ink }} onClick={() => set(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} 늘리기`}>
          <Plus size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}

function ConsultLink({ onClick, cta, children }: { onClick: () => void; cta: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-gtm-cta={cta}
      className={`inline-flex items-center gap-1.5 rounded-[4px] px-4 py-2.5 text-[16px] font-bold text-white ${focusRing}`}
      style={{ background: C.gray, outlineColor: C.ink }}
    >
      {children}
      <ChevronRight size={18} aria-hidden />
    </button>
  );
}

/* ---------- 포스터 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 0 : clamp01(v / EXIT_END)));
  // 문장은 위로 빠지고 일력은 조금 늦게 따라 올라간다
  const textY = useTransform(p, (v) => `${-v * 42}svh`);
  const textO = useTransform(p, (v) => 1 - clamp01((v - 0.3) / 0.6));
  const calY = useTransform(p, (v) => `${-Math.max(0, v - 0.55) * 60}svh`);

  return (
    <section id="lf-poster" ref={ref} aria-labelledby="lf-poster-title" className="relative" style={{ height: reduce ? undefined : "180svh", background: P.bg }}>
      <div
        className={`${reduce ? "relative min-h-svh" : "sticky top-0 h-svh"} overflow-hidden`}
        style={{ background: `radial-gradient(90% 70% at 72% 40%, #34363b 0%, ${P.bg} 55%, ${P.bgDeep} 100%)`, color: "#fff" }}
      >
        {/* 벽 결. 아주 옅은 세로 줄 */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 7px)" }} />

        {/* 일력 */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-[5svh] flex justify-center lg:inset-y-0 lg:left-auto lg:right-[6vw] lg:items-center lg:pt-[4svh]"
          style={{ y: calY }}
        >
          <TearCalendar reduce={reduce} p={p} />
        </motion.div>

        {/* 로고와 핵심 행동 하나 */}
        <motion.div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4 md:px-12 md:pt-7" style={{ y: textY }}>
          <p className="inline-flex items-center gap-2 text-[17px] leading-none" style={sfxF}>
            <PageMark size={20} />
            {BRAND}
          </p>
          <button
            type="button"
            onClick={onCta}
            aria-label="상담신청"
            title="상담신청"
            data-gtm-cta="labor-firm_poster_cta"
            className={`pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full ${focusRing}`}
            style={{ background: P.yellow, color: P.ink, outlineColor: "#fff" }}
          >
            <CalendarCheck size={22} aria-hidden />
          </button>
        </motion.div>

        {/* 큰 문장 */}
        <motion.div className="relative z-[1] flex h-full flex-col px-4 pt-[13svh] md:px-12 lg:justify-center lg:pb-[4svh] lg:pt-0" style={{ y: textY, opacity: textO }}>
          <h1
            id="lf-poster-title"
            className="text-[clamp(48px,13.5vw,96px)] leading-[1.12] tracking-[-0.02em] lg:text-[clamp(88px,8.4vw,176px)] lg:leading-[1.06]"
            style={{ ...sfxF, wordBreak: "keep-all" }}
          >
            <span className="block">해고된 날부터</span>
            <span className="block" style={{ color: P.yellow }}>
              3개월 안에
            </span>
            <span className="block">신청해요</span>
          </h1>
          <p className="mt-5 text-[16px] md:mt-8 md:text-[19px]" style={{ color: P.sub }}>
            부당해고 구제신청, 지방노동위원회
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/** 벽에 걸린 일력. 위는 노란 광고판, 아래는 종이 묶음 */
function TearCalendar({ reduce, p }: { reduce: boolean; p: MotionValue<number> }) {
  const gid = useId().replace(/:/g, "");
  return (
    <div className="relative w-[min(66vw,29svh)] lg:w-[min(32vw,50svh)]" style={{ containerType: "inline-size" }} role="img" aria-label="벽에 걸린 일력. 한 장씩 찢겨 나가며 남은 날 숫자가 줄어든다">
      {/* 벽에 진 그림자 */}
      <div aria-hidden className="absolute left-[6%] top-[8%] h-[100%] w-[100%] rounded-[3cqw]" style={{ background: "rgba(0,0,0,0.45)", filter: "blur(18px)" }} />

      {/* 못과 끈 */}
      <svg aria-hidden viewBox="0 0 100 30" className="absolute left-1/2 top-[-9cqw] w-[30cqw] -translate-x-1/2 overflow-visible">
        <defs>
          <radialGradient id={`${gid}-nail`} cx="0.35" cy="0.3" r="0.75">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.35" stopColor="#c9ccd1" />
            <stop offset="1" stopColor="#4a4d52" />
          </radialGradient>
        </defs>
        <path d="M18 30 L50 6 L82 30" fill="none" stroke="#141517" strokeWidth="2.2" strokeLinecap="round" />
        <ellipse cx="53" cy="10" rx="8" ry="3" fill="rgba(0,0,0,0.5)" />
        <circle cx="50" cy="6" r="6" fill={`url(#${gid}-nail)`} />
      </svg>

      {/* 판 */}
      <div className="relative rounded-[2.5cqw] p-[5cqw] pb-[6cqw]" style={{ background: `linear-gradient(180deg, #ffd83a 0%, ${P.yellow} 30%, ${P.yellowDeep} 100%)`, boxShadow: "inset 0 1.2cqw 0 rgba(255,255,255,0.45), inset 0 -1cqw 0 rgba(0,0,0,0.18)" }}>
        {/* 판에 인쇄된 상호 */}
        <div className="flex items-center justify-between px-[1cqw] pb-[3.5cqw] pt-[1cqw]" style={{ color: P.ink }}>
          <span className="text-[6.4cqw] leading-none" style={sfxF}>
            {BRAND}
          </span>
          <span className="text-[3.6cqw] font-bold leading-none" style={monoF}>
            {TEL}
          </span>
        </div>

        {/* 종이 묶음 */}
        <div className="relative" style={{ perspective: "1400px" }}>
          {/* 묶음 두께. 아래로 갈수록 어두운 종이 단면 */}
          {[5, 4, 3, 2, 1].map((k) => (
            <div key={k} aria-hidden className="absolute inset-x-[0.4cqw] top-0 h-full rounded-b-[1.2cqw]" style={{ transform: `translateY(${k * 0.9}cqw)`, background: k % 2 ? "#d8d1bf" : "#e9e3d4", boxShadow: "0 0.3cqw 0 rgba(0,0,0,0.12)" }} />
          ))}

          {/* 바닥 장: 마지막 숫자. 묶음 크기를 잡는다 */}
          <div className="relative aspect-[1/1.02]">
            <Sheet n={STACK[STACK.length - 1] - 1} />
          </div>

          {/* 스크롤하면 넘어가는 장(아래 장부터 깐다) */}
          {[...STACK].reverse().map((n, ri) => {
            const i = STACK.length - 1 - ri;
            return <FlipSheet key={n} n={n} i={i} p={p} reduce={reduce} sway={i === 0} />;
          })}

          {/* 들어올 때 찢겨 나가는 장 */}
          {!reduce &&
            [...TORN].reverse().map((n, ri) => {
              const i = TORN.length - 1 - ri;
              const t = { duration: TEAR_DUR, delay: TEAR_START + i * TEAR_GAP, ease: EASE_TEAR };
              const side = i % 2 ? 1 : -1;
              return (
                <motion.div
                  key={n}
                  className="absolute inset-0"
                  style={{ transformOrigin: "50% 0%" }}
                  initial={{ rotateX: 0, rotateZ: 0, x: "0cqw", y: "0cqw", opacity: 1 }}
                  animate={{
                    rotateX: [0, LIFT * 28, LIFT * 55],
                    rotateZ: [0, side * 3, side * 34],
                    x: ["0cqw", `${side * 4}cqw`, `${side * 95}cqw`],
                    y: ["0cqw", "10cqw", "70cqw"],
                    opacity: [1, 1, 0],
                  }}
                  transition={{ ...t, times: [0, 0.35, 1] }}
                >
                  <Sheet n={n} />
                </motion.div>
              );
            })}

          {/* 묶음 위쪽 제본 띠와 찢고 남은 종이 자국 */}
          <div aria-hidden className="absolute inset-x-0 top-0 z-20 h-[7cqw] rounded-t-[1cqw]" style={{ background: "linear-gradient(180deg, #3a3d42 0%, #1d1f22 100%)", boxShadow: "0 0.8cqw 1.2cqw rgba(0,0,0,0.35)" }}>
            {[22, 78].map((x) => (
              <span key={x} className="absolute top-[2.2cqw] h-[2.6cqw] w-[9cqw] -translate-x-1/2 rounded-[0.6cqw]" style={{ left: `${x}%`, background: "linear-gradient(180deg, #f2f3f5 0%, #9a9ea6 60%, #5d6168 100%)" }} />
            ))}
          </div>
          <svg aria-hidden viewBox="0 0 100 6" preserveAspectRatio="none" className="absolute inset-x-0 top-[6.8cqw] z-20 h-[2.4cqw] w-full">
            <path d="M0 0 H100 V2 L96 4 L92 2.5 L88 5 L83 2 L79 4.5 L74 2.5 L70 5.5 L65 2 L61 4 L56 2.5 L52 5 L47 2 L43 4.5 L38 2.5 L34 5 L29 2 L25 4 L20 2.5 L16 5.5 L11 2 L7 4 L3 2.5 L0 4 Z" fill="#efeadd" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/** 일력 한 장. 남은 날 숫자 */
function Sheet({ n }: { n: number }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-b-[1.2cqw]"
      style={{
        background: `linear-gradient(180deg, #fbf9f3 0%, ${P.paper} 45%, #ebe5d6 100%)`,
        boxShadow: "inset 0 -0.6cqw 0 rgba(0,0,0,0.06)",
        backfaceVisibility: "hidden",
        color: P.ink,
      }}
    >
      {/* 왼쪽 위에서 비치는 빛 */}
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 20% 20%, rgba(255,255,255,0.7), transparent 70%)" }} />
      {/* 절취선 */}
      <div aria-hidden className="absolute inset-x-[3cqw] top-[11cqw] border-t-[0.5cqw] border-dotted" style={{ borderColor: "#bdb6a4" }} />
      <div className="relative flex h-full flex-col items-center pt-[14cqw]">
        <span className="text-[5cqw] font-bold tracking-[0.2em]" style={{ ...monoF, color: "#5b5e64" }}>
          남은 날
        </span>
        <span className="my-auto pb-[4cqw] text-[52cqw] leading-[0.9] tracking-[-0.04em]" style={sfxF}>
          {n}
        </span>
        <span className="w-full px-[5cqw] pb-[4cqw] text-right text-[4.2cqw] font-bold" style={{ ...monoF, color: "#5b5e64" }}>
          구제신청 기한까지
        </span>
      </div>
    </div>
  );
}

/** 스크롤에 묶여 위로 넘어가는 장. 맨 위 장은 아래 끝이 바람에 살짝 들린다 */
function FlipSheet({ n, i, p, reduce, sway }: { n: number; i: number; p: MotionValue<number>; reduce: boolean; sway: boolean }) {
  const prog = useTransform(p, (v) => clamp01((v - i * FLIP_STEP) / FLIP_LEN));
  const rotateX = useTransform(prog, (t) => LIFT * t * 168);
  const opacity = useTransform(prog, (t) => (t > 0.97 ? 0 : 1));
  const swayDelay = TEAR_START + (TORN.length - 1) * TEAR_GAP + TEAR_DUR + 0.6;
  return (
    <motion.div className="absolute inset-0" style={{ transformOrigin: "50% 0%", rotateX, opacity, transformStyle: "preserve-3d" }}>
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}
        initial={false}
        animate={sway && !reduce ? { rotateX: [0, LIFT * 7, 0, LIFT * 3, 0] } : { rotateX: 0 }}
        transition={sway && !reduce ? { duration: SWAY_LOOP, delay: swayDelay, repeat: Infinity, ease: "easeInOut", times: [0, 0.18, 0.4, 0.55, 0.75] } : { duration: 0 }}
      >
        <Sheet n={n} />
        {/* 종이 뒷면. 넘어가면 숫자 대신 빈 종이가 보인다 */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-t-[1.2cqw]"
          style={{ transform: "rotateX(180deg)", backfaceVisibility: "hidden", background: "linear-gradient(0deg, #f1ede2 0%, #e2dccb 100%)", boxShadow: "inset 0 0 3cqw rgba(0,0,0,0.08)" }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ---------- 1. 부당해고 구제신청 기한 ---------- */

function DeadlineCalc({ today, reduce, onConsult }: { today: Date; reduce: boolean; onConsult: () => void }) {
  const [input, setInput] = useState<string | null>(null);
  const value = input ?? fmtDash(daysAgo(today, 23));
  const fired = parseDash(value);
  const inputId = useId();

  const res = fired ? reliefDeadline(fired) : null;
  const left = res ? daysBetween(today, res.end) : 0;
  const total = res && fired ? Math.max(1, daysBetween(fired, res.end)) : 1;
  const passed = res && fired ? clamp01(daysBetween(fired, today) / total) : 0;
  const future = fired ? fired.getTime() > today.getTime() : false;
  const tone = left < 0 ? "over" : left <= 14 ? "soon" : "ok";

  // 3개월 막대에 달 경계 표시
  const marks =
    fired && res
      ? [1, 2].map((k) => {
          const d = new Date(fired.getFullYear(), fired.getMonth() + k, Math.min(fired.getDate(), new Date(fired.getFullYear(), fired.getMonth() + k + 1, 0).getDate()));
          return { k, f: clamp01(daysBetween(fired, d) / total) };
        })
      : [];

  return (
    <div className="mt-6 grid gap-6 rounded-[6px] border p-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] md:gap-10 md:p-8" style={{ borderColor: C.line, background: C.card }}>
      <div>
        <label htmlFor={inputId} className="text-[16px] font-bold">
          해고일
        </label>
        <input
          id={inputId}
          type="date"
          value={value}
          onChange={(e) => setInput(e.target.value)}
          className={`mt-2 block h-12 w-full rounded-[4px] border px-3 text-[18px] ${focusRing}`}
          style={{ ...monoF, borderColor: C.ink, outlineColor: C.ink }}
        />
        <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
          해고 통지서에 적힌 해고 날짜
        </p>
        <ul className="mt-5 space-y-2 text-[15px] leading-[1.6]">
          {["상시 5인 이상 사업장", "회사 소재지 관할 지방노동위원회에 신청", "마감일이 공휴일이면 다음 날까지"].map((t) => (
            <li key={t} className="flex gap-2">
              <Check size={18} className="mt-0.5 flex-none" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div aria-live="polite">
        {!fired || !res ? (
          <p className="text-[17px] font-bold" style={{ color: C.error }}>
            날짜를 다시 넣어 주세요.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[15px] font-bold" style={{ color: C.muted }}>
                  신청 마감일
                </p>
                <p className="mt-1 text-[30px] leading-tight md:text-[36px]" style={sfxF}>
                  {fmtKo(res.end)}
                </p>
                {res.moved && (
                  <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
                    3개월 되는 날 {fmtKo(res.raw)}이 쉬는 날이라 그다음 평일까지
                  </p>
                )}
              </div>
              <div
                className="rounded-[4px] px-4 py-2 text-right"
                style={{ background: tone === "over" ? C.error : tone === "soon" ? C.yellow : C.gray, color: tone === "soon" ? C.ink : "#fff" }}
              >
                <p className="text-[13px] font-bold">{tone === "over" ? "기한 지남" : "남은 날"}</p>
                <motion.p key={left} initial={reduce ? false : { y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: reduce ? 0 : DUR, ease: EASE }} className="text-[34px] leading-none" style={sfxF}>
                  {left < 0 ? `${-left}일 지남` : left === 0 ? "오늘까지" : `${left}일`}
                </motion.p>
              </div>
            </div>

            {/* 3개월 막대 */}
            <div className="mt-7">
              <div className="relative h-5 text-[13px] font-bold" style={{ ...monoF, color: C.muted }}>
                {marks.map((m) => (
                  <span key={m.k} className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap" style={{ left: `${m.f * 100}%` }}>
                    {m.k}개월
                  </span>
                ))}
              </div>
              <div className="relative mt-1 h-4 rounded-[2px]" style={{ background: "#e7e4db" }}>
                <motion.div
                  className="absolute inset-y-0 left-0 w-full origin-left rounded-[2px]"
                  style={{ background: tone === "over" ? C.error : C.gray }}
                  initial={false}
                  animate={{ scaleX: future ? 0 : passed }}
                  transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
                />
                {marks.map((m) => (
                  <span key={m.k} aria-hidden className="absolute inset-y-[-4px] w-[2px]" style={{ left: `${m.f * 100}%`, background: C.yellowDeep }} />
                ))}
              </div>
              <div className="mt-2 flex justify-between gap-3 text-[14px]" style={{ ...monoF, color: C.muted }}>
                <span className="whitespace-nowrap">해고 {md(fired)}</span>
                {!future && tone !== "over" && <span className="whitespace-nowrap font-bold" style={{ color: C.ink }}>{Math.round(passed * 100)}% 지남</span>}
                <span className="whitespace-nowrap">마감 {md(res.end)}</span>
              </div>
            </div>

            <p className="mt-5 flex items-start gap-2 text-[16px] font-semibold leading-[1.6]">
              {tone === "over" ? <AlertTriangle size={20} className="mt-0.5 flex-none" aria-hidden /> : <Clock size={20} className="mt-0.5 flex-none" aria-hidden />}
              {future
                ? "해고 예정일 기준이에요. 해고 예고를 받았다면 미리 서류부터 모아 두세요."
                : tone === "over"
                  ? "노동위원회 신청 기한은 지났어요. 법원 소송은 따로 낼 수 있으니 상담해 보세요."
                  : tone === "soon"
                    ? "2주 안에 마감이에요. 신청서는 사유만 간단히 먼저 내고 이유서를 나중에 낼 수 있어요."
                    : "해고 통지서, 근로계약서, 급여명세서를 먼저 챙겨 두세요."}
            </p>
            <div className="mt-5">
              <ConsultLink onClick={onConsult} cta="labor-firm_deadline_consult">
                부당해고 상담신청
              </ConsultLink>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- 2. 임금체불 개략 계산 ---------- */

function WageCalc({ reduce, onConsult }: { reduce: boolean; onConsult: () => void }) {
  const [payText, setPayText] = useState("2,600,000");
  const [months, setMonths] = useState(2);
  const [quit, setQuit] = useState(true);
  const [years, setYears] = useState(3);
  const payId = useId();

  const pay = Number(payText.replace(/[^\d]/g, "")) || 0;
  const unpaid = pay * months;
  const severance = quit && years >= 1 ? pay * years : 0;
  const sum = unpaid + severance;
  const max = Math.max(sum, 1);

  const seg = (k: string, label: string, v: number, bg: string, fg: string) =>
    v > 0 && (
      <motion.div
        key={k}
        layout={!reduce}
        className="flex h-full min-w-0 items-center overflow-hidden px-2 text-[13px] font-bold"
        style={{ flexGrow: v / max, flexBasis: 0, background: bg, color: fg }}
        transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
      >
        <span className="truncate">{label}</span>
      </motion.div>
    );

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
      <div className="space-y-5 rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
        <div>
          <label htmlFor={payId} className="text-[15px] font-bold">
            월급(세전)
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              id={payId}
              inputMode="numeric"
              value={payText}
              onChange={(e) => {
                const d = e.target.value.replace(/[^\d]/g, "").slice(0, 9);
                setPayText(d ? Number(d).toLocaleString("ko-KR") : "");
              }}
              className={`h-12 w-full rounded-[4px] border px-3 text-right text-[19px] font-bold ${focusRing}`}
              style={{ ...monoF, borderColor: C.ink, outlineColor: C.ink }}
            />
            <span className="text-[16px] font-bold">원</span>
          </div>
        </div>
        <Stepper label="밀린 달" value={months} set={setMonths} min={1} max={12} unit="개월" />
        <fieldset>
          <legend className="text-[15px] font-bold">지금 상태</legend>
          <div className="mt-2 inline-flex rounded-[4px] border p-1" style={{ borderColor: C.line }}>
            {[
              [true, "퇴직함"],
              [false, "재직 중"],
            ].map(([v, label]) => (
              <button
                key={label as string}
                type="button"
                aria-pressed={quit === v}
                onClick={() => setQuit(v as boolean)}
                className={`rounded-[3px] px-4 py-2 text-[15px] font-bold ${focusRing}`}
                style={{ background: quit === v ? C.gray : "transparent", color: quit === v ? "#fff" : C.ink, outlineColor: C.ink }}
              >
                {label as string}
              </button>
            ))}
          </div>
        </fieldset>
        {quit && <Stepper label="일한 기간" value={years} set={setYears} min={0} max={30} unit="년" />}
      </div>

      <div className="rounded-[6px] p-5 text-white md:p-6" style={{ background: C.gray }} aria-live="polite">
        <dl className="space-y-3 text-[16px]">
          <div className="flex justify-between gap-4">
            <dt>밀린 임금</dt>
            <dd className="font-bold" style={monoF}>
              {won(unpaid)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>퇴직금(개략)</dt>
            <dd className="font-bold" style={monoF}>
              {quit ? (years >= 1 ? won(severance) : "1년 미만이라 없음") : "퇴직 때 계산"}
            </dd>
          </div>
          <div className="flex items-end justify-between gap-4 border-t pt-4" style={{ borderColor: "#4a4d52" }}>
            <dt className="font-bold">받을 돈 합계(개략)</dt>
            <dd className="text-[28px] leading-none md:text-[34px]" style={{ ...sfxF, color: P.yellow }}>
              {won(sum)}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex h-8 overflow-hidden rounded-[3px]" style={{ background: "#3a3d42" }} aria-hidden>
          {seg("u", "임금", unpaid, P.yellow, P.ink)}
          {seg("s", "퇴직금", severance, P.paper, P.ink)}
        </div>
        <p className="mt-4 text-[14px] leading-[1.7]" style={{ color: P.sub }}>
          퇴직금은 평균임금 30일분에 근속 연수를 곱해요. 여기서는 월급으로 바꿔 계산했어요.
          {quit ? " 퇴직하고 14일이 지나도 못 받았다면 그다음 날부터 연 20% 지연이자가 붙어요." : " 일하는 중이라도 월급날을 넘기면 그다음 날부터 연 20% 지연이자가 붙어요."}
        </p>

        <ol className="mt-5 grid gap-2 text-[15px] sm:grid-cols-2">
          {["노동청 진정", "근로감독관 조사", "체불 확인서 발급", "대지급금 신청"].map((s, i) => (
            <li key={s} className="flex items-center gap-2 rounded-[3px] px-3 py-2" style={{ background: "#35373c" }}>
              <span className="grid h-6 w-6 flex-none place-items-center rounded-full text-[13px] font-bold" style={{ background: P.yellow, color: P.ink }}>
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
        <div className="mt-5">
          <button
            type="button"
            onClick={onConsult}
            data-gtm-cta="labor-firm_wage_consult"
            className={`inline-flex items-center gap-1.5 rounded-[4px] px-4 py-2.5 text-[16px] font-bold ${focusRing}`}
            style={{ background: P.yellow, color: P.ink, outlineColor: "#fff" }}
          >
            임금체불 상담신청
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- 3. 노무 자문 요금 ---------- */

function Advisory({ reduce, onConsult }: { reduce: boolean; onConsult: () => void }) {
  const [staff, setStaff] = useState(12);
  const rangeId = useId();
  const idx = tierOf(staff);
  const tier = TIERS[idx];

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-8">
      <div className="rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={rangeId} className="text-[16px] font-bold">
            직원 수
          </label>
          <output htmlFor={rangeId} className="text-[30px] leading-none" style={sfxF}>
            {staff >= 300 ? "300명 이상" : `${staff}명`}
          </output>
        </div>
        <input
          id={rangeId}
          type="range"
          min={1}
          max={300}
          value={staff}
          onChange={(e) => setStaff(Number(e.target.value))}
          className={`mt-4 w-full ${focusRing}`}
          style={{ accentColor: C.gray, outlineColor: C.ink }}
        />
        <div className="mt-1 flex justify-between text-[13px]" style={{ ...monoF, color: C.muted }}>
          <span>1</span>
          <span>300</span>
        </div>

        <table className="mt-5 w-full text-[16px]">
          <caption className="sr-only">직원 수 구간별 월 자문료</caption>
          <thead>
            <tr className="border-b text-left text-[14px]" style={{ borderColor: C.ink, color: C.muted }}>
              <th scope="col" className="py-2 font-bold">
                직원 수
              </th>
              <th scope="col" className="py-2 text-right font-bold">
                월 자문료
              </th>
            </tr>
          </thead>
          <tbody>
            {TIERS.map((t, i) => (
              <tr
                key={t.label}
                className="border-b transition-colors"
                style={{ borderColor: C.line, background: i === idx ? C.yellowSoft : undefined, transitionDuration: reduce ? "0ms" : "200ms" }}
                aria-current={i === idx ? "true" : undefined}
              >
                <td className="py-2.5 pl-2">
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <ChevronRight size={16} aria-hidden style={{ opacity: i === idx ? 1 : 0 }} />
                    {t.label}
                  </span>
                </td>
                <td className="py-2.5 pr-2 text-right font-bold" style={monoF}>
                  {t.fee ? won(t.fee) : "별도 협의"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
          부가세 별도, 1년 계약 기준
        </p>
      </div>

      <div className="flex flex-col rounded-[6px] border-2 p-5 md:p-6" style={{ borderColor: C.ink, background: C.card }} aria-live="polite">
        <p className="text-[15px] font-bold" style={{ color: C.muted }}>
          {tier.label} 사업장
        </p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={idx} initial={reduce ? false : { y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduce ? { opacity: 0 } : { y: -12, opacity: 0 }} transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}>
            <p className="mt-1 text-[38px] leading-tight md:text-[44px]" style={sfxF}>
              {tier.fee ? `월 ${won(tier.fee)}` : "별도 협의"}
            </p>
            <p className="text-[15px]" style={{ ...monoF, color: C.muted }}>
              {tier.fee ? `연 ${won(tier.fee * 12)}` : "현장 방문 후 견적"}
            </p>
          </motion.div>
        </AnimatePresence>
        <ul className="mt-5 space-y-2 text-[16px]">
          {ADVISORY_INCLUDES.map((t) => (
            <li key={t} className="flex gap-2">
              <Check size={18} className="mt-1 flex-none" aria-hidden />
              {t}
            </li>
          ))}
          {staff >= 5 && (
            <li className="flex gap-2">
              <Check size={18} className="mt-1 flex-none" aria-hidden />
              연차, 연장근로 수당 계산 검토
            </li>
          )}
        </ul>
        <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
          급여 아웃소싱은 직원 1명당 월 10,000원을 더해요.
        </p>
        <div className="mt-auto pt-5">
          <ConsultLink onClick={onConsult} cta="labor-firm_advisory_consult">
            자문 견적 상담
          </ConsultLink>
        </div>
      </div>
    </div>
  );
}

/* ---------- 4. 상담신청 ---------- */

type Done = { no: string; name: string; phone: string; topic: string; method: string; date: Date; slot: string; reply: Date };

function ConsultForm({ today, reduce, topic, setTopic }: { today: Date; reduce: boolean; topic: (typeof TOPICS)[number]; setTopic: (t: (typeof TOPICS)[number]) => void }) {
  const days = nextBizDays(today, 5);
  const [method, setMethod] = useState<(typeof METHODS)[number]>("방문 상담");
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<(typeof SLOTS)[number]>(SLOTS[1]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const nameId = useId();
  const phoneId = useId();
  const memoId = useId();
  const agreeId = useId();

  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  const nameOk = name.trim().length >= 2;
  const ok = phoneOk && nameOk && agree;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok) return;
    const d = days[day];
    const seq = 100 + ((name.length * 37 + phone.length * 11) % 900);
    setDone({
      no: `LF-${fmtDash(today).replace(/-/g, "").slice(2)}-${seq}`,
      name: maskName(name),
      phone: maskPhone(phone),
      topic,
      method,
      date: d,
      slot,
      reply: nextBizDays(today, 1)[0],
    });
  };

  const chip = `rounded-[4px] border px-3.5 py-2 text-[15px] font-semibold ${focusRing}`;
  const chipStyle = (on: boolean) => ({ borderColor: on ? C.gray : C.line, background: on ? C.gray : C.card, color: on ? "#fff" : C.ink, outlineColor: C.ink });
  const field = `mt-2 block h-12 w-full rounded-[4px] border px-3 text-[17px] ${focusRing}`;

  return (
    <div className="mt-6 rounded-[6px] border p-5 md:p-8" style={{ borderColor: C.line, background: C.card }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.3, ease: EASE }} role="status">
            <p className="inline-flex items-center gap-2 text-[22px]" style={sfxF}>
              <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: C.yellow, color: C.ink }}>
                <Check size={20} aria-hidden />
              </span>
              상담신청이 접수됐어요
            </p>
            <dl className="mt-5 grid gap-x-6 gap-y-2.5 text-[16px] sm:grid-cols-[auto_1fr]">
              <dt className="font-bold">접수 번호</dt>
              <dd style={monoF}>{done.no}</dd>
              <dt className="font-bold">신청인</dt>
              <dd>
                {done.name} / <span style={monoF}>{done.phone}</span>
              </dd>
              <dt className="font-bold">상담 내용</dt>
              <dd>
                {done.topic}, {done.method}
              </dd>
              <dt className="font-bold">희망 일시</dt>
              <dd>
                {fmtKo(done.date)} {done.slot}
              </dd>
              <dt className="font-bold">담당 창구</dt>
              <dd>
                {KAKAO} 또는 전화{" "}
                <span className="whitespace-nowrap" style={monoF}>
                  {TEL}
                </span>
              </dd>
              <dt className="font-bold">회신 예정</dt>
              <dd>{fmtKo(done.reply)} 오전 중 담당 노무사가 연락드려요</dd>
            </dl>
            <button
              type="button"
              onClick={() => {
                setDone(null);
                setTried(false);
              }}
              className={`mt-6 rounded-[4px] border px-4 py-2.5 text-[15px] font-bold ${focusRing}`}
              style={{ borderColor: C.ink, outlineColor: C.ink }}
            >
              새로 신청하기
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={false} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }} className="grid gap-6 md:grid-cols-2 md:gap-x-10">
            <fieldset className="md:col-span-2">
              <legend className="text-[16px] font-bold">상담 분야</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button key={t} type="button" aria-pressed={topic === t} onClick={() => setTopic(t)} className={chip} style={chipStyle(topic === t)}>
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-[16px] font-bold">상담 방법</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {METHODS.map((m) => (
                  <button key={m} type="button" aria-pressed={method === m} onClick={() => setMethod(m)} className={chip} style={chipStyle(method === m)}>
                    {m}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-[16px] font-bold">시간대</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {SLOTS.map((s) => (
                  <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)} className={chip} style={{ ...chipStyle(slot === s), ...monoF }}>
                    {s}
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
                    <span className="block text-[15px] font-bold sm:text-[18px]" style={monoF}>
                      {d.getMonth() + 1}.{d.getDate()}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor={nameId} className="text-[16px] font-bold">
                이름
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
              <input id={phoneId} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={field} style={{ ...monoF, borderColor: tried && !phoneOk ? C.error : C.line, outlineColor: C.ink }} aria-invalid={tried && !phoneOk} />
              {tried && !phoneOk && (
                <p className="mt-1 text-[14px] font-semibold" style={{ color: C.error }}>
                  휴대폰 번호를 확인해 주세요.
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label htmlFor={memoId} className="text-[16px] font-bold">
                상담 내용(선택)
              </label>
              <textarea id={memoId} value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} className={`mt-2 block w-full rounded-[4px] border px-3 py-2.5 text-[16px] ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.ink }} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-2">
              <label htmlFor={agreeId} className="inline-flex cursor-pointer items-center gap-2 text-[15px]">
                <input id={agreeId} type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`h-5 w-5 ${focusRing}`} style={{ accentColor: C.gray, outlineColor: C.ink }} />
                개인정보 수집 및 이용 동의(필수)
                {tried && !agree && (
                  <span className="font-semibold" style={{ color: C.error }}>
                    동의가 필요해요
                  </span>
                )}
              </label>
              <button
                type="submit"
                data-gtm-cta="labor-firm_consult_submit"
                className={`inline-flex items-center gap-2 rounded-[4px] px-6 py-3 text-[17px] font-bold ${focusRing}`}
                style={{ background: C.yellow, color: C.ink, outlineColor: C.ink }}
              >
                <CalendarCheck size={20} aria-hidden />
                상담신청
              </button>
            </div>
            <p className="text-[14px] md:col-span-2" style={{ color: C.muted }}>
              첫 상담 30분 무료, 상담 내용은 담당 노무사만 봐요.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
