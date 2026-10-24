"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { Armchair, CalendarCheck, Check, ChevronsLeftRight, ChevronsRight, Clock, Coffee, MapPin, MessageCircle, Phone, ShieldCheck, SquareParking, TrainFront, Truck } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 자동차 디테일링 샵 홈페이지 샘플: 가상의 곰파트너 디테일링 샵. 상호, 주소, 가격은 모두 가상이다.
   첫 화면 사진 출처: Pexels 사진 20131971. 차종별 차 사진은 AI 생성(Z-Image-Turbo), 비포는 같은 사진을 가공

   국내 디테일링 샵 홈페이지는 대개 이렇게 짜여 있다.
   메뉴: 시공 메뉴(유리막 코팅, 광택, 실내 클리닉, 썬팅, 언더코팅), 시공 과정, 시공 사례(비포 애프터), 예약, 오시는 길, 보증 안내.
   첫 화면은 차 사진 한 장과 전화, 카카오톡 채널, 네이버 예약 버튼. 가격은 차종(경차, 준중형, 중형, SUV, 대형)별 표.
   관용 문구: 당일 예약 가능, 픽업 서비스, 보증서 발급, 입고 전날 확인 문자, 시공 중 차량 보관.

   핵심 모션
   - 첫 화면(cd-poster): 광택 낸 차 사진 한 장이 화면을 채운다. 들어올 때 사진이 1.06배에서 1.6초 동안 천천히 다가오고,
     문장과 정보 줄은 0.3초 늦게 12px 아래에서 올라온다(CSS 키프레임, 끝 상태가 기본값). 스크롤하면 사진만 8% 느리게 움직인다.
   - 그 아래 차 그림이 스크롤에 따라 왼쪽부터 광택 입은 차로 바뀌고(clip-path), 바뀌는 자리에 빛줄기 하나가 지나간다.
   - 비교 구역은 손으로 밀어 보는 비포 애프터 슬라이더.
   동작 줄이기면 첫 화면은 멈춘 사진, 차 그림은 애프터 상태로 고정.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 차종 고르기: 경차, 준중형, 중형, SUV, 대형. 차 윤곽과 요금 기준이 바뀐다.
   2. 시공 메뉴 고르기: 여러 개 고르면 합계와 소요 시간(당일, 1박 2일)이 바뀐다.
   3. 비포 애프터 슬라이더: 드래그, 터치, 키보드 좌우. 고른 메뉴에 따라 애프터 쪽이 달라진다.
   4. 예약과 픽업: 날짜, 입고 시간, 픽업 서비스, 이름, 휴대폰, 차량 번호. 접수 완료 화면.
   5. 시공 과정 진행 바와 오시는 길. 영업시간은 오늘 요일이 진하다. */

const IMG = "/images/demo-car-detailing";

const BRAND = "곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 1층";
const KAKAO = "카카오톡 채널 곰파트너";
const TEL = "02-000-0000";

const C = {
  bg: "#141414",
  panel: "#1b1b1b",
  panel2: "#232323",
  line: "#2e2e2e",
  text: "#f2f2f2",
  muted: "#a3a3a3",
  accent: "#6fa8a2",
  accentInk: "#141414",
  paint: "#33507a",
  error: "#f0a39a",
};

/* 모션 상수. 차종 바꿀 때 윤곽 모핑 450ms, 진행 바 1400ms, 공통 ease. */
const EASE = [0.22, 1, 0.36, 1] as const;
const BAR_MS = 1400;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- 차종과 차 그림 ---------- */

const CAR_TYPES = ["경차", "준중형", "중형", "SUV", "대형"] as const;
type CarType = (typeof CAR_TYPES)[number];

/** 애프터 쪽에 어떤 시공이 들어갔는지. 비포는 전부 false. */
type Look = {
  after: boolean;
  gloss: boolean;
  polish: boolean;
  interior: boolean;
  tintFront: boolean;
  tintSide: boolean;
  under: boolean;
};

const SHOWROOM: Look = { after: true, gloss: true, polish: true, interior: true, tintFront: false, tintSide: false, under: false };


/* ---------- 시공 메뉴와 가격 ---------- */

type Svc = {
  id: string;
  group?: "coat" | "polish";
  name: string;
  desc: string;
  /** 경차, 준중형, 중형, SUV, 대형 순 */
  price: [number, number, number, number, number];
  hours: number;
  overnight?: boolean;
};

const SERVICES: Svc[] = [
  { id: "coat1", group: "coat", name: "유리막 코팅 1년", desc: "1단계 광택 포함, 보증 1년", price: [300000, 350000, 400000, 450000, 500000], hours: 6 },
  { id: "coat3", group: "coat", name: "유리막 코팅 3년", desc: "2단계 광택 포함, 하루 경화, 보증 3년", price: [600000, 680000, 750000, 850000, 950000], hours: 10, overnight: true },
  { id: "pol1", group: "polish", name: "광택 1단계", desc: "잔기스, 워터스팟 제거", price: [180000, 200000, 220000, 260000, 280000], hours: 3 },
  { id: "pol2", group: "polish", name: "광택 2단계", desc: "깊은 기스까지 두 번 작업", price: [300000, 330000, 360000, 400000, 450000], hours: 5 },
  { id: "interior", name: "실내 클리닉", desc: "시트, 매트, 천장 스팀 세척", price: [120000, 140000, 150000, 180000, 200000], hours: 3 },
  { id: "tintF", name: "썬팅 앞유리", desc: "열차단 필름, 농도 선택", price: [180000, 200000, 220000, 250000, 280000], hours: 1.5 },
  { id: "tintS", name: "썬팅 측후면", desc: "측면 4장, 뒷유리 1장", price: [220000, 250000, 280000, 320000, 350000], hours: 2 },
  { id: "under", name: "언더코팅", desc: "하부 방청, 겨울 전 추천", price: [250000, 280000, 300000, 350000, 400000], hours: 3 },
];

