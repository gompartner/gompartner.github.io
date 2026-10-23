"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { CalendarCheck, Car, Check, CircleAlert, Clock, Download, MapPin, Paperclip, RotateCcw } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 네일샵 홈페이지 샘플: 가상의 곰파트너 네일샵. 젤네일, 패디, 케어, 아트.
   상호, 주소, 직원 이름은 모두 가상이다.
   첫 화면 사진과 칠해 보기 손 사진은 AI 생성(Z-Image-Turbo)

   국내 네일샵 홈페이지와 네이버 예약의 공통 구성을 따랐다.
   메뉴는 디자인 둘러보기, 시술 메뉴와 가격, 예약하기, 오시는 길 네 개.
   첫 화면에는 디자인 사진과 가격표, 예약 버튼이 같이 있고, 시술 메뉴는 젤 제거, 케어, 원컬러, 아트(손톱당), 패디로 나뉜다.
   예약은 날짜, 시간, 담당 디자이너를 고르고 이름과 휴대폰을 남긴다. 변경과 취소는 하루 전까지가 관용 문구다.

   핵심 모션
   - 첫 화면(ns-poster): 젤네일 손 사진 한 장이 화면을 채운다. 들어올 때 사진이 1.06배에서 1.6초 동안 천천히 다가오고,
     문장과 정보 줄은 0.3초 늦게 12px 아래에서 올라온다(CSS 키프레임, 끝 상태가 기본값). 스크롤하면 사진만 8% 느리게 움직인다.
   - 컬러칩을 누르면 칩이 손톱 자리까지 날아가 붙고(layoutId) 손톱 색이 320ms 동안 그 색으로 바뀐다.
     선택 테두리 링도 layoutId 로 칩 사이를 옮겨 다닌다. 아트는 손톱 위 패턴 레이어가 교차 전환한다.
   동작 줄이기가 켜져 있으면 첫 화면은 멈춘 사진, 나머지는 전부 즉시 바뀐다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 컬러칩과 손톱 색 입히기: 전체 또는 손톱 하나씩. 되돌리기.
   2. 아트와 시술 메뉴: 베이스(젤 원컬러, 젤 그라데이션)와 아트 개수로 시술 시간과 금액 합산. 케어, 젤 제거 포함 여부.
   3. 디자인 저장: 손 그림을 PNG 로 내려받고 예약에 첨부된 것으로 표시.
   4. 예약: 날짜(오늘부터 7일), 시간, 담당, 이름, 휴대폰. 접수 완료 화면.
   5. 샵 안내와 오시는 길: 영업시간(오늘 요일 진하게), 주차, 예약제. */

const IMG = "/images/demo-nail-shop";

const BRAND = "곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";
const KAKAO = "카카오톡 채널 곰파트너";

/** 320ms, 부드럽게 멈추는 곡선 */
const DUR = 0.32;
const EASE = [0.22, 1, 0.36, 1] as const;

/** plum 은 글자색(먹색), accent 는 버튼과 선택 표시에만 쓰는 차분한 로즈 */
const C = {
  bg: "#f7f7f5",
  paper: "#ffffff",
  plum: "#111111",
  plumSoft: "#767676",
  accent: "#9a5b6a",
  rose: "#c98d9b",
  roseSoft: "#f4eef0",
  line: "#e5e5e5",
  skin: "#f1ddd0",
  skinLine: "#d6bcab",
  error: "#b42318",
};
const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/* 색과 메뉴 */

const CHIPS: { name: string; hex: string }[] = [
  { name: "밀크", hex: "#f6eee8" },
  { name: "베이비핑크", hex: "#f7c9d4" },
  { name: "피치", hex: "#f7c59f" },
  { name: "살몬", hex: "#f4a58a" },
  { name: "코랄", hex: "#f08a7e" },
  { name: "버터", hex: "#f3e2a2" },
  { name: "머스타드", hex: "#d9a441" },
  { name: "세이지", hex: "#a8b8a0" },
  { name: "올리브", hex: "#8a9a5b" },
  { name: "민트", hex: "#9fd8cb" },
  { name: "스카이", hex: "#9cc7e6" },
  { name: "네이비", hex: "#2f3f6b" },
  { name: "라벤더", hex: "#c3b1e1" },
  { name: "라일락", hex: "#b78ccf" },
  { name: "플럼", hex: "#6b2d5c" },
  { name: "버건디", hex: "#7a1f2e" },
  { name: "체리", hex: "#c0243a" },
  { name: "레드", hex: "#d7392f" },
  { name: "브릭", hex: "#a8503a" },
  { name: "카멜", hex: "#b98b5e" },
  { name: "모카", hex: "#7b5a44" },
  { name: "토프", hex: "#a89a8c" },
  { name: "그레이", hex: "#8d8d93" },
  { name: "블랙", hex: "#1f1d21" },
];

type ArtId = "none" | "french" | "grad" | "glitter" | "check" | "magnet";
const ARTS: { id: ArtId; label: string; price: number }[] = [
  { id: "none", label: "없음", price: 0 },
  { id: "french", label: "프렌치", price: 3000 },
  { id: "grad", label: "그라데이션", price: 4000 },
  { id: "glitter", label: "글리터", price: 4000 },
  { id: "check", label: "체크", price: 6000 },
  { id: "magnet", label: "마그네틱", price: 8000 },
];

type BaseId = "one" | "grad";
const BASES: { id: BaseId; label: string; price: number; min: number }[] = [
  { id: "one", label: "젤 원컬러", price: 40000, min: 60 },
  { id: "grad", label: "젤 그라데이션", price: 50000, min: 75 },
];
const CARE = { price: 15000, min: 20 };
const REMOVE = { price: 10000, min: 15 };

const MENU: { group: string; rows: [string, string][] }[] = [
  { group: "손", rows: [["젤 제거", "10,000원"], ["손 케어", "15,000원"], ["젤 원컬러", "40,000원"], ["젤 그라데이션", "50,000원"], ["아트 (손톱당)", "3,000원~8,000원"]] },
  { group: "패디", rows: [["패디 케어", "25,000원"], ["패디 젤 원컬러", "50,000원"], ["패디 아트 (발톱당)", "3,000원~8,000원"]] },
];

