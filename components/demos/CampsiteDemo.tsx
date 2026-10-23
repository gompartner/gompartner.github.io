"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Car, Check, Clock, Dog, Flame, MapPin, Minus, Phone, Plus, Tent, Toilet, Trees, Users, Zap } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 오토캠핑장 홈페이지 샘플: 가상의 곰파트너 캠핑장(데크 사이트 16면, 잔디 오토 사이트 6면, 글램핑 2동, 장비 대여).
   상호, 주소, 전화번호, 계좌, 사이트 배치와 예약 현황은 모두 가상이다.

   국내 캠핑장 홈페이지 공통 구성: 상단 메뉴는 캠핑장 소개, 사이트 안내, 요금 안내, 실시간 예약, 이용 안내, 오시는 길.
   첫 화면 바로 아래에 실시간 예약(날짜 달력과 사이트 배치도)이 오고, 요금은 평일과 주말(금, 토, 공휴일 전날)로 나뉜다.
   예약은 입금 확인 뒤 확정되는 곳이 대부분이라 입금 계좌, 입금 기한, 입금자명 안내가 꼭 붙는다.
   이용 안내에는 입실 14시, 퇴실 11시, 매너타임, 화기 규정(화로대 사용, 바닥 직화 금지), 반려동물, 환불 규정표가 있다.
   오시는 길은 역이 아니라 고속도로 나들목 기준으로 적는다.

   첫 화면 포스터(cp-poster): 별이 뜬 밤 캠핑장 사진 한 장이 화면을 채우고, 숲 그림자 위에 문장 "장작은 저희가 패 둘게요".
   들어올 때 사진이 1.06배에서 1배로 1.6초 동안 다가오고, 문장은 0.3초 뒤 12px 아래에서 올라온다(CSS keyframes).
   스크롤하면 사진만 조금 느리게 움직인다. 불꽃, 불티 같은 반복 움직임은 두지 않는다. 동작 줄이기면 모두 멈춘 상태.
   그 아래 먹색 띠(상호, 사이트 구성, 요금 요약)가 이어진다.

   사진 출처: Pexels 사진 2526025

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 사이트 배치도: A, B, C 구역 사이트 22면과 글램핑 2동. 누르면 크기, 전기, 그늘, 화장실 거리가 나온다.
   2. 날짜 고르기: 오늘부터 6주 달력에서 입실일과 퇴실일. 고른 사이트의 찬 날은 마감으로 표시된다.
   3. 장비 대여 추가: 텐트, 타프, 화로대, 랜턴, 침낭 수량. 요금이 합산된다.
   4. 예약 신청: 이름, 휴대폰, 인원, 차량 수. 접수 완료 화면에 예약번호와 입금 안내가 나온다.
   5. 이용 안내와 오시는 길: 입퇴실 시간, 매너타임, 화기 규정, 반려동물, 환불 규정, 나들목 기준 길 안내. */

const BRAND = "곰파트너";
const TEL = "033-000-0000";
const ADDRESS = "강원 ㅍㅊ군 ㅇㅇ면 ㅇㅇ로 00";
const BANK = "ㄱㅁ은행 000-000000-00-000 (예금주 곰파트너)";
const KAKAO = "카카오톡 채널 곰파트너";


/* 색: 바탕은 흰색과 옅은 회색, 머리글과 바닥글, 첫 화면 띠는 먹색. 강조색은 장작불 빛을 낮춘 갈색 하나만 버튼, 선택, 작은 강조에 쓴다. */
const C = {
  night: "#141414",
  nightDeep: "#141414",
  forest: "#767676",
  fire: "#a45a2a",
  fireDeep: "#a45a2a",
  fireText: "#a45a2a",
  fireSoft: "#f4ebe4",
  paper: "#ffffff",
  paperDim: "#f7f7f5",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  edge: "#d0d0d0",
  error: "#b42318",
};

/* 모션 상수 */
const EASE = [0.22, 1, 0.36, 1] as const; // 패널 등장, 첫 화면 사진
const PANEL_MS = 260; // 사이트 카드, 접수 완료 화면 전환

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const btn = `inline-flex items-center justify-center gap-1.5 font-semibold transition-[transform,background-color] duration-100 active:translate-y-[1px] ${focusRing}`;

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const DAY_MS = 86_400_000;
const dayDiff = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY_MS);
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/* 공휴일. 날짜가 고정된 것과 2026~2027년 설, 추석, 부처님오신날, 대체공휴일. 그 뒤 해는 주말 요금만 적용된다. */
const HOLIDAYS = new Set([
  "2026-01-01", "2026-02-16", "2026-02-17", "2026-02-18", "2026-03-01", "2026-03-02", "2026-05-05", "2026-05-24", "2026-05-25",
  "2026-06-06", "2026-08-15", "2026-08-17", "2026-09-24", "2026-09-25", "2026-09-26", "2026-10-03", "2026-10-05", "2026-10-09", "2026-12-25",
  "2027-01-01", "2027-02-06", "2027-02-07", "2027-02-08", "2027-02-09", "2027-03-01", "2027-05-05", "2027-05-13", "2027-06-06",
  "2027-08-15", "2027-08-16", "2027-09-14", "2027-09-15", "2027-09-16", "2027-10-03", "2027-10-04", "2027-10-09", "2027-10-11", "2027-12-25", "2027-12-27",
]);
const key = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const isHoliday = (d: Date) => HOLIDAYS.has(key(d));
/** 그날 밤이 주말 요금인지. 금, 토 밤과 공휴일 전날 밤. */
const isPeakNight = (d: Date) => d.getDay() === 5 || d.getDay() === 6 || isHoliday(daysAgo(d, -1));

/* 사이트 */
type Zone = "A" | "B" | "C" | "G";
type SiteType = "deck" | "auto" | "glamp";
interface Site {
  id: string;
  zone: Zone;
  type: SiteType;
  /** 가로 x 세로 m */
  size: [number, number];
  power: boolean;
  shade: "많음" | "보통" | "적음";
  toilet: number;
  /** 배치도 위치(viewBox 좌표) */
  x: number;
  y: number;
  w: number;
  h: number;
}

const RATE: Record<SiteType, { name: string; weekday: number; weekend: number; base: number }> = {
  deck: { name: "데크 사이트", weekday: 40_000, weekend: 60_000, base: 4 },
  auto: { name: "잔디 오토 사이트", weekday: 35_000, weekend: 55_000, base: 4 },
  glamp: { name: "글램핑", weekday: 150_000, weekend: 200_000, base: 4 },
};
const EXTRA_PERSON = 10_000; // 기본 인원 초과 1인 1박
const EXTRA_CAR = 10_000; // 차량 1대 포함, 추가 1대 1박
const MAX_PEOPLE = 6;
const MAX_NIGHTS = 4;

const ZONES: Record<Zone, { name: string; desc: string }> = {
  A: { name: "A구역 강가 데크", desc: "강이 바로 앞이라 볕이 좋아요. 그늘은 적어요." },
  B: { name: "B구역 숲속 데크", desc: "잣나무 숲 안이라 한여름에도 서늘해요." },
  C: { name: "C구역 잔디 오토", desc: "차를 사이트 옆에 바로 대요. 큰 텐트도 넉넉해요." },
  G: { name: "글램핑", desc: "침구와 난방이 갖춰져 있어요. 장비 없이 오세요." },
};

