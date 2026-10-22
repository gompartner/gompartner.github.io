"use client";

import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame, useInView, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Bus, CalendarCheck, Car, Check, ChevronLeft, ChevronRight, Clock, FileText, MapPin, Minus, Phone, Plus } from "lucide-react";
import { Black_Han_Sans, JetBrains_Mono } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 운전전문학원 홈페이지 샘플: 가상의 곰파트너운전전문학원. 1종 보통, 2종 보통, 2종 소형 면허 교육을 한다.
   상호, 주소, 정류장, 손님 이름은 모두 가상이다.

   국내 운전전문학원 사이트 공통 구성(참고): 메뉴는 학원소개, 교육안내(면허 종류, 교육 과정, 교육비),
   셔틀버스 노선안내, 시험일정, 온라인 등록 예약, 오시는 길, 공지사항. 첫 화면에 "무료 셔틀버스 운행",
   "평일 야간, 주말 교육", "등록 예약" 버튼과 대표번호를 크게 둔다. 교육 시간은 학과 3시간, 장내기능 4시간,
   도로주행 6시간(2종 소형은 학과 3시간, 장내기능 10시간, 도로교통법 시행규칙 별표 32)으로 안내하고, 교육비와 검정료를 나눠 적는 곳이 많다. 합격 보장, 합격률 숫자는 쓰지 않는다.

   포스터 첫 화면(dr-poster): 아스팔트 회색 바탕에 큰 문장 "평일 저녁에도 도로 연수해요" 하나만 둔다.
   위에서 내려다본 장내기능 코스가 깔려 있고, 들어오면 흰 차선이 코스를 따라 칠해진 뒤 노란 교습 차가 출발한다.
   차는 S자 코스를 지나 T자 코스(직각 주차)에 후진으로 들어갔다 나오고, 지나간 자리에 바퀴 자국이 남는다(한 바퀴 15초 남짓).
   스크롤하면 코스 바닥이 뒤로 기울어지며 넘어가고 문장은 위로 빠진다.
   동작 줄이기면 차는 T자 코스에 들어가 선 상태로 고정, 자국과 차선은 다 그려진 상태, 기울기 없음.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 면허 종류별 교육: 1종 보통, 2종 보통, 2종 소형을 고르면 학과, 장내기능, 도로주행 시간 막대와 교육비 개략, 추가 교육 시간 계산.
   2. 셔틀버스 노선: 노선을 고르고 정류장을 누르면 버스 표시가 그 정류장으로 움직이고, 지금 시각 기준 다음 차 시간이 나온다.
   3. 등록 예약: 면허 종류, 방문 날짜, 수업 시간대, 셔틀 이용, 이름, 연락처. 완료 화면에 접수 번호, 담당 창구, 회신 예정일.
   4. 시험 일정: 이번 달과 다음 달 달력에 장내기능, 도로주행 검정 날짜. 날짜를 누르면 회차와 남은 자리. */

const sfxF = { fontFamily: `${Black_Han_Sans.style.fontFamily}, var(--font-sfx), sans-serif`, fontWeight: 400 } as const;
const monoF = { fontFamily: `${JetBrains_Mono.style.fontFamily}, ui-monospace, monospace` } as const;

const BRAND = "곰파트너운전전문학원";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00";

/* 포스터 색 */
const P = { asphalt: "#3b3d40", asphaltDeep: "#2b2d30", road: "#46494d", paint: "#f2f1ea", yellow: "#f5c518", yellowDeep: "#c79a00", sub: "#d6d4cc" };

/* 본문 색 */
const C = { bg: "#f3f2ee", card: "#ffffff", ink: "#1f2124", asphalt: "#3b3d40", yellow: "#f5c518", yellowSoft: "#fff4c2", yellowDeep: "#8a6a00", muted: "#5a5d62", line: "#d8d6cf", error: "#b42318" };

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 흰 차선이 코스를 따라 칠해지는 시간 */
const PAINT_DUR = 1.4;
/** 차선 칠이 시작되고 차가 출발하기까지 */
const CAR_DELAY = 0.9;
/** 포스터 스크롤 진행도 중 퇴장이 끝나는 지점 */
const EXIT_END = 0.85;
/** 코스가 뒤로 눕는 최대 각도 */
const TILT_MAX = 62;
/** 결과 숫자, 막대 전환 */
const DUR = 0.4;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const p2 = (n: number) => String(n).padStart(2, "0");
const hm = (min: number) => `${p2(Math.floor(min / 60))}:${p2(min % 60)}`;

/* ---------- 코스 도형 (코스 좌표 900 x 620) ---------- */

type Pt = [number, number];
type Cmd = { k: "L"; to: Pt } | { k: "C"; c1: Pt; c2: Pt; to: Pt };
type Seg = { start: Pt; cmds: Cmd[] };
const L = (x: number, y: number): Cmd => ({ k: "L", to: [x, y] });
const Cb = (a: Pt, b: Pt, to: Pt): Cmd => ({ k: "C", c1: a, c2: b, to });

/** 출발선에서 S자 코스를 지나 T자 코스 앞까지 */
const SEG_A: Seg = {
  start: [160, 520],
  cmds: [L(560, 520), Cb([680, 520], [760, 500], [760, 420]), Cb([760, 380], [700, 370], [700, 320]), Cb([700, 270], [800, 265], [800, 215]), Cb([800, 150], [760, 120], [700, 120]), L(220, 120)],
};
/** 후진으로 T자 코스(직각 주차)에 들어간다 */
const SEG_B: Seg = { start: [220, 120], cmds: [Cb([290, 120], [330, 150], [330, 210]), L(330, 300)] };
/** 앞으로 나와 왼쪽 길을 돌아 출발선으로 */
const SEG_C: Seg = {
  start: [330, 300],
  cmds: [L(330, 210), Cb([330, 150], [300, 120], [240, 120]), L(170, 120), Cb([130, 120], [110, 140], [110, 180]), L(110, 450), Cb([110, 490], [125, 520], [160, 520])],
};

