"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bath,
  Bus,
  Car,
  ChevronLeft,
  ChevronRight,
  CigaretteOff,
  Clock,
  Eye,
  Fish,
  Flame,
  Footprints,
  Menu,
  Minus,
  Moon,
  PawPrint,
  Plus,
  Ruler,
  Store,
  Sunrise,
  Users,
  Waves,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 바다 펜션 예약 홈페이지 데모: 가상의 ○○ 바다 펜션(객실 6개).
   상호, 대표자, 주소, 전화번호, 계좌, 신고번호, 객실 이름과 요금, 예약 현황은 모두 가상이다.

   디자인: 깊은 바다 남색(#12324a), 모래색(#efe6d6), 노을 산호색(#e07a5f), 흰색.
   큰 사진과 둥근 카드로 차분한 바닷가 느낌을 낸다. 예약 확인은 승선권처럼 생긴 숙박권으로 보여 준다.

   객실 배치도는 펜션을 위에서 내려다본 그림이다. 바다 쪽 3실, 정원 쪽 3실, 바비큐장, 주차장, 해변 계단이 있고
   객실을 누르면 인원, 크기, 바다 전망, 개별 바비큐, 스파 여부가 카드로 나온다. 같은 내용을 목록으로도 고를 수 있다.
   달력은 두 달을 함께 보여 주고 입실일과 퇴실일을 차례로 누르거나 끌어서 고른다. 칸마다 남은 방 수가 나오고,
   다 찬 날은 고를 수 없다. 요금은 주중, 주말(금·토), 공휴일 전날, 성수기(7/15~8/20)로 나뉜다.
   예약 현황은 날짜 숫자로 만든 가짜 값이라 언제 열어도 같고, 서버 렌더와 어긋나지 않게 브라우저에서만 계산한다.
   요금 계산은 박마다 요금, 인원 추가, 바비큐 그릴, 조식 바구니를 더해 보여 준다.

   사진 출처(public/images/demo-pension):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, room */

const IMG = "/images/demo-pension";
const PENSION = "○○ 바다 펜션";
const TEL = "033-000-0000";
const ADDRESS = "강원특별자치도 □□군 □□면 해안길 00";
const ACCOUNT = "△△은행 000-000000-00-000";
const OWNER = "김○○";

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
};

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV = [
  { id: "rooms", label: "객실 배치도" },
  { id: "booking", label: "날짜·요금" },
  { id: "guide", label: "이용 안내" },
  { id: "around", label: "주변 즐길 거리" },
  { id: "location", label: "오시는 길" },
];

/* ---------- 시간 ---------- */

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];
const DAY_MS = 86_400_000;
const MAX_NIGHTS = 7;
const MONTHS_AHEAD = 10;

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
  view: boolean;
  bbq: boolean;
  spa: boolean;
  /** 주중, 주말·공휴일 전날, 성수기 주중, 성수기 주말 */
  prices: [number, number, number, number];
  desc: string;
  photo: string;
};

const ROOMS: Room[] = [
  {
    id: "yunseul",
    name: "윤슬",
    side: "sea",
    base: 2,
    max: 3,
    size: 10,
    view: true,
    bbq: true,
    spa: true,
    prices: [150_000, 200_000, 230_000, 280_000],
    desc: "침대에 누우면 창 가득 바다가 보여요. 창가에 둘이 들어가는 스파 욕조가 있습니다.",
    photo: "30% center",
  },
  {
    id: "mulgyeol",
    name: "물결",
    side: "sea",
    base: 2,
    max: 4,
    size: 12,
    view: true,
    bbq: true,
    spa: false,
    prices: [140_000, 190_000, 220_000, 270_000],
    desc: "테라스에서 바로 바다가 보이는 방이에요. 침대 하나에 바닥 이불을 더 펼 수 있습니다.",
    photo: "55% center",
  },
  {
    id: "noeul",
    name: "노을",
    side: "sea",
    base: 4,
    max: 6,
    size: 18,
    view: true,
    bbq: true,
    spa: true,
    prices: [240_000, 300_000, 340_000, 400_000],
    desc: "위층에 침실이 있는 복층 객실이에요. 해 질 무렵 노을이 거실 창으로 들어옵니다.",
    photo: "75% center",
  },
  {
    id: "solsup",
    name: "솔숲",
    side: "garden",
    base: 2,
    max: 3,
    size: 8,
    view: false,
    bbq: false,
    spa: false,
    prices: [90_000, 130_000, 160_000, 200_000],
    desc: "정원 소나무 쪽으로 창이 난 조용한 방이에요. 바비큐는 공용 바비큐장에서 하시면 됩니다.",
    photo: "20% center",
  },
  {
    id: "deulkkot",
    name: "들꽃",
    side: "garden",
    base: 2,
    max: 4,
    size: 11,
    view: false,
    bbq: false,
    spa: true,
    prices: [110_000, 150_000, 190_000, 230_000],
    desc: "정원이 보이는 방에 스파 욕조를 들였어요. 바다에서 놀고 들어와 몸 녹이기 좋습니다.",
    photo: "45% center",
  },
  {
    id: "madang",
    name: "마당",
    side: "garden",
    base: 4,
    max: 8,
    size: 20,
    view: false,
    bbq: true,
    spa: false,
    prices: [200_000, 260_000, 300_000, 360_000],
    desc: "방 두 개에 거실이 있는 가족 객실이에요. 앞마당에 전용 바비큐 자리가 있습니다.",
    photo: "65% center",
  },
];

const ROOM_INDEX: Record<string, number> = Object.fromEntries(ROOMS.map((r, i) => [r.id, i]));

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

const freeRooms = (from: number, to: number) => ROOMS.filter((_, i) => roomFree(i, from, to));

function minPriceOn(dn: number) {
  const col = PRICE_COL[nightType(dn)];
  let min = Infinity;
  ROOMS.forEach((r, i) => {
    if (!isBooked(dn, i)) min = Math.min(min, r.prices[col]);
  });
  return min;
}

/* ---------- 이름, 전화 가리기 ---------- */

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘을 김ㅎ늘로 */
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

