"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useScroll, useTransform } from "framer-motion";
import { CalendarCheck, Car, Check, Clock, MapPin, Minus, Plus, TrainFront } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 미용실 홈페이지 샘플: 가상의 곰파트너 미용실. 디자이너 4명(원장 1, 디자이너 3).
   상호, 주소, 디자이너 이름은 모두 가상이다.

   국내 미용실 홈페이지와 네이버 예약 페이지의 공통 구성을 따른다.
   - 메뉴: 디자이너 소개, 시술 메뉴(가격표), 예약, 스타일북, 오시는 길
   - 가격표는 컷, 펌, 염색, 클리닉, 매직, 드라이 묶음. 기장 추가 요금 별도, 원장 지명 추가 요금.
   - 예약은 디자이너를 먼저 고르고 시술을 담은 뒤 날짜와 시간을 고른다. 소요시간만큼 칸이 잡힌다.
   - 관용 문구: 예약하기, 당일 예약 가능, 월요일 정기휴무, 주차 가능, 예약 변경은 하루 전까지.

   사진 출처: 첫 화면 Pexels 사진 7195805, 디자이너와 스타일북 사진은 AI 생성(Z-Image-Turbo)

   핵심 모션: 첫 화면은 매장 사진 한 장이다. 들어올 때 사진이 1.06배에서 천천히 제자리로 오고, 문장은 0.3초 늦게
   아래에서 올라온다(CSS keyframes). 스크롤하면 사진만 조금 느리게 움직인다. 합계 금액은 숫자 자리마다 굴러서 바뀐다.
   스타일북은 고른 이름이 오른쪽 판으로 옮겨 가며 커진다(layoutId). 동작 줄이기면 모두 바로 바뀐다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 디자이너 고르기: 가능한 시술, 시술 단가(지명 추가 요금)가 바뀐다.
   2. 시술 담기: 여러 개 담으면 소요시간과 금액이 합산되고 금액은 롤링 숫자로 바뀐다.
   3. 예약 시간표: 오늘부터 7일 x 30분 칸 격자. 소요시간만큼 연속 칸이 잡히고 찬 칸은 못 고른다. 이름과 휴대폰을 넣으면 접수 완료.
   4. 스타일북: 글자로 된 스타일 이름 목록. 누르면 큰 글자로 커지고 어울리는 시술 조합이 뜬다.
   5. 오시는 길과 영업시간: 월요일 휴무, 오늘 요일 진하게.

   포스터 첫 화면(hs-poster): 한 화면 높이의 매장 사진 위에 왼쪽 위 상호, 오른쪽 위 예약하기 버튼,
   아래쪽 문장 "커트, 펌, 염색 디자이너 지정 예약"와 영업시간 한 줄. 글꼴은 Pretendard 한 벌, 강조색은 남색 하나. */

const BRAND = "곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 2층";
const KAKAO = "카카오톡 채널 곰파트너";
const TEL = "02-000-0000";


