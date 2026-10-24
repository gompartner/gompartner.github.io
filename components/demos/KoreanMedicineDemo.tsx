"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { AlertCircle, CalendarCheck, Car, Check, Clock, MapPin, MessageCircle, Moon, Phone, X } from "lucide-react";
import { Noto_Serif_KR } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 한의원 홈페이지 샘플: 가상의 한의원 곰파트너. 동네 한의원(통증, 교통사고, 한약)이다.
   상호, 주소, 전화, 의료진 이름은 모두 가상이다.

   국내 한의원 사이트 공통 구성(참고): 메뉴는 한의원 소개, 의료진 소개, 진료 과목(통증 클리닉, 교통사고 클리닉, 한방 다이어트,
   보약), 진료 안내(진료 시간, 비급여 진료비 안내), 오시는 길, 온라인 예약. 첫 화면에는 진료 시간표(야간 진료, 토요일 진료,
   점심시간, 일요일 공휴일 휴진)와 전화번호, "교통사고 환자 자동차보험 접수 시 본인 부담금 없음" 띠가 거의 꼭 들어간다.
   진료 과목 설명은 침, 뜸, 부항, 약침, 추나, 한약 순서로 짧게 적고, 추나는 "건강보험 적용" 표시를 붙인다.
   의료법 광고 규칙에 따라 치료 효과 보장, 환자 후기, 치료 전후 사진, 할인 문구는 넣지 않는다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 아픈 부위 고르기: 사람 몸 실루엣(얼굴 없음)에서 머리, 목, 어깨, 허리, 손목, 무릎을 고르면
      흔한 증상과 주로 받는 진료(침, 추나, 약침, 한약)가 바뀌고, 고른 자리에 동그라미가 표시된다.
   2. 교통사고 진료: 자동차보험 접수번호를 넣으면 진료비 계산서의 본인 부담이 0원으로 바뀌고 자동차보험 도장이 찍힌다.
   3. 진료 시간표: 요일별 진료 시간 막대. 야간 진료(화, 목 밤 9시까지)는 강조색으로, 오늘 줄과 지금 진료 중 여부를 표시한다.
   4. 예약: 진료 구분, 날짜, 시간, 이름, 휴대폰. 완료하면 예약 번호, 담당 창구, 확정 문자 보낼 날을 보여 준다.

   첫 화면(km-poster): 한지 창, 약재 서랍장, 탁자 위 청자 그릇 사진 한 장이 화면을 채운다. 사진 출처: AI 생성(Z-Image-Turbo, Apache 2.0).
   왼쪽 위 상호, 오른쪽 위 예약하기 버튼, 아래쪽에 큰 문장 "교통사고 치료, 본인 부담금 없음"와 야간 진료 한 줄.
   핵심 모션: 들어오면 사진이 1.6초 동안 천천히 다가오고(1.06배에서 1배), 문장은 0.3초 늦게 아래에서 올라온다(CSS keyframes, JS 없이도 보인다).
   스크롤하면 사진만 조금 느리게 움직인다. 본문에서 남긴 움직임은 접수번호를 넣으면 찍히는 자동차보험 도장 하나다.
   동작 줄이기면 전부 멈춘다. */

const serifF = { fontFamily: `${Noto_Serif_KR.style.fontFamily}, serif` } as const;

