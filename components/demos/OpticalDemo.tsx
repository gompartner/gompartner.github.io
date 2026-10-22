"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { CalendarCheck, Car, Check, Clock, Contact, Eye, Glasses, MapPin, MessageCircle, Phone, RotateCcw, TrainFront } from "lucide-react";
import { IBM_Plex_Sans_KR } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 안경원 홈페이지 샘플: 가상의 곰파트너안경. 상호, 주소, 전화는 모두 가상이다.

   국내 안경원 사이트는 메뉴가 거의 같다. 안경테(브랜드, 소재), 렌즈(굴절률, 기능성 렌즈), 콘택트렌즈,
   시력검사(예약, 소요시간, 렌즈 착용자는 미리 빼고 오기), 오시는 길(주차, 영업시간). 첫 화면엔 보통 매장 사진과
   예약 버튼이 있고 가격은 상담 때 알려 준다. 이 샘플은 그 자리에 테를 직접 골라 보는 3D 안경을 두고
   테와 렌즈 가격을 바로 더해 준다. 얼굴형별 추천 문구는 안경원 상담에서 흔히 쓰는 말을 그대로 썼다.

   핵심 모션: 가운데 안경이 마우스 위치를 따라 기울고(useMotionValue + useSpring), 렌즈 반사광은 포인터
   반대쪽으로 움직인다. 터치 기기는 좌우로 천천히 흔들리고, 동작 줄이기면 멈춘다. 테를 바꾸면 모양이 겹치며
   바뀐다(AnimatePresence, 180ms).

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 얼굴형 고르기: 둥근형, 각진형, 긴형, 역삼각형. 고르면 맞는 테에 추천 표시와 이유 한 줄.
   2. 테 고르기: 모양 6종과 소재 3종. 가운데 안경과 테 가격이 바뀐다.
   3. 렌즈 옵션: 굴절률 4종, 블루라이트 차단, 변색, 누진다초점. 렌즈 색과 두께가 바뀌고 합계가 롤링으로 갱신.
   4. 시력검사 예약: 날짜(오늘부터 7일), 시간, 이름, 휴대폰. 완료 화면에 예약번호와 담당 창구.
   5. 오시는 길과 영업시간: 오늘 요일 진하게, 주차 안내.

   첫 화면 포스터: 밝은 회색 바탕에 남색 뿔테 안경이 화면을 덮는다. 문장은 바탕에 흐리게 깔리고(블러 고정)
   렌즈 안에서만 선명하다(같은 문장 두 겹, 렌즈 모양 clip-path). 들어올 때 안경이 오른쪽에서 문장을 훑으며
   가운데로 온다. PC는 포인터를 천천히 따라가고 터치 기기는 좌우로 떠다닌다. 스크롤하면 안경이 왼쪽 렌즈를
   중심으로 커지며 렌즈 안으로 들어가고 렌즈 속 바탕색이 그대로 아래 화면으로 이어진다. */

const head = IBM_Plex_Sans_KR;
const headF = { fontFamily: `${head.style.fontFamily}, sans-serif`, fontWeight: 700 } as const;

const BRAND = "곰파트너안경";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 1층";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";

const C = {
  bg: "#f5f6f8",
  panel: "#ffffff",
  navy: "#1b2a4a",
  navySoft: "#2e4064",
  steel: "#8a929c",
  steelLine: "#d3d8de",
  steelSoft: "#eceff3",
  copper: "#a8521a",
  copperSoft: "#fbeee4",
  ink: "#1d2330",
  muted: "#5c6572",
  error: "#b42318",
};

/* 모션 상수. 기울기 스프링은 stiffness 120, damping 18. 테 교차 전환 180ms. 렌즈 색 변화 400ms. */
const TILT_SPRING = { stiffness: 120, damping: 18 } as const;
const SWAP_MS = 180;
const TINT_MS = 400;
const SWAY_S = 7;
const EASE = [0.22, 1, 0.36, 1] as const;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- 테 모양, 소재, 얼굴형 ---------- */

type ShapeId = "round" | "boston" | "wellington" | "square" | "browline" | "rimless";
type MaterialId = "acetate" | "titanium" | "ultem";
type FaceId = "round" | "square" | "long" | "heart";

interface Shape {
  id: ShapeId;
  name: string;
  base: number;
  /** 왼쪽 렌즈 테두리. 렌즈 가운데가 원점 */
  d: string;
  /** 렌즈 가운데에서 안쪽(코 쪽) 가장자리까지 거리 */
  inner: number;
  /** 바깥(귀 쪽) 가장자리까지 거리 */
  outer: number;
  /** 코다리 높이 */
  bridgeY: number;
  /** 다리 힌지 높이 */
  templeY: number;
  note: string;
}

const SHAPES: Shape[] = [
  { id: "round", name: "라운드", base: 79000, d: "M-60 0a60 60 0 1 0 120 0a60 60 0 1 0 -120 0z", inner: 59, outer: 59, bridgeY: -8, templeY: -16, note: "동그란 렌즈, 복고 느낌" },
  { id: "boston", name: "보스턴", base: 89000, d: "M-80 -26C-80 -56 -54 -64 -10 -64C40 -64 80 -54 80 -22C80 14 54 58 2 58C-48 58 -80 14 -80 -26Z", inner: 79, outer: 80, bridgeY: -10, templeY: -36, note: "위는 넓고 아래가 둥근 역삼각" },
  { id: "wellington", name: "웰링턴", base: 89000, d: "M-84 -48C-84 -62 -74 -66 -60 -66L62 -66C78 -66 86 -60 86 -46L78 34C76 52 64 60 46 60L-46 60C-66 60 -78 50 -80 32Z", inner: 80, outer: 82, bridgeY: -10, templeY: -40, note: "위가 넓은 사다리꼴, 가장 무난" },
  { id: "square", name: "스퀘어", base: 79000, d: "M-84 -58Q-84 -64 -78 -64L78 -64Q84 -64 84 -58L84 52Q84 60 76 60L-76 60Q-84 60 -84 52Z", inner: 84, outer: 84, bridgeY: -10, templeY: -44, note: "각이 살아 있는 네모" },
  { id: "browline", name: "하금테", base: 99000, d: "M-82 -50C-82 -62 -72 -64 -58 -64L64 -64C78 -64 84 -58 84 -46L76 36C74 52 62 58 44 58L-44 58C-64 58 -76 50 -78 32Z", inner: 80, outer: 81, bridgeY: -44, templeY: -46, note: "위는 뿔테, 아래는 금속 와이어" },
  { id: "rimless", name: "무테", base: 150000, d: "M-78 -40C-78 -58 -62 -62 -40 -62L50 -62C70 -62 80 -54 80 -36L78 30C76 50 62 56 40 56L-40 56C-62 56 -76 48 -78 28Z", inner: 79, outer: 78, bridgeY: -10, templeY: -30, note: "테 없이 렌즈에 바로 고정" },
];

interface Material {
  id: MaterialId;
  name: string;
  add: number;
  desc: string;
  /** 테두리 색. 티타늄은 그라디언트 id를 쓴다 */
  stroke: string;
  width: number;
}

const MATERIALS: Material[] = [
  { id: "acetate", name: "아세테이트", add: 0, desc: "두께감 있고 색이 선명해요", stroke: C.navy, width: 9 },
  { id: "titanium", name: "티타늄", add: 140000, desc: "가볍고 땀에 녹슬지 않아요", stroke: "url(#metal)", width: 3.5 },
  { id: "ultem", name: "울템", add: -20000, desc: "가장 가볍고 잘 휘어요", stroke: "#3e4650", width: 6 },
];

const FACES: { id: FaceId; name: string; rec: ShapeId[]; why: string }[] = [
  { id: "round", name: "둥근형", rec: ["square", "wellington"], why: "각이 있는 테가 얼굴선을 또렷하게 잡아 줘요" },
  { id: "square", name: "각진형", rec: ["round", "boston"], why: "둥근 테가 턱선을 부드럽게 보이게 해요" },
  { id: "long", name: "긴형", rec: ["wellington", "browline"], why: "세로 폭이 넉넉한 테가 얼굴 길이를 나눠 줘요" },
  { id: "heart", name: "역삼각형", rec: ["rimless", "round"], why: "아래가 둥글고 가벼운 테가 좁은 턱선과 균형을 맞춰요" },
];

/* ---------- 렌즈 ---------- */

/** mm는 같은 도수(-4.00, 렌즈 지름 65mm)에서 가장자리 두께. 안경원이 상담 때 보여 주는 두께 비교표 수치 */
const INDEXES = [
  { v: "1.56", price: 40000, mm: 6.5, desc: "기본형, 낮은 도수에" },
  { v: "1.60", price: 60000, mm: 5.3, desc: "가장 많이 나가요" },
  { v: "1.67", price: 90000, mm: 4.5, desc: "-4.00 넘으면 이걸로" },
  { v: "1.74", price: 150000, mm: 3.9, desc: "가장 얇은 고도수용" },
] as const;

