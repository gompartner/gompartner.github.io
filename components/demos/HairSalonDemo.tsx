"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useScroll, useTransform } from "framer-motion";
import { CalendarCheck, Car, Check, Clock, MapPin, Minus, Plus, Scissors, TrainFront } from "lucide-react";
import { Black_Han_Sans, Gasoek_One } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 미용실 홈페이지 샘플: 가상의 곰파트너헤어. 디자이너 4명(원장 1, 디자이너 3).
   상호, 주소, 디자이너 이름은 모두 가상이다.

   국내 미용실 홈페이지와 네이버 예약 페이지의 공통 구성을 따른다.
   - 메뉴: 디자이너 소개, 시술 메뉴(가격표), 예약, 스타일북, 오시는 길
   - 가격표는 컷, 펌, 염색, 클리닉, 매직, 드라이 묶음. 기장 추가 요금 별도, 원장 지명 추가 요금.
   - 예약은 디자이너를 먼저 고르고 시술을 담은 뒤 날짜와 시간을 고른다. 소요시간만큼 칸이 잡힌다.
   - 관용 문구: 예약하기, 당일 예약 가능, 월요일 정기휴무, 주차 가능, 예약 변경은 하루 전까지.

   핵심 모션: 키네틱 타이포그래피.
   첫 화면은 시술 이름 여섯 개가 아주 큰 글자로 두 줄, 서로 반대 방향으로 끊김 없이 흐른다.
   디자이너를 고르면 주색과 큰 글자의 테두리 두께가 그 디자이너 것으로 바뀐다.
   가격 글자는 보일 때 숫자 자리마다 위에서 떨어지며 들어오고, 합계 금액은 자리마다 굴러서 바뀐다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 디자이너 고르기: 주색, 가능한 시술, 시술 단가(지명 추가 요금)가 바뀐다.
   2. 시술 담기: 여러 개 담으면 소요시간과 금액이 합산되고 금액은 롤링 숫자로 바뀐다.
   3. 예약 시간표: 오늘부터 7일 x 30분 칸 격자. 소요시간만큼 연속 칸이 잡히고 찬 칸은 못 고른다. 이름과 휴대폰을 넣으면 접수 완료.
   4. 스타일북: 글자로 된 스타일 이름 목록. 누르면 큰 글자로 커지고 어울리는 시술 조합이 뜬다.
   5. 오시는 길과 영업시간: 월요일 휴무, 오늘 요일 진하게.

   포스터 첫 화면(hs-poster): 코발트 파랑 바탕에 흰 글자 한 문장 "오늘 저녁에도 자리 있어요".
   금속 가위가 왼쪽 밖에서 들어와 문장을 가로질러 자르면 문장이 그 선을 따라 위아래 반쪽으로 벌어졌다가 다시 붙는다.
   위아래 반쪽은 같은 포스터 두 장을 자른 선 위아래로 clip-path 한 것이다. 가위는 제자리에서 날을 아주 천천히 여닫는다.
   스크롤하면 가위가 반대로 지나가고 위 반쪽은 위로, 아래 반쪽은 아래로 열리며 뒤에 있던 기존 화면이 드러난다. */

const BRAND = "곰파트너헤어";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 2층";
const KAKAO = "카카오톡 채널 곰파트너";
const TEL = "02-000-0000";

const heavyF = { fontFamily: `${Black_Han_Sans.style.fontFamily}, var(--font-sfx), sans-serif`, fontWeight: 400 } as const;
const bigF = { fontFamily: `${Gasoek_One.style.fontFamily}, var(--font-sfx), sans-serif`, fontWeight: 400 } as const;

/* 모션 상수 */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 마키 한 바퀴. 두 줄은 방향만 다르고 속도는 같다. */
const MARQUEE_MS = 22000;
/** 가격 글자 낙하: 글자마다 40ms 간격, 한 글자 120ms. 8글자면 400ms 안에 끝난다. */
const DROP_STAGGER = 0.04;
const DROP_MS = 120;
/** 합계 롤링 숫자 */
const ROLL_MS = 420;
/** 주색 전환 */
const COLOR_MS = 400;

const C = {
  bg: "#f4f4f4",
  paper: "#ffffff",
  ink: "#111111",
  muted: "#5c5c5c",
  line: "#d9d9d9",
  soft: "#e9e9e9",
  error: "#b42318",
};

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";

/* 시술 메뉴. 가격은 디자이너 기본 단가, 분은 소요시간. */
type ServiceId = "cut" | "perm" | "color" | "clinic" | "magic" | "dry";
interface Service {
  id: ServiceId;
  name: string;
  detail: string;
  price: number;
  min: number;
}
const SERVICES: Service[] = [
  { id: "cut", name: "컷", detail: "샴푸, 드라이 포함", price: 25000, min: 40 },
  { id: "perm", name: "펌", detail: "일반펌, 열펌 기준", price: 90000, min: 150 },
  { id: "color", name: "염색", detail: "뿌리 염색은 상담", price: 70000, min: 120 },
  { id: "clinic", name: "클리닉", detail: "손상모 케어", price: 50000, min: 60 },
  { id: "magic", name: "매직", detail: "매직 스트레이트", price: 150000, min: 180 },
  { id: "dry", name: "드라이", detail: "스타일링 드라이", price: 20000, min: 30 },
];
const SERVICE_BY_ID = Object.fromEntries(SERVICES.map((s) => [s.id, s])) as Record<ServiceId, Service>;

/* 디자이너. extra는 지명 추가 요금 비율, stroke는 첫 화면 큰 글자 테두리 두께(px). */
interface Designer {
  id: string;
  name: string;
  role: string;
  color: string;
  extra: number;
  stroke: number;
  good: string;
  can: ServiceId[];
}
const DESIGNERS: Designer[] = [
  { id: "kim", name: "김ㅎ늘", role: "원장", color: "#d8300f", extra: 0.4, stroke: 7, good: "매직, 손상모 펌", can: ["cut", "perm", "color", "clinic", "magic", "dry"] },
  { id: "lee", name: "이ㅅ아", role: "수석 디자이너", color: "#1d4fe0", extra: 0.15, stroke: 5, good: "레이어드컷, 열펌", can: ["cut", "perm", "color", "clinic", "magic", "dry"] },
  { id: "park", name: "박ㅈ우", role: "디자이너", color: "#b0169c", extra: 0, stroke: 3, good: "염색, 발레아쥬", can: ["cut", "perm", "color", "clinic", "dry"] },
  { id: "choi", name: "최ㅁ영", role: "디자이너", color: "#0e6b78", extra: 0, stroke: 2, good: "남성 컷, 다운펌", can: ["cut", "perm", "color", "dry"] },
];

