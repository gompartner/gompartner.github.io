"use client";

import { useEffect, useRef, useState } from "react";
import { Gasoek_One, Nanum_Gothic_Coding } from "@/lib/local-fonts";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { maskName } from "@/components/demos/LeadReceivedPanel";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 팝업스토어 사전예약 랜딩 샘플: 가상의 곰파트너 붕어빵 연구소, 성수에서 7일만 여는 팝업.
   상호, 주소, 직원, 손님 이름은 모두 가상이다.

   크몽 랜딩페이지 고급 패키지("랜딩 고급") 범위. 맞춤 기능은 회차 예약.
   페이지 전체가 감열지 영수증 모양이다. 어두운 테이블 위에 영수증이 놓여 있다.

   성수 팝업들의 공통 구성(기간, 주소, 운영시간, 예약 오픈, 회차별 정원을 맨 위에, 사전예약 혜택,
   SNS 팔로우 증정, 선착순 구디백 안내)을 따른다. 현장 대기와 경품 추첨은 현장에서 하므로 안내 문구로만 둔다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 회차 예약: 날짜, 회차(남은 자리), 인원, 이름, 휴대폰. 완료하면 예약 번호와 확정 안내가 나온다.
   2. 첫 화면 오늘 회차: 누르면 그 회차가 골라진 채로 예약 폼으로 내려간다.
   3. 메뉴 영수증, 현장 안내, 오시는 길, 자주 묻는 질문. */

const mono = Nanum_Gothic_Coding;
const heavy = Gasoek_One;

const BRAND = "팝업스토어";
const IMG = "/images/demo-popup";
const ADDRESS = "서울 성동구 ㅇㅇ길 00, 1층";
const KAKAO = "카카오톡 채널 팝업스토어";
const CAP = 12;

const C = {
  table: "#262422",
  tableLine: "#3a3734",
  paper: "#fbfaf6",
  paperDim: "#f1eee6",
  ink: "#1c1c1c",
  red: "#d92b1a",
  faint: "#5f5a52",
  rule: "#9a958c",
  error: "#b42318",
};

const monoF = { fontFamily: `${mono.style.fontFamily}, ui-monospace, monospace` } as const;
const heavyF = { fontFamily: `${heavy.style.fontFamily}, var(--font-sfx), sans-serif`, fontWeight: 400 } as const;

/** 위아래가 톱니처럼 뜯긴 영수증 종이 */
const torn = {
  WebkitMask:
    "radial-gradient(circle 7px at 50% 0, #0000 98%, #000) 0 0/18px 51% repeat-x, radial-gradient(circle 7px at 50% 100%, #0000 98%, #000) 0 100%/18px 51% repeat-x",
  mask: "radial-gradient(circle 7px at 50% 0, #0000 98%, #000) 0 0/18px 51% repeat-x, radial-gradient(circle 7px at 50% 100%, #0000 98%, #000) 0 100%/18px 51% repeat-x",
} as const;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const redBtn = `inline-flex items-center justify-center gap-1.5 font-extrabold transition-[transform,background-color] duration-100 active:translate-y-[2px] ${focusRing}`;

const SLOTS = ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
/** 팝업은 어제 열어 7일 동안 한다. 예약은 오늘부터 고른다. */
const OPEN_OFFSET = -1;
const DAYS = 7;

/** 날짜·회차별로 이미 찬 자리. 실제로는 예약 시트에서 읽는다. 오늘 오전 회차는 지났으므로 마감. */
function taken(dayIdx: number, slot: number) {
  if (dayIdx === 0 && slot < 3) return CAP;
  let h = (dayIdx + 3) * 2654435761 + (slot + 7) * 40503;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 97;
  // 저녁 회차와 주말이 먼저 찬다
  const busy = slot >= 6 ? 4 : slot >= 3 ? 2 : 0;
  return Math.min(CAP, (h % 11) + busy);
}

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

type Pick = { day: number; slot: number | null };

