"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Car, Check, ChevronRight, Clock3, Menu, Minus, Phone, Plus, ShoppingBag, TrainFront, Trash2, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, fmtKo, useDemoToday } from "@/hooks/useDemoToday";

/* 베이커리 카페 홈페이지 데모: 가상의 곰파트너 베이커리.
   상호, 대표자, 주소, 전화번호, 사업자 정보, 빵 이름과 가격은 모두 가상이다.

   뼈대: 매장 주문형. 옵스·나폴레옹과자점 같은 실제 베이커리 사이트처럼
   큰 사진 한 장 > 오늘 빵 나오는 시간 > 분류 탭과 상품 격자 > 소개 > 매장안내 순서다.
   빵을 담으면 화면 아래에 담기 바가 뜨고, 예약하기를 누르면 같은 페이지 안에서 예약 주문 화면으로 바뀐다.
   담기 바는 사이트 공용 버튼(왼쪽 아래, 오른쪽 아래)보다 위에 띄운다.

   디자인: 크림색 바탕(#fbf6ec)에 빵 껍질 갈색(#9a4f1c), 버터 노랑(#f2c14e), 크라프트지(#efe3cb).
   예약 확인은 영수증 모양으로 보여 준다.

   빵 나오는 시간은 8시부터 20시까지를 한 바퀴로 그린 오븐 시계에 점으로 찍는다.
   상품 카드에는 같은 계산으로 판매 중·남은 개수·나오는 시간을 글자로 적고, 품절만 배지로 띄운다.
   픽업 시간은 담은 빵이 처음 나오는 시간 뒤로만 고를 수 있다.

   사진 출처(public/images/demo-bakery):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, display, menu/*.jpg(빵마다 1장) */

const IMG = "/images/demo-bakery";
const BAKERY = "곰파트너 베이커리";
const TEL = "02-000-0000";
const ADDRESS = "ㅁㄹ시 ㅎㄷ로 5길 21 1층";

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
  green: "#2f6b2b",
  greenSoft: "#e4efdc",
};

const EASE = [0.22, 1, 0.36, 1] as const;

type View = "home" | "oven-time" | "menu-all" | "pickup" | "group" | "about" | "notice" | "store";

/* 하위 화면 묶음: 상단 메뉴 하나에 하위 화면 하나 이상 (몽소·삼송빵집 메뉴 구성 기준) */
const GROUPS: { id: string; label: string; items: { id: View; label: string }[] }[] = [
  { id: "oven", label: "빵 나오는 시간", items: [{ id: "oven-time", label: "빵 나오는 시간" }] },
  { id: "menu", label: "메뉴", items: [{ id: "menu-all", label: "메뉴" }] },
  {
    id: "order",
    label: "예약 주문",
    items: [
      { id: "pickup", label: "픽업 예약" },
      { id: "group", label: "단체주문 예약" },
    ],
  },
  { id: "about", label: "매장 소개", items: [{ id: "about", label: "매장 소개" }] },
  { id: "notice", label: "공지사항", items: [{ id: "notice", label: "공지사항" }] },
  { id: "store", label: "매장안내", items: [{ id: "store", label: "매장안내" }] },
];

const SUB_VIEWS = GROUPS.flatMap((g) => g.items.map((it) => it.id));
const groupOf = (v: View) => GROUPS.find((g) => g.items.some((it) => it.id === v)) ?? null;

const NAV: { id: View; label: string }[] = GROUPS.map((g) => ({ id: g.items[0].id, label: g.label }));

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

type Clock = ReturnType<typeof clockOf>;

/* ---------- 빵 ---------- */

type Allergen = "milk" | "egg" | "nut" | "wheat";
type Cat = "meal" | "pastry" | "sweet" | "baked";

const CATS: { id: Cat | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "meal", label: "식빵·깜파뉴" },
  { id: "pastry", label: "페이스트리" },
  { id: "sweet", label: "단과자빵" },
  { id: "baked", label: "구움과자" },
];

interface Bread {
  id: string;
  name: string;
  price: number;
  cat: Cat;
  allergens: Allergen[];
  /** 몇 분마다 하나씩 팔리는지. 남은 개수 계산에만 쓴다. */
  sellEvery: number;
  desc: string;
}

const BREADS: Bread[] = [
  { id: "salt", name: "소금빵", price: 3200, cat: "pastry", allergens: ["milk", "wheat"], sellEvery: 5, desc: "프랑스산 버터를 넣고 돌소금을 올린 쫄깃 고소한 소금빵" },
  { id: "croissant", name: "크루아상", price: 4200, cat: "pastry", allergens: ["milk", "egg", "wheat"], sellEvery: 8, desc: "3일 동안 접어 만든 결이 살아 있는 버터 크루아상" },
  { id: "campagne", name: "깜파뉴", price: 7500, cat: "meal", allergens: ["wheat"], sellEvery: 25, desc: "통밀, 호밀, 천연발효종. 48시간 저온 숙성" },
  { id: "fig", name: "무화과 호두 깜파뉴", price: 8500, cat: "meal", allergens: ["wheat", "nut"], sellEvery: 25, desc: "반건조 무화과와 구운 호두 듬뿍." },
  { id: "bagel", name: "플레인 베이글", price: 3500, cat: "meal", allergens: ["wheat"], sellEvery: 12, desc: "겉은 단단하고 속은 쫄깃한 기본 베이글" },
  { id: "pretzel", name: "버터 프레첼", price: 4000, cat: "pastry", allergens: ["milk", "wheat"], sellEvery: 12, desc: "짭조름한 프레첼에 차가운 버터 한 조각" },
  { id: "redbean", name: "단팥빵", price: 3000, cat: "sweet", allergens: ["milk", "egg", "wheat"], sellEvery: 10, desc: "국산 팥으로 직접 만든 앙금, 덜 달게" },
  { id: "cream", name: "우유 크림빵", price: 3500, cat: "sweet", allergens: ["milk", "egg", "wheat"], sellEvery: 9, desc: "주문 즉시 우유 크림을 가득 채워 드려요" },
  { id: "milkbread", name: "우유식빵", price: 5500, cat: "meal", allergens: ["milk", "wheat"], sellEvery: 15, desc: "물 없이 우유로만 반죽한 결대로 찢어지는 식빵" },
  { id: "castella", name: "쌀 카스텔라", price: 6000, cat: "baked", allergens: ["milk", "egg"], sellEvery: 18, desc: "밀가루 없이 100% 쌀가루로 구운 카스텔라" },
  { id: "financier", name: "휘낭시에", price: 2500, cat: "baked", allergens: ["milk", "egg", "nut", "wheat"], sellEvery: 6, desc: "태운 버터와 아몬드 가루로 구운 휘낭시에" },
  { id: "tart", name: "에그타르트", price: 3000, cat: "sweet", allergens: ["milk", "egg", "wheat"], sellEvery: 7, desc: "바삭한 파이 반죽에 커스터드를 채운 에그타르트" },
];

const breadImg = (id: string) => `${IMG}/menu/${id}.jpg`;

const BREAD_BY_ID = Object.fromEntries(BREADS.map((b) => [b.id, b])) as Record<string, Bread>;

