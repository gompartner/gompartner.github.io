"use client";

import { useEffect, useRef, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  BedDouble,
  Bus,
  CalendarCheck,
  Car,
  Cat,
  Check,
  Clock,
  Droplets,
  Eye,
  HeartPulse,
  MapPin,
  Minus,
  Moon,
  PawPrint,
  Phone,
  ScanLine,
  Scissors,
  Siren,
  Smile,
  Stethoscope,
  Sun,
  Syringe,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 24시 동물병원 홈페이지 샘플: 가상의 동물병원 곰파트너. 365일 24시간 진료하고 입원실이 있다.
   상호, 주소, 수의사, 보호자 이름은 모두 가상이다.

   국내 24시 동물병원 사이트 공통 구성(참고): 메뉴는 병원소개, 의료진, 진료과목, 건강검진, 입원실, 예약안내, 오시는 길.
   첫 화면 맨 위에 "24시간 진료", "야간 응급", 대표 전화를 크게 둔다. 진료과목은 내과, 외과, 영상의학과, 치과, 안과, 피부과,
   고양이 진료(개와 대기실 분리)로 나눈다. 건강검진은 기본, 정밀, 시니어 패키지 표로 비교하고 "검사 전 8시간 금식" 안내를 붙인다.
   2023년부터 진찰료, 입원비, 백신 같은 주요 진료비 게시가 의무라 "진료비 안내" 표를 둔다. 입원 면회 시간은 따로 공지한다.
   광고 규칙에 맞춰 치료 효과 보장, 최고, 유일 같은 표현과 치료 전후 사진, 보호자 후기는 넣지 않는다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 24시 응급 진료 안내: 지금 시각을 24시간 시계판에 바늘로 찍고, 주간 진료인지 야간 응급 진료인지와 진료 중 상태를 보여 준다.
   2. 진료 과목: 과목을 누르면 이럴 때 오세요, 검사와 처치, 담당 수의사가 바뀐다.
   3. 건강검진 패키지 비교: 나이를 고르면 맞는 패키지 열에 추천 표시가 옮겨 가고, 그 검진으로 바로 예약할 수 있다.
   4. 예약: 보호자, 휴대폰, 반려동물 종, 나이, 진료 과목, 날짜, 시간. 접수하면 접수 번호, 담당 창구, 회신 예정일을 보여 준다.
   5. 입원 면회 시간: 지금 시각 기준 면회 가능 여부와 다음 면회 시각을 시간 막대에 표시한다.

   사진 출처: AI 생성(Z-Image-Turbo, Apache 2.0)

   첫 화면(ah-poster): 수의사가 개를 살피는 사진 한 장이 한 화면을 채우고 아래 왼쪽에 문장 "밤 12시에도 문 열어 있어요".
   들어오면 사진이 1.6초 동안 천천히 다가오고(1.06배에서 1배), 문장은 0.3초 늦게 아래에서 올라온다(CSS keyframes, JS 없이도 보인다).
   스크롤하면 사진만 조금 느리게 움직인다. 동작 줄이기면 전부 멈춘다. */

const IMG = "/images/demo-animal-hospital";
const TEL = "02-000-0000";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 1~2층";
const KAKAO = "카카오톡 채널 곰파트너";

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, small }: { light?: boolean; small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" style={{ color: light ? "#ffffff" : "#111111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className={small ? "h-6 w-6 shrink-0" : "h-7 w-7 shrink-0"} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className={`${small ? "text-[18px]" : "text-[20px]"} font-bold tracking-[-0.03em]`}>곰파트너</span>
        <span className="text-[12px] font-semibold opacity-75">동물병원 샘플</span>
      </span>
    </span>
  );
}

const C = {
  paper: "#ffffff",
  soft: "#f7f7f5",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  /** 강조색 하나. 차분한 청록 */
  teal: "#2f5b57",
  tealSoft: "#eef3f2",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 탭, 표 강조, 접수 화면 전환 */
const DUR = 0.35;
/** 첫 화면 사진이 다가오는 시간 */
const PHOTO_IN = 1.6;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");

/* ---------- 시각 ---------- */

/** 브라우저 시계. 서버 렌더와 첫 화면은 null 로 두고 바로 지금 시각으로 바꾼다 */
function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const frame = requestAnimationFrame(tick);
    const id = window.setInterval(tick, 30000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(id);
    };
  }, []);
  return now;
}

/** 주간 진료 09:00~21:00, 그 밖은 야간 응급 진료. 일요일과 공휴일은 종일 야간 진찰료 */
const DAY_FROM = 9;
const DAY_TO = 21;
const isNight = (d: Date) => d.getHours() >= DAY_TO || d.getHours() < DAY_FROM;
const hhmm = (d: Date) => `${p2(d.getHours())}:${p2(d.getMinutes())}`;
const korTime = (h: number, m = 0) => `${h < 12 ? "오전" : "오후"} ${h % 12 === 0 ? 12 : h % 12}시${m ? ` ${m}분` : ""}`;

/* ---------- 진료 과목 ---------- */

type DeptId = "내과" | "외과" | "영상의학과" | "치과" | "안과" | "피부과" | "고양이 진료";
const VET_PHOTO: Record<string, number> = { 김하늘: 1, 박준우: 2, 이서아: 3, 최도현: 4 };

