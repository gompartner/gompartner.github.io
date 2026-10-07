"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Car, Check, ChevronRight, Heart, Minus, Plus, Search, ShoppingBag, Star, TrainFront, Trash2, X } from "lucide-react";
import { daysAgo, fmtDot, useDemoToday } from "@/hooks/useDemoToday";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 자사 쇼핑몰 데모: 가상의 곰파트너 도자기 공방. 카페24 쇼핑몰형 구성.
   상호, 대표자, 주소, 전화번호, 사업자 정보, 통신판매업 신고번호, 상품과 가격, 재고, 후기는 모두 가상이다.

   디자인: 미색 바탕(#f7f4ef)에 먹색 글자(#23201d), 테라코타(#b5562f), 흙빛(#d9c7b4).
   띠배너, 가운데 로고, 분류 메뉴, 많이 찾는 상품·새로 들어온 상품 목록으로 된 메인과
   상품 상세, 장바구니, 주문서, 주문 완료를 따로 된 화면으로 둔다(라우트 없이 상태로 바꾼다).

   상품 카드와 상세 화면에서 유약(백자, 청자, 흑유, 분청)을 고르면 그 유약으로 찍은 사진으로 바뀐다.
   각인 문구를 적으면 사진 위 그릇 자리에 글자를 얹어 보이고, 조합마다 남은 수량이 다르다.
   도착 예정일은 지금 시각을 기준으로 평일 14시 전 주문은 그날 출고하고 주말은 건너뛰어 지역별로 계산한다.
   주문 완료 화면에는 이름과 전화번호를 가려서 보여 준다.

   사진 출처(public/images/demo-store):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, detail, products/<상품>-<유약>.jpg */

const IMG = "/images/demo-store";
const SHOP = "곰파트너 도자기 공방";
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

const FREE_SHIP = 50_000;
const SHIP_FEE = 3_500;
const ENGRAVE_FEE = 3_000;
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

/** 평일 14시 전 주문은 그날 출고하고, 주말은 출고와 배송 모두 건너뛴다. */
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
  return { today, todayShip, ship, arrive, shipAt: dayIndex(ship), arriveAt: dayIndex(arrive) };
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
  { id: "white", label: "백자", body: "#efe9de", rim: "#fbf8f2", shade: "#d6ccbd", foot: "#c8a27c", mark: "#8a7f72", note: "희고 매끈해서 음식 색이 잘 살아요." },
  { id: "celadon", label: "청자", body: "#9fbaa6", rim: "#c6d8ca", shade: "#7b9884", foot: "#c8a27c", mark: "#46624f", note: "유약이 고인 자리에 푸른빛이 짙게 남아요." },
  { id: "black", label: "흑유", body: "#302a26", rim: "#6b5543", shade: "#1b1815", foot: "#8a6a4f", mark: "#cdb99f", note: "입술 부분에 갈색 띠가 자연스럽게 흘러요." },
  { id: "buncheong", label: "분청", body: "#cbbca4", rim: "#e9e0d1", shade: "#a99880", foot: "#c8a27c", mark: "#6a5a47", note: "흰 흙을 붓으로 바른 자국이 그대로 보여요." },
];

const GLAZE_BY_ID = Object.fromEntries(GLAZES.map((g) => [g.id, g])) as Record<GlazeId, Glaze>;

type Cat = "cup" | "bowl" | "plate" | "etc";

interface Size {
  id: string;
  label: string;
  spec: string;
  add: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  cat: Cat;
  glazes: GlazeId[];
  sizes: Size[];
  added: string;
  gift?: boolean;
  desc: string;
}

const ALL_GLAZES: GlazeId[] = ["white", "celadon", "black", "buncheong"];

const PRODUCTS: Product[] = [
  {
    id: "mug",
    name: "손잡이 머그",
    price: 28_000,
    cat: "cup",
    glazes: ALL_GLAZES,
    sizes: [
      { id: "s", label: "300ml", spec: "지름 8cm · 높이 9cm · 용량 300ml", add: 0 },
      { id: "l", label: "400ml", spec: "지름 9cm · 높이 10cm · 용량 400ml", add: 4_000 },
    ],
    added: "2026-09-18",
    desc: "손잡이가 도톰해서 손가락 세 개를 넣어도 편하게 잡을 수 있어요.",
  },
  {
    id: "teacup",
    name: "물레 찻잔",
    price: 18_000,
    cat: "cup",
    glazes: ALL_GLAZES,
    sizes: [{ id: "s", label: "120ml", spec: "지름 7.5cm · 높이 6cm · 용량 120ml", add: 0 }],
    added: "2026-06-02",
    desc: "입에 닿는 부분이 얇아서 차 마실 때 부드러워요.",
  },
  {
    id: "ricebowl",
    name: "밥공기",
    price: 22_000,
    cat: "bowl",
    glazes: ALL_GLAZES,
    sizes: [
      { id: "s", label: "지름 11cm", spec: "지름 11cm · 높이 6cm · 용량 300ml", add: 0 },
      { id: "l", label: "지름 12.5cm", spec: "지름 12.5cm · 높이 6.5cm · 용량 380ml", add: 3_000 },
    ],
    added: "2026-03-10",
    desc: "굽이 높아서 뜨거운 밥을 담아도 손이 덜 뜨거워요.",
  },
  {
    id: "noodle",
    name: "면기",
    price: 34_000,
    cat: "bowl",
    glazes: ALL_GLAZES,
    sizes: [
      { id: "m", label: "지름 17cm", spec: "지름 17cm · 높이 7cm · 용량 800ml", add: 0 },
      { id: "l", label: "지름 19cm", spec: "지름 19cm · 높이 7.5cm · 용량 1,000ml", add: 5_000 },
    ],
    added: "2026-08-25",
    desc: "국수, 덮밥, 샐러드 담기에 좋은 크기의 볼입니다.",
  },
  {
    id: "plate",
    name: "원형 접시",
    price: 32_000,
    cat: "plate",
    glazes: ALL_GLAZES,
    sizes: [
      { id: "m", label: "지름 21cm", spec: "지름 21cm · 높이 2.5cm", add: 0 },
      { id: "l", label: "지름 25cm", spec: "지름 25cm · 높이 3cm", add: 8_000 },
    ],
    added: "2026-05-14",
    desc: "가장자리가 살짝 올라와 있어서 국물 있는 반찬도 넘치지 않아요.",
  },
  {
    id: "sidedish",
    name: "찬기",
    price: 14_000,
    cat: "plate",
    glazes: ALL_GLAZES,
    sizes: [{ id: "s", label: "지름 10cm", spec: "지름 10cm · 높이 3.5cm", add: 0 }],
    added: "2026-02-20",
    desc: "김치, 나물, 장 종지로 쓰기 좋은 작은 그릇입니다.",
  },
  {
    id: "vase",
    name: "한 송이 화병",
    price: 46_000,
    cat: "etc",
    glazes: ALL_GLAZES,
    sizes: [
      { id: "s", label: "높이 15cm", spec: "지름 9cm · 높이 15cm", add: 0 },
      { id: "l", label: "높이 20cm", spec: "지름 12cm · 높이 20cm", add: 12_000 },
    ],
    added: "2026-09-26",
    gift: true,
    desc: "입구가 좁아서 꽃 한두 송이만 꽂아도 예뻐요.",
  },
  {
    id: "teapot",
    name: "옆손잡이 다관",
    price: 68_000,
    cat: "etc",
    glazes: ["white", "celadon", "black"],
    sizes: [{ id: "m", label: "300ml", spec: "지름 11cm · 높이 9cm · 용량 300ml", add: 0 }],
    added: "2026-07-08",
    gift: true,
    desc: "안쪽에 거름망 구멍이 있어서 찻잎이 따라 나오지 않아요.",
  },
];

const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<string, Product>;

const NEW_SINCE = "2026-08-20";
const isNew = (p: Product) => p.added >= NEW_SINCE;
const BEST_IDS = ["mug", "ricebowl", "plate", "teacup"];

type CatId = Cat | "all";

const CATS: { id: CatId; label: string }[] = [
  { id: "all", label: "전체상품" },
  { id: "cup", label: "컵·찻잔" },
  { id: "bowl", label: "그릇·면기" },
  { id: "plate", label: "접시·찬기" },
  { id: "etc", label: "화병·다관" },
];

const CAT_LABEL = Object.fromEntries(CATS.map((c) => [c.id, c.label])) as Record<CatId, string>;

type Sort = "new" | "low" | "high";

const SORTS: { id: Sort; label: string }[] = [
  { id: "new", label: "신상품" },
  { id: "low", label: "낮은가격" },
  { id: "high", label: "높은가격" },
];

/** 조합마다 남은 수량. 서버와 브라우저가 같은 값을 내도록 글자로만 계산한다. */
function stockOf(productId: string, glaze: GlazeId, size: string) {
  let h = 8;
  for (const ch of `${productId}:${glaze}:${size}`) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return h % 9;
}

/* ---------- 추가구성상품 ---------- */

type AddonId = "box" | "bag";

const ADDONS: { id: AddonId; name: string; price: number }[] = [
  { id: "box", name: "선물상자", price: 3_000 },
  { id: "bag", name: "선물 쇼핑백", price: 2_000 },
];

const ADDON_BY_ID = Object.fromEntries(ADDONS.map((a) => [a.id, a])) as Record<AddonId, (typeof ADDONS)[number]>;

/* ---------- 장바구니 ---------- */

type CartLine =
  | { key: string; kind: "item"; productId: string; glaze: GlazeId; size: string; engrave: string; qty: number }
  | { key: string; kind: "addon"; addon: AddonId; qty: number };

/** 담기 전 줄. 유니언마다 key를 뺀다. */
type NewLine = CartLine extends infer L ? (L extends CartLine ? Omit<L, "key"> : never) : never;

function sizeOf(p: Product, id: string) {
  return p.sizes.find((s) => s.id === id) ?? p.sizes[0];
}

function linePrice(l: CartLine) {
  if (l.kind === "addon") return ADDON_BY_ID[l.addon].price;
  const p = PRODUCT_BY_ID[l.productId];
  return p.price + sizeOf(p, l.size).add + (l.engrave ? ENGRAVE_FEE : 0);
}

function lineName(l: CartLine) {
  return l.kind === "addon" ? `[추가구성] ${ADDON_BY_ID[l.addon].name}` : PRODUCT_BY_ID[l.productId].name;
}

