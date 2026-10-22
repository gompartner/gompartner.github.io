"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate, AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import type { AnimationPlaybackControls, MotionValue } from "framer-motion";
import { Car, ChevronLeft, ChevronRight, Clock, MapPin, Package, RotateCcw, ShoppingBasket, Truck, X } from "lucide-react";
import { Gowun_Batang } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 전통주 보틀숍 샘플: 가상의 곰파트너술도가. 상호, 주소, 술 이름은 모두 가상이다.

   국내 전통주 보틀숍과 전통주 쇼핑몰은 첫 진입에 성인 인증 창(만 19세 이상이십니까)을 먼저 띄운다.
   메뉴는 막걸리, 약주, 청주, 증류주, 과실주로 종류별 분류, 첫 화면에 추천과 선물 세트, 시음회 안내,
   오시는 길(주차, 영업시간)을 둔다. 상품 상세는 도수, 용량, 단맛과 산미 정도, 어울리는 음식, 보관법을 적는다.
   하단에는 지나친 음주 경고 문구를 둔다. 전통주는 온라인 주문과 택배가 가능해 택배 안내도 흔하다.

   핵심 모션: 필터에 따라 병 카드가 자리를 바꾸는 재배열. 남는 카드는 미끄러지고 빠지는 카드는
   아래로 가라앉으며 사라진다. 카드를 누르면 같은 자리에서 커져 상세가 열리고, 맛 레이더가 그 술 값으로 변한다.
   선물 세트에 담으면 병 그림이 카드에서 상자 안 자리로 옮겨 간다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 필터: 도수 범위, 단맛, 탄산, 종류, 가격대. 재배열과 결과 수.
   2. 병 상세: 맛 레이더 5축, 도수, 용량, 가격, 어울리는 음식, 보관법. 이전, 다음 병으로 넘기기.
   3. 선물 세트: 병 2~3개를 담으면 상자 안에 들어간다. 포장 종류와 합계.
   4. 시음회 예약: 다음 두 주 토요일 2회차, 인원, 이름, 휴대폰. 접수 완료 화면.
   5. 매장 안내와 오시는 길: 영업시간(오늘 요일 진하게), 주차, 택배 안내.

   포스터 첫 화면(성인 확인 뒤 처음 보이는 화면): 깊은 남색 바탕에 쌀빛 흰 글자 한 문장.
   오른쪽에 유약 광택이 도는 큰 옹기 항아리, 항아리 입에서 막걸리 기포가 천천히 올라온다(7초 주기).
   확인을 누르면 술병 세 개가 차례로 미끄러져 들어와 서고, 기포 몇 개가 떠올라 문장 위 글자 점처럼 흩어진다.
   스크롤하면 병들이 아래 목록 쪽으로 미끄러져 나가고 문장은 위로 빠진다. */

const BRAND = "곰파트너술도가";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 1층";
const KAKAO = "카카오톡 채널 곰파트너";

/* 모션 상수. 재배열과 카드 등장, 퇴장은 240ms, 카드마다 20ms씩 늦춘다. */
const EASE = [0.22, 1, 0.36, 1] as const;
const DUR = 0.24;
const STAGGER = 0.02;

const C = {
  paper: "#f6f1e7",
  paperDeep: "#ece4d4",
  white: "#fffdf8",
  ink: "#2a2622",
  muted: "#625a50",
  line: "#d6cdbc",
  error: "#b42318",
};

type Kind = "막걸리" | "약주" | "청주" | "증류주" | "과실주";
type Sweet = "드라이" | "보통" | "달콤";
type Shape = "wide" | "long" | "square" | "round";

const KINDS: Kind[] = ["막걸리", "약주", "청주", "증류주", "과실주"];
const SWEETS: Sweet[] = ["드라이", "보통", "달콤"];

/* 종류별 라벨색 5개 */
const KIND_COLOR: Record<Kind, string> = {
  막걸리: "#3b5b8c",
  약주: "#d9a84a",
  청주: "#3f7a6a",
  증류주: "#6b3a5c",
  과실주: "#b4463a",
};
/* 라벨 위 글자색. 치자색 라벨만 먹색 글자 */
const KIND_TEXT: Record<Kind, string> = {
  막걸리: "#fffdf8",
  약주: "#2a2622",
  청주: "#fffdf8",
  증류주: "#fffdf8",
  과실주: "#fffdf8",
};
const KIND_SHAPE: Record<Kind, Shape> = { 막걸리: "wide", 약주: "long", 청주: "long", 증류주: "square", 과실주: "round" };
/* 병 속 술 색 */
const LIQUID: Record<Kind, string> = { 막걸리: "#f3eee2", 약주: "#dcae55", 청주: "#eef0dc", 증류주: "#e8e2d8", 과실주: "#c86a7e" };

const PRICE_BANDS = ["1만원 이하", "1~3만원", "3~5만원", "5만원 이상"] as const;
type PriceBand = (typeof PRICE_BANDS)[number];
const inBand = (p: number, b: PriceBand) =>
  b === "1만원 이하" ? p <= 10000 : b === "1~3만원" ? p > 10000 && p <= 30000 : b === "3~5만원" ? p > 30000 && p <= 50000 : p > 50000;

const ABV_MIN = 6;
const ABV_MAX = 45;

type Bottle = {
  id: string;
  name: string;
  kind: Kind;
  abv: number;
  sweet: Sweet;
  fizz: boolean;
  price: number;
  ml: number;
  /** 단맛, 산미, 바디, 향, 여운. 1~5 */
  taste: [number, number, number, number, number];
  food: string;
  keep: string;
  pick?: string;
};

const BOTTLES: Bottle[] = [
  { id: "m1", name: "첫눈 생막걸리", kind: "막걸리", abv: 6, sweet: "달콤", fizz: true, price: 7000, ml: 750, taste: [4, 3, 2, 3, 2], food: "파전, 두부김치", keep: "냉장 보관. 개봉 뒤 3일 안에 드세요.", pick: "입문" },
  { id: "m2", name: "느티 탁주", kind: "막걸리", abv: 8, sweet: "보통", fizz: true, price: 9000, ml: 750, taste: [3, 3, 3, 3, 3], food: "제육볶음, 김치전", keep: "냉장 보관. 흔들어서 드세요." },
  { id: "m3", name: "밤밭 밤막걸리", kind: "막걸리", abv: 6, sweet: "달콤", fizz: true, price: 12000, ml: 500, taste: [5, 2, 3, 4, 3], food: "약과, 구운 밤", keep: "냉장 보관. 개봉 뒤 2일 안에 드세요.", pick: "선물" },
  { id: "m4", name: "누룩향 탁주", kind: "막걸리", abv: 12, sweet: "드라이", fizz: false, price: 15000, ml: 500, taste: [2, 4, 5, 4, 4], food: "홍어 삼합, 묵은지", keep: "냉장 보관. 가라앉은 침전물은 섞어 드세요." },
  { id: "m5", name: "솔잎 막걸리", kind: "막걸리", abv: 7, sweet: "보통", fizz: true, price: 8500, ml: 750, taste: [3, 3, 2, 4, 2], food: "도토리묵, 나물", keep: "냉장 보관. 개봉 뒤 3일 안에 드세요." },
  { id: "y1", name: "가을들 약주", kind: "약주", abv: 13, sweet: "보통", fizz: false, price: 28000, ml: 500, taste: [3, 3, 3, 4, 4], food: "전복찜, 갈비찜", keep: "서늘한 곳에 두고 개봉 뒤 냉장 보관." },
  { id: "y2", name: "매화 약주", kind: "약주", abv: 15, sweet: "드라이", fizz: false, price: 32000, ml: 500, taste: [2, 4, 3, 5, 4], food: "회, 생선구이", keep: "서늘한 곳에 두고 개봉 뒤 냉장 보관.", pick: "선물" },
  { id: "y3", name: "대추 약주", kind: "약주", abv: 14, sweet: "달콤", fizz: false, price: 25000, ml: 375, taste: [4, 2, 4, 4, 5], food: "약식, 떡갈비", keep: "서늘한 곳에 두고 개봉 뒤 냉장 보관." },
  { id: "c1", name: "맑은새 청주", kind: "청주", abv: 14, sweet: "드라이", fizz: false, price: 36000, ml: 500, taste: [2, 3, 2, 3, 3], food: "회, 초밥", keep: "냉장 보관. 차갑게 드세요." },
  { id: "c2", name: "서리 청주", kind: "청주", abv: 16, sweet: "보통", fizz: false, price: 42000, ml: 500, taste: [3, 2, 4, 3, 4], food: "장어구이, 수육", keep: "냉장 보관. 개봉 뒤 2주 안에 드세요.", pick: "추천" },
  { id: "c3", name: "벼꽃 청주", kind: "청주", abv: 13, sweet: "달콤", fizz: false, price: 30000, ml: 375, taste: [4, 3, 2, 4, 3], food: "잡채, 모둠전", keep: "냉장 보관. 차갑게 드세요." },
  { id: "s1", name: "소나무 소주 25", kind: "증류주", abv: 25, sweet: "드라이", fizz: false, price: 45000, ml: 375, taste: [1, 1, 3, 4, 4], food: "삼겹살, 족발", keep: "실온 보관. 직사광선을 피하세요." },
  { id: "s2", name: "참나무 소주 41", kind: "증류주", abv: 41, sweet: "드라이", fizz: false, price: 98000, ml: 500, taste: [1, 1, 5, 5, 5], food: "육회, 한우 구이", keep: "실온 보관. 개봉 뒤에도 오래 두고 드실 수 있어요.", pick: "선물" },
  { id: "s3", name: "쌀소주 32", kind: "증류주", abv: 32, sweet: "보통", fizz: false, price: 38000, ml: 375, taste: [2, 1, 4, 3, 4], food: "보쌈, 전골", keep: "실온 보관. 직사광선을 피하세요." },
  { id: "s4", name: "보리소주 45", kind: "증류주", abv: 45, sweet: "드라이", fizz: false, price: 72000, ml: 500, taste: [1, 1, 5, 4, 5], food: "곱창, 양대창", keep: "실온 보관. 서늘한 곳에 세워 두세요." },
  { id: "f1", name: "복숭아 와인", kind: "과실주", abv: 12, sweet: "달콤", fizz: false, price: 24000, ml: 500, taste: [5, 3, 2, 5, 3], food: "치즈, 과일", keep: "냉장 보관. 개봉 뒤 5일 안에 드세요.", pick: "입문" },
  { id: "f2", name: "오미자 술", kind: "과실주", abv: 14, sweet: "보통", fizz: false, price: 22000, ml: 375, taste: [3, 5, 3, 4, 4], food: "오리구이, 떡볶이", keep: "서늘한 곳에 두고 개봉 뒤 냉장 보관." },
  { id: "f3", name: "사과 스파클링", kind: "과실주", abv: 7, sweet: "달콤", fizz: true, price: 19000, ml: 750, taste: [4, 4, 1, 4, 2], food: "샐러드, 피자", keep: "냉장 보관. 차갑게 바로 드세요." },
];