type OptId = "blue" | "photo" | "prog";
const OPTIONS: { id: OptId; name: string; price: number; desc: string }[] = [
  { id: "blue", name: "블루라이트 차단", price: 20000, desc: "모니터 오래 보면 권해요" },
  { id: "photo", name: "변색", price: 40000, desc: "밖에 나가면 선글라스처럼 어두워져요" },
  { id: "prog", name: "누진다초점", price: 150000, desc: "멀리와 가까이를 한 렌즈로" },
];

type Opts = Record<OptId, boolean>;

/* ---------- 영업시간, 예약 ---------- */

/** 요일별 영업시간. 일요일과 공휴일은 휴무 */
const HOURS: { dow: number; label: string; open: string | null }[] = [
  { dow: 1, label: "월", open: "10:30 ~ 20:00" },
  { dow: 2, label: "화", open: "10:30 ~ 20:00" },
  { dow: 3, label: "수", open: "10:30 ~ 20:00" },
  { dow: 4, label: "목", open: "10:30 ~ 20:00" },
  { dow: 5, label: "금", open: "10:30 ~ 20:00" },
  { dow: 6, label: "토", open: "10:30 ~ 19:00" },
  { dow: 0, label: "일, 공휴일", open: null },
];

const SLOTS = ["10:30", "11:30", "13:30", "14:30", "15:30", "16:30", "17:30", "18:30"];
const BOOK_DAYS = 7;

/** 날짜와 시간별로 이미 잡힌 예약. 실제로는 예약 시트에서 읽는다 */
function taken(dayIdx: number, slot: number) {
  let h = (dayIdx + 5) * 2654435761 + (slot + 3) * 40503;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 101;
  // 저녁과 토요일이 먼저 찬다
  return h % 7 === 0 || (slot >= 6 && h % 3 === 0);
}

function slotsFor(d: Date) {
  const dow = d.getDay();
  if (dow === 0) return [];
  if (dow === 6) return SLOTS.slice(0, 7);
  return SLOTS;
}

