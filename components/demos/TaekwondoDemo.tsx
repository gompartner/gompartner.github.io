"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Bus, CalendarCheck, Check, Clock, MapPin, Menu, MessageCircle, Phone, ShieldCheck, Users, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 태권도장 홈페이지 샘플: 가상의 태권도장 곰파트너. 유치부, 초등부, 중고등부, 성인부를 가르친다.
   상호, 관장과 사범 이름, 주소, 전화번호, 학교와 아파트 이름, 손님 이름은 모두 가상이다.
   첫 화면 사진 출처: AI 생성(Z-Image-Turbo, Apache 2.0)

   국내 태권도장 사이트 공통 구성(참고): 메뉴는 도장 소개, 관장 인사말, 수련 프로그램(유치부, 초등부, 중고등부, 성인부),
   수련 시간표, 차량 운행, 승급 심사, 공지사항, 상담 문의, 오시는 길. 학부모가 제일 먼저 찾는 건 차량 운행 노선과
   탑승 시간이라 첫 화면 가까이에 둔다. 요일별 수련 내용(품새, 발차기, 겨루기, 줄넘기, 태권체조)과 월 수련비,
   어린이 통학버스 신고와 보호자 동승, 체험 수업 1회 무료 같은 문구를 그대로 쓴다.

   첫 화면(tk-poster)은 흰 도복에 검은 띠를 맨 수련생 사진과 평일 수련 시간, 차량 정류장 목록.
   들어올 때 사진만 1.06배에서 1배로 천천히 다가온다(CSS keyframes). 동작 줄이기면 멈춘 상태로 둔다.

   구성
   1. 차량 운행: 호차별 정류장 표, 부마다 등원 탑승 시간.
   2. 부별 시간표: 요일별 수련 내용 표와 부별 월 수련비 표.
   3. 승급 심사: 띠별 다음 띠, 심사 품새, 항목, 수련 기간 표와 심사 일정.
   4. 상담 신청: 구분, 상담 방법, 차량 이용, 희망일, 보호자 이름과 연락처. 완료 화면에 접수 번호, 담당 창구, 회신 예정일. */

const BRAND = "태권도장";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 태권도장";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 2층";
const IMG = "/images/demo-taekwondo";

/* 색. 바탕은 흰색과 옅은 회색을 번갈아 쓰고 강조색은 짙은 빨강 하나 */
const STAFF = [
  { id: "1", name: "정ㄷ현", role: "관장", note: "공인 6단, 국기원 사범 자격, 지도 18년" },
  { id: "2", name: "한ㅅ우", role: "사범", note: "공인 4단, 초등부 담당, 차량 운행 동승" },
  { id: "3", name: "오ㅈ민", role: "사범", note: "공인 4단, 품새 선수 출신, 유치부 담당" },
];