const IMG = "/images/demo-korean-medicine";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className={small ? "h-6 w-6 shrink-0" : "h-7 w-7 shrink-0"} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold tracking-[-0.03em]`}>곰파트너</span>
        <span className="text-[12px] font-semibold opacity-75">한의원 샘플</span>
      </span>
    </span>
  );
}

const C = {
  paper: "#ffffff",
  soft: "#f7f7f5",
  bar: "#ececea",
  ink: "#111111",
  inkSoft: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  field: "#d4d4d4",
  red: "#8f3b2b",
  error: "#9f1d1d",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 첫 화면 사진이 다가오는 시간 */
const PHOTO_IN = 1.6;
/** 패널 전환 */
const DUR = 0.3;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- 아픈 부위와 진료 ---------- */

type Care = "침" | "추나" | "약침" | "한약";
const CARES: { name: Care; desc: string; pay: string }[] = [
  { name: "침", desc: "아픈 자리와 경혈에 침을 놓아요.", pay: "건강보험" },
  { name: "추나", desc: "손으로 틀어진 관절과 근육을 바로잡아요.", pay: "건강보험(연 20회)" },
  { name: "약침", desc: "한약재에서 뽑은 약액을 경혈에 넣어요.", pay: "비급여" },
  { name: "한약", desc: "진찰 뒤 증상과 체질에 맞춰 달여요.", pay: "비급여" },
];

type PartId = "head" | "neck" | "shoulder" | "waist" | "wrist" | "knee";
const PARTS: { id: PartId; label: string; x: number; y: number; signs: string[]; care: Care[] }[] = [
  { id: "head", label: "머리", x: 120, y: 48, signs: ["두통이 자주 와요", "어지럽고 잠을 설쳐요"], care: ["침", "한약"] },
  { id: "neck", label: "목", x: 120, y: 98, signs: ["고개를 돌리기 힘들어요", "자고 나면 목에 담이 와요"], care: ["침", "추나", "약침"] },
  { id: "shoulder", label: "어깨", x: 168, y: 122, signs: ["팔이 위로 안 올라가요", "밤에 어깨가 쑤셔요"], care: ["침", "약침", "추나"] },
  { id: "waist", label: "허리", x: 120, y: 232, signs: ["오래 앉으면 허리가 뻐근해요", "다리가 저려요"], care: ["추나", "침", "약침"] },
  { id: "wrist", label: "손목", x: 204, y: 290, signs: ["손목이 시큰거려요", "손가락이 저려요"], care: ["침", "약침"] },
  { id: "knee", label: "무릎", x: 152, y: 382, signs: ["계단 내려갈 때 아파요", "무릎이 붓고 뻣뻣해요"], care: ["침", "약침", "한약"] },
];

const BODY_D =
  "M106 86 L134 86 L137 104 C160 108 184 114 192 132 C199 154 200 196 202 226 C204 254 208 282 214 300 L198 306 C190 284 184 254 180 226 L174 168 C172 196 170 222 172 250 C174 272 178 292 178 314 L170 470 L136 470 L126 326 L114 326 L104 470 L70 470 L62 314 C62 292 66 272 68 250 C70 222 68 196 66 168 L60 226 C56 254 50 284 42 306 L26 300 C32 282 36 254 38 226 C40 196 41 154 48 132 C56 114 80 108 103 104 Z";

/* ---------- 비급여 진료비 ---------- */

const FEES: { item: string; unit: string; price: string }[] = [
  { item: "약침", unit: "1회", price: "10,000원 ~ 20,000원" },
  { item: "봉약침", unit: "1회", price: "20,000원" },
  { item: "첩약(한약)", unit: "15일분", price: "250,000원 ~ 350,000원" },
  { item: "공진단", unit: "10환", price: "300,000원" },
];

/* ---------- 교통사고 진료 ---------- */

const CAR_ROWS: { item: string; fee: number }[] = [
  { item: "진찰료", fee: 14300 },
  { item: "침, 부항", fee: 12600 },
  { item: "약침", fee: 20000 },
  { item: "추나", fee: 31400 },
  { item: "한방 물리요법", fee: 5600 },
];
const CAR_STEPS = ["보험사에 사고 접수", "문자로 접수번호 받기", "한의원에 접수번호 알려 주기", "진료"];
const validAccident = (s: string) => s.replace(/\D/g, "").length >= 8;

/* ---------- 진료 시간 ---------- */

/** 요일별 [시작, 끝] 분 단위. 일요일과 공휴일은 휴진 */
const HOURS: Record<number, [number, number] | null> = {
  0: null,
  1: [570, 1140],
  2: [570, 1260],
  3: [570, 1140],
  4: [570, 1260],
  5: [570, 1140],
  6: [570, 840],
};
const LUNCH: [number, number] = [780, 840];
const NIGHT_FROM = 1140;
/** 시간표 막대 눈금: 9시 ~ 21시 */
const AXIS_FROM = 540;
const AXIS_TO = 1260;
const hm = (m: number) => `${p2(Math.floor(m / 60))}:${p2(m % 60)}`;
const hasLunch = (dow: number) => dow >= 1 && dow <= 5;

type Status = "진료 중" | "점심시간" | "진료 전" | "진료 마감" | "휴진";
function statusAt(dow: number, min: number): Status {
  const h = HOURS[dow];
  if (!h) return "휴진";
  if (min < h[0]) return "진료 전";
  if (min >= h[1]) return "진료 마감";
  if (hasLunch(dow) && min >= LUNCH[0] && min < LUNCH[1]) return "점심시간";
  return "진료 중";
}

/* ---------- 예약 ---------- */

type Kind = "일반 진료" | "교통사고" | "한약 상담";
const KINDS: Kind[] = ["일반 진료", "교통사고", "한약 상담"];
const RESERVE_DAYS = 8;

function slotsFor(dow: number): number[] {
  const h = HOURS[dow];
  if (!h) return [];
  const out: number[] = [];
  // 접수 마감은 진료 끝나기 30분 전
  for (let m = h[0]; m <= h[1] - 30; m += 30) {
    if (hasLunch(dow) && m >= LUNCH[0] && m < LUNCH[1]) continue;
    out.push(m);
  }
  return out;
}

/** 이미 찬 시간. 실제로는 예약 시트에서 읽는다 */
function isTaken(dayIdx: number, m: number) {
  let h = (dayIdx + 11) * 2654435761 + (m + 7) * 40503;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 100;
  return h < 30;
}

const nextOpenDay = (d: Date) => {
  let n = d;
  while (!HOURS[n.getDay()]) n = daysAgo(n, -1);
  return n;
};

/** 브라우저에서만 지금 시각(분)을 읽는다. 서버 렌더와 첫 화면은 null */
function useNowMin(): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const read = () => {
      const d = new Date();
      setNow(d.getHours() * 60 + d.getMinutes());
    };
    const frame = requestAnimationFrame(read);
    const id = window.setInterval(read, 60000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(id);
    };
  }, []);
  return now;
}

export function KoreanMedicineDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const nowMin = useNowMin();

  const [kind, setKind] = useState<Kind>("일반 진료");
  const [accident, setAccident] = useState("");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("km-reserve")} />

      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:px-6">
        <h2 className="leading-none">
          <SampleLogo />
        </h2>
        <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center">
          {[
            ["km-body", "진료 과목"],
            ["km-car", "교통사고"],
            ["km-hours", "진료 시간"],
            ["km-reserve", "온라인 예약"],
            ["km-visit", "오시는 길"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.red }}>
              {label}
            </button>
          ))}
        </nav>
        <a href={`tel:${TEL.replace(/-/g, "")}`} className={`hidden items-center gap-1.5 text-[17px] font-bold md:inline-flex ${focusRing}`} style={{ outlineColor: C.red }}>
          <Phone size={18} aria-hidden />
          {TEL}
        </a>
      </header>

      {/* 교통사고 띠 */}
      <div className="border-y" style={{ borderColor: C.line, background: C.soft }}>
        <p className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-[16px] md:px-6">
          <Car size={20} aria-hidden style={{ color: C.red }} />
          <strong>교통사고 환자</strong>
          <span>자동차보험 접수번호만 있으면 본인 부담금 없이 진료해요</span>
          <button type="button" onClick={() => go("km-car")} className={`font-bold underline underline-offset-4 ${focusRing}`} style={{ color: C.red, outlineColor: C.red }}>
            자세히 보기
          </button>
        </p>
      </div>

      <BodySection reduce={reduce} onCar={() => go("km-car")} />
      <CarSection reduce={reduce} value={accident} setValue={setAccident} onReserve={() => { setKind("교통사고"); go("km-reserve"); }} />
      <HoursSection today={today} nowMin={nowMin} />
      <ReserveSection reduce={reduce} today={today} nowMin={nowMin} kind={kind} setKind={setKind} accident={accident} />
      <VisitSection />

      <footer className="mt-20 px-4 py-10 md:px-6" style={{ background: "#141414", color: "#ffffff" }}>
        <div className="mx-auto max-w-[1200px]">
          <p>
            <SampleLogo light />
          </p>
          <p className="mt-2 text-[15px] leading-[1.7]" style={{ color: "#bdbdbd" }}>
            {ADDRESS}, 전화 {TEL}
            <br />
            평일 09:30 ~ 19:00, 화, 목 21:00까지, 토 09:30 ~ 14:00, 일요일 공휴일 휴진
          </p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

/* ---------- 상호 낙관 ---------- */

function Seal({ size }: { size: number }) {
  return (
    <span aria-hidden className="inline-flex shrink-0 items-center justify-center rounded-[4px] font-bold leading-none" style={{ width: size, height: size, background: C.red, color: "#ffffff", fontSize: size * 0.56 }}>
      곰
    </span>
  );
}

/* ---------- 첫 화면 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // 스크롤하면 사진만 조금 느리게 내려간다
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  return (
    <section id="km-poster" ref={ref} aria-labelledby="km-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: "#2a2622", color: "#ffffff" }}>
      <style>{`@keyframes km-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.km-rise{animation:km-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both}@media (prefers-reduced-motion: reduce){.km-rise{animation:none}}`}</style>
      <motion.div className="absolute inset-x-0 top-[-10%] h-[110%]" style={{ y: photoY }}>
        <motion.div className="h-full w-full" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : PHOTO_IN, ease: EASE }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="한지 창 옆 약재 서랍장 앞 탁자에 대추와 감초를 담은 청자 그릇 두 개가 놓인 진료실"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "52% 62%" }}
          />
        </motion.div>
      </motion.div>
      {/* 글자 대비를 위한 막. 위는 상호 자리(밝은 창), 아래는 문장 자리 */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.74), rgba(0,0,0,0.34) 50%, rgba(0,0,0,0.12) 72%, rgba(0,0,0,0.5))" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.42), rgba(0,0,0,0) 58%)" }} />

      <div className="relative z-[1] flex items-center justify-between gap-3 px-4 pt-4 md:px-12 md:pt-7">
        <p className="leading-none">
          <SampleLogo light small />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta="korean-medicine_poster_cta"
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`}
          style={{ background: C.red, color: "#ffffff", outlineColor: "#ffffff" }}
        >
          <CalendarCheck size={17} aria-hidden />
          예약하기
        </button>
      </div>

      <div className={`relative z-[1] mt-auto px-4 pb-14 md:px-12 md:pb-20 ${reduce ? "" : "km-rise"}`}>
        <h1
          id="km-poster-title"
          className="max-w-[12em] text-[36px] font-bold md:text-[clamp(40px,5vw,72px)]"
          style={{ ...serifF, letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}
        >
          교통사고 치료,
          <br />
          본인 부담금 없음
        </h1>
        <p className="mt-4 inline-flex items-center gap-2 text-[16px] md:mt-6 md:text-[18px]" style={{ color: "rgba(255,255,255,0.88)" }}>
          <Moon size={18} aria-hidden />
          화, 목 밤 9시까지 진료
        </p>
      </div>
    </section>
  );
}