const PACKS = [
  { id: "box", name: "한지 상자", price: 5000 },
  { id: "cloth", name: "보자기", price: 4000 },
] as const;
type PackId = (typeof PACKS)[number]["id"];
const GIFT_MAX = 3;

const TASTING_FEE = 15000;
const TASTING_CAP = 8;
const SESSIONS = ["14:00", "16:00"];
const HOURS: { day: string; time: string }[] = [
  { day: "월", time: "휴무" },
  { day: "화", time: "13:00 ~ 21:00" },
  { day: "수", time: "13:00 ~ 21:00" },
  { day: "목", time: "13:00 ~ 21:00" },
  { day: "금", time: "13:00 ~ 21:00" },
  { day: "토", time: "12:00 ~ 20:00" },
  { day: "일", time: "12:00 ~ 20:00" },
];
const DOW_IDX = [1, 2, 3, 4, 5, 6, 0];

const serifF = { fontFamily: `${Gowun_Batang.style.fontFamily}, serif` } as const;
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#2a2622]";

/** 오늘 뒤의 토요일 n개. 오늘이 토요일이면 다음 주부터. */
function nextSaturdays(today: Date, n: number) {
  const first = ((6 - today.getDay() + 7) % 7) || 7;
  return Array.from({ length: n }, (_, i) => daysAgo(today, -(first + i * 7)));
}

/** 회차마다 이미 찬 자리. 실제로는 예약 시트에서 읽는다. */
function takenSeats(dayIdx: number, slot: number) {
  return ((dayIdx * 5 + slot * 3 + 2) % 6) + 1;
}

/** 다음 영업일(월요일 휴무) */
function nextOpenDay(today: Date) {
  const d = daysAgo(today, -1);
  return d.getDay() === 1 ? daysAgo(d, -1) : d;
}

type Filters = { kinds: Kind[]; abv: [number, number]; sweets: Sweet[]; fizz: boolean; band: PriceBand | null };
const EMPTY: Filters = { kinds: [], abv: [ABV_MIN, ABV_MAX], sweets: [], fizz: false, band: null };

function matches(b: Bottle, f: Filters) {
  if (f.kinds.length && !f.kinds.includes(b.kind)) return false;
  if (b.abv < f.abv[0] || b.abv > f.abv[1]) return false;
  if (f.sweets.length && !f.sweets.includes(b.sweet)) return false;
  if (f.fizz && !b.fizz) return false;
  if (f.band && !inBand(b.price, f.band)) return false;
  return true;
}

