"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Heart, Layers, LayoutGrid, Map as MapIcon, Menu, Phone, Plus, RotateCcw, Search, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 부동산 홈페이지 데모: 가상의 ○○ 공인중개사사무소.
   상호, 대표 공인중개사, 등록번호, 주소, 전화번호, 사업자 정보, 매물과 거래 내역은 모두 가상이다.

   구조: 매물 솔루션형(검색 우선). 첫 화면에 사진과 소개 문단 없이 검색 필터 바와 매물 종류별 개수 줄을 두고,
   그 아래를 지도검색 / 목록검색 탭으로 나눈다. 메뉴(매물 의뢰하기, 매물투어신청, 부동산 계산기, 사무소 소개)는
   라우트 없이 컴포넌트 상태로 하위 화면을 바꾼다.

   디자인: 흰 바탕에 옅은 회색 검색 띠, 파랑(#1e5bb8)은 버튼과 지도 핀에만, 급매 배지만 빨강. 매물 카드 배지는 1개까지.

   지도검색은 포털 지도 타일 색(미색 바탕, 노란 큰길, 도로명)으로 그린 □□역 주변 약도에 매물 핀을 꽂고,
   같은 단지에 여러 건이 남으면 숫자 묶음으로 보여 준다. 데모에는 대표 매물 12건만 넣고,
   매물마다 같은 조건 매물 수(similar)를 더해 전체 137건 규모로 보여 준다.
   목록에 마우스를 올리면 핀이, 핀을 누르면 목록이 함께 표시된다.
   매물 상세는 중개대상물 표시·광고 명시사항 순서(매물번호, 소재지, 면적, 가격, 거래형태, 층, 사용승인일, 방향,
   방·욕실, 입주가능일, 주차대수, 관리비)로 적고, 입주가능일은 날짜, 즉시입주, ○월 초순·중순·하순만 쓴다.
   상세에는 법정 상한 요율로 계산한 중개보수를 함께 보여 준다.
   관심매물(최대 3개)은 매물투어신청으로 한 번에 넘어간다. 매물 의뢰하기는 집을 내놓는 쪽의 접수 폼이다.
   부동산 계산기에는 중개보수 계산과 전월세 비교(보증금, 월세, 대출 금리, 예금 금리로 한 달 비용 막대 비교)가 있다.

   사진 출처(public/images/demo-realty):
   AI 생성(Z-Image-Turbo, Apache 2.0) interior */

const IMG = "/images/demo-realty";
const OFFICE = "○○ 공인중개사사무소";
const TEL = "02-000-0000";
const ADDRESS = "□□시 □□구 □□로 120, □□아파트 상가 1층 105호";
const REG_NO = "00000-0000-00000";
const AGENT = "김ㅁ수";

const C = {
  white: "#ffffff",
  gray: "#f4f5f6",
  grayDeep: "#e7e9eb",
  ink: "#222529",
  inkSoft: "#3b4046",
  muted: "#5d636b",
  line: "#dcdfe3",
  accent: "#1e5bb8",
  accentText: "#174a99",
  accentSoft: "#eaf1fb",
  heart: "#e2483d",
  urgent: "#d6332a",
};

/* 지도 타일 색. 포털 지도처럼 바탕은 옅은 미색, 큰길은 연한 노랑 */
const MAP = {
  ground: "#f3f1ec",
  block: "#e6e2da",
  building: "#dcd7cd",
  apt: "#e3dfe8",
  aptBuilding: "#d3cddc",
  park: "#d5e8c9",
  school: "#f1e9cf",
  water: "#c5dbee",
  road: "#ffffff",
  roadEdge: "#d8d3c8",
  main: "#fbe8a8",
  mainEdge: "#e2c56a",
  label: "#5b5f66",
  halo: "#ffffff",
};

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- 매물 ---------- */

type Deal = "sale" | "jeonse" | "monthly";
type Kind = "apt" | "villa" | "officetel" | "store";
type ZoneId = "A" | "B" | "C" | "D" | "E" | "F" | "G";
type Badge = "급매" | "추천" | "신규";

const DEAL_LABEL: Record<Deal, string> = { sale: "매매", jeonse: "전세", monthly: "월세" };
const KIND_LABEL: Record<Kind, string> = { apt: "아파트", villa: "빌라", officetel: "오피스텔", store: "상가" };

const ZONES: Record<ZoneId, { name: string; x: number; y: number }> = {
  A: { name: "□□아파트", x: 288, y: 182 },
  B: { name: "□□파크아파트", x: 545, y: 348 },
  C: { name: "□□오피스텔", x: 504, y: 186 },
  D: { name: "□□빌라", x: 365, y: 345 },
  E: { name: "서쪽 골목", x: 75, y: 220 },
  F: { name: "□□시장 상가", x: 425, y: 480 },
  G: { name: "동쪽 골목", x: 735, y: 330 },
};

interface Listing {
  id: string;
  /** 매물번호 */
  no: string;
  /** 이 매물과 같은 단지·조건으로 올라와 있는 매물 수(대표 매물 포함). 데모에는 대표 매물만 넣는다. */
  similar: number;
  zone: ZoneId;
  name: string;
  dong: string;
  kind: Kind;
  deal: Deal;
  /** 매매가 또는 보증금(만 원) */
  price: number;
  /** 월세(만 원) */
  rent?: number;
  /** 전용면적(㎡) */
  area: number;
  /** 공급면적(㎡) */
  supply: number;
  floor: number;
  total: number;
  rooms: number;
  baths: number;
  dir: string;
  /** 사용승인일 */
  approved: string;
  /** 입주가능일: 날짜, 즉시입주, ○월 초순/중순/하순 */
  moveIn: string;
  /** 관리비(만 원) */
  fee: number;
  feeNote?: string;
  parking: string;
  walk: number;
  x: number;
  y: number;
  badges: Badge[];
  tags: string[];
}

const LISTINGS: Listing[] = [
  { id: "a1", no: "21734", similar: 14, zone: "A", name: "□□아파트 102동", dong: "□□동", kind: "apt", deal: "sale", price: 92000, area: 84.97, supply: 112.4, floor: 12, total: 20, rooms: 3, baths: 2, dir: "남향", approved: "2008.11.20", moveIn: "2027년 1월 초순(협의 가능)", fee: 28, parking: "총 1,240대(세대당 1.3대)", walk: 6, x: 200, y: 150, badges: ["추천"], tags: ["초등학교 도보 3분", "올수리"] },
  { id: "a2", no: "21761", similar: 17, zone: "A", name: "□□아파트 105동", dong: "□□동", kind: "apt", deal: "jeonse", price: 45000, area: 59.92, supply: 84.3, floor: 7, total: 20, rooms: 3, baths: 2, dir: "남동향", approved: "2008.11.20", moveIn: "즉시입주", fee: 21, parking: "총 1,240대(세대당 1.3대)", walk: 6, x: 290, y: 218, badges: ["신규"], tags: ["발코니 확장", "전세대출 가능"] },
  { id: "a3", no: "21598", similar: 9, zone: "A", name: "□□아파트 101동", dong: "□□동", kind: "apt", deal: "monthly", price: 10000, rent: 110, area: 59.92, supply: 84.3, floor: 3, total: 20, rooms: 3, baths: 2, dir: "남향", approved: "2008.11.20", moveIn: "2026년 11월 하순", fee: 20, parking: "총 1,240대(세대당 1.3대)", walk: 5, x: 378, y: 150, badges: [], tags: ["저층", "반려동물 협의"] },
  { id: "b1", no: "21522", similar: 11, zone: "B", name: "□□파크아파트 201동", dong: "□□2동", kind: "apt", deal: "sale", price: 128000, area: 114.8, supply: 145.2, floor: 18, total: 25, rooms: 4, baths: 2, dir: "남향", approved: "2015.06.30", moveIn: "2027년 3월 5일", fee: 38, parking: "총 980대(세대당 1.5대)", walk: 7, x: 498, y: 318, badges: ["추천"], tags: ["공원 조망", "드레스룸"] },
  { id: "b2", no: "21749", similar: 7, zone: "B", name: "□□파크아파트 203동", dong: "□□2동", kind: "apt", deal: "jeonse", price: 63000, area: 84.95, supply: 110.7, floor: 9, total: 25, rooms: 3, baths: 2, dir: "남서향", approved: "2015.06.30", moveIn: "2026년 12월 중순", fee: 29, parking: "총 980대(세대당 1.5대)", walk: 8, x: 592, y: 378, badges: ["급매"], tags: ["시스템 에어컨", "공원 앞"] },
  { id: "c1", no: "21740", similar: 15, zone: "C", name: "□□오피스텔 A동", dong: "□□동", kind: "officetel", deal: "monthly", price: 1000, rent: 68, area: 24.5, supply: 48.6, floor: 11, total: 15, rooms: 1, baths: 1, dir: "동향", approved: "2019.03.14", moveIn: "즉시입주", fee: 12, parking: "총 180대(세대당 0.6대)", walk: 2, x: 466, y: 160, badges: ["신규"], tags: ["가전 포함", "역 도보 2분"] },
  { id: "c2", no: "21467", similar: 11, zone: "C", name: "□□오피스텔 B동", dong: "□□동", kind: "officetel", deal: "jeonse", price: 21000, area: 33.1, supply: 62.3, floor: 8, total: 15, rooms: 2, baths: 1, dir: "남향", approved: "2019.03.14", moveIn: "2026년 11월 초순", fee: 15, parking: "총 180대(세대당 0.6대)", walk: 3, x: 548, y: 212, badges: [], tags: ["방 2개", "전세대출 가능"] },
  { id: "d1", no: "21390", similar: 16, zone: "D", name: "□□빌라", dong: "□□동", kind: "villa", deal: "sale", price: 29000, area: 49.6, supply: 62.1, floor: 3, total: 4, rooms: 2, baths: 1, dir: "남향", approved: "2019.08.02", moveIn: "즉시입주", fee: 5, feeNote: "수도·전기 사용료 별도", parking: "총 8대(세대당 1대)", walk: 8, x: 365, y: 345, badges: ["급매"], tags: ["엘리베이터", "초등학교 옆"] },
  { id: "e1", no: "20981", similar: 13, zone: "E", name: "□□하우스", dong: "□□동", kind: "villa", deal: "jeonse", price: 24000, area: 56.2, supply: 70.8, floor: 2, total: 5, rooms: 3, baths: 1, dir: "동남향", approved: "2012.04.25", moveIn: "2026년 12월 하순", fee: 6, feeNote: "수도·전기 사용료 별도", parking: "총 6대(세대당 0.6대)", walk: 12, x: 75, y: 220, badges: [], tags: ["방 3개", "전세보증보험 가입 가능"] },
  { id: "g1", no: "20746", similar: 12, zone: "G", name: "□□빌라 2차", dong: "□□2동", kind: "villa", deal: "monthly", price: 500, rent: 45, area: 36.4, supply: 46, floor: 4, total: 4, rooms: 1, baths: 1, dir: "서향", approved: "2004.10.11", moveIn: "즉시입주", fee: 4, feeNote: "수도 사용료 포함", parking: "주차 불가", walk: 14, x: 735, y: 330, badges: [], tags: ["원룸", "옥상 사용"] },
  { id: "f1", no: "21768", similar: 7, zone: "F", name: "□□시장 상가 1층", dong: "□□동", kind: "store", deal: "monthly", price: 3000, rent: 250, area: 43.2, supply: 66, floor: 1, total: 3, rooms: 0, baths: 1, dir: "남향", approved: "1998.05.18", moveIn: "즉시입주", fee: 18, parking: "공영 주차장 이용", walk: 9, x: 330, y: 482, badges: ["추천"], tags: ["1층 모퉁이", "무권리"] },
  { id: "f2", no: "20315", similar: 5, zone: "F", name: "□□프라자 2층", dong: "□□동", kind: "store", deal: "sale", price: 75000, area: 66.8, supply: 118, floor: 2, total: 5, rooms: 0, baths: 1, dir: "동향", approved: "2006.09.07", moveIn: "2027년 6월 하순", fee: 32, parking: "총 3대", walk: 10, x: 522, y: 482, badges: [], tags: ["임차인 승계", "학원 자리"] },
];

const LISTING_BY_ID = Object.fromEntries(LISTINGS.map((l) => [l.id, l])) as Record<string, Listing>;

/** 조건에 맞는 전체 매물 수. 대표 매물마다 같은 조건 매물 수를 더한다(전체 137건). */
const countOf = (list: Listing[]) => list.reduce((n, l) => n + l.similar, 0);

/** 만 원 단위 금액을 "9억 2,000만" 꼴로 */
function eokMan(man: number) {
  const e = Math.floor(man / 10000);
  const rest = man % 10000;
  if (!e) return `${rest.toLocaleString("ko-KR")}만`;
  return rest ? `${e}억 ${rest.toLocaleString("ko-KR")}만` : `${e}억`;
}

/** 만 원 단위 금액을 "9억 2,000만 원" 꼴로 */
function manText(man: number) {
  const e = Math.floor(man / 10000);
  const rest = Math.round(man % 10000);
  if (e && !rest) return `${e}억 원`;
  return `${e ? `${e}억 ` : ""}${rest.toLocaleString("ko-KR")}만 원`;
}

/** 실제 매물 사이트 관행: 매 9억 2,000만 / 전 4억 5,000만 / 보 1,000만 / 월 68만 */
function priceText(l: Pick<Listing, "deal" | "price" | "rent">) {
  if (l.deal === "monthly") return `보 ${eokMan(l.price)} / 월 ${l.rent}만`;
  return `${l.deal === "sale" ? "매" : "전"} ${eokMan(l.price)}`;
}

function shortPrice(l: Listing) {
  if (l.deal === "monthly") return `${l.price.toLocaleString("ko-KR")}/${l.rent}`;
  return l.price >= 10000 ? `${(l.price / 10000).toFixed(1).replace(/\.0$/, "")}억` : `${l.price.toLocaleString("ko-KR")}만`;
}

const PY = 3.3058;
const pyeong = (m2: number) => (m2 / PY).toFixed(1);
const areaText = (m2: number) => `${m2}㎡(${pyeong(m2)}평)`;

/* ---------- 중개보수 ---------- */

type Tier = { upTo: number; rate: number; cap?: number; label: string };

// 주택 매매·교환 상한 요율 (만 원 기준)
const SALE_TIERS: Tier[] = [
  { upTo: 5000, rate: 0.6, cap: 25, label: "5천만 원 미만" },
  { upTo: 20000, rate: 0.5, cap: 80, label: "5천만 원 이상 2억 원 미만" },
  { upTo: 90000, rate: 0.4, label: "2억 원 이상 9억 원 미만" },
  { upTo: 120000, rate: 0.5, label: "9억 원 이상 12억 원 미만" },
  { upTo: 150000, rate: 0.6, label: "12억 원 이상 15억 원 미만" },
  { upTo: Infinity, rate: 0.7, label: "15억 원 이상" },
];

// 주택 임대차 상한 요율
const RENT_TIERS: Tier[] = [
  { upTo: 5000, rate: 0.5, cap: 20, label: "5천만 원 미만" },
  { upTo: 10000, rate: 0.4, cap: 30, label: "5천만 원 이상 1억 원 미만" },
  { upTo: 60000, rate: 0.3, label: "1억 원 이상 6억 원 미만" },
  { upTo: 120000, rate: 0.4, label: "6억 원 이상 12억 원 미만" },
  { upTo: 150000, rate: 0.5, label: "12억 원 이상 15억 원 미만" },
  { upTo: Infinity, rate: 0.6, label: "15억 원 이상" },
];

interface Fee {
  basis: number;
  formula: string | null;
  rate: number;
  cap?: number;
  rule: string;
  won: number;
  negotiable: boolean;
}

type FeeInput = Pick<Listing, "kind" | "deal" | "price" | "rent">;

function brokerFee(l: FeeInput): Fee {
  let basis = l.price;
  let formula: string | null = null;
  if (l.deal === "monthly" && l.rent) {
    const by100 = l.price + l.rent * 100;
    const by70 = l.price + l.rent * 70;
    basis = by100 < 5000 ? by70 : by100;
    formula = `보증금 ${manText(l.price)} + 월세 ${l.rent}만 원 × ${by100 < 5000 ? 70 : 100}`;
  }
  const sale = l.deal === "sale";
  let rate: number;
  let cap: number | undefined;
  let rule: string;
  if (l.kind === "store") {
    rate = 0.9;
    rule = "주택 외 중개대상물";
  } else if (l.kind === "officetel") {
    rate = sale ? 0.5 : 0.4;
    rule = `주거용 오피스텔 ${sale ? "매매" : "임대차"}`;
  } else {
    const tier = (sale ? SALE_TIERS : RENT_TIERS).find((t) => basis < t.upTo)!;
    rate = tier.rate;
    cap = tier.cap;
    rule = `주택 ${sale ? "매매" : "임대차"} ${tier.label}`;
  }
  const raw = Math.round(basis * rate * 100);
  const won = cap ? Math.min(raw, cap * 10000) : raw;
  return { basis, formula, rate, cap, rule, won, negotiable: l.kind === "store" };
}

function wonText(won: number) {
  return won % 10000 === 0 ? `${(won / 10000).toLocaleString("ko-KR")}만 원` : `${won.toLocaleString("ko-KR")}원`;
}

/* ---------- 가리기 ---------- */

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘은 김ㅎ늘, 두 글자는 김* */
function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return chars.join("");
  if (chars.length === 2) return `${chars[0]}*`;
  const hide = (ch: string) => {
    const code = ch.charCodeAt(0) - 0xac00;
    return code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*";
  };
  return chars.map((ch, i) => (i === 0 || i === chars.length - 1 ? ch : hide(ch))).join("");
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/* ---------- 검색 조건 ---------- */

const PRICE_RANGES = [
  { label: "전체", min: 0, max: Infinity },
  { label: "1억 이하", min: 0, max: 10000 },
  { label: "1억 ~ 3억", min: 10000, max: 30000 },
  { label: "3억 ~ 6억", min: 30000, max: 60000 },
  { label: "6억 ~ 10억", min: 60000, max: 100000 },
  { label: "10억 초과", min: 100001, max: Infinity },
];

const AREA_RANGES = [
  { label: "전체", min: 0 },
  { label: "33㎡(10평) 이상", min: 33 },
  { label: "60㎡(18평) 이상", min: 60 },
  { label: "85㎡(26평) 이상", min: 85 },
];

const WALK_RANGES = [
  { label: "상관없음", max: 0 },
  { label: "5분 이내", max: 5 },
  { label: "10분 이내", max: 10 },
];

type Filter = { deal: Deal | "all"; kind: Kind | "all"; price: number; area: number; walk: number };
const EMPTY: Filter = { deal: "all", kind: "all", price: 0, area: 0, walk: 0 };

function matches(l: Listing, f: Filter) {
  const pr = PRICE_RANGES[f.price];
  const w = WALK_RANGES[f.walk].max;
  return (
    (f.deal === "all" || l.deal === f.deal) &&
    (f.kind === "all" || l.kind === f.kind) &&
    l.price >= pr.min &&
    l.price <= pr.max &&
    l.area >= AREA_RANGES[f.area].min &&
    (w === 0 || l.walk <= w)
  );
}

/* ---------- 페이지 ---------- */

const BASKET_MAX = 3;

type View = "search" | "request" | "tour" | "calc" | "about";

const NAV: { id: View; label: string }[] = [
  { id: "search", label: "매물검색" },
  { id: "request", label: "매물 의뢰하기" },
  { id: "tour", label: "매물투어신청" },
  { id: "calc", label: "부동산 계산기" },
  { id: "about", label: "사무소 소개" },
];

export function RealEstateDemo() {
  const [view, setView] = useState<View>("search");
  const [selectedId, setSelectedId] = useState("a2");
  const [basket, setBasket] = useState<string[]>([]);
  const [calcTab, setCalcTab] = useState<"fee" | "compare">("fee");
  const moved = useRef(false);

  const go = (v: View) => {
    moved.current = true;
    setView(v);
  };

  // 화면을 바꾸면 맨 위로 올리고 제목에 초점을 둔다
  useEffect(() => {
    if (!moved.current) return;
    window.scrollTo({ top: 0, behavior: "auto" });
    document.getElementById("realty-page-title")?.focus({ preventScroll: true });
  }, [view]);

  const toggleBasket = (id: string) =>
    setBasket((b) => (b.includes(id) ? b.filter((x) => x !== id) : b.length >= BASKET_MAX ? b : [...b, id]));

  return (
    <div className="min-h-screen overflow-x-clip text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.white, color: C.ink }}>
      <Header view={view} go={go} basketCount={basket.length} />
      <main>
        {view === "search" && (
          <SearchPage
            selectedId={selectedId}
            onSelect={setSelectedId}
            basket={basket}
            onToggle={toggleBasket}
            onTour={() => go("tour")}
            onCalc={() => {
              setCalcTab("fee");
              go("calc");
            }}
          />
        )}
        {view === "request" && (
          <SubPage title="매물 의뢰하기">
            <RequestForm />
          </SubPage>
        )}
        {view === "tour" && (
          <SubPage title="매물투어신청">
            <Tour selectedId={selectedId} basket={basket} onToggle={toggleBasket} onClear={() => setBasket([])} onMore={() => go("search")} />
          </SubPage>
        )}
        {view === "calc" && (
          <SubPage title="부동산 계산기">
            <Calculators tab={calcTab} setTab={setCalcTab} />
          </SubPage>
        )}
        {view === "about" && (
          <SubPage title="사무소 소개">
            <About />
          </SubPage>
        )}
      </main>
      <Footer />
    </div>
  );
}

/* ---------- 로고, 머리글 ---------- */

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
        <rect width="30" height="30" rx="6" fill={light ? "#fff" : C.ink} />
        <path d="M15 25 C15 25 7 17.5 7 12.5 A8 8 0 0 1 23 12.5 C23 17.5 15 25 15 25Z" fill={C.accent} />
        <path d="M11.5 13 L15 10 L18.5 13 V16.5 H11.5Z" fill="#fff" />
      </svg>
      <span className="text-[17px] font-bold tracking-[-0.02em] md:text-[19px]">{OFFICE}</span>
    </span>
  );
}