const C = {
  bg: "#ffffff",
  paper: "#f7f7f5",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  accent: "#9b2c2c",
  accentSoft: "#f6eeee",
  dark: "#141414",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 완료 화면 전환 */
const DUR = 0.35;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const hm = (m: number) => `${Math.floor(m / 60)}:${p2(m % 60)}`;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

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
/** 수업 시작 몇 분 전에 도장에 내리는지, 수업 끝나고 몇 분 뒤 출발하는지 */
const ARRIVE_BEFORE = 8;
const LEAVE_AFTER = 5;

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

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.ink }}>
      <Poster reduce={reduce} go={go} />

      {/* 관장, 사범 */}
      <section id="tk-staff" aria-labelledby="tk-staff-title" className="scroll-mt-0 py-14 md:py-20" style={{ background: C.paper }}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <SectionTitle id="tk-staff-title" icon={<Users size={24} aria-hidden />} title="관장, 사범" />
          <ul className="grid gap-8 sm:grid-cols-3 md:gap-6">
            {STAFF.map((t) => (
              <li key={t.id}>
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                <img src={`${IMG}/staff-${t.id}.jpg`} alt={`${t.role} ${t.name}`} className="block aspect-[4/5] w-full rounded-[8px] object-cover" />
                <p className="mt-3 text-[18px] font-bold" style={{ color: C.ink }}>
                  {t.name} <span className="text-[15px] font-semibold" style={{ color: C.muted }}>{t.role}</span>
                </p>
                <p className="mt-1 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
                  {t.note}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 차량 운행 */}
      <section id="tk-bus" aria-labelledby="tk-bus-title" className="scroll-mt-0 py-14 md:py-20" style={{ background: C.bg }}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <SectionTitle id="tk-bus-title" icon={<Bus size={24} aria-hidden />} title="차량 운행" />
          <BusRoute />
        </div>
      </section>

      {/* 시간표 */}
      <section id="tk-time" aria-labelledby="tk-time-title" className="scroll-mt-0 py-14 md:py-20" style={{ background: C.paper }}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <SectionTitle id="tk-time-title" icon={<Clock size={24} aria-hidden />} title="수련 시간표" />
          <Timetable />
        </div>
      </section>

      {/* 승급 심사 */}
      <section id="tk-belt" aria-labelledby="tk-belt-title" className="scroll-mt-0 py-14 md:py-20" style={{ background: C.bg }}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <SectionTitle id="tk-belt-title" icon={<Award size={24} aria-hidden />} title="승급 심사" />
          <BeltTest />
        </div>
      </section>

      {/* 상담 */}
      <section id="tk-consult" aria-labelledby="tk-consult-title" className="scroll-mt-0 py-14 md:py-20" style={{ background: C.paper }}>
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <SectionTitle id="tk-consult-title" icon={<MessageCircle size={24} aria-hidden />} title="상담 문의" />
          <ConsultForm today={today} reduce={reduce} part={part} setPart={setPart} busPick={busPick} setBusPick={setBusPick} />
        </div>
      </section>

      {/* 오시는 길과 공지사항 */}
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 md:grid-cols-2 md:gap-8 md:px-6 md:py-20">
        <section id="tk-visit" aria-labelledby="tk-visit-title" className="scroll-mt-4">
          <SectionTitle id="tk-visit-title" icon={<MapPin size={24} aria-hidden />} title="오시는 길" />
          <dl className="grid grid-cols-[88px_minmax(0,1fr)] gap-y-3 text-[16px] leading-[1.6]">
            <dt className="font-semibold">주소</dt>
            <dd style={{ color: C.body }}>{ADDRESS}</dd>
            <dt className="font-semibold">수련 시간</dt>
            <dd style={{ color: C.body }}>평일 13:30 ~ 21:30, 토요일 성인부 10:00</dd>
            <dt className="font-semibold">주차</dt>
            <dd style={{ color: C.body }}>건물 뒤 2대 주차 가능</dd>
            <dt className="font-semibold">전화</dt>
            <dd>
              <a href={`tel:${TEL.replace(/-/g, "")}`} className={`font-semibold underline underline-offset-4 ${focusRing}`} style={{ outlineColor: C.ink }}>
                {TEL}
              </a>
            </dd>
          </dl>
        </section>
        <section id="tk-notice" aria-labelledby="tk-notice-title" className="scroll-mt-4">
          <SectionTitle id="tk-notice-title" icon={<CalendarCheck size={24} aria-hidden />} title="공지사항" />
          <ul className="divide-y border-y" style={{ borderColor: C.line }}>
            {[
              [daysAgo(today, 2), "이번 달 승급 심사 신청 받아요"],
              [daysAgo(today, 9), "2호차 ㅇㄹ빌라 정류장 추가"],
              [daysAgo(today, 16), "겨울방학 오전반 미리 신청"],
            ].map(([d, t]) => (
              <li key={t as string} className="flex items-baseline justify-between gap-4 py-3 text-[16px]" style={{ borderColor: C.line }}>
                <span className="min-w-0 font-medium">{t as string}</span>
                <span className="flex-none text-[14px] tabular-nums" style={{ color: C.muted }}>
                  {(d as Date).getMonth() + 1}.{p2((d as Date).getDate())}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="px-4 pb-28 pt-10 text-[14px] leading-[1.8] md:px-6" style={{ background: C.dark, color: "#bdbdbd" }}>
        <div className="mx-auto max-w-[1200px]">
          <p>
            <SampleLogo light size={18} />
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
    <h2 id={id} className="mb-6 flex items-center gap-2.5 text-[26px] font-bold leading-tight tracking-[-0.02em] md:text-[32px]">
      {icon}
      {title}
    </h2>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  const mark = size + 8;
  return (
    <span className="inline-flex items-center gap-2 leading-none" style={{ color: light ? "#fff" : "#111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          태권도장
        </span>
      </span>
    </span>
  );
}

function chipStyle(on: boolean) {
  return on ? { background: C.accent, color: "#fff", borderColor: C.accent, outlineColor: C.ink } : { background: "#fff", color: C.ink, borderColor: C.line, outlineColor: C.ink };
}
const chip = `inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] border px-3.5 text-[15px] font-semibold ${focusRing}`;

/* ---------- 첫 화면: 평일 수련 시간과 차량 정류장 ---------- */

const NAV: [string, string][] = [
  ["tk-staff", "도장 소개"],
  ["tk-time", "수련 시간표"],
  ["tk-bus", "차량 안내"],
  ["tk-belt", "승급 심사"],
  ["tk-notice", "학부모 공지"],
  ["tk-consult", "상담 문의"],
];

function Poster({ reduce, go }: { reduce: boolean; go: (id: string) => void }) {
  const [menu, setMenu] = useState(false);

  const navTo = (id: string) => {
    setMenu(false);
    // 메뉴가 닫혀 높이가 줄어든 뒤에 이동한다
    requestAnimationFrame(() => go(id));
  };

  return (
    <section id="tk-poster" aria-labelledby="tk-poster-title" style={{ background: C.bg }}>
      <style>{`
        @keyframes tk-in { from { transform: scale(1.06); } to { transform: none; } }
        .tk-in { animation: tk-in 1.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) { .tk-in { animation: none; } }
      `}</style>

      {/* 상단 메뉴 */}
      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 md:px-6">
          <p>
            <SampleLogo size={18} />
          </p>
          <nav aria-label="주요 메뉴" className="hidden items-center lg:flex">
            {NAV.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => navTo(id)}
                className={`min-h-[44px] rounded-[4px] px-3 text-[16px] font-semibold underline-offset-4 hover:underline ${focusRing}`}
                style={{ color: C.ink, outlineColor: C.ink }}
              >
                {label}
              </button>
            ))}
          </nav>
          <a
            href={`tel:${TEL.replace(/-/g, "")}`}
            className={`hidden min-h-[44px] items-center gap-1.5 rounded-[6px] px-3 text-[16px] font-bold tabular-nums lg:inline-flex ${focusRing}`}
            style={{ color: C.ink, outlineColor: C.ink }}
          >
            <Phone size={17} aria-hidden />
            {TEL}
          </a>
          <button
            type="button"
            aria-expanded={menu}
            aria-controls="tk-menu"
            aria-label={menu ? "전체 메뉴 닫기" : "전체 메뉴 열기"}
            onClick={() => setMenu((m) => !m)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-[6px] border lg:hidden ${focusRing}`}
            style={{ borderColor: C.line, outlineColor: C.ink }}
          >
            {menu ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
        {menu && (
          <nav id="tk-menu" aria-label="전체 메뉴" className="border-t lg:hidden" style={{ borderColor: C.line }}>
            <ul className="mx-auto grid max-w-[1440px] grid-cols-2 gap-1 px-4 py-3 md:grid-cols-3 md:px-6">
              {NAV.map(([id, label]) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => navTo(id)}
                    className={`flex min-h-[48px] w-full items-center rounded-[6px] px-3 text-left text-[16px] font-semibold ${focusRing}`}
                    style={{ background: C.paper, outlineColor: C.ink }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <div className="mx-auto grid max-w-[1440px] lg:min-h-[calc(100svh-64px)] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* 세로 수련 사진 */}
        <div className="relative h-[30svh] min-h-[200px] overflow-hidden lg:h-auto" style={{ background: C.dark }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="(min-width: 1024px) 40vw, 100vw"
            alt="흰 도복에 검은 띠를 맨 수련생과 뒤로 보이는 파랑, 빨강 도장 매트"
            fetchPriority="high"
            className={`absolute inset-0 h-full w-full object-cover ${reduce ? "" : "tk-in"}`}
            style={{ objectPosition: "50% 35%" }}
          />
        </div>

        {/* 학부모 보드 */}
        <div className="px-4 pb-10 pt-6 md:px-8 md:pt-8 lg:px-12 lg:pb-12 lg:pt-10">
          <h1 id="tk-poster-title" className="text-[30px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[40px]" style={{ wordBreak: "keep-all" }}>
            학교 앞까지 차량 운행
          </h1>
          <p className="mt-2 text-[16px]" style={{ color: C.body }}>
            1호차, 2호차 평일 매일 운행
          </p>

          <div className="mt-6 rounded-[8px] border" style={{ borderColor: C.line }}>
            <h2 className="border-b px-4 py-3 text-[17px] font-bold" style={{ borderColor: C.line, background: C.paper }}>
              평일 수련 시간
            </h2>
            <ul className="divide-y" style={{ borderColor: C.line }}>
              {ROWS.map((r) => (
                <li key={r.label} className="flex min-h-[44px] items-center justify-between gap-3 px-4 py-2" style={{ borderColor: C.line }}>
                  <span className="text-[16px] font-bold">{r.label}</span>
                  <span className="text-[15px] tabular-nums" style={{ color: C.body }}>
                    {r.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h2 className="flex items-center gap-2 text-[17px] font-bold">
              <Bus size={19} aria-hidden />
              차량 정류장
            </h2>
            <dl className="mt-3 grid grid-cols-[52px_minmax(0,1fr)] gap-x-2 gap-y-2 text-[15px] leading-[1.6]">
              {ROUTES.map((r) => (
                <div key={r.id} className="contents">
                  <dt className="font-bold" style={{ color: C.muted }}>
                    {r.label}
                  </dt>
                  <dd style={{ color: C.body }}>
                    {r.stops
                      .slice(0, -1)
                      .map((st) => st.name)
                      .join(", ")}
                  </dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={() => go("tk-bus")} className={`mt-3 ${chip}`} style={chipStyle(false)}>
              <MapPin size={15} aria-hidden />
              정류장별 시간 보기
            </button>
          </div>

          <button
            type="button"
            onClick={() => go("tk-consult")}
            data-gtm-cta="taekwondo_poster_cta"
            className={`mt-7 inline-flex min-h-[48px] items-center gap-2 rounded-[6px] px-5 text-[16px] font-bold ${focusRing}`}
            style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}
          >
            <CalendarCheck size={19} aria-hidden />
            체험 수업 신청
          </button>
        </div>
      </div>

      {/* 휴대폰 하단 고정 탭 */}
      <nav
        aria-label="바로가기"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t md:hidden"
        style={{ background: "#fff", borderColor: C.line, paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <a href={`tel:${TEL.replace(/-/g, "")}`} className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[13px] font-semibold ${focusRing}`} style={{ outlineColor: C.ink }}>
          <Phone size={20} aria-hidden />
          전화
        </a>
        {(
          [
            ["tk-time", "시간표", Clock],
            ["tk-bus", "차량", Bus],
            ["tk-consult", "상담", MessageCircle],
          ] as const
        ).map(([id, label, Icon]) => (
          <button key={id} type="button" onClick={() => go(id)} className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[13px] font-semibold ${focusRing}`} style={{ outlineColor: C.ink }}>
            <Icon size={20} aria-hidden />
            {label}
          </button>
        ))}
      </nav>
    </section>
  );
}


/* ---------- 1. 차량 운행 ---------- */

function BusRoute() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
      <div className="min-w-0 space-y-6">
        {ROUTES.map((route) => {
          const total = route.stops[route.stops.length - 1].off;
          return (
            <div key={route.id} className="rounded-[8px] border" style={{ borderColor: C.line, background: "#fff" }}>
              <h3 className="flex flex-wrap items-center gap-2 px-4 pt-4 text-[18px] font-bold md:px-5">
                <Bus size={19} aria-hidden style={{ color: C.accent }} />
                {route.label}
                <span className="text-[15px] font-semibold" style={{ color: C.muted }}>
                  {route.area}
                </span>
              </h3>
              <div className="mt-2 overflow-x-auto" tabIndex={0} role="region" aria-label={`${route.label} 정류장별 등원 탑승 시간`}>
                <table className="w-full min-w-[620px] border-collapse text-[15px]">
                  <thead>
                    <tr style={{ background: C.paper }}>
                      <th scope="col" className="px-4 py-2.5 text-left font-bold md:px-5">
                        정류장
                      </th>
                      {BUS_CLASSES.map((c) => (
                        <th key={c.id} scope="col" className="whitespace-nowrap px-2 py-2.5 text-center font-bold">
                          <span className="block">{c.label}</span>
                          <span className="block text-[13px] font-semibold tabular-nums" style={{ color: C.muted }}>
                            {hm(c.start)} 수업
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {route.stops.map((s, i) => {
                      const last = i === route.stops.length - 1;
                      return (
                        <tr key={s.name} className="border-t" style={{ borderColor: C.line }}>
                          <th scope="row" className="px-4 py-2.5 text-left md:px-5">
                            <span className="block font-bold">{last ? BRAND : s.name}</span>
                            {s.note && (
                              <span className="block text-[13px] font-normal" style={{ color: C.muted }}>
                                {s.note}
                              </span>
                            )}
                          </th>
                          {BUS_CLASSES.map((c) => (
                            <td key={c.id} className="px-2 py-2.5 text-center tabular-nums" style={{ fontWeight: last ? 700 : 400 }}>
                              {hm(c.start - ARRIVE_BEFORE - (total - s.off))}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <aside className="self-start rounded-[8px] border p-5 md:p-6" style={{ borderColor: C.line, background: "#fff" }}>
        <h3 className="text-[18px] font-bold">이용 안내</h3>
        <ul className="mt-3 space-y-2.5 text-[15px] leading-[1.6]" style={{ color: C.body }}>
          <li className="flex gap-2">
            <Clock size={18} className="mt-0.5 flex-none" aria-hidden />
            표의 시간은 등원 탑승 시간이에요. 하원 차는 수업이 끝나고 {LEAVE_AFTER}분 뒤 출발해 같은 정류장에 내려 드려요.
          </li>
          <li className="flex gap-2">
            <ShieldCheck size={18} className="mt-0.5 flex-none" aria-hidden />
            어린이 통학버스 신고 차량, 사범님이 함께 타요
          </li>
          <li className="flex gap-2">
            <MessageCircle size={18} className="mt-0.5 flex-none" aria-hidden />
            출발하면 보호자에게 문자가 가요
          </li>
        </ul>
        <p className="mt-4 text-[15px]" style={{ color: C.muted }}>
          정류장 추가는 상담 때 말씀해 주세요.
        </p>
      </aside>
    </div>
  );
}

/* ---------- 2. 부별 시간표 ---------- */

function Timetable() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="overflow-x-auto rounded-[8px] border" style={{ borderColor: C.line, background: "#fff" }} tabIndex={0} aria-label="수련 시간표, 좌우로 밀어서 보기" role="region">
        <table className="w-full min-w-[640px] border-collapse text-[15px]">
          <caption className="sr-only">부별 요일 수련 내용</caption>
          <thead>
            <tr style={{ background: C.paper, color: C.ink }}>
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
            {ROWS.map((r) => (
              <tr key={r.label} className="border-t" style={{ borderColor: C.line }}>
                <th scope="row" className="whitespace-nowrap px-3 py-3 text-left font-bold">
                  {r.label}
                </th>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums">{r.time}</td>
                {r.week.map((w, i) => (
                  <td key={i} className="px-2 py-3 text-center" style={{ color: w ? C.body : C.muted }}>
                    {w || "쉬어요"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-[8px] border p-5" style={{ background: "#fff", borderColor: C.line }}>
        <h3 className="text-[18px] font-bold">월 수련비</h3>
        <table className="mt-3 w-full text-[15px]">
          <tbody>
            {PARTS.map((p) => (
              <tr key={p} className="border-t first:border-t-0" style={{ borderColor: C.line }}>
                <th scope="row" className="py-2.5 text-left font-bold">
                  {p}
                  <span className="block text-[13px] font-normal" style={{ color: C.muted }}>
                    {FEES[p].per}
                    {FEES[p].bus ? ", 차량 포함" : ""}
                  </span>
                </th>
                <td className="py-2.5 text-right font-bold tabular-nums">{won(FEES[p].fee)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="mt-4 space-y-1.5 border-t pt-3 text-[15px] leading-[1.6]" style={{ color: C.body, borderColor: C.line }}>
          <li>도복과 흰띠 처음 한 번 45,000원</li>
          <li>형제 함께 다니면 둘째부터 10,000원 빼 드려요</li>
        </ul>
      </div>
    </div>
  );
}

/* ---------- 3. 승급 심사 ---------- */

function BeltTest() {
  return (
    <div>
      <div className="overflow-x-auto rounded-[8px] border" style={{ borderColor: C.line, background: "#fff" }} tabIndex={0} role="region" aria-label="띠별 승급 심사 안내">
        <table className="w-full min-w-[680px] border-collapse text-[15px]">
          <thead>
            <tr style={{ background: C.paper }}>
              {["지금 띠", "다음 띠", "심사 품새", "심사 항목", "수련 기간"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-4 py-3 text-left font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BELT_STEPS.map((b) => (
              <tr key={b.name} className="border-t" style={{ borderColor: C.line }}>
                <th scope="row" className="whitespace-nowrap px-4 py-3 text-left font-bold">
                  <span className="inline-flex items-center gap-2">
                    <BeltSwatch color={b.color} edge={b.edge} split={b.name === "품띠"} />
                    {b.name}
                  </span>
                </th>
                <td className="whitespace-nowrap px-4 py-3">{b.next}</td>
                <td className="px-4 py-3">{b.poomsae}</td>
                <td className="px-4 py-3" style={{ color: C.body }}>
                  {b.items}
                </td>
                <td className="px-4 py-3" style={{ color: C.body }}>
                  {b.period}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="mt-5 grid grid-cols-[100px_minmax(0,1fr)] gap-y-2.5 text-[16px] leading-[1.55]">
        <dt className="font-bold">심사 일정</dt>
        <dd style={{ color: C.body }}>매달 마지막 토요일 오전 10시, 신청은 일주일 전까지</dd>
        <dt className="font-bold">심사비</dt>
        <dd style={{ color: C.body }}>{won(TEST_FEE)}(새 띠, 수료증 포함)</dd>
        <dt className="font-bold">품 심사</dt>
        <dd style={{ color: C.body }}>품띠부터는 국기원 품 심사예요. 날짜가 잡히면 공지사항에 올려요.</dd>
      </dl>
    </div>
  );
}


function BeltSwatch({ color, edge, split = false }: { color: string; edge: string; split?: boolean }) {
  return (
    <svg width="32" height="12" viewBox="0 0 32 12" aria-hidden className="flex-none">
      <rect x="0.5" y="0.5" width="31" height="11" rx="2" fill={color} stroke={edge} strokeOpacity="0.5" strokeWidth="1" />
      {split && <rect x="1" y="6" width="30" height="5" rx="1" fill={C.ink} />}
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
    <div className="rounded-[8px] border p-5 md:p-8" style={{ borderColor: C.line, background: "#fff" }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={reduce ? false : { y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: reduce ? 0 : DUR, ease: EASE }} aria-live="polite">
            <p className="inline-flex items-center gap-2 text-[15px] font-bold" style={{ color: C.muted }}>
              <Check size={18} aria-hidden />
              접수 번호 <span className="tabular-nums">{done.no}</span>
            </p>
            <p className="mt-2 text-[26px] font-bold leading-tight tracking-[-0.02em]">
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
              className={`mt-6 rounded-[6px] border px-4 py-2.5 text-[15px] font-semibold ${focusRing}`}
              style={{ borderColor: C.line, outlineColor: C.ink }}
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
                <input id={agreeId} type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`h-5 w-5 ${focusRing}`} style={{ accentColor: C.accent, outlineColor: C.ink }} />
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
                className={`inline-flex items-center gap-2 rounded-[6px] px-6 py-3 text-[16px] font-semibold ${focusRing}`}
                style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}
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
