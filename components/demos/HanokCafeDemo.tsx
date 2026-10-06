"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, List, Menu, Minus, Phone, Plus, RotateCcw, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";


/* 한옥 카페 홈페이지 데모: 가상의 ○○ 한옥 찻집.
   상호, 대표자, 주소, 전화번호, 사업자 정보, 메뉴와 가격은 모두 가상이다.

   디자인: 한지색 바탕(#f3ede2)에 옅은 섬유 질감, 먹색 글씨(#1f1b16), 낙관 주홍(#a8432a),
   소나무 초록(#3f5a3c)과 황토(#b08850)를 보조색으로 쓴다. 제목은 굵은 고딕(Pretendard Bold), 본문은 보통 고딕.
   첫 화면 사진은 창호지 문 두 짝이 양옆으로 열리며 드러나고, 구역 이름은 세로쓰기로 둔다.

   메뉴는 검색창 대신 "따뜻한 차 중에 달지 않은 걸로 주세요" 문장의 낱말을 눌러 바꾸면
   맞는 메뉴가 두루마리가 풀리듯 내려온다. 차림표 전체 보기로 일반 목록도 볼 수 있다.
   자리 예약은 한옥 평면도에서 방이나 툇마루 자리를 누르면 누른 곳에서 먹이 번지듯 칠해지고,
   날짜, 시간, 인원을 고르면 낙관이 찍힌 예약 확인이 나온다. 평면도 아래 이름 목록으로도 고를 수 있다.

   사진 출처(public/images/demo-cafe):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, coffee, bingsu, omija, yard */


const IMG = "/images/demo-cafe";
const CAFE = "○○ 한옥 찻집";
const TEL = "02-000-0000";
const ADDRESS = "□□시 □□로 12길 7";

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

const PAPER_TEXTURE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.38 0 0 0 0 0.28 0 0 0 0.07 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const NAV = [
  { id: "menu", label: "차림표" },
  { id: "space", label: "공간" },
  { id: "reserve", label: "자리 예약" },
  { id: "location", label: "오시는 길" },
];

/* ---------- 영업시간 ---------- */

const OPEN = 660; // 11:00
const LAST_ORDER = 1230; // 20:30
const CLOSE = 1260; // 21:00
const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

const minuteSubscribe = (cb: () => void) => {
  const timer = window.setInterval(cb, 30_000);
  return () => window.clearInterval(timer);
};

/** 분 단위 현재 시각. 서버 렌더에서는 -1을 돌려 시간에 따른 화면 차이를 막는다. */
function useMinute() {
  return useSyncExternalStore(
    minuteSubscribe,
    () => Math.floor(Date.now() / 60_000),
    () => -1,
  );
}

function openStatus(minute: number) {
  if (minute < 0) return null;
  const now = new Date(minute * 60_000);
  const day = now.getDay();
  const m = now.getHours() * 60 + now.getMinutes();
  if (day === 1) return { day, text: "오늘은 쉬는 날입니다", open: false };
  if (m < OPEN) return { day, text: "11시에 문을 엽니다", open: false };
  if (m >= CLOSE) return { day, text: "오늘 영업이 끝났습니다", open: false };
  if (m >= LAST_ORDER) return { day, text: "주문이 마감됐습니다 (21:00까지 머물 수 있어요)", open: false };
  return { day, text: "지금 영업 중입니다 (주문 마감 20:30)", open: true };
}

/* ---------- 메뉴 ---------- */

type Kind = "tea" | "coffee" | "dessert";
type Temp = "hot" | "cold" | "any";

interface MenuItem {
  name: string;
  kind: Kind;
  temp: Temp;
  sweet: boolean;
  price: number;
  desc: string;
  season?: boolean;
}

const MENU: MenuItem[] = [
  { name: "작설차", kind: "tea", temp: "hot", sweet: false, price: 7000, desc: "하동 햇차를 낮은 온도로 우립니다. 두 번까지 다시 우려 드려요." },
  { name: "우엉차", kind: "tea", temp: "hot", sweet: false, price: 6500, desc: "덖은 우엉으로 구수하고 뒷맛이 깔끔합니다." },
  { name: "냉 작설차", kind: "tea", temp: "cold", sweet: false, price: 7000, desc: "찬물에 여덟 시간 우려 쓴맛이 적습니다." },
  { name: "쌍화차", kind: "tea", temp: "hot", sweet: true, price: 8000, desc: "약재를 오래 달이고 대추, 밤, 잣을 올립니다." },
  { name: "대추차", kind: "tea", temp: "hot", sweet: true, price: 7500, desc: "대추를 오래 끓여 걸쭉하고 달큰합니다." },
  { name: "유자차", kind: "tea", temp: "any", sweet: true, price: 7000, desc: "고흥 유자로 직접 담근 청을 씁니다." },
  { name: "오미자차", kind: "tea", temp: "cold", sweet: true, price: 7000, desc: "문경 오미자를 하루 우려 새콤달콤합니다." },
  { name: "단호박 식혜", kind: "tea", temp: "cold", sweet: true, price: 6500, desc: "단호박을 넣고 매장에서 삭힌 식혜입니다.", season: true },
  { name: "아메리카노", kind: "coffee", temp: "any", sweet: false, price: 5500, desc: "고소한 맛이 나는 원두를 씁니다." },
  { name: "오늘의 핸드드립", kind: "coffee", temp: "hot", sweet: false, price: 7000, desc: "원두는 날마다 바뀌고 약과 한 조각을 함께 드립니다." },
  { name: "콜드브루", kind: "coffee", temp: "cold", sweet: false, price: 6500, desc: "열두 시간 내린 원액에 물이나 우유를 골라 섞습니다." },
  { name: "흑임자 라테", kind: "coffee", temp: "any", sweet: true, price: 7000, desc: "볶은 검은깨를 갈아 넣어 진하고 고소합니다." },
  { name: "인절미 라테", kind: "coffee", temp: "any", sweet: true, price: 7000, desc: "볶은 콩가루와 에스프레소를 섞었습니다." },
  { name: "쑥 라테", kind: "coffee", temp: "any", sweet: true, price: 7000, desc: "강화 쑥 가루로 향이 은은합니다. 커피는 빼고도 드려요." },
  { name: "인절미 빙수", kind: "dessert", temp: "cold", sweet: true, price: 13000, desc: "우유 얼음에 콩가루, 찰떡, 팥을 올려 놋그릇에 냅니다." },
  { name: "홍시 빙수", kind: "dessert", temp: "cold", sweet: true, price: 14000, desc: "얼린 홍시를 통째로 갈아 올립니다.", season: true },
  { name: "단팥죽", kind: "dessert", temp: "hot", sweet: true, price: 9000, desc: "국산 팥을 쑤어 새알심과 밤을 넣습니다." },
  { name: "약과 세 개", kind: "dessert", temp: "any", sweet: true, price: 5000, desc: "조청에 재운 개성약과입니다." },
  { name: "가래떡 구이", kind: "dessert", temp: "hot", sweet: false, price: 5500, desc: "겉을 노릇하게 굽고 조청은 따로 드립니다." },
  { name: "들기름 누룽지", kind: "dessert", temp: "any", sweet: false, price: 4500, desc: "들기름에 바삭하게 구운 누룽지 과자입니다." },
];