/** 몽소식 짧은 재료 표기 */
function allergyTags(b: Bread) {
  const tags: string[] = [];
  if (!b.allergens.includes("milk")) tags.push("우유 없음");
  if (!b.allergens.includes("egg")) tags.push("달걀 없음");
  tags.push(b.allergens.includes("wheat") ? "밀 함유" : "밀가루 없음");
  if (b.allergens.includes("nut")) tags.push("견과 함유");
  return tags;
}

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
      return "오늘 휴무";
    case "soon":
      return "나올 예정";
    case "out":
      return s.left > 0 ? `판매 중 · ${s.left}개 남음` : "품절";
  }
}

type BreadNow =
  | { kind: "unknown" }
  | { kind: "closed"; text: string }
  | { kind: "sale"; left: number; next: number | null }
  | { kind: "soon"; at: number }
  | { kind: "soldout" };

/** 상품 카드용: 그 빵의 모든 굽는 차례를 합쳐 지금 상태를 낸다. */
function breadNow(id: string, clock: Clock): BreadNow {
  if (!clock) return { kind: "unknown" };
  if (clock.day === 1) return { kind: "closed", text: "오늘 휴무" };
  if (clock.m >= CLOSE) return { kind: "closed", text: "영업 종료" };
  let left = 0;
  let next: number | null = null;
  for (const b of BATCHES) {
    if (b.bread !== id) continue;
    const s = batchState(b, clock);
    if (s.kind === "out") left += s.left;
    else if (s.kind === "soon" && next === null) next = b.at;
  }
  if (left > 0) return { kind: "sale", left, next };
  if (next !== null) return { kind: "soon", at: next };
  return { kind: "soldout" };
}

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/** 받침이 있으면 "은", 없으면 "는" */
function eunNeun(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code < 11172 && code % 28 ? "은" : "는";
}

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘 → 김ㅎ늘, 김솔 → 김* */
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

/* ---------- 페이지 ---------- */

type Cart = Record<string, number>;

export function BakeryCafeDemo() {
  const minute = useNowMinute();
  const clock = clockOf(minute);
  const [cart, setCart] = useState<Cart>({});
  const [view, setView] = useState<View>("home");
  const pending = useRef<string | null>(null);
  const [navTick, setNavTick] = useState(0);
  useEffect(() => {
    const f = () => {
      setView("home");
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const add = (id: string, delta: number) =>
    setCart((prev) => {
      const next = { ...prev, [id]: Math.max(0, Math.min(20, (prev[id] ?? 0) + delta)) };
      if (next[id] === 0) delete next[id];
      return next;
    });

  const count = Object.values(cart).reduce((s, n) => s + n, 0);
  const total = Object.entries(cart).reduce((s, [id, n]) => s + BREAD_BY_ID[id].price * n, 0);

  // 하위 화면에서 첫 화면 구간(빵 나오는 시간, 메뉴 등)을 누르면 첫 화면으로 돌아간 뒤 그 구간으로 내려간다
  useEffect(() => {
    const target = pending.current;
    if (view !== "home" || !target) return;
    pending.current = null;
    if (target === "top") window.scrollTo({ top: 0 });
    else document.getElementById(target)?.scrollIntoView({ block: "start" });
  }, [view, navTick]);

  const go = (target: string, tab: "pickup" | "group" = "pickup") => {
    const next = target === "order" ? (tab === "group" ? "group" : "pickup") : target;
    if (SUB_VIEWS.includes(next as View)) {
      setView(next as View);
      window.scrollTo({ top: 0 });
      return;
    }
    pending.current = target;
    setView("home");
    setNavTick((n) => n + 1);
  };

  let body: React.ReactNode = null;
  switch (view) {
    case "about":
      body = <AboutPage />;
      break;
    case "store":
      body = <StoreInfo />;
      break;
    case "menu-all":
      body = <MenuAllPage clock={clock} cart={cart} onAdd={add} />;
      break;
    case "oven-time":
      body = <OvenTimePage clock={clock} />;
      break;
    case "pickup":
      body = <PickupOrder clock={clock} cart={cart} onAdd={add} onClear={() => setCart({})} onBack={() => go("menu-all")} />;
      break;
    case "group":
      body = <GroupOrder minute={minute} />;
      break;
    case "notice":
      body = <NoticePage />;
      break;
  }

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.cream, color: C.ink }}>
      <Header view={view} count={count} onGo={go} />
      {view === "home" ? (
        <main key="home" className="soft-in">
          <Banner onGo={go} />
          <Oven clock={clock} onAdd={(id) => add(id, 1)} />
          <MenuGrid clock={clock} cart={cart} onAdd={add} onGo={go} />
          <Store />
        </main>
      ) : (
        <main key={view} className="soft-in">
          <SubPage view={view} onGo={go}>
            {body}
          </SubPage>
        </main>
      )}
      <Footer />
      <CartBar show={(view === "home" || view === "menu-all" || view === "oven-time") && count > 0} count={count} total={total} onOrder={() => go("order")} />
    </div>
  );
}

/* ---------- 로고, 머리글 ---------- */

function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.svg" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-[19px] font-bold tracking-[-0.02em]">곰파트너</span>
        <span className="text-[12px] font-semibold opacity-80">베이커리</span>
      </span>
    </span>
  );
}

