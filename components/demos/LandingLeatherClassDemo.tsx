"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Gowun_Batang, Nanum_Pen_Script } from "next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, CalendarDays, Check, Clock, CreditCard, Landmark, MapPin, Phone, RotateCcw, Users } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName } from "@/components/demos/LeadReceivedPanel";

/* 가죽 공방 원데이 클래스 신청 랜딩 샘플. 공방이 실제로 운영하는 수업 신청 페이지처럼 만든다.
   공방, 강사, 신청자, 계좌, 주소는 모두 가상이다. 머리글은 곰파트너와 "가죽 공방 샘플"만 적는다.
   네이버폼·통장·카톡으로 받던 이야기는 샘플 표지(data/scenes/part3.ts)가 맡는다. 이 화면에는 웹툰 컷을 넣지 않는다.

   디자인: 공방 작업대. 크라프트지 바탕, 가죽 질감 판, 바느질 땀(점선), 도장 찍은 꼬리표, 고운바탕 제목과 펜 글씨 메모. 색은 가죽 갈색과 실 색.

   상호작용(모두 브라우저 안에서만 돈다)
   1. 회차 신청: 남은 자리가 실시간으로 줄고, 0이 되면 그 회차는 마감되고 대기 신청으로 바뀐다.
   2. 결제: 같은 흐름 안에서 카드 또는 이 신청 전용 계좌. 실제 결제는 일어나지 않는다(카드 번호를 받지 않는다).
   3. 예약 확인·변경: 예약 번호와 휴대폰 뒷자리로 찾아 날짜를 바꾸거나 취소한다. 환불 규정대로 금액이 계산된다.
   4. 사장님 화면: 회차별 신청자 표(결제 상태, 변경 이력)와 알림 기록.
   5. 가죽 색 고르기: 첫 화면 카드지갑 그림 색이 바뀐다. */

const serif = Gowun_Batang({ weight: ["400", "700"], preload: false, display: "swap" });
const pen = Nanum_Pen_Script({ weight: "400", preload: false, display: "swap" });
const serifF = { fontFamily: `${serif.style.fontFamily}, "Nanum Myeongjo", serif` } as const;
const penF = { fontFamily: `${pen.style.fontFamily}, cursive` } as const;

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
  kraft: "#ece1cd",
  kraftDeep: "#dccbac",
  card: "#fbf6ec",
  ink: "#2b1d14",
  muted: "#6b5844",
  line: "#cdb995",
  leather: "#7a3f1f",
  leatherDark: "#5a2c14",
  thread: "#f1dcb4",
  olive: "#4d5a2c",
  honey: "#e9b65c",
  error: "#a3261b",
};

// 크라프트지 결. 작은 SVG 노이즈를 바탕에 깐다
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .32 0 0 0 0 .22 0 0 0 0 .12 0 0 0 .16 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
const kraftBg = { backgroundColor: C.kraft, backgroundImage: NOISE } as const;
const leatherBg = (base: string) => ({
  backgroundColor: base,
  backgroundImage: `${NOISE}, radial-gradient(120% 90% at 20% 0%, rgba(255,226,180,.22), transparent 60%), radial-gradient(90% 80% at 100% 100%, rgba(0,0,0,.28), transparent 70%)`,
});

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#256ef4]";
// 버튼 안쪽에 바느질 땀을 두른다
const btnLeather = `inline-flex items-center justify-center gap-2 rounded-[6px] font-bold text-[#fbf1df] shadow-[0_2px_0_rgba(43,29,20,.35)] transition-[background-color,transform] duration-150 active:translate-y-px motion-reduce:transition-none ${focusRing}`;
const stitchIn = { outline: `1.5px dashed rgba(241,220,180,.6)`, outlineOffset: "-6px" } as const;
const btnLine = `inline-flex items-center justify-center gap-2 rounded-[6px] border-[1.5px] bg-transparent font-bold transition-colors hover:bg-[#fffaf0] disabled:opacity-40 ${focusRing}`;
const field = `h-12 w-full min-w-0 rounded-[6px] border-[1.5px] bg-[#fffaf1] px-3 text-[16px] font-normal outline-none transition-colors focus:border-[#7a3f1f] ${focusRing}`;
const labelCls = "grid min-w-0 gap-1.5 text-[14px] font-semibold";

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

/** 오늘 이틀 뒤부터 2주 안의 수요일·금요일 저녁, 토요일 오전·오후, 일요일 오후 중 앞 8개 */
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

/* ── 그림과 작은 조각 ─────────────────────────────── */

/** 바느질 땀 테두리. 카드 안쪽에 점선을 한 줄 두른다 */
function Stitch({ color = "rgba(122,63,31,.45)", inset = 8, radius = 6 }: { color?: string; inset?: number; radius?: number }) {
  return <span aria-hidden className="pointer-events-none absolute border-[1.5px] border-dashed" style={{ inset, borderColor: color, borderRadius: radius }} />;
}

