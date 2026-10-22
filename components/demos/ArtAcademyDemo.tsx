"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { AlertCircle, Bus, CalendarCheck, Car, Check, ChevronLeft, ChevronRight, Clock, MapPin, Phone, RotateCcw, TrainFront, X } from "lucide-react";
import { Black_Han_Sans, Nanum_Pen_Script } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 입시 미술학원 홈페이지 샘플: 가상의 곰파트너미술학원. 입시반(고1 ~ 재수), 성인 취미반, 초등반을 같이 운영한다.
   상호, 주소, 전화번호는 모두 가상이다. 학생 이름과 합격 실적은 넣지 않는다.

   국내 입시 미술학원 사이트 공통 구성(참고): 메뉴는 학원 소개, 입시반(기초디자인, 사고의 전환, 소묘, 정물수채화),
   취미반, 초등반(아동미술), 실기 시간표, 수업 작품, 교습비 안내, 상담 신청, 오시는 길.
   첫 화면에는 모집 중인 반과 상담 예약 버튼을 둔다. 교습비는 교육청 신고 교습비처럼 "월 교습비"와 기타경비(재료비)를 표로 공개한다.
   관용 문구: 방문 상담, 상담 예약, 실기 시간표, 평일반, 주말반, 재료비 별도, 수업 작품.

   포스터 첫 화면(aa-poster): 종이 흰색 바탕에 큰 문장 "연필 깎는 법부터 같이 해요" 하나만 둔다. 메뉴, 카드, 가격은 없다.
   오른쪽(휴대폰은 아래)에 목탄 선이 천, 병, 사과 정물 소묘를 그려 나가고, 이어 명암이 깔리고 해칭이 쌓인다.
   사과에만 주황 파스텔 몇 획, 앞에는 깎아 둔 주황 연필과 연필밥. 스크롤하면 스케치북 한 장이 위로 넘어가며 아래 화면이 나온다.
   동작 줄이기면 다 그려진 그림으로 고정하고 넘김도 없다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 반 안내: 입시반, 취미반, 초등반 탭과 주 횟수 칩. 고르면 과목, 수업 시간, 정원, 월 교습비가 바뀐다.
   2. 수업 작품: 정물 소묘, 정물 수채화로 거르고, 누르면 크게 보기(좌우 화살표 키, Esc).
   3. 실기 시간표: 반을 고르면 그 반 줄만 진하게, 오늘 요일 열을 표시한다.
   4. 상담 신청: 학년, 관심 반, 방문 날짜와 시간, 이름과 연락처. 접수 번호, 담당 창구, 회신 예정일이 찍힌 접수증을 보여 준다. */

const heavyF = {
  fontFamily: `${Black_Han_Sans.style.fontFamily}, sans-serif`,
  fontWeight: 400,
} as const;
const penF = {
  fontFamily: `${Nanum_Pen_Script.style.fontFamily}, cursive`,
} as const;

const BRAND = "곰파트너미술학원";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";

