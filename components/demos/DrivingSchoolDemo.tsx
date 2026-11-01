"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bus, CalendarCheck, Car, Check, FileText, MapPin, MessageSquare, Phone } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 운전전문학원 홈페이지 샘플: 가상의 운전전문학원 곰파트너. 1종 보통, 2종 보통, 2종 소형 면허 교육을 한다.
   상호, 주소, 정류장, 손님 이름은 모두 가상이다.

   국내 운전전문학원 사이트 공통 구성(참고): 메뉴는 학원소개, 교육안내(면허 종류, 교육 과정, 교육비),
   셔틀버스 노선안내, 시험일정, 온라인 등록 예약, 오시는 길, 공지사항. 첫 화면에 "무료 셔틀버스 운행",
   "평일 야간, 주말 교육", "등록 예약" 버튼과 대표번호를 크게 둔다. 교육 시간은 학과 3시간, 장내기능 4시간,
   도로주행 6시간(2종 소형은 학과 3시간, 장내기능 10시간, 도로교통법 시행규칙 별표 32)으로 안내하고, 교육비와 검정료를 나눠 적는 곳이 많다. 합격 보장, 합격률 숫자는 쓰지 않는다.

   첫 화면(dr-poster): 맨 위 어두운 띠에 큰 대표번호와 상담 시간, 그 아래 상단 메뉴(휴대폰은 아이콘 빠른 메뉴를 옆으로 민다).
   본문 왼쪽은 운전석 사진, 오른쪽은 문장 "평일 밤 9시까지 도로 연수", 운영 안내 세 줄, 바로가기 넷(수강료, 수강신청, 셔틀 노선, 대표번호).
   휴대폰은 사진을 짧은 띠로 줄이고 화면 맨 아래에 전화 상담, 문자 상담 두 버튼을 고정한다. 팝업은 쓰지 않는다.
   사진 출처: Pexels 사진 9195126

   모션: 들어올 때 사진이 1.6초 동안 scale 1.06 에서 1 로 다가오고, 오른쪽 글은 300ms 늦게 아래 12px 에서 700ms 동안 올라온다.
   동작 줄이기면 모두 없음.

   구성
   1. 면허 종류별 교육과 수강료: 1종 보통, 2종 보통, 2종 소형 카드에 교육 시간, 교육비, 검정 수수료, 추가 교육 1시간 요금.
   2. 셔틀버스 노선: 노선별 정류장과 첫차, 막차 시간표.
   3. 시험 일정: 장내기능, 도로주행 검정 요일과 회차, 학과시험 장소 표.
   4. 등록 예약(브라우저 안에서만 돈다. 실제로 보내지 않는다): 면허 종류, 방문 날짜, 수업 시간대, 셔틀 이용, 이름, 연락처. 완료 화면에 접수 번호, 담당 창구, 회신 예정일. */

const BRAND = "운전전문학원";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 운전전문학원";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00";

const IMG = "/images/demo-driving-school";

/* 색: 바탕 흰색과 옅은 회색, 강조색은 짙은 머스터드 하나 */
const STAFF = [
  { id: "1", name: "윤ㅂ석", role: "기능 강사", note: "1종 대형, 기능교육 12년" },
  { id: "2", name: "김ㅁ지", role: "도로주행 강사", note: "장롱면허 연수, 여성 수강생 담당" },
  { id: "3", name: "이ㅈ훈", role: "도로주행 강사", note: "2종 자동, 야간 도로주행 담당" },
];

