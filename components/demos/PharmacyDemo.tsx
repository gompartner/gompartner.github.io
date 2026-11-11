"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Menu,
  Phone,
  X,
} from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 약국 홈페이지 데모: 가상의 약국(상호는 곰파트너).
   상호, 약사 이름, 주소, 전화번호, 사업자 정보, 재고는 모두 가상이다. 약 이름은 상표 대신 성분과 용도로 적는다.

   뼈대: 운영 안내형. 대한약사회 휴일지킴이약국 상세 화면처럼
   첫 화면은 약국 정보 카드(주소, 운영시간, 약사)와 요일별 운영시간 표, 오시는 길 카드다.
   그 아래로 취급 품목 안내와 공지사항이 이어진다. 구간 제목은 흰 바탕 제목과 밑줄로 두고 설명 문단은 두지 않는다.

   디자인: 흰 바탕에 약국 초록(#0b7a5f), 옅은 민트(#e3f2ec).

   운영: 평일 09:00 ~ 익일 01:00(22:00 이후 공공심야약국), 토요일 09:00 ~ 18:00,
   일요일, 공휴일 휴무, 둘째, 넷째 일요일은 휴일지킴이약국으로 10:00 ~ 18:00. */

const IMG = "/images/demo-pharmacy";
const PHARMACY = "동네 약국";
const TEL = "02-000-0000";
const ADDRESS = "ㅎㄷ시 ㄷㅅ로 140 ㅅㄴ의원 건물 1층";

const C = {
  bg: "#f4f8f6",
  white: "#ffffff",
  mint: "#0b7a5f",
  mintDeep: "#075a46",
  ink: "#15211d",
  muted: "#52615b",
  line: "#dbe5e1",
};

const EASE = [0.22, 1, 0.36, 1] as const;

/* 하위 화면 묶음: 메디서비스 약국 템플릿 메뉴(약국소개, 약사소개, 운영시간, 오시는 길) + 이 약국 기능 */
type Page = "home" | "about" | "pharmacists" | "hours" | "items" | "notice" | "location";

const GROUPS: { id: string; label: string; items: { id: Page; label: string }[] }[] = [
  {
    id: "about",
    label: "약국소개",
    items: [
      { id: "about", label: "약국소개" },
      { id: "pharmacists", label: "약사소개" },
    ],
  },
  { id: "hours", label: "운영시간", items: [{ id: "hours", label: "운영시간" }] },
  { id: "items", label: "취급 품목", items: [{ id: "items", label: "취급 품목" }] },
  { id: "notice", label: "공지사항", items: [{ id: "notice", label: "공지사항" }] },
  { id: "location", label: "오시는 길", items: [{ id: "location", label: "오시는 길" }] },
];

const groupOf = (p: Page) => GROUPS.find((g) => g.items.some((it) => it.id === p)) ?? null;

const NAV = GROUPS.map((g) => ({ id: g.items[0].id, label: g.label }));

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

/* ---------- 페이지 ---------- */

export function PharmacyDemo() {
  const minute = useNowMinute();
  const [page, setPage] = useState<Page>("home");

  const go = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  // 사용법 가이드를 하위 화면에서 열면 첫 화면으로 돌아간다
  useEffect(() => {
    const f = () => {
      setPage("home");
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  let body: React.ReactNode = null;
  switch (page) {
    case "about":
      body = <AboutPage />;
      break;
    case "pharmacists":
      body = <PharmacistsPage />;
      break;
    case "hours":
      body = <HoursPage minute={minute} />;
      break;
    case "items":
      body = <Items />;
      break;
    case "notice":
      body = <Notices />;
      break;
    case "location":
      body = <Location />;
      break;
  }

  return (
    <div className="min-h-screen text-[17px] leading-[1.6]" style={{ background: C.bg, color: C.ink }}>
      <Header page={page} go={go} />
      <main className="px-4 pb-16 pt-5 md:px-6 md:pt-8">
        <div key={page} className="soft-in">
          {page === "home" ? (
            <div className="mx-auto max-w-[1200px] space-y-5 md:space-y-6">
              <Intro />
              <div className="grid items-start gap-5 md:gap-6 lg:grid-cols-[1.15fr_1fr]">
                <Hours minute={minute} />
                <Location />
              </div>
              <Items />
              <Notices />
            </div>
          ) : (
            <SubPage page={page} go={go}>
              {body}
            </SubPage>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ---------- 로고, 머리글, 영업 상태 띠 ---------- */

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex flex-col items-start whitespace-nowrap leading-[1.2] sm:flex-row sm:items-baseline sm:gap-1">
        <span className="text-[19px] font-bold tracking-[-0.02em]">동네 약국</span>
      </span>
    </span>
  );
}

function Header({ page, go }: { page: Page; go: (p: Page) => void }) {
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
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
        <button type="button" onClick={() => go("home")} aria-label={`${PHARMACY} 처음으로`}>
          <Logo />
        </button>
        <nav aria-label="주 메뉴" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-[16px] font-semibold">
            {NAV.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => go(n.id)}
                  aria-current={groupOf(page)?.label === n.label ? "page" : undefined}
                  className="transition-colors hover:text-[#0b7a5f]"
                  style={groupOf(page)?.label === n.label ? { color: C.mint } : undefined}
                >
                  {n.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
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
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      go(n.id);
                    }}
                    aria-current={groupOf(page)?.label === n.label ? "page" : undefined}
                    className="flex h-12 w-full items-center text-left text-[17px] font-semibold"
                    style={groupOf(page)?.label === n.label ? { color: C.mint } : undefined}
                  >
                    {n.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------- 하위 화면 ---------- */

function SubPage({ page, go, children }: { page: Page; go: (p: Page) => void; children: React.ReactNode }) {
  const group = groupOf(page)!;
  const label = group.items.find((it) => it.id === page)?.label ?? group.label;
  const headRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headRef.current?.focus({ preventScroll: true });
  }, [page]);

  return (
    <div className="mx-auto max-w-[1200px]">
      <nav aria-label="현재 위치" className="print:hidden">
        <ol className="flex flex-wrap items-center gap-1.5 text-[15px]" style={{ color: C.muted }}>
          <li>
            <button type="button" onClick={() => go("home")} className="inline-flex h-9 items-center hover:underline">
              홈
            </button>
          </li>
          <li aria-hidden>
            <ChevronRight size={14} />
          </li>
          <li aria-current={group.items.length > 1 ? undefined : "page"}>{group.label}</li>
          {group.items.length > 1 && (
            <>
              <li aria-hidden>
                <ChevronRight size={14} />
              </li>
              <li aria-current="page" className="font-semibold" style={{ color: C.ink }}>
                {label}
              </li>
            </>
          )}
        </ol>
      </nav>
      <h1 ref={headRef} tabIndex={-1} className="mt-1 text-[28px] font-bold tracking-[-0.03em] outline-none md:text-[34px] print:hidden">
        {label}
      </h1>
      {group.items.length > 1 && (
        <ul className="mt-4 flex gap-1 border-b print:hidden" style={{ borderColor: C.line }}>
          {group.items.map((it) => {
            const on = it.id === page;
            return (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => go(it.id)}
                  aria-current={on ? "page" : undefined}
                  className="-mb-px inline-flex h-12 items-center border-b-[3px] px-3.5 text-[16px] font-bold"
                  style={on ? { borderColor: C.mint, color: C.mint } : { borderColor: "transparent", color: C.muted }}
                >
                  {it.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-5 space-y-5 md:mt-6 md:space-y-6">{children}</div>
    </div>
  );
}

function AboutPage() {
  const rows: [string, React.ReactNode][] = [
    ["약국명", PHARMACY],
    ["주소", ADDRESS],
    [
      "전화번호",
      <a key="tel" href={`tel:${TEL}`} className="font-semibold underline underline-offset-4 tabular-nums">
        {TEL}
      </a>,
    ],
    ["팩스번호", "02-000-0001"],
    ["개설 약사", "박ㅎ준"],
  ];
  return (
    <>
      <section aria-labelledby="about-title" className="overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: C.line }}>
        <div className="relative h-[200px] md:h-[320px]">
          <Image src={`${IMG}/hero.jpg`} alt="흰 선반에 약상자가 정리된 밝은 약국 안과 나무 상담대" fill sizes="(min-width: 1248px) 1200px, 100vw" className="object-cover" style={{ objectPosition: "35% center" }} />
        </div>
        <div className="p-4 md:p-6">
          <h2 id="about-title" className="text-[22px] font-bold tracking-[-0.02em] md:text-[26px]">
            안녕하세요. {PHARMACY}입니다.
          </h2>
          <ul className="mt-3 space-y-1 text-[16px]">
            <li>병원, 의원 처방조제 가능합니다.</li>
            <li>약사 상담 가능합니다.</li>
            <li>동물약도 취급합니다.</li>
          </ul>
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="약국 특성">
            {["공공심야약국", "휴일지킴이약국", "동물약취급", "주차"].map((t) => (
              <li key={t} className="rounded-[4px] border px-2 py-0.5 text-[14px] font-semibold" style={{ borderColor: C.mint, color: C.mintDeep }}>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Panel id="about-info" title="약국 정보">
        <dl className="grid border-t text-[16px] sm:grid-cols-2" style={{ borderColor: C.line }}>
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-3 border-b py-2.5 sm:pr-4" style={{ borderColor: C.line }}>
              <dt className="w-[80px] shrink-0" style={{ color: C.muted }}>
                {k}
              </dt>
              <dd className="min-w-0 font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </>
  );
}

const PHARMACISTS = [
  {
    role: "대표약사",
    name: "박ㅎ준",
    career: ["ㅂㄹ대학교 약학대학 졸업", "ㅂㄹ대학교병원 약제부 근무", "ㅂㄹ대학교 약학대학 프리셉터", "ㅎㄷ시약사회 약바로쓰기 운동본부 강사"],
  },
  {
    role: "근무약사",
    name: "김ㅅ희",
    career: ["ㅂㄹ대학교 약학대학 졸업", "ㅁㄹ병원 약제과 근무", "대한약사회 인증 스포츠약사"],
  },
];

function PharmacistsPage() {
  return (
    <div className="grid gap-5 md:grid-cols-2 md:gap-6">
      {PHARMACISTS.map((p, i) => (
        <section key={p.name} aria-labelledby={`ph-${p.name}`} className="min-w-0 rounded-[10px] border bg-white p-4 md:p-6" style={{ borderColor: C.line }}>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
            <img
              src={`${IMG}/staff-${i + 1}.jpg`}
              alt={`${p.role} ${p.name}`}
              width={80}
              height={96}
              loading="lazy"
              className="h-24 w-20 flex-none rounded-[10px] object-cover"
              style={{ objectPosition: "50% 20%", background: C.line }}
            />
            <div className="min-w-0">
              <p className="text-[15px] font-semibold" style={{ color: C.mint }}>
                {p.role}
              </p>
              <h2 id={`ph-${p.name}`} className="text-[24px] font-bold tracking-[-0.02em]">
                {p.name}
              </h2>
            </div>
          </div>
          <ul className="mt-3 border-t" style={{ borderColor: C.line }}>
            {p.career.map((c) => (
              <li key={c} className="border-b py-2.5 text-[16px]" style={{ borderColor: C.line }}>
                {c}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function HoursPage({ minute }: { minute: number }) {
  const rows: [string, string][] = [
    ["평일 운영시간", "09:00 ~ 익일 01:00"],
    ["토요일 운영시간", "09:00 ~ 18:00"],
    ["일요일 운영시간", "휴무 (둘째, 넷째 일요일 10:00 ~ 18:00)"],
    ["공휴일 운영시간", "휴무"],
    ["공공심야약국", "평일 22:00 ~ 익일 01:00"],
    ["정기휴무", "매주 일요일, 공휴일"],
  ];
  return (
    <div className="grid items-start gap-5 md:gap-6 lg:grid-cols-[1.15fr_1fr]">
      <Hours minute={minute} />
      <Panel id="hours-info" title="운영시간 안내">
        <dl>
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-3 border-b py-2.5 first:pt-0" style={{ borderColor: C.line }}>
              <dt className="w-[128px] shrink-0 font-semibold" style={{ color: C.muted }}>
                {k}
              </dt>
              <dd className="min-w-0 tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
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
    ["약사", "개설 약사 박ㅎ준 외 1명"],
  ];

  return (
    <section id="top" aria-labelledby="pharmacy-name" className="scroll-mt-32 overflow-hidden rounded-[10px] border bg-white print:hidden" style={{ borderColor: C.line }}>
      <div className="relative h-[200px] md:h-[360px]">
        <Image src={`${IMG}/hero.jpg`} alt="흰 선반에 약상자가 정리된 밝은 약국 안과 나무 상담대" fill priority sizes="(min-width: 1248px) 1200px, 100vw" className="object-cover" style={{ objectPosition: "35% center" }} />
      </div>
      <div className="p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h1 id="pharmacy-name" className="text-[28px] font-bold leading-[1.25] tracking-[-0.03em] md:text-[36px]">
            새벽 1시까지 여는 동네 약국
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
      </div>
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
  { label: "일요일", days: [0], time: "휴무", note: "둘째, 넷째 일요일 휴일지킴이약국 10:00 ~ 18:00" },
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
    ["지하철", ["ㅎㅅ역 1번 출구에서 ㅅㄴ의원 방향 50m"]],
    ["버스", ["ㅅㄴ의원 앞 정류장 하차, 간선 000, 지선 0000"]],
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

/* ---------- 취급 품목 ---------- */

const ITEMS: { kind: string; list: string[] }[] = [
  { kind: "처방조제", list: ["병원, 의원 처방전 조제", "의약품 복약지도", "복용 중인 약 상담"] },
  { kind: "일반의약품", list: ["해열진통제, 감기약", "소화제, 제산제, 지사제", "파스, 상처 연고, 인공눈물"] },
  { kind: "건강기능식품", list: ["종합비타민, 비타민 D", "프로바이오틱스", "오메가-3"] },
  { kind: "의약외품, 의료기기", list: ["보건용 마스크, 손 소독제", "습윤 밴드, 전자 체온계", "가정용 혈압계"] },
  { kind: "동물약", list: ["심장사상충 예방약", "구충제", "외부 기생충 예방약"] },
];

function Items() {
  return (
    <Panel id="items" title="취급 품목">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((it) => (
          <li key={it.kind} className="rounded-[6px] border p-4" style={{ borderColor: C.line }}>
            <h3 className="text-[17px] font-bold" style={{ color: C.mintDeep }}>
              {it.kind}
            </h3>
            <ul className="mt-2 space-y-1 text-[16px]">
              {it.list.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
        찾으시는 품목은 전화로 문의해 주세요. {TEL}
      </p>
    </Panel>
  );
}

/* ---------- 공지사항 ---------- */

const NOTICES: { title: string; ago: number }[] = [
  { title: "11월 휴일지킴이약국 운영일 안내", ago: 2 },
  { title: "독감 유행 시기 해열진통제 복용 안내", ago: 9 },
  { title: "공공심야약국 운영시간 안내", ago: 21 },
  { title: "가정 내 남은 약 수거함 운영", ago: 34 },
];

function Notices() {
  const today = useDemoToday();
  return (
    <Panel id="notice" title="공지사항">
      <ul className="border-t" style={{ borderColor: C.line }}>
        {NOTICES.map((n) => (
          <li key={n.title} className="flex items-baseline justify-between gap-3 border-b py-3" style={{ borderColor: C.line }}>
            <span className="min-w-0 font-medium">{n.title}</span>
            <span className="shrink-0 text-[14px] tabular-nums" style={{ color: C.muted }}>
              {fmtDot(daysAgo(today, n.ago))}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}


/* ---------- 바닥글 ---------- */

function Footer() {
  return (
    <footer className="px-4 pb-28 pt-10 md:px-6 print:hidden" style={{ background: C.mintDeep, color: "#e3f2ec" }}>
      <div className="mx-auto max-w-[1200px]">
        <Logo />
        <DemoMakerInfo className="mt-6" />
      </div>
    </footer>
  );
}