function lineOptions(l: CartLine) {
  if (l.kind === "addon") return "";
  const p = PRODUCT_BY_ID[l.productId];
  return `[옵션: ${GLAZE_BY_ID[l.glaze].label}/${sizeOf(p, l.size).label}${l.engrave ? `/각인 ${l.engrave}` : ""}]`;
}

function lineMax(l: CartLine) {
  return l.kind === "addon" ? 9 : stockOf(l.productId, l.glaze, l.size);
}

function totals(cart: CartLine[], region: Region) {
  const items = cart.reduce((s, l) => s + linePrice(l) * l.qty, 0);
  const ship = items === 0 ? 0 : items >= FREE_SHIP ? 0 : SHIP_FEE;
  const extra = items === 0 ? 0 : REGION_BY_ID[region].extra;
  return { items, ship, extra, total: items + ship + extra };
}

/* ---------- 후기 ---------- */

const REVIEWS: { productId: string; name: string; glaze: GlazeId; rating: number; ago: number; text: string }[] = [
  { productId: "mug", name: "김ㅎ늘", glaze: "black", rating: 5, ago: 7, text: "흑유 머그 두 개 샀어요. 손잡이가 도톰해서 잡기 편하고 입술 쪽 갈색 띠가 사진보다 진해요." },
  { productId: "mug", name: "박*", glaze: "celadon", rating: 4, ago: 16, text: "400ml로 받았는데 생각보다 무게감 있어요. 아침 커피용으로 잘 쓰고 있어요." },
  { productId: "ricebowl", name: "이ㅅ진", glaze: "white", rating: 5, ago: 25, text: "굽이 높아서 뜨거운 밥 담아도 덜 뜨거워요. 포장도 꼼꼼했어요." },
  { productId: "plate", name: "최ㅇ호", glaze: "buncheong", rating: 5, ago: 40, text: "분청 접시 붓 자국이 하나하나 달라서 두 장이 다른 그릇 같아요ㅎㅎ" },
  { productId: "teacup", name: "정*", glaze: "celadon", rating: 4, ago: 51, text: "찻잔 입술이 얇아서 차 마시기 좋아요. 생각보다 작으니 참고하세요." },
  { productId: "vase", name: "한ㄱ름", glaze: "white", rating: 5, ago: 5, text: "선물상자랑 쇼핑백 같이 주문해서 집들이 선물로 바로 들고 갔어요." },
];

/** 상품별 누적 후기 수. 화면에는 최근 후기 몇 건만 보여 준다. */
const REVIEW_TOTAL: Record<string, number> = { mug: 213, teacup: 87, ricebowl: 164, noodle: 58, plate: 129, sidedish: 71, vase: 46, teapot: 23 };
const REVIEW_ALL = Object.values(REVIEW_TOTAL).reduce((a, b) => a + b, 0);

/* ---------- 이름, 전화 가리기 ---------- */

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘은 김ㅎ늘, 두 글자는 김* */
function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return chars.join("");
  const hide = (ch: string) => {
    const code = ch.charCodeAt(0) - 0xac00;
    return code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*";
  };
  if (chars.length === 2) return `${chars[0]}*`;
  return chars.map((ch, i) => (i === 0 || i === chars.length - 1 ? ch : hide(ch))).join("");
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

/* ---------- 창 공통 ---------- */

/** 열릴 때 첫 단추로 초점을 옮기고 스크롤을 막으며, 닫히면 원래 자리로 초점을 돌려준다. Escape로 닫는다. */
function useDialog(onClose: () => void) {
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    firstRef.current?.focus();
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

  return firstRef;
}

/** 탭 목록에서 왼쪽·오른쪽 화살표로 이동한다. */
function onTabKeys<T extends string>(e: React.KeyboardEvent<HTMLElement>, ids: readonly T[], cur: T, set: (v: T) => void, prefix: string) {
  const i = ids.indexOf(cur);
  let next = -1;
  if (e.key === "ArrowRight") next = (i + 1) % ids.length;
  else if (e.key === "ArrowLeft") next = (i - 1 + ids.length) % ids.length;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = ids.length - 1;
  if (next < 0) return;
  e.preventDefault();
  set(ids[next]);
  document.getElementById(`${prefix}-${ids[next]}`)?.focus();
}

/* ---------- 화면 ---------- */

type View =
  | { name: "home" }
  | { name: "list"; cat: CatId; query: string }
  | { name: "detail"; id: string; glaze: GlazeId }
  | { name: "cart" }
  | { name: "order" }
  | { name: "brand" }
  | { name: "community"; tab: CommunityTab }
  | { name: "visit" };

type CommunityTab = "notice" | "review" | "faq";

type Go = (v: View) => void;

/* ---------- 페이지 ---------- */

