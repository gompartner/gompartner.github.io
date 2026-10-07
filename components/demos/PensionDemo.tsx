"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  AirVent,
  Bath,
  Bus,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CookingPot,
  Eye,
  Flame,
  Menu,
  Minus,
  Plus,
  Refrigerator,
  ShowerHead,
  Trees,
  Tv,
  Users,
  Waves,
  Wifi,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 바다 펜션 홈페이지 데모: 가상의 곰파트너 바다 펜션(객실 6개).
   상호, 대표자, 주소, 전화번호, 계좌, 신고번호, 객실 이름과 요금, 예약 현황은 모두 가상이다.

   뼈대는 실제 펜션 홈페이지 템플릿(2단 드롭다운 메뉴 + 사진 슬라이드 + 하위 페이지)을 따른다.
   메뉴: 펜션소개 / 객실안내(객실 6개) / 예약안내(입실·퇴실, 유의사항, 환불규정, 입금 안내, 실시간예약) / 주변관광지 / 오시는 길.
   하위 페이지는 주소를 바꾸지 않고 컴포넌트 상태로 화면을 바꾼다.

   메인 화면: 사진 슬라이드 > 객실안내(위에서 본 객실 배치도 + 객실 카드) > 실시간 예약(객실 x 날짜 예약현황표)
   > 예약안내 바로가기 > 주변관광지.
   예약현황표는 행이 객실, 열이 14일이다. 칸에는 1박 요금(만 원)이나 "완료"가 나온다.
   칸을 누르면 그 객실의 입실일이 되고, 같은 줄의 뒤 칸을 누르면 그날 밤까지 박수가 늘어난다. 박수는 목록으로도 고른다.
   요금은 주중, 주말(금·토), 공휴일 전날, 성수기(7/15~8/20)로 나뉜다. 예약 현황은 날짜 숫자로 만든 가짜 값이라
   언제 열어도 같고, 서버 렌더와 어긋나지 않게 브라우저에서만 계산한다.

   사진 출처(public/images/demo-pension):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, room */

const IMG = "/images/demo-pension";
const PENSION = "곰파트너 바다 펜션";
const TEL = "033-000-0000";
const ADDRESS = "강원특별자치도 □□군 □□면 해안길 00";
const BANK = "△△은행 000-000000-00-000";
const OWNER = "김ㅈ우";

const C = {
  navy: "#12324a",
  navyDeep: "#0b2233",
  sand: "#efe6d6",
  sandDeep: "#dccdb2",
  sandSoft: "#f8f4ec",
  coral: "#e07a5f",
  coralDeep: "#b4513a",
  coralSoft: "#fbe4dc",
  white: "#ffffff",
  ink: "#14222e",
  muted: "#55636e",
  line: "#e4ddd0",
  sea: "#9fc3d1",
  seaSoft: "#dcebf0",
  lawn: "#dde7cf",
  tree: "#b6cd9f",
  red: "#c0392b",
  sat: "#1f5fa8",
};

const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------- 시간 ---------- */

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];
const DAY_MS = 86_400_000;
const MAX_NIGHTS = 7;
const BOARD_DAYS = 14;
const BOARD_PAGES = 8;

const subscribeMinute = (cb: () => void) => {
  const id = window.setInterval(cb, 30_000);
  return () => window.clearInterval(id);
};

/** 분 단위 현재 시각. 서버 렌더에서는 -1을 돌려 날짜에 따른 화면 차이를 막는다. */
function useNowMinute() {
  return useSyncExternalStore(subscribeMinute, () => Math.floor(Date.now() / 60_000), () => -1);
}

/** 날짜를 1970-01-01부터 센 날 수로 다룬다. 요일과 월 계산은 UTC로 해서 시간대 영향을 받지 않는다. */
const toDn = (y: number, m: number, d: number) => Date.UTC(y, m, d) / DAY_MS;

function parts(dn: number) {
  const t = new Date(dn * DAY_MS);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth(), d: t.getUTCDate(), w: t.getUTCDay() };
}

function todayDn(minute: number) {
  if (minute < 0) return -1;
  const t = new Date(minute * 60_000);
  return toDn(t.getFullYear(), t.getMonth(), t.getDate());
}

const dateLabel = (dn: number) => {
  const p = parts(dn);
  return `${p.m + 1}월 ${p.d}일 (${DAY_NAMES[p.w]})`;
};

const shortDate = (dn: number) => {
  const p = parts(dn);
  return `${p.m + 1}.${p.d}`;
};

