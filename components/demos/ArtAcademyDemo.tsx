"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { AlertCircle, Bus, CalendarCheck, Car, Check, ChevronLeft, ChevronRight, Clock, MapPin, Phone, RotateCcw, TrainFront, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 입시 미술학원 홈페이지 샘플: 가상의 미술학원 곰파트너. 입시반(고1 ~ 재수), 성인 취미반, 초등반을 같이 운영한다.
   상호, 주소, 전화번호는 모두 가상이다. 학생 이름과 합격 실적은 넣지 않는다.

   국내 입시 미술학원 사이트 공통 구성(참고): 메뉴는 학원 소개, 입시반(기초디자인, 사고의 전환, 소묘, 정물수채화),
   취미반, 초등반(아동미술), 실기 시간표, 수업 작품, 교습비 안내, 상담 신청, 오시는 길.
   첫 화면에는 모집 중인 반과 상담 예약 버튼을 둔다. 교습비는 교육청 신고 교습비처럼 "월 교습비"와 기타경비(재료비)를 표로 공개한다.
   관용 문구: 방문 상담, 상담 예약, 실기 시간표, 평일반, 주말반, 재료비 별도, 수업 작품.

   첫 화면(aa-poster): 연필로 인체 소묘를 그리는 사진 한 장을 화면 가득 깔고 왼쪽 아래에 문장 "연필 깎는 법부터 같이 해요"를 둔다.
   사진이 밝아서 흰 막을 깔고 글자는 먹색으로 쓴다.
   핵심 모션: 들어올 때 사진이 1.6초 동안 천천히 다가오고(scale 1.06 에서 1), 문장은 0.3초 늦게 아래 12px 에서 올라온다(CSS).
   스크롤하면 사진만 조금 느리게 내려간다(y 0 에서 8%). 동작 줄이기면 전부 멈춘 상태로 둔다.
   사진 출처: Pexels 사진 7171387

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 반 안내: 입시반, 취미반, 초등반 탭과 주 횟수 칩. 고르면 과목, 수업 시간, 정원, 월 교습비가 바뀐다.
   2. 수업 작품: 정물 소묘, 정물 수채화로 거르고, 누르면 크게 보기(좌우 화살표 키, Esc).
   3. 실기 시간표: 반을 고르면 그 반 줄만 진하게, 오늘 요일 열을 표시한다.
   4. 상담 신청: 학년, 관심 반, 방문 날짜와 시간, 이름과 연락처. 접수 번호, 담당 창구, 회신 예정일이 찍힌 접수증을 보여 준다. */

const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";

