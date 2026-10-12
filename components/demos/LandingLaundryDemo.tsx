"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, MapPin, Phone, Truck } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 세탁소 오픈 소식 랜딩 데모: 가상의 곰파트너 세탁소.
   상호, 대표자, 주소, 전화번호, 가격은 모두 가상이다.

   9.9만 원 랜딩 기본 패키지(소개 랜딩) 범위로 만든 샘플이다.
   홈페이지 데모와 달리 위쪽 메뉴가 없고 목적은 하나(전화하거나 들르게 하기)다.
   위에서 아래로 한 번 읽어 내려가면 끝나는 다섯 구역:
   첫 화면 / 오픈 할인 / 가격표 / 맡기고 찾는 날 / 위치·영업시간.
   휴대폰에서는 아래에 전화하기 버튼을 고정한다.

   뼈대: 세탁물에 다는 종이 꼬리표와 세탁소 영수증.
   오픈 할인은 끈 구멍이 뚫린 꼬리표 세 장, 가격표는 품목을 누르면 줄이 더해지는 영수증으로 만든다.
   맡기고 찾는 날은 요일을 고르면 찾는 요일이 나오는 표다.

   인터랙션(4개): 꼬리표 흔들림(마우스를 올렸을 때), 가격표 분류 바꾸기, 영수증에 품목 담기, 맡기는 요일 고르기.

   디자인: 흰 바탕에 세탁 꼬리표 파랑(#1d4ed8) 한 가지만 강조색으로 쓰고, 꼬리표는 미색 종이(#fbf7ec).
   제목은 아주 크게, 영수증 숫자는 고정폭 글꼴.

   사진 출처(public/images/demo-landing-laundry):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero */

const IMG = "/images/demo-landing-laundry";
const STORE = "곰파트너 세탁소";
const TEL = "02-000-0000";
const ADDRESS = "서울 ㅅㄷ구 ㅇㅇ동 ㅇㅇ로 22 1층";

const C = {
  bg: "#ffffff",
  ink: "#0f172a",
  muted: "#475569",
  line: "#dbe3ef",
  blue: "#1d4ed8",
  blueSoft: "#e8efff",
  tag: "#fbf7ec",
  tagEdge: "#e6dcc3",
};

const won = (n: number) => n.toLocaleString("ko-KR");

/* ---------- 가격 ---------- */

type Cat = "top" | "bottom" | "bedding" | "shoes";

const CATS: { id: Cat; label: string }[] = [
  { id: "top", label: "상의" },
  { id: "bottom", label: "하의·외투" },
  { id: "bedding", label: "이불" },
  { id: "shoes", label: "운동화" },
];

interface Item {
  id: string;
  cat: Cat;
  name: string;
  price: number;
  note?: string;
}

const ITEMS: Item[] = [
  { id: "shirt", cat: "top", name: "와이셔츠", price: 2500, note: "물세탁 후 다림질" },
  { id: "blouse", cat: "top", name: "블라우스", price: 4000 },
  { id: "knit", cat: "top", name: "니트", price: 5000 },
  { id: "jacket", cat: "top", name: "양복 상의", price: 6000 },
  { id: "pants", cat: "bottom", name: "바지", price: 4000 },
  { id: "skirt", cat: "bottom", name: "치마", price: 4000 },
  { id: "suit", cat: "bottom", name: "양복 한 벌", price: 10000 },
  { id: "coat", cat: "bottom", name: "코트", price: 12000 },
  { id: "padding", cat: "bottom", name: "패딩", price: 15000, note: "롱패딩 20,000원" },
  { id: "blanket-s", cat: "bedding", name: "이불 싱글", price: 15000 },
  { id: "blanket-q", cat: "bedding", name: "이불 퀸", price: 20000 },
  { id: "duvet", cat: "bedding", name: "구스 이불", price: 30000 },
  { id: "sneakers", cat: "shoes", name: "운동화", price: 5000 },
  { id: "boots", cat: "shoes", name: "어그 부츠", price: 12000 },
];

/** 오픈 첫 달 할인율 */
const OPEN_RATE = 0.2;

/* ---------- 맡기고 찾는 날 ---------- */

const DAYS = ["월", "화", "수", "목", "금", "토"] as const;

const LEAD: { kind: string; days: number }[] = [
  { kind: "와이셔츠", days: 1 },
  { kind: "드라이클리닝", days: 2 },
  { kind: "이불·운동화", days: 3 },
];

/** 일요일 휴무라 일요일은 건너뛰고 센다. */
function readyDay(from: number, lead: number) {
  let d = from;
  let left = lead;
  while (left > 0) {
    d = (d + 1) % 7; // 0~5 월~토, 6 일
    if (d !== 6) left -= 1;
  }
  return d === 6 ? "월" : DAYS[d];
}

export function LandingLaundryDemo() {
  return (
    <div className="min-h-screen overflow-x-hidden text-[17px] leading-[1.6]" style={{ background: C.bg, color: C.ink }}>
      <TopBar />
      <main>
        <Hero />
        <OpenTags />
        <Receipt />
        <Schedule />
        <Visit />
      </main>
      <Footer />
      <CallBar />
    </div>
  );
}

function LogoMark() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.svg" alt="" aria-hidden width={32} height={32} className="h-8 w-8 shrink-0" />
    </>
  );
}