/** 각인 도장 미리보기 */
function Stamp({ text }: { text: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-12 min-w-[70px] shrink-0 items-center justify-center rounded-[8px] px-3 text-[20px] font-bold tracking-[0.16em]"
      style={{ ...serifF, ...leatherBg("#9a5a2e"), color: "#3e1d0b", boxShadow: "inset 0 2px 4px rgba(0,0,0,.45), inset 0 -1px 0 rgba(255,255,255,.2)", textShadow: "0 1px 0 rgba(255,220,180,.35)" }}
    >
      {text || "ABC"}
    </span>
  );
}

/** 첫 화면 그림: 재단 매트 위 카드지갑, 바늘, 실타래. 색은 고른 가죽 */
function WalletArt({ color, initials }: { color: string; initials: string }) {
  return (
    <svg viewBox="0 0 420 340" className="h-auto w-full" role="img" aria-label="재단 매트 위에 놓인 가죽 카드지갑과 바늘, 실타래">
      <defs>
        <pattern id="lc-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#3f6b52" strokeOpacity=".35" strokeWidth="1" />
        </pattern>
        <filter id="lc-grain">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .28 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <linearGradient id="lc-shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".22" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".22" />
        </linearGradient>
      </defs>
      {/* 재단 매트 */}
      <rect x="10" y="22" width="400" height="300" rx="10" fill="#2f5a45" />
      <rect x="10" y="22" width="400" height="300" rx="10" fill="url(#lc-grid)" />
      <g fill="#cfe3d6" fillOpacity=".7" fontSize="9" fontFamily="ui-monospace, monospace">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <text key={n} x={10 + n * 40 - 3} y="36">
            {n}
          </text>
        ))}
      </g>
      {/* 뒤쪽 가죽 조각 */}
      <path d="M268 60 L392 74 L384 170 L300 186 L258 130 Z" fill="#c99a63" />
      <path d="M268 60 L392 74 L384 170 L300 186 L258 130 Z" fill="#000" filter="url(#lc-grain)" />
      {/* 카드지갑 */}
      <g transform="translate(70 96) rotate(-7)">
        <rect x="0" y="0" width="210" height="140" rx="12" fill={color} />
        <rect x="0" y="0" width="210" height="140" rx="12" fill="#000" filter="url(#lc-grain)" />
        <rect x="0" y="0" width="210" height="140" rx="12" fill="url(#lc-shine)" />
        {/* 앞주머니 */}
        <path d="M0 64 Q105 54 210 64 L210 128 Q210 140 198 140 L12 140 Q0 140 0 128 Z" fill={color} />
        <path d="M0 64 Q105 54 210 64 L210 128 Q210 140 198 140 L12 140 Q0 140 0 128 Z" fill="#000" fillOpacity=".12" />
        <path d="M2 64 Q105 54 208 64" fill="none" stroke="#000" strokeOpacity=".35" strokeWidth="1.5" />
        {/* 바느질 땀 */}
        <rect x="9" y="9" width="192" height="122" rx="7" fill="none" stroke="#f1dcb4" strokeWidth="2.2" strokeDasharray="7 5" strokeLinecap="round" />
        {/* 각인 */}
        <text x="105" y="112" textAnchor="middle" fontSize="20" fontWeight="700" letterSpacing="4" fill="#000" fillOpacity=".38" style={serifF}>
          {initials || "ABC"}
        </text>
      </g>
      {/* 실타래 */}
      <g transform="translate(318 230)">
        <rect x="-26" y="-34" width="52" height="68" rx="6" fill="#d9c7a3" />
        <rect x="-20" y="-26" width="40" height="52" rx="4" fill="#f1dcb4" />
        {[-18, -10, -2, 6, 14].map((y) => (
          <line key={y} x1="-20" y1={y} x2="20" y2={y + 4} stroke="#cfae74" strokeWidth="1.2" />
        ))}
        <path d="M20 10 C 50 30, 20 70, -60 60" fill="none" stroke="#f1dcb4" strokeWidth="2" />
      </g>
      {/* 바늘 두 개 */}
      <line x1="46" y1="290" x2="196" y2="262" stroke="#c9ccd0" strokeWidth="3" strokeLinecap="round" />
      <line x1="56" y1="304" x2="206" y2="280" stroke="#c9ccd0" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="190" cy="263" rx="5" ry="1.6" fill="#2f5a45" transform="rotate(-10 190 263)" />
      <ellipse cx="200" cy="281" rx="5" ry="1.6" fill="#2f5a45" transform="rotate(-9 200 281)" />
    </svg>
  );
}

function SeatDots({ left }: { left: number }) {
  return (
    <span aria-hidden className="flex gap-[3px]">
      {Array.from({ length: CAP }, (_, i) => (
        <span key={i} className="h-[7px] w-[7px] rounded-full border" style={{ borderColor: C.leather, background: i < CAP - left ? C.leather : "transparent" }} />
      ))}
    </span>
  );
}