function Header({ view, count, onGo }: { view: View; count: number; onGo: (target: string) => void }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();
  useEffect(() => {
    const f = () => {
      setOpen(false);
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const navLink = (n: { id: View; label: string }, cls: string) => {
    const current = view !== "home" && groupOf(view)?.id === groupOf(n.id)?.id;
    return (
      <button
        type="button"
        aria-current={current ? "page" : undefined}
        onClick={() => {
          setOpen(false);
          onGo(n.id);
        }}
        className={cls}
        style={current ? { color: C.crust } : undefined}
      >
        {n.label}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: C.paper, borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <a
          href="#top"
          aria-label={`${BAKERY} 처음으로`}
          onClick={(e) => {
            if (view !== "home") {
              e.preventDefault();
              onGo("top");
            }
          }}
        >
          <Logo />
        </a>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[16px] font-semibold">
            {NAV.map((n) => (
              <li key={n.id}>{navLink(n, "transition-colors hover:text-[#9a4f1c]")}</li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onGo("order")}
            aria-label={`예약 주문, 담은 빵 ${count}개`}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-[#f4ead6]"
          >
            <ShoppingBag size={22} aria-hidden />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[12px] font-bold tabular-nums" style={{ background: C.crust, color: "#fff" }} aria-hidden>
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            aria-controls="bakery-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="bakery-menu"
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
                <li key={n.id}>{navLink(n, "flex h-12 w-full items-center text-[17px] font-semibold")}</li>
              ))}
              <li>
                <a href={`tel:${TEL}`} className="flex h-12 items-center gap-2 text-[17px] font-semibold" style={{ color: C.crust }}>
                  <Phone size={18} aria-hidden />
                  {TEL}
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

function Banner({ onGo }: { onGo: (target: string) => void }) {
  return (
    <section id="top" aria-labelledby="bakery-name" className="relative">
      <div className="relative h-[400px] md:h-[480px]">
        <Image src={`${IMG}/hero.jpg`} alt="오븐에서 막 꺼낸 소금빵 쟁반에 김이 오르는 모습" fill priority sizes="100vw" className="object-cover" style={{ objectPosition: "62% center" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(43,30,20,0.86) 0%, rgba(43,30,20,0.35) 55%, rgba(43,30,20,0.05) 100%)" }} />
        <div className="relative mx-auto flex h-full max-w-[1200px] flex-col items-center justify-end px-4 pb-10 text-center md:px-6 md:pb-14">
          <h1 id="bakery-name" className="text-[38px] font-bold leading-[1.2] tracking-[-0.03em] text-white md:text-[56px]">
            {BAKERY}
          </h1>
          <p className="mt-2 text-[16px] text-[#f3e9da] md:text-[18px]">08:00 ~ 17:00 빵 나오는 시간 안내 · 픽업 예약 가능</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <a href="#oven" className="inline-flex h-12 items-center rounded-[6px] px-6 font-semibold" style={{ background: C.butter, color: C.ink }}>
              빵 나오는 시간
            </a>
            <button type="button" onClick={() => onGo("order")} className="inline-flex h-12 items-center rounded-[6px] border px-6 font-semibold text-white" style={{ borderColor: "rgba(255,255,255,0.7)" }}>
              픽업 예약
            </button>
          </div>
        </div>
      </div>
      <div className="border-b" style={{ background: C.paper, borderColor: C.line }}>
        <div className="mx-auto flex min-h-[52px] max-w-[1200px] flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-2 text-[15px] md:px-6">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Clock3 size={16} aria-hidden />
            화요일 ~ 일요일 08:00 ~ 20:00
          </span>
          <span style={{ color: C.muted }}>월요일 정기휴무</span>
          <a href={`tel:${TEL}`} className="font-semibold tabular-nums" style={{ color: C.crust }}>
            {TEL}
          </a>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ id, title, aside }: { id: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 pb-3" style={{ borderColor: C.ink }}>
      <h2 id={id} className="text-[26px] font-bold leading-[1.3] tracking-[-0.03em] md:text-[32px]">
        {title}
      </h2>
      {aside}
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

function describeArc(from: number, to: number, r: number) {
  const a = polar(from, r);
  const b = polar(to, r);
  const large = (to - from) / (CLOSE - OPEN) > 0.5 ? 1 : 0;
  return `M${a.x} ${a.y} A${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

function OvenClock({ clock, selected, onSelect }: { clock: Clock; selected: number; onSelect: (i: number) => void }) {
  const reduce = useReducedMotionSafe();
  const next = nextBatch(clock);
  const showHand = clock && clock.day !== 1 && clock.m >= OPEN && clock.m < CLOSE;
  const hand = showHand ? { a: polar(clock.m, 104), b: polar(clock.m, 150) } : null;
  const sel = BATCHES[selected];
  const selState = batchState(sel, clock);

  return (
    <svg id="oven-clock" viewBox="0 0 340 340" className="mx-auto h-auto w-full max-w-[420px]" role="group" aria-label="오늘 빵 나오는 시간 시계">
      <circle cx={CX} cy={CY} r="160" fill={C.paper} stroke={C.line} />
      <circle cx={CX} cy={CY} r="128" fill="none" stroke={C.kraft} strokeWidth="18" />
      {showHand && clock && <path d={describeArc(OPEN, clock.m, 128)} fill="none" stroke={C.butterSoft} strokeWidth="18" strokeLinecap="butt" />}
      {Array.from({ length: 12 }, (_, i) => OPEN + i * 60).map((m) => {
        const p = polar(m, 150);
        return (
          <text key={m} x={p.x} y={Math.round((p.y + 4) * 100) / 100} fontSize="11" textAnchor="middle" fill={C.muted} fontWeight={600} aria-hidden>
            {m / 60}
          </text>
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
            {stateText(selState) || `${sel.qty}개`}
          </span>
        </div>
      </foreignObject>
    </svg>
  );
}

function Oven({ clock: realClock, onAdd }: { clock: Clock; onAdd: (id: string) => void }) {
  const [preview, setPreview] = useState<number | null>(null);
  const clock: Clock = preview === null ? realClock : { day: realClock && realClock.day !== 1 ? realClock.day : 2, m: preview };
  const next = nextBatch(clock);
  const [picked, setPicked] = useState<number | null>(null);
  const selected = picked ?? (next ? BATCHES.indexOf(next) : 0);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    if (!added) return;
    const id = window.setTimeout(() => setAdded(null), 1600);
    return () => window.clearTimeout(id);
  }, [added]);

  const sel = BATCHES[selected];
  const bread = BREAD_BY_ID[sel.bread];

  return (
    <section aria-labelledby="oven-title" id="oven" className="scroll-mt-16 px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle id="oven-title" title="오늘 빵 나오는 시간" />
        <div className="mt-8 grid items-start gap-8 md:grid-cols-[1fr_1fr] md:gap-12">
          <div>
            <OvenClock clock={clock} selected={selected} onSelect={setPicked} />
            <div className="mx-auto mt-4 max-w-[420px]">
              <div className="flex items-center justify-between text-[15px]">
                <label htmlFor="oven-time" className="font-semibold">
                  시간 이동
                </label>
                <span className="flex items-center gap-2">
                  <span className="font-bold tabular-nums" style={{ color: C.crust }}>
                    {clock ? hhmm(clock.m) : ""}
                  </span>
                  {preview !== null && (
                    <button type="button" onClick={() => setPreview(null)} className="h-9 rounded-[6px] border px-3 text-[14px] font-semibold" style={{ borderColor: C.line, background: C.paper }}>
                      현재 시각
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
            <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-[14px]" style={{ color: C.muted }} aria-label="범례">
              {[
                ["나온 빵", { background: C.crust }],
                ["다음 빵", { background: C.butter }],
                ["나올 빵", { background: C.paper, border: `2px solid ${C.crustDeep}` }],
                ["품절", { background: C.kraftDeep }],
              ].map(([label, style]) => (
                <li key={label as string} className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full" style={style as React.CSSProperties} aria-hidden />
                  {label as string}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-start gap-4 rounded-[10px] border p-5" style={{ background: C.paper, borderColor: C.line }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={breadImg(bread.id)} alt={bread.name} loading="lazy" className="h-[88px] w-[88px] shrink-0 rounded-[6px] object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold tabular-nums" style={{ color: C.crust }}>
                  {hhmm(sel.at)} · {sel.qty}개
                </p>
                <p className="text-[21px] font-bold tracking-[-0.02em]">{bread.name}</p>
                <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                  {bread.desc}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="font-bold tabular-nums">{won(bread.price)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      onAdd(bread.id);
                      setAdded(bread.id);
                    }}
                    className="inline-flex h-11 items-center gap-1.5 rounded-[6px] px-5 text-[15px] font-semibold"
                    style={{ background: C.crust, color: "#fff" }}
                  >
                    {added === bread.id ? <Check size={17} aria-hidden /> : <Plus size={17} aria-hidden />}
                    담기
                  </button>
                </div>
              </div>
            </div>

            <ul className="mt-4 max-h-[360px] overflow-y-auto rounded-[10px] border" style={{ borderColor: C.line, background: C.paper }} aria-label="굽는 순서">
              {BATCHES.map((b, i) => {
                const s = batchState(b, clock);
                return (
                  <li key={b.at} className="border-b last:border-b-0" style={{ borderColor: C.line }}>
                    <button
                      type="button"
                      onClick={() => setPicked(i)}
                      aria-pressed={selected === i}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#fbf3e2]"
                      style={selected === i ? { background: C.butterSoft } : undefined}
                    >
                      <span className="w-[48px] shrink-0 text-[15px] font-semibold tabular-nums" style={{ color: C.crust }}>
                        {hhmm(b.at)}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-semibold">{BREAD_BY_ID[b.bread].name}</span>
                      <span className="shrink-0 text-[14px]" style={{ color: s.kind === "out" && s.left > 0 ? C.green : C.muted }}>
                        {stateText(s)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 메뉴 (분류 탭 + 상품 격자) ---------- */

/** 품절만 배지로 띄우고 나머지 상태는 글자로 적는다. */
function nowBadge(s: BreadNow): { text: string; color: string; bg: string } | null {
  return s.kind === "soldout" ? { text: "품절", color: "#fff", bg: "#8a7a68" } : null;
}

function nowLine(s: BreadNow) {
  switch (s.kind) {
    case "sale":
      return `판매 중 · ${s.left}개 남음`;
    case "soon":
      return `${hhmm(s.at)} 나옴`;
    case "closed":
      return s.text;
    default:
      return "";
  }
}

function MenuGrid({
  clock,
  cart,
  onAdd,
  onGo,
}: {
  clock: Clock;
  cart: Cart;
  onAdd: (id: string, delta: number) => void;
  onGo: (target: string, tab?: "pickup" | "group") => void;
}) {
  const [cat, setCat] = useState<Cat | "all">("all");
  const [state, setState] = useState<"all" | "sale" | "soon">("all");

  const list = BREADS.map((b) => ({ b, s: breadNow(b.id, clock) })).filter(
    ({ b, s }) => (cat === "all" || b.cat === cat) && (state === "all" || s.kind === state),
  );

  return (
    <section aria-labelledby="menu-title" id="menu" className="scroll-mt-16 px-4 py-14 md:px-6 md:py-20" style={{ background: C.paper }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          id="menu-title"
          title="메뉴"
          aside={
            <div className="flex gap-1" role="group" aria-label="판매 상태">
              {(
                [
                  ["all", "전체"],
                  ["sale", "판매 중"],
                  ["soon", "나올 예정"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={state === v}
                  onClick={() => setState(v)}
                  className="h-9 rounded-[6px] border px-3 text-[14px] font-semibold"
                  style={state === v ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line, color: C.muted }}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        />
        <div className="-mx-4 mt-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div className="flex min-w-max gap-1 border-b" role="group" aria-label="분류" style={{ borderColor: C.line }}>
            {CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
                className="-mb-px h-12 border-b-[3px] px-3.5 text-[16px] font-bold"
                style={cat === c.id ? { borderColor: C.crust, color: C.crust } : { borderColor: "transparent", color: C.muted }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <ul key={`${cat}|${state}`} className="soft-in mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
          {list.map(({ b, s }) => {
            const n = cart[b.id] ?? 0;
            const badge = nowBadge(s);
            return (
              <li key={b.id} className="flex flex-col">
                <div className="relative aspect-square overflow-hidden rounded-[8px]" style={{ background: C.kraft, outline: n ? `2px solid ${C.crust}` : undefined, outlineOffset: n ? 2 : undefined }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={breadImg(b.id)} alt={b.name} loading="lazy" className="h-full w-full object-cover" />
                  {badge && (
                    <span className="absolute left-2 top-2 rounded-[4px] px-1.5 py-0.5 text-[12px] font-bold" style={{ color: badge.color, background: badge.bg }}>
                      {badge.text}
                    </span>
                  )}
                </div>
                <p className="mt-2.5 font-bold leading-[1.35]">{b.name}</p>
                <p className="text-[15px] font-semibold tabular-nums">{won(b.price)}</p>
                <p className="text-[13px] leading-[1.5]" style={{ color: C.muted }}>
                  {allergyTags(b).join(" · ")}
                </p>
                <p className="min-h-[20px] text-[13px] font-semibold tabular-nums" style={{ color: s.kind === "sale" ? C.green : C.muted }}>
                  {nowLine(s)}
                </p>
                <div className="mt-auto pt-2">
                  {n === 0 ? (
                    <button
                      type="button"
                      onClick={() => onAdd(b.id, 1)}
                      aria-label={`${b.name} 담기`}
                      className="inline-flex h-10 w-full items-center justify-center gap-1 rounded-[6px] border text-[15px] font-semibold"
                      style={{ borderColor: C.crust, color: C.crust }}
                    >
                      <Plus size={16} aria-hidden />
                      담기
                    </button>
                  ) : (
                    <div className="flex h-10 items-center justify-between rounded-[6px]" style={{ background: C.crust, color: "#fff" }}>
                      <button type="button" onClick={() => onAdd(b.id, -1)} aria-label={`${b.name} 하나 빼기`} className="inline-flex h-10 w-10 items-center justify-center">
                        <Minus size={16} aria-hidden />
                      </button>
                      <span className="font-bold tabular-nums" aria-live="polite">
                        {n}
                        <span className="sr-only">개 담음</span>
                      </span>
                      <button type="button" onClick={() => onAdd(b.id, 1)} aria-label={`${b.name} 하나 더 담기`} className="inline-flex h-10 w-10 items-center justify-center">
                        <Plus size={16} aria-hidden />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {list.length === 0 && (
          <p className="mt-6 rounded-[8px] p-6 text-center" style={{ background: C.cream, color: C.muted }}>
            해당하는 빵이 없습니다.
          </p>
        )}
        <p className="mt-6 text-[14px]" style={{ color: C.muted }}>
          모든 빵을 같은 작업대에서 만들어 다른 재료가 섞일 수 있습니다.
        </p>

        <div className="mt-8 flex flex-col gap-3 rounded-[8px] border p-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: C.line, background: C.cream }}>
          <div>
            <h3 className="text-[18px] font-bold">단체주문 예약</h3>
            <p className="text-[15px]" style={{ color: C.muted }}>
              20개 이상 단체주문과 홀 케이크는 이틀 전까지 예약합니다.
            </p>
          </div>
          <button type="button" onClick={() => onGo("order", "group")} className="inline-flex h-11 shrink-0 items-center justify-center rounded-[6px] px-5 font-semibold" style={{ background: C.ink, color: "#fff" }}>
            단체주문 예약
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- 하단 고정 담기 바 ---------- */

function CartBar({ show, count, total, onOrder }: { show: boolean; count: number; total: number; onOrder: () => void }) {
  const reduce = useReducedMotionSafe();
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          id="cart-bar"
          className="fixed inset-x-0 z-40 px-4"
          // 공용 떠 있는 버튼(바닥에서 20px, 높이 40px)보다 위에 둔다
          style={{ bottom: "calc(76px + env(safe-area-inset-bottom, 0px))" }}
          initial={reduce ? false : { y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <div className="mx-auto flex h-14 max-w-[520px] items-center gap-3 rounded-[10px] pl-4 pr-2 shadow-[0_8px_24px_rgba(43,30,20,0.25)]" style={{ background: C.ink, color: "#fff" }}>
            <ShoppingBag size={20} aria-hidden />
            <p className="min-w-0 flex-1 truncate text-[15px]" aria-live="polite">
              담은 빵 <strong className="tabular-nums">{count}개</strong>
              <span className="mx-1.5 opacity-50" aria-hidden>
                |
              </span>
              <span className="tabular-nums">{won(total)}</span>
            </p>
            <button type="button" onClick={onOrder} className="h-10 shrink-0 rounded-[6px] px-4 text-[15px] font-bold" style={{ background: C.butter, color: C.ink }}>
              예약하기
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- 예약 주문 화면 ---------- */

const SLOTS = Array.from({ length: 23 }, (_, i) => 510 + i * 30); // 08:30 ~ 19:30

type ReceiptData = { no: string; items: [string, number][]; day: string; slot: number; name: string; phone: string };

/* ---------- 하위 화면 틀 ---------- */

function SubPage({ view, onGo, children }: { view: View; onGo: (target: string) => void; children: React.ReactNode }) {
  const group = groupOf(view)!;
  const label = group.items.find((it) => it.id === view)?.label ?? group.label;
  const headRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headRef.current?.focus({ preventScroll: true });
  }, [view]);

  return (
    <>
      <div className="border-b px-4 md:px-6" style={{ background: C.kraft, borderColor: C.line }}>
        <div className="mx-auto max-w-[1200px] pb-8 pt-6 md:pb-10 md:pt-8">
          <nav aria-label="현재 위치">
            <ol className="flex flex-wrap items-center gap-1.5 text-[14px]" style={{ color: C.muted }}>
              <li>
                <button type="button" onClick={() => onGo("top")} className="hover:underline">
                  홈
                </button>
              </li>
              <li aria-hidden>
                <ChevronRight size={14} />
              </li>
              <li aria-current={group.items.length > 1 ? undefined : "page"}>{group.label}</li>
              {group.items.length > 1 && (
                <>
                  <li aria-hidden>
                    <ChevronRight size={14} />
                  </li>
                  <li aria-current="page" className="font-semibold" style={{ color: C.ink }}>
                    {label}
                  </li>
                </>
              )}
            </ol>
          </nav>
          <h1 ref={headRef} tabIndex={-1} className="mt-2 text-[30px] font-bold tracking-[-0.03em] outline-none md:text-[40px]">
            {label}
          </h1>
        </div>
      </div>
      {group.items.length > 1 && (
        <div className="border-b px-4 md:px-6" style={{ background: C.paper, borderColor: C.line }}>
          <ul className="mx-auto flex max-w-[1200px] gap-1 overflow-x-auto">
            {group.items.map((it) => {
              const on = it.id === view;
              return (
                <li key={it.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onGo(it.id)}
                    aria-current={on ? "page" : undefined}
                    className="-mb-px inline-flex h-12 items-center border-b-[3px] px-3.5 text-[16px] font-bold"
                    style={on ? { borderColor: C.crust, color: C.crust } : { borderColor: "transparent", color: C.muted }}
                  >
                    {it.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="px-4 pb-16 pt-8 md:px-6 md:pb-24 md:pt-10">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </div>
    </>
  );
}

/* ---------- 빵 나오는 시간 (전체 시간표) ---------- */

function OvenTimePage({ clock }: { clock: Clock }) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
      <div className="min-w-0">
        <table className="w-full border-t-2 text-[15px]" style={{ borderColor: C.ink }}>
          <caption className="sr-only">빵 나오는 시간표</caption>
          <thead>
            <tr className="border-b" style={{ borderColor: C.line }}>
              <th scope="col" className="w-[72px] py-3 text-left font-semibold">시간</th>
              <th scope="col" className="py-3 text-left font-semibold">빵</th>
              <th scope="col" className="w-[56px] py-3 text-right font-semibold">수량</th>
              <th scope="col" className="hidden w-[120px] py-3 text-right font-semibold sm:table-cell">지금</th>
            </tr>
          </thead>
          <tbody>
            {BATCHES.map((b) => {
              const s = batchState(b, clock);
              return (
                <tr key={b.at} className="border-b" style={{ borderColor: C.line }}>
                  <td className="py-3 font-semibold tabular-nums" style={{ color: C.crust }}>
                    {hhmm(b.at)}
                  </td>
                  <td className="py-3 font-semibold">{BREAD_BY_ID[b.bread].name}</td>
                  <td className="py-3 text-right tabular-nums">{b.qty}개</td>
                  <td className="hidden py-3 text-right text-[14px] sm:table-cell" style={{ color: s.kind === "out" && s.left > 0 ? C.green : C.muted }}>
                    {stateText(s)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="min-w-0">
        <dl className="border-t-2 text-[15px]" style={{ borderColor: C.ink }}>
          {[
            ["빵 나오는 시간", "08:00 ~ 17:00"],
            ["영업시간", "화요일 ~ 일요일 08:00 ~ 20:00"],
            ["정기휴무", "매주 월요일"],
          ].map(([k, v]) => (
            <div key={k} className="border-b py-3" style={{ borderColor: C.line }}>
              <dt style={{ color: C.muted }}>{k}</dt>
              <dd className="font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ---------- 메뉴 (전체, 설명 포함) ---------- */

function MenuAllPage({ clock, cart, onAdd }: { clock: Clock; cart: Cart; onAdd: (id: string, delta: number) => void }) {
  return (
    <div className="space-y-12">
      {CATS.filter((c) => c.id !== "all").map((c) => (
        <section key={c.id} aria-labelledby={`cat-${c.id}`}>
          <h2 id={`cat-${c.id}`} className="border-b-2 pb-2 text-[22px] font-bold tracking-[-0.02em]" style={{ borderColor: C.ink }}>
            {c.label}
          </h2>
          <ul>
            {BREADS.filter((b) => b.cat === c.id).map((b) => {
              const n = cart[b.id] ?? 0;
              const s = breadNow(b.id, clock);
              return (
                <li key={b.id} className="flex gap-4 border-b py-4" style={{ borderColor: C.line }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={breadImg(b.id)} alt={b.name} loading="lazy" className="h-[88px] w-[88px] shrink-0 rounded-[6px] object-cover md:h-[110px] md:w-[110px]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="text-[18px] font-bold">{b.name}</p>
                      <p className="font-semibold tabular-nums">{won(b.price)}</p>
                    </div>
                    <p className="mt-0.5 text-[15px]" style={{ color: C.muted }}>
                      {b.desc}
                    </p>
                    <p className="mt-1 text-[13px]" style={{ color: C.muted }}>
                      {allergyTags(b).join(" · ")} · 첫 출고 {hhmm(FIRST_AT[b.id])}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[13px] font-semibold tabular-nums" style={{ color: s.kind === "sale" ? C.green : C.muted }}>
                        {nowLine(s)}
                      </span>
                      {n === 0 ? (
                        <button
                          type="button"
                          onClick={() => onAdd(b.id, 1)}
                          aria-label={`${b.name} 담기`}
                          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-[6px] border px-3 text-[14px] font-semibold"
                          style={{ borderColor: C.crust, color: C.crust }}
                        >
                          <Plus size={15} aria-hidden />
                          담기
                        </button>
                      ) : (
                        <div className="flex h-9 shrink-0 items-center rounded-[6px]" style={{ background: C.crust, color: "#fff" }}>
                          <button type="button" onClick={() => onAdd(b.id, -1)} aria-label={`${b.name} 하나 빼기`} className="inline-flex h-9 w-9 items-center justify-center">
                            <Minus size={15} aria-hidden />
                          </button>
                          <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">
                            {n}
                            <span className="sr-only">개 담음</span>
                          </span>
                          <button type="button" onClick={() => onAdd(b.id, 1)} aria-label={`${b.name} 하나 더 담기`} className="inline-flex h-9 w-9 items-center justify-center">
                            <Plus size={15} aria-hidden />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="text-[14px]" style={{ color: C.muted }}>
        모든 빵을 같은 작업대에서 만들어 다른 재료가 섞일 수 있습니다.
      </p>
    </div>
  );
}

/* ---------- 공지사항 ---------- */

// ago: 오늘 기준 며칠 전 글인지. 본문이 함수면 게시일 기준으로 날짜를 계산한다.
const NOTICES: { no: number; title: string; ago: number; body: string[] | ((posted: Date) => string[]) }[] = [
  { no: 6, title: "정기휴무 안내", ago: 6, body: ["매주 월요일 정기휴무", "공휴일 정상 영업"] },
  { no: 5, title: "[EVENT] 소금빵 DAY", ago: 17, body: ["매월 마지막 주 토요일", "소금빵 5개 구매 시 1개 증정"] },
  {
    no: 4,
    title: "명절 연휴 휴무 안내",
    ago: 27,
    body: (d) => [`${fmtKo(daysAgo(d, -14))} ~ ${fmtKo(daysAgo(d, -16))} 휴무`, `${fmtKo(daysAgo(d, -17))}부터 정상 영업`],
  },
  { no: 3, title: "단체주문 예약 안내", ago: 40, body: ["20개 이상 단체주문과 홀 케이크는 이틀 전까지 예약합니다.", "개별 포장 가능"] },
  { no: 2, title: "곰파트너 베이커리는 천연 발효종을 사용합니다.", ago: 67, body: ["깜파뉴, 무화과 호두 깜파뉴는 천연 발효종으로 48시간 저온 숙성합니다."] },
  { no: 1, title: "홈페이지 오픈", ago: 84, body: ["빵 나오는 시간과 픽업 예약을 홈페이지에서 확인할 수 있습니다."] },
];

function NoticePage() {
  const [open, setOpen] = useState<number | null>(NOTICES[0].no);
  const today = useDemoToday();
  return (
    <div>
      <p className="text-[15px]" style={{ color: C.muted }}>
        전체 <strong className="tabular-nums" style={{ color: C.ink }}>{NOTICES.length}</strong>건
      </p>
      <ul className="mt-3 border-t-2" style={{ borderColor: C.ink }}>
        {NOTICES.map((n) => {
          const on = open === n.no;
          const posted = daysAgo(today, n.ago);
          const body = typeof n.body === "function" ? n.body(posted) : n.body;
          return (
            <li key={n.no} className="border-b" style={{ borderColor: C.line }}>
              <button
                type="button"
                onClick={() => setOpen(on ? null : n.no)}
                aria-expanded={on}
                className="flex w-full items-center gap-3 py-4 text-left md:gap-5"
              >
                <span className="hidden w-10 shrink-0 text-center text-[14px] tabular-nums sm:block" style={{ color: C.muted }}>
                  {n.no}
                </span>
                <span className="min-w-0 flex-1 font-semibold">{n.title}</span>
                <span className="shrink-0 text-[14px] tabular-nums" style={{ color: C.muted }}>
                  {fmtDot(posted)}
                </span>
              </button>
              {on && (
                <ul className="mb-4 space-y-1 rounded-[6px] px-5 py-4 text-[15px] sm:ml-[60px]" style={{ background: C.paper }}>
                  {body.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PickupOrder({
  clock,
  cart,
  onAdd,
  onClear,
  onBack,
}: {
  clock: Clock;
  cart: Cart;
  onAdd: (id: string, delta: number) => void;
  onClear: () => void;
  onBack: () => void;
}) {
  const [dayPick, setDayPick] = useState<"today" | "tomorrow" | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const items = Object.entries(cart);
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
    if (!items.length) return setError("빵을 하나 이상 담아 주십시오.");
    if (activeSlot === null) return setError("픽업 시간을 선택해 주십시오.");
    if (name.trim().length < 2) return setError("성함을 입력해 주십시오.");
    if (phone.replace(/\D/g, "").length < 10) return setError("휴대전화 번호를 입력해 주십시오.");
    setError("");
    const now = new Date();
    const dayLabel = day === "today" ? `오늘 (${DAY_NAMES[now.getDay()]})` : `내일 (${DAY_NAMES[(now.getDay() + 1) % 7]})`;
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
    onBack();
  };

  const fieldLabel = "block text-[15px] font-bold";

  return (
    <form onSubmit={submit} noValidate className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px] lg:gap-10">
      <div className="space-y-7">
        <div>
          <h4 className="text-[18px] font-bold">담은 빵</h4>
          {items.length === 0 ? (
            <div className="mt-3 rounded-[8px] border p-6 text-center" style={{ borderColor: C.line, background: C.paper }}>
              <p style={{ color: C.muted }}>담은 빵이 없습니다.</p>
              <button type="button" onClick={onBack} className="mt-3 inline-flex h-11 items-center rounded-[6px] px-5 font-semibold" style={{ background: C.crust, color: "#fff" }}>
                메뉴 보기
              </button>
            </div>
          ) : (
            <ul className="mt-3 divide-y rounded-[8px] border" style={{ borderColor: C.line, background: C.paper }}>
              {items.map(([id, n]) => {
                const b = BREAD_BY_ID[id];
                return (
                  <li key={id} className="flex items-center gap-3 px-3 py-3" style={{ borderColor: C.line }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={breadImg(id)} alt={b.name} loading="lazy" className="h-12 w-12 shrink-0 rounded-[6px] object-cover" style={{ background: C.kraft }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{b.name}</span>
                      <span className="block text-[14px] tabular-nums" style={{ color: C.muted }}>
                        {won(b.price * n)} · {hhmm(FIRST_AT[id])}부터
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <button type="button" onClick={() => onAdd(id, -1)} aria-label={`${b.name} 하나 빼기`} className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border" style={{ borderColor: C.kraftDeep }}>
                        {n === 1 ? <Trash2 size={15} aria-hidden /> : <Minus size={15} aria-hidden />}
                      </button>
                      <span className="w-6 text-center font-bold tabular-nums">{n}</span>
                      <button type="button" onClick={() => onAdd(id, 1)} aria-label={`${b.name} 하나 더 담기`} className="inline-flex h-9 w-9 items-center justify-center rounded-[6px]" style={{ background: C.crust, color: "#fff" }}>
                        <Plus size={15} aria-hidden />
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <fieldset>
          <legend className="text-[18px] font-bold">픽업 날짜</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:max-w-[360px]">
            {(
              [
                ["today", "오늘", todayOk, clock?.day === 1 ? "휴무" : "마감"],
                ["tomorrow", "내일", tomorrowOk, "휴무"],
              ] as const
            ).map(([v, label, ok, why]) => (
              <button
                key={v}
                type="button"
                aria-pressed={day === v}
                disabled={!ok}
                onClick={() => setDayPick(v)}
                className="h-11 rounded-[6px] border text-[15px] font-semibold disabled:opacity-40"
                style={day === v ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line, background: C.paper }}
              >
                {label}
                {!ok && ` (${why})`}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset id="pickup-slots">
          <legend className="text-[18px] font-bold">픽업 시간</legend>
          <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {SLOTS.map((s) => {
              const st = slotState(s);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={st !== "ok"}
                  aria-pressed={activeSlot === s}
                  aria-label={`${hhmm(s)}${st === "baking" ? ", 빵 나오기 전" : st === "past" ? ", 지난 시간" : ""}`}
                  onClick={() => setSlot(s)}
                  className="h-10 rounded-[6px] border text-[14px] font-semibold tabular-nums disabled:cursor-not-allowed"
                  style={
                    activeSlot === s
                      ? { background: C.crust, color: "#fff", borderColor: C.crust }
                      : st === "ok"
                        ? { borderColor: C.line, background: C.paper }
                        : { borderColor: "transparent", background: C.kraft, color: "#a8977f", textDecoration: st === "baking" ? "none" : "line-through" }
                  }
                >
                  {hhmm(s)}
                </button>
              );
            })}
          </div>
          {latestBread && earliest > SLOTS[0] && (
            <p className="mt-2 text-[14px] font-semibold" style={{ color: C.crustDeep }}>
              {BREAD_BY_ID[latestBread].name}
              {eunNeun(BREAD_BY_ID[latestBread].name)} {hhmm(earliest)} 이후 픽업할 수 있습니다.
            </p>
          )}
        </fieldset>
      </div>

      <div className="rounded-[10px] border p-5 lg:sticky lg:top-20" style={{ borderColor: C.line, background: C.paper }}>
        <h4 className="text-[18px] font-bold">주문 정보</h4>
        <p className="mt-3 flex justify-between border-b pb-3 font-bold" style={{ borderColor: C.line }}>
          <span>합계</span>
          <span className="tabular-nums">{won(total)}</span>
        </p>
        <div className="mt-4 grid gap-3">
          <label className="block">
            <span className={fieldLabel}>성함</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="김하늘" className="mt-1.5 h-11 w-full rounded-[6px] border px-3 outline-none focus:border-[#9a4f1c]" style={{ borderColor: C.line }} />
          </label>
          <label className="block">
            <span className={fieldLabel}>휴대전화</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" className="mt-1.5 h-11 w-full rounded-[6px] border px-3 outline-none focus:border-[#9a4f1c]" style={{ borderColor: C.line }} />
          </label>
        </div>
        {error && (
          <p className="mt-3 text-[15px] font-semibold" style={{ color: "#b3261e" }} role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="mt-5 h-12 w-full rounded-[6px] font-bold" style={{ background: C.crust, color: "#fff" }}>
          예약하기
        </button>
        <ul className="mt-4 space-y-1 text-[14px]" style={{ color: C.muted }}>
          <li>결제는 매장에서 해 주세요.</li>
          <li>픽업 시간 30분 경과 시 예약이 취소될 수 있습니다.</li>
        </ul>
      </div>
      <Receipt data={receipt} onClose={closeReceipt} />
    </form>
  );
}

function GroupOrder({ minute }: { minute: number }) {
  const [date, setDate] = useState("");
  const [qty, setQty] = useState("");
  const [memo, setMemo] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ name: string; date: string; qty: string } | null>(null);

  const minDate = (() => {
    if (minute < 0) return undefined;
    const d = new Date(minute * 60_000);
    d.setDate(d.getDate() + 2);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return setError("희망 날짜를 선택해 주십시오.");
    if (minDate && date < minDate) return setError("단체주문은 2일 전까지 예약해 주세요.");
    if (new Date(`${date}T00:00:00`).getDay() === 1) return setError("월요일은 정기휴무입니다.");
    if (!qty) return setError("수량을 선택해 주십시오.");
    if (name.trim().length < 2) return setError("성함을 입력해 주십시오.");
    if (phone.replace(/\D/g, "").length < 10) return setError("휴대전화 번호를 입력해 주십시오.");
    setError("");
    setDone({ name: maskName(name), date, qty });
  };

  if (done) {
    return (
      <div className="mt-6 max-w-[560px] rounded-[10px] border p-6" style={{ borderColor: C.line, background: C.paper }} role="status">
        <p className="flex items-center gap-2 text-[20px] font-bold">
          <Check size={22} style={{ color: C.green }} aria-hidden />
          접수 완료
        </p>
        <dl className="mt-4 space-y-1 text-[15px]">
          {[
            ["성함", done.name],
            ["희망 날짜", done.date],
            ["수량", done.qty],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-[80px]" style={{ color: C.muted }}>
                {k}
              </dt>
              <dd className="font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[15px]" style={{ color: C.muted }}>
          영업시간 안에 확인 전화를 드립니다. 확인 전화 후 예약이 확정됩니다.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(null);
            setDate("");
            setQty("");
            setMemo("");
            setName("");
            setPhone("");
          }}
          className="mt-4 h-10 text-[15px] font-semibold underline underline-offset-4"
          style={{ color: C.crust }}
        >
          새로 접수
        </button>
      </div>
    );
  }

  const input = "mt-1.5 h-11 w-full rounded-[6px] border bg-white px-3 outline-none focus:border-[#9a4f1c]";

  return (
    <form onSubmit={submit} noValidate className="mt-6 grid max-w-[720px] gap-4 sm:grid-cols-2">
      <label className="block">
        <span className="block text-[15px] font-bold">희망 날짜</span>
        <input type="date" value={date} min={minDate} onChange={(e) => setDate(e.target.value)} className={input} style={{ borderColor: C.line }} />
      </label>
      <label className="block">
        <span className="block text-[15px] font-bold">수량</span>
        <select value={qty} onChange={(e) => setQty(e.target.value)} className={input} style={{ borderColor: C.line }}>
          <option value="">선택</option>
          <option>20 ~ 29개</option>
          <option>30 ~ 49개</option>
          <option>50개 이상</option>
          <option>홀 케이크</option>
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className="block text-[15px] font-bold">품목·요청 사항</span>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          placeholder="소금빵 20개, 개별 포장"
          className="mt-1.5 w-full rounded-[6px] border bg-white px-3 py-2 outline-none focus:border-[#9a4f1c]"
          style={{ borderColor: C.line }}
        />
      </label>
      <label className="block">
        <span className="block text-[15px] font-bold">성함</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="김하늘" className={input} style={{ borderColor: C.line }} />
      </label>
      <label className="block">
        <span className="block text-[15px] font-bold">휴대전화</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" className={input} style={{ borderColor: C.line }} />
      </label>
      {error && (
        <p className="text-[15px] font-semibold sm:col-span-2" style={{ color: "#b3261e" }} role="alert">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" className="h-12 w-full rounded-[6px] font-bold sm:w-auto sm:px-10" style={{ background: C.crust, color: "#fff" }}>
          단체주문 예약
        </button>
        <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
          단체주문과 홀 케이크는 이틀 전까지 예약합니다. 월요일은 정기휴무입니다.
        </p>
      </div>
    </form>
  );
}

function Receipt({ data, onClose }: { data: ReceiptData | null; onClose: () => void }) {
  const reduce = useReducedMotionSafe();
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!data) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data]);

  const total = useMemo(() => (data ? data.items.reduce((s, [id, n]) => s + BREAD_BY_ID[id].price * n, 0) : 0), [data]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
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
              clipPath:
                "polygon(0 0,100% 0,100% calc(100% - 10px),95% 100%,90% calc(100% - 10px),85% 100%,80% calc(100% - 10px),75% 100%,70% calc(100% - 10px),65% 100%,60% calc(100% - 10px),55% 100%,50% calc(100% - 10px),45% 100%,40% calc(100% - 10px),35% 100%,30% calc(100% - 10px),25% 100%,20% calc(100% - 10px),15% 100%,10% calc(100% - 10px),5% 100%,0 calc(100% - 10px))",
            }}
            initial={reduce ? false : { y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <button ref={closeRef} type="button" onClick={onClose} aria-label="닫기" className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ color: C.muted }}>
              <X size={20} aria-hidden />
            </button>
            <p className="text-center">
              <Logo />
            </p>
            <h3 id="receipt-title" className="mt-3 flex items-center justify-center gap-1.5 text-[18px] font-bold">
              <Check size={20} style={{ color: C.green }} aria-hidden />
              예약 완료
            </h3>
            <dl className="mt-4 space-y-1 border-y border-dashed py-3 text-[15px] tabular-nums" style={{ borderColor: C.kraftDeep }}>
              {[
                ["주문번호", data.no],
                ["픽업 날짜", data.day],
                ["픽업 시간", hhmm(data.slot)],
                ["성함", data.name],
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
                    {BREAD_BY_ID[id].name} {n}개
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
              결제는 매장에서 해 주세요. 픽업 시간 30분 경과 시 예약이 취소될 수 있습니다.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- 소개 ---------- */

function AboutPage() {
  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-[8px] md:aspect-[21/8]">
        <Image src={`${IMG}/display.jpg`} alt="크루아상, 깜파뉴, 크림빵, 과일 타르트가 놓인 진열대" fill sizes="(min-width: 1200px) 1200px, 100vw" className="object-cover" />
      </div>
      <p className="mt-8 text-[22px] font-bold tracking-[-0.02em] md:text-[26px]">당일 생산 · 당일 판매</p>
      <dl className="mt-5 grid gap-5 md:grid-cols-3 md:gap-8">
        {[
          ["04:00", "반죽 시작. 깜파뉴 반죽은 이틀 전에 미리 준비합니다."],
          ["17:00", "마지막 소금빵이 나옵니다. 이후에는 남은 빵만 판매합니다."],
          ["19:00", "남은 빵 30% 할인. 당일 생산·당일 판매를 원칙으로 하며, 남은 빵은 ㅅㄴ동 지역아동센터에 기부합니다."],
        ].map(([t, d]) => (
          <div key={t} className="border-t pt-4" style={{ borderColor: C.kraftDeep }}>
            <dt className="text-[20px] font-bold tabular-nums" style={{ color: C.crust }}>
              {t}
            </dt>
            <dd className="mt-1" style={{ color: C.muted }}>
              {d}
            </dd>
          </div>
        ))}
      </dl>
      <h2 className="mt-14 border-b-2 pb-2 text-[22px] font-bold tracking-[-0.02em]" style={{ borderColor: C.ink }}>
        재료
      </h2>
      <dl className="text-[15px]">
        {[
          ["밀가루", "프랑스밀, 국산 통밀"],
          ["버터", "프랑스산 버터"],
          ["발효종", "천연 발효종 (깜파뉴)"],
          ["팥", "국산 팥, 직접 만든 앙금"],
          ["쌀가루", "국산 쌀 100% (쌀 카스텔라)"],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[88px_1fr] gap-3 border-b py-3" style={{ borderColor: C.line }}>
            <dt className="font-semibold">{k}</dt>
            <dd style={{ color: C.muted }}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ---------- 매장안내 ---------- */

const HOURS = [
  { label: "화요일 ~ 일요일", time: "08:00 ~ 20:00" },
  { label: "빵 나오는 시간", time: "08:00 ~ 17:00" },
  { label: "월요일", time: "정기휴무" },
];

function MiniMap() {
  return (
    <svg viewBox="0 0 640 380" className="h-auto w-full" role="img" aria-label="ㅅㅈ역 2번 출구에서 매장까지 가는 약도">
      <rect width="640" height="380" fill={C.paper} />
      <path d="M0 110 H640" stroke={C.line} strokeWidth="28" />
      <path d="M200 0 V380" stroke={C.line} strokeWidth="22" />
      <path d="M200 250 H640" stroke={C.line} strokeWidth="14" />
      <text x="20" y="90" fontSize="15" fill={C.muted}>
        ㄷㅅ대로
      </text>
      <text x="420" y="236" fontSize="15" fill={C.muted}>
        ㅎㄷ로 5길
      </text>
      <circle cx="120" cy="110" r="16" fill={C.crust} />
      <text x="120" y="115" fontSize="13" fill="#fff" textAnchor="middle" fontWeight={700}>
        2
      </text>
      <text x="74" y="156" fontSize="15" fill={C.ink}>
        ㅅㅈ역 2번 출구
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

function Store() {
  return (
    <section aria-labelledby="store-title" id="store" className="scroll-mt-16 px-4 py-14 md:px-6 md:py-20" style={{ background: C.kraft }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle id="store-title" title="매장안내" />
        <StoreInfo />
      </div>
    </section>
  );
}

function StoreInfo() {
  return (
    <div className="mt-8 grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-12">
      <div className="overflow-hidden rounded-[8px] border" style={{ borderColor: C.line }}>
        <MiniMap />
      </div>
      <div>
        <p className="text-[20px] font-bold tracking-[-0.02em]">{ADDRESS}</p>
        <ul className="mt-4 space-y-3">
          {[
            { icon: TrainFront, title: "지하철", body: "ㅅㅈ역 2번 출구에서 도보 5분" },
            { icon: Car, title: "주차", body: "매장 앞 주차 불가. 50m 옆 ㅅㄴ동 공영주차장을 이용해 주세요." },
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
        <table className="mt-6 w-full border-t text-[15px]" style={{ borderColor: C.kraftDeep }}>
          <caption className="sr-only">영업시간</caption>
          <tbody>
            {HOURS.map((h) => (
              <tr key={h.label} className="border-b" style={{ borderColor: C.kraftDeep }}>
                <th scope="row" className="py-3 text-left font-normal" style={{ color: C.muted }}>
                  {h.label}
                </th>
                <td className="py-3 text-right font-semibold tabular-nums">{h.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <a href={`tel:${TEL}`} className="mt-5 inline-flex h-12 items-center gap-2 rounded-[6px] px-6 font-semibold" style={{ background: C.crust, color: "#fff" }}>
          <Phone size={18} aria-hidden />
          {TEL}
        </a>
      </div>
    </div>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-4 pb-40 pt-12 md:px-6" style={{ background: C.crustDeep, color: "#fbeee0" }}>
      <div className="mx-auto max-w-[1200px]">
        <Logo />
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: "#e2c8ad" }}>
          {[
            ["상호", "ㅁㄷ 베이커리"],
            ["대표자", "이ㅅ연"],
            ["사업자등록번호", "000-00-00000"],
            ["주소", ADDRESS],
            ["전화", TEL],
            ["이메일", "hello@example.com"],
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