/** 디자이너 단가. 추가 요금을 붙여 천 원 단위로 올린다. */
const priceOf = (s: Service, d: Designer) => Math.ceil((s.price * (1 + d.extra)) / 1000) * 1000;
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ""}` : `${m}분`);

/* 영업시간. 월요일 정기휴무. */
const OPEN_H = 10;
const CLOSE_H = 20;
const SLOTS = (CLOSE_H - OPEN_H) * 2;
const slotLabel = (i: number) => `${OPEN_H + Math.floor(i / 2)}:${i % 2 ? "30" : "00"}`;
const DAYS = 7;

/** 이미 찬 칸. 실제로는 예약 장부에서 읽는다. 디자이너, 날짜, 칸으로 정해져 새로고침해도 같다. */
function taken(designerIdx: number, dayIdx: number, slot: number) {
  let h = (designerIdx + 1) * 2654435761 + (dayIdx + 3) * 40503 + (slot + 11) * 97;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 101;
  // 오후와 주말이 먼저 찬다
  const busy = slot >= 8 ? 18 : 6;
  return h < 24 + busy;
}

/* 스타일북. 조합은 시술 id 목록. */
interface Style {
  name: string;
  combo: ServiceId[];
  note: string;
}
const STYLES: Style[] = [
  { name: "허쉬컷", combo: ["cut", "dry"], note: "층을 많이 내고 끝을 가볍게 쳐요." },
  { name: "레이어드컷", combo: ["cut"], note: "얼굴 옆 층으로 자연스럽게 흘러요." },
  { name: "히피펌", combo: ["cut", "perm"], note: "뿌리부터 잔잔하게 말아요. 두 달쯤 가요." },
  { name: "빌드펌", combo: ["cut", "perm"], note: "볼륨을 아래로 쌓는 굵은 웨이브예요." },
  { name: "애즈펌", combo: ["perm", "clinic"], note: "열펌이라 클리닉을 같이 해요." },
  { name: "글램펌", combo: ["cut", "perm", "clinic"], note: "긴 머리 웨이브. 기장 추가 요금이 있어요." },
  { name: "C컬 매직", combo: ["magic", "cut"], note: "끝만 안으로 말리는 매직이에요." },
  { name: "볼륨매직", combo: ["magic", "clinic"], note: "뿌리 볼륨을 살리고 열 손상은 클리닉으로 잡아요." },
  { name: "발레아쥬", combo: ["color", "clinic"], note: "손으로 그려 넣는 그라데이션 염색이에요." },
  { name: "애쉬브라운", combo: ["color"], note: "붉은 기 없는 갈색. 탈색 없이 가능해요." },
  { name: "가르마펌", combo: ["cut", "perm"], note: "남성 앞머리 방향을 잡아 줘요." },
  { name: "다운펌", combo: ["cut", "perm"], note: "옆머리 뜨는 걸 눌러요. 30분이면 돼요." },
];

const sum = (ids: ServiceId[], d: Designer) => ids.reduce((a, id) => ({ price: a.price + priceOf(SERVICE_BY_ID[id], d), min: a.min + SERVICE_BY_ID[id].min }), { price: 0, min: 0 });

type Slot = { day: number; slot: number };

export function HairSalonDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [dIdx, setDIdx] = useState(1);
  const designer = DESIGNERS[dIdx];
  const [cart, setCart] = useState<ServiceId[]>(["cut"]);
  const [picked, setPicked] = useState<Slot | null>(null);
  const [done, setDone] = useState<{ no: string; name: string; phone: string; slot: Slot; services: ServiceId[]; designer: Designer } | null>(null);

  // 현재 시각(분). 서버 렌더와 맞추기 위해 브라우저에서 한 번 읽는다. 오늘 지난 칸을 막는 데 쓴다.
  const [nowMin, setNowMin] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const pickDesigner = (i: number) => {
    setDIdx(i);
    setCart((c) => c.filter((id) => DESIGNERS[i].can.includes(id)));
    setPicked(null);
    setDone(null);
  };
  const toggle = (id: ServiceId) => {
    setCart((c) => (c.includes(id) ? c.filter((x) => x !== id) : SERVICES.filter((s) => c.includes(s.id) || s.id === id).map((s) => s.id)));
    setPicked(null);
    setDone(null);
  };
  const setCombo = (ids: ServiceId[]) => {
    const best = DESIGNERS.findIndex((d) => ids.every((id) => d.can.includes(id)));
    if (!ids.every((id) => designer.can.includes(id)) && best >= 0) setDIdx(best);
    setCart(SERVICES.filter((s) => ids.includes(s.id)).map((s) => s.id));
    setPicked(null);
    setDone(null);
    go("hs-reserve");
  };
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const total = sum(cart, designer);
  const need = Math.ceil(total.min / 30);
  const todayDow = today.getDay();
  const openToday = todayDow !== 1;

  const accent = designer.color;
  const pageStyle = {
    "--hs-accent": accent,
    "--hs-stroke": `${designer.stroke}px`,
    color: C.ink,
    backgroundColor: C.bg,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen overflow-x-clip" style={pageStyle}>
      <style>{`
        @keyframes hs-marquee-l { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }
        @keyframes hs-marquee-r { from { transform: translate3d(-50%,0,0); } to { transform: translate3d(0,0,0); } }
        .hs-track { display: inline-flex; width: max-content; white-space: nowrap; animation: hs-marquee-l ${MARQUEE_MS}ms linear infinite; }
        .hs-track[data-dir="r"] { animation-name: hs-marquee-r; }
        @media (prefers-reduced-motion: reduce) { .hs-track { animation: none; } }
        .hs-fill { color: var(--hs-accent); transition: color ${COLOR_MS}ms ease; }
        .hs-outline { color: transparent; -webkit-text-stroke: var(--hs-stroke) var(--hs-accent); transition: -webkit-text-stroke-color ${COLOR_MS}ms ease, -webkit-text-stroke-width ${COLOR_MS}ms ease; }
        .hs-accent-bg { background: var(--hs-accent); transition: background-color ${COLOR_MS}ms ease; }
        .hs-accent-text { color: var(--hs-accent); transition: color ${COLOR_MS}ms ease; }
        .hs-accent-border { border-color: var(--hs-accent); transition: border-color ${COLOR_MS}ms ease; }
      `}</style>

      <Poster reduce={reduce} onCta={() => go("hs-reserve")} />

      {/* 포스터가 열리면 뒤에서 바로 보이도록 화면 한 장만큼 위로 겹쳐 둔다 */}
      <div className={reduce ? "" : "relative z-0 -mt-[100svh]"}>
      <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-4 md:px-6">
        <a href="#hs-hero" className={`inline-flex items-center gap-2 rounded-[4px] ${focusRing}`} style={{ outlineColor: C.ink }}>
          <Scissors size={22} aria-hidden className="hs-accent-text" />
          <span className="text-[22px] leading-none" style={heavyF}>
            {BRAND}
          </span>
        </a>
        <nav aria-label="메뉴" className="hidden items-center gap-1 text-[15px] font-bold md:flex">
          {[
            ["hs-designers", "디자이너"],
            ["hs-menu", "시술 메뉴"],
            ["hs-reserve", "예약"],
            ["hs-stylebook", "스타일북"],
            ["hs-location", "오시는 길"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={`rounded-[4px] px-3 py-2 hover:underline hover:underline-offset-4 ${focusRing}`} style={{ outlineColor: C.ink }}>
              {label}
            </button>
          ))}
        </nav>
        <button type="button" onClick={() => go("hs-reserve")} className={`hs-accent-bg flex-none rounded-[4px] px-4 py-2 text-[15px] font-extrabold text-white ${focusRing}`} style={{ outlineColor: C.ink }}>
          예약하기
        </button>
      </header>

      {/* 첫 화면: 시술 이름 마키 두 줄 */}
      <section id="hs-hero" aria-labelledby="hs-title" className="pt-4 md:pt-8">
        <div className="overflow-hidden select-none" aria-hidden>
          <Marquee dir="l" cls="hs-fill" />
          <Marquee dir="r" cls="hs-outline" />
        </div>
        <div className="mx-auto mt-6 flex max-w-[1200px] flex-wrap items-end justify-between gap-4 px-4 md:mt-10 md:px-6">
          <div>
            <h2 id="hs-title" className="text-[40px] leading-[1] md:text-[56px]" style={heavyF}>
              {BRAND}
            </h2>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[16px] font-bold">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={17} aria-hidden />
                {openToday ? `오늘 ${OPEN_H}:00 ~ ${CLOSE_H}:00` : "오늘 정기휴무"}
              </span>
              <span style={{ color: C.muted }}>{openToday ? "당일 예약 가능" : "화요일부터 예약 가능"}</span>
            </p>
          </div>
          <p className="text-[15px] leading-[1.6]" style={{ color: C.muted }}>
            지금 보는 색은 <b className="hs-accent-text">{designer.role} {designer.name}</b>
            <br />
            디자이너를 고르면 색이 바뀌어요
          </p>
        </div>
      </section>

      {/* 1. 디자이너 */}
      <section id="hs-designers" aria-labelledby="hs-designers-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="hs-designers-title">디자이너</SectionTitle>
        <div role="radiogroup" aria-label="디자이너 선택" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DESIGNERS.map((d, i) => {
            const on = i === dIdx;
            return (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => pickDesigner(i)}
                className={`group relative flex flex-col items-start rounded-[6px] border-2 p-4 text-left transition-[border-color,background-color] duration-200 ${focusRing}`}
                style={{ borderColor: on ? d.color : C.line, background: on ? C.paper : "transparent", outlineColor: d.color }}
              >
                <span className="flex w-full items-center justify-between">
                  <span className="inline-block h-4 w-10 rounded-[2px]" style={{ background: d.color }} aria-hidden />
                  {on && (
                    <span className="inline-flex items-center gap-1 text-[13px] font-bold" style={{ color: d.color }}>
                      <Check size={14} aria-hidden /> 선택
                    </span>
                  )}
                </span>
                <span className="mt-3 text-[26px] leading-none" style={{ ...heavyF, color: on ? d.color : C.ink }}>
                  {d.name}
                </span>
                <span className="mt-1 text-[15px] font-bold">{d.role}</span>
                <span className="mt-2 text-[14px]" style={{ color: C.muted }}>
                  잘하는 것 {d.good}
                </span>
                <span className="mt-3 flex flex-wrap gap-1" aria-label="가능한 시술">
                  {SERVICES.map((s) => {
                    const ok = d.can.includes(s.id);
                    return (
                      <span key={s.id} className="rounded-[3px] border px-1.5 py-0.5 text-[12px] font-bold" style={{ borderColor: ok ? C.ink : C.line, color: ok ? C.ink : "#9a9a9a", textDecoration: ok ? "none" : "line-through" }}>
                        {s.name}
                      </span>
                    );
                  })}
                </span>
                <span className="mt-3 text-[14px] font-bold" style={{ color: d.extra ? d.color : C.muted }}>
                  {d.extra ? `지명 추가 요금 ${Math.round(d.extra * 100)}%` : "추가 요금 없음"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. 시술 메뉴와 합계 */}
      <section id="hs-menu" aria-labelledby="hs-menu-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionTitle id="hs-menu-title">시술 메뉴</SectionTitle>
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>
            {designer.role} {designer.name} 단가, 기장 추가 요금 별도
          </p>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <ul className="divide-y border-y" style={{ borderColor: C.ink }}>
            {SERVICES.map((s) => {
              const ok = designer.can.includes(s.id);
              const on = cart.includes(s.id);
              return (
                <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-3 md:grid-cols-[120px_minmax(0,1fr)_auto_auto] md:gap-x-6" style={{ borderColor: C.line, opacity: ok ? 1 : 0.45 }}>
                  <span className="text-[26px] leading-none md:text-[30px]" style={heavyF}>
                    {s.name}
                  </span>
                  <span className="col-start-1 row-start-2 text-[14px] md:col-start-2 md:row-start-1" style={{ color: C.muted }}>
                    {ok ? `${s.detail}, ${fmtMin(s.min)}` : `${designer.name} 디자이너는 하지 않는 시술`}
                  </span>
                  <span className="col-start-2 row-start-1 text-right text-[22px] font-extrabold tabular-nums md:col-start-3 md:min-w-[120px]">
                    <DropText key={`${designer.id}-${s.id}`} text={won(priceOf(s, designer))} reduce={reduce} />
                  </span>
                  <button
                    type="button"
                    disabled={!ok}
                    aria-pressed={on}
                    onClick={() => toggle(s.id)}
                    data-gtm-cta="hair-salon_add"
                    className={`col-start-2 row-start-2 inline-flex min-w-[76px] items-center justify-center gap-1 justify-self-end rounded-[4px] border-2 px-3 py-1.5 text-[14px] font-extrabold transition-colors duration-150 disabled:cursor-not-allowed md:col-start-4 md:row-start-1 ${focusRing}`}
                    style={on ? { background: accent, borderColor: accent, color: "#fff", outlineColor: C.ink } : { background: "transparent", borderColor: C.ink, color: C.ink, outlineColor: accent }}
                  >
                    {on ? <Minus size={14} aria-hidden /> : <Plus size={14} aria-hidden />}
                    {on ? "빼기" : "담기"}
                  </button>
                </li>
              );
            })}
          </ul>

          <aside aria-labelledby="hs-cart-title" className="rounded-[6px] border-2 p-5 lg:sticky lg:top-4" style={{ borderColor: C.ink, background: C.paper }}>
            <h3 id="hs-cart-title" className="text-[15px] font-bold" style={{ color: C.muted }}>
              담은 시술
            </h3>
            {cart.length === 0 ? (
              <p className="mt-2 text-[16px] font-bold">아직 없어요</p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-live="polite">
                {cart.map((id) => (
                  <li key={id} className="rounded-[3px] px-2 py-0.5 text-[15px] font-extrabold text-white" style={{ background: accent }}>
                    {SERVICE_BY_ID[id].name}
                  </li>
                ))}
              </ul>
            )}
            <dl className="mt-4 grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2">
              <dt className="text-[15px] font-bold" style={{ color: C.muted }}>
                소요시간
              </dt>
              <dd className="text-right text-[20px] font-extrabold tabular-nums">{total.min ? fmtMin(total.min) : "0분"}</dd>
              <dt className="text-[15px] font-bold" style={{ color: C.muted }}>
                금액
              </dt>
              <dd className="text-right text-[34px] leading-none" style={heavyF}>
                <RollingWon value={total.price} reduce={reduce} />
              </dd>
            </dl>
            <p className="mt-2 text-right text-[13px]" style={{ color: C.muted }}>
              {designer.role} {designer.name} 기준
            </p>
            <button type="button" onClick={() => go("hs-reserve")} disabled={cart.length === 0} className={`hs-accent-bg mt-4 w-full rounded-[4px] px-4 py-3 text-[16px] font-extrabold text-white disabled:opacity-50 ${focusRing}`} style={{ outlineColor: C.ink }}>
              이 시술로 예약하기
            </button>
          </aside>
        </div>
      </section>

      {/* 3. 예약 시간표 */}
      <section id="hs-reserve" aria-labelledby="hs-reserve-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionTitle id="hs-reserve-title">예약</SectionTitle>
          <p className="text-[14px] font-bold" style={{ color: C.muted }}>
            {designer.role} {designer.name}, {cart.length ? `${cart.map((id) => SERVICE_BY_ID[id].name).join(" + ")} ${fmtMin(total.min)}` : "시술을 먼저 담아 주세요"}
          </p>
        </div>
        {done ? (
          <DoneCard done={done} today={today} nowMin={nowMin} onReset={() => setDone(null)} />
        ) : (
          <Timetable today={today} dIdx={dIdx} accent={accent} need={need} nowMin={nowMin} picked={picked} setPicked={setPicked} reduce={reduce} cart={cart} total={total} designer={designer} onDone={setDone} />
        )}
      </section>

      {/* 4. 스타일북 */}
      <section id="hs-stylebook" aria-labelledby="hs-stylebook-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="hs-stylebook-title">스타일북</SectionTitle>
        <StyleBook designer={designer} reduce={reduce} onCombo={setCombo} />
      </section>

      {/* 5. 오시는 길, 영업시간 */}
      <section id="hs-location" aria-labelledby="hs-location-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <SectionTitle id="hs-location-title">오시는 길</SectionTitle>
        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-[6px] border-2 p-5" style={{ borderColor: C.ink, background: C.paper }}>
            <MapSketch accent={accent} />
            <dl className="mt-4 grid gap-3 text-[15px] leading-[1.6]">
              <div className="flex gap-2">
                <dt className="flex-none pt-0.5" aria-label="주소">
                  <MapPin size={18} aria-hidden />
                </dt>
                <dd>{ADDRESS}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="flex-none pt-0.5" aria-label="지하철">
                  <TrainFront size={18} aria-hidden />
                </dt>
                <dd>ㅇㅇ역 3번 출구 도보 4분</dd>
              </div>
              <div className="flex gap-2">
                <dt className="flex-none pt-0.5" aria-label="주차">
                  <Car size={18} aria-hidden />
                </dt>
                <dd>건물 지하 주차 2시간 무료, 만차 시 ㅇㅇ공영주차장</dd>
              </div>
              <div className="flex gap-2">
                <dt className="flex-none pt-0.5" aria-label="전화">
                  <Clock size={18} aria-hidden />
                </dt>
                <dd>
                  전화 {TEL}, {KAKAO}
                </dd>
              </div>
            </dl>
          </div>
          <Hours todayDow={todayDow} accent={accent} />
        </div>
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pb-24 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted }}>
        <p className="text-[18px]" style={{ ...heavyF, color: C.ink }}>
          {BRAND}
        </p>
        <p>
          {ADDRESS}, 전화 {TEL}
        </p>
        <p>화~일 {OPEN_H}:00 ~ {CLOSE_H}:00, 월요일 정기휴무</p>
        <DemoMakerInfo className="mt-6" />
      </footer>
      </div>
    </div>
  );
}

/* 포스터 첫 화면 */

const P = { bg: "#1238d6", seam: "#061866", ink: "#ffffff", soft: "#dfe6ff", shadow: "#04114f" };
const POSTER_LINE = "오늘 저녁에도 자리 있어요";
/** 가위가 왼쪽 밖에서 제자리까지 오는 시간. 날은 이 동안 두 번 싹둑 닫힌다. */
const TRAVEL_MS = 1000;
/** 문장이 갈라졌다 붙는 전체 길이. 40%(680ms)부터 벌어지고 62%(1050ms)에 가장 크게(위아래 4svh, 옆으로 2vw 어긋나게) 벌어진다. */
const SPLIT_MS = 1700;
/** 자른 선은 가위를 따라 그어지고, 문장이 벌어질 때 사라진다 */
const LINE_FADE_MS = 350;
const LINE_FADE_DELAY_MS = 1050;
/** 제자리 가위 날이 아주 조금 벌어졌다 닫히는 반복. 등장이 끝난 뒤 시작한다. */
const IDLE_MS = 8000;
const IDLE_DELAY_MS = 1800;
/** 가위 이동 곡선: 빠르게 들어와 문장을 지나고 제자리에서 천천히 멈춘다 */
const CUT_EASE = "cubic-bezier(0.3, 0.75, 0.35, 1)";
/** 스크롤 퇴장: 가위는 0~22% 구간에 왼쪽으로 빠지고, 포스터는 4~42% 구간에 위아래로 열린다(42%쯤 sticky 가 풀린다). */
const BACK_RANGE = [0, 0.22];
const OPEN_RANGE = [0.04, 0.42];

const POSTER_CSS = `
  .hs-p { --cut: 60%; --lo: 3.85; --f: clamp(52px, 17vw, 72px); --px: 86vw; --sw: 600px; }
  .hs-p-info { bottom: 96px; }
  @media (min-width: 768px) {
    .hs-p { --cut: 60%; --lo: 1.65; --f: clamp(96px, min(10vw, 18svh), 200px); --px: 83vw; --sw: min(1000px, 70vw, 112svh); }
    .hs-p-info { bottom: auto; top: calc(var(--cut) + var(--f) * 0.8); }
  }
  .hs-p-blade-a, .hs-p-blade-b { transform-box: view-box; transform-origin: 260px 160px; }
  .hs-p-blade-a { transform: rotate(-15deg); }
  .hs-p-blade-b { transform: rotate(15deg); }
  .hs-p-line { opacity: 0; }
  .hs-p-seam { opacity: 0; }
  .hs-p[data-anim="1"] .hs-p-travel { animation: hs-p-travel ${TRAVEL_MS}ms ${CUT_EASE} both; }
  .hs-p[data-anim="1"] .hs-p-blade-a { animation: hs-p-snip-a ${TRAVEL_MS}ms linear both, hs-p-idle-a ${IDLE_MS}ms ease-in-out ${IDLE_DELAY_MS}ms infinite; }
  .hs-p[data-anim="1"] .hs-p-blade-b { animation: hs-p-snip-b ${TRAVEL_MS}ms linear both, hs-p-idle-b ${IDLE_MS}ms ease-in-out ${IDLE_DELAY_MS}ms infinite; }
  .hs-p[data-anim="1"] .hs-p-line { animation: hs-p-fade ${LINE_FADE_MS}ms ease ${LINE_FADE_DELAY_MS}ms both; }
  .hs-p[data-anim="1"] .hs-p-up { animation: hs-p-up ${SPLIT_MS}ms ease-out both; }
  .hs-p[data-anim="1"] .hs-p-down { animation: hs-p-down ${SPLIT_MS}ms ease-out both; }
  .hs-p[data-anim="1"] .hs-p-seam { animation: hs-p-seam ${SPLIT_MS}ms ease-out both; }
  @keyframes hs-p-travel { from { transform: translate3d(calc(-1 * var(--px) - 62%), 0, 0); } to { transform: translate3d(0, 0, 0); } }
  @keyframes hs-p-snip-a { 0% { transform: rotate(-18deg); } 25% { transform: rotate(-1deg); } 50% { transform: rotate(-18deg); } 75% { transform: rotate(-1deg); } 100% { transform: rotate(-15deg); } }
  @keyframes hs-p-snip-b { 0% { transform: rotate(18deg); } 25% { transform: rotate(1deg); } 50% { transform: rotate(18deg); } 75% { transform: rotate(1deg); } 100% { transform: rotate(15deg); } }
  @keyframes hs-p-idle-a { 0%, 100% { transform: rotate(-15deg); } 50% { transform: rotate(-10deg); } }
  @keyframes hs-p-idle-b { 0%, 100% { transform: rotate(15deg); } 50% { transform: rotate(10deg); } }
  @keyframes hs-p-fade { from { opacity: 1; } to { opacity: 0; } }
  @keyframes hs-p-up { 0%, 40% { transform: translate3d(0, 0, 0); } 62% { transform: translate3d(-2vw, -4svh, 0) rotate(-1deg); } 84% { transform: translate3d(0.2vw, 0.4svh, 0); } 100% { transform: translate3d(0, 0, 0); } }
  @keyframes hs-p-down { 0%, 40% { transform: translate3d(0, 0, 0); } 62% { transform: translate3d(2vw, 4svh, 0) rotate(0.6deg); } 84% { transform: translate3d(-0.2vw, -0.4svh, 0); } 100% { transform: translate3d(0, 0, 0); } }
  @keyframes hs-p-seam { 0%, 38% { opacity: 1; } 96% { opacity: 1; } 100% { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) {
    .hs-p .hs-p-travel, .hs-p .hs-p-blade-a, .hs-p .hs-p-blade-b, .hs-p .hs-p-line, .hs-p .hs-p-up, .hs-p .hs-p-down, .hs-p .hs-p-seam { animation: none !important; }
  }
`;

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const back = useTransform(scrollYProgress, BACK_RANGE, ["0vw", "-150vw"]);
  const up = useTransform(scrollYProgress, OPEN_RANGE, ["0%", "-64%"]);
  const down = useTransform(scrollYProgress, OPEN_RANGE, ["0%", "68%"]);

  return (
    <section ref={ref} id="hs-poster" aria-labelledby="hs-poster-title" className={`relative z-10 ${reduce ? "" : "h-[180svh]"}`}>
      <style>{POSTER_CSS}</style>
      <div className={`hs-p pointer-events-none overflow-hidden ${reduce ? "relative h-svh min-h-[560px]" : "sticky top-0 h-svh"}`} data-anim={reduce ? "0" : "1"} style={{ background: reduce ? P.bg : "transparent" }}>
        {/* 갈라질 때 뒤에 까는 판. 자른 선 자리만 짙고, 반쪽이 옆으로 밀려도 가장자리가 비지 않게 화면 전체를 덮는다. 등장이 끝나면 사라진다. */}
        <div
          aria-hidden
          className="hs-p-seam absolute inset-0"
          style={{ background: `linear-gradient(to bottom, ${P.bg} calc(var(--cut) - 6svh), ${P.seam} calc(var(--cut) - 4svh), ${P.seam} calc(var(--cut) + 4svh), ${P.bg} calc(var(--cut) + 6svh))` }}
        />

        {/* 아래 반쪽 */}
        <motion.div className="absolute inset-0" style={reduce ? undefined : { y: down }}>
          <div className="hs-p-down absolute inset-0" style={{ background: P.bg, clipPath: "inset(var(--cut) 0 0 0)", transformOrigin: "100% var(--cut)" }}>
            <PosterLine asH1={false} />
            <p className="hs-p-info absolute left-4 text-[15px] font-bold md:left-16 md:text-[18px]" style={{ color: P.soft }}>
              화~일 {OPEN_H}:00 ~ {CLOSE_H}:00, 당일 예약 가능
            </p>
          </div>
        </motion.div>

        {/* 위 반쪽 */}
        <motion.div className="absolute inset-0" style={reduce ? undefined : { y: up }}>
          <div className="hs-p-up absolute inset-0" style={{ background: P.bg, clipPath: "inset(0 0 calc(100% - var(--cut)) 0)", transformOrigin: "100% var(--cut)" }}>
            <div className="absolute left-4 top-5 inline-flex items-center gap-2 md:left-16 md:top-8" style={{ color: P.ink }}>
              <Scissors size={18} aria-hidden />
              <span className="text-[17px] leading-none" style={heavyF}>
                {BRAND}
              </span>
            </div>
            <button
              type="button"
              aria-label="예약하기"
              data-gtm-cta="hair-salon_poster_cta"
              onClick={onCta}
              className="pointer-events-auto absolute right-4 top-3 grid h-12 w-12 place-items-center rounded-full transition-transform duration-150 hover:scale-105 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] md:right-16 md:top-6 md:h-14 md:w-14"
              style={{ background: P.ink, color: P.bg, outlineColor: P.ink }}
            >
              <CalendarCheck size={22} aria-hidden strokeWidth={2.2} />
            </button>
            <PosterLine asH1 />
          </div>
        </motion.div>

        {/* 가위 */}
        <motion.div aria-hidden className="absolute" style={{ left: "calc(var(--px) - var(--sw) * 0.40625)", top: "calc(var(--cut) - var(--sw) * 0.25)", width: "var(--sw)", ...(reduce ? {} : { x: back }) }}>
          <div className="hs-p-travel relative">
            {/* 가위가 지나간 선. 가위와 같이 움직여 끝이 늘 축에 붙어 있다. */}
            <div className="hs-p-line absolute h-[2px]" style={{ top: "calc(50% - 1px)", right: "calc(var(--sw) * 0.59375)", width: "200vw", background: P.ink }} />
            <ScissorsArt />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** 큰 문장. 위아래 반쪽에 같은 문장을 한 번씩 그린다. 휴대폰은 네 줄, PC는 두 줄. 자른 선은 마지막 줄 가운데를 지난다. */
function PosterLine({ asH1 }: { asH1: boolean }) {
  const Tag = asH1 ? "h1" : "p";
  return (
    <Tag
      id={asH1 ? "hs-poster-title" : undefined}
      aria-hidden={asH1 ? undefined : true}
      className="absolute left-4 right-4 md:left-16 md:right-16"
      style={{ ...heavyF, color: P.ink, fontSize: "var(--f)", lineHeight: 1.1, top: "calc(var(--cut) - var(--f) * var(--lo))", wordBreak: "keep-all", letterSpacing: "-0.01em" }}
    >
      {asH1 && <span className="sr-only">{POSTER_LINE}</span>}
      <span aria-hidden className="block">
        오늘<span className="hidden md:inline"> 저녁에도</span>
      </span>
      <span aria-hidden className="block md:hidden">
        저녁에도
      </span>
      <span aria-hidden className="block">
        자리<span className="hidden md:inline"> 있어요</span>
      </span>
      <span aria-hidden className="block md:hidden">
        있어요
      </span>
    </Tag>
  );
}

/** 미용 가위. 축(260,160)을 중심으로 두 쪽이 반대로 돈다. 한 쪽은 날과 손잡이 고리가 축을 지나 이어진다. */
function ScissorsArt() {
  return (
    <svg viewBox="0 0 640 320" className="block h-auto w-full overflow-visible">
      <defs>
        <linearGradient id="hs-steel-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.28" stopColor="#d7dce6" />
          <stop offset="0.62" stopColor="#7f899d" />
          <stop offset="0.86" stopColor="#4a5367" />
          <stop offset="1" stopColor="#c9d0dc" />
        </linearGradient>
        <linearGradient id="hs-steel-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#aab3c4" />
          <stop offset="0.35" stopColor="#5d677c" />
          <stop offset="0.7" stopColor="#353d50" />
          <stop offset="1" stopColor="#8892a6" />
        </linearGradient>
        <linearGradient id="hs-ring-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f6fa" />
          <stop offset="0.45" stopColor="#9aa3b5" />
          <stop offset="1" stopColor="#3c4456" />
        </linearGradient>
        <linearGradient id="hs-ring-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c3cad7" />
          <stop offset="0.5" stopColor="#5f687c" />
          <stop offset="1" stopColor="#262d3d" />
        </linearGradient>
        <radialGradient id="hs-screw" cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#d9dee8" />
          <stop offset="0.75" stopColor="#6b7489" />
          <stop offset="1" stopColor="#2c3344" />
        </radialGradient>
        <radialGradient id="hs-floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={P.shadow} stopOpacity="0.55" />
          <stop offset="1" stopColor={P.shadow} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 바닥 그림자 */}
      <ellipse cx="300" cy="300" rx="290" ry="18" fill="url(#hs-floor)" />

      {/* 바탕에 떨어지는 가위 그림자. 날과 같이 돌도록 같은 클래스 안에 둔다. */}
      <g className="hs-p-blade-b" opacity="0.32">
        <g transform="translate(14 38) matrix(1 0 0 -1 0 320)">
          <ScissorHalf steel={P.shadow} ring={P.shadow} tang={false} flat />
        </g>
      </g>
      <g className="hs-p-blade-a" opacity="0.32">
        <g transform="translate(14 38)">
          <ScissorHalf steel={P.shadow} ring={P.shadow} tang flat />
        </g>
      </g>

      {/* 뒤쪽 반: 날은 아래, 손잡이 고리는 위 */}
      <g className="hs-p-blade-b">
        <g transform="matrix(1 0 0 -1 0 320)">
          <ScissorHalf steel="url(#hs-steel-b)" ring="url(#hs-ring-b)" tang={false} />
        </g>
      </g>

      {/* 앞쪽 반: 날은 위, 손잡이 고리는 아래, 손가락 걸이 있음 */}
      <g className="hs-p-blade-a">
        <ScissorHalf steel="url(#hs-steel-a)" ring="url(#hs-ring-a)" tang />
      </g>

      {/* 축 나사 */}
      <circle cx="260" cy="160" r="15" fill="url(#hs-screw)" stroke="#2c3344" strokeWidth="1.5" />
      <path d="M252 160 H268" stroke="#3a4255" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="255" cy="154" r="3" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

/** 가위 한 쪽. 날은 축 오른쪽(자르는 날이 y=160 쪽), 손잡이 고리는 축 왼쪽 약간 아래. */
function ScissorHalf({ steel, ring, tang, flat = false }: { steel: string; ring: string; tang: boolean; flat?: boolean }) {
  const edge = flat ? "none" : "#1c2333";
  return (
    <g stroke={edge} strokeOpacity="0.55">
      {/* 날 */}
      <path d="M244 138 C360 133 500 140 632 157 C635 159 634 162 630 162 L254 172 C240 168 236 148 244 138 Z" fill={steel} strokeWidth="1.2" strokeLinejoin="round" />
      {!flat && (
        <>
          {/* 자르는 날 쪽 밝은 면 */}
          <path d="M256 166 L626 158.5 L630 161.5 L256 171 Z" fill="#eef1f6" stroke="none" opacity="0.85" />
          {/* 등쪽 하이라이트 한 줄 */}
          <path d="M262 141.5 C380 137.5 500 143.5 616 156" fill="none" stroke="#ffffff" strokeOpacity="1" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
        </>
      )}
      {/* 축에서 고리로 가는 목 */}
      <path d="M266 150 C232 156 204 166 178 178 L170 196 C202 188 236 178 268 172 Z" fill={steel} strokeWidth="1.2" strokeLinejoin="round" />
      {/* 손잡이 고리 */}
      <g transform="rotate(-8 118 190)">
        <path d="M50 190 a68 42 0 1 0 136 0 a68 42 0 1 0 -136 0 Z M72 190 a46 24 0 1 0 92 0 a46 24 0 1 0 -92 0 Z" fill={ring} fillRule="evenodd" strokeWidth="1.4" />
        {!flat && (
          <>
            {/* 고리 안쪽 그늘과 바깥 하이라이트 */}
            <path d="M74 196 C88 214 148 216 162 194" fill="none" stroke="#1c2333" strokeOpacity="1" strokeWidth="4" strokeLinecap="round" opacity="0.35" />
            <path d="M66 176 C86 156 140 152 170 168" fill="none" stroke="#ffffff" strokeOpacity="1" strokeWidth="2.6" strokeLinecap="round" opacity="0.75" />
          </>
        )}
      </g>
      {tang && <path d="M78 224 C56 236 42 252 40 272 C40 280 48 282 52 276 C58 262 72 250 96 238 Z" fill={ring} strokeWidth="1.4" strokeLinejoin="round" />}
    </g>
  );
}

/* ── 첫 화면 마키 ─────────────────────────────────────── */

const MARQUEE_WORDS = SERVICES.map((s) => s.name);

/** 글자를 두 번 이어 붙이고 -50%까지 옮기면 끊김 없이 돈다. */
function Marquee({ dir, cls }: { dir: "l" | "r"; cls: string }) {
  const words = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div className="overflow-hidden leading-[0.95]">
      <div className={`hs-track ${cls}`} data-dir={dir} style={{ ...heavyF, fontSize: "clamp(84px, 16vw, 190px)" }}>
        {words.map((w, i) => (
          <span key={i} className="inline-flex items-center">
            <span className="px-[0.12em]">{w}</span>
            <Scissors aria-hidden strokeWidth={2.4} className="mx-[0.1em] inline-block h-[0.35em] w-[0.35em] flex-none" style={{ color: "var(--hs-accent)", WebkitTextStroke: 0, transition: `color ${COLOR_MS}ms ease` }} />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── 글자 모션 ─────────────────────────────────────────── */

/** 가격 글자가 자리마다 위에서 떨어진다. 보일 때 한 번. */
function DropText({ text, reduce }: { text: string; reduce: boolean }) {
  const chars = [...text];
  return (
    <motion.span
      className="inline-flex overflow-hidden align-bottom"
      aria-label={text}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: DROP_STAGGER } } }}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          variants={{ hidden: { y: "-110%", opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: DROP_MS / 1000, ease: EASE } } }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** 합계 금액. 숫자 자리마다 세로로 굴러서 바뀐다. 쉼표와 원은 그대로. */
function RollingWon({ value, reduce }: { value: number; reduce: boolean }) {
  const text = won(value);
  const chars = [...text];
  // 오른쪽에서 센 자리로 키를 매겨 자릿수가 늘 때 왼쪽에 새 자리가 생긴다.
  return (
    <span className="inline-flex overflow-hidden align-bottom tabular-nums" aria-label={text}>
      {chars.map((ch, i) => {
        const fromRight = chars.length - 1 - i;
        if (!/\d/.test(ch))
          return (
            <span key={`s${fromRight}`} aria-hidden>
              {ch}
            </span>
          );
        const d = Number(ch);
        return (
          <span key={`d${fromRight}`} aria-hidden className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
            <motion.span className="absolute left-0 top-0 flex flex-col items-center" initial={false} animate={{ y: `${-d}em` }} transition={reduce ? { duration: 0 } : { duration: ROLL_MS / 1000, ease: EASE }}>
              {DIGITS.map((n) => (
                <span key={n} className="block h-[1em] leading-none">
                  {n}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

/* ── 공통 ─────────────────────────────────────────────── */

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-[34px] leading-[1.05] md:text-[44px]" style={heavyF}>
      {children}
    </h2>
  );
}

/* ── 예약 시간표 ──────────────────────────────────────── */

function Timetable({
  today,
  dIdx,
  accent,
  need,
  nowMin,
  picked,
  setPicked,
  reduce,
  cart,
  total,
  designer,
  onDone,
}: {
  today: Date;
  dIdx: number;
  accent: string;
  need: number;
  nowMin: number;
  picked: Slot | null;
  setPicked: (s: Slot | null) => void;
  reduce: boolean;
  cart: ServiceId[];
  total: { price: number; min: number };
  designer: Designer;
  onDone: (d: { no: string; name: string; phone: string; slot: Slot; services: ServiceId[]; designer: Designer }) => void;
}) {
  const [hover, setHover] = useState<Slot | null>(null);
  const days = useMemo(() => Array.from({ length: DAYS }, (_, i) => daysAgo(today, -i)), [today]);

  /** 그 칸에서 시작하면 소요시간만큼 다 비어 있고 영업시간 안에 끝나는지 */
  const canStart = (day: number, slot: number) => {
    if (need === 0) return false;
    if (days[day].getDay() === 1) return false;
    if (slot + need > SLOTS) return false;
    if (day === 0 && OPEN_H * 60 + slot * 30 <= nowMin) return false;
    for (let k = 0; k < need; k++) if (taken(dIdx, day, slot + k)) return false;
    return true;
  };
  const inRange = (base: Slot | null, day: number, slot: number) => !!base && base.day === day && slot >= base.slot && slot < base.slot + need;
  const preview = hover && canStart(hover.day, hover.slot) ? hover : null;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!picked) return setErr("시간을 먼저 골라 주세요");
    if (name.trim().length < 2) return setErr("이름을 두 글자 이상 적어 주세요");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) return setErr("휴대폰 번호를 확인해 주세요");
    setErr(null);
    const d = days[picked.day];
    const no = `H${String(d.getFullYear()).slice(2)}${p2(d.getMonth() + 1)}${p2(d.getDate())}-${p2(picked.slot)}${dIdx}`;
    onDone({ no, name, phone, slot: picked, services: cart, designer });
  };

  const cell = "h-[30px] w-full rounded-[2px] text-[12px] font-bold leading-none";

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div>
        <div
          role="grid"
          aria-label="예약 가능 시간"
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: `44px repeat(${DAYS}, minmax(0, 1fr))` }}
          onMouseLeave={() => setHover(null)}
        >
          <div role="row" className="contents">
            <div role="columnheader" className="text-[12px]" style={{ color: C.muted }} />
            {days.map((d, i) => {
              const closed = d.getDay() === 1;
              return (
                <div key={i} role="columnheader" className="pb-1 text-center leading-tight">
                  <span className="block text-[12px]" style={{ color: closed ? "#9a9a9a" : C.muted }}>
                    {i === 0 ? "오늘" : DOW[d.getDay()]}
                  </span>
                  <span className="block text-[15px] font-extrabold tabular-nums" style={{ color: closed ? "#9a9a9a" : C.ink }}>
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
          {Array.from({ length: SLOTS }, (_, slot) => (
            <div key={slot} role="row" className="contents">
              <div role="rowheader" className="flex h-[30px] items-center text-[12px] tabular-nums" style={{ color: slot % 2 ? "transparent" : C.muted }}>
                {slotLabel(slot)}
              </div>
              {days.map((d, day) => {
                const closed = d.getDay() === 1;
                const past = day === 0 && OPEN_H * 60 + slot * 30 <= nowMin;
                const busy = taken(dIdx, day, slot);
                const sel = inRange(picked, day, slot);
                const pre = !sel && inRange(preview, day, slot);
                const ok = canStart(day, slot);
                const label = `${fmtKo(d)} ${slotLabel(slot)}${closed ? " 휴무" : busy ? " 예약 마감" : past ? " 지난 시간" : ok ? "" : " 선택 불가"}`;
                if (closed || busy || past) {
                  return (
                    <div key={day} role="gridcell" aria-label={label} className={`${cell} flex items-center justify-center`} style={{ background: closed ? "transparent" : "#dcdcdc", color: "#8a8a8a", border: closed ? `1px dashed ${C.line}` : "none" }}>
                      {closed ? (slot === 9 ? "휴무" : "") : busy ? "마감" : ""}
                    </div>
                  );
                }
                return (
                  <div key={day} role="gridcell">
                    <button
                      type="button"
                      aria-label={label}
                      aria-pressed={!!picked && picked.day === day && picked.slot === slot}
                      aria-disabled={!ok}
                      onMouseEnter={() => setHover({ day, slot })}
                      onFocus={() => setHover({ day, slot })}
                      onBlur={() => setHover(null)}
                      onClick={() => ok && setPicked({ day, slot })}
                      className={`${cell} transition-[background-color,transform] duration-150 ${focusRing} ${ok ? "" : "cursor-not-allowed"}`}
                      style={{
                        background: sel ? accent : pre ? `${accent}55` : C.paper,
                        color: sel ? "#fff" : C.ink,
                        outlineColor: accent,
                        border: sel || pre ? `1px solid ${accent}` : `1px solid ${C.line}`,
                        transform: sel && !reduce ? "scale(1.02)" : undefined,
                      }}
                    >
                      {sel && picked && slot === picked.slot ? slotLabel(slot) : ""}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px]" style={{ color: C.muted }}>
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-5 rounded-[2px] border" style={{ background: C.paper, borderColor: C.line }} aria-hidden /> 빈 칸
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-5 rounded-[2px]" style={{ background: "#dcdcdc" }} aria-hidden /> 마감
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-5 rounded-[2px]" style={{ background: accent }} aria-hidden /> 내 예약 {need ? `${need}칸, ${fmtMin(total.min)}` : ""}
          </li>
        </ul>
      </div>

      <form onSubmit={submit} noValidate className="rounded-[6px] border-2 p-5 lg:sticky lg:top-4" style={{ borderColor: C.ink, background: C.paper }}>
        <h3 className="text-[15px] font-bold" style={{ color: C.muted }}>
          고른 시간
        </h3>
        <p className="mt-1 min-h-[28px] text-[20px] font-extrabold" aria-live="polite">
          {picked ? `${fmtKo(days[picked.day])} ${slotLabel(picked.slot)}` : need ? "빈 칸을 눌러 주세요" : "시술을 먼저 담아 주세요"}
        </p>
        {picked && (
          <p className="text-[14px]" style={{ color: C.muted }}>
            {slotLabel(picked.slot)} 시작, {fmtMin(total.min)} 소요, {won(total.price)}
          </p>
        )}
        <label className="mt-4 block text-[14px] font-bold">
          이름
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`mt-1 w-full rounded-[4px] border-2 px-3 py-2 text-[16px] ${focusRing}`} style={{ borderColor: C.ink, outlineColor: accent }} />
        </label>
        <label className="mt-3 block text-[14px] font-bold">
          휴대폰
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={`mt-1 w-full rounded-[4px] border-2 px-3 py-2 text-[16px] ${focusRing}`} style={{ borderColor: C.ink, outlineColor: accent }} />
        </label>
        {err && (
          <p role="alert" className="mt-2 text-[14px] font-bold" style={{ color: C.error }}>
            {err}
          </p>
        )}
        <button type="submit" data-gtm-cta="hair-salon_reserve" className={`mt-4 w-full rounded-[4px] px-4 py-3 text-[16px] font-extrabold text-white transition-colors duration-200 ${focusRing}`} style={{ background: accent, outlineColor: C.ink }}>
          예약하기
        </button>
        <p className="mt-3 text-[13px] leading-[1.6]" style={{ color: C.muted }}>
          예약 변경과 취소는 하루 전까지 {KAKAO}로 해 주세요.
        </p>
      </form>
    </div>
  );
}

function DoneCard({ done, today, nowMin, onReset }: { done: { no: string; name: string; phone: string; slot: Slot; services: ServiceId[]; designer: Designer }; today: Date; nowMin: number; onReset: () => void }) {
  const d = daysAgo(today, -done.slot.day);
  const t = sum(done.services, done.designer);
  // 영업 중이면 1시간 안에, 아니면 다음 영업일 문 열고 확인 연락한다.
  const open = today.getDay() !== 1 && nowMin >= OPEN_H * 60 && nowMin < (CLOSE_H - 1) * 60;
  let next = daysAgo(today, -1);
  if (next.getDay() === 1) next = daysAgo(today, -2);
  const reply = open ? "오늘 1시간 안" : `${fmtKo(next)} ${OPEN_H}:00 이후`;
  const row = "grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 py-2 text-[15px]";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="mt-6 max-w-[640px] rounded-[6px] border-2 p-5 md:p-7" style={{ borderColor: done.designer.color, background: C.paper }} aria-live="polite">
      <p className="text-[14px] font-bold" style={{ color: done.designer.color }}>
        예약 접수 완료
      </p>
      <p className="mt-1 text-[36px] leading-none tabular-nums" style={heavyF}>
        {done.no}
      </p>
      <dl className="mt-4 divide-y border-y" style={{ borderColor: C.line }}>
        <div className={row} style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>일시</dt>
          <dd className="font-bold">
            {fmtKo(d)} {slotLabel(done.slot.slot)}
          </dd>
        </div>
        <div className={row} style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>디자이너</dt>
          <dd className="font-bold">
            {done.designer.role} {done.designer.name}
          </dd>
        </div>
        <div className={row} style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>시술</dt>
          <dd className="font-bold">
            {done.services.map((id) => SERVICE_BY_ID[id].name).join(" + ")}, {fmtMin(t.min)}, {won(t.price)}
          </dd>
        </div>
        <div className={row} style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>예약자</dt>
          <dd className="font-bold tabular-nums">
            {maskName(done.name)} {maskPhone(done.phone)}
          </dd>
        </div>
        <div className={row} style={{ borderColor: C.line }}>
          <dt style={{ color: C.muted }}>확인 연락</dt>
          <dd className="font-bold">
            {KAKAO}, {reply}
          </dd>
        </div>
      </dl>
      <ul className="mt-4 grid gap-1 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
        <li>예약 변경과 취소는 하루 전까지 {KAKAO}로 해 주세요. 당일은 전화 {TEL}로만 받아요.</li>
        <li>예약 시간보다 10분 이상 늦으시면 시술 시간이 줄거나 다음 시간으로 옮겨질 수 있어요.</li>
        <li>펌과 염색은 시술 전 상담 시간 10분이 더 걸려요.</li>
      </ul>
      <button type="button" onClick={onReset} className={`mt-5 rounded-[4px] border-2 px-4 py-2 text-[15px] font-extrabold ${focusRing}`} style={{ borderColor: C.ink, outlineColor: done.designer.color }}>
        다른 시간 보기
      </button>
    </motion.div>
  );
}

/* ── 스타일북 ─────────────────────────────────────────── */

function StyleBook({ designer, reduce, onCombo }: { designer: Designer; reduce: boolean; onCombo: (ids: ServiceId[]) => void }) {
  const [sel, setSel] = useState<number | null>(null);
  const style = sel === null ? null : STYLES[sel];
  const who = style ? DESIGNERS.filter((d) => style.combo.every((id) => d.can.includes(id))) : [];
  const total = style ? sum(style.combo, who.includes(designer) ? designer : who[0]) : null;
  const layoutT = reduce ? { duration: 0 } : { duration: 0.42, ease: EASE };

  return (
    <LayoutGroup id="hs-stylebook">
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
        <ul className="flex flex-wrap gap-x-5 gap-y-3" aria-label="스타일 이름">
          {STYLES.map((s, i) => {
            const on = i === sel;
            return (
              <li key={s.name} className="relative">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSel(on ? null : i)}
                  className={`relative inline-block rounded-[3px] px-1 text-[26px] leading-[1.1] md:text-[32px] ${focusRing}`}
                  style={{ ...bigF, color: on ? "transparent" : C.ink, outlineColor: designer.color }}
                >
                  {!on && (
                    <motion.span layoutId={`hs-style-${s.name}`} transition={layoutT} className="inline-block">
                      {s.name}
                    </motion.span>
                  )}
                  {on && <span aria-hidden className="inline-block" style={{ WebkitTextStroke: `1px ${C.line}`, color: "transparent" }}>{s.name}</span>}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="min-h-[220px] rounded-[6px] border-2 p-5 md:min-h-[300px] md:p-7" style={{ borderColor: style ? designer.color : C.line, background: style ? C.paper : "transparent", transition: `border-color ${COLOR_MS}ms ease` }} aria-live="polite">
          {style && total ? (
            <>
              <motion.p layoutId={`hs-style-${style.name}`} transition={layoutT} className="inline-block text-[52px] leading-[1] md:text-[76px]" style={{ ...bigF, color: designer.color }}>
                {style.name}
              </motion.p>
              <AnimatePresence mode="wait">
                <motion.div key={style.name} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }} transition={{ duration: 0.2, delay: reduce ? 0 : 0.25 }}>
                  <p className="mt-3 text-[16px] leading-[1.6]">{style.note}</p>
                  <p className="mt-4 text-[14px] font-bold" style={{ color: C.muted }}>
                    어울리는 시술 조합
                  </p>
                  <ul className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {style.combo.map((id, i) => (
                      <li key={id} className="flex items-center gap-1.5">
                        {i > 0 && <Plus size={14} aria-hidden />}
                        <span className="rounded-[3px] px-2 py-0.5 text-[20px] leading-none text-white" style={{ ...heavyF, background: designer.color }}>
                          {SERVICE_BY_ID[id].name}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[15px] font-bold tabular-nums">
                    {fmtMin(total.min)}, {won(total.price)}
                    <span className="ml-2 font-normal" style={{ color: C.muted }}>
                      {who.includes(designer) ? `${designer.role} ${designer.name} 기준` : `${who[0].role} ${who[0].name} 기준`}
                    </span>
                  </p>
                  <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
                    가능한 디자이너 {who.map((d) => d.name).join(", ")}
                  </p>
                  <button type="button" data-gtm-cta="hair-salon_style-add" onClick={() => onCombo(style.combo)} className={`mt-4 rounded-[4px] px-4 py-2.5 text-[15px] font-extrabold text-white ${focusRing}`} style={{ background: designer.color, outlineColor: C.ink }}>
                    이 조합으로 예약하기
                  </button>
                </motion.div>
              </AnimatePresence>
            </>
          ) : (
            <p className="text-[18px] font-bold" style={{ color: C.muted }}>
              스타일 이름을 눌러 보세요
            </p>
          )}
        </div>
      </div>
    </LayoutGroup>
  );
}

/* ── 오시는 길 ────────────────────────────────────────── */

/** 약도. 큰길 하나, 골목 하나, 역, 가게 위치만 그린다. */
function MapSketch({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 400 200" className="w-full rounded-[4px]" role="img" aria-label="약도. ㅇㅇ역 3번 출구에서 큰길을 따라 걷다 첫 골목 안 2층" style={{ background: C.soft }}>
      <path d="M0 130 H400" stroke="#ffffff" strokeWidth="26" />
      <path d="M250 130 V0" stroke="#ffffff" strokeWidth="16" />
      <path d="M0 130 H400" stroke="#cfcfcf" strokeWidth="1" strokeDasharray="6 6" />
      <rect x="60" y="138" width="44" height="22" rx="3" fill="#ffffff" stroke="#bdbdbd" />
      <text x="82" y="153" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.ink}>
        ㅇㅇ역
      </text>
      <text x="82" y="176" textAnchor="middle" fontSize="10" fill={C.muted}>
        3번 출구
      </text>
      <rect x="262" y="52" width="60" height="44" rx="3" fill={accent} style={{ transition: `fill ${COLOR_MS}ms ease` }} />
      <text x="292" y="71" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffff">
        곰파트너
      </text>
      <text x="292" y="86" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffff">
        헤어 2층
      </text>
      <path d="M104 148 H236 V96 H258" fill="none" stroke={C.ink} strokeWidth="2" strokeDasharray="4 4" />
      <text x="170" y="112" textAnchor="middle" fontSize="11" fill={C.muted}>
        도보 4분
      </text>
      <rect x="330" y="140" width="56" height="30" rx="3" fill="#ffffff" stroke="#bdbdbd" />
      <text x="358" y="159" textAnchor="middle" fontSize="10" fontWeight="700" fill={C.ink}>
        지하주차
      </text>
    </svg>
  );
}

function Hours({ todayDow, accent }: { todayDow: number; accent: string }) {
  const rows = [1, 2, 3, 4, 5, 6, 0];
  return (
    <div className="rounded-[6px] border-2 p-5" style={{ borderColor: C.ink, background: C.paper }}>
      <h3 className="text-[22px] leading-none" style={heavyF}>
        영업시간
      </h3>
      <ul className="mt-4 divide-y" style={{ borderColor: C.line }}>
        {rows.map((dow) => {
          const isToday = dow === todayDow;
          const closed = dow === 1;
          return (
            <li key={dow} className="flex items-center justify-between py-2.5 text-[16px]" style={{ borderColor: C.line, fontWeight: isToday ? 800 : 400, color: closed && !isToday ? C.muted : C.ink }} aria-current={isToday ? "date" : undefined}>
              <span className="inline-flex items-center gap-2">
                {isToday && <span className="rounded-[2px] px-1.5 py-0.5 text-[12px] font-extrabold text-white" style={{ background: accent, transition: `background-color ${COLOR_MS}ms ease` }}>오늘</span>}
                {DOW[dow]}요일
              </span>
              <span className="tabular-nums">{closed ? "정기휴무" : `${OPEN_H}:00 ~ ${CLOSE_H}:00`}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: C.muted }}>
        마지막 접수는 시술이 20:00 안에 끝나는 시간까지예요. 펌과 매직은 17:30이 마지막이에요.
      </p>
    </div>
  );
}
