"use client";

import { useEffect, useMemo, useState } from "react";
import { Jua } from "next/font/google";
import {
  Baby,
  BookOpen,
  Clock,
  Dumbbell,
  MapPin,
  Palette,
  Phone,
  Presentation,
  Search,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* 샘플시 공유공간 지도 데모.
   외부 지도 없이 손그림 느낌의 일러스트 지도(SVG, 1000×750 좌표)에 핀을 올린다.
   동 이름표 위치는 핀 영역과 겹치지 않도록 좌표로 확인해 배치했다.
   분류 색은 dataviz 검증 스크립트 통과 순서(녹·자·황·청·적)이며,
   색만으로 구분하지 않도록 핀·목록·범례에 아이콘과 분류 이름을 함께 쓴다. */

const jua = Jua({ weight: "400", preload: false, display: "swap" });

type CategoryId = "meeting" | "workshop" | "library" | "sports" | "care";

const CATEGORIES: { id: CategoryId; label: string; color: string; tint: string; icon: LucideIcon }[] = [
  { id: "meeting", label: "회의실", color: "#228738", tint: "#e3f3e6", icon: Presentation },
  { id: "workshop", label: "공방", color: "#a24fbf", tint: "#f4e8f8", icon: Palette },
  { id: "library", label: "작은도서관", color: "#9e6a00", tint: "#fbefd6", icon: BookOpen },
  { id: "sports", label: "체육시설", color: "#256ef4", tint: "#e4edfe", icon: Dumbbell },
  { id: "care", label: "돌봄공간", color: "#d63d4a", tint: "#fce6e8", icon: Baby },
];

const categoryOf = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

// 색 토큰 — 초록 동네 지도 톤. 본문 잉크는 흰 바탕 대비 12:1 이상
const INK = "#23302a";
const INK_SOFT = "#4a5a51";
const LEAF = "#1f7a4d";
const PAGE = "#eaf4ec";
const LINE = "#cfe0d4";

interface Place {
  id: string;
  name: string;
  dong: string;
  address: string;
  category: CategoryId;
  /** 운영시간 [시작, 종료] (24시간제, 시 단위) */
  hours: [number, number];
  closedDay: string;
  capacity: number;
  fee: "무료" | "유료";
  feeDetail?: string;
  reserve: "전화" | "방문" | "온라인";
  phone: string;
  facilities: string[];
  /** 지도 좌표 (1000×750) — 핀 꼬리 끝 위치 */
  x: number;
  y: number;
}

const W = 1000;
const H = 750;

const DONGS = [
  { name: "해오름동", fill: "#f3f8df", d: "M22,24 Q170,6 330,16 Q352,130 360,250 Q280,286 190,300 Q100,286 32,262 Q14,140 22,24Z", lx: 200, ly: 180 },
  { name: "솔빛동", fill: "#fdf1dc", d: "M330,16 Q500,10 660,26 Q650,130 630,230 Q500,236 360,250 Q352,130 330,16Z", lx: 500, ly: 150 },
  { name: "누리동", fill: "#e6f2f6", d: "M660,26 Q820,20 980,32 Q984,170 970,300 Q840,316 700,320 Q660,280 630,230 Q650,130 660,26Z", lx: 790, ly: 220 },
  { name: "새터동", fill: "#f8eaf0", d: "M32,262 Q100,286 190,300 Q214,400 230,510 Q150,540 60,560 Q16,480 20,420 Q18,340 32,262Z", lx: 110, ly: 480 },
  { name: "가람동", fill: "#eef5e4", d: "M190,300 Q280,286 360,250 Q500,236 630,230 Q660,280 700,320 Q676,400 640,470 Q520,488 400,500 Q316,508 230,510 Q214,400 190,300Z", lx: 430, ly: 400 },
  { name: "한울동", fill: "#fbf0e2", d: "M700,320 Q840,316 970,300 Q990,420 985,540 Q850,556 720,560 Q690,510 640,470 Q676,400 700,320Z", lx: 840, ly: 400 },
  { name: "다솜동", fill: "#e8f1f8", d: "M60,560 Q150,540 230,510 Q316,508 400,500 Q420,620 430,735 Q250,742 70,735 Q52,650 60,560Z", lx: 250, ly: 590 },
  { name: "미르동", fill: "#f1ecf8", d: "M400,500 Q520,488 640,470 Q690,510 720,560 Q850,556 985,540 Q990,640 980,735 Q700,744 430,735 Q420,620 400,500Z", lx: 620, ly: 640 },
];

const PLACES: Place[] = [
  { id: "p1", name: "해오름 마을회의실", dong: "해오름동", address: "샘플시 해오름로 12", category: "meeting", hours: [9, 22], closedDay: "일요일", capacity: 20, fee: "무료", reserve: "온라인", phone: "000-100-0101", facilities: ["빔프로젝터", "화이트보드", "와이파이"], x: 260, y: 90 },
  { id: "p2", name: "솔빛 청년공유실", dong: "솔빛동", address: "샘플시 솔빛길 34", category: "meeting", hours: [10, 21], closedDay: "월요일", capacity: 12, fee: "무료", reserve: "온라인", phone: "000-100-0102", facilities: ["TV 화면", "와이파이", "음료 반입"], x: 420, y: 90 },
  { id: "p3", name: "가람 주민회의실", dong: "가람동", address: "샘플시 가람대로 101", category: "meeting", hours: [9, 18], closedDay: "주말", capacity: 30, fee: "유료", feeDetail: "시간당 1만 원", reserve: "전화", phone: "000-100-0103", facilities: ["빔프로젝터", "마이크", "주차"], x: 590, y: 360 },
  { id: "p4", name: "미르 소모임실", dong: "미르동", address: "샘플시 미르로 8", category: "meeting", hours: [9, 22], closedDay: "없음", capacity: 8, fee: "무료", reserve: "온라인", phone: "000-100-0104", facilities: ["화이트보드", "와이파이"], x: 500, y: 600 },
  { id: "p5", name: "누리 목공방", dong: "누리동", address: "샘플시 누리로 45", category: "workshop", hours: [10, 20], closedDay: "월요일", capacity: 10, fee: "유료", feeDetail: "재료비 별도", reserve: "전화", phone: "000-100-0201", facilities: ["공구 대여", "앞치마", "환기 시설"], x: 720, y: 100 },
  { id: "p6", name: "새터 도자기 공방", dong: "새터동", address: "샘플시 새터길 7", category: "workshop", hours: [11, 19], closedDay: "화요일", capacity: 8, fee: "유료", feeDetail: "1회 2만 원", reserve: "방문", phone: "000-100-0202", facilities: ["가마", "앞치마"], x: 80, y: 340 },
  { id: "p7", name: "한울 메이커스페이스", dong: "한울동", address: "샘플시 한울대로 220", category: "workshop", hours: [9, 21], closedDay: "일요일", capacity: 16, fee: "무료", reserve: "온라인", phone: "000-100-0203", facilities: ["3D 프린터", "레이저 커터", "교육 프로그램"], x: 750, y: 370 },
  { id: "p8", name: "다솜 뜨개 사랑방", dong: "다솜동", address: "샘플시 다솜로 19", category: "workshop", hours: [13, 18], closedDay: "주말", capacity: 12, fee: "무료", reserve: "방문", phone: "000-100-0204", facilities: ["재료 비치", "난방"], x: 120, y: 650 },
  { id: "p9", name: "해오름 작은도서관", dong: "해오름동", address: "샘플시 해오름로 58", category: "library", hours: [10, 19], closedDay: "월요일", capacity: 25, fee: "무료", reserve: "방문", phone: "000-100-0301", facilities: ["열람석", "어린이 책", "와이파이"], x: 90, y: 230 },
  { id: "p10", name: "솔빛 책마루", dong: "솔빛동", address: "샘플시 솔빛길 90", category: "library", hours: [9, 18], closedDay: "일요일", capacity: 18, fee: "무료", reserve: "방문", phone: "000-100-0302", facilities: ["열람석", "스터디룸"], x: 580, y: 200 },
  { id: "p11", name: "가람 마을서재", dong: "가람동", address: "샘플시 가람대로 15", category: "library", hours: [10, 20], closedDay: "화요일", capacity: 15, fee: "무료", reserve: "방문", phone: "000-100-0303", facilities: ["열람석", "노트북석"], x: 300, y: 380 },
  { id: "p12", name: "미르 그림책방", dong: "미르동", address: "샘플시 미르로 77", category: "library", hours: [10, 18], closedDay: "월요일", capacity: 14, fee: "무료", reserve: "방문", phone: "000-100-0304", facilities: ["어린이 책", "수유실"], x: 720, y: 700 },
  { id: "p13", name: "누리 생활체육관", dong: "누리동", address: "샘플시 누리로 150", category: "sports", hours: [6, 22], closedDay: "없음", capacity: 60, fee: "유료", feeDetail: "1회 3천 원", reserve: "온라인", phone: "000-100-0401", facilities: ["샤워실", "주차", "탈의실"], x: 690, y: 270 },
  { id: "p14", name: "새터 탁구장", dong: "새터동", address: "샘플시 새터길 42", category: "sports", hours: [9, 21], closedDay: "일요일", capacity: 16, fee: "무료", reserve: "방문", phone: "000-100-0402", facilities: ["탁구대 4대", "탈의실"], x: 210, y: 470 },
  { id: "p15", name: "한울 풋살장", dong: "한울동", address: "샘플시 한울대로 310", category: "sports", hours: [7, 22], closedDay: "없음", capacity: 20, fee: "유료", feeDetail: "2시간 4만 원", reserve: "온라인", phone: "000-100-0403", facilities: ["야간 조명", "주차"], x: 930, y: 480 },
  { id: "p16", name: "가람 요가실", dong: "가람동", address: "샘플시 가람대로 180", category: "sports", hours: [7, 21], closedDay: "주말", capacity: 15, fee: "무료", reserve: "온라인", phone: "000-100-0404", facilities: ["요가 매트", "탈의실"], x: 520, y: 470 },
  { id: "p17", name: "해오름 다함께돌봄센터", dong: "해오름동", address: "샘플시 해오름로 30", category: "care", hours: [8, 20], closedDay: "주말", capacity: 20, fee: "무료", reserve: "전화", phone: "000-100-0501", facilities: ["간식 제공", "학습 지도"], x: 300, y: 210 },
  { id: "p18", name: "누리 공동육아방", dong: "누리동", address: "샘플시 누리로 12", category: "care", hours: [10, 17], closedDay: "주말", capacity: 12, fee: "무료", reserve: "온라인", phone: "000-100-0502", facilities: ["수유실", "장난감 대여"], x: 920, y: 250 },
  { id: "p19", name: "다솜 아이키움터", dong: "다솜동", address: "샘플시 다솜로 60", category: "care", hours: [9, 19], closedDay: "일요일", capacity: 18, fee: "무료", reserve: "전화", phone: "000-100-0503", facilities: ["놀이 공간", "간식 제공"], x: 340, y: 560 },
  { id: "p20", name: "미르 어르신 쉼터", dong: "미르동", address: "샘플시 미르로 120", category: "care", hours: [9, 18], closedDay: "주말", capacity: 25, fee: "무료", reserve: "방문", phone: "000-100-0504", facilities: ["안마 의자", "건강 체조"], x: 930, y: 650 },
];

const fmtHours = ([s, e]: [number, number]) => `${String(s).padStart(2, "0")}:00~${String(e).padStart(2, "0")}:00`;

function isOpenAt(place: Place, date: Date) {
  const day = date.getDay(); // 0 일 ~ 6 토
  const closed =
    (place.closedDay === "주말" && (day === 0 || day === 6)) ||
    (place.closedDay === "일요일" && day === 0) ||
    (place.closedDay === "월요일" && day === 1) ||
    (place.closedDay === "화요일" && day === 2);
  const h = date.getHours();
  return !closed && h >= place.hours[0] && h < place.hours[1];
}

/** 손그림 지도 — 동 경계, 하천, 공원, 산, 작은 건물 그림 */
function IllustratedMap() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden>
      <defs>
        {/* 경계선을 살짝 흔들어 손으로 그린 느낌을 낸다 */}
        <filter id="nb-hand" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="7" />
        </filter>
        <pattern id="nb-grass" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M5,14 q2,-5 4,0 M14,8 q2,-5 4,0" stroke="#9fcf8a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </pattern>
      </defs>

      <rect width={W} height={H} fill="#dfeede" />
      <g filter="url(#nb-hand)">
        {DONGS.map((d) => (
          <path key={d.name} d={d.d} fill={d.fill} stroke="#ffffff" strokeWidth="7" strokeLinejoin="round" />
        ))}
        {DONGS.map((d) => (
          <path key={`${d.name}-line`} d={d.d} fill="none" stroke="#9db8a6" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" />
        ))}
      </g>

      {/* 큰길 */}
      <g stroke="#ffffff" strokeWidth="14" strokeLinecap="round" fill="none" filter="url(#nb-hand)">
        <path d="M0,300 Q500,250 1000,290" />
        <path d="M520,0 Q490,380 540,750" />
        <path d="M0,620 Q420,560 1000,600" />
      </g>

      {/* 하천과 다리 */}
      <g filter="url(#nb-hand)">
        <path d="M-10,430 C200,380 320,540 500,470 S800,380 1010,420" fill="none" stroke="#9fd0ee" strokeWidth="30" strokeLinecap="round" />
        <path d="M-10,430 C200,380 320,540 500,470 S800,380 1010,420" fill="none" stroke="#c9e7f7" strokeWidth="9" strokeLinecap="round" strokeDasharray="30 22" />
      </g>
      <rect x="506" y="440" width="22" height="58" rx="4" transform="rotate(-8 517 469)" fill="#fff9ec" stroke="#8a7a5c" strokeWidth="2.5" />

      {/* 공원 */}
      <g filter="url(#nb-hand)">
        <ellipse cx="120" cy="120" rx="80" ry="54" fill="#c7e6b4" />
        <ellipse cx="120" cy="120" rx="80" ry="54" fill="url(#nb-grass)" />
        <ellipse cx="830" cy="650" rx="92" ry="52" fill="#c7e6b4" />
        <ellipse cx="830" cy="650" rx="92" ry="52" fill="url(#nb-grass)" />
      </g>
      <Trees at={[[92, 104], [140, 96], [118, 140], [800, 636], [852, 628], [872, 668]]} />

      {/* 산 */}
      <g filter="url(#nb-hand)">
        <path d="M830,150 L880,72 L930,150 Z" fill="#a9d39a" stroke="#6d9d62" strokeWidth="3" strokeLinejoin="round" />
        <path d="M880,150 L920,96 L962,150 Z" fill="#bfe0ad" stroke="#6d9d62" strokeWidth="3" strokeLinejoin="round" />
        <path d="M866,94 L880,72 L894,94 Q880,102 866,94Z" fill="#ffffff" />
      </g>

      {/* 시청 */}
      <g transform="translate(446,300)" stroke="#6b5d48" strokeWidth="2.5" strokeLinejoin="round">
        <rect x="0" y="18" width="52" height="34" fill="#fff4dc" />
        <path d="M-4,20 L26,2 L56,20 Z" fill="#f2c46b" />
        <rect x="21" y="34" width="10" height="18" fill="#c99a52" />
        <line x1="26" y1="2" x2="26" y2="-12" />
        <path d="M26,-12 L38,-8 L26,-4 Z" fill="#e2574c" />
      </g>
      {/* 전통시장 */}
      <g transform="translate(832,448)" stroke="#6b5d48" strokeWidth="2.5" strokeLinejoin="round">
        <rect x="0" y="16" width="56" height="30" fill="#fff4dc" />
        <path d="M-4,16 L60,16 L54,4 L2,4 Z" fill="#f7a58c" />
        <path d="M10,16 L10,4 M24,16 L24,4 M38,16 L38,4" stroke="#ffffff" strokeWidth="4" />
      </g>
      {/* 학교 */}
      <g transform="translate(294,656)" stroke="#6b5d48" strokeWidth="2.5" strokeLinejoin="round">
        <rect x="0" y="14" width="54" height="30" fill="#fff4dc" />
        <path d="M-2,14 L27,0 L56,14 Z" fill="#9cc3e6" />
        <circle cx="27" cy="24" r="5" fill="#ffffff" />
        <rect x="8" y="30" width="8" height="8" fill="#c9e7f7" />
        <rect x="38" y="30" width="8" height="8" fill="#c9e7f7" />
      </g>
    </svg>
  );
}

