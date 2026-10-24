"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion, MotionValue, useMotionTemplate, useMotionValue, useScroll, useTransform } from "framer-motion";
import { Car, Check, Clock, Lightbulb, LightbulbOff, MapPin, Minus, Plus, Power, RotateCcw, Trash2, Train } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 조명 가게 홈페이지 샘플: 가상의 조명 가게 곰파트너. 상호, 주소, 전화는 모두 가상이다.
   첫 화면 사진 출처: Pexels 사진 14680170. 상품 사진은 AI 생성(Z-Image-Turbo)

   국내 조명 가게와 조명 쇼핑몰 공통 구성: 상단 분류(펜던트, 스탠드, 레일, 벽등, 간접조명), 공간별 조명 추천,
   색온도 안내(전구색 2700K~3000K, 주백색 4000K, 주광색 6500K), 전구 별매와 LED 일체형 표기, 레일 1m 포함 같은 구성 표기,
   시공 안내(레일 설치비 별도, 전기 공사 별도), 매장 전시장 안내와 오시는 길, 주차 안내, 상담신청.

   핵심 모션: 첫 화면은 펜던트 조명 사진 한 장이 1.6초 동안 천천히 다가오고(scale 1.06 -> 1) 문장은 0.3초 늦게 올라온다.
   스크롤하면 사진만 조금 느리게 움직인다. 본문의 커서 스포트라이트는 그대로 둔다. 방 화면은 불 꺼진 방 그림이고 포인터가 비추는 곳만 보인다(mask-image radial-gradient,
   useMotionValue + useMotionTemplate, 지연 없이 따라감). 조명 스위치를 누르면 그 조명이 켜져 주변이 밝게 남는다(마스크에 타원 추가,
   켜질 때 120ms 번쩍 뒤 안정). 색온도 슬라이더는 켜진 빛 색(multiply 겹층), 밝기 슬라이더는 빛 세기와 비추는 범위.
   터치 기기는 탭한 자리를 비춘다. 동작 줄이기면 전부 켜진 상태로 시작하고 스포트라이트는 쓰지 않는다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 조명 켜고 끄기: 방 그림의 조명 4개 스위치, 전체 켜기 버튼.
   2. 색온도와 밝기: 색온도 슬라이더(2700K~6500K 눈금), 밝기 슬라이더, 공간별 추천.
   3. 제품 둘러보기: 분류별 제품 카드, "방에 걸어 보기"를 누르면 방 그림의 조명이 그 제품 모양으로 바뀐다.
   4. 견적 담기와 시공 상담: 담은 제품 합계, 시공 여부, 상담신청과 접수 완료 화면.
   5. 매장 안내와 오시는 길: 영업시간(오늘 요일 진하게), 주차, 전시장 안내.

   포스터 첫 화면(ls-poster): 사진 위에 아래와 왼쪽을 어둡게 하는 막을 깔고 왼쪽 아래에 문장을 둔다.
   등장은 CSS keyframes라 JS 전에도 끝 상태가 보이고, 동작 줄이기면 처음부터 정지 화면이다. */