const C = {
  paper: "#f6f3ec",
  sheet: "#fbf9f4",
  under: "#e6dfd0",
  ink: "#1f1d1a",
  char: "#3a3733",
  muted: "#5d5852",
  line: "#d8d1c3",
  orange: "#e2621b",
  orangeInk: "#b8470f",
  orangeTint: "#fbe6d8",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 목탄 선 한 획이 그려지는 시간과 획 사이 간격 */
const LINE_DUR = 0.7;
const LINE_GAP = 0.07;
/** 명암 칠이 올라오는 시작과 길이 */
const TONE_AT = 0.8;
const TONE_DUR = 0.6;
/** 해칭이 쌓이는 시작과 길이 */
const HATCH_AT = 1.0;
const HATCH_DUR = 0.8;
/** 주황 파스텔과 문장 밑줄 */
const ORANGE_AT = 1.35;
const ORANGE_DUR = 0.5;
/** 스케치북 넘김이 끝나는 스크롤 진행도(포스터 래퍼 기준). 고정이 풀리기 전에 끝낸다 */
const FLIP_END = 0.42;
/** 탭 패널이 왼쪽부터 쓸리며 바뀌는 시간 */
const WIPE = 0.45;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/** 종이 결. 정지 이미지라 필터 비용은 한 번뿐이다 */
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.12  0 0 0 0 0.11  0 0 0 0 0.1  0 0 0 0.1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

/** 사각 영역에 45도 사선 해칭을 긋는 path. dir 이 -1 이면 반대 방향 */
function hatchD(x0: number, y0: number, x1: number, y1: number, gap: number, dir: 1 | -1 = 1) {
  const h = y1 - y0;
  const out: string[] = [];
  for (let c = x0 - h; c < x1; c += gap) {
    if (dir === 1) out.push(`M${c.toFixed(1)} ${y1}L${(c + h).toFixed(1)} ${y0}`);
    else out.push(`M${c.toFixed(1)} ${y0}L${(c + h).toFixed(1)} ${y1}`);
  }
  return out.join("");
}

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
    paper: "켄트지 8절, 연필",
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
        <h2 className="inline-flex items-center gap-2 text-[22px] leading-none" style={heavyF}>
          <PencilMark size={24} />
          {BRAND}
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

      <footer className="mt-20 border-t px-4 pb-24 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted, background: C.sheet }}>
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[16px] font-bold" style={{ color: C.ink }}>
            {BRAND}
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
    <div className="mb-6 flex items-end gap-4">
      <h2 id={id} className="text-[30px] leading-none md:text-[40px]" style={heavyF}>
        {title}
      </h2>
      {/* 목탄으로 그은 듯한 가로줄 */}
      <svg aria-hidden viewBox="0 0 400 12" preserveAspectRatio="none" className="mb-1 h-3 min-w-0 flex-1">
        <path d="M2 7 C80 4 160 9 240 6 C300 4 360 8 398 5" fill="none" stroke={C.char} strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
        <path d="M6 9 C90 7 170 10 250 8" fill="none" stroke={C.char} strokeWidth="1" strokeLinecap="round" opacity="0.35" />
      </svg>
    </div>
  );
}

function PencilMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <g transform="rotate(-45 12 12)">
        <rect x="1" y="9" width="15" height="6" fill={C.orange} />
        <rect x="1" y="9" width="15" height="2" fill="#f2915a" />
        <path d="M16 9 L21 12 L16 15 Z" fill="#e9c9a0" />
        <path d="M19.6 11.2 L22.4 12 L19.6 12.8 Z" fill={C.ink} />
      </g>
    </svg>
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
        borderColor: on ? C.ink : C.line,
        background: on ? C.ink : C.sheet,
        color: on ? C.sheet : C.ink,
        outlineColor: C.orangeInk,
      }}
    >
      {on && !noCheck && <Check size={15} aria-hidden />}
      {children}
    </button>
  );
}

/* ---------- 포스터 ---------- */

/** 포스터 그림 좌표(viewBox 640 x 720) */
const BOTTLE_D = "M284 116 L284 228 C284 262 236 278 236 318 L236 556 C236 572 364 572 364 556 L364 318 C364 278 316 262 316 228 L316 116 Z";
const APPLE_D = "M450 452 C488 432 532 458 530 512 C528 566 492 594 454 590 C444 588 438 584 428 586 C390 592 372 556 374 512 C376 462 414 436 450 452 Z";
const SHADOW_D = "M364 546 C430 538 530 534 610 540 C580 556 440 566 364 568 Z";

/** 그려지는 순서대로 목탄 윤곽선. [d, 굵기] */
const OUTLINES: [string, number][] = [
  ["M18 566 C180 560 420 556 622 552", 2.4],
  ["M70 150 C150 140 200 160 236 150", 2],
  ["M70 150 C96 250 84 380 112 470 C122 510 104 540 96 566", 2.4],
  ["M150 160 C160 260 140 380 170 520 C176 545 168 556 162 566", 1.6],
  [BOTTLE_D, 2.8],
  ["M278 110 C278 99 322 99 322 110 C322 121 278 121 278 110 Z", 2],
  ["M284 134 C292 139 308 139 316 134", 1.6],
  [APPLE_D, 2.8],
  ["M450 454 C448 436 452 420 462 410", 3],
  ["M456 440 C470 418 498 418 506 426 C494 440 474 446 456 440 Z", 2],
  ["M40 640 C140 600 230 618 330 600 C420 584 520 612 610 590", 1.8],
  ["M120 712 C150 662 200 640 250 622", 1.4],
];

/** 해칭 묶음. [clip id 접미사, d, 진하기] */
const HATCHES: [string, string, number][] = [
  ["bg", hatchD(372, 150, 630, 548, 9), 0.32],
  ["bottle", hatchD(304, 270, 366, 572, 7), 0.6],
  ["bottle", hatchD(330, 300, 366, 560, 7, -1), 0.45],
  ["apple", hatchD(440, 486, 534, 594, 6), 0.55],
  ["shadow", hatchD(364, 530, 612, 600, 6, -1), 0.6],
  ["table", hatchD(18, 566, 630, 720, 11), 0.22],
];

