"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Car,
  Check,
  Egg,
  EggOff,
  Menu,
  Milk,
  MilkOff,
  Minus,
  Nut,
  NutOff,
  Plus,
  Search,
  TrainFront,
  Wheat,
  WheatOff,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 베이커리 카페 홈페이지 데모: 가상의 ○○ 베이커리.
   상호, 대표자, 주소, 전화번호, 사업자 정보, 빵 이름과 가격은 모두 가상이다.

   디자인: 크림색 바탕(#fbf6ec)에 빵 껍질 갈색(#9a4f1c), 버터 노랑(#f2c14e), 크라프트지(#e8d9bd).
   제목은 굵은 고딕, 본문은 보통 고딕. 주문 확인은 영수증 모양으로 보여 준다.

   빵 나오는 시간은 8시부터 20시까지를 한 바퀴로 그린 오븐 시계에 점으로 찍는다.
   지금 시각을 가리키는 바늘 앞은 나온 빵, 뒤는 나올 빵이고, 점을 누르면 남은 개수나 남은 시간이 나온다.
   빵 담기는 고른 빵이 쟁반 그림에 하나씩 놓이고, 픽업 시간은 고른 빵이 처음 나오는 시간 뒤로만 고를 수 있다.
   알레르기 성분은 빼고 싶은 것을 눌러 거르고, 이름 검색도 함께 둔다.

   사진 출처(public/images/demo-bakery):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, display */

const IMG = "/images/demo-bakery";
const BAKERY = "○○ 베이커리";
const TEL = "02-000-0000";
const ADDRESS = "□□시 □□로 5길 21 1층";

const C = {
  cream: "#fbf6ec",
  paper: "#fffdf8",
  kraft: "#efe3cb",
  kraftDeep: "#cdb48a",
  crust: "#9a4f1c",
  crustDeep: "#6f3510",
  butter: "#f2c14e",
  butterSoft: "#fbeab8",
  ink: "#2b1e14",
  muted: "#6b5a4b",
  line: "#e5d9c4",
};

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV = [
  { id: "oven", label: "빵 나오는 시간" },
  { id: "order", label: "미리 담기" },
  { id: "story", label: "가게 이야기" },
  { id: "location", label: "오시는 길" },
];

/* ---------- 시간 ---------- */

const OPEN = 480; // 08:00
const CLOSE = 1200; // 20:00
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const subscribeMinute = (cb: () => void) => {
  const id = window.setInterval(cb, 20_000);
  return () => window.clearInterval(id);
};

/** 분 단위 현재 시각. 서버 렌더에서는 -1을 돌려 시간에 따른 화면 차이를 막는다. */
function useNowMinute() {
  return useSyncExternalStore(subscribeMinute, () => Math.floor(Date.now() / 60_000), () => -1);
}

function clockOf(minute: number) {
  if (minute < 0) return null;
  const d = new Date(minute * 60_000);
  return { day: d.getDay(), m: d.getHours() * 60 + d.getMinutes() };
}

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function untilText(diff: number) {
  if (diff < 60) return `${diff}분 뒤`;
  const h = Math.floor(diff / 60);
  const r = diff % 60;
  return r ? `${h}시간 ${r}분 뒤` : `${h}시간 뒤`;
}

type Clock = ReturnType<typeof clockOf>;

function shopStatus(clock: Clock) {
  if (!clock) return null;
  if (clock.day === 1) return { open: false, text: "월요일은 쉽니다" };
  if (clock.m < OPEN) return { open: false, text: "아침 8시에 문을 엽니다" };
  if (clock.m >= CLOSE) return { open: false, text: "오늘 영업이 끝났습니다" };
  return { open: true, text: "지금 영업 중 (20:00까지)" };
}

/* ---------- 빵 ---------- */

type Allergen = "milk" | "egg" | "nut" | "wheat";
type Shape = "bun" | "crescent" | "loaf" | "ring" | "bar" | "tart" | "block";

interface Bread {
  id: string;
  name: string;
  price: number;
  shape: Shape;
  color: string;
  allergens: Allergen[];
  /** 몇 분마다 하나씩 팔리는지. 남은 개수 계산에만 쓴다. */
  sellEvery: number;
  desc: string;
}

const BREADS: Bread[] = [
  { id: "salt", name: "소금빵", price: 3200, shape: "crescent", color: "#d99a4e", allergens: ["milk", "wheat"], sellEvery: 5, desc: "버터를 말아 굽고 굵은 소금을 올립니다." },
  { id: "croissant", name: "크루아상", price: 4200, shape: "crescent", color: "#c27630", allergens: ["milk", "egg", "wheat"], sellEvery: 8, desc: "사흘 동안 반죽을 접어 결이 스물일곱 겹입니다." },
  { id: "campagne", name: "깜파뉴", price: 7500, shape: "loaf", color: "#a8682f", allergens: ["wheat"], sellEvery: 25, desc: "통밀과 호밀을 섞어 48시간 저온 발효합니다." },
  { id: "fig", name: "무화과 호두 깜파뉴", price: 8500, shape: "loaf", color: "#8f5228", allergens: ["wheat", "nut"], sellEvery: 25, desc: "말린 무화과와 구운 호두를 듬뿍 넣었습니다." },
  { id: "bagel", name: "플레인 베이글", price: 3500, shape: "ring", color: "#d4a061", allergens: ["wheat"], sellEvery: 12, desc: "데쳐서 구워 겉은 단단하고 속은 쫄깃합니다." },
  { id: "pretzel", name: "버터 프레첼", price: 4000, shape: "ring", color: "#7a3f17", allergens: ["milk", "wheat"], sellEvery: 12, desc: "가운데를 갈라 차가운 버터를 끼웠습니다." },
  { id: "redbean", name: "단팥빵", price: 3000, shape: "bun", color: "#b86a2a", allergens: ["milk", "egg", "wheat"], sellEvery: 10, desc: "국산 팥을 덜 달게 졸여 꽉 채웁니다." },
  { id: "cream", name: "우유 크림빵", price: 3500, shape: "bun", color: "#e0a95c", allergens: ["milk", "egg", "wheat"], sellEvery: 9, desc: "주문이 들어오면 크림을 채워 드립니다." },
  { id: "milkbread", name: "우유식빵", price: 5500, shape: "block", color: "#e3b877", allergens: ["milk", "wheat"], sellEvery: 15, desc: "물 대신 우유로 반죽해 결대로 찢어집니다." },
  { id: "castella", name: "쌀 카스텔라", price: 6000, shape: "block", color: "#e6b54a", allergens: ["milk", "egg"], sellEvery: 18, desc: "밀가루 없이 쌀가루와 달걀로 굽습니다." },
  { id: "financier", name: "휘낭시에", price: 2500, shape: "bar", color: "#c98a3d", allergens: ["milk", "egg", "nut", "wheat"], sellEvery: 6, desc: "갈색이 나도록 끓인 버터와 아몬드 가루로 굽습니다." },
  { id: "tart", name: "에그타르트", price: 3000, shape: "tart", color: "#f0bb3c", allergens: ["milk", "egg", "wheat"], sellEvery: 7, desc: "겹겹이 부서지는 반죽에 커스터드를 채웁니다." },
];

const BREAD_BY_ID = Object.fromEntries(BREADS.map((b) => [b.id, b])) as Record<string, Bread>;

interface Batch {
  at: number;
  bread: string;
  qty: number;
}

const BATCHES: Batch[] = [
  { at: 480, bread: "salt", qty: 24 },
  { at: 510, bread: "croissant", qty: 18 },
  { at: 540, bread: "campagne", qty: 8 },
  { at: 570, bread: "bagel", qty: 12 },
  { at: 600, bread: "redbean", qty: 15 },
  { at: 630, bread: "cream", qty: 15 },
  { at: 660, bread: "salt", qty: 24 },
  { at: 690, bread: "milkbread", qty: 10 },
  { at: 720, bread: "fig", qty: 8 },
  { at: 750, bread: "castella", qty: 10 },
  { at: 780, bread: "croissant", qty: 18 },
  { at: 810, bread: "pretzel", qty: 12 },
  { at: 840, bread: "financier", qty: 20 },
  { at: 900, bread: "salt", qty: 24 },
  { at: 930, bread: "tart", qty: 16 },
  { at: 960, bread: "cream", qty: 12 },
  { at: 1020, bread: "salt", qty: 18 },
];

const FIRST_AT = Object.fromEntries(
  BREADS.map((b) => [b.id, Math.min(...BATCHES.filter((x) => x.bread === b.id).map((x) => x.at))]),
) as Record<string, number>;

type BatchState = { kind: "unknown" } | { kind: "closed" } | { kind: "soon"; diff: number } | { kind: "out"; left: number };

function batchState(batch: Batch, clock: Clock): BatchState {
  if (!clock) return { kind: "unknown" };
  if (clock.day === 1) return { kind: "closed" };
  if (clock.m < batch.at) return { kind: "soon", diff: batch.at - clock.m };
  const sold = Math.floor((clock.m - batch.at) / BREAD_BY_ID[batch.bread].sellEvery);
  return { kind: "out", left: Math.max(0, batch.qty - sold) };
}

function stateText(s: BatchState) {
  switch (s.kind) {
    case "unknown":
      return "";
    case "closed":
      return "오늘은 쉬는 날";
    case "soon":
      return `${untilText(s.diff)} 나와요`;
    case "out":
      return s.left > 0 ? `나왔어요, ${s.left}개 남음` : "다 팔렸어요";
  }
}

const ALLERGENS: { id: Allergen; label: string; on: typeof Milk; off: typeof MilkOff }[] = [
  { id: "milk", label: "우유", on: Milk, off: MilkOff },
  { id: "egg", label: "달걀", on: Egg, off: EggOff },
  { id: "nut", label: "견과", on: Nut, off: NutOff },
  { id: "wheat", label: "밀가루", on: Wheat, off: WheatOff },
];

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/** 받침이 있으면 "이", 없으면 "가" */
function iGa(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code < 11172 && code % 28 ? "이" : "가";
}

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘 → 김ㅎ늘 */
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

/* ---------- 페이지 ---------- */

export function BakeryCafeDemo() {
  const minute = useNowMinute();
  const clock = clockOf(minute);
  const [cart, setCart] = useState<Record<string, number>>({});

  const add = (id: string, delta: number) =>
    setCart((prev) => {
      const next = { ...prev, [id]: Math.max(0, Math.min(20, (prev[id] ?? 0) + delta)) };
      if (next[id] === 0) delete next[id];
      return next;
    });

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.cream, color: C.ink }}>
      <Header />
      <main>
        <Hero clock={clock} />
        <Oven clock={clock} onAdd={(id) => add(id, 1)} />
        <Order clock={clock} cart={cart} onAdd={add} onClear={() => setCart({})} />
        <Story />
        <Location clock={clock} />
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
        <path d="M4 20 Q15 2 26 20 Q20 16 15 17 Q10 16 4 20Z" fill={light ? C.butter : C.crust} />
        <path d="M11 11 L13 17 M15 9 V17 M19 11 L17 17" stroke={light ? C.crustDeep : C.butter} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M5 24 H25" stroke={light ? C.butter : C.crust} strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="text-[19px] font-bold tracking-[-0.02em]">{BAKERY}</span>
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
    <header className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ background: "rgba(251,246,236,0.92)", borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-6">
        <a href="#top" aria-label={`${BAKERY} 처음으로`}>
          <Logo />
        </a>
        <nav aria-label="주 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-7 text-[15px]">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="transition-colors hover:text-[#9a4f1c]" style={{ color: C.muted }}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a href={`tel:${TEL}`} className="hidden h-10 items-center rounded-full px-5 text-[15px] font-semibold md:inline-flex" style={{ background: C.crust, color: "#fff" }}>
          {TEL}
        </a>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full md:hidden"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="bakery-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="bakery-menu"
            aria-label="주 메뉴"
            className="overflow-hidden border-t md:hidden"
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
                <a href={`tel:${TEL}`} className="flex h-12 items-center text-[17px] font-semibold" style={{ color: C.crust }}>
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