/* ---------- 머리: 메뉴 없이 상호와 전화만 ---------- */

function TopBar() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <p className="flex items-center gap-2">
          <LogoMark />
          <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[18px] font-bold tracking-[-0.02em]">곰파트너</span>
            <span className="text-[11px] font-semibold opacity-80">세탁소</span>
          </span>
        </p>
        <a
          href={`tel:${TEL}`}
          className="hidden h-11 items-center gap-2 rounded-[4px] px-4 text-[15px] font-semibold text-white sm:inline-flex"
          style={{ background: C.blue }}
        >
          <Phone size={17} aria-hidden />
          {TEL}
        </a>
      </div>
    </header>
  );
}

/* ---------- 1. 첫 화면 ---------- */

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative">
      <div className="mx-auto grid max-w-[1200px] items-end gap-8 px-4 pb-14 pt-24 sm:px-6 md:grid-cols-[1.15fr_1fr] md:pt-28">
        <div>
          <p className="inline-flex items-center gap-2 rounded-[4px] px-2.5 py-1 text-[14px] font-bold" style={{ background: C.blueSoft, color: C.blue }}>
            10월 20일 월요일 오픈
          </p>
          <h1
            id="hero-title"
            className="mt-5 text-[46px] font-black leading-[1.12] tracking-[-0.045em] sm:text-[68px] lg:text-[84px]"
          >
            ㅇㅇ동에
            <br />
            세탁소가
            <br />
            <span style={{ color: C.blue }}>새로 열었어요</span>
          </h1>
          <p className="mt-6 max-w-[30em] text-[18px] leading-[1.7]" style={{ color: C.muted }}>
            ㅇㅇ초등학교 정문 건너편, 편의점 옆 1층이에요. 와이셔츠는 아침에 맡기시면 다음 날 저녁에 찾아가실 수 있어요.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <a
              href={`tel:${TEL}`}
              className="inline-flex h-14 items-center gap-2 rounded-[6px] px-6 text-[18px] font-bold text-white"
              style={{ background: C.blue }}
            >
              <Phone size={20} aria-hidden />
              전화로 물어보기
            </a>
            <a
              href="#visit"
              className="inline-flex h-14 items-center gap-2 rounded-[6px] border px-6 text-[18px] font-bold"
              style={{ borderColor: C.ink }}
            >
              <MapPin size={20} aria-hidden />
              위치 보기
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] md:aspect-[3/4]">
            <Image
              src={`${IMG}/hero.jpg`}
              alt="비닐을 씌워 옷걸이에 건 흰 와이셔츠와 개어 둔 수건"
              fill
              priority
              sizes="(min-width: 768px) 520px, 100vw"
              className="object-cover"
            />
          </div>
          <Tag className="absolute -bottom-6 left-4 w-[190px] rotate-[-6deg] sm:left-[-28px]" no="001">
            <p className="text-[13px] font-semibold" style={{ color: C.muted }}>
              오픈 첫 달
            </p>
            <p className="mt-1 text-[22px] font-black leading-[1.2]">
              전 품목
              <br />
              <span style={{ color: C.blue }}>20% 할인</span>
            </p>
          </Tag>
        </div>
      </div>
    </section>
  );
}

/* ---------- 꼬리표 ---------- */

function Tag({ children, className = "", no, swing = false }: { children: React.ReactNode; className?: string; no: string; swing?: boolean }) {
  const reduce = useReducedMotionSafe();
  return (
    <motion.div
      className={`relative border px-5 pb-5 pt-9 shadow-[0_8px_20px_rgba(15,23,42,0.12)] ${className}`}
      style={{
        background: C.tag,
        borderColor: C.tagEdge,
        clipPath: "polygon(18% 0, 82% 0, 100% 12%, 100% 100%, 0 100%, 0 12%)",
        transformOrigin: "50% 0",
      }}
      whileHover={swing && !reduce ? { rotate: [0, -4, 3, -1.5, 0], transition: { duration: 0.9 } } : undefined}
    >
      <span aria-hidden className="absolute left-1/2 top-3 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 bg-white" style={{ borderColor: C.tagEdge }} />
      <span aria-hidden className="absolute right-3 top-3 font-mono text-[11px] tracking-[0.08em]" style={{ color: C.muted }}>
        No.{no}
      </span>
      {children}
    </motion.div>
  );
}