/** 사과 위 주황 파스텔 */
const PASTEL = [...[0, 1, 2, 3, 4, 5].map((i) => `M${384 + i * 14} ${536 - (i % 2) * 14 - i * 2} L${404 + i * 14} ${478 + (i % 3) * 6 - i * 3}`), "M500 468 C524 490 526 532 506 560"];

/** 연필밥 가장자리. 물결진 고리 */
function ruffle(cx: number, cy: number, r: number, n: number, amp: number) {
  const pts: string[] = [];
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = r + (i % 2 === 0 ? amp : -amp);
    pts.push(`${i === 0 ? "M" : "L"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr * 0.62).toFixed(1)}`);
  }
  return pts.join(" ") + " Z";
}

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 0 : Math.min(1, v / FLIP_END)));
  // 스케치북 한 장이 윗변을 축으로 들려 넘어간다
  const rotateX = useTransform(p, (v) => v * v * 104);
  const pageShade = useTransform(p, (v) => v * 0.3);
  const pageO = useTransform(p, (v) => (v > 0.97 ? 0 : 1));

  const lineT = (i: number) => ({
    duration: reduce ? 0 : LINE_DUR,
    delay: reduce ? 0 : 0.15 + i * LINE_GAP,
    ease: EASE,
  });
  const drawInit = reduce ? false : { pathLength: 0 };

  return (
    <section id="aa-poster" ref={ref} aria-labelledby="aa-poster-title" className="relative" style={{ height: reduce ? undefined : "180svh", background: C.under }}>
      <div className={`${reduce ? "relative min-h-svh" : "sticky top-0 h-svh"} overflow-hidden`} style={{ backgroundColor: C.under, backgroundImage: GRAIN }}>
        {/* 넘어가는 한 장 */}
        <motion.div
          className="absolute inset-0"
          style={{
            rotateX,
            opacity: pageO,
            transformOrigin: "50% 0%",
            transformPerspective: 1500,
            backfaceVisibility: "hidden",
            backgroundColor: C.sheet,
            backgroundImage: GRAIN,
            color: C.ink,
          }}
        >
          {/* 정물 소묘 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[56svh] justify-center lg:inset-x-auto lg:bottom-[2svh] lg:right-[3vw] lg:h-auto lg:w-[min(46vw,80svh)]">
            <svg viewBox="0 0 640 720" className="h-full w-auto lg:h-auto lg:w-full" role="img" aria-label="목탄으로 그린 천, 병, 사과 정물 소묘와 그 앞에 깎아 둔 주황 연필과 연필밥">
              <defs>
                <clipPath id="aa-p-c-bottle">
                  <path d={BOTTLE_D} />
                </clipPath>
                <clipPath id="aa-p-c-apple">
                  <path d={APPLE_D} />
                </clipPath>
                <clipPath id="aa-p-c-shadow">
                  <path d={SHADOW_D} />
                  <ellipse cx="482" cy="592" rx="80" ry="13" />
                </clipPath>
                <clipPath id="aa-p-c-bg">
                  <path d="M372 548 L372 196 C450 166 560 176 630 150 L630 548 Z" />
                </clipPath>
                <clipPath id="aa-p-c-table">
                  <path d="M18 566 C180 560 420 556 622 552 L630 720 L18 720 Z" />
                </clipPath>
                <linearGradient id="aa-p-bottle" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#57524c" />
                  <stop offset="0.14" stopColor="#d9d3c8" />
                  <stop offset="0.26" stopColor="#6a655e" />
                  <stop offset="0.7" stopColor="#2c2a27" />
                  <stop offset="0.9" stopColor="#4a4640" />
                  <stop offset="1" stopColor="#6b665f" />
                </linearGradient>
                <radialGradient id="aa-p-apple" cx="0.34" cy="0.3" r="0.82">
                  <stop offset="0" stopColor="#f3eee5" />
                  <stop offset="0.35" stopColor="#bdb6aa" />
                  <stop offset="0.8" stopColor="#5f5a53" />
                  <stop offset="1" stopColor="#3b3834" />
                </radialGradient>
                <linearGradient id="aa-p-drape" x1="0" y1="0" x2="1" y2="0.3">
                  <stop offset="0" stopColor="#8d877e" stopOpacity="0.5" />
                  <stop offset="0.5" stopColor="#c9c2b6" stopOpacity="0.25" />
                  <stop offset="1" stopColor="#8d877e" stopOpacity="0.45" />
                </linearGradient>
                <radialGradient id="aa-p-cast" cx="0.3" cy="0.5" r="0.7">
                  <stop offset="0" stopColor="#2a2724" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#2a2724" stopOpacity="0.08" />
                </radialGradient>
                <linearGradient id="aa-p-pencil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f6a271" />
                  <stop offset="0.34" stopColor="#f6a271" />
                  <stop offset="0.35" stopColor={C.orange} />
                  <stop offset="0.66" stopColor={C.orange} />
                  <stop offset="0.67" stopColor="#a8430f" />
                  <stop offset="1" stopColor="#8c360b" />
                </linearGradient>
                <linearGradient id="aa-p-wood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f4dcb8" />
                  <stop offset="0.6" stopColor="#d9b282" />
                  <stop offset="1" stopColor="#a87d4e" />
                </linearGradient>
                <linearGradient id="aa-p-lead" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#77736d" />
                  <stop offset="0.5" stopColor="#2b2926" />
                  <stop offset="1" stopColor="#141312" />
                </linearGradient>
                <linearGradient id="aa-p-fade-bg" gradientUnits="userSpaceOnUse" x1="372" y1="0" x2="520" y2="0">
                  <stop offset="0" stopColor="#000" />
                  <stop offset="1" stopColor="#fff" />
                </linearGradient>
                <radialGradient id="aa-p-fade-table" gradientUnits="userSpaceOnUse" cx="380" cy="600" r="250">
                  <stop offset="0.45" stopColor="#fff" />
                  <stop offset="1" stopColor="#000" />
                </radialGradient>
                <mask id="aa-p-m-bg" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="720">
                  <rect width="640" height="720" fill="url(#aa-p-fade-bg)" />
                </mask>
                <mask id="aa-p-m-table" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="720">
                  <rect width="640" height="720" fill="url(#aa-p-fade-table)" />
                </mask>
                <radialGradient id="aa-p-floor" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#1f1d1a" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#1f1d1a" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* 명암 칠: 천, 병, 사과, 그림자 */}
              <motion.g
                initial={reduce ? false : { opacity: 0.3 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: reduce ? 0 : TONE_DUR,
                  delay: reduce ? 0 : TONE_AT,
                  ease: "easeOut",
                }}
              >
                <path d="M70 150 C150 140 200 160 236 150 L236 566 L96 566 C104 540 122 510 112 470 C84 380 96 250 70 150 Z" fill="url(#aa-p-drape)" />
                <path d={SHADOW_D} fill="url(#aa-p-cast)" />
                <ellipse cx="482" cy="592" rx="80" ry="13" fill="url(#aa-p-cast)" />
                <path d={BOTTLE_D} fill="url(#aa-p-bottle)" opacity="0.92" />
                <path d={APPLE_D} fill="url(#aa-p-apple)" />
              </motion.g>

              {/* 해칭 */}
              {HATCHES.map(([clip, d, o], i) => (
                <g key={i} clipPath={`url(#aa-p-c-${clip})`} mask={clip === "bg" || clip === "table" ? `url(#aa-p-m-${clip})` : undefined}>
                  <motion.path
                    d={d}
                    fill="none"
                    stroke={C.char}
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    opacity={o}
                    initial={drawInit}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: reduce ? 0 : HATCH_DUR,
                      delay: reduce ? 0 : HATCH_AT + i * 0.08,
                      ease: "linear",
                    }}
                  />
                </g>
              ))}

              {/* 윤곽선 */}
              {OUTLINES.map(([d, w], i) => (
                <motion.path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={C.ink}
                  strokeWidth={w}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.88"
                  initial={drawInit}
                  animate={{ pathLength: 1 }}
                  transition={lineT(i)}
                />
              ))}

              {/* 지우개로 뺀 빛 */}
              <motion.g
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{
                  duration: reduce ? 0 : 0.4,
                  delay: reduce ? 0 : HATCH_AT + 0.4,
                }}
                stroke={C.sheet}
                strokeLinecap="round"
                fill="none"
              >
                <path d="M254 332 L254 540" strokeWidth="7" />
                <path d="M292 142 L292 222" strokeWidth="3.5" />
                <path d="M408 488 C412 476 420 470 430 468" strokeWidth="6" />
              </motion.g>

              {/* 주황 파스텔. 사과 안쪽에만 색연필처럼 긋는다 */}
              <g clipPath="url(#aa-p-c-apple)">
                {PASTEL.map((d, i) => (
                  <motion.path
                    key={d}
                    d={d}
                    fill="none"
                    stroke={C.orange}
                    strokeWidth={i === PASTEL.length - 1 ? 7 : 4}
                    strokeLinecap="round"
                    opacity="0.62"
                    style={{ mixBlendMode: "multiply" }}
                    initial={drawInit}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: reduce ? 0 : ORANGE_DUR * 0.5,
                      delay: reduce ? 0 : ORANGE_AT + i * 0.05,
                      ease: EASE,
                    }}
                  />
                ))}
              </g>

              {/* 깎아 둔 연필과 연필밥 */}
              <ellipse cx="350" cy="690" rx="230" ry="12" fill="url(#aa-p-floor)" />
              <motion.g
                initial={reduce ? false : { x: 120, rotate: 6 }}
                animate={{ x: 0, rotate: 0 }}
                transition={{
                  duration: reduce ? 0 : 1.1,
                  delay: reduce ? 0 : 0.2,
                  ease: EASE,
                }}
                style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
              >
                <g transform="translate(340 662) rotate(-7)">
                  <rect x="-200" y="-14" width="346" height="28" fill="url(#aa-p-pencil)" />
                  <ellipse cx="-200" cy="0" rx="5" ry="14" fill="#d9b282" stroke="#8c360b" strokeWidth="2" />
                  <path d="M146 -14 L198 -3 L198 3 L146 14 Z" fill="url(#aa-p-wood)" />
                  <path d="M146 -14 C152 -9 148 -5 153 0 C148 5 152 9 146 14" fill="none" stroke={C.orange} strokeWidth="3" />
                  <path d="M196 -3.4 L218 0 L196 3.4 Z" fill="url(#aa-p-lead)" />
                  <path d="M-196 -9 L142 -9" stroke="#ffd8bf" strokeWidth="1.6" opacity="0.8" />
                </g>
              </motion.g>
              {[
                [574, 690, 20],
                [604, 664, 15],
              ].map(([x, y, r]) => (
                <g key={x}>
                  <path d={ruffle(x, y, r, 9, 3)} fill="url(#aa-p-wood)" stroke={C.orange} strokeWidth="3" strokeLinejoin="round" />
                  <ellipse cx={x} cy={y} rx={r * 0.38} ry={r * 0.22} fill="#8a6640" />
                </g>
              ))}
            </svg>
          </div>

          {/* 로고와 핵심 행동 하나 */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-9 md:px-12 md:pt-11">
            <p className="inline-flex items-center gap-2 text-[17px] leading-none" style={heavyF}>
              <PencilMark size={20} />
              {BRAND}
            </p>
            <button
              type="button"
              onClick={onCta}
              aria-label="상담 예약"
              title="상담 예약"
              data-gtm-cta="art-academy_poster_cta"
              className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${focusRing}`}
              style={{
                background: C.orangeInk,
                color: "#fff",
                outlineColor: C.ink,
              }}
            >
              <CalendarCheck size={22} aria-hidden />
            </button>
          </div>

          {/* 큰 문장 */}
          <div className="relative z-[1] flex h-full flex-col px-4 pt-[13svh] md:px-12 lg:justify-center lg:pb-[4svh] lg:pt-0">
            <h1
              id="aa-poster-title"
              className="text-[clamp(54px,16vw,96px)] leading-[1.06] tracking-[-0.02em] lg:text-[clamp(100px,9.6vw,176px)] lg:leading-[1.04]"
              style={{ ...heavyF, wordBreak: "keep-all" }}
            >
              <span className="block">연필 깎는</span>
              <span className="block">법부터</span>
              <span className="relative inline-block">
                {/* 주황 파스텔 밑줄 */}
                <svg aria-hidden viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute -bottom-[0.06em] left-[-0.04em] h-[0.34em] w-[104%]" style={{ zIndex: -1 }}>
                  <motion.path
                    d="M6 26 C90 14 200 20 300 16 C340 14 370 18 394 14"
                    fill="none"
                    stroke={C.orange}
                    strokeWidth="18"
                    strokeLinecap="round"
                    opacity="0.85"
                    initial={drawInit}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: reduce ? 0 : ORANGE_DUR + 0.1,
                      delay: reduce ? 0 : ORANGE_AT - 0.1,
                      ease: EASE,
                    }}
                  />
                </svg>
                같이 해요
              </span>
            </h1>
            <p className="mt-5 text-[16px] md:mt-8 md:text-[19px]" style={{ color: C.muted }}>
              입시반, 취미반, 초등반 모집
            </p>
          </div>

          <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-20 bg-black" style={{ opacity: pageShade }} />
        </motion.div>

        {/* 스프링 고리. 넘어가는 장을 붙잡고 제자리에 남는다 */}
        <SpiralRings />
      </div>
    </section>
  );
}

function SpiralRings() {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[26px] w-full">
      <defs>
        <linearGradient id="aa-ring" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7c7c7c" />
          <stop offset="0.45" stopColor="#f2f2f2" />
          <stop offset="1" stopColor="#6d6d6d" />
        </linearGradient>
        <pattern id="aa-rings" width="34" height="26" patternUnits="userSpaceOnUse">
          <ellipse cx="17" cy="19" rx="4.2" ry="3.4" fill="#2a2724" opacity="0.75" />
          <path d="M14 19 C14 6 20 2 22 -2" fill="none" stroke="url(#aa-ring)" strokeWidth="3.4" strokeLinecap="round" />
        </pattern>
      </defs>
      <rect width="100%" height="26" fill="url(#aa-rings)" />
    </svg>
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
              className={`relative -mb-px px-4 pb-3 pt-2 text-[18px] md:px-6 md:text-[22px] ${focusRing}`}
              style={{
                ...heavyF,
                color: on ? C.ink : C.muted,
                outlineColor: C.orangeInk,
              }}
            >
              {k}
              {on && (
                <motion.span
                  layoutId={reduce ? undefined : "aa-tab-line"}
                  className="absolute inset-x-2 bottom-0 h-[5px] rounded-full"
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
              <p className="text-[32px] leading-tight md:text-[38px]" style={heavyF}>
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
              className={`inline-flex min-h-[48px] items-center gap-2 rounded-[4px] px-5 text-[16px] font-bold text-white ${focusRing}`}
              style={{ background: C.orangeInk, outlineColor: C.ink }}
            >
              <CalendarCheck size={18} aria-hidden />
              {cls} 상담 예약
            </button>
          </div>
        </div>

        <figure className="flex w-full flex-col md:max-w-[360px] md:justify-self-end">
          <div className="relative border p-3" style={{ borderColor: C.line, background: "#fff" }}>
            <Tape className="-top-3 left-6 -rotate-6" />
            <Tape className="-top-3 right-6 rotate-3" />
            <StillLife work={cls === "입시반" ? WORKS[0] : cls === "취미반" ? WORKS[7] : WORKS[3]} uid={`cls-${cls}`} />
          </div>
          <figcaption className="mt-3 text-[22px] leading-snug" style={{ ...penF, color: C.char }}>
            {info.note}
          </figcaption>
        </figure>
      </motion.div>
    </div>
  );
}

function Tape({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute z-[1] h-6 w-16 ${className}`}
      style={{
        background: "rgba(236,222,190,0.82)",
        boxShadow: "inset 0 0 0 1px rgba(160,140,100,0.25)",
      }}
    />
  );
}