function Header({ view, go, basketCount }: { view: View; go: (v: View) => void; basketCount: number }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const pick = (v: View) => {
    setOpen(false);
    go(v);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white" style={{ borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-2 px-4 md:px-6">
        <button type="button" onClick={() => pick("search")} aria-label={`${OFFICE} 처음 화면`} className="min-w-0 text-left">
          <Logo />
        </button>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => {
              const on = view === n.id;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => pick(n.id)}
                    aria-current={on ? "page" : undefined}
                    className="h-10 rounded-[6px] px-3 text-[15px] font-semibold transition-colors hover:text-[#174a99]"
                    style={{ color: on ? C.ink : C.muted, boxShadow: on ? `inset 0 -2px 0 ${C.accent}` : undefined }}
                  >
                    {n.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => pick("tour")}
            aria-label={`관심매물 ${basketCount}개, 매물투어신청`}
            title="관심매물"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-[6px]"
          >
            <Heart size={21} fill={basketCount ? C.heart : "none"} style={{ color: basketCount ? C.heart : C.ink }} aria-hidden />
            {basketCount > 0 && (
              <span className="absolute right-0.5 top-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] font-bold tabular-nums" style={{ background: C.ink, color: "#fff" }} aria-hidden>
                {basketCount}
              </span>
            )}
          </button>
          <a href={`tel:${TEL}`} className="hidden h-10 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold xl:inline-flex" style={{ background: C.ink, color: "#fff" }}>
            <Phone size={16} aria-hidden />
            {TEL}
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] lg:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            aria-controls="realty-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="realty-menu"
            aria-label="주 메뉴"
            className="overflow-hidden border-t lg:hidden"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { height: 0 }}
            animate={{ height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <ul className="px-4 py-2">
              {NAV.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => pick(n.id)}
                    aria-current={view === n.id ? "page" : undefined}
                    className="flex h-12 w-full items-center text-left text-[17px]"
                    style={{ fontWeight: view === n.id ? 700 : 400 }}
                  >
                    {n.label}
                  </button>
                </li>
              ))}
              <li>
                <a href={`tel:${TEL}`} className="flex h-12 items-center text-[17px] font-semibold" style={{ color: C.accentText }}>
                  전화 {TEL}
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function SubPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 pb-20 md:px-6">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 py-6 md:py-8" style={{ borderColor: C.ink }}>
          <h1 id="realty-page-title" tabIndex={-1} className="text-[28px] font-bold tracking-[-0.03em] outline-none md:text-[32px]">
            {title}
          </h1>
          <p className="text-[14px]" style={{ color: C.muted }}>
            {OFFICE} · 중개사무소 등록번호 {REG_NO}
          </p>
        </div>
        <div className="pt-8">{children}</div>
      </div>
    </div>
  );
}

