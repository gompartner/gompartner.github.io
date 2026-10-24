"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { AlertCircle, BedDouble, CalendarCheck, Car, Check, Clock, MapPin, MessageCircle, Phone, Soup, Stethoscope, Train, Users } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 요양병원 홈페이지 샘플: 가상의 곰파트너 요양병원.
   병원명, 의료진, 주소, 전화번호, 진료비는 모두 가상이다. 의료광고 규칙에 맞춰 치료 효과, 후기, 할인 강조는 넣지 않는다.

   국내 요양병원 사이트 공통 구성(참고): 메뉴는 병원소개, 진료안내(진료과목, 의료진), 입원안내(입원절차, 병실안내, 비급여 진료비),
   면회안내, 커뮤니티(공지사항, 주간 식단표), 오시는 길. 첫 화면에는 입원상담 전화와 면회 시간이 크게 있고,
   보호자가 가장 많이 찾는 건 병실별 비용, 간병 형태(공동간병), 면회 예약, 이번 주 식단이다.
   관용 문구: 입원상담, 면회 예약, 공동간병, 상급병실료 차액, 비급여 진료비 안내, 주간 식단표, 주차 가능.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 병실 안내: 6인실, 4인실, 2인실, 1인실을 고르면 병실 배치도와 월 예상 비용(입원비 본인부담, 식대, 병실 차액, 간병비)이 바뀐다.
   2. 면회 예약: 오늘부터 7일 중 날짜, 오후 30분 단위 시간 칸(남은 자리), 환자와 보호자 정보. 완료하면 예약 번호와 확인 문자 날짜.
   3. 이번 주 식단표: 요일을 고르면 아침, 점심, 저녁, 간식. 일반식과 죽식을 바꿔 볼 수 있다.
   4. 입원 상담 신청: 환자 나이, 현재 상태, 희망 시기, 병실, 보호자 연락처. 완료하면 접수 번호, 담당 창구, 회신 예정일.

   사진 출처: AI 생성(Z-Image-Turbo, Apache 2.0), 직원 사진은 AI 생성(Z-Image-Turbo)

   첫 화면(nh-poster): 침대 위 어르신 손을 보호사가 감싸 쥔 사진 한 장이 한 화면을 채우고, 흰 막 위에 문장 "병실별 월 비용을 간병비까지 공개합니다".
   들어오면 사진이 1.6초 동안 천천히 다가오고(1.06배에서 1배), 문장은 0.3초 늦게 아래에서 올라온다(CSS keyframes, JS 없이도 보인다).
   스크롤하면 사진만 조금 느리게 움직인다. 동작 줄이기면 전부 멈춘다. */

const IMG = "/images/demo-nursing-hospital";
const BRAND = "곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 곰파트너 빌딩";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";
const SLUG = "nursing-hospital";