const BRAND = "곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 1층";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className={small ? "h-6 w-6 shrink-0" : "h-7 w-7 shrink-0"} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold tracking-[-0.03em]`}>곰파트너</span>
        <span className="text-[12px] font-semibold opacity-75">조명 샘플</span>
      </span>
    </span>
  );
}
const IMG = "/images/demo-lighting-shop";

const C = {
  bg: "#141414",
  panel: "#1b1b1b",
  line: "#2e2e2e",
  cream: "#f2f2f2",
  creamDim: "#a8a8a8",
  amber: "#c8a165",
  ink: "#141414",
  error: "#ff8f7a",
};

/* 모션 상수 */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 켜질 때 번쩍이는 시간(ms). 이 시간 뒤 안정 구간으로 넘어간다. */
const FLASH_MS = 120;
/** 번쩍 뒤 제자리로 돌아오는 시간(ms) */
const SETTLE_MS = 240;
/** 꺼질 때(ms) */
const OFF_MS = 180;
/** 스포트라이트가 커지고 사라지는 시간(ms) */
const SPOT_MS = 220;
/** 스포트라이트 반지름(px) */
const SPOT_R = 240;

/* 방 그림 좌표계 */
const VW = 1000;
const VH = 560;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/* 색온도 눈금과 빛 색. 켜진 방 위에 multiply로 겹친다. */
const KELVIN = [
  { k: 2700, name: "전구색", color: "#ffb469" },
  { k: 3000, name: "전구색", color: "#ffc98c" },
  { k: 4000, name: "주백색", color: "#ffe4c2" },
  { k: 5700, name: "주백색", color: "#fff5ea" },
  { k: 6500, name: "주광색", color: "#edf2ff" },
] as const;

/* 공간별 추천. 조명 가게에서 안내하는 대로. */
const ROOMS = [
  { room: "침실", idx: 0, note: "잠들기 전 눈이 편한 전구색" },
  { room: "거실", idx: 1, note: "따뜻하면서 어둡지 않은 3000K" },
  { room: "주방", idx: 2, note: "음식 색이 제대로 보이는 주백색" },
  { room: "서재", idx: 3, note: "글자가 또렷한 5700K" },
  { room: "상가", idx: 4, note: "진열이 환한 주광색" },
] as const;

/* 조명 자리 4개. 제품을 걸면 모양만 바뀐다. */
type Slot = "pendant" | "rail" | "stand" | "wall";
const SLOTS: Slot[] = ["pendant", "rail", "stand", "wall"];
const SLOT_NAME: Record<Slot, string> = { pendant: "식탁 펜던트", rail: "천장 레일", stand: "소파 옆 스탠드", wall: "벽 조명" };

type Shape = "dome" | "globe" | "triple" | "rattan" | "spot3" | "cyl2" | "railPendant" | "arc" | "tripod" | "drum" | "sconce" | "roundWall" | "ledBar";

/* 모양마다 스위치 위치와 빛이 닿는 범위(그림 좌표) */
const GEO: Record<Shape, { hit: [number, number]; glow: { cx: number; cy: number; rx: number; ry: number } }> = {
  dome: { hit: [355, 165], glow: { cx: 355, cy: 300, rx: 250, ry: 230 } },
  globe: { hit: [355, 175], glow: { cx: 355, cy: 290, rx: 260, ry: 240 } },
  triple: { hit: [355, 165], glow: { cx: 355, cy: 300, rx: 290, ry: 230 } },
  rattan: { hit: [355, 150], glow: { cx: 355, cy: 300, rx: 230, ry: 220 } },
  spot3: { hit: [700, 46], glow: { cx: 690, cy: 170, rx: 290, ry: 190 } },
  cyl2: { hit: [700, 46], glow: { cx: 700, cy: 200, rx: 250, ry: 220 } },
  railPendant: { hit: [700, 46], glow: { cx: 700, cy: 230, rx: 240, ry: 220 } },
  arc: { hit: [690, 238], glow: { cx: 690, cy: 300, rx: 220, ry: 200 } },
  tripod: { hit: [800, 230], glow: { cx: 800, cy: 270, rx: 180, ry: 210 } },
  drum: { hit: [800, 215], glow: { cx: 800, cy: 260, rx: 180, ry: 210 } },
  sconce: { hit: [232, 200], glow: { cx: 232, cy: 215, rx: 160, ry: 180 } },
  roundWall: { hit: [232, 205], glow: { cx: 232, cy: 215, rx: 150, ry: 160 } },
  ledBar: { hit: [232, 295], glow: { cx: 232, cy: 330, rx: 190, ry: 120 } },
};

type Category = "펜던트" | "스탠드" | "레일" | "벽등" | "간접 LED 바";
const CATEGORIES: Category[] = ["펜던트", "스탠드", "레일", "벽등", "간접 LED 바"];
const SLOT_OF: Record<Category, Slot> = { 펜던트: "pendant", 스탠드: "stand", 레일: "rail", 벽등: "wall", "간접 LED 바": "wall" };

type Product = { id: string; cat: Category; name: string; price: number; spec: string; shape: Shape };
/* 가격은 국내 조명 쇼핑몰 시세 근처 */
const PRODUCTS: Product[] = [
  { id: "p-dome", cat: "펜던트", name: "돔 펜던트 1등 블랙", price: 48000, spec: "E26 소켓, 전구 별매", shape: "dome" },
  { id: "p-globe", cat: "펜던트", name: "유리 볼 펜던트 스모크", price: 69000, spec: "E26 소켓, 전구 별매", shape: "globe" },
  { id: "p-triple", cat: "펜던트", name: "원뿔 펜던트 3등 세트", price: 128000, spec: "LED 전구 3개 포함", shape: "triple" },
  { id: "p-rattan", cat: "펜던트", name: "라탄 펜던트 대", price: 89000, spec: "E26 소켓, 전구 별매", shape: "rattan" },
  { id: "s-arc", cat: "스탠드", name: "아치 장스탠드 대리석 베이스", price: 398000, spec: "높이 2m, E26 전구 별매", shape: "arc" },
  { id: "s-tripod", cat: "스탠드", name: "삼각 우드 장스탠드", price: 139000, spec: "린넨 쉐이드, 전구 별매", shape: "tripod" },
  { id: "s-drum", cat: "스탠드", name: "드럼 쉐이드 장스탠드", price: 98000, spec: "풋 스위치, 전구 별매", shape: "drum" },
  { id: "r-spot3", cat: "레일", name: "레일 스팟 3구 세트", price: 79000, spec: "레일 1m 포함, LED 일체형", shape: "spot3" },
  { id: "r-cyl2", cat: "레일", name: "원통 레일등 2구 세트", price: 64000, spec: "레일 1m 포함, 전구 별매", shape: "cyl2" },
  { id: "r-pend", cat: "레일", name: "레일 펜던트 2등 세트", price: 158000, spec: "레일 1.5m 포함, 전구 별매", shape: "railPendant" },
  { id: "w-sconce", cat: "벽등", name: "상하향 벽등 브라스", price: 46000, spec: "G9 전구 포함", shape: "sconce" },
  { id: "w-round", cat: "벽등", name: "원형 벽등 화이트", price: 32000, spec: "LED 일체형 12W", shape: "roundWall" },
  { id: "l-bar1", cat: "간접 LED 바", name: "간접 LED 바 1m", price: 32000, spec: "3000K, 어댑터 포함", shape: "ledBar" },
  { id: "l-bar2", cat: "간접 LED 바", name: "간접 LED 바 2m 리모컨", price: 59000, spec: "색온도 조절, 어댑터 포함", shape: "ledBar" },
];
const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;

const DEFAULT_SHAPES: Record<Slot, Shape> = { pendant: "dome", rail: "spot3", stand: "drum", wall: "sconce" };

/** 켜진 조명 범위를 mask 타원으로. 가운데는 또렷하고 바깥은 서서히 어둡다. */
const glowMask = (x: number, y: number, rx: number, ry: number) =>
  `, radial-gradient(ellipse ${rx.toFixed(1)}px ${ry.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, #000 0%, #000 28%, rgba(0,0,0,0.55) 62%, transparent 100%)`;

type Done = { no: number; name: string; phone: string; size: string; day: Date; install: boolean; total: number };

export function LightingShopDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [shapes, setShapes] = useState<Record<Slot, Shape>>(DEFAULT_SHAPES);
  const [lit, setLit] = useState<Record<Slot, boolean>>({ pendant: false, rail: false, stand: false, wall: false });
  const [kelvinIdx, setKelvinIdx] = useState(1);
  const [bright, setBright] = useState(80);
  const [cat, setCat] = useState<Category>("펜던트");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [tried, setTried] = useState<string | null>(null);

  /* 조명마다 0(꺼짐)~1(켜짐). 켜질 때 1.2까지 번쩍 뒤 1로 */
  const on0 = useMotionValue(0);
  const on1 = useMotionValue(0);
  const on2 = useMotionValue(0);
  const on3 = useMotionValue(0);
  const onMv: Record<Slot, MotionValue<number>> = { pendant: on0, rail: on1, stand: on2, wall: on3 };

  const setLamp = useCallback(
    (slot: Slot, next: boolean) => {
      setLit((v) => ({ ...v, [slot]: next }));
      const mv = onMv[slot];
      if (reduce) {
        mv.set(next ? 1 : 0);
        return;
      }
      if (next) {
        const total = (FLASH_MS + SETTLE_MS) / 1000;
        animate(mv, [mv.get(), 1.2, 1], { duration: total, times: [0, FLASH_MS / (FLASH_MS + SETTLE_MS), 1], ease: "easeOut" });
      } else {
        animate(mv, 0, { duration: OFF_MS / 1000, ease: EASE });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reduce],
  );

  /* 동작 줄이기면 처음부터 전부 켠다 */
  useEffect(() => {
    if (!reduce) return;
    SLOTS.forEach((s) => {
      onMv[s].set(1);
    });
    const frame = requestAnimationFrame(() => setLit({ pendant: true, rail: true, stand: true, wall: true }));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const allOn = SLOTS.every((s) => lit[s]);
  const toggleAll = () => SLOTS.forEach((s) => setLamp(s, !allOn));

  const tryProduct = (p: Product) => {
    const slot = SLOT_OF[p.cat];
    setShapes((v) => ({ ...v, [slot]: p.shape }));
    setTried(p.id);
    if (!lit[slot]) setLamp(slot, true);
    document.getElementById("ls-room")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const addCart = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const setQty = (id: string, q: number) =>
    setCart((c) => {
      const n = { ...c };
      if (q <= 0) delete n[id];
      else n[id] = q;
      return n;
    });
  const cartRows = Object.entries(cart).map(([id, q]) => ({ p: byId(id), q }));
  const total = cartRows.reduce((s, r) => s + r.p.price * r.q, 0);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const kel = KELVIN[kelvinIdx];
  const navCls = `rounded-[4px] px-3 py-2 text-[15px] ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip pb-24" style={{ background: C.bg, color: C.cream }}>
      <Poster reduce={reduce} onCta={() => go("ls-quote")} />
      <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-4 md:px-6">
        <SampleLogo light />
        <nav aria-label="주요 메뉴" className="hidden items-center gap-1 md:flex" style={{ color: C.creamDim }}>
          <button type="button" onClick={() => go("ls-products")} className={navCls} style={{ outlineColor: C.amber }}>
            제품
          </button>
          <button type="button" onClick={() => go("ls-quote")} className={navCls} style={{ outlineColor: C.amber }}>
            시공 안내
          </button>
          <button type="button" onClick={() => go("ls-store")} className={navCls} style={{ outlineColor: C.amber }}>
            매장 안내
          </button>
        </nav>
        <button type="button" onClick={() => go("ls-quote")} className={`rounded-[4px] px-4 py-2 text-[15px] font-bold ${focusRing}`} style={{ background: C.amber, color: C.ink, outlineColor: C.cream }}>
          상담신청
        </button>
      </header>

      {/* 첫 화면: 불 꺼진 방 + 디머 패널 */}
      <div className="mx-auto grid max-w-[1200px] gap-6 px-4 md:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
        <section id="ls-room" aria-label="조명 켜 보기" className="scroll-mt-4">
          <DarkRoom reduce={reduce} shapes={shapes} lit={lit} onMv={onMv} setLamp={setLamp} kelvinColor={kel.color} bright={bright} allOn={allOn} toggleAll={toggleAll} tried={tried ? byId(tried) : null} />
        </section>

        <section id="ls-control" aria-labelledby="ls-control-title" className="scroll-mt-4 rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.panel }}>
          <h2 id="ls-control-title" className="text-[20px] font-bold">
            색온도와 밝기
          </h2>
          <label className="mt-5 block">
            <span className="flex items-baseline justify-between text-[15px]">
              <span className="font-bold">색온도</span>
              <output className="tabular-nums" style={{ color: C.amber }}>
                {kel.k}K {kel.name}
              </output>
            </span>
            <input type="range" min={0} max={KELVIN.length - 1} step={1} value={kelvinIdx} onChange={(e) => setKelvinIdx(Number(e.target.value))} aria-valuetext={`${kel.k}K ${kel.name}`} className={`mt-2 w-full accent-[#c8a165] ${focusRing}`} style={{ outlineColor: C.amber }} />
            <span aria-hidden className="mt-1 flex justify-between text-[12px] tabular-nums" style={{ color: C.creamDim }}>
              {KELVIN.map((t) => (
                <span key={t.k}>{t.k}K</span>
              ))}
            </span>
          </label>
          <div aria-hidden className="mt-2 h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${KELVIN.map((t) => t.color).join(", ")})` }} />

          <label className="mt-6 block">
            <span className="flex items-baseline justify-between text-[15px]">
              <span className="font-bold">밝기</span>
              <output className="tabular-nums" style={{ color: C.amber }}>
                {bright}%
              </output>
            </span>
            <input type="range" min={20} max={100} step={5} value={bright} onChange={(e) => setBright(Number(e.target.value))} aria-valuetext={`${bright}%`} className={`mt-2 w-full accent-[#c8a165] ${focusRing}`} style={{ outlineColor: C.amber }} />
          </label>

          <p className="mt-6 text-[15px] font-bold">공간별 추천</p>
          <ul className="mt-2 grid gap-1.5">
            {ROOMS.map((r) => {
              const sel = r.idx === kelvinIdx;
              return (
                <li key={r.room}>
                  <button
                    type="button"
                    aria-pressed={sel}
                    onClick={() => setKelvinIdx(r.idx)}
                    className={`flex w-full items-center justify-between gap-3 rounded-[6px] border px-3 py-2 text-left text-[14px] ${focusRing}`}
                    style={{ borderColor: sel ? C.amber : C.line, background: sel ? "rgba(200,161,101,0.12)" : "transparent", outlineColor: C.amber }}
                  >
                    <span>
                      <b>{r.room}</b> <span className="tabular-nums" style={{ color: C.creamDim }}>{KELVIN[r.idx].k}K</span>
                    </span>
                    <span className="text-[13px]" style={{ color: C.creamDim }}>
                      {r.note}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* 제품 */}
      <section id="ls-products" aria-labelledby="ls-products-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="ls-products-title" className="text-[26px] font-bold">
            제품
          </h2>
          <p className="text-[14px]" style={{ color: C.creamDim }}>
            전시장에 전부 켜 두고 있어요
          </p>
        </div>
        <div role="tablist" aria-label="제품 분류" className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => {
            const sel = c === cat;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={sel}
                type="button"
                onClick={() => setCat(c)}
                className={`flex-none rounded-[6px] border px-4 py-1.5 text-[15px] ${sel ? "font-bold" : ""} ${focusRing}`}
                style={{ borderColor: sel ? C.amber : C.line, background: sel ? C.amber : "transparent", color: sel ? C.ink : C.cream, outlineColor: C.amber }}
              >
                {c}
              </button>
            );
          })}
        </div>
        <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {PRODUCTS.filter((p) => p.cat === cat).map((p) => {
            const inRoom = shapes[SLOT_OF[p.cat]] === p.shape && (tried === p.id || tried === null);
            const qty = cart[p.id] ?? 0;
            return (
              <li key={p.id} className="flex flex-col rounded-[8px] border p-3 md:p-4" style={{ borderColor: inRoom ? C.amber : C.line, background: C.panel }}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[6px]" style={{ background: "#101010" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                  <img src={`${IMG}/products/${p.id}.jpg`} alt={`${p.name} 켜 둔 모습`} loading="lazy" width={600} height={600} className="h-full w-full object-cover" />
                  {inRoom && (
                    <span className="absolute left-2 top-2 rounded-[4px] px-1.5 py-0.5 text-[12px] font-bold" style={{ background: C.amber, color: C.ink }}>
                      방에 걸려 있음
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[15px] font-bold leading-[1.4]">{p.name}</p>
                <p className="mt-0.5 text-[13px]" style={{ color: C.creamDim }}>
                  {p.spec}
                </p>
                <p className="mt-2 text-[17px] font-bold tabular-nums" style={{ color: C.amber }}>
                  {won(p.price)}
                </p>
                <div className="mt-3 grid gap-1.5">
                  <button type="button" data-gtm-cta="lighting-shop_try" onClick={() => tryProduct(p)} className={`rounded-[4px] border px-2 py-1.5 text-[14px] font-bold ${focusRing}`} style={{ borderColor: C.amber, color: C.amber, outlineColor: C.cream }}>
                    방에 걸어 보기
                  </button>
                  <button type="button" data-gtm-cta="lighting-shop_cart" onClick={() => addCart(p.id)} className={`inline-flex items-center justify-center gap-1 rounded-[4px] px-2 py-1.5 text-[14px] font-bold ${focusRing}`} style={{ background: C.cream, color: C.ink, outlineColor: C.amber }}>
                    {qty > 0 ? <Check size={15} aria-hidden /> : <Plus size={15} aria-hidden />}
                    {qty > 0 ? `견적에 ${qty}개` : "견적 담기"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 견적과 시공 상담 */}
      <section id="ls-quote" aria-labelledby="ls-quote-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <h2 id="ls-quote-title" className="text-[26px] font-bold">
          견적과 시공 상담
        </h2>
        <QuotePanel today={today} reduce={reduce} rows={cartRows} total={total} setQty={setQty} />
      </section>

      {/* 매장 안내 */}
      <section id="ls-store" aria-labelledby="ls-store-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <h2 id="ls-store-title" className="text-[26px] font-bold">
          매장 안내
        </h2>
        <StoreInfo today={today} />
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.creamDim }}>
        <p>
          <SampleLogo light />
        </p>
        <p>
          {ADDRESS} / 전화 {TEL} / {KAKAO}
        </p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

/* ---------------- 포스터 첫 화면 ---------------- */

/* 포스터 모션 상수
   사진 다가오기 1600ms(scale 1.06 -> 1), 문장 등장 700ms(300ms 늦게, 아래 12px 에서), 스크롤하면 사진만 y 0 -> 8%. */
const HERO_MS = 1600;
const RISE_MS = 700;
const RISE_DELAY_MS = 300;

const HERO_CSS = `
@keyframes ls-rise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}
.ls-rise { animation: ls-rise ${RISE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${RISE_DELAY_MS}ms both; }
@media (prefers-reduced-motion: reduce) {
  .ls-rise { animation: none; }
}
`;

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const wrapRef = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });
  const photoY = useTransform(p, (v) => `${(v * 8).toFixed(2)}%`);

  return (
    <section id="ls-poster" aria-labelledby="ls-poster-title" ref={wrapRef} className="relative min-h-[100svh] overflow-hidden" style={{ background: C.bg }}>
      <style>{HERO_CSS}</style>
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: reduce ? 0 : HERO_MS / 1000, ease: EASE }}
        style={reduce ? undefined : { y: photoY }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
        <img
          src={`${IMG}/hero.jpg`}
          srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
          sizes="100vw"
          alt="창가에 매달린 붉은 원뿔 펜던트 조명 세 개"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "62% 40%" }}
        />
      </motion.div>
      {/* 글자 대비용 막: 왼쪽과 아래를 어둡게 */}
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.1)), linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0) 60%)" }} />

      <div className="relative mx-auto flex min-h-[100svh] max-w-[1200px] flex-col px-4 md:px-6">
        <div className="flex items-center justify-between gap-3 py-4">
          <SampleLogo light small />
          <button
            type="button"
            onClick={onCta}
            data-gtm-cta="lighting-shop_poster_cta"
            className={`rounded-[6px] px-4 py-2 text-[15px] font-semibold ${focusRing}`}
            style={{ background: C.amber, color: C.ink, outlineColor: "#ffffff" }}
          >
            상담신청
          </button>
        </div>

        <div className={`mt-auto pb-[10svh] ${reduce ? "" : "ls-rise"}`}>
          <h1 id="ls-poster-title" className="text-[36px] font-bold md:text-[clamp(40px,5vw,72px)]" style={{ color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}>
            구매한 조명,
            <br />
            설치까지 해 드립니다
          </h1>
          <p className="mt-4 text-[15px] md:text-[17px]" style={{ color: "rgba(255,255,255,0.86)", lineHeight: 1.5 }}>
            {BRAND} 전시장, 서울 ㅇㅇ구
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- 첫 화면: 불 꺼진 방 ---------------- */

function DarkRoom({
  reduce,
  shapes,
  lit,
  onMv,
  setLamp,
  kelvinColor,
  bright,
  allOn,
  toggleAll,
  tried,
}: {
  reduce: boolean;
  shapes: Record<Slot, Shape>;
  lit: Record<Slot, boolean>;
  onMv: Record<Slot, MotionValue<number>>;
  setLamp: (s: Slot, on: boolean) => void;
  kelvinColor: string;
  bright: number;
  allOn: boolean;
  toggleAll: () => void;
  tried: Product | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: VW, h: VH });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* 그림은 preserveAspectRatio slice로 채우므로 좌표를 화면 px로 바꾼다 */
  const s = Math.max(size.w / VW, size.h / VH);
  const ox = (size.w - VW * s) / 2;
  const oy = (size.h - VH * s) / 2;
  const toPx = (x: number, y: number) => ({ x: ox + x * s, y: oy + y * s });

  /* 스포트라이트: 포인터를 지연 없이 따라간다 */
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const spot = useMotionValue(0);
  const spotR = useTransform(spot, (v) => Math.max(v, 0.5));
  const touchRef = useRef(false);

  const b = 0.55 + 0.45 * (bright / 100);
  const lampMask = useTransform([onMv.pendant, onMv.rail, onMv.stand, onMv.wall], (vals: number[]) =>
    SLOTS.map((slot, i) => {
      const v = vals[i];
      if (v <= 0.002) return "";
      const g = GEO[shapes[slot]].glow;
      const p = toPx(g.cx, g.cy);
      return glowMask(p.x, p.y, g.rx * s * v * b, g.ry * s * v * b);
    }).join(""),
  );
  /* 동작 줄이기면 스포트라이트 반지름이 0이라 켜진 조명 범위만 남는다 */
  const mask = useMotionTemplate`radial-gradient(circle ${spotR}px at ${mx}px ${my}px, #000 0%, rgba(0,0,0,0.6) 45%, transparent 100%)${lampMask}`;
  const maskStyle = { WebkitMaskImage: mask, maskImage: mask };

  const move = (e: React.PointerEvent) => {
    if (reduce || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
    if (spot.get() < SPOT_R && !touchRef.current) animate(spot, SPOT_R, { duration: SPOT_MS / 1000, ease: EASE });
  };
  const leave = () => {
    if (reduce || touchRef.current) return;
    animate(spot, 0, { duration: SPOT_MS / 1000, ease: EASE });
  };
  const down = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "touch") return;
    touchRef.current = true;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
    animate(spot, SPOT_R * 0.8, { duration: SPOT_MS / 1000, ease: EASE });
  };

  const litCount = SLOTS.filter((x) => lit[x]).length;

  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} onPointerDown={down} className="relative aspect-[5/4] w-full overflow-hidden rounded-[8px] border md:aspect-[1000/560]" style={{ borderColor: C.line, background: "#0c0c0c", touchAction: "pan-y" }}>
      {/* 꺼진 방: 윤곽만 희미하게 */}
      <div aria-hidden className="absolute inset-0" style={{ opacity: reduce ? 0.3 : 0.1 }}>
        <RoomSvg shapes={shapes} ghost />
      </div>
      <div aria-hidden className="absolute inset-0" style={{ opacity: 0.55 }}>
        <RoomSvg shapes={shapes} ghost fixturesOnly />
      </div>

      {/* 켜진 방: 비추는 곳만 보인다. 빛 색은 multiply로 겹친다. */}
      <motion.div aria-hidden className="absolute inset-0" style={{ ...maskStyle, isolation: "isolate", filter: `brightness(${(0.7 + 0.35 * (bright / 100)).toFixed(2)})` }}>
        <RoomSvg shapes={shapes} onMv={onMv} />
        <div className="absolute inset-0" style={{ background: kelvinColor, mixBlendMode: "multiply", transition: reduce ? "none" : "background-color 300ms" }} />
      </motion.div>

      {/* 스위치 */}
      {SLOTS.map((slot) => {
        const g = GEO[shapes[slot]];
        const p = toPx(g.hit[0], g.hit[1]);
        const on = lit[slot];
        /* 재기 전(서버 렌더)에는 그림 비율 그대로의 백분율이라 PC 폭에서 바로 맞는다 */
        const pos = { left: `${((p.x / size.w) * 100).toFixed(2)}%`, top: `${((p.y / size.h) * 100).toFixed(2)}%` };
        return (
          <button
            key={slot}
            type="button"
            aria-pressed={on}
            aria-label={`${SLOT_NAME[slot]} ${on ? "끄기" : "켜기"}`}
            onClick={() => setLamp(slot, !on)}
            className={`absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ${focusRing}`}
            style={{ ...pos, outlineColor: C.amber }}
          >
            <span
              aria-hidden
              className="grid h-6 w-6 place-items-center rounded-full border"
              style={{
                borderColor: on ? C.amber : "rgba(200,161,101,0.55)",
                background: on ? C.amber : "rgba(15,13,11,0.7)",
                color: on ? C.ink : C.amber,
                boxShadow: on ? "0 0 0 4px rgba(200,161,101,0.25)" : "none",
                transition: reduce ? "none" : `background-color ${FLASH_MS}ms, box-shadow ${FLASH_MS}ms`,
              }}
            >
              <Power size={12} strokeWidth={3} />
            </span>
          </button>
        );
      })}

      {/* 상호와 전체 스위치 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 md:p-5">
        <h2 className="text-[26px] font-bold leading-[1.2] md:text-[34px]" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.5)" }}>
          {BRAND}
        </h2>
        <button
          type="button"
          onClick={toggleAll}
          aria-pressed={allOn}
          className={`pointer-events-auto inline-flex flex-none items-center gap-1.5 rounded-[6px] border px-3 py-1.5 text-[14px] font-bold ${focusRing}`}
          style={{ borderColor: C.amber, background: allOn ? C.amber : "rgba(15,13,11,0.75)", color: allOn ? C.ink : C.amber, outlineColor: C.cream }}
        >
          {allOn ? <LightbulbOff size={15} aria-hidden /> : <Lightbulb size={15} aria-hidden />}
          {allOn ? "전체 끄기" : "전체 켜기"}
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 p-4 text-[13px] md:p-5" style={{ color: C.creamDim }}>
        <span className="rounded-[4px] px-2 py-1 tabular-nums" style={{ background: "rgba(15,13,11,0.7)" }} aria-live="polite">
          켜진 조명 {litCount} / {SLOTS.length}
        </span>
        <AnimatePresence>
          {tried && (
            <motion.span key={tried.id} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="rounded-[4px] px-2 py-1" style={{ background: "rgba(15,13,11,0.7)", color: C.cream }}>
              {SLOT_NAME[SLOT_OF[tried.cat]]}에 <b>{tried.name}</b>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- 방 그림 ---------------- */

type Paint = { body: string; brass: string; shade: string; cord: string; stroke?: string };
const LIT_PAINT: Paint = { body: "#2b2622", brass: "#c9a15c", shade: "#f1e6d2", cord: "#3a332c" };
const GHOST_PAINT: Paint = { body: "#1a1512", brass: "#2e2416", shade: "#1d1814", cord: "#1a1512", stroke: "rgba(200,161,101,0.6)" };

function RoomSvg({ shapes, onMv, ghost = false, fixturesOnly = false }: { shapes: Record<Slot, Shape>; onMv?: Record<Slot, MotionValue<number>>; ghost?: boolean; fixturesOnly?: boolean }) {
  const P = ghost ? GHOST_PAINT : LIT_PAINT;
  const strokeProps = P.stroke ? { stroke: P.stroke, strokeWidth: 2, vectorEffect: "non-scaling-stroke" as const } : {};
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden focusable="false">
      <defs>
        <radialGradient id="ls-glow">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ls-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ls-cone-up" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {!fixturesOnly && (
        <g>
          {/* 벽, 바닥, 걸레받이 */}
          <rect x="0" y="0" width={VW} height="400" fill="#efe3cf" />
          <rect x="0" y="400" width={VW} height="160" fill="#a97b4e" />
          <rect x="0" y="394" width={VW} height="8" fill="#d8c6a7" />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={i * 90 - 20} y1="400" x2={i * 90 + 30} y2="560" stroke="#8f6540" strokeWidth="2" />
          ))}
          <line x1="0" y1="480" x2={VW} y2="480" stroke="#8f6540" strokeWidth="1.5" />
          {/* 러그 */}
          <rect x="470" y="432" width="370" height="84" rx="6" fill="#6e5247" />
          <rect x="482" y="444" width="346" height="60" rx="4" fill="none" stroke="#c9a15c" strokeWidth="2" strokeDasharray="10 8" />
          {/* 식탁 */}
          <rect x="240" y="350" width="230" height="14" rx="4" fill="#8d6239" />
          <rect x="254" y="364" width="12" height="104" fill="#73502f" />
          <rect x="444" y="364" width="12" height="104" fill="#73502f" />
          <rect x="300" y="336" width="26" height="14" rx="2" fill="#f5f0e6" />
          <rect x="396" y="326" width="22" height="24" rx="3" fill="#5f6f5a" />
          <circle cx="407" cy="322" r="12" fill="#6f8a5e" />
          {/* 선반과 소품 */}
          <rect x="165" y="282" width="135" height="8" rx="2" fill="#8d6239" />
          <rect x="178" y="252" width="14" height="30" fill="#b4573a" />
          <rect x="194" y="246" width="12" height="36" fill="#4f6b8a" />
          <rect x="208" y="256" width="16" height="26" fill="#c9a15c" />
          <path d="M262 282 v-26 q0 -14 12 -14 q12 0 12 14 v26 z" fill="#d9d2c7" />
          {/* 액자 */}
          <rect x="600" y="95" width="140" height="105" fill="#f7f1e6" stroke="#c9a15c" strokeWidth="6" />
          <path d="M612 190 l40 -52 l28 32 l20 -22 l28 42 z" fill="#5f6f6b" />
          <circle cx="710" cy="125" r="9" fill="#e7b85c" />
          {/* 소파 */}
          <rect x="510" y="298" width="256" height="48" rx="12" fill="#55655f" />
          <rect x="510" y="332" width="256" height="90" rx="12" fill="#5f6f6b" />
          <rect x="522" y="340" width="76" height="40" rx="8" fill="#6b7c76" />
          <rect x="604" y="340" width="76" height="40" rx="8" fill="#6b7c76" />
          <rect x="686" y="340" width="70" height="40" rx="8" fill="#6b7c76" />
          <rect x="498" y="330" width="22" height="92" rx="10" fill="#4e5d58" />
          <rect x="756" y="330" width="22" height="92" rx="10" fill="#4e5d58" />
          <rect x="520" y="420" width="12" height="16" fill="#3a332c" />
          <rect x="744" y="420" width="12" height="16" fill="#3a332c" />
          <rect x="612" y="344" width="40" height="30" rx="4" fill="#d9a066" />
          {/* 화분 */}
          <path d="M60 470 h60 l-6 -40 h-48 z" fill="#b4573a" />
          <path d="M90 430 c-30 -20 -40 -60 -20 -90 c10 30 20 40 20 90 z M90 430 c30 -20 40 -60 20 -90 c-10 30 -20 40 -20 90 z M90 430 c0 -40 -5 -70 0 -100 c5 30 0 60 0 100 z" fill="#5c7a4a" />
        </g>
      )}

      {/* 빛(켜진 그림에만) */}
      {onMv && (
        <g>
          <motion.g style={{ opacity: onMv.pendant }}>{glowOf(shapes.pendant)}</motion.g>
          <motion.g style={{ opacity: onMv.rail }}>{glowOf(shapes.rail)}</motion.g>
          <motion.g style={{ opacity: onMv.stand }}>{glowOf(shapes.stand)}</motion.g>
          <motion.g style={{ opacity: onMv.wall }}>{glowOf(shapes.wall)}</motion.g>
        </g>
      )}

      {/* 조명 기구 */}
      <g {...strokeProps}>
        {fixture(shapes.pendant, P)}
        {fixture(shapes.rail, P)}
        {fixture(shapes.stand, P)}
        {fixture(shapes.wall, P)}
      </g>
    </svg>
  );
}

