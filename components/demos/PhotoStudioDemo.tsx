"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useScroll, useTransform, type MotionValue } from "framer-motion";
import { AlertCircle, CalendarCheck, Camera, Car, Check, ChevronDown, Clock, MapPin, MessageCircle, Minus, Plus, Shirt } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 사진관 홈페이지 샘플: 가상의 곰파트너 사진관. 증명사진, 프로필, 가족사진, 우정사진, 반려동물 촬영.
   상호, 주소, 손님 이름은 모두 가상이다.
   첫 화면 사진 출처: Pexels 사진 30332804

   국내 사진관 사이트 구성(벤치마킹 메모)
   - 메뉴는 갤러리, 상품 안내(가격표), 예약, 촬영 안내, 오시는 길. 첫 화면은 큰 사진 갤러리.
   - 가격표는 패키지 표(컷수, 보정 장수, 원본 제공, 출력 크기, 소요시간)와 추가 옵션(추가 보정, 액자, 헤어메이크업).
   - 예약은 네이버 예약이나 카카오톡 채널. 30분 단위 시간표에 마감 표시. 당일 예약은 전화 문의.
   - 촬영 안내에 준비물(여권 규격, 안경), 복장(단색 상의, 배경지 색과 겹치지 않게), 주차. 영업시간에 정기 휴무.

   핵심 모션
   - 첫 화면(ps-poster): 스튜디오 사진 한 장이 화면을 채운다. 들어올 때 사진이 1.06배에서 1.6초 동안 천천히 다가오고,
     문장과 정보 줄은 0.3초 늦게 12px 아래에서 올라온다(CSS 키프레임, 끝 상태가 기본값). 스크롤하면 사진만 8% 느리게 움직인다.
   - 갤러리: 세로 스크롤에 맞춰 가로로 흐른다(sticky 구간 + useScroll). 가운데 온 카드만 살짝 커지고 캡션이 뜬다.
   동작 줄이기면 첫 화면은 멈춘 사진, 갤러리는 보통 가로 스크롤(scroll-snap)로 바뀐다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 컨셉 필터: 증명, 프로필, 가족, 우정, 반려동물. 고르면 갤러리에 그 컨셉만 남는다.
   2. 패키지 비교: 기본, 스탠다드, 프리미엄 표와 추가 옵션 합산.
   3. 배경지 색: 6색. 고르면 갤러리 첫 카드 배경이 바뀌고 어울리는 옷 색 한 줄.
   4. 촬영 예약: 날짜(오늘부터 14일), 시간대(30분 단위, 마감 표시), 인원, 이름, 휴대폰. 완료 화면에 예약번호, 수령 예정일, 담당 창구.
   5. 촬영 안내와 오시는 길: 준비물, 복장, 주차 탭. 영업시간에 오늘 요일 진하게. */

const IMG = "/images/demo-photo-studio";

const BRAND = "곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 2층";
const KAKAO = "카카오톡 채널 곰파트너";

const C = {
  bg: "#141414",
  panel: "#1b1b1b",
  panel2: "#242424",
  line: "#2e2e2e",
  text: "#f2f2f2",
  muted: "#a3a3a3",
  accent: "#b8956a",
  accentInk: "#141414",
  error: "#f0a39a",
};

/* 모션 상수 */
const EASE = [0.22, 1, 0.36, 1] as const;
const DUR_CARD = 0.45; // 카드 재배열 450ms
const DUR_UI = 0.22; // 칩, 탭 220ms
const FOCUS_SCALE = 1.04; // 가운데 카드 확대 비율
const SLIDE_PX = 1; // 세로 스크롤 1px당 가로 이동 px

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#b8956a]";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* 배경지 6색. tip은 사진관이 손님에게 하는 옷 색 안내 */
const BACKDROPS = [
  { id: "white", name: "화이트", hex: "#efede8", tip: "흰 배경에는 검정, 네이비처럼 진한 상의가 또렷하게 나와요. 흰 옷은 배경에 묻혀요." },
  { id: "cobalt", name: "코발트", hex: "#3d5683", tip: "파란 배경에는 흰색, 베이지 상의가 잘 받아요. 파란 계열 옷은 피해 주세요." },
  { id: "lemon", name: "레몬", hex: "#d4b45a", tip: "노란 배경에는 흰색, 데님 상의가 산뜻해요. 노란 옷은 피해 주세요." },
  { id: "coral", name: "코랄", hex: "#c47c66", tip: "코랄 배경에는 흰색, 아이보리 상의가 화사해요. 빨간 계열은 피해 주세요." },
  { id: "mint", name: "민트", hex: "#7aa396", tip: "민트 배경에는 흰색, 연한 베이지 상의가 어울려요. 초록 옷은 묻혀요." },
  { id: "lilac", name: "라일락", hex: "#8a7fa6", tip: "라일락 배경에는 흰색, 차콜 상의가 차분해요. 보라 계열 옷은 피해 주세요." },
] as const;
type BackdropId = (typeof BACKDROPS)[number]["id"];
const backdropHex = (id: BackdropId) => BACKDROPS.find((b) => b.id === id)!.hex;

const CONCEPTS = ["증명", "프로필", "가족", "우정", "반려동물"] as const;
type Concept = (typeof CONCEPTS)[number];
type Fig = "one" | "two" | "family" | "family3" | "dog" | "familydog";

