"use client";

// 학원 출결, 알림 앱 카탈로그(11-01). 학부모 화면: 홈, 출결, 알림장, 수납, 상담
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  BatteryFull,
  Bell,
  BellRing,
  BookOpen,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Bus,
  Camera,
  ChartLine,
  Clock,
  CreditCard,
  House,
  Images,
  LoaderCircle,
  Lock,
  LogIn,
  LogOut,
  MessageCircle,
  NotebookPen,
  Phone,
  RectangleHorizontal,
  RectangleVertical,
  School,
  Signal,
  Smartphone,
  Tablet,
  TrendingUp,
  Wifi,
  X,
} from "lucide-react";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";
import { daysAgo, fmtKo, fmtMD, useDemoToday } from "@/hooks/useDemoToday";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

const ACADEMY = "수학 영어 학원";
const CHILD = { name: "고ㅌ희", grade: "중학교 2학년", classes: ["중2 수학 심화반", "영어 리딩 B반"] };
const FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-[#2557d6] focus-visible:ring-offset-2";
const IMG = "/images/demo-academy";

// 선생님 얼굴 사진. 원장실 글은 원장 사진, 행정실 글은 학원 아이콘
const PEOPLE: Record<string, { photo: string; subject: string; short: string }> = {
  "수학 박ㅅ연 선생님": { photo: `${IMG}/teacher1.jpg`, subject: "중2 수학 심화", short: "박ㅅ연" },
  "영어 이ㅈ민 선생님": { photo: "/images/demo-english-talk/teacher-korean.jpg", subject: "영어 리딩 B반", short: "이ㅈ민" },
  "원장 최ㅇ희": { photo: `${IMG}/teacher2.jpg`, subject: "학습 상담", short: "최ㅇ희" },
};
PEOPLE["원장실"] = PEOPLE["원장 최ㅇ희"];

const PHOTOS = {
  classroom: { src: `${IMG}/classroom.jpg`, alt: "강의실에서 교재를 펴 놓고 수업을 듣는 중학생들" },
  study: { src: `${IMG}/study.jpg`, alt: "계산기 옆에서 연습장에 수학 문제를 푸는 손" },
  hero: { src: `${IMG}/hero.jpg`, alt: "해 질 무렵 창밖으로 도시가 보이는 학원 강의실" },
};
type Photo = (typeof PHOTOS)[keyof typeof PHOTOS];

function Avatar({ who, size = 40 }: { who: string; size?: number }) {
  const person = PEOPLE[who];
  if (!person)
    return (
      <span className="grid shrink-0 place-items-center rounded-full bg-[#eef1f5] text-[#4e5968]" style={{ width: size, height: size }} aria-hidden="true">
        <School size={Math.round(size * 0.45)} />
      </span>
    );
  return (
    <span className="relative shrink-0 overflow-hidden rounded-full bg-[#eef1f5] ring-1 ring-black/5" style={{ width: size, height: size }}>
      <Image src={person.photo} alt={`${who} 사진`} fill sizes={`${size * 2}px`} className="object-cover object-[50%_20%]" />
    </span>
  );
}

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
  photos?: Photo[];
  cover?: Photo;
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
      photos: [PHOTOS.classroom, PHOTOS.study],
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
      cover: PHOTOS.hero,
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
const TEACHERS = ["수학 박ㅅ연 선생님", "영어 이ㅈ민 선생님", "원장 최ㅇ희"];
type Booking = { id: string; date: Date; time: string; teacher: string; type: string; status: "예약 접수" | "상담 완료" };

// ---------- 공통 조각 ----------
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[14px] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)] ${className}`}>{children}</section>;
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

// ================= 셔틀 =================
type PushMsg = { text: string; target: "first" | "shuttle" };
const SHUTTLE_START = 0.42;
const ROUTE: [number, number][] = [
  [34, 168],
  [118, 168],
  [118, 100],
  [212, 100],
  [212, 44],
  [306, 44],
];
const SEG = ROUTE.slice(1).map((pt, i) => Math.hypot(pt[0] - ROUTE[i][0], pt[1] - ROUTE[i][1]));
const ROUTE_LEN = SEG.reduce((a, b) => a + b, 0);
const STOPS = [
  { name: "학원 앞", at: 0, time: "18:05" },
  { name: "도서관 앞", at: (SEG[0] + SEG[1]) / ROUTE_LEN, time: "18:11" },
  { name: "주민센터", at: (SEG[0] + SEG[1] + SEG[2]) / ROUTE_LEN, time: "18:15" },
  { name: "아파트 후문", at: 1, time: "18:21" },
];
function pointAt(t: number): [number, number] {
  let d = t * ROUTE_LEN;
  for (let i = 0; i < SEG.length; i++) {
    if (d <= SEG[i] || i === SEG.length - 1) {
      const r = SEG[i] ? Math.min(1, d / SEG[i]) : 0;
      return [ROUTE[i][0] + (ROUTE[i + 1][0] - ROUTE[i][0]) * r, ROUTE[i][1] + (ROUTE[i + 1][1] - ROUTE[i][1]) * r];
    }
    d -= SEG[i];
  }
  return ROUTE[ROUTE.length - 1];
}
const etaMin = (p: number) => Math.max(0, Math.ceil((1 - p) * 16));
const firstPushText = () => {
  const d = new Date().getDay();
  return d >= 1 && d <= 5 ? `${CHILD.name} 학생이 15:52 등원했습니다.` : "새 알림장이 등록되었습니다. 이번 주 숙제를 확인해 주세요.";
};

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
  const [push, setPush] = useState<PushMsg | null>(null);
  const [homeView, setHomeView] = useState<"main" | "shuttle" | "report">("main");
  const [viewer, setViewer] = useState<Photo | null>(null);
  const [progress, setProgress] = useState(SHUTTLE_START);
  const [alertOn, setAlertOn] = useState(true);
  const progRef = useRef(SHUTTLE_START);
  const alertRef = useRef(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 첫 푸시 알림은 한 번만 내려온다
  useEffect(() => {
    const show = setTimeout(() => setPush({ text: firstPushText(), target: "first" }), 1400);
    return () => clearTimeout(show);
  }, []);
  // 알림은 6초 뒤 들어간다
  useEffect(() => {
    if (!push) return;
    const hide = setTimeout(() => setPush(null), 6000);
    return () => clearTimeout(hide);
  }, [push]);
  // 셔틀 위치는 1초마다 갱신
  useEffect(() => {
    const id = setInterval(() => {
      const prev = progRef.current;
      if (prev >= 1) return;
      const next = Math.min(1, prev + 0.005);
      progRef.current = next;
      setProgress(next);
      if (next >= 1 && alertRef.current) setPush({ text: `${CHILD.name} 학생이 ${STOPS[STOPS.length - 1].name} 정류장에서 하차했습니다.`, target: "shuttle" });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const toggleAlert = () => {
    alertRef.current = !alertRef.current;
    setAlertOn(alertRef.current);
  };

  const env = useEnv();
  const vp = useViewport();
  const [device, setDevice] = useState<"phone" | "tablet">("phone");
  const [landscape, setLandscape] = useState(false);
  const framed = env === "desktop";
  const tablet = env === "tablet" || (framed && device === "tablet");
  const pos = framed ? "absolute" : "fixed";

  const toTop = () => {
    scrollRef.current?.scrollTo({ top: 0 });
    if (!framed) window.scrollTo({ top: 0 });
  };

  const go = (t: Tab) => {
    setTab(t);
    setNoteId(null);
    setHomeView("main");
    if (t === "pay" && payStep === "done") setPayStep("bill");
    if (t === "consult" && consultStep === "done") setConsultStep("list");
    toTop();
  };

  const openNote = (id: string) => {
    setTab("notes");
    setNoteId(id);
    setReadIds((r) => (r.includes(id) ? r : [...r, id]));
    if (!tablet) toTop();
  };

  const unread = notes.filter((n) => !readIds.includes(n.id)).length;
  const note = notes.find((n) => n.id === noteId) ?? null;
  // 태블릿은 목록과 본문을 나란히 두므로 고른 글이 없으면 첫 글을 연다
  const shownNote = note ?? (tablet ? notes[0] : null);

  // 머리글 제목과 뒤로 가기
  let title = TABS.find((t) => t.id === tab)?.label ?? "";
  let back: (() => void) | null = null;
  if (tab === "home") title = ACADEMY;
  if (tab === "home" && homeView !== "main") {
    title = homeView === "shuttle" ? "셔틀 위치" : "주간 학습 리포트";
    back = () => setHomeView("main");
  }
  if (tab === "notes" && note && !tablet) {
    title = note.kind;
    back = () => setNoteId(null);
  }
  if (tab === "pay" && payStep === "method") {
    title = "수강료 납부";
    back = () => setPayStep("bill");
  }
  if (tab === "consult" && consultStep === "form" && !tablet) {
    title = "상담 신청";
    back = () => setConsultStep("list");
  }

  const openHome = (v: "shuttle" | "report") => {
    setTab("home");
    setNoteId(null);
    setHomeView(v);
    toTop();
  };

  // 태블릿 틀 크기와 축소 비율(실제 태블릿 px로 그린 뒤 화면 높이에 맞춰 줄인다)
  const TW = landscape ? 1180 : 820;
  const TH = landscape ? 820 : 1180;
  const BZ = 12;
  const vw = Math.floor(vp / 100000);
  const vh = vp % 100000;
  const scale = vp ? Math.min(1, (vh - 190) / (TH + BZ * 2), (vw - 48) / (TW + BZ * 2)) : 0.6;
  const tabletFrame = framed && tablet;

  const statusBar = framed && (
    <div className={`absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-white font-semibold ${tablet ? "h-6 px-6 text-[12px]" : "h-11 px-7 text-[15px]"}`} aria-hidden="true">
      <span>{tablet ? "11월 1일 16:05" : "16:05"}</span>
      <span className="flex items-center gap-1.5">
        <Wifi size={tablet ? 13 : 16} strokeWidth={2.4} />
        {!tablet && <Signal size={16} strokeWidth={2.4} />}
        <BatteryFull size={tablet ? 17 : 20} strokeWidth={2} />
      </span>
    </div>
  );

  return (
    <div className={`min-h-[100dvh] text-[#191f28] ${framed ? "flex flex-col items-center bg-[#e4e7eb] py-5" : "bg-[#f2f4f6]"}`}>
      {framed && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <div role="group" aria-label="기기" className="flex rounded-[10px] bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            {(
              [
                ["phone", "휴대폰", Smartphone],
                ["tablet", "태블릿", Tablet],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                aria-pressed={device === id}
                onClick={() => setDevice(id)}
                className={`flex h-11 items-center gap-1.5 rounded-[8px] px-4 text-[14px] ${device === id ? "bg-[#191f28] font-semibold text-white" : "font-medium text-[#4e5968] hover:bg-[#f2f4f6]"} ${FOCUS}`}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
          {device === "tablet" ? (
            <div role="group" aria-label="화면 방향" className="flex rounded-[10px] bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
              {(
                [
                  [false, "세로", RectangleVertical],
                  [true, "가로", RectangleHorizontal],
                ] as const
              ).map(([value, label, Icon]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={landscape === value}
                  onClick={() => setLandscape(value)}
                  className={`flex h-11 items-center gap-1.5 rounded-[8px] px-4 text-[14px] ${landscape === value ? "bg-[#191f28] font-semibold text-white" : "font-medium text-[#4e5968] hover:bg-[#f2f4f6]"} ${FOCUS}`}
                >
                  <Icon size={17} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <p className="flex h-[52px] items-center gap-1.5 rounded-[10px] bg-white/60 px-4 text-[14px] font-medium text-[#6b7684]">
              <Lock size={15} aria-hidden="true" />
              세로 고정
            </p>
          )}
        </div>
      )}

      <div style={tabletFrame ? { width: (TW + BZ * 2) * scale, height: (TH + BZ * 2) * scale } : undefined} className={tabletFrame ? "relative shrink-0" : "contents"}>
        <div
          style={tabletFrame ? { width: TW + BZ * 2, height: TH + BZ * 2, transform: `scale(${scale})`, transformOrigin: "top left" } : undefined}
          className={`relative bg-[#f2f4f6] ${
            tabletFrame
              ? "overflow-hidden rounded-[38px] border-[12px] border-[#1b1d21] shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)]"
              : framed
                ? "h-[min(844px,calc(100dvh-150px))] min-h-[600px] w-[390px] shrink-0 overflow-hidden rounded-[48px] border-[10px] border-[#17191c] shadow-[0_24px_60px_-20px_rgba(15,23,42,0.35)]"
                : tablet
                  ? "min-h-[100dvh]"
                  : ""
          }`}
        >
          {statusBar}

          <div className={framed ? `absolute inset-x-0 bottom-0 ${tablet ? "top-6 flex" : "top-11"}` : tablet ? "flex min-h-[100dvh]" : ""}>
            {tablet && (
              <nav aria-label="주 메뉴" className={`z-30 flex w-[96px] shrink-0 flex-col items-center gap-1 border-r border-[#eceef1] bg-white py-4 ${framed ? "h-full" : "sticky top-0 h-[100dvh]"}`}>
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-[12px] bg-[#2557d6] text-white" aria-hidden="true">
                  <School size={22} />
                </span>
                <ul className="flex w-full flex-col gap-1 px-2">
                  {TABS.map(({ id, label, icon: Icon }) => {
                    const active = tab === id;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => go(id)}
                          aria-current={active ? "page" : undefined}
                          className={`flex h-[68px] w-full flex-col items-center justify-center gap-1 rounded-[12px] text-[13px] ${active ? "bg-[#eef3fd] font-bold text-[#2557d6]" : "font-medium text-[#6b7684] hover:bg-[#f5f6f8]"} ${FOCUS}`}
                        >
                          <span className="relative">
                            <Icon size={24} strokeWidth={active ? 2.3 : 1.9} />
                            {id === "notes" && unread > 0 && <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-[#e5483b]" />}
                          </span>
                          {label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}

            <div
              ref={scrollRef}
              className={`${framed ? "h-full overflow-y-auto overscroll-contain" : ""} ${tablet ? "min-w-0 flex-1 pb-8" : "pb-[88px]"}`}
            >
              <header className={`sticky top-0 z-20 flex items-center gap-1 border-b border-[#eceef1] bg-white ${tablet ? "h-16 px-4" : "h-14 px-2"}`}>
                {back ? (
                  <button type="button" onClick={back} aria-label="뒤로" className={`grid h-11 w-11 place-items-center rounded-[10px] text-[#333d4b] hover:bg-[#f2f4f6] ${FOCUS}`}>
                    <ChevronLeft size={24} />
                  </button>
                ) : (
                  !tablet && (
                    <span className="ml-2 grid h-8 w-8 place-items-center rounded-[8px] bg-[#2557d6] text-white" aria-hidden="true">
                      <School size={18} />
                    </span>
                  )
                )}
                <h1 className={`ml-1 min-w-0 flex-1 truncate font-bold ${tablet ? "pl-2 text-[20px]" : "text-[18px]"}`}>{title}</h1>
                {tablet && (
                  <span className="mr-2 hidden items-center gap-2 text-[14px] text-[#6b7684] sm:flex">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e9eefb] text-[13px] font-bold text-[#2557d6]" aria-hidden="true">
                      {CHILD.name.slice(-1)}
                    </span>
                    {CHILD.name} 학부모
                  </span>
                )}
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

              <main className={tablet ? "px-6 pt-5" : "px-4 pt-4"}>
                {tab === "home" && homeView === "shuttle" && <ShuttleView progress={progress} reduce={reduce} alertOn={alertOn} onToggle={toggleAlert} tablet={tablet} />}
                {tab === "home" && homeView === "report" && <ReportView classDay={classDay} tablet={tablet} />}
                {tab === "home" && homeView === "main" && (
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
                    onOpen={openHome}
                    onPhoto={setViewer}
                    progress={progress}
                    tablet={tablet}
                  />
                )}
                {tab === "attend" && <AttendView today={today} classDay={classDay} tablet={tablet} />}
                {tab === "notes" && (
                  <div className={tablet ? "grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] items-start gap-4" : ""}>
                    {(tablet || !shownNote) && <NotesList notes={notes} readIds={readIds} checkedIds={checkedIds} onOpen={openNote} selectedId={tablet ? shownNote?.id : undefined} />}
                    {shownNote && (
                      <div className={tablet ? "sticky top-[84px] min-w-0" : ""}>
                        <NoteDetail
                          key={shownNote.id}
                          note={shownNote}
                          onPhoto={setViewer}
                          checked={checkedIds.includes(shownNote.id)}
                          onCheck={() => setCheckedIds((c) => [...c, shownNote.id])}
                        />
                      </div>
                    )}
                  </div>
                )}
                {tab === "pay" && (
                  <PayView
                    today={today}
                    step={payStep}
                    paid={paid}
                    tablet={tablet}
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
                    tablet={tablet}
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
          </div>

          {/* 하단 탭(휴대폰) */}
          {!tablet && (
            <nav aria-label="주 메뉴" className={`${pos} inset-x-0 bottom-0 z-30 border-t border-[#eceef1] bg-white ${framed ? "pb-3" : "pb-[env(safe-area-inset-bottom)]"}`}>
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
          )}

          {/* 푸시 알림 */}
          <AnimatePresence>
            {push && (
              <motion.div
                role="status"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -110 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -110 }}
                transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 34 }}
                className={`${pos} z-[70] ${tablet ? `right-4 w-[400px] ${framed ? "top-8" : "top-3"}` : `inset-x-2 ${framed ? "top-12" : "top-2"}`}`}
              >
                <div className="flex items-start gap-1 rounded-[16px] bg-white/95 py-1 pl-3 pr-1 shadow-[0_10px_30px_-8px_rgba(15,23,42,0.35)] ring-1 ring-black/5 backdrop-blur">
                  <button
                    type="button"
                    onClick={() => {
                      setPush(null);
                      if (push.target === "shuttle") openHome("shuttle");
                      else if (isClassToday) go("home");
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
                      <span className="mt-0.5 block text-[15px] leading-[1.45] text-[#191f28]">{push.text}</span>
                    </span>
                  </button>
                  <button type="button" onClick={() => setPush(null)} aria-label="알림 닫기" className={`grid h-11 w-11 shrink-0 place-items-center rounded-[10px] text-[#8b95a1] ${FOCUS}`}>
                    <X size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 사진 크게 보기 */}
          <AnimatePresence>
            {viewer && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="사진 크게 보기"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.18 }}
                className={`${pos} inset-0 z-[80] flex flex-col bg-[#0b0d10]`}
                onKeyDown={(e) => e.key === "Escape" && setViewer(null)}
              >
                <div className={`flex h-14 items-center justify-end px-2 ${framed ? (tablet ? "mt-6" : "mt-11") : ""}`}>
                  <button type="button" autoFocus onClick={() => setViewer(null)} aria-label="닫기" className={`grid h-11 w-11 place-items-center rounded-[10px] text-white ${FOCUS}`}>
                    <X size={24} />
                  </button>
                </div>
                <div className={`relative flex-1 ${tablet ? "mx-10" : "mx-4"}`}>
                  <Image src={viewer.src} alt={viewer.alt} fill sizes={tablet ? "1180px" : "(min-width: 768px) 370px, 100vw"} className="object-contain" />
                </div>
                <p className="px-6 pb-10 pt-4 text-center text-[15px] leading-[1.5] text-white/80">{viewer.alt}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <footer className={`px-4 text-center text-[#6b7684] ${framed ? "" : tablet ? "pb-6 pl-[112px]" : "pb-[96px]"}`}>
        <DemoMakerInfo className={framed ? "mt-5" : "mt-6"} />
      </footer>
    </div>
  );
}

// 화면 환경: 휴대폰(768 미만), PC(틀 안에 기기 보기), 실제 태블릿(터치, 틀 없이)
type Env = "phone" | "desktop" | "tablet";
const subscribeEnv = (cb: () => void) => {
  window.addEventListener("resize", cb);
  const mq = window.matchMedia("(pointer: coarse)");
  mq.addEventListener("change", cb);
  return () => {
    window.removeEventListener("resize", cb);
    mq.removeEventListener("change", cb);
  };
};
const envSnapshot = (): Env => (window.innerWidth < 768 ? "phone" : window.matchMedia("(pointer: coarse)").matches ? "tablet" : "desktop");
function useEnv(): Env {
  return useSyncExternalStore(subscribeEnv, envSnapshot, () => "phone");
}
/** 가로폭 * 100000 + 세로높이 */
function useViewport(): number {
  return useSyncExternalStore(
    subscribeEnv,
    () => window.innerWidth * 100000 + window.innerHeight,
    () => 0,
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
  onOpen,
  onPhoto,
  progress,
  tablet,
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
  onOpen: (v: "shuttle" | "report") => void;
  onPhoto: (p: Photo) => void;
  progress: number;
  tablet: boolean;
}) {
  const banner = notes.find((n) => n.id === "n4");
  const homework = notes.find((n) => n.id === "n1");
  const eta = etaMin(progress);
  const math = REPORT.수학;
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

  const bBanner = (
    <>
      {banner?.cover && (
        <button type="button" onClick={() => onOpenNote(banner.id)} className={`relative block aspect-[16/9] w-full overflow-hidden rounded-[14px] bg-[#dfe3e8] text-left ${FOCUS}`}>
          <Image src={banner.cover.src} alt={banner.cover.alt} fill priority sizes="(min-width: 768px) 360px, 100vw" className="object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true" />
          <span className="absolute inset-x-0 bottom-0 p-4 text-white">
            <span className="inline-flex h-6 items-center rounded-[6px] bg-white/20 px-2 text-[12px] font-semibold backdrop-blur-sm">이번 주 공지</span>
            <span className="mt-2 block text-[18px] font-bold leading-[1.35]">{banner.title}</span>
            <span className="mt-0.5 block text-[13px] text-white/80">{banner.teacher}, {fmtMD(banner.date)}</span>
          </span>
        </button>
      )}
    </>
  );
  const bChild = (
    <>
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
        <ul className="mt-4 grid grid-cols-2 gap-2 border-t border-[#f2f4f6] pt-4">
          {TEACHERS.slice(0, 2).map((t) => (
            <li key={t} className="flex min-w-0 items-center gap-2.5">
              <Avatar who={t} size={36} />
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold">{PEOPLE[t].short} 선생님</span>
                <span className="block truncate text-[12px] text-[#8b95a1]">{PEOPLE[t].subject}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
  const bFeatures = (
    <>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => onOpen("shuttle")} className={`flex flex-col rounded-[14px] bg-[#17233f] p-4 text-left text-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] ${FOCUS}`}>
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-white/75">
            <Bus size={16} aria-hidden="true" /> 하원 셔틀 2호차
          </span>
          <span className="mt-2 text-[22px] font-bold leading-tight">{eta > 0 ? `${eta}분 뒤 도착` : "하차 완료"}</span>
          <span className="mt-1 text-[13px] text-white/70">{STOPS[STOPS.length - 1].name} 정류장</span>
          <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
            <span className="block h-full rounded-full bg-[#7fa6ff] transition-[width] duration-700" style={{ width: `${Math.round(progress * 100)}%` }} />
          </span>
        </button>
        <button type="button" onClick={() => onOpen("report")} className={`flex flex-col rounded-[14px] bg-white p-4 text-left shadow-[0_1px_3px_rgba(15,23,42,0.05)] ${FOCUS}`}>
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6b7684]">
            <ChartLine size={16} aria-hidden="true" /> 주간 학습 리포트
          </span>
          <span className="mt-2 text-[22px] font-bold leading-tight">수학 {math.scores[math.scores.length - 1]}점</span>
          <span className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-[#1f7a52]">
            <TrendingUp size={14} aria-hidden="true" /> 지난주보다 +{math.scores[math.scores.length - 1] - math.scores[math.scores.length - 2]}점
          </span>
          <Sparkline values={math.scores} className="mt-2 h-7 w-full" />
        </button>
      </div>
    </>
  );
  const bTimeline = (
    <>
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
    </>
  );
  const bStats = (
    <>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => onGo("attend")} className={`rounded-[14px] bg-white p-4 text-left shadow-[0_1px_3px_rgba(15,23,42,0.05)] ${FOCUS}`}>
          <p className="text-[14px] text-[#6b7684]">{classDay.getMonth() + 1}월 출석률</p>
          <p className="mt-1 text-[22px] font-bold">{rate}%</p>
          <p className="mt-0.5 text-[13px] text-[#8b95a1]">수업 {records.length}회 중 {present}회</p>
        </button>
        <button type="button" onClick={() => onGo("pay")} className={`rounded-[14px] bg-white p-4 text-left shadow-[0_1px_3px_rgba(15,23,42,0.05)] ${FOCUS}`}>
          <p className="text-[14px] text-[#6b7684]">{m}월 수강료</p>
          <p className="mt-1 text-[22px] font-bold">{won(BILL_TOTAL)}</p>
          <p className={`mt-0.5 text-[13px] font-semibold ${paid ? "text-[#1f7a52]" : "text-[#c0392b]"}`}>{paid ? "납부 완료" : `미납, ${m}월 10일까지`}</p>
        </button>
      </div>
    </>
  );
  const bPhotos = (
    <>
      {homework?.photos && (
        <Card>
          <SectionTitle
            action={
              <button type="button" onClick={() => onOpenNote(homework.id)} className={`-mr-2 flex h-11 items-center gap-0.5 rounded-[8px] px-2 text-[14px] text-[#6b7684] ${FOCUS}`}>
                알림장 보기 <ChevronRight size={16} />
              </button>
            }
          >
            수업 사진
          </SectionTitle>
          <PhotoGrid photos={homework.photos} onPhoto={onPhoto} />
          <p className="mt-2 text-[13px] text-[#8b95a1]">{homework.teacher}, {fmtKo(homework.date)}</p>
        </Card>
      )}
    </>
  );
  const bNotes = (
    <>
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
    </>
  );
  const bConsult = (
    <>
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
    </>
  );
  if (tablet)
    return (
      <div className="grid grid-cols-2 items-start gap-4">
        <div className="space-y-4">
          {bBanner}
          {bChild}
          {bTimeline}
          {bPhotos}
        </div>
        <div className="space-y-4">
          {bFeatures}
          {bStats}
          {bNotes}
          {bConsult}
        </div>
      </div>
    );
  return (
    <div className="space-y-3">
      {bBanner}
      {bChild}
      {bFeatures}
      {bTimeline}
      {bStats}
      {bPhotos}
      {bNotes}
      {bConsult}
    </div>
  );
}

// ================= 출결 =================
function AttendView({ today, classDay, tablet }: { today: Date; classDay: Date; tablet: boolean }) {
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
    <div className={tablet ? "grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start gap-4" : "space-y-3"}>
      <div className="min-w-0 space-y-3">
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

      </div>
      <div className="min-w-0 space-y-3">
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
    </div>
  );
}

// ================= 알림장 =================
function NoteRow({ note, unread, onOpen, selected = false }: { note: Note; unread: boolean; onOpen: () => void; selected?: boolean }) {
  return (
    <button type="button" onClick={onOpen} aria-current={selected ? "true" : undefined} className={`flex min-h-[68px] w-full items-center gap-3 px-4 py-3 text-left ${selected ? "bg-[#eef3fd]" : "hover:bg-[#f9fafb]"} ${FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0`}>
      <Avatar who={note.teacher} size={40} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className={`shrink-0 rounded-[5px] px-1.5 py-px text-[11px] font-semibold ${note.kind === "숙제" ? "bg-[#e9eefb] text-[#2557d6]" : "bg-[#f2f4f6] text-[#4e5968]"}`}>{note.kind}</span>
          <span className={`truncate text-[15px] ${unread ? "font-bold" : "font-medium"}`}>{note.title}</span>
        </span>
        <span className="mt-0.5 block truncate text-[13px] text-[#8b95a1]">
          {note.teacher}, {fmtMD(note.date)}
        </span>
      </span>
      {note.photos && (
        <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[8px] bg-[#eef1f5]">
          <Image src={note.photos[0].src} alt={note.photos[0].alt} fill sizes="88px" className="object-cover" />
          <span className="absolute bottom-0.5 right-0.5 inline-flex items-center gap-0.5 rounded-[4px] bg-black/60 px-1 text-[10px] font-semibold leading-[14px] text-white">
            <Images size={9} aria-hidden="true" />
            {note.photos.length}
          </span>
        </span>
      )}
      {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-[#e5483b]" aria-label="읽지 않음" />}
    </button>
  );
}

function NotesList({ notes, readIds, checkedIds, onOpen, selectedId }: { notes: Note[]; readIds: string[]; checkedIds: string[]; onOpen: (id: string) => void; selectedId?: string }) {
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
              <NoteRow note={n} unread={!readIds.includes(n.id)} selected={selectedId === n.id} onOpen={() => onOpen(n.id)} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function PhotoGrid({ photos, onPhoto }: { photos: Photo[]; onPhoto: (p: Photo) => void }) {
  return (
    <ul className="grid grid-cols-2 gap-2">
      {photos.map((ph) => (
        <li key={ph.src}>
          <button type="button" onClick={() => onPhoto(ph)} aria-label={`사진 크게 보기, ${ph.alt}`} className={`relative block aspect-[4/3] w-full overflow-hidden rounded-[10px] bg-[#eef1f5] ${FOCUS}`}>
            <Image src={ph.src} alt={ph.alt} fill sizes="(min-width: 768px) 170px, 50vw" className="object-cover transition-transform duration-300 hover:scale-[1.03] motion-reduce:transition-none" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function NoteDetail({ note, checked, onCheck, onPhoto }: { note: Note; checked: boolean; onCheck: () => void; onPhoto: (p: Photo) => void }) {
  return (
    <div className="space-y-3">
      {note.cover && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-[14px] bg-[#dfe3e8]">
          <Image src={note.cover.src} alt={note.cover.alt} fill sizes="(min-width: 768px) 360px, 100vw" className="object-cover" />
        </div>
      )}
      <Card>
        <span className={`inline-block rounded-[6px] px-2 py-0.5 text-[12px] font-semibold ${note.kind === "숙제" ? "bg-[#e9eefb] text-[#2557d6]" : "bg-[#f2f4f6] text-[#4e5968]"}`}>{note.kind}</span>
        <h2 className="mt-2 text-[20px] font-bold leading-[1.4]">{note.title}</h2>
        <div className="mt-3 flex items-center gap-2.5">
          <Avatar who={note.teacher} size={36} />
          <p className="text-[14px] text-[#6b7684]">
            <span className="block font-semibold text-[#333d4b]">{note.teacher}</span>
            {fmtKo(note.date)}
          </p>
        </div>
        <div className="mt-4 space-y-2 border-t border-[#f2f4f6] pt-4 text-[16px] leading-[1.6] text-[#333d4b]">
          {note.body.map((b) => (
            <p key={b}>{b}</p>
          ))}
        </div>
      </Card>
      {note.photos && (
        <Card>
          <SectionTitle action={<span className="flex items-center gap-1 text-[13px] text-[#8b95a1]"><Camera size={14} aria-hidden="true" />{note.photos.length}장</span>}>수업 사진</SectionTitle>
          <PhotoGrid photos={note.photos} onPhoto={onPhoto} />
        </Card>
      )}
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
  tablet,
}: {
  today: Date;
  step: "bill" | "method" | "done";
  paid: { method: string } | null;
  onStart: () => void;
  onPaid: (method: string) => void;
  onDone: () => void;
  tablet: boolean;
}) {
  const [method, setMethod] = useState<string>(PAY_METHODS[0]);
  const [processing, setProcessing] = useState(false);
  const m = today.getMonth() + 1;
  const history = [1, 2, 3].map((i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 5 + i);
    return { label: `${d.getMonth() + 1}월 수강료`, date: d };
  });

  const historyCard = (
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
  );
  const side = (x: ReactNode, phoneHistory = false) =>
    tablet ? (
      <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-start gap-4">
        <div className="min-w-0">{x}</div>
        <div className="min-w-0">{historyCard}</div>
      </div>
    ) : phoneHistory ? (
      <div className="space-y-3">
        {x}
        {historyCard}
      </div>
    ) : (
      x
    );

  const pay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onPaid(method);
    }, 1100);
  };

  if (step === "done" && paid) {
    return side(
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
    return side(
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

  return side(
    <>
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
    </>,
    true,
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
  tablet,
}: {
  today: Date;
  step: "list" | "form" | "done";
  bookings: Booking[];
  onStart: () => void;
  onSubmit: (b: Booking) => void;
  onDone: () => void;
  tablet: boolean;
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
  const listEl = (
    <div className="space-y-3">
      <Card>
        <h2 className="text-[17px] font-bold">{today.getMonth() + 1}월 학부모 상담</h2>
        <p className="mt-1 text-[15px] leading-[1.6] text-[#4e5968]">담당 선생님과 20분 동안 학습 상황과 진도를 이야기합니다.</p>
        {!tablet && (
          <div className="mt-4">
            <PrimaryButton onClick={onStart}>상담 신청하기</PrimaryButton>
          </div>
        )}
      </Card>
      <Card>
        <SectionTitle>신청 내역</SectionTitle>
        <ul className="-mx-4 divide-y divide-[#f2f4f6]">
          {all.map((b) => (
            <li key={b.id} className="flex min-h-[64px] items-center gap-3 px-4 py-3">
              <Avatar who={b.teacher} size={40} />
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
  const side = (x: ReactNode) =>
    tablet ? (
      <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-start gap-4">
        <div className="min-w-0">{x}</div>
        <div className="min-w-0">{listEl}</div>
      </div>
    ) : (
      x
    );

  if (step === "done" && latest) {
    return side(
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

  if (step === "form" || tablet) {
    const closed = (i: number, s: string) => (i * 3 + SLOTS.indexOf(s)) % 4 === 1;
    const submit = () => {
      if (dayIdx === null || !time) return;
      onSubmit({ id: `b${bookings.length + 1}`, date: days[dayIdx], time, teacher, type, status: "예약 접수" });
      setDayIdx(null);
      setTime(null);
      setMemo("");
    };
    return side(
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
          <fieldset>
            <legend className="mb-3 text-[17px] font-bold">담당 선생님</legend>
            <div className="grid grid-cols-3 gap-2">
              {TEACHERS.map((t) => {
                const on = teacher === t;
                const person = PEOPLE[t];
                return (
                  <label
                    key={t}
                    className={`relative flex cursor-pointer flex-col overflow-hidden rounded-[12px] border-2 bg-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2557d6] has-[:focus-visible]:ring-offset-2 ${on ? "border-[#2557d6]" : "border-transparent ring-1 ring-inset ring-[#e5e8eb]"}`}
                  >
                    <input type="radio" name="teacher" value={t} checked={on} onChange={() => setTeacher(t)} className="sr-only" />
                    <span className="relative block aspect-square w-full bg-[#eef1f5]">
                      <Image src={person.photo} alt={`${t} 사진`} fill sizes="120px" className="object-cover object-[50%_20%]" />
                      {on && (
                        <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-[#2557d6] text-white" aria-hidden="true">
                          <CircleCheck size={16} />
                        </span>
                      )}
                    </span>
                    <span className="px-2 py-2 text-center">
                      <span className={`block text-[14px] ${on ? "font-bold text-[#2557d6]" : "font-semibold"}`}>{person.short}</span>
                      <span className="block truncate text-[12px] text-[#8b95a1]">{person.subject}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
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

  return listEl;
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

// ================= 주간 학습 리포트 =================
const REPORT = {
  수학: {
    teacher: "수학 박ㅅ연 선생님",
    scores: [72, 76, 74, 79, 82, 88],
    units: [
      { name: "일차함수 개념", value: 94 },
      { name: "그래프 해석", value: 78 },
      { name: "활용 문제", value: 86 },
    ],
    homework: "5/5",
    comment: "그래프 해석 문제에서 기울기를 먼저 확인하는 습관이 생겼습니다. 활용 문제는 식 세우는 과정을 조금 더 연습하면 다음 단원 평가에서 90점 이상 기대할 수 있습니다.",
  },
  영어: {
    teacher: "영어 이ㅈ민 선생님",
    scores: [80, 78, 83, 85, 84, 87],
    units: [
      { name: "단어 시험", value: 92 },
      { name: "독해", value: 85 },
      { name: "문법", value: 81 },
    ],
    homework: "4/5",
    comment: "Unit 5 단어 시험을 거의 다 맞혔습니다. 긴 지문에서 주제문을 찾는 속도가 빨라졌고, 관계대명사 문제만 한 번 더 복습하면 좋겠습니다.",
  },
};
type Subject = keyof typeof REPORT;

function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / (max - min)) * 24}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={className} aria-hidden="true">
      <polyline points={pts} fill="none" stroke="#2557d6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function ReportView({ classDay, tablet }: { classDay: Date; tablet: boolean }) {
  const [subject, setSubject] = useState<Subject>("수학");
  const r = REPORT[subject];
  const last = r.scores[r.scores.length - 1];
  const diff = last - r.scores[r.scores.length - 2];
  const weekStart = daysAgo(classDay, classDay.getDay() - 1);
  const labels = r.scores.map((_, i) => fmtMD(daysAgo(weekStart, 7 * (r.scores.length - 1 - i))));
  const W = 320;
  const H = 150;
  const L = 30;
  const T = 14;
  const B = 26;
  const x = (i: number) => L + (i / (r.scores.length - 1)) * (W - L - 16);
  const y = (v: number) => T + (1 - (v - 60) / 40) * (H - T - B);

  return (
    <div className={tablet ? "grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start gap-4" : "space-y-3"}>
      <div className="min-w-0 space-y-3">
      <div role="group" aria-label="과목" className="grid grid-cols-2 gap-1 rounded-[12px] bg-[#e9ecf0] p-1">
        {(Object.keys(REPORT) as Subject[]).map((sj) => (
          <button
            key={sj}
            type="button"
            aria-pressed={subject === sj}
            onClick={() => setSubject(sj)}
            className={`h-11 rounded-[9px] text-[15px] ${subject === sj ? "bg-white font-bold text-[#191f28] shadow-[0_1px_2px_rgba(15,23,42,0.1)]" : "font-medium text-[#6b7684]"} ${FOCUS}`}
          >
            {sj}
          </button>
        ))}
      </div>

      <Card>
        <p className="text-[14px] text-[#6b7684]">
          {fmtMD(weekStart)}~{fmtMD(daysAgo(weekStart, -4))} 주간 평가
        </p>
        <div className="mt-1 flex items-end gap-2">
          <p className="text-[32px] font-bold leading-none">
            {last}
            <span className="ml-0.5 text-[18px]">점</span>
          </p>
          <p className={`mb-0.5 flex items-center gap-0.5 text-[14px] font-semibold ${diff >= 0 ? "text-[#1f7a52]" : "text-[#c0392b]"}`}>
            <TrendingUp size={15} aria-hidden="true" className={diff < 0 ? "-scale-y-100" : ""} />
            지난주보다 {diff >= 0 ? `${diff}점 올랐어요` : `${-diff}점 내렸어요`}
          </p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label={`최근 6주 점수 ${r.scores.join(", ")}점`}>
          {[60, 80, 100].map((g) => (
            <g key={g}>
              <line x1={L} x2={W - 8} y1={y(g)} y2={y(g)} stroke="#eef0f3" strokeWidth="1" />
              <text x={L - 8} y={y(g) + 4} textAnchor="end" fontSize="11" fill="#8b95a1">
                {g}
              </text>
            </g>
          ))}
          <polyline points={r.scores.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke="#2557d6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {r.scores.map((v, i) => {
            const isLast = i === r.scores.length - 1;
            return (
              <g key={i}>
                <circle cx={x(i)} cy={y(v)} r={isLast ? 5 : 3.5} fill={isLast ? "#2557d6" : "#fff"} stroke="#2557d6" strokeWidth="2" />
                {isLast && (
                  <text x={x(i)} y={y(v) - 11} textAnchor="middle" fontSize="12" fontWeight="700" fill="#2557d6">
                    {v}
                  </text>
                )}
                <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill={isLast ? "#333d4b" : "#8b95a1"} fontWeight={isLast ? 600 : 400}>
                  {labels[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </Card>

      </div>
      <div className="min-w-0 space-y-3">
      <Card>
        <SectionTitle>단원별 성취도</SectionTitle>
        <ul className="space-y-3">
          {r.units.map((u) => (
            <li key={u.name}>
              <div className="flex items-center justify-between text-[15px]">
                <span>{u.name}</span>
                <span className="font-semibold">{u.value}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#eef0f3]">
                <div className="h-full rounded-full bg-[#2557d6]" style={{ width: `${u.value}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-[#f2f4f6] pt-4 text-center">
          <div className="rounded-[10px] bg-[#f7f8fa] py-2.5">
            <dt className="text-[13px] text-[#6b7684]">출석</dt>
            <dd className="mt-0.5 text-[17px] font-bold">5/5</dd>
          </div>
          <div className="rounded-[10px] bg-[#f7f8fa] py-2.5">
            <dt className="text-[13px] text-[#6b7684]">과제 제출</dt>
            <dd className="mt-0.5 text-[17px] font-bold">{r.homework}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <Avatar who={r.teacher} size={44} />
          <div>
            <p className="text-[15px] font-bold">{r.teacher}</p>
            <p className="text-[13px] text-[#8b95a1]">이번 주 코멘트</p>
          </div>
        </div>
        <p className="mt-3 rounded-[10px] bg-[#f7f8fa] p-3.5 text-[15px] leading-[1.65] text-[#333d4b]">{r.comment}</p>
      </Card>
      </div>
    </div>
  );
}

// ================= 셔틀 위치 =================
function ShuttleView({ progress, reduce, alertOn, onToggle, tablet }: { progress: number; reduce: boolean; alertOn: boolean; onToggle: () => void; tablet: boolean }) {
  const [bx, by] = pointAt(progress);
  const eta = etaMin(progress);
  const done = progress >= 1;
  const passedPts = [...ROUTE.filter((_, i) => i === 0 || SEG.slice(0, i).reduce((a, b) => a + b, 0) / ROUTE_LEN <= progress), [bx, by]];
  const nextIdx = STOPS.findIndex((st) => st.at > progress + 0.0001);

  return (
    <div className={tablet ? "grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-start gap-4" : "space-y-3"}>
      <div className="min-w-0 space-y-3">
      <Card className="!p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          <div>
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#2557d6]">
              <span className={`h-2 w-2 rounded-full ${done ? "bg-[#8b95a1]" : "bg-[#2f9e6b]"}`} aria-hidden="true" />
              {done ? "운행 종료" : "운행 중"}
            </p>
            <p className="mt-1 text-[22px] font-bold" aria-live="polite">
              {done ? "아파트 후문 하차 완료" : `${eta}분 뒤 도착 예정`}
            </p>
            <p className="text-[14px] text-[#6b7684]">하원 셔틀 2호차, 아파트 후문 정류장</p>
          </div>
        </div>
        <svg viewBox="0 0 340 210" className={`block w-full bg-[#f3f5f8] ${tablet ? "h-[340px]" : "h-auto"}`} role="img" aria-label={`셔틀 노선 지도, ${done ? "하차 정류장 도착" : `다음 정류장 ${STOPS[nextIdx]?.name ?? ""}`}`}>
          {/* 블록과 도로 */}
          {[
            [10, 10, 90, 70],
            [140, 10, 54, 72],
            [236, 64, 94, 62],
            [10, 118, 90, 34],
            [140, 122, 190, 78],
            [10, 186, 90, 20],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx="6" fill={i === 4 ? "#e3efe6" : "#e8ebef"} />
          ))}
          <text x={235} y={166} fontSize="11" fill="#7c9b84">
            중앙공원
          </text>
          <polyline points={ROUTE.map((p) => p.join(",")).join(" ")} fill="none" stroke="#c7d3ee" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={passedPts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#2557d6" strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
          {STOPS.map((st, i) => {
            const [sx, sy] = pointAt(st.at);
            const passed = st.at <= progress;
            const last = i === STOPS.length - 1;
            const lx = i === 0 ? sx : last ? sx - 4 : i === 1 ? sx - 12 : sx + 10;
            const ly = i === 0 ? sy + 22 : last ? sy - 14 : i === 1 ? sy + 4 : sy + 18;
            return (
              <g key={st.name}>
                <circle cx={sx} cy={sy} r={last ? 8 : 6} fill="#fff" stroke={passed ? "#2557d6" : "#9fb2dc"} strokeWidth="3" />
                {last && <circle cx={sx} cy={sy} r="3" fill="#2557d6" />}
                <text x={lx} y={ly} fontSize="12" fontWeight={last ? 700 : 500} fill="#333d4b" textAnchor={i === 0 ? "middle" : last || i === 1 ? "end" : "start"}>
                  {st.name}
                </text>
              </g>
            );
          })}
          <g style={{ transform: `translate(${bx}px, ${by}px)`, transition: reduce ? "none" : "transform 1s linear" }}>
            {!done && <circle r="19" fill="#2557d6" opacity="0.14" />}
            <circle r="13" fill="#2557d6" stroke="#fff" strokeWidth="3" />
            <Bus x={-7.5} y={-7.5} width={15} height={15} color="#fff" strokeWidth={2.2} aria-hidden="true" />
          </g>
        </svg>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e9eefb] text-[#2557d6]" aria-hidden="true">
            <BellRing size={19} />
          </span>
          <div className="min-w-0 flex-1">
            <p id="drop-alert" className="text-[15px] font-semibold">
              하차 알림 받기
            </p>
            <p className="text-[13px] text-[#8b95a1]">아이가 내리면 바로 알려 드립니다</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={alertOn}
            aria-labelledby="drop-alert"
            onClick={onToggle}
            className={`relative h-11 w-[60px] shrink-0 rounded-full ${FOCUS}`}
          >
            <span className={`absolute inset-x-1 top-1/2 h-8 -translate-y-1/2 rounded-full transition-colors ${alertOn ? "bg-[#2557d6]" : "bg-[#d1d6db]"}`} />
            <span className={`absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white shadow transition-[left] motion-reduce:transition-none ${alertOn ? "left-[30px]" : "left-2"}`} />
          </button>
        </div>
      </Card>

      </div>
      <div className="min-w-0 space-y-3">
      <Card>
        <SectionTitle>정류장</SectionTitle>
        <ol>
          {STOPS.map((st, i) => {
            const passed = st.at <= progress;
            const isNext = i === nextIdx;
            const last = i === STOPS.length - 1;
            return (
              <li key={st.name} className="relative flex gap-3 pb-4 last:pb-0">
                {!last && <span className={`absolute left-[9px] top-5 h-[calc(100%-12px)] w-[2px] ${STOPS[i + 1].at <= progress ? "bg-[#2557d6]" : "bg-[#e5e8eb]"}`} aria-hidden="true" />}
                <span className={`relative mt-0.5 h-5 w-5 shrink-0 rounded-full border-[3px] ${passed ? "border-[#2557d6] bg-[#2557d6]" : isNext ? "border-[#2557d6] bg-white" : "border-[#d1d6db] bg-white"}`} aria-hidden="true" />
                <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                  <div>
                    <p className={`text-[15px] ${last ? "font-bold" : "font-semibold"}`}>
                      {st.name}
                      {last && <span className="ml-1.5 text-[13px] font-semibold text-[#2557d6]">하차</span>}
                    </p>
                    <p className="text-[13px] text-[#8b95a1]">{passed ? "통과" : isNext ? "다음 정류장" : "도착 예정"}</p>
                  </div>
                  <span className={`text-[14px] ${passed ? "text-[#8b95a1]" : "font-semibold text-[#191f28]"}`}>{st.time}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card>
        <dl className="divide-y divide-[#f2f4f6]">
          <Row label="차량" value="2호차, 45인승" />
          <Row label="기사님" value="정ㅁ수, 010-5678-****" />
          <Row label="동승 선생님" value="한ㅅ아" />
        </dl>
      </Card>
      </div>
    </div>
  );
}