const segD = (s: Seg) => `M${s.start[0]} ${s.start[1]} ` + s.cmds.map((c) => (c.k === "L" ? `L${c.to[0]} ${c.to[1]}` : `C${c.c1[0]} ${c.c1[1]} ${c.c2[0]} ${c.c2[1]} ${c.to[0]} ${c.to[1]}`)).join(" ");

const LOOP_D = `${segD(SEG_A)} L170 120 C130 120 110 140 110 180 L110 450 C110 490 125 520 160 520 Z`;
const STEM_D = "M330 110 L330 338";

/** 경로를 잘게 나눠 길이 표를 만든다. DOM 측정 없이 서버와 브라우저가 같은 값을 쓴다 */
function sampleSeg(s: Seg) {
  const pts: Pt[] = [s.start];
  let cur = s.start;
  for (const c of s.cmds) {
    const n = c.k === "L" ? 8 : 40;
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      if (c.k === "L") pts.push([cur[0] + (c.to[0] - cur[0]) * t, cur[1] + (c.to[1] - cur[1]) * t]);
      else {
        const u = 1 - t;
        const x = u * u * u * cur[0] + 3 * u * u * t * c.c1[0] + 3 * u * t * t * c.c2[0] + t * t * t * c.to[0];
        const y = u * u * u * cur[1] + 3 * u * u * t * c.c1[1] + 3 * u * t * t * c.c2[1] + t * t * t * c.to[1];
        pts.push([x, y]);
      }
    }
    cur = c.to;
  }
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, acc, len: acc[acc.length - 1] };
}

const TABLES = [SEG_A, SEG_B, SEG_C].map(sampleSeg);

/** 구간 진행도 t(0~1)의 위치와 진행 방향 각도 */
function poseAt(seg: number, t: number) {
  const { pts, acc, len } = TABLES[seg];
  const target = clamp01(t) * len;
  let lo = 0;
  let hi = acc.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (acc[mid] < target) lo = mid;
    else hi = mid;
  }
  const a = pts[lo];
  const b = pts[hi];
  const span = acc[hi] - acc[lo] || 1;
  const f = (target - acc[lo]) / span;
  const x = a[0] + (b[0] - a[0]) * f;
  const y = a[1] + (b[1] - a[1]) * f;
  const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  return { x, y, ang };
}

/** 한 바퀴 일정. 구간마다 서서히 출발해 서서히 멈춘다(후진 전에 선다) */
const PLAN: { seg: number | null; dur: number; rev?: boolean }[] = [
  { seg: 0, dur: 7.2 },
  { seg: null, dur: 0.6 },
  { seg: 1, dur: 2.6, rev: true },
  { seg: null, dur: 0.9 },
  { seg: 2, dur: 3.8 },
  { seg: null, dur: 0.3 },
];
const LAP = PLAN.reduce((s, p) => s + p.dur, 0);
const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u));

function driveAt(time: number) {
  const lap = Math.floor(time / LAP);
  let tt = time - lap * LAP;
  const tracks = [0, 0, 0];
  let pose = poseAt(0, 0);
  let rev = false;
  let lastSeg = 2;
  for (const step of PLAN) {
    if (step.seg === null) {
      if (tt < step.dur) {
        pose = poseAt(lastSeg, 1);
        break;
      }
      tt -= step.dur;
      continue;
    }
    lastSeg = step.seg;
    if (tt < step.dur) {
      const u = easeInOut(tt / step.dur);
      tracks[step.seg] = u;
      pose = poseAt(step.seg, u);
      rev = !!step.rev;
      break;
    }
    tracks[step.seg] = 1;
    tt -= step.dur;
    pose = poseAt(step.seg, 1);
    rev = !!step.rev;
  }
  const done = lap > 0 ? [1, 1, 1] : tracks;
  return {
    x: pose.x,
    y: pose.y,
    ang: pose.ang + (rev ? 180 : 0),
    tracks: done,
  };
}

const carTf = (x: number, y: number, ang: number) => `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})`;
const START_POSE = carTf(SEG_A.start[0], SEG_A.start[1], 0);
/** 동작 줄이기: T자 코스에 후진으로 들어가 선 모습 */
const PARKED_POSE = carTf(330, 300, -90);

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
const HOUR_PARTS = [
  { name: "학과", tone: "#ffffff", ink: C.ink },
  { name: "장내기능", tone: C.yellowSoft, ink: C.ink },
  { name: "도로주행", tone: C.yellow, ink: C.ink },
] as const;

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

/* ---------- 시험 일정 ---------- */

/** 요일별 검정 회차. 0 일요일 ~ 6 토요일 */
const EXAMS: Record<number, { kind: "장내기능" | "도로주행"; times: string[]; cap: number }[]> = {
  1: [{ kind: "도로주행", times: ["10:00", "14:00", "19:00"], cap: 8 }],
  2: [{ kind: "장내기능", times: ["10:00", "14:00"], cap: 12 }],
  3: [{ kind: "도로주행", times: ["10:00", "14:00", "19:00"], cap: 8 }],
  4: [{ kind: "장내기능", times: ["10:00", "14:00"], cap: 12 }],
  5: [{ kind: "도로주행", times: ["10:00", "14:00", "19:00"], cap: 8 }],
  6: [{ kind: "장내기능", times: ["10:00"], cap: 12 }],
};

/** 날짜와 회차별로 이미 찬 자리. 실제로는 학원 관리 프로그램에서 읽는다 */
function takenSeats(d: Date, i: number, cap: number) {
  let h = (d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate()) * 2654435761 + (i + 3) * 40503;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 97;
  return Math.min(cap, (h % (cap - 1)) + 1);
}

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

/** 지금 시각(분). 서버 렌더와 첫 화면은 null, 브라우저에서 바로 채우고 1분마다 갱신 */
function useNowMinutes() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const read = () => {
      const d = new Date();
      setNow(d.getHours() * 60 + d.getMinutes());
    };
    const frame = requestAnimationFrame(read);
    const id = window.setInterval(read, 60_000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(id);
    };
  }, []);
  return now;
}

