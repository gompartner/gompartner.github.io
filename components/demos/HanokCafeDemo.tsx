"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, List, Minus, Phone, Plus, RotateCcw } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 한옥 찻집 홈페이지 데모: 가상의 ○○ 한옥 찻집.
   상호, 대표자, 주소, 전화번호, 사업자 정보, 메뉴와 가격은 모두 가상이다.

   뼈대는 공간 탐색형(브랜드 티하우스 매장 소개 페이지 방식)이다. 공간 이름(대청마루, 건넌방, 사랑방, 툇마루, 별채)이
   곧 메뉴이고, 넓은 화면에서는 왼쪽 세로 메뉴에 공간 이름을 세로쓰기로 둔다. 좁은 화면에서는 위쪽 가로 띠로 바뀐다.
   예약은 따로 구간을 두지 않고, 평면도에서 고른 공간의 안내 판 안에서 `이 자리 예약`으로 연다.

   디자인: 한지색 바탕(#f3ede2)에 옅은 섬유 질감, 먹색 글씨(#1f1b16), 낙관 주홍(#a8432a),
   소나무 초록(#3f5a3c)과 황토(#b08850)를 보조색으로 쓴다. 제목은 굵은 고딕, 본문은 보통 고딕.
   첫 화면 사진은 창호지 문 두 짝이 양옆으로 열리며 드러나고, 상호는 기둥에 거는 주련처럼 세로로 쓴다.

   메뉴는 "따뜻한 차 중에 달지 않은 걸로 주세요" 문장의 낱말을 눌러 바꾸면 맞는 메뉴가 두루마리처럼 내려온다.
   옆에는 지도 앱 가게 정보처럼 "대표" 표시가 붙은 메뉴와 가격 목록을 두고, `메뉴판 보기`로 전체 메뉴판을 연다.
   평면도에서 방을 누르면 누른 곳에서 먹이 번지듯 칠해진다. 오시는 길은 골목 약도와 단계별 안내를 함께 움직인다.

   사진 출처(public/images/demo-cafe):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, coffee, bingsu, omija, yard */

const IMG = "/images/demo-cafe";
const CAFE = "○○ 한옥 찻집";
const TEL = "02-000-0000";
const ADDRESS = "□□시 □□로 12길 7";

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

const PAPER_TEXTURE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.28 0 0 0 0.07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/* ---------- 영업시간 ---------- */

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

const minuteSubscribe = (cb: () => void) => {
  const timer = window.setInterval(cb, 30_000);
  return () => window.clearInterval(timer);
};

/** 분 단위 현재 시각. 서버 렌더에서는 -1을 돌려 시간에 따른 화면 차이를 막는다. */
function useMinute() {
  return useSyncExternalStore(
    minuteSubscribe,
    () => Math.floor(Date.now() / 60_000),
    () => -1,
  );
}

/* ---------- 메뉴 ---------- */

type Kind = "tea" | "coffee" | "drink" | "dessert";
type Temp = "hot" | "cold" | "any";

interface MenuItem {
  name: string;
  kind: Kind;
  temp: Temp;
  sweet: boolean;
  price: number;
  desc: string;
  season?: boolean;
}

const MENU: MenuItem[] = [
  { name: "작설차", kind: "tea", temp: "hot", sweet: false, price: 7000, desc: "하동에서 덖은 햇차. 두 번까지 더 우려 드립니다" },
  { name: "우엉차", kind: "tea", temp: "hot", sweet: false, price: 6500, desc: "" },
  { name: "냉 작설차", kind: "tea", temp: "cold", sweet: false, price: 7000, desc: "찬물에 우려 쓴맛 없이 깔끔한 작설차" },
  { name: "쌍화차", kind: "tea", temp: "hot", sweet: true, price: 8000, desc: "10가지 약재로 6시간 이상 달인 차, 대추·밤·잣 고명" },
  { name: "대추차", kind: "tea", temp: "hot", sweet: true, price: 7500, desc: "" },
  { name: "유자차", kind: "tea", temp: "any", sweet: true, price: 7000, desc: "고흥 유자로 직접 담은 청" },
  { name: "오미자차", kind: "tea", temp: "cold", sweet: true, price: 7000, desc: "" },
  { name: "아메리카노", kind: "coffee", temp: "any", sweet: false, price: 5500, desc: "" },
  { name: "오늘의 핸드드립", kind: "coffee", temp: "hot", sweet: false, price: 7000, desc: "그날 원두로 내린 커피, 약과 한 조각과 함께 제공됩니다" },
  { name: "콜드브루", kind: "coffee", temp: "cold", sweet: false, price: 6500, desc: "물 또는 우유 선택" },
  { name: "흑임자 라테", kind: "coffee", temp: "any", sweet: true, price: 7000, desc: "" },
  { name: "인절미 라테", kind: "coffee", temp: "any", sweet: true, price: 7000, desc: "" },
  { name: "단호박 식혜", kind: "drink", temp: "cold", sweet: true, price: 6500, desc: "매장에서 직접 삭힌 식혜", season: true },
  { name: "수정과", kind: "drink", temp: "cold", sweet: true, price: 6000, desc: "곶감을 띄운 수정과" },
  { name: "미숫가루", kind: "drink", temp: "any", sweet: false, price: 6000, desc: "국산 수제 미숫가루, 꿀은 따로 제공" },
  { name: "쑥 라테", kind: "drink", temp: "any", sweet: true, price: 7000, desc: "커피 없이 쑥으로만 만든 라테" },
  { name: "인절미 빙수", kind: "dessert", temp: "cold", sweet: true, price: 13000, desc: "" },
  { name: "홍시 빙수", kind: "dessert", temp: "cold", sweet: true, price: 14000, desc: "얼린 홍시를 통째로 갈아 올린 빙수", season: true },
  { name: "단팥죽", kind: "dessert", temp: "hot", sweet: true, price: 9000, desc: "새알심과 밤이 들어간 단팥죽" },
  { name: "약과 세 개", kind: "dessert", temp: "any", sweet: true, price: 5000, desc: "직접 만든 개성약과" },
  { name: "가래떡구이", kind: "dessert", temp: "hot", sweet: false, price: 5500, desc: "조청과 함께 제공됩니다" },
  { name: "들기름 누룽지", kind: "dessert", temp: "any", sweet: false, price: 4500, desc: "" },
];

const KIND_LABEL: Record<Kind, string> = { tea: "전통차", coffee: "커피", drink: "음료", dessert: "다과" };

const TOKENS = {
  temp: [
    { v: "hot", label: "따뜻한" },
    { v: "cold", label: "시원한" },
  ],
  kind: [
    { v: "tea", label: "차" },
    { v: "coffee", label: "커피" },
    { v: "drink", label: "음료" },
    { v: "dessert", label: "다과" },
  ],
  sweet: [
    { v: "no", label: "달지 않은" },
    { v: "yes", label: "달콤한" },
  ],
} as const;

const BEST = [
  { img: "coffee", name: "오늘의 핸드드립", alt: "흰 자기 잔에 담긴 핸드드립 커피와 약과" },
  { img: "omija", name: "오미자차", alt: "얼음을 띄운 붉은 오미자차" },
  { img: "bingsu", name: "인절미 빙수", alt: "놋그릇에 담긴 인절미 빙수" },
];

const priceOf = (name: string) => MENU.find((m) => m.name === name)?.price ?? 0;

function won(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

/* ---------- 공간 ---------- */

type UnitId = "gunneon" | "daecheong" | "sarang1" | "sarang2" | "toen1" | "toen2" | "toen3" | "byeolchae";
type GroupId = "daecheong" | "gunneon" | "sarang" | "toen" | "byeolchae";

interface Unit {
  id: UnitId;
  name: string;
  group: GroupId;
  rect: [number, number, number, number];
  min: number;
  max: number;
}

const UNITS: Unit[] = [
  { id: "gunneon", name: "건넌방", group: "gunneon", rect: [40, 40, 160, 130], min: 2, max: 6 },
  { id: "daecheong", name: "대청마루", group: "daecheong", rect: [200, 40, 240, 130], min: 1, max: 8 },
  { id: "sarang1", name: "사랑방 1", group: "sarang", rect: [470, 170, 130, 110], min: 2, max: 4 },
  { id: "sarang2", name: "사랑방 2", group: "sarang", rect: [470, 280, 130, 110], min: 2, max: 4 },
  { id: "toen1", name: "툇마루 1", group: "toen", rect: [56, 177, 124, 28], min: 1, max: 2 },
  { id: "toen2", name: "툇마루 2", group: "toen", rect: [192, 177, 124, 28], min: 1, max: 2 },
  { id: "toen3", name: "툇마루 3", group: "toen", rect: [328, 177, 124, 28], min: 1, max: 2 },
  { id: "byeolchae", name: "별채", group: "byeolchae", rect: [64, 292, 150, 96], min: 6, max: 10 },
];

interface Group {
  id: GroupId;
  name: string;
  seating: string;
  reservable: boolean;
  desc: string;
  img: string;
  pos: string;
  alt: string;
}

const GROUPS: Group[] = [
  {
    id: "daecheong",
    name: "대청마루",
    seating: "입식 테이블 4개",
    reservable: false,
    desc: "서까래가 보이는 안채 대청마루",
    img: "hero",
    pos: "60% 50%",
    alt: "창호지 문을 열어 둔 한옥 마루에 찻주전자와 청자 찻잔이 놓인 모습",
  },
  {
    id: "gunneon",
    name: "건넌방",
    seating: "좌식 방 1실",
    reservable: true,
    desc: "신발을 벗고 들어가는 좌식 공간. 가족 모임에 많이 이용하십니다.",
    img: "hero",
    pos: "25% 50%",
    alt: "창호지 문 안쪽 마루에 놓인 찻상과 찻잔",
  },
  {
    id: "sarang",
    name: "사랑방",
    seating: "좌식 방 2실",
    reservable: true,
    desc: "문을 닫으면 개별룸으로 이용 가능한 작은 방 두 칸. 사랑방 2는 마당 쪽 창이 있습니다.",
    img: "hero",
    pos: "85% 50%",
    alt: "한옥 방 안 낮은 상 위의 찻주전자와 다과",
  },
  {
    id: "toen",
    name: "툇마루",
    seating: "마루 자리 3곳",
    reservable: true,
    desc: "마루 끝에 앉아 마당을 바라보는 자리. 우천 시 처마 안쪽으로 자리를 옮겨 드립니다.",
    img: "yard",
    pos: "35% 50%",
    alt: "기와지붕 아래 툇마루와 소나무가 있는 한옥 마당",
  },
  {
    id: "byeolchae",
    name: "별채",
    seating: "입식 큰 상 1실",
    reservable: true,
    desc: "마당 건너 별채. 대관료 없이 1인 1메뉴 주문 부탁드립니다.",
    img: "yard",
    pos: "80% 50%",
    alt: "마당 건너편 기와지붕 별채와 소나무",
  },
];

const groupOf = (id: GroupId) => GROUPS.find((g) => g.id === id)!;
const unitsOf = (id: GroupId) => UNITS.filter((u) => u.group === id);
const seatsOf = (id: GroupId) => unitsOf(id).reduce((n, u) => n + u.max, 0);
const TOTAL_SEATS = GROUPS.reduce((n, g) => n + seatsOf(g.id), 0);

const SLOTS = ["11:00", "13:00", "15:00", "17:00", "19:00"];

function hash(s: string) {
  let x = 0;
  for (const c of s) x = (x * 31 + c.charCodeAt(0)) >>> 0;
  return x;
}

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
function initial(ch: string) {
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return "*";
  return CHO[Math.floor(code / 588)];
}
/** 병원식 이름 가리기: 김하늘은 김ㅎ늘, 두 글자는 김* */
function maskName(name: string) {
  const s = [...name.trim()];
  if (s.length < 2) return name.trim();
  if (s.length === 2) return `${s[0]}*`;
  return s[0] + s.slice(1, -1).map(initial).join("") + s[s.length - 1];
}
function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  return `${d.slice(0, 3)}-****-${d.slice(-4)}`;
}

/* ---------- 공통 장식 ---------- */

function BrushRule({ className = "", color = "#1f1b16" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 400 10" preserveAspectRatio="none" className={className} aria-hidden>
      <path d="M2 6 C 60 2, 140 3, 220 4.5 S 360 6.5, 398 4 L 398 5.5 C 340 8.5, 240 7, 160 7.5 S 40 8.5, 2 7.5 Z" fill={color} />
    </svg>
  );
}

function Seal({ lines, size = 64, className = "" }: { lines: string[]; size?: number; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[6px] border-2 border-[#f3ede2]/50 bg-[#a8432a] tracking-[-0.02em] text-[#f8efe4] shadow-[inset_0_0_0_3px_#a8432a,inset_0_0_0_4px_rgba(248,239,228,0.6)] ${className}`}
      style={{ width: size, height: size, writingMode: "vertical-rl", fontSize: Math.round(size / 4.2), lineHeight: 1.05 }}
      aria-hidden
    >
      {lines.map((l) => (
        <span key={l} className="font-bold">
          {l}
        </span>
      ))}
    </span>
  );
}

function LogoMark({ light = false }: { light?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden>
      <path
        d="M20 4.5c8.9 0 15.6 6.6 15.4 15.7-.2 8.7-6.9 15.4-15.6 15.3C11 35.4 4.6 28.7 4.6 20 4.7 11 11.2 4.5 20 4.5Z"
        fill={light ? "#1f1b16" : "#f8f2e7"}
        stroke={light ? "#efe7da" : "#1f1b16"}
        strokeWidth="2.2"
      />
      <circle cx="27.5" cy="12.5" r="3" fill="#a8432a" />
    </svg>
  );
}

/* ---------- 데모 ---------- */

export function HanokCafeDemo() {
  const minute = useMinute();
  const reduce = useReducedMotionSafe();

  const [groupId, setGroupId] = useState<GroupId>("gunneon");
  const [unitId, setUnitId] = useState<UnitId>("gunneon");
  const [ink, setInk] = useState<{ x: number; y: number } | null>(null);
  const [inkKey, setInkKey] = useState(0);
  const [fullMenu, setFullMenu] = useState(false);

  const pickUnit = (id: UnitId, point: { x: number; y: number } | null) => {
    const u = UNITS.find((v) => v.id === id)!;
    setGroupId(u.group);
    setUnitId(id);
    setInk(point);
    setInkKey((k) => k + 1);
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const pickGroup = (id: GroupId) => {
    pickUnit(unitsOf(id)[0].id, null);
    scrollTo("space");
  };

  const openMenuBoard = () => {
    setFullMenu(true);
    scrollTo("menu");
  };

  return (
    <div className="min-h-screen bg-[#f3ede2] text-[17px] leading-[1.6] text-[#1f1b16]" style={{ backgroundImage: PAPER_TEXTURE }}>
      <div className="lg:flex">
        <SideNav groupId={groupId} onGroup={pickGroup} />
        <TopNav groupId={groupId} onGroup={pickGroup} />
        <div className="min-w-0 flex-1">
          <main>
            <Intro onReserve={() => scrollTo("space")} onMenuBoard={openMenuBoard} />
            <SpaceSection groupId={groupId} unitId={unitId} ink={ink} inkKey={inkKey} onPick={pickUnit} minute={minute} />
            <MenuSection showAll={fullMenu} setShowAll={setFullMenu} />
            <Location />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

/* ---------- 메뉴(내비게이션) ---------- */

const PAGE_LINKS = [
  { href: "#top", label: "소개" },
  { href: "#menu", label: "메뉴" },
  { href: "#location", label: "오시는 길" },
];

/** 넓은 화면: 왼쪽 세로 메뉴. 공간 이름을 세로쓰기로 오른쪽부터 늘어놓는다. */
function SideNav({ groupId, onGroup }: { groupId: GroupId; onGroup: (id: GroupId) => void }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 flex-col self-start bg-[#1f1b16] px-4 pb-24 pt-6 text-[#efe7da] lg:flex">
      <a href="#top" className="flex items-center gap-2.5">
        <LogoMark light />
        <span className="text-[18px] font-bold leading-[1.25]">
          ○○
          <br />
          한옥 찻집
        </span>
      </a>
      <nav aria-label="공간" className="mt-8">
        <ul className="flex flex-row-reverse justify-between">
          {GROUPS.map((g) => {
            const on = g.id === groupId;
            return (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => onGroup(g.id)}
                  aria-pressed={on}
                  className={`rounded-[4px] px-1.5 py-3 text-[18px] font-bold tracking-[0.12em] transition-colors ${on ? "bg-[#a8432a] text-[#f8efe4]" : "hover:bg-[#efe7da]/10"}`}
                  style={{ writingMode: "vertical-rl" }}
                >
                  {g.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <BrushRule className="mt-8 h-2 w-full opacity-30" color="#efe7da" />
      <nav aria-label="주 메뉴" className="mt-4">
        <ul className="space-y-1">
          {PAGE_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="flex h-10 items-center text-[16px] transition-colors hover:text-[#d98b6f]">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <a href={`tel:${TEL}`} className="mt-4 inline-flex items-center gap-2 text-[15px] text-[#cfc4b4] hover:text-[#efe7da]">
        <Phone size={15} aria-hidden />
        {TEL}
      </a>
    </aside>
  );
}

/** 좁은 화면: 위쪽 상호 줄 + 가로로 밀리는 메뉴 띠 */
function TopNav({ groupId, onGroup }: { groupId: GroupId; onGroup: (id: GroupId) => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#1f1b16]/10 bg-[#f3ede2] lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <a href="#top" className="flex items-center gap-2">
          <LogoMark />
          <span className="text-[18px] font-bold">{CAFE}</span>
        </a>
        <a href={`tel:${TEL}`} aria-label={`전화하기 ${TEL}`} className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] bg-[#1f1b16] text-[#f3ede2]">
          <Phone size={18} aria-hidden />
        </a>
      </div>
      <nav aria-label="주 메뉴" className="overflow-x-auto">
        <ul className="flex h-11 items-stretch gap-1 whitespace-nowrap px-2 text-[15px]">
          {PAGE_LINKS.slice(0, 2).map((l) => (
            <li key={l.href} className="flex">
              <a href={l.href} className="flex items-center px-2.5">
                {l.label}
              </a>
            </li>
          ))}
          <li aria-hidden className="my-3 w-px bg-[#1f1b16]/20" />
          {GROUPS.map((g) => {
            const on = g.id === groupId;
            return (
              <li key={g.id} className="flex">
                <button
                  type="button"
                  onClick={() => onGroup(g.id)}
                  aria-pressed={on}
                  className={`flex items-center px-2.5 font-semibold ${on ? "text-[#a8432a] shadow-[inset_0_-2px_0_#a8432a]" : ""}`}
                >
                  {g.name}
                </button>
              </li>
            );
          })}
          <li aria-hidden className="my-3 w-px bg-[#1f1b16]/20" />
          <li className="flex">
            <a href="#location" className="flex items-center px-2.5">
              오시는 길
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

/* ---------- 소개(첫 화면) ---------- */

function HanjiDoor({ side }: { side: "left" | "right" }) {
  return (
    <div
      className="absolute inset-y-0 w-1/2 border-[6px] border-[#5a4130]"
      style={{
        [side]: 0,
        backgroundColor: "#efe5d0",
        backgroundImage: "linear-gradient(#5a4130 2px, transparent 2px), linear-gradient(90deg, #5a4130 2px, transparent 2px)",
        backgroundSize: "54px 70px",
        backgroundPosition: "-1px -1px",
      }}
    />
  );
}

function Intro({ onReserve, onMenuBoard }: { onReserve: () => void; onMenuBoard: () => void }) {
  const reduce = useReducedMotionSafe();
  return (
    <section id="top" aria-labelledby="cafe-title" className="scroll-mt-28 px-4 pt-4 sm:px-6 lg:scroll-mt-0 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1080px]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] sm:aspect-[16/9]">
          <Image
            src={`${IMG}/hero.jpg`}
            alt="창호지 문을 열어 둔 한옥 마루에 찻주전자와 청자 찻잔, 약과가 놓인 모습"
            fill
            priority
            sizes="(min-width:1024px) 900px, 100vw"
            className="object-cover object-[70%_50%]"
          />
          {!reduce && (
            <>
              <motion.div className="absolute inset-0" initial={{ x: 0 }} animate={{ x: "-100%" }} transition={{ duration: 1.1, delay: 0.25, ease: EASE_IN_OUT }}>
                <HanjiDoor side="left" />
              </motion.div>
              <motion.div className="absolute inset-0" initial={{ x: 0 }} animate={{ x: "100%" }} transition={{ duration: 1.1, delay: 0.25, ease: EASE_IN_OUT }}>
                <HanjiDoor side="right" />
              </motion.div>
            </>
          )}
          <div className="absolute right-[6%] top-0 flex flex-col items-center">
            <span className="h-4 w-px bg-[#1f1b16]/50 sm:h-6" aria-hidden />
            <h1
              id="cafe-title"
              className="rounded-[2px] bg-[#2a211a] px-2.5 py-4 text-[24px] font-bold tracking-[0.18em] text-[#f3ede2] shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)] sm:px-3.5 sm:py-6 sm:text-[34px]"
              style={{ writingMode: "vertical-rl" }}
            >
              {CAFE}
            </h1>
          </div>
        </div>

        <div className="mt-6 grid gap-6 border-b border-[#1f1b16]/15 pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="max-w-[34em] text-[17px] text-[#4a4036]">1962년에 지은 ㄱ자 한옥 찻집. 직접 달인 전통차와 커피, 다과를 준비합니다.</p>
            <p className="mt-4 max-w-[34em] text-[16px] leading-[1.75] text-[#4a4036]">
              화요일부터 일요일까지 <b className="font-semibold text-[#1f1b16]">11:00 ~ 21:00</b>에 문을 열어요. 마지막 주문은 20:30이고 월요일과 설·추석 당일은 쉬어요.
              좌식 방 3실은 방 단위로 예약받아요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onReserve} className="inline-flex h-12 items-center rounded-[4px] bg-[#1f1b16] px-6 text-[16px] font-semibold text-[#f3ede2] transition-colors hover:bg-[#a8432a]">
              좌석 예약
            </button>
            <button type="button" onClick={onMenuBoard} className="inline-flex h-12 items-center rounded-[4px] border border-[#1f1b16]/30 px-6 text-[16px] font-semibold transition-colors hover:border-[#1f1b16]">
              메뉴판 보기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 공간 안내 + 좌석 예약 ---------- */

interface DayOption {
  key: string;
  label: string;
  sub: string;
  isToday: boolean;
}

function nextDays(minute: number): DayOption[] {
  if (minute < 0) return [];
  const base = new Date(minute * 60_000);
  base.setHours(0, 0, 0, 0);
  const out: DayOption[] = [];
  for (let i = 0; out.length < 7 && i < 10; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    if (d.getDay() === 1) continue;
    out.push({
      key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      label: i === 0 ? "오늘" : i === 1 ? "내일" : `${d.getMonth() + 1}.${d.getDate()}`,
      sub: `${WEEKDAY[d.getDay()]}요일`,
      isToday: i === 0,
    });
  }
  return out;
}

interface Booking {
  unit: Unit;
  day: DayOption;
  time: string;
  people: number;
  name: string;
  phone: string;
}

function FloorPlan({
  selected,
  groupId,
  ink,
  inkKey,
  onPick,
}: {
  selected: UnitId;
  groupId: GroupId;
  inkKey: number;
  ink: { x: number; y: number } | null;
  onPick: (id: UnitId, point: { x: number; y: number } | null) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotionSafe();

  const toPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    return { x: Math.round(p.x), y: Math.round(p.y) };
  };

  return (
    <svg ref={svgRef} viewBox="0 0 640 440" className="h-auto w-full select-none" role="group" aria-label="한옥 평면도">
      <defs>
        {UNITS.map((s) => (
          <clipPath key={s.id} id={`cafe-clip-${s.id}`}>
            <rect x={s.rect[0]} y={s.rect[1]} width={s.rect[2]} height={s.rect[3]} rx={3} />
          </clipPath>
        ))}
      </defs>

      <rect x={40} y={215} width={415} height={185} rx={4} fill="#e6dcc7" />
      <g fill="#d3c6ab">
        <ellipse cx={270} cy={262} rx={14} ry={8} />
        <ellipse cx={296} cy={300} rx={14} ry={8} />
        <ellipse cx={286} cy={342} rx={14} ry={8} />
        <ellipse cx={282} cy={384} rx={14} ry={8} />
      </g>
      <g aria-hidden>
        <circle cx={385} cy={285} r={34} fill="#3f5a3c" opacity={0.85} />
        <circle cx={405} cy={268} r={22} fill="#4f6d4a" opacity={0.9} />
        <rect x={382} y={312} width={6} height={22} fill="#5a4130" />
        <circle cx={420} cy={370} r={14} fill="#b08850" />
      </g>
      <text x={330} y={360} fontSize={16} fill="#6b5a48" fontWeight={700}>
        마당
      </text>

      <rect x={250} y={398} width={64} height={14} fill="#5a4130" />
      <text x={282} y={432} fontSize={14} fill="#6b5a48" textAnchor="middle">
        대문
      </text>

      <rect x={40} y={170} width={430} height={42} fill="#d9c29b" />

      <rect x={440} y={40} width={160} height={130} fill="#cdbfa6" stroke="#1f1b16" strokeWidth={2} />
      <text x={520} y={110} fontSize={16} textAnchor="middle" fill="#4a4036">
        주문하는 곳
      </text>

      {UNITS.map((s) => {
        const [x, y, w, h] = s.rect;
        const isSel = selected === s.id;
        const inGroup = s.group === groupId;
        const g = groupOf(s.group);
        const cx = x + w / 2;
        const cy = y + h / 2;
        const small = h < 40;
        return (
          <g
            key={s.id}
            role="button"
            tabIndex={0}
            aria-pressed={isSel}
            aria-label={`${s.name}, ${g.seating}${g.reservable ? `, ${s.min}~${s.max}명 예약 가능` : ", 예약 없이 이용"}`}
            className="cursor-pointer outline-none [&:focus-visible>rect:first-of-type]:stroke-[#a8432a] [&:focus-visible>rect:first-of-type]:stroke-[4]"
            onClick={(e) => onPick(s.id, toPoint(e.clientX, e.clientY))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPick(s.id, null);
              }
            }}
          >
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={3}
              fill={inGroup && !isSel ? "#eadbc2" : g.reservable ? "#f8f2e7" : "#ece2cf"}
              stroke="#1f1b16"
              strokeWidth={2}
              strokeDasharray={g.reservable ? undefined : "6 5"}
            />
            {isSel && (
              <g clipPath={`url(#cafe-clip-${s.id})`}>
                <motion.circle
                  key={inkKey}
                  cx={ink?.x ?? cx}
                  cy={ink?.y ?? cy}
                  fill="#1f1b16"
                  initial={reduce || inkKey === 0 ? false : { r: 0 }}
                  animate={{ r: 280 }}
                  transition={{ duration: 0.65, ease: EASE }}
                />
              </g>
            )}
            <text x={cx} y={small ? cy + 6 : cy - 4} fontSize={small ? 15 : 18} fontWeight={700} textAnchor="middle" fill={isSel ? "#f3ede2" : "#1f1b16"} style={{ transition: "fill 200ms" }}>
              {s.name}
            </text>
            {!small && (
              <text x={cx} y={cy + 20} fontSize={14} textAnchor="middle" fill={isSel ? "#d9cfc0" : "#6b5a48"} style={{ transition: "fill 200ms" }}>
                {g.reservable ? `${s.min}~${s.max}명` : "예약 없이"}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function SpaceSection({
  groupId,
  unitId,
  ink,
  inkKey,
  onPick,
  minute,
}: {
  groupId: GroupId;
  unitId: UnitId;
  ink: { x: number; y: number } | null;
  inkKey: number;
  onPick: (id: UnitId, point: { x: number; y: number } | null) => void;
  minute: number;
}) {
  return (
    <section id="space" aria-labelledby="space-title" className="scroll-mt-28 px-4 py-14 sm:px-6 lg:scroll-mt-0 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 id="space-title" className="text-[30px] font-bold leading-[1.3] tracking-[-0.02em] sm:text-[36px]">
            공간 안내
          </h2>
          <p className="text-[15px] text-[#6b5a48]">1962년 한옥 · 좌석 {TOTAL_SEATS}석</p>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div>
            <div className="rounded-[6px] border border-[#1f1b16]/12 bg-[#f8f3ea] p-3 sm:p-5">
              <FloorPlan selected={unitId} groupId={groupId} ink={ink} inkKey={inkKey} onPick={onPick} />
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[14px] text-[#5b5045]">
              <li className="flex items-center gap-2">
                <span className="h-3.5 w-5 rounded-[2px] border-2 border-[#1f1b16] bg-[#f8f2e7]" aria-hidden />
                예약 가능
              </li>
              <li className="flex items-center gap-2">
                <span className="h-3.5 w-5 rounded-[2px] border-2 border-dashed border-[#1f1b16] bg-[#ece2cf]" aria-hidden />
                예약 없이 이용
              </li>
              <li className="flex items-center gap-2">
                <span className="h-3.5 w-5 rounded-[2px] bg-[#1f1b16]" aria-hidden />
                선택한 공간
              </li>
            </ul>
          </div>
          <p className="sr-only" aria-live="polite">
            {groupOf(groupId).name} 선택됨
          </p>
          <SpacePanel key={groupId} group={groupOf(groupId)} unitId={unitId} onUnit={(id) => onPick(id, null)} minute={minute} />
        </div>
      </div>
    </section>
  );
}

function SpacePanel({ group, unitId, onUnit, minute }: { group: Group; unitId: UnitId; onUnit: (id: UnitId) => void; minute: number }) {
  const reduce = useReducedMotionSafe();
  const days = useMemo(() => nextDays(minute), [minute]);
  const units = unitsOf(group.id);
  const unit = units.find((u) => u.id === unitId) ?? units[0];

  const [open, setOpen] = useState(false);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tried, setTried] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);

  const day = days.find((d) => d.key === dayKey) ?? days[0] ?? null;
  const headcount = Math.min(Math.max(people, unit.min), unit.max);
  const nowMinutes =
    minute < 0
      ? 0
      : (() => {
          const d = new Date(minute * 60_000);
          return d.getHours() * 60 + d.getMinutes();
        })();

  const slotState = (t: string): "open" | "full" | "past" => {
    if (!day) return "open";
    const [hh, mm] = t.split(":").map(Number);
    if (day.isToday && hh * 60 + mm <= nowMinutes + 30) return "past";
    return hash(`${day.key}${unit.id}${t}`) % 4 === 0 ? "full" : "open";
  };

  const digits = phone.replace(/\D/g, "");
  const nameOk = name.trim().length >= 2;
  const phoneOk = digits.length >= 10 && digits.length <= 11;
  const timeOk = !!time && slotState(time) === "open";
  const canSubmit = group.reservable && !!day && timeOk && nameOk && phoneOk;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!canSubmit || !day || !time) return;
    setBooking({ unit, day, time, people: headcount, name: name.trim(), phone: digits });
  };

  const reset = () => {
    setBooking(null);
    setOpen(false);
    setTime(null);
    setName("");
    setPhone("");
    setTried(false);
  };

  const facts: [string, string][] = [
    ["좌석", `${seatsOf(group.id)}석 · ${group.seating}`],
    ["이용", group.reservable ? "예약 2시간 · 예약 없이 빈자리 이용 가능" : "예약 없이 오신 순서대로"],
    ["인원", units.length > 1 ? units.map((u) => `${u.name} ${u.min}~${u.max}명`).join(", ") : `${unit.min}~${unit.max}명`],
  ];
  if (group.reservable) facts.push(["예약 시간", "11:00 ~ 19:00 시작 (화 ~ 일)"]);

  return (
    <motion.article
      aria-labelledby="space-name"
      className="overflow-hidden rounded-[6px] border border-[#1f1b16]/15 bg-[#faf6ee]"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="relative aspect-[16/9]">
        <Image src={`${IMG}/${group.img}.jpg`} alt={group.alt} fill sizes="(min-width:1024px) 420px, 100vw" className="object-cover" style={{ objectPosition: group.pos }} />
      </div>
      <div className="p-5 sm:p-6">
        <h3 id="space-name" className="text-[26px] font-bold tracking-[-0.02em]">
          {group.name}
        </h3>
        <p className="mt-2 text-[16px] text-[#4a4036]">{group.desc}</p>
        <dl className="mt-4 divide-y divide-[#1f1b16]/10 border-y border-[#1f1b16]/10 text-[15px]">
          {facts.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[76px_1fr] gap-3 py-2.5">
              <dt className="text-[#a8432a]">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        {group.reservable && !booking && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="space-reserve"
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-[4px] bg-[#1f1b16] text-[16px] font-semibold text-[#f3ede2] transition-colors hover:bg-[#a8432a]"
          >
            {open ? "예약 닫기" : "이 자리 예약"}
          </button>
        )}

        <AnimatePresence initial={false} mode="wait">
          {booking ? (
            <motion.div
              key="done"
              className="relative mt-5 rounded-[4px] border border-[#1f1b16]/15 bg-[#f3ede2] p-5"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <motion.div
                className="absolute right-4 top-4"
                initial={reduce ? false : { scale: 1.6, rotate: -18, opacity: 0 }}
                animate={{ scale: 1, rotate: -6, opacity: 1 }}
                transition={{ duration: 0.22, delay: 0.2, ease: [0.3, 1.4, 0.5, 1] }}
              >
                <Seal lines={["예약", "접수"]} size={60} />
              </motion.div>
              <p className="pr-16 text-[22px] font-bold leading-[1.35]">예약 신청 완료</p>
              <p className="mt-1 pr-16 text-[15px] text-[#5b5045]">예약이 확정되면 문자로 안내해 드립니다.</p>
              <dl className="mt-4 divide-y divide-[#1f1b16]/10 text-[15px]">
                {[
                  ["자리", booking.unit.name],
                  ["날짜", `${booking.day.key.split("-").slice(1).join(".")} ${booking.day.sub}`],
                  ["시간", `${booking.time}부터 2시간`],
                  ["인원", `${booking.people}명`],
                  ["예약자", maskName(booking.name)],
                  ["연락처", maskPhone(booking.phone)],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[64px_1fr] gap-3 py-2">
                    <dt className="text-[#6b5a48]">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" onClick={reset} className="mt-4 inline-flex h-11 items-center gap-2 rounded-[4px] border border-[#1f1b16]/25 px-4 text-[15px] font-semibold">
                <RotateCcw size={16} aria-hidden />
                다시 예약
              </button>
            </motion.div>
          ) : open && group.reservable ? (
            <motion.form
              key="form"
              id="space-reserve"
              onSubmit={submit}
              noValidate
              aria-label={`${group.name} 좌석 예약`}
              className="mt-5 space-y-6"
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {units.length > 1 && (
                <fieldset>
                  <legend className="text-[15px] font-semibold">자리</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {units.map((u) => {
                      const on = u.id === unit.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            onUnit(u.id);
                            setTime(null);
                          }}
                          aria-pressed={on}
                          className={`h-11 rounded-[4px] border px-3.5 text-[15px] transition-colors ${on ? "border-[#1f1b16] bg-[#1f1b16] text-[#f3ede2]" : "border-[#1f1b16]/20 hover:border-[#1f1b16]"}`}
                        >
                          {u.name}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              <fieldset>
                <legend className="text-[15px] font-semibold">날짜</legend>
                <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
                  {days.map((d) => {
                    const active = day?.key === d.key;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => {
                          setDayKey(d.key);
                          setTime(null);
                        }}
                        aria-pressed={active}
                        className={`flex h-[58px] min-w-[58px] shrink-0 flex-col items-center justify-center rounded-[4px] border text-[15px] transition-colors ${active ? "border-[#1f1b16] bg-[#1f1b16] text-[#f3ede2]" : "border-[#1f1b16]/20 hover:border-[#1f1b16]"}`}
                      >
                        <span className="font-semibold">{d.label}</span>
                        <span className={`text-[13px] ${active ? "text-[#d9cfc0]" : "text-[#6b5a48]"}`}>{d.sub}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1 text-[13px] text-[#6b5a48]">월요일 휴무</p>
              </fieldset>

              <fieldset>
                <legend className="text-[15px] font-semibold">시간 (2시간)</legend>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3">
                  {SLOTS.map((t) => {
                    const st = slotState(t);
                    const active = time === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={st !== "open"}
                        onClick={() => setTime(t)}
                        aria-pressed={active}
                        aria-label={`${t}${st === "full" ? ", 마감" : st === "past" ? ", 지난 시간" : ""}`}
                        className={`flex h-12 flex-col items-center justify-center rounded-[4px] border text-[15px] transition-colors disabled:cursor-not-allowed ${
                          active ? "border-[#a8432a] bg-[#a8432a] text-white" : st === "open" ? "border-[#1f1b16]/20 hover:border-[#1f1b16]" : "border-transparent bg-[#1f1b16]/5 text-[#1f1b16]/40"
                        }`}
                      >
                        <span className={st === "full" ? "line-through" : ""}>{t}</span>
                        {st !== "open" && <span className="text-[11px] leading-none">{st === "full" ? "마감" : "지남"}</span>}
                      </button>
                    );
                  })}
                </div>
                {tried && !timeOk && <p className="mt-1.5 text-[14px] text-[#a8432a]">시간을 선택해 주십시오.</p>}
              </fieldset>

              <fieldset>
                <legend className="text-[15px] font-semibold">인원</legend>
                <div className="mt-2 inline-flex items-center rounded-[4px] border border-[#1f1b16]/20">
                  <button type="button" onClick={() => setPeople(Math.max(unit.min, headcount - 1))} disabled={headcount <= unit.min} aria-label="한 명 줄이기" className="inline-flex h-11 w-11 items-center justify-center disabled:opacity-30">
                    <Minus size={16} aria-hidden />
                  </button>
                  <span className="w-14 text-center text-[17px] font-semibold tabular-nums" aria-live="polite">
                    {headcount}명
                  </span>
                  <button type="button" onClick={() => setPeople(Math.min(unit.max, headcount + 1))} disabled={headcount >= unit.max} aria-label="한 명 늘리기" className="inline-flex h-11 w-11 items-center justify-center disabled:opacity-30">
                    <Plus size={16} aria-hidden />
                  </button>
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <label className="block">
                  <span className="text-[15px] font-semibold">예약자명</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    aria-invalid={tried && !nameOk}
                    className="mt-2 h-12 w-full rounded-[4px] border border-[#1f1b16]/25 bg-white/60 px-3 text-[16px] outline-none focus:border-[#1f1b16]"
                  />
                  {tried && !nameOk && <span className="mt-1 block text-[14px] text-[#a8432a]">이름을 입력해 주십시오.</span>}
                </label>
                <label className="block">
                  <span className="text-[15px] font-semibold">휴대전화</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="010-0000-0000"
                    aria-invalid={tried && !phoneOk}
                    className="mt-2 h-12 w-full rounded-[4px] border border-[#1f1b16]/25 bg-white/60 px-3 text-[16px] outline-none focus:border-[#1f1b16]"
                  />
                  {tried && !phoneOk && <span className="mt-1 block text-[14px] text-[#a8432a]">휴대전화 번호를 확인해 주십시오.</span>}
                </label>
              </div>

              <button type="submit" className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-[#a8432a] text-[16px] font-semibold text-white transition-colors hover:bg-[#1f1b16]">
                <Check size={18} aria-hidden />
                예약 신청
              </button>
              <p className="text-[14px] text-[#6b5a48]">예약 시간 15분 경과 시 자동 취소될 수 있습니다.</p>
            </motion.form>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

/* ---------- 메뉴 ---------- */

function Token<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const reduce = useReducedMotionSafe();
  const index = options.findIndex((o) => o.v === value);
  const current = options[index];
  const next = options[(index + 1) % options.length];
  return (
    <button
      type="button"
      onClick={() => onChange(next.v)}
      className="group relative mx-1 inline-flex flex-col items-center align-baseline"
      aria-label={`${label} ${current.label}, 다음 선택 ${next.label}`}
    >
      <span className="relative inline-grid overflow-hidden px-1 text-[#a8432a]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={current.v}
            className="col-start-1 row-start-1 whitespace-nowrap"
            initial={reduce ? false : { y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {current.label}
          </motion.span>
        </AnimatePresence>
      </span>
      <BrushRule className="-mt-1 h-2 w-full" color="#a8432a" />
      <span className="mt-1 flex gap-1" aria-hidden>
        {options.map((o) => (
          <span key={o.v} className={`h-1 w-1 rounded-full ${o.v === value ? "bg-[#a8432a]" : "bg-[#1f1b16]/20"}`} />
        ))}
      </span>
    </button>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <li className="py-3.5">
      <div className="flex items-baseline gap-3">
        <span className="text-[19px] font-bold tracking-[-0.02em]">{item.name}</span>
        {item.season && <span className="rounded-[2px] border border-[#a8432a] px-1.5 text-[13px] leading-[1.6] text-[#a8432a]">가을</span>}
        <span className="mb-1 flex-1 border-b border-dotted border-[#1f1b16]/35" aria-hidden />
        <span className="text-[17px] font-semibold tabular-nums">{won(item.price)}</span>
      </div>
      {(item.temp === "any" || item.desc) && (
        <p className="mt-1 text-[15px] text-[#5b5045]">
          {[item.temp === "any" ? "따뜻하게, 시원하게" : "", item.desc].filter(Boolean).join(" · ")}
        </p>
      )}
    </li>
  );
}

function MenuSection({ showAll, setShowAll }: { showAll: boolean; setShowAll: (v: boolean) => void }) {
  const reduce = useReducedMotionSafe();
  const [temp, setTemp] = useState<"hot" | "cold">("hot");
  const [kind, setKind] = useState<Kind>("tea");
  const [sweet, setSweet] = useState<"no" | "yes">("no");

  const { items, relaxed } = useMemo(() => {
    const byTemp = MENU.filter((m) => m.kind === kind && (m.temp === temp || m.temp === "any"));
    const exact = byTemp.filter((m) => m.sweet === (sweet === "yes"));
    return exact.length ? { items: exact, relaxed: false } : { items: byTemp, relaxed: true };
  }, [temp, kind, sweet]);

  const comboKey = `${temp}-${kind}-${sweet}`;
  const kindWord = TOKENS.kind.find((s) => s.v === kind)?.label;

  return (
    <section id="menu" aria-labelledby="menu-title" className="scroll-mt-28 border-t border-[#1f1b16]/10 bg-[#efe7da]/60 px-4 py-14 sm:px-6 lg:scroll-mt-0 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="menu-title" className="text-[30px] font-bold leading-[1.3] tracking-[-0.02em] sm:text-[36px]">
            메뉴
          </h2>
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            aria-expanded={showAll}
            aria-controls="menu-board"
            className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-[#1f1b16]/25 px-4 text-[15px] font-medium transition-colors hover:border-[#1f1b16]"
          >
            {showAll ? <RotateCcw size={16} aria-hidden /> : <List size={16} aria-hidden />}
            {showAll ? "메뉴판 닫기" : "메뉴판 보기"}
          </button>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="min-w-0" id="menu-picker">
            <p className="text-[24px] font-semibold leading-[2.1] tracking-[-0.02em] sm:text-[30px]">
              <Token label="온도" options={TOKENS.temp} value={temp} onChange={setTemp} />
              <Token label="종류" options={TOKENS.kind} value={kind} onChange={setKind} />
              중에
              <Token label="단맛" options={TOKENS.sweet} value={sweet} onChange={setSweet} />
              걸로 주세요
            </p>

            <div className="mt-6">
              <div className="h-3.5 rounded-full bg-[#5a4130]" aria-hidden />
              <motion.div
                key={comboKey}
                className="mx-3 overflow-hidden bg-[#faf6ee] shadow-[inset_0_8px_10px_-8px_rgba(0,0,0,0.25)]"
                initial={reduce ? false : { height: 0 }}
                animate={{ height: "auto" }}
                transition={{ duration: 0.7, ease: EASE_IN_OUT }}
              >
                <div className="px-5 py-4 sm:px-8" aria-live="polite">
                  <p className="pt-2 text-[15px] text-[#6b5a48]">
                    {relaxed
                      ? `${TOKENS.sweet.find((s) => s.v === sweet)?.label} ${TOKENS.temp.find((s) => s.v === temp)?.label} ${kindWord}는 없어서 비슷한 메뉴를 보여 드려요`
                      : `${items.length}가지`}
                  </p>
                  <ul className="divide-y divide-[#1f1b16]/10">
                    {items.map((m) => (
                      <MenuRow key={m.name} item={m} />
                    ))}
                  </ul>
                </div>
              </motion.div>
              <div className="h-3.5 rounded-full bg-[#5a4130]" aria-hidden />
            </div>
          </div>

          <div>
            <h3 className="text-[20px] font-bold">대표 메뉴</h3>
            <ul className="mt-3 divide-y divide-[#1f1b16]/10 border-y border-[#1f1b16]/10">
              {BEST.map((b) => (
                <li key={b.name} className="flex items-center gap-4 py-3">
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[4px]">
                    <Image src={`${IMG}/${b.img}.jpg`} alt={b.alt} fill sizes="64px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-bold">{b.name}</span>
                    <span className="mt-0.5 block text-[15px] tabular-nums text-[#5b5045]">{won(priceOf(b.name))}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[14px] text-[#6b5a48]">10월 ~ 11월 가을 메뉴: 홍시 빙수, 단호박 식혜</p>
          </div>
        </div>

        {showAll && (
          <div id="menu-board" className="mt-12 rounded-[6px] border border-[#1f1b16]/15 bg-[#faf6ee] p-5 sm:p-8">
            <h3 className="text-[22px] font-bold">메뉴판</h3>
            <div className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                <div key={k}>
                  <p className="border-b-2 border-[#1f1b16] pb-1.5 text-[18px] font-bold text-[#a8432a]">{KIND_LABEL[k]}</p>
                  <ul className="divide-y divide-[#1f1b16]/10">
                    {MENU.filter((m) => m.kind === k).map((m) => (
                      <MenuRow key={m.name} item={m} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

type Pt = [number, number];

const ROUTE: Pt[] = [
  [64, 300],
  [216, 300],
  [216, 196],
  [216, 104],
  [372, 104],
];

const WAY_STEPS: { text: string; upto: number; mark: Pt }[] = [
  { text: "□□역 2번 출구에서 큰길을 따라 50m 직진, 편의점 앞", upto: 1, mark: [216, 300] },
  { text: "편의점을 끼고 12길 골목으로 진입", upto: 2, mark: [216, 196] },
  { text: "세탁소를 지나 골목 끝에서 우회전", upto: 3, mark: [216, 104] },
  { text: "파란 대문, ○○ 현판이 걸린 한옥", upto: 4, mark: [372, 104] },
];

const pathOf = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");

function AlleyMap({ step }: { step: number }) {
  const reduce = useReducedMotionSafe();
  const s = WAY_STEPS[step];
  return (
    <svg viewBox="0 0 480 360" className="h-auto w-full" role="img" aria-label={`골목 약도. ${step + 1}번째 안내: ${s.text}`}>
      <rect width="480" height="360" fill="#ece3d2" />
      {/* 큰길 */}
      <rect x="0" y="282" width="480" height="36" fill="#d6ccb8" />
      <path d="M0 300 H480" stroke="#f3ede2" strokeWidth="2" strokeDasharray="12 10" />
      <text x="470" y="340" fontSize="13" fill="#6b5a48" textAnchor="end">
        □□로
      </text>
      {/* 골목 */}
      <rect x="204" y="92" width="24" height="190" fill="#e0d5c0" />
      <rect x="204" y="92" width="200" height="24" fill="#e0d5c0" />
      <text x="236" y="250" fontSize="13" fill="#6b5a48">
        12길
      </text>
      {/* 건물들 */}
      <rect x="12" y="324" width="104" height="30" fill="#f8f2e7" stroke="#1f1b16" strokeWidth="1.5" />
      <text x="64" y="344" fontSize="13" fill="#1f1b16" textAnchor="middle" fontWeight={700}>
        □□역 2번 출구
      </text>
      <rect x="236" y="236" width="76" height="40" fill="#f8f2e7" stroke="#1f1b16" strokeWidth="1.5" />
      <text x="274" y="261" fontSize="13" fill="#1f1b16" textAnchor="middle" fontWeight={700}>
        편의점
      </text>
      <rect x="116" y="180" width="80" height="36" fill="#f8f2e7" stroke="#1f1b16" strokeWidth="1.5" />
      <text x="156" y="203" fontSize="13" fill="#1f1b16" textAnchor="middle" fontWeight={700}>
        세탁소
      </text>
      <rect x="116" y="232" width="80" height="44" fill="#e6dcc7" stroke="#6b5a48" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="156" y="252" fontSize="12" fill="#4a4036" textAnchor="middle">
        □□공영
      </text>
      <text x="156" y="268" fontSize="12" fill="#4a4036" textAnchor="middle">
        주차장
      </text>
      {/* 찻집 */}
      <rect x="340" y="20" width="120" height="70" fill="#2a211a" />
      <text x="400" y="60" fontSize="14" fill="#f3ede2" textAnchor="middle" fontWeight={700}>
        ○○ 한옥 찻집
      </text>
      <rect x="360" y="86" width="24" height="8" fill="#2f5d9e" />

      {/* 길 */}
      <path d={pathOf(ROUTE)} fill="none" stroke="#1f1b16" strokeOpacity="0.3" strokeWidth="3" strokeDasharray="5 6" />
      <path d={pathOf(ROUTE.slice(0, s.upto + 1))} fill="none" stroke="#a8432a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={ROUTE[0][0]} cy={ROUTE[0][1]} r="6" fill="#1f1b16" />
      <motion.g initial={false} animate={{ x: s.mark[0], y: s.mark[1] }} transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}>
        <circle r="14" fill="#a8432a" stroke="#f3ede2" strokeWidth="3" />
        <text y="5" fontSize="14" fill="#fff" textAnchor="middle" fontWeight={700}>
          {step + 1}
        </text>
      </motion.g>
    </svg>
  );
}

function Location() {
  const [step, setStep] = useState(0);
  const last = WAY_STEPS.length - 1;

  return (
    <section id="location" aria-labelledby="location-title" className="scroll-mt-28 border-t border-[#1f1b16]/10 px-4 py-14 sm:px-6 lg:scroll-mt-0 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 id="location-title" className="text-[30px] font-bold leading-[1.3] tracking-[-0.02em] sm:text-[36px]">
            오시는 길
          </h2>
          <p className="text-[15px] text-[#6b5a48]">□□역 2번 출구 도보 6분</p>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div className="overflow-hidden rounded-[6px] border border-[#1f1b16]/12">
            <AlleyMap step={step} />
          </div>
          <div id="way">
            <ol className="border-t border-[#1f1b16]/15">
              {WAY_STEPS.map((w, i) => {
                const on = i === step;
                return (
                  <li key={w.text} className="border-b border-[#1f1b16]/15">
                    <button
                      type="button"
                      onClick={() => setStep(i)}
                      aria-pressed={on}
                      className={`flex w-full items-baseline gap-4 px-2 py-4 text-left transition-colors ${on ? "bg-[#1f1b16]/[0.06]" : "hover:bg-[#1f1b16]/[0.03]"}`}
                    >
                      <span className={`w-6 shrink-0 text-[20px] font-bold tabular-nums ${on ? "text-[#a8432a]" : "text-[#1f1b16]/40"}`}>{i + 1}</span>
                      <span className={`text-[17px] leading-[1.6] ${on ? "font-semibold" : "text-[#4a4036]"}`}>{w.text}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setStep((v) => Math.max(0, v - 1))} disabled={step === 0} aria-label="이전 안내" className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border border-[#1f1b16]/25 disabled:opacity-30">
                <ChevronLeft size={18} aria-hidden />
              </button>
              <button type="button" onClick={() => setStep((v) => Math.min(last, v + 1))} disabled={step === last} aria-label="다음 안내" className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border border-[#1f1b16]/25 disabled:opacity-30">
                <ChevronRight size={18} aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-8 border-t border-[#1f1b16]/15 pt-8 md:grid-cols-3">
          <div>
            <h3 className="text-[18px] font-bold">주소</h3>
            <p className="mt-2 text-[16px]">{ADDRESS}</p>
            <a href={`tel:${TEL}`} className="mt-4 inline-flex h-12 items-center gap-2 rounded-[4px] bg-[#1f1b16] px-5 text-[16px] font-semibold text-[#f3ede2] transition-colors hover:bg-[#a8432a]">
              <Phone size={17} aria-hidden />
              전화하기
            </a>
          </div>
          <div>
            <h3 className="text-[18px] font-bold">영업시간</h3>
            <dl className="mt-2 grid grid-cols-[72px_1fr] gap-y-1.5 text-[16px]">
              <dt className="text-[#6b5a48]">화 ~ 일</dt>
              <dd>11:00 ~ 21:00</dd>
              <dt className="text-[#6b5a48]">주문 마감</dt>
              <dd>20:30</dd>
              <dt className="text-[#6b5a48]">휴무</dt>
              <dd>월요일, 설·추석 당일</dd>
            </dl>
          </div>
          <div>
            <h3 className="text-[18px] font-bold">주차 안내</h3>
            <p className="mt-2 text-[16px]">주차 공간이 없습니다. 골목 입구 □□공영주차장 이용 시 2시간 할인권을 드립니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#1f1b16] px-4 pb-28 pt-10 text-[14px] leading-[1.8] text-[#b9ad9c] sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[18px] font-bold tracking-[-0.02em] text-[#efe7da]">{CAFE}</p>
          <p className="mt-2">
            대표 김○○ | 사업자등록번호 000-00-00000 | {ADDRESS} | {TEL}
          </p>
        </div>
        <Seal lines={["○○", "찻집"]} size={52} className="rotate-3 self-start" />
      </div>
    </footer>
  );
}