const won = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원`;
const man = (n: number) => `${Math.round(n / 1000) / 10}만`;

// 날짜가 고정된 공휴일만 둔다(음력 공휴일은 해마다 바뀌어 데모에서는 뺀다)
const HOLIDAYS: Record<string, string> = {
  "1-1": "신정",
  "3-1": "삼일절",
  "5-5": "어린이날",
  "6-6": "현충일",
  "8-15": "광복절",
  "10-3": "개천절",
  "10-9": "한글날",
  "12-25": "성탄절",
};

const holidayOf = (dn: number) => {
  const p = parts(dn);
  return HOLIDAYS[`${p.m + 1}-${p.d}`];
};

type NightType = "weekday" | "weekend" | "eve" | "peak" | "peakWeekend";

const TYPE_LABEL: Record<NightType, string> = {
  weekday: "주중",
  weekend: "주말",
  eve: "공휴일 전날",
  peak: "성수기 주중",
  peakWeekend: "성수기 주말",
};

const PRICE_COL: Record<NightType, number> = { weekday: 0, weekend: 1, eve: 1, peak: 2, peakWeekend: 3 };
const PRICE_HEAD = ["주중", "주말·공휴일 전날", "성수기 주중", "성수기 주말"];

/** dn 날짜에 자는 1박의 요금 구분. 금·토와 공휴일 전날은 주말 요금이다. */
function nightType(dn: number): NightType {
  const p = parts(dn);
  const md = (p.m + 1) * 100 + p.d;
  const peak = md >= 715 && md <= 820;
  const weekendish = p.w === 5 || p.w === 6;
  const eve = !!holidayOf(dn + 1);
  if (peak) return weekendish || eve ? "peakWeekend" : "peak";
  if (weekendish) return "weekend";
  if (eve) return "eve";
  return "weekday";
}

/* ---------- 객실 ---------- */

type Room = {
  id: string;
  name: string;
  side: "sea" | "garden";
  base: number;
  max: number;
  size: number;
  structure: string;
  view: boolean;
  bbq: boolean;
  spa: boolean;
  /** 주중, 주말·공휴일 전날, 성수기 주중, 성수기 주말 */
  prices: [number, number, number, number];
  photo: string;
};

const ROOMS: Room[] = [
  { id: "yunseul", name: "윤슬", side: "sea", base: 2, max: 3, size: 10, structure: "침대룸(퀸1) · 화장실1", view: true, bbq: true, spa: true, prices: [150_000, 200_000, 230_000, 280_000], photo: "30% center" },
  { id: "mulgyeol", name: "물결", side: "sea", base: 2, max: 4, size: 12, structure: "침대룸(퀸1) + 온돌 · 화장실1", view: true, bbq: true, spa: false, prices: [140_000, 190_000, 220_000, 270_000], photo: "55% center" },
  { id: "noeul", name: "노을", side: "sea", base: 4, max: 6, size: 18, structure: "복층 침대룸(퀸1) + 거실 온돌 · 화장실1", view: true, bbq: true, spa: true, prices: [240_000, 300_000, 340_000, 400_000], photo: "75% center" },
  { id: "solsup", name: "솔숲", side: "garden", base: 2, max: 3, size: 8, structure: "침대룸(더블1) · 화장실1", view: false, bbq: false, spa: false, prices: [90_000, 130_000, 160_000, 200_000], photo: "20% center" },
  { id: "deulkkot", name: "들꽃", side: "garden", base: 2, max: 4, size: 11, structure: "침대룸(퀸1) + 온돌 · 화장실1", view: false, bbq: false, spa: true, prices: [110_000, 150_000, 190_000, 230_000], photo: "45% center" },
  { id: "madang", name: "마당", side: "garden", base: 4, max: 8, size: 20, structure: "침대룸2(퀸1, 더블1) + 거실 · 화장실2", view: false, bbq: true, spa: false, prices: [200_000, 260_000, 300_000, 360_000], photo: "65% center" },
];

const ROOM_INDEX: Record<string, number> = Object.fromEntries(ROOMS.map((r, i) => [r.id, i]));

const featureLine = (r: Room) => [r.view ? "바다 전망" : "정원 전망", r.spa ? "스파 욕조" : null, r.bbq ? "개별 바비큐" : null].filter(Boolean).join(" · ");
const sqm = (size: number) => Math.round(size * 3.3);

/* ---------- 가짜 예약 현황 ---------- */

/** 날짜 숫자로 만든 0~99 사이의 값. 같은 날짜면 언제나 같다. */
function hash(n: number) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) % 100;
}

const BOOK_RATE: Record<NightType, number> = { weekday: 20, weekend: 58, eve: 52, peak: 60, peakWeekend: 85 };

function isBooked(dn: number, roomIdx: number) {
  const type = nightType(dn);
  const full = hash(dn * 31 + 7) < (type === "weekday" ? 4 : 36);
  if (full) return true;
  return hash(dn * 8 + roomIdx) < BOOK_RATE[type];
}

const remainingOn = (dn: number) => ROOMS.reduce((n, _, i) => n + (isBooked(dn, i) ? 0 : 1), 0);

function roomFree(roomIdx: number, from: number, to: number) {
  for (let dn = from; dn < to; dn++) if (isBooked(dn, roomIdx)) return false;
  return true;
}

/* ---------- 요금 ---------- */

const EXTRA_PERSON = 20_000;
const GRILL = 30_000;
const BREAKFAST = 10_000;

function quote(room: Room, checkIn: number, nights: number, people: number, grill = false, breakfast = false) {
  const rows = Array.from({ length: nights }, (_, i) => {
    const dn = checkIn + i;
    const type = nightType(dn);
    return { dn, type, price: room.prices[PRICE_COL[type]] };
  });
  const headcount = Math.min(Math.max(people, 1), room.max);
  const extraPeople = Math.max(0, headcount - room.base);
  const roomSum = rows.reduce((s, n) => s + n.price, 0);
  const extraSum = extraPeople * EXTRA_PERSON * nights;
  const grillSum = grill ? GRILL : 0;
  const breakfastSum = breakfast ? BREAKFAST * headcount * nights : 0;
  return { rows, headcount, extraPeople, extraSum, grillSum, breakfastSum, total: roomSum + extraSum + grillSum + breakfastSum };
}

/* ---------- 이름, 전화 가리기 ---------- */

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘을 김ㅎ늘로, 두 글자는 김*로 */
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

/* ---------- 메뉴 구조 ---------- */

type Page = "home" | "about" | "room" | "reserve" | "guide" | "around" | "location";
type GuideTab = "time" | "notes" | "refund" | "deposit";
type GoOpt = { room?: string; tab?: GuideTab; anchor?: string };
type Go = (page: Page, opt?: GoOpt) => void;

const GUIDE_TABS: { id: GuideTab; label: string }[] = [
  { id: "time", label: "입실·퇴실" },
  { id: "notes", label: "유의사항" },
  { id: "refund", label: "환불규정" },
  { id: "deposit", label: "입금 안내" },
];

type SubItem = { label: string; page: Page } & GoOpt;
type GnbItem = { label: string; page: Page; subs: SubItem[] };

const GNB: GnbItem[] = [
  {
    label: "펜션소개",
    page: "about",
    subs: [
      { label: "인사말", page: "about" },
      { label: "부대시설", page: "about", anchor: "facilities" },
    ],
  },
  { label: "객실안내", page: "room", subs: ROOMS.map((r) => ({ label: r.name, page: "room" as const, room: r.id })) },
  {
    label: "예약안내",
    page: "guide",
    subs: [...GUIDE_TABS.map((t) => ({ label: t.label, page: "guide" as const, tab: t.id })), { label: "실시간예약", page: "reserve" }],
  },
  { label: "주변관광지", page: "around", subs: [] },
  { label: "오시는 길", page: "location", subs: [] },
];

/* ---------- 페이지 ---------- */

export function PensionDemo() {
  const minute = useNowMinute();
  const today = todayDn(minute);
  const [page, setPage] = useState<Page>("home");
  const [guideTab, setGuideTab] = useState<GuideTab>("time");
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [checkIn, setCheckIn] = useState<number | null>(null);
  const [nights, setNights] = useState(1);
  const [people, setPeople] = useState(2);
  const [nav, setNav] = useState<{ n: number; anchor?: string }>({ n: 0 });

  const go: Go = useCallback((p, opt = {}) => {
    setPage(p);
    if (opt.room) setRoomId(opt.room);
    if (opt.tab) setGuideTab(opt.tab);
    setNav((v) => ({ n: v.n + 1, anchor: opt.anchor }));
  }, []);

  // 화면을 바꾸면 맨 위(또는 지정한 구간)로 옮기고 제목에 초점을 둔다
  useEffect(() => {
    if (nav.n === 0) return;
    const target = nav.anchor ? document.getElementById(nav.anchor) : null;
    if (target) target.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
    document.getElementById("pension-title")?.focus({ preventScroll: true });
  }, [nav]);

  const pickCell = (id: string, dn: number) => {
    const idx = ROOM_INDEX[id];
    if (id === roomId && checkIn !== null && dn > checkIn && dn - checkIn < MAX_NIGHTS && roomFree(idx, checkIn, dn + 1)) {
      setNights(dn - checkIn + 1);
      return;
    }
    setRoomId(id);
    setCheckIn(dn);
    setNights(1);
  };

  const clear = useCallback(() => setCheckIn(null), []);
  const sel: Selection = { today, roomId, checkIn, nights, people, setNights, setPeople, clear };

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.white, color: C.ink }}>
      <Header page={page} go={go} />
      <main>
        {page === "home" && (
          <>
            <HeroSlider go={go} />
            <RoomsSection roomId={roomId} onRoom={setRoomId} sel={sel} go={go} />
            <section aria-labelledby="booking-title" id="booking" className="scroll-mt-20 px-4 py-14 md:px-6 md:py-20" style={{ background: C.sandSoft }}>
              <div className="mx-auto max-w-[1200px]">
                <SectionTitle id="booking-title" aside={<TodayCount today={today} />}>
                  실시간 예약
                </SectionTitle>
                <StatusBoard today={today} roomId={roomId} checkIn={checkIn} nights={nights} onPick={pickCell} />
                <SummaryBar sel={sel} go={go} />
              </div>
            </section>
            <GuideShortcuts go={go} />
            <PlacesSection go={go} />
          </>
        )}
        {page === "about" && <AboutPage go={go} />}
        {page === "room" && <RoomPage roomId={roomId} go={go} />}
        {page === "reserve" && <ReservePage sel={sel} onPick={pickCell} go={go} />}
        {page === "guide" && <GuidePage tab={guideTab} setTab={setGuideTab} go={go} today={today} checkIn={checkIn} />}
        {page === "around" && <AroundPage go={go} />}
        {page === "location" && <LocationPage go={go} />}
      </main>
      <Footer go={go} />
    </div>
  );
}

type Selection = {
  today: number;
  roomId: string;
  checkIn: number | null;
  nights: number;
  people: number;
  setNights: (n: number) => void;
  setPeople: (n: number) => void;
  clear: () => void;
};

/* ---------- 로고, 머리글 ---------- */

function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.svg" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-[18px] font-bold tracking-[-0.02em] md:text-[19px]">곰파트너</span>
        <span className="text-[11px] font-semibold opacity-80 md:text-[12px]">바다 펜션</span>
      </span>
    </span>
  );
}

function blurActive() {
  const el = document.activeElement;
  if (el instanceof HTMLElement) el.blur();
}

function Header({ page, go }: { page: Page; go: Go }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const goFrom = (p: Page, opt?: GoOpt) => {
    setOpen(false);
    blurActive();
    go(p, opt);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_#e4ddd0]">
      <div className="hidden px-6 md:block" style={{ background: C.navyDeep, color: "#c9d6df" }}>
        <div className="mx-auto flex h-9 max-w-[1200px] items-center justify-between text-[13px]">
          <span>강원 □□군 □□ 해수욕장 앞 · 농어촌민박</span>
          <span>
            예약문의{" "}
            <a href={`tel:${TEL}`} className="font-semibold text-white">
              {TEL}
            </a>
          </span>
        </div>
      </div>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-2 px-4 md:px-6">
        <button type="button" onClick={() => goFrom("home")} aria-label={`${PENSION} 메인`} style={{ color: C.navy }}>
          <Logo />
        </button>
        <nav aria-label="주 메뉴" className="hidden h-full lg:block" onKeyDown={(e) => e.key === "Escape" && blurActive()}>
          <ul className="flex h-full items-stretch">
            {GNB.map((g) => {
              const active = page === g.page || (g.page === "guide" && page === "reserve");
              return (
                <li key={g.label} className="group relative flex">
                  <button
                    type="button"
                    onClick={() => goFrom(g.page)}
                    aria-current={active ? "page" : undefined}
                    className="flex items-center gap-1 px-5 text-[16px] font-semibold"
                    style={{ color: active ? C.coralDeep : C.ink, boxShadow: active ? `inset 0 -3px 0 ${C.coral}` : undefined }}
                  >
                    {g.label}
                    {g.subs.length > 0 && <ChevronDown size={15} aria-hidden className="opacity-60" />}
                  </button>
                  {g.subs.length > 0 && (
                    <ul className="invisible absolute left-1/2 top-full z-10 min-w-[150px] -translate-x-1/2 border-t-2 bg-white py-2 opacity-0 shadow-[0_10px_24px_rgba(18,50,74,0.14)] transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 motion-reduce:transition-none" style={{ borderColor: C.coral }}>
                      {g.subs.map((s) => (
                        <li key={s.label}>
                          <button
                            type="button"
                            onClick={() => goFrom(s.page, s)}
                            className="block w-full whitespace-nowrap px-5 py-2 text-center text-[15px] hover:bg-[#f8f4ec] focus-visible:bg-[#f8f4ec]"
                            style={{ color: C.ink }}
                          >
                            {s.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => goFrom("reserve")}
            aria-current={page === "reserve" ? "page" : undefined}
            className="inline-flex h-11 items-center gap-2 rounded-[6px] px-4 text-[15px] font-bold"
            style={{ background: C.coral, color: C.navyDeep }}
          >
            실시간예약
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] lg:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            aria-controls="pension-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="pension-menu"
            aria-label="주 메뉴"
            className="max-h-[calc(100vh-64px)] overflow-y-auto border-t lg:hidden"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <ul className="px-4 pb-6 pt-1">
              {GNB.map((g) => (
                <li key={g.label} className="border-b py-2" style={{ borderColor: C.line }}>
                  <button type="button" onClick={() => goFrom(g.page)} className="flex h-11 w-full items-center text-[17px] font-bold" style={{ color: C.navy }}>
                    {g.label}
                  </button>
                  {g.subs.length > 0 && (
                    <ul className="grid grid-cols-3 gap-x-2 pb-1">
                      {g.subs.map((s) => (
                        <li key={s.label}>
                          <button type="button" onClick={() => goFrom(s.page, s)} className="flex h-10 w-full items-center text-left text-[15px]" style={{ color: C.muted }}>
                            {s.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              <li>
                <a href={`tel:${TEL}`} className="flex h-12 items-center text-[16px] font-semibold" style={{ color: C.coralDeep }}>
                  예약문의 {TEL}
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- 메인: 사진 슬라이드 ---------- */

const SLIDES = [
  { src: "hero.jpg", alt: "해 질 무렵 바다 앞에 불이 켜진 2층 펜션 건물", pos: "center 40%" },
  { src: "room.jpg", alt: "큰 창 너머로 바다가 보이는 객실 침실", pos: "center 50%" },
];

function HeroSlider({ go }: { go: Go }) {
  const reduce = useReducedMotionSafe();
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const move = (d: number) => setI((v) => (v + d + SLIDES.length) % SLIDES.length);

  return (
    <section aria-roledescription="carousel" aria-label="펜션 사진" className="relative">
      <div className="relative h-[64vh] max-h-[680px] min-h-[440px] w-full overflow-hidden" style={{ background: C.navyDeep }}>
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.src}
            className="absolute inset-0"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Image src={`${IMG}/${slide.src}`} alt={slide.alt} fill priority={i === 0} sizes="100vw" className="object-cover" style={{ objectPosition: slide.pos }} />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,34,51,0.78) 0%, rgba(11,34,51,0.25) 50%, rgba(11,34,51,0.1) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-20 text-center text-white md:pb-24">
          <h1 id="pension-title" tabIndex={-1} className="text-[34px] font-bold leading-[1.25] tracking-[-0.03em] outline-none md:text-[54px]">
            {PENSION}
          </h1>
          <p className="mt-2 text-[16px] md:text-[19px]" style={{ color: "#e8eef2" }}>
            □□ 해수욕장 도보 3분 · 바다 전망 객실 3실
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button type="button" onClick={() => go("reserve")} className="inline-flex h-12 items-center rounded-[6px] px-6 font-bold" style={{ background: C.coral, color: C.navyDeep }}>
              실시간예약
            </button>
            <a href="#rooms" className="inline-flex h-12 items-center rounded-[6px] border px-6 font-semibold text-white" style={{ borderColor: "rgba(255,255,255,0.7)" }}>
              객실안내
            </a>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-[6px] px-1 text-white" style={{ background: "rgba(11,34,51,0.55)" }}>
          <button type="button" onClick={() => move(-1)} aria-label="이전 사진" className="inline-flex h-10 w-10 items-center justify-center">
            <ChevronLeft size={20} aria-hidden />
          </button>
          <span className="text-[14px] tabular-nums" aria-live="polite">
            {i + 1} / {SLIDES.length}
          </span>
          <button type="button" onClick={() => move(1)} aria-label="다음 사진" className="inline-flex h-10 w-10 items-center justify-center">
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ id, children, aside }: { id: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-b-2 pb-3" style={{ borderColor: C.navy }}>
      <h2 id={id} className="text-[26px] font-bold leading-[1.3] tracking-[-0.03em] md:text-[32px]" style={{ color: C.navy }}>
        {children}
      </h2>
      {aside && <div className="text-[15px]" style={{ color: C.muted }}>{aside}</div>}
    </div>
  );
}

function TodayCount({ today }: { today: number }) {
  if (today < 0) return <span>&nbsp;</span>;
  const sat = today + ((6 - parts(today).w + 7) % 7);
  const a = remainingOn(today);
  const b = remainingOn(sat);
  return (
    <span aria-live="polite">
      오늘 예약 가능 객실 <b style={{ color: C.coralDeep }}>{a}실</b>
      {sat !== today && (
        <>
          {" "}
          · 이번 주 토요일 <b style={{ color: C.coralDeep }}>{b}실</b>
        </>
      )}
    </span>
  );
}

/* ---------- 메인: 객실안내(배치도) ---------- */

const PLAN: Record<string, { x: number; y: number; w: number; h: number }> = {
  solsup: { x: 230, y: 56, w: 140, h: 100 },
  deulkkot: { x: 385, y: 56, w: 150, h: 100 },
  madang: { x: 550, y: 56, w: 150, h: 100 },
  yunseul: { x: 170, y: 306, w: 160, h: 90 },
  mulgyeol: { x: 345, y: 306, w: 160, h: 90 },
  noeul: { x: 520, y: 306, w: 180, h: 90 },
};

const WAVES = (y: number) => {
  let d = `M0 ${y}`;
  for (let x = 0; x < 720; x += 40) d += ` Q${x + 10} ${y - 5} ${x + 20} ${y} T${x + 40} ${y}`;
  return d;
};

function SitePlan({ roomId, onRoom, closed }: { roomId: string; onRoom: (id: string) => void; closed: Set<string> | null }) {
  return (
    <svg viewBox="0 0 720 500" className="h-auto w-full select-none" role="group" aria-label="펜션을 위에서 본 객실 배치도. 위쪽은 정원 쪽 객실, 아래쪽은 바다 쪽 객실입니다.">
      <rect width="720" height="500" fill={C.sandSoft} />
      <rect width="720" height="40" fill="#d8d2c6" />
      <path d="M0 20 H720" stroke="#fff" strokeWidth="2" strokeDasharray="14 12" />
      <text x="700" y="26" fontSize="14" fill={C.muted} textAnchor="end">
        □□ 해안길
      </text>
      <rect x="20" y="56" width="190" height="100" rx="10" fill="#e8e3d9" stroke={C.line} />
      {[50, 80, 110, 140, 170].map((x) => (
        <path key={x} d={`M${x} 56 V96`} stroke="#fff" strokeWidth="2" />
      ))}
      <rect x="32" y="112" width="24" height="24" rx="5" fill={C.navy} />
      <text x="44" y="129" fontSize="15" fill="#fff" textAnchor="middle" fontWeight={700}>
        P
      </text>
      <text x="66" y="130" fontSize="15" fill={C.ink} fontWeight={700}>
        주차장 6대
      </text>
      <rect x="20" y="172" width="680" height="118" rx="14" fill={C.lawn} />
      {[
        [250, 196, 16],
        [292, 268, 12],
        [470, 194, 14],
        [640, 200, 18],
        [600, 266, 12],
        [380, 270, 10],
      ].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={C.tree} />
      ))}
      {[300, 340, 380, 420, 460, 500, 540].map((x, i) => (
        <ellipse key={x} cx={x} cy={i % 2 ? 236 : 230} rx="11" ry="7" fill="#f1ece2" />
      ))}
      <text x="430" y="262" fontSize="15" fill="#4f6a43" textAnchor="middle" fontWeight={700}>
        정원
      </text>
      <rect x="36" y="186" width="176" height="90" rx="10" fill={C.sand} stroke={C.sandDeep} />
      {[78, 124, 170].map((x) => (
        <g key={x}>
          <circle cx={x} cy="216" r="13" fill={C.navy} />
          <path d={`M${x - 8} 212 H${x + 8} M${x - 8} 217 H${x + 8} M${x - 8} 222 H${x + 8}`} stroke={C.coral} strokeWidth="1.5" />
        </g>
      ))}
      <text x="124" y="260" fontSize="15" fill={C.ink} textAnchor="middle" fontWeight={700}>
        공용 바비큐장
      </text>
      <rect x="30" y="306" width="120" height="90" rx="10" fill="#e8e3d9" stroke={C.line} />
      {[316, 328, 340, 352, 364].map((y) => (
        <path key={y} d={`M56 ${y} H124`} stroke={C.sandDeep} strokeWidth="5" strokeLinecap="round" />
      ))}
      <text x="90" y="388" fontSize="14" fill={C.ink} textAnchor="middle" fontWeight={700}>
        해변 계단
      </text>
      <path d="M90 396 V412" stroke={C.sandDeep} strokeWidth="4" strokeDasharray="4 4" />
      <rect y="412" width="720" height="34" fill={C.sand} />
      <text x="430" y="434" fontSize="14" fill={C.muted} textAnchor="middle">
        □□ 해수욕장 모래사장
      </text>
      <rect y="446" width="720" height="54" fill={C.sea} />
      <path d={WAVES(462)} fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" />
      <path d={WAVES(482)} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" />
      <text x="700" y="476" fontSize="15" fill={C.navy} textAnchor="end" fontWeight={700}>
        바다
      </text>

      {ROOMS.map((r) => {
        const b = PLAN[r.id];
        const on = roomId === r.id;
        const shut = closed?.has(r.id) ?? false;
        const fill = on ? C.coral : shut ? "#e6e1d8" : C.white;
        return (
          <g
            key={r.id}
            role="button"
            tabIndex={0}
            aria-pressed={on}
            aria-label={`${r.name}, ${r.side === "sea" ? "바다 쪽" : "정원 쪽"}, 기준 ${r.base}명 최대 ${r.max}명${shut ? ", 선택한 날짜 예약 완료" : ""}`}
            onClick={() => onRoom(r.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onRoom(r.id);
              }
            }}
            className="group cursor-pointer outline-none"
          >
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx="10"
              fill={fill}
              stroke={on ? C.coralDeep : C.navy}
              strokeWidth={on ? 3 : 1.5}
              className="transition-[fill] duration-200 group-hover:stroke-[#e07a5f] group-focus-visible:stroke-[#e07a5f] group-focus-visible:[stroke-width:5]"
            />
            {r.side === "sea" && <rect x={b.x + 14} y={b.y + b.h - 7} width={b.w - 28} height="4" rx="2" fill={on ? C.navy : C.sea} />}
            <text x={b.x + b.w / 2} y={b.y + b.h / 2 - 1} fontSize="24" fontWeight={700} textAnchor="middle" fill={on ? C.navyDeep : shut ? "#8c8578" : C.navy}>
              {r.name}
            </text>
            <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 22} fontSize="15" textAnchor="middle" fill={on ? C.navyDeep : C.muted}>
              {shut ? "예약 완료" : `${r.base}~${r.max}명 · ${r.size}평`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RoomCard({ room, closed, go }: { room: Room; closed: boolean; go: Go }) {
  const reduce = useReducedMotionSafe();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.article
        key={room.id}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: EASE }}
        className="overflow-hidden rounded-[10px] border bg-white"
        style={{ borderColor: C.line }}
        aria-live="polite"
      >
        <div className="relative aspect-[16/10]">
          <Image src={`${IMG}/room.jpg`} alt={`${room.name} 객실 침실`} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" style={{ objectPosition: room.photo }} />
        </div>
        <div className="p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[24px] font-bold tracking-[-0.02em]" style={{ color: C.navy }}>
              {room.name}
            </h3>
            <p className="text-[15px]" style={{ color: C.muted }}>
              주중 <b style={{ color: C.ink }}>{man(room.prices[0])} 원</b>
            </p>
          </div>
          <ul className="mt-2 space-y-0.5 text-[15px]">
            <li>
              {room.structure} · {room.size}평({sqm(room.size)}㎡)
            </li>
            <li>
              기준 {room.base}명 ~ 최대 {room.max}명
            </li>
            <li style={{ color: C.coralDeep }}>{featureLine(room)}</li>
          </ul>
          {closed && (
            <p className="mt-3 rounded-[6px] px-3 py-2 text-[14px] font-semibold" style={{ background: C.coralSoft, color: C.coralDeep }}>
              선택한 날짜에 예약 완료된 객실입니다.
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => go("room", { room: room.id })} className="h-11 rounded-[6px] border text-[15px] font-semibold" style={{ borderColor: C.navy, color: C.navy }}>
              자세히 보기
            </button>
            <a href="#booking" className="inline-flex h-11 items-center justify-center rounded-[6px] text-[15px] font-bold" style={{ background: C.navy, color: "#fff" }}>
              예약하기
            </a>
          </div>
        </div>
      </motion.article>
    </AnimatePresence>
  );
}

function closedSet(sel: Selection) {
  const { checkIn, nights } = sel;
  if (checkIn === null) return null;
  return new Set(ROOMS.filter((_, i) => !roomFree(i, checkIn, checkIn + nights)).map((r) => r.id));
}

function RoomsSection({ roomId, onRoom, sel, go }: { roomId: string; onRoom: (id: string) => void; sel: Selection; go: Go }) {
  const room = ROOMS[ROOM_INDEX[roomId]];
  const closed = closedSet(sel);

  return (
    <section aria-labelledby="rooms-title" id="rooms" className="scroll-mt-20 px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle id="rooms-title" aside="바다 전망 3실 · 정원 전망 3실">
          객실안내
        </SectionTitle>
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: C.line }}>
              <SitePlan roomId={roomId} onRoom={onRoom} closed={closed} />
            </div>
            <p className="mt-4 text-[15px] font-semibold" id="room-list-label">
              객실 목록
            </p>
            <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-labelledby="room-list-label">
              {ROOMS.map((r) => {
                const on = r.id === roomId;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => onRoom(r.id)}
                      className="h-11 w-full rounded-[6px] border text-[15px] font-semibold transition-colors"
                      style={on ? { background: C.navy, borderColor: C.navy, color: "#fff" } : { background: C.white, borderColor: C.line, color: C.ink }}
                    >
                      {r.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <RoomCard room={room} closed={closed?.has(room.id) ?? false} go={go} />
        </div>
      </div>
    </section>
  );
}

/* ---------- 예약현황표 ---------- */

function StatusBoard({ today, roomId, checkIn, nights, onPick }: { today: number; roomId: string; checkIn: number | null; nights: number; onPick: (id: string, dn: number) => void }) {
  const [pageNo, setPageNo] = useState(0);
  const from = today >= 0 ? today + pageNo * BOARD_DAYS : -1;
  const dates = from >= 0 ? Array.from({ length: BOARD_DAYS }, (_, i) => from + i) : [];

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPageNo((v) => Math.max(0, v - 1))}
            disabled={pageNo === 0}
            aria-label="이전 2주"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] border bg-white disabled:opacity-30"
            style={{ borderColor: C.line }}
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <p className="min-w-[140px] text-center text-[16px] font-bold tabular-nums" style={{ color: C.navy }} aria-live="polite">
            {dates.length ? `${parts(dates[0]).y}. ${shortDate(dates[0])} ~ ${shortDate(dates[dates.length - 1])}` : " "}
          </p>
          <button
            type="button"
            onClick={() => setPageNo((v) => Math.min(BOARD_PAGES - 1, v + 1))}
            disabled={pageNo === BOARD_PAGES - 1}
            aria-label="다음 2주"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] border bg-white disabled:opacity-30"
            style={{ borderColor: C.line }}
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]" style={{ color: C.muted }}>
          <li className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-[2px] border bg-white" style={{ borderColor: C.line }} aria-hidden />
            예약 가능(1박 요금)
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-[2px]" style={{ background: "#e6e1d8" }} aria-hidden />
            예약 완료
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded-[2px]" style={{ background: C.navy }} aria-hidden />
            선택
          </li>
        </ul>
      </div>

      <div className="mt-3 overflow-x-auto rounded-[10px] border bg-white" style={{ borderColor: C.line }} role="region" aria-label="객실별 예약현황표" tabIndex={0}>
        <table className="w-full min-w-[880px] border-collapse text-center text-[14px] tabular-nums">
          <caption className="sr-only">객실별 날짜별 예약현황. 칸의 숫자는 1박 요금(만 원)입니다.</caption>
          <thead>
            <tr style={{ background: C.sand }}>
              <th scope="col" className="sticky left-0 z-10 w-[76px] px-2 py-2 text-[14px] font-bold" style={{ background: C.sand }}>
                객실
              </th>
              {dates.length
                ? dates.map((dn) => {
                    const p = parts(dn);
                    const hol = holidayOf(dn);
                    const color = p.w === 0 || hol ? C.red : p.w === 6 ? C.sat : C.ink;
                    return (
                      <th key={dn} scope="col" className="px-0.5 py-1.5 font-semibold leading-[1.3]" style={{ color }}>
                        {shortDate(dn)}
                        <span className="block text-[12px] font-normal">{hol ? hol : DAY_NAMES[p.w]}</span>
                      </th>
                    );
                  })
                : Array.from({ length: BOARD_DAYS }, (_, i) => (
                    <th key={i} scope="col" className="py-1.5">
                      <span className="sr-only">날짜</span>&nbsp;
                    </th>
                  ))}
            </tr>
          </thead>
          <tbody>
            {ROOMS.map((r, ri) => (
              <tr key={r.id} className="border-t" style={{ borderColor: C.line }}>
                <th scope="row" className="sticky left-0 z-10 bg-white px-2 py-1 text-left font-bold leading-[1.25]" style={{ color: C.navy }}>
                  {r.name}
                  <span className="block text-[12px] font-normal" style={{ color: C.muted }}>
                    {r.base}~{r.max}명
                  </span>
                </th>
                {dates.length
                  ? dates.map((dn) => {
                      const booked = isBooked(dn, ri);
                      const on = r.id === roomId && checkIn !== null && dn >= checkIn && dn < checkIn + nights;
                      const first = on && dn === checkIn;
                      const p = parts(dn);
                      const price = r.prices[PRICE_COL[nightType(dn)]];
                      return (
                        <td key={dn} className="p-[3px]">
                          <button
                            type="button"
                            disabled={booked}
                            aria-pressed={on}
                            aria-label={`${r.name} ${p.m + 1}월 ${p.d}일 ${DAY_NAMES[p.w]}요일, ${booked ? "예약 완료" : `예약 가능, 1박 ${won(price)}`}${first ? ", 입실일" : ""}`}
                            onClick={() => onPick(r.id, dn)}
                            className="h-11 w-full rounded-[4px] border text-[13px] font-semibold transition-colors hover:border-[#12324a] disabled:cursor-not-allowed disabled:hover:border-transparent"
                            style={
                              on
                                ? { background: C.navy, borderColor: C.navy, color: "#fff" }
                                : booked
                                  ? { background: "#e6e1d8", borderColor: "transparent", color: "#857d70" }
                                  : { background: "#fff", borderColor: C.line, color: C.ink }
                            }
                          >
                            {booked ? "완료" : first ? "입실" : man(price)}
                          </button>
                        </td>
                      );
                    })
                  : Array.from({ length: BOARD_DAYS }, (_, i) => <td key={i} className="h-[50px]" />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
        (단위: 만 원, 1박 기준) 성수기 7월 15일 ~ 8월 20일 · 금·토요일과 공휴일 전날은 주말 요금
      </p>
    </div>
  );
}

/* ---------- 선택 내역 ---------- */

function NightsSelect({ sel, id }: { sel: Selection; id: string }) {
  const { checkIn, roomId, nights, setNights } = sel;
  if (checkIn === null) return null;
  const idx = ROOM_INDEX[roomId];
  return (
    <select
      id={id}
      value={nights}
      onChange={(e) => setNights(Number(e.target.value))}
      className="h-11 rounded-[6px] border bg-white px-3 text-[15px]"
      style={{ borderColor: C.line }}
    >
      {Array.from({ length: MAX_NIGHTS }, (_, i) => i + 1).map((n) => (
        <option key={n} value={n} disabled={!roomFree(idx, checkIn, checkIn + n)}>
          {n}박{roomFree(idx, checkIn, checkIn + n) ? "" : " (예약 불가)"}
        </option>
      ))}
    </select>
  );
}

function PeopleStepper({ sel, room }: { sel: Selection; room: Room }) {
  const n = Math.min(Math.max(sel.people, 1), room.max);
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => sel.setPeople(Math.max(1, n - 1))} disabled={n <= 1} aria-label="인원 한 명 줄이기" className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] border bg-white disabled:opacity-40" style={{ borderColor: C.line }}>
        <Minus size={18} aria-hidden />
      </button>
      <span className="w-12 text-center text-[17px] font-bold tabular-nums" aria-live="polite">
        {n}명
      </span>
      <button type="button" onClick={() => sel.setPeople(Math.min(room.max, n + 1))} disabled={n >= room.max} aria-label="인원 한 명 늘리기" className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] border bg-white disabled:opacity-40" style={{ borderColor: C.line }}>
        <Plus size={18} aria-hidden />
      </button>
    </div>
  );
}

function SummaryBar({ sel, go }: { sel: Selection; go: Go }) {
  const room = ROOMS[ROOM_INDEX[sel.roomId]];
  if (sel.checkIn === null) {
    return (
      <div className="mt-4 flex min-h-[72px] items-center rounded-[10px] border bg-white px-5 text-[15px]" style={{ borderColor: C.line, color: C.muted }} aria-live="polite">
        선택한 객실 없음
      </div>
    );
  }
  const q = quote(room, sel.checkIn, sel.nights, sel.people);
  return (
    <div className="mt-4 grid gap-4 rounded-[10px] border bg-white p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center md:px-5" style={{ borderColor: C.navy }} aria-live="polite">
      <p>
        <b style={{ color: C.navy }}>{room.name}</b>
        <span className="ml-2 text-[15px]">
          {dateLabel(sel.checkIn)} ~ {dateLabel(sel.checkIn + sel.nights)}
        </span>
      </p>
      <div className="flex items-center gap-2">
        <label htmlFor="bar-nights" className="text-[15px] font-semibold">
          박수
        </label>
        <NightsSelect sel={sel} id="bar-nights" />
      </div>
      <PeopleStepper sel={sel} room={room} />
      <div className="flex items-center justify-between gap-4 border-t pt-3 md:border-0 md:pt-0" style={{ borderColor: C.line }}>
        <p className="text-right">
          <span className="block text-[13px]" style={{ color: C.muted }}>
            객실 요금{q.extraPeople > 0 ? ` + 인원 추가 ${q.extraPeople}명` : ""}
          </span>
          <span className="text-[20px] font-bold tabular-nums" style={{ color: C.navy }}>
            {won(q.total)}
          </span>
        </p>
        <button type="button" onClick={() => go("reserve")} className="h-12 rounded-[6px] px-6 font-bold" style={{ background: C.coral, color: C.navyDeep }}>
          예약하기
        </button>
      </div>
    </div>
  );
}

/* ---------- 메인: 예약안내 바로가기, 주변관광지 ---------- */

function GuideShortcuts({ go }: { go: Go }) {
  const items: { label: string; value: string; tab: GuideTab }[] = [
    { label: "입실·퇴실", value: "15:00 · 11:00", tab: "time" },
    { label: "기준인원 초과", value: `1인 1박 ${won(EXTRA_PERSON)}`, tab: "time" },
    { label: "환불규정", value: "10일 전 취소 100% 환불", tab: "refund" },
    { label: "입금 안내", value: "예약 후 6시간 안", tab: "deposit" },
  ];
  return (
    <section aria-labelledby="quick-title" className="px-4 py-14 md:px-6 md:py-20">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle id="quick-title">예약안내</SectionTitle>
        <ul className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border md:grid-cols-4" style={{ borderColor: C.line, background: C.line }}>
          {items.map((it) => (
            <li key={it.label} className="bg-white">
              <button type="button" onClick={() => go("guide", { tab: it.tab })} className="flex h-full w-full flex-col items-start gap-1 p-4 text-left hover:bg-[#f8f4ec] md:p-5">
                <span className="text-[14px]" style={{ color: C.muted }}>
                  {it.label}
                </span>
                <span className="text-[16px] font-bold md:text-[18px]" style={{ color: C.navy }}>
                  {it.value}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const PLACES = [
  { name: "□□ 해수욕장", how: "도보 3분", body: "펜션 바로 앞 해수욕장" },
  { name: "□□ 해안 산책로", how: "도보 15분", body: "바위 해안을 따라 이어진 약 2km 산책로" },
  { name: "□□ 등대 전망대", how: "차량 8분", body: "펜션 마당에서 보이는 빨간 등대" },
  { name: "□□항 수산시장", how: "차량 10분", body: "회 포장 후 객실에서 드실 수 있습니다" },
  { name: "□□ 전통시장", how: "차량 15분", body: "매달 2, 7로 끝나는 날 오일장" },
];

function PlacesSection({ go }: { go: Go }) {
  return (
    <section aria-labelledby="places-title" className="px-4 pb-16 md:px-6 md:pb-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionTitle
          id="places-title"
          aside={
            <button type="button" onClick={() => go("around")} className="inline-flex h-10 items-center gap-1 font-semibold" style={{ color: C.navy }}>
              자세히 보기 <ChevronRight size={16} aria-hidden />
            </button>
          }
        >
          주변관광지
        </SectionTitle>
        <ul className="mt-6 grid grid-cols-2 gap-x-5 md:grid-cols-5">
          {PLACES.map((p) => (
            <li key={p.name} className="border-t py-3" style={{ borderColor: C.line }}>
              <p className="text-[14px] font-semibold tabular-nums" style={{ color: C.muted }}>
                {p.how}
              </p>
              <p className="mt-0.5 font-bold" style={{ color: C.navy }}>
                {p.name}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 하위 페이지 공통 ---------- */

function SubHeader({ title, crumbs, tabs, go }: { title: string; crumbs: string[]; tabs?: { label: string; on: boolean; onClick: () => void }[]; go: Go }) {
  return (
    <>
      <div className="relative h-[180px] overflow-hidden md:h-[220px]" style={{ background: C.navyDeep }}>
        <Image src={`${IMG}/hero.jpg`} alt="" fill sizes="100vw" className="object-cover opacity-45" style={{ objectPosition: "center 60%" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white">
          <h1 id="pension-title" tabIndex={-1} className="text-[30px] font-bold tracking-[-0.03em] outline-none md:text-[38px]">
            {title}
          </h1>
          <nav aria-label="현재 위치" className="mt-2">
            <ol className="flex flex-wrap items-center justify-center gap-1 text-[14px]" style={{ color: "#dbe4ea" }}>
              <li>
                <button type="button" onClick={() => go("home")} className="underline-offset-2 hover:underline">
                  홈
                </button>
              </li>
              {crumbs.map((c, i) => (
                <li key={c} className="flex items-center gap-1">
                  <ChevronRight size={14} aria-hidden />
                  <span aria-current={i === crumbs.length - 1 ? "page" : undefined}>{c}</span>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
      {tabs && (
        <div className="border-b bg-white" style={{ borderColor: C.line }}>
          <ul className="mx-auto flex max-w-[1200px] overflow-x-auto px-2 md:justify-center md:px-6">
            {tabs.map((t) => (
              <li key={t.label} className="shrink-0">
                <button
                  type="button"
                  onClick={t.onClick}
                  aria-current={t.on ? "page" : undefined}
                  className="h-12 px-4 text-[15px] font-semibold md:px-6"
                  style={{ color: t.on ? C.coralDeep : C.muted, boxShadow: t.on ? `inset 0 -3px 0 ${C.coral}` : undefined }}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function SubBody({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6 md:py-16">{children}</div>;
}

/* ---------- 펜션소개 ---------- */

function AboutPage({ go }: { go: Go }) {
  const facilities = [
    { icon: Flame, name: "공용 바비큐장", body: "17:00 ~ 22:00 · 그릴 3대 · 우천 시 지붕 아래 이용" },
    { icon: Waves, name: "해변 계단", body: "정원 끝에서 □□ 해수욕장 모래사장으로 바로 연결" },
    { icon: Trees, name: "정원", body: "객실 사이 잔디 마당 · 소나무 그늘 벤치" },
    { icon: Car, name: "주차장", body: "6대 · 객실당 1대" },
    { icon: Eye, name: "개별 바비큐 테라스", body: "윤슬, 물결, 노을(바다 쪽) · 마당 객실 앞마당" },
  ];
  return (
    <>
      <SubHeader
        title="펜션소개"
        crumbs={["펜션소개"]}
        go={go}
        tabs={[
          { label: "인사말", on: true, onClick: () => go("about") },
          { label: "부대시설", on: false, onClick: () => go("about", { anchor: "facilities" }) },
        ]}
      />
      <SubBody>
        <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[10px]">
            <Image src={`${IMG}/hero.jpg`} alt="해 질 무렵 바다 앞에 불이 켜진 2층 펜션 건물" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="space-y-4">
            <h2 className="text-[24px] font-bold" style={{ color: C.navy }}>
              인사말
            </h2>
            <p>{PENSION}을 찾아 주셔서 감사합니다. □□ 해수욕장 바로 앞, 객실 6개의 작은 펜션입니다.</p>
            <p>정원 앞 계단으로 내려가시면 바로 백사장입니다. 편히 쉬었다 가실 수 있도록 최선을 다하겠습니다.</p>
            <p className="pt-2 text-[15px]" style={{ color: C.muted }}>
              {PENSION} 대표 {OWNER}
            </p>
          </div>
        </div>
        <section aria-labelledby="facilities" className="mt-14 scroll-mt-20">
          <SectionTitle id="facilities">부대시설</SectionTitle>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((f) => (
              <li key={f.name} className="flex gap-3 rounded-[10px] border p-4" style={{ borderColor: C.line }}>
                <f.icon size={20} className="mt-0.5 shrink-0" style={{ color: C.muted }} aria-hidden />
                <span>
                  <b style={{ color: C.navy }}>{f.name}</b>
                  <span className="block text-[15px]" style={{ color: C.muted }}>
                    {f.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </SubBody>
    </>
  );
}

/* ---------- 객실안내 상세 ---------- */

const AMENITIES = [
  { icon: Wifi, label: "와이파이" },
  { icon: AirVent, label: "에어컨" },
  { icon: Tv, label: "TV" },
  { icon: Refrigerator, label: "냉장고" },
  { icon: CookingPot, label: "취사도구" },
  { icon: ShowerHead, label: "욕실용품" },
];

function RoomPage({ roomId, go }: { roomId: string; go: Go }) {
  const room = ROOMS[ROOM_INDEX[roomId]];
  const info: [string, string][] = [
    ["객실명", room.name],
    ["구조", room.structure],
    ["크기", `${room.size}평(${sqm(room.size)}㎡)`],
    ["인원", `기준 ${room.base}명 ~ 최대 ${room.max}명`],
    ["전망", room.view ? "바다 전망" : "정원 전망"],
    ["스파", room.spa ? "스파 욕조" : "없음"],
    ["바비큐", room.bbq ? (room.side === "sea" ? "테라스 개별 바비큐" : "앞마당 개별 바비큐") : "공용 바비큐장 이용"],
    ["추가 요금", `기준인원 초과 1인 1박 ${won(EXTRA_PERSON)}`],
  ];
  return (
    <>
      <SubHeader
        title="객실안내"
        crumbs={["객실안내", room.name]}
        go={go}
        tabs={ROOMS.map((r) => ({ label: r.name, on: r.id === roomId, onClick: () => go("room", { room: r.id }) }))}
      />
      <SubBody>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[10px]">
            <Image src={`${IMG}/room.jpg`} alt={`${room.name} 객실 침실`} fill sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" style={{ objectPosition: room.photo }} />
          </div>
          <div>
            <h2 className="text-[28px] font-bold" style={{ color: C.navy }}>
              {room.name}
              <span className="ml-2 text-[16px] font-semibold" style={{ color: C.coralDeep }}>
                {room.side === "sea" ? "바다 쪽" : "정원 쪽"}
              </span>
            </h2>
            <table className="mt-4 w-full text-[15px]">
              <caption className="sr-only">{room.name} 객실 정보</caption>
              <tbody>
                {info.map(([k, v]) => (
                  <tr key={k} className="border-t" style={{ borderColor: C.line }}>
                    <th scope="row" className="w-[96px] py-2.5 text-left font-semibold" style={{ color: C.muted }}>
                      {k}
                    </th>
                    <td className="py-2.5">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-[14px] sm:grid-cols-6 lg:grid-cols-3" style={{ borderColor: C.line }} aria-label="객실 비품">
              {AMENITIES.map((a) => (
                <li key={a.label} className="flex items-center gap-1.5" style={{ color: C.muted }}>
                  <a.icon size={18} style={{ color: C.navy }} aria-hidden />
                  {a.label}
                </li>
              ))}
              {room.spa && (
                <li className="flex items-center gap-1.5" style={{ color: C.muted }}>
                  <Bath size={18} style={{ color: C.navy }} aria-hidden />
                  스파 욕조
                </li>
              )}
            </ul>
          </div>
        </div>

        <h3 className="mt-12 text-[20px] font-bold" style={{ color: C.navy }}>
          객실 요금
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] border-t-2 text-center text-[15px] tabular-nums" style={{ borderColor: C.navy }}>
            <caption className="sr-only">{room.name} 1박 요금</caption>
            <thead>
              <tr style={{ background: C.sandSoft }}>
                {PRICE_HEAD.map((h) => (
                  <th key={h} scope="col" className="px-2 py-2.5 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b" style={{ borderColor: C.line }}>
                {room.prices.map((p, i) => (
                  <td key={i} className="py-3 font-bold">
                    {won(p)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
          1박 기준 · 성수기 7월 15일 ~ 8월 20일 · 기준 {room.base}명, 최대 {room.max}명
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          <button type="button" onClick={() => go("reserve", { room: room.id })} className="h-12 rounded-[6px] px-6 font-bold" style={{ background: C.coral, color: C.navyDeep }}>
            실시간예약
          </button>
          <button type="button" onClick={() => go("guide", { tab: "time" })} className="h-12 rounded-[6px] border px-6 font-semibold" style={{ borderColor: C.navy, color: C.navy }}>
            예약안내
          </button>
        </div>
      </SubBody>
    </>
  );
}

/* ---------- 실시간예약 ---------- */

type Ticket = {
  no: string;
  room: string;
  checkIn: number;
  checkOut: number;
  people: number;
  arrival: string;
  name: string;
  phone: string;
  total: number;
};

const ARRIVALS = ["15:00 ~ 16:00", "16:00 ~ 17:00", "17:00 ~ 18:00", "18:00 ~ 19:00", "19:00 ~ 20:00", "20:00 이후"];

const guideTabs = (go: Go, current: string) => [
  ...GUIDE_TABS.map((t) => ({ label: t.label, on: current === t.id, onClick: () => go("guide", { tab: t.id }) })),
  { label: "실시간예약", on: current === "reserve", onClick: () => go("reserve") },
];

function ReservePage({ sel, onPick, go }: { sel: Selection; onPick: (id: string, dn: number) => void; go: Go }) {
  const [grill, setGrill] = useState(false);
  const [breakfast, setBreakfast] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [arrival, setArrival] = useState("");
  const [request, setRequest] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const { checkIn, nights, roomId, today, clear } = sel;
  const room = ROOMS[ROOM_INDEX[roomId]];
  const free = checkIn !== null && roomFree(ROOM_INDEX[roomId], checkIn, checkIn + nights);
  const q = checkIn !== null && free ? quote(room, checkIn, nights, sel.people, grill, breakfast) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkIn === null || !q) return setError("예약현황표에서 객실과 입실일을 선택해 주십시오.");
    if (name.trim().length < 2) return setError("예약자 이름을 입력해 주십시오.");
    if (phone.replace(/\D/g, "").length < 10) return setError("휴대전화 번호를 입력해 주십시오.");
    if (!arrival) return setError("도착 예정 시간을 선택해 주십시오.");
    if (!agree) return setError("환불규정에 동의해 주십시오.");
    setError("");
    const p = parts(checkIn);
    const digits = Number(phone.replace(/\D/g, "").slice(-6));
    const serial = hash(checkIn * 97 + digits) * 100 + hash(checkIn + nights + digits);
    setTicket({
      no: `${String(p.y).slice(2)}${String(p.m + 1).padStart(2, "0")}${String(p.d).padStart(2, "0")}-${String(serial).padStart(4, "0")}`,
      room: room.name,
      checkIn,
      checkOut: checkIn + nights,
      people: q.headcount,
      arrival,
      name: maskName(name),
      phone: maskPhone(phone),
      total: q.total,
    });
  };

  const closeTicket = useCallback(() => {
    setTicket(null);
    clear();
    setName("");
    setPhone("");
    setArrival("");
    setRequest("");
    setAgree(false);
    setGrill(false);
    setBreakfast(false);
  }, [clear]);

  const input = "mt-1 h-12 w-full rounded-[6px] border bg-white px-3 outline-none focus:border-[#12324a]";

  return (
    <>
      <SubHeader title="실시간예약" crumbs={["예약안내", "실시간예약"]} go={go} tabs={guideTabs(go, "reserve")} />
      <SubBody>
        <SectionTitle id="board-title" aside={<TodayCount today={today} />}>
          예약현황
        </SectionTitle>
        <StatusBoard today={today} roomId={roomId} checkIn={checkIn} nights={nights} onPick={onPick} />

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.1fr_1fr]">
          <section aria-labelledby="amount-title" className="min-w-0 rounded-[10px] p-5 md:p-6" style={{ background: C.sandSoft }}>
            <h2 id="amount-title" className="text-[20px] font-bold" style={{ color: C.navy }}>
              예약 금액
            </h2>
            {checkIn === null ? (
              <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
                선택한 객실 없음
              </p>
            ) : (
              <>
                <dl className="mt-3 grid grid-cols-[72px_1fr] items-center gap-y-2 text-[15px]">
                  <dt style={{ color: C.muted }}>객실</dt>
                  <dd className="font-bold">
                    {room.name} <span className="font-normal">(기준 {room.base}명, 최대 {room.max}명)</span>
                  </dd>
                  <dt style={{ color: C.muted }}>입실</dt>
                  <dd>{dateLabel(checkIn)} 15:00</dd>
                  <dt style={{ color: C.muted }}>퇴실</dt>
                  <dd>{dateLabel(checkIn + nights)} 11:00</dd>
                  <dt>
                    <label htmlFor="page-nights" style={{ color: C.muted }}>
                      박수
                    </label>
                  </dt>
                  <dd>
                    <NightsSelect sel={sel} id="page-nights" />
                  </dd>
                  <dt style={{ color: C.muted }}>인원</dt>
                  <dd>
                    <PeopleStepper sel={sel} room={room} />
                  </dd>
                </dl>
                {!free && (
                  <p className="mt-3 text-[14px] font-semibold" style={{ color: C.coralDeep }} role="alert">
                    선택한 날짜에 예약 완료된 객실입니다. 예약현황표에서 다시 선택해 주십시오.
                  </p>
                )}
                {q && (
                  <>
                    <fieldset className="mt-4 space-y-1 border-t pt-3" style={{ borderColor: C.line }}>
                      <legend className="sr-only">추가 옵션</legend>
                      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px]">
                        <input type="checkbox" checked={grill} onChange={(e) => setGrill(e.target.checked)} className="h-5 w-5 accent-[#12324a]" />
                        <span>
                          바비큐 그릴(숯 포함) <span style={{ color: C.muted }}>{won(GRILL)}</span>
                        </span>
                      </label>
                      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px]">
                        <input type="checkbox" checked={breakfast} onChange={(e) => setBreakfast(e.target.checked)} className="h-5 w-5 accent-[#12324a]" />
                        <span>
                          조식 바구니(08:00 객실 앞) <span style={{ color: C.muted }}>1인 {won(BREAKFAST)}</span>
                        </span>
                      </label>
                    </fieldset>
                    <table className="mt-4 w-full text-[15px] tabular-nums">
                      <caption className="sr-only">박별 요금과 추가 요금</caption>
                      <thead>
                        <tr className="text-left text-[13px]" style={{ color: C.muted }}>
                          <th scope="col" className="pb-2 font-normal">
                            날짜
                          </th>
                          <th scope="col" className="pb-2 font-normal">
                            구분
                          </th>
                          <th scope="col" className="pb-2 text-right font-normal">
                            금액
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {q.rows.map((n) => (
                          <tr key={n.dn} className="border-t" style={{ borderColor: C.line }}>
                            <td className="py-2">{dateLabel(n.dn)}</td>
                            <td className="py-2">
                              <span className="text-[13px] font-semibold" style={{ color: n.type === "weekday" ? C.muted : C.coralDeep }}>
                                {TYPE_LABEL[n.type]}
                              </span>
                            </td>
                            <td className="py-2 text-right">{won(n.price)}</td>
                          </tr>
                        ))}
                        {q.extraPeople > 0 && (
                          <tr className="border-t" style={{ borderColor: C.line }}>
                            <td className="py-2" colSpan={2}>
                              인원 추가 {q.extraPeople}명 x {nights}박
                            </td>
                            <td className="py-2 text-right">{won(q.extraSum)}</td>
                          </tr>
                        )}
                        {grill && (
                          <tr className="border-t" style={{ borderColor: C.line }}>
                            <td className="py-2" colSpan={2}>
                              바비큐 그릴
                            </td>
                            <td className="py-2 text-right">{won(q.grillSum)}</td>
                          </tr>
                        )}
                        {breakfast && (
                          <tr className="border-t" style={{ borderColor: C.line }}>
                            <td className="py-2" colSpan={2}>
                              조식 바구니 {q.headcount}명 x {nights}회
                            </td>
                            <td className="py-2 text-right">{won(q.breakfastSum)}</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2" style={{ borderColor: C.navy }}>
                          <th scope="row" colSpan={2} className="pt-3 text-left text-[17px]">
                            합계
                          </th>
                          <td className="pt-3 text-right text-[22px] font-bold" style={{ color: C.navy }}>
                            {won(q.total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                    <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
                      기준인원 초과 1인 1박 {won(EXTRA_PERSON)} · 24개월 미만 영유아는 인원에서 제외
                    </p>
                  </>
                )}
              </>
            )}
          </section>

          <form onSubmit={submit} noValidate className="rounded-[10px] border p-5 md:p-6" style={{ borderColor: C.line }} aria-labelledby="form-title">
            <h2 id="form-title" className="text-[20px] font-bold" style={{ color: C.navy }}>
              예약자 정보
            </h2>
            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="text-[15px] font-semibold">예약자명</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} style={{ borderColor: C.line }} />
              </label>
              <label className="block">
                <span className="text-[15px] font-semibold">휴대전화</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={input} style={{ borderColor: C.line }} />
              </label>
              <label className="block">
                <span className="text-[15px] font-semibold">도착 예정 시간</span>
                <select value={arrival} onChange={(e) => setArrival(e.target.value)} className={input} style={{ borderColor: C.line }}>
                  <option value="">선택</option>
                  {ARRIVALS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[15px] font-semibold">
                  요청사항 <span className="font-normal" style={{ color: C.muted }}>(선택)</span>
                </span>
                <textarea value={request} onChange={(e) => setRequest(e.target.value)} rows={3} maxLength={200} className="mt-1 w-full rounded-[6px] border px-3 py-2.5 outline-none focus:border-[#12324a]" style={{ borderColor: C.line }} />
              </label>
              <div className="rounded-[6px] p-3 text-[15px]" style={{ background: C.sandSoft }}>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#12324a]" />
                  <span>환불규정과 유의사항에 동의합니다.</span>
                </label>
                <button type="button" onClick={() => go("guide", { tab: "refund" })} className="ml-[30px] mt-1 text-[14px] font-semibold underline underline-offset-2" style={{ color: C.navy }}>
                  환불규정 보기
                </button>
              </div>
            </div>
            {error && (
              <p className="mt-4 text-[15px] font-semibold" style={{ color: "#b3261e" }} role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="mt-5 h-[52px] w-full rounded-[6px] text-[17px] font-bold" style={{ background: C.coral, color: C.navyDeep }}>
              예약하기{q ? ` · ${won(q.total)}` : ""}
            </button>
            <p className="mt-3 text-[13px]" style={{ color: C.muted }}>
              무통장 입금 · 예약 후 6시간 안에 입금하지 않으면 자동 취소됩니다.
            </p>
          </form>
        </div>
      </SubBody>
      <TicketDialog data={ticket} onClose={closeTicket} />
    </>
  );
}

/* ---------- 예약 완료 ---------- */

function TicketDialog({ data, onClose }: { data: Ticket | null; onClose: () => void }) {
  const reduce = useReducedMotionSafe();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!data) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, onClose]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
          style={{ background: "rgba(11,34,51,0.6)" }}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-title"
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto w-full max-w-[400px] overflow-hidden rounded-[12px] bg-white"
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 12, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="px-6 pb-6 pt-5 text-white" style={{ background: C.navy }}>
              <div className="flex items-center justify-between">
                <Logo />
                <button ref={closeRef} type="button" onClick={onClose} aria-label="닫기" className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-[6px]" style={{ color: C.sand }}>
                  <X size={20} aria-hidden />
                </button>
              </div>
              <h2 id="ticket-title" className="mt-3 text-[16px] font-bold" style={{ color: C.sand }}>
                예약 신청 완료
              </h2>
              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                <TicketDate label="입실" dn={data.checkIn} time="15:00" />
                <div className="flex flex-col items-center pb-2" style={{ color: C.coral }}>
                  <Waves size={22} aria-hidden />
                  <span className="mt-1 text-[13px] font-semibold" style={{ color: C.sand }}>
                    {data.checkOut - data.checkIn}박
                  </span>
                </div>
                <TicketDate label="퇴실" dn={data.checkOut} time="11:00" right />
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-6 py-5 text-[15px]">
              {[
                ["객실", data.room],
                ["인원", `${data.people}명`],
                ["예약자", data.name],
                ["연락처", data.phone],
                ["도착 예정", data.arrival],
                ["결제 금액", won(data.total)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[13px]" style={{ color: C.muted }}>
                    {k}
                  </dt>
                  <dd className="font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="relative h-0 border-t-2 border-dashed" style={{ borderColor: C.line }}>
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full" style={{ background: "#5a6a76" }} />
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full" style={{ background: "#5a6a76" }} />
            </div>
            <div className="px-6 pb-6 pt-5" style={{ background: C.sandSoft }}>
              <p className="text-[13px]" style={{ color: C.muted }}>
                입금 계좌
              </p>
              <p className="font-bold tabular-nums">{BANK}</p>
              <p className="text-[14px]">예금주 {OWNER}</p>
              <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
                예약 후 6시간 안에 예약자명으로 입금해 주시기 바랍니다. 기한이 지나면 자동 취소되며, 입금이 확인되면 예약 확정 문자를 보내 드립니다.
              </p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[13px]" style={{ color: C.muted }}>
                    예약번호
                  </p>
                  <p className="font-bold tabular-nums tracking-[0.04em]">{data.no}</p>
                </div>
                <Barcode seed={data.no} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TicketDate({ label, dn, time, right = false }: { label: string; dn: number; time: string; right?: boolean }) {
  const p = parts(dn);
  return (
    <div className={right ? "text-right" : ""}>
      <p className="text-[13px]" style={{ color: C.sand }}>
        {label}
      </p>
      <p className="text-[34px] font-bold leading-none tabular-nums">
        {p.m + 1}.{String(p.d).padStart(2, "0")}
      </p>
      <p className="mt-1 text-[14px]" style={{ color: "#c9d6df" }}>
        {DAY_NAMES[p.w]}요일 {time}
      </p>
    </div>
  );
}

function Barcode({ seed }: { seed: string }) {
  const n = Number(seed.replace(/\D/g, "")) % 100_000;
  let x = 0;
  const bars: { x: number; w: number }[] = [];
  for (let i = 0; i < 28; i++) {
    const w = (hash(n + i * 13) % 3) + 1;
    bars.push({ x, w });
    x += w + 2;
  }
  return (
    <svg width={x} height="36" viewBox={`0 0 ${x} 36`} aria-hidden>
      {bars.map((b) => (
        <rect key={b.x} x={b.x} y="0" width={b.w} height="36" fill={C.navy} />
      ))}
    </svg>
  );
}

/* ---------- 예약안내 ---------- */

const REFUND = [
  { label: "10일 전", rate: 100, from: 10, to: Infinity },
  { label: "7~9일 전", rate: 90, from: 7, to: 9 },
  { label: "5~6일 전", rate: 70, from: 5, to: 6 },
  { label: "3~4일 전", rate: 50, from: 3, to: 4 },
  { label: "2일 전", rate: 30, from: 2, to: 2 },
  { label: "1일 전", rate: 10, from: 1, to: 1 },
  { label: "당일", rate: 0, from: 0, to: 0 },
];

const NOTES = [
  "예약은 입금 순서로 확정되며, 예약자명과 입금자명이 같아야 합니다.",
  "예약 인원 외 방문객은 입실이 불가합니다. 인원 추가는 예약 시 알려 주시기 바랍니다.",
  "객실 내 금연이며, 육류 및 생선은 굽지 못합니다. 흡연은 주차장 옆 흡연 구역을 이용해 주시기 바랍니다.",
  "반려동물 동반 입실은 불가합니다.",
  "밤 10시 이후에는 다른 이용객을 위해 실외 고성방가를 자제하여 주시기 바랍니다.",
  "미성년자는 보호자 없이 입실이 불가합니다.",
  "주차는 객실당 1대 가능합니다. 추가 차량은 해안길 공영주차장을 이용해 주시기 바랍니다.",
  "객실 비품 파손 및 분실 시 실비로 배상하셔야 합니다.",
  "퇴실 시 뒷정리를 부탁드리며, 쓰레기는 분리수거하여 현관 앞에 놓아 주시기 바랍니다.",
];

function GuidePage({ tab, setTab, go, today, checkIn }: { tab: GuideTab; setTab: (t: GuideTab) => void; go: Go; today: number; checkIn: number | null }) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const left = today >= 0 && checkIn !== null ? checkIn - today : null;
  const idx = GUIDE_TABS.findIndex((t) => t.id === tab);

  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (idx + d + GUIDE_TABS.length) % GUIDE_TABS.length;
    setTab(GUIDE_TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <>
      <SubHeader title="예약안내" crumbs={["예약안내", GUIDE_TABS[idx].label]} go={go} />
      <SubBody>
        <div role="tablist" aria-label="예약안내" className="grid grid-cols-2 border-l border-t sm:grid-cols-4" style={{ borderColor: C.line }} onKeyDown={onKey}>
          {GUIDE_TABS.map((t, i) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`guide-tab-${t.id}`}
                aria-selected={on}
                aria-controls={`guide-panel-${t.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => setTab(t.id)}
                className="h-12 border-b border-r text-[16px] font-semibold"
                style={on ? { background: C.navy, color: "#fff", borderColor: C.navy } : { background: "#fff", color: C.muted, borderColor: C.line }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`guide-panel-${tab}`} aria-labelledby={`guide-tab-${tab}`} tabIndex={0} className="mt-8 outline-none">
          {tab === "time" && (
            <table className="w-full border-t-2 text-[16px]" style={{ borderColor: C.navy }}>
              <caption className="sr-only">입실, 퇴실 시간과 추가 요금</caption>
              <tbody>
                {[
                  ["입실", "15:00부터 · 일찍 도착하시면 짐 보관 가능"],
                  ["퇴실", "11:00까지 · 늦은 퇴실은 전날까지 문의 바랍니다"],
                  ["기준인원 초과", `1인 1박 ${won(EXTRA_PERSON)} · 24개월 미만 영유아는 인원에서 제외`],
                  ["바비큐", `17:00 ~ 22:00 · 그릴(숯 포함) ${won(GRILL)}`],
                  ["조식 바구니", `08:00 객실 앞 · 빵, 과일, 커피 1인 ${won(BREAKFAST)}`],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b" style={{ borderColor: C.line }}>
                    <th scope="row" className="w-[34%] px-3 py-3.5 text-left font-semibold sm:w-[180px]" style={{ background: C.sandSoft, color: C.navy }}>
                      {k}
                    </th>
                    <td className="px-3 py-3.5">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "notes" && (
            <ol className="list-decimal space-y-2.5 pl-6 marker:font-bold marker:text-[#b4513a]">
              {NOTES.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ol>
          )}

          {tab === "refund" && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-t-2 text-center text-[15px] tabular-nums" style={{ borderColor: C.navy }}>
                  <caption className="sr-only">이용일 기준 취소 시점별 환불 비율</caption>
                  <tbody>
                    <tr className="border-b" style={{ borderColor: C.line }}>
                      <th scope="row" className="w-[90px] px-2 py-3 font-semibold" style={{ background: C.sandSoft, color: C.navy }}>
                        취소일
                      </th>
                      {REFUND.map((r) => {
                        const now = left !== null && left >= r.from && left <= r.to;
                        return (
                          <td key={r.label} className="px-1 py-3" style={now ? { background: C.coralSoft, fontWeight: 700 } : undefined}>
                            {r.label}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b" style={{ borderColor: C.line }}>
                      <th scope="row" className="px-2 py-3 font-semibold" style={{ background: C.sandSoft, color: C.navy }}>
                        환불
                      </th>
                      {REFUND.map((r) => {
                        const now = left !== null && left >= r.from && left <= r.to;
                        return (
                          <td key={r.label} className="px-1 py-3 font-bold" style={now ? { background: C.coralSoft, color: C.coralDeep } : undefined}>
                            {r.rate}%
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              {left !== null && left >= 0 && (
                <p className="mt-3 text-[15px] font-semibold" style={{ color: C.coralDeep }}>
                  선택한 입실일 기준 {left === 0 ? "오늘 취소 시" : `${left}일 전 취소 시`} 요금의 {REFUND.find((r) => left >= r.from && left <= r.to)?.rate}% 환불
                </p>
              )}
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px]" style={{ color: C.muted }}>
                <li>취소일은 이용일(입실일) 기준입니다.</li>
                <li>기상 특보 발효로 이용이 어려운 경우 날짜 변경 또는 전액 환불해 드립니다.</li>
                <li>환불은 취소 접수 후 3일 이내 입금하신 계좌로 처리해 드립니다.</li>
                <li>날짜 변경은 예약 취소 후 다시 예약하셔야 합니다.</li>
              </ul>
            </>
          )}

          {tab === "deposit" && (
            <>
              <dl className="grid gap-px overflow-hidden rounded-[10px] border sm:grid-cols-3" style={{ borderColor: C.line, background: C.line }}>
                {[
                  ["입금 계좌", BANK],
                  ["예금주", OWNER],
                  ["입금 기한", "예약 후 6시간 안"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white p-5">
                    <dt className="text-[14px]" style={{ color: C.muted }}>
                      {k}
                    </dt>
                    <dd className="mt-1 text-[18px] font-bold tabular-nums" style={{ color: C.navy }}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px]" style={{ color: C.muted }}>
                <li>기한 안에 입금하지 않으면 예약이 자동 취소됩니다.</li>
                <li>예약자명과 입금자명이 다른 경우 전화로 알려 주시기 바랍니다.</li>
                <li>입금이 확인되면 예약 확정 문자를 보내 드립니다.</li>
              </ul>
            </>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t pt-6" style={{ borderColor: C.line }}>
          <button type="button" onClick={() => go("reserve")} className="h-12 rounded-[6px] px-6 font-bold" style={{ background: C.coral, color: C.navyDeep }}>
            실시간예약
          </button>
          <a href={`tel:${TEL}`} className="inline-flex h-12 items-center rounded-[6px] border px-6 font-semibold" style={{ borderColor: C.navy, color: C.navy }}>
            예약문의 {TEL}
          </a>
        </div>
      </SubBody>
    </>
  );
}

/* ---------- 주변관광지 ---------- */

function AroundPage({ go }: { go: Go }) {
  return (
    <>
      <SubHeader title="주변관광지" crumbs={["주변관광지"]} go={go} />
      <SubBody>
        <ul className="grid gap-4 md:grid-cols-2">
          {PLACES.map((p) => (
            <li key={p.name} className="rounded-[10px] border p-5" style={{ borderColor: C.line }}>
              <span>
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <b className="text-[18px]" style={{ color: C.navy }}>
                    {p.name}
                  </b>
                  <span className="text-[14px] font-semibold" style={{ color: C.coralDeep }}>
                    {p.how}
                  </span>
                </span>
                <span className="mt-1 block text-[15px]" style={{ color: C.muted }}>
                  {p.body}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </SubBody>
    </>
  );
}

/* ---------- 오시는 길 ---------- */

function MiniMap() {
  return (
    <svg viewBox="0 0 640 380" className="h-auto w-full" role="img" aria-label="□□리 버스 정류장에서 해안길을 따라 걸어서 5분 거리에 있는 펜션 약도. 펜션 앞이 바로 □□ 해수욕장입니다.">
      <rect width="640" height="380" fill={C.sandSoft} />
      <path d="M0 300 C120 280 220 312 330 296 S520 276 640 292 V380 H0Z" fill={C.sand} />
      <path d="M0 330 C120 312 220 342 330 326 S520 306 640 322 V380 H0Z" fill={C.sea} />
      <text x="560" y="362" fontSize="15" fill={C.navy} fontWeight={700}>
        바다
      </text>
      <text x="470" y="306" fontSize="13" fill={C.muted}>
        □□ 해수욕장
      </text>
      <path d="M0 220 C160 200 300 236 640 210" fill="none" stroke="#d8d2c6" strokeWidth="26" />
      <text x="40" y="196" fontSize="14" fill={C.muted}>
        □□ 해안길
      </text>
      <path d="M200 0 C210 80 190 150 214 214" fill="none" stroke="#d8d2c6" strokeWidth="20" />
      <text x="222" y="60" fontSize="14" fill={C.muted}>
        □□ 나들목 방향
      </text>
      <rect x="134" y="226" width="56" height="26" rx="6" fill={C.navy} />
      <text x="162" y="244" fontSize="13" fill="#fff" textAnchor="middle" fontWeight={700}>
        버스
      </text>
      <text x="110" y="272" fontSize="14" fill={C.ink}>
        □□리 정류장
      </text>
      <path d="M192 236 C280 238 340 230 400 232" fill="none" stroke={C.coralDeep} strokeWidth="3" strokeDasharray="6 7" />
      <text x="290" y="258" fontSize="13" fill={C.coralDeep} textAnchor="middle" fontWeight={700}>
        도보 5분
      </text>
      <rect x="400" y="150" width="120" height="66" rx="12" fill={C.white} stroke={C.navy} strokeWidth="2" />
      <circle cx="430" cy="183" r="12" fill={C.coral} />
      <text x="448" y="180" fontSize="14" fill={C.navy} fontWeight={700}>
        곰파트너 바다
      </text>
      <text x="448" y="198" fontSize="14" fill={C.navy} fontWeight={700}>
        펜션
      </text>
      <rect x="540" y="160" width="50" height="40" rx="6" fill="#e8e3d9" />
      <text x="565" y="185" fontSize="13" fill={C.ink} textAnchor="middle" fontWeight={700}>
        P
      </text>
    </svg>
  );
}

function LocationPage({ go }: { go: Go }) {
  return (
    <>
      <SubHeader title="오시는 길" crumbs={["오시는 길"]} go={go} />
      <SubBody>
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:gap-12">
          <div className="overflow-hidden rounded-[10px] border" style={{ borderColor: C.line }}>
            <MiniMap />
          </div>
          <div>
            <table className="w-full border-t-2 text-[15px]" style={{ borderColor: C.navy }}>
              <caption className="sr-only">주소와 교통편</caption>
              <tbody>
                {[
                  { icon: null, k: "주소", v: ADDRESS },
                  { icon: Car, k: "자가용", v: "□□ 나들목에서 해안길을 따라 20분 · 펜션 앞 주차장 6대" },
                  { icon: Bus, k: "버스", v: "□□ 터미널에서 군내버스 00번, □□리 정류장 하차 후 도보 5분" },
                  { icon: Users, k: "픽업", v: "□□ 터미널 픽업 가능 (도착 전 사전 연락 부탁드립니다)" },
                ].map((r) => (
                  <tr key={r.k} className="border-b" style={{ borderColor: C.line }}>
                    <th scope="row" className="w-[88px] py-3 pr-2 text-left align-top font-semibold" style={{ color: C.navy }}>
                      <span className="inline-flex items-center gap-1.5">
                        {r.icon && <r.icon size={16} aria-hidden />}
                        {r.k}
                      </span>
                    </th>
                    <td className="py-3">{r.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <a href={`tel:${TEL}`} className="mt-6 inline-flex h-12 items-center rounded-[6px] px-6 font-semibold" style={{ background: C.navy, color: "#fff" }}>
              전화 {TEL}
            </a>
          </div>
        </div>
      </SubBody>
    </>
  );
}

/* ---------- 바닥글 ---------- */

function Footer({ go }: { go: Go }) {
  return (
    <footer className="px-4 pb-28 pt-10 md:px-6" style={{ background: C.navyDeep, color: C.sand }}>
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Logo />
          <ul className="flex flex-wrap gap-x-4 text-[14px]">
            {[
              { label: "예약안내", page: "guide" as const },
              { label: "실시간예약", page: "reserve" as const },
              { label: "오시는 길", page: "location" as const },
            ].map((l) => (
              <li key={l.label}>
                <button type="button" onClick={() => go(l.page)} className="h-10 underline-offset-2 hover:underline">
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: "#9fb2c0" }}>
          {[
            ["상호", PENSION],
            ["대표", OWNER],
            ["농어촌민박 신고번호", "제0000-00호"],
            ["사업자등록번호", "000-00-00000"],
            ["주소", ADDRESS],
            ["전화", TEL],
            ["입금 계좌", `${BANK} (${OWNER})`],
            ["이메일", "hello@example.com"],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="shrink-0">{k}</dt>
              <dd className="min-w-0 break-keep" style={{ color: "#fff" }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </footer>
  );
}
