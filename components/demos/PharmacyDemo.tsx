"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  AArrowUp,
  CalendarDays,
  Camera,
  Car,
  Check,
  MessageSquare,
  Menu,
  Pill,
  Printer,
  RotateCcw,
  Search,
  TrainFront,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 약국 홈페이지 데모: 가상의 ○○ 약국.
   상호, 약사 이름, 주소, 전화번호, 사업자 정보, 재고는 모두 가상이다. 약 이름은 상표 대신 성분과 용도로 적는다.

   디자인: 흰 바탕에 약국 초록(#0b7a5f), 옅은 민트(#e3f2ec), 주의 주황(#b45309).
   어르신도 보기 쉽게 머리글에 글자 크게 버튼을 두고, 누르면 화면 전체가 커진다.

   처방전 미리 보내기는 사진을 고르고 찾으러 올 시간을 정하면 번호표가 나오고,
   앞 순서가 하나씩 줄다가 조제가 끝나면 받게 될 문자를 보여 준다.
   복약 시간표는 하루 몇 번, 언제, 며칠을 고르면 요일별 약통이 만들어지고, 칸을 누르면 뚜껑이 열리며 먹은 것으로 표시된다.
   상비약은 이름 검색과 증상 분류로 찾고, 휴일 당번은 이번 달 달력에 표시한다.

   사진 출처(public/images/demo-pharmacy):
   AI 생성(Z-Image-Turbo, Apache 2.0) hero */

const IMG = "/images/demo-pharmacy";
const PHARMACY = "○○ 약국";
const TEL = "02-000-0000";
const ADDRESS = "□□시 □□로 140 1층";

const C = {
  bg: "#f4f8f6",
  white: "#ffffff",
  mint: "#0b7a5f",
  mintDeep: "#075a46",
  mintSoft: "#e3f2ec",
  ink: "#15211d",
  muted: "#52615b",
  line: "#dbe5e1",
  warn: "#b45309",
  warnSoft: "#fdf0df",
};

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV = [
  { id: "rx", label: "처방전 미리 보내기" },
  { id: "pillbox", label: "복약 시간표" },
  { id: "stock", label: "상비약 찾기" },
  { id: "hours", label: "영업시간·당번" },
];

/* ---------- 시간 ---------- */

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const subscribeMinute = (cb: () => void) => {
  const id = window.setInterval(cb, 30_000);
  return () => window.clearInterval(id);
};

/** 분 단위 현재 시각. 서버 렌더에서는 -1을 돌려 시간에 따른 화면 차이를 막는다. */
function useNowMinute() {
  return useSyncExternalStore(subscribeMinute, () => Math.floor(Date.now() / 60_000), () => -1);
}

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

// 날짜가 고정된 공휴일만 둔다(음력 공휴일은 해마다 바뀌어 데모에서는 뺀다)
const HOLIDAYS: Record<string, string> = {
  "1-1": "신정",
  "3-1": "삼일절",
  "5-5": "어린이날",
  "6-6": "현충일",
  "8-15": "광복절",
  "10-3": "개천절",
  "10-9": "한글날",
  "12-25": "성탄절",
};

type DayPlan = { open: boolean; from: number; to: number; note?: string; duty?: boolean };

/** 둘째, 넷째 일요일은 휴일 당번으로 문을 연다. */
function planFor(d: Date): DayPlan {
  const holiday = HOLIDAYS[`${d.getMonth() + 1}-${d.getDate()}`];
  const day = d.getDay();
  if (day === 0) {
    const nth = Math.ceil(d.getDate() / 7);
    if (nth === 2 || nth === 4) return { open: true, from: 600, to: 1080, note: "휴일 당번", duty: true };
    return { open: false, from: 0, to: 0, note: holiday };
  }
  if (holiday) return { open: false, from: 0, to: 0, note: holiday };
  if (day === 6) return { open: true, from: 540, to: 1080 };
  return { open: true, from: 540, to: 1260 };
}

function statusAt(minute: number) {
  if (minute < 0) return null;
  const now = new Date(minute * 60_000);
  const m = now.getHours() * 60 + now.getMinutes();
  const today = planFor(now);
  if (today.open && m >= today.from && m < today.to) {
    return { open: true, title: "지금 문 열었어요", sub: `오늘 ${hhmm(today.to)}까지${today.duty ? ", 휴일 당번" : ""}`, day: "오늘", from: m, to: today.to };
  }
  if (today.open && m < today.from)
    return { open: false, title: "아직 문 열기 전이에요", sub: `오늘 ${hhmm(today.from)}에 엽니다`, day: "오늘", from: today.from, to: today.to };
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const p = planFor(d);
    if (p.open) {
      const when = i === 1 ? "내일" : `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_NAMES[d.getDay()]})`;
      const why = !today.open && today.note ? `오늘은 ${today.note}이라 쉽니다. ` : "";
      return { open: false, title: "지금은 문을 닫았어요", sub: `${why}${when} ${hhmm(p.from)}에 엽니다`, day: when, from: p.from, to: p.to };
    }
  }
  return null;
}

function nextDuty(minute: number) {
  if (minute < 0) return null;
  const now = new Date(minute * 60_000);
  for (let i = 0; i < 35; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    if (planFor(d).duty) return `${d.getMonth() + 1}월 ${d.getDate()}일 일요일`;
  }
  return null;
}

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘 → 김ㅎ늘 */
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

/* ---------- 페이지 ---------- */

