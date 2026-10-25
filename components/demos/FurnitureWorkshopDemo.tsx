"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Car, Check, Clock, Download, MapPin, Menu, MessageCircle, Paperclip, Phone, TrainFront, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 원목 가구 주문 제작 공방 샘플: 가상의 곰파트너 가구 공방. 상호, 주소, 가격은 모두 가상이다.

   국내 원목 공방 사이트 구성을 따랐다. 메뉴는 제작 가구, 주문 제작, 목재 안내, 작업 과정, 공방 소개, 오시는 길.
   첫 화면에는 대표 가구와 "주문 제작 문의" 버튼, 치수와 목재를 고르는 주문 제작 안내가 온다.
   공방들은 치수를 mm로 받고, 견적은 목재 종류와 판재 양으로 내고, 제작 기간은 4~6주, 방문은 예약제가 보통이다.
   마감은 오일과 바니시 두 가지를 둔다.

   핵심 모션은 도면 선 그리기다. 첫 화면에서 정면도와 측면도가 pathLength 0에서 1로 선마다 시차를 두고 그려지고(총 1.6초),
   그려진 뒤 치수선이 가운데에서 양쪽으로 늘어나며 숫자가 나타난다. 치수 슬라이더를 움직이면 좌표를 다시 계산해
   도면의 d 값이 바뀌고, 가구 종류를 바꾸면 처음부터 다시 그린다. 동작 줄이기면 모두 완성 상태로 바로 보인다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 가구 종류: 테이블, 책장, 벤치, TV 선반. 고르면 도면이 그 가구로 다시 그려진다.
   2. 치수: 폭, 깊이, 높이 슬라이더(10mm 단위). 도면과 치수선이 따라 바뀌고 판재 양에 따라 견적이 바뀐다.
   3. 목재와 마감: 오크, 월넛, 애쉬, 레드파인. 도면 면 색이 그 목재 색으로 바뀌고 단가가 달라진다. 마감은 오일, 바니시.
   4. 견적과 제작 문의: 합계, 제작 기간(오늘 기준 4~6주 뒤). 이름, 휴대폰을 넣고 보내면 접수번호, 도면 PNG 저장, 회신 예정일이 보인다.
   5. 작업 과정: 재단, 조립, 샌딩, 마감 네 단계를 선 위의 점으로 두고 단계를 누르면 설명이 바뀐다. 공방 방문은 예약제.

   포스터 첫 화면(fw-poster): 작업대에서 판재를 다듬는 사진 한 장이 화면을 채우고, 아래 왼쪽에 문장 "원하는 치수로 한 점씩 제작합니다".
   들어올 때 사진이 1.06배에서 1배로 1.6초 동안 다가오고, 문장은 0.3초 뒤 12px 아래에서 올라온다(CSS keyframes).
   스크롤하면 사진만 조금 느리게 움직인다. 작업 과정의 점은 움직이지 않고, 움직임은 도면 선 그리기에 모았다.

   사진 출처: Pexels 사진 5974285, 완성한 가구 piece-(가구 id)는 AI 생성(Z-Image-Turbo) */

const SLUG = "furniture-workshop";
const BRAND = "곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 1층";
const KAKAO = "카카오톡 채널 곰파트너";

/* 모션 상수(ms). 선 그리기 전체 1.6초, 선 하나 0.55초, 나머지는 시차로 나눈다. */
const DRAW_MS = 1600;
const LINE_MS = 550;
const DIM_MS = 450;
const FILL_MS = 300;
const MORPH_MS = 320;
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
const p2 = (n: number) => String(n).padStart(2, "0");

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

/** 가구에 들어가는 판재 양(m2). 실제 공방은 재단표로 세지만 여기서는 부재별 면적을 더한다. */
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

/* ── 도면 좌표 ─────────────────────────────────────────── */

interface Board {
  W: number;
  H: number;
  left: number;
  right: number;
  top: number;
  floor: number;
  gap: number;
}
/** 첫 화면 도면판. 왼쪽 여백에 높이 치수, 아래 여백에 폭과 깊이 치수가 온다. */
const BOARD: Board = { W: 480, H: 300, left: 72, right: 444, top: 40, floor: 232, gap: 56 };
const ICON_BOARD: Board = { W: 48, H: 36, left: 3, right: 45, top: 3, floor: 33, gap: 0 };

interface Part {
  id: string;
  d: string;
  /** 목재 색으로 채우는 면인지 */
  face: boolean;
}
interface DimLineSpec {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tx: number;
  ty: number;
  value: number;
  vertical: boolean;
}
interface Geo {
  parts: Part[];
  dims: { w: DimLineSpec; d: DimLineSpec; h: DimLineSpec } | null;
  labels: { x: number; y: number; text: string }[];
}