/* ---------- 공통 제목 ---------- */

function SectionTitle({ id, title, aside }: { id: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-3" style={{ borderColor: C.line }}>
      <h2 id={id} className="text-[28px] font-bold leading-tight tracking-[-0.02em] md:text-[34px]" style={{ ...serifF, color: C.ink }}>
        {title}
      </h2>
      {aside}
    </div>
  );
}

/* ---------- 1. 아픈 부위 고르기 ---------- */

function BodySection({ reduce, onCar }: { reduce: boolean; onCar: () => void }) {
  const [part, setPart] = useState<PartId>("waist");
  const cur = PARTS.find((x) => x.id === part) ?? PARTS[0];

  return (
    <section id="km-body" aria-labelledby="km-body-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
      <SectionTitle id="km-body-title" title="어디가 아프세요" />

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-10">
        {/* 몸 실루엣 */}
        <div className="relative mx-auto w-full max-w-[230px] md:max-w-[300px]">
          <svg viewBox="0 0 240 480" className="h-auto w-full" role="img" aria-label={`사람 몸 그림, ${cur.label} 표시`}>
            <defs>
              <linearGradient id="km-body-wash" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f2f2f0" />
                <stop offset="1" stopColor="#e6e6e3" />
              </linearGradient>
            </defs>
            <ellipse cx="120" cy="472" rx="70" ry="7" fill="#e5e5e5" />
            <ellipse cx="120" cy="50" rx="28" ry="34" fill="url(#km-body-wash)" stroke="#9a9a9a" strokeWidth="1.5" />
            <path d={BODY_D} fill="url(#km-body-wash)" stroke="#9a9a9a" strokeWidth="1.5" strokeLinejoin="round" />
            {PARTS.map((x) => (
              <circle key={x.id} cx={x.x} cy={x.y} r="5" fill={x.id === part ? C.red : C.muted} opacity={x.id === part ? 1 : 0.55} />
            ))}
            <g transform={`translate(${cur.x} ${cur.y})`}>
              <motion.circle
                key={part}
                r="20"
                fill="none"
                stroke={C.red}
                strokeWidth="2.5"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
              />
            </g>
          </svg>
          {/* 그림 위에서 바로 누르는 자리. 키보드는 아래 부위 버튼을 쓴다 */}
          {PARTS.map((x) => (
            <button
              key={x.id}
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => setPart(x.id)}
              className="absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: `${(x.x / 240) * 100}%`, top: `${(x.y / 480) * 100}%` }}
            />
          ))}
        </div>

        <div>
          <div role="radiogroup" aria-label="아픈 부위" className="flex flex-wrap gap-2">
            {PARTS.map((x) => {
              const on = x.id === part;
              return (
                <button
                  key={x.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setPart(x.id)}
                  className={`min-h-11 rounded-full border px-5 text-[17px] font-semibold transition-colors ${focusRing}`}
                  style={{ borderColor: on ? C.red : C.field, background: on ? C.red : C.paper, color: on ? "#ffffff" : C.ink, outlineColor: C.ink }}
                >
                  {x.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={part}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
              className="mt-6"
              aria-live="polite"
            >
              <p className="text-[15px] font-bold" style={{ color: C.muted }}>
                {cur.label}, 이럴 때 오세요
              </p>
              <ul className="mt-2 space-y-1 text-[19px] font-medium leading-snug">
                {cur.signs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>

              <p className="mt-6 text-[15px] font-bold" style={{ color: C.muted }}>
                주로 받는 진료
              </p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {CARES.map((c) => {
                  const on = cur.care.includes(c.name);
                  return (
                    <li
                      key={c.name}
                      className="rounded-[6px] border p-4"
                      style={{ borderColor: on ? C.red : C.line, background: on ? C.paper : C.soft, opacity: on ? 1 : 0.75 }}
                    >
                      <p className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[18px] font-bold">
                          {on && <Check size={18} aria-hidden style={{ color: C.red }} />}
                          {c.name}
                          <span className="sr-only">{on ? "(이 부위에 주로 받는 진료)" : ""}</span>
                        </span>
                        <span className="text-[13px] font-bold" style={{ color: c.pay === "비급여" ? C.muted : C.red }}>
                          {c.pay}
                        </span>
                      </p>
                      <p className="mt-1 text-[15px]" style={{ color: C.inkSoft }}>
                        {c.desc}
                      </p>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-[15px]" style={{ color: C.inkSoft }}>
                사고 뒤에 아프기 시작했다면{" "}
                <button type="button" onClick={onCar} className={`font-bold underline underline-offset-4 ${focusRing}`} style={{ color: C.red, outlineColor: C.red }}>
                  교통사고 진료
                </button>
                로 받으세요.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 비급여 진료비 안내 */}
      <div className="mt-12">
        <h3 className="text-[20px] font-bold">
          비급여 진료비 안내
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] border-collapse text-left text-[16px]">
            <thead>
              <tr className="border-b" style={{ borderColor: C.field }}>
                <th scope="col" className="py-2 pr-3 font-bold">
                  항목
                </th>
                <th scope="col" className="py-2 pr-3 font-bold">
                  단위
                </th>
                <th scope="col" className="py-2 text-right font-bold">
                  금액
                </th>
              </tr>
            </thead>
            <tbody>
              {FEES.map((f) => (
                <tr key={f.item} className="border-b" style={{ borderColor: C.line }}>
                  <td className="py-2.5 pr-3">{f.item}</td>
                  <td className="py-2.5 pr-3" style={{ color: C.muted }}>
                    {f.unit}
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{f.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
          진찰료, 침, 뜸, 부항, 추나는 건강보험이 적용돼요. 교통사고 진료는 위 항목도 자동차보험으로 처리해요.
        </p>
      </div>
    </section>
  );
}

/* ---------- 2. 교통사고 진료 ---------- */

function CarSection({ reduce, value, setValue, onReserve }: { reduce: boolean; value: string; setValue: (v: string) => void; onReserve: () => void }) {
  const ok = validAccident(value);
  const total = CAR_ROWS.reduce((a, r) => a + r.fee, 0);

  return (
    <section id="km-car" aria-labelledby="km-car-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionTitle id="km-car-title" title="교통사고 진료" />

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <div>
          <ol className="space-y-0">
            {CAR_STEPS.map((s, i) => (
              <li key={s} className="flex items-start gap-4 border-b py-4" style={{ borderColor: C.line }}>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[16px] font-semibold tabular-nums" style={{ borderColor: C.field, color: C.inkSoft }}>
                  {i + 1}
                </span>
                <span className="pt-1 text-[18px] font-semibold">
                  {s}
                </span>
              </li>
            ))}
          </ol>
          <ul className="mt-5 space-y-2 text-[16px] leading-relaxed" style={{ color: C.inkSoft }}>
            <li>가해, 피해 상관없이 접수번호가 있으면 돼요.</li>
            <li>침, 약침, 추나, 한약까지 자동차보험으로 진료해요.</li>
            <li>사고 당일에도 진료해요. 화, 목은 밤 9시까지예요.</li>
          </ul>
        </div>

        {/* 진료비 계산서 */}
        <div className="relative rounded-[8px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.soft }}>
          <label htmlFor="km-accident" className="block text-[16px] font-bold">
            자동차보험 접수번호
          </label>
          <input
            id="km-accident"
            inputMode="numeric"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^\d-]/g, "").slice(0, 16))}
            placeholder="예: 2610-1234567"
            className={`mt-2 h-12 w-full rounded-[4px] border bg-white px-3 text-[18px] tabular-nums ${focusRing}`}
            style={{ borderColor: C.field, outlineColor: C.red }}
          />

          <table className="mt-5 w-full border-collapse text-[16px]">
            <caption className="sr-only">교통사고 진료비 예시</caption>
            <thead>
              <tr className="border-b" style={{ borderColor: C.field }}>
                <th scope="col" className="py-2 text-left font-bold">
                  항목
                </th>
                <th scope="col" className="py-2 text-right font-bold">
                  진료비
                </th>
                <th scope="col" className="py-2 text-right font-bold">
                  본인 부담
                </th>
              </tr>
            </thead>
            <tbody>
              {CAR_ROWS.map((r) => (
                <tr key={r.item} className="border-b" style={{ borderColor: C.line }}>
                  <td className="py-2">{r.item}</td>
                  <td className="py-2 text-right tabular-nums" style={{ color: C.muted }}>
                    {won(r.fee)}
                  </td>
                  <td className="py-2 text-right font-bold tabular-nums">{ok ? "0원" : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 flex items-baseline justify-between gap-3">
            <span className="text-[16px] font-bold">본인 부담 합계</span>
            <span className="text-[30px] font-bold tabular-nums" style={{ color: ok ? C.red : C.muted }} aria-live="polite">
              {ok ? "0원" : won(total)}
            </span>
          </p>
          <p className="mt-1 text-right text-[14px]" style={{ color: C.muted }}>
            {ok ? "진료비는 보험사에서 한의원으로 바로 내요" : "접수번호 확인 전"}
          </p>

          <AnimatePresence>
            {ok && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-7 md:-right-4"
                initial={reduce ? false : { scale: 1.4, opacity: 0, rotate: -14 }}
                animate={{ scale: 1, opacity: 1, rotate: -8 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.28, ease: [0.5, 0, 0.75, 0] }}
              >
                <span className="inline-flex h-[76px] w-[76px] flex-col items-center justify-center rounded-[6px] border text-[15px] font-bold leading-tight" style={{ borderColor: C.red, color: C.red, background: "rgba(255,255,255,0.92)" }}>
                  자동차
                  <br />
                  보험
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={onReserve}
            data-gtm-cta="korean-medicine_car_reserve"
            className={`mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[4px] text-[17px] font-bold ${focusRing}`}
            style={{ background: C.ink, color: "#ffffff", outlineColor: C.red }}
          >
            <Car size={19} aria-hidden />
            교통사고 진료 예약
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- 3. 진료 시간표 ---------- */

function HoursSection({ today, nowMin }: { today: Date; nowMin: number | null }) {
  const dowToday = today.getDay();
  const order = [1, 2, 3, 4, 5, 6, 0];
  const span = AXIS_TO - AXIS_FROM;
  const pct = (m: number) => `${((m - AXIS_FROM) / span) * 100}%`;
  const status = nowMin == null ? null : statusAt(dowToday, nowMin);

  return (
    <section id="km-hours" aria-labelledby="km-hours-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionTitle
        id="km-hours-title"
        title="진료 시간"
        aside={
          status && (
            <p className="inline-flex items-center gap-2 text-[16px] font-bold" style={{ color: status === "진료 중" ? C.red : C.inkSoft }}>
              <Clock size={18} aria-hidden />
              지금 {status}
            </p>
          )
        }
      />

      <div className="mt-6">
        {/* 눈금 */}
        <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 md:grid-cols-[72px_minmax(0,1fr)_200px]">
          <span />
          <div className="relative h-5 text-[12px] tabular-nums" style={{ color: C.muted }} aria-hidden>
            {[540, 720, 900, 1080, 1260].map((m) => (
              <span key={m} className="absolute -translate-x-1/2" style={{ left: pct(m) }}>
                {m / 60}시
              </span>
            ))}
          </div>
          <span className="hidden md:block" />
        </div>

        <ul>
          {order.map((d) => {
            const h = HOURS[d];
            const isToday = d === dowToday;
            const night = h && h[1] > NIGHT_FROM;
            return (
              <li
                key={d}
                className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-3 border-b py-3 md:grid-cols-[72px_minmax(0,1fr)_200px]"
                style={{ borderColor: C.line, background: isToday ? C.soft : undefined }}
              >
                <span className="pl-1 text-[17px] font-semibold">
                  {DOW[d]}
                  {isToday && (
                    <span className="ml-1 align-middle text-[12px]" style={{ color: C.red }}>
                      오늘
                    </span>
                  )}
                </span>
                <div className="relative h-7 rounded-[2px]" style={{ background: C.soft }} aria-hidden>
                  {h && (
                    <>
                      <span className="absolute inset-y-0 rounded-[2px]" style={{ left: pct(h[0]), width: `calc(${pct(Math.min(h[1], NIGHT_FROM))} - ${pct(h[0])})`, background: "#3a3a3a" }} />
                      {night && (
                        <span className="absolute inset-y-0 inline-flex items-center justify-center rounded-[2px]" style={{ left: pct(NIGHT_FROM), width: `calc(${pct(h[1])} - ${pct(NIGHT_FROM)})`, background: C.red, color: "#ffffff" }}>
                          <Moon size={14} />
                        </span>
                      )}
                      {hasLunch(d) && (
                        <span
                          className="absolute inset-y-0"
                          style={{
                            left: pct(LUNCH[0]),
                            width: `calc(${pct(LUNCH[1])} - ${pct(LUNCH[0])})`,
                            background: `repeating-linear-gradient(135deg, ${C.bar} 0 4px, #c4c4c0 4px 6px)`,
                          }}
                        />
                      )}
                    </>
                  )}
                  {isToday && nowMin != null && nowMin >= AXIS_FROM && nowMin <= AXIS_TO && (
                    <span className="absolute -inset-y-1 w-[3px] rounded-full" style={{ left: pct(nowMin), background: C.red }} />
                  )}
                </div>
                <span className="col-span-2 pl-1 text-[15px] tabular-nums md:col-span-1 md:pl-0 md:text-[16px]">
                  {h ? (
                    <>
                      {hm(h[0])} ~ {hm(h[1])}
                      {night && (
                        <strong className="ml-2" style={{ color: C.red }}>
                          야간 진료
                        </strong>
                      )}
                    </>
                  ) : (
                    <span style={{ color: C.muted }}>휴진</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[15px]" style={{ color: C.inkSoft }}>
          <span>점심시간 13:00 ~ 14:00 (토요일은 점심시간 없이 진료)</span>
          <span>일요일, 공휴일 휴진</span>
          <span>접수 마감은 진료 끝나기 30분 전</span>
        </p>
      </div>
    </section>
  );
}

/* ---------- 4. 예약 ---------- */

type Done = { no: string; when: string; kind: Kind; name: string; phone: string; reply: string };

function ReserveSection({
  reduce,
  today,
  nowMin,
  kind,
  setKind,
  accident,
}: {
  reduce: boolean;
  today: Date;
  nowMin: number | null;
  kind: Kind;
  setKind: (k: Kind) => void;
  accident: string;
}) {
  const days = useMemo(() => Array.from({ length: RESERVE_DAYS }, (_, i) => daysAgo(today, -i)), [today]);
  const firstOpen = days.findIndex((d) => !!HOURS[d.getDay()]);
  const [dayIdx, setDayIdx] = useState(firstOpen < 0 ? 0 : firstOpen);
  const [slot, setSlot] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [accNo, setAccNo] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const day = days[dayIdx] ?? days[0];
  const slots = slotsFor(day.getDay());
  // 오늘은 지금부터 30분 뒤 시간만
  const past = (m: number) => dayIdx === 0 && nowMin != null && m < nowMin + 30;
  const accVal = accNo ?? accident;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (slot == null) return setErr("시간을 골라 주세요.");
    if (name.trim().length < 2) return setErr("이름을 두 글자 이상 적어 주세요.");
    if (digits.length < 10 || digits.length > 11) return setErr("휴대폰 번호를 확인해 주세요.");
    setErr(null);
    const seq = ((day.getDate() * 37 + slot) % 900) + 100;
    const reply = nextOpenDay(today);
    setDone({
      no: `KM-${p2(day.getMonth() + 1)}${p2(day.getDate())}-${seq}`,
      when: `${fmtKo(day)} ${hm(slot)}`,
      kind,
      name: maskName(name.trim()),
      phone: maskPhone(digits),
      reply: fmtKo(reply),
    });
  };

  const chip = (on: boolean, disabled = false) =>
    `min-h-11 rounded-[4px] border px-3 text-[16px] font-semibold transition-colors ${focusRing} ${disabled ? "cursor-not-allowed line-through" : ""}`;
  const chipStyle = (on: boolean, disabled = false) => ({
    borderColor: on ? C.red : disabled ? C.line : C.field,
    background: on ? C.red : disabled ? C.soft : C.paper,
    color: on ? "#ffffff" : disabled ? "#9a9a9a" : C.ink,
    outlineColor: C.red,
  });

  return (
    <section id="km-reserve" aria-labelledby="km-reserve-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionTitle
        id="km-reserve-title"
        title="온라인 예약"
        aside={
          <a href={`tel:${TEL.replace(/-/g, "")}`} className={`inline-flex items-center gap-1.5 text-[16px] font-bold ${focusRing}`} style={{ outlineColor: C.red }}>
            <Phone size={17} aria-hidden />
            전화 예약 {TEL}
          </a>
        }
      />

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
            className="mt-6 rounded-[8px] border p-6 md:p-8"
            style={{ borderColor: C.line, background: C.soft }}
            role="status"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[15px] font-bold" style={{ color: C.red }}>
                  예약 접수 완료
                </p>
                <p className="mt-1 text-[30px] font-bold tabular-nums md:text-[36px]">
                  {done.no}
                </p>
              </div>
              <Seal size={44} />
            </div>
            <dl className="mt-6 grid gap-x-8 gap-y-3 text-[16px] sm:grid-cols-2">
              {[
                ["진료 일시", done.when],
                ["진료 구분", done.kind],
                ["예약자", `${done.name}, ${done.phone}`],
                ["담당 창구", `${KAKAO}, 전화 ${TEL}`],
                ["확정 문자", `${done.reply} 진료 시간 안에 보내 드려요`],
                ["가져오실 것", done.kind === "교통사고" ? "신분증, 자동차보험 접수번호" : "신분증"],
              ].map(([k, v]) => (
                <div key={k} className="border-b pb-2" style={{ borderColor: C.line }}>
                  <dt className="text-[14px]" style={{ color: C.muted }}>
                    {k}
                  </dt>
                  <dd className="mt-0.5 font-bold">{v}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={() => {
                setDone(null);
                setSlot(null);
              }}
              className={`mt-6 inline-flex h-11 items-center gap-1.5 rounded-[4px] border bg-white px-4 text-[15px] font-semibold ${focusRing}`}
              style={{ borderColor: C.field, outlineColor: C.red }}
            >
              <X size={16} aria-hidden />
              다른 시간으로 다시 예약
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] md:gap-12">
            <div>
              <fieldset>
                <legend className="text-[16px] font-bold">진료 구분</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {KINDS.map((k) => (
                    <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={chip(kind === k)} style={chipStyle(kind === k)}>
                      {k}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-6">
                <legend className="text-[16px] font-bold">날짜</legend>
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {days.map((d, i) => {
                    const closed = !HOURS[d.getDay()];
                    const on = i === dayIdx;
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={closed}
                        aria-pressed={on}
                        aria-label={`${fmtKo(d)}${closed ? " 휴진" : ""}`}
                        onClick={() => {
                          setDayIdx(i);
                          setSlot(null);
                        }}
                        className={`${chip(on, closed)} flex flex-col items-center justify-center py-1.5 leading-tight`}
                        style={chipStyle(on, closed)}
                      >
                        <span className="text-[13px] font-normal">{i === 0 ? "오늘" : DOW[d.getDay()]}</span>
                        <span className="tabular-nums">{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="mt-6">
                <legend className="text-[16px] font-bold">시간</legend>
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {slots.map((m) => {
                    const off = isTaken(dayIdx, m) || past(m);
                    const on = slot === m;
                    const isNight = m >= NIGHT_FROM;
                    return (
                      <button
                        key={m}
                        type="button"
                        disabled={off}
                        aria-pressed={on}
                        aria-label={`${hm(m)}${off ? " 마감" : ""}${isNight ? " 야간" : ""}`}
                        onClick={() => setSlot(m)}
                        className={`${chip(on, off)} tabular-nums`}
                        style={{ ...chipStyle(on, off), ...(isNight && !on && !off ? { color: C.red } : null) }}
                      >
                        {hm(m)}
                      </button>
                    );
                  })}
                </div>
                {slots.some((m) => m >= NIGHT_FROM) && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[14px]" style={{ color: C.red }}>
                    <Moon size={14} aria-hidden />
                    19시 이후는 야간 진료 시간이에요
                  </p>
                )}
              </fieldset>
            </div>

            <div className="md:border-l md:pl-10" style={{ borderColor: C.line }}>
              <label htmlFor="km-name" className="block text-[16px] font-bold">
                이름
              </label>
              <input
                id="km-name"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                autoComplete="name"
                className={`mt-2 h-12 w-full rounded-[4px] border bg-white px-3 text-[17px] ${focusRing}`}
                style={{ borderColor: C.field, outlineColor: C.red }}
              />
              <label htmlFor="km-phone" className="mt-5 block text-[16px] font-bold">
                휴대폰
              </label>
              <input
                id="km-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d-]/g, "").slice(0, 13))}
                inputMode="tel"
                autoComplete="tel"
                placeholder="010-0000-0000"
                className={`mt-2 h-12 w-full rounded-[4px] border bg-white px-3 text-[17px] tabular-nums ${focusRing}`}
                style={{ borderColor: C.field, outlineColor: C.red }}
              />
              {kind === "교통사고" && (
                <>
                  <label htmlFor="km-acc2" className="mt-5 block text-[16px] font-bold">
                    자동차보험 접수번호 <span className="font-normal" style={{ color: C.muted }}>(모르면 비워 두세요)</span>
                  </label>
                  <input
                    id="km-acc2"
                    value={accVal}
                    onChange={(e) => setAccNo(e.target.value.replace(/[^\d-]/g, "").slice(0, 16))}
                    inputMode="numeric"
                    className={`mt-2 h-12 w-full rounded-[4px] border bg-white px-3 text-[17px] tabular-nums ${focusRing}`}
                    style={{ borderColor: C.field, outlineColor: C.red }}
                  />
                </>
              )}

              <p className="mt-6 text-[16px]">
                <span style={{ color: C.muted }}>선택한 시간 </span>
                <strong className="tabular-nums">{slot == null ? "-" : `${fmtKo(day)} ${hm(slot)}`}</strong>
              </p>
              {err && (
                <p role="alert" className="mt-3 inline-flex items-center gap-1.5 text-[15px] font-bold" style={{ color: C.error }}>
                  <AlertCircle size={17} aria-hidden />
                  {err}
                </p>
              )}
              <button
                type="submit"
                data-gtm-cta="korean-medicine_reserve"
                className={`mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-[4px] text-[18px] font-semibold ${focusRing}`}
                style={{ background: C.red, color: "#ffffff", outlineColor: C.ink }}
              >
                <CalendarCheck size={20} aria-hidden />
                예약하기
              </button>
              <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
                급한 통증은 전화 주시면 당일 진료로 잡아 드려요.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------- 오시는 길, 의료진 ---------- */

function VisitSection() {
  return (
    <section id="km-visit" aria-labelledby="km-visit-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionTitle id="km-visit-title" title="오시는 길" />
      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-12">
        {/* 약도 */}
        <svg viewBox="0 0 520 300" className="h-auto w-full rounded-[8px] border" style={{ borderColor: C.line, background: C.soft }} role="img" aria-label="ㅇㅇ역 2번 출구에서 큰길을 따라 걸어 두 번째 건물 3층에 있는 한의원 약도">
          <g stroke="#ececea" strokeWidth="1">
            {Array.from({ length: 12 }, (_, i) => (
              <path key={`v${i}`} d={`M${i * 44 + 20} 0 V300`} />
            ))}
          </g>
          <path d="M0 190 H520" stroke="#dcdcd8" strokeWidth="34" />
          <path d="M300 0 V300" stroke="#dcdcd8" strokeWidth="26" />
          <path d="M0 190 H520 M300 0 V300" stroke="#ffffff" strokeWidth="2" strokeDasharray="10 10" />
          <rect x="70" y="214" width="80" height="34" rx="4" fill="#3a3a3a" />
          <text x="110" y="236" textAnchor="middle" fontSize="15" fontWeight="700" fill="#ffffff">
            ㅇㅇ역
          </text>
          <text x="160" y="268" fontSize="13" fill={C.inkSoft}>
            2번 출구
          </text>
          <path d="M150 172 C200 170 330 172 380 150" fill="none" stroke={C.red} strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
          <rect x="350" y="96" width="92" height="64" rx="3" fill="#ffffff" stroke="#9a9a9a" strokeWidth="1" />
          <rect x="378" y="66" width="36" height="36" rx="3" fill={C.red} />
          <text x="396" y="91" textAnchor="middle" fontSize="20" fontWeight="700" fill="#ffffff">
            곰
          </text>
          <text x="396" y="136" textAnchor="middle" fontSize="13" fontWeight="700" fill={C.ink}>
            3층
          </text>
          <text x="320" y="30" fontSize="13" fill={C.inkSoft}>
            ㅇㅇ로
          </text>
        </svg>

        <div className="space-y-5 text-[17px]">
          <p className="flex items-start gap-2">
            <MapPin size={20} aria-hidden className="mt-0.5 shrink-0" style={{ color: C.red }} />
            <span>
              <strong>{ADDRESS}</strong>
              <br />
              <span style={{ color: C.inkSoft }}>ㅇㅇ역 2번 출구에서 걸어서 3분</span>
            </span>
          </p>
          <p className="flex items-start gap-2">
            <Car size={20} aria-hidden className="mt-0.5 shrink-0" style={{ color: C.red }} />
            <span>건물 지하 주차 가능, 진료 시 2시간 무료</span>
          </p>
          <p className="flex items-start gap-2">
            <MessageCircle size={20} aria-hidden className="mt-0.5 shrink-0" style={{ color: C.red }} />
            <span>
              {KAKAO}, 전화 {TEL}
            </span>
          </p>

          <div className="border-t pt-5" style={{ borderColor: C.line }}>
            <h3 className="text-[20px] font-bold">
              의료진
            </h3>
            <ul className="mt-3 grid gap-4 sm:grid-cols-2">
              <li className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                <img src={`${IMG}/staff-1.jpg`} alt="대표원장 김ㅎ늘" className="h-24 w-20 flex-none rounded-[8px] object-cover" />
                <span>
                  <strong className="block text-[17px]">대표원장 김ㅎ늘</strong> <span style={{ color: C.inkSoft }}>한방재활의학과 전문의</span>
                </span>
              </li>
              <li className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                <img src={`${IMG}/staff-2.jpg`} alt="원장 이ㅅ윤" className="h-24 w-20 flex-none rounded-[8px] object-cover" />
                <span>
                  <strong className="block text-[17px]">원장 이ㅅ윤</strong> <span style={{ color: C.inkSoft }}>한의사</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