const DEPTS: { id: DeptId; Icon: typeof Stethoscope; when: string[]; care: string[]; vet: string }[] = [
  {
    id: "내과",
    Icon: Stethoscope,
    when: ["구토나 설사가 하루 넘게 이어져요", "물을 평소보다 많이 마셔요", "기침을 하고 숨소리가 거칠어요"],
    care: ["혈액검사, 혈청화학검사", "호르몬 검사(갑상선, 부신)", "수액 처치, 입원 관리"],
    vet: "김하늘",
  },
  {
    id: "외과",
    Icon: Scissors,
    when: ["다리를 들고 걸어요", "몸에 혹이 만져져요", "중성화 수술 시기가 됐어요"],
    care: ["중성화 수술", "슬개골 탈구 수술", "종양 제거, 골절 수술"],
    vet: "박준우",
  },
  {
    id: "영상의학과",
    Icon: ScanLine,
    when: ["원인을 모르는 통증이 있어요", "다른 병원에서 정밀 검사를 권했어요", "이물질을 삼킨 것 같아요"],
    care: ["디지털 방사선", "복부 초음파", "심장 초음파"],
    vet: "이서아",
  },
  {
    id: "치과",
    Icon: Smile,
    when: ["입냄새가 심해요", "한쪽으로만 씹어요", "잇몸에서 피가 나요"],
    care: ["마취 스케일링", "발치, 잇몸 치료", "치과 방사선"],
    vet: "최도현",
  },
  {
    id: "안과",
    Icon: Eye,
    when: ["눈을 자꾸 비벼요", "눈곱이 많고 눈이 빨개요", "눈동자가 뿌옇게 보여요"],
    care: ["안압 검사", "눈물량 검사, 각막 염색", "백내장, 녹내장 진료"],
    vet: "이서아",
  },
  {
    id: "피부과",
    Icon: Droplets,
    when: ["몸을 계속 긁어요", "털이 동그랗게 빠졌어요", "귀에서 냄새가 나요"],
    care: ["피부 스크래핑, 곰팡이 배양", "귀 세정, 귀 내시경", "알레르기 관리"],
    vet: "김하늘",
  },
  {
    id: "고양이 진료",
    Icon: Cat,
    when: ["병원만 오면 많이 놀라요", "소변을 보려다 못 봐요", "밥을 하루 넘게 안 먹어요"],
    care: ["고양이 전용 대기실과 진료실", "강아지와 다른 입구", "보호자 품에서 하는 진료"],
    vet: "최도현",
  },
];

/* ---------- 진료비 안내(부가세 포함) ---------- */

const FEES: [string, number, string?][] = [
  ["초진 진찰료", 11000],
  ["재진 진찰료", 7700],
  ["야간 응급 진찰료", 44000, "21:00~09:00, 일요일, 공휴일"],
  ["입원비(1일)", 55000, "10kg 미만"],
  ["강아지 종합백신", 25000],
  ["고양이 종합백신", 35000],
  ["광견병 백신", 20000],
  ["방사선 촬영(2매)", 55000],
  ["혈구검사(CBC)", 33000],
];

/* ---------- 건강검진 ---------- */

type Pack = 0 | 1 | 2;
const PACKS: { name: string; price: number; time: string }[] = [
  { name: "기본", price: 150000, time: "1시간" },
  { name: "정밀", price: 330000, time: "반나절" },
  { name: "시니어", price: 480000, time: "반나절" },
];
const AGES: { label: string; pack: Pack; tip: string }[] = [
  { label: "1~6세", pack: 0, tip: "1년에 한 번 기본 검진이면 돼요." },
  { label: "7~10세", pack: 1, tip: "1년에 한 번 정밀 검진을 권해요. 초음파로 속을 봐요." },
  { label: "11세 이상", pack: 2, tip: "6개월마다 시니어 검진을 권해요. 심장과 신장을 같이 봐요." },
];
/** true 는 포함, 문자열은 포함하되 내용이 다름 */
const ITEMS: [string, (boolean | string)[]][] = [
  ["신체검사, 청진", [true, true, true]],
  ["혈구검사(CBC)", [true, true, true]],
  ["혈청화학검사", ["10종", "17종", "17종"]],
  ["소변검사", [true, true, true]],
  ["흉부, 복부 방사선", [true, true, true]],
  ["전해질 검사", [false, true, true]],
  ["복부 초음파", [false, true, true]],
  ["갑상선 호르몬", [false, true, true]],
  ["신장 조기 검사(SDMA)", [false, true, true]],
  ["심장 초음파", [false, false, true]],
  ["혈압, 안압 측정", [false, false, true]],
];

/* ---------- 입원 면회 ---------- */

/** 면회 시간대(시 단위 소수). 매일 같다 */
const VISITS: [number, number][] = [
  [11, 12],
  [18, 19.5],
];
const hm = (v: number) => korTime(Math.floor(v), Math.round((v % 1) * 60));

/* ---------- 예약 ---------- */

type Species = "강아지" | "고양이" | "그 밖의 동물";
const SPECIES: Species[] = ["강아지", "고양이", "그 밖의 동물"];
const REASONS = ["일반 진료", "예방접종", "건강검진", "내과", "외과", "치과", "안과", "피부과"];
const SLOTS = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const AGE_OPTS = ["1살 미만", ...Array.from({ length: 19 }, (_, i) => `${i + 1}살`), "20살 이상"];

/** 날짜, 시간별로 이미 찬 예약. 실제로는 예약 시트에서 읽는다 */
function slotTaken(day: number, slot: number) {
  let h = (day + 5) * 2654435761 + (slot + 3) * 40503;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 100;
  return h < 30;
}

type Form = { name: string; phone: string; species: Species; age: string; reason: string; day: number; slot: number | null; memo: string };
type Done = { no: string; name: string; phone: string; species: Species; age: string; reason: string; date: Date; time: string; reply: Date };

