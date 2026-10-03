"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Car, Check, Layers, Menu, Phone, RotateCcw, TrainFront, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 부동산 홈페이지 데모: 가상의 ○○ 공인중개사사무소.
   상호, 대표 공인중개사, 등록번호, 주소, 전화번호, 사업자 정보, 매물과 거래 내역은 모두 가상이다.

   디자인: 흰 바탕(#ffffff)에 차가운 회색(#f3f5f7), 먹색 글자(#18202a), 지도 핀과 강조에만 코럴(#ef6351).
   첫 화면 바로 아래에 동네 지도를 크게 두고, 매물은 지도와 목록을 함께 본다.

   동네 지도 매물 찾기는 □□역, 초등학교, 공원, 아파트 단지를 그린 지도에 매물 핀을 꽂는다.
   거래 종류, 매물 종류, 가격, 면적(㎡와 평 바꿔 보기), 역까지 걸어서 몇 분인지로 거르고,
   같은 단지에 여러 건이 남으면 숫자 묶음으로 보여 준다. 목록에 마우스를 올리면 핀이, 핀을 누르면 목록이 함께 표시된다.
   매물 상세에는 면적, 층, 방향, 관리비와 함께 법정 상한 요율로 계산한 중개보수를 보여 준다.
   전세와 월세 비교는 보증금, 월세, 대출 금리, 예금 금리로 한 달에 실제로 드는 돈을 막대로 비교한다.
   방문 예약은 지도에서 고른 매물이 자동으로 들어가고, 접수 화면에는 이름과 번호를 가려서 보여 준다.

   사진 출처(public/images/demo-realty):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, interior */

const IMG = "/images/demo-realty";
const OFFICE = "○○ 공인중개사사무소";
const TEL = "02-000-0000";
const ADDRESS = "□□시 □□구 □□로 120, □□아파트 상가 1층 105호";
const REG_NO = "00000-0000-00000";

const C = {
  white: "#ffffff",
  gray: "#f3f5f7",
  grayDeep: "#e6eaef",
  ink: "#18202a",
  muted: "#566170",
  line: "#dfe4ea",
  coral: "#ef6351",
  coralText: "#c23a28",
  coralSoft: "#fdebe7",
  park: "#dcefe0",
  water: "#d6e6f2",
};

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV = [
  { id: "map", label: "지도로 매물 찾기" },
  { id: "compare", label: "전세·월세 비교" },
  { id: "visit", label: "방문 예약" },
  { id: "agent", label: "중개사 소개" },
  { id: "location", label: "오시는 길" },
];

/* ---------- 매물 ---------- */

type Deal = "sale" | "jeonse" | "monthly";
type Kind = "apt" | "villa" | "officetel" | "store";
type ZoneId = "A" | "B" | "C" | "D" | "E" | "F" | "G";

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
  zone: ZoneId;
  name: string;
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
  moveIn: string;
  /** 관리비(만 원) */
  fee: number;
  parking: string;
  walk: number;
  x: number;
  y: number;
  tags: string[];
}

const LISTINGS: Listing[] = [
  { id: "a1", zone: "A", name: "□□아파트 102동", kind: "apt", deal: "sale", price: 92000, area: 84.97, supply: 112.4, floor: 12, total: 20, rooms: 3, baths: 2, dir: "남향", moveIn: "2027년 1월 이후 협의", fee: 28, parking: "세대당 1.3대", walk: 6, x: 200, y: 150, tags: ["역세권", "초등학교 도보 3분", "올수리"] },
  { id: "a2", zone: "A", name: "□□아파트 105동", kind: "apt", deal: "jeonse", price: 45000, area: 59.92, supply: 84.3, floor: 7, total: 20, rooms: 3, baths: 2, dir: "남동향", moveIn: "즉시 입주", fee: 21, parking: "세대당 1.3대", walk: 6, x: 290, y: 218, tags: ["즉시 입주", "발코니 확장", "전세대출 가능"] },
  { id: "a3", zone: "A", name: "□□아파트 101동", kind: "apt", deal: "monthly", price: 10000, rent: 110, area: 59.92, supply: 84.3, floor: 3, total: 20, rooms: 3, baths: 2, dir: "남향", moveIn: "2026년 11월 말", fee: 20, parking: "세대당 1.3대", walk: 5, x: 378, y: 150, tags: ["저층", "단지 안 정원", "반려동물 협의"] },
  { id: "b1", zone: "B", name: "□□파크아파트 201동", kind: "apt", deal: "sale", price: 128000, area: 114.8, supply: 145.2, floor: 18, total: 25, rooms: 4, baths: 2, dir: "남향", moveIn: "2027년 3월", fee: 38, parking: "세대당 1.5대", walk: 7, x: 498, y: 318, tags: ["공원 조망", "고층", "드레스룸"] },
  { id: "b2", zone: "B", name: "□□파크아파트 203동", kind: "apt", deal: "jeonse", price: 63000, area: 84.95, supply: 110.7, floor: 9, total: 25, rooms: 3, baths: 2, dir: "남서향", moveIn: "2026년 12월 중순", fee: 29, parking: "세대당 1.5대", walk: 8, x: 592, y: 378, tags: ["공원 앞", "시스템 에어컨", "중간층"] },
  { id: "c1", zone: "C", name: "□□오피스텔 A동", kind: "officetel", deal: "monthly", price: 1000, rent: 68, area: 24.5, supply: 48.6, floor: 11, total: 15, rooms: 1, baths: 1, dir: "동향", moveIn: "즉시 입주", fee: 12, parking: "1대 가능", walk: 2, x: 466, y: 160, tags: ["역 도보 2분", "가전 포함", "1인 가구"] },
  { id: "c2", zone: "C", name: "□□오피스텔 B동", kind: "officetel", deal: "jeonse", price: 21000, area: 33.1, supply: 62.3, floor: 8, total: 15, rooms: 2, baths: 1, dir: "남향", moveIn: "2026년 11월 초", fee: 15, parking: "1대 가능", walk: 3, x: 548, y: 212, tags: ["방 2개", "전세대출 가능", "역세권"] },
  { id: "d1", zone: "D", name: "□□빌라", kind: "villa", deal: "sale", price: 29000, area: 49.6, supply: 62.1, floor: 3, total: 4, rooms: 2, baths: 1, dir: "남향", moveIn: "즉시 입주", fee: 5, parking: "1대 가능", walk: 8, x: 365, y: 345, tags: ["2019년 준공", "엘리베이터", "초등학교 옆"] },
  { id: "e1", zone: "E", name: "□□하우스", kind: "villa", deal: "jeonse", price: 24000, area: 56.2, supply: 70.8, floor: 2, total: 5, rooms: 3, baths: 1, dir: "동남향", moveIn: "2026년 12월 말", fee: 6, parking: "1대 가능", walk: 12, x: 75, y: 220, tags: ["방 3개", "조용한 골목", "전세보증보험 가입 가능"] },
  { id: "g1", zone: "G", name: "□□빌라 2차", kind: "villa", deal: "monthly", price: 500, rent: 45, area: 36.4, supply: 46, floor: 4, total: 4, rooms: 1, baths: 1, dir: "서향", moveIn: "즉시 입주", fee: 4, parking: "주차 불가", walk: 14, x: 735, y: 330, tags: ["원룸", "옥상 사용", "관리비 4만 원"] },
  { id: "f1", zone: "F", name: "□□시장 상가 1층", kind: "store", deal: "monthly", price: 3000, rent: 250, area: 43.2, supply: 66, floor: 1, total: 3, rooms: 0, baths: 1, dir: "남향", moveIn: "즉시 입주", fee: 18, parking: "공영 주차장 이용", walk: 9, x: 330, y: 482, tags: ["1층 모퉁이", "시장 입구", "권리금 없음"] },
  { id: "f2", zone: "F", name: "□□프라자 2층", kind: "store", deal: "sale", price: 75000, area: 66.8, supply: 118, floor: 2, total: 5, rooms: 0, baths: 1, dir: "동향", moveIn: "임차인 승계", fee: 32, parking: "건물 주차 3대", walk: 10, x: 522, y: 482, tags: ["임차인 있음", "학원 자리", "엘리베이터"] },
];

