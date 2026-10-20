"use client";

import { useEffect, useRef, useState } from "react";
import { Noto_Serif_KR } from "@/lib/local-fonts";
import { motion } from "framer-motion";
import { Check, ChevronDown, Lock, MapPin, Minus, Plus, RotateCcw } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 광복절 기념 스탬프 투어 랜딩 샘플: 가상의 ㅇㅇ구 문화재단이 여는 "독립의 길" 스탬프 투어.
   기관, 동네, 장소, 해설사, 담당자 이름은 모두 가상이다. 실제 인물·건물을 사실처럼 적지 않는다.
   옛 사진을 흉내 내지 않고 글자, 선, 그림 지도로만 만든다.

   크몽 랜딩페이지 고급 패키지("랜딩 고급") 범위. 맞춤 기능은 스탬프 투어.
   잡지 지면처럼 짠다. 머리글(발행처·호수), 큰 명조 제목, 넓은 여백, 가는 선, 사진 설명 같은 작은 글, 인용문. 강조색은 빨강 하나.

   행사 연도는 올해로 잡는다(1월 1일에 바뀐다). 주년은 연도에서 1945를 뺀다(2026년이 81주년).

   상호작용(모두 브라우저 안에서만 돈다)
   1. 코스 지도: 전체 코스(6곳)와 짧은 코스(4곳, 언덕 없음)를 바꾸면 길과 거리·시간 표가 바뀐다. 장소를 누르면 설명.
   2. 도장 찍기: 장소마다 QR·위치 확인 버튼. 도장판이 채워진다.
   3. 해설사 동행 회차 예약: 날짜, 시간(남은 자리), 인원, 이름·휴대폰.
   4. 완주 기념품 신청: 도장을 다 모으면 열린다. 이름, 휴대폰, 수령 방법. 접수 화면에 회신 예정일과 담당 창구.
   5. 8월 일정, 자주 묻는 질문. */

const serif = Noto_Serif_KR;

const ORG = "곰파트너";
const DESK = "곰파트너 문화사업팀 이ㅅ영 주임";
const TEL = "02-000-0000";

const C = {
  paper: "#f4f1ea",
  card: "#fbf9f4",
  ink: "#141414",
  red: "#b8142a",
  muted: "#57524a",
  rule: "#141414",
  hair: "#cfc9bd",
  error: "#b42318",
};

const serifF = { fontFamily: `${serif.style.fontFamily}, "Nanum Myeongjo", serif` } as const;
const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const btnSolid = `inline-flex items-center justify-center gap-2 border-[1.5px] px-5 py-3.5 text-[16px] font-semibold tracking-[0.02em] transition-colors ${focusRing}`;

const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const md = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
const mdw = (d: Date) => `${d.getMonth() + 1}.${d.getDate()}(${DOW[d.getDay()]})`;

/** 행사 연도는 올해. 1월 1일에 다음 해 행사로 넘어간다 */
function eventYear(t: Date) {
  return t.getFullYear();
}

type StopId = "market" | "post" | "hall" | "well" | "names" | "archive";

const STOPS: { id: StopId; name: string; short: string; x: number; y: number; body: string; look: string; icon: string }[] = [
  {
    id: "market",
    name: "옛 장터 터",
    short: "장터",
    x: 11,
    y: 74,
    body: "장날마다 사람이 모이던 자리예요. 동네 어르신들이 들려준 옛 장날 이야기를 해설판에 옮겨 두었어요.",
    look: "구청 광장 쪽 해설판. 출발 도장도 여기서 찍어요.",
    icon: "M3 10l9-6 9 6M5 10v10h14V10M9 20v-5h6v5",
  },
  {
    id: "post",
    name: "옛 우체국 터",
    short: "우체국",
    x: 31,
    y: 53,
    body: "건물은 없어지고 표석 하나만 남았어요. 소식과 전보가 오가던 곳이라 마을 소식이 가장 먼저 닿던 자리였어요.",
    look: "편의점 앞 화단 속 낮은 표석. 지나치기 쉬워요.",
    icon: "M3 6h18v12H3zM3 6l9 7 9-7",
  },
  {
    id: "hall",
    name: "붉은 벽돌 강당",
    short: "강당",
    x: 47,
    y: 27,
    body: "지금도 수업을 하는 학교 안 강당이에요. 담장 밖 안내판에서 강당의 옛 모습을 그린 그림을 볼 수 있어요. 학교 안으로는 들어가지 않아요.",
    look: "정문 왼쪽 담장 안내판. 수업 시간에는 조용히 지나가 주세요.",
    icon: "M4 20V9l8-5 8 5v11M10 20v-5a2 2 0 0 1 4 0v5M3 20h18",
  },
  {
    id: "well",
    name: "고개 위 우물터",
    short: "우물",
    x: 67,
    y: 19,
    body: "고개를 넘던 사람들이 목을 축이던 우물 자리예요. 지금은 덮개를 씌운 둥근 돌만 남았어요. 동네가 한눈에 내려다보여요.",
    look: "계단 64개를 올라요. 짧은 코스는 이곳을 빼요.",
    icon: "M5 11h14M7 11v9h10v-9M6 7h12l-2-3H8zM12 11v4",
  },
  {
    id: "names",
    name: "이름비 공원",
    short: "이름비",
    x: 79,
    y: 52,
    body: "이 동네에서 독립운동에 함께한 주민 열두 사람의 이름을 새긴 돌비가 있어요. 이름 옆에 무엇을 했는지 한 줄씩 적혀 있어요.",
    look: "공원 안쪽 느티나무 아래. 그늘 쉼터와 물이 있어요.",
    icon: "M8 20V7l4-3 4 3v13M6 20h12M10 10h4M10 13h4M10 16h4",
  },
  {
    id: "archive",
    name: "ㅇㅇ구 기록관",
    short: "기록관",
    x: 89,
    y: 81,
    body: "도착 지점이에요. 1층 전시실에서 동네 옛 지도와 주민들이 기증한 편지를 볼 수 있어요. 완주 기념품도 여기서 받아요.",
    look: "1층 안내 데스크. 도장판 화면을 보여 주세요.",
    icon: "M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z",
  },
];

type CourseId = "full" | "short";
const COURSES: Record<CourseId, { name: string; stops: StopId[]; legs: [number, number][]; note: string; path: string }> = {
  full: {
    name: "전체 코스",
    stops: ["market", "post", "hall", "well", "names", "archive"],
    // [거리 m, 걷는 분]
    legs: [
      [500, 7],
      [600, 9],
      [450, 9],
      [700, 11],
      [550, 8],
    ],
    note: "고개를 하나 넘어요. 계단이 있어 편한 신발이 좋아요.",
    path: "M66 311 C110 280 150 240 186 223 C230 200 260 150 282 113 C320 90 360 80 402 80 C440 110 470 170 474 218 C500 260 520 300 534 340",
  },
  short: {
    name: "짧은 코스",
    stops: ["market", "post", "names", "archive"],
    legs: [
      [500, 7],
      [650, 10],
      [550, 8],
    ],
    note: "언덕을 뺐어요. 유모차와 휠체어도 다닐 수 있어요.",
    path: "M66 311 C110 280 150 240 186 223 C280 225 400 225 474 218 C500 260 520 300 534 340",
  },
};