function lookFrom(picked: Set<string>): Look {
  const coat = picked.has("coat1") || picked.has("coat3");
  return {
    after: true,
    gloss: coat,
    polish: coat || picked.has("pol1") || picked.has("pol2"),
    interior: picked.has("interior"),
    tintFront: picked.has("tintF"),
    tintSide: picked.has("tintS"),
    under: picked.has("under"),
  };
}

function summarize(picked: Set<string>, ti: number) {
  const items = SERVICES.filter((s) => picked.has(s.id));
  const total = items.reduce((a, s) => a + s.price[ti], 0);
  const hours = items.reduce((a, s) => a + s.hours, 0);
  const overnight = items.some((s) => s.overnight) || hours > 8;
  const duration = items.length === 0 ? "선택 없음" : overnight ? "1박 2일" : `당일 약 ${Math.ceil(hours)}시간`;
  return { items, total, hours, overnight, duration };
}

/* ---------- 시공 과정, 영업시간 ---------- */

const STEPS = [
  { name: "세차", time: "30분", text: "고압수와 폼으로 모래부터 털어내요. 미트 세차는 두 통으로 해요." },
  { name: "철분 제거", time: "40분", text: "철분 제거제와 클레이로 도장에 박힌 쇳가루를 빼요. 이게 남으면 코팅이 안 붙어요." },
  { name: "폴리싱", time: "3시간", text: "도막 두께를 재고 잔기스를 갈아내요. 2단계는 컴파운드와 피니시로 두 번 돌려요." },
  { name: "코팅", time: "1시간", text: "유리막을 패널 하나씩 바르고 닦아내요. 실내는 적외선 조명 아래서 해요." },
  { name: "경화", time: "12시간", text: "실내에서 하루 말려요. 3년 코팅은 이 시간이 꼭 필요해서 1박 2일이에요." },
];

/** [요일 0~6, 영업 시간 글] 월~금, 토, 일 */
const HOURS: { days: number[]; label: string; open: string }[] = [
  { days: [1, 2, 3, 4, 5], label: "월 ~ 금", open: "09:00 ~ 19:00" },
  { days: [6], label: "토요일", open: "09:00 ~ 17:00" },
  { days: [0], label: "일요일", open: "휴무" },
];

const SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];
const BOOK_DAYS = 10;

/** 날짜와 입고 시간별로 이미 찬 자리. 실제로는 예약 시트에서 읽는다. 하루 입고 2대 기준. */
function slotFull(dayIdx: number, slot: number) {
  let h = (dayIdx + 5) * 2654435761 + (slot + 3) * 40503;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 97;
  return h % 4 === 0;
}

/** 차량 번호 뒷자리 두 개를 가린다. 12가 3456 -> 12가 34**, 123가 4567 -> 123가 45** */
function maskPlate(raw: string) {
  const s = raw.replace(/\s+/g, "");
  const m = s.match(/^(\d{2,3}[가-힣])(\d{2})(\d{2})$/);
  if (!m) return raw;
  return `${m[1]} ${m[2]}**`;
}

/* ---------- 페이지 ---------- */