/* ---------- 2. 오픈 할인 ---------- */

const OFFERS = [
  { no: "101", head: "전 품목 20% 할인", body: "10월 20일부터 11월 19일까지 맡기시는 옷은 모두 20% 깎아 드려요." },
  { no: "102", head: "와이셔츠 5장에 1장 더", body: "와이셔츠 5장을 함께 맡기시면 1장은 받지 않아요. 할인과 같이 받으실 수 있어요." },
  { no: "103", head: "이불 수거 무료", body: "이불은 무거우니까 ㅇㅇ동 안이면 가지러 가요. 전화로 시간만 알려 주세요." },
];

function OpenTags() {
  return (
    <section aria-labelledby="open-title" className="px-4 py-20 sm:px-6" style={{ background: C.blue, color: "#fff" }}>
      <div className="mx-auto max-w-[1200px]">
        <h2 id="open-title" className="text-[34px] font-black leading-[1.2] tracking-[-0.03em] sm:text-[48px]">
          문 연 기념으로
          <br />한 달 동안 이렇게 해 드려요
        </h2>
        <ul className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {OFFERS.map((o, i) => (
            <li key={o.no} className={i === 1 ? "sm:mt-8" : i === 2 ? "sm:mt-3" : ""}>
              <Tag no={o.no} swing className={i === 1 ? "rotate-[2deg]" : "rotate-[-2deg]"}>
                <p className="text-[24px] font-black leading-[1.25] tracking-[-0.02em]" style={{ color: C.ink }}>
                  {o.head}
                </p>
                <p className="mt-3 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
                  {o.body}
                </p>
              </Tag>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 3. 가격표(영수증) ---------- */

function Receipt() {
  const [cat, setCat] = useState<Cat>("top");
  const [picked, setPicked] = useState<Record<string, number>>({});

  const add = (id: string) => setPicked((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));
  const sub = (id: string) =>
    setPicked((p) => {
      const n = (p[id] ?? 0) - 1;
      const next = { ...p };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });

  const lines = ITEMS.filter((i) => picked[i.id]).map((i) => ({ ...i, qty: picked[i.id] }));
  const sum = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const shirts = picked.shirt ?? 0;
  const freeShirt = Math.floor(shirts / 6) * 2500; // 5장 맡기면 1장 무료 → 6장마다 1장
  const discount = Math.round(((sum - freeShirt) * OPEN_RATE) / 100) * 100;
  const total = sum - freeShirt - discount;

  return (
    <section aria-labelledby="price-title" className="px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-[1fr_400px] md:gap-14">
        <div>
          <h2 id="price-title" className="text-[34px] font-black leading-[1.2] tracking-[-0.03em] sm:text-[48px]">
            가격표
          </h2>
          <p className="mt-3 text-[17px]" style={{ color: C.muted }}>
            맡기실 옷을 누르면 오른쪽 영수증에 담겨요. 오픈 할인을 뺀 금액을 미리 보실 수 있어요.
          </p>

          <div role="tablist" aria-label="품목 분류" className="mt-8 flex flex-wrap gap-2">
            {CATS.map((c) => {
              const on = c.id === cat;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setCat(c.id)}
                  className="h-11 rounded-full border px-5 text-[16px] font-bold transition-colors"
                  style={on ? { background: C.ink, borderColor: C.ink, color: "#fff" } : { borderColor: C.line, color: C.ink }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <ul className="mt-6 border-t" style={{ borderColor: C.ink }}>
            {ITEMS.filter((i) => i.cat === cat).map((i) => (
              <li key={i.id} className="border-b" style={{ borderColor: C.line }}>
                <button
                  type="button"
                  onClick={() => add(i.id)}
                  aria-label={`${i.name} ${won(i.price)}원 영수증에 담기`}
                  className="flex min-h-[64px] w-full items-center justify-between gap-4 py-3 text-left transition-colors hover:bg-[#f5f8ff]"
                >
                  <span>
                    <span className="text-[19px] font-bold">{i.name}</span>
                    {i.note && (
                      <span className="ml-2 text-[14px]" style={{ color: C.muted }}>
                        {i.note}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[19px] font-bold">{won(i.price)}원</span>
                    <span
                      aria-hidden
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[20px] font-bold leading-none"
                      style={{ background: C.blueSoft, color: C.blue }}
                    >
                      +
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:pt-16">
          <div
            className="relative px-6 pb-8 pt-7 font-mono text-[15px] shadow-[0_10px_30px_rgba(15,23,42,0.12)]"
            style={{
              background: "#fff",
              border: `1px solid ${C.line}`,
              maskImage: "radial-gradient(circle 7px at 50% 100%, transparent 6.5px, #000 7px)",
              maskSize: "18px 100%",
              WebkitMaskImage: "radial-gradient(circle 7px at 50% 100%, transparent 6.5px, #000 7px)",
              WebkitMaskSize: "18px 100%",
            }}
            aria-live="polite"
          >
            <p className="text-center font-sans text-[18px] font-black">{STORE}</p>
            <p className="mt-1 text-center text-[13px]" style={{ color: C.muted }}>
              맡기실 옷 예상 금액
            </p>
            <div className="my-4 border-t border-dashed" style={{ borderColor: C.muted }} />
            {lines.length === 0 ? (
              <p className="py-6 text-center font-sans text-[15px]" style={{ color: C.muted }}>
                왼쪽 가격표에서 옷을 눌러 보세요.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {lines.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-sans">
                      <button
                        type="button"
                        onClick={() => sub(l.id)}
                        aria-label={`${l.name} 하나 빼기`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-[16px] leading-none"
                        style={{ borderColor: C.line }}
                      >
                        −
                      </button>
                      {l.name} × {l.qty}
                    </span>
                    <span>{won(l.price * l.qty)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="my-4 border-t border-dashed" style={{ borderColor: C.muted }} />
            <dl className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <dt className="font-sans">합계</dt>
                <dd>{won(sum)}</dd>
              </div>
              {freeShirt > 0 && (
                <div className="flex justify-between" style={{ color: C.blue }}>
                  <dt className="font-sans">와이셔츠 1장 더</dt>
                  <dd>-{won(freeShirt)}</dd>
                </div>
              )}
              <div className="flex justify-between" style={{ color: C.blue }}>
                <dt className="font-sans">오픈 할인 20%</dt>
                <dd>-{won(discount)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t-2 pt-3" style={{ borderColor: C.ink }}>
              <span className="font-sans text-[16px] font-bold">내실 금액</span>
              <span className="text-[26px] font-bold">{won(total)}원</span>
            </div>
            <p className="mt-4 font-sans text-[13px] leading-[1.6]" style={{ color: C.muted }}>
              얼룩, 수선, 명품 소재는 보고 나서 금액을 알려 드려요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. 맡기고 찾는 날 ---------- */

function Schedule() {
  const [day, setDay] = useState(0);

  return (
    <section aria-labelledby="schedule-title" className="px-4 py-20 sm:px-6" style={{ background: "#f6f8fc" }}>
      <div className="mx-auto max-w-[1200px]">
        <h2 id="schedule-title" className="text-[34px] font-black leading-[1.2] tracking-[-0.03em] sm:text-[48px]">
          언제 찾으러 오면 되나요
        </h2>
        <p className="mt-3 text-[17px]" style={{ color: C.muted }}>
          맡기실 요일을 고르세요. 일요일은 쉬어서 하루 더 걸려요.
        </p>

        <div role="radiogroup" aria-label="맡기는 요일" className="mt-8 grid grid-cols-6 gap-1.5 sm:max-w-[520px]">
          {DAYS.map((d, i) => {
            const on = i === day;
            return (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setDay(i)}
                className="h-14 rounded-[6px] border text-[19px] font-black transition-colors"
                style={on ? { background: C.blue, borderColor: C.blue, color: "#fff" } : { background: "#fff", borderColor: C.line }}
              >
                {d}
              </button>
            );
          })}
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {LEAD.map((l) => (
            <li key={l.kind} className="rounded-[8px] border bg-white px-5 py-5" style={{ borderColor: C.line }}>
              <p className="text-[16px] font-semibold" style={{ color: C.muted }}>
                {l.kind}
              </p>
              <p className="mt-1 text-[28px] font-black tracking-[-0.02em]">
                <span style={{ color: C.blue }}>{readyDay(day, l.days)}요일</span> 저녁부터
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <div className="flex gap-4 rounded-[8px] border bg-white px-5 py-5" style={{ borderColor: C.line }}>
            <Truck size={26} aria-hidden style={{ color: C.blue }} className="mt-1 shrink-0" />
            <div>
              <p className="text-[19px] font-bold">가지러 가요</p>
              <p className="mt-1 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
                평일 오전 9시~11시. ㅇㅇ동, ㅅㄷ동은 3만 원 이상이면 무료예요.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-[8px] border bg-white px-5 py-5" style={{ borderColor: C.line }}>
            <Truck size={26} aria-hidden style={{ color: C.blue }} className="mt-1 shrink-0 -scale-x-100" />
            <div>
              <p className="text-[19px] font-bold">가져다드려요</p>
              <p className="mt-1 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
                평일 저녁 7시~9시. 문 앞에 걸어 두고 문자로 알려 드려요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 5. 위치·영업시간 ---------- */

const HOURS = [
  { day: "월~금", time: "08:00 ~ 21:00" },
  { day: "토요일", time: "09:00 ~ 18:00" },
  { day: "일요일", time: "쉬어요" },
];

function Visit() {
  return (
    <section id="visit" aria-labelledby="visit-title" className="scroll-mt-4 px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-2">
        <div>
          <h2 id="visit-title" className="text-[34px] font-black leading-[1.2] tracking-[-0.03em] sm:text-[48px]">
            여기 있어요
          </h2>
          <p className="mt-5 flex items-start gap-2 text-[19px] font-bold leading-[1.6]">
            <MapPin size={22} aria-hidden className="mt-1 shrink-0" style={{ color: C.blue }} />
            {ADDRESS}
          </p>
          <p className="mt-2 pl-[30px] text-[16px] leading-[1.7]" style={{ color: C.muted }}>
            ㅇㅇ역 2번 출구에서 걸어서 5분. 가게 앞에 잠깐 세우실 수 있어요.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 pl-[30px]">
            <a href="#visit" className="inline-flex h-11 items-center rounded-[4px] border px-4 text-[15px] font-semibold" style={{ borderColor: C.line }}>
              네이버 지도
            </a>
            <a href="#visit" className="inline-flex h-11 items-center rounded-[4px] border px-4 text-[15px] font-semibold" style={{ borderColor: C.line }}>
              카카오맵
            </a>
          </div>
        </div>

        <div>
          <p className="flex items-center gap-2 text-[19px] font-bold">
            <Clock size={22} aria-hidden style={{ color: C.blue }} />
            영업시간
          </p>
          <dl className="mt-4 border-t-2" style={{ borderColor: C.ink }}>
            {HOURS.map((h) => (
              <div key={h.day} className="flex justify-between border-b py-4 text-[19px]" style={{ borderColor: C.line }}>
                <dt className="font-bold">{h.day}</dt>
                <dd className="font-mono" style={h.time === "쉬어요" ? { color: C.muted } : undefined}>
                  {h.time}
                </dd>
              </div>
            ))}
          </dl>
          <a
            href={`tel:${TEL}`}
            className="mt-8 flex h-16 items-center justify-center gap-2 rounded-[6px] text-[20px] font-bold text-white"
            style={{ background: C.blue }}
          >
            <Phone size={22} aria-hidden />
            {TEL}
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-4 pb-32 pt-10 text-[15px] sm:px-6 sm:pb-24" style={{ background: C.ink, color: "#cbd5e1" }}>
      <div className="mx-auto max-w-[1200px]">
        <p className="flex items-center gap-2 text-[18px] font-bold text-white">
          <LogoMark />
          {STORE}
        </p>
        <p className="mt-4 leading-[1.8]">
          대표 박ㅅ연
          <span aria-hidden className="mx-2 opacity-50">|</span>
          {ADDRESS}
          <span aria-hidden className="mx-2 opacity-50">|</span>
          전화 {TEL}
        </p>
        <p className="mt-6 text-[14px]" style={{ color: "#94a3b8" }}>
          © {STORE}
        </p>
      </div>
    </footer>
  );
}

/* ---------- 휴대폰 아래 고정 전화 ---------- */

function CallBar() {
  return (
    // 공용 떠 있는 버튼(바닥에서 20px, 높이 40px)보다 위에 둔다
    <div className="fixed inset-x-0 z-40 px-4 sm:hidden" style={{ bottom: "calc(76px + env(safe-area-inset-bottom, 0px))" }}>
      <a
        href={`tel:${TEL}`}
        className="flex h-14 items-center justify-center gap-2 rounded-[10px] text-[18px] font-bold text-white shadow-[0_8px_24px_rgba(20,40,90,0.25)]"
        style={{ background: C.blue }}
      >
        <Phone size={20} aria-hidden />
        전화하기
      </a>
    </div>
  );
}