function nextBatch(clock: Clock) {
  if (!clock || clock.day === 1) return null;
  return BATCHES.find((b) => b.at > clock.m) ?? null;
}

function lastBatch(clock: Clock) {
  if (!clock || clock.day === 1) return null;
  return [...BATCHES].reverse().find((b) => b.at <= clock.m) ?? null;
}

function Hero({ clock }: { clock: Clock }) {
  const status = shopStatus(clock);
  const next = nextBatch(clock);
  const prev = lastBatch(clock);
  const progress = next && clock ? 1 - (next.at - clock.m) / (next.at - (prev?.at ?? next.at - 30)) : 0;

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="relative h-[620px] md:h-[640px]">
        <Image src={`${IMG}/hero.jpg`} alt="오븐에서 막 꺼낸 소금빵 쟁반에 김이 오르는 모습" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "62% center" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(43,30,20,0.82) 0%, rgba(43,30,20,0.55) 45%, rgba(43,30,20,0.1) 100%)" }} />
        <div className="absolute inset-0 md:hidden" style={{ background: "linear-gradient(0deg, rgba(43,30,20,0.85) 0%, rgba(43,30,20,0.2) 70%)" }} />
        <div className="relative mx-auto flex h-full max-w-[1200px] flex-col justify-end px-4 pb-10 md:justify-center md:px-6 md:pb-0">
          <p className="text-[15px] font-semibold" style={{ color: C.butter }}>
            □□동 골목 빵집
          </p>
          <h1 className="mt-2 text-[40px] font-bold leading-[1.2] tracking-[-0.03em] text-white md:text-[60px]">{BAKERY}</h1>
          <p className="mt-4 max-w-[460px] text-[17px] text-[#f3e9da] md:text-[19px]">
            아침 8시부터 오후 5시까지 차례로 빵이 나옵니다. 나오는 시간을 보고 오시거나 미리 담아 두세요.
          </p>

          <div className="mt-7 w-full max-w-[420px] rounded-[12px] p-5" style={{ background: C.paper }}>
            <div className="flex items-center justify-between gap-3 text-[14px]">
              <span className="font-semibold" style={{ color: C.crust }}>
                다음에 나오는 빵
              </span>
              {status && (
                <span className="inline-flex items-center gap-1.5" style={{ color: C.muted }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: status.open ? "#3f8a3a" : C.kraftDeep }} aria-hidden />
                  {status.text}
                </span>
              )}
            </div>
            {next && clock ? (
              <>
                <p className="mt-2 flex items-baseline justify-between gap-3">
                  <span className="text-[24px] font-bold tracking-[-0.02em]">{BREAD_BY_ID[next.bread].name}</span>
                  <span className="text-[15px] font-semibold tabular-nums" style={{ color: C.crustDeep }}>
                    {hhmm(next.at)}, {untilText(next.at - clock.m)}
                  </span>
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: C.kraft }} role="img" aria-label={`다음 빵까지 ${Math.round(progress * 100)}% 지났습니다`}>
                  <div className="h-full rounded-full" style={{ width: `${Math.max(4, progress * 100)}%`, background: `linear-gradient(90deg, ${C.butter}, ${C.crust})` }} />
                </div>
              </>
            ) : (
              <p className="mt-2 text-[17px]" style={{ color: C.ink }}>
                {clock
                  ? clock.day === 1
                    ? "월요일은 쉽니다. 화요일 아침 8시 소금빵부터 나옵니다."
                    : `오늘 나올 빵은 모두 나왔어요. ${clock.day === 0 ? "화요일" : "내일"} 아침 8시 소금빵부터 나옵니다.`
                  : "\u00a0"}
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#oven" className="inline-flex h-12 items-center rounded-full px-6 font-semibold" style={{ background: C.butter, color: C.ink }}>
              빵 나오는 시간 보기
            </a>
            <a href="#order" className="inline-flex h-12 items-center rounded-full border px-6 font-semibold text-white" style={{ borderColor: "rgba(255,255,255,0.6)" }}>
              미리 담아 두기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ id, tag, title, desc }: { id: string; tag: string; title: string; desc?: string }) {
  return (
    <div>
      <p className="inline-block rounded-full px-3 py-1 text-[14px] font-semibold" style={{ background: C.butterSoft, color: C.crustDeep }}>
        {tag}
      </p>
      <h2 id={id} className="mt-3 text-[28px] font-bold leading-[1.35] tracking-[-0.03em] md:text-[38px]">
        {title}
      </h2>
      {desc && (
        <p className="mt-3 max-w-[640px]" style={{ color: C.muted }}>
          {desc}
        </p>
      )}
    </div>
  );
}