export function LiquorShopDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [age, setAge] = useState<"ask" | "yes" | "no">("ask");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [selected, setSelected] = useState<string | null>(null);
  const [gift, setGift] = useState<string[]>([]);
  const [pack, setPack] = useState<PackId>("box");

  const shown = useMemo(() => BOTTLES.filter((b) => matches(b, filters)), [filters]);
  const isDefault = filters === EMPTY || (filters.kinds.length === 0 && filters.sweets.length === 0 && !filters.fizz && !filters.band && filters.abv[0] === ABV_MIN && filters.abv[1] === ABV_MAX);

  const toggleGift = (id: string) =>
    setGift((g) => (g.includes(id) ? g.filter((x) => x !== id) : g.length >= GIFT_MAX ? g : [...g, id]));

  useEffect(() => {
    const f = () => {
      setSelected(null);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  // 성인 확인 창이 떠 있을 때는 뒤 화면이 스크롤되지 않게 한다.
  useEffect(() => {
    if (age === "yes") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [age]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const giftBottles = gift.map((id) => BOTTLES.find((b) => b.id === id)!).filter(Boolean);
  const giftSum = giftBottles.reduce((s, b) => s + b.price, 0);

  return (
    <div
      className="min-h-screen overflow-x-clip pb-24 lg:pb-10"
      style={{
        color: C.ink,
        backgroundColor: C.paper,
        backgroundImage: "radial-gradient(rgba(42,38,34,0.045) 1px, transparent 1.3px)",
        backgroundSize: "7px 7px",
      }}
    >
      <AgeGate state={age} onAnswer={setAge} reduce={reduce} />

      <div aria-hidden={age !== "yes"}>
        <Poster ready={age === "yes"} reduce={reduce} onCta={() => go("ls-grid")} />

        <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pt-6 md:px-6">
          <h2 className="flex items-center gap-3 text-[26px] leading-none md:text-[30px]" style={serifF}>
            <Seal />
            {BRAND}
          </h2>
          <nav aria-label="주요 메뉴" className="flex flex-wrap gap-x-5 gap-y-1 text-[15px] font-bold">
            {[
              ["ls-grid", "술 고르기"],
              ["ls-gift", "선물 세트"],
              ["ls-tasting", "시음회"],
              ["ls-info", "오시는 길"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={`rounded-[2px] py-1 underline-offset-[6px] hover:underline ${focusRing}`}>
                {label}
              </button>
            ))}
          </nav>
        </header>

        {/* 첫 화면: 왼쪽 위 필터, 왼쪽 아래 선물 상자(따라 내려옴), 오른쪽 병 격자. 휴대폰은 필터, 격자, 상자 순서 */}
        <div className="mx-auto mt-8 grid max-w-[1200px] gap-8 px-4 md:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-6">
          <FilterPanel filters={filters} setFilters={setFilters} count={shown.length} total={BOTTLES.length} isDefault={isDefault} />

          <section id="ls-grid" aria-labelledby="ls-grid-title" className="scroll-mt-4 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="flex items-end justify-between gap-4">
              <h2 id="ls-grid-title" className="text-[24px] leading-none md:text-[28px]" style={serifF}>
                오늘 진열한 술
              </h2>
              <p className="text-[15px] tabular-nums" style={{ color: C.muted }} aria-live="polite">
                {isDefault ? `${BOTTLES.length}병` : `${BOTTLES.length}병 중 ${shown.length}병`}
              </p>
            </div>

            <ul className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 xl:grid-cols-4" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <AnimatePresence mode="popLayout" initial={false}>
                {shown.map((b, i) => (
                  <BottleCard
                    key={b.id}
                    b={b}
                    index={i}
                    reduce={reduce}
                    hidden={selected === b.id}
                    inGift={gift.includes(b.id)}
                    giftFull={gift.length >= GIFT_MAX}
                    onOpen={() => setSelected(b.id)}
                    onGift={() => toggleGift(b.id)}
                  />
                ))}
              </AnimatePresence>
            </ul>
            {shown.length === 0 && (
              <p className="mt-6 border px-4 py-5 text-center text-[16px]" style={{ borderColor: C.line, background: C.white }}>
                조건에 맞는 술이 없어요. 도수나 가격대를 넓혀 보세요.
              </p>
            )}
          </section>

          <div className="lg:col-start-1 lg:row-start-2 lg:self-start lg:sticky lg:top-4">
            <GiftBox bottles={giftBottles} pack={pack} setPack={setPack} sum={giftSum} onRemove={toggleGift} reduce={reduce} />
          </div>
        </div>

        <section id="ls-tasting" aria-labelledby="ls-tasting-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
          <SectionTitle id="ls-tasting-title">주말 시음회</SectionTitle>
          <TastingForm today={today} reduce={reduce} />
        </section>

        <section id="ls-info" aria-labelledby="ls-info-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
          <SectionTitle id="ls-info-title">매장 안내와 오시는 길</SectionTitle>
          <StoreInfo today={today} />
        </section>

        <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted }}>
          <p className="text-[16px] font-bold" style={{ color: C.ink }}>
            {BRAND}
          </p>
          <p>
            {ADDRESS} / {KAKAO}
          </p>
          <p className="mt-3">경고: 지나친 음주는 뇌졸중, 기억력 손상이나 치매를 유발합니다. 임신 중 음주는 기형아 출생 위험을 높입니다.</p>
          <DemoMakerInfo className="mt-6" />
        </footer>

        {/* 휴대폰 하단: 담은 병 수와 합계 */}
        <AnimatePresence>
          {gift.length > 0 && (
            <motion.div
              initial={reduce ? false : { y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2, ease: EASE }}
              className="fixed inset-x-0 z-40 px-4 lg:hidden"
              style={{ bottom: "calc(76px + env(safe-area-inset-bottom, 0px))" }}
            >
              <div className="mx-auto flex max-w-[520px] items-center justify-between gap-3 border px-4 py-3" style={{ background: C.ink, color: C.paper, borderColor: C.ink }}>
                <p className="min-w-0 truncate text-[15px] tabular-nums">
                  선물 세트 {gift.length}병, {won(giftSum + PACKS.find((p) => p.id === pack)!.price)}
                </p>
                <button type="button" onClick={() => go("ls-gift")} className={`flex-none px-3 py-1.5 text-[15px] font-bold ${focusRing}`} style={{ background: C.paper, color: C.ink, outlineColor: C.paper }}>
                  상자 보기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selected && (
          <DetailModal
            key="detail"
            list={shown.length ? shown : BOTTLES}
            id={selected}
            reduce={reduce}
            onClose={() => setSelected(null)}
            onMove={setSelected}
            inGift={gift.includes(selected)}
            giftFull={gift.length >= GIFT_MAX}
            onGift={() => toggleGift(selected)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── 포스터 첫 화면 ───────────────────────────────────── */

/* 포스터 색. 남색 바탕과 쌀빛 글자 대비 약 14:1 */
const P = {
  navy: "#131d31",
  navyLift: "#1f2e4c",
  rice: "#f3eee2",
  riceDim: "#c7c1b2",
};

/* 등장: 병 하나 700ms, 250ms씩 늦게. 기포 점 1000ms, 200ms 뒤부터 90ms씩 늦게. 전체 1.9초 안에 끝난다. */
const SLIDE_EASE = [0.16, 1, 0.3, 1] as const;
const BOTTLE_IN = 0.7;
const BOTTLE_GAP = 0.25;
const DOT_IN = 1.0;
const DOT_DELAY = 0.2;
const DOT_GAP = 0.09;
/* 항아리 속 기포 반복 주기 7초 */
const FIZZ_PERIOD = 7;

/** 문장 위 기포 점 자리. l, t 는 h1 글자 크기(em) 기준, s 는 지름(em). 줄 머리 위에만 둔다. */
const DOTS = [
  { l: 0.42, t: -0.17, s: 0.11 },
  { l: 1.62, t: -0.25, s: 0.07 },
  { l: 3.05, t: -0.14, s: 0.09 },
  { l: 4.6, t: -0.23, s: 0.06 },
  { l: 3.95, t: 1.62, s: 0.12 },
  { l: 4.55, t: 1.3, s: 0.07 },
  { l: 4.25, t: 1.05, s: 0.05 },
  { l: 5.05, t: 1.48, s: 0.09 },
  { l: 4.9, t: 0.98, s: 0.06 },
];

/** 항아리 입 위에서 올라왔다 터지는 기포. x 는 항아리 SVG 좌표 */
const FIZZ = [
  { x: 262, r: 4.5, d: 0 },
  { x: 290, r: 3, d: 1.1 },
  { x: 314, r: 5, d: 2.3 },
  { x: 338, r: 3.5, d: 3.4 },
  { x: 276, r: 2.5, d: 4.6 },
  { x: 326, r: 4, d: 5.6 },
];

function Poster({ ready, reduce, onCta }: { ready: boolean; reduce: boolean; onCta: () => void }) {
  const wrapRef = useRef<HTMLElement>(null);
  const mouthRef = useRef<SVGEllipseElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bottleRefs = useRef<(SVGGElement | null)[]>([]);

  const { scrollYProgress: p } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });
  /* 퇴장: 래퍼 180svh 중 앞 80svh 동안(진행률 0 ~ 0.42) 끝낸다. */
  const textY = useTransform(p, [0, 0.4], ["0%", "-45%"]);
  // 함수형 변환: 값 배열형은 스크롤 타임라인 가속으로 넘어가 진행률이 어긋난다.
  const textOp = useTransform(p, (v) => Math.min(1, Math.max(0, 1 - (v - 0.04) / 0.24)));
  const jarY = useTransform(p, [0, 0.42], [0, 70]);

  // 확인을 누른 뒤 한 번: 병이 차례로 들어오고, 기포가 항아리 입에서 문장 위 자리로 떠오른다.
  useEffect(() => {
    if (!ready || reduce) return;
    const runs: AnimationPlaybackControls[] = [];
    bottleRefs.current.forEach((el, i) => {
      if (!el) return;
      runs.push(animate(el, { x: [520, 0], rotate: [6, 0] }, { duration: BOTTLE_IN, delay: i * BOTTLE_GAP, ease: SLIDE_EASE }));
    });
    const mouth = mouthRef.current?.getBoundingClientRect();
    if (mouth) {
      const mx = mouth.left + mouth.width / 2;
      const my = mouth.top + mouth.height / 2;
      dotRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = mx - (r.left + r.width / 2);
        const dy = my - (r.top + r.height / 2);
        const sway = (i % 2 ? 1 : -1) * 40;
        runs.push(
          animate(
            el,
            { x: [dx, dx * 0.45 + sway, 0], y: [dy, dy * 0.4, 0], scale: [0.3, 1, 1], opacity: [0, 1, 1] },
            { duration: DOT_IN, delay: DOT_DELAY + i * DOT_GAP, ease: "easeOut", times: [0, 0.55, 1] },
          ),
        );
      });
    }
    return () => runs.forEach((r) => r.stop());
  }, [ready, reduce]);

  return (
    <section id="ls-poster" ref={wrapRef} aria-labelledby="ls-poster-title" className={reduce ? "relative" : "relative h-[180svh]"}>
      <div className={`${reduce ? "min-h-svh" : "sticky top-0 h-svh"} relative overflow-hidden`} style={{ background: `radial-gradient(ellipse 70% 60% at 72% 62%, ${P.navyLift} 0%, ${P.navy} 70%)`, color: P.rice }}>
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-4 md:px-10 md:pt-7">
          <p className="flex items-center gap-2 text-[17px] font-bold" style={serifF}>
            <Seal size={22} />
            {BRAND}
          </p>
          <button
            type="button"
            onClick={onCta}
            aria-label="술 고르기"
            data-gtm-cta="liquor-shop_poster_cta"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border transition-colors duration-150 hover:bg-[#f3eee2] hover:text-[#131d31] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#f3eee2]"
            style={{ borderColor: P.rice }}
          >
            <ShoppingBasket size={22} aria-hidden />
          </button>
        </div>

        <motion.div className="absolute inset-x-0 top-[13svh] z-10 px-4 md:top-[15svh] md:px-16" style={reduce ? undefined : { y: textY, opacity: textOp }}>
          <h1
            id="ls-poster-title"
            className="relative m-0 text-[clamp(52px,14.5vw,72px)] font-bold leading-[1.08] tracking-[-0.02em] md:text-[clamp(72px,10.4vw,172px)]"
            style={{ ...serifF, wordBreak: "keep-all" }}
          >
            <span className="block">양조장 술을</span>
            <span className="block">한 병씩</span>
            <span className="block">골라 담아요</span>
            {DOTS.map((d, i) => (
              <span
                key={i}
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                aria-hidden
                className="pointer-events-none absolute rounded-full"
                style={{
                  left: `${d.l}em`,
                  top: `${d.t}em`,
                  width: `${d.s}em`,
                  height: `${d.s}em`,
                  background: "radial-gradient(circle at 34% 30%, #ffffff 0 16%, rgba(243,238,226,0.9) 30%, rgba(243,238,226,0.35) 72%, rgba(243,238,226,0.15) 100%)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.55)",
                }}
              />
            ))}
          </h1>
          <p className="mt-5 text-[15px] md:mt-7 md:text-[18px]" style={{ color: P.riceDim }}>
            전국 양조장 전통주, 화요일 ~ 일요일 영업
          </p>
        </motion.div>

        <div className="pointer-events-none absolute bottom-[3svh] left-1/2 h-[50svh] w-[min(108vw,520px)] -translate-x-1/2 md:bottom-[4svh] md:left-auto md:right-[2vw] md:h-[70svh] md:w-auto md:translate-x-0 md:aspect-[520/480]">
          <JarArt reduce={reduce} mouthRef={mouthRef} bottleRefs={bottleRefs} p={p} jarY={jarY} />
        </div>
      </div>
    </section>
  );
}

type PBottle = { kind: "wide" | "long" | "square"; cx: number; h: number; liquid: [string, string, string]; label: string; cap: [string, string]; exit: [number, number] };

/* 병 세 개: 막걸리(어깨 넓은 병), 약주(목 긴 호박색 병), 증류주(각진 맑은 병). exit 은 퇴장 시작, 끝 진행률 */
const P_BOTTLES: PBottle[] = [
  { kind: "wide", cx: 92, h: 200, liquid: ["#cfc6b2", "#fffaf0", "#b9af99"], label: "#3b5b8c", cap: ["#e6e0d2", "#9c9583"], exit: [0.02, 0.3] },
  { kind: "long", cx: 176, h: 262, liquid: ["#8a5a1c", "#f2c467", "#7a4c14"], label: "#f3eee2", cap: ["#c9a24a", "#6e5420"], exit: [0.06, 0.34] },
  { kind: "square", cx: 258, h: 214, liquid: ["#8fa69e", "#eef5f1", "#7d948c"], label: "#6b3a5c", cap: ["#5a4636", "#2a1f17"], exit: [0.1, 0.38] },
];
const FLOOR = 462;

function bottlePath(kind: PBottle["kind"], h: number) {
  if (kind === "wide") return `M-12 0h24v36c0 10 22 16 22 36v${h - 82}q0 10-10 10h-48q-10 0-10-10v-${h - 82}c0-20 22-26 22-36z`;
  if (kind === "long") return `M-8 0h16v84c0 12 20 18 20 40v${h - 134}q0 10-10 10h-32q-10 0-10-10v-${h - 134}c0-22 20-28 20-40z`;
  return `M-10 0h20v30c0 6 24 8 24 22v${h - 62}q0 10-8 10h-52q-8 0-8-10v-${h - 62}c0-14 24-16 24-22z`;
}

function PosterBottle({ b, i, reduce, p, setRef }: { b: PBottle; i: number; reduce: boolean; p: MotionValue<number>; setRef: (el: SVGGElement | null) => void }) {
  const x = useTransform(p, b.exit, [0, -300 - i * 40]);
  const y = useTransform(p, b.exit, [0, 360]);
  const rot = useTransform(p, b.exit, [0, -14]);
  const top = FLOOR - b.h;
  const half = b.kind === "wide" ? 32 : b.kind === "long" ? 28 : 34;
  const labelTop = b.kind === "long" ? b.h * 0.58 : b.h * 0.5;
  const labelH = b.kind === "long" ? b.h * 0.24 : b.h * 0.3;
  const d = bottlePath(b.kind, b.h);
  const gid = `lsb${i}`;
  return (
    <motion.g style={reduce ? undefined : { x, y, rotate: rot, transformBox: "fill-box", transformOrigin: "50% 100%" }}>
      <g ref={setRef} style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
        <defs>
          <linearGradient id={`${gid}-liq`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={b.liquid[0]} />
            <stop offset="0.38" stopColor={b.liquid[1]} />
            <stop offset="1" stopColor={b.liquid[2]} />
          </linearGradient>
          <linearGradient id={`${gid}-cap`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={b.cap[1]} />
            <stop offset="0.35" stopColor={b.cap[0]} />
            <stop offset="1" stopColor={b.cap[1]} />
          </linearGradient>
        </defs>
        <ellipse cx={b.cx + 6} cy={FLOOR + 4} rx={half + 16} ry="8" fill="url(#ls-floor)" />
        <g transform={`translate(${b.cx} ${top})`}>
          <path d={d} fill={`url(#${gid}-liq)`} />
          {b.kind === "long" && <path d={d} fill="#000" opacity="0.08" />}
          <rect x={-half} y={labelTop} width={half * 2} height={labelH} fill={b.label} />
          <rect x={-half * 0.42} y={labelTop + labelH * 0.22} width={half * 0.84} height={half * 0.84} rx="2" fill="#b4463a" opacity={b.label === "#f3eee2" ? 1 : 0.95} />
          <rect x={-half * 0.6} y={labelTop + labelH * 0.78} width={half * 1.2} height="3" fill={b.label === "#f3eee2" ? "#2a2622" : "#f3eee2"} opacity="0.6" />
          <path d={d} fill="url(#ls-glass-edge)" />
          <path d={`M${-half + 9} ${b.kind === "long" ? 128 : 76}v${b.h * 0.5}`} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d={`M${half - 8} ${b.kind === "long" ? 140 : 90}v${b.h * 0.3}`} stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.3" />
          <rect x={b.kind === "wide" ? -14 : b.kind === "long" ? -10 : -12} y="-16" width={b.kind === "wide" ? 28 : b.kind === "long" ? 20 : 24} height="20" rx="3" fill={`url(#${gid}-cap)`} />
        </g>
      </g>
    </motion.g>
  );
}

function JarArt({ reduce, mouthRef, bottleRefs, p, jarY }: { reduce: boolean; mouthRef: React.Ref<SVGEllipseElement>; bottleRefs: React.RefObject<(SVGGElement | null)[]>; p: MotionValue<number>; jarY: MotionValue<number> }) {
  const body = "M222 74C214 92 196 104 170 116C120 138 106 200 110 262C114 342 158 410 206 438Q300 456 394 438C442 410 486 342 490 262C494 200 480 138 430 116C404 104 386 92 378 74Z";
  return (
    <svg viewBox="0 0 520 480" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="ls-jar" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#120a06" />
          <stop offset="0.16" stopColor="#36200f" />
          <stop offset="0.4" stopColor="#6e4224" />
          <stop offset="0.58" stopColor="#5a341b" />
          <stop offset="0.86" stopColor="#26160c" />
          <stop offset="1" stopColor="#0d0704" />
        </linearGradient>
        <radialGradient id="ls-jar-sheen" cx="0.36" cy="0.3" r="0.42">
          <stop offset="0" stopColor="#ffd9a8" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#ffb878" stopOpacity="0.14" />
          <stop offset="1" stopColor="#ffb878" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ls-jar-shade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="ls-rim" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#2a170c" />
          <stop offset="0.35" stopColor="#8a5632" />
          <stop offset="0.6" stopColor="#5e381e" />
          <stop offset="1" stopColor="#1d1008" />
        </linearGradient>
        <radialGradient id="ls-milk" cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="0.7" stopColor="#e8e0cd" />
          <stop offset="1" stopColor="#b8ad94" />
        </radialGradient>
        <radialGradient id="ls-floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ls-glass-edge" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="0.22" stopColor="#000" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id="ls-bubble" cx="0.35" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#f3eee2" stopOpacity="0.85" />
          <stop offset="1" stopColor="#f3eee2" stopOpacity="0.2" />
        </radialGradient>
        <clipPath id="ls-jar-clip">
          <path d={body} />
        </clipPath>
      </defs>

      <motion.g style={reduce ? undefined : { y: jarY }}>
        <ellipse cx="300" cy="448" rx="230" ry="20" fill="url(#ls-floor)" />
        <path d={body} fill="url(#ls-jar)" />
        {/* 손자국 무늬 띠: 옹기 어깨에 손가락으로 그은 물결 */}
        <g clipPath="url(#ls-jar-clip)" fill="none" strokeLinecap="round">
          <path d="M100 196c30-18 50 18 80 0s50 18 80 0 50 18 80 0 50 18 80 0 50 18 80 0" stroke="#a87048" strokeWidth="3" opacity="0.45" />
          <path d="M100 212c30-18 50 18 80 0s50 18 80 0 50 18 80 0 50 18 80 0 50 18 80 0" stroke="#a87048" strokeWidth="2" opacity="0.3" />
          {/* 흘러내린 유약 */}
          <path d="M152 130c-4 30 2 52-2 78M398 128c4 26-2 40 2 60" stroke="#1d1008" strokeWidth="9" opacity="0.22" />
          {/* 입구 아래 어깨 그늘 */}
          <ellipse cx="300" cy="96" rx="96" ry="18" fill="#000" stroke="none" opacity="0.32" />
        </g>
        <path d={body} fill="url(#ls-jar-sheen)" />
        <path d={body} fill="url(#ls-jar-shade)" />
        {/* 하이라이트 한 줄 */}
        <path d="M172 142C146 166 134 206 136 252" stroke="#fff3e2" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M454 196C462 230 462 262 456 292" stroke="#ffd9a8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.28" />
        {/* 입구와 막걸리 */}
        <ellipse cx="300" cy="72" rx="82" ry="17" fill="url(#ls-rim)" />
        <ellipse cx="300" cy="72" rx="68" ry="12" fill="#0b0604" />
        <ellipse ref={mouthRef} cx="300" cy="75" rx="62" ry="9.5" fill="url(#ls-milk)" />
        <path d="M232 66c30-8 90-9 132-2" stroke="#ffe7c6" strokeWidth="2" fill="none" opacity="0.55" strokeLinecap="round" />
        {FIZZ.map((f, i) => (
          <motion.circle
            key={i}
            cx={f.x}
            cy="74"
            r={f.r}
            fill="url(#ls-bubble)"
            initial={false}
            animate={reduce ? { y: -6, opacity: 0.9 } : { y: [2, -6, -46, -70], opacity: [0, 0.95, 0.8, 0], scale: [0.4, 1, 1, 1.2] }}
            transition={reduce ? { duration: 0 } : { duration: FIZZ_PERIOD, delay: f.d, repeat: Infinity, ease: "easeOut", times: [0, 0.12, 0.7, 1] }}
          />
        ))}
      </motion.g>

      {P_BOTTLES.map((b, i) => (
        <PosterBottle
          key={b.kind}
          b={b}
          i={i}
          reduce={reduce}
          p={p}
          setRef={(el) => {
            bottleRefs.current[i] = el;
          }}
        />
      ))}
    </svg>
  );
}

/* ── 성인 확인 ─────────────────────────────────────────── */

function AgeGate({ state, onAnswer, reduce }: { state: "ask" | "yes" | "no"; onAnswer: (s: "yes" | "no") => void; reduce: boolean }) {
  const yesRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (state === "ask") yesRef.current?.focus({ preventScroll: true });
  }, [state]);
  return (
    <AnimatePresence>
      {state !== "yes" && (
        <motion.div
          key="gate"
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          style={{ background: "rgba(42,38,34,0.72)" }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="ls-age-title" className="w-full max-w-[440px] border-2 px-6 py-8 text-center md:px-10" style={{ background: C.paper, borderColor: C.ink }}>
            <Seal size={44} />
            <h2 id="ls-age-title" className="mt-4 text-[26px] leading-[1.3]" style={serifF}>
              {state === "ask" ? "만 19세 이상이십니까?" : "이용하실 수 없습니다"}
            </h2>
            {state === "ask" ? (
              <>
                <p className="mt-3 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
                  {BRAND}는 주류를 판매합니다.
                  <br />
                  만 19세 미만 청소년은 이용할 수 없습니다.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button ref={yesRef} type="button" onClick={() => onAnswer("yes")} className={`min-h-12 px-4 text-[16px] font-bold ${focusRing}`} style={{ background: C.ink, color: C.paper, outlineColor: C.ink }}>
                    예, 19세 이상입니다
                  </button>
                  <button type="button" onClick={() => onAnswer("no")} className={`min-h-12 border-2 px-4 text-[16px] font-bold ${focusRing}`} style={{ borderColor: C.ink, background: C.white }}>
                    아니요
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-3 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
                만 19세 미만 청소년에게는 주류를 판매하지 않습니다.
                <br />
                이용에 불편을 드려 죄송합니다.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── 공용 조각 ─────────────────────────────────────────── */

/** 붉은 낙관 모양 상호 도장 */
function Seal({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="inline-block flex-none">
      <rect x="2" y="2" width="36" height="36" rx="3" fill="#b4463a" />
      <path d="M11 11h18v18H11z" fill="none" stroke={C.paper} strokeWidth="2.2" />
      <path d="M15 20h10M20 15v10" stroke={C.paper} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-6 border-b-2 pb-3 text-[26px] leading-[1.2] md:text-[32px]" style={{ ...serifF, borderColor: C.ink }}>
      {children}
    </h2>
  );
}

function Chip({ on, onClick, children, color, onText }: { on: boolean; onClick: () => void; children: React.ReactNode; color?: string; onText?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-[15px] transition-colors duration-100 ${focusRing}`}
      style={on ? { background: color ?? C.ink, borderColor: color ?? C.ink, color: onText ?? C.paper, fontWeight: 700 } : { background: C.white, borderColor: C.line, color: C.ink }}
    >
      {color && !on && <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />}
      {children}
    </button>
  );
}

/* ── 1. 필터 ──────────────────────────────────────────── */

function FilterPanel({ filters, setFilters, count, total, isDefault }: { filters: Filters; setFilters: (f: Filters | ((f: Filters) => Filters)) => void; count: number; total: number; isDefault: boolean }) {
  const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const legend = "text-[14px] font-bold";
  return (
    <div id="ls-filter" className="border-2 p-4 md:p-5" style={{ borderColor: C.ink, background: C.white }}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[18px]" style={serifF}>
          술 고르기
        </p>
        <button
          type="button"
          onClick={() => setFilters(EMPTY)}
          disabled={isDefault}
          className={`inline-flex items-center gap-1 text-[14px] underline-offset-4 hover:underline disabled:opacity-40 disabled:hover:no-underline ${focusRing}`}
          style={{ color: C.muted }}
        >
          <RotateCcw size={14} aria-hidden /> 초기화
        </button>
      </div>

      <fieldset className="mt-4">
        <legend className={legend}>종류</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <Chip key={k} on={filters.kinds.includes(k)} color={KIND_COLOR[k]} onText={KIND_TEXT[k]} onClick={() => setFilters((f) => ({ ...f, kinds: toggle(f.kinds, k) }))}>
              {k}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className={legend}>
          도수{" "}
          <span className="font-normal tabular-nums" style={{ color: C.muted }}>
            {filters.abv[0]}도 ~ {filters.abv[1]}도
          </span>
        </legend>
        <DualRange value={filters.abv} onChange={(abv) => setFilters((f) => ({ ...f, abv }))} />
      </fieldset>

      <fieldset className="mt-5">
        <legend className={legend}>단맛</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SWEETS.map((s) => (
            <Chip key={s} on={filters.sweets.includes(s)} onClick={() => setFilters((f) => ({ ...f, sweets: toggle(f.sweets, s) }))}>
              {s}
            </Chip>
          ))}
          <Chip on={filters.fizz} onClick={() => setFilters((f) => ({ ...f, fizz: !f.fizz }))}>
            탄산 있는 것만
          </Chip>
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className={legend}>가격대</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRICE_BANDS.map((b) => (
            <Chip key={b} on={filters.band === b} onClick={() => setFilters((f) => ({ ...f, band: f.band === b ? null : b }))}>
              {b}
            </Chip>
          ))}
        </div>
      </fieldset>

      <p className="mt-5 border-t pt-3 text-[15px] tabular-nums" style={{ borderColor: C.line }}>
        {isDefault ? (
          <>전체 {total}병</>
        ) : (
          <>
            <b>{count}병</b>이 조건에 맞아요
          </>
        )}
      </p>
    </div>
  );
}

/** 도수 범위 슬라이더. 겹쳐 둔 range 두 개를 손잡이만 눌리게 한다. */
function DualRange({ value, onChange }: { value: [number, number]; onChange: (v: [number, number]) => void }) {
  const [lo, hi] = value;
  const pct = (v: number) => ((v - ABV_MIN) / (ABV_MAX - ABV_MIN)) * 100;
  const thumb =
    "pointer-events-none absolute inset-x-0 top-0 m-0 h-7 w-full appearance-none bg-transparent " +
    "[&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#2a2622] [&::-webkit-slider-thumb]:bg-[#fffdf8] " +
    "[&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#2a2622] [&::-moz-range-thumb]:bg-[#fffdf8] " +
    "focus-visible:outline-none [&:focus-visible::-webkit-slider-thumb]:outline [&:focus-visible::-webkit-slider-thumb]:outline-[3px] [&:focus-visible::-webkit-slider-thumb]:outline-offset-2 [&:focus-visible::-webkit-slider-thumb]:outline-[#2a2622] [&:focus-visible::-moz-range-thumb]:outline [&:focus-visible::-moz-range-thumb]:outline-[3px]";
  return (
    <div className="relative mt-3 h-7 px-3">
      <div className="absolute inset-x-3 top-1/2 h-1 -translate-y-1/2 rounded-full" style={{ background: C.line }} aria-hidden>
        <div className="absolute inset-y-0 rounded-full" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%`, background: C.ink }} />
      </div>
      <input
        type="range"
        min={ABV_MIN}
        max={ABV_MAX}
        step={1}
        value={lo}
        aria-label="최저 도수"
        aria-valuetext={`${lo}도`}
        onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])}
        className={thumb}
        style={{ zIndex: lo > ABV_MAX - 5 ? 2 : 1 }}
      />
      <input
        type="range"
        min={ABV_MIN}
        max={ABV_MAX}
        step={1}
        value={hi}
        aria-label="최고 도수"
        aria-valuetext={`${hi}도`}
        onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])}
        className={thumb}
      />
    </div>
  );
}

/* ── 병 그림 ──────────────────────────────────────────── */

/** 병 모양 4종. 막걸리는 어깨 넓은 병, 약주와 청주는 목 긴 병, 증류주는 각진 병, 과실주는 둥근 병. */
function BottleArt({ b, height = 120, className = "" }: { b: Bottle; height?: number; className?: string }) {
  const shape = KIND_SHAPE[b.kind];
  const color = KIND_COLOR[b.kind];
  const text = KIND_TEXT[b.kind];
  const liquid = LIQUID[b.kind];
  const glass = b.kind === "증류주" ? "#4a4038" : "rgba(42,38,34,0.08)";
  const short = b.name.split(" ")[0];
  const body =
    shape === "wide"
      ? "M22 14h16v8c0 4 12 10 12 22v98c0 6-4 10-10 10H20c-6 0-10-4-10-10V44c0-12 12-18 12-22z"
      : shape === "long"
        ? "M25 10h10v46c0 4 11 8 11 18v70c0 6-3 8-8 8H22c-5 0-8-2-8-8V74c0-10 11-14 11-18z"
        : shape === "square"
          ? "M24 12h12v26c0 3 12 5 12 12v96c0 4-2 6-6 6H18c-4 0-6-2-6-6V50c0-7 12-9 12-12z"
          : "M25 10h10v40c0 3 17 8 17 36v34c0 14-10 30-22 30S8 134 8 120V86c0-28 17-33 17-36z";
  const labelY = shape === "wide" ? 78 : shape === "long" ? 92 : shape === "square" ? 76 : 86;
  const labelH = shape === "long" ? 46 : 54;
  return (
    <svg width={height * 0.375} height={height} viewBox="0 0 60 160" aria-hidden className={`flex-none ${className}`}>
      <path d={body} fill={liquid} stroke={C.ink} strokeWidth="1.6" strokeLinejoin="round" />
      <path d={body} fill={glass} />
      {/* 뚜껑 */}
      <rect x={shape === "wide" ? 20 : 23} y="4" width={shape === "wide" ? 20 : 14} height="11" rx="2" fill={shape === "square" ? "#8c7a63" : "#d9d4c7"} stroke={C.ink} strokeWidth="1.4" />
      {/* 라벨 */}
      <rect x="13" y={labelY} width="34" height={labelH} fill={color} stroke={C.ink} strokeWidth="1" />
      <text x="30" y={labelY + labelH / 2 - 4} textAnchor="middle" fontSize="8.5" fontWeight="700" fill={text} style={serifF}>
        {short}
      </text>
      <text x="30" y={labelY + labelH / 2 + 9} textAnchor="middle" fontSize="7" fill={text}>
        {b.abv}도
      </text>
      <rect x="18" y={labelY + labelH - 9} width="24" height="2" fill={text} opacity="0.55" />
      {/* 유리 반사 */}
      <path d={shape === "wide" ? "M16 52v86" : shape === "long" ? "M18 80v60" : shape === "square" ? "M16 56v88" : "M14 92v34"} stroke={C.white} strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

/* ── 병 카드 ──────────────────────────────────────────── */

/** popLayout 이 빠지는 카드를 제자리에 고정하려면 ref 가 필요하다. */
function BottleCard({ ref, b, index, reduce, hidden, inGift, giftFull, onOpen, onGift }: { ref?: React.Ref<HTMLLIElement>; b: Bottle; index: number; reduce: boolean; hidden: boolean; inGift: boolean; giftFull: boolean; onOpen: () => void; onGift: () => void }) {
  const t = reduce ? { duration: 0 } : { duration: DUR, ease: EASE };
  return (
    <motion.li
      ref={ref}
      layout={!reduce}
      layoutId={`card-${b.id}`}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { ...t, delay: reduce ? 0 : index * STAGGER } }}
      exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: 14, transition: { duration: DUR, ease: EASE, delay: Math.min(index, 8) * STAGGER } }}
      transition={{ layout: t }}
      className="relative"
    >
      <div className="flex h-full flex-col border p-3 transition-colors duration-100" style={{ visibility: hidden ? "hidden" : "visible", background: C.white, borderColor: inGift ? C.ink : C.line }}>
        <button type="button" onClick={onOpen} aria-label={`${b.name} 상세 보기`} className={`group flex flex-1 flex-col items-center text-left ${focusRing}`} style={{ outlineColor: C.ink }}>
          <div className="relative flex h-[128px] w-full items-end justify-center">
            {b.pick && (
              <span className="absolute left-0 top-0 border px-1.5 py-0.5 text-[12px] font-bold" style={{ borderColor: C.ink, background: C.paper }}>
                {b.pick}
              </span>
            )}
            {inGift ? (
              <div className="flex h-[120px] w-[45px] items-center justify-center border border-dashed text-center text-[12px] leading-[1.4]" style={{ borderColor: C.line, color: C.muted }} aria-hidden>
                상자에
                <br />
                담김
              </div>
            ) : (
              <motion.div layoutId={`art-${b.id}`} transition={t} className="transition-transform duration-150 group-hover:-translate-y-1">
                <BottleArt b={b} height={120} />
              </motion.div>
            )}
          </div>
          <p className="mt-3 w-full text-[16px] font-bold leading-[1.3]">{b.name}</p>
          <p className="mt-0.5 w-full text-[13px]" style={{ color: C.muted }}>
            {b.kind} {b.abv}도 {b.ml}ml{b.fizz ? ", 탄산" : ""}
          </p>
          <p className="mt-1 w-full text-[16px] tabular-nums">{won(b.price)}</p>
        </button>
        <button
          type="button"
          onClick={onGift}
          disabled={!inGift && giftFull}
          data-gtm-cta="liquor-shop_gift_add"
          aria-pressed={inGift}
          className={`mt-3 min-h-10 w-full border text-[14px] font-bold transition-colors duration-100 disabled:opacity-40 ${focusRing}`}
          style={inGift ? { background: C.ink, color: C.paper, borderColor: C.ink } : { borderColor: C.ink, background: C.white }}
        >
          {inGift ? "상자에서 빼기" : "선물 세트에 담기"}
        </button>
      </div>
    </motion.li>
  );
}

/* ── 2. 병 상세 ───────────────────────────────────────── */

const AXES = ["단맛", "산미", "바디", "향", "여운"];
const R = 62;
const CX = 90;
const CY = 86;
function radarPoint(i: number, v: number) {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  return [CX + Math.cos(a) * R * (v / 5), CY + Math.sin(a) * R * (v / 5)] as const;
}
function radarPath(vals: readonly number[]) {
  return vals.map((v, i) => radarPoint(i, v)).map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + " Z";
}
const RADAR_BASE = radarPath([2.5, 2.5, 2.5, 2.5, 2.5]);

function Radar({ b, reduce }: { b: Bottle; reduce: boolean }) {
  const color = KIND_COLOR[b.kind];
  return (
    <figure className="m-0">
      <svg viewBox="0 0 180 176" className="mx-auto w-full max-w-[280px]" role="img" aria-label={`맛 그래프: ${AXES.map((a, i) => `${a} ${b.taste[i]}`).join(", ")} (5점 만점)`}>
        {[1, 2, 3, 4, 5].map((lv) => (
          <path key={lv} d={radarPath([lv, lv, lv, lv, lv])} fill="none" stroke={C.line} strokeWidth={lv === 5 ? 1.4 : 0.8} />
        ))}
        {AXES.map((a, i) => {
          const [x, y] = radarPoint(i, 5);
          const [lx, ly] = radarPoint(i, 6.25);
          return (
            <g key={a}>
              <line x1={CX} y1={CY} x2={x} y2={y} stroke={C.line} strokeWidth="0.8" />
              <text x={lx} y={ly + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.ink}>
                {a} {b.taste[i]}
              </text>
            </g>
          );
        })}
        <motion.path initial={{ d: reduce ? radarPath(b.taste) : RADAR_BASE }} animate={{ d: radarPath(b.taste) }} transition={{ duration: reduce ? 0 : 0.36, ease: EASE }} fill={color} fillOpacity="0.32" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    </figure>
  );
}

function DetailModal({ list, id, reduce, onClose, onMove, inGift, giftFull, onGift }: { list: Bottle[]; id: string; reduce: boolean; onClose: () => void; onMove: (id: string) => void; inGift: boolean; giftFull: boolean; onGift: () => void }) {
  const b = BOTTLES.find((x) => x.id === id)!;
  const idx = list.findIndex((x) => x.id === id);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const t = reduce ? { duration: 0 } : { duration: DUR, ease: EASE };

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
      <motion.button
        type="button"
        aria-label="상세 닫기"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.2 }}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        style={{ background: "rgba(42,38,34,0.55)" }}
      />
      <motion.div
        layoutId={`card-${b.id}`}
        transition={{ layout: t }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ls-detail-title"
        className="relative max-h-[calc(100dvh-24px)] w-full max-w-[860px] overflow-y-auto border-2"
        style={{ background: C.white, borderColor: C.ink }}
      >
        <motion.div initial={{ opacity: reduce ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.1 } }} transition={{ duration: reduce ? 0 : 0.2, delay: reduce ? 0 : 0.12 }} className="p-5 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-block border px-2 py-0.5 text-[13px] font-bold" style={{ borderColor: KIND_COLOR[b.kind], background: KIND_COLOR[b.kind], color: KIND_TEXT[b.kind] }}>
                {b.kind}
              </p>
              <h3 id="ls-detail-title" className="mt-2 text-[28px] leading-[1.2] md:text-[34px]" style={serifF}>
                {b.name}
              </h3>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} aria-label="닫기" className={`-mr-2 -mt-2 inline-flex h-11 w-11 flex-none items-center justify-center ${focusRing}`}>
              <X size={24} aria-hidden />
            </button>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
            <div className="flex justify-center md:justify-start">
              <BottleArt b={b} height={220} />
            </div>

            <div>
              <Radar b={b} reduce={reduce} />
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px] leading-[1.6]">
                <dt style={{ color: C.muted }}>도수</dt>
                <dd className="tabular-nums">{b.abv}도</dd>
                <dt style={{ color: C.muted }}>용량</dt>
                <dd className="tabular-nums">{b.ml}ml</dd>
                <dt style={{ color: C.muted }}>단맛</dt>
                <dd>
                  {b.sweet}
                  {b.fizz ? ", 탄산 있음" : ""}
                </dd>
                <dt style={{ color: C.muted }}>가격</dt>
                <dd className="text-[18px] font-bold tabular-nums">{won(b.price)}</dd>
              </dl>
            </div>

            <div className="text-[15px] leading-[1.7]">
              <p className="font-bold">어울리는 음식</p>
              <p>{b.food}</p>
              <p className="mt-4 font-bold">보관법</p>
              <p>{b.keep}</p>
              <button
                type="button"
                onClick={onGift}
                disabled={!inGift && giftFull}
                data-gtm-cta="liquor-shop_gift_add"
                aria-pressed={inGift}
                className={`mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 border-2 px-4 text-[16px] font-bold disabled:opacity-40 ${focusRing}`}
                style={inGift ? { background: C.ink, color: C.paper, borderColor: C.ink } : { borderColor: C.ink, background: C.white }}
              >
                <Package size={18} aria-hidden />
                {inGift ? "상자에서 빼기" : giftFull ? "상자가 찼어요 (3병)" : "선물 세트에 담기"}
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t pt-4 text-[15px]" style={{ borderColor: C.line }}>
            <button type="button" disabled={!prev} onClick={() => prev && onMove(prev.id)} className={`inline-flex min-h-11 items-center gap-1 pr-2 disabled:opacity-30 ${focusRing}`}>
              <ChevronLeft size={18} aria-hidden /> {prev ? prev.name : "처음"}
            </button>
            <span className="tabular-nums" style={{ color: C.muted }}>
              {idx + 1} / {list.length}
            </span>
            <button type="button" disabled={!next} onClick={() => next && onMove(next.id)} className={`inline-flex min-h-11 items-center gap-1 pl-2 text-right disabled:opacity-30 ${focusRing}`}>
              {next ? next.name : "마지막"} <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── 3. 선물 세트 ─────────────────────────────────────── */