export function AnimalHospitalDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const now = useNow();

  const [dept, setDept] = useState<DeptId>("내과");
  const [age, setAge] = useState(0);
  const [form, setForm] = useState<Form>({ name: "", phone: "", species: "강아지", age: "3살", reason: "일반 진료", day: 0, slot: null, memo: "" });

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] font-semibold underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip pb-24" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("ah-reserve")} />

      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:px-6">
        <p className="leading-none">
          <SampleLogo />
        </p>
        <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center" style={{ outlineColor: C.teal }}>
          {[
            ["ah-er", "응급 진료"],
            ["ah-dept", "진료과목"],
            ["ah-checkup", "건강검진"],
            ["ah-visit", "입원 면회"],
            ["ah-reserve", "예약하기"],
            ["ah-map", "오시는 길"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.teal }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <section id="ah-er" aria-labelledby="ah-er-title" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 md:px-6">
        <ErBoard now={now} />
      </section>

      <section id="ah-dept" aria-labelledby="ah-dept-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="ah-dept-title" icon={<Stethoscope size={22} aria-hidden />} title="진료과목" />
        <DeptPicker reduce={reduce} dept={dept} setDept={setDept} />
      </section>

      <section aria-labelledby="ah-fee-title" className="mx-auto mt-16 max-w-[1200px] px-4 md:mt-24 md:px-6">
        <SectionTitle id="ah-fee-title" icon={<Syringe size={22} aria-hidden />} title="진료비 안내" />
        <FeeTable />
      </section>

      <section id="ah-checkup" aria-labelledby="ah-checkup-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="ah-checkup-title" icon={<HeartPulse size={22} aria-hidden />} title="건강검진 패키지" />
        <Checkup
          reduce={reduce}
          age={age}
          setAge={setAge}
          onReserve={() => {
            setForm((f) => ({ ...f, reason: "건강검진" }));
            go("ah-reserve");
          }}
        />
      </section>

      <section id="ah-visit" aria-labelledby="ah-visit-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="ah-visit-title" icon={<BedDouble size={22} aria-hidden />} title="입원 면회 시간" />
        <VisitHours now={now} />
      </section>

      <section id="ah-reserve" aria-labelledby="ah-reserve-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="ah-reserve-title" icon={<CalendarCheck size={22} aria-hidden />} title="진료 예약" />
        <Reserve reduce={reduce} today={today} now={now} form={form} setForm={setForm} />
      </section>

      <section id="ah-map" aria-labelledby="ah-map-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="ah-map-title" icon={<MapPin size={22} aria-hidden />} title="오시는 길" />
        <MapBlock />
      </section>

      <footer className="mt-20 border-t px-4 py-10 md:px-6" style={{ background: C.soft, color: C.muted, borderColor: C.line }}>
        <div className="mx-auto max-w-[1200px]">
          <p>
            <SampleLogo />
          </p>
          <p className="mt-2 text-[14px]">
            {ADDRESS}, 대표 전화 {TEL}, 365일 24시간 진료
          </p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ id, icon, title }: { id: string; icon: ReactNode; title: string }) {
  return (
    <h2 id={id} className="mb-6 inline-flex items-center gap-2.5 text-[28px] font-bold leading-tight tracking-[-0.02em] md:text-[34px]" style={{ color: C.ink }}>
      <span style={{ color: C.teal }}>{icon}</span>
      {title}
    </h2>
  );
}