const STAFF = [
  { role: "원장", name: "박ㅅ연" },
  { role: "디자이너", name: "이ㅈ아" },
  { role: "디자이너", name: "최ㅁ지" },
];

/** 요일별 영업시간. 월요일은 정기 휴무. [열림, 마지막 시작 시간+1] */
const HOURS: ([number, number] | null)[] = [[11, 19], null, [10, 20], [10, 20], [10, 20], [10, 20], [10, 20]];
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/** 날짜, 시간, 담당별로 이미 찬 자리. 실제로는 예약 장부에서 읽는다. */
function booked(dayIdx: number, hour: number, staff: number) {
  let h = (dayIdx + 5) * 2654435761 + (hour + 3) * 40503 + (staff + 1) * 9176;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 100;
  const busy = hour >= 17 ? 22 : hour >= 13 ? 10 : 0;
  return h < 28 + busy;
}

/* 손 모양 */

const VB = { w: 340, h: 420 };
/** 손 사진(hand.jpg, 520x642를 viewBox 340x420에 맞춤) 위 손톱 자리. cx와 top은 손톱 가운데 위쪽 끝, rot은 손톱 가운데를 기준으로 돌린 각도 */
type Finger = { name: string; cx: number; top: number; w: number; h: number; rot: number; pivot: [number, number] };
const FINGERS: Finger[] = [
  { name: "엄지", cx: 44.5, top: 201.4, w: 19.6, h: 28.8, rot: -28, pivot: [44.5, 215.8] },
  { name: "검지", cx: 132.4, top: 49.7, w: 22.9, h: 32, rot: 0, pivot: [0, 0] },
  { name: "중지", cx: 190.3, top: 31.4, w: 27.5, h: 34, rot: 0, pivot: [0, 0] },
  { name: "약지", cx: 234.1, top: 62.1, w: 24.2, h: 32.7, rot: 0, pivot: [0, 0] },
  { name: "소지", cx: 289.6, top: 127.5, w: 18.3, h: 26.2, rot: 3, pivot: [289.6, 140.6] },
];

function nailGeo(f: Finger) {
  return { cx: f.cx, w: f.w, h: f.h, top: f.top };
}

/** 위는 반원(손톱 끝), 아래는 완만한 호(큐티클 선) */
function nailPath(cx: number, top: number, w: number, h: number) {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const b = top + h;
  const rt = w / 2;
  const rb = w * 0.32;
  return `M${l} ${top + rt} A${rt} ${rt} 0 0 1 ${r} ${top + rt} L${r} ${b - rb} A${rt} ${rb} 0 0 1 ${l} ${b - rb} Z`;
}

/** 점 (px, py)를 (cx, cy) 기준으로 deg 만큼 돌린다 */
function rot(px: number, py: number, cx: number, cy: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  const dx = px - cx;
  const dy = py - cy;
  return { x: cx + dx * Math.cos(a) - dy * Math.sin(a), y: cy + dx * Math.sin(a) + dy * Math.cos(a) };
}

/** 손톱 가운데 점을 화면 비율(%)로. 날아가는 칩이 내려앉는 자리 */
function nailAnchor(i: number) {
  const f = FINGERS[i];
  const g = nailGeo(f);
  const c = rot(g.cx, g.top + g.h / 2, f.pivot[0], f.pivot[1], f.rot);
  // 회전은 빼고 가운데 점 기준 상자만 넘긴다. layoutId 전환은 부모 회전을 모르기 때문이다.
  return { left: ((c.x - g.w / 2) / VB.w) * 100, top: ((c.y - g.h / 2) / VB.h) * 100, w: (g.w / VB.w) * 100, h: (g.h / VB.h) * 100 };
}

type Nail = { color: string; art: ArtId };
/** 처음에는 다섯 손톱 모두 베이비핑크 원컬러 */
const START: Nail[] = Array.from({ length: 5 }, () => ({ color: CHIPS[1].hex, art: "none" }));

type Fly = { key: number; color: string; chip: number; nail: number; phase: "chip" | "nail" };

