"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Baby, Car, CreditCard, MapPin, Menu, Phone, ShoppingBag, Users, Wifi, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 동네 한식당 홈페이지 데모: 곰파트너 한식당 샘플.
   상호, 대표자, 주소, 전화번호, 사업자 정보, 메뉴와 가격은 모두 가상이다.

   29.9만 원 기본 패키지(소개 홈페이지) 범위로만 만든 샘플이다.
   구역 다섯 개(가게 소개, 대표메뉴, 전체 메뉴, 영업시간, 오시는 길)를 한 페이지에 두고 위쪽 메뉴로 이동한다.
   예약·주문 폼, 게시판, 회원, 결제, 실시간 현황은 넣지 않는다.

   뼈대: 메뉴판형. 국밥집 벽에 거는 나무 메뉴패를 그대로 옮겨 식사 메뉴를 세로쓰기 패로 걸고,
   안주·추가 메뉴와 원산지 표시는 그 아래 점선 목록으로 둔다.
   영업시간은 요일마다 10시부터 22시까지 막대를 그려 브레이크타임 빈칸이 한눈에 보이게 한다.
   오늘 요일 강조는 하이드레이션 뒤에만 한다.
   지도는 넣지 않고 네이버 지도, 카카오맵으로 여는 버튼과 주소, 주차, 대중교통 안내만 둔다.

   항목 명칭은 네이버 플레이스와 맛집 소개 매체의 국밥·백반집 표기를 따른다
   (대표메뉴, 영업시간, 브레이크타임, 라스트오더, 정기휴무, 포장 가능, 단체 이용 가능, 주차, 원산지).

   디자인: 백자색 바탕(#f8f5ee)에 먹색 글씨(#1e1b17), 국물 빛 붉은색(#a32a1d) 하나만 강조색으로 쓴다.
   메뉴패는 밝은 나무색(#d9bf8f).

   사진 출처(public/images/demo-hansik):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, gukbap, baekban, suyuk, interior */

const IMG = "/images/demo-hansik";
const STORE = "곰파트너";
const TEL = "02-000-0000";
const ADDRESS = "서울 ㅁㅍ구 ㅇㄴ동 ㅇㄴ로 3길 14 1층";

const C = {
  paper: "#f8f5ee",
  card: "#fffdf8",
  ink: "#1e1b17",
  muted: "#5c554b",
  line: "#e3ddd0",
  red: "#a32a1d",
  wood: "#d9bf8f",
  woodEdge: "#b8955a",
  woodInk: "#2b1d0e",
  woodMuted: "#5a4426",
};

const SECTIONS = [
  { id: "about", label: "가게 소개" },
  { id: "signature", label: "대표메뉴" },
  { id: "menu", label: "전체 메뉴" },
  { id: "hours", label: "영업시간" },
  { id: "visit", label: "오시는 길" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const won = (n: number) => n.toLocaleString("ko-KR");

/* ---------- 메뉴 ---------- */

interface Plaque {
  name: string;
  price: number;
  /** 특 가격 */
  big?: number;
}

const MEALS: Plaque[] = [
  { name: "소고기국밥", price: 10000, big: 13000 },
  { name: "순대국밥", price: 9500, big: 12000 },
  { name: "돼지국밥", price: 9500, big: 12000 },
  { name: "제육백반", price: 11000 },
  { name: "고등어구이백반", price: 12000 },
  { name: "김치찌개백반", price: 10000 },
  { name: "된장찌개백반", price: 10000 },
  { name: "비빔밥", price: 9000 },
];

interface Row {
  name: string;
  price: string;
}

const SIDES: { title: string; rows: Row[] }[] = [
  {
    title: "안주",
    rows: [
      { name: "수육 (소)", price: "25,000" },
      { name: "수육 (대)", price: "35,000" },
      { name: "모둠순대", price: "15,000" },
      { name: "제육 반접시", price: "10,000" },
      { name: "김치전", price: "13,000" },
    ],
  },
  {
    title: "추가·주류",
    rows: [
      { name: "공기밥", price: "1,000" },
      { name: "고기 추가", price: "4,000" },
      { name: "계란후라이 (2개)", price: "2,000" },
      { name: "소주·맥주", price: "5,000" },
      { name: "막걸리", price: "4,000" },
    ],
  },
];

const ORIGIN = [
  ["쇠고기(사골·양지)", "국내산 한우"],
  ["돼지고기", "국내산"],
  ["쌀", "국내산"],
  ["배추김치", "배추·고춧가루 국내산"],
  ["고등어", "국내산"],
  ["순대", "돼지 창자 국내산"],
] as const;

/* ---------- 영업시간 ---------- */

const RULER_FROM = 600; // 10:00
const RULER_TO = 1320; // 22:00
const BREAK: [number, number] = [900, 990]; // 15:00~16:30

interface Day {
  day: number; // Date.getDay()
  label: string;
  open?: [number, number];
}

const WEEK: Day[] = [
  { day: 1, label: "월" },
  { day: 2, label: "화", open: [630, 1260] },
  { day: 3, label: "수", open: [630, 1260] },
  { day: 4, label: "목", open: [630, 1260] },
  { day: 5, label: "금", open: [630, 1260] },
  { day: 6, label: "토", open: [630, 1260] },
  { day: 0, label: "일", open: [630, 1200] },
];

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const pct = (m: number) => `${((m - RULER_FROM) / (RULER_TO - RULER_FROM)) * 100}%`;

const noopSubscribe = () => () => {};

/** 오늘 요일. 서버 렌더와 하이드레이션 중에는 -1이라 강조가 없다. */
function useWeekday() {
  return useSyncExternalStore(noopSubscribe, () => new Date().getDay(), () => -1);
}

/* ---------- 공용 ---------- */

function LogoMark() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.svg" alt="" aria-hidden width={32} height={32} className="h-8 w-8 shrink-0" />
    </>
  );
}

function SectionHead({ id, title, sub }: { id: string; title: string; sub?: string }) {
  return (
    <div className="mb-8 flex flex-col gap-2 sm:mb-10">
      <h2 id={id} className="text-[28px] font-bold leading-[1.3] tracking-[-0.02em] sm:text-[34px]">
        {title}
      </h2>
      <span aria-hidden className="block h-[3px] w-10" style={{ background: C.red }} />
      {sub && (
        <p className="mt-1 text-[17px]" style={{ color: C.muted }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ---------- 데모 ---------- */

export function KoreanRestaurantDemo() {
  const reduce = useReducedMotionSafe();
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<SectionId | null>(null);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  /* 사용법 가이드: 첫 화면으로 */
  useEffect(() => {
    const f = () => {
      setMenuOpen(false);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  /* 지금 보고 있는 구역을 위쪽 메뉴에 표시 */
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as SectionId);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* 모바일 메뉴: Esc로 닫기 */
  useEffect(() => {
    if (!menuOpen) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [menuOpen]);

  return (
    <div className="min-h-screen overflow-x-hidden text-[17px] leading-[1.6]" style={{ background: C.paper, color: C.ink }}>
      <Header active={active} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onNav={scrollTo} />
      <main>
        <Hero onMenu={() => scrollTo("menu")} />
        <About />
        <Signature />
        <MenuBoard />
        <Hours />
        <Visit />
      </main>
      <Footer />
    </div>
  );
}

/* ---------- 머리 ---------- */

function Header({
  active,
  menuOpen,
  setMenuOpen,
  onNav,
}: {
  active: SectionId | null;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  onNav: (id: string) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: C.paper, borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false);
            window.scrollTo({ top: 0 });
          }}
          aria-label={`${STORE} 처음으로`}
          className="flex items-center gap-2"
        >
          <LogoMark />
          <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[18px] font-bold tracking-[-0.02em]">곰파트너</span>
            <span className="text-[11px] font-semibold opacity-80">한식당 샘플</span>
          </span>
        </button>

        <nav aria-label="주 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-1 text-[16px]">
            {SECTIONS.map((s) => {
              const on = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNav(s.id);
                    }}
                    aria-current={on ? "true" : undefined}
                    className="relative inline-flex h-11 items-center px-3 font-medium transition-colors hover:text-[#a32a1d]"
                    style={on ? { color: C.red } : undefined}
                  >
                    {s.label}
                    {on && <span aria-hidden className="absolute inset-x-3 bottom-1.5 h-[2px]" style={{ background: C.red }} />}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <a
            href={`tel:${TEL}`}
            aria-label={`전화하기 ${TEL}`}
            className="inline-flex h-11 items-center gap-2 rounded-[4px] px-3 text-[15px] font-semibold text-white"
            style={{ background: C.red }}
          >
            <Phone size={17} aria-hidden />
            <span className="hidden sm:inline">{TEL}</span>
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="hansik-mobile-nav"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] md:hidden"
          >
            {menuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="hansik-mobile-nav" aria-label="주 메뉴" className="soft-in border-t md:hidden" style={{ borderColor: C.line, background: C.card }}>
          <ul className="px-4 py-2">
            {SECTIONS.map((s) => (
              <li key={s.id} className="border-b last:border-b-0" style={{ borderColor: C.line }}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNav(s.id);
                  }}
                  className="flex h-12 items-center text-[17px] font-medium"
                  style={active === s.id ? { color: C.red } : undefined}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

/* ---------- 첫 화면 ---------- */

function Hero({ onMenu }: { onMenu: () => void }) {
  return (
    <section aria-labelledby="hansik-title" className="mx-auto grid max-w-[1200px] gap-8 px-4 pb-14 pt-6 sm:px-6 md:grid-cols-[1fr_1.15fr] md:items-center md:gap-12 md:pb-20 md:pt-12">
      <div className="relative order-first aspect-[4/3] overflow-hidden rounded-[6px] md:order-last md:aspect-[5/4]">
        <Image
          src={`${IMG}/hero.jpg`}
          alt="된장찌개 뚝배기와 고등어구이, 반찬이 차려진 한 상"
          fill
          priority
          sizes="(min-width: 768px) 620px, 100vw"
          className="object-cover"
        />
      </div>
      <div>
        <p className="text-[16px] font-semibold" style={{ color: C.red }}>
          ㅁㅍ구 ㅇㄴ동 국밥·백반
        </p>
        <h1 id="hansik-title" className="mt-2 text-[40px] font-bold leading-[1.2] tracking-[-0.03em] sm:text-[52px]">
          {STORE}
        </h1>
        <p className="mt-4 max-w-[30em] text-[18px] leading-[1.7]" style={{ color: C.muted }}>
          사골을 밤새 고아 국밥을 내고, 점심에는 반찬 네 가지를 곁들인 백반을 차립니다.
        </p>

        <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 border-t pt-5 text-[16px]" style={{ borderColor: C.line }}>
          <dt className="font-semibold">영업시간</dt>
          <dd>화~토 10:30~21:00, 일 10:30~20:00</dd>
          <dt className="font-semibold">브레이크타임</dt>
          <dd>15:00~16:30</dd>
          <dt className="font-semibold">정기휴무</dt>
          <dd>매주 월요일</dd>
        </dl>

        <div className="mt-8 flex flex-wrap gap-2">
          <a
            href={`tel:${TEL}`}
            className="inline-flex h-12 items-center gap-2 rounded-[4px] px-5 text-[17px] font-semibold text-white"
            style={{ background: C.ink }}
          >
            <Phone size={18} aria-hidden />
            {TEL}
          </a>
          <button
            type="button"
            onClick={onMenu}
            className="inline-flex h-12 items-center rounded-[4px] border px-5 text-[17px] font-semibold"
            style={{ borderColor: C.ink }}
          >
            메뉴 보기
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- 가게 소개 ---------- */

function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-16 border-t py-16 sm:py-20" style={{ borderColor: C.line, background: C.card }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 sm:px-6 md:grid-cols-[1fr_1.4fr] md:gap-16">
        <SectionHead id="about-title" title="가게 소개" />
        <div className="space-y-5 text-[17px] leading-[1.8]">
          <p>
            2009년에 ㅇㄴ동 시장 골목에서 국밥 한 가지로 시작했습니다. 지금 자리로 옮긴 뒤로 백반과 수육을 더했고, 국물은 처음 방식 그대로 사골과 양지를 열두 시간 끓여 냅니다.
          </p>
          <p>
            김치는 매주 화요일에 담그고, 백반 반찬은 그날 들어온 채소로 아침마다 무칩니다. 반찬과 공기밥 한 공기는 더 달라고 하시면 그냥 드립니다.
          </p>
          <ul className="grid gap-x-8 gap-y-3 border-t pt-6 text-[16px] sm:grid-cols-2" style={{ borderColor: C.line }}>
            <li className="flex gap-3">
              <span className="w-[5.5em] shrink-0 font-semibold">국물</span>
              <span style={{ color: C.muted }}>사골·양지 12시간</span>
            </li>
            <li className="flex gap-3">
              <span className="w-[5.5em] shrink-0 font-semibold">김치</span>
              <span style={{ color: C.muted }}>매주 직접 담금</span>
            </li>
            <li className="flex gap-3">
              <span className="w-[5.5em] shrink-0 font-semibold">반찬</span>
              <span style={{ color: C.muted }}>네 가지, 매일 바뀜</span>
            </li>
            <li className="flex gap-3">
              <span className="w-[5.5em] shrink-0 font-semibold">좌석</span>
              <span style={{ color: C.muted }}>홀 32석, 좌식방 24석</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 대표메뉴 ---------- */

const SIGNATURE = [
  {
    img: "gukbap",
    name: "소고기국밥",
    price: "10,000원 (특 13,000원)",
    desc: "사골 국물에 양지를 썰어 넣고 대파를 듬뿍 올립니다. 밥은 따로 냅니다.",
    alt: "양지와 대파를 올린 소고기국밥 뚝배기",
  },
  {
    img: "baekban",
    name: "제육백반",
    price: "11,000원",
    desc: "주문 받고 바로 볶는 제육에 된장국과 반찬 네 가지.",
    alt: "제육볶음과 된장국, 반찬이 차려진 백반 상",
  },
  {
    img: "suyuk",
    name: "수육",
    price: "소 25,000원, 대 35,000원",
    desc: "국밥 육수에 함께 삶은 삼겹살. 새우젓과 김치를 곁들입니다.",
    alt: "도마 위에 썰어 낸 돼지 수육과 새우젓",
  },
] as const;

function Signature() {
  const [main, ...rest] = SIGNATURE;
  return (
    <section id="signature" aria-labelledby="signature-title" className="scroll-mt-16 py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <SectionHead id="signature-title" title="대표메뉴" />
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr] md:gap-10">
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[6px]">
              <Image src={`${IMG}/${main.img}.jpg`} alt={main.alt} fill sizes="(min-width: 768px) 700px, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-4">
              <MenuCaption name={main.name} price={main.price} desc={main.desc} big />
            </figcaption>
          </figure>
          <div className="grid gap-8">
            {rest.map((m) => (
              <figure key={m.img}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-[6px]">
                  <Image src={`${IMG}/${m.img}.jpg`} alt={m.alt} fill sizes="(min-width: 768px) 460px, 100vw" className="object-cover" />
                </div>
                <figcaption className="mt-3">
                  <MenuCaption name={m.name} price={m.price} desc={m.desc} />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MenuCaption({ name, price, desc, big }: { name: string; price: string; desc: string; big?: boolean }) {
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className={`${big ? "text-[24px]" : "text-[20px]"} font-bold tracking-[-0.02em]`}>{name}</h3>
        <span className="text-[16px] font-semibold tabular-nums">{price}</span>
      </div>
      <p className="mt-1 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
        {desc}
      </p>
    </>
  );
}

/* ---------- 전체 메뉴 ---------- */

function MenuBoard() {
  return (
    <section id="menu" aria-labelledby="menu-title" className="scroll-mt-16 border-t py-16 sm:py-20" style={{ borderColor: C.line, background: C.card }}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <SectionHead id="menu-title" title="전체 메뉴" sub="국밥은 보통과 특 두 가지이고, 특은 고기가 두 배입니다. 모든 메뉴 포장 가능합니다." />

        <h3 className="sr-only">식사</h3>
        <div className="relative px-1 pt-3 sm:px-3">
          {/* 메뉴패를 거는 가로대 */}
          <span aria-hidden className="absolute inset-x-0 top-0 h-2 rounded-[2px]" style={{ background: C.woodEdge }} />
          <ul className="grid grid-cols-4 gap-x-2 gap-y-6 sm:gap-x-4 lg:grid-cols-8">
            {MEALS.map((m) => (
              <li key={m.name} className="flex flex-col items-center">
                <span aria-hidden className="h-4 w-px" style={{ background: C.woodEdge }} />
                <div
                  className="flex h-[236px] w-full max-w-[104px] flex-col items-center justify-between rounded-[4px] border px-1 pb-3 pt-4 shadow-[0_2px_0_rgba(43,29,14,0.18)]"
                  style={{
                    background: `repeating-linear-gradient(90deg, ${C.wood} 0 7px, #d4b884 7px 8px)`,
                    borderColor: C.woodEdge,
                    color: C.woodInk,
                  }}
                >
                  <span className="text-[19px] font-bold leading-none tracking-[0.06em] sm:text-[21px]" style={{ writingMode: "vertical-rl" }}>
                    {m.name}
                  </span>
                  <span className="flex flex-col items-center text-center leading-[1.3]">
                    <span className="text-[15px] font-bold tabular-nums sm:text-[16px]">{won(m.price)}</span>
                    {m.big && (
                      <span className="text-[13px] font-semibold tabular-nums sm:text-[14px]" style={{ color: C.woodMuted }}>
                        특 {won(m.big)}
                      </span>
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-14">
          {SIDES.map((g) => (
            <div key={g.title}>
              <h3 className="border-b pb-2 text-[20px] font-bold" style={{ borderColor: C.ink }}>
                {g.title}
              </h3>
              <ul>
                {g.rows.map((r) => (
                  <li key={r.name} className="flex items-baseline gap-3 py-2.5 text-[17px]">
                    <span className="shrink-0">{r.name}</span>
                    <span aria-hidden className="min-w-4 flex-1 translate-y-[-4px] border-b border-dotted" style={{ borderColor: "#b9b1a3" }} />
                    <span className="shrink-0 font-semibold tabular-nums">{r.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[6px] border p-5 sm:p-6" style={{ borderColor: C.line, background: C.paper }}>
          <h3 className="text-[17px] font-bold">원산지 표시</h3>
          <dl className="mt-3 grid gap-x-8 gap-y-1.5 text-[15px] sm:grid-cols-2 lg:grid-cols-3">
            {ORIGIN.map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <dt className="font-semibold">{k}</dt>
                <dd style={{ color: C.muted }}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* ---------- 영업시간 ---------- */

function Hours() {
  const today = useWeekday();
  const ticks = [600, 720, 840, 960, 1080, 1200, 1320];

  return (
    <section id="hours" aria-labelledby="hours-title" className="scroll-mt-16 py-16 sm:py-20">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div>
          <SectionHead id="hours-title" title="영업시간" />
          <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-[17px]">
            <dt className="font-semibold">영업시간</dt>
            <dd>
              화~토 10:30~21:00
              <br />일 10:30~20:00
            </dd>
            <dt className="font-semibold">브레이크타임</dt>
            <dd>15:00~16:30</dd>
            <dt className="font-semibold">라스트오더</dt>
            <dd>마감 30분 전</dd>
            <dt className="font-semibold">정기휴무</dt>
            <dd>매주 월요일, 설·추석 당일</dd>
          </dl>
        </div>

        <div className="rounded-[6px] border p-4 sm:p-6" style={{ borderColor: C.line, background: C.card }}>
          <h3 className="sr-only">요일별 영업시간</h3>
          {/* 시각 눈금 */}
          <div aria-hidden className="relative ml-[44px] h-6 text-[12px] tabular-nums sm:ml-[52px] sm:text-[13px]" style={{ color: C.muted }}>
            {ticks.map((t, i) => (
              <span
                key={t}
                className="absolute top-0"
                style={{ left: pct(t), transform: i === 0 ? "none" : i === ticks.length - 1 ? "translateX(-100%)" : "translateX(-50%)" }}
              >
                {t / 60}시
              </span>
            ))}
          </div>
          <ul className="space-y-1.5">
            {WEEK.map((d) => {
              const isToday = d.day === today;
              const text = d.open
                ? `${d.label}요일 ${hhmm(d.open[0])}~${hhmm(d.open[1])}, 브레이크타임 ${hhmm(BREAK[0])}~${hhmm(BREAK[1])}, 라스트오더 ${hhmm(d.open[1] - 30)}`
                : `${d.label}요일 정기휴무`;
              return (
                <li
                  key={d.day}
                  className="flex items-center gap-2 rounded-[4px] py-1.5 sm:gap-3"
                  style={isToday ? { background: "#f3e6e3" } : undefined}
                >
                  <span className="sr-only">{text}</span>
                  <span aria-hidden className="w-[36px] shrink-0 text-center text-[16px] font-bold sm:w-[40px]" style={isToday ? { color: C.red } : undefined}>
                    {d.label}
                    {isToday && <span className="block text-[11px] font-semibold leading-none">오늘</span>}
                  </span>
                  <div aria-hidden className="relative h-8 flex-1 rounded-[2px]" style={{ background: "#efeae0" }}>
                    {d.open ? (
                      <>
                        <span className="absolute inset-y-0 rounded-[2px]" style={{ left: pct(d.open[0]), width: `calc(${pct(BREAK[0])} - ${pct(d.open[0])})`, background: C.ink }} />
                        <span className="absolute inset-y-0 rounded-[2px]" style={{ left: pct(BREAK[1]), width: `calc(${pct(d.open[1])} - ${pct(BREAK[1])})`, background: C.ink }} />
                        <span
                          className="absolute inset-y-0 border-x border-dashed"
                          style={{ left: pct(BREAK[0]), width: `calc(${pct(BREAK[1])} - ${pct(BREAK[0])})`, borderColor: "#b9b1a3" }}
                        />
                        <span className="absolute inset-y-0 w-[2px]" style={{ left: `calc(${pct(d.open[1] - 30)} - 1px)`, background: C.red }} />
                      </>
                    ) : (
                      <span className="absolute inset-0 flex items-center pl-3 text-[15px] font-semibold" style={{ color: C.red }}>
                        정기휴무
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <div aria-hidden className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[14px]" style={{ color: C.muted }}>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-5 rounded-[2px]" style={{ background: C.ink }} />
              영업
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-5 border border-dashed" style={{ borderColor: "#8f8676" }} />
              브레이크타임
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-[2px]" style={{ background: C.red }} />
              라스트오더
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

const FACILITIES = [
  { icon: Users, label: "단체 이용 가능" },
  { icon: ShoppingBag, label: "포장 가능" },
  { icon: Car, label: "주차 가능" },
  { icon: Baby, label: "유아의자" },
  { icon: Wifi, label: "무선 인터넷" },
  { icon: CreditCard, label: "제로페이" },
] as const;

function Visit() {
  return (
    <section id="visit" aria-labelledby="visit-title" className="scroll-mt-16 border-t py-16 sm:py-20" style={{ borderColor: C.line, background: C.card }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-14">
        <div>
          <SectionHead id="visit-title" title="오시는 길" />
          <p className="flex items-start gap-2 text-[20px] font-bold leading-[1.5] tracking-[-0.01em]">
            <MapPin size={22} aria-hidden className="mt-1 shrink-0" style={{ color: C.red }} />
            {ADDRESS}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <a href="#" className="inline-flex h-12 items-center justify-center rounded-[4px] border text-[16px] font-semibold" style={{ borderColor: C.ink }}>
              네이버 지도
            </a>
            <a href="#" className="inline-flex h-12 items-center justify-center rounded-[4px] border text-[16px] font-semibold" style={{ borderColor: C.ink }}>
              카카오맵
            </a>
          </div>

          <dl className="mt-8 divide-y border-y text-[17px]" style={{ borderColor: C.line }}>
            {[
              ["전화", <a key="tel" href={`tel:${TEL}`} className="font-semibold underline underline-offset-4">{TEL}</a>],
              ["대중교통", "ㅇㄴ역 2번 출구에서 걸어서 4분, 마을버스 ㅁㅍ09 ㅇㄴ시장 정류장 앞"],
              ["주차", "건물 뒤 전용 주차 3대, 만차 시 ㅇㄴ동 공영주차장 이용(식사 시 1시간 주차권)"],
              ["단체석", "안쪽 좌식방 최대 24명, 단체는 전화로 미리 말씀해 주세요"],
            ].map(([k, v]) => (
              <div key={k as string} className="grid grid-cols-[5.5em_1fr] gap-3 py-3.5" style={{ borderColor: C.line }}>
                <dt className="font-semibold">{k}</dt>
                <dd style={{ color: C.muted }}>{v}</dd>
              </div>
            ))}
          </dl>

          <h3 className="sr-only">편의시설</h3>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-[16px] sm:grid-cols-3">
            {FACILITIES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon size={18} aria-hidden style={{ color: C.muted }} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <figure className="md:pt-[88px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] md:aspect-[4/5]">
            <Image src={`${IMG}/interior.jpg`} alt="나무 식탁과 의자가 놓인 밝은 홀" fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />
          </div>
          <figcaption className="mt-3 text-[15px]" style={{ color: C.muted }}>
            창가 쪽 홀
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-4 pb-28 pt-12 text-[15px] sm:px-6" style={{ background: C.ink, color: "#c9c2b6" }}>
      <div className="mx-auto max-w-[1200px]">
        <p className="flex items-center gap-2 text-[18px] font-bold text-[#f8f5ee]">
          <LogoMark />
          {STORE}
        </p>
        <DemoMakerInfo className="mt-4" />
      </div>
    </footer>
  );
}
