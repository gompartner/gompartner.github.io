"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Car, Check, Gift, Menu, Minus, Plus, Search, ShoppingBag, TrainFront, Trash2, Truck, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 자사 쇼핑몰 데모: 가상의 ○○ 도자기 공방.
   상호, 대표자, 주소, 전화번호, 사업자 정보, 통신판매업 신고번호, 상품과 가격, 재고는 모두 가상이다.

   디자인: 미색 바탕(#f7f4ef)에 먹색 글자(#23201d), 테라코타(#b5562f), 흙빛(#d9c7b4).
   잡지처럼 여백을 넓게 두고, 상품은 사진 대신 그릇 모양을 SVG로 그려 진열한다.

   상품마다 유약(백자, 청자, 흑유, 분청)을 고르면 그림의 색이 바로 바뀐다. 분류, 정렬, 이름 검색을 함께 둔다.
   상품 창에서는 유약, 크기, 수량, 각인 문구를 고르고 각인은 그림 위에 새겨 보여 준다. 조합마다 남은 수량이 다르다.
   장바구니는 5만 원까지 남은 금액을 막대로 보여 주고, 선물 포장을 고르면 포장지 무늬, 리본 색, 카드 문구가 그림으로 나온다.
   도착 예정일은 지금 시각을 기준으로 평일 14시 전 주문은 그날 보내고 주말은 건너뛰어 지역별로 계산한다.
   주문서는 결제 수단을 고르는 시늉만 하고, 주문 완료 화면에는 이름과 전화번호를 가려서 보여 준다.

   사진 출처(public/images/demo-store):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, detail */

const IMG = "/images/demo-store";
const SHOP = "○○ 도자기 공방";
const TEL = "02-000-0000";
const ADDRESS = "□□시 □□구 □□로 12길 8 1층";

const C = {
  bg: "#f7f4ef",
  paper: "#fffdf9",
  ink: "#23201d",
  muted: "#6b625a",
  terra: "#b5562f",
  terraDeep: "#8e3f1f",
  clay: "#d9c7b4",
  claySoft: "#ece3d8",
  line: "#e2d8cc",
};

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV = [
  { id: "shop", label: "그릇" },
  { id: "delivery", label: "배송 안내" },
  { id: "story", label: "공방 이야기" },
  { id: "visit", label: "공방 위치" },
  { id: "faq", label: "자주 묻는 질문" },
];

const FREE_SHIP = 50_000;
const SHIP_FEE = 3_500;
const ENGRAVE_FEE = 3_000;
const GIFT_FEE = 3_000;
const ENGRAVE_MAX = 8;

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/* ---------- 시간 ---------- */

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const subscribeMinute = (cb: () => void) => {
  const id = window.setInterval(cb, 20_000);
  return () => window.clearInterval(id);
};

/** 분 단위 현재 시각. 서버 렌더에서는 -1을 돌려 시간에 따른 화면 차이를 막는다. */
function useNowMinute() {
  return useSyncExternalStore(subscribeMinute, () => Math.floor(Date.now() / 60_000), () => -1);
}

const dateText = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`;

function untilText(diff: number) {
  if (diff < 60) return `${diff}분`;
  const h = Math.floor(diff / 60);
  const r = diff % 60;
  return r ? `${h}시간 ${r}분` : `${h}시간`;
}

/* ---------- 배송 ---------- */

type Region = "metro" | "local" | "island";

const REGIONS: { id: Region; label: string; days: number; extra: number }[] = [
  { id: "metro", label: "수도권", days: 1, extra: 0 },
  { id: "local", label: "지방", days: 2, extra: 0 },
  { id: "island", label: "제주·도서산간", days: 3, extra: 3_000 },
];

const REGION_BY_ID = Object.fromEntries(REGIONS.map((r) => [r.id, r])) as Record<Region, (typeof REGIONS)[number]>;

const CUTOFF = 14 * 60;

const isWorkday = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6;

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** 평일 14시 전 주문은 그날 보내고, 주말은 출고와 배송 모두 건너뛴다. */
function estimate(minute: number, region: Region) {
  if (minute < 0) return null;
  const now = new Date(minute * 60_000);
  const m = now.getHours() * 60 + now.getMinutes();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayShip = isWorkday(today) && m < CUTOFF;
  let ship = today;
  if (!todayShip) {
    do ship = addDays(ship, 1);
    while (!isWorkday(ship));
  }
  let arrive = ship;
  let left = REGION_BY_ID[region].days;
  while (left > 0) {
    arrive = addDays(arrive, 1);
    if (isWorkday(arrive)) left--;
  }
  const dayIndex = (d: Date) => Math.round((d.getTime() - today.getTime()) / 86_400_000);
  return { today, todayShip, ship, arrive, shipAt: dayIndex(ship), arriveAt: dayIndex(arrive), cutoffLeft: todayShip ? CUTOFF - m : null };
}

/* ---------- 유약, 상품 ---------- */

type GlazeId = "white" | "celadon" | "black" | "buncheong";

interface Glaze {
  id: GlazeId;
  label: string;
  body: string;
  rim: string;
  shade: string;
  foot: string;
  mark: string;
  note: string;
}

const GLAZES: Glaze[] = [
  { id: "white", label: "백자", body: "#efe9de", rim: "#fbf8f2", shade: "#d6ccbd", foot: "#c8a27c", mark: "#8a7f72", note: "희고 매끈하며 음식 색이 잘 보입니다." },
  { id: "celadon", label: "청자", body: "#9fbaa6", rim: "#c6d8ca", shade: "#7b9884", foot: "#c8a27c", mark: "#46624f", note: "유약이 고인 자리에 푸른빛이 짙게 남습니다." },
  { id: "black", label: "흑유", body: "#302a26", rim: "#6b5543", shade: "#1b1815", foot: "#8a6a4f", mark: "#cdb99f", note: "입술 부분에 갈색 띠가 흐릅니다." },
  { id: "buncheong", label: "분청", body: "#cbbca4", rim: "#e9e0d1", shade: "#a99880", foot: "#c8a27c", mark: "#6a5a47", note: "흰 흙을 붓으로 바른 결이 그대로 보입니다." },
];

const GLAZE_BY_ID = Object.fromEntries(GLAZES.map((g) => [g.id, g])) as Record<GlazeId, Glaze>;

type Shape = "mug" | "teacup" | "ricebowl" | "noodle" | "plate" | "sidedish" | "vase" | "teapot";
type Cat = "cup" | "bowl" | "plate" | "etc";

interface Size {
  id: string;
  label: string;
  add: number;
  scale: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  shape: Shape;
  cat: Cat;
  glazes: GlazeId[];
  sizes: Size[];
  added: string;
  isNew?: boolean;
  desc: string;
}

const ALL_GLAZES: GlazeId[] = ["white", "celadon", "black", "buncheong"];

const PRODUCTS: Product[] = [
  {
    id: "mug",
    name: "손잡이 머그",
    price: 28_000,
    shape: "mug",
    cat: "cup",
    glazes: ALL_GLAZES,
    sizes: [
      { id: "s", label: "보통 300ml", add: 0, scale: 0.94 },
      { id: "l", label: "큰 것 400ml", add: 4_000, scale: 1.06 },
    ],
    added: "2026-09-18",
    isNew: true,
    desc: "손잡이를 두툼하게 붙여 손가락 세 개가 편하게 들어갑니다.",
  },
  {
    id: "teacup",
    name: "물레 찻잔",
    price: 18_000,
    shape: "teacup",
    cat: "cup",
    glazes: ALL_GLAZES,
    sizes: [{ id: "s", label: "한 잔 120ml", add: 0, scale: 1 }],
    added: "2026-06-02",
    desc: "입에 닿는 부분을 얇게 깎아 차가 부드럽게 넘어갑니다.",
  },
  {
    id: "ricebowl",
    name: "밥공기",
    price: 22_000,
    shape: "ricebowl",
    cat: "bowl",
    glazes: ALL_GLAZES,
    sizes: [
      { id: "s", label: "보통 지름 11cm", add: 0, scale: 0.94 },
      { id: "l", label: "큰 것 지름 12.5cm", add: 3_000, scale: 1.06 },
    ],
    added: "2026-03-10",
    desc: "굽을 높게 깎아 뜨거운 밥을 담아도 손에 열이 덜 옵니다.",
  },
  {
    id: "noodle",
    name: "면기",
    price: 34_000,
    shape: "noodle",
    cat: "bowl",
    glazes: ALL_GLAZES,
    sizes: [
      { id: "m", label: "지름 17cm", add: 0, scale: 0.94 },
      { id: "l", label: "지름 19cm", add: 5_000, scale: 1.04 },
    ],
    added: "2026-08-25",
    desc: "국수, 덮밥, 샐러드까지 두루 담기 좋은 넓은 그릇입니다.",
  },
  {
    id: "plate",
    name: "원형 접시",
    price: 32_000,
    shape: "plate",
    cat: "plate",
    glazes: ALL_GLAZES,
    sizes: [
      { id: "m", label: "지름 21cm", add: 0, scale: 0.92 },
      { id: "l", label: "지름 25cm", add: 8_000, scale: 1.04 },
    ],
    added: "2026-05-14",
    desc: "가장자리를 살짝 올려 국물 있는 반찬도 흐르지 않습니다.",
  },
  {
    id: "sidedish",
    name: "찬기",
    price: 14_000,
    shape: "sidedish",
    cat: "plate",
    glazes: ALL_GLAZES,
    sizes: [{ id: "s", label: "지름 10cm", add: 0, scale: 1 }],
    added: "2026-02-20",
    desc: "김치, 나물, 장 종지로 쓰기 좋은 작은 그릇입니다.",
  },
  {
    id: "vase",
    name: "한 송이 화병",
    price: 46_000,
    shape: "vase",
    cat: "etc",
    glazes: ALL_GLAZES,
    sizes: [
      { id: "s", label: "높이 15cm", add: 0, scale: 0.92 },
      { id: "l", label: "높이 20cm", add: 12_000, scale: 1.06 },
    ],
    added: "2026-09-26",
    isNew: true,
    desc: "입구를 좁게 빚어 꽃 한두 송이만 꽂아도 모양이 잡힙니다.",
  },
  {
    id: "teapot",
    name: "옆손잡이 다관",
    price: 68_000,
    shape: "teapot",
    cat: "etc",
    glazes: ["white", "celadon", "black"],
    sizes: [{ id: "m", label: "300ml", add: 0, scale: 1 }],
    added: "2026-07-08",
    desc: "안쪽에 거름망 구멍을 직접 뚫어 찻잎이 따라 나오지 않습니다.",
  },
];

const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<string, Product>;

const CATS: { id: Cat | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "cup", label: "컵·찻잔" },
  { id: "bowl", label: "그릇" },
  { id: "plate", label: "접시" },
  { id: "etc", label: "화병·다관" },
];

type Sort = "new" | "low" | "high";

const SORTS: { id: Sort; label: string }[] = [
  { id: "new", label: "신상품순" },
  { id: "low", label: "낮은 가격순" },
  { id: "high", label: "높은 가격순" },
];

/** 조합마다 남은 수량. 서버와 브라우저가 같은 값을 내도록 글자로만 계산한다. */
function stockOf(productId: string, glaze: GlazeId, size: string) {
  let h = 8;
  for (const ch of `${productId}:${glaze}:${size}`) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return h % 9;
}

interface CartLine {
  key: string;
  productId: string;
  glaze: GlazeId;
  size: string;
  engrave: string;
  qty: number;
}

function linePrice(l: { productId: string; size: string; engrave: string }) {
  const p = PRODUCT_BY_ID[l.productId];
  const size = p.sizes.find((s) => s.id === l.size) ?? p.sizes[0];
  return p.price + size.add + (l.engrave ? ENGRAVE_FEE : 0);
}

function lineOptions(l: CartLine) {
  const p = PRODUCT_BY_ID[l.productId];
  const size = p.sizes.find((s) => s.id === l.size) ?? p.sizes[0];
  return `${GLAZE_BY_ID[l.glaze].label}, ${size.label}${l.engrave ? `, 각인 ‘${l.engrave}’` : ""}`;
}

/* ---------- 선물 포장 ---------- */

type Paper = "stripe" | "dot" | "leaf";
type Ribbon = "terra" | "olive" | "ink";

interface GiftState {
  on: boolean;
  paper: Paper;
  ribbon: Ribbon;
  message: string;
}

const PAPERS: { id: Paper; label: string }[] = [
  { id: "stripe", label: "크라프트 줄무늬" },
  { id: "dot", label: "물방울" },
  { id: "leaf", label: "잎사귀" },
];

const RIBBONS: { id: Ribbon; label: string; color: string }[] = [
  { id: "terra", label: "테라코타", color: "#b5562f" },
  { id: "olive", label: "올리브", color: "#6b7247" },
  { id: "ink", label: "먹색", color: "#23201d" },
];

const GIFT_MESSAGE_MAX = 40;

/* ---------- 이름, 전화 가리기 ---------- */

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

/* ---------- 창 공통 ---------- */

/** 열릴 때 닫기 단추로 초점을 옮기고 스크롤을 막으며, 닫히면 원래 자리로 초점을 돌려준다. Escape로 닫는다. */
function useDialog(onClose: () => void) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return closeRef;
}

/* ---------- 페이지 ---------- */

export function OnlineStoreDemo() {
  const minute = useNowMinute();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [region, setRegion] = useState<Region>("metro");
  const [detail, setDetail] = useState<{ id: string; glaze: GlazeId } | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [gift, setGift] = useState<GiftState>({ on: false, paper: "stripe", ribbon: "terra", message: "" });

  const count = cart.reduce((s, l) => s + l.qty, 0);

  const addLine = (line: Omit<CartLine, "key">) => {
    const key = `${line.productId}|${line.glaze}|${line.size}|${line.engrave}`;
    const max = stockOf(line.productId, line.glaze, line.size);
    setCart((prev) => {
      const found = prev.find((l) => l.key === key);
      if (found) return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(max, l.qty + line.qty) } : l));
      return [...prev, { ...line, key }];
    });
  };

  const changeQty = (key: string, delta: number) =>
    setCart((prev) =>
      prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(stockOf(l.productId, l.glaze, l.size), l.qty + delta)) } : l)),
    );

  const removeLine = (key: string) => setCart((prev) => prev.filter((l) => l.key !== key));

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.bg, color: C.ink }}>
      <p className="px-4 py-2 text-center text-[14px] font-semibold md:px-6" style={{ background: C.ink, color: C.claySoft }}>
        5만 원 이상 무료배송, 평일 오후 2시 전 주문은 그날 보내 드려요
      </p>
      <Header count={count} onCart={() => setCartOpen(true)} />
      <main>
        <Hero />
        <Shop onOpen={(id, glaze) => setDetail({ id, glaze })} />
        <Delivery minute={minute} region={region} onRegion={setRegion} />
        <Story />
        <Visit minute={minute} />
        <Faq />
      </main>
      <Footer />

      <AnimatePresence>
        {detail && (
          <ProductDialog
            key={detail.id}
            productId={detail.id}
            initialGlaze={detail.glaze}
            onClose={() => setDetail(null)}
            onAdd={(line) => {
              addLine(line);
              setDetail(null);
              setCartOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            key="cart"
            cart={cart}
            minute={minute}
            region={region}
            onRegion={setRegion}
            gift={gift}
            onGift={setGift}
            onQty={changeQty}
            onRemove={removeLine}
            onClose={() => setCartOpen(false)}
            onCheckout={() => {
              setCartOpen(false);
              setCheckoutOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutDialog
            key="checkout"
            cart={cart}
            region={region}
            onRegion={setRegion}
            gift={gift}
            onClose={() => setCheckoutOpen(false)}
            onOrdered={() => {
              setCart([]);
              setGift({ on: false, paper: "stripe", ribbon: "terra", message: "" });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- 로고, 머리글 ---------- */

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
        <path d="M5 9 H23 Q22 22 14 23 Q6 22 5 9Z" fill={light ? C.clay : C.terra} />
        <ellipse cx="14" cy="9" rx="9" ry="2.4" fill={light ? "#f7f4ef" : C.ink} />
      </svg>
      <span className="text-[18px] font-bold tracking-[-0.02em]">{SHOP}</span>
    </span>
  );
}

function Header({ count, onCart }: { count: number; onCart: () => void }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ background: "rgba(247,244,239,0.94)", borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <a href="#top" aria-label={`${SHOP} 처음으로`} className="min-w-0">
          <Logo />
        </a>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[15px]">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="transition-colors hover:text-[#b5562f]" style={{ color: C.muted }}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onCart}
            aria-label={count ? `장바구니 열기, ${count}개 담김` : "장바구니 열기"}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[#ece3d8]"
          >
            <ShoppingBag size={22} aria-hidden />
            {count > 0 && (
              <span
                className="absolute right-0.5 top-0.5 inline-flex h-[19px] min-w-[19px] items-center justify-center rounded-full px-1 text-[11px] font-bold tabular-nums"
                style={{ background: C.terra, color: "#fff" }}
                aria-hidden
              >
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            aria-controls="store-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="store-menu"
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
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- 첫 화면 ---------- */

function Hero() {
  return (
    <section id="top" className="px-4 pb-16 pt-10 md:px-6 md:pb-24 md:pt-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid items-end gap-5 md:grid-cols-[1fr_400px] md:gap-12">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold" style={{ color: C.terra }}>
              □□동 작업실에서 빚는 그릇
            </p>
            <h1 className="mt-2 text-[40px] font-bold leading-[1.15] tracking-[-0.04em] md:text-[68px]">{SHOP}</h1>
          </div>
          <p style={{ color: C.muted }}>
            두 사람이 물레로 빚고 가마에 두 번 구운 그릇을 팝니다. 같은 모양이어도 유약이 흐른 자리가 조금씩 달라요.
          </p>
        </div>
        <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[4px] md:mt-10 md:aspect-[7/4]">
          <Image
            src={`${IMG}/hero.jpg`}
            alt="햇빛이 드는 공방 나무 선반에 유약을 입힌 그릇과 컵이 줄지어 놓인 모습"
            fill
            priority
            sizes="(min-width: 1200px) 1152px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-[15px]" style={{ color: C.muted }}>
            작업실 선반. 이번 주 가마에서 꺼낸 그릇들입니다.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <a href="#shop" className="inline-flex h-12 items-center rounded-[4px] px-6 font-semibold" style={{ background: C.terra, color: "#fff" }}>
              그릇 보러 가기
            </a>
            <a href="#delivery" className="inline-flex h-12 items-center gap-2 rounded-[4px] border px-5 font-semibold" style={{ borderColor: C.ink }}>
              <Truck size={18} aria-hidden />
              도착일 확인
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ id, title, desc }: { id: string; title: string; desc?: string }) {
  return (
    <div className="border-t pt-6" style={{ borderColor: C.ink }}>
      <h2 id={id} className="text-[28px] font-bold leading-[1.35] tracking-[-0.03em] md:text-[40px]">
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

/* ---------- 그릇 그림 ---------- */

const MARK: Record<Shape, { x: number; y: number; size: number }> = {
  mug: { x: 100, y: 88, size: 12 },
  teacup: { x: 100, y: 98, size: 10 },
  ricebowl: { x: 100, y: 96, size: 12 },
  noodle: { x: 100, y: 96, size: 12 },
  plate: { x: 100, y: 102, size: 12 },
  sidedish: { x: 100, y: 116, size: 9 },
  vase: { x: 100, y: 108, size: 11 },
  teapot: { x: 100, y: 106, size: 12 },
};

const FILL = "motion-safe:transition-[fill,stroke] motion-safe:duration-500";
const HI = "rgba(255,255,255,0.3)";

function ShapeBody({ shape, g }: { shape: Shape; g: Glaze }) {
  switch (shape) {
    case "mug":
      return (
        <g>
          <path className={FILL} d="M138 62 C170 62 170 114 136 114" fill="none" stroke={g.body} strokeWidth="11" strokeLinecap="round" />
          <path className={FILL} d="M60 40 L140 40 L136 128 Q100 136 64 128 Z" fill={g.body} />
          <path d="M64 126 Q100 134 136 126 L135.6 132 Q100 140 64.4 132 Z" fill={g.foot} />
          <ellipse className={FILL} cx="100" cy="40" rx="40" ry="7" fill={g.rim} />
          <ellipse className={FILL} cx="100" cy="41" rx="34" ry="4.5" fill={g.shade} />
          <path d="M72 52 L70 116" stroke={HI} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case "teacup":
      return (
        <g>
          <path className={FILL} d="M64 66 Q64 120 90 128 L110 128 Q136 120 136 66 Z" fill={g.body} />
          <path d="M88 126 L112 126 L111 136 L89 136 Z" fill={g.foot} />
          <ellipse className={FILL} cx="100" cy="66" rx="36" ry="6" fill={g.rim} />
          <ellipse className={FILL} cx="100" cy="67" rx="31" ry="4" fill={g.shade} />
          <path d="M74 78 Q74 106 88 120" stroke={HI} strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      );
    case "ricebowl":
      return (
        <g>
          <path className={FILL} d="M46 62 Q50 120 86 128 L114 128 Q150 120 154 62 Z" fill={g.body} />
          <path d="M84 126 L116 126 L114 138 L86 138 Z" fill={g.foot} />
          <ellipse className={FILL} cx="100" cy="62" rx="54" ry="9" fill={g.rim} />
          <ellipse className={FILL} cx="100" cy="63" rx="48" ry="6" fill={g.shade} />
          <path d="M58 76 Q62 104 80 118" stroke={HI} strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      );
    case "noodle":
      return (
        <g>
          <path className={FILL} d="M28 70 Q36 118 80 126 L120 126 Q164 118 172 70 Z" fill={g.body} />
          <path d="M80 124 L120 124 L118 136 L82 136 Z" fill={g.foot} />
          <ellipse className={FILL} cx="100" cy="70" rx="72" ry="11" fill={g.rim} />
          <ellipse className={FILL} cx="100" cy="71" rx="64" ry="8" fill={g.shade} />
          <path d="M42 84 Q50 104 72 116" stroke={HI} strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      );
    case "plate":
      return (
        <g>
          <ellipse cx="100" cy="128" rx="40" ry="5" fill={g.foot} />
          <ellipse className={FILL} cx="100" cy="106" rx="84" ry="28" fill={g.shade} />
          <ellipse className={FILL} cx="100" cy="100" rx="84" ry="28" fill={g.body} />
          <ellipse className={FILL} cx="100" cy="102" rx="60" ry="18" fill={g.rim} />
          <path d="M34 92 Q60 78 100 74" stroke={HI} strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      );
    case "sidedish":
      return (
        <g>
          <ellipse cx="100" cy="130" rx="28" ry="4" fill={g.foot} />
          <path className={FILL} d="M50 96 Q54 126 100 128 Q146 126 150 96 Z" fill={g.body} />
          <ellipse className={FILL} cx="100" cy="96" rx="50" ry="16" fill={g.rim} />
          <ellipse className={FILL} cx="100" cy="98" rx="40" ry="11" fill={g.shade} />
          <path d="M60 106 Q66 118 80 122" stroke={HI} strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      );
    case "vase":
      return (
        <g>
          <path className={FILL} d="M91 30 L109 30 L108 54 Q140 70 140 104 Q140 130 114 136 L86 136 Q60 130 60 104 Q60 70 92 54 Z" fill={g.body} />
          <path d="M86 134 L114 134 L113 139 L87 139 Z" fill={g.foot} />
          <ellipse className={FILL} cx="100" cy="30" rx="9" ry="3" fill={g.rim} />
          <ellipse className={FILL} cx="100" cy="30.4" rx="5" ry="1.6" fill={g.shade} />
          <path d="M72 88 Q69 112 82 126" stroke={HI} strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      );
    case "teapot":
      return (
        <g>
          <path className={FILL} d="M62 86 Q42 86 28 62 L36 58 Q48 76 62 76 Z" fill={g.body} />
          <path className={FILL} d="M138 92 L172 78" stroke={g.body} strokeWidth="11" strokeLinecap="round" />
          <path className={FILL} d="M58 74 Q52 128 100 132 Q148 128 142 74 Z" fill={g.body} />
          <path d="M82 130 L118 130 L117 138 L83 138 Z" fill={g.foot} />
          <ellipse className={FILL} cx="100" cy="74" rx="42" ry="8" fill={g.rim} />
          <ellipse className={FILL} cx="100" cy="72" rx="30" ry="5" fill={g.body} />
          <rect className={FILL} x="96.5" y="62" width="7" height="9" fill={g.body} />
          <circle className={FILL} cx="100" cy="61" r="6" fill={g.rim} />
          <path d="M68 86 Q66 110 82 122" stroke={HI} strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

const SPECKS = [
  [-18, 8],
  [12, 12],
  [20, -2],
  [-6, 16],
  [4, -4],
  [-22, -4],
];

function Ceramic({ shape, glaze, engrave = "", scale = 1 }: { shape: Shape; glaze: GlazeId; engrave?: string; scale?: number }) {
  const g = GLAZE_BY_ID[glaze];
  const mark = MARK[shape];
  return (
    <g>
      <ellipse cx="100" cy="143" rx="66" ry="6" fill="rgba(35,32,29,0.10)" />
      <g
        transform={scale === 1 ? undefined : `translate(100 140) scale(${scale}) translate(-100 -140)`}
        className="motion-safe:transition-transform motion-safe:duration-500"
      >
        <ShapeBody shape={shape} g={g} />
        {glaze === "buncheong" && (
          <g aria-hidden>
            <path d={`M${mark.x - 26} ${mark.y - 14} q 26 -8 52 0`} stroke="#f4ede1" strokeWidth="5" opacity="0.75" fill="none" strokeLinecap="round" />
            {SPECKS.map(([dx, dy]) => (
              <circle key={`${dx}${dy}`} cx={mark.x + dx} cy={mark.y + dy} r="1.3" fill="#7d6a52" opacity="0.55" />
            ))}
          </g>
        )}
        {engrave && (
          <text x={mark.x} y={mark.y + 4} textAnchor="middle" fontSize={mark.size} fontWeight={600} letterSpacing="1" fill={g.mark}>
            {engrave}
          </text>
        )}
      </g>
    </g>
  );
}

function Swatch({ glaze, size = 22 }: { glaze: Glaze; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background:
          glaze.id === "buncheong"
            ? `radial-gradient(circle at 30% 30%, ${glaze.rim} 0 30%, ${glaze.body} 31%)`
            : `linear-gradient(135deg, ${glaze.rim}, ${glaze.body} 60%)`,
        boxShadow: "inset 0 0 0 1px rgba(35,32,29,0.15)",
      }}
      aria-hidden
    />
  );
}

/* ---------- 상품 목록 ---------- */

function Shop({ onOpen }: { onOpen: (id: string, glaze: GlazeId) => void }) {
  const [cat, setCat] = useState<Cat | "all">("all");
  const [sort, setSort] = useState<Sort>("new");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Record<string, GlazeId>>({});

  const q = query.trim();
  const list = PRODUCTS.filter((p) => (cat === "all" || p.cat === cat) && (!q || p.name.includes(q) || p.desc.includes(q))).sort((a, b) =>
    sort === "new" ? b.added.localeCompare(a.added) : sort === "low" ? a.price - b.price : b.price - a.price,
  );

  return (
    <section aria-labelledby="shop-title" id="shop" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="shop-title"
          title="유약을 바꿔 가며 골라 보세요"
          desc="색 동그라미를 누르면 그림이 그 유약으로 바뀝니다. 그릇을 누르면 크기와 각인을 고를 수 있어요."
        />

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-1" role="group" aria-label="분류">
            {CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
                className="h-11 border-b-2 text-[16px] font-semibold transition-colors"
                style={cat === c.id ? { borderColor: C.terra, color: C.ink } : { borderColor: "transparent", color: C.muted }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="정렬">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={sort === s.id}
                  onClick={() => setSort(s.id)}
                  className="h-10 rounded-[4px] border px-3 text-[14px] font-semibold"
                  style={sort === s.id ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line, color: C.muted, background: C.paper }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <label className="relative block sm:w-[220px]">
              <span className="sr-only">상품 이름 검색</span>
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="머그, 접시, 화병"
                className="h-11 w-full rounded-[4px] border pl-10 pr-3 text-[16px] outline-none focus:border-[#b5562f]"
                style={{ borderColor: C.clay, background: C.paper }}
              />
            </label>
          </div>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {list.map((p, i) => {
            const glaze = picked[p.id] ?? p.glazes[0];
            const g = GLAZE_BY_ID[glaze];
            const feature = i === 0;
            const soldOut = p.sizes.every((s) => stockOf(p.id, glaze, s.id) === 0);
            return (
              <li key={p.id} className={`min-w-0 ${feature ? "col-span-2" : ""}`}>
                <button
                  type="button"
                  onClick={() => onOpen(p.id, glaze)}
                  aria-label={`${p.name} ${g.label} 자세히 보기`}
                  className="group block w-full overflow-hidden rounded-[4px] text-left"
                  style={{ background: C.claySoft }}
                >
                  <span className={`flex items-center justify-center ${feature ? "aspect-square md:aspect-[2/1]" : "aspect-square"}`}>
                    <svg
                      viewBox="0 0 200 160"
                      className={`h-auto motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-[1.04] ${feature ? "w-[78%] md:w-[46%]" : "w-[82%]"}`}
                      aria-hidden
                    >
                      <Ceramic shape={p.shape} glaze={glaze} />
                    </svg>
                  </span>
                </button>
                <div className={`mt-3 ${feature ? "md:flex md:items-start md:justify-between md:gap-6" : ""}`}>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-bold leading-[1.4]">{p.name}</span>
                      {p.isNew && (
                        <span className="text-[13px] font-semibold" style={{ color: C.terra }}>
                          새로 나옴
                        </span>
                      )}
                    </p>
                    <p className="text-[15px] tabular-nums">
                      {won(p.price)}
                      <span style={{ color: C.muted }}>
                        {" "}
                        {g.label}
                        {soldOut && ", 다 팔림"}
                      </span>
                    </p>
                    {feature && (
                      <p className="mt-1 hidden max-w-[440px] text-[15px] md:block" style={{ color: C.muted }}>
                        {p.desc}
                      </p>
                    )}
                  </div>
                  <div className="-ml-1.5 mt-1 flex flex-wrap" role="group" aria-label={`${p.name} 유약 고르기`}>
                    {p.glazes.map((id) => (
                      <button
                        key={id}
                        type="button"
                        aria-label={GLAZE_BY_ID[id].label}
                        aria-pressed={glaze === id}
                        onClick={() => setPicked((prev) => ({ ...prev, [p.id]: id }))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                      >
                        <span className="inline-flex rounded-full p-[3px]" style={{ boxShadow: glaze === id ? `0 0 0 1.5px ${C.ink}` : "none" }}>
                          <Swatch glaze={GLAZE_BY_ID[id]} size={20} />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {list.length === 0 && (
          <p className="mt-8 rounded-[4px] p-8 text-center" style={{ background: C.claySoft, color: C.muted }}>
            찾는 그릇이 없어요. 다른 이름으로 찾아보세요.
          </p>
        )}
      </div>
    </section>
  );
}

/* ---------- 상품 창 ---------- */

function ProductDialog({
  productId,
  initialGlaze,
  onClose,
  onAdd,
}: {
  productId: string;
  initialGlaze: GlazeId;
  onClose: () => void;
  onAdd: (line: Omit<CartLine, "key">) => void;
}) {
  const reduce = useReducedMotionSafe();
  const closeRef = useDialog(onClose);
  const p = PRODUCT_BY_ID[productId];
  const [glaze, setGlaze] = useState<GlazeId>(initialGlaze);
  const [sizeId, setSizeId] = useState(p.sizes[0].id);
  const [qty, setQty] = useState(1);
  const [engraveOn, setEngraveOn] = useState(false);
  const [engrave, setEngrave] = useState("");

  const size = p.sizes.find((s) => s.id === sizeId) ?? p.sizes[0];
  const stock = stockOf(p.id, glaze, size.id);
  const count = Math.min(qty, Math.max(stock, 1));
  const text = engraveOn ? engrave.trim() : "";
  const unit = p.price + size.add + (text ? ENGRAVE_FEE : 0);
  const g = GLAZE_BY_ID[glaze];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
      style={{ background: "rgba(35,32,29,0.5)" }}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[12px] md:max-w-[900px] md:rounded-[6px]"
        style={{ background: C.paper }}
        initial={reduce ? false : { y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
        transition={{ duration: 0.32, ease: EASE }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="상품 창 닫기"
          className="absolute right-2 top-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full"
          style={{ color: C.ink }}
        >
          <X size={22} aria-hidden />
        </button>
        <div className="grid md:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col items-center justify-center px-6 pb-4 pt-12 md:py-10" style={{ background: C.claySoft }}>
            <svg viewBox="0 0 200 160" className="h-auto w-full max-w-[380px]" role="img" aria-label={`${g.label} ${p.name} ${size.label}${text ? `, 각인 ${text}` : ""}`}>
              <Ceramic shape={p.shape} glaze={glaze} engrave={text} scale={size.scale} />
            </svg>
            <p className="mt-2 text-center text-[14px]" style={{ color: C.muted }}>
              {g.label}. {g.note}
            </p>
          </div>

          <div className="min-w-0 p-5 md:p-8">
            <h2 id="product-title" className="pr-10 text-[26px] font-bold leading-[1.3] tracking-[-0.03em]">
              {p.name}
            </h2>
            <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
              {p.desc}
            </p>

            <fieldset className="mt-6">
              <legend className="text-[15px] font-semibold">유약</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {p.glazes.map((id) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={glaze === id}
                    onClick={() => {
                      setGlaze(id);
                      setQty(1);
                    }}
                    className="flex h-11 items-center gap-2 rounded-[4px] border px-3 text-[15px] font-semibold"
                    style={glaze === id ? { borderColor: C.ink, boxShadow: `inset 0 0 0 1px ${C.ink}` } : { borderColor: C.line }}
                  >
                    <Swatch glaze={GLAZE_BY_ID[id]} size={18} />
                    {GLAZE_BY_ID[id].label}
                  </button>
                ))}
              </div>
            </fieldset>

            {p.sizes.length > 1 && (
              <fieldset className="mt-5">
                <legend className="text-[15px] font-semibold">크기</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {p.sizes.map((s) => {
                    const left = stockOf(p.id, glaze, s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        aria-pressed={sizeId === s.id}
                        onClick={() => {
                          setSizeId(s.id);
                          setQty(1);
                        }}
                        className="flex min-h-11 flex-col items-start justify-center rounded-[4px] border px-3 py-1.5 text-left text-[15px] font-semibold"
                        style={sizeId === s.id ? { borderColor: C.ink, boxShadow: `inset 0 0 0 1px ${C.ink}` } : { borderColor: C.line }}
                      >
                        {s.label}
                        <span className="text-[13px] font-normal" style={{ color: left ? C.muted : C.terra }}>
                          {s.add ? `+${won(s.add)}` : "기본"}
                          {left ? "" : ", 다 팔림"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}
            {p.sizes.length === 1 && (
              <p className="mt-5 text-[15px]">
                <span className="font-semibold">크기</span> <span style={{ color: C.muted }}>{size.label}</span>
              </p>
            )}

            <p className="mt-4 text-[15px] font-semibold" style={{ color: stock === 0 ? C.terra : stock <= 2 ? C.terraDeep : C.muted }} aria-live="polite">
              {stock === 0
                ? `${g.label} ${size.label}는 다 팔렸어요. 다음 가마는 2주 뒤에 나와요.`
                : stock <= 2
                  ? `${g.label} ${size.label} ${stock}개 남았어요`
                  : `${g.label} ${size.label} ${stock}개 있어요`}
            </p>

            <div className="mt-5 rounded-[4px] border p-4" style={{ borderColor: C.line }}>
              <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px] font-semibold">
                <input type="checkbox" checked={engraveOn} onChange={(e) => setEngraveOn(e.target.checked)} className="h-5 w-5 accent-[#b5562f]" />
                각인 넣기 (+{won(ENGRAVE_FEE)})
              </label>
              {engraveOn && (
                <div className="mt-2">
                  <label htmlFor="engrave-text" className="sr-only">
                    각인 문구
                  </label>
                  <input
                    id="engrave-text"
                    value={engrave}
                    maxLength={ENGRAVE_MAX}
                    onChange={(e) => setEngrave(e.target.value)}
                    placeholder="하늘, 2026.10"
                    className="h-11 w-full rounded-[4px] border px-3 outline-none focus:border-[#b5562f]"
                    style={{ borderColor: C.clay, background: "#fff" }}
                    aria-describedby="engrave-help"
                  />
                  <p id="engrave-help" className="mt-1.5 text-[13px]" style={{ color: C.muted }}>
                    {engrave.length}/{ENGRAVE_MAX}자. 각인한 그릇은 교환이나 반품이 어려워요.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1" role="group" aria-label="수량">
                <button
                  type="button"
                  onClick={() => setQty((n) => Math.max(1, n - 1))}
                  disabled={count <= 1}
                  aria-label="하나 빼기"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border disabled:opacity-30"
                  style={{ borderColor: C.line }}
                >
                  <Minus size={17} aria-hidden />
                </button>
                <span className="w-10 text-center font-bold tabular-nums" aria-live="polite">
                  {count}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((n) => Math.min(stock, n + 1))}
                  disabled={count >= stock}
                  aria-label="하나 더"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] border disabled:opacity-30"
                  style={{ borderColor: C.line }}
                >
                  <Plus size={17} aria-hidden />
                </button>
              </div>
              <p className="text-[22px] font-bold tabular-nums">{won(unit * count)}</p>
            </div>

            <button
              type="button"
              disabled={stock === 0 || (engraveOn && !text)}
              onClick={() => onAdd({ productId: p.id, glaze, size: size.id, engrave: text, qty: count })}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[4px] font-semibold disabled:opacity-40"
              style={{ background: C.terra, color: "#fff" }}
            >
              <ShoppingBag size={18} aria-hidden />
              장바구니에 담기
            </button>
            {engraveOn && !text && (
              <p className="mt-2 text-[14px]" style={{ color: C.terraDeep }}>
                새길 문구를 적어 주세요.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- 장바구니 ---------- */

function totals(cart: CartLine[], region: Region, giftOn: boolean) {
  const items = cart.reduce((s, l) => s + linePrice(l) * l.qty, 0);
  const ship = items === 0 ? 0 : items >= FREE_SHIP ? 0 : SHIP_FEE;
  const extra = items === 0 ? 0 : REGION_BY_ID[region].extra;
  const giftFee = items && giftOn ? GIFT_FEE : 0;
  return { items, ship, extra, giftFee, total: items + ship + extra + giftFee };
}

function RegionPicker({ region, onRegion, label }: { region: Region; onRegion: (r: Region) => void; label: string }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
      {REGIONS.map((r) => (
        <button
          key={r.id}
          type="button"
          aria-pressed={region === r.id}
          onClick={() => onRegion(r.id)}
          className="h-10 rounded-[4px] border px-3 text-[14px] font-semibold"
          style={region === r.id ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line, background: C.paper }}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function CartDrawer({
  cart,
  minute,
  region,
  onRegion,
  gift,
  onGift,
  onQty,
  onRemove,
  onClose,
  onCheckout,
}: {
  cart: CartLine[];
  minute: number;
  region: Region;
  onRegion: (r: Region) => void;
  gift: GiftState;
  onGift: (g: GiftState) => void;
  onQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  onClose: () => void;
  onCheckout: () => void;
}) {
  const reduce = useReducedMotionSafe();
  const closeRef = useDialog(onClose);
  const t = totals(cart, region, gift.on);
  const left = Math.max(0, FREE_SHIP - t.items);
  const pct = Math.min(100, (t.items / FREE_SHIP) * 100);
  const est = estimate(minute, region);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(35,32,29,0.45)" }}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[440px] flex-col"
        style={{ background: C.bg }}
        initial={reduce ? false : { x: "100%" }}
        animate={{ x: 0 }}
        exit={reduce ? { opacity: 0 } : { x: "100%" }}
        transition={{ duration: 0.34, ease: EASE }}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-5" style={{ borderColor: C.line }}>
          <h2 id="cart-title" className="text-[20px] font-bold">
            장바구니
          </h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="장바구니 닫기" className="inline-flex h-11 w-11 items-center justify-center rounded-full">
            <X size={22} aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-5">
          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag size={36} className="mx-auto" style={{ color: C.clay }} aria-hidden />
              <p className="mt-3 font-semibold">장바구니가 비어 있어요</p>
              <a href="#shop" onClick={onClose} className="mt-4 inline-flex h-11 items-center rounded-[4px] border px-5 font-semibold" style={{ borderColor: C.ink }}>
                그릇 보러 가기
              </a>
            </div>
          ) : (
            <>
              <div className="rounded-[4px] p-4" style={{ background: C.paper }}>
                <p className="flex items-center gap-2 text-[15px] font-semibold" aria-live="polite">
                  <Truck size={18} style={{ color: C.terra }} aria-hidden />
                  {left > 0 ? `${won(left)} 더 담으면 배송비가 무료예요` : "배송비 없이 보내 드려요"}
                </p>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full"
                  style={{ background: C.claySoft }}
                  role="progressbar"
                  aria-label="무료배송까지 담은 금액"
                  aria-valuemin={0}
                  aria-valuemax={FREE_SHIP}
                  aria-valuenow={Math.min(FREE_SHIP, t.items)}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: C.terra }}
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                  />
                </div>
                <p className="mt-1.5 flex justify-between text-[13px] tabular-nums" style={{ color: C.muted }}>
                  <span>{won(t.items)}</span>
                  <span>{won(FREE_SHIP)}</span>
                </p>
              </div>

              <ul className="mt-4 divide-y" style={{ borderColor: C.line }}>
                {cart.map((l) => {
                  const p = PRODUCT_BY_ID[l.productId];
                  const max = stockOf(l.productId, l.glaze, l.size);
                  return (
                    <li key={l.key} className="flex gap-3 py-4" style={{ borderColor: C.line }}>
                      <span className="flex h-[64px] w-[72px] shrink-0 items-center justify-center rounded-[4px]" style={{ background: C.claySoft }}>
                        <svg viewBox="0 0 200 160" className="h-auto w-[64px]" aria-hidden>
                          <Ceramic shape={p.shape} glaze={l.glaze} engrave={l.engrave} />
                        </svg>
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold leading-[1.4]">{p.name}</p>
                          <button
                            type="button"
                            onClick={() => onRemove(l.key)}
                            aria-label={`${p.name} 빼기`}
                            className="-mr-2 -mt-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                            style={{ color: C.muted }}
                          >
                            <Trash2 size={17} aria-hidden />
                          </button>
                        </div>
                        <p className="break-keep text-[14px]" style={{ color: C.muted }}>
                          {lineOptions(l)}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onQty(l.key, -1)}
                              disabled={l.qty <= 1}
                              aria-label={`${p.name} 하나 빼기`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border disabled:opacity-30"
                              style={{ borderColor: C.line }}
                            >
                              <Minus size={15} aria-hidden />
                            </button>
                            <span className="w-7 text-center font-bold tabular-nums">{l.qty}</span>
                            <button
                              type="button"
                              onClick={() => onQty(l.key, 1)}
                              disabled={l.qty >= max}
                              aria-label={`${p.name} 하나 더`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-[4px] border disabled:opacity-30"
                              style={{ borderColor: C.line }}
                            >
                              <Plus size={15} aria-hidden />
                            </button>
                          </span>
                          <span className="font-semibold tabular-nums">{won(linePrice(l) * l.qty)}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <GiftWrap gift={gift} onGift={onGift} />

              <div className="mt-4 rounded-[4px] p-4" style={{ background: C.paper }}>
                <p className="text-[15px] font-semibold">받는 지역</p>
                <div className="mt-2">
                  <RegionPicker region={region} onRegion={onRegion} label="받는 지역" />
                </div>
                <p className="mt-3 text-[15px]" aria-live="polite">
                  {est ? (
                    <>
                      <span className="font-bold">{dateText(est.arrive)}</span> 도착 예정
                      <span className="block text-[13px]" style={{ color: C.muted }}>
                        {est.todayShip ? "오늘 보내 드려요" : `${dateText(est.ship)}에 보내 드려요`}
                      </span>
                    </>
                  ) : (
                    " "
                  )}
                </p>
              </div>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="shrink-0 border-t px-4 pb-5 pt-4 md:px-5" style={{ borderColor: C.line, background: C.paper }}>
            <dl className="space-y-1 text-[15px] tabular-nums">
              <div className="flex justify-between">
                <dt style={{ color: C.muted }}>상품 금액</dt>
                <dd>{won(t.items)}</dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: C.muted }}>배송비</dt>
                <dd>{t.ship ? won(t.ship) : "무료"}</dd>
              </div>
              {t.extra > 0 && (
                <div className="flex justify-between">
                  <dt style={{ color: C.muted }}>제주·도서산간 추가</dt>
                  <dd>{won(t.extra)}</dd>
                </div>
              )}
              {t.giftFee > 0 && (
                <div className="flex justify-between">
                  <dt style={{ color: C.muted }}>선물 포장</dt>
                  <dd>{won(t.giftFee)}</dd>
                </div>
              )}
              <div className="flex justify-between pt-1 text-[18px] font-bold">
                <dt>합계</dt>
                <dd>{won(t.total)}</dd>
              </div>
            </dl>
            <button type="button" onClick={onCheckout} className="mt-4 h-12 w-full rounded-[4px] font-semibold" style={{ background: C.terra, color: "#fff" }}>
              주문하기
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ---------- 선물 포장 ---------- */

function wrapLines(text: string, per: number, max: number) {
  const chars = [...text.trim()];
  const lines: string[] = [];
  for (let i = 0; i < chars.length && lines.length < max; i += per) lines.push(chars.slice(i, i + per).join(""));
  return lines;
}

function GiftPreview({ gift }: { gift: GiftState }) {
  const ribbon = RIBBONS.find((r) => r.id === gift.ribbon)!.color;
  const lines = wrapLines(gift.message, 8, 3);
  return (
    <svg viewBox="0 0 260 170" className="h-auto w-full" role="img" aria-label={`${PAPERS.find((p) => p.id === gift.paper)!.label} 포장지에 ${RIBBONS.find((r) => r.id === gift.ribbon)!.label} 리본을 묶은 상자${gift.message.trim() ? `, 카드 문구 ${gift.message.trim()}` : ""}`}>
      <defs>
        <pattern id="gift-stripe" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="14" height="14" fill="#d9c7b4" />
          <rect width="5" height="14" fill="#c7b098" />
        </pattern>
        <pattern id="gift-dot" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#f3ece2" />
          <circle cx="4" cy="4" r="2.2" fill="#b5562f" opacity="0.55" />
          <circle cx="12" cy="12" r="2.2" fill="#b5562f" opacity="0.55" />
        </pattern>
        <pattern id="gift-leaf" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="#e7e2d3" />
          <path d="M4 18 Q6 8 14 6 Q12 14 4 18Z" fill="#7d8456" opacity="0.6" />
          <path d="M4 18 L12 9" stroke="#5f6640" strokeWidth="0.8" opacity="0.6" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="260" height="170" fill={C.claySoft} />
      <ellipse cx="108" cy="150" rx="78" ry="7" fill="rgba(35,32,29,0.12)" />
      <rect x="34" y="50" width="148" height="98" rx="2" fill={`url(#gift-${gift.paper})`} stroke="rgba(35,32,29,0.15)" />
      <rect x="34" y="50" width="148" height="18" fill="rgba(35,32,29,0.06)" />
      <rect x="100" y="50" width="16" height="98" fill={ribbon} className={FILL} />
      <rect x="34" y="92" width="148" height="12" fill={ribbon} className={FILL} />
      <path d="M108 50 Q84 26 78 40 Q76 52 108 50Z" fill={ribbon} className={FILL} />
      <path d="M108 50 Q132 26 138 40 Q140 52 108 50Z" fill={ribbon} className={FILL} />
      <path d="M104 50 L94 70 M112 50 L122 70" stroke={ribbon} strokeWidth="5" strokeLinecap="round" className={FILL} />
      <circle cx="108" cy="50" r="6" fill={ribbon} className={FILL} />
      <g transform="translate(160 76) rotate(6)">
        <rect x="0" y="0" width="88" height="70" rx="2" fill="#fffdf9" stroke="rgba(35,32,29,0.18)" />
        <line x1="8" y1="14" x2="80" y2="14" stroke={ribbon} strokeWidth="1.5" />
        {lines.length ? (
          lines.map((ln, i) => (
            <text key={i} x="44" y={32 + i * 14} textAnchor="middle" fontSize="11" fill={C.ink}>
              {ln}
            </text>
          ))
        ) : (
          <text x="44" y="40" textAnchor="middle" fontSize="10" fill="#a2978b">
            카드 문구
          </text>
        )}
      </g>
    </svg>
  );
}