/* ---------- 첫 화면 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // 스크롤하면 사진만 조금 느리게 내려간다
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  return (
    <section id="ah-poster" ref={ref} aria-labelledby="ah-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: "#141414", color: "#ffffff" }}>
      <style>{`@keyframes ah-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.ah-rise{animation:ah-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both}@media (prefers-reduced-motion: reduce){.ah-rise{animation:none}}`}</style>
      <motion.div className="absolute inset-x-0 top-[-10%] h-[110%]" style={{ y: photoY }}>
        <motion.div className="h-full w-full" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : PHOTO_IN, ease: EASE }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="수의사가 마스크를 쓰고 큰 개의 눈을 살펴보는 모습"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "60% 35%" }}
          />
        </motion.div>
      </motion.div>
      {/* 글자 대비를 위한 막. 휴대폰은 아래, PC는 왼쪽을 더 어둡게 */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.35))" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.45), rgba(0,0,0,0) 60%)" }} />

      <div className="relative z-[1] flex items-center justify-between gap-3 px-4 pt-4 md:px-12 md:pt-7">
        <p className="leading-none">
          <SampleLogo light small />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta="animal-hospital_poster_cta"
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`}
          style={{ background: C.teal, color: "#ffffff", outlineColor: "#ffffff" }}
        >
          <CalendarCheck size={17} aria-hidden />
          예약하기
        </button>
      </div>

      <div className={`relative z-[1] mt-auto px-4 pb-14 md:px-12 md:pb-20 ${reduce ? "" : "ah-rise"}`}>
        <h1
          id="ah-poster-title"
          className="max-w-[12em] text-[36px] font-bold md:text-[clamp(40px,5vw,72px)]"
          style={{ letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}
        >
          밤 12시에도 문 열어 있어요
        </h1>
        <p className="mt-4 inline-flex items-center gap-2 text-[16px] md:mt-6 md:text-[18px]" style={{ color: "rgba(255,255,255,0.86)" }}>
          <Moon size={18} aria-hidden />
          365일 24시간 진료, 응급 전화 <span className="tabular-nums">{TEL}</span>
        </p>
      </div>
    </section>
  );
}

/* ---------- 1. 24시 응급 진료 안내 ---------- */

function ErBoard({ now }: { now: Date | null }) {
  const sunday = now ? now.getDay() === 0 : false;
  const night = now ? isNight(now) : false;
  const mins = now ? now.getHours() * 60 + now.getMinutes() : null;
  return (
    <div className="grid gap-6 rounded-[8px] p-5 md:grid-cols-[300px_minmax(0,1fr)] md:gap-10 md:p-8" style={{ background: C.soft, color: C.ink }}>
      <div>
        <DayDial mins={mins} />
        <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[14px]" style={{ color: C.body }}>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-3 w-5 rounded-[2px]" style={{ background: "#d4d4d0" }} />
            주간 09~21시
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-3 w-5 rounded-[2px]" style={{ background: C.teal }} />
            야간 21~09시
          </span>
        </p>
      </div>
      <div className="min-w-0">
        <h2 id="ah-er-title" className="text-[28px] font-bold leading-tight tracking-[-0.02em] md:text-[36px]">
          24시 응급 진료
        </h2>
        <p className="mt-3 inline-flex flex-wrap items-center gap-2 text-[17px] font-bold" aria-live="polite">
          <span className="inline-flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-[15px]" style={{ background: C.teal, color: "#ffffff" }}>
            <Siren size={16} aria-hidden />
            진료 중
          </span>
          {now ? (
            <span>
              지금 {hhmm(now)}, {night ? "야간 응급 진료 시간이에요" : sunday ? "일요일 진료 시간이에요" : "주간 진료 시간이에요"}
            </span>
          ) : (
            <span>365일 24시간 문 열어 있어요</span>
          )}
        </p>
        <dl className="mt-5 grid gap-x-6 gap-y-2 text-[16px] sm:grid-cols-[auto_minmax(0,1fr)]">
          <dt className="inline-flex items-center gap-1.5 font-bold" style={{ color: C.body }}>
            <Sun size={16} aria-hidden />
            주간 진료
          </dt>
          <dd>매일 09:00~21:00, 예약 우선</dd>
          <dt className="inline-flex items-center gap-1.5 font-bold" style={{ color: C.body }}>
            <Moon size={16} aria-hidden />
            야간 응급 진료
          </dt>
          <dd>매일 21:00~09:00, 일요일과 공휴일은 종일. 야간 진찰료가 붙어요</dd>
          <dt className="inline-flex items-center gap-1.5 font-bold" style={{ color: C.body }}>
            <Stethoscope size={16} aria-hidden />
            야간 당직
          </dt>
          <dd>수의사 4명, 동물보건사 2명</dd>
        </dl>
        <div className="mt-6 rounded-[6px] p-4" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
          <p className="font-bold">이럴 땐 바로 오세요</p>
          <ul className="mt-2 grid gap-x-6 gap-y-1 text-[15px] sm:grid-cols-2">
            {["숨을 헐떡이고 잇몸이 파래요", "이물질이나 초콜릿을 먹었어요", "경련을 해요", "차에 부딪혔거나 높은 데서 떨어졌어요", "구토를 계속 해요", "고양이가 소변을 못 봐요"].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Minus size={14} aria-hidden className="mt-[5px] flex-none" style={{ color: C.teal }} />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href={`tel:${TEL.replace(/-/g, "")}`}
            data-gtm-cta="animal-hospital_er_call"
            className={`inline-flex items-center gap-2 rounded-[6px] px-5 py-3 text-[17px] font-bold ${focusRing}`}
            style={{ background: C.teal, color: "#ffffff", outlineColor: C.teal }}
          >
            <Phone size={18} aria-hidden />
            응급 전화 {TEL}
          </a>
          <p className="text-[15px]" style={{ color: C.body }}>
            오시기 전에 전화 주시면 처치실을 준비해 둘게요.
          </p>
        </div>
      </div>
    </div>
  );
}

/** 24시간 시계판. 위가 0시, 시계 방향. 야간 구간은 진하게, 지금 시각에 바늘 */
function DayDial({ mins }: { mins: number | null }) {
  const R = 118;
  const ang = (h: number) => ((h / 24) * 360 - 90) * (Math.PI / 180);
  const pt = (h: number, r: number): [number, number] => [150 + Math.cos(ang(h)) * r, 150 + Math.sin(ang(h)) * r];
  const arc = (from: number, to: number, r: number) => {
    const [ax, ay] = pt(from, r);
    const [bx, by] = pt(to, r);
    const span = (to - from + 24) % 24;
    return `M${ax} ${ay} A${r} ${r} 0 ${span > 12 ? 1 : 0} 1 ${bx} ${by}`;
  };
  const hand = mins === null ? null : mins / 60;
  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[280px]" role="img" aria-label={hand === null ? "24시간 진료 시계" : `24시간 시계, 지금 ${p2(Math.floor(hand))}시 ${p2(mins! % 60)}분`}>
      <circle cx="150" cy="150" r="140" fill="#ffffff" />
      <path d={arc(DAY_FROM, DAY_TO, R)} fill="none" stroke="#d4d4d0" strokeWidth="22" />
      <path d={arc(DAY_TO, DAY_FROM, R)} fill="none" stroke={C.teal} strokeWidth="22" />
      {Array.from({ length: 24 }, (_, h) => {
        const [x1, y1] = pt(h, 98);
        const [x2, y2] = pt(h, h % 6 === 0 ? 86 : 92);
        return <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9a9a9a" strokeWidth={h % 6 === 0 ? 3 : 1.5} />;
      })}
      {[0, 6, 12, 18].map((h) => {
        const [x, y] = pt(h, 70);
        return (
          <text key={h} x={x} y={y + 6} textAnchor="middle" fontSize="17" fontWeight="700" fill={C.ink}>
            {h}
          </text>
        );
      })}
      {hand !== null && (
        <g>
          <line x1="150" y1="150" x2={pt(hand, 112)[0]} y2={pt(hand, 112)[1]} stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
          <circle cx={pt(hand, 118)[0]} cy={pt(hand, 118)[1]} r="9" fill={C.ink} stroke="#ffffff" strokeWidth="3" />
        </g>
      )}
      <circle cx="150" cy="150" r="7" fill={C.ink} />
    </svg>
  );
}

/* ---------- 2. 진료 과목 ---------- */

function DeptPicker({ reduce, dept, setDept }: { reduce: boolean; dept: DeptId; setDept: (d: DeptId) => void }) {
  const d = DEPTS.find((x) => x.id === dept) ?? DEPTS[0];
  return (
    <div className="grid gap-5 md:grid-cols-[260px_minmax(0,1fr)] md:gap-8">
      <div className="flex flex-wrap gap-2 md:flex-col md:flex-nowrap" role="group" aria-label="진료과목 고르기">
        {DEPTS.map(({ id, Icon }) => {
          const on = id === dept;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={on}
              onClick={() => setDept(id)}
              className={`relative inline-flex items-center gap-2 rounded-[6px] border px-3.5 py-2.5 text-left text-[16px] font-bold ${focusRing}`}
              style={{ borderColor: on ? C.teal : C.line, color: on ? C.paper : C.ink, outlineColor: C.teal }}
            >
              {on && (
                <motion.span
                  layoutId="ah-dept-on"
                  className="absolute inset-0 -z-0 rounded-[5px]"
                  style={{ background: C.teal }}
                  transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
                />
              )}
              <Icon size={18} aria-hidden className="relative" />
              <span className="relative">{id}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={d.id}
          initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={reduce ? undefined : { clipPath: "inset(100% 0 0 0)" }}
          transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
          className="grid gap-5 rounded-[8px] border p-5 sm:grid-cols-2 md:p-7"
          style={{ borderColor: C.line, background: "#fff" }}
          aria-live="polite"
        >
          <div>
            <h3 className="text-[22px]" style={{ color: C.ink }}>
              이럴 때 오세요
            </h3>
            <ul className="mt-3 grid gap-2 text-[16px]">
              {d.when.map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <PawPrint size={15} aria-hidden className="mt-[4px] flex-none" style={{ color: C.teal }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[22px]" style={{ color: C.ink }}>
              검사와 처치
            </h3>
            <ul className="mt-3 grid gap-2 text-[16px]">
              {d.care.map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check size={16} aria-hidden className="mt-[3px] flex-none" style={{ color: C.teal }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <p className="flex items-center gap-3 border-t pt-4 text-[15px] sm:col-span-2" style={{ borderColor: C.line, color: C.muted }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
            <img src={`${IMG}/vet-${VET_PHOTO[d.vet]}.jpg`} alt="" className="h-16 w-16 flex-none rounded-full object-cover" />
            <span>
              담당 <strong style={{ color: C.ink }}>{maskName(d.vet)}</strong> 수의사
            </span>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------- 진료비 안내 ---------- */

function FeeTable() {
  return (
    <div>
      <table className="w-full max-w-[760px] border-collapse text-[16px]">
        <caption className="sr-only">주요 진료비</caption>
        <thead>
          <tr className="border-b" style={{ borderColor: C.ink }}>
            <th scope="col" className="py-2 pr-3 text-left">
              항목
            </th>
            <th scope="col" className="py-2 text-right">
              금액
            </th>
          </tr>
        </thead>
        <tbody>
          {FEES.map(([name, price, note]) => (
            <tr key={name} className="border-b" style={{ borderColor: C.line }}>
              <th scope="row" className="py-2.5 pr-3 text-left font-semibold">
                {name}
                {note && (
                  <span className="ml-2 text-[14px] font-normal" style={{ color: C.muted }}>
                    {note}
                  </span>
                )}
              </th>
              <td className="py-2.5 text-right tabular-nums">{won(price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
        부가세 포함, 체중과 상태에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
}

/* ---------- 3. 건강검진 패키지 비교 ---------- */

function Checkup({ reduce, age, setAge, onReserve }: { reduce: boolean; age: number; setAge: (n: number) => void; onReserve: () => void }) {
  const rec = AGES[age].pack;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="반려동물 나이">
        <span className="mr-1 text-[16px] font-bold">나이</span>
        {AGES.map((a, i) => {
          const on = i === age;
          return (
            <button
              key={a.label}
              type="button"
              aria-pressed={on}
              onClick={() => setAge(i)}
              className={`rounded-[6px] border px-4 py-2 text-[16px] font-bold ${focusRing}`}
              style={{ borderColor: on ? C.teal : C.line, background: on ? C.tealSoft : "#fff", color: on ? C.teal : C.ink, outlineColor: C.teal }}
            >
              {a.label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[16px]" aria-live="polite">
        {AGES[age].tip}
      </p>

      <div className="mt-5 overflow-hidden rounded-[8px] border" style={{ borderColor: C.line, background: "#fff" }}>
        <table className="w-full table-fixed border-collapse text-[14px] sm:text-[16px]">
          <caption className="sr-only">건강검진 패키지 비교</caption>
          <colgroup>
            <col className="w-[34%]" />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="p-2 text-left sm:p-3">
                검사
              </th>
              {PACKS.map((pk, i) => (
                <th key={pk.name} scope="col" className="relative px-1 py-2 text-center align-bottom sm:p-3">
                  {i === rec && (
                    <motion.span
                      layoutId="ah-pack-on"
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-[5px]"
                      style={{ background: C.teal }}
                      transition={{ duration: reduce ? 0 : DUR, ease: EASE }}
                    />
                  )}
                  {i === rec && (
                    <span className="mb-1 block text-[13px] font-bold" style={{ color: C.teal }}>
                      추천
                    </span>
                  )}
                  <span className="block text-[17px] sm:text-[20px]" style={{ color: C.ink }}>
                    {pk.name}
                  </span>
                  <span className="mt-1 block whitespace-nowrap text-[12px] font-bold tabular-nums sm:text-[15px]">{won(pk.price)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ITEMS.map(([name, cells]) => (
              <tr key={name} className="border-t" style={{ borderColor: C.line }}>
                <th scope="row" className="p-2 text-left font-semibold sm:p-3">
                  {name}
                </th>
                {cells.map((v, i) => (
                  <td key={i} className="p-2 text-center sm:p-3" style={{ background: i === rec ? C.tealSoft : undefined, transition: reduce ? undefined : "background-color 0.35s" }}>
                    {v === true ? <Check size={18} aria-label="포함" className="mx-auto" style={{ color: C.teal }} /> : v === false ? <Minus size={16} aria-label="없음" className="mx-auto" style={{ color: "#bdbdbd" }} /> : <span className="font-bold">{v}</span>}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t" style={{ borderColor: C.line }}>
              <th scope="row" className="p-2 text-left font-semibold sm:p-3">
                소요 시간
              </th>
              {PACKS.map((pk, i) => (
                <td key={pk.name} className="p-2 text-center sm:p-3" style={{ background: i === rec ? C.tealSoft : undefined }}>
                  {pk.time}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px]" style={{ color: C.muted }}>
          10kg 미만 기준, 고양이도 같은 금액이에요. 검사 전 8시간 금식해 주세요.
        </p>
        <button
          type="button"
          onClick={onReserve}
          data-gtm-cta="animal-hospital_checkup_reserve"
          className={`inline-flex items-center gap-2 rounded-[6px] px-5 py-3 text-[16px] font-bold ${focusRing}`}
          style={{ background: C.teal, color: C.ink, outlineColor: C.teal }}
        >
          <CalendarCheck size={18} aria-hidden />
          {PACKS[rec].name} 검진 예약
        </button>
      </div>
    </div>
  );
}

/* ---------- 5. 입원 면회 시간 ---------- */

function VisitHours({ now }: { now: Date | null }) {
  const h = now ? now.getHours() + now.getMinutes() / 60 : null;
  let status = "면회는 매일 두 번이에요";
  if (h !== null) {
    const cur = VISITS.find(([a, b]) => h >= a && h < b);
    const next = VISITS.find(([a]) => a > h);
    status = cur ? `지금 면회 시간이에요. ${hm(cur[1])}까지` : next ? `다음 면회 오늘 ${hm(next[0])}` : `다음 면회 내일 ${hm(VISITS[0][0])}`;
  }
  const pct = (v: number) => `${(v / 24) * 100}%`;
  return (
    <div className="rounded-[8px] border p-5 md:p-7" style={{ borderColor: C.line, background: "#fff" }}>
      <p className="inline-flex items-center gap-2 text-[20px] font-bold" aria-live="polite" style={{ color: C.ink }}>
        <Clock size={20} aria-hidden />
        {status}
      </p>
      <div className="relative mt-8 h-10" role="img" aria-label={`면회 시간 ${VISITS.map(([a, b]) => `${hm(a)}~${hm(b)}`).join(", ")}`}>
        <div className="absolute inset-x-0 top-3 h-4 rounded-full" style={{ background: C.tealSoft }} />
        {VISITS.map(([a, b]) => (
          <div key={a} className="absolute top-3 h-4 rounded-[3px]" style={{ left: pct(a), width: pct(b - a), background: C.teal }} />
        ))}
        {h !== null && (
          <div className="absolute -top-1 h-12 w-[3px] -translate-x-1/2 rounded-full" style={{ left: pct(h), background: C.teal }}>
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[13px] font-bold" style={{ color: C.teal }}>
              지금
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 top-8 flex justify-between text-[13px] tabular-nums" style={{ color: C.muted }}>
          {[0, 6, 12, 18, 24].map((v) => (
            <span key={v}>{v}시</span>
          ))}
        </div>
      </div>
      <ul className="mt-8 grid gap-x-8 gap-y-2 text-[16px] sm:grid-cols-2">
        {[
          `오전 면회 ${hm(VISITS[0][0])}~${hm(VISITS[0][1])}`,
          `오후 면회 ${hm(VISITS[1][0])}~${hm(VISITS[1][1])}`,
          "한 번에 20분, 보호자 2명까지",
          "전염병 격리 입원은 영상 통화로 대신해요",
          "입원 중에는 하루 두 번 사진과 상태를 문자로 보내 드려요",
          "간식이나 장난감은 미리 말씀해 주세요",
        ].map((t) => (
          <li key={t} className="flex items-start gap-2">
            <PawPrint size={15} aria-hidden className="mt-[4px] flex-none" style={{ color: C.teal }} />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- 4. 예약 ---------- */

function Reserve({
  reduce,
  today,
  now,
  form,
  setForm,
}: {
  reduce: boolean;
  today: Date;
  now: Date | null;
  form: Form;
  setForm: Dispatch<SetStateAction<Form>>;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Done | null>(null);
  const days = Array.from({ length: 7 }, (_, i) => daysAgo(today, -i));
  const nowH = now ? now.getHours() : 0;
  const disabled = (day: number, slot: number) => slotTaken(day, slot) || (day === 0 && Number(SLOTS[slot].slice(0, 2)) <= nowH);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (form.name.trim().length < 2) err.name = "보호자 이름을 적어 주세요.";
    if (form.phone.replace(/\D/g, "").length < 10) err.phone = "휴대폰 번호를 적어 주세요.";
    if (form.slot === null || disabled(form.day, form.slot)) err.slot = "시간을 골라 주세요.";
    setErrors(err);
    if (Object.keys(err).length) {
      document.getElementById(`ah-f-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    const date = days[form.day];
    const seq = 100 + (Number(form.phone.replace(/\D/g, "").slice(-3)) % 900);
    setDone({
      no: `AH-${String(today.getFullYear()).slice(2)}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${seq}`,
      name: maskName(form.name),
      phone: maskPhone(form.phone),
      species: form.species,
      age: form.age,
      reason: form.reason,
      date,
      time: SLOTS[form.slot!],
      reply: today,
    });
  };

  const field = `w-full rounded-[6px] border bg-white px-3 py-2.5 text-[16px] ${focusRing}`;
  const chip = (on: boolean, off = false) =>
    `rounded-[6px] border px-3 py-2 text-[15px] font-bold ${focusRing} ${off ? "cursor-not-allowed line-through" : ""} ${on ? "shadow-[inset_0_0_0_1px_currentColor]" : ""}`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,1fr)_320px] md:gap-10">
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
            className="rounded-[8px] border p-5 md:p-7"
            style={{ borderColor: C.teal, background: "#fff" }}
            role="status"
          >
            <p className="inline-flex items-center gap-2 text-[24px]" style={{ color: C.ink }}>
              <Check size={24} aria-hidden style={{ color: C.teal }} />
              예약 신청이 접수됐어요
            </p>
            <dl className="mt-5 grid grid-cols-[96px_minmax(0,1fr)] gap-y-2 text-[16px]">
              <dt style={{ color: C.muted }}>접수 번호</dt>
              <dd className="font-bold tabular-nums">{done.no}</dd>
              <dt style={{ color: C.muted }}>보호자</dt>
              <dd>
                {done.name}, {done.phone}
              </dd>
              <dt style={{ color: C.muted }}>반려동물</dt>
              <dd>
                {done.species}, {done.age}
              </dd>
              <dt style={{ color: C.muted }}>진료</dt>
              <dd>{done.reason}</dd>
              <dt style={{ color: C.muted }}>희망 일시</dt>
              <dd className="font-bold">
                {fmtKo(done.date)} {done.time}
              </dd>
              <dt style={{ color: C.muted }}>담당 창구</dt>
              <dd>
                {KAKAO} 또는 전화 {TEL}
              </dd>
              <dt style={{ color: C.muted }}>회신 예정</dt>
              <dd>{fmtKo(done.reply)} 안에 예약 확정 문자를 보내 드려요</dd>
            </dl>
            <button
              type="button"
              onClick={() => {
                setDone(null);
                setForm((f) => ({ ...f, slot: null, memo: "" }));
              }}
              className={`mt-6 rounded-[6px] border px-4 py-2 text-[15px] font-bold ${focusRing}`}
              style={{ borderColor: C.line, outlineColor: C.teal }}
            >
              새로 예약하기
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 rounded-[8px] border p-5 md:p-7" style={{ borderColor: C.line, background: "#fff" }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-[15px] font-bold">보호자 이름</span>
                <input
                  id="ah-f-name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "ah-e-name" : undefined}
                  className={field}
                  style={{ borderColor: errors.name ? C.error : C.line, outlineColor: C.teal }}
                />
                {errors.name && (
                  <span id="ah-e-name" className="text-[14px] font-bold" style={{ color: C.error }}>
                    {errors.name}
                  </span>
                )}
              </label>
              <label className="grid gap-1.5">
                <span className="text-[15px] font-bold">휴대폰</span>
                <input
                  id="ah-f-phone"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="010-0000-0000"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "ah-e-phone" : undefined}
                  className={field}
                  style={{ borderColor: errors.phone ? C.error : C.line, outlineColor: C.teal }}
                />
                {errors.phone && (
                  <span id="ah-e-phone" className="text-[14px] font-bold" style={{ color: C.error }}>
                    {errors.phone}
                  </span>
                )}
              </label>
            </div>

            <fieldset className="min-w-0">
              <legend className="mb-2 text-[15px] font-bold">반려동물</legend>
              <div className="flex flex-wrap gap-2">
                {SPECIES.map((s) => {
                  const on = form.species === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set("species", s)}
                      className={chip(on)}
                      style={{ borderColor: on ? C.teal : C.line, background: on ? C.teal : "#fff", color: on ? C.paper : C.ink, outlineColor: C.teal }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-[15px] font-bold">나이</span>
                <select value={form.age} onChange={(e) => set("age", e.target.value)} className={field} style={{ borderColor: C.line, outlineColor: C.teal }}>
                  {AGE_OPTS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className="text-[15px] font-bold">진료</span>
                <select value={form.reason} onChange={(e) => set("reason", e.target.value)} className={field} style={{ borderColor: C.line, outlineColor: C.teal }}>
                  {REASONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
            </div>

            <fieldset className="min-w-0">
              <legend className="mb-2 text-[15px] font-bold">날짜</legend>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {days.map((d, i) => {
                  const on = form.day === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setForm((f) => ({ ...f, day: i, slot: null }))}
                      className={`flex-none rounded-[6px] border px-3 py-2 text-center text-[14px] font-bold leading-tight ${focusRing}`}
                      style={{ borderColor: on ? C.teal : C.line, background: on ? C.teal : "#fff", color: on ? C.paper : C.ink, outlineColor: C.teal }}
                    >
                      <span className="block">{i === 0 ? "오늘" : i === 1 ? "내일" : `${d.getMonth() + 1}.${d.getDate()}`}</span>
                      <span className="block text-[13px] font-semibold opacity-80">{["일", "월", "화", "수", "목", "금", "토"][d.getDay()]}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="min-w-0">
              <legend className="mb-2 text-[15px] font-bold">시간</legend>
              <div id="ah-f-slot" tabIndex={-1} className="flex flex-wrap gap-2 outline-none">
                {SLOTS.map((s, i) => {
                  const off = disabled(form.day, i);
                  const on = form.slot === i;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={off}
                      aria-pressed={on}
                      aria-label={off ? `${s} 마감` : s}
                      onClick={() => set("slot", i)}
                      className={`${chip(on, off)} tabular-nums`}
                      style={{
                        borderColor: on ? C.teal : C.line,
                        background: on ? C.tealSoft : off ? C.soft : "#fff",
                        color: on ? C.teal : off ? C.muted : C.ink,
                        outlineColor: C.teal,
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {errors.slot && (
                <p className="mt-2 text-[14px] font-bold" style={{ color: C.error }}>
                  {errors.slot}
                </p>
              )}
            </fieldset>

            <label className="grid gap-1.5">
              <span className="text-[15px] font-bold">증상 (선택)</span>
              <textarea value={form.memo} onChange={(e) => set("memo", e.target.value)} rows={3} className={field} style={{ borderColor: C.line, outlineColor: C.teal }} />
            </label>

            <button
              type="submit"
              data-gtm-cta="animal-hospital_reserve_submit"
              className={`inline-flex items-center justify-center gap-2 rounded-[6px] px-5 py-3.5 text-[17px] font-bold ${focusRing}`}
              style={{ background: C.teal, color: C.paper, outlineColor: C.teal }}
            >
              <CalendarCheck size={19} aria-hidden />
              예약 신청
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <aside className="grid content-start gap-4 text-[15px]">
        <div className="rounded-[8px] p-5" style={{ background: C.tealSoft }}>
          <p className="inline-flex items-center gap-2 font-bold" style={{ color: C.ink }}>
            <Siren size={17} aria-hidden />
            응급이면 예약 없이 오세요
          </p>
          <p className="mt-2">야간에도 바로 진료해요. 오시는 길에 전화 주시면 더 빨라요.</p>
          <a href={`tel:${TEL.replace(/-/g, "")}`} className={`mt-3 inline-flex items-center gap-1.5 font-bold underline underline-offset-4 ${focusRing}`} style={{ color: C.ink, outlineColor: C.teal }}>
            <Phone size={16} aria-hidden />
            {TEL}
          </a>
        </div>
        <div className="rounded-[8px] border p-5" style={{ borderColor: C.line, background: "#fff" }}>
          <p className="font-bold">처음 오시면</p>
          <ul className="mt-2 grid gap-1.5">
            {["예방접종 수첩이나 지난 검사 결과를 가져와 주세요", "고양이는 이동장에 담아 오세요", "강아지는 목줄을 해 주세요"].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Minus size={14} aria-hidden className="mt-[5px] flex-none" style={{ color: C.teal }} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

/* ---------- 오시는 길 ---------- */

function MapBlock() {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-10">
      <svg viewBox="0 0 560 340" className="h-auto w-full rounded-[8px]" role="img" aria-label="큰길 사거리 모퉁이에 있는 병원 위치 약도" style={{ background: "#f3f3f1" }}>
        <rect x="0" y="150" width="560" height="44" fill="#fff" />
        <rect x="300" y="0" width="40" height="340" fill="#fff" />
        <line x1="0" y1="172" x2="560" y2="172" stroke="#dcdcd8" strokeWidth="2" strokeDasharray="14 10" />
        <line x1="320" y1="0" x2="320" y2="340" stroke="#dcdcd8" strokeWidth="2" strokeDasharray="14 10" />
        {[
          [40, 40, 110, 80],
          [170, 40, 100, 80],
          [40, 220, 230, 90],
          [370, 230, 150, 80],
        ].map(([x, y, w, h]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="6" fill="#e3e3df" />
        ))}
        <rect x="370" y="40" width="150" height="90" rx="8" fill={C.teal} />
        <text x="445" y="92" textAnchor="middle" fontSize="18" fontWeight="700" fill={C.paper}>
          동물병원
        </text>
        <rect x="430" y="132" width="60" height="16" rx="3" fill={C.teal} />
        <text x="460" y="145" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.ink}>
          P 주차
        </text>
        <circle cx="250" cy="196" r="13" fill={C.ink} />
        <text x="250" y="201" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
          2
        </text>
        <text x="190" y="140" fontSize="14" fontWeight="700" fill={C.muted}>
          ㅇㅇ역 2번 출구
        </text>
      </svg>
      <dl className="grid content-start gap-4 text-[16px]">
        <div className="flex items-start gap-3">
          <MapPin size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.teal }} />
          <div>
            <dt className="font-bold">주소</dt>
            <dd>{ADDRESS}</dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Bus size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.teal }} />
          <div>
            <dt className="font-bold">대중교통</dt>
            <dd>ㅇㅇ역 2번 출구에서 걸어서 4분</dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Car size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.teal }} />
          <div>
            <dt className="font-bold">주차</dt>
            <dd>건물 뒤 전용 주차장 8대, 주차 가능</dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Phone size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.teal }} />
          <div>
            <dt className="font-bold">전화</dt>
            <dd>{TEL}, 24시간 받아요</dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
