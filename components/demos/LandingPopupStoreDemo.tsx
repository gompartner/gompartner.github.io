"use client";

import { useEffect, useRef, useState } from "react";
import { Gasoek_One, Nanum_Gothic_Coding } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Minus, Plus, RotateCcw, Scissors } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { Barcode, RealQr } from "@/components/demos/eventPrint";
import { daysAgo, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 팝업스토어 사전예약 랜딩 샘플: 가상의 곰파트너 붕어빵 연구소, 성수에서 7일만 여는 팝업.
   상호, 주소, 직원, 손님 이름은 모두 가상이다.

   크몽 랜딩페이지 고급 패키지("랜딩 고급") 범위. 맞춤 기능은 회차 예약.
   페이지 전체가 감열지 영수증과 발권기다. 어두운 테이블 위에 영수증이 놓여 있고,
   예약하면 새 입장권이 프린터에서 인쇄돼 나오고, 웨이팅은 뜯어 가는 번호표, 돌림판 결과는 잘라 쓰는 쿠폰이다.

   성수 팝업들의 공통 구성(기간·주소·운영시간·예약 오픈·회차별 정원을 맨 위에, 사전예약 혜택·SNS 팔로우 증정·
   100% 당첨 뽑기·선착순 구디백)을 그대로 따른다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 회차 발권: 날짜, 회차(남은 자리), 인원, 이름·휴대폰. 완료하면 예약 번호, 바코드, 입장 QR이 찍힌 입장권이 인쇄된다.
   2. 현장 웨이팅: 번호표를 뽑으면 앞 팀 수가 몇 초마다 줄어든다.
   3. 혜택: 구디백 남은 수량, SNS 인증 체크, 100% 당첨 돌림판(결과는 쿠폰).
   4. 메뉴 영수증, 오시는 길, 자주 묻는 질문. */

const mono = Nanum_Gothic_Coding({ weight: ["400", "700"], preload: false, display: "swap" });
const heavy = Gasoek_One({ weight: "400", preload: false, display: "swap" });

const BRAND = "곰파트너";
const ADDRESS = "서울 성동구 ㅇㅇ길 00, 1층";
const KAKAO = "카카오톡 채널 곰파트너";
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
const TEAM_MIN = 4;

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
  const [queue, setQueue] = useState(23);
  const [ticket, setTicket] = useState<{ no: number; ahead: number; people: number; phone: string } | null>(null);

  // 데모라 몇 초마다 한 팀씩 들어간다. 실제로는 매장 태블릿에서 입장 처리할 때 줄어든다.
  useEffect(() => {
    const id = window.setInterval(() => {
      setTicket((t) => (t && t.ahead > 0 ? { ...t, ahead: t.ahead - 1 } : t));
      setQueue((q) => (q > 12 ? q - 1 : q + 3));
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

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
  const no = `${today.getFullYear()}-${p2(today.getMonth() + 1)}${p2(today.getDate())}-00${queue}`;

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
            <span className="mt-1 text-[12px] font-bold opacity-70" style={monoF}>
              팝업스토어 샘플
            </span>
          </span>
        </span>
        <button type="button" onClick={() => go("rc-reserve")} className={`${redBtn} flex-none rounded-[3px] px-4 py-2 text-[15px] text-white`} style={{ background: C.red, outlineColor: C.paper }}>
          회차 예약
        </button>
      </header>

      {/* 첫 화면: 왼쪽 영수증(기본 정보와 오늘 회차), 오른쪽 발권기 */}
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 pt-2 md:px-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start lg:gap-10 lg:pt-6">
        <div ref={heroRef} className="mx-auto w-full max-w-[520px] lg:sticky lg:top-6 lg:max-w-none">
          <Receipt tilt={-0.6}>
            <HeroReceipt
              start={start}
              end={end}
              queue={queue}
              no={no}
              onPick={(slot) => {
                setPick({ day: 0, slot });
                go("rc-reserve");
              }}
              onReserve={() => go("rc-reserve")}
              onWait={() => go("rc-wait")}
            />
          </Receipt>
        </div>

        <section id="rc-reserve" aria-labelledby="rc-reserve-title" className="scroll-mt-4">
          <ReserveForm today={today} reduce={reduce} pick={pick} setPick={setPick} />
        </section>
      </div>

      {/* 현장 웨이팅 */}
      <section id="rc-wait" aria-labelledby="rc-wait-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <TableHead id="rc-wait-title" title="예약을 놓쳤다면" desc="번호표만 뽑고 근처에 계세요. 앞 팀이 3팀 남으면 문자로 불러요." />
        <WaitingBoard reduce={reduce} queue={queue} ticket={ticket} setTicket={setTicket} />
      </section>

      {/* 혜택 */}
      <section id="rc-perks" aria-labelledby="rc-perks-title" className="mx-auto mt-16 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <TableHead id="rc-perks-title" title="들어오면 받는 것" desc="구디백은 하루 300개, 돌림판은 한 사람에 한 번이에요." />
        <div className="grid gap-8 md:grid-cols-2 md:gap-6">
          <Receipt tilt={0.5}>
            <GoodieGauge reduce={reduce} />
          </Receipt>
          <Receipt tilt={-0.4}>
            <SnsCheck />
          </Receipt>
        </div>
        <Roulette reduce={reduce} />
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
          {BRAND} 성수 팝업
        </p>
        <DemoMakerInfo className="mt-1" />
      </footer>

      {/* 첫 화면을 지나면 아래에 발권 버튼을 띄우고, 발권기가 보이면 숨긴다. 사용법 버튼과 겹치지 않게 위로 올린다. */}
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
              <p className="min-w-0 truncate text-[15px] font-bold">대기 {queue}팀 · 예약은 줄 없음</p>
              <button type="button" onClick={() => go("rc-reserve")} className={`${redBtn} flex-none rounded-[3px] px-4 py-2 text-[16px] text-white`} style={{ background: C.red, outlineColor: C.ink, fontFamily: "var(--font-pretendard)" }}>
                발권하기
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

/** 빨간 고무 도장 */
function RubberStamp({ children, className = "", rotate = -12, size = "text-[19px]" }: { children: React.ReactNode; className?: string; rotate?: number; size?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute select-none whitespace-nowrap rounded-[6px] border-[3px] px-2.5 py-1 font-black ${size} ${className}`}
      style={{ color: C.red, borderColor: C.red, transform: `rotate(${rotate}deg)`, opacity: 0.82, mixBlendMode: "multiply", fontFamily: "var(--font-pretendard)", boxShadow: `inset 0 0 0 1.5px ${C.paper}, inset 0 0 0 3px ${C.red}` }}
    >
      {children}
    </span>
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

function HeroReceipt({ start, end, queue, no, onPick, onReserve, onWait }: { start: Date; end: Date; queue: number; no: string; onPick: (slot: number) => void; onReserve: () => void; onWait: () => void }) {
  return (
    <>
      <p className="text-center text-[13px]">*** 성수 7일 한정 ***</p>
      <h1 className="mt-2 text-center text-[44px] leading-[1.05] md:text-[48px]" style={heavyF}>
        {BRAND}
      </h1>
      <p className="mt-2 text-center text-[13px]">
        서울 성동구 ㅇㅇ길 00 · {start.getMonth() + 1}.{start.getDate()}~{end.getMonth() + 1}.{end.getDate()}
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
              aria-label={`오늘 ${t} 회차, ${full ? "마감" : `남은 자리 ${l}석. 누르면 발권기로 이동`}`}
              className={`border-[1.5px] py-1.5 text-center text-[13px] tabular-nums transition-colors hover:bg-[#1c1c1c] hover:text-[#fbfaf6] disabled:cursor-not-allowed disabled:hover:bg-[#1c1c1c] ${focusRing}`}
              style={{ borderColor: C.ink, background: full ? C.ink : "transparent", color: full ? C.paper : C.ink, outlineColor: C.red }}
            >
              {t} · {full ? "마감" : l}
            </button>
          );
        })}
      </div>
      <Dash />
      <div aria-live="polite" className="relative">
        <RubberStamp className="left-[22%] top-[-6px] md:left-[24%]">줄 서지 마세요</RubberStamp>
        <Row big k="대기" v={`${queue}팀`} />
        <p className="mt-1 text-right text-[13px]" style={{ color: C.faint }}>
          지금 줄 서면 약 {queue * TEAM_MIN}분
        </p>
      </div>
      <div className="mt-4">
        <Barcode value={no} />
        <p className="mt-1 text-center text-[13px] tabular-nums">NO. {no}</p>
      </div>
      <div className="mt-5 grid gap-2">
        <button type="button" onClick={onReserve} className={`${redBtn} w-full py-3.5 text-[17px] text-white`} style={{ background: C.red, outlineColor: C.ink, fontFamily: "var(--font-pretendard)" }}>
          회차 고르고 발권하기
        </button>
        <button type="button" onClick={onWait} className={`${redBtn} w-full border-2 py-3 text-[16px]`} style={{ borderColor: C.ink, outlineColor: C.red, fontFamily: "var(--font-pretendard)" }}>
          오늘 바로 가요. 번호표 뽑기
        </button>
      </div>
    </>
  );
}

/* ── 1. 회차 발권 ─────────────────────────────────────── */

type Done = { no: string; day: number; slot: number; people: number; name: string; phone: string };

function ReserveForm({ today, reduce, pick, setPick }: { today: Date; reduce: boolean; pick: Pick; setPick: (p: Pick) => void }) {
  const days = Array.from({ length: DAYS + OPEN_OFFSET }, (_, i) => daysAgo(today, -i));
  const { day, slot } = pick;
  const [people, setPeople] = useState(2);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [booked, setBooked] = useState<Done[]>([]);
  const doneRef = useRef<HTMLDivElement>(null);

  const left = (d: number, s: number) => CAP - taken(d, s) - booked.filter((b) => b.day === d && b.slot === s).reduce((n, b) => n + b.people, 0);
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
    const rec = { no, day, slot, people: shownPeople, name, phone };
    setDone(rec);
    setBooked((v) => [...v, rec]);
    requestAnimationFrame(() => doneRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };

  const reset = () => {
    setDone(null);
    setTried(false);
    setPick({ day, slot: null });
    setName("");
    setPhone("");
    setAgree(false);
  };

  const err = (k: keyof typeof errs) =>
    tried && errs[k] ? (
      <p className="mt-1.5 text-[14px] font-bold" style={{ color: C.error }}>
        {errs[k]}
      </p>
    ) : null;

  if (done) return <PrintedTicket ref={doneRef} done={done} date={days[done.day]} left={left(done.day, done.slot)} reduce={reduce} onAgain={reset} />;

  const inputCls = `mt-2 w-full border-2 bg-white px-3 py-3 text-[17px] font-normal ${focusRing}`;

  return (
    <Receipt tilt={0.4} pad="px-5 pb-9 pt-9 md:px-9">
      <form onSubmit={submit} noValidate>
        <PaperTitle id="rc-reserve-title" sub="날짜와 시간을 고르면 남은 자리가 나와요. 한 번에 4명까지 발권해요.">
          회차 발권
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
          {slot === null ? "발권하기" : `이 회차로 발권하기`}
        </button>
        <p className="mt-3 text-center text-[13px] leading-[1.6]" style={{ color: C.faint }}>
          예약금은 없어요. 연락 없이 안 오시면 그 주 남은 회차 예약이 막혀요.
        </p>
      </form>
    </Receipt>
  );
}

/** 발권하면 프린터 입구에서 입장권이 한 줄씩 밀려 나온다. 동작 줄이기를 켜면 바로 보인다. */
function PrintedTicket({ ref, done, date, left, reduce, onAgain }: { ref: React.Ref<HTMLDivElement>; done: Done; date: Date; left: number; reduce: boolean; onAgain: () => void }) {
  return (
    <div ref={ref} className="scroll-mt-4" role="status">
      {/* 프린터 입구 */}
      <div className="relative z-10 mx-auto flex h-11 max-w-[560px] items-center justify-between rounded-[6px] px-4 shadow-[0_6px_14px_rgba(0,0,0,0.5)]" style={{ background: "#121110", ...monoF, color: "rgba(251,250,246,0.75)" }}>
        <span className="text-[13px]">발권기 01</span>
        <span className="flex items-center gap-1.5 text-[13px]">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#3ad16b" }} /> 인쇄 완료
        </span>
        <span aria-hidden className="absolute inset-x-6 bottom-1.5 h-[3px] rounded-full" style={{ background: "#000" }} />
      </div>
      <div className="mx-auto -mt-1 max-w-[520px] overflow-hidden pb-6">
        <motion.div
          initial={reduce ? false : { y: "-100%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1.6, ease: (t: number) => Math.floor(t * 18) / 18 }}
        >
          <Receipt pad="px-5 pb-9 pt-8 md:px-8">
            <p className="text-center text-[13px]">*** 입장권 ***</p>
            <p className="mt-1 text-center text-[30px] leading-[1.1]" style={heavyF}>
              {BRAND}
            </p>
            <Dash />
            <p className="text-[13px]" style={{ color: C.faint }}>
              예약 번호
            </p>
            <p className="text-[28px] font-bold tabular-nums md:text-[32px]">{done.no}</p>
            <Dash />
            <Row k="날짜" v={fmtKo(date)} />
            <Row k="회차" v={`${SLOTS[done.slot]} (40분)`} />
            <Row k="인원" v={`${done.people}명`} />
            <Row k="예약자" v={maskName(done.name)} />
            <Row k="연락처" v={maskPhone(done.phone)} />
            <Dash />
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <div className="border-2 bg-white p-1.5" style={{ borderColor: C.ink }}>
                <RealQr value={`GOMPARTNER ${done.no} ${done.people}P`} label={`입장 QR, 예약 번호 ${done.no}`} />
              </div>
              <p className="text-[14px] leading-[1.6]">
                {SLOTS[done.slot]} 10분 전부터 오른쪽 예약 입구에서 이 QR을 보여 주세요. 10분 넘게 늦으면 현장 웨이팅으로 바뀌어요.
              </p>
            </div>
            <Dash />
            <dl className="grid grid-cols-[76px_1fr] gap-x-3 gap-y-2 text-[14px] leading-[1.6]">
              <dt className="font-bold">확정 문자</dt>
              <dd>지금 보냈어요. 5분 안에 안 오면 아래 창구로 알려 주세요.</dd>
              <dt className="font-bold">취소</dt>
              <dd>{done.day === 0 ? "오늘 회차는 링크로 못 바꿔요. 못 오시면 창구로 꼭 알려 주세요." : `${fmtKo(daysAgo(date, 1))} 밤 11시까지 문자 속 링크에서 해요.`}</dd>
              <dt className="font-bold">담당 창구</dt>
              <dd>팝업 운영팀 오ㅅ진 매니저. {KAKAO}. 오후 6시 전에 남긴 질문은 그날 답해요.</dd>
            </dl>
            <div className="mt-5">
              <Barcode value={done.no} />
              <p className="mt-1 text-center text-[13px] tabular-nums">{done.no}</p>
            </div>
            <RubberStamp className="right-4 top-[96px]" rotate={9} size="text-[17px]">
              발권 완료
            </RubberStamp>
          </Receipt>
        </motion.div>
      </div>
      {/* 운영팀이 받는 알림 */}
      <div className="mx-auto max-w-[520px] border-l-4 px-4 py-3 text-[14px] leading-[1.6]" style={{ ...monoF, borderColor: C.red, background: "rgba(251,250,246,0.08)", color: C.paper }}>
        <p className="font-bold">운영팀 휴대폰에 온 알림</p>
        <p className="mt-1">
          새 예약 {fmtKo(date)} {SLOTS[done.slot]} {done.people}명 {maskName(done.name)}
        </p>
        <p className="mt-1 opacity-80">
          남은 자리 {left + done.people}석에서 {left}석
        </p>
      </div>
      <div className="mx-auto mt-4 max-w-[520px]">
        <button type="button" onClick={onAgain} className={`inline-flex items-center gap-1.5 text-[15px] font-bold underline underline-offset-4 ${focusRing}`} style={{ color: C.paper, outlineColor: C.paper }}>
          <RotateCcw size={16} aria-hidden /> 다른 회차로 한 장 더 발권하기
        </button>
      </div>
    </div>
  );
}

/* ── 2. 현장 웨이팅 ───────────────────────────────────── */

type WaitTicket = { no: number; ahead: number; people: number; phone: string };

function WaitingBoard({ reduce, queue, ticket, setTicket }: { reduce: boolean; queue: number; ticket: WaitTicket | null; setTicket: (t: WaitTicket | null) => void }) {
  const [people, setPeople] = useState(2);
  const [phone, setPhone] = useState("");
  const [tried, setTried] = useState(false);
  const phoneOk = /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.trim());

  const take = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!phoneOk) return;
    setTicket({ no: 140 + queue, ahead: queue, people, phone });
  };
  const total = ticket ? Math.max(ticket.no - 140, 1) : 1;

  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-6">
      {/* 번호표 발행기 */}
      <div className="rounded-[10px] p-5 shadow-[0_12px_20px_rgba(0,0,0,0.45)] md:p-7" style={{ background: "#151413", color: C.paper, ...monoF }}>
        <div className="flex items-center justify-between text-[13px]" style={{ color: "rgba(251,250,246,0.7)" }}>
          <span>번호표 발행기</span>
          <span>매장 앞</span>
        </div>
        <div className="mt-4 rounded-[6px] px-4 py-4" style={{ background: "#0b0a0a", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.8)" }} aria-live="polite">
          <p className="text-[13px]" style={{ color: "rgba(255,120,100,0.75)" }}>
            지금 기다리는 팀
          </p>
          <p className="mt-1 flex items-baseline gap-3">
            <span className="text-[64px] font-bold leading-none tabular-nums md:text-[76px]" style={{ color: "#ff5a43", textShadow: "0 0 12px rgba(255,90,67,0.55)" }}>
              {p2(queue)}
            </span>
            <span className="text-[18px] font-bold">팀 · 약 {queue * TEAM_MIN}분</span>
          </p>
        </div>
        <p className="mt-4 text-[14px] leading-[1.65]" style={{ color: "rgba(251,250,246,0.8)" }}>
          한 팀이 들어가는 데 4분쯤 걸려요. 예약 회차 사이사이에 웨이팅 손님을 들여보내요.
        </p>

        {!ticket && (
          <form onSubmit={take} noValidate className="mt-6 grid gap-4">
            <fieldset>
              <legend className="text-[15px] font-bold">인원</legend>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} type="button" aria-pressed={people === n} onClick={() => setPeople(n)} className={`border-2 py-2.5 text-[16px] font-bold ${focusRing}`} style={{ borderColor: C.paper, background: people === n ? C.paper : "transparent", color: people === n ? C.ink : C.paper, outlineColor: "#ff5a43" }}>
                    {n}명
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block text-[15px] font-bold">
              문자 받을 번호
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" inputMode="tel" autoComplete="tel" className={`mt-2 w-full border-2 bg-white px-3 py-3 text-[17px] font-normal ${focusRing}`} style={{ borderColor: C.paper, color: C.ink, outlineColor: "#ff5a43" }} />
            </label>
            {tried && !phoneOk && (
              <p className="-mt-2 text-[14px] font-bold" style={{ color: "#ff8a78" }}>
                휴대폰 번호를 확인해 주세요
              </p>
            )}
            <button type="submit" className={`${redBtn} w-full py-3.5 text-[18px] text-white`} style={{ background: C.red, outlineColor: C.paper, fontFamily: "var(--font-pretendard)" }}>
              {queue + 1}번째로 번호표 뽑기
            </button>
            <p className="text-center text-[13px]" style={{ color: "rgba(251,250,246,0.65)" }}>
              캐치테이블 웨이팅과 같은 줄이에요. 어디서 뽑아도 순서는 하나예요.
            </p>
          </form>
        )}
        {/* 번호표가 나오는 입구 */}
        <div aria-hidden className="mt-6 h-2 rounded-full" style={{ background: "#000" }} />
      </div>

      <div className="relative">
        {ticket ? (
          <motion.div initial={reduce ? false : { y: -40, opacity: 0, rotate: -3 }} animate={{ y: 0, opacity: 1, rotate: -1 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto max-w-[420px]" style={{ filter: "drop-shadow(0 12px 16px rgba(0,0,0,0.45))" }}>
            <WaitTicketView ticket={ticket} total={total} onCancel={() => setTicket(null)} />
          </motion.div>
        ) : (
          <div className="hidden h-full min-h-[220px] place-items-center md:grid rounded-[10px] border-2 border-dashed p-6 text-center text-[15px] leading-[1.7]" style={{ borderColor: C.tableLine, color: "rgba(251,250,246,0.6)", ...monoF }}>
            번호표를 뽑으면
            <br />
            여기에 한 장 나와요.
          </div>
        )}
      </div>
    </div>
  );
}

function WaitTicketView({ ticket, total, onCancel }: { ticket: WaitTicket; total: number; onCancel: () => void }) {
  const notch = { background: C.table };
  return (
    <div style={{ ...monoF }} role="status">
      {/* 위쪽 떼는 부분 */}
      <div className="relative px-6 pb-4 pt-5" style={{ background: C.paper }}>
        <p className="flex items-center justify-between text-[13px]">
          <span>{BRAND}</span>
          <span>현장 대기</span>
        </p>
        <p className="mt-3 text-[13px]" style={{ color: C.faint }}>
          내 번호 · {ticket.people}명
        </p>
        <p className="text-[84px] leading-none tabular-nums" style={heavyF}>
          {ticket.no}
        </p>
      </div>
      {/* 절취선 */}
      <div className="relative h-0" aria-hidden>
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full" style={notch} />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full" style={notch} />
        <span className="absolute inset-x-4 top-0 border-t-2 border-dashed" style={{ borderColor: C.rule }} />
        <Scissors size={16} className="absolute -top-2 left-5" style={{ color: C.faint, background: C.paper }} />
      </div>
      <div className="px-6 pb-6 pt-5" style={{ background: C.paper }}>
        <p className="text-[20px] font-bold leading-[1.4]" aria-live="polite">
          {ticket.ahead === 0 ? "들어오세요. 지금 차례예요." : ticket.ahead <= 3 ? `앞에 ${ticket.ahead}팀. 매장 앞으로 와 주세요.` : `앞에 ${ticket.ahead}팀, 약 ${ticket.ahead * TEAM_MIN}분`}
        </p>
        <p aria-hidden className="mt-2 overflow-hidden whitespace-nowrap text-[14px] leading-none tracking-[-1px]">
          {Array.from({ length: 20 }, (_, i) => (i < Math.round(((total - ticket.ahead) / total) * 20) ? "■" : "□")).join("")}
        </p>
        <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: C.faint }}>
          {maskPhone(ticket.phone)}로 3팀 남았을 때 한 번, 차례가 오면 한 번 문자를 보내요. 5분 안에 안 오시면 다음 팀으로 넘어가요.
        </p>
        <button type="button" onClick={onCancel} className={`mt-4 text-[14px] font-bold underline underline-offset-4 ${focusRing}`} style={{ outlineColor: C.red }}>
          줄 서기 취소
        </button>
      </div>
    </div>
  );
}