/** 켜졌을 때 빛 번짐과 빛 기둥 */
function glowOf(shape: Shape) {
  const g = GEO[shape].glow;
  const halo = <ellipse cx={g.cx} cy={g.cy} rx={g.rx * 0.9} ry={g.ry * 0.9} fill="url(#ls-glow)" />;
  switch (shape) {
    case "dome":
    case "globe":
    case "rattan":
      return (
        <>
          {halo}
          <polygon points="315,196 395,196 520,350 190,350" fill="url(#ls-cone)" />
          <ellipse cx="355" cy="352" rx="150" ry="10" fill="#fff" opacity="0.45" />
        </>
      );
    case "triple":
      return (
        <>
          {halo}
          <polygon points="290,190 320,190 400,350 210,350" fill="url(#ls-cone)" />
          <polygon points="340,206 370,206 450,350 260,350" fill="url(#ls-cone)" />
          <polygon points="390,190 420,190 500,350 310,350" fill="url(#ls-cone)" />
          <ellipse cx="355" cy="352" rx="160" ry="10" fill="#fff" opacity="0.45" />
        </>
      );
    case "spot3":
      return (
        <>
          {halo}
          <polygon points="582,80 612,74 700,250 560,270" fill="url(#ls-cone)" />
          <polygon points="690,86 718,86 760,250 640,250" fill="url(#ls-cone)" />
          <polygon points="800,80 826,86 760,250 700,250" fill="url(#ls-cone)" />
        </>
      );
    case "cyl2":
      return (
        <>
          {halo}
          <polygon points="640,110 672,110 740,300 572,300" fill="url(#ls-cone)" />
          <polygon points="770,110 802,110 870,300 702,300" fill="url(#ls-cone)" />
        </>
      );
    case "railPendant":
      return (
        <>
          {halo}
          <polygon points="626,160 674,160 740,300 560,300" fill="url(#ls-cone)" />
          <polygon points="766,160 814,160 880,300 700,300" fill="url(#ls-cone)" />
        </>
      );
    case "arc":
      return (
        <>
          {halo}
          <polygon points="660,282 720,282 790,400 590,400" fill="url(#ls-cone)" />
        </>
      );
    case "tripod":
    case "drum":
      return (
        <>
          {halo}
          <polygon points="760,262 840,262 880,400 720,400" fill="url(#ls-cone)" />
          <polygon points="770,176 830,176 850,90 750,90" fill="url(#ls-cone-up)" />
        </>
      );
    case "sconce":
      return (
        <>
          {halo}
          <polygon points="220,186 244,186 290,80 174,80" fill="url(#ls-cone-up)" />
          <polygon points="220,226 244,226 300,330 164,330" fill="url(#ls-cone)" />
        </>
      );
    case "roundWall":
      return halo;
    case "ledBar":
      return (
        <>
          {halo}
          <polygon points="170,296 295,296 330,400 135,400" fill="url(#ls-cone)" />
        </>
      );
  }
}