type Card = { id: string; concept: Concept; ratio: number; name: string; light: string; bg: string; fig: Fig };
/* 비율은 가로/세로. 4:5 = 0.8, 1:1 = 1, 3:4 = 0.75 */
const CARDS: Card[] = [
  { id: "id-passport", concept: "증명", ratio: 0.8, name: "여권, 비자 증명", light: "정면 소프트박스 2등", bg: "#efede8", fig: "one" },
  { id: "id-resume", concept: "증명", ratio: 0.75, name: "이력서 증명", light: "소프트박스 1등 + 반사판", bg: "#c9ccd0", fig: "one" },
  { id: "pf-biz", concept: "프로필", ratio: 0.8, name: "비즈니스 프로필", light: "옥타박스 1등 + 림라이트", bg: "#2b2b2b", fig: "one" },
  { id: "pf-color", concept: "프로필", ratio: 1, name: "컬러 프로필", light: "뷰티디쉬 위에서", bg: "#d4b45a", fig: "one" },
  { id: "pf-actor", concept: "프로필", ratio: 0.75, name: "배우 프로필", light: "하드라이트 1등, 그림자 살림", bg: "#3a3a3a", fig: "one" },
  { id: "fm-four", concept: "가족", ratio: 1, name: "네 식구 가족사진", light: "옥타박스 2등 균일", bg: "#d3c6b2", fig: "family" },
  { id: "fm-baby", concept: "가족", ratio: 0.8, name: "백일, 첫돌 가족", light: "창가 자연광 + 반사판", bg: "#efede8", fig: "family3" },
  { id: "fm-grand", concept: "가족", ratio: 0.75, name: "부모님 칠순 가족", light: "소프트박스 3등", bg: "#c9ccd0", fig: "family" },
  { id: "fr-two", concept: "우정", ratio: 0.8, name: "우정사진 둘", light: "스트립박스 좌우", bg: "#c47c66", fig: "two" },
  { id: "fr-grad", concept: "우정", ratio: 1, name: "졸업 우정사진", light: "탑라이트 + 배경등", bg: "#3d5683", fig: "two" },
  { id: "pet-dog", concept: "반려동물", ratio: 1, name: "강아지 단독", light: "소프트박스 2등, 낮게", bg: "#8a7fa6", fig: "dog" },
  { id: "pet-family", concept: "반려동물", ratio: 0.8, name: "반려동물과 가족", light: "옥타박스 1등 + 반사판", bg: "#7aa396", fig: "familydog" },
];

/* 가격. 증명사진 25,000원 선, 프로필 패키지 10만~30만원대 시세 */
const ID_PRICES = [
  ["증명사진", "보정 1장, 출력 8매, 파일", 25000],
  ["여권사진", "규격 확인, 보정 1장, 출력 6매", 30000],
] as const;
const PKGS = [
  { id: "basic", name: "기본", price: 100000, shots: "30컷", retouch: "2장", raw: "없음", print: "5x7 1장", time: "30분" },
  { id: "standard", name: "스탠다드", price: 180000, shots: "60컷", retouch: "5장", raw: "전체 제공", print: "5x7 2장, 8x10 1장", time: "50분" },
  { id: "premium", name: "프리미엄", price: 300000, shots: "100컷", retouch: "10장", raw: "전체 제공", print: "8x10 2장, 5x7 2장", time: "90분" },
] as const;
type PkgId = (typeof PKGS)[number]["id"];
const ROWS = [
  ["촬영 컷수", "shots"],
  ["보정 장수", "retouch"],
  ["원본 제공", "raw"],
  ["출력 크기", "print"],
  ["소요시간", "time"],
] as const;
const OPT = { retouch: 15000, frame: 35000, makeup: 70000 } as const;

/* 예약. 매주 월요일 휴무, 30분 단위 */
const BOOK_DAYS = 14;
const CLOSED_DOW = 1;
const SLOTS = Array.from({ length: 17 }, (_, i) => `${p2(10 + Math.floor((i + 1) / 2))}:${(i + 1) % 2 ? "30" : "00"}`);
const PICKUP_DAYS = 5;

/** 날짜, 시간대별로 이미 찬 자리. 실제로는 예약 시트에서 읽는다. 주말 오후가 먼저 찬다. */
function isTaken(d: Date, slot: number) {
  const key = d.getDate() * 31 + d.getMonth() * 7;
  let h = (key + 11) * 2654435761 + (slot + 3) * 40503;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 100;
  const weekend = d.getDay() === 0 || d.getDay() === 6;
  const limit = (weekend ? 55 : 30) + (slot >= 8 ? 15 : 0);
  return h < limit;
}

/* 색 보조 */
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const mix = (hex: string, to: [number, number, number], t: number) => {
  const a = rgb(hex);
  return `rgb(${a.map((v, i) => Math.round(v + (to[i] - v) * t)).join(",")})`;
};
const isDark = (hex: string) => {
  const [r, g, b] = rgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.42;
};
/** 배경지 종이. 위는 조금 밝고 아래로 조금 어두워진다. */
const paper = (hex: string) => `linear-gradient(180deg, ${mix(hex, [255, 255, 255], 0.06)} 0%, ${hex} 45%, ${mix(hex, [0, 0, 0], 0.16)} 100%)`;

/* 촬영 컨셉 실루엣(무채색) */
function Person({ cx, s, fill, stroke }: { cx: number; s: number; fill: string; stroke?: string }) {
  const base = 100;
  const headR = 8.5 * s;
  const headY = base - 44 * s;
  const sh = base - 30 * s;
  const d = `M ${cx - 24 * s} ${base} L ${cx - 23 * s} ${base - 19 * s} C ${cx - 22 * s} ${sh} ${cx - 13 * s} ${sh - 2 * s} ${cx - 5 * s} ${sh - 3 * s} L ${cx + 5 * s} ${sh - 3 * s} C ${cx + 13 * s} ${sh - 2 * s} ${cx + 22 * s} ${sh} ${cx + 23 * s} ${base - 19 * s} L ${cx + 24 * s} ${base} Z`;
  return (
    <g fill={fill} stroke={stroke} strokeWidth={stroke ? 1 : 0} strokeLinejoin="round">
      <rect x={cx - 4.2 * s} y={headY + 5 * s} width={8.4 * s} height={11 * s} />
      <circle cx={cx} cy={headY} r={headR} />
      <path d={d} />
    </g>
  );
}

function Dog({ cx, s, fill, stroke }: { cx: number; s: number; fill: string; stroke?: string }) {
  const base = 100;
  return (
    <g fill={fill} stroke={stroke} strokeWidth={stroke ? 1 : 0} strokeLinejoin="round">
      <ellipse cx={cx} cy={base - 14 * s} rx={15 * s} ry={13 * s} />
      <rect x={cx - 13 * s} y={base - 14 * s} width={26 * s} height={14 * s} />
      <circle cx={cx + 4 * s} cy={base - 36 * s} r={9.5 * s} />
      <ellipse cx={cx - 4 * s} cy={base - 38 * s} rx={3.2 * s} ry={7 * s} transform={`rotate(18 ${cx - 4 * s} ${base - 38 * s})`} />
      <ellipse cx={cx + 12 * s} cy={base - 38 * s} rx={3.2 * s} ry={7 * s} transform={`rotate(-18 ${cx + 12 * s} ${base - 38 * s})`} />
      <path d={`M ${cx - 14 * s} ${base - 16 * s} C ${cx - 22 * s} ${base - 20 * s} ${cx - 24 * s} ${base - 28 * s} ${cx - 19 * s} ${base - 31 * s}`} fill="none" strokeWidth={2.6 * s} stroke={fill} strokeLinecap="round" />
    </g>
  );
}