/* ── 3. 혜택 ──────────────────────────────────────────── */

const BAGS = 300;

function GoodieGauge({ reduce }: { reduce: boolean }) {
  const [left, setLeft] = useState(112);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setLeft((n) => (n > 41 ? n - 1 : n)), 5000);
    return () => window.clearInterval(id);
  }, [reduce]);
  const cells = 20;
  const on = Math.ceil((left / BAGS) * cells);
  return (
    <>
      <PaperTitle id="rc-perks-bag">선착순 구디백</PaperTitle>
      <Dash />
      <Row k="오늘 준비" v={`${BAGS}개`} />
      <Row k="나간 것" v={`${BAGS - left}개`} />
      <div aria-live="polite">
        <Row big k="남은 것" v={<span style={{ color: C.red }}>{left}개</span>} />
      </div>
      <p className="mt-3 overflow-hidden whitespace-nowrap text-[20px] leading-none tracking-[-1px]" role="meter" aria-valuemin={0} aria-valuemax={BAGS} aria-valuenow={left} aria-label="구디백 남은 수량">
        {"█".repeat(on)}
        <span style={{ color: C.rule }}>{"░".repeat(cells - on)}</span>
      </p>
      <Dash />
      <p className="text-[14px] leading-[1.7]">예약 손님은 입장할 때, 웨이팅 손님은 1만 원 넘게 사면 드려요.</p>
      <p className="mt-2 text-[14px] leading-[1.7]" style={{ color: C.faint }}>
        안에 든 것: 붕어 키링, 곰파트너 스티커 3장, 흑임자 크림 한 마리 쿠폰
      </p>
    </>
  );
}

