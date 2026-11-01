"use client";

// 학원 출결, 알림 앱 카탈로그(11-01). 학부모 화면: 홈, 출결, 알림장, 수납, 상담
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BatteryFull,
  Bell,
  BookOpen,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  CreditCard,
  House,
  LoaderCircle,
  LogIn,
  LogOut,
  MessageCircle,
  NotebookPen,
  Phone,
  School,
  Signal,
  Wifi,
  X,
} from "lucide-react";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";
import { daysAgo, fmtKo, fmtMD, useDemoToday } from "@/hooks/useDemoToday";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

const ACADEMY = "수학 영어 학원";
const CHILD = { name: "김ㅎ늘", grade: "중학교 2학년", classes: ["중2 수학 심화반", "영어 리딩 B반"] };
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-[#2557d6] focus-visible:ring-offset-2";

type Tab = "home" | "attend" | "notes" | "pay" | "consult";
type Status = "출석" | "지각" | "결석";

const TABS: { id: Tab; label: string; icon: typeof House }[] = [
  { id: "home", label: "홈", icon: House },
  { id: "attend", label: "출결", icon: CalendarCheck },
  { id: "notes", label: "알림장", icon: NotebookPen },
  { id: "pay", label: "수납", icon: CreditCard },
  { id: "consult", label: "상담", icon: MessageCircle },
];

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isClassDay = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5;

/** 오늘이 수업일이면 오늘, 아니면 가장 최근 수업일 */
function lastClassDay(today: Date) {
  for (let i = 0; i < 7; i++) {
    const d = daysAgo(today, i);
    if (isClassDay(d)) return d;
  }
  return today;
}

/** 오늘 다음 수업일 n개 */
function nextClassDays(today: Date, n: number) {
  const out: Date[] = [];
  for (let i = 1; out.length < n && i < 30; i++) {
    const d = daysAgo(today, -i);
    if (isClassDay(d)) out.push(d);
  }
  return out;
}

type DayRecord = { date: Date; status: Status; inTime?: string; outTime?: string; note?: string; subject: string };

function monthRecords(year: number, month: number, today: Date, offset: number): DayRecord[] {
  const out: DayRecord[] = [];
  const last = new Date(year, month + 1, 0).getDate();
  let idx = 0;
  const lateIdx = 4 + Math.abs(offset);
  const absentIdx = 11 + Math.abs(offset) * 2;
  for (let day = 1; day <= last; day++) {
    const date = new Date(year, month, day);
    if (date > today || !isClassDay(date)) continue;
    const subject = date.getDay() % 2 === 1 ? "수학 심화" : "영어 리딩";
    const isToday = sameDay(date, today);
    let status: Status = "출석";
    if (!isToday && idx === lateIdx) status = "지각";
    if (!isToday && idx === absentIdx) status = "결석";
    if (status === "결석") out.push({ date, status, subject, note: "병결, 사전 연락" });
    else
      out.push({
        date,
        status,
        subject,
        inTime: status === "지각" ? "16:12" : isToday ? "15:52" : `15:${p2(40 + ((idx * 7) % 15))}`,
        outTime: isToday ? undefined : `18:${p2((idx * 3) % 10)}`,
        note: status === "지각" ? "수업 시작 후 등원" : undefined,
      });
    idx++;
  }
  return out;
}

const STATUS_STYLE: Record<Status, { chip: string; dot: string }> = {
  출석: { chip: "bg-[#e8f3ee] text-[#1f7a52]", dot: "bg-[#2f9e6b]" },
  지각: { chip: "bg-[#fdf1e0] text-[#a35b00]", dot: "bg-[#e08a00]" },
  결석: { chip: "bg-[#fdeceb] text-[#c0392b]", dot: "bg-[#d9483b]" },
};

function StatusChip({ status }: { status: Status }) {
  return (
    <span className={`inline-flex h-6 shrink-0 items-center rounded-[6px] px-2 text-[13px] font-semibold ${STATUS_STYLE[status].chip}`}>
      {status}
    </span>
  );
}

// ---------- 알림장 데이터 ----------
type Note = {
  id: string;
  kind: "숙제" | "공지";
  title: string;
  teacher: string;
  date: Date;
  body: string[];
  tasks?: string[];
  due?: string;
};

function buildNotes(today: Date, classDay: Date): Note[] {
  const next = nextClassDays(today, 2);
  const m = today.getMonth() + 1;
  return [
    {
      id: "n1",
      kind: "숙제",
      title: "일차함수 활용 숙제",
      teacher: "수학 박ㅅ연 선생님",
      date: classDay,
      body: ["오늘은 일차함수 그래프와 활용 문제를 배웠습니다.", "그래프 해석 문제에서 실수가 많아 오답 정리를 꼭 해 오도록 지도 부탁드립니다."],
      tasks: ["개념서 84~89쪽 풀기", "오답 노트 3문제 정리", "단원 확인 테스트 틀린 문제 다시 풀기"],
      due: next[0] ? fmtKo(next[0]) : undefined,
    },
    {
      id: "n2",
      kind: "공지",
      title: `${m}월 학부모 상담 주간 안내`,
      teacher: "원장실",
      date: daysAgo(classDay, 1),
      body: [
        `${m}월 둘째 주와 셋째 주에 학부모 상담을 진행합니다.`,
        "상담 탭에서 원하시는 날짜와 시간을 선택해 신청해 주세요. 전화 상담과 방문 상담 모두 가능합니다.",
        "상담 시간은 한 회에 20분입니다.",
      ],
    },
    {
      id: "n3",
      kind: "숙제",
      title: "리딩 B반 단어 시험 범위",
      teacher: "영어 이ㅈ민 선생님",
      date: daysAgo(classDay, 1),
      body: ["다음 수업 시작 전에 단어 시험이 있습니다.", "교재 Unit 6 단어 40개와 예문을 외워 오세요."],
      tasks: ["Unit 6 단어 40개 암기", "본문 낭독 녹음 1회 제출"],
      due: next[1] ? fmtKo(next[1]) : undefined,
    },
    {
      id: "n4",
      kind: "공지",
      title: "기말고사 대비 주말 보강 일정",
      teacher: "원장실",
      date: daysAgo(classDay, 4),
      body: [
        "기말고사를 앞두고 토요일 오전에 보강 수업을 엽니다.",
        "중2 수학은 10시부터 12시까지, 영어는 13시부터 15시까지입니다.",
        "참석이 어려우면 담당 선생님께 미리 알려 주세요.",
      ],
    },
    {
      id: "n5",
      kind: "공지",
      title: `${m}월 수강료 납부 안내`,
      teacher: "행정실",
      date: daysAgo(classDay, 6),
      body: [`${m}월 수강료 청구서가 발행되었습니다.`, `납부 기한은 ${m}월 10일입니다. 수납 탭에서 바로 납부하실 수 있습니다.`],
    },
    {
      id: "n6",
      kind: "숙제",
      title: "연립방정식 단원 마무리",
      teacher: "수학 박ㅅ연 선생님",
      date: daysAgo(classDay, 7),
      body: ["연립방정식 단원을 마쳤습니다. 다음 시간에 단원 평가를 봅니다."],
      tasks: ["단원 평가 대비 문제지 2장"],
    },
  ];
}

// ---------- 수납 데이터 ----------
const BILL_ITEMS = [
  { name: "중2 수학 심화반 수강료", amount: 320000 },
  { name: "영어 리딩 B반 수강료", amount: 280000 },
  { name: "교재비", amount: 18000 },
];
const BILL_TOTAL = BILL_ITEMS.reduce((s, i) => s + i.amount, 0);
const PAY_METHODS = ["신용, 체크카드", "계좌이체", "간편결제"] as const;

// ---------- 상담 데이터 ----------
const SLOTS = ["16:00", "16:30", "17:00", "19:00", "19:30", "20:00"];
const TEACHERS = ["수학 박ㅅ연 선생님", "영어 이ㅈ민 선생님", "원장 최ㅇ호"];
type Booking = { id: string; date: Date; time: string; teacher: string; type: string; status: "예약 접수" | "상담 완료" };

// ---------- 공통 조각 ----------
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[12px] bg-white p-4 ${className}`}>{children}</section>;
}

function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-[17px] font-bold text-[#191f28]">{children}</h2>
      {action}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, type = "button" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#2557d6] text-[17px] font-semibold text-white transition-colors hover:bg-[#1d48b8] disabled:bg-[#c9d1dc] disabled:text-white ${FOCUS}`}
    >
      {children}
    </button>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-[15px]">
      <dt className="shrink-0 text-[#6b7684]">{label}</dt>
      <dd className="text-right font-medium text-[#191f28]">{value}</dd>
    </div>
  );
}