function Figure({ fig, dark }: { fig: Fig; dark: boolean }) {
  const fill = dark ? "#101010" : "#2a2a2a";
  const stroke = dark ? "rgba(255,255,255,0.28)" : undefined;
  const p = { fill, stroke };
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" className="absolute inset-x-0 bottom-0 h-[80%] w-full" aria-hidden>
      {fig === "one" && <Person cx={50} s={1.35} {...p} />}
      {fig === "two" && (
        <>
          <Person cx={36} s={1.1} {...p} />
          <Person cx={66} s={1.05} {...p} />
        </>
      )}
      {fig === "family" && (
        <>
          <Person cx={22} s={1.0} {...p} />
          <Person cx={78} s={1.05} {...p} />
          <Person cx={40} s={0.62} {...p} />
          <Person cx={60} s={0.7} {...p} />
        </>
      )}
      {fig === "family3" && (
        <>
          <Person cx={34} s={1.05} {...p} />
          <Person cx={68} s={1.1} {...p} />
          <Person cx={51} s={0.5} {...p} />
        </>
      )}
      {fig === "dog" && <Dog cx={50} s={1.45} {...p} />}
      {fig === "familydog" && (
        <>
          <Person cx={32} s={1.05} {...p} />
          <Person cx={64} s={1.1} {...p} />
          <Dog cx={50} s={0.75} {...p} />
        </>
      )}
    </svg>
  );
}

type Box = { left: number; width: number };

/* 갤러리 카드 한 장. 가운데 올수록 focus가 1에 가까워진다. */
function GalleryCard({
  card,
  bg,
  first,
  x,
  tick,
  boxes,
  viewW,
  reduce,
}: {
  card: Card;
  bg: string;
  first: boolean;
  x: MotionValue<number>;
  tick: MotionValue<number>;
  boxes: React.RefObject<Record<string, Box>>;
  viewW: React.RefObject<number>;
  reduce: boolean;
}) {
  const focus = useTransform(() => {
    if (reduce) return 1;
    tick.get();
    const b = boxes.current[card.id];
    const vw = viewW.current;
    // 측정 전(서버 렌더 포함)에는 첫 카드가 가운데 있다
    if (!b || !vw) return first ? 1 : 0;
    const center = b.left + b.width / 2 + x.get();
    const d = Math.abs(center - vw / 2);
    return Math.max(0, Math.min(1, 1 - d / (b.width * 0.7)));
  });
  const scale = useTransform(focus, [0, 1], [1, FOCUS_SCALE]);
  const capOpacity = useTransform(focus, [0.5, 0.88], [0, 1]);
  const capY = useTransform(focus, [0.5, 0.88], [10, 0]);
  const capTransform = useMotionTemplate`translateY(${capY}px)`;
  const dark = isDark(bg);

  return (
    <motion.div
      layout={reduce ? false : "position"}
      data-id={card.id}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transition: { duration: DUR_UI } }}
      transition={{ duration: reduce ? 0 : DUR_CARD, ease: EASE }}
      className="relative shrink-0 snap-center"
      style={{ height: "var(--ps-h)", aspectRatio: String(card.ratio) }}
    >
      <motion.div className="absolute inset-0 overflow-hidden rounded-[4px]" style={{ scale, background: paper(bg) }}>
        <Figure fig={card.fig} dark={dark} />
        <motion.figcaption
          className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-10 text-left"
          style={{ opacity: capOpacity, transform: capTransform, background: "linear-gradient(180deg, transparent, rgba(14,14,14,0.86))", color: C.text }}
        >
          <span className="text-[13px] font-semibold" style={{ color: C.accent }}>
            {card.concept}
          </span>
          <span className="mt-1 block text-[18px] font-bold leading-tight">{card.name}</span>
          <span className="mt-0.5 block text-[13px]" style={{ color: C.muted }}>
            조명 {card.light}
          </span>
        </motion.figcaption>
      </motion.div>
    </motion.div>
  );
}

/* 배경지 색 버튼 */
function Roll({ b, on, onPick }: { b: (typeof BACKDROPS)[number]; on: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={on}
      className={`flex flex-col items-center gap-1 rounded-[6px] px-1.5 pb-1 pt-1.5 ${focusRing}`}
      style={{ background: on ? C.panel2 : "transparent" }}
    >
      <span className="relative block h-7 w-8 rounded-[4px] border" style={{ background: b.hex, borderColor: on ? C.accent : C.line }} aria-hidden>
        {on && (
          <span className="absolute inset-0 flex items-center justify-center" style={{ color: isDark(b.hex) ? "#fff" : "#1c1c1c" }}>
            <Check size={14} strokeWidth={2.5} />
          </span>
        )}
      </span>
      <span className="text-[12px] font-medium" style={{ color: on ? C.text : C.muted }}>
        {b.name}
      </span>
    </button>
  );
}

/* 하위 섹션 제목 */
function Title({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-[26px] font-bold leading-tight tracking-[-0.02em] md:text-[32px]" style={{ color: C.text }}>
      {children}
    </h2>
  );
}

function Stepper({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (v: number) => void; label: string }) {
  const btn = `inline-flex h-9 w-9 items-center justify-center rounded-[4px] border disabled:opacity-40 ${focusRing}`;
  return (
    <span className="inline-flex items-center gap-2" role="group" aria-label={label}>
      <button type="button" className={btn} style={{ borderColor: C.line }} disabled={value <= min} onClick={() => onChange(value - 1)} aria-label={`${label} 줄이기`}>
        <Minus size={16} />
      </button>
      <span className="min-w-[2ch] text-center text-[17px] font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} style={{ borderColor: C.line }} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label={`${label} 늘리기`}>
        <Plus size={16} />
      </button>
    </span>
  );
}

/* ---------- 첫 화면 ---------- */