function SnsCheck() {
  const steps = ["인스타그램 공식 계정 팔로우", "스토리에 #성수붕어빵팝업 올리기", "고정 게시물에 좋아요 누르기"];
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  const n = checked.filter(Boolean).length;
  return (
    <>
      <PaperTitle>팔로우하면 키링</PaperTitle>
      <Dash />
      <p className="text-[14px] leading-[1.6]" style={{ color: C.faint }}>
        하나씩 하고 체크하세요. 셋 다 하면 카운터에 보여 줄 화면이 나와요.
      </p>
      <ul className="mt-3 grid gap-1">
        {steps.map((s, i) => (
          <li key={s}>
            <label className="flex cursor-pointer items-center gap-3 py-2 text-[15px] font-bold">
              <input type="checkbox" checked={checked[i]} onChange={() => setChecked((v) => v.map((x, k) => (k === i ? !x : x)))} className="peer sr-only" />
              <span aria-hidden className="grid h-6 w-6 flex-none place-items-center border-2 peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2" style={{ borderColor: C.ink, background: checked[i] ? C.ink : "transparent", color: C.paper, outlineColor: C.red }}>
                {checked[i] && <Check size={16} strokeWidth={3} />}
              </span>
              <span className={checked[i] ? "line-through decoration-2" : ""}>{s}</span>
            </label>
          </li>
        ))}
      </ul>
      <Dash />
      {n === 3 ? (
        <div className="relative py-2 text-center" role="status">
          <p className="text-[18px] font-bold">인증 완료</p>
          <p className="mt-1 text-[14px]">카운터에서 이 화면을 보여 주고 붕어 키링을 받아 가세요.</p>
          <RubberStamp className="-top-2 right-0" rotate={-8} size="text-[15px]">
            확인
          </RubberStamp>
        </div>
      ) : (
        <Row k="진행" v={`${n} / 3`} />
      )}
    </>
  );
}

