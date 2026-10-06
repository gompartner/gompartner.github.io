"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AArrowUp,
  Camera,
  Check,
  Menu,
  MessageSquare,
  Phone,
  Printer,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 약국 홈페이지 데모: 가상의 ○○ 약국.
   상호, 약사 이름, 주소, 전화번호, 사업자 정보, 재고는 모두 가상이다. 약 이름은 상표 대신 성분과 용도로 적는다.

   뼈대: 운영 안내형. 대한약사회 휴일지킴이약국 상세 화면처럼 머리글 맨 위에 영업 상태 띠를 두고,
   첫 화면은 약국 정보 카드(주소, 운영시간, 약사)와 요일별 운영시간 표, 오시는 길 카드다.
   그 아래로 처방전 미리 보내기, 취급 품목(품목 분류 + 증상 분류), 복약 달력 패널이 이어진다.
   실시간 영업 상태는 머리글 띠 한 곳에만 둔다. 구간 제목은 흰 바탕 제목과 밑줄로 두고 설명 문단은 두지 않는다.

   디자인: 흰 바탕에 약국 초록(#0b7a5f), 옅은 민트(#e3f2ec), 주의 주황(#b45309).
   어르신도 보기 쉽게 머리글에 글자 크게 버튼을 두고, 누르면 화면 전체가 커진다.

   운영: 평일 09:00 ~ 익일 01:00(22:00 이후 공공심야약국), 토요일 09:00 ~ 18:00,
   일요일·공휴일 휴무, 둘째·넷째 일요일은 휴일지킴이약국으로 10:00 ~ 18:00. */

const PHARMACY = "○○ 약국";
const TEL = "02-000-0000";
const ADDRESS = "□□시 □□로 140 □□의원 건물 1층";

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
  off: "#5f6b66",
};

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV = [
  { id: "top", label: "약국소개" },
  { id: "hours", label: "운영시간" },
  { id: "rx", label: "처방전 전송" },
  { id: "stock", label: "취급 품목" },
  { id: "pillbox", label: "복약 달력" },
  { id: "location", label: "오시는 길" },
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

const hhmm = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
/** 자정을 넘긴 시각은 "익일"을 붙인다 */
const fmt = (m: number) => (m >= 1440 ? `익일 ${hhmm(m - 1440)}` : hhmm(m));

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

const LATE_FROM = 1320; // 22:00 공공심야약국 시작

type DayPlan = { open: boolean; from: number; to: number; note?: string; duty?: boolean; late?: boolean };

/** 하루 운영 계획. 평일은 자정을 넘겨 익일 01:00(1500분)까지 연다. */
function planFor(d: Date): DayPlan {
  const holiday = HOLIDAYS[`${d.getMonth() + 1}-${d.getDate()}`];
  const day = d.getDay();
  if (day === 0) {
    const nth = Math.ceil(d.getDate() / 7);
    if (nth === 2 || nth === 4) return { open: true, from: 600, to: 1080, note: "휴일지킴이약국", duty: true };
    return { open: false, from: 0, to: 0, note: holiday ?? "정기휴무" };
  }
  if (holiday) return { open: false, from: 0, to: 0, note: holiday };
  if (day === 6) return { open: true, from: 540, to: 1080 };
  return { open: true, from: 540, to: 1500, late: true };
}

const rangeText = (p: DayPlan) => `${hhmm(p.from)} ~ ${fmt(p.to)}`;

function dayLabel(d: Date, offset: number) {
  if (offset === 0) return "오늘";
  if (offset === 1) return "내일";
  return `${d.getMonth() + 1}월 ${d.getDate()}일(${DAY_NAMES[d.getDay()]})`;
}

type Next = { day: string; from: number; to: number };
type Status = {
  state: "open" | "before" | "closed" | "off";
  label: string;
  sub: string;
  late: boolean;
  duty: boolean;
  now: number;
  to: number;
  next: Next;
};

function statusAt(minute: number): Status | null {
  if (minute < 0) return null;
  const now = new Date(minute * 60_000);
  const m = now.getHours() * 60 + now.getMinutes();
  const today = planFor(now);

  const nextOpen = (start: number): Next => {
    for (let i = start; i <= 10; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const p = planFor(d);
      if (p.open && (i > 0 || m < p.from)) return { day: dayLabel(d, i), from: p.from, to: p.to };
    }
    return { day: "내일", from: 540, to: 1500 };
  };

  // 어젯밤 공공심야 영업이 자정을 넘겨 이어지는 중
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  const yp = planFor(y);
  if (yp.open && yp.to > 1440 && m < yp.to - 1440) {
    return { state: "open", label: "영업중", sub: `공공심야약국 운영 · ${hhmm(yp.to - 1440)}까지`, late: true, duty: false, now: m, to: yp.to - 1440, next: nextOpen(0) };
  }
  if (today.open && m >= today.from && m < today.to) {
    const late = !!today.late && m >= LATE_FROM;
    const sub = late ? `공공심야약국 운영 · ${fmt(today.to)}까지` : today.duty ? `휴일지킴이약국 운영 · ${hhmm(today.to)}까지` : `오늘 ${rangeText(today)}`;
    return { state: "open", label: "영업중", sub, late, duty: !!today.duty, now: m, to: today.to, next: nextOpen(1) };
  }
  if (today.open && m < today.from) {
    return { state: "before", label: "영업 전", sub: `오늘 ${hhmm(today.from)} 영업 시작`, late: false, duty: !!today.duty, now: m, to: today.to, next: { day: "오늘", from: today.from, to: today.to } };
  }
  const n = nextOpen(1);
  const why = !today.open && today.note ? `${today.note} · ` : "";
  return { state: today.open ? "closed" : "off", label: today.open ? "영업 종료" : "휴무", sub: `${why}${n.day} ${hhmm(n.from)} 영업 시작`, late: false, duty: false, now: m, to: 0, next: n };
}

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 병원식 마스킹: 김하늘 → 김ㅎ늘, 김솔 → 김* */
function maskName(name: string) {
  const chars = [...name.trim()];
  if (chars.length < 2) return chars.join("");
  if (chars.length === 2) return `${chars[0]}*`;
  const hide = (ch: string) => {
    const code = ch.charCodeAt(0) - 0xac00;
    return code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*";
  };
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
  const status = statusAt(minute);

  return (
    <div className="min-h-screen text-[17px] leading-[1.6]" style={{ background: C.bg, color: C.ink }}>
      <Header big={big} onBig={() => setBig((v) => !v)} status={status} />
      <main style={{ zoom: big ? 1.18 : 1 }} className="px-4 pb-16 pt-5 md:px-6 md:pt-8">
        <div className="mx-auto max-w-[1200px] space-y-5 md:space-y-6">
          <Intro />
          <div className="grid items-start gap-5 md:gap-6 lg:grid-cols-[1.15fr_1fr]">
            <Hours minute={minute} />
            <Location />
          </div>
          <Prescription status={status} />
          <Stock />
          <Pillbox minute={minute} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ---------- 로고, 머리글, 영업 상태 띠 ---------- */

function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
        <rect width="30" height="30" rx="6" fill={light ? "#fff" : C.mint} />
        <path d="M12 7 H18 V12 H23 V18 H18 V23 H12 V18 H7 V12 H12Z" fill={light ? C.mint : "#fff"} />
      </svg>
      <span className="text-[19px] font-bold tracking-[-0.02em]">{PHARMACY}</span>
    </span>
  );
}

function StatusStrip({ status }: { status: Status | null }) {
  const open = status?.state === "open";
  return (
    <div className="print:hidden" style={{ background: status ? (open ? C.mintDeep : C.off) : C.off, color: "#fff" }}>
      <div className="mx-auto flex h-10 max-w-[1200px] items-center gap-2.5 px-4 text-[15px] md:px-6">
        {status ? (
          <>
            <span className="inline-flex h-6 shrink-0 items-center rounded-[4px] px-2 text-[14px] font-bold" style={{ background: "#fff", color: open ? C.mintDeep : C.off }}>
              {status.label}
            </span>
            <span className="min-w-0 truncate">{status.sub}</span>
          </>
        ) : (
          <span aria-hidden> </span>
        )}
      </div>
    </div>
  );
}

function Header({ big, onBig, status }: { big: boolean; onBig: () => void; status: Status | null }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white print:hidden" style={{ borderColor: C.line }}>
      <StatusStrip status={status} />
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <a href="#top" aria-label={`${PHARMACY} 처음으로`}>
          <Logo />
        </a>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-[16px] font-semibold">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="transition-colors hover:text-[#0b7a5f]">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <button
            id="font-toggle"
            type="button"
            onClick={onBig}
            aria-pressed={big}
            className="inline-flex h-11 items-center gap-1.5 rounded-[6px] border px-3 text-[15px] font-semibold"
            style={big ? { background: C.mint, color: "#fff", borderColor: C.mint } : { borderColor: C.line, color: C.ink }}
          >
            <AArrowUp size={19} aria-hidden />
            글자 크게
          </button>
          <a href={`tel:${TEL}`} aria-label={`전화 ${TEL}`} className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] xl:w-auto xl:gap-1.5 xl:px-4" style={{ background: C.mint, color: "#fff" }}>
            <Phone size={18} aria-hidden />
            <span className="hidden text-[15px] font-semibold tabular-nums xl:inline">{TEL}</span>
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] lg:hidden"
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
            <ul className="grid grid-cols-2 px-4 py-2">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} onClick={() => setOpen(false)} className="flex h-12 items-center text-[17px] font-semibold">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- 패널 ---------- */