export function CarDetailingDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [type, setType] = useState<CarType>("중형");
  const ti = CAR_TYPES.indexOf(type);
  const [picked, setPicked] = useState<Set<string>>(() => new Set());

  const toggle = (svc: Svc) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(svc.id)) {
        next.delete(svc.id);
        return next;
      }
      // 같은 묶음(코팅 1년과 3년, 광택 1단계와 2단계)은 하나만. 코팅에는 광택이 들어 있어 광택을 뺀다.
      if (svc.group) SERVICES.filter((o) => o.group === svc.group).forEach((o) => next.delete(o.id));
      if (svc.group === "coat") SERVICES.filter((o) => o.group === "polish").forEach((o) => next.delete(o.id));
      next.add(svc.id);
      return next;
    });
  };

  const sum = useMemo(() => summarize(picked, ti), [picked, ti]);
  const afterLook = useMemo(() => lookFrom(picked), [picked]);
  const hasCoat = picked.has("coat1") || picked.has("coat3");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const todayHours = HOURS.find((h) => h.days.includes(today.getDay()))!;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.text }}>
      <Poster reduce={reduce} todayHours={todayHours} onBook={() => go("cd-book")} />

      <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-4 md:px-6">
        <a href="#cd-hero" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }} className={`inline-flex items-center gap-2 rounded-[4px] ${focusRing}`} style={{ outlineColor: C.accent }}>
          <SampleLogo light />
        </a>
        <nav aria-label="주요 메뉴" className="hidden items-center gap-5 text-[15px] font-bold md:flex" style={{ color: C.muted }}>
          {[
            ["cd-menu", "시공 메뉴"],
            ["cd-compare", "비포 애프터"],
            ["cd-process", "시공 과정"],
            ["cd-way", "오시는 길"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={`rounded-[4px] px-1 py-1 hover:text-[#f2f2f2] ${focusRing}`} style={{ outlineColor: C.accent }}>
              {label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => go("cd-book")}
          data-gtm-cta="car-detailing_go_book"
          className={`inline-flex flex-none items-center gap-1.5 rounded-[6px] px-4 py-2 text-[15px] font-semibold ${focusRing}`}
          style={{ background: C.accent, color: C.accentInk, outlineColor: C.text }}
        >
          예약하기
        </button>
      </header>

      <Hero type={type} setType={setType} reduce={reduce} todayHours={todayHours} onBook={() => go("cd-book")} />

      {/* 시공 메뉴 */}
      <section id="cd-menu" aria-labelledby="cd-menu-title" className="mx-auto mt-8 max-w-[1200px] scroll-mt-4 px-4 md:mt-12 md:px-6">
        <SectionTitle id="cd-menu-title" title="시공 메뉴" side={`${type} 기준`} />
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <ul className="grid gap-2 sm:grid-cols-2">
            {SERVICES.map((svc) => {
              const on = picked.has(svc.id);
              const included = svc.group === "polish" && hasCoat;
              return (
                <li key={svc.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    aria-disabled={included || undefined}
                    onClick={() => !included && toggle(svc)}
                    className={`flex w-full items-start gap-3 rounded-[8px] border px-4 py-3 text-left transition-colors duration-150 ${focusRing} ${included ? "cursor-default" : ""}`}
                    style={{
                      borderColor: on ? C.accent : C.line,
                      background: on ? "rgba(111,168,162,0.08)" : C.panel,
                      color: included ? C.muted : C.text,
                      outlineColor: C.accent,
                    }}
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-[4px] border" style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : "transparent", color: C.accentInk }} aria-hidden>
                      {on && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <span className="text-[16px] font-bold">{svc.name}</span>
                        <span className="text-[16px] tabular-nums" style={{ color: on ? C.accent : C.text }}>
                          {included ? "코팅에 포함" : won(svc.price[ti])}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[14px]" style={{ color: C.muted }}>
                        {svc.desc}
                        {svc.overnight ? ", 1박 2일" : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <aside aria-live="polite" className="rounded-[8px] border p-5 lg:sticky lg:top-4" style={{ borderColor: C.line, background: C.panel2 }}>
            <p className="text-[14px] font-bold" style={{ color: C.muted }}>
              {type} 견적
            </p>
            <p className="mt-1 text-[32px] font-bold leading-none tabular-nums">
              {won(sum.total)}
            </p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
              <dt style={{ color: C.muted }}>항목</dt>
              <dd>{sum.items.length === 0 ? "선택 없음" : sum.items.map((s) => s.name).join(", ")}</dd>
              <dt style={{ color: C.muted }}>소요</dt>
              <dd className="font-bold">{sum.duration}</dd>
            </dl>
            <button
              type="button"
              onClick={() => go("cd-book")}
              data-gtm-cta="car-detailing_menu_book"
              className={`mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-[6px] px-4 py-3 text-[16px] font-semibold ${focusRing}`}
              style={{ background: C.accent, color: C.accentInk, outlineColor: C.text }}
            >
              이 메뉴로 예약하기
              <ChevronsRight size={18} aria-hidden />
            </button>
            <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
              부가세 포함. 도장 상태에 따라 현장에서 조정될 수 있어요.
            </p>
          </aside>
        </div>
      </section>

      {/* 비포 애프터 */}
      <section id="cd-compare" aria-labelledby="cd-compare-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cd-compare-title" title="비포 애프터" side={sum.items.length ? sum.items.map((s) => s.name).join(", ") : "세차만"} />
        <CompareSlider type={type} look={afterLook} reduce={reduce} />
      </section>

      {/* 예약 */}
      <section id="cd-book" aria-labelledby="cd-book-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cd-book-title" title="예약하기" side="당일 예약 가능" />
        <BookingForm today={today} reduce={reduce} type={type} sum={sum} />
      </section>

      {/* 시공 과정 */}
      <section id="cd-process" aria-labelledby="cd-process-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cd-process-title" title="시공 과정" side="유리막 코팅 기준" />
        <ProcessBar reduce={reduce} />
      </section>

      {/* 오시는 길, 보증 */}
      <section id="cd-way" aria-labelledby="cd-way-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="cd-way-title" title="오시는 길" side={ADDRESS} />
        <WayAndHours today={today} />
      </section>

      <section id="cd-warranty" aria-labelledby="cd-warranty-title" className="mx-auto mt-16 max-w-[1200px] px-4 md:mt-24 md:px-6">
        <SectionTitle id="cd-warranty-title" title="보증 안내" />
        <ul className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ["보증서 발급", "유리막 코팅은 시공 당일 1년 또는 3년 보증서를 드려요."],
            ["6개월 무상 점검", "코팅 뒤 6개월마다 광택 상태를 보고 메인터넌스를 해 드려요."],
            ["무상 재시공", "보증 기간 안에 코팅이 벗겨지면 해당 패널을 다시 시공해요."],
          ].map(([h, d]) => (
            <li key={h} className="flex gap-3 rounded-[8px] border p-4" style={{ borderColor: C.line, background: C.panel }}>
              <ShieldCheck size={22} aria-hidden className="mt-0.5 flex-none" style={{ color: C.accent }} />
              <div>
                <p className="text-[16px] font-bold">{h}</p>
                <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
                  {d}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pb-24 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted }}>
        <p>
          <SampleLogo light />
        </p>
        <p>
          {ADDRESS}. 전화 {TEL}. {KAKAO}.
        </p>
        <p>월 ~ 금 09:00 ~ 19:00, 토 09:00 ~ 17:00, 일요일 휴무</p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

function SectionTitle({ id, title, side }: { id: string; title: string; side?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b pb-3" style={{ borderColor: C.line }}>
      <h2 id={id} className="text-[26px] font-bold leading-tight tracking-[-0.02em] md:text-[32px]">
        {title}
      </h2>
      {side && (
        <p className="text-[14px] font-bold" style={{ color: C.accent }}>
          {side}
        </p>
      )}
    </div>
  );
}

/* ---------- 0. 첫 화면: 사진 한 장 ---------- */

/* 문장과 정보 줄 등장: 0.3초 뒤 0.7초 동안 12px 아래에서 올라온다. 끝 상태가 기본값이라 JS 없이도 보인다. */
const POSTER_CSS = `
@keyframes cd-rise { from { opacity: 0; transform: translateY(12px); } }
.cd-rise { animation: cd-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }
@media (prefers-reduced-motion: reduce) { .cd-rise { animation: none !important; } }
`;

function Poster({ reduce, todayHours, onBook }: { reduce: boolean; todayHours: { open: string }; onBook: () => void }) {
  const wrapRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, (v) => `${v * 8}%`);

  return (
    <section ref={wrapRef} id="cd-poster" aria-labelledby="cd-poster-title" className="relative min-h-[100svh] overflow-hidden" style={{ background: C.bg }}>
      <style>{POSTER_CSS}</style>
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: photoY }}>
        <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : 1.6, ease: EASE }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="조명 아래 보닛에 천장 불빛이 비치는 검정 스포츠카 정면"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 68%" }}
          />
        </motion.div>
      </motion.div>
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.15) 25%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.8))" }}
        aria-hidden
      />

      {/* 상호와 예약 버튼 */}
      <div className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-[1200px] items-center justify-between px-4 pt-4 md:px-6 md:pt-6">
        <p>
          <SampleLogo light small />
        </p>
        <button
          type="button"
          onClick={onBook}
          data-gtm-cta="car-detailing_poster_cta"
          className={`inline-flex items-center gap-1.5 rounded-[6px] px-4 py-2.5 text-[15px] font-semibold ${focusRing}`}
          style={{ background: C.accent, color: C.accentInk, outlineColor: C.text }}
        >
          <CalendarCheck size={17} aria-hidden />
          예약하기
        </button>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1200px] flex-col justify-end px-4 pb-14 pt-28 md:px-6 md:pb-20">
        <div className={reduce ? undefined : "cd-rise"}>
          <h1
            id="cd-poster-title"
            className="text-[36px] font-bold leading-[1.2] tracking-[-0.03em] [word-break:keep-all] md:text-[clamp(40px,5vw,72px)]"
            style={{ color: C.text }}
          >
            유리막 코팅부터
            <br />
            실내 세차까지
          </h1>
          <p className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium md:mt-5 md:text-[17px]" style={{ color: "#d6d6d6" }}>
            <Clock size={16} aria-hidden />
            오늘 {todayHours.open === "휴무" ? "휴무" : `${todayHours.open} 영업`}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- 1. 스크롤 광택 와이프 ---------- */

function Hero({ type, setType, reduce, todayHours, onBook }: { type: CarType; setType: (t: CarType) => void; reduce: boolean; todayHours: { label: string; open: string }; onBook: () => void }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  // 장면 높이 220vh. 꼭대기가 화면 위에 닿을 때 0, 바닥이 화면 아래에 닿을 때 1.
  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ["start start", "end end"] });
  // 진행 0.05~0.8 사이에 왼쪽부터 오른쪽으로 애프터가 덧씌워진다.
  const wipe = useTransform(scrollYProgress, [0.05, 0.8], [0, 100]);
  const rest = useTransform(wipe, (v) => 100 - v);
  const clip = useMotionTemplate`inset(0 ${rest}% 0 0)`;
  const beamLeft = useMotionTemplate`${wipe}%`;
  const beamOp = useTransform(wipe, (v) => (v <= 0 || v >= 100 ? 0 : Math.min(1, v / 2, (100 - v) / 4)));
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const hint = useTransform(wipe, (v) => clamp01(1 - v / 8));
  const afterLabelOp = useTransform(wipe, (v) => clamp01(v / 30));
  const beforeLabelOp = useTransform(wipe, (v) => clamp01((100 - v) / 30));

  return (
    <div ref={sceneRef} id="cd-hero" className={reduce ? "" : "h-[220vh]"}>
      <div className={`${reduce ? "" : "sticky top-0 min-h-[100svh]"} mx-auto flex max-w-[1200px] flex-col justify-start px-4 pb-6 pt-3 md:justify-center md:px-6`}>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2 className="text-[30px] font-bold leading-[1.15] tracking-[-0.02em] md:text-[44px]">
            {BRAND}
          </h2>
          <p className="inline-flex items-center gap-1.5 text-[15px] font-bold" style={{ color: C.muted }}>
            <Clock size={16} aria-hidden style={{ color: C.accent }} />
            오늘 {todayHours.open === "휴무" ? "휴무" : `${todayHours.open} 영업`}
          </p>
        </div>

        <div className="relative mt-3 overflow-hidden rounded-[8px] md:mt-5" style={{ background: `radial-gradient(ellipse at 50% 100%, ${C.panel2} 0%, ${C.bg} 70%)` }}>
          <div className="relative aspect-[1344/576] w-full">
            <CarPhoto type={type} before className="absolute inset-0" />
            <motion.div className="absolute inset-0" style={{ clipPath: reduce ? "inset(0 0 0 0)" : clip }}>
              <CarPhoto type={type} look={SHOWROOM} className="absolute inset-0" />
            </motion.div>
            {!reduce && (
              <>
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 w-[5%] -translate-x-1/2 -skew-x-[14deg]"
                  style={{ left: beamLeft, opacity: beamOp, background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%)", mixBlendMode: "screen" }}
                />
              </>
            )}
            <motion.div className="absolute left-3 top-3 text-[12px] font-semibold tracking-wide md:left-4 md:top-4 md:text-[13px]" style={{ color: C.muted, opacity: reduce ? 0 : beforeLabelOp }}>
              비포
            </motion.div>
            <motion.div className="absolute right-3 top-3 text-[12px] font-semibold tracking-wide md:right-4 md:top-4 md:text-[13px]" style={{ color: C.accent, opacity: reduce ? 1 : afterLabelOp }}>
              애프터
            </motion.div>
          </div>
        </div>
        {!reduce && (
          <motion.p aria-hidden className="pointer-events-none mt-2 h-5 text-center text-[13px] font-bold" style={{ color: C.muted, opacity: hint }}>
            아래로 내리면 광택이 올라와요
          </motion.p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 md:mt-4">
          <div id="cd-size" role="group" aria-label="차종" className="flex flex-wrap gap-1.5">
            {CAR_TYPES.map((t) => {
              const on = t === type;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setType(t)}
                  className={`rounded-[6px] border px-3.5 py-1.5 text-[15px] font-semibold transition-colors duration-150 ${focusRing}`}
                  style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : "transparent", color: on ? C.accentInk : C.text, outlineColor: C.accent }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`tel:${TEL.replace(/-/g, "")}`} className={`inline-flex items-center gap-1.5 rounded-[6px] border px-4 py-2.5 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.accent }}>
              <Phone size={16} aria-hidden /> 전화
            </a>
            <button type="button" className={`inline-flex items-center gap-1.5 rounded-[6px] border px-4 py-2.5 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.accent }} data-gtm-cta="car-detailing_kakao">
              <MessageCircle size={16} aria-hidden /> 카카오톡 채널
            </button>
            <button type="button" onClick={onBook} data-gtm-cta="car-detailing_hero_book" className={`inline-flex items-center gap-1.5 rounded-[6px] px-4 py-2.5 text-[15px] font-semibold ${focusRing}`} style={{ background: C.accent, color: C.accentInk, outlineColor: C.text }}>
              예약하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 차 사진 ---------- */

/** 차종별 옆모습 사진. 비포(-before)는 같은 사진에 바랜 도장, 물때, 흙먼지를 입혀 만들어 슬라이더로 밀어도 차 위치가 맞는다 */
const CAR_FILE: Record<CarType, string> = { 경차: "light", 준중형: "compact", 중형: "mid", SUV: "suv", 대형: "large" };

/** 고른 시공에 따라 애프터 사진 느낌을 조금씩 바꾼다. 세차만 하면 살짝 덜 선명하게, 코팅이면 더 진하고 반짝이게 */
function lookFilter(l: Look) {
  if (l.gloss) return "contrast(1.08) saturate(1.15) brightness(1.03)";
  if (l.polish) return "none";
  return "contrast(0.95) saturate(0.9)";
}

function CarPhoto({ type, before, look, className = "" }: { type: CarType; before?: boolean; look?: Look; className?: string }) {
  const file = `${IMG}/car-${CAR_FILE[type]}${before ? "-before" : ""}.jpg`;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다
    <img
      src={file}
      alt={`${type} 차량 ${before ? "시공 전, 바랜 도장과 물때" : "시공 뒤, 광택이 살아난 도장"}`}
      width={1344}
      height={576}
      draggable={false}
      className={`h-full w-full object-cover ${className}`}
      style={{ filter: !before && look ? lookFilter(look) : undefined }}
    />
  );
}

/* ---------- 3. 비포 애프터 슬라이더 ---------- */

function CompareSlider({ type, look, reduce }: { type: CarType; look: Look; reduce: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const pos = useMotionValue(50);
  const clip = useMotionTemplate`inset(0 0 0 ${pos}%)`;
  const left = useMotionTemplate`${pos}%`;
  const dragging = useRef(false);

  useMotionValueEvent(pos, "change", (v) => handleRef.current?.setAttribute("aria-valuenow", String(Math.round(v))));

  const setFromX = (clientX: number) => {
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    pos.set(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    let next: number | null = null;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = pos.get() - step;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = pos.get() + step;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = 100;
    if (next === null) return;
    e.preventDefault();
    pos.set(Math.min(100, Math.max(0, next)));
  };

  return (
    <div className="mt-5">
      <div
        ref={boxRef}
        className="relative select-none overflow-hidden rounded-[8px]"
        style={{ background: `radial-gradient(ellipse at 50% 100%, ${C.panel2} 0%, ${C.bg} 70%)`, touchAction: "pan-y" }}
        onPointerDown={(e) => {
          dragging.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setFromX(e.clientX);
          handleRef.current?.focus({ preventScroll: true });
        }}
        onPointerMove={(e) => dragging.current && setFromX(e.clientX)}
        onPointerUp={(e) => {
          dragging.current = false;
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        <div className="relative aspect-[1344/576] w-full">
          <CarPhoto type={type} before className="absolute inset-0" />
          <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
            <CarPhoto type={type} look={look} className="absolute inset-0" />
          </motion.div>
          <span className="pointer-events-none absolute left-3 top-3 rounded-[4px] px-2 py-0.5 text-[12px] font-semibold md:left-4 md:top-4 md:text-[13px]" style={{ background: "rgba(21,23,26,0.8)", color: C.text }}>
            비포
          </span>
          <span className="pointer-events-none absolute right-3 top-3 rounded-[4px] px-2 py-0.5 text-[12px] font-semibold md:right-4 md:top-4 md:text-[13px]" style={{ background: C.accent, color: C.accentInk }}>
            애프터
          </span>
          {/* 핸들: 세로 선과 둥근 손잡이. 키보드 좌우로도 움직인다. */}
          <motion.div className="absolute inset-y-0 w-0" style={{ left }}>
            <div className="absolute inset-y-0 -left-px w-[2px]" style={{ background: C.text }} aria-hidden />
            <div
              ref={handleRef}
              role="slider"
              tabIndex={0}
              aria-label="비포 애프터 경계"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={50}
              aria-valuetext="왼쪽이 비포, 오른쪽이 애프터"
              onKeyDown={onKey}
              className={`absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border ${focusRing}`}
              style={{ background: C.bg, borderColor: C.text, color: C.text, outlineColor: C.accent }}
            >
              <ChevronsLeftRight size={22} aria-hidden />
            </div>
          </motion.div>
        </div>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-1 text-[14px] sm:grid-cols-2" style={{ color: C.muted }}>
        <div className="flex gap-2">
          <dt className="font-bold" style={{ color: C.text }}>
            비포
          </dt>
          <dd>바랜 클리어, 잔기스, 흙탕 자국, 뿌연 창</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-bold" style={{ color: C.accent }}>
            애프터
          </dt>
          <dd>{afterText(look)}</dd>
        </div>
      </dl>
    </div>
  );
}

function afterText(l: Look) {
  const parts: string[] = [];
  parts.push(l.gloss ? "코팅 광택과 반사" : "세차 뒤 본색");
  parts.push(l.polish ? "잔기스 제거" : "잔기스 남음");
  if (l.interior) parts.push("실내 밝아짐");
  if (l.tintFront || l.tintSide) parts.push(l.tintFront && l.tintSide ? "전면 측후면 썬팅" : l.tintFront ? "앞유리 썬팅" : "측후면 썬팅");
  if (l.under) parts.push("하부 무광 코팅");
  return parts.join(", ");
}

/* ---------- 4. 예약과 픽업 ---------- */

type Booked = {
  no: string;
  date: Date;
  slot: string;
  pickup: boolean;
  place: string;
  name: string;
  phone: string;
  plate: string;
};

function BookingForm({ today, reduce, type, sum }: { today: Date; reduce: boolean; type: CarType; sum: ReturnType<typeof summarize> }) {
  const days = Array.from({ length: BOOK_DAYS }, (_, i) => daysAgo(today, -i));
  const firstOpen = days.findIndex((d, i) => i > 0 && d.getDay() !== 0);
  const [dayIdx, setDayIdx] = useState(firstOpen < 0 ? 1 : firstOpen);
  const [slot, setSlot] = useState<number | null>(null);
  const [pickup, setPickup] = useState(false);
  const [place, setPlace] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Booked | null>(null);

  const day = days[dayIdx];
  const closed = day.getDay() === 0;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (closed) er.day = "일요일은 휴무예요. 다른 날을 골라 주세요.";
    if (slot === null) er.slot = "입고 시간을 골라 주세요.";
    if (name.trim().length < 2) er.name = "이름을 두 글자 이상 적어 주세요.";
    if (phone.replace(/\D/g, "").length < 10) er.phone = "휴대폰 번호를 확인해 주세요.";
    if (!/^\d{2,3}[가-힣]\s?\d{4}$/.test(plate.trim())) er.plate = "차량 번호를 12가 3456 처럼 적어 주세요.";
    if (pickup && place.trim().length < 2) er.place = "픽업 장소를 적어 주세요.";
    setErrors(er);
    if (Object.keys(er).length) return;
    const digits = phone.replace(/\D/g, "");
    const seed = (digits.split("").reduce((a, c) => a + Number(c), 0) * 7 + dayIdx * 13 + (slot ?? 0)) % 900;
    const no = `CD-${String(today.getFullYear()).slice(2)}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${String(100 + seed).padStart(3, "0")}`;
    setDone({ no, date: day, slot: SLOTS[slot ?? 0], pickup, place: place.trim(), name: name.trim(), phone, plate: plate.trim() });
  };

  const inputCls = `w-full rounded-[6px] border px-3 py-2.5 text-[16px] ${focusRing}`;
  const inputStyle = { borderColor: C.line, background: C.bg, color: C.text, outlineColor: C.accent } as const;
  const label = "block text-[14px] font-bold";

  // 확인 연락: 접수한 날 영업시간 안, 일요일이면 월요일
  const reply = today.getDay() === 0 ? daysAgo(today, -1) : today;

  if (done) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="mt-5 rounded-[8px] border p-5 md:p-7"
        style={{ borderColor: C.accent, background: C.panel }}
        role="status"
      >
        <p className="text-[14px] font-bold" style={{ color: C.accent }}>
          예약 접수 완료
        </p>
        <p className="mt-1 text-[30px] font-bold leading-none tabular-nums md:text-[34px]">
          {done.no}
        </p>
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-[15px] md:grid-cols-[auto_1fr_auto_1fr]">
          <dt style={{ color: C.muted }}>입고</dt>
          <dd className="font-bold">
            {fmtKo(done.date)} {done.slot}
          </dd>
          <dt style={{ color: C.muted }}>차량</dt>
          <dd className="font-bold">
            {type}, {maskPlate(done.plate)}
          </dd>
          <dt style={{ color: C.muted }}>예약자</dt>
          <dd>
            {maskName(done.name)}, {maskPhone(done.phone)}
          </dd>
          <dt style={{ color: C.muted }}>픽업</dt>
          <dd>{done.pickup ? `${done.place}에서 입고 시간에 가져가요` : "직접 입고"}</dd>
          <dt style={{ color: C.muted }}>시공</dt>
          <dd className="md:col-span-3">
            {sum.items.length ? sum.items.map((s) => s.name).join(", ") : "현장 상담 뒤 결정"}
            {sum.items.length ? `, ${won(sum.total)}, ${sum.duration}` : ""}
          </dd>
        </dl>
        <div className="mt-5 grid gap-4 border-t pt-5 md:grid-cols-2" style={{ borderColor: C.line }}>
          <div>
            <p className="text-[14px] font-bold" style={{ color: C.muted }}>
              담당 창구
            </p>
            <p className="mt-1 text-[15px] leading-[1.7]">
              전화 {TEL}
              <br />
              {KAKAO}
            </p>
            <p className="mt-2 text-[15px]">
              확인 연락 <b>{fmtKo(reply)} 영업시간 안</b>
            </p>
          </div>
          <ul className="grid gap-1.5 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
            <li>입고 전날 확인 문자를 드려요.</li>
            <li>차 안 귀중품은 미리 챙겨 주세요.</li>
            <li>{sum.overnight ? "1박 2일 시공은 실내 보관하고 다음 날 출고예요." : "당일 시공은 출고 30분 전에 연락드려요."}</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => {
            setDone(null);
            setSlot(null);
          }}
          className={`mt-5 rounded-[6px] border px-4 py-2 text-[15px] font-bold ${focusRing}`}
          style={{ borderColor: C.line, outlineColor: C.accent }}
        >
          다른 날로 다시 예약
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="grid gap-5">
        <fieldset>
          <legend className={label}>입고 날짜</legend>
          <div className="mt-2 grid grid-cols-5 gap-1.5 sm:grid-cols-10">
            {days.map((d, i) => {
              const on = i === dayIdx;
              const sun = d.getDay() === 0;
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setDayIdx(i);
                    setSlot(null);
                  }}
                  className={`flex flex-col items-center rounded-[6px] border py-2 text-[14px] leading-tight ${focusRing}`}
                  style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : C.panel, color: on ? C.accentInk : sun ? C.muted : C.text, outlineColor: C.accent }}
                >
                  <span className="text-[12px]">{i === 0 ? "오늘" : DOW[d.getDay()]}</span>
                  <span className="mt-0.5 text-[16px] font-bold tabular-nums">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
          {errors.day && <Err>{errors.day}</Err>}
        </fieldset>

        <fieldset>
          <legend className={label}>
            입고 시간 <span style={{ color: C.muted }}>{fmtKo(day)}</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SLOTS.map((s, i) => {
              const full = closed || slotFull(dayIdx, i);
              const on = slot === i;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={full}
                  aria-pressed={on}
                  onClick={() => setSlot(i)}
                  className={`rounded-[6px] border px-3.5 py-2 text-[15px] font-bold tabular-nums disabled:cursor-not-allowed disabled:line-through ${focusRing}`}
                  style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : C.panel, color: on ? C.accentInk : full ? C.muted : C.text, outlineColor: C.accent }}
                >
                  {s}
                  {full && !closed ? " 마감" : ""}
                </button>
              );
            })}
          </div>
          {closed && (
            <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
              일요일 휴무
            </p>
          )}
          {errors.slot && <Err>{errors.slot}</Err>}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cd-name" className={label}>
              이름
            </label>
            <input id="cd-name" value={name} onChange={(e) => setName(e.target.value)} className={`${inputCls} mt-1.5`} style={inputStyle} autoComplete="name" />
            {errors.name && <Err>{errors.name}</Err>}
          </div>
          <div>
            <label htmlFor="cd-phone" className={label}>
              휴대폰
            </label>
            <input id="cd-phone" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="010-0000-0000" className={`${inputCls} mt-1.5`} style={inputStyle} autoComplete="tel" />
            {errors.phone && <Err>{errors.phone}</Err>}
          </div>
          <div>
            <label htmlFor="cd-plate" className={label}>
              차량 번호
            </label>
            <input id="cd-plate" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="12가 3456" className={`${inputCls} mt-1.5`} style={inputStyle} />
            {errors.plate && <Err>{errors.plate}</Err>}
          </div>
          <div>
            <span className={label}>픽업 서비스</span>
            <label className="mt-1.5 flex cursor-pointer items-center gap-2.5 rounded-[6px] border px-3 py-2.5 text-[15px]" style={{ borderColor: pickup ? C.accent : C.line, background: C.panel }}>
              <input type="checkbox" checked={pickup} onChange={(e) => setPickup(e.target.checked)} className={`h-5 w-5 accent-[#6fa8a2] ${focusRing}`} style={{ outlineColor: C.accent }} />
              <Truck size={18} aria-hidden style={{ color: C.accent }} />
              ㅇㅇ구 안 무료 픽업
            </label>
          </div>
          {pickup && (
            <div className="sm:col-span-2">
              <label htmlFor="cd-place" className={label}>
                픽업 장소
              </label>
              <input id="cd-place" value={place} onChange={(e) => setPlace(e.target.value)} placeholder="아파트 이름, 동, 주차 위치" className={`${inputCls} mt-1.5`} style={inputStyle} />
              {errors.place && <Err>{errors.place}</Err>}
            </div>
          )}
        </div>
      </div>

      <aside className="rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.panel2 }}>
        <p className="text-[14px] font-bold" style={{ color: C.muted }}>
          예약 내용
        </p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
          <dt style={{ color: C.muted }}>차종</dt>
          <dd className="font-bold">{type}</dd>
          <dt style={{ color: C.muted }}>시공</dt>
          <dd>{sum.items.length ? sum.items.map((s) => s.name).join(", ") : "현장 상담"}</dd>
          <dt style={{ color: C.muted }}>합계</dt>
          <dd className="font-bold tabular-nums">{sum.items.length ? won(sum.total) : "-"}</dd>
          <dt style={{ color: C.muted }}>소요</dt>
          <dd>{sum.duration}</dd>
          <dt style={{ color: C.muted }}>입고</dt>
          <dd>
            {fmtKo(day)} {slot !== null ? SLOTS[slot] : ""}
          </dd>
        </dl>
        <button type="submit" data-gtm-cta="car-detailing_reserve" className={`mt-5 inline-flex w-full items-center justify-center rounded-[6px] px-4 py-3 text-[16px] font-semibold ${focusRing}`} style={{ background: C.accent, color: C.accentInk, outlineColor: C.text }}>
          예약 접수
        </button>
        <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
          예약금 없이 접수해요. 입고 전날까지 {KAKAO}로 바꿀 수 있어요.
        </p>
      </aside>
    </form>
  );
}