const C = {
  /** 강조색 하나. 차분한 짙은 초록 */
  green: "#2c4632",
  /** 오늘 표시, 로고 잎 같은 옅은 초록 */
  sage: "#c9d3c6",
  /** 옅은 회색 구역 바탕 */
  beige: "#f7f7f5",
  paper: "#ffffff",
  card: "#ffffff",
  ink: "#111111",
  muted: "#4b4b4b",
  sub: "#767676",
  line: "#e5e5e5",
  sun: "#fbf6e6",
  error: "#9a3412",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 칩, 패널 전환 */
const DUR = 0.35;
/** 첫 화면 사진이 다가오는 시간 */
const PHOTO_IN = 1.6;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- 데이터 ---------- */

type RoomId = "6" | "4" | "2" | "1";
type Room = { id: RoomId; label: string; beds: number; diff: number; care: "공동간병" | "개인간병"; careDay: number | null; desc: string };

/** 하루 기준 본인부담 개략. 실제 금액은 환자 분류 등급과 본인부담률에 따라 다르다 */
const BASE_DAY = { stay: 13000, meal: 7500 };
const ROOMS: Room[] = [
  { id: "6", label: "6인실", beds: 6, diff: 0, care: "공동간병", careDay: 25000, desc: "기준병실, 병상마다 커튼과 개인 사물함" },
  { id: "4", label: "4인실", beds: 4, diff: 15000, care: "공동간병", careDay: 30000, desc: "창가 병상 2개, 병실 안 화장실" },
  { id: "2", label: "2인실", beds: 2, diff: 40000, care: "공동간병", careDay: 40000, desc: "보호자 의자, 병실 안 화장실과 샤워실" },
  { id: "1", label: "1인실", beds: 1, diff: 90000, care: "개인간병", careDay: null, desc: "보호자 소파, 냉장고, 병실 안 화장실과 샤워실" },
];

const NONPAY = [
  ["상급병실료 차액 4인실", "1일", 15000],
  ["상급병실료 차액 2인실", "1일", 40000],
  ["상급병실료 차액 1인실", "1일", 90000],
  ["일반진단서", "1통", 20000],
  ["입퇴원확인서", "1통", 3000],
  ["진료기록 사본", "1매", 1000],
] as const;

const VISIT_SLOTS = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
/** 시간 칸마다 받는 가족 수(1층 면회실 테이블 수) */
const VISIT_CAP = 4;
const VISIT_DAYS = 7;

/** 날짜, 시간 칸별로 이미 찬 자리. 실제로는 원무과 예약표에서 읽는다. 주말 오후가 먼저 찬다 */
function visitTaken(day: Date, slot: number) {
  let h = (day.getDate() + 5) * 2654435761 + (slot + 3) * 40503;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 97;
  const weekend = day.getDay() === 0 || day.getDay() === 6 ? 2 : 0;
  return Math.min(VISIT_CAP, (h % 4) + weekend);
}

type Meal = { breakfast: string[]; lunch: string[]; dinner: string[]; snack: string };
/** 월요일부터 일요일까지 */
const MEALS: Meal[] = [
  { breakfast: ["쌀밥", "아욱된장국", "계란찜", "시금치나물", "백김치"], lunch: ["잡곡밥", "소고기무국", "고등어구이", "애호박볶음", "배추김치"], dinner: ["쌀밥", "북엇국", "닭가슴살장조림", "숙주나물", "깍두기"], snack: "두유, 바나나" },
  { breakfast: ["쌀밥", "미역국", "두부조림", "콩나물무침", "백김치"], lunch: ["보리밥", "근대된장국", "저염 제육볶음", "가지나물", "배추김치"], dinner: ["쌀밥", "순두부국", "동태전", "무생채", "열무김치"], snack: "요구르트, 찐 고구마" },
  { breakfast: ["쌀밥", "감자국", "메추리알장조림", "도라지무침", "백김치"], lunch: ["잡곡밥", "순한 육개장", "연근조림", "브로콜리 초장", "배추김치"], dinner: ["쌀밥", "시래기된장국", "갈치조림", "청경채나물", "깍두기"], snack: "카스텔라, 우유" },
  { breakfast: ["쌀밥", "콩나물국", "스크램블에그", "오이무침", "백김치"], lunch: ["흑미밥", "들깨미역국", "닭볶음탕", "단호박찜", "배추김치"], dinner: ["쌀밥", "어묵국", "돼지불고기", "비름나물", "열무김치"], snack: "단감, 두유" },
  { breakfast: ["쌀밥", "배춧국", "두부부침", "고사리나물", "백김치"], lunch: ["잡곡밥", "살코기 갈비탕", "잡채", "도토리묵무침", "배추김치"], dinner: ["쌀밥", "된장찌개", "삼치구이", "호박나물", "깍두기"], snack: "백설기, 식혜" },
  { breakfast: ["쌀밥", "황태국", "계란말이", "감자채볶음", "백김치"], lunch: ["쌀밥", "소고기미역국", "불고기", "시금치나물", "배추김치"], dinner: ["쌀밥", "버섯국", "가자미조림", "무나물", "열무김치"], snack: "사과, 요구르트" },
  { breakfast: ["쌀밥", "북엇국", "연두부", "콩자반", "백김치"], lunch: ["잡곡밥", "닭곰탕", "동그랑땡", "오이무침", "배추김치"], dinner: ["쌀밥", "아욱국", "동태조림", "애호박나물", "깍두기"], snack: "카스텔라, 두유" },
];
const PORRIDGE = ["흰죽", "야채죽", "소고기죽", "호박죽", "계란죽", "흰죽", "야채죽"];
type Diet = "일반식" | "죽식";

/** 죽식은 밥을 죽으로, 김치와 깍두기를 물김치로 바꾼다 */
function forDiet(items: string[], diet: Diet, dayIdx: number, meal: number) {
  if (diet === "일반식") return items;
  return items.map((it, i) => {
    if (i === 0) return PORRIDGE[(dayIdx + meal) % PORRIDGE.length];
    if (it.includes("김치") || it === "깍두기") return "물김치";
    return it;
  });
}

const AGES = ["60대", "70대", "80대", "90대 이상"];
const CONDITIONS = ["거동이 불편해요", "치매 증상", "뇌졸중 후 재활", "수술 후 회복", "암 요양", "욕창 관리"];
const WHEN = ["이번 주", "2주 안", "한 달 안", "정하지 않음"];

/** 다음 평일 */
function nextWeekday(d: Date) {
  let n = daysAgo(d, -1);
  while (n.getDay() === 0 || n.getDay() === 6) n = daysAgo(n, -1);
  return n;
}

/* ---------- 본문 ---------- */

export function NursingHospitalDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [room, setRoom] = useState<RoomId>("6");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("nh-visit")} />

      <header className="border-b" style={{ borderColor: C.line, background: C.paper }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
          <p className="inline-flex items-center gap-2 text-[18px] font-bold" style={{ color: C.ink }}>
            <SampleLogo />
          </p>
          <nav aria-label="주요 메뉴" className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto text-[15px] font-semibold md:order-none md:w-auto">
            {[
              ["병실 안내", "nh-room"],
              ["면회 예약", "nh-visit"],
              ["식단표", "nh-meal"],
              ["입원상담", "nh-consult"],
              ["오시는 길", "nh-map"],
            ].map(([label, id]) => (
              <button key={id} type="button" onClick={() => go(id)} className={`flex-none rounded-[6px] px-3 py-2 hover:bg-black/5 ${focusRing}`} style={{ outlineColor: C.green }}>
                {label}
              </button>
            ))}
          </nav>
          <a href={`tel:${TEL.replace(/-/g, "")}`} data-gtm-cta={`${SLUG}_tel`} className={`inline-flex items-center gap-1.5 rounded-[6px] px-4 py-2 text-[15px] font-semibold text-white ${focusRing}`} style={{ background: C.green, outlineColor: C.green }}>
            <Phone size={16} aria-hidden />
            입원상담 {TEL}
          </a>
        </div>
      </header>

      {/* 병원 첫 소개: 진료과목, 면회 시간, 상담 시간 */}
      <section aria-labelledby="nh-intro-title" className="mx-auto max-w-[1200px] px-4 pt-10 md:px-6 md:pt-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end">
          <div>
            <h2 id="nh-intro-title" className="text-[32px] font-bold leading-[1.25] md:text-[44px]" style={{ color: C.ink, wordBreak: "keep-all" }}>
              {BRAND}
            </h2>
            <p className="mt-3 text-[17px]" style={{ color: C.muted }}>
              내과, 재활의학과, 가정의학과 진료와 공동간병 병동
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" onClick={() => go("nh-consult")} data-gtm-cta={`${SLUG}_intro_consult`} className={`rounded-[6px] px-5 py-3 text-[16px] font-semibold text-white ${focusRing}`} style={{ background: C.green, outlineColor: C.green }}>
                입원상담 신청
              </button>
              <button type="button" onClick={() => go("nh-visit")} className={`rounded-[6px] border px-5 py-3 text-[16px] font-semibold ${focusRing}`} style={{ borderColor: C.green, color: C.green, outlineColor: C.green }}>
                면회 예약
              </button>
            </div>
          </div>
          <dl className="grid gap-px overflow-hidden rounded-[8px] border sm:grid-cols-3" style={{ borderColor: C.line, background: C.line }}>
            {[
              [Clock, "면회 시간", "매일 14:00~18:00", "1회 30분, 2명까지"],
              [Phone, "입원상담", "평일 09:00~18:00", "토요일 09:00~13:00"],
              [Car, "주차", "주차 가능", "면회 시 2시간 무료"],
            ].map(([Icon, k, v, sub]) => {
              const I = Icon as typeof Clock;
              return (
                <div key={k as string} className="p-5" style={{ background: C.card }}>
                  <dt className="inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: C.muted }}>
                    <I size={16} aria-hidden />
                    {k as string}
                  </dt>
                  <dd className="mt-2 text-[19px] font-bold" style={{ color: C.green }}>
                    {v as string}
                  </dd>
                  <dd className="mt-1 text-[14px]" style={{ color: C.muted }}>
                    {sub as string}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      <RoomSection room={room} setRoom={setRoom} reduce={reduce} />
      <VisitSection today={today} reduce={reduce} />
      <MealSection today={today} />
      <Doctors />
      <ConsultSection today={today} room={room} reduce={reduce} />
      <MapSection />

      <footer className="mt-20 border-t" style={{ borderColor: C.line, background: C.beige }}>
        <div className="mx-auto max-w-[1200px] px-4 py-10 text-[14px] leading-[1.8] md:px-6" style={{ color: C.ink }}>
          <p className="text-[16px] font-bold" style={{ color: C.ink }}>
            <SampleLogo size={18} />
          </p>
          <p className="mt-1">
            {ADDRESS}, 대표전화 {TEL}
          </p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

/* ---------- 포스터 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // 스크롤하면 사진만 조금 느리게 내려간다
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  return (
    <section id="nh-poster" ref={ref} aria-labelledby="nh-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: C.beige, color: C.ink }}>
      <style>{`@keyframes nh-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.nh-rise{animation:nh-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both}@media (prefers-reduced-motion: reduce){.nh-rise{animation:none}}`}</style>
      <motion.div className="absolute inset-x-0 top-[-10%] h-[110%]" style={{ y: photoY }}>
        <motion.div className="h-full w-full" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : PHOTO_IN, ease: EASE }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="병상 위에 놓인 어르신 손을 보호사가 두 손으로 감싸 쥔 모습, 뒤로 밝은 창과 화분"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "57% 50%" }}
          />
        </motion.div>
      </motion.div>
      {/* 글자 대비를 위한 흰 막. 휴대폰은 아래쪽, PC는 왼쪽 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 md:hidden" style={{ background: "linear-gradient(to top, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.86) 30%, rgba(255,255,255,0.15) 55%, rgba(255,255,255,0.05) 82%, rgba(255,255,255,0.7) 100%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.93) 0%, rgba(255,255,255,0.82) 32%, rgba(255,255,255,0.2) 56%, rgba(255,255,255,0) 70%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 hidden h-28 md:block" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0))" }} />

      <div className="relative z-[1] flex items-center justify-between gap-3 px-4 pt-4 md:px-12 md:pt-7">
        <p className="inline-flex items-center gap-2 text-[17px] font-bold leading-none">
          <SampleLogo size={18} />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta={`${SLUG}_poster_cta`}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold text-white ${focusRing}`}
          style={{ background: C.green, outlineColor: C.green }}
        >
          <CalendarCheck size={17} aria-hidden />
          면회 예약
        </button>
      </div>

      <div className={`relative z-[1] mt-auto px-4 pb-14 md:my-auto md:px-12 md:pb-0 ${reduce ? "" : "nh-rise"}`}>
        <h1
          id="nh-poster-title"
          className="max-w-[12em] text-[38px] font-bold md:text-[clamp(40px,5vw,72px)]"
          style={{ letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all", color: C.ink }}
        >
          병실별 월 비용을
          <br />
          간병비까지 공개합니다
        </h1>
        <p className="mt-4 text-[16px] tabular-nums md:mt-6 md:text-[18px]" style={{ color: C.muted }}>
          면회 시간 매일 14:00~18:00
        </p>
      </div>
    </section>
  );
}


function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#fff" : "#111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          곰파트너
        </span>
        <span className="text-[12px] font-semibold opacity-75">요양병원 샘플</span>
      </span>
    </span>
  );
}

/* ---------- 공용 ---------- */

function SectionHead({ id, title, children }: { id: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b pb-3" style={{ borderColor: C.line }}>
      <h2 id={id} className="text-[26px] font-bold md:text-[32px]" style={{ color: C.ink }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[15px] font-semibold">{label}</span>
      {children}
      {error && (
        <span className="mt-1 inline-flex items-center gap-1 text-[14px] font-semibold" style={{ color: C.error }} role="alert">
          <AlertCircle size={15} aria-hidden />
          {error}
        </span>
      )}
    </label>
  );
}

const inputCls = `mt-1.5 block w-full rounded-[6px] border px-3 py-2.5 text-[16px] ${focusRing}`;
const inputStyle = { borderColor: "#cfcfcf", background: "#fff", outlineColor: C.green } as const;

function Receipt({ title, rows, reply, onReset }: { title: string; rows: [string, string][]; reply: string; onReset: () => void }) {
  return (
    <div className="rounded-[8px] border p-5 md:p-6" style={{ borderColor: C.green, background: C.card }} role="status">
      <p className="inline-flex items-center gap-2 text-[20px] font-bold" style={{ color: C.ink }}>
        <Check size={22} aria-hidden />
        {title}
      </p>
      <dl className="mt-4 grid gap-x-4 gap-y-2 text-[15px] sm:grid-cols-[120px_minmax(0,1fr)]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="font-semibold" style={{ color: C.muted }}>
              {k}
            </dt>
            <dd className="font-bold">{v}</dd>
          </div>
        ))}
        <dt className="font-semibold" style={{ color: C.muted }}>
          담당 창구
        </dt>
        <dd className="font-bold">
          원무과 {TEL}, {KAKAO}
        </dd>
        <dt className="font-semibold" style={{ color: C.muted }}>
          회신 예정일
        </dt>
        <dd className="font-bold">{reply}</dd>
      </dl>
      <button type="button" onClick={onReset} className={`mt-5 rounded-[6px] border px-4 py-2 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.line, outlineColor: C.green }}>
        새로 작성
      </button>
    </div>
  );
}

/* ---------- 1. 병실 안내 ---------- */

function RoomSection({ room, setRoom, reduce }: { room: RoomId; setRoom: (r: RoomId) => void; reduce: boolean }) {
  const r = ROOMS.find((x) => x.id === room) ?? ROOMS[0];
  const [care, setCare] = useState(true);
  const days = 30;
  const stay = BASE_DAY.stay * days;
  const meal = BASE_DAY.meal * days;
  const diff = r.diff * days;
  const careFee = care && r.careDay ? r.careDay * days : 0;
  const total = stay + meal + diff + careFee;

  return (
    <section id="nh-room" aria-labelledby="nh-room-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionHead id="nh-room-title" title="병실 안내" />
      <div role="tablist" aria-label="병실 종류" className="flex flex-wrap gap-2">
        {ROOMS.map((x) => {
          const on = x.id === room;
          return (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setRoom(x.id)}
              className={`inline-flex items-center gap-1.5 rounded-[6px] border px-4 py-2 text-[16px] font-semibold transition-colors ${focusRing}`}
              style={{ borderColor: C.green, background: on ? C.green : "transparent", color: on ? C.paper : C.green, outlineColor: C.green }}
            >
              <BedDouble size={17} aria-hidden />
              {x.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[8px] border p-4 md:p-6" style={{ borderColor: C.line, background: C.card }}>
          <RoomPlan room={r} reduce={reduce} />
          <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
            {r.desc}
          </p>
        </div>

        <div className="rounded-[8px] p-5 md:p-6" style={{ background: C.beige }}>
          <p className="text-[15px] font-semibold" style={{ color: C.muted }}>
            {r.label} 월 예상 비용(30일, 개략)
          </p>
          <p className="mt-1 text-[38px] font-bold tabular-nums md:text-[46px]" style={{ color: C.ink }} aria-live="polite">
            약 {Math.round(total / 10000).toLocaleString("ko-KR")}만원
          </p>
          <dl className="mt-4 divide-y text-[15px]" style={{ borderColor: C.line }}>
            {(
              [
                ["입원비 본인부담", stay],
                ["식대 본인부담", meal],
                ["상급병실료 차액", diff],
                [r.careDay ? `간병비(${r.care})` : "간병비", careFee],
              ] as [string, number][]
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 py-2" style={{ borderColor: C.line }}>
                <dt>{k}</dt>
                <dd className="font-bold tabular-nums">{k === "간병비" ? "개인간병 별도" : v === 0 && k.startsWith("상급") ? "없음" : won(v)}</dd>
              </div>
            ))}
          </dl>
          {r.careDay && (
            <label className="mt-4 flex cursor-pointer items-center gap-2 text-[15px] font-semibold">
              <input type="checkbox" checked={care} onChange={(e) => setCare(e.target.checked)} className={`h-5 w-5 accent-[#2c4632] ${focusRing}`} />
              공동간병 포함해서 보기
            </label>
          )}
          <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
            환자 분류 등급과 본인부담률에 따라 달라집니다.
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse text-[15px]">
          <caption className="mb-2 text-left text-[18px] font-bold" style={{ color: C.ink }}>
            비급여 진료비 안내
          </caption>
          <thead>
            <tr style={{ background: C.beige }}>
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                항목
              </th>
              <th scope="col" className="px-3 py-2 text-left font-semibold">
                기준
              </th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">
                금액
              </th>
            </tr>
          </thead>
          <tbody>
            {NONPAY.map(([k, unit, v]) => (
              <tr key={k} className="border-b" style={{ borderColor: C.line }}>
                <td className="px-3 py-2">{k}</td>
                <td className="px-3 py-2">{unit}</td>
                <td className="px-3 py-2 text-right font-bold tabular-nums">{won(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** 위에서 내려다본 병실 배치도. 위쪽 벽이 창이고 창으로 든 빛이 바닥에 깔린다 */
function RoomPlan({ room, reduce }: { room: Room; reduce: boolean }) {
  const beds = useMemo(() => {
    const W = 64;
    const H = 104;
    const top = 40;
    const bottom = 300 - 40 - H;
    const rows = room.beds === 1 ? [[180]] : room.beds === 2 ? [[110], [250]] : room.beds === 4 ? [[90, 250], [90, 250]] : [[56, 180, 304], [56, 180, 304]];
    const out: { x: number; y: number; flip: boolean }[] = [];
    rows.forEach((xs, ri) => xs.forEach((cx) => out.push({ x: cx - W / 2, y: room.beds === 2 ? top + 40 : ri === 0 ? top : bottom, flip: room.beds !== 2 && ri === 1 })));
    return { list: out, W, H };
  }, [room]);

  return (
    <svg viewBox="0 0 360 300" className="h-auto w-full" role="img" aria-label={`${room.label} 배치도, 병상 ${room.beds}개`}>
      <defs>
        <linearGradient id="nh-plan-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.sun} stopOpacity="0.95" />
          <stop offset="1" stopColor={C.sun} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="nh-plan-blanket" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dfe5dc" />
          <stop offset="1" stopColor="#c4cfc0" />
        </linearGradient>
      </defs>
      <rect x="8" y="12" width="344" height="280" rx="4" fill="#f7f7f5" stroke={C.green} strokeWidth="4" />
      {/* 창 */}
      <rect x="70" y="8" width="220" height="8" fill="#d4e3ea" stroke={C.green} strokeWidth="2" />
      <polygon points="70,16 290,16 320,150 40,150" fill="url(#nh-plan-light)" opacity="0.8" />
      {/* 문 */}
      <path d="M352 236 A44 44 0 0 1 308 280" fill="none" stroke={C.green} strokeWidth="1.5" strokeDasharray="4 4" />
      <rect x="346" y="236" width="10" height="48" fill="#f7f7f5" />
      {room.beds >= 4 || room.beds === 1 ? <rect x="12" y="236" width="56" height="52" fill="#ececea" stroke="#c8c8c4" /> : null}
      <AnimatePresence initial={false} mode="popLayout">
        {beds.list.map((b, i) => (
          <motion.g
            key={`${room.id}-${i}`}
            initial={reduce ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : DUR, delay: reduce ? 0 : i * 0.05, ease: EASE }}
          >
            {/* 병상 커튼 */}
            <rect x={b.x - 10} y={b.y - 6} width={beds.W + 20} height={beds.H + 12} rx="3" fill="none" stroke="#b5b5b0" strokeDasharray="3 4" />
            <rect x={b.x} y={b.y} width={beds.W} height={beds.H} rx="6" fill="#fff" stroke="#8f8f8a" strokeWidth="1.5" />
            <rect x={b.x + 10} y={b.flip ? b.y + beds.H - 22 : b.y + 8} width={beds.W - 20} height="14" rx="5" fill="#f2f2f0" stroke="#c8c8c4" />
            <rect x={b.x + 4} y={b.flip ? b.y + 6 : b.y + 30} width={beds.W - 8} height={beds.H - 38} rx="4" fill="url(#nh-plan-blanket)" />
            <rect x={beds.W + b.x + 4} y={b.flip ? b.y + beds.H - 26 : b.y} width="18" height="26" rx="2" fill="#ececea" stroke="#c8c8c4" />
          </motion.g>
        ))}
      </AnimatePresence>
      {room.beds === 1 && <rect x="240" y="160" width="90" height="34" rx="8" fill="#dcdcd8" stroke="#b5b5b0" />}
      {room.beds === 2 && <rect x="160" y="236" width="40" height="40" rx="6" fill="#dcdcd8" stroke="#b5b5b0" />}
    </svg>
  );
}

/* ---------- 2. 면회 예약 ---------- */

type VisitForm = { patient: string; guardian: string; phone: string; people: 1 | 2 };

function VisitSection({ today, reduce }: { today: Date; reduce: boolean }) {
  const dates = useMemo(() => Array.from({ length: VISIT_DAYS }, (_, i) => daysAgo(today, -i)), [today]);
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<number | null>(null);
  const [form, setForm] = useState<VisitForm>({ patient: "", guardian: "", phone: "", people: 1 });
  const [err, setErr] = useState<Partial<Record<keyof VisitForm | "slot", string>>>({});
  const [done, setDone] = useState<{ no: string; date: Date; slot: number; form: VisitForm } | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof err = {};
    if (slot === null) next.slot = "시간을 골라 주세요.";
    if (form.patient.trim().length < 2) next.patient = "환자 성함을 적어 주세요.";
    if (form.guardian.trim().length < 2) next.guardian = "보호자 성함을 적어 주세요.";
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "휴대폰 번호를 확인해 주세요.";
    setErr(next);
    if (Object.keys(next).length || slot === null) return;
    const d = dates[day];
    setDone({ no: `V${p2(d.getMonth() + 1)}${p2(d.getDate())}-${String(Date.now()).slice(-3)}`, date: d, slot, form });
  };

  const d = dates[day];
  return (
    <section id="nh-visit" aria-labelledby="nh-visit-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionHead id="nh-visit-title" title="면회 예약">
        <p className="text-[15px] font-semibold" style={{ color: C.muted }}>
          매일 14:00~18:00, 1층 면회실
        </p>
      </SectionHead>

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : DUR }}>
            <Receipt
              title="면회 예약이 접수됐어요"
              rows={[
                ["예약 번호", done.no],
                ["면회 일시", `${fmtKo(done.date)} ${VISIT_SLOTS[done.slot]}`],
                ["환자", maskName(done.form.patient)],
                ["보호자", `${maskName(done.form.guardian)}, ${maskPhone(done.form.phone)}, ${done.form.people}명`],
              ]}
              reply={`${done.date.getTime() === today.getTime() ? "오늘" : fmtKo(daysAgo(done.date, 1))} 오후 문자로 확인 드려요`}
              onReset={() => {
                setDone(null);
                setSlot(null);
                setForm({ patient: "", guardian: "", phone: "", people: 1 });
              }}
            />
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : DUR }} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div>
              <fieldset>
                <legend className="text-[15px] font-semibold">날짜</legend>
                <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
                  {dates.map((x, i) => {
                    const on = i === day;
                    const wk = x.getDay();
                    return (
                      <button
                        key={i}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setDay(i);
                          setSlot(null);
                        }}
                        className={`flex w-[60px] flex-none flex-col items-center rounded-[8px] border py-2 ${focusRing}`}
                        style={{ borderColor: on ? C.green : C.line, background: on ? C.green : C.card, color: on ? C.paper : C.ink, outlineColor: C.green }}
                      >
                        <span className="text-[13px] font-semibold">{i === 0 ? "오늘" : DOW[wk]}</span>
                        <span className="text-[20px] font-bold tabular-nums">{x.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="mt-5">
                <legend className="text-[15px] font-semibold">
                  {fmtKo(d)} 시간
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {VISIT_SLOTS.map((t, i) => {
                    const left = VISIT_CAP - visitTaken(d, i);
                    const full = left <= 0;
                    const on = slot === i;
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={full}
                        aria-pressed={on}
                        onClick={() => setSlot(i)}
                        className={`rounded-[8px] border px-2 py-2.5 text-left disabled:cursor-not-allowed ${focusRing}`}
                        style={{ borderColor: on ? C.green : C.line, background: on ? C.green : full ? "#f2f2f0" : C.card, color: on ? C.paper : full ? C.sub : C.ink, outlineColor: C.green }}
                      >
                        <span className="block text-[17px] font-bold tabular-nums">{t}</span>
                        <span className="block text-[13px] font-semibold">{full ? "마감" : `${left}자리 남음`}</span>
                      </button>
                    );
                  })}
                </div>
                {err.slot && (
                  <p className="mt-2 inline-flex items-center gap-1 text-[14px] font-semibold" style={{ color: C.error }} role="alert">
                    <AlertCircle size={15} aria-hidden />
                    {err.slot}
                  </p>
                )}
              </fieldset>

              <ul className="mt-5 space-y-1 text-[15px]" style={{ color: C.muted }}>
                <li>1회 30분, 보호자 2명까지 들어올 수 있어요.</li>
                <li>음식은 병동 간호사실에 먼저 물어봐 주세요.</li>
              </ul>
            </div>

            <div className="rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.card }}>
              <div className="grid gap-4">
                <Field label="환자 성함" error={err.patient}>
                  <input className={inputCls} style={inputStyle} value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} autoComplete="off" />
                </Field>
                <Field label="보호자 성함" error={err.guardian}>
                  <input className={inputCls} style={inputStyle} value={form.guardian} onChange={(e) => setForm({ ...form, guardian: e.target.value })} autoComplete="name" />
                </Field>
                <Field label="휴대폰 번호" error={err.phone}>
                  <input className={inputCls} style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" />
                </Field>
                <fieldset>
                  <legend className="text-[15px] font-semibold">방문 인원</legend>
                  <div className="mt-1.5 flex gap-2">
                    {([1, 2] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-pressed={form.people === n}
                        onClick={() => setForm({ ...form, people: n })}
                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-[6px] border py-2 text-[16px] font-semibold ${focusRing}`}
                        style={{ borderColor: C.green, background: form.people === n ? C.green : "transparent", color: form.people === n ? C.paper : C.green, outlineColor: C.green }}
                      >
                        <Users size={16} aria-hidden />
                        {n}명
                      </button>
                    ))}
                  </div>
                </fieldset>
                <button type="submit" data-gtm-cta={`${SLUG}_visit_submit`} className={`mt-1 rounded-[6px] py-3 text-[17px] font-semibold text-white ${focusRing}`} style={{ background: C.green, outlineColor: C.green }}>
                  {slot === null ? "면회 예약하기" : `${fmtKo(d)} ${VISIT_SLOTS[slot]} 예약하기`}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ---------- 3. 이번 주 식단표 ---------- */

function MealSection({ today }: { today: Date }) {
  const monday = daysAgo(today, (today.getDay() + 6) % 7);
  const week = Array.from({ length: 7 }, (_, i) => daysAgo(monday, -i));
  const todayIdx = (today.getDay() + 6) % 7;
  const [pick, setPick] = useState<number | null>(null);
  const [diet, setDiet] = useState<Diet>("일반식");
  const idx = pick ?? todayIdx;
  const m = MEALS[idx];

  return (
    <section id="nh-meal" aria-labelledby="nh-meal-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionHead id="nh-meal-title" title="이번 주 식단표">
        <p className="text-[15px] font-semibold tabular-nums" style={{ color: C.muted }}>
          {fmtKo(week[0])} ~ {fmtKo(week[6])}
        </p>
      </SectionHead>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="요일" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {week.map((w, i) => {
            const on = i === idx;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setPick(i)}
                className={`flex-none rounded-[6px] px-3 py-2 text-[15px] font-semibold ${focusRing}`}
                style={{ background: on ? C.green : "transparent", color: on ? C.paper : C.ink, outlineColor: C.green, boxShadow: i === todayIdx && !on ? `inset 0 -3px 0 ${C.sage}` : undefined }}
              >
                {DOW[w.getDay()]} {w.getDate()}
                {i === todayIdx && <span className="sr-only">(오늘)</span>}
              </button>
            );
          })}
        </div>
        <div className="inline-flex rounded-[6px] border p-0.5" style={{ borderColor: C.green }} role="group" aria-label="식사 종류">
          {(["일반식", "죽식"] as Diet[]).map((x) => (
            <button
              key={x}
              type="button"
              aria-pressed={diet === x}
              onClick={() => setDiet(x)}
              className={`rounded-[6px] px-4 py-1.5 text-[15px] font-semibold ${focusRing}`}
              style={{ background: diet === x ? C.green : "transparent", color: diet === x ? C.paper : C.green, outlineColor: C.green }}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {(
          [
            ["아침", "07:30", m.breakfast],
            ["점심", "11:30", m.lunch],
            ["저녁", "17:30", m.dinner],
          ] as [string, string, string[]][]
        ).map(([label, time, items], mi) => (
          <div key={label} className="rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.card }}>
            <p className="flex items-baseline justify-between">
              <span className="inline-flex items-center gap-1.5 text-[18px] font-bold" style={{ color: C.ink }}>
                <Soup size={18} aria-hidden />
                {label}
              </span>
              <span className="text-[14px] tabular-nums" style={{ color: C.muted }}>
                {time}
              </span>
            </p>
            <ul className="mt-3 space-y-1.5 text-[16px]">
              {forDiet(items, diet, idx, mi).map((it, i) => (
                <li key={i} className={i === 0 ? "font-bold" : ""}>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[15px]">
        <span className="font-bold">오후 간식(15:00)</span> {m.snack}
      </p>
    </section>
  );
}

/* ---------- 의료진 ---------- */

function Doctors() {
  const list = [
    ["김ㅎ늘", "병원장", "내과 전문의", "내과, 만성질환 관리"],
    ["박ㅈ우", "진료과장", "재활의학과 전문의", "뇌졸중, 골절 후 재활"],
    ["이ㅅ연", "진료과장", "가정의학과 전문의", "영양, 통증 관리"],
  ];
  return (
    <section aria-labelledby="nh-doctor-title" className="mx-auto mt-16 max-w-[1200px] px-4 md:mt-24 md:px-6">
      <SectionHead id="nh-doctor-title" title="의료진" />
      <ul className="grid gap-px overflow-hidden rounded-[8px] border sm:grid-cols-3" style={{ borderColor: C.line, background: C.line }}>
        {list.map(([name, role, spec, area], i) => (
          <li key={name} className="p-5" style={{ background: C.card }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
            <img
              src={`${IMG}/staff-${i + 1}.jpg`}
              alt={`${role} ${name}`}
              width={72}
              height={86}
              loading="lazy"
              className="mb-4 h-[86px] w-[72px] rounded-[6px] object-cover"
              style={{ objectPosition: "50% 20%", background: C.line }}
            />
            <p className="inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: C.muted }}>
              <Stethoscope size={16} aria-hidden />
              {role}
            </p>
            <p className="mt-1 text-[22px] font-bold" style={{ color: C.ink }}>
              {name}
            </p>
            <p className="mt-1 text-[15px] font-semibold">{spec}</p>
            <p className="text-[15px]" style={{ color: C.muted }}>
              {area}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- 4. 입원 상담 신청 ---------- */

type ConsultForm = { age: string; conds: string[]; when: string; room: RoomId; name: string; phone: string };

function ConsultSection({ today, room, reduce }: { today: Date; room: RoomId; reduce: boolean }) {
  const [form, setForm] = useState<ConsultForm>({ age: "80대", conds: [], when: "2주 안", room, name: "", phone: "" });
  const [roomTouched, setRoomTouched] = useState(false);
  const [err, setErr] = useState<{ name?: string; phone?: string }>({});
  const [done, setDone] = useState<{ no: string; form: ConsultForm } | null>(null);
  // 병실 안내에서 고른 병실을 따라가다가, 여기서 직접 고르면 그 값을 쓴다
  const roomShown = roomTouched ? form.room : room;

  const toggle = (c: string) => setForm((f) => ({ ...f, conds: f.conds.includes(c) ? f.conds.filter((x) => x !== c) : [...f.conds, c] }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof err = {};
    if (form.name.trim().length < 2) next.name = "보호자 성함을 적어 주세요.";
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "휴대폰 번호를 확인해 주세요.";
    setErr(next);
    if (Object.keys(next).length) return;
    setDone({ no: `A${p2(today.getMonth() + 1)}${p2(today.getDate())}-${String(Date.now()).slice(-3)}`, form: { ...form, room: roomShown } });
  };

  const chip = (on: boolean) => ({ borderColor: on ? C.green : C.line, background: on ? C.green : C.card, color: on ? C.paper : C.ink, outlineColor: C.green });

  return (
    <section id="nh-consult" aria-labelledby="nh-consult-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionHead id="nh-consult-title" title="입원 상담 신청">
        <a href={`tel:${TEL.replace(/-/g, "")}`} className={`inline-flex items-center gap-1.5 text-[16px] font-bold ${focusRing}`} style={{ color: C.green, outlineColor: C.green }}>
          <Phone size={16} aria-hidden />
          {TEL}
        </a>
      </SectionHead>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="done" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : DUR }}>
              <Receipt
                title="입원 상담이 접수됐어요"
                rows={[
                  ["접수 번호", done.no],
                  ["환자", `${done.form.age}, ${done.form.conds.length ? done.form.conds.join(", ") : "상태 선택 안 함"}`],
                  ["희망", `${done.form.when}, ${ROOMS.find((r) => r.id === done.form.room)?.label}`],
                  ["보호자", `${maskName(done.form.name)}, ${maskPhone(done.form.phone)}`],
                ]}
                reply={`${fmtKo(nextWeekday(today))}까지 전화 드려요`}
                onReset={() => {
                  setDone(null);
                  setForm({ age: "80대", conds: [], when: "2주 안", room, name: "", phone: "" });
                  setRoomTouched(false);
                }}
              />
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} noValidate initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : DUR }} className="grid gap-5 rounded-[8px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
              <fieldset>
                <legend className="text-[15px] font-semibold">환자 나이</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {AGES.map((a) => (
                    <button key={a} type="button" aria-pressed={form.age === a} onClick={() => setForm({ ...form, age: a })} className={`rounded-[6px] border px-4 py-1.5 text-[15px] font-semibold ${focusRing}`} style={chip(form.age === a)}>
                      {a}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-[15px] font-semibold">지금 상태(여러 개 고를 수 있어요)</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => {
                    const on = form.conds.includes(c);
                    return (
                      <button key={c} type="button" aria-pressed={on} onClick={() => toggle(c)} className={`inline-flex items-center gap-1 rounded-[6px] border px-4 py-1.5 text-[15px] font-semibold ${focusRing}`} style={chip(on)}>
                        {on && <Check size={15} aria-hidden />}
                        {c}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="희망 입원 시기">
                  <select className={inputCls} style={inputStyle} value={form.when} onChange={(e) => setForm({ ...form, when: e.target.value })}>
                    {WHEN.map((w) => (
                      <option key={w}>{w}</option>
                    ))}
                  </select>
                </Field>
                <Field label="희망 병실">
                  <select
                    className={inputCls}
                    style={inputStyle}
                    value={roomShown}
                    onChange={(e) => {
                      setRoomTouched(true);
                      setForm({ ...form, room: e.target.value as RoomId });
                    }}
                  >
                    {ROOMS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="보호자 성함" error={err.name}>
                  <input className={inputCls} style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
                </Field>
                <Field label="휴대폰 번호" error={err.phone}>
                  <input className={inputCls} style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" />
                </Field>
              </div>
              <button type="submit" data-gtm-cta={`${SLUG}_consult_submit`} className={`rounded-[6px] py-3 text-[17px] font-semibold text-white ${focusRing}`} style={{ background: C.green, outlineColor: C.green }}>
                입원상담 신청
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="rounded-[8px] p-5 md:p-6" style={{ background: C.beige }}>
          <h3 className="text-[19px] font-bold" style={{ color: C.ink }}>
            입원 절차
          </h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-[1.6]">
            <li>상담 신청 또는 전화</li>
            <li>원무과 전화 상담, 병실과 입원일 확인</li>
            <li>서류 준비: 진료의뢰서 또는 소견서, 복용 중인 약과 처방전, 신분증</li>
            <li>입원 당일 원무과 접수 뒤 병동 안내</li>
          </ol>
          <p className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-semibold">
            <MessageCircle size={16} aria-hidden />
            {KAKAO}로도 받아요
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

function MapSection() {
  return (
    <section id="nh-map" aria-labelledby="nh-map-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionHead id="nh-map-title" title="오시는 길" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 480 260" className="h-auto w-full rounded-[8px]" role="img" aria-label="병원 주변 약도: 큰길과 지하철역 2번 출구에서 병원까지">
          <rect width="480" height="260" fill="#f2f2f0" />
          <rect x="0" y="150" width="480" height="34" fill="#ffffff" />
          <rect x="300" y="0" width="30" height="260" fill="#ffffff" />
          <rect x="40" y="40" width="110" height="80" rx="6" fill="#e3e3df" />
          <rect x="360" y="40" width="90" height="80" rx="6" fill="#e3e3df" />
          <rect x="190" y="200" width="90" height="46" rx="6" fill="#e3e3df" />
          <path d="M60 167 H300 V120" fill="none" stroke={C.green} strokeWidth="3" strokeDasharray="6 6" />
          <circle cx="60" cy="167" r="9" fill="#fff" stroke={C.green} strokeWidth="3" />
          <text x="44" y="200" fontSize="14" fontWeight="700" fill={C.ink}>
            ㅇㅇ역 2번 출구
          </text>
          <rect x="250" y="56" width="110" height="64" rx="6" fill={C.green} />
          <text x="305" y="94" fontSize="15" fontWeight="700" fill={C.paper} textAnchor="middle">
            곰파트너
          </text>
        </svg>
        <dl className="space-y-4 text-[16px]">
          <div>
            <dt className="inline-flex items-center gap-1.5 font-bold" style={{ color: C.green }}>
              <MapPin size={17} aria-hidden />
              주소
            </dt>
            <dd className="mt-1">{ADDRESS}</dd>
          </div>
          <div>
            <dt className="inline-flex items-center gap-1.5 font-bold" style={{ color: C.green }}>
              <Train size={17} aria-hidden />
              지하철
            </dt>
            <dd className="mt-1">ㅇㅇ역 2번 출구에서 걸어서 5분</dd>
          </div>
          <div>
            <dt className="inline-flex items-center gap-1.5 font-bold" style={{ color: C.green }}>
              <Car size={17} aria-hidden />
              주차
            </dt>
            <dd className="mt-1">건물 지하 주차장, 면회 시 2시간 무료</dd>
          </div>
          <div>
            <dt className="inline-flex items-center gap-1.5 font-bold" style={{ color: C.green }}>
              <Phone size={17} aria-hidden />
              대표전화
            </dt>
            <dd className="mt-1">{TEL}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