export function PharmacyDemo() {
  const minute = useNowMinute();
  const [big, setBig] = useState(false);

  return (
    <div className="min-h-screen text-[17px] leading-[1.7]" style={{ background: C.white, color: C.ink }}>
      <Header big={big} onBig={() => setBig((v) => !v)} />
      <main style={{ zoom: big ? 1.18 : 1 }}>
        <Hero minute={minute} />
        <Prescription minute={minute} />
        <Pillbox minute={minute} />
        <Stock />
        <Hours minute={minute} />
        <Location />
      </main>
      <Footer />
    </div>
  );
}

/* ---------- 로고, 머리글 ---------- */

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
        <rect width="30" height="30" rx="8" fill={light ? "#fff" : C.mint} />
        <path d="M12 7 H18 V12 H23 V18 H18 V23 H12 V18 H7 V12 H12Z" fill={light ? C.mint : "#fff"} />
      </svg>
      <span className="text-[19px] font-bold tracking-[-0.02em]">{PHARMACY}</span>
    </span>
  );
}

function Header({ big, onBig }: { big: boolean; onBig: () => void }) {
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
        <a href="#top" aria-label={`${PHARMACY} 처음으로`}>
          <Logo />
        </a>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-[15px]">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="transition-colors hover:text-[#0b7a5f]" style={{ color: C.muted }}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBig}
            aria-pressed={big}
            className="inline-flex h-11 items-center gap-1.5 rounded-full border px-3.5 text-[15px] font-semibold"
            style={big ? { background: C.mint, color: "#fff", borderColor: C.mint } : { borderColor: C.line, color: C.ink }}
          >
            <AArrowUp size={19} aria-hidden />
            글자 크게
          </button>
          <a href={`tel:${TEL}`} className="hidden h-11 items-center rounded-full px-5 text-[15px] font-semibold md:inline-flex" style={{ background: C.mint, color: "#fff" }}>
            {TEL}
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            aria-controls="pharmacy-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="pharmacy-menu"
            aria-label="주 메뉴"
            className="overflow-hidden border-t lg:hidden"
            style={{ borderColor: C.line }}
            initial={reduce ? false : { height: 0 }}
            animate={{ height: "auto" }}
            exit={reduce ? { opacity: 0 } : { height: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
          >
            <ul className="px-4 py-2">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} onClick={() => setOpen(false)} className="flex h-12 items-center text-[17px]">
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={`tel:${TEL}`} className="flex h-12 items-center text-[17px] font-semibold" style={{ color: C.mint }}>
                  전화 {TEL}
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

function Hero({ minute }: { minute: number }) {
  const status = statusAt(minute);
  const duty = nextDuty(minute);
  const quick = [
    { id: "rx", icon: Camera, label: "처방전 미리 보내기" },
    { id: "pillbox", icon: Pill, label: "복약 시간표 만들기" },
    { id: "stock", icon: Search, label: "상비약 있는지 보기" },
    { id: "hours", icon: CalendarDays, label: "휴일 당번 날짜" },
  ];

  return (
    <section id="top" className="px-4 pb-14 pt-8 md:px-6 md:pb-20 md:pt-12" style={{ background: C.bg }}>
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 md:grid-cols-[1fr_1.1fr] md:gap-12">
        <div>
          <p className="text-[15px] font-semibold" style={{ color: C.mint }}>
            □□동 동네 약국
          </p>
          <h1 className="mt-2 text-[38px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[54px]">{PHARMACY}</h1>

          <div className="mt-6 rounded-[12px] border bg-white p-5" style={{ borderColor: C.line }} aria-live="polite">
            {status ? (
              <>
                <p className="flex items-center gap-2.5 text-[24px] font-bold tracking-[-0.02em] md:text-[28px]">
                  <span className="relative inline-flex h-3.5 w-3.5">
                    {status.open && <span className="absolute inset-0 animate-ping rounded-full motion-reduce:hidden" style={{ background: C.mint, opacity: 0.4 }} />}
                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full" style={{ background: status.open ? C.mint : "#9aa6a1" }} />
                  </span>
                  {status.title}
                </p>
                <p className="mt-1 text-[17px]" style={{ color: C.muted }}>
                  {status.sub}
                </p>
              </>
            ) : (
              <p className="h-[76px]" />
            )}
            {duty && (
              <p className="mt-4 rounded-[8px] px-3 py-2 text-[15px] font-semibold" style={{ background: C.mintSoft, color: C.mintDeep }}>
                다음 휴일 당번: {duty} 10:00 ~ 18:00
              </p>
            )}
          </div>

          <ul className="mt-5 grid grid-cols-2 gap-2.5">
            {quick.map((q) => (
              <li key={q.id}>
                <a
                  href={`#${q.id}`}
                  className="flex h-full min-h-[64px] items-center gap-2.5 rounded-[10px] border bg-white px-3.5 py-3 text-[15px] font-semibold leading-[1.35] transition-colors hover:border-[#0b7a5f]"
                  style={{ borderColor: C.line }}
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: C.mintSoft, color: C.mint }}>
                    <q.icon size={19} aria-hidden />
                  </span>
                  {q.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] md:aspect-[5/4]">
          <Image src={`${IMG}/hero.jpg`} alt="흰 선반에 약상자가 정리된 밝은 약국 안과 나무 상담대" fill priority sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" style={{ objectPosition: "35% center" }} />
        </div>
      </div>
    </section>
  );
}

function SectionHead({ id, tag, title, desc }: { id: string; tag: string; title: string; desc?: string }) {
  return (
    <div>
      <p className="text-[15px] font-bold" style={{ color: C.mint }}>
        {tag}
      </p>
      <h2 id={id} className="mt-1.5 text-[28px] font-bold leading-[1.35] tracking-[-0.03em] md:text-[36px]">
        {title}
      </h2>
      {desc && (
        <p className="mt-3 max-w-[660px]" style={{ color: C.muted }}>
          {desc}
        </p>
      )}
    </div>
  );
}

/* ---------- 처방전 미리 보내기 ---------- */

type Status = NonNullable<ReturnType<typeof statusAt>>;

/** 찾으러 올 시간 보기. 문을 닫았으면 다음에 여는 시간을 기준으로 잡는다. */
function pickupOptions(status: Status | null) {
  if (!status) return [15, 30, 60].map((id) => ({ id, label: `${id === 60 ? "1시간" : `${id}분`} 뒤`, at: "" }));
  const last = status.to - 30;
  if (status.open) {
    return [
      ...[15, 30, 60].map((id) => ({ id, label: `${id === 60 ? "1시간" : `${id}분`} 뒤`, at: hhmm(Math.min(last, status.from + id)) })),
      { id: -1, label: `문 닫기 전 ${hhmm(last)}`, at: hhmm(last) },
    ];
  }
  return [
    { id: 0, label: "문 열 때", at: `${status.day} ${hhmm(status.from)}` },
    { id: 60, label: "연 뒤 1시간", at: `${status.day} ${hhmm(status.from + 60)}` },
    { id: 120, label: "연 뒤 2시간", at: `${status.day} ${hhmm(status.from + 120)}` },
    { id: -1, label: `문 닫기 전 ${hhmm(last)}`, at: `${status.day} ${hhmm(last)}` },
  ];
}

function SamplePaper() {
  return (
    <svg viewBox="0 0 120 160" className="h-full w-full" aria-hidden>
      <rect x="4" y="4" width="112" height="152" rx="4" fill="#fff" stroke={C.line} />
      <rect x="40" y="14" width="40" height="6" rx="3" fill="#c9d4cf" />
      {[34, 44, 54].map((y) => (
        <rect key={y} x="14" y={y} width={y === 44 ? 60 : 90} height="4" rx="2" fill="#e1e8e5" />
      ))}
      <rect x="14" y="70" width="92" height="50" fill="none" stroke="#c9d4cf" />
      {[80, 92, 104].map((y) => (
        <rect key={y} x="20" y={y} width="70" height="4" rx="2" fill="#c9d4cf" />
      ))}
      <circle cx="94" cy="138" r="9" fill="none" stroke="#d98f8f" strokeWidth="2" />
    </svg>
  );
}

function Prescription({ minute }: { minute: number }) {
  const reduce = useReducedMotionSafe();
  const [photo, setPhoto] = useState<string | "sample" | null>(null);
  const [pickup, setPickup] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<{ no: number; total: number; name: string; phone: string; at: string } | null>(null);
  const [ahead, setAhead] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (photo && photo !== "sample") URL.revokeObjectURL(photo);
    };
  }, [photo]);

  // 데모라서 앞 순서 하나가 4초마다 끝나는 것으로 줄인다
  useEffect(() => {
    if (!ticket || ahead <= 0) return;
    const id = window.setTimeout(() => setAhead((n) => n - 1), 4000);
    return () => window.clearTimeout(id);
  }, [ticket, ahead]);

  const status = statusAt(minute);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return setError("처방전 사진을 골라 주세요.");
    if (pickup === null) return setError("찾으러 오실 시간을 골라 주세요.");
    if (name.trim().length < 2) return setError("이름을 두 글자 이상 적어 주세요.");
    if (phone.replace(/\D/g, "").length < 10) return setError("문자 받을 휴대전화 번호를 적어 주세요.");
    setError("");
    const now = new Date();
    const at = pickupOptions(status).find((p) => p.id === pickup)?.at ?? "";
    setTicket({ no: 20 + (now.getMinutes() % 30), total: 3, name: maskName(name), phone: maskPhone(phone), at });
    setAhead(3);
  };

  const reset = () => {
    setTicket(null);
    setPhoto(null);
    setPickup(null);
    setName("");
    setPhone("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <section aria-labelledby="rx-title" id="rx" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="rx-title"
          tag="처방전 미리 보내기"
          title="오시기 전에 사진으로 보내 주세요"
          desc="받은 처방전을 찍어 보내면 미리 조제해 둡니다. 약이 준비되면 문자로 알려 드리고, 처방전 원본은 찾으러 오실 때 내 주세요."
        />

        <div className="mt-10 grid items-start gap-8 md:grid-cols-[1.1fr_1fr]">
          <form onSubmit={submit} noValidate className="rounded-[16px] border p-5 md:p-7" style={{ borderColor: C.line }}>
            <ol className="space-y-7">
              <li>
                <p className="flex items-center gap-2 font-bold">
                  <StepNo n={1} done={!!photo} />
                  처방전 사진
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <div className="relative h-[120px] w-[90px] shrink-0 overflow-hidden rounded-[8px] border" style={{ borderColor: C.line, background: C.bg }}>
                    {photo === "sample" ? (
                      <SamplePaper />
                    ) : photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="고른 처방전 사진" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center" style={{ color: "#9aa6a1" }}>
                        <Camera size={26} aria-hidden />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-5 font-semibold focus-within:outline focus-within:outline-2" style={{ background: C.mint, color: "#fff" }}>
                      <Camera size={18} aria-hidden />
                      사진 찍기, 고르기
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setPhoto(URL.createObjectURL(f));
                        }}
                      />
                    </label>
                    <button type="button" onClick={() => setPhoto("sample")} className="h-10 text-left text-[15px] font-semibold underline underline-offset-4" style={{ color: C.mintDeep }}>
                      예시 처방전으로 해 보기
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
                  데모 화면이라 사진은 어디에도 보내지 않습니다.
                </p>
              </li>

              <li>
                <p className="flex items-center gap-2 font-bold">
                  <StepNo n={2} done={pickup !== null} />
                  찾으러 오실 시간
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {pickupOptions(status).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={pickup === p.id}
                      onClick={() => setPickup(p.id)}
                      className="h-12 rounded-[8px] border text-[15px] font-semibold"
                      style={pickup === p.id ? { background: C.mint, color: "#fff", borderColor: C.mint } : { borderColor: C.line }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {status && !status.open && (
                  <p className="mt-2 text-[14px] font-semibold" style={{ color: C.warn }}>
                    {status.title}. {status.sub}. 여는 대로 조제합니다.
                  </p>
                )}
              </li>

              <li>
                <p className="flex items-center gap-2 font-bold">
                  <StepNo n={3} done={name.trim().length > 1 && phone.replace(/\D/g, "").length > 9} />
                  받는 분
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[15px]" style={{ color: C.muted }}>
                      이름
                    </span>
                    <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="김하늘" className="mt-1 h-12 w-full rounded-[8px] border px-3 outline-none focus:border-[#0b7a5f]" style={{ borderColor: C.line }} />
                  </label>
                  <label className="block">
                    <span className="text-[15px]" style={{ color: C.muted }}>
                      휴대전화
                    </span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" className="mt-1 h-12 w-full rounded-[8px] border px-3 outline-none focus:border-[#0b7a5f]" style={{ borderColor: C.line }} />
                  </label>
                </div>
              </li>
            </ol>
            {error && (
              <p className="mt-5 text-[15px] font-semibold" style={{ color: "#b3261e" }} role="alert">
                {error}
              </p>
            )}
            <button type="submit" disabled={!!ticket} className="mt-6 h-13 w-full rounded-full py-3.5 text-[17px] font-bold disabled:opacity-40" style={{ background: C.mint, color: "#fff" }}>
              보내고 번호표 받기
            </button>
          </form>

          <div aria-live="polite">
            <AnimatePresence mode="wait">
              {ticket ? (
                <motion.div
                  key="ticket"
                  initial={reduce ? false : { y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <div className="relative overflow-hidden rounded-[16px] bg-white shadow-[0_10px_30px_rgba(21,33,29,0.1)]">
                    <div className="px-6 pb-5 pt-6 text-center" style={{ background: C.mint, color: "#fff" }}>
                      <p className="text-[15px] opacity-90">조제 번호</p>
                      <p className="text-[64px] font-bold leading-none tabular-nums">{ticket.no}</p>
                      <p className="mt-2 text-[15px] opacity-90">
                        {ticket.name}님, {ticket.at}에 찾으러 오세요
                      </p>
                    </div>
                    <div className="relative h-0 border-t-2 border-dashed" style={{ borderColor: C.line }}>
                      <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full" style={{ background: C.white, boxShadow: "inset -2px 0 0 #dbe5e1" }} />
                      <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full" style={{ background: C.white, boxShadow: "inset 2px 0 0 #dbe5e1" }} />
                    </div>
                    <div className="px-6 py-5">
                      <p className="flex items-center justify-between text-[15px]">
                        <span style={{ color: C.muted }}>내 앞 조제</span>
                        <span className="font-bold">{ahead > 0 ? `${ahead}건` : "끝났어요"}</span>
                      </p>
                      <div className="mt-2 flex gap-1.5" role="img" aria-label={`앞 조제 ${ticket.total}건 중 ${ticket.total - ahead}건 끝남`}>
                        {Array.from({ length: ticket.total + 1 }, (_, i) => {
                          const done = i < ticket.total - ahead;
                          const mine = i === ticket.total;
                          return (
                            <span key={i} className="h-3 flex-1 overflow-hidden rounded-full" style={{ background: C.mintSoft }}>
                              <motion.span
                                className="block h-full rounded-full"
                                style={{ background: mine ? C.warn : C.mint, transformOrigin: "left" }}
                                initial={false}
                                animate={{ scaleX: done || (mine && ahead === 0) ? 1 : 0 }}
                                transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
                              />
                            </span>
                          );
                        })}
                      </div>
                      <AnimatePresence>
                        {ahead === 0 && (
                          <motion.div
                            initial={reduce ? false : { opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: EASE }}
                            className="mt-5"
                          >
                            <p className="flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: C.muted }}>
                              <MessageSquare size={16} aria-hidden />
                              {ticket.phone}로 가는 문자
                            </p>
                            <p className="mt-2 rounded-[14px] rounded-tl-[4px] px-4 py-3 text-[15px]" style={{ background: C.bg }}>
                              [{PHARMACY}] {ticket.name}님 약이 준비됐습니다. 조제 번호 {ticket.no}번, 처방전 원본을 가져와 주세요.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button type="button" onClick={reset} className="mt-5 inline-flex h-10 items-center gap-1.5 text-[15px] font-semibold" style={{ color: C.mintDeep }}>
                        <RotateCcw size={16} aria-hidden />
                        처음부터 다시
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="how" exit={{ opacity: 0 }} className="rounded-[16px] p-6 md:p-7" style={{ background: C.bg }}>
                  <p className="font-bold">이렇게 진행돼요</p>
                  <ol className="mt-4 space-y-4">
                    {[
                      ["사진을 보내면", "약사가 처방 내용을 보고 재고를 확인합니다. 없는 약이 있으면 전화를 드립니다."],
                      ["번호표가 나오면", "내 앞에 몇 건이 남았는지 이 화면에서 볼 수 있습니다."],
                      ["약이 준비되면", "문자를 보내 드립니다. 원본 처방전을 내고 복약 안내를 받은 뒤 약을 받아 가세요."],
                    ].map(([t, d], i) => (
                      <li key={t} className="flex gap-3">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[14px] font-bold" style={{ background: C.white, color: C.mint }}>
                          {i + 1}
                        </span>
                        <span>
                          <span className="font-semibold">{t}</span>
                          <span className="block text-[15px]" style={{ color: C.muted }}>
                            {d}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepNo({ n, done }: { n: number; done: boolean }) {
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[14px] font-bold transition-colors"
      style={done ? { background: C.mint, color: "#fff" } : { background: C.mintSoft, color: C.mintDeep }}
    >
      {done ? <Check size={15} aria-hidden /> : n}
    </span>
  );
}

/* ---------- 복약 시간표 ---------- */

type Slot = "morning" | "lunch" | "dinner" | "bed";
type Timing = "after" | "before" | "with";

const MEALS: Record<Exclude<Slot, "bed">, { label: string; at: number }> = {
  morning: { label: "아침", at: 480 },
  lunch: { label: "점심", at: 750 },
  dinner: { label: "저녁", at: 1110 },
};

const TIMING_LABEL: Record<Timing, string> = { after: "식후 30분", before: "식전 30분", with: "식사와 함께" };

function slotsFor(times: 1 | 2 | 3, bed: boolean): Slot[] {
  const meals: Slot[] = times === 1 ? ["morning"] : times === 2 ? ["morning", "dinner"] : ["morning", "lunch", "dinner"];
  return bed ? [...meals, "bed"] : meals;
}

function slotTime(slot: Slot, timing: Timing) {
  if (slot === "bed") return 1320;
  const base = MEALS[slot].at;
  return timing === "after" ? base + 30 : timing === "before" ? base - 30 : base;
}

function Pillbox({ minute }: { minute: number }) {
  const reduce = useReducedMotionSafe();
  const [times, setTimes] = useState<1 | 2 | 3>(3);
  const [timing, setTiming] = useState<Timing>("after");
  const [bed, setBed] = useState(false);
  const [days, setDays] = useState<3 | 5 | 7>(5);
  const [taken, setTaken] = useState<Set<string>>(new Set());

  const slots = slotsFor(times, bed);
  const start = minute < 0 ? null : new Date(minute * 60_000);
  const dates = start
    ? Array.from({ length: days }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      })
    : [];
  const total = slots.length * days;
  const takenCount = [...taken].filter((k) => {
    const [d, s] = k.split(":");
    return Number(d) < days && slots.includes(s as Slot);
  }).length;

  const change = (fn: () => void) => {
    fn();
    setTaken(new Set());
  };

  const toggle = (key: string) =>
    setTaken((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const Choice = <T extends string | number>({ label, value, options, onPick }: { label: string; value: T; options: { v: T; label: string }[]; onPick: (v: T) => void }) => (
    <fieldset>
      <legend className="text-[15px] font-semibold">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            aria-pressed={value === o.v}
            onClick={() => change(() => onPick(o.v))}
            className="h-11 rounded-full border px-4 text-[15px] font-semibold"
            style={value === o.v ? { background: C.mint, color: "#fff", borderColor: C.mint } : { background: C.white, borderColor: C.line }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <section aria-labelledby="pillbox-title" id="pillbox" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.bg }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="pillbox-title"
          tag="복약 시간표"
          title="약 봉투에 적힌 대로 고르면 약통이 만들어져요"
          desc="먹은 칸을 누르면 뚜껑이 열리며 표시됩니다. 인쇄해서 냉장고에 붙여 두셔도 됩니다."
        />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[320px_1fr]">
          <div className="space-y-6 rounded-[16px] bg-white p-5 print:hidden">
            {Choice({
              label: "하루에",
              value: times,
              options: [
                { v: 1 as const, label: "1번" },
                { v: 2 as const, label: "2번" },
                { v: 3 as const, label: "3번" },
              ],
              onPick: setTimes,
            })}
            {Choice({
              label: "언제",
              value: timing,
              options: (Object.keys(TIMING_LABEL) as Timing[]).map((t) => ({ v: t, label: TIMING_LABEL[t] })),
              onPick: setTiming,
            })}
            <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px] font-semibold">
              <input type="checkbox" checked={bed} onChange={(e) => change(() => setBed(e.target.checked))} className="h-5 w-5 accent-[#0b7a5f]" />
              자기 전에도 먹어요
            </label>
            {Choice({
              label: "며칠 동안",
              value: days,
              options: [
                { v: 3 as const, label: "3일" },
                { v: 5 as const, label: "5일" },
                { v: 7 as const, label: "7일" },
              ],
              onPick: setDays,
            })}
          </div>

          <div className="min-w-0 rounded-[16px] bg-white p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-bold">
                {total}번 중 <span style={{ color: C.mint }}>{takenCount}번</span> 먹었어요
              </p>
              <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[15px] font-semibold print:hidden" style={{ borderColor: C.line }}>
                <Printer size={17} aria-hidden />
                인쇄
              </button>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: C.mintSoft }}>
              <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${total ? (takenCount / total) * 100 : 0}%`, background: C.mint }} />
            </div>

            <div className="mt-5 overflow-x-auto pb-2">
              <table className="w-full min-w-[420px] border-separate border-spacing-1.5 text-center">
                <caption className="sr-only">날짜별, 시간별 복약 칸. 칸을 누르면 먹은 것으로 표시됩니다.</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-[84px]" />
                    {start
                      ? dates.map((d, i) => (
                          <th key={i} scope="col" className="text-[14px] font-semibold" style={{ color: d.getDay() === 0 ? "#b3261e" : C.muted }}>
                            {i === 0 ? "오늘" : `${d.getMonth() + 1}/${d.getDate()}`}
                            <span className="block text-[12px] font-normal">{DAY_NAMES[d.getDay()]}</span>
                          </th>
                        ))
                      : Array.from({ length: days }, (_, i) => <th key={i} scope="col" />)}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((s) => (
                    <tr key={s}>
                      <th scope="row" className="text-left text-[14px] font-semibold leading-[1.3]">
                        {s === "bed" ? "자기 전" : MEALS[s].label}
                        <span className="block text-[12px] font-normal tabular-nums" style={{ color: C.muted }}>
                          {hhmm(slotTime(s, timing))}
                        </span>
                      </th>
                      {Array.from({ length: days }, (_, d) => {
                        const key = `${d}:${s}`;
                        const on = taken.has(key);
                        return (
                          <td key={d} className="p-0">
                            <button
                              type="button"
                              onClick={() => toggle(key)}
                              aria-pressed={on}
                              aria-label={`${d === 0 ? "오늘" : `${d}일 뒤`} ${s === "bed" ? "자기 전" : MEALS[s].label} 약${on ? ", 먹음" : ""}`}
                              className="relative block h-[58px] w-full overflow-hidden rounded-[10px] border [perspective:300px]"
                              style={{ borderColor: on ? C.mint : C.line, background: on ? C.mintSoft : C.white }}
                            >
                              <span className="absolute inset-0 flex items-center justify-center gap-0.5">
                                {on ? (
                                  <Check size={20} style={{ color: C.mint }} aria-hidden />
                                ) : (
                                  <>
                                    <span className="h-2.5 w-4 rounded-full" style={{ background: "#f0b44c" }} />
                                    <span className="h-3 w-3 rounded-full" style={{ background: "#e7eeeb", border: "1px solid #cbd6d1" }} />
                                  </>
                                )}
                              </span>
                              <motion.span
                                aria-hidden
                                className="absolute inset-x-0 top-0 h-full rounded-[9px]"
                                style={{ background: "rgba(11,122,95,0.10)", transformOrigin: "top", backfaceVisibility: "hidden" }}
                                initial={false}
                                animate={reduce ? { opacity: on ? 0 : 1 } : { rotateX: on ? -100 : 0, opacity: on ? 0 : 1 }}
                                transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
                              />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
              시간은 아침 8시, 점심 12시 30분, 저녁 6시 30분 식사를 기준으로 잡았습니다. 약사 안내가 다르면 안내대로 드세요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 상비약 찾기 ---------- */

type Cat = "pain" | "cold" | "stomach" | "skin" | "eyenose" | "etc";
type StockState = "many" | "few" | "order";

const CATS: { id: Cat | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "pain", label: "열·통증" },
  { id: "cold", label: "감기" },
  { id: "stomach", label: "소화" },
  { id: "skin", label: "상처·피부" },
  { id: "eyenose", label: "눈·코" },
  { id: "etc", label: "그 밖에" },
];

const STOCK: { name: string; use: string; cat: Cat; state: StockState }[] = [
  { name: "아세트아미노펜 해열진통제", use: "열, 두통, 생리통", cat: "pain", state: "many" },
  { name: "이부프로펜 해열진통제", use: "열, 근육통, 치통", cat: "pain", state: "many" },
  { name: "어린이 해열 시럽", use: "아이 열 내림", cat: "pain", state: "few" },
  { name: "종합감기약 (낮에 먹는 약)", use: "콧물, 기침, 몸살", cat: "cold", state: "many" },
  { name: "목 통증 트로키", use: "목 아픔, 칼칼함", cat: "cold", state: "many" },
  { name: "기침 가래 시럽", use: "기침, 가래", cat: "cold", state: "few" },
  { name: "소화제", use: "더부룩함, 체기", cat: "stomach", state: "many" },
  { name: "위장약", use: "속쓰림, 신물", cat: "stomach", state: "few" },
  { name: "지사제", use: "설사", cat: "stomach", state: "many" },
  { name: "변비약", use: "변비", cat: "stomach", state: "order" },
  { name: "붙이는 파스", use: "근육통, 삠", cat: "skin", state: "many" },
  { name: "상처 연고", use: "긁힌 상처, 화상 뒤", cat: "skin", state: "many" },
  { name: "습윤 밴드", use: "물집, 상처 보호", cat: "skin", state: "many" },
  { name: "벌레 물린 데 바르는 약", use: "가려움, 붓기", cat: "skin", state: "order" },
  { name: "일회용 인공눈물", use: "눈 건조, 뻑뻑함", cat: "eyenose", state: "many" },
  { name: "알레르기 약", use: "콧물, 재채기, 가려움", cat: "eyenose", state: "few" },
  { name: "멀미약", use: "차멀미, 뱃멀미", cat: "etc", state: "order" },
  { name: "전자 체온계", use: "귀, 이마 체온 재기", cat: "etc", state: "many" },
];

const STATE_LABEL: Record<StockState, { text: string; color: string; bg: string }> = {
  many: { text: "있어요", color: C.mintDeep, bg: C.mintSoft },
  few: { text: "조금 남았어요", color: C.warn, bg: C.warnSoft },
  order: { text: "주문하면 내일", color: C.muted, bg: "#eef1f0" },
};

function Stock() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Cat | "all">("all");
  const [requested, setRequested] = useState<string[]>([]);

  const q = query.trim();
  const list = STOCK.filter((s) => (cat === "all" || s.cat === cat) && (!q || s.name.includes(q) || s.use.includes(q)));

  return (
    <section aria-labelledby="stock-title" id="stock" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead
          id="stock-title"
          tag="상비약 찾기"
          title="찾는 약이 있는지 먼저 보고 오세요"
          desc="증상이나 약 이름으로 찾을 수 있습니다. 없는 약은 주문해 두면 다음 날 받아 가실 수 있어요."
        />
        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative block md:w-[300px]">
            <span className="sr-only">증상이나 약 이름</span>
            <Search size={19} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.muted }} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="두통, 설사, 파스"
              className="h-12 w-full rounded-full border pl-11 pr-4 outline-none focus:border-[#0b7a5f]"
              style={{ borderColor: C.line }}
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="증상 분류">
            {CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={cat === c.id}
                onClick={() => setCat(c.id)}
                className="h-11 rounded-full border px-4 text-[15px] font-semibold"
                style={cat === c.id ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-6 grid gap-2.5 md:grid-cols-2">
          {list.map((s) => {
            const st = STATE_LABEL[s.state];
            const asked = requested.includes(s.name);
            return (
              <li key={s.name} className="flex items-center gap-3 rounded-[12px] border px-4 py-3.5" style={{ borderColor: C.line }}>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: C.bg, color: C.mint }}>
                  <Pill size={19} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold leading-[1.4]">{s.name}</span>
                  <span className="block text-[14px]" style={{ color: C.muted }}>
                    {s.use}
                  </span>
                </span>
                {s.state === "order" ? (
                  <button
                    type="button"
                    aria-pressed={asked}
                    onClick={() => setRequested((p) => (asked ? p.filter((x) => x !== s.name) : [...p, s.name]))}
                    className="h-10 shrink-0 rounded-full border px-3.5 text-[14px] font-semibold"
                    style={asked ? { background: C.mint, color: "#fff", borderColor: C.mint } : { borderColor: C.line, color: C.ink }}
                  >
                    {asked ? "주문해 둠" : "주문하면 내일"}
                  </button>
                ) : (
                  <span className="shrink-0 rounded-full px-3 py-1.5 text-[14px] font-semibold" style={{ color: st.color, background: st.bg }}>
                    {st.text}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        {list.length === 0 && (
          <p className="mt-6 rounded-[12px] p-6 text-center" style={{ background: C.bg, color: C.muted }}>
            찾는 약이 목록에 없어요. 전화 {TEL}로 물어봐 주세요.
          </p>
        )}
        <p className="mt-5 text-[15px]" style={{ color: C.muted }}>
          먹고 있는 약이 있거나 임신 중이면 일반의약품도 약사에게 먼저 말씀해 주세요.
        </p>
      </div>
    </section>
  );
}

/* ---------- 영업시간, 당번 달력 ---------- */

function Hours({ minute }: { minute: number }) {
  const now = minute < 0 ? null : new Date(minute * 60_000);
  const [offset, setOffset] = useState(0);
  const base = now ? new Date(now.getFullYear(), now.getMonth() + offset, 1) : null;
  const cells = base
    ? (() => {
        const first = base.getDay();
        const len = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
        return [...Array.from({ length: first }, () => null), ...Array.from({ length: len }, (_, i) => new Date(base.getFullYear(), base.getMonth(), i + 1))];
      })()
    : [];

  return (
    <section aria-labelledby="hours-title" id="hours" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24" style={{ background: C.bg }}>
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="hours-title" tag="영업시간·당번" title="쉬는 날과 휴일 당번" desc="일요일은 쉬고, 둘째·넷째 일요일에는 휴일 당번으로 문을 엽니다." />
        <div className="mt-10 grid items-start gap-8 md:grid-cols-[1fr_340px]">
          <div className="rounded-[16px] bg-white p-4 md:p-6">
            <div className="flex items-center justify-between">
              <p className="text-[20px] font-bold">{base ? `${base.getFullYear()}년 ${base.getMonth() + 1}월` : " "}</p>
              <div className="flex gap-1.5">
                {[
                  [0, "이번 달"],
                  [1, "다음 달"],
                ].map(([v, label]) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={offset === v}
                    onClick={() => setOffset(v as number)}
                    className="h-10 rounded-full border px-3.5 text-[14px] font-semibold"
                    style={offset === v ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[13px] font-semibold" aria-hidden>
              {DAY_NAMES.map((d, i) => (
                <span key={d} style={{ color: i === 0 ? "#b3261e" : C.muted }}>
                  {d}
                </span>
              ))}
            </div>
            <ol className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((d, i) => {
                if (!d) return <li key={`e${i}`} aria-hidden />;
                const p = planFor(d);
                const isToday = now && d.toDateString() === now.toDateString();
                return (
                  <li
                    key={d.getDate()}
                    className="flex min-h-[64px] flex-col rounded-[8px] p-1.5 text-left md:min-h-[78px] md:p-2"
                    style={{
                      background: p.duty ? C.mint : p.open ? C.white : "#eef1f0",
                      color: p.duty ? "#fff" : p.open ? C.ink : "#7d8a85",
                      outline: isToday ? `2px solid ${C.ink}` : `1px solid ${C.line}`,
                      outlineOffset: isToday ? 0 : -1,
                    }}
                    aria-label={`${d.getMonth() + 1}월 ${d.getDate()}일 ${DAY_NAMES[d.getDay()]}요일, ${p.open ? `${hhmm(p.from)}부터 ${hhmm(p.to)}까지` : "쉼"}${p.note ? `, ${p.note}` : ""}${isToday ? ", 오늘" : ""}`}
                  >
                    <span className="text-[14px] font-bold tabular-nums">{d.getDate()}</span>
                    <span className="mt-auto hidden text-[11px] leading-[1.3] sm:block">
                      {p.duty ? "당번" : p.open ? `~${hhmm(p.to)}` : p.note ?? "쉼"}
                    </span>
                    <span className="mt-auto text-[10px] leading-[1.2] sm:hidden">{p.duty ? "당번" : p.open ? "" : "쉼"}</span>
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="rounded-[16px] bg-white p-5">
            <table className="w-full text-[16px]">
              <caption className="pb-2 text-left font-bold">영업시간</caption>
              <tbody>
                {[
                  ["월 ~ 금", "09:00 ~ 21:00"],
                  ["토요일", "09:00 ~ 18:00"],
                  ["일요일, 공휴일", "쉽니다"],
                  ["휴일 당번 (둘째·넷째 일요일)", "10:00 ~ 18:00"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-t" style={{ borderColor: C.line }}>
                    <th scope="row" className="py-3 pr-3 text-left font-normal" style={{ color: C.muted }}>
                      {k}
                    </th>
                    <td className="py-3 text-right font-semibold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
              점심시간 없이 문을 엽니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

function MiniMap() {
  return (
    <svg viewBox="0 0 640 360" className="h-auto w-full" role="img" aria-label="□□역 1번 출구 앞 □□내과 건물 1층에 있는 약국 약도">
      <rect width="640" height="360" fill={C.white} />
      <path d="M0 200 H640" stroke={C.line} strokeWidth="30" />
      <path d="M150 0 V360" stroke={C.line} strokeWidth="22" />
      <text x="470" y="236" fontSize="15" fill={C.muted}>
        □□로
      </text>
      <circle cx="150" cy="200" r="16" fill={C.ink} />
      <text x="150" y="205" fontSize="13" fill="#fff" textAnchor="middle" fontWeight={700}>
        1
      </text>
      <text x="40" y="256" fontSize="15" fill={C.ink}>
        □□역 1번 출구
      </text>
      <path d="M168 200 H330" stroke={C.mint} strokeWidth="3" strokeDasharray="6 7" />
      <rect x="300" y="60" width="200" height="118" rx="8" fill={C.bg} stroke={C.line} />
      <text x="400" y="92" fontSize="14" fill={C.muted} textAnchor="middle">
        2층 □□내과, 3층 □□소아과
      </text>
      <rect x="320" y="120" width="70" height="46" rx="6" fill={C.mint} />
      <path d="M350 130 H360 V138 H368 V148 H360 V156 H350 V148 H342 V138 H350Z" fill="#fff" />
      <text x="400" y="150" fontSize="16" fill={C.ink} fontWeight={700}>
        1층 {PHARMACY}
      </text>
    </svg>
  );
}

function Location() {
  return (
    <section aria-labelledby="location-title" id="location" className="scroll-mt-16 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <SectionHead id="location-title" tag="오시는 길" title="□□역 1번 출구 바로 앞이에요" />
        <div className="mt-10 grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-14">
          <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: C.line }}>
            <MiniMap />
          </div>
          <div>
            <p className="text-[22px] font-bold tracking-[-0.02em]">{ADDRESS}</p>
            <ul className="mt-5 space-y-4">
              {[
                { icon: TrainFront, title: "지하철", body: "□□역 1번 출구에서 50m, 같은 건물 2층 □□내과, 3층 □□소아과" },
                { icon: Car, title: "주차", body: "건물 뒤 주차장 30분 무료, 약 받으실 때 말씀해 주세요." },
              ].map((r) => (
                <li key={r.title} className="flex gap-3">
                  <r.icon size={20} className="mt-1 shrink-0" style={{ color: C.mint }} aria-hidden />
                  <span>
                    <span className="font-semibold">{r.title}</span>
                    <span className="block text-[15px]" style={{ color: C.muted }}>
                      {r.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <a href={`tel:${TEL}`} className="mt-7 inline-flex h-12 items-center rounded-full px-6 font-semibold" style={{ background: C.mint, color: "#fff" }}>
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
    <footer className="px-4 pb-24 pt-12 md:px-6" style={{ background: C.mintDeep, color: "#e3f2ec" }}>
      <div className="mx-auto max-w-[1200px]">
        <Logo light />
        <dl className="mt-6 grid gap-x-8 gap-y-1.5 text-[14px] sm:grid-cols-2 md:grid-cols-3" style={{ color: "#b5d6ca" }}>
          {[
            ["상호", PHARMACY],
            ["개설 약사", "박○○"],
            ["사업자등록번호", "000-00-00000"],
            ["주소", ADDRESS],
            ["전화", TEL],
            ["이메일", "hello@example.com"],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt>{k}</dt>
              <dd style={{ color: "#fff" }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </footer>
  );
}