export function NailShopDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const uid = useId().replace(/:/g, "");

  const [nails, setNails] = useState<Nail[]>(START);
  const [hist, setHist] = useState<Nail[][]>([]);
  const [target, setTarget] = useState<number | null>(null); // null = 전체
  const [chip, setChip] = useState(1);
  const [base, setBase] = useState<BaseId>("one");
  const [care, setCare] = useState(false);
  const [remove, setRemove] = useState(false);
  const [fly, setFly] = useState<Fly | null>(null);
  const [saved, setSaved] = useState<{ url: string; at: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const flyKey = useRef(0);

  const push = useCallback((next: (prev: Nail[]) => Nail[]) => {
    setNails((prev) => {
      setHist((h) => [...h.slice(-29), prev]);
      return next(prev);
    });
  }, []);

  const undo = () => {
    setHist((h) => {
      if (!h.length) return h;
      setNails(h[h.length - 1]);
      return h.slice(0, -1);
    });
  };

  const paint = (ci: number) => {
    const hex = CHIPS[ci].hex;
    setChip(ci);
    push((prev) => prev.map((n, i) => (target === null || target === i ? { ...n, color: hex } : n)));
    if (reduce) return;
    flyKey.current += 1;
    setFly({ key: flyKey.current, color: hex, chip: ci, nail: target ?? 2, phase: "chip" });
  };

  // 칩 자리에 먼저 그린 뒤 다음 프레임에 손톱 자리로 옮긴다. 같은 layoutId 라 날아가는 것처럼 보인다.
  useEffect(() => {
    if (!fly || fly.phase !== "chip") return;
    const a = requestAnimationFrame(() => requestAnimationFrame(() => setFly((f) => (f && f.key === fly.key ? { ...f, phase: "nail" } : f))));
    return () => cancelAnimationFrame(a);
  }, [fly]);

  const setArt = (art: ArtId) => {
    push((prev) => prev.map((n, i) => (target === null || target === i ? { ...n, art } : n)));
  };

  const pickBase = (b: BaseId) => {
    setBase(b);
    if (b === "grad") push((prev) => prev.map((n) => ({ ...n, art: "grad" })));
  };

  const bill = useMemo(() => {
    const b = BASES.find((x) => x.id === base)!;
    let art = 0;
    let artNails = 0;
    nails.forEach((n) => {
      if (n.art === "none") return;
      if (base === "grad" && n.art === "grad") return;
      artNails += 1;
      art += ARTS.find((a) => a.id === n.art)!.price;
    });
    const price = b.price + art * 2 + (care ? CARE.price : 0) + (remove ? REMOVE.price : 0);
    const min = b.min + artNails * 5 * 2 + (care ? CARE.min : 0) + (remove ? REMOVE.min : 0);
    return { price, min, art: art * 2, artNails: artNails * 2, baseLabel: b.label, basePrice: b.price };
  }, [nails, base, care, remove]);

  // 손 그림을 PNG 로. 화면의 SVG 를 복사해 손톱 색을 상태 값으로 고정하고 캔버스에 그린다.
  const savePng = async () => {
    const src = svgRef.current;
    if (!src) return;
    const clone = src.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll("[data-skip-export]").forEach((el) => el.remove());
    clone.querySelectorAll<SVGElement>("[data-nail-base]").forEach((el) => {
      const i = Number(el.getAttribute("data-nail-base"));
      el.setAttribute("fill", nails[i].color);
      el.removeAttribute("style");
    });
    clone.querySelectorAll<SVGElement>("[data-art-layer]").forEach((el) => {
      el.removeAttribute("style");
      el.setAttribute("opacity", "1");
    });
    clone.setAttribute("width", String(VB.w * 2));
    clone.setAttribute("height", String(VB.h * 2));
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const xml = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      const img = await new Promise<HTMLImageElement>((ok, no) => {
        const im = new Image();
        im.onload = () => ok(im);
        im.onerror = () => no(new Error("svg"));
        im.src = url;
      });
      const cv = document.createElement("canvas");
      cv.width = VB.w * 2;
      cv.height = VB.h * 2;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      const hand = await new Promise<HTMLImageElement>((ok, no) => {
        const im = new Image();
        im.onload = () => ok(im);
        im.onerror = () => no(new Error("hand"));
        im.src = `${IMG}/hand.jpg`;
      });
      ctx.drawImage(hand, 0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      ctx.fillStyle = C.plum;
      ctx.font = "bold 22px Pretendard, sans-serif";
      ctx.fillText(`${BRAND}  ${bill.baseLabel}  아트 ${bill.artNails}개`, 24, cv.height - 28);
      const png = cv.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = png;
      a.download = "곰파트너-내-디자인.png";
      a.click();
      const d = new Date();
      setSaved({ url: png, at: `${p2(d.getHours())}:${p2(d.getMinutes())}` });
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const spring = reduce ? { duration: 0 } : { duration: DUR, ease: EASE };
  const targetName = target === null ? "손톱 전체" : `${FINGERS[target].name} 손톱`;
  const anchor = fly ? nailAnchor(fly.nail) : null;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.plum }}>
      <Poster reduce={reduce} onCta={() => go("ns-reserve")} />
      <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-4 md:px-6">
        <a href="#ns-design" onClick={(e) => { e.preventDefault(); go("ns-design"); }} className={`flex items-center gap-2 rounded-[6px] ${focusRing}`} style={{ outlineColor: C.plum }}>
          <SampleLogo />
        </a>
        <nav aria-label="메뉴" className="hidden items-center gap-1 text-[15px] font-bold md:flex">
          {[
            ["ns-design", "디자인 둘러보기"],
            ["ns-menu", "시술 메뉴"],
            ["ns-reserve", "예약하기"],
            ["ns-info", "오시는 길"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={`rounded-[6px] px-3 py-2 hover:underline hover:underline-offset-4 ${focusRing}`} style={{ outlineColor: C.plum }}>
              {label}
            </button>
          ))}
        </nav>
        <button type="button" onClick={() => go("ns-reserve")} data-gtm-cta="nail-shop_go_reserve" className={`flex-none rounded-[6px] px-4 py-2 text-[15px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.plum }}>
          예약하기
        </button>
      </header>

      {/* 첫 화면: 왼쪽 손, 오른쪽 컬러칩과 아트 */}
      <section id="ns-design" aria-labelledby="ns-design-title" className="mx-auto grid max-w-[1200px] gap-8 px-4 pt-4 md:px-6 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:gap-12 lg:pt-8">
        <div>
          <h2 id="ns-design-title" className="font-bold tracking-[-0.02em] text-[30px] leading-[1.2] md:text-[40px]">
            내 손에 먼저 올려 보는 젤네일
          </h2>
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-[15px] font-bold" aria-live="polite">
              {targetName}에 칠해요
            </p>
            <button type="button" onClick={undo} disabled={!hist.length} aria-label="되돌리기" className={`inline-flex h-10 w-10 items-center justify-center rounded-[6px] border disabled:opacity-35 ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.plum }}>
              <RotateCcw size={18} aria-hidden />
            </button>
          </div>

          <div className="relative mx-auto mt-3 w-full max-w-[440px] overflow-hidden rounded-[8px]" style={{ aspectRatio: `${VB.w} / ${VB.h}` }}>
            <HandSvg ref={svgRef} uid={uid} nails={nails} target={target} onPick={(i) => setTarget((t) => (t === i ? null : i))} reduce={reduce} />
            {/* 날아온 칩이 손톱 위에 내려앉는 자리 */}
            <AnimatePresence>
              {fly && fly.phase === "nail" && anchor && (
                <motion.span
                  key={`fly-${fly.key}`}
                  layoutId={`ns-flyer-${uid}`}
                  aria-hidden
                  className="pointer-events-none absolute block"
                  style={{
                    left: `${anchor.left}%`,
                    top: `${anchor.top}%`,
                    width: `${anchor.w}%`,
                    height: `${anchor.h}%`,
                    background: fly.color,
                    borderRadius: "50% 50% 22% 22% / 55% 55% 16% 16%",
                  }}
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.18 } }}
                  transition={spring}
                  onLayoutAnimationComplete={() => setFly((f) => (f && f.key === fly.key ? null : f))}
                />
              )}
            </AnimatePresence>
          </div>

          {/* 손톱 고르기(키보드용 포함) */}
          <div role="group" aria-label="칠할 손톱" className="mt-3 flex flex-wrap justify-center gap-2">
            <NailTab active={target === null} onClick={() => setTarget(null)}>
              전체
            </NailTab>
            {FINGERS.map((f, i) => (
              <NailTab key={f.name} active={target === i} onClick={() => setTarget((t) => (t === i ? null : i))}>
                {f.name}
              </NailTab>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={savePng} data-gtm-cta="nail-shop_save_png" className={`inline-flex items-center gap-2 rounded-[6px] px-5 py-3 text-[15px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.plum }}>
              <Download size={18} aria-hidden />
              내 디자인 저장
            </button>
            {saved && (
              <span className="inline-flex items-center gap-2 text-[14px] font-bold">
                <Paperclip size={16} aria-hidden />
                {saved.at} 저장, 예약에 첨부돼요
              </span>
            )}
          </div>
        </div>

        <div>
          <div id="ns-chips" className="rounded-[8px] border p-4 md:p-5" style={{ background: C.paper, borderColor: C.line }}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-bold tracking-[-0.02em] text-[24px]">
                컬러칩 24색
              </h2>
              <p className="text-[14px] font-bold" style={{ color: C.plumSoft }}>
                {CHIPS[chip].name}
              </p>
            </div>
            <div role="radiogroup" aria-label="컬러칩" className="mt-4 grid grid-cols-6 gap-2 sm:grid-cols-8 sm:gap-3">
              {CHIPS.map((c, i) => {
                const on = i === chip;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={c.name}
                    title={c.name}
                    onClick={() => paint(i)}
                    className={`relative aspect-square w-full rounded-full ${focusRing}`}
                    style={{ background: c.hex, outlineColor: C.plum, boxShadow: `inset 0 0 0 1px rgba(17,17,17,0.14)` }}
                  >
                    {on && (
                      <motion.span layoutId={`ns-ring-${uid}`} transition={spring} aria-hidden className="pointer-events-none absolute -inset-[5px] rounded-full border-2" style={{ borderColor: C.plum }} />
                    )}
                    {fly && fly.phase === "chip" && fly.chip === i && (
                      <motion.span layoutId={`ns-flyer-${uid}`} transition={spring} aria-hidden className="pointer-events-none absolute inset-0 block rounded-full" style={{ background: fly.color, borderRadius: "50%" }} />
                    )}
                    {on && <Check size={16} aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: isDark(c.hex) ? "#fff" : C.plum }} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div id="ns-art" className="mt-4 rounded-[8px] border p-4 md:p-5" style={{ background: C.paper, borderColor: C.line }}>
            <h2 className="font-bold tracking-[-0.02em] text-[24px]">
              아트
            </h2>
            <div role="radiogroup" aria-label="아트" className="mt-3 flex flex-wrap gap-2">
              {ARTS.map((a) => {
                const on = target === null ? nails.every((n) => n.art === a.id) : nails[target].art === a.id;
                const free = base === "grad" && a.id === "grad";
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setArt(a.id)}
                    className={`inline-flex items-center gap-2 rounded-[6px] border px-3 py-2 text-[14px] font-bold ${focusRing}`}
                    style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : "transparent", color: on ? "#fff" : C.plum, outlineColor: C.plum }}
                  >
                    <ArtSwatch art={a.id} />
                    {a.label}
                    {a.price > 0 && <span className="text-[12px] opacity-80">{free ? "포함" : `+${a.price.toLocaleString("ko-KR")}`}</span>}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[13px]" style={{ color: C.plumSoft }}>
              아트 금액은 손톱당. {targetName}에 적용돼요.
            </p>
          </div>

          <div id="ns-menu" className="mt-4 rounded-[8px] border p-4 md:p-5" style={{ background: C.paper, borderColor: C.line }}>
            <h2 className="font-bold tracking-[-0.02em] text-[24px]">
              이 디자인 시술 금액
            </h2>
            <div role="radiogroup" aria-label="베이스" className="mt-3 grid grid-cols-2 gap-2">
              {BASES.map((b) => {
                const on = base === b.id;
                return (
                  <button key={b.id} type="button" role="radio" aria-checked={on} onClick={() => pickBase(b.id)} className={`rounded-[8px] border px-3 py-2.5 text-left ${focusRing}`} style={{ borderColor: on ? C.accent : C.line, background: on ? C.roseSoft : "transparent", outlineColor: C.plum }}>
                    <span className="block text-[15px] font-bold">{b.label}</span>
                    <span className="block text-[13px]" style={{ color: C.plumSoft }}>
                      {won(b.price)}, {b.min}분
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
              <Toggle checked={care} onChange={setCare} label={`손 케어 포함 (+${won(CARE.price)}, ${CARE.min}분)`} />
              <Toggle checked={remove} onChange={setRemove} label={`기존 젤 제거 (+${won(REMOVE.price)}, ${REMOVE.min}분)`} />
            </div>
            <dl className="mt-4 border-t pt-3 text-[15px] leading-[1.9]" style={{ borderColor: C.line }}>
              <Row k={bill.baseLabel} v={won(bill.basePrice)} />
              <Row k={`아트 ${bill.artNails}개 (양손 같은 디자인 기준)`} v={won(bill.art)} />
              {care && <Row k="손 케어" v={won(CARE.price)} />}
              {remove && <Row k="젤 제거" v={won(REMOVE.price)} />}
              <div className="mt-1 flex items-baseline justify-between gap-4 border-t pt-2 text-[22px]" style={{ borderColor: C.line }}>
                <dt className="inline-flex items-center gap-2 text-[16px] font-bold">
                  <Clock size={18} aria-hidden />약 {bill.min}분
                </dt>
                <dd className="font-bold tabular-nums" aria-live="polite">
                  {won(bill.price)}
                </dd>
              </div>
            </dl>
            <button type="button" onClick={() => go("ns-reserve")} data-gtm-cta="nail-shop_design_to_reserve" className={`mt-4 w-full rounded-[6px] px-5 py-3 text-[16px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.plum }}>
              이 디자인으로 예약하기
            </button>
          </div>
        </div>
      </section>

      {/* 시술 메뉴 전체 */}
      <section aria-labelledby="ns-price-title" className="mx-auto mt-16 max-w-[1200px] px-4 md:mt-24 md:px-6">
        <h2 id="ns-price-title" className="font-bold tracking-[-0.02em] text-[30px] md:text-[38px]">
          시술 메뉴와 가격
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {MENU.map((m) => (
            <div key={m.group} className="rounded-[8px] border p-5" style={{ background: C.paper, borderColor: C.line }}>
              <h3 className="font-bold tracking-[-0.02em] text-[20px]">
                {m.group}
              </h3>
              <dl className="mt-2 text-[16px] leading-[2]">
                {m.rows.map(([k, v]) => (
                  <Row key={k} k={k} v={v} />
                ))}
              </dl>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[14px]" style={{ color: C.plumSoft }}>
          부가세 포함. 연장과 보수는 상담 후 안내해요.
        </p>
      </section>

      {/* 예약 */}
      <section id="ns-reserve" aria-labelledby="ns-reserve-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <h2 id="ns-reserve-title" className="font-bold tracking-[-0.02em] text-[30px] md:text-[38px]">
          예약하기
        </h2>
        <ReserveForm today={today} reduce={reduce} saved={saved} bill={bill} />
      </section>

      {/* 샵 안내와 오시는 길 */}
      <section id="ns-info" aria-labelledby="ns-info-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <h2 id="ns-info-title" className="font-bold tracking-[-0.02em] text-[30px] md:text-[38px]">
          오시는 길
        </h2>
        <ShopInfo today={today} />
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pb-28 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.plumSoft }}>
        <p>
          <SampleLogo />
        </p>
        <p>{ADDRESS}</p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

/* 첫 화면 */

/* 문장과 정보 줄 등장: 0.3초 뒤 0.7초 동안 12px 아래에서 올라온다. 끝 상태가 기본값이라 JS 없이도 보인다. */
const POSTER_CSS = `
@keyframes ns-rise { from { opacity: 0; transform: translateY(12px); } }
.ns-rise { animation: ns-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }
@media (prefers-reduced-motion: reduce) { .ns-rise { animation: none !important; } }
`;

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const wrap = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, (v) => `${v * 8}%`);

  return (
    <section ref={wrap} id="ns-poster" aria-labelledby="ns-poster-title" className="relative min-h-[100svh] overflow-hidden" style={{ background: C.bg }}>
      <style>{POSTER_CSS}</style>
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: photoY }}>
        <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : 1.6, ease: EASE }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1344w`}
            sizes="100vw"
            alt="분홍 실크 위에 누드 핑크 젤네일을 한 손을 올린 사진"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "70% 50%" }}
          />
        </motion.div>
      </motion.div>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(255,255,255,0.88), rgba(255,255,255,0.4) 40%, rgba(255,255,255,0) 65%)" }}
        aria-hidden
      />

      {/* 상호와 예약 버튼 */}
      <div className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-[1200px] items-center justify-between px-4 pt-4 md:px-6 md:pt-6">
        <p>
          <SampleLogo small />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta="nail-shop_poster_cta"
          className={`inline-flex items-center gap-1.5 rounded-[6px] px-4 py-2.5 text-[15px] font-semibold text-white ${focusRing}`}
          style={{ background: C.accent, outlineColor: C.plum }}
        >
          <CalendarCheck size={17} aria-hidden />
          예약하기
        </button>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1200px] flex-col justify-end px-4 pb-14 pt-28 md:px-6 md:pb-20">
        <div className={reduce ? undefined : "ns-rise"}>
          <h1
            id="ns-poster-title"
            className="text-[36px] font-bold leading-[1.2] tracking-[-0.03em] [word-break:keep-all] md:text-[clamp(40px,5vw,72px)]"
            style={{ color: C.plum }}
          >
            젤네일 한 번이면
            <br />
            3주 가요
          </h1>
          <p className="mt-4 text-[16px] font-medium md:mt-5 md:text-[18px]" style={{ color: "#4b4b4b" }}>
            {BRAND}, 100% 예약제
          </p>
        </div>
      </div>
    </section>
  );
}

/* 손 SVG */

function HandSvg({ ref, uid, nails, target, onPick, reduce }: { ref: React.RefObject<SVGSVGElement | null>; uid: string; nails: Nail[]; target: number | null; onPick: (i: number) => void; reduce: boolean }) {
  const dur = reduce ? 0 : DUR;
  return (
    <svg ref={ref} viewBox={`0 0 ${VB.w} ${VB.h}`} className="absolute inset-0 h-full w-full" role="img" aria-label="손 사진. 손톱을 누르면 그 손톱만 고를 수 있어요">
      <defs>
        <pattern id={`glit-${uid}`} patternUnits="userSpaceOnUse" width="9" height="9">
          <circle cx="2" cy="2" r="1.1" fill="#fff" opacity="0.95" />
          <circle cx="6.5" cy="5" r="0.8" fill="#fff" opacity="0.8" />
          <circle cx="3.5" cy="7.5" r="0.6" fill="#fffbe6" opacity="0.9" />
        </pattern>
        <pattern id={`chk-${uid}`} patternUnits="userSpaceOnUse" width="14" height="14">
          <rect x="0" y="0" width="7" height="14" fill="#fff" opacity="0.45" />
          <rect x="0" y="0" width="14" height="7" fill="#fff" opacity="0.45" />
        </pattern>
        <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id={`mag-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.48" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="0.56" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="0.75" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`gloss-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.18" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {/* 손톱이 둥글게 보이도록 가장자리를 조금 어둡게 */}
        <radialGradient id={`shade-${uid}`} cx="0.5" cy="0.45" r="0.62">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </radialGradient>
        {FINGERS.map((f, i) => {
          const g = nailGeo(f);
          return (
            <clipPath key={f.name} id={`clip-${uid}-${i}`}>
              <path d={nailPath(g.cx, g.top, g.w, g.h)} />
            </clipPath>
          );
        })}
      </defs>

      {/* 실제 손 사진. 저장할 때는 캔버스에 먼저 그리고 SVG에서는 뺀다(SVG를 그림으로 바꾸면 바깥 사진을 못 불러온다) */}
      <image href={`${IMG}/hand.jpg`} x="0" y="0" width={VB.w} height={VB.h} preserveAspectRatio="xMidYMid slice" data-skip-export="" />
      {/* 손톱 */}
      {FINGERS.map((f, i) => {
        const g = nailGeo(f);
        const d = nailPath(g.cx, g.top, g.w, g.h);
        const n = nails[i];
        const on = target === i;
        return (
          <g key={f.name} transform={f.rot ? `rotate(${f.rot} ${f.pivot[0]} ${f.pivot[1]})` : undefined}>
            <g clipPath={`url(#clip-${uid}-${i})`}>
              <path d={d} data-nail-base={i} fill={n.color} style={{ transition: `fill ${dur}s cubic-bezier(${EASE.join(",")})` }} />
              <AnimatePresence initial={false}>
                {n.art !== "none" && (
                  <motion.g key={n.art} data-art-layer initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: dur, ease: EASE }}>
                    <ArtLayer art={n.art} uid={uid} cx={g.cx} top={g.top} w={g.w} h={g.h} />
                  </motion.g>
                )}
              </AnimatePresence>
              <path d={d} fill={`url(#shade-${uid})`} pointerEvents="none" />
              <path d={d} fill={`url(#gloss-${uid})`} pointerEvents="none" />
            </g>
            <path d={d} fill="none" stroke={on ? C.plum : "rgba(120,80,60,0.35)"} strokeWidth={on ? 2.5 : 0.8} strokeDasharray={on ? "5 3" : undefined} data-skip-export={on ? "" : undefined} />
            <path
              d={d}
              fill="transparent"
              role="button"
              tabIndex={-1}
              aria-label={`${f.name} 손톱`}
              aria-pressed={on}
              data-skip-export=""
              className="cursor-pointer"
              onClick={() => onPick(i)}
            />
          </g>
        );
      })}
    </svg>
  );
}