function buildSites(): Site[] {
  const s: Site[] = [];
  for (let i = 0; i < 8; i++) {
    s.push({ id: `A${i + 1}`, zone: "A", type: "deck", size: i % 3 === 1 ? [10, 8] : [8, 8], power: true, shade: "적음", toilet: 30 + Math.abs(i - 3) * 15, x: 128, y: 48 + i * 52, w: 74, h: 44 });
  }
  for (let i = 0; i < 8; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    s.push({ id: `B${i + 1}`, zone: "B", type: "deck", size: [9, 8], power: i < 6, shade: "많음", toilet: 20 + col * 12 + row * 10, x: 300 + col * 82, y: 72 + row * 84, w: 68, h: 54 });
  }
  for (let i = 0; i < 6; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    s.push({ id: `C${i + 1}`, zone: "C", type: "auto", size: [10, 10], power: true, shade: "보통", toilet: 40 + row * 15 + col * 10, x: 636 + col * 92, y: 60 + row * 86, w: 80, h: 68 });
  }
  s.push({ id: "G1", zone: "G", type: "glamp", size: [6, 6], power: true, shade: "보통", toilet: 0, x: 630, y: 372, w: 72, h: 72 });
  s.push({ id: "G2", zone: "G", type: "glamp", size: [6, 6], power: true, shade: "보통", toilet: 0, x: 726, y: 372, w: 72, h: 72 });
  return s;
}
const SITES = buildSites();
const siteOf = (id: string) => SITES.find((s) => s.id === id) ?? SITES[0];

/** 사이트별 날짜별로 이미 찬 밤. 실제로는 예약 장부에서 읽는다. 주말과 강가가 먼저 찬다. */
function isFull(siteIdx: number, dayIdx: number, date: Date) {
  let h = Math.imul(siteIdx + 11, 2654435761) ^ Math.imul(dayIdx + 5, 40503);
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  const r = h % 100;
  const site = SITES[siteIdx];
  let chance = isPeakNight(date) ? 38 : 10;
  if (site.zone === "A") chance += 8;
  if (site.type === "glamp") chance += 12;
  return r < chance;
}

/* 접수 */
interface Booking {
  no: string;
  site: Site;
  checkIn: Date;
  checkOut: Date;
  name: string;
  phone: string;
  people: number;
  cars: number;
  total: number;
}

type Range = { in: Date | null; out: Date | null };
type Qty = Record<string, number>;

const RENTALS = [
  { id: "tent", name: "텐트 (4인용, 설치 포함)", price: 30_000 },
  { id: "tarp", name: "타프", price: 15_000 },
  { id: "fire", name: "화로대 (장작 1망 포함)", price: 10_000 },
  { id: "lamp", name: "랜턴 (충전식)", price: 5_000 },
  { id: "bag", name: "침낭", price: 5_000 },
] as const;

