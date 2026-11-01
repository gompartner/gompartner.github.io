"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  CalendarCheck,
  CalendarClock,
  Check,
  ChevronRight,
  FileText,
  HardHat,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  ShieldAlert,
  Users,
  Wallet,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 노무법인 홈페이지 샘플: 가상의 곰파트너 노무법인. 근로자 사건(부당해고, 임금체불, 산재)과 사업장 노무 자문을 함께 한다.
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
   퇴직금은 1년 이상 일했을 때 평균임금 30일분 x 근속 연수다.

   사진 출처: Pexels 사진 6814526, 직원 사진과 근로자 칸 현장 사진은 AI 생성(Z-Image-Turbo)

   첫 화면(lf-poster): 상단 메뉴(휴대폰은 가로로 미는 메뉴) 아래 사업주, 근로자 두 갈래 입구를 고정 2단으로 둔다.
   칸마다 위에 사진, 아래 업무 5줄과 갈래별 상담신청 버튼. 휴대폰은 두 칸을 위아래로 쌓는다.
   업무 줄은 아래 안내 구간으로 이어진다(부당해고는 구제신청 안내, 임금체불과 퇴직금은 체불 안내, 사업주 업무는 자문 요금,
   산재와 괴롭힘은 상담신청 분야 미리 선택). 실제 노무법인 사이트(사업주, 근로자 상담 분리)의 방식을 따랐다.

   구간: 업무분야, 부당해고 구제신청 안내, 임금체불과 퇴직금 안내, 직원 수 구간별 자문료 표, 노무사 소개,
   상담신청(분야, 방법, 희망일, 시간대, 이름, 연락처. 완료 화면에 접수 번호, 담당 창구, 회신 예정일), 오시는 길, 공지사항. */

const IMG = "/images/demo-labor-firm";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 노무법인";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 5층";

