"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { CalendarCheck, Car, Check, Clock, Contact, Eye, MapPin, MessageCircle, Phone, RotateCcw, TrainFront } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 안경원 홈페이지 샘플: 가상의 곰파트너 안경원. 상호, 주소, 전화는 모두 가상이다.

   국내 안경원 사이트는 메뉴가 거의 같다. 안경테(브랜드, 소재), 렌즈(굴절률, 기능성 렌즈), 콘택트렌즈,
   시력검사(예약, 소요시간, 렌즈 착용자는 미리 빼고 오기), 오시는 길(주차, 영업시간). 첫 화면엔 보통 매장 사진과
   예약 버튼이 있다. 테와 렌즈는 사진 목록과 가격표로 보여 준다.

   사진 출처: 첫 화면과 착용 사진 모두 AI 생성(Z-Image-Turbo)

   모션: 맞춘 안경 사진이 들어올 때 1.05배에서 천천히 제자리로 온다. 동작 줄이기면 바로 보인다.

   구성(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 맞춘 안경: 테 모양, 소재, 렌즈 조합과 손님 사례 사진.
   2. 안경테: 모양 6종 착용 사진과 시작 가격, 소재 3종 설명.
   3. 렌즈: 굴절률별 두께와 가격표, 기능성 렌즈 가격.
   4. 시력검사 예약: 날짜(오늘부터 7일), 시간, 이름, 휴대폰. 완료 화면에 예약번호와 담당 창구.
   5. 오시는 길과 영업시간: 오늘 요일 진하게, 주차 안내.

   첫 화면 포스터(op-poster): 왼쪽 매장 사진과 오늘 영업, 검안 예약 버튼, 오른쪽 문장 "검사부터 맞춤까지 30분"과
   맞춘 안경 사진 목록. 글꼴은 Pretendard 한 벌, 강조색은 남색 하나. */

const BRAND = "안경원";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 1층";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 안경원";

/** 옅은 회색 바탕에 흰 판, 먹색 글자. 강조색은 차분한 남색(navy) 하나 */
const C = {
  bg: "#f7f7f5",
  panel: "#ffffff",
  navy: "#24365a",
  steel: "#8a8a8a",
  steelLine: "#e5e5e5",
  steelSoft: "#efefec",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  error: "#b42318",
};


const EASE = [0.22, 1, 0.36, 1] as const;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- 테 모양, 소재 ---------- */

type ShapeId = "round" | "boston" | "wellington" | "square" | "browline" | "rimless";
type MaterialId = "acetate" | "titanium" | "ultem";

const SHAPES: { id: ShapeId; name: string; base: number; note: string }[] = [
  { id: "wellington", name: "웰링턴", base: 89000, note: "위가 넓은 사다리꼴, 가장 무난" },
  { id: "round", name: "라운드", base: 79000, note: "동그란 렌즈, 복고 느낌" },
  { id: "boston", name: "보스턴", base: 89000, note: "위는 넓고 아래가 둥근 역삼각" },
  { id: "square", name: "스퀘어", base: 79000, note: "각이 살아 있는 네모" },
  { id: "browline", name: "하금테", base: 99000, note: "위는 뿔테, 아래는 금속 와이어" },
  { id: "rimless", name: "무테", base: 150000, note: "테 없이 렌즈에 바로 고정, 티타늄" },
];

const MATERIALS: { id: MaterialId; name: string; add: number; desc: string }[] = [
  { id: "acetate", name: "아세테이트", add: 0, desc: "두께감 있고 색이 선명해요. 뿔테 대부분이 이 소재예요." },
  { id: "titanium", name: "티타늄", add: 140000, desc: "가볍고 땀에 녹슬지 않아요. 무테와 금속테에 써요." },
  { id: "ultem", name: "울템", add: -20000, desc: "가장 가볍고 잘 휘어요. 운동할 때 쓰기 좋아요." },
];

/* ---------- 렌즈 ---------- */


/** mm는 같은 도수(-4.00, 렌즈 지름 65mm)에서 가장자리 두께. 안경원이 상담 때 보여 주는 두께 비교표 수치 */
const INDEXES = [
  { v: "1.56", price: 40000, mm: 6.5, desc: "기본형, 낮은 도수에" },
  { v: "1.60", price: 60000, mm: 5.3, desc: "가장 많이 나가요" },
  { v: "1.67", price: 90000, mm: 4.5, desc: "-4.00 넘으면 이걸로" },
  { v: "1.74", price: 150000, mm: 3.9, desc: "가장 얇은 고도수용" },
] as const;

type OptId = "blue" | "photo" | "prog";
const OPTIONS: { id: OptId; name: string; price: number; desc: string }[] = [
  { id: "blue", name: "블루라이트 차단", price: 20000, desc: "모니터 오래 보면 권해요" },
  { id: "photo", name: "변색", price: 40000, desc: "밖에 나가면 선글라스처럼 어두워져요" },
  { id: "prog", name: "누진다초점", price: 150000, desc: "멀리와 가까이를 한 렌즈로" },
];

/* ---------- 영업시간, 예약 ---------- */

/** 요일별 영업시간. 일요일과 공휴일은 휴무 */
const HOURS: { dow: number; label: string; open: string | null }[] = [
  { dow: 1, label: "월", open: "10:30 ~ 20:00" },
  { dow: 2, label: "화", open: "10:30 ~ 20:00" },
  { dow: 3, label: "수", open: "10:30 ~ 20:00" },
  { dow: 4, label: "목", open: "10:30 ~ 20:00" },
  { dow: 5, label: "금", open: "10:30 ~ 20:00" },
  { dow: 6, label: "토", open: "10:30 ~ 19:00" },
  { dow: 0, label: "일, 공휴일", open: null },
];

const SLOTS = ["10:30", "11:30", "13:30", "14:30", "15:30", "16:30", "17:30", "18:30"];
const BOOK_DAYS = 7;

/** 날짜와 시간별로 이미 잡힌 예약. 실제로는 예약 시트에서 읽는다 */
function taken(dayIdx: number, slot: number) {
  let h = (dayIdx + 5) * 2654435761 + (slot + 3) * 40503;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 101;
  // 저녁과 토요일이 먼저 찬다
  return h % 7 === 0 || (slot >= 6 && h % 3 === 0);
}

function slotsFor(d: Date) {
  const dow = d.getDay();
  if (dow === 0) return [];
  if (dow === 6) return SLOTS.slice(0, 7);
  return SLOTS;
}

/* ====================================================================== */

export function OpticalDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  // 휴대폰 아래 고정 막대는 첫 화면을 지나야 올라온다
  const [barOn, setBarOn] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", () => setBarOn((document.getElementById("op-poster")?.getBoundingClientRect().bottom ?? 0) < window.innerHeight * 0.5));

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div className="min-h-screen overflow-x-clip pb-24 md:pb-0" style={{ background: C.bg, color: C.ink }}>
      <Poster reduce={reduce} today={today} go={go} />

      <main className="mx-auto max-w-[1200px] px-4 md:px-6">
        {/* 안경테 */}
        <section id="op-frame" aria-labelledby="op-frame-title" className="mt-14 scroll-mt-4 md:mt-20">
          <SectionTitle id="op-frame-title" sub="국내외 브랜드 테를 모양별로 갖춰 두었어요. 매장에서 직접 써 보고 고르세요">
            안경테
          </SectionTitle>
          <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 lg:gap-x-4">
            {SHAPES.map((s) => (
              <li key={s.id} className="min-w-0">
                <span className="block aspect-[4/3] overflow-hidden rounded-[8px]" style={{ background: C.steelSoft }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                  <img src={`${IMG}/wear-${s.id}.jpg`} alt={`${s.name} 안경을 쓴 모습`} loading="lazy" width={675} height={900} className="h-full w-full object-cover" style={{ objectPosition: "50% 32%" }} />
                </span>
                <h3 className="mt-2 text-[17px] font-bold">{s.name}</h3>
                <p className="text-[14px] leading-[1.5]" style={{ color: C.muted }}>
                  {s.note}
                </p>
                <p className="mt-0.5 text-[15px] font-bold tabular-nums" style={{ color: C.body }}>
                  {won(s.base)}부터
                </p>
              </li>
            ))}
          </ul>

          <h3 className="mt-10 text-[18px] font-bold">소재</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-3">
            {MATERIALS.map((m) => (
              <li key={m.id} className="rounded-lg border px-4 py-4" style={{ borderColor: C.steelLine, background: C.panel }}>
                <p className="text-[16px] font-bold">{m.name}</p>
                <p className="mt-1 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
                  {m.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* 렌즈 */}
        <section id="op-lens" aria-labelledby="op-lens-title" className="mt-16 scroll-mt-4 md:mt-24">
          <SectionTitle id="op-lens-title" sub="굴절률이 높을수록 같은 도수에서 얇아져요. 가격은 렌즈 한 쌍 기준">
            렌즈
          </SectionTitle>
          <div className="mt-5 grid gap-6 lg:grid-cols-2 lg:gap-10">
            <table className="w-full border-collapse text-[15px] md:text-[16px]">
              <caption className="pb-2 text-left text-[14px] font-bold" style={{ color: C.muted }}>
                굴절률별 단초점 렌즈
              </caption>
              <thead>
                <tr className="border-y-2 text-left" style={{ borderColor: C.ink }}>
                  <th scope="col" className="py-2.5 pr-3 font-bold">굴절률</th>
                  <th scope="col" className="py-2.5 pr-3 font-bold">두께</th>
                  <th scope="col" className="py-2.5 text-right font-bold">가격</th>
                </tr>
              </thead>
              <tbody>
                {INDEXES.map((x) => (
                  <tr key={x.v} className="border-b" style={{ borderColor: C.steelLine }}>
                    <th scope="row" className="py-3 pr-3 text-left font-normal">
                      <span className="block font-bold tabular-nums">{x.v}</span>
                      <span className="block text-[14px]" style={{ color: C.muted }}>
                        {x.desc}
                      </span>
                    </th>
                    <td className="whitespace-nowrap py-3 pr-3 tabular-nums">{x.mm}mm</td>
                    <td className="whitespace-nowrap py-3 text-right font-bold tabular-nums"><span className="whitespace-nowrap">{won(x.price)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="w-full self-start border-collapse text-[15px] md:text-[16px]">
              <caption className="pb-2 text-left text-[14px] font-bold" style={{ color: C.muted }}>
                기능성 렌즈 추가 금액
              </caption>
              <thead>
                <tr className="border-y-2 text-left" style={{ borderColor: C.ink }}>
                  <th scope="col" className="py-2.5 pr-3 font-bold">종류</th>
                  <th scope="col" className="py-2.5 text-right font-bold">추가</th>
                </tr>
              </thead>
              <tbody>
                {OPTIONS.map((o) => (
                  <tr key={o.id} className="border-b" style={{ borderColor: C.steelLine }}>
                    <th scope="row" className="py-3 pr-3 text-left font-normal">
                      <span className="block font-bold">{o.name}</span>
                      <span className="block text-[14px]" style={{ color: C.muted }}>
                        {o.desc}
                      </span>
                    </th>
                    <td className="whitespace-nowrap py-3 text-right font-bold tabular-nums"><span className="whitespace-nowrap">+{won(o.price)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
            두께는 -4.00 도수에서 렌즈 가장자리 기준이에요. 도수와 테 크기에 맞는 렌즈는 검사 뒤 함께 골라 드려요.
          </p>
        </section>

        {/* 콘택트렌즈 */}
        <section id="op-contact" aria-labelledby="op-contact-title" className="mt-16 scroll-mt-4 md:mt-24">
          <SectionTitle id="op-contact-title" sub="처음 끼시면 피팅 검사 뒤 착용 연습까지 해 드려요">
            콘택트렌즈
          </SectionTitle>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "원데이 소프트렌즈", p: "30매 28,000원부터", d: "매일 새 렌즈, 관리가 없어요" },
              { n: "2주, 한 달 착용", p: "6매 32,000원부터", d: "세척액으로 관리해요" },
              { n: "난시용, 컬러렌즈", p: "30매 35,000원부터", d: "축 맞춰 처방해요" },
              { n: "하드렌즈(RGP)", p: "한 쌍 250,000원부터", d: "맞춤 제작, 2년 정도 써요" },
            ].map((c) => (
              <li key={c.n} className="rounded-lg border px-4 py-4" style={{ borderColor: C.steelLine, background: C.panel }}>
                <p className="flex items-center gap-2 text-[16px] font-bold">
                  <Contact size={18} aria-hidden style={{ color: C.navy }} />
                  {c.n}
                </p>
                <p className="mt-1 text-[15px] font-bold tabular-nums" style={{ color: C.body }}>
                  {c.p}
                </p>
                <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
                  {c.d}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. 시력검사 예약 */}
        <section id="op-book" aria-labelledby="op-book-title" className="mt-16 scroll-mt-4 md:mt-24">
          <SectionTitle id="op-book-title" sub="검사는 20분 정도 걸려요. 소프트렌즈는 하루, 하드렌즈는 3일 빼고 오세요">
            시력검사 예약
          </SectionTitle>
          <Booking today={today} reduce={reduce} />
        </section>

        {/* 5. 오시는 길 */}
        <section id="op-map" aria-labelledby="op-map-title" className="mt-16 scroll-mt-4 md:mt-24">
          <SectionTitle id="op-map-title">오시는 길</SectionTitle>
          <Directions today={today} />
        </section>
      </main>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pb-10 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.steelLine, color: C.muted }}>
        <p>
          <SampleLogo />
        </p>
        <p>
          {ADDRESS}, 전화 {TEL}
        </p>
        <DemoMakerInfo className="mt-6" />
      </footer>

      {/* 휴대폰: 전화와 예약 버튼을 아래에 고정 */}
      <div
        inert={!barOn}
        className={`fixed inset-x-0 bottom-0 z-30 border-t px-4 py-3 md:hidden ${reduce ? "" : "transition-transform duration-300"} ${barOn ? "translate-y-0" : "translate-y-full"}`}
        style={{ background: C.panel, borderColor: C.steelLine }}
      >
        <div className="flex items-center gap-3">
          <a href={`tel:${TEL}`} className={`inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-md border text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.steelLine, outlineColor: C.navy }}>
            <Phone size={17} aria-hidden />
            전화
          </a>
          <button
            type="button"
            onClick={() => go("op-book")}
            data-gtm-cta="optical_book_bar"
            className={`h-12 flex-[2] rounded-md px-5 text-[15px] font-bold text-white ${focusRing}`}
            style={{ background: C.navy, outlineColor: C.navy }}
          >
            시력검사 예약
          </button>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* ---------- 첫 화면 포스터 ---------- */

const IMG = "/images/demo-optical";

/** 첫 화면 "맞춘 안경" 사례. 테와 렌즈 조합은 아래 테, 렌즈 가격표의 값 그대로 */
interface Case {
  shape: ShapeId;
  material: MaterialId;
  idx: number;
  opts: OptId[];
  who: string;
}
const CASES: Case[] = [
  { shape: "wellington", material: "acetate", idx: 1, opts: ["blue"], who: "사무직, 모니터 오래 봄" },
  { shape: "round", material: "titanium", idx: 2, opts: [], who: "고도수, 가벼운 테" },
  { shape: "boston", material: "acetate", idx: 1, opts: ["photo"], who: "운전 자주 함" },
  { shape: "square", material: "ultem", idx: 0, opts: [], who: "첫 안경" },
  { shape: "browline", material: "acetate", idx: 2, opts: ["prog"], who: "가까운 글씨가 흐림" },
  { shape: "rimless", material: "titanium", idx: 3, opts: ["blue"], who: "고도수, 얇은 렌즈" },
];
const casePrice = (c: Case) =>
  SHAPES.find((s) => s.id === c.shape)!.base + MATERIALS.find((m) => m.id === c.material)!.add + INDEXES[c.idx].price + OPTIONS.filter((o) => c.opts.includes(o.id)).reduce((n, o) => n + o.price, 0);

const GNB: [string, string][] = [
  ["op-book", "검안"],
  ["op-frame", "테"],
  ["op-lens", "렌즈"],
  ["op-cases", "맞춘 사례"],
  ["op-map", "오시는 길"],
];

function Poster({ reduce, today, go }: { reduce: boolean; today: Date; go: (id: string) => void }) {
  const hours = HOURS.find((h) => h.dow === today.getDay())!;
  const todayText = hours.open ? `오늘 ${hours.open}` : "오늘 휴무";

  return (
    <section id="op-poster" aria-labelledby="op-poster-title" style={{ background: C.bg, color: C.ink }}>
      {/* GNB. 휴대폰은 가로로 밀어 보는 메뉴 */}
      <header className="border-b" style={{ borderColor: C.steelLine, background: C.panel }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-6 px-4 pt-3 md:flex-nowrap md:px-6 md:py-3">
          <p className="py-1.5">
            <SampleLogo />
          </p>
          <nav aria-label="주요 메뉴" className="-mx-4 flex w-[calc(100%+32px)] overflow-x-auto px-2 md:mx-0 md:w-auto md:px-0">
            {GNB.map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={`h-11 shrink-0 whitespace-nowrap rounded-md px-3 text-[16px] font-bold hover:underline hover:underline-offset-4 ${focusRing}`} style={{ outlineColor: C.navy }}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 pb-10 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:items-start md:gap-8 md:px-6 md:pt-8">
        {/* 매장 패널. PC는 왼쪽에 붙어 있고, 휴대폰은 한 줄로 접혀 위에 붙는다 */}
        <aside aria-label="매장 안내" className="sticky top-0 z-20 -mx-4 border-b px-4 py-2.5 md:top-4 md:mx-0 md:rounded-[8px] md:border md:p-5 md:pt-5" style={{ borderColor: C.steelLine, background: C.panel }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero-sm.jpg`}
            alt="밝은 나무 선반에 안경테가 줄지어 놓인 매장 벽"
            width={960}
            height={548}
            fetchPriority="high"
            className="hidden aspect-[16/10] w-full rounded-[6px] object-cover md:block"
            style={{ objectPosition: "78% 50%" }}
          />
          <dl className="hidden gap-y-2 text-[15px] md:mt-4 md:grid md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-3">
            <dt className="inline-flex items-center gap-1.5 font-bold">
              <Clock size={16} aria-hidden /> 영업
            </dt>
            <dd className="tabular-nums" style={{ color: hours.open ? C.ink : C.muted }}>
              {todayText}
            </dd>
            <dt className="inline-flex items-center gap-1.5 font-bold">
              <Eye size={16} aria-hidden /> 검안
            </dt>
            <dd>20분 정도</dd>
            <dt className="inline-flex items-center gap-1.5 font-bold">
              <Phone size={16} aria-hidden /> 전화
            </dt>
            <dd className="tabular-nums">{TEL}</dd>
          </dl>
          {/* 휴대폰 한 줄 요약 */}
          <p className="flex items-center gap-3 md:hidden">
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold tabular-nums">
              {todayText}
              <span style={{ color: C.muted }}>, 검안 20분</span>
            </span>
            <a href={`tel:${TEL}`} aria-label={`전화 ${TEL}`} className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border ${focusRing}`} style={{ borderColor: C.steelLine, outlineColor: C.navy }}>
              <Phone size={18} aria-hidden />
            </a>
            <button type="button" onClick={() => go("op-book")} data-gtm-cta="optical_poster_cta" className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md px-3.5 text-[15px] font-bold text-white ${focusRing}`} style={{ background: C.navy, outlineColor: C.navy }}>
              <CalendarCheck size={17} aria-hidden />
              예약
            </button>
          </p>
          <button
            type="button"
            onClick={() => go("op-book")}
            data-gtm-cta="optical_poster_cta"
            className={`mt-5 hidden h-12 w-full items-center justify-center gap-1.5 rounded-md text-[16px] font-bold text-white md:inline-flex ${focusRing}`}
            style={{ background: C.navy, outlineColor: C.navy }}
          >
            <CalendarCheck size={18} aria-hidden />
            검안 예약
          </button>
        </aside>

        {/* 맞춘 안경 사례 */}
        <div id="op-cases" className="scroll-mt-4 pt-5 md:pt-0">
          <h1 id="op-poster-title" className="text-[28px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[36px]" style={{ wordBreak: "keep-all" }}>
            검사부터 맞춤까지 30분
          </h1>
          <h2 className="mt-4 text-[20px] font-bold md:mt-5">맞춘 안경</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-5 lg:grid-cols-3 lg:gap-x-4">
            {CASES.map((c, i) => {
              const S = SHAPES.find((s) => s.id === c.shape)!;
              const M = MATERIALS.find((m) => m.id === c.material)!;
              const lens = [INDEXES[c.idx].v, ...OPTIONS.filter((o) => c.opts.includes(o.id)).map((o) => o.name)].join(", ");
              return (
                <li key={c.shape} className="min-w-0">
                  <span className="relative block aspect-square overflow-hidden rounded-[8px]" style={{ background: C.steelSoft }}>
                    <motion.img
                      src={`${IMG}/wear-${c.shape}.jpg`}
                      alt={`${S.name} ${M.name} 테를 맞춘 손님`}
                      width={675}
                      height={900}
                      loading={i < 3 ? "eager" : "lazy"}
                      initial={reduce ? false : { scale: 1.05 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: reduce ? 0 : 1.4, ease: EASE }}
                      className="h-full w-full object-cover"
                      style={{ objectPosition: "50% 30%" }}
                    />
                  </span>
                  <p className="mt-2 text-[16px] font-bold leading-snug">
                    {S.name}, {M.name}
                  </p>
                  <p className="mt-0.5 text-[14px] leading-[1.45]" style={{ color: C.body }}>
                    {lens} 렌즈
                  </p>
                  <p className="mt-0.5 text-[13px] leading-[1.45]" style={{ color: C.muted }}>
                    {c.who}, {won(casePrice(c))}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ id, sub, children }: { id: string; sub?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 id={id} className="font-bold text-[24px] leading-tight md:text-[28px]" style={{ color: C.ink }}>
        {children}
      </h2>
      {sub && (
        <p className="mt-1.5 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ====================================================================== */
/* 시력검사 예약 */

interface Done {
  no: string;
  day: Date;
  slot: string;
  name: string;
  phone: string;
}

function Booking({ today, reduce }: { today: Date; reduce: boolean }) {
  const days = Array.from({ length: BOOK_DAYS }, (_, i) => daysAgo(today, -i));
  const firstOpen = days.findIndex((d) => slotsFor(d).length > 0);
  const [day, setDay] = useState(Math.max(0, firstOpen));
  const [slot, setSlot] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [count, setCount] = useState(0);
  const doneRef = useRef<HTMLDivElement>(null);

  const slots = slotsFor(days[day]);
  const phoneOk = /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.trim());
  const errs = {
    slot: slot === null ? "시간을 골라 주세요" : "",
    name: name.trim() ? "" : "이름을 적어 주세요",
    phone: phoneOk ? "" : "확정 문자를 받을 휴대폰 번호를 확인해 주세요",
    agree: agree ? "" : "개인정보 수집에 동의해 주세요",
  };
  const ok = Object.values(errs).every((e) => !e);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok || slot === null) return;
    const d = days[day];
    const no = `EYE-${p2(d.getMonth() + 1)}${p2(d.getDate())}-${slots[slot].replace(":", "")}-${p2(count + 1)}`;
    setDone({ no, day: d, slot: slots[slot], name, phone });
    setCount((n) => n + 1);
    requestAnimationFrame(() => doneRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };

  const reset = () => {
    setDone(null);
    setTried(false);
    setSlot(null);
    setName("");
    setPhone("");
    setNote("");
    setAgree(false);
  };

  const err = (k: keyof typeof errs) =>
    tried && errs[k] ? (
      <p className="mt-1.5 text-[14px] font-bold" style={{ color: C.error }}>
        {errs[k]}
      </p>
    ) : null;

  if (done) return <BookingDone ref={doneRef} done={done} today={today} reduce={reduce} onAgain={reset} />;

  const inputCls = `mt-2 w-full rounded-md border bg-white px-3 py-3 text-[17px] ${focusRing}`;
  const inputStyle = { borderColor: C.steelLine, outlineColor: C.navy } as const;

  return (
    <form onSubmit={submit} noValidate className="mt-5 grid gap-8 rounded-[8px] border px-4 py-6 md:grid-cols-2 md:px-6" style={{ borderColor: C.steelLine, background: C.panel }}>
      <div>
        <fieldset>
          <legend className="text-[16px] font-bold">날짜</legend>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {days.map((d, i) => {
              const open = slotsFor(d).length > 0;
              const sel = day === i;
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={sel}
                  disabled={!open}
                  aria-label={`${fmtKo(d)}${open ? "" : ", 휴무"}`}
                  onClick={() => {
                    setDay(i);
                    setSlot(null);
                  }}
                  className={`rounded-md border py-2 text-center tabular-nums disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                  style={{ borderColor: sel ? C.navy : C.steelLine, background: sel ? C.navy : "transparent", color: sel ? "#fff" : C.ink, outlineColor: C.navy }}
                >
                  <span className="block text-[12px]">{i === 0 ? "오늘" : DOW[d.getDay()]}</span>
                  <span className="block text-[16px] font-bold">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-[16px] font-bold">시간</legend>
          <p className="mt-1 text-[13px]" style={{ color: C.muted }}>
            12:30 ~ 13:30은 점심시간이에요. 당일 예약은 전화로 확인 뒤 확정돼요.
          </p>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {slots.map((t, s) => {
              const full = taken(day, s);
              const sel = slot === s;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={sel}
                  disabled={full}
                  aria-label={`${t}${full ? ", 마감" : ""}`}
                  onClick={() => setSlot(s)}
                  className={`rounded-md border py-2.5 text-[15px] font-bold tabular-nums disabled:cursor-not-allowed ${focusRing}`}
                  style={{
                    borderColor: sel ? C.navy : full ? C.steelSoft : C.steelLine,
                    background: sel ? C.navy : full ? C.steelSoft : "transparent",
                    color: sel ? "#fff" : full ? C.steel : C.ink,
                    textDecoration: full ? "line-through" : "none",
                    outlineColor: C.navy,
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          {err("slot")}
        </fieldset>
      </div>

      <div>
        <label className="block text-[16px] font-bold">
          이름
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputCls} style={inputStyle} />
        </label>
        {err("name")}
        <label className="mt-5 block text-[16px] font-bold">
          휴대폰
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={inputCls} style={inputStyle} />
        </label>
        {err("phone")}
        <label className="mt-5 block text-[16px] font-bold">
          남기실 말 <span style={{ color: C.muted }}>(선택)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="지금 쓰는 안경 도수, 렌즈 착용 여부" className={inputCls} style={inputStyle} />
        </label>
        <label className="mt-5 flex items-start gap-2 text-[15px]">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`mt-1 h-5 w-5 ${focusRing}`} style={{ accentColor: C.navy, outlineColor: C.navy }} />
          <span>예약 확인 연락을 위한 개인정보 수집에 동의해요. 검사 뒤 바로 지워요.</span>
        </label>
        {err("agree")}
        <button
          type="submit"
          data-gtm-cta="optical_book_submit"
          className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md px-5 py-3.5 text-[17px] font-semibold text-white transition-transform duration-100 active:translate-y-px ${focusRing}`}
          style={{ background: C.navy, outlineColor: C.navy }}
        >
          <Eye size={20} aria-hidden />
          예약하기
        </button>
      </div>
    </form>
  );
}

function BookingDone({ ref, done, today, reduce, onAgain }: { ref: React.Ref<HTMLDivElement>; done: Done; today: Date; reduce: boolean; onAgain: () => void }) {
  const sameDay = done.day.getTime() === today.getTime();
  const rows = [
    ["예약번호", done.no],
    ["검사 일시", `${fmtKo(done.day)} ${done.slot}`],
    ["예약자", `${maskName(done.name)}, ${maskPhone(done.phone)}`],
    ["담당 창구", `전화 ${TEL} 또는 ${KAKAO}`],
    ["확정 안내", sameDay ? "30분 안에 전화로 확정해 드려요" : `${fmtKo(today)} 영업시간 안에 확정 문자를 보내 드려요`],
  ];
  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
      className="mt-5 scroll-mt-4 rounded-[8px] border px-4 py-6 md:px-6"
      style={{ borderColor: C.navy, background: C.panel }}
      role="status"
    >
      <p className="font-bold inline-flex items-center gap-2 text-[22px]" style={{ color: C.ink }}>
        <Check size={24} strokeWidth={3} aria-hidden style={{ color: C.navy }} />
        시력검사 예약이 접수됐어요
      </p>
      <dl className="mt-4 grid gap-y-2 text-[16px] sm:grid-cols-[120px_1fr]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-bold" style={{ color: C.muted }}>
              {k}
            </dt>
            <dd className="tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-5 list-disc space-y-1 pl-5 text-[15px] leading-[1.7]" style={{ color: C.ink }}>
        <li>검사는 20분 정도 걸려요. 10분 전에 와 주세요.</li>
        <li>소프트렌즈는 하루, 하드렌즈는 3일 빼고 오세요.</li>
        <li>지금 쓰는 안경이 있으면 챙겨 오세요. 도수 비교에 써요.</li>
      </ul>
      <div className="mt-6 flex flex-wrap gap-2">
        <a href={`tel:${TEL.replace(/-/g, "")}`} className={`inline-flex items-center gap-1.5 rounded-md border px-4 py-2.5 text-[15px] font-bold ${focusRing}`} style={{ borderColor: C.navy, color: C.navy, outlineColor: C.navy }}>
          <Phone size={16} aria-hidden />
          전화 {TEL}
        </a>
        <span className="inline-flex items-center gap-1.5 rounded-md border px-4 py-2.5 text-[15px] font-bold" style={{ borderColor: C.steelLine, color: C.ink }}>
          <MessageCircle size={16} aria-hidden />
          {KAKAO}
        </span>
        <button type="button" onClick={onAgain} className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2.5 text-[15px] font-semibold ${focusRing}`} style={{ color: C.muted, outlineColor: C.navy }}>
          <RotateCcw size={16} aria-hidden />
          다른 시간으로
        </button>
      </div>
    </motion.div>
  );
}

/* ====================================================================== */
/* 오시는 길과 영업시간 */

function Directions({ today }: { today: Date }) {
  const dow = today.getDay();
  return (
    <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,1fr)_380px]">
      {/* 약도. 실제 사이트에는 네이버 지도나 카카오맵을 넣는다 */}
      <div className="overflow-hidden rounded-[8px] border" style={{ borderColor: C.steelLine, background: C.panel }}>
        <svg viewBox="0 0 600 320" className="h-auto w-full" role="img" aria-label="약도. ㅇㅇ역 3번 출구에서 큰길 따라 걸어오면 왼쪽 첫 건물 1층">
          <rect width="600" height="320" fill="#f1f3f6" />
          <g stroke="#ffffff" strokeWidth="26" strokeLinecap="round">
            <path d="M0 160H600" />
            <path d="M160 0V320" />
            <path d="M420 0V320" />
            <path d="M0 60H600" strokeWidth="14" />
            <path d="M0 260H600" strokeWidth="14" />
          </g>
          <g stroke="#dfe3e8" strokeWidth="1.5" strokeDasharray="6 6">
            <path d="M0 160H600" />
            <path d="M160 0V320" />
            <path d="M420 0V320" />
          </g>
          <rect x="190" y="90" width="90" height="50" rx="4" fill="#dfe3e8" />
          <rect x="300" y="90" width="100" height="50" rx="4" fill="#dfe3e8" />
          <rect x="190" y="180" width="200" height="60" rx="4" fill="#dfe3e8" />
          <rect x="450" y="80" width="120" height="60" rx="4" fill="#dfe3e8" />
          <rect x="450" y="180" width="120" height="60" rx="4" fill="#dfe3e8" />
          {/* 지하철 출구 */}
          <g transform="translate(130 184)">
            <rect x="-28" y="-14" width="56" height="28" rx="6" fill={C.navy} />
            <text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
              3번 출구
            </text>
          </g>
          {/* 걷는 길 */}
          <path d="M160 170C190 170 200 150 240 150" fill="none" stroke={C.navy} strokeWidth="4" strokeDasharray="8 7" strokeLinecap="round" />
          {/* 매장 */}
          <g transform="translate(240 118)">
            <rect x="-46" y="-26" width="92" height="52" rx="6" fill={C.navy} />
            <text x="0" y="-3" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
              {BRAND}
            </text>
            <text x="0" y="14" textAnchor="middle" fontSize="11" fill="#fff" fillOpacity="0.9">
              1층
            </text>
          </g>
          {/* 주차 */}
          <g transform="translate(345 74)">
            <rect x="-30" y="-14" width="60" height="28" rx="6" fill="#ffffff" stroke={C.steel} />
            <text x="0" y="5" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.navy}>
              주차 P
            </text>
          </g>
          <text x="575" y="178" textAnchor="end" fontSize="12" fill={C.muted}>
            ㅇㅇ로
          </text>
          <text x="172" y="30" fontSize="12" fill={C.muted}>
            ㅇㅇ길
          </text>
        </svg>
      </div>

      <div className="flex flex-col gap-5 rounded-[8px] border px-5 py-5" style={{ borderColor: C.steelLine, background: C.panel }}>
        <div className="flex items-start gap-3">
          <MapPin size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.navy }} />
          <div className="text-[15px] leading-[1.6]">
            <p className="font-bold">{ADDRESS}</p>
            <p style={{ color: C.muted }}>1층 길가 매장</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <TrainFront size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.navy }} />
          <div className="text-[15px] leading-[1.6]">
            <p className="font-bold">ㅇㅇ역 3번 출구 도보 3분</p>
            <p style={{ color: C.muted }}>출구 나와서 큰길 따라 직진, 왼쪽 첫 건물</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Car size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.navy }} />
          <div className="text-[15px] leading-[1.6]">
            <p className="font-bold">건물 뒤 주차 2대, 1시간 무료</p>
            <p style={{ color: C.muted }}>자리가 없으면 옆 건물 공영주차장, 주차권 드려요</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.navy }} />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold">영업시간</p>
            <table className="mt-1 w-full text-[15px]" style={{ color: C.ink }}>
              <tbody>
                {HOURS.map((h) => {
                  const isToday = h.dow === dow;
                  return (
                    <tr key={h.label} style={{ background: isToday ? C.bg : "transparent", fontWeight: isToday ? 700 : 400 }}>
                      <th scope="row" className="rounded-l-md py-1 pl-2 pr-3 text-left" style={{ fontWeight: "inherit" }}>
                        {h.label}
                        {isToday && <span className="sr-only">, 오늘</span>}
                      </th>
                      <td className="rounded-r-md py-1 pr-2 text-right tabular-nums">{h.open ?? "휴무"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
              마감 30분 전까지 시력검사 접수. 점심시간 12:30 ~ 13:30
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold leading-none tracking-[-0.03em]`}>안경원</span>
      </span>
    </span>
  );
}
