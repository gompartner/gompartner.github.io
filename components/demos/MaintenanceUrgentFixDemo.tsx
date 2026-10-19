"use client";

import { useEffect, useRef, useState } from "react";
import { JetBrains_Mono } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleDot, ImagePlus, MessageCircle, MousePointerClick, X } from "lucide-react";
import { maintenanceServices, maintenanceSteps, responseTime } from "@/data/maintenance";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 급한 오류 수정 샘플. 곰파트너가 직접 운영하는 "오류 수리 접수" 화면처럼 만든다. 장애 현황판(상태 표시, 접수 번호, 타임라인) 모양.
   꽃집, 주소, 사람은 모두 가상이다. 머리글은 곰파트너와 "유지보수 샘플"만 적는다.
   광고는 켜져 있는데 예약이 0건인 꽃집 이야기는 샘플 표지(data/scenes/part4.ts)가 맡는다. 이 화면에는 웹툰 컷을 넣지 않는다.

   금액·응답 시간·절차 문구는 data/maintenance.ts 값을 그대로 쓴다(오류 수정 건당 5만 원부터, 24시간 이내 답장, 동의 전에는 작업하지 않음).
   상호작용(브라우저 안에서만 돈다)
   1. 긴급 수리 접수: 증상 고르기, 주소, 언제부터, 화면 캡처 첨부(실제 파일 미리보기, 서버로 보내지 않음). 접수하면 오늘 접수 목록에 한 줄 생긴다.
   2. 진행 타임라인: maintenanceSteps 다섯 단계. 금액 안내에서 동의해야 다음으로 넘어간다. 단계마다 시각이 찍힌다.
   3. 전후 비교: 고치기 전 화면은 예약 버튼을 눌러도 반응이 없고, 고친 뒤 화면은 눌린다.
   4. 수리 보고서: 단계가 끝나면 원인과 고친 내용이 채워진다. */

const mono = JetBrains_Mono({ weight: ["400", "600"], subsets: ["latin"], preload: false, display: "swap" });
const monoF = { fontFamily: `${mono.style.fontFamily}, ui-monospace, monospace` } as const;

const fix = maintenanceServices.find((s) => s.id === "fix")!;
const monthly = maintenanceServices.find((s) => s.id === "monthly")!;
const SYMPTOMS = [...fix.unit!.items, "그 밖의 증상"];
const CASE_SYMPTOM = fix.unit!.items[1];
const chat = (msg: string) => `/?chat=1&msg=${encodeURIComponent(msg)}`;
const p2 = (n: number) => String(n).padStart(2, "0");
const nowHM = () => {
  const n = new Date();
  return `${p2(n.getHours())}:${p2(n.getMinutes())}`;
};

const C = {
  bg: "#f5f6f8",
  surface: "#ffffff",
  line: "#e2e5ea",
  ink: "#15181d",
  muted: "#5a626d",
  faint: "#8b929c",
  brand: "#256ef4",
  ok: "#17794a",
  okBg: "#e5f4ec",
  warn: "#8a5300",
  warnBg: "#fff1d1",
  bad: "#c22b2b",
  badBg: "#fdeaea",
  infoBg: "#e9f0fe",
};

type Tone = "ok" | "warn" | "bad" | "info" | "idle";
const TONE: Record<Tone, { fg: string; bg: string }> = {
  ok: { fg: C.ok, bg: C.okBg },
  warn: { fg: C.warn, bg: C.warnBg },
  bad: { fg: C.bad, bg: C.badBg },
  info: { fg: C.brand, bg: C.infoBg },
  idle: { fg: C.muted, bg: "#eef0f3" },
};

function Pill({ tone, children, pulse = false }: { tone: Tone; children: React.ReactNode; pulse?: boolean }) {
  const t = TONE[tone];
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-semibold leading-none" style={{ color: t.fg, background: t.bg }}>
      <span className="relative grid h-2 w-2 place-items-center">
        {pulse && <span aria-hidden className="absolute inset-0 animate-ping rounded-full opacity-60 motion-reduce:animate-none" style={{ background: t.fg }} />}
        <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: t.fg }} />
      </span>
      {children}
    </span>
  );
}

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#256ef4]";
const btnPrimary = `inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#256ef4] font-semibold text-white transition-colors hover:bg-[#0b50d0] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`;
const btnSecondary = `inline-flex items-center justify-center gap-2 rounded-[8px] border bg-white font-semibold transition-colors hover:bg-[#f0f2f5] ${focusRing}`;
const field = `w-full min-w-0 rounded-[8px] border bg-white px-3 text-[16px] font-normal outline-none transition-colors focus:border-[#256ef4] ${focusRing}`;
const card = "rounded-[12px] border bg-white";

/* ── 꽃집 휴대폰 화면 ─────────────────────────────── */