export function LandingPopupStoreDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const start = daysAgo(today, -OPEN_OFFSET);
  const end = daysAgo(start, -(DAYS - 1));

  const [pick, setPick] = useState<Pick>({ day: 1, slot: null });

  const heroRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  const [formIn, setFormIn] = useState(false);
  useEffect(() => {
    const hero = heroRef.current;
    const form = document.getElementById("rc-reserve");
    if (!hero || !form) return;
    const a = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    const b = new IntersectionObserver(([e]) => setFormIn(e.isIntersecting), { threshold: 0 });
    a.observe(hero);
    b.observe(form);
    return () => {
      a.disconnect();
      b.disconnect();
    };
  }, []);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div
      className="min-h-screen overflow-x-hidden pb-28"
      style={{
        color: C.ink,
        backgroundColor: C.table,
        backgroundImage: `radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1.2px)`,
        backgroundSize: "5px 5px",
      }}
    >
      <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-4 md:px-6">
        <span className="inline-flex min-w-0 items-center gap-2" style={{ color: C.paper }}>
          <FishMark size={30} />
          <span className="flex flex-col whitespace-nowrap leading-none">
            <span className="text-[20px]" style={heavyF}>
              {BRAND}
            </span>
          </span>
        </span>
        <button type="button" onClick={() => go("rc-reserve")} className={`${redBtn} flex-none rounded-[3px] px-4 py-2 text-[15px] text-white`} style={{ background: C.red, outlineColor: C.paper }}>
          회차 예약
        </button>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <figure className="relative overflow-hidden rounded-[4px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img src={`${IMG}/store.jpg`} alt="성수동 골목 붉은 팝업 매장 앞에 줄 선 손님들" className="block aspect-[4/3] w-full object-cover sm:aspect-[21/9]" />
          <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-[14px] font-bold text-white md:px-6 md:pb-5 md:text-[16px]" style={monoF}>
            성수동 붕어빵 팝업, 매장에서 바로 구워요
          </figcaption>
        </figure>
      </div>

      {/* 첫 화면: 왼쪽 영수증(기본 정보와 오늘 회차), 오른쪽 예약 폼 */}
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 pt-2 md:px-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start lg:gap-10 lg:pt-6">
        <div ref={heroRef} className="mx-auto w-full max-w-[520px] lg:sticky lg:top-6 lg:max-w-none">
          <Receipt tilt={-0.6}>
            <HeroReceipt
              start={start}
              end={end}
              onPick={(slot) => {
                setPick({ day: 0, slot });
                go("rc-reserve");
              }}
              onReserve={() => go("rc-reserve")}
            />
          </Receipt>
        </div>

        <section id="rc-reserve" aria-labelledby="rc-reserve-title" className="scroll-mt-4">
          <ReserveForm today={today} reduce={reduce} pick={pick} setPick={setPick} />
        </section>
      </div>

      {/* 현장 안내와 혜택 */}
      <section id="rc-onsite" aria-labelledby="rc-onsite-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <TableHead id="rc-onsite-title" title="현장 안내" desc="예약 없이 오셔도 들어올 수 있어요. 혜택은 모두 매장 카운터에서 드려요." />
        <div className="grid gap-8 md:grid-cols-2 md:gap-6">
          <Receipt tilt={0.5}>
            <OnsiteReceipt />
          </Receipt>
          <Receipt tilt={-0.4}>
            <PerksReceipt />
          </Receipt>
        </div>
      </section>

      {/* 메뉴와 오시는 길 */}
      <section aria-labelledby="rc-menu-title" className="mx-auto mt-16 grid max-w-[1200px] gap-8 px-4 md:mt-24 md:grid-cols-2 md:gap-6 md:px-6">
        <Receipt tilt={0.4}>
          <MenuReceipt />
        </Receipt>
        <Receipt tilt={-0.5}>
          <InfoReceipt start={start} end={end} />
        </Receipt>
      </section>

      <section id="rc-faq" aria-labelledby="rc-faq-title" className="mx-auto mt-16 max-w-[1200px] px-4 md:mt-24 md:px-6">
        <TableHead id="rc-faq-title" title="자주 묻는 질문" />
        <Faq />
      </section>

      <footer className="mx-auto mt-16 max-w-[1200px] border-t px-4 pt-8 text-[14px] leading-[1.8] md:px-6" style={{ ...monoF, borderColor: C.tableLine, color: "rgba(251,250,246,0.7)" }}>
        <p className="text-[15px] font-bold" style={{ color: C.paper }}>
          {BRAND} 성수
        </p>
        <DemoMakerInfo className="mt-1" />
      </footer>

      {/* 첫 화면을 지나면 아래에 예약 버튼을 띄우고, 예약 폼이 보이면 숨긴다. 사용법 버튼과 겹치지 않게 위로 올린다. */}
      <AnimatePresence>
        {showBar && !formIn && (
          <motion.div
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 z-40 px-4 print:hidden"
            style={{ bottom: "calc(76px + env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="mx-auto flex max-w-[520px] items-center justify-between gap-3 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.45)]" style={{ background: C.paper, ...monoF }}>
              <p className="min-w-0 truncate text-[15px] font-bold">사전 예약하면 줄 없이 입장</p>
              <button type="button" onClick={() => go("rc-reserve")} className={`${redBtn} flex-none rounded-[3px] px-4 py-2 text-[16px] text-white`} style={{ background: C.red, outlineColor: C.ink, fontFamily: "var(--font-pretendard)" }}>
                예약하기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── 종이 조각 ─────────────────────────────────────────── */

/** 테이블 위 영수증 한 장. 그림자는 종이 모양을 따라가도록 바깥에서 drop-shadow로 준다. */
function Receipt({ children, tilt = 0, className = "", pad = "px-5 pb-8 pt-8 md:px-7" }: { children: React.ReactNode; tilt?: number; className?: string; pad?: string }) {
  return (
    <div className={`motion-safe:[transform:rotate(var(--tilt))] ${className}`} style={{ "--tilt": `${tilt}deg`, filter: "drop-shadow(0 12px 16px rgba(0,0,0,0.45))" } as React.CSSProperties}>
      <div className={`relative ${pad}`} style={{ background: C.paper, ...torn, ...monoF }}>
        {children}
      </div>
    </div>
  );
}

function Dash({ className = "" }: { className?: string }) {
  return <hr className={`my-4 border-0 border-t-2 border-dashed ${className}`} style={{ borderColor: C.rule }} />;
}

function Row({ k, v, big }: { k: React.ReactNode; v: React.ReactNode; big?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${big ? "text-[22px] font-bold" : "text-[15px] leading-[1.9]"}`}>
      <span>{k}</span>
      <b className="text-right font-bold tabular-nums">{v}</b>
    </div>
  );
}

function PaperTitle({ id, children, sub }: { id?: string; children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="text-center">
      <h2 id={id} className="text-[30px] leading-[1.15] md:text-[34px]" style={heavyF}>
        {children}
      </h2>
      {sub && <p className="mx-auto mt-2 max-w-[460px] text-[14px] leading-[1.6]" style={{ color: C.faint }}>{sub}</p>}
    </div>
  );
}

function TableHead({ id, title, desc }: { id?: string; title: string; desc?: string }) {
  return (
    <div className="mb-8">
      <h2 id={id} className="text-[34px] leading-[1.15] md:text-[48px]" style={{ ...heavyF, color: C.paper }}>
        {title}
      </h2>
      {desc && (
        <p className="mt-3 max-w-[620px] text-[16px] leading-[1.65]" style={{ ...monoF, color: "rgba(251,250,246,0.82)" }}>
          {desc}
        </p>
      )}
    </div>
  );
}

function FishMark({ size = 32, fill = C.red, stroke = C.paper }: { size?: number; fill?: string; stroke?: string }) {
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 52 32" aria-hidden className="flex-none">
      <path d="M4 16c6-10 22-13 32-6l10-7v26l-10-7C26 29 10 26 4 16z" fill={fill} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="13" cy="14" r="2.2" fill={stroke} />
      <path d="M20 11c3 3 3 7 0 10M26 10c3 3.5 3 8.5 0 12" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── 첫 화면 영수증 ───────────────────────────────────── */

function HeroReceipt({ start, end, onPick, onReserve }: { start: Date; end: Date; onPick: (slot: number) => void; onReserve: () => void }) {
  return (
    <>
      <p className="text-center text-[13px]">*** 성수 7일 한정 ***</p>
      <h1 className="mt-2 text-center text-[44px] leading-[1.05] md:text-[48px]" style={heavyF}>
        붕어빵 연구소
      </h1>
      <p className="mt-2 text-center text-[13px]">
        서울 성동구 ㅇㅇ길 00, {start.getMonth() + 1}.{start.getDate()}~{end.getMonth() + 1}.{end.getDate()}
      </p>
      <Dash />
      <Row k="영업" v="11:00 - 20:00" />
      <Row k="입장 마감" v="19:00" />
      <Row k="회차 정원" v={`${CAP}명 / 40분`} />
      <Row k="예약 오픈" v="매일 21:00" />
      <Row k="가까운 역" v="성수역 3번 6분" />
      <Dash />
      <p className="text-[15px] font-bold">오늘 남은 회차</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {SLOTS.map((t, s) => {
          const l = CAP - taken(0, s);
          const full = l <= 0;
          return (
            <button
              key={t}
              type="button"
              disabled={full}
              onClick={() => onPick(s)}
              aria-label={`오늘 ${t} 회차, ${full ? "마감" : `남은 자리 ${l}석. 누르면 예약 폼으로 이동`}`}
              className={`border-[1.5px] py-1.5 text-center text-[13px] tabular-nums transition-colors hover:bg-[#1c1c1c] hover:text-[#fbfaf6] disabled:cursor-not-allowed disabled:hover:bg-[#1c1c1c] ${focusRing}`}
              style={{ borderColor: C.ink, background: full ? C.ink : "transparent", color: full ? C.paper : C.ink, outlineColor: C.red }}
            >
              {t}, {full ? "마감" : l}
            </button>
          );
        })}
      </div>
      <Dash />
      <Row k="예약금" v="0원" />
      <Row k="현장 입장" v="예약 회차 사이" />
      <div className="mt-5">
        <button type="button" onClick={onReserve} className={`${redBtn} w-full py-3.5 text-[17px] text-white`} style={{ background: C.red, outlineColor: C.ink, fontFamily: "var(--font-pretendard)" }}>
          회차 고르고 예약하기
        </button>
      </div>
    </>
  );
}