/* ---------- 매물검색 (첫 화면) ---------- */

const selectCls = "h-11 w-full rounded-[6px] border bg-white px-2.5 text-[15px] font-semibold outline-none focus:border-[#1e5bb8]";

function SearchPage({
  selectedId,
  onSelect,
  basket,
  onToggle,
  onTour,
  onCalc,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  basket: string[];
  onToggle: (id: string) => void;
  onTour: () => void;
  onCalc: () => void;
}) {
  const reduce = useReducedMotionSafe();
  const [draft, setDraft] = useState<Filter>(EMPTY);
  const [filter, setFilter] = useState<Filter>(EMPTY);
  const [tab, setTab] = useState<"map" | "list">("map");
  const [sort, setSort] = useState<"new" | "low" | "wide">("new");

  const visible = LISTINGS.filter((l) => matches(l, filter));
  const kindCount = (k: Kind) => countOf(LISTINGS.filter((l) => l.kind === k));
  const found = countOf(visible);
  const pages = Math.ceil(found / 12);

  const apply = (f: Filter) => {
    setDraft(f);
    setFilter(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter(draft);
    document.getElementById("realty-results")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const pickFromList = (id: string) => {
    onSelect(id);
    window.requestAnimationFrame(() => document.getElementById("realty-detail")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };

  const sorted = [...visible].sort((a, b) => (sort === "low" ? a.price + (a.rent ?? 0) * 100 - (b.price + (b.rent ?? 0) * 100) : sort === "wide" ? b.area - a.area : b.no.localeCompare(a.no)));

  return (
    <>
      <section aria-labelledby="realty-page-title" className="border-b px-4 pb-5 pt-6 md:px-6 md:pb-6 md:pt-7" style={{ background: C.gray, borderColor: C.line }}>
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h1 id="realty-page-title" tabIndex={-1} className="text-[24px] font-bold tracking-[-0.03em] outline-none md:text-[28px]">
              □□동 매물검색
            </h1>
            <p className="text-[14px]" style={{ color: C.muted }}>
              평일 09:30 ~ 19:00, 토요일 10:00 ~ 17:00
            </p>
          </div>

          <form id="realty-search" onSubmit={submit} className="mt-4 rounded-[4px] border bg-white p-3 md:p-4" style={{ borderColor: C.line }} aria-label="매물 검색 조건">
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 md:grid-cols-4 lg:grid-cols-[auto_1fr_1fr_1fr_1fr_auto]">
              <fieldset className="col-span-2 min-w-0 md:col-span-4 lg:col-span-1">
                <legend className="mb-1 text-[13px] font-semibold" style={{ color: C.muted }}>
                  거래유형
                </legend>
                <div className="flex overflow-hidden rounded-[6px] border" style={{ borderColor: C.line }}>
                  {(["all", "sale", "jeonse", "monthly"] as const).map((d) => {
                    const on = draft.deal === d;
                    return (
                      <label key={d} className="flex h-11 flex-1 cursor-pointer items-center justify-center border-l px-3 text-[15px] font-semibold first:border-l-0 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2" style={{ borderColor: C.line, ...(on ? { background: C.accent, color: "#fff" } : {}) }}>
                        <input type="radio" name="realty-deal" value={d} checked={on} onChange={() => setDraft({ ...draft, deal: d })} className="sr-only" />
                        {d === "all" ? "전체" : DEAL_LABEL[d]}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <label className="block min-w-0">
                <span className="mb-1 block text-[13px] font-semibold" style={{ color: C.muted }}>
                  매물 종류
                </span>
                <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as Filter["kind"] })} className={selectCls} style={{ borderColor: C.line }}>
                  <option value="all">전체</option>
                  {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                    <option key={k} value={k}>
                      {KIND_LABEL[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block text-[13px] font-semibold" style={{ color: C.muted }}>
                  매매가·보증금
                </span>
                <select value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} className={selectCls} style={{ borderColor: C.line }}>
                  {PRICE_RANGES.map((p, i) => (
                    <option key={p.label} value={i}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block text-[13px] font-semibold" style={{ color: C.muted }}>
                  전용면적
                </span>
                <select value={draft.area} onChange={(e) => setDraft({ ...draft, area: Number(e.target.value) })} className={selectCls} style={{ borderColor: C.line }}>
                  {AREA_RANGES.map((a, i) => (
                    <option key={a.label} value={i}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-0">
                <span className="mb-1 block text-[13px] font-semibold" style={{ color: C.muted }}>
                  역까지 도보
                </span>
                <select value={draft.walk} onChange={(e) => setDraft({ ...draft, walk: Number(e.target.value) })} className={selectCls} style={{ borderColor: C.line }}>
                  {WALK_RANGES.map((w, i) => (
                    <option key={w.label} value={i}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="col-span-2 flex items-end gap-2 md:col-span-4 lg:col-span-1">
                <button type="button" onClick={() => apply(EMPTY)} aria-label="초기화" title="초기화" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] border" style={{ borderColor: C.line }}>
                  <RotateCcw size={18} aria-hidden />
                </button>
                <button type="submit" className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[6px] px-5 text-[16px] font-bold lg:flex-none" style={{ background: C.accent, color: "#fff" }}>
                  <Search size={18} aria-hidden />
                  매물검색
                </button>
              </div>
            </div>
          </form>

          <ul className="mt-3 flex flex-wrap items-center text-[15px]" aria-label="매물 종류별 매물 수">
            {([["all", "전체"], ...(Object.keys(KIND_LABEL) as Kind[]).map((k) => [k, KIND_LABEL[k]])] as [Filter["kind"], string][]).map(([k, label], i) => {
              const on = filter.kind === k;
              return (
                <li key={k} className="flex items-center">
                  {i > 0 && <span className="mx-1 h-3 w-px" style={{ background: "#c4c9cf" }} aria-hidden />}
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => apply({ ...filter, kind: k })}
                    className="inline-flex h-10 items-center gap-1 px-2 underline-offset-4 hover:underline"
                    style={{ color: on ? C.ink : C.muted, fontWeight: on ? 700 : 400 }}
                  >
                    {label}
                    <span className="tabular-nums" style={{ color: on ? C.accentText : C.muted }}>
                      {k === "all" ? countOf(LISTINGS) : kindCount(k)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section id="realty-results" aria-label="검색 결과" className="scroll-mt-16 px-4 pb-16 pt-5 md:px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b" style={{ borderColor: C.line }}>
            <div role="tablist" aria-label="검색 방식" className="flex">
              {(
                [
                  { id: "map", label: "지도검색", icon: MapIcon },
                  { id: "list", label: "목록검색", icon: LayoutGrid },
                ] as const
              ).map((t) => {
                const on = tab === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    id={`realty-tab-${t.id}`}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls={`realty-panel-${t.id}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setTab(t.id)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                        const next = t.id === "map" ? "list" : "map";
                        setTab(next);
                        document.getElementById(`realty-tab-${next}`)?.focus();
                      }
                    }}
                    className="-mb-px inline-flex h-12 items-center gap-1.5 border-b-2 px-4 text-[16px] font-bold"
                    style={{ borderColor: on ? C.accent : "transparent", color: on ? C.ink : C.muted }}
                  >
                    <Icon size={18} aria-hidden />
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3 pb-2">
              <p className="text-[15px]" aria-live="polite">
                검색 결과 <span className="font-bold tabular-nums" style={{ color: C.accentText }}>{found}</span>건
              </p>
              {tab === "list" && (
                <label className="flex items-center gap-1.5">
                  <span className="sr-only">정렬</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-10 rounded-[6px] border bg-white px-2 text-[14px] font-semibold" style={{ borderColor: C.line }}>
                    <option value="new">최신순</option>
                    <option value="low">낮은 가격순</option>
                    <option value="wide">넓은 면적순</option>
                  </select>
                </label>
              )}
            </div>
          </div>

          <div className="mt-4">
            {tab === "map" ? (
              <div id="realty-panel-map" role="tabpanel" aria-labelledby="realty-tab-map">
                <MapSearch visible={visible} selectedId={selectedId} onSelect={onSelect} basket={basket} onToggle={onToggle} onReset={() => apply(EMPTY)} />
              </div>
            ) : (
              <div id="realty-panel-list" role="tabpanel" aria-labelledby="realty-tab-list">
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sorted.map((l) => (
                    <ListingCard key={l.id} l={l} selected={l.id === selectedId} saved={basket.includes(l.id)} full={!basket.includes(l.id) && basket.length >= BASKET_MAX} onPick={() => pickFromList(l.id)} onToggle={() => onToggle(l.id)} />
                  ))}
                </ul>
                {visible.length === 0 && <Empty onReset={() => apply(EMPTY)} />}
                {pages > 1 && (
                  <p className="mt-6 flex justify-center gap-1 text-[15px] tabular-nums" aria-label="쪽 번호">
                    {Array.from({ length: Math.min(pages, 10) }, (_, i) => (
                      <span
                        key={i}
                        aria-current={i === 0 ? "page" : undefined}
                        className="inline-flex h-9 min-w-9 items-center justify-center rounded-[4px] border px-1"
                        style={i === 0 ? { background: C.accent, borderColor: C.accent, color: "#fff", fontWeight: 700 } : { borderColor: C.line, color: C.muted }}
                      >
                        {i + 1}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            )}
          </div>

          <Detail listing={LISTING_BY_ID[selectedId]} basket={basket} onToggle={onToggle} onTour={onTour} onCalc={onCalc} />
        </div>
      </section>
    </>
  );
}

function Empty({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-[6px] p-6 text-center" style={{ background: C.gray, color: C.muted }}>
      조건에 맞는 매물이 없습니다.
      <button type="button" onClick={onReset} className="mt-2 block w-full font-semibold underline underline-offset-4" style={{ color: C.ink }}>
        초기화
      </button>
    </div>
  );
}

function BadgeList({ badges }: { badges: Badge[] }) {
  if (!badges.length) return null;
  return (
    <>
      {badges.map((b) => (
        <span
          key={b}
          className="rounded-[3px] px-1.5 text-[12px] font-bold leading-[20px]"
          style={b === "급매" ? { background: C.urgent, color: "#fff" } : b === "추천" ? { border: `1px solid ${C.ink}`, color: C.ink } : { border: `1px solid ${C.accent}`, color: C.accentText }}
        >
          {b}
        </span>
      ))}
    </>
  );
}

function HeartButton({ saved, full, name, onToggle, className = "" }: { saved: boolean; full: boolean; name: string; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={full}
      aria-pressed={saved}
      aria-label={saved ? `${name} 관심매물 해제` : `${name} 관심매물 담기`}
      title={full ? `관심매물은 ${BASKET_MAX}개까지 담을 수 있습니다` : saved ? "관심매물 해제" : "관심매물 담기"}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors disabled:opacity-35 ${className}`}
    >
      <Heart size={22} fill={saved ? C.heart : "none"} style={{ color: saved ? C.heart : C.muted }} aria-hidden />
    </button>
  );
}

function ListingCard({ l, selected, saved, full, onPick, onToggle }: { l: Listing; selected: boolean; saved: boolean; full: boolean; onPick: () => void; onToggle: () => void }) {
  return (
    <li className="relative">
      <button
        type="button"
        aria-pressed={selected}
        onClick={onPick}
        className="block h-full w-full rounded-[6px] border bg-white p-4 pr-14 text-left transition-colors hover:border-[#222529]"
        style={{ borderColor: selected ? C.ink : C.line, boxShadow: selected ? `inset 0 0 0 1px ${C.ink}` : undefined }}
      >
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] tabular-nums" style={{ color: C.muted }}>
            매물번호 {l.no}
          </span>
          <BadgeList badges={l.badges} />
        </span>
        <span className="mt-1 block text-[20px] font-bold tabular-nums tracking-[-0.02em]">{priceText(l)}</span>
        <span className="block font-semibold">
          {l.name} {l.floor}층
        </span>
        <span className="mt-1 block text-[14px] leading-[1.6]" style={{ color: C.muted }}>
          {l.dong} · {KIND_LABEL[l.kind]}
          <br />
          전용 {areaText(l.area)}
          <br />
          {l.kind === "store" ? `화장실 ${l.baths}개` : `방 ${l.rooms}개 / 욕실 ${l.baths}개`} · {l.dir}
        </span>
      </button>
      <HeartButton saved={saved} full={full} name={l.name} onToggle={onToggle} className="absolute right-2 top-2" />
    </li>
  );
}

/* ---------- 지도검색 ---------- */

function NeighborhoodMap() {
  // 단지 안 동 건물. 좌표는 정수로 둔다.
  const blocks = (x0: number, y0: number, cols: number, rows: number, w: number, h: number, gx: number, gy: number, fill: string) =>
    Array.from({ length: cols * rows }, (_, i) => (
      <rect key={`${x0}-${y0}-${i}`} x={x0 + (i % cols) * gx} y={y0 + Math.floor(i / cols) * gy} width={w} height={h} fill={fill} />
    ));

  const road = (d: string, w: number, main = false) => (
    <g key={d}>
      <path d={d} stroke={main ? MAP.mainEdge : MAP.roadEdge} strokeWidth={w + 2} fill="none" />
      <path d={d} stroke={main ? MAP.main : MAP.road} strokeWidth={w} fill="none" />
    </g>
  );

  const label = (x: number, y: number, text: string, size = 12, opts: { fill?: string; bold?: boolean; rotate?: number } = {}) => (
    <text
      x={x}
      y={y}
      fontSize={size}
      fill={opts.fill ?? MAP.label}
      fontWeight={opts.bold ? 700 : 400}
      textAnchor="middle"
      stroke={MAP.halo}
      strokeWidth="3"
      paintOrder="stroke"
      transform={opts.rotate ? `rotate(${opts.rotate} ${x} ${y})` : undefined}
    >
      {text}
    </text>
  );

  return (
    <svg viewBox="0 0 800 520" className="absolute inset-0 h-full w-full" aria-hidden>
      <rect width="800" height="520" fill={MAP.ground} />
      <path d="M0 30 C160 18 300 44 420 31 S660 16 800 33" stroke={MAP.water} strokeWidth="22" fill="none" />

      {/* 블록 */}
      <rect x="160" y="100" width="250" height="152" fill={MAP.apt} />
      {blocks(176, 122, 3, 2, 56, 22, 76, 68, MAP.aptBuilding)}
      <rect x="430" y="100" width="142" height="152" fill={MAP.block} />
      <rect x="446" y="124" width="44" height="74" fill={MAP.building} />
      <rect x="512" y="146" width="44" height="74" fill={MAP.building} />
      <rect x="580" y="100" width="72" height="152" fill={MAP.park} />
      <rect x="160" y="270" width="146" height="152" fill={MAP.school} />
      <rect x="176" y="296" width="72" height="96" rx="34" fill="none" stroke="#ddd0a6" strokeWidth="2" />
      <rect x="262" y="286" width="30" height="112" fill="#e6dbb8" />
      <rect x="318" y="270" width="92" height="152" fill={MAP.block} />
      {blocks(328, 284, 2, 4, 30, 26, 40, 34, MAP.building)}
      <rect x="430" y="270" width="222" height="152" fill={MAP.apt} />
      {blocks(446, 292, 3, 2, 52, 22, 70, 64, MAP.aptBuilding)}
      <rect x="10" y="100" width="134" height="322" fill={MAP.block} />
      {blocks(20, 110, 3, 8, 30, 28, 42, 39, MAP.building)}
      <rect x="668" y="100" width="132" height="322" fill={MAP.block} />
      {blocks(678, 110, 3, 8, 30, 28, 40, 39, MAP.building)}
      <rect x="160" y="440" width="492" height="80" fill={MAP.block} />
      {blocks(170, 450, 11, 1, 36, 44, 44, 0, MAP.building)}

      {/* 길 */}
      {road("M0 88 H800", 10)}
      {road("M0 432 H800", 10)}
      {road("M150 0 V520", 10)}
      {road("M660 0 V520", 10)}
      {road("M0 262 H800", 22, true)}
      {road("M420 0 V520", 18, true)}

      {/* 도로명 */}
      {label(90, 266, "□□대로", 12, { bold: true })}
      {label(740, 266, "□□대로", 12, { bold: true })}
      {label(424, 400, "□□로", 12, { bold: true, rotate: -90 })}
      {label(424, 140, "□□로", 12, { bold: true, rotate: -90 })}
      {label(560, 92, "□□로12길", 11)}
      {label(560, 436, "□□로8길", 11)}
      {label(154, 360, "□□로3길", 11, { rotate: -90 })}
      {label(664, 180, "□□로21길", 11, { rotate: -90 })}
      {label(60, 22, "□□천", 12, { fill: "#4f7da6" })}

      {/* 시설 이름 */}
      {label(285, 116, "□□아파트", 12)}
      {label(501, 116, "□□오피스텔", 12)}
      {label(616, 180, "□□근린공원", 11, { fill: "#4b7a43" })}
      {label(233, 414, "□□초등학교", 12, { fill: "#7d6d3f" })}
      {label(541, 414, "□□파크아파트", 12)}
      {label(300, 512, "□□시장", 11)}

      {/* 역 */}
      <circle cx="392" cy="246" r="8" fill="#3a9a46" stroke="#fff" strokeWidth="2" />
      {label(392, 234, "□□역", 13, { bold: true, fill: MAP.label })}

      {/* 축척 */}
      <g transform="translate(16 494)">
        <path d="M0 0 V6 H60 V0" stroke={MAP.label} strokeWidth="1.5" fill="none" />
        <text x="66" y="7" fontSize="11" fill={MAP.label}>
          100m
        </text>
      </g>
    </svg>
  );
}

function PinShape({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 28 36" className="h-[31px] w-6 md:h-9 md:w-7" aria-hidden>
      <path d="M14 35 C14 35 2 21.5 2 13 A12 12 0 0 1 26 13 C26 21.5 14 35 14 35Z" fill={active ? C.urgent : C.accent} stroke="#fff" strokeWidth="2" />
      <circle cx="14" cy="13" r="4.5" fill="#fff" />
    </svg>
  );
}

function MapSearch({
  visible,
  selectedId,
  onSelect,
  basket,
  onToggle,
  onReset,
}: {
  visible: Listing[];
  selectedId: string;
  onSelect: (id: string) => void;
  basket: string[];
  onToggle: (id: string) => void;
  onReset: () => void;
}) {
  const reduce = useReducedMotionSafe();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [grouped, setGrouped] = useState(true);
  const [openZone, setOpenZone] = useState<ZoneId | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const activeId = hoverId ?? selectedId;
  const activeZone = LISTING_BY_ID[activeId]?.zone;

  const byZone = new Map<ZoneId, Listing[]>();
  visible.forEach((l) => byZone.set(l.zone, [...(byZone.get(l.zone) ?? []), l]));
  const clusters: { zone: ZoneId; items: Listing[] }[] = [];
  const pins: Listing[] = [];
  byZone.forEach((items, zone) => {
    if (grouped && items.length > 1 && openZone !== zone && activeZone !== zone) clusters.push({ zone, items });
    else pins.push(...items);
  });

  const pickFromMap = (id: string) => {
    onSelect(id);
    const list = listRef.current;
    const item = itemRefs.current[id];
    if (list && item && list.scrollHeight > list.clientHeight) {
      list.scrollTo({ top: item.offsetTop - 8, behavior: reduce ? "auto" : "smooth" });
    }
  };

  return (
    <div id="realty-map" className="grid items-start gap-4 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0 overflow-hidden rounded-[6px] border bg-white" style={{ borderColor: C.line }}>
        <div className="flex items-center justify-between gap-2 border-b px-3 py-2" style={{ borderColor: C.line }}>
          <p className="text-[14px] font-semibold" style={{ color: C.muted }}>
            □□역 주변
          </p>
          <button
            type="button"
            aria-pressed={grouped}
            onClick={() => {
              setGrouped((v) => !v);
              setOpenZone(null);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-[6px] border px-3 text-[14px] font-semibold"
            style={grouped ? { borderColor: C.ink } : { borderColor: C.line, color: C.muted }}
          >
            <Layers size={16} aria-hidden />
            단지별 묶기
          </button>
        </div>
        <div className="relative w-full" style={{ aspectRatio: "800 / 520" }}>
          <NeighborhoodMap />
          <div className="absolute inset-0" onClick={() => setOpenZone(null)} aria-hidden />
          {clusters.map(({ zone, items }) => {
            const z = ZONES[zone];
            return (
              <motion.button
                key={`z-${zone}`}
                type="button"
                onClick={() => setOpenZone(zone)}
                aria-label={`${z.name} 매물 ${countOf(items)}건 펼치기`}
                className="absolute z-10 flex flex-col items-center"
                style={{ left: `${r2(z.x / 8)}%`, top: `${r2(z.y / 5.2)}%`, x: "-50%", y: "-50%" }}
                initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <span
                  className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border-2 px-1.5 text-[14px] font-bold tabular-nums md:h-10 md:min-w-10 md:text-[15px]"
                  style={{ background: C.accent, borderColor: "#fff", color: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}
                >
                  {countOf(items)}
                </span>
                <span className="mt-0.5 hidden whitespace-nowrap rounded-[4px] bg-white px-1.5 text-[12px] font-semibold md:block">{z.name}</span>
              </motion.button>
            );
          })}
          {pins.map((l) => {
            const active = l.id === activeId;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => pickFromMap(l.id)}
                onMouseEnter={() => setHoverId(l.id)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(l.id)}
                onBlur={() => setHoverId(null)}
                aria-label={`${l.name}, ${priceText(l)}`}
                aria-pressed={l.id === selectedId}
                className="absolute flex h-11 w-10 items-end justify-center"
                style={{ left: `${r2(l.x / 8)}%`, top: `${r2(l.y / 5.2)}%`, transform: "translate(-50%, -100%)", zIndex: active ? 30 : 20 }}
              >
                <span
                  className={`absolute bottom-full mb-0.5 whitespace-nowrap rounded-[4px] px-1.5 py-0.5 text-[12px] font-bold tabular-nums shadow-sm ${active ? "block" : "hidden lg:block"}`}
                  style={active ? { background: C.ink, color: "#fff" } : { background: "#fff", color: C.ink }}
                >
                  {shortPrice(l)}
                </span>
                <motion.span
                  className="block"
                  style={{ transformOrigin: "50% 100%" }}
                  initial={false}
                  animate={{ scale: active ? 1.25 : 1 }}
                  transition={{ duration: reduce ? 0 : 0.2, ease: EASE }}
                >
                  <PinShape active={active} />
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>

      <ul ref={listRef} className="relative space-y-2 lg:max-h-[600px] lg:overflow-y-auto lg:pr-1" aria-label="지도 매물 목록">
        {visible.map((l) => {
          const selected = l.id === selectedId;
          const active = l.id === activeId;
          const saved = basket.includes(l.id);
          const full = !saved && basket.length >= BASKET_MAX;
          return (
            <li
              key={l.id}
              ref={(el) => {
                itemRefs.current[l.id] = el;
              }}
              className="relative"
            >
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(l.id)}
                onMouseEnter={() => setHoverId(l.id)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(l.id)}
                onBlur={() => setHoverId(null)}
                className="block w-full rounded-[6px] border bg-white py-3 pl-4 pr-14 text-left transition-colors"
                style={{ borderColor: selected ? C.ink : active ? C.accent : C.line, boxShadow: selected ? `inset 0 0 0 1px ${C.ink}` : "none" }}
              >
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[12px] tabular-nums" style={{ color: C.muted }}>
                    {l.no}
                  </span>
                  <BadgeList badges={l.badges} />
                </span>
                <span className="block text-[18px] font-bold tabular-nums tracking-[-0.02em]">{priceText(l)}</span>
                <span className="block font-semibold">
                  {l.name}
                  {l.similar > 1 && (
                    <span className="ml-1.5 text-[14px] font-normal" style={{ color: C.muted }}>
                      외 {l.similar - 1}건
                    </span>
                  )}
                </span>
                <span className="block text-[14px]" style={{ color: C.muted }}>
                  전용 {areaText(l.area)} · {l.floor}/{l.total}층 · 역 도보 {l.walk}분
                </span>
              </button>
              <HeartButton saved={saved} full={full} name={l.name} onToggle={() => onToggle(l.id)} className="absolute right-2 top-1/2 -translate-y-1/2" />
            </li>
          );
        })}
        {visible.length === 0 && (
          <li>
            <Empty onReset={onReset} />
          </li>
        )}
      </ul>
    </div>
  );
}

/* ---------- 매물 상세 ---------- */

function StorePlan() {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label="출입문과 화장실 위치를 표시한 상가 평면도">
      <rect width="400" height="300" fill={C.gray} />
      <rect x="40" y="40" width="320" height="220" fill="#fff" stroke={C.ink} strokeWidth="4" />
      <rect x="290" y="40" width="70" height="60" fill={C.grayDeep} stroke={C.ink} strokeWidth="2" />
      <text x="325" y="76" fontSize="13" fill={C.muted} textAnchor="middle">
        화장실
      </text>
      <path d="M120 260 H200" stroke="#fff" strokeWidth="6" />
      <path d="M120 260 A80 80 0 0 1 200 180" stroke={C.muted} strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
      <text x="160" y="284" fontSize="13" fill={C.muted} textAnchor="middle">
        출입문
      </text>
      <text x="170" y="150" fontSize="15" fill={C.ink} textAnchor="middle" fontWeight={700}>
        통으로 쓰는 공간
      </text>
    </svg>
  );
}

function Detail({ listing: l, basket, onToggle, onTour, onCalc }: { listing: Listing; basket: string[]; onToggle: (id: string) => void; onTour: () => void; onCalc: () => void }) {
  const reduce = useReducedMotionSafe();
  const fee = brokerFee(l);
  const saved = basket.includes(l.id);
  const full = !saved && basket.length >= BASKET_MAX;

  // 중개대상물 표시·광고 명시사항 순서
  const rows: [string, string][] = [
    ["매물번호", l.no],
    ["소재지", `□□시 □□구 ${l.dong} ${l.name}`],
    ["면적", `전용 ${areaText(l.area)} / 공급 ${areaText(l.supply)}`],
    ["가격", priceText(l)],
    ["거래형태", DEAL_LABEL[l.deal]],
    ["해당층/총층", `${l.floor}층 / ${l.total}층`],
    ["사용승인일", l.approved],
    ["방향", `${l.dir} (${l.kind === "store" ? "주 출입구" : "거실"} 기준)`],
    [l.kind === "store" ? "화장실" : "방·욕실 수", l.kind === "store" ? `${l.baths}개` : `방 ${l.rooms}개 / 욕실 ${l.baths}개`],
    ["입주가능일", l.moveIn],
    ["주차대수", l.parking],
    ["관리비", `월 ${l.fee}만 원${l.feeNote ? ` (${l.feeNote})` : ""}`],
  ];

  return (
    <div id="realty-detail" className="mt-8 scroll-mt-20" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={l.id}
          aria-labelledby="detail-title"
          className="grid overflow-hidden rounded-[6px] border bg-white lg:grid-cols-[0.8fr_1.2fr]"
          style={{ borderColor: C.line }}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-full">
            {l.kind === "store" ? (
              <StorePlan />
            ) : (
              <Image src={`${IMG}/interior.jpg`} alt="햇빛이 드는 비어 있는 아파트 거실" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            )}
          </div>

          <div className="p-5 md:p-7">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-1.5 text-[14px]" style={{ color: C.muted }}>
                  {KIND_LABEL[l.kind]} {DEAL_LABEL[l.deal]}
                  <BadgeList badges={l.badges} />
                </p>
                <h2 id="detail-title" className="text-[22px] font-bold tracking-[-0.02em] md:text-[26px]">
                  {l.name}
                </h2>
                <p className="text-[26px] font-bold tabular-nums tracking-[-0.02em] md:text-[30px]" style={{ color: C.accentText }}>
                  {priceText(l)}
                </p>
              </div>
              <HeartButton saved={saved} full={full} name={l.name} onToggle={() => onToggle(l.id)} className="shrink-0 border border-[#dfe4ea]" />
            </div>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {[...l.tags, `□□역 도보 ${l.walk}분`].map((t) => (
                <li key={t} className="rounded-[4px] px-2 py-0.5 text-[14px]" style={{ background: C.gray }}>
                  {t}
                </li>
              ))}
            </ul>

            <dl className="mt-5 grid text-[15px] sm:grid-cols-2 sm:gap-x-6" aria-label="중개대상물 표시사항">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-t py-2" style={{ borderColor: C.line }}>
                  <dt className="shrink-0" style={{ color: C.muted }}>
                    {k}
                  </dt>
                  <dd className="text-right font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>

            <div id="realty-fee" className="mt-6 border-t-2 pt-3" style={{ borderColor: C.ink }}>
              <div className="flex flex-wrap items-center justify-between gap-x-3">
                <h3 className="font-bold">중개보수</h3>
                <button type="button" onClick={onCalc} className="inline-flex h-9 items-center gap-0.5 text-[14px] font-semibold" style={{ color: C.accentText }}>
                  중개보수 계산기
                  <ChevronRight size={16} aria-hidden />
                </button>
              </div>
              <FeeLines fee={fee} />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onToggle(l.id)}
                disabled={full}
                aria-pressed={saved}
                className="inline-flex h-12 items-center gap-2 rounded-[6px] border px-5 font-semibold disabled:opacity-40"
                style={saved ? { background: "#fff", borderColor: C.ink, color: C.ink } : { background: C.ink, borderColor: C.ink, color: "#fff" }}
              >
                <Heart size={18} fill={saved ? C.heart : "none"} style={{ color: saved ? C.heart : "#fff" }} aria-hidden />
                {saved ? "관심매물 해제" : "관심매물 담기"}
              </button>
              <button type="button" onClick={onTour} className="inline-flex h-12 items-center rounded-[6px] px-5 font-semibold" style={{ background: C.accent, color: "#fff" }}>
                매물투어신청
              </button>
              <a href={`tel:${TEL}`} aria-label={`전화 문의 ${TEL}`} title="전화 문의" className="inline-flex h-12 w-12 items-center justify-center rounded-[6px] border" style={{ borderColor: C.line }}>
                <Phone size={18} aria-hidden />
              </a>
            </div>
            <p className="mt-2 min-h-[22px] text-[14px]" style={{ color: C.muted }}>
              {saved ? `관심매물에 담았습니다 (${basket.length}/${BASKET_MAX})` : full ? `관심매물은 ${BASKET_MAX}개까지 담을 수 있습니다.` : ""}
            </p>
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}

function FeeLines({ fee }: { fee: Fee }) {
  return (
    <>
      <dl className="mt-2 space-y-1.5 text-[15px]">
        <div className="flex flex-wrap justify-between gap-x-3">
          <dt style={{ color: C.muted }}>거래금액</dt>
          <dd className="text-right font-semibold tabular-nums">
            {fee.formula && (
              <span className="block text-[13px] font-normal" style={{ color: C.muted }}>
                {fee.formula}
              </span>
            )}
            {manText(fee.basis)}
          </dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-3">
          <dt style={{ color: C.muted }}>상한 요율</dt>
          <dd className="text-right font-semibold">
            {fee.rate}%{fee.cap ? `, 한도 ${fee.cap}만 원` : ""}
            <span className="block text-[13px] font-normal" style={{ color: C.muted }}>
              {fee.rule}
            </span>
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-x-3 border-t pt-2" style={{ borderColor: C.line }}>
          <dt className="font-semibold">{fee.negotiable ? "최대" : "상한 금액"}</dt>
          <dd className="text-[22px] font-bold tabular-nums">{wonText(fee.won)}</dd>
        </div>
      </dl>
      <p className="mt-1 text-[13px]" style={{ color: C.muted }}>
        부가가치세 별도{fee.negotiable ? ". 주택 외 중개대상물은 0.9% 안에서 협의해 정합니다." : ""}
      </p>
    </>
  );
}

/* ---------- 부동산 계산기 ---------- */

function Calculators({ tab, setTab }: { tab: "fee" | "compare"; setTab: (t: "fee" | "compare") => void }) {
  const tabs = [
    { id: "fee" as const, label: "중개보수 계산" },
    { id: "compare" as const, label: "전월세 비교" },
  ];
  return (
    <>
      <div role="tablist" aria-label="계산기 종류" className="inline-flex rounded-[8px] p-1" style={{ background: C.gray }}>
        {tabs.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              id={`calc-tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`calc-panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  const next = t.id === "fee" ? "compare" : "fee";
                  setTab(next);
                  document.getElementById(`calc-tab-${next}`)?.focus();
                }
              }}
              className="h-11 rounded-[6px] px-4 text-[15px] font-bold"
              style={on ? { background: "#fff", color: C.ink, boxShadow: "0 1px 2px rgba(24,32,42,0.12)" } : { color: C.muted }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div id={`calc-panel-${tab}`} role="tabpanel" aria-labelledby={`calc-tab-${tab}`} className="mt-6">
        {tab === "fee" ? <FeeCalculator /> : <Compare />}
      </div>
    </>
  );
}

function Radios<T extends string>({ legend, name, value, options, onPick }: { legend: string; name: string; value: T; options: { v: T; label: string }[]; onPick: (v: T) => void }) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-[15px] font-bold">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value === o.v;
          return (
            <label
              key={o.v}
              className="flex h-11 cursor-pointer items-center rounded-[6px] border px-3.5 text-[15px] font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2"
              style={on ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line }}
            >
              <input type="radio" name={name} value={o.v} checked={on} onChange={() => onPick(o.v)} className="sr-only" />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function ManInput({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label htmlFor={id} className="text-[15px] font-bold">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          step={100}
          value={value || ""}
          onChange={(e) => onChange(Math.max(0, Math.round(Number(e.target.value) || 0)))}
          className="h-12 w-full rounded-[6px] border bg-white pl-3 pr-12 text-right text-[17px] font-semibold tabular-nums outline-none focus:border-[#18202a]"
          style={{ borderColor: C.line }}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[15px]" style={{ color: C.muted }}>
          만 원
        </span>
      </div>
      <p className="mt-1 text-right text-[13px] tabular-nums" style={{ color: C.muted }}>
        {value ? manText(value) : " "}
      </p>
    </div>
  );
}

function FeeCalculator() {
  const [kind, setKind] = useState<"apt" | "officetel" | "store">("apt");
  const [deal, setDeal] = useState<Deal>("sale");
  const [price, setPrice] = useState(50000);
  const [rent, setRent] = useState(100);
  const fee = brokerFee({ kind, deal, price, rent: deal === "monthly" ? rent : undefined });

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6 rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line }}>
        <Radios
          legend="중개대상물"
          name="fee-kind"
          value={kind}
          onPick={setKind}
          options={[
            { v: "apt", label: "주택" },
            { v: "officetel", label: "오피스텔(주거용)" },
            { v: "store", label: "주택 외(상가·토지 등)" },
          ]}
        />
        <Radios
          legend="거래 종류"
          name="fee-deal"
          value={deal}
          onPick={setDeal}
          options={[
            { v: "sale", label: "매매·교환" },
            { v: "jeonse", label: "전세" },
            { v: "monthly", label: "월세" },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ManInput id="fee-price" label={deal === "sale" ? "매매가" : "보증금"} value={price} onChange={setPrice} />
          {deal === "monthly" && <ManInput id="fee-rent" label="월세" value={rent} onChange={setRent} />}
        </div>
      </div>
      <div className="rounded-[6px] p-5 md:p-6" style={{ background: C.gray }} aria-live="polite">
        <h2 className="font-bold">중개보수 상한</h2>
        <FeeLines fee={fee} />
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[15px]" style={{ color: C.muted }}>
          {label}
        </span>
        <span className="font-bold tabular-nums">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-valuetext={format(value)} className="mt-1 h-8 w-full accent-[#1e5bb8]" />
    </label>
  );
}

const PART_COLOR = { loan: "#46566a", opp: "#a9b4c2", rent: C.accent };
const PART_LABEL = { loan: "대출 이자", opp: "예금 이자 손실", rent: "월세" };

function Compare() {
  const reduce = useReducedMotionSafe();
  const [jeonse, setJeonse] = useState(32000);
  const [deposit, setDeposit] = useState(5000);
  const [rent, setRent] = useState(95);
  const [cash, setCash] = useState(10000);
  const [loanRate, setLoanRate] = useState(4);
  const [saveRate, setSaveRate] = useState(3);

  const monthly = (man: number, rate: number) => (man * rate) / 100 / 12;
  const j = { loan: monthly(Math.max(0, jeonse - cash), loanRate), opp: monthly(Math.min(cash, jeonse), saveRate), rent: 0 };
  const m = { loan: monthly(Math.max(0, deposit - cash), loanRate), opp: monthly(Math.min(cash, deposit), saveRate), rent };
  const jTotal = j.loan + j.opp;
  const mTotal = m.loan + m.opp + m.rent;
  const diff = Math.round(Math.abs(jTotal - mTotal));
  const breakEven = Math.max(0, Math.round(jTotal - m.loan - m.opp));

  const maxTotal = Math.max(jTotal, mTotal, 1);
  const X0 = 64;
  const W = 440;
  const rows = [
    { label: "전세", parts: j, total: jTotal, y: 22 },
    { label: "월세", parts: m, total: mTotal, y: 86 },
  ];
  const man = (v: number) => `${Math.round(v).toLocaleString("ko-KR")}만 원`;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[400px_1fr]">
      <div className="space-y-5 rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line }}>
        <h2 className="font-bold">전세 조건</h2>
        <Slider label="전세 보증금" value={jeonse} min={5000} max={80000} step={500} onChange={setJeonse} format={manText} />
        <h2 className="border-t pt-5 font-bold" style={{ borderColor: C.line }}>
          월세 조건
        </h2>
        <Slider label="월세 보증금" value={deposit} min={0} max={30000} step={500} onChange={setDeposit} format={(v) => (v ? manText(v) : "없음")} />
        <Slider label="월세" value={rent} min={10} max={300} step={5} onChange={setRent} format={(v) => `${v}만 원`} />
        <h2 className="border-t pt-5 font-bold" style={{ borderColor: C.line }}>
          보유 자금과 금리
        </h2>
        <Slider label="보유 자금" value={cash} min={0} max={80000} step={500} onChange={setCash} format={(v) => (v ? manText(v) : "없음")} />
        <Slider label="대출 금리 (연)" value={loanRate} min={2} max={7} step={0.1} onChange={setLoanRate} format={(v) => `${v.toFixed(1)}%`} />
        <Slider label="예금 금리 (연)" value={saveRate} min={1} max={5} step={0.1} onChange={setSaveRate} format={(v) => `${v.toFixed(1)}%`} />
      </div>

      <div className="min-w-0 rounded-[6px] p-5 md:p-7" style={{ background: C.gray }}>
        <h2 className="text-[15px] font-semibold" style={{ color: C.muted }}>
          월 비용
        </h2>
        <svg viewBox="0 0 600 150" className="mt-2 h-auto w-full" role="img" aria-label={`월 비용 전세 ${man(jTotal)}, 월세 ${man(mTotal)}`}>
          {rows.map((row) => {
            let x = X0;
            return (
              <g key={row.label}>
                <text x="0" y={row.y + 25} fontSize="17" fontWeight={700} fill={C.ink}>
                  {row.label}
                </text>
                <rect x={X0} y={row.y} width={W} height="38" rx="4" fill="#fff" />
                {(Object.keys(PART_COLOR) as (keyof typeof PART_COLOR)[]).map((k) => {
                  const w = r2((row.parts[k] / maxTotal) * W);
                  const at = r2(x);
                  x += w;
                  return <motion.rect key={k} y={row.y} height="38" fill={PART_COLOR[k]} initial={false} animate={{ x: at, width: w }} transition={{ duration: reduce ? 0 : 0.35, ease: EASE }} />;
                })}
                <text x={X0 + W + 10} y={row.y + 25} fontSize="16" fontWeight={700} fill={C.ink}>
                  {man(row.total)}
                </text>
              </g>
            );
          })}
        </svg>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
          {(Object.keys(PART_COLOR) as (keyof typeof PART_COLOR)[]).map((k) => (
            <li key={k} className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-[2px]" style={{ background: PART_COLOR[k] }} aria-hidden />
              {PART_LABEL[k]}
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t pt-5" style={{ borderColor: C.line }} aria-live="polite">
          <p className="text-[20px] font-bold leading-[1.45] tracking-[-0.02em] md:text-[22px]">
            {diff <= 1 ? (
              "두 방식의 월 비용 차이가 1만 원 이하입니다."
            ) : (
              <>
                <span style={{ color: C.accentText }}>{jTotal < mTotal ? "전세" : "월세"}</span>가 월 {diff.toLocaleString("ko-KR")}만 원 적게 듭니다.
              </>
            )}
          </p>
          <p className="mt-2" style={{ color: C.muted }}>
            연간 {(diff * 12).toLocaleString("ko-KR")}만 원 차이입니다. 보증금이 같을 때 월세가 {breakEven.toLocaleString("ko-KR")}만 원보다 낮으면 월세가, 높으면 전세가 유리합니다.
          </p>
          {jeonse > cash && (
            <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
              전세 부족분 {manText(jeonse - cash)}은 연 {loanRate.toFixed(1)}% 대출로 계산했습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 매물 의뢰하기 (집 내놓기) ---------- */

type ReqDeal = "sale" | "jeonse" | "monthly";
type MoveMode = "now" | "date" | "period";
const PERIODS = ["초순", "중순", "하순"] as const;

function RequestForm() {
  const reduce = useReducedMotionSafe();
  const [deal, setDeal] = useState<ReqDeal>("sale");
  const [kind, setKind] = useState<Kind>("apt");
  const [addr, setAddr] = useState("");
  const [area, setArea] = useState("");
  const [price, setPrice] = useState(0);
  const [rent, setRent] = useState(0);
  const [moveMode, setMoveMode] = useState<MoveMode>("now");
  const [moveDate, setMoveDate] = useState("");
  const [moveMonth, setMoveMonth] = useState("");
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("초순");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ no: string; rows: [string, string][] } | null>(null);

  const moveText = () => {
    if (moveMode === "now") return "즉시입주";
    if (moveMode === "date") {
      const [y, m, d] = moveDate.split("-").map(Number);
      return y ? `${y}년 ${m}월 ${d}일` : "";
    }
    const [y, m] = moveMonth.split("-").map(Number);
    return y ? `${y}년 ${m}월 ${period}` : "";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addr.trim().length < 2) return setError("소재지를 입력해 주세요.");
    if (!Number(area)) return setError("전용면적을 입력해 주세요.");
    if (!price) return setError(deal === "sale" ? "희망 매매가를 입력해 주세요." : "희망 보증금을 입력해 주세요.");
    if (deal === "monthly" && !rent) return setError("희망 월세를 입력해 주세요.");
    if (!moveText()) return setError("입주가능일을 입력해 주세요.");
    if (name.trim().length < 2) return setError("이름을 입력해 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setError("휴대전화 번호를 입력해 주세요.");
    if (!agree) return setError("개인정보 수집·이용에 동의해 주세요.");
    setError("");
    const n = new Date();
    const p2 = (v: number) => String(v).padStart(2, "0");
    const no = `R${String(n.getFullYear()).slice(2)}${p2(n.getMonth() + 1)}${p2(n.getDate())}-${p2(n.getMinutes())}`;
    setDone({
      no,
      rows: [
        ["의뢰 구분", deal === "sale" ? "매도" : `임대(${DEAL_LABEL[deal]})`],
        ["매물", `${KIND_LABEL[kind]}, ${addr.trim()}`],
        ["전용면적", areaText(Number(area))],
        ["희망 가격", priceText({ deal, price, rent })],
        ["입주가능일", moveText()],
        ["의뢰인", `${maskName(name)} (${maskPhone(phone)})`],
      ],
    });
  };

  const reset = () => {
    setDone(null);
    setAddr("");
    setArea("");
    setPrice(0);
    setRent(0);
    setName("");
    setPhone("");
    setAgree(false);
  };

  const field = "mt-1.5 h-12 w-full rounded-[6px] border bg-white px-3 outline-none focus:border-[#18202a]";

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div
              key="done"
              className="rounded-[6px] border-2 bg-white p-6"
              style={{ borderColor: C.ink }}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <p className="flex items-center gap-2 text-[20px] font-bold">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full" style={{ background: C.accent, color: "#fff" }}>
                  <Check size={18} aria-hidden />
                </span>
                매물 의뢰가 접수되었습니다
              </p>
              <p className="mt-2" style={{ color: C.muted }}>
                접수번호 <span className="font-semibold tabular-nums" style={{ color: C.ink }}>{done.no}</span>. 등기부등본 확인 뒤 담당 중개사가 연락드립니다.
              </p>
              <dl className="mt-4 text-[15px]">
                {done.rows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-t py-2.5" style={{ borderColor: C.line }}>
                    <dt className="shrink-0" style={{ color: C.muted }}>
                      {k}
                    </dt>
                    <dd className="text-right font-semibold tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" onClick={reset} className="mt-4 inline-flex h-10 items-center gap-1.5 text-[15px] font-semibold">
                <RotateCcw size={16} aria-hidden />
                새로 작성
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" exit={{ opacity: 0 }} onSubmit={submit} noValidate className="space-y-6 rounded-[6px] border p-5 md:p-7" style={{ borderColor: C.line }}>
              <Radios
                legend="의뢰 구분"
                name="req-deal"
                value={deal}
                onPick={setDeal}
                options={[
                  { v: "sale", label: "매도" },
                  { v: "jeonse", label: "임대(전세)" },
                  { v: "monthly", label: "임대(월세)" },
                ]}
              />
              <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                <label className="block">
                  <span className="text-[15px] font-bold">매물 종류</span>
                  <select value={kind} onChange={(e) => setKind(e.target.value as Kind)} className={field} style={{ borderColor: C.line }}>
                    {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                      <option key={k} value={k}>
                        {KIND_LABEL[k]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[15px] font-bold">소재지</span>
                  <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="□□아파트 101동 7층" className={field} style={{ borderColor: C.line }} />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-[15px] font-bold">전용면적</span>
                  <span className="relative block">
                    <input value={area} onChange={(e) => setArea(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className={`${field} pr-9 text-right tabular-nums`} style={{ borderColor: C.line }} />
                    <span className="pointer-events-none absolute right-3 top-1/2 mt-[3px] -translate-y-1/2 text-[15px]" style={{ color: C.muted }}>
                      ㎡
                    </span>
                  </span>
                  <span className="mt-1 block text-right text-[13px] tabular-nums" style={{ color: C.muted }}>
                    {Number(area) ? `${pyeong(Number(area))}평` : " "}
                  </span>
                </label>
                <ManInput id="req-price" label={deal === "sale" ? "희망 매매가" : "희망 보증금"} value={price} onChange={setPrice} />
                {deal === "monthly" && <ManInput id="req-rent" label="희망 월세" value={rent} onChange={setRent} />}
              </div>
              <fieldset>
                <legend className="text-[15px] font-bold">입주가능일</legend>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(
                    [
                      ["now", "즉시입주"],
                      ["date", "날짜 지정"],
                      ["period", "월 초순·중순·하순"],
                    ] as const
                  ).map(([v, label]) => (
                    <label
                      key={v}
                      className="flex h-11 cursor-pointer items-center rounded-[6px] border px-3.5 text-[15px] font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2"
                      style={moveMode === v ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line }}
                    >
                      <input type="radio" name="req-move" value={v} checked={moveMode === v} onChange={() => setMoveMode(v)} className="sr-only" />
                      {label}
                    </label>
                  ))}
                </div>
                {moveMode === "date" && (
                  <label className="mt-3 block max-w-[240px]">
                    <span className="sr-only">입주가능 날짜</span>
                    <input type="date" value={moveDate} onChange={(e) => setMoveDate(e.target.value)} className={field} style={{ borderColor: C.line }} />
                  </label>
                )}
                {moveMode === "period" && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label className="block w-[200px]">
                      <span className="sr-only">입주가능 월</span>
                      <input type="month" value={moveMonth} onChange={(e) => setMoveMonth(e.target.value)} className={`${field} mt-0`} style={{ borderColor: C.line }} />
                    </label>
                    <div className="flex overflow-hidden rounded-[6px] border" style={{ borderColor: C.line }} role="group" aria-label="초순, 중순, 하순">
                      {PERIODS.map((p) => (
                        <button key={p} type="button" aria-pressed={period === p} onClick={() => setPeriod(p)} className="h-12 px-4 text-[15px] font-semibold" style={period === p ? { background: C.ink, color: "#fff" } : undefined}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[15px] font-bold">이름</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={{ borderColor: C.line }} />
                </label>
                <label className="block">
                  <span className="text-[15px] font-bold">휴대전화</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={`${field} tabular-nums`} style={{ borderColor: C.line }} />
                </label>
              </div>
              <label className="flex min-h-11 cursor-pointer items-start gap-2.5 text-[15px] leading-[1.5]">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#1e5bb8]" />
                <span>
                  개인정보 수집·이용 동의 (필수)
                  <span className="block text-[14px]" style={{ color: C.muted }}>
                    이름, 휴대전화를 매물 확인 연락에만 쓰고 의뢰가 끝나면 파기합니다.
                  </span>
                </span>
              </label>
              {error && (
                <p className="text-[15px] font-semibold" style={{ color: "#b3261e" }} role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="h-12 w-full rounded-[6px] text-[17px] font-bold sm:w-auto sm:px-10" style={{ background: C.accent, color: "#fff" }}>
                매물 의뢰하기
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <section aria-labelledby="req-guide-title" className="rounded-[6px] p-5 md:p-6" style={{ background: C.gray }}>
        <h2 id="req-guide-title" className="font-bold">
          매물 등록 절차
        </h2>
        <dl className="mt-3 space-y-3 text-[15px]">
          {[
            ["접수 확인", "담당 중개사가 전화로 매물 정보를 확인합니다."],
            ["권리 확인", "등기부등본과 소유자 신분을 확인합니다. 소유자가 아니면 위임장이 필요합니다."],
            ["현장 확인", "방문해 사진을 찍고 면적, 방향, 관리비를 확인합니다."],
            ["광고 게시", "표시·광고 명시사항을 갖춰 매물을 올리고, 거래가 끝나면 바로 내립니다."],
          ].map(([t, d]) => (
            <div key={t}>
              <dt className="font-semibold">{t}</dt>
              <dd style={{ color: C.muted }}>{d}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

/* ---------- 매물투어신청 ---------- */

const WHEN = ["평일 저녁", "토요일 오전", "토요일 오후", "시간 무관"];

function Tour({ selectedId, basket, onToggle, onClear, onMore }: { selectedId: string; basket: string[]; onToggle: (id: string) => void; onClear: () => void; onMore: () => void }) {
  const reduce = useReducedMotionSafe();
  const [phone, setPhone] = useState("");
  const [when, setWhen] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ phone: string; listings: Listing[]; when: string } | null>(null);

  const fromBasket = basket.length > 0;
  const picked = (fromBasket ? basket : [selectedId]).map((id) => LISTING_BY_ID[id]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!when) return setError("방문 희망 시간을 선택해 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setError("휴대전화 번호를 입력해 주세요.");
    setError("");
    setDone({ phone: maskPhone(phone), listings: picked, when });
  };

  const reset = () => {
    setDone(null);
    setWhen(null);
    onClear();
  };

  return (
    <div className="grid items-start gap-6 md:grid-cols-[1.15fr_1fr]">
      <form onSubmit={submit} noValidate className="space-y-6 rounded-[6px] border p-5 md:p-7" style={{ borderColor: C.line }}>
        <div>
          <p className="flex items-baseline justify-between gap-3">
            <span className="text-[15px] font-bold">투어 매물</span>
            <span className="text-[14px] tabular-nums" style={{ color: C.muted }}>
              {fromBasket ? `관심매물 ${basket.length} / ${BASKET_MAX}` : "선택한 매물"}
            </span>
          </p>
          <ul className="mt-2 space-y-2">
            {picked.map((l) => (
              <li key={l.id} className="flex items-center gap-3 rounded-[6px] border py-3 pl-4 pr-2" style={{ borderColor: C.line }}>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] tabular-nums" style={{ color: C.muted }}>
                    매물번호 {l.no}
                  </span>
                  <span className="block font-semibold">{l.name}</span>
                  <span className="block text-[14px] tabular-nums" style={{ color: C.muted }}>
                    {priceText(l)} · {l.floor}층 · 입주 {l.moveIn}
                  </span>
                </span>
                {fromBasket && (
                  <button type="button" onClick={() => onToggle(l.id)} disabled={!!done} aria-label={`${l.name} 관심매물 해제`} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:opacity-40" style={{ color: C.muted }}>
                    <X size={18} aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {basket.length < BASKET_MAX && (
            <button type="button" onClick={onMore} className="mt-2 inline-flex h-10 items-center gap-1.5 text-[15px] font-semibold" style={{ color: C.accentText }}>
              <Plus size={16} aria-hidden />
              관심매물 더 담기
            </button>
          )}
        </div>

        <fieldset>
          <legend className="text-[15px] font-bold">방문 희망 시간</legend>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {WHEN.map((w) => (
              <label
                key={w}
                className="flex h-12 cursor-pointer items-center justify-center rounded-[6px] border text-[15px] font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2"
                style={when === w ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line }}
              >
                <input type="radio" name="visit-when" value={w} checked={when === w} onChange={() => setWhen(w)} className="sr-only" />
                {w}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-[15px] font-bold">휴대전화</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="010-0000-0000"
            className="mt-1.5 h-12 w-full rounded-[6px] border bg-white px-3 tabular-nums outline-none focus:border-[#18202a]"
            style={{ borderColor: C.line }}
          />
        </label>

        {error && (
          <p className="text-[15px] font-semibold" style={{ color: "#b3261e" }} role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={!!done} className="w-full rounded-[6px] py-3.5 text-[17px] font-bold disabled:opacity-40" style={{ background: C.accent, color: "#fff" }}>
          {picked.length}곳 매물투어신청
        </button>
      </form>

      <div aria-live="polite">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              className="rounded-[6px] border-2 bg-white p-6"
              style={{ borderColor: C.ink }}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <p className="flex items-center gap-2 text-[20px] font-bold">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full" style={{ background: C.accent, color: "#fff" }}>
                  <Check size={18} aria-hidden />
                </span>
                매물투어신청이 접수되었습니다
              </p>
              <p className="mt-3">집주인과 일정을 맞춘 뒤 문자로 안내드립니다.</p>
              <dl className="mt-4 text-[15px]">
                <div className="flex justify-between gap-4 border-t py-2.5" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.muted }}>방문 희망 시간</dt>
                  <dd className="text-right font-semibold">{done.when}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t py-2.5" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.muted }}>연락처</dt>
                  <dd className="text-right font-semibold tabular-nums">{done.phone}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t py-2.5" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.muted }}>매물</dt>
                  <dd className="text-right font-semibold">
                    {done.listings.map((l) => (
                      <span key={l.id} className="block">
                        {l.name}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
              <button type="button" onClick={reset} className="mt-4 inline-flex h-10 items-center gap-1.5 text-[15px] font-semibold">
                <RotateCcw size={16} aria-hidden />
                새로 신청
              </button>
            </motion.div>
          ) : (
            <motion.section key="how" exit={{ opacity: 0 }} aria-labelledby="visit-guide-title" className="rounded-[6px] p-6" style={{ background: C.gray }}>
              <h2 id="visit-guide-title" className="font-bold">
                방문 안내
              </h2>
              <dl className="mt-3 space-y-3 text-[15px]">
                {[
                  ["등기부등본", "매물마다 최신 등기부등본을 떼어 봅니다."],
                  ["전세 매물", "전세보증보험 가입 가능 여부를 미리 확인해 둡니다."],
                  ["주차", "사무소 앞 상가 주차장을 1시간 이용할 수 있습니다."],
                ].map(([t, d]) => (
                  <div key={t}>
                    <dt className="font-semibold">{t}</dt>
                    <dd style={{ color: C.muted }}>{d}</dd>
                  </div>
                ))}
              </dl>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- 사무소 소개 ---------- */

const DEALS_DONE = [
  { where: "□□동", what: "아파트 84㎡", deal: "매매", when: "2026년 9월" },
  { where: "□□동", what: "오피스텔 24㎡", deal: "월세", when: "2026년 9월" },
  { where: "□□2동", what: "아파트 59㎡", deal: "전세", when: "2026년 8월" },
  { where: "□□동", what: "빌라 52㎡", deal: "매매", when: "2026년 8월" },
  { where: "□□2동", what: "상가 1층 40㎡", deal: "월세", when: "2026년 7월" },
  { where: "□□동", what: "아파트 114㎡", deal: "매매", when: "2026년 7월" },
];

function About() {
  return (
    <div className="grid items-start gap-8 md:grid-cols-[1fr_1.1fr]">
      <section aria-labelledby="greet-title">
        <h2 id="greet-title" className="text-[21px] font-bold tracking-[-0.02em]">
          인사말
        </h2>
        <p className="mt-3" style={{ color: C.muted }}>
          □□아파트 입주 때부터 이 동네에서 중개하고 있습니다. 동마다 해가 얼마나 드는지, 학교는 어디로 배정되는지 물어보시면 알려 드립니다.
        </p>
        <p className="mt-4 font-bold">대표 공인중개사 {AGENT}</p>

        <h2 className="mt-10 text-[21px] font-bold tracking-[-0.02em]">오시는 길</h2>
        <dl className="mt-3 text-[15px]">
          {[
            ["주소", ADDRESS],
            ["교통", "□□역 2번 출구 도보 3분"],
            ["주차", "상가 주차장 1시간 무료"],
            ["상담 시간", "평일 09:30 ~ 19:00, 토요일 10:00 ~ 17:00, 일요일 예약 상담"],
            ["전화", TEL],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[84px_1fr] gap-3 border-t py-2.5" style={{ borderColor: C.line }}>
              <dt className="font-semibold">{k}</dt>
              <dd style={{ color: C.muted }}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="space-y-8">
        <section aria-labelledby="office-info-title">
          <h2 id="office-info-title" className="text-[21px] font-bold tracking-[-0.02em]">
            중개사무소 정보
          </h2>
          <dl className="mt-2 text-[15px]">
            {[
              ["상호", OFFICE],
              ["대표 공인중개사", AGENT],
              ["중개사무소 등록번호", REG_NO],
              ["손해배상책임 보장", "△△공제 2억 원"],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-x-4 border-t py-2.5" style={{ borderColor: C.line }}>
                <dt style={{ color: C.muted }}>{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="done-title">
          <h2 id="done-title" className="text-[21px] font-bold tracking-[-0.02em]">
            거래완료
          </h2>
          <ul className="mt-3 divide-y rounded-[6px] border" style={{ borderColor: C.line }}>
            {DEALS_DONE.map((d, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderColor: C.line }}>
                <span className="min-w-0">
                  <span className="font-semibold">
                    {d.where} {d.what}
                  </span>
                  <span className="block text-[14px]" style={{ color: C.muted }}>
                    {d.when} 계약
                  </span>
                </span>
                <span className="shrink-0 text-[14px]" style={{ color: C.muted }}>
                  {d.deal}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-4 pb-24 pt-12 md:px-6" style={{ background: "#33373d", color: "#c9cdd2" }}>
      <div className="mx-auto max-w-[1200px]">
        <span style={{ color: "#fff" }}>
          <Logo light />
        </span>
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3">
          {[
            ["상호", OFFICE],
            ["대표 공인중개사", AGENT],
            ["중개사무소 등록번호", REG_NO],
            ["사업자등록번호", "000-00-00000"],
            ["주소", ADDRESS],
            ["전화", TEL],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="shrink-0">{k}</dt>
              <dd style={{ color: "#fff" }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </footer>
  );
}