/* 모션 상수 */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 합계 롤링 숫자 */
const ROLL_MS = 420;
/** 옅은 회색 바탕에 흰 판, 먹색 글자. 강조색은 차분한 남색 하나 */
const ACCENT = "#2b3a67";
const C = {
  bg: "#f7f7f5",
  paper: "#ffffff",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  soft: "#efefec",
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

/* 디자이너. extra는 지명 추가 요금 비율. */
interface Designer {
  id: string;
  name: string;
  role: string;
  extra: number;
  good: string;
  can: ServiceId[];
  /** 대표 스타일(Style.key). 카드에 작업 사진으로 보인다 */
  styles: string[];
}
const DESIGNERS: Designer[] = [
  { id: "kim", name: "김ㅎ늘", role: "원장", extra: 0.4, good: "매직, 손상모 펌", can: ["cut", "perm", "color", "clinic", "magic", "dry"], styles: ["volmagic", "ccurl"] },
  { id: "lee", name: "이ㅅ아", role: "수석 디자이너", extra: 0.15, good: "레이어드컷, 열펌", can: ["cut", "perm", "color", "clinic", "magic", "dry"], styles: ["layered", "build"] },
  { id: "park", name: "박ㅈ우", role: "디자이너", extra: 0, good: "염색, 발레아쥬", can: ["cut", "perm", "color", "clinic", "dry"], styles: ["balayage", "ashbrown"] },
  { id: "choi", name: "최ㅁ영", role: "디자이너", extra: 0, good: "남성 컷, 다운펌", can: ["cut", "perm", "color", "dry"], styles: ["down", "parting"] },
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
  /** 사진 파일 style-<key>.jpg */
  key: string;
  name: string;
  combo: ServiceId[];
  note: string;
}
const STYLES: Style[] = [
  { key: "hush", name: "허쉬컷", combo: ["cut", "dry"], note: "층을 많이 내고 끝을 가볍게 쳐요." },
  { key: "layered", name: "레이어드컷", combo: ["cut"], note: "얼굴 옆 층으로 자연스럽게 흘러요." },
  { key: "hippie", name: "히피펌", combo: ["cut", "perm"], note: "뿌리부터 잔잔하게 말아요. 두 달쯤 가요." },
  { key: "build", name: "빌드펌", combo: ["cut", "perm"], note: "볼륨을 아래로 쌓는 굵은 웨이브예요." },
  { key: "as", name: "애즈펌", combo: ["perm", "clinic"], note: "열펌이라 클리닉을 같이 해요." },
  { key: "glam", name: "글램펌", combo: ["cut", "perm", "clinic"], note: "긴 머리 웨이브. 기장 추가 요금이 있어요." },
  { key: "ccurl", name: "C컬 매직", combo: ["magic", "cut"], note: "끝만 안으로 말리는 매직이에요." },
  { key: "volmagic", name: "볼륨매직", combo: ["magic", "clinic"], note: "뿌리 볼륨을 살리고 열 손상은 클리닉으로 잡아요." },
  { key: "balayage", name: "발레아쥬", combo: ["color", "clinic"], note: "손으로 그려 넣는 그라데이션 염색이에요." },
  { key: "ashbrown", name: "애쉬브라운", combo: ["color"], note: "붉은 기 없는 갈색. 탈색 없이 가능해요." },
  { key: "parting", name: "가르마펌", combo: ["cut", "perm"], note: "남성 앞머리 방향을 잡아 줘요." },
  { key: "down", name: "다운펌", combo: ["cut", "perm"], note: "옆머리 뜨는 걸 눌러요. 30분이면 돼요." },
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

  const accent = ACCENT;
  const pageStyle = {
    "--hs-accent": accent,
    color: C.ink,
    backgroundColor: C.bg,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen overflow-x-clip" style={pageStyle}>
      <style>{`
        .hs-accent-bg { background: var(--hs-accent); }
        .hs-accent-text { color: var(--hs-accent); }
      `}</style>

      <Poster reduce={reduce} onCta={() => go("hs-reserve")} />

      <div>
      <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-4 md:px-6">
        <a href="#hs-hero" className={`inline-flex items-center gap-2 rounded-[4px] ${focusRing}`} style={{ outlineColor: C.ink }}>
          <SampleLogo />
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
        <button type="button" onClick={() => go("hs-reserve")} className={`hs-accent-bg flex-none rounded-[4px] px-4 py-2 text-[15px] font-bold text-white ${focusRing}`} style={{ outlineColor: C.ink }}>
          예약하기
        </button>
      </header>

      {/* 상호와 오늘 영업 */}
      <section id="hs-hero" aria-labelledby="hs-title" className="mx-auto max-w-[1200px] px-4 pt-4 md:px-6 md:pt-8">
        <h2 id="hs-title" className="text-[28px] font-bold leading-[1.2] tracking-[-0.02em] md:text-[36px]">
          {BRAND}
        </h2>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[16px] font-medium">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={17} aria-hidden />
            {openToday ? `오늘 ${OPEN_H}:00 ~ ${CLOSE_H}:00` : "오늘 정기휴무"}
          </span>
          <span style={{ color: C.muted }}>{openToday ? "당일 예약 가능" : "화요일부터 예약 가능"}</span>
        </p>
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
                className={`group relative flex flex-col items-start rounded-[6px] border p-4 text-left transition-[border-color,background-color] duration-200 ${focusRing}`}
                style={{ borderColor: on ? ACCENT : C.line, background: on ? C.paper : "transparent", outlineColor: ACCENT }}
              >
                <span className="relative block aspect-[4/5] w-full overflow-hidden rounded-[4px]" style={{ background: C.soft }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                  <img src={`${IMG}/designer-${d.id}.jpg`} alt={`${d.role} ${d.name}`} loading="lazy" width={600} height={800} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" style={{ objectPosition: "50% 20%" }} />
                  {on && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-[4px] px-2 py-1 text-[13px] font-bold text-white" style={{ background: ACCENT }}>
                      <Check size={14} aria-hidden /> 선택
                    </span>
                  )}
                </span>
                <span className="mt-4 text-[24px] font-bold leading-none" style={{ color: on ? ACCENT : C.ink }}>
                  {d.name}
                </span>
                <span className="mt-1 text-[15px] font-bold">{d.role}</span>
                <span className="mt-2 text-[14px]" style={{ color: C.muted }}>
                  잘하는 것 {d.good}
                </span>
                <span className="mt-3 grid w-full grid-cols-2 gap-1.5" aria-label="대표 스타일">
                  {d.styles.map((k) => {
                    const st = STYLES.find((x) => x.key === k)!;
                    return (
                      <span key={k} className="relative block aspect-square overflow-hidden rounded-[4px]">
                        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                        <img src={`${IMG}/style-${k}.jpg`} alt="" loading="lazy" width={300} height={300} className="h-full w-full object-cover" style={{ objectPosition: "50% 25%" }} />
                        <span className="absolute inset-x-0 bottom-0 px-2 py-1 text-[12px] font-bold text-white" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))" }}>
                          {st.name}
                        </span>
                      </span>
                    );
                  })}
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
                <span className="mt-3 text-[14px] font-bold" style={{ color: d.extra ? ACCENT : C.muted }}>
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
          <ul className="divide-y border-y" style={{ borderColor: C.line }}>
            {SERVICES.map((s) => {
              const ok = designer.can.includes(s.id);
              const on = cart.includes(s.id);
              return (
                <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 py-3 md:grid-cols-[120px_minmax(0,1fr)_auto_auto] md:gap-x-6" style={{ borderColor: C.line, opacity: ok ? 1 : 0.45 }}>
                  <span className="font-bold text-[26px] leading-none md:text-[30px]">
                    {s.name}
                  </span>
                  <span className="col-start-1 row-start-2 text-[14px] md:col-start-2 md:row-start-1" style={{ color: C.muted }}>
                    {ok ? `${s.detail}, ${fmtMin(s.min)}` : `${designer.name} 디자이너는 하지 않는 시술`}
                  </span>
                  <span className="col-start-2 row-start-1 text-right text-[22px] font-bold tabular-nums md:col-start-3 md:min-w-[120px]">
                    {won(priceOf(s, designer))}
                  </span>
                  <button
                    type="button"
                    disabled={!ok}
                    aria-pressed={on}
                    onClick={() => toggle(s.id)}
                    data-gtm-cta="hair-salon_add"
                    className={`col-start-2 row-start-2 inline-flex min-w-[76px] items-center justify-center gap-1 justify-self-end rounded-[4px] border px-3 py-1.5 text-[14px] font-bold transition-colors duration-150 disabled:cursor-not-allowed md:col-start-4 md:row-start-1 ${focusRing}`}
                    style={on ? { background: accent, borderColor: accent, color: "#fff", outlineColor: C.ink } : { background: "transparent", borderColor: C.line, color: C.ink, outlineColor: accent }}
                  >
                    {on ? <Minus size={14} aria-hidden /> : <Plus size={14} aria-hidden />}
                    {on ? "빼기" : "담기"}
                  </button>
                </li>
              );
            })}
          </ul>

          <aside aria-labelledby="hs-cart-title" className="rounded-[6px] border p-5 lg:sticky lg:top-4" style={{ borderColor: C.line, background: C.paper }}>
            <h3 id="hs-cart-title" className="text-[15px] font-bold" style={{ color: C.muted }}>
              담은 시술
            </h3>
            {cart.length === 0 ? (
              <p className="mt-2 text-[16px] font-bold">아직 없어요</p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-live="polite">
                {cart.map((id) => (
                  <li key={id} className="rounded-[3px] px-2 py-0.5 text-[15px] font-bold text-white" style={{ background: accent }}>
                    {SERVICE_BY_ID[id].name}
                  </li>
                ))}
              </ul>
            )}
            <dl className="mt-4 grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-2">
              <dt className="text-[15px] font-bold" style={{ color: C.muted }}>
                소요시간
              </dt>
              <dd className="text-right text-[20px] font-bold tabular-nums">{total.min ? fmtMin(total.min) : "0분"}</dd>
              <dt className="text-[15px] font-bold" style={{ color: C.muted }}>
                금액
              </dt>
              <dd className="font-bold text-right text-[34px] leading-none">
                <RollingWon value={total.price} reduce={reduce} />
              </dd>
            </dl>
            <p className="mt-2 text-right text-[13px]" style={{ color: C.muted }}>
              {designer.role} {designer.name} 기준
            </p>
            <button type="button" onClick={() => go("hs-reserve")} disabled={cart.length === 0} className={`hs-accent-bg mt-4 w-full rounded-[4px] px-4 py-3 text-[16px] font-bold text-white disabled:opacity-50 ${focusRing}`} style={{ outlineColor: C.ink }}>
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
          <Timetable today={today} dIdx={dIdx} accent={accent} need={need} nowMin={nowMin} picked={picked} setPicked={setPicked} cart={cart} total={total} designer={designer} onDone={setDone} />
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
          <div className="rounded-[6px] border p-5" style={{ borderColor: C.line, background: C.paper }}>
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
        <p>
          <SampleLogo />
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

const IMG = "/images/demo-hair-salon";

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // 스크롤하면 사진만 조금 느리게 내려간다
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  return (
    <section ref={ref} id="hs-poster" aria-labelledby="hs-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: "#141414", color: "#fff" }}>
      <style>{`
        @keyframes hs-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        .hs-rise { animation: hs-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }
        @media (prefers-reduced-motion: reduce) { .hs-rise { animation: none; } }
      `}</style>
      <motion.div
        className="absolute inset-0"
        style={{ y: photoY }}
        initial={reduce ? false : { scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: reduce ? 0 : 1.6, ease: EASE }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
        <img
          src={`${IMG}/hero.jpg`}
          srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
          sizes="100vw"
          alt="샴푸 의자 세 대와 시술 의자가 놓인 미용실 매장 안"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "55% 55%" }}
        />
      </motion.div>
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.4))" }} />

      {/* 상호와 핵심 행동 하나 */}
      <div className="relative z-10 flex items-center justify-between gap-3 px-4 pt-4 md:px-12 md:pt-7">
        <p>
          <SampleLogo light small />
        </p>
        <button
          type="button"
          data-gtm-cta="hair-salon_poster_cta"
          onClick={onCta}
          className={`inline-flex h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`}
          style={{ background: "#fff", color: C.ink, outlineColor: "#fff" }}
        >
          <CalendarCheck size={18} aria-hidden />
          예약하기
        </button>
      </div>

      {/* 문장 */}
      <div className={`relative z-10 mt-auto px-4 pb-14 md:px-12 md:pb-20 ${reduce ? "" : "hs-rise"}`}>
        <h1 id="hs-poster-title" className="text-[36px] font-bold leading-[1.2] tracking-[-0.03em] md:text-[clamp(40px,5vw,72px)]" style={{ wordBreak: "keep-all" }}>
          <span className="block">커트, 펌, 염색</span>
          <span className="block">디자이너 지정 예약</span>
        </h1>
        <p className="mt-4 text-[16px] md:text-[18px]" style={{ color: "rgba(255,255,255,0.85)" }}>
          화~일 {OPEN_H}:00 ~ {CLOSE_H}:00, 당일 예약 가능
        </p>
      </div>
    </section>
  );
}