const fx = (n: number) => n.toFixed(1);
const R = (x: number, y: number, w: number, h: number) => `M${fx(x)},${fx(y)} L${fx(x + w)},${fx(y)} L${fx(x + w)},${fx(y + h)} L${fx(x)},${fx(y + h)} Z`;
const P = (pts: [number, number][]) => `M${pts.map(([x, y]) => `${fx(x)},${fx(y)}`).join(" L")} Z`;

/** 가구 종류와 치수(mm)로 정면도, 측면도의 부재 좌표를 만든다. 축척은 두 뷰가 같다. */
function geometry(kind: KindId, { w, d, h }: Dims, b: Board, both: boolean): Geo {
  const avail = both ? b.right - b.left - b.gap : b.right - b.left;
  const s = Math.min(avail / (both ? w + d : w), (b.floor - b.top) / h);
  const fw = w * s;
  const fd = d * s;
  const fh = h * s;
  const total = both ? fw + b.gap + fd : fw;
  const x0 = b.left + (b.right - b.left - total) / 2;
  const y0 = b.floor - fh;
  const sx = x0 + fw + b.gap;
  const fl = b.floor;
  const parts: Part[] = [];
  const add = (id: string, dd: string, face = true) => parts.push({ id, d: dd, face });

  if (kind === "table") {
    const t = 40 * s;
    const ins = 70 * s;
    const lw = 70 * s;
    const a = 80 * s;
    add("top", R(x0, y0, fw, t));
    add("legL", R(x0 + ins, y0 + t, lw, fh - t));
    add("legR", R(x0 + fw - ins - lw, y0 + t, lw, fh - t));
    add("apron", R(x0 + ins + lw, y0 + t, fw - 2 * (ins + lw), a));
    if (both) {
      add("sTop", R(sx, y0, fd, t));
      add("sLegL", R(sx + ins, y0 + t, lw, fh - t));
      add("sLegR", R(sx + fd - ins - lw, y0 + t, lw, fh - t));
      add("sApron", R(sx + ins + lw, y0 + t, fd - 2 * (ins + lw), a));
    }
  } else if (kind === "shelf") {
    const p = 25 * s;
    const lift = 60 * s;
    const n = shelfCount(h);
    const innerTop = y0 + p;
    const innerBottom = fl - lift - p;
    add("sideL", R(x0, y0, p, fh - lift));
    add("sideR", R(x0 + fw - p, y0, p, fh - lift));
    add("plateT", R(x0 + p, y0, fw - 2 * p, p));
    add("plateB", R(x0 + p, innerBottom, fw - 2 * p, p));
    const gapY = (innerBottom - innerTop) / (n + 1);
    for (let i = 0; i < n; i++) add(`shelf${i}`, R(x0 + p, innerTop + gapY * (i + 1) - p / 2, fw - 2 * p, p));
    if (w >= 1300) add("divider", R(x0 + fw / 2 - p / 2, innerTop, p, innerBottom - innerTop));
    if (both) {
      add("sPanel", R(sx, y0, fd, fh - lift));
      for (let i = 0; i < n; i++) add(`sShelf${i}`, R(sx, innerTop + gapY * (i + 1) - p / 2, fd, p), false);
    }
  } else if (kind === "bench") {
    const t = 40 * s;
    const topIn = 140 * s;
    const botIn = 80 * s;
    const lw = 60 * s;
    add("top", R(x0, y0, fw, t));
    add("legL", P([[x0 + topIn, y0 + t], [x0 + topIn + lw, y0 + t], [x0 + botIn + lw, fl], [x0 + botIn, fl]]));
    add("legR", P([[x0 + fw - topIn - lw, y0 + t], [x0 + fw - topIn, y0 + t], [x0 + fw - botIn, fl], [x0 + fw - botIn - lw, fl]]));
    add("stretcher", R(x0 + topIn + lw, fl - 150 * s, fw - 2 * (topIn + lw), 40 * s));
    if (both) {
      add("sTop", R(sx, y0, fd, t));
      add("sLeg", R(sx + 40 * s, y0 + t, fd - 80 * s, fh - t));
    }
  } else {
    const t = 30 * s;
    const p = 25 * s;
    const legH = 150 * s;
    const lw = 50 * s;
    const boxH = fh - legH;
    add("top", R(x0, y0, fw, t));
    add("bottom", R(x0, fl - legH - t, fw, t));
    add("sideL", R(x0, y0 + t, p, boxH - 2 * t));
    add("sideR", R(x0 + fw - p, y0 + t, p, boxH - 2 * t));
    add("div1", R(x0 + fw / 3 - p / 2, y0 + t, p, boxH - 2 * t));
    add("div2", R(x0 + (fw * 2) / 3 - p / 2, y0 + t, p, boxH - 2 * t));
    add("legL", R(x0 + 60 * s, fl - legH, lw, legH));
    add("legR", R(x0 + fw - 60 * s - lw, fl - legH, lw, legH));
    if (both) {
      add("sBox", R(sx, y0, fd, boxH));
      add("sLeg", R(sx + 60 * s, fl - legH, lw, legH));
    }
  }

  if (!both) return { parts, dims: null, labels: [] };
  const dy = fl + 24;
  return {
    parts,
    dims: {
      w: { x1: x0, y1: dy, x2: x0 + fw, y2: dy, tx: x0 + fw / 2, ty: dy + 15, value: w, vertical: false },
      d: { x1: sx, y1: dy, x2: sx + fd, y2: dy, tx: sx + fd / 2, ty: dy + 15, value: d, vertical: false },
      h: { x1: x0 - 22, y1: y0, x2: x0 - 22, y2: fl, tx: x0 - 30, ty: (y0 + fl) / 2 + 4, value: h, vertical: true },
    },
    labels: [
      { x: x0 + fw / 2, y: b.H - 10, text: "정면도" },
      { x: sx + fd / 2, y: b.H - 10, text: "측면도" },
    ],
  };
}

