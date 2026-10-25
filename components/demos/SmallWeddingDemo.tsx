"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useTransform } from "framer-motion";
import { Bus, Car, ChevronLeft, ChevronRight, DoorOpen, Flower2, Menu, MessageCircle, TrainFront, Trees, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 스몰웨딩 홀 홈페이지 샘플: 가상의 스몰웨딩 홀 곰파트너. 하객 30~120명, 홀 하나와 야외 정원, 식사와 꽃장식 패키지.
   상호, 주소, 직원, 손님 이름은 모두 가상이다.
   첫 화면 사진 출처: Pexels 사진 33104578

   국내 스몰웨딩 홀 사이트의 공통 구성을 따랐다. 메뉴는 공간 소개, 패키지와 비용, 예약 현황, 상담신청, 오시는 길.
   첫 화면에는 예약 가능한 날짜(토, 일 중심)와 시간대(11시, 13시, 15시, 17시)가 바로 보이고,
   패키지는 대관료 + 식사(1인 단가 x 하객 수) + 꽃장식 + 추가 옵션으로 적는다(부가세 별도 표기).
   하객 주차 2시간 무료, 신부 대기실, 지하철역 셔틀 운행은 거의 모든 홀이 적는 관용 문구다.

   첫 화면(sw-poster): 맨 위에 붙은 메뉴 아래 큰 공간 사진, 썸네일 투어(예식 테이블, 시간대별 홀), 남은 날짜 상자.
   사진은 1.6초 동안 scale 1.04 -> 1 로 천천히 다가온다. 동작 줄이기에서는 처음부터 정지 화면이다.
   글꼴은 Pretendard, h1 과 h2 는 굵게. 바탕은 흰색과 #f7f7f5 를 번갈아 쓰고 강조색은 올리브 하나.

   핵심 모션: 섹션 와이프(다음 섹션이 아래에서 clip-path로 덮으며 올라옴, 앞 섹션은 sticky로 뒤에 남음), D-day 숫자 롤링.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 날짜와 시간 고르기: 12개월 달력(토, 일 예약, 마감 표시)과 시간대 4개. 고르면 D-day가 롤링한다. 첫 화면의 남은 날짜와 홀 썸네일도 같은 값을 바꾼다.
   2. 하객 수에 따른 홀 배치: 슬라이더(30~120)에 맞춰 8인 원형 테이블이 평면도에 늘고 줄며, 야외 정원 사용을 켤 수 있다.
   3. 패키지 견적: 대관(시간대별), 식사(코스 또는 뷔페 x 하객 수), 꽃장식(기본, 풍성), 음향과 사진 추가. 합계 표시.
   4. 상담신청과 방문 예약: 두 사람 이름, 휴대폰, 희망 예식일, 방문 희망일. 완료 화면에 접수번호, 담당 창구, 회신 예정일.
   5. 공간 안내와 오시는 길: 홀, 정원, 신부 대기실, 주차, 지하철과 셔틀, 상담 운영시간(오늘 요일 진하게). */

const BRAND = "곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00";
const KAKAO = "카카오톡 채널 곰파트너";

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className={small ? "h-6 w-6 shrink-0" : "h-7 w-7 shrink-0"} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold tracking-[-0.03em]`}>곰파트너</span>
        <span className="text-[12px] font-semibold opacity-75">스몰웨딩 샘플</span>
      </span>
    </span>
  );
}
const IMG = "/images/demo-small-wedding";
const HALL_MIN = 30;
const HALL_MAX = 120;
const SEAT = 8;
const MONTHS = 12;
const HEADER_H = 56;

const C = {
  ivory: "#f7f7f5",
  ivoryDeep: "#ececea",
  paper: "#ffffff",
  olive: "#3f5a36",
  sage: "#9aa38f",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#6b6b6b",
  line: "#e5e5e5",
  error: "#b42318",
};

/* 제목은 본문과 같은 Pretendard, 굵게 */
const serif = { fontWeight: 700 } as const;

/* 모션 값(ms). 모두 reduce면 0 */
const EASE = [0.22, 1, 0.36, 1] as const;
const HERO_MS = 1600; // 사진이 scale 1.04 -> 1 로 다가오는 시간
const ROLL_MS = 650; // 숫자 롤링
const LIGHT_MS = 800; // 홀 사진의 시간대 전환
const TABLE_MS = 320; // 테이블 하나 등장
const TABLE_STAGGER_MS = 60; // 테이블 등장 간격
const WIPE_RADIUS = 8; // 와이프 윗모서리 둥글기(px)

const SLOTS = [
  { time: "11:00", rent: 2200000, note: "오전 햇빛", img: "hall-1100" },
  { time: "13:00", rent: 3000000, note: "가장 먼저 마감", img: "hall-1300" },
  { time: "15:00", rent: 2600000, note: "오후 햇빛", img: "hall-1500" },
  { time: "17:00", rent: 1500000, note: "노을과 조명", img: "hall-1700" },
];
const MEALS = [
  { id: "course", name: "코스", price: 85000, desc: "전채, 수프, 메인, 디저트 4코스" },
  { id: "buffet", name: "뷔페", price: 65000, desc: "한식과 양식 60여 가지" },
];
const FLOWERS = [
  { id: "basic", name: "기본", price: 1200000, desc: "단상 아치, 버진로드, 테이블 센터피스" },
  { id: "full", name: "풍성", price: 2500000, desc: "기본에 천장 설치와 포토존 추가" },
];
const EXTRAS = [
  { id: "sound", name: "음향과 사회자 마이크", price: 300000 },
  { id: "photo", name: "본식 스냅 사진", price: 800000 },
];
const GARDEN_FEE = 300000;

const DAY_MS = 86400000;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const DOW_FULL = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const manwon = (n: number) => `${Math.round(n / 10000).toLocaleString("ko-KR")}만원`;
const diffDays = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / DAY_MS);
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

function hash(n: number) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) % 1000;
}
const dayKey = (d: Date) => d.getFullYear() * 1000 + Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / DAY_MS);

/** 이미 예약된 시간대. 실제로는 예약 장부에서 읽는다. 가까운 날과 13시가 먼저 찬다. */
function slotTaken(today: Date, d: Date, i: number) {
  const diff = diffDays(d, today);
  const near = diff < 60 ? 520 : diff < 180 ? 330 : 200;
  return hash(dayKey(d) * 7 + i) < near + (i === 1 ? 150 : 0);
}
const dayFull = (today: Date, d: Date) => SLOTS.every((_, i) => slotTaken(today, d, i));

/** 처음 보여 줄 날: 넉 달쯤 뒤 첫 토요일 중 자리가 남은 날 */
function defaultDate(today: Date) {
  let d = daysAgo(today, -120);
  while (d.getDay() !== 6) d = daysAgo(d, -1);
  while (dayFull(today, d)) d = daysAgo(d, -7);
  return d;
}
function firstOpenSlot(today: Date, d: Date) {
  const order = [1, 2, 0, 3];
  return order.find((i) => !slotTaken(today, d, i)) ?? 1;
}
/** 다음 영업일. 상담은 월요일에 쉰다. */
function nextBizDay(today: Date) {
  let r = daysAgo(today, -1);
  if (r.getDay() === 1) r = daysAgo(r, -1);
  return r;
}

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const btnBase = `inline-flex items-center justify-center gap-1.5 font-bold transition-[background-color,color] duration-150 ${focusRing}`;

/* 테이블 자리. 버진로드(가운데) 가까운 앞줄부터 채운다. */
const COLS_L = [92, 152, 212];
const COLS_R = [308, 368, 428];
const ROWS = [132, 196, 260];
const SPOTS: [number, number][] = [];
for (const y of ROWS) for (let k = 0; k < 3; k++) SPOTS.push([COLS_L[2 - k], y], [COLS_R[k], y]);

type Pick = { date: Date | null; slot: number | null };
type Lead = { no: string; groom: string; bride: string; phone: string; wedding: string; visit: string };

export function SmallWeddingDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [pick, setPick] = useState<Pick>({ date: null, slot: null });
  const date = pick.date ?? defaultDate(today);
  const slot = pick.slot ?? firstOpenSlot(today, date);
  const dday = diffDays(date, today);

  const [guests, setGuests] = useState({ n: 80, from: 10 });
  const tables = Math.ceil(guests.n / SEAT);
  const [garden, setGarden] = useState(false);

  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  /** 겹쳐 있는 섹션은 getBoundingClientRect가 붙은 자리라서, 앞에 둔 기준 요소(id-top)의 위치로 옮긴다 */
  const go = (id: string) => {
    const mark = document.getElementById(`${id}-top`) ?? document.getElementById(id);
    if (!mark) return;
    const top = mark.getBoundingClientRect().top + window.scrollY - HEADER_H;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
  };

  /* 메뉴 이름은 실제 스몰웨딩 홀 사이트 표기(공간, 식사, 예식 안내, 남은 날짜, 방문 상담)를 따른다 */
  const NAV = [
    ["sw-hero", "남은 날짜"],
    ["sw-layout", "예식 안내"],
    ["sw-package", "식사와 비용"],
    ["sw-space", "공간"],
  ] as const;
  const [menu, setMenu] = useState(false);
  const nav = (id: string) => {
    setMenu(false);
    go(id);
  };

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.paper, color: C.ink }}>
      {/* 상단 메뉴와 스크롤 진행 바. 맨 위부터 붙어 있다. 휴대폰과 태블릿은 햄버거 */}
      <header className="sticky top-0 z-40 border-b" style={{ height: HEADER_H, background: C.paper, borderColor: C.line }}>
        <motion.div aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left" style={{ background: C.olive, scaleX: scrollYProgress }} />
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })} className={`${focusRing} leading-none`} style={{ outlineColor: C.olive }}>
            <SampleLogo />
          </button>
          <nav aria-label="메뉴" className="hidden items-center gap-1 text-[15px] lg:flex">
            {NAV.map(([id, label]) => (
              <button key={id} type="button" onClick={() => nav(id)} className={`${focusRing} min-h-11 rounded-[4px] px-3 underline-offset-4 hover:underline`} style={{ outlineColor: C.olive }}>
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => nav("sw-consult")}
              data-gtm-cta="small-wedding_consult_go"
              className={`${btnBase} min-h-11 rounded-[4px] px-4 text-[14px]`}
              style={{ background: C.olive, color: C.paper, outlineColor: C.olive, fontWeight: 600 }}
            >
              방문 상담
            </button>
            <button
              type="button"
              aria-expanded={menu}
              aria-controls="sw-menu-list"
              aria-label={menu ? "메뉴 닫기" : "메뉴 열기"}
              onClick={() => setMenu((m) => !m)}
              className={`${focusRing} inline-flex h-11 w-11 items-center justify-center rounded-[4px] border lg:hidden`}
              style={{ borderColor: C.line, outlineColor: C.olive }}
            >
              {menu ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
            </button>
          </div>
        </div>
        {menu && (
          <nav id="sw-menu-list" aria-label="메뉴 펼침" className="absolute inset-x-0 top-full border-b px-4 pb-4 pt-2 lg:hidden" style={{ background: C.paper, borderColor: C.line }}>
            <ul className="grid gap-1">
              {NAV.map(([id, label]) => (
                <li key={id}>
                  <button type="button" onClick={() => nav(id)} className={`${focusRing} flex min-h-11 w-full items-center rounded-[4px] px-3 text-left text-[16px] font-bold`} style={{ outlineColor: C.olive }}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <Poster
        reduce={reduce}
        today={today}
        date={date}
        slot={slot}
        onOpenDate={(d, i) => {
          setPick({ date: d, slot: i });
          go("sw-consult");
        }}
        go={go}
      />

      {/* 첫 화면. 겹침 없이 보통 흐름에 둔다. 가이드와 메뉴가 바로 찾아올 수 있게 */}
      <section id="sw-hero" aria-labelledby="sw-title" className="relative mx-auto grid max-w-[1200px] gap-10 px-4 pb-16 md:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12 lg:pb-24" style={{ paddingTop: 36 }}>
        <div className="min-w-0 lg:sticky lg:top-[88px]">
          {/* 상호와 소개 문장은 첫 화면 제목과 겹쳐 뺐다 */}
          <h2 id="sw-title" className="text-[30px] leading-[1.25] md:text-[38px]" style={{ ...serif, fontWeight: 700, color: C.ink }}>
            남은 날짜
          </h2>

          <div id="sw-dday" className="mt-6 rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.ivory }}>
            <p className="text-[14px] font-bold" style={{ color: C.muted }}>
              고른 예식일까지
            </p>
            <p className="mt-1 text-[56px] leading-none md:text-[72px]" style={{ fontWeight: 700, color: C.ink, letterSpacing: "-0.03em" }}>
              <Roll text={`D-${dday}`} reduce={reduce} />
            </p>
            <p className="mt-3 text-[17px] leading-[1.6]">
              {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일 <b>{DOW_FULL[date.getDay()]}</b> {SLOTS[slot].time}
              <span className="ml-2 text-[15px]" style={{ color: C.muted }}>
                {Math.floor(dday / 7)}주 {dday % 7}일 남음
              </span>
            </p>
          </div>

          {/* 홀 사진은 고른 시간대의 빛으로 바뀐다 */}
          <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-[4px]" style={{ background: C.ivoryDeep }}>
            {SLOTS.map((s, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다
              <img
                key={s.img}
                src={`${IMG}/${s.img}.jpg`}
                alt={i === slot ? `${s.time} 예식 때 아치창으로 빛이 드는 홀` : ""}
                aria-hidden={i !== slot}
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1024px) 580px, 100vw"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "55% 45%", opacity: i === slot ? 1 : 0, transition: reduce ? "none" : `opacity ${LIGHT_MS}ms ease` }}
              />
            ))}
          </div>
          <p className="mt-2 text-[14px]" style={{ color: C.body }} aria-live="polite">
            홀 {SLOTS[slot].time}, {SLOTS[slot].note}
          </p>
        </div>

        <div id="sw-date" className="min-w-0 rounded-[6px] border p-4 md:p-6" style={{ borderColor: C.line, background: C.paper }}>
          <h2 className="text-[22px]" style={{ ...serif, fontWeight: 700 }}>
            예약 현황
          </h2>
          <Calendar today={today} date={date} onPick={(d) => setPick({ date: d, slot: slotTaken(today, d, slot) ? null : slot })} />
          <p className="mt-5 text-[15px] font-bold">시간대</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="예식 시간대">
            {SLOTS.map((s, i) => {
              const taken = slotTaken(today, date, i);
              const on = i === slot;
              return (
                <button
                  key={s.time}
                  type="button"
                  disabled={taken}
                  aria-pressed={on}
                  onClick={() => setPick({ date, slot: i })}
                  className={`${focusRing} rounded-[4px] border px-2 py-2.5 text-left leading-[1.4] disabled:cursor-not-allowed`}
                  style={{
                    borderColor: on ? C.olive : C.line,
                    background: on ? C.olive : taken ? C.ivoryDeep : C.paper,
                    color: on ? C.paper : taken ? C.muted : C.ink,
                    outlineColor: C.olive,
                  }}
                >
                  <span className="block text-[17px] font-bold tabular-nums">{s.time}</span>
                  <span className="block text-[13px]">{taken ? "마감" : `대관 ${manwon(s.rent)}`}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => go("sw-consult")}
            data-gtm-cta="small-wedding_date_consult"
            className={`${btnBase} mt-5 w-full rounded-[4px] py-3 text-[16px]`}
            style={{ background: C.olive, color: C.paper, outlineColor: C.olive, fontWeight: 600 }}
          >
            이 날짜로 상담신청
          </button>
          <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
            평일 예식은 상담으로 문의해 주세요. 조기 마감될 수 있습니다.
          </p>
        </div>
      </section>

      {/* 아래 섹션들은 sticky로 겹치고, 다음 섹션이 clip-path 와이프로 덮으며 올라온다. 첫 와이프가 걷히기 전 바탕은 짙은 올리브 */}
      <div className="relative" style={{ background: C.paper }}>
        <Panel id="sw-layout" z={2} bg={C.ivory} color={C.ink} reduce={reduce}>
          <LayoutSection guests={guests} setGuests={setGuests} tables={tables} garden={garden} setGarden={setGarden} reduce={reduce} />
        </Panel>

        <Panel id="sw-package" z={3} bg={C.paper} color={C.ink} reduce={reduce}>
          <PackageSection slot={slot} guests={guests.n} garden={garden} />
        </Panel>

        <Panel id="sw-space" z={4} bg={C.ivory} color={C.ink} reduce={reduce}>
          <SpaceSection today={today} />
        </Panel>

        <Panel id="sw-consult" z={5} bg={C.paper} color={C.ink} reduce={reduce}>
          <ConsultSection today={today} date={date} />
        </Panel>
      </div>

      <footer className="relative z-10 border-t px-4 pb-24 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ background: C.ivory, borderColor: C.line, color: C.muted }}>
        <div className="mx-auto max-w-[1200px]">
          <p>
            <SampleLogo />
          </p>
          <p>
            {ADDRESS}, 상담 화~일 10:00~19:00, 월요일 휴무, {KAKAO}
          </p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

/* 첫 화면: 큰 공간 사진 + 아래 공간 썸네일(테이블, 가든, 신부대기실, 연회장, 포토존) + 오른쪽 위 남은 날짜 상자.
   실제 스몰웨딩 홀 사이트의 공간별 썸네일 홀 투어와 잔여 타임 공지를 한 화면에 모았다.
   썸네일을 누르면 큰 사진이 그 공간으로 바뀌고(0.8초 교차) 썸네일 아래에 수용 인원 한 줄이 바뀐다.
   홀의 시간대별 사진은 아래 예약 현황에서 시간대를 고를 때 바뀐다.
   남은 날짜를 누르면 날짜와 시간대가 고른 값으로 바뀌고 방문 상담 신청으로 내려가 희망 예식일이 채워진다.
   휴대폰은 사진 4:3, 남은 날짜는 썸네일 아래 가로로 넘기는 칩, 첫 화면이 보이는 동안 하단에 방문 상담 버튼을 고정한다.
   모션: 사진만 1.04배에서 1.6초 동안 천천히 다가온다. 동작 줄이기면 멈춘 사진, 교차 없이 바로 바뀐다. */
const VIEWS = [
  { key: "table", img: "hero", sm: "hero-sm", label: "테이블", line: "기본 꽃장식, 테이블 센터피스 포함", alt: "분홍 장미와 유칼립투스로 꾸민 예식 테이블과 하객 의자", pos: "55% 45%" },
  { key: "garden", img: "garden", sm: "garden", label: "가든", line: "야외 의자 40석, 식전 음료와 사진 촬영", alt: "잔디 위 흰 꽃 아치와 접이식 흰 의자 줄", pos: "45% 55%" },
  { key: "bride", img: "bride-room", sm: "bride-room", label: "신부대기실", line: "2실, 가족 대기 소파와 다과", alt: "흰 커튼 창 앞 아이보리 소파와 흰 장미 꽃병", pos: "50% 60%" },
  { key: "banquet", img: "banquet", sm: "banquet", label: "연회장", line: `${SEAT}인 원형 테이블, 하객 ${HALL_MAX}명까지`, alt: "흰 테이블보를 씌운 원형 테이블과 작은 꽃 센터피스", pos: "50% 50%" },
  { key: "photozone", img: "photozone", sm: "photozone", label: "포토존", line: "생화 아치와 원목 벤치, 창가 자연광", alt: "흰 벽 앞 초록 잎과 흰 꽃 아치, 원목 벤치", pos: "50% 50%" },
];

function Poster({
  reduce,
  today,
  date,
  slot,
  onOpenDate,
  go,
}: {
  reduce: boolean;
  today: Date;
  date: Date;
  slot: number;
  onOpenDate: (d: Date, i: number) => void;
  go: (id: string) => void;
}) {
  const [view, setView] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const v = VIEWS[view];

  /* 앞으로 3개월 안 토, 일 중 남은 시간대. 가장 가까운 4개 */
  const open: { d: Date; i: number }[] = [];
  for (let n = 1; n <= 92 && open.length < 4; n++) {
    const d = daysAgo(today, -n);
    if (!isWeekend(d)) continue;
    const i = SLOTS.findIndex((_, k) => !slotTaken(today, d, k));
    if (i >= 0) open.push({ d, i });
  }
  const picked = (d: Date, i: number) => sameDay(d, date) && i === slot;
  const dateBtn = (o: { d: Date; i: number }) => {
    const on = picked(o.d, o.i);
    return (
      <button
        key={o.d.getTime()}
        type="button"
        aria-pressed={on}
        onClick={() => onOpenDate(o.d, o.i)}
        className={`${focusRing} flex min-h-11 flex-none items-center justify-between gap-3 rounded-[4px] border px-3 py-2 text-left text-[15px]`}
        style={{ borderColor: on ? C.olive : C.line, background: on ? C.olive : C.paper, color: on ? C.paper : C.ink, outlineColor: C.olive }}
      >
        <span className="font-bold tabular-nums">
          {o.d.getMonth() + 1}월 {o.d.getDate()}일 ({DOW[o.d.getDay()]})
        </span>
        <span className="tabular-nums">{SLOTS[o.i].time}</span>
      </button>
    );
  };

  return (
    <section ref={ref} id="sw-poster" aria-labelledby="sw-poster-title" style={{ background: C.ivory }}>
      <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-5 md:px-6 md:pb-12 md:pt-6">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <h1 id="sw-poster-title" className="text-[24px] leading-[1.3] [word-break:keep-all] md:text-[32px]" style={{ ...serif, color: C.ink, letterSpacing: "-0.03em" }}>
            하객 30명부터 120명, 홀 하나와 야외 정원
          </h1>
          <p className="text-[15px]" style={{ color: C.muted }}>
            {BRAND}, ㅇㅇ역 3번 출구 걸어서 5분
          </p>
        </div>

        {/* 큰 사진 + 남은 날짜 상자(PC는 사진 오른쪽 위) */}
        <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-[6px] md:aspect-auto md:h-[max(400px,calc(100svh-380px))]" style={{ background: C.ivoryDeep }}>
          <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.04 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : HERO_MS / 1000, ease: EASE }}>
            {VIEWS.map((x, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다
              <img
                key={x.key}
                src={`${IMG}/${x.img}.jpg`}
                srcSet={x.img === "hero" ? `${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w` : undefined}
                sizes="(min-width: 1200px) 1150px, 100vw"
                alt={i === view ? x.alt : ""}
                aria-hidden={i !== view}
                fetchPriority={i === 0 ? "high" : undefined}
                loading={i === 0 ? undefined : "lazy"}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: x.pos, opacity: i === view ? 1 : 0, transition: reduce ? "none" : `opacity ${LIGHT_MS}ms ease` }}
              />
            ))}
          </motion.div>
          <div className="absolute right-4 top-4 hidden w-[260px] rounded-[6px] border p-4 md:block" style={{ background: C.paper, borderColor: C.line }}>
            <p className="text-[15px] font-bold">남은 날짜</p>
            <p className="mt-0.5 text-[13px]" style={{ color: C.muted }}>
              3개월 안 토, 일
            </p>
            <div className="mt-3 grid gap-1.5">{open.map(dateBtn)}</div>
          </div>
        </div>

        {/* 썸네일 투어 */}
        <div role="group" aria-label="공간 사진" className="mt-3 grid grid-cols-5 gap-1.5 md:grid-cols-[repeat(5,minmax(0,168px))] md:gap-3">
          {VIEWS.map((x, i) => {
            const on = i === view;
            return (
              <button
                key={x.key}
                type="button"
                aria-pressed={on}
                onClick={() => setView(i)}
                className={`${focusRing} min-w-0 text-left`}
                style={{ outlineColor: C.olive }}
              >
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[4px] border-2" style={{ borderColor: on ? C.olive : "transparent" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                  <img src={`${IMG}/${x.sm}.jpg`} alt="" aria-hidden loading="lazy" decoding="async" sizes="(min-width: 768px) 168px, 20vw" className="h-full w-full object-cover" style={{ objectPosition: x.pos }} />
                </span>
                <span className="mt-1 block truncate text-[13px] md:text-[15px]" style={{ fontWeight: on ? 700 : 400, color: on ? C.ink : C.body }}>
                  {x.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[15px]" style={{ color: C.body }} aria-live="polite">
          {v.label}, {v.line}
        </p>

        {/* 휴대폰: 남은 날짜 칩 */}
        <div className="mt-4 md:hidden">
          <p className="text-[15px] font-bold">남은 날짜</p>
          <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">{open.map(dateBtn)}</div>
        </div>
      </div>

      {/* 휴대폰 하단 고정 바: 첫 화면이 보일 때만 */}
      {inView && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t px-4 pt-3 md:hidden" style={{ background: C.paper, borderColor: C.line, paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}>
          <button type="button" onClick={() => go("sw-consult")} data-gtm-cta="small-wedding_poster_cta" className={`${btnBase} min-h-11 w-full rounded-[4px] text-[16px]`} style={{ background: C.olive, color: C.paper, outlineColor: C.olive, fontWeight: 600 }}>
            방문 상담
          </button>
        </div>
      )}
    </section>
  );
}
/* 겹침 섹션. 앞 섹션은 화면에 붙어 남고(화면보다 길면 바닥을 맞춰 붙는다), 이 섹션은 아래에서 올라오며
   위쪽이 clip-path로 가려져 있다가 위치에 따라 걷힌다. 가려지는 높이 = 섹션 윗변의 화면 위치라서 걷히는 선이 스크롤의 두 배 속도로 올라간다. */
function Panel({ id, z, bg, color, reduce, children }: { id: string; z: number; bg: string; color: string; reduce: boolean; children: React.ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [top, setTop] = useState(0);
  const start = useMotionValue(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    if (!el) return;
    const mark = el.previousElementSibling as HTMLElement | null;
    const measure = () => {
      setTop(Math.min(0, window.innerHeight - el.offsetHeight));
      if (mark) start.set(mark.getBoundingClientRect().top + window.scrollY);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [el, start]);

  const clip = useTransform([scrollY, start], ([s, st]) => {
    const y = Math.max(0, (st as number) - (s as number));
    const r = Math.min(WIPE_RADIUS, y);
    return `inset(${y}px 0 0 0 round ${r}px ${r}px 0 0)`;
  });

  return (
    <>
      <div id={`${id}-top`} aria-hidden className="h-0" />
      <motion.section
        id={id}
        ref={setEl}
        aria-labelledby={`${id}-title`}
        style={{
          background: bg,
          color,
          zIndex: z,
          position: reduce ? "relative" : "sticky",
          top: reduce ? undefined : top,
          clipPath: reduce ? "none" : clip,
        }}
      >
        {/* 짧은 섹션은 한 화면 높이를 채우고 내용을 세로 가운데에 둔다 */}
        <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col justify-center px-4 pb-20 md:px-6" style={{ paddingTop: HEADER_H + 40 }}>
          {children}
        </div>
      </motion.section>
    </>
  );
}

/* 숫자 롤링. 숫자 자리마다 0~9 띠가 세로로 움직인다. 글자 수가 바뀌면 오른쪽 자리부터 그대로 둔다 */
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
function Roll({ text, reduce }: { text: string; reduce: boolean }) {
  const chars = text.split("");
  return (
    <span className="inline-flex tabular-nums">
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex" style={{ lineHeight: 1 }}>
        {chars.map((ch, i) => {
          const key = chars.length - i;
          if (!/\d/.test(ch)) return <span key={`c${key}`}>{ch}</span>;
          return (
            <span key={`d${key}`} className="relative inline-block overflow-hidden" style={{ height: "1em", width: "1ch" }}>
              <motion.span className="absolute left-0 top-0 block" initial={false} animate={{ y: `${-Number(ch)}em` }} transition={reduce ? { duration: 0 } : { duration: ROLL_MS / 1000, ease: EASE }}>
                {DIGITS.map((n) => (
                  <span key={n} className="block" style={{ height: "1em", lineHeight: 1 }}>
                    {n}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
}

/* 달력: 오늘부터 12개월. 토, 일만 예약 버튼, 마감된 날은 표시만 */
function Calendar({ today, date, onPick }: { today: Date; date: Date; onPick: (d: Date) => void }) {
  const [off, setOff] = useState(4);
  const first = new Date(today.getFullYear(), today.getMonth() + off, 1);
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1))];
  const navBtn = `${focusRing} inline-flex h-9 w-9 items-center justify-center rounded-[4px] border disabled:opacity-40`;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => setOff((o) => Math.max(0, o - 1))} disabled={off === 0} aria-label="이전 달" className={navBtn} style={{ borderColor: C.line, outlineColor: C.olive }}>
          <ChevronLeft size={18} aria-hidden />
        </button>
        <p className="text-[18px] font-bold tabular-nums" aria-live="polite">
          {first.getFullYear()}년 {first.getMonth() + 1}월
        </p>
        <button type="button" onClick={() => setOff((o) => Math.min(MONTHS - 1, o + 1))} disabled={off === MONTHS - 1} aria-label="다음 달" className={navBtn} style={{ borderColor: C.line, outlineColor: C.olive }}>
          <ChevronRight size={18} aria-hidden />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[13px] font-bold" style={{ color: C.muted }} aria-hidden>
        {DOW.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1" role="group" aria-label="예식일 선택">
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const past = d.getTime() < today.getTime();
          const weekend = isWeekend(d);
          const full = weekend && !past && dayFull(today, d);
          const on = sameDay(d, date);
          const can = weekend && !past && !full;
          const label = `${d.getMonth() + 1}월 ${d.getDate()}일 ${DOW_FULL[d.getDay()]}${full ? " 마감" : can ? " 예약 가능" : ""}`;
          return (
            <button
              key={d.getTime()}
              type="button"
              disabled={!can}
              aria-pressed={on}
              aria-label={label}
              onClick={() => onPick(d)}
              className={`${focusRing} relative flex h-11 flex-col items-center justify-center rounded-[4px] text-[15px] tabular-nums disabled:cursor-default`}
              style={{
                background: on ? C.olive : can ? C.ivory : "transparent",
                color: on ? C.paper : can ? C.ink : C.muted,
                outlineColor: C.olive,
                textDecoration: full ? "line-through" : undefined,
                fontWeight: can || on ? 700 : 400,
              }}
            >
              {d.getDate()}
              {full && <span className="text-[10px] leading-none">마감</span>}
              {sameDay(d, today) && <span aria-hidden className="absolute bottom-1 h-[3px] w-4 rounded-full" style={{ background: on ? C.paper : C.olive }} />}
            </button>
          );
        })}
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px]" style={{ color: C.muted }}>
        <span>진한 글자: 예약 가능</span>
        <span>줄 그어진 날: 마감</span>
        <span>밑줄: 오늘</span>
      </p>
    </div>
  );
}

/* 2. 하객 수에 따른 홀 배치 */
function LayoutSection({
  guests,
  setGuests,
  tables,
  garden,
  setGarden,
  reduce,
}: {
  guests: { n: number; from: number };
  setGuests: (g: { n: number; from: number }) => void;
  tables: number;
  garden: boolean;
  setGarden: (v: boolean) => void;
  reduce: boolean;
}) {
  const spare = tables * SEAT - guests.n;
  const tr = (i: number) => (reduce ? { duration: 0 } : { duration: TABLE_MS / 1000, ease: EASE, delay: (Math.max(0, i - guests.from) * TABLE_STAGGER_MS) / 1000 });
  return (
    <>
      <h2 id="sw-layout-title" className="text-[30px] leading-[1.25] md:text-[38px]" style={{ ...serif, fontWeight: 700 }}>
        하객 수에 맞춘 홀 배치
      </h2>
      <div className="mt-8 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-12">
        <div>
          <label htmlFor="sw-guests" className="block text-[16px] font-bold">
            하객 수 <span className="tabular-nums text-[28px]">{guests.n}</span>명
          </label>
          <input
            id="sw-guests"
            type="range"
            min={HALL_MIN}
            max={HALL_MAX}
            step={2}
            value={guests.n}
            onChange={(e) => setGuests({ n: Number(e.target.value), from: tables })}
            className={`${focusRing} mt-3 w-full`}
            style={{ accentColor: C.olive, outlineColor: C.olive }}
          />
          <div className="mt-1 flex justify-between text-[13px] tabular-nums" style={{ color: C.muted }}>
            <span>{HALL_MIN}명</span>
            <span>{HALL_MAX}명</span>
          </div>
          <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[16px]">
            <dt style={{ color: C.muted }}>테이블</dt>
            <dd className="tabular-nums">
              <b>{tables}개</b> (8인 원형)
            </dd>
            <dt style={{ color: C.muted }}>남는 자리</dt>
            <dd className="tabular-nums">{spare}석</dd>
            <dt style={{ color: C.muted }}>동선</dt>
            <dd>{tables <= 8 ? "앞쪽 두 줄만 써서 단상이 가까워요" : tables <= 12 ? "세 줄, 버진로드 양쪽으로 나눠요" : "세 줄 가득, 뒷줄은 통로를 넓혀요"}</dd>
          </dl>
          <button
            type="button"
            role="switch"
            aria-checked={garden}
            onClick={() => setGarden(!garden)}
            className={`${focusRing} mt-6 flex w-full items-center justify-between rounded-[6px] border px-4 py-3 text-left text-[16px]`}
            style={{ borderColor: garden ? C.olive : C.line, background: garden ? C.olive : C.paper, color: garden ? C.paper : C.ink, outlineColor: C.olive }}
          >
            <span className="inline-flex items-center gap-2 font-bold">
              <Trees size={18} aria-hidden /> 야외 정원 사용
            </span>
            <span className="text-[14px]">{garden ? `켬, ${won(GARDEN_FEE)}` : "끔"}</span>
          </button>
          <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
            정원은 식전 음료와 사진 촬영에 써요. 비가 오면 홀 로비로 바꿔요.
          </p>
        </div>

        <figure className="min-w-0">
          <svg viewBox="0 0 760 320" role="img" aria-label={`하객 ${guests.n}명, 테이블 ${tables}개 배치도${garden ? ", 야외 정원 사용" : ""}`} className="block w-full rounded-[6px] border" style={{ background: C.paper, borderColor: C.line }}>
            {/* 홀 */}
            <rect x="20" y="20" width="480" height="280" rx="4" fill={C.paper} stroke="#bdbdbd" strokeWidth="1.5" />
            <rect x="190" y="34" width="140" height="42" rx="3" fill={C.ivoryDeep} stroke={C.sage} />
            <text x="260" y="60" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.olive}>
              단상
            </text>
            <rect x="248" y="76" width="24" height="224" fill={C.ivoryDeep} />
            <text x="260" y="312" textAnchor="middle" fontSize="11" fill={C.muted}>
              입구
            </text>
            <text x="30" y="40" fontSize="12" fill={C.muted}>
              홀 (최대 120명)
            </text>
            <AnimatePresence>
              {SPOTS.slice(0, tables).map(([x, y], i) => (
                <motion.g
                  key={`${x}-${y}`}
                  initial={reduce ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                  transition={tr(i)}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                >
                  {DIGITS.slice(0, SEAT).map((k) => {
                    const a = (Math.PI * 2 * k) / SEAT;
                    return <circle key={k} cx={x + Math.cos(a) * 22} cy={y + Math.sin(a) * 22} r="3.4" fill={C.sage} />;
                  })}
                  <circle cx={x} cy={y} r="15" fill={C.paper} stroke={C.olive} strokeWidth="2" />
                  <circle cx={x} cy={y} r="4" fill={C.sage} />
                </motion.g>
              ))}
            </AnimatePresence>
            {/* 정원 */}
            <motion.rect x="530" y="20" width="210" height="280" rx="4" strokeWidth="2" strokeDasharray={garden ? "0" : "8 6"} initial={false} animate={{ fill: garden ? "#eef1ea" : "rgba(238,241,234,0)", stroke: garden ? C.olive : "#bdbdbd" }} transition={reduce ? { duration: 0 } : { duration: 0.4 }} />
            <text x="540" y="40" fontSize="12" fill={C.muted}>
              {garden ? "야외 정원 (식전 음료, 사진)" : "야외 정원 (사용 안 함)"}
            </text>
            <AnimatePresence>
              {garden &&
                [
                  [580, 110],
                  [690, 110],
                  [635, 170],
                  [580, 230],
                  [690, 230],
                ].map(([x, y], i) => (
                  <motion.g key={`g${x}-${y}`} initial={reduce ? false : { scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={reduce ? { duration: 0 } : { duration: 0.3, delay: i * 0.05 }} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
                    <circle cx={x} cy={y} r="9" fill={C.paper} stroke={C.olive} strokeWidth="2" />
                  </motion.g>
                ))}
            </AnimatePresence>
            {garden && (
              <>
                <path d="M560,290 q20,-14 40,0 t40,0 t40,0 t40,0" fill="none" stroke={C.olive} strokeWidth="2" />
                <text x="635" y="70" textAnchor="middle" fontSize="11" fill={C.olive}>
                  포토존
                </text>
              </>
            )}
            <path d="M500,150 h30" stroke={C.olive} strokeWidth="2" strokeDasharray="4 3" />
          </svg>
          <figcaption className="mt-2 text-[14px]" style={{ color: C.muted }}>
            8인 원형 테이블. 가운데 통로가 버진로드, 아래가 입구예요.
          </figcaption>
        </figure>
      </div>
    </>
  );
}

/* 3. 패키지 견적 */
function PackageSection({ slot, guests, garden }: { slot: number; guests: number; garden: boolean }) {
  const [meal, setMeal] = useState("course");
  const [flower, setFlower] = useState("basic");
  const [extras, setExtras] = useState<string[]>([]);
  const m = MEALS.find((x) => x.id === meal) ?? MEALS[0];
  const f = FLOWERS.find((x) => x.id === flower) ?? FLOWERS[0];
  const rent = SLOTS[slot].rent + (garden ? GARDEN_FEE : 0);
  const mealTotal = m.price * guests;
  const extraTotal = EXTRAS.filter((e) => extras.includes(e.id)).reduce((s, e) => s + e.price, 0);
  const total = rent + mealTotal + f.price + extraTotal;

  const opt = (on: boolean) => ({
    borderColor: on ? C.olive : C.line,
    background: on ? C.olive : C.paper,
    color: on ? C.paper : C.ink,
    outlineColor: C.olive,
  });
  const optCls = `${focusRing} rounded-[6px] border px-4 py-3 text-left leading-[1.5]`;

  return (
    <>
      <h2 id="sw-package-title" className="text-[30px] leading-[1.25] md:text-[38px]" style={{ ...serif, fontWeight: 700 }}>
        패키지와 비용
      </h2>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        <div className="grid gap-7">
          <div>
            <p className="text-[16px] font-bold">식사 (1인)</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-label="식사">
              {MEALS.map((x) => (
                <button key={x.id} type="button" aria-pressed={meal === x.id} onClick={() => setMeal(x.id)} className={optCls} style={opt(meal === x.id)}>
                  <span className="flex items-baseline justify-between gap-2">
                    <b className="text-[17px]">{x.name}</b>
                    <span className="tabular-nums">{won(x.price)}</span>
                  </span>
                  <span className="block text-[14px]">{x.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[16px] font-bold">꽃장식</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-label="꽃장식">
              {FLOWERS.map((x) => (
                <button key={x.id} type="button" aria-pressed={flower === x.id} onClick={() => setFlower(x.id)} className={optCls} style={opt(flower === x.id)}>
                  <span className="flex items-baseline justify-between gap-2">
                    <b className="inline-flex items-center gap-1.5 text-[17px]">
                      <Flower2 size={16} aria-hidden /> {x.name}
                    </b>
                    <span className="tabular-nums">{won(x.price)}</span>
                  </span>
                  <span className="block text-[14px]">{x.desc}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[16px] font-bold">추가</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-label="추가 옵션">
              {EXTRAS.map((x) => {
                const on = extras.includes(x.id);
                return (
                  <button key={x.id} type="button" aria-pressed={on} onClick={() => setExtras((s) => (on ? s.filter((v) => v !== x.id) : [...s, x.id]))} className={optCls} style={opt(on)}>
                    <span className="flex items-baseline justify-between gap-2">
                      <b className="text-[17px]">{x.name}</b>
                      <span className="tabular-nums">{won(x.price)}</span>
                    </span>
                    <span className="block text-[14px]">{on ? "담았어요" : "누르면 담겨요"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.ivory }}>
          <p className="text-[20px]" style={{ fontWeight: 700 }}>
            견적
          </p>
          <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-3 text-[15px] leading-[1.5]">
            <dt>
              대관 {SLOTS[slot].time}
              {garden && <span style={{ color: C.muted }}> (정원 포함)</span>}
            </dt>
            <dd className="tabular-nums">{won(rent)}</dd>
            <dt>
              식사 {m.name} <span style={{ color: C.muted }}>{won(m.price)} x {guests}명</span>
            </dt>
            <dd className="tabular-nums">{won(mealTotal)}</dd>
            <dt>꽃장식 {f.name}</dt>
            <dd className="tabular-nums">{won(f.price)}</dd>
            {EXTRAS.filter((e) => extras.includes(e.id)).map((e) => (
              <div key={e.id} className="contents">
                <dt>{e.name}</dt>
                <dd className="tabular-nums">{won(e.price)}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 border-t pt-4" style={{ borderColor: C.line }}>
            <p className="text-[14px] font-bold" style={{ color: C.muted }}>
              합계 (부가세 별도)
            </p>
            <p className="mt-1 text-[32px] tabular-nums md:text-[36px]" style={{ fontWeight: 700, color: C.ink, letterSpacing: "-0.02em" }} aria-live="polite">
              {won(total)}
            </p>
            <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
              하객 1인당 {won(Math.round(total / guests / 1000) * 1000)} 꼴. 하객 수와 날짜는 위에서 바꾼 값이 그대로 들어가요.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* 5. 공간 안내와 오시는 길 */
function SpaceSection({ today }: { today: Date }) {
  const spaces = [
    { icon: DoorOpen, name: "홀", lines: ["하객 120명까지, 천장 높이 6m", "남서쪽 아치창 3개, 자연광 예식", "단상 뒤 LED 없이 꽃 아치만"] },
    { icon: Trees, name: "정원", lines: ["식전 음료와 사진 촬영", "포토존, 야외 의자 40석", "우천 시 홀 로비로 변경"] },
    { icon: Flower2, name: "신부 대기실", lines: ["2실, 메이크업 수정 공간", "가족 대기 소파와 다과", "예식 2시간 전부터 사용"] },
    { icon: Car, name: "주차", lines: ["건물 지하 1~3층 150대", "하객 주차 2시간 무료", "만차 시 옆 건물 공영주차장 안내"] },
  ];
  const hours = [
    ["월", "휴무"],
    ["화", "10:00~19:00"],
    ["수", "10:00~19:00"],
    ["목", "10:00~19:00"],
    ["금", "10:00~19:00"],
    ["토", "09:00~18:00"],
    ["일", "09:00~18:00"],
  ];
  const todayDow = DOW[today.getDay()];

  return (
    <>
      <h2 id="sw-space-title" className="text-[30px] leading-[1.25] md:text-[38px]" style={{ ...serif, fontWeight: 700 }}>
        공간 안내
      </h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {spaces.map((s) => (
          <li key={s.name} className="rounded-[6px] border p-5" style={{ borderColor: C.line, background: C.paper }}>
            <p className="inline-flex items-center gap-2 text-[18px]" style={{ fontWeight: 700 }}>
              <s.icon size={20} aria-hidden style={{ color: C.olive }} /> {s.name}
            </p>
            <ul className="mt-3 grid gap-1.5 text-[15px] leading-[1.5]">
              {s.lines.map((l) => (
                <li key={l} className="flex gap-2">
                  <span aria-hidden className="mt-[9px] h-[5px] w-[5px] flex-none rounded-full" style={{ background: C.sage }} />
                  {l}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <h2 id="sw-way-title" className="mt-14 text-[30px] leading-[1.25] md:text-[38px]" style={{ ...serif, fontWeight: 700 }}>
        오시는 길
      </h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <figure className="min-w-0">
          <svg viewBox="0 0 640 300" role="img" aria-label="ㅇㅇ역 3번 출구에서 홀까지 약도" className="block w-full rounded-[6px]" style={{ background: C.paper }}>
            <rect width="640" height="300" fill={C.paper} />
            <path d="M0,150 H640" stroke={C.ivoryDeep} strokeWidth="38" />
            <path d="M160,0 V300 M460,0 V300" stroke={C.ivoryDeep} strokeWidth="26" />
            <path d="M0,150 H640" stroke={C.paper} strokeWidth="2" strokeDasharray="12 10" />
            <path d="M172,150 L172,100 Q172,92 180,92 L380,92" fill="none" stroke={C.olive} strokeWidth="3" strokeDasharray="7 6" />
            <rect x="140" y="138" width="40" height="24" rx="4" fill={C.olive} />
            <text x="160" y="155" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.paper}>
              역
            </text>
            <text x="160" y="186" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink}>
              ㅇㅇ역 3번 출구
            </text>
            <text x="160" y="204" textAnchor="middle" fontSize="12" fill={C.muted}>
              걸어서 5분
            </text>
            <rect x="380" y="52" width="110" height="80" rx="4" fill={C.olive} />
            <text x="435" y="86" textAnchor="middle" fontSize="15" fontWeight="700" fill={C.paper}>
              {BRAND}
            </text>
            <text x="435" y="108" textAnchor="middle" fontSize="11" fill={C.paper}>
              지하 주차 입구 뒤편
            </text>
            <rect x="500" y="52" width="100" height="80" rx="4" fill={C.ivoryDeep} />
            <text x="550" y="96" textAnchor="middle" fontSize="12" fill={C.muted}>
              공영주차장
            </text>
            <rect x="210" y="190" width="120" height="70" rx="4" fill={C.ivoryDeep} />
            <text x="270" y="230" textAnchor="middle" fontSize="12" fill={C.muted}>
              ㅇㅇ공원
            </text>
            <circle cx="120" cy="150" r="8" fill={C.paper} stroke={C.olive} strokeWidth="3" />
            <text x="120" y="128" textAnchor="middle" fontSize="12" fill={C.ink}>
              셔틀 승차
            </text>
          </svg>
          <figcaption className="mt-2 text-[14px]" style={{ color: C.muted }}>
            {ADDRESS}. 네이버 지도, 카카오맵에서 {BRAND}로 검색하세요.
          </figcaption>
        </figure>

        <div className="grid gap-4">
          <ul className="grid gap-3 rounded-[6px] border p-5 text-[15px] leading-[1.6]" style={{ borderColor: C.line, background: C.paper }}>
            <li className="flex gap-3">
              <TrainFront size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.olive }} />
              <span>
                <b>지하철</b> ㅇㅇ역 3번 출구에서 걸어서 5분
              </span>
            </li>
            <li className="flex gap-3">
              <Bus size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.olive }} />
              <span>
                <b>셔틀</b> ㅇㅇ역 2번 출구 앞, 예식 2시간 전부터 20분마다
              </span>
            </li>
            <li className="flex gap-3">
              <Car size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.olive }} />
              <span>
                <b>자가용</b> 건물 지하 주차장, 하객 주차 2시간 무료
              </span>
            </li>
          </ul>
          <table className="w-full border-collapse rounded-[6px] text-[15px]" style={{ background: C.paper }}>
            <caption className="py-2 text-left text-[15px] font-bold">상담 운영시간</caption>
            <tbody>
              {hours.map(([d, h]) => {
                const now = d === todayDow;
                return (
                  <tr key={d} aria-current={now ? "date" : undefined} style={{ background: now ? C.ivory : undefined, fontWeight: now ? 700 : 400 }}>
                    <th scope="row" className="border-t px-4 py-2 text-left" style={{ borderColor: C.line }}>
                      {d}
                      {now && <span className="ml-2 text-[12px]">오늘</span>}
                    </th>
                    <td className="border-t px-4 py-2 text-right tabular-nums" style={{ borderColor: C.line }}>
                      {h}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* 4. 상담신청과 방문 예약 */
function ConsultSection({ today, date }: { today: Date; date: Date }) {
  const [groom, setGroom] = useState("");
  const [bride, setBride] = useState("");
  const [phone, setPhone] = useState("");
  const [wedding, setWedding] = useState("");
  const [visit, setVisit] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lead, setLead] = useState<Lead | null>(null);
  const [count, setCount] = useState(17);

  const weddingValue = wedding || fmtDash(date);
  const minVisit = fmtDash(daysAgo(today, -1));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (groom.trim().length < 2) err.groom = "이름을 두 글자 이상 적어 주세요";
    if (bride.trim().length < 2) err.bride = "이름을 두 글자 이상 적어 주세요";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) err.phone = "휴대폰 번호를 확인해 주세요";
    if (!visit) err.visit = "방문 희망일을 골라 주세요";
    setErrors(err);
    if (Object.keys(err).length) return;
    const no = `W-${fmtDash(today).replace(/-/g, "")}-${String(count).padStart(3, "0")}`;
    setCount((c) => c + 1);
    setLead({ no, groom: maskName(groom), bride: maskName(bride), phone: maskPhone(phone), wedding: weddingValue, visit });
  };

  const field = "mt-1 w-full rounded-[6px] border px-3 py-2.5 text-[16px]";
  const fieldStyle = (k: string) => ({ borderColor: errors[k] ? C.error : C.line, background: C.paper, color: C.ink, outlineColor: C.olive });
  const lab = "block text-[15px] font-bold";
  const reply = nextBizDay(today);

  return (
    <>
      <h2 id="sw-consult-title" className="text-[30px] leading-[1.25] md:text-[38px]" style={{ ...serif, fontWeight: 700 }}>
        상담신청
      </h2>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <div className="text-[16px] leading-[1.7]">
          <p>방문 상담은 한 팀씩 60분. 홀과 정원을 같이 보고 날짜별 남은 시간대를 그 자리에서 확인해요.</p>
          <ul className="mt-4 grid gap-2">
            <li className="flex gap-2">
              <MessageCircle size={18} aria-hidden className="mt-1 flex-none" /> 담당 플래너가 {KAKAO}로 답해요
            </li>
            <li className="flex gap-2">
              <DoorOpen size={18} aria-hidden className="mt-1 flex-none" /> 방문 상담 때 홀 식사 시식 가능 (2인)
            </li>
          </ul>
          <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
            회신은 다음 영업일 안에 드려요. 월요일은 상담을 쉬어요.
          </p>
        </div>

        <div className="rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.ivory }} aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {lead ? (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <p className="text-[22px]" style={{ fontWeight: 700 }}>
                  접수 완료
                </p>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[16px] leading-[1.6]">
                  <dt style={{ color: C.muted }}>접수번호</dt>
                  <dd className="font-bold tabular-nums">{lead.no}</dd>
                  <dt style={{ color: C.muted }}>신청인</dt>
                  <dd>
                    {lead.groom}, {lead.bride}
                  </dd>
                  <dt style={{ color: C.muted }}>연락처</dt>
                  <dd className="tabular-nums">{lead.phone}</dd>
                  <dt style={{ color: C.muted }}>희망 예식일</dt>
                  <dd className="tabular-nums">{lead.wedding}</dd>
                  <dt style={{ color: C.muted }}>방문 희망일</dt>
                  <dd className="tabular-nums">{lead.visit}</dd>
                  <dt style={{ color: C.muted }}>담당 창구</dt>
                  <dd>{KAKAO} (플래너 박ㅅ연)</dd>
                  <dt style={{ color: C.muted }}>회신 예정일</dt>
                  <dd>{fmtKo(reply)}</dd>
                </dl>
                <button type="button" onClick={() => setLead(null)} className={`${btnBase} mt-5 rounded-[6px] border px-4 py-2 text-[14px]`} style={{ borderColor: C.olive, color: C.olive, background: C.paper, outlineColor: C.olive, fontWeight: 600 }}>
                  다른 날짜로 다시 신청
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" noValidate onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sw-groom" className={lab}>
                      신랑 이름
                    </label>
                    <input id="sw-groom" value={groom} onChange={(e) => setGroom(e.target.value)} autoComplete="off" aria-invalid={!!errors.groom} aria-describedby={errors.groom ? "sw-groom-err" : undefined} className={`${field} ${focusRing}`} style={fieldStyle("groom")} />
                    {errors.groom && (
                      <p id="sw-groom-err" className="mt-1 text-[13px]" style={{ color: C.error }}>
                        {errors.groom}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="sw-bride" className={lab}>
                      신부 이름
                    </label>
                    <input id="sw-bride" value={bride} onChange={(e) => setBride(e.target.value)} autoComplete="off" aria-invalid={!!errors.bride} aria-describedby={errors.bride ? "sw-bride-err" : undefined} className={`${field} ${focusRing}`} style={fieldStyle("bride")} />
                    {errors.bride && (
                      <p id="sw-bride-err" className="mt-1 text-[13px]" style={{ color: C.error }}>
                        {errors.bride}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="sw-phone" className={lab}>
                    휴대폰
                  </label>
                  <input id="sw-phone" type="tel" inputMode="numeric" placeholder="010-0000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="off" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "sw-phone-err" : undefined} className={`${field} ${focusRing}`} style={fieldStyle("phone")} />
                  {errors.phone && (
                    <p id="sw-phone-err" className="mt-1 text-[13px]" style={{ color: C.error }}>
                      {errors.phone}
                    </p>
                  )}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="sw-wedding" className={lab}>
                      희망 예식일
                    </label>
                    <input id="sw-wedding" type="date" min={fmtDash(today)} value={weddingValue} onChange={(e) => setWedding(e.target.value)} className={`${field} ${focusRing}`} style={fieldStyle("wedding")} />
                  </div>
                  <div>
                    <label htmlFor="sw-visit" className={lab}>
                      방문 희망일
                    </label>
                    <input id="sw-visit" type="date" min={minVisit} value={visit} onChange={(e) => setVisit(e.target.value)} aria-invalid={!!errors.visit} aria-describedby={errors.visit ? "sw-visit-err" : undefined} className={`${field} ${focusRing}`} style={fieldStyle("visit")} />
                    {errors.visit && (
                      <p id="sw-visit-err" className="mt-1 text-[13px]" style={{ color: C.error }}>
                        {errors.visit}
                      </p>
                    )}
                  </div>
                </div>
                <button type="submit" data-gtm-cta="small-wedding_consult_submit" className={`${btnBase} mt-6 w-full rounded-[6px] py-3 text-[16px]`} style={{ background: C.olive, color: C.paper, outlineColor: C.olive, fontWeight: 600 }}>
                  상담신청
                </button>
                <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
                  방문 상담은 화~일 10:00~18:00 사이에 잡아 드려요.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