/* 문장과 정보 줄 등장: 0.3초 뒤 0.7초 동안 12px 아래에서 올라온다. 끝 상태가 기본값이라 JS 없이도 보인다. */
const POSTER_CSS = `
@keyframes ps-rise { from { opacity: 0; transform: translateY(12px); } }
.ps-rise { animation: ps-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }
@media (prefers-reduced-motion: reduce) { .ps-rise { animation: none !important; } }
`;

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, (v) => `${v * 8}%`);

  return (
    <section ref={ref} id="ps-poster" aria-labelledby="ps-poster-title" className="relative min-h-[100svh] overflow-hidden" style={{ background: C.bg }}>
      <style>{POSTER_CSS}</style>
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: photoY }}>
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: reduce ? 0 : 1.6, ease: EASE }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="양쪽에 소프트박스 조명을 세운 사진 스튜디오와 가운데 내려진 배경지"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 45%" }}
          />
        </motion.div>
      </motion.div>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.25))" }}
        aria-hidden
      />

      {/* 상호와 예약 버튼 */}
      <div className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-[1200px] items-center justify-between px-4 pt-4 md:px-6 md:pt-6">
        <SampleLogo light small />
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta="photo-studio_poster_cta"
          className={`inline-flex items-center gap-1.5 rounded-[6px] px-4 py-2.5 text-[15px] font-semibold ${focusRing}`}
          style={{ background: C.accent, color: C.accentInk }}
        >
          <CalendarCheck size={17} aria-hidden />
          예약하기
        </button>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1200px] flex-col justify-end px-4 pb-14 pt-28 md:px-6 md:pb-20">
        <div className={reduce ? undefined : "ps-rise"}>
          <h1
            id="ps-poster-title"
            className="text-[36px] font-bold leading-[1.2] tracking-[-0.03em] [word-break:keep-all] md:text-[clamp(40px,5vw,72px)]"
            style={{ color: C.text }}
          >
            증명사진,
            <br />
            20분이면 찾아가요
          </h1>
          <p className="mt-4 inline-flex items-center gap-1.5 text-[15px] md:mt-5 md:text-[17px]" style={{ color: "#d6d6d6" }}>
            <MapPin size={16} aria-hidden />
            ㅇㅇ역 2번 출구 도보 5분
          </p>
        </div>
      </div>
    </section>
  );
}


type Booking = { no: number; day: Date; slot: string; people: number; name: string; phone: string; pkg: PkgId };