/* ── 도면판 ───────────────────────────────────────────── */

function DrawingBoard({ kind, dims, wood, finish, reduce, svgRef }: { kind: Kind; dims: Dims; wood: Wood; finish: FinishId; reduce: boolean; svgRef: React.RefObject<SVGSVGElement | null> }) {
  const geo = useMemo(() => geometry(kind.id, dims, BOARD, true), [kind.id, dims]);
  // 선 그리기가 끝난 가구. 끝난 뒤 생기는 선(책장 선반이 늘 때)은 시차 없이 바로 그린다.
  const [drawnKind, setDrawnKind] = useState<KindId | null>(null);
  useEffect(() => {
    const id = window.setTimeout(() => setDrawnKind(kind.id), DRAW_MS + 100);
    return () => window.clearTimeout(id);
  }, [kind.id]);
  const drawn = reduce || drawnKind === kind.id;

  const n = geo.parts.length;
  const stagger = n > 1 ? (DRAW_MS - LINE_MS) / (n - 1) / 1000 : 0;
  const morph = { duration: MORPH_MS / 1000, ease: EASE };
  const afterDraw = drawn ? 0 : DRAW_MS / 1000;
  const finishName = FINISHES.find((f) => f.id === finish)?.name ?? "";

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${BOARD.W} ${BOARD.H}`}
      role="img"
      aria-label={`${kind.name} 도면. 폭 ${dims.w}, 깊이 ${dims.d}, 높이 ${dims.h} mm, ${wood.name} ${finishName} 마감`}
      className="block h-auto w-full"
      style={{ background: C.sheet }}
    >
      <defs>
        <pattern id="fw-grid" width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M12 0H0V12" fill="none" stroke={C.grid} strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width={BOARD.W} height={BOARD.H} fill={C.sheet} />
      <rect width={BOARD.W} height={BOARD.H} fill="url(#fw-grid)" />
      <rect x="0.5" y="0.5" width={BOARD.W - 1} height={BOARD.H - 1} fill="none" stroke={C.ink} strokeWidth="1" />

      {/* 표제란 */}
      <text x="12" y="18" fontSize="11" fontWeight="700" fill={C.ink}>
        {BRAND}
      </text>
      <text x="12" y="30" fontSize="9" fill={C.soft}>
        {kind.name} {dims.w} x {dims.d} x {dims.h}
      </text>
      <text x={BOARD.W - 12} y="18" fontSize="9" textAnchor="end" fill={C.soft}>
        단위 mm
      </text>
      <text x={BOARD.W - 12} y="30" fontSize="9" textAnchor="end" fill={C.soft}>
        {wood.name} {finishName} 마감
      </text>

      {/* 가구가 바뀌면 통째로 다시 그린다 */}
      <g key={kind.id}>
        {geo.parts
          .filter((p) => p.face)
          .map((p) => (
            <motion.path
              key={p.id}
              d={p.d}
              initial={reduce ? false : { d: p.d, opacity: 0 }}
              animate={{ d: p.d, fill: wood.color, opacity: 1 }}
              transition={{ d: morph, fill: { duration: FILL_MS / 1000 }, opacity: { duration: 0.4, delay: afterDraw } }}
              fillOpacity={0.55}
              stroke="none"
            />
          ))}
        {geo.parts.map((p, i) => (
          <motion.path
            key={p.id}
            d={p.d}
            initial={reduce ? false : { d: p.d, pathLength: 0 }}
            animate={{ d: p.d, pathLength: 1 }}
            transition={drawn ? { d: morph, pathLength: { duration: 0.3, ease: EASE } } : { d: morph, pathLength: { duration: LINE_MS / 1000, delay: i * stagger, ease: EASE } }}
            fill="none"
            stroke={C.ink}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        ))}
        {geo.dims && (
          <>
            <DimLine spec={geo.dims.w} delay={afterDraw} reduce={reduce} />
            <DimLine spec={geo.dims.d} delay={afterDraw + 0.1} reduce={reduce} />
            <DimLine spec={geo.dims.h} delay={afterDraw + 0.2} reduce={reduce} />
          </>
        )}
        {geo.labels.map((l) => (
          <motion.text
            key={l.text}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ x: l.x, y: l.y, opacity: 1 }}
            transition={{ opacity: { duration: 0.3, delay: afterDraw + 0.3 }, default: morph }}
            fontSize="10"
            textAnchor="middle"
            fill={C.soft}
          >
            {l.text}
          </motion.text>
        ))}
      </g>
    </svg>
  );
}

/** 치수선. 가운데에서 양쪽 끝으로 늘어나고, 끝에 짧은 빗금, 가운데에 숫자. 치수가 바뀌면 좌표가 따라 움직인다. */
function DimLine({ spec, delay, reduce }: { spec: DimLineSpec; delay: number; reduce: boolean }) {
  const mx = (spec.x1 + spec.x2) / 2;
  const my = (spec.y1 + spec.y2) / 2;
  const grow = { duration: DIM_MS / 1000, delay, ease: EASE };
  const morph = { duration: MORPH_MS / 1000, ease: EASE };
  const tick = (x: number, y: number) => `M${fx(x - 4)},${fx(y + 4)} L${fx(x + 4)},${fx(y - 4)}`;
  const half = (x: number, y: number) => `M${fx(mx)},${fx(my)} L${fx(x)},${fx(y)}`;
  const line = { fill: "none", stroke: C.ink, strokeWidth: 1 };
  return (
    <g>
      <motion.path d={half(spec.x1, spec.y1)} initial={reduce ? false : { d: half(spec.x1, spec.y1), pathLength: 0 }} animate={{ d: half(spec.x1, spec.y1), pathLength: 1 }} transition={{ d: morph, pathLength: grow }} {...line} />
      <motion.path d={half(spec.x2, spec.y2)} initial={reduce ? false : { d: half(spec.x2, spec.y2), pathLength: 0 }} animate={{ d: half(spec.x2, spec.y2), pathLength: 1 }} transition={{ d: morph, pathLength: grow }} {...line} />
      <motion.path d={tick(spec.x1, spec.y1)} initial={reduce ? false : { d: tick(spec.x1, spec.y1), opacity: 0 }} animate={{ d: tick(spec.x1, spec.y1), opacity: 1 }} transition={{ d: morph, opacity: { duration: 0.2, delay: delay + DIM_MS / 1000 } }} {...line} />
      <motion.path d={tick(spec.x2, spec.y2)} initial={reduce ? false : { d: tick(spec.x2, spec.y2), opacity: 0 }} animate={{ d: tick(spec.x2, spec.y2), opacity: 1 }} transition={{ d: morph, opacity: { duration: 0.2, delay: delay + DIM_MS / 1000 } }} {...line} />
      <motion.text
        initial={reduce ? false : { opacity: 0 }}
        animate={{ x: spec.tx, y: spec.ty, opacity: 1 }}
        transition={{ opacity: { duration: 0.25, delay: delay + 0.2 }, default: morph }}
        fontSize="13"
        fontWeight="700"
        textAnchor={spec.vertical ? "end" : "middle"}
        fill={C.ink}
      >
        {spec.value}
      </motion.text>
    </g>
  );
}

/** 가구 종류 버튼의 작은 정면도 */
function KindIcon({ kind, selected }: { kind: Kind; selected: boolean }) {
  const geo = useMemo(() => geometry(kind.id, { w: kind.w.def, d: kind.d.def, h: kind.h.def }, ICON_BOARD, false), [kind]);
  return (
    <svg viewBox={`0 0 ${ICON_BOARD.W} ${ICON_BOARD.H}`} width="48" height="36" aria-hidden className="flex-none">
      {geo.parts.map((p) => (
        <path key={p.id} d={p.d} fill={selected ? C.accent : "none"} fillOpacity={0.15} stroke={selected ? C.accent : C.ink} strokeWidth="1.2" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/** 도면 SVG를 캔버스에 그려 PNG로 내려받는다. 그리기 도중의 dasharray는 지우고 완성 상태로 저장한다. */
async function savePng(svg: SVGSVGElement, filename: string) {
  const W = 1440;
  const H = 900;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(W));
  clone.setAttribute("height", String(H));
  clone.style.fontFamily = "Pretendard, 'Apple SD Gothic Neo', sans-serif";
  clone.querySelectorAll<SVGElement>("path, text").forEach((el) => {
    el.removeAttribute("stroke-dasharray");
    el.removeAttribute("stroke-dashoffset");
    el.removeAttribute("pathLength");
    el.removeAttribute("opacity");
    el.style.opacity = "";
  });
  const xml = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("svg load"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = C.sheet;
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    const a = document.createElement("a");
    a.download = filename;
    a.href = canvas.toDataURL("image/png");
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
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

const GNB: { label: string; kind?: KindId; id: string }[] = [
  { label: "테이블", kind: "table", id: "fw-drawing" },
  { label: "수납", kind: "shelf", id: "fw-drawing" },
  { label: "의자", kind: "bench", id: "fw-drawing" },
  { label: "주문제작", id: "fw-size" },
  { label: "공방", id: "fw-about" },
];

function Poster({ reduce, go, onKind, onPiece }: { reduce: boolean; go: (id: string) => void; onKind: (k: KindId) => void; onPiece: (kind: KindId, wood: WoodId, dims: Dims) => void }) {
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
    if (g.kind) onKind(g.kind);
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
            <li key={p.kind} id={`fw-p-${p.kind}`} className="min-w-0">
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
                  onClick={() => onPiece(p.kind, woods[p.kind], p.dims)}
                  className={`ml-auto inline-flex h-11 items-center rounded-[4px] px-1 text-[15px] font-semibold underline underline-offset-4 ${focusRing}`}
                  style={{ color: C.ink, outlineColor: C.accent }}
                >
                  치수 바꾸기
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

export function FurnitureWorkshopDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const svgRef = useRef<SVGSVGElement>(null);

  const [kind, setKind] = useState<Kind>(KINDS[0]);
  const [dims, setDims] = useState<Dims>({ w: KINDS[0].w.def, d: KINDS[0].d.def, h: KINDS[0].h.def });
  const [wood, setWood] = useState<Wood>(WOODS[0]);
  const [finish, setFinish] = useState<FinishId>("oil");
  const [receipt, setReceipt] = useState<{ no: number; name: string; phone: string } | null>(null);

  const q = useMemo(() => quote(kind, dims, wood, finish), [kind, dims, wood, finish]);
  const from = daysAgo(today, -28);
  const to = daysAgo(today, -42);

  const pickKind = (k: Kind) => {
    setKind(k);
    setDims({ w: k.w.def, d: k.d.def, h: k.h.def });
  };

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
        onKind={(id) => pickKind(KINDS.find((k) => k.id === id)!)}
        onPiece={(id, w, d) => {
          setKind(KINDS.find((k) => k.id === id)!);
          setDims(d);
          setWood(WOODS.find((x) => x.id === w)!);
          setFinish("oil");
          go("fw-drawing");
        }}
      />

      {/* 첫 화면: 도면판과 치수, 오른쪽에 목재와 견적 */}
      <main className="mx-auto grid max-w-[1200px] gap-8 px-4 pb-16 pt-2 md:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10 lg:pt-6">
        <div className="min-w-0">
          <h2 className="text-[28px] font-bold leading-[1.2] md:text-[34px]">
            원목 가구 주문 제작
          </h2>
          <p className="mt-2 text-[16px] leading-[1.6]" style={{ color: C.soft }}>
            치수를 mm로 넣으면 도면과 견적이 바로 나와요. 한 번에 두세 점만 받습니다.
          </p>

          <div id="fw-drawing" className="mt-5 scroll-mt-4 rounded-[4px] border" style={{ borderColor: C.line }}>
            <DrawingBoard kind={kind} dims={dims} wood={wood} finish={finish} reduce={reduce} svgRef={svgRef} />
          </div>

          {/* 1. 가구 종류 */}
          <section id="fw-kind" aria-labelledby="fw-kind-title" className="mt-8 scroll-mt-4">
            <h2 id="fw-kind-title" className="text-[20px] font-bold">
              제작 가구
            </h2>
            <div role="radiogroup" aria-labelledby="fw-kind-title" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {KINDS.map((k) => {
                const on = k.id === kind.id;
                return (
                  <button
                    key={k.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => pickKind(k)}
                    className={`flex items-center gap-3 rounded-[4px] border px-3 py-2.5 text-left text-[15px] ${on ? "font-bold" : ""} ${focusRing}`}
                    style={{ borderColor: on ? C.accent : C.line, background: on ? C.sheet : "transparent", boxShadow: on ? `inset 0 0 0 1px ${C.accent}` : "none", outlineColor: C.accent }}
                  >
                    <KindIcon kind={k} selected={on} />
                    <span>
                      {k.name}
                      <span className="block text-[12px] font-normal" style={{ color: C.soft }}>
                        {k.w.min}~{k.w.max}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. 치수 */}
          <section id="fw-size" aria-labelledby="fw-size-title" className="mt-8 scroll-mt-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="fw-size-title" className="text-[20px] font-bold">
                주문 제작 치수
              </h2>
              <button type="button" onClick={() => pickKind(kind)} className={`rounded-[3px] text-[14px] underline underline-offset-4 ${focusRing}`} style={{ color: C.soft, outlineColor: C.accent }}>
                기본 치수로
              </button>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <SizeSlider id="fw-w" label="폭" range={kind.w} value={dims.w} onChange={(v) => setDims((s) => ({ ...s, w: v }))} />
              <SizeSlider id="fw-d" label="깊이" range={kind.d} value={dims.d} onChange={(v) => setDims((s) => ({ ...s, d: v }))} />
              <SizeSlider id="fw-h" label="높이" range={kind.h} value={dims.h} onChange={(v) => setDims((s) => ({ ...s, h: v }))} />
            </div>
            <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: C.soft }}>
              범위 밖 치수와 둥근 상판, 서랍은 문의 때 적어 주세요.
            </p>
          </section>
        </div>

        {/* 오른쪽: 목재, 마감, 견적, 문의 */}
        <aside className="min-w-0 lg:sticky lg:top-6">
          <section id="fw-wood" aria-labelledby="fw-wood-title" className="scroll-mt-4 rounded-[4px] border p-4 md:p-5" style={{ borderColor: C.line, background: C.sheet }}>
            <h2 id="fw-wood-title" className="text-[18px] font-bold">
              목재
            </h2>
            <div role="radiogroup" aria-labelledby="fw-wood-title" className="mt-3 grid grid-cols-4 gap-2">
              {WOODS.map((w) => {
                const on = w.id === wood.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setWood(w)}
                    className={`rounded-[4px] border p-1.5 text-center text-[13px] ${on ? "font-bold" : ""} ${focusRing}`}
                    style={{ borderColor: on ? C.accent : C.line, boxShadow: on ? `inset 0 0 0 1px ${C.accent}` : "none", outlineColor: C.accent }}
                  >
                    <WoodSwatch color={w.color} className="h-10 w-full rounded-[2px]" />
                    <span className="mt-1.5 block leading-none">{w.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: C.soft }}>
              {wood.desc}
            </p>

            <h3 className="mt-4 text-[15px] font-bold">마감</h3>
            <div role="radiogroup" aria-label="마감" className="mt-2 grid grid-cols-2 gap-2">
              {FINISHES.map((f) => {
                const on = f.id === finish;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setFinish(f.id)}
                    className={`flex items-center justify-between gap-2 rounded-[4px] border px-3 py-2 text-left text-[15px] ${on ? "font-bold" : ""} ${focusRing}`}
                    style={{ borderColor: on ? C.accent : C.line, boxShadow: on ? `inset 0 0 0 1px ${C.accent}` : "none", outlineColor: C.accent }}
                  >
                    <span>{f.name}</span>
                    <span className="text-[13px] tabular-nums" style={{ color: C.soft }}>
                      {f.add ? `+${won(f.add)}` : "기본"}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: C.soft }}>
              {FINISHES.find((f) => f.id === finish)?.desc}
            </p>
          </section>

          <section id="fw-quote" aria-labelledby="fw-quote-title" className="mt-4 scroll-mt-4 rounded-[4px] border p-4 md:p-5" style={{ borderColor: C.line, background: C.sheet }}>
            <h2 id="fw-quote-title" className="text-[18px] font-bold">
              견적
            </h2>
            <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-[15px]">
              <dt style={{ color: C.soft }}>
                {kind.name} {dims.w} x {dims.d} x {dims.h}
              </dt>
              <dd className="text-right tabular-nums">{q.area.toFixed(2)} m2</dd>
              <dt style={{ color: C.soft }}>목재비 {wood.name}</dt>
              <dd className="text-right tabular-nums">{won(q.material)}</dd>
              <dt style={{ color: C.soft }}>제작비</dt>
              <dd className="text-right tabular-nums">{won(q.labor)}</dd>
              <dt style={{ color: C.soft }}>마감 {FINISHES.find((f) => f.id === finish)?.name}</dt>
              <dd className="text-right tabular-nums">{q.finish ? won(q.finish) : "포함"}</dd>
            </dl>
            <div className="mt-3 flex items-baseline justify-between gap-3 border-t pt-3" style={{ borderColor: C.line }}>
              <span className="text-[15px] font-bold">합계</span>
              <output aria-live="polite" className="text-[26px] font-bold tabular-nums" style={{ color: C.ink }}>
                {won(q.total)}
              </output>
            </div>
            <p className="mt-1 text-[13px]" style={{ color: C.soft }}>
              부가세 포함, 서울 배송 포함. 상담 후 확정.
            </p>
            <p className="mt-3 flex items-start gap-2 text-[15px] leading-[1.5]">
              <Clock size={18} aria-hidden className="mt-0.5 flex-none" />
              <span>
                제작 기간 4~6주
                <span className="block text-[14px]" style={{ color: C.soft }}>
                  {fmtKo(from)} ~ {fmtKo(to)} 완성
                </span>
              </span>
            </p>

            <AnimatePresence mode="wait" initial={false}>
              {receipt ? (
                <motion.div key="done" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: EASE }}>
                  <Receipt receipt={receipt} today={today} kind={kind} dims={dims} wood={wood} finish={finish} total={q.total} svgRef={svgRef} onReset={() => setReceipt(null)} />
                </motion.div>
              ) : (
                <motion.div key="form" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: EASE }}>
                  <InquiryForm today={today} spec={`${kind.name} ${dims.w}x${dims.d}x${dims.h} ${wood.name}`} onDone={(r) => setReceipt(r)} />
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
          네 가지만 씁니다. 전부 건조가 끝난 판재예요. 누르면 위 도면에 바로 입혀 봐요.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WOODS.map((w) => {
            const on = w.id === wood.id;
            return (
              <button
                key={w.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setWood(w);
                  go("fw-drawing");
                }}
                className={`rounded-[4px] border text-left ${focusRing}`}
                style={{ borderColor: on ? C.accent : C.line, background: C.sheet, boxShadow: on ? `inset 0 0 0 1px ${C.accent}` : "none", outlineColor: C.accent }}
              >
                <WoodSwatch color={w.color} className="h-28 w-full rounded-t-[3px]" />
                <div className="p-4">
                  <p className="flex items-baseline justify-between gap-2">
                    <b className="text-[18px]">
                      {w.name}
                    </b>
                    <span className="text-[13px]" style={{ color: C.soft }}>
                      {w.hardness}
                    </span>
                  </p>
                  <p className="mt-1.5 text-[15px] leading-[1.6]">{w.desc}</p>
                  <p className="mt-2 text-[14px] tabular-nums" style={{ color: C.soft }}>
                    30T 판재 m2당 {won(w.rate)}
                  </p>
                  {on && (
                    <p className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold">
                      <Check size={14} aria-hidden /> 도면에 적용 중
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. 작업 과정 */}
      <section id="fw-process" aria-labelledby="fw-process-title" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pt-12 md:px-6 md:pt-16">
        <h2 id="fw-process-title" className="text-[24px] font-bold md:text-[28px]">
          작업 과정
        </h2>
        <ProcessLine reduce={reduce} />
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
        <p>{ADDRESS}</p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

/* ── 조각 ─────────────────────────────────────────────── */

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

function SizeSlider({ id, label, range, value, onChange }: { id: string; label: string; range: Range; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between text-[15px]">
        <span className="font-bold">{label}</span>
        <output htmlFor={id} className="text-[17px] font-bold tabular-nums">
          {value} <span className="text-[13px] font-normal">mm</span>
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={range.min}
        max={range.max}
        step={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-1 h-7 w-full cursor-pointer rounded-[3px] ${focusRing}`}
        style={{ accentColor: C.accent, outlineColor: C.accent }}
      />
      <p className="flex justify-between text-[12px] tabular-nums" style={{ color: C.soft }}>
        <span>{range.min}</span>
        <span>{range.max}</span>
      </p>
    </div>
  );
}