export function DrivingSchoolDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [license, setLicense] = useState<LicenseId>("2종 보통");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = useCallback((id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), [reduce]);
  const toReserve = useCallback(() => go("dr-reserve"), [go]);

  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] font-semibold underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.ink }}>
      <Poster reduce={reduce} onCta={toReserve} />

      <header style={{ background: C.asphalt }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:px-6">
          <h2 className="inline-flex items-center gap-2 text-[21px] leading-none text-white" style={sfxF}>
            <WheelMark size={24} />
            {BRAND}
          </h2>
          <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center text-white">
            {[
              ["dr-course", "교육안내"],
              ["dr-shuttle", "셔틀버스"],
              ["dr-exam", "시험일정"],
              ["dr-reserve", "등록 예약"],
              ["dr-visit", "오시는 길"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: P.yellow }}>
                {label}
              </button>
            ))}
          </nav>
        </div>
        <LaneDash />
      </header>

      {/* 오늘 운영 한 줄 */}
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 pt-8 md:px-6 md:pt-10">
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[16px]">
          <span className="inline-flex items-center gap-1.5 font-bold">
            <Clock size={18} aria-hidden /> 평일 09:00 ~ 21:00
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bus size={18} aria-hidden /> 무료 셔틀버스 3개 노선
          </span>
        </p>
        <a
          href={`tel:${TEL.replace(/-/g, "")}`}
          className={`inline-flex items-center gap-2 rounded-[4px] px-4 py-2.5 text-[16px] font-bold ${focusRing}`}
          style={{ background: C.yellow, color: C.ink, outlineColor: C.ink }}
        >
          <Phone size={18} aria-hidden />
          대표번호 <span style={monoF}>{TEL}</span>
        </a>
      </div>

      <section id="dr-course" aria-labelledby="dr-course-title" className="mx-auto mt-10 max-w-[1200px] scroll-mt-4 px-4 md:mt-14 md:px-6">
        <SectionTitle id="dr-course-title" title="면허 종류별 교육" />
        <CoursePicker
          reduce={reduce}
          license={license}
          setLicense={setLicense}
          onReserve={() => {
            go("dr-reserve");
          }}
        />
      </section>

      <section id="dr-shuttle" aria-labelledby="dr-shuttle-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="dr-shuttle-title" title="셔틀버스 노선" />
        <Shuttle reduce={reduce} />
      </section>

      <section id="dr-exam" aria-labelledby="dr-exam-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="dr-exam-title" title="시험 일정" />
        <ExamCalendar today={today} reduce={reduce} />
      </section>

      <section id="dr-reserve" aria-labelledby="dr-reserve-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="dr-reserve-title" title="등록 예약" />
        <ReserveForm today={today} reduce={reduce} license={license} setLicense={setLicense} />
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
                    <span style={monoF}>{h.time}</span>
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
                <span className="flex-none text-[14px]" style={{ ...monoF, color: C.muted }}>
                  {fmtDash(daysAgo(today, n.d))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="mt-16 pb-28 text-[14px] leading-[1.8]" style={{ background: C.asphalt, color: P.sub }}>
        <LaneDash />
        <div className="mx-auto max-w-[1200px] px-4 pt-10 md:px-6">
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

/** 머리글 아래 노란 차선 점선 */
function LaneDash() {
  return <div aria-hidden className="h-[6px]" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${P.yellow} 0 36px, transparent 36px 64px)` }} />;
}

function SectionTitle({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="text-[26px] leading-tight md:text-[34px]" style={sfxF}>
      {title}
      <span aria-hidden className="mt-2 block h-[5px] w-[120px]" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${C.yellow} 0 22px, transparent 22px 34px)` }} />
    </h2>
  );
}