function GiftBox({ bottles, pack, setPack, sum, onRemove, reduce }: { bottles: Bottle[]; pack: PackId; setPack: (p: PackId) => void; sum: number; onRemove: (id: string) => void; reduce: boolean }) {
  const packInfo = PACKS.find((p) => p.id === pack)!;
  const total = sum + packInfo.price;
  const ready = bottles.length >= 2;
  const t = reduce ? { duration: 0 } : { duration: DUR, ease: EASE };
  const slots = [18, 50, 82]; // 상자 안 병 자리(%)
  return (
    <div id="ls-gift" className="scroll-mt-4 border-2 p-4 md:p-5" style={{ borderColor: C.ink, background: C.white }}>
      <p className="text-[18px]" style={serifF}>
        선물 세트 만들기
      </p>
      <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
        병 2~3개를 담아 주세요.
      </p>

      {/* 상자 그림. 병은 카드에서 이 자리로 옮겨 온다. */}
      <div className="relative mx-auto mt-4 h-[170px] w-full max-w-[300px]">
        <svg viewBox="0 0 300 170" className="absolute inset-0 h-full w-full" aria-hidden>
          {pack === "box" ? (
            <>
              <rect x="22" y="70" width="256" height="92" fill="#e9dfca" stroke={C.ink} strokeWidth="1.8" />
              <rect x="14" y="56" width="272" height="20" fill="#f1e8d6" stroke={C.ink} strokeWidth="1.8" />
              <path d="M150 56v20" stroke={C.ink} strokeWidth="1" opacity="0.3" />
              <rect x="22" y="76" width="256" height="86" fill="url(#hanji)" opacity="0.5" />
              <defs>
                <pattern id="hanji" width="9" height="9" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="3" r="0.9" fill={C.ink} opacity="0.12" />
                  <circle cx="6" cy="7" r="0.7" fill={C.ink} opacity="0.1" />
                </pattern>
              </defs>
            </>
          ) : (
            <>
              <path d="M150 20 L292 110 L150 168 L8 110 Z" fill="#3b5b8c" stroke={C.ink} strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M150 20 L292 110 L150 168 L8 110 Z" fill="url(#cloth)" />
              <path d="M8 110 L150 60 L292 110" fill="none" stroke={C.paper} strokeWidth="1.2" opacity="0.5" />
              <path d="M136 22c-10-10-26-6-22 6 3 8 12 10 18 4M164 22c10-10 26-6 22 6-3 8-12 10-18 4" fill="#3b5b8c" stroke={C.ink} strokeWidth="1.6" />
              <defs>
                <pattern id="cloth" width="14" height="14" patternUnits="userSpaceOnUse">
                  <circle cx="7" cy="7" r="1.6" fill={C.paper} opacity="0.35" />
                </pattern>
              </defs>
            </>
          )}
        </svg>
        <ul className="absolute inset-0 m-0 list-none p-0">
          {bottles.map((b, i) => (
            <li key={b.id} className="absolute bottom-[14px] -translate-x-1/2" style={{ left: `${slots[i]}%` }}>
              <motion.div layoutId={`art-${b.id}`} transition={t}>
                <BottleArt b={b} height={112} />
              </motion.div>
              <button
                type="button"
                onClick={() => onRemove(b.id)}
                aria-label={`${b.name} 상자에서 빼기`}
                className={`absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border ${focusRing}`}
                style={{ background: C.white, borderColor: C.ink }}
              >
                <X size={14} aria-hidden />
              </button>
            </li>
          ))}
          {bottles.length === 0 && (
            <li className="absolute inset-x-0 bottom-[60px] text-center text-[14px]" style={{ color: C.muted }}>
              {pack === "box" ? "상자가 비어 있어요" : "보자기가 비어 있어요"}
            </li>
          )}
        </ul>
      </div>

      <fieldset className="mt-4">
        <legend className="text-[14px] font-bold">포장</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {PACKS.map((p) => (
            <label key={p.id} className={`flex min-h-11 cursor-pointer items-center justify-between gap-2 border px-3 text-[15px] has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2`} style={{ borderColor: pack === p.id ? C.ink : C.line, background: pack === p.id ? C.paper : C.white, fontWeight: pack === p.id ? 700 : 400 }}>
              <span className="flex items-center gap-2">
                <input type="radio" name="ls-pack" value={p.id} checked={pack === p.id} onChange={() => setPack(p.id)} className="sr-only" />
                {p.name}
              </span>
              <span className="tabular-nums" style={{ color: C.muted }}>
                +{won(p.price)}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-1 border-t pt-3 text-[15px] tabular-nums" style={{ borderColor: C.line }}>
        {bottles.map((b) => (
          <div key={b.id} className="contents">
            <dt className="truncate">{b.name}</dt>
            <dd>{won(b.price)}</dd>
          </div>
        ))}
        <dt style={{ color: C.muted }}>{packInfo.name} 포장</dt>
        <dd style={{ color: C.muted }}>{won(packInfo.price)}</dd>
        <dt className="mt-1 text-[17px] font-bold">합계</dt>
        <dd className="mt-1 text-[17px] font-bold">{bottles.length ? won(total) : "0원"}</dd>
      </dl>
      <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: C.muted }} aria-live="polite">
        {bottles.length === 0 ? "병을 담으면 합계가 보여요." : ready ? "매장에서 바로 포장해 드려요. 택배도 가능해요." : "한 병 더 담으면 세트가 돼요."}
      </p>
    </div>
  );
}

/* ── 4. 시음회 예약 ───────────────────────────────────── */

type Done = { no: string; name: string; phone: string; date: Date; slot: string; people: number };

function TastingForm({ today, reduce }: { today: Date; reduce: boolean }) {
  const dates = useMemo(() => nextSaturdays(today, 2), [today]);
  const [pick, setPick] = useState<{ d: number; s: number } | null>(null);
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pick) return setErr("회차를 골라 주세요.");
    if (name.trim().length < 2) return setErr("이름을 두 글자 이상 적어 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setErr("휴대폰 번호를 확인해 주세요.");
    const left = TASTING_CAP - takenSeats(pick.d, pick.s);
    if (people > left) return setErr(`이 회차는 ${left}명까지 예약할 수 있어요.`);
    setErr(null);
    const d = dates[pick.d];
    const tail = (Number(phone.replace(/\D/g, "").slice(-2)) + 7) % 90 + 10;
    const no = `T${String(today.getFullYear()).slice(2)}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${tail}`;
    setDone({ no, name, phone, date: d, slot: SESSIONS[pick.s], people });
  };

  const input = `mt-1.5 w-full border bg-white px-3 py-2.5 text-[16px] ${focusRing}`;

  if (done) {
    const reply = nextOpenDay(today);
    return (
      <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.25, ease: EASE }} className="border-2 p-5 md:p-8" style={{ borderColor: C.ink, background: C.white }} role="status">
        <p className="text-[22px] md:text-[26px]" style={serifF}>
          시음회 예약이 접수됐어요
        </p>
        <dl className="mt-5 grid max-w-[520px] grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[16px] leading-[1.6]">
          <dt style={{ color: C.muted }}>예약번호</dt>
          <dd className="font-bold tabular-nums">{done.no}</dd>
          <dt style={{ color: C.muted }}>일시</dt>
          <dd>
            {fmtKo(done.date)} {done.slot}
          </dd>
          <dt style={{ color: C.muted }}>인원</dt>
          <dd>{done.people}명</dd>
          <dt style={{ color: C.muted }}>예약자</dt>
          <dd>
            {maskName(done.name)} <span className="tabular-nums">{maskPhone(done.phone)}</span>
          </dd>
          <dt style={{ color: C.muted }}>참가비</dt>
          <dd className="tabular-nums">
            {won(TASTING_FEE * done.people)} (현장 결제, 구매 시 차감)
          </dd>
          <dt style={{ color: C.muted }}>담당 창구</dt>
          <dd>{KAKAO}</dd>
          <dt style={{ color: C.muted }}>회신 예정</dt>
          <dd>{fmtKo(reply)} 영업시간 안에 확인 메시지를 드려요</dd>
        </dl>
        <p className="mt-5 text-[15px] leading-[1.7]" style={{ color: C.muted }}>
          시음회 당일 신분증을 꼭 지참해 주세요. 만 19세 미만은 입장할 수 없습니다.
        </p>
        <button type="button" onClick={() => setDone(null)} className={`mt-5 min-h-11 border px-4 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.ink }}>
          다른 회차 예약
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 border-2 p-5 md:grid-cols-[minmax(0,1fr)_320px] md:p-8" style={{ borderColor: C.ink, background: C.white }}>
      <div>
        <p className="text-[16px] leading-[1.7]">
          토요일마다 두 번, 한 회차 50분. 그날 들어온 술 다섯 가지를 조금씩 맛봅니다.
          <br />
          참가비 {won(TASTING_FEE)}, 시음 뒤 구매하면 참가비는 빼 드려요.
        </p>
        <fieldset className="mt-5">
          <legend className="text-[14px] font-bold">회차 선택</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {dates.map((d, di) => (
              <div key={di} className="border p-3" style={{ borderColor: C.line }}>
                <p className="text-[16px] font-bold">{fmtKo(d)}</p>
                <div className="mt-2 grid gap-2">
                  {SESSIONS.map((s, si) => {
                    const left = TASTING_CAP - takenSeats(di, si);
                    const on = pick?.d === di && pick?.s === si;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setPick({ d: di, s: si })}
                        aria-pressed={on}
                        disabled={left <= 0}
                        className={`flex min-h-11 items-center justify-between border px-3 text-[15px] disabled:opacity-40 ${focusRing}`}
                        style={on ? { background: C.ink, color: C.paper, borderColor: C.ink, fontWeight: 700 } : { borderColor: C.line }}
                      >
                        <span className="tabular-nums">{s}</span>
                        <span className="tabular-nums text-[14px]">{left <= 0 ? "마감" : `남은 자리 ${left}`}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <fieldset>
          <legend className="text-[14px] font-bold">인원</legend>
          <div className="mt-1.5 flex items-center border" style={{ borderColor: C.line }}>
            <button type="button" aria-label="인원 줄이기" onClick={() => setPeople((p) => Math.max(1, p - 1))} className={`h-11 w-11 text-[20px] ${focusRing}`}>
              -
            </button>
            <span className="flex-1 text-center text-[16px] tabular-nums" aria-live="polite">
              {people}명
            </span>
            <button type="button" aria-label="인원 늘리기" onClick={() => setPeople((p) => Math.min(6, p + 1))} className={`h-11 w-11 text-[20px] ${focusRing}`}>
              +
            </button>
          </div>
        </fieldset>
        <label className="mt-4 block text-[14px] font-bold">
          이름
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} style={{ borderColor: C.line }} />
        </label>
        <label className="mt-4 block text-[14px] font-bold">
          휴대폰
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={input} style={{ borderColor: C.line }} />
        </label>
        {err && (
          <p className="mt-3 text-[14px] font-bold" style={{ color: C.error }} role="alert">
            {err}
          </p>
        )}
        <button type="submit" data-gtm-cta="liquor-shop_tasting_reserve" className={`mt-5 min-h-12 w-full text-[16px] font-bold ${focusRing}`} style={{ background: C.ink, color: C.paper }}>
          시음회 예약하기
        </button>
        <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
          예약 확인은 카카오톡 채널로 드려요. 시음회는 만 19세 이상만 참석할 수 있어요.
        </p>
      </div>
    </form>
  );
}

/* ── 5. 매장 안내와 오시는 길 ──────────────────────────── */

function StoreInfo({ today }: { today: Date }) {
  const dow = today.getDay();
  const box = "border-2 p-5";
  const head = "flex items-center gap-2 text-[17px] font-bold";
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr]">
      <div className={box} style={{ borderColor: C.ink, background: C.white }}>
        <p className={head}>
          <Clock size={18} aria-hidden /> 영업시간
        </p>
        <table className="mt-3 w-full text-[15px]">
          <tbody>
            {HOURS.map((h, i) => {
              const isToday = DOW_IDX[i] === dow;
              return (
                <tr key={h.day} aria-current={isToday ? "date" : undefined} style={{ fontWeight: isToday ? 700 : 400, background: isToday ? C.paper : undefined }}>
                  <th scope="row" className="px-2 py-1 text-left" style={{ fontWeight: "inherit" }}>
                    {h.day}
                    {isToday ? " (오늘)" : ""}
                  </th>
                  <td className="px-2 py-1 text-right tabular-nums" style={h.time === "휴무" ? { color: C.muted } : undefined}>
                    {h.time}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
          명절 당일은 쉽니다. 마지막 주문은 마감 30분 전까지.
        </p>
      </div>

      <div className="grid gap-5">
        <div className={box} style={{ borderColor: C.ink, background: C.white }}>
          <p className={head}>
            <Car size={18} aria-hidden /> 주차
          </p>
          <p className="mt-2 text-[15px] leading-[1.7]">건물 지하 주차장 1시간 무료. 매장에서 주차권을 받아 가세요. 만차 시 건너편 공영주차장을 이용해 주세요.</p>
        </div>
        <div className={box} style={{ borderColor: C.ink, background: C.white }}>
          <p className={head}>
            <Truck size={18} aria-hidden /> 택배
          </p>
          <p className="mt-2 text-[15px] leading-[1.7]">
            전통주는 온라인 주문과 택배 배송이 가능합니다. 주문할 때 성인 인증을 거치고, 받는 분도 성인 확인 뒤 전달됩니다. 생막걸리는 아이스팩을 넣어 보내고 수도권은 다음 날 도착해요.
          </p>
        </div>
      </div>

      <div className={box} style={{ borderColor: C.ink, background: C.white }}>
        <p className={head}>
          <MapPin size={18} aria-hidden /> 오시는 길
        </p>
        <p className="mt-2 text-[15px] leading-[1.7]">
          {ADDRESS}
          <br />
          지하철 ㅇㅇ역 3번 출구에서 걸어서 5분. 큰길에서 두 번째 골목으로 들어오면 붉은 도장 간판이 보여요.
        </p>
        <MiniMap />
      </div>
    </div>
  );
}

/** 약도. 큰길, 골목, 역 출구, 매장 위치만 그린다. */
function MiniMap() {
  return (
    <svg viewBox="0 0 320 180" className="mt-4 w-full border" style={{ borderColor: C.line, background: C.paper }} role="img" aria-label="약도: 역 3번 출구에서 큰길을 따라 두 번째 골목으로 들어오면 매장">
      <path d="M0 120 H320" stroke="#d9cfbb" strokeWidth="26" />
      <path d="M0 120 H320" stroke={C.white} strokeWidth="1.5" strokeDasharray="10 8" />
      <path d="M110 120 V0 M200 120 V0 M260 120 V180" stroke="#e4dbc8" strokeWidth="14" />
      <rect x="18" y="128" width="54" height="34" fill={C.white} stroke={C.ink} strokeWidth="1.4" />
      <text x="45" y="149" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.ink}>
        ㅇㅇ역 3번
      </text>
      <path d="M72 118 H200 V60" fill="none" stroke={C.ink} strokeWidth="2" strokeDasharray="5 4" />
      <rect x="206" y="40" width="46" height="30" fill="#b4463a" stroke={C.ink} strokeWidth="1.4" />
      <text x="229" y="59" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.paper}>
        술도가
      </text>
      <text x="155" y="104" textAnchor="middle" fontSize="11" fill={C.muted}>
        ㅇㅇ로
      </text>
      <text x="120" y="24" fontSize="10" fill={C.muted}>
        첫째 골목
      </text>
      <text x="208" y="24" fontSize="10" fill={C.muted}>
        둘째 골목
      </text>
    </svg>
  );
}
