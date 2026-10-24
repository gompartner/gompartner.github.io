"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { AlertCircle, CalendarCheck, Clock, MapPin, MessageCircle, Phone, ReceiptText, Search, Stethoscope, Users, X } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 정형외과 홈페이지 샘플: 가상의 정형외과 곰파트너. 동네 의원급, 원장 2명, 물리치료실과 도수치료실이 있다.
   병원명, 의료진, 주소, 전화번호, 진료비는 모두 가상이다.

   국내 동네 정형외과 사이트 공통 구성(참고): 메뉴는 병원소개, 진료과목(척추, 관절, 도수치료, 체외충격파, 물리치료),
   비급여 진료비 안내, 진료시간, 오시는 길, 공지사항. 첫 화면에는 진료시간 표(점심시간, 토요일 진료, 일요일 공휴일 휴진),
   전화 예약, 네이버 예약 버튼을 둔다. 비급여 항목은 "비급여 진료비 안내" 표로 공개하고 제증명 수수료도 같이 싣는다.
   의료법 광고 규칙 때문에 치료 효과 보장, 후기, 전후 사진, 할인 가격은 넣지 않는다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 부위별 증상 고르기: 몸 실루엣(얼굴 없음)에서 목, 어깨, 허리, 무릎을 누르고 증상을 고르면 먼저 하는 검사와 치료가 바뀐다.
      비급여 치료는 "비용 보기"로 아래 진료비 표 검색과 이어진다.
   2. 실시간 진료 대기: 진료실, 물리치료실, 도수치료실 대기 인원과 예상 시간. 몇 초마다 숫자가 굴러 바뀐다.
   3. 비급여 진료비 안내 표 검색: 분류 탭과 검색어로 거른다. 맞는 글자는 칠해 보인다.
   4. 예약: 날짜, 시간, 부위, 초진 재진, 이름, 휴대폰. 완료하면 접수 번호, 담당 창구, 회신 예정일을 보여 준다.

   사진 출처: AI 생성(Z-Image-Turbo, Apache 2.0)

   첫 화면(os-poster): 밝은 물리치료실 사진 한 장이 한 화면을 채우고, 왼쪽 흰 막 위에 문장 "척추, 관절 진료와 도수치료".
   들어오면 사진이 1.6초 동안 천천히 다가오고(1.06배에서 1배), 문장은 0.3초 늦게 아래에서 올라온다(CSS keyframes, JS 없이도 보인다).
   스크롤하면 사진만 조금 느리게 움직인다. 동작 줄이기면 전부 멈춘다.
   본문에서 움직이는 것은 실시간 대기 숫자가 굴러 바뀌는 것 하나다. */

const IMG = "/images/demo-orthopedics";
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
        <span className="text-[12px] font-semibold opacity-75">정형외과 샘플</span>
      </span>
    </span>
  );
}