/** 작은 상호 표시. 핸들 */
function WheelMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9.5" fill="none" stroke={P.yellow} strokeWidth="3" />
      <circle cx="12" cy="12" r="2.6" fill={P.yellow} />
      <path d="M3.5 11 H9.4 M14.6 11 H20.5 M12 14.6 V21" stroke={P.yellow} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function Stepper({ label, value, set, min, max, unit }: { label: string; value: number; set: (n: number) => void; min: number; max: number; unit: string }) {
  const btn = `grid h-11 w-11 place-items-center rounded-[4px] border disabled:opacity-40 ${focusRing}`;
  return (
    <div>
      <p className="text-[15px] font-bold">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          className={btn}
          style={{ borderColor: C.line, background: C.card, color: C.ink, outlineColor: C.ink }}
          onClick={() => set(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`${label} 줄이기`}
        >
          <Minus size={18} aria-hidden />
        </button>
        <output className="min-w-[4.5em] text-center text-[20px] font-bold" aria-live="polite" style={monoF}>
          {value}
          <span className="ml-0.5 text-[15px]" style={{ fontFamily: "inherit" }}>
            {unit}
          </span>
        </output>
        <button
          type="button"
          className={btn}
          style={{ borderColor: C.line, background: C.card, color: C.ink, outlineColor: C.ink }}
          onClick={() => set(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`${label} 늘리기`}
        >
          <Plus size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}

/* ---------- 포스터 ---------- */

const Poster = memo(function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 0 : clamp01(v / EXIT_END)));
  // 코스 바닥은 아래 모서리를 축으로 뒤로 눕고, 문장은 위로 빠진다
  const tilt = useTransform(p, (v) => v * TILT_MAX);
  const groundY = useTransform(p, (v) => `${-v * 18}svh`);
  const groundO = useTransform(p, (v) => 1 - clamp01((v - 0.55) / 0.45));
  const textY = useTransform(p, (v) => `${-v * 46}svh`);
  const textO = useTransform(p, (v) => 1 - clamp01((v - 0.25) / 0.55));

  // 코스 위 차의 시계(초). 포스터가 화면 밖이면 멈춘다
  const clock = useMotionValue(0);
  const elapsed = useRef(0);
  useAnimationFrame((_, delta) => {
    if (reduce || !inView) return;
    elapsed.current += Math.min(delta, 50) / 1000;
    clock.set(Math.max(0, elapsed.current - CAR_DELAY));
  });

  return (
    <section id="dr-poster" ref={ref} aria-labelledby="dr-poster-title" className="relative" style={{ height: reduce ? undefined : "180svh", background: P.asphaltDeep }}>
      <div
        className={`${reduce ? "relative min-h-svh" : "sticky top-0 h-svh"} overflow-hidden`}
        style={{ background: `radial-gradient(90% 75% at 62% 55%, #44474b 0%, ${P.asphalt} 50%, ${P.asphaltDeep} 100%)`, color: "#fff", perspective: "1300px" }}
      >
        {/* 코스 바닥 */}
        <motion.div className="pointer-events-none absolute inset-0" style={{ rotateX: tilt, y: groundY, opacity: groundO, transformOrigin: "50% 100%" }}>
          {/* 아스팔트 알갱이 */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 0.8px, transparent 1.1px), radial-gradient(rgba(0,0,0,0.6) 0.8px, transparent 1.2px)",
              backgroundSize: "7px 7px, 11px 11px",
              backgroundPosition: "0 0, 3px 5px",
            }}
          />
          <CourseScene key={`wide-${reduce}`} variant="wide" clock={clock} reduce={reduce} />
          <CourseScene key={`tall-${reduce}`} variant="tall" clock={clock} reduce={reduce} />
        </motion.div>

        {/* 로고와 핵심 행동 하나 */}
        <motion.div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4 md:px-12 md:pt-7" style={{ y: textY }}>
          <p className="inline-flex items-center gap-2 text-[17px] leading-none" style={sfxF}>
            <WheelMark size={20} />
            {BRAND}
          </p>
          <button
            type="button"
            onClick={onCta}
            aria-label="등록 예약"
            title="등록 예약"
            data-gtm-cta="driving-school_poster_cta"
            className={`pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full ${focusRing}`}
            style={{ background: P.yellow, color: C.ink, outlineColor: "#fff" }}
          >
            <CalendarCheck size={22} aria-hidden />
          </button>
        </motion.div>

        {/* 큰 문장 */}
        <motion.div className="pointer-events-none relative z-[1] px-4 pt-[13svh] md:px-12 lg:pt-[16svh]" style={{ y: textY, opacity: textO }}>
          <h1
            id="dr-poster-title"
            className="text-[clamp(52px,16vw,72px)] leading-[1.1] tracking-[-0.02em] md:text-[88px] lg:text-[clamp(96px,8.2vw,168px)] lg:leading-[1.06]"
            style={{ ...sfxF, wordBreak: "keep-all", textShadow: "0 4px 24px rgba(0,0,0,0.35)" }}
          >
            <span className="block">
              평일 <span style={{ color: P.yellow }}>저녁에도</span>
            </span>
            <span className="block">도로 연수해요</span>
          </h1>
          <p className="mt-5 text-[16px] md:mt-7 md:text-[19px]" style={{ color: P.sub }}>
            도로주행 평일 밤 9시까지, {BRAND}
          </p>
        </motion.div>
      </div>
    </section>
  );
});

