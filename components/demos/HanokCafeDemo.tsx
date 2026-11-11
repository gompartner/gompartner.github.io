"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronRight, List, Phone } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 한옥 찻집 홈페이지 데모: 곰파트너 한옥 찻집 샘플.
   상호, 대표자, 주소, 전화번호, 사업자 정보, 메뉴와 가격은 모두 가상이다.

   뼈대는 공간 중심형(브랜드 티하우스 매장 소개 페이지 방식)이다. 위쪽 가로 메뉴, 첫 화면 사진 한 장,
   공간별 사진 카드, 메뉴판, 오시는 길 순서로 둔다. 방 단위 예약은 네이버 예약으로 연결한다.

   디자인: 한지색 바탕(#f3ede2)에 옅은 섬유 질감, 먹색 글씨(#1f1b16), 낙관 주홍(#a8432a).
   제목은 굵은 고딕, 본문은 보통 고딕. 상호는 기둥에 거는 주련처럼 세로로 쓴다.

   메뉴는 대표 메뉴 사진과 분류별 메뉴판(전통차, 커피, 음료, 다과)으로 보여 준다.
   오시는 길은 주소, 지도 앱 버튼, 대중교통과 주차 안내로 둔다.

   하위 화면(공간 소개, 메뉴, 좌석 예약, 오시는 길, 공지사항)은 새 주소 없이 page 상태로 바꿔 그린다.

   사진 출처(public/images/demo-cafe):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, coffee, bingsu, omija, yard */

const IMG = "/images/demo-cafe";
const CAFE = "한옥 찻집";
const TEL = "02-000-0000";
const ADDRESS = "ㄴㄹ시 ㅈㅇ로 12길 7";

const PAPER_TEXTURE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.28 0 0 0 0.07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const BOOKING_URL = "https://booking.naver.com/";
const NAVER_MAP = "https://map.naver.com/";
const KAKAO_MAP = "https://map.kakao.com/";

/* ---------- 메뉴 ---------- */

type Kind = "tea" | "coffee" | "drink" | "dessert";
type Temp = "hot" | "cold" | "any";

interface MenuItem {
  name: string;
  kind: Kind;
  temp: Temp;
  price: number;
  desc: string;
  season?: boolean;
}

const MENU: MenuItem[] = [
  { name: "작설차", kind: "tea", temp: "hot", price: 7000, desc: "하동에서 덖은 햇차. 두 번까지 더 우려 드립니다" },
  { name: "우엉차", kind: "tea", temp: "hot", price: 6500, desc: "" },
  { name: "냉 작설차", kind: "tea", temp: "cold", price: 7000, desc: "찬물에 우려 쓴맛 없이 깔끔한 작설차" },
  { name: "쌍화차", kind: "tea", temp: "hot", price: 8000, desc: "10가지 약재로 6시간 이상 달인 차, 대추, 밤, 잣 고명" },
  { name: "대추차", kind: "tea", temp: "hot", price: 7500, desc: "" },
  { name: "유자차", kind: "tea", temp: "any", price: 7000, desc: "고흥 유자로 직접 담은 청" },
  { name: "오미자차", kind: "tea", temp: "cold", price: 7000, desc: "" },
  { name: "아메리카노", kind: "coffee", temp: "any", price: 5500, desc: "" },
  { name: "오늘의 핸드드립", kind: "coffee", temp: "hot", price: 7000, desc: "그날 원두로 내린 커피, 약과 한 조각과 함께 제공됩니다" },
  { name: "콜드브루", kind: "coffee", temp: "cold", price: 6500, desc: "물 또는 우유 선택" },
  { name: "흑임자 라테", kind: "coffee", temp: "any", price: 7000, desc: "" },
  { name: "인절미 라테", kind: "coffee", temp: "any", price: 7000, desc: "" },
  { name: "단호박 식혜", kind: "drink", temp: "cold", price: 6500, desc: "매장에서 직접 삭힌 식혜", season: true },
  { name: "수정과", kind: "drink", temp: "cold", price: 6000, desc: "곶감을 띄운 수정과" },
  { name: "미숫가루", kind: "drink", temp: "any", price: 6000, desc: "국산 수제 미숫가루, 꿀은 따로 제공" },
  { name: "쑥 라테", kind: "drink", temp: "any", price: 7000, desc: "커피 없이 쑥으로만 만든 라테" },
  { name: "인절미 빙수", kind: "dessert", temp: "cold", price: 13000, desc: "" },
  { name: "홍시 빙수", kind: "dessert", temp: "cold", price: 14000, desc: "얼린 홍시를 통째로 갈아 올린 빙수", season: true },
  { name: "단팥죽", kind: "dessert", temp: "hot", price: 9000, desc: "새알심과 밤이 들어간 단팥죽" },
  { name: "약과 세 개", kind: "dessert", temp: "any", price: 5000, desc: "직접 만든 개성약과" },
  { name: "가래떡구이", kind: "dessert", temp: "hot", price: 5500, desc: "조청과 함께 제공됩니다" },
  { name: "들기름 누룽지", kind: "dessert", temp: "any", price: 4500, desc: "" },
];

const KIND_LABEL: Record<Kind, string> = { tea: "전통차", coffee: "커피", drink: "음료", dessert: "다과" };

const BEST = [
  { img: "coffee", name: "오늘의 핸드드립", alt: "흰 자기 잔에 담긴 핸드드립 커피와 약과" },
  { img: "omija", name: "오미자차", alt: "얼음을 띄운 붉은 오미자차" },
  { img: "bingsu", name: "인절미 빙수", alt: "놋그릇에 담긴 인절미 빙수" },
];

const priceOf = (name: string) => MENU.find((m) => m.name === name)?.price ?? 0;

function won(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

/* ---------- 공간 ---------- */

type GroupId = "daecheong" | "gunneon" | "sarang" | "toen" | "byeolchae";

interface Unit {
  id: string;
  name: string;
  group: GroupId;
  min: number;
  max: number;
}

const UNITS: Unit[] = [
  { id: "gunneon", name: "건넌방", group: "gunneon", min: 2, max: 6 },
  { id: "daecheong", name: "대청마루", group: "daecheong", min: 1, max: 8 },
  { id: "sarang1", name: "사랑방 1", group: "sarang", min: 2, max: 4 },
  { id: "sarang2", name: "사랑방 2", group: "sarang", min: 2, max: 4 },
  { id: "toen1", name: "툇마루 1", group: "toen", min: 1, max: 2 },
  { id: "toen2", name: "툇마루 2", group: "toen", min: 1, max: 2 },
  { id: "toen3", name: "툇마루 3", group: "toen", min: 1, max: 2 },
  { id: "byeolchae", name: "별채", group: "byeolchae", min: 6, max: 10 },
];

interface Group {
  id: GroupId;
  name: string;
  seating: string;
  reservable: boolean;
  desc: string;
  img: string;
  pos: string;
  alt: string;
}

const GROUPS: Group[] = [
  {
    id: "daecheong",
    name: "대청마루",
    seating: "입식 테이블 4개",
    reservable: false,
    desc: "서까래가 보이는 안채 대청마루",
    img: "hero",
    pos: "60% 50%",
    alt: "창호지 문을 열어 둔 한옥 마루에 찻주전자와 청자 찻잔이 놓인 모습",
  },
  {
    id: "gunneon",
    name: "건넌방",
    seating: "좌식 방 1실",
    reservable: true,
    desc: "신발을 벗고 들어가는 좌식 공간. 가족 모임에 많이 이용하십니다.",
    img: "hero",
    pos: "25% 50%",
    alt: "창호지 문 안쪽 마루에 놓인 찻상과 찻잔",
  },
  {
    id: "sarang",
    name: "사랑방",
    seating: "좌식 방 2실",
    reservable: true,
    desc: "문을 닫으면 개별룸으로 이용 가능한 작은 방 두 칸. 사랑방 2는 마당 쪽 창이 있습니다.",
    img: "hero",
    pos: "85% 50%",
    alt: "한옥 방 안 낮은 상 위의 찻주전자와 다과",
  },
  {
    id: "toen",
    name: "툇마루",
    seating: "마루 자리 3곳",
    reservable: true,
    desc: "마루 끝에 앉아 마당을 바라보는 자리. 우천 시 처마 안쪽으로 자리를 옮겨 드립니다.",
    img: "yard",
    pos: "35% 50%",
    alt: "기와지붕 아래 툇마루와 소나무가 있는 한옥 마당",
  },
  {
    id: "byeolchae",
    name: "별채",
    seating: "입식 큰 상 1실",
    reservable: true,
    desc: "마당 건너 별채. 대관료 없이 1인 1메뉴 주문 부탁드립니다.",
    img: "yard",
    pos: "80% 50%",
    alt: "마당 건너편 기와지붕 별채와 소나무",
  },
];

const unitsOf = (id: GroupId) => UNITS.filter((u) => u.group === id);
const seatsOf = (id: GroupId) => unitsOf(id).reduce((n, u) => n + u.max, 0);
const TOTAL_SEATS = GROUPS.reduce((n, g) => n + seatsOf(g.id), 0);

const SLOTS = ["11:00", "13:00", "15:00", "17:00", "19:00"];

/* ---------- 공통 장식 ---------- */

function BrushRule({ className = "", color = "#1f1b16" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 400 10" preserveAspectRatio="none" className={className} aria-hidden>
      <path d="M2 6 C 60 2, 140 3, 220 4.5 S 360 6.5, 398 4 L 398 5.5 C 340 8.5, 240 7, 160 7.5 S 40 8.5, 2 7.5 Z" fill={color} />
    </svg>
  );
}


/* ---------- 데모 ---------- */

type Page = "home" | "about" | "menu" | "reserve" | "location" | "notice";
type SubId = Exclude<Page, "home">;
type Go = (p: Page, anchor?: string) => void;

const PAGES: { id: SubId; label: string }[] = [
  { id: "about", label: "공간 소개" },
  { id: "menu", label: "메뉴" },
  { id: "reserve", label: "좌석 예약" },
  { id: "location", label: "오시는 길" },
  { id: "notice", label: "공지사항" },
];

export function HanokCafeDemo() {
  const reduce = useReducedMotionSafe();

  const [page, setPage] = useState<Page>("home");
  const [anchor, setAnchor] = useState<{ id: string; n: number } | null>(null);

  /* 하위 화면 전환: 맨 위로 올리거나, 지정한 위치로 바로 내려간다 */
  useEffect(() => {
    if (anchor) document.getElementById(anchor.id)?.scrollIntoView({ block: "start" });
  }, [anchor]);

  const go: Go = (p, id) => {
    setPage(p);
    if (id) setAnchor((a) => ({ id, n: (a?.n ?? 0) + 1 }));
    else window.scrollTo({ top: 0 });
  };

  /* 사용법 가이드: 하위 화면에서 누르면 첫 화면으로 돌아간다 */
  useEffect(() => {
    const f = () => {
      setPage("home");
      setAnchor(null);
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  let body: React.ReactNode = null;
  switch (page) {
    case "about":
      body = <AboutPage />;
      break;
    case "menu":
      body = <MenuPage />;
      break;
    case "reserve":
      body = <ReservePage />;
      break;
    case "location":
      body = <LocationPage />;
      break;
    case "notice":
      body = <NoticePage />;
      break;
  }

  return (
    <div className="min-h-screen bg-[#f3ede2] text-[17px] leading-[1.6] text-[#1f1b16]" style={{ backgroundImage: PAPER_TEXTURE }}>
      <TopNav page={page} go={go} />
      <main key={page} className="soft-in">
        {page === "home" ? (
          <>
            <Intro onReserve={() => scrollTo("space")} onMenuBoard={() => scrollTo("menu")} />
            <SpaceSection />
            <MenuSection />
            <Location />
          </>
        ) : (
          <SubPage page={page} go={go}>
            {body}
          </SubPage>
        )}
      </main>
      <Footer />
    </div>
  );
}

/* ---------- 메뉴(내비게이션) ---------- */

/** 위쪽 상호 줄 + 주 메뉴. 넓은 화면에서는 한 줄, 좁은 화면에서는 아래 가로 띠로 내려간다. */
function TopNav({ page, go }: { page: Page; go: Go }) {
  const links = PAGES.map((l) => {
    const on = page === l.id;
    return (
      <li key={l.id} className="flex">
        <button
          type="button"
          onClick={() => go(l.id)}
          aria-current={on ? "page" : undefined}
          className={`flex items-center px-2.5 transition-colors hover:text-[#a8432a] lg:px-3 ${on ? "font-bold text-[#a8432a] shadow-[inset_0_-2px_0_#a8432a]" : ""}`}
        >
          {l.label}
        </button>
      </li>
    );
  });
  return (
    <header className="sticky top-0 z-40 border-b border-[#1f1b16]/10 bg-[#f3ede2]">
      <div className="mx-auto flex h-14 max-w-[1160px] items-center justify-between gap-6 px-4 sm:px-6 lg:h-16 lg:px-10">
        <button type="button" onClick={() => go("home")} aria-label={`${CAFE} 처음으로`} className="flex items-center gap-2">
          <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[18px] font-bold">한옥 찻집</span>
          </span>
        </button>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex h-16 items-stretch text-[16px]">{links}</ul>
        </nav>
        <a href={`tel:${TEL}`} aria-label={`전화하기 ${TEL}`} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[4px] bg-[#1f1b16] px-3 text-[15px] text-[#f3ede2] lg:px-4">
          <Phone size={17} aria-hidden />
          <span className="hidden lg:inline">{TEL}</span>
        </a>
      </div>
      <nav aria-label="주 메뉴" className="overflow-x-auto lg:hidden">
        <ul className="flex h-11 items-stretch gap-1 whitespace-nowrap px-2 text-[15px]">{links}</ul>
      </nav>
    </header>
  );
}

/* ---------- 하위 화면 틀 ---------- */

function SubPage({ page, go, children }: { page: SubId; go: Go; children: React.ReactNode }) {
  const label = PAGES.find((p) => p.id === page)!.label;
  const headRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headRef.current?.focus({ preventScroll: true });
  }, [page]);

  return (
    <div className="px-4 pb-16 pt-4 sm:px-6 lg:px-10 lg:pb-24 lg:pt-8">
      <div className="mx-auto max-w-[1080px]">
        <nav aria-label="현재 위치">
          <ol className="flex items-center gap-1.5 text-[14px] text-[#6b5a48]">
            <li>
              <button type="button" onClick={() => go("home")} className="inline-flex h-11 items-center hover:underline">
                홈
              </button>
            </li>
            <li aria-hidden>
              <ChevronRight size={14} />
            </li>
            <li aria-current="page" className="font-semibold text-[#1f1b16]">
              {label}
            </li>
          </ol>
        </nav>
        <h1 ref={headRef} tabIndex={-1} className="text-[32px] font-bold leading-[1.3] tracking-[-0.02em] outline-none sm:text-[40px]">
          {label}
        </h1>
        <BrushRule className="mt-2 h-2 w-28" color="#a8432a" />

        <nav aria-label="찻집 안내" className="-mx-4 mt-6 overflow-x-auto border-b border-[#1f1b16]/15 px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-1 whitespace-nowrap">
            {PAGES.map((p) => {
              const on = p.id === page;
              return (
                <li key={p.id} className="flex">
                  <button
                    type="button"
                    onClick={() => go(p.id)}
                    aria-current={on ? "page" : undefined}
                    className={`flex h-12 items-center px-3 text-[16px] transition-colors ${on ? "font-bold text-[#a8432a] shadow-[inset_0_-3px_0_#a8432a]" : "text-[#4a4036] hover:text-[#1f1b16]"}`}
                  >
                    {p.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}

function SubTitle({ id, children, aside }: { id: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 border-[#1f1b16] pb-2">
      <h2 id={id} className="text-[24px] font-bold tracking-[-0.02em] sm:text-[26px]">
        {children}
      </h2>
      {aside && <p className="text-[15px] text-[#6b5a48]">{aside}</p>}
    </div>
  );
}

/* ---------- 소개(첫 화면) ---------- */

function Intro({ onReserve, onMenuBoard }: { onReserve: () => void; onMenuBoard: () => void }) {
  return (
    <section id="top" aria-labelledby="cafe-title" className="scroll-mt-28 px-4 pt-4 sm:px-6 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1080px]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] sm:aspect-[16/9]">
          <Image
            src={`${IMG}/hero.jpg`}
            alt="창호지 문을 열어 둔 한옥 마루에 찻주전자와 청자 찻잔, 약과가 놓인 모습"
            fill
            priority
            sizes="(min-width:1024px) 1080px, 100vw"
            className="object-cover object-[70%_50%]"
          />
          <div className="absolute right-[6%] top-0 flex flex-col items-center">
            <span className="h-4 w-px bg-[#1f1b16]/50 sm:h-6" aria-hidden />
            <h1
              id="cafe-title"
              className="rounded-[2px] bg-[#2a211a] px-2.5 py-4 text-[24px] font-bold tracking-[0.18em] text-[#f3ede2] shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)] sm:px-3.5 sm:py-6 sm:text-[34px]"
              style={{ writingMode: "vertical-rl" }}
            >
              {CAFE}
            </h1>
          </div>
        </div>

        <div className="mt-6 grid gap-6 border-b border-[#1f1b16]/15 pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="max-w-[34em] text-[17px] text-[#4a4036]">1962년에 지은 ㄱ자 한옥 찻집. 직접 달인 전통차와 커피, 다과를 준비합니다.</p>
            <p className="mt-4 max-w-[34em] text-[16px] leading-[1.75] text-[#4a4036]">
              화요일부터 일요일까지 <b className="font-semibold text-[#1f1b16]">11:00 ~ 21:00</b>에 문을 열어요. 마지막 주문은 20:30이고 월요일과 설, 추석 당일은 쉬어요.
              좌식 방 3실은 방 단위로 예약받아요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onReserve} className="inline-flex h-12 items-center rounded-[4px] bg-[#1f1b16] px-6 text-[16px] font-semibold text-[#f3ede2] transition-colors hover:bg-[#a8432a]">
              공간 보기
            </button>
            <button type="button" onClick={onMenuBoard} className="inline-flex h-12 items-center rounded-[4px] border border-[#1f1b16]/30 px-6 text-[16px] font-semibold transition-colors hover:border-[#1f1b16]">
              메뉴판 보기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 공간 안내 ---------- */

function BookingLink({ label = "네이버 예약", className = "" }: { label?: string; className?: string }) {
  return (
    <a
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex h-12 items-center justify-center rounded-[4px] bg-[#1f1b16] px-6 text-[16px] font-semibold text-[#f3ede2] transition-colors hover:bg-[#a8432a] ${className}`}
    >
      {label}
    </a>
  );
}

function SpaceCards() {
  return (
    <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {GROUPS.map((g) => (
        <li key={g.id} className="min-w-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
            <Image src={`${IMG}/${g.img}.jpg`} alt={g.alt} fill sizes="(min-width:1024px) 340px, (min-width:640px) 50vw, 100vw" className="object-cover" style={{ objectPosition: g.pos }} />
          </div>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3">
            <h3 className="text-[20px] font-bold tracking-[-0.02em]">{g.name}</h3>
            <span className="text-[15px] text-[#6b5a48]">{g.seating}</span>
          </div>
          <p className="mt-1 text-[15px] leading-[1.7] text-[#4a4036]">{g.desc}</p>
          <p className="mt-2 text-[15px]">
            <span className="text-[#a8432a]">{g.reservable ? "예약" : "자유석"}</span> {peopleOf(g.id)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function SpaceSection() {
  return (
    <section id="space" aria-labelledby="space-title" className="scroll-mt-28 px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 id="space-title" className="text-[30px] font-bold leading-[1.3] tracking-[-0.02em] sm:text-[36px]">
            공간 안내
          </h2>
          <p className="text-[15px] text-[#6b5a48]">1962년 한옥, 좌석 {TOTAL_SEATS}석</p>
        </div>
        <div className="mt-8">
          <SpaceCards />
        </div>
        <div className="mt-10 flex flex-col gap-4 rounded-[6px] border border-[#1f1b16]/15 bg-[#faf6ee] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-[18px] font-bold">좌식 방 예약</p>
            <p className="mt-1 text-[15px] text-[#4a4036]">건넌방, 사랑방, 툇마루, 별채는 2시간 단위로 예약받습니다. 대청마루는 오신 순서대로 앉으실 수 있습니다.</p>
          </div>
          <BookingLink className="shrink-0" />
        </div>
      </div>
    </section>
  );
}

/* ---------- 메뉴 ---------- */

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <li className="py-3.5">
      <div className="flex items-baseline gap-3">
        <span className="text-[19px] font-bold tracking-[-0.02em]">{item.name}</span>
        {item.season && <span className="rounded-[2px] border border-[#a8432a] px-1.5 text-[13px] leading-[1.6] text-[#a8432a]">가을</span>}
        <span className="mb-1 flex-1 border-b border-dotted border-[#1f1b16]/35" aria-hidden />
        <span className="text-[17px] font-semibold tabular-nums">{won(item.price)}</span>
      </div>
      {(item.temp === "any" || item.desc) && (
        <p className="mt-1 text-[15px] text-[#5b5045]">
          {[item.temp === "any" ? "따뜻하게, 시원하게" : "", item.desc].filter(Boolean).join(", ")}
        </p>
      )}
    </li>
  );
}

function BestMenu() {
  return (
    <ul className="grid gap-6 sm:grid-cols-3">
      {BEST.map((b) => (
        <li key={b.name} className="min-w-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
            <Image src={`${IMG}/${b.img}.jpg`} alt={b.alt} fill sizes="(min-width:640px) 340px, 100vw" className="object-cover" />
          </div>
          <p className="mt-3 flex items-baseline justify-between gap-3">
            <span className="text-[18px] font-bold">{b.name}</span>
            <span className="text-[16px] font-semibold tabular-nums">{won(priceOf(b.name))}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

function MenuBoard({ kinds }: { kinds: Kind[] }) {
  return (
    <div className={`grid gap-x-10 gap-y-8 ${kinds.length > 1 ? "md:grid-cols-2" : "max-w-[640px]"}`}>
      {kinds.map((k) => (
        <div key={k} className="min-w-0">
          <p className="border-b-2 border-[#1f1b16] pb-1.5 text-[18px] font-bold text-[#a8432a]">{KIND_LABEL[k]}</p>
          <ul className="divide-y divide-[#1f1b16]/10">
            {MENU.filter((m) => m.kind === k).map((m) => (
              <MenuRow key={m.name} item={m} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function MenuSection() {
  return (
    <section id="menu" aria-labelledby="menu-title" className="scroll-mt-28 border-t border-[#1f1b16]/10 bg-[#efe7da]/60 px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-[1080px]">
        <h2 id="menu-title" className="text-[30px] font-bold leading-[1.3] tracking-[-0.02em] sm:text-[36px]">
          메뉴
        </h2>
        <h3 className="mt-8 text-[20px] font-bold">대표 메뉴</h3>
        <div className="mt-4">
          <BestMenu />
        </div>
        <div id="menu-board" className="mt-12 rounded-[6px] border border-[#1f1b16]/15 bg-[#faf6ee] p-5 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="text-[22px] font-bold">메뉴판</h3>
            <p className="text-[14px] text-[#6b5a48]">계절 메뉴: 홍시 빙수, 단호박 식혜</p>
          </div>
          <div className="mt-6">
            <MenuBoard kinds={Object.keys(KIND_LABEL) as Kind[]} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

/** bare: 하위 화면(오시는 길)에 넣을 때 제목과 바깥 여백 없이 그린다 */
function Location({ bare = false }: { bare?: boolean }) {
  const content = (
    <div className={`${bare ? "" : "mt-8 "}grid gap-8 md:grid-cols-3`}>
      <div>
        <h3 className="text-[18px] font-bold">주소</h3>
        <p className="mt-2 text-[16px]">{ADDRESS}</p>
        <p className="mt-1 text-[15px] text-[#5b5045]">ㅎㅅ역 2번 출구에서 큰길을 따라 50m, 편의점을 끼고 12길 골목 끝 파란 대문</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={NAVER_MAP} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center rounded-[4px] border border-[#1f1b16]/30 px-4 text-[15px] font-semibold transition-colors hover:border-[#1f1b16]">
            네이버 지도
          </a>
          <a href={KAKAO_MAP} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center rounded-[4px] border border-[#1f1b16]/30 px-4 text-[15px] font-semibold transition-colors hover:border-[#1f1b16]">
            카카오맵
          </a>
          <a href={`tel:${TEL}`} className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-[#1f1b16] px-4 text-[15px] font-semibold text-[#f3ede2] transition-colors hover:bg-[#a8432a]">
            <Phone size={16} aria-hidden />
            전화하기
          </a>
        </div>
      </div>
      <div>
        <h3 className="text-[18px] font-bold">영업시간</h3>
        <dl className="mt-2 grid grid-cols-[72px_1fr] gap-y-1.5 text-[16px]">
          <dt className="text-[#6b5a48]">화 ~ 일</dt>
          <dd>11:00 ~ 21:00</dd>
          <dt className="text-[#6b5a48]">주문 마감</dt>
          <dd>20:30</dd>
          <dt className="text-[#6b5a48]">휴무</dt>
          <dd>월요일, 설, 추석 당일</dd>
        </dl>
      </div>
      <div>
        <h3 className="text-[18px] font-bold">주차 안내</h3>
        <p className="mt-2 text-[16px]">골목 입구 ㅁㄹ공영주차장 이용 시 2시간 할인권을 드립니다.</p>
      </div>
    </div>
  );

  if (bare) return <div id="location">{content}</div>;

  return (
    <section id="location" aria-labelledby="location-title" className="scroll-mt-28 border-t border-[#1f1b16]/10 px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 id="location-title" className="text-[30px] font-bold leading-[1.3] tracking-[-0.02em] sm:text-[36px]">
            오시는 길
          </h2>
          <p className="text-[15px] text-[#6b5a48]">ㅎㅅ역 2번 출구 도보 6분</p>
        </div>
        {content}
      </div>
    </section>
  );
}

/* ---------- 하위 화면: 공간 소개 ---------- */

const peopleOf = (id: GroupId) =>
  unitsOf(id)
    .map((u) => (unitsOf(id).length > 1 ? `${u.name} ${u.min}~${u.max}명` : `${u.min}~${u.max}명`))
    .join(", ");

const ABOUT_FACTS: [string, string][] = [
  ["건물", "1962년 ㄱ자 한옥"],
  ["좌석", `${TOTAL_SEATS}석`],
  ["공간", GROUPS.map((g) => g.name).join(", ")],
  ["편의시설", "개별룸, 좌식, 야외좌석(툇마루), 단체석(별채)"],
  ["화장실", "마당 안쪽"],
  ["주차", "주차 불가 (ㅁㄹ공영주차장 2시간 할인)"],
];

function AboutPage() {
  return (
    <div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-[4px] sm:aspect-[16/10]">
          <Image src={`${IMG}/yard.jpg`} alt="기와지붕 아래 툇마루와 소나무가 있는 한옥 마당" fill sizes="(min-width:1024px) 560px, 100vw" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-[17px] text-[#4a4036]">1962년에 지은 ㄱ자 한옥 찻집. 직접 달인 전통차와 커피, 다과를 준비합니다.</p>
          <dl className="mt-5 divide-y divide-[#1f1b16]/10 border-y border-[#1f1b16]/15 text-[16px]">
            {ABOUT_FACTS.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[84px_1fr] gap-3 py-2.5">
                <dt className="text-[#a8432a]">{k}</dt>
                <dd className="min-w-0">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-14">
        {GROUPS.map((g, i) => (
          <section
            key={g.id}
            id={`room-${g.id}`}
            aria-labelledby={`room-${g.id}-title`}
            className="grid scroll-mt-28 gap-6 border-t border-[#1f1b16]/15 py-10 md:grid-cols-2 md:gap-10"
          >
            <div className={`relative aspect-[4/3] min-w-0 overflow-hidden rounded-[4px] ${i % 2 ? "md:order-2" : ""}`}>
              <Image src={`${IMG}/${g.img}.jpg`} alt={g.alt} fill sizes="(min-width:768px) 520px, 100vw" className="object-cover" style={{ objectPosition: g.pos }} />
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-[#a8432a]">{g.seating}</p>
              <h2 id={`room-${g.id}-title`} className="mt-1 text-[28px] font-bold tracking-[-0.02em]">
                {g.name}
              </h2>
              <p className="mt-3 text-[16px] text-[#4a4036]">{g.desc}</p>
              <dl className="mt-5 divide-y divide-[#1f1b16]/10 border-y border-[#1f1b16]/10 text-[15px]">
                {[
                  ["좌석", `${seatsOf(g.id)}석`],
                  ["인원", peopleOf(g.id)],
                  ["이용", g.reservable ? "예약 2시간, 빈자리는 예약 없이 이용" : "예약 없이 오신 순서대로"],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[64px_1fr] gap-3 py-2.5">
                    <dt className="text-[#6b5a48]">{k}</dt>
                    <dd className="min-w-0">{v}</dd>
                  </div>
                ))}
              </dl>
              {g.reservable && <BookingLink label={`${g.name} 예약`} className="mt-5" />}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ---------- 하위 화면: 메뉴 ---------- */

type Cat = "all" | Kind;

const ORIGIN: [string, string][] = [
  ["쌀 (가래떡, 인절미, 누룽지)", "국내산"],
  ["팥 (빙수, 단팥죽)", "국내산"],
  ["대추, 생강", "국내산"],
  ["유자", "국내산 (고흥)"],
  ["우유", "국내산"],
];

function MenuPage() {
  const [cat, setCat] = useState<Cat>("all");
  const kinds = cat === "all" ? (Object.keys(KIND_LABEL) as Kind[]) : [cat];
  const cats: { v: Cat; label: string }[] = [{ v: "all", label: "전체" }, ...(Object.keys(KIND_LABEL) as Kind[]).map((k) => ({ v: k, label: KIND_LABEL[k] }))];

  return (
    <div className="space-y-16">
      <section aria-labelledby="best-title">
        <SubTitle id="best-title">대표 메뉴</SubTitle>
        <div className="mt-6">
          <BestMenu />
        </div>
      </section>

      <section aria-labelledby="board-title">
        <SubTitle id="board-title" aside="계절 메뉴: 홍시 빙수, 단호박 식혜">
          메뉴판
        </SubTitle>
        <div role="group" aria-label="메뉴 분류" className="mt-5 flex flex-wrap gap-2">
          {cats.map((c) => {
            const on = c.v === cat;
            return (
              <button
                key={c.v}
                type="button"
                onClick={() => setCat(c.v)}
                aria-pressed={on}
                className={`h-11 rounded-[4px] border px-4 text-[15px] font-semibold transition-colors ${on ? "border-[#1f1b16] bg-[#1f1b16] text-[#f3ede2]" : "border-[#1f1b16]/20 hover:border-[#1f1b16]"}`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        <div key={cat} className="soft-in mt-6">
          <MenuBoard kinds={kinds} />
        </div>
        <p className="mt-4 text-[14px] text-[#6b5a48]">가격은 부가세 포함입니다.</p>
      </section>

      <section aria-labelledby="origin-title">
        <SubTitle id="origin-title">원산지 표시</SubTitle>
        <table className="mt-2 w-full max-w-[640px] border-collapse text-left text-[15px]">
          <caption className="sr-only">재료별 원산지</caption>
          <thead>
            <tr className="border-b border-[#1f1b16]/15 text-[#6b5a48]">
              <th scope="col" className="py-2.5 font-semibold">
                품목
              </th>
              <th scope="col" className="py-2.5 text-right font-semibold">
                원산지
              </th>
            </tr>
          </thead>
          <tbody>
            {ORIGIN.map(([k, v]) => (
              <tr key={k} className="border-b border-[#1f1b16]/10">
                <th scope="row" className="py-2.5 font-normal">
                  {k}
                </th>
                <td className="py-2.5 text-right">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

/* ---------- 하위 화면: 좌석 예약 ---------- */

function ReservePage() {
  const rows: [string, string][] = [
    ["예약 공간", GROUPS.filter((g) => g.reservable).map((g) => g.name).join(", ")],
    ["예약 없이 이용", GROUPS.filter((g) => !g.reservable).map((g) => `${g.name} (오신 순서대로)`).join(", ")],
    ["인원", GROUPS.filter((g) => g.reservable).map((g) => `${g.name} ${peopleOf(g.id)}`).join(" / ")],
    ["이용 시간", "2시간"],
    ["예약 시간", `${SLOTS.join(", ")} 시작 (화 ~ 일)`],
    ["예약 방법", "네이버 예약 또는 전화"],
    ["자동 취소", "예약 시간 15분 경과 시"],
    ["별채 이용", "대관료 없이 1인 1메뉴 주문"],
    ["변경, 취소", `전화 ${TEL}`],
  ];
  return (
    <div className="space-y-16">
      <section aria-labelledby="reserve-space-title">
        <SubTitle id="reserve-space-title">예약 공간</SubTitle>
        <div className="mt-6">
          <SpaceCards />
        </div>
      </section>
      <section aria-labelledby="reserve-guide-title">
        <SubTitle id="reserve-guide-title">예약 안내</SubTitle>
        <dl className="divide-y divide-[#1f1b16]/10 border-b border-[#1f1b16]/15 text-[16px]">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[96px_1fr] gap-3 py-3 sm:grid-cols-[160px_1fr]">
              <dt className="text-[#6b5a48]">{k}</dt>
              <dd className="min-w-0">{v}</dd>
            </div>
          ))}
        </dl>
        <BookingLink label="네이버 예약으로 예약하기" className="mt-6" />
      </section>
    </div>
  );
}

/* ---------- 하위 화면: 오시는 길 ---------- */

function LocationPage() {
  return (
    <div className="space-y-16">
      <Location bare />
      <section aria-labelledby="transit-title">
        <SubTitle id="transit-title">대중교통</SubTitle>
        <dl className="divide-y divide-[#1f1b16]/10 border-b border-[#1f1b16]/15 text-[16px]">
          {[
            ["지하철", "ㅎㅅ역 2번 출구 도보 6분"],
            ["버스", "ㅎㅅ역 정류장 하차 후 도보 6분 (간선 000, 지선 0000)"],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[96px_1fr] gap-3 py-3 sm:grid-cols-[160px_1fr]">
              <dt className="text-[#6b5a48]">{k}</dt>
              <dd className="min-w-0">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

/* ---------- 하위 화면: 공지사항 ---------- */

// ago: 작성일이 오늘에서 며칠 전인지. body 함수는 날짜가 들어간 본문(작성일 기준으로 계산)
const NOTICES: { no: number; title: string; ago: number; body: string[] | ((t: Date) => string[]) }[] = [
  {
    no: 7,
    title: "계절 메뉴 출시 (홍시 빙수, 단호박 식혜)",
    ago: 6,
    body: ["계절 메뉴를 한정 판매합니다.", "홍시 빙수 14,000원", "단호박 식혜 6,500원", "재료 소진 시 조기 마감될 수 있습니다."],
  },
  {
    no: 6,
    title: "정기 휴무 안내",
    ago: 9,
    body: ["매주 월요일은 정기 휴무입니다.", "공휴일은 정상 영업합니다."],
  },
  {
    no: 5,
    title: "명절 연휴 영업 안내",
    ago: 22,
    body: (t) => [`${fmtKo(daysAgo(t, -10))} 명절 당일은 휴무입니다.`, `${fmtKo(daysAgo(t, -9))}, ${fmtKo(daysAgo(t, -11))}은 정상 영업합니다.`],
  },
  {
    no: 4,
    title: "우천 시 툇마루 이용 안내",
    ago: 48,
    body: ["비가 오는 날에는 툇마루 예약 자리를 처마 안쪽으로 옮겨 드립니다.", "예약 시간과 인원은 그대로 유지됩니다."],
  },
  {
    no: 3,
    title: "주차 할인권 안내",
    ago: 89,
    body: ["매장 주차 공간이 없습니다.", "골목 입구 ㅁㄹ공영주차장 이용 시 2시간 할인권을 드립니다.", "계산하실 때 말씀해 주세요."],
  },
  {
    no: 2,
    title: "좌식 방 예약 안내",
    ago: 127,
    body: ["건넌방과 사랑방은 방 단위로 예약받습니다.", "이용 시간은 2시간입니다.", "예약 시간 15분 경과 시 자동 취소될 수 있습니다."],
  },
  {
    no: 1,
    title: "별채 단체 이용 안내",
    ago: 145,
    body: ["별채는 6명부터 10명까지 이용할 수 있습니다.", "대관료는 없으며 1인 1메뉴 주문 부탁드립니다."],
  },
];

function NoticePage() {
  const today = useDemoToday();
  const [open, setOpen] = useState<number | null>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const idx = NOTICES.findIndex((n) => n.no === open);
  const item = idx >= 0 ? NOTICES[idx] : null;

  useEffect(() => {
    if (open !== null) headRef.current?.focus();
  }, [open]);

  if (item) {
    const prev = NOTICES[idx + 1];
    const next = NOTICES[idx - 1];
    return (
      <article aria-labelledby="notice-title">
        <div className="border-b border-t-2 border-[#1f1b16]/15 border-t-[#1f1b16] py-4">
          <h2 id="notice-title" ref={headRef} tabIndex={-1} className="text-[22px] font-bold leading-[1.4] tracking-[-0.02em] outline-none sm:text-[24px]">
            {item.title}
          </h2>
          <p className="mt-1 text-[14px] tabular-nums text-[#6b5a48]">작성일 {fmtDot(daysAgo(today, item.ago))}</p>
        </div>
        <div className="space-y-1 py-8 text-[16px] leading-[1.8]">
          {(typeof item.body === "function" ? item.body(daysAgo(today, item.ago)) : item.body).map((b) => (
            <p key={b}>{b}</p>
          ))}
        </div>
        <dl className="divide-y divide-[#1f1b16]/10 border-y border-[#1f1b16]/15 text-[15px]">
          {(
            [
              ["이전글", prev],
              ["다음글", next],
            ] as const
          ).map(([label, n]) => (
            <div key={label} className="grid grid-cols-[64px_1fr] items-center gap-3">
              <dt className="py-3 text-[#6b5a48]">{label}</dt>
              <dd className="min-w-0">
                {n ? (
                  <button type="button" onClick={() => setOpen(n.no)} className="block w-full truncate py-3 text-left hover:underline">
                    {n.title}
                  </button>
                ) : (
                  <span className="block py-3 text-[#6b5a48]">없음</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={() => setOpen(null)}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-[4px] border border-[#1f1b16]/25 px-5 text-[15px] font-semibold transition-colors hover:border-[#1f1b16]"
        >
          <List size={16} aria-hidden />
          목록
        </button>
      </article>
    );
  }

  return (
    <section aria-label="공지사항 목록">
      <p className="text-[15px] text-[#6b5a48]">
        전체 <b className="font-semibold text-[#1f1b16]">{NOTICES.length}</b>건
      </p>
      <div className="mt-3 hidden grid-cols-[64px_1fr_120px] border-y-2 border-b-[#1f1b16]/15 border-t-[#1f1b16] py-3 text-center text-[15px] font-semibold sm:grid" aria-hidden>
        <span>번호</span>
        <span>제목</span>
        <span>작성일</span>
      </div>
      <ul className="border-t-2 border-[#1f1b16] sm:border-t-0">
        {NOTICES.map((n) => (
          <li key={n.no} className="border-b border-[#1f1b16]/10">
            <button
              type="button"
              onClick={() => setOpen(n.no)}
              className="grid w-full gap-1 px-1 py-4 text-left transition-colors hover:bg-[#1f1b16]/[0.03] sm:grid-cols-[64px_1fr_120px] sm:items-center sm:gap-0 sm:px-0"
            >
              <span className="hidden text-center text-[15px] tabular-nums text-[#6b5a48] sm:block">{n.no}</span>
              <span className="min-w-0 text-[16px] font-medium">{n.title}</span>
              <span className="text-[14px] tabular-nums text-[#6b5a48] sm:text-center">{fmtDot(daysAgo(today, n.ago))}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#1f1b16] px-4 pb-28 pt-10 text-[14px] leading-[1.8] text-[#b9ad9c] sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[#efe7da]">
            <span className="flex items-baseline gap-1.5">
            <span className="text-[18px] font-bold tracking-[-0.02em]">한옥 찻집</span>
            </span>
          </p>
          <DemoMakerInfo className="mt-2" />
        </div>
      </div>
    </footer>
  );
}