function ArtLayer({ art, uid, cx, top, w, h }: { art: ArtId; uid: string; cx: number; top: number; w: number; h: number }) {
  const l = cx - w / 2;
  if (art === "french") {
    const tip = h * 0.3;
    return <path d={`M${l - 2} ${top - 2} H${cx + w / 2 + 2} V${top + tip} Q${cx} ${top + tip + 10} ${l - 2} ${top + tip} Z`} fill="#fbf7f3" />;
  }
  if (art === "grad") return <rect x={l - 2} y={top - 2} width={w + 4} height={h + 4} fill={`url(#grad-${uid})`} />;
  if (art === "glitter") return <rect x={l - 2} y={top - 2} width={w + 4} height={h + 4} fill={`url(#glit-${uid})`} />;
  if (art === "check") return <rect x={l - 2} y={top - 2} width={w + 4} height={h + 4} fill={`url(#chk-${uid})`} />;
  if (art === "magnet") return <rect x={l - 2} y={top - 2} width={w + 4} height={h + 4} fill={`url(#mag-${uid})`} />;
  return null;
}

/** 아트 버튼 앞의 작은 견본 */
function ArtSwatch({ art }: { art: ArtId }) {
  const bg: Record<ArtId, string> = {
    none: C.roseSoft,
    french: `linear-gradient(180deg, #fff 0 34%, ${C.rose} 34%)`,
    grad: `linear-gradient(180deg, ${C.rose}, #fff)`,
    glitter: `radial-gradient(circle at 30% 30%, #fff 1.2px, transparent 1.6px) 0 0/6px 6px, radial-gradient(circle at 70% 70%, #fff 0.9px, transparent 1.3px) 0 0/6px 6px, ${C.rose}`,
    check: `linear-gradient(90deg, rgba(255,255,255,0.5) 50%, transparent 50%) 0 0/8px 8px, linear-gradient(180deg, rgba(255,255,255,0.5) 50%, transparent 50%) 0 0/8px 8px, ${C.rose}`,
    magnet: `linear-gradient(135deg, ${C.rose} 30%, #fff 50%, ${C.rose} 70%)`,
  };
  return <span aria-hidden className="inline-block h-5 w-4 rounded-[50%_50%_30%_30%/55%_55%_20%_20%] border" style={{ background: bg[art], borderColor: "rgba(17,17,17,0.25)" }} />;
}

function NailTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`rounded-[6px] border px-3 py-1.5 text-[14px] font-semibold ${focusRing}`} style={{ borderColor: active ? C.accent : C.line, background: active ? C.accent : "transparent", color: active ? "#fff" : C.plum, outlineColor: C.plum }}>
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[#9a5b6a]" />
      <span>{label}</span>
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt>{k}</dt>
      <dd className="font-bold tabular-nums">{v}</dd>
    </div>
  );
}

function isDark(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

/* 예약 */

type Bill = { price: number; min: number; artNails: number; baseLabel: string };

function ReserveForm({ today, reduce, saved, bill }: { today: Date; reduce: boolean; saved: { url: string; at: string } | null; bill: Bill }) {
  const [day, setDay] = useState(() => (HOURS[today.getDay()] ? 0 : 1));
  const [hour, setHour] = useState<number | null>(null);
  const [staff, setStaff] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ no: string; date: Date; hour: number; staff: number; name: string; phone: string } | null>(null);
  const [nowH, setNowH] = useState(0);
  useEffect(() => {
    const f = requestAnimationFrame(() => setNowH(new Date().getHours()));
    return () => cancelAnimationFrame(f);
  }, []);

  const days = Array.from({ length: 7 }, (_, i) => daysAgo(today, -i));
  const date = days[day];
  const hours = HOURS[date.getDay()];
  const slots = hours ? Array.from({ length: hours[1] - hours[0] }, (_, i) => hours[0] + i) : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hour === null) return setErr("시간을 골라 주세요.");
    if (staff === null) return setErr("담당을 골라 주세요.");
    if (name.trim().length < 2) return setErr("이름을 두 글자 이상 적어 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setErr("휴대폰 번호를 다시 확인해 주세요.");
    setErr(null);
    const no = `N${String(date.getFullYear()).slice(2)}${p2(date.getMonth() + 1)}${p2(date.getDate())}-${hour}${staff}${p2(name.trim().length + phone.length)}`;
    setDone({ no, date, hour, staff, name, phone });
  };

  const fade = reduce ? { duration: 0 } : { duration: DUR, ease: EASE };

  return (
    <div className="mt-5 rounded-[8px] border p-4 md:p-6" style={{ background: C.paper, borderColor: C.line }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} aria-live="polite">
            <p className="inline-flex items-center gap-2 text-[26px] font-bold">
              <Check size={26} aria-hidden />
              예약이 접수됐어요
            </p>
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-[16px] leading-[1.7] sm:grid-cols-[120px_minmax(0,1fr)]">
              <dt className="font-bold">예약번호</dt>
              <dd className="tabular-nums">{done.no}</dd>
              <dt className="font-bold">일시</dt>
              <dd>
                {fmtKo(done.date)} {p2(done.hour)}:00
              </dd>
              <dt className="font-bold">담당</dt>
              <dd>
                {STAFF[done.staff].role} {STAFF[done.staff].name}
              </dd>
              <dt className="font-bold">시술</dt>
              <dd>
                {bill.baseLabel}, 아트 {bill.artNails}개, 약 {bill.min}분, {won(bill.price)}
              </dd>
              <dt className="font-bold">예약자</dt>
              <dd>
                {maskName(done.name)} {maskPhone(done.phone)}
              </dd>
              {saved && (
                <>
                  <dt className="font-bold">첨부 디자인</dt>
                  <dd>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={saved.url} alt="저장한 네일 디자인" className="h-28 w-auto rounded-[8px] border" style={{ borderColor: C.line }} />
                  </dd>
                </>
              )}
            </dl>
            <div className="mt-5 rounded-[8px] p-4 text-[15px] leading-[1.8]" style={{ background: C.roseSoft }}>
              <p>예약 확정 문자는 오늘 영업시간 안에 보내 드려요.</p>
              <p>변경과 취소는 예약 하루 전까지 {KAKAO} 또는 전화로 알려 주세요.</p>
              <p>디자인 상담은 방문 10분 전에 와 주시면 함께 봐요.</p>
            </div>
            <button type="button" onClick={() => setDone(null)} className={`mt-5 rounded-[6px] border px-5 py-2.5 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.plum }}>
              다른 예약 넣기
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <fieldset>
                <legend className="text-[16px] font-bold">날짜</legend>
                <div className="mt-2 grid grid-cols-7 gap-1.5">
                  {days.map((d, i) => {
                    const closed = !HOURS[d.getDay()];
                    const on = i === day;
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={closed}
                        aria-pressed={on}
                        onClick={() => {
                          setDay(i);
                          setHour(null);
                        }}
                        className={`rounded-[8px] border px-1 py-2 text-center disabled:opacity-40 ${focusRing}`}
                        style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : "transparent", color: on ? "#fff" : C.plum, outlineColor: C.plum }}
                      >
                        <span className="block text-[12px]">{i === 0 ? "오늘" : DOW[d.getDay()]}</span>
                        <span className="block text-[18px] font-bold tabular-nums">{d.getDate()}</span>
                        <span className="block text-[11px]">{closed ? "휴무" : `${HOURS[d.getDay()]![0]}~${HOURS[d.getDay()]![1]}시`}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="mt-5">
                <legend className="text-[16px] font-bold">담당</legend>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {STAFF.map((s, i) => {
                    const on = staff === i;
                    return (
                      <button
                        key={s.name}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setStaff(i);
                          setHour(null);
                        }}
                        className={`rounded-[8px] border px-2 py-2.5 ${focusRing}`}
                        style={{ borderColor: on ? C.accent : C.line, background: on ? C.roseSoft : "transparent", outlineColor: C.plum }}
                      >
                        <span className="block text-[13px]" style={{ color: C.plumSoft }}>
                          {s.role}
                        </span>
                        <span className="block text-[16px] font-bold">{s.name}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="mt-5">
                <legend className="text-[16px] font-bold">시간</legend>
                <p className="mt-1 text-[13px]" style={{ color: C.plumSoft }}>
                  {staff === null ? "담당을 먼저 고르면 빈 시간이 보여요." : `${STAFF[staff].role} ${STAFF[staff].name}, ${fmtKo(date)}`}
                </p>
                <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-5">
                  {slots.map((h) => {
                    const past = day === 0 && h <= nowH;
                    const full = staff !== null && booked(day, h, staff);
                    const off = past || full || staff === null;
                    const on = hour === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        disabled={off}
                        aria-pressed={on}
                        onClick={() => setHour(h)}
                        className={`rounded-[8px] border px-1 py-2 text-[14px] tabular-nums disabled:opacity-40 ${focusRing}`}
                        style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : "transparent", color: on ? "#fff" : C.plum, outlineColor: C.plum, textDecoration: full ? "line-through" : undefined }}
                      >
                        {p2(h)}:00
                        {full && <span className="block text-[11px]">마감</span>}
                        {past && !full && <span className="block text-[11px]">지남</span>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <div>
              <label className="block text-[16px] font-bold" htmlFor={`ns-name`}>
                이름
              </label>
              <input id="ns-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`mt-1 w-full rounded-[8px] border px-3 py-2.5 text-[16px] ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.plum, background: C.bg }} />
              <label className="mt-4 block text-[16px] font-bold" htmlFor="ns-phone">
                휴대폰
              </label>
              <input id="ns-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" className={`mt-1 w-full rounded-[8px] border px-3 py-2.5 text-[16px] ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.plum, background: C.bg }} />
              <label className="mt-4 block text-[16px] font-bold" htmlFor="ns-memo">
                요청사항
              </label>
              <textarea id="ns-memo" value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} placeholder="손톱 길이, 보수할 손톱 등" className={`mt-1 w-full rounded-[8px] border px-3 py-2.5 text-[16px] ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.plum, background: C.bg }} />

              <div className="mt-4 rounded-[8px] border p-3 text-[14px] leading-[1.7]" style={{ borderColor: C.line }}>
                <p className="font-bold">
                  {bill.baseLabel}, 아트 {bill.artNails}개
                </p>
                <p>
                  약 {bill.min}분, {won(bill.price)}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5">
                  <Paperclip size={14} aria-hidden />
                  {saved ? `내 디자인.png (${saved.at} 저장)` : "저장한 디자인 없음"}
                </p>
              </div>

              {err && (
                <p role="alert" className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: C.error }}>
                  <CircleAlert size={16} aria-hidden />
                  {err}
                </p>
              )}
              <button type="submit" data-gtm-cta="nail-shop_reserve_submit" className={`mt-4 w-full rounded-[6px] px-5 py-3 text-[16px] font-semibold text-white ${focusRing}`} style={{ background: C.accent, outlineColor: C.plum }}>
                예약 접수
              </button>
              <p className="mt-2 text-[13px]" style={{ color: C.plumSoft }}>
                당일 예약은 전화로 확인해 주세요.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* 샵 안내 */

