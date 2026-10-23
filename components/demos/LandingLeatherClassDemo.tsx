"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { BellRing, CalendarDays, Check, Clock, CreditCard, Landmark, MapPin, Phone, RotateCcw, Users } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 가죽 공방 원데이 클래스 신청 랜딩 샘플. 공방이 실제로 운영하는 수업 신청 페이지처럼 만든다.
   공방, 강사, 신청자, 계좌, 주소는 모두 가상이다. 머리글은 곰파트너와 "가죽 공방 샘플"만 적는다.
   네이버폼, 통장, 카톡으로 받던 이야기는 샘플 표지(data/scenes/part3.ts)가 맡는다. 이 화면에는 웹툰 컷을 넣지 않는다.
   사진 출처: Pexels 사진 5963170(손으로 가죽을 꿰매는 사진)

   국내 가죽 공방 클래스 페이지 구성: 클래스 소개, 수업 순서, 일정과 예약(네이버 예약, 회차별 정원), 환불 규정,
   자주 묻는 질문, 오시는 길. 관용 문구는 원데이 클래스, 재료 포함, 각인 서비스, 정원 마감, 대기 신청.

   디자인: 첫 화면은 가죽을 꿰매는 손 사진 한 장. 바탕은 흰색과 옅은 회색을 번갈아 쓰고, 강조색은 차분한 가죽 갈색 하나.
   글꼴은 Pretendard 한 벌.

   핵심 모션: 들어오면 사진이 1.6초 동안 천천히 다가오고(1.06배에서 1배), 문장과 버튼은 0.3초 늦게 아래에서 올라온다
   (CSS keyframes, JS 없이도 보인다). 스크롤하면 사진만 조금 느리게 움직인다. 줄이기 설정이면 모두 멈춘다.

   상호작용(모두 브라우저 안에서만 돈다)
   1. 회차 신청: 남은 자리가 실시간으로 줄고, 0이 되면 그 회차는 마감되고 대기 신청으로 바뀐다.
   2. 결제: 같은 흐름 안에서 카드 또는 이 신청 전용 계좌. 실제 결제는 일어나지 않는다(카드 번호를 받지 않는다).
   3. 예약 확인/변경: 예약 번호와 휴대폰 뒷자리로 찾아 날짜를 바꾸거나 취소한다. 환불 규정대로 금액이 계산된다.
   4. 사장님 화면: 회차별 신청자 표(결제 상태, 변경 이력)와 알림 기록.
   5. 가죽 색 고르기: 신청서에서 색 칩을 고르면 각인 미리보기 색이 바뀐다. */

const IMG = "/images/demo-landing-leather-class";
const EASE = [0.22, 1, 0.36, 1] as const;
const PHOTO_IN = 1.6; // 초. 사진이 다가오는 시간

const PRICE = 45_000;
const CAP = 8;
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const p2 = (n: number) => String(n).padStart(2, "0");
const md = (d: Date) => `${d.getMonth() + 1}.${d.getDate()}(${DOW[d.getDay()]})`;
const dayDiff = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86_400_000);
const nowHM = () => {
  const n = new Date();
  return `${p2(n.getHours())}:${p2(n.getMinutes())}`;
};

const C = {
  bg: "#ffffff",
  soft: "#f7f7f5",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  accent: "#7a4a2e",
  accentSoft: "#f3ede7",
  error: "#9b2c2c",
};

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#256ef4]";
const btnMain = `inline-flex items-center justify-center gap-2 rounded-[6px] font-semibold text-white transition-[background-color,filter] duration-150 hover:brightness-110 disabled:opacity-40 motion-reduce:transition-none ${focusRing}`;
const btnLine = `inline-flex items-center justify-center gap-2 rounded-[6px] border bg-white font-semibold transition-colors hover:bg-[#f7f7f5] disabled:opacity-40 ${focusRing}`;
const field = `h-12 w-full min-w-0 rounded-[6px] border bg-white px-3 text-[16px] font-normal outline-none transition-colors focus:border-[#7a4a2e] ${focusRing}`;
const labelCls = "grid min-w-0 gap-1.5 text-[14px] font-semibold";
const panel = "relative min-w-0 rounded-[8px] border bg-white p-5 sm:p-7";

type Pay = "card" | "bank";
type Status = "결제 완료" | "입금 대기" | "대기" | "환불 완료" | "취소";

interface Session {
  id: string;
  date: Date;
  time: string;
}

interface Booking {
  no: string;
  session: string;
  name: string;
  phone: string;
  qty: number;
  pay: Pay | null;
  status: Status;
  history: string[];
  mine?: boolean;
  changed?: boolean;
}

interface LogLine {
  at: string;
  text: string;
  mine?: boolean;
}

/** 오늘 이틀 뒤부터 2주 안의 수요일, 금요일 저녁, 토요일 오전, 오후, 일요일 오후 중 앞 8개 */
function makeSessions(today: Date): Session[] {
  const out: Session[] = [];
  for (let i = 2; i < 20 && out.length < 8; i++) {
    const d = daysAgo(today, -i);
    const times = d.getDay() === 3 || d.getDay() === 5 ? ["19:30"] : d.getDay() === 6 ? ["11:00", "14:30"] : d.getDay() === 0 ? ["14:30"] : [];
    for (const t of times) if (out.length < 8) out.push({ id: `s${out.length}`, date: d, time: t });
  }
  return out;
}

const NAMES = ["배수진", "박서연", "이지민", "최유나", "정다은", "강민지", "윤서아", "임하린", "한소율", "오예진", "서지우", "신채원", "권나은", "황보람", "송가을", "조은비"];
// 회차별로 이미 찬 자리. 0번과 2번 회차는 꽉 찼다.
const TAKEN = [8, 6, 8, 3, 5, 2, 7, 1];

