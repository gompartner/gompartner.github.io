"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { AlertCircle, CalendarCheck, Camera, Car, Check, Clock, MapPin, Menu, MessageCircle, Minus, Plus, Shirt, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 사진관 홈페이지 샘플: 가상의 곰파트너 사진관. 증명사진, 프로필, 가족사진, 우정사진, 반려동물 촬영.
   상호, 주소, 손님 이름은 모두 가상이다.
   첫 화면 사진 출처: Pexels 사진 30332804. 갤러리와 배경지 사진은 AI 생성(Z-Image-Turbo)

   국내 사진관 사이트 구성(벤치마킹 메모)
   - 메뉴는 갤러리, 상품 안내(가격표), 예약, 촬영 안내, 오시는 길. 첫 화면은 큰 사진 갤러리.
   - 가격표는 패키지 표(컷수, 보정 장수, 원본 제공, 출력 크기, 소요시간)와 추가 옵션(추가 보정, 액자, 헤어메이크업).
   - 예약은 네이버 예약이나 카카오톡 채널. 30분 단위 시간표에 마감 표시. 당일 예약은 전화 문의.
   - 촬영 안내에 준비물(여권 규격, 안경), 복장(단색 상의, 배경지 색과 겹치지 않게), 주차. 영업시간에 정기 휴무.

   핵심 모션
   - 첫 화면(ps-poster): 상단 메뉴 아래 촬영 종류 세 장(증명, 프로필, 가족)을 세로로 나란히 둔다. 고른 패널이 넓어지며
     시작가와 버튼이 나온다(실제 사진관 사이트의 촬영 상품별 배너를 한 화면에 모은 형태).
   - 갤러리: 세로 스크롤에 맞춰 가로로 흐른다(sticky 구간 + useScroll). 가운데 온 카드만 살짝 커지고 캡션이 뜬다.
   동작 줄이기면 첫 화면은 멈춘 사진, 갤러리는 보통 가로 스크롤(scroll-snap)로 바뀐다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 컨셉 필터: 증명, 프로필, 가족, 우정, 반려동물. 고르면 갤러리에 그 컨셉만 남는다.
   2. 패키지 비교: 기본, 스탠다드, 프리미엄 표와 추가 옵션 합산.
   3. 배경지 색: 6색. 고르면 그 색으로 찍은 같은 사람 사진과 어울리는 옷 색 한 줄.
   4. 촬영 예약: 날짜(오늘부터 14일), 시간대(30분 단위, 마감 표시), 인원, 이름, 휴대폰. 완료 화면에 예약번호, 수령 예정일, 담당 창구.
   5. 촬영 안내와 오시는 길: 준비물, 복장, 주차 탭. 영업시간에 오늘 요일 진하게. */

const IMG = "/images/demo-photo-studio";

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
const isDark = (hex: string) => {
  const [r, g, b] = rgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.42;
};
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

/* 첫 화면: 상단 메뉴 + 촬영 종류 세로 3분할 패널(증명, 프로필, 가족).
   PC는 마우스를 올리거나 누른 패널이 50%로 넓어지고 나머지 둘은 25%로 줄며(flex-grow 0.45초), 넓어진 패널에만 버튼이 나온다.
   휴대폰은 세 단을 위아래로 쌓고 누른 단만 길어진다. 사진은 들어올 때 1.04배에서 1.6초 동안 천천히 다가온다.
   동작 줄이기면 넓어지는 전환과 다가오기 없이 바로 바뀐다. */
const SHOOTS = [
  { concept: "증명" as Concept, img: "id-passport", name: "증명사진", price: ID_PRICES[0][2], time: "20분", note: "보정 1장, 출력 8매, 파일" },
  { concept: "프로필" as Concept, img: "pf-biz", name: "프로필", price: PKGS[0].price, time: `${PKGS[0].time}부터`, note: `${PKGS[0].shots}부터, 원본 제공 패키지` },
  { concept: "가족" as Concept, img: "fm-four", name: "가족사진", price: PKGS[0].price, time: `${PKGS[0].time}부터`, note: "인원 추가, 액자 출력 옵션" },
];