/* ---------- 오븐 시계 ---------- */

const CX = 170;
const CY = 170;

function polar(m: number, r: number) {
  const a = ((m - OPEN) / (CLOSE - OPEN)) * Math.PI * 2 - Math.PI / 2;
  // 서버와 브라우저의 소수점 끝자리 차이로 하이드레이션이 어긋나지 않게 반올림한다
  return { x: Math.round((CX + Math.cos(a) * r) * 100) / 100, y: Math.round((CY + Math.sin(a) * r) * 100) / 100 };
}

function OvenClock({ clock, selected, onSelect }: { clock: Clock; selected: number; onSelect: (i: number) => void }) {
  const reduce = useReducedMotionSafe();
  const next = nextBatch(clock);
  const showHand = clock && clock.day !== 1 && clock.m >= OPEN && clock.m < CLOSE;
  const hand = showHand ? { a: polar(clock.m, 104), b: polar(clock.m, 150) } : null;
  const sel = BATCHES[selected];
  const selState = batchState(sel, clock);

  return (
    <svg viewBox="0 0 340 340" className="mx-auto h-auto w-full max-w-[440px]" role="group" aria-label="오늘 빵 나오는 시간을 그린 시계">
      <circle cx={CX} cy={CY} r="160" fill={C.paper} stroke={C.line} />
      <circle cx={CX} cy={CY} r="128" fill="none" stroke={C.kraft} strokeWidth="18" />
      {showHand && clock && (
        <path
          d={describeArc(OPEN, clock.m, 128)}
          fill="none"
          stroke={C.butterSoft}
          strokeWidth="18"
          strokeLinecap="butt"
        />
      )}
      {Array.from({ length: 13 }, (_, i) => OPEN + i * 60)
        .slice(0, 12)
        .map((m) => {
          const p = polar(m, 150);
          return (
            <g key={m} aria-hidden>
              <text x={p.x} y={p.y + 4} fontSize="11" textAnchor="middle" fill={C.muted} fontWeight={600}>
                {m / 60}
              </text>
            </g>
          );
        })}

      {BATCHES.map((b, i) => {
        const s = batchState(b, clock);
        const p = polar(b.at, 128);
        const isNext = next === b;
        const done = s.kind === "out";
        const soldOut = s.kind === "out" && s.left === 0;
        const label = `${hhmm(b.at)} ${BREAD_BY_ID[b.bread].name}${stateText(s) ? `, ${stateText(s)}` : ""}`;
        return (
          <g
            key={b.at}
            role="button"
            tabIndex={0}
            aria-label={label}
            aria-pressed={selected === i}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(i);
              }
            }}
            className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-[#2b1e14]"
          >
            <circle cx={p.x} cy={p.y} r="16" fill="transparent" stroke="transparent" strokeWidth="2" />
            {isNext && !reduce && (
              <motion.circle
                cx={p.x}
                cy={p.y}
                r="9"
                fill="none"
                stroke={C.butter}
                strokeWidth="3"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
                animate={{ scale: [1, 1.9], opacity: [0.9, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={selected === i ? 10 : 7.5}
              fill={soldOut ? C.kraftDeep : done ? C.crust : isNext ? C.butter : C.paper}
              stroke={selected === i ? C.ink : done ? C.crust : C.crustDeep}
              strokeWidth={selected === i ? 2.5 : 1.8}
            />
          </g>
        );
      })}

      {hand && (
        <g aria-hidden pointerEvents="none">
          <line x1={hand.a.x} y1={hand.a.y} x2={hand.b.x} y2={hand.b.y} stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
          <circle cx={hand.a.x} cy={hand.a.y} r="3.5" fill={C.ink} />
        </g>
      )}

      <foreignObject x={CX - 78} y={CY - 52} width="156" height="104">
        <div className="flex h-full flex-col items-center justify-center text-center" aria-live="polite">
          <span className="text-[12px] font-semibold tabular-nums" style={{ color: C.crust }}>
            {hhmm(sel.at)}
          </span>
          <span className="text-[17px] font-bold leading-[1.3] tracking-[-0.02em]" style={{ color: C.ink }}>
            {BREAD_BY_ID[sel.bread].name}
          </span>
          <span className="mt-0.5 text-[12px] leading-[1.4]" style={{ color: C.muted }}>
            {stateText(selState) || `${sel.qty}개 굽습니다`}
          </span>
        </div>
      </foreignObject>
    </svg>
  );
}

function describeArc(from: number, to: number, r: number) {
  const a = polar(from, r);
  const b = polar(to, r);
  const large = (to - from) / (CLOSE - OPEN) > 0.5 ? 1 : 0;
  return `M${a.x} ${a.y} A${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

function Oven({ clock: realClock, onAdd }: { clock: Clock; onAdd: (id: string) => void }) {
  const [preview, setPreview] = useState<number | null>(null);
  const clock: Clock = preview === null ? realClock : { day: realClock && realClock.day !== 1 ? realClock.day : 2, m: preview };
  const next = nextBatch(clock);
  const [picked, setPicked] = useState<number | null>(null);
  const selected = picked ?? (next ? BATCHES.indexOf(next) : 0);
  const [view, setView] = useState<"all" | "soon" | "out">("all");

  const rows = BATCHES.map((b, i) => ({ b, i, s: batchState(b, clock) })).filter(({ s }) =>
    view === "all" ? true : view === "soon" ? s.kind === "soon" : s.kind === "out" && s.left > 0,
  );

  const sel = BATCHES[selected];
  const bread = BREAD_BY_ID[sel.bread];

  return (
    <section aria-labelledby="oven-title" id="oven" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="oven-title"
          tag="빵 나오는 시간"
          title="오늘은 어떤 빵이 언제 나올까요"
          desc="시계 한 바퀴가 아침 8시부터 저녁 8시까지입니다. 바늘이 지나간 점은 이미 나온 빵이고, 점을 누르면 남은 개수를 볼 수 있습니다."
        />
        <div className="mt-10 grid items-start gap-10 md:grid-cols-[1.05fr_1fr] md:gap-14">
          <div>
            <OvenClock clock={clock} selected={selected} onSelect={setPicked} />
            <div className="mx-auto mt-4 max-w-[440px]">
              <div className="flex items-center justify-between text-[15px]">
                <label htmlFor="oven-time" className="font-semibold">
                  다른 시간으로 보기
                </label>
                <span className="flex items-center gap-2">
                  <span className="font-bold tabular-nums" style={{ color: C.crust }}>
                    {clock ? hhmm(clock.m) : ""}
                  </span>
                  {preview !== null && (
                    <button type="button" onClick={() => setPreview(null)} className="h-8 rounded-full border px-3 text-[14px] font-semibold" style={{ borderColor: C.line, background: C.paper }}>
                      지금으로
                    </button>
                  )}
                </span>
              </div>
              <input
                id="oven-time"
                type="range"
                min={OPEN}
                max={CLOSE - 10}
                step={10}
                value={clock ? Math.min(CLOSE - 10, Math.max(OPEN, clock.m)) : OPEN}
                onChange={(e) => {
                  setPreview(Number(e.target.value));
                  setPicked(null);
                }}
                aria-valuetext={clock ? hhmm(clock.m) : undefined}
                className="mt-2 w-full accent-[#9a4f1c]"
              />
            </div>
            <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[14px]" style={{ color: C.muted }} aria-label="점 색깔 설명">
              <li className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: C.crust }} aria-hidden />
                나온 빵
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: C.butter }} aria-hidden />
                다음 빵
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2" style={{ borderColor: C.crustDeep, background: C.paper }} aria-hidden />
                나올 빵
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: C.kraftDeep }} aria-hidden />
                다 팔림
              </li>
            </ul>
          </div>

          <div>
            <div className="rounded-[12px] border p-5" style={{ background: C.paper, borderColor: C.line }}>
              <div className="flex items-start gap-4">
                <svg viewBox="-40 -30 80 60" className="h-[60px] w-[80px] shrink-0" aria-hidden>
                  <BreadShape shape={bread.shape} color={bread.color} />
                </svg>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold tabular-nums" style={{ color: C.crust }}>
                    {hhmm(sel.at)}에 {sel.qty}개
                  </p>
                  <p className="text-[21px] font-bold tracking-[-0.02em]">{bread.name}</p>
                  <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                    {bread.desc}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4" style={{ borderColor: C.line }}>
                <span className="font-bold tabular-nums">{won(bread.price)}</span>
                <button
                  type="button"
                  onClick={() => onAdd(bread.id)}
                  className="inline-flex h-11 items-center gap-1.5 rounded-full px-5 text-[15px] font-semibold"
                  style={{ background: C.crust, color: "#fff" }}
                >
                  <Plus size={17} aria-hidden />
                  쟁반에 담기
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-2" role="group" aria-label="목록 보기">
              {(
                [
                  ["all", "전체"],
                  ["soon", "나올 빵"],
                  ["out", "지금 있는 빵"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className="h-10 rounded-full border px-4 text-[15px] font-semibold transition-colors"
                  style={view === v ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line, color: C.muted, background: C.paper }}
                >
                  {label}
                </button>
              ))}
            </div>
            <ul className="mt-3 max-h-[340px] overflow-y-auto rounded-[12px] border" style={{ borderColor: C.line, background: C.paper }}>
              {rows.length === 0 && (
                <li className="px-4 py-6 text-center text-[15px]" style={{ color: C.muted }}>
                  {view === "soon" ? "오늘 나올 빵은 모두 나왔어요." : "지금 남은 빵이 없어요."}
                </li>
              )}
              {rows.map(({ b, i, s }) => (
                <li key={b.at} className="border-b last:border-b-0" style={{ borderColor: C.line }}>
                  <button
                    type="button"
                    onClick={() => setPicked(i)}
                    aria-pressed={selected === i}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fbf3e2]"
                    style={selected === i ? { background: C.butterSoft } : undefined}
                  >
                    <span className="w-[48px] shrink-0 text-[15px] font-semibold tabular-nums" style={{ color: C.crust }}>
                      {hhmm(b.at)}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-semibold">{BREAD_BY_ID[b.bread].name}</span>
                    <span className="shrink-0 text-[14px]" style={{ color: s.kind === "out" && s.left === 0 ? C.kraftDeep : C.muted }}>
                      {stateText(s)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 빵 그림 ---------- */

function BreadShape({ shape, color }: { shape: Shape; color: string }) {
  const shade = "rgba(80,40,10,0.35)";
  const shine = "rgba(255,240,200,0.55)";
  switch (shape) {
    case "crescent":
      return (
        <g>
          <path d="M-30 10 Q-18 -22 0 -20 Q18 -22 30 10 Q20 4 12 6 Q0 -2 -12 6 Q-20 4 -30 10Z" fill={color} />
          <path d="M-10 -14 L-6 4 M0 -18 V0 M10 -14 L6 4" stroke={shade} strokeWidth="2" strokeLinecap="round" />
          <path d="M-14 -12 Q-4 -18 6 -16" stroke={shine} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case "loaf":
      return (
        <g>
          <ellipse cx="0" cy="2" rx="32" ry="18" fill={color} />
          <path d="M-16 -6 Q-12 4 -8 10 M-2 -10 Q2 2 6 10 M12 -8 Q15 0 18 6" stroke="#f3e2c0" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case "ring":
      return (
        <g>
          <circle cx="0" cy="0" r="21" fill={color} />
          <circle cx="0" cy="0" r="7" fill={C.kraft} />
          <path d="M-14 -10 Q-4 -18 8 -16" stroke={shine} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case "bar":
      return (
        <g>
          <rect x="-24" y="-12" width="48" height="24" rx="5" fill={color} />
          <rect x="-20" y="-8" width="40" height="5" rx="2.5" fill={shine} />
        </g>
      );
    case "tart":
      return (
        <g>
          <circle cx="0" cy="0" r="21" fill="#d9a35a" />
          <circle cx="0" cy="0" r="15" fill={color} />
          <circle cx="-4" cy="-3" r="5" fill="#b8641c" opacity="0.6" />
        </g>
      );
    case "block":
      return (
        <g>
          <path d="M-24 18 V-6 Q-24 -20 -10 -20 Q0 -26 10 -20 Q24 -20 24 -6 V18Z" fill={color} />
          <path d="M-18 -8 Q0 -16 18 -8" stroke={shine} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g>
          <ellipse cx="0" cy="2" rx="25" ry="20" fill={color} />
          <ellipse cx="-6" cy="-6" rx="10" ry="5" fill={shine} />
          <circle cx="4" cy="2" r="1.6" fill={shade} />
          <circle cx="-2" cy="6" r="1.6" fill={shade} />
        </g>
      );
  }
}

const TRAY_SLOTS = Array.from({ length: 12 }, (_, i) => ({ x: 62 + (i % 4) * 79, y: 60 + Math.floor(i / 4) * 60 }));

function Tray({ items }: { items: string[] }) {
  const reduce = useReducedMotionSafe();
  const shown = items.slice(0, 12);
  return (
    <svg viewBox="0 0 360 230" className="h-auto w-full" role="img" aria-label={items.length ? `쟁반에 빵 ${items.length}개` : "빈 쟁반"}>
      <rect x="6" y="10" width="348" height="210" rx="20" fill="#b07a4c" />
      <rect x="18" y="22" width="324" height="186" rx="12" fill={C.kraft} />
      <path d="M40 40 L90 70 M150 30 L190 60 M250 48 L300 30 M60 170 L110 190 M220 180 L280 160" stroke={C.kraftDeep} strokeWidth="1" opacity="0.6" />
      {items.length === 0 && (
        <text x="180" y="122" textAnchor="middle" fontSize="15" fill={C.muted}>
          고른 빵이 여기에 놓여요
        </text>
      )}
      <AnimatePresence>
        {shown.map((id, i) => {
          const b = BREAD_BY_ID[id];
          const slot = TRAY_SLOTS[i];
          return (
            <motion.g
              key={`${id}-${i}`}
              initial={reduce ? false : { opacity: 0, y: -36, scale: 1.15 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <g transform={`translate(${slot.x} ${slot.y}) scale(0.9)`}>
                <BreadShape shape={b.shape} color={b.color} />
              </g>
            </motion.g>
          );
        })}
      </AnimatePresence>
      {items.length > 12 && (
        <g>
          <rect x="272" y="184" width="66" height="26" rx="13" fill={C.ink} />
          <text x="305" y="202" textAnchor="middle" fontSize="13" fill="#fff" fontWeight={700}>
            +{items.length - 12}개
          </text>
        </g>
      )}
    </svg>
  );
}

/* ---------- 미리 담기 ---------- */

const SLOTS = Array.from({ length: 23 }, (_, i) => 510 + i * 30); // 08:30 ~ 19:30

function Order({
  clock,
  cart,
  onAdd,
  onClear,
}: {
  clock: Clock;
  cart: Record<string, number>;
  onAdd: (id: string, delta: number) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [exclude, setExclude] = useState<Allergen[]>([]);
  const [dayPick, setDayPick] = useState<"today" | "tomorrow" | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ no: string; items: [string, number][]; day: string; slot: number; name: string; phone: string } | null>(null);

  const list = BREADS.filter((b) => (!query.trim() || b.name.includes(query.trim())) && !b.allergens.some((a) => exclude.includes(a)));
  const items = Object.entries(cart);
  const trayItems = items.flatMap(([id, n]) => Array.from({ length: n }, () => id));
  const total = items.reduce((sum, [id, n]) => sum + BREAD_BY_ID[id].price * n, 0);
  const earliest = items.length ? Math.max(...items.map(([id]) => FIRST_AT[id])) : 0;
  const latestBread = items.find(([id]) => FIRST_AT[id] === earliest)?.[0];

  const todayOk = clock ? clock.day !== 1 && clock.m < CLOSE - 60 : true;
  const tomorrowOk = clock ? (clock.day + 1) % 7 !== 1 : true;
  const day = dayPick ?? (todayOk ? "today" : "tomorrow");

  const slotState = (s: number) => {
    if (day === "today" && !todayOk) return "closed";
    if (day === "tomorrow" && !tomorrowOk) return "closed";
    if (day === "today" && clock && s < clock.m + 30) return "past";
    if (s < earliest) return "baking";
    return "ok";
  };
  const activeSlot = slot !== null && slotState(slot) === "ok" ? slot : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return setError("빵을 하나 이상 담아 주세요.");
    if (activeSlot === null) return setError("찾으러 오실 시간을 골라 주세요.");
    if (name.trim().length < 2) return setError("이름을 두 글자 이상 적어 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setError("연락받을 휴대전화 번호를 적어 주세요.");
    setError("");
    const now = new Date();
    const dayLabel =
      day === "today" ? `오늘 (${DAY_NAMES[now.getDay()]})` : `내일 (${DAY_NAMES[(now.getDay() + 1) % 7]})`;
    setReceipt({
      no: `B-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes() * 7 + now.getSeconds()).padStart(3, "0")}`,
      items,
      day: dayLabel,
      slot: activeSlot,
      name: maskName(name),
      phone: maskPhone(phone),
    });
  };

  const closeReceipt = () => {
    setReceipt(null);
    onClear();
    setSlot(null);
    setName("");
    setPhone("");
  };

  return (
    <section aria-labelledby="order-title" id="order" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.kraft }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="order-title"
          tag="미리 담기"
          title="쟁반에 담아 두면 따로 챙겨 둘게요"
          desc="찾으러 오실 시간은 고른 빵이 처음 나오는 시간 뒤로만 고를 수 있습니다. 값은 가게에서 치릅니다."
        />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
          <div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="relative block md:w-[260px]">
                <span className="sr-only">빵 이름 검색</span>
                <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="빵 이름 검색"
                  className="h-11 w-full rounded-full border pl-10 pr-4 text-[16px] outline-none focus:border-[#9a4f1c]"
                  style={{ borderColor: C.kraftDeep, background: C.paper }}
                />
              </label>
              <div className="flex flex-wrap gap-2" role="group" aria-label="빼고 싶은 재료">
                {ALLERGENS.map((a) => {
                  const on = exclude.includes(a.id);
                  const Icon = on ? a.off : a.on;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setExclude((prev) => (on ? prev.filter((x) => x !== a.id) : [...prev, a.id]))}
                      className="inline-flex h-11 items-center gap-1.5 rounded-full border px-3.5 text-[15px] font-semibold transition-colors"
                      style={on ? { background: C.ink, color: "#fff", borderColor: C.ink } : { background: C.paper, borderColor: C.kraftDeep, color: C.ink }}
                    >
                      <Icon size={17} aria-hidden />
                      {a.label} 빼고
                    </button>
                  );
                })}
              </div>
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((b) => {
                const n = cart[b.id] ?? 0;
                return (
                  <li key={b.id} className="flex flex-col rounded-[12px] border p-4" style={{ background: C.paper, borderColor: n ? C.crust : C.line }}>
                    <div className="flex items-start gap-3">
                      <svg viewBox="-40 -30 80 60" className="h-[45px] w-[60px] shrink-0" aria-hidden>
                        <BreadShape shape={b.shape} color={b.color} />
                      </svg>
                      <div className="min-w-0">
                        <p className="font-bold leading-[1.4]">{b.name}</p>
                        <p className="text-[14px] tabular-nums" style={{ color: C.muted }}>
                          {won(b.price)}, {hhmm(FIRST_AT[b.id])}부터
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="flex gap-1" aria-label={`들어간 재료: ${b.allergens.map((a) => ALLERGENS.find((x) => x.id === a)!.label).join(", ")}`}>
                        {ALLERGENS.filter((a) => b.allergens.includes(a.id)).map((a) => (
                          <span key={a.id} className="inline-flex h-6 w-6 items-center justify-center rounded-full" style={{ background: C.cream, color: C.muted }} title={a.label}>
                            <a.on size={13} aria-hidden />
                          </span>
                        ))}
                      </span>
                      <span className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onAdd(b.id, -1)}
                          disabled={!n}
                          aria-label={`${b.name} 하나 빼기`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border disabled:opacity-30"
                          style={{ borderColor: C.kraftDeep }}
                        >
                          <Minus size={16} aria-hidden />
                        </button>
                        <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">
                          {n}
                        </span>
                        <button
                          type="button"
                          onClick={() => onAdd(b.id, 1)}
                          aria-label={`${b.name} 하나 담기`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                          style={{ background: C.crust, color: "#fff" }}
                        >
                          <Plus size={16} aria-hidden />
                        </button>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
            {list.length === 0 && (
              <p className="mt-6 rounded-[12px] p-6 text-center" style={{ background: C.paper, color: C.muted }}>
                맞는 빵이 없어요. 빼는 재료를 줄여 보세요.
              </p>
            )}
            <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
              모든 빵을 같은 작업대에서 만들어 다른 재료가 조금 섞일 수 있습니다.
            </p>
          </div>

          <form onSubmit={submit} className="rounded-[16px] p-5 lg:sticky lg:top-20" style={{ background: C.paper }} noValidate>
            <Tray items={trayItems} />
            {items.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-[15px]">
                {items.map(([id, n]) => (
                  <li key={id} className="flex justify-between gap-3">
                    <span>
                      {BREAD_BY_ID[id].name} <span style={{ color: C.muted }}>{n}개</span>
                    </span>
                    <span className="tabular-nums">{won(BREAD_BY_ID[id].price * n)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 flex justify-between border-t pt-3 font-bold" style={{ borderColor: C.line }}>
              <span>합계</span>
              <span className="tabular-nums">{won(total)}</span>
            </p>

            <fieldset className="mt-5">
              <legend className="text-[15px] font-semibold">찾으러 오실 때</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(
                  [
                    ["today", "오늘", todayOk, clock?.day === 1 ? "쉬는 날" : "마감"],
                    ["tomorrow", "내일", tomorrowOk, "쉬는 날"],
                  ] as const
                ).map(([v, label, ok, why]) => (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={day === v}
                    disabled={!ok}
                    onClick={() => setDayPick(v)}
                    className="h-11 rounded-[8px] border text-[15px] font-semibold disabled:opacity-35"
                    style={day === v ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line }}
                  >
                    {label}
                    {!ok && ` (${why})`}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5" role="group" aria-label="찾으러 오실 시간">
                {SLOTS.map((s) => {
                  const st = slotState(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={st !== "ok"}
                      aria-pressed={activeSlot === s}
                      onClick={() => setSlot(s)}
                      className="h-10 rounded-[6px] border text-[14px] font-semibold tabular-nums disabled:cursor-not-allowed"
                      style={
                        activeSlot === s
                          ? { background: C.crust, color: "#fff", borderColor: C.crust }
                          : st === "ok"
                            ? { borderColor: C.line, background: C.paper }
                            : { borderColor: "transparent", background: C.cream, color: "#b5a796", textDecoration: st === "baking" ? "none" : "line-through" }
                      }
                    >
                      {hhmm(s)}
                    </button>
                  );
                })}
              </div>
              {latestBread && earliest > SLOTS[0] && (
                <p className="mt-2 text-[14px]" style={{ color: C.crustDeep }}>
                  {BREAD_BY_ID[latestBread].name}
                  {iGa(BREAD_BY_ID[latestBread].name)} {hhmm(earliest)}에 나와서 그 뒤로 고를 수 있어요.
                </p>
              )}
            </fieldset>

            <div className="mt-5 grid gap-3">
              <label className="block">
                <span className="text-[15px] font-semibold">이름</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="mt-1 h-11 w-full rounded-[8px] border px-3 outline-none focus:border-[#9a4f1c]"
                  style={{ borderColor: C.line }}
                  placeholder="김하늘"
                />
              </label>
              <label className="block">
                <span className="text-[15px] font-semibold">휴대전화</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  className="mt-1 h-11 w-full rounded-[8px] border px-3 outline-none focus:border-[#9a4f1c]"
                  style={{ borderColor: C.line }}
                  placeholder="010-1234-5678"
                />
              </label>
            </div>
            {error && (
              <p className="mt-3 text-[15px] font-semibold" style={{ color: "#b3261e" }} role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="mt-5 h-12 w-full rounded-full font-semibold" style={{ background: C.crust, color: "#fff" }}>
              담아 두기
            </button>
          </form>
        </div>
      </div>
      <Receipt data={receipt} onClose={closeReceipt} />
    </section>
  );
}

function Receipt({
  data,
  onClose,
}: {
  data: { no: string; items: [string, number][]; day: string; slot: number; name: string; phone: string } | null;
  onClose: () => void;
}) {
  const reduce = useReducedMotionSafe();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!data) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, onClose]);

  const total = useMemo(() => (data ? data.items.reduce((s, [id, n]) => s + BREAD_BY_ID[id].price * n, 0) : 0), [data]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(43,30,20,0.55)" }}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="receipt-title"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[360px] px-6 pb-8 pt-7"
            style={{
              background: "#fffefa",
              clipPath: "polygon(0 0,100% 0,100% calc(100% - 10px),95% 100%,90% calc(100% - 10px),85% 100%,80% calc(100% - 10px),75% 100%,70% calc(100% - 10px),65% 100%,60% calc(100% - 10px),55% 100%,50% calc(100% - 10px),45% 100%,40% calc(100% - 10px),35% 100%,30% calc(100% - 10px),25% 100%,20% calc(100% - 10px),15% 100%,10% calc(100% - 10px),5% 100%,0 calc(100% - 10px))",
            }}
            initial={reduce ? false : { y: -60, clipPath: "inset(0 0 100% 0)" }}
            animate={{ y: 0, clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full"
              style={{ color: C.muted }}
            >
              <X size={20} aria-hidden />
            </button>
            <p className="text-center">
              <Logo />
            </p>
            <h3 id="receipt-title" className="mt-3 flex items-center justify-center gap-1.5 text-[18px] font-bold">
              <Check size={20} style={{ color: "#3f8a3a" }} aria-hidden />
              담아 두었어요
            </h3>
            <dl className="mt-4 space-y-1 border-y border-dashed py-3 text-[15px] tabular-nums" style={{ borderColor: C.kraftDeep }}>
              {[
                ["주문번호", data.no],
                ["찾는 날", data.day],
                ["찾는 시간", hhmm(data.slot)],
                ["이름", data.name],
                ["연락처", data.phone],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt style={{ color: C.muted }}>{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-3 space-y-1 text-[15px] tabular-nums">
              {data.items.map(([id, n]) => (
                <li key={id} className="flex justify-between gap-3">
                  <span>
                    {BREAD_BY_ID[id].name} x{n}
                  </span>
                  <span>{won(BREAD_BY_ID[id].price * n)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex justify-between border-t border-dashed pt-3 text-[17px] font-bold tabular-nums" style={{ borderColor: C.kraftDeep }}>
              <span>합계</span>
              <span>{won(total)}</span>
            </p>
            <p className="mt-4 text-center text-[14px]" style={{ color: C.muted }}>
              값은 찾으러 오실 때 치릅니다. 30분이 지나면 진열대로 돌려놓아요.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- 가게 이야기 ---------- */

function Story() {
  return (
    <section aria-labelledby="story-title" id="story" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 md:grid-cols-2 md:gap-14">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[16px]">
          <Image src={`${IMG}/display.jpg`} alt="크루아상, 깜파뉴, 크림빵, 과일 타르트가 놓인 진열대" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <SectionHead id="story-title" tag="가게 이야기" title="그날 구운 빵만 팝니다" />
          <dl className="mt-8 space-y-6">
            {[
              ["새벽 4시", "두 사람이 반죽을 시작합니다. 깜파뉴 반죽은 이틀 전에 미리 만들어 둡니다."],
              ["오후 5시", "마지막 소금빵이 나옵니다. 그 뒤로는 굽지 않고 남은 빵만 팝니다."],
              ["저녁 7시", "남은 빵은 30% 싸게 팔고, 문 닫을 때 남은 빵은 동네 지역아동센터에 보냅니다."],
            ].map(([t, d]) => (
              <div key={t} className="grid grid-cols-[88px_1fr] gap-4 border-t pt-5" style={{ borderColor: C.line }}>
                <dt className="font-bold tabular-nums" style={{ color: C.crust }}>
                  {t}
                </dt>
                <dd style={{ color: C.muted }}>{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

const HOURS = [
  { label: "화요일 ~ 일요일", time: "08:00 ~ 20:00" },
  { label: "월요일", time: "쉽니다" },
];

function MiniMap() {
  return (
    <svg viewBox="0 0 640 380" className="h-auto w-full" role="img" aria-label="□□역 2번 출구에서 빵집까지 가는 약도">
      <rect width="640" height="380" fill={C.paper} />
      <path d="M0 110 H640" stroke={C.line} strokeWidth="28" />
      <path d="M200 0 V380" stroke={C.line} strokeWidth="22" />
      <path d="M200 250 H640" stroke={C.line} strokeWidth="14" />
      <text x="20" y="90" fontSize="15" fill={C.muted}>
        □□대로
      </text>
      <text x="420" y="236" fontSize="15" fill={C.muted}>
        □□로 5길
      </text>
      <circle cx="120" cy="110" r="16" fill={C.crust} />
      <text x="120" y="115" fontSize="13" fill="#fff" textAnchor="middle" fontWeight={700}>
        2
      </text>
      <text x="74" y="156" fontSize="15" fill={C.ink}>
        □□역 2번 출구
      </text>
      <path d="M138 110 H200 V250 H452" stroke={C.crust} strokeWidth="3" strokeDasharray="6 7" fill="none" />
      <circle cx="470" cy="250" r="20" fill={C.butter} stroke={C.crust} strokeWidth="3" />
      <text x="430" y="300" fontSize="16" fill={C.ink} fontWeight={700}>
        {BAKERY}
      </text>
      <rect x="520" y="300" width="96" height="56" rx="6" fill={C.kraft} />
      <text x="568" y="333" fontSize="13" fill={C.muted} textAnchor="middle">
        공영주차장
      </text>
    </svg>
  );
}

function Location({ clock }: { clock: Clock }) {
  const status = shopStatus(clock);
  return (
    <section aria-labelledby="location-title" id="location" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.kraft }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="location-title" tag="오시는 길" title="오시는 길과 영업시간" />
        <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: C.line }}>
            <MiniMap />
          </div>
          <div>
            <p className="text-[22px] font-bold tracking-[-0.02em]">{ADDRESS}</p>
            <ul className="mt-5 space-y-4">
              {[
                { icon: TrainFront, title: "지하철", body: "□□역 2번 출구에서 걸어서 5분" },
                { icon: Car, title: "주차", body: "가게 앞 주차는 어렵습니다. 50m 옆 □□동 공영주차장을 이용해 주세요." },
              ].map((r) => (
                <li key={r.title} className="flex gap-3">
                  <r.icon size={20} className="mt-1 shrink-0" style={{ color: C.crust }} aria-hidden />
                  <span>
                    <span className="font-semibold">{r.title}</span>
                    <span className="block text-[15px]" style={{ color: C.muted }}>
                      {r.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <table className="mt-7 w-full border-t text-[15px]" style={{ borderColor: C.kraftDeep }}>
              <caption className="sr-only">영업시간</caption>
              <tbody>
                {HOURS.map((h) => (
                  <tr key={h.label} className="border-b" style={{ borderColor: C.kraftDeep }}>
                    <th scope="row" className="py-3 text-left font-normal" style={{ color: C.muted }}>
                      {h.label}
                    </th>
                    <td className="py-3 text-right font-semibold">{h.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {status && (
              <p className="mt-3 text-[15px] font-semibold" style={{ color: status.open ? "#2f6b2b" : C.crustDeep }}>
                {status.text}
              </p>
            )}
            <a href={`tel:${TEL}`} className="mt-6 inline-flex h-12 items-center rounded-full px-6 font-semibold" style={{ background: C.crust, color: "#fff" }}>
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
    <footer className="px-4 pb-24 pt-12 md:px-6" style={{ background: C.crustDeep, color: "#fbeee0" }}>
      <div className="mx-auto max-w-[1200px]">
        <Logo light />
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: "#e2c8ad" }}>
          {[
            ["상호", BAKERY],
            ["대표자", "이○○"],
            ["사업자등록번호", "000-00-00000"],
            ["주소", ADDRESS],
            ["전화", TEL],
            ["이메일", "hello@example.com"],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt>{k}</dt>
              <dd style={{ color: "#fff" }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </footer>
  );
}