export function PensionDemo() {
  const minute = useNowMinute();
  const today = todayDn(minute);
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [checkIn, setCheckIn] = useState<number | null>(null);
  const [checkOut, setCheckOut] = useState<number | null>(null);

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.white, color: C.ink }}>
      <Header />
      <main>
        <Hero today={today} />
        <Rooms roomId={roomId} onRoom={setRoomId} checkIn={checkIn} checkOut={checkOut} />
        <Booking
          today={today}
          roomId={roomId}
          onRoom={setRoomId}
          checkIn={checkIn}
          checkOut={checkOut}
          setCheckIn={setCheckIn}
          setCheckOut={setCheckOut}
        />
        <Guide today={today} checkIn={checkIn} />
        <Around />
        <Location />
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
        <rect width="30" height="30" rx="9" fill={light ? C.sand : C.navy} />
        <circle cx="15" cy="14" r="5" fill={C.coral} />
        <path d="M5 19 Q8.5 16.5 12 19 T19 19 T26 19 V24 H5Z" fill={light ? C.navy : C.sea} />
      </svg>
      <span className="text-[19px] font-bold tracking-[-0.02em]">{PENSION}</span>
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
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <a href="#top" aria-label={`${PENSION} 처음으로`} style={{ color: C.navy }}>
          <Logo />
        </a>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-[15px]">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="transition-colors hover:text-[#12324a]" style={{ color: C.muted }}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <a href={`tel:${TEL}`} className="hidden h-11 items-center px-2 text-[15px] font-semibold md:inline-flex" style={{ color: C.navy }}>
            {TEL}
          </a>
          <a href="#booking" className="inline-flex h-11 items-center rounded-full px-5 text-[15px] font-bold" style={{ background: C.coral, color: C.navyDeep }}>
            예약하기
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
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
              <li>
                <a href={`tel:${TEL}`} className="flex h-12 items-center text-[17px] font-semibold" style={{ color: C.coralDeep }}>
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

function Hero({ today }: { today: number }) {
  const reduce = useReducedMotionSafe();
  const tonight = today >= 0 ? remainingOn(today) : null;
  const sat = today >= 0 ? today + ((6 - parts(today).w + 7) % 7) : -1;
  const satLeft = sat >= 0 ? remainingOn(sat) : null;

  return (
    <section id="top" className="relative">
      <div className="relative h-[78vh] max-h-[760px] min-h-[560px] w-full overflow-hidden">
        <Image
          src={`${IMG}/hero.jpg`}
          alt="해 질 무렵 바다 앞에 불이 켜진 2층 펜션 건물"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "center 40%" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,34,51,0.82) 0%, rgba(11,34,51,0.35) 45%, rgba(11,34,51,0.05) 75%)" }} />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-10 md:px-6 md:pb-14">
          <motion.div
            className="mx-auto max-w-[1200px] text-white"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <p className="text-[15px] font-semibold" style={{ color: C.sand }}>
              강원 □□군 □□ 해수욕장 앞
            </p>
            <h1 className="mt-1 text-[38px] font-bold leading-[1.2] tracking-[-0.03em] md:text-[60px]">{PENSION}</h1>
            <p className="mt-3 max-w-[520px] text-[16px] md:text-[18px]" style={{ color: "#e8eef2" }}>
              해수욕장까지 걸어서 3분이에요. 객실 여섯 개 가운데 세 개는 창밖이 바로 바다입니다.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-5 rounded-[14px] px-5 py-3" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)" }} aria-live="polite">
                <p className="text-[14px]" style={{ color: C.sand }}>
                  오늘 밤 남은 방
                  <span className="block text-[22px] font-bold text-white tabular-nums">{tonight === null ? " " : tonight === 0 ? "마감" : `${tonight}실`}</span>
                </p>
                <span className="h-10 w-px" style={{ background: "rgba(255,255,255,0.3)" }} aria-hidden />
                <p className="text-[14px]" style={{ color: C.sand }}>
                  {sat === today ? "오늘이 토요일" : "이번 토요일"}
                  <span className="block text-[22px] font-bold text-white tabular-nums">{satLeft === null ? " " : satLeft === 0 ? "마감" : `${satLeft}실`}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <a href="#booking" className="inline-flex h-12 items-center rounded-full px-6 font-bold" style={{ background: C.coral, color: C.navyDeep }}>
                  날짜 고르기
                </a>
                <a href="#rooms" className="inline-flex h-12 items-center rounded-full border px-6 font-semibold text-white" style={{ borderColor: "rgba(255,255,255,0.6)" }}>
                  객실 보기
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ id, title, desc, light = false }: { id: string; title: string; desc?: string; light?: boolean }) {
  return (
    <div>
      <h2 id={id} className="text-[28px] font-bold leading-[1.35] tracking-[-0.03em] md:text-[38px]" style={{ color: light ? C.white : C.navy }}>
        {title}
      </h2>
      {desc && (
        <p className="mt-3 max-w-[660px]" style={{ color: light ? "#c9d6df" : C.muted }}>
          {desc}
        </p>
      )}
    </div>
  );
}

/* ---------- 객실 배치도 ---------- */

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

const featureLine = (r: Room) => [r.view ? "바다 전망" : "정원 전망", r.spa ? "스파" : null].filter(Boolean).join(" · ");