/* ── 1. 회차 예약 ─────────────────────────────────────── */

type Done = { no: string; day: number; slot: number; people: number; name: string };

function ReserveForm({ today, reduce, pick, setPick }: { today: Date; reduce: boolean; pick: Pick; setPick: (p: Pick) => void }) {
  const days = Array.from({ length: DAYS + OPEN_OFFSET }, (_, i) => daysAgo(today, -i));
  const { day, slot } = pick;
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  const left = (d: number, s: number) => CAP - taken(d, s);
  const slotLeft = slot === null ? 0 : left(day, slot);
  const maxPeople = slot === null ? 4 : Math.max(1, Math.min(4, slotLeft));
  const shownPeople = Math.min(people, maxPeople);

  const phoneOk = /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.trim());
  const errs = {
    slot: slot === null ? "회차를 골라 주세요" : "",
    name: name.trim() ? "" : "예약자 이름을 적어 주세요",
    phone: phoneOk ? "" : "입장 문자를 받을 휴대폰 번호를 확인해 주세요",
    agree: agree ? "" : "개인정보 수집에 동의해 주세요",
  };
  const ok = Object.values(errs).every((e) => !e);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok || slot === null) return;
    const d = days[day];
    const no = `BR-${p2(d.getMonth() + 1)}${p2(d.getDate())}-${SLOTS[slot].slice(0, 2)}-${p2(CAP - slotLeft + 1)}`;
    const rec = { no, day, slot, people: shownPeople, name };
    setDone(rec);
    requestAnimationFrame(() => doneRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };

  const err = (k: keyof typeof errs) =>
    tried && errs[k] ? (
      <p className="mt-1.5 text-[14px] font-bold" style={{ color: C.error }}>
        {errs[k]}
      </p>
    ) : null;

  if (done) return <ReserveDone ref={doneRef} done={done} date={days[done.day]} />;

  const inputCls = `mt-2 w-full border-2 bg-white px-3 py-3 text-[17px] font-normal ${focusRing}`;

  return (
    <Receipt tilt={0.4} pad="px-5 pb-9 pt-9 md:px-9">
      <form onSubmit={submit} noValidate>
        <PaperTitle id="rc-reserve-title" sub="날짜와 시간을 고르면 남은 자리가 나와요. 한 번에 4명까지 예약해요.">
          사전 예약
        </PaperTitle>
        <Dash className="mt-6" />

        <fieldset>
          <legend className="text-[16px] font-bold">날짜</legend>
          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {days.map((d, i) => {
              const open = SLOTS.some((_, s) => left(i, s) > 0);
              const sel = day === i;
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={sel}
                  disabled={!open}
                  onClick={() => setPick({ day: i, slot: null })}
                  className={`border-2 py-2 text-center text-[15px] font-bold tabular-nums disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                  style={{ borderColor: C.ink, background: sel ? C.ink : "transparent", color: sel ? C.paper : d.getDay() === 0 ? C.error : C.ink, outlineColor: C.red }}
                >
                  <span className="block">
                    {d.getMonth() + 1}.{d.getDate()}
                  </span>
                  <span className="block text-[13px] font-normal">{i === 0 ? "오늘" : DOW[d.getDay()]}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-[16px] font-bold">회차</legend>
          <p className="mt-1 text-[13px]" style={{ color: C.faint }}>
            숫자는 남은 자리예요. 까만 칸은 마감.
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1.5 md:grid-cols-5 xl:grid-cols-9">
            {SLOTS.map((t, s) => {
              const l = left(day, s);
              const sel = slot === s;
              const full = l <= 0;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={sel}
                  disabled={full}
                  aria-label={`${t} 회차, ${full ? "마감" : `남은 자리 ${l}석`}`}
                  onClick={() => setPick({ day, slot: s })}
                  className={`border-2 px-1 pb-2 pt-1.5 text-center disabled:cursor-not-allowed ${focusRing}`}
                  style={{ borderColor: sel ? C.red : C.ink, background: sel ? C.red : full ? C.ink : "transparent", color: sel || full ? C.paper : C.ink, outlineColor: C.red }}
                >
                  <span className="block text-[15px] font-bold tabular-nums">{t}</span>
                  <span className="block text-[13px]">{full ? "마감" : `${l}석`}</span>
                  {!full && (
                    <span aria-hidden className="mx-auto mt-1 flex h-1.5 w-[84%] gap-[1.5px]">
                      {Array.from({ length: CAP }, (_, k) => (
                        <span key={k} className="h-full flex-1 border" style={{ borderColor: sel ? C.paper : C.ink, background: k < CAP - l ? (sel ? C.paper : C.ink) : "transparent" }} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {err("slot")}
        </fieldset>

        <div className="mt-6 grid gap-5 md:grid-cols-[180px_1fr_1fr]">
          <div>
            <p className="text-[16px] font-bold" id="rc-people-label">
              인원
            </p>
            <div className="mt-2 flex items-center gap-2" role="group" aria-labelledby="rc-people-label">
              <button type="button" onClick={() => setPeople(Math.max(1, shownPeople - 1))} disabled={shownPeople <= 1} aria-label="한 명 빼기" className={`grid h-12 w-12 place-items-center border-2 disabled:opacity-40 ${focusRing}`} style={{ borderColor: C.ink, outlineColor: C.red }}>
                <Minus size={18} aria-hidden />
              </button>
              <output className="w-12 text-center text-[22px] font-bold tabular-nums" aria-live="polite">
                {shownPeople}명
              </output>
              <button type="button" onClick={() => setPeople(Math.min(maxPeople, shownPeople + 1))} disabled={shownPeople >= maxPeople} aria-label="한 명 더하기" className={`grid h-12 w-12 place-items-center border-2 disabled:opacity-40 ${focusRing}`} style={{ borderColor: C.ink, outlineColor: C.red }}>
                <Plus size={18} aria-hidden />
              </button>
            </div>
          </div>
          <label className="block text-[16px] font-bold">
            예약자 이름
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="김ㅎ늘" autoComplete="name" className={inputCls} style={{ borderColor: C.ink, outlineColor: C.red }} />
            {err("name")}
          </label>
          <label className="block text-[16px] font-bold">
            휴대폰 번호
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" inputMode="tel" autoComplete="tel" className={inputCls} style={{ borderColor: C.ink, outlineColor: C.red }} />
            {err("phone")}
          </label>
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-2 text-[14px] leading-[1.6]">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 flex-none accent-[#d92b1a]" />
          <span>입장 문자를 보내려고 이름과 휴대폰 번호를 받아요. 팝업이 끝나고 7일 뒤 지워요. 동의합니다.</span>
        </label>
        {err("agree")}

        <Dash className="mt-6" />
        {slot !== null && (
          <div className="mb-4">
            <Row k="날짜" v={`${days[day].getMonth() + 1}.${days[day].getDate()} (${day === 0 ? "오늘" : DOW[days[day].getDay()]})`} />
            <Row k="회차" v={SLOTS[slot]} />
            <Row k="인원" v={`${shownPeople}명`} />
            <Row k="예약금" v="0원" />
          </div>
        )}
        <button type="submit" className={`${redBtn} w-full py-4 text-[19px] text-white`} style={{ background: C.red, outlineColor: C.ink, fontFamily: "var(--font-pretendard)" }}>
          {slot === null ? "예약하기" : "이 회차로 예약하기"}
        </button>
        <p className="mt-3 text-center text-[13px] leading-[1.6]" style={{ color: C.faint }}>
          예약금은 없어요. 연락 없이 안 오시면 그 주 남은 회차 예약이 막혀요.
        </p>
      </form>
    </Receipt>
  );
}

function ReserveDone({ ref, done, date }: { ref: React.Ref<HTMLDivElement>; done: Done; date: Date }) {
  return (
    <div ref={ref} className="scroll-mt-4" role="status">
      <Receipt tilt={0.4} pad="px-5 pb-9 pt-9 md:px-9">
        <PaperTitle sub="확정 문자를 보냈어요. 입장할 때 문자를 보여 주세요.">예약 완료</PaperTitle>
        <Dash className="mt-6" />
        <Row k="예약 번호" v={done.no} />
        <Row k="날짜" v={fmtKo(date)} />
        <Row k="회차" v={`${SLOTS[done.slot]} (40분)`} />
        <Row k="인원" v={`${done.people}명`} />
        <Row k="예약자" v={maskName(done.name)} />
        <Dash />
        <p className="text-[14px] leading-[1.7]">
          {SLOTS[done.slot]} 10분 전부터 오른쪽 예약 입구에 줄을 서 주세요. 10분 넘게 늦으면 현장 입장으로 바뀌어요.
        </p>
        <p className="mt-2 text-[14px] leading-[1.7]" style={{ color: C.faint }}>
          {done.day === 0 ? "오늘 회차를 못 오시면 " + KAKAO + "로 알려 주세요." : `취소나 변경은 ${fmtKo(daysAgo(date, 1))} 밤 11시까지 확정 문자 속 링크에서 해요.`}
        </p>
      </Receipt>
    </div>
  );
}

/* ── 2. 현장 안내, 혜택 ───────────────────────────────── */

function OnsiteReceipt() {
  return (
    <>
      <PaperTitle>예약 없이 오셨다면</PaperTitle>
      <Dash />
      <dl className="grid grid-cols-[76px_1fr] gap-x-3 gap-y-2 text-[14px] leading-[1.65]">
        <dt className="font-bold">현장 대기</dt>
        <dd>매장 앞 태블릿에 휴대폰 번호를 남기면 차례가 될 때 문자로 불러 드려요.</dd>
        <dt className="font-bold">입장</dt>
        <dd>예약 회차 사이사이에 현장 손님을 들여보내요. 주말 오후는 한 시간 넘게 기다릴 수 있어요.</dd>
        <dt className="font-bold">입장 마감</dt>
        <dd>19:00. 대기 등록도 이때 닫아요.</dd>
        <dt className="font-bold">재입장</dt>
        <dd>같은 날이면 손목 도장을 보여 주고 다시 들어와요.</dd>
      </dl>
    </>
  );
}

function PerksReceipt() {
  return (
    <>
      <PaperTitle>들어오면 받는 것</PaperTitle>
      <Dash />
      <ul className="grid gap-4 text-[14px] leading-[1.65]">
        <li>
          <p className="text-[16px] font-bold">선착순 구디백, 하루 300개</p>
          <p style={{ color: C.faint }}>예약 손님은 입장할 때, 현장 손님은 1만 원 넘게 사면 드려요. 다 나가면 그날은 끝나요.</p>
        </li>
        <li>
          <p className="text-[16px] font-bold">팔로우하면 붕어 키링</p>
          <p style={{ color: C.faint }}>인스타그램 공식 계정을 팔로우한 화면을 카운터에 보여 주세요.</p>
        </li>
        <li>
          <p className="text-[16px] font-bold">럭키드로우</p>
          <p style={{ color: C.faint }}>1만 원 넘게 사면 카운터에서 한 번 뽑아요. 붕어빵 한 마리, 굿즈 할인, 엽서가 들어 있어요.</p>
        </li>
      </ul>
    </>
  );
}

/* ── 3. 메뉴, 오시는 길 ───────────────────────────────── */

const MENU = [
  { id: "red-bean", name: "팥 붕어빵", unit: "3마리", price: 3000 },
  { id: "custard", name: "슈크림", unit: "3마리", price: 3500 },
  { id: "potato", name: "고구마 치즈", unit: "2마리", price: 4000 },
  { id: "sesame", name: "흑임자 크림", unit: "2마리", price: 4500, note: "하루 200마리" },
  { id: "keyring", name: "붕어 키링", unit: "1개", price: 12000 },
  { id: "ecobag", name: "팝업스토어 에코백", unit: "1개", price: 18000 },
];

function MenuReceipt() {
  return (
    <>
      <PaperTitle id="rc-menu-title" sub="매장에서 굽고 바로 내드려요.">
        메뉴
      </PaperTitle>
      <Dash />
      <table className="w-full text-left text-[15px]">
        <caption className="sr-only">팝업스토어 메뉴와 가격</caption>
        <thead>
          <tr className="text-[13px]" style={{ color: C.faint }}>
            <th scope="col" className="pb-2 font-normal">품목</th>
            <th scope="col" className="pb-2 text-right font-normal">수량</th>
            <th scope="col" className="pb-2 text-right font-normal">금액</th>
          </tr>
        </thead>
        <tbody>
          {MENU.map((m) => (
            <tr key={m.name}>
              <td className="py-1.5 pr-2">
                <span className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                  <img src={`${IMG}/menu-${m.id}.jpg`} alt="" className="h-12 w-12 flex-none rounded-[3px] object-cover" />
                  <span>
                    <span className="font-bold">{m.name}</span>
                    {m.note && (
                      <span className="block text-[12px]" style={{ color: C.red }}>
                        {m.note}
                      </span>
                    )}
                  </span>
                </span>
              </td>
              <td className="py-1.5 text-right tabular-nums">{m.unit}</td>
              <td className="whitespace-nowrap py-1.5 text-right font-bold tabular-nums">
                <span>{won(m.price)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dash />
      <Row k="결제" v="카드, 간편결제, 현금" />
      <Row k="포장" v="종이봉투 무료" />
    </>
  );
}

function InfoReceipt({ start, end }: { start: Date; end: Date }) {
  return (
    <>
      <PaperTitle id="rc-info-title">오시는 길</PaperTitle>
      <Dash />
      {/* 골목 약도: 감열지에 찍힌 것처럼 검은 선만 */}
      <svg viewBox="0 0 320 150" className="block h-auto w-full" role="img" aria-label="성수역 3번 출구에서 왼쪽 골목으로 들어가 두 번째 블록에 있는 팝업 매장 약도">
        <rect x="0" y="0" width="320" height="150" fill="none" />
        <path d="M0 112H320" stroke={C.ink} strokeWidth="10" />
        <path d="M0 112H320" stroke={C.paper} strokeWidth="1.5" strokeDasharray="8 8" />
        <path d="M150 0V112" stroke={C.ink} strokeWidth="6" />
        {[
          [12, 12, 120, 82],
          [168, 12, 60, 82],
          [244, 12, 64, 82],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill="none" stroke={C.ink} strokeWidth="1.5" strokeDasharray="2 3" />
        ))}
        <rect x="174" y="40" width="48" height="30" fill={C.red} />
        <text x="198" y="60" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.paper} style={monoF}>
          팝업
        </text>
        <rect x="22" y="124" width="72" height="20" fill={C.ink} />
        <text x="58" y="138" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.paper} style={monoF}>
          성수역 3번
        </text>
        <path d="M94 134 H140 V100 M134 106 L140 100 L146 106" fill="none" stroke={C.red} strokeWidth="2.5" />
      </svg>
      <Dash />
      <dl className="grid grid-cols-[76px_1fr] gap-x-3 gap-y-2 text-[14px] leading-[1.65]">
        <dt className="font-bold">기간</dt>
        <dd>
          {fmtKo(start)} ~ {fmtKo(end)}
        </dd>
        <dt className="font-bold">운영</dt>
        <dd>11:00 ~ 20:00, 입장 마감 19:00. 쉬는 날 없음</dd>
        <dt className="font-bold">주소</dt>
        <dd>{ADDRESS}</dd>
        <dt className="font-bold">지하철</dt>
        <dd>2호선 성수역 3번 출구로 나와 왼쪽 골목. 빨간 붕어 간판이 보이면 다 왔어요.</dd>
        <dt className="font-bold">주차</dt>
        <dd>건물 주차장은 없어요. 성수역 근처 공영주차장(걸어서 7분)을 쓰세요.</dd>
        <dt className="font-bold">문의</dt>
        <dd>{KAKAO}. 평일 오후 6시 전 질문은 그날 답해요.</dd>
      </dl>
    </>
  );
}

/* ── 4. 자주 묻는 질문 ────────────────────────────────── */

const FAQ = [
  { q: "반려동물과 들어가도 되나요?", a: "안거나 이동장에 넣으면 들어올 수 있어요. 빵을 굽는 곳이라 바닥에 내려놓지는 말아 주세요." },
  { q: "나갔다가 다시 들어와도 되나요?", a: "같은 날이면 손목 도장을 보여 주고 다시 들어오면 돼요. 구디백과 럭키드로우는 한 사람에 한 번이에요." },
  { q: "예약을 취소하거나 바꾸고 싶어요", a: "방문 전날 밤 11시까지 확정 문자 속 링크에서 취소하거나 회차를 바꿔요. 연락 없이 안 오시면 그 주 남은 회차 예약이 막혀요." },
  { q: "예약 없이 가도 되나요?", a: "매장 앞 태블릿에 대기 등록을 하고 들어와요. 주말 오후는 한 시간 넘게 걸릴 때가 많아서 사전 예약을 해 두는 게 나아요." },
  { q: "네이버 예약에서도 되나요?", a: "네이버 예약은 이 페이지와 같은 회차를 나눠 써요. 어디서 예약해도 자리는 같아요." },
  { q: "확정 문자를 지웠어요", a: "입구에서 예약자 이름과 휴대폰 뒷자리를 말해 주세요. 예약 명단에서 바로 찾아 드려요." },
];

function Faq() {
  return (
    <Receipt tilt={0.2} pad="px-5 pb-9 pt-7 md:px-9">
      <div className="divide-y-2 divide-dashed divide-[#9a958c]">
        {FAQ.map((f, i) => (
          <details key={f.q} className="group" style={{ borderColor: C.rule }}>
            <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-bold [&::-webkit-details-marker]:hidden ${focusRing}`} style={{ outlineColor: C.red }}>
              <span>
                <span className="tabular-nums" style={{ color: C.red }}>
                  Q{i + 1}.
                </span>{" "}
                {f.q}
              </span>
              <ChevronDown size={20} className="flex-none transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
            </summary>
            <p className="pb-4 text-[15px] leading-[1.75]" style={{ color: C.faint }}>
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </Receipt>
  );
}