export function OnlineStoreDemo() {
  const minute = useNowMinute();
  const [view, setView] = useState<View>({ name: "home" });
  const [cart, setCart] = useState<CartLine[]>([]);
  const [region, setRegion] = useState<Region>("metro");
  const [added, setAdded] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const count = cart.reduce((s, l) => s + l.qty, 0);

  const go: Go = (v) => {
    setView(v);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0 });
      mainRef.current?.focus({ preventScroll: true });
    });
  };

  const addLines = (lines: NewLine[]) =>
    setCart((prev) => {
      let next = [...prev];
      for (const line of lines) {
        const key = line.kind === "addon" ? `addon|${line.addon}` : `${line.productId}|${line.glaze}|${line.size}|${line.engrave}`;
        const full = { ...line, key } as CartLine;
        const found = next.find((l) => l.key === key);
        next = found ? next.map((l) => (l.key === key ? { ...l, qty: Math.min(lineMax(l), l.qty + line.qty) } : l)) : [...next, full];
      }
      return next;
    });

  const changeQty = (key: string, delta: number) =>
    setCart((prev) => prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(lineMax(l), l.qty + delta)) } : l)));

  const removeLine = (key: string) => setCart((prev) => prev.filter((l) => l.key !== key));

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.bg, color: C.ink }}>
      <TopBanner />
      <Header view={view} count={count} go={go} />
      <main ref={mainRef} tabIndex={-1} className="outline-none">
        {view.name === "home" && <Home go={go} />}
        {view.name === "list" && <ListView key={`${view.cat}|${view.query}`} cat={view.cat} initialQuery={view.query} go={go} />}
        {view.name === "detail" && (
          <Detail
            key={view.id}
            productId={view.id}
            initialGlaze={view.glaze}
            minute={minute}
            region={region}
            onRegion={setRegion}
            go={go}
            onAdd={(lines, buyNow) => {
              addLines(lines);
              if (buyNow) go({ name: "order" });
              else setAdded(true);
            }}
          />
        )}
        {view.name === "cart" && (
          <CartView cart={cart} minute={minute} region={region} onRegion={setRegion} onQty={changeQty} onRemove={removeLine} onClear={() => setCart([])} go={go} />
        )}
        {view.name === "order" && <OrderView cart={cart} region={region} onRegion={setRegion} onOrdered={() => setCart([])} go={go} />}
        {view.name === "brand" && <BrandView />}
        {view.name === "community" && <CommunityView key={view.tab} initialTab={view.tab} go={go} />}
        {view.name === "visit" && <VisitView minute={minute} />}
      </main>
      <Footer />

      <AnimatePresence>
        {added && (
          <AddedLayer
            key="added"
            onClose={() => setAdded(false)}
            onCart={() => {
              setAdded(false);
              go({ name: "cart" });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- 띠배너, 머리글 ---------- */

function TopBanner() {
  return (
    <p id="top-banner" className="px-4 py-2 text-center text-[14px] font-semibold md:px-6" style={{ background: C.ink, color: C.claySoft }}>
      50,000원 이상 무료배송 · 평일 오후 2시 이전 주문 당일 출고
    </p>
  );
}

function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.svg" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-[18px] font-bold tracking-[-0.02em] md:text-[20px]">곰파트너</span>
        <span className="text-[11px] font-semibold opacity-80 md:text-[12px]">도자기 공방</span>
      </span>
    </span>
  );
}

const GNB: { label: string; view: View }[] = [
  { label: "브랜드 소개", view: { name: "brand" } },
  ...CATS.map((c) => ({ label: c.label, view: { name: "list", cat: c.id, query: "" } as View })),
  { label: "커뮤니티", view: { name: "community", tab: "notice" } },
  { label: "오시는 길", view: { name: "visit" } },
];

function gnbActive(view: View, item: View) {
  if (view.name !== item.name) return view.name === "detail" && item.name === "list" && item.cat === PRODUCT_BY_ID[view.id].cat;
  if (view.name === "list" && item.name === "list") return view.cat === item.cat && !view.query;
  return true;
}

const POPULAR = ["머그", "밥공기", "화병", "접시"];

function Header({ view, count, go }: { view: View; count: number; go: Go }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const reduce = useReducedMotionSafe();

  const search = (text: string) => {
    setSearchOpen(false);
    setQ("");
    go({ name: "list", cat: "all", query: text.trim() });
  };

  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: C.bg, borderColor: C.line }}>
      <div className="mx-auto hidden max-w-[1200px] justify-end gap-5 px-6 pt-2 text-[13px] md:flex" style={{ color: C.muted }}>
        <span>고객센터 {TEL}</span>
        <button type="button" onClick={() => go({ name: "community", tab: "faq" })} className="hover:underline">
          이용안내
        </button>
        <button type="button" onClick={() => go({ name: "cart" })} className="hover:underline">
          장바구니 ({count})
        </button>
      </div>
      <div className="mx-auto grid h-14 max-w-[1200px] grid-cols-[44px_1fr_44px] items-center px-2 md:h-16 md:grid-cols-[96px_1fr_96px] md:px-6">
        <button
          type="button"
          onClick={() => setSearchOpen((v) => !v)}
          aria-expanded={searchOpen}
          aria-controls="store-search"
          aria-label={searchOpen ? "검색 닫기" : "상품 검색"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-[#ece3d8]"
        >
          {searchOpen ? <X size={21} aria-hidden /> : <Search size={21} aria-hidden />}
        </button>
        <button type="button" onClick={() => go({ name: "home" })} aria-label={`${SHOP} 메인으로`} className="mx-auto min-w-0">
          <Logo />
        </button>
        <button
          type="button"
          onClick={() => go({ name: "cart" })}
          aria-label={count ? `장바구니, ${count}개 담김` : "장바구니"}
          className="relative ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-[#ece3d8]"
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
      </div>
      <nav aria-label="상품 분류" className="border-t" style={{ borderColor: C.line }}>
        <ul className="mx-auto flex max-w-[1200px] gap-1 overflow-x-auto px-2 text-[15px] [scrollbar-width:none] md:justify-center md:gap-3 md:px-6">
          {GNB.map((n) => {
            const on = gnbActive(view, n.view);
            return (
              <li key={n.label} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go(n.view)}
                  aria-current={on ? "page" : undefined}
                  className="h-11 whitespace-nowrap border-b-2 px-2.5 font-semibold transition-colors"
                  style={on ? { borderColor: C.terra, color: C.ink } : { borderColor: "transparent", color: C.muted }}
                >
                  {n.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <AnimatePresence initial={false}>
        {searchOpen && (
          <motion.div
            id="store-search"
            className="overflow-hidden border-t"
            style={{ borderColor: C.line, background: C.paper }}
            initial={reduce ? false : { height: 0 }}
            animate={{ height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.24, ease: EASE }}
          >
            <form
              className="mx-auto max-w-[640px] px-4 py-4"
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                search(q);
              }}
            >
              <label htmlFor="store-q" className="sr-only">
                상품 검색
              </label>
              <div className="flex gap-2">
                <input
                  id="store-q"
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="상품명을 입력하세요"
                  className="h-11 min-w-0 flex-1 rounded-[4px] border px-3 outline-none focus:border-[#b5562f]"
                  style={{ borderColor: C.clay, background: "#fff" }}
                />
                <button type="submit" className="h-11 shrink-0 rounded-[4px] px-5 font-semibold" style={{ background: C.ink, color: "#fff" }}>
                  검색
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[14px]">
                <span style={{ color: C.muted }}>인기 검색어</span>
                {POPULAR.map((w) => (
                  <button key={w} type="button" onClick={() => search(w)} className="h-8 rounded-full border px-3" style={{ borderColor: C.line }}>
                    {w}
                  </button>
                ))}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- 그릇 사진 ---------- */

/** 상품마다 유약별 사진이 한 장씩 있다. 유약을 고르면 그 사진으로 바뀐다. */
const wareSrc = (productId: string, glaze: GlazeId) => `${IMG}/products/${productId}-${glaze}.jpg`;

/** 각인 글자를 얹을 자리(사진 가로·세로 %)와 글자 크기(사진 폭 대비 %) */
const MARK: Record<string, { x: number; y: number; size: number }> = {
  mug: { x: 46, y: 60, size: 5 },
  teacup: { x: 27, y: 60, size: 3.6 },
  ricebowl: { x: 50, y: 62, size: 5 },
  noodle: { x: 50, y: 62, size: 5 },
  plate: { x: 50, y: 80, size: 4.4 },
  sidedish: { x: 40, y: 84, size: 3.6 },
  vase: { x: 48, y: 70, size: 4.4 },
  teapot: { x: 47, y: 64, size: 4.4 },
};

function WarePhoto({ productId, glaze, engrave = "", alt = "" }: { productId: string; glaze: GlazeId; engrave?: string; alt?: string }) {
  const g = GLAZE_BY_ID[glaze];
  const mark = MARK[productId];
  return (
    <span className="relative block h-full w-full" style={{ containerType: "inline-size" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={wareSrc(productId, glaze)} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      {engrave && mark && (
        <span
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-semibold"
          style={{
            left: `${mark.x}%`,
            top: `${mark.y}%`,
            fontSize: `${mark.size}cqw`,
            letterSpacing: "0.08em",
            color: g.mark,
            opacity: 0.85,
            mixBlendMode: glaze === "black" ? "screen" : "multiply",
          }}
          aria-hidden
        >
          {engrave}
        </span>
      )}
    </span>
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

/* ---------- 공통 조각 ---------- */

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1200px] px-4 md:px-6 ${className}`}>{children}</div>;
}

function Crumbs({ items, go }: { items: { label: string; view?: View }[]; go: Go }) {
  return (
    <nav aria-label="현재 위치" className="pt-5 text-[13px]" style={{ color: C.muted }}>
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <button type="button" onClick={() => go({ name: "home" })} className="hover:underline">
            HOME
          </button>
        </li>
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-1">
            <ChevronRight size={13} aria-hidden />
            {it.view && i < items.length - 1 ? (
              <button type="button" onClick={() => go(it.view!)} className="hover:underline">
                {it.label}
              </button>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined} style={{ color: C.ink }}>
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="mt-3 text-center text-[24px] font-bold tracking-[-0.03em] md:text-[30px]">{children}</h1>;
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex" role="img" aria-label={`별점 5점 중 ${n}점`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} aria-hidden fill={i <= n ? C.terra : "none"} style={{ color: C.terra }} />
      ))}
    </span>
  );
}

/* ---------- 상품 카드 ---------- */

function ProductCard({ p, go, newBadge = true }: { p: Product; go: Go; newBadge?: boolean }) {
  const [glaze, setGlaze] = useState<GlazeId>(p.glazes[0]);
  const g = GLAZE_BY_ID[glaze];
  const soldOut = p.sizes.every((s) => stockOf(p.id, glaze, s.id) === 0);
  const open = () => go({ name: "detail", id: p.id, glaze });

  return (
    <li className="min-w-0">
      <button type="button" onClick={open} aria-label={`${p.name} ${g.label} 상세보기`} className="relative block w-full overflow-hidden rounded-[4px]" style={{ background: C.claySoft }}>
        <span className="block aspect-square">
          <WarePhoto productId={p.id} glaze={glaze} />
        </span>
        {soldOut && (
          <span className="absolute inset-x-0 bottom-0 py-1.5 text-center text-[13px] font-bold " style={{ background: "rgba(35,32,29,0.78)", color: "#fff" }}>
            품절
          </span>
        )}
      </button>
      <div className="-ml-1.5 mt-2 flex flex-wrap" role="group" aria-label={`${p.name} 유약 색상`}>
        {p.glazes.map((id) => (
          <button
            key={id}
            type="button"
            aria-label={GLAZE_BY_ID[id].label}
            aria-pressed={glaze === id}
            onClick={() => setGlaze(id)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full"
          >
            <span className="inline-flex rounded-full p-[3px]" style={{ boxShadow: glaze === id ? `0 0 0 1.5px ${C.ink}` : "none" }}>
              <Swatch glaze={GLAZE_BY_ID[id]} size={18} />
            </span>
          </button>
        ))}
      </div>
      <button type="button" onClick={open} className="mt-1 block text-left" tabIndex={-1} aria-hidden>
        <span className="font-bold leading-[1.4]">
          {p.gift && <span style={{ color: C.terra }}>[선물포장] </span>}
          {p.name}
        </span>
      </button>
      <p className="text-[15px] font-semibold tabular-nums">{won(p.price)}</p>
      <p className="text-[13px] tabular-nums" style={{ color: C.muted }}>
        리뷰 {REVIEW_TOTAL[p.id].toLocaleString("ko-KR")}
      </p>
      <p className="mt-0.5 line-clamp-2 text-[14px] leading-[1.55]" style={{ color: C.muted }}>
        {p.desc}
      </p>
      {newBadge && isNew(p) && (
        <span className="mt-1.5 inline-block rounded-[2px] border px-1.5 text-[12px] font-bold leading-[18px]" style={{ borderColor: C.terra, color: C.terra }}>
          신상품
        </span>
      )}
    </li>
  );
}

function ProductGrid({ list, go, newBadge = true }: { list: Product[]; go: Go; newBadge?: boolean }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4 md:gap-x-6">
      {list.map((p) => (
        <ProductCard key={p.id} p={p} go={go} newBadge={newBadge} />
      ))}
    </ul>
  );
}

function ShelfHead({ id, title, more }: { id: string; title: string; more?: () => void }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b pb-3" style={{ borderColor: C.ink }}>
      <h2 id={id} className="text-[22px] font-bold tracking-[-0.02em] md:text-[26px]">
        {title}
      </h2>
      {more && (
        <button type="button" onClick={more} className="inline-flex h-10 items-center gap-0.5 text-[14px] font-semibold" style={{ color: C.muted }}>
          더보기
          <ChevronRight size={16} aria-hidden />
        </button>
      )}
    </div>
  );
}

/* ---------- 메인 ---------- */

function Home({ go }: { go: Go }) {
  const today = useDemoToday();
  const best = BEST_IDS.map((id) => PRODUCT_BY_ID[id]);
  const fresh = [...PRODUCTS].sort((a, b) => b.added.localeCompare(a.added)).slice(0, 4);

  return (
    <>
      <h1 className="sr-only">{SHOP}</h1>
      <section aria-label="메인 배너" className="relative">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/7] md:aspect-[16/6]">
          <Image
            src={`${IMG}/hero.jpg`}
            alt="햇빛이 드는 공방 나무 선반에 유약을 입힌 그릇과 컵이 줄지어 놓인 모습"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <Container className="relative">
          <div className="-mt-16 max-w-[420px] rounded-[4px] p-5 md:absolute md:bottom-8 md:mt-0 md:p-6" style={{ background: C.paper }}>
            <p className="text-[14px] font-semibold" style={{ color: C.terra }}>
              2026 가을 신상품
            </p>
            <p className="mt-1 text-[22px] font-bold leading-[1.35] tracking-[-0.02em] md:text-[26px]">한 송이 화병, 손잡이 머그</p>
            <button
              type="button"
              onClick={() => go({ name: "list", cat: "all", query: "" })}
              className="mt-4 inline-flex h-11 items-center rounded-[4px] px-5 font-semibold"
              style={{ background: C.ink, color: "#fff" }}
            >
              전체상품 보기
            </button>
          </div>
        </Container>
      </section>

      <section id="best" aria-labelledby="best-title" className="py-12 md:py-16">
        <Container>
          <ShelfHead id="best-title" title="많이 찾는 상품" more={() => go({ name: "list", cat: "all", query: "" })} />
          <ProductGrid list={best} go={go} />
        </Container>
      </section>

      <section aria-label="공방 안내 배너" className="pb-4">
        <Container className="grid gap-3 md:grid-cols-2 md:gap-5">
          <button type="button" onClick={() => go({ name: "brand" })} className="group grid grid-cols-[120px_1fr] overflow-hidden rounded-[4px] text-left md:grid-cols-[180px_1fr]" style={{ background: C.claySoft }}>
            <span className="relative block min-h-[120px]">
              <Image src={`${IMG}/detail.jpg`} alt="" fill sizes="180px" className="object-cover" />
            </span>
            <span className="flex flex-col justify-center p-4 md:p-6">
              <span className="text-[18px] font-bold">시험성적서와 안전 포장</span>
              <span className="mt-1 text-[14px] leading-[1.55]" style={{ color: C.muted }}>
                납·카드뮴 불검출 시험 완료, 에어캡과 완충재 이중 포장
              </span>
            </span>
          </button>
          <button type="button" onClick={() => go({ name: "visit" })} className="flex flex-col justify-center rounded-[4px] p-4 text-left md:p-6" style={{ background: C.ink, color: C.claySoft }}>
            <span className="text-[18px] font-bold" style={{ color: "#fff" }}>
              물레 체험 원데이 클래스
            </span>
            <span className="mt-1 text-[14px] leading-[1.55]">토요일 14:00, 16:00 · 1인 45,000원 · 전화 예약</span>
            <span className="mt-3 inline-flex items-center gap-0.5 text-[14px] font-semibold" style={{ color: C.clay }}>
              오시는 길
              <ChevronRight size={15} aria-hidden />
            </span>
          </button>
        </Container>
      </section>

      <section id="new" aria-labelledby="new-title" className="py-12 md:py-16">
        <Container>
          <ShelfHead id="new-title" title="새로 들어온 상품" more={() => go({ name: "list", cat: "all", query: "" })} />
          <ProductGrid list={fresh} go={go} newBadge={false} />
        </Container>
      </section>

      <section aria-labelledby="review-title" className="pb-16 md:pb-24">
        <Container>
          <ShelfHead id="review-title" title="상품 사용후기" more={() => go({ name: "community", tab: "review" })} />
          <ul className="grid gap-3 md:grid-cols-3 md:gap-5">
            {REVIEWS.slice(0, 3).map((r) => (
              <li key={r.name + r.ago} className="rounded-[4px] border p-4" style={{ borderColor: C.line, background: C.paper }}>
                <button type="button" onClick={() => go({ name: "detail", id: r.productId, glaze: r.glaze })} className="flex w-full items-center gap-3 text-left">
                  <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-[4px]" style={{ background: C.claySoft }}>
                    <WarePhoto productId={r.productId} glaze={r.glaze} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-[1.4]">{PRODUCT_BY_ID[r.productId].name}</span>
                    <Stars n={r.rating} />
                  </span>
                </button>
                <p className="mt-3 text-[15px] leading-[1.65]">{r.text}</p>
                <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
                  {r.name} · {fmtDot(daysAgo(today, r.ago))}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}

/* ---------- 상품 목록 ---------- */

function ListView({ cat, initialQuery, go }: { cat: CatId; initialQuery: string; go: Go }) {
  const [sort, setSort] = useState<Sort>("new");
  const [query, setQuery] = useState(initialQuery);
  const q = query.trim();
  const list = PRODUCTS.filter((p) => (cat === "all" || p.cat === cat) && (!q || p.name.includes(q) || p.desc.includes(q))).sort((a, b) =>
    sort === "new" ? b.added.localeCompare(a.added) : sort === "low" ? a.price - b.price : b.price - a.price,
  );

  return (
    <Container className="pb-16 md:pb-24">
      <Crumbs items={[{ label: CAT_LABEL[cat] }]} go={go} />
      <PageTitle>{CAT_LABEL[cat]}</PageTitle>
      <div className="mt-8 flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: C.line }}>
        <p className="text-[15px]" style={{ color: C.muted }} aria-live="polite">
          총 <strong style={{ color: C.ink }}>{list.length}</strong>개의 상품
        </p>
        <div className="flex gap-2">
          <label className="relative block min-w-0 flex-1 sm:w-[200px] sm:flex-none">
            <span className="sr-only">상품명 검색</span>
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="상품명"
              className="h-10 w-full rounded-[4px] border pl-9 pr-3 text-[15px] outline-none focus:border-[#b5562f]"
              style={{ borderColor: C.clay, background: C.paper }}
            />
          </label>
          <label className="shrink-0">
            <span className="sr-only">정렬</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-10 rounded-[4px] border px-2 text-[15px]"
              style={{ borderColor: C.clay, background: C.paper }}
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="mt-8">
        {list.length ? (
          <ProductGrid list={list} go={go} />
        ) : (
          <p className="rounded-[4px] p-10 text-center" style={{ background: C.claySoft, color: C.muted }}>
            검색 결과가 없습니다.
          </p>
        )}
      </div>
    </Container>
  );
}

/* ---------- 상품 상세 ---------- */

type DetailTab = "info" | "ship" | "return" | "review";

function Detail({
  productId,
  initialGlaze,
  minute,
  region,
  onRegion,
  go,
  onAdd,
}: {
  productId: string;
  initialGlaze: GlazeId;
  minute: number;
  region: Region;
  onRegion: (r: Region) => void;
  go: Go;
  onAdd: (lines: NewLine[], buyNow: boolean) => void;
}) {
  const p = PRODUCT_BY_ID[productId];
  const single = p.sizes.length === 1;
  const [glaze, setGlaze] = useState<GlazeId>(initialGlaze);
  const [sizeId, setSizeId] = useState(single ? p.sizes[0].id : "");
  const [qty, setQty] = useState(1);
  const [engrave, setEngrave] = useState("");
  const [addons, setAddons] = useState<AddonId[]>([]);
  const [wish, setWish] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<DetailTab>("info");

  const g = GLAZE_BY_ID[glaze];
  const size = sizeId ? sizeOf(p, sizeId) : null;
  const stock = size ? stockOf(p.id, glaze, size.id) : 0;
  const count = Math.min(qty, Math.max(stock, 1));
  const text = engrave.trim();
  const unit = p.price + (size?.add ?? 0) + (text ? ENGRAVE_FEE : 0);
  const addonSum = addons.reduce((s, id) => s + ADDON_BY_ID[id].price, 0);
  const total = size && stock ? unit * count + addonSum : addonSum;
  const est = estimate(minute, region);
  const reviews = REVIEWS.filter((r) => r.productId === p.id);

  const submit = (buyNow: boolean) => {
    if (!size) return setError("필수 옵션을 선택해 주세요.");
    if (!stock) return setError("선택하신 옵션은 품절입니다.");
    setError("");
    onAdd(
      [
        { kind: "item", productId: p.id, glaze, size: size.id, engrave: text, qty: count },
        ...addons.map((a) => ({ kind: "addon" as const, addon: a, qty: 1 })),
      ],
      buyNow,
    );
  };

  const TABS: { id: DetailTab; label: string }[] = [
    { id: "info", label: "상품상세정보" },
    { id: "ship", label: "배송안내" },
    { id: "return", label: "교환 및 반품" },
    { id: "review", label: `상품후기 (${REVIEW_TOTAL[p.id]})` },
  ];

  return (
    <Container className="pb-16 md:pb-24">
      <Crumbs items={[{ label: CAT_LABEL[p.cat], view: { name: "list", cat: p.cat, query: "" } }, { label: p.name }]} go={go} />

      <div className="mt-5 grid gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
        <div className="md:sticky md:top-[140px] md:self-start">
          <div className="aspect-square overflow-hidden rounded-[4px]" style={{ background: C.claySoft }}>
            <WarePhoto productId={p.id} glaze={glaze} engrave={text} alt={`${g.label} ${p.name}${size ? ` ${size.label}` : ""}${text ? `, 각인 ${text}` : ""}`} />
          </div>
          <p className="mt-2 text-center text-[14px]" style={{ color: C.muted }}>
            {g.label}. {g.note}
          </p>
        </div>

        <div className="min-w-0">
          <h1 className="text-[24px] font-bold leading-[1.35] tracking-[-0.03em] md:text-[28px]">
            {p.gift && <span style={{ color: C.terra }}>[선물포장] </span>}
            {p.name}
          </h1>
          <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
            {p.desc}
          </p>

          <dl className="mt-5 border-y text-[15px]" style={{ borderColor: C.line }}>
            {[
              ["판매가", <strong key="p" className="text-[18px] tabular-nums">{won(p.price)}</strong>],
              ["배송비", `${won(SHIP_FEE)} (${won(FREE_SHIP)} 이상 구매 시 무료)`],
              ["크기", size ? size.spec : p.sizes.map((s) => s.label).join(" / ")],
            ].map(([k, v]) => (
              <div key={k as string} className="grid grid-cols-[84px_1fr] gap-3 py-2.5">
                <dt style={{ color: C.muted }}>{k}</dt>
                <dd className="min-w-0">{v}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[84px_1fr] gap-3 py-2.5">
              <dt style={{ color: C.muted }}>
                <label htmlFor="detail-region">배송 예정</label>
              </dt>
              <dd className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <select
                  id="detail-region"
                  value={region}
                  onChange={(e) => onRegion(e.target.value as Region)}
                  className="h-9 rounded-[4px] border px-2 text-[14px]"
                  style={{ borderColor: C.clay, background: C.paper }}
                >
                  {REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <span aria-live="polite" className="font-semibold">
                  {est ? `${dateText(est.arrive)} 도착 예정` : ""}
                </span>
              </dd>
            </div>
          </dl>

          <fieldset className="mt-5">
            <legend className="text-[15px] font-semibold">
              유약 <span style={{ color: C.terra }}>[필수]</span>
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {p.glazes.map((id) => (
                <label
                  key={id}
                  className="flex h-11 cursor-pointer items-center gap-2 rounded-[4px] border px-3 text-[15px] font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2"
                  style={glaze === id ? { borderColor: C.ink, boxShadow: `inset 0 0 0 1px ${C.ink}` } : { borderColor: C.line, background: C.paper }}
                >
                  <input
                    type="radio"
                    name="glaze"
                    value={id}
                    checked={glaze === id}
                    onChange={() => {
                      setGlaze(id);
                      setQty(1);
                      setError("");
                    }}
                    className="sr-only"
                  />
                  <Swatch glaze={GLAZE_BY_ID[id]} size={18} />
                  {GLAZE_BY_ID[id].label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-4 block">
            <span className="text-[15px] font-semibold">
              크기 <span style={{ color: C.terra }}>[필수]</span>
            </span>
            <select
              value={sizeId}
              onChange={(e) => {
                setSizeId(e.target.value);
                setQty(1);
                setError("");
              }}
              className="mt-2 h-11 w-full rounded-[4px] border px-3 text-[15px]"
              style={{ borderColor: C.clay, background: C.paper }}
            >
              {!single && <option value="">- [필수] 옵션을 선택해 주세요 -</option>}
              {p.sizes.map((s) => {
                const left = stockOf(p.id, glaze, s.id);
                return (
                  <option key={s.id} value={s.id} disabled={!left}>
                    {s.label}
                    {s.add ? ` (+${won(s.add)})` : ""}
                    {left ? "" : " [품절]"}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-[15px] font-semibold">
              각인 문구 <span style={{ color: C.muted }}>(선택, +{won(ENGRAVE_FEE)})</span>
            </span>
            <input
              value={engrave}
              maxLength={ENGRAVE_MAX}
              onChange={(e) => setEngrave(e.target.value)}
              placeholder="최대 8자"
              className="mt-2 h-11 w-full rounded-[4px] border px-3 outline-none focus:border-[#b5562f]"
              style={{ borderColor: C.clay, background: "#fff" }}
              aria-describedby="engrave-help"
            />
            <span id="engrave-help" className="mt-1 block text-[13px]" style={{ color: C.muted }}>
              {engrave.length}/{ENGRAVE_MAX}자. 각인 상품은 출고가 하루 늦어지며 단순 변심 교환·반품이 불가합니다.
            </span>
          </label>

          <fieldset className="mt-4 rounded-[4px] border p-3" style={{ borderColor: C.line, background: C.paper }}>
            <legend className="px-1 text-[15px] font-semibold">추가구성상품</legend>
            {ADDONS.map((a) => (
              <label key={a.id} className="flex min-h-10 cursor-pointer items-center gap-2.5 text-[15px]">
                <input
                  type="checkbox"
                  checked={addons.includes(a.id)}
                  onChange={(e) => setAddons((prev) => (e.target.checked ? [...prev, a.id] : prev.filter((x) => x !== a.id)))}
                  className="h-5 w-5 accent-[#b5562f]"
                />
                {a.name}
                <span className="ml-auto tabular-nums" style={{ color: C.muted }}>
                  {won(a.price)}
                </span>
              </label>
            ))}
          </fieldset>

          {size && (
            <div className="mt-4 rounded-[4px] p-3" style={{ background: C.claySoft }}>
              <p className="text-[15px] font-semibold leading-[1.45]">
                {p.name}
                <span className="block text-[14px] font-normal" style={{ color: C.muted }}>
                  {g.label}/{size.label}
                  {text ? `/각인 ${text}` : ""}
                </span>
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex items-center" role="group" aria-label="수량">
                  <button
                    type="button"
                    onClick={() => setQty((n) => Math.max(1, n - 1))}
                    disabled={count <= 1}
                    aria-label="수량 감소"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-l-[4px] border disabled:opacity-30"
                    style={{ borderColor: C.clay, background: "#fff" }}
                  >
                    <Minus size={15} aria-hidden />
                  </button>
                  <span className="inline-flex h-10 w-11 items-center justify-center border-y font-bold tabular-nums" style={{ borderColor: C.clay, background: "#fff" }} aria-live="polite">
                    {count}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((n) => Math.min(stock, n + 1))}
                    disabled={count >= stock}
                    aria-label="수량 증가"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-r-[4px] border disabled:opacity-30"
                    style={{ borderColor: C.clay, background: "#fff" }}
                  >
                    <Plus size={15} aria-hidden />
                  </button>
                </div>
                <span className="text-[13px] font-semibold" style={{ color: stock === 0 ? C.terra : stock <= 2 ? C.terraDeep : C.muted }} aria-live="polite">
                  {stock === 0 ? "품절" : `재고 ${stock}개`}
                </span>
                <span className="font-bold tabular-nums">{won(unit * count)}</span>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-baseline justify-between border-t pt-4" style={{ borderColor: C.ink }}>
            <span className="text-[15px] font-semibold">총 상품금액(수량)</span>
            <span className="tabular-nums" aria-live="polite">
              <strong className="text-[24px]">{won(total)}</strong>
              <span className="text-[14px]" style={{ color: C.muted }}>
                {" "}
                ({(size && stock ? count : 0) + addons.length}개)
              </span>
            </span>
          </div>
          <p className="mt-1 text-[13px]" style={{ color: C.muted }}>
            할인가가 적용된 최종 결제예정금액은 주문 시 확인할 수 있습니다.
          </p>

          {error && (
            <p className="mt-3 text-[15px] font-semibold" style={{ color: "#b3261e" }} role="alert">
              {error}
            </p>
          )}

          <div className="mt-4 grid grid-cols-[1fr_1fr_48px] gap-2">
            <button type="button" onClick={() => submit(true)} className="h-12 rounded-[4px] font-semibold" style={{ background: C.terra, color: "#fff" }}>
              바로 구매하기
            </button>
            <button type="button" onClick={() => submit(false)} className="h-12 rounded-[4px] border font-semibold" style={{ borderColor: C.ink, background: C.paper }}>
              장바구니
            </button>
            <button
              type="button"
              onClick={() => setWish((v) => !v)}
              aria-pressed={wish}
              aria-label="관심상품"
              className="inline-flex h-12 items-center justify-center rounded-[4px] border"
              style={{ borderColor: C.clay, background: C.paper }}
            >
              <Heart size={20} aria-hidden fill={wish ? C.terra : "none"} style={{ color: wish ? C.terra : C.ink }} />
            </button>
          </div>

          <ul className="mt-5 space-y-1 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
            <li>※ 수작업 제품 특성상 색상, 유약 흐름, 크기가 조금씩 다를 수 있으며 불량이 아닙니다.</li>
            <li>※ 배송 중 파손은 수령 후 24시간 이내 사진과 함께 접수해 주세요.</li>
          </ul>
        </div>
      </div>

      <div className="mt-14">
        <div
          role="tablist"
          aria-label="상품 정보"
          className="sticky top-[102px] z-10 grid grid-cols-2 border-b sm:grid-cols-4 md:top-[140px]"
          style={{ background: C.bg, borderColor: C.ink }}
          onKeyDown={(e) =>
            onTabKeys(
              e,
              TABS.map((t) => t.id),
              tab,
              setTab,
              "dtab",
            )
          }
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              id={`dtab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls="dtab-panel"
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              className="h-12 border-b-2 text-[15px] font-semibold"
              style={tab === t.id ? { borderColor: C.terra, color: C.ink } : { borderColor: "transparent", color: C.muted }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div id="dtab-panel" role="tabpanel" aria-labelledby={`dtab-${tab}`} className="pt-8">
          {tab === "info" && <InfoTab p={p} size={size} />}
          {tab === "ship" && <ShipTab minute={minute} region={region} onRegion={onRegion} />}
          {tab === "return" && <ReturnTab />}
          {tab === "review" && <ReviewList list={reviews} total={REVIEW_TOTAL[p.id]} />}
        </div>
      </div>
    </Container>
  );
}

function SpecTable({ rows, caption }: { rows: [string, string][]; caption: string }) {
  return (
    <table className="w-full border-t text-[15px]" style={{ borderColor: C.ink }}>
      <caption className="sr-only">{caption}</caption>
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b" style={{ borderColor: C.line }}>
            <th scope="row" className="w-[110px] py-3 pr-3 text-left align-top font-semibold md:w-[160px]" style={{ background: C.claySoft, paddingLeft: 12 }}>
              {k}
            </th>
            <td className="py-3 pl-3 align-top">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InfoTab({ p, size }: { p: Product; size: Size | null }) {
  return (
    <div className="mx-auto max-w-[860px]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
        <Image src={`${IMG}/detail.jpg`} alt="유약이 고르게 녹아 윤이 나는 그릇들을 가까이서 찍은 모습" fill sizes="(min-width: 900px) 860px, 100vw" className="object-cover" />
      </div>
      <p className="mt-6">{p.desc} 같은 모양이어도 가마 안 자리에 따라 유약이 흐른 자리가 조금씩 다릅니다.</p>
      <div className="mt-6">
        <SpecTable
          caption="상품 정보 고시"
          rows={[
            ["상품명", p.name],
            ["크기", size ? size.spec : p.sizes.map((s) => s.spec).join(" / ")],
            ["재질", "백토, 옹기토 (무연 유약)"],
            ["굽는 온도", "800도 초벌, 1,250도 재벌"],
            ["식기세척기", "사용 가능"],
            ["전자레인지", p.glazes.includes("black") ? "사용 가능 (흑유는 장시간 가열 자제)" : "사용 가능"],
            ["제조국", "대한민국 (□□시 공방 제작)"],
            ["품질보증기준", "관련 법 및 소비자분쟁해결 기준에 따름"],
          ]}
        />
      </div>
      <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
        ※ 수작업 제품 특성상 미세한 색상 차이, 유약 흐름, 크기 차이는 불량이 아닙니다.
      </p>
    </div>
  );
}

function ArrivalPlanner({ minute, region, onRegion }: { minute: number; region: Region; onRegion: (r: Region) => void }) {
  const reduce = useReducedMotionSafe();
  const est = estimate(minute, region);
  const days = est ? Array.from({ length: 8 }, (_, i) => addDays(est.today, i)) : [];

  return (
    <div className="rounded-[4px] border p-4 md:p-6" style={{ borderColor: C.line, background: C.paper }}>
      <fieldset>
        <legend className="text-[15px] font-semibold">받는 지역</legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {REGIONS.map((r) => (
            <label
              key={r.id}
              className="inline-flex h-10 cursor-pointer items-center rounded-[4px] border px-3 text-[14px] font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2"
              style={region === r.id ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line, background: C.bg }}
            >
              <input type="radio" name="arrival-region" value={r.id} checked={region === r.id} onChange={() => onRegion(r.id)} className="sr-only" />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div aria-live="polite">
        {est ? (
          <>
            <p className="mt-5 text-[24px] font-bold leading-[1.3] tracking-[-0.02em] md:text-[28px]">{dateText(est.arrive)} 도착 예정</p>
            <p className="mt-1 text-[15px] font-semibold" style={{ color: C.terraDeep }}>
              {est.todayShip ? "오늘 출고" : `${dateText(est.ship)} 출고`}
            </p>
            <ol className="mt-5 grid grid-cols-8 gap-1">
              {days.map((d, i) => {
                const weekend = !isWorkday(d);
                const isShip = i === est.shipAt;
                const isArrive = i === est.arriveAt;
                return (
                  <li
                    key={i}
                    className="flex min-w-0 flex-col items-center rounded-[4px] py-2"
                    style={{
                      background: isArrive ? C.terra : isShip ? C.ink : weekend ? "transparent" : C.bg,
                      color: isArrive || isShip ? "#fff" : weekend ? "#a2978b" : C.ink,
                      outline: weekend && !isShip && !isArrive ? `1px dashed ${C.clay}` : "none",
                      outlineOffset: -1,
                    }}
                    aria-label={`${dateText(d)}${i === 0 ? ", 오늘" : ""}${weekend ? ", 주말" : ""}${isShip ? ", 출고일" : ""}${isArrive ? ", 도착 예정" : ""}`}
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
          </>
        ) : (
          <div className="h-[180px]" />
        )}
      </div>
    </div>
  );
}

function ShipTab({ minute, region, onRegion }: { minute: number; region: Region; onRegion: (r: Region) => void }) {
  return (
    <div className="mx-auto grid max-w-[1000px] gap-8 md:grid-cols-[1fr_1.1fr]">
      <SpecTable
        caption="배송 안내"
        rows={[
          ["배송 방법", "택배 (△△택배)"],
          ["배송 비용", `${won(FREE_SHIP)} 이상 무료배송, 미만 ${won(SHIP_FEE)}`],
          ["추가 배송비", `제주·도서산간 ${won(3_000)}`],
          ["당일 출고", "평일 오후 2시 이전 주문 건 당일 출고 (각인 상품 제외)"],
          ["배송 기간", "출고 후 수도권 1일, 지방 1~2일, 제주·도서산간 2~3일"],
          ["포장", "에어캡, 완충재, 전용 박스 이중 포장"],
        ]}
      />
      <ArrivalPlanner minute={minute} region={region} onRegion={onRegion} />
    </div>
  );
}

function ReturnTab() {
  return (
    <div className="mx-auto max-w-[860px]">
      <SpecTable
        caption="교환 및 반품 안내"
        rows={[
          ["신청 기간", "상품 수령 후 7일 이내"],
          ["파손 상품", "수령 후 24시간 이내 사진과 함께 접수 시 무상 교환"],
          ["단순 변심", "왕복 배송비 7,000원 고객 부담"],
          ["교환·반품 불가", "각인 상품, 사용 흔적이 있는 상품, 수작업 특성(색상, 유약 흐름, 크기 차이)에 따른 요청"],
          ["접수", `고객센터 ${TEL}, 평일 10:00 ~ 17:00`],
        ]}
      />
      <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
        ※ 파손 상품은 버리지 마시고 받으신 상자 그대로 보관해 주세요.
      </p>
    </div>
  );
}

function ReviewList({ list, total }: { list: typeof REVIEWS; total: number }) {
  const today = useDemoToday();
  if (!list.length)
    return (
      <p className="py-10 text-center" style={{ color: C.muted }}>
        게시물이 없습니다.
      </p>
    );
  return (
    <div className="mx-auto max-w-[860px]">
      <p className="mb-2 text-[14px]" style={{ color: C.muted }}>
        총 <strong style={{ color: C.ink }}>{total.toLocaleString("ko-KR")}</strong>건
      </p>
      <ul className="divide-y border-y" style={{ borderColor: C.line }}>
        {list.map((r) => (
          <li key={r.name + r.ago} className="py-4" style={{ borderColor: C.line }}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]" style={{ color: C.muted }}>
              <Stars n={r.rating} />
              <span>{r.name}</span>
              <span>{fmtDot(daysAgo(today, r.ago))}</span>
              <span>
                [옵션: {GLAZE_BY_ID[r.glaze].label}] {PRODUCT_BY_ID[r.productId].name}
              </span>
            </div>
            <p className="mt-1.5">{r.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- 장바구니 담기 알림 ---------- */

function AddedLayer({ onClose, onCart }: { onClose: () => void; onCart: () => void }) {
  const reduce = useReducedMotionSafe();
  const firstRef = useDialog(onClose);
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(35,32,29,0.45)" }}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="added-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] rounded-[6px] p-6 text-center"
        style={{ background: C.paper }}
        initial={reduce ? false : { scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: EASE }}
      >
        <p id="added-title" className="font-semibold">
          장바구니에 상품이 정상적으로 담겼습니다.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button ref={firstRef} type="button" onClick={onClose} className="h-11 rounded-[4px] border font-semibold" style={{ borderColor: C.ink }}>
            쇼핑계속하기
          </button>
          <button type="button" onClick={onCart} className="h-11 rounded-[4px] font-semibold" style={{ background: C.ink, color: "#fff" }}>
            장바구니 이동
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- 장바구니 화면 ---------- */

function OrderSteps({ at }: { at: 0 | 1 | 2 }) {
  const steps = ["장바구니", "주문서작성", "주문완료"];
  return (
    <ol className="mt-4 flex items-center justify-center gap-1 text-[14px]" aria-label="주문 단계">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-1" aria-current={i === at ? "step" : undefined}>
          {i > 0 && <ChevronRight size={14} style={{ color: C.clay }} aria-hidden />}
          <span className={i === at ? "font-bold" : ""} style={{ color: i === at ? C.ink : C.muted }}>
            {s}
          </span>
        </li>
      ))}
    </ol>
  );
}

function LineThumb({ l }: { l: CartLine }) {
  return (
    <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[4px]" style={{ background: C.claySoft }}>
      {l.kind === "item" ? (
        <WarePhoto productId={l.productId} glaze={l.glaze} engrave={l.engrave} />
      ) : (
        <ShoppingBag size={26} style={{ color: C.terra }} aria-hidden />
      )}
    </span>
  );
}

function CartView({
  cart,
  minute,
  region,
  onRegion,
  onQty,
  onRemove,
  onClear,
  go,
}: {
  cart: CartLine[];
  minute: number;
  region: Region;
  onRegion: (r: Region) => void;
  onQty: (key: string, delta: number) => void;
  onRemove: (key: string) => void;
  onClear: () => void;
  go: Go;
}) {
  const t = totals(cart, region);
  const left = Math.max(0, FREE_SHIP - t.items);

  return (
    <Container className="pb-16 md:pb-24">
      <Crumbs items={[{ label: "장바구니" }]} go={go} />
      <PageTitle>장바구니</PageTitle>
      <OrderSteps at={0} />

      {cart.length === 0 ? (
        <div className="mt-10 border-y py-16 text-center" style={{ borderColor: C.line }}>
          <ShoppingBag size={36} className="mx-auto" style={{ color: C.clay }} aria-hidden />
          <p className="mt-3 font-semibold">장바구니가 비어 있습니다.</p>
          <button type="button" onClick={() => go({ name: "list", cat: "all", query: "" })} className="mt-5 h-11 rounded-[4px] border px-6 font-semibold" style={{ borderColor: C.ink }}>
            쇼핑계속하기
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="flex items-center justify-between border-b pb-2 text-[15px]" style={{ borderColor: C.ink }}>
              <span className="font-semibold">국내배송상품 ({cart.length})</span>
              <button type="button" onClick={onClear} className="h-9 rounded-[4px] border px-3 text-[14px]" style={{ borderColor: C.line }}>
                장바구니 비우기
              </button>
            </div>
            <ul className="divide-y" style={{ borderColor: C.line }}>
              {cart.map((l) => (
                <li key={l.key} className="flex gap-3 py-4" style={{ borderColor: C.line }}>
                  <LineThumb l={l} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold leading-[1.4]">
                        {lineName(l)}
                        {lineOptions(l) && (
                          <span className="block break-keep text-[14px] font-normal" style={{ color: C.muted }}>
                            {lineOptions(l)}
                          </span>
                        )}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemove(l.key)}
                        aria-label={`${lineName(l)} 삭제`}
                        className="-mr-2 -mt-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{ color: C.muted }}
                      >
                        <Trash2 size={17} aria-hidden />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="flex items-center" role="group" aria-label={`${lineName(l)} 수량`}>
                        <button
                          type="button"
                          onClick={() => onQty(l.key, -1)}
                          disabled={l.qty <= 1}
                          aria-label="수량 감소"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-l-[4px] border disabled:opacity-30"
                          style={{ borderColor: C.clay, background: "#fff" }}
                        >
                          <Minus size={14} aria-hidden />
                        </button>
                        <span className="inline-flex h-9 w-10 items-center justify-center border-y font-bold tabular-nums" style={{ borderColor: C.clay, background: "#fff" }}>
                          {l.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => onQty(l.key, 1)}
                          disabled={l.qty >= lineMax(l)}
                          aria-label="수량 증가"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-r-[4px] border disabled:opacity-30"
                          style={{ borderColor: C.clay, background: "#fff" }}
                        >
                          <Plus size={14} aria-hidden />
                        </button>
                      </span>
                      <span className="font-semibold tabular-nums">{won(linePrice(l) * l.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="border-t pt-3 text-[15px]" style={{ borderColor: C.line, color: C.terraDeep }} aria-live="polite">
              {left > 0 ? `${won(left)} 더 구매하시면 무료배송입니다.` : "무료배송 상품입니다."}
            </p>
            <div className="mt-8">
              <ArrivalPlanner minute={minute} region={region} onRegion={onRegion} />
            </div>
          </div>

          <aside aria-label="결제 예정 금액" className="lg:sticky lg:top-[140px] lg:self-start">
            <div className="rounded-[4px] border p-5" style={{ borderColor: C.ink, background: C.paper }}>
              <dl className="space-y-1.5 text-[15px] tabular-nums">
                <div className="flex justify-between">
                  <dt style={{ color: C.muted }}>총 상품금액</dt>
                  <dd>{won(t.items)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: C.muted }}>총 배송비</dt>
                  <dd>{t.ship + t.extra ? won(t.ship + t.extra) : "무료"}</dd>
                </div>
                <div className="flex justify-between border-t pt-3 text-[18px] font-bold" style={{ borderColor: C.line }}>
                  <dt>결제예정금액</dt>
                  <dd>{won(t.total)}</dd>
                </div>
              </dl>
              <button type="button" onClick={() => go({ name: "order" })} className="mt-5 h-12 w-full rounded-[4px] font-semibold" style={{ background: C.terra, color: "#fff" }}>
                전체상품주문
              </button>
              <button type="button" onClick={() => go({ name: "list", cat: "all", query: "" })} className="mt-2 h-12 w-full rounded-[4px] border font-semibold" style={{ borderColor: C.ink }}>
                쇼핑계속하기
              </button>
            </div>
          </aside>
        </div>
      )}
    </Container>
  );
}

/* ---------- 주문서 ---------- */

type Pay = "card" | "bank" | "phone";

const PAYS: { id: Pay; label: string }[] = [
  { id: "card", label: "카드 결제" },
  { id: "bank", label: "무통장 입금" },
  { id: "phone", label: "휴대폰 결제" },
];

const MEMOS = ["", "부재 시 문 앞에 놓아주세요.", "배송 전에 미리 연락 바랍니다.", "경비실에 맡겨 주세요."];

interface Done {
  no: string;
  name: string;
  phone: string;
  pay: string;
  total: number;
  arrive: string;
  items: { key: string; name: string; options: string; qty: number }[];
}

function OrderView({ cart, region, onRegion, onOrdered, go }: { cart: CartLine[]; region: Region; onRegion: (r: Region) => void; onOrdered: () => void; go: Go }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState("");
  const [addr2, setAddr2] = useState("");
  const [memo, setMemo] = useState("");
  const [pay, setPay] = useState<Pay>("card");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const t = totals(cart, region);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return setError("주문할 상품이 없습니다.");
    if (name.trim().length < 2) return setError("받는사람 이름을 입력해 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setError("휴대전화 번호를 입력해 주세요.");
    if (addr.trim().length < 5) return setError("주소를 입력해 주세요.");
    if (!agree) return setError("구매조건 확인 및 결제진행에 동의해 주세요.");
    setError("");
    const now = new Date();
    const est = estimate(Math.floor(now.getTime() / 60_000), region);
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    setDone({
      no: `${ymd}-${String((now.getMinutes() * 60 + now.getSeconds()) % 10000).padStart(7, "0")}`,
      name: maskName(name),
      phone: maskPhone(phone),
      pay: PAYS.find((p) => p.id === pay)!.label,
      total: t.total,
      arrive: est ? dateText(est.arrive) : "",
      items: cart.map((l) => ({ key: l.key, name: lineName(l), options: lineOptions(l), qty: l.qty })),
    });
    onOrdered();
    window.scrollTo({ top: 0 });
  };

  const field = "mt-1 h-12 w-full rounded-[4px] border px-3 outline-none focus:border-[#b5562f]";

  if (done)
    return (
      <Container className="pb-16 md:pb-24">
        <Crumbs items={[{ label: "주문완료" }]} go={go} />
        <PageTitle>주문완료</PageTitle>
        <OrderSteps at={2} />
        <div className="mx-auto mt-8 max-w-[560px] rounded-[4px] border p-6" style={{ borderColor: C.line, background: C.paper }} aria-live="polite">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ background: C.terra, color: "#fff" }}>
            <Check size={26} aria-hidden />
          </span>
          <p className="mt-3 text-center text-[22px] font-bold tracking-[-0.02em]">주문이 완료되었습니다.</p>
          <p className="mt-1 text-center text-[15px]" style={{ color: C.muted }}>
            출고 시 송장번호를 문자로 안내해 드립니다.
          </p>
          <dl className="mt-5 divide-y border-y text-[15px]" style={{ borderColor: C.line }}>
            {[
              ["주문번호", done.no],
              ["받는사람", done.name],
              ["휴대전화", done.phone],
              ["결제수단", `${done.pay} (테스트)`],
              ["도착 예정", done.arrive],
              ["최종결제금액", won(done.total)],
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
                {it.options && (
                  <span className="block text-[14px]" style={{ color: C.muted }}>
                    {it.options}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => go({ name: "home" })} className="mt-6 h-12 w-full rounded-[4px] font-semibold" style={{ background: C.ink, color: "#fff" }}>
            쇼핑계속하기
          </button>
        </div>
      </Container>
    );

  return (
    <Container className="pb-16 md:pb-24">
      <Crumbs items={[{ label: "장바구니", view: { name: "cart" } }, { label: "주문서작성" }]} go={go} />
      <PageTitle>주문서작성</PageTitle>
      <OrderSteps at={1} />
      {cart.length === 0 ? (
        <div className="mt-10 border-y py-16 text-center" style={{ borderColor: C.line }}>
          <p className="font-semibold">장바구니가 비어 있습니다.</p>
          <button type="button" onClick={() => go({ name: "list", cat: "all", query: "" })} className="mt-5 h-11 rounded-[4px] border px-6 font-semibold" style={{ borderColor: C.ink }}>
            쇼핑계속하기
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <p className="rounded-[4px] px-3 py-2 text-[14px] font-semibold" style={{ background: C.claySoft, color: C.terraDeep }}>
              데모 화면이라 실제로 결제되지 않습니다.
            </p>
            <h2 className="mt-6 border-b pb-2 text-[18px] font-bold" style={{ borderColor: C.ink }}>
              배송지
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-[15px] font-semibold">받는사람</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={{ borderColor: C.clay, background: "#fff" }} />
              </label>
              <label className="block">
                <span className="text-[15px] font-semibold">휴대전화</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={field} style={{ borderColor: C.clay, background: "#fff" }} />
              </label>
            </div>
            <label className="mt-3 block">
              <span className="text-[15px] font-semibold">주소</span>
              <input value={addr} onChange={(e) => setAddr(e.target.value)} autoComplete="street-address" placeholder="기본주소" className={field} style={{ borderColor: C.clay, background: "#fff" }} />
            </label>
            <label className="mt-2 block">
              <span className="sr-only">나머지 주소</span>
              <input value={addr2} onChange={(e) => setAddr2(e.target.value)} placeholder="나머지 주소" className={field} style={{ borderColor: C.clay, background: "#fff" }} />
            </label>
            <label className="mt-3 block">
              <span className="text-[15px] font-semibold">배송지역</span>
              <select value={region} onChange={(e) => onRegion(e.target.value as Region)} className={field} style={{ borderColor: C.clay, background: "#fff" }}>
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                    {r.extra ? ` (+${won(r.extra)})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block">
              <span className="text-[15px] font-semibold">배송메시지 (선택)</span>
              <select value={memo} onChange={(e) => setMemo(e.target.value)} className={field} style={{ borderColor: C.clay, background: "#fff" }}>
                {MEMOS.map((m) => (
                  <option key={m} value={m}>
                    {m || "- 메시지 선택 (선택사항) -"}
                  </option>
                ))}
              </select>
            </label>

            <h2 className="mt-8 border-b pb-2 text-[18px] font-bold" style={{ borderColor: C.ink }}>
              주문상품
            </h2>
            <ul className="divide-y" style={{ borderColor: C.line }}>
              {cart.map((l) => (
                <li key={l.key} className="flex items-center gap-3 py-3" style={{ borderColor: C.line }}>
                  <LineThumb l={l} />
                  <p className="min-w-0 flex-1 text-[15px] font-semibold leading-[1.45]">
                    {lineName(l)}
                    <span className="block text-[14px] font-normal" style={{ color: C.muted }}>
                      {lineOptions(l)} 수량 {l.qty}개
                    </span>
                  </p>
                  <span className="shrink-0 font-semibold tabular-nums">{won(linePrice(l) * l.qty)}</span>
                </li>
              ))}
            </ul>

            <fieldset className="mt-8">
              <legend className="w-full border-b pb-2 text-[18px] font-bold" style={{ borderColor: C.ink }}>
                결제수단
              </legend>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                {PAYS.map((p) => (
                  <label key={p.id} className="flex min-h-11 cursor-pointer items-center gap-2 text-[15px] font-semibold">
                    <input type="radio" name="pay" value={p.id} checked={pay === p.id} onChange={() => setPay(p.id)} className="h-5 w-5 accent-[#b5562f]" />
                    {p.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <aside aria-label="최종결제금액" className="lg:sticky lg:top-[140px] lg:self-start">
            <div className="rounded-[4px] border p-5" style={{ borderColor: C.ink, background: C.paper }}>
              <dl className="space-y-1.5 text-[15px] tabular-nums">
                <div className="flex justify-between">
                  <dt style={{ color: C.muted }}>주문상품</dt>
                  <dd>{won(t.items)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: C.muted }}>배송비</dt>
                  <dd>{t.ship + t.extra ? `+${won(t.ship + t.extra)}` : "무료"}</dd>
                </div>
                <div className="flex justify-between border-t pt-3 text-[18px] font-bold" style={{ borderColor: C.line }}>
                  <dt>최종결제금액</dt>
                  <dd>{won(t.total)}</dd>
                </div>
              </dl>
              <label className="mt-4 flex cursor-pointer items-start gap-2 text-[14px] leading-[1.5]">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#b5562f]" />
                주문 내용을 확인하였으며 구매조건 확인 및 결제진행에 동의합니다. (필수)
              </label>
              {error && (
                <p className="mt-3 text-[15px] font-semibold" style={{ color: "#b3261e" }} role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="mt-4 h-12 w-full rounded-[4px] font-semibold" style={{ background: C.terra, color: "#fff" }}>
                {won(t.total)} 결제하기
              </button>
            </div>
          </aside>
        </form>
      )}
    </Container>
  );
}

/* ---------- 브랜드 소개 ---------- */

function BrandView() {
  return (
    <Container className="pb-16 pt-8 md:pb-24 md:pt-12">
      <h1 className="text-center text-[24px] font-bold tracking-[-0.03em] md:text-[30px]">브랜드 소개</h1>
      <div className="mt-8 grid items-start gap-8 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
          <Image src={`${IMG}/detail.jpg`} alt="유약이 고르게 녹아 윤이 나는 그릇들을 가까이서 찍은 모습" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <p>
            {SHOP}은 대표 김ㅈ우와 이ㅅ연 두 사람이 2019년부터 □□동 작업실에서 운영합니다. 한 번 가마를 땔 때 200점 남짓 나오며, 흠이 없는 것만 골라 판매합니다.
          </p>
          <div className="mt-6">
            <SpecTable
              caption="제작 정보"
              rows={[
                ["흙", "□□ 지역 백토에 옹기토를 섞어 단단하게 만듭니다."],
                ["굽기", "800도 초벌 후 유약을 입혀 1,250도에서 재벌합니다."],
                ["유약", "백자, 청자, 흑유, 분청 네 가지를 작업실에서 직접 배합합니다."],
                ["안전성", "납·카드뮴 용출 시험 불검출 (시험성적서 보유)"],
                ["사용", "식기세척기, 전자레인지 사용 가능. 첫 사용 전 쌀뜨물에 한 번 끓여 주세요."],
              ]}
            />
          </div>
        </div>
      </div>
    </Container>
  );
}

/* ---------- 커뮤니티 ---------- */

const NOTICES = [
  { title: "명절 연휴 배송 안내", ago: 12, body: "연휴 기간 주문은 연휴가 끝난 뒤 첫 영업일부터 순서대로 출고합니다. 연휴 전 마지막 출고는 연휴 전날 오후 2시 주문 건까지입니다." },
  { title: "흑유 머그 400ml 재입고 안내", ago: 19, body: "흑유 머그 400ml 재입고되었습니다. 수량이 많지 않아 조기 품절될 수 있습니다." },
  { title: "물레 체험 일정 안내", ago: 27, body: "매주 토요일 14:00, 16:00 두 차례 운영합니다. 예약은 전화로 받습니다." },
  { title: "각인 상품 출고 일정 안내", ago: 38, body: "각인 상품은 주문 다음 영업일에 출고되며, 단순 변심 교환·반품이 불가합니다." },
];

const FAQS = [
  { q: "교환이나 반품은 어떻게 하나요?", a: "상품 수령 후 7일 이내 고객센터로 접수해 주세요. 단순 변심은 왕복 배송비 7,000원을 부담하셔야 하며, 배송 중 파손은 수령 후 24시간 이내 사진과 함께 접수하시면 무상 교환해 드립니다." },
  { q: "각인 상품도 반품되나요?", a: "각인 상품은 다른 고객에게 판매할 수 없어 단순 변심 반품이 불가합니다. 배송 중 파손된 경우에는 같은 문구로 다시 제작해 보내 드립니다." },
  { q: "배송은 얼마나 걸리나요?", a: "평일 오후 2시 이전 주문은 당일 출고하며, 이후 주문은 다음 영업일에 출고합니다. 출고 후 수도권 1일, 지방 1~2일, 제주·도서산간 2~3일이 걸립니다." },
  { q: "사진과 색이 조금 다릅니다.", a: "수작업 제품 특성상 가마 안 위치에 따라 색상과 유약 흐름이 조금씩 다릅니다. 불량이 아니므로 이 사유로는 교환이 어렵습니다." },
  { q: "식기세척기에 넣어도 되나요?", a: "사용 가능합니다. 흑유는 거친 수세미를 쓰면 광택이 줄어드니 부드러운 면으로 세척해 주세요." },
];

function CommunityView({ initialTab, go }: { initialTab: CommunityTab; go: Go }) {
  const today = useDemoToday();
  const [tab, setTab] = useState<CommunityTab>(initialTab);
  const [openNo, setOpenNo] = useState<number | null>(null);
  const tabs: { id: CommunityTab; label: string }[] = [
    { id: "notice", label: "공지사항" },
    { id: "review", label: "상품 사용후기" },
    { id: "faq", label: "자주 묻는 질문" },
  ];
  const label = tabs.find((t) => t.id === tab)!.label;

  return (
    <Container className="pb-16 md:pb-24">
      <Crumbs items={[{ label: "커뮤니티" }, { label }]} go={go} />
      <PageTitle>{label}</PageTitle>
      <div
        role="tablist"
        aria-label="커뮤니티"
        className="mx-auto mt-6 flex max-w-[860px] justify-center gap-1 border-b"
        style={{ borderColor: C.line }}
        onKeyDown={(e) =>
          onTabKeys(
            e,
            tabs.map((t) => t.id),
            tab,
            setTab,
            "ctab",
          )
        }
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`ctab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls="ctab-panel"
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            className="h-11 border-b-2 px-3 text-[15px] font-semibold"
            style={tab === t.id ? { borderColor: C.terra, color: C.ink } : { borderColor: "transparent", color: C.muted }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div id="ctab-panel" role="tabpanel" aria-labelledby={`ctab-${tab}`} className="mt-6">
        {tab === "notice" && (
          <ul className="mx-auto max-w-[860px] border-t" style={{ borderColor: C.ink }}>
            {NOTICES.map((n, i) => (
              <li key={n.title} className="border-b" style={{ borderColor: C.line }}>
                <button
                  type="button"
                  aria-expanded={openNo === i}
                  onClick={() => setOpenNo(openNo === i ? null : i)}
                  className="flex min-h-[56px] w-full items-center gap-3 py-3 text-left"
                >
                  <span className="w-8 shrink-0 text-center text-[14px] tabular-nums" style={{ color: C.muted }}>
                    {NOTICES.length - i}
                  </span>
                  <span className="min-w-0 flex-1 font-semibold">{n.title}</span>
                  <span className="hidden shrink-0 text-[14px] tabular-nums sm:inline" style={{ color: C.muted }}>
                    {fmtDot(daysAgo(today, n.ago))}
                  </span>
                </button>
                {openNo === i && (
                  <p className="pb-4 pl-11 text-[15px]" style={{ color: C.muted }}>
                    {n.body}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        {tab === "review" && <ReviewList list={REVIEWS} total={REVIEW_ALL} />}
        {tab === "faq" && (
          <div className="mx-auto max-w-[860px] border-t" style={{ borderColor: C.ink }}>
            {FAQS.map((f) => (
              <details key={f.q} className="group border-b" style={{ borderColor: C.line }}>
                <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                  <span>
                    <span style={{ color: C.terra }}>Q. </span>
                    {f.q}
                  </span>
                  <Plus size={18} className="shrink-0 motion-safe:transition-transform group-open:rotate-45" style={{ color: C.terra }} aria-hidden />
                </summary>
                <p className="pb-4 text-[15px]" style={{ color: C.muted }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}

/* ---------- 오시는 길 ---------- */

const HOURS = [
  { label: "화요일 ~ 토요일", time: "11:00 ~ 19:00" },
  { label: "일요일, 월요일", time: "휴무" },
  { label: "물레 체험 (토요일)", time: "14:00, 16:00 (전화 예약)" },
];

function visitStatus(minute: number) {
  if (minute < 0) return null;
  const now = new Date(minute * 60_000);
  const day = now.getDay();
  const m = now.getHours() * 60 + now.getMinutes();
  if (day === 0 || day === 1) return { open: false, text: "오늘은 휴무입니다. 화요일 11시에 엽니다." };
  if (m < 660) return { open: false, text: "오늘 11시에 엽니다." };
  if (m >= 1140) return { open: false, text: day === 6 ? "오늘 영업이 종료되었습니다. 화요일 11시에 엽니다." : "오늘 영업이 종료되었습니다. 내일 11시에 엽니다." };
  return { open: true, text: "영업 중 (19:00까지)" };
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

function VisitView({ minute }: { minute: number }) {
  const status = visitStatus(minute);
  return (
    <Container className="pb-16 pt-8 md:pb-24 md:pt-12">
      <h1 className="text-center text-[24px] font-bold tracking-[-0.03em] md:text-[30px]">오시는 길</h1>
      <p className="mt-2 text-center text-[15px]" style={{ color: C.muted }}>
        온라인에 없는 시험 작품과 B급 그릇은 공방에서 판매합니다.
      </p>
      <div className="mt-8 grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-12">
        <div className="overflow-hidden rounded-[4px] border" style={{ borderColor: C.line }}>
          <MiniMap />
        </div>
        <div>
          <p className="text-[20px] font-bold tracking-[-0.02em]">{ADDRESS}</p>
          <ul className="mt-5 space-y-4">
            {[
              { icon: TrainFront, title: "지하철", body: "□□역 3번 출구에서 도보 7분, 근린공원을 지나 골목 끝에 있습니다." },
              { icon: Car, title: "주차", body: "공방 앞 2대 주차 가능합니다." },
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
          <table className="mt-6 w-full border-t text-[15px]" style={{ borderColor: C.ink }}>
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
          <a href={`tel:${TEL}`} className="mt-4 inline-flex h-12 items-center rounded-[4px] px-6 font-semibold" style={{ background: C.ink, color: "#fff" }}>
            전화 {TEL}
          </a>
        </div>
      </div>
    </Container>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-4 pb-28 pt-12 md:px-6" style={{ background: C.ink, color: C.claySoft }}>
      <div className="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-[1fr_1fr_1.4fr]">
        <div>
          <p className="text-[15px] font-bold" style={{ color: "#fff" }}>
            고객센터
          </p>
          <p className="mt-2 text-[24px] font-bold tabular-nums" style={{ color: "#fff" }}>
            {TEL}
          </p>
          <p className="mt-1 text-[14px] leading-[1.7]" style={{ color: "#b3a593" }}>
            평일 10:00 ~ 17:00 (점심 12:00 ~ 13:00)
            <br />
            토·일·공휴일 휴무
          </p>
        </div>
        <div>
          <p className="text-[15px] font-bold" style={{ color: "#fff" }}>
            입금계좌
          </p>
          <p className="mt-2 text-[14px] leading-[1.7]" style={{ color: "#b3a593" }}>
            △△은행 000-000000-00-000
            <br />
            예금주 {SHOP}
          </p>
        </div>
        <div>
          <Logo />
          <dl className="mt-4 grid gap-y-1 text-[13px]" style={{ color: "#b3a593" }}>
            {[
              ["상호", "ㅎㄱ 도자기 공방"],
              ["대표자", "김ㅈ우"],
              ["사업자등록번호", "000-00-00000"],
              ["통신판매업 신고번호", "제0000-□□-0000호"],
              ["주소", ADDRESS],
              ["개인정보 보호책임자", "이ㅅ연"],
            ].map(([k, v]) => (
              <div key={k} className="flex min-w-0 flex-wrap gap-x-2">
                <dt>{k}</dt>
                <dd style={{ color: "#fff" }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-[1200px] text-[13px]" style={{ color: "#8f8273" }}>
        결제대행 △△페이먼츠. 고객님의 안전거래를 위해 현금 등으로 결제 시 구매안전 서비스를 이용하실 수 있습니다.
      </p>
    </footer>
  );
}