/* ---------- 정물 그림(수업 작품) ---------- */

const OBJ_PATH: Record<ObjType, string> = {
  apple: "M0 -60 C22 -72 40 -54 38 -30 C36 -6 20 2 2 0 C-2 -1 -6 -1 -10 0 C-28 2 -40 -10 -38 -32 C-36 -56 -18 -68 0 -60 Z",
  lemon: "M-38 -18 C-36 -38 34 -40 38 -20 C42 -2 -40 4 -38 -18 Z",
  bottle: "M-9 -170 L-9 -120 C-9 -100 -32 -92 -32 -72 L-32 -4 C-32 3 32 3 32 -4 L32 -72 C32 -92 9 -100 9 -120 L9 -170 Z",
  cup: "M-30 -58 L-26 -6 C-25 1 25 1 26 -6 L30 -58 Z",
  jar: "M-22 -96 C-22 -86 -46 -78 -46 -46 C-46 -12 -30 0 0 0 C30 0 46 -12 46 -46 C46 -78 22 -86 22 -96 Z",
  box: "M-40 -50 L20 -50 L40 -66 L40 -16 L20 0 L-40 0 Z",
};
/** 그림마다 덧그리는 선(꼭지, 손잡이, 입구) */
const OBJ_EXTRA: Record<ObjType, string> = {
  apple: "M0 -60 C-1 -70 2 -78 7 -82",
  lemon: "M38 -20 L44 -21 M-38 -18 L-44 -17",
  bottle: "M-12 -170 C-12 -176 12 -176 12 -170",
  cup: "M-30 -58 C-30 -64 30 -64 30 -58 C30 -52 -30 -52 -30 -58 M30 -46 C46 -46 46 -20 27 -18",
  jar: "M-22 -96 C-22 -102 22 -102 22 -96 C22 -90 -22 -90 -22 -96",
  box: "M-40 -50 L-20 -66 L40 -66 M20 -50 L20 0",
};
/** 수채화 색 [밝은 쪽, 중간, 그늘] */
const WATER: Record<ObjType, [string, string, string]> = {
  apple: ["#f6a27c", "#d4472b", "#7f2618"],
  lemon: ["#fff4b0", "#f0c834", "#a9801a"],
  bottle: ["#c4dccb", "#4f7f68", "#213f36"],
  cup: ["#ffffff", "#d6dee8", "#7d90a6"],
  jar: ["#ecc196", "#a86a3d", "#5a3418"],
  box: ["#f2dfbd", "#c9a573", "#86663f"],
};
const CHAR: [string, string, string] = ["#f1ece3", "#a39c91", "#3d3a35"];