export function PhotoStudioDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  /* 1. 컨셉 필터, 3. 배경지 */
  const [concept, setConcept] = useState<Concept | "전체">("전체");
  const [backdrop, setBackdrop] = useState<BackdropId>("white");
  const visible = concept === "전체" ? CARDS : CARDS.filter((c) => c.concept === concept);
  const firstId = visible[0]?.id;

  /* 가로 갤러리 스크롤 연동 */
  const wrapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const boxes = useRef<Record<string, Box>>({});
  const viewW = useRef(0);
  const tick = useMotionValue(0);
  const maxShift = useMotionValue(0);
  const [shiftPx, setShiftPx] = useState(0);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] });
  const x = useTransform(() => -scrollYProgress.get() * maxShift.get());
  const count = useTransform(() => Math.min(visible.length, Math.round(scrollYProgress.get() * (visible.length - 1)) + 1));
  const counter = useMotionTemplate`${count} / ${visible.length}`;

  const measure = useCallback(() => {
    const view = viewRef.current;
    const track = trackRef.current;
    if (!view || !track) return;
    viewW.current = view.clientWidth;
    const next: Record<string, Box> = {};
    for (const el of Array.from(track.children) as HTMLElement[]) {
      const id = el.dataset.id;
      if (id) next[id] = { left: el.offsetLeft, width: el.offsetWidth };
    }
    boxes.current = next;
    const shift = Math.max(0, track.offsetWidth - view.clientWidth);
    maxShift.set(shift);
    setShiftPx(shift);
    tick.set(tick.get() + 1);
  }, [maxShift, tick]);

  useLayoutEffect(() => {
    measure();
    const view = viewRef.current;
    const track = trackRef.current;
    if (!view || !track) return;
    const ro = new ResizeObserver(measure);
    ro.observe(view);
    ro.observe(track);
    return () => ro.disconnect();
  }, [measure, visible.length]);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  /** 갤러리 처음(첫 카드 가운데)으로. 필터나 배경지를 바꾸면 첫 카드가 보여야 한다. */
  const toGalleryStart = () => {
    const wrap = wrapRef.current;
    if (reduce || !wrap) return;
    const top = wrap.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > top + 1) window.scrollTo({ top, behavior: "smooth" });
  };
  const pickConcept = (c: Concept | "전체") => {
    setConcept(c);
    toGalleryStart();
  };
  const pickBackdrop = (id: BackdropId) => {
    setBackdrop(id);
    toGalleryStart();
  };

  /* 2. 패키지 */
  const [pkg, setPkg] = useState<PkgId>("standard");
  const [extraRetouch, setExtraRetouch] = useState(0);
  const [frame, setFrame] = useState(false);
  const [makeup, setMakeup] = useState(false);
  const pkgInfo = PKGS.find((p) => p.id === pkg)!;
  const total = pkgInfo.price + extraRetouch * OPT.retouch + (frame ? OPT.frame : 0) + (makeup ? OPT.makeup : 0);

  /* 4. 예약 */
  const days = Array.from({ length: BOOK_DAYS }, (_, i) => daysAgo(today, -i));
  const firstOpen = days.findIndex((d, i) => i > 0 && d.getDay() !== CLOSED_DOW);
  const [dayIdx, setDayIdx] = useState<number | null>(null);
  const day = days[dayIdx ?? firstOpen];
  const [slot, setSlot] = useState<number | null>(null);
  const [people, setPeople] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const pickDay = (i: number) => {
    setDayIdx(i);
    setSlot(null);
    setErr(null);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (slot === null) return setErr("시간대를 골라 주세요.");
    if (name.trim().length < 2) return setErr("이름을 두 글자 이상 적어 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setErr("휴대폰 번호를 확인해 주세요.");
    setErr(null);
    const seq = ((day.getDate() * 7 + slot * 3) % 90) + 10;
    setBooking({ no: seq, day, slot: SLOTS[slot], people, name, phone, pkg });
  };
  const resetBooking = () => {
    setBooking(null);
    setSlot(null);
    setName("");
    setPhone("");
  };

  /* 5. 촬영 안내 */
  const [guide, setGuide] = useState<"prep" | "dress" | "parking">("prep");

  const chip = (on: boolean) =>
    `rounded-[6px] border px-3.5 py-1.5 text-[14px] font-semibold transition-colors duration-200 ${focusRing} ${on ? "" : "hover:border-[#555555]"}`;
  const chipStyle = (on: boolean) => (on ? { background: C.text, color: C.bg, borderColor: C.text } : { background: "transparent", color: C.text, borderColor: C.line });
  const input = `w-full rounded-[4px] border bg-transparent px-3 py-2.5 text-[16px] ${focusRing}`;
  const inputStyle = { borderColor: C.line, color: C.text } as const;
  const accentBtn = `inline-flex items-center justify-center gap-1.5 rounded-[4px] px-5 py-3 text-[16px] font-semibold transition-transform duration-100 active:translate-y-[1px] ${focusRing}`;

  const todayDow = today.getDay();
  const replyDay = todayDow === CLOSED_DOW ? daysAgo(today, -1) : today;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.text }}>
      <Poster reduce={reduce} onCta={() => go("ps-book")} />

      <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-4 md:px-6">
        <SampleLogo light />
        <nav aria-label="메뉴" className="hidden items-center gap-6 text-[15px] md:flex" style={{ color: C.muted }}>
          {[
            ["ps-gallery", "갤러리"],
            ["ps-price", "상품 안내"],
            ["ps-book", "예약"],
            ["ps-guide", "촬영 안내"],
            ["ps-map", "오시는 길"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={`rounded-[2px] hover:text-[#f2f2f2] ${focusRing}`}>
              {label}
            </button>
          ))}
        </nav>
        <button type="button" onClick={() => go("ps-book")} data-gtm-cta="photo-studio_go_book" className={`${accentBtn} px-4 py-2 text-[15px]`} style={{ background: C.accent, color: C.accentInk }}>
          예약하기
        </button>
      </header>

      {/* 첫 화면: 세로 스크롤을 가로 갤러리로 바꾸는 sticky 구간. 동작 줄이기면 보통 가로 스크롤 */}
      <div ref={wrapRef} id="ps-gallery" className="relative scroll-mt-2" style={{ height: reduce ? "auto" : `calc(100svh + ${shiftPx * SLIDE_PX}px)` }}>
        <div className={`${reduce ? "" : "sticky top-0 h-[100svh]"} flex flex-col justify-between gap-3 py-3 [--ps-h:min(88vw,380px,46svh)]`}>
          <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
            <h2 className="text-[28px] font-bold leading-tight tracking-[-0.02em] md:text-[40px]">
              {BRAND}
            </h2>
            <div id="ps-filter" role="group" aria-label="촬영 컨셉" className="mt-3 flex flex-wrap gap-2">
              {(["전체", ...CONCEPTS] as const).map((c) => (
                <button key={c} type="button" aria-pressed={concept === c} onClick={() => pickConcept(c)} className={chip(concept === c)} style={chipStyle(concept === c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div ref={viewRef} className={`relative w-full ${reduce ? "snap-x snap-mandatory overflow-x-auto pb-3" : "overflow-hidden"}`}>
            <motion.div
              ref={trackRef}
              className="relative flex w-max items-center gap-4 md:gap-6"
              style={{
                x: reduce ? 0 : x,
                paddingLeft: `calc(50% - var(--ps-h) * ${visible[0]?.ratio ?? 1} / 2)`,
                paddingRight: `calc(50% - var(--ps-h) * ${visible[visible.length - 1]?.ratio ?? 1} / 2)`,
              }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {visible.map((card) => (
                  <GalleryCard key={card.id} card={card} bg={card.id === firstId ? backdropHex(backdrop) : card.bg} first={card.id === firstId} x={x} tick={tick} boxes={boxes} viewW={viewW} reduce={reduce} />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div id="ps-backdrop">
                <p className="text-[13px] font-bold" style={{ color: C.muted }}>
                  배경지
                </p>
                <div role="group" aria-label="배경지 색" className="mt-1 flex flex-wrap gap-1">
                  {BACKDROPS.map((b) => (
                    <Roll key={b.id} b={b} on={backdrop === b.id} onPick={() => pickBackdrop(b.id)} />
                  ))}
                </div>
                <p className="mt-2 max-w-[640px] text-[14px] leading-[1.6]" style={{ color: C.text }} aria-live="polite">
                  <Shirt size={15} aria-hidden className="mr-1.5 inline-block align-[-2px]" style={{ color: C.accent }} />
                  {BACKDROPS.find((b) => b.id === backdrop)!.tip}
                </p>
              </div>
              {!reduce && (
                <div className="flex items-center gap-3 text-[14px] tabular-nums" style={{ color: C.muted }}>
                  <ChevronDown size={16} aria-hidden />
                  <motion.span aria-hidden>{counter}</motion.span>
                  <span className="relative block h-[2px] w-24 overflow-hidden rounded-full" style={{ background: C.line }} aria-hidden>
                    <motion.span className="absolute inset-0 origin-left rounded-full" style={{ scaleX: scrollYProgress, background: C.accent }} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 상품 안내와 가격 */}
      <section id="ps-price" aria-labelledby="ps-price-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <Title id="ps-price-title">상품 안내</Title>

        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {ID_PRICES.map(([n, d, p]) => (
            <li key={n} className="flex items-baseline justify-between gap-4 rounded-[6px] border px-4 py-3" style={{ borderColor: C.line, background: C.panel }}>
              <span>
                <span className="text-[17px] font-bold">{n}</span>
                <span className="ml-2 text-[14px]" style={{ color: C.muted }}>
                  {d}
                </span>
              </span>
              <span className="whitespace-nowrap text-[17px] font-bold tabular-nums">{won(p)}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-10 text-[20px] font-bold">
          프로필, 가족, 우정 패키지
        </h3>
        <div className="mt-3 overflow-x-auto rounded-[6px] border" style={{ borderColor: C.line }}>
          <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
            <thead>
              <tr>
                <th scope="col" className="w-[26%] border-b px-3 py-3 text-[13px] font-bold" style={{ borderColor: C.line, color: C.muted }}>
                  패키지
                </th>
                {PKGS.map((p) => {
                  const on = p.id === pkg;
                  return (
                    <th key={p.id} scope="col" className="border-b p-1.5 align-top" style={{ borderColor: C.line, background: on ? C.panel2 : "transparent" }}>
                      <button
                        type="button"
                        onClick={() => setPkg(p.id)}
                        aria-pressed={on}
                        className={`flex w-full flex-col items-start gap-0.5 rounded-[4px] border px-3 py-2 text-left transition-colors duration-200 ${focusRing}`}
                        style={{ borderColor: on ? C.accent : C.line, color: C.text }}
                      >
                        <span className="inline-flex items-center gap-1.5 text-[16px] font-semibold">
                          {on && <Check size={15} strokeWidth={3} aria-hidden style={{ color: C.accent }} />}
                          {p.name}
                        </span>
                        <span className="text-[15px] tabular-nums" style={{ color: on ? C.accent : C.muted }}>
                          {won(p.price)}
                        </span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, key], ri) => (
                <tr key={key}>
                  <th scope="row" className="px-3 py-2.5 text-[14px] font-bold" style={{ color: C.muted, borderBottom: ri < ROWS.length - 1 ? `1px solid ${C.line}` : undefined }}>
                    {label}
                  </th>
                  {PKGS.map((p) => (
                    <td key={p.id} className="px-4 py-2.5 tabular-nums" style={{ background: p.id === pkg ? C.panel2 : "transparent", fontWeight: p.id === pkg ? 700 : 400, borderBottom: ri < ROWS.length - 1 ? `1px solid ${C.line}` : undefined }}>
                      {p[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[6px] border p-4 md:p-5" style={{ borderColor: C.line, background: C.panel }}>
            <p className="text-[16px] font-bold">추가 옵션</p>
            <ul className="mt-3 grid gap-3 text-[15px]">
              <li className="flex items-center justify-between gap-4">
                <span>
                  추가 보정 <span style={{ color: C.muted }}>1장 {won(OPT.retouch)}</span>
                </span>
                <Stepper value={extraRetouch} min={0} max={10} onChange={setExtraRetouch} label="추가 보정 장수" />
              </li>
              {(
                [
                  ["frame", "액자 8x10", OPT.frame, frame, setFrame],
                  ["makeup", "헤어메이크업", OPT.makeup, makeup, setMakeup],
                ] as const
              ).map(([id, label, price, on, set]) => (
                <li key={id}>
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2.5">
                      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="h-5 w-5 accent-[#b8956a]" />
                      {label}
                    </span>
                    <span className="tabular-nums" style={{ color: C.muted }}>
                      {won(price)}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between rounded-[6px] border p-4 md:p-5" style={{ borderColor: C.accent, background: C.panel }}>
            <div>
              <p className="text-[14px] font-bold" style={{ color: C.muted }}>
                {pkgInfo.name} 패키지
                {extraRetouch > 0 && ` + 보정 ${extraRetouch}장`}
                {frame && " + 액자"}
                {makeup && " + 헤어메이크업"}
              </p>
              <p className="mt-1 text-[32px] font-bold tabular-nums" aria-live="polite" aria-atomic="true">
                {won(total)}
              </p>
              <p className="text-[13px]" style={{ color: C.muted }}>
                부가세 포함
              </p>
            </div>
            <button type="button" onClick={() => go("ps-book")} data-gtm-cta="photo-studio_pkg_book" className={`${accentBtn} mt-4 w-full`} style={{ background: C.accent, color: C.accentInk }}>
              이 패키지로 예약
            </button>
          </div>
        </div>
      </section>

      {/* 4. 촬영 예약 */}
      <section id="ps-book" aria-labelledby="ps-book-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <Title id="ps-book-title">촬영 예약</Title>
        <AnimatePresence mode="wait" initial={false}>
          {booking ? (
            <motion.div
              key="done"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }}
              transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
              className="mt-6 rounded-[6px] border p-5 md:p-7"
              style={{ borderColor: C.accent, background: C.panel }}
              role="status"
            >
              <p className="inline-flex items-center gap-2 text-[22px] font-bold">
                <Check size={22} strokeWidth={3} aria-hidden style={{ color: C.accent }} />
                예약 접수
              </p>
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[16px]">
                <dt style={{ color: C.muted }}>예약번호</dt>
                <dd className="font-bold tabular-nums">
                  PS-{String(booking.day.getFullYear()).slice(2)}
                  {p2(booking.day.getMonth() + 1)}
                  {p2(booking.day.getDate())}-{booking.no}
                </dd>
                <dt style={{ color: C.muted }}>촬영 일시</dt>
                <dd className="font-bold">
                  {fmtKo(booking.day)} {booking.slot}
                </dd>
                <dt style={{ color: C.muted }}>패키지</dt>
                <dd>
                  {PKGS.find((p) => p.id === booking.pkg)!.name}, {booking.people}명
                </dd>
                <dt style={{ color: C.muted }}>예약자</dt>
                <dd>
                  {maskName(booking.name)} <span className="tabular-nums">{maskPhone(booking.phone)}</span>
                </dd>
                <dt style={{ color: C.muted }}>사진 수령 예정일</dt>
                <dd className="font-bold">{fmtKo(daysAgo(booking.day, -PICKUP_DAYS))}</dd>
                <dt style={{ color: C.muted }}>담당 창구</dt>
                <dd>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle size={16} aria-hidden style={{ color: C.accent }} />
                    {KAKAO}
                  </span>
                </dd>
                <dt style={{ color: C.muted }}>예약 확인 연락</dt>
                <dd>{fmtKo(replyDay)} 영업시간 내 카카오톡</dd>
              </dl>
              <button type="button" onClick={resetBooking} className={`mt-6 rounded-[4px] border px-4 py-2 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.line }}>
                다른 날짜로 예약
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              noValidate
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }}
              transition={{ duration: reduce ? 0 : 0.3 }}
              className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]"
            >
              <div>
                <p className="text-[15px] font-bold" style={{ color: C.muted }}>
                  날짜
                </p>
                <div className="-mx-4 mt-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
                  <div role="radiogroup" aria-label="촬영 날짜" className="flex w-max gap-2">
                    {days.map((d, i) => {
                      const closed = d.getDay() === CLOSED_DOW;
                      const isToday = i === 0;
                      const on = (dayIdx ?? firstOpen) === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          disabled={closed}
                          onClick={() => pickDay(i)}
                          className={`flex w-[62px] flex-col items-center rounded-[6px] border py-2 text-[14px] leading-tight disabled:opacity-40 ${focusRing}`}
                          style={{ borderColor: on ? C.accent : C.line, background: on ? C.panel2 : "transparent", color: d.getDay() === 0 ? "#e39a92" : C.text }}
                        >
                          <span className="text-[12px]" style={{ color: d.getDay() === 0 ? "#e39a92" : C.muted }}>
                            {isToday ? "오늘" : DOW[d.getDay()]}
                          </span>
                          <span className="mt-0.5 text-[18px] font-bold tabular-nums">{d.getDate()}</span>
                          <span className="text-[11px]" style={{ color: C.muted }}>
                            {closed ? "휴무" : `${d.getMonth() + 1}월`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="mt-6 text-[15px] font-bold" style={{ color: C.muted }}>
                  시간대
                </p>
                {(dayIdx ?? firstOpen) === 0 ? (
                  <p className="mt-2 rounded-[6px] border px-4 py-3 text-[15px]" style={{ borderColor: C.line }}>
                    당일 예약은 {KAKAO}로 문의해 주세요.
                  </p>
                ) : (
                  <div role="radiogroup" aria-label="시간대" className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {SLOTS.map((t, i) => {
                      const full = isTaken(day, i);
                      const on = slot === i;
                      return (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          disabled={full}
                          onClick={() => {
                            setSlot(i);
                            setErr(null);
                          }}
                          className={`rounded-[4px] border px-2 py-2 text-[15px] tabular-nums disabled:line-through disabled:opacity-40 ${focusRing}`}
                          style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : "transparent", color: on ? C.accentInk : C.text, fontWeight: on ? 600 : 400 }}
                        >
                          {t}
                          {full && <span className="sr-only"> 마감</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
                <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
                  줄 친 시간은 마감. 주말은 조기 마감될 수 있습니다.
                </p>
              </div>

              <div className="grid content-start gap-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[15px] font-bold" style={{ color: C.muted }}>
                    인원
                  </span>
                  <Stepper value={people} min={1} max={8} onChange={setPeople} label="인원" />
                </div>
                <label className="grid gap-1 text-[15px] font-bold" style={{ color: C.muted }}>
                  패키지
                  <select value={pkg} onChange={(e) => setPkg(e.target.value as PkgId)} className={`${input} font-normal`} style={{ ...inputStyle, background: C.bg }}>
                    {PKGS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {won(p.price)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-[15px] font-bold" style={{ color: C.muted }}>
                  이름
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`${input} font-normal`} style={inputStyle} />
                </label>
                <label className="grid gap-1 text-[15px] font-bold" style={{ color: C.muted }}>
                  휴대폰
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" className={`${input} font-normal`} style={inputStyle} />
                </label>
                {err && (
                  <p className="inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: C.error }} role="alert">
                    <AlertCircle size={16} aria-hidden /> {err}
                  </p>
                )}
                <p className="text-[14px]" style={{ color: C.muted }}>
                  {dayIdx === 0 ? "" : `${fmtKo(day)}${slot !== null ? ` ${SLOTS[slot]}` : ""}, ${pkgInfo.name} ${won(pkgInfo.price)}`}
                </p>
                <button type="submit" data-gtm-cta="photo-studio_book" className={`${accentBtn} w-full`} style={{ background: C.accent, color: C.accentInk }} disabled={(dayIdx ?? firstOpen) === 0}>
                  예약 접수
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </section>

      {/* 5. 촬영 안내와 오시는 길 */}
      <section id="ps-guide" aria-labelledby="ps-guide-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <Title id="ps-guide-title">촬영 안내</Title>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[6px] border" style={{ borderColor: C.line, background: C.panel }}>
            <div role="tablist" aria-label="촬영 안내" className="flex border-b" style={{ borderColor: C.line }}>
              {(
                [
                  ["prep", "준비물", Camera],
                  ["dress", "복장", Shirt],
                  ["parking", "주차", Car],
                ] as const
              ).map(([id, label, Icon]) => {
                const on = guide === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls={`ps-guide-${id}`}
                    id={`ps-tab-${id}`}
                    onClick={() => setGuide(id)}
                    className={`relative inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-3 text-[15px] font-semibold ${focusRing}`}
                    style={{ color: on ? C.text : C.muted }}
                  >
                    <Icon size={16} aria-hidden />
                    {label}
                    {on && <motion.span layoutId={reduce ? undefined : "ps-tab-line"} className="absolute inset-x-3 bottom-0 h-[3px] rounded-full" style={{ background: C.accent }} transition={{ duration: DUR_UI, ease: EASE }} />}
                  </button>
                );
              })}
            </div>
            <div className="p-4 md:p-5">
              <AnimatePresence mode="wait" initial={false}>
                <motion.ul
                  key={guide}
                  id={`ps-guide-${guide}`}
                  role="tabpanel"
                  aria-labelledby={`ps-tab-${guide}`}
                  initial={reduce ? false : { opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.1 } }}
                  transition={{ duration: reduce ? 0 : DUR_UI, ease: EASE }}
                  className="grid gap-2.5 text-[16px] leading-[1.6]"
                >
                  {GUIDE[guide].map((line) => (
                    <li key={line} className="flex gap-2.5">
                      <Check size={18} aria-hidden className="mt-1 shrink-0" style={{ color: C.accent }} />
                      <span>{line}</span>
                    </li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>
          </div>

          <div className="rounded-[6px] border p-4 md:p-5" style={{ borderColor: C.line, background: C.panel }}>
            <p className="inline-flex items-center gap-1.5 text-[16px] font-bold">
              <Clock size={16} aria-hidden style={{ color: C.accent }} /> 영업시간
            </p>
            <ul className="mt-3 grid gap-1.5 text-[15px]">
              {HOURS.map(([dows, time]) => {
                const mine = dows.includes(todayDow);
                return (
                  <li key={time + dows.join()} className="flex items-center justify-between gap-3 rounded-[4px] px-2 py-1" style={{ background: mine ? C.panel2 : "transparent", fontWeight: mine ? 700 : 400, color: mine ? C.text : C.muted }}>
                    <span>
                      {dows.map((d) => DOW[d]).join(", ")}
                      {mine && (
                        <span className="ml-2 rounded-[2px] px-1.5 py-0.5 text-[12px]" style={{ background: C.accent, color: C.accentInk }}>
                          오늘
                        </span>
                      )}
                    </span>
                    <span className="tabular-nums">{time}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
              점심 13:00~14:00. 공휴일은 공지로 안내.
            </p>
          </div>
        </div>
      </section>

      <section id="ps-map" aria-labelledby="ps-map-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <Title id="ps-map-title">오시는 길</Title>
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1fr]">
          <StudioMap />
          <dl className="grid content-start gap-x-6 gap-y-3 text-[16px] leading-[1.6] sm:grid-cols-[auto_1fr]">
            <dt className="inline-flex items-center gap-1.5 font-bold" style={{ color: C.muted }}>
              <MapPin size={16} aria-hidden style={{ color: C.accent }} /> 주소
            </dt>
            <dd>
              {ADDRESS}
              <br />
              ㅇㅇ역 2번 출구 도보 5분, 1층 약국 건물
            </dd>
            <dt className="inline-flex items-center gap-1.5 font-bold" style={{ color: C.muted }}>
              <Car size={16} aria-hidden style={{ color: C.accent }} /> 주차
            </dt>
            <dd>건물 지하 1층 주차 가능. 촬영 손님 1시간 무료, 출차 전 데스크에서 등록.</dd>
            <dt className="inline-flex items-center gap-1.5 font-bold" style={{ color: C.muted }}>
              <MessageCircle size={16} aria-hidden style={{ color: C.accent }} /> 문의
            </dt>
            <dd>{KAKAO}. 영업시간 내 답변.</dd>
          </dl>
        </div>
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pb-28 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted }}>
        <p>
          <SampleLogo light />
        </p>
        <p>{ADDRESS}</p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

const GUIDE = {
  prep: [
    "증명사진은 흰 셔츠나 깃 있는 상의. 여권 규격은 안경 반사와 머리카락이 눈썹을 가리면 재촬영이라 안경은 빼 주세요.",
    "프로필 촬영은 옷 2벌까지. 갈아입는 시간은 소요시간에 들어 있어요.",
    "가족사진은 아이 간식과 좋아하는 장난감. 반려동물은 리드줄, 간식, 배변 패드.",
    "보정 요청은 촬영 당일 모니터로 함께 고르고, 추가 보정은 수령 뒤 1주 안에 접수.",
  ],
  dress: [
    "무늬 없는 단색 상의가 얼굴에 시선을 모아요. 잔 줄무늬와 체크는 화면에 물결이 생겨요.",
    "배경지와 같은 계열 옷은 묻혀요. 위 배경지 안내를 보고 반대 톤으로 골라 주세요.",
    "가족, 우정사진은 톤을 맞춰요. 전부 같은 옷보다 흰색과 베이지, 네이비처럼 두세 색 안에서.",
    "안경은 반사 방지 코팅이면 그대로. 광택 있는 소재는 조명에 번져요.",
  ],
  parking: [
    "건물 지하 1층 주차장. 촬영 손님 1시간 무료, 패키지 촬영은 2시간.",
    "출차 전 데스크에서 차량 번호를 등록해야 할인이 적용돼요.",
    "주차장 입구는 건물 뒤편 ㅇㅇ로 00길. 토요일 오후는 만차가 잦아 근처 공영주차장 이용.",
    "엘리베이터로 2층. 유아차와 반려동물 이동장은 그대로 들어오시면 돼요.",
  ],
} as const;

/* [요일 번호들, 시간]. 월요일 정기 휴무 */
const HOURS: [number[], string][] = [
  [[2, 3, 4, 5], "10:30~19:30"],
  [[6, 0], "10:00~18:00"],
  [[1], "정기 휴무"],
];

/* 오시는 길 약도. 실제 사이트에서는 네이버 지도를 넣는다. */
function StudioMap() {
  return (
    <svg viewBox="0 0 400 260" role="img" aria-label="약도. ㅇㅇ역 2번 출구에서 큰길 따라 스튜디오까지" className="w-full rounded-[6px] border" style={{ borderColor: C.line, background: C.panel }}>
      <defs>
        <pattern id="ps-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#1f1f1f" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="400" height="260" fill="url(#ps-grid)" />
      <rect x="0" y="118" width="400" height="34" fill="#2e2e2e" />
      <line x1="0" y1="135" x2="400" y2="135" stroke="#444444" strokeWidth="2" strokeDasharray="12 10" />
      <rect x="236" y="0" width="26" height="260" fill="#2e2e2e" />
      <rect x="40" y="40" width="130" height="54" rx="3" fill="#222222" stroke="#363636" />
      <rect x="40" y="176" width="130" height="54" rx="3" fill="#222222" stroke="#363636" />
      <rect x="290" y="176" width="90" height="54" rx="3" fill="#222222" stroke="#363636" />
      <rect x="290" y="40" width="90" height="54" rx="3" fill="#222222" stroke="#363636" />
      <text x="105" y="208" textAnchor="middle" fill="#8f8f8f" fontSize="12">
        편의점
      </text>
      <text x="335" y="208" textAnchor="middle" fill="#8f8f8f" fontSize="12">
        카페
      </text>
      <text x="335" y="71" textAnchor="middle" fill="#8f8f8f" fontSize="12">
        은행
      </text>
      <rect x="60" y="150" width="34" height="12" rx="2" fill={C.accent} />
      <text x="77" y="160" textAnchor="middle" fill={C.accentInk} fontSize="9" fontWeight="700">
        2번
      </text>
      <text x="106" y="112" textAnchor="middle" fill={C.text} fontSize="13" fontWeight="700">
        ㅇㅇ역
      </text>
      <path d="M77 150 V 105 H 236" fill="none" stroke={C.accent} strokeWidth="3" strokeDasharray="6 6" />
      <g transform="translate(205 45)">
        <rect x="-50" y="0" width="60" height="50" rx="3" fill="#222222" stroke={C.accent} strokeWidth="1.5" />
        <text x="-20" y="22" textAnchor="middle" fill={C.text} fontSize="12" fontWeight="700">
          스튜디오
        </text>
        <text x="-20" y="38" textAnchor="middle" fill={C.muted} fontSize="11">
          2층
        </text>
        <circle cx="-20" cy="-6" r="9" fill={C.accent} />
        <circle cx="-20" cy="-6" r="3.5" fill={C.accentInk} />
      </g>
      <text x="200" y="250" textAnchor="middle" fill="#8f8f8f" fontSize="12">
        ㅇㅇ로
      </text>
      <text x="249" y="22" textAnchor="middle" fill="#8f8f8f" fontSize="11" transform="rotate(90 249 22)">
        ㅇㅇ로 00길
      </text>
    </svg>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className={small ? "h-6 w-6 shrink-0" : "h-7 w-7 shrink-0"} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold leading-none tracking-[-0.03em]`}>곰파트너</span>
        <span className="text-[12px] font-semibold leading-none opacity-75">사진관 샘플</span>
      </span>
    </span>
  );
}
