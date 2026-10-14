"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, CalendarDays, Check, CreditCard, Landmark, MessageCircle, Phone, RotateCcw, Sheet } from "lucide-react";
import { estimateFor, manwon } from "@/data/pricing";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, useDemoToday } from "@/hooks/useDemoToday";
import { Bubble, EndCard, Gutter, Narration, Panel, Sfx, ink, maskName } from "@/components/renewal/ui";

/* 가죽 공방 원데이 클래스 신청 랜딩 샘플. 메인 웹툰처럼 위에서 아래로 읽는 한 편이고, 뒤쪽 컷이 실제로 돌아가는 신청 페이지다.
   공방 이름, 강사, 신청자, 계좌는 모두 가상이다. 머리글은 곰파트너와 "가죽 공방 샘플"만 적는다.

   이야기: 네이버폼 응답 시트, 통장 입금 내역, 카톡 변경 요청을 따로 보는 사장님 → 폼이 안 닫혀 아홉 명이 온 토요일
   → 입금자명 "토요일2시" → 밤 11시 날짜 변경 전화 → 곰이 한 페이지로 합침 → 실제 신청 → 조용해진 휴대폰.

   상호작용(모두 브라우저 안에서만 돈다)
   1. 회차 신청: 남은 자리가 실시간으로 줄고, 0이 되면 그 회차는 마감되고 대기 신청으로 바뀐다.
   2. 결제: 같은 흐름 안에서 카드 또는 이 신청 전용 계좌. 실제 결제는 일어나지 않는다(카드 번호를 받지 않는다).
   3. 예약 확인·변경: 예약 번호와 휴대폰 뒷자리로 찾아 날짜를 바꾸거나 취소한다. 환불 규정대로 금액이 계산된다.
   4. 사장님 화면: 회차별 신청자 표(결제 상태, 변경 이력)와 알림 기록.

   사진(public/images/demo-landing-leather-class): juggle, overbooked, late-call, calm. AI 생성(Z-Image-Turbo). 곰 그림은 메인 웹툰 것을 다시 쓴다. */

const IMG = "/images/demo-landing-leather-class";
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

const press =
  "border-[3px] shadow-[4px_4px_0_#1d1d1f] transition-[transform,box-shadow,background-color] duration-150 ease-out active:translate-x-1 active:translate-y-1 active:shadow-none motion-reduce:transition-none";
const field = "h-12 w-full min-w-0 rounded-[6px] border-[2.5px] bg-white px-3 text-[16px] font-normal text-[#1d1d1f] outline-none focus-visible:border-accent";
const leather = "#8a4b2a";

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

/* ── 첫 컷들: 엉킨 신청 ─────────────────────────────── */

