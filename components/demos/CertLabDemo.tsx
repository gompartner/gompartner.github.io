"use client";

import { createContext, useContext, useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BatteryFull,
  Bluetooth,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Copy,
  Factory,
  FileText,
  FileUp,
  House,
  Lightbulb,
  Menu,
  MessageCircle,
  Monitor,
  Phone,
  Plug,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Signal,
  Trash2,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 기업 홈페이지 데모: 가상의 (주)○○시험인증원, 전자파·무선·전기안전 시험과 KC·해외 인증을 맡는 지정시험기관.
   회사명, 대표자, 주소, 전화번호, 사업자 정보, 지정 번호, 담당자, 의뢰사는 모두 가상이고 실제 기관 로고나 등록번호는 쓰지 않는다.

   구성: 실제 시험인증기관의 포털·게시판형 홈페이지를 따랐다. 메뉴는 회사소개, 인증업무, 국내인증, 해외인증, 고객지원.
   메인은 큰 사진 대신 맨 위에 조회 도구 줄(인증 대상 조회, 시험진행현황 조회, 성적서 진위확인, 신청서 양식, 견적문의)과
   접수번호 바로 조회를 두고, 그 아래 새소식·자료실 게시판 2단, 바로가기 배너, 인증 서비스 목록을 둔다.
   하위 화면은 라우트를 따로 두지 않고 상태로 바꾸며, 왼쪽 하위 메뉴(LNB)와 그 아래 상담 안내 상자, 위치 표시를 쓴다.
   좁은 화면에서는 LNB가 선택 상자로 바뀐다. 오른쪽 아래 공용 버튼 위에 견적문의·전화연결·카톡상담 버튼을 띄운다.
   회사소개에는 KOLAS 인정 시험소에 있는 공평성 선언과 고객불만 처리 절차 화면을 둔다.

   디자인: 흰색과 서늘한 종이색(#f4f7fb) 바탕에 짙은 남색(#23307a), 신호 청록(#0aa2c0) 하나를 포인트로 쓴다.

   인증 대상 조회는 전원 방식, 무선 기능, 제품 분류, 판매 국가를 고르면 필요할 가능성이 높은 인증을 국가별로 묶어
   이유, 주요 시험 항목, 예상 기간과 함께 보여 주고, 견적문의에 추가하면 견적문의 양식의 인증 칸으로 들어간다.
   해외인증은 점으로 찍은 세계 지도와 LNB로 대륙을 고르고, 국가 탭으로 인증 이름과 설명을 본다.
   시험진행현황 조회는 접수번호 끝 네 자리로 진행 단계를 정해 단계표와 날짜를 보여 주고,
   전자파 시험이면 30MHz~1GHz 방사 방출 그래프에 기준선, 측정값, 최소 여유를 그린다. 동작 줄이기를 켜면 선 그리기를 하지 않는다.
   견적문의는 고객사를 가린 공개 접수 목록과 작성 양식으로 나뉘고, 사양서 파일은 이름과 크기만 보여 주며 어디에도 올리지 않는다.
   시료 접수 안내(오시는 길 화면 안)는 받는 주소 복사와 상자에 넣을 것 목록을 둔다.

   사진 출처(public/images/demo-certlab):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero, lab */

const IMG = "/images/demo-certlab";
const COMPANY = "(주)○○시험인증원";
const TEL = "02-000-0000";
const FAX = "02-000-0001";
const EMAIL = "test@example.com";
const ADDRESS = "□□시 □□구 □□로 00 ○○시험인증원";
const HOURS = "평일 09:00 ~ 18:00";

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

/* ---------- 메뉴, 화면 상태 ---------- */

type MenuId = "about" | "services" | "domestic" | "global" | "support";
type Route = { m: MenuId | "home"; s: string };

const MENUS: { id: MenuId; label: string; subs: { id: string; label: string }[] }[] = [
  {
    id: "about",
    label: "회사소개",
    subs: [
      { id: "greeting", label: "인사말" },
      { id: "accredit", label: "인정 및 지정 현황" },
      { id: "facility", label: "시험시설" },
      { id: "impartiality", label: "공평성 선언" },
      { id: "complaint", label: "고객불만 처리 절차" },
      { id: "recruit", label: "인재채용" },
      { id: "location", label: "오시는 길" },
    ],
  },
  {
    id: "services",
    label: "인증업무",
    subs: [
      { id: "emc", label: "전자파(EMC) 시험" },
      { id: "rf", label: "무선(RF) 시험" },
      { id: "safety", label: "전기안전(SAFETY) 시험" },
      { id: "gma", label: "해외인증 대행(GMA)" },
    ],
  },
  {
    id: "domestic",
    label: "국내인증",
    subs: [
      { id: "conform", label: "적합인증" },
      { id: "register", label: "적합등록" },
      { id: "elec", label: "전기용품안전인증" },
      { id: "energy", label: "에너지 효율 관리 제도" },
      { id: "kcs", label: "자율안전확인신고 (KCs)" },
    ],
  },
  {
    id: "global",
    label: "해외인증",
    subs: [
      { id: "na", label: "북아메리카" },
      { id: "sa", label: "남아메리카" },
      { id: "eu", label: "유럽" },
      { id: "as", label: "아시아" },
      { id: "af", label: "아프리카" },
      { id: "oc", label: "오세아니아" },
    ],
  },
  {
    id: "support",
    label: "고객지원",
    subs: [
      { id: "finder", label: "인증 대상 조회" },
      { id: "track", label: "시험진행현황 조회" },
      { id: "verify", label: "성적서 진위확인" },
      { id: "quote", label: "견적문의" },
      { id: "news", label: "새소식" },
      { id: "files", label: "자료실" },
      { id: "faq", label: "질의응답" },
    ],
  },
];

interface QuoteRow {
  no: number;
  std: string;
  company: string;
  date: string;
  done: boolean;
}

interface Ctx {
  route: Route;
  go: (m: MenuId | "home", s?: string) => void;
  openQuote: () => void;
  quoteForm: boolean;
  setQuoteForm: (v: boolean) => void;
  certs: string[];
  setCerts: (fn: (prev: string[]) => string[]) => void;
  trackQuery: string;
  setTrackQuery: (v: string) => void;
  rows: QuoteRow[];
  addRow: (r: QuoteRow) => void;
  minute: number;
}

const ClCtx = createContext<Ctx | null>(null);
function useCl() {
  const c = useContext(ClCtx);
  if (!c) throw new Error("CertLabDemo context");
  return c;
}

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

/** 병원식 마스킹: 김하늘은 김ㅎ늘, 두 글자는 김* */
function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return chars.join("");
  const hide = (ch: string) => {
    const code = ch.charCodeAt(0) - 0xac00;
    return code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*";
  };
  if (chars.length === 2) return `${chars[0]}*`;
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

/** 고객사 가리기: (주)한빛전자는 (주)한○○○ */
function maskCompany(name: string) {
  const v = name.trim();
  const m = v.match(/^(\(주\)|주식회사\s*|㈜)?(.*)$/);
  const prefix = m?.[1] ?? "";
  const body = [...(m?.[2] ?? v)];
  if (body.length < 2) return v;
  return `${prefix}${body[0]}${"○".repeat(Math.min(4, body.length - 1))}`;
}

/* ---------- 페이지 ---------- */

const QUOTE_ROWS: QuoteRow[] = [
  { no: 684, std: "KC, CE", company: "(주)△△전자", date: "2026-10-06", done: false },
  { no: 683, std: "FCC", company: "△△테크", date: "2026-10-05", done: true },
  { no: 682, std: "KC", company: "(주)△△라이팅", date: "2026-10-02", done: true },
  { no: 681, std: "KOLAS", company: "△△시스템", date: "2026-10-01", done: true },
  { no: 680, std: "KC, FCC, CE", company: "(주)△△모빌리티", date: "2026-09-29", done: true },
  { no: 679, std: "KCs", company: "△△기계", date: "2026-09-26", done: true },
  { no: 678, std: "CE", company: "(주)△△메디칼", date: "2026-09-25", done: true },
  { no: 677, std: "KC", company: "△△산업", date: "2026-09-23", done: true },
];

export function CertLabDemo() {
  const minute = useNowMinute();
  const [route, setRoute] = useState<Route>({ m: "home", s: "" });
  const [quoteForm, setQuoteForm] = useState(false);
  const [certs, setCerts] = useState<string[]>([]);
  const [trackQuery, setTrackQuery] = useState("");
  const [rows, setRows] = useState<QuoteRow[]>(QUOTE_ROWS);
  const moved = useRef(false);

  const go = (m: MenuId | "home", s?: string) => {
    const sub = m === "home" ? "" : (s ?? MENUS.find((n) => n.id === m)!.subs[0].id);
    moved.current = true;
    setQuoteForm(false);
    setRoute({ m, s: sub });
    window.scrollTo({ top: 0 });
  };

  const key = `${route.m}/${route.s}`;
  useEffect(() => {
    if (!moved.current) return;
    document.getElementById("cl-page-title")?.focus({ preventScroll: true });
  }, [key]);

  const ctx: Ctx = {
    route,
    go,
    openQuote: () => {
      go("support", "quote");
      setQuoteForm(true);
    },
    quoteForm,
    setQuoteForm,
    certs,
    setCerts,
    trackQuery,
    setTrackQuery,
    rows,
    addRow: (r) => setRows((prev) => [r, ...prev]),
    minute,
  };

  return (
    <ClCtx.Provider value={ctx}>
      <div className="min-h-screen text-[16px] leading-[1.7] md:text-[17px]" style={{ background: C.white, color: C.ink }}>
        <UtilBar />
        <Header />
        <main>{route.m === "home" ? <Home /> : <SubPage key={key} m={route.m} s={route.s} />}</main>
        <Footer />
        <FloatingContact />
      </div>
    </ClCtx.Provider>
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

function UtilBar() {
  const { go } = useCl();
  return (
    <div className="hidden border-b px-6 md:block" style={{ borderColor: C.line, background: C.paper }}>
      <ul className="mx-auto flex h-9 max-w-[1200px] items-center justify-end gap-5 text-[13px]" style={{ color: C.muted }}>
        <li>
          <button type="button" onClick={() => go("about", "impartiality")} className="hover:underline">
            공평성 선언
          </button>
        </li>
        <li>
          <button type="button" onClick={() => go("about", "recruit")} className="hover:underline">
            인재채용
          </button>
        </li>
        <li>
          <button type="button" onClick={() => go("about", "location")} className="hover:underline">
            오시는 길
          </button>
        </li>
        <li className="font-bold tabular-nums" style={{ color: C.indigo }}>
          대표전화 {TEL}
        </li>
      </ul>
    </div>
  );
}

function Header() {
  const { go, openQuote, route } = useCl();
  const [drop, setDrop] = useState<MenuId | null>(null);
  const [open, setOpen] = useState(false);
  const [acc, setAcc] = useState<MenuId | null>(null);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!drop && !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setDrop(null);
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drop, open]);

  const pick = (m: MenuId, s?: string) => {
    setDrop(null);
    setOpen(false);
    go(m, s);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white" style={{ borderColor: C.line }}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:h-[72px] md:px-6">
        <button type="button" onClick={() => go("home")} aria-label={`${COMPANY} 처음으로`} className="flex min-w-0">
          <Logo />
        </button>
        <nav aria-label="주 메뉴" className="hidden h-full lg:block">
          <ul className="flex h-full">
            {MENUS.map((m) => {
              const on = route.m === m.id;
              const show = drop === m.id;
              return (
                <li
                  key={m.id}
                  className="relative h-full"
                  onMouseEnter={() => setDrop(m.id)}
                  onMouseLeave={() => setDrop(null)}
                  onFocus={() => setDrop(m.id)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDrop((d) => (d === m.id ? null : d));
                  }}
                >
                  <button
                    type="button"
                    onClick={() => pick(m.id)}
                    aria-current={on ? "true" : undefined}
                    className="flex h-full items-center px-5 text-[17px] font-bold xl:px-7"
                    style={{ color: on || show ? C.indigo : C.ink }}
                  >
                    {m.label}
                  </button>
                  {show && (
                    <ul className="absolute left-1/2 top-full z-10 w-[220px] -translate-x-1/2 rounded-b-[10px] border border-t-2 bg-white py-2 shadow-[0_10px_24px_rgba(20,26,51,0.12)]" style={{ borderColor: C.line, borderTopColor: C.indigo }}>
                      {m.subs.map((sub) => {
                        const cur = route.m === m.id && route.s === sub.id;
                        return (
                          <li key={sub.id}>
                            <button
                              type="button"
                              onClick={() => pick(m.id, sub.id)}
                              aria-current={cur ? "page" : undefined}
                              className="w-full px-5 py-2 text-left text-[15px] hover:bg-[#f4f7fb]"
                              style={{ color: cur ? C.indigo : C.ink, fontWeight: cur ? 700 : 400 }}
                            >
                              {sub.label}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={openQuote} className="hidden h-10 items-center rounded-[8px] px-4 text-[15px] font-bold md:inline-flex" style={{ background: C.indigo, color: C.white }}>
            견적문의
          </button>
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
            className="max-h-[calc(100vh-64px)] overflow-y-auto border-t lg:hidden"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { height: 0 }}
            animate={{ height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <ul className="mx-auto max-w-[1200px] px-4 py-2 md:px-6">
              {MENUS.map((m) => {
                const expanded = acc === m.id;
                return (
                  <li key={m.id} className="border-b" style={{ borderColor: C.paper }}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`cl-acc-${m.id}`}
                      onClick={() => setAcc(expanded ? null : m.id)}
                      className="flex h-12 w-full items-center justify-between text-[17px] font-bold"
                    >
                      {m.label}
                      <ChevronDown size={20} className="transition-transform" style={{ transform: expanded ? "rotate(180deg)" : undefined, color: C.muted }} aria-hidden />
                    </button>
                    {expanded && (
                      <ul id={`cl-acc-${m.id}`} className="mb-2 rounded-[8px] px-3 py-1" style={{ background: C.paper }}>
                        {m.subs.map((sub) => (
                          <li key={sub.id}>
                            <button type="button" onClick={() => pick(m.id, sub.id)} className="flex min-h-11 w-full items-center text-left text-[15px]" style={{ color: C.muted }}>
                              {sub.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
              <li>
                <a href={`tel:${TEL}`} className="flex h-12 items-center text-[17px] font-bold tabular-nums" style={{ color: C.indigo }}>
                  대표전화 {TEL}
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/** 화면 오른쪽 상담 버튼. 사이트 공용 버튼(오른쪽 아래 80px)을 피해 그 위에 둔다. */
function FloatingContact() {
  const { openQuote } = useCl();
  const [kakao, setKakao] = useState(false);

  useEffect(() => {
    if (!kakao) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setKakao(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [kakao]);

  const item = "flex h-12 w-12 flex-col items-center justify-center gap-0.5 text-[11px] font-bold leading-none md:h-[64px] md:w-[64px] md:text-[12px]";
  return (
    <div id="cl-float" role="group" aria-label="상담" className="fixed bottom-[104px] right-2 z-30 print:hidden md:right-4">
      <div className="relative flex flex-col overflow-hidden rounded-[10px] border shadow-[0_6px_18px_rgba(20,26,51,0.16)]" style={{ borderColor: C.line, background: C.white }}>
        <button type="button" onClick={openQuote} className={item} style={{ background: C.indigo, color: C.white }}>
          <ClipboardList size={20} aria-hidden />
          <span className="sr-only md:not-sr-only">견적문의</span>
        </button>
        <a href={`tel:${TEL}`} className={`${item} border-b`} style={{ color: C.indigo, borderColor: C.line }}>
          <Phone size={19} aria-hidden />
          <span className="sr-only md:not-sr-only">전화연결</span>
        </a>
        <button type="button" onClick={() => setKakao((v) => !v)} aria-expanded={kakao} aria-controls="cl-kakao" className={item} style={{ color: C.indigo }}>
          <MessageCircle size={19} aria-hidden />
          <span className="sr-only md:not-sr-only">카톡상담</span>
        </button>
      </div>
      {kakao && (
        <div id="cl-kakao" className="absolute bottom-0 right-full mr-2 w-[220px] rounded-[10px] border bg-white p-4 text-[14px] leading-[1.55] shadow-[0_6px_18px_rgba(20,26,51,0.16)]" style={{ borderColor: C.line }}>
          <p className="font-bold">카카오톡 상담</p>
          <p className="mt-1" style={{ color: C.muted }}>
            카카오톡에서 &lsquo;○○시험인증원&rsquo; 채널을 추가해 주십시오. {HOURS}
          </p>
          <button type="button" onClick={() => setKakao(false)} className="mt-2 inline-flex h-9 items-center rounded-[6px] border px-3 text-[13px] font-bold" style={{ borderColor: C.line }}>
            닫기
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- 메인 ---------- */

const BOARD: { tab: "news" | "files"; title: string; date: string; body: string; file?: string }[] = [
  { tab: "news", title: "2026년 11월 1일 접수분부터 전자파 시험수수료 조정 안내", date: "2026-09-30", body: "인건비와 장비 교정 비용 상승에 따라 전자파(EMC) 시험수수료를 항목별로 4~7% 조정합니다. 10월 31일까지 견적서를 받으신 건은 기존 수수료를 적용합니다. 항목별 수수료는 자료실의 시험항목별 수수료 및 시험처리기간 안내를 확인해 주십시오." },
  { tab: "news", title: "추석 연휴(9.24~9.28) 시료 접수 및 성적서 발행 일정 안내", date: "2026-09-15", body: "9월 24일부터 9월 28일까지 시료 접수와 성적서 발행 업무를 하지 않습니다. 연휴 중 택배로 도착한 시료는 9월 29일부터 순서대로 접수하며, 9월 22일까지 시험이 완료된 건은 9월 23일까지 성적서를 발행합니다." },
  { tab: "news", title: "방송통신기자재 적합성평가 고시 개정 시행에 따른 무선충전기 시험 기준 변경", date: "2026-09-08", body: "개정 고시가 2026년 10월 1일부터 시행되어 출력 15W를 넘는 무선충전기는 적합등록에서 적합인증 대상으로 바뀝니다. 시행일 전 접수한 건은 종전 기준으로 시험합니다. 해당 품목은 담당 시험원이 개별로 안내해 드립니다." },
  { tab: "news", title: "전기용품 안전기준 KC 60335-2-30 개정판 시행 안내 (전기 히터)", date: "2026-08-28", body: "실내용 전기 히터의 표면 온도 상승 한도와 전도 시험 조건이 바뀝니다. 2027년 2월 출시 제품부터 개정판으로 시험하므로 겨울철 출시 예정 제품은 일정을 미리 상담해 주십시오." },
  { tab: "news", title: "3m 전파무향실 정기 검증으로 8월 25일~27일 방사 시험 휴무", date: "2026-08-12", body: "8월 25일부터 8월 27일까지 무향실 정기 검증(NSA 측정)으로 방사 시험을 쉽니다. 해당 기간 예약 건은 담당 시험원이 일정을 다시 잡아 연락드립니다. 전도 시험과 전기안전 시험은 정상 진행합니다." },
  { tab: "news", title: "KOLAS 정기 사후평가 결과 인정 범위 유지 및 무선 시험 항목 추가", date: "2026-07-21", body: "7월 정기 사후평가를 마쳐 기존 인정 범위가 유지되었고, 블루투스 저전력(BLE) 송신 출력과 점유주파수폭 시험 항목이 인정 범위에 추가되었습니다." },
  { tab: "news", title: "△△진흥원 중소기업 인증 지원사업 2차 참여기업 모집 공고", date: "2026-07-02", body: "중소기업의 국내·해외 인증 비용 일부를 지원하는 사업입니다. 신청 마감은 7월 31일이며, 신청 서류 작성은 견적문의로 요청하시면 도와 드립니다." },
  { tab: "files", title: "시험항목별 수수료 및 시험처리기간 안내", date: "2026-09-20", body: "전자파, 무선, 전기안전 시험 항목별 기본 수수료와 처리 기간입니다.", file: "PDF · 412KB" },
  { tab: "files", title: "[서식] 시험신청서", date: "2026-09-02", body: "시험 신청 시 시료와 함께 보내 주십시오.", file: "HWP · 48KB" },
  { tab: "files", title: "중소기업 시험수수료 할인 안내", date: "2026-08-18", body: "중소기업 확인서를 내시면 시험수수료를 할인해 드립니다.", file: "PDF · 186KB" },
  { tab: "files", title: "[서식] 시료 정보 및 시험 모드 기재표", date: "2026-07-30", body: "시료의 동작 모드와 연결 방법을 적어 주십시오.", file: "XLSX · 31KB" },
  { tab: "files", title: "무선기기 적합인증 제출 기술 문서 목록", date: "2026-07-02", body: "적합인증 신청에 필요한 기술 문서 목록입니다.", file: "PDF · 286KB" },
  { tab: "files", title: "해외인증 국가별 표시 방법 정리", date: "2026-05-27", body: "국가별 인증 마크와 표시 위치를 정리했습니다.", file: "PDF · 1.2MB" },
];

const MARKS: { name: string; to: [MenuId, string] }[] = [
  { name: "KC", to: ["domestic", "conform"] },
  { name: "KCs", to: ["domestic", "kcs"] },
  { name: "CE", to: ["global", "eu"] },
  { name: "UKCA", to: ["global", "eu"] },
  { name: "FCC", to: ["global", "na"] },
  { name: "ISED", to: ["global", "na"] },
  { name: "NRTL", to: ["global", "na"] },
  { name: "NOM", to: ["global", "na"] },
  { name: "PSE", to: ["global", "as"] },
  { name: "TELEC", to: ["global", "as"] },
  { name: "CCC", to: ["global", "as"] },
  { name: "BIS", to: ["global", "as"] },
  { name: "RCM", to: ["global", "oc"] },
  { name: "ANATEL", to: ["global", "sa"] },
];

function Home() {
  const { go, openQuote, setTrackQuery } = useCl();
  const [no, setNo] = useState("");

  const tools = [
    { icon: Search, label: "인증 대상 조회", to: () => go("support", "finder") },
    { icon: Activity, label: "시험진행현황 조회", to: () => go("support", "track") },
    { icon: ShieldCheck, label: "성적서 진위확인", to: () => go("support", "verify") },
    { icon: FileText, label: "신청서 양식", to: () => go("support", "files") },
    { icon: ClipboardList, label: "견적문의", to: openQuote },
  ];

  const quick = (e: FormEvent) => {
    e.preventDefault();
    setTrackQuery(no);
    go("support", "track");
  };

  const banners = [
    { title: "시험시설", sub: "3m 전파무향실 30MHz ~ 18GHz", img: `${IMG}/hero.jpg`, pos: "50% 50%", to: () => go("about", "facility") },
    { title: "시료 접수 안내", sub: "평일 17시까지 도착분 당일 접수", img: `${IMG}/lab.jpg`, pos: "50% 50%", to: () => go("about", "location") },
    { title: "시험수수료 안내", sub: "시험항목별 수수료와 처리기간", img: `${IMG}/lab.jpg`, pos: "15% 70%", to: () => go("support", "files") },
    { title: "질의응답", sub: "시험 기간, 시료 수량, 재시험", img: `${IMG}/hero.jpg`, pos: "85% 30%", to: () => go("support", "faq") },
  ];

  return (
    <>
      <section id="cl-tools" aria-labelledby="cl-page-title" className="relative overflow-hidden px-4 md:px-6" style={{ background: C.indigoDeep, color: C.white }}>
        <div className="relative mx-auto max-w-[1200px] pb-6 pt-8 md:pb-8 md:pt-12">
          <div className="grid items-end gap-7 lg:grid-cols-[1fr_440px] lg:gap-12">
            <div>
              <h1 id="cl-page-title" tabIndex={-1} className="text-[30px] font-bold leading-[1.25] tracking-[-0.03em] outline-none md:text-[42px]">
                {COMPANY}
              </h1>
              <p className="mt-2 text-[16px] font-bold md:text-[18px]" style={{ color: C.cyan }}>
                KC인증 지정시험기관 · KOLAS 공인시험기관
              </p>
            </div>
            <form id="cl-track-quick" onSubmit={quick} className="rounded-[10px] bg-white p-4 md:p-5" style={{ color: C.ink }}>
              <label htmlFor="cl-quick-no" className="flex items-center gap-2 text-[16px] font-bold">
                <Activity size={18} style={{ color: C.cyanText }} aria-hidden />
                시험진행현황 조회
              </label>
              <div className="mt-2.5 flex gap-2">
                <input
                  id="cl-quick-no"
                  value={no}
                  onChange={(e) => setNo(e.target.value)}
                  placeholder="접수번호 (예: TE-2609-0412)"
                  autoComplete="off"
                  className="h-12 min-w-0 flex-1 rounded-[8px] border px-3 text-[16px] font-semibold tabular-nums outline-none focus:border-[#23307a]"
                  style={{ borderColor: C.line }}
                />
                <button type="submit" className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-[8px] px-4 font-bold" style={{ background: C.indigo, color: C.white }}>
                  <Search size={17} aria-hidden />
                  조회
                </button>
              </div>
            </form>
          </div>

          <ul aria-label="온라인 서비스" className="mt-7 grid grid-cols-5 gap-px overflow-hidden rounded-[10px] md:mt-10" style={{ background: "rgba(255,255,255,0.14)" }}>
            {tools.map((t) => (
              <li key={t.label} style={{ background: C.indigo }}>
                <button type="button" onClick={t.to} className="flex h-full w-full flex-col items-center justify-start gap-2 px-1 py-3.5 text-center hover:bg-[#2c3a8f] md:flex-row md:justify-center md:gap-2.5 md:py-5">
                  <t.icon size={22} style={{ color: C.cyan }} aria-hidden />
                  <span className="text-[12px] font-bold leading-[1.3] sm:text-[13px] md:text-[16px]">{t.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="cl-boards" aria-label="새소식, 자료실" className="px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto grid max-w-[1200px] gap-10 md:grid-cols-2 md:gap-8">
          {(
            [
              ["news", "새소식"],
              ["files", "자료실"],
            ] as const
          ).map(([tab, title]) => (
            <div key={tab} className="min-w-0">
              <div className="flex items-center justify-between border-b-2 pb-2.5" style={{ borderColor: C.indigo }}>
                <h2 className="text-[21px] font-bold tracking-[-0.02em]">{title}</h2>
                <button type="button" onClick={() => go("support", tab)} className="inline-flex h-9 items-center gap-1 text-[14px] font-bold" style={{ color: C.muted }} aria-label={`${title} 더보기`}>
                  더보기
                  <Plus size={15} aria-hidden />
                </button>
              </div>
              <ul>
                {BOARD.filter((b) => b.tab === tab)
                  .slice(0, 4)
                  .map((b) => (
                    <li key={b.title} className="border-b" style={{ borderColor: C.line }}>
                      <button type="button" onClick={() => go("support", tab)} className="flex w-full items-center gap-3 py-3 text-left text-[15px] hover:text-[#23307a]">
                        {b.file && <FileText size={16} className="shrink-0" style={{ color: C.cyanText }} aria-hidden />}
                        <span className="min-w-0 flex-1 truncate">{b.title}</span>
                        <span className="shrink-0 text-[13px] tabular-nums" style={{ color: C.muted }}>
                          {b.date.replaceAll("-", ".")}
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="바로가기" className="px-4 md:px-6">
        <ul className="mx-auto grid max-w-[1200px] grid-cols-2 gap-3 lg:grid-cols-4">
          {banners.map((b) => (
            <li key={b.title}>
              <button
                type="button"
                onClick={b.to}
                className="relative flex h-[120px] w-full flex-col justify-end overflow-hidden rounded-[10px] border p-4 text-left md:h-[150px] md:p-5"
                style={{ borderColor: C.indigoDeep, color: C.white, background: C.indigoDeep }}
              >
                <Image src={b.img} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" style={{ objectPosition: b.pos }} />
                <span className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(24,33,90,0.25) 0%, rgba(24,33,90,0.88) 100%)" }} aria-hidden />
                <span className="relative flex items-center gap-1 text-[17px] font-bold md:text-[19px]">
                  {b.title}
                  <ChevronRight size={18} aria-hidden />
                </span>
                <span className="relative mt-0.5 text-[13px] leading-[1.4] md:text-[14px]" style={{ color: "#dfe3f5" }}>
                  {b.sub}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="cl-marks" className="px-4 py-10 md:px-6 md:py-14">
        <div className="mx-auto max-w-[1200px] rounded-[10px] border p-5 md:flex md:items-start md:gap-8 md:p-6" style={{ borderColor: C.line }}>
          <h2 id="cl-marks" className="shrink-0 text-[18px] font-bold md:w-[120px] md:pt-1.5">
            인증 서비스
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2 md:mt-0">
            {MARKS.map((mk) => (
              <li key={mk.name}>
                <button
                  type="button"
                  onClick={() => go(mk.to[0], mk.to[1])}
                  className="inline-flex h-10 min-w-[64px] items-center justify-center rounded-[8px] border px-3 text-[15px] font-bold tracking-[0.02em] hover:border-[#0aa2c0]"
                  style={{ borderColor: C.line, color: C.indigo }}
                >
                  {mk.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

/* ---------- 하위 화면 틀 ---------- */

function SubPage({ m, s: subId }: { m: MenuId; s: string }) {
  const { go } = useCl();
  const menu = MENUS.find((n) => n.id === m)!;
  const sub = menu.subs.find((n) => n.id === subId) ?? menu.subs[0];

  return (
    <>
      <section className="border-b px-4 md:px-6" style={{ background: C.paper, borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 py-7 md:flex-row md:items-end md:justify-between md:py-10">
          <h1 className="text-[28px] font-bold tracking-[-0.03em] md:text-[36px]" style={{ color: C.indigoDeep }}>
            {menu.label}
          </h1>
          <nav aria-label="현재 위치">
            <ol className="flex flex-wrap items-center gap-1 text-[13px] md:text-[14px]" style={{ color: C.muted }}>
              <li>
                <button type="button" onClick={() => go("home")} className="inline-flex h-8 items-center gap-1">
                  <House size={14} aria-hidden />
                  HOME
                </button>
              </li>
              <li className="inline-flex items-center gap-1">
                <ChevronRight size={14} aria-hidden />
                <button type="button" onClick={() => go(m)} className="inline-flex h-8 items-center">
                  {menu.label}
                </button>
              </li>
              <li className="inline-flex items-center gap-1">
                <ChevronRight size={14} aria-hidden />
                <span aria-current="page" className="font-bold" style={{ color: C.ink }}>
                  {sub.label}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </section>

      <div className="px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto grid max-w-[1200px] items-start gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:sticky lg:top-[96px] lg:block">
            <nav aria-label="하위 메뉴" className="overflow-hidden rounded-[10px] border" style={{ borderColor: C.line }}>
              <p className="px-5 py-4 text-[19px] font-bold" style={{ background: C.indigo, color: C.white }}>
                {menu.label}
              </p>
              <ul>
                {menu.subs.map((n) => {
                  const on = n.id === sub.id;
                  return (
                    <li key={n.id} className="border-t" style={{ borderColor: C.line }}>
                      <button
                        type="button"
                        onClick={() => go(m, n.id)}
                        aria-current={on ? "page" : undefined}
                        className="flex min-h-12 w-full items-center justify-between gap-2 px-5 py-2.5 text-left text-[15px]"
                        style={on ? { background: C.indigoSoft, color: C.indigo, fontWeight: 700 } : { color: C.ink }}
                      >
                        {n.label}
                        {on && <ChevronRight size={16} className="shrink-0" aria-hidden />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <ContactBox className="mt-4" />
          </aside>

          <div className="min-w-0">
            <div className="mb-6 lg:hidden">
              <label htmlFor="cl-lnb" className="sr-only">
                {menu.label} 하위 메뉴
              </label>
              <span className="relative block">
                <select
                  id="cl-lnb"
                  value={sub.id}
                  onChange={(e) => go(m, e.target.value)}
                  className="h-12 w-full appearance-none rounded-[8px] border bg-white pl-4 pr-10 text-[16px] font-bold outline-none focus:border-[#23307a]"
                  style={{ borderColor: C.indigo, color: C.indigo }}
                >
                  {menu.subs.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={20} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.indigo }} aria-hidden />
              </span>
            </div>
            <h2 id="cl-page-title" tabIndex={-1} className="border-b-2 pb-3 text-[24px] font-bold tracking-[-0.03em] outline-none md:text-[30px]" style={{ borderColor: C.ink }}>
              {sub.label}
            </h2>
            <div className="mt-6 md:mt-8">
              <PageBody m={m} s={sub.id} />
            </div>
            <ContactBox className="mt-12 lg:hidden" />
          </div>
        </div>
      </div>
    </>
  );
}

function ContactBox({ className = "" }: { className?: string }) {
  const { openQuote } = useCl();
  return (
    <div className={`rounded-[10px] border p-5 ${className}`} style={{ borderColor: C.line, background: C.paper }}>
      <p className="text-[15px] font-bold">상담 안내</p>
      <a href={`tel:${TEL}`} className="mt-1 block text-[24px] font-bold tabular-nums tracking-[-0.02em]" style={{ color: C.indigo }}>
        {TEL}
      </a>
      <p className="text-[14px] tabular-nums" style={{ color: C.muted }}>
        {HOURS}
        <br />
        {EMAIL}
      </p>
      <button type="button" onClick={openQuote} className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-[8px] text-[15px] font-bold" style={{ background: C.indigo, color: C.white }}>
        견적문의
      </button>
    </div>
  );
}

function PageBody({ m, s: sub }: { m: MenuId; s: string }) {
  switch (`${m}/${sub}`) {
    case "about/greeting":
      return <Greeting />;
    case "about/accredit":
      return <Accredit />;
    case "about/facility":
      return <Facilities />;
    case "about/impartiality":
      return <Impartiality />;
    case "about/complaint":
      return <Complaint />;
    case "about/recruit":
      return <Recruit />;
    case "about/location":
      return <Location />;
    case "support/finder":
      return <Finder />;
    case "support/track":
      return <Tracking />;
    case "support/verify":
      return <Verify />;
    case "support/quote":
      return <Quote />;
    case "support/news":
      return <Board tab="news" />;
    case "support/files":
      return <Board tab="files" />;
    case "support/faq":
      return <Faq />;
  }
  if (m === "services") return <ServicePage id={sub} />;
  if (m === "domestic") return <DomesticPage id={sub} />;
  if (m === "global") return <GlobalPage id={sub as RegionId} />;
  return null;
}

/* ---------- 공용 표 ---------- */

function DataTable({ caption, head, rows, min = 520 }: { caption: string; head: string[]; rows: ReactNode[][]; min?: number }) {
  return (
    <div className="overflow-x-auto border-t-2" style={{ borderColor: C.indigo }}>
      <table className="w-full border-collapse text-left text-[15px]" style={{ minWidth: min }}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr style={{ background: C.paper }}>
            {head.map((h) => (
              <th key={h} scope="col" className="border-b px-4 py-3 text-[14px] font-bold" style={{ borderColor: C.line }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} className="border-b align-top" style={{ borderColor: C.line }}>
              {r.map((cell, ci) =>
                ci === 0 ? (
                  <th key={ci} scope="row" className="px-4 py-3.5 font-bold" style={{ color: C.indigo }}>
                    {cell}
                  </th>
                ) : (
                  <td key={ci} className="px-4 py-3.5">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoList({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="border-t-2 text-[15px] md:text-[16px]" style={{ borderColor: C.indigo }}>
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[96px_1fr] border-b md:grid-cols-[150px_1fr]" style={{ borderColor: C.line }}>
          <dt className="px-3 py-3 font-bold md:px-5" style={{ background: C.paper }}>
            {k}
          </dt>
          <dd className="min-w-0 px-3 py-3 md:px-5">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function SubHead({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-28 text-[19px] font-bold tracking-[-0.02em] md:text-[21px]">
      {children}
    </h3>
  );
}

/* ---------- 회사소개 ---------- */

function Greeting() {
  return (
    <div className="max-w-[820px]">
      <div className="relative aspect-[21/9] overflow-hidden rounded-[10px]">
        <Image src={`${IMG}/lab.jpg`} alt="스펙트럼 분석기와 오실로스코프가 놓인 전자 시험대" fill sizes="(min-width: 1024px) 820px, 100vw" className="object-cover" />
      </div>
      <div className="mt-8 space-y-4">
        <p className="text-[19px] font-bold leading-[1.6]">{COMPANY} 홈페이지를 찾아 주셔서 감사합니다.</p>
        <p>{COMPANY}은 전자파 시험실로 문을 열었고, 지금은 무선과 전기안전 시험, 해외인증 업무도 함께 하고 있습니다.</p>
        <p>부적합 항목이 발생하면 원인 분석과 대책을 함께 안내해 드립니다. 인증이 처음이신 기업도 부담 없이 문의해 주시기 바랍니다.</p>
        <p className="pt-4 text-right font-bold">대표이사 김○○</p>
      </div>
    </div>
  );
}

const ACCREDIT: [string, string, string, string][] = [
  ["KC인증 지정시험기관", "전자파 적합성(EMC), 무선기기(RF)", "제KT0000호", "△△연구원"],
  ["KOLAS 공인시험기관", "전기·전자, 전자파 (ISO/IEC 17025)", "제KT0000호", "△△인정기구"],
  ["전기용품 안전 시험기관", "가정용 전기기기, 조명기기, 정보기기", "제0000-00호", "△△원"],
  ["에너지 효율 시험기관", "조명기기, 전원 장치", "제0000-000호", "△△공단"],
  ["해외 인증기관 협력 시험소", "북미, 유럽 인증 시험", "협약 2건", "△△ 인증기관"],
];

function Accredit() {
  return (
    <div>
      <DataTable caption="인정 및 지정 현황" head={["구분", "분야", "지정·인정 번호", "지정기관"]} rows={ACCREDIT.map((r) => [r[0], r[1], <span key="n" className="tabular-nums">{r[2]}</span>, r[3]])} min={620} />
      <p className="mt-4 text-[14px]" style={{ color: C.muted }}>
        인정서와 지정서 사본은 자료실에서 내려받으실 수 있습니다.
      </p>
    </div>
  );
}

const FACILITIES = [
  {
    name: "3m 전파무향실",
    body: "방사 방출과 방사 내성을 측정합니다. 지름 2m 턴테이블과 1~4m 안테나 마스트를 보유하고 있습니다.",
    specs: [
      ["크기", "9 × 6 × 6 m"],
      ["주파수", "30MHz ~ 18GHz"],
      ["턴테이블 하중", "1.2톤"],
    ],
    draw: "chamber" as const,
  },
  {
    name: "차폐실",
    body: "외부 전파가 차단된 차폐실에서 정전기, 전도 내성, 서지 등 내성 시험을 수행합니다.",
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
    body: "절연, 내전압, 온도 상승, 누설전류를 측정하고 구조와 부품을 검토합니다.",
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
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {FACILITIES.map((f) => (
        <li key={f.name} className="flex flex-col rounded-[10px] border bg-white p-5" style={{ borderColor: C.line }}>
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
        </li>
      ))}
    </ul>
  );
}

const IMPARTIAL = [
  "모든 시험·인증 업무는 관련 법령과 국제 기준(ISO/IEC 17025)에 따라 독립적이고 공정하게 수행합니다.",
  "시험 결과에 영향을 줄 수 있는 상업적, 재정적 압력이나 그 밖의 압력을 받지 않으며, 이를 허용하지 않습니다.",
  "의뢰자와 이해관계가 있는 직원은 해당 시험과 판정에 참여하지 않습니다.",
  "공평성을 해칠 수 있는 위험을 정기적으로 파악하고 없애거나 줄이는 조치를 합니다.",
  "업무 중 알게 된 고객의 정보와 기술 자료는 법에서 정한 경우를 빼고 공개하지 않습니다.",
  "모든 고객에게 같은 기준과 절차로 시험 서비스를 제공합니다.",
];

function Impartiality() {
  return (
    <div className="max-w-[820px] rounded-[10px] border p-6 md:p-9" style={{ borderColor: C.line }}>
      <p className="text-center text-[22px] font-bold tracking-[-0.02em] md:text-[26px]">공평성 선언문</p>
      <p className="mt-5">{COMPANY}은 시험·인증 기관으로서 공평성의 중요성을 인식하고, 다음과 같이 선언합니다.</p>
      <ol className="mt-5 list-decimal space-y-2.5 pl-6 marker:font-bold marker:text-[#23307a]">
        {IMPARTIAL.map((t) => (
          <li key={t} className="pl-1">
            {t}
          </li>
        ))}
      </ol>
      <p className="mt-8 text-center tabular-nums" style={{ color: C.muted }}>
        2026년 9월 30일
      </p>
      <p className="mt-1 text-center font-bold">{COMPANY} 대표이사 김○○</p>
    </div>
  );
}

const COMPLAINT_STEPS: [string, string, string][] = [
  ["불만 접수", "전화, 이메일, 서면, 방문으로 접수하고 접수 대장에 기록합니다.", "즉시"],
  ["접수 확인 통지", "접수번호와 담당자를 고객에게 알립니다.", "1일 이내"],
  ["조사 및 원인 분석", "시험 기록과 장비 이력을 확인하고 원인을 분석합니다.", "7일 이내"],
  ["처리 결과 검토", "불만 대상 업무에 참여하지 않은 책임자가 처리 결과를 검토하고 승인합니다.", "10일 이내"],
  ["결과 통보", "처리 결과와 시정 조치를 서면으로 알립니다.", "14일 이내"],
];

function Complaint() {
  return (
    <div className="grid gap-10">
      <p className="max-w-[820px]">시험·인증 업무에 대한 고객의 불만과 이의 제기를 공정하게 처리하기 위해 다음 절차를 따릅니다. 불만 제기를 이유로 고객이 불이익을 받는 일은 없습니다.</p>
      <section aria-labelledby="cl-cp-steps">
        <SubHead id="cl-cp-steps">처리 절차</SubHead>
        <div className="mt-3">
          <DataTable caption="고객불만 처리 절차" head={["단계", "내용", "처리 기한"]} rows={COMPLAINT_STEPS.map(([a, b, c]) => [a, b, <span key="c" className="whitespace-nowrap tabular-nums">{c}</span>])} min={560} />
        </div>
      </section>
      <section aria-labelledby="cl-cp-how">
        <SubHead id="cl-cp-how">접수 방법</SubHead>
        <div className="mt-3">
          <InfoList
            rows={[
              ["전화", <span key="t" className="tabular-nums">{TEL} (품질책임자)</span>],
              ["이메일", EMAIL],
              ["서면·방문", ADDRESS],
            ]}
          />
        </div>
      </section>
    </div>
  );
}

const JOBS: [string, string, string][] = [
  ["EMC 시험원", "전기·전자 관련 학과, 경력 무관", "정규직"],
  ["RF 시험원", "무선 측정 경험 2년 이상", "정규직"],
  ["해외인증 담당", "영문 기술 문서 작성 가능자", "정규직"],
];

function Recruit() {
  return (
    <div className="grid gap-6">
      <DataTable caption="모집 분야" head={["모집 분야", "자격 요건", "고용 형태"]} rows={JOBS} />
      <InfoList
        rows={[
          ["접수 방법", `이메일 접수 (${EMAIL})`],
          ["제출 서류", "이력서, 자기소개서"],
          ["전형 절차", "서류 전형, 면접, 최종 합격 (서류 검토 후 2주 이내 연락)"],
        ]}
      />
    </div>
  );
}

const SHIP_TO = `${ADDRESS} 1층 시료접수실`;
const SHIP_RECEIVER = "시료접수팀";
const SHIP_TEL = "02-000-0002";

const BOX_ITEMS = [
  { id: "sample", name: "시료", note: "시험용 1대와 예비 1대" },
  { id: "form", name: "시험신청서", note: "자료실의 [서식] 시험신청서" },
  { id: "manual", name: "사용설명서", note: "켜는 법과 시험 모드 들어가는 법" },
  { id: "circuit", name: "회로도", note: "부품 목록이 있으면 함께" },
];

function Location() {
  const [copied, setCopied] = useState(false);
  const [packed, setPacked] = useState<string[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const listId = useId();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${SHIP_TO} (${SHIP_RECEIVER}, ${SHIP_TEL})`);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const toggle = (id: string) => setPacked((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));

  return (
    <div className="grid gap-10">
      <InfoList
        rows={[
          ["주소", ADDRESS],
          ["전화", <span key="t" className="tabular-nums">{TEL}</span>],
          ["팩스", <span key="f" className="tabular-nums">{FAX}</span>],
          ["대중교통", "□□역 2번 출구에서 □□번 버스, □□사거리 정류장 하차 후 도보 3분"],
          ["자가용", "건물 뒤 방문 주차장 이용 (방문 상담은 하루 전까지 전화 예약)"],
        ]}
      />

      <section aria-labelledby="cl-ship">
        <SubHead id="cl-ship">시료 접수 안내</SubHead>
        <p className="mt-2" style={{ color: C.muted }}>
          평일 17시까지 도착한 시료는 그날 접수하고 접수 확인 문자를 보내 드립니다.
        </p>
        <div className="mt-5 grid items-start gap-5 xl:grid-cols-[1.15fr_1fr]">
          <div className="rounded-[10px] border bg-white p-5 md:p-6" style={{ borderColor: C.line }}>
            <dl className="grid gap-3 text-[16px]">
              <div className="grid gap-1 sm:grid-cols-[88px_1fr] sm:gap-4">
                <dt className="font-bold" style={{ color: C.muted }}>
                  받는 주소
                </dt>
                <dd className="text-[17px] font-bold leading-[1.5] tracking-[-0.02em]">{SHIP_TO}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[88px_1fr] sm:gap-4">
                <dt className="font-bold" style={{ color: C.muted }}>
                  받는 사람
                </dt>
                <dd>{SHIP_RECEIVER}</dd>
              </div>
              <div className="grid gap-1 sm:grid-cols-[88px_1fr] sm:gap-4">
                <dt className="font-bold" style={{ color: C.muted }}>
                  전화
                </dt>
                <dd>
                  <a href={`tel:${SHIP_TEL}`} className="tabular-nums underline underline-offset-4">
                    {SHIP_TEL}
                  </a>
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t pt-4" style={{ borderColor: C.line }}>
              <button type="button" onClick={copy} className="inline-flex h-11 items-center gap-2 rounded-[8px] px-5 font-bold" style={{ background: C.indigo, color: C.white }}>
                {copied ? <Check size={17} strokeWidth={3} aria-hidden /> : <Copy size={17} aria-hidden />}
                {copied ? "복사됨" : "주소 복사"}
              </button>
              <span className="sr-only" role="status">
                {copied ? "주소를 복사했습니다" : ""}
              </span>
              <p className="text-[15px]" style={{ color: C.muted }}>
                상자 겉면에 접수번호를 적어 주십시오.
              </p>
            </div>
          </div>

          <fieldset className="rounded-[10px] border bg-white p-5 md:p-6" style={{ borderColor: C.line }}>
            <legend className="sr-only">동봉 서류</legend>
            <p className="font-bold" aria-hidden>
              동봉 서류
            </p>
            <ul className="mt-2 grid gap-1" aria-describedby={listId}>
              {BOX_ITEMS.map((b) => {
                const on = packed.includes(b.id);
                return (
                  <li key={b.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-[8px] px-2 py-2.5 hover:bg-[#f4f7fb]">
                      <input type="checkbox" checked={on} onChange={() => toggle(b.id)} className="mt-1 h-[18px] w-[18px] shrink-0 accent-[#23307a]" />
                      <span className="min-w-0">
                        <span className={`block font-bold ${on ? "line-through" : ""}`} style={{ color: on ? C.muted : C.ink }}>
                          {b.name}
                        </span>
                        <span className="block text-[15px]" style={{ color: C.muted }}>
                          {b.note}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <p id={listId} className="mt-2 px-2 text-[15px] tabular-nums" style={{ color: C.muted }}>
              {packed.length === BOX_ITEMS.length ? "모두 챙겼습니다." : `${BOX_ITEMS.length}개 중 ${packed.length}개 확인`}
            </p>
          </fieldset>
        </div>
      </section>
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
    body: "국가별 인증 서류 준비, 현지 인증기관 신청 및 대리인 업무를 대행합니다.",
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

const SERVICE_ID: Record<string, string> = { emc: "EMC", rf: "RF", safety: "SAFETY", gma: "GMA" };
const SERVICE_TARGETS: Record<string, string> = {
  EMC: "가전기기, 정보통신기기, 조명기기, 산업용 기기, 의료기기",
  RF: "블루투스·Wi-Fi 기기, LTE·5G 단말, 무선 충전기, RFID·NFC 기기",
  GMA: "해외에 판매하는 전기·전자 제품",
  SAFETY: "가정용 전기기기, 정보·사무기기, 조명기기, 전원 장치·어댑터",
};

function ServicePage({ id }: { id: string }) {
  const { go, openQuote } = useCl();
  const sv = SERVICES.find((v) => v.code === SERVICE_ID[id]) ?? SERVICES[0];
  return (
    <div className="grid gap-8">
      <p className="max-w-[820px]">{sv.body}</p>
      <InfoList
        rows={[
          ["시험 항목", sv.tests.join(", ")],
          ["관련 규격", sv.std],
          ["시험 대상 품목", SERVICE_TARGETS[sv.code]],
        ]}
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={openQuote} className="inline-flex h-12 items-center rounded-[8px] px-6 font-bold" style={{ background: C.indigo, color: C.white }}>
          견적문의
        </button>
        <button type="button" onClick={() => go("support", "finder")} className="inline-flex h-12 items-center gap-1.5 rounded-[8px] border px-5 font-bold" style={{ borderColor: C.line, color: C.indigo }}>
          <Search size={17} aria-hidden />
          인증 대상 조회
        </button>
      </div>
    </div>
  );
}

/* ---------- 국내인증 ---------- */

const DOMESTIC: Record<string, { intro: string; law: string; target: string; period: string; docs: string[]; steps: [string, string][]; mark: string }> = {
  conform: {
    intro: "전파법에 따라 무선기기와 유선 통신기기를 제조·수입·판매하기 전에 받는 인증입니다. 지정시험기관의 시험성적서를 붙여 신청합니다.",
    law: "전파법",
    target: "무선기기, 유선 통신기기 (블루투스, Wi-Fi, LTE 단말 등)",
    period: "3~8주",
    docs: ["적합성평가 신청서", "사용자 설명서 (한글)", "외관도와 부품 배치도", "회로도와 부품 목록", "안테나 사양서 (무선기기)", "지정시험기관 시험성적서"],
    steps: [
      ["시험 신청", "시험신청서와 시료, 기술 문서를 제출합니다."],
      ["시험", "전자파 적합성과 무선 항목을 시험하고 시험성적서를 발행합니다."],
      ["인증 신청", "시험성적서를 붙여 인증기관에 적합인증을 신청합니다."],
      ["심사", "제출 서류와 시험성적서를 심사합니다."],
      ["인증서 발급", "인증번호가 부여되고 인증서가 발급됩니다."],
    ],
    mark: "KC 마크와 인증번호(R-C-로 시작)를 제품 본체의 잘 보이는 곳에 표시합니다. 본체가 작아 표시하기 어려우면 포장과 설명서에 표시할 수 있습니다.",
  },
  register: {
    intro: "전자파 장해 우려가 적은 전기·전자 기기는 시험성적서를 갖추고 적합등록을 합니다.",
    law: "전파법",
    target: "가전, 정보기기, 조명 등 전자파 장해 우려가 적은 전기·전자 기기",
    period: "2~3주",
    docs: ["적합성평가 신청서", "지정시험기관 시험성적서", "사용자 설명서", "외관도"],
    steps: [
      ["시험 신청", "시험신청서와 시료를 제출합니다."],
      ["시험", "전도·방사 방출과 내성을 시험합니다."],
      ["적합등록 신청", "시험성적서를 갖추고 적합등록을 신청합니다."],
      ["등록 완료", "등록번호가 부여됩니다."],
    ],
    mark: "KC 마크와 등록번호(R-R-로 시작)를 제품에 표시합니다.",
  },
  elec: {
    intro: "전기용품 및 생활용품 안전관리법에 따라 위해 정도에 맞춰 안전인증, 안전확인, 공급자적합성확인으로 나뉩니다. 안전인증 대상은 제품 시험과 공장 심사를 함께 받습니다.",
    law: "전기용품 및 생활용품 안전관리법",
    target: "교류 전원에 직접 연결하는 가전, 조명, 전원 장치 일부",
    period: "4~6주",
    docs: ["안전인증 신청서", "제품 설명서", "회로도와 부품 목록", "주요 부품 인증서", "공장 품질 관리 문서"],
    steps: [
      ["신청", "신청서와 시료, 기술 문서를 제출합니다."],
      ["제품 시험", "절연, 내전압, 온도 상승, 누설전류 등을 시험합니다."],
      ["공장 심사", "제조 공장의 품질 관리 체계를 심사합니다."],
      ["인증서 발급", "시험과 심사에 모두 적합하면 인증서를 발급합니다."],
      ["정기 검사", "인증 후 해마다 정기 검사를 받습니다."],
    ],
    mark: "KC 안전인증 마크와 인증번호, 모델명, 정격 전압·소비전력, 제조자명을 제품에 표시합니다.",
  },
  energy: {
    intro: "에너지이용 합리화법에 따라 효율관리기자재는 소비효율 등급을, 대기전력 저감 대상 제품은 대기전력 기준 적합 여부를 시험하고 신고합니다.",
    law: "에너지이용 합리화법",
    target: "효율관리기자재 (냉장고, 조명기기 등), 대기전력 저감 대상 제품",
    period: "2~3주",
    docs: ["시험 신청서", "제품 사양서", "시료"],
    steps: [
      ["시험 신청", "신청서와 시료를 제출합니다."],
      ["효율 시험", "소비전력, 효율, 대기전력을 측정합니다."],
      ["성적서 발행", "측정값과 등급을 적은 시험성적서를 발행합니다."],
      ["신고", "시험성적서로 효율 등급 또는 대기전력을 신고합니다."],
    ],
    mark: "에너지소비효율등급 라벨 또는 대기전력 저감 표시를 제품과 포장에 붙입니다.",
  },
  kcs: {
    intro: "산업안전보건법에 따라 신고 대상 산업용 기계·기구와 방호장치는 자율안전기준에 맞는지 시험한 뒤 신고합니다.",
    law: "산업안전보건법",
    target: "신고 대상 산업용 기계·기구와 방호장치",
    period: "3~4주",
    docs: ["자율안전확인 신고서", "제품 설명서", "자율안전기준 적합 시험성적서", "외관 사진"],
    steps: [
      ["시험 신청", "신청서와 기술 문서를 제출합니다."],
      ["시험", "전기적 안전, 위험 부위 방호, 비상정지 장치를 시험합니다."],
      ["신고", "시험성적서를 붙여 신고합니다."],
      ["신고증명서 발급", "신고증명서와 신고번호를 받습니다."],
    ],
    mark: "KCs 마크와 신고번호를 제품의 잘 보이는 곳에 표시합니다.",
  },
};

function DomesticPage({ id }: { id: string }) {
  const { openQuote } = useCl();
  const d = DOMESTIC[id] ?? DOMESTIC.conform;
  const anchors: [string, string][] = [
    ["cl-sec-docs", "신청서류"],
    ["cl-sec-steps", "인증취득 절차"],
    ["cl-sec-mark", "표시기준"],
  ];
  return (
    <div className="grid gap-10">
      <p className="max-w-[820px]">{d.intro}</p>
      <InfoList
        rows={[
          ["근거 법령", d.law],
          ["대상", d.target],
          ["처리기간", <span key="p" className="font-bold tabular-nums">{d.period}</span>],
        ]}
      />
      <nav aria-label="본문 바로가기">
        <ul className="grid grid-cols-3 overflow-hidden rounded-[8px] border" style={{ borderColor: C.line }}>
          {anchors.map(([href, label], i) => (
            <li key={href} className={i > 0 ? "border-l" : ""} style={{ borderColor: C.line }}>
              <a href={`#${href}`} className="flex h-12 items-center justify-center px-1 text-center text-[14px] font-bold hover:bg-[#f4f7fb] md:text-[15px]" style={{ color: C.indigo }}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <section aria-labelledby="cl-sec-docs">
        <SubHead id="cl-sec-docs">신청서류</SubHead>
        <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
          {d.docs.map((v) => (
            <li key={v} className="flex items-start gap-2">
              <FileText size={17} className="mt-1 shrink-0" style={{ color: C.cyanText }} aria-hidden />
              {v}
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="cl-sec-steps">
        <SubHead id="cl-sec-steps">인증취득 절차</SubHead>
        <ol className="mt-3 grid gap-2 md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
          {d.steps.map(([title, body], i) => (
            <li key={title} className="flex gap-3 rounded-[10px] border p-4 md:block" style={{ borderColor: C.line }}>
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold tabular-nums" style={{ background: C.indigo, color: C.white }} aria-hidden>
                {i + 1}
              </span>
              <span className="block md:mt-2">
                <span className="block font-bold">{title}</span>
                <span className="block text-[14px] leading-[1.55]" style={{ color: C.muted }}>
                  {body}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="cl-sec-mark">
        <SubHead id="cl-sec-mark">표시기준</SubHead>
        <p className="mt-3 max-w-[820px]">{d.mark}</p>
      </section>
      <div>
        <button type="button" onClick={openQuote} className="inline-flex h-12 items-center rounded-[8px] px-6 font-bold" style={{ background: C.indigo, color: C.white }}>
          견적문의
        </button>
      </div>
    </div>
  );
}

/* ---------- 해외인증 ---------- */

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
    name: "북아메리카",
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
    name: "남아메리카",
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

const GLOBAL_STEPS = ["견적·계약", "시료 접수", "시험", "현지 기관 신청", "인증서 발급"];

function RegionMap({ region }: { region: RegionId }) {
  const { go } = useCl();
  const reduce = useReducedMotionSafe();
  const [focus, setFocus] = useState<RegionId | null>(null);

  const onKey = (id: RegionId) => (e: ReactKeyboardEvent<SVGGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go("global", id);
    }
  };

  return (
    <div className="rounded-[10px] p-2 md:p-4" style={{ background: C.indigoDeep }}>
      <svg viewBox="0 0 1000 500" className="h-auto w-full" role="group" aria-label="대륙 선택 지도">
        {REGION_IDS.map((id) => {
          const on = region === id;
          const hot = focus === id;
          return (
            <g
              key={id}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={REGIONS[id].name}
              onClick={() => go("global", id)}
              onKeyDown={onKey(id)}
              onFocus={() => setFocus(id)}
              onBlur={() => setFocus(null)}
              onMouseEnter={() => setFocus(id)}
              onMouseLeave={() => setFocus(null)}
              className="cursor-pointer outline-none"
            >
              {REGION_SHAPES[id].map((p, i) => (
                <polygon key={i} points={p.map(([x, y]) => `${x},${y}`).join(" ")} fill="transparent" stroke={hot ? C.cyan : "transparent"} strokeWidth="2" strokeDasharray="6 5" strokeLinejoin="round" />
              ))}
              {REGION_DOTS[id].map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={4.4} fill={on ? C.cyan : hot ? "#7c88c9" : "#4a5598"} style={{ transition: reduce ? undefined : "fill 0.25s" }} />
              ))}
              <g pointerEvents="none">
                <rect x={REGIONS[id].label[0] - 66} y={REGIONS[id].label[1] - 21} width="132" height="38" rx="8" fill={on ? C.white : C.indigoDeep} stroke={on ? C.white : "rgba(255,255,255,0.35)"} />
                <text x={REGIONS[id].label[0]} y={REGIONS[id].label[1] + 6} textAnchor="middle" fontSize="20" fontWeight={700} fill={on ? C.indigo : C.white}>
                  {REGIONS[id].name}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function GlobalPage({ id }: { id: RegionId }) {
  const { openQuote } = useCl();
  const region: RegionId = REGIONS[id] ? id : "na";
  const info = REGIONS[region];
  const [ci, setCi] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const country = info.countries[Math.min(ci, info.countries.length - 1)];

  const onTabKey = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = info.countries.length;
    const next = (ci + (e.key === "ArrowRight" ? 1 : n - 1)) % n;
    setCi(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="grid gap-8">
      <div className="max-w-[720px]">
        <RegionMap region={region} />
      </div>
      <div>
        <div role="tablist" aria-label={`${info.name} 국가`} className="flex flex-wrap gap-1.5">
          {info.countries.map((c, i) => {
            const on = i === ci;
            return (
              <button
                key={c.name}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`cl-country-${i}`}
                aria-selected={on}
                aria-controls="cl-country-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => setCi(i)}
                onKeyDown={onTabKey}
                className="h-11 rounded-[8px] border px-4 text-[15px] font-bold"
                style={on ? { background: C.indigo, color: C.white, borderColor: C.indigo } : { borderColor: C.line, color: C.ink }}
              >
                {c.name}
              </button>
            );
          })}
        </div>
        <div id="cl-country-panel" role="tabpanel" aria-labelledby={`cl-country-${ci}`} className="mt-5 grid gap-8">
          <section aria-labelledby="cl-gl-overview">
            <SubHead id="cl-gl-overview">인증개요</SubHead>
            <div className="mt-3">
              <DataTable caption={`${country.name} 인증`} head={["인증", "내용"]} rows={country.certs.map((ct) => [ct.name, ct.desc])} min={320} />
            </div>
          </section>
          <section aria-labelledby="cl-gl-steps">
            <SubHead id="cl-gl-steps">인증처리절차</SubHead>
            <ol className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-2">
              {GLOBAL_STEPS.map((st, i) => (
                <li key={st} className="inline-flex items-center gap-1">
                  <span className="inline-flex h-10 items-center gap-2 rounded-[8px] border px-3 text-[15px] font-semibold" style={{ borderColor: C.line }}>
                    <span className="text-[13px] font-bold tabular-nums" style={{ color: C.cyanText }}>
                      {i + 1}
                    </span>
                    {st}
                  </span>
                  {i < GLOBAL_STEPS.length - 1 && <ChevronRight size={16} style={{ color: C.muted }} aria-hidden />}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[15px]" style={{ color: C.muted }}>
              국내 시험성적서를 인정하는 국가는 이곳에서 시험하고, 현지 시험이 필요한 국가는 협력 기관과 진행합니다.
            </p>
          </section>
          <div>
            <button type="button" onClick={openQuote} className="inline-flex h-12 items-center rounded-[8px] px-6 font-bold" style={{ background: C.indigo, color: C.white }}>
              견적문의
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 인증 대상 조회 ---------- */

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
      reason: "선택하신 조건은 강제 인증 대상이 아닌 경우가 많습니다. 품목 분류(HS 코드)로 다시 확인이 필요합니다.",
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

function Finder() {
  const { certs, setCerts, openQuote } = useCl();
  const reduce = useReducedMotionSafe();
  const [power, setPower] = useState<Power>("adapter");
  const [radio, setRadio] = useState<Radio>("bt");
  const [kind, setKind] = useState<Kind>("home");
  const [countries, setCountries] = useState<Country[]>(["kr", "us", "eu"]);

  const input = { power, radio, kind };
  const groups = COUNTRIES.filter((c) => countries.includes(c.v)).map((c) => ({ ...c, items: certsFor(c.v, input) }));
  const all = groups.flatMap((g) => g.items);
  const longest = Math.max(0, ...all.map((c) => maxWeeks(c.period)));
  const added = all.length > 0 && all.every((c) => certs.includes(c.short));

  const toggleCountry = (v: Country) => setCountries((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  const addAll = () => setCerts((prev) => [...prev, ...all.map((c) => c.short).filter((n) => !prev.includes(n))]);

  return (
    <div>
      <p>제품 조건을 선택하세요.</p>
      <div className="mt-5 grid items-start gap-6 xl:grid-cols-[340px_1fr]">
        <div className="space-y-6 rounded-[10px] border p-5" style={{ borderColor: C.line, background: C.paper }}>
          <ChipGroup legend="전원 방식" value={power} options={POWER_OPTS} onPick={setPower} />
          <ChipGroup legend="무선 기능" value={radio} options={RADIO_OPTS} onPick={setRadio} />
          <ChipGroup legend="제품 분류" value={kind} options={KIND_OPTS} onPick={setKind} />
          <fieldset>
            <legend className="text-[15px] font-bold">
              판매 국가 <span className="font-normal" style={{ color: C.muted }}>(복수 선택)</span>
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
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
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border" style={on ? { background: C.cyan, borderColor: C.cyan, color: C.white } : { borderColor: "#b4bdd0" }} aria-hidden>
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
                    , 함께 진행 시 약 <span className="tabular-nums">{longest}</span>주
                  </span>
                )}
              </p>
            ) : (
              <p>판매 국가를 하나 이상 선택해 주십시오.</p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={addAll}
                disabled={all.length === 0}
                className="inline-flex h-11 items-center gap-1.5 rounded-[8px] px-4 text-[15px] font-bold disabled:opacity-40"
                style={{ background: C.cyan, color: C.indigoDeep }}
              >
                {added ? <Check size={18} aria-hidden /> : <Plus size={18} aria-hidden />}
                {added ? "추가됨" : "견적문의에 추가"}
              </button>
              {certs.length > 0 && (
                <button type="button" onClick={openQuote} className="inline-flex h-11 items-center gap-1 rounded-[8px] border px-4 text-[15px] font-bold" style={{ borderColor: "rgba(255,255,255,0.5)" }}>
                  견적문의 작성
                  <span className="tabular-nums">({certs.length})</span>
                </button>
              )}
            </div>
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
            품목과 사양에 따라 달라질 수 있으며, 최종 대상은 사양서 검토 후 안내합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- 시험진행현황 조회 ---------- */

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

function Tracking() {
  const { trackQuery, minute } = useCl();
  const reduce = useReducedMotionSafe();
  const first = trackQuery.trim();
  const [query, setQuery] = useState(first);
  const [result, setResult] = useState<TrackResult | null>(() => (first ? lookup(first) : null));
  const [error, setError] = useState(() => (!first || lookup(first) ? "" : `접수번호 끝 네 자리 숫자를 확인해 주십시오. 예: ${SAMPLE_NO}`));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = lookup(query);
    if (!r) {
      setError(query.trim() ? `접수번호 끝 네 자리 숫자를 확인해 주십시오. 예: ${SAMPLE_NO}` : "접수번호를 입력해 주십시오.");
      setResult(null);
      return;
    }
    setError("");
    setQuery(r.no);
    setResult(r);
  };

  const today = minute < 0 ? null : new Date(minute * 60_000);
  const elapsed = result && today ? Math.round((dayStart(today) - dayStart(result.dates[0])) / 86_400_000) : null;

  return (
    <div>
      <form onSubmit={submit} noValidate className="rounded-[10px] border p-4 md:p-5" style={{ borderColor: C.line, background: C.paper }}>
        <label htmlFor="track-no" className="text-[15px] font-bold">
          접수번호
        </label>
        <div className="mt-2 flex max-w-[560px] flex-col gap-2 sm:flex-row">
          <input
            id="track-no"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`예: ${SAMPLE_NO}`}
            autoComplete="off"
            aria-invalid={!!error}
            aria-describedby={error ? "track-err" : "track-hint"}
            className="h-12 min-w-0 flex-1 rounded-[8px] border bg-white px-4 text-[17px] font-semibold tracking-[0.02em] tabular-nums outline-none focus:border-[#23307a]"
            style={{ borderColor: error ? C.error : C.line }}
          />
          <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] px-6 font-bold" style={{ background: C.indigo, color: C.white }}>
            <Search size={18} aria-hidden />
            조회
          </button>
        </div>
        {error ? (
          <p id="track-err" role="alert" className="mt-2 text-[15px] font-semibold" style={{ color: C.error }}>
            {error}
          </p>
        ) : (
          <p id="track-hint" className="mt-2 text-[14px]" style={{ color: C.muted }}>
            접수증과 접수 안내 메일에 적힌 번호를 입력하세요.
          </p>
        )}
      </form>

      {result && (
        <div className="mt-6 rounded-[10px] border bg-white" style={{ borderColor: C.line }} aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b px-5 py-4 md:px-6" style={{ borderColor: C.line }}>
            <div className="min-w-0">
              <p className="text-[14px] tabular-nums" style={{ color: C.muted }}>
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
                  (접수 후 {elapsed + 1}일째)
                </span>
              )}
            </p>
          </div>

          <ol className="grid grid-cols-1 gap-0 px-5 py-5 sm:grid-cols-3 md:px-6 xl:grid-cols-6">
            {STEPS.map((st, i) => {
              const done = i < result.step || result.step === 5;
              const now = i === result.step && result.step !== 5;
              return (
                <li key={st} className="relative flex gap-3 pb-4 sm:block sm:pb-5 sm:pr-3" aria-current={now ? "step" : undefined}>
                  <div className="flex flex-col items-center sm:flex-row">
                    <motion.span
                      className="relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-[14px] font-bold tabular-nums"
                      style={done ? { background: C.indigo, borderColor: C.indigo, color: C.white } : now ? { background: C.white, borderColor: C.cyan, color: C.indigo } : { background: C.white, borderColor: C.line, color: C.muted }}
                      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.07, ease: EASE }}
                      key={`${result.no}-${i}`}
                    >
                      {done ? <Check size={16} strokeWidth={3} aria-hidden /> : i + 1}
                    </motion.span>
                    {i < STEPS.length - 1 && <span className="mt-1 w-0.5 flex-1 sm:ml-1 sm:mt-0 sm:h-0.5 sm:w-auto" style={{ background: done ? C.indigo : C.line }} aria-hidden />}
                  </div>
                  <div className="sm:mt-2.5">
                    <p className="font-bold" style={{ color: done || now ? C.ink : C.muted }}>
                      {st}
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
              <div className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
                <div className="min-w-0">
                  <p className="font-bold">
                    방사 방출 {result.step === 2 ? "예비 측정" : "측정 결과"}{" "}
                    <span className="text-[14px] font-normal" style={{ color: C.muted }}>
                      3m, 수평·수직 편파 중 큰 값
                    </span>
                  </p>
                  <div className="mt-3">
                    <Spectrum pending={false} replayKey={result.no} />
                  </div>
                </div>
                <dl className="divide-y rounded-[8px] border text-[15px]" style={{ borderColor: C.line }}>
                  {[
                    ["판정", result.step === 2 ? "측정 중" : "적합"],
                    ["최소 여유", `${WORST_MARGIN}dB (${WORST.f}MHz)`],
                    ["기준", "방사 방출 B급, 준첨두값"],
                    ["측정 장소", "3m 전파무향실"],
                    ["담당 시험원", "김○○"],
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
  );
}

/* ---------- 성적서 진위확인 ---------- */

function Verify() {
  const [no, setNo] = useState("TR-2609-0412");
  const [shown, setShown] = useState<string | null>(null);
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!lookup(no)) {
      setError("성적서 번호 끝 네 자리 숫자를 확인해 주십시오. 예: TR-2609-0412");
      setShown(null);
      return;
    }
    setError("");
    setShown(no.trim().toUpperCase());
  };

  const r = shown ? lookup(shown) : null;
  const valid = r ? Number(r.no.slice(-4)) % 7 !== 0 : false;

  return (
    <div>
      <form onSubmit={submit} noValidate className="rounded-[10px] border p-4 md:p-5" style={{ borderColor: C.line, background: C.paper }}>
        <label htmlFor="cl-verify-no" className="text-[15px] font-bold">
          성적서 번호
        </label>
        <div className="mt-2 flex max-w-[560px] flex-col gap-2 sm:flex-row">
          <input
            id="cl-verify-no"
            value={no}
            onChange={(e) => setNo(e.target.value)}
            autoComplete="off"
            aria-invalid={!!error}
            aria-describedby={error ? "cl-verify-err" : undefined}
            className="h-12 min-w-0 flex-1 rounded-[8px] border bg-white px-4 text-[17px] font-semibold tabular-nums outline-none focus:border-[#23307a]"
            style={{ borderColor: error ? C.error : C.line }}
          />
          <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] px-6 font-bold" style={{ background: C.indigo, color: C.white }}>
            <ShieldCheck size={18} aria-hidden />
            확인
          </button>
        </div>
        {error && (
          <p id="cl-verify-err" role="alert" className="mt-2 text-[15px] font-semibold" style={{ color: C.error }}>
            {error}
          </p>
        )}
      </form>
      <div aria-live="polite" className="mt-6">
        {r &&
          (valid ? (
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-[8px] px-3 py-1.5 font-bold" style={{ background: C.okSoft, color: C.ok }}>
                <Check size={18} strokeWidth={3} aria-hidden />
                발급된 성적서입니다
              </p>
              <InfoList
                rows={[
                  ["성적서 번호", <span key="n" className="tabular-nums">{shown}</span>],
                  ["발급일", <span key="d" className="tabular-nums">{`${r.dates[3].getFullYear()}.${md(r.dates[3])}`}</span>],
                  ["시험 분야", TEST_LABEL[r.kind]],
                  ["제품명", r.product],
                  ["의뢰사", "(주)△△전자"],
                  ["판정", "적합"],
                ]}
              />
            </div>
          ) : (
            <p className="inline-flex items-center gap-2 rounded-[8px] px-3 py-2 font-bold" style={{ background: C.errorSoft, color: C.error }}>
              <CircleAlert size={18} aria-hidden />
              발급 기록이 없는 번호입니다. {TEL}로 문의해 주십시오.
            </p>
          ))}
      </div>
    </div>
  );
}

/* ---------- 견적문의 ---------- */

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
  if (!v.company.trim()) e.company = "회사명을 입력해 주십시오.";
  if (v.person.trim().length < 2) e.person = "담당자명을 입력해 주십시오.";
  if (v.phone.replace(/\D/g, "").length < 9) e.phone = "연락처를 확인해 주십시오.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "이메일 형식을 확인해 주십시오.";
  if (!v.product.trim()) e.product = "제품명을 입력해 주십시오.";
  if (!v.agree) e.agree = "개인정보 수집·이용에 동의해 주십시오.";
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

/** 진행규격 칸에 쓰는 짧은 이름 */
function stdOf(certs: string[]) {
  const set = new Set<string>();
  for (const c of certs) {
    if (c.includes("KCs")) set.add("KCs");
    else if (/적합|전기용품|에너지|2차전지|공급자/.test(c)) set.add("KC");
    else if (c.startsWith("CE") || c === "RoHS") set.add("CE");
    else if (c.startsWith("FCC")) set.add("FCC");
    else if (c !== "해외인증 상담") set.add(c.split(" ")[0]);
  }
  return set.size ? [...set].slice(0, 3).join(", ") : "상담";
}

function Quote() {
  const { quoteForm, setQuoteForm, rows } = useCl();
  return quoteForm ? <QuoteForm onList={() => setQuoteForm(false)} /> : <QuoteList onWrite={() => setQuoteForm(true)} rows={rows} />;
}

function QuoteList({ rows, onWrite }: { rows: QuoteRow[]; onWrite: () => void }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] tabular-nums" style={{ color: C.muted }}>
          총 <strong style={{ color: C.ink }}>{rows.length}</strong>건 (최근 접수)
        </p>
        <button type="button" onClick={onWrite} className="inline-flex h-11 items-center gap-1.5 rounded-[8px] px-5 text-[15px] font-bold" style={{ background: C.indigo, color: C.white }}>
          <Plus size={17} aria-hidden />
          견적문의 작성
        </button>
      </div>
      <div className="mt-3">
        <DataTable
          caption="견적문의 접수 목록"
          head={["번호", "진행규격", "고객사", "등록일", "상태"]}
          rows={rows.map((r) => [
            <span key="n" className="font-normal tabular-nums" style={{ color: C.muted }}>
              {r.no}
            </span>,
            <span key="s" className="font-bold">
              {r.std}
            </span>,
            r.company,
            <span key="d" className="tabular-nums" style={{ color: C.muted }}>
              {r.date.replaceAll("-", ".")}
            </span>,
            <span key="st" className="whitespace-nowrap rounded-[6px] px-2 py-0.5 text-[13px] font-bold" style={r.done ? { background: C.okSoft, color: C.ok } : { background: C.cyanSoft, color: C.cyanText }}>
              {r.done ? "답변완료" : "접수"}
            </span>,
          ])}
          min={540}
        />
      </div>
      <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
        고객사명은 일부를 가려 표시하며, 문의 내용은 작성자와 담당자만 볼 수 있습니다.
      </p>
    </div>
  );
}

function QuoteForm({ onList }: { onList: () => void }) {
  const { certs, setCerts, go, rows, addRow } = useCl();
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
    const err = !FILE_EXT.includes(ext) ? "PDF, 한글, 워드, 엑셀, 이미지, ZIP 파일만 첨부할 수 있습니다." : f.size > FILE_MAX ? "20MB가 넘는 파일은 메일로 보내 주십시오." : "";
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
    addRow({
      no: (rows[0]?.no ?? 0) + 1,
      std: stdOf(certs),
      company: maskCompany(values.company),
      date: `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`,
      done: false,
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
    onList();
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
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="flex items-center gap-3 px-6 py-5" style={{ background: C.indigo, color: C.white }}>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]" style={{ background: C.cyan, color: C.indigoDeep }}>
                <Check size={22} strokeWidth={2.6} aria-hidden />
              </span>
              <div>
                <p className="text-[20px] font-bold tracking-[-0.02em]">견적문의가 접수되었습니다</p>
                <p className="text-[15px]" style={{ color: "#c8cdea" }}>
                  영업일 기준 1일 이내 담당자가 견적서를 메일로 보내 드립니다.
                </p>
              </div>
            </div>
            <dl className="px-6 py-5 text-[15px]">
              {(
                [
                  ["접수번호", done.no],
                  ["회사명", done.company],
                  ["담당자명", done.person],
                  ["연락처", done.phone],
                  ["제품", done.product],
                  ["진행규격", done.certs.length ? done.certs.join(", ") : "상담 후 결정"],
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
            <div className="flex flex-wrap gap-2 px-6 pb-6">
              <button type="button" onClick={reset} className="inline-flex h-11 items-center gap-1.5 rounded-[8px] border px-4 text-[15px] font-bold" style={{ borderColor: C.line }}>
                <RotateCcw size={16} aria-hidden />
                목록
              </button>
              <button type="button" onClick={() => go("about", "location")} className="inline-flex h-11 items-center gap-1 rounded-[8px] border px-4 text-[15px] font-bold" style={{ borderColor: C.line, color: C.indigo }}>
                시료 접수 안내
                <ChevronRight size={16} aria-hidden />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate exit={{ opacity: 0 }}>
            <p className="mb-5">영업일 기준 1일 이내 담당자가 견적서를 메일로 보내 드립니다.</p>
            {errorCount > 0 && tried && (
              <p role="alert" className="mb-5 flex items-center gap-2 rounded-[8px] px-3 py-2.5 text-[15px] font-semibold" style={{ background: C.errorSoft, color: C.error }}>
                <CircleAlert size={18} aria-hidden />
                입력 내용을 확인해 주십시오. 확인할 항목 {errorCount}개
              </p>
            )}
            <div className="grid gap-5 border-t-2 pt-6 sm:grid-cols-2" style={{ borderColor: C.indigo }}>
              <div>
                {label("q-company", "회사명")}
                <input id="q-company" value={values.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" placeholder="(주)△△전자" className={inputCls} style={border("company")} {...aria("company")} />
                {errText("company")}
              </div>
              <div>
                {label("q-person", "담당자명")}
                <input id="q-person" value={values.person} onChange={(e) => set("person", e.target.value)} autoComplete="name" className={inputCls} style={border("person")} {...aria("person")} />
                {errText("person")}
              </div>
              <div>
                {label("q-phone", "연락처")}
                <input id="q-phone" value={values.phone} onChange={(e) => set("phone", e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={`${inputCls} tabular-nums`} style={border("phone")} {...aria("phone")} />
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
                <legend className="text-[15px] font-bold">진행규격</legend>
                <div className="mt-1.5 rounded-[8px] border p-3" style={{ borderColor: C.line, background: "#fafbfd" }}>
                  {certs.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {certs.map((c) => (
                        <li key={c}>
                          <span className="inline-flex h-9 items-center gap-1 rounded-[8px] pl-3 pr-1 text-[14px] font-bold" style={{ background: C.indigo, color: C.white }}>
                            {c}
                            <button type="button" onClick={() => toggleCert(c)} aria-label={`${c} 삭제`} className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] hover:bg-white/15">
                              <X size={15} aria-hidden />
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[14px]" style={{ color: C.muted }}>
                      선택한 인증이 없습니다.{" "}
                      <button type="button" onClick={() => go("support", "finder")} className="font-semibold underline underline-offset-4" style={{ color: C.indigo }}>
                        인증 대상 조회
                      </button>
                    </p>
                  )}
                  {extra.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3" style={{ borderColor: C.line }}>
                      {extra.map((c) => (
                        <button key={c} type="button" onClick={() => toggleCert(c)} className="inline-flex h-9 items-center gap-1 rounded-[8px] border bg-white px-2.5 text-[14px] font-semibold" style={{ borderColor: C.line, color: C.ink }}>
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
                {label("q-file", "사양서 첨부", false)}
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
                      <button type="button" onClick={removeFile} aria-label="파일 삭제" className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px]" style={{ color: C.muted }}>
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
                  PDF, 한글, 워드, 엑셀, 이미지, ZIP 파일 (최대 20MB).
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
                  placeholder="출시 예정일, 판매 국가, 시료 준비 일정"
                  className="mt-1.5 w-full rounded-[8px] border bg-white px-3 py-2.5 outline-none focus:border-[#23307a]"
                  style={{ borderColor: C.line }}
                />
              </div>

              <div className="rounded-[8px] border p-4 sm:col-span-2" style={{ borderColor: C.line }}>
                <p className="text-[14px]" style={{ color: C.muted }}>
                  수집 항목: 회사명, 담당자명, 연락처, 이메일. 보관 기간: 문의 처리 후 1년.
                </p>
                <label className="mt-2 flex cursor-pointer items-start gap-2.5 text-[15px]">
                  <input id="q-agree" type="checkbox" checked={values.agree} onChange={(e) => set("agree", e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#23307a]" {...aria("agree")} />
                  <span>개인정보 수집·이용에 동의합니다.</span>
                </label>
                {errText("agree")}
              </div>
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={onList} className="h-12 rounded-[8px] border px-6 text-[16px] font-bold" style={{ borderColor: C.line }}>
                목록
              </button>
              <button type="submit" className="h-12 min-w-[180px] rounded-[8px] px-6 text-[16px] font-bold" style={{ background: C.indigo, color: C.white }}>
                문의하기
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- 새소식, 자료실, 질의응답 ---------- */

function Board({ tab }: { tab: "news" | "files" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const all = BOARD.filter((b) => b.tab === tab);
  /** 화면에 싣지 않은 예전 글 수 */
  const older = tab === "news" ? 211 : 86;
  const q = query.trim();
  const list = all.filter((b) => !q || b.title.includes(q));
  const searchId = useId();

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[15px] tabular-nums" style={{ color: C.muted }}>
          총 <strong style={{ color: C.ink }}>{q ? list.length : older + all.length}</strong>건
        </p>
        <span className="relative block sm:w-[280px]">
          <label htmlFor={searchId} className="sr-only">
            제목 검색
          </label>
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} aria-hidden />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목 검색"
            className="h-11 w-full rounded-[8px] border pl-10 pr-3 outline-none focus:border-[#23307a]"
            style={{ borderColor: C.line }}
          />
        </span>
      </div>
      <div className="mt-3 border-t-2" style={{ borderColor: C.indigo }}>
        <div className="hidden grid-cols-[64px_1fr_120px] border-b py-3 text-center text-[14px] font-bold md:grid" style={{ background: C.paper, borderColor: C.line }} aria-hidden>
          <span>번호</span>
          <span>제목</span>
          <span>등록일</span>
        </div>
        {list.length > 0 ? (
          <ul>
            {list.map((b) => {
              const on = open === b.title;
              const idx = older + all.length - all.indexOf(b);
              const panel = `cl-post-${tab}-${idx}`;
              return (
                <li key={b.title} className="border-b" style={{ borderColor: C.line }}>
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={panel}
                    onClick={() => setOpen(on ? null : b.title)}
                    className="grid w-full grid-cols-[1fr] gap-y-0.5 px-1 py-3.5 text-left md:grid-cols-[64px_1fr_120px] md:items-center md:px-0"
                  >
                    <span className="hidden text-center text-[14px] tabular-nums md:block" style={{ color: C.muted }}>
                      {idx}
                    </span>
                    <span className="flex min-w-0 items-center gap-2 font-semibold">
                      {b.file && <FileText size={17} className="shrink-0" style={{ color: C.cyanText }} aria-hidden />}
                      <span className="min-w-0">{b.title}</span>
                      <ChevronDown size={17} className="ml-auto shrink-0 transition-transform md:ml-0" style={{ transform: on ? "rotate(180deg)" : undefined, color: C.muted }} aria-hidden />
                    </span>
                    <span className="text-[13px] tabular-nums md:text-center md:text-[14px]" style={{ color: C.muted }}>
                      {b.date.replaceAll("-", ".")}
                    </span>
                  </button>
                  {on && (
                    <div id={panel} className="px-4 py-5 text-[15px] md:px-[80px]" style={{ background: C.paper }}>
                      <p>{b.body}</p>
                      {b.file && (
                        <p className="mt-3 inline-flex items-center gap-2 rounded-[8px] border bg-white px-3 py-2 text-[14px]" style={{ borderColor: C.line }}>
                          <FileText size={16} style={{ color: C.cyanText }} aria-hidden />
                          첨부 {b.title.replace(/^\[서식\]\s*/, "")} ({b.file})
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-8 text-center" style={{ background: C.paper, color: C.muted }}>
            검색 결과가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

const FAQ = [
  {
    q: "시험 기간은 얼마나 걸리나요?",
    a: "시료와 서류 접수가 완료된 날부터 산정합니다. 전자파 적합등록은 보통 2~3주, 무선 적합인증은 3~5주, 전기용품 안전인증은 공장 심사를 포함해 4~6주 정도 소요됩니다.",
  },
  {
    q: "시료는 몇 대를 보내야 하나요?",
    a: "전자파 시험은 보통 2대, 무선 시험은 일반 시료 1대와 연속 송신으로 설정한 시험용 시료 1대가 필요합니다. 품목에 따라 달라 견적과 함께 안내해 드립니다.",
  },
  {
    q: "시험에서 기준을 넘으면 어떻게 하나요?",
    a: "초과 주파수와 측정값을 바로 안내해 드리며, 페라이트 코어나 필터 등 대책 적용 후 재측정할 수 있습니다. 동일 접수 건 내 1회 재측정은 추가 비용이 없습니다.",
  },
  {
    q: "해외 인증도 이곳에서 시험하면 되나요?",
    a: "미국, 유럽처럼 국내 시험 성적서를 인정하는 국가는 이곳에서 시험해 신청합니다. 중국 CCC처럼 현지 시험이 필요한 국가는 협력 기관을 통해 진행하고 일정을 함께 관리합니다.",
  },
  {
    q: "견적은 언제 받을 수 있나요?",
    a: "제품 사양서나 사진을 보내 주시면 영업일 기준 1일 이내 견적서를 메일로 보내 드립니다.",
  },
];

function Faq() {
  const reduce = useReducedMotionSafe();
  const { openQuote } = useCl();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <div>
      <ul className="border-t-2" style={{ borderColor: C.indigo }}>
        {FAQ.map((f, i) => {
          const open = openFaq === i;
          return (
            <li key={f.q} className="border-b" style={{ borderColor: C.line }}>
              <h3>
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
              </h3>
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
      <button type="button" onClick={openQuote} className="mt-6 inline-flex h-11 items-center rounded-[8px] border px-4 text-[15px] font-bold" style={{ borderColor: C.line, color: C.indigo }}>
        견적문의
      </button>
    </div>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  const { go } = useCl();
  const links: [string, MenuId, string][] = [
    ["공평성 선언", "about", "impartiality"],
    ["고객불만 처리 절차", "about", "complaint"],
    ["인재채용", "about", "recruit"],
    ["오시는 길", "about", "location"],
  ];
  return (
    <footer className="px-4 pb-24 pt-10 md:px-6" style={{ background: C.indigoDeep, color: "#c8cdea" }}>
      <div className="mx-auto max-w-[1200px]">
        <ul className="flex flex-wrap gap-x-5 gap-y-1 border-b pb-5 text-[14px] font-semibold text-white" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
          {links.map(([label, m, s]) => (
            <li key={label}>
              <button type="button" onClick={() => go(m, s)} className="inline-flex h-9 items-center hover:underline">
                {label}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6 text-white">
          <Logo light />
        </div>
        <dl className="mt-5 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: "#a6acd6" }}>
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