const KIND_LABEL: Record<Kind, string> = { tea: "차", coffee: "커피", dessert: "디저트" };

const TOKENS = {
  temp: [
    { v: "hot", label: "따뜻한" },
    { v: "cold", label: "시원한" },
  ],
  kind: [
    { v: "tea", label: "차" },
    { v: "coffee", label: "커피" },
    { v: "dessert", label: "디저트" },
  ],
  sweet: [
    { v: "no", label: "달지 않은" },
    { v: "yes", label: "달콤한" },
  ],
} as const;

const FEATURED = [
  { img: "coffee", name: "오늘의 핸드드립", price: 7000, alt: "흰 자기 잔에 담긴 핸드드립 커피와 약과" },
  { img: "bingsu", name: "인절미 빙수", price: 13000, alt: "놋그릇에 담긴 인절미 빙수" },
  { img: "omija", name: "오미자차", price: 7000, alt: "얼음을 띄운 붉은 오미자차" },
];

function won(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

/* ---------- 자리 ---------- */

type SpaceId = "gunneon" | "daecheong" | "sarang1" | "sarang2" | "toen1" | "toen2" | "toen3" | "byeolchae";

interface Space {
  id: SpaceId;
  name: string;
  type: string;
  rect: [number, number, number, number];
  min: number;
  max: number;
  reservable: boolean;
  note: string;
}

const SPACES: Space[] = [
  { id: "gunneon", name: "건넌방", type: "좌식 방", rect: [40, 40, 160, 130], min: 2, max: 6, reservable: true, note: "방석과 낮은 상을 둔 방입니다. 신발을 벗고 들어가요." },
  { id: "daecheong", name: "대청마루", type: "입식 테이블", rect: [200, 40, 240, 130], min: 1, max: 4, reservable: false, note: "테이블 여섯 개가 있고 예약 없이 오신 순서대로 앉습니다." },
  { id: "sarang1", name: "사랑방 1", type: "좌식 방", rect: [470, 170, 130, 110], min: 2, max: 4, reservable: true, note: "문을 닫으면 따로 쓰는 작은 방입니다." },
  { id: "sarang2", name: "사랑방 2", type: "좌식 방", rect: [470, 280, 130, 110], min: 2, max: 4, reservable: true, note: "마당 쪽 창이 있는 작은 방입니다." },
  { id: "toen1", name: "툇마루 1", type: "툇마루 자리", rect: [56, 177, 124, 28], min: 1, max: 2, reservable: true, note: "마루 끝에 걸터앉아 마당을 보는 자리입니다. 등받이 방석을 드려요." },
  { id: "toen2", name: "툇마루 2", type: "툇마루 자리", rect: [192, 177, 124, 28], min: 1, max: 2, reservable: true, note: "소나무가 바로 앞에 보이는 자리입니다." },
  { id: "toen3", name: "툇마루 3", type: "툇마루 자리", rect: [328, 177, 124, 28], min: 1, max: 2, reservable: true, note: "사랑방 옆 볕이 오래 드는 자리입니다." },
  { id: "byeolchae", name: "별채", type: "입식 큰 상", rect: [64, 292, 150, 96], min: 6, max: 10, reservable: true, note: "모임용 별채입니다. 대관료는 없고 한 분에 한 메뉴씩 주문해 주세요." },
];

const SLOTS = ["11:00", "13:00", "15:00", "17:00", "19:00"];

function hash(s: string) {
  let x = 0;
  for (const c of s) x = (x * 31 + c.charCodeAt(0)) >>> 0;
  return x;
}

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
function initial(ch: string) {
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return "*";
  return CHO[Math.floor(code / 588)];
}
/** 병원식 이름 가리기: 김하늘 → 김ㅎ늘 */
function maskName(name: string) {
  const s = [...name.trim()];
  if (s.length < 2) return name.trim();
  if (s.length === 2) return s[0] + initial(s[1]);
  return s[0] + s.slice(1, -1).map(initial).join("") + s[s.length - 1];
}
function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  return `${d.slice(0, 3)}-****-${d.slice(-4)}`;
}

/* ---------- 공통 장식 ---------- */

function BrushRule({ className = "", color = "#1f1b16" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 400 10" preserveAspectRatio="none" className={className} aria-hidden>
      <path d="M2 6 C 60 2, 140 3, 220 4.5 S 360 6.5, 398 4 L 398 5.5 C 340 8.5, 240 7, 160 7.5 S 40 8.5, 2 7.5 Z" fill={color} />
    </svg>
  );
}