function MessyDesk() {
  const reduce = useReducedMotionSafe();
  const sheet = [
    ["9", "박ㅅ연", "토 2시", "2"],
    ["10", "이ㅈ민", "토 2시", "1"],
    ["11", "최ㅇ나", "토 2시", "1"],
  ];
  const bank = [
    ["서연맘", "90,000"],
    ["45000", "45,000"],
    ["토요일2시", "45,000"],
  ];
  return (
    <Panel bg="#20252b" className="px-3 py-6 sm:px-5 md:px-8 md:py-9">
      <div className="grid gap-3 sm:grid-cols-2">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14, rotate: -2 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1.2 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.25 }}
          className="min-w-0 rounded-[10px] bg-white p-3 text-[13px] sm:col-span-2"
        >
          <p className="flex items-center gap-1.5 font-bold text-[#188038]">
            <Sheet size={15} aria-hidden /> 원데이 클래스 신청(응답)
          </p>
          <table className="mt-2 w-full border-collapse text-left tabular-nums">
            <thead>
              <tr className="bg-[#e6f4ea] text-[12px]">
                {["#", "이름", "희망 일시", "인원"].map((h) => (
                  <th key={h} scope="col" className="border border-[#c8d1c8] px-1.5 py-1 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sheet.map((r, i) => (
                <tr key={r[0]} className={i === 2 ? "bg-[#fde2e1] font-bold text-[#b42318]" : ""}>
                  {r.map((c, j) => (
                    <td key={j} className="border border-[#c8d1c8] px-1.5 py-1">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1.5 text-[12px] font-bold text-[#b42318]">정원 8명. 응답은 아직 받는 중.</p>
        </motion.div>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.25, delay: 0.12 }}
          className="min-w-0 rounded-[10px] bg-white p-3 text-[13px]"
        >
          <p className="flex items-center gap-1.5 font-bold text-[#1d4ed8]">
            <Landmark size={15} aria-hidden /> 입금 내역
          </p>
          <ul className="mt-2 grid gap-1.5 tabular-nums">
            {bank.map(([who, amt]) => (
              <li key={who} className="flex justify-between gap-2 border-b border-dashed border-[#d0d0d0] pb-1">
                <span className="truncate font-bold">{who}</span>
                <span className="shrink-0">+{amt}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14, rotate: 2 }}
          whileInView={{ opacity: 1, y: 0, rotate: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.25, delay: 0.24 }}
          className="min-w-0 rounded-[10px] bg-[#b2c7da] p-3 text-[13px]"
        >
          <p className="flex items-center gap-1.5 font-bold">
            <MessageCircle size={15} aria-hidden /> 카톡 3
          </p>
          <ul className="mt-2 grid gap-1.5">
            {["토요일 말고 일요일 돼요?", "저 아까 입금했어요!", "주차 돼요?"].map((t) => (
              <li key={t} className="w-fit max-w-full rounded-[10px] rounded-tl-[3px] bg-white px-2.5 py-1.5">
                {t}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
      <Narration className="mx-auto mt-5">신청은 폼, 돈은 통장, 변경은 카톡</Narration>
    </Panel>
  );
}

/* ── 실제 신청 페이지 ─────────────────────────────── */

function SeatDots({ left }: { left: number }) {
  return (
    <span aria-hidden className="flex gap-[3px]">
      {Array.from({ length: CAP }, (_, i) => (
        <span key={i} className="h-2 w-2 rounded-full border-[1.5px]" style={{ borderColor: ink, background: i < CAP - left ? ink : "#fff" }} />
      ))}
    </span>
  );
}

function Stamp({ text }: { text: string }) {
  return (
    <span
      className="inline-flex h-11 min-w-[64px] items-center justify-center rounded-[8px] px-3 font-serif text-[20px] font-bold tracking-[0.12em]"
      style={{ background: "#c98a5a", color: "#5b2c14", boxShadow: "inset 0 2px 3px rgba(0,0,0,.35), inset 0 -1px 0 rgba(255,255,255,.25)", textShadow: "0 1px 0 rgba(255,255,255,.3)" }}
    >
      {text || "ABC"}
    </span>
  );
}

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

  /* 신청 흐름 */
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sid, setSid] = useState("s1");
  const [name, setName] = useState("김하늘");
  const [phone, setPhone] = useState("010-1234-5678");
  const [qty, setQty] = useState(1);
  const [initials, setInitials] = useState("HN");
  const [pay, setPay] = useState<Pay>("card");
  const [agree, setAgree] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);
  const [err, setErr] = useState("");
  const applyRef = useRef<HTMLElement>(null);
  const changeRef = useRef<HTMLElement>(null);

  const full = left(sid) <= 0;
  const qtyOk = full || qty <= left(sid);

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
  const [ownerSid, setOwnerSid] = useState("s1");
  useEffect(() => {
    if (done) setOwnerSid(done.session);
  }, [done]);
  const rows = bookings.filter((b) => b.session === ownerSid);
  const confirmed = rows.filter(counts).reduce((s, b) => s + b.qty, 0);
  const waiting = rows.filter((b) => b.status === "입금 대기").length;
  const waitlist = rows.filter((b) => b.status === "대기").length;

  const est = estimateFor("landing-leather-class");
  const tone = (s: Status) =>
    s === "결제 완료" ? "bg-[#1d1d1f] text-white" : s === "입금 대기" ? "bg-[#ffe45c]" : s === "대기" ? "bg-[#dbe7ff]" : "bg-white text-[#6b6b6b] line-through";

  return (
    <div className="wt min-h-screen overflow-x-clip pb-24 text-[#1d1d1f]">
      <div className="md:px-4 md:py-8">
        <div className="mx-auto max-w-[720px] bg-[#fffdf8] pb-16 shadow-[0_0_0_3px_#1d1d1f]">
          <header className="flex h-16 items-center justify-between gap-3 border-b-[3px] px-4 md:px-8" style={{ borderColor: ink }}>
            <span className="inline-flex min-w-0 items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.svg" alt="" aria-hidden width={30} height={30} className="h-[30px] w-[30px] shrink-0" />
              <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-[21px] font-extrabold tracking-[-0.03em]">곰파트너</span>
                <span className="text-[13px] font-semibold text-[#5e5850]">가죽 공방 샘플</span>
              </span>
            </span>
            <a href="#lc-apply" className={`${press} inline-flex h-10 shrink-0 items-center rounded-[6px] bg-accent px-3.5 text-[15px] font-bold text-white`} style={{ borderColor: ink }}>
              신청
            </a>
          </header>

          <main className="px-4 pt-4 md:px-8 md:pt-6">
            {/* 1. 밤의 작업대 */}
            <Panel img={`${IMG}/juggle.jpg`} alt="밤늦게 작업대에서 노트북 시트와 휴대폰 두 대를 번갈아 보는 가죽 공방 사장님" className="shadow-[5px_5px_0_#1d1d1f]">
              <Narration className="absolute left-3 top-3">밤 11시 40분, 가죽 공방</Narration>
              <Bubble className="absolute bottom-16 right-3 max-w-[50%] text-[15px] md:bottom-24 md:text-[18px]" tail="top-left" delay={0.3}>
                입금 확인 몇 건 남았더라…
              </Bubble>
            </Panel>
            <h1 className="relative z-10 -mt-8 text-center font-[family-name:var(--font-sfx)] text-[38px] leading-[1.12] text-white min-[400px]:text-[44px] md:-mt-12 md:text-[60px]" style={{ WebkitTextStroke: `8px ${ink}`, paintOrder: "stroke fill" }}>
              카드지갑 만들기
              <br />
              <span style={{ color: "#e9a46b" }}>원데이 클래스</span>
            </h1>
            <p className="mt-4 text-center text-[17px] font-bold tabular-nums md:text-[19px]">
              {won(PRICE)} · 2시간 · 회차당 {CAP}명 · 재료 포함
            </p>

            <Gutter />
            <MessyDesk />

            <Gutter />
            {/* 2. 폼은 혼자 닫히지 않았다 */}
            <Panel img={`${IMG}/overbooked.jpg`} alt="여덟 자리가 다 찬 작업대 앞에서 문가에 선 아홉 번째 수강생을 보고 당황한 사장님">
              <Narration className="absolute left-3 top-3">토요일 오후 2시</Narration>
              <Bubble className="absolute bottom-4 right-4" tail="top-left">
                저… 제 자리는요?
              </Bubble>
              <Sfx className="right-6 top-14 text-[44px] md:text-[56px]" color="#ffffff" rotate={6}>
                정적
              </Sfx>
            </Panel>
            <Gutter size="sm" />
            <Narration className="mx-auto">폼은 아홉 번째 응답도 받았다</Narration>

            <Gutter />
            {/* 3. 입금자명 */}
            <Panel bg="#f4f5f6" className="px-4 pb-8 pt-14 md:px-8">
              <Narration className="absolute left-3 top-3">일요일 아침, 입금 맞추기</Narration>
              <div className="mx-auto max-w-[360px] rounded-[12px] border-[3px] bg-white p-4" style={{ borderColor: ink }}>
                <p className="text-[13px] font-bold text-[#5e5850]">입금자명</p>
                <p className="mt-1 text-[28px] font-bold">토요일2시</p>
                <p className="text-[15px] tabular-nums">+45,000원</p>
              </div>
              <div className="mt-5 flex justify-end">
                <Bubble tail="bottom-right" delay={0.3}>
                  토요일2시 님은 누구세요.
                </Bubble>
              </div>
            </Panel>

            <Gutter />
            {/* 4. 밤 11시 전화 */}
            <Panel img={`${IMG}/late-call.jpg`} alt="밤늦게 침대에서 울리는 휴대폰을 무표정하게 보는 사장님">
              <Narration className="absolute left-3 top-3">밤 11시 2분</Narration>
              <Bubble className="absolute right-3 top-14 max-w-[58%] text-[15px] md:text-[18px]" tail="bottom-left" delay={0.2}>
                선생님, 혹시 날짜 바꿀 수 있을까요?
              </Bubble>
              <Bubble className="absolute bottom-4 right-4" tail="top-left" delay={0.7}>
                …네, 고객님.
              </Bubble>
              <Sfx className="bottom-24 left-4 text-[40px] md:text-[52px]" color="#ffd43b" rotate={-8}>
                지이잉
              </Sfx>
            </Panel>

            <Gutter size="lg" />
            {/* 5. 곰 */}
            <Panel img="/images/webtoon/bear-work.jpg" alt="노트북으로 빠르게 작업하는 곰파트너 곰">
              <Bubble className="absolute left-4 top-4" tail="bottom-right" tone="blue">
                신청, 결제, 변경을 한 페이지로 합칠게요.
              </Bubble>
              <Sfx className="bottom-6 right-5 text-[44px] md:text-[56px]" rotate={6}>
                타닥타닥
              </Sfx>
            </Panel>

            <Gutter />
            {/* 6. 회차 신청 */}
            <section id="lc-apply" ref={applyRef} aria-labelledby="lc-apply-title" className="scroll-mt-4">
              <Narration className="mb-3">정원이 차면 알아서 마감</Narration>
              <div className="border-[3px] bg-white p-4 sm:p-5 md:p-7" style={{ borderColor: ink, boxShadow: `6px 6px 0 ${ink}` }}>
                <div className="flex items-center justify-between gap-3">
                  <h2 id="lc-apply-title" className="font-[family-name:var(--font-sfx)] text-[26px] font-normal leading-[1.2] md:text-[30px]">
                    수업 신청
                  </h2>
                  {!done && (
                    <ol className="flex shrink-0 gap-1.5 text-[13px] font-bold" aria-label="신청 단계">
                      {["회차", "정보", "결제"].map((s, i) => (
                        <li key={s} aria-current={step === i + 1 ? "step" : undefined} className={`rounded-full border-2 px-2.5 py-0.5 ${step === i + 1 ? "bg-accent text-white" : step > i + 1 ? "bg-[#fff3b0]" : "bg-white text-[#5e5850]"}`} style={{ borderColor: ink }}>
                          {s}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                {done ? (
                  <Confirm done={done} label={label(done.session)} onPaid={markPaid} onRestart={restart} onChange={() => changeRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })} reduce={reduce} />
                ) : step === 1 ? (
                  <div className="mt-4">
                    <p className="flex items-center gap-1.5 text-[14px] font-bold text-[#45413b]">
                      <CalendarDays size={16} aria-hidden /> 날짜와 시간
                    </p>
                    <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="회차">
                      {sessions.map((s) => {
                        const l = left(s.id);
                        const on = sid === s.id;
                        return (
                          <li key={s.id} className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setSid(s.id)}
                              aria-pressed={on}
                              className={`flex w-full min-w-0 flex-col items-start gap-1 rounded-[8px] border-[2.5px] px-2.5 py-2 text-left transition-colors ${on ? "bg-[#fff3b0]" : "bg-white hover:bg-[#fffbe6]"}`}
                              style={{ borderColor: on ? ink : "#cfc8bb" }}
                            >
                              <span className="text-[15px] font-bold tabular-nums">{md(s.date)}</span>
                              <span className="text-[14px] tabular-nums text-[#45413b]">{s.time}</span>
                              <SeatDots left={Math.max(l, 0)} />
                              <span className={`text-[13px] font-bold ${l <= 0 ? "text-[#b42318]" : l <= 2 ? "text-[#a3470f]" : "text-[#1d1d1f]"}`}>
                                {l <= 0 ? "마감, 대기 가능" : `남은 자리 ${l}`}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[8px] bg-[#f3ece0] px-3 py-2.5">
                      <span className="text-[15px] font-bold">
                        {label(sid)} {full ? "· 마감" : `· 남은 자리 ${left(sid)}`}
                      </span>
                      <button type="button" onClick={toStep2} className={`${press} h-11 rounded-[6px] px-5 text-[16px] font-bold ${full ? "bg-white" : "bg-accent text-white"}`} style={{ borderColor: ink }}>
                        {full ? "대기 신청" : "이 회차로"}
                      </button>
                    </div>
                  </div>
                ) : step === 2 ? (
                  <form onSubmit={toStep3} className="mt-4" noValidate>
                    <p className="text-[15px] font-bold">
                      {label(sid)} {full && <span className="ml-1 rounded-full bg-[#dbe7ff] px-2 py-0.5 text-[13px]">대기 신청</span>}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="grid min-w-0 gap-1 text-[14px] font-bold text-[#45413b]">
                        이름
                        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={10} autoComplete="name" className={field} style={{ borderColor: ink }} />
                      </label>
                      <label className="grid min-w-0 gap-1 text-[14px] font-bold text-[#45413b]">
                        휴대폰
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" maxLength={13} autoComplete="tel" className={field} style={{ borderColor: ink }} />
                      </label>
                      {!full && (
                        <fieldset className="min-w-0">
                          <legend className="text-[14px] font-bold text-[#45413b]">인원</legend>
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            {[1, 2].map((n) => (
                              <button key={n} type="button" onClick={() => setQty(n)} aria-pressed={qty === n} disabled={n > left(sid)} className={`h-12 w-full min-w-0 rounded-[6px] border-[2.5px] text-[16px] font-bold disabled:opacity-40 ${qty === n ? "bg-[#1d1d1f] text-white" : "bg-white"}`} style={{ borderColor: ink }}>
                                {n}명
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      )}
                      <label className="grid min-w-0 gap-1 text-[14px] font-bold text-[#45413b]">
                        각인 이니셜(영문 3자)
                        <span className="flex min-w-0 items-center gap-2">
                          <input value={initials} onChange={(e) => setInitials(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3))} className={field} style={{ borderColor: ink }} />
                          <Stamp text={initials} />
                        </span>
                      </label>
                    </div>
                    <RefundRule />
                    <label className="mt-3 flex items-start gap-2 text-[15px] font-bold">
                      <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#256ef4]" />
                      환불 규정을 확인했어요
                    </label>
                    {err && (
                      <p role="alert" className="mt-2 text-[14px] font-bold text-[#b42318]">
                        {err}
                      </p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button type="button" onClick={() => setStep(1)} className="h-12 rounded-[6px] border-[2.5px] bg-white px-4 text-[15px] font-bold" style={{ borderColor: ink }}>
                        회차 다시
                      </button>
                      <button type="submit" className={`${press} h-12 flex-1 rounded-[6px] bg-accent text-[16px] font-bold text-white`} style={{ borderColor: ink }}>
                        {full ? "대기 신청하기" : `결제로 · ${won(PRICE * qty)}`}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-4">
                    <p className="text-[15px] font-bold">
                      {label(sid)} · {qty}명 · {maskName(name)}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="결제 방법">
                      {(
                        [
                          ["card", CreditCard, "카드"],
                          ["bank", Landmark, "계좌이체"],
                        ] as const
                      ).map(([v, I, t]) => (
                        <button key={v} type="button" role="radio" aria-checked={pay === v} onClick={() => setPay(v)} className={`flex h-14 min-w-0 items-center justify-center gap-2 rounded-[8px] border-[2.5px] text-[16px] font-bold ${pay === v ? "bg-[#fff3b0]" : "bg-white"}`} style={{ borderColor: ink }}>
                          <I size={19} aria-hidden /> {t}
                        </button>
                      ))}
                    </div>
                    {pay === "card" ? (
                      <div className="mt-3 rounded-[12px] p-4 text-white" style={{ background: `linear-gradient(135deg, ${leather}, #4a2412)` }}>
                        <p className="text-[13px] opacity-80">테스트 카드</p>
                        <p className="mt-3 font-mono text-[18px] tracking-[0.14em]">0000 0000 0000 0000</p>
                        <p className="mt-2 text-[13px] opacity-80">번호를 받지 않는 연습용 카드예요</p>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-[12px] border-[2.5px] bg-[#f3ece0] p-4" style={{ borderColor: ink }}>
                        <p className="text-[13px] font-bold text-[#5e5850]">이 신청 전용 계좌</p>
                        <p className="mt-1 font-mono text-[18px] font-bold tabular-nums">가상은행 000-0000-0000</p>
                        <p className="mt-1 text-[14px]">입금자명이 달라도 이 계좌로 들어오면 자동으로 확인돼요.</p>
                      </div>
                    )}
                    <p className="mt-3 text-[13px] text-[#5e5850]">샘플이라 실제로 결제되지 않아요.</p>
                    {err && (
                      <p role="alert" className="mt-2 text-[14px] font-bold text-[#b42318]">
                        {err}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => setStep(2)} className="h-12 rounded-[6px] border-[2.5px] bg-white px-4 text-[15px] font-bold" style={{ borderColor: ink }}>
                        이전
                      </button>
                      <button type="button" onClick={() => finish(pay)} className={`${press} h-12 flex-1 rounded-[6px] bg-accent text-[16px] font-bold text-white`} style={{ borderColor: ink }}>
                        {pay === "card" ? `${won(PRICE * qty)} 결제` : "계좌 받고 신청"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <Gutter />
            {/* 7. 예약 확인·변경 */}
            <section id="lc-change" ref={changeRef} aria-labelledby="lc-change-title" className="scroll-mt-4">
              <Narration className="mb-3">밤 11시 변경은 여기서</Narration>
              <div className="border-[3px] bg-white p-4 sm:p-5 md:p-7" style={{ borderColor: ink, boxShadow: `6px 6px 0 ${ink}` }}>
                <h2 id="lc-change-title" className="font-[family-name:var(--font-sfx)] text-[26px] font-normal leading-[1.2] md:text-[30px]">
                  예약 확인·변경
                </h2>
                <form onSubmit={lookup} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <label className="grid min-w-0 gap-1 text-[14px] font-bold text-[#45413b]">
                    예약 번호
                    <input value={qNo} onChange={(e) => setQNo(e.target.value)} className={field} style={{ borderColor: ink }} />
                  </label>
                  <label className="grid min-w-0 gap-1 text-[14px] font-bold text-[#45413b]">
                    휴대폰 뒷자리
                    <input value={qTail} onChange={(e) => setQTail(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className={field} style={{ borderColor: ink }} />
                  </label>
                  <button type="submit" className={`${press} h-12 w-full rounded-[6px] bg-[#1d1d1f] px-5 text-[16px] font-bold text-white sm:w-auto`} style={{ borderColor: ink }}>
                    조회
                  </button>
                </form>
                {qErr && (
                  <p role="alert" className="mt-2 text-[14px] font-bold text-[#b42318]">
                    {qErr}
                  </p>
                )}
                {cur && curSession && (
                  <div className="mt-4 rounded-[10px] border-[2.5px] p-4" style={{ borderColor: ink }}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-[14px] font-bold text-[#5e5850]">{cur.no}</p>
                        <p className="text-[19px] font-bold">{label(cur.session)}</p>
                        <p className="text-[15px] text-[#45413b]">
                          {maskName(cur.name)} · {cur.qty}명 · 수업까지 {daysLeft}일
                        </p>
                      </div>
                      <span className={`rounded-full border-2 px-2.5 py-0.5 text-[13px] font-bold ${tone(cur.status)}`} style={{ borderColor: ink }}>
                        {cur.status}
                      </span>
                    </div>
                    {cur.history.length > 0 && (
                      <ul className="mt-2 grid gap-0.5 text-[14px] text-[#45413b]">
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
                        <button type="button" disabled={!canMove} onClick={() => setMode("move")} className="h-12 min-w-0 rounded-[6px] border-[2.5px] bg-white text-[15px] font-bold disabled:opacity-40" style={{ borderColor: ink }}>
                          날짜 바꾸기
                        </button>
                        <button type="button" disabled={!canCancel} onClick={() => setMode("cancel")} className="h-12 min-w-0 rounded-[6px] border-[2.5px] bg-white text-[15px] font-bold disabled:opacity-40" style={{ borderColor: ink }}>
                          취소
                        </button>
                        {!canMove && counts(cur) && (
                          <p className="col-span-2 text-[14px] text-[#5e5850]">{cur.changed ? "날짜 변경은 한 번까지예요." : "수업 2일 전부터는 날짜를 바꿀 수 없어요."}</p>
                        )}
                      </div>
                    )}

                    {mode === "move" && (
                      <div className="mt-4">
                        <p className="text-[14px] font-bold">바꿀 회차 · 수업 2일 전까지 한 번</p>
                        <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {movable.map((s) => (
                            <li key={s.id} className="min-w-0">
                              <button type="button" onClick={() => setMoveTo(s.id)} aria-pressed={moveTo === s.id} className={`w-full min-w-0 rounded-[8px] border-[2.5px] px-2 py-2 text-left text-[14px] font-bold ${moveTo === s.id ? "bg-[#fff3b0]" : "bg-white"}`} style={{ borderColor: moveTo === s.id ? ink : "#cfc8bb" }}>
                                {md(s.date)} {s.time}
                                <span className="block text-[13px] font-normal">남은 자리 {left(s.id)}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex gap-2">
                          <button type="button" onClick={() => setMode("view")} className="h-12 rounded-[6px] border-[2.5px] bg-white px-4 text-[15px] font-bold" style={{ borderColor: ink }}>
                            그만두기
                          </button>
                          <button type="button" disabled={!moveTo} onClick={doMove} className={`${press} h-12 flex-1 rounded-[6px] bg-accent text-[16px] font-bold text-white disabled:opacity-40`} style={{ borderColor: ink }}>
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
                          <button type="button" onClick={() => setMode("view")} className="h-12 rounded-[6px] border-[2.5px] bg-white px-4 text-[15px] font-bold" style={{ borderColor: ink }}>
                            그만두기
                          </button>
                          <button type="button" onClick={doCancel} className={`${press} h-12 flex-1 rounded-[6px] bg-[#b42318] text-[16px] font-bold text-white`} style={{ borderColor: ink }}>
                            취소하기
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            <Gutter />
            {/* 8. 사장님 화면 */}
            <section id="lc-owner" aria-labelledby="lc-owner-title" className="scroll-mt-4">
              <Narration className="mb-3">사장님 휴대폰에는 이 표 하나</Narration>
              <div className="border-[3px] bg-[#20252b] p-3 text-white sm:p-5 md:p-7" style={{ borderColor: ink, boxShadow: `6px 6px 0 ${ink}` }}>
                <div className="flex items-center justify-between gap-2">
                  <h2 id="lc-owner-title" className="font-[family-name:var(--font-sfx)] text-[24px] font-normal md:text-[28px]">
                    사장님 화면
                  </h2>
                  <span className="text-[13px] text-white/70">신청자 표</span>
                </div>
                <div className="-mx-3 mt-3 overflow-x-auto px-3 sm:mx-0 sm:px-0" role="tablist" aria-label="회차">
                  <div className="flex w-max gap-1.5">
                    {sessions.map((s) => {
                      const on = ownerSid === s.id;
                      return (
                        <button key={s.id} type="button" role="tab" aria-selected={on} onClick={() => setOwnerSid(s.id)} className={`whitespace-nowrap rounded-full border-2 px-3 py-1.5 text-[13px] font-bold tabular-nums ${on ? "border-white bg-white text-[#1d1d1f]" : "border-white/40 text-white/85"}`}>
                          {md(s.date)} {s.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-4 gap-1.5 text-center">
                  {[
                    ["정원", `${CAP}`],
                    ["확정", `${confirmed}`],
                    ["입금 대기", `${waiting}`],
                    ["대기", `${waitlist}`],
                  ].map(([k, v]) => (
                    <div key={k} className="min-w-0 rounded-[8px] bg-white/10 px-1 py-2">
                      <dt className="truncate text-[12px] text-white/70">{k}</dt>
                      <dd className="text-[20px] font-bold tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 overflow-hidden rounded-[10px] bg-white text-[#1d1d1f]">
                  <table className="w-full border-collapse text-left text-[14px]">
                    <thead>
                      <tr className="border-b-2 text-[12px] text-[#5e5850]" style={{ borderColor: ink }}>
                        <th scope="col" className="hidden px-3 py-2 sm:table-cell">예약 번호</th>
                        <th scope="col" className="px-3 py-2">이름</th>
                        <th scope="col" className="px-2 py-2">인원</th>
                        <th scope="col" className="px-2 py-2">결제</th>
                        <th scope="col" className="px-2 py-2">변경 이력</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence initial={false}>
                        {rows.map((b) => (
                          <motion.tr key={b.no} layout={!reduce} initial={reduce ? false : { backgroundColor: "#ffe45c" }} animate={{ backgroundColor: b.mine ? "#fff8cc" : "#ffffff" }} transition={{ duration: 1.2 }} className="border-b border-[#e6e0d4] align-top">
                            <td className="hidden px-3 py-2 font-mono text-[13px] sm:table-cell">{b.no}</td>
                            <td className="px-3 py-2 font-bold">{maskName(b.name)}</td>
                            <td className="px-2 py-2 tabular-nums">{b.qty}</td>
                            <td className="px-2 py-2">
                              <span className={`inline-block whitespace-nowrap rounded-full border-[1.5px] px-2 py-0.5 text-[12px] font-bold ${tone(b.status)}`} style={{ borderColor: ink }}>
                                {b.status}
                              </span>
                              {b.pay && <span className="mt-0.5 block text-[12px] text-[#5e5850]">{b.pay === "card" ? "카드" : "계좌"}</span>}
                            </td>
                            <td className="px-2 py-2 text-[12px] leading-[1.4] text-[#45413b]">{b.history.length ? b.history[b.history.length - 1] : ""}</td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <p className="flex items-center gap-1.5 text-[14px] font-bold">
                    <BellRing size={15} aria-hidden /> 알림 기록
                  </p>
                  <ul className="mt-2 grid gap-1 text-[14px]">
                    {log.map((l, i) => (
                      <li key={`${l.at}-${l.text}-${i}`} className={`flex gap-3 ${l.mine ? "font-bold text-[#ffe45c]" : "text-white/80"}`}>
                        <span className="shrink-0 tabular-nums">{l.at}</span>
                        <span className="min-w-0">{l.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <Gutter size="lg" />
            {/* 9. 다음 토요일 */}
            <Panel img={`${IMG}/calm.jpg`} alt="수강생으로 꽉 찬 작업대 앞에서 태블릿을 들고 웃는 사장님">
              <Narration className="absolute left-3 top-3">다음 토요일</Narration>
              <Bubble className="absolute bottom-4 left-4" tail="top-right">
                전화가 안 와요. 좀 이상할 만큼요.
              </Bubble>
            </Panel>

            <Gutter size="lg" />
            {est && (
              <EndCard
                title="수업·행사 신청 랜딩페이지"
                price={`이 샘플처럼 ${manwon(est.total)} · 작업 ${est.days}일`}
                items={["회차별 정원, 자동 마감, 대기 신청", "카드·계좌 결제 연동", "예약 번호로 날짜 변경·취소", "신청자 표와 알림"]}
                sample={{ href: "/landing", label: "랜딩페이지 안내" }}
                consult={{ href: `/?chat=1&msg=${encodeURIComponent("가죽 공방 원데이 클래스 샘플을 보고 문의합니다.")}`, label: "채팅 상담" }}
              />
            )}
          </main>

          <footer className="mt-16 border-t-[3px] px-4 pt-6 text-[14px] leading-[1.8] text-[#5e5850] md:px-8" style={{ borderColor: ink }}>
            <p className="text-[16px] font-bold text-[#1d1d1f]">곰파트너</p>
            <p>가죽 공방 원데이 클래스 샘플 · 수업, 이름, 계좌는 모두 가상입니다.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function RefundRule({ highlight }: { highlight?: number }) {
  return (
    <div className="mt-4 rounded-[8px] border-2 border-dashed p-3" style={{ borderColor: "#a89f8f" }}>
      <p className="text-[14px] font-bold">환불 규정</p>
      <dl className="mt-1.5 grid gap-1 text-[14px]">
        {REFUND_RULE.map(([k, v], i) => (
          <div key={k} className={`flex flex-wrap justify-between gap-x-3 rounded-[4px] px-1.5 py-0.5 ${highlight === i ? "bg-[#ffe45c] font-bold" : ""}`}>
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
    window.setTimeout(() => {
      onPaid();
      setPaying(false);
    }, reduce ? 0 : 900);
  };
  return (
    <motion.div role="status" initial={reduce ? false : { opacity: 0, y: 16, rotate: -1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 380, damping: 24 }} className="relative mt-4 rounded-[12px] border-[3px] p-4 md:p-5" style={{ borderColor: ink, background: "#f3ece0" }}>
      <p className="flex items-center gap-1.5 text-[15px] font-bold">
        <Check size={18} aria-hidden /> {done.status === "대기" ? "대기 신청이 들어갔어요" : "신청이 들어갔어요"}
      </p>
      <p className="mt-3 text-[13px] font-bold text-[#5e5850]">예약 번호</p>
      <p className="font-mono text-[30px] font-bold leading-none tracking-[0.04em]">{done.no}</p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px]">
        <dt className="text-[#5e5850]">회차</dt>
        <dd className="font-bold">{label}</dd>
        <dt className="text-[#5e5850]">인원</dt>
        <dd className="font-bold">{done.qty}명</dd>
        <dt className="text-[#5e5850]">상태</dt>
        <dd className="font-bold">{done.status}</dd>
      </dl>
      {done.status === "입금 대기" && (
        <div className="mt-3 rounded-[8px] bg-white p-3 text-[14px]">
          <p>
            가상은행 000-0000-0000 · <b>{won(PRICE * done.qty)}</b>
          </p>
          <button type="button" onClick={pay} disabled={paying} className="mt-2 h-11 w-full rounded-[6px] border-[2.5px] bg-[#ffe45c] text-[15px] font-bold disabled:opacity-60" style={{ borderColor: ink }}>
            {paying ? "입금 확인 중" : "입금했다 치고 보기"}
          </button>
        </div>
      )}
      {done.status === "대기" && <p className="mt-3 text-[14px]">자리가 나면 문자로 먼저 알려 드려요. 결제는 그때 해요.</p>}
      <p className="mt-3 flex items-center gap-1.5 text-[14px] text-[#45413b]">
        <Phone size={14} aria-hidden /> 같은 내용이 문자로도 가요.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={onChange} className="h-12 min-w-0 rounded-[6px] border-[2.5px] bg-white text-[15px] font-bold" style={{ borderColor: ink }}>
          날짜 바꾸기·취소
        </button>
        <button type="button" onClick={onRestart} className="h-12 min-w-0 rounded-[6px] border-[2.5px] bg-white text-[15px] font-bold" style={{ borderColor: ink }}>
          한 번 더 신청
        </button>
      </div>
      {done.status === "결제 완료" && (
        <Sfx className="-top-5 right-3 text-[40px]" color="#ffd43b" rotate={10} delay={0.1}>
          완료
        </Sfx>
      )}
    </motion.div>
  );
}