// ================= 메인 =================
export function AppAcademyDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const classDay = useMemo(() => lastClassDay(today), [today]);
  const isClassToday = sameDay(classDay, today);
  const notes = useMemo(() => buildNotes(today, classDay), [today, classDay]);

  const [tab, setTab] = useState<Tab>("home");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<string[]>(["n4", "n5", "n6"]);
  const [checkedIds, setCheckedIds] = useState<string[]>(["n5", "n6"]);
  const [paid, setPaid] = useState<{ method: string } | null>(null);
  const [payStep, setPayStep] = useState<"bill" | "method" | "done">("bill");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [consultStep, setConsultStep] = useState<"list" | "form" | "done">("list");
  const [push, setPush] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 푸시 알림은 한 번만 내려왔다가 들어간다
  useEffect(() => {
    const show = setTimeout(() => setPush(true), 1400);
    const hide = setTimeout(() => setPush(false), 7400);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  const toTop = () => {
    scrollRef.current?.scrollTo({ top: 0 });
    if (window.matchMedia("(max-width: 767px)").matches) window.scrollTo({ top: 0 });
  };

  const go = (t: Tab) => {
    setTab(t);
    setNoteId(null);
    if (t === "pay" && payStep === "done") setPayStep("bill");
    if (t === "consult" && consultStep === "done") setConsultStep("list");
    toTop();
  };

  const openNote = (id: string) => {
    setTab("notes");
    setNoteId(id);
    setReadIds((r) => (r.includes(id) ? r : [...r, id]));
    toTop();
  };

  const unread = notes.filter((n) => !readIds.includes(n.id)).length;
  const note = notes.find((n) => n.id === noteId) ?? null;

  // 머리글 제목과 뒤로 가기
  let title = TABS.find((t) => t.id === tab)?.label ?? "";
  let back: (() => void) | null = null;
  if (tab === "home") title = ACADEMY;
  if (tab === "notes" && note) {
    title = note.kind;
    back = () => setNoteId(null);
  }
  if (tab === "pay" && payStep === "method") {
    title = "수강료 납부";
    back = () => setPayStep("bill");
  }
  if (tab === "consult" && consultStep === "form") {
    title = "상담 신청";
    back = () => setConsultStep("list");
  }

  const pushText = isClassToday
    ? `${CHILD.name} 학생이 15:52 등원했습니다.`
    : `새 알림장이 등록되었습니다. 이번 주 숙제를 확인해 주세요.`;

  return (
    <div className="min-h-[100dvh] bg-[#f2f4f6] text-[#191f28] md:flex md:flex-col md:items-center md:bg-[#e4e7eb] md:py-6">
      <div className="relative bg-[#f2f4f6] md:h-[min(844px,calc(100dvh-88px))] md:min-h-[640px] md:w-[390px] md:shrink-0 md:overflow-hidden md:rounded-[48px] md:border-[10px] md:border-[#17191c] md:shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)]">
        {/* 상태 표시줄(PC 화면의 휴대폰 틀 안에서만) */}
        <div className="absolute inset-x-0 top-0 z-30 hidden h-11 items-center justify-between bg-white px-7 text-[15px] font-semibold md:flex" aria-hidden="true">
          <span>16:05</span>
          <span className="flex items-center gap-1.5">
            <Signal size={16} strokeWidth={2.4} />
            <Wifi size={16} strokeWidth={2.4} />
            <BatteryFull size={20} strokeWidth={2} />
          </span>
        </div>

        <div ref={scrollRef} className="pb-[88px] md:absolute md:inset-x-0 md:bottom-0 md:top-11 md:overflow-y-auto md:overscroll-contain">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-1 border-b border-[#eceef1] bg-white px-2">
            {back ? (
              <button type="button" onClick={back} aria-label="뒤로" className={`grid h-11 w-11 place-items-center rounded-[10px] text-[#333d4b] hover:bg-[#f2f4f6] ${FOCUS}`}>
                <ChevronLeft size={24} />
              </button>
            ) : (
              <span className="ml-2 grid h-8 w-8 place-items-center rounded-[8px] bg-[#2557d6] text-white" aria-hidden="true">
                <School size={18} />
              </span>
            )}
            <h1 className="ml-1 min-w-0 flex-1 truncate text-[18px] font-bold">{title}</h1>
            <button
              type="button"
              onClick={() => go("notes")}
              aria-label={`알림장, 읽지 않은 글 ${unread}개`}
              className={`relative grid h-11 w-11 place-items-center rounded-[10px] text-[#333d4b] hover:bg-[#f2f4f6] ${FOCUS}`}
            >
              <Bell size={22} />
              {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e5483b]" />}
            </button>
          </header>

          <main className="px-4 pt-4">
            {tab === "home" && (
              <HomeView
                today={today}
                classDay={classDay}
                isClassToday={isClassToday}
                notes={notes}
                readIds={readIds}
                paid={!!paid}
                bookings={bookings}
                onOpenNote={openNote}
                onGo={go}
              />
            )}
            {tab === "attend" && <AttendView today={today} classDay={classDay} />}
            {tab === "notes" &&
              (note ? (
                <NoteDetail
                  note={note}
                  checked={checkedIds.includes(note.id)}
                  onCheck={() => setCheckedIds((c) => [...c, note.id])}
                />
              ) : (
                <NotesList notes={notes} readIds={readIds} checkedIds={checkedIds} onOpen={openNote} />
              ))}
            {tab === "pay" && (
              <PayView
                today={today}
                step={payStep}
                paid={paid}
                onStart={() => {
                  setPayStep("method");
                  toTop();
                }}
                onPaid={(method) => {
                  setPaid({ method });
                  setPayStep("done");
                  toTop();
                }}
                onDone={() => {
                  setPayStep("bill");
                  toTop();
                }}
              />
            )}
            {tab === "consult" && (
              <ConsultView
                today={today}
                step={consultStep}
                bookings={bookings}
                onStart={() => {
                  setConsultStep("form");
                  toTop();
                }}
                onSubmit={(b) => {
                  setBookings((list) => [b, ...list]);
                  setConsultStep("done");
                  toTop();
                }}
                onDone={() => {
                  setConsultStep("list");
                  toTop();
                }}
              />
            )}
          </main>
        </div>

        {/* 하단 탭 */}
        <nav aria-label="주 메뉴" className="fixed inset-x-0 bottom-0 z-30 border-t border-[#eceef1] bg-white pb-[env(safe-area-inset-bottom)] md:absolute md:pb-3">
          <ul className="mx-auto grid max-w-[480px] grid-cols-5">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => go(id)}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-[60px] w-full flex-col items-center justify-center gap-1 text-[12px] ${active ? "font-bold text-[#2557d6]" : "font-medium text-[#8b95a1]"} ${FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0`}
                  >
                    <span className="relative">
                      <Icon size={22} strokeWidth={active ? 2.4 : 1.9} />
                      {id === "notes" && unread > 0 && <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-[#e5483b]" />}
                    </span>
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 푸시 알림 */}
        <AnimatePresence>
          {push && (
            <motion.div
              role="status"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -110 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -110 }}
              transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 34 }}
              className="fixed inset-x-2 top-2 z-[70] md:absolute md:top-12"
            >
              <div className="flex items-start gap-1 rounded-[16px] bg-white/95 py-1 pl-3 pr-1 shadow-[0_10px_30px_-8px_rgba(15,23,42,0.35)] ring-1 ring-black/5 backdrop-blur">
                <button
                  type="button"
                  onClick={() => {
                    setPush(false);
                    if (isClassToday) go("home");
                    else openNote("n1");
                  }}
                  className={`flex min-h-[56px] min-w-0 flex-1 items-start gap-3 rounded-[12px] py-2 text-left ${FOCUS}`}
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-[#2557d6] text-white" aria-hidden="true">
                    <School size={19} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-[13px] text-[#6b7684]">
                      <span className="font-semibold text-[#333d4b]">{ACADEMY}</span>지금
                    </span>
                    <span className="mt-0.5 block text-[15px] leading-[1.45] text-[#191f28]">{pushText}</span>
                  </span>
                </button>
                <button type="button" onClick={() => setPush(false)} aria-label="알림 닫기" className={`grid h-11 w-11 shrink-0 place-items-center rounded-[10px] text-[#8b95a1] ${FOCUS}`}>
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="px-4 pb-[96px] text-center text-[#6b7684] md:pb-0">
        <DemoMakerInfo className="mt-6" />
      </footer>
    </div>
  );
}

// ================= 홈 =================
function HomeView({
  today,
  classDay,
  isClassToday,
  notes,
  readIds,
  paid,
  bookings,
  onOpenNote,
  onGo,
}: {
  today: Date;
  classDay: Date;
  isClassToday: boolean;
  notes: Note[];
  readIds: string[];
  paid: boolean;
  bookings: Booking[];
  onOpenNote: (id: string) => void;
  onGo: (t: Tab) => void;
}) {
  const records = monthRecords(classDay.getFullYear(), classDay.getMonth(), today, 0);
  const present = records.filter((r) => r.status !== "결석").length;
  const rate = records.length ? Math.round((present / records.length) * 100) : 100;
  const m = today.getMonth() + 1;
  const subject = classDay.getDay() % 2 === 1 ? "수학 심화" : "영어 리딩";

  const steps = [
    { icon: LogIn, label: "등원", time: "15:52", desc: "출입 단말기 확인", done: true },
    { icon: BookOpen, label: "수업", time: "16:00", desc: `${subject} 2교시`, done: !isClassToday, now: isClassToday },
    { icon: LogOut, label: "하원", time: isClassToday ? "18:00 예정" : "18:04", desc: isClassToday ? "수업이 끝나면 알려 드립니다" : "학원 출입문 확인", done: !isClassToday },
  ];

  return (
    <div className="space-y-3">
      <Card>
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e9eefb] text-[17px] font-bold text-[#2557d6]" aria-hidden="true">
            {CHILD.name.slice(-1)}
          </span>
          <div className="min-w-0">
            <p className="text-[18px] font-bold">
              {CHILD.name} <span className="text-[15px] font-medium text-[#6b7684]">{CHILD.grade}</span>
            </p>
            <p className="mt-0.5 text-[14px] text-[#6b7684]">{CHILD.classes.join(", ")}</p>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle action={<span className="text-[14px] text-[#6b7684]">{fmtKo(classDay)}</span>}>
          {isClassToday ? "오늘 등하원" : "최근 등하원"}
        </SectionTitle>
        <ol className="relative">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.label} className="relative flex gap-3 pb-4 last:pb-0">
                {i < steps.length - 1 && <span className={`absolute left-[17px] top-9 h-[calc(100%-36px)] w-[2px] ${s.done ? "bg-[#2557d6]" : "bg-[#e5e8eb]"}`} aria-hidden="true" />}
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${s.done ? "bg-[#2557d6] text-white" : s.now ? "border-2 border-[#2557d6] bg-white text-[#2557d6]" : "border-2 border-[#e5e8eb] bg-white text-[#b0b8c1]"}`}
                  aria-hidden="true"
                >
                  <Icon size={17} />
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="flex flex-wrap items-center gap-x-2 text-[16px] font-semibold">
                    {s.label}
                    <span className={`text-[15px] font-medium ${s.done || s.now ? "text-[#191f28]" : "text-[#8b95a1]"}`}>{s.time}</span>
                    {s.now && <span className="rounded-[6px] bg-[#e9eefb] px-2 py-0.5 text-[12px] font-semibold text-[#2557d6]">수업 중</span>}
                  </p>
                  <p className="mt-0.5 text-[14px] text-[#6b7684]">{s.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => onGo("attend")} className={`rounded-[12px] bg-white p-4 text-left ${FOCUS}`}>
          <p className="text-[14px] text-[#6b7684]">{classDay.getMonth() + 1}월 출석률</p>
          <p className="mt-1 text-[22px] font-bold">{rate}%</p>
          <p className="mt-0.5 text-[13px] text-[#8b95a1]">수업 {records.length}회 중 {present}회</p>
        </button>
        <button type="button" onClick={() => onGo("pay")} className={`rounded-[12px] bg-white p-4 text-left ${FOCUS}`}>
          <p className="text-[14px] text-[#6b7684]">{m}월 수강료</p>
          <p className="mt-1 text-[22px] font-bold">{won(BILL_TOTAL)}</p>
          <p className={`mt-0.5 text-[13px] font-semibold ${paid ? "text-[#1f7a52]" : "text-[#c0392b]"}`}>{paid ? "납부 완료" : `미납, ${m}월 10일까지`}</p>
        </button>
      </div>

      <Card>
        <SectionTitle
          action={
            <button type="button" onClick={() => onGo("notes")} className={`-mr-2 flex h-11 items-center gap-0.5 rounded-[8px] px-2 text-[14px] text-[#6b7684] ${FOCUS}`}>
              전체 보기 <ChevronRight size={16} />
            </button>
          }
        >
          알림장
        </SectionTitle>
        <ul className="-mx-4 divide-y divide-[#f2f4f6]">
          {notes.slice(0, 3).map((n) => (
            <li key={n.id}>
              <NoteRow note={n} unread={!readIds.includes(n.id)} onOpen={() => onOpenNote(n.id)} />
            </li>
          ))}
        </ul>
      </Card>

      <Card className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f2f4f6] text-[#4e5968]" aria-hidden="true">
          <MessageCircle size={20} />
        </span>
        <div className="min-w-0 flex-1">
          {bookings[0] ? (
            <>
              <p className="text-[15px] font-semibold">{fmtKo(bookings[0].date)} {bookings[0].time} 상담</p>
              <p className="truncate text-[14px] text-[#6b7684]">{bookings[0].teacher}, {bookings[0].type}</p>
            </>
          ) : (
            <>
              <p className="text-[15px] font-semibold">{m}월 학부모 상담 신청</p>
              <p className="text-[14px] text-[#6b7684]">전화, 방문 상담 20분</p>
            </>
          )}
        </div>
        <button type="button" onClick={() => onGo("consult")} className={`h-11 shrink-0 rounded-[8px] bg-[#f2f4f6] px-3 text-[14px] font-semibold text-[#333d4b] ${FOCUS}`}>
          {bookings[0] ? "내역 보기" : "신청하기"}
        </button>
      </Card>
    </div>
  );
}

// ================= 출결 =================
function AttendView({ today, classDay }: { today: Date; classDay: Date }) {
  const [offset, setOffset] = useState(0);
  const base = new Date(classDay.getFullYear(), classDay.getMonth() + offset, 1);
  const year = base.getFullYear();
  const month = base.getMonth();
  const records = monthRecords(year, month, today, offset);
  const [selected, setSelected] = useState<number | null>(null);
  const selDay = selected ?? (offset === 0 ? classDay.getDate() : records[records.length - 1]?.date.getDate() ?? null);
  const selRecord = records.find((r) => r.date.getDate() === selDay);

  const first = new Date(year, month, 1).getDay();
  const last = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: last }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const count = (s: Status) => records.filter((r) => r.status === s).length;
  const changeMonth = (d: number) => {
    setOffset((o) => o + d);
    setSelected(null);
  };

  return (
    <div className="space-y-3">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={() => changeMonth(-1)} disabled={offset <= -2} aria-label="이전 달" className={`grid h-11 w-11 place-items-center rounded-[10px] text-[#333d4b] hover:bg-[#f2f4f6] disabled:text-[#d1d6db] ${FOCUS}`}>
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-[17px] font-bold" aria-live="polite">
            {year}년 {month + 1}월
          </h2>
          <button type="button" onClick={() => changeMonth(1)} disabled={offset >= 0} aria-label="다음 달" className={`grid h-11 w-11 place-items-center rounded-[10px] text-[#333d4b] hover:bg-[#f2f4f6] disabled:text-[#d1d6db] ${FOCUS}`}>
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {(["출석", "지각", "결석"] as Status[]).map((s) => (
            <div key={s} className="rounded-[10px] bg-[#f7f8fa] py-2">
              <p className="flex items-center justify-center gap-1.5 text-[13px] text-[#6b7684]">
                <span className={`h-2 w-2 rounded-full ${STATUS_STYLE[s].dot}`} aria-hidden="true" />
                {s}
              </p>
              <p className="mt-0.5 text-[18px] font-bold">{count(s)}회</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-7 text-center text-[13px] text-[#8b95a1]" aria-hidden="true">
          {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
            <span key={d} className={`py-1 ${i === 0 ? "text-[#d9483b]" : ""}`}>
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day, i) => {
            if (!day) return <span key={`e${i}`} />;
            const rec = records.find((r) => r.date.getDate() === day);
            const isSel = selDay === day;
            const isToday = sameDay(new Date(year, month, day), today);
            const label = `${month + 1}월 ${day}일${rec ? `, ${rec.status}` : ""}${isToday ? ", 오늘" : ""}`;
            return (
              <button
                key={day}
                type="button"
                disabled={!rec}
                onClick={() => setSelected(day)}
                aria-pressed={isSel}
                aria-label={label}
                className={`mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-full text-[15px] ${FOCUS} ${
                  isSel ? "bg-[#2557d6] font-bold text-white" : isToday ? "font-bold text-[#2557d6] ring-1 ring-inset ring-[#2557d6]" : rec ? "text-[#191f28] hover:bg-[#f2f4f6]" : "text-[#c5ccd3]"
                }`}
              >
                {day}
                <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${rec ? (isSel ? "bg-white" : STATUS_STYLE[rec.status].dot) : "bg-transparent"}`} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </Card>

      {selRecord && (
        <Card>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[16px] font-bold">{fmtKo(selRecord.date)}</h3>
            <StatusChip status={selRecord.status} />
          </div>
          <dl className="mt-2 divide-y divide-[#f2f4f6]">
            <Row label="수업" value={selRecord.subject} />
            {selRecord.inTime && <Row label="등원" value={selRecord.inTime} />}
            {selRecord.inTime && <Row label="하원" value={selRecord.outTime ?? "수업 중"} />}
            {selRecord.note && <Row label="비고" value={selRecord.note} />}
          </dl>
        </Card>
      )}

      <Card>
        <SectionTitle>출결 기록</SectionTitle>
        <ul className="-mx-4 divide-y divide-[#f2f4f6]">
          {[...records].reverse().map((r) => (
            <li key={r.date.getDate()}>
              <button type="button" onClick={() => setSelected(r.date.getDate())} className={`flex min-h-[56px] w-full items-center gap-3 px-4 py-2 text-left hover:bg-[#f9fafb] ${FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0`}>
                <span className="w-[52px] shrink-0 text-[15px] font-semibold">{fmtMD(r.date)}</span>
                <span className="min-w-0 flex-1 text-[14px] text-[#6b7684]">
                  {r.subject}
                  {r.inTime ? `, ${r.inTime} 등원` : `, ${r.note}`}
                </span>
                <StatusChip status={r.status} />
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// ================= 알림장 =================
function NoteRow({ note, unread, onOpen }: { note: Note; unread: boolean; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className={`flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#f9fafb] ${FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0`}>
      <span className={`shrink-0 rounded-[6px] px-2 py-0.5 text-[12px] font-semibold ${note.kind === "숙제" ? "bg-[#e9eefb] text-[#2557d6]" : "bg-[#f2f4f6] text-[#4e5968]"}`}>{note.kind}</span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-[15px] ${unread ? "font-bold" : "font-medium"}`}>{note.title}</span>
        <span className="mt-0.5 block text-[13px] text-[#8b95a1]">
          {note.teacher}, {fmtMD(note.date)}
        </span>
      </span>
      {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-[#e5483b]" aria-label="읽지 않음" />}
    </button>
  );
}

function NotesList({ notes, readIds, checkedIds, onOpen }: { notes: Note[]; readIds: string[]; checkedIds: string[]; onOpen: (id: string) => void }) {
  const [filter, setFilter] = useState<"전체" | "숙제" | "공지">("전체");
  const list = filter === "전체" ? notes : notes.filter((n) => n.kind === filter);
  const waiting = notes.filter((n) => !checkedIds.includes(n.id)).length;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div role="group" aria-label="알림장 분류" className="flex gap-2">
          {(["전체", "숙제", "공지"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`h-11 rounded-full px-4 text-[15px] font-semibold ${filter === f ? "bg-[#191f28] text-white" : "bg-white text-[#4e5968]"} ${FOCUS}`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-[13px] text-[#6b7684]">확인 대기 {waiting}건</span>
      </div>
      <Card className="!p-0">
        <ul className="divide-y divide-[#f2f4f6]">
          {list.map((n) => (
            <li key={n.id}>
              <NoteRow note={n} unread={!readIds.includes(n.id)} onOpen={() => onOpen(n.id)} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function NoteDetail({ note, checked, onCheck }: { note: Note; checked: boolean; onCheck: () => void }) {
  return (
    <div className="space-y-3">
      <Card>
        <span className={`inline-block rounded-[6px] px-2 py-0.5 text-[12px] font-semibold ${note.kind === "숙제" ? "bg-[#e9eefb] text-[#2557d6]" : "bg-[#f2f4f6] text-[#4e5968]"}`}>{note.kind}</span>
        <h2 className="mt-2 text-[20px] font-bold leading-[1.4]">{note.title}</h2>
        <p className="mt-1 text-[14px] text-[#8b95a1]">
          {note.teacher}, {fmtKo(note.date)}
        </p>
        <div className="mt-4 space-y-2 border-t border-[#f2f4f6] pt-4 text-[16px] leading-[1.6] text-[#333d4b]">
          {note.body.map((b) => (
            <p key={b}>{b}</p>
          ))}
        </div>
      </Card>
      {note.tasks && (
        <Card>
          <SectionTitle action={note.due && <span className="text-[14px] text-[#6b7684]">{note.due}까지</span>}>숙제</SectionTitle>
          <ul className="space-y-2">
            {note.tasks.map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[16px] leading-[1.5]">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2557d6]" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
      )}
      <div className="pt-1">
        {checked ? (
          <p className="flex h-[52px] items-center justify-center gap-2 rounded-[10px] bg-[#e8f3ee] text-[16px] font-semibold text-[#1f7a52]" role="status">
            <CircleCheck size={20} /> 학부모 확인 완료
          </p>
        ) : (
          <PrimaryButton onClick={onCheck}>확인했습니다</PrimaryButton>
        )}
      </div>
    </div>
  );
}

// ================= 수납 =================
function PayView({
  today,
  step,
  paid,
  onStart,
  onPaid,
  onDone,
}: {
  today: Date;
  step: "bill" | "method" | "done";
  paid: { method: string } | null;
  onStart: () => void;
  onPaid: (method: string) => void;
  onDone: () => void;
}) {
  const [method, setMethod] = useState<string>(PAY_METHODS[0]);
  const [processing, setProcessing] = useState(false);
  const m = today.getMonth() + 1;
  const history = [1, 2, 3].map((i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 5 + i);
    return { label: `${d.getMonth() + 1}월 수강료`, date: d };
  });

  const pay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onPaid(method);
    }, 1100);
  };

  if (step === "done" && paid) {
    return (
      <div className="space-y-3">
        <Card className="pb-6 pt-8 text-center">
          <CircleCheck size={52} className="mx-auto text-[#2557d6]" strokeWidth={1.8} />
          <h2 className="mt-3 text-[22px] font-bold">납부 완료</h2>
          <p className="mt-1 text-[15px] text-[#6b7684]">{m}월 수강료 납부가 처리되었습니다.</p>
          <dl className="mt-5 divide-y divide-[#f2f4f6] border-t border-[#f2f4f6] text-left">
            <Row label="납부 금액" value={won(BILL_TOTAL)} />
            <Row label="결제 수단" value={paid.method} />
            <Row label="납부일" value={`${fmtKo(today)} 16:06`} />
            <Row label="승인 번호" value="30482917" />
          </dl>
        </Card>
        <PrimaryButton onClick={onDone}>확인</PrimaryButton>
      </div>
    );
  }

  if (step === "method") {
    return (
      <div className="space-y-3">
        <Card>
          <p className="text-[14px] text-[#6b7684]">{m}월 수강료</p>
          <p className="mt-1 text-[24px] font-bold">{won(BILL_TOTAL)}</p>
        </Card>
        <Card>
          <fieldset>
            <legend className="mb-3 text-[17px] font-bold">결제 수단</legend>
            <div className="space-y-2">
              {PAY_METHODS.map((pm) => {
                const on = method === pm;
                return (
                  <label
                    key={pm}
                    className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-[10px] border px-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2557d6] ${on ? "border-[#2557d6] bg-[#f3f6fd]" : "border-[#e5e8eb] bg-white"}`}
                  >
                    <input type="radio" name="pay-method" value={pm} checked={on} onChange={() => setMethod(pm)} className="sr-only" />
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-[#2557d6]" : "border-[#c5ccd3]"}`} aria-hidden="true">
                      {on && <span className="h-2.5 w-2.5 rounded-full bg-[#2557d6]" />}
                    </span>
                    <span className={`text-[16px] ${on ? "font-semibold" : ""}`}>{pm}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </Card>
        <PrimaryButton onClick={pay} disabled={processing}>
          {processing ? (
            <>
              <LoaderCircle size={20} className="motion-safe:animate-spin" /> 결제 진행 중
            </>
          ) : (
            `${won(BILL_TOTAL)} 납부하기`
          )}
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[15px] font-semibold text-[#4e5968]">{m}월 수강료</p>
            <p className="mt-1 text-[26px] font-bold">{won(BILL_TOTAL)}</p>
          </div>
          <span className={`mt-1 inline-flex h-7 items-center rounded-[6px] px-2.5 text-[13px] font-semibold ${paid ? "bg-[#e8f3ee] text-[#1f7a52]" : "bg-[#fdeceb] text-[#c0392b]"}`}>{paid ? "납부 완료" : "미납"}</span>
        </div>
        <p className="mt-1 text-[14px] text-[#6b7684]">납부 기한 {m}월 10일</p>
        <dl className="mt-4 divide-y divide-[#f2f4f6] border-t border-[#f2f4f6]">
          {BILL_ITEMS.map((it) => (
            <Row key={it.name} label={it.name} value={won(it.amount)} />
          ))}
        </dl>
        <div className="mt-4">
          {paid ? (
            <p className="flex h-[52px] items-center justify-center gap-2 rounded-[10px] bg-[#f2f4f6] text-[15px] font-semibold text-[#4e5968]">
              <CircleCheck size={19} className="text-[#1f7a52]" /> {fmtKo(today)} {paid.method}로 납부
            </p>
          ) : (
            <PrimaryButton onClick={onStart}>납부하기</PrimaryButton>
          )}
        </div>
      </Card>
      <Card>
        <SectionTitle>납부 내역</SectionTitle>
        <ul className="-mx-4 divide-y divide-[#f2f4f6]">
          {history.map((h) => (
            <li key={h.label} className="flex min-h-[56px] items-center gap-3 px-4 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">{h.label}</p>
                <p className="text-[13px] text-[#8b95a1]">{fmtKo(h.date)} 납부, 신용, 체크카드</p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-semibold">{won(BILL_TOTAL)}</p>
                <p className="text-[13px] font-semibold text-[#1f7a52]">납부 완료</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

// ================= 상담 =================
function ConsultView({
  today,
  step,
  bookings,
  onStart,
  onSubmit,
  onDone,
}: {
  today: Date;
  step: "list" | "form" | "done";
  bookings: Booking[];
  onStart: () => void;
  onSubmit: (b: Booking) => void;
  onDone: () => void;
}) {
  const days = useMemo(() => nextClassDays(today, 6), [today]);
  const [type, setType] = useState("전화 상담");
  const [teacher, setTeacher] = useState(TEACHERS[0]);
  const [dayIdx, setDayIdx] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [memo, setMemo] = useState("");

  const past: Booking = { id: "past", date: daysAgo(today, 34), time: "19:00", teacher: TEACHERS[0], type: "전화 상담", status: "상담 완료" };
  const all = [...bookings, past];
  const latest = bookings[0];

  if (step === "done" && latest) {
    return (
      <div className="space-y-3">
        <Card className="pb-6 pt-8 text-center">
          <CircleCheck size={52} className="mx-auto text-[#2557d6]" strokeWidth={1.8} />
          <h2 className="mt-3 text-[22px] font-bold">상담 신청 완료</h2>
          <p className="mt-1 text-[15px] text-[#6b7684]">선생님이 확인하면 알림으로 알려 드립니다.</p>
          <dl className="mt-5 divide-y divide-[#f2f4f6] border-t border-[#f2f4f6] text-left">
            <Row label="일시" value={`${fmtKo(latest.date)} ${latest.time}`} />
            <Row label="방식" value={latest.type} />
            <Row label="담당" value={latest.teacher} />
            <Row label="연락처" value="010-1234-****" />
          </dl>
        </Card>
        <PrimaryButton onClick={onDone}>확인</PrimaryButton>
      </div>
    );
  }

  if (step === "form") {
    const closed = (i: number, s: string) => (i * 3 + SLOTS.indexOf(s)) % 4 === 1;
    const submit = () => {
      if (dayIdx === null || !time) return;
      onSubmit({ id: `b${bookings.length + 1}`, date: days[dayIdx], time, teacher, type, status: "예약 접수" });
      setDayIdx(null);
      setTime(null);
      setMemo("");
    };
    return (
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Card>
          <fieldset>
            <legend className="mb-3 text-[17px] font-bold">상담 방식</legend>
            <div className="grid grid-cols-2 gap-2">
              {["전화 상담", "방문 상담"].map((t) => (
                <ChoiceRadio key={t} name="type" value={t} checked={type === t} onChange={() => setType(t)} icon={t === "전화 상담" ? Phone : School} />
              ))}
            </div>
          </fieldset>
        </Card>
        <Card>
          <label htmlFor="consult-teacher" className="mb-3 block text-[17px] font-bold">
            담당 선생님
          </label>
          <select
            id="consult-teacher"
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            className={`h-[52px] w-full rounded-[10px] border border-[#e5e8eb] bg-white px-3 text-[16px] ${FOCUS}`}
          >
            {TEACHERS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Card>
        <Card>
          <fieldset>
            <legend className="mb-3 text-[17px] font-bold">날짜</legend>
            <div className="grid grid-cols-3 gap-2">
              {days.map((d, i) => {
                const on = dayIdx === i;
                return (
                  <button
                    key={d.getTime()}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setDayIdx(i);
                      setTime(null);
                    }}
                    className={`flex h-[56px] flex-col items-center justify-center rounded-[10px] border text-[15px] ${on ? "border-[#2557d6] bg-[#2557d6] font-bold text-white" : "border-[#e5e8eb] bg-white text-[#191f28]"} ${FOCUS}`}
                  >
                    <span className={`text-[12px] ${on ? "text-white/85" : "text-[#8b95a1]"}`}>{"일월화수목금토"[d.getDay()]}요일</span>
                    {d.getMonth() + 1}월 {d.getDate()}일
                  </button>
                );
              })}
            </div>
          </fieldset>
        </Card>
        <Card>
          <fieldset disabled={dayIdx === null}>
            <legend className="mb-3 text-[17px] font-bold">시간</legend>
            {dayIdx === null ? (
              <p className="rounded-[10px] bg-[#f7f8fa] py-4 text-center text-[15px] text-[#8b95a1]">날짜를 먼저 선택해 주세요</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {SLOTS.map((s) => {
                  const off = closed(dayIdx, s);
                  const on = time === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={off}
                      aria-pressed={on}
                      onClick={() => setTime(s)}
                      className={`flex h-12 flex-col items-center justify-center rounded-[10px] border text-[15px] ${
                        off ? "border-[#f2f4f6] bg-[#f7f8fa] text-[#b0b8c1]" : on ? "border-[#2557d6] bg-[#2557d6] font-bold text-white" : "border-[#e5e8eb] bg-white"
                      } ${FOCUS}`}
                    >
                      {s}
                      {off && <span className="text-[11px] leading-none">마감</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
        </Card>
        <Card>
          <label htmlFor="consult-memo" className="mb-3 block text-[17px] font-bold">
            상담하고 싶은 내용 <span className="text-[14px] font-medium text-[#8b95a1]">선택</span>
          </label>
          <textarea
            id="consult-memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="기말고사 준비 상황이 궁금합니다."
            className={`w-full resize-none rounded-[10px] border border-[#e5e8eb] px-3 py-3 text-[16px] leading-[1.5] placeholder:text-[#b0b8c1] ${FOCUS}`}
          />
          <p className="mt-2 text-[14px] text-[#6b7684]">연락처 010-1234-****</p>
        </Card>
        <PrimaryButton type="submit" disabled={dayIdx === null || !time}>
          {dayIdx !== null && time ? `${days[dayIdx].getMonth() + 1}월 ${days[dayIdx].getDate()}일 ${time} 신청하기` : "상담 신청하기"}
        </PrimaryButton>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <h2 className="text-[17px] font-bold">{today.getMonth() + 1}월 학부모 상담</h2>
        <p className="mt-1 text-[15px] leading-[1.6] text-[#4e5968]">담당 선생님과 20분 동안 학습 상황과 진도를 이야기합니다.</p>
        <div className="mt-4">
          <PrimaryButton onClick={onStart}>상담 신청하기</PrimaryButton>
        </div>
      </Card>
      <Card>
        <SectionTitle>신청 내역</SectionTitle>
        <ul className="-mx-4 divide-y divide-[#f2f4f6]">
          {all.map((b) => (
            <li key={b.id} className="flex min-h-[64px] items-center gap-3 px-4 py-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f2f4f6] text-[#4e5968]" aria-hidden="true">
                {b.type === "전화 상담" ? <Phone size={18} /> : <School size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">
                  {fmtKo(b.date)} {b.time}
                </p>
                <p className="truncate text-[13px] text-[#8b95a1]">
                  {b.teacher}, {b.type}
                </p>
              </div>
              <span className={`shrink-0 rounded-[6px] px-2 py-0.5 text-[13px] font-semibold ${b.status === "예약 접수" ? "bg-[#e9eefb] text-[#2557d6]" : "bg-[#f2f4f6] text-[#6b7684]"}`}>
                {b.status}
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <p className="flex items-center justify-center gap-1.5 pb-2 text-[13px] text-[#8b95a1]">
        <Clock size={14} aria-hidden="true" /> 상담 가능 시간 평일 16:00~21:00
      </p>
    </div>
  );
}

function ChoiceRadio({ name, value, checked, onChange, icon: Icon }: { name: string; value: string; checked: boolean; onChange: () => void; icon: typeof Phone }) {
  return (
    <label
      className={`flex h-[56px] cursor-pointer items-center justify-center gap-2 rounded-[10px] border text-[16px] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2557d6] ${checked ? "border-[#2557d6] bg-[#f3f6fd] font-semibold text-[#2557d6]" : "border-[#e5e8eb] bg-white text-[#333d4b]"}`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <Icon size={18} aria-hidden="true" />
      {value}
    </label>
  );
}