function Carnation({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <ellipse key={r} cx="0" cy="-7" rx="6" ry="8" fill="#e8435a" stroke="#b8243b" strokeWidth="1" transform={`rotate(${r})`} />
      ))}
      <circle r="4" fill="#c22a42" />
    </g>
  );
}

/** 휴대폰 속 꽃집 상품 화면. fixed가 아니면 상담 띠가 예약 버튼을 덮어 눌러도 반응이 없다. 전후를 바꿀 때는 key로 새로 그린다. */
function ShopPhone({ fixed, interactive = false, small = false }: { fixed: boolean; interactive?: boolean; small?: boolean }) {
  const reduce = useReducedMotionSafe();
  const [taps, setTaps] = useState(0);
  const [sheet, setSheet] = useState(false);
  const tap = () => {
    if (!interactive) return;
    if (fixed) setSheet(true);
    else setTaps((t) => t + 1);
  };
  return (
    <div className={`relative mx-auto overflow-hidden bg-white ${small ? "w-[170px] rounded-[22px] border-[5px]" : "w-[236px] rounded-[30px] border-[7px]"}`} style={{ borderColor: "#1d2127", boxShadow: "0 18px 40px rgba(21,24,29,.18)" }}>
      <div className="flex h-6 items-center justify-center bg-white">
        <span className="h-1.5 w-12 rounded-full bg-[#1d2127]/80" />
      </div>
      <div className="flex items-center justify-between border-b border-[#f1e3e5] px-3 pb-1.5">
        <span className={`font-bold text-[#c22a42] ${small ? "text-[10px]" : "text-[12px]"}`}>ㅇㅇ꽃집</span>
        <span className={`text-[#8b929c] ${small ? "text-[9px]" : "text-[11px]"}`}>메뉴</span>
      </div>
      <div className={small ? "px-2.5 pb-3 pt-2" : "px-3 pb-4 pt-2.5"}>
        <p className={`font-bold ${small ? "text-[11px]" : "text-[13px]"}`}>어버이날 꽃바구니</p>
        <svg viewBox="0 0 200 120" className="mt-1.5 w-full rounded-[10px] bg-[#fdeef0]" aria-hidden>
          <path d="M45 70 Q100 120 155 70 L148 100 Q100 118 52 100 Z" fill="#c9965f" stroke="#9a6a3a" strokeWidth="1.5" />
          <path d="M60 72 Q100 20 140 72" fill="none" stroke="#9a6a3a" strokeWidth="2.5" />
          <Carnation x={75} y={66} />
          <Carnation x={100} y={58} s={1.15} />
          <Carnation x={125} y={66} />
          <Carnation x={88} y={74} s={0.9} />
          <Carnation x={113} y={74} s={0.9} />
        </svg>
        <p className={`mt-2 font-bold tabular-nums ${small ? "text-[12px]" : "text-[15px]"}`}>카네이션 꽃바구니 39,000원</p>
        <p className={`text-[#5a626d] ${small ? "text-[10px]" : "text-[12px]"}`}>내일 오전 배송 마감 임박</p>
        <div className="relative mt-3">
          <button
            type="button"
            tabIndex={interactive ? 0 : -1}
            aria-hidden={!interactive}
            onClick={tap}
            className={`w-full rounded-[8px] bg-[#e8435a] font-bold text-white ${small ? "h-8 text-[12px]" : "h-11 text-[15px]"}`}
          >
            예약하기
          </button>
          {!fixed && (
            // 휴대폰 폭에서만 버튼 위로 올라온 상담 띠. 눌러도 띠가 받아 버린다.
            <div onClick={tap} className={`absolute inset-x-[-12px] bottom-[-16px] flex items-end justify-center bg-gradient-to-t from-white via-white/80 to-transparent ${small ? "h-10 pb-1" : "h-14 pb-1.5"}`} aria-hidden>
              <span className={`flex items-center gap-1 rounded-full bg-[#fee500] px-3 font-bold text-[#3c1e1e] ${small ? "py-0.5 text-[10px]" : "py-1 text-[12px]"}`}>
                <MessageCircle size={small ? 11 : 13} aria-hidden /> 카톡 상담
              </span>
            </div>
          )}
        </div>
        {fixed && (
          <span className={`absolute flex items-center justify-center rounded-full bg-[#fee500] text-[#3c1e1e] ${small ? "bottom-14 right-2 h-7 w-7" : "bottom-[70px] right-3 h-9 w-9"}`} style={{ boxShadow: "0 2px 6px rgba(0,0,0,.2)" }} aria-hidden>
            <MessageCircle size={small ? 13 : 17} />
          </span>
        )}
        <div className={small ? "h-3" : "h-5"} />
      </div>
      <AnimatePresence>
        {interactive && !fixed && taps > 0 && (
          <motion.p key={taps} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-x-0 top-[46%] mx-auto w-fit rounded-full bg-[#15181d] px-3 py-1 text-[13px] font-semibold text-white" role="status">
            눌러도 그대로 · {taps}번
          </motion.p>
        )}
        {interactive && fixed && sheet && (
          <motion.div initial={reduce ? false : { y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-x-0 bottom-0 rounded-t-[16px] border-t bg-white px-3 pb-4 pt-3 shadow-[0_-8px_20px_rgba(0,0,0,.12)]" style={{ borderColor: C.line }} role="status">
            <p className="text-[14px] font-bold">받을 날짜</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-[12px] font-bold">
              {["내일 오전", "내일 오후", "모레"].map((d, i) => (
                <span key={d} className={`rounded-[6px] border py-1.5 text-center ${i === 0 ? "border-[#e8435a] bg-[#e8435a] text-white" : "border-[#e2e5ea]"}`}>
                  {d}
                </span>
              ))}
            </div>
            <button type="button" onClick={() => setSheet(false)} className="mt-2 w-full text-[12px] font-bold text-[#5a626d] underline">
              닫기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── 페이지 ───────────────────────────────────────── */

type Shot = { id: string; name: string; url: string | null };

// 진행: 0 접수 전, 1 요청 완료, 2 금액 안내, 3 동의, 4 작업·반영, 5 기록
const STAGE_PILL: Record<number, [Tone, string]> = {
  0: ["idle", "접수 전"],
  1: ["info", "원인 확인 중"],
  2: ["warn", "동의 기다림"],
  3: ["warn", "수리 중"],
  4: ["info", "확인 기다림"],
  5: ["ok", "해결"],
};

export function MaintenanceUrgentFixDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const day = `${p2(today.getMonth() + 1)}${p2(today.getDate())}`;
  const ticketNo = `R-${day}-03`;

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  /* 접수 */
  const [symptom, setSymptom] = useState(CASE_SYMPTOM);
  const [url, setUrl] = useState("https://example.co.kr");
  const [since, setSince] = useState("오늘 아침");
  const [memo, setMemo] = useState("휴대폰에서 예약하기 버튼을 눌러도 아무 반응이 없어요. PC에서는 눌려요.");
  const [phone, setPhone] = useState("010-1234-5678");
  const [shots, setShots] = useState<Shot[]>([]);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const shotsRef = useRef<Shot[]>([]);
  useEffect(() => {
    shotsRef.current = shots;
  }, [shots]);
  useEffect(() => () => shotsRef.current.forEach((s) => s.url && URL.revokeObjectURL(s.url)), []);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = [...files]
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 3 - shots.length)
      .map((f, i) => ({ id: `${Date.now()}-${i}`, name: f.name, url: URL.createObjectURL(f) }));
    setShots((v) => [...v, ...next]);
  };
  const removeShot = (id: string) =>
    setShots((v) => {
      const s = v.find((x) => x.id === id);
      if (s?.url) URL.revokeObjectURL(s.url);
      return v.filter((x) => x.id !== id);
    });

  const [stage, setStage] = useState(0);
  const [times, setTimes] = useState<string[]>([]);
  const [view, setView] = useState<"before" | "after">("before");
  const timelineRef = useRef<HTMLElement>(null);
  const compareRef = useRef<HTMLElement>(null);
  const reportRef = useRef<HTMLElement>(null);
  const go = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const stamp = (to: number) => setTimes((t) => [...t.slice(0, to - 1), nowHM()]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^https?:\/\/\S+\.\S+/.test(url.trim())) return setErr("홈페이지 주소를 확인해 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setErr("연락처를 확인해 주세요.");
    setErr("");
    setStage(1);
    stamp(1);
    setTimeout(() => go(timelineRef.current), 50);
  };
  const advance = (to: number) => {
    setStage(to);
    stamp(to);
    if (to === 4) setView("after");
  };
  const reset = () => {
    setStage(0);
    setTimes([]);
    setView("before");
  };

  const done = stage >= 5;
  const isCase = symptom === CASE_SYMPTOM;
  const [pillTone, pillText] = STAGE_PILL[stage];

  // 오늘 접수 목록. 앞의 두 건은 다른 가게 접수(가상)
  const board: { no: string; title: string; at: string; tone: Tone; state: string; mine?: boolean }[] = [
    ...(stage > 0 ? [{ no: ticketNo, title: symptom, at: times[0] ?? "", tone: pillTone, state: pillText, mine: true }] : []),
    { no: `R-${day}-02`, title: "문의 폼을 보내도 메일이 안 옴", at: "08:47", tone: "warn", state: "수리 중" },
    { no: `R-${day}-01`, title: "사이트가 안 열림(SSL 만료)", at: "07:58", tone: "ok", state: "해결" },
  ];

  const wrap = "mx-auto w-full max-w-[1120px] px-4 md:px-8";

  return (
    <div className="min-h-screen overflow-x-clip pb-24 text-[16px] leading-[1.6]" style={{ background: C.bg, color: C.ink }}>
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur-sm" style={{ borderColor: C.line }}>
        <div className={`${wrap} flex h-16 items-center justify-between gap-3`}>
          <a href="#top" className={`inline-flex min-w-0 items-center gap-2 rounded-[4px] ${focusRing}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
            <img src="/images/logo-bear.png" alt="" aria-hidden width={30} height={30} className="h-[30px] w-[30px] shrink-0" />
            <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-[20px] font-extrabold tracking-[-0.03em]">곰파트너</span>
              <span className="text-[13px] font-semibold" style={{ color: C.muted }}>
                유지보수 샘플
              </span>
            </span>
          </a>
          <nav aria-label="이 페이지 차례" className="hidden items-center gap-6 text-[15px] font-semibold md:flex" style={{ color: C.muted }}>
            {[
              ["접수", "uf-intake"],
              ["진행 상황", "uf-timeline"],
              ["전후 화면", "uf-compare"],
              ["보고서", "uf-report"],
            ].map(([t, id]) => (
              <a key={id} href={`#${id}`} className={`rounded-[4px] hover:text-[#15181d] ${focusRing}`}>
                {t}
              </a>
            ))}
          </nav>
          <a href="#uf-intake" className={`${btnPrimary} h-10 shrink-0 px-4 text-[15px]`}>
            수리 접수
          </a>
        </div>
      </header>

      <main id="top">
        {/* 첫 화면: 안내와 오늘 접수 현황 */}
        <section aria-labelledby="uf-title" className="border-b bg-white" style={{ borderColor: C.line }}>
          <div className={`${wrap} grid gap-10 py-10 md:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-14`}>
            <div className="min-w-0">
              <Pill tone="ok" pulse>
                지금 접수 받는 중
              </Pill>
              <h1 id="uf-title" className="mt-5 text-[34px] font-extrabold leading-[1.2] tracking-[-0.03em] md:text-[46px]">
                홈페이지 오류
                <br />
                수리 접수
              </h1>
              <p className="mt-4 max-w-[34em] text-[17px] leading-[1.7]" style={{ color: C.muted }}>
                버튼이 안 눌리거나 사이트가 안 열리면 여기로 접수해 주세요. 원인을 보고 금액부터 알려 드려요.
              </p>
              <dl className="mt-7 grid max-w-[560px] gap-px overflow-hidden rounded-[12px] border sm:grid-cols-3" style={{ borderColor: C.line, background: C.line }}>
                {[
                  [fix.title, fix.price],
                  ["첫 답장", "24시간 이내"],
                  ["작업 시작", "금액 동의 뒤"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white px-4 py-3">
                    <dt className="text-[13px]" style={{ color: C.muted }}>
                      {k}
                    </dt>
                    <dd className="text-[16px] font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className={`${card} min-w-0 self-start overflow-hidden`} style={{ borderColor: C.line }}>
              <div className="flex items-center justify-between gap-2 border-b px-4 py-3" style={{ borderColor: C.line }}>
                <h2 className="text-[15px] font-bold">오늘 접수</h2>
                <span className="text-[13px] tabular-nums" style={{ ...monoF, color: C.faint }}>
                  {today.getFullYear()}.{p2(today.getMonth() + 1)}.{p2(today.getDate())}
                </span>
              </div>
              <ul>
                <AnimatePresence initial={false}>
                  {board.map((t) => (
                    <motion.li key={t.no} layout={!reduce} initial={reduce ? false : { opacity: 0, backgroundColor: "#e9f0fe" }} animate={{ opacity: 1, backgroundColor: t.mine ? "#f6f9ff" : "#ffffff" }} transition={{ duration: 0.6 }} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 border-b px-4 py-3 last:border-b-0" style={{ borderColor: C.line }}>
                      <span className="min-w-0">
                        <span className="block text-[13px]" style={{ ...monoF, color: C.muted }}>
                          {t.no}
                          {t.mine && <span className="ml-1.5 font-sans font-semibold text-[#256ef4]">내 접수</span>}
                        </span>
                        <span className="block truncate text-[15px] font-semibold">{t.title}</span>
                      </span>
                      <span className="flex flex-col items-end gap-1">
                        <Pill tone={t.tone}>{t.state}</Pill>
                        <span className="text-[12px] tabular-nums" style={{ ...monoF, color: C.faint }}>
                          {t.at}
                        </span>
                      </span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          </div>
        </section>

        {/* 긴급 수리 접수 */}
        <section id="uf-intake" aria-labelledby="uf-intake-title" className="scroll-mt-20 py-12 md:py-16">
          <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10`}>
            <form onSubmit={submit} noValidate className={`${card} min-w-0 p-5 sm:p-7`} style={{ borderColor: C.line }}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 id="uf-intake-title" className="text-[24px] font-extrabold tracking-[-0.02em] md:text-[28px]">
                  긴급 수리 접수
                </h2>
                {stage > 0 && (
                  <span className="text-[14px] font-semibold" style={{ ...monoF, color: C.brand }}>
                    {ticketNo}
                  </span>
                )}
              </div>
              <fieldset className="mt-5">
                <legend className="text-[14px] font-semibold">어떤 증상인가요</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {SYMPTOMS.map((s) => {
                    const on = symptom === s;
                    return (
                      <label key={s} className="min-w-0 cursor-pointer">
                        <input type="radio" name="uf-symptom" checked={on} onChange={() => setSymptom(s)} className="peer sr-only" />
                        <span className="flex min-h-12 items-center gap-2.5 rounded-[8px] border px-3 py-2.5 text-[15px] font-medium leading-[1.4] transition-colors peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#256ef4]" style={on ? { borderColor: C.brand, background: C.infoBg, boxShadow: `inset 0 0 0 1px ${C.brand}` } : { borderColor: C.line }}>
                          <span aria-hidden className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2" style={{ borderColor: on ? C.brand : "#c3c8cf" }}>
                            {on && <span className="h-2.5 w-2.5 rounded-full bg-[#256ef4]" />}
                          </span>
                          {s}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="grid min-w-0 gap-1.5 text-[14px] font-semibold">
                  홈페이지 주소
                  <input value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" className={`${field} h-12`} style={{ borderColor: C.line }} />
                </label>
                <label className="grid min-w-0 gap-1.5 text-[14px] font-semibold">
                  연락처
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" maxLength={13} className={`${field} h-12`} style={{ borderColor: C.line }} />
                </label>
              </div>
              <fieldset className="mt-5">
                <legend className="text-[14px] font-semibold">언제부터</legend>
                <div className="mt-2 grid grid-cols-3 gap-1 rounded-[10px] p-1" style={{ background: "#eef0f3" }}>
                  {["오늘 아침", "어제부터", "며칠 됐어요"].map((v) => (
                    <button key={v} type="button" onClick={() => setSince(v)} aria-pressed={since === v} className={`h-10 min-w-0 rounded-[7px] px-1 text-[14px] font-semibold transition-colors ${focusRing}`} style={since === v ? { background: "#fff", boxShadow: "0 1px 3px rgba(21,24,29,.15)" } : { color: C.muted }}>
                      {v}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="mt-5 grid min-w-0 gap-1.5 text-[14px] font-semibold">
                어떻게 안 되나요
                <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} className={`${field} py-2.5 leading-[1.55]`} style={{ borderColor: C.line }} />
              </label>
              <div className="mt-5">
                <p className="text-[14px] font-semibold">
                  화면 캡처 <span style={{ ...monoF, color: C.muted }}>{shots.length}/3</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {shots.map((s) => (
                    <figure key={s.id} className="relative h-24 w-[72px] overflow-hidden rounded-[8px] border bg-[#eef0f3]" style={{ borderColor: C.line }}>
                      {s.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.url} alt={s.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full scale-[0.42] items-center justify-center">
                          <div className="shrink-0">
                            <ShopPhone fixed={false} small />
                          </div>
                        </div>
                      )}
                      <button type="button" onClick={() => removeShot(s.id)} aria-label={`${s.name} 빼기`} className={`absolute right-0.5 top-0.5 grid h-6 w-6 place-items-center rounded-full bg-[#15181d]/80 text-white ${focusRing}`}>
                        <X size={13} aria-hidden />
                      </button>
                    </figure>
                  ))}
                  {shots.length < 3 && (
                    <>
                      <button type="button" onClick={() => fileRef.current?.click()} className={`flex h-24 w-[92px] flex-col items-center justify-center gap-1 rounded-[8px] border border-dashed bg-white text-[13px] font-semibold transition-colors hover:bg-[#f0f2f5] ${focusRing}`} style={{ borderColor: "#b9bfc8" }}>
                        <ImagePlus size={22} aria-hidden />
                        캡처 올리기
                      </button>
                      <button type="button" onClick={() => setShots((v) => [...v, { id: `ex-${Date.now()}`, name: "예시 캡처.png", url: null }])} className={`flex h-24 w-[92px] flex-col items-center justify-center gap-1 rounded-[8px] border text-[13px] font-semibold transition-colors hover:bg-[#e3e7ec] ${focusRing}`} style={{ borderColor: C.line, background: "#eef0f3" }}>
                        <MousePointerClick size={22} aria-hidden />
                        예시 캡처
                      </button>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    tabIndex={-1}
                    aria-label="화면 캡처 파일"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>
              </div>
              {err && (
                <p role="alert" className="mt-4 text-[14px] font-semibold" style={{ color: C.bad }}>
                  {err}
                </p>
              )}
              <button type="submit" disabled={stage > 0} className={`${btnPrimary} mt-6 h-13 w-full py-3.5 text-[17px]`}>
                {stage > 0 ? `접수됨 · ${ticketNo}` : "수리 접수"}
              </button>
              <p className="mt-2.5 text-[14px]" style={{ color: C.muted }}>
                {responseTime}
              </p>
            </form>

            <aside className="grid content-start gap-4" aria-label="접수 전에 볼 것">
              <div className={`${card} p-5`} style={{ borderColor: C.line }}>
                <h3 className="text-[16px] font-bold">이런 경우가 오류예요</h3>
                <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
                  원래 되던 것이 안 되는 경우
                </p>
                <ul className="mt-3 grid gap-2 text-[15px]">
                  {fix.unit!.items.map((t) => (
                    <li key={t} className="flex gap-2">
                      <Check size={16} aria-hidden className="mt-1 shrink-0" style={{ color: C.ok }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${card} p-5`} style={{ borderColor: C.line }}>
                <h3 className="text-[16px] font-bold">맡지 않는 일</h3>
                <ul className="mt-3 grid gap-2 text-[15px]" style={{ color: C.muted }}>
                  {fix.excludes.map((t) => (
                    <li key={t} className="flex gap-2">
                      <X size={16} aria-hidden className="mt-1 shrink-0" style={{ color: C.faint }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>

        {/* 진행 상황 */}
        <section id="uf-timeline" ref={timelineRef} aria-labelledby="uf-timeline-title" className="scroll-mt-20 pb-12 md:pb-16">
          <div className={wrap}>
            <div className={`${card} p-5 sm:p-7`} style={{ borderColor: C.line }}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: C.line }}>
                <div className="min-w-0">
                  <h2 id="uf-timeline-title" className="text-[24px] font-extrabold tracking-[-0.02em] md:text-[28px]">
                    진행 상황
                  </h2>
                  <p className="text-[14px]" style={{ ...monoF, color: C.muted }}>
                    {stage > 0 ? `${ticketNo} · ${url.replace(/^https?:\/\//, "")}` : "접수하면 여기에 단계가 쌓여요"}
                  </p>
                </div>
                <Pill tone={pillTone} pulse={stage > 0 && !done}>
                  {pillText}
                </Pill>
              </div>
              <ol className="mt-5 grid">
                {maintenanceSteps.map((s, i) => {
                  // 4단계(작업·반영)는 고친 화면을 보내고(stage 3) 확인받을 때까지(stage 4) 이어진다
                  const at = stage === 4 ? 3 : stage;
                  const state = i < at ? "done" : i === at ? "now" : "next";
                  const isNow = stage > 0 && state === "now";
                  const time = state === "done" || isNow ? times[Math.min(i, times.length - 1)] : undefined;
                  return (
                    <li key={s.title} className="relative grid grid-cols-[28px_1fr] gap-x-3 pb-6 last:pb-0 sm:grid-cols-[56px_28px_1fr]">
                      <span className="hidden pt-1 text-right text-[13px] tabular-nums sm:block" style={{ ...monoF, color: C.faint }}>
                        {stage > 0 && time ? time : ""}
                      </span>
                      <span className="relative flex justify-center">
                        {i < maintenanceSteps.length - 1 && <span aria-hidden className="absolute bottom-[-24px] top-7 w-[2px]" style={{ background: state === "done" ? C.ok : C.line }} />}
                        <span
                          className="relative z-10 grid h-7 w-7 place-items-center rounded-full border-2 text-[13px] font-bold"
                          style={state === "done" ? { background: C.ok, borderColor: C.ok, color: "#fff" } : isNow ? { background: "#fff", borderColor: C.brand, color: C.brand } : { background: "#fff", borderColor: "#d3d8de", color: C.faint }}
                        >
                          {state === "done" ? <Check size={15} strokeWidth={3} aria-hidden /> : isNow ? <CircleDot size={15} aria-hidden /> : i + 1}
                        </span>
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-[17px] font-bold" style={state === "next" && !isNow ? { color: C.faint } : undefined}>
                          {s.title}
                          <span className="sr-only">{state === "done" ? " 완료" : isNow ? " 진행 중" : ""}</span>
                          {stage > 0 && time && (
                            <span className="ml-2 text-[13px] font-normal tabular-nums sm:hidden" style={{ ...monoF, color: C.faint }}>
                              {time}
                            </span>
                          )}
                        </p>
                        <p className="text-[15px] leading-[1.6]" style={{ color: C.muted }}>
                          {s.body}
                        </p>
                        {isNow && <StageAction stage={stage} isCase={isCase} onNext={advance} onCompare={() => go(compareRef.current)} reduce={reduce} />}
                      </div>
                    </li>
                  );
                })}
              </ol>
              {stage === 0 && (
                <a href="#uf-intake" className={`${btnSecondary} mt-5 h-11 px-4 text-[15px]`} style={{ borderColor: C.line }}>
                  접수부터 하기
                </a>
              )}
              {done && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => go(reportRef.current)} className={`${btnPrimary} h-11 px-4 text-[15px]`}>
                    보고서 보기
                  </button>
                  <button type="button" onClick={reset} className={`${btnSecondary} h-11 px-4 text-[15px]`} style={{ borderColor: C.line }}>
                    처음부터
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 고치기 전과 뒤 */}
        <section id="uf-compare" ref={compareRef} aria-labelledby="uf-compare-title" className="scroll-mt-20 border-y bg-white py-12 md:py-16" style={{ borderColor: C.line }}>
          <div className={`${wrap} grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-12`}>
            <div className="min-w-0 md:order-2">
              <h2 id="uf-compare-title" className="text-[24px] font-extrabold tracking-[-0.02em] md:text-[28px]">
                고치기 전과 뒤
              </h2>
              <div className="mt-4 inline-grid grid-cols-2 gap-1 rounded-[10px] p-1" style={{ background: "#eef0f3" }} role="group" aria-label="화면 고르기">
                {(
                  [
                    ["before", "고치기 전", "bad"],
                    ["after", "고친 뒤", "ok"],
                  ] as const
                ).map(([v, t, tone]) => (
                  <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-[7px] px-4 text-[15px] font-semibold transition-colors ${focusRing}`} style={view === v ? { background: "#fff", boxShadow: "0 1px 3px rgba(21,24,29,.15)", color: TONE[tone].fg } : { color: C.muted }}>
                    <span aria-hidden className="h-2 w-2 rounded-full" style={{ background: TONE[tone].fg, opacity: view === v ? 1 : 0.4 }} />
                    {t}
                  </button>
                ))}
              </div>
              <div className="mt-5 text-[16px] leading-[1.7]">
                {view === "before" ? (
                  <>
                    <p className="font-bold">휴대폰 폭에서 상담 띠가 버튼 위로 올라와 있어요.</p>
                    <p className="mt-1" style={{ color: C.muted }}>
                      손가락은 띠를 누르고, 예약하기까지 닿지 않아요. PC는 화면이 넓어 겹치지 않았어요.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-bold">상담 띠를 오른쪽 동그란 버튼으로 줄였어요.</p>
                    <p className="mt-1" style={{ color: C.muted }}>
                      예약하기를 누르면 받을 날짜가 올라와요. 아이폰, 갤럭시, PC에서 다시 눌러 봤어요.
                    </p>
                  </>
                )}
                <p className="mt-3 text-[14px] font-semibold" style={{ color: C.brand }}>
                  왼쪽 화면에서 예약하기를 눌러 보세요.
                </p>
              </div>
            </div>
            <div className="rounded-[16px] py-8 md:order-1" style={{ background: view === "before" ? "#fbf1f1" : "#eef7f2" }}>
              <ShopPhone key={view} fixed={view === "after"} interactive />
            </div>
          </div>
        </section>

        {/* 수리 보고서 */}
        <section id="uf-report" ref={reportRef} aria-labelledby="uf-report-title" className="scroll-mt-20 py-12 md:py-16">
          <div className={wrap}>
            <article className={`${card} mx-auto max-w-[820px] p-5 sm:p-8`} style={{ borderColor: C.line }}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4" style={{ borderColor: C.ink }}>
                <div>
                  <h2 id="uf-report-title" className="text-[24px] font-extrabold tracking-[-0.02em] md:text-[26px]">
                    수리 보고서
                  </h2>
                  <p className="text-[14px]" style={{ ...monoF, color: C.muted }}>
                    {ticketNo} · {today.getFullYear()}.{p2(today.getMonth() + 1)}.{p2(today.getDate())}
                  </p>
                </div>
                <Pill tone={done ? "ok" : "idle"}>{done ? "확인 완료" : "작성 중"}</Pill>
              </div>
              <dl className="mt-1 grid gap-x-6 text-[15px] sm:grid-cols-[120px_1fr]">
                {(
                  [
                    ["주소", url],
                    ["증상", `${symptom}. ${since}.`],
                    ["원인", stage >= 2 ? (isCase ? "휴대폰 폭에서 카톡 상담 띠가 예약하기 버튼을 덮고 있었습니다. 띠의 투명한 윗부분이 손가락 터치를 먼저 받았습니다." : "원인을 확인해 적습니다.") : "확인 중"],
                    ["고친 내용", stage >= 4 ? (isCase ? "상담 띠를 화면 오른쪽 동그란 버튼으로 바꾸고, 예약하기 버튼 아래에 여백을 두었습니다." : "고친 내용을 적습니다.") : "확인 중"],
                    ["확인한 화면", stage >= 4 ? "아이폰 사파리, 갤럭시 삼성 인터넷, PC 크롬" : "확인 중"],
                    ["금액", stage >= 3 ? `${fix.title} 1건 5만 원(동의함)` : stage >= 2 ? `${fix.title} 1건 5만 원(동의 전)` : fix.price],
                    ["다음에 볼 것", stage >= 4 ? "상담 버튼 설정을 바꾸면 다시 겹칠 수 있습니다. 바꾸실 때 알려 주세요." : "확인 중"],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="pt-3 text-[14px] font-semibold sm:border-b sm:pb-3" style={{ color: C.muted, borderColor: C.line }}>
                      {k}
                    </dt>
                    <dd className={`border-b pb-3 leading-[1.6] sm:pt-3 ${k === "주소" ? "break-all" : ""}`} style={{ borderColor: C.line, color: v === "확인 중" ? C.faint : undefined, ...(k === "주소" ? monoF : {}) }}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>
        </section>

        {/* 요금 */}
        <section aria-labelledby="uf-price-title" className="border-t bg-white py-12 md:py-16" style={{ borderColor: C.line }}>
          <div className={wrap}>
            <h2 id="uf-price-title" className="text-[24px] font-extrabold tracking-[-0.02em] md:text-[28px]">
              요금
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[fix, monthly].map((s) => (
                <div key={s.id} className={`${card} p-5 sm:p-6`} style={{ borderColor: C.line }}>
                  <p className="text-[15px] font-semibold" style={{ color: C.muted }}>
                    {s.title}
                  </p>
                  <p className="mt-1 text-[22px] font-extrabold tracking-[-0.02em]">{s.price}</p>
                  <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
                    {s.term}
                  </p>
                  <ul className="mt-3 grid gap-1.5 border-t pt-3 text-[15px]" style={{ borderColor: C.line }}>
                    {s.notes.map((n) => (
                      <li key={n} className="flex gap-2">
                        <Check size={16} aria-hidden className="mt-1 shrink-0" style={{ color: C.ok }} />
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href="#uf-intake" className={`${btnPrimary} h-12 px-5 text-[16px]`}>
                수리 접수
              </a>
              <a href={chat("급한 오류 수정 샘플을 보고 문의합니다.")} className={`${btnSecondary} h-12 px-5 text-[16px]`} style={{ borderColor: C.line }}>
                채팅 상담
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10 text-[14px] leading-[1.8]" style={{ borderColor: C.line, color: C.muted }}>
        <div className={`${wrap} grid gap-2 md:grid-cols-[1fr_auto] md:items-end`}>
          <div>
            <p className="text-[17px] font-extrabold" style={{ color: C.ink }}>
              곰파트너
            </p>
            <p>홈페이지 제작 · 유지보수</p>
          </div>
          <DemoMakerInfo />
        </div>
      </footer>
    </div>
  );
}

/** 지금 단계에서 곰파트너 담당이 남긴 말과 누를 버튼 */
function StageAction({ stage, isCase, onNext, onCompare, reduce }: { stage: number; isCase: boolean; onNext: (to: number) => void; onCompare: () => void; reduce: boolean }) {
  const lines: Record<number, string> = {
    1: "주소랑 캡처 받았어요. 원인부터 볼게요.",
    2: isCase ? "휴대폰에서 카톡 상담 띠가 예약 버튼을 덮고 있어요. 오류 수정 1건, 5만 원. 작업은 하루면 됩니다." : "원인을 찾았어요. 오류 수정 1건, 5만 원. 작업은 하루면 됩니다.",
    3: "동의 받았어요. 고치는 중이에요.",
    4: "고쳤어요. 휴대폰에서 예약하기를 눌러 봐 주세요.",
  };
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="mt-3 grid gap-3">
      <div className="rounded-[10px] border p-3.5" style={{ borderColor: "#cfdcfb", background: "#f6f9ff" }}>
        <p className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: C.muted }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-bear.png" alt="" aria-hidden width={20} height={20} className="h-5 w-5" />
          곰파트너 담당
        </p>
        <p className="mt-1.5 text-[15px] font-medium leading-[1.6]">{lines[stage]}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {stage === 1 && (
          <button type="button" onClick={() => onNext(2)} className={`${btnSecondary} h-11 px-4 text-[15px]`} style={{ borderColor: C.line }}>
            원인 확인 결과 받기
          </button>
        )}
        {stage === 2 && (
          <>
            <button type="button" onClick={() => onNext(3)} className={`${btnPrimary} h-11 px-4 text-[15px]`}>
              5만 원에 동의
            </button>
            <a href={chat("오류 수정 금액이 궁금합니다.")} className={`${btnSecondary} h-11 px-4 text-[15px]`} style={{ borderColor: C.line }}>
              더 물어보기
            </a>
          </>
        )}
        {stage === 3 && (
          <button type="button" onClick={() => onNext(4)} className={`${btnSecondary} h-11 px-4 text-[15px]`} style={{ borderColor: C.line }}>
            고친 화면 받기
          </button>
        )}
        {stage === 4 && (
          <>
            <button type="button" onClick={onCompare} className={`${btnSecondary} h-11 px-4 text-[15px]`} style={{ borderColor: C.line }}>
              고친 화면 눌러 보기
            </button>
            <button type="button" onClick={() => onNext(5)} className={`${btnPrimary} h-11 px-4 text-[15px]`}>
              확인했어요
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
