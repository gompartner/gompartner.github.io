"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BatteryFull,
  Bluetooth,
  Briefcase,
  Bus,
  Car,
  Check,
  ChevronDown,
  CircleAlert,
  Factory,
  FileText,
  FileUp,
  Globe,
  House,
  Lightbulb,
  Mail,
  Menu,
  Monitor,
  Package,
  Plug,
  Plus,
  RotateCcw,
  Search,
  Signal,
  Trash2,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 기업 홈페이지 데모: 가상의 (주)○○시험인증원, 전자파·무선·전기안전 시험과 KC·해외 인증을 맡는 지정시험기관.
   10년 된 시험인증기관 홈페이지를 새로 만든다는 설정이다. 회사명, 대표자, 주소, 전화번호, 사업자 정보,
   지정 번호, 담당자, 의뢰사는 모두 가상이고 실제 기관 로고나 등록번호는 쓰지 않는다.
   옛 메뉴 구성(회사소개, 인증업무, 국내인증, 해외인증, 고객지원)은 그대로 두고 화면 안에서 바로 쓸 수 있게 바꿨다.

   디자인: 흰색과 서늘한 종이색(#f4f7fb) 바탕에 짙은 남색(#23307a), 신호 청록(#0aa2c0) 하나를 포인트로 쓴다.
   모눈종이 같은 옅은 격자와 측정한 전자파 파형 선을 반복 모티프로 깔고, 카드는 8~10px로 둥글게, 숫자는 고정폭 숫자로 맞춘다.

   인증 찾기는 전원 방식, 무선 기능, 제품 분류, 판매 국가를 고르면 필요할 가능성이 높은 인증을 국가별로 묶어
   이유, 주요 시험 항목, 예상 기간과 함께 보여 주고, 견적에 담으면 견적 문의 양식의 인증 칸으로 들어간다.
   해외인증은 점으로 찍은 세계 지도에서 대륙을 누르면 국가별 인증 이름과 설명이 나오고, 같은 내용을 버튼 목록으로도 고를 수 있다.
   시험 진행 조회는 접수번호 끝 네 자리로 진행 단계를 정해 단계표와 날짜를 보여 주고,
   전자파 시험이면 30MHz~1GHz 방사 방출 그래프에 기준선, 측정값, 최소 여유를 그린다. 동작 줄이기를 켜면 선 그리기를 하지 않는다.
   견적 문의는 사양서 파일을 골라도 이름과 크기만 보여 주고 어디에도 올리지 않으며, 접수번호와 가린 담당자 정보로 끝난다.

   사진 출처(public/images/demo-certlab):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, lab */

const IMG = "/images/demo-certlab";
const COMPANY = "(주)○○시험인증원";
const TEL = "02-000-0000";
const FAX = "02-000-0001";
const EMAIL = "test@example.com";
const ADDRESS = "□□시 □□구 □□로 00 ○○시험인증원";

const C = {
  white: "#ffffff",
  paper: "#f4f7fb",
  indigo: "#23307a",
  indigoDeep: "#18215a",
  indigoSoft: "#e8ebf7",
  cyan: "#0aa2c0",
  cyanText: "#06768c",
  cyanSoft: "#e1f4f8",
  ink: "#141a33",
  muted: "#525a72",
  line: "#d8deea",
  grid: "#e3e9f2",
  ok: "#1b7449",
  okSoft: "#e2f3ea",
  error: "#b3261e",
  errorSoft: "#fbeaea",
};

const EASE = [0.22, 1, 0.36, 1] as const;

/** 모눈종이: 12px 잔 눈금과 60px 굵은 눈금 */
const GRAPH = {
  backgroundImage: [
    `linear-gradient(${C.grid} 1px, transparent 1px)`,
    `linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
    "linear-gradient(rgba(35,48,122,0.035) 1px, transparent 1px)",
    "linear-gradient(90deg, rgba(35,48,122,0.035) 1px, transparent 1px)",
  ].join(", "),
  backgroundSize: "60px 60px, 60px 60px, 12px 12px, 12px 12px",
};

const NAV = [
  { id: "services", label: "인증업무" },
  { id: "domestic", label: "국내인증" },
  { id: "global", label: "해외인증" },
  { id: "about", label: "회사소개" },
  { id: "support", label: "고객지원" },
] as const;

const MOBILE_EXTRA = [
  { id: "finder", label: "필요한 인증 찾기" },
  { id: "track", label: "시험 진행 조회" },
  { id: "quote", label: "견적 문의" },
  { id: "location", label: "오시는 길" },
] as const;

/* ---------- 시간 ---------- */

const subscribeMinute = (cb: () => void) => {
  const id = window.setInterval(cb, 30_000);
  return () => window.clearInterval(id);
};

/** 분 단위 현재 시각. 서버 렌더에서는 -1을 돌려 날짜에 따른 화면 차이를 막는다. */
function useNowMinute() {
  return useSyncExternalStore(subscribeMinute, () => Math.floor(Date.now() / 60_000), () => -1);
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];
const pad2 = (n: number) => String(n).padStart(2, "0");
const md = (d: Date) => `${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
const mdw = (d: Date) => `${md(d)} (${DAY_NAMES[d.getDay()]})`;
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/* ---------- 도우미 ---------- */

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘은 김ㅎ늘로 */
function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return chars.join("");
  const hide = (ch: string) => {
    const code = ch.charCodeAt(0) - 0xac00;
    return code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*";
  };
  if (chars.length === 2) return chars[0] + hide(chars[1]);
  return chars.map((ch, i) => (i === 0 || i === chars.length - 1 ? ch : hide(ch))).join("");
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

function fileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* ---------- 방사 방출 그래프 데이터 (30MHz ~ 1GHz) ---------- */

const F0 = 30;
const F1 = 1000;
const LOG_RANGE = Math.log10(F1 / F0);
const SX0 = 46;
const SX1 = 466;
const SY0 = 14;
const SY1 = 228;
const DB0 = 10;
const DB1 = 60;

const fx = (f: number) => r2(SX0 + (Math.log10(f / F0) / LOG_RANGE) * (SX1 - SX0));
const dy = (db: number) => r2(SY1 - ((db - DB0) / (DB1 - DB0)) * (SY1 - SY0));
/** 3m 거리 B급 기기 방사 방출 기준(준첨두값) */
const limitAt = (f: number) => (f < 230 ? 40 : 47);

const PEAKS = [
  { f: 48, v: 30.6 },
  { f: 96, v: 33.1 },
  { f: 144, v: 35.8 },
  { f: 300, v: 38.4 },
  { f: 480, v: 41.5 },
  { f: 720, v: 36.9 },
];

const TRACE_POINTS = Array.from({ length: 160 }, (_, i) => {
  const t = i / 159;
  const f = F0 * 10 ** (t * LOG_RANGE);
  const noise = 15.5 + 4 * t + 2.6 * Math.sin(i * 1.7) + 1.8 * Math.sin(i * 0.53 + 1) + 1.2 * Math.sin(i * 3.1);
  const peak = Math.max(...PEAKS.map((p) => p.v - 25000 * Math.log10(f / p.f) ** 2));
  return { f, db: Math.max(noise, peak) };
});

const TRACE_PATH = TRACE_POINTS.map((p, i) => `${i === 0 ? "M" : "L"}${fx(p.f)} ${dy(p.db)}`).join(" ");
const LIMIT_PATH = `M${fx(30)} ${dy(40)} H${fx(230)} V${dy(47)} H${fx(1000)}`;
const WORST = PEAKS.reduce((w, p) => (limitAt(p.f) - p.v < limitAt(w.f) - w.v ? p : w), PEAKS[0]);
const WORST_MARGIN = (limitAt(WORST.f) - WORST.v).toFixed(1);

/* ---------- 페이지 ---------- */

export function CertLabDemo() {
  const minute = useNowMinute();
  const [certs, setCerts] = useState<string[]>([]);

  const addCerts = (names: string[]) => setCerts((prev) => [...prev, ...names.filter((n) => !prev.includes(n))]);

  return (
    <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.white, color: C.ink }}>
      <Header />
      <main>
        <Hero />
        <Services />
        <Domestic />
        <Finder onAdd={addCerts} />
        <GlobalMap />
        <Tracking minute={minute} />
        <About />
        <Facilities />
        <Support minute={minute} />
        <Quote certs={certs} setCerts={setCerts} />
        <Recruit />
        <Location />
      </main>
      <Footer />
    </div>
  );
}

/* ---------- 로고, 머리글 ---------- */

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-2.5">
      <svg className="shrink-0" width="32" height="32" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="8" fill={light ? C.white : C.indigo} />
        <path d="M5 21 H9 L11 13 L14 24 L17 8 L20 20 L22 16 H27" fill="none" stroke={C.cyan} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M5 11 H27" stroke={light ? C.indigo : C.white} strokeWidth="1.2" strokeDasharray="2 2" opacity="0.7" />
      </svg>
      <span className="truncate text-[17px] font-bold tracking-[-0.02em] sm:text-[18px]">{COMPANY}</span>
    </span>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <a href="#top" aria-label={`${COMPANY} 처음으로`} className="flex min-w-0">
          <Logo />
        </a>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[15px] font-semibold">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="transition-colors hover:text-[#06768c]" style={{ color: C.ink }}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <a
            href="#track"
            aria-label="시험 진행 조회"
            title="시험 진행 조회"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border transition-colors hover:border-[#0aa2c0]"
            style={{ borderColor: C.line, color: C.indigo }}
          >
            <Activity size={19} aria-hidden />
          </a>
          <a href="#quote" className="hidden h-10 items-center rounded-[8px] px-4 text-[15px] font-bold md:inline-flex" style={{ background: C.indigo, color: C.white }}>
            견적 문의
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] lg:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            aria-controls="certlab-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="certlab-menu"
            aria-label="주 메뉴"
            className="overflow-hidden border-t lg:hidden"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { height: 0 }}
            animate={{ height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <ul className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-4 px-4 py-2 md:px-6">
              {[...NAV, ...MOBILE_EXTRA].map((n) => (
                <li key={n.id} className="border-b" style={{ borderColor: C.paper }}>
                  <a href={`#${n.id}`} onClick={() => setOpen(false)} className="flex h-12 items-center text-[17px]">
                    {n.label}
                  </a>
                </li>
              ))}
              <li className="col-span-2">
                <a href={`tel:${TEL}`} className="flex h-12 items-center text-[17px] font-bold tabular-nums" style={{ color: C.indigo }}>
                  대표 전화 {TEL}
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- 첫 화면 ---------- */

/** 측정 파형 모티프. 기준선(점선) 아래로 측정값이 지나간다. */
function WaveMotif({ className = "", opacity = 1 }: { className?: string; opacity?: number }) {
  return (
    <svg viewBox={`${SX0} 60 ${SX1 - SX0} ${SY1 - 60}`} preserveAspectRatio="none" className={className} aria-hidden style={{ opacity }}>
      <path d={LIMIT_PATH} fill="none" stroke={C.indigo} strokeWidth="1.2" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" opacity="0.45" />
      <path d={TRACE_PATH} fill="none" stroke={C.cyan} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Hero() {
  const quick = [
    { id: "finder", icon: Search, title: "필요한 인증 찾기", sub: "전원, 무선, 판매 국가로 확인" },
    { id: "track", icon: Activity, title: "시험 진행 조회", sub: "접수번호로 단계와 결과 확인" },
    { id: "global", icon: Globe, title: "해외인증 안내", sub: "대륙별 국가와 인증 이름" },
    { id: "support", icon: FileText, title: "자료실", sub: "신청서 양식, 준비 서류" },
  ];

  return (
    <section id="top" className="relative overflow-hidden px-4 pb-12 pt-10 md:px-6 md:pb-16 md:pt-14" style={{ background: C.paper, ...GRAPH }}>
      <WaveMotif className="pointer-events-none absolute inset-x-0 bottom-[118px] h-[120px] w-full md:bottom-[96px] md:h-[160px]" opacity={0.5} />
      <div className="relative mx-auto max-w-[1200px]">
        <div className="grid items-center gap-9 md:grid-cols-[1fr_1.15fr] md:gap-12">
          <div>
            <p className="text-[15px] font-bold" style={{ color: C.cyanText }}>
              전파법 지정시험기관 · ISO/IEC 17025 인정 시험소
            </p>
            <h1 className="mt-3 text-[34px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[50px]">{COMPANY}</h1>
            <p className="mt-5 max-w-[520px] text-[16px] md:text-[18px]" style={{ color: C.muted }}>
              전자파(EMC), 무선(RF), 전기안전 시험을 직접 하고 KC 인증과 해외 인증 신청까지 맡습니다. 시료를 보내신 뒤에는 접수번호로 시험이 어디까지 왔는지 확인할 수 있습니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#finder" className="inline-flex h-12 items-center gap-2 rounded-[8px] px-6 font-bold" style={{ background: C.indigo, color: C.white }}>
                <Search size={18} aria-hidden />
                필요한 인증 찾기
              </a>
              <a href="#quote" className="inline-flex h-12 items-center rounded-[8px] border bg-white px-6 font-bold" style={{ borderColor: C.line, color: C.indigo }}>
                견적 문의
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[1344/768] overflow-hidden rounded-[10px] border" style={{ borderColor: C.line }}>
              <Image
                src={`${IMG}/hero.jpg`}
                alt="파란 피라미드형 흡수체로 둘러싸인 전파무향실 안 턴테이블 위에 시험할 기기가 놓여 있다"
                fill
                priority
                sizes="(min-width: 768px) 55vw, 100vw"
                className="object-cover"
              />
            </div>
            <p className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-[8px] bg-white/95 px-3 py-1.5 text-[13px] font-semibold md:text-[14px]" style={{ color: C.indigo }}>
              <span className="h-2 w-2 rounded-full" style={{ background: C.cyan }} aria-hidden />
              3m 전파무향실 <span className="tabular-nums">30MHz ~ 18GHz</span>
            </p>
          </div>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-2.5 md:mt-14 md:grid-cols-4 md:gap-3">
          {quick.map((q) => (
            <li key={q.id}>
              <a
                href={`#${q.id}`}
                className="group flex h-full items-start gap-3 rounded-[10px] border bg-white p-3.5 transition-colors hover:border-[#0aa2c0] md:p-4"
                style={{ borderColor: C.line }}
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px]" style={{ background: C.indigoSoft, color: C.indigo }}>
                  <q.icon size={18} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold leading-[1.35] md:text-[16px]">{q.title}</span>
                  <span className="mt-0.5 hidden text-[13px] leading-[1.4] sm:block" style={{ color: C.muted }}>
                    {q.sub}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SectionHead({ id, tag, title, desc, light = false }: { id: string; tag: string; title: string; desc?: string; light?: boolean }) {
  return (
    <div>
      <p className="inline-flex items-center gap-2 text-[15px] font-bold" style={{ color: light ? "#7fd6e8" : C.cyanText }}>
        <svg width="22" height="12" viewBox="0 0 22 12" aria-hidden>
          <path d="M1 8 H5 L7 3 L10 11 L13 1 L15 7 H21" fill="none" stroke={C.cyan} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        {tag}
      </p>
      <h2 id={id} className="mt-2 text-[27px] font-bold leading-[1.35] tracking-[-0.03em] md:text-[36px]">
        {title}
      </h2>
      {desc && (
        <p className="mt-3 max-w-[700px]" style={{ color: light ? "#c8cdea" : C.muted }}>
          {desc}
        </p>
      )}
    </div>
  );
}

/* ---------- 인증업무 ---------- */

const SERVICES = [
  {
    code: "EMC",
    name: "전자파 적합성",
    body: "기기가 내보내는 전자파가 다른 기기를 방해하지 않는지, 외부 전자파에 견디는지 시험합니다.",
    tests: ["방사·전도 방출", "정전기 방전", "방사·전도 내성", "서지, 순간 전압 강하"],
    std: "KS C 9832·9835, CISPR 32·35, IEC 61000-4 시리즈",
  },
  {
    code: "RF",
    name: "무선 적합성",
    body: "블루투스, Wi-Fi, LTE 같은 무선 기능의 출력과 주파수가 기준 안에 있는지 시험합니다.",
    tests: ["송신 출력", "주파수 허용편차", "점유주파수폭", "불요발사, 전자파 흡수율"],
    std: "국립전파연구원 고시, ETSI EN 300 328·301 893, FCC Part 15",
  },
  {
    code: "GMA",
    name: "해외 시장 인증 대행",
    body: "국가별로 다른 인증 서류와 표시 방법을 정리하고, 현지 인증기관 신청과 대리인 업무를 대신합니다.",
    tests: ["국가별 요구사항 검토", "기술 문서 작성", "현지 기관 신청", "인증서 갱신 관리"],
    std: "북미, 유럽, 아시아 등 60여 개국",
  },
  {
    code: "SAFETY",
    name: "전기안전",
    body: "감전, 화재, 과열 위험이 없는지 제품 규격에 따라 구조를 검토하고 시험합니다.",
    tests: ["절연저항, 내전압", "온도 상승", "누설전류", "비정상 동작, 부품 검토"],
    std: "KC 60335-1, KC 62368-1, IEC 60598 등",
  },
];

function Services() {
  const reduce = useReducedMotionSafe();
  return (
    <section aria-labelledby="services-title" id="services" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="services-title"
          tag="인증업무"
          title="시험부터 인증서 발급까지 한 곳에서 진행합니다"
          desc="전자파, 무선, 전기안전 시험실을 모두 갖추고 있어 시료를 여러 곳에 나눠 보내지 않아도 됩니다."
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <motion.li
              key={s.code}
              className="flex flex-col rounded-[10px] border p-5 md:p-6"
              style={{ borderColor: C.line }}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: EASE }}
            >
              <p className="flex items-baseline justify-between gap-2">
                <span className="text-[26px] font-bold tracking-[-0.02em]" style={{ color: C.indigo }}>
                  {s.code}
                </span>
                <span className="text-[14px] font-semibold" style={{ color: C.cyanText }}>
                  {s.name}
                </span>
              </p>
              <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
                {s.body}
              </p>
              <ul className="mt-4 space-y-1.5 text-[15px]">
                {s.tests.map((tst) => (
                  <li key={tst} className="flex items-start gap-2">
                    <Check size={16} className="mt-1 shrink-0" style={{ color: C.cyan }} aria-hidden />
                    {tst}
                  </li>
                ))}
              </ul>
              <p className="mt-auto border-t pt-3 text-[13px] leading-[1.5]" style={{ borderColor: C.line, color: C.muted }}>
                <span className="sr-only">적용 규격: </span>
                {s.std}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 국내인증 ---------- */

const DOMESTIC = [
  { name: "적합인증", law: "전파법", target: "무선기기, 유선 통신기기 (블루투스, Wi-Fi, LTE 단말 등)", way: "지정시험기관 시험 후 국립전파연구원 인증", days: "3~8주" },
  { name: "적합등록", law: "전파법", target: "전자파 장해 우려가 적은 전기·전자 기기 (가전, 정보기기, 조명 등)", way: "시험 성적서를 갖추고 등록", days: "2~3주" },
  { name: "전기용품 안전인증", law: "전기용품 및 생활용품 안전관리법", target: "교류 전원에 직접 연결하는 가전, 조명, 전원 장치 일부", way: "제품 시험과 공장 심사, 해마다 정기 검사", days: "4~6주" },
  { name: "전기용품 안전확인", law: "전기용품 및 생활용품 안전관리법", target: "정보·사무기기, 일부 가전과 조명", way: "제품 시험 후 신고", days: "2~4주" },
  { name: "공급자적합성확인", law: "전기용품 및 생활용품 안전관리법", target: "직류 전원 기기, 위해 우려가 낮은 전기용품", way: "제조·수입자가 시험 후 스스로 확인", days: "1~2주" },
  { name: "에너지효율 표시", law: "에너지이용 합리화법", target: "효율관리기자재, 대기전력 저감 대상 품목", way: "효율 시험 후 등급·표시 신고", days: "2~3주" },
  { name: "자율안전확인신고 (KCs)", law: "산업안전보건법", target: "신고 대상 산업용 기계·기구와 방호장치", way: "자율안전기준 시험 후 신고", days: "3~4주" },
];

function Domestic() {
  return (
    <section aria-labelledby="domestic-title" id="domestic" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.paper }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="domestic-title"
          tag="국내인증"
          title="KC 인증 종류와 처리 기간"
          desc="같은 KC 표시라도 근거 법령과 절차가 다릅니다. 처리 기간은 시료와 서류가 모두 들어온 날부터 셉니다."
        />
        <div className="mt-8 overflow-x-auto rounded-[10px] border bg-white" style={{ borderColor: C.line }}>
          <table className="w-full min-w-[760px] text-left text-[15px]">
            <caption className="sr-only">국내 인증 종류별 근거 법령, 대상, 절차, 처리 기간</caption>
            <thead>
              <tr style={{ background: C.indigo, color: C.white }}>
                {["인증", "근거 법령", "주요 대상", "절차", "기간"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 text-[14px] font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DOMESTIC.map((d) => (
                <tr key={d.name} className="border-t align-top" style={{ borderColor: C.line }}>
                  <th scope="row" className="whitespace-nowrap px-4 py-3.5 font-bold" style={{ color: C.indigo }}>
                    {d.name}
                  </th>
                  <td className="px-4 py-3.5" style={{ color: C.muted }}>
                    {d.law}
                  </td>
                  <td className="px-4 py-3.5">{d.target}</td>
                  <td className="px-4 py-3.5" style={{ color: C.muted }}>
                    {d.way}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 font-bold tabular-nums">{d.days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ---------- 필요한 인증 찾기 ---------- */

type Power = "battery" | "adapter" | "ac";
type Radio = "none" | "bt" | "wifi" | "cell";
type Kind = "home" | "ict" | "light" | "industrial";
type Country = "kr" | "us" | "ca" | "eu" | "uk" | "jp" | "cn" | "au";

interface Cert {
  id: string;
  name: string;
  short: string;
  reason: string;
  tests: string;
  period: string;
}

const POWER_OPTS: { v: Power; label: string; icon: typeof Plug }[] = [
  { v: "battery", label: "배터리만", icon: BatteryFull },
  { v: "adapter", label: "외부 어댑터", icon: Plug },
  { v: "ac", label: "AC 220V 직결", icon: Zap },
];

const RADIO_OPTS: { v: Radio; label: string; icon: typeof Plug }[] = [
  { v: "none", label: "없음", icon: WifiOff },
  { v: "bt", label: "블루투스", icon: Bluetooth },
  { v: "wifi", label: "Wi-Fi", icon: Wifi },
  { v: "cell", label: "LTE·5G", icon: Signal },
];

const KIND_OPTS: { v: Kind; label: string; icon: typeof Plug }[] = [
  { v: "home", label: "가정용 전자기기", icon: House },
  { v: "ict", label: "정보통신기기", icon: Monitor },
  { v: "light", label: "조명기기", icon: Lightbulb },
  { v: "industrial", label: "산업용 장비", icon: Factory },
];

const COUNTRIES: { v: Country; label: string; code: string }[] = [
  { v: "kr", label: "한국", code: "KR" },
  { v: "us", label: "미국", code: "US" },
  { v: "ca", label: "캐나다", code: "CA" },
  { v: "eu", label: "유럽연합", code: "EU" },
  { v: "uk", label: "영국", code: "UK" },
  { v: "jp", label: "일본", code: "JP" },
  { v: "cn", label: "중국", code: "CN" },
  { v: "au", label: "호주", code: "AU" },
];

const RADIO_NAME: Record<Radio, string> = { none: "", bt: "블루투스", wifi: "Wi-Fi", cell: "LTE·5G" };

const KR_EMC_STD: Record<Kind, string> = {
  home: "KS C 9814-1·2",
  ict: "KS C 9832·9835",
  light: "KS C 9815·9547",
  industrial: "KS C 9610-6-2·6-4",
};

const EU_EMC_STD: Record<Kind, string> = {
  home: "EN 55014-1·2",
  ict: "EN 55032·55035",
  light: "EN 55015·61547",
  industrial: "EN 61000-6-2·6-4",
};

interface FinderInput {
  power: Power;
  radio: Radio;
  kind: Kind;
}

function certsFor(country: Country, { power, radio, kind }: FinderInput): Cert[] {
  const wireless = radio !== "none";
  const ac = power === "ac";
  const out: Cert[] = [];

  if (country === "kr") {
    if (wireless) {
      out.push({
        id: "kr-ri",
        name: "방송통신기자재 적합인증 (무선)",
        short: "적합인증 (무선)",
        reason: `${RADIO_NAME[radio]} 기능이 있어 전파법에 따른 적합인증 대상입니다. 전자파 시험도 함께 합니다.`,
        tests: radio === "cell" ? "송신 출력, 불요발사, 전자파 흡수율(SAR), 전자파 방출·내성" : "송신 출력, 주파수 허용편차, 점유주파수폭, 불요발사, 전자파 방출·내성",
        period: radio === "cell" ? "6~8주" : "3~5주",
      });
    } else {
      out.push({
        id: "kr-emc",
        name: "방송통신기자재 적합등록 (전자파)",
        short: "적합등록 (전자파)",
        reason: kind === "industrial" ? "산업 환경용(A급) 기기 기준으로 전자파 방출과 내성을 봅니다." : "전원이 들어가는 전자기기라 전자파 적합등록 대상입니다.",
        tests: `전도·방사 방출, 정전기·방사 내성 (${KR_EMC_STD[kind]})`,
        period: "2~3주",
      });
    }
    if (kind === "industrial") {
      out.push({
        id: "kr-kcs",
        name: "자율안전확인신고 (KCs)",
        short: "자율안전확인신고 (KCs)",
        reason: "산업용 기계·기구 중 신고 대상 품목이면 산업안전보건법에 따라 신고합니다.",
        tests: "전기적 안전, 위험 부위 방호, 비상정지 장치",
        period: "3~4주",
      });
    } else if (ac) {
      const strict = kind === "home" || kind === "light";
      out.push({
        id: strict ? "kr-safe-cert" : "kr-safe-check",
        name: strict ? "전기용품 안전인증" : "전기용품 안전확인",
        short: strict ? "전기용품 안전인증" : "전기용품 안전확인",
        reason: strict ? "교류 전원에 바로 연결하는 가전·조명은 대부분 안전인증 대상이고 공장 심사가 함께 진행됩니다." : "교류 전원을 쓰는 정보통신기기는 보통 안전확인 대상입니다.",
        tests: "절연저항, 내전압, 온도 상승, 누설전류, 비정상 동작",
        period: strict ? "4~6주" : "2~4주",
      });
    } else if (power === "adapter") {
      out.push({
        id: "kr-sdoc",
        name: "전기용품 공급자적합성확인",
        short: "공급자적합성확인",
        reason: "안전인증을 받은 어댑터를 쓰면 본체는 직류 전원 기기로 공급자적합성확인 대상인지 봅니다.",
        tests: "어댑터 인증서 확인, 본체 온도 상승·절연",
        period: "1~2주",
      });
    } else {
      out.push({
        id: "kr-battery",
        name: "2차전지 안전확인 (배터리)",
        short: "2차전지 안전확인",
        reason: "리튬 배터리는 배터리 자체가 안전확인 대상입니다. 인증받은 배터리를 쓰면 시험을 줄일 수 있습니다.",
        tests: "과충전, 외부 단락, 낙하, 열 노출",
        period: "2~3주",
      });
    }
    if (ac && (kind === "home" || kind === "light")) {
      out.push({
        id: "kr-energy",
        name: "에너지소비효율·대기전력 확인",
        short: "에너지효율 표시",
        reason: "효율관리기자재나 대기전력 저감 대상 품목이면 효율 시험과 표시가 필요합니다.",
        tests: kind === "light" ? "소비전력, 광효율, 역률" : "소비전력, 대기전력",
        period: "2~3주",
      });
    }
  }

  if (country === "us") {
    out.push(
      wireless
        ? {
            id: "us-fcc-id",
            name: radio === "cell" ? "FCC ID (Part 15·22·24·27)" : "FCC ID (Part 15 Subpart C)",
            short: "FCC ID",
            reason: "무선기기는 TCB 심사를 거쳐 FCC ID를 받아야 판매할 수 있습니다.",
            tests: "송신 출력, 대역 외 발사, RF 노출, 비의도성 방사(Part 15B)",
            period: radio === "cell" ? "6~10주" : "4~6주",
          }
        : {
            id: "us-fcc-sdoc",
            name: "FCC Part 15 Subpart B (SDoC)",
            short: "FCC SDoC",
            reason: "무선 기능이 없는 디지털 기기는 공급자 적합성 선언으로 판매합니다.",
            tests: kind === "industrial" ? "전도·방사 방출 (A급)" : "전도·방사 방출 (B급)",
            period: "2~3주",
          },
    );
    if (ac) {
      out.push({
        id: "us-nrtl",
        name: "NRTL 안전 인증 (UL 규격)",
        short: "NRTL 안전 인증",
        reason: "연방 의무는 아니지만 대형 유통사와 설치 현장에서 대부분 요구합니다.",
        tests: kind === "light" ? "UL 8750, UL 1598 등 조명 규격" : "UL 62368-1, UL 60335-1 등 품목 규격",
        period: "6~10주",
      });
    }
  }

  if (country === "ca") {
    out.push(
      wireless
        ? {
            id: "ca-ised",
            name: "ISED 인증 (RSS)",
            short: "ISED",
            reason: "무선기기는 캐나다 혁신과학경제개발부 인증 번호(IC)가 필요합니다.",
            tests: radio === "cell" ? "RSS-130·133 등, RF 노출" : "RSS-247, RSS-Gen, RF 노출",
            period: "FCC와 함께 진행하면 2~3주 추가",
          }
        : {
            id: "ca-ices",
            name: "ISED ICES-003",
            short: "ICES-003",
            reason: "디지털 기기는 ICES-003 기준에 맞다는 표시를 붙여 판매합니다.",
            tests: "전도·방사 방출",
            period: "FCC 시험과 함께 1주 추가",
          },
    );
    if (ac) {
      out.push({
        id: "ca-safety",
        name: "캐나다 전기안전 인증 (CSA 규격)",
        short: "캐나다 전기안전",
        reason: "주마다 전기 제품을 판매하기 전에 인정 기관의 안전 인증을 요구합니다.",
        tests: "CSA C22.2 품목 규격",
        period: "NRTL과 함께 진행",
      });
    }
  }

  if (country === "eu") {
    if (wireless) {
      out.push({
        id: "eu-red",
        name: "CE (RED)",
        short: "CE (RED)",
        reason: "무선기기는 무선기기 지침(RED) 하나로 전파, 전자파, 전기안전을 함께 봅니다.",
        tests: `${radio === "cell" ? "EN 301 908" : radio === "wifi" ? "EN 300 328·301 893" : "EN 300 328"}, EN 301 489, EN 62368-1, EN 62311`,
        period: "5~7주",
      });
    } else {
      out.push({
        id: ac ? "eu-emc-lvd" : "eu-emc",
        name: ac ? "CE (EMC·LVD)" : "CE (EMC)",
        short: ac ? "CE (EMC·LVD)" : "CE (EMC)",
        reason: ac
          ? "교류 50~1,000V 전원을 쓰는 기기라 EMC 지침과 저전압 지침을 함께 적용합니다."
          : power === "adapter"
            ? "어댑터가 저전압 지침(LVD)을 만족하면 본체는 EMC 지침을 따릅니다."
            : "배터리로만 동작하면 저전압 지침 대상이 아니고 EMC 지침을 따릅니다.",
        tests: `${EU_EMC_STD[kind]}${ac ? ", EN 62368-1 또는 EN 60335-1" : ""}`,
        period: "3~5주",
      });
    }
    out.push({
      id: "eu-rohs",
      name: "RoHS 유해물질 확인",
      short: "RoHS",
      reason: "전기·전자 제품은 납, 카드뮴 등 10가지 유해물질 함량 기준을 지켜야 합니다.",
      tests: "부품별 성분 분석 또는 공급사 자료 검토",
      period: "1~2주",
    });
  }

  if (country === "uk") {
    out.push({
      id: "uk-ukca",
      name: wireless ? "UKCA (무선기기 규정)" : "UKCA (EMC·전기안전 규정)",
      short: "UKCA",
      reason: "영국은 EU와 따로 UKCA 표시 규정을 둡니다. CE 시험 성적서를 바탕으로 준비할 수 있습니다.",
      tests: "CE와 같은 시험 항목, 영국 지정 규격 확인",
      period: "CE와 함께 진행하면 1~2주 추가",
    });
  }

  if (country === "jp") {
    if (wireless) {
      out.push({
        id: "jp-telec",
        name: radio === "cell" ? "TELEC·JATE" : "TELEC 기술기준적합증명",
        short: radio === "cell" ? "TELEC·JATE" : "TELEC",
        reason: radio === "cell" ? "무선 기능은 일본 전파법 인증을, 통신망에 접속하는 단말은 단말기기 기술기준 인증을 함께 받습니다." : "무선 기능은 일본 전파법 인증을 받아야 판매할 수 있습니다.",
        tests: "송신 출력, 주파수 편차, 스퓨리어스 발사",
        period: radio === "cell" ? "8~10주" : "4~6주",
      });
    }
    if (ac) {
      out.push({
        id: "jp-pse",
        name: "PSE (전기용품안전법)",
        short: "PSE",
        reason: "콘센트에 바로 꽂는 제품은 전기용품안전법 대상입니다. 품목에 따라 특정전기용품과 그 밖의 전기용품으로 나뉩니다.",
        tests: "절연, 내전압, 온도 상승, 잡음 전계 강도",
        period: "4~8주",
      });
    }
    if (kind === "ict" && !wireless) {
      out.push({
        id: "jp-vcci",
        name: "VCCI (자율 규제)",
        short: "VCCI",
        reason: "정보기기는 VCCI 자율 규제 기준으로 전자파를 맞추는 것이 일반적입니다.",
        tests: "전도·방사 방출",
        period: "2~3주",
      });
    }
  }

  if (country === "cn") {
    if (ac && kind !== "industrial") {
      out.push({
        id: "cn-ccc",
        name: "CCC 강제인증",
        short: "CCC",
        reason: "강제인증 목록에 든 품목은 CCC 없이 수입·판매할 수 없습니다. 공장 심사가 함께 진행됩니다.",
        tests: "중국 지정시험소 시험 (GB 4943.1, GB 4706.1 등)",
        period: "10~14주",
      });
    }
    if (wireless) {
      out.push({
        id: "cn-srrc",
        name: radio === "cell" ? "SRRC·CTA (망 접속 허가)" : "SRRC 형식승인",
        short: radio === "cell" ? "SRRC·CTA" : "SRRC",
        reason: radio === "cell" ? "무선 형식승인과 함께 통신망 접속 허가를 받아야 합니다." : "무선 기능이 있는 제품은 무선 형식승인이 필요합니다.",
        tests: "주파수 범위, 송신 출력, 스퓨리어스 발사",
        period: radio === "cell" ? "10~14주" : "6~8주",
      });
    }
  }

  if (country === "au") {
    const parts = ["EMC", wireless ? "무선" : "", ac ? "전기안전" : ""].filter(Boolean).join("·");
    out.push({
      id: "au-rcm",
      name: `RCM (${parts})`,
      short: "RCM",
      reason: "호주는 전자파, 무선, 전기안전 규정을 RCM 표시 하나로 관리합니다. 공급자 등록을 먼저 합니다.",
      tests: ["AS/NZS CISPR 32", wireless ? "AS/NZS 4268" : "", ac ? "AS/NZS 62368.1" : ""].filter(Boolean).join(", "),
      period: "3~5주",
    });
  }

  if (out.length === 0) {
    out.push({
      id: `${country}-check`,
      name: "강제 인증 대상 여부 확인",
      short: `${COUNTRIES.find((c) => c.v === country)?.label} 인증 검토`,
      reason: "고른 조건에서는 강제 인증 대상이 아닌 경우가 많습니다. 품목 분류(HS 코드)로 한 번 더 확인합니다.",
      tests: "품목 분류 검토, 수입 통관 서류 확인",
      period: "1주 안팎",
    });
  }
  return out;
}

function maxWeeks(period: string) {
  const m = period.match(/(\d+)~(\d+)주/);
  return m ? Number(m[2]) : 0;
}

function ChipGroup<T extends string>({
  legend,
  value,
  options,
  onPick,
}: {
  legend: string;
  value: T;
  options: { v: T; label: string; icon: typeof Plug }[];
  onPick: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[15px] font-bold">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o.v;
          return (
            <button
              key={o.v}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(o.v)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-[8px] border px-3 text-[15px] font-semibold transition-colors"
              style={on ? { background: C.indigo, color: C.white, borderColor: C.indigo } : { background: C.white, color: C.ink, borderColor: C.line }}
            >
              <o.icon size={17} aria-hidden style={{ color: on ? C.cyan : C.muted }} />
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Finder({ onAdd }: { onAdd: (names: string[]) => void }) {
  const reduce = useReducedMotionSafe();
  const [power, setPower] = useState<Power>("adapter");
  const [radio, setRadio] = useState<Radio>("bt");
  const [kind, setKind] = useState<Kind>("home");
  const [countries, setCountries] = useState<Country[]>(["kr", "us", "eu"]);
  const [added, setAdded] = useState<string>("");

  const input = { power, radio, kind };
  const groups = COUNTRIES.filter((c) => countries.includes(c.v)).map((c) => ({ ...c, items: certsFor(c.v, input) }));
  const all = groups.flatMap((g) => g.items);
  const longest = Math.max(0, ...all.map((c) => maxWeeks(c.period)));
  const signature = `${power}-${radio}-${kind}-${countries.join(",")}`;

  const toggleCountry = (v: Country) => setCountries((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const addAll = () => {
    onAdd(all.map((c) => c.short));
    setAdded(signature);
    document.getElementById("quote")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section aria-labelledby="finder-title" id="finder" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={GRAPH}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="finder-title"
          tag="필요한 인증 찾기"
          title="우리 제품에 필요한 인증 찾기"
          desc="전원과 무선 기능, 제품 분류, 판매할 국가를 고르면 받아야 할 가능성이 높은 인증을 국가별로 보여 드립니다."
        />

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[400px_1fr]">
          <div className="space-y-6 rounded-[10px] border bg-white p-5 md:p-6 lg:sticky lg:top-20" style={{ borderColor: C.line }}>
            <ChipGroup legend="전원 방식" value={power} options={POWER_OPTS} onPick={setPower} />
            <ChipGroup legend="무선 기능" value={radio} options={RADIO_OPTS} onPick={setRadio} />
            <ChipGroup legend="제품 분류" value={kind} options={KIND_OPTS} onPick={setKind} />
            <fieldset>
              <legend className="text-[15px] font-bold">
                판매 국가 <span className="font-normal" style={{ color: C.muted }}>(여러 곳 선택)</span>
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                {COUNTRIES.map((c) => {
                  const on = countries.includes(c.v);
                  return (
                    <button
                      key={c.v}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleCountry(c.v)}
                      className="inline-flex h-11 items-center gap-2 rounded-[8px] border px-3 text-[15px] font-semibold"
                      style={on ? { background: C.cyanSoft, color: C.indigoDeep, borderColor: C.cyan } : { background: C.white, color: C.ink, borderColor: C.line }}
                    >
                      <span
                        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border"
                        style={on ? { background: C.cyan, borderColor: C.cyan, color: C.white } : { borderColor: "#b4bdd0" }}
                        aria-hidden
                      >
                        {on && <Check size={14} strokeWidth={3} />}
                      </span>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] px-5 py-4" style={{ background: C.indigo, color: C.white }} aria-live="polite">
              {groups.length > 0 ? (
                <p className="text-[16px]">
                  국가 <strong className="tabular-nums">{groups.length}</strong>곳, 인증 <strong className="tabular-nums">{all.length}</strong>건
                  {longest > 0 && (
                    <span style={{ color: "#c8cdea" }}>
                      {" "}
                      · 함께 진행하면 약 <span className="tabular-nums">{longest}</span>주
                    </span>
                  )}
                </p>
              ) : (
                <p>판매할 국가를 하나 이상 골라 주세요.</p>
              )}
              <button
                type="button"
                onClick={addAll}
                disabled={all.length === 0}
                className="inline-flex h-11 items-center gap-1.5 rounded-[8px] px-4 text-[15px] font-bold disabled:opacity-40"
                style={{ background: C.cyan, color: C.indigoDeep }}
              >
                {added === signature ? <Check size={18} aria-hidden /> : <Plus size={18} aria-hidden />}
                {added === signature ? "견적에 담았습니다" : "견적에 담기"}
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <AnimatePresence initial={false}>
                {groups.map((g) => (
                  <motion.section
                    key={g.v}
                    aria-label={`${g.label} 인증`}
                    className="rounded-[10px] border bg-white"
                    style={{ borderColor: C.line }}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: EASE }}
                  >
                    <h3 className="flex items-center gap-2.5 border-b px-5 py-3 text-[17px] font-bold" style={{ borderColor: C.line }}>
                      <span className="inline-flex h-7 min-w-9 items-center justify-center rounded-[6px] px-1.5 text-[13px] font-bold tracking-[0.04em]" style={{ background: C.indigoSoft, color: C.indigo }}>
                        {g.code}
                      </span>
                      {g.label}
                      <span className="ml-auto text-[14px] font-semibold tabular-nums" style={{ color: C.muted }}>
                        {g.items.length}건
                      </span>
                    </h3>
                    <ul>
                      {g.items.map((c) => (
                        <li key={c.id} className="border-b px-5 py-4 last:border-b-0" style={{ borderColor: C.paper }}>
                          <p className="font-bold" style={{ color: C.indigo }}>
                            {c.name}
                          </p>
                          <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                            {c.reason}
                          </p>
                          <dl className="mt-2.5 grid gap-x-6 gap-y-1 text-[14px] sm:grid-cols-[1fr_auto]">
                            <div className="flex min-w-0 gap-2">
                              <dt className="shrink-0 font-semibold" style={{ color: C.cyanText }}>
                                시험 항목
                              </dt>
                              <dd className="min-w-0">{c.tests}</dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="shrink-0 font-semibold" style={{ color: C.cyanText }}>
                                예상 기간
                              </dt>
                              <dd className="font-bold tabular-nums">{c.period}</dd>
                            </div>
                          </dl>
                        </li>
                      ))}
                    </ul>
                  </motion.section>
                ))}
              </AnimatePresence>
            </div>
            <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
              품목과 사양에 따라 달라질 수 있어 최종 대상은 사양서를 보고 알려 드립니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 해외인증 세계 지도 ---------- */

type RegionId = "na" | "sa" | "eu" | "as" | "af" | "oc";

type Poly = number[][];

const REGION_SHAPES: Record<RegionId, Poly[]> = {
  na: [
    [[33, 65], [83, 48], [194, 41], [278, 41], [328, 86], [347, 121], [306, 145], [278, 183], [275, 207], [255, 197], [250, 218], [268, 262], [262, 268], [236, 236], [206, 207], [175, 152], [140, 128], [100, 100], [60, 95]],
    [[347, 14], [444, 14], [444, 52], [375, 86], [347, 52]],
  ],
  sa: [[[278, 265], [333, 259], [361, 293], [403, 317], [389, 369], [347, 414], [311, 483], [292, 448], [300, 355], [275, 310]]],
  eu: [[[472, 169], [475, 145], [486, 128], [483, 121], [483, 93], [514, 79], [528, 48], [583, 48], [611, 66], [625, 103], [611, 138], [578, 152], [555, 162], [533, 162], [508, 148]]],
  af: [[[425, 221], [486, 172], [528, 166], [589, 186], [619, 252], [642, 252], [611, 345], [592, 390], [555, 414], [533, 352], [525, 279], [478, 279], [453, 245]]],
  as: [
    [[611, 66], [694, 38], [806, 28], [889, 41], [990, 59], [944, 86], [889, 114], [861, 148], [839, 190], [806, 224], [792, 259], [778, 286], [769, 234], [750, 217], [717, 265], [700, 224], [658, 207], [644, 241], [619, 252], [589, 186], [600, 165], [578, 152], [611, 138], [625, 103]],
    [[858, 180], [880, 160], [900, 140], [912, 148], [893, 172], [868, 194]],
    [[764, 276], [792, 314], [833, 324], [892, 321], [892, 300], [847, 282], [828, 269]],
  ],
  oc: [
    [[817, 369], [817, 410], [861, 403], [889, 424], [917, 424], [925, 386], [903, 345], [878, 334], [861, 341], [839, 352]],
    [[972, 410], [992, 420], [982, 442], [962, 460], [956, 448]],
  ],
};

function inPoly(x: number, y: number, poly: Poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const DOT_STEP = 13;
const REGION_IDS: RegionId[] = ["na", "sa", "eu", "af", "as", "oc"];

/** 모듈을 불러올 때 한 번만 계산하는 점 지도. 서버와 브라우저에서 같은 값이 나온다. */
const REGION_DOTS: Record<RegionId, [number, number][]> = (() => {
  const dots: Record<RegionId, [number, number][]> = { na: [], sa: [], eu: [], af: [], as: [], oc: [] };
  for (let y = 8; y < 500; y += DOT_STEP) {
    for (let x = 8; x < 1000; x += DOT_STEP) {
      const id = REGION_IDS.find((r) => REGION_SHAPES[r].some((p) => inPoly(x, y, p)));
      if (id) dots[id].push([x, y]);
    }
  }
  return dots;
})();

interface RegionInfo {
  name: string;
  label: [number, number];
  countries: { name: string; certs: { name: string; desc: string }[] }[];
}

const REGIONS: Record<RegionId, RegionInfo> = {
  na: {
    name: "북미",
    label: [196, 120],
    countries: [
      {
        name: "미국",
        certs: [
          { name: "FCC", desc: "전자파와 무선 인증. 무선기기는 FCC ID, 그 밖의 디지털 기기는 공급자 적합성 선언" },
          { name: "NRTL (UL 등)", desc: "전기안전 인증. 유통사와 설치 현장에서 요구" },
          { name: "ENERGY STAR", desc: "에너지 효율 자율 표시" },
        ],
      },
      {
        name: "캐나다",
        certs: [
          { name: "ISED", desc: "무선기기 인증과 디지털 기기 ICES-003 표시" },
          { name: "CSA 규격 안전 인증", desc: "주별 전기안전 규정에 따른 인증" },
        ],
      },
      {
        name: "멕시코",
        certs: [
          { name: "IFT", desc: "통신·무선기기 인증" },
          { name: "NOM", desc: "전기안전과 에너지 효율 공식 규격 인증" },
        ],
      },
    ],
  },
  sa: {
    name: "남미",
    label: [338, 372],
    countries: [
      {
        name: "브라질",
        certs: [
          { name: "ANATEL", desc: "통신·무선기기 인증, 현지 시험 필요" },
          { name: "INMETRO", desc: "전기안전과 에너지 효율 인증" },
        ],
      },
      { name: "아르헨티나", certs: [{ name: "ENACOM", desc: "통신·무선기기 형식승인" }, { name: "S마크", desc: "저전압 전기제품 안전 인증" }] },
      { name: "칠레", certs: [{ name: "SUBTEL", desc: "무선기기 승인" }, { name: "SEC", desc: "전기제품 안전과 효율 인증" }] },
      { name: "콜롬비아", certs: [{ name: "CRC", desc: "통신 단말기 형식승인" }, { name: "RETIE", desc: "전기설비·제품 기술 규정 적합 인증" }] },
    ],
  },
  eu: {
    name: "유럽",
    label: [548, 112],
    countries: [
      { name: "유럽연합", certs: [{ name: "CE", desc: "RED, EMC, LVD 지침 적합 선언과 기술 문서" }, { name: "RoHS·WEEE", desc: "유해물질 제한과 폐전자제품 회수 의무" }] },
      { name: "영국", certs: [{ name: "UKCA", desc: "영국 적합성 표시. CE 성적서를 바탕으로 준비" }] },
      { name: "유라시아경제연합", certs: [{ name: "EAC", desc: "러시아, 카자흐스탄 등 회원국 공통 기술 규정 인증" }] },
    ],
  },
  af: {
    name: "아프리카",
    label: [548, 300],
    countries: [
      { name: "남아프리카공화국", certs: [{ name: "ICASA", desc: "통신·무선기기 형식승인" }, { name: "NRCS", desc: "전기안전 의무 규격 승인" }] },
      { name: "나이지리아", certs: [{ name: "NCC", desc: "통신기기 형식승인" }, { name: "SONCAP", desc: "수입 제품 적합성 평가" }] },
      { name: "케냐", certs: [{ name: "CA", desc: "통신기기 형식승인" }, { name: "PVoC", desc: "선적 전 적합성 검사" }] },
      { name: "이집트", certs: [{ name: "NTRA", desc: "통신·무선기기 승인" }] },
    ],
  },
  as: {
    name: "아시아",
    label: [760, 132],
    countries: [
      { name: "일본", certs: [{ name: "TELEC", desc: "무선기기 기술기준적합증명" }, { name: "PSE", desc: "전기용품안전법 적합 표시" }, { name: "VCCI", desc: "정보기기 전자파 자율 규제" }] },
      { name: "중국", certs: [{ name: "CCC", desc: "강제인증 목록 품목의 안전·전자파 인증" }, { name: "SRRC", desc: "무선기기 형식승인" }] },
      { name: "대만", certs: [{ name: "NCC", desc: "통신·무선기기 인증" }, { name: "BSMI", desc: "전기안전과 전자파 검사" }] },
      { name: "인도", certs: [{ name: "BIS", desc: "전자·IT 제품 의무 등록" }, { name: "WPC", desc: "무선기기 승인" }] },
      { name: "베트남", certs: [{ name: "MIC", desc: "정보통신기기 적합 인증과 신고" }] },
      { name: "사우디아라비아", certs: [{ name: "SASO", desc: "제품 안전 적합 인증" }, { name: "CST", desc: "통신·무선기기 형식승인" }] },
    ],
  },
  oc: {
    name: "오세아니아",
    label: [868, 384],
    countries: [
      { name: "호주", certs: [{ name: "RCM", desc: "전자파, 무선, 전기안전을 하나로 표시. 공급자 등록 필요" }] },
      { name: "뉴질랜드", certs: [{ name: "RCM", desc: "호주와 같은 표시 체계, 무선은 별도 규정 확인" }] },
    ],
  },
};

function GlobalMap() {
  const reduce = useReducedMotionSafe();
  const [region, setRegion] = useState<RegionId>("na");
  const [focus, setFocus] = useState<RegionId | null>(null);
  const info = REGIONS[region];
  const panelId = useId();

  const onKey = (id: RegionId) => (e: ReactKeyboardEvent<SVGGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setRegion(id);
    }
  };

  return (
    <section aria-labelledby="global-title" id="global" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.indigoDeep, color: C.white }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="global-title"
          tag="해외인증"
          title="대륙별 해외인증 안내"
          desc="지도에서 대륙을 누르면 국가별로 받아야 하는 인증과 내용을 볼 수 있습니다. 국내 성적서를 인정하는 국가는 여기서 시험하고, 현지 시험이 필요한 국가는 협력 기관과 진행합니다."
          light
        />

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="min-w-0">
            <div className="rounded-[10px] border p-2 md:p-4" style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}>
              <svg viewBox="0 0 1000 500" className="h-auto w-full" role="group" aria-label="대륙을 골라 해외인증 보기">
                {REGION_IDS.map((id) => {
                  const on = region === id;
                  const hot = focus === id;
                  return (
                    <g
                      key={id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={on}
                      aria-label={`${REGIONS[id].name}, 국가 ${REGIONS[id].countries.length}곳`}
                      aria-controls={panelId}
                      onClick={() => setRegion(id)}
                      onKeyDown={onKey(id)}
                      onFocus={() => setFocus(id)}
                      onBlur={() => setFocus(null)}
                      onMouseEnter={() => setFocus(id)}
                      onMouseLeave={() => setFocus(null)}
                      className="cursor-pointer outline-none"
                    >
                      {REGION_SHAPES[id].map((p, i) => (
                        <polygon
                          key={i}
                          points={p.map(([x, y]) => `${x},${y}`).join(" ")}
                          fill="transparent"
                          stroke={hot ? C.cyan : "transparent"}
                          strokeWidth="2"
                          strokeDasharray="6 5"
                          strokeLinejoin="round"
                        />
                      ))}
                      {REGION_DOTS[id].map(([x, y]) => (
                        <circle key={`${x}-${y}`} cx={x} cy={y} r={4.4} fill={on ? C.cyan : hot ? "#7c88c9" : "#4a5598"} style={{ transition: reduce ? undefined : "fill 0.25s" }} />
                      ))}
                      <g pointerEvents="none">
                        <rect
                          x={REGIONS[id].label[0] - 54}
                          y={REGIONS[id].label[1] - 21}
                          width="108"
                          height="38"
                          rx="8"
                          fill={on ? C.white : C.indigoDeep}
                          stroke={on ? C.white : "rgba(255,255,255,0.35)"}
                        />
                        <text x={REGIONS[id].label[0]} y={REGIONS[id].label[1] + 6} textAnchor="middle" fontSize="20" fontWeight={700} fill={on ? C.indigo : C.white}>
                          {REGIONS[id].name}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="대륙 목록">
              {REGION_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={region === id}
                  aria-controls={panelId}
                  onClick={() => setRegion(id)}
                  className="h-10 rounded-[8px] border px-3.5 text-[15px] font-semibold"
                  style={region === id ? { background: C.cyan, color: C.indigoDeep, borderColor: C.cyan } : { borderColor: "rgba(255,255,255,0.25)", color: C.white }}
                >
                  {REGIONS[id].name}
                </button>
              ))}
            </div>
          </div>

          <div id={panelId} aria-live="polite" className="min-w-0 rounded-[10px] bg-white p-5 md:p-6" style={{ color: C.ink }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={region}
                initial={reduce ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, x: -8 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <h3 className="flex items-baseline justify-between gap-2 text-[22px] font-bold tracking-[-0.02em]">
                  {info.name}
                  <span className="text-[14px] font-semibold tabular-nums" style={{ color: C.muted }}>
                    국가 {info.countries.length}곳
                  </span>
                </h3>
                <dl className="mt-4 space-y-4">
                  {info.countries.map((c) => (
                    <div key={c.name} className="border-t pt-3.5" style={{ borderColor: C.line }}>
                      <dt className="font-bold" style={{ color: C.indigo }}>
                        {c.name}
                      </dt>
                      <dd>
                        <ul className="mt-1.5 space-y-1.5">
                          {c.certs.map((ct) => (
                            <li key={ct.name} className="flex gap-2.5 text-[15px] leading-[1.55]">
                              <span className="mt-0.5 inline-flex h-6 shrink-0 items-center rounded-[6px] px-2 text-[13px] font-bold" style={{ background: C.cyanSoft, color: C.cyanText }}>
                                {ct.name}
                              </span>
                              <span style={{ color: C.muted }}>{ct.desc}</span>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 시험 진행 조회 ---------- */

const STEPS = ["접수", "시료 입고", "시험 중", "성적서 발행", "인증 신청", "인증 완료"];
const STEP_OFFSET = [0, 3, 7, 16, 19, 28];

type TestKind = "EMC" | "RF" | "SAFETY";

const TEST_KIND: TestKind[] = ["EMC", "RF", "SAFETY", "EMC"];
const TEST_LABEL: Record<TestKind, string> = { EMC: "전자파 적합성 시험", RF: "무선 적합인증 시험", SAFETY: "전기용품 안전 시험" };
const PRODUCTS: Record<TestKind, string[]> = {
  EMC: ["셋톱박스", "디지털 도어록", "네트워크 카메라", "산업용 제어기"],
  RF: ["블루투스 스피커", "무선 이어폰", "Wi-Fi 공유기", "LTE 위치 추적기"],
  SAFETY: ["전기 그릴", "가습기", "LED 스탠드", "전기 히터"],
};
const ITEMS: Record<Exclude<TestKind, "EMC">, string[]> = {
  RF: ["송신 출력", "주파수 허용편차", "점유주파수폭", "불요발사"],
  SAFETY: ["절연저항", "내전압", "온도 상승", "누설전류"],
};

const SAMPLE_NO = "TE-2609-0412";

interface TrackResult {
  no: string;
  step: number;
  kind: TestKind;
  product: string;
  dates: Date[];
}

function lookup(raw: string): TrackResult | null {
  const s = raw.trim().toUpperCase().replace(/\s/g, "");
  const tail = s.match(/(\d{4})$/);
  if (!tail) return null;
  const seed = Number(tail[1]);
  const ym = s.match(/(\d{2})(0[1-9]|1[0-2])-?\d{4}$/);
  const yy = ym ? Number(ym[1]) : 26;
  const mm = ym ? Number(ym[2]) : 9;
  const kind = TEST_KIND[(seed * 7) % 4];
  const start = new Date(2000 + yy, mm - 1, 1 + (seed % 9));
  return {
    no: `TE-${pad2(yy)}${pad2(mm)}-${tail[1]}`,
    step: seed % 6,
    kind,
    product: PRODUCTS[kind][seed % 4],
    dates: STEP_OFFSET.map((o) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + o)),
  };
}

function Spectrum({ pending, replayKey }: { pending: boolean; replayKey: string }) {
  const reduce = useReducedMotionSafe();
  const freqTicks = [30, 50, 100, 200, 300, 500, 1000];
  const dbTicks = [10, 20, 30, 40, 50, 60];
  return (
    <svg
      viewBox="0 0 480 268"
      className="h-auto w-full"
      role="img"
      aria-label={`30MHz부터 1GHz까지 방사 방출 측정 그래프. 기준선 아래에 측정값이 있고 가장 가까운 지점은 ${WORST.f}MHz에서 기준보다 ${WORST_MARGIN}dB 낮습니다.`}
    >
      <rect x={SX0} y={SY0} width={SX1 - SX0} height={SY1 - SY0} fill={C.paper} />
      {dbTicks.map((d) => (
        <g key={d}>
          <path d={`M${SX0} ${dy(d)} H${SX1}`} stroke={C.grid} strokeWidth="1" />
          <text x={SX0 - 6} y={dy(d) + 4} textAnchor="end" fontSize="12" fill={C.muted} className="tabular-nums">
            {d}
          </text>
        </g>
      ))}
      {freqTicks.map((f) => (
        <g key={f}>
          <path d={`M${fx(f)} ${SY0} V${SY1}`} stroke={C.grid} strokeWidth="1" />
          <text x={fx(f)} y={SY1 + 17} textAnchor="middle" fontSize="12" fill={C.muted} className="tabular-nums">
            {f >= 1000 ? "1G" : `${f}M`}
          </text>
        </g>
      ))}
      <text x={SX0} y={SY1 + 36} fontSize="12" fill={C.muted}>
        주파수 (Hz)
      </text>
      <text x={SX1} y={SY1 + 36} fontSize="12" fill={C.muted} textAnchor="end">
        세로축 dBμV/m
      </text>

      <path d={LIMIT_PATH} fill="none" stroke={C.error} strokeWidth="1.8" strokeDasharray="6 4" />
      <text x={fx(232)} y={dy(47) - 6} fontSize="12" fill={C.error} fontWeight={700}>
        기준 B급
      </text>

      <motion.path
        key={replayKey}
        d={TRACE_PATH}
        fill="none"
        stroke={C.indigo}
        strokeWidth="1.6"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />

      {!pending &&
        PEAKS.map((p, i) => {
          const worst = p === WORST;
          return (
            <motion.g
              key={`${replayKey}-${p.f}`}
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.3, delay: reduce ? 0 : 1.4 + i * 0.08 }}
            >
              <path d={`M${fx(p.f)} ${dy(p.v) - 6} l5 6 l-5 6 l-5 -6 Z`} fill={worst ? C.cyan : C.white} stroke={worst ? C.indigoDeep : C.indigo} strokeWidth="1.2" />
              {worst && (
                <>
                  <path d={`M${fx(p.f)} ${dy(limitAt(p.f))} V${dy(p.v) - 7}`} stroke={C.indigoDeep} strokeWidth="1.2" />
                  <rect x={fx(p.f) + 8} y={dy(p.v) - 46} width="106" height="24" rx="5" fill={C.indigoDeep} />
                  <text x={fx(p.f) + 61} y={dy(p.v) - 29} textAnchor="middle" fontSize="12.5" fontWeight={700} fill={C.white}>
                    최소 여유 {WORST_MARGIN}dB
                  </text>
                </>
              )}
            </motion.g>
          );
        })}
    </svg>
  );
}

function Tracking({ minute }: { minute: number }) {
  const reduce = useReducedMotionSafe();
  const [query, setQuery] = useState(SAMPLE_NO);
  const [result, setResult] = useState<TrackResult | null>(() => lookup(SAMPLE_NO));
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = lookup(query);
    if (!r) {
      setError("접수번호 끝 네 자리 숫자를 확인해 주세요. 예: TE-2609-0412");
      return;
    }
    setError("");
    setQuery(r.no);
    setResult(r);
  };

  const today = minute < 0 ? null : new Date(minute * 60_000);
  const elapsed = result && today ? Math.round((dayStart(today) - dayStart(result.dates[0])) / 86_400_000) : null;

  return (
    <section aria-labelledby="track-title" id="track" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.paper }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="track-title"
          tag="시험 진행 조회"
          title="시험이 어디까지 왔는지 확인하세요"
          desc="접수 확인 메일에 적힌 접수번호를 넣으면 단계별 날짜와 시험 결과를 볼 수 있습니다."
        />

        <form onSubmit={submit} noValidate className="mt-8 flex max-w-[560px] flex-col gap-2 sm:flex-row">
          <label htmlFor="track-no" className="sr-only">
            접수번호
          </label>
          <input
            id="track-no"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={SAMPLE_NO}
            autoComplete="off"
            aria-invalid={!!error}
            aria-describedby={error ? "track-err" : undefined}
            className="h-12 min-w-0 flex-1 rounded-[8px] border bg-white px-4 text-[17px] font-semibold tracking-[0.02em] tabular-nums outline-none focus:border-[#23307a]"
            style={{ borderColor: error ? C.error : C.line }}
          />
          <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] px-6 font-bold" style={{ background: C.indigo, color: C.white }}>
            <Search size={18} aria-hidden />
            조회
          </button>
        </form>
        {error && (
          <p id="track-err" role="alert" className="mt-2 text-[15px] font-semibold" style={{ color: C.error }}>
            {error}
          </p>
        )}

        {result && (
          <div className="mt-6 rounded-[10px] border bg-white" style={{ borderColor: C.line }} aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b px-5 py-4 md:px-6" style={{ borderColor: C.line }}>
              <div className="min-w-0">
                <p className="text-[14px]" style={{ color: C.muted }}>
                  {result.no} · 의뢰사 (주)△△전자
                </p>
                <p className="text-[19px] font-bold tracking-[-0.02em]">
                  {result.product} <span style={{ color: C.cyanText }}>{TEST_LABEL[result.kind]}</span>
                </p>
              </div>
              <p className="text-[15px]">
                <span style={{ color: C.muted }}>현재 단계 </span>
                <strong style={{ color: C.indigo }}>{STEPS[result.step]}</strong>
                {elapsed !== null && elapsed >= 0 && result.step < 5 && (
                  <span className="tabular-nums" style={{ color: C.muted }}>
                    {" "}
                    · 접수 후 {elapsed + 1}일째
                  </span>
                )}
              </p>
            </div>

            <ol className="grid grid-cols-1 gap-0 px-5 py-5 sm:grid-cols-3 md:px-6 lg:grid-cols-6">
              {STEPS.map((s, i) => {
                const done = i < result.step || result.step === 5;
                const now = i === result.step && result.step !== 5;
                return (
                  <li key={s} className="relative flex gap-3 pb-4 sm:block sm:pb-5 sm:pr-3" aria-current={now ? "step" : undefined}>
                    <div className="flex flex-col items-center sm:flex-row">
                      <motion.span
                        className="relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[14px] font-bold tabular-nums"
                        style={
                          done
                            ? { background: C.indigo, borderColor: C.indigo, color: C.white }
                            : now
                              ? { background: C.white, borderColor: C.cyan, color: C.indigo }
                              : { background: C.white, borderColor: C.line, color: C.muted }
                        }
                        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.07, ease: EASE }}
                        key={`${result.no}-${i}`}
                      >
                        {done ? <Check size={16} strokeWidth={3} aria-hidden /> : i + 1}
                        {now && !reduce && <span className="absolute inset-[-5px] animate-ping rounded-full border-2 motion-reduce:hidden" style={{ borderColor: C.cyan, opacity: 0.35 }} aria-hidden />}
                      </motion.span>
                      {i < STEPS.length - 1 && <span className="mt-1 w-0.5 flex-1 sm:ml-1 sm:mt-0 sm:h-0.5 sm:w-auto" style={{ background: done ? C.indigo : C.line }} aria-hidden />}
                    </div>
                    <div className="sm:mt-2.5">
                      <p className="font-bold" style={{ color: done || now ? C.ink : C.muted }}>
                        {s}
                        {now && <span className="sr-only"> (현재 단계)</span>}
                      </p>
                      <p className="text-[14px] tabular-nums" style={{ color: C.muted }}>
                        {done || now ? mdw(result.dates[i]) : `${md(result.dates[i])} 예정`}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="border-t px-5 py-5 md:px-6" style={{ borderColor: C.line }}>
              {result.step < 2 ? (
                <p className="rounded-[8px] px-4 py-3 text-[15px]" style={{ background: C.paper, color: C.muted }}>
                  {result.step === 0 ? "시료가 들어오면 시험 일정을 확정해 메일로 알려 드립니다." : `${md(result.dates[2])}에 시험을 시작합니다. 시험 모드 설정이 필요한 시료는 담당 시험원이 먼저 연락드립니다.`}
                </p>
              ) : result.kind === "EMC" ? (
                <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
                  <div className="min-w-0">
                    <p className="font-bold">
                      방사 방출 {result.step === 2 ? "예비 측정" : "측정 결과"} <span className="text-[14px] font-normal" style={{ color: C.muted }}>3m, 수평·수직 편파 중 큰 값</span>
                    </p>
                    <div className="mt-3">
                      <Spectrum pending={false} replayKey={result.no} />
                    </div>
                  </div>
                  <div>
                    <dl className="divide-y rounded-[8px] border text-[15px]" style={{ borderColor: C.line }}>
                      {[
                        ["판정", result.step === 2 ? "측정 중" : "적합"],
                        ["최소 여유", `${WORST_MARGIN}dB (${WORST.f}MHz)`],
                        ["기준", "방사 방출 B급, 준첨두값"],
                        ["측정 장소", "3m 전파무향실"],
                      ].map(([k, v], i) => (
                        <div key={k} className="flex items-center justify-between gap-3 px-4 py-2.5" style={{ borderColor: C.line }}>
                          <dt style={{ color: C.muted }}>{k}</dt>
                          <dd
                            className={`text-right tabular-nums ${i === 0 ? "rounded-[6px] px-2.5 py-0.5 font-bold" : "font-semibold"}`}
                            style={i === 0 ? (result.step === 2 ? { background: C.cyanSoft, color: C.cyanText } : { background: C.okSoft, color: C.ok }) : undefined}
                          >
                            {v}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
                      표시한 점은 준첨두값으로 다시 잰 주요 신호입니다. 담당 시험원 김○○, {TEL}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[320px] text-left text-[15px]">
                    <caption className="pb-2 text-left font-bold">{TEST_LABEL[result.kind]} 항목별 결과</caption>
                    <thead>
                      <tr style={{ color: C.muted }}>
                        <th scope="col" className="py-2 pr-3 font-semibold">
                          항목
                        </th>
                        <th scope="col" className="py-2 font-semibold">
                          결과
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ITEMS[result.kind].map((it, i) => {
                        const pass = result.step >= 3 || i < 2;
                        return (
                          <tr key={it} className="border-t" style={{ borderColor: C.line }}>
                            <th scope="row" className="py-2.5 pr-3 font-semibold">
                              {it}
                            </th>
                            <td className="py-2.5">
                              <span className="rounded-[6px] px-2.5 py-0.5 text-[14px] font-bold" style={pass ? { background: C.okSoft, color: C.ok } : { background: C.cyanSoft, color: C.cyanText }}>
                                {pass ? "적합" : "시험 중"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- 회사소개 ---------- */

const ACCREDIT = [
  { k: "전파법 지정시험기관", v: "전자파 적합성(EMC), 무선기기(RF) 분야", no: "제KT0000호" },
  { k: "ISO/IEC 17025 공인시험기관 인정", v: "전기·전자, 전자파 분야", no: "제KT0000호" },
  { k: "전기용품 안전 시험기관 지정", v: "가정용 전기기기, 조명기기, 정보기기", no: "제0000-00호" },
  { k: "해외 인증기관 협력 시험소", v: "△△ 인증기관(북미), △△ 인증기관(유럽)", no: "협약 2건" },
  { k: "에너지 효율 시험기관 지정", v: "조명기기, 전원 장치", no: "제0000-000호" },
];

function About() {
  return (
    <section aria-labelledby="about-title" id="about" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid items-start gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
          <div>
            <SectionHead id="about-title" tag="회사소개" title="인사말" />
            <div className="mt-5 space-y-3" style={{ color: C.muted }}>
              <p>{COMPANY}은 전자파 시험실 하나로 시작해 지금은 무선, 전기안전, 해외 인증까지 맡는 지정시험기관이 되었습니다.</p>
              <p>시험은 결과만큼 일정이 중요합니다. 시료가 들어온 날 시험 일정을 정해 알려 드리고, 기준을 넘는 항목이 나오면 원인 주파수와 대책을 함께 말씀드립니다. 처음 인증을 받는 회사도 서류 준비부터 차근차근 안내해 드리겠습니다.</p>
            </div>
            <p className="mt-6 font-bold">대표이사 김○○</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] border" style={{ borderColor: C.line }}>
            <Image
              src={`${IMG}/lab.jpg`}
              alt="스펙트럼 분석기와 오실로스코프가 놓인 전자 시험대"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <h3 className="mt-16 text-[22px] font-bold tracking-[-0.02em] md:text-[26px]">공인 시험소 지정·인정 현황</h3>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {ACCREDIT.map((a) => (
            <li key={a.k} className="flex items-start gap-4 rounded-[10px] border p-4 md:p-5" style={{ borderColor: C.line }}>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]" style={{ background: C.cyanSoft, color: C.cyanText }}>
                <Check size={20} strokeWidth={2.6} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{a.k}</span>
                <span className="block text-[15px]" style={{ color: C.muted }}>
                  {a.v}
                </span>
              </span>
              <span className="shrink-0 text-[14px] font-semibold tabular-nums" style={{ color: C.indigo }}>
                {a.no}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 시험 설비 ---------- */

const FACILITIES = [
  {
    name: "3m 전파무향실",
    body: "방사 방출과 방사 내성을 측정합니다. 지름 2m 턴테이블과 1~4m 안테나 마스트를 갖췄습니다.",
    specs: [
      ["크기", "9 × 6 × 6 m"],
      ["주파수", "30MHz ~ 18GHz"],
      ["턴테이블 하중", "1.2톤"],
    ],
    draw: "chamber" as const,
  },
  {
    name: "차폐실",
    body: "외부 전파를 막은 방에서 정전기, 전도 내성, 서지 같은 내성 시험을 합니다.",
    specs: [
      ["차폐 성능", "100dB 이상"],
      ["정전기 방전", "±30kV까지"],
      ["서지", "6kV까지"],
    ],
    draw: "shield" as const,
  },
  {
    name: "전도 시험 설비",
    body: "전원선과 통신선으로 나가는 잡음을 의사 전원망(LISN)으로 측정합니다.",
    specs: [
      ["주파수", "150kHz ~ 30MHz"],
      ["전원", "단상·삼상 100A"],
      ["통신선", "ISN 8선"],
    ],
    draw: "conducted" as const,
  },
  {
    name: "안전 시험실",
    body: "절연, 내전압, 온도 상승, 누설전류를 재고 구조와 부품을 검토합니다.",
    specs: [
      ["내전압", "AC 5kV"],
      ["온도 기록", "60채널"],
      ["항온항습", "-40 ~ 150°C"],
    ],
    draw: "safety" as const,
  },
];

function FacilityIcon({ kind }: { kind: (typeof FACILITIES)[number]["draw"] }) {
  const s = { fill: "none", stroke: C.indigo, strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 120 64" className="h-16 w-full" aria-hidden>
      <rect x="0.5" y="0.5" width="119" height="63" rx="6" fill={C.paper} stroke={C.line} />
      {kind === "chamber" && (
        <>
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${12 + i * 11} 14 l5 -7 l5 7`} {...s} stroke={C.cyan} />
          ))}
          <ellipse cx="44" cy="50" rx="18" ry="4" {...s} />
          <rect x="38" y="36" width="12" height="10" rx="1.5" {...s} />
          <path d="M92 52 V24 M86 24 H98 M88 28 H96" {...s} />
        </>
      )}
      {kind === "shield" && (
        <>
          <rect x="16" y="12" width="88" height="42" rx="3" {...s} strokeDasharray="4 3" />
          <path d="M44 20 l-8 14 h10 l-6 14" {...s} stroke={C.cyan} />
          <rect x="62" y="34" width="26" height="14" rx="2" {...s} />
        </>
      )}
      {kind === "conducted" && (
        <>
          <path d="M10 40 H38 M70 40 H110" {...s} />
          <rect x="38" y="30" width="32" height="20" rx="2" {...s} />
          <path d="M42 22 C48 12 54 32 60 18 S66 24 70 18" {...s} stroke={C.cyan} />
          <text x="54" y="44" textAnchor="middle" fontSize="8" fill={C.indigo} fontWeight={700}>
            LISN
          </text>
        </>
      )}
      {kind === "safety" && (
        <>
          <rect x="18" y="16" width="34" height="34" rx="3" {...s} />
          <path d="M37 22 l-7 12 h8 l-5 10" {...s} stroke={C.cyan} />
          <path d="M70 48 V18 M70 48 a6 6 0 1 0 0.01 0" {...s} />
          <path d="M84 20 H100 M84 30 H96 M84 40 H100" {...s} strokeDasharray="2 3" />
        </>
      )}
    </svg>
  );
}

function Facilities() {
  const reduce = useReducedMotionSafe();
  return (
    <section aria-labelledby="facility-title" id="facility" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.paper, ...GRAPH }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="facility-title" tag="시험 설비" title="주요 시험 설비" desc="측정 장비는 해마다 공인 교정기관에서 교정하고, 무향실은 정기적으로 성능을 검증합니다." />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FACILITIES.map((f, i) => (
            <motion.li
              key={f.name}
              className="flex flex-col rounded-[10px] border bg-white p-5"
              style={{ borderColor: C.line }}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: EASE }}
            >
              <FacilityIcon kind={f.draw} />
              <h3 className="mt-4 text-[19px] font-bold tracking-[-0.02em]">{f.name}</h3>
              <p className="mt-1.5 text-[15px]" style={{ color: C.muted }}>
                {f.body}
              </p>
              <dl className="mt-4 space-y-1 border-t pt-3 text-[14px]" style={{ borderColor: C.line }}>
                {f.specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt style={{ color: C.muted }}>{k}</dt>
                    <dd className="text-right font-bold tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 고객지원: 새소식, 자료실, 질의응답 ---------- */

type BoardTab = "news" | "files";

const BOARD: { tab: BoardTab; title: string; date: string; file?: string }[] = [
  { tab: "news", title: "전파법 시행령 개정에 따른 적합성평가 절차 변경 안내", date: "2026-09-28" },
  { tab: "news", title: "추석 연휴 시료 접수와 성적서 발행 일정 안내", date: "2026-09-15" },
  { tab: "news", title: "3m 전파무향실 정기 검증에 따른 시험 일정 조정 안내", date: "2026-08-30" },
  { tab: "news", title: "방송통신기자재 적합성평가 고시 일부 개정 안내", date: "2026-08-12" },
  { tab: "news", title: "유럽 무선기기 지침 사이버보안 요구사항 시험 대응 안내", date: "2026-07-21" },
  { tab: "news", title: "전기용품 안전기준 개정 사항 설명회 개최 안내", date: "2026-06-30" },
  { tab: "files", title: "시험 의뢰서 양식", date: "2026-09-20", file: "HWP · 48KB" },
  { tab: "files", title: "시료 정보와 시험 모드 기재표", date: "2026-09-02", file: "XLSX · 31KB" },
  { tab: "files", title: "전자파 적합성 시험 준비 체크리스트", date: "2026-08-18", file: "PDF · 412KB" },
  { tab: "files", title: "무선기기 적합인증 제출 기술 문서 목록", date: "2026-07-30", file: "PDF · 286KB" },
  { tab: "files", title: "해외인증 국가별 표시 방법 정리", date: "2026-07-02", file: "PDF · 1.2MB" },
  { tab: "files", title: "전기용품 안전인증 공장 심사 준비 자료", date: "2026-05-27", file: "PDF · 640KB" },
];

const FAQ = [
  {
    q: "시험 기간은 얼마나 걸리나요?",
    a: "시료와 서류가 모두 들어온 날부터 셉니다. 전자파 적합등록은 보통 2~3주, 무선 적합인증은 3~5주, 전기용품 안전인증은 공장 심사를 포함해 4~6주 정도 걸립니다.",
  },
  {
    q: "시료는 몇 대를 보내야 하나요?",
    a: "전자파 시험은 보통 2대, 무선 시험은 일반 시료 1대와 연속 송신으로 설정한 시험용 시료 1대가 필요합니다. 품목에 따라 달라 견적과 함께 안내해 드립니다.",
  },
  {
    q: "시험에서 기준을 넘으면 어떻게 하나요?",
    a: "넘은 주파수와 크기를 바로 알려 드리고, 페라이트 코어나 필터 같은 대책을 붙여 다시 측정할 수 있습니다. 같은 접수 건 안에서 한 번은 추가 비용 없이 다시 측정합니다.",
  },
  {
    q: "해외 인증도 이곳에서 시험하면 되나요?",
    a: "미국, 유럽처럼 국내 시험 성적서를 인정하는 국가는 이곳에서 시험해 신청합니다. 중국 CCC처럼 현지 시험이 필요한 국가는 협력 기관을 통해 진행하고 일정을 함께 관리합니다.",
  },
  {
    q: "견적은 언제 받을 수 있나요?",
    a: "제품 사양서나 사진을 보내 주시면 영업일 기준 하루 안에 견적서를 메일로 보내 드립니다.",
  },
];

function Support({ minute }: { minute: number }) {
  const reduce = useReducedMotionSafe();
  const [tab, setTab] = useState<BoardTab>("news");
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const tabRefs = useRef<Record<BoardTab, HTMLButtonElement | null>>({ news: null, files: null });

  const q = query.trim();
  const list = BOARD.filter((b) => b.tab === tab && (!q || b.title.includes(q)));
  const today = minute < 0 ? null : dayStart(new Date(minute * 60_000));
  const isNew = (date: string) => {
    if (today === null) return false;
    const [y, m, d] = date.split("-").map(Number);
    const diff = (today - new Date(y, m - 1, d).getTime()) / 86_400_000;
    return diff >= 0 && diff <= 14;
  };

  const tabs: { id: BoardTab; label: string }[] = [
    { id: "news", label: "새소식" },
    { id: "files", label: "자료실" },
  ];

  const onTabKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next: BoardTab = tab === "news" ? "files" : "news";
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section aria-labelledby="support-title" id="support" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="support-title" tag="고객지원" title="새소식과 자료실" desc="고시 개정 소식과 시험 신청에 필요한 양식을 올려 둡니다." />

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
          <div className="min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div role="tablist" aria-label="게시판" className="inline-flex rounded-[8px] p-1" style={{ background: C.paper }}>
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    ref={(el) => {
                      tabRefs.current[t.id] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`board-tab-${t.id}`}
                    aria-selected={tab === t.id}
                    aria-controls="board-panel"
                    tabIndex={tab === t.id ? 0 : -1}
                    onClick={() => setTab(t.id)}
                    onKeyDown={onTabKey}
                    className="h-10 rounded-[6px] px-5 text-[15px] font-bold transition-colors"
                    style={tab === t.id ? { background: C.white, color: C.indigo, boxShadow: "0 1px 2px rgba(20,26,51,0.12)" } : { color: C.muted }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <label className="relative block sm:w-[260px]">
                <span className="sr-only">제목 검색</span>
                <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="제목 검색"
                  className="h-11 w-full rounded-[8px] border pl-10 pr-3 outline-none focus:border-[#23307a]"
                  style={{ borderColor: C.line }}
                />
              </label>
            </div>

            <div id="board-panel" role="tabpanel" aria-labelledby={`board-tab-${tab}`} className="mt-4">
              {list.length > 0 ? (
                <ul className="border-t" style={{ borderColor: C.ink }}>
                  {list.map((b) => (
                    <li key={b.title} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b py-3.5" style={{ borderColor: C.line }}>
                      {b.file ? (
                        <FileText size={18} className="shrink-0" style={{ color: C.cyanText }} aria-hidden />
                      ) : (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: C.indigo }} aria-hidden />
                      )}
                      <span className="min-w-0 flex-1 font-semibold">
                        {b.title}
                        {isNew(b.date) && (
                          <span className="ml-2 rounded-[4px] px-1.5 py-0.5 align-middle text-[12px] font-bold" style={{ background: C.cyanSoft, color: C.cyanText }}>
                            새 글
                          </span>
                        )}
                      </span>
                      <span className="flex w-full gap-3 pl-[30px] text-[14px] tabular-nums sm:w-auto sm:pl-0" style={{ color: C.muted }}>
                        {b.file && <span>{b.file}</span>}
                        <span>{b.date.replaceAll("-", ".")}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-[10px] p-6 text-center" style={{ background: C.paper, color: C.muted }}>
                  &lsquo;{q}&rsquo;가 들어간 글이 없습니다.
                </p>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-[22px] font-bold tracking-[-0.02em]">질의응답</h3>
            <ul className="mt-4 border-t" style={{ borderColor: C.ink }}>
              {FAQ.map((f, i) => {
                const open = openFaq === i;
                return (
                  <li key={f.q} className="border-b" style={{ borderColor: C.line }}>
                    <h4>
                      <button
                        type="button"
                        id={`faq-q-${i}`}
                        aria-expanded={open}
                        aria-controls={`faq-a-${i}`}
                        onClick={() => setOpenFaq(open ? null : i)}
                        className="flex w-full items-center gap-3 py-4 text-left font-semibold"
                      >
                        <span className="text-[15px] font-bold" style={{ color: C.cyanText }} aria-hidden>
                          Q
                        </span>
                        <span className="flex-1">{f.q}</span>
                        <ChevronDown size={19} className="shrink-0 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : undefined, color: C.muted }} aria-hidden />
                      </button>
                    </h4>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          id={`faq-a-${i}`}
                          role="region"
                          aria-labelledby={`faq-q-${i}`}
                          className="overflow-hidden"
                          initial={reduce ? false : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                        >
                          <p className="pb-4 pl-7 text-[15px]" style={{ color: C.muted }}>
                            {f.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
            <a href="#quote" className="mt-5 inline-flex h-11 items-center gap-2 rounded-[8px] border px-4 text-[15px] font-bold" style={{ borderColor: C.line, color: C.indigo }}>
              <Mail size={17} aria-hidden />
              찾는 답이 없으면 문의하기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 견적 문의 ---------- */

type Field = "company" | "person" | "phone" | "email" | "product" | "file" | "agree";
type Errors = Partial<Record<Field, string>>;

const COMMON_CERTS = ["적합인증 (무선)", "적합등록 (전자파)", "전기용품 안전인증", "전기용품 안전확인", "자율안전확인신고 (KCs)", "FCC ID", "CE (RED)", "해외인증 상담"];
const FILE_EXT = ["pdf", "doc", "docx", "hwp", "hwpx", "xlsx", "zip", "jpg", "png"];
const FILE_MAX = 20 * 1024 * 1024;

interface Values {
  company: string;
  person: string;
  phone: string;
  email: string;
  product: string;
  agree: boolean;
}

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.company.trim()) e.company = "회사명을 적어 주세요.";
  if (v.person.trim().length < 2) e.person = "담당자 이름을 두 글자 이상 적어 주세요.";
  if (v.phone.replace(/\D/g, "").length < 9) e.phone = "연락처를 9자리 이상 숫자로 적어 주세요.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "이메일 형식을 확인해 주세요.";
  if (!v.product.trim()) e.product = "제품명을 적어 주세요.";
  if (!v.agree) e.agree = "개인정보 수집·이용에 동의해 주세요.";
  return e;
}

interface Receipt {
  no: string;
  company: string;
  person: string;
  phone: string;
  product: string;
  certs: string[];
  file: string | null;
}

function Quote({ certs, setCerts }: { certs: string[]; setCerts: (fn: (prev: string[]) => string[]) => void }) {
  const reduce = useReducedMotionSafe();
  const [values, setValues] = useState<Values>({ company: "", person: "", phone: "", email: "", product: "", agree: false });
  const [model, setModel] = useState("");
  const [memo, setMemo] = useState("");
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [fileErr, setFileErr] = useState("");
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Receipt | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const errors: Errors = { ...(tried ? validate(values) : {}), ...(fileErr ? { file: fileErr } : {}) };
  const set = <K extends keyof Values>(k: K, v: Values[K]) => setValues((p) => ({ ...p, [k]: v }));

  const toggleCert = (name: string) => setCerts((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    const err = !FILE_EXT.includes(ext) ? "PDF, 한글, 워드, 엑셀, 이미지, ZIP 파일만 고를 수 있습니다." : f.size > FILE_MAX ? "20MB가 넘는 파일은 메일로 보내 주세요." : "";
    setFileErr(err);
    if (err) {
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } else setFile({ name: f.name, size: f.size });
  };

  const removeFile = () => {
    setFile(null);
    setFileErr("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    const next: Errors = { ...validate(values), ...(fileErr ? { file: fileErr } : {}) };
    const order: Field[] = ["company", "person", "phone", "email", "product", "file", "agree"];
    const first = order.find((f) => next[f]);
    if (first) {
      document.getElementById(`q-${first}`)?.focus();
      return;
    }
    const now = new Date();
    const ymd = `${String(now.getFullYear()).slice(2)}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;
    setDone({
      no: `QT-${ymd}-${pad2(now.getHours())}${pad2(now.getMinutes())}`,
      company: values.company.trim(),
      person: maskName(values.person),
      phone: maskPhone(values.phone),
      product: [values.product.trim(), model.trim()].filter(Boolean).join(" / "),
      certs,
      file: file ? `${file.name} (${fileSize(file.size)})` : null,
    });
  };

  const reset = () => {
    setDone(null);
    setValues({ company: "", person: "", phone: "", email: "", product: "", agree: false });
    setModel("");
    setMemo("");
    setFile(null);
    setFileErr("");
    setTried(false);
    setCerts(() => []);
  };

  const inputCls = "mt-1.5 h-12 w-full rounded-[8px] border bg-white px-3 outline-none focus:border-[#23307a]";
  const border = (f: Field) => ({ borderColor: errors[f] ? C.error : C.line });
  const aria = (f: Field) => ({ "aria-invalid": !!errors[f], "aria-describedby": errors[f] ? `q-${f}-err` : undefined });
  const errText = (f: Field) =>
    errors[f] ? (
      <p id={`q-${f}-err`} className="mt-1 flex items-center gap-1 text-[14px] font-semibold" style={{ color: C.error }}>
        <CircleAlert size={15} aria-hidden />
        {errors[f]}
      </p>
    ) : null;
  const label = (htmlFor: string, text: string, req = true) => (
    <label htmlFor={htmlFor} className="text-[15px] font-bold">
      {text}
      {req && (
        <span className="ml-1" style={{ color: C.cyanText }}>
          <span aria-hidden>*</span>
          <span className="sr-only">(필수)</span>
        </span>
      )}
    </label>
  );

  const extra = COMMON_CERTS.filter((c) => !certs.includes(c));
  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <section aria-labelledby="quote-title" id="quote" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.paper }}>
      <div className="mx-auto grid max-w-[1200px] items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <SectionHead id="quote-title" tag="견적문의" title="제품 사양을 보내 주시면 견적을 드립니다" desc="영업일 기준 하루 안에 담당 시험원이 견적서를 메일로 보내 드립니다. 급한 일정은 전화로 먼저 말씀해 주세요." />
          <dl className="mt-8 overflow-hidden rounded-[10px] border bg-white text-[15px]" style={{ borderColor: C.line }}>
            {[
              ["전화", TEL],
              ["팩스", FAX],
              ["이메일", EMAIL],
              ["상담 시간", "평일 09:00 ~ 18:00"],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[92px_1fr] border-b last:border-b-0" style={{ borderColor: C.line }}>
                <dt className="px-4 py-3" style={{ color: C.muted, background: "#fafbfd" }}>
                  {k}
                </dt>
                <dd className="px-4 py-3 font-bold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.div
                key="done"
                className="overflow-hidden rounded-[10px] border bg-white"
                style={{ borderColor: C.line }}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <div className="flex items-center gap-3 px-6 py-5" style={{ background: C.indigo, color: C.white }}>
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]" style={{ background: C.cyan, color: C.indigoDeep }}>
                    <Check size={22} strokeWidth={2.6} aria-hidden />
                  </span>
                  <div>
                    <p className="text-[20px] font-bold tracking-[-0.02em]">견적 문의가 접수됐습니다</p>
                    <p className="text-[15px]" style={{ color: "#c8cdea" }}>
                      {done.person}님께 영업일 기준 하루 안에 연락드리겠습니다.
                    </p>
                  </div>
                </div>
                <dl className="px-6 py-5 text-[15px]">
                  {(
                    [
                      ["접수번호", done.no],
                      ["회사명", done.company],
                      ["담당자", done.person],
                      ["연락처", done.phone],
                      ["제품", done.product],
                      ["인증", done.certs.length ? done.certs.join(", ") : "상담 후 결정"],
                      ["첨부", done.file ?? "없음"],
                    ] as const
                  ).map(([k, v], i) => (
                    <div key={k} className="grid grid-cols-[88px_1fr] gap-3 border-b py-2.5 last:border-b-0" style={{ borderColor: C.line }}>
                      <dt style={{ color: C.muted }}>{k}</dt>
                      <dd className={`min-w-0 break-words tabular-nums ${i === 0 ? "text-[19px] font-bold" : "font-semibold"}`} style={i === 0 ? { color: C.indigo } : undefined}>
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="px-6 pb-6">
                  <button type="button" onClick={reset} className="inline-flex h-11 items-center gap-1.5 rounded-[8px] border px-4 text-[15px] font-bold" style={{ borderColor: C.line }}>
                    <RotateCcw size={16} aria-hidden />
                    새 문의 쓰기
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0 }} className="rounded-[10px] border bg-white p-5 md:p-7" style={{ borderColor: C.line }}>
                {errorCount > 0 && tried && (
                  <p role="alert" className="mb-5 flex items-center gap-2 rounded-[8px] px-3 py-2.5 text-[15px] font-semibold" style={{ background: C.errorSoft, color: C.error }}>
                    <CircleAlert size={18} aria-hidden />
                    입력 내용을 확인해 주세요. 고칠 곳 {errorCount}개
                  </p>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    {label("q-company", "회사명")}
                    <input id="q-company" value={values.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" placeholder="(주)△△전자" className={inputCls} style={border("company")} {...aria("company")} />
                    {errText("company")}
                  </div>
                  <div>
                    {label("q-person", "담당자")}
                    <input id="q-person" value={values.person} onChange={(e) => set("person", e.target.value)} autoComplete="name" placeholder="김하늘" className={inputCls} style={border("person")} {...aria("person")} />
                    {errText("person")}
                  </div>
                  <div>
                    {label("q-phone", "연락처")}
                    <input id="q-phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" className={`${inputCls} tabular-nums`} style={border("phone")} {...aria("phone")} />
                    {errText("phone")}
                  </div>
                  <div>
                    {label("q-email", "이메일")}
                    <input id="q-email" value={values.email} onChange={(e) => set("email", e.target.value)} type="email" autoComplete="email" placeholder="name@example.com" className={inputCls} style={border("email")} {...aria("email")} />
                    {errText("email")}
                  </div>
                  <div>
                    {label("q-product", "제품명")}
                    <input id="q-product" value={values.product} onChange={(e) => set("product", e.target.value)} placeholder="블루투스 스피커" className={inputCls} style={border("product")} {...aria("product")} />
                    {errText("product")}
                  </div>
                  <div>
                    {label("q-model", "모델명", false)}
                    <input id="q-model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="AB-100" className={inputCls} style={{ borderColor: C.line }} />
                  </div>

                  <fieldset className="sm:col-span-2">
                    <legend className="text-[15px] font-bold">선택한 인증</legend>
                    <div className="mt-1.5 rounded-[8px] border p-3" style={{ borderColor: C.line, background: "#fafbfd" }}>
                      {certs.length > 0 ? (
                        <ul className="flex flex-wrap gap-2">
                          {certs.map((c) => (
                            <li key={c}>
                              <span className="inline-flex h-9 items-center gap-1 rounded-[8px] pl-3 pr-1 text-[14px] font-bold" style={{ background: C.indigo, color: C.white }}>
                                {c}
                                <button type="button" onClick={() => toggleCert(c)} aria-label={`${c} 빼기`} className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] hover:bg-white/15">
                                  <X size={15} aria-hidden />
                                </button>
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[14px]" style={{ color: C.muted }}>
                          <a href="#finder" className="font-semibold underline underline-offset-4" style={{ color: C.indigo }}>
                            필요한 인증 찾기
                          </a>
                          에서 담거나 아래에서 고르세요. 잘 모르면 비워 두셔도 됩니다.
                        </p>
                      )}
                      {extra.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3" style={{ borderColor: C.line }}>
                          {extra.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => toggleCert(c)}
                              className="inline-flex h-9 items-center gap-1 rounded-[8px] border bg-white px-2.5 text-[14px] font-semibold"
                              style={{ borderColor: C.line, color: C.ink }}
                            >
                              <Plus size={14} aria-hidden style={{ color: C.cyanText }} />
                              <span className="sr-only">추가: </span>
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </fieldset>

                  <div className="sm:col-span-2">
                    {label("q-file", "사양서 파일", false)}
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 rounded-[8px] border border-dashed p-3" style={{ borderColor: errors.file ? C.error : "#b4bdd0", background: "#fafbfd" }}>
                      <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[8px] px-4 text-[15px] font-bold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2" style={{ background: C.indigo, color: C.white }}>
                        <FileUp size={18} aria-hidden />
                        파일 선택
                        <input
                          ref={fileRef}
                          id="q-file"
                          type="file"
                          accept={FILE_EXT.map((x) => `.${x}`).join(",")}
                          className="sr-only"
                          onChange={(e) => pickFile(e.target.files?.[0])}
                          aria-describedby={errors.file ? "q-file-err q-file-hint" : "q-file-hint"}
                        />
                      </label>
                      {file ? (
                        <span className="flex min-w-0 flex-1 items-center gap-2 text-[15px]">
                          <span className="min-w-0 truncate font-semibold">{file.name}</span>
                          <span className="shrink-0 tabular-nums" style={{ color: C.muted }}>
                            {fileSize(file.size)}
                          </span>
                          <button type="button" onClick={removeFile} aria-label="파일 빼기" className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]" style={{ color: C.muted }}>
                            <Trash2 size={18} aria-hidden />
                          </button>
                        </span>
                      ) : (
                        <span className="text-[14px]" style={{ color: C.muted }}>
                          회로도, 부품 목록, 제품 사진
                        </span>
                      )}
                    </div>
                    <p id="q-file-hint" className="mt-1 text-[13px]" style={{ color: C.muted }}>
                      PDF, 한글, 워드, 엑셀, 이미지, ZIP 파일, 20MB까지. 데모 화면이라 파일은 어디에도 올리지 않습니다.
                    </p>
                    {errText("file")}
                  </div>

                  <div className="sm:col-span-2">
                    {label("q-memo", "요청 사항", false)}
                    <textarea
                      id="q-memo"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      rows={4}
                      placeholder="출시 예정일, 판매 국가, 시료 준비 일정 등을 적어 주세요."
                      className="mt-1.5 w-full rounded-[8px] border bg-white px-3 py-2.5 outline-none focus:border-[#23307a]"
                      style={{ borderColor: C.line }}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex cursor-pointer items-start gap-2.5 text-[15px]">
                      <input id="q-agree" type="checkbox" checked={values.agree} onChange={(e) => set("agree", e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#23307a]" {...aria("agree")} />
                      <span>
                        개인정보 수집·이용에 동의합니다. <span style={{ color: C.muted }}>수집 항목: 회사명, 담당자, 연락처, 이메일. 보관 기간: 문의 처리 후 1년.</span>
                      </span>
                    </label>
                    {errText("agree")}
                  </div>
                </div>
                <button type="submit" className="mt-7 w-full rounded-[8px] py-3.5 text-[17px] font-bold" style={{ background: C.indigo, color: C.white }}>
                  견적 문의 보내기
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ---------- 채용 ---------- */

const JOBS = [
  { role: "EMC 시험원", req: "전기·전자 관련 학과, 경력 무관", type: "정규직" },
  { role: "RF 시험원", req: "무선 측정 경험 2년 이상", type: "정규직" },
  { role: "해외인증 담당", req: "영문 기술 문서 작성 가능자", type: "정규직" },
];

function Recruit() {
  return (
    <section aria-labelledby="recruit-title" id="recruit" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto grid max-w-[1200px] items-start gap-8 md:grid-cols-[1fr_1.4fr] md:gap-14">
        <div>
          <SectionHead id="recruit-title" tag="채용정보" title="함께 시험할 사람을 찾습니다" desc="상시 채용합니다. 이력서와 자기소개서를 메일로 보내 주시면 서류 검토 후 2주 안에 연락드립니다." />
          <a href={`mailto:${EMAIL}`} className="mt-6 inline-flex h-11 items-center gap-2 rounded-[8px] border px-4 text-[15px] font-bold" style={{ borderColor: C.line, color: C.indigo }}>
            <Mail size={17} aria-hidden />
            {EMAIL}
          </a>
        </div>
        <ul className="grid gap-3">
          {JOBS.map((j) => (
            <li key={j.role} className="flex items-center gap-4 rounded-[10px] border p-4" style={{ borderColor: C.line }}>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]" style={{ background: C.indigoSoft, color: C.indigo }}>
                <Briefcase size={19} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{j.role}</span>
                <span className="block text-[15px]" style={{ color: C.muted }}>
                  {j.req}
                </span>
              </span>
              <span className="shrink-0 rounded-[6px] px-2.5 py-1 text-[13px] font-bold" style={{ background: C.cyanSoft, color: C.cyanText }}>
                {j.type}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

function MiniMap() {
  return (
    <svg viewBox="0 0 640 360" className="h-auto w-full" role="img" aria-label="□□역 2번 출구에서 □□로를 따라 400m 걸으면 오른쪽에 있는 시험인증원 약도. 시료 접수실은 건물 뒤편 하역장 옆에 있습니다.">
      <rect width="640" height="360" fill={C.paper} />
      <g stroke={C.grid} strokeWidth="1">
        {Array.from({ length: 17 }, (_, i) => (
          <path key={`v${i}`} d={`M${i * 40} 0 V360`} />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <path key={`h${i}`} d={`M0 ${i * 40} H640`} />
        ))}
      </g>
      <path d="M0 210 H640" stroke={C.white} strokeWidth="34" />
      <path d="M0 210 H640" stroke={C.line} strokeWidth="1" strokeDasharray="12 10" />
      <path d="M140 0 V360" stroke={C.white} strokeWidth="24" />
      <path d="M500 0 V360" stroke={C.white} strokeWidth="18" />
      <text x="560" y="201" fontSize="14" fill={C.muted}>
        □□로
      </text>
      <rect x="30" y="40" width="88" height="140" rx="6" fill="#e6eaf2" stroke={C.line} />
      <rect x="164" y="240" width="140" height="90" rx="6" fill="#e6eaf2" stroke={C.line} />
      <rect x="524" y="240" width="96" height="90" rx="6" fill="#e6eaf2" stroke={C.line} />
      <circle cx="140" cy="210" r="17" fill={C.indigo} />
      <text x="140" y="215" fontSize="13" fill={C.white} textAnchor="middle" fontWeight={700}>
        2
      </text>
      <text x="40" y="262" fontSize="14" fill={C.ink} fontWeight={700}>
        □□역 2번 출구
      </text>
      <path d="M158 196 H366 V168" stroke={C.cyan} strokeWidth="3.5" strokeDasharray="7 6" fill="none" strokeLinecap="round" />
      <text x="250" y="186" fontSize="13" fill={C.cyanText} textAnchor="middle" fontWeight={700}>
        걸어서 6분
      </text>
      <rect x="306" y="44" width="170" height="122" rx="8" fill={C.indigo} />
      <path d="M318 132 H334 L340 116 L348 142 L356 100 L364 128 L370 120 H382" fill="none" stroke={C.cyan} strokeWidth="2.2" strokeLinejoin="round" />
      <text x="391" y="82" fontSize="15" fill={C.white} textAnchor="middle" fontWeight={700}>
        ○○시험인증원
      </text>
      <text x="420" y="132" fontSize="12" fill="#c8cdea" textAnchor="middle">
        본관 1~4층
      </text>
      <rect x="306" y="16" width="86" height="22" rx="4" fill={C.white} stroke={C.indigo} />
      <text x="349" y="31" fontSize="12" fill={C.indigo} textAnchor="middle" fontWeight={700}>
        시료 접수실
      </text>
    </svg>
  );
}

function Location() {
  const routes = [
    { icon: Bus, title: "대중교통", body: "□□역 2번 출구로 나와 □□로를 따라 400m, 오른쪽 건물입니다." },
    { icon: Car, title: "자가용", body: "□□IC에서 10분. 방문객 주차장은 건물 앞, 상담 방문 시 2시간 무료입니다." },
    { icon: Package, title: "시료 보내실 곳", body: "건물 뒤편 하역장 옆 시료 접수실. 택배는 상자에 접수번호를 적어 주세요." },
  ];
  return (
    <section aria-labelledby="location-title" id="location" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.paper }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="location-title" tag="오시는 길" title="□□역 2번 출구에서 걸어서 6분" />
        <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div className="overflow-hidden rounded-[10px] border" style={{ borderColor: C.line }}>
            <MiniMap />
          </div>
          <div>
            <p className="text-[21px] font-bold tracking-[-0.02em]">{ADDRESS}</p>
            <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
              평일 09:00 ~ 18:00, 시료 접수는 17:00까지
            </p>
            <ul className="mt-6 space-y-4">
              {routes.map((r) => (
                <li key={r.title} className="flex gap-3">
                  <r.icon size={20} className="mt-1 shrink-0" style={{ color: C.cyanText }} aria-hidden />
                  <span>
                    <span className="font-bold">{r.title}</span>
                    <span className="block text-[15px]" style={{ color: C.muted }}>
                      {r.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <a href={`tel:${TEL}`} className="mt-7 inline-flex h-12 items-center rounded-[8px] px-6 font-bold tabular-nums" style={{ background: C.indigo, color: C.white }}>
              전화 {TEL}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="relative overflow-hidden px-4 pb-24 pt-12 md:px-6" style={{ background: C.indigoDeep, color: "#c8cdea" }}>
      <div className="relative mx-auto max-w-[1200px]">
        <span className="text-white">
          <Logo light />
        </span>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-[14px] font-semibold text-white">
          {NAV.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} className="hover:underline">
                {n.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#recruit" className="hover:underline">
              채용정보
            </a>
          </li>
          <li>
            <a href="#location" className="hover:underline">
              오시는 길
            </a>
          </li>
        </ul>
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: "#a6acd6" }}>
          {[
            ["상호", COMPANY],
            ["대표", "김○○"],
            ["사업자등록번호", "000-00-00000"],
            ["주소", ADDRESS],
            ["전화", TEL],
            ["팩스", FAX],
            ["이메일", EMAIL],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="shrink-0">{k}</dt>
              <dd className="min-w-0 break-words tabular-nums" style={{ color: C.white }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </footer>
  );
}