function seedBookings(): Booking[] {
  const list: Booking[] = [];
  let n = 401;
  let k = 0;
  TAKEN.forEach((taken, si) => {
    let left = taken;
    while (left > 0) {
      const qty = left >= 2 && (k + si) % 4 === 1 ? 2 : 1;
      const bank = k % 3 === 0;
      list.push({
        no: `LC-${n++}`,
        session: `s${si}`,
        name: NAMES[k % NAMES.length],
        phone: `010-${3000 + k * 137}-${p2(10 + ((k * 29) % 89))}${p2(k % 100)}`,
        qty,
        pay: bank ? "bank" : "card",
        status: bank && k % 2 === 0 ? "입금 대기" : "결제 완료",
        history: k % 5 === 2 ? ["날짜 변경 1회"] : [],
        changed: k % 5 === 2,
      });
      left -= qty;
      k++;
    }
  });
  // 꽉 찬 0번 회차에 대기 한 명
  list.push({ no: `LC-${n++}`, session: "s0", name: "문지아", phone: "010-4412-7788", qty: 1, pay: null, status: "대기", history: [] });
  return list;
}

/** 예약 확인 칸에 처음 채워 두는 예약. 넷째 회차의 카드 결제 건 */
const DEMO = seedBookings().find((b) => b.session === "s3" && b.status === "결제 완료")!;

const counts = (b: Booking) => b.status === "결제 완료" || b.status === "입금 대기";

/** 수업일까지 남은 날로 환불 비율을 정한다 */
function refundRate(days: number) {
  if (days >= 5) return 1;
  if (days >= 2) return 0.5;
  return 0;
}

const REFUND_RULE = [
  ["수업 5일 전까지", "전액 환불"],
  ["수업 2~4일 전", "50% 환불"],
  ["수업 전날, 당일", "환불 없음(가죽을 미리 재단해 둡니다)"],
];

const LEATHERS = [
  { id: "tan", name: "탄", color: "#b9773f" },
  { id: "brown", name: "브라운", color: "#6f3c1e" },
  { id: "olive", name: "올리브", color: "#5d6034" },
  { id: "burgundy", name: "버건디", color: "#6b2430" },
] as const;

const STEPS = [
  ["10분", "가죽 고르기", "탄, 브라운, 올리브, 버건디 중에 골라요. 베지터블 가죽이라 쓸수록 색이 짙어져요."],
  ["30분", "재단과 구멍 내기", "본을 대고 자른 뒤 목타로 바느질 구멍을 내요."],
  ["60분", "새들 스티치", "바늘 두 개로 한 땀씩 꿰매요. 처음 하는 분도 따라와요."],
  ["20분", "마감과 각인", "옆면을 다듬고 이니셜 도장을 찍어요."],
] as const;

const FAQ = [
  ["처음인데 괜찮을까요?", "수강생 대부분이 처음이에요. 한 땀씩 옆에서 봐 드려요."],
  ["준비물이 있나요?", "없어요. 앞치마와 도구는 공방에 있어요."],
  ["주차가 되나요?", "건물 뒤 공영주차장을 써 주세요. 공방 주차 자리는 없어요."],
  ["아이와 같이 들어도 되나요?", "초등학생부터 들을 수 있어요. 아이도 한 자리로 신청해 주세요."],
] as const;

/* ── 작은 조각 ─────────────────────────────── */

/** 각인 미리보기. 고른 가죽 색 위에 이니셜 */
function Stamp({ text, color }: { text: string; color: string }) {
  return (
    <span aria-hidden className="inline-flex h-12 min-w-[70px] shrink-0 items-center justify-center rounded-[6px] px-3 text-[18px] font-bold tracking-[0.14em]" style={{ background: color, color: "rgba(255,255,255,.82)" }}>
      {text || "ABC"}
    </span>
  );
}

function SeatDots({ left }: { left: number }) {
  return (
    <span aria-hidden className="flex gap-[3px]">
      {Array.from({ length: CAP }, (_, i) => (
        <span key={i} className="h-[7px] w-[7px] rounded-full border" style={{ borderColor: C.accent, background: i < CAP - left ? C.accent : "transparent" }} />
      ))}
    </span>
  );
}

function SectionHead({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="text-[28px] font-bold leading-[1.25] tracking-[-0.02em] md:text-[34px]" style={{ color: C.ink }}>
      {title}
    </h2>
  );
}

const statusStyle = (s: Status): React.CSSProperties =>
  s === "결제 완료"
    ? { background: C.accent, color: "#ffffff", borderColor: C.accent }
    : s === "입금 대기"
      ? { background: C.accentSoft, color: C.ink, borderColor: C.accent }
      : s === "대기"
        ? { background: C.soft, color: C.ink, borderColor: C.line }
        : { background: "transparent", color: C.muted, borderColor: C.line, textDecoration: "line-through" };

/* ── 페이지 ─────────────────────────────── */