/* ── 4. 제작 문의 ──────────────────────────────────────── */

type Lead = { no: number; name: string; phone: string };

function InquiryForm({ today, spec, onDone }: { today: Date; spec: string; onDone: (r: Lead) => void }) {
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
    onDone({ no: 100 + ((today.getDate() * 7 + today.getMonth()) % 80), name: name.trim(), phone });
  };

  const field = `mt-1 w-full rounded-[4px] border bg-white px-3 py-2.5 text-[16px] ${focusRing}`;

  return (
    <form onSubmit={submit} noValidate className="mt-5 border-t pt-4" style={{ borderColor: C.line }}>
      <h3 className="text-[16px] font-bold">제작 문의</h3>
      <p className="mt-2 flex items-center gap-1.5 rounded-[4px] px-3 py-2 text-[14px]" style={{ background: C.paper }}>
        <Paperclip size={15} aria-hidden className="flex-none" />
        <span className="min-w-0 truncate">도면 PNG 자동 첨부: {spec}</span>
      </p>
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
        도면과 함께 문의 보내기
      </button>
    </form>
  );
}

function Receipt({ receipt, today, kind, dims, wood, finish, total, svgRef, onReset }: { receipt: Lead; today: Date; kind: Kind; dims: Dims; wood: Wood; finish: FinishId; total: number; svgRef: React.RefObject<SVGSVGElement | null>; onReset: () => void }) {
  const [saving, setSaving] = useState<"idle" | "busy" | "done" | "fail">("idle");
  const no = `FW-${today.getFullYear()}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${receipt.no}`;
  const reply = daysAgo(today, -2);
  const finishName = FINISHES.find((f) => f.id === finish)?.name ?? "";

  const save = async () => {
    const svg = svgRef.current;
    if (!svg) return;
    setSaving("busy");
    try {
      await savePng(svg, `${BRAND}-도면-${kind.name}-${dims.w}x${dims.d}x${dims.h}.png`);
      setSaving("done");
    } catch {
      setSaving("fail");
    }
  };

  return (
    <div className="mt-5 border-t pt-4" style={{ borderColor: C.line }} aria-live="polite">
      <h3 className="flex items-center gap-2 text-[16px] font-bold">
        <Check size={18} aria-hidden /> 문의 접수
      </h3>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
        <dt style={{ color: C.soft }}>접수번호</dt>
        <dd className="font-bold tabular-nums">
          {no}
        </dd>
        <dt style={{ color: C.soft }}>이름</dt>
        <dd>{maskName(receipt.name)}</dd>
        <dt style={{ color: C.soft }}>휴대폰</dt>
        <dd className="tabular-nums">{maskPhone(receipt.phone)}</dd>
        <dt style={{ color: C.soft }}>내용</dt>
        <dd>
          {kind.name} {dims.w} x {dims.d} x {dims.h}, {wood.name} {finishName} 마감, {won(total)}
        </dd>
        <dt style={{ color: C.soft }}>회신 예정</dt>
        <dd className="font-bold">{fmtKo(reply)}까지</dd>
        <dt style={{ color: C.soft }}>담당 창구</dt>
        <dd>
          {KAKAO}
          <span className="block text-[14px]" style={{ color: C.soft }}>
            <Phone size={13} aria-hidden className="mr-1 inline" />
            전화 상담은 운영시간 10:00~18:00
          </span>
        </dd>
      </dl>
      <button type="button" onClick={save} disabled={saving === "busy"} data-gtm-cta={`${SLUG}_png`} className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[6px] border py-2.5 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.accent, color: C.accent, background: C.sheet, outlineColor: C.accent }}>
        <Download size={17} aria-hidden />
        {saving === "busy" ? "만드는 중" : saving === "done" ? "도면 PNG 저장됨" : saving === "fail" ? "저장 실패, 다시 시도" : "도면 PNG 저장"}
      </button>
      <button type="button" onClick={onReset} className={`mt-2 w-full rounded-[3px] py-1.5 text-[14px] underline underline-offset-4 ${focusRing}`} style={{ color: C.soft, outlineColor: C.accent }}>
        다른 가구로 다시 문의
      </button>
    </div>
  );
}