function Seal({ lines, size = 64, className = "" }: { lines: string[]; size?: number; className?: string }) {
  return (
    <span
      className={`tracking-[-0.02em] inline-flex items-center justify-center rounded-[6px] border-2 border-[#f3ede2]/50 bg-[#a8432a] text-[#f8efe4] shadow-[inset_0_0_0_3px_#a8432a,inset_0_0_0_4px_rgba(248,239,228,0.6)] ${className}`}
      style={{ width: size, height: size, writingMode: "vertical-rl", fontSize: size / 4.2, lineHeight: 1.05 }}
      aria-hidden
    >
      {lines.map((l) => (
        <span key={l} className="font-bold">
          {l}
        </span>
      ))}
    </span>
  );
}

function LogoMark() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
      <path
        d="M20 4.5c8.9 0 15.6 6.6 15.4 15.7-.2 8.7-6.9 15.4-15.6 15.3C11 35.4 4.6 28.7 4.6 20 4.7 11 11.2 4.5 20 4.5Z"
        fill="#f8f2e7"
        stroke="#1f1b16"
        strokeWidth="2.2"
      />
      <circle cx="27.5" cy="12.5" r="3" fill="#a8432a" />
    </svg>
  );
}

/* ---------- 데모 ---------- */

export function HanokCafeDemo() {
  const minute = useMinute();
  const status = openStatus(minute);

  return (
    <div
      className="min-h-screen bg-[#f3ede2] text-[17px] leading-[1.6] text-[#1f1b16]"
      style={{ backgroundImage: PAPER_TEXTURE }}
    >
      <Header />
      <main>
        <Hero status={status} />
        <MenuSection />
        <SpaceSection />
        <ReserveSection minute={minute} />
        <Location />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();
  return (
    <header className="sticky top-0 z-40 border-b border-[#1f1b16]/10 bg-[#f3ede2]/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <LogoMark />
          <span className={`text-[20px] font-bold tracking-[-0.01em]`}>{CAFE}</span>
        </a>
        <nav aria-label="주 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-8 text-[16px]">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="transition-colors hover:text-[#a8432a]">
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a href={`tel:${TEL}`} className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#1f1b16] px-3.5 py-2 text-[15px] text-[#f3ede2]">
                <Phone size={15} aria-hidden />
                {TEL}
              </a>
            </li>
          </ul>
        </nav>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center md:hidden"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="cafe-mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="cafe-mobile-menu"
            aria-label="주 메뉴"
            className="overflow-hidden border-t border-[#1f1b16]/10 md:hidden"
            initial={reduce ? false : { height: 0 }}
            animate={{ height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <ul className="px-4 py-2">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} onClick={() => setOpen(false)} className="flex h-12 items-center border-b border-[#1f1b16]/8 text-[17px]">
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={`tel:${TEL}`} className="flex h-12 items-center gap-2 text-[17px]">
                  <Phone size={17} aria-hidden />
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

function HanjiDoor({ side }: { side: "left" | "right" }) {
  return (
    <div
      className="absolute inset-y-0 w-1/2 border-[6px] border-[#5a4130]"
      style={{
        [side]: 0,
        backgroundColor: "#efe5d0",
        backgroundImage:
          "linear-gradient(#5a4130 2px, transparent 2px), linear-gradient(90deg, #5a4130 2px, transparent 2px)",
        backgroundSize: "54px 70px",
        backgroundPosition: "-1px -1px",
      }}
    />
  );
}

function Hero({ status }: { status: ReturnType<typeof openStatus> }) {
  const reduce = useReducedMotionSafe();
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 pb-14 pt-10 sm:px-6 lg:min-h-[640px] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-0 lg:pb-0 lg:pt-0">
        <div className="relative z-10 flex flex-col justify-center lg:py-20 lg:pr-10">
          <div>
            <div>
              <h1 className={`text-[44px] font-bold leading-[1.2] tracking-[-0.02em] sm:text-[56px]`}>
                ○○
                <br />
                한옥 찻집
              </h1>
              <BrushRule className="mt-5 h-2.5 w-40" color="#a8432a" />
              <p className="mt-6 max-w-[30em] text-[17px] text-[#4a4036]">
                1962년에 지은 ㄱ자 한옥을 고쳐 차와 커피, 우리 디저트를 냅니다. 마당이 보이는 툇마루와 신발을 벗고 앉는 좌식 방이 있습니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#reserve" className="inline-flex h-12 items-center rounded-[4px] bg-[#1f1b16] px-6 text-[16px] font-semibold text-[#f3ede2] transition-colors hover:bg-[#a8432a]">
                  자리 예약
                </a>
                <a href="#menu" className="inline-flex h-12 items-center rounded-[4px] border border-[#1f1b16]/30 px-6 text-[16px] font-semibold transition-colors hover:border-[#1f1b16]">
                  차림표 보기
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="relative lg:-mr-[max(24px,calc((100vw-1200px)/2+24px))]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] sm:aspect-[16/10] lg:absolute lg:inset-0 lg:aspect-auto lg:rounded-none">
            <Image
              src={`${IMG}/hero.jpg`}
              alt="창호지 문을 열어 둔 한옥 마루에 찻주전자와 청자 찻잔, 약과가 놓인 모습"
              fill
              priority
              sizes="(min-width:1024px) 60vw, 100vw"
              className="object-cover object-[78%_50%] lg:object-[70%_50%]"
            />
            {!reduce && (
              <>
                <motion.div className="absolute inset-0" initial={{ x: 0 }} animate={{ x: "-100%" }} transition={{ duration: 1.1, delay: 0.25, ease: EASE_IN_OUT }}>
                  <HanjiDoor side="left" />
                </motion.div>
                <motion.div className="absolute inset-0" initial={{ x: 0 }} animate={{ x: "100%" }} transition={{ duration: 1.1, delay: 0.25, ease: EASE_IN_OUT }}>
                  <HanjiDoor side="right" />
                </motion.div>
              </>
            )}
          </div>

          <motion.div
            className="relative z-10 -mt-10 ml-4 mr-4 rounded-[6px] border border-[#1f1b16]/10 bg-[#f8f3ea] p-5 shadow-[0_18px_40px_-24px_rgba(31,27,22,0.45)] sm:ml-auto sm:mr-6 sm:w-[300px] lg:absolute lg:bottom-10 lg:left-[-56px] lg:m-0"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2, ease: EASE }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[14px] text-[#6b5a48]">{status ? `오늘 ${WEEKDAY[status.day]}요일` : "오늘"}</p>
                <p className={`tracking-[-0.02em] mt-1 text-[26px] font-bold leading-tight`}>
                  {status?.day === 1 ? "쉬는 날" : "11:00 ~ 21:00"}
                </p>
              </div>
              <Seal lines={["○○", "찻집"]} size={48} className="-rotate-3" />
            </div>
            <p className="mt-3 flex min-h-[24px] items-center gap-2 text-[15px]">
              {status && (
                <>
                  <span className={`h-2 w-2 shrink-0 rounded-full ${status.open ? "bg-[#3f5a3c]" : "bg-[#a8432a]"}`} aria-hidden />
                  {status.text}
                </>
              )}
            </p>
            <p className="mt-1 text-[14px] text-[#6b5a48]">월요일과 설, 추석 당일은 쉽니다</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 차림표 ---------- */

function Token<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const reduce = useReducedMotionSafe();
  const index = options.findIndex((o) => o.v === value);
  const current = options[index];
  const next = options[(index + 1) % options.length];
  return (
    <button
      type="button"
      onClick={() => onChange(next.v)}
      className="group relative mx-1 inline-flex flex-col items-center align-baseline"
      aria-label={`${label}: ${current.label}. 누르면 ${next.label}(으)로 바뀝니다`}
    >
      <span className="relative inline-grid overflow-hidden px-1 text-[#a8432a]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={current.v}
            className="col-start-1 row-start-1 whitespace-nowrap"
            initial={reduce ? false : { y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {current.label}
          </motion.span>
        </AnimatePresence>
      </span>
      <BrushRule className="-mt-1 h-2 w-full transition-opacity group-hover:opacity-100" color="#a8432a" />
      <span className="mt-1 flex gap-1" aria-hidden>
        {options.map((o) => (
          <span key={o.v} className={`h-1 w-1 rounded-full ${o.v === value ? "bg-[#a8432a]" : "bg-[#1f1b16]/20"}`} />
        ))}
      </span>
    </button>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <li className="py-3.5">
      <div className="flex items-baseline gap-3">
        <span className={`tracking-[-0.02em] text-[20px] font-bold`}>{item.name}</span>
        {item.season && <span className="rounded-[2px] border border-[#a8432a] px-1.5 text-[13px] leading-[1.6] text-[#a8432a]">가을</span>}
        <span className="mb-1 flex-1 border-b border-dotted border-[#1f1b16]/35" aria-hidden />
        <span className="text-[17px] font-semibold tabular-nums">{won(item.price)}</span>
      </div>
      <p className="mt-1 text-[15px] text-[#5b5045]">
        {item.temp === "any" ? "따뜻하게, 시원하게 · " : ""}
        {item.desc}
      </p>
    </li>
  );
}

function MenuSection() {
  const reduce = useReducedMotionSafe();
  const [temp, setTemp] = useState<"hot" | "cold">("hot");
  const [kind, setKind] = useState<Kind>("tea");
  const [sweet, setSweet] = useState<"no" | "yes">("no");
  const [showAll, setShowAll] = useState(false);

  const { items, relaxed } = useMemo(() => {
    const byTemp = MENU.filter((m) => m.kind === kind && (m.temp === temp || m.temp === "any"));
    const exact = byTemp.filter((m) => m.sweet === (sweet === "yes"));
    return exact.length ? { items: exact, relaxed: false } : { items: byTemp, relaxed: true };
  }, [temp, kind, sweet]);

  const comboKey = `${temp}-${kind}-${sweet}`;

  return (
    <section id="menu" className="scroll-mt-16 border-t border-[#1f1b16]/10 py-20 lg:py-28">
      <div className="mx-auto flex max-w-[1200px] gap-10 px-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <h2 className={`tracking-[-0.02em] text-[34px] font-bold leading-[1.3] sm:text-[40px]`}>오늘 많이 찾는 메뉴</h2>
          <p className="mt-3 text-[#5b5045]">10월부터 11월까지 홍시 빙수와 단호박 식혜를 함께 냅니다.</p>

          <ul className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
            {FEATURED.map((f, i) => (
              <li key={f.img} className={`flex gap-3 ${i === 1 ? "sm:mt-12" : i === 2 ? "sm:mt-5" : ""}`}>
                <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-[4px]">
                  <Image src={`${IMG}/${f.img}.jpg`} alt={f.alt} fill sizes="(min-width:640px) 30vw, 85vw" className="object-cover" />
                </div>
                <div className="flex flex-col items-center gap-3 pt-1">
                  <p className={`text-[20px] font-bold tracking-[0.12em]`} style={{ writingMode: "vertical-rl" }}>
                    {f.name}
                  </p>
                  <p className="text-[14px] font-semibold tabular-nums text-[#a8432a]" style={{ writingMode: "vertical-rl" }}>
                    {won(f.price)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-20 flex flex-wrap items-end justify-between gap-4">
            <h3 className={`tracking-[-0.02em] text-[26px] font-bold sm:text-[30px]`}>무엇을 드릴까요?</h3>
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              aria-pressed={showAll}
              className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-[#1f1b16]/25 px-4 text-[15px] font-medium transition-colors hover:border-[#1f1b16]"
            >
              {showAll ? <RotateCcw size={16} aria-hidden /> : <List size={16} aria-hidden />}
              {showAll ? "문장으로 고르기" : "차림표 전체 보기"}
            </button>
          </div>

          {showAll ? (
            <div className="mt-8 grid gap-10 lg:grid-cols-3">
              {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                <div key={k} className="flex gap-4">
                  <p className={`tracking-[-0.02em] shrink-0 text-[22px] font-bold text-[#a8432a]`} style={{ writingMode: "vertical-rl" }}>
                    {KIND_LABEL[k]}
                  </p>
                  <ul className="min-w-0 flex-1 divide-y divide-[#1f1b16]/10">
                    {MENU.filter((m) => m.kind === k).map((m) => (
                      <MenuRow key={m.name} item={m} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className={`tracking-[-0.02em] font-semibold mt-8 text-[24px] leading-[2.1] sm:text-[30px]`}>
                <Token label="온도" options={TOKENS.temp} value={temp} onChange={setTemp} />
                <Token label="종류" options={TOKENS.kind} value={kind} onChange={setKind} />
                중에
                <Token label="단맛" options={TOKENS.sweet} value={sweet} onChange={setSweet} />
                걸로 주세요
              </p>
              <p className="mt-2 text-[14px] text-[#6b5a48]">붉은 낱말을 누르면 바뀝니다</p>

              <div className="mt-8 max-w-[760px]">
                <div className="h-3.5 rounded-full bg-gradient-to-b from-[#7a5a3e] to-[#4a3424] shadow-[0_2px_4px_rgba(0,0,0,0.25)]" aria-hidden />
                <motion.div
                  key={comboKey}
                  className="mx-3 overflow-hidden bg-[#faf6ee] shadow-[inset_0_8px_10px_-8px_rgba(0,0,0,0.25)]"
                  initial={reduce ? false : { height: 0 }}
                  animate={{ height: "auto" }}
                  transition={{ duration: 0.7, ease: EASE_IN_OUT }}
                >
                  <div className="px-5 py-4 sm:px-8" aria-live="polite">
                    <p className="pt-2 text-[15px] text-[#6b5a48]">
                      {relaxed
                        ? `${TOKENS.sweet.find((s) => s.v === sweet)?.label} ${TOKENS.temp.find((s) => s.v === temp)?.label} ${KIND_LABEL[kind]}는 없어서 비슷한 메뉴를 보여 드려요`
                        : `${items.length}가지가 있어요`}
                    </p>
                    <ul className="divide-y divide-[#1f1b16]/10">
                      {items.map((m) => (
                        <MenuRow key={m.name} item={m} />
                      ))}
                    </ul>
                  </div>
                </motion.div>
                <div className="h-3.5 rounded-full bg-gradient-to-b from-[#7a5a3e] to-[#4a3424] shadow-[0_2px_4px_rgba(0,0,0,0.25)]" aria-hidden />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- 공간 ---------- */

const SPACE_FACTS = [
  ["좌석", "34석 (좌식 방 3개, 툇마루 3자리, 대청마루, 별채)"],
  ["좌식 방", "신발을 벗고 들어가며 등받이 방석이 있습니다"],
  ["아이와 함께", "아기 의자 2개가 있고 기저귀 갈이대는 화장실에 있습니다"],
  ["반려동물", "마당 자리에서만 함께 머물 수 있습니다"],
  ["화장실", "건물 안, 남녀 구분"],
];

function SpaceSection() {
  return (
    <section id="space" className="scroll-mt-16 bg-[#1f1b16] py-20 text-[#efe7da] lg:py-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] lg:aspect-[16/11]">
            <Image src={`${IMG}/yard.jpg`} alt="기와지붕 아래 툇마루와 소나무가 있는 한옥 마당" fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover" />
          </div>
          <div>
            <div>
              <div>
                <h2 className={`tracking-[-0.02em] text-[32px] font-bold leading-[1.35] sm:text-[38px]`}>
                  마당을 가운데 둔
                  <br />ㄱ자 한옥
                </h2>
                <p className="mt-4 text-[#cfc4b4]">
                  기와와 서까래는 그대로 살리고 바닥 난방과 창만 새로 했습니다. 겨울에는 방마다 따뜻하게 불을 넣습니다.
                </p>
              </div>
            </div>
            <BrushRule className="mt-8 h-2 w-full opacity-40" color="#efe7da" />
            <dl className="mt-4 divide-y divide-[#efe7da]/12">
              {SPACE_FACTS.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[96px_1fr] gap-3 py-3 text-[16px]">
                  <dt className="text-[#d98b6f]">{k}</dt>
                  <dd className="text-[#efe7da]">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 자리 예약 ---------- */

interface DayOption {
  key: string;
  label: string;
  sub: string;
  isToday: boolean;
}

function nextDays(minute: number): DayOption[] {
  if (minute < 0) return [];
  const base = new Date(minute * 60_000);
  base.setHours(0, 0, 0, 0);
  const out: DayOption[] = [];
  for (let i = 0; out.length < 7 && i < 10; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    if (d.getDay() === 1) continue;
    out.push({
      key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      label: i === 0 ? "오늘" : i === 1 ? "내일" : `${d.getMonth() + 1}.${d.getDate()}`,
      sub: `${WEEKDAY[d.getDay()]}요일`,
      isToday: i === 0,
    });
  }
  return out;
}

interface Booking {
  space: Space;
  day: DayOption;
  time: string;
  people: number;
  name: string;
  phone: string;
}

function FloorPlan({
  selected,
  ink,
  inkKey,
  onPick,
}: {
  selected: SpaceId | null;
  inkKey: number;
  ink: { x: number; y: number } | null;
  onPick: (id: SpaceId, point: { x: number; y: number } | null) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotionSafe();

  const toPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  return (
    <svg ref={svgRef} viewBox="0 0 640 440" className="h-auto w-full select-none" role="group" aria-label="한옥 평면도. 방이나 자리를 눌러 고르세요">
      <defs>
        {SPACES.map((s) => (
          <clipPath key={s.id} id={`cafe-clip-${s.id}`}>
            <rect x={s.rect[0]} y={s.rect[1]} width={s.rect[2]} height={s.rect[3]} rx={3} />
          </clipPath>
        ))}
      </defs>

      {/* 마당 */}
      <rect x={40} y={215} width={415} height={185} rx={4} fill="#e6dcc7" />
      <g fill="#d3c6ab">
        <ellipse cx={270} cy={262} rx={14} ry={8} />
        <ellipse cx={296} cy={300} rx={14} ry={8} />
        <ellipse cx={286} cy={342} rx={14} ry={8} />
        <ellipse cx={282} cy={384} rx={14} ry={8} />
      </g>
      <g aria-hidden>
        <circle cx={385} cy={285} r={34} fill="#3f5a3c" opacity={0.85} />
        <circle cx={405} cy={268} r={22} fill="#4f6d4a" opacity={0.9} />
        <rect x={382} y={312} width={6} height={22} fill="#5a4130" />
        <circle cx={420} cy={370} r={14} fill="#b08850" />
      </g>
      <text x={330} y={360} fontSize={16} fill="#6b5a48" fontWeight={700}>
        마당
      </text>

      {/* 대문 */}
      <rect x={250} y={398} width={64} height={14} fill="#5a4130" />
      <text x={282} y={432} fontSize={14} fill="#6b5a48" textAnchor="middle">
        대문
      </text>

      {/* 툇마루 바닥 */}
      <rect x={40} y={170} width={430} height={42} fill="#d9c29b" />

      {/* 주문하는 곳 */}
      <rect x={440} y={40} width={160} height={130} fill="#cdbfa6" stroke="#1f1b16" strokeWidth={2} />
      <text x={520} y={110} fontSize={16} textAnchor="middle" fill="#4a4036">
        주문하는 곳
      </text>

      {SPACES.map((s) => {
        const [x, y, w, h] = s.rect;
        const isSel = selected === s.id;
        const cx = x + w / 2;
        const cy = y + h / 2;
        const small = h < 40;
        return (
          <g
            key={s.id}
            role="button"
            tabIndex={0}
            aria-pressed={isSel}
            aria-label={`${s.name}, ${s.type}${s.reservable ? `, ${s.min}~${s.max}명` : ", 예약 없이 이용"}`}
            className="cursor-pointer outline-none [&:focus-visible>rect:first-of-type]:stroke-[#a8432a] [&:focus-visible>rect:first-of-type]:stroke-[4]"
            onClick={(e) => onPick(s.id, toPoint(e.clientX, e.clientY))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPick(s.id, null);
              }
            }}
          >
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={3}
              fill={s.reservable ? "#f8f2e7" : "#ece2cf"}
              stroke="#1f1b16"
              strokeWidth={2}
              strokeDasharray={s.reservable ? undefined : "6 5"}
            />
            {isSel && (
              <g clipPath={`url(#cafe-clip-${s.id})`}>
                <motion.circle
                  key={inkKey}
                  cx={ink?.x ?? cx}
                  cy={ink?.y ?? cy}
                  fill="#1f1b16"
                  initial={reduce ? false : { r: 0 }}
                  animate={{ r: 280 }}
                  transition={{ duration: 0.65, ease: EASE }}
                />
              </g>
            )}
            <text
              x={cx}
              y={small ? cy + 6 : cy - 4}
              fontSize={small ? 15 : 18}
              fontWeight={700}
              textAnchor="middle"
              fill={isSel ? "#f3ede2" : "#1f1b16"}
              style={{ transition: "fill 200ms" }}
            >
              {s.name}
            </text>
            {!small && (
              <text x={cx} y={cy + 20} fontSize={14} textAnchor="middle" fill={isSel ? "#d9cfc0" : "#6b5a48"} style={{ transition: "fill 200ms" }}>
                {s.reservable ? `${s.type} ${s.min}~${s.max}명` : "예약 없이"}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ReserveSection({ minute }: { minute: number }) {
  const reduce = useReducedMotionSafe();
  const days = useMemo(() => nextDays(minute), [minute]);

  const [spaceId, setSpaceId] = useState<SpaceId | null>(null);
  const [ink, setInk] = useState<{ x: number; y: number } | null>(null);
  const [inkKey, setInkKey] = useState(0);
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tried, setTried] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);

  const space = SPACES.find((s) => s.id === spaceId) ?? null;
  const day = days.find((d) => d.key === dayKey) ?? days[0] ?? null;
  const nowMinutes = minute < 0 ? 0 : (() => {
    const d = new Date(minute * 60_000);
    return d.getHours() * 60 + d.getMinutes();
  })();

  const slotState = (t: string): "open" | "full" | "past" => {
    if (!space || !day) return "open";
    const [hh, mm] = t.split(":").map(Number);
    if (day.isToday && hh * 60 + mm <= nowMinutes + 30) return "past";
    return hash(`${day.key}${space.id}${t}`) % 4 === 0 ? "full" : "open";
  };

  const pick = (id: SpaceId, point: { x: number; y: number } | null) => {
    const s = SPACES.find((v) => v.id === id)!;
    setSpaceId(id);
    setInk(point);
    setInkKey((k) => k + 1);
    setTime(null);
    setPeople((p) => Math.min(Math.max(p, s.min), s.max));
  };

  const digits = phone.replace(/\D/g, "");
  const nameOk = name.trim().length >= 2;
  const phoneOk = digits.length >= 10 && digits.length <= 11;
  const canSubmit = !!space?.reservable && !!day && !!time && slotState(time) === "open" && nameOk && phoneOk;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!canSubmit || !space || !day || !time) return;
    setBooking({ space, day, time, people, name: name.trim(), phone: digits });
  };

  const reset = () => {
    setBooking(null);
    setSpaceId(null);
    setInk(null);
    setTime(null);
    setName("");
    setPhone("");
    setTried(false);
  };

  return (
    <section id="reserve" className="scroll-mt-16 py-20 lg:py-28">
      <div className="mx-auto flex max-w-[1200px] gap-10 px-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <h2 className={`tracking-[-0.02em] text-[34px] font-bold leading-[1.3] sm:text-[40px]`}>어디에 앉으시겠어요?</h2>
          <p className="mt-3 max-w-[40em] text-[#5b5045]">
            좌식 방과 툇마루, 별채는 두 시간씩 예약할 수 있습니다. 대청마루는 예약 없이 오신 순서대로 앉습니다.
          </p>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              <div className="rounded-[6px] border border-[#1f1b16]/12 bg-[#f8f3ea] p-3 sm:p-5">
                <FloorPlan selected={spaceId} ink={ink} inkKey={inkKey} onPick={pick} />
              </div>
              <p className="mt-4 text-[14px] text-[#6b5a48]">목록에서 고르기</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {SPACES.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => pick(s.id, null)}
                      aria-pressed={spaceId === s.id}
                      className={`h-10 rounded-[4px] border px-3 text-[15px] transition-colors ${
                        spaceId === s.id ? "border-[#1f1b16] bg-[#1f1b16] text-[#f3ede2]" : "border-[#1f1b16]/20 hover:border-[#1f1b16]"
                      }`}
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <AnimatePresence mode="wait" initial={false}>
                {booking ? (
                  <motion.div
                    key="done"
                    className="relative rounded-[6px] border border-[#1f1b16]/15 bg-[#faf6ee] p-6 sm:p-8"
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <motion.div
                      className="absolute right-6 top-6"
                      initial={reduce ? false : { scale: 1.6, rotate: -18, opacity: 0 }}
                      animate={{ scale: 1, rotate: -6, opacity: 1 }}
                      transition={{ duration: 0.22, delay: 0.25, ease: [0.3, 1.4, 0.5, 1] }}
                    >
                      <Seal lines={["예약", "접수"]} size={68} />
                    </motion.div>
                    <h3 className={`tracking-[-0.02em] pr-20 text-[26px] font-bold leading-[1.35]`}>예약 신청을 받았습니다</h3>
                    <p className="mt-2 pr-20 text-[15px] text-[#5b5045]">확정되면 문자로 알려 드립니다.</p>
                    <dl className="mt-6 divide-y divide-[#1f1b16]/10 text-[16px]">
                      {[
                        ["자리", `${booking.space.name} (${booking.space.type})`],
                        ["날짜", `${booking.day.label === "오늘" || booking.day.label === "내일" ? booking.day.label + " " : ""}${booking.day.key.split("-").slice(1).join(".")} ${booking.day.sub}`],
                        ["시간", `${booking.time}부터 2시간`],
                        ["인원", `${booking.people}명`],
                        ["예약자", maskName(booking.name)],
                        ["연락처", maskPhone(booking.phone)],
                      ].map(([k, v]) => (
                        <div key={k} className="grid grid-cols-[72px_1fr] gap-3 py-2.5">
                          <dt className="text-[#6b5a48]">{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={reset}
                        aria-label="다시 예약하기"
                        title="다시 예약하기"
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#1f1b16]/25 transition-transform duration-300 hover:-rotate-180 motion-reduce:transition-none"
                      >
                        <RotateCcw size={18} aria-hidden />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={submit}
                    noValidate
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-7"
                  >
                    <div aria-live="polite">
                      {space ? (
                        <div>
                          <p className={`tracking-[-0.02em] text-[24px] font-bold`}>{space.name}</p>
                          <p className="mt-0.5 text-[15px] text-[#a8432a]">
                            {space.type}
                            {space.reservable ? ` · ${space.min}~${space.max}명` : ""}
                          </p>
                          <p className="mt-2 text-[16px] text-[#4a4036]">{space.note}</p>
                        </div>
                      ) : (
                        <p className="rounded-[4px] border border-dashed border-[#1f1b16]/25 px-4 py-5 text-[16px] text-[#5b5045]">
                          평면도에서 방이나 툇마루 자리를 눌러 주세요.
                        </p>
                      )}
                    </div>

                    {space?.reservable && (
                      <>
                        <fieldset>
                          <legend className="w-full text-[15px] font-semibold">날짜</legend>
                          <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
                            {days.map((d) => {
                              const active = day?.key === d.key;
                              return (
                                <button
                                  key={d.key}
                                  type="button"
                                  onClick={() => {
                                    setDayKey(d.key);
                                    setTime(null);
                                  }}
                                  aria-pressed={active}
                                  className={`flex h-[60px] min-w-[60px] shrink-0 flex-col items-center justify-center rounded-[4px] border text-[15px] transition-colors ${
                                    active ? "border-[#1f1b16] bg-[#1f1b16] text-[#f3ede2]" : "border-[#1f1b16]/20 hover:border-[#1f1b16]"
                                  }`}
                                >
                                  <span className="font-semibold">{d.label}</span>
                                  <span className={`text-[13px] ${active ? "text-[#d9cfc0]" : "text-[#6b5a48]"}`}>{d.sub}</span>
                                </button>
                              );
                            })}
                          </div>
                          <p className="mt-1.5 text-[13px] text-[#6b5a48]">월요일은 쉽니다</p>
                        </fieldset>

                        <fieldset>
                          <legend className="w-full text-[15px] font-semibold">시간 (2시간 이용)</legend>
                          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5">
                            {SLOTS.map((t) => {
                              const st = slotState(t);
                              const active = time === t;
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  disabled={st !== "open"}
                                  onClick={() => setTime(t)}
                                  aria-pressed={active}
                                  className={`flex h-12 flex-col items-center justify-center rounded-[4px] border text-[15px] transition-colors disabled:cursor-not-allowed ${
                                    active
                                      ? "border-[#a8432a] bg-[#a8432a] text-white"
                                      : st === "open"
                                        ? "border-[#1f1b16]/20 hover:border-[#1f1b16]"
                                        : "border-transparent bg-[#1f1b16]/5 text-[#1f1b16]/35"
                                  }`}
                                >
                                  <span className={st === "full" ? "line-through" : ""}>{t}</span>
                                  {st !== "open" && <span className="text-[11px] leading-none">{st === "full" ? "마감" : "지남"}</span>}
                                </button>
                              );
                            })}
                          </div>
                          {tried && !time && <p className="mt-1.5 text-[14px] text-[#a8432a]">시간을 골라 주세요.</p>}
                        </fieldset>

                        <fieldset>
                          <legend className="w-full text-[15px] font-semibold">인원</legend>
                          <div className="mt-2 inline-flex items-center rounded-[4px] border border-[#1f1b16]/20">
                            <button
                              type="button"
                              onClick={() => setPeople((p) => Math.max(space.min, p - 1))}
                              disabled={people <= space.min}
                              aria-label="한 명 줄이기"
                              className="inline-flex h-11 w-11 items-center justify-center disabled:opacity-30"
                            >
                              <Minus size={16} aria-hidden />
                            </button>
                            <span className="w-14 text-center text-[17px] font-semibold tabular-nums" aria-live="polite">
                              {people}명
                            </span>
                            <button
                              type="button"
                              onClick={() => setPeople((p) => Math.min(space.max, p + 1))}
                              disabled={people >= space.max}
                              aria-label="한 명 늘리기"
                              className="inline-flex h-11 w-11 items-center justify-center disabled:opacity-30"
                            >
                              <Plus size={16} aria-hidden />
                            </button>
                          </div>
                        </fieldset>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                          <label className="block">
                            <span className="text-[15px] font-semibold">예약자 이름</span>
                            <input
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              autoComplete="name"
                              placeholder="김하늘"
                              aria-invalid={tried && !nameOk}
                              className="mt-2 h-12 w-full rounded-[4px] border border-[#1f1b16]/25 bg-[#faf6ee] px-3 text-[16px] outline-none focus:border-[#1f1b16]"
                            />
                            {tried && !nameOk && <span className="mt-1 block text-[14px] text-[#a8432a]">이름을 두 글자 이상 적어 주세요.</span>}
                          </label>
                          <label className="block">
                            <span className="text-[15px] font-semibold">휴대전화</span>
                            <input
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="010-0000-0000"
                              aria-invalid={tried && !phoneOk}
                              className="mt-2 h-12 w-full rounded-[4px] border border-[#1f1b16]/25 bg-[#faf6ee] px-3 text-[16px] outline-none focus:border-[#1f1b16]"
                            />
                            {tried && !phoneOk && <span className="mt-1 block text-[14px] text-[#a8432a]">번호를 다시 확인해 주세요.</span>}
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-[#1f1b16] text-[16px] font-semibold text-[#f3ede2] transition-colors hover:bg-[#a8432a]"
                        >
                          <Check size={18} aria-hidden />
                          예약 신청
                        </button>
                        <p className="text-[14px] text-[#6b5a48]">예약 시간보다 15분 넘게 늦으시면 자리를 다른 손님께 안내할 수 있습니다.</p>
                      </>
                    )}
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

const WAY_STEPS = [
  "□□역 2번 출구로 나와 왼쪽으로 50m 걸어요.",
  "편의점을 끼고 12길 골목으로 들어가요.",
  "세탁소를 지나 골목 끝에서 오른쪽으로 꺾어요.",
  "파란 대문에 ○○ 현판이 걸린 집이 찻집이에요.",
];

function Location() {
  return (
    <section id="location" className="scroll-mt-16 border-t border-[#1f1b16]/10 py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <div>
          <h2 className={`tracking-[-0.02em] text-[34px] font-bold leading-[1.3] sm:text-[40px]`}>골목 안쪽에 있어요</h2>
          <p className="mt-3 text-[#5b5045]">지도 앱으로는 입구를 찾기 어렵습니다. 역에서 걸어서 6분이에요.</p>
          <ol className="mt-8 border-t border-[#1f1b16]/15">
            {WAY_STEPS.map((step, i) => (
              <li key={step} className="flex items-baseline gap-4 border-b border-[#1f1b16]/15 py-4">
                <span className="w-6 shrink-0 text-[20px] font-bold tabular-nums text-[#a8432a]">{i + 1}</span>
                <span className="text-[17px] leading-[1.6]">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[16px] text-[#4a4036]">
            전용 주차장이 없습니다. 골목 입구 □□공영주차장에 세우시면 2시간 할인권을 드려요.
          </p>
        </div>

        <div className="lg:pt-2">
          <p className="text-[17px] font-semibold">{ADDRESS}</p>
          <BrushRule className="mt-5 h-2 w-full opacity-25" />
          <dl className="mt-3 grid grid-cols-[96px_1fr] gap-y-2 text-[16px]">
            <dt className="text-[#6b5a48]">화 ~ 일</dt>
            <dd>11:00 ~ 21:00 (주문 마감 20:30)</dd>
            <dt className="text-[#6b5a48]">월요일</dt>
            <dd>쉽니다</dd>
            <dt className="text-[#6b5a48]">명절</dt>
            <dd>설, 추석 당일 쉽니다</dd>
          </dl>
          <a
            href={`tel:${TEL}`}
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-[4px] bg-[#1f1b16] px-6 text-[16px] font-semibold text-[#f3ede2] transition-colors hover:bg-[#a8432a]"
          >
            <Phone size={17} aria-hidden />
            {TEL}
          </a>
          <p className="mt-3 text-[15px] text-[#6b5a48]">골목에서 헤매시면 전화 주세요. 나가서 모셔 올게요.</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#1f1b16] py-10 text-[14px] leading-[1.8] text-[#b9ad9c]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className={`tracking-[-0.02em] text-[18px] font-bold text-[#efe7da]`}>{CAFE}</p>
          <p className="mt-2">
            대표 김○○ | 사업자등록번호 000-00-00000 | {ADDRESS} | {TEL}
          </p>
        </div>
        <Seal lines={["○○", "찻집"]} size={52} className="rotate-3 self-start" />
      </div>
    </footer>
  );
}