const MENU: [string, string, Concept?][] = [
  ["ps-gallery", "증명", "증명"],
  ["ps-gallery", "프로필", "프로필"],
  ["ps-gallery", "가족", "가족"],
  ["ps-price", "가격"],
  ["ps-guide", "촬영 안내"],
  ["ps-map", "오시는 길"],
];

const GROW = "cubic-bezier(0.22, 1, 0.36, 1)";

function Poster({
  reduce,
  go,
  onConcept,
  openDay,
  openLeft,
  onOpenDay,
}: {
  reduce: boolean;
  go: (id: string) => void;
  onConcept: (c: Concept) => void;
  openDay: Date;
  openLeft: number;
  onOpenDay: () => void;
}) {
  const [active, setActive] = useState(0);
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const nav = (id: string, concept?: Concept) => {
    setMenu(false);
    if (concept) onConcept(concept);
    go(id);
  };

  return (
    <section ref={ref} id="ps-poster" aria-labelledby="ps-poster-title" className="relative" style={{ background: C.bg }}>
      {/* 상단 메뉴. 휴대폰과 태블릿은 햄버거 */}
      <header className="relative z-20 border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
          <SampleLogo light small />
          <nav aria-label="메뉴" className="hidden items-center gap-1 text-[15px] lg:flex" style={{ color: C.muted }}>
            {MENU.map(([id, label, concept]) => (
              <button key={label} type="button" onClick={() => nav(id, concept)} className={`min-h-11 rounded-[4px] px-3 hover:text-[#f2f2f2] ${focusRing}`}>
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go("ps-book")}
              data-gtm-cta="photo-studio_poster_cta"
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-[4px] px-4 text-[15px] font-semibold ${focusRing}`}
              style={{ background: C.accent, color: C.accentInk }}
            >
              <CalendarCheck size={17} aria-hidden />
              예약
            </button>
            <button
              type="button"
              aria-expanded={menu}
              aria-controls="ps-menu"
              aria-label={menu ? "메뉴 닫기" : "메뉴 열기"}
              onClick={() => setMenu((v) => !v)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-[4px] border lg:hidden ${focusRing}`}
              style={{ borderColor: C.line, color: C.text }}
            >
              {menu ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>
        {menu && (
          <nav id="ps-menu" aria-label="메뉴 펼침" className="absolute inset-x-0 top-full border-b px-4 pb-4 pt-2 lg:hidden" style={{ background: C.panel, borderColor: C.line }}>
            <ul className="grid grid-cols-2 gap-1">
              {MENU.map(([id, label, concept]) => (
                <li key={label}>
                  <button type="button" onClick={() => nav(id, concept)} className={`flex min-h-11 w-full items-center rounded-[4px] px-3 text-left text-[16px] font-semibold ${focusRing}`} style={{ color: C.text }}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* 제목 줄 */}
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-end justify-between gap-x-6 gap-y-2 px-4 pb-4 pt-5 md:px-6 md:pb-5 md:pt-7">
        <h1 id="ps-poster-title" className="text-[30px] font-bold leading-[1.2] tracking-[-0.03em] [word-break:keep-all] md:text-[40px]" style={{ color: C.text }}>
          증명사진 20분 완성
        </h1>
        <p className="inline-flex items-center gap-1.5 text-[15px]" style={{ color: C.muted }}>
          <MapPin size={16} aria-hidden />
          ㅇㅇ역 2번 출구 도보 5분
        </p>
      </div>

      {/* 촬영 종류 3분할 */}
      <ul className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 md:h-[max(480px,calc(100svh-230px))] md:flex-row md:px-6">
        {SHOOTS.map((s, i) => {
          const on = active === i;
          return (
            <li
              key={s.name}
              className={`relative min-w-0 overflow-hidden rounded-[6px] ${on ? "h-[46svh] min-h-[300px]" : "h-[22svh] min-h-[150px]"} md:h-auto md:min-h-0`}
              style={{
                flexGrow: on ? 2 : 1,
                flexBasis: 0,
                transition: reduce ? "none" : `flex-grow 0.45s ${GROW}, height 0.45s ${GROW}`,
                background: C.panel,
              }}
              onMouseEnter={() => setActive(i)}
            >
              <button
                type="button"
                aria-expanded={on}
                aria-controls={`ps-shoot-${i}`}
                aria-label={`${s.name} 펼치기`}
                onClick={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={`absolute inset-0 block h-full w-full ${focusRing} focus-visible:outline-offset-[-3px]`}
              >
                <motion.span
                  aria-hidden
                  className="absolute inset-0 block"
                  initial={reduce ? false : { scale: 1.04 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: reduce ? 0 : 1.6, ease: EASE }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                  <img
                    src={`${IMG}/${s.img}.jpg`}
                    alt=""
                    fetchPriority={i === 0 ? "high" : undefined}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: "50% 30%", filter: on ? "none" : "brightness(0.78)", transition: reduce ? "none" : "filter 0.3s" }}
                  />
                </motion.span>
              </button>
              {/* 아래 이름판: 그라데이션 대신 단색 판 */}
              <div id={`ps-shoot-${i}`} className="pointer-events-none absolute inset-x-2 bottom-2 rounded-[4px] px-3 py-2.5 md:inset-x-3 md:bottom-3 md:px-4 md:py-3" style={{ background: "rgba(20,20,20,0.88)" }}>
                <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="text-[18px] font-bold md:text-[20px]" style={{ color: C.text }}>
                    {s.name}
                  </span>
                  <span className="text-[15px] font-semibold tabular-nums" style={{ color: C.accent }}>
                    {won(s.price)}부터
                  </span>
                </p>
                <p className={`mt-0.5 items-center gap-1 text-[14px] ${on ? "inline-flex" : "hidden md:inline-flex"}`} style={{ color: C.muted }}>
                  <Clock size={14} aria-hidden />
                  촬영 {s.time}
                </p>
                {on && (
                  <div className="pointer-events-auto mt-2.5">
                    <p className="text-[14px]" style={{ color: "#d6d6d6" }}>
                      {s.note}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => nav("ps-gallery", s.concept)}
                        className={`inline-flex min-h-11 items-center rounded-[4px] border px-3.5 text-[15px] font-semibold ${focusRing}`}
                        style={{ borderColor: "#555555", color: C.text }}
                      >
                        사진 보기
                      </button>
                      <button
                        type="button"
                        onClick={() => go("ps-book")}
                        data-gtm-cta={`photo-studio_shoot_${s.img}`}
                        className={`inline-flex min-h-11 items-center gap-1.5 rounded-[4px] px-3.5 text-[15px] font-semibold ${focusRing}`}
                        style={{ background: C.accent, color: C.accentInk }}
                      >
                        이 촬영 예약
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* 예약 가능한 가장 가까운 날. PC 왼쪽 아래는 사용법 버튼 자리라 오른쪽에 둔다 */}
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 pb-8 pt-4 md:justify-end md:px-6 md:pb-10">
        <p className="text-[15px]" style={{ color: C.muted }}>
          30분 단위 예약, 당일 촬영은 전화 문의
        </p>
        <button type="button" onClick={onOpenDay} className={`inline-flex min-h-11 items-center gap-2 rounded-[4px] border px-4 text-[15px] ${focusRing}`} style={{ borderColor: C.line, color: C.text }}>
          <span>{fmtKo(openDay)}</span>
          <span className="font-bold" style={{ color: C.accent }}>
            예약 가능 {openLeft}타임
          </span>
        </button>
      </div>

      {/* 휴대폰 하단 고정 바: 첫 화면이 보일 때만 */}
      {inView && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t px-4 pt-3 md:hidden" style={{ background: C.panel, borderColor: C.line, paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}>
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 text-[14px]" style={{ color: C.muted }}>
              {fmtKo(openDay)} <b style={{ color: C.text }}>예약 가능 {openLeft}타임</b>
            </p>
            <button type="button" onClick={() => go("ps-book")} className={`inline-flex min-h-11 flex-none items-center rounded-[4px] px-4 text-[15px] font-semibold ${focusRing}`} style={{ background: C.accent, color: C.accentInk }}>
              예약하기
            </button>
          </div>
        </div>
      )}
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


  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const pickConcept = (c: Concept | "전체") => setConcept(c);
  const pickBackdrop = (id: BackdropId) => setBackdrop(id);

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
      <Poster
        reduce={reduce}
        go={go}
        onConcept={pickConcept}
        openDay={days[firstOpen]}
        openLeft={SLOTS.filter((_, i) => !isTaken(days[firstOpen], i)).length}
        onOpenDay={() => {
          pickDay(firstOpen);
          go("ps-book");
        }}
      />

      {/* 1. 갤러리: 보통 세로 스크롤 격자. 컨셉을 고르면 그 컨셉 사진만 남고 나머지는 자리를 옮긴다 */}
      <section id="ps-gallery" aria-labelledby="ps-gallery-title" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pt-12 md:px-6 md:pt-16">
        <Title id="ps-gallery-title">갤러리</Title>
        <div id="ps-filter" role="group" aria-label="촬영 컨셉" className="mt-4 flex flex-wrap gap-2">
          {(["전체", ...CONCEPTS] as const).map((c) => (
            <button key={c} type="button" aria-pressed={concept === c} onClick={() => pickConcept(c)} className={chip(concept === c)} style={chipStyle(concept === c)}>
              {c}
            </button>
          ))}
        </div>
        <motion.ul layout={!reduce} className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((card) => (
              <motion.li
                key={card.id}
                layout={reduce ? false : "position"}
                initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.97, transition: { duration: DUR_UI } }}
                transition={{ duration: reduce ? 0 : DUR_CARD, ease: EASE }}
              >
                <figure>
                  <div className="aspect-[4/5] overflow-hidden rounded-[4px]" style={{ background: card.bg }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                    <img src={`${IMG}/${card.id}.jpg`} alt={`${card.name} 촬영 예시`} loading="lazy" width={640} height={800} className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
                  </div>
                  <figcaption className="mt-2">
                    <span className="text-[13px] font-semibold" style={{ color: C.accent }}>
                      {card.concept}
                    </span>
                    <span className="block text-[16px] font-bold leading-snug md:text-[17px]">{card.name}</span>
                    <span className="block text-[13px]" style={{ color: C.muted }}>
                      조명 {card.light}
                    </span>
                  </figcaption>
                </figure>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        {/* 배경지: 고른 색으로 찍은 같은 사람 사진과 어울리는 옷 색 안내 */}
        <div id="ps-backdrop" className="mt-12 grid gap-6 rounded-[6px] border p-4 md:grid-cols-[260px_minmax(0,1fr)] md:items-center md:gap-8 md:p-6" style={{ borderColor: C.line, background: C.panel2 }}>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[260px] overflow-hidden rounded-[4px]" style={{ background: backdropHex(backdrop) }}>
            <AnimatePresence initial={false}>
              <motion.img
                key={backdrop}
                src={`${IMG}/bd-${backdrop}.jpg`}
                alt={`${BACKDROPS.find((b) => b.id === backdrop)!.name} 배경지로 찍은 프로필 예시`}
                width={640}
                height={800}
                className="absolute inset-0 h-full w-full object-cover"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.3 }}
              />
            </AnimatePresence>
          </div>
          <div>
            <h3 className="text-[20px] font-bold md:text-[22px]">배경지 색</h3>
            <div role="group" aria-label="배경지 색" className="mt-3 flex flex-wrap gap-1">
              {BACKDROPS.map((b) => (
                <Roll key={b.id} b={b} on={backdrop === b.id} onPick={() => pickBackdrop(b.id)} />
              ))}
            </div>
            <p className="mt-3 max-w-[560px] text-[15px] leading-[1.7]" style={{ color: C.text }} aria-live="polite">
              <Shirt size={16} aria-hidden className="mr-1.5 inline-block align-[-3px]" style={{ color: C.accent }} />
              {BACKDROPS.find((b) => b.id === backdrop)!.tip}
            </p>
          </div>
        </div>
      </section>

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
              className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
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