function Trees({ at }: { at: [number, number][] }) {
  return (
    <g>
      {at.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x - 2} y={y + 6} width={4} height={10} fill="#8a6b45" rx={1} />
          <circle cx={x} cy={y} r={12} fill="#7fbf6a" stroke="#5e9a4e" strokeWidth={2} />
        </g>
      ))}
    </g>
  );
}

export function CommunityMapDemo() {
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState<CategoryId[]>([]);
  const [openOnly, setOpenOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  // 현재 시각은 mount 이후에만 읽어 프리렌더 HTML과 어긋나지 않게 한다
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 60_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    return PLACES.filter((p) => {
      if (q && !p.name.includes(q) && !p.dong.includes(q)) return false;
      if (cats.length && !cats.includes(p.category)) return false;
      if (openOnly && now && !isOpenAt(p, now)) return false;
      return true;
    });
  }, [query, cats, openOnly, now]);

  const selected = PLACES.find((p) => p.id === selectedId) ?? null;
  const openCount = now ? PLACES.filter((p) => isOpenAt(p, now)).length : null;

  const toggleCat = (id: CategoryId) =>
    setCats((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const scrollToItem = (id: string) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(`place-${id}`)?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="min-h-screen text-[17px] leading-[1.5]" style={{ backgroundColor: PAGE, color: INK }}>
      <style>{`
        @keyframes nb-pin-in { from { opacity: 0; translate: 0 -14px; } to { opacity: 1; translate: 0 0; } }
        .nb-pin { transform: translate(-50%, -100%) rotate(var(--tilt)); transform-origin: 50% 100%; animation: nb-pin-in .42s cubic-bezier(.2,.8,.25,1.2) both; }
        .nb-pin[data-active="true"] { transform: translate(-50%, -100%) scale(1.15); }
        @keyframes nb-sheet-in { from { opacity: 0; translate: 0 24px; } to { opacity: 1; translate: 0 0; } }
        .nb-sheet { animation: nb-sheet-in .28s cubic-bezier(.2,.8,.25,1) both; }
        @media (prefers-reduced-motion: reduce) { .nb-pin, .nb-sheet { animation: none; } }
      `}</style>

      <header style={{ backgroundColor: LEAF }} className="text-white">
        <div className="mx-auto flex max-w-[1248px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 md:px-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#ffd75e] text-[#5b4300]">
            <MapPin size={24} strokeWidth={2.4} aria-hidden />
          </span>
          <div>
            <p className={`${jua.className} text-[26px] leading-[1.2]`}>샘플시 공유공간 지도</p>
            <p className="text-[15px] text-[#e2f3e8]">회의실, 공방, 작은도서관을 동네 지도에서 찾아보세요</p>
          </div>
          {openCount !== null && (
            <p className="rounded-full bg-white/15 px-3 py-1 text-[15px] sm:ml-auto">
              지금 문 연 곳 <b className="text-[#ffd75e]">{openCount}</b>곳
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[1248px] px-4 py-5 pb-28 md:px-6">
        {/* 검색·필터 */}
        <div className="rounded-[20px] bg-white p-4 shadow-[0_2px_0_#cfe0d4]">
          <label className="relative block">
            <span className="sr-only">공간 이름 또는 동 검색</span>
            <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: INK_SOFT }} aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="공간 이름이나 동 이름으로 찾기"
              className="h-12 w-full rounded-full border-2 bg-[#f6faf7] pl-11 pr-4 text-[17px] outline-none focus:border-[#1f7a4d]"
              style={{ borderColor: LINE }}
            />
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const on = cats.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleCat(c.id)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border-2 pl-1 pr-3.5 text-[15px] font-bold transition-colors"
                  style={on ? { backgroundColor: c.color, borderColor: c.color, color: "#fff" } : { backgroundColor: "#fff", borderColor: LINE, color: INK }}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{ backgroundColor: on ? "rgba(255,255,255,0.22)" : c.tint }}
                  >
                    <Icon size={15} strokeWidth={2.4} style={{ color: on ? "#fff" : c.color }} aria-hidden />
                  </span>
                  {c.label}
                </button>
              );
            })}
            <label className="inline-flex h-10 cursor-pointer select-none items-center gap-2 text-[15px] font-bold sm:ml-auto">
              <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} className="peer sr-only" />
              <span
                className="relative h-7 w-12 rounded-full bg-[#c5d3c9] transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-[#1f7a4d] peer-checked:after:translate-x-5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#1f7a4d] motion-reduce:after:transition-none"
                aria-hidden
              />
              지금 이용 가능
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {/* 지도 */}
          <div className="self-start lg:sticky lg:top-5">
            <div className="relative overflow-hidden rounded-[24px] border-4 border-white bg-white shadow-[0_3px_0_#cfe0d4]">
              <IllustratedMap />
              {DONGS.map((d) => (
                <span
                  key={d.name}
                  className={`${jua.className} pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white/85 px-2 text-[15px] leading-[1.5] sm:text-[17px]`}
                  style={{ left: `${(d.lx / W) * 100}%`, top: `${(d.ly / H) * 100}%`, color: INK_SOFT }}
                >
                  {d.name}
                </span>
              ))}
              {filtered.map((p, i) => {
                const c = categoryOf(p.category);
                const Icon = c.icon;
                const active = p.id === selectedId || p.id === hoverId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    data-active={active}
                    onClick={() => {
                      setSelectedId(p.id);
                      scrollToItem(p.id);
                    }}
                    onMouseEnter={() => setHoverId(p.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(p.id)}
                    onBlur={() => setHoverId(null)}
                    aria-label={`${p.name}, ${c.label}`}
                    className="nb-pin absolute transition-transform duration-150 motion-reduce:transition-none"
                    style={
                      {
                        left: `${(p.x / W) * 100}%`,
                        top: `${(p.y / H) * 100}%`,
                        animationDelay: `${i * 28}ms`,
                        zIndex: active ? 30 : 10,
                        "--tilt": `${((i % 3) - 1) * 5}deg`,
                      } as React.CSSProperties
                    }
                  >
                    {/* 스티커 모양 핀: 둥근 네모 + 꼬리 */}
                    <span className="relative block pb-[7px]">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-[10px] border-[2.5px] border-white shadow-[0_2px_0_rgba(35,48,42,0.25)] sm:h-9 sm:w-9 sm:rounded-[12px]"
                        style={{ backgroundColor: c.color }}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" color="#fff" strokeWidth={2.4} aria-hidden />
                      </span>
                      <span
                        className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[8px] border-x-transparent"
                        style={{ borderTopColor: c.color }}
                      />
                    </span>
                    {active && (
                      <span
                        className={`${jua.className} absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 text-[15px] leading-[1.6] text-white`}
                        style={{ backgroundColor: INK }}
                      >
                        {p.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[15px]" style={{ color: INK_SOFT }} aria-label="분류 범례">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                return (
                  <li key={c.id} className="inline-flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-[8px]" style={{ backgroundColor: c.color }}>
                      <Icon size={13} color="#fff" strokeWidth={2.4} aria-hidden />
                    </span>
                    {c.label}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* 목록 */}
          <div>
            <p className={`${jua.className} text-[20px]`}>
              찾은 공간 <span style={{ color: LEAF }}>{filtered.length}</span>곳
            </p>
            {filtered.length === 0 ? (
              <div className="mt-3 rounded-[20px] border-2 border-dashed bg-white p-8 text-center" style={{ borderColor: LINE, color: INK_SOFT }}>
                조건에 맞는 공간이 없습니다.
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCats([]);
                    setOpenOnly(false);
                  }}
                  className="mx-auto mt-4 flex h-12 items-center rounded-full bg-[#1f7a4d] px-6 font-bold text-white hover:bg-[#17603c]"
                >
                  조건 초기화
                </button>
              </div>
            ) : (
              <ul className="mt-3 space-y-2.5 lg:max-h-[680px] lg:overflow-y-auto lg:pr-1">
                {filtered.map((p) => {
                  const c = categoryOf(p.category);
                  const Icon = c.icon;
                  const active = p.id === selectedId || p.id === hoverId;
                  const open = now ? isOpenAt(p, now) : null;
                  return (
                    <li key={p.id} id={`place-${p.id}`}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(p.id)}
                        onMouseEnter={() => setHoverId(p.id)}
                        onMouseLeave={() => setHoverId(null)}
                        className="flex w-full gap-3 rounded-[18px] border-2 bg-white p-3.5 text-left transition-colors"
                        style={{ borderColor: active ? c.color : "transparent", boxShadow: "0 2px 0 #cfe0d4" }}
                      >
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]" style={{ backgroundColor: c.tint }}>
                          <Icon size={22} strokeWidth={2.2} style={{ color: c.color }} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-2 text-[15px]" style={{ color: INK_SOFT }}>
                            <b style={{ color: c.color }}>{c.label}</b>
                            <span>{p.dong}</span>
                            {open !== null && (
                              <span
                                className="ml-auto rounded-full px-2 text-[15px] font-bold"
                                style={open ? { backgroundColor: "#e3f3e6", color: "#17603c" } : { backgroundColor: "#eef1ef", color: INK_SOFT }}
                              >
                                {open ? "이용 가능" : "운영 종료"}
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-[17px] font-bold">{p.name}</span>
                          <span className="block text-[15px]" style={{ color: INK_SOFT }}>
                            {fmtHours(p.hours)}, 최대 {p.capacity}명, {p.fee}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {selected && <PlaceDetail place={selected} now={now} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function PlaceDetail({ place, now, onClose }: { place: Place; now: Date | null; onClose: () => void }) {
  const c = categoryOf(place.category);
  const Icon = c.icon;
  const open = now ? isOpenAt(place, now) : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[#23302a]/45 lg:items-center" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-title"
        onClick={(e) => e.stopPropagation()}
        className="nb-sheet max-h-[88vh] w-full overflow-y-auto rounded-t-[28px] bg-white lg:max-w-[520px] lg:rounded-[28px]"
      >
        <div className="px-6 pb-5 pt-5" style={{ backgroundColor: c.tint }}>
          <span className="mx-auto mb-4 block h-1.5 w-12 rounded-full bg-black/15 lg:hidden" aria-hidden />
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border-[3px] border-white" style={{ backgroundColor: c.color }}>
              <Icon size={22} color="#fff" strokeWidth={2.4} aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold" style={{ color: INK_SOFT }}>
                {c.label}, {place.dong}
              </p>
              <h2 id="place-title" className={`${jua.className} text-[26px] leading-[1.3]`}>
                {place.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70 hover:bg-white"
            >
              <X size={22} aria-hidden />
            </button>
          </div>
          {open !== null && (
            <p className="mt-3 inline-block rounded-full bg-white px-3 text-[15px] font-bold" style={{ color: open ? "#17603c" : INK_SOFT }}>
              {open ? "지금 이용 가능" : "지금은 운영 종료"}
            </p>
          )}
        </div>

        <div className="px-6 pb-6">
          <dl className="divide-y divide-[#e3ece6]">
            <Row icon={MapPin} term="주소" value={place.address} />
            <Row icon={Clock} term="운영시간" value={`${fmtHours(place.hours)}, 휴무 ${place.closedDay}`} />
            <Row icon={Users} term="수용 인원" value={`최대 ${place.capacity}명`} />
            <Row icon={Wallet} term="이용료" value={place.feeDetail ? `${place.fee} (${place.feeDetail})` : place.fee} />
            <Row icon={Phone} term="예약" value={`${place.reserve} 예약, ${place.phone}`} />
          </dl>

          <p className="mt-4 text-[15px] font-bold">편의시설</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {place.facilities.map((f) => (
              <li key={f} className="rounded-full bg-[#eef5f0] px-3 py-0.5 text-[15px]" style={{ color: INK_SOFT }}>
                {f}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1f7a4d] text-[17px] font-bold text-white transition-colors hover:bg-[#17603c]"
          >
            {place.reserve === "온라인" ? "예약하기" : "확인"}
          </button>
        </div>
      </section>
    </div>
  );
}

function Row({ icon: Icon, term, value }: { icon: LucideIcon; term: string; value: string }) {
  return (
    <div className="flex gap-3 py-3">
      <dt className="flex w-24 shrink-0 items-center gap-1.5 font-bold">
        <Icon size={16} style={{ color: INK_SOFT }} aria-hidden />
        {term}
      </dt>
      <dd style={{ color: INK_SOFT }}>{value}</dd>
    </div>
  );
}