/* ── 5. 작업 과정 ──────────────────────────────────────── */

const STEPS = [
  { name: "재단", days: "2~3일", desc: "도면대로 판재를 자르고 폭을 맞춰요. 결 방향을 보고 어느 판을 어디에 쓸지 짝을 정해요." },
  { name: "조립", days: "3~4일", desc: "짜맞춤과 목심으로 붙여요. 접착한 뒤 하루 동안 눌러 두고, 다음 날 직각을 다시 봐요." },
  { name: "샌딩", days: "2일", desc: "120방부터 320방까지 네 번 갈아요. 모서리는 손으로 둥글려 손에 걸리는 곳이 없게 해요." },
  { name: "마감", days: "1주", desc: "오일은 세 번 바르고 사이마다 하루 말려요. 바니시는 두 번. 다 마른 뒤 사진을 보내 드려요." },
];

function ProcessLine({ reduce }: { reduce: boolean }) {
  const [active, setActive] = useState(0);
  const step = STEPS[active];
  return (
    <div className="mt-6">
      <div className="relative">
        <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-[14px] h-px" style={{ background: C.line }} />
        <div role="tablist" aria-label="작업 단계" className="relative grid grid-cols-4">
          {STEPS.map((s, i) => {
            const on = i === active;
            return (
              <button
                key={s.name}
                type="button"
                role="tab"
                id={`fw-step-${i}`}
                aria-selected={on}
                aria-controls="fw-step-panel"
                onClick={() => setActive(i)}
                className={`group flex flex-col items-center gap-2 rounded-[4px] py-0.5 text-[15px] ${on ? "font-bold" : ""} ${focusRing}`}
                style={{ outlineColor: C.accent }}
              >
                <span aria-hidden className="block h-[28px] w-[28px] rounded-full border" style={{ borderColor: on ? C.accent : "#cfcfcf", background: on ? C.accent : C.sheet }} />
                <span className="leading-none">{s.name}</span>
                <span className="text-[12px] leading-none tabular-nums" style={{ color: C.soft }}>
                  {s.days}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div id="fw-step-panel" role="tabpanel" aria-labelledby={`fw-step-${active}`} className="mt-5 rounded-[4px] border p-4 md:p-5" style={{ borderColor: C.line, background: C.sheet }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={active} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="text-[16px] leading-[1.7]">
            <b>{step.name}</b> {step.desc}
          </motion.p>
        </AnimatePresence>
      </div>
      <p className="mt-3 text-[15px] leading-[1.6]" style={{ color: C.soft }}>
        목재 수급과 건조 대기까지 합쳐 4~6주예요. 작업 중 사진은 단계마다 한 번 보내 드려요.
      </p>
    </div>
  );
}

/** 오시는 길 약도. 큰길, 골목, 역, 공방 자리만 그린다. */
function MapSketch() {
  return (
    <svg viewBox="0 0 480 220" role="img" aria-label="약도: ㅇㅇ역 3번 출구에서 큰길을 따라 걷다 두 번째 골목 안쪽에 공방" className="block h-auto w-full">
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
      <rect x="360" y="66" width="80" height="48" rx="2" fill={C.sheet} stroke={C.ink} strokeWidth="2" />
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
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className={small ? "h-6 w-6 shrink-0" : "h-7 w-7 shrink-0"} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold leading-none tracking-[-0.03em]`}>곰파트너</span>
        <span className="text-[12px] font-semibold leading-none opacity-75">가구 공방 샘플</span>
      </span>
    </span>
  );
}