/** 조명 기구 모양 */
function fixture(shape: Shape, P: Paint) {
  switch (shape) {
    case "dome":
      return (
        <g>
          <line x1="355" y1="0" x2="355" y2="140" stroke={P.cord} strokeWidth="3" />
          <path d="M300 180 a55 55 0 0 1 110 0 z" fill={P.body} />
          <rect x="347" y="130" width="16" height="14" rx="3" fill={P.brass} />
          <circle cx="355" cy="184" r="9" fill={P.shade} />
        </g>
      );
    case "globe":
      return (
        <g>
          <line x1="355" y1="0" x2="355" y2="140" stroke={P.cord} strokeWidth="3" />
          <rect x="347" y="132" width="16" height="12" rx="3" fill={P.brass} />
          <circle cx="355" cy="180" r="38" fill={P.shade} opacity={P.stroke ? 1 : 0.8} />
          <circle cx="355" cy="180" r="8" fill="#fff" opacity={P.stroke ? 0 : 0.9} />
        </g>
      );
    case "triple":
      return (
        <g>
          {[
            [305, 160],
            [355, 176],
            [405, 160],
          ].map(([x, y]) => (
            <g key={x}>
              <line x1={x} y1="0" x2={x} y2={y - 30} stroke={P.cord} strokeWidth="2.5" />
              <path d={`M${x - 22} ${y} l16 -34 h12 l16 34 z`} fill={P.body} />
              <circle cx={x} cy={y + 2} r="6" fill={P.shade} />
            </g>
          ))}
        </g>
      );
    case "rattan":
      return (
        <g>
          <line x1="355" y1="0" x2="355" y2="110" stroke={P.cord} strokeWidth="3" />
          <path d="M285 180 q0 -70 70 -70 q70 0 70 70 z" fill={P.stroke ? P.body : "#c99a5c"} />
          {[-40, -20, 0, 20, 40].map((dx) => (
            <line key={dx} x1={355 + dx} y1={180} x2={355 + dx * 0.4} y2={116} stroke={P.stroke ? P.stroke : "#8d6239"} strokeWidth="1.5" />
          ))}
          <circle cx="355" cy="184" r="9" fill={P.shade} />
        </g>
      );
    case "spot3":
      return (
        <g>
          <rect x="520" y="30" width="360" height="10" rx="3" fill={P.body} />
          {[
            [590, -22],
            [700, 0],
            [810, 22],
          ].map(([x, rot]) => (
            <g key={x} transform={`rotate(${rot} ${x} 48)`}>
              <rect x={x - 5} y="40" width="10" height="12" fill={P.brass} />
              <rect x={x - 13} y="52" width="26" height="40" rx="5" fill={P.body} />
              <rect x={x - 10} y="88" width="20" height="5" fill={P.shade} />
            </g>
          ))}
        </g>
      );
    case "cyl2":
      return (
        <g>
          <rect x="520" y="30" width="360" height="10" rx="3" fill={P.body} />
          {[656, 786].map((x) => (
            <g key={x}>
              <rect x={x - 5} y="40" width="10" height="10" fill={P.brass} />
              <rect x={x - 16} y="50" width="32" height="62" rx="4" fill={P.body} />
              <rect x={x - 13} y="108" width="26" height="5" fill={P.shade} />
            </g>
          ))}
        </g>
      );
    case "railPendant":
      return (
        <g>
          <rect x="520" y="30" width="360" height="10" rx="3" fill={P.body} />
          {[650, 790].map((x) => (
            <g key={x}>
              <line x1={x} y1="40" x2={x} y2="128" stroke={P.cord} strokeWidth="2.5" />
              <path d={`M${x - 26} 162 l18 -36 h16 l18 36 z`} fill={P.body} />
              <circle cx={x} cy="164" r="6" fill={P.shade} />
            </g>
          ))}
        </g>
      );
    case "arc":
      return (
        <g>
          <ellipse cx="800" cy="468" rx="34" ry="8" fill={P.stroke ? P.body : "#d9d2c7"} />
          <path d="M800 466 V260 Q800 170 715 180 L690 186" fill="none" stroke={P.brass} strokeWidth="6" strokeLinecap="round" />
          <line x1="690" y1="186" x2="690" y2="236" stroke={P.cord} strokeWidth="2.5" />
          <path d="M650 282 a40 40 0 0 1 80 0 z" fill={P.body} />
          <circle cx="690" cy="284" r="8" fill={P.shade} />
        </g>
      );
    case "tripod":
      return (
        <g>
          <path d="M770 470 L800 290 L830 470 M800 290 L800 470" fill="none" stroke={P.stroke ? P.brass : "#8d6239"} strokeWidth="6" strokeLinecap="round" />
          <path d="M745 262 L760 176 H840 L855 262 Z" fill={P.shade} opacity={P.stroke ? 1 : 0.92} />
        </g>
      );
    case "drum":
      return (
        <g>
          <ellipse cx="800" cy="468" rx="26" ry="6" fill={P.body} />
          <rect x="797" y="258" width="6" height="210" fill={P.brass} />
          <rect x="752" y="176" width="96" height="86" rx="6" fill={P.shade} opacity={P.stroke ? 1 : 0.92} />
          <rect x="752" y="176" width="96" height="86" rx="6" fill="none" stroke={P.stroke ? P.stroke : "#d8c6a7"} strokeWidth="2" />
        </g>
      );
    case "sconce":
      return (
        <g>
          <rect x="222" y="184" width="20" height="44" rx="3" fill={P.brass} />
          <rect x="216" y="178" width="32" height="8" rx="2" fill={P.body} />
          <rect x="216" y="226" width="32" height="8" rx="2" fill={P.body} />
        </g>
      );
    case "roundWall":
      return (
        <g>
          <circle cx="232" cy="206" r="28" fill={P.shade} />
          <circle cx="232" cy="206" r="28" fill="none" stroke={P.stroke ? P.stroke : "#d8c6a7"} strokeWidth="2" />
        </g>
      );
    case "ledBar":
      return (
        <g>
          <rect x="168" y="291" width="128" height="6" rx="3" fill={P.stroke ? P.body : "#fff"} />
        </g>
      );
  }
}