const C = {
  white: "#ffffff",
  paper: "#f7f7f5",
  ink: "#111111",
  /** 강조색 하나. 차분한 남색 */
  blue: "#2b4170",
  /** 선택된 칩, 오늘 표시 같은 옅은 바탕 */
  sky: "#eef0f4",
  muted: "#4b4b4b",
  sub: "#767676",
  line: "#e5e5e5",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 첫 화면 사진이 다가오는 시간 */
const PHOTO_IN = 1.6;
/** 칩, 패널, 숫자 전환 */
const DUR = 0.32;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/* ---------- 부위별 증상 ---------- */

type PartId = "neck" | "shoulder" | "back" | "knee";
type Tx = "약물치료" | "물리치료" | "도수치료" | "체외충격파" | "주사치료" | "운동치료";

const TX_INFO: Record<Tx, { desc: string; fee?: string }> = {
  약물치료: { desc: "염증과 통증을 줄이는 약을 처방해요." },
  물리치료: { desc: "온열, 전기, 견인 치료를 20분 안팎 받아요. 건강보험 적용." },
  도수치료: { desc: "치료사가 손으로 근육과 관절을 풀어요. 1회 30분, 비급여.", fee: "도수" },
  체외충격파: { desc: "힘줄이 붙은 자리에 충격파를 보내요. 1회 15분 안팎, 비급여.", fee: "충격파" },
  주사치료: { desc: "초음파로 자리를 보면서 아픈 곳에 주사해요.", fee: "주사" },
  운동치료: { desc: "치료사와 같이 근력과 자세 운동을 해요. 비급여.", fee: "운동" },
};

interface Symptom {
  label: string;
  exams: string[];
  tx: Tx[];
}
interface Part {
  id: PartId;
  name: string;
  /** 몸 그림 viewBox(200x400) 안의 자리 */
  at: [number, number];
  often: string;
  symptoms: Symptom[];
}

const PARTS: Part[] = [
  {
    id: "neck",
    name: "목",
    at: [103, 67],
    often: "거북목 증후군, 목 디스크, 근막통증 증후군",
    symptoms: [
      { label: "뒷목이 뻐근하고 고개 돌리기 힘들어요", exams: ["X-ray"], tx: ["물리치료", "도수치료", "약물치료"] },
      { label: "어깨에서 손끝까지 저려요", exams: ["X-ray", "필요하면 MRI 협력 병원 의뢰"], tx: ["약물치료", "주사치료", "물리치료"] },
      { label: "오래 앉아 있으면 두통이 와요", exams: ["X-ray", "자세 검사"], tx: ["도수치료", "운동치료", "물리치료"] },
    ],
  },
  {
    id: "shoulder",
    name: "어깨",
    at: [140, 93],
    often: "오십견, 회전근개 질환, 석회성 건염",
    symptoms: [
      { label: "팔이 머리 위로 안 올라가요", exams: ["X-ray", "근골격계 초음파"], tx: ["도수치료", "주사치료", "운동치료"] },
      { label: "밤에 누우면 더 아파요", exams: ["X-ray", "근골격계 초음파"], tx: ["체외충격파", "주사치료", "약물치료"] },
      { label: "팔 돌릴 때 걸리는 느낌이 있어요", exams: ["근골격계 초음파"], tx: ["체외충격파", "운동치료", "물리치료"] },
    ],
  },
  {
    id: "back",
    name: "허리",
    at: [103, 193],
    often: "요추 염좌, 허리 디스크, 척추관 협착증",
    symptoms: [
      { label: "물건 들다가 삐끗했어요", exams: ["X-ray"], tx: ["약물치료", "물리치료", "주사치료"] },
      { label: "엉덩이와 다리가 당기고 저려요", exams: ["X-ray", "필요하면 MRI 협력 병원 의뢰"], tx: ["주사치료", "약물치료", "도수치료"] },
      { label: "오래 서 있으면 다리가 무거워요", exams: ["X-ray"], tx: ["도수치료", "운동치료", "물리치료"] },
    ],
  },
  {
    id: "knee",
    name: "무릎",
    at: [87, 300],
    often: "퇴행성 관절염, 반월상 연골 손상, 슬개건염",
    symptoms: [
      { label: "계단 내려갈 때 시큰해요", exams: ["X-ray", "근골격계 초음파"], tx: ["주사치료", "운동치료", "물리치료"] },
      { label: "무릎이 붓고 물이 찬 것 같아요", exams: ["X-ray", "근골격계 초음파"], tx: ["주사치료", "약물치료", "물리치료"] },
      { label: "뛰고 나면 무릎 앞이 아파요", exams: ["근골격계 초음파"], tx: ["체외충격파", "운동치료", "도수치료"] },
    ],
  },
];
const partById = (id: PartId) => PARTS.find((p) => p.id === id) ?? PARTS[0];

/* ---------- 실시간 대기 ---------- */

const ROOMS = [
  { id: "r1", name: "1진료실", who: "김ㅎ늘 원장", start: 4, per: 6 },
  { id: "r2", name: "2진료실", who: "박ㅈ원 원장", start: 2, per: 6 },
  { id: "pt", name: "물리치료실", who: "치료사 4명", start: 6, per: 5 },
  { id: "mt", name: "도수치료실", who: "예약제", start: 1, per: 30 },
] as const;
type RoomId = (typeof ROOMS)[number]["id"];

/* ---------- 비급여 진료비 ---------- */

type FeeCat = "치료" | "주사" | "검사" | "보조기" | "제증명";
const FEE_CATS: ("전체" | FeeCat)[] = ["전체", "치료", "주사", "검사", "보조기", "제증명"];
interface Fee {
  cat: FeeCat;
  name: string;
  unit: string;
  price: number;
  note?: string;
  /** 검색에 같이 걸리는 다른 이름 */
  alias?: string;
}
const FEES: Fee[] = [
  { cat: "치료", name: "도수치료", unit: "1회 30분", price: 80000, note: "치료사 1명 전담", alias: "도수 수기치료" },
  { cat: "치료", name: "도수치료", unit: "1회 50분", price: 120000, note: "치료사 1명 전담", alias: "도수 수기치료" },
  { cat: "치료", name: "체외충격파 치료", unit: "1회", price: 70000, note: "부위당", alias: "충격파 ESWT" },
  { cat: "치료", name: "운동치료", unit: "1회 30분", price: 50000, alias: "재활 운동" },
  { cat: "치료", name: "키네시오 테이핑", unit: "1부위", price: 10000, alias: "테이프" },
  { cat: "주사", name: "증식치료(프롤로 주사)", unit: "1부위", price: 50000, alias: "주사 프롤로" },
  { cat: "주사", name: "콜라겐 주사", unit: "1회", price: 100000, alias: "주사" },
  { cat: "검사", name: "근골격계 초음파", unit: "1부위", price: 60000, note: "급여 기준 외", alias: "초음파" },
  { cat: "검사", name: "체성분 검사", unit: "1회", price: 10000, alias: "인바디" },
  { cat: "보조기", name: "손목 보조기", unit: "1개", price: 30000 },
  { cat: "보조기", name: "무릎 보조기", unit: "1개", price: 60000 },
  { cat: "보조기", name: "허리 보조기", unit: "1개", price: 90000 },
  { cat: "제증명", name: "일반 진단서", unit: "1통", price: 20000 },
  { cat: "제증명", name: "상해진단서(3주 미만)", unit: "1통", price: 100000 },
  { cat: "제증명", name: "상해진단서(3주 이상)", unit: "1통", price: 150000 },
  { cat: "제증명", name: "진료확인서", unit: "1통", price: 3000 },
  { cat: "제증명", name: "진료기록 사본(1~5매)", unit: "1매", price: 1000 },
  { cat: "제증명", name: "진료기록 사본(6매부터)", unit: "1매", price: 100 },
  { cat: "제증명", name: "영상 기록 CD 복사", unit: "1장", price: 10000, alias: "엑스레이 X-ray" },
];

/* ---------- 진료시간과 예약 ---------- */

const HOURS: { dow: number; label: string; time: string; note: string }[] = [
  { dow: 1, label: "월", time: "09:00 ~ 19:00", note: "점심시간 13:00 ~ 14:00" },
  { dow: 2, label: "화", time: "09:00 ~ 19:00", note: "점심시간 13:00 ~ 14:00" },
  { dow: 3, label: "수", time: "09:00 ~ 19:00", note: "점심시간 13:00 ~ 14:00" },
  { dow: 4, label: "목", time: "09:00 ~ 19:00", note: "점심시간 13:00 ~ 14:00" },
  { dow: 5, label: "금", time: "09:00 ~ 19:00", note: "점심시간 13:00 ~ 14:00" },
  { dow: 6, label: "토", time: "09:00 ~ 14:00", note: "점심시간 없이 진료" },
  { dow: 0, label: "일", time: "휴진", note: "공휴일 휴진" },
];

/** 그 요일 예약 칸. 평일은 점심시간을 빼고 18:30까지, 토요일은 13:30까지 */
function slotsFor(d: Date) {
  const dow = d.getDay();
  if (dow === 0) return [];
  const end = dow === 6 ? 13 * 60 + 30 : 18 * 60 + 30;
  const out: string[] = [];
  for (let m = 9 * 60; m <= end; m += 30) {
    if (dow !== 6 && m >= 13 * 60 && m < 14 * 60) continue;
    out.push(`${p2(Math.floor(m / 60))}:${p2(m % 60)}`);
  }
  return out;
}

/** 이미 찬 칸. 실제로는 예약 프로그램에서 읽는다. 같은 날짜면 항상 같은 결과 */
function isTaken(d: Date, slot: string) {
  let h = d.getDate() * 2654435761 + d.getMonth() * 97 + slot.charCodeAt(1) * 131 + slot.charCodeAt(3) * 7919;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 100;
  // 오전 첫 시간과 토요일이 먼저 찬다
  const busy = slot < "10:30" || d.getDay() === 6 ? 25 : 0;
  return h < 28 + busy;
}

/** 내일부터 일요일을 빼고 6일 */
function bookDays(today: Date) {
  const out: Date[] = [];
  let n = 1;
  while (out.length < 6) {
    const d = daysAgo(today, -n);
    if (d.getDay() !== 0) out.push(d);
    n++;
  }
  return out;
}

const nextOpenDay = (d: Date) => {
  let n = daysAgo(d, -1);
  while (n.getDay() === 0) n = daysAgo(n, -1);
  return n;
};

export function OrthopedicsDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [part, setPart] = useState<PartId>("back");
  const [feeQuery, setFeeQuery] = useState("");
  const [feeCat, setFeeCat] = useState<"전체" | FeeCat>("전체");

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const showFee = (q: string) => {
    setFeeCat("전체");
    setFeeQuery(q);
    go("os-fees");
  };

  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] font-medium hover:underline underline-offset-4 ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip pb-24" style={{ background: C.white, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("os-reserve")} />

      <header className="sticky top-0 z-30 border-b bg-white/95" style={{ borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 md:px-6">
          <h2 className="leading-none">
            <SampleLogo />
          </h2>
          <nav aria-label="주요 메뉴" className="-mx-2 hidden flex-wrap items-center md:flex">
            {[
              ["os-parts", "진료과목"],
              ["os-wait", "실시간 대기"],
              ["os-fees", "비급여 진료비"],
              ["os-hours", "진료시간"],
              ["os-visit", "오시는 길"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.blue }}>
                {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={`tel:${TEL.replace(/-/g, "")}`} aria-label={`전화 ${TEL}`} className={`inline-flex h-10 w-10 items-center justify-center rounded-[6px] border ${focusRing}`} style={{ borderColor: C.line, color: C.blue, outlineColor: C.blue }}>
              <Phone size={18} aria-hidden />
            </a>
            <button
              type="button"
              onClick={() => go("os-reserve")}
              data-gtm-cta="orthopedics_header_reserve"
              className={`inline-flex h-10 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold text-white ${focusRing}`}
              style={{ background: C.blue, outlineColor: C.blue }}
            >
              <CalendarCheck size={17} aria-hidden />
              예약하기
            </button>
          </div>
        </div>
      </header>

      {/* 1. 부위별 증상 */}
      <section id="os-parts" aria-labelledby="os-parts-title" className="mx-auto max-w-[1200px] scroll-mt-20 px-4 pt-14 md:px-6 md:pt-20">
        <SectionTitle id="os-parts-title" icon={<Stethoscope size={22} aria-hidden />} title="어디가 아프세요" />
        <PartPicker reduce={reduce} part={part} setPart={setPart} onFee={showFee} />
      </section>

      {/* 2. 실시간 대기 */}
      <section id="os-wait" aria-labelledby="os-wait-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-20 px-4 md:mt-24 md:px-6">
        <SectionTitle id="os-wait-title" icon={<Users size={22} aria-hidden />} title="실시간 진료 대기" />
        <WaitBoard reduce={reduce} today={today} />
      </section>

      {/* 3. 비급여 진료비 */}
      <section id="os-fees" aria-labelledby="os-fees-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-20 px-4 md:mt-24 md:px-6">
        <SectionTitle id="os-fees-title" icon={<ReceiptText size={22} aria-hidden />} title="비급여 진료비 안내" />
        <FeeTable reduce={reduce} today={today} query={feeQuery} setQuery={setFeeQuery} cat={feeCat} setCat={setFeeCat} />
      </section>

      {/* 4. 예약과 진료시간 */}
      <div className="mx-auto mt-16 grid max-w-[1200px] gap-12 px-4 md:mt-24 md:px-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14">
        <section id="os-reserve" aria-labelledby="os-reserve-title" className="scroll-mt-20">
          <SectionTitle id="os-reserve-title" icon={<CalendarCheck size={22} aria-hidden />} title="진료 예약" />
          <Reserve reduce={reduce} today={today} part={part} />
        </section>
        <section id="os-hours" aria-labelledby="os-hours-title" className="scroll-mt-20">
          <SectionTitle id="os-hours-title" icon={<Clock size={22} aria-hidden />} title="진료시간" />
          <Hours today={today} />
        </section>
      </div>

      {/* 오시는 길 */}
      <section id="os-visit" aria-labelledby="os-visit-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-20 px-4 md:mt-24 md:px-6">
        <SectionTitle id="os-visit-title" icon={<MapPin size={22} aria-hidden />} title="오시는 길" />
        <Visit />
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ borderColor: C.line, color: C.muted }}>
        <p>
          <SampleLogo />
        </p>
        <p>
          {ADDRESS} / 대표전화 {TEL} / {KAKAO}
        </p>
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

function SectionTitle({ id, icon, title }: { id: string; icon: React.ReactNode; title: string }) {
  return (
    <h2 id={id} className="flex items-center gap-2.5 border-b pb-3 text-[26px] font-bold tracking-[-0.03em] md:text-[32px]" style={{ borderColor: C.line, color: C.ink }}>
      <span style={{ color: C.blue }}>{icon}</span>
      {title}
    </h2>
  );
}

/* ---------- 포스터 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // 스크롤하면 사진만 조금 느리게 내려간다
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  return (
    <section id="os-poster" ref={ref} aria-labelledby="os-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: C.paper, color: C.ink }}>
      <style>{`@keyframes os-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.os-rise{animation:os-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both}@media (prefers-reduced-motion: reduce){.os-rise{animation:none}}`}</style>
      <motion.div className="absolute inset-x-0 top-[-10%] h-[110%]" style={{ y: photoY }}>
        <motion.div className="h-full w-full" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : PHOTO_IN, ease: EASE }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="창가 옆에 흰 치료 침대 두 대가 놓인 밝은 물리치료실"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "62% 55%" }}
          />
        </motion.div>
      </motion.div>
      {/* 글자 대비를 위한 흰 막. 휴대폰은 아래쪽, PC는 왼쪽 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 md:hidden" style={{ background: "linear-gradient(to top, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.86) 38%, rgba(255,255,255,0.2) 64%, rgba(255,255,255,0.1) 82%, rgba(255,255,255,0.7) 100%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block" style={{ background: "linear-gradient(to right, rgba(255,255,255,0.93) 0%, rgba(255,255,255,0.82) 34%, rgba(255,255,255,0.25) 60%, rgba(255,255,255,0) 75%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 hidden h-28 md:block" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0))" }} />

      <div className="relative z-[1] flex items-center justify-between gap-3 px-4 pt-4 md:px-12 md:pt-7">
        <p className="leading-none">
          <SampleLogo small />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta="orthopedics_poster_cta"
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold text-white ${focusRing}`}
          style={{ background: C.blue, outlineColor: C.blue }}
        >
          <CalendarCheck size={17} aria-hidden />
          예약하기
        </button>
      </div>

      <div className={`relative z-[1] mt-auto px-4 pb-14 md:my-auto md:px-12 md:pb-0 ${reduce ? "" : "os-rise"}`}>
        <h1
          id="os-poster-title"
          className="max-w-[9em] text-[38px] font-bold md:text-[clamp(40px,5vw,72px)]"
          style={{ letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all", color: C.ink }}
        >
          척추, 관절 진료와
          <br />
          도수치료
        </h1>
        <p className="mt-4 text-[16px] md:mt-6 md:text-[18px] tabular-nums" style={{ color: C.muted }}>
          토요일 09:00 ~ 14:00, 점심시간 없이
        </p>
      </div>
    </section>
  );
}

/* ---------- 1. 부위별 증상 ---------- */

function PartPicker({ reduce, part, setPart, onFee }: { reduce: boolean; part: PartId; setPart: (p: PartId) => void; onFee: (q: string) => void }) {
  const [sym, setSym] = useState(0);
  const cur = partById(part);
  const s = cur.symptoms[Math.min(sym, cur.symptoms.length - 1)];
  const t = { duration: reduce ? 0 : DUR, ease: EASE };

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-[260px_minmax(0,1fr)] md:gap-12">
      {/* 뒤에서 본 사람 사진 위에 부위 버튼 */}
      <div className="relative mx-auto w-[220px] md:w-[260px]">
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
        <img src={`${IMG}/body.jpg`} alt="" className="block aspect-[1/2] h-auto w-full rounded-[8px] object-cover" />
        <svg viewBox="0 0 200 400" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <radialGradient id="os-fig-glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={C.blue} stopOpacity="0.45" />
              <stop offset="1" stopColor={C.blue} stopOpacity="0" />
            </radialGradient>
          </defs>
          <motion.circle r="34" fill="url(#os-fig-glow)" initial={{ cx: cur.at[0], cy: cur.at[1] }} animate={{ cx: cur.at[0], cy: cur.at[1] }} transition={t} />
        </svg>
        {PARTS.map((pt) => {
          const on = pt.id === part;
          return (
            <button
              key={pt.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setPart(pt.id);
                setSym(0);
              }}
              className={`absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-[6px] border py-1 pl-1.5 pr-3 text-[15px] font-semibold ${focusRing}`}
              style={{
                left: `${(pt.at[0] / 200) * 100}%`,
                top: `${(pt.at[1] / 400) * 100}%`,
                background: on ? C.blue : C.white,
                color: on ? C.white : C.blue,
                borderColor: C.blue,
                outlineColor: C.blue,
              }}
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full border" style={{ borderColor: on ? C.white : C.blue, background: on ? C.white : "transparent" }} aria-hidden />
              {pt.name}
            </button>
          );
        })}
      </div>

      <div className="min-w-0">
        <p className="text-[15px] font-semibold" style={{ color: C.sub }}>
          {cur.name} 증상
        </p>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={`${cur.name} 증상 고르기`}>
          {cur.symptoms.map((x, k) => {
            const on = k === sym;
            return (
              <button
                key={x.label}
                type="button"
                aria-pressed={on}
                onClick={() => setSym(k)}
                className={`rounded-[6px] border px-3.5 py-2 text-left text-[15px] ${focusRing}`}
                style={{ borderColor: on ? C.blue : C.line, background: on ? C.sky : C.white, color: C.ink, fontWeight: on ? 600 : 500, outlineColor: C.blue }}
              >
                {x.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={`${part}-${sym}`} initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={reduce ? undefined : { clipPath: "inset(100% 0 0 0)" }} transition={t} className="mt-7">
            <dl className="grid gap-x-6 gap-y-3 border-y py-5 text-[16px] sm:grid-cols-[120px_minmax(0,1fr)]" style={{ borderColor: C.line }}>
              <dt className="font-bold" style={{ color: C.muted }}>
                자주 보는 질환
              </dt>
              <dd>{cur.often}</dd>
              <dt className="font-bold" style={{ color: C.muted }}>
                먼저 하는 검사
              </dt>
              <dd className="flex flex-wrap gap-2">
                {s.exams.map((e) => (
                  <span key={e} className="rounded-[4px] px-2 py-0.5 text-[15px] font-medium" style={{ background: C.paper, color: C.blue }}>
                    {e}
                  </span>
                ))}
              </dd>
            </dl>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {s.tx.map((name) => {
                const info = TX_INFO[name];
                return (
                  <li key={name} className="flex flex-col rounded-[8px] border p-4" style={{ borderColor: C.line }}>
                    <p className="text-[17px] font-bold" style={{ color: C.ink }}>
                      {name}
                    </p>
                    <p className="mt-1.5 flex-1 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
                      {info.desc}
                    </p>
                    {info.fee && (
                      <button
                        type="button"
                        onClick={() => onFee(info.fee!)}
                        className={`mt-3 inline-flex items-center gap-1 self-start rounded-[4px] text-[14px] font-bold underline underline-offset-4 ${focusRing}`}
                        style={{ color: C.blue, outlineColor: C.blue }}
                      >
                        <ReceiptText size={15} aria-hidden />
                        비용 보기
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
              치료 방법은 진료 후 상태에 따라 정해요.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- 2. 실시간 대기 ---------- */

function WaitBoard({ reduce, today }: { reduce: boolean; today: Date }) {
  const [counts, setCounts] = useState<Record<RoomId, number>>(() => Object.fromEntries(ROOMS.map((r) => [r.id, r.start])) as Record<RoomId, number>);
  const [clock, setClock] = useState<string | null>(null);

  // 샘플이라 몇 초마다 한 곳씩 바뀐다. 실제로는 접수 프로그램의 대기 명단을 읽는다.
  useEffect(() => {
    const stamp = () => {
      const d = new Date();
      setClock(`${p2(d.getHours())}:${p2(d.getMinutes())}`);
    };
    stamp();
    const id = window.setInterval(() => {
      stamp();
      setCounts((c) => {
        const r = ROOMS[Math.floor(Math.random() * ROOMS.length)];
        const cap = r.id === "mt" ? 3 : r.id === "pt" ? 9 : 7;
        const d = c[r.id] <= 1 ? 1 : c[r.id] >= cap ? -1 : Math.random() < 0.5 ? -1 : 1;
        return { ...c, [r.id]: c[r.id] + d };
      });
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  const dow = today.getDay();
  const close = dow === 6 ? "13:30" : dow === 0 ? null : "18:30";

  return (
    <div className="mt-8 overflow-hidden rounded-[8px] border" style={{ background: C.white, borderColor: C.line, color: C.ink }}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b px-5 py-3.5 text-[15px] md:px-7" style={{ borderColor: C.line, background: C.paper }}>
        <p className="font-bold">
          <span className="tabular-nums">{clock ?? "--:--"}</span> 기준
        </p>
        <p style={{ color: C.muted }}>{close ? `오늘 접수 마감 ${close}` : "오늘은 휴진이에요"}</p>
      </div>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-4">
        {ROOMS.map((r, k) => {
          const n = counts[r.id];
          return (
            <li key={r.id} className={`px-5 py-6 md:px-7 ${k > 0 ? "border-t sm:border-t-0" : ""} ${k % 2 === 1 ? "sm:border-l" : ""} ${k >= 2 ? "sm:border-t lg:border-t-0" : ""} ${k > 0 ? "lg:border-l" : ""}`} style={{ borderColor: C.line }}>
              <p className="text-[17px] font-bold">{r.name}</p>
              <p className="mt-0.5 text-[14px]" style={{ color: C.sub }}>
                {r.who}
              </p>
              <p className="mt-4 flex items-end gap-1.5" aria-live="polite">
                <span className="relative inline-flex h-[64px] overflow-hidden text-[60px] font-semibold leading-[64px] tabular-nums">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={n} initial={reduce ? false : { y: "100%" }} animate={{ y: "0%" }} exit={reduce ? undefined : { y: "-100%" }} transition={{ duration: reduce ? 0 : DUR, ease: EASE }} className="block">
                      {n}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className="pb-2 text-[18px] font-bold">명 대기</span>
              </p>
              <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
                예상 <span className="tabular-nums">{n * r.per}</span>분
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- 3. 비급여 진료비 ---------- */

function Mark({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const at = text.toLowerCase().indexOf(q.toLowerCase());
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded-[2px] px-0.5" style={{ background: "#e3e8f2", color: C.ink }}>
        {text.slice(at, at + q.length)}
      </mark>
      {text.slice(at + q.length)}
    </>
  );
}

function FeeTable({
  reduce,
  today,
  query,
  setQuery,
  cat,
  setCat,
}: {
  reduce: boolean;
  today: Date;
  query: string;
  setQuery: (q: string) => void;
  cat: "전체" | FeeCat;
  setCat: (c: "전체" | FeeCat) => void;
}) {
  const q = query.trim();
  const rows = useMemo(
    () =>
      FEES.filter((f) => (cat === "전체" || f.cat === cat) && (!q || `${f.name} ${f.alias ?? ""} ${f.cat}`.toLowerCase().includes(q.toLowerCase()))),
    [cat, q],
  );
  const since = new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="-mx-1 flex flex-wrap gap-1.5" role="group" aria-label="분류">
          {FEE_CATS.map((c) => {
            const on = c === cat;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setCat(c)}
                className={`rounded-[6px] border px-3.5 py-1.5 text-[15px] ${focusRing}`}
                style={{ borderColor: on ? C.blue : C.line, background: on ? C.blue : C.white, color: on ? C.white : C.ink, fontWeight: on ? 600 : 500, outlineColor: C.blue }}
              >
                {c}
              </button>
            );
          })}
        </div>
        <label className="relative block md:w-[320px]">
          <span className="sr-only">진료비 항목 검색</span>
          <Search size={18} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="도수치료, 진단서, 초음파"
            className={`h-12 w-full rounded-[8px] border pl-10 pr-10 text-[16px] ${focusRing}`}
            style={{ borderColor: C.line, outlineColor: C.blue, color: C.ink }}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="검색어 지우기" className={`absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full ${focusRing}`} style={{ color: C.muted, outlineColor: C.blue }}>
              <X size={16} aria-hidden />
            </button>
          )}
        </label>
      </div>

      <div className="mt-5 overflow-hidden rounded-[8px] border" style={{ borderColor: C.line }}>
        <table className="w-full border-collapse text-left text-[15px] md:text-[16px]">
          <caption className="sr-only">비급여 진료비 안내, {rows.length}개 항목</caption>
          <thead style={{ background: C.paper }}>
            <tr>
              <th scope="col" className="hidden px-4 py-3 font-bold sm:table-cell" style={{ color: C.muted }}>
                분류
              </th>
              <th scope="col" className="px-4 py-3 font-bold" style={{ color: C.muted }}>
                항목
              </th>
              <th scope="col" className="hidden px-4 py-3 font-bold md:table-cell" style={{ color: C.muted }}>
                기준
              </th>
              <th scope="col" className="px-4 py-3 text-right font-bold" style={{ color: C.muted }}>
                비용
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((f) => (
                <motion.tr
                  key={`${f.name}-${f.unit}`}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: reduce ? 0 : 0.2 }}
                  className="border-t"
                  style={{ borderColor: C.line }}
                >
                  <td className="hidden px-4 py-3 sm:table-cell" style={{ color: C.muted }}>
                    {f.cat}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold">
                      <Mark text={f.name} q={q} />
                    </span>
                    <span className="block text-[14px] md:hidden" style={{ color: C.muted }}>
                      {f.unit}
                      {f.note ? `, ${f.note}` : ""}
                    </span>
                    {f.note && (
                      <span className="hidden text-[14px] md:block" style={{ color: C.muted }}>
                        {f.note}
                      </span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">{f.unit}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums" style={{ color: C.ink }}>
                    {won(f.price)}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="border-t px-4 py-8 text-center text-[16px]" style={{ borderColor: C.line, color: C.muted }}>
            &quot;{q}&quot; 항목이 없어요. 전화 {TEL}로 물어봐 주세요.
          </p>
        )}
      </div>
      <p className="mt-3 text-[14px] leading-[1.7]" style={{ color: C.muted }}>
        {fmtDot(since)} 기준. 급여 항목과 MRI는 보험 기준에 따라 달라 접수 창구에서 안내해 드려요.
      </p>
    </div>
  );
}

/* ---------- 4. 예약 ---------- */

type VisitKind = "초진" | "재진";
interface Done {
  no: string;
  date: Date;
  slot: string;
  part: string;
  visit: VisitKind;
  name: string;
  phone: string;
}

function Reserve({ reduce, today, part }: { reduce: boolean; today: Date; part: PartId }) {
  const days = useMemo(() => bookDays(today), [today]);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [where, setWhere] = useState<string>(partById(part).name);
  const [visit, setVisit] = useState<VisitKind>("초진");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  // 위에서 부위를 고르면 예약 부위도 따라간다
  const [lastPart, setLastPart] = useState(part);
  if (lastPart !== part) {
    setLastPart(part);
    setWhere(partById(part).name);
  }

  const day = days[Math.min(dayIdx, days.length - 1)];
  const slots = slotsFor(day);
  const digits = phone.replace(/\D/g, "");
  const errs = {
    slot: !slot ? "시간을 골라 주세요" : "",
    name: name.trim().length < 2 ? "이름을 2글자 이상 적어 주세요" : "",
    phone: digits.length < 10 || digits.length > 11 ? "휴대폰 번호를 확인해 주세요" : "",
    agree: !agree ? "개인정보 수집에 동의해 주세요" : "",
  };
  const ok = !errs.slot && !errs.name && !errs.phone && !errs.agree;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok || !slot) return;
    const yy = String(today.getFullYear()).slice(2);
    setDone({
      no: `OS-${yy}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${String(100 + ((digits.charCodeAt(digits.length - 1) * 37 + slot.charCodeAt(1) * 11) % 900))}`,
      date: day,
      slot,
      part: where,
      visit,
      name,
      phone,
    });
  };

  const reset = () => {
    setDone(null);
    setSlot(null);
    setName("");
    setPhone("");
    setAgree(false);
    setTried(false);
  };

  const field = `h-12 w-full rounded-[8px] border px-3.5 text-[16px] ${focusRing}`;
  const err = (m: string) =>
    tried && m ? (
      <span className="mt-1.5 inline-flex items-center gap-1 text-[14px] font-medium" style={{ color: C.error }}>
        <AlertCircle size={15} aria-hidden />
        {m}
      </span>
    ) : null;

  if (done) {
    return (
      <motion.div
        initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
        className="mt-8 rounded-[8px] border p-6 md:p-8"
        style={{ borderColor: C.blue }}
        role="status"
      >
        <p className="text-[15px] font-semibold" style={{ color: C.blue }}>
          예약 신청이 접수됐어요
        </p>
        <p className="mt-1 text-[30px] font-bold tracking-[-0.02em] tabular-nums" style={{ color: C.ink }}>
          {done.no}
        </p>
        <dl className="mt-5 grid gap-x-6 gap-y-2.5 border-t pt-5 text-[16px] sm:grid-cols-[110px_minmax(0,1fr)]" style={{ borderColor: C.line }}>
          <dt className="font-bold" style={{ color: C.muted }}>
            희망 일시
          </dt>
          <dd>
            {fmtKo(done.date)} {done.slot}
          </dd>
          <dt className="font-bold" style={{ color: C.muted }}>
            진료 부위
          </dt>
          <dd>
            {done.part}, {done.visit}
          </dd>
          <dt className="font-bold" style={{ color: C.muted }}>
            예약자
          </dt>
          <dd>
            {maskName(done.name)} / {maskPhone(done.phone)}
          </dd>
          <dt className="font-bold" style={{ color: C.muted }}>
            담당 창구
          </dt>
          <dd>
            접수 데스크, 전화 {TEL} 또는 {KAKAO}
          </dd>
          <dt className="font-bold" style={{ color: C.muted }}>
            확정 문자
          </dt>
          <dd>{fmtKo(nextOpenDay(today))} 오전 중에 보내 드려요</dd>
        </dl>
        <p className="mt-5 text-[15px]" style={{ color: C.muted }}>
          초진이면 신분증을 챙겨 10분 먼저 와 주세요.
        </p>
        <button type="button" onClick={reset} className={`mt-6 rounded-[6px] border px-5 py-2.5 text-[15px] font-semibold ${focusRing}`} style={{ borderColor: C.blue, color: C.blue, outlineColor: C.blue }}>
          다른 날짜로 예약하기
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8 grid gap-6">
      <fieldset>
        <legend className="text-[16px] font-bold">날짜</legend>
        <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {days.map((d, k) => {
            const on = k === dayIdx;
            const sat = d.getDay() === 6;
            return (
              <button
                key={d.toISOString()}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setDayIdx(k);
                  setSlot(null);
                }}
                className={`rounded-[8px] border px-2 py-2.5 text-center ${focusRing}`}
                style={{ borderColor: on ? C.blue : C.line, background: on ? C.blue : C.white, color: on ? C.white : C.ink, outlineColor: C.blue }}
              >
                <span className="block text-[13px]" style={{ opacity: 0.85 }}>
                  {["일", "월", "화", "수", "목", "금", "토"][d.getDay()]}
                  {sat ? " ~14시" : ""}
                </span>
                <span className="block text-[18px] font-bold tabular-nums">
                  {d.getMonth() + 1}.{d.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[16px] font-bold">시간</legend>
        <div className="mt-2.5 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
          {slots.map((sl) => {
            const taken = isTaken(day, sl);
            const on = sl === slot;
            return (
              <button
                key={sl}
                type="button"
                disabled={taken}
                aria-pressed={on}
                aria-label={taken ? `${sl} 마감` : sl}
                onClick={() => setSlot(sl)}
                className={`h-11 rounded-[6px] border text-[15px] tabular-nums disabled:cursor-not-allowed ${focusRing}`}
                style={{
                  borderColor: on ? C.blue : C.line,
                  background: on ? C.blue : taken ? C.paper : C.white,
                  color: on ? C.white : taken ? C.sub : C.ink,
                  textDecoration: taken ? "line-through" : undefined,
                  outlineColor: C.blue,
                }}
              >
                {sl}
              </button>
            );
          })}
        </div>
        {err(errs.slot)}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[16px] font-bold">진료 부위</span>
          <select value={where} onChange={(e) => setWhere(e.target.value)} className={`${field} mt-2 bg-white`} style={{ borderColor: C.line, outlineColor: C.blue }}>
            {[...PARTS.map((x) => x.name), "손목, 손", "발목, 발", "기타"].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="text-[16px] font-bold">진료 구분</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["초진", "재진"] as VisitKind[]).map((v) => (
              <label key={v} className="relative">
                <input type="radio" name="os-visit" value={v} checked={visit === v} onChange={() => setVisit(v)} className="peer sr-only" />
                <span
                  className="flex h-12 cursor-pointer items-center justify-center rounded-[8px] border text-[16px] peer-checked:font-bold peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2"
                  style={{ borderColor: visit === v ? C.blue : C.line, background: visit === v ? C.sky : C.white, outlineColor: C.blue }}
                >
                  {v}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[16px] font-bold">이름</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={`${field} mt-2`} style={{ borderColor: tried && errs.name ? C.error : C.line, outlineColor: C.blue }} />
          {err(errs.name)}
        </label>
        <label className="block">
          <span className="text-[16px] font-bold">휴대폰</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={`${field} mt-2`} style={{ borderColor: tried && errs.phone ? C.error : C.line, outlineColor: C.blue }} />
          {err(errs.phone)}
        </label>
      </div>

      <div>
        <label className="inline-flex cursor-pointer items-start gap-2.5 text-[15px]">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`mt-0.5 h-5 w-5 flex-none accent-[#2b4170] ${focusRing}`} style={{ outlineColor: C.blue }} />
          <span>예약 안내를 위한 개인정보(이름, 휴대폰) 수집에 동의합니다. 진료가 끝나면 1년 뒤 지워요.</span>
        </label>
        <div>{err(errs.agree)}</div>
      </div>

      <button
        type="submit"
        data-gtm-cta="orthopedics_reserve"
        className={`inline-flex h-14 items-center justify-center gap-2 rounded-[6px] text-[17px] font-semibold text-white ${focusRing}`}
        style={{ background: C.blue, outlineColor: C.blue }}
      >
        <CalendarCheck size={20} aria-hidden />
        {slot ? `${fmtKo(day)} ${slot} 예약하기` : "예약하기"}
      </button>
      <p className="-mt-2 text-[14px]" style={{ color: C.muted }}>
        당일 예약은 전화 {TEL}로 받아요.
      </p>
    </form>
  );
}

/* ---------- 진료시간 ---------- */

function Hours({ today }: { today: Date }) {
  const dow = today.getDay();
  return (
    <div className="mt-8">
      <table className="w-full border-collapse text-[16px]">
        <caption className="sr-only">요일별 진료시간</caption>
        <tbody>
          {HOURS.map((h) => {
            const isToday = h.dow === dow;
            const sat = h.dow === 6;
            return (
              <tr key={h.dow} className="border-b" style={{ borderColor: C.line, background: sat ? C.sky : undefined }}>
                <th scope="row" className="w-[64px] px-3 py-3 text-left font-bold" style={{ color: h.dow === 0 ? C.muted : C.blue }}>
                  {h.label}
                  {isToday && (
                    <span className="ml-1.5 rounded-[3px] px-1 py-px text-[12px] font-bold text-white" style={{ background: C.blue }}>
                      오늘
                    </span>
                  )}
                </th>
                <td className="px-3 py-3 tabular-nums" style={{ fontWeight: isToday ? 700 : 500 }}>
                  {h.time}
                </td>
                <td className="px-3 py-3 text-right text-[14px]" style={{ color: C.muted }}>
                  {h.note}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ul className="mt-5 grid gap-2 text-[15px]" style={{ color: C.muted }}>
        <li>접수 마감 평일 18:30, 토요일 13:30</li>
        <li>도수치료와 체외충격파는 예약제로 해요.</li>
      </ul>
      <div className="mt-6 grid gap-2">
        <p className="text-[15px] font-bold">의료진</p>
        <ul className="grid gap-4 sm:grid-cols-2">
          <li className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
            <img src={`${IMG}/staff-1.jpg`} alt="대표원장 김ㅎ늘" className="h-24 w-20 flex-none rounded-[8px] object-cover" />
            <span>
              <strong className="block text-[17px]">대표원장 김ㅎ늘</strong> <span style={{ color: C.muted }}>정형외과 전문의</span>
            </span>
          </li>
          <li className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
            <img src={`${IMG}/staff-2.jpg`} alt="원장 박ㅈ원" className="h-24 w-20 flex-none rounded-[8px] object-cover" />
            <span>
              <strong className="block text-[17px]">원장 박ㅈ원</strong> <span style={{ color: C.muted }}>정형외과 전문의</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

/* ---------- 오시는 길 ---------- */

function Visit() {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-10">
      {/* 그린 약도 */}
      <svg viewBox="0 0 520 300" className="h-auto w-full rounded-[8px]" role="img" aria-label="ㅇㅇ역 2번 출구에서 큰길을 따라 150미터 걸으면 오른쪽 건물 3층에 병원이 있는 약도" style={{ background: C.paper }}>
        <rect x="0" y="128" width="520" height="44" fill="#ffffff" />
        <rect x="236" y="0" width="40" height="300" fill="#ffffff" />
        <g fill="#e6e6e2">
          <rect x="24" y="24" width="180" height="84" rx="4" />
          <rect x="300" y="24" width="90" height="84" rx="4" />
          <rect x="24" y="192" width="180" height="84" rx="4" />
          <rect x="410" y="192" width="86" height="84" rx="4" />
        </g>
        <rect x="300" y="192" width="90" height="84" rx="4" fill={C.blue} />
        <text x="345" y="230" textAnchor="middle" fontSize="15" fontWeight="700" fill="#ffffff">
          곰파트너
        </text>
        <text x="345" y="250" textAnchor="middle" fontSize="13" fill="#ffffff">
          정형외과 3층
        </text>
        <circle cx="120" cy="150" r="16" fill={C.blue} />
        <text x="120" y="155" textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff">
          2
        </text>
        <text x="120" y="100" textAnchor="middle" fontSize="14" fill={C.ink}>
          ㅇㅇ역
        </text>
        <path d="M138 150 L330 150 L345 186" fill="none" stroke={C.blue} strokeWidth="3" strokeDasharray="8 7" strokeLinecap="round" />
        <text x="430" y="154" fontSize="13" fill={C.muted}>
          ㅇㅇ로
        </text>
      </svg>
      <dl className="grid content-start gap-x-5 gap-y-3 text-[16px] sm:grid-cols-[84px_minmax(0,1fr)]">
        <dt className="font-bold" style={{ color: C.blue }}>
          주소
        </dt>
        <dd>{ADDRESS}</dd>
        <dt className="font-bold" style={{ color: C.blue }}>
          지하철
        </dt>
        <dd>ㅇㅇ역 2번 출구에서 150m</dd>
        <dt className="font-bold" style={{ color: C.blue }}>
          주차
        </dt>
        <dd>건물 지하 주차장, 진료 시 2시간 무료</dd>
        <dt className="font-bold" style={{ color: C.blue }}>
          문의
        </dt>
        <dd className="flex flex-col gap-1">
          <a href={`tel:${TEL.replace(/-/g, "")}`} className={`inline-flex items-center gap-1.5 self-start rounded-[4px] font-bold underline underline-offset-4 ${focusRing}`} style={{ color: C.blue, outlineColor: C.blue }}>
            <Phone size={16} aria-hidden />
            {TEL}
          </a>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle size={16} aria-hidden style={{ color: C.blue }} />
            {KAKAO}
          </span>
        </dd>
      </dl>
    </div>
  );
}