function Err({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-1.5 text-[14px] font-bold" style={{ color: C.error }}>
      {children}
    </p>
  );
}

/* ---------- 5. 시공 과정 진행 바 ---------- */

function ProcessBar({ reduce }: { reduce: boolean }) {
  const [active, setActive] = useState(0);
  const step = STEPS[active];
  return (
    <div className="mt-6">
      <div className="relative">
        {/* 바탕 선과 채워지는 선. 화면에 들어오면 왼쪽부터 한 번 채워진다. */}
        <div className="absolute left-[10%] right-[10%] top-[14px] h-[3px]" style={{ background: C.line }} aria-hidden />
        <motion.div
          aria-hidden
          className="absolute left-[10%] right-[10%] top-[14px] h-[3px] origin-left"
          style={{ background: C.accent }}
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: reduce ? 0 : BAR_MS / 1000, ease: EASE }}
        />
        <ol className="relative grid grid-cols-5">
          {STEPS.map((s, i) => {
            const on = i === active;
            return (
              <li key={s.name} className="flex flex-col items-center">
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={`${i + 1}단계 ${s.name}`}
                  onClick={() => setActive(i)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-[13px] font-semibold ${focusRing}`}
                  style={{ borderColor: on ? C.accent : C.line, background: on ? C.accent : C.bg, color: on ? C.accentInk : C.text, outlineColor: C.accent }}
                >
                  {i + 1}
                </button>
                <span className="mt-2 text-center text-[13px] font-bold leading-tight sm:text-[15px]" style={{ color: on ? C.text : C.muted }}>
                  {s.name}
                </span>
                <span className="text-[12px] tabular-nums sm:text-[13px]" style={{ color: C.muted }}>
                  {s.time}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="mt-5 rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.panel }} aria-live="polite">
        <p className="text-[18px] font-bold">
          {active + 1}단계 {step.name} <span style={{ color: C.accent }}>{step.time}</span>
        </p>
        <p className="mt-1.5 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
          {step.text}
        </p>
      </div>
    </div>
  );
}

/* ---------- 오시는 길과 영업시간 ---------- */

function WayAndHours({ today }: { today: Date }) {
  const dow = today.getDay();
  return (
    <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      {/* 약도: 큰길, 역, 매장 */}
      <div className="overflow-hidden rounded-[8px] border" style={{ borderColor: C.line, background: C.panel }}>
        <svg viewBox="0 0 640 300" className="h-auto w-full" role="img" aria-label="약도. ㅇㅇ역 3번 출구에서 큰길을 따라 걸어오면 왼쪽에 매장이 있다.">
          <rect width="640" height="300" fill={C.panel} />
          <path d="M0 200 L640 160" stroke={C.line} strokeWidth="34" />
          <path d="M0 200 L640 160" stroke={C.panel2} strokeWidth="2" strokeDasharray="14 12" />
          <path d="M420 0 L380 300" stroke={C.line} strokeWidth="22" />
          <path d="M120 0 L150 300" stroke={C.line} strokeWidth="14" />
          <text x="300" y="240" fill={C.muted} fontSize="14" fontWeight="700">
            ㅇㅇ로
          </text>
          <rect x="520" y="110" width="78" height="28" rx="4" fill={C.panel2} />
          <text x="559" y="129" fill={C.text} fontSize="14" fontWeight="700" textAnchor="middle">
            ㅇㅇ역
          </text>
          <text x="559" y="100" fill={C.muted} fontSize="12" textAnchor="middle">
            3번 출구
          </text>
          <rect x="190" y="112" width="120" height="56" rx="6" fill={C.accent} />
          <text x="250" y="137" fill={C.accentInk} fontSize="15" fontWeight="700" textAnchor="middle">
            {BRAND}
          </text>
          <text x="250" y="156" fill={C.accentInk} fontSize="12" fontWeight="700" textAnchor="middle">
            1층, 매장 앞 주차 2대
          </text>
          <rect x="230" y="216" width="80" height="40" rx="4" fill={C.panel2} stroke={C.line} />
          <text x="270" y="241" fill={C.muted} fontSize="12" fontWeight="700" textAnchor="middle">
            건물 지하 주차
          </text>
          <text x="470" y="152" fill={C.muted} fontSize="12">
            도보 5분
          </text>
        </svg>
        <ul className="grid gap-2 border-t p-4 text-[15px] sm:grid-cols-2" style={{ borderColor: C.line }}>
          <li className="flex items-start gap-2">
            <MapPin size={18} aria-hidden className="mt-0.5 flex-none" style={{ color: C.accent }} />
            {ADDRESS}
          </li>
          <li className="flex items-start gap-2">
            <TrainFront size={18} aria-hidden className="mt-0.5 flex-none" style={{ color: C.accent }} />
            ㅇㅇ역 3번 출구 도보 5분
          </li>
          <li className="flex items-start gap-2">
            <SquareParking size={18} aria-hidden className="mt-0.5 flex-none" style={{ color: C.accent }} />
            매장 앞 2대, 건물 지하 주차 가능
          </li>
          <li className="flex items-start gap-2">
            <Armchair size={18} aria-hidden className="mt-0.5 flex-none" style={{ color: C.accent }} />
            대기실 이용 가능 <Coffee size={16} aria-hidden className="ml-1 inline" /> 커피, 와이파이
          </li>
        </ul>
      </div>

      <div className="rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.panel2 }}>
        <p className="inline-flex items-center gap-1.5 text-[16px] font-bold">
          <Clock size={18} aria-hidden style={{ color: C.accent }} /> 영업시간
        </p>
        <table className="mt-3 w-full text-[16px]">
          <tbody>
            {HOURS.map((h) => {
              const isToday = h.days.includes(dow);
              return (
                <tr key={h.label} className="border-t" style={{ borderColor: C.line, color: isToday ? C.text : C.muted, fontWeight: isToday ? 700 : 400 }}>
                  <th scope="row" className="py-2.5 text-left font-[inherit]">
                    {h.label}
                    {isToday && (
                      <span className="ml-2 rounded-[4px] px-1.5 py-0.5 text-[12px] font-semibold" style={{ background: C.accent, color: C.accentInk }}>
                        오늘
                      </span>
                    )}
                  </th>
                  <td className="py-2.5 text-right tabular-nums">{h.open}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-3 text-[14px] leading-[1.7]" style={{ color: C.muted }}>
          마지막 입고 15:00. 공휴일은 {KAKAO}에 공지해요.
        </p>
        <div className="mt-4 grid gap-2">
          <a href={`tel:${TEL.replace(/-/g, "")}`} className={`inline-flex items-center justify-center gap-1.5 rounded-[6px] border px-4 py-2.5 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.accent }}>
            <Phone size={16} aria-hidden /> {TEL}
          </a>
          <button type="button" data-gtm-cta="car-detailing_kakao_way" className={`inline-flex items-center justify-center gap-1.5 rounded-[6px] px-4 py-2.5 text-[15px] font-semibold ${focusRing}`} style={{ background: C.accent, color: C.accentInk, outlineColor: C.text }}>
            <MessageCircle size={16} aria-hidden /> {KAKAO}
          </button>
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
        <span className="text-[12px] font-semibold leading-none opacity-75">디테일링 샘플</span>
      </span>
    </span>
  );
}