function GiftWrap({ gift, onGift }: { gift: GiftState; onGift: (g: GiftState) => void }) {
  const reduce = useReducedMotionSafe();
  return (
    <div className="mt-4 rounded-[4px] p-4" style={{ background: C.paper }}>
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px] font-semibold">
        <input type="checkbox" checked={gift.on} onChange={(e) => onGift({ ...gift, on: e.target.checked })} className="h-5 w-5 accent-[#b5562f]" />
        <Gift size={18} style={{ color: C.terra }} aria-hidden />
        선물 포장 (+{won(GIFT_FEE)})
      </label>
      <AnimatePresence initial={false}>
        {gift.on && (
          <motion.div
            className="overflow-hidden"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="pt-3">
              <div className="overflow-hidden rounded-[4px]">
                <GiftPreview gift={gift} />
              </div>
              <fieldset className="mt-4">
                <legend className="text-[14px] font-semibold">포장지</legend>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {PAPERS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={gift.paper === p.id}
                      onClick={() => onGift({ ...gift, paper: p.id })}
                      className="h-10 rounded-[4px] border px-3 text-[14px] font-semibold"
                      style={gift.paper === p.id ? { borderColor: C.ink, boxShadow: `inset 0 0 0 1px ${C.ink}` } : { borderColor: C.line }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="mt-3">
                <legend className="text-[14px] font-semibold">리본</legend>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {RIBBONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      aria-pressed={gift.ribbon === r.id}
                      onClick={() => onGift({ ...gift, ribbon: r.id })}
                      className="inline-flex h-10 items-center gap-1.5 rounded-[4px] border px-3 text-[14px] font-semibold"
                      style={gift.ribbon === r.id ? { borderColor: C.ink, boxShadow: `inset 0 0 0 1px ${C.ink}` } : { borderColor: C.line }}
                    >
                      <span className="h-3.5 w-3.5 rounded-full" style={{ background: r.color }} aria-hidden />
                      {r.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="mt-3 block">
                <span className="text-[14px] font-semibold">카드 문구</span>
                <textarea
                  value={gift.message}
                  maxLength={GIFT_MESSAGE_MAX}
                  onChange={(e) => onGift({ ...gift, message: e.target.value })}
                  rows={2}
                  placeholder="새집에서 따뜻한 밥 드세요"
                  className="mt-1 w-full resize-none rounded-[4px] border px-3 py-2 text-[16px] outline-none focus:border-[#b5562f]"
                  style={{ borderColor: C.clay, background: "#fff" }}
                />
                <span className="block text-right text-[13px] tabular-nums" style={{ color: C.muted }}>
                  {gift.message.length}/{GIFT_MESSAGE_MAX}
                </span>
              </label>
              <p className="text-[13px]" style={{ color: C.muted }}>
                가격표는 빼고 보내 드려요.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- 주문서 ---------- */

type Pay = "card" | "bank" | "phone";

const PAYS: { id: Pay; label: string }[] = [
  { id: "card", label: "신용·체크카드" },
  { id: "bank", label: "계좌이체" },
  { id: "phone", label: "휴대폰 결제" },
];

interface Done {
  no: string;
  name: string;
  phone: string;
  pay: string;
  total: number;
  arrive: string;
  items: { key: string; name: string; options: string; qty: number }[];
  gift: boolean;
}

function CheckoutDialog({
  cart,
  region,
  onRegion,
  gift,
  onClose,
  onOrdered,
}: {
  cart: CartLine[];
  region: Region;
  onRegion: (r: Region) => void;
  gift: GiftState;
  onClose: () => void;
  onOrdered: () => void;
}) {
  const reduce = useReducedMotionSafe();
  const closeRef = useDialog(onClose);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [addr2, setAddr2] = useState("");
  const [pay, setPay] = useState<Pay>("card");
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const t = totals(cart, region, gift.on);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return setError("장바구니에 담긴 상품이 없어요.");
    if (name.trim().length < 2) return setError("받는 분 이름을 두 글자 이상 적어 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setError("휴대전화 번호를 적어 주세요.");
    if (addr.trim().length < 5) return setError("받으실 주소를 적어 주세요.");
    setError("");
    const now = new Date();
    const est = estimate(Math.floor(now.getTime() / 60_000), region);
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    setDone({
      no: `${ymd}-${String((now.getMinutes() * 60 + now.getSeconds()) % 10000).padStart(4, "0")}`,
      name: maskName(name),
      phone: maskPhone(phone),
      pay: PAYS.find((p) => p.id === pay)!.label,
      total: t.total,
      arrive: est ? dateText(est.arrive) : "",
      items: cart.map((l) => ({ key: l.key, name: PRODUCT_BY_ID[l.productId].name, options: lineOptions(l), qty: l.qty })),
      gift: gift.on,
    });
    onOrdered();
  };

  const field = "mt-1 h-12 w-full rounded-[4px] border px-3 outline-none focus:border-[#b5562f]";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
      style={{ background: "rgba(35,32,29,0.5)" }}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[94vh] w-full overflow-y-auto rounded-t-[12px] md:max-w-[560px] md:rounded-[6px]"
        style={{ background: C.paper }}
        initial={reduce ? false : { y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
        transition={{ duration: 0.32, ease: EASE }}
      >
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b px-5" style={{ borderColor: C.line, background: C.paper }}>
          <h2 id="checkout-title" className="text-[20px] font-bold">
            {done ? "주문 완료" : "주문서"}
          </h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="주문서 닫기" className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full">
            <X size={22} aria-hidden />
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div
              key="done"
              className="px-5 pb-7 pt-6"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              aria-live="polite"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full" style={{ background: C.terra, color: "#fff" }}>
                <Check size={26} aria-hidden />
              </span>
              <p className="mt-3 text-[24px] font-bold tracking-[-0.02em]">주문이 접수됐어요</p>
              <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                보내는 날 송장 번호를 문자로 알려 드려요.
              </p>
              <dl className="mt-5 divide-y border-y text-[15px]" style={{ borderColor: C.line }}>
                {[
                  ["주문번호", done.no],
                  ["받는 분", done.name],
                  ["휴대전화", done.phone],
                  ["결제 수단", `${done.pay} (테스트)`],
                  ["도착 예정", done.arrive],
                  ["결제 금액", won(done.total)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5" style={{ borderColor: C.line }}>
                    <dt style={{ color: C.muted }}>{k}</dt>
                    <dd className="text-right font-semibold tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-4 space-y-2 text-[15px]">
                {done.items.map((it) => (
                  <li key={it.key}>
                    <span className="font-semibold">{it.name}</span> {it.qty}개
                    <span className="block text-[14px]" style={{ color: C.muted }}>
                      {it.options}
                    </span>
                  </li>
                ))}
                {done.gift && (
                  <li className="flex items-center gap-1.5 font-semibold">
                    <Gift size={16} style={{ color: C.terra }} aria-hidden />
                    선물 포장
                  </li>
                )}
              </ul>
              <button type="button" onClick={onClose} className="mt-6 h-12 w-full rounded-[4px] font-semibold" style={{ background: C.ink, color: "#fff" }}>
                쇼핑 계속하기
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} noValidate className="px-5 pb-7 pt-5" exit={{ opacity: 0 }}>
              <p className="rounded-[4px] px-3 py-2 text-[14px] font-semibold" style={{ background: C.claySoft, color: C.terraDeep }}>
                데모 화면이라 실제로 결제되지 않아요.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[15px] font-semibold">받는 분</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="김하늘" className={field} style={{ borderColor: C.clay }} />
                </label>
                <label className="block">
                  <span className="text-[15px] font-semibold">휴대전화</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" className={field} style={{ borderColor: C.clay }} />
                </label>
              </div>
              <label className="mt-3 block">
                <span className="text-[15px] font-semibold">주소</span>
                <input value={addr} onChange={(e) => setAddr(e.target.value)} autoComplete="street-address" placeholder="□□시 □□구 □□로 00" className={field} style={{ borderColor: C.clay }} />
              </label>
              <label className="mt-3 block">
                <span className="sr-only">상세 주소</span>
                <input value={addr2} onChange={(e) => setAddr2(e.target.value)} placeholder="상세 주소 (동, 호수)" className="h-12 w-full rounded-[4px] border px-3 outline-none focus:border-[#b5562f]" style={{ borderColor: C.clay }} />
              </label>
              <div className="mt-4">
                <p className="text-[15px] font-semibold">받는 지역</p>
                <div className="mt-2">
                  <RegionPicker region={region} onRegion={onRegion} label="받는 지역" />
                </div>
              </div>
              <fieldset className="mt-5">
                <legend className="text-[15px] font-semibold">결제 수단 (테스트)</legend>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {PAYS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={pay === p.id}
                      onClick={() => setPay(p.id)}
                      className="h-12 rounded-[4px] border px-3 text-[15px] font-semibold"
                      style={pay === p.id ? { borderColor: C.ink, boxShadow: `inset 0 0 0 1px ${C.ink}` } : { borderColor: C.line }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <dl className="mt-5 space-y-1 border-t pt-4 text-[15px] tabular-nums" style={{ borderColor: C.line }}>
                <div className="flex justify-between">
                  <dt style={{ color: C.muted }}>상품 {cart.reduce((s, l) => s + l.qty, 0)}개</dt>
                  <dd>{won(t.items)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: C.muted }}>배송비</dt>
                  <dd>{t.ship + t.extra ? won(t.ship + t.extra) : "무료"}</dd>
                </div>
                {t.giftFee > 0 && (
                  <div className="flex justify-between">
                    <dt style={{ color: C.muted }}>선물 포장</dt>
                    <dd>{won(t.giftFee)}</dd>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-[18px] font-bold">
                  <dt>결제 금액</dt>
                  <dd>{won(t.total)}</dd>
                </div>
              </dl>

              {error && (
                <p className="mt-4 text-[15px] font-semibold" style={{ color: "#b3261e" }} role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="mt-5 h-12 w-full rounded-[4px] font-semibold" style={{ background: C.terra, color: "#fff" }}>
                {won(t.total)} 결제하기
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ---------- 배송 안내 ---------- */

function Delivery({ minute, region, onRegion }: { minute: number; region: Region; onRegion: (r: Region) => void }) {
  const reduce = useReducedMotionSafe();
  const est = estimate(minute, region);
  const days = est ? Array.from({ length: 8 }, (_, i) => addDays(est.today, i)) : [];

  return (
    <section aria-labelledby="delivery-title" id="delivery" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.paper }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="delivery-title"
          title="지금 주문하면 언제 받을까요"
          desc="평일 오후 2시 전 주문은 그날 포장해서 보냅니다. 주말에는 보내지 않고, 택배도 주말을 빼고 셉니다."
        />
        <div className="mt-10 grid items-start gap-8 md:grid-cols-[320px_1fr] md:gap-12">
          <div>
            <p className="text-[15px] font-semibold">받는 지역</p>
            <div className="mt-2">
              <RegionPicker region={region} onRegion={onRegion} label="받는 지역" />
            </div>
            <table className="mt-6 w-full text-[15px]">
              <caption className="sr-only">지역별 걸리는 날과 배송비</caption>
              <tbody>
                {REGIONS.map((r) => (
                  <tr key={r.id} className="border-t" style={{ borderColor: C.line }}>
                    <th scope="row" className="py-2.5 text-left font-normal" style={{ color: C.muted }}>
                      {r.label}
                    </th>
                    <td className="py-2.5 text-right">
                      보낸 다음 날부터 {r.days}일{r.extra ? `, +${won(r.extra)}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="min-w-0 rounded-[4px] border p-4 md:p-6" style={{ borderColor: C.line, background: C.bg }} aria-live="polite">
            {est ? (
              <>
                <p className="text-[15px]" style={{ color: C.muted }}>
                  {REGION_BY_ID[region].label}에 지금 주문하면
                </p>
                <p className="mt-1 text-[26px] font-bold leading-[1.3] tracking-[-0.02em] md:text-[32px]">{dateText(est.arrive)} 도착 예정</p>
                <p className="mt-1 text-[15px] font-semibold" style={{ color: C.terraDeep }}>
                  {est.cutoffLeft !== null
                    ? `오늘 보내는 마감까지 ${untilText(est.cutoffLeft)} 남았어요`
                    : `오늘 보내는 시간이 지나 ${dateText(est.ship)}에 보내요`}
                </p>

                <div className="relative mt-6">
                  <ol className="grid grid-cols-8 gap-1">
                    {days.map((d, i) => {
                      const weekend = !isWorkday(d);
                      const isShip = i === est.shipAt;
                      const isArrive = i === est.arriveAt;
                      return (
                        <li
                          key={i}
                          className="flex min-w-0 flex-col items-center rounded-[4px] py-2"
                          style={{
                            background: isArrive ? C.terra : isShip ? C.ink : weekend ? "transparent" : C.paper,
                            color: isArrive || isShip ? "#fff" : weekend ? "#a2978b" : C.ink,
                            outline: weekend && !isShip && !isArrive ? `1px dashed ${C.clay}` : "none",
                            outlineOffset: -1,
                          }}
                          aria-label={`${dateText(d)}${i === 0 ? ", 오늘" : ""}${weekend ? ", 주말" : ""}${isShip ? ", 보내는 날" : ""}${isArrive ? ", 도착 예정" : ""}`}
                        >
                          <span className="text-[12px]">{i === 0 ? "오늘" : DAY_NAMES[d.getDay()]}</span>
                          <span className="text-[16px] font-bold tabular-nums">{d.getDate()}</span>
                          <span className="h-[18px] text-[11px] font-semibold leading-[18px]">{isShip ? "출고" : isArrive ? "도착" : ""}</span>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="relative mt-2 h-1.5 rounded-full" style={{ background: C.claySoft }} aria-hidden>
                    <motion.div
                      className="absolute top-0 h-full rounded-full"
                      style={{ background: C.terra }}
                      initial={false}
                      animate={{ left: `${(est.shipAt / 8) * 100 + 6.25}%`, width: `${((est.arriveAt - est.shipAt) / 8) * 100}%` }}
                      transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                    />
                  </div>
                </div>
                <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
                  공휴일과 명절에는 하루이틀 늦어질 수 있어요. 각인 상품은 하루 더 걸려요.
                </p>
              </>
            ) : (
              <div className="h-[260px]" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 공방 이야기 ---------- */

function Story() {
  return (
    <section aria-labelledby="story-title" id="story" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-[1200px] items-start gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
          <Image src={`${IMG}/detail.jpg`} alt="유약이 고르게 녹아 윤이 나는 그릇들을 가까이서 찍은 모습" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
        </div>
        <div>
          <SectionHead id="story-title" title="물레 두 대와 가마 하나" />
          <p className="mt-5" style={{ color: C.muted }}>
            대표 김○○와 이○○ 두 사람이 2019년부터 □□동 작업실에서 그릇을 만들고 있습니다. 한 번 가마를 땔 때 200점 남짓 나오고, 그중 흠이 없는 것만 골라 올립니다.
          </p>
          <dl className="mt-8">
            {[
              ["흙", "□□ 지역 백토에 옹기토를 조금 섞어 단단하게 만듭니다."],
              ["굽기", "800도로 한 번, 유약을 입혀 1,250도로 한 번 더 굽습니다."],
              ["유약", "백자, 청자, 흑유, 분청 네 가지를 작업실에서 직접 섞습니다."],
              ["쓰는 법", "전자레인지와 식기세척기에 써도 됩니다. 처음 쓰기 전 쌀뜨물에 한 번 끓이면 좋아요."],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[72px_1fr] gap-4 border-t py-4" style={{ borderColor: C.line }}>
                <dt className="font-bold" style={{ color: C.terra }}>
                  {k}
                </dt>
                <dd style={{ color: C.muted }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ---------- 공방 위치 ---------- */

const HOURS = [
  { label: "화요일 ~ 토요일", time: "11:00 ~ 19:00" },
  { label: "일요일, 월요일", time: "쉽니다" },
  { label: "물레 체험 (토요일)", time: "14:00, 16:00 전화 예약" },
];

function visitStatus(minute: number) {
  if (minute < 0) return null;
  const now = new Date(minute * 60_000);
  const day = now.getDay();
  const m = now.getHours() * 60 + now.getMinutes();
  if (day === 0 || day === 1) return { open: false, text: "오늘은 쉬는 날이에요. 화요일 11시에 엽니다." };
  if (m < 660) return { open: false, text: "오늘 11시에 문을 엽니다." };
  if (m >= 1140) return { open: false, text: day === 6 ? "오늘 영업이 끝났어요. 화요일 11시에 엽니다." : "오늘 영업이 끝났어요. 내일 11시에 엽니다." };
  return { open: true, text: "지금 공방 문이 열려 있어요 (19:00까지)" };
}

function MiniMap() {
  return (
    <svg viewBox="0 0 640 380" className="h-auto w-full" role="img" aria-label="□□역 3번 출구에서 공방까지 가는 약도">
      <rect width="640" height="380" fill={C.paper} />
      <path d="M0 120 H640" stroke={C.claySoft} strokeWidth="30" />
      <path d="M260 0 V380" stroke={C.claySoft} strokeWidth="22" />
      <path d="M260 270 H640" stroke={C.claySoft} strokeWidth="14" />
      <text x="24" y="98" fontSize="15" fill={C.muted}>
        □□대로
      </text>
      <text x="430" y="256" fontSize="15" fill={C.muted}>
        □□로 12길
      </text>
      <rect x="60" y="160" width="140" height="80" rx="4" fill={C.claySoft} />
      <text x="130" y="205" fontSize="13" fill={C.muted} textAnchor="middle">
        □□근린공원
      </text>
      <circle cx="170" cy="120" r="16" fill={C.ink} />
      <text x="170" y="125" fontSize="13" fill="#fff" textAnchor="middle" fontWeight={700}>
        3
      </text>
      <text x="126" y="84" fontSize="15" fill={C.ink}>
        □□역 3번 출구
      </text>
      <path d="M188 120 H260 V270 H482" stroke={C.terra} strokeWidth="3" strokeDasharray="6 7" fill="none" />
      <path d="M486 252 H530 Q528 284 508 286 Q488 284 486 252Z" fill={C.terra} />
      <ellipse cx="508" cy="252" rx="22" ry="5" fill={C.ink} />
      <text x="508" y="318" fontSize="16" fill={C.ink} fontWeight={700} textAnchor="middle">
        {SHOP}
      </text>
    </svg>
  );
}

function Visit({ minute }: { minute: number }) {
  const status = visitStatus(minute);
  return (
    <section aria-labelledby="visit-title" id="visit" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.paper }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="visit-title" title="작업실에서 직접 보고 사셔도 돼요" desc="온라인에 없는 시험 작품과 흠이 조금 있는 그릇도 공방에서 싸게 팝니다." />
        <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div className="overflow-hidden rounded-[4px] border" style={{ borderColor: C.line }}>
            <MiniMap />
          </div>
          <div>
            <p className="text-[22px] font-bold tracking-[-0.02em]">{ADDRESS}</p>
            <ul className="mt-5 space-y-4">
              {[
                { icon: TrainFront, title: "지하철", body: "□□역 3번 출구에서 걸어서 7분, 공원을 끼고 돌면 골목 끝에 있어요." },
                { icon: Car, title: "주차", body: "공방 앞에 두 대까지 세울 수 있어요." },
              ].map((r) => (
                <li key={r.title} className="flex gap-3">
                  <r.icon size={20} className="mt-1 shrink-0" style={{ color: C.terra }} aria-hidden />
                  <span>
                    <span className="font-semibold">{r.title}</span>
                    <span className="block text-[15px]" style={{ color: C.muted }}>
                      {r.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <table className="mt-7 w-full border-t text-[15px]" style={{ borderColor: C.ink }}>
              <caption className="sr-only">영업시간</caption>
              <tbody>
                {HOURS.map((h) => (
                  <tr key={h.label} className="border-b" style={{ borderColor: C.line }}>
                    <th scope="row" className="py-3 pr-3 text-left font-normal" style={{ color: C.muted }}>
                      {h.label}
                    </th>
                    <td className="py-3 text-right font-semibold">{h.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 min-h-[26px] text-[15px] font-semibold" style={{ color: status?.open ? "#4d6b3a" : C.terraDeep }}>
              {status?.text}
            </p>
            <a href={`tel:${TEL}`} className="mt-5 inline-flex h-12 items-center rounded-[4px] px-6 font-semibold" style={{ background: C.ink, color: "#fff" }}>
              전화 {TEL}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 자주 묻는 질문 ---------- */

const FAQS = [
  {
    q: "교환이나 반품은 어떻게 하나요?",
    a: "받은 날부터 7일 안에 전화나 메일로 알려 주세요. 단순 변심은 왕복 배송비 7,000원을 내 주시고, 깨지거나 금이 간 채로 받으셨다면 배송비 없이 새것으로 보내 드립니다. 깨진 그릇은 버리지 말고 사진을 찍어 보내 주세요.",
  },
  {
    q: "각인한 그릇도 반품되나요?",
    a: "이름을 새긴 그릇은 다른 분께 팔 수 없어 단순 변심으로는 반품이 어렵습니다. 배송 중 깨진 경우에는 같은 문구로 다시 만들어 보내 드려요.",
  },
  {
    q: "배송은 얼마나 걸리나요?",
    a: "평일 오후 2시 전 주문은 그날 보내고, 그 뒤 주문은 다음 평일에 보냅니다. 수도권은 보낸 다음 날, 지방은 1~2일 뒤, 제주와 도서산간은 2~3일 뒤에 받으실 수 있어요.",
  },
  {
    q: "사진과 색이 조금 달라요.",
    a: "유약이 가마 안 자리마다 다르게 녹아서 같은 백자도 조금씩 색과 무늬가 다릅니다. 흠이 아니라 손으로 만든 그릇의 결이라 이 차이로는 교환해 드리기 어려워요.",
  },
  {
    q: "식기세척기에 넣어도 되나요?",
    a: "네, 됩니다. 다만 흑유는 거친 수세미로 문지르면 윤이 줄어드니 부드러운 쪽으로 닦아 주세요.",
  },
];

function Faq() {
  return (
    <section aria-labelledby="faq-title" id="faq" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="faq-title" title="교환, 반품, 배송" />
        <div className="mt-8 border-t" style={{ borderColor: C.line }}>
          {FAQS.map((f) => (
            <details key={f.q} className="group border-b" style={{ borderColor: C.line }}>
              <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus size={20} className="shrink-0 motion-safe:transition-transform group-open:rotate-45" style={{ color: C.terra }} aria-hidden />
              </summary>
              <p className="max-w-[760px] pb-5" style={{ color: C.muted }}>
                {f.a}
              </p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-[15px]" style={{ color: C.muted }}>
          더 궁금한 점은 {TEL} 또는 hello@example.com 으로 물어봐 주세요. 평일 10시부터 5시까지 답해 드려요.
        </p>
      </div>
    </section>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-4 pb-24 pt-12 md:px-6" style={{ background: C.ink, color: C.claySoft }}>
      <div className="mx-auto max-w-[1200px]">
        <Logo light />
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: "#b3a593" }}>
          {[
            ["상호", SHOP],
            ["대표자", "김○○"],
            ["사업자등록번호", "000-00-00000"],
            ["통신판매업 신고번호", "제0000-□□-0000호"],
            ["주소", ADDRESS],
            ["전화", TEL],
            ["이메일", "hello@example.com"],
            ["개인정보 보호책임자", "이○○"],
          ].map(([k, v]) => (
            <div key={k} className="flex min-w-0 flex-wrap gap-x-2">
              <dt>{k}</dt>
              <dd style={{ color: "#fff" }}>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-[13px]" style={{ color: "#8f8273" }}>
          결제 대행 △△페이먼츠. 고객님의 안전한 거래를 위해 구매안전 서비스를 이용할 수 있습니다.
        </p>
      </div>
    </footer>
  );
}