function ShopInfo({ today }: { today: Date }) {
  const dow = today.getDay();
  const rows: [string, string][] = [
    ["월", "정기 휴무"],
    ["화~토", "10:00~20:00"],
    ["일", "11:00~19:00"],
  ];
  const todayRow = dow === 1 ? 0 : dow === 0 ? 2 : 1;
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="grid gap-4">
        <div className="rounded-[8px] border p-5" style={{ background: C.paper, borderColor: C.line }}>
          <h3 className="font-bold tracking-[-0.02em] inline-flex items-center gap-2 text-[20px]">
            <Clock size={20} aria-hidden />
            영업시간
          </h3>
          <dl className="mt-2 text-[16px] leading-[2]">
            {rows.map(([k, v], i) => {
              const on = i === todayRow;
              return (
                <div key={k} className={`flex items-baseline justify-between gap-4 ${on ? "font-bold" : ""}`}>
                  <dt>
                    {k}
                    {on && <span className="ml-2 rounded-[6px] px-2 py-0.5 text-[12px]" style={{ background: C.accent, color: "#fff" }}>오늘</span>}
                  </dt>
                  <dd className="tabular-nums">{v}</dd>
                </div>
              );
            })}
          </dl>
          <p className="mt-2 text-[14px]" style={{ color: C.plumSoft }}>
            마지막 예약은 마감 1시간 전. 공휴일은 휴무.
          </p>
        </div>
        <div className="rounded-[8px] border p-5 text-[16px] leading-[1.8]" style={{ background: C.paper, borderColor: C.line }}>
          <h3 className="font-bold tracking-[-0.02em] inline-flex items-center gap-2 text-[20px]">
            <Car size={20} aria-hidden />
            주차와 예약제
          </h3>
          <p className="mt-2">건물 지하 주차장 2시간 무료. 입구에서 3층 네일이라고 말씀해 주세요.</p>
          <p>100% 예약제로 운영해요. 당일 예약은 전화로 확인해 주세요.</p>
          <p>10분 넘게 늦으면 시술 범위가 줄어들 수 있어요.</p>
        </div>
      </div>
      <div className="rounded-[8px] border p-5" style={{ background: C.paper, borderColor: C.line }}>
        <h3 className="font-bold tracking-[-0.02em] inline-flex items-center gap-2 text-[20px]">
          <MapPin size={20} aria-hidden />
          찾아오기
        </h3>
        <p className="mt-2 text-[16px] leading-[1.8]">
          {ADDRESS}
          <br />
          ㅇㅇ역 2번 출구에서 도보 4분. 1층에 약국이 있는 건물이에요.
        </p>
        <MiniMap />
      </div>
    </div>
  );
}