/** 터치 기기(마우스 없음) 여부. 서버에서는 false */
const TOUCH_QUERY = "(hover: none)";
const subscribeTouch = (cb: () => void) => {
  const mq = window.matchMedia(TOUCH_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useTouch = () => useSyncExternalStore(subscribeTouch, () => window.matchMedia(TOUCH_QUERY).matches, () => false);

/* ====================================================================== */

export function OpticalDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [face, setFace] = useState<FaceId | null>(null);
  const [shape, setShape] = useState<ShapeId>("wellington");
  const [material, setMaterial] = useState<MaterialId>("acetate");
  const [idx, setIdx] = useState(1);
  const [opts, setOpts] = useState<Opts>({ blue: false, photo: false, prog: false });

  const S = SHAPES.find((s) => s.id === shape)!;
  const M = MATERIALS.find((m) => m.id === material)!;
  const framePrice = S.base + M.add;
  const lensPrice = INDEXES[idx].price + OPTIONS.filter((o) => opts[o.id]).reduce((n, o) => n + o.price, 0);
  const total = framePrice + lensPrice;
  const rec = face ? FACES.find((f) => f.id === face)! : null;

  const pickShape = (id: ShapeId) => {
    setShape(id);
    // 무테는 렌즈에 나사로 고정해서 금속만 쓴다
    if (id === "rimless") setMaterial("titanium");
  };

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  // 휴대폰 아래 고정 막대는 포스터를 지나야 올라온다
  const [barOn, setBarOn] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setBarOn(v > window.innerHeight * 0.8));

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const navBtn = `rounded-md px-3 py-2 text-[15px] font-bold hover:bg-white ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip pb-24 md:pb-0" style={{ background: C.bg, color: C.ink }}>
      <Poster reduce={reduce} onBook={() => go("op-book")} />

      <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-4 md:px-6">
        <h2 className="inline-flex items-center gap-2 text-[22px] leading-none" style={{ ...headF, color: C.navy }}>
          <Glasses size={28} strokeWidth={2.2} aria-hidden />
          {BRAND}
        </h2>
        <nav aria-label="페이지 안 이동" className="hidden items-center gap-1 lg:flex" style={{ color: C.navySoft }}>
          <button type="button" className={navBtn} style={{ outlineColor: C.copper }} onClick={() => go("op-frame")}>
            안경테
          </button>
          <button type="button" className={navBtn} style={{ outlineColor: C.copper }} onClick={() => go("op-lens")}>
            렌즈
          </button>
          <button type="button" className={navBtn} style={{ outlineColor: C.copper }} onClick={() => go("op-contact")}>
            콘택트렌즈
          </button>
          <button type="button" className={navBtn} style={{ outlineColor: C.copper }} onClick={() => go("op-map")}>
            오시는 길
          </button>
        </nav>
        <button
          type="button"
          onClick={() => go("op-book")}
          data-gtm-cta="optical_book_top"
          className={`inline-flex flex-none items-center gap-1.5 rounded-md px-4 py-2.5 text-[15px] font-bold text-white transition-transform duration-100 active:translate-y-px ${focusRing}`}
          style={{ background: C.navy, outlineColor: C.copper }}
        >
          <Eye size={18} aria-hidden />
          시력검사 예약
        </button>
      </header>

      {/* 첫 화면: 왼쪽에 3D 안경(고정), 오른쪽에 얼굴형, 테, 렌즈 선택. 휴대폰에서는 안경이 위에 붙어 따라온다 */}
      <main className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start lg:gap-10">
          <div className="sticky top-0 z-20 -mx-4 px-4 pb-2 pt-2 md:static md:mx-0 md:px-0 lg:sticky lg:top-4" style={{ background: C.bg }}>
            <Stage reduce={reduce} shape={S} material={M} idx={idx} opts={opts} />
            <Summary shape={S} material={M} idx={idx} opts={opts} framePrice={framePrice} lensPrice={lensPrice} total={total} reduce={reduce} onBook={() => go("op-book")} />
          </div>

          <div className="mt-6 flex flex-col gap-10 lg:mt-0">
            {/* 1. 얼굴형 */}
            <section id="op-face" aria-labelledby="op-face-title" className="scroll-mt-[190px] md:scroll-mt-4">
              <SectionTitle id="op-face-title">내 얼굴형은</SectionTitle>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {FACES.map((f) => {
                  const sel = face === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => setFace(sel ? null : f.id)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-1 py-3 text-[14px] font-bold transition-colors ${focusRing}`}
                      style={{ borderColor: sel ? C.navy : C.steelLine, background: sel ? C.navy : C.panel, color: sel ? "#fff" : C.ink, outlineColor: C.copper }}
                    >
                      <FaceIcon id={f.id} color={sel ? "#fff" : C.navy} />
                      {f.name}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 min-h-[48px]">
                <AnimatePresence mode="wait" initial={false}>
                  {rec && (
                    <motion.p
                      key={rec.id}
                      initial={reduce ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                      transition={{ duration: reduce ? 0 : 0.18, ease: EASE }}
                      className="rounded-lg px-4 py-3 text-[15px] leading-[1.6]"
                      style={{ background: C.copperSoft, color: C.ink }}
                    >
                      <strong style={{ color: C.copper }}>{rec.rec.map((id) => SHAPES.find((s) => s.id === id)!.name).join(", ")}</strong> 추천. {rec.why}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* 2. 테 */}
            <section id="op-frame" aria-labelledby="op-frame-title" className="scroll-mt-[190px] md:scroll-mt-4">
              <SectionTitle id="op-frame-title">안경테</SectionTitle>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SHAPES.map((s) => {
                  const sel = shape === s.id;
                  const isRec = !!rec?.rec.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => pickShape(s.id)}
                      className={`relative flex flex-col items-start gap-1 rounded-lg border-2 px-3 pb-3 pt-3 text-left transition-colors ${focusRing}`}
                      style={{
                        borderColor: sel ? C.navy : isRec ? C.copper : C.steelLine,
                        background: sel ? C.navy : C.panel,
                        color: sel ? "#fff" : C.ink,
                        outlineColor: C.copper,
                      }}
                    >
                      {isRec && (
                        <span className="absolute right-2 top-2 rounded px-1.5 py-0.5 text-[12px] font-bold" style={{ background: sel ? "#fff" : C.copper, color: sel ? C.copper : "#fff" }}>
                          추천
                        </span>
                      )}
                      <MiniFrame shape={s} color={sel ? "#fff" : C.navy} />
                      <span className="mt-1 text-[16px] font-bold">{s.name}</span>
                      <span className="text-[13px] leading-[1.4]" style={{ color: sel ? "rgba(255,255,255,0.8)" : C.muted }}>
                        {s.note}
                      </span>
                      <span className="text-[14px] font-bold tabular-nums" style={{ color: sel ? "#fff" : C.navySoft }}>
                        {won(s.base)}부터
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-6 text-[16px] font-bold">소재</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {MATERIALS.map((m) => {
                  const sel = material === m.id;
                  const off = shape === "rimless" && m.id !== "titanium";
                  return (
                    <button
                      key={m.id}
                      type="button"
                      aria-pressed={sel}
                      disabled={off}
                      onClick={() => setMaterial(m.id)}
                      className={`flex flex-col items-start rounded-lg border-2 px-3 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${focusRing}`}
                      style={{ borderColor: sel ? C.navy : C.steelLine, background: sel ? C.navy : C.panel, color: sel ? "#fff" : C.ink, outlineColor: C.copper }}
                    >
                      <span className="flex w-full items-center justify-between gap-2">
                        <span className="text-[15px] font-bold">{m.name}</span>
                        <MaterialSwatch id={m.id} />
                      </span>
                      <span className="mt-1 text-[13px] leading-[1.4]" style={{ color: sel ? "rgba(255,255,255,0.8)" : C.muted }}>
                        {m.desc}
                      </span>
                      <span className="mt-1 text-[13px] font-bold tabular-nums">{m.add === 0 ? "기본" : m.add > 0 ? `+${won(m.add)}` : `-${won(-m.add)}`}</span>
                    </button>
                  );
                })}
              </div>
              {shape === "rimless" && (
                <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
                  무테는 렌즈에 나사로 고정해서 티타늄만 돼요.
                </p>
              )}
            </section>

            {/* 3. 렌즈 */}
            <section id="op-lens" aria-labelledby="op-lens-title" className="scroll-mt-[190px] md:scroll-mt-4">
              <SectionTitle id="op-lens-title" sub="굴절률이 높을수록 같은 도수에서 얇아져요. 가격은 렌즈 한 쌍 기준">
                렌즈
              </SectionTitle>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {INDEXES.map((x, i) => {
                  const sel = idx === i;
                  return (
                    <button
                      key={x.v}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => setIdx(i)}
                      className={`flex flex-col items-center gap-1 rounded-lg border-2 px-1 py-3 transition-colors ${focusRing}`}
                      style={{ borderColor: sel ? C.navy : C.steelLine, background: sel ? C.navy : C.panel, color: sel ? "#fff" : C.ink, outlineColor: C.copper }}
                    >
                      <span className="text-[18px] font-bold tabular-nums" style={headF}>
                        {x.v}
                      </span>
                      <ThicknessBar mm={x.mm} color={sel ? "#fff" : C.steel} />
                      <span className="text-[13px] tabular-nums" style={{ color: sel ? "rgba(255,255,255,0.85)" : C.muted }}>
                        {x.mm}mm
                      </span>
                      <span className="text-[14px] font-bold tabular-nums">{won(x.price)}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
                {INDEXES[idx].desc}. 두께는 -4.00 도수에서 렌즈 가장자리 기준이에요.
              </p>

              <ul className="mt-5 flex flex-col gap-2">
                {OPTIONS.map((o) => {
                  const on = opts[o.id];
                  return (
                    <li key={o.id}>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={on}
                        onClick={() => setOpts((v) => ({ ...v, [o.id]: !v[o.id] }))}
                        className={`flex w-full items-center gap-3 rounded-lg border-2 px-3 py-3 text-left transition-colors ${focusRing}`}
                        style={{ borderColor: on ? C.navy : C.steelLine, background: C.panel, outlineColor: C.copper }}
                      >
                        <span aria-hidden className="relative h-6 w-11 flex-none rounded-full transition-colors" style={{ background: on ? C.navy : C.steelLine }}>
                          <motion.span
                            className="absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white"
                            animate={{ x: on ? 20 : 0 }}
                            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 30 }}
                          >
                            {on && <Check size={13} strokeWidth={3} style={{ color: C.navy }} />}
                          </motion.span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[15px] font-bold">{o.name}</span>
                          <span className="block text-[13px]" style={{ color: C.muted }}>
                            {o.desc}
                          </span>
                        </span>
                        <span className="text-[14px] font-bold tabular-nums" style={{ color: C.navySoft }}>
                          +{won(o.price)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>

        {/* 콘택트렌즈 */}
        <section id="op-contact" aria-labelledby="op-contact-title" className="mt-16 scroll-mt-4 md:mt-24">
          <SectionTitle id="op-contact-title" sub="처음 끼시면 피팅 검사 뒤 착용 연습까지 해 드려요">
            콘택트렌즈
          </SectionTitle>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "원데이 소프트렌즈", p: "30매 28,000원부터", d: "매일 새 렌즈, 관리가 없어요" },
              { n: "2주, 한 달 착용", p: "6매 32,000원부터", d: "세척액으로 관리해요" },
              { n: "난시용, 컬러렌즈", p: "30매 35,000원부터", d: "축 맞춰 처방해요" },
              { n: "하드렌즈(RGP)", p: "한 쌍 250,000원부터", d: "맞춤 제작, 2년 정도 써요" },
            ].map((c) => (
              <li key={c.n} className="rounded-lg border px-4 py-4" style={{ borderColor: C.steelLine, background: C.panel }}>
                <p className="flex items-center gap-2 text-[16px] font-bold">
                  <Contact size={18} aria-hidden style={{ color: C.copper }} />
                  {c.n}
                </p>
                <p className="mt-1 text-[15px] font-bold tabular-nums" style={{ color: C.navySoft }}>
                  {c.p}
                </p>
                <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
                  {c.d}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. 시력검사 예약 */}
        <section id="op-book" aria-labelledby="op-book-title" className="mt-16 scroll-mt-4 md:mt-24">
          <SectionTitle id="op-book-title" sub="검사는 20분 정도 걸려요. 소프트렌즈는 하루, 하드렌즈는 3일 빼고 오세요">
            시력검사 예약
          </SectionTitle>
          <Booking today={today} reduce={reduce} />
        </section>

        {/* 5. 오시는 길 */}
        <section id="op-map" aria-labelledby="op-map-title" className="mt-16 scroll-mt-4 md:mt-24">
          <SectionTitle id="op-map-title">오시는 길</SectionTitle>
          <Directions today={today} />
        </section>
      </main>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pb-10 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.steelLine, color: C.muted }}>
        <p className="text-[16px]" style={{ ...headF, color: C.navy }}>
          {BRAND}
        </p>
        <p>
          {ADDRESS}, 전화 {TEL}
        </p>
        <DemoMakerInfo className="mt-6" />
      </footer>

      {/* 휴대폰: 합계와 예약 버튼을 아래에 고정 */}
      <div
        inert={!barOn}
        className={`fixed inset-x-0 bottom-0 z-30 border-t px-4 py-3 md:hidden ${reduce ? "" : "transition-transform duration-300"} ${barOn ? "translate-y-0" : "translate-y-full"}`}
        style={{ background: C.panel, borderColor: C.steelLine }}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] leading-tight" style={{ color: C.muted }}>
            테 + 렌즈
            <span className="block text-[18px] font-bold tabular-nums" style={{ color: C.ink }}>
              {won(total)}
            </span>
          </p>
          <button
            type="button"
            onClick={() => go("op-book")}
            data-gtm-cta="optical_book_bar"
            className={`rounded-md px-5 py-3 text-[15px] font-bold text-white ${focusRing}`}
            style={{ background: C.navy, outlineColor: C.copper }}
          >
            시력검사 예약
          </button>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* ---------- 첫 화면 포스터 ---------- */

/* 포스터 모션 상수
   등장: 안경이 오른쪽(화면 폭의 42%)에서 가운데로 1600ms, EASE, 150ms 뒤 시작.
   포인터 추적: 스프링 stiffness 28, damping 16, mass 1.4. 최대 이동은 폭 7%, 높이 6%.
   터치 기기 떠다님: 좌우 11초, 위아래 14초 주기.
   렌즈 반사 띠: 9초마다 한 번 렌즈를 가로지른다.
   퇴장: 스크롤 진행 0 ~ 0.42 동안 왼쪽 렌즈 중심으로 확대, 렌즈 속 문장은 0.08 ~ 0.3 에 흐려진다. */
const POSTER_BG = "#e2e5ea";
const ENTER_MS = 1600;
const ENTER_DELAY_MS = 150;
const ENTER_FROM = 0.42;
const FOLLOW_SPRING = { stiffness: 28, damping: 16, mass: 1.4 } as const;
const FLOAT_X_S = 11;
const FLOAT_Y_S = 14;
const GLARE_S = 9;
const ZOOM_END = 0.42;

/** 화면 크기에서 안경 크기와 위치를 정한다. 렌즈 테두리 경로와 clip-path 가 같은 값을 쓴다 */
function posterGeo(w: number, h: number) {
  const mobile = w < 768;
  const L = mobile ? w * 0.56 : Math.min(w * 0.33, h * 0.6);
  const H = L * (mobile ? 0.84 : 0.74);
  const B = L * (mobile ? 0.14 : 0.22);
  const T = mobile ? Math.max(10, L * 0.07) : L * 0.055;
  const cx = w / 2;
  const cy = h * 0.48;
  const lx = cx - B / 2 - L / 2;
  const rx = cx + B / 2 + L / 2;
  const top = cy - H / 2;
  const r1 = H * 0.2;
  const r2 = H * 0.44;
  // 왼쪽 렌즈 안쪽이 화면을 다 덮을 만큼의 배율
  const dx = Math.max(lx, w - lx);
  const dy = Math.max(cy, h - cy);
  const zoom = Math.max(dx / (0.3 * (L - T)), dy / (0.3 * (H - T)));
  return { mobile, L, H, B, T, cx, cy, lx, rx, top, r1, r2, zoom };
}

type Geo = ReturnType<typeof posterGeo>;

const n1 = (v: number) => v.toFixed(1);

/** 위 모서리는 덜 둥글고 아래가 더 둥근 웰링턴형 렌즈 */
function lensD(x0: number, y0: number, L: number, H: number, r1: number, r2: number) {
  return [
    `M${n1(x0 + r1)} ${n1(y0)}`,
    `H${n1(x0 + L - r1)}`,
    `A${n1(r1)} ${n1(r1)} 0 0 1 ${n1(x0 + L)} ${n1(y0 + r1)}`,
    `V${n1(y0 + H - r2)}`,
    `A${n1(r2)} ${n1(r2)} 0 0 1 ${n1(x0 + L - r2)} ${n1(y0 + H)}`,
    `H${n1(x0 + r2)}`,
    `A${n1(r2)} ${n1(r2)} 0 0 1 ${n1(x0)} ${n1(y0 + H - r2)}`,
    `V${n1(y0 + r1)}`,
    `A${n1(r1)} ${n1(r1)} 0 0 1 ${n1(x0 + r1)} ${n1(y0)}`,
    "Z",
  ].join(" ");
}

const posterText =
  "absolute inset-0 flex flex-col items-center justify-center px-4 pb-[4svh] text-center leading-[1.04] tracking-[-0.02em] [word-break:keep-all] text-[clamp(52px,18vw,72px)] md:text-[clamp(72px,10.2vw,190px)]";

function PosterLines() {
  return (
    <>
      <span className="block">
        검사부터
        <br className="md:hidden" /> 맞춤까지
      </span>
      <span className="block">
        30분이면
        <br className="md:hidden" /> 돼요
      </span>
    </>
  );
}

function Poster({ reduce, onBook }: { reduce: boolean; onBook: () => void }) {
  const touch = useTouch();
  const wrapRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1440, h: 900 });

  const wMV = useMotionValue(1440);
  const hMV = useMotionValue(900);
  const zoomMV = useMotionValue(posterGeo(1440, 900).zoom);

  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      const h = Math.round(e.contentRect.height);
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
      wMV.set(w);
      hMV.set(h);
      zoomMV.set(posterGeo(w, h).zoom);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [wMV, hMV, zoomMV]);

  const g: Geo = posterGeo(size.w, size.h);

  // 등장: 1 이면 오른쪽, 0 이면 가운데
  const enterP = useMotionValue(1);
  useEffect(() => {
    if (reduce) {
      enterP.set(0);
      return;
    }
    const ctrl = animate(enterP, 0, { duration: ENTER_MS / 1000, delay: ENTER_DELAY_MS / 1000, ease: EASE });
    return () => ctrl.stop();
  }, [reduce, enterP]);

  // 포인터 -1 ~ 1
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, FOLLOW_SPRING);
  const sy = useSpring(my, FOLLOW_SPRING);

  // 터치 기기는 좌우로 천천히 떠다닌다
  useEffect(() => {
    if (!touch || reduce) {
      mx.set(0);
      my.set(0);
      return;
    }
    const a = animate(mx, [0, 0.8, 0, -0.8, 0], { duration: FLOAT_X_S, repeat: Infinity, ease: "easeInOut" });
    const b = animate(my, [0, 0.35, 0, -0.35, 0], { duration: FLOAT_Y_S, repeat: Infinity, ease: "easeInOut" });
    return () => {
      a.stop();
      b.stop();
    };
  }, [touch, reduce, mx, my]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (touch || reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });

  // 스크롤이 시작되면 포인터 이동은 줄어든다(확대 중심이 흔들리지 않게)
  const tx = useTransform([enterP, sx, scrollYProgress, wMV] as MotionValue<number>[], ([e, x, p, w]: number[]) => {
    const calm = 1 - Math.min(1, p / 0.25);
    return e * w * ENTER_FROM + x * w * 0.07 * calm;
  });
  const ty = useTransform([sy, scrollYProgress, hMV] as MotionValue<number>[], ([y, p, h]: number[]) => y * h * 0.06 * (1 - Math.min(1, p / 0.25)));
  const ntx = useTransform(tx, (v) => -v);
  const nty = useTransform(ty, (v) => -v);

  const zoomP = useTransform(scrollYProgress, [0, ZOOM_END], [0, 1], { clamp: true });
  // 처음엔 천천히, 끝에서 빨라진다
  const scale = useTransform([zoomP, zoomMV] as MotionValue<number>[], ([p, z]: number[]) => 1 + (z - 1) * p * p * p);
  // 함수형으로 둔다. 범위형 opacity 는 브라우저 스크롤 타임라인으로 넘어가며 target 구간을 놓쳤다
  const sharpOpacity = useTransform(scrollYProgress, (p: number) => 1 - Math.min(1, Math.max(0, (p - 0.08) / 0.22)));
  const chromeOpacity = useTransform(scrollYProgress, (p: number) => 1 - Math.min(1, p / 0.12));

  const uid = useId().replace(/:/g, "");
  const leftX = g.lx - g.L / 2;
  const rightX = g.rx - g.L / 2;
  const dL = lensD(leftX, g.top, g.L, g.H, g.r1, g.r2);
  const dR = lensD(rightX, g.top, g.L, g.H, g.r1, g.r2);
  const clip = `path("${dL} ${dR}")`;

  // 코다리: 두 렌즈 안쪽 위를 잇는 활 모양
  const by = g.top + g.H * 0.2;
  const bridge = `M${n1(g.lx + g.L / 2 - g.T * 0.3)} ${n1(by)}C${n1(g.cx - g.B * 0.3)} ${n1(by - g.H * 0.1)} ${n1(g.cx + g.B * 0.3)} ${n1(by - g.H * 0.1)} ${n1(g.rx - g.L / 2 + g.T * 0.3)} ${n1(by)}`;

  // 다리: 바깥 위 모서리에서 뒤로 넘어가며 가늘어지는 모양
  const hingeY = g.top + g.H * 0.16;
  const temple = (side: -1 | 1) => {
    const x0 = side === -1 ? leftX : rightX + g.L;
    const len = g.L * (g.mobile ? 0.3 : 0.36);
    const xe = x0 + side * len;
    const th = g.T * 0.9;
    return `M${n1(x0)} ${n1(hingeY - th / 2)}L${n1(xe)} ${n1(hingeY + g.H * 0.05 - th * 0.2)}L${n1(xe)} ${n1(hingeY + g.H * 0.05 + th * 0.2)}L${n1(x0)} ${n1(hingeY + th / 2)}Z`;
  };

  // 테 위쪽 하이라이트 한 줄
  const hiL = `M${n1(leftX + g.r1 * 0.5)} ${n1(g.top - g.T * 0.22)}L${n1(leftX + g.L * 0.62)} ${n1(g.top - g.T * 0.22)}`;
  const hiR = `M${n1(rightX + g.r1 * 0.5)} ${n1(g.top - g.T * 0.22)}L${n1(rightX + g.L * 0.62)} ${n1(g.top - g.T * 0.22)}`;

  const rims = [
    { key: "L", d: dL, x0: leftX },
    { key: "R", d: dR, x0: rightX },
  ];

  return (
    <section ref={wrapRef} id="op-poster" aria-labelledby="op-poster-title" className={`relative ${reduce ? "min-h-svh" : "h-[180svh]"}`}>
      <div ref={stickyRef} onPointerMove={onMove} className="sticky top-0 h-svh overflow-hidden" style={{ background: POSTER_BG, color: C.navy }}>
        <motion.div
          className="absolute inset-0"
          style={reduce ? undefined : { scale, originX: g.lx / size.w, originY: g.cy / size.h }}
        >
          {/* 바탕에 흐리게 깔린 문장. 블러는 고정값이다 */}
          <h1 id="op-poster-title" className={`${posterText} blur-[2px] md:blur-[3.5px] opacity-80`} style={{ ...headF, color: C.navy }}>
            <PosterLines />
          </h1>

          <motion.div className="pointer-events-none absolute inset-0" style={reduce ? undefined : { x: tx, y: ty }}>
            {/* 바닥 그림자와 테가 떨어뜨리는 그림자 */}
            <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none">
              <defs>
                <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation={g.T * 0.9} />
                </filter>
                <radialGradient id={`${uid}-floor`}>
                  <stop offset="0" stopColor={C.navy} stopOpacity="0.28" />
                  <stop offset="1" stopColor={C.navy} stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx={g.cx + g.T} cy={g.top + g.H * 1.32} rx={g.L + g.B * 0.6} ry={g.H * 0.09} fill={`url(#${uid}-floor)`} />
              {rims.map((r) => (
                <g key={r.key} transform={`translate(${n1(g.T * 0.8)} ${n1(g.T * 1.6)})`} filter={`url(#${uid}-soft)`}>
                  <path d={r.d} fill="none" stroke={C.navy} strokeOpacity="0.2" strokeWidth={g.T * 1.3} />
                </g>
              ))}
            </svg>

            {/* 렌즈 안에서만 선명한 문장 */}
            <div className="absolute inset-0" style={{ clipPath: clip, background: C.bg }}>
              <motion.p aria-hidden className={posterText} style={reduce ? { ...headF, color: C.navy } : { ...headF, color: C.navy, x: ntx, y: nty, opacity: sharpOpacity }}>
                <PosterLines />
              </motion.p>
            </div>

            {/* 렌즈 유리, 반사, 뿔테 */}
            <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id={`${uid}-horn`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#2b3f6b" />
                  <stop offset="0.22" stopColor="#14203d" />
                  <stop offset="0.4" stopColor="#3a5285" />
                  <stop offset="0.58" stopColor="#1b2a4a" />
                  <stop offset="0.8" stopColor="#0d1630" />
                  <stop offset="1" stopColor="#24365e" />
                </linearGradient>
                <pattern id={`${uid}-spots`} width="54" height="38" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
                  <ellipse cx="12" cy="10" rx="11" ry="5" fill="#7d93c2" fillOpacity="0.2" />
                  <ellipse cx="38" cy="26" rx="14" ry="6" fill="#070d1e" fillOpacity="0.35" />
                  <ellipse cx="44" cy="6" rx="6" ry="3" fill="#9fb2db" fillOpacity="0.16" />
                </pattern>
                <radialGradient id={`${uid}-glass`} cx="0.42" cy="0.38" r="0.7">
                  <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="1" stopColor={C.navy} stopOpacity="0.13" />
                </radialGradient>
                <linearGradient id={`${uid}-pin`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#f1f3f6" />
                  <stop offset="0.5" stopColor="#9aa3ad" />
                  <stop offset="1" stopColor="#5d6670" />
                </linearGradient>
                {rims.map((r) => (
                  <clipPath key={r.key} id={`${uid}-lens-${r.key}`}>
                    <path d={r.d} />
                  </clipPath>
                ))}
              </defs>

              {/* 다리와 경첩 */}
              {([-1, 1] as const).map((side) => (
                <g key={side}>
                  <path d={temple(side)} fill={`url(#${uid}-horn)`} />
                  <path d={temple(side)} fill={`url(#${uid}-spots)`} />
                  <circle cx={side === -1 ? leftX - g.T * 0.15 : rightX + g.L + g.T * 0.15} cy={hingeY} r={g.T * 0.32} fill={`url(#${uid}-pin)`} />
                </g>
              ))}

              {rims.map((r) => (
                <g key={r.key}>
                  {/* 유리 가장자리가 살짝 어둡다 */}
                  <path d={r.d} fill={`url(#${uid}-glass)`} />
                  {/* 고정 반사 한 줄과 렌즈를 지나가는 반사 띠 */}
                  <g clipPath={`url(#${uid}-lens-${r.key})`}>
                    <path
                      d={`M${n1(r.x0 + g.L * 0.1)} ${n1(g.top + g.H * 0.42)}L${n1(r.x0 + g.L * 0.34)} ${n1(g.top + g.H * 0.08)}`}
                      stroke="#ffffff"
                      strokeOpacity="0.55"
                      strokeWidth={g.T * 0.5}
                      strokeLinecap="round"
                    />
                    <motion.g
                      initial={false}
                      animate={reduce ? { x: 0 } : { x: [0, g.L * 1.9] }}
                      transition={reduce ? { duration: 0 } : { duration: GLARE_S, repeat: Infinity, ease: "easeInOut", times: [0, 1] }}
                    >
                      <polygon
                        points={`${n1(r.x0 - g.L * 0.5)},${n1(g.top + g.H)} ${n1(r.x0 - g.L * 0.32)},${n1(g.top + g.H)} ${n1(r.x0 - g.L * 0.02)},${n1(g.top)} ${n1(r.x0 - g.L * 0.2)},${n1(g.top)}`}
                        fill="#ffffff"
                        fillOpacity="0.22"
                      />
                    </motion.g>
                  </g>
                  {/* 뿔테: 그라디언트 위에 무늬를 한 번 더 */}
                  <path d={r.d} fill="none" stroke={`url(#${uid}-horn)`} strokeWidth={g.T} />
                  <path d={r.d} fill="none" stroke={`url(#${uid}-spots)`} strokeWidth={g.T} />
                  {/* 안쪽 모서리 빛과 바깥 모서리 그늘 */}
                  <path d={r.d} fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth={Math.max(1, g.T * 0.08)} transform={`translate(0 ${n1(g.T * 0.25)})`} />
                </g>
              ))}

              {/* 코다리 */}
              <path d={bridge} fill="none" stroke={`url(#${uid}-horn)`} strokeWidth={g.T * 0.95} strokeLinecap="round" />
              <path d={bridge} fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth={Math.max(1, g.T * 0.12)} strokeLinecap="round" transform={`translate(0 ${n1(-g.T * 0.25)})`} />
              {/* 위쪽 하이라이트 한 줄 */}
              <path d={hiL} stroke="#ffffff" strokeOpacity="0.6" strokeWidth={Math.max(1.5, g.T * 0.12)} strokeLinecap="round" />
              <path d={hiR} stroke="#ffffff" strokeOpacity="0.6" strokeWidth={Math.max(1.5, g.T * 0.12)} strokeLinecap="round" />
            </svg>
          </motion.div>
        </motion.div>

        {/* 상호, 예약 버튼, 영업시간 한 줄 */}
        <motion.div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4 md:px-8 md:pt-6" style={reduce ? undefined : { opacity: chromeOpacity }}>
          <p className="inline-flex items-center gap-2 text-[17px] leading-none" style={{ ...headF, color: C.navy }}>
            <Glasses size={22} strokeWidth={2.2} aria-hidden />
            {BRAND}
          </p>
          <button
            type="button"
            onClick={onBook}
            aria-label="시력검사 예약"
            data-gtm-cta="optical_poster_cta"
            className={`pointer-events-auto inline-flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform duration-100 active:scale-95 ${focusRing}`}
            style={{ background: C.navy, outlineColor: C.copper }}
          >
            <CalendarCheck size={22} aria-hidden />
          </button>
        </motion.div>
        <motion.p
          className="absolute bottom-0 left-0 px-4 pb-5 text-[15px] font-bold tabular-nums md:left-auto md:right-0 md:px-8 md:pb-7"
          style={reduce ? { color: C.navy } : { color: C.navy, opacity: chromeOpacity }}
        >
          평일 10:30 ~ 20:00, 토요일 19:00까지
        </motion.p>
      </div>
    </section>
  );
}

/* 3D 안경 무대 */

function Stage({ reduce, shape, material, idx, opts }: { reduce: boolean; shape: Shape; material: Material; idx: number; opts: Opts }) {
  const touch = useTouch();

  // -1 ~ 1. 포인터가 무대 어디에 있는지
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, TILT_SPRING);
  const sy = useSpring(my, TILT_SPRING);
  const rotateY = useTransform(sx, [-1, 1], [-16, 16]);
  const rotateX = useTransform(sy, [-1, 1], [12, -12]);
  // 반사광은 포인터 반대쪽으로
  const hx = useTransform(sx, [-1, 1], [34, -34]);
  const hy = useTransform(sy, [-1, 1], [18, -18]);
  // 오른쪽 렌즈는 좌우 반전 그룹 안이라 x를 뒤집어야 같은 방향으로 움직인다
  const hxR = useTransform(hx, (v) => -v);
  // 바닥 그림자는 기울어진 쪽으로 밀린다
  const shadowX = useTransform(sx, [-1, 1], [-22, 22]);
  const shadowScale = useTransform(sy, [-1, 1], [1.06, 0.94]);

  // 터치 기기: 좌우로 천천히 흔들린다. 동작 줄이기면 멈춘다
  useEffect(() => {
    if (!touch || reduce) {
      mx.set(0);
      my.set(0);
      return;
    }
    const ctrl = animate(mx, [-0.7, 0.7, -0.7], { duration: SWAY_S, repeat: Infinity, ease: "easeInOut" });
    return () => ctrl.stop();
  }, [touch, reduce, mx, my]);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (touch || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    if (touch) return;
    mx.set(0);
    my.set(0);
  };

  const uid = useId().replace(/:/g, "");
  const x = INDEXES[idx];
  // 렌즈 가장자리 두께를 과장해서 보여 준다
  const edge = (x.mm - 2) * 4;
  const tint = opts.photo ? "rgba(62,66,76,0.46)" : opts.blue ? "rgba(255,222,140,0.22)" : "rgba(255,255,255,0)";
  const glare = opts.blue ? "#9db1ff" : "#ffffff";
  const tintT = reduce ? { duration: 0 } : { duration: TINT_MS / 1000, ease: EASE };
  const swapT = reduce ? { duration: 0 } : { duration: SWAP_MS / 1000, ease: EASE };

  const rimless = shape.id === "rimless";
  const browline = shape.id === "browline";
  const metal = material.id === "titanium";
  const rimW = rimless ? 1.6 : material.width;
  const rimStroke = rimless ? "rgba(60,72,95,0.55)" : material.stroke;
  const templeW = Math.max(3.5, material.width * 0.8);
  const templeStroke = rimless ? "url(#metal)" : material.stroke;

  // 한쪽 렌즈 묶음. 오른쪽은 좌우 반전으로 쓴다
  const lens = (side: "L" | "R") => {
    const clip = `${uid}-clip-${side}`;
    const sign = side === "L" ? -1 : 1;
    return (
      <g transform={side === "L" ? "translate(-118 0)" : "translate(118 0) scale(-1 1)"}>
        <defs>
          <clipPath id={clip}>
            <path d={shape.d} />
          </clipPath>
        </defs>
        {/* 렌즈 유리 */}
        <path d={shape.d} fill={`url(#${uid}-glass)`} />
        {/* 색(블루라이트 미세한 노란빛, 변색은 회색) */}
        <motion.path d={shape.d} initial={false} animate={{ fill: tint }} transition={tintT} />
        {/* 누진: 아래쪽이 가까운 거리 구역 */}
        {opts.prog && (
          <g clipPath={`url(#${clip})`}>
            <rect x="-100" y="-80" width="200" height="160" fill={`url(#${uid}-prog)`} />
            <path d="M-70 18C-40 4 40 4 70 18" fill="none" stroke={C.navy} strokeOpacity="0.25" strokeWidth="1.2" strokeDasharray="4 4" />
            {side === "L" && (
              <>
                <text x="0" y="-26" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.navy} fillOpacity="0.55">
                  멀리
                </text>
                <text x="0" y="46" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.navy} fillOpacity="0.55">
                  가까이
                </text>
              </>
            )}
          </g>
        )}
        {/* 렌즈 가장자리 두께. 굴절률이 낮을수록 두껍다 */}
        <motion.path d={shape.d} fill="none" stroke="rgba(130,160,200,0.5)" clipPath={`url(#${clip})`} initial={false} animate={{ strokeWidth: edge * 2 }} transition={tintT} />
        <motion.path d={shape.d} fill="none" stroke="rgba(255,255,255,0.6)" clipPath={`url(#${clip})`} initial={false} animate={{ strokeWidth: edge * 2 - 4 }} transition={tintT} />
        {/* 반사광. 포인터 반대쪽으로 움직인다 */}
        <g clipPath={`url(#${clip})`}>
          <motion.g style={reduce ? undefined : { x: side === "L" ? hx : hxR, y: hy }}>
            <motion.ellipse cx={-30 * sign} cy="-22" rx="34" ry="12" transform={`rotate(${-28 * -sign} ${-30 * sign} -22)`} initial={false} animate={{ fill: glare }} transition={tintT} fillOpacity="0.72" />
            <motion.ellipse cx={-6 * sign} cy="4" rx="48" ry="5" transform={`rotate(${-28 * -sign} ${-6 * sign} 4)`} initial={false} animate={{ fill: glare }} transition={tintT} fillOpacity="0.3" />
          </motion.g>
        </g>
        {/* 테두리 */}
        {browline ? (
          <>
            <path d={shape.d} fill="none" stroke={material.stroke} strokeWidth={Math.max(rimW, 6) + 6} clipPath={`url(#${uid}-top)`} />
            <path d={shape.d} fill="none" stroke="url(#metal)" strokeWidth="2.4" />
          </>
        ) : (
          <path d={shape.d} fill="none" stroke={rimStroke} strokeWidth={rimW} strokeLinejoin="round" />
        )}
        {/* 무테 나사 */}
        {rimless && (
          <>
            <circle cx={shape.inner - 4} cy={shape.bridgeY} r="2.6" fill="#6d7681" />
            <circle cx={-shape.outer + 4} cy={shape.templeY} r="2.6" fill="#6d7681" />
          </>
        )}
        {/* 코받침: 금속테와 무테, 하금테 */}
        {(metal || rimless || browline) && <ellipse cx={shape.inner - 8} cy="12" rx="3.5" ry="8" transform={`rotate(-14 ${shape.inner - 8} 12)`} fill="rgba(255,255,255,0.85)" stroke="#8a929c" strokeWidth="1.2" />}
        {/* 다리: 힌지와 짧게 보이는 안경다리 */}
        <path d={`M${-shape.outer} ${shape.templeY} l-10 0 l-26 16`} fill="none" stroke={templeStroke} strokeWidth={templeW} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={-shape.outer - 10} cy={shape.templeY} r={templeW * 0.45} fill={metal || rimless ? "#6d7681" : material.stroke} />
      </g>
    );
  };

  // 코다리. 안쪽 가장자리 두 개를 잇는다
  const bx = 118 - shape.inner;
  const by = shape.bridgeY;
  const bridge = `M${-bx} ${by}C${-bx + 8} ${by - 16} ${bx - 8} ${by - 16} ${bx} ${by}`;
  const noseWire = browline ? `M${-bx} -4C${-bx + 10} -14 ${bx - 10} -14 ${bx} -4` : null;

  return (
    <div
      id="op-stage"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative mx-auto w-full max-w-[720px] touch-pan-y select-none overflow-hidden rounded-2xl"
      style={{
        background: "radial-gradient(ellipse 70% 60% at 50% 42%, #ffffff 0%, #e8ebf0 70%, #dde1e7 100%)",
        perspective: 900,
      }}
    >
      <div className="h-[168px] md:h-[300px] lg:h-[380px]" />
      {/* 바닥 그림자 */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-[72%] h-[10%] w-[62%] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(ellipse at center, rgba(27,42,74,0.22), rgba(27,42,74,0) 70%)", x: reduce ? 0 : shadowX, scaleX: reduce ? 1 : shadowScale }}
      />
      <motion.div className="absolute inset-0 flex items-center justify-center" style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}>
        <svg viewBox="-270 -100 540 200" className="h-full w-full px-3" role="img" aria-label={`${shape.name} ${material.name} 테, 굴절률 ${x.v} 렌즈`}>
          <defs>
            <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#d6dbe1" />
              <stop offset="0.45" stopColor="#8a929c" />
              <stop offset="0.7" stopColor="#b5bcc4" />
              <stop offset="1" stopColor="#6f7882" />
            </linearGradient>
            <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.72" />
              <stop offset="1" stopColor="#c3d0e2" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id={`${uid}-prog`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0.45" stopColor={C.navy} stopOpacity="0" />
              <stop offset="1" stopColor={C.navy} stopOpacity="0.12" />
            </linearGradient>
            <clipPath id={`${uid}-top`}>
              <rect x="-120" y="-90" width="240" height="78" />
            </clipPath>
          </defs>
          <AnimatePresence initial={false}>
            <motion.g key={`${shape.id}-${material.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={swapT}>
              {lens("L")}
              {lens("R")}
              <path d={bridge} fill="none" stroke={rimless || metal ? "url(#metal)" : material.stroke} strokeWidth={rimless ? 3 : Math.max(4, material.width * 0.9)} strokeLinecap="round" />
              {noseWire && <path d={noseWire} fill="none" stroke="url(#metal)" strokeWidth="2.4" strokeLinecap="round" />}
            </motion.g>
          </AnimatePresence>
        </svg>
      </motion.div>
    </div>
  );
}

/* 고른 내용과 합계 */
function Summary({
  shape,
  material,
  idx,
  opts,
  framePrice,
  lensPrice,
  total,
  reduce,
  onBook,
}: {
  shape: Shape;
  material: Material;
  idx: number;
  opts: Opts;
  framePrice: number;
  lensPrice: number;
  total: number;
  reduce: boolean;
  onBook: () => void;
}) {
  const on = OPTIONS.filter((o) => opts[o.id]);
  return (
    <div id="op-total" className="mx-auto mt-3 hidden w-full max-w-[720px] gap-3 rounded-xl border px-4 py-4 md:grid md:grid-cols-[1fr_auto] md:items-end" style={{ borderColor: C.steelLine, background: C.panel }}>
      <dl className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 text-[15px]">
        <dt className="font-bold" style={{ color: C.muted }}>
          테
        </dt>
        <dd>
          {shape.name}, {material.name}
        </dd>
        <dd className="text-right tabular-nums">{won(framePrice)}</dd>
        <dt className="font-bold" style={{ color: C.muted }}>
          렌즈
        </dt>
        <dd>
          {INDEXES[idx].v}
          {on.length > 0 && `, ${on.map((o) => o.name).join(", ")}`}
        </dd>
        <dd className="text-right tabular-nums">{won(lensPrice)}</dd>
      </dl>
      <div className="flex items-end gap-4 md:flex-col md:items-end md:gap-2">
        <p className="text-[13px] font-bold" style={{ color: C.muted }}>
          테 + 렌즈 합계
        </p>
        <p aria-live="polite" className="text-[30px] leading-none" style={{ ...headF, color: C.navy }}>
          <Rolling value={total} reduce={reduce} />
        </p>
        <button type="button" onClick={onBook} data-gtm-cta="optical_book_summary" className={`rounded-md px-4 py-2 text-[14px] font-bold text-white ${focusRing}`} style={{ background: C.copper, outlineColor: C.navy }}>
          이 안경으로 검사 예약
        </button>
      </div>
    </div>
  );
}

/* 숫자 롤링. 자리마다 0~9 기둥이 위아래로 움직인다 */
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Rolling({ value, reduce }: { value: number; reduce: boolean }) {
  const str = value.toLocaleString("ko-KR");
  return (
    <span className="inline-flex items-baseline">
      <span className="sr-only">{str}원</span>
      <span aria-hidden className="inline-flex leading-none tabular-nums">
        {str.split("").map((ch, i) => {
          const key = str.length - i;
          if (ch === ",") return <span key={`c${key}`}>,</span>;
          return <Digit key={`d${key}`} d={Number(ch)} reduce={reduce} />;
        })}
      </span>
      <span aria-hidden className="ml-1 text-[18px] font-bold">
        원
      </span>
    </span>
  );
}

function Digit({ d, reduce }: { d: number; reduce: boolean }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.6em] overflow-hidden">
      <motion.span className="absolute left-0 top-0 flex flex-col" initial={false} animate={{ y: `-${d}em` }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 24 }}>
        {DIGITS.map((n) => (
          <span key={n} className="block h-[1em] leading-none">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/* ====================================================================== */
/* 작은 그림들 */

function SectionTitle({ id, sub, children }: { id: string; sub?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 id={id} className="text-[24px] leading-tight md:text-[28px]" style={{ ...headF, color: C.navy }}>
        {children}
      </h2>
      {sub && (
        <p className="mt-1.5 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/** 테 카드 안의 작은 모양 */
function MiniFrame({ shape, color }: { shape: Shape; color: string }) {
  const bx = 118 - shape.inner;
  const by = shape.bridgeY;
  return (
    <svg viewBox="-215 -80 430 160" className="h-[34px] w-[92px]" aria-hidden>
      <g transform="translate(-118 0)">
        <path d={shape.d} fill="none" stroke={color} strokeWidth={shape.id === "rimless" ? 3 : 8} />
      </g>
      <g transform="translate(118 0) scale(-1 1)">
        <path d={shape.d} fill="none" stroke={color} strokeWidth={shape.id === "rimless" ? 3 : 8} />
      </g>
      <path d={`M${-bx} ${by}C${-bx + 8} ${by - 16} ${bx - 8} ${by - 16} ${bx} ${by}`} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
      {shape.id === "browline" && (
        <>
          <g transform="translate(-118 0)">
            <path d={shape.d} fill="none" stroke={color} strokeWidth="18" clipPath="url(#mini-top)" />
          </g>
          <g transform="translate(118 0) scale(-1 1)">
            <path d={shape.d} fill="none" stroke={color} strokeWidth="18" clipPath="url(#mini-top)" />
          </g>
          <defs>
            <clipPath id="mini-top">
              <rect x="-120" y="-90" width="240" height="70" />
            </clipPath>
          </defs>
        </>
      )}
    </svg>
  );
}

function MaterialSwatch({ id }: { id: MaterialId }) {
  const bg = id === "acetate" ? `linear-gradient(135deg, ${C.navy}, #3b4f7a)` : id === "titanium" ? "linear-gradient(135deg, #d6dbe1, #8a929c 50%, #b5bcc4)" : "linear-gradient(135deg, #4a535e, #2f363f)";
  return <span aria-hidden className="h-4 w-4 flex-none rounded-full border border-white/70" style={{ background: bg }} />;
}

/** 굴절률 카드의 두께 막대. 옆에서 본 렌즈 단면 */
function ThicknessBar({ mm, color }: { mm: number; color: string }) {
  const w = Math.round(mm * 3.2);
  return (
    <svg viewBox="0 0 40 24" className="h-6 w-10" aria-hidden>
      <rect x={20 - w / 2} y="2" width={w} height="20" rx="3" fill={color} fillOpacity="0.9" />
    </svg>
  );
}

function FaceIcon({ id, color }: { id: FaceId; color: string }) {
  const d =
    id === "round"
      ? "M16 3c7.5 0 12 6 12 13s-4.5 13-12 13S4 23 4 16 8.5 3 16 3z"
      : id === "square"
        ? "M8 3h16c2 0 3 1.5 3 3.5v16c0 3-2 6.5-5 6.5H10c-3 0-5-3.5-5-6.5v-16C5 4.5 6 3 8 3z"
        : id === "long"
          ? "M16 2c6 0 9 5 9 14s-3 14-9 14-9-5-9-14S10 2 16 2z"
          : "M16 3c7 0 12 3 12 8 0 8-7 18-12 18S4 19 4 11c0-5 5-8 12-8z";
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="14" r="1.3" fill={color} />
      <circle cx="20" cy="14" r="1.3" fill={color} />
    </svg>
  );
}

/* ====================================================================== */
/* 시력검사 예약 */

interface Done {
  no: string;
  day: Date;
  slot: string;
  name: string;
  phone: string;
}

function Booking({ today, reduce }: { today: Date; reduce: boolean }) {
  const days = Array.from({ length: BOOK_DAYS }, (_, i) => daysAgo(today, -i));
  const firstOpen = days.findIndex((d) => slotsFor(d).length > 0);
  const [day, setDay] = useState(Math.max(0, firstOpen));
  const [slot, setSlot] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [count, setCount] = useState(0);
  const doneRef = useRef<HTMLDivElement>(null);

  const slots = slotsFor(days[day]);
  const phoneOk = /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.trim());
  const errs = {
    slot: slot === null ? "시간을 골라 주세요" : "",
    name: name.trim() ? "" : "이름을 적어 주세요",
    phone: phoneOk ? "" : "확정 문자를 받을 휴대폰 번호를 확인해 주세요",
    agree: agree ? "" : "개인정보 수집에 동의해 주세요",
  };
  const ok = Object.values(errs).every((e) => !e);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok || slot === null) return;
    const d = days[day];
    const no = `EYE-${p2(d.getMonth() + 1)}${p2(d.getDate())}-${slots[slot].replace(":", "")}-${p2(count + 1)}`;
    setDone({ no, day: d, slot: slots[slot], name, phone });
    setCount((n) => n + 1);
    requestAnimationFrame(() => doneRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };

  const reset = () => {
    setDone(null);
    setTried(false);
    setSlot(null);
    setName("");
    setPhone("");
    setNote("");
    setAgree(false);
  };

  const err = (k: keyof typeof errs) =>
    tried && errs[k] ? (
      <p className="mt-1.5 text-[14px] font-bold" style={{ color: C.error }}>
        {errs[k]}
      </p>
    ) : null;

  if (done) return <BookingDone ref={doneRef} done={done} today={today} reduce={reduce} onAgain={reset} />;

  const inputCls = `mt-2 w-full rounded-md border-2 bg-white px-3 py-3 text-[17px] ${focusRing}`;
  const inputStyle = { borderColor: C.steelLine, outlineColor: C.copper } as const;

  return (
    <form onSubmit={submit} noValidate className="mt-5 grid gap-8 rounded-xl border px-4 py-6 md:grid-cols-2 md:px-6" style={{ borderColor: C.steelLine, background: C.panel }}>
      <div>
        <fieldset>
          <legend className="text-[16px] font-bold">날짜</legend>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {days.map((d, i) => {
              const open = slotsFor(d).length > 0;
              const sel = day === i;
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={sel}
                  disabled={!open}
                  aria-label={`${fmtKo(d)}${open ? "" : ", 휴무"}`}
                  onClick={() => {
                    setDay(i);
                    setSlot(null);
                  }}
                  className={`rounded-md border-2 py-2 text-center tabular-nums disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                  style={{ borderColor: sel ? C.navy : C.steelLine, background: sel ? C.navy : "transparent", color: sel ? "#fff" : C.ink, outlineColor: C.copper }}
                >
                  <span className="block text-[12px]">{i === 0 ? "오늘" : DOW[d.getDay()]}</span>
                  <span className="block text-[16px] font-bold">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-[16px] font-bold">시간</legend>
          <p className="mt-1 text-[13px]" style={{ color: C.muted }}>
            12:30 ~ 13:30은 점심시간이에요. 당일 예약은 전화로 확인 뒤 확정돼요.
          </p>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {slots.map((t, s) => {
              const full = taken(day, s);
              const sel = slot === s;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={sel}
                  disabled={full}
                  aria-label={`${t}${full ? ", 마감" : ""}`}
                  onClick={() => setSlot(s)}
                  className={`rounded-md border-2 py-2.5 text-[15px] font-bold tabular-nums disabled:cursor-not-allowed ${focusRing}`}
                  style={{
                    borderColor: sel ? C.copper : full ? C.steelSoft : C.steelLine,
                    background: sel ? C.copper : full ? C.steelSoft : "transparent",
                    color: sel ? "#fff" : full ? C.steel : C.ink,
                    textDecoration: full ? "line-through" : "none",
                    outlineColor: C.navy,
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          {err("slot")}
        </fieldset>
      </div>

      <div>
        <label className="block text-[16px] font-bold">
          이름
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputCls} style={inputStyle} />
        </label>
        {err("name")}
        <label className="mt-5 block text-[16px] font-bold">
          휴대폰
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={inputCls} style={inputStyle} />
        </label>
        {err("phone")}
        <label className="mt-5 block text-[16px] font-bold">
          남기실 말 <span style={{ color: C.muted }}>(선택)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="지금 쓰는 안경 도수, 렌즈 착용 여부" className={inputCls} style={inputStyle} />
        </label>
        <label className="mt-5 flex items-start gap-2 text-[15px]">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`mt-1 h-5 w-5 ${focusRing}`} style={{ accentColor: C.navy, outlineColor: C.copper }} />
          <span>예약 확인 연락을 위한 개인정보 수집에 동의해요. 검사 뒤 바로 지워요.</span>
        </label>
        {err("agree")}
        <button
          type="submit"
          data-gtm-cta="optical_book_submit"
          className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3.5 text-[17px] font-bold text-white transition-transform duration-100 active:translate-y-px ${focusRing}`}
          style={{ background: C.navy, outlineColor: C.copper }}
        >
          <Eye size={20} aria-hidden />
          예약하기
        </button>
      </div>
    </form>
  );
}

function BookingDone({ ref, done, today, reduce, onAgain }: { ref: React.Ref<HTMLDivElement>; done: Done; today: Date; reduce: boolean; onAgain: () => void }) {
  const sameDay = done.day.getTime() === today.getTime();
  const rows = [
    ["예약번호", done.no],
    ["검사 일시", `${fmtKo(done.day)} ${done.slot}`],
    ["예약자", `${maskName(done.name)}, ${maskPhone(done.phone)}`],
    ["담당 창구", `전화 ${TEL} 또는 ${KAKAO}`],
    ["확정 안내", sameDay ? "30분 안에 전화로 확정해 드려요" : `${fmtKo(today)} 영업시간 안에 확정 문자를 보내 드려요`],
  ];
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
      className="mt-5 scroll-mt-4 rounded-xl border px-4 py-6 md:px-6"
      style={{ borderColor: C.navy, background: C.panel }}
      role="status"
    >
      <p className="inline-flex items-center gap-2 text-[22px]" style={{ ...headF, color: C.navy }}>
        <Check size={24} strokeWidth={3} aria-hidden style={{ color: C.copper }} />
        시력검사 예약이 접수됐어요
      </p>
      <dl className="mt-4 grid gap-y-2 text-[16px] sm:grid-cols-[120px_1fr]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-bold" style={{ color: C.muted }}>
              {k}
            </dt>
            <dd className="tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-5 list-disc space-y-1 pl-5 text-[15px] leading-[1.7]" style={{ color: C.ink }}>
        <li>검사는 20분 정도 걸려요. 10분 전에 와 주세요.</li>
        <li>소프트렌즈는 하루, 하드렌즈는 3일 빼고 오세요.</li>
        <li>지금 쓰는 안경이 있으면 챙겨 오세요. 도수 비교에 써요.</li>
      </ul>
      <div className="mt-6 flex flex-wrap gap-2">
        <a href={`tel:${TEL.replace(/-/g, "")}`} className={`inline-flex items-center gap-1.5 rounded-md border-2 px-4 py-2.5 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.navy, color: C.navy, outlineColor: C.copper }}>
          <Phone size={16} aria-hidden />
          전화 {TEL}
        </a>
        <span className="inline-flex items-center gap-1.5 rounded-md border-2 px-4 py-2.5 text-[15px] font-bold" style={{ borderColor: C.steelLine, color: C.ink }}>
          <MessageCircle size={16} aria-hidden />
          {KAKAO}
        </span>
        <button type="button" onClick={onAgain} className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2.5 text-[15px] font-bold ${focusRing}`} style={{ color: C.muted, outlineColor: C.copper }}>
          <RotateCcw size={16} aria-hidden />
          다른 시간으로
        </button>
      </div>
    </motion.div>
  );
}

/* ====================================================================== */
/* 오시는 길과 영업시간 */

function Directions({ today }: { today: Date }) {
  const dow = today.getDay();
  return (
    <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_380px]">
      {/* 약도. 실제 사이트에는 네이버 지도나 카카오맵을 넣는다 */}
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: C.steelLine, background: C.panel }}>
        <svg viewBox="0 0 600 320" className="h-auto w-full" role="img" aria-label="약도. ㅇㅇ역 3번 출구에서 큰길 따라 걸어오면 왼쪽 첫 건물 1층">
          <rect width="600" height="320" fill="#f1f3f6" />
          <g stroke="#ffffff" strokeWidth="26" strokeLinecap="round">
            <path d="M0 160H600" />
            <path d="M160 0V320" />
            <path d="M420 0V320" />
            <path d="M0 60H600" strokeWidth="14" />
            <path d="M0 260H600" strokeWidth="14" />
          </g>
          <g stroke="#dfe3e8" strokeWidth="1.5" strokeDasharray="6 6">
            <path d="M0 160H600" />
            <path d="M160 0V320" />
            <path d="M420 0V320" />
          </g>
          <rect x="190" y="90" width="90" height="50" rx="4" fill="#dfe3e8" />
          <rect x="300" y="90" width="100" height="50" rx="4" fill="#dfe3e8" />
          <rect x="190" y="180" width="200" height="60" rx="4" fill="#dfe3e8" />
          <rect x="450" y="80" width="120" height="60" rx="4" fill="#dfe3e8" />
          <rect x="450" y="180" width="120" height="60" rx="4" fill="#dfe3e8" />
          {/* 지하철 출구 */}
          <g transform="translate(130 184)">
            <rect x="-28" y="-14" width="56" height="28" rx="6" fill={C.navy} />
            <text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
              3번 출구
            </text>
          </g>
          {/* 걷는 길 */}
          <path d="M160 170C190 170 200 150 240 150" fill="none" stroke={C.copper} strokeWidth="4" strokeDasharray="8 7" strokeLinecap="round" />
          {/* 매장 */}
          <g transform="translate(240 118)">
            <rect x="-46" y="-26" width="92" height="52" rx="6" fill={C.copper} />
            <text x="0" y="-3" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
              {BRAND}
            </text>
            <text x="0" y="14" textAnchor="middle" fontSize="11" fill="#fff" fillOpacity="0.9">
              1층
            </text>
          </g>
          {/* 주차 */}
          <g transform="translate(345 74)">
            <rect x="-30" y="-14" width="60" height="28" rx="6" fill="#ffffff" stroke={C.steel} />
            <text x="0" y="5" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.navy}>
              주차 P
            </text>
          </g>
          <text x="575" y="178" textAnchor="end" fontSize="12" fill={C.muted}>
            ㅇㅇ로
          </text>
          <text x="172" y="30" fontSize="12" fill={C.muted}>
            ㅇㅇ길
          </text>
        </svg>
      </div>

      <div className="flex flex-col gap-5 rounded-xl border px-5 py-5" style={{ borderColor: C.steelLine, background: C.panel }}>
        <div className="flex items-start gap-3">
          <MapPin size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.copper }} />
          <div className="text-[15px] leading-[1.6]">
            <p className="font-bold">{ADDRESS}</p>
            <p style={{ color: C.muted }}>1층 길가 매장, 간판에 곰 그림</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <TrainFront size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.copper }} />
          <div className="text-[15px] leading-[1.6]">
            <p className="font-bold">ㅇㅇ역 3번 출구 도보 3분</p>
            <p style={{ color: C.muted }}>출구 나와서 큰길 따라 직진, 왼쪽 첫 건물</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Car size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.copper }} />
          <div className="text-[15px] leading-[1.6]">
            <p className="font-bold">건물 뒤 주차 2대, 1시간 무료</p>
            <p style={{ color: C.muted }}>자리가 없으면 옆 건물 공영주차장, 주차권 드려요</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.copper }} />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold">영업시간</p>
            <table className="mt-1 w-full text-[15px]" style={{ color: C.ink }}>
              <tbody>
                {HOURS.map((h) => {
                  const isToday = h.dow === dow;
                  return (
                    <tr key={h.label} style={{ background: isToday ? C.copperSoft : "transparent", fontWeight: isToday ? 700 : 400 }}>
                      <th scope="row" className="rounded-l-md py-1 pl-2 pr-3 text-left" style={{ fontWeight: "inherit" }}>
                        {h.label}
                        {isToday && <span className="sr-only">, 오늘</span>}
                      </th>
                      <td className="rounded-r-md py-1 pr-2 text-right tabular-nums">{h.open ?? "휴무"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
              마감 30분 전까지 시력검사 접수. 점심시간 12:30 ~ 13:30
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