/** 위에서 내려다본 장내기능 코스. wide 는 PC(오른쪽 아래), tall 은 휴대폰과 태블릿(아래쪽) */
function CourseScene({ variant, clock, reduce }: { variant: "wide" | "tall"; clock: MotionValue<number>; reduce: boolean }) {
  const gid = useId().replace(/:/g, "");
  const carRef = useRef<SVGGElement>(null);
  const trackA = useTransform(clock, (t) => driveAt(t).tracks[0]);
  const trackB = useTransform(clock, (t) => driveAt(t).tracks[1]);
  const trackC = useTransform(clock, (t) => driveAt(t).tracks[2]);

  useMotionValueEvent(clock, "change", (t) => {
    const s = driveAt(t);
    carRef.current?.setAttribute("transform", carTf(s.x, s.y, s.ang));
  });

  const wide = variant === "wide";
  const paint = (delay: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { pathLength: 0 },
          animate: { pathLength: 1 },
          transition: { duration: PAINT_DUR, delay, ease: EASE },
        };
  const tracks: [string, MotionValue<number>][] = [
    [segD(SEG_A), trackA],
    [segD(SEG_B), trackB],
    [segD(SEG_C), trackC],
  ];

  return (
    <svg
      aria-hidden
      className={`absolute inset-0 h-full w-full ${wide ? "hidden lg:block" : "lg:hidden"}`}
      viewBox={wide ? "0 0 1600 1000" : "0 0 800 1730"}
      preserveAspectRatio={wide ? "xMaxYMid slice" : "xMidYMax meet"}
    >
      <defs>
        <linearGradient id={`${gid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2b0" />
          <stop offset="0.28" stopColor={P.yellow} />
          <stop offset="0.75" stopColor="#e2ad00" />
          <stop offset="1" stopColor={P.yellowDeep} />
        </linearGradient>
        <linearGradient id={`${gid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5f7380" />
          <stop offset="0.5" stopColor="#1e2a33" />
          <stop offset="1" stopColor="#10161b" />
        </linearGradient>
        <linearGradient id={`${gid}-white`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#d9dadb" />
          <stop offset="1" stopColor="#9b9ea2" />
        </linearGradient>
        <radialGradient id={`${gid}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="0.7" stopColor="rgba(0,0,0,0.3)" />
          <stop offset="1" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <radialGradient id={`${gid}-cone`} cx="0.38" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff6c8" />
          <stop offset="0.35" stopColor={P.yellow} />
          <stop offset="1" stopColor="#9c7600" />
        </radialGradient>
        <linearGradient id={`${gid}-road`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="900" y2="620">
          <stop offset="0" stopColor="#4d5054" />
          <stop offset="1" stopColor="#404347" />
        </linearGradient>
      </defs>

      {/* 주차 칸과 서 있는 차 두 대: PC 왼쪽 아래 빈 바닥을 채운다 */}
      {wide && (
        <g transform="translate(60 790)">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path key={i} d={`M${i * 92} 0 V140`} stroke={P.paint} strokeOpacity="0.55" strokeWidth="5" />
          ))}
          <path d="M0 140 H552" stroke={P.paint} strokeOpacity="0.55" strokeWidth="5" />
          <g transform="translate(138 74) rotate(-90) scale(1.25)">
            <TrainingCar gid={gid} body={`url(#${gid}-white)`} />
          </g>
          <g transform="translate(414 70) rotate(-88) scale(1.25)">
            <TrainingCar gid={gid} body={`url(#${gid}-white)`} />
          </g>
        </g>
      )}

      {/* 코스. 휴대폰은 세로로 세워 화면 아래쪽을 채운다 */}
      <g transform={wide ? "translate(700 262) scale(1.05)" : "translate(793 572) rotate(90) scale(1.18)"}>
        {/* 길 가장자리 흰 선: 칠해지며 나타난다 */}
        <motion.path d={LOOP_D} fill="none" stroke={P.paint} strokeWidth="90" strokeLinejoin="round" {...paint(0)} />
        <motion.path d={STEM_D} fill="none" stroke={P.paint} strokeWidth="90" {...paint(0.5)} />
        {/* 노면 */}
        <path d={LOOP_D} fill="none" stroke={`url(#${gid}-road)`} strokeWidth="78" strokeLinejoin="round" />
        <path d={STEM_D} fill="none" stroke={`url(#${gid}-road)`} strokeWidth="78" />
        {/* 노란 중앙선(직선 구간만), 출발선, T자 코스 정지선 */}
        <path d="M200 520 H540 M680 120 H380" stroke={P.yellow} strokeWidth="4" strokeDasharray="26 22" />
        <path d="M150 482 V558" stroke={P.paint} strokeWidth="8" strokeDasharray="8 6" />
        <path d="M292 330 H368" stroke={P.yellow} strokeWidth="7" />
        {wide && (
          <text x="214" y="590" fill={P.paint} fillOpacity="0.85" fontSize="30" style={sfxF}>
            출발
          </text>
        )}

        {/* 바퀴 자국: 진한 굵은 선 위에 노면색 가는 선을 덮어 양쪽 두 줄만 남긴다 */}
        {tracks.map(([d, mv], i) =>
          reduce ? (
            i < 2 ? (
              <g key={i}>
                <path d={d} fill="none" stroke="rgba(18,18,20,0.55)" strokeWidth="27" />
                <path d={d} fill="none" stroke="#474a4e" strokeWidth="17" />
              </g>
            ) : null
          ) : (
            <g key={i}>
              <motion.path d={d} fill="none" stroke="rgba(18,18,20,0.55)" strokeWidth="27" style={{ pathLength: mv }} />
              <motion.path d={d} fill="none" stroke="#474a4e" strokeWidth="17" style={{ pathLength: mv }} />
            </g>
          ),
        )}

        {/* 라바콘 */}
        {[
          [282, 372],
          [378, 372],
          [640, 250],
          [600, 420],
          [600, 590],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
            <ellipse cx="5" cy="7" rx="17" ry="15" fill={`url(#${gid}-shadow)`} />
            <rect x="-14" y="-14" width="28" height="28" rx="4" fill="#2a2b2d" />
            <circle r="11" fill={`url(#${gid}-cone)`} />
            <circle r="6.5" fill="none" stroke="#f7f7f2" strokeWidth="3" />
            <circle cx="-2" cy="-2" r="2" fill="#fff" />
          </g>
        ))}

        {/* 교습 차 */}
        <g ref={carRef} transform={reduce ? PARKED_POSE : START_POSE}>
          <TrainingCar gid={gid} body={`url(#${gid}-body)`} sign />
        </g>
      </g>
    </svg>
  );
}

/** 위에서 본 승용차. 앞이 +x 방향, 길이 60 */
function TrainingCar({ gid, body, sign = false }: { gid: string; body: string; sign?: boolean }) {
  return (
    <g>
      {/* 바닥 그림자 */}
      <ellipse cx="5" cy="7" rx="38" ry="24" fill={`url(#${gid}-shadow)`} />
      {/* 바퀴 */}
      {[
        [-18, -17],
        [16, -17],
        [-18, 13],
        [16, 13],
      ].map(([x, y]) => (
        <rect key={`${x}${y}`} x={x - 6} y={y} width="12" height="4" rx="1.5" fill="#141517" />
      ))}
      {/* 차체 */}
      <rect x="-30" y="-15" width="60" height="30" rx="10" fill={body} />
      {/* 사이드미러 */}
      <rect x="5" y="-19" width="5" height="5" rx="1.5" fill={body} />
      <rect x="5" y="14" width="5" height="5" rx="1.5" fill={body} />
      {/* 앞유리, 뒷유리 */}
      <path d="M6 -11 Q14 -10 16 -7 L16 7 Q14 10 6 11 Z" fill={`url(#${gid}-glass)`} />
      <path d="M-19 -10 Q-24 -8 -25 -5 L-25 5 Q-24 8 -19 10 Z" fill={`url(#${gid}-glass)`} />
      {/* 지붕과 하이라이트 */}
      <rect x="-19" y="-11" width="25" height="22" rx="5" fill={body} />
      <path d="M-16 -8 H3" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 -12 Q26 -11 28 -6" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* 전조등 */}
      <rect x="26" y="-12" width="3" height="6" rx="1" fill="#fffbe6" />
      <rect x="26" y="6" width="3" height="6" rx="1" fill="#fffbe6" />
      {/* 지붕 위 교습 표시등 */}
      {sign && (
        <g>
          <rect x="-12" y="-6" width="10" height="12" rx="2" fill="#f7f7f2" />
          <rect x="-12" y="-6" width="3" height="12" rx="1" fill={C.ink} fillOpacity="0.35" />
        </g>
      )}
    </g>
  );
}

/* ---------- 1. 면허 종류별 교육 ---------- */

function CoursePicker({ reduce, license, setLicense, onReserve }: { reduce: boolean; license: LicenseId; setLicense: (l: LicenseId) => void; onReserve: () => void }) {
  const lic = LICENSES.find((l) => l.id === license) ?? LICENSES[1];
  const [extra, setExtra] = useState(0);
  const total = lic.hours.reduce<number>((s, h) => s + h, 0);
  const sum = lic.fee + lic.exam + extra * lic.extra;
  const parts = HOUR_PARTS.map((part, i) => ({ ...part, h: lic.hours[i] })).filter((x) => x.h > 0);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
      <div className="rounded-[6px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.card }}>
        <div role="radiogroup" aria-label="면허 종류" className="grid grid-cols-3 gap-2">
          {LICENSES.map((l) => {
            const on = l.id === license;
            return (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setLicense(l.id);
                  setExtra(0);
                }}
                className={`rounded-[4px] border px-2 py-3 text-[17px] font-bold md:text-[19px] ${focusRing}`}
                style={{ ...sfxF, borderColor: on ? C.asphalt : C.line, background: on ? C.asphalt : C.card, color: on ? "#fff" : C.ink, outlineColor: C.ink }}
              >
                {l.id}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-[16px]" style={{ color: C.muted }}>
          교육 차량: {lic.car}
        </p>

        {/* 교육 시간 막대: 한 칸이 한 시간 */}
        <div className="mt-6">
          <p className="flex items-baseline justify-between text-[16px] font-bold">
            <span>교육 시간</span>
            <span style={monoF}>총 {total}시간</span>
          </p>
          <div className="relative mt-3 overflow-hidden rounded-[4px] p-[6px]" style={{ background: C.asphalt }}>
            <div className="flex gap-[6px]">
              {parts.map((part) => (
                <motion.div
                  key={`${license}-${part.name}`}
                  layout={!reduce}
                  className="flex min-w-0 flex-col justify-between rounded-[2px] px-2 py-2"
                  style={{ flex: `${part.h} 1 0`, background: part.tone, color: part.ink, minHeight: 74 }}
                  initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
                  animate={{ clipPath: "inset(0 0% 0 0)" }}
                  transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                >
                  <span className="truncate text-[14px] font-bold">{part.name}</span>
                  <span className="text-[22px] leading-none" style={sfxF}>
                    {part.h}
                    <span className="ml-0.5 text-[14px]">시간</span>
                  </span>
                  {/* 한 시간 눈금 */}
                  <span aria-hidden className="mt-1.5 flex gap-[3px]">
                    {Array.from({ length: part.h }, (_, i) => (
                      <span key={i} className="h-[4px] flex-1 rounded-full" style={{ background: C.ink, opacity: 0.35 }} />
                    ))}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
          <ul className="mt-4 grid gap-1.5 text-[15px]" style={{ color: C.muted }}>
            <li>학과 교육 3시간을 마치면 면허시험장에서 학과시험을 봐요.</li>
            <li>{lic.hours[2] > 0 ? "장내기능 검정은 학원 코스에서, 도로주행 검정은 학원이 정한 도로 노선에서 봐요." : "장내기능 검정은 학원 코스에서 봐요. 2종 소형은 도로주행이 없어요."}</li>
          </ul>
        </div>
      </div>

      {/* 비용 개략 */}
      <div className="rounded-[6px] p-5 text-white md:p-7" style={{ background: C.asphalt }}>
        <p className="text-[20px]" style={sfxF}>
          {lic.id} 비용 개략
        </p>
        <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2.5 text-[16px]">
          <dt>교육비</dt>
          <dd style={monoF}>{won(lic.fee)}</dd>
          <dt>검정 수수료</dt>
          <dd style={monoF}>{won(lic.exam)}</dd>
          <dt>
            추가 {lic.extraName} {extra}시간
          </dt>
          <dd style={monoF}>{won(extra * lic.extra)}</dd>
        </dl>
        <div className="mt-5 border-t border-dashed pt-5" style={{ borderColor: "rgba(255,255,255,0.35)" }}>
          <Stepper label={`추가 ${lic.extraName}`} value={extra} set={setExtra} min={0} max={6} unit="시간" />
        </div>
        <p className="mt-6 flex items-baseline justify-between gap-3">
          <span className="text-[16px] font-bold">합계</span>
          <motion.span
            key={sum}
            initial={reduce ? false : { y: 8, opacity: 0.4 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
            className="text-[30px] leading-none md:text-[34px]"
            style={{ ...sfxF, color: P.yellow }}
            aria-live="polite"
          >
            약 {won(sum)}
          </motion.span>
        </p>
        <p className="mt-3 text-[14px]" style={{ color: P.sub }}>
          면허시험장 학과시험 응시료, 신체검사비, 면허증 발급 수수료는 따로 내요.
        </p>
        <button
          type="button"
          onClick={onReserve}
          data-gtm-cta="driving-school_course_reserve"
          className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[4px] px-4 py-3.5 text-[17px] font-bold ${focusRing}`}
          style={{ background: P.yellow, color: C.ink, outlineColor: "#fff" }}
        >
          <CalendarCheck size={20} aria-hidden />이 과정으로 등록 예약
        </button>
      </div>
    </div>
  );
}

/* ---------- 2. 셔틀버스 ---------- */

function Shuttle({ reduce }: { reduce: boolean }) {
  const [ri, setRi] = useState(0);
  const [si, setSi] = useState(0);
  const now = useNowMinutes();
  const route = ROUTES[ri];
  const stops = route.stops;
  const stop = stops[si] ?? stops[0];
  const lastIdx = stops.length - 1;

  const times = useMemo(() => {
    const out: number[] = [];
    for (let t = route.first; t <= route.last; t += 60) out.push(t + stop.m);
    return out;
  }, [route, stop]);
  const upcoming = now === null ? times.slice(0, 3) : times.filter((t) => t >= now).slice(0, 3);
  const ended = now !== null && upcoming.length === 0;
  const pct = lastIdx ? (si / lastIdx) * 100 : 0;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-[6px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.card }}>
        <div role="tablist" aria-label="셔틀버스 노선" className="flex flex-wrap gap-2">
          {ROUTES.map((r, i) => {
            const on = i === ri;
            return (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setRi(i);
                  setSi(0);
                }}
                className={`rounded-[4px] border px-3.5 py-2 text-[15px] font-bold ${focusRing}`}
                style={{ borderColor: on ? C.asphalt : C.line, background: on ? C.asphalt : C.card, color: on ? "#fff" : C.ink, outlineColor: C.ink }}
              >
                {r.id} {r.name}
              </button>
            );
          })}
        </div>

        {/* 세로 노선도. 버스 표시가 고른 정류장으로 내려간다 */}
        <div className="relative mt-6 pl-12">
          <div aria-hidden className="absolute bottom-[22px] left-[19px] top-[22px] w-[8px] rounded-full" style={{ background: C.asphalt }}>
            <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2" style={{ backgroundImage: `repeating-linear-gradient(180deg, ${P.yellow} 0 10px, transparent 10px 18px)` }} />
          </div>
          <div aria-hidden className="pointer-events-none absolute bottom-[22px] left-[7px] top-[22px] w-[32px]">
            <motion.div className="absolute inset-0" initial={false} animate={{ y: `${pct}%` }} transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}>
              <span className="absolute left-0 top-0 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-[6px] shadow-[0_3px_0_rgba(0,0,0,0.25)]" style={{ background: P.yellow, color: C.ink }}>
                <Bus size={18} />
              </span>
            </motion.div>
          </div>
          <ol className="grid">
            {stops.map((s, i) => {
              const on = i === si;
              return (
                <li key={s.name}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSi(i)}
                    className={`flex h-11 w-full items-center justify-between gap-3 rounded-[4px] px-3 text-left text-[16px] ${focusRing}`}
                    style={{ background: on ? C.yellowSoft : "transparent", fontWeight: on ? 700 : 500, outlineColor: C.ink }}
                  >
                    <span className="min-w-0 truncate">{s.name}</span>
                    <span className="flex-none text-[14px]" style={{ ...monoF, color: C.muted }}>
                      {i === 0 ? "출발" : `+${s.m}분`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="rounded-[6px] p-5 text-white md:p-7" style={{ background: C.asphalt }} aria-live="polite">
        <p className="text-[15px]" style={{ color: P.sub }}>
          {route.id} {route.name}
        </p>
        <p className="mt-1 text-[24px] leading-tight" style={sfxF}>
          {stop.name}
        </p>
        <p className="mt-6 text-[15px] font-bold">{si === lastIdx ? "학원 도착 시각" : "이 정류장 다음 차"}</p>
        {ended ? (
          <p className="mt-2 text-[18px]">
            오늘 운행이 끝났어요. 내일 첫차는 <span style={monoF}>{hm(times[0])}</span>
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {upcoming.map((t, i) => (
              <li
                key={t}
                className="rounded-[4px] px-3.5 py-2 text-[22px] leading-none"
                style={{ ...monoF, background: i === 0 ? P.yellow : "rgba(255,255,255,0.1)", color: i === 0 ? C.ink : "#fff", fontWeight: 600 }}
              >
                {hm(t)}
              </li>
            ))}
          </ul>
        )}
        <dl className="mt-7 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 border-t border-dashed pt-5 text-[15px]" style={{ borderColor: "rgba(255,255,255,0.35)" }}>
          <dt className="font-bold">운행</dt>
          <dd>
            월요일 ~ 토요일, 첫차 <span style={monoF}>{hm(route.first)}</span>, 막차 <span style={monoF}>{hm(route.last)}</span>
          </dd>
          <dt className="font-bold">돌아가는 차</dt>
          <dd>학원에서 매시 정각, 같은 정류장에 내려 드려요</dd>
          <dt className="font-bold">요금</dt>
          <dd>수강생 무료</dd>
        </dl>
      </div>
    </div>
  );
}

/* ---------- 3. 시험 일정 ---------- */

function ExamCalendar({ today, reduce }: { today: Date; reduce: boolean }) {
  const [monthOff, setMonthOff] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const base = new Date(today.getFullYear(), today.getMonth() + monthOff, 1);
  const y = base.getFullYear();
  const m = base.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  const lead = base.getDay();
  const cells: (Date | null)[] = [...Array.from({ length: lead }, () => null), ...Array.from({ length: days }, (_, i) => new Date(y, m, i + 1))];
  const isPast = (d: Date) => d.getTime() < today.getTime();
  const sel = picked !== null ? new Date(y, m, picked) : null;
  const selExams = sel ? (EXAMS[sel.getDay()] ?? []) : [];

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="rounded-[6px] border p-4 md:p-7" style={{ borderColor: C.line, background: C.card }}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setMonthOff(0);
              setPicked(null);
            }}
            disabled={monthOff === 0}
            aria-label="이번 달"
            className={`grid h-11 w-11 place-items-center rounded-[4px] border disabled:opacity-30 ${focusRing}`}
            style={{ borderColor: C.line, outlineColor: C.ink }}
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <p className="text-[22px]" style={sfxF}>
            {y}년 {m + 1}월
          </p>
          <button
            type="button"
            onClick={() => {
              setMonthOff(1);
              setPicked(null);
            }}
            disabled={monthOff === 1}
            aria-label="다음 달"
            className={`grid h-11 w-11 place-items-center rounded-[4px] border disabled:opacity-30 ${focusRing}`}
            style={{ borderColor: C.line, outlineColor: C.ink }}
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[14px] font-bold" style={{ color: C.muted }}>
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={`e${i}`} />;
            const ex = EXAMS[d.getDay()] ?? [];
            const past = isPast(d);
            const on = picked === d.getDate();
            const isToday = d.getTime() === today.getTime();
            const label = `${m + 1}월 ${d.getDate()}일${ex.length ? `, ${ex.map((e) => e.kind).join(", ")} 검정` : ", 검정 없음"}`;
            return (
              <button
                key={d.getDate()}
                type="button"
                disabled={past || ex.length === 0}
                aria-pressed={on}
                aria-label={label}
                onClick={() => setPicked(d.getDate())}
                className={`flex min-h-[58px] flex-col items-center justify-start gap-1 rounded-[4px] border pt-1.5 disabled:cursor-default ${focusRing}`}
                style={{
                  borderColor: on ? C.asphalt : isToday ? C.yellowDeep : "transparent",
                  background: on ? C.asphalt : ex.length && !past ? "#f7f6f2" : "transparent",
                  color: on ? "#fff" : past ? "#a3a4a6" : C.ink,
                  outlineColor: C.ink,
                }}
              >
                <span className="text-[15px] font-bold leading-none" style={monoF}>
                  {d.getDate()}
                </span>
                {ex.map((e) => (
                  <span
                    key={e.kind}
                    className="rounded-[2px] px-1 text-[11px] font-bold leading-[16px] md:text-[12px]"
                    style={{ background: past ? "transparent" : e.kind === "도로주행" ? P.yellow : C.asphalt, color: past ? "#a3a4a6" : e.kind === "도로주행" ? C.ink : "#fff" }}
                  >
                    {e.kind === "도로주행" ? "도로" : "기능"}
                  </span>
                ))}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[6px] p-5 text-white md:p-7" style={{ background: C.asphalt }} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {sel ? (
            <motion.div
              key={sel.getTime()}
              initial={reduce ? false : { x: 16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.25, ease: EASE }}
            >
              <p className="text-[22px]" style={sfxF}>
                {fmtKo(sel)}
              </p>
              {selExams.map((e) => (
                <div key={e.kind} className="mt-5">
                  <p className="text-[16px] font-bold">{e.kind} 검정</p>
                  <ul className="mt-2 grid gap-2">
                    {e.times.map((t, i) => {
                      const left = e.cap - takenSeats(sel, i + (e.kind === "도로주행" ? 5 : 0), e.cap);
                      return (
                        <li key={t} className="flex items-center justify-between rounded-[4px] px-3.5 py-2.5" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <span className="text-[18px]" style={monoF}>
                            {t}
                            {t === "19:00" && (
                              <span className="ml-2 text-[13px] font-bold" style={{ color: P.yellow, fontFamily: "inherit" }}>
                                저녁 회차
                              </span>
                            )}
                          </span>
                          <span className="text-[15px] font-bold" style={{ color: left <= 2 ? P.yellow : "#fff" }}>
                            {left === 0 ? "마감" : `남은 자리 ${left}`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="none" initial={false} exit={{ opacity: 0 }}>
              <p className="text-[22px]" style={sfxF}>
                검정 요일
              </p>
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 text-[16px]">
                <dt className="font-bold">장내기능</dt>
                <dd>화, 목, 토</dd>
                <dt className="font-bold">도로주행</dt>
                <dd>월, 수, 금 (저녁 7시 회차 있음)</dd>
                <dt className="font-bold">학과시험</dt>
                <dd>ㅇㅇ운전면허시험장, 평일</dd>
              </dl>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-6 border-t border-dashed pt-4 text-[14px]" style={{ borderColor: "rgba(255,255,255,0.35)", color: P.sub }}>
          검정 신청은 교육을 마친 뒤 학원 안내데스크에서 해요.
        </p>
      </div>
    </div>
  );
}

/* ---------- 4. 등록 예약 ---------- */

type Done = { no: string; name: string; phone: string; license: LicenseId; date: Date; slot: string; shuttle: string; reply: Date };

function ReserveForm({ today, reduce, license, setLicense }: { today: Date; reduce: boolean; license: LicenseId; setLicense: (l: LicenseId) => void }) {
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
    setDone({ no: `DR-${fmtDash(today).replace(/-/g, "").slice(2)}-${seq}`, name: maskName(name), phone: maskPhone(phone), license, date: days[day], slot, shuttle, reply: nextOpenDays(today, 1)[0] });
  };

  const chip = `rounded-[4px] border px-3.5 py-2 text-[15px] font-semibold ${focusRing}`;
  const chipStyle = (on: boolean) => ({ borderColor: on ? C.asphalt : C.line, background: on ? C.asphalt : C.card, color: on ? "#fff" : C.ink, outlineColor: C.ink });
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
            <p className="inline-flex items-center gap-2 text-[22px]" style={sfxF}>
              <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: C.yellow, color: C.ink }}>
                <Check size={20} aria-hidden />
              </span>
              등록 예약이 접수됐어요
            </p>
            <dl className="mt-5 grid gap-x-6 gap-y-2.5 text-[16px] sm:grid-cols-[auto_1fr]">
              <dt className="font-bold">접수 번호</dt>
              <dd style={monoF}>{done.no}</dd>
              <dt className="font-bold">신청인</dt>
              <dd>
                {done.name} / <span style={monoF}>{done.phone}</span>
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
                {KAKAO} 또는 전화{" "}
                <span className="whitespace-nowrap" style={monoF}>
                  {TEL}
                </span>
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
                      <span className="text-[18px] font-bold" style={monoF}>
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
                style={{ borderColor: tried && !nameOk ? C.error : C.line, outlineColor: C.ink }}
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
                style={{ borderColor: tried && !phoneOk ? C.error : C.line, outlineColor: C.ink, ...monoF }}
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
                <input id={agreeId} type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="h-5 w-5 flex-none accent-[#3b3d40]" />
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
                style={{ background: C.asphalt, color: "#fff", outlineColor: C.ink }}
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