function StillLife({ work, uid }: { work: Work; uid: string }) {
  const water = work.medium === "수채화";
  const id = (s: string) => `aa-${uid}-${s}`;
  const types = Array.from(new Set(work.objs.map((o) => o.t)));
  return (
    <svg viewBox="0 0 300 400" className="block h-auto w-full" role="img" aria-label={`${work.cls} ${water ? "정물 수채화" : "정물 소묘"}`}>
      <defs>
        {types.map((t) => {
          const [a, b, c] = water ? WATER[t] : CHAR;
          return (
            <radialGradient key={t} id={id(t)} cx="0.32" cy="0.3" r="0.85">
              <stop offset="0" stopColor={a} />
              <stop offset="0.45" stopColor={b} />
              <stop offset="1" stopColor={c} />
            </radialGradient>
          );
        })}
        <linearGradient id={id("wall")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={water ? "#9fb1c2" : "#8e887f"} stopOpacity={water ? 0.55 : 0.6} />
          <stop offset="1" stopColor={water ? "#dfe6ea" : "#e4ded3"} stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={id("table")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={water ? "#e7cfaa" : "#cfc8bc"} />
          <stop offset="1" stopColor={water ? "#c39a6a" : "#8f897f"} />
        </linearGradient>
        <clipPath id={id("bgclip")}>
          <rect x="0" y="0" width="300" height="290" />
        </clipPath>
        {water && (
          <filter id={id("bleed")} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={work.id.length * 7} />
            <feDisplacementMap in="SourceGraphic" scale="5" />
          </filter>
        )}
      </defs>
      <rect width="300" height="400" fill={water ? "#fdfcf8" : "#f4f1ea"} />
      <rect width="300" height="290" fill={`url(#${id("wall")})`} />
      <path d="M0 290 L300 284 L300 400 L0 400 Z" fill={`url(#${id("table")})`} opacity={water ? 0.75 : 0.55} />
      {!water && <path d={hatchD(0, 0, 300, 290, 7)} stroke="#3a3733" strokeWidth="0.7" opacity="0.28" clipPath={`url(#${id("bgclip")})`} />}
      <g filter={water ? `url(#${id("bleed")})` : undefined}>
        {work.objs.map((o, i) => (
          <g key={i} transform={`translate(${o.x} ${o.y}) scale(${o.s})`}>
            <ellipse cx="26" cy="-2" rx="44" ry="7" fill={water ? "#5a6f86" : "#2a2724"} opacity={water ? 0.35 : 0.45} />
            <path d={OBJ_PATH[o.t]} fill={`url(#${id(o.t)})`} opacity={water ? 0.9 : 1} />
            {water && <path d={OBJ_PATH[o.t]} fill={WATER[o.t][1]} opacity="0.18" transform="translate(2 1.5)" />}
            {!water && <path d={OBJ_PATH[o.t]} fill="none" stroke="#2a2724" strokeWidth="1.3" vectorEffect="non-scaling-stroke" />}
            <path d={OBJ_EXTRA[o.t]} fill="none" stroke={water ? "#5d4a3a" : "#2a2724"} strokeWidth="1.2" strokeLinecap="round" opacity={water ? 0.7 : 0.9} vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </g>
    </svg>
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
          <motion.li key={w.id} layout={!reduce} transition={{ duration: 0.3, ease: EASE }} style={{ rotate: (i % 3) - 1 }}>
            <button
              type="button"
              onClick={(e) => {
                lastBtn.current = e.currentTarget;
                setOpen(i);
              }}
              aria-label={`${w.cls} ${w.medium === "소묘" ? "정물 소묘" : "정물 수채화"} 크게 보기`}
              className={`relative block w-full border bg-white p-2 text-left ${focusRing}`}
              style={{ borderColor: C.line, outlineColor: C.orangeInk }}
            >
              <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
              <StillLife work={w} uid={`g-${w.id}`} />
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
        className="w-full max-w-[460px] p-4"
        style={{ background: C.sheet }}
        initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
      >
        <div className="max-h-[62svh] overflow-hidden">
          <StillLife work={work} uid={`lb-${work.id}`} />
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
          <button ref={closeRef} type="button" aria-label="닫기" onClick={onClose} className={navBtn} style={{ borderColor: C.ink, outlineColor: C.orangeInk }}>
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
                          background: d.dow === dow ? "rgba(251,230,216,0.55)" : undefined,
                        }}
                      >
                        {t ? (
                          <span
                            className="inline-block rounded-[3px] border px-1.5 py-1 text-[13px] font-semibold"
                            style={{
                              borderColor: on && pick !== "전체" ? C.ink : C.line,
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
          <tr style={{ background: C.ink, color: C.sheet }}>
            {["교습과정", "대상", "수업", "정원", "월 교습비", "기타경비"].map((h) => (
              <th key={h} scope="col" className="px-3 py-3 text-left font-bold">
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
        <p className="text-[24px] leading-snug" style={heavyF}>
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

      <div className="relative border p-5 md:p-7" style={{ borderColor: C.ink, background: C.sheet }}>
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
              <p className="text-[26px]" style={heavyF}>
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
                style={{ borderColor: C.ink, outlineColor: C.orangeInk }}
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
                          borderColor: time === t ? C.ink : C.line,
                          background: time === t ? C.ink : full ? "transparent" : C.sheet,
                          color: time === t ? C.sheet : full ? C.muted : C.ink,
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
                      borderColor: tried && errors.name ? C.error : C.line,
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
                      borderColor: tried && errors.phone ? C.error : C.line,
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
                className={`mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[4px] text-[17px] font-bold text-white ${focusRing}`}
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
      {/* 연필로 그린 약도 */}
      <div className="border p-3" style={{ borderColor: C.line, background: "#fff" }}>
        <svg viewBox="0 0 520 320" className="block h-auto w-full" role="img" aria-label="ㅇㅇ역 2번 출구에서 큰길을 따라 걸어 두 번째 골목 모퉁이 건물 3층에 있는 학원 약도">
          <rect width="520" height="320" fill="#fbf9f4" />
          <g stroke={C.char} strokeLinecap="round" fill="none" opacity="0.85">
            <path d="M0 150 C120 146 300 154 520 148" strokeWidth="2.2" />
            <path d="M0 190 C120 186 300 194 520 188" strokeWidth="2.2" />
            <path d="M330 0 C326 60 334 110 330 150" strokeWidth="1.8" />
            <path d="M370 0 C366 60 374 110 370 150" strokeWidth="1.8" />
            <path d="M330 190 C334 240 326 290 330 320" strokeWidth="1.8" />
            <path d="M370 190 C374 240 366 290 370 320" strokeWidth="1.8" />
            <path d="M140 190 L140 320 M170 190 L170 320" strokeWidth="1.4" opacity="0.6" />
          </g>
          <path d={hatchD(380, 60, 470, 140, 6)} stroke={C.char} strokeWidth="0.9" opacity="0.25" clipPath="url(#aa-map-b)" />
          <defs>
            <clipPath id="aa-map-b">
              <rect x="380" y="60" width="90" height="80" />
            </clipPath>
          </defs>
          <rect x="380" y="60" width="90" height="80" fill={C.orangeInk} />
          <text x="425" y="106" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff">
            학원 3층
          </text>
          <rect x="60" y="200" width="70" height="40" rx="4" fill="none" stroke={C.ink} strokeWidth="2" />
          <text x="95" y="225" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink}>
            ㅇㅇ역 2번
          </text>
          <path d="M120 170 C200 166 290 172 360 168" stroke={C.orange} strokeWidth="4" strokeDasharray="2 9" strokeLinecap="round" fill="none" />
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