/* ---------------- 견적과 상담 ---------------- */

const SIZES = ["10평 미만", "10~20평", "20~30평", "30평 이상", "상가, 사무실"] as const;

/* 시공 안내. 시공 사례 대신 비용과 조건을 적는다. */
const INSTALL = [
  { job: "펜던트, 벽등 교체", fee: "20,000원~", note: "기존 등 자리에 설치, 30분 안팎" },
  { job: "레일 설치", fee: "1m당 30,000원~", note: "천장 타공, 레일 설치비 별도" },
  { job: "간접 LED 바", fee: "1m당 15,000원~", note: "몰딩 뒤 설치, 전원 분기 필요" },
  { job: "배선 신설, 스위치 추가", fee: "현장 견적", note: "전기 공사 별도, 협력 전기업체 연계" },
];

/** 다음 영업일. 일요일은 휴무 */
function nextBizDay(d: Date) {
  let n = daysAgo(d, -1);
  while (n.getDay() === 0) n = daysAgo(n, -1);
  return n;
}

function QuotePanel({ today, reduce, rows, total, setQty }: { today: Date; reduce: boolean; rows: { p: Product; q: number }[]; total: number; setQty: (id: string, q: number) => void }) {
  const [install, setInstall] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [size, setSize] = useState<string>("");
  const [dayIdx, setDayIdx] = useState<number | null>(null);
  const [agree, setAgree] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  /* 방문 희망일: 내일부터 8일, 일요일 제외 */
  const days = Array.from({ length: 8 }, (_, i) => daysAgo(today, -(i + 1))).filter((d) => d.getDay() !== 0);

  const phoneOk = /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.trim());
  const errs = {
    name: name.trim() ? "" : "이름을 적어 주세요",
    phone: phoneOk ? "" : "휴대폰 번호를 확인해 주세요",
    size: size ? "" : "공간 평수를 골라 주세요",
    day: dayIdx !== null ? "" : "방문 희망일을 골라 주세요",
    agree: agree ? "" : "개인정보 수집에 동의해 주세요",
  };
  const ok = Object.values(errs).every((e) => !e);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTriedSubmit(true);
    if (!ok || dayIdx === null) return;
    const seq = 100 + ((today.getDate() * 7 + name.length * 3 + phone.replace(/\D/g, "").slice(-2).length + rows.length) % 60);
    setDone({ no: seq, name, phone, size, day: days[dayIdx], install, total });
    requestAnimationFrame(() => doneRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };
  const reset = () => {
    setDone(null);
    setTriedSubmit(false);
    setName("");
    setPhone("");
    setSize("");
    setDayIdx(null);
    setAgree(false);
  };

  const err = (k: keyof typeof errs) =>
    triedSubmit && errs[k] ? (
      <p className="mt-1.5 text-[14px] font-bold" style={{ color: C.error }}>
        {errs[k]}
      </p>
    ) : null;

  const inputCls = `mt-2 w-full rounded-[6px] border px-3 py-2.5 text-[16px] ${focusRing}`;
  const inputStyle = { borderColor: C.line, background: "#101010", color: C.cream, outlineColor: C.amber } as const;
  const card = "rounded-[8px] border p-5";

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      {/* 담은 제품과 시공 */}
      <div className="grid gap-5">
        <div className={card} style={{ borderColor: C.line, background: C.panel }}>
          <h3 className="text-[18px] font-bold">
            담은 제품
          </h3>
          {rows.length === 0 ? (
            <p className="mt-3 text-[15px]" style={{ color: C.creamDim }}>
              제품 카드에서 견적 담기를 누르면 여기에 모여요
            </p>
          ) : (
            <ul className="mt-3 divide-y" style={{ borderColor: C.line }}>
              {rows.map(({ p, q }) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3" style={{ borderColor: C.line }}>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold">{p.name}</p>
                    <p className="text-[13px] tabular-nums" style={{ color: C.creamDim }}>
                      {won(p.price)} x {q}
                    </p>
                  </div>
                  <div className="flex flex-none items-center gap-1" role="group" aria-label={`${p.name} 수량`}>
                    <button type="button" onClick={() => setQty(p.id, q - 1)} aria-label="하나 빼기" className={`grid h-9 w-9 place-items-center rounded-[6px] border ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.amber }}>
                      {q === 1 ? <Trash2 size={15} aria-hidden /> : <Minus size={15} aria-hidden />}
                    </button>
                    <output className="w-8 text-center text-[16px] font-bold tabular-nums">{q}</output>
                    <button type="button" onClick={() => setQty(p.id, q + 1)} aria-label="하나 더하기" className={`grid h-9 w-9 place-items-center rounded-[6px] border ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.amber }}>
                      <Plus size={15} aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex items-baseline justify-between border-t pt-4" style={{ borderColor: C.line }}>
            <span className="text-[15px] font-bold">제품 합계</span>
            <output className="text-[22px] font-bold tabular-nums" style={{ color: C.amber }} aria-live="polite">
              {won(total)}
            </output>
          </div>
          <p className="mt-1 text-[13px]" style={{ color: C.creamDim }}>
            설치비와 전구는 별도예요. 매장 방문 구매도 같은 가격.
          </p>
        </div>

        <div className={card} style={{ borderColor: C.line, background: C.panel }}>
          <h3 className="text-[18px] font-bold">
            시공 안내
          </h3>
          <fieldset className="mt-3">
            <legend className="sr-only">시공 여부</legend>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: true, label: "시공 상담 포함" },
                { v: false, label: "제품만 구매" },
              ].map((o) => {
                const sel = install === o.v;
                return (
                  <label key={o.label} className={`flex cursor-pointer items-center justify-center gap-2 rounded-[6px] border px-3 py-2.5 text-[15px] ${sel ? "font-bold" : ""}`} style={{ borderColor: sel ? C.amber : C.line, background: sel ? "rgba(200,161,101,0.12)" : "transparent" }}>
                    <input type="radio" name="ls-install" checked={sel} onChange={() => setInstall(o.v)} className="accent-[#c8a165]" />
                    {o.label}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <table className="mt-4 w-full border-collapse text-left text-[14px]">
            <thead>
              <tr style={{ color: C.creamDim }}>
                <th scope="col" className="border-b pb-2 font-bold" style={{ borderColor: C.line }}>
                  항목
                </th>
                <th scope="col" className="border-b pb-2 font-bold" style={{ borderColor: C.line }}>
                  시공비
                </th>
              </tr>
            </thead>
            <tbody>
              {INSTALL.map((r) => (
                <tr key={r.job}>
                  <td className="border-b py-2.5 pr-3 align-top" style={{ borderColor: C.line }}>
                    <span className="font-bold">{r.job}</span>
                    <span className="block text-[13px]" style={{ color: C.creamDim }}>
                      {r.note}
                    </span>
                  </td>
                  <td className="border-b py-2.5 align-top tabular-nums" style={{ borderColor: C.line }}>
                    {r.fee}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[13px]" style={{ color: C.creamDim }}>
            시공비는 서울 기준이고 현장 확인 뒤 확정돼요. 전기 공사가 필요하면 별도 견적.
          </p>
        </div>
      </div>

      {/* 상담신청 */}
      <div className={card} style={{ borderColor: C.line, background: C.panel }}>
        {done ? (
          <DoneView ref={doneRef} done={done} today={today} reduce={reduce} rows={rows} onAgain={reset} />
        ) : (
          <form onSubmit={submit} noValidate>
            <h3 className="text-[18px] font-bold">
              상담신청
            </h3>
            <p className="mt-1 text-[14px]" style={{ color: C.creamDim }}>
              담은 제품과 함께 접수돼요. 방문 전 전화로 한 번 확인해 드려요.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-[15px] font-bold">
                이름
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="김ㅎ늘" autoComplete="name" className={inputCls} style={inputStyle} />
                {err("name")}
              </label>
              <label className="block text-[15px] font-bold">
                휴대폰
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" inputMode="tel" autoComplete="tel" className={inputCls} style={inputStyle} />
                {err("phone")}
              </label>
            </div>
            <label className="mt-4 block text-[15px] font-bold">
              공간 평수
              <select value={size} onChange={(e) => setSize(e.target.value)} className={inputCls} style={inputStyle}>
                <option value="">골라 주세요</option>
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {err("size")}
            </label>
            <fieldset className="mt-4">
              <legend className="text-[15px] font-bold">방문 희망일</legend>
              <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                {days.map((d, i) => {
                  const sel = dayIdx === i;
                  return (
                    <button key={i} type="button" aria-pressed={sel} onClick={() => setDayIdx(i)} className={`rounded-[6px] border py-2 text-center text-[14px] tabular-nums ${focusRing}`} style={{ borderColor: sel ? C.amber : C.line, background: sel ? C.amber : "transparent", color: sel ? C.ink : C.cream, outlineColor: C.amber }}>
                      <span className="block font-bold">
                        {d.getMonth() + 1}.{d.getDate()}
                      </span>
                      <span className="block text-[12px]">{["일", "월", "화", "수", "목", "금", "토"][d.getDay()]}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[13px]" style={{ color: C.creamDim }}>
                일요일 휴무
              </p>
              {err("day")}
            </fieldset>
            <label className="mt-4 flex items-start gap-2 text-[14px]">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-[#c8a165]" />
              <span>상담 연락을 위한 개인정보 수집에 동의합니다. 상담 뒤 3개월이 지나면 지워요.</span>
            </label>
            {err("agree")}
            <button type="submit" data-gtm-cta="lighting-shop_consult" className={`mt-5 w-full rounded-[6px] py-3 text-[16px] font-bold ${focusRing}`} style={{ background: C.amber, color: C.ink, outlineColor: C.cream }}>
              {install ? "시공 상담 신청" : "구매 상담 신청"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function DoneView({ ref, done, today, reduce, rows, onAgain }: { ref: React.Ref<HTMLDivElement>; done: Done; today: Date; reduce: boolean; rows: { p: Product; q: number }[]; onAgain: () => void }) {
  const no = `LT-${p2(today.getMonth() + 1)}${p2(today.getDate())}-${done.no}`;
  const reply = nextBizDay(today);
  const line = (k: string, v: React.ReactNode) => (
    <div className="contents" key={k}>
      <dt style={{ color: C.creamDim }}>{k}</dt>
      <dd>{v}</dd>
    </div>
  );
  return (
    <motion.div ref={ref} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="scroll-mt-4" role="status">
      <p className="inline-flex items-center gap-2 text-[18px] font-bold">
        <Check size={20} aria-hidden style={{ color: C.amber }} /> 상담 접수 완료
      </p>
      <p className="mt-3 text-[28px] font-bold tabular-nums" style={{ color: C.amber }}>
        {no}
      </p>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
        {line("신청자", maskName(done.name))}
        {line("휴대폰", <span className="tabular-nums">{maskPhone(done.phone)}</span>)}
        {line("공간", done.size)}
        {line("방문 희망일", fmtKo(done.day))}
        {line("상담 내용", done.install ? "제품 구매와 시공" : "제품 구매")}
        {line("담은 제품", rows.length ? `${rows.length}종, ${won(done.total)}` : "없음")}
      </dl>
      <div className="mt-5 rounded-[8px] border p-4 text-[15px] leading-[1.7]" style={{ borderColor: C.line }}>
        <p>
          담당 창구 <b>{KAKAO}</b> 또는 전화 <b className="tabular-nums">{TEL}</b>
        </p>
        <p>
          회신 예정일 <b>{fmtKo(reply)}</b> 영업시간 안에 연락드려요.
        </p>
      </div>
      <button type="button" onClick={onAgain} className={`mt-5 inline-flex items-center gap-1.5 rounded-[6px] border px-4 py-2 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.amber, color: C.amber, outlineColor: C.cream }}>
        <RotateCcw size={15} aria-hidden /> 새로 신청
      </button>
    </motion.div>
  );
}

/* ---------------- 매장 안내 ---------------- */

const HOURS = [
  { label: "월~금", days: [1, 2, 3, 4, 5], time: "10:00~19:00" },
  { label: "토", days: [6], time: "10:00~17:00" },
  { label: "일, 공휴일", days: [0], time: "휴무" },
];

function StoreInfo({ today }: { today: Date }) {
  const dow = today.getDay();
  const card = "rounded-[8px] border p-5";
  const h3 = "inline-flex items-center gap-2 text-[18px] font-bold";
  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-3">
      <div className={card} style={{ borderColor: C.line, background: C.panel }}>
        <h3 className={h3}>
          <Clock size={18} aria-hidden style={{ color: C.amber }} /> 영업시간
        </h3>
        <ul className="mt-3 grid gap-2 text-[15px]">
          {HOURS.map((h) => {
            const now = h.days.includes(dow);
            return (
              <li key={h.label} className="flex items-baseline justify-between gap-3 border-b pb-2" style={{ borderColor: C.line, color: now ? C.cream : C.creamDim, fontWeight: now ? 700 : 400 }}>
                <span>
                  {h.label}
                  {now && (
                    <span className="ml-2 rounded-[4px] px-1.5 py-0.5 text-[12px]" style={{ background: C.amber, color: C.ink }}>
                      오늘
                    </span>
                  )}
                </span>
                <span className="tabular-nums">{h.time}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[14px]" style={{ color: C.creamDim }}>
          점심시간 없이 운영. 시공 상담은 방문 전 전화 예약.
        </p>
      </div>

      <div className={card} style={{ borderColor: C.line, background: C.panel }}>
        <h3 className={h3}>
          <Car size={18} aria-hidden style={{ color: C.amber }} /> 주차와 전시장
        </h3>
        <dl className="mt-3 grid gap-3 text-[15px] leading-[1.6]">
          <div>
            <dt className="font-bold">주차</dt>
            <dd style={{ color: C.creamDim }}>매장 앞 2대, 만차 시 건너편 공영주차장 1시간 지원</dd>
          </div>
          <div>
            <dt className="font-bold">1층</dt>
            <dd style={{ color: C.creamDim }}>펜던트, 레일, 벽등 전시. 색온도 체험 부스</dd>
          </div>
          <div>
            <dt className="font-bold">2층</dt>
            <dd style={{ color: C.creamDim }}>장스탠드, 간접조명 시공 견본, 상담석</dd>
          </div>
          <div>
            <dt className="font-bold">전구 교체</dt>
            <dd style={{ color: C.creamDim }}>구매 제품은 전구 종류 확인 뒤 바로 끼워 드려요</dd>
          </div>
        </dl>
      </div>

      <div className={card} style={{ borderColor: C.line, background: C.panel }}>
        <h3 className={h3}>
          <MapPin size={18} aria-hidden style={{ color: C.amber }} /> 오시는 길
        </h3>
        <p className="mt-3 text-[15px] font-bold">{ADDRESS}</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-[14px]" style={{ color: C.creamDim }}>
          <Train size={15} aria-hidden /> ㅇㅇ역 3번 출구 도보 5분
        </p>
        <svg viewBox="0 0 300 160" className="mt-3 w-full rounded-[6px]" role="img" aria-label="역에서 매장까지 가는 약도" style={{ background: "#101010" }}>
          <path d="M0 110 H300" stroke="#2a241c" strokeWidth="18" />
          <path d="M70 0 V160" stroke="#2a241c" strokeWidth="14" />
          <path d="M200 0 V160" stroke="#2a241c" strokeWidth="10" />
          <path d="M70 110 H200 V58" fill="none" stroke={C.amber} strokeWidth="3" strokeDasharray="6 5" />
          <rect x="52" y="96" width="36" height="28" rx="4" fill="#3a332c" />
          <text x="70" y="140" textAnchor="middle" fontSize="12" fill={C.creamDim}>
            ㅇㅇ역 3번 출구
          </text>
          <rect x="210" y="34" width="60" height="30" rx="4" fill={C.amber} />
          <text x="240" y="54" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.ink}>
            곰파트너
          </text>
          <text x="248" y="80" textAnchor="middle" fontSize="11" fill={C.creamDim}>
            1층
          </text>
        </svg>
        <p className="mt-3 text-[14px] tabular-nums" style={{ color: C.creamDim }}>
          전화 {TEL}
        </p>
      </div>
    </div>
  );
}