const LISTING_BY_ID = Object.fromEntries(LISTINGS.map((l) => [l.id, l])) as Record<string, Listing>;

/** 만 원 단위 금액을 "9억 2,000" 꼴로 */
function eok(man: number) {
  const e = Math.floor(man / 10000);
  const rest = man % 10000;
  if (!e) return rest.toLocaleString("ko-KR");
  return rest ? `${e}억 ${rest.toLocaleString("ko-KR")}` : `${e}억`;
}

/** 만 원 단위 금액을 "9억 2,000만 원" 꼴로 */
function manText(man: number) {
  const e = Math.floor(man / 10000);
  const rest = Math.round(man % 10000);
  if (e && !rest) return `${e}억 원`;
  return `${e ? `${e}억 ` : ""}${rest.toLocaleString("ko-KR")}만 원`;
}

function priceText(l: Listing) {
  return l.deal === "monthly" ? `월세 ${eok(l.price)}/${l.rent}` : `${DEAL_LABEL[l.deal]} ${eok(l.price)}`;
}

function shortPrice(l: Listing) {
  if (l.deal === "monthly") return `${eok(l.price)}/${l.rent}`;
  return l.price >= 10000 ? `${(l.price / 10000).toFixed(1).replace(/\.0$/, "")}억` : `${l.price.toLocaleString("ko-KR")}만`;
}

type Unit = "m2" | "py";
const PY = 3.3058;

function areaText(m2: number, unit: Unit) {
  return unit === "m2" ? `${m2}㎡` : `${(m2 / PY).toFixed(1)}평`;
}

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