const C = {
  paper: "#ffffff",
  sheet: "#ffffff",
  /** 구역 구분 옅은 회색 */
  soft: "#f7f7f5",
  ink: "#111111",
  char: "#4b4b4b",
  muted: "#707070",
  line: "#e5e5e5",
  /** 강조색 하나: 채도를 낮춘 주황(연필 색) */
  orange: "#9a4a1c",
  orangeInk: "#9a4a1c",
  orangeTint: "#f7f7f5",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 첫 화면 사진이 다가오는 시간 */
const PHOTO_IN = 1.6;
/** 사진 위 흰 막. 밝은 사진이라 왼쪽 아래를 하얗게 덮고 먹색 글자를 올린다 */
const SCRIM = "linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.1) 80%), linear-gradient(to right, rgba(255,255,255,0.6), rgba(255,255,255,0) 60%)";
const POSTER_CSS = `@keyframes aa-rise{from{opacity:0;transform:translateY(12px)}}.aa-rise{animation:aa-rise .7s cubic-bezier(0.22,1,0.36,1) .3s both}@media (prefers-reduced-motion:reduce){.aa-rise{animation:none}}`;
const IMG = "/images/demo-art-academy";
/** 탭 패널이 왼쪽부터 쓸리며 바뀌는 시간 */
const WIPE = 0.45;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/* ---------- 반과 교습비 ---------- */

type ClassKey = "입시반" | "취미반" | "초등반";
const CLASS_KEYS: ClassKey[] = ["입시반", "취미반", "초등반"];

interface Plan {
  label: string;
  when: string;
  fee: number;
}
interface ClassInfo {
  key: ClassKey;
  who: string;
  subjects: string[];
  cap: number;
  extra: string;
  plans: Plan[];
  note: string;
}

const CLASSES: ClassInfo[] = [
  {
    key: "입시반",
    who: "고1 ~ 고3, 재수생",
    subjects: ["기초디자인", "사고의 전환", "소묘", "정물수채화"],
    cap: 12,
    extra: "재료비 월 50,000원",
    plans: [
      {
        label: "고1, 고2 주 3회",
        when: "월, 수, 금 18:00 ~ 22:00",
        fee: 650000,
      },
      {
        label: "고3, 재수 주 6회",
        when: "월 ~ 금 17:00 ~ 22:00, 토 13:00 ~ 18:00",
        fee: 1200000,
      },
    ],
    note: "지망 대학 실기 유형에 맞춰 과목을 정해요. 처음 오면 연필 깎기와 4B 소묘부터 시작해요.",
  },
  {
    key: "취미반",
    who: "성인, 중학생 이상",
    subjects: ["연필 소묘", "수채화", "드로잉"],
    cap: 8,
    extra: "개인 재료 준비",
    plans: [
      {
        label: "주 1회",
        when: "화 또는 목 19:00 ~ 22:00, 토 10:00 ~ 13:00 중 하나",
        fee: 200000,
      },
      { label: "주 2회", when: "화, 목 19:00 ~ 22:00", fee: 360000 },
    ],
    note: "그림을 처음 그려도 괜찮아요. 첫 달은 선 긋기와 명암 단계부터 해요.",
  },
  {
    key: "초등반",
    who: "초등 1 ~ 6학년",
    subjects: ["관찰 드로잉", "수채화", "만들기"],
    cap: 10,
    extra: "재료비 월 20,000원",
    plans: [
      {
        label: "주 2회",
        when: "월, 수 또는 화, 목 15:00 ~ 16:30",
        fee: 180000,
      },
    ],
    note: "한 반 10명까지만 받아요. 저학년은 크레파스와 물감부터 써요.",
  },
];

/* ---------- 실기 시간표 ---------- */

const WEEK = [
  { dow: 1, label: "월" },
  { dow: 2, label: "화" },
  { dow: 3, label: "수" },
  { dow: 4, label: "목" },
  { dow: 5, label: "금" },
  { dow: 6, label: "토" },
];

interface Row {
  cls: ClassKey;
  name: string;
  times: Partial<Record<number, string>>;
}
const TIMETABLE: Row[] = [
  {
    cls: "입시반",
    name: "고3, 재수",
    times: {
      1: "17:00 ~ 22:00",
      2: "17:00 ~ 22:00",
      3: "17:00 ~ 22:00",
      4: "17:00 ~ 22:00",
      5: "17:00 ~ 22:00",
      6: "13:00 ~ 18:00",
    },
  },
  {
    cls: "입시반",
    name: "고1, 고2",
    times: { 1: "18:00 ~ 22:00", 3: "18:00 ~ 22:00", 5: "18:00 ~ 22:00" },
  },
  {
    cls: "취미반",
    name: "평일 저녁",
    times: { 2: "19:00 ~ 22:00", 4: "19:00 ~ 22:00" },
  },
  { cls: "취미반", name: "토요일", times: { 6: "10:00 ~ 13:00" } },
  {
    cls: "초등반",
    name: "월수반",
    times: { 1: "15:00 ~ 16:30", 3: "15:00 ~ 16:30" },
  },
  {
    cls: "초등반",
    name: "화목반",
    times: { 2: "15:00 ~ 16:30", 4: "15:00 ~ 16:30" },
  },
];

/* ---------- 수업 작품 ---------- */

type Medium = "소묘" | "수채화";
type ObjType = "apple" | "bottle" | "cup" | "lemon" | "jar" | "box";
interface Obj {
  t: ObjType;
  x: number;
  y: number;
  s: number;
}
interface Work {
  id: string;
  medium: Medium;
  cls: string;
  paper: string;
  hours: string;
  objs: Obj[];
}

const TEACHERS = [
  { id: "1", name: "윤ㅈ희", role: "원장", cls: "입시반 소묘, 수채화", career: "서양화 전공, 입시 지도 14년" },
  { id: "2", name: "박ㄷ윤", role: "선생님", cls: "취미반 성인", career: "회화 전공, 개인전 3회" },
  { id: "3", name: "이ㅅ아", role: "선생님", cls: "초등반", career: "미술교육 전공, 아동미술 8년" },
];

const WORKS: Work[] = [
  {
    id: "w1",
    medium: "소묘",
    cls: "입시반 고2",
    paper: "켄트지 4절, 4B 연필",
    hours: "4시간",
    objs: [
      { t: "bottle", x: 120, y: 300, s: 1.1 },
      { t: "cup", x: 205, y: 318, s: 1 },
      { t: "apple", x: 150, y: 342, s: 1 },
    ],
  },
  {
    id: "w2",
    medium: "수채화",
    cls: "입시반 고3",
    paper: "수채화지 4절",
    hours: "3시간",
    objs: [
      { t: "jar", x: 130, y: 300, s: 1.15 },
      { t: "lemon", x: 205, y: 330, s: 0.9 },
      { t: "lemon", x: 95, y: 345, s: 0.85 },
    ],
  },
  {
    id: "w3",
    medium: "소묘",
    cls: "취미반 성인",
    paper: "켄트지 8절, 색연필",
    hours: "3시간씩 2회",
    objs: [
      { t: "box", x: 125, y: 305, s: 1.1 },
      { t: "apple", x: 205, y: 330, s: 0.9 },
      { t: "lemon", x: 110, y: 350, s: 0.8 },
    ],
  },
  {
    id: "w4",
    medium: "수채화",
    cls: "초등반 5학년",
    paper: "수채화지 8절",
    hours: "90분씩 2회",
    objs: [
      { t: "cup", x: 110, y: 310, s: 1.05 },
      { t: "apple", x: 185, y: 330, s: 1 },
      { t: "apple", x: 230, y: 345, s: 0.8 },
    ],
  },
  {
    id: "w5",
    medium: "소묘",
    cls: "입시반 재수",
    paper: "켄트지 4절, 4B 연필",
    hours: "4시간",
    objs: [
      { t: "jar", x: 160, y: 310, s: 1.2 },
      { t: "apple", x: 95, y: 340, s: 0.9 },
    ],
  },
  {
    id: "w6",
    medium: "수채화",
    cls: "입시반 고2",
    paper: "수채화지 4절",
    hours: "3시간",
    objs: [
      { t: "bottle", x: 190, y: 300, s: 1.05 },
      { t: "box", x: 100, y: 330, s: 0.9 },
      { t: "lemon", x: 150, y: 350, s: 0.8 },
    ],
  },
  {
    id: "w7",
    medium: "소묘",
    cls: "취미반 성인",
    paper: "켄트지 8절, 연필",
    hours: "3시간",
    objs: [
      { t: "bottle", x: 95, y: 300, s: 1 },
      { t: "cup", x: 170, y: 322, s: 0.95 },
      { t: "lemon", x: 225, y: 345, s: 0.8 },
    ],
  },
  {
    id: "w8",
    medium: "수채화",
    cls: "취미반 성인",
    paper: "수채화지 8절",
    hours: "3시간씩 2회",
    objs: [
      { t: "jar", x: 105, y: 305, s: 1 },
      { t: "cup", x: 195, y: 318, s: 0.9 },
      { t: "apple", x: 150, y: 345, s: 0.9 },
    ],
  },
];

type GalleryFilter = "전체" | Medium;
const FILTERS: { key: GalleryFilter; label: string }[] = [
  { key: "전체", label: "전체" },
  { key: "소묘", label: "정물 소묘" },
  { key: "수채화", label: "정물 수채화" },
];

/* ---------- 상담 ---------- */

const GRADES = ["초등", "중등", "고1", "고2", "고3", "재수", "성인"] as const;
type Grade = (typeof GRADES)[number];
const suggestClass = (g: Grade): ClassKey => (g === "초등" ? "초등반" : g === "성인" || g === "중등" ? "취미반" : "입시반");
const CONSULT_TIMES = ["15:00", "16:00", "17:00", "19:00", "20:00"];

/** 일요일은 쉰다. d 다음 날부터 n일 */
function openDays(from: Date, n: number) {
  const out: Date[] = [];
  let d = daysAgo(from, -1);
  while (out.length < n) {
    if (d.getDay() !== 0) out.push(d);
    d = daysAgo(d, -1);
  }
  return out;
}
/** 이미 잡힌 상담. 실제로는 상담 일정표에서 읽는다 */
function booked(d: Date, slot: number) {
  const h = (d.getDate() * 31 + slot * 17 + d.getMonth() * 7) % 9;
  return h === 2 || h === 5;
}

export function ArtAcademyDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [cls, setCls] = useState<ClassKey>("입시반");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  const dow = today.getDay();
  const todayRows = TIMETABLE.filter((r) => r.times[dow]);

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("aa-consult")} />

      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:px-6">
        <h2>
          <SampleLogo />
        </h2>
        <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center">
          {[
            ["aa-classes", "반 안내"],
            ["aa-gallery", "수업 작품"],
            ["aa-timetable", "실기 시간표"],
            ["aa-fee", "교습비"],
            ["aa-consult", "상담 신청"],
            ["aa-visit", "오시는 길"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={`rounded-[4px] px-2.5 py-1.5 text-[15px] underline-offset-4 hover:underline ${focusRing}`} style={{ outlineColor: C.ink }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* 오늘 실기 */}
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y py-3 text-[15px]" style={{ borderColor: C.line }}>
          <span className="inline-flex items-center gap-1.5 font-bold">
            <Clock size={17} aria-hidden />
            {fmtKo(today)} 실기
          </span>
          {todayRows.length === 0 ? (
            <span style={{ color: C.muted }}>일요일은 쉬어요. 상담 예약은 받아요.</span>
          ) : (
            todayRows.map((r) => (
              <span key={r.cls + r.name}>
                {r.cls} {r.name} <span style={{ color: C.muted }}>{r.times[dow]}</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* 1. 반 안내 */}
      <section id="aa-classes" aria-labelledby="aa-classes-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="aa-classes-title" title="반 안내" />
        <ClassPicker reduce={reduce} cls={cls} setCls={setCls} onConsult={() => go("aa-consult")} />
      </section>

      {/* 2. 수업 작품 */}
      <section id="aa-gallery" aria-labelledby="aa-gallery-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="aa-gallery-title" title="수업 작품" />
        <Gallery reduce={reduce} />
      </section>

      {/* 선생님 */}
      <section id="aa-teachers" aria-labelledby="aa-teachers-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="aa-teachers-title" title="선생님" />
        <ul className="grid gap-8 sm:grid-cols-3 md:gap-6">
          {TEACHERS.map((t) => (
            <li key={t.id}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
              <img src={`${IMG}/teacher-${t.id}.jpg`} alt={`${t.name} ${t.role}`} className="block aspect-[4/5] w-full rounded-[6px] object-cover" />
              <p className="mt-3 text-[18px] font-bold">
                {t.name} <span className="text-[15px] font-semibold" style={{ color: C.muted }}>{t.role}</span>
              </p>
              <p className="mt-1 text-[15px] font-semibold" style={{ color: C.orangeInk }}>
                {t.cls}
              </p>
              <p className="mt-1 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
                {t.career}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. 실기 시간표 */}
      <section id="aa-timetable" aria-labelledby="aa-timetable-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="aa-timetable-title" title="실기 시간표" />
        <Timetable dow={dow} initial={cls} />
      </section>

      {/* 교습비 게시표 */}
      <section id="aa-fee" aria-labelledby="aa-fee-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="aa-fee-title" title="교습비 안내" />
        <FeeTable />
      </section>

      {/* 4. 상담 신청 */}
      <section id="aa-consult" aria-labelledby="aa-consult-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="aa-consult-title" title="상담 신청" />
        <ConsultForm today={today} reduce={reduce} preset={cls} />
      </section>

      {/* 오시는 길 */}
      <section id="aa-visit" aria-labelledby="aa-visit-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="aa-visit-title" title="오시는 길" />
        <Visit dow={dow} />
      </section>

      <footer className="mt-20 border-t px-4 pb-24 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted, background: C.soft }}>
        <div className="mx-auto max-w-[1200px]">
          <p>
            <SampleLogo size={18} />
          </p>
          <p>
            {ADDRESS} | 전화 {TEL} | {KAKAO}
          </p>
          <p>평일 14:00 ~ 22:00, 토 10:00 ~ 18:00, 일요일 휴무</p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

/* ---------- 공용 조각 ---------- */

function SectionTitle({ id, title }: { id: string; title: string }) {
  return (
    <div className="mb-6 border-b pb-3" style={{ borderColor: C.line }}>
      <h2 id={id} className="text-[28px] font-bold leading-tight tracking-[-0.03em] md:text-[36px]">
        {title}
      </h2>
    </div>
  );
}

function Chip({ on, onClick, children, gtm, noCheck }: { on: boolean; onClick: () => void; children: ReactNode; gtm?: string; noCheck?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      data-gtm-cta={gtm}
      className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-[4px] border px-3.5 text-[15px] font-semibold transition-colors duration-150 ${focusRing}`}
      style={{
        borderColor: on ? C.orangeInk : "#c8c8c8",
        background: on ? C.orangeInk : C.sheet,
        color: on ? "#fff" : C.ink,
        outlineColor: C.orangeInk,
      }}
    >
      {on && !noCheck && <Check size={15} aria-hidden />}
      {children}
    </button>
  );
}

/* ---------- 포스터 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  return (
    <section id="aa-poster" ref={ref} aria-labelledby="aa-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: C.soft, color: C.ink }}>
      <style>{POSTER_CSS}</style>
      <motion.div className="absolute inset-0" style={{ y: photoY }}>
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: reduce ? 0 : PHOTO_IN, ease: EASE }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="스케치북에 연필로 사람 얼굴 소묘를 그리는 손"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "60% center" }}
          />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0" style={{ background: SCRIM }} aria-hidden />

      {/* 로고와 핵심 행동 하나 */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 pt-4 md:px-6 md:pt-6">
        <p className="rounded-[6px] px-2 py-1.5" style={{ background: "rgba(255,255,255,0.85)" }}>
          <SampleLogo size={18} />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta="art-academy_poster_cta"
          className={`inline-flex h-11 flex-none items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold text-white ${focusRing}`}
          style={{ background: C.orangeInk, outlineColor: C.ink }}
        >
          <CalendarCheck size={17} aria-hidden />
          상담 예약
        </button>
      </div>

      {/* 문장 */}
      <div className={`${reduce ? "" : "aa-rise"} relative z-10 mx-auto mt-auto w-full max-w-[1200px] px-4 pb-[12svh] md:px-6`}>
        <h1
          id="aa-poster-title"
          className="text-[36px] font-bold md:text-[clamp(40px,5vw,72px)]"
          style={{ wordBreak: "keep-all", letterSpacing: "-0.03em", lineHeight: 1.2 }}
        >
          연필 깎는 법부터
          <br />
          같이 해요
        </h1>
        <p className="mt-4 text-[16px] font-medium md:mt-6 md:text-[18px]" style={{ color: C.char }}>
          입시반, 취미반, 초등반 모집
        </p>
      </div>
    </section>
  );
}

/* ---------- 1. 반 안내 ---------- */

function ClassPicker({ reduce, cls, setCls, onConsult }: { reduce: boolean; cls: ClassKey; setCls: (c: ClassKey) => void; onConsult: () => void }) {
  const info = CLASSES.find((c) => c.key === cls) ?? CLASSES[0];
  const [planIdx, setPlanIdx] = useState(0);
  const plan = info.plans[Math.min(planIdx, info.plans.length - 1)];

  return (
    <div>
      <div role="tablist" aria-label="반 고르기" className="flex border-b" style={{ borderColor: C.line }}>
        {CLASS_KEYS.map((k) => {
          const on = k === cls;
          return (
            <button
              key={k}
              type="button"
              role="tab"
              id={`aa-tab-${k}`}
              aria-selected={on}
              aria-controls="aa-class-panel"
              onClick={() => {
                setCls(k);
                setPlanIdx(0);
              }}
              className={`relative -mb-px px-4 pb-3 pt-2 text-[18px] font-bold md:px-6 md:text-[20px] ${focusRing}`}
              style={{
                color: on ? C.ink : C.muted,
                outlineColor: C.orangeInk,
              }}
            >
              {k}
              {on && (
                <motion.span
                  layoutId={reduce ? undefined : "aa-tab-line"}
                  className="absolute inset-x-2 bottom-0 h-[2px]"
                  style={{ background: C.orange }}
                  transition={{ duration: 0.3, ease: EASE }}
                />
              )}
            </button>
          );
        })}
      </div>

      <motion.div
        key={cls}
        id="aa-class-panel"
        role="tabpanel"
        aria-labelledby={`aa-tab-${cls}`}
        initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: reduce ? 0 : WIPE, ease: EASE }}
        className="grid gap-6 border-x border-b p-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-10 md:p-8"
        style={{ borderColor: C.line, background: C.sheet }}
      >
        <div>
          <dl className="grid grid-cols-[88px_minmax(0,1fr)] gap-y-3 text-[16px] leading-[1.6]">
            <dt style={{ color: C.muted }}>대상</dt>
            <dd className="font-semibold">{info.who}</dd>
            <dt style={{ color: C.muted }}>실기 과목</dt>
            <dd className="flex flex-wrap gap-1.5">
              {info.subjects.map((s) => (
                <span key={s} className="rounded-[3px] border px-2 py-0.5 text-[14px]" style={{ borderColor: C.line }}>
                  {s}
                </span>
              ))}
            </dd>
            <dt style={{ color: C.muted }}>정원</dt>
            <dd>반당 {info.cap}명</dd>
          </dl>

          <p className="mt-6 text-[15px] font-bold">수업 횟수</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {info.plans.map((pl, i) => (
              <Chip key={pl.label} on={pl === plan} onClick={() => setPlanIdx(i)}>
                {pl.label}
              </Chip>
            ))}
          </div>
          <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
            {plan.when}
          </p>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t pt-5" style={{ borderColor: C.line }}>
            <div>
              <p className="text-[14px]" style={{ color: C.muted }}>
                월 교습비
              </p>
              <p className="text-[32px] font-bold leading-tight tracking-[-0.02em] tabular-nums md:text-[36px]">
                {won(plan.fee)}
              </p>
              <p className="text-[14px]" style={{ color: C.muted }}>
                {info.extra}
              </p>
            </div>
            <button
              type="button"
              onClick={onConsult}
              data-gtm-cta="art-academy_class_consult"
              className={`inline-flex min-h-[48px] items-center gap-2 rounded-[6px] px-5 text-[16px] font-semibold text-white ${focusRing}`}
              style={{ background: C.orangeInk, outlineColor: C.ink }}
            >
              <CalendarCheck size={18} aria-hidden />
              {cls} 상담 예약
            </button>
          </div>
        </div>

        <figure className="flex w-full flex-col md:max-w-[360px] md:justify-self-end">
          <div className="relative border p-3" style={{ borderColor: C.line, background: "#fff" }}>
            <StillLife work={cls === "입시반" ? WORKS[0] : cls === "취미반" ? WORKS[7] : WORKS[3]} />
          </div>
          <figcaption className="mt-3 text-[15px] leading-[1.6]" style={{ color: C.char }}>
            {info.note}
          </figcaption>
        </figure>
      </motion.div>
    </div>
  );
}

/* ---------- 정물 그림(수업 작품) ---------- */

function StillLife({ work }: { work: Work }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다
    <img src={`${IMG}/work-${work.id}.jpg`} alt={`${work.cls} ${work.medium === "수채화" ? "정물 수채화" : "정물 소묘"}`} className="block aspect-[3/4] h-auto w-full object-cover" />
  );
}

/* ---------- 2. 수업 작품 ---------- */

function Gallery({ reduce }: { reduce: boolean }) {
  const [filter, setFilter] = useState<GalleryFilter>("전체");
  const [open, setOpen] = useState<number | null>(null);
  const list = useMemo(() => (filter === "전체" ? WORKS : WORKS.filter((w) => w.medium === filter)), [filter]);
  const lastBtn = useRef<HTMLButtonElement | null>(null);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="작품 종류">
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            on={filter === f.key}
            onClick={() => {
              setFilter(f.key);
              setOpen(null);
            }}
          >
            {f.label}
          </Chip>
        ))}
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
        {list.map((w, i) => (
          <motion.li key={w.id} layout={!reduce} transition={{ duration: 0.3, ease: EASE }}>
            <button
              type="button"
              onClick={(e) => {
                lastBtn.current = e.currentTarget;
                setOpen(i);
              }}
              aria-label={`${w.cls} ${w.medium === "소묘" ? "정물 소묘" : "정물 수채화"} 크게 보기`}
              className={`relative block w-full overflow-hidden rounded-[6px] border bg-white text-left ${focusRing}`}
              style={{ borderColor: C.line, outlineColor: C.orangeInk }}
            >
              <StillLife work={w} />
            </button>
            <p className="mt-2 text-[15px] font-semibold">{w.cls}</p>
            <p className="text-[14px]" style={{ color: C.muted }}>
              {w.medium === "소묘" ? "정물 소묘" : "정물 수채화"}, {w.hours}
            </p>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {open !== null && list[open] && (
          <Lightbox
            reduce={reduce}
            work={list[open]}
            index={open}
            total={list.length}
            onMove={(d) => setOpen((o) => (o === null ? o : (o + d + list.length) % list.length))}
            onClose={() => {
              setOpen(null);
              lastBtn.current?.focus();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Lightbox({ reduce, work, index, total, onMove, onClose }: { reduce: boolean; work: Work; index: number; total: number; onMove: (d: number) => void; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onMove(1);
      else if (e.key === "ArrowLeft") onMove(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onMove]);

  const navBtn = `inline-flex h-11 w-11 items-center justify-center rounded-full border ${focusRing}`;
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${work.cls} 작품 크게 보기`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(24,22,20,0.86)" }}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        key={work.id}
        className="w-full max-w-[460px] rounded-[8px] p-4"
        style={{ background: C.sheet }}
        initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
      >
        <div className="max-h-[62svh] overflow-hidden">
          <StillLife work={work} />
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[17px] font-bold">
              {work.cls}, {work.medium === "소묘" ? "정물 소묘" : "정물 수채화"}
            </p>
            <p className="text-[14px]" style={{ color: C.muted }}>
              {work.paper}, {work.hours}
            </p>
          </div>
          <p className="text-[14px] tabular-nums" style={{ color: C.muted }}>
            {index + 1} / {total}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button type="button" aria-label="이전 작품" onClick={() => onMove(-1)} className={navBtn} style={{ borderColor: C.line, outlineColor: C.orangeInk }}>
              <ChevronLeft size={20} aria-hidden />
            </button>
            <button type="button" aria-label="다음 작품" onClick={() => onMove(1)} className={navBtn} style={{ borderColor: C.line, outlineColor: C.orangeInk }}>
              <ChevronRight size={20} aria-hidden />
            </button>
          </div>
          <button ref={closeRef} type="button" aria-label="닫기" onClick={onClose} className={navBtn} style={{ borderColor: C.line, outlineColor: C.orangeInk }}>
            <X size={20} aria-hidden />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- 3. 실기 시간표 ---------- */

function Timetable({ dow, initial }: { dow: number; initial: ClassKey }) {
  const [pick, setPick] = useState<ClassKey | "전체">("전체");
  // 반 안내에서 고른 반을 칩 첫머리에 둔다
  const order: (ClassKey | "전체")[] = ["전체", initial, ...CLASS_KEYS.filter((k) => k !== initial)];

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="반 고르기">
        {order.map((k) => (
          <Chip key={k} on={pick === k} onClick={() => setPick(k)}>
            {k}
          </Chip>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto border" style={{ borderColor: C.line, background: C.sheet }}>
        <table className="w-full min-w-[720px] border-collapse text-[15px]">
          <caption className="sr-only">반별 요일 실기 시간. 일요일은 쉬어요.</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[150px] border-b px-3 py-3 text-left font-bold" style={{ borderColor: C.line }}>
                반
              </th>
              {WEEK.map((d) => {
                const isToday = d.dow === dow;
                return (
                  <th
                    key={d.dow}
                    scope="col"
                    className="border-b px-2 py-3 text-center font-bold"
                    style={{
                      borderColor: C.line,
                      background: isToday ? C.orangeTint : undefined,
                    }}
                  >
                    {d.label}
                    {isToday && (
                      <span className="ml-1 rounded-[3px] px-1.5 py-0.5 text-[12px] text-white" style={{ background: C.orangeInk }}>
                        오늘
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {TIMETABLE.map((r) => {
              const on = pick === "전체" || pick === r.cls;
              return (
                <tr key={r.cls + r.name} className="transition-opacity duration-200" style={{ opacity: on ? 1 : 0.32 }}>
                  <th scope="row" className="border-b px-3 py-3 text-left font-semibold" style={{ borderColor: C.line }}>
                    {r.cls}
                    <span className="block text-[13px] font-normal" style={{ color: C.muted }}>
                      {r.name}
                    </span>
                  </th>
                  {WEEK.map((d) => {
                    const t = r.times[d.dow];
                    return (
                      <td
                        key={d.dow}
                        className="border-b px-2 py-3 text-center tabular-nums"
                        style={{
                          borderColor: C.line,
                          background: d.dow === dow ? C.soft : undefined,
                        }}
                      >
                        {t ? (
                          <span
                            className="inline-block rounded-[3px] border px-1.5 py-1 text-[13px] font-semibold"
                            style={{
                              borderColor: on && pick !== "전체" ? C.orangeInk : C.line,
                              background: "#fff",
                            }}
                          >
                            {t}
                          </span>
                        ) : (
                          <span style={{ color: C.muted }}>-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
        방학 특강 기간(여름, 겨울)에는 입시반 시간이 낮으로 바뀌어요.
      </p>
    </div>
  );
}

/* ---------- 교습비 게시표 ---------- */

function FeeTable() {
  return (
    <div className="overflow-x-auto border" style={{ borderColor: C.line, background: C.sheet }}>
      <table className="w-full min-w-[640px] border-collapse text-[15px]">
        <caption className="sr-only">교습과정별 월 교습비와 기타경비</caption>
        <thead>
          <tr style={{ background: C.soft, color: C.ink }}>
            {["교습과정", "대상", "수업", "정원", "월 교습비", "기타경비"].map((h) => (
              <th key={h} scope="col" className="border-b px-3 py-3 text-left font-bold" style={{ borderColor: C.line }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CLASSES.flatMap((c) =>
            c.plans.map((pl) => (
              <tr key={c.key + pl.label}>
                <td className="border-b px-3 py-3 font-semibold" style={{ borderColor: C.line }}>
                  {c.key}
                </td>
                <td className="border-b px-3 py-3" style={{ borderColor: C.line }}>
                  {c.who}
                </td>
                <td className="border-b px-3 py-3" style={{ borderColor: C.line }}>
                  {pl.label}
                </td>
                <td className="border-b px-3 py-3" style={{ borderColor: C.line }}>
                  {c.cap}명
                </td>
                <td className="border-b px-3 py-3 font-bold tabular-nums" style={{ borderColor: C.line }}>
                  {won(pl.fee)}
                </td>
                <td className="border-b px-3 py-3" style={{ borderColor: C.line, color: C.muted }}>
                  {c.extra}
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- 4. 상담 신청 ---------- */

interface Receipt {
  no: string;
  name: string;
  phone: string;
  grade: Grade;
  cls: ClassKey;
  date: Date;
  time: string;
  reply: Date;
}

function ConsultForm({ today, reduce, preset }: { today: Date; reduce: boolean; preset: ClassKey }) {
  const days = useMemo(() => openDays(today, 6), [today]);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [cls, setCls] = useState<ClassKey | null>(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Receipt | null>(null);

  const chosenCls = cls ?? (grade ? suggestClass(grade) : preset);
  const day = days[Math.min(dayIdx, days.length - 1)];
  const phoneOk = /^01[016789]\d{7,8}$/.test(phone.replace(/\D/g, ""));
  const errors = {
    grade: !grade ? "학생 학년을 골라 주세요." : "",
    time: !time ? "상담 시간을 골라 주세요." : "",
    name: name.trim().length < 2 ? "이름을 2글자 이상 적어 주세요." : "",
    phone: !phoneOk ? "휴대폰 번호를 확인해 주세요." : "",
    agree: !agree ? "개인정보 수집에 동의해 주세요." : "",
  };
  const firstError = Object.values(errors).find(Boolean);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (firstError || !grade || !time) return;
    const reply = today;
    setDone({
      no: `AA-${p2(today.getMonth() + 1)}${p2(today.getDate())}-${String(100 + ((name.length * 37 + phone.length * 11 + dayIdx * 7) % 900))}`,
      name: maskName(name),
      phone: maskPhone(phone),
      grade,
      cls: chosenCls,
      date: day,
      time,
      reply,
    });
  };

  const reset = () => {
    setDone(null);
    setGrade(null);
    setCls(null);
    setTime(null);
    setName("");
    setPhone("");
    setAgree(false);
    setTried(false);
  };

  const label = "text-[15px] font-bold";
  const err = (m: string, id: string) =>
    tried && m ? (
      <p id={id} className="mt-1.5 inline-flex items-center gap-1 text-[14px]" style={{ color: C.error }}>
        <AlertCircle size={15} aria-hidden />
        {m}
      </p>
    ) : null;

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-10">
      <div className="text-[16px] leading-[1.75]">
        <p className="text-[22px] font-bold leading-snug">
          방문 상담은 30분 정도 걸려요
        </p>
        <p className="mt-3" style={{ color: C.muted }}>
          그려 둔 그림이 있으면 몇 장 가져와 주세요. 없으면 그날 연필 소묘를 짧게 같이 해 봐요.
        </p>
        <ul className="mt-5 space-y-2">
          <li className="flex items-center gap-2">
            <Clock size={17} aria-hidden />
            상담 시간 평일 15:00 ~ 21:00, 토 10:00 ~ 17:00
          </li>
          <li className="flex items-center gap-2">
            <Phone size={17} aria-hidden />
            전화 {TEL}
          </li>
          <li className="flex items-center gap-2">
            <Check size={17} aria-hidden />
            {KAKAO}
          </li>
        </ul>
      </div>

      <div className="relative rounded-[8px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.sheet }}>
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div
              key="done"
              initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }}
              transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
              role="status"
            >
              <p className="text-[24px] font-bold">
                상담 신청이 접수됐어요
              </p>
              <dl className="mt-5 grid grid-cols-[96px_minmax(0,1fr)] gap-y-2.5 text-[16px]">
                <dt style={{ color: C.muted }}>접수 번호</dt>
                <dd className="font-bold tabular-nums">{done.no}</dd>
                <dt style={{ color: C.muted }}>상담 일시</dt>
                <dd className="font-semibold">
                  {fmtKo(done.date)} {done.time}
                </dd>
                <dt style={{ color: C.muted }}>학생</dt>
                <dd>
                  {done.grade}, {done.cls}
                </dd>
                <dt style={{ color: C.muted }}>신청자</dt>
                <dd>
                  {done.name}, {done.phone}
                </dd>
                <dt style={{ color: C.muted }}>담당 창구</dt>
                <dd>
                  {KAKAO} 또는 전화 {TEL}
                </dd>
                <dt style={{ color: C.muted }}>회신 예정</dt>
                <dd className="font-semibold">{fmtKo(done.reply)} 밤 9시까지 문자로 확정 연락</dd>
              </dl>
              <button
                type="button"
                onClick={reset}
                className={`mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-[4px] border px-4 text-[15px] font-semibold ${focusRing}`}
                style={{ borderColor: "#c8c8c8", outlineColor: C.orangeInk }}
              >
                <RotateCcw size={16} aria-hidden />
                다시 신청하기
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" noValidate onSubmit={submit} exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }} aria-label="상담 신청서">
              <fieldset>
                <legend className={label}>학생 학년</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {GRADES.map((g) => (
                    <Chip
                      key={g}
                      on={grade === g}
                      onClick={() => {
                        setGrade(g);
                        setCls(null);
                      }}
                    >
                      {g}
                    </Chip>
                  ))}
                </div>
                {err(errors.grade, "aa-err-grade")}
              </fieldset>

              <fieldset className="mt-5">
                <legend className={label}>관심 반</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CLASS_KEYS.map((k) => (
                    <Chip key={k} on={chosenCls === k} onClick={() => setCls(k)}>
                      {k}
                    </Chip>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-5">
                <legend className={label}>방문 날짜</legend>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {days.map((d, i) => (
                    <Chip
                      key={d.toDateString()}
                      noCheck
                      on={dayIdx === i}
                      onClick={() => {
                        setDayIdx(i);
                        setTime(null);
                      }}
                    >
                      <span className="w-full text-center">
                        {d.getMonth() + 1}/{d.getDate()} {"일월화수목금토"[d.getDay()]}
                      </span>
                    </Chip>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-5">
                <legend className={label}>상담 시간</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CONSULT_TIMES.map((t, i) => {
                    const full = booked(day, i) || (day.getDay() === 6 && i >= 3);
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={full}
                        aria-pressed={time === t}
                        onClick={() => setTime(t)}
                        className={`inline-flex min-h-[40px] items-center rounded-[4px] border px-3.5 text-[15px] font-semibold tabular-nums disabled:cursor-not-allowed ${focusRing}`}
                        style={{
                          borderColor: time === t ? C.orangeInk : full ? C.line : "#c8c8c8",
                          background: time === t ? C.orangeInk : full ? "transparent" : C.sheet,
                          color: time === t ? "#fff" : full ? C.muted : C.ink,
                          textDecoration: full ? "line-through" : undefined,
                          outlineColor: C.orangeInk,
                        }}
                      >
                        {t}
                        {full && <span className="ml-1 text-[13px] no-underline">마감</span>}
                      </button>
                    );
                  })}
                </div>
                {err(errors.time, "aa-err-time")}
              </fieldset>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="aa-name" className={label}>
                    이름(보호자 또는 본인)
                  </label>
                  <input
                    id="aa-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    aria-invalid={tried && !!errors.name}
                    aria-describedby={tried && errors.name ? "aa-err-name" : undefined}
                    className={`mt-2 block h-12 w-full rounded-[4px] border bg-white px-3 text-[16px] ${focusRing}`}
                    style={{
                      borderColor: tried && errors.name ? C.error : "#c8c8c8",
                      outlineColor: C.orangeInk,
                    }}
                  />
                  {err(errors.name, "aa-err-name")}
                </div>
                <div>
                  <label htmlFor="aa-phone" className={label}>
                    휴대폰
                  </label>
                  <input
                    id="aa-phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    autoComplete="tel"
                    aria-invalid={tried && !!errors.phone}
                    aria-describedby={tried && errors.phone ? "aa-err-phone" : undefined}
                    className={`mt-2 block h-12 w-full rounded-[4px] border bg-white px-3 text-[16px] ${focusRing}`}
                    style={{
                      borderColor: tried && errors.phone ? C.error : "#c8c8c8",
                      outlineColor: C.orangeInk,
                    }}
                  />
                  {err(errors.phone, "aa-err-phone")}
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-[15px]">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`mt-1 h-5 w-5 flex-none ${focusRing}`} style={{ accentColor: C.orangeInk }} />
                <span>상담 연락을 위한 이름, 연락처 수집에 동의해요(상담 뒤 3개월 보관)</span>
              </label>
              {err(errors.agree, "aa-err-agree")}

              <button
                type="submit"
                data-gtm-cta="art-academy_consult_submit"
                className={`mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[6px] text-[17px] font-semibold text-white ${focusRing}`}
                style={{ background: C.orangeInk, outlineColor: C.ink }}
              >
                <CalendarCheck size={19} aria-hidden />
                {fmtKo(day)} {time ?? ""} 상담 신청
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- 오시는 길 ---------- */

const HOURS = [
  { dows: [1, 2, 3, 4, 5], label: "평일", open: "14:00 ~ 22:00" },
  { dows: [6], label: "토요일", open: "10:00 ~ 18:00" },
  { dows: [0], label: "일요일", open: "휴무" },
];

function Visit({ dow }: { dow: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-10">
      {/* 약도 */}
      <div className="overflow-hidden rounded-[8px] border" style={{ borderColor: C.line, background: "#fff" }}>
        <svg viewBox="0 0 520 320" className="block h-auto w-full" role="img" aria-label="ㅇㅇ역 2번 출구에서 큰길을 따라 걸어 두 번째 골목 모퉁이 건물 3층에 있는 학원 약도">
          <rect width="520" height="320" fill={C.soft} />
          <g fill="#ffffff" stroke="#dcdcdc" strokeWidth="1">
            <rect x="-2" y="150" width="524" height="40" />
            <rect x="330" y="-2" width="40" height="152" />
            <rect x="330" y="190" width="40" height="132" />
            <rect x="140" y="190" width="30" height="132" />
          </g>
          <rect x="380" y="60" width="90" height="80" rx="4" fill={C.orangeInk} />
          <text x="425" y="106" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff">
            학원 3층
          </text>
          <rect x="60" y="200" width="70" height="40" rx="4" fill="#fff" stroke={C.ink} strokeWidth="1" />
          <text x="95" y="225" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink}>
            ㅇㅇ역 2번
          </text>
          <path d="M120 170 L360 170" stroke={C.orangeInk} strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" fill="none" />
          <text x="230" y="140" textAnchor="middle" fontSize="13" fill={C.muted}>
            ㅇㅇ로
          </text>
        </svg>
      </div>

      <div className="text-[16px] leading-[1.75]">
        <p className="inline-flex items-start gap-2 font-semibold">
          <MapPin size={18} className="mt-1 flex-none" aria-hidden />
          {ADDRESS}
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-start gap-2">
            <TrainFront size={18} className="mt-1 flex-none" aria-hidden />
            ㅇㅇ역 2번 출구에서 걸어서 5분
          </li>
          <li className="flex items-start gap-2">
            <Bus size={18} className="mt-1 flex-none" aria-hidden />
            ㅇㅇ사거리 정류장 하차
          </li>
          <li className="flex items-start gap-2">
            <Car size={18} className="mt-1 flex-none" aria-hidden />
            건물 지하 주차 가능(상담 방문 1시간)
          </li>
        </ul>
        <table className="mt-6 w-full border-collapse text-[15px]">
          <caption className="sr-only">운영 시간</caption>
          <tbody>
            {HOURS.map((h) => {
              const now = h.dows.includes(dow);
              return (
                <tr key={h.label} className="border-b" style={{ borderColor: C.line }}>
                  <th scope="row" className="py-2.5 pr-4 text-left font-semibold">
                    {h.label}
                    {now && (
                      <span className="ml-2 rounded-[3px] px-1.5 py-0.5 text-[12px] text-white" style={{ background: C.orangeInk }}>
                        오늘
                      </span>
                    )}
                  </th>
                  <td className="py-2.5 tabular-nums" style={{ fontWeight: now ? 700 : 400 }}>
                    {h.open}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  const mark = size + 8;
  return (
    <span className="inline-flex items-center gap-2 leading-none" style={{ color: light ? "#fff" : "#111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={mark} height={mark} className="shrink-0" style={{ width: mark, height: mark }} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          곰파트너
        </span>
        <span className="text-[12px] font-semibold opacity-75">미술학원 샘플</span>
      </span>
    </span>
  );
}