function SitePlan({ roomId, onRoom, closed }: { roomId: string; onRoom: (id: string) => void; closed: Set<string> | null }) {
  return (
    <svg viewBox="0 0 720 500" className="h-auto w-full select-none" role="group" aria-label="펜션을 위에서 본 객실 배치도. 위쪽은 정원 쪽 객실, 아래쪽은 바다 쪽 객실입니다.">
      <rect width="720" height="500" fill={C.sandSoft} />
      {/* 길 */}
      <rect width="720" height="40" fill="#d8d2c6" />
      <path d="M0 20 H720" stroke="#fff" strokeWidth="2" strokeDasharray="14 12" />
      <text x="700" y="26" fontSize="14" fill={C.muted} textAnchor="end">
        □□ 해안길
      </text>
      {/* 주차장 */}
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
      {/* 정원 */}
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
      {/* 바비큐장 */}
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
      {/* 해변 계단 */}
      <rect x="30" y="306" width="120" height="90" rx="10" fill="#e8e3d9" stroke={C.line} />
      {[316, 328, 340, 352, 364].map((y) => (
        <path key={y} d={`M56 ${y} H124`} stroke={C.sandDeep} strokeWidth="5" strokeLinecap="round" />
      ))}
      <text x="90" y="388" fontSize="14" fill={C.ink} textAnchor="middle" fontWeight={700}>
        해변 계단
      </text>
      <path d="M90 396 V412" stroke={C.sandDeep} strokeWidth="4" strokeDasharray="4 4" />
      {/* 해변, 바다 */}
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

      {/* 객실 */}
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
            aria-label={`${r.name}, ${r.side === "sea" ? "바다 쪽" : "정원 쪽"}, 기준 ${r.base}인 최대 ${r.max}인${shut ? ", 고른 날짜에 마감" : ""}`}
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
              rx="12"
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
              {shut ? "고른 날짜 마감" : featureLine(r)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function RoomCard({ room, closed }: { room: Room; closed: boolean }) {
  const reduce = useReducedMotionSafe();
  const facts = [
    { icon: Users, k: "인원", v: `기준 ${room.base}인, 최대 ${room.max}인` },
    { icon: Ruler, k: "크기", v: `${room.size}평 (${Math.round(room.size * 3.3)}㎡)` },
    { icon: Eye, k: "바다 전망", v: room.view ? "있음" : "없음 (정원 전망)" },
    { icon: Flame, k: "개별 바비큐", v: room.bbq ? (room.side === "sea" ? "테라스에서" : "앞마당에서") : "공용 바비큐장 이용" },
    { icon: Bath, k: "스파", v: room.spa ? "있음" : "없음" },
  ];
  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={room.id}
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="overflow-hidden rounded-[20px] bg-white shadow-[0_8px_28px_rgba(18,50,74,0.10)]"
        aria-live="polite"
      >
        <div className="relative aspect-[4/3]">
          <Image src={`${IMG}/room.jpg`} alt={`${room.name} 객실 안, 큰 창 너머로 ${room.view ? "바다" : "정원"}가 보이는 침실`} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" style={{ objectPosition: room.photo }} />
          <span className="absolute left-3 top-3 rounded-full px-3 py-1 text-[14px] font-bold" style={{ background: room.side === "sea" ? C.navy : C.sand, color: room.side === "sea" ? "#fff" : C.navy }}>
            {room.side === "sea" ? "바다 쪽" : "정원 쪽"}
          </span>
        </div>
        <div className="p-5 md:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[24px] font-bold tracking-[-0.02em]" style={{ color: C.navy }}>
              {room.name}
            </h3>
            <p className="text-[15px]" style={{ color: C.muted }}>
              주중 <span className="font-bold" style={{ color: C.ink }}>{man(room.prices[0])} 원</span>부터
            </p>
          </div>
          <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
            {room.desc}
          </p>
          <dl className="mt-4 divide-y text-[15px]" style={{ borderColor: C.line }}>
            {facts.map((f) => (
              <div key={f.k} className="flex items-center gap-3 py-2.5" style={{ borderColor: C.line }}>
                <f.icon size={18} className="shrink-0" style={{ color: C.coralDeep }} aria-hidden />
                <dt className="w-[84px] shrink-0" style={{ color: C.muted }}>
                  {f.k}
                </dt>
                <dd className="font-semibold">{f.v}</dd>
              </div>
            ))}
          </dl>
          {closed && (
            <p className="mt-3 rounded-[10px] px-3 py-2 text-[14px] font-semibold" style={{ background: C.coralSoft, color: C.coralDeep }}>
              고른 날짜에는 이 객실이 마감됐어요.
            </p>
          )}
          <a href="#booking" className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full font-bold" style={{ background: C.navy, color: "#fff" }}>
            {room.name} 날짜 고르기
          </a>
        </div>
      </motion.article>
    </AnimatePresence>
  );
}

function Rooms({ roomId, onRoom, checkIn, checkOut }: { roomId: string; onRoom: (id: string) => void; checkIn: number | null; checkOut: number | null }) {
  const room = ROOMS[ROOM_INDEX[roomId]];
  const closed = checkIn !== null && checkOut !== null ? new Set(ROOMS.filter((_, i) => !roomFree(i, checkIn, checkOut)).map((r) => r.id)) : null;

  return (
    <section aria-labelledby="rooms-title" id="rooms" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.sandSoft }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="rooms-title"
          title="바다 쪽 세 칸, 정원 쪽 세 칸"
          desc="그림에서 객실을 누르면 자세한 내용이 나와요. 날짜를 고르고 오면 그날 마감된 객실은 회색으로 보입니다."
        />
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.45fr_1fr]">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-[20px] border bg-white" style={{ borderColor: C.line }}>
              <SitePlan roomId={roomId} onRoom={onRoom} closed={closed} />
            </div>
            <p className="mt-4 text-[15px] font-semibold" id="room-list-label">
              목록에서 고르기
            </p>
            <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-labelledby="room-list-label">
              {ROOMS.map((r) => {
                const on = r.id === roomId;
                const shut = closed?.has(r.id) ?? false;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => onRoom(r.id)}
                      className="flex w-full flex-col items-start rounded-[12px] border px-3.5 py-2.5 text-left transition-colors"
                      style={on ? { background: C.navy, borderColor: C.navy, color: "#fff" } : { background: C.white, borderColor: C.line }}
                    >
                      <span className="font-bold">
                        {r.name}
                        <span className="ml-1.5 text-[13px] font-normal" style={{ color: on ? C.sand : C.muted }}>
                          {r.side === "sea" ? "바다 쪽" : "정원 쪽"}
                        </span>
                      </span>
                      <span className="text-[13px]" style={{ color: on ? "#c9d6df" : shut ? C.coralDeep : C.muted }}>
                        {shut ? "고른 날짜 마감" : `${r.base}~${r.max}인 · ${r.size}평`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <RoomCard room={room} closed={closed?.has(room.id) ?? false} />
        </div>
      </div>
    </section>
  );
}

/* ---------- 날짜, 요금, 예약 ---------- */

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
const EXTRA_PERSON = 20_000;
const GRILL = 30_000;
const BREAKFAST = 10_000;

type BookingProps = {
  today: number;
  roomId: string;
  onRoom: (id: string) => void;
  checkIn: number | null;
  checkOut: number | null;
  setCheckIn: (dn: number | null) => void;
  setCheckOut: (dn: number | null) => void;
};

function Booking({ today, roomId, onRoom, checkIn, checkOut, setCheckIn, setCheckOut }: BookingProps) {
  const [people, setPeople] = useState(2);
  const [grill, setGrill] = useState(false);
  const [breakfast, setBreakfast] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [arrival, setArrival] = useState("");
  const [request, setRequest] = useState("");
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const ready = checkIn !== null && checkOut !== null;
  const open = ready ? freeRooms(checkIn, checkOut) : [];
  const room = ready ? open.find((r) => r.id === roomId) ?? null : null;
  const nights = ready
    ? Array.from({ length: checkOut - checkIn }, (_, i) => {
        const dn = checkIn + i;
        const type = nightType(dn);
        return { dn, type, price: room ? room.prices[PRICE_COL[type]] : 0 };
      })
    : [];
  const headcount = room ? Math.min(Math.max(people, 1), room.max) : people;
  const extraPeople = room ? Math.max(0, headcount - room.base) : 0;
  const roomSum = nights.reduce((s, n) => s + n.price, 0);
  const extraSum = extraPeople * EXTRA_PERSON * nights.length;
  const grillSum = grill ? GRILL : 0;
  const breakfastSum = breakfast ? BREAKFAST * headcount * nights.length : 0;
  const total = roomSum + extraSum + grillSum + breakfastSum;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return setError("달력에서 입실일과 퇴실일을 골라 주세요.");
    if (!room) return setError("고른 날짜에 묵을 객실을 골라 주세요.");
    if (name.trim().length < 2) return setError("예약하시는 분 이름을 두 글자 이상 적어 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setError("휴대전화 번호를 적어 주세요.");
    if (!arrival) return setError("도착 예정 시간을 골라 주세요.");
    setError("");
    const p = parts(checkIn);
    const digits = Number(phone.replace(/\D/g, "").slice(-6));
    const serial = hash(checkIn * 97 + digits) * 100 + hash(checkOut + digits);
    setTicket({
      no: `${String(p.y).slice(2)}${String(p.m + 1).padStart(2, "0")}${String(p.d).padStart(2, "0")}-${String(serial).padStart(4, "0")}`,
      room: room.name,
      checkIn,
      checkOut,
      people: headcount,
      arrival,
      name: maskName(name),
      phone: maskPhone(phone),
      total,
    });
  };

  const closeTicket = useCallback(() => {
    setTicket(null);
    setCheckIn(null);
    setCheckOut(null);
    setName("");
    setPhone("");
    setArrival("");
    setRequest("");
    setGrill(false);
    setBreakfast(false);
  }, [setCheckIn, setCheckOut]);

  return (
    <section aria-labelledby="booking-title" id="booking" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="booking-title"
          title="날짜를 고르면 빈 방과 요금이 나와요"
          desc="입실일을 누르고 퇴실일을 누르세요. 마우스로는 끌어서 고를 수도 있습니다. 칸에 적힌 숫자는 그날 밤 남은 방 수예요."
        />

        <Calendar today={today} checkIn={checkIn} checkOut={checkOut} setCheckIn={setCheckIn} setCheckOut={setCheckOut} />

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div className="min-w-0 rounded-[20px] p-5 md:p-7" style={{ background: C.sandSoft }}>
            <h3 className="text-[20px] font-bold" style={{ color: C.navy }}>
              요금 계산
            </h3>
            {!ready ? (
              <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
                {checkIn !== null ? `입실일 ${dateLabel(checkIn)}. 이제 퇴실일을 눌러 주세요.` : "달력에서 날짜를 먼저 골라 주세요."}
              </p>
            ) : (
              <>
                <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
                  {dateLabel(checkIn)} ~ {dateLabel(checkOut)}, {checkOut - checkIn}박
                </p>
                <fieldset className="mt-5">
                  <legend className="text-[15px] font-semibold">
                    이 날짜에 묵을 수 있는 객실 {open.length}개
                  </legend>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {ROOMS.map((r) => {
                      const can = open.includes(r);
                      const on = room?.id === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          disabled={!can}
                          aria-pressed={on}
                          onClick={() => onRoom(r.id)}
                          className="rounded-[10px] border px-2 py-2 text-[15px] font-semibold disabled:cursor-not-allowed"
                          style={
                            on
                              ? { background: C.navy, borderColor: C.navy, color: "#fff" }
                              : can
                                ? { background: C.white, borderColor: C.line, color: C.ink }
                                : { background: "transparent", borderColor: C.line, color: "#9a9fa4", textDecoration: "line-through" }
                          }
                        >
                          {r.name}
                          <span className="block text-[12px] font-normal no-underline">{can ? `${r.base}~${r.max}인` : "마감"}</span>
                        </button>
                      );
                    })}
                  </div>
                  {!room && (
                    <p className="mt-2 text-[14px] font-semibold" style={{ color: C.coralDeep }}>
                      {ROOMS[ROOM_INDEX[roomId]].name}은 이 날짜에 마감됐어요. 다른 객실을 골라 주세요.
                    </p>
                  )}
                </fieldset>

                {room && (
                  <>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[15px] font-semibold">
                        인원
                        <span className="ml-1.5 font-normal" style={{ color: C.muted }}>
                          기준 {room.base}인, 최대 {room.max}인
                        </span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPeople(Math.max(1, headcount - 1))}
                          disabled={headcount <= 1}
                          aria-label="인원 한 명 줄이기"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white disabled:opacity-40"
                          style={{ borderColor: C.line }}
                        >
                          <Minus size={18} aria-hidden />
                        </button>
                        <span className="w-12 text-center text-[18px] font-bold tabular-nums" aria-live="polite">
                          {headcount}명
                        </span>
                        <button
                          type="button"
                          onClick={() => setPeople(Math.min(room.max, headcount + 1))}
                          disabled={headcount >= room.max}
                          aria-label="인원 한 명 늘리기"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full border bg-white disabled:opacity-40"
                          style={{ borderColor: C.line }}
                        >
                          <Plus size={18} aria-hidden />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px]">
                        <input type="checkbox" checked={grill} onChange={(e) => setGrill(e.target.checked)} className="h-5 w-5 accent-[#12324a]" />
                        <span>
                          바비큐 그릴 <span style={{ color: C.muted }}>숯과 그릴 한 번, {won(GRILL)}</span>
                        </span>
                      </label>
                      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px]">
                        <input type="checkbox" checked={breakfast} onChange={(e) => setBreakfast(e.target.checked)} className="h-5 w-5 accent-[#12324a]" />
                        <span>
                          조식 바구니 <span style={{ color: C.muted }}>빵, 과일, 커피를 아침 8시에 문 앞에, 1인 {won(BREAKFAST)}</span>
                        </span>
                      </label>
                    </div>

                    <table className="mt-5 w-full text-[15px] tabular-nums">
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
                        {nights.map((n) => (
                          <tr key={n.dn} className="border-t" style={{ borderColor: C.line }}>
                            <td className="py-2">{dateLabel(n.dn)}</td>
                            <td className="py-2">
                              <span
                                className="rounded-full px-2 py-0.5 text-[13px] font-semibold"
                                style={n.type === "weekday" ? { background: C.white, color: C.muted } : n.type.startsWith("peak") ? { background: C.navy, color: "#fff" } : { background: C.coralSoft, color: C.coralDeep }}
                              >
                                {TYPE_LABEL[n.type]}
                              </span>
                            </td>
                            <td className="py-2 text-right">{won(n.price)}</td>
                          </tr>
                        ))}
                        {extraPeople > 0 && (
                          <tr className="border-t" style={{ borderColor: C.line }}>
                            <td className="py-2" colSpan={2}>
                              인원 추가 {extraPeople}명 x {nights.length}박
                            </td>
                            <td className="py-2 text-right">{won(extraSum)}</td>
                          </tr>
                        )}
                        {grill && (
                          <tr className="border-t" style={{ borderColor: C.line }}>
                            <td className="py-2" colSpan={2}>
                              바비큐 그릴
                            </td>
                            <td className="py-2 text-right">{won(grillSum)}</td>
                          </tr>
                        )}
                        {breakfast && (
                          <tr className="border-t" style={{ borderColor: C.line }}>
                            <td className="py-2" colSpan={2}>
                              조식 바구니 {headcount}명 x {nights.length}번
                            </td>
                            <td className="py-2 text-right">{won(breakfastSum)}</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2" style={{ borderColor: C.navy }}>
                          <th scope="row" colSpan={2} className="pt-3 text-left text-[17px]">
                            합계
                          </th>
                          <td className="pt-3 text-right text-[22px] font-bold" style={{ color: C.navy }}>
                            {won(total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                    <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
                      기준 인원을 넘으면 한 명에 1박 {won(EXTRA_PERSON)}이 더해집니다. 24개월 미만 아기는 인원에 넣지 않아요.
                    </p>
                  </>
                )}
              </>
            )}
            <PriceTable />
          </div>

          <form onSubmit={submit} noValidate className="rounded-[20px] border p-5 md:p-7" style={{ borderColor: C.line }} aria-labelledby="form-title">
            <h3 id="form-title" className="text-[20px] font-bold" style={{ color: C.navy }}>
              예약 신청
            </h3>
            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="text-[15px] font-semibold">이름</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="김하늘" className="mt-1 h-12 w-full rounded-[10px] border px-3 outline-none focus:border-[#12324a]" style={{ borderColor: C.line }} />
              </label>
              <label className="block">
                <span className="text-[15px] font-semibold">휴대전화</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" className="mt-1 h-12 w-full rounded-[10px] border px-3 outline-none focus:border-[#12324a]" style={{ borderColor: C.line }} />
              </label>
              <label className="block">
                <span className="text-[15px] font-semibold">도착 예정 시간</span>
                <select value={arrival} onChange={(e) => setArrival(e.target.value)} className="mt-1 h-12 w-full rounded-[10px] border bg-white px-3 outline-none focus:border-[#12324a]" style={{ borderColor: C.line }}>
                  <option value="">골라 주세요</option>
                  {ARRIVALS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[15px] font-semibold">
                  요청 사항 <span className="font-normal" style={{ color: C.muted }}>(선택)</span>
                </span>
                <textarea
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder="아이 베개가 하나 더 필요해요"
                  className="mt-1 w-full rounded-[10px] border px-3 py-2.5 outline-none focus:border-[#12324a]"
                  style={{ borderColor: C.line }}
                />
              </label>
            </div>
            <div className="mt-5 rounded-[12px] px-4 py-3 text-[15px]" style={{ background: C.sandSoft }}>
              {ready && room ? (
                <p className="flex flex-wrap items-baseline justify-between gap-2">
                  <span>
                    {room.name}, {checkOut - checkIn}박, {headcount}명
                  </span>
                  <span className="text-[18px] font-bold tabular-nums" style={{ color: C.navy }}>
                    {won(total)}
                  </span>
                </p>
              ) : (
                <p style={{ color: C.muted }}>날짜와 객실을 고르면 금액이 여기에 나와요.</p>
              )}
            </div>
            {error && (
              <p className="mt-4 text-[15px] font-semibold" style={{ color: "#b3261e" }} role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="mt-5 h-[52px] w-full rounded-full text-[17px] font-bold" style={{ background: C.coral, color: C.navyDeep }}>
              예약 신청하기
            </button>
            <p className="mt-3 text-[13px]" style={{ color: C.muted }}>
              데모 화면이라 적은 내용은 어디에도 보내지 않습니다.
            </p>
          </form>
        </div>
      </div>
      <TicketDialog data={ticket} onClose={closeTicket} />
    </section>
  );
}

function PriceTable() {
  return (
    <details className="group mt-6 rounded-[12px] bg-white">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-[15px] font-semibold">
        객실별 요금표
        <ChevronRight size={18} className="transition-transform group-open:rotate-90" aria-hidden />
      </summary>
      <div className="overflow-x-auto px-4 pb-4">
        <table className="w-full min-w-[440px] text-[14px] tabular-nums">
          <caption className="sr-only">객실별 1박 요금</caption>
          <thead>
            <tr style={{ color: C.muted }}>
              <th scope="col" className="py-2 text-left font-normal">
                객실
              </th>
              {["주중", "주말·공휴일 전날", "성수기 주중", "성수기 주말"].map((h) => (
                <th key={h} scope="col" className="py-2 text-right font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROOMS.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: C.line }}>
                <th scope="row" className="py-2 text-left font-semibold">
                  {r.name}
                </th>
                {r.prices.map((p, i) => (
                  <td key={i} className="py-2 text-right">
                    {man(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
          단위는 만 원, 1박 기준이에요. 성수기는 7월 15일부터 8월 20일까지입니다.
        </p>
      </div>
    </details>
  );
}

/* ---------- 달력 ---------- */

type CalendarProps = {
  today: number;
  checkIn: number | null;
  checkOut: number | null;
  setCheckIn: (dn: number | null) => void;
  setCheckOut: (dn: number | null) => void;
};

function Calendar({ today, checkIn, checkOut, setCheckIn, setCheckOut }: CalendarProps) {
  const [offset, setOffset] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [msg, setMsg] = useState("");
  const dragFrom = useRef<number | null>(null);

  useEffect(() => {
    const end = () => {
      dragFrom.current = null;
      setDragging(false);
    };
    window.addEventListener("pointerup", end);
    return () => window.removeEventListener("pointerup", end);
  }, []);

  const picking = checkIn !== null && checkOut === null;
  const soldOut = (dn: number) => remainingOn(dn) === 0;
  const validRange = (a: number, b: number) => b > a && b - a <= MAX_NIGHTS && freeRooms(a, b).length > 0;
  const isDisabled = (dn: number) => dn < today || (soldOut(dn) && !(picking && dn > checkIn && validRange(checkIn, dn)));

  const pick = (dn: number) => {
    setMsg("");
    if (checkIn === null || checkOut !== null) {
      setCheckIn(dn);
      setCheckOut(null);
      return;
    }
    if (dn <= checkIn) {
      setCheckIn(dn);
      return;
    }
    if (validRange(checkIn, dn)) {
      setCheckOut(dn);
      return;
    }
    setCheckIn(dn);
    setMsg(dn - checkIn > MAX_NIGHTS ? "한 번에 7박까지 예약할 수 있어요. 누른 날을 입실일로 바꿨어요." : "그날까지 이어서 묵을 수 있는 방이 없어요. 누른 날을 입실일로 바꿨어요.");
  };

  const previewEnd = picking && hover !== null && hover > checkIn && validRange(checkIn, hover) ? hover : null;
  const end = checkOut ?? previewEnd;

  const months =
    today >= 0
      ? [0, 1].map((k) => {
          const t = parts(today);
          const first = toDn(t.y, t.m + offset + k, 1);
          const fp = parts(first);
          const len = toDn(fp.y, fp.m + 1, 1) - first;
          return { first, y: fp.y, m: fp.m, lead: fp.w, len };
        })
      : null;

  return (
    <div className="mt-10 rounded-[20px] border p-3 sm:p-5 md:p-7" style={{ borderColor: C.line }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={offset === 0}
            aria-label="이전 달"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border disabled:opacity-30"
            style={{ borderColor: C.line }}
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setOffset((o) => Math.min(MONTHS_AHEAD, o + 1))}
            disabled={offset === MONTHS_AHEAD}
            aria-label="다음 달"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border disabled:opacity-30"
            style={{ borderColor: C.line }}
          >
            <ChevronRight size={20} aria-hidden />
          </button>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]" style={{ color: C.muted }}>
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px]" style={{ background: C.navy }} aria-hidden />
            입실·퇴실
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px]" style={{ background: C.sand }} aria-hidden />
            묵는 날
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold" style={{ color: C.coralDeep }} aria-hidden>
              금
            </span>
            주말·공휴일 전날 요금
          </li>
          <li className="flex items-center gap-1.5">
            <span className="text-[12px] line-through" aria-hidden>
              마감
            </span>
            남은 방 없음
          </li>
        </ul>
      </div>

      <div
        className="mt-4 grid select-none gap-6 md:grid-cols-2 md:gap-8"
        onPointerLeave={() => setHover(null)}
      >
        {(months ?? [null, null]).map((mo, k) => (
          <div key={mo ? `${mo.y}-${mo.m}` : k} className="min-w-0">
            <p className="text-center text-[18px] font-bold" style={{ color: C.navy }}>
              {mo ? `${mo.y}년 ${mo.m + 1}월` : " "}
            </p>
            <div className="mt-3 grid grid-cols-7 gap-0.5 text-center text-[13px] font-semibold sm:gap-1" aria-hidden>
              {DAY_NAMES.map((d, i) => (
                <span key={d} style={{ color: i === 0 ? "#c0392b" : i === 6 ? C.navy : C.muted }}>
                  {d}
                </span>
              ))}
            </div>
            <ol className="mt-1 grid grid-cols-7 gap-0.5 sm:gap-1">
              {!mo
                ? Array.from({ length: 35 }, (_, i) => <li key={i} className="h-[54px] md:h-[66px]" aria-hidden />)
                : [
                    ...Array.from({ length: mo.lead }, (_, i) => <li key={`e${i}`} aria-hidden />),
                    ...Array.from({ length: mo.len }, (_, i) => {
                      const dn = mo.first + i;
                      const p = parts(dn);
                      const past = dn < today;
                      const rem = past ? 0 : remainingOn(dn);
                      const disabled = isDisabled(dn);
                      const type = nightType(dn);
                      const holiday = holidayOf(dn);
                      const isIn = dn === checkIn;
                      const isOut = dn === checkOut || (checkOut === null && dn === previewEnd);
                      const inside = checkIn !== null && end !== null && dn > checkIn && dn < end;
                      const edge = isIn || (isOut && dn === checkOut);
                      const minP = !past && rem > 0 ? minPriceOn(dn) : 0;
                      const dateColor = edge ? "#fff" : past ? "#b5b9bd" : p.w === 0 || holiday ? "#c0392b" : type !== "weekday" ? C.coralDeep : C.ink;
                      return (
                        <li key={dn}>
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => pick(dn)}
                            onPointerDown={(e) => {
                              if (e.pointerType === "mouse" && !disabled && !soldOut(dn)) dragFrom.current = dn;
                            }}
                            onPointerEnter={() => {
                              setHover(dn);
                              const from = dragFrom.current;
                              if (from !== null && from !== dn && !dragging) {
                                setDragging(true);
                                setCheckIn(from);
                                setCheckOut(null);
                                setMsg("");
                              }
                            }}
                            onPointerUp={() => {
                              if (dragging && checkIn !== null && dn > checkIn && validRange(checkIn, dn)) setCheckOut(dn);
                            }}
                            aria-pressed={isIn || dn === checkOut}
                            aria-label={`${p.m + 1}월 ${p.d}일 ${DAY_NAMES[p.w]}요일${holiday ? `, ${holiday}` : ""}${past ? ", 지난 날짜" : rem === 0 ? ", 마감" : `, 남은 방 ${rem}실, ${TYPE_LABEL[type]} 요금 ${man(minP)} 원부터`}${dn === today ? ", 오늘" : ""}${isIn ? ", 입실일" : ""}${dn === checkOut ? ", 퇴실일" : ""}`}
                            className="relative flex h-[54px] w-full flex-col items-center justify-center rounded-[8px] leading-[1.15] transition-colors disabled:cursor-not-allowed md:h-[66px] md:rounded-[10px]"
                            style={{
                              background: edge ? C.navy : isOut ? C.navy : inside ? C.sand : "transparent",
                              outline: dn === today && !edge && !isOut ? `1.5px solid ${C.navy}` : undefined,
                              outlineOffset: -1.5,
                            }}
                          >
                            <span className="text-[15px] font-bold tabular-nums" style={{ color: isOut ? "#fff" : dateColor }}>
                              {p.d}
                            </span>
                            {!past && (
                              <span
                                className={`mt-0.5 text-[11px] font-semibold md:text-[12px] ${rem === 0 ? "line-through" : ""}`}
                                style={{ color: edge || isOut ? C.sand : rem === 0 ? "#9a9fa4" : rem <= 2 ? C.coralDeep : C.muted }}
                              >
                                {isIn ? "입실" : isOut ? "퇴실" : rem === 0 ? "마감" : `${rem}실`}
                              </span>
                            )}
                            {!past && rem > 0 && !edge && !isOut && (
                              <span className="hidden text-[11px] md:block" style={{ color: C.muted }}>
                                {man(minP)}~
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    }),
                  ]}
            </ol>
          </div>
        ))}
      </div>

      <div className="mt-4 flex min-h-11 flex-wrap items-center justify-between gap-3" aria-live="polite">
        <p className="text-[15px]">
          {msg ? (
            <span className="font-semibold" style={{ color: C.coralDeep }}>
              {msg}
            </span>
          ) : checkIn !== null && checkOut !== null ? (
            <>
              <span className="font-bold">{dateLabel(checkIn)}</span> 입실, <span className="font-bold">{dateLabel(checkOut)}</span> 퇴실, {checkOut - checkIn}박
            </>
          ) : checkIn !== null ? (
            <>
              <span className="font-bold">{dateLabel(checkIn)}</span> 입실. 퇴실일을 눌러 주세요.
            </>
          ) : (
            <span style={{ color: C.muted }}>입실일을 눌러 주세요.</span>
          )}
        </p>
        {checkIn !== null && (
          <button
            type="button"
            onClick={() => {
              setCheckIn(null);
              setCheckOut(null);
              setMsg("");
            }}
            className="h-11 rounded-full border px-4 text-[15px] font-semibold"
            style={{ borderColor: C.line }}
          >
            날짜 다시 고르기
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- 숙박권 ---------- */

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
            className="relative my-auto w-full max-w-[400px] overflow-hidden rounded-[20px] bg-white"
            initial={reduce ? false : { y: 40, opacity: 0, rotate: -1.5 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={reduce ? { opacity: 0 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="px-6 pb-6 pt-5 text-white" style={{ background: C.navy }}>
              <div className="flex items-center justify-between">
                <Logo light />
                <button ref={closeRef} type="button" onClick={onClose} aria-label="닫기" className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ color: C.sand }}>
                  <X size={20} aria-hidden />
                </button>
              </div>
              <h3 id="ticket-title" className="mt-3 text-[15px] font-semibold" style={{ color: C.sand }}>
                예약 신청이 접수됐어요
              </h3>
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
              <p className="font-bold tabular-nums">{ACCOUNT}</p>
              <p className="text-[14px]">예금주 {OWNER}</p>
              <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
                신청하고 3시간 안에 입금해 주세요. 입금이 확인되면 문자로 예약 확정을 보내 드립니다.
              </p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[13px]" style={{ color: C.muted }}>
                    예약 번호
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

/* ---------- 이용 안내, 환불 규정 ---------- */

const REFUND = [
  { label: "이용 7일 전까지", rate: "100%", from: 7, to: Infinity },
  { label: "이용 6일 ~ 5일 전", rate: "70%", from: 5, to: 6 },
  { label: "이용 4일 ~ 3일 전", rate: "50%", from: 3, to: 4 },
  { label: "이용 2일 ~ 1일 전", rate: "20%", from: 1, to: 2 },
  { label: "이용 당일", rate: "0%", from: 0, to: 0 },
];

function Guide({ today, checkIn }: { today: number; checkIn: number | null }) {
  const left = today >= 0 && checkIn !== null ? checkIn - today : null;
  const rules = [
    { icon: Clock, title: "입실 15:00, 퇴실 11:00", body: "일찍 도착하시면 짐을 맡아 드려요. 퇴실 시간을 늦추려면 전날까지 말씀해 주세요." },
    { icon: PawPrint, title: "반려동물은 함께 오실 수 없어요", body: "알레르기가 있는 손님이 많아 모든 객실에서 받지 않습니다." },
    { icon: Flame, title: "바비큐 17:00 ~ 22:00", body: "숯과 그릴은 예약할 때 신청하거나 오셔서 말씀해 주세요. 객실 안에서는 고기와 생선을 굽지 못해요." },
    { icon: Moon, title: "밤 10시부터 매너 타임", body: "바다 소리가 잘 들리는 만큼 말소리도 멀리 갑니다. 10시 이후에는 바깥에서 조용히 해 주세요." },
    { icon: CigaretteOff, title: "객실 안 금연", body: "담배는 주차장 옆 흡연 구역에서만 피울 수 있어요." },
    { icon: Car, title: "주차는 객실마다 1대", body: "차가 더 있으면 미리 알려 주세요. 해안길 공영 주차장을 안내해 드립니다." },
  ];

  return (
    <section aria-labelledby="guide-title" id="guide" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.navy }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="guide-title" title="오시기 전에 봐 주세요" light />
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
          <ul className="grid gap-3 sm:grid-cols-2">
            {rules.map((r) => (
              <li key={r.title} className="rounded-[16px] p-5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <r.icon size={22} style={{ color: C.coral }} aria-hidden />
                <p className="mt-3 font-bold text-white">{r.title}</p>
                <p className="mt-1 text-[15px]" style={{ color: "#c9d6df" }}>
                  {r.body}
                </p>
              </li>
            ))}
          </ul>
          <div className="rounded-[20px] bg-white p-5 md:p-7">
            <table className="w-full text-[15px]">
              <caption className="pb-1 text-left text-[20px] font-bold" style={{ color: C.navy }}>
                환불 규정
              </caption>
              <thead>
                <tr className="text-[13px]" style={{ color: C.muted }}>
                  <th scope="col" className="py-2 text-left font-normal">
                    취소하는 날
                  </th>
                  <th scope="col" className="py-2 text-right font-normal">
                    돌려 드리는 금액
                  </th>
                </tr>
              </thead>
              <tbody>
                {REFUND.map((r) => {
                  const now = left !== null && left >= r.from && left <= r.to;
                  return (
                    <tr key={r.label} className="border-t" style={{ borderColor: C.line, background: now ? C.coralSoft : undefined }}>
                      <th scope="row" className="px-2 py-3 text-left font-normal">
                        {r.label}
                        {now && (
                          <span className="ml-2 rounded-full px-2 py-0.5 text-[12px] font-bold" style={{ background: C.coral, color: C.navyDeep }}>
                            고른 날짜 기준
                          </span>
                        )}
                      </th>
                      <td className="px-2 py-3 text-right font-bold tabular-nums">{r.rate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
              태풍 같은 기상 특보로 오시기 어려우면 날짜를 옮겨 드리거나 전액 돌려 드립니다. 환불은 입금하신 계좌로 사흘 안에 보내 드려요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 주변 즐길 거리 ---------- */

function Around() {
  const reduce = useReducedMotionSafe();
  const places = [
    { icon: Waves, name: "□□ 해수욕장", how: "걸어서 3분", body: "해변 계단으로 내려가면 바로 모래사장이에요. 7월 초부터 8월 말까지 안전 요원이 있습니다." },
    { icon: Footprints, name: "□□ 해안 산책로", how: "걸어서 15분", body: "바위 해안을 따라 2km쯤 이어져요. 해 뜨는 시간에 걷기 좋습니다." },
    { icon: Sunrise, name: "□□ 등대 전망대", how: "차로 8분", body: "펜션에서 보이는 빨간 등대예요. 맑은 날에는 멀리 섬까지 보입니다." },
    { icon: Fish, name: "□□항 수산시장", how: "차로 10분", body: "회를 떠 와서 펜션에서 드셔도 돼요. 조개를 사 와서 바비큐에 올리는 분도 많습니다." },
    { icon: Store, name: "□□ 전통시장", how: "차로 15분", body: "끝자리 2, 7일에 장이 서요. 감자전과 메밀전병 가게가 모여 있습니다." },
  ];

  return (
    <section aria-labelledby="around-title" id="around" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="around-title" title="걸어서, 차로 가까운 곳" />
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {places.map((p, i) => (
            <motion.li
              key={p.name}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
              className="flex flex-col rounded-[18px] p-5"
              style={{ background: i === 0 ? C.seaSoft : C.sandSoft }}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white" style={{ color: C.navy }}>
                <p.icon size={21} aria-hidden />
              </span>
              <p className="mt-4 font-bold" style={{ color: C.navy }}>
                {p.name}
              </p>
              <p className="text-[14px] font-semibold" style={{ color: C.coralDeep }}>
                {p.how}
              </p>
              <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
                {p.body}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
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
        걸어서 5분
      </text>
      <rect x="400" y="150" width="120" height="66" rx="12" fill={C.white} stroke={C.navy} strokeWidth="2" />
      <circle cx="430" cy="183" r="12" fill={C.coral} />
      <text x="448" y="180" fontSize="14" fill={C.navy} fontWeight={700}>
        ○○ 바다
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

function Location() {
  return (
    <section aria-labelledby="location-title" id="location" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.sandSoft }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="location-title" title="□□ 해수욕장 바로 앞이에요" />
        <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div className="overflow-hidden rounded-[20px] border" style={{ borderColor: C.line }}>
            <MiniMap />
          </div>
          <div>
            <p className="text-[20px] font-bold tracking-[-0.02em] md:text-[22px]" style={{ color: C.navy }}>
              {ADDRESS}
            </p>
            <ul className="mt-5 space-y-4">
              {[
                { icon: Car, title: "자가용", body: "□□ 나들목에서 해안길을 따라 20분. 펜션 앞 주차장에 6대까지 댈 수 있어요." },
                { icon: Bus, title: "버스", body: "□□ 터미널에서 군내버스 00번을 타고 □□리 정류장에서 내려 걸어서 5분이에요." },
              ].map((r) => (
                <li key={r.title} className="flex gap-3">
                  <r.icon size={20} className="mt-1 shrink-0" style={{ color: C.coralDeep }} aria-hidden />
                  <span>
                    <span className="font-semibold">{r.title}</span>
                    <span className="block text-[15px]" style={{ color: C.muted }}>
                      {r.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[15px]" style={{ color: C.muted }}>
              터미널에서 오시면 미리 전화 주세요. 시간이 맞으면 모시러 갑니다.
            </p>
            <a href={`tel:${TEL}`} className="mt-6 inline-flex h-12 items-center rounded-full px-6 font-semibold" style={{ background: C.navy, color: "#fff" }}>
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
    <footer className="px-4 pb-24 pt-12 md:px-6" style={{ background: C.navyDeep, color: C.sand }}>
      <div className="mx-auto max-w-[1200px]">
        <Logo light />
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: "#9fb2c0" }}>
          {[
            ["상호", PENSION],
            ["대표", OWNER],
            ["농어촌민박 신고번호", "제0000-00호"],
            ["사업자등록번호", "000-00-00000"],
            ["주소", ADDRESS],
            ["전화", TEL],
            ["입금 계좌", `${ACCOUNT} (${OWNER})`],
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