const PRIZES = [
  { label: "팥붕 1마리", full: "팥 붕어빵 한 마리 더" },
  { label: "슈크림 변경", full: "팥을 슈크림으로 무료 변경" },
  { label: "굿즈 10%", full: "굿즈 10% 할인" },
  { label: "스티커", full: "곰파트너 스티커 한 장" },
  { label: "흑임자", full: "흑임자 크림 한 마리" },
  { label: "엽서", full: "붕어 엽서 한 장" },
];
const SEG_COLORS = [
  { bg: C.red, fg: C.paper },
  { bg: C.paper, fg: C.ink },
  { bg: C.ink, fg: C.paper },
];

function Roulette({ reduce }: { reduce: boolean }) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ idx: number; code: string } | null>(null);
  const seg = 360 / PRIZES.length;

  const spin = () => {
    if (spinning) return;
    const idx = Math.floor(Math.random() * PRIZES.length);
    // 바늘은 위(0도). idx 칸 가운데가 위로 오게 돌린다.
    const target = 360 - (idx * seg + seg / 2);
    const base = angle - (angle % 360);
    setResult(null);
    setSpinning(true);
    setAngle(base + 360 * 5 + target);
    window.setTimeout(
      () => {
        setSpinning(false);
        setResult({ idx, code: `GOM-${Math.floor(1000 + Math.random() * 9000)}` });
      },
      reduce ? 0 : 3300,
    );
  };

  const R = 120;
  const pt = (deg: number, r = R) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return `${(Math.round(r * Math.cos(rad) * 100) / 100).toFixed(2)} ${(Math.round(r * Math.sin(rad) * 100) / 100).toFixed(2)}`;
  };

  return (
    <div id="rc-roulette" className="mt-10 grid scroll-mt-4 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-6">
      <Receipt tilt={-0.3}>
        <PaperTitle sub="꽝은 없어요. 사장님이 꽝 칸을 끝내 못 그렸어요.">100% 당첨 돌림판</PaperTitle>
        <div className="relative mx-auto mt-6 w-full max-w-[280px]">
          <svg aria-hidden viewBox="0 0 30 34" className="absolute left-1/2 top-[-8px] z-10 w-8 -translate-x-1/2">
            <path d="M3 3h24L15 31z" fill={C.ink} stroke={C.paper} strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          <svg viewBox="-128 -128 256 256" className="block h-auto w-full" role="img" aria-label="곰파트너 돌림판, 여섯 칸 모두 경품">
            <g style={{ transform: `rotate(${angle}deg)`, transition: reduce || !spinning ? "none" : "transform 3.2s cubic-bezier(0.15, 0.85, 0.2, 1)" }}>
              {PRIZES.map((p, i) => {
                const a0 = i * seg;
                const a1 = a0 + seg;
                const mid = a0 + seg / 2;
                const c = SEG_COLORS[i % 3];
                return (
                  <g key={p.label}>
                    <path d={`M0 0 L${pt(a0)} A${R} ${R} 0 0 1 ${pt(a1)} Z`} fill={c.bg} stroke={C.ink} strokeWidth="2.5" />
                    <text transform={`rotate(${mid}) translate(0 -78)`} textAnchor="middle" fontSize="14" fontWeight="700" fill={c.fg} style={monoF}>
                      {p.label}
                    </text>
                  </g>
                );
              })}
              <circle r={R} fill="none" stroke={C.ink} strokeWidth="4" />
              <circle r={R - 8} fill="none" stroke={C.ink} strokeWidth="1" strokeDasharray="3 4" />
            </g>
            <circle r="24" fill={C.ink} />
            <g transform="translate(-16 -10) scale(0.62)">
              <path d="M4 16c6-10 22-13 32-6l10-7v26l-10-7C26 29 10 26 4 16z" fill={C.red} />
            </g>
          </svg>
        </div>
        <button type="button" onClick={spin} disabled={spinning} className={`${redBtn} mt-6 w-full py-3.5 text-[18px] text-white disabled:opacity-70`} style={{ background: C.red, outlineColor: C.ink, fontFamily: "var(--font-pretendard)" }}>
          {spinning ? "도는 중" : result ? "한 번 더 돌려 보기" : "돌리기"}
        </button>
      </Receipt>

      <div aria-live="polite" className="md:pt-10">
        {result ? (
          <motion.div key={result.code} initial={reduce ? false : { y: -16, opacity: 0, rotate: 2 }} animate={{ y: 0, opacity: 1, rotate: 1.2 }} transition={{ duration: 0.3 }} className="mx-auto max-w-[440px]" style={{ filter: "drop-shadow(0 12px 16px rgba(0,0,0,0.45))" }}>
            <div className="relative border-[3px] border-dashed p-1.5" style={{ borderColor: C.paper }}>
              <div className="relative px-5 py-5" style={{ background: C.paper, ...monoF }}>
                <div className="flex items-center justify-between text-[13px]">
                  <span>쿠폰</span>
                  <span className="tabular-nums">{result.code}</span>
                </div>
                <p className="mt-3 text-[26px] leading-[1.25]" style={heavyF}>
                  {PRIZES[result.idx].full}
                </p>
                <Dash />
                <p className="text-[14px] leading-[1.6]">계산할 때 이 화면을 보여 주세요. 오늘까지 써요.</p>
                <div className="mt-3">
                  <Barcode value={result.code} height={40} />
                </div>
                <RubberStamp className="right-3 top-10" rotate={-10} size="text-[16px]">
                  당첨
                </RubberStamp>
              </div>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[13px]" style={{ ...monoF, color: "rgba(251,250,246,0.7)" }}>
              <Scissors size={14} aria-hidden /> 점선 따라 잘라 쓰는 쿠폰
            </p>
          </motion.div>
        ) : (
          <div className="hidden min-h-[200px] place-items-center md:grid rounded-[10px] border-2 border-dashed p-6 text-center text-[15px] leading-[1.7]" style={{ borderColor: C.tableLine, color: "rgba(251,250,246,0.6)", ...monoF }}>
            돌림판이 멈추면
            <br />
            쿠폰이 여기 나와요.
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 4. 메뉴, 오시는 길 ───────────────────────────────── */

const MENU = [
  { name: "팥 붕어빵", unit: "3마리", price: 3000 },
  { name: "슈크림", unit: "3마리", price: 3500 },
  { name: "고구마 치즈", unit: "2마리", price: 4000 },
  { name: "흑임자 크림", unit: "2마리", price: 4500, note: "하루 200마리" },
  { name: "붕어 키링", unit: "1개", price: 12000 },
  { name: "곰파트너 에코백", unit: "1개", price: 18000 },
];

function MenuReceipt() {
  return (
    <>
      <PaperTitle id="rc-menu-title" sub="매장에서 굽고 바로 내드려요.">
        메뉴
      </PaperTitle>
      <Dash />
      <table className="w-full text-left text-[15px]">
        <caption className="sr-only">곰파트너 메뉴와 가격</caption>
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
                <span className="font-bold">{m.name}</span>
                {m.note && (
                  <span className="block text-[12px]" style={{ color: C.red }}>
                    {m.note}
                  </span>
                )}
              </td>
              <td className="py-1.5 text-right tabular-nums">{m.unit}</td>
              <td className="py-1.5 text-right font-bold tabular-nums">{won(m.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Dash />
      <Row k="결제" v="카드 · 간편결제 · 현금" />
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

/* ── 5. 자주 묻는 질문 ────────────────────────────────── */

const FAQ = [
  { q: "반려동물과 들어가도 되나요?", a: "안거나 이동장에 넣으면 들어올 수 있어요. 빵을 굽는 곳이라 바닥에 내려놓지는 말아 주세요." },
  { q: "나갔다가 다시 들어와도 되나요?", a: "같은 날이면 손목 도장을 보여 주고 다시 들어오면 돼요. 구디백과 돌림판은 한 번만이에요." },
  { q: "예약을 취소하거나 바꾸고 싶어요", a: "방문 전날 밤 11시까지 확정 문자 속 링크에서 취소하거나 회차를 바꿔요. 연락 없이 안 오시면 그 주 남은 회차 예약이 막혀요." },
  { q: "예약 없이 가도 되나요?", a: "현장 웨이팅으로 들어와요. 주말 오후는 한 시간 넘게 걸릴 때가 많아서 번호표를 먼저 뽑아 두는 게 나아요." },
  { q: "네이버 예약이나 캐치테이블에서도 되나요?", a: "네이버 예약은 이 페이지와 같은 회차를 나눠 써요. 캐치테이블은 현장 웨이팅만 받아요." },
  { q: "입장권을 잃어버렸어요", a: "확정 문자에 같은 QR이 있어요. 문자도 지웠다면 입구에서 예약자 이름과 휴대폰 뒷자리를 말해 주세요." },
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