function MiniMap() {
  return (
    <svg viewBox="0 0 400 220" className="mt-3 w-full rounded-[8px]" role="img" aria-label="약도. ㅇㅇ역 2번 출구에서 큰길을 따라 걸으면 오른쪽 건물 3층" style={{ background: C.bg }}>
      <rect x="0" y="92" width="400" height="36" fill="#fff" stroke={C.line} />
      <rect x="236" y="0" width="30" height="220" fill="#fff" stroke={C.line} />
      <path d="M0 110 H400" stroke={C.line} strokeWidth="2" strokeDasharray="10 8" />
      <circle cx="64" cy="110" r="16" fill={C.plum} />
      <text x="64" y="115" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff" fontFamily="Pretendard, sans-serif">
        역
      </text>
      <text x="64" y="150" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.plum} fontFamily="Pretendard, sans-serif">
        ㅇㅇ역 2번 출구
      </text>
      <path d="M84 110 H236 V60 H300" fill="none" stroke={C.accent} strokeWidth="3" strokeLinecap="round" strokeDasharray="2 8" />
      <rect x="300" y="24" width="72" height="56" rx="4" fill={C.roseSoft} stroke={C.accent} strokeWidth="1.5" />
      <text x="336" y="48" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.plum} fontFamily="Pretendard, sans-serif">
        곰파트너
      </text>
      <text x="336" y="66" textAnchor="middle" fontSize="12" fill={C.plumSoft} fontFamily="Pretendard, sans-serif">
        3층 (1층 약국)
      </text>
      <text x="150" y="192" textAnchor="middle" fontSize="12" fill={C.plumSoft} fontFamily="Pretendard, sans-serif">
        큰길 따라 도보 4분
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
        <span className="text-[12px] font-semibold leading-none opacity-75">네일샵 샘플</span>
      </span>
    </span>
  );
}