export function CampsiteDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [siteId, setSiteId] = useState("B3");
  const [range, setRange] = useState<Range>({ in: null, out: null });
  const [qty, setQty] = useState<Qty>({});
  const [people, setPeople] = useState(4);
  const [cars, setCars] = useState(1);
  const [booking, setBooking] = useState<Booking | null>(null);

  const site = siteOf(siteId);
  const siteIdx = SITES.indexOf(site);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  // 이번 주말(다가오는 토요일 밤) 빈 데크 수. 첫 화면 띠에 보인다.
  const satIdx = (6 - today.getDay() + 7) % 7 || 7;
  const satDate = daysAgo(today, -satIdx);
  const freeDecks = SITES.filter((s, i) => s.type === "deck" && !isFull(i, satIdx, satDate)).length;

  const nights = useMemo(() => {
    const from = range.in;
    if (!from || !range.out) return [] as Date[];
    const n = dayDiff(from, range.out);
    return Array.from({ length: n }, (_, i) => daysAgo(from, -i));
  }, [range]);

  const peakNights = nights.filter(isPeakNight).length;
  const normalNights = nights.length - peakNights;
  const rate = RATE[site.type];
  const siteFee = peakNights * rate.weekend + normalNights * rate.weekday;
  const extraPeople = Math.max(0, people - rate.base);
  const extraFee = (extraPeople * EXTRA_PERSON + Math.max(0, cars - 1) * EXTRA_CAR) * nights.length;
  const rentFee = RENTALS.reduce((sum, r) => sum + (qty[r.id] ?? 0) * r.price, 0) * nights.length;
  const total = siteFee + extraFee + rentFee;

  const inDate = range.in;
  const fullOnIn = inDate ? SITES.filter((_, i) => isFull(i, dayDiff(today, inDate), inDate)).map((s) => s.id) : [];

  const pickSite = (id: string) => {
    setSiteId(id);
    setBooking(null);
  };

  // overflow-x-hidden은 스크롤 컨테이너가 돼 안쪽 sticky가 풀린다. clip은 그렇지 않다.
  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.paper, color: C.body }}>
      <style>{`
        .cp-hatch { background-image: repeating-linear-gradient(135deg, rgba(17,17,17,0.14) 0 3px, transparent 3px 8px); }
      `}</style>

      <Poster reduce={reduce} onCta={() => go("cp-calendar")} />

      <header className="sticky top-0 z-30" style={{ background: C.nightDeep, color: C.paper }}>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-3 md:px-6">
          <a href="#cp-hero" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }} className={`inline-flex items-center gap-2 ${focusRing}`} style={{ outlineColor: C.paper }}>
            <SampleLogo light />
          </a>
          <nav aria-label="메뉴" className="hidden items-center gap-5 text-[15px] md:flex">
            {[
              ["cp-map", "사이트 안내"],
              ["cp-price", "요금 안내"],
              ["cp-calendar", "실시간 예약"],
              ["cp-info", "이용 안내"],
              ["cp-way", "오시는 길"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }} className={`rounded px-1 py-1 underline-offset-4 hover:underline ${focusRing}`} style={{ outlineColor: C.paper }}>
                {label}
              </a>
            ))}
          </nav>
          <button type="button" onClick={() => go("cp-calendar")} data-gtm-cta="campsite_reserve_top" className={`${btn} rounded-[6px] px-4 py-2 text-[15px]`} style={{ background: C.fire, color: "#fff", outlineColor: C.paper }}>
            예약하기
          </button>
        </div>
      </header>

      {/* 원래 첫 화면: 상호와 사이트 구성, 요금 요약. 밤 장면은 포스터가 맡아서 정지 띠로 둔다 */}
      <section id="cp-hero" aria-labelledby="cp-hero-title" style={{ background: C.night, color: C.paper }}>
        <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-6 md:py-16">
          <h2 id="cp-hero-title" className="text-[34px] font-bold leading-[1.2] md:text-[48px]" style={{ color: C.paper }}>
            {BRAND}
          </h2>
          <p className="mt-3 max-w-[560px] text-[17px] leading-[1.6] md:text-[20px]" style={{ color: C.paper }}>
            강가 데크 8면, 숲속 데크 8면, 잔디 오토 사이트 6면, 글램핑 2동. 입실 14시, 퇴실 11시.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" onClick={() => go("cp-calendar")} data-gtm-cta="campsite_reserve_hero" className={`${btn} rounded-[8px] px-5 py-3 text-[17px]`} style={{ background: C.fire, color: "#fff", outlineColor: C.paper }}>
              실시간 예약
            </button>
            <button type="button" onClick={() => go("cp-map")} className={`${btn} rounded-[8px] border px-5 py-3 text-[17px]`} style={{ borderColor: "rgba(255,255,255,0.6)", color: C.paper, outlineColor: C.paper }}>
              사이트 안내
            </button>
          </div>
          <dl className="mt-8 grid max-w-[640px] grid-cols-2 gap-x-6 gap-y-3 border-t pt-4 text-[15px] md:grid-cols-4" style={{ borderColor: "rgba(246,243,234,0.2)", color: C.paper }}>
            <div>
              <dt className="text-[13px] opacity-80">데크 평일</dt>
              <dd className="font-bold tabular-nums">{won(RATE.deck.weekday)}</dd>
            </div>
            <div>
              <dt className="text-[13px] opacity-80">데크 주말</dt>
              <dd className="font-bold tabular-nums">{won(RATE.deck.weekend)}</dd>
            </div>
            <div>
              <dt className="text-[13px] opacity-80">글램핑</dt>
              <dd className="font-bold tabular-nums">{won(RATE.glamp.weekday)}~</dd>
            </div>
            <div>
              <dt className="text-[13px] opacity-80">{satDate.getMonth() + 1}월 {satDate.getDate()}일(토) 빈 데크</dt>
              <dd className="font-bold tabular-nums">{freeDecks}면</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* 실시간 예약: 왼쪽 배치도, 오른쪽 달력과 대여, 신청 */}
      <section aria-labelledby="cp-reserve-title" className="mx-auto max-w-[1200px] px-4 pt-12 md:px-6 md:pt-16">
        <h2 id="cp-reserve-title" className="text-[30px] font-bold md:text-[36px]" style={{ color: C.night }}>
          실시간 예약
        </h2>
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div id="cp-map" className="scroll-mt-20">
            <h3 className="text-[20px] font-bold">사이트 배치도</h3>
            <SiteMap selected={siteId} full={fullOnIn} onSelect={pickSite} />
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]" style={{ color: C.muted }}>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-5 rounded-[2px] border" style={{ borderColor: C.fire, background: C.paperDim }} aria-hidden /> 선택
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="cp-hatch inline-block h-3 w-5 rounded-[2px]" style={{ background: C.paperDim }} aria-hidden /> {range.in ? `${fmtKo(range.in)} 마감 ${fullOnIn.length}면` : "입실일을 고르면 마감 표시"}
              </span>
            </div>
            <SiteChips selected={siteId} full={fullOnIn} onSelect={pickSite} />
            <SiteCard site={site} reduce={reduce} />
          </div>

          <div className="grid gap-8">
            <div id="cp-calendar" className="scroll-mt-20">
              <h3 className="text-[20px] font-bold">
                날짜 <span className="ml-2 text-[15px] font-normal" style={{ color: C.muted }}>{site.id} {rate.name}</span>
              </h3>
              <Calendar today={today} siteIdx={siteIdx} range={range} onChange={(r) => { setRange(r); setBooking(null); }} />
            </div>

            <div id="cp-rent" className="scroll-mt-20">
              <h3 className="text-[20px] font-bold">
                장비 대여 <span className="ml-2 text-[15px] font-normal" style={{ color: C.muted }}>1박 기준, 입실 때 사이트에 준비</span>
              </h3>
              <RentalList qty={qty} setQty={setQty} />
            </div>

            <div id="cp-book" className="scroll-mt-20">
              <h3 className="text-[20px] font-bold">예약 신청</h3>
              {booking ? (
                <Receipt booking={booking} today={today} reduce={reduce} onReset={() => { setBooking(null); setRange({ in: null, out: null }); setQty({}); }} />
              ) : (
                <BookingForm
                  site={site}
                  range={range}
                  nights={nights}
                  peakNights={peakNights}
                  people={people}
                  setPeople={setPeople}
                  cars={cars}
                  setCars={setCars}
                  qty={qty}
                  fees={{ site: siteFee, extra: extraFee, rent: rentFee, total }}
                  today={today}
                  onSubmit={(b) => setBooking(b)}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 요금 안내 */}
      <section id="cp-price" aria-labelledby="cp-price-title" className="mx-auto max-w-[1200px] scroll-mt-20 px-4 pt-16 md:px-6 md:pt-24">
        <h2 id="cp-price-title" className="text-[30px] font-bold md:text-[36px]" style={{ color: C.night }}>
          요금 안내
        </h2>
        <PriceTable />
      </section>

      {/* 이용 안내 */}
      <section id="cp-info" aria-labelledby="cp-info-title" className="mx-auto max-w-[1200px] scroll-mt-20 px-4 pt-16 md:px-6 md:pt-24">
        <h2 id="cp-info-title" className="text-[30px] font-bold md:text-[36px]" style={{ color: C.night }}>
          이용 안내
        </h2>
        <InfoGrid />
        <RefundTable />
      </section>

      {/* 오시는 길 */}
      <section id="cp-way" aria-labelledby="cp-way-title" className="mx-auto max-w-[1200px] scroll-mt-20 px-4 pt-16 md:px-6 md:pt-24">
        <h2 id="cp-way-title" className="text-[30px] font-bold md:text-[36px]" style={{ color: C.night }}>
          오시는 길
        </h2>
        <Directions />
      </section>

      <footer className="mt-16 md:mt-24" style={{ background: C.nightDeep, color: "rgba(246,243,234,0.85)" }}>
        <div className="mx-auto max-w-[1200px] px-4 py-10 text-[14px] leading-[1.8] md:px-6">
          <p>
            <SampleLogo light />
          </p>
          <p className="mt-1">
            {ADDRESS} <span className="mx-2 opacity-50">|</span> 관리사무소 {TEL} <span className="mx-2 opacity-50">|</span> {KAKAO}
          </p>
          <p>입실 14:00, 퇴실 11:00, 매너타임 22:00~07:00</p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

/* ===== 첫 화면 포스터 ===== */

const IMG = "/images/demo-campsite";

/* 포스터 모션(ms). 사진 다가오기 1600, 문장은 300 늦게 700 동안 12px 올라오며 나타난다(CSS keyframes, 끝 상태가 기본값).
   스크롤하면 사진만 포스터 높이의 8%까지 느리게 내려간다. 동작 줄이기면 모두 끈다. */
const HERO_IN_MS = 1600;
const HERO_TEXT_DELAY_MS = 300;
const HERO_TEXT_MS = 700;
const HERO_PARALLAX = 8;
const EASE_CSS = `cubic-bezier(${EASE.join(",")})`;

const HERO_CSS = `
@keyframes cp-hero-in { from { transform: scale(1.06); } }
@keyframes cp-hero-rise { from { opacity: 0; transform: translateY(12px); } }
.cp-hero-photo { animation: cp-hero-in ${HERO_IN_MS}ms ${EASE_CSS} both; }
.cp-hero-rise { animation: cp-hero-rise ${HERO_TEXT_MS}ms ${EASE_CSS} ${HERO_TEXT_DELAY_MS}ms both; }
@media (prefers-reduced-motion: reduce) { .cp-hero-photo, .cp-hero-rise { animation: none; } }
`;

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const wrapRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, (v) => `${v * HERO_PARALLAX}%`);

  return (
    <section id="cp-poster" ref={wrapRef} aria-labelledby="cp-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden text-white" style={{ background: C.night }}>
      <style>{HERO_CSS}</style>
      <motion.div aria-hidden className="absolute inset-0" style={{ y: reduce ? 0 : photoY }}>
        <div className={`absolute inset-0 ${reduce ? "" : "cp-hero-photo"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="별이 뜬 밤 숲 아래 불빛이 켜진 텐트 두 동이 있는 캠핑장 잔디밭"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "35% 55%" }}
          />
        </div>
      </motion.div>
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.2) 28%, rgba(0,0,0,0.25) 62%, rgba(0,0,0,0.45))" }} />

      {/* 왼쪽 위 상호, 오른쪽 위 예약하기 */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 pt-4 md:px-6 md:pt-7">
        <SampleLogo light small />
        <button type="button" onClick={onCta} data-gtm-cta="campsite_poster_cta" className={`${btn} rounded-[6px] bg-white px-4 py-2.5 text-[15px] hover:bg-[#f0f0f0]`} style={{ color: C.ink, outlineColor: "#ffffff" }}>
          예약하기
        </button>
      </div>

      {/* 문장은 숲 그림자 위(사진 가운데 높이)에 둔다. 아래쪽 텐트 불빛과 겹치지 않게 */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 items-center px-4 pb-[16svh] md:px-6">
        <div className={reduce ? "" : "cp-hero-rise"}>
          <h1 id="cp-poster-title" className="max-w-[14em] text-[36px] font-bold md:text-[clamp(40px,5vw,72px)]" style={{ letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}>
            장작은 저희가 패 둘게요
          </h1>
          <p className="mt-4 text-[16px] font-medium text-white/90 md:text-[18px]">강원 ㅍㅊ군 오토캠핑장, 입실 14시</p>
        </div>
      </div>
    </section>
  );
}

/* ===== 1. 사이트 배치도 ===== */

function SiteMap({ selected, full, onSelect }: { selected: string; full: string[]; onSelect: (id: string) => void }) {
  return (
    <svg viewBox="0 0 820 480" className="mt-3 h-auto w-full select-none rounded-[8px]" role="img" aria-label="캠핑장 배치도. 왼쪽 강가에 A구역, 가운데 숲에 B구역, 오른쪽 잔디밭에 C구역, 오른쪽 아래 글램핑 2동. 입구와 관리사무소는 아래쪽." style={{ background: "#f2f2ef" }}>
      <defs>
        <pattern id="cp-full" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#e4e4e1" />
          <rect width="3" height="8" fill="#b5b5b1" />
        </pattern>
      </defs>
      {/* 강 */}
      <path d="M0 0 C 40 80, 20 160, 60 240 C 100 320, 40 400, 70 480 L0 480 Z" fill="#cfdbe2" />
      <path d="M20 40 C 50 120, 30 200, 70 280 C 90 320, 60 380, 80 440" stroke="#e2eaef" strokeWidth="3" fill="none" />
      {/* 길 */}
      <path d="M400 480 L400 410 L250 410 L250 30 M400 410 L580 410 L580 30 M250 240 L580 240 M580 300 L800 300 M580 60 L800 60" stroke="#e2e0d9" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* 숲 */}
      <g fill="#c3cdbd">
        {[[290, 40], [330, 52], [450, 36], [520, 50], [300, 215], [370, 228], [440, 222], [500, 230], [550, 215], [360, 40], [480, 236], [410, 46]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={11 + (i % 3) * 3} />
        ))}
      </g>
      {/* 잔디 */}
      <rect x={616} y={36} width={200} height={240} rx={14} fill="#e3e8d8" opacity={0.7} />
      {/* 시설 */}
      <g fontSize="12" fill={C.ink} fontWeight={700}>
        <rect x={300} y={430} width={110} height={40} rx={4} fill="#fff" stroke={C.edge} strokeWidth={1} />
        <text x={355} y={449} textAnchor="middle">관리사무소</text>
        <text x={355} y={463} textAnchor="middle" fontWeight={400}>매점, 장비 대여</text>
        <rect x={450} y={430} width={70} height={40} rx={4} fill="#fff" stroke={C.edge} strokeWidth={1} />
        <text x={485} y={454} textAnchor="middle">입구</text>
        <rect x={205} y={262} width={38} height={28} rx={3} fill="#fff" stroke={C.edge} strokeWidth={1} />
        <text x={224} y={281} textAnchor="middle" fontSize="11">화장실</text>
        <rect x={596} y={262} width={38} height={28} rx={3} fill="#fff" stroke={C.edge} strokeWidth={1} />
        <text x={615} y={281} textAnchor="middle" fontSize="11">화장실</text>
        <rect x={205} y={300} width={38} height={24} rx={3} fill="#fff" stroke={C.edge} strokeWidth={1} />
        <text x={224} y={317} textAnchor="middle" fontSize="11">개수대</text>
        <text x={30} y={470} fontSize="13" fill="#4b4b4b">강</text>
      </g>
      {/* 구역 이름 */}
      <g fontSize="13" fill={C.muted} fontWeight={700}>
        <text x={165} y={36} textAnchor="middle">A구역 강가 데크</text>
        <text x={440} y={22} textAnchor="middle">B구역 숲속 데크</text>
        <text x={716} y={22} textAnchor="middle">C구역 잔디 오토</text>
        <text x={714} y={362} textAnchor="middle">글램핑</text>
      </g>
      {/* 사이트 */}
      {SITES.map((s) => {
        const on = s.id === selected;
        const isFullHere = full.includes(s.id);
        const fill = isFullHere ? "url(#cp-full)" : s.type === "glamp" ? "#f4ebe4" : s.type === "auto" ? "#f3f5ee" : "#ffffff";
        return (
          <g key={s.id} className="cursor-pointer" onClick={() => onSelect(s.id)}>
            {s.type === "glamp" ? (
              <circle cx={s.x + s.w / 2} cy={s.y + s.h / 2} r={s.w / 2} fill={fill} stroke={on ? C.fire : "#9a9a9a"} strokeWidth={on ? 3 : 1} />
            ) : (
              <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={4} fill={fill} stroke={on ? C.fire : "#9a9a9a"} strokeWidth={on ? 3 : 1} />
            )}
            <text x={s.x + s.w / 2} y={s.y + s.h / 2 + (isFullHere ? -1 : 5)} textAnchor="middle" fontSize="15" fontWeight={700} fill={C.ink}>
              {s.id}
            </text>
            {isFullHere && (
              <text x={s.x + s.w / 2} y={s.y + s.h / 2 + 13} textAnchor="middle" fontSize="11" fontWeight={700} fill={C.ink}>
                마감
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function SiteChips({ selected, full, onSelect }: { selected: string; full: string[]; onSelect: (id: string) => void }) {
  return (
    <div className="mt-4 grid gap-2">
      {(Object.keys(ZONES) as Zone[]).map((z) => (
        <div key={z} className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-[72px] text-[13px] font-bold" style={{ color: C.muted }}>
            {z === "G" ? "글램핑" : `${z}구역`}
          </span>
          {SITES.filter((s) => s.zone === z).map((s) => {
            const on = s.id === selected;
            const isFullHere = full.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => onSelect(s.id)}
                className={`${btn} min-w-[44px] rounded-[6px] border px-2 py-1 text-[14px] tabular-nums ${isFullHere ? "cp-hatch" : ""}`}
                style={{ borderColor: on ? C.fire : C.edge, background: on ? C.fire : "#fff", color: on ? "#fff" : C.ink, outlineColor: C.fire }}
              >
                {s.id}
                {isFullHere && <span className="sr-only"> 마감</span>}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SiteCard({ site, reduce }: { site: Site; reduce: boolean }) {
  const rate = RATE[site.type];
  const zone = ZONES[site.zone];
  return (
    <motion.div
      key={site.id}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: PANEL_MS / 1000, ease: EASE }}
      className="mt-5 grid gap-4 rounded-[8px] border bg-white p-4 sm:grid-cols-[150px_minmax(0,1fr)]"
      style={{ borderColor: C.line }}
      aria-live="polite"
    >
      <div className="flex h-[96px] items-end justify-between rounded-[6px] p-3 sm:h-full" style={{ background: C.paperDim }} aria-hidden>
        <span className="text-[30px] font-bold leading-none" style={{ color: C.ink }}>
          {site.id}
        </span>
        <Tent size={22} style={{ color: C.muted }} />
      </div>
      <div>
        <p className="text-[20px] font-bold">
          {site.id} <span className="text-[16px] font-normal" style={{ color: C.muted }}>{zone.name}</span>
        </p>
        <p className="mt-1 text-[15px] leading-[1.6]">{zone.desc}</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[14px]">
          <div className="flex items-center gap-1.5">
            <Tent size={16} aria-hidden style={{ color: C.forest }} />
            <dt className="sr-only">크기</dt>
            <dd>
              {site.size[0]}m x {site.size[1]}m
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={16} aria-hidden style={{ color: C.forest }} />
            <dt className="sr-only">전기</dt>
            <dd>{site.power ? "전기 있음" : "전기 없음"}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Trees size={16} aria-hidden style={{ color: C.forest }} />
            <dt className="sr-only">그늘</dt>
            <dd>그늘 {site.shade}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Toilet size={16} aria-hidden style={{ color: C.forest }} />
            <dt className="sr-only">화장실</dt>
            <dd>{site.toilet === 0 ? "전용 화장실" : `화장실 ${site.toilet}m`}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[15px] tabular-nums">
          평일 <b>{won(rate.weekday)}</b> <span style={{ color: C.muted }}>/</span> 주말 <b>{won(rate.weekend)}</b>
          <span className="ml-2 text-[13px]" style={{ color: C.muted }}>
            기본 {rate.base}인, 차량 1대
          </span>
        </p>
      </div>
    </motion.div>
  );
}

/* ===== 2. 날짜 ===== */

const WEEKS = 6;

function Calendar({ today, siteIdx, range, onChange }: { today: Date; siteIdx: number; range: Range; onChange: (r: Range) => void }) {
  const [msg, setMsg] = useState<string | null>(null);
  const start = daysAgo(today, today.getDay()); // 이번 주 일요일
  const days = Array.from({ length: WEEKS * 7 }, (_, i) => daysAgo(start, -i));
  const last = daysAgo(today, -(WEEKS * 7 - 1 - today.getDay()));
  const months = Array.from(new Set(days.map((d) => d.getMonth() + 1)));

  const fullAt = (d: Date) => isFull(siteIdx, dayDiff(today, d), d);

  const pick = (d: Date) => {
    setMsg(null);
    if (!range.in || (range.in && range.out)) {
      if (fullAt(d)) {
        setMsg(`${fmtKo(d)} 밤은 마감이에요. 다른 날을 골라 주세요.`);
        return;
      }
      onChange({ in: d, out: null });
      return;
    }
    // 입실일 뒤를 눌러야 퇴실일. 그 전을 누르면 입실일을 다시 잡는다.
    if (d <= range.in) {
      if (fullAt(d)) {
        setMsg(`${fmtKo(d)} 밤은 마감이에요.`);
        return;
      }
      onChange({ in: d, out: null });
      return;
    }
    const n = dayDiff(range.in, d);
    if (n > MAX_NIGHTS) {
      setMsg(`한 번에 ${MAX_NIGHTS}박까지 예약할 수 있어요.`);
      return;
    }
    for (let i = 0; i < n; i++) {
      const night = daysAgo(range.in, -i);
      if (fullAt(night)) {
        setMsg(`${fmtKo(night)} 밤이 마감이라 이어서 묵을 수 없어요.`);
        return;
      }
    }
    onChange({ in: range.in, out: d });
  };

  const inRange = (d: Date) => range.in && range.out && d >= range.in && d <= range.out;
  const nights = range.in && range.out ? dayDiff(range.in, range.out) : 0;

  return (
    <div className="mt-3 rounded-[8px] border bg-white p-3 md:p-4" style={{ borderColor: C.line }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[16px] font-bold">
          {today.getFullYear()}년 {months.join("월, ")}월
        </p>
        <p className="text-[13px]" style={{ color: C.muted }}>
          {fmtKo(today)} ~ {fmtKo(last)}
        </p>
      </div>
      <div className="mt-3 grid grid-cols-7 text-center text-[12px] font-bold" style={{ color: C.muted }}>
        {DOW.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-[3px]" role="group" aria-label="입실일과 퇴실일 선택">
        {days.map((d) => {
          const past = d < today;
          const isIn = range.in && sameDay(d, range.in);
          const isOut = range.out && sameDay(d, range.out);
          const mid = inRange(d) && !isIn && !isOut;
          const fullHere = !past && fullAt(d);
          const peak = isPeakNight(d);
          const first = d.getDate() === 1;
          const label = isIn ? "입실" : isOut ? "퇴실" : fullHere ? "마감" : peak ? "주말" : "";
          const bg = isIn || isOut ? C.fire : mid ? C.fireSoft : "#fff";
          const color = isIn || isOut ? "#fff" : past ? "#a9a9a9" : C.ink;
          return (
            <button
              key={key(d)}
              type="button"
              disabled={past}
              onClick={() => pick(d)}
              aria-pressed={!!(isIn || isOut)}
              aria-label={`${d.getMonth() + 1}월 ${d.getDate()}일 ${DOW[d.getDay()]}요일${fullHere ? " 마감" : peak ? " 주말 요금" : ""}${sameDay(d, today) ? " 오늘" : ""}`}
              className={`flex h-[52px] flex-col items-center justify-center rounded-[6px] text-[15px] tabular-nums disabled:cursor-default ${fullHere && !isIn && !isOut ? "cp-hatch" : ""} ${focusRing}`}
              style={{ background: bg, color, outlineColor: C.fire, textDecoration: fullHere && !isIn && !isOut ? "line-through" : undefined, border: sameDay(d, today) ? `1.5px solid ${C.fire}` : "1.5px solid transparent" }}
            >
              <span className={first ? "font-bold" : ""}>{first ? `${d.getMonth() + 1}/1` : d.getDate()}</span>
              <span className="text-[10px] leading-none" style={{ color: isIn || isOut ? "#fff" : fullHere ? C.ink : peak ? C.fireText : "transparent" }}>
                {label || "."}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[14px]">
        <p>
          {range.in ? (
            <>
              입실 <b>{fmtKo(range.in)}</b> 14:00
              {range.out ? (
                <>
                  <span className="mx-1" style={{ color: C.muted }}>~</span>
                  퇴실 <b>{fmtKo(range.out)}</b> 11:00 <b>({nights}박)</b>
                </>
              ) : (
                <span className="ml-2" style={{ color: C.muted }}>
                  퇴실일을 누르세요
                </span>
              )}
            </>
          ) : (
            <span style={{ color: C.muted }}>입실일을 누르세요</span>
          )}
        </p>
        {range.in && (
          <button type="button" onClick={() => { onChange({ in: null, out: null }); setMsg(null); }} className={`${btn} rounded-[6px] px-2 py-1 text-[13px] underline underline-offset-4`} style={{ color: C.muted, outlineColor: C.fire }}>
            날짜 지우기
          </button>
        )}
      </div>
      {msg && (
        <p className="mt-2 text-[14px] font-bold" role="alert" style={{ color: C.error }}>
          {msg}
        </p>
      )}
    </div>
  );
}

/* ===== 3. 장비 대여 ===== */

function Stepper({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (v: number) => void; label: string }) {
  const side = `${btn} h-9 w-9 rounded-[6px] border disabled:opacity-35`;
  return (
    <div className="inline-flex items-center gap-1" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${label} 빼기`} className={side} style={{ borderColor: C.edge, color: C.ink, outlineColor: C.fire }}>
        <Minus size={16} aria-hidden />
      </button>
      <span className="w-8 text-center text-[16px] font-bold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${label} 더하기`} className={side} style={{ borderColor: C.edge, color: C.ink, outlineColor: C.fire }}>
        <Plus size={16} aria-hidden />
      </button>
    </div>
  );
}

function RentalList({ qty, setQty }: { qty: Qty; setQty: (f: (q: Qty) => Qty) => void }) {
  return (
    <ul className="mt-3 divide-y rounded-[8px] border bg-white" style={{ borderColor: C.line }}>
      {RENTALS.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3" style={{ borderColor: C.line }}>
          <div className="min-w-0">
            <p className="text-[15px] font-bold">{r.name}</p>
            <p className="text-[14px] tabular-nums" style={{ color: C.muted }}>
              {won(r.price)}
            </p>
          </div>
          <Stepper value={qty[r.id] ?? 0} min={0} max={4} label={r.name} onChange={(v) => setQty((q) => ({ ...q, [r.id]: v }))} />
        </li>
      ))}
    </ul>
  );
}

/* ===== 4. 예약 신청 ===== */

function BookingForm({
  site,
  range,
  nights,
  peakNights,
  people,
  setPeople,
  cars,
  setCars,
  qty,
  fees,
  today,
  onSubmit,
}: {
  site: Site;
  range: Range;
  nights: Date[];
  peakNights: number;
  people: number;
  setPeople: (n: number) => void;
  cars: number;
  setCars: (n: number) => void;
  qty: Qty;
  fees: { site: number; extra: number; rent: number; total: number };
  today: Date;
  onSubmit: (b: Booking) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const rate = RATE[site.type];
  const ready = range.in && range.out;
  const rentLines = RENTALS.filter((r) => (qty[r.id] ?? 0) > 0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!range.in || !range.out) {
      setErr("입실일과 퇴실일을 먼저 골라 주세요.");
      document.getElementById("cp-calendar")?.scrollIntoView({ block: "start" });
      return;
    }
    if (name.trim().length < 2) {
      setErr("예약자 이름을 적어 주세요.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      setErr("휴대폰 번호를 다시 확인해 주세요.");
      return;
    }
    setErr(null);
    const seq = (parseInt(digits.slice(-3), 10) % 900) + 100;
    onSubmit({
      no: `CP-${today.getFullYear()}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${seq}`,
      site,
      checkIn: range.in,
      checkOut: range.out,
      name: name.trim(),
      phone,
      people,
      cars,
      total: fees.total,
    });
  };

  const field = "mt-1 w-full rounded-[6px] border bg-white px-3 py-2.5 text-[16px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";

  return (
    <form onSubmit={submit} noValidate className="mt-3 rounded-[8px] border bg-white p-4 md:p-5" style={{ borderColor: C.line }}>
      {/* 요금 계산 */}
      <dl className="grid gap-1.5 text-[15px] tabular-nums">
        <div className="flex justify-between gap-3">
          <dt>
            {site.id} {rate.name}
            {ready ? (
              <span className="ml-1" style={{ color: C.muted }}>
                {nights.length - peakNights > 0 && `평일 ${nights.length - peakNights}박`}
                {nights.length - peakNights > 0 && peakNights > 0 && ", "}
                {peakNights > 0 && `주말 ${peakNights}박`}
              </span>
            ) : (
              <span className="ml-1" style={{ color: C.muted }}>
                날짜 선택 전
              </span>
            )}
          </dt>
          <dd className="font-bold">{won(fees.site)}</dd>
        </div>
        {fees.extra > 0 && (
          <div className="flex justify-between gap-3">
            <dt style={{ color: C.muted }}>
              추가 {people > rate.base ? `인원 ${people - rate.base}명` : ""}
              {people > rate.base && cars > 1 ? ", " : ""}
              {cars > 1 ? `차량 ${cars - 1}대` : ""} x {nights.length}박
            </dt>
            <dd>{won(fees.extra)}</dd>
          </div>
        )}
        {rentLines.map((r) => (
          <div key={r.id} className="flex justify-between gap-3">
            <dt style={{ color: C.muted }}>
              {r.name.split(" (")[0]} {qty[r.id]}개{ready ? ` x ${nights.length}박` : ""}
            </dt>
            <dd>{won((qty[r.id] ?? 0) * r.price * Math.max(1, nights.length))}</dd>
          </div>
        ))}
        <div className="mt-1 flex justify-between gap-3 border-t pt-2 text-[18px]" style={{ borderColor: C.line }}>
          <dt className="font-bold">합계</dt>
          <dd className="font-bold" style={{ color: C.fireText }}>
            {won(ready ? fees.total : fees.site)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-[14px] font-bold">
          예약자 이름
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={{ borderColor: C.edge, outlineColor: C.fire }} />
        </label>
        <label className="block text-[14px] font-bold">
          휴대폰
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" autoComplete="tel" placeholder="010-0000-0000" className={field} style={{ borderColor: C.edge, outlineColor: C.fire }} />
        </label>
        <div className="flex items-center justify-between gap-3 text-[14px] font-bold sm:col-span-2">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Users size={16} aria-hidden style={{ color: C.forest }} /> 인원 <span className="font-normal" style={{ color: C.muted }}>기본 {rate.base}인</span>
          </span>
          <Stepper value={people} min={1} max={MAX_PEOPLE} label="인원" onChange={setPeople} />
        </div>
        <div className="flex items-center justify-between gap-3 text-[14px] font-bold sm:col-span-2">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Car size={16} aria-hidden style={{ color: C.forest }} /> 차량 <span className="font-normal" style={{ color: C.muted }}>1대 포함</span>
          </span>
          <Stepper value={cars} min={1} max={2} label="차량" onChange={setCars} />
        </div>
      </div>

      {err && (
        <p className="mt-3 text-[14px] font-bold" role="alert" style={{ color: C.error }}>
          {err}
        </p>
      )}

      <button type="submit" data-gtm-cta="campsite_submit" className={`${btn} mt-5 w-full rounded-[8px] px-5 py-3.5 text-[17px]`} style={{ background: C.fire, color: "#fff", outlineColor: C.fire }}>
        예약 신청
      </button>
      <p className="mt-2 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
        입금 확인 뒤 예약이 확정됩니다. 신청 다음 날 18시까지 미입금 시 자동 취소.
      </p>
    </form>
  );
}

function Receipt({ booking, today, reduce, onReset }: { booking: Booking; today: Date; reduce: boolean; onReset: () => void }) {
  const due = daysAgo(today, -1);
  const nights = dayDiff(booking.checkIn, booking.checkOut);
  const row = "flex justify-between gap-3 py-1.5";
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: PANEL_MS / 1000, ease: EASE }}
      className="mt-3 rounded-[8px] border p-4 md:p-5"
      style={{ borderColor: C.night, background: C.night, color: C.paper }}
      role="status"
    >
      <p className="inline-flex items-center gap-2 text-[22px] font-bold">
        <Check size={22} aria-hidden /> 예약 신청 접수
      </p>
      <p className="mt-1 text-[15px] opacity-90">입금이 확인되면 예약 확정 문자를 보내 드려요.</p>
      <dl className="mt-4 divide-y text-[15px] tabular-nums" style={{ borderColor: "rgba(246,243,234,0.2)" }}>
        <div className={row}>
          <dt className="opacity-80">예약번호</dt>
          <dd className="text-[17px] font-bold">
            {booking.no}
          </dd>
        </div>
        <div className={row}>
          <dt className="opacity-80">사이트</dt>
          <dd className="font-bold">
            {booking.site.id} {RATE[booking.site.type].name}
          </dd>
        </div>
        <div className={row}>
          <dt className="opacity-80">일정</dt>
          <dd className="text-right">
            {fmtKo(booking.checkIn)} 14:00 입실
            <br />
            {fmtKo(booking.checkOut)} 11:00 퇴실 ({nights}박)
          </dd>
        </div>
        <div className={row}>
          <dt className="opacity-80">예약자</dt>
          <dd>
            {maskName(booking.name)} {maskPhone(booking.phone)}
          </dd>
        </div>
        <div className={row}>
          <dt className="opacity-80">인원, 차량</dt>
          <dd>
            {booking.people}명, {booking.cars}대
          </dd>
        </div>
        <div className={row}>
          <dt className="opacity-80">입금액</dt>
          <dd className="text-[18px] font-bold">
            {won(booking.total)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 rounded-[8px] p-4 text-[15px] leading-[1.7]" style={{ background: "rgba(246,243,234,0.1)" }}>
        <p className="font-bold">입금 안내</p>
        <p>{BANK}</p>
        <p>
          입금 기한 <b>{fmtKo(due)} 18:00</b>. 기한 안에 입금되지 않으면 자동 취소됩니다.
        </p>
        <p>입금자명은 예약자 이름과 같게 해 주세요. 다르면 관리사무소로 알려 주세요.</p>
      </div>
      <div className="mt-3 grid gap-1 text-[14px] opacity-90">
        <p className="inline-flex items-center gap-1.5">
          <Phone size={15} aria-hidden /> 담당 창구 관리사무소 {TEL} (09:00~20:00), {KAKAO}
        </p>
        <p className="inline-flex items-center gap-1.5">
          <Clock size={15} aria-hidden /> 입금 확인 당일 예약 확정 문자 발송. 20시 이후 입금은 다음 날 오전 회신.
        </p>
      </div>
      <button type="button" onClick={onReset} className={`${btn} mt-5 rounded-[6px] border px-4 py-2 text-[14px]`} style={{ borderColor: "rgba(255,255,255,0.6)", color: C.paper, outlineColor: C.paper }}>
        다른 날짜로 예약
      </button>
    </motion.div>
  );
}

/* ===== 요금 안내 ===== */

function PriceTable() {
  const th = "border-b px-3 py-2.5 text-left text-[14px] font-bold";
  const td = "border-b px-3 py-2.5 text-[15px] tabular-nums";
  return (
    <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="overflow-x-auto rounded-[8px] border bg-white" style={{ borderColor: C.line }}>
        <table className="w-full min-w-[520px] border-collapse">
          <caption className="sr-only">사이트별 1박 요금</caption>
          <thead>
            <tr style={{ background: C.paperDim }}>
              <th scope="col" className={th} style={{ borderColor: C.edge }}>
                구분
              </th>
              <th scope="col" className={th} style={{ borderColor: C.edge }}>
                평일
              </th>
              <th scope="col" className={th} style={{ borderColor: C.edge }}>
                주말, 공휴일 전날
              </th>
              <th scope="col" className={th} style={{ borderColor: C.edge }}>
                기본 인원
              </th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(RATE) as SiteType[]).map((t) => (
              <tr key={t}>
                <th scope="row" className={`${td} text-left font-bold`} style={{ borderColor: C.line }}>
                  {RATE[t].name}
                  <span className="ml-1 text-[13px] font-normal" style={{ color: C.muted }}>
                    {t === "deck" ? "A, B구역" : t === "auto" ? "C구역" : "G1, G2"}
                  </span>
                </th>
                <td className={td} style={{ borderColor: C.line }}>
                  {won(RATE[t].weekday)}
                </td>
                <td className={td} style={{ borderColor: C.line }}>
                  {won(RATE[t].weekend)}
                </td>
                <td className={td} style={{ borderColor: C.line }}>
                  {RATE[t].base}인, 차량 1대
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="grid gap-2 self-start rounded-[8px] border bg-white p-4 text-[15px] leading-[1.6]" style={{ borderColor: C.line }}>
        <li>주말 요금은 금, 토 밤과 공휴일 전날 밤에 적용돼요.</li>
        <li>
          기본 인원 초과 1인 {won(EXTRA_PERSON)}, 차량 추가 1대 {won(EXTRA_CAR)} (1박 기준, 최대 {MAX_PEOPLE}인 2대).
        </li>
        <li>장비 대여는 1박 기준이고 입실 때 사이트에 준비해 둬요. 장작 1망 {won(10_000)}은 매점에서 따로 팔아요.</li>
        <li>만 3세 이하는 인원에서 빼요.</li>
        <li>글램핑은 침구, 난방, 전용 화장실 포함. 취사 도구는 대여 품목에서 고르세요.</li>
      </ul>
    </div>
  );
}

/* ===== 5. 이용 안내, 환불 규정, 오시는 길 ===== */

function InfoGrid() {
  const items = [
    {
      icon: Clock,
      title: "입실, 퇴실",
      lines: ["입실 14:00, 퇴실 11:00", "퇴실 시간을 넘기면 1시간당 10,000원", "얼리 체크인은 당일 관리사무소에 전화로 확인"],
    },
    {
      icon: Tent,
      title: "매너타임",
      lines: ["22:00~07:00", "음악, 발전기, 큰 소리 금지", "차량 이동은 매너타임 전에 마쳐 주세요"],
    },
    {
      icon: Flame,
      title: "화기 사용",
      lines: ["화로대 위에서만 불을 피워요. 바닥 직화 금지", "데크 위 화로대는 받침 필수", "불씨는 사이트마다 있는 소화통에 버려 주세요", "텐트 안 난로, 가스 사용 금지"],
    },
    {
      icon: Dog,
      title: "반려동물",
      lines: ["C구역 잔디 오토 사이트만 동반 가능", "목줄과 배변 봉투 필수, 1마리 5,000원", "데크와 글램핑은 동반 불가"],
    },
  ];
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      {items.map(({ icon: Icon, title, lines }) => (
        <div key={title} className="rounded-[8px] border bg-white p-4 md:p-5" style={{ borderColor: C.line }}>
          <p className="inline-flex items-center gap-2 text-[19px] font-bold" style={{ color: C.night }}>
            <Icon size={22} aria-hidden style={{ color: C.fireDeep }} /> {title}
          </p>
          <ul className="mt-2 grid gap-1 text-[15px] leading-[1.6]">
            {lines.map((l) => (
              <li key={l} className="flex gap-2">
                <span className="mt-[9px] inline-block h-1.5 w-1.5 flex-none rounded-full" style={{ background: C.forest }} aria-hidden />
                {l}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function RefundTable() {
  const rows: [string, string][] = [
    ["이용일 7일 전까지", "100% 환불"],
    ["이용일 5~6일 전", "70% 환불"],
    ["이용일 3~4일 전", "50% 환불"],
    ["이용일 2일 전", "30% 환불"],
    ["이용일 1일 전, 당일", "환불 불가"],
  ];
  const td = "border-b px-3 py-2.5 text-[15px]";
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="overflow-hidden rounded-[8px] border bg-white" style={{ borderColor: C.line }}>
        <table className="w-full border-collapse">
          <caption className="px-3 py-2.5 text-left text-[18px] font-bold" style={{ background: C.paperDim, color: C.night }}>
            환불 규정
          </caption>
          <tbody>
            {rows.map(([when, rate]) => (
              <tr key={when}>
                <th scope="row" className={`${td} text-left font-bold`} style={{ borderColor: C.line }}>
                  {when}
                </th>
                <td className={`${td} text-right tabular-nums`} style={{ borderColor: C.line }}>
                  {rate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="grid gap-2 self-start rounded-[8px] border bg-white p-4 text-[15px] leading-[1.6]" style={{ borderColor: C.line }}>
        <li>취소는 관리사무소 전화 또는 {KAKAO}로 접수하고, 접수 시각 기준으로 계산해요.</li>
        <li>호우, 태풍, 대설 특보로 캠핑장이 문을 닫으면 전액 환불해요. 손님 쪽 날씨 사정은 규정대로 처리해요.</li>
        <li>날짜 변경은 1회, 이용일 3일 전까지 가능해요. 변경 뒤 취소는 변경 전 날짜 기준이에요.</li>
        <li>환불은 신청 뒤 3영업일 안에 입금 계좌로 돌려드려요.</li>
      </ul>
    </div>
  );
}

function Directions() {
  return (
    <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <svg viewBox="0 0 640 320" className="h-auto w-full rounded-[8px] border" role="img" aria-label="ㅇㄷ고속도로 ㅍㅊ 나들목에서 나와 00번 국도를 타고 ㅇㅇ면 방향으로 12km, ㅇㅇ교를 건너 강변길로 2km 들어오면 캠핑장 입구가 나오는 약도" style={{ background: "#f2f2ef", borderColor: C.line }}>
        <path d="M0 250 L640 190" stroke="#b5b5b1" strokeWidth="18" fill="none" />
        <path d="M0 250 L640 190" stroke="#fff" strokeWidth="2" strokeDasharray="14 10" fill="none" />
        <text x={40} y={236} fontSize="14" fontWeight={700} fill={C.ink}>
          ㅇㄷ고속도로
        </text>
        <circle cx={300} cy={222} r={9} fill="#fff" stroke={C.ink} strokeWidth={2} />
        <text x={300} y={262} textAnchor="middle" fontSize="14" fontWeight={700} fill={C.ink}>
          ㅍㅊ 나들목
        </text>
        <path d="M300 222 L340 150 L420 120" stroke="#dcdad2" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x={360} y={176} fontSize="13" fill={C.ink}>
          00번 국도 12km
        </text>
        <path d="M420 120 L470 80 L520 70" stroke="#dcdad2" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M380 10 C 420 60, 440 100, 470 140 C 490 170, 520 180, 560 230" stroke="#cfdbe2" strokeWidth="16" fill="none" />
        <rect x={440} y={92} width={22} height={10} fill="#fff" stroke={C.ink} strokeWidth={1.5} />
        <text x={470} y={60} fontSize="13" fill={C.ink}>
          ㅇㅇ교 건너 강변길 2km
        </text>
        <g transform="translate(540 40)">
          <path d="M0 24 L14 2 L28 24 Z" fill={C.fire} stroke={C.ink} strokeWidth={1.5} />
          <text x={14} y={44} textAnchor="middle" fontSize="14" fontWeight={700} fill={C.ink}>
            곰파트너
          </text>
        </g>
      </svg>
      <div className="grid gap-4 self-start">
        <div className="rounded-[8px] border bg-white p-4 text-[15px] leading-[1.7]" style={{ borderColor: C.line }}>
          <p className="inline-flex items-center gap-2 text-[19px] font-bold" style={{ color: C.night }}>
            <Car size={22} aria-hidden style={{ color: C.fireDeep }} /> 자동차
          </p>
          <p className="mt-2">ㅇㄷ고속도로 ㅍㅊ 나들목으로 나와 00번 국도에서 ㅇㅇ면 방향으로 12km. ㅇㅇ교를 건너 바로 우회전해 강변길 2km. 서울에서 2시간 10분.</p>
          <p className="mt-1">내비게이션에 상호 또는 주소를 넣으세요. 마지막 2km는 비포장이라 서행해 주세요.</p>
        </div>
        <div className="rounded-[8px] border bg-white p-4 text-[15px] leading-[1.7]" style={{ borderColor: C.line }}>
          <p className="inline-flex items-center gap-2 text-[19px] font-bold" style={{ color: C.night }}>
            <MapPin size={22} aria-hidden style={{ color: C.fireDeep }} /> 주소, 연락처
          </p>
          <p className="mt-2">{ADDRESS}</p>
          <p>관리사무소 {TEL} (09:00~20:00)</p>
          <p>{KAKAO}</p>
          <p className="mt-1" style={{ color: C.muted }}>
            마지막 주유소는 나들목 근처. 캠핑장 안 매점은 장작, 얼음, 부탄가스까지만 있어요.
          </p>
        </div>
      </div>
    </div>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className={small ? "h-6 w-6 shrink-0" : "h-7 w-7 shrink-0"} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold leading-none tracking-[-0.03em]`}>곰파트너</span>
        <span className="text-[12px] font-semibold leading-none opacity-75">캠핑장 샘플</span>
      </span>
    </span>
  );
}