function SectionHead({ id, kicker, title }: { id: string; kicker: string; title: string }) {
  return (
    <div>
      <p className="text-[24px] leading-none" style={{ ...penF, color: C.leather }}>
        {kicker}
      </p>
      <h2 id={id} className="mt-2 text-[28px] font-bold leading-[1.25] md:text-[34px]" style={serifF}>
        {title}
      </h2>
    </div>
  );
}

const statusStyle = (s: Status): React.CSSProperties =>
  s === "결제 완료"
    ? { background: C.olive, color: "#f4efe0", borderColor: C.olive }
    : s === "입금 대기"
      ? { background: "#f3d48f", color: C.ink, borderColor: "#c99a3c" }
      : s === "대기"
        ? { background: "#efe4d0", color: C.ink, borderColor: C.line }
        : { background: "transparent", color: "#8a7a66", borderColor: C.line, textDecoration: "line-through" };

/* ── 페이지 ─────────────────────────────── */

export function LandingLeatherClassDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const sessions = useMemo(() => makeSessions(today), [today]);
  const byId = useMemo(() => Object.fromEntries(sessions.map((s) => [s.id, s])), [sessions]);
  const label = (id: string) => (byId[id] ? `${md(byId[id].date)} ${byId[id].time}` : "");

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

  /* 예약 확인·변경 */
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
    <div className="min-h-screen overflow-x-clip pb-24 text-[16px] leading-[1.6]" style={{ ...kraftBg, color: C.ink }}>
      {/* 머리글 */}
      <header className="sticky top-0 z-30 border-b border-dashed backdrop-blur-sm" style={{ borderColor: "rgba(122,63,31,.45)", background: "rgba(236,225,205,.92)" }}>
        <div className={`${wrap} flex h-16 items-center justify-between gap-3`}>
          <a href="#top" className={`inline-flex min-w-0 items-center gap-2 rounded-[4px] ${focusRing}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
            <img src="/images/logo.svg" alt="" aria-hidden width={30} height={30} className="h-[30px] w-[30px] shrink-0" />
            <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-[20px] font-bold tracking-[-0.02em]" style={serifF}>
                곰파트너
              </span>
              <span className="text-[13px] font-semibold" style={{ color: C.muted }}>
                가죽 공방 샘플
              </span>
            </span>
          </a>
          <nav aria-label="이 페이지 차례" className="hidden items-center gap-6 text-[15px] font-semibold md:flex">
            {[
              ["수업 소개", "lc-about"],
              ["일정·신청", "lc-apply"],
              ["예약 확인", "lc-change"],
              ["사장님 화면", "lc-owner"],
            ].map(([t, id]) => (
              <a key={id} href={`#${id}`} className={`rounded-[4px] underline-offset-[6px] hover:underline ${focusRing}`} style={{ textDecorationStyle: "dashed" }}>
                {t}
              </a>
            ))}
          </nav>
          <a href="#lc-apply" className={`${btnLeather} h-10 shrink-0 px-4 text-[15px] hover:brightness-110`} style={{ ...leatherBg(C.leather), ...stitchIn }}>
            신청
          </a>
        </div>
      </header>

      <main id="top">
        {/* 첫 화면 */}
        <section aria-labelledby="lc-title" className={`${wrap} grid items-center gap-10 pb-14 pt-10 md:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:pb-20`}>
          <div className="min-w-0">
            <p className="inline-flex -rotate-2 items-center border-[1.5px] px-2.5 py-1 text-[13px] font-bold tracking-[0.12em]" style={{ borderColor: C.leather, color: C.leather, boxShadow: `inset 0 0 0 2px ${C.kraft}, inset 0 0 0 3px ${C.leather}` }}>
              원데이 클래스
            </p>
            <h1 id="lc-title" className="mt-5 text-[44px] font-bold leading-[1.12] tracking-[-0.02em] md:text-[60px]" style={serifF}>
              카드지갑 만들기
            </h1>
            <p className="mt-5 max-w-[30em] text-[17px] leading-[1.75] md:text-[18px]" style={{ color: "#4a3626" }}>
              가죽을 자르고 손바느질로 꿰매요. 두 시간 뒤에는 이니셜을 새긴 카드지갑을 들고 가요.
            </p>
            <dl className="mt-7 grid max-w-[460px] grid-cols-2 gap-x-6 gap-y-3 border-y border-dashed py-4 text-[15px]" style={{ borderColor: "rgba(122,63,31,.4)" }}>
              {(
                [
                  [CreditCard, "수강료", `${won(PRICE)}, 재료 포함`],
                  [Clock, "시간", "2시간"],
                  [Users, "정원", `회차당 ${CAP}명`],
                  [MapPin, "장소", "서울 ㅇㅇ구, 2층"],
                ] as const
              ).map(([I, k, v]) => (
                <div key={k} className="flex min-w-0 items-start gap-2">
                  <I size={17} aria-hidden className="mt-1 shrink-0" style={{ color: C.leather }} />
                  <div className="min-w-0">
                    <dt className="text-[13px]" style={{ color: C.muted }}>
                      {k}
                    </dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#lc-apply" className={`${btnLeather} h-13 px-7 py-3.5 text-[17px] hover:brightness-110`} style={{ ...leatherBg(C.leather), ...stitchIn }}>
                <CalendarDays size={18} aria-hidden /> 날짜 고르기
              </a>
              <a href="#lc-change" className={`${btnLine} h-13 px-5 py-3.5 text-[16px]`} style={{ borderColor: C.leather, color: C.leatherDark }}>
                예약 확인
              </a>
            </div>
            {soonest && (
              <p className="mt-5 text-[23px] leading-tight" style={{ ...penF, color: C.leather }}>
                가장 빠른 수업 {label(soonest.id)}, {left(soonest.id)}자리 남았어요
              </p>
            )}
          </div>

          <div className="relative min-w-0">
            <div className="relative overflow-hidden rounded-[14px] p-3 shadow-[0_18px_40px_rgba(60,35,15,.28)] sm:p-4" style={leatherBg(C.leatherDark)}>
              <Stitch color="rgba(241,220,180,.55)" inset={8} radius={9} />
              <WalletArt color={leatherColor} initials={initials} />
            </div>
            {/* 가격 꼬리표 */}
            <div className="absolute -top-4 right-4 rotate-[7deg] rounded-[4px] px-4 pb-2.5 pt-5 shadow-[0_6px_14px_rgba(60,35,15,.25)] sm:right-8" style={{ ...kraftBg, backgroundColor: "#f3e7cf" }} aria-hidden>
              <span className="absolute left-1/2 top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-full" style={{ background: C.leatherDark }} />
              <span className="block text-[26px] leading-none" style={{ ...penF, color: C.leatherDark }}>
                {won(PRICE)}
              </span>
            </div>
            <fieldset className="mt-5">
              <legend className="text-[14px] font-semibold" style={{ color: C.muted }}>
                가죽 색 미리 보기
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {LEATHERS.map((l) => {
                  const on = l.id === leatherId;
                  return (
                    <button key={l.id} type="button" onClick={() => setLeatherId(l.id)} aria-pressed={on} className={`inline-flex h-11 items-center gap-2 rounded-full border-[1.5px] pl-1.5 pr-3.5 text-[15px] font-semibold transition-colors ${focusRing}`} style={{ borderColor: on ? C.leather : C.line, background: on ? "#fffaf0" : "transparent" }}>
                      <span aria-hidden className="h-8 w-8 rounded-full" style={{ ...leatherBg(l.color), boxShadow: on ? `0 0 0 2px ${C.kraft}, 0 0 0 3.5px ${C.leather}` : "inset 0 0 0 1px rgba(0,0,0,.15)" }} />
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </section>

        {/* 수업 소개 */}
        <section id="lc-about" aria-labelledby="lc-about-title" className="scroll-mt-20 border-y border-dashed py-14 md:py-20" style={{ borderColor: "rgba(122,63,31,.35)", background: "rgba(251,246,236,.55)" }}>
          <div className={wrap}>
            <SectionHead id="lc-about-title" kicker="수업 순서" title="두 시간 동안 하는 일" />
            <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(([t, h, b]) => (
                <li key={h} className="relative min-w-0 rounded-[10px] p-5 pt-6" style={{ background: C.card, boxShadow: "0 1px 0 rgba(60,35,15,.08), 0 8px 20px rgba(60,35,15,.06)" }}>
                  <Stitch />
                  <p className="text-[24px] leading-none" style={{ ...penF, color: C.leather }}>
                    {t}
                  </p>
                  <h3 className="mt-2 text-[19px] font-bold" style={serifF}>
                    {h}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-[1.65]" style={{ color: "#4a3626" }}>
                    {b}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 수업 신청 */}
        <section id="lc-apply" aria-labelledby="lc-apply-title" className="scroll-mt-20 py-14 md:py-20">
          <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12`}>
            <div>
              <SectionHead id="lc-apply-title" kicker="일정" title="수업 신청" />
              <p className="mt-4 text-[16px] leading-[1.7]" style={{ color: "#4a3626" }}>
                회차마다 {CAP}자리예요. 자리가 다 차면 대기 신청을 받고, 취소가 나오면 순서대로 문자 드려요.
              </p>
              <RefundRule />
            </div>

            <div className="relative min-w-0 rounded-[12px] p-5 sm:p-7" style={{ background: C.card, boxShadow: "0 1px 0 rgba(60,35,15,.08), 0 14px 30px rgba(60,35,15,.1)" }}>
              <Stitch inset={9} radius={8} />
              <div className="relative flex flex-wrap items-center justify-between gap-3">
                <p className="text-[18px] font-bold" style={serifF}>
                  {done ? "신청 확인" : step === 1 ? "날짜와 시간" : step === 2 ? "신청하는 분" : "결제"}
                </p>
                {!done && (
                  <ol className="flex shrink-0 gap-1.5 text-[13px] font-semibold" aria-label="신청 단계">
                    {["회차", "정보", "결제"].map((s, i) => (
                      <li
                        key={s}
                        aria-current={step === i + 1 ? "step" : undefined}
                        className="rounded-full border px-2.5 py-0.5"
                        style={step === i + 1 ? { background: C.leather, borderColor: C.leather, color: "#fbf1df" } : step > i + 1 ? { borderColor: C.leather, color: C.leather } : { borderColor: C.line, color: C.muted }}
                      >
                        {step > i + 1 && <Check size={12} aria-hidden className="mr-0.5 inline" />}
                        {s}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="relative">
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
                              className={`flex w-full min-w-0 flex-col items-start gap-1 rounded-[8px] border-[1.5px] px-3 py-2.5 text-left transition-colors ${focusRing}`}
                              style={{ borderColor: on ? C.leather : C.line, background: on ? "#f6e6cc" : "#fffaf1", boxShadow: on ? `inset 0 0 0 1px ${C.leather}` : undefined }}
                            >
                              <span className="text-[16px] font-bold tabular-nums">{md(s.date)}</span>
                              <span className="text-[14px] tabular-nums" style={{ color: C.muted }}>
                                {s.time}
                              </span>
                              <SeatDots left={Math.max(l, 0)} />
                              <span className="text-[13px] font-bold" style={{ color: l <= 0 ? C.error : l <= 2 ? "#9a4a12" : C.olive }}>
                                {l <= 0 ? "마감, 대기 가능" : `남은 자리 ${l}`}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-dashed pt-4" style={{ borderColor: C.line }}>
                      <span className="text-[16px] font-bold">
                        {label(sid)} {full ? "· 마감" : `· 남은 자리 ${left(sid)}`}
                      </span>
                      {full ? (
                        <button type="button" onClick={toStep2} className={`${btnLine} h-12 px-5 text-[16px]`} style={{ borderColor: C.leather, color: C.leatherDark }}>
                          대기 신청
                        </button>
                      ) : (
                        <button type="button" onClick={toStep2} className={`${btnLeather} h-12 px-6 text-[16px] hover:brightness-110`} style={{ ...leatherBg(C.leather), ...stitchIn }}>
                          이 회차로
                        </button>
                      )}
                    </div>
                  </div>
                ) : step === 2 ? (
                  <form onSubmit={toStep3} className="mt-4" noValidate>
                    <p className="text-[16px] font-bold">
                      {label(sid)}{" "}
                      {full && (
                        <span className="ml-1 rounded-full px-2 py-0.5 text-[13px]" style={{ background: "#efe4d0" }}>
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
                                className={`h-12 w-full min-w-0 rounded-[6px] border-[1.5px] text-[16px] font-bold disabled:opacity-40 ${focusRing}`}
                                style={qty === n ? { background: C.leatherDark, borderColor: C.leatherDark, color: "#fbf1df" } : { borderColor: C.line, background: "#fffaf1" }}
                              >
                                {n}명
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      )}
                      <label className={labelCls}>
                        각인 이니셜(영문 3자)
                        <span className="flex min-w-0 items-center gap-2">
                          <input value={initials} onChange={(e) => setInitials(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3))} className={field} style={{ borderColor: C.line }} />
                          <Stamp text={initials} />
                        </span>
                      </label>
                    </div>
                    <label className="mt-4 flex items-start gap-2.5 text-[15px] font-semibold">
                      <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#7a3f1f]" />
                      환불 규정을 확인했어요
                    </label>
                    {err && (
                      <p role="alert" className="mt-2 text-[14px] font-bold" style={{ color: C.error }}>
                        {err}
                      </p>
                    )}
                    <div className="mt-5 flex gap-2">
                      <button type="button" onClick={() => setStep(1)} className={`${btnLine} h-12 px-4 text-[15px]`} style={{ borderColor: C.line }}>
                        회차 다시
                      </button>
                      <button type="submit" className={`${btnLeather} h-12 flex-1 text-[16px] hover:brightness-110`} style={{ ...leatherBg(C.leather), ...stitchIn }}>
                        {full ? "대기 신청하기" : `결제로 · ${won(PRICE * qty)}`}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-4">
                    <p className="text-[16px] font-bold">
                      {label(sid)} · {qty}명 · {maskName(name)}
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
                          className={`flex h-14 min-w-0 items-center justify-center gap-2 rounded-[8px] border-[1.5px] text-[16px] font-bold ${focusRing}`}
                          style={pay === v ? { borderColor: C.leather, background: "#f6e6cc", boxShadow: `inset 0 0 0 1px ${C.leather}` } : { borderColor: C.line, background: "#fffaf1" }}
                        >
                          <I size={19} aria-hidden /> {t}
                        </button>
                      ))}
                    </div>
                    {pay === "card" ? (
                      <div className="relative mt-3 overflow-hidden rounded-[12px] p-5 text-[#fbf1df]" style={leatherBg(C.leatherDark)}>
                        <Stitch color="rgba(241,220,180,.5)" inset={7} radius={8} />
                        <p className="relative text-[13px] opacity-80">테스트 카드</p>
                        <p className="relative mt-3 whitespace-nowrap font-mono text-[15px] tracking-[0.08em] min-[380px]:text-[18px] min-[380px]:tracking-[0.14em]">0000 0000 0000 0000</p>
                        <p className="relative mt-2 text-[13px] opacity-80">번호를 받지 않는 연습용 카드예요</p>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-[12px] border-[1.5px] border-dashed p-4" style={{ borderColor: C.leather, background: "#f6ead4" }}>
                        <p className="text-[13px] font-semibold" style={{ color: C.muted }}>
                          이 신청 전용 계좌
                        </p>
                        <p className="mt-1 font-mono text-[18px] font-bold tabular-nums">가상은행 000-0000-0000</p>
                        <p className="mt-1 text-[14px]">입금자명이 달라도 이 계좌로 들어오면 자동으로 확인돼요.</p>
                      </div>
                    )}
                    <p className="mt-3 text-[13px]" style={{ color: C.muted }}>
                      샘플이라 실제로 결제되지 않아요.
                    </p>
                    {err && (
                      <p role="alert" className="mt-2 text-[14px] font-bold" style={{ color: C.error }}>
                        {err}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => setStep(2)} className={`${btnLine} h-12 px-4 text-[15px]`} style={{ borderColor: C.line }}>
                        이전
                      </button>
                      <button type="button" onClick={() => finish(pay)} className={`${btnLeather} h-12 flex-1 text-[16px] hover:brightness-110`} style={{ ...leatherBg(C.leather), ...stitchIn }}>
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
        <section aria-labelledby="lc-faq-title" className="border-t border-dashed py-14 md:py-16" style={{ borderColor: "rgba(122,63,31,.35)" }}>
          <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12`}>
            <SectionHead id="lc-faq-title" kicker="묻고 답하기" title="오기 전에" />
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {FAQ.map(([q, a]) => (
                <div key={q} className="border-b border-dashed py-4" style={{ borderColor: C.line }}>
                  <dt className="text-[17px] font-bold" style={serifF}>
                    {q}
                  </dt>
                  <dd className="mt-1 text-[15px] leading-[1.65]" style={{ color: "#4a3626" }}>
                    {a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 예약 확인·변경 */}
        <section id="lc-change" ref={changeRef} aria-labelledby="lc-change-title" className="scroll-mt-20 py-14 md:py-20" style={{ background: "rgba(220,203,172,.45)" }}>
          <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12`}>
            <div>
              <SectionHead id="lc-change-title" kicker="예약하신 분" title="예약 확인·변경" />
              <p className="mt-4 text-[16px] leading-[1.7]" style={{ color: "#4a3626" }}>
                날짜는 수업 2일 전까지 한 번 바꿀 수 있어요.
              </p>
            </div>
            <div className="relative min-w-0 rounded-[12px] p-5 sm:p-7" style={{ background: C.card, boxShadow: "0 1px 0 rgba(60,35,15,.08), 0 14px 30px rgba(60,35,15,.1)" }}>
              <Stitch inset={9} radius={8} />
              <form onSubmit={lookup} className="relative grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <label className={labelCls}>
                  예약 번호
                  <input value={qNo} onChange={(e) => setQNo(e.target.value)} className={`${field} font-mono`} style={{ borderColor: C.line }} />
                </label>
                <label className={labelCls}>
                  휴대폰 뒷자리
                  <input value={qTail} onChange={(e) => setQTail(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className={field} style={{ borderColor: C.line }} />
                </label>
                <button type="submit" className={`${btnLeather} h-12 w-full px-6 text-[16px] hover:brightness-110 sm:w-auto`} style={{ ...leatherBg(C.ink), ...stitchIn }}>
                  조회
                </button>
              </form>
              {qErr && (
                <p role="alert" className="relative mt-2 text-[14px] font-bold" style={{ color: C.error }}>
                  {qErr}
                </p>
              )}
              {cur && curSession && (
                <div className="relative mt-5 rounded-[10px] border-[1.5px] p-4 sm:p-5" style={{ borderColor: C.line, background: "#fffaf1" }}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-[14px] font-bold" style={{ color: C.muted }}>
                        {cur.no}
                      </p>
                      <p className="text-[20px] font-bold" style={serifF}>
                        {label(cur.session)}
                      </p>
                      <p className="text-[15px]" style={{ color: "#4a3626" }}>
                        {maskName(cur.name)} · {cur.qty}명 · 수업까지 {daysLeft}일
                      </p>
                    </div>
                    <span className="rounded-full border px-2.5 py-0.5 text-[13px] font-bold" style={statusStyle(cur.status)}>
                      {cur.status}
                    </span>
                  </div>
                  {cur.history.length > 0 && (
                    <ul className="mt-2 grid gap-0.5 text-[14px]" style={{ color: "#4a3626" }}>
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
                      <button type="button" disabled={!canMove} onClick={() => setMode("move")} className={`${btnLine} h-12 min-w-0 text-[15px]`} style={{ borderColor: C.leather, color: C.leatherDark }}>
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
                      <p className="text-[14px] font-bold">바꿀 회차 · 수업 2일 전까지 한 번</p>
                      <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {movable.map((s) => (
                          <li key={s.id} className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setMoveTo(s.id)}
                              aria-pressed={moveTo === s.id}
                              className={`w-full min-w-0 rounded-[8px] border-[1.5px] px-2.5 py-2 text-left text-[14px] font-bold ${focusRing}`}
                              style={moveTo === s.id ? { borderColor: C.leather, background: "#f6e6cc", boxShadow: `inset 0 0 0 1px ${C.leather}` } : { borderColor: C.line, background: "#fffaf1" }}
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
                        <button type="button" disabled={!moveTo} onClick={doMove} className={`${btnLeather} h-12 flex-1 text-[16px] hover:brightness-110 disabled:opacity-40`} style={{ ...leatherBg(C.leather), ...stitchIn }}>
                          {moveTo ? `${label(moveTo)}로 바꾸기` : "회차를 고르세요"}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === "cancel" && (
                    <div className="mt-4">
                      <RefundRule highlight={daysLeft >= 5 ? 0 : daysLeft >= 2 ? 1 : 2} />
                      <p className="mt-3 text-[16px] font-bold">
                        {cur.status === "결제 완료" ? `돌려받는 금액 ${won(PRICE * cur.qty * refundRate(daysLeft))}` : cur.status === "대기" ? "대기 신청을 취소해요." : "아직 입금 전이라 돌려받을 금액이 없어요."}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button type="button" onClick={() => setMode("view")} className={`${btnLine} h-12 px-4 text-[15px]`} style={{ borderColor: C.line }}>
                          그만두기
                        </button>
                        <button type="button" onClick={doCancel} className={`${btnLeather} h-12 flex-1 text-[16px] hover:brightness-110`} style={{ ...leatherBg(C.error), ...stitchIn }}>
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
        <section id="lc-owner" aria-labelledby="lc-owner-title" className="scroll-mt-20 py-14 md:py-20">
          <div className={wrap}>
            <div className="relative overflow-hidden rounded-[16px] p-4 text-[#f6ead4] sm:p-7 md:p-9" style={leatherBg("#3a2416")}>
              <Stitch color="rgba(241,220,180,.4)" inset={10} radius={10} />
              <div className="relative flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-[24px] leading-none" style={{ ...penF, color: C.honey }}>
                    관리자
                  </p>
                  <h2 id="lc-owner-title" className="mt-2 text-[26px] font-bold md:text-[30px]" style={serifF}>
                    사장님 화면
                  </h2>
                </div>
                <span className="text-[14px] text-[#f6ead4]/70">회차별 신청자 표</span>
              </div>
              <div className="relative -mx-4 mt-5 overflow-x-auto px-4 sm:mx-0 sm:px-0 [scrollbar-width:thin]" role="tablist" aria-label="회차">
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
                        style={on ? { background: "#f6ead4", borderColor: "#f6ead4", color: C.ink } : { borderColor: "rgba(246,234,212,.35)", color: "rgba(246,234,212,.85)" }}
                      >
                        {md(s.date)} {s.time}
                      </button>
                    );
                  })}
                </div>
              </div>
              <dl className="relative mt-4 grid grid-cols-4 gap-2 text-center">
                {[
                  ["정원", `${CAP}`],
                  ["확정", `${confirmed}`],
                  ["입금 대기", `${waiting}`],
                  ["대기", `${waitlist}`],
                ].map(([k, v]) => (
                  <div key={k} className="min-w-0 rounded-[8px] border border-dashed px-1 py-2.5" style={{ borderColor: "rgba(246,234,212,.28)" }}>
                    <dt className="truncate text-[12px] text-[#f6ead4]/70">{k}</dt>
                    <dd className="text-[22px] font-bold tabular-nums" style={serifF}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="relative mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="overflow-hidden rounded-[10px]" style={{ background: C.card, color: C.ink }}>
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
                            initial={reduce ? false : { backgroundColor: "#f3d48f" }}
                            animate={{ backgroundColor: b.mine ? "#f8e8c4" : "#fbf6ec" }}
                            transition={{ duration: 1.2 }}
                            className="border-b border-dashed align-top"
                            style={{ borderColor: C.line }}
                          >
                            <td className="hidden px-3 py-2.5 font-mono text-[13px] sm:table-cell">{b.no}</td>
                            <td className="px-3 py-2.5 font-bold">{maskName(b.name)}</td>
                            <td className="px-2 py-2.5 tabular-nums">{b.qty}</td>
                            <td className="px-2 py-2.5">
                              <span className="inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[12px] font-bold" style={statusStyle(b.status)}>
                                {b.status}
                              </span>
                              {b.pay && (
                                <span className="mt-0.5 block text-[12px]" style={{ color: C.muted }}>
                                  {b.pay === "card" ? "카드" : "계좌"}
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-2.5 text-[12px] leading-[1.45]" style={{ color: "#4a3626" }}>
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
                      <li key={`${l.at}-${l.text}-${i}`} className="flex gap-3 border-b border-dashed pb-1.5" style={{ borderColor: "rgba(246,234,212,.18)", color: l.mine ? C.honey : "rgba(246,234,212,.82)", fontWeight: l.mine ? 700 : 400 }}>
                        <span className="shrink-0 tabular-nums">{l.at}</span>
                        <span className="min-w-0">{l.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-dashed py-10 text-[14px] leading-[1.8]" style={{ borderColor: "rgba(122,63,31,.45)", color: C.muted }}>
        <div className={`${wrap} grid gap-2 md:grid-cols-[1fr_auto] md:items-end`}>
          <div>
            <p className="text-[17px] font-bold" style={{ ...serifF, color: C.ink }}>
              곰파트너
            </p>
            <p>서울 ㅇㅇ구 ㅇㅇ로 00, 2층 · 수업 문의 02-000-0000 · 화요일 쉼</p>
          </div>
          <p>가죽 공방 샘플 · 수업, 이름, 계좌는 모두 가상입니다.</p>
        </div>
      </footer>
    </div>
  );
}

function RefundRule({ highlight }: { highlight?: number }) {
  return (
    <div className="mt-5 rounded-[8px] border-[1.5px] border-dashed p-4" style={{ borderColor: "rgba(122,63,31,.45)", background: "rgba(251,246,236,.6)" }}>
      <p className="text-[15px] font-bold" style={serifF}>
        환불 규정
      </p>
      <dl className="mt-2 grid gap-1 text-[14px]">
        {REFUND_RULE.map(([k, v], i) => (
          <div key={k} className="flex flex-wrap justify-between gap-x-3 rounded-[4px] px-1.5 py-1" style={highlight === i ? { background: "#f3d48f", fontWeight: 700 } : undefined}>
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
    <motion.div role="status" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="relative mt-4 overflow-hidden rounded-[12px] border-[1.5px] border-dashed p-5" style={{ borderColor: C.leather, background: "#f6ead4" }}>
      {done.status === "결제 완료" && (
        <span aria-hidden className="absolute right-4 top-4 rotate-[-10deg] rounded-[6px] border-[2.5px] px-2.5 py-1 text-[15px] font-bold tracking-[0.1em]" style={{ borderColor: C.olive, color: C.olive, ...serifF }}>
          결제 완료
        </span>
      )}
      <p className="flex items-center gap-1.5 text-[16px] font-bold">
        <Check size={18} aria-hidden /> {done.status === "대기" ? "대기 신청이 들어갔어요" : "신청이 들어갔어요"}
      </p>
      <p className="mt-4 text-[13px] font-semibold" style={{ color: C.muted }}>
        예약 번호
      </p>
      <p className="font-mono text-[30px] font-bold leading-none tracking-[0.04em]">{done.no}</p>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px]">
        <dt style={{ color: C.muted }}>회차</dt>
        <dd className="font-bold">{label}</dd>
        <dt style={{ color: C.muted }}>인원</dt>
        <dd className="font-bold">{done.qty}명</dd>
        <dt style={{ color: C.muted }}>상태</dt>
        <dd className="font-bold">{done.status}</dd>
      </dl>
      {done.status === "입금 대기" && (
        <div className="mt-4 rounded-[8px] p-3 text-[14px]" style={{ background: "#fffaf1" }}>
          <p>
            가상은행 000-0000-0000 · <b>{won(PRICE * done.qty)}</b>
          </p>
          <button type="button" onClick={pay} disabled={paying} className={`${btnLine} mt-2 h-11 w-full text-[15px] disabled:opacity-60`} style={{ borderColor: C.leather, color: C.leatherDark, background: "#f3d48f" }}>
            {paying ? "입금 확인 중" : "입금했다 치고 보기"}
          </button>
        </div>
      )}
      {done.status === "대기" && <p className="mt-3 text-[14px]">자리가 나면 문자로 먼저 알려 드려요. 결제는 그때 해요.</p>}
      <p className="mt-3 flex items-center gap-1.5 text-[14px]" style={{ color: "#4a3626" }}>
        <Phone size={14} aria-hidden /> 같은 내용이 문자로도 가요.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={onChange} className={`${btnLine} h-12 min-w-0 text-[15px]`} style={{ borderColor: C.leather, color: C.leatherDark }}>
          날짜 바꾸기·취소
        </button>
        <button type="button" onClick={onRestart} className={`${btnLine} h-12 min-w-0 text-[15px]`} style={{ borderColor: C.line }}>
          한 번 더 신청
        </button>
      </div>
    </motion.div>
  );
}