function Panel({
  id,
  title,
  aside,
  children,
  className = "",
}: {
  id: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`scroll-mt-32 rounded-[10px] border bg-white px-4 pb-5 pt-3 md:px-6 md:pb-6 md:pt-4 ${className}`} style={{ borderColor: C.line }}>
      <div className="flex min-h-[52px] flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b-2 pb-2.5" style={{ borderColor: C.ink }}>
        <h2 id={`${id}-title`} className="text-[20px] font-bold tracking-[-0.02em] md:text-[22px]">
          {title}
        </h2>
        {aside}
      </div>
      <div className="pt-4 md:pt-5">{children}</div>
    </section>
  );
}

/* ---------- 약국 정보 카드 ---------- */

function Intro() {
  const rows: [string, React.ReactNode][] = [
    ["주소", ADDRESS],
    [
      "전화번호",
      <a key="tel" href={`tel:${TEL}`} className="font-semibold underline underline-offset-4 tabular-nums">
        {TEL}
      </a>,
    ],
    ["운영시간", "평일 09:00 ~ 익일 01:00, 토요일 09:00 ~ 18:00"],
    ["약사", "개설 약사 박○○ 외 1명"],
  ];

  return (
    <section id="top" aria-labelledby="pharmacy-name" className="scroll-mt-32 rounded-[10px] border bg-white p-4 md:p-6 print:hidden" style={{ borderColor: C.line }}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h1 id="pharmacy-name" className="text-[28px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[36px]">
          {PHARMACY}
        </h1>
        <span className="rounded-[4px] px-2 py-0.5 text-[14px] font-semibold text-white" style={{ background: C.mint }}>
          공공심야약국
        </span>
      </div>
      <p className="mt-2 text-[16px]" style={{ color: C.muted }}>
        동물약도 취급합니다.
      </p>
      <dl className="mt-4 grid border-t text-[16px] sm:grid-cols-2" style={{ borderColor: C.line }}>
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3 border-b py-2.5 sm:pr-4" style={{ borderColor: C.line }}>
            <dt className="w-[80px] shrink-0" style={{ color: C.muted }}>
              {k}
            </dt>
            <dd className="min-w-0 font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ---------- 운영시간 ---------- */

const WEEK_ROWS: { label: string; days: number[]; time: string; note?: string }[] = [
  { label: "월요일", days: [1], time: "09:00 ~ 익일 01:00", note: "22:00 이후 공공심야약국" },
  { label: "화요일", days: [2], time: "09:00 ~ 익일 01:00", note: "22:00 이후 공공심야약국" },
  { label: "수요일", days: [3], time: "09:00 ~ 익일 01:00", note: "22:00 이후 공공심야약국" },
  { label: "목요일", days: [4], time: "09:00 ~ 익일 01:00", note: "22:00 이후 공공심야약국" },
  { label: "금요일", days: [5], time: "09:00 ~ 익일 01:00", note: "22:00 이후 공공심야약국" },
  { label: "토요일", days: [6], time: "09:00 ~ 18:00" },
  { label: "일요일", days: [0], time: "휴무", note: "둘째·넷째 일요일 휴일지킴이약국 10:00 ~ 18:00" },
];

function Hours({ minute }: { minute: number }) {
  const now = minute < 0 ? null : new Date(minute * 60_000);
  const [offset, setOffset] = useState(0);
  const base = now ? new Date(now.getFullYear(), now.getMonth() + offset, 1) : null;
  const cells = base
    ? [
        ...Array.from({ length: base.getDay() }, () => null),
        ...Array.from({ length: new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate() }, (_, i) => new Date(base.getFullYear(), base.getMonth(), i + 1)),
      ]
    : [];

  return (
    <Panel id="hours" title="운영시간" className="print:hidden">
      <table className="w-full text-[16px]">
        <caption className="sr-only">요일별 운영시간</caption>
        <tbody>
          {WEEK_ROWS.map((r) => {
            return (
              <tr key={r.label} className="border-b" style={{ borderColor: C.line }}>
                <th scope="row" className="w-[92px] py-2.5 pl-2 text-left align-top font-semibold" style={{ color: r.days[0] === 0 ? "#b3261e" : C.ink }}>
                  {r.label}
                </th>
                <td className="py-2.5 pr-2 tabular-nums">
                  <span className="font-semibold">{r.time}</span>
                  {r.note && (
                    <span className="block text-[14px]" style={{ color: C.muted }}>
                      {r.note}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
          <tr className="border-b" style={{ borderColor: C.line }}>
            <th scope="row" className="py-2.5 pl-2 text-left font-semibold" style={{ color: "#b3261e" }}>
              공휴일
            </th>
            <td className="py-2.5 pr-2 font-semibold">휴무</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
        점심시간 없이 운영합니다.
      </p>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[17px] font-bold">휴일지킴이약국 운영일</h3>
          <div className="flex items-center gap-1" role="group" aria-label="달 선택">
            {[
              [0, "이번 달"],
              [1, "다음 달"],
            ].map(([v, label]) => (
              <button
                key={label}
                type="button"
                aria-pressed={offset === v}
                onClick={() => setOffset(v as number)}
                className="h-9 rounded-[6px] border px-2.5 text-[14px] font-semibold"
                style={offset === v ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-[15px] font-semibold tabular-nums" aria-live="polite">
          {base ? `${base.getFullYear()}년 ${base.getMonth() + 1}월` : " "}
        </p>
        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[13px] font-semibold" aria-hidden>
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
            return (
              <li
                key={d.getDate()}
                className="flex h-10 items-center justify-center rounded-[4px] text-[14px] font-semibold tabular-nums"
                style={{
                  background: p.duty ? C.mint : p.open ? C.white : "#eef1f0",
                  color: p.duty ? "#fff" : p.open ? C.ink : "#6f7c77",
                  outline: `1px solid ${C.line}`,
                  outlineOffset: -1,
                }}
                aria-label={`${d.getMonth() + 1}월 ${d.getDate()}일 ${DAY_NAMES[d.getDay()]}요일, ${p.open ? rangeText(p) : "휴무"}${p.note ? `, ${p.note}` : ""}`}
              >
                {d.getDate()}
              </li>
            );
          })}
        </ol>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[14px]" style={{ color: C.muted }} aria-label="달력 범례">
          <li className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[2px]" style={{ background: C.mint }} aria-hidden />
            휴일지킴이약국 운영
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[2px]" style={{ background: "#eef1f0", border: `1px solid ${C.line}` }} aria-hidden />
            휴무
          </li>
        </ul>
      </div>
    </Panel>
  );
}

/* ---------- 오시는 길 ---------- */

const MAP_LINKS = [
  { label: "네이버 지도", href: "https://map.naver.com/" },
  { label: "카카오맵", href: "https://map.kakao.com/" },
  { label: "구글 지도", href: "https://www.google.com/maps" },
];

function Location() {
  const rows: [string, string[]][] = [
    ["주소", [ADDRESS]],
    ["전화번호", [TEL, "팩스 02-000-0001"]],
    ["주차", ["건물 지하 주차장 30분 무료 (약 수령 시 주차권 제공)"]],
    ["지하철", ["□□역 1번 출구에서 □□의원 방향 50m"]],
    ["버스", ["□□의원 앞 정류장 하차, 간선 000 · 지선 0000"]],
  ];
  return (
    <Panel id="location" title="오시는 길" className="print:hidden">
      <dl>
        {rows.map(([k, body]) => (
          <div key={k} className="flex gap-3 border-b py-2.5 first:pt-0" style={{ borderColor: C.line }}>
            <dt className="w-[72px] shrink-0 font-semibold" style={{ color: C.muted }}>
              {k}
            </dt>
            <dd className="min-w-0">
              {body.map((b) => (
                <p key={b}>{b}</p>
              ))}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[15px] font-semibold">
        {MAP_LINKS.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-[#0b7a5f]" style={{ color: C.mintDeep }}>
            {l.label}에서 보기
          </a>
        ))}
      </p>
    </Panel>
  );
}

/* ---------- 처방전 미리 보내기 ---------- */

type PickupOption = { id: number; label: string; at: string };

/** 수령 시간 보기. 영업 중이 아니거나 마감이 가까우면 다음 영업 시작을 기준으로 잡는다. */
function pickupOptions(status: Status | null): PickupOption[] {
  const after = (n: number) => (n === 60 ? "1시간 뒤" : `${n}분 뒤`);
  if (!status) return [15, 30, 60].map((id) => ({ id, label: after(id), at: "" }));
  if (status.state === "open") {
    const last = status.to - 30;
    if (last - status.now >= 15) {
      return [
        ...[15, 30, 60].filter((id) => status.now + id <= last).map((id) => ({ id, label: after(id), at: fmt(status.now + id) })),
        { id: -1, label: "마감 30분 전", at: fmt(last) },
      ];
    }
  }
  const n = status.next;
  return [
    { id: 0, label: "영업 시작", at: `${n.day} ${hhmm(n.from)}` },
    { id: 60, label: "시작 1시간 뒤", at: `${n.day} ${hhmm(n.from + 60)}` },
    { id: 120, label: "시작 2시간 뒤", at: `${n.day} ${hhmm(n.from + 120)}` },
    { id: -1, label: "마감 30분 전", at: `${n.day} ${fmt(n.to - 30)}` },
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

const STAGES = ["접수", "조제 중", "조제 완료"];

function Prescription({ status }: { status: Status | null }) {
  const reduce = useReducedMotionSafe();
  const [photo, setPhoto] = useState<string | "sample" | null>(null);
  const [pickup, setPickup] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<{ no: number; name: string; phone: string; at: string } | null>(null);
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

  const options = pickupOptions(status);
  const stage = ahead > 1 ? 0 : ahead === 1 ? 1 : 2;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return setError("처방전 사진을 첨부해 주십시오.");
    if (pickup === null) return setError("수령 시간을 선택해 주십시오.");
    if (name.trim().length < 2) return setError("성함을 두 글자 이상 입력해 주십시오.");
    if (phone.replace(/\D/g, "").length < 10) return setError("휴대전화 번호를 입력해 주십시오.");
    setError("");
    const now = new Date();
    const at = options.find((p) => p.id === pickup)?.at ?? "";
    setTicket({ no: 20 + (now.getMinutes() % 30), name: maskName(name), phone: maskPhone(phone), at });
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

  const fieldLabel = "block text-[15px] font-bold";

  return (
    <Panel id="rx" title="처방전 미리 보내기" className="print:hidden">
      <div className="grid items-start gap-6 md:grid-cols-[1.15fr_1fr] md:gap-8">
        <form onSubmit={submit} noValidate className="space-y-6">
          <div>
            <p className={fieldLabel} id="rx-photo-label">
              처방전 사진
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <div className="relative h-[120px] w-[90px] shrink-0 overflow-hidden rounded-[6px] border" style={{ borderColor: C.line, background: C.bg }}>
                {photo === "sample" ? (
                  <SamplePaper />
                ) : photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="첨부한 처방전 사진" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center" style={{ color: "#9aa6a1" }}>
                    <Camera size={26} aria-hidden />
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[6px] px-4 font-semibold focus-within:outline focus-within:outline-2 focus-within:outline-offset-2" style={{ background: C.mint, color: "#fff" }}>
                  <Camera size={18} aria-hidden />
                  사진 첨부
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    aria-labelledby="rx-photo-label"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setPhoto(URL.createObjectURL(f));
                    }}
                  />
                </label>
                <button type="button" onClick={() => setPhoto("sample")} className="h-10 text-left text-[15px] font-semibold underline underline-offset-4" style={{ color: C.mintDeep }}>
                  예시로 보기
                </button>
              </div>
            </div>
          </div>

          <fieldset>
            <legend className={fieldLabel}>수령 시간</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {options.map((p) => {
                const on = pickup === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPickup(p.id)}
                    className="flex min-h-[58px] flex-col items-center justify-center rounded-[6px] border px-1 py-1.5 text-[15px] font-semibold leading-[1.3]"
                    style={on ? { background: C.mint, color: "#fff", borderColor: C.mint } : { borderColor: C.line }}
                  >
                    {p.label}
                    {p.at && (
                      <span className="text-[13px] font-normal tabular-nums" style={{ color: on ? "#e3f2ec" : C.muted }}>
                        {p.at}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
              영업시간 외에 보내신 처방전은 문을 연 뒤에 조제합니다.
            </p>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={fieldLabel}>성함</span>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="김하늘" className="mt-1.5 h-12 w-full rounded-[6px] border px-3 outline-none focus:border-[#0b7a5f]" style={{ borderColor: C.line }} />
            </label>
            <label className="block">
              <span className={fieldLabel}>휴대전화</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-1234-5678" className="mt-1.5 h-12 w-full rounded-[6px] border px-3 outline-none focus:border-[#0b7a5f]" style={{ borderColor: C.line }} />
            </label>
          </div>
          {error && (
            <p className="text-[15px] font-semibold" style={{ color: "#b3261e" }} role="alert">
              {error}
            </p>
          )}
          <button type="submit" disabled={!!ticket} className="h-[52px] w-full rounded-[6px] text-[17px] font-bold disabled:opacity-40" style={{ background: C.mint, color: "#fff" }}>
            처방전 전송
          </button>
        </form>

        <div id="rx-ticket" aria-live="polite">
          <AnimatePresence mode="wait">
            {ticket ? (
              <motion.div
                key="ticket"
                initial={reduce ? false : { y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="overflow-hidden rounded-[10px] border"
                style={{ borderColor: C.line }}
              >
                <div className="px-5 pb-5 pt-5 text-center" style={{ background: C.mint, color: "#fff" }}>
                  <p className="text-[15px] opacity-90">조제 번호</p>
                  <p className="text-[60px] font-bold leading-none tabular-nums">{ticket.no}</p>
                  <p className="mt-2 text-[15px] opacity-90">
                    {ticket.name}님 · 수령 {ticket.at}
                  </p>
                </div>
                <div className="px-5 py-5">
                  <ol className="grid grid-cols-3 gap-1.5" aria-label="조제 진행">
                    {STAGES.map((s, i) => (
                      <li key={s} aria-current={i === stage ? "step" : undefined}>
                        <span className="block h-1.5 rounded-full transition-colors duration-500" style={{ background: i <= stage ? C.mint : C.mintSoft }} />
                        <span className="mt-1.5 block text-center text-[14px] font-semibold" style={{ color: i <= stage ? C.ink : "#8a9691" }}>
                          {s}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4 flex items-center justify-between border-t pt-3 text-[15px]" style={{ borderColor: C.line }}>
                    <span style={{ color: C.muted }}>대기 건수</span>
                    <span className="font-bold tabular-nums">{ahead > 0 ? `${ahead}건` : "없음"}</span>
                  </p>
                  <AnimatePresence>
                    {ahead === 0 && (
                      <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="mt-4">
                        <p className="flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: C.muted }}>
                          <MessageSquare size={16} aria-hidden />
                          {ticket.phone} 문자
                        </p>
                        <p className="mt-2 rounded-[10px] rounded-tl-[2px] px-4 py-3 text-[15px]" style={{ background: C.bg }}>
                          [{PHARMACY}] {ticket.name}님 조제가 완료되었습니다. 조제 번호 {ticket.no}번, 처방전 원본을 지참해 주십시오.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button type="button" onClick={reset} className="mt-4 inline-flex h-10 items-center gap-1.5 text-[15px] font-semibold" style={{ color: C.mintDeep }}>
                    <RotateCcw size={16} aria-hidden />
                    새로 접수
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="how" exit={{ opacity: 0 }}>
                <h3 className="border-b pb-2 font-bold" style={{ borderColor: C.line }}>이용 안내</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px]" style={{ color: C.muted }}>
                  {[
                    "재고가 없는 약이 있으면 전화를 드립니다.",
                    "조제가 끝나면 문자를 보내 드립니다.",
                    "약 수령 시 처방전 원본을 제출해 주십시오. 원본이 없으면 약을 드릴 수 없습니다.",
                  ].map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Panel>
  );
}

/* ---------- 취급 품목 ---------- */

type Kind = "otc" | "supp" | "quasi" | "device";
type Cat = "pain" | "cold" | "stomach" | "skin" | "eyenose" | "etc";
type StockState = "many" | "few" | "order";

const KINDS: { id: Kind; label: string }[] = [
  { id: "otc", label: "일반의약품" },
  { id: "supp", label: "건강기능식품" },
  { id: "quasi", label: "의약외품" },
  { id: "device", label: "의료기기" },
];

const CATS: { id: Cat | "all"; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "pain", label: "열·통증" },
  { id: "cold", label: "감기" },
  { id: "stomach", label: "소화" },
  { id: "skin", label: "상처·피부" },
  { id: "eyenose", label: "눈·코" },
  { id: "etc", label: "기타" },
];

const STOCK: { name: string; use: string; kind: Kind; cat?: Cat; state: StockState }[] = [
  { name: "아세트아미노펜 해열진통제", use: "발열, 두통, 생리통", kind: "otc", cat: "pain", state: "many" },
  { name: "이부프로펜 해열진통제", use: "발열, 근육통, 치통", kind: "otc", cat: "pain", state: "many" },
  { name: "어린이 해열 시럽", use: "소아 발열", kind: "otc", cat: "pain", state: "few" },
  { name: "종합감기약 (주간용)", use: "콧물, 기침, 몸살", kind: "otc", cat: "cold", state: "many" },
  { name: "인후염 트로키", use: "목 통증", kind: "otc", cat: "cold", state: "many" },
  { name: "진해거담 시럽", use: "기침, 가래", kind: "otc", cat: "cold", state: "few" },
  { name: "소화제", use: "소화불량, 더부룩함", kind: "otc", cat: "stomach", state: "many" },
  { name: "제산제", use: "속쓰림, 위산 과다", kind: "otc", cat: "stomach", state: "few" },
  { name: "지사제", use: "설사", kind: "otc", cat: "stomach", state: "many" },
  { name: "변비약", use: "변비", kind: "otc", cat: "stomach", state: "order" },
  { name: "소염진통 파스", use: "근육통, 삠", kind: "otc", cat: "skin", state: "many" },
  { name: "상처 연고", use: "찰과상, 화상 후 관리", kind: "otc", cat: "skin", state: "many" },
  { name: "벌레 물림 연고", use: "가려움, 부기", kind: "otc", cat: "skin", state: "order" },
  { name: "일회용 인공눈물", use: "안구 건조", kind: "otc", cat: "eyenose", state: "many" },
  { name: "항히스타민제", use: "콧물, 재채기, 가려움", kind: "otc", cat: "eyenose", state: "few" },
  { name: "멀미약", use: "차멀미, 뱃멀미", kind: "otc", cat: "etc", state: "order" },
  { name: "종합비타민", use: "하루 1정", kind: "supp", state: "many" },
  { name: "프로바이오틱스 (유산균)", use: "장 건강", kind: "supp", state: "many" },
  { name: "오메가-3", use: "혈중 중성지방 개선", kind: "supp", state: "few" },
  { name: "비타민 D", use: "뼈 건강", kind: "supp", state: "order" },
  { name: "보건용 마스크 KF94", use: "미세먼지, 감염 예방", kind: "quasi", state: "many" },
  { name: "구강청결제", use: "구취 제거", kind: "quasi", state: "many" },
  { name: "손 소독제", use: "손 위생", kind: "quasi", state: "few" },
  { name: "습윤 밴드", use: "물집, 상처 보호", kind: "device", state: "many" },
  { name: "전자 체온계", use: "귀, 이마 체온 측정", kind: "device", state: "many" },
  { name: "자동 전자 혈압계", use: "가정용 혈압 측정", kind: "device", state: "order" },
];

/** 재고가 넉넉한 품목은 표시하지 않고, 적은 품목만 배지를 단다 */
const STATE_LABEL: Partial<Record<StockState, { text: string; color: string; bg: string }>> = {
  few: { text: "재고 적음", color: C.warn, bg: C.warnSoft },
};

function Stock() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<Kind>("otc");
  const [cat, setCat] = useState<Cat | "all">("all");
  const [requested, setRequested] = useState<string[]>([]);

  const q = query.trim();
  const list = q ? STOCK.filter((s) => s.name.includes(q) || s.use.includes(q)) : STOCK.filter((s) => s.kind === kind && (kind !== "otc" || cat === "all" || s.cat === cat));
  const kindLabel = (k: Kind) => KINDS.find((x) => x.id === k)!.label;

  return (
    <Panel
      id="stock"
      title="취급 품목"
      className="print:hidden"
      aside={
        <label className="relative block w-full sm:w-[260px]">
          <span className="sr-only">품목 검색</span>
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.muted }} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="두통, 파스, 유산균"
            className="h-11 w-full rounded-[6px] border bg-white pl-10 pr-3 text-[16px] outline-none focus:border-[#0b7a5f]"
            style={{ borderColor: C.line }}
          />
        </label>
      }
    >
      <div role="group" aria-label="품목 분류" className="grid grid-cols-2 border-b sm:flex" style={{ borderColor: C.line }}>
        {KINDS.map((k) => {
          const on = !q && kind === k.id;
          return (
            <button
              key={k.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setKind(k.id);
                setQuery("");
              }}
              className="-mb-px h-12 border-b-[3px] px-4 text-[16px] font-bold"
              style={on ? { borderColor: C.mint, color: C.mintDeep } : { borderColor: "transparent", color: C.muted }}
            >
              {k.label}
            </button>
          );
        })}
      </div>

      {!q && kind === "otc" && (
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="증상 분류">
          {CATS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={cat === c.id}
              onClick={() => setCat(c.id)}
              className="h-10 rounded-[6px] border px-3.5 text-[15px] font-semibold"
              style={cat === c.id ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      {q && (
        <p className="mt-4 text-[15px] font-semibold" aria-live="polite">
          &lsquo;{q}&rsquo; 검색 결과 {list.length}건
        </p>
      )}

      <ul className="mt-4 grid gap-x-6 md:grid-cols-2">
        {list.map((s) => {
          const st = STATE_LABEL[s.state];
          const asked = requested.includes(s.name);
          return (
            <li key={s.name} className="flex items-center gap-3 border-b py-3" style={{ borderColor: C.line }}>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-[1.4]">{s.name}</span>
                <span className="block text-[14px]" style={{ color: C.muted }}>
                  {q && `${kindLabel(s.kind)} · `}
                  {s.use}
                </span>
              </span>
              {s.state === "order" ? (
                <button
                  type="button"
                  aria-pressed={asked}
                  onClick={() => setRequested((p) => (asked ? p.filter((x) => x !== s.name) : [...p, s.name]))}
                  className="inline-flex h-10 shrink-0 items-center gap-1 rounded-[6px] border px-3 text-[14px] font-semibold"
                  style={asked ? { background: C.mint, color: "#fff", borderColor: C.mint } : { borderColor: C.line, color: C.ink }}
                >
                  {asked && <Check size={15} aria-hidden />}
                  {asked ? "주문 요청됨" : "주문 요청"}
                </button>
              ) : st ? (
                <span className="shrink-0 rounded-[4px] px-2.5 py-1 text-[14px] font-semibold" style={{ color: st.color, background: st.bg }}>
                  {st.text}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
      {list.length === 0 && (
        <p className="py-6 text-center" style={{ color: C.muted }}>
          검색 결과가 없습니다. 전화 {TEL}로 문의해 주십시오.
        </p>
      )}
      <ul className="mt-4 space-y-1 text-[14px]" style={{ color: C.muted }}>
        <li>재고가 없는 품목은 주문 요청을 하시면 다음 날 오후 2시부터 찾아가실 수 있습니다.</li>
        <li>드시는 약이 있거나 임신 중이시면 약사에게 먼저 물어봐 주십시오.</li>
      </ul>
    </Panel>
  );
}

/* ---------- 복약 달력 ---------- */

type Slot = "morning" | "lunch" | "dinner" | "bed";
type Timing = "after" | "before" | "with";

const MEALS: Record<Exclude<Slot, "bed">, { label: string; at: number }> = {
  morning: { label: "아침", at: 480 },
  lunch: { label: "점심", at: 750 },
  dinner: { label: "저녁", at: 1110 },
};

const TIMING_LABEL: Record<Timing, string> = { after: "식후 30분", before: "식전 30분", with: "식사 직후" };

function slotsFor(times: 1 | 2 | 3, bed: boolean): Slot[] {
  const meals: Slot[] = times === 1 ? ["morning"] : times === 2 ? ["morning", "dinner"] : ["morning", "lunch", "dinner"];
  return bed ? [...meals, "bed"] : meals;
}

function slotTime(slot: Slot, timing: Timing) {
  if (slot === "bed") return 1320;
  const base = MEALS[slot].at;
  return timing === "after" ? base + 30 : timing === "before" ? base - 30 : base;
}

const slotName = (s: Slot) => (s === "bed" ? "취침 전" : MEALS[s].label);

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
      <legend className="text-[15px] font-bold">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            aria-pressed={value === o.v}
            onClick={() => change(() => onPick(o.v))}
            className="h-11 rounded-[6px] border px-3.5 text-[15px] font-semibold"
            style={value === o.v ? { background: C.mint, color: "#fff", borderColor: C.mint } : { background: C.white, borderColor: C.line }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );

  return (
    <Panel
      id="pillbox"
      title="복약 달력"
      aside={
        <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-1.5 rounded-[6px] border bg-white px-3.5 text-[15px] font-semibold print:hidden" style={{ borderColor: C.line }}>
          <Printer size={17} aria-hidden />
          인쇄
        </button>
      }
    >
      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 print:hidden">
          {Choice({
            label: "복용 횟수",
            value: times,
            options: [
              { v: 1 as const, label: "하루 1회" },
              { v: 2 as const, label: "하루 2회" },
              { v: 3 as const, label: "하루 3회" },
            ],
            onPick: setTimes,
          })}
          {Choice({
            label: "복용 시점",
            value: timing,
            options: (Object.keys(TIMING_LABEL) as Timing[]).map((t) => ({ v: t, label: TIMING_LABEL[t] })),
            onPick: setTiming,
          })}
          {Choice({
            label: "복용 기간",
            value: days,
            options: [
              { v: 3 as const, label: "3일분" },
              { v: 5 as const, label: "5일분" },
              { v: 7 as const, label: "7일분" },
            ],
            onPick: setDays,
          })}
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 self-end text-[15px] font-bold">
            <input type="checkbox" checked={bed} onChange={(e) => change(() => setBed(e.target.checked))} className="h-5 w-5 accent-[#0b7a5f]" />
            취침 전 복용
          </label>
        </div>

        <div className="min-w-0">
          <p className="flex items-baseline justify-between gap-3 font-bold">
            <span>복용 완료</span>
            <span className="tabular-nums">
              <span style={{ color: C.mint }}>{takenCount}</span> / {total}회
            </span>
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: C.mintSoft }}>
            <div className="h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${total ? (takenCount / total) * 100 : 0}%`, background: C.mint }} />
          </div>

          <div className="mt-4 overflow-x-auto pb-2">
            <table className="w-full min-w-[420px] border-separate border-spacing-1 text-center">
              <caption className="sr-only">날짜별, 시간별 복약 칸</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-[76px]">
                    <span className="sr-only">복용 시간</span>
                  </th>
                  {start
                    ? dates.map((d, i) => (
                        <th key={i} scope="col" className="text-[14px] font-semibold" style={{ color: d.getDay() === 0 ? "#b3261e" : C.muted }}>
                          {`${d.getMonth() + 1}/${d.getDate()}`}
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
                      {slotName(s)}
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
                            aria-label={`${dates[d] ? `${dates[d].getMonth() + 1}월 ${dates[d].getDate()}일` : `${d + 1}일째`} ${slotName(s)} 복용${on ? " 완료" : ""}`}
                            className="relative block h-[56px] w-full overflow-hidden rounded-[6px] border [perspective:300px]"
                            style={{ borderColor: on ? C.mint : C.line, background: on ? C.mintSoft : C.white }}
                          >
                            <span className="absolute inset-0 flex items-center justify-center">
                              {on && <Check size={20} style={{ color: C.mint }} aria-hidden />}
                            </span>
                            <motion.span
                              aria-hidden
                              className="absolute inset-x-0 top-0 h-full rounded-[5px]"
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
          <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
            아침 08:00, 점심 12:30, 저녁 18:30 식사 기준입니다. 약사의 복약지도가 다르면 복약지도를 따르십시오.
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-4 pb-28 pt-10 md:px-6 print:hidden" style={{ background: C.mintDeep, color: "#e3f2ec" }}>
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
              <dt className="shrink-0">{k}</dt>
              <dd style={{ color: "#fff" }}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </footer>
  );
}
