"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Car, Check, Clock, MapPin, Menu, MessageCircle, Phone, TrainFront, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 원목 가구 주문 제작 공방 샘플: 가상의 곰파트너 가구 공방. 상호, 주소, 가격은 모두 가상이다.

   국내 원목 공방 사이트 구성을 따랐다. 메뉴는 제작 가구, 주문 제작, 목재 안내, 작업 과정, 공방 소개, 오시는 길.
   공방들은 치수를 mm로 받고, 견적은 목재 종류와 판재 양으로 내고, 제작 기간은 4~6주, 방문은 예약제가 보통이다.
   마감은 오일과 바니시 두 가지를 둔다. 도면과 확정 견적은 상담 뒤 따로 보낸다.

   화면 구성(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 첫 화면(fw-poster): 대표 가구 사진 격자. 칸마다 수종 칩을 누르면 그 칸 가격이 바뀌고, "이 가구로 문의"는 아래 견적 문의에 가구와 수종을 채운다.
   2. 주문 제작 안내: 가구별 제작 가능 치수와 시작가 표, 목재와 마감 단가, 주문 제작 사례.
   3. 견적 문의: 가구, 목재, 원하는 치수, 이름, 휴대폰, 요청 사항. 보내면 접수 내용과 회신 예정일, 담당 창구가 보인다.
   4. 목재 안내, 작업 과정 네 단계, 공방 소개와 오시는 길.

   첫 화면 사진은 1.06배에서 1배로 1.6초 동안 다가온다(CSS keyframes). 동작 줄이기면 끈다.

   사진 출처: 완성한 가구 piece-(가구 id)는 AI 생성(Z-Image-Turbo) */

const SLUG = "furniture-workshop";
const BRAND = "원목 가구 공방";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 1층";
const KAKAO = "카카오톡 채널 원목 가구 공방";
/* 바닥글 사업자 정보: 전자상거래법 제10조 제1항, 제13조 제1항 표시 사항. 샘플이라 자리 표시로 둔다. */
const BIZ: [string, string][] = [
  ["상호", BRAND],
  ["대표자", "ㅇㅇㅇ"],
  ["주소", ADDRESS],
  ["전화", "02-000-0000"],
  ["메일", "help@example.com"],
  ["사업자등록번호", "000-00-00000"],
  ["통신판매업 신고", "제0000-서울ㅇㅇ-0000호(ㅇㅇ구청)"],
];

const EASE = [0.22, 1, 0.36, 1] as const;

/* 색: 바탕 흰색과 옅은 회색을 번갈아 쓰고, 강조색은 짙은 호두나무 갈색 하나만 버튼과 선택 칩에 쓴다. */
const C = {
  paper: "#f7f7f5",
  sheet: "#ffffff",
  ink: "#111111",
  body: "#4b4b4b",
  soft: "#767676",
  line: "#e5e5e5",
  accent: "#6b4a2e",
  grid: "rgba(0,0,0,0.05)",
  error: "#b42318",
};

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/* ── 가구, 목재, 마감 ───────────────────────────────────── */

type KindId = "table" | "shelf" | "bench" | "tv";
type Range = { min: number; max: number; def: number };
interface Kind {
  id: KindId;
  name: string;
  w: Range;
  d: Range;
  h: Range;
  /** 제작비(공임). 목재비는 판재 양으로 따로 센다. */
  labor: number;
}

const KINDS: Kind[] = [
  { id: "table", name: "테이블", w: { min: 1200, max: 2400, def: 1600 }, d: { min: 600, max: 1000, def: 800 }, h: { min: 700, max: 760, def: 720 }, labor: 250000 },
  { id: "shelf", name: "책장", w: { min: 600, max: 1800, def: 1200 }, d: { min: 250, max: 400, def: 300 }, h: { min: 900, max: 2100, def: 1800 }, labor: 220000 },
  { id: "bench", name: "벤치", w: { min: 1000, max: 2000, def: 1400 }, d: { min: 350, max: 500, def: 400 }, h: { min: 420, max: 480, def: 450 }, labor: 150000 },
  { id: "tv", name: "TV 선반", w: { min: 1200, max: 2400, def: 1800 }, d: { min: 350, max: 500, def: 400 }, h: { min: 400, max: 600, def: 450 }, labor: 230000 },
];

type WoodId = "oak" | "walnut" | "ash" | "redpine";
interface Wood {
  id: WoodId;
  name: string;
  color: string;
  /** 판재 30T 기준 m2당 목재비 */
  rate: number;
  hardness: string;
  desc: string;
}

const WOODS: Wood[] = [
  { id: "oak", name: "오크", color: "#c9a46b", rate: 520000, hardness: "단단함", desc: "결이 또렷하고 단단해요. 식탁 주문이 가장 많아요." },
  { id: "walnut", name: "월넛", color: "#5c3e2a", rate: 780000, hardness: "단단함", desc: "짙은 갈색이에요. 햇빛을 받으면 조금씩 밝아져요." },
  { id: "ash", name: "애쉬", color: "#e3d3b1", rate: 450000, hardness: "단단함", desc: "밝은 색에 결이 길어요. 오크보다 가벼워요." },
  { id: "redpine", name: "레드파인", color: "#d9a06a", rate: 260000, hardness: "무름", desc: "소나무 계열이에요. 무른 대신 값이 좋아요. 책장, 선반에 맞아요." },
];

const FINISHES = [
  { id: "oil", name: "오일", add: 0, desc: "기본 마감이에요. 결이 그대로 보이고 1년에 한 번 다시 발라요." },
  { id: "varnish", name: "바니시", add: 80000, desc: "표면에 막을 만들어요. 물 자국에 강해요." },
] as const;
type FinishId = (typeof FINISHES)[number]["id"];

type Dims = { w: number; d: number; h: number };

/** 완성한 가구 사진. 사진 파일은 piece-(가구 id).jpg */
const PIECES: { kind: KindId; wood: WoodId; finish: FinishId; dims: Dims; alt: string }[] = [
  { kind: "table", wood: "oak", finish: "oil", dims: { w: 1800, d: 850, h: 720 }, alt: "창가 거실에 놓인 오크 원목 식탁과 의자" },
  { kind: "shelf", wood: "redpine", finish: "oil", dims: { w: 1200, d: 300, h: 1800 }, alt: "책과 화분을 올린 레드파인 원목 책장" },
  { kind: "bench", wood: "walnut", finish: "oil", dims: { w: 1400, d: 400, h: 450 }, alt: "현관 옆에 둔 월넛 원목 벤치" },
  { kind: "tv", wood: "ash", finish: "varnish", dims: { w: 2000, d: 400, h: 450 }, alt: "거실 벽 앞에 놓인 애쉬 원목 TV 선반" },
];

/** 가구에 들어가는 판재 양(m2). 상품 칸의 수종별 가격을 내는 데만 쓴다. */
function boardArea(kind: KindId, { w, d, h }: Dims) {
  const W = w / 1000;
  const D = d / 1000;
  const H = h / 1000;
  switch (kind) {
    case "table":
      // 상판 + 에이프런 4면 + 다리 4개
      return W * D + 0.16 * (W + D) + 0.3 * H;
    case "shelf": {
      const plates = shelfCount(h) + 2;
      return 2 * D * H + plates * W * D;
    }
    case "bench":
      return W * D + 2 * D * H + 0.1 * W;
    case "tv":
      return 2 * W * D + 2 * D * H + 2 * D * Math.max(0.1, H - 0.15) + 0.5 * W * H;
  }
}

/** 책장 속 선반 수. 400mm 간격에 가깝게. */
const shelfCount = (h: number) => Math.max(1, Math.round(h / 400) - 1);

function quote(kind: Kind, dims: Dims, wood: Wood, finish: FinishId) {
  const area = boardArea(kind.id, dims);
  const material = Math.round((area * wood.rate) / 10000) * 10000;
  const fin = FINISHES.find((f) => f.id === finish)?.add ?? 0;
  return { area, material, labor: kind.labor, finish: fin, total: material + kind.labor + fin };
}

/* ── 포스터 첫 화면 ─────────────────────────────────────── */

const IMG = "/images/demo-furniture-workshop";

/* 첫 화면 모션(ms). 상품 사진이 1.06배에서 1600 동안 제자리로 온다(CSS keyframes, 끝 상태가 기본값). 동작 줄이기면 끈다. */
const HERO_IN_MS = 1600;
const HERO_TEXT_DELAY_MS = 300;
const HERO_TEXT_MS = 700;
const EASE_CSS = `cubic-bezier(${EASE.join(",")})`;

const HERO_CSS = `
@keyframes fw-hero-in { from { transform: scale(1.06); } }
@keyframes fw-hero-rise { from { opacity: 0; transform: translateY(12px); } }
.fw-hero-photo { animation: fw-hero-in ${HERO_IN_MS}ms ${EASE_CSS} both; }
.fw-hero-rise { animation: fw-hero-rise ${HERO_TEXT_MS}ms ${EASE_CSS} ${HERO_TEXT_DELAY_MS}ms both; }
@media (prefers-reduced-motion: reduce) { .fw-hero-photo, .fw-hero-rise { animation: none; } }
`;

/* 첫 화면: 모델 번호가 붙은 상품 격자. 칸마다 수종 칩을 누르면 그 칸 가격만 바뀐다(사진은 가구마다 한 장) */
const MODEL: Record<KindId, string> = { table: "T-01", shelf: "S-01", bench: "B-01", tv: "TV-01" };
/** 칸마다 수종 칩 3개. 첫 칩은 사진 속 가구의 수종 */
const cardWoods = (photo: WoodId): WoodId[] => [photo, ...(["oak", "walnut", "ash"] as WoodId[]).filter((w) => w !== photo)].slice(0, 3);
const PHOTO_POS: Record<KindId, string> = { table: "50% 60%", shelf: "50% 35%", bench: "50% 62%", tv: "50% 62%" };

const GNB: { label: string; id: string }[] = [
  { label: "제작 가구", id: "fw-p-table" },
  { label: "주문제작", id: "fw-order" },
  { label: "목재", id: "fw-wood-guide" },
  { label: "작업 과정", id: "fw-process" },
  { label: "공방", id: "fw-about" },
];

function Poster({ reduce, go, onPiece }: { reduce: boolean; go: (id: string) => void; onPiece: (kind: KindId, wood: WoodId) => void }) {
  const [menu, setMenu] = useState(false);
  const [woods, setWoods] = useState<Record<KindId, WoodId>>(() => Object.fromEntries(PIECES.map((p) => [p.kind, p.wood])) as Record<KindId, WoodId>);

  useEffect(() => {
    if (!menu) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [menu]);

  const pick = (g: (typeof GNB)[number]) => {
    setMenu(false);
    go(g.id);
  };

  return (
    <section id="fw-poster" aria-labelledby="fw-poster-title" style={{ background: C.sheet }}>
      <style>{HERO_CSS}</style>
      {/* GNB. 휴대폰은 햄버거 */}
      <header className="relative border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
          <SampleLogo />
          <nav aria-label="주요 메뉴" className="hidden items-center gap-1 md:flex">
            {GNB.map((g) => (
              <button key={g.label} type="button" onClick={() => pick(g)} className={`h-11 rounded-[4px] px-3 text-[16px] font-semibold underline-offset-4 hover:underline ${focusRing}`} style={{ color: C.ink, outlineColor: C.accent }}>
                {g.label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-controls="fw-menu-panel"
            aria-label={menu ? "메뉴 닫기" : "메뉴 열기"}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-[4px] md:hidden ${focusRing}`}
            style={{ color: C.ink, outlineColor: C.accent }}
          >
            {menu ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
          </button>
        </div>
        <AnimatePresence>
          {menu && (
            <motion.nav
              id="fw-menu-panel"
              aria-label="메뉴 펼침"
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: EASE }}
              className="absolute inset-x-0 top-full z-30 grid grid-cols-2 gap-2 border-b p-4 md:hidden"
              style={{ borderColor: C.line, background: C.sheet }}
            >
              {GNB.map((g) => (
                <button key={g.label} type="button" onClick={() => pick(g)} className={`h-12 rounded-[4px] border text-[16px] font-semibold ${focusRing}`} style={{ borderColor: C.line, color: C.ink, outlineColor: C.accent }}>
                  {g.label}
                </button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* 얇은 띠 한 줄: 문장과 견적 버튼 */}
      <div className="border-b" style={{ borderColor: C.line, background: C.paper }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 md:px-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <h1 id="fw-poster-title" className="text-[20px] font-bold leading-[1.3] md:text-[24px]" style={{ color: C.ink, letterSpacing: "-0.03em", wordBreak: "keep-all" }}>
              원하는 치수로 한 점씩 제작합니다
            </h1>
            <p className="text-[15px]" style={{ color: C.soft }}>
              제작 기간 4~6주
            </p>
          </div>
          <button
            type="button"
            onClick={() => go("fw-quote")}
            data-gtm-cta={`${SLUG}_poster_cta`}
            className={`inline-flex h-11 items-center rounded-[6px] px-4 text-[15px] font-semibold text-white ${focusRing}`}
            style={{ background: C.accent, outlineColor: C.accent }}
          >
            주문제작 견적
          </button>
        </div>
      </div>

      {/* 상품 격자 */}
      <ul className="mx-auto grid max-w-[1200px] gap-x-6 gap-y-8 px-4 pb-12 pt-6 md:grid-cols-2 md:px-6 md:pt-8">
        {PIECES.map((p, i) => {
          const k = KINDS.find((x) => x.id === p.kind)!;
          const w = WOODS.find((x) => x.id === woods[p.kind])!;
          const price = quote(k, p.dims, w, "oil").total;
          return (
            <li key={p.kind} id={`fw-p-${p.kind}`} className="min-w-0 scroll-mt-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]" style={{ background: C.paper }}>
                {woods[p.kind] !== p.wood && (
                  <span className="absolute left-2 top-2 z-10 rounded-[3px] px-2 py-1 text-[13px] font-semibold" style={{ background: C.sheet, color: C.ink }}>
                    사진 {WOODS.find((x) => x.id === p.wood)!.name}
                  </span>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                <img
                  src={`${IMG}/piece-${p.kind}.jpg`}
                  alt={p.alt}
                  width={720}
                  height={900}
                  loading={i < 2 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  className={`h-full w-full object-cover ${reduce ? "" : "fw-hero-photo"}`}
                  style={{ objectPosition: PHOTO_POS[p.kind] }}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-[19px] font-bold" style={{ color: C.ink }}>
                  <span className="mr-2 tabular-nums" style={{ color: C.soft }}>
                    {MODEL[p.kind]}
                  </span>
                  원목 {k.name}
                </p>
                <p className="text-[18px] font-bold tabular-nums" style={{ color: C.ink }}>
                  {won(price)}
                </p>
              </div>
              <p className="mt-1 text-[14px] tabular-nums" style={{ color: C.soft }}>
                폭 {p.dims.w} 깊이 {p.dims.d} 높이 {p.dims.h}mm, 오일 마감
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div role="radiogroup" aria-label={`${MODEL[p.kind]} 수종`} className="flex gap-1.5">
                  {cardWoods(p.wood).map((id) => {
                    const wd = WOODS.find((x) => x.id === id)!;
                    const on = woods[p.kind] === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setWoods((s) => ({ ...s, [p.kind]: id }))}
                        className={`inline-flex h-11 items-center gap-1.5 rounded-[4px] border px-3 text-[15px] ${on ? "font-bold" : ""} ${focusRing}`}
                        style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : C.sheet, color: on ? "#fff" : C.ink, outlineColor: C.accent }}
                      >
                        <span aria-hidden className="inline-block h-3.5 w-3.5 rounded-full border" style={{ background: wd.color, borderColor: on ? "rgba(255,255,255,0.7)" : C.line }} />
                        {wd.name}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => onPiece(p.kind, woods[p.kind])}
                  className={`ml-auto inline-flex h-11 items-center rounded-[4px] px-1 text-[15px] font-semibold underline underline-offset-4 ${focusRing}`}
                  style={{ color: C.ink, outlineColor: C.accent }}
                >
                  이 가구로 문의
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── 화면 ─────────────────────────────────────────────── */

/** 주문 제작 사례. 사진은 첫 화면 가구 사진을 다시 쓴다. */
const CASES: { kind: KindId; title: string; spec: string; note: string; weeks: string }[] = [
  { kind: "table", title: "6인 식탁, 다리 사이 넓게", spec: "1800 x 850 x 720, 오크 오일", note: "의자 6개가 들어가게 다리를 안쪽으로 70mm 들였어요.", weeks: "5주" },
  { kind: "shelf", title: "벽 한쪽을 채우는 책장", spec: "1200 x 300 x 1800, 레드파인 오일", note: "문고본 칸은 낮게, 아래 두 칸은 큰 책이 들어가게 나눴어요.", weeks: "4주" },
  { kind: "tv", title: "낮은 거실 TV 선반", spec: "2000 x 400 x 450, 애쉬 바니시", note: "셋톱박스 선이 지나가게 뒤판에 구멍을 냈어요.", weeks: "6주" },
];

type Lead = { name: string; phone: string; kind: KindId; wood: WoodId; size: string };

export function FurnitureWorkshopDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [pre, setPre] = useState<{ kind: KindId; wood: WoodId; n: number }>({ kind: "table", wood: "oak", n: 0 });
  const [lead, setLead] = useState<Lead | null>(null);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div className="min-h-screen overflow-x-clip [&_h2]:text-[#111111] [&_h3]:text-[#111111]" style={{ background: C.paper, color: C.body }}>
      <Poster
        reduce={reduce}
        go={go}
        onPiece={(kind, wood) => {
          setLead(null);
          setPre((s) => ({ kind, wood, n: s.n + 1 }));
          go("fw-quote");
        }}
      />

      {/* 주문 제작 안내와 견적 문의 */}
      <main id="fw-order" className="mx-auto grid max-w-[1200px] scroll-mt-4 gap-8 px-4 pb-4 pt-2 md:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10 lg:pt-6">
        <div className="min-w-0">
          <h2 className="text-[28px] font-bold leading-[1.2] md:text-[34px]">원목 가구 주문 제작</h2>
          <p className="mt-2 text-[16px] leading-[1.6]" style={{ color: C.soft }}>
            원하는 치수를 mm로 적어 문의해 주세요. 도면과 확정 견적은 상담 뒤 보내 드립니다. 한 달에 두세 점만 받습니다.
          </p>

          <section aria-labelledby="fw-size-title" className="mt-6">
            <h3 id="fw-size-title" className="text-[20px] font-bold">
              제작 가능 치수
            </h3>
            {/* 휴대폰: 가구마다 한 줄 */}
            <ul className="mt-3 divide-y rounded-[4px] border md:hidden" style={{ borderColor: C.line, background: C.sheet }}>
              {KINDS.map((k) => (
                <li key={`m${k.id}`} className="px-3 py-2.5 tabular-nums" style={{ borderColor: C.line }}>
                  <p className="flex items-baseline justify-between gap-3">
                    <span className="font-bold" style={{ color: C.ink }}>
                      {k.name}
                    </span>
                    <span className="whitespace-nowrap font-bold" style={{ color: C.ink }}>
                      {won(quote(k, { w: k.w.min, d: k.d.min, h: k.h.min }, WOODS.find((w) => w.id === "redpine")!, "oil").total)}~
                    </span>
                  </p>
                  <p className="mt-0.5 text-[14px]" style={{ color: C.soft }}>
                    폭 {k.w.min}~{k.w.max}, 깊이 {k.d.min}~{k.d.max}, 높이 {k.h.min}~{k.h.max}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-3 hidden overflow-x-auto rounded-[4px] border md:block" style={{ borderColor: C.line, background: C.sheet }}>
              <table className="w-full min-w-[520px] text-left text-[15px]">
                <thead style={{ background: C.paper }}>
                  <tr>
                    {["가구", "폭", "깊이", "높이", "시작가"].map((h) => (
                      <th key={h} scope="col" className="px-3 py-2.5 font-bold" style={{ color: C.ink }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {KINDS.map((k) => (
                    <tr key={k.id} className="border-t tabular-nums" style={{ borderColor: C.line }}>
                      <th scope="row" className="px-3 py-2.5 font-bold" style={{ color: C.ink }}>
                        {k.name}
                      </th>
                      <td className="px-3 py-2.5">
                        {k.w.min}~{k.w.max}
                      </td>
                      <td className="px-3 py-2.5">
                        {k.d.min}~{k.d.max}
                      </td>
                      <td className="px-3 py-2.5">
                        {k.h.min}~{k.h.max}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-bold" style={{ color: C.ink }}>
                        {won(quote(k, { w: k.w.min, d: k.d.min, h: k.h.min }, WOODS.find((w) => w.id === "redpine")!, "oil").total)}~
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-3 grid gap-1.5 text-[14px] leading-[1.6]" style={{ color: C.soft }}>
              <li>단위 mm. 시작가는 가장 작은 치수, 레드파인, 오일 마감 기준입니다.</li>
              <li>견적은 목재비(판재 양 x 목재 단가), 제작비, 마감비를 더해 냅니다. 부가세와 서울 배송 포함.</li>
              <li>범위 밖 치수와 둥근 상판, 서랍은 문의 때 적어 주세요.</li>
            </ul>
          </section>

          <section aria-labelledby="fw-rate-title" className="mt-8">
            <h3 id="fw-rate-title" className="text-[20px] font-bold">
              목재와 마감 단가
            </h3>
            <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 rounded-[4px] border text-[15px]" style={{ borderColor: C.line, background: C.sheet }}>
              {WOODS.map((w) => (
                <div key={w.id} className="col-span-2 grid grid-cols-subgrid border-b px-3 py-2.5" style={{ borderColor: C.line }}>
                  <dt className="flex items-center gap-2">
                    <WoodSwatch color={w.color} className="h-4 w-4 rounded-[2px]" />
                    {w.name}
                  </dt>
                  <dd className="text-right tabular-nums">30T 판재 m2당 {won(w.rate)}</dd>
                </div>
              ))}
              {FINISHES.map((f, i) => (
                <div key={f.id} className={`col-span-2 grid grid-cols-subgrid px-3 py-2.5 ${i === 0 ? "border-b" : ""}`} style={{ borderColor: C.line }}>
                  <dt>{f.name} 마감</dt>
                  <dd className="text-right tabular-nums">{f.add ? `+${won(f.add)}` : "기본 포함"}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="fw-case-title" className="mt-8">
            <h3 id="fw-case-title" className="text-[20px] font-bold">
              주문 제작 사례
            </h3>
            <ul className="mt-3 grid gap-4">
              {CASES.map((c) => {
                const p = PIECES.find((x) => x.kind === c.kind)!;
                return (
                  <li key={c.kind} className="grid grid-cols-[112px_minmax(0,1fr)] gap-4 rounded-[4px] border p-3 sm:grid-cols-[160px_minmax(0,1fr)]" style={{ borderColor: C.line, background: C.sheet }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                    <img src={`${IMG}/piece-${c.kind}.jpg`} alt={p.alt} width={320} height={240} loading="lazy" className="aspect-[4/3] w-full rounded-[3px] object-cover" style={{ objectPosition: PHOTO_POS[c.kind] }} />
                    <div className="min-w-0">
                      <p className="text-[16px] font-bold" style={{ color: C.ink }}>
                        {c.title}
                      </p>
                      <p className="mt-0.5 text-[14px] tabular-nums" style={{ color: C.soft }}>
                        {c.spec}, 제작 {c.weeks}
                      </p>
                      <p className="mt-1.5 text-[15px] leading-[1.6]">{c.note}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-6">
          <section id="fw-quote" aria-labelledby="fw-quote-title" className="scroll-mt-4 rounded-[4px] border p-4 md:p-5" style={{ borderColor: C.line, background: C.sheet }}>
            <h2 id="fw-quote-title" className="text-[18px] font-bold">
              견적 문의
            </h2>
            <p className="mt-2 flex items-start gap-2 text-[15px] leading-[1.5]">
              <Clock size={18} aria-hidden className="mt-0.5 flex-none" />
              <span>
                제작 기간 4~6주
                <span className="block text-[14px]" style={{ color: C.soft }}>
                  오늘 확정하면 {fmtKo(daysAgo(today, -28))} ~ {fmtKo(daysAgo(today, -42))} 완성
                </span>
              </span>
            </p>
            {/* 전자상거래법 제17조 제2항 제6호, 시행령 제21조: 주문 제작 재화는 미리 따로 알리고 서면 동의를 받은 경우 청약철회 제한 */}
            <p className="mt-2 rounded-[4px] px-3 py-2 text-[14px] leading-[1.55]" style={{ background: C.paper }}>
              주문에 맞춰 한 점씩 만드는 가구라 제작을 시작하면 청약철회가 제한될 수 있습니다. 계약 전에 따로 알려 드리고 서면 동의를 받습니다.
            </p>
            <AnimatePresence mode="wait" initial={false}>
              {lead ? (
                <motion.div key="done" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: EASE }}>
                  <Received lead={lead} today={today} onReset={() => setLead(null)} />
                </motion.div>
              ) : (
                <motion.div key={`form-${pre.n}`} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: EASE }}>
                  <InquiryForm initKind={pre.kind} initWood={pre.wood} onDone={setLead} />
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </aside>
      </main>

      {/* 목재 안내 */}
      <section id="fw-wood-guide" aria-labelledby="fw-wood-guide-title" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pt-12 md:px-6 md:pt-16">
        <h2 id="fw-wood-guide-title" className="text-[24px] font-bold md:text-[28px]">
          목재 안내
        </h2>
        <p className="mt-2 text-[16px] leading-[1.6]" style={{ color: C.soft }}>
          네 가지만 씁니다. 전부 건조가 끝난 판재예요.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WOODS.map((w) => (
            <li key={w.id} className="rounded-[4px] border" style={{ borderColor: C.line, background: C.sheet }}>
              <WoodSwatch color={w.color} className="h-28 w-full rounded-t-[3px]" />
              <div className="p-4">
                <p className="flex items-baseline justify-between gap-2">
                  <b className="text-[18px]">{w.name}</b>
                  <span className="text-[13px]" style={{ color: C.soft }}>
                    {w.hardness}
                  </span>
                </p>
                <p className="mt-1.5 text-[15px] leading-[1.6]">{w.desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <ul className="mt-4 grid gap-2 text-[15px] leading-[1.6] sm:grid-cols-2">
          {FINISHES.map((f) => (
            <li key={f.id} className="rounded-[4px] border px-4 py-3" style={{ borderColor: C.line, background: C.sheet }}>
              <b>{f.name} 마감</b> {f.desc}
            </li>
          ))}
        </ul>
      </section>

      {/* 작업 과정 */}
      <section id="fw-process" aria-labelledby="fw-process-title" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pt-12 md:px-6 md:pt-16">
        <h2 id="fw-process-title" className="text-[24px] font-bold md:text-[28px]">
          작업 과정
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.name} className="rounded-[4px] border p-4" style={{ borderColor: C.line, background: C.sheet }}>
              <p className="flex items-baseline justify-between gap-2">
                <b className="text-[17px]" style={{ color: C.ink }}>
                  {i + 1}. {s.name}
                </b>
                <span className="text-[13px] tabular-nums" style={{ color: C.soft }}>
                  {s.days}
                </span>
              </p>
              <p className="mt-2 text-[15px] leading-[1.65]">{s.desc}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[15px] leading-[1.6]" style={{ color: C.soft }}>
          목재 수급과 건조 대기까지 합쳐 4~6주예요. 작업 중 사진은 단계마다 한 번 보내 드려요.
        </p>
      </section>

      {/* 공방 소개, 오시는 길 */}
      <section id="fw-about" aria-labelledby="fw-about-title" className="mx-auto grid max-w-[1200px] gap-8 scroll-mt-4 px-4 pt-12 md:grid-cols-2 md:px-6 md:pt-16">
        <div>
          <h2 id="fw-about-title" className="text-[24px] font-bold md:text-[28px]">
            공방 소개
          </h2>
          <p className="mt-3 text-[16px] leading-[1.75]">
            둘이서 하는 공방이에요. 집성판 대신 원목 판재를 짜서 만듭니다. 한 달에 두세 점만 받고, 한 점이 끝나야 다음 점을 시작해요. 도면은 주문마다 새로 그리고 확인을 받은 뒤에 재단합니다.
          </p>
          <ul className="mt-4 grid gap-2 text-[15px]">
            {["원목 판재 30T 이상만 사용", "도면 확인 뒤 재단", "무상 보수 1년(갈라짐, 휨)", "오일 마감 리터치 방문 가능"].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check size={16} aria-hidden className="mt-1 flex-none" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div id="fw-map" className="scroll-mt-4">
          <h2 className="text-[24px] font-bold md:text-[28px]">
            오시는 길
          </h2>
          <div className="mt-3 overflow-hidden rounded-[4px] border" style={{ borderColor: C.line, background: C.sheet }}>
            <MapSketch />
          </div>
          <ul className="mt-3 grid gap-2 text-[15px] leading-[1.6]">
            <li className="flex items-start gap-2">
              <MapPin size={18} aria-hidden className="mt-0.5 flex-none" />
              {ADDRESS}
            </li>
            <li className="flex items-start gap-2">
              <TrainFront size={18} aria-hidden className="mt-0.5 flex-none" />
              ㅇㅇ역 3번 출구 도보 8분
            </li>
            <li className="flex items-start gap-2">
              <Clock size={18} aria-hidden className="mt-0.5 flex-none" />
              10:00~18:00, 일요일과 공휴일 휴무
            </li>
            <li className="flex items-start gap-2">
              <Car size={18} aria-hidden className="mt-0.5 flex-none" />
              주차 2대, 예약 때 말씀해 주세요
            </li>
            <li className="flex items-start gap-2 font-bold">
              <MessageCircle size={18} aria-hidden className="mt-0.5 flex-none" />
              공방 방문은 예약제. {KAKAO}로 날짜를 잡아 주세요
            </li>
          </ul>
        </div>
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pb-24 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.soft }}>
        <p>
          <SampleLogo />
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-0.5">
          {BIZ.map(([k, v]) => (
            <div key={k} className="flex gap-1.5">
              <dt>{k}</dt>
              <dd className="tabular-nums" style={{ color: C.body }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
        {/* 11-08 전자상거래법 제10조 이용약관 표시. 다른 샘플과 같이 눌러도 창은 열리지 않는다 */}
        <p className="mt-2 flex gap-4">
          <button type="button" className={`font-bold hover:underline ${focusRing}`} style={{ color: C.ink, outlineColor: C.accent }}>
            이용약관
          </button>
          <button type="button" className={`font-bold hover:underline ${focusRing}`} style={{ color: C.ink, outlineColor: C.accent }}>
            개인정보처리방침
          </button>
        </p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

/** 나무 결. 색 위에 가느다란 결 줄을 겹친다. */
function WoodSwatch({ color, className = "" }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`block ${className}`}
      style={{
        background: `repeating-linear-gradient(100deg, rgba(0,0,0,0.08) 0 1px, transparent 1px 7px, rgba(255,255,255,0.10) 7px 8px, transparent 8px 15px), ${color}`,
      }}
    />
  );
}

/* ── 견적 문의 ──────────────────────────────────────── */

function InquiryForm({ initKind, initWood, onDone }: { initKind: KindId; initWood: WoodId; onDone: (r: Lead) => void }) {
  const [kind, setKind] = useState<KindId>(initKind);
  const [wood, setWood] = useState<WoodId>(initWood);
  const [size, setSize] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setErr("이름을 두 글자 이상 넣어 주세요.");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) return setErr("휴대폰 번호를 다시 확인해 주세요.");
    setErr(null);
    onDone({ name: name.trim(), phone, kind, wood, size: size.trim() });
  };

  const field = `mt-1 w-full rounded-[4px] border bg-white px-3 py-2.5 text-[16px] ${focusRing}`;
  const k = KINDS.find((x) => x.id === kind)!;

  return (
    <form onSubmit={submit} noValidate className="mt-4 border-t pt-4" style={{ borderColor: C.line }}>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-[14px] font-bold">
          가구
          <select value={kind} onChange={(e) => setKind(e.target.value as KindId)} className={field} style={{ borderColor: C.line, outlineColor: C.accent }}>
            {KINDS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[14px] font-bold">
          목재
          <select value={wood} onChange={(e) => setWood(e.target.value as WoodId)} className={field} style={{ borderColor: C.line, outlineColor: C.accent }}>
            {WOODS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="mt-3 block text-[14px] font-bold">
        원하는 치수(mm)
        <input value={size} onChange={(e) => setSize(e.target.value)} placeholder={`폭 ${k.w.def} 깊이 ${k.d.def} 높이 ${k.h.def}`} className={field} style={{ borderColor: C.line, outlineColor: C.accent }} />
      </label>
      <label className="mt-3 block text-[14px] font-bold">
        이름
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={{ borderColor: C.line, outlineColor: C.accent }} />
      </label>
      <label className="mt-3 block text-[14px] font-bold">
        휴대폰
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" className={field} style={{ borderColor: C.line, outlineColor: C.accent }} />
      </label>
      <label className="mt-3 block text-[14px] font-bold">
        요청 사항
        <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} placeholder="모서리 둥글게, 서랍 하나" className={`${field} resize-none`} style={{ borderColor: C.line, outlineColor: C.accent }} />
      </label>
      {err && (
        <p role="alert" className="mt-2 text-[14px] font-bold" style={{ color: C.error }}>
          {err}
        </p>
      )}
      <button type="submit" data-gtm-cta={`${SLUG}_inquiry`} className={`mt-4 w-full rounded-[6px] py-3 text-[16px] font-semibold text-white transition-transform duration-100 active:translate-y-[1px] ${focusRing}`} style={{ background: C.accent, outlineColor: C.accent }}>
        견적 문의 보내기
      </button>
    </form>
  );
}

function Received({ lead, today, onReset }: { lead: Lead; today: Date; onReset: () => void }) {
  const k = KINDS.find((x) => x.id === lead.kind)!;
  const w = WOODS.find((x) => x.id === lead.wood)!;
  return (
    <div className="mt-4 border-t pt-4" style={{ borderColor: C.line }} aria-live="polite">
      <h3 className="flex items-center gap-2 text-[16px] font-bold">
        <Check size={18} aria-hidden /> 문의 접수
      </h3>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
        <dt style={{ color: C.soft }}>이름</dt>
        <dd>{maskName(lead.name)}</dd>
        <dt style={{ color: C.soft }}>휴대폰</dt>
        <dd className="tabular-nums">{maskPhone(lead.phone)}</dd>
        <dt style={{ color: C.soft }}>내용</dt>
        <dd>
          {k.name}, {w.name}
          {lead.size ? `, ${lead.size}` : ""}
        </dd>
        <dt style={{ color: C.soft }}>회신 예정</dt>
        <dd className="font-bold">{fmtKo(daysAgo(today, -2))}까지 도면과 견적</dd>
        <dt style={{ color: C.soft }}>담당 창구</dt>
        <dd>
          {KAKAO}
          <span className="block text-[14px]" style={{ color: C.soft }}>
            <Phone size={13} aria-hidden className="mr-1 inline" />
            전화 상담은 운영시간 10:00~18:00
          </span>
        </dd>
      </dl>
      <button type="button" onClick={onReset} className={`mt-4 w-full rounded-[3px] py-1.5 text-[14px] underline underline-offset-4 ${focusRing}`} style={{ color: C.soft, outlineColor: C.accent }}>
        다른 가구 문의
      </button>
    </div>
  );
}

/* ── 작업 과정 ──────────────────────────────────────── */

const STEPS = [
  { name: "재단", days: "2~3일", desc: "도면대로 판재를 자르고 폭을 맞춰요. 결 방향을 보고 어느 판을 어디에 쓸지 짝을 정해요." },
  { name: "조립", days: "3~4일", desc: "짜맞춤과 목심으로 붙여요. 접착한 뒤 하루 동안 눌러 두고, 다음 날 직각을 다시 봐요." },
  { name: "샌딩", days: "2일", desc: "120방부터 320방까지 네 번 갈아요. 모서리는 손으로 둥글려 손에 걸리는 곳이 없게 해요." },
  { name: "마감", days: "1주", desc: "오일은 세 번 바르고 사이마다 하루 말려요. 바니시는 두 번. 다 마른 뒤 사진을 보내 드려요." },
];

/** 오시는 길 약도. 큰길, 골목, 역, 공방 자리만 그린다. */
function MapSketch() {
  return (
    <svg viewBox="0 0 480 220" role="img" aria-label="약도: ㅇㅇ역 3번 출구에서 큰길을 따라 걷다 두 번째 골목 안쪽에 공방" className="block h-auto w-full">
      <defs>
        <pattern id="fw-grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M12 0H0V12" fill="none" stroke={C.grid} strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="480" height="220" fill="url(#fw-grid)" />
      <path d="M0 150 H480" stroke={C.ink} strokeWidth="14" fill="none" opacity="0.18" />
      <path d="M0 150 H480" stroke={C.sheet} strokeWidth="2" strokeDasharray="10 8" fill="none" />
      <path d="M120 150 V40 M300 150 V20" stroke={C.ink} strokeWidth="6" fill="none" opacity="0.18" />
      <path d="M300 90 H420" stroke={C.ink} strokeWidth="6" fill="none" opacity="0.18" />
      <rect x="40" y="160" width="60" height="26" rx="2" fill={C.ink} />
      <text x="70" y="178" fontSize="12" fontWeight="700" textAnchor="middle" fill={C.sheet}>
        ㅇㅇ역
      </text>
      <text x="70" y="202" fontSize="11" textAnchor="middle" fill={C.soft}>
        3번 출구
      </text>
      <path d="M100 150 H300 V90 H360" stroke={C.ink} strokeWidth="2" strokeDasharray="4 4" fill="none" />
      <text x="200" y="138" fontSize="11" textAnchor="middle" fill={C.soft}>
        도보 8분
      </text>
      <rect x="348" y="66" width="104" height="48" rx="2" fill={C.sheet} stroke={C.ink} strokeWidth="2" />
      <text x="400" y="86" fontSize="12" fontWeight="700" textAnchor="middle" fill={C.ink}>
        {BRAND}
      </text>
      <text x="400" y="103" fontSize="10" textAnchor="middle" fill={C.soft}>
        1층, 주차 2대
      </text>
      <text x="130" y="60" fontSize="11" fill={C.soft}>
        ㅇㅇ로
      </text>
    </svg>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold leading-none tracking-[-0.03em]`}>원목 가구 공방</span>
      </span>
    </span>
  );
}