function brokerFee(l: Listing): Fee {
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

/* ---------- 이름, 번호 가리기 ---------- */

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘은 김ㅎ늘로 */
function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return chars.join("");
  const hide = (ch: string) => {
    const code = ch.charCodeAt(0) - 0xac00;
    return code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*";
  };
  if (chars.length === 2) return chars[0] + hide(chars[1]);
  return chars.map((ch, i) => (i === 0 || i === chars.length - 1 ? ch : hide(ch))).join("");
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/* ---------- 페이지 ---------- */

export function RealEstateDemo() {
  const [selectedId, setSelectedId] = useState("a2");
  const [deal, setDeal] = useState<Deal | "all">("all");

  return (
    <div className="min-h-screen overflow-x-clip text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.white, color: C.ink }}>
      <Header />
      <main>
        <Hero onDeal={setDeal} />
        <MapSearch deal={deal} onDeal={setDeal} selectedId={selectedId} onSelect={setSelectedId} />
        <Compare />
        <Visit selectedId={selectedId} onSelect={setSelectedId} />
        <Agent />
        <Location />
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
        <path d="M15 25 C15 25 7 17.5 7 12.5 A8 8 0 0 1 23 12.5 C23 17.5 15 25 15 25Z" fill={C.coral} />
        <path d="M11.5 13 L15 10 L18.5 13 V16.5 H11.5Z" fill="#fff" />
      </svg>
      <span className="text-[18px] font-bold tracking-[-0.02em] md:text-[19px]">{OFFICE}</span>
    </span>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <a href="#top" aria-label={`${OFFICE} 처음으로`} className="min-w-0">
          <Logo />
        </a>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-[15px]">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="transition-colors hover:text-[#c23a28]" style={{ color: C.muted }}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <a href={`tel:${TEL}`} className="hidden h-10 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold md:inline-flex" style={{ background: C.ink, color: "#fff" }}>
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
                  <a href={`#${n.id}`} onClick={() => setOpen(false)} className="flex h-12 items-center text-[17px]">
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={`tel:${TEL}`} className="flex h-12 items-center text-[17px] font-semibold" style={{ color: C.coralText }}>
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

/* ---------- 첫 화면 ---------- */

function Hero({ onDeal }: { onDeal: (d: Deal) => void }) {
  const reduce = useReducedMotionSafe();
  const counts = (Object.keys(DEAL_LABEL) as Deal[]).map((d) => ({ d, n: LISTINGS.filter((l) => l.deal === d).length }));

  return (
    <section id="top" className="px-4 pb-12 pt-8 md:px-6 md:pb-16 md:pt-12">
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 md:grid-cols-[1fr_1.15fr] md:gap-12">
        <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          <p className="text-[15px] font-semibold" style={{ color: C.coralText }}>
            □□동 아파트·빌라·오피스텔·상가
          </p>
          <h1 className="mt-2 text-[34px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[50px]">{OFFICE}</h1>
          <p className="mt-4 max-w-[480px]" style={{ color: C.muted }}>
            □□역 2번 출구 앞에서 15년째 동네 매물을 중개하고 있습니다. 지도에서 매물 위치와 역까지 걸리는 시간을 함께 보고 고르세요.
          </p>
          <ul className="mt-7 grid grid-cols-3 gap-2.5">
            {counts.map(({ d, n }) => (
              <li key={d}>
                <a
                  href="#map"
                  onClick={() => onDeal(d)}
                  className="flex h-full flex-col rounded-[10px] border px-3.5 py-3 transition-colors hover:border-[#ef6351]"
                  style={{ borderColor: C.line }}
                >
                  <span className="text-[15px]" style={{ color: C.muted }}>
                    {DEAL_LABEL[d]}
                  </span>
                  <span className="text-[22px] font-bold tabular-nums">{n}건</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px]" style={{ color: C.muted }}>
            <span>평일 09:30 ~ 19:00</span>
            <span>토요일 10:00 ~ 17:00</span>
            <a href={`tel:${TEL}`} className="font-semibold underline underline-offset-4" style={{ color: C.ink }}>
              {TEL}
            </a>
          </p>
        </motion.div>
        <div className="relative aspect-[7/4] overflow-hidden rounded-[12px]">
          <Image src={`${IMG}/hero.jpg`} alt="나무가 늘어선 길을 따라 아파트 단지가 이어진 동네 거리" fill priority sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
        </div>
      </div>
    </section>
  );
}

function SectionHead({ id, tag, title, desc }: { id: string; tag: string; title: string; desc?: string }) {
  return (
    <div>
      <p className="text-[15px] font-bold" style={{ color: C.coralText }}>
        {tag}
      </p>
      <h2 id={id} className="mt-1.5 text-[26px] font-bold leading-[1.35] tracking-[-0.03em] md:text-[34px]">
        {title}
      </h2>
      {desc && (
        <p className="mt-3 max-w-[680px]" style={{ color: C.muted }}>
          {desc}
        </p>
      )}
    </div>
  );
}

/* ---------- 동네 지도 매물 찾기 ---------- */

function Chips<T extends string | number>({ label, value, options, onPick }: { label: string; value: T; options: { v: T; label: string }[]; onPick: (v: T) => void }) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-[14px] font-semibold" style={{ color: C.muted }}>
        {label}
      </legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            aria-pressed={value === o.v}
            onClick={() => onPick(o.v)}
            className="h-10 rounded-[6px] border px-3 text-[15px] font-semibold transition-colors"
            style={value === o.v ? { background: C.ink, color: "#fff", borderColor: C.ink } : { background: C.white, borderColor: C.line }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function NeighborhoodMap() {
  const villas = (x0: number, y0: number, cols: number, rows: number, gap = 40) =>
    Array.from({ length: cols * rows }, (_, i) => (
      <rect key={`${x0}-${y0}-${i}`} x={x0 + (i % cols) * gap} y={y0 + Math.floor(i / cols) * gap} width={gap - 10} height={gap - 12} rx="3" fill="#d5dce4" />
    ));
  const towers = (x0: number, y0: number) =>
    Array.from({ length: 6 }, (_, i) => <rect key={`${x0}-${i}`} x={x0 + (i % 3) * 72} y={y0 + Math.floor(i / 3) * 66} width="54" height="30" rx="3" fill="#cdd5de" />);

  const road = (d: string, w: number) => (
    <g key={d}>
      <path d={d} stroke={C.line} strokeWidth={w + 3} fill="none" />
      <path d={d} stroke="#fff" strokeWidth={w} fill="none" />
    </g>
  );

  return (
    <svg viewBox="0 0 800 520" className="absolute inset-0 h-full w-full" aria-hidden>
      <rect width="800" height="520" fill={C.gray} />
      <path d="M0 34 C160 20 300 48 420 34 S660 18 800 36" stroke={C.water} strokeWidth="20" fill="none" />
      <text x="40" y="64" fontSize="13" fill={C.muted}>
        □□천
      </text>

      {/* 단지와 건물 */}
      <rect x="164" y="104" width="242" height="142" rx="6" fill={C.grayDeep} />
      {towers(180, 124)}
      <rect x="434" y="104" width="134" height="142" rx="6" fill={C.grayDeep} />
      <rect x="448" y="128" width="40" height="70" rx="3" fill="#cdd5de" />
      <rect x="516" y="150" width="40" height="70" rx="3" fill="#cdd5de" />
      <rect x="578" y="104" width="70" height="142" rx="6" fill={C.park} />
      {[
        [596, 130],
        [626, 156],
        [600, 190],
        [630, 222],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="10" fill="#bfdcc6" />
      ))}
      <rect x="164" y="274" width="140" height="142" rx="6" fill="#f3ecd8" />
      <rect x="182" y="300" width="70" height="90" rx="30" fill="none" stroke="#e0d3ae" strokeWidth="3" />
      <rect x="264" y="290" width="28" height="110" rx="3" fill="#e3d7b6" />
      <rect x="316" y="274" width="90" height="142" rx="6" fill={C.grayDeep} />
      {villas(326, 290, 2, 3)}
      <rect x="434" y="274" width="214" height="142" rx="6" fill={C.grayDeep} />
      {towers(450, 290)}
      {villas(16, 110, 3, 7)}
      {villas(678, 110, 3, 7)}
      <rect x="164" y="446" width="484" height="62" rx="6" fill={C.grayDeep} />
      {Array.from({ length: 11 }, (_, i) => (
        <rect key={i} x={174 + i * 43} y="456" width="34" height="42" rx="3" fill="#d5dce4" />
      ))}

      {/* 길 */}
      {road("M0 90 H800", 12)}
      {road("M0 430 H800", 12)}
      {road("M150 0 V520", 12)}
      {road("M660 0 V520", 12)}
      {road("M0 260 H800", 26)}
      {road("M420 0 V520", 22)}

      {/* 이름 */}
      <text x="285" y="118" fontSize="13" fill={C.muted} textAnchor="middle">
        □□아파트
      </text>
      <text x="501" y="118" fontSize="13" fill={C.muted} textAnchor="middle">
        □□오피스텔
      </text>
      <text x="613" y="240" fontSize="12" fill="#4d7a59" textAnchor="middle">
        □□공원
      </text>
      <text x="234" y="410" fontSize="13" fill="#8a7a4c" textAnchor="middle">
        □□초등학교
      </text>
      <text x="541" y="410" fontSize="13" fill={C.muted} textAnchor="middle">
        □□파크아파트
      </text>
      <text x="740" y="282" fontSize="13" fill={C.muted} textAnchor="middle">
        □□로
      </text>
      <text x="300" y="516" fontSize="12" fill={C.muted}>
        □□시장 상가
      </text>

      {/* 역 */}
      <rect x="378" y="243" width="84" height="34" rx="17" fill={C.ink} />
      <text x="420" y="265" fontSize="14" fill="#fff" textAnchor="middle" fontWeight={700}>
        □□역
      </text>
    </svg>
  );
}

function PinShape({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 28 36" className="h-[31px] w-6 md:h-9 md:w-7" aria-hidden>
      <path d="M14 35 C14 35 2 21.5 2 13 A12 12 0 0 1 26 13 C26 21.5 14 35 14 35Z" fill={active ? C.ink : C.coral} stroke="#fff" strokeWidth="2" />
      <circle cx="14" cy="13" r="4.5" fill="#fff" />
    </svg>
  );
}

function MapSearch({
  deal,
  onDeal,
  selectedId,
  onSelect,
}: {
  deal: Deal | "all";
  onDeal: (d: Deal | "all") => void;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const reduce = useReducedMotionSafe();
  const [kind, setKind] = useState<Kind | "all">("all");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(15);
  const [minArea, setMinArea] = useState(0);
  const [unit, setUnit] = useState<Unit>("m2");
  const [walk, setWalk] = useState(0);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [grouped, setGrouped] = useState(true);
  const [openZone, setOpenZone] = useState<ZoneId | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const visible = LISTINGS.filter((l) => {
    const p = l.price / 10000;
    return (
      (deal === "all" || l.deal === deal) &&
      (kind === "all" || l.kind === kind) &&
      p >= priceMin &&
      (priceMax >= 15 || p <= priceMax) &&
      l.area >= minArea &&
      (walk === 0 || l.walk <= walk)
    );
  });

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

  const reset = () => {
    onDeal("all");
    setKind("all");
    setPriceMin(0);
    setPriceMax(15);
    setMinArea(0);
    setWalk(0);
    setOpenZone(null);
  };

  const pickFromMap = (id: string) => {
    onSelect(id);
    const list = listRef.current;
    const item = itemRefs.current[id];
    if (list && item && list.scrollHeight > list.clientHeight) {
      list.scrollTo({ top: item.offsetTop - 8, behavior: reduce ? "auto" : "smooth" });
    }
  };

  const eokLabel = (v: number) => (v >= 15 ? "15억 이상" : v === 0 ? "0원" : `${v}억`);
  const areaMax = 120;

  return (
    <section aria-labelledby="map-title" id="map" className="scroll-mt-16 px-4 py-14 md:px-6 md:py-20" style={{ background: C.gray }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="map-title"
          tag="지도로 매물 찾기"
          title="□□동 매물을 지도에서 고르세요"
          desc="조건을 바꾸면 지도와 목록이 함께 바뀝니다. 같은 단지에 매물이 여러 건이면 숫자로 묶어 보여 드리고, 누르면 펼쳐집니다."
        />

        <div className="mt-8 grid gap-x-6 gap-y-5 rounded-[12px] bg-white p-4 md:grid-cols-2 md:p-6 lg:grid-cols-[auto_auto_1fr]">
          <Chips
            label="거래 종류"
            value={deal}
            options={[{ v: "all" as const, label: "전체" }, ...(Object.keys(DEAL_LABEL) as Deal[]).map((d) => ({ v: d, label: DEAL_LABEL[d] }))]}
            onPick={onDeal}
          />
          <Chips
            label="매물 종류"
            value={kind}
            options={[{ v: "all" as const, label: "전체" }, ...(Object.keys(KIND_LABEL) as Kind[]).map((k) => ({ v: k, label: KIND_LABEL[k] }))]}
            onPick={setKind}
          />
          <Chips
            label="역까지 걸어서"
            value={walk}
            options={[
              { v: 0, label: "상관없음" },
              { v: 5, label: "5분 이내" },
              { v: 10, label: "10분 이내" },
            ]}
            onPick={setWalk}
          />

          <fieldset className="min-w-0 md:col-span-1 lg:col-span-2">
            <legend className="text-[14px] font-semibold" style={{ color: C.muted }}>
              가격 (매매가, 보증금)
            </legend>
            <p className="mt-1 font-bold tabular-nums">
              {eokLabel(priceMin)} ~ {eokLabel(priceMax)}
            </p>
            <div className="mt-1 grid grid-cols-2 gap-4">
              <label className="block">
                <span className="sr-only">최저 가격</span>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={0.5}
                  value={priceMin}
                  onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
                  aria-valuetext={eokLabel(priceMin)}
                  className="h-8 w-full accent-[#ef6351]"
                />
              </label>
              <label className="block">
                <span className="sr-only">최고 가격</span>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={0.5}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
                  aria-valuetext={eokLabel(priceMax)}
                  className="h-8 w-full accent-[#ef6351]"
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="min-w-0">
            <legend className="text-[14px] font-semibold" style={{ color: C.muted }}>
              전용면적
            </legend>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="font-bold tabular-nums">{minArea === 0 ? "전체" : `${areaText(minArea, unit)} 이상`}</p>
              <div className="flex overflow-hidden rounded-[6px] border" style={{ borderColor: C.line }} role="group" aria-label="면적 단위">
                {(["m2", "py"] as Unit[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    aria-pressed={unit === u}
                    onClick={() => setUnit(u)}
                    className="h-9 px-3 text-[14px] font-semibold"
                    style={unit === u ? { background: C.ink, color: "#fff" } : { background: C.white }}
                  >
                    {u === "m2" ? "㎡" : "평"}
                  </button>
                ))}
              </div>
            </div>
            <label className="mt-1 block">
              <span className="sr-only">최소 전용면적</span>
              <input
                type="range"
                min={0}
                max={areaMax}
                step={5}
                value={minArea}
                onChange={(e) => setMinArea(Number(e.target.value))}
                aria-valuetext={minArea === 0 ? "전체" : `${areaText(minArea, unit)} 이상`}
                className="h-8 w-full accent-[#ef6351]"
              />
            </label>
          </fieldset>
        </div>

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: C.line }}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5" style={{ borderColor: C.line }}>
              <p className="text-[15px] font-semibold" aria-live="polite">
                지도에 <span style={{ color: C.coralText }}>{visible.length}건</span>
              </p>
              <div className="flex items-center gap-1.5">
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
                  단지별로 묶기
                </button>
                <button type="button" onClick={reset} aria-label="조건 처음으로" className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border" style={{ borderColor: C.line }}>
                  <RotateCcw size={16} aria-hidden />
                </button>
              </div>
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
                    aria-label={`${z.name} 매물 ${items.length}건, 펼쳐 보기`}
                    className="absolute z-10 flex flex-col items-center"
                    style={{ left: `${r2(z.x / 8)}%`, top: `${r2(z.y / 5.2)}%`, x: "-50%", y: "-50%" }}
                    initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25, ease: EASE }}
                  >
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 text-[15px] font-bold tabular-nums md:h-11 md:w-11 md:text-[17px]"
                      style={{ background: C.coral, borderColor: "#fff", color: "#fff", boxShadow: "0 2px 8px rgba(24,32,42,0.25)" }}
                    >
                      {items.length}
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

          <ul ref={listRef} className="relative space-y-2 lg:max-h-[620px] lg:overflow-y-auto lg:pr-1" aria-label="매물 목록">
            {visible.map((l) => {
              const selected = l.id === selectedId;
              const active = l.id === activeId;
              return (
                <li
                  key={l.id}
                  ref={(el) => {
                    itemRefs.current[l.id] = el;
                  }}
                >
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelect(l.id)}
                    onMouseEnter={() => setHoverId(l.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(l.id)}
                    onBlur={() => setHoverId(null)}
                    className="block w-full rounded-[10px] border bg-white px-4 py-3 text-left transition-colors"
                    style={{ borderColor: selected ? C.ink : active ? C.coral : C.line, boxShadow: selected ? `inset 0 0 0 1px ${C.ink}` : "none" }}
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-[19px] font-bold tabular-nums tracking-[-0.02em]">{priceText(l)}</span>
                      <span className="shrink-0 text-[13px] font-semibold" style={{ color: C.muted }}>
                        {KIND_LABEL[l.kind]}
                      </span>
                    </span>
                    <span className="mt-0.5 block font-semibold">{l.name}</span>
                    <span className="block text-[14px]" style={{ color: C.muted }}>
                      전용 {areaText(l.area, unit)} · {l.floor}층 · {l.dir} · □□역 도보 {l.walk}분
                    </span>
                  </button>
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="rounded-[10px] bg-white p-6 text-center" style={{ color: C.muted }}>
                조건에 맞는 매물이 없습니다.
                <button type="button" onClick={reset} className="mt-2 block w-full font-semibold underline underline-offset-4" style={{ color: C.ink }}>
                  조건 처음으로
                </button>
              </li>
            )}
          </ul>
        </div>

        <Detail listing={LISTING_BY_ID[selectedId]} unit={unit} />
      </div>
    </section>
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

function Detail({ listing: l, unit }: { listing: Listing; unit: Unit }) {
  const reduce = useReducedMotionSafe();
  const fee = brokerFee(l);

  const rows: [string, string][] = [
    ["면적", `전용 ${areaText(l.area, unit)} / 공급 ${areaText(l.supply, unit)}`],
    ["층", `${l.floor}층 / 총 ${l.total}층`],
    [l.kind === "store" ? "구조" : "방, 욕실", l.kind === "store" ? `통으로 쓰는 공간, 화장실 ${l.baths}개` : `방 ${l.rooms}개, 욕실 ${l.baths}개`],
    ["방향", `${l.dir} (거실 기준)`],
    ["입주 가능일", l.moveIn],
    ["관리비", `월 ${l.fee}만 원`],
    ["주차", l.parking],
    ["역까지", `□□역 도보 ${l.walk}분`],
  ];

  return (
    <div className="mt-8" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={l.id}
          aria-labelledby="detail-title"
          className="grid overflow-hidden rounded-[12px] border bg-white md:grid-cols-[0.9fr_1.1fr]"
          style={{ borderColor: C.line }}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-full">
            {l.kind === "store" ? (
              <StorePlan />
            ) : (
              <Image src={`${IMG}/interior.jpg`} alt="햇빛이 드는 비어 있는 아파트 거실" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
            )}
            <span className="absolute left-3 top-3 rounded-[4px] px-2 py-0.5 text-[13px] font-bold" style={{ background: C.coral, color: "#fff" }}>
              {KIND_LABEL[l.kind]} {DEAL_LABEL[l.deal]}
            </span>
          </div>

          <div className="p-5 md:p-7">
            <p className="text-[15px] font-semibold" style={{ color: C.muted }}>
              선택한 매물
            </p>
            <h3 id="detail-title" className="mt-0.5 text-[22px] font-bold tracking-[-0.02em] md:text-[26px]">
              {l.name}
            </h3>
            <p className="text-[26px] font-bold tabular-nums tracking-[-0.02em] md:text-[30px]" style={{ color: C.coralText }}>
              {priceText(l)}
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {l.tags.map((t) => (
                <li key={t} className="rounded-[4px] px-2 py-0.5 text-[14px]" style={{ background: C.gray }}>
                  {t}
                </li>
              ))}
            </ul>

            <dl className="mt-5 grid gap-x-6 sm:grid-cols-2">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-t py-2.5 text-[15px]" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.muted }}>{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 rounded-[10px] p-4" style={{ background: C.gray }}>
              <p className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-bold">중개보수</span>
                <span className="text-[13px]" style={{ color: C.muted }}>
                  상한 요율 기준, 부가가치세 별도
                </span>
              </p>
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
              {fee.negotiable && (
                <p className="mt-1 text-[13px]" style={{ color: C.muted }}>
                  상가는 0.9% 안에서 협의해 정합니다.
                </p>
              )}
            </div>

            <a href="#visit" className="mt-5 inline-flex h-12 items-center gap-2 rounded-[6px] px-5 font-semibold" style={{ background: C.ink, color: "#fff" }}>
              <CalendarDays size={18} aria-hidden />
              이 매물 보러 가기 예약
            </a>
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}

/* ---------- 전세, 월세 비교 ---------- */

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[15px]" style={{ color: C.muted }}>
          {label}
        </span>
        <span className="font-bold tabular-nums">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={format(value)}
        className="mt-1 h-8 w-full accent-[#ef6351]"
      />
    </label>
  );
}

const PART_COLOR = { loan: "#46566a", opp: "#a9b4c2", rent: C.coral };
const PART_LABEL = { loan: "대출 이자", opp: "못 받는 예금 이자", rent: "월세" };

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
    <section aria-labelledby="compare-title" id="compare" className="scroll-mt-16 px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="compare-title"
          tag="전세·월세 비교"
          title="한 달에 실제로 나가는 돈을 비교해 보세요"
          desc="전세는 대출 이자와 보증금으로 묶이는 내 돈의 예금 이자를, 월세는 월세에 보증금 몫을 더해 계산합니다."
        />
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[400px_1fr]">
          <div className="space-y-5 rounded-[12px] border p-5 md:p-6" style={{ borderColor: C.line }}>
            <p className="font-bold">전세 조건</p>
            <Slider label="전세 보증금" value={jeonse} min={5000} max={80000} step={500} onChange={setJeonse} format={manText} />
            <p className="border-t pt-5 font-bold" style={{ borderColor: C.line }}>
              월세 조건
            </p>
            <Slider label="월세 보증금" value={deposit} min={0} max={30000} step={500} onChange={setDeposit} format={(v) => (v ? manText(v) : "없음")} />
            <Slider label="월세" value={rent} min={10} max={300} step={5} onChange={setRent} format={(v) => `${v}만 원`} />
            <p className="border-t pt-5 font-bold" style={{ borderColor: C.line }}>
              내 돈과 금리
            </p>
            <Slider label="가진 돈" value={cash} min={0} max={80000} step={500} onChange={setCash} format={(v) => (v ? manText(v) : "없음")} />
            <Slider label="대출 금리 (연)" value={loanRate} min={2} max={7} step={0.1} onChange={setLoanRate} format={(v) => `${v.toFixed(1)}%`} />
            <Slider label="예금 금리 (연)" value={saveRate} min={1} max={5} step={0.1} onChange={setSaveRate} format={(v) => `${v.toFixed(1)}%`} />
          </div>

          <div className="min-w-0 rounded-[12px] p-5 md:p-7" style={{ background: C.gray }}>
            <p className="text-[15px] font-semibold" style={{ color: C.muted }}>
              한 달 비용
            </p>
            <svg viewBox="0 0 600 150" className="mt-2 h-auto w-full" role="img" aria-label={`한 달 비용 전세 ${man(jTotal)}, 월세 ${man(mTotal)}`}>
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
                      return (
                        <motion.rect
                          key={k}
                          y={row.y}
                          height="38"
                          fill={PART_COLOR[k]}
                          initial={false}
                          animate={{ x: at, width: w }}
                          transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
                        />
                      );
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

            <div className="mt-6 rounded-[10px] bg-white p-5" aria-live="polite">
              <p className="text-[20px] font-bold leading-[1.45] tracking-[-0.02em] md:text-[22px]">
                {diff === 0 ? (
                  "이 조건이면 두 방식의 한 달 비용이 거의 같아요."
                ) : (
                  <>
                    이 조건이면 <span style={{ color: C.coralText }}>{jTotal < mTotal ? "전세" : "월세"}</span>가 한 달에 약 {diff.toLocaleString("ko-KR")}만 원 덜 들어요.
                  </>
                )}
              </p>
              <p className="mt-2" style={{ color: C.muted }}>
                1년이면 {(diff * 12).toLocaleString("ko-KR")}만 원 차이입니다. 보증금이 같을 때 월세가 {breakEven.toLocaleString("ko-KR")}만 원보다 낮으면 월세가, 높으면 전세가 덜 듭니다.
              </p>
              {jeonse > cash && (
                <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
                  전세는 모자란 {manText(jeonse - cash)}을 연 {loanRate.toFixed(1)}%로 빌린다고 보고 계산했습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 방문 예약 ---------- */

const noopSubscribe = () => () => {};
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];
const TIMES = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

/** 오늘 0시 시각. 서버 렌더에서는 -1을 돌려 날짜에 따른 화면 차이를 막는다. */
function useToday() {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    },
    () => -1,
  );
}

function Visit({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const reduce = useReducedMotionSafe();
  const today = useToday();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ name: string; phone: string; listing: string; when: string } | null>(null);

  // 내일부터 일요일을 빼고 6일
  const days: Date[] = [];
  if (today > 0) {
    for (let i = 1; days.length < 6; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      if (d.getDay() !== 0) days.push(d);
    }
  }
  const dayLabel = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`;
  const pickedDay = day === null ? null : days.find((d) => d.getTime() === day) ?? null;
  const saturday = pickedDay?.getDay() === 6;
  const times = saturday ? TIMES.filter((t) => t <= "16:00") : TIMES;
  const listing = LISTING_BY_ID[selectedId];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("이름을 두 글자 이상 적어 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setError("연락받을 휴대전화 번호를 적어 주세요.");
    if (!pickedDay || !time || !times.includes(time)) return setError("방문하실 날짜와 시간을 골라 주세요.");
    setError("");
    setDone({ name: maskName(name), phone: maskPhone(phone), listing: `${listing.name} ${priceText(listing)}`, when: `${dayLabel(pickedDay)} ${time}` });
  };

  const reset = () => {
    setDone(null);
    setDay(null);
    setTime(null);
  };

  const inputClass = "mt-1 h-12 w-full rounded-[6px] border bg-white px-3 outline-none focus:border-[#18202a]";

  return (
    <section aria-labelledby="visit-title" id="visit" className="scroll-mt-16 px-4 py-14 md:px-6 md:py-20" style={{ background: C.gray }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="visit-title"
          tag="매물 문의, 방문 예약"
          title="보고 싶은 매물과 시간을 남겨 주세요"
          desc="지도에서 고른 매물이 자동으로 들어갑니다. 집주인, 세입자와 시간을 맞춘 뒤 전화로 확정해 드립니다."
        />
        <div className="mt-8 grid items-start gap-6 md:grid-cols-[1.15fr_1fr]">
          <form onSubmit={submit} noValidate className="space-y-5 rounded-[12px] bg-white p-5 md:p-7">
            <label className="block">
              <span className="text-[15px] font-semibold">관심 매물</span>
              <select value={selectedId} onChange={(e) => onSelect(e.target.value)} className={inputClass} style={{ borderColor: C.line }}>
                {LISTINGS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} {priceText(l)}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[15px] font-semibold">이름</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="김하늘" className={inputClass} style={{ borderColor: C.line }} />
              </label>
              <label className="block">
                <span className="text-[15px] font-semibold">휴대전화</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" className={inputClass} style={{ borderColor: C.line }} />
              </label>
            </div>
            <fieldset>
              <legend className="text-[15px] font-semibold">희망 방문일</legend>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {days.map((d) => (
                  <button
                    key={d.getTime()}
                    type="button"
                    aria-pressed={day === d.getTime()}
                    onClick={() => setDay(d.getTime())}
                    className="h-11 rounded-[6px] border text-[15px] font-semibold tabular-nums"
                    style={day === d.getTime() ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line }}
                  >
                    {dayLabel(d)}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-[15px] font-semibold">희망 시간</legend>
              <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                {times.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={time === t}
                    onClick={() => setTime(t)}
                    className="h-11 rounded-[6px] border text-[15px] font-semibold tabular-nums"
                    style={time === t ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {saturday && (
                <p className="mt-1.5 text-[14px]" style={{ color: C.muted }}>
                  토요일은 16시까지 안내합니다.
                </p>
              )}
            </fieldset>
            {error && (
              <p className="text-[15px] font-semibold" style={{ color: "#b3261e" }} role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={!!done} className="h-13 w-full rounded-[6px] py-3.5 text-[17px] font-bold disabled:opacity-40" style={{ background: C.coral, color: "#fff" }}>
              방문 예약 신청
            </button>
          </form>

          <div aria-live="polite">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="done"
                  className="rounded-[12px] border-2 bg-white p-6"
                  style={{ borderColor: C.ink }}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <p className="flex items-center gap-2 text-[20px] font-bold">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full" style={{ background: C.coral, color: "#fff" }}>
                      <Check size={18} aria-hidden />
                    </span>
                    예약 신청을 받았습니다
                  </p>
                  <dl className="mt-5 text-[15px]">
                    {[
                      ["신청인", done.name],
                      ["연락처", done.phone],
                      ["매물", done.listing],
                      ["방문 희망", done.when],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 border-t py-2.5" style={{ borderColor: C.line }}>
                        <dt style={{ color: C.muted }}>{k}</dt>
                        <dd className="text-right font-semibold">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
                    오늘 안에 {TEL}로 전화를 드려 시간을 확정합니다.
                  </p>
                  <button type="button" onClick={reset} className="mt-4 inline-flex h-10 items-center gap-1.5 text-[15px] font-semibold">
                    <RotateCcw size={16} aria-hidden />
                    다른 매물 예약
                  </button>
                </motion.div>
              ) : (
                <motion.div key="how" exit={{ opacity: 0 }} className="rounded-[12px] bg-white p-6">
                  <p className="font-bold">방문 전에 알아 두시면 좋아요</p>
                  <ul className="mt-3 space-y-3 text-[15px]">
                    {[
                      ["등기부등본", "방문하시는 날 최신 등기부등본을 함께 확인해 드립니다."],
                      ["전세라면", "전세보증보험 가입이 되는지 미리 알아보고 안내합니다."],
                      ["주차", "사무소 앞 상가 주차장을 1시간 쓰실 수 있습니다."],
                    ].map(([t, d]) => (
                      <li key={t}>
                        <span className="font-semibold">{t}</span>
                        <span className="block" style={{ color: C.muted }}>
                          {d}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 중개사 소개, 거래 완료 ---------- */

const DEALS_DONE = [
  { where: "□□동", what: "아파트 84㎡", deal: "매매", price: "9억 원대", when: "2026년 9월" },
  { where: "□□동", what: "오피스텔 24㎡", deal: "월세", price: "1,000/60대", when: "2026년 9월" },
  { where: "□□2동", what: "아파트 59㎡", deal: "전세", price: "4억 초반", when: "2026년 8월" },
  { where: "□□동", what: "빌라 52㎡", deal: "매매", price: "3억 원대", when: "2026년 8월" },
  { where: "□□2동", what: "상가 1층 40㎡", deal: "월세", price: "3,000/200대", when: "2026년 7월" },
  { where: "□□동", what: "아파트 114㎡", deal: "매매", price: "12억 원대", when: "2026년 7월" },
];

function Agent() {
  return (
    <section aria-labelledby="agent-title" id="agent" className="scroll-mt-16 px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="agent-title" tag="중개사 소개" title="□□동에서 15년째 중개하고 있습니다" />
        <div className="mt-8 grid items-start gap-6 md:grid-cols-[1fr_1.2fr]">
          <div className="rounded-[12px] border p-5 md:p-7" style={{ borderColor: C.line }}>
            <div className="flex items-center gap-4">
              <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-[22px] font-bold" style={{ background: C.gray }} aria-hidden>
                김
              </span>
              <div>
                <p className="text-[22px] font-bold tracking-[-0.02em]">김○○</p>
                <p style={{ color: C.muted }}>대표 공인중개사</p>
              </div>
            </div>
            <p className="mt-5">
              □□아파트 입주 때부터 이 동네에서 일했습니다. 단지별 동 배치와 층마다 다른 햇빛, 학교 배정까지 직접 다녀 보고 말씀드립니다.
            </p>
            <dl className="mt-5 text-[15px]">
              {[
                ["중개사무소 등록번호", REG_NO],
                ["손해배상책임 보장", "△△공제 2억 원"],
                ["상담", "평일 09:30 ~ 19:00, 토요일 10:00 ~ 17:00"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-wrap justify-between gap-x-4 border-t py-2.5" style={{ borderColor: C.line }}>
                  <dt style={{ color: C.muted }}>{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="min-w-0">
            <p className="font-bold">최근 거래 완료</p>
            <ul className="mt-3 divide-y rounded-[12px] border" style={{ borderColor: C.line }}>
              {DEALS_DONE.map((d, i) => (
                <li key={i} className="grid grid-cols-[1fr_auto] items-center gap-x-3 px-4 py-3" style={{ borderColor: C.line }}>
                  <span className="min-w-0">
                    <span className="font-semibold">
                      {d.where} {d.what}
                    </span>
                    <span className="block text-[14px]" style={{ color: C.muted }}>
                      {d.when} 계약
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="mr-1.5 text-[14px] font-semibold" style={{ color: C.coralText }}>
                      {d.deal}
                    </span>
                    <span className="font-bold tabular-nums">{d.price}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

function MiniMap() {
  return (
    <svg viewBox="0 0 640 360" className="h-auto w-full" role="img" aria-label="□□역 2번 출구에서 □□로를 따라 걸어 □□아파트 상가 1층 사무소까지 가는 약도">
      <rect width="640" height="360" fill={C.gray} />
      <path d="M0 150 H640" stroke="#fff" strokeWidth="32" />
      <path d="M200 0 V360" stroke="#fff" strokeWidth="24" />
      <text x="520" y="186" fontSize="15" fill={C.muted}>
        □□로
      </text>
      <rect x="160" y="133" width="80" height="34" rx="17" fill={C.ink} />
      <text x="200" y="155" fontSize="14" fill="#fff" textAnchor="middle" fontWeight={700}>
        □□역
      </text>
      <circle cx="252" cy="182" r="13" fill={C.ink} />
      <text x="252" y="187" fontSize="13" fill="#fff" textAnchor="middle" fontWeight={700}>
        2
      </text>
      <path d="M266 186 H400 V214" stroke={C.coral} strokeWidth="3" strokeDasharray="6 7" fill="none" />
      <rect x="330" y="214" width="220" height="110" rx="6" fill={C.grayDeep} />
      <text x="440" y="244" fontSize="14" fill={C.muted} textAnchor="middle">
        □□아파트 상가
      </text>
      <rect x="350" y="262" width="80" height="44" rx="4" fill={C.coral} />
      <text x="390" y="289" fontSize="13" fill="#fff" textAnchor="middle" fontWeight={700}>
        105호
      </text>
      <text x="442" y="290" fontSize="15" fill={C.ink} fontWeight={700}>
        1층 사무소
      </text>
      <rect x="330" y="30" width="220" height="90" rx="6" fill={C.grayDeep} />
      {[350, 420, 490].map((x) => (
        <rect key={x} x={x} y="50" width="44" height="50" rx="3" fill="#cdd5de" />
      ))}
      <text x="40" y="60" fontSize="14" fill={C.muted}>
        □□아파트
      </text>
    </svg>
  );
}

function Location() {
  return (
    <section aria-labelledby="location-title" id="location" className="scroll-mt-16 px-4 py-14 md:px-6 md:py-20" style={{ background: C.gray }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="location-title" tag="오시는 길" title="□□역 2번 출구에서 걸어서 3분" />
        <div className="mt-8 grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-12">
          <div className="overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: C.line }}>
            <MiniMap />
          </div>
          <div>
            <p className="text-[20px] font-bold leading-[1.5] tracking-[-0.02em]">{ADDRESS}</p>
            <ul className="mt-5 space-y-4">
              {[
                { icon: TrainFront, title: "지하철", body: "□□역 2번 출구로 나와 □□로를 따라 150m, □□아파트 상가 1층" },
                { icon: Car, title: "주차", body: "상가 주차장에 세우시고 사무소에서 주차권을 받아 가세요. 1시간 무료입니다." },
              ].map((r) => (
                <li key={r.title} className="flex gap-3">
                  <r.icon size={20} className="mt-1 shrink-0" style={{ color: C.coralText }} aria-hidden />
                  <span>
                    <span className="font-semibold">{r.title}</span>
                    <span className="block text-[15px]" style={{ color: C.muted }}>
                      {r.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <table className="mt-6 w-full text-[15px]">
              <caption className="pb-1 text-left font-bold">상담 시간</caption>
              <tbody>
                {[
                  ["평일", "09:30 ~ 19:00"],
                  ["토요일", "10:00 ~ 17:00"],
                  ["일요일, 공휴일", "예약하신 분만 안내"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-t" style={{ borderColor: C.line }}>
                    <th scope="row" className="py-2.5 text-left font-normal" style={{ color: C.muted }}>
                      {k}
                    </th>
                    <td className="py-2.5 text-right font-semibold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a href={`tel:${TEL}`} className="mt-6 inline-flex h-12 items-center gap-2 rounded-[6px] px-6 font-semibold" style={{ background: C.ink, color: "#fff" }}>
              <Phone size={18} aria-hidden />
              전화 {TEL}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-4 pb-24 pt-12 md:px-6" style={{ background: C.ink, color: "#c9d0d8" }}>
      <div className="mx-auto max-w-[1200px]">
        <span style={{ color: "#fff" }}>
          <Logo light />
        </span>
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3">
          {[
            ["상호", OFFICE],
            ["대표 공인중개사", "김○○"],
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