export function LandingStampTourDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const year = eventYear(today);
  const anniv = year - 1945;
  const days = Array.from({ length: 5 }, (_, i) => new Date(year, 7, 13 + i));

  const [course, setCourse] = useState<CourseId>("full");
  const [stamps, setStamps] = useState<Record<string, number>>({});
  const need = COURSES[course].stops;
  const got = need.filter((s) => stamps[s]).length;
  const complete = got === need.length;

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div className="min-h-screen overflow-x-hidden pb-28" style={{ background: C.paper, color: C.ink }}>
      {/* 머리글: 발행처와 호수 */}
      <header className="mx-auto max-w-[1200px] px-4 pt-4 md:px-6 md:pt-6">
        <div className="flex items-center justify-between gap-3 border-b pb-2.5 text-[12px] font-semibold tracking-[0.08em] md:text-[13px]" style={{ borderColor: C.rule }}>
          <span className="inline-flex min-w-0 items-center gap-2 tracking-normal">
            {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
            <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
            <span className="flex flex-col whitespace-nowrap leading-tight">
              <span className="text-[15px] font-bold" style={serifF}>
                {ORG}
              </span>
              <span className="text-[11px] font-semibold" style={{ color: C.muted }}>
                스탬프 투어 샘플
              </span>
            </span>
          </span>
          <span className="tabular-nums">
            {year}년 8월호 · 광복 {anniv}주년
          </span>
        </div>
        <nav aria-label="이 페이지 차례" className="flex gap-4 overflow-x-auto border-b py-2 text-[13px] [scrollbar-width:none] md:gap-6 md:text-[14px]" style={{ borderColor: C.hair }}>
          {[
            ["코스", "ib-course"],
            ["도장판", "ib-stamp"],
            ["해설사 동행", "ib-guide"],
            ["기념품", "ib-gift"],
            ["일정", "ib-schedule"],
            ["묻고 답하기", "ib-faq"],
          ].map(([t, id]) => (
            <button key={id} type="button" onClick={() => go(id)} className={`flex-none py-1 hover:underline hover:underline-offset-4 ${focusRing}`} style={{ outlineColor: C.red }}>
              {t}
            </button>
          ))}
        </nav>
      </header>

      {/* 표지 */}
      <section aria-labelledby="ib-title" className="mx-auto grid max-w-[1200px] gap-8 px-4 pb-14 pt-8 md:px-6 md:pt-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        <div>
          <p className="text-[14px] font-bold tracking-[0.04em]" style={{ color: C.red }}>
            스탬프 투어 · 8월 13일~17일
          </p>
          <h1 id="ib-title" className="mt-4 text-[60px] font-black leading-[1.02] tracking-[-0.04em] md:text-[104px]" style={serifF}>
            독립의 길
            <br />
            스탬프 투어
          </h1>
          <p className="mt-6 max-w-[560px] text-[20px] leading-[1.6] md:text-[23px]" style={serifF}>
            동네에 남은 여섯 자리를 걸어서 돌아요. 2.8km, 두 시간쯤 걸려요. 도장을 다 모으면 기록관에서 기념품을 드려요.
          </p>
          <dl className="mt-8 grid grid-cols-2 border-t md:grid-cols-4" style={{ borderColor: C.rule }}>
            {[
              ["기간", `8.13 ~ 8.17, 닷새`],
              ["도장 시간", "09:00 ~ 18:00"],
              ["출발", "옛 장터 터 (구청 옆)"],
              ["참가비", "무료, 신청 없이"],
            ].map(([k, v]) => (
              <div key={k} className="border-b py-3 pr-3" style={{ borderColor: C.hair }}>
                <dt className="text-[11px] font-bold tracking-[0.1em]" style={{ color: C.red }}>
                  {k}
                </dt>
                <dd className="mt-1 text-[15px] font-medium leading-[1.45]">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={() => go("ib-course")} className={btnSolid} style={{ background: C.ink, color: C.paper, borderColor: C.ink, outlineColor: C.red }}>
              코스 보고 도장 찍기
            </button>
            <button type="button" onClick={() => go("ib-guide")} className={`${btnSolid} hover:bg-[#141414] hover:text-[#f4f1ea]`} style={{ borderColor: C.ink, outlineColor: C.red }}>
              해설사 동행 예약
            </button>
          </div>
        </div>

        <figure className="lg:pt-6">
          <div className="relative border-y py-6" style={{ borderColor: C.rule }}>
            <p aria-hidden className="text-center text-[148px] font-black leading-[0.9] tracking-[-0.06em] tabular-nums md:text-[220px]" style={{ ...serifF, color: C.red }}>
              {anniv}
            </p>
            <p className="mt-3 text-center text-[15px] tracking-[0.3em]" style={serifF}>
              {year}. 8. 15
            </p>
          </div>
          <figcaption className="mt-2 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
            올해로 {anniv}번째 광복절. 투어는 광복절을 끼고 닷새 동안 열려요.
          </figcaption>
          <blockquote className="mt-8 border-l-2 pl-4" style={{ borderColor: C.red }}>
            <p className="text-[20px] leading-[1.6] md:text-[22px]" style={serifF}>
              표석 앞에서 3분만 서 계세요. 옛 지도랑 지금 골목이 겹쳐 보여요.
            </p>
            <footer className="mt-2 text-[13px]" style={{ color: C.muted }}>
              투어 해설사 박ㅈ연
            </footer>
          </blockquote>
        </figure>
      </section>

      {/* 코스와 도장 */}
      <section id="ib-course" aria-labelledby="ib-course-title" className="scroll-mt-2 border-t" style={{ borderColor: C.rule }}>
        <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-6 md:py-16">
          <SectionHead id="ib-course-title" label="코스" title={course === "full" ? "여섯 곳, 2.8km" : "네 곳, 1.7km"} desc="장소 번호를 누르면 설명이 나와요. 현장 QR 표지판을 찍으면 도장이 찍혀요." />
          <CourseAndStamps course={course} setCourse={setCourse} stamps={stamps} setStamps={setStamps} reduce={reduce} year={year} onGift={() => go("ib-gift")} />
        </div>
      </section>

      {/* 해설사 동행 */}
      <section id="ib-guide" aria-labelledby="ib-guide-title" className="scroll-mt-2 border-t" style={{ borderColor: C.rule, background: C.card }}>
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 md:px-6 md:py-16 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-14">
          <div>
            <SectionHead id="ib-guide-title" label="해설사 동행" title="해설사와 같이 걷기" desc="회차마다 15명이에요. 장소마다 5분씩 이야기를 듣고 두 시간 동안 걸어요. 한낮은 더워서 아침과 저녁에만 해요." />
            <p className="border-t pt-4 text-[14px] leading-[1.7]" style={{ borderColor: C.hair, color: C.muted }}>
              8월 15일 저녁 7시 반은 등불을 들고 걷는 특별 회차예요. 등불은 출발 지점에서 빌려 드려요.
            </p>
          </div>
          <GuideBooking days={days} reduce={reduce} />
        </div>
      </section>

      {/* 기념품 */}
      <section id="ib-gift" aria-labelledby="ib-gift-title" className="scroll-mt-2 border-t" style={{ borderColor: C.rule }}>
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 md:px-6 md:py-16 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-14">
          <div>
            <SectionHead id="ib-gift-title" label="완주 기념품" title="다 모으면 받는 것" desc={`광복 ${anniv}주년 손수건과 완주 배지. 하루 300명분을 준비해요.`} />
            <GiftArt anniv={anniv} />
          </div>
          <GiftForm complete={complete} got={got} need={need.length} year={year} reduce={reduce} onCourse={() => go("ib-course")} />
        </div>
      </section>

      {/* 일정 */}
      <section id="ib-schedule" aria-labelledby="ib-schedule-title" className="scroll-mt-2 border-t" style={{ borderColor: C.rule, background: C.card }}>
        <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-6 md:py-16">
          <SectionHead id="ib-schedule-title" label="일정" title={`${year}년 8월`} />
          <Schedule year={year} />
        </div>
      </section>

      {/* 묻고 답하기 */}
      <section id="ib-faq" aria-labelledby="ib-faq-title" className="scroll-mt-2 border-t" style={{ borderColor: C.rule }}>
        <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-12 md:px-6 md:py-16 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-14">
          <SectionHead id="ib-faq-title" label="묻고 답하기" title="자주 묻는 것" />
          <Faq />
        </div>
      </section>

      <footer className="border-t px-4 py-10 text-[13px] leading-[1.8] md:px-6" style={{ borderColor: C.rule, color: C.muted }}>
        <div className="mx-auto grid max-w-[1200px] gap-1 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-[15px] font-bold" style={{ ...serifF, color: C.ink }}>
              {ORG}
            </p>
            <DemoMakerInfo className="mt-1" />
          </div>
          <p className="md:self-end">
            {year}년 8월호 · 광복 {anniv}주년 독립의 길 스탬프 투어
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── 지면 조각 ─────────────────────────────────────────── */

function SectionHead({ id, label, title, desc }: { id?: string; label: string; title: string; desc?: string }) {
  return (
    <div className="mb-8 md:mb-10">
      <p className="text-[12px] font-bold tracking-[0.14em]" style={{ color: C.red }}>
        {label}
      </p>
      <h2 id={id} className="mt-2 text-[38px] font-black leading-[1.12] tracking-[-0.03em] md:text-[56px]" style={serifF}>
        {title}
      </h2>
      {desc && (
        <p className="mt-4 max-w-[560px] text-[17px] leading-[1.7]" style={{ color: C.muted }}>
          {desc}
        </p>
      )}
    </div>
  );
}

/** 도장 한 개. 빨간 잉크 두 겹 원 안에 장소 그림 */
function Stamp({ stop, date, size = 72, rotate = -8 }: { stop: (typeof STOPS)[number]; date?: string; size?: number; rotate?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden style={{ transform: `rotate(${rotate}deg)`, mixBlendMode: "multiply" }}>
      <circle cx="40" cy="40" r="36" fill="none" stroke={C.red} strokeWidth="3" />
      <circle cx="40" cy="40" r="30" fill="none" stroke={C.red} strokeWidth="1.2" />
      <g transform="translate(28 16)">
        <path d={stop.icon} fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x="40" y="54" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.red} style={serifF}>
        {stop.short}
      </text>
      {date && (
        <text x="40" y="65" textAnchor="middle" fontSize="8" fill={C.red} className="tabular-nums">
          {date}
        </text>
      )}
    </svg>
  );
}

/* ── 1·2. 코스 지도와 도장판 ─────────────────────────── */

function CourseAndStamps({
  course,
  setCourse,
  stamps,
  setStamps,
  reduce,
  year,
  onGift,
}: {
  course: CourseId;
  setCourse: (c: CourseId) => void;
  stamps: Record<string, number>;
  setStamps: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  reduce: boolean;
  year: number;
  onGift: () => void;
}) {
  const c = COURSES[course];
  const [sel, setSel] = useState<StopId>("market");
  const [checking, setChecking] = useState<StopId | null>(null);
  const timer = useRef<number | null>(null);
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const stop = STOPS.find((s) => s.id === sel)!;
  const inCourse = c.stops.includes(sel);
  const order = c.stops.indexOf(sel);
  const nextLeg = order >= 0 && order < c.legs.length ? c.legs[order] : null;
  const has = !!stamps[sel];
  const got = c.stops.filter((s) => stamps[s]).length;
  const totalM = c.legs.reduce((n, l) => n + l[0], 0);
  const totalMin = c.legs.reduce((n, l) => n + l[1], 0);
  const stayMin = c.stops.length * 8;

  const stampIt = () => {
    if (has || checking) return;
    setChecking(sel);
    const id = sel;
    timer.current = window.setTimeout(() => {
      setStamps((v) => ({ ...v, [id]: Date.now() }));
      setChecking(null);
    }, reduce ? 300 : 1100);
  };

  const stampDate = (k: StopId) => {
    const t = stamps[k];
    if (!t) return undefined;
    // 행사 기간 중 하루로 찍는다(데모)
    const d = new Date(year, 7, 13 + (STOPS.findIndex((s) => s.id === k) % 5));
    return `${d.getMonth() + 1}.${d.getDate()}`;
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-x-12">
      <div>
        <div role="radiogroup" aria-label="코스 고르기" className="mb-4 grid grid-cols-2 border" style={{ borderColor: C.rule }}>
          {(Object.keys(COURSES) as CourseId[]).map((k) => {
            const on = course === k;
            const cc = COURSES[k];
            return (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setCourse(k)}
                className={`px-3 py-3 text-left ${focusRing}`}
                style={{ background: on ? C.ink : "transparent", color: on ? C.paper : C.ink, outlineColor: C.red }}
              >
                <span className="block text-[17px] font-bold" style={serifF}>
                  {cc.name}
                </span>
                <span className="block text-[13px] opacity-80">
                  {cc.stops.length}곳 · {(cc.legs.reduce((n, l) => n + l[0], 0) / 1000).toFixed(1)}km
                </span>
              </button>
            );
          })}
        </div>

        <figure>
          <div className="relative border" style={{ borderColor: C.rule, background: C.card }}>
            <DistrictMap course={course} />
            {STOPS.map((s) => {
              const n = c.stops.indexOf(s.id);
              const off = n < 0;
              const on = !!stamps[s.id];
              const active = sel === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${s.name}${off ? ", 이 코스에는 없음" : `, ${n + 1}번째`}${on ? ", 도장 찍음" : ""}`}
                  onClick={() => setSel(s.id)}
                  className={`absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[1.5px] text-[15px] font-bold tabular-nums transition-transform md:h-11 md:w-11 md:text-[17px] ${active ? "scale-110" : ""} ${focusRing}`}
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    ...serifF,
                    borderColor: off ? C.hair : C.ink,
                    background: on ? C.red : active ? C.ink : C.card,
                    color: on || active ? C.paper : off ? "#9c968b" : C.ink,
                    outlineColor: C.red,
                  }}
                >
                  {off ? "·" : on ? <Check size={18} strokeWidth={3} aria-hidden /> : n + 1}
                </button>
              );
            })}
          </div>
          <figcaption className="mt-2 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
            그림 지도. 빨간 점선이 걷는 길이에요. {c.note}
          </figcaption>
        </figure>

      </div>

      <div className="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        {/* 고른 장소 */}
        <article className="border-t pt-5" style={{ borderColor: C.rule }} aria-live="polite">
          <p className="text-[13px] font-bold tracking-[0.08em] tabular-nums" style={{ color: C.red }}>
            {inCourse ? `${order + 1} / ${c.stops.length}` : "이 코스에는 없는 곳"}
          </p>
          <h3 className="mt-1 text-[32px] font-black leading-[1.2] tracking-[-0.02em]" style={serifF}>
            {stop.name}
          </h3>
          <p className="mt-3 text-[17px] leading-[1.75]" style={serifF}>
            {stop.body}
          </p>
          <p className="mt-3 flex items-start gap-1.5 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
            <MapPin size={16} className="mt-0.5 flex-none" aria-hidden /> {stop.look}
          </p>
          {nextLeg && (
            <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
              다음 장소까지 {nextLeg[0]}m, 걸어서 {nextLeg[1]}분
            </p>
          )}
          {inCourse && (
            <button
              type="button"
              onClick={stampIt}
              disabled={has || checking !== null}
              className={`${btnSolid} mt-5 w-full disabled:cursor-default`}
              style={{ background: has ? "transparent" : C.red, color: has ? C.ink : C.paper, borderColor: has ? C.hair : C.red, outlineColor: C.ink }}
            >
              {has ? (
                <>
                  <Check size={18} aria-hidden /> 이곳 도장은 찍었어요
                </>
              ) : checking === sel ? (
                "위치 확인 중"
              ) : (
                "QR 찍고 도장 받기"
              )}
            </button>
          )}
          {inCourse && !has && (
            <p className="mt-2 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
              표지판에서 50m 안에 있어야 찍혀요. 이 화면에서는 버튼으로 해 볼 수 있어요.
            </p>
          )}
        </article>

        {/* 도장판 */}
        <div id="ib-stamp" className="mt-8 scroll-mt-4 border p-5" style={{ borderColor: C.rule, background: C.card }}>
          <div className="flex items-baseline justify-between">
            <p className="text-[20px] font-black" style={serifF}>
              도장판
            </p>
            <p className="text-[15px] font-bold tabular-nums" aria-live="polite">
              {got} / {c.stops.length}
            </p>
          </div>
          <ol className={`mt-4 grid gap-3 ${c.stops.length === 6 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-2"}`}>
            {c.stops.map((id, i) => {
              const s = STOPS.find((x) => x.id === id)!;
              const on = !!stamps[id];
              return (
                <li key={id} className="text-center">
                  <button type="button" onClick={() => setSel(id)} aria-label={`${i + 1}. ${s.name}${on ? ", 도장 찍음" : ", 아직"}`} className={`mx-auto grid aspect-square w-full max-w-[96px] place-items-center rounded-full border border-dashed ${focusRing}`} style={{ borderColor: on ? "transparent" : C.hair, outlineColor: C.red }}>
                    {on ? (
                      <motion.span initial={reduce ? false : { scale: 1.7, opacity: 0 }} animate={{ scale: 1, opacity: 0.92 }} transition={{ duration: 0.22, ease: [0.3, 1.4, 0.6, 1] }}>
                        <Stamp stop={s} date={stampDate(id)} size={84} rotate={[-9, 6, -4, 10, -12, 4][i]} />
                      </motion.span>
                    ) : (
                      <span className="text-[22px] font-bold" style={{ ...serifF, color: "#a8a195" }}>
                        {i + 1}
                      </span>
                    )}
                  </button>
                  <p className="mt-1 text-[12px]" style={{ color: on ? C.ink : C.muted }}>
                    {s.name}
                  </p>
                </li>
              );
            })}
          </ol>
          {got === c.stops.length ? (
            <div className="mt-5 border-t pt-4" style={{ borderColor: C.hair }} role="status">
              <p className="text-[17px] font-bold" style={serifF}>
                다 모았어요. 기념품을 신청하세요.
              </p>
              <button type="button" onClick={onGift} className={`${btnSolid} mt-3 w-full`} style={{ background: C.ink, color: C.paper, borderColor: C.ink, outlineColor: C.red }}>
                기념품 신청하러 가기
              </button>
            </div>
          ) : (
            <p className="mt-5 border-t pt-4 text-[14px] leading-[1.6]" style={{ borderColor: C.hair, color: C.muted }}>
              {c.stops.length - got}곳 남았어요. 기간 안이면 며칠에 나눠 모아도 돼요.
            </p>
          )}
          {got > 0 && (
            <button type="button" onClick={() => setStamps({})} className={`mt-3 inline-flex items-center gap-1.5 text-[13px] underline underline-offset-4 ${focusRing}`} style={{ color: C.muted, outlineColor: C.red }}>
              <RotateCcw size={13} aria-hidden /> 도장판 비우기
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-start-1">
        {/* 코스별 거리와 시간 */}
        <table className="w-full border-t text-left text-[15px]" style={{ borderColor: C.rule }}>
          <caption className="mb-2 text-left text-[13px] font-bold tracking-[0.1em]" style={{ color: C.red }}>
            {c.name} 거리와 시간
          </caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">구간</th>
              <th scope="col">거리</th>
              <th scope="col">걷는 시간</th>
            </tr>
          </thead>
          <tbody>
            {c.legs.map(([m, min], i) => {
              const a = STOPS.find((s) => s.id === c.stops[i])!;
              const b = STOPS.find((s) => s.id === c.stops[i + 1])!;
              return (
                <tr key={a.id + b.id} className="border-b" style={{ borderColor: C.hair }}>
                  <td className="py-2.5 pr-2">
                    {a.name}에서 {b.name}까지
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{m}m</td>
                  <td className="w-[64px] py-2.5 text-right tabular-nums">{min}분</td>
                </tr>
              );
            })}
            <tr className="font-bold">
              <td className="pt-3">걷는 거리 합계</td>
              <td className="pt-3 text-right tabular-nums">{(totalM / 1000).toFixed(1)}km</td>
              <td className="pt-3 text-right tabular-nums">{totalMin}분</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
          장소마다 8분쯤 머물면 모두 {Math.round((totalMin + stayMin) / 10) * 10}분 안팎이에요.
        </p>
      </div>
    </div>
  );
}

/** 가상의 ㅇㅇ구 그림 지도. 개천, 큰길, 고개, 블록, 공원만 선으로 그린다. */
function DistrictMap({ course }: { course: CourseId }) {
  const W = 600;
  const H = 420;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`ㅇㅇ구 그림 지도. ${COURSES[course].name} ${COURSES[course].stops.map((id) => STOPS.find((s) => s.id === id)!.name).join(", ")} 순서`}>
      <defs>
        <pattern id="ib-water" width="10" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3q2.5-2 5 0t5 0" fill="none" stroke="#8a8478" strokeWidth="0.8" />
        </pattern>
        <pattern id="ib-block" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0V6" stroke="#ddd6c8" strokeWidth="1.6" />
        </pattern>
      </defs>
      {/* 고개 등고선 */}
      {[90, 70, 52, 36].map((r, i) => (
        <ellipse key={r} cx="370" cy="88" rx={r * 1.7} ry={r} fill="none" stroke="#bdb6a8" strokeWidth={i === 3 ? 1.2 : 0.8} />
      ))}
      <text x="370" y="40" textAnchor="middle" fontSize="12" fill="#7d776c" style={serifF}>
        ㅇㅇ고개
      </text>
      {/* 개천 */}
      <path d="M0 380 C120 360 200 400 320 386 C430 374 500 400 600 392 L600 420 L0 420Z" fill="url(#ib-water)" stroke="#8a8478" strokeWidth="1" />
      <text x="300" y="410" textAnchor="middle" fontSize="12" fill="#6f695f" style={serifF}>
        ㅇㅇ천
      </text>
      {/* 블록 */}
      {[
        [30, 150, 110, 90],
        [30, 330, 120, 30],
        [210, 260, 120, 80],
        [360, 250, 90, 70],
        [230, 150, 70, 50],
        [520, 120, 64, 110],
        [400, 330, 80, 40],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="url(#ib-block)" stroke="#c8c1b3" strokeWidth="0.8" />
      ))}
      {/* 공원 */}
      <g>
        <rect x="440" y="180" width="110" height="64" rx="32" fill="none" stroke="#8a8478" strokeWidth="1" strokeDasharray="2 3" />
        {[
          [462, 200],
          [486, 222],
          [520, 198],
          [532, 226],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" fill="none" stroke="#8a8478" strokeWidth="1" />
        ))}
      </g>
      {/* 큰길 */}
      <path d="M0 232 H600" stroke={C.ink} strokeWidth="1.5" />
      <path d="M0 242 H600" stroke={C.ink} strokeWidth="1.5" />
      <text x="20" y="226" fontSize="11" fill="#57524a">
        ㅇㅇ대로
      </text>
      <path d="M170 0 V420" stroke="#9f998d" strokeWidth="1" />
      <path d="M500 0 V420" stroke="#9f998d" strokeWidth="1" />
      {/* 다른 코스의 길은 흐리게 */}
      {(Object.keys(COURSES) as CourseId[])
        .filter((k) => k !== course)
        .map((k) => (
          <path key={k} d={COURSES[k].path} fill="none" stroke="#b9b2a5" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
        ))}
      <path d={COURSES[course].path} fill="none" stroke={C.red} strokeWidth="3" strokeDasharray="7 6" strokeLinecap="round" />
      {/* 방위 */}
      <g transform="translate(560 40)" fontSize="11" fill={C.ink}>
        <path d="M0 -14 L5 4 L0 0 L-5 4Z" fill={C.ink} />
        <text y="18" textAnchor="middle">
          북
        </text>
      </g>
      <path d="M16 398h60M16 394v8M76 394v8" stroke="#6f695f" strokeWidth="1" />
      <text x="84" y="402" fontSize="10" fill="#6f695f">
        200m
      </text>
    </svg>
  );
}

/* ── 3. 해설사 동행 회차 예약 ─────────────────────────── */

const GUIDE_CAP = 15;
const TIMES = [
  { t: "09:00", label: "아침" },
  { t: "17:00", label: "저녁" },
  { t: "19:30", label: "등불 걷기", only15: true },
];

function guideTaken(d: number, s: number) {
  let h = (d + 5) * 2654435761 + (s + 3) * 97531;
  h = Math.abs((h ^ (h >>> 15)) * 2246822519) % 89;
  const base = s === 2 ? 11 : s === 0 ? 4 : 7;
  return Math.min(GUIDE_CAP, base + (h % 6));
}

function GuideBooking({ days, reduce }: { days: Date[]; reduce: boolean }) {
  const [day, setDay] = useState(2);
  const [slot, setSlot] = useState<number | null>(null);
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [booked, setBooked] = useState<{ no: string; day: number; slot: number; people: number; name: string; phone: string } | null>(null);
  const [extra, setExtra] = useState<Record<string, number>>({});
  const doneRef = useRef<HTMLDivElement>(null);

  const avail = (d: number, s: number) => (TIMES[s].only15 && days[d].getDate() !== 15 ? null : GUIDE_CAP - guideTaken(d, s) - (extra[`${d}-${s}`] ?? 0));
  const left = slot === null ? 0 : (avail(day, slot) ?? 0);
  const maxP = slot === null ? 4 : Math.max(1, Math.min(4, left));
  const p = Math.min(people, maxP);
  const phoneOk = /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.trim());
  const errs = {
    slot: slot === null ? "시간을 골라 주세요" : "",
    name: name.trim() ? "" : "이름을 적어 주세요",
    phone: phoneOk ? "" : "휴대폰 번호를 확인해 주세요",
    agree: agree ? "" : "개인정보 수집에 동의해 주세요",
  };
  const ok = Object.values(errs).every((e) => !e);
  const err = (k: keyof typeof errs) =>
    tried && errs[k] ? (
      <p className="mt-1.5 text-[14px] font-semibold" style={{ color: C.error }}>
        {errs[k]}
      </p>
    ) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok || slot === null) return;
    const d = days[day];
    const no = `G${d.getMonth() + 1}${String(d.getDate()).padStart(2, "0")}-${TIMES[slot].t.replace(":", "")}-${String(GUIDE_CAP - left + 1).padStart(2, "0")}`;
    setExtra((v) => ({ ...v, [`${day}-${slot}`]: (v[`${day}-${slot}`] ?? 0) + p }));
    setBooked({ no, day, slot, people: p, name, phone });
    requestAnimationFrame(() => doneRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" }));
  };
  const reset = () => {
    setBooked(null);
    setTried(false);
    setSlot(null);
    setName("");
    setPhone("");
    setAgree(false);
  };

  const input = `mt-2 w-full border-b-[1.5px] bg-transparent px-1 py-2.5 text-[18px] ${focusRing}`;

  if (booked) {
    const d = days[booked.day];
    return (
      <motion.div ref={doneRef} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="border-t pt-6" style={{ borderColor: C.rule }} role="status">
        <p className="text-[13px] font-bold tracking-[0.1em]" style={{ color: C.red }}>
          예약이 접수됐어요
        </p>
        <p className="mt-2 text-[34px] font-black tabular-nums tracking-[-0.02em]" style={serifF}>
          {booked.no}
        </p>
        <dl className="mt-5 grid grid-cols-[88px_1fr] gap-x-4 gap-y-3 border-t pt-4 text-[16px] leading-[1.6]" style={{ borderColor: C.hair }}>
          <dt style={{ color: C.muted }}>회차</dt>
          <dd>
            {mdw(d)} {TIMES[booked.slot].t} {TIMES[booked.slot].label}, {booked.people}명
          </dd>
          <dt style={{ color: C.muted }}>예약자</dt>
          <dd>
            {maskName(booked.name)} · {maskPhone(booked.phone)}
          </dd>
          <dt style={{ color: C.muted }}>모이는 곳</dt>
          <dd>옛 장터 터 해설판 앞. 10분 전에 와 주세요. 빨간 모자를 쓴 해설사가 기다려요.</dd>
          <dt style={{ color: C.muted }}>확인 문자</dt>
          <dd>지금 보냈어요. 전날 저녁 6시에 날씨와 함께 한 번 더 보내요.</dd>
          <dt style={{ color: C.muted }}>취소</dt>
          <dd>전날 밤 10시까지 문자 속 링크에서 해요. 비가 많이 오면 저희가 먼저 연락드려요.</dd>
          <dt style={{ color: C.muted }}>담당 창구</dt>
          <dd>
            {DESK}, {TEL}. 평일 9시~18시에 받아요.
          </dd>
        </dl>
        <button type="button" onClick={reset} className={`mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold underline underline-offset-4 ${focusRing}`} style={{ outlineColor: C.red }}>
          <RotateCcw size={15} aria-hidden /> 다른 회차도 예약하기
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="border-t pt-6" style={{ borderColor: C.rule }}>
      <fieldset>
        <legend className="text-[13px] font-bold tracking-[0.1em]" style={{ color: C.red }}>
          날짜
        </legend>
        <div className="mt-3 grid grid-cols-5 border-l" style={{ borderColor: C.hair }}>
          {days.map((d, i) => {
            const on = day === i;
            return (
              <button
                key={i}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setDay(i);
                  setSlot(null);
                }}
                className={`border-y border-r py-2.5 text-center ${focusRing}`}
                style={{ borderColor: C.hair, background: on ? C.ink : "transparent", color: on ? C.paper : C.ink, outlineColor: C.red }}
              >
                <span className="block text-[20px] font-black tabular-nums" style={serifF}>
                  {d.getDate()}
                </span>
                <span className="block text-[12px]" style={{ color: on ? C.paper : d.getDate() === 15 ? C.red : C.muted }}>
                  {d.getDate() === 15 ? "광복절" : DOW[d.getDay()]}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-7">
        <legend className="text-[13px] font-bold tracking-[0.1em]" style={{ color: C.red }}>
          시간
        </legend>
        <ul className="mt-3 border-t" style={{ borderColor: C.hair }}>
          {TIMES.map((t, s) => {
            const a = avail(day, s);
            if (a === null) return null;
            const full = a <= 0;
            const on = slot === s;
            return (
              <li key={t.t} className="border-b" style={{ borderColor: C.hair }}>
                <button
                  type="button"
                  aria-pressed={on}
                  disabled={full}
                  onClick={() => setSlot(s)}
                  className={`flex w-full items-center gap-4 px-2 py-3.5 text-left disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                  style={{ background: on ? "#ebe5d8" : "transparent", outlineColor: C.red }}
                >
                  <span aria-hidden className="grid h-5 w-5 flex-none place-items-center rounded-full border-[1.5px]" style={{ borderColor: C.ink }}>
                    {on && <span className="h-2.5 w-2.5 rounded-full" style={{ background: C.red }} />}
                  </span>
                  <span className="text-[22px] font-black tabular-nums" style={serifF}>
                    {t.t}
                  </span>
                  <span className="text-[15px]">{t.label}</span>
                  <span className="ml-auto text-right text-[14px] tabular-nums">
                    {full ? "마감" : (
                      <>
                        <b className="text-[17px]">{a}</b> / {GUIDE_CAP}석
                      </>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {err("slot")}
      </fieldset>

      <div className="mt-7 grid gap-6 md:grid-cols-[150px_1fr_1fr]">
        <div>
          <p id="ib-people" className="text-[13px] font-bold tracking-[0.1em]" style={{ color: C.red }}>
            인원
          </p>
          <div className="mt-2 flex items-center gap-1" role="group" aria-labelledby="ib-people">
            <button type="button" onClick={() => setPeople(Math.max(1, p - 1))} disabled={p <= 1} aria-label="한 명 빼기" className={`grid h-11 w-11 place-items-center border disabled:opacity-40 ${focusRing}`} style={{ borderColor: C.ink, outlineColor: C.red }}>
              <Minus size={16} aria-hidden />
            </button>
            <output className="w-12 text-center text-[20px] font-bold tabular-nums" aria-live="polite" style={serifF}>
              {p}명
            </output>
            <button type="button" onClick={() => setPeople(Math.min(maxP, p + 1))} disabled={p >= maxP} aria-label="한 명 더하기" className={`grid h-11 w-11 place-items-center border disabled:opacity-40 ${focusRing}`} style={{ borderColor: C.ink, outlineColor: C.red }}>
              <Plus size={16} aria-hidden />
            </button>
          </div>
        </div>
        <label className="block text-[13px] font-bold tracking-[0.1em]" style={{ color: C.red }}>
          이름
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="김ㅎ늘" autoComplete="name" className={input} style={{ borderColor: C.ink, color: C.ink, outlineColor: C.red, letterSpacing: 0, fontWeight: 400 }} />
          {err("name")}
        </label>
        <label className="block text-[13px] font-bold tracking-[0.1em]" style={{ color: C.red }}>
          휴대폰
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" inputMode="tel" autoComplete="tel" className={input} style={{ borderColor: C.ink, color: C.ink, outlineColor: C.red, letterSpacing: 0, fontWeight: 400 }} />
          {err("phone")}
        </label>
      </div>
      <label className="mt-6 flex cursor-pointer items-start gap-2 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 flex-none accent-[#b8142a]" />
        <span>회차 안내 문자를 보내려고 이름과 휴대폰 번호를 받아요. 8월 말에 지워요. 동의합니다.</span>
      </label>
      {err("agree")}
      <button type="submit" className={`${btnSolid} mt-6 w-full py-4 text-[17px]`} style={{ background: C.ink, color: C.paper, borderColor: C.ink, outlineColor: C.red }}>
        {slot === null ? "해설사 동행 예약하기" : `${mdw(days[day])} ${TIMES[slot].t} ${p}명 예약하기`}
      </button>
    </form>
  );
}

/* ── 4. 완주 기념품 ───────────────────────────────────── */

function GiftArt({ anniv }: { anniv: number }) {
  return (
    <figure className="mt-2">
      <svg viewBox="0 0 320 180" className="block h-auto w-full max-w-[380px]" role="img" aria-label="접힌 손수건과 둥근 완주 배지를 선으로 그린 그림">
        {/* 손수건 */}
        <g transform="translate(20 20) rotate(-6 80 70)">
          <rect x="0" y="0" width="170" height="130" fill={C.card} stroke={C.ink} strokeWidth="1.5" />
          <rect x="8" y="8" width="154" height="114" fill="none" stroke={C.ink} strokeWidth="0.8" strokeDasharray="3 3" />
          <text x="85" y="80" textAnchor="middle" fontSize="44" fontWeight="900" fill={C.red} style={serifF}>
            {anniv}
          </text>
          <text x="85" y="104" textAnchor="middle" fontSize="11" fill={C.ink} style={serifF}>
            독립의 길
          </text>
        </g>
        {/* 배지 */}
        <g transform="translate(240 104)">
          <circle r="46" fill={C.paper} stroke={C.ink} strokeWidth="1.5" />
          <circle r="38" fill="none" stroke={C.red} strokeWidth="2" />
          <text y="-2" textAnchor="middle" fontSize="15" fontWeight="900" fill={C.ink} style={serifF}>
            완주
          </text>
          <text y="16" textAnchor="middle" fontSize="9" fill={C.muted}>
            6 / 6
          </text>
        </g>
      </svg>
      <figcaption className="mt-2 text-[13px]" style={{ color: C.muted }}>
        손수건은 면 100%, 배지는 지름 4cm예요.
      </figcaption>
    </figure>
  );
}

function GiftForm({ complete, got, need, year, reduce, onCourse }: { complete: boolean; got: number; need: number; year: number; reduce: boolean; onCourse: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [how, setHow] = useState<"site" | "office" | "parcel">("site");
  const [addr, setAddr] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<{ no: string; name: string; phone: string; how: typeof how; addr: string } | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const phoneOk = /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.trim());
  const errs = {
    name: name.trim() ? "" : "이름을 적어 주세요",
    phone: phoneOk ? "" : "휴대폰 번호를 확인해 주세요",
    addr: how !== "parcel" || addr.trim().length > 5 ? "" : "받을 주소를 적어 주세요",
    agree: agree ? "" : "개인정보 수집에 동의해 주세요",
  };
  const ok = Object.values(errs).every((e) => !e);
  const err = (k: keyof typeof errs) =>
    tried && errs[k] ? (
      <p className="mt-1.5 text-[14px] font-semibold" style={{ color: C.error }}>
        {errs[k]}
      </p>
    ) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complete) return;
    setTried(true);
    if (!ok) return;
    setDone({ no: `ST-${year}-${String(1000 + Math.floor(Math.random() * 9000))}`, name, phone, how, addr });
    requestAnimationFrame(() => doneRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" }));
  };

  const reply = new Date(year, 7, 18);
  const HOW = {
    site: { t: "도착 지점에서 바로", d: "ㅇㅇ구 기록관 1층 안내 데스크. 도장판 화면과 이 접수 번호를 보여 주세요. 8월 31일까지 받을 수 있어요." },
    office: { t: "구청 민원실에서", d: "ㅇㅇ구청 1층 민원실. 평일 9시~18시. 8월 31일까지 받을 수 있어요." },
    parcel: { t: "택배로", d: "배송비는 저희가 내요. 9월 첫 주에 한꺼번에 보내요." },
  } as const;

  if (done) {
    return (
      <motion.div ref={doneRef} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="border-t pt-6" style={{ borderColor: C.rule }} role="status">
        <p className="text-[13px] font-bold tracking-[0.1em]" style={{ color: C.red }}>
          기념품 신청이 접수됐어요
        </p>
        <p className="mt-2 text-[34px] font-black tabular-nums tracking-[-0.02em]" style={serifF}>
          {done.no}
        </p>
        <dl className="mt-5 grid grid-cols-[88px_1fr] gap-x-4 gap-y-3 border-t pt-4 text-[16px] leading-[1.6]" style={{ borderColor: C.hair }}>
          <dt style={{ color: C.muted }}>신청자</dt>
          <dd>
            {maskName(done.name)} · {maskPhone(done.phone)}
          </dd>
          <dt style={{ color: C.muted }}>받는 방법</dt>
          <dd>
            {HOW[done.how].t}. {HOW[done.how].d}
            {done.how === "parcel" && <span className="block" style={{ color: C.muted }}>{done.addr.slice(0, 10)}…</span>}
          </dd>
          <dt style={{ color: C.muted }}>회신 예정</dt>
          <dd>{md(reply)}까지 수령 안내 문자를 보내요. 그 전에 받으러 오셔도 돼요.</dd>
          <dt style={{ color: C.muted }}>담당 창구</dt>
          <dd>
            {DESK}, {TEL}. 평일 9시~18시에 받아요.
          </dd>
        </dl>
        <button type="button" onClick={() => setDone(null)} className={`mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold underline underline-offset-4 ${focusRing}`} style={{ outlineColor: C.red }}>
          <RotateCcw size={15} aria-hidden /> 신청 내용 고치기
        </button>
      </motion.div>
    );
  }

  const input = `mt-2 w-full border-b-[1.5px] bg-transparent px-1 py-2.5 text-[18px] disabled:opacity-50 ${focusRing}`;
  const fieldStyle = { borderColor: C.ink, color: C.ink, outlineColor: C.red, letterSpacing: 0, fontWeight: 400 };

  return (
    <form onSubmit={submit} noValidate className="border-t pt-6" style={{ borderColor: C.rule }}>
      {!complete && (
        <div className="mb-6 flex items-start gap-3 border px-4 py-3.5" style={{ borderColor: C.hair, background: C.card }} aria-live="polite">
          <Lock size={18} className="mt-0.5 flex-none" style={{ color: C.red }} aria-hidden />
          <div className="text-[15px] leading-[1.6]">
            <p>
              도장 <b className="tabular-nums">{got} / {need}</b>. 다 모으면 신청할 수 있어요.
            </p>
            <button type="button" onClick={onCourse} className={`mt-1 text-[14px] font-semibold underline underline-offset-4 ${focusRing}`} style={{ outlineColor: C.red }}>
              코스로 가서 도장 찍기
            </button>
          </div>
        </div>
      )}
      <fieldset disabled={!complete} className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block text-[13px] font-bold tracking-[0.1em]" style={{ color: C.red }}>
            이름
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="김ㅎ늘" autoComplete="name" className={input} style={fieldStyle} />
            {err("name")}
          </label>
          <label className="block text-[13px] font-bold tracking-[0.1em]" style={{ color: C.red }}>
            휴대폰
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" inputMode="tel" autoComplete="tel" className={input} style={fieldStyle} />
            {err("phone")}
          </label>
        </div>
        <div>
          <p className="text-[13px] font-bold tracking-[0.1em]" style={{ color: C.red }} id="ib-how">
            받는 방법
          </p>
          <div role="radiogroup" aria-labelledby="ib-how" className="mt-2 border-t" style={{ borderColor: C.hair }}>
            {(Object.keys(HOW) as (keyof typeof HOW)[]).map((k) => (
              <label key={k} className="flex cursor-pointer items-start gap-3 border-b px-1 py-3" style={{ borderColor: C.hair }}>
                <input type="radio" name="ib-how" checked={how === k} onChange={() => setHow(k)} className="mt-1 h-5 w-5 flex-none accent-[#b8142a]" />
                <span>
                  <span className="block text-[17px] font-bold" style={serifF}>
                    {HOW[k].t}
                  </span>
                  <span className="block text-[14px] leading-[1.6]" style={{ color: C.muted }}>
                    {HOW[k].d}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
        {how === "parcel" && (
          <label className="block text-[13px] font-bold tracking-[0.1em]" style={{ color: C.red }}>
            받을 주소
            <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="서울 ㅇㅇ구 ㅇㅇ로 00, 000호" autoComplete="street-address" className={input} style={fieldStyle} />
            {err("addr")}
          </label>
        )}
        <label className="flex cursor-pointer items-start gap-2 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 flex-none accent-[#b8142a]" />
          <span>기념품을 전하려고 이름, 휴대폰 번호, 주소를 받아요. 9월 말에 지워요. 동의합니다.</span>
        </label>
        {err("agree")}
        <button type="submit" className={`${btnSolid} w-full py-4 text-[17px] disabled:cursor-not-allowed disabled:opacity-40`} style={{ background: C.red, color: C.paper, borderColor: C.red, outlineColor: C.ink }}>
          기념품 신청하기
        </button>
      </fieldset>
    </form>
  );
}

/* ── 5. 일정 ──────────────────────────────────────────── */

function Schedule({ year }: { year: number }) {
  const d = (day: number) => new Date(year, 7, day);
  const rows: [Date, Date | null, string, string][] = [
    [d(3), null, "해설사 동행 예약 열림", "오전 10시부터 이 페이지에서 받아요."],
    [d(13), d(17), "스탬프 투어", "매일 9시~18시에 도장을 찍을 수 있어요. 신청 없이 오시면 돼요."],
    [d(15), null, "등불 걷기", "저녁 7시 반, 해설사와 등불을 들고 전체 코스를 걸어요. 15명."],
    [d(15), null, "기록관 늦게까지", "광복절에는 기록관 전시실을 밤 9시까지 열어요."],
    [d(18), null, "기념품 안내 문자", "택배로 신청한 분께 보내는 날짜와 주소 확인 문자를 보내요."],
    [d(31), null, "현장 수령 마감", "기록관과 구청 민원실에서 받는 기념품은 이날까지예요."],
  ];
  return (
    <ol className="border-t" style={{ borderColor: C.rule }}>
      {rows.map(([a, b, t, desc]) => (
        <li key={t} className="grid gap-1 border-b py-4 md:grid-cols-[300px_240px_1fr] md:gap-6" style={{ borderColor: C.hair }}>
          <p className="text-[22px] font-black tabular-nums tracking-[-0.02em] md:text-[26px]" style={{ ...serifF, color: a.getDate() === 15 ? C.red : C.ink }}>
            {mdw(a)}
            {b && <span>{` ~ ${mdw(b)}`}</span>}
          </p>
          <p className="text-[18px] font-bold" style={serifF}>
            {t}
          </p>
          <p className="text-[15px] leading-[1.65]" style={{ color: C.muted }}>
            {desc}
          </p>
        </li>
      ))}
    </ol>
  );
}

/* ── 6. 묻고 답하기 ───────────────────────────────────── */

const FAQ = [
  { q: "비가 오면 어떻게 되나요?", a: "도장은 비가 와도 찍을 수 있어요. 해설사 동행은 호우 특보가 나오면 취소하고 전날 저녁에 문자로 알려 드려요." },
  { q: "하루에 다 못 돌면요?", a: "8월 13일부터 17일 사이라면 며칠에 나눠 모아도 돼요. 같은 휴대폰으로 들어오면 도장판이 이어져요." },
  { q: "유모차나 휠체어로도 돌 수 있나요?", a: "짧은 코스는 계단이 없어요. 전체 코스는 고개 위 우물터에 계단 64개가 있어요." },
  { q: "많이 더울 것 같아요", a: "이름비 공원과 기록관에 그늘 쉼터와 물이 있어요. 한낮에는 기록관 안에서 쉬었다 가세요." },
  { q: "아이 혼자 와도 되나요?", a: "초등학생은 보호자와 같이 와 주세요. 중학생부터는 혼자 돌아도 기념품을 받을 수 있어요." },
  { q: "반려견과 걸어도 되나요?", a: "목줄을 하면 바깥 코스는 같이 걸을 수 있어요. 기록관 실내에는 들어갈 수 없어요." },
];

function Faq() {
  return (
    <div className="border-t" style={{ borderColor: C.rule }}>
      {FAQ.map((f) => (
        <details key={f.q} className="group border-b" style={{ borderColor: C.hair }}>
          <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[18px] font-bold [&::-webkit-details-marker]:hidden ${focusRing}`} style={{ ...serifF, outlineColor: C.red }}>
            {f.q}
            <ChevronDown size={20} className="flex-none transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
          </summary>
          <p className="pb-5 text-[16px] leading-[1.75]" style={{ color: C.muted }}>
            {f.a}
          </p>
        </details>
      ))}
    </div>
  );
}
