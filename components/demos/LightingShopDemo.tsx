"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Car, Check, Clock, MapPin, Menu, Minus, Plus, RotateCcw, Trash2, Train, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 조명 가게 홈페이지 샘플: 가상의 조명 가게 곰파트너. 상호, 주소, 전화는 모두 가상이다.
   첫 화면 사진 출처: Pexels 사진 14680170. 상품 사진은 AI 생성(Z-Image-Turbo)

   국내 조명 가게와 조명 쇼핑몰 공통 구성: 상단 분류(펜던트, 스탠드, 레일, 벽등, 간접조명), 공간별 조명 추천,
   색온도 안내(전구색 2700K~3000K, 주백색 4000K, 주광색 6500K), 전구 별매와 LED 일체형 표기, 레일 1m 포함 같은 구성 표기,
   시공 안내(레일 설치비 별도, 전기 공사 별도), 매장 전시장 안내와 오시는 길, 주차 안내, 상담신청.

   모션: 첫 화면 실내 사진 한 장이 1.6초 동안 천천히 다가온다(scale 1.04 -> 1). 동작 줄이기면 멈춘 사진.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 제품 둘러보기: 형태별 분류 탭과 제품 카드(구성, 가격).
   2. 색온도 안내와 공간별 추천: 글로 된 표.
   3. 견적 담기와 시공 상담: 담은 제품 합계, 시공 여부, 상담신청과 접수 완료 화면.
   4. 매장 안내와 오시는 길: 영업시간(오늘 요일 진하게), 주차, 전시장 안내.

   첫 화면(ls-poster): 상단 형태별 메뉴, 실내 사진, 옆에 제목과 영업시간, 아래 형태별 분류 줄. */