export function LandingLeatherClassDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const sessions = useMemo(() => makeSessions(today), [today]);
  const byId = useMemo(() => Object.fromEntries(sessions.map((s) => [s.id, s])), [sessions]);
  const label = (id: string) => (byId[id] ? `${md(byId[id].date)} ${byId[id].time}` : "");

  const posterRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: posterRef, offset: ["start start", "end start"] });
  // 스크롤하면 사진만 조금 느리게 내려간다
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  const [bookings, setBookings] = useState<Booking[]>(seedBookings);
  const [log, setLog] = useState<LogLine[]>([
    { at: "21:40", text: "박ㅅ연 님 신청 2명, 카드 결제" },
    { at: "22:15", text: "윤ㅅ아 님 날짜 변경" },
    { at: "22:58", text: "문ㅈ아 님 대기 신청" },
  ]);
  const addLog = (text: string) => setLog((v) => [{ at: nowHM(), text, mine: true }, ...v].slice(0, 6));
  const left = (sid: string) => CAP - bookings.filter((b) => b.session === sid && counts(b)).reduce((s, b) => s + b.qty, 0);
  const nextNo = () => `LC-${401 + bookings.length}`;

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const [leatherId, setLeatherId] = useState<(typeof LEATHERS)[number]["id"]>("tan");
  const leatherColor = LEATHERS.find((l) => l.id === leatherId)!.color;

  /* 신청 흐름 */
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sid, setSid] = useState("s1");
  const [name, setName] = useState("김하늘");
  const [phone, setPhone] = useState("010-1234-5678");
  const [qty, setQty] = useState(1);
  const [initials, setInitials] = useState("HN");
  const [pay, setPay] = useState<Pay>("card");
  const [agree, setAgree] = useState(false);
  const [done, setDoneRaw] = useState<Booking | null>(null);
  const [ownerSid, setOwnerSid] = useState("s1");
  // 신청이 바뀌면 사장님 화면도 그 회차를 연다
  const setDone = (b: Booking | null) => {
    setDoneRaw(b);
    if (b) setOwnerSid(b.session);
  };
  const [err, setErr] = useState("");
  const changeRef = useRef<HTMLElement>(null);

  const full = left(sid) <= 0;
  const qtyOk = full || qty <= left(sid);
  const soonest = sessions.find((s) => left(s.id) > 0);

  const toStep2 = () => {
    setErr("");
    setStep(2);
  };
  const toStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, "").length < 10) return setErr("이름과 휴대폰 번호를 확인해 주세요.");
    if (!qtyOk) return setErr(`이 회차는 ${left(sid)}자리 남았어요.`);
    if (!agree) return setErr("환불 규정에 동의해 주세요.");
    setErr("");
    if (full) return finish(null);
    setStep(3);
  };
  const finish = (method: Pay | null) => {
    if (!full && qty > left(sid)) return setErr("그사이 자리가 찼어요. 다른 회차를 골라 주세요.");
    const b: Booking = {
      no: nextNo(),
      session: sid,
      name: name.trim(),
      phone,
      qty: full ? 1 : qty,
      pay: method,
      status: method === null ? "대기" : method === "card" ? "결제 완료" : "입금 대기",
      history: [],
      mine: true,
    };
    setBookings((v) => [...v, b]);
    setDone(b);
    setFound(b.no);
    setQNo(b.no);
    setQTail(phone.replace(/\D/g, "").slice(-4));
    setErr("");
    addLog(`${maskName(b.name)} 님 ${method === null ? "대기 신청" : `신청 ${b.qty}명, ${method === "card" ? "카드 결제" : "계좌 입금 대기"}`}`);
  };
  const markPaid = () => {
    if (!done) return;
    setBookings((v) => v.map((b) => (b.no === done.no ? { ...b, status: "결제 완료" } : b)));
    setDone({ ...done, status: "결제 완료" });
    addLog(`${maskName(done.name)} 님 입금 확인(자동)`);
  };
  const restart = () => {
    setDone(null);
    setStep(1);
    setAgree(false);
  };

  /* 예약 확인/변경 */
  const [qNo, setQNo] = useState(DEMO.no);
  const [qTail, setQTail] = useState(DEMO.phone.slice(-4));
  const [found, setFound] = useState<string | null>(null);
  const [qErr, setQErr] = useState("");
  const [mode, setMode] = useState<"view" | "move" | "cancel">("view");
  const [moveTo, setMoveTo] = useState("");
  const cur = bookings.find((b) => b.no === found) ?? null;
  const curSession = cur ? byId[cur.session] : null;
  const daysLeft = curSession ? dayDiff(curSession.date, today) : 0;

  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    const b = bookings.find((x) => x.no.toUpperCase() === qNo.trim().toUpperCase() && x.phone.replace(/\D/g, "").endsWith(qTail.trim()));
    if (!b || qTail.trim().length !== 4) {
      setFound(null);
      setQErr("예약 번호나 휴대폰 뒷자리가 맞지 않아요.");
      return;
    }
    setQErr("");
    setFound(b.no);
    setMode("view");
  };

  const doMove = () => {
    if (!cur || !moveTo) return;
    const from = label(cur.session);
    const to = label(moveTo);
    setBookings((v) => v.map((b) => (b.no === cur.no ? { ...b, session: moveTo, changed: true, history: [...b.history, `${from}에서 ${to}로 변경`] } : b)));
    if (done?.no === cur.no) setDone({ ...done, session: moveTo });
    addLog(`${maskName(cur.name)} 님 날짜 변경 ${to}`);
    setMode("view");
    setMoveTo("");
  };

  const doCancel = () => {
    if (!cur) return;
    const rate = refundRate(daysLeft);
    const paid = cur.status === "결제 완료";
    const next: Status = paid ? "환불 완료" : "취소";
    setBookings((v) => {
      let list = v.map((b) => (b.no === cur.no ? { ...b, status: next, history: [...b.history, paid ? `취소, ${won(PRICE * cur.qty * rate)} 환불` : "취소"] } : b));
      // 자리가 나면 그 회차 첫 대기자에게 알림이 간다
      const w = list.find((b) => b.session === cur.session && b.status === "대기");
      if (w && counts(cur)) list = list.map((b) => (b.no === w.no ? { ...b, history: [...b.history, "자리 알림 문자 발송"] } : b));
      return list;
    });
    if (done?.no === cur.no) setDone({ ...done, status: next });
    addLog(`${maskName(cur.name)} 님 취소${paid ? `, ${won(PRICE * cur.qty * rate)} 환불` : ""}`);
    setMode("view");
  };

  const movable = cur ? sessions.filter((s) => s.id !== cur.session && left(s.id) >= cur.qty) : [];
  const canMove = !!cur && counts(cur) && daysLeft >= 2 && !cur.changed;
  const canCancel = !!cur && (counts(cur) || cur.status === "대기");

  /* 사장님 화면 */
  const rows = bookings.filter((b) => b.session === ownerSid);
  const confirmed = rows.filter(counts).reduce((s, b) => s + b.qty, 0);
  const waiting = rows.filter((b) => b.status === "입금 대기").length;
  const waitlist = rows.filter((b) => b.status === "대기").length;

  const wrap = "mx-auto w-full max-w-[1120px] px-4 md:px-8";

  return (
    <div className="min-h-screen overflow-x-clip pb-24 text-[16px] leading-[1.6]" style={{ background: C.bg, color: C.ink }}>
      <main id="top">
        {/* 첫 화면 */}
        <section id="lc-poster" ref={posterRef} aria-labelledby="lc-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: "#141414", color: "#ffffff" }}>
          <style>{`@keyframes lc-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.lc-rise{animation:lc-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both}@media (prefers-reduced-motion: reduce){.lc-rise{animation:none}}`}</style>
          <motion.div className="absolute inset-x-0 top-[-10%] h-[110%]" style={{ y: photoY }}>
            <motion.div className="h-full w-full" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : PHOTO_IN, ease: EASE }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
              <img
                src={`${IMG}/hero.jpg`}
                srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
                sizes="100vw"
                alt="나무 집게에 가죽을 물리고 바늘 두 개로 손바느질하는 손"
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "44% 45%" }}
              />
            </motion.div>
          </motion.div>
          {/* 글자 대비를 위한 막. 아래쪽과 PC 왼쪽을 더 어둡게 */}
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.4))" }} />
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.5), rgba(0,0,0,0) 60%)" }} />

          <div className="relative z-[1] flex items-center justify-between gap-3 px-4 pt-4 md:px-12 md:pt-7">
            <a href="#top" className={`inline-flex min-w-0 items-center gap-2 rounded-[4px] ${focusRing}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
              <img src="/images/logo-bear.png" alt="" aria-hidden width={30} height={30} className="h-[30px] w-[30px] shrink-0" />
              <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-[19px] font-bold tracking-[-0.02em]">곰파트너</span>
                <span className="text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.78)" }}>
                  가죽 공방 샘플
                </span>
              </span>
            </a>
            <nav aria-label="이 페이지 차례" className="hidden items-center gap-6 text-[15px] font-semibold lg:flex">
              {[
                ["수업 소개", "lc-about"],
                ["일정/신청", "lc-apply"],
                ["예약 확인", "lc-change"],
                ["사장님 화면", "lc-owner"],
              ].map(([t, id]) => (
                <a key={id} href={`#${id}`} className={`rounded-[4px] underline-offset-[6px] hover:underline ${focusRing}`}>
                  {t}
                </a>
              ))}
            </nav>
            <a href="#lc-apply" data-gtm-cta="landing-leather-class_poster_cta" className={`${btnMain} min-h-11 shrink-0 px-4 text-[15px]`} style={{ background: C.accent }}>
              신청하기
            </a>
          </div>

          <div className={`relative z-[1] mt-auto px-4 pb-12 md:px-12 md:pb-16 ${reduce ? "" : "lc-rise"}`}>
            <h1 id="lc-title" className="max-w-[12em] text-[38px] font-bold md:text-[clamp(40px,5vw,72px)]" style={{ letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}>
              카드지갑 만들기
            </h1>
            <p className="mt-4 max-w-[30em] text-[16px] leading-[1.7] md:mt-5 md:text-[18px]" style={{ color: "rgba(255,255,255,0.88)", wordBreak: "keep-all" }}>
              가죽을 자르고 손바느질로 꿰매요. 두 시간 뒤에는 이니셜을 새긴 카드지갑을 들고 가요.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#lc-apply" className={`${btnMain} min-h-12 px-6 text-[16px]`} style={{ background: C.accent }}>
                <CalendarDays size={18} aria-hidden /> 날짜 고르기
              </a>
              <a href="#lc-change" className={`inline-flex min-h-12 items-center justify-center rounded-[6px] border px-5 text-[16px] font-semibold transition-colors hover:bg-white/10 ${focusRing}`} style={{ borderColor: "rgba(255,255,255,0.7)", color: "#ffffff" }}>
                예약 확인
              </a>
            </div>
          </div>
        </section>

        {/* 첫 화면 바로 아래 수업 정보 */}
        <section aria-label="수업 정보" className="border-b" style={{ borderColor: C.line }}>
          <div className={`${wrap} flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between md:py-7`}>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[15px] sm:grid-cols-4 md:gap-x-10">
              {(
                [
                  [CreditCard, "수강료", `${won(PRICE)}, 재료 포함`],
                  [Clock, "시간", "2시간"],
                  [Users, "정원", `회차당 ${CAP}명`],
                  [MapPin, "장소", "서울 ㅇㅇ구, 2층"],
                ] as const
              ).map(([I, k, v]) => (
                <div key={k} className="flex min-w-0 items-start gap-2">
                  <I size={17} aria-hidden className="mt-1 shrink-0" style={{ color: C.accent }} />
                  <div className="min-w-0">
                    <dt className="text-[13px]" style={{ color: C.muted }}>
                      {k}
                    </dt>
                    <dd className="font-semibold tabular-nums">{v}</dd>
                  </div>
                </div>
              ))}
            </dl>
            {soonest && (
              <p className="text-[15px] font-semibold tabular-nums" style={{ color: C.accent }}>
                가장 빠른 수업 {label(soonest.id)}, {left(soonest.id)}자리 남았어요
              </p>
            )}
          </div>
        </section>

        {/* 수업 소개 */}
        <section id="lc-about" aria-labelledby="lc-about-title" className="scroll-mt-4 py-14 md:py-20" style={{ background: C.soft }}>
          <div className={wrap}>
            <SectionHead id="lc-about-title" title="두 시간 동안 하는 일" />
            <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(([t, h, b]) => (
                <li key={h} className="min-w-0 rounded-[8px] border bg-white p-5" style={{ borderColor: C.line }}>
                  <p className="text-[15px] font-semibold tabular-nums" style={{ color: C.accent }}>
                    {t}
                  </p>
                  <h3 className="mt-1.5 text-[19px] font-bold">{h}</h3>
                  <p className="mt-1.5 text-[15px] leading-[1.65]" style={{ color: C.body }}>
                    {b}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 수업 신청 */}
        <section id="lc-apply" aria-labelledby="lc-apply-title" className="scroll-mt-4 py-14 md:py-20">
          <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12`}>
            <div>
              <SectionHead id="lc-apply-title" title="수업 신청" />
              <p className="mt-4 text-[16px] leading-[1.7]" style={{ color: C.body }}>
                회차마다 {CAP}자리예요. 자리가 다 차면 대기 신청을 받고, 취소가 나오면 순서대로 문자 드려요.
              </p>
              <RefundRule />
            </div>

            <div className={panel} style={{ borderColor: C.line }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[18px] font-bold">{done ? "신청 확인" : step === 1 ? "날짜와 시간" : step === 2 ? "신청하는 분" : "결제"}</p>
                {!done && (
                  <ol className="flex shrink-0 gap-1.5 text-[13px] font-semibold" aria-label="신청 단계">
                    {["회차", "정보", "결제"].map((s, i) => (
                      <li
                        key={s}
                        aria-current={step === i + 1 ? "step" : undefined}
                        className="rounded-full border px-2.5 py-0.5"
                        style={step === i + 1 ? { background: C.accent, borderColor: C.accent, color: "#ffffff" } : step > i + 1 ? { borderColor: C.accent, color: C.accent } : { borderColor: C.line, color: C.muted }}
                      >
                        {step > i + 1 && <Check size={12} aria-hidden className="mr-0.5 inline" />}
                        {s}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div>
                {done ? (
                  <Confirm done={done} label={label(done.session)} onPaid={markPaid} onRestart={restart} onChange={() => changeRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })} reduce={reduce} />
                ) : step === 1 ? (
                  <div className="mt-4">
                    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4" aria-label="회차">
                      {sessions.map((s) => {
                        const l = left(s.id);
                        const on = sid === s.id;
                        return (
                          <li key={s.id} className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setSid(s.id)}
                              aria-pressed={on}
                              className={`flex w-full min-w-0 flex-col items-start gap-1 rounded-[6px] border px-3 py-2.5 text-left transition-colors ${focusRing}`}
                              style={{ borderColor: on ? C.accent : C.line, background: on ? C.accentSoft : "#ffffff", boxShadow: on ? `inset 0 0 0 1px ${C.accent}` : undefined }}
                            >
                              <span className="text-[16px] font-bold tabular-nums">{md(s.date)}</span>
                              <span className="text-[14px] tabular-nums" style={{ color: C.muted }}>
                                {s.time}
                              </span>
                              <SeatDots left={Math.max(l, 0)} />
                              <span className="text-[13px] font-semibold" style={{ color: l <= 0 ? C.error : l <= 2 ? C.accent : C.body }}>
                                {l <= 0 ? "마감, 대기 가능" : `남은 자리 ${l}`}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: C.line }}>
                      <span className="text-[16px] font-bold tabular-nums">
                        {label(sid)} {full ? ", 마감" : `, 남은 자리 ${left(sid)}`}
                      </span>
                      {full ? (
                        <button type="button" onClick={toStep2} className={`${btnLine} h-12 px-5 text-[16px]`} style={{ borderColor: C.accent, color: C.accent }}>
                          대기 신청
                        </button>
                      ) : (
                        <button type="button" onClick={toStep2} className={`${btnMain} h-12 px-6 text-[16px]`} style={{ background: C.accent }}>
                          이 회차로
                        </button>
                      )}
                    </div>
                  </div>
                ) : step === 2 ? (
                  <form onSubmit={toStep3} className="mt-4" noValidate>
                    <p className="text-[16px] font-bold tabular-nums">
                      {label(sid)}{" "}
                      {full && (
                        <span className="ml-1 rounded-full px-2 py-0.5 text-[13px]" style={{ background: C.soft }}>
                          대기 신청
                        </span>
                      )}
                    </p>
                    <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
                      <label className={labelCls}>
                        이름
                        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={10} autoComplete="name" className={field} style={{ borderColor: C.line }} />
                      </label>
                      <label className={labelCls}>
                        휴대폰
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" maxLength={13} autoComplete="tel" className={field} style={{ borderColor: C.line }} />
                      </label>
                      {!full && (
                        <fieldset className="min-w-0">
                          <legend className="text-[14px] font-semibold">인원</legend>
                          <div className="mt-1.5 grid grid-cols-2 gap-2">
                            {[1, 2].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setQty(n)}
                                aria-pressed={qty === n}
                                disabled={n > left(sid)}
                                className={`h-12 w-full min-w-0 rounded-[6px] border text-[16px] font-semibold disabled:opacity-40 ${focusRing}`}
                                style={qty === n ? { background: C.accent, borderColor: C.accent, color: "#ffffff" } : { borderColor: C.line, background: "#ffffff" }}
                              >
                                {n}명
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      )}
                      <fieldset className="min-w-0">
                        <legend className="text-[14px] font-semibold">가죽 색</legend>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {LEATHERS.map((l) => {
                            const on = l.id === leatherId;
                            return (
                              <button
                                key={l.id}
                                type="button"
                                onClick={() => setLeatherId(l.id)}
                                aria-pressed={on}
                                className={`inline-flex h-12 items-center gap-1.5 rounded-[6px] border pl-2 pr-3 text-[14px] font-semibold transition-colors ${focusRing}`}
                                style={{ borderColor: on ? C.accent : C.line, background: on ? C.accentSoft : "#ffffff", boxShadow: on ? `inset 0 0 0 1px ${C.accent}` : undefined }}
                              >
                                <span aria-hidden className="h-5 w-5 rounded-full" style={{ background: l.color }} />
                                {l.name}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                      <label className={`${labelCls} sm:col-span-2`}>
                        각인 이니셜(영문 3자)
                        <span className="flex min-w-0 items-center gap-2 sm:max-w-[340px]">
                          <input value={initials} onChange={(e) => setInitials(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3))} className={field} style={{ borderColor: C.line }} />
                          <Stamp text={initials} color={leatherColor} />
                        </span>
                      </label>
                    </div>
                    <label className="mt-4 flex items-start gap-2.5 text-[15px] font-semibold">
                      <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#7a4a2e]" />
                      환불 규정을 확인했어요
                    </label>
                    {err && (
                      <p role="alert" className="mt-2 text-[14px] font-semibold" style={{ color: C.error }}>
                        {err}
                      </p>
                    )}
                    <div className="mt-5 flex gap-2">
                      <button type="button" onClick={() => setStep(1)} className={`${btnLine} h-12 px-4 text-[15px]`} style={{ borderColor: C.line }}>
                        회차 다시
                      </button>
                      <button type="submit" className={`${btnMain} h-12 flex-1 text-[16px]`} style={{ background: C.accent }}>
                        {full ? "대기 신청하기" : `결제로, ${won(PRICE * qty)}`}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-4">
                    <p className="text-[16px] font-bold tabular-nums">
                      {label(sid)}, {qty}명, {maskName(name)}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="결제 방법">
                      {(
                        [
                          ["card", CreditCard, "카드"],
                          ["bank", Landmark, "계좌이체"],
                        ] as const
                      ).map(([v, I, t]) => (
                        <button
                          key={v}
                          type="button"
                          role="radio"
                          aria-checked={pay === v}
                          onClick={() => setPay(v)}
                          className={`flex h-14 min-w-0 items-center justify-center gap-2 rounded-[6px] border text-[16px] font-semibold ${focusRing}`}
                          style={pay === v ? { borderColor: C.accent, background: C.accentSoft, boxShadow: `inset 0 0 0 1px ${C.accent}` } : { borderColor: C.line, background: "#ffffff" }}
                        >
                          <I size={19} aria-hidden /> {t}
                        </button>
                      ))}
                    </div>
                    {pay === "card" ? (
                      <div className="mt-3 rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.soft }}>
                        <p className="text-[13px]" style={{ color: C.muted }}>
                          테스트 카드
                        </p>
                        <p className="mt-2 whitespace-nowrap text-[16px] font-semibold tabular-nums tracking-[0.08em] min-[380px]:text-[18px]">0000 0000 0000 0000</p>
                        <p className="mt-2 text-[13px]" style={{ color: C.muted }}>
                          번호를 받지 않는 연습용 카드예요
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-[8px] border p-4" style={{ borderColor: C.line, background: C.soft }}>
                        <p className="text-[13px] font-semibold" style={{ color: C.muted }}>
                          이 신청 전용 계좌
                        </p>
                        <p className="mt-1 text-[18px] font-bold tabular-nums">가상은행 000-0000-0000</p>
                        <p className="mt-1 text-[14px]" style={{ color: C.body }}>
                          입금자명이 달라도 이 계좌로 들어오면 자동으로 확인돼요.
                        </p>
                      </div>
                    )}
                    <p className="mt-3 text-[13px]" style={{ color: C.muted }}>
                      샘플이라 실제로 결제되지 않아요.
                    </p>
                    {err && (
                      <p role="alert" className="mt-2 text-[14px] font-semibold" style={{ color: C.error }}>
                        {err}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => setStep(2)} className={`${btnLine} h-12 px-4 text-[15px]`} style={{ borderColor: C.line }}>
                        이전
                      </button>
                      <button type="button" onClick={() => finish(pay)} className={`${btnMain} h-12 flex-1 text-[16px]`} style={{ background: C.accent }}>
                        {pay === "card" ? `${won(PRICE * qty)} 결제` : "계좌 받고 신청"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 자주 묻는 것 */}
        <section aria-labelledby="lc-faq-title" className="py-14 md:py-16" style={{ background: C.soft }}>
          <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12`}>
            <SectionHead id="lc-faq-title" title="오기 전에" />
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {FAQ.map(([q, a]) => (
                <div key={q} className="border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="text-[17px] font-bold">{q}</dt>
                  <dd className="mt-1 text-[15px] leading-[1.65]" style={{ color: C.body }}>
                    {a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 예약 확인/변경 */}
        <section id="lc-change" ref={changeRef} aria-labelledby="lc-change-title" className="scroll-mt-4 py-14 md:py-20">
          <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12`}>
            <div>
              <SectionHead id="lc-change-title" title="예약 확인/변경" />
              <p className="mt-4 text-[16px] leading-[1.7]" style={{ color: C.body }}>
                날짜는 수업 2일 전까지 한 번 바꿀 수 있어요.
              </p>
            </div>
            <div className={panel} style={{ borderColor: C.line }}>
              <form onSubmit={lookup} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <label className={labelCls}>
                  예약 번호
                  <input value={qNo} onChange={(e) => setQNo(e.target.value)} className={`${field} tabular-nums`} style={{ borderColor: C.line }} />
                </label>
                <label className={labelCls}>
                  휴대폰 뒷자리
                  <input value={qTail} onChange={(e) => setQTail(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className={field} style={{ borderColor: C.line }} />
                </label>
                <button type="submit" className={`${btnMain} h-12 w-full px-6 text-[16px] sm:w-auto`} style={{ background: C.ink }}>
                  조회
                </button>
              </form>
              {qErr && (
                <p role="alert" className="mt-2 text-[14px] font-semibold" style={{ color: C.error }}>
                  {qErr}
                </p>
              )}
              {cur && curSession && (
                <div className="mt-5 rounded-[8px] border p-4 sm:p-5" style={{ borderColor: C.line, background: C.soft }}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold tabular-nums" style={{ color: C.muted }}>
                        {cur.no}
                      </p>
                      <p className="text-[20px] font-bold tabular-nums">{label(cur.session)}</p>
                      <p className="text-[15px]" style={{ color: C.body }}>
                        {maskName(cur.name)}, {cur.qty}명, 수업까지 {daysLeft}일
                      </p>
                    </div>
                    <span className="rounded-full border px-2.5 py-0.5 text-[13px] font-semibold" style={statusStyle(cur.status)}>
                      {cur.status}
                    </span>
                  </div>
                  {cur.history.length > 0 && (
                    <ul className="mt-2 grid gap-0.5 text-[14px]" style={{ color: C.body }}>
                      {cur.history.map((h, i) => (
                        <li key={i} className="flex gap-1.5">
                          <RotateCcw size={14} aria-hidden className="mt-1 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}

                  {mode === "view" && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button type="button" disabled={!canMove} onClick={() => setMode("move")} className={`${btnLine} h-12 min-w-0 text-[15px]`} style={{ borderColor: C.accent, color: C.accent }}>
                        날짜 바꾸기
                      </button>
                      <button type="button" disabled={!canCancel} onClick={() => setMode("cancel")} className={`${btnLine} h-12 min-w-0 text-[15px]`} style={{ borderColor: C.line }}>
                        취소
                      </button>
                      {!canMove && counts(cur) && (
                        <p className="col-span-2 text-[14px]" style={{ color: C.muted }}>
                          {cur.changed ? "날짜 변경은 한 번까지예요." : "수업 2일 전부터는 날짜를 바꿀 수 없어요."}
                        </p>
                      )}
                    </div>
                  )}

                  {mode === "move" && (
                    <div className="mt-4">
                      <p className="text-[14px] font-semibold">바꿀 회차, 수업 2일 전까지 한 번</p>
                      <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {movable.map((s) => (
                          <li key={s.id} className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setMoveTo(s.id)}
                              aria-pressed={moveTo === s.id}
                              className={`w-full min-w-0 rounded-[6px] border px-2.5 py-2 text-left text-[14px] font-semibold tabular-nums ${focusRing}`}
                              style={moveTo === s.id ? { borderColor: C.accent, background: C.accentSoft, boxShadow: `inset 0 0 0 1px ${C.accent}` } : { borderColor: C.line, background: "#ffffff" }}
                            >
                              {md(s.date)} {s.time}
                              <span className="block text-[13px] font-normal">남은 자리 {left(s.id)}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={() => setMode("view")} className={`${btnLine} h-12 px-4 text-[15px]`} style={{ borderColor: C.line }}>
                          그만두기
                        </button>
                        <button type="button" disabled={!moveTo} onClick={doMove} className={`${btnMain} h-12 flex-1 text-[16px]`} style={{ background: C.accent }}>
                          {moveTo ? `${label(moveTo)}로 바꾸기` : "회차를 고르세요"}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === "cancel" && (
                    <div className="mt-4">
                      <RefundRule highlight={daysLeft >= 5 ? 0 : daysLeft >= 2 ? 1 : 2} />
                      <p className="mt-3 text-[16px] font-bold tabular-nums">
                        {cur.status === "결제 완료" ? `돌려받는 금액 ${won(PRICE * cur.qty * refundRate(daysLeft))}` : cur.status === "대기" ? "대기 신청을 취소해요." : "아직 입금 전이라 돌려받을 금액이 없어요."}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={() => setMode("view")} className={`${btnLine} h-12 px-4 text-[15px]`} style={{ borderColor: C.line }}>
                          그만두기
                        </button>
                        <button type="button" onClick={doCancel} className={`${btnMain} h-12 flex-1 text-[16px]`} style={{ background: C.error }}>
                          취소하기
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 사장님 화면 */}
        <section id="lc-owner" aria-labelledby="lc-owner-title" className="scroll-mt-4 py-14 md:py-20" style={{ background: C.soft }}>
          <div className={wrap}>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <SectionHead id="lc-owner-title" title="사장님 화면" />
              <span className="text-[14px]" style={{ color: C.muted }}>
                회차별 신청자 표
              </span>
            </div>
            <div className="-mx-4 mt-5 overflow-x-auto px-4 sm:mx-0 sm:px-0 [scrollbar-width:thin]" role="tablist" aria-label="회차">
              <div className="flex w-max gap-1.5 pb-1">
                {sessions.map((s) => {
                  const on = ownerSid === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setOwnerSid(s.id)}
                      className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[14px] font-semibold tabular-nums ${focusRing}`}
                      style={on ? { background: C.ink, borderColor: C.ink, color: "#ffffff" } : { borderColor: C.line, background: "#ffffff", color: C.body }}
                    >
                      {md(s.date)} {s.time}
                    </button>
                  );
                })}
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                ["정원", `${CAP}`],
                ["확정", `${confirmed}`],
                ["입금 대기", `${waiting}`],
                ["대기", `${waitlist}`],
              ].map(([k, v]) => (
                <div key={k} className="min-w-0 rounded-[6px] border bg-white px-1 py-2.5" style={{ borderColor: C.line }}>
                  <dt className="truncate text-[12px]" style={{ color: C.muted }}>
                    {k}
                  </dt>
                  <dd className="text-[22px] font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="overflow-hidden rounded-[8px] border bg-white" style={{ borderColor: C.line }}>
                <table className="w-full border-collapse text-left text-[14px]">
                  <thead>
                    <tr className="border-b text-[12px]" style={{ borderColor: C.line, color: C.muted }}>
                      <th scope="col" className="hidden px-3 py-2.5 font-semibold sm:table-cell">
                        예약 번호
                      </th>
                      <th scope="col" className="px-3 py-2.5 font-semibold">
                        이름
                      </th>
                      <th scope="col" className="px-2 py-2.5 font-semibold">
                        인원
                      </th>
                      <th scope="col" className="px-2 py-2.5 font-semibold">
                        결제
                      </th>
                      <th scope="col" className="px-2 py-2.5 font-semibold">
                        변경 이력
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {rows.map((b) => (
                        <motion.tr
                          key={b.no}
                          layout={!reduce}
                          initial={reduce ? false : { backgroundColor: "#eadccf" }}
                          animate={{ backgroundColor: b.mine ? C.accentSoft : "#ffffff" }}
                          transition={{ duration: 1.2 }}
                          className="border-b align-top"
                          style={{ borderColor: C.line }}
                        >
                          <td className="hidden px-3 py-2.5 text-[13px] tabular-nums sm:table-cell">{b.no}</td>
                          <td className="px-3 py-2.5 font-semibold">{maskName(b.name)}</td>
                          <td className="px-2 py-2.5 tabular-nums">{b.qty}</td>
                          <td className="px-2 py-2.5">
                            <span className="inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[12px] font-semibold" style={statusStyle(b.status)}>
                              {b.status}
                            </span>
                            {b.pay && (
                              <span className="mt-0.5 block text-[12px]" style={{ color: C.muted }}>
                                {b.pay === "card" ? "카드" : "계좌"}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2.5 text-[12px] leading-[1.45]" style={{ color: C.body }}>
                            {b.history.length ? b.history[b.history.length - 1] : ""}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[15px] font-bold">
                  <BellRing size={16} aria-hidden /> 알림 기록
                </p>
                <ul className="mt-2 grid gap-1.5 text-[14px]">
                  {log.map((l, i) => (
                    <li key={`${l.at}-${l.text}-${i}`} className="flex gap-3 border-b pb-1.5" style={{ borderColor: C.line, color: l.mine ? C.accent : C.body, fontWeight: l.mine ? 600 : 400 }}>
                      <span className="shrink-0 tabular-nums">{l.at}</span>
                      <span className="min-w-0">{l.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10 text-[14px] leading-[1.8]" style={{ borderColor: C.line, color: C.muted }}>
        <div className={`${wrap} grid gap-2 md:grid-cols-[1fr_auto] md:items-end`}>
          <div>
            <p className="text-[17px] font-bold" style={{ color: C.ink }}>
              곰파트너
            </p>
            <DemoMakerInfo className="mt-1" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function RefundRule({ highlight }: { highlight?: number }) {
  return (
    <div className="mt-5 rounded-[8px] border bg-white p-4" style={{ borderColor: C.line }}>
      <p className="text-[15px] font-bold">환불 규정</p>
      <dl className="mt-2 grid gap-1 text-[14px]" style={{ color: C.body }}>
        {REFUND_RULE.map(([k, v], i) => (
          <div key={k} className="flex flex-wrap justify-between gap-x-3 rounded-[4px] px-1.5 py-1" style={highlight === i ? { background: C.accentSoft, color: C.ink, fontWeight: 700 } : undefined}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Confirm({ done, label, onPaid, onRestart, onChange, reduce }: { done: Booking; label: string; onPaid: () => void; onRestart: () => void; onChange: () => void; reduce: boolean }) {
  const [paying, setPaying] = useState(false);
  const pay = () => {
    setPaying(true);
    window.setTimeout(
      () => {
        onPaid();
        setPaying(false);
      },
      reduce ? 0 : 900,
    );
  };
  return (
    <motion.div role="status" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="mt-4 rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.soft }}>
      <p className="flex items-center gap-1.5 text-[16px] font-bold">
        <Check size={18} aria-hidden style={{ color: C.accent }} /> {done.status === "대기" ? "대기 신청이 들어갔어요" : "신청이 들어갔어요"}
      </p>
      <p className="mt-4 text-[13px] font-semibold" style={{ color: C.muted }}>
        예약 번호
      </p>
      <p className="text-[30px] font-bold leading-none tabular-nums tracking-[0.02em]">{done.no}</p>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px]">
        <dt style={{ color: C.muted }}>회차</dt>
        <dd className="font-semibold tabular-nums">{label}</dd>
        <dt style={{ color: C.muted }}>인원</dt>
        <dd className="font-semibold">{done.qty}명</dd>
        <dt style={{ color: C.muted }}>상태</dt>
        <dd className="font-semibold">{done.status}</dd>
      </dl>
      {done.status === "입금 대기" && (
        <div className="mt-4 rounded-[6px] border bg-white p-3 text-[14px]" style={{ borderColor: C.line }}>
          <p className="tabular-nums">
            가상은행 000-0000-0000, <b>{won(PRICE * done.qty)}</b>
          </p>
          <button type="button" onClick={pay} disabled={paying} className={`${btnLine} mt-2 h-11 w-full text-[15px] disabled:opacity-60`} style={{ borderColor: C.accent, color: C.accent }}>
            {paying ? "입금 확인 중" : "입금했다 치고 보기"}
          </button>
        </div>
      )}
      {done.status === "대기" && <p className="mt-3 text-[14px]">자리가 나면 문자로 먼저 알려 드려요. 결제는 그때 해요.</p>}
      <p className="mt-3 flex items-center gap-1.5 text-[14px]" style={{ color: C.body }}>
        <Phone size={14} aria-hidden /> 같은 내용이 문자로도 가요.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={onChange} className={`${btnLine} h-12 min-w-0 text-[15px]`} style={{ borderColor: C.accent, color: C.accent }}>
          날짜 바꾸기/취소
        </button>
        <button type="button" onClick={onRestart} className={`${btnLine} h-12 min-w-0 text-[15px]`} style={{ borderColor: C.line }}>
          한 번 더 신청
        </button>
      </div>
    </motion.div>
  );
}