/* 본문 색 */
const C = {
  bg: "#ffffff",
  soft: "#f7f7f5",
  card: "#ffffff",
  ink: "#111111",
  body: "#4b4b4b",
  /** 고른 칩, 보조 버튼에 쓰는 먹색 */
  gray: "#222222",
  /** 강조색 하나. 채도를 낮춘 황토색 */
  accent: "#7a6223",
  accentSoft: "#f5f1e6",
  muted: "#767676",
  line: "#e5e5e5",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

/* ---------- 날짜 ---------- */

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

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
const ADVISORY_INCLUDES = ["전화, 카카오톡 노무 상담 횟수 제한 없음", "근로계약서, 취업규칙 검토", "징계, 해고 절차 자문", "연차, 연장근로 수당 계산 검토", "노동청 점검 대응"];

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

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.ink }}>
      <Poster go={go} consult={consult} />


      {/* 업무분야 */}
      <section id="lf-areas" aria-labelledby="lf-areas-title" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pt-10 md:px-6 md:pt-14">
        <h2 id="lf-areas-title" className="text-[26px] font-bold leading-tight md:text-[32px]">
          업무분야
        </h2>
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
        <SectionTitle id="lf-deadline-title" icon={<CalendarClock size={24} aria-hidden />} title="부당해고 구제신청" />
        <ReliefGuide onConsult={() => consult("부당해고")} />
      </section>

      <section id="lf-wage" aria-labelledby="lf-wage-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="lf-wage-title" icon={<Wallet size={24} aria-hidden />} title="임금체불, 퇴직금" />
        <WageGuide onConsult={() => consult("임금체불")} />
      </section>

      <section id="lf-advisory" aria-labelledby="lf-advisory-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="lf-advisory-title" icon={<Briefcase size={24} aria-hidden />} title="사업장 노무 자문" />
        <Advisory onConsult={() => consult("노무 자문")} />
      </section>

      <section id="lf-people" aria-labelledby="lf-people-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="lf-people-title" icon={<Scale size={24} aria-hidden />} title="노무사 소개" />
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            { name: "김ㅎ늘", role: "대표 공인노무사", areas: "부당해고, 직장 내 괴롭힘, 징계 자문", photo: `${IMG}/staff-1.jpg` },
            { name: "박ㅈ민", role: "공인노무사", areas: "임금체불, 산재, 급여 아웃소싱", photo: `${IMG}/staff-2.jpg` },
          ].map((p) => (
            <li key={p.name} className="flex items-center gap-4 rounded-[6px] border p-5" style={{ borderColor: C.line, background: C.card }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
              <img
                src={p.photo}
                alt={`${p.name} ${p.role}`}
                width={64}
                height={77}
                loading="lazy"
                className="h-[77px] w-16 flex-none rounded-[4px] object-cover"
                style={{ objectPosition: "50% 20%", background: C.soft }}
              />
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
                    <span className="tabular-nums">{h.time}</span>
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
                <span className="flex-none text-[14px]" style={{ color: C.muted }}>
                  {fmtDash(daysAgo(today, n.d))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="mt-16 px-4 pb-28 pt-10 text-[14px] leading-[1.8] md:px-6" style={{ background: C.soft, color: C.muted, borderTop: `1px solid ${C.line}` }}>
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[17px] font-bold" style={{ color: C.ink }}>
            <SampleLogo size={18} />
          </p>
          <p>
            {ADDRESS} / 대표번호 {TEL} / {KAKAO}
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
    <h2 id={id} className="flex items-center gap-2.5 text-[26px] font-bold leading-tight tracking-[-0.02em] md:text-[32px]">
      <span className="flex-none" style={{ color: C.accent }}>
        {icon}
      </span>
      {title}
    </h2>
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

/* ---------- 첫 화면: 사업주, 근로자 두 갈래 ---------- */

type Branch = "biz" | "worker";
type Topic = (typeof TOPICS)[number];
type Row = { name: string; meta?: string; to: string; topic?: Topic };

const BRANCHES: Record<Branch, { label: string; sub: string; photo: string; srcSet?: string; alt: string; pos: string; caption: string; cta: Topic; rows: Row[] }> = {
  biz: {
    label: "사업주",
    sub: "사업장 노무 자문",
    photo: `${IMG}/hero.jpg`,
    srcSet: `${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`,
    alt: "회의 탁자에서 펜을 든 손으로 서류를 검토하는 모습",
    pos: "62% 50%",
    caption: "담당 김ㅎ늘 대표 공인노무사",
    cta: "노무 자문",
    rows: [
      { name: "인사노무 자문", meta: "월 150,000원부터", to: "lf-advisory" },
      { name: "급여 아웃소싱", to: "lf-advisory" },
      { name: "4대보험 관리", to: "lf-advisory" },
      { name: "취업규칙 정비", to: "lf-advisory" },
      { name: "근로감독 대응", to: "lf-advisory" },
    ],
  },
  worker: {
    label: "근로자",
    sub: "근로자 사건",
    photo: `${IMG}/worker.jpg`,
    alt: "공장 안에서 흰 안전모와 회색 작업복을 입은 근로자",
    pos: "60% 30%",
    caption: "담당 박ㅈ민 공인노무사",
    cta: "부당해고",
    rows: [
      { name: "부당해고", meta: "해고일부터 3개월", to: "lf-deadline" },
      { name: "임금체불", meta: "퇴직 후 14일", to: "lf-wage" },
      { name: "산업재해", to: "lf-consult", topic: "산재" },
      { name: "직장 내 괴롭힘", to: "lf-consult", topic: "직장 내 괴롭힘" },
      { name: "퇴직금", meta: "1년 이상 근무", to: "lf-wage" },
    ],
  },
};

const MENU: [string, string][] = [
  ["lf-areas", "업무분야"],
  ["lf-people", "구성원"],
  ["lf-advisory", "노무 자문"],
  ["lf-consult", "상담신청"],
  ["lf-visit", "오시는 길"],
];

function Poster({ go, consult }: { go: (id: string) => void; consult: (t: Topic) => void }) {
  const open = (r: Row) => (r.topic ? consult(r.topic) : go(r.to));

  return (
    <section id="lf-poster" aria-labelledby="lf-poster-title" style={{ background: C.bg, color: C.ink }}>
      {/* 상단 메뉴 */}
      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-2 md:px-6 md:py-3">
          <p className="inline-flex min-h-11 items-center text-[20px] font-bold leading-none">
            <SampleLogo />
          </p>
          <nav aria-label="주요 메뉴" className="hidden items-center lg:flex">
            {MENU.map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={`min-h-11 rounded-[4px] px-3 text-[16px] font-semibold underline-offset-4 hover:underline ${focusRing}`} style={{ outlineColor: C.accent }}>
                {label}
              </button>
            ))}
          </nav>
          <a
            href={`tel:${TEL.replace(/-/g, "")}`}
            data-gtm-cta="labor-firm_gnb_tel"
            aria-label={`대표번호 ${TEL}`}
            className={`inline-flex min-h-11 min-w-11 flex-none items-center justify-center gap-2 rounded-[4px] px-3 text-[16px] font-bold tabular-nums ${focusRing}`}
            style={{ background: C.accent, color: "#fff", outlineColor: C.accent }}
          >
            <Phone size={18} aria-hidden />
            <span className="hidden sm:inline">{TEL}</span>
          </a>
        </div>
        {/* 휴대폰, 태블릿 메뉴는 가로로 밀어 본다 */}
        <nav aria-label="주요 메뉴" className="flex overflow-x-auto border-t px-2 lg:hidden" style={{ borderColor: C.line, scrollbarWidth: "none" }}>
          {MENU.map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={`min-h-11 flex-none whitespace-nowrap px-3 text-[15px] font-semibold ${focusRing}`} style={{ outlineColor: C.accent }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-6 md:px-6 md:pb-14 md:pt-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h1 id="lf-poster-title" className="text-[28px] font-bold md:text-[40px]" style={{ letterSpacing: "-0.03em", lineHeight: 1.25, wordBreak: "keep-all" }}>
            해고, 임금체불, 산재 공인노무사 상담
          </h1>
          <p className="text-[16px]" style={{ color: C.muted }}>
            부당해고 구제신청, 지방노동위원회
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2 lg:gap-6">
          {(["biz", "worker"] as Branch[]).map((b) => {
            const d = BRANCHES[b];
            return (
              <div key={b} className="flex min-w-0 flex-col overflow-hidden rounded-[6px] border" style={{ borderColor: C.line }}>
                <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:h-[clamp(170px,24vh,250px)]" style={{ background: C.soft }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                  <img
                    src={d.photo}
                    srcSet={d.srcSet}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    alt={d.alt}
                    fetchPriority={b === "biz" ? "high" : undefined}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: d.pos }}
                  />
                </div>
                <div className="flex flex-1 flex-col p-4 md:p-6">
                  <h2 className="flex min-h-11 items-center justify-between gap-3">
                    <span className="text-[24px] font-bold tracking-[-0.02em]">{d.label}</span>
                    <span className="text-[15px] font-semibold" style={{ color: C.muted }}>
                      {d.sub}
                    </span>
                  </h2>
                  <p className="text-[14px]" style={{ color: C.muted }}>
                    {d.caption}
                  </p>
                  <ul className="mt-3 border-t" style={{ borderColor: C.ink }}>
                    {d.rows.map((r) => (
                      <li key={r.name} className="border-b" style={{ borderColor: C.line }}>
                        <button
                          type="button"
                          onClick={() => open(r)}
                          className={`flex min-h-12 w-full items-center justify-between gap-3 py-2 text-left hover:bg-[#f7f7f5] ${focusRing}`}
                          style={{ outlineColor: C.ink }}
                        >
                          <span className="min-w-0 text-[17px] font-semibold">{r.name}</span>
                          <span className="inline-flex flex-none items-center gap-1 text-[14px]" style={{ color: C.muted }}>
                            {r.meta}
                            <ChevronRight size={17} aria-hidden />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => consult(d.cta)}
                    data-gtm-cta={`labor-firm_poster_${b}`}
                    className={`mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] px-4 text-[16px] font-bold text-white ${focusRing}`}
                    style={{ background: b === "biz" ? C.gray : C.accent, outlineColor: C.ink }}
                  >
                    <CalendarCheck size={18} aria-hidden />
                    {d.label} 상담신청
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- 1. 부당해고 구제신청 안내 ---------- */

const RELIEF_FACTS: [string, string][] = [
  ["신청 기한", "해고가 있었던 날부터 3개월 안. 마지막 날이 토요일이나 공휴일이면 그다음 날까지"],
  ["신청하는 곳", "사업장 소재지 지방노동위원회"],
  ["대상", "상시 근로자 5인 이상 사업장"],
  ["처리 기간", "접수부터 판정까지 보통 60일 안팎"],
];

const RELIEF_STEPS: [string, string][] = [
  ["구제신청서 제출", "해고 경위와 증거를 정리해 지방노동위원회에 냅니다."],
  ["이유서, 답변서 교환", "회사 답변서를 받아 반박 서면을 준비합니다."],
  ["조사관 조사", "양쪽 주장을 확인하고 화해를 권하기도 합니다."],
  ["심문회의, 판정", "공익위원 앞에서 진술하고 당일 판정을 받습니다."],
];

function InfoTable({ caption, rows }: { caption: string; rows: [string, string][] }) {
  return (
    <table className="w-full text-[16px]">
      <caption className="sr-only">{caption}</caption>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b" style={{ borderColor: C.line }}>
            <th scope="row" className="w-[34%] py-3 pr-3 text-left align-top font-bold">
              {k}
            </th>
            <td className="py-3 align-top" style={{ color: C.body }}>
              {v}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StepList({ steps }: { steps: [string, string][] }) {
  return (
    <ol className="grid gap-3">
      {steps.map(([t, d], i) => (
        <li key={t} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full border text-[15px] font-bold tabular-nums" style={{ borderColor: C.ink }}>
            {i + 1}
          </span>
          <span>
            <span className="block text-[17px] font-bold">{t}</span>
            <span className="mt-0.5 block text-[15px]" style={{ color: C.muted }}>
              {d}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

function ReliefGuide({ onConsult }: { onConsult: () => void }) {
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-8">
      <div className="rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
        <div className="border-t" style={{ borderColor: C.ink }}>
          <InfoTable caption="부당해고 구제신청 기본 사항" rows={RELIEF_FACTS} />
        </div>
        <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
          근로기준법 제28조, 민법 제161조
        </p>
      </div>
      <div className="flex flex-col rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
        <h3 className="text-[18px] font-bold">진행 절차</h3>
        <div className="mt-4">
          <StepList steps={RELIEF_STEPS} />
        </div>
        <div className="mt-auto pt-6">
          <ConsultLink onClick={onConsult} cta="labor-firm_deadline_consult">
            부당해고 상담신청
          </ConsultLink>
        </div>
      </div>
    </div>
  );
}

/* ---------- 2. 임금체불, 퇴직금 안내 ---------- */

const WAGE_FACTS: [string, string][] = [
  ["퇴직 후 지급 기한", "퇴직한 날부터 14일 안에 임금, 퇴직금 지급"],
  ["지연이자", "14일이 지나면 연 20%. 2025년 10월 23일부터는 재직 중 밀린 임금도 같은 이자"],
  ["퇴직금", "1년 이상 근무, 주 15시간 이상. 평균임금 30일분 x 근속 연수"],
  ["임금채권 시효", "받을 날부터 3년"],
];

const WAGE_STEPS: [string, string][] = [
  ["노동청 진정", "체불 기간과 금액, 근로계약서와 급여 내역을 정리해 냅니다."],
  ["근로감독관 조사", "출석 조사에서 근무 사실과 체불액을 확인합니다."],
  ["체불 확인서 발급", "확인된 체불액으로 대지급금이나 민사 절차를 밟습니다."],
  ["대지급금, 소송", "회사가 지급하지 못하면 대지급금 신청이나 소송으로 받습니다."],
];

function WageGuide({ onConsult }: { onConsult: () => void }) {
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-8">
      <div className="rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
        <div className="border-t" style={{ borderColor: C.ink }}>
          <InfoTable caption="임금체불, 퇴직금 기본 사항" rows={WAGE_FACTS} />
        </div>
        <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
          근로기준법 제36조, 제37조, 제49조, 근로자퇴직급여 보장법 제8조
        </p>
      </div>
      <div className="flex flex-col rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
        <h3 className="text-[18px] font-bold">진행 절차</h3>
        <div className="mt-4">
          <StepList steps={WAGE_STEPS} />
        </div>
        <div className="mt-auto pt-6">
          <ConsultLink onClick={onConsult} cta="labor-firm_wage_consult">
            임금체불 상담신청
          </ConsultLink>
        </div>
      </div>
    </div>
  );
}

/* ---------- 3. 노무 자문 ---------- */

function Advisory({ onConsult }: { onConsult: () => void }) {
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-8">
      <div className="rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
        <div className="md:hidden">
          <p className="flex justify-between gap-3 border-b py-2 text-[14px] font-bold" style={{ borderColor: C.ink, color: C.muted }}>
            <span>직원 수</span>
            <span>월 자문료</span>
          </p>
          <ul>
            {TIERS.map((t) => (
              <li key={`m${t.label}`} className="flex items-baseline justify-between gap-3 border-b py-2.5" style={{ borderColor: C.line }}>
                <span className="min-w-0 font-semibold">{t.label}</span>
                <span className="whitespace-nowrap font-bold tabular-nums">{t.fee ? won(t.fee) : "별도 협의"}</span>
              </li>
            ))}
          </ul>
        </div>
        <table className="hidden w-full text-[16px] md:table">
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
            {TIERS.map((t) => (
              <tr key={t.label} className="border-b" style={{ borderColor: C.line }}>
                <td className="py-2.5 font-semibold">{t.label}</td>
                <td className="whitespace-nowrap py-2.5 text-right font-bold tabular-nums">{t.fee ? won(t.fee) : "별도 협의"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
          부가세 별도, 1년 계약 기준. 급여 아웃소싱은 직원 1명당 월 10,000원을 더합니다.
        </p>
      </div>

      <div className="flex flex-col rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
        <h3 className="text-[18px] font-bold">자문 계약에 들어가는 일</h3>
        <ul className="mt-4 space-y-2 text-[16px]">
          {ADVISORY_INCLUDES.map((t) => (
            <li key={t} className="flex gap-2">
              <Check size={18} className="mt-1 flex-none" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
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
            <p className="inline-flex items-center gap-2 text-[22px] font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: C.accent, color: "#ffffff" }}>
                <Check size={20} aria-hidden />
              </span>
              상담신청이 접수됐어요
            </p>
            <dl className="mt-5 grid gap-x-6 gap-y-2.5 text-[16px] sm:grid-cols-[auto_1fr]">
              <dt className="font-bold">접수 번호</dt>
              <dd className="tabular-nums">{done.no}</dd>
              <dt className="font-bold">신청인</dt>
              <dd>
                {done.name} / <span className="tabular-nums">{done.phone}</span>
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
                <span className="whitespace-nowrap tabular-nums">
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
                  <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)} className={chip} style={{ ...chipStyle(slot === s) }}>
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
                    <span className="block text-[15px] font-bold sm:text-[18px] tabular-nums">
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
              <input id={phoneId} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={field} style={{ borderColor: tried && !phoneOk ? C.error : C.line, outlineColor: C.ink }} aria-invalid={tried && !phoneOk} />
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
                style={{ background: C.accent, color: "#ffffff", outlineColor: C.accent }}
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

function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#fff" : "#111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          노무법인
        </span>
      </span>
    </span>
  );
}