const C = {
  bg: "#f7f7f5",
  card: "#ffffff",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  dark: "#1c1c1c",
  accent: "#7a5c12",
  accentSoft: "#f2ecdc",
  accentOnDark: "#e2c98a",
  line: "#e5e5e5",
  sub: "#c8c8c8",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 첫 화면 사진이 다가오는 시간 */
const HERO_DUR = 1.6;
/** 문장 등장 시간과 늦춤(ms) */
const RISE_MS = 700;
const RISE_DELAY_MS = 300;

const HERO_CSS = `
@keyframes dr-rise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}
.dr-rise { animation: dr-rise ${RISE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${RISE_DELAY_MS}ms both; }
@media (prefers-reduced-motion: reduce) {
  .dr-rise { animation: none; }
}
`;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const hm = (min: number) => `${p2(Math.floor(min / 60))}:${p2(min % 60)}`;

/* ---------- 면허 종류 ---------- */

const LICENSES = [
  {
    id: "1종 보통",
    car: "1톤 화물차(수동 또는 자동)",
    hours: [3, 4, 6],
    fee: 690_000,
    exam: 70_000,
    extra: 45_000,
    extraName: "도로주행",
  },
  {
    id: "2종 보통",
    car: "승용차(자동)",
    hours: [3, 4, 6],
    fee: 660_000,
    exam: 70_000,
    extra: 45_000,
    extraName: "도로주행",
  },
  {
    id: "2종 소형",
    car: "125cc 넘는 이륜차",
    hours: [3, 10, 0],
    fee: 420_000,
    exam: 35_000,
    extra: 35_000,
    extraName: "장내기능",
  },
] as const;
type LicenseId = (typeof LICENSES)[number]["id"];
const LICENSE_IDS = LICENSES.map((l) => l.id);

/* ---------- 셔틀버스 ---------- */

const ROUTES = [
  {
    id: "1호차",
    name: "ㅅㄹ역 노선",
    first: 8 * 60 + 30,
    last: 19 * 60 + 30,
    stops: [
      { name: "ㅅㄹ역 2번 출구", m: 0 },
      { name: "ㅅㄹ초등학교 앞", m: 6 },
      { name: "ㅎㄷ아파트 정문", m: 11 },
      { name: "ㅇㅇ시장 입구", m: 16 },
      { name: "학원 도착", m: 24 },
    ],
  },
  {
    id: "2호차",
    name: "ㄴㅇ대 노선",
    first: 9 * 60,
    last: 20 * 60,
    stops: [
      { name: "ㄴㅇ대 정문", m: 0 },
      { name: "ㄴㅇ대 후문", m: 5 },
      { name: "ㄱㅅ역 1번 출구", m: 12 },
      { name: "ㄷㅁ아파트 상가", m: 18 },
      { name: "학원 도착", m: 27 },
    ],
  },
  {
    id: "3호차",
    name: "ㅂㄱ동 노선",
    first: 8 * 60 + 50,
    last: 19 * 60 + 50,
    stops: [
      { name: "ㅂㄱ동 주민센터", m: 0 },
      { name: "ㅂㄱ사거리", m: 7 },
      { name: "ㅅㅁ아파트 후문", m: 13 },
      { name: "학원 도착", m: 22 },
    ],
  },
] as const;

/* ---------- 예약 ---------- */

const SLOTS = ["평일 낮(09~18시)", "평일 저녁(18~21시)", "주말(토요일)"] as const;

const HOURS = [
  { label: "평일", time: "09:00 ~ 21:00" },
  { label: "토요일", time: "09:00 ~ 17:00" },
  { label: "일요일, 공휴일", time: "휴무" },
];

const NOTICES = [
  { d: 2, t: "평일 저녁 도로주행 회차 추가 안내" },
  { d: 9, t: "셔틀버스 2호차 정류장 변경" },
  { d: 21, t: "등록하실 때 챙겨 오실 것" },
];

/** 다음 운영일(일요일 제외) n개 */
function nextOpenDays(from: Date, n: number) {
  const out: Date[] = [];
  let d = from;
  while (out.length < n) {
    d = daysAgo(d, -1);
    if (d.getDay() !== 0) out.push(d);
  }
  return out;
}

export function DrivingSchoolDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = useCallback(
    (id: string) =>
      document.getElementById(id)?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      }),
    [reduce],
  );

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.ink }}>
      <Poster reduce={reduce} go={go} />

      <section id="dr-course" aria-labelledby="dr-course-title" className="mx-auto mt-6 max-w-[1200px] scroll-mt-4 px-4 md:mt-14 md:px-6">
        <SectionTitle id="dr-course-title" title="면허 종류별 교육과 수강료" />
        <CourseFees onReserve={() => go("dr-reserve")} />
      </section>

      <section id="dr-staff" aria-labelledby="dr-staff-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="dr-staff-title" title="강사" />
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
      </section>

      <section id="dr-shuttle" aria-labelledby="dr-shuttle-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="dr-shuttle-title" title="셔틀버스 노선" />
        <Shuttle />
      </section>

      <section id="dr-exam" aria-labelledby="dr-exam-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="dr-exam-title" title="시험 일정" />
        <ExamInfo />
      </section>

      <section id="dr-reserve" aria-labelledby="dr-reserve-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="dr-reserve-title" title="등록 예약" />
        <ReserveForm today={today} reduce={reduce} />
      </section>

      <div className="mx-auto mt-16 grid max-w-[1200px] gap-10 px-4 md:mt-24 md:grid-cols-[1.2fr_1fr] md:px-6">
        <section id="dr-visit" aria-labelledby="dr-visit-title" className="scroll-mt-4">
          <SectionTitle id="dr-visit-title" title="오시는 길" />
          <dl className="mt-5 grid gap-x-6 gap-y-3 text-[16px] sm:grid-cols-[auto_1fr]">
            <dt className="font-bold">주소</dt>
            <dd>{ADDRESS}</dd>
            <dt className="font-bold">대중교통</dt>
            <dd>ㅇㅇ역에서 셔틀버스 또는 마을버스 00번</dd>
            <dt className="font-bold">주차</dt>
            <dd>학원 안 주차장, 수강생 무료</dd>
            <dt className="font-bold">운영 시간</dt>
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
        <section aria-labelledby="dr-notice-title">
          <SectionTitle id="dr-notice-title" title="공지사항" />
          <ul className="mt-5 border-t" style={{ borderColor: C.ink }}>
            {NOTICES.map((n) => (
              <li key={n.t} className="flex items-baseline justify-between gap-4 border-b py-3 text-[16px]" style={{ borderColor: C.line }}>
                <span className="min-w-0">{n.t}</span>
                <span className="flex-none text-[14px] tabular-nums" style={{ color: C.muted }}>
                  {fmtDash(daysAgo(today, n.d))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="mt-16 pb-28 text-[14px] leading-[1.8]" style={{ background: C.dark, color: C.sub }}>
        <div className="mx-auto max-w-[1200px] px-4 pt-10 md:px-6">
          <p>
            <SampleLogo light size={18} />
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

function SectionTitle({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="text-[26px] font-bold leading-tight md:text-[32px]" style={{ letterSpacing: "-0.02em" }}>
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
          운전전문학원
        </span>
      </span>
    </span>
  );
}

/* ---------- 첫 화면: 큰 전화 띠, 사진 배너와 바로가기 ---------- */

const NAV: { id: string; label: string; Icon: typeof Car }[] = [
  { id: "dr-course", label: "수강료", Icon: FileText },
  { id: "dr-shuttle", label: "셔틀 노선", Icon: Bus },
  { id: "dr-exam", label: "시험 일정", Icon: CalendarCheck },
  { id: "dr-staff", label: "강사 소개", Icon: Car },
  { id: "dr-reserve", label: "등록 예약", Icon: Check },
  { id: "dr-visit", label: "오시는 길", Icon: MapPin },
];

const QUICK: { id: string; title: string; sub: string; Icon: typeof Car }[] = [
  { id: "dr-course", title: "수강료", sub: "교육비와 검정료", Icon: FileText },
  { id: "dr-reserve", title: "수강신청", sub: "온라인 등록 예약", Icon: CalendarCheck },
  { id: "dr-shuttle", title: "셔틀 노선", sub: `무료 셔틀 ${ROUTES.length}개 노선`, Icon: Bus },
];

function Poster({ reduce, go }: { reduce: boolean; go: (id: string) => void }) {
  const tel = TEL.replace(/-/g, "");
  const tile = `flex min-h-[76px] w-full items-center gap-4 rounded-[8px] border px-5 py-4 text-left hover:border-[#bdbdbd] ${focusRing}`;
  const tileStyle = { background: C.card, borderColor: C.line, outlineColor: C.ink };
  const tileIcon = "flex h-11 w-11 flex-none items-center justify-center rounded-[6px]";

  return (
    <section id="dr-poster" aria-labelledby="dr-poster-title" style={{ background: C.bg }}>
      <style>{HERO_CSS}</style>

      {/* 큰 전화 띠 */}
      <div style={{ background: C.dark, color: "#fff" }}>
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 md:px-6">
          <a href={`tel:${tel}`} className={`inline-flex min-h-[44px] items-center gap-2 text-[22px] font-bold tabular-nums md:text-[26px] ${focusRing}`} style={{ color: C.accentOnDark, outlineColor: "#fff" }}>
            <Phone size={22} aria-hidden />
            {TEL}
          </a>
          <p className="text-[14px] md:text-[15px]" style={{ color: C.sub }}>
            상담 평일 09:00 ~ 21:00, 토요일 09:00 ~ 17:00
          </p>
        </div>
      </div>

      {/* 상단 메뉴. 휴대폰은 아이콘 빠른 메뉴를 옆으로 민다 */}
      <header className="border-b" style={{ background: C.card, borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <p>
            <SampleLogo size={18} />
          </p>
          <nav aria-label="주요 메뉴" className="hidden items-center lg:flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => go(n.id)}
                className={`min-h-[44px] rounded-[4px] px-3 text-[16px] font-semibold underline-offset-4 hover:underline ${focusRing}`}
                style={{ outlineColor: C.ink }}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
        <nav aria-label="빠른 메뉴" className="overflow-x-auto border-t lg:hidden" style={{ borderColor: C.line }}>
          <ul className="flex w-max px-2">
            {NAV.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => go(n.id)}
                  className={`flex min-h-[60px] w-[76px] flex-col items-center justify-center gap-1 rounded-[4px] text-[13px] font-semibold ${focusRing}`}
                  style={{ outlineColor: C.ink }}
                >
                  <n.Icon size={20} aria-hidden style={{ color: C.accent }} />
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="mx-auto max-w-[1440px] pb-10 md:px-6 md:pb-12 md:pt-6">
        <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-6 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
          {/* 교육 사진 */}
          <div className="relative h-[26svh] min-h-[180px] overflow-hidden md:h-auto md:min-h-[480px] md:rounded-[8px]" style={{ background: "#141414" }}>
            <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : HERO_DUR, ease: EASE }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
              <img
                src={`${IMG}/hero.jpg`}
                srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
                sizes="(min-width: 768px) 55vw, 100vw"
                alt="운전석에서 두 손으로 핸들을 잡고 장내 코스를 보는 수강생"
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "62% 50%" }}
              />
            </motion.div>
          </div>

          {/* 문장과 바로가기 */}
          <div className={`flex flex-col px-4 pt-6 md:px-0 md:pt-2 ${reduce ? "" : "dr-rise"}`}>
            <h1 id="dr-poster-title" className="text-[30px] font-bold md:text-[38px]" style={{ letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}>
              평일 밤 9시까지 도로 연수
            </h1>
            <p className="mt-2 text-[16px]" style={{ color: C.body }}>
              {BRAND}, 1종 보통, 2종 보통, 2종 소형
            </p>
            <ul className="mt-5 grid gap-2 text-[16px]">
              {["평일 야간, 토요일 교육", `무료 셔틀버스 ${ROUTES.length}개 노선 운행`, "학원 안 주차장, 수강생 무료"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check size={18} aria-hidden style={{ color: C.accent }} />
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 md:mt-auto md:pt-6">
              {QUICK.map((t) => (
                <button key={t.id} type="button" onClick={() => go(t.id)} className={tile} style={tileStyle}>
                  <span className={tileIcon} style={{ background: C.accentSoft, color: C.accent }}>
                    <t.Icon size={22} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[18px] font-bold">{t.title}</span>
                    <span className="block text-[14px]" style={{ color: C.muted }}>
                      {t.sub}
                    </span>
                  </span>
                </button>
              ))}
              <a href={`tel:${tel}`} data-gtm-cta="driving-school_poster_tel" className={tile} style={{ ...tileStyle, background: C.dark, borderColor: C.dark, color: "#fff" }}>
                <span className={tileIcon} style={{ background: "rgba(255,255,255,0.12)", color: C.accentOnDark }}>
                  <Phone size={22} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[18px] font-bold">대표번호</span>
                  <span className="block text-[15px] tabular-nums" style={{ color: C.accentOnDark }}>
                    {TEL}
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 휴대폰 하단 고정 줄: 전화, 문자 상담 */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t p-2 md:hidden" style={{ background: C.card, borderColor: C.line, paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}>
        <a href={`tel:${tel}`} className={`flex min-h-[48px] items-center justify-center gap-2 rounded-[6px] text-[16px] font-bold ${focusRing}`} style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}>
          <Phone size={18} aria-hidden />
          전화 상담
        </a>
        <a href={`sms:${tel}`} className={`flex min-h-[48px] items-center justify-center gap-2 rounded-[6px] border text-[16px] font-bold ${focusRing}`} style={{ borderColor: C.ink, color: C.ink, outlineColor: C.ink }}>
          <MessageSquare size={18} aria-hidden />
          문자 상담
        </a>
      </div>
    </section>
  );
}

/* ---------- 1. 면허 종류별 교육과 수강료 ---------- */

function CourseFees({ onReserve }: { onReserve: () => void }) {
  return (
    <div className="mt-6">
      <ul className="grid gap-4 md:grid-cols-3">
        {LICENSES.map((l) => {
          const total = l.hours.reduce<number>((s, h) => s + h, 0);
          return (
            <li key={l.id} className="rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
              <h3 className="text-[22px] font-bold">{l.id}</h3>
              <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                교육 차량: {l.car}
              </p>
              <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2 border-t pt-4 text-[16px]" style={{ borderColor: C.line }}>
                <dt>학과 교육</dt>
                <dd className="tabular-nums">{l.hours[0]}시간</dd>
                <dt>장내기능 교육</dt>
                <dd className="tabular-nums">{l.hours[1]}시간</dd>
                {l.hours[2] > 0 && (
                  <>
                    <dt>도로주행 교육</dt>
                    <dd className="tabular-nums">{l.hours[2]}시간</dd>
                  </>
                )}
                <dt className="font-bold">교육 시간 합계</dt>
                <dd className="font-bold tabular-nums">{total}시간</dd>
              </dl>
              <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2 border-t pt-4 text-[16px]" style={{ borderColor: C.line }}>
                <dt>교육비</dt>
                <dd className="font-bold tabular-nums">{won(l.fee)}</dd>
                <dt>검정 수수료</dt>
                <dd className="tabular-nums">{won(l.exam)}</dd>
                <dt>추가 {l.extraName} 1시간</dt>
                <dd className="tabular-nums">{won(l.extra)}</dd>
              </dl>
            </li>
          );
        })}
      </ul>
      <ul className="mt-5 grid gap-1.5 text-[15px]" style={{ color: C.muted }}>
        <li>학과 교육 3시간을 마치면 면허시험장에서 학과시험을 봐요.</li>
        <li>장내기능 검정은 학원 코스에서, 도로주행 검정은 학원이 정한 도로 노선에서 봐요. 2종 소형은 장내기능까지 봐요.</li>
        <li>면허시험장 학과시험 응시료, 신체검사비, 면허증 발급 수수료는 따로 내요.</li>
      </ul>
      <button
        type="button"
        onClick={onReserve}
        data-gtm-cta="driving-school_course_reserve"
        className={`mt-6 inline-flex items-center justify-center gap-2 rounded-[4px] px-6 py-3.5 text-[17px] font-bold ${focusRing}`}
        style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}
      >
        <CalendarCheck size={20} aria-hidden />
        등록 예약
      </button>
    </div>
  );
}

/* ---------- 2. 셔틀버스 노선별 시간표 ---------- */

function Shuttle() {
  return (
    <div className="mt-6">
      <ul className="grid gap-4 lg:grid-cols-3">
        {ROUTES.map((r) => (
          <li key={r.id} className="overflow-hidden rounded-[6px] border" style={{ borderColor: C.line, background: C.card }}>
            <p className="flex items-center gap-2 px-5 py-3.5 text-[17px] font-bold text-white" style={{ background: C.dark }}>
              <Bus size={18} aria-hidden style={{ color: C.accentOnDark }} />
              {r.id} {r.name}
            </p>
            <table className="w-full text-left text-[15px]">
              <thead>
                <tr className="border-b text-[14px]" style={{ borderColor: C.line, color: C.muted }}>
                  <th scope="col" className="px-5 py-2.5 font-normal">
                    정류장
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-right font-normal">
                    첫차
                  </th>
                  <th scope="col" className="px-5 py-2.5 text-right font-normal">
                    막차
                  </th>
                </tr>
              </thead>
              <tbody>
                {r.stops.map((s) => (
                  <tr key={s.name} className="border-b last:border-b-0" style={{ borderColor: C.line }}>
                    <th scope="row" className="px-5 py-2.5 font-semibold">
                      {s.name}
                    </th>
                    <td className="px-2 py-2.5 text-right tabular-nums">{hm(r.first + s.m)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums">{hm(r.last + s.m)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </li>
        ))}
      </ul>
      <dl className="mt-5 grid gap-x-5 gap-y-2 text-[15px] sm:grid-cols-[auto_1fr]">
        <dt className="font-bold">운행</dt>
        <dd>월요일 ~ 토요일, 첫차부터 막차까지 1시간마다 같은 분에 출발</dd>
        <dt className="font-bold">돌아가는 차</dt>
        <dd>학원에서 매시 정각, 같은 정류장에 내려 드려요</dd>
        <dt className="font-bold">요금</dt>
        <dd>수강생 무료</dd>
      </dl>
    </div>
  );
}

/* ---------- 3. 시험 일정 ---------- */

const EXAM_INFO = [
  { kind: "장내기능 검정", days: "화, 목, 토", times: "10:00, 14:00 (토요일은 10:00)", place: "학원 장내 코스" },
  { kind: "도로주행 검정", days: "월, 수, 금", times: "10:00, 14:00, 19:00", place: "학원 지정 도로 노선" },
  { kind: "학과시험", days: "평일", times: "면허시험장 접수 순", place: "ㅇㅇ운전면허시험장" },
];

function ExamInfo() {
  return (
    <div className="mt-6 overflow-x-auto rounded-[6px] border" style={{ borderColor: C.line, background: C.card }}>
      <table className="w-full min-w-[560px] text-left text-[16px]">
        <thead>
          <tr className="border-b text-[14px]" style={{ borderColor: C.line, color: C.muted }}>
            <th scope="col" className="px-5 py-3 font-normal">
              구분
            </th>
            <th scope="col" className="px-3 py-3 font-normal">
              요일
            </th>
            <th scope="col" className="px-3 py-3 font-normal">
              회차
            </th>
            <th scope="col" className="px-5 py-3 font-normal">
              장소
            </th>
          </tr>
        </thead>
        <tbody>
          {EXAM_INFO.map((e) => (
            <tr key={e.kind} className="border-b last:border-b-0" style={{ borderColor: C.line }}>
              <th scope="row" className="px-5 py-3.5 font-bold">
                {e.kind}
              </th>
              <td className="px-3 py-3.5">{e.days}</td>
              <td className="px-3 py-3.5 tabular-nums">{e.times}</td>
              <td className="px-5 py-3.5">{e.place}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t px-5 py-3 text-[14px]" style={{ borderColor: C.line, color: C.muted }}>
        검정 신청은 교육을 마친 뒤 학원 안내데스크에서 해요. 공휴일 회차는 공지사항으로 알려 드려요.
      </p>
    </div>
  );
}

/* ---------- 4. 등록 예약 ---------- */

type Done = {
  no: string;
  name: string;
  phone: string;
  license: LicenseId;
  date: Date;
  slot: string;
  shuttle: string;
  reply: Date;
};

function ReserveForm({ today, reduce }: { today: Date; reduce: boolean }) {
  const [license, setLicense] = useState<LicenseId>("2종 보통");
  const days = nextOpenDays(daysAgo(today, 1), 7);
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<(typeof SLOTS)[number]>(SLOTS[1]);
  const [shuttle, setShuttle] = useState("이용 안 함");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const nameId = useId();
  const phoneId = useId();
  const shuttleId = useId();
  const agreeId = useId();

  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  const nameOk = name.trim().length >= 2;
  const ok = phoneOk && nameOk && agree;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok) return;
    const seq = 100 + ((name.length * 37 + phone.length * 11 + day * 7) % 900);
    setDone({
      no: `DR-${fmtDash(today).replace(/-/g, "").slice(2)}-${seq}`,
      name: maskName(name),
      phone: maskPhone(phone),
      license,
      date: days[day],
      slot,
      shuttle,
      reply: nextOpenDays(today, 1)[0],
    });
  };

  const chip = `rounded-[4px] border px-3.5 py-2 text-[15px] font-semibold ${focusRing}`;
  const chipStyle = (on: boolean) => ({
    borderColor: on ? C.accent : C.line,
    background: on ? C.accent : C.card,
    color: on ? "#fff" : C.ink,
    outlineColor: C.ink,
  });
  const field = `mt-2 block h-12 w-full rounded-[4px] border px-3 text-[17px] ${focusRing}`;

  return (
    <div className="mt-6 rounded-[6px] border p-5 md:p-8" style={{ borderColor: C.line, background: C.card }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
            role="status"
          >
            <p className="inline-flex items-center gap-2 text-[22px] font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: C.accent, color: "#fff" }}>
                <Check size={20} aria-hidden />
              </span>
              등록 예약이 접수됐어요
            </p>
            <dl className="mt-5 grid gap-x-6 gap-y-2.5 text-[16px] sm:grid-cols-[auto_1fr]">
              <dt className="font-bold">접수 번호</dt>
              <dd className="tabular-nums">{done.no}</dd>
              <dt className="font-bold">신청인</dt>
              <dd>
                {done.name} / <span className="tabular-nums">{done.phone}</span>
              </dd>
              <dt className="font-bold">면허 종류</dt>
              <dd>
                {done.license}, {done.slot}
              </dd>
              <dt className="font-bold">방문 날짜</dt>
              <dd>{fmtKo(done.date)}</dd>
              <dt className="font-bold">셔틀버스</dt>
              <dd>{done.shuttle}</dd>
              <dt className="font-bold">담당 창구</dt>
              <dd>
                {KAKAO} 또는 전화 <span className="whitespace-nowrap tabular-nums">{TEL}</span>
              </dd>
              <dt className="font-bold">회신 예정</dt>
              <dd>{fmtKo(done.reply)} 오전 중 안내데스크에서 연락드려요</dd>
              <dt className="font-bold">챙겨 오실 것</dt>
              <dd>신분증, 반명함 사진 3장</dd>
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
              새로 예약하기
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={false} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }} className="grid gap-6 md:grid-cols-2 md:gap-x-10">
            <fieldset>
              <legend className="text-[16px] font-bold">면허 종류</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {LICENSE_IDS.map((l) => (
                  <button key={l} type="button" aria-pressed={license === l} onClick={() => setLicense(l)} className={chip} style={chipStyle(license === l)}>
                    {l}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-[16px] font-bold">수업 시간대</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {SLOTS.map((s) => (
                  <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)} className={chip} style={chipStyle(slot === s)}>
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="md:col-span-2">
              <legend className="text-[16px] font-bold">등록하러 오실 날</legend>
              <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {days.map((d, i) => {
                  const on = day === i;
                  return (
                    <button
                      key={d.getTime()}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setDay(i)}
                      className={`flex flex-col items-center rounded-[4px] border py-2 ${focusRing}`}
                      style={chipStyle(on)}
                    >
                      <span className="text-[13px] font-semibold">{["일", "월", "화", "수", "목", "금", "토"][d.getDay()]}</span>
                      <span className="text-[18px] font-bold tabular-nums">
                        {d.getMonth() + 1}.{d.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <div>
              <label htmlFor={nameId} className="text-[16px] font-bold">
                이름
              </label>
              <input
                id={nameId}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={field}
                style={{
                  borderColor: tried && !nameOk ? C.error : C.line,
                  outlineColor: C.ink,
                }}
                aria-invalid={tried && !nameOk}
                aria-describedby={tried && !nameOk ? `${nameId}-e` : undefined}
              />
              {tried && !nameOk && (
                <p id={`${nameId}-e`} className="mt-1.5 text-[14px] font-semibold" style={{ color: C.error }}>
                  이름을 두 글자 이상 적어 주세요
                </p>
              )}
            </div>
            <div>
              <label htmlFor={phoneId} className="text-[16px] font-bold">
                연락처
              </label>
              <input
                id={phoneId}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                placeholder="010-0000-0000"
                className={field}
                style={{
                  borderColor: tried && !phoneOk ? C.error : C.line,
                  outlineColor: C.ink,
                }}
                aria-invalid={tried && !phoneOk}
                aria-describedby={tried && !phoneOk ? `${phoneId}-e` : undefined}
              />
              {tried && !phoneOk && (
                <p id={`${phoneId}-e`} className="mt-1.5 text-[14px] font-semibold" style={{ color: C.error }}>
                  휴대폰 번호를 확인해 주세요
                </p>
              )}
            </div>
            <div>
              <label htmlFor={shuttleId} className="text-[16px] font-bold">
                셔틀버스
              </label>
              <select id={shuttleId} value={shuttle} onChange={(e) => setShuttle(e.target.value)} className={`${field} bg-white`} style={{ borderColor: C.line, outlineColor: C.ink }}>
                <option>이용 안 함</option>
                {ROUTES.map((r) => (
                  <option key={r.id}>
                    {r.id} {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <label htmlFor={agreeId} className="flex items-center gap-2.5 text-[16px]">
                <input id={agreeId} type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="h-5 w-5 flex-none accent-[#7a5c12]" />
                개인정보 수집, 이용에 동의합니다 (필수)
              </label>
              {tried && !agree && (
                <p className="mt-1.5 text-[14px] font-semibold" style={{ color: C.error }}>
                  동의가 필요해요
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 md:col-span-2">
              <button
                type="submit"
                data-gtm-cta="driving-school_reserve_submit"
                className={`inline-flex items-center gap-2 rounded-[4px] px-6 py-3.5 text-[17px] font-bold ${focusRing}`}
                style={{
                  background: C.accent,
                  color: "#fff",
                  outlineColor: C.ink,
                }}
              >
                <Car size={20} aria-hidden />
                등록 예약하기
              </button>
              <p className="inline-flex items-center gap-1.5 text-[15px]" style={{ color: C.muted }}>
                <FileText size={16} aria-hidden /> 등록하실 때 신분증과 반명함 사진 3장이 필요해요
              </p>
            </div>
            <p className="inline-flex items-center gap-1.5 text-[14px] md:col-span-2" style={{ color: C.muted }}>
              <MapPin size={16} aria-hidden /> {ADDRESS}, 1층 안내데스크
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