const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 1층";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 조명 가게";

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold tracking-[-0.03em]`}>조명 가게</span>
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

/* 모션 곡선 */
const EASE = [0.22, 1, 0.36, 1] as const;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/* 색온도 안내. 조명 가게에서 안내하는 대로. */
const KELVIN = [
  { name: "전구색", k: "2700K~3000K", look: "노란빛이 도는 따뜻한 빛", rooms: "침실, 거실, 식탁" },
  { name: "주백색", k: "4000K", look: "흰빛과 노란빛 사이의 자연스러운 빛", rooms: "주방, 거실, 아이 방" },
  { name: "주광색", k: "5700K~6500K", look: "푸른빛이 도는 밝은 흰빛", rooms: "서재, 작업실, 상가 진열" },
];

/* 공간별 추천 */
const ROOMS = [
  { room: "거실", pick: "레일 스팟이나 장스탠드로 나눠 켜기", kelvin: "3000K~4000K" },
  { room: "식탁", pick: "식탁 위 70~80cm 높이 펜던트", kelvin: "2700K~3000K" },
  { room: "침실", pick: "벽등과 스탠드로 낮게", kelvin: "2700K" },
  { room: "주방", pick: "레일등이나 원통 레일등", kelvin: "4000K" },
  { room: "서재", pick: "레일 스팟과 책상 스탠드", kelvin: "5700K" },
];

type Category = "펜던트" | "스탠드" | "레일" | "벽등" | "간접 LED 바";
const CATEGORIES: Category[] = ["펜던트", "스탠드", "레일", "벽등", "간접 LED 바"];

type Product = { id: string; cat: Category; name: string; price: number; spec: string };
/* 가격은 국내 조명 쇼핑몰 시세 근처 */
const PRODUCTS: Product[] = [
  { id: "p-dome", cat: "펜던트", name: "돔 펜던트 1등 블랙", price: 48000, spec: "E26 소켓, 전구 별매" },
  { id: "p-globe", cat: "펜던트", name: "유리 볼 펜던트 스모크", price: 69000, spec: "E26 소켓, 전구 별매" },
  { id: "p-triple", cat: "펜던트", name: "원뿔 펜던트 3등 세트", price: 128000, spec: "LED 전구 3개 포함" },
  { id: "p-rattan", cat: "펜던트", name: "라탄 펜던트 대", price: 89000, spec: "E26 소켓, 전구 별매" },
  { id: "s-arc", cat: "스탠드", name: "아치 장스탠드 대리석 베이스", price: 398000, spec: "높이 2m, E26 전구 별매" },
  { id: "s-tripod", cat: "스탠드", name: "삼각 우드 장스탠드", price: 139000, spec: "린넨 쉐이드, 전구 별매" },
  { id: "s-drum", cat: "스탠드", name: "드럼 쉐이드 장스탠드", price: 98000, spec: "풋 스위치, 전구 별매" },
  { id: "r-spot3", cat: "레일", name: "레일 스팟 3구 세트", price: 79000, spec: "레일 1m 포함, LED 일체형" },
  { id: "r-cyl2", cat: "레일", name: "원통 레일등 2구 세트", price: 64000, spec: "레일 1m 포함, 전구 별매" },
  { id: "r-pend", cat: "레일", name: "레일 펜던트 2등 세트", price: 158000, spec: "레일 1.5m 포함, 전구 별매" },
  { id: "w-sconce", cat: "벽등", name: "상하향 벽등 브라스", price: 46000, spec: "G9 전구 포함" },
  { id: "w-round", cat: "벽등", name: "원형 벽등 화이트", price: 32000, spec: "LED 일체형 12W" },
  { id: "l-bar1", cat: "간접 LED 바", name: "간접 LED 바 1m", price: 32000, spec: "3000K, 어댑터 포함" },
  { id: "l-bar2", cat: "간접 LED 바", name: "간접 LED 바 2m 리모컨", price: 59000, spec: "색온도 조절, 어댑터 포함" },
];
const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;

type Done = { no: number; name: string; phone: string; size: string; day: Date; install: boolean; total: number };

export function LightingShopDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [cat, setCat] = useState<Category>("펜던트");
  const [cart, setCart] = useState<Record<string, number>>({});

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

  return (
    <div className="min-h-screen overflow-x-clip pb-24" style={{ background: C.bg, color: C.cream }}>
      <Poster
        reduce={reduce}
        today={today}
        go={go}
        onCat={(c) => {
          setCat(c);
          go("ls-products");
        }}
      />

      {/* 제품 */}
      <section id="ls-products" aria-labelledby="ls-products-title" className="mx-auto mt-4 max-w-[1200px] scroll-mt-4 px-4 md:mt-8 md:px-6">
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
            const qty = cart[p.id] ?? 0;
            return (
              <li key={p.id} className="flex flex-col rounded-[8px] border p-3 md:p-4" style={{ borderColor: C.line, background: C.panel }}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[6px]" style={{ background: "#101010" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                  <img src={`${IMG}/products/${p.id}.jpg`} alt={`${p.name} 켜 둔 모습`} loading="lazy" width={600} height={600} className="h-full w-full object-cover" />
                </div>
                <p className="mt-3 text-[15px] font-bold leading-[1.4]">{p.name}</p>
                <p className="mt-0.5 text-[13px]" style={{ color: C.creamDim }}>
                  {p.spec}
                </p>
                <p className="mt-2 text-[17px] font-bold tabular-nums" style={{ color: C.amber }}>
                  {won(p.price)}
                </p>
                <button type="button" data-gtm-cta="lighting-shop_cart" onClick={() => addCart(p.id)} className={`mt-3 inline-flex items-center justify-center gap-1 rounded-[4px] px-2 py-1.5 text-[14px] font-bold ${focusRing}`} style={{ background: C.cream, color: C.ink, outlineColor: C.amber }}>
                  {qty > 0 ? <Check size={15} aria-hidden /> : <Plus size={15} aria-hidden />}
                  {qty > 0 ? `견적에 ${qty}개` : "견적 담기"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 색온도 안내와 공간별 추천 */}
      <section id="ls-guide" aria-labelledby="ls-guide-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <h2 id="ls-guide-title" className="text-[26px] font-bold">
          색온도 안내
        </h2>
        <ul className="mt-5 grid gap-3 md:grid-cols-3">
          {KELVIN.map((k) => (
            <li key={k.name} className="rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.panel }}>
              <p className="flex items-baseline justify-between gap-3">
                <span className="text-[18px] font-bold">{k.name}</span>
                <span className="text-[14px] tabular-nums" style={{ color: C.amber }}>
                  {k.k}
                </span>
              </p>
              <p className="mt-2 text-[15px] leading-[1.6]">{k.look}</p>
              <p className="mt-1 text-[14px]" style={{ color: C.creamDim }}>
                {k.rooms}
              </p>
            </li>
          ))}
        </ul>
        <h3 className="mt-8 text-[20px] font-bold">공간별 추천</h3>
        {/* 휴대폰: 공간마다 한 줄 */}
        <ul className="mt-3 divide-y rounded-[8px] border md:hidden" style={{ borderColor: C.line, background: C.panel }}>
          {ROOMS.map((r) => (
            <li key={`m${r.room}`} className="px-4 py-2.5" style={{ borderColor: C.line }}>
              <p className="flex items-baseline justify-between gap-3 text-[15px]">
                <span className="font-bold">{r.room}</span>
                <span className="whitespace-nowrap tabular-nums" style={{ color: C.amber }}>
                  {r.kelvin}
                </span>
              </p>
              <p className="mt-0.5 text-[14px]" style={{ color: C.creamDim }}>
                {r.pick}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-3 hidden overflow-x-auto rounded-[8px] border md:block" style={{ borderColor: C.line, background: C.panel }}>
          <table className="w-full min-w-[480px] text-left text-[15px]">
            <thead style={{ color: C.creamDim }}>
              <tr className="border-b" style={{ borderColor: C.line }}>
                <th scope="col" className="px-4 py-2.5 font-semibold">공간</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">추천 조명</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">색온도</th>
              </tr>
            </thead>
            <tbody>
              {ROOMS.map((r) => (
                <tr key={r.room} className="border-b last:border-b-0" style={{ borderColor: C.line }}>
                  <th scope="row" className="px-4 py-2.5 font-bold">{r.room}</th>
                  <td className="px-4 py-2.5">{r.pick}</td>
                  <td className="px-4 py-2.5 tabular-nums">{r.kelvin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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


/* ---------------- 첫 화면 ---------------- */

/* 실제 조명 매장 사이트처럼 상단에 형태별 분류 메뉴를 두고, 첫 화면은 조명 셋이 켜진 거실 사진 한 장.
   PC는 사진 오른쪽에 제목, 영업시간, 전시장 안내와 상담 버튼. 휴대폰은 사진 아래.
   사진 아래에는 형태별 분류 줄(대표 제품 사진 + 이름). 분류를 누르면 아래 제품 목록이 그 분류로 열린다.
   모션: 사진만 1.04배에서 1.6초 동안 천천히 다가온다. 동작 줄이기면 바로. */
/** 분류마다 대표 제품 사진 */
const CAT_COVER: Record<Category, string> = { 펜던트: "p-dome", 스탠드: "s-arc", 레일: "r-spot3", 벽등: "w-sconce", "간접 LED 바": "l-bar1" };

function Poster({
  reduce,
  today,
  go,
  onCat,
}: {
  reduce: boolean;
  today: Date;
  go: (id: string) => void;
  onCat: (c: Category) => void;
}) {
  const [menu, setMenu] = useState(false);
  const todayHours = HOURS.find((h) => h.days.includes(today.getDay()))!;
  const nav = (fn: () => void) => {
    setMenu(false);
    fn();
  };
  const navItems: [string, () => void][] = [
    ...CATEGORIES.slice(0, 4).map((c) => [c, () => onCat(c)] as [string, () => void]),
    ["색온도 안내", () => go("ls-guide")],
    ["시공 안내", () => go("ls-quote")],
    ["매장 안내", () => go("ls-store")],
  ];

  return (
    <section id="ls-poster" aria-labelledby="ls-poster-title" style={{ background: C.bg }}>
      <header className="relative z-20 border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
          <SampleLogo light small />
          <nav aria-label="주요 메뉴" className="hidden items-center lg:flex" style={{ color: C.creamDim }}>
            {navItems.map(([label, fn]) => (
              <button key={label} type="button" onClick={() => nav(fn)} className={`min-h-11 rounded-[4px] px-3 text-[15px] hover:text-[#f2f2f2] ${focusRing}`} style={{ outlineColor: C.amber }}>
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go("ls-quote")} data-gtm-cta="lighting-shop_poster_cta" className={`min-h-11 rounded-[4px] px-4 text-[15px] font-bold ${focusRing}`} style={{ background: C.amber, color: C.ink, outlineColor: C.cream }}>
              상담신청
            </button>
            <button
              type="button"
              aria-expanded={menu}
              aria-controls="ls-menu-list"
              aria-label={menu ? "메뉴 닫기" : "메뉴 열기"}
              onClick={() => setMenu((v) => !v)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-[4px] border lg:hidden ${focusRing}`}
              style={{ borderColor: C.line, outlineColor: C.amber }}
            >
              {menu ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>
        {menu && (
          <nav id="ls-menu-list" aria-label="메뉴 펼침" className="absolute inset-x-0 top-full border-b px-4 pb-4 pt-2 lg:hidden" style={{ background: C.panel, borderColor: C.line }}>
            <ul className="grid grid-cols-2 gap-1">
              {navItems.map(([label, fn]) => (
                <li key={label}>
                  <button type="button" onClick={() => nav(fn)} className={`flex min-h-11 w-full items-center rounded-[4px] px-3 text-left text-[16px] font-semibold ${focusRing}`} style={{ outlineColor: C.amber }}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* 실내 사진 | 제목, 영업시간, 전시장 안내 */}
      <div className="mx-auto max-w-[1200px] md:px-6 md:pt-6 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-6">
        <div className="relative aspect-[3/2] overflow-hidden md:rounded-[6px]" style={{ background: "#101010" }}>
          <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.04 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : 1.6, ease: EASE }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
            <img
              src={`${IMG}/room.jpg`}
              sizes="(min-width: 1200px) 760px, (min-width: 1024px) 64vw, 100vw"
              width={1200}
              height={799}
              alt="식탁 위 흰 돔 펜던트, 소파 옆 검은 아치 스탠드, 벽 브래킷과 작은 테이블 램프가 켜진 거실"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>

        <div className="flex flex-col gap-4 px-4 pt-4 md:px-0 lg:pt-0">
          <div>
            <h1 id="ls-poster-title" className="text-[24px] font-bold leading-[1.3] tracking-[-0.03em] [word-break:keep-all] md:text-[30px]">
              설치 시공까지 하는 조명 매장
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[15px]" style={{ color: C.creamDim }}>
              <Clock size={16} aria-hidden style={{ color: C.amber }} />
              전시장 오늘 {todayHours.time === "휴무" ? "휴무" : todayHours.time}, 평일 10:00~19:00
            </p>
          </div>
          <div className="rounded-[6px] border p-4 text-[15px] leading-[1.7]" style={{ background: C.panel, borderColor: C.line }}>
            <p className="font-bold">전시장 안내</p>
            <p style={{ color: C.creamDim }}>제품 150여 종을 켜 두고 있어요. 방문 전 연락 주시면 상담 시간을 잡아 드려요.</p>
            <p className="mt-2 font-bold">시공</p>
            <p style={{ color: C.creamDim }}>펜던트, 레일, 간접조명 설치까지 함께 해요. 설치비는 시공 안내에 적어 두었어요.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => go("ls-products")} className={`min-h-11 rounded-[4px] border px-2 text-[14px] font-bold ${focusRing}`} style={{ borderColor: C.amber, color: C.amber, outlineColor: C.cream }}>
                제품 보기
              </button>
              <button type="button" onClick={() => go("ls-quote")} data-gtm-cta="lighting-shop_hero_quote" className={`min-h-11 rounded-[4px] px-2 text-[14px] font-bold ${focusRing}`} style={{ background: C.cream, color: C.ink, outlineColor: C.amber }}>
                시공 상담
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* 형태별 분류 */}
      <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-5 md:px-6 md:pb-12 md:pt-6">
        <ul aria-label="형태별 분류" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-5 md:gap-3 md:overflow-visible md:px-0">
          {CATEGORIES.map((c) => (
            <li key={c} className="w-[132px] flex-none md:w-auto">
              <button type="button" onClick={() => onCat(c)} className={`flex w-full items-center gap-3 rounded-[6px] border p-2 text-left ${focusRing}`} style={{ borderColor: C.line, background: C.panel, outlineColor: C.amber }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                <img src={`${IMG}/products/${CAT_COVER[c]}.jpg`} alt="" aria-hidden loading="lazy" width={48} height={48} className="h-12 w-12 flex-none rounded-[4px] object-cover" />
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold leading-[1.3]">{c}</span>
                  <span className="block text-[13px] tabular-nums" style={{ color: C.creamDim }}>
                    {PRODUCTS.filter((x) => x.cat === c).length}종
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- 견적과 상담 ---------------- */

const SIZES = ["10평 미만", "10~20평", "20~30평", "30평 이상", "상가, 사무실"] as const;

/* 시공 안내. 비용과 조건을 적는다. */
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
          <rect x="202" y="34" width="76" height="30" rx="4" fill={C.amber} />
          <text x="240" y="54" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.ink}>
            조명 가게
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