/* ── 글자 모션 ─────────────────────────────────────────── */

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
    <h2 id={id} className="font-bold text-[34px] leading-[1.05] md:text-[44px]">
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
                  <span className="block text-[15px] font-bold tabular-nums" style={{ color: closed ? "#9a9a9a" : C.ink }}>
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
                      className={`${cell} transition-colors duration-150 ${focusRing} ${ok ? "" : "cursor-not-allowed"}`}
                      style={{
                        background: sel ? accent : pre ? `${accent}55` : C.paper,
                        color: sel ? "#fff" : C.ink,
                        outlineColor: accent,
                        border: sel || pre ? `1px solid ${accent}` : `1px solid ${C.line}`,
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

      <form onSubmit={submit} noValidate className="rounded-[6px] border p-5 lg:sticky lg:top-4" style={{ borderColor: C.line, background: C.paper }}>
        <h3 className="text-[15px] font-bold" style={{ color: C.muted }}>
          고른 시간
        </h3>
        <p className="mt-1 min-h-[28px] text-[20px] font-bold" aria-live="polite">
          {picked ? `${fmtKo(days[picked.day])} ${slotLabel(picked.slot)}` : need ? "빈 칸을 눌러 주세요" : "시술을 먼저 담아 주세요"}
        </p>
        {picked && (
          <p className="text-[14px]" style={{ color: C.muted }}>
            {slotLabel(picked.slot)} 시작, {fmtMin(total.min)} 소요, {won(total.price)}
          </p>
        )}
        <label className="mt-4 block text-[14px] font-bold">
          이름
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`mt-1 w-full rounded-[4px] border px-3 py-2 text-[16px] ${focusRing}`} style={{ borderColor: C.line, outlineColor: accent }} />
        </label>
        <label className="mt-3 block text-[14px] font-bold">
          휴대폰
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={`mt-1 w-full rounded-[4px] border px-3 py-2 text-[16px] ${focusRing}`} style={{ borderColor: C.line, outlineColor: accent }} />
        </label>
        {err && (
          <p role="alert" className="mt-2 text-[14px] font-bold" style={{ color: C.error }}>
            {err}
          </p>
        )}
        <button type="submit" data-gtm-cta="hair-salon_reserve" className={`mt-4 w-full rounded-[4px] px-4 py-3 text-[16px] font-semibold text-white transition-colors duration-200 ${focusRing}`} style={{ background: accent, outlineColor: C.ink }}>
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className="mt-6 max-w-[640px] rounded-[6px] border p-5 md:p-7" style={{ borderColor: ACCENT, background: C.paper }} aria-live="polite">
      <p className="text-[14px] font-bold" style={{ color: ACCENT }}>
        예약 접수 완료
      </p>
      <p className="font-bold mt-1 text-[36px] leading-none tabular-nums">
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
      <button type="button" onClick={onReset} className={`mt-5 rounded-[4px] border px-4 py-2 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.line, outlineColor: ACCENT }}>
        다른 시간 보기
      </button>
    </motion.div>
  );
}

/* ── 스타일북 ─────────────────────────────────────────── */

function StyleBook({ designer, reduce, onCombo }: { designer: Designer; reduce: boolean; onCombo: (ids: ServiceId[]) => void }) {
  const [sel, setSel] = useState<number | null>(0);
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
                  className={`relative inline-block rounded-[4px] px-1 text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] md:text-[28px] ${focusRing}`}
                  style={{ color: on ? "transparent" : C.ink, outlineColor: ACCENT }}
                >
                  {!on && (
                    <motion.span layoutId={`hs-style-${s.name}`} transition={layoutT} className="inline-block">
                      {s.name}
                    </motion.span>
                  )}
                  {on && <span aria-hidden className="inline-block" style={{ color: "#c8c8c8" }}>{s.name}</span>}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="min-h-[220px] rounded-[6px] border p-5 md:min-h-[300px] md:p-7" style={{ borderColor: C.line, background: style ? C.paper : "transparent" }} aria-live="polite">
          {style && total ? (
            <div className="grid gap-5 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={style.key} className="relative aspect-[4/5] overflow-hidden rounded-[4px]" style={{ background: C.soft }} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.25 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                  <img src={`${IMG}/style-${style.key}.jpg`} alt={`${style.name} 시술 뒤 모습`} width={600} height={800} className="h-full w-full object-cover" style={{ objectPosition: "50% 25%" }} />
                </motion.div>
              </AnimatePresence>
              <div className="min-w-0">
              <motion.p layoutId={`hs-style-${style.name}`} transition={layoutT} className="inline-block text-[40px] font-bold leading-[1.15] tracking-[-0.03em] md:text-[56px]" style={{ color: C.ink }}>
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
                        <span className="rounded-[4px] px-2 py-1 text-[17px] font-semibold leading-none text-white" style={{ background: ACCENT }}>
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
                  <ul className="mt-2 flex flex-wrap gap-2" aria-label="가능한 디자이너">
                    {who.map((d) => (
                      <li key={d.id} className="flex items-center gap-1.5 text-[14px]" style={{ color: C.body }}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                        <img src={`${IMG}/designer-${d.id}.jpg`} alt="" loading="lazy" width={28} height={28} className="h-7 w-7 rounded-full object-cover" style={{ objectPosition: "50% 20%" }} />
                        {d.name}
                      </li>
                    ))}
                  </ul>
                  <button type="button" data-gtm-cta="hair-salon_style-add" onClick={() => onCombo(style.combo)} className={`mt-4 rounded-[4px] px-4 py-2.5 text-[15px] font-bold text-white ${focusRing}`} style={{ background: ACCENT, outlineColor: C.ink }}>
                    이 조합으로 예약하기
                  </button>
                </motion.div>
              </AnimatePresence>
              </div>
            </div>
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
      <rect x="262" y="52" width="60" height="44" rx="3" fill={accent} />
      <text x="292" y="71" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffff">
        곰파트너
      </text>
      <text x="292" y="86" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffff">
        2층
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
    <div className="rounded-[6px] border p-5" style={{ borderColor: C.line, background: C.paper }}>
      <h3 className="font-bold text-[22px] leading-none">
        영업시간
      </h3>
      <ul className="mt-4 divide-y" style={{ borderColor: C.line }}>
        {rows.map((dow) => {
          const isToday = dow === todayDow;
          const closed = dow === 1;
          return (
            <li key={dow} className="flex items-center justify-between py-2.5 text-[16px]" style={{ borderColor: C.line, fontWeight: isToday ? 800 : 400, color: closed && !isToday ? C.muted : C.ink }} aria-current={isToday ? "date" : undefined}>
              <span className="inline-flex items-center gap-2">
                {isToday && <span className="rounded-[2px] px-1.5 py-0.5 text-[12px] font-bold text-white" style={{ background: accent }}>오늘</span>}
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

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className={small ? "h-6 w-6 shrink-0" : "h-7 w-7 shrink-0"} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold leading-none tracking-[-0.03em]`}>곰파트너</span>
        <span className="text-[12px] font-semibold leading-none opacity-75">미용실 샘플</span>
      </span>
    </span>
  );
}
