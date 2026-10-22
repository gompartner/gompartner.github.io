"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Black_Han_Sans, Jua } from "@/lib/local-fonts";
import { AnimatePresence, animate, motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { CalendarCheck, Car, Check, CircleAlert, Clock, Download, MapPin, Paperclip, RotateCcw } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 네일샵 홈페이지 샘플: 가상의 곰파트너네일. 젤네일, 패디, 케어, 아트.
   상호, 주소, 직원 이름은 모두 가상이다.

   국내 네일샵 홈페이지와 네이버 예약의 공통 구성을 따랐다.
   메뉴는 디자인 둘러보기, 시술 메뉴와 가격, 예약하기, 오시는 길 네 개.
   첫 화면에는 디자인 사진과 가격표, 예약 버튼이 같이 있고, 시술 메뉴는 젤 제거, 케어, 원컬러, 아트(손톱당), 패디로 나뉜다.
   예약은 날짜, 시간, 담당 디자이너를 고르고 이름과 휴대폰을 남긴다. 변경과 취소는 하루 전까지가 관용 문구다.

   핵심 모션: 공유 레이아웃 전환(layoutId)과 색 모프.
   컬러칩을 누르면 칩이 손톱 자리까지 날아가 붙고 손톱 색이 320ms 동안 그 색으로 바뀐다.
   선택 테두리 링도 layoutId 로 칩 사이를 옮겨 다닌다. 아트는 손톱 위 패턴 레이어가 교차 전환한다.
   동작 줄이기가 켜져 있으면 전부 즉시 바뀐다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 컬러칩과 손톱 색 입히기: 전체 또는 손톱 하나씩. 되돌리기.
   2. 아트와 시술 메뉴: 베이스(젤 원컬러, 젤 그라데이션)와 아트 개수로 시술 시간과 금액 합산. 케어, 젤 제거 포함 여부.
   3. 디자인 저장: 손 그림을 PNG 로 내려받고 예약에 첨부된 것으로 표시.
   4. 예약: 날짜(오늘부터 7일), 시간, 담당, 이름, 휴대폰. 접수 완료 화면.
   5. 샵 안내와 오시는 길: 영업시간(오늘 요일 진하게), 주차, 예약제.

   포스터 첫 화면: 연분홍 바탕에 큰 문장 한 줄과 체리색 매니큐어 병 하나만 둔다. 메뉴, 카드는 스크롤 아래로.
   들어올 때 뚜껑 붓이 병에서 빠지고 병이 기울며 붓 끝에서 방울이 떨어지면 문장 글자 안이 아래부터 체리색으로 차오른다(1.8초).
   그 뒤에는 붓 끝에 7초마다 방울이 맺혀 떨어진다. 스크롤하면 뚜껑이 닫히며 병이 바로 서고, 글자 색이 빠져 손톱 모양으로 모인다.
   동작 줄이기가 켜져 있으면 병은 열린 채 기울어 있고 글자는 다 칠해진 상태로 멈춰 있다. */

const BRAND = "곰파트너네일";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";
const KAKAO = "카카오톡 채널 곰파트너";

/** 320ms, 부드럽게 멈추는 곡선 */
const DUR = 0.32;
const EASE = [0.22, 1, 0.36, 1] as const;

const C = {
  bg: "#fff4f7",
  paper: "#ffffff",
  plum: "#4a1a33",
  plumSoft: "#7a4a62",
  rose: "#d4668a",
  roseSoft: "#f6d9e3",
  line: "#eccbd6",
  skin: "#f6dccb",
  skinLine: "#dcae95",
  error: "#b42318",
};

const titleF = { fontFamily: `${Jua.style.fontFamily}, sans-serif`, fontWeight: 400 } as const;
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
type Finger = { name: string; cx: number; top: number; w: number; len: number; rot: number; pivot: [number, number]; nailH: number };
const FINGERS: Finger[] = [
  { name: "엄지", cx: 110, top: 200, w: 50, len: 150, rot: -32, pivot: [110, 345], nailH: 36 },
  { name: "검지", cx: 136, top: 92, w: 46, len: 194, rot: 0, pivot: [0, 0], nailH: 40 },
  { name: "중지", cx: 188, top: 58, w: 48, len: 228, rot: 0, pivot: [0, 0], nailH: 42 },
  { name: "약지", cx: 240, top: 80, w: 46, len: 206, rot: 0, pivot: [0, 0], nailH: 40 },
  { name: "소지", cx: 288, top: 134, w: 40, len: 156, rot: 0, pivot: [0, 0], nailH: 34 },
];

function nailGeo(f: Finger) {
  const w = f.w - 16;
  const h = f.nailH;
  const top = f.top + 9;
  return { cx: f.cx, w, h, top };
}

function nailPath(cx: number, top: number, w: number, h: number) {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const b = top + h;
  const rt = w / 2;
  return `M${l} ${top + rt} A${rt} ${rt} 0 0 1 ${r} ${top + rt} L${r} ${b - 7} Q${r} ${b} ${r - 7} ${b} L${l + 7} ${b} Q${l} ${b} ${l} ${b - 7} Z`;
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
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      ctx.fillStyle = C.plum;
      ctx.font = "bold 22px Pretendard, sans-serif";
      ctx.fillText(`${BRAND}  ${bill.baseLabel}  아트 ${bill.artNails}개`, 24, cv.height - 28);
      const png = cv.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = png;
      a.download = "곰파트너네일-내-디자인.png";
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
          <PawMark size={30} />
          <span className="text-[24px] leading-none" style={titleF}>
            {BRAND}
          </span>
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
        <button type="button" onClick={() => go("ns-reserve")} data-gtm-cta="nail-shop_go_reserve" className={`flex-none rounded-full px-4 py-2 text-[15px] font-bold text-white ${focusRing}`} style={{ background: C.plum, outlineColor: C.plum }}>
          예약하기
        </button>
      </header>

      {/* 첫 화면: 왼쪽 손, 오른쪽 컬러칩과 아트 */}
      <section id="ns-design" aria-labelledby="ns-design-title" className="mx-auto grid max-w-[1200px] gap-8 px-4 pt-4 md:px-6 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] lg:gap-12 lg:pt-8">
        <div>
          <h2 id="ns-design-title" className="text-[34px] leading-[1.15] md:text-[44px]" style={titleF}>
            내 손에 먼저 올려 보는 젤네일
          </h2>
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-[15px] font-bold" aria-live="polite">
              {targetName}에 칠해요
            </p>
            <button type="button" onClick={undo} disabled={!hist.length} aria-label="되돌리기" className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-2 disabled:opacity-35 ${focusRing}`} style={{ borderColor: C.plum, outlineColor: C.plum }}>
              <RotateCcw size={18} aria-hidden />
            </button>
          </div>

          <div className="relative mx-auto mt-3 w-full max-w-[380px]" style={{ aspectRatio: `${VB.w} / ${VB.h}` }}>
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
            <button type="button" onClick={savePng} data-gtm-cta="nail-shop_save_png" className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-bold text-white ${focusRing}`} style={{ background: C.rose, outlineColor: C.plum }}>
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
          <div id="ns-chips" className="rounded-[12px] border p-4 md:p-5" style={{ background: C.paper, borderColor: C.line }}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[24px]" style={titleF}>
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
                    style={{ background: c.hex, outlineColor: C.plum, boxShadow: `inset 0 0 0 1px rgba(74,26,51,0.18)` }}
                  >
                    {on && (
                      <motion.span layoutId={`ns-ring-${uid}`} transition={spring} aria-hidden className="pointer-events-none absolute -inset-[5px] rounded-full border-[3px]" style={{ borderColor: C.plum }} />
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

          <div id="ns-art" className="mt-4 rounded-[12px] border p-4 md:p-5" style={{ background: C.paper, borderColor: C.line }}>
            <h2 className="text-[24px]" style={titleF}>
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
                    className={`inline-flex items-center gap-2 rounded-full border-2 px-3 py-2 text-[14px] font-bold ${focusRing}`}
                    style={{ borderColor: on ? C.plum : C.line, background: on ? C.plum : "transparent", color: on ? "#fff" : C.plum, outlineColor: C.plum }}
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

          <div id="ns-menu" className="mt-4 rounded-[12px] border p-4 md:p-5" style={{ background: C.paper, borderColor: C.line }}>
            <h2 className="text-[24px]" style={titleF}>
              이 디자인 시술 금액
            </h2>
            <div role="radiogroup" aria-label="베이스" className="mt-3 grid grid-cols-2 gap-2">
              {BASES.map((b) => {
                const on = base === b.id;
                return (
                  <button key={b.id} type="button" role="radio" aria-checked={on} onClick={() => pickBase(b.id)} className={`rounded-[10px] border-2 px-3 py-2.5 text-left ${focusRing}`} style={{ borderColor: on ? C.plum : C.line, background: on ? C.roseSoft : "transparent", outlineColor: C.plum }}>
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
                <dd className="font-black tabular-nums" aria-live="polite">
                  {won(bill.price)}
                </dd>
              </div>
            </dl>
            <button type="button" onClick={() => go("ns-reserve")} data-gtm-cta="nail-shop_design_to_reserve" className={`mt-4 w-full rounded-full px-5 py-3 text-[16px] font-bold text-white ${focusRing}`} style={{ background: C.plum, outlineColor: C.plum }}>
              이 디자인으로 예약하기
            </button>
          </div>
        </div>
      </section>

      {/* 시술 메뉴 전체 */}
      <section aria-labelledby="ns-price-title" className="mx-auto mt-16 max-w-[1200px] px-4 md:mt-24 md:px-6">
        <h2 id="ns-price-title" className="text-[30px] md:text-[38px]" style={titleF}>
          시술 메뉴와 가격
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {MENU.map((m) => (
            <div key={m.group} className="rounded-[12px] border p-5" style={{ background: C.paper, borderColor: C.line }}>
              <h3 className="text-[20px]" style={titleF}>
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
        <h2 id="ns-reserve-title" className="text-[30px] md:text-[38px]" style={titleF}>
          예약하기
        </h2>
        <ReserveForm today={today} reduce={reduce} saved={saved} bill={bill} />
      </section>

      {/* 샵 안내와 오시는 길 */}
      <section id="ns-info" aria-labelledby="ns-info-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <h2 id="ns-info-title" className="text-[30px] md:text-[38px]" style={titleF}>
          오시는 길
        </h2>
        <ShopInfo today={today} />
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pb-28 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.plumSoft }}>
        <p className="text-[16px] font-bold" style={{ color: C.plum }}>
          {BRAND}
        </p>
        <p>{ADDRESS}</p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

/* 포스터 첫 화면 */

/** 포스터 색. 문장 체리색과 바탕 대비는 약 5.8:1 */
const P = {
  bg: "#fde3ea",
  cherry: "#b8142f",
  deep: "#7d0a1f",
  pale: "#f2b3c2",
  ink: "#5c0a1c",
};
const posterF = { fontFamily: `${Black_Han_Sans.style.fontFamily}, sans-serif`, fontWeight: 400 } as const;
/** 등장 1.8초. 0~0.38 병이 열리고 기울기, 0.24~0.52 방울, 0.5~1 글자 채움 */
const INTRO_S = 1.8;
/** 붓 끝 방울 반복 7초 */
const DRIP_S = 7;
/** 뚜껑이 열렸을 때 자리(병 그림 좌표). 붓 끝은 (481, 398) 근처로 온다 */
const CAP_OPEN = { x: 150, y: -50, rot: -28 };
const TILT = -8;
const TIP = { x: 481, y: 398 };
const FLOOR_Y = 557;

const seg = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
const easeOut = (x: number) => 1 - (1 - x) ** 3;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

const LINES = ["젤네일", "한 번이면", "3주 가요"];

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const wrap = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end start"] });
  const t = useMotionValue(0);
  const off = useMotionValue(0); // 1 이면 스크롤 퇴장을 쓰지 않는다

  useEffect(() => {
    off.set(reduce ? 1 : 0);
    if (reduce) {
      t.set(1);
      return;
    }
    t.set(0);
    const c = animate(t, 1, { duration: INTRO_S, ease: "linear" });
    return () => c.stop();
  }, [reduce, t, off]);

  // 함수형 useTransform 은 처음 읽은 값만 구독하므로 두 값을 늘 같이 읽는다
  const sp = () => {
    const v = scrollYProgress.get();
    return off.get() ? 0 : v;
  };
  const pose = useTransform(() => easeInOut(seg(t.get(), 0, 0.38)) * (1 - easeInOut(seg(sp(), 0, 0.28))));
  const tilt = useTransform(() => TILT * pose.get());
  const counter = useTransform(() => -TILT * pose.get());
  const capX = useTransform(() => CAP_OPEN.x * pose.get());
  const capY = useTransform(() => CAP_OPEN.y * pose.get());
  const capR = useTransform(() => CAP_OPEN.rot * pose.get());

  const dropY = useTransform(() => seg(t.get(), 0.36, 0.52) ** 2 * (FLOOR_Y - TIP.y - 6));
  const dropS = useTransform(() => easeOut(seg(t.get(), 0.24, 0.36)));
  const dropO = useTransform(() => {
    const v = t.get();
    return v > 0.24 && v < 0.53 ? 1 : 0;
  });
  const puddleS = useTransform(() => easeOut(seg(t.get(), 0.52, 0.68)) * (1 - seg(sp(), 0, 0.24)));
  const dripO = useTransform(() => {
    const s = sp();
    return t.get() >= 1 ? 1 - seg(s, 0, 0.04) : 0;
  });

  const fill = useTransform(() => `inset(${(1 - easeOut(seg(t.get(), 0.5, 1))) * 100}% 0 0 0)`);
  const drain = useTransform(() => `inset(${easeInOut(seg(sp(), 0, 0.26)) * 100}% 0 0 0)`);
  const textO = useTransform(() => 1 - seg(sp(), 0.14, 0.3));
  const textY = useTransform(() => -60 * easeInOut(seg(sp(), 0, 0.3)));
  const nailS = useTransform(() => 0.15 + 0.85 * easeOut(seg(sp(), 0.06, 0.34)));
  const nailO = useTransform(() => seg(sp(), 0.05, 0.12));
  const bg = useTransform(() => {
    const k = seg(sp(), 0.22, 0.44);
    return k <= 0 ? P.bg : k >= 1 ? C.bg : mixHex(P.bg, C.bg, k);
  });

  const lines = (
    <>
      {LINES.map((l) => (
        <span key={l} className="block">
          {l}
        </span>
      ))}
    </>
  );

  return (
    <section ref={wrap} id="ns-poster" aria-labelledby="ns-poster-title" className={reduce ? "relative" : "relative h-[180svh]"}>
      <motion.div className={`${reduce ? "relative min-h-svh" : "sticky top-0 h-svh"} overflow-hidden`} style={{ background: bg }}>
        {/* 상호와 예약 버튼 하나 */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-5 md:px-[5vw] md:pt-7">
          <p className="flex items-center gap-2 text-[17px] font-bold" style={{ color: P.ink }}>
            <PawMark size={22} />
            {BRAND}
          </p>
          <button
            type="button"
            onClick={onCta}
            aria-label="예약하기"
            data-gtm-cta="nail-shop_poster_cta"
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-white ${focusRing}`}
            style={{ background: P.cherry, outlineColor: P.deep }}
          >
            <CalendarCheck size={22} aria-hidden />
          </button>
        </div>

        {/* 매니큐어 병 */}
        <div className="pointer-events-none absolute bottom-[3svh] left-1/2 aspect-[520/620] h-[50svh] -translate-x-1/2 md:left-auto md:right-[4vw] md:h-[50svh] md:translate-x-0 lg:h-[68svh] xl:h-[80svh]">
          <svg viewBox="0 0 520 620" className="h-full w-full overflow-visible" role="img" aria-label="뚜껑 붓을 들어 올린 체리색 젤네일 병">
            <PolishDefs />
            <ellipse cx="230" cy={FLOOR_Y} rx="172" ry="18" fill="url(#ns-p-floor)" />
            <ellipse cx="272" cy={FLOOR_Y + 3} rx="120" ry="9" fill="#d42a46" opacity="0.2" />
            <motion.ellipse cx={TIP.x} cy={FLOOR_Y} rx="36" ry="8" fill="url(#ns-p-puddle)" style={{ scale: puddleS }} />
            <motion.ellipse cx={TIP.x - 10} cy={FLOOR_Y - 2} rx="12" ry="2.4" fill="#fff" style={{ scale: puddleS, opacity: 0.55 }} />

            {/* 병. 바닥 가운데를 축으로 기운다 */}
            <motion.g style={{ rotate: tilt, originX: 0.5, originY: 1 }}>
              <rect x="192" y="234" width="76" height="48" rx="8" fill="url(#ns-p-glass)" stroke="#fff" strokeOpacity="0.85" strokeWidth="2" />
              <path d="M196 248 H264 M196 258 H264 M196 268 H264" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" />
              <ellipse cx="230" cy="235" rx="37" ry="5" fill="#fff" opacity="0.55" />
              <rect x="110" y="272" width="240" height="282" rx="52" fill="#f4b8c6" opacity="0.35" />
              <g clipPath="url(#ns-p-inner)">
                {/* 병이 기울어도 액체 면은 수평에 가깝게 */}
                <motion.g style={{ rotate: counter, originX: 0.5, originY: 0.5 }}>
                  <rect x="20" y="328" width="420" height="320" fill="url(#ns-p-liq)" />
                  <rect x="20" y="328" width="420" height="320" fill="url(#ns-p-liqv)" />
                  <ellipse cx="230" cy="328" rx="210" ry="7" fill="#e65a73" opacity="0.9" />
                </motion.g>
                <rect x="124" y="510" width="212" height="30" fill="#fff" opacity="0.16" />
              </g>
              <rect x="110" y="272" width="240" height="282" rx="52" fill="url(#ns-p-glass)" stroke="#fff" strokeOpacity="0.9" strokeWidth="3" />
              <rect x="108.5" y="270.5" width="243" height="285" rx="53.5" fill="none" stroke={P.deep} strokeOpacity="0.28" strokeWidth="1.5" />
              <rect x="138" y="302" width="18" height="206" rx="9" fill="url(#ns-p-hl)" />
              <rect x="316" y="320" width="7" height="150" rx="3.5" fill="#fff" opacity="0.4" />
              <path d="M150 290 Q230 274 310 290" fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="3" strokeLinecap="round" />
              <circle cx="150" cy="300" r="4" fill="#fff" />
              <path d="M140 530 Q230 546 320 530" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2.5" strokeLinecap="round" />
            </motion.g>

            {/* 뚜껑과 붓 */}
            <motion.g style={{ x: capX, y: capY, rotate: capR, originX: 0.5, originY: 0.5 }}>
              <rect x="224" y="232" width="12" height="186" rx="6" fill="#2a0c19" />
              <path d="M219 410 L241 410 Q247 446 234 472 Q230 478 226 472 Q213 446 219 410 Z" fill="url(#ns-p-bristle)" />
              <path d="M225 418 Q223 444 229 466" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
              <rect x="186" y="214" width="88" height="24" rx="4" fill="url(#ns-p-collar)" />
              <rect x="190" y="40" width="80" height="180" rx="18" fill="url(#ns-p-cap)" />
              <rect x="203" y="54" width="10" height="150" rx="5" fill="#fff" opacity="0.32" />
              <rect x="252" y="62" width="4" height="130" rx="2" fill="#fff" opacity="0.12" />
              <ellipse cx="230" cy="50" rx="28" ry="5" fill="#fff" opacity="0.2" />
            </motion.g>

            {/* 처음 한 방울 */}
            <g transform={`translate(${TIP.x} ${TIP.y})`}>
              <motion.g style={{ y: dropY, scale: dropS, opacity: dropO, originX: 0.5, originY: 0 }}>
                <Drop />
              </motion.g>
            </g>
            {/* 그 뒤 붓 끝에 맺혀 떨어지는 방울 */}
            {!reduce && (
              <motion.g style={{ opacity: dripO }}>
                <g transform={`translate(${TIP.x} ${TIP.y})`}>
                  <motion.g
                    initial={{ opacity: 0, scale: 0, y: 0 }}
                    animate={{ opacity: [0, 1, 1, 1, 0], scale: [0, 0.7, 1, 1, 0.4], y: [0, 0, 0, FLOOR_Y - TIP.y - 8, FLOOR_Y - TIP.y - 4] }}
                    transition={{ duration: DRIP_S, times: [0, 0.6, 0.86, 0.97, 1], ease: "easeIn", repeat: Infinity, delay: INTRO_S + 0.6 }}
                    style={{ originX: 0.5, originY: 0 }}
                  >
                    <Drop />
                  </motion.g>
                </g>
              </motion.g>
            )}
          </svg>
        </div>

        {/* 스크롤하면 글자 색이 모이는 손톱 */}
        {!reduce && (
          <div aria-hidden className="pointer-events-none absolute inset-0 flex items-start justify-center pt-[16svh] lg:items-center lg:pt-0">
            <motion.svg viewBox="0 0 200 260" className="h-[30svh] w-auto lg:h-[44svh]" style={{ scale: nailS, opacity: nailO }}>
              <defs>
                <linearGradient id="ns-p-nail" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#6e0718" />
                  <stop offset="0.3" stopColor="#c41a36" />
                  <stop offset="0.55" stopColor="#d23552" />
                  <stop offset="1" stopColor="#7d0a1f" />
                </linearGradient>
              </defs>
              <path d="M100 8 C152 8 184 54 184 122 L184 212 Q184 252 146 252 L54 252 Q16 252 16 212 L16 122 C16 54 48 8 100 8 Z" fill="url(#ns-p-nail)" />
              <path d="M50 70 Q60 34 96 24" fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="9" strokeLinecap="round" />
              <path d="M44 100 L44 196" stroke="#fff" strokeOpacity="0.3" strokeWidth="6" strokeLinecap="round" />
              <path d="M30 236 Q100 222 170 236" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
            </motion.svg>
          </div>
        )}

        {/* 큰 문장 */}
        <div className="absolute inset-x-0 top-0 z-10 px-5 pt-[92px] md:px-[5vw] md:pt-[124px] lg:inset-y-0 lg:flex lg:flex-col lg:justify-center lg:pt-0">
          <motion.div style={{ opacity: textO, y: textY }}>
            <h1
              id="ns-poster-title"
              className="relative text-[clamp(60px,19vw,96px)] leading-[1.04] md:text-[clamp(96px,11.5vw,184px)]"
              style={{ ...posterF, color: P.pale, wordBreak: "keep-all" }}
            >
              {lines}
              <motion.span aria-hidden className="absolute inset-0 block" style={{ clipPath: drain }}>
                <motion.span
                  className="block"
                  style={{
                    clipPath: fill,
                    color: "transparent",
                    backgroundImage: `linear-gradient(180deg, #c41a36 0%, #dc4a63 16%, ${P.cherry} 30%, ${P.cherry} 70%, #990d27 100%)`,
                    backgroundSize: "100% 1.04em",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                  }}
                >
                  {lines}
                </motion.span>
              </motion.span>
            </h1>
            <p className="mt-5 text-[16px] font-bold md:mt-7 md:text-[18px]" style={{ color: P.ink }}>
              {BRAND}, 100% 예약제
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/** 두 색 사이를 k(0~1)만큼 섞는다 */
function mixHex(a: string, b: string, k: number) {
  const x = parseInt(a.slice(1), 16);
  const y = parseInt(b.slice(1), 16);
  const ch = (sh: number) => Math.round(((x >> sh) & 255) * (1 - k) + ((y >> sh) & 255) * k);
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`;
}

function Drop() {
  return (
    <>
      <path d="M0 0 Q9 12 9 18 A9 9 0 0 1 -9 18 Q-9 12 0 0 Z" fill="url(#ns-p-drop)" />
      <circle cx="-3" cy="15" r="2.2" fill="#fff" opacity="0.8" />
    </>
  );
}

function PolishDefs() {
  return (
    <defs>
      <linearGradient id="ns-p-liq" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#4a020f" />
        <stop offset="0.24" stopColor="#8e0a24" />
        <stop offset="0.38" stopColor="#d01f3e" />
        <stop offset="0.5" stopColor="#b8142f" />
        <stop offset="0.7" stopColor="#7e0820" />
        <stop offset="1" stopColor="#3f010c" />
      </linearGradient>
      <linearGradient id="ns-p-liqv" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff8aa0" stopOpacity="0.35" />
        <stop offset="0.12" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.38" />
      </linearGradient>
      <linearGradient id="ns-p-glass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
        <stop offset="0.12" stopColor="#fff" stopOpacity="0.12" />
        <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.86" stopColor="#fff" stopOpacity="0.03" />
        <stop offset="1" stopColor="#fff" stopOpacity="0.45" />
      </linearGradient>
      <linearGradient id="ns-p-hl" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="ns-p-cap" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#12060b" />
        <stop offset="0.22" stopColor="#3d1426" />
        <stop offset="0.38" stopColor="#5e2544" />
        <stop offset="0.58" stopColor="#2b0d1a" />
        <stop offset="1" stopColor="#0d0408" />
      </linearGradient>
      <linearGradient id="ns-p-collar" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#6b5a62" />
        <stop offset="0.35" stopColor="#efe6ea" />
        <stop offset="0.6" stopColor="#b9a8b0" />
        <stop offset="1" stopColor="#4f4047" />
      </linearGradient>
      <linearGradient id="ns-p-bristle" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#7d0a1f" />
        <stop offset="0.45" stopColor="#d23552" />
        <stop offset="1" stopColor="#7d0a1f" />
      </linearGradient>
      <radialGradient id="ns-p-floor" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#7d0a1f" stopOpacity="0.38" />
        <stop offset="1" stopColor="#7d0a1f" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="ns-p-puddle" cx="0.42" cy="0.4" r="0.6">
        <stop offset="0" stopColor="#d6405a" />
        <stop offset="1" stopColor="#8a0c22" />
      </radialGradient>
      <radialGradient id="ns-p-drop" cx="0.35" cy="0.65" r="0.7">
        <stop offset="0" stopColor="#f06a82" />
        <stop offset="0.55" stopColor={P.cherry} />
        <stop offset="1" stopColor="#6e0718" />
      </radialGradient>
      <clipPath id="ns-p-inner">
        <rect x="124" y="290" width="212" height="250" rx="40" />
      </clipPath>
    </defs>
  );
}

/* 손 SVG */

function HandSvg({ ref, uid, nails, target, onPick, reduce }: { ref: React.RefObject<SVGSVGElement | null>; uid: string; nails: Nail[]; target: number | null; onPick: (i: number) => void; reduce: boolean }) {
  const dur = reduce ? 0 : DUR;
  return (
    <svg ref={ref} viewBox={`0 0 ${VB.w} ${VB.h}`} className="absolute inset-0 h-full w-full" role="img" aria-label="손 그림. 손톱을 누르면 그 손톱만 고를 수 있어요">
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
        <linearGradient id={`gloss-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {FINGERS.map((f, i) => {
          const g = nailGeo(f);
          return (
            <clipPath key={f.name} id={`clip-${uid}-${i}`}>
              <path d={nailPath(g.cx, g.top, g.w, g.h)} />
            </clipPath>
          );
        })}
      </defs>

      {/* 손바닥 */}
      <path d="M118 290 Q118 262 140 262 L300 262 Q322 264 322 290 L322 364 Q322 418 268 418 L170 418 Q118 418 118 364 Z" fill={C.skin} stroke={C.skinLine} strokeWidth="2.5" />
      {/* 손가락 */}
      {FINGERS.map((f) => (
        <g key={f.name} transform={f.rot ? `rotate(${f.rot} ${f.pivot[0]} ${f.pivot[1]})` : undefined}>
          <rect x={f.cx - f.w / 2} y={f.top} width={f.w} height={f.len} rx={f.w / 2} fill={C.skin} stroke={C.skinLine} strokeWidth="2.5" />
        </g>
      ))}
      {/* 손가락 밑동 선을 덮어 손바닥과 이어 보이게 */}
      <rect x="120" y="264" width="200" height="40" fill={C.skin} />
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
              <path d={d} fill={`url(#gloss-${uid})`} pointerEvents="none" />
            </g>
            <path d={d} fill="none" stroke={on ? C.plum : C.skinLine} strokeWidth={on ? 3 : 1.5} strokeDasharray={on ? "5 3" : undefined} data-skip-export={on ? "" : undefined} />
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
  return <span aria-hidden className="inline-block h-5 w-4 rounded-[50%_50%_30%_30%/55%_55%_20%_20%] border" style={{ background: bg[art], borderColor: "rgba(74,26,51,0.3)" }} />;
}

function NailTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`rounded-full border-2 px-3 py-1.5 text-[14px] font-bold ${focusRing}`} style={{ borderColor: active ? C.plum : C.line, background: active ? C.plum : "transparent", color: active ? "#fff" : C.plum, outlineColor: C.plum }}>
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[#4a1a33]" />
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

function PawMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="flex-none">
      <circle cx="16" cy="19" r="8" fill={C.rose} />
      <circle cx="7" cy="13" r="3.4" fill={C.plum} />
      <circle cx="12.5" cy="7" r="3.4" fill={C.plum} />
      <circle cx="19.5" cy="7" r="3.4" fill={C.plum} />
      <circle cx="25" cy="13" r="3.4" fill={C.plum} />
    </svg>
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
    <div className="mt-5 rounded-[12px] border p-4 md:p-6" style={{ background: C.paper, borderColor: C.line }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} aria-live="polite">
            <p className="inline-flex items-center gap-2 text-[26px]" style={titleF}>
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
            <div className="mt-5 rounded-[10px] p-4 text-[15px] leading-[1.8]" style={{ background: C.roseSoft }}>
              <p>예약 확정 문자는 오늘 영업시간 안에 보내 드려요.</p>
              <p>변경과 취소는 예약 하루 전까지 {KAKAO} 또는 전화로 알려 주세요.</p>
              <p>디자인 상담은 방문 10분 전에 와 주시면 함께 봐요.</p>
            </div>
            <button type="button" onClick={() => setDone(null)} className={`mt-5 rounded-full border-2 px-5 py-2.5 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.plum, outlineColor: C.plum }}>
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
                        className={`rounded-[10px] border-2 px-1 py-2 text-center disabled:opacity-40 ${focusRing}`}
                        style={{ borderColor: on ? C.plum : C.line, background: on ? C.plum : "transparent", color: on ? "#fff" : C.plum, outlineColor: C.plum }}
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
                        className={`rounded-[10px] border-2 px-2 py-2.5 ${focusRing}`}
                        style={{ borderColor: on ? C.plum : C.line, background: on ? C.roseSoft : "transparent", outlineColor: C.plum }}
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
                        className={`rounded-[8px] border-2 px-1 py-2 text-[14px] tabular-nums disabled:opacity-40 ${focusRing}`}
                        style={{ borderColor: on ? C.plum : C.line, background: on ? C.plum : "transparent", color: on ? "#fff" : C.plum, outlineColor: C.plum, textDecoration: full ? "line-through" : undefined }}
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
              <input id="ns-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`mt-1 w-full rounded-[8px] border-2 px-3 py-2.5 text-[16px] ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.plum, background: C.bg }} />
              <label className="mt-4 block text-[16px] font-bold" htmlFor="ns-phone">
                휴대폰
              </label>
              <input id="ns-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" className={`mt-1 w-full rounded-[8px] border-2 px-3 py-2.5 text-[16px] ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.plum, background: C.bg }} />
              <label className="mt-4 block text-[16px] font-bold" htmlFor="ns-memo">
                요청사항
              </label>
              <textarea id="ns-memo" value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} placeholder="손톱 길이, 보수할 손톱 등" className={`mt-1 w-full rounded-[8px] border-2 px-3 py-2.5 text-[16px] ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.plum, background: C.bg }} />

              <div className="mt-4 rounded-[10px] border p-3 text-[14px] leading-[1.7]" style={{ borderColor: C.line }}>
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
              <button type="submit" data-gtm-cta="nail-shop_reserve_submit" className={`mt-4 w-full rounded-full px-5 py-3 text-[16px] font-bold text-white ${focusRing}`} style={{ background: C.plum, outlineColor: C.plum }}>
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
        <div className="rounded-[12px] border p-5" style={{ background: C.paper, borderColor: C.line }}>
          <h3 className="inline-flex items-center gap-2 text-[20px]" style={titleF}>
            <Clock size={20} aria-hidden />
            영업시간
          </h3>
          <dl className="mt-2 text-[16px] leading-[2]">
            {rows.map(([k, v], i) => {
              const on = i === todayRow;
              return (
                <div key={k} className={`flex items-baseline justify-between gap-4 ${on ? "font-black" : ""}`}>
                  <dt>
                    {k}
                    {on && <span className="ml-2 rounded-full px-2 py-0.5 text-[12px]" style={{ background: C.plum, color: "#fff" }}>오늘</span>}
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
        <div className="rounded-[12px] border p-5 text-[16px] leading-[1.8]" style={{ background: C.paper, borderColor: C.line }}>
          <h3 className="inline-flex items-center gap-2 text-[20px]" style={titleF}>
            <Car size={20} aria-hidden />
            주차와 예약제
          </h3>
          <p className="mt-2">건물 지하 주차장 2시간 무료. 입구에서 3층 네일이라고 말씀해 주세요.</p>
          <p>100% 예약제로 운영해요. 당일 예약은 전화로 확인해 주세요.</p>
          <p>10분 넘게 늦으면 시술 범위가 줄어들 수 있어요.</p>
        </div>
      </div>
      <div className="rounded-[12px] border p-5" style={{ background: C.paper, borderColor: C.line }}>
        <h3 className="inline-flex items-center gap-2 text-[20px]" style={titleF}>
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
      <path d="M84 110 H236 V60 H300" fill="none" stroke={C.rose} strokeWidth="4" strokeLinecap="round" strokeDasharray="2 8" />
      <rect x="300" y="24" width="72" height="56" rx="4" fill={C.roseSoft} stroke={C.plum} strokeWidth="2" />
      <text x="336" y="48" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.plum} fontFamily="Pretendard, sans-serif">
        곰파트너네일
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
