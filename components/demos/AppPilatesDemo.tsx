"use client";

// 필라테스 스튜디오 회원 앱 카탈로그(11-01, 2판). 수업 예약, 대기 예약과 빈자리 자동 예약, 예약 취소, 회원권 차감과 복원,
// 강사 피드백 노트, 나의 변화 리포트가 실제로 움직인다. PC에서는 휴대폰 틀 안에, 휴대폰에서는 화면 전체로 보인다.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BatteryFull,
  Bell,
  CalendarCheck,
  CalendarPlus,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock,
  Flame,
  House,
  MapPin,
  MessageSquareText,
  Phone,
  Signal,
  Ticket,
  TrendingUp,
  UserRound,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";
import { daysAgo, fmtKo, fmtMD, useDemoToday } from "@/hooks/useDemoToday";

type Tab = "home" | "book" | "mine" | "pass" | "my";
type Kind = "reformer" | "mat" | "stretch" | "chair";
type TeacherName = "이ㅅ연" | "정ㅎ린" | "최ㅇ진";

type Slot = { time: string; dur: number; name: string; kind: Kind; teacher: TeacherName; room: string; level: string; cap: number; desc: string };
type ClassItem = Slot & { id: string; off: number; date: Date; booked: number; wait: number };
type Booking = { id: string; status: "예약 완료" | "대기"; waitNo?: number; fromWait?: boolean };
type HistoryRow = { key: string; date: Date; name: string; time: string; status: "예약 완료" | "취소" | "출석" | "결석"; delta: number };
type PushMsg = { key: number; text: string; tab: Tab };

const IMG = "/images/demo-pilates";
const TOTAL = 10;
const CANCEL_HOURS = 4;

const TEACHERS: Record<TeacherName, { photo: string; pos: string; role: string; career: string[]; intro: string }> = {
  이ㅅ연: {
    photo: `${IMG}/teacher.jpg`,
    pos: "50% 20%",
    role: "대표 강사",
    career: ["재활 필라테스 지도 9년", "국제 필라테스 지도자 자격", "산전 산후 체형 관리 과정 수료"],
    intro: "처음 오신 분은 호흡과 골반 정렬부터 함께 잡습니다.",
  },
  정ㅎ린: {
    photo: `${IMG}/teacher-2.jpg`,
    pos: "50% 30%",
    role: "강사",
    career: ["그룹 리포머 지도 6년", "체형 교정 운동 지도자 과정 수료", "필라테스 지도자 자격"],
    intro: "동작 하나마다 몸이 어디서 버티는지 짚어 드립니다.",
  },
  최ㅇ진: {
    photo: `${IMG}/teacher-3.jpg`,
    pos: "50% 25%",
    role: "강사",
    career: ["기구 필라테스 지도 7년", "척추 측만 운동 과정 수료", "체어, 바렐 심화 과정 수료"],
    intro: "척추를 마디마디 나눠 쓰는 감각을 기구로 익히게 돕습니다.",
  },
};

const KIND: Record<Kind, { label: string; photo: string; pos: string; line: string }> = {
  reformer: { label: "리포머", photo: `${IMG}/studio.jpg`, pos: "50% 70%", line: "코어와 하체 강화" },
  mat: { label: "매트", photo: `${IMG}/mat.jpg`, pos: "50% 60%", line: "기본 동작과 소도구" },
  stretch: { label: "스트레칭", photo: `${IMG}/hero.jpg`, pos: "68% 45%", line: "이완과 회복" },
  chair: { label: "체어 바렐", photo: `${IMG}/studio.jpg`, pos: "18% 78%", line: "척추 가동성과 균형" },
};

const REFORMER_DESC = "코어와 하체 위주로 진행하는 기본 리포머 수업입니다. 스프링 강도는 개인별로 조절합니다.";
const CHAIR_DESC = "체어와 바렐로 척추 가동성과 균형을 다룹니다. 리포머 수업 10회 이상 경험을 권장합니다.";

const WEEKDAY: Slot[] = [
  { time: "07:00", dur: 50, name: "그룹 리포머 초급", kind: "reformer", teacher: "이ㅅ연", room: "A룸", level: "초급", cap: 6, desc: "리포머가 처음인 분을 위한 수업입니다. 기구 사용법과 호흡부터 천천히 진행합니다." },
  { time: "10:00", dur: 50, name: "그룹 리포머", kind: "reformer", teacher: "정ㅎ린", room: "A룸", level: "초중급", cap: 6, desc: REFORMER_DESC },
  { time: "12:20", dur: 50, name: "체어 바렐", kind: "chair", teacher: "최ㅇ진", room: "B룸", level: "중급", cap: 4, desc: CHAIR_DESC },
  { time: "19:00", dur: 50, name: "그룹 리포머", kind: "reformer", teacher: "이ㅅ연", room: "A룸", level: "초중급", cap: 6, desc: REFORMER_DESC },
  { time: "20:10", dur: 50, name: "매트 필라테스", kind: "mat", teacher: "정ㅎ린", room: "B룸", level: "초급", cap: 8, desc: "매트에서 진행하는 기본 동작 수업입니다. 소도구로 강도를 조절합니다." },
  { time: "21:20", dur: 40, name: "스트레칭 리포머", kind: "stretch", teacher: "최ㅇ진", room: "A룸", level: "초급", cap: 6, desc: "하루를 마무리하는 이완 위주 수업입니다. 어깨와 고관절을 중심으로 풀어 줍니다." },
];

const WEEKEND: Slot[] = [
  { time: "10:00", dur: 50, name: "그룹 리포머", kind: "reformer", teacher: "정ㅎ린", room: "A룸", level: "초중급", cap: 6, desc: REFORMER_DESC },
  { time: "11:10", dur: 50, name: "소도구 매트", kind: "mat", teacher: "이ㅅ연", room: "B룸", level: "초급", cap: 8, desc: "링, 볼, 밴드를 활용하는 매트 수업입니다. 처음 오시는 분도 따라 하기 쉽습니다." },
  { time: "12:20", dur: 50, name: "체어 바렐", kind: "chair", teacher: "최ㅇ진", room: "B룸", level: "중급", cap: 4, desc: CHAIR_DESC },
];

const NOTICES = [
  { title: "11월 정기 휴무 안내", ago: 1, body: "셋째 주 월요일은 기구 점검으로 수업이 없습니다. 해당 날짜 예약은 열리지 않습니다." },
  { title: "주차 등록 방법 변경", ago: 9, body: "건물 주차는 데스크에서 차량 번호를 말씀해 주시면 2시간 무료로 등록해 드립니다." },
];

type Past = { ago: number; time: string; name: string; teacher: TeacherName; status: "출석" | "결석" };
const PAST: Past[] = [
  { ago: 2, time: "10:00", name: "그룹 리포머", teacher: "정ㅎ린", status: "출석" },
  { ago: 5, time: "10:00", name: "그룹 리포머", teacher: "정ㅎ린", status: "결석" },
  { ago: 8, time: "10:00", name: "그룹 리포머", teacher: "이ㅅ연", status: "출석" },
];

// 출석한 수업마다 강사가 남기는 피드백 노트(키는 PAST의 ago)
const FEEDBACK: Record<number, { point: string; checks: { label: string; good: boolean }[]; next: Kind; nextName: string; nextWhy: string }> = {
  2: {
    point: "브릿지에서 골반이 먼저 들리던 습관이 많이 줄었어요. 내려올 때 갈비뼈를 닫은 채로 척추를 하나씩 내려놓는 연습을 이어 가 주세요.",
    checks: [
      { label: "풋워크 발뒤꿈치 정렬", good: true },
      { label: "롤다운 때 목 힘 빼기", good: false },
      { label: "숄더 브릿지 골반 수평", good: true },
    ],
    next: "chair",
    nextName: "체어 바렐",
    nextWhy: "척추를 나눠 쓰는 감각을 바렐에서 한 번 더 익히면 브릿지가 훨씬 편해집니다.",
  },
  8: {
    point: "호흡이 동작보다 먼저 끝나는 편이에요. 내쉬는 숨을 동작 끝까지 길게 가져가면 코어가 덜 풀립니다.",
    checks: [
      { label: "흉곽 호흡", good: false },
      { label: "헌드레드 자세 유지", good: true },
      { label: "스프링 강도 선택", good: true },
    ],
    next: "reformer",
    nextName: "그룹 리포머",
    nextWhy: "지금 단계는 기본 리포머로 호흡과 동작 타이밍을 맞추는 게 좋습니다.",
  },
};

const BODY_CHECKS = [
  { ago: 3, round: 3, items: ["어깨 높이 차 0.4cm", "골반 기울기 정상 범위", "앞으로 굽히기 바닥까지 2cm"], note: "첫 체크보다 어깨 높이 차가 절반으로 줄었습니다." },
  { ago: 33, round: 2, items: ["어깨 높이 차 0.7cm", "골반 기울기 오른쪽 약간", "앞으로 굽히기 바닥까지 6cm"], note: "오른쪽 고관절이 덜 열립니다. 스트레칭 리포머를 권합니다." },
  { ago: 63, round: 1, items: ["어깨 높이 차 0.9cm", "골반 기울기 오른쪽", "앞으로 굽히기 바닥까지 11cm"], note: "첫 상담 기록입니다." },
];

const PREV_MONTHS = [3, 5, 4, 7, 6];

const FIRST_BOOKING = "d1-10:00";
const FIRST_WAIT = "d2-10:00";

const slotsFor = (date: Date) => (date.getDay() === 0 || date.getDay() === 6 ? WEEKEND : WEEKDAY);

// 정해진 규칙으로 예약 인원을 만든다(새로 고쳐도 같은 숫자).
const baseBooked = (off: number, idx: number, cap: number, id: string) => (id === FIRST_WAIT ? cap : Math.min(cap, (off * 5 + idx * 3 + 2) % 8));

const endTime = (time: string, dur: number) => {
  const [h, m] = time.split(":").map(Number);
  const t = h * 60 + m + dur;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

const startMs = (date: Date, time: string) => {
  const [h, m] = time.split(":").map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m).getTime();
};

const dayWord = (off: number, date: Date) => (off === 0 ? "오늘" : off === 1 ? "내일" : fmtKo(date));

const ring = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2E5A4C]";
const card = "rounded-[12px] border border-[#ECE7DF] bg-white shadow-[0_1px_2px_rgba(40,32,20,0.04),0_4px_16px_-8px_rgba(40,32,20,0.10)]";

const BADGE: Record<string, string> = {
  "예약 완료": "bg-[#E4EEE9] text-[#245044]",
  대기: "bg-[#F4EBDC] text-[#7A5418]",
  취소: "bg-[#EEECE8] text-[#5F5A52]",
  출석: "bg-[#E4EEE9] text-[#245044]",
  결석: "bg-[#F6E6E1] text-[#93402B]",
};

function Badge({ children }: { children: string }) {
  return <span className={`inline-flex h-6 shrink-0 items-center rounded-[4px] px-2 text-[12px] font-semibold ${BADGE[children] ?? BADGE["취소"]}`}>{children}</span>;
}

function Avatar({ name, size = 40 }: { name: TeacherName; size?: number }) {
  const t = TEACHERS[name];
  return (
    <span className="relative block shrink-0 overflow-hidden rounded-full bg-[#ECE8E1] ring-2 ring-white" style={{ width: size, height: size }}>
      <Image src={t.photo} alt={`${name} 강사`} fill sizes={`${size * 2}px`} className="object-cover" style={{ objectPosition: t.pos }} />
    </span>
  );
}

function Photo({ src, alt, pos, className, sizes = "390px" }: { src: string; alt: string; pos?: string; className: string; sizes?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#E6E1D8] ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" style={{ objectPosition: pos ?? "50% 50%" }} />
    </div>
  );
}

function CloseOnPhoto({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="닫기"
      className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#22201C] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <X size={20} aria-hidden />
    </button>
  );
}

function Sheet({ open, onClose, labelId, flush, tall, children }: { open: boolean; onClose: () => void; labelId: string; flush?: boolean; tall?: boolean; children: ReactNode }) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[65] md:absolute md:z-40">
          <motion.button
            type="button"
            aria-label="닫기"
            className="absolute inset-0 h-full w-full cursor-default bg-[#1E1C19]/45"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelId}
            tabIndex={-1}
            className={`absolute inset-x-0 bottom-0 overflow-y-auto overscroll-contain rounded-t-[16px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] outline-none ${flush ? "pt-0" : "pt-3"} ${
              tall ? "h-[92%]" : "max-h-[90%]"
            }`}
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 40 }}
          >
            {!flush && <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#DAD5CC]" aria-hidden />}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Toggle({ label, sub, on, onChange }: { label: string; sub?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`flex min-h-[56px] w-full items-center justify-between gap-3 px-4 py-2 text-left ${ring}`}
    >
      <span>
        <span className="block text-[15px] text-[#22201C]">{label}</span>
        {sub && <span className="block text-[12px] text-[#8A847A]">{sub}</span>}
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-[#2E5A4C]" : "bg-[#D6D1C8]"}`} aria-hidden>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-[left] ${on ? "left-6" : "left-1"}`} />
      </span>
    </button>
  );
}

function Segmented<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { id: T; label: string }[]; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex rounded-[10px] bg-[#ECE8E1] p-1">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          aria-selected={value === it.id}
          onClick={() => onChange(it.id)}
          className={`min-h-[44px] flex-1 rounded-[6px] text-[14px] font-semibold transition-colors ${ring} ${value === it.id ? "bg-white text-[#22201C] shadow-sm" : "text-[#6B665E]"}`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function SectionHead({ id, title, action }: { id: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex min-h-[28px] items-center justify-between">
      <h2 id={id} className="text-[17px] font-bold text-[#22201C]">
        {title}
      </h2>
      {action}
    </div>
  );
}

function MonthChart({ labels, values }: { labels: string[]; values: number[] }) {
  const max = Math.max(8, ...values);
  const w = 300;
  const h = 132;
  const bw = 28;
  const gap = (w - bw * values.length) / (values.length - 1);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={`월별 운동 횟수, ${labels.map((l, i) => `${l} ${values[i]}회`).join(", ")}`}>
      {[0.5, 1].map((r) => (
        <line key={r} x1={0} x2={w} y1={104 - 88 * r} y2={104 - 88 * r} stroke="#EEEAE3" strokeWidth={1} />
      ))}
      <line x1={0} x2={w} y1={104} y2={104} stroke="#DAD5CC" strokeWidth={1} />
      {values.map((v, i) => {
        const bh = Math.max(4, (v / max) * 88);
        const x = i * (bw + gap);
        const last = i === values.length - 1;
        return (
          <g key={labels[i]}>
            <rect x={x} y={104 - bh} width={bw} height={bh} rx={4} fill={last ? "#2E5A4C" : "#CFC8BC"} />
            <text x={x + bw / 2} y={104 - bh - 6} textAnchor="middle" fontSize={12} fontWeight={700} fill={last ? "#2E5A4C" : "#6B665E"}>
              {v}
            </text>
            <text x={x + bw / 2} y={124} textAnchor="middle" fontSize={12} fill={last ? "#22201C" : "#8A847A"} fontWeight={last ? 700 : 400}>
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function AppPilatesDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<Tab>("home");
  const [dayPick, setDayOff] = useState<number | null>(null);
  const [kindFilter, setKindFilter] = useState<Kind | "all">("all");
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [seatDelta, setSeatDelta] = useState<Record<string, number>>({ [FIRST_BOOKING]: 1 });
  const [waitDelta, setWaitDelta] = useState<Record<string, number>>({ [FIRST_WAIT]: 1 });
  const [bookings, setBookings] = useState<Booking[]>([
    { id: FIRST_BOOKING, status: "예약 완료" },
    { id: FIRST_WAIT, status: "대기", waitNo: 1 },
  ]);
  const [cancelled, setCancelled] = useState<{ id: string; at: number }[]>([]);
  const [usage, setUsage] = useState<{ key: string; id: string; status: "예약 완료" | "취소"; delta: number }[]>([{ key: "u0", id: FIRST_BOOKING, status: "예약 완료", delta: -1 }]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [teacherOpen, setTeacherOpen] = useState<TeacherName | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState<number | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [readFeedback, setReadFeedback] = useState<number[]>([]);
  const [mineView, setMineView] = useState<"upcoming" | "past">("upcoming");
  const [passView, setPassView] = useState<"all" | "use" | "back">("all");
  const [push, setPush] = useState<PushMsg | null>(null);
  const [alarmClass, setAlarmClass] = useState(true);
  const [alarmWait, setAlarmWait] = useState(true);
  const [alarmNotice, setAlarmNotice] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seq = useRef(1);
  const pushTimer = useRef<number | undefined>(undefined);

  const days = useMemo(() => Array.from({ length: 7 }, (_, off) => ({ off, date: daysAgo(today, -off) })), [today]);

  const findClass = (id: string): ClassItem | null => {
    const m = /^d(\d+)-(\d\d:\d\d)$/.exec(id);
    if (!m) return null;
    const off = Number(m[1]);
    const date = daysAgo(today, -off);
    const slots = slotsFor(date);
    const idx = slots.findIndex((s) => s.time === m[2]);
    if (idx < 0) return null;
    const s = slots[idx];
    return { ...s, id, off, date, booked: baseBooked(off, idx, s.cap, id) + (seatDelta[id] ?? 0), wait: waitDelta[id] ?? 0 };
  };

  const dayClasses = (off: number) =>
    slotsFor(daysAgo(today, -off))
      .map((s) => findClass(`d${off}-${s.time}`))
      .filter((c): c is ClassItem => c !== null);

  const isEnded = (c: ClassItem) => nowMs !== null && startMs(c.date, c.time) <= nowMs;
  // 처음에는 아직 예약할 수 있는 수업이 남은 첫날을 보여 준다.
  const dayOff = dayPick ?? Math.max(0, days.findIndex(({ off }) => dayClasses(off).some((c) => !isEnded(c))));
  const canCancel = (c: ClassItem) => nowMs === null || startMs(c.date, c.time) - nowMs >= CANCEL_HOURS * 3600 * 1000;
  const myBooking = (id: string) => bookings.find((b) => b.id === id);

  const used = PAST.length - usage.reduce((sum, u) => sum + u.delta, 0);
  const remaining = TOTAL - used;
  const passStart = daysAgo(today, 24);
  const passEnd = daysAgo(today, -66);

  const upcoming = bookings
    .map((b) => ({ b, c: findClass(b.id) }))
    .filter((x): x is { b: Booking; c: ClassItem } => x.c !== null)
    .sort((a, z) => startMs(a.c.date, a.c.time) - startMs(z.c.date, z.c.time));
  const nextClass = upcoming.find((x) => x.b.status === "예약 완료" && !isEnded(x.c));

  const history: HistoryRow[] = [
    ...usage
      .map((u) => {
        const c = findClass(u.id);
        const row: HistoryRow | null = c ? { key: u.key, date: c.date, name: c.name, time: c.time, status: u.status, delta: u.delta } : null;
        return row;
      })
      .filter((r): r is HistoryRow => r !== null)
      .reverse(),
    ...PAST.map((p): HistoryRow => ({ key: `p${p.ago}`, date: daysAgo(today, p.ago), name: p.name, time: p.time, status: p.status, delta: -1 })),
  ];
  const historyShown = history.filter((h) => (passView === "all" ? true : passView === "use" ? h.delta < 0 : h.delta > 0));

  // 나의 변화 리포트: 지난 5개월 기록 + 이번 달(출석과 예약 완료)
  const monthLabels = Array.from({ length: 6 }, (_, i) => `${new Date(today.getFullYear(), today.getMonth() - 5 + i, 1).getMonth() + 1}월`);
  const sameMonth = (d: Date) => d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
  const thisMonth =
    PAST.filter((p) => p.status === "출석" && sameMonth(daysAgo(today, p.ago))).length + upcoming.filter((x) => x.b.status === "예약 완료" && sameMonth(x.c.date)).length;
  const monthValues = [...PREV_MONTHS, thisMonth];
  const totalAttend = PREV_MONTHS.reduce((a, b) => a + b, 0) + PAST.filter((p) => p.status === "출석").length;
  const unread = PAST.filter((p) => FEEDBACK[p.ago] && !readFeedback.includes(p.ago));
  const latestFeedback = PAST.find((p) => FEEDBACK[p.ago]);

  const showPush = (text: string, to: Tab) => {
    window.clearTimeout(pushTimer.current);
    const key = seq.current++;
    setPush({ key, text, tab: to });
    pushTimer.current = window.setTimeout(() => setPush(null), 6500);
  };

  // 대기 중인 수업에 빈자리가 나면 자동으로 예약 완료로 바꾼다(다른 회원 취소를 흉내 낸다).
  const promote = (id: string) => {
    const b = bookings.find((x) => x.id === id);
    const c = findClass(id);
    if (!b || b.status !== "대기" || !c || remaining <= 0) return;
    setWaitDelta((d) => ({ ...d, [id]: (d[id] ?? 0) - 1 }));
    setBookings((all) => all.map((x) => (x.id === id ? { id, status: "예약 완료", fromWait: true } : x)));
    const k = seq.current++;
    setUsage((u) => [...u, { key: `u${k}`, id, status: "예약 완료", delta: -1 }]);
    if (alarmWait) showPush(`[필라테스 스튜디오] 대기하던 ${fmtKo(c.date)} ${c.time} ${c.name} 수업에 빈자리가 나 예약 완료되었습니다`, "mine");
  };

  const remind = () => {
    const c = findClass(FIRST_BOOKING);
    if (!c || !myBooking(FIRST_BOOKING) || !alarmClass) return;
    showPush(`[필라테스 스튜디오] ${dayWord(c.off, c.date)} ${c.time} ${c.name} 수업이 있습니다`, "mine");
  };

  // 타이머 안에서 최신 상태를 쓰도록 매 렌더 뒤 함수를 갈아 끼운다.
  const actions = useRef({ promote, remind });
  useEffect(() => {
    actions.current = { promote, remind };
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => setNowMs(new Date().getTime()));
    const t1 = window.setTimeout(() => actions.current.remind(), 1400);
    const t2 = window.setTimeout(() => actions.current.promote(FIRST_WAIT), 16000);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(pushTimer.current);
    };
  }, []);

  const go = (t: Tab) => {
    setTab(t);
    scrollRef.current?.scrollTo({ top: 0 });
    if (window.innerWidth < 768) window.scrollTo({ top: 0 });
  };

  const openKind = (k: Kind | "all") => {
    setKindFilter(k);
    go("book");
  };

  const book = (c: ClassItem) => {
    if (myBooking(c.id)) return;
    if (c.booked >= c.cap) {
      setWaitDelta((d) => ({ ...d, [c.id]: (d[c.id] ?? 0) + 1 }));
      setBookings((b) => [...b, { id: c.id, status: "대기", waitNo: c.wait + 1 }]);
      window.setTimeout(() => actions.current.promote(c.id), 12000);
    } else {
      if (remaining <= 0) return;
      setSeatDelta((d) => ({ ...d, [c.id]: (d[c.id] ?? 0) + 1 }));
      setBookings((b) => [...b, { id: c.id, status: "예약 완료" }]);
      const k = seq.current++;
      setUsage((u) => [...u, { key: `u${k}`, id: c.id, status: "예약 완료", delta: -1 }]);
    }
    setCancelled((x) => x.filter((y) => y.id !== c.id));
    setDetailId(null);
    setDoneId(c.id);
  };

  const cancel = (id: string) => {
    const b = myBooking(id);
    if (!b) return;
    if (b.status === "예약 완료") {
      setSeatDelta((d) => ({ ...d, [id]: (d[id] ?? 0) - 1 }));
      const k = seq.current++;
      setUsage((u) => [...u, { key: `u${k}`, id, status: "취소", delta: 1 }]);
    } else {
      setWaitDelta((d) => ({ ...d, [id]: (d[id] ?? 0) - 1 }));
    }
    setBookings((all) => all.filter((x) => x.id !== id));
    const at = seq.current++;
    setCancelled((x) => [...x.filter((y) => y.id !== id), { id, at }]);
    setCancelId(null);
  };

  const openFeedback = (ago: number) => {
    setFeedbackOpen(ago);
    setReadFeedback((r) => (r.includes(ago) ? r : [...r, ago]));
  };

  const detail = detailId ? findClass(detailId) : null;
  const bookDetail = () => {
    if (detail) book(detail);
  };
  const done = doneId ? findClass(doneId) : null;
  const doneBooking = doneId ? myBooking(doneId) : undefined;
  const cancelTarget = cancelId ? findClass(cancelId) : null;
  const cancelBooking = cancelId ? myBooking(cancelId) : undefined;
  const fb = feedbackOpen !== null ? FEEDBACK[feedbackOpen] : null;
  const fbPast = feedbackOpen !== null ? PAST.find((p) => p.ago === feedbackOpen) : undefined;

  // 이번 주 추천 수업: 아직 자리가 있고 내가 예약하지 않은 수업 3개, 종류가 겹치지 않게
  const picks: ClassItem[] = [];
  for (const { off } of days) {
    for (const c of dayClasses(off)) {
      if (picks.length >= 3) break;
      if (isEnded(c) || c.booked >= c.cap || myBooking(c.id) || picks.some((p) => p.kind === c.kind)) continue;
      picks.push(c);
    }
  }

  const seatText = (c: ClassItem) => {
    if (isEnded(c)) return { text: "종료", tone: "text-[#9A948A]" };
    if (c.booked >= c.cap) return { text: c.wait > 0 ? `마감, 대기 ${c.wait}명` : "마감", tone: "text-[#7A5418]" };
    const left = c.cap - c.booked;
    return { text: `${left}자리 남음`, tone: left <= 2 ? "text-[#93402B]" : "text-[#245044]" };
  };

  const tabs: { id: Tab; label: string; Icon: typeof House }[] = [
    { id: "home", label: "홈", Icon: House },
    { id: "book", label: "예약", Icon: CalendarPlus },
    { id: "mine", label: "내 예약", Icon: CalendarCheck },
    { id: "pass", label: "회원권", Icon: Ticket },
    { id: "my", label: "마이", Icon: UserRound },
  ];

  const title: Record<Tab, string> = { home: "필라테스 스튜디오", book: "수업 예약", mine: "내 예약", pass: "회원권", my: "마이" };

  const classRow = (c: ClassItem, withDate = false) => {
    const mine = myBooking(c.id);
    const seat = seatText(c);
    const k = KIND[c.kind];
    return (
      <li key={c.id}>
        <button
          type="button"
          onClick={() => setDetailId(c.id)}
          className={`flex w-full items-center gap-3 rounded-[12px] border bg-white p-3 text-left shadow-[0_1px_2px_rgba(40,32,20,0.04)] transition-colors hover:border-[#C9C2B6] ${ring} ${
            mine ? "border-[#2E5A4C]" : "border-[#ECE7DF]"
          } ${isEnded(c) ? "opacity-55" : ""}`}
        >
          <Photo src={k.photo} alt="" pos={k.pos} className="h-[68px] w-[68px] shrink-0 rounded-[8px]" sizes="136px" />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold tabular-nums text-[#2E5A4C]">
              {withDate ? `${dayWord(c.off, c.date)} ` : ""}
              {c.time}~{endTime(c.time, c.dur)}
            </span>
            <span className="mt-0.5 block truncate text-[16px] font-bold text-[#22201C]">{c.name}</span>
            <span className="mt-1 flex items-center gap-1.5 text-[13px] text-[#6B665E]">
              <Avatar name={c.teacher} size={20} />
              <span className="truncate">
                {c.teacher}, {c.room}, {c.level}
              </span>
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-end gap-1 self-stretch justify-center">
            {mine ? <Badge>{mine.status}</Badge> : <span className={`text-[13px] font-semibold ${seat.tone}`}>{seat.text}</span>}
            <span className="text-[12px] tabular-nums text-[#9A948A]">
              {Math.min(c.booked, c.cap)}/{c.cap}명
            </span>
          </span>
        </button>
      </li>
    );
  };

  const feedbackCard = latestFeedback && FEEDBACK[latestFeedback.ago] && (
    <button type="button" onClick={() => openFeedback(latestFeedback.ago)} className={`${card} block w-full p-4 text-left hover:border-[#D6D0C6] ${ring}`}>
      <span className="flex items-center gap-3">
        <span className="relative">
          <Avatar name={latestFeedback.teacher} size={44} />
          {unread.length > 0 && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#B5532F]" aria-hidden />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#2E5A4C]">
            <MessageSquareText size={14} aria-hidden /> 강사 피드백 노트{unread.length > 0 ? ", 새 노트" : ""}
          </span>
          <span className="mt-0.5 block text-[15px] font-bold text-[#22201C]">
            {latestFeedback.teacher} 강사, {fmtMD(daysAgo(today, latestFeedback.ago))} {latestFeedback.name}
          </span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-[#9A948A]" aria-hidden />
      </span>
      <span className="mt-3 line-clamp-2 block rounded-[8px] bg-[#F6F4F0] px-3 py-2.5 text-[14px] leading-[1.6] text-[#4E4A43]">{FEEDBACK[latestFeedback.ago].point}</span>
    </button>
  );

  const screen = (() => {
    if (tab === "home") {
      return (
        <div className="space-y-7 pb-8">
          <div className="px-4">
            <div className="relative overflow-hidden rounded-[16px]">
              <Photo src={`${IMG}/hero.jpg`} alt="햇빛이 드는 스튜디오에서 리포머 동작을 하는 회원" pos="72% 40%" className="aspect-[4/3] w-full" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(24,22,18,0.72),rgba(24,22,18,0.05)_62%)]" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[13px] font-medium text-white/80">김ㅎ늘 회원님</p>
                <p className="mt-1 text-[22px] font-bold leading-[1.35]">다음 주 시간표가 열렸습니다</p>
                <button
                  type="button"
                  onClick={() => openKind("all")}
                  className="mt-3 inline-flex min-h-[44px] items-center gap-1 rounded-full bg-white px-4 text-[14px] font-bold text-[#22201C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  시간표 보기 <ChevronRight size={16} aria-hidden />
                </button>
              </div>
            </div>
          </div>

          <section aria-labelledby="next-title" className="px-4">
            <SectionHead id="next-title" title="다음 수업" />
            {nextClass ? (
              <div className={`${card} p-4`}>
                <div className="flex items-center gap-3">
                  <Avatar name={nextClass.c.teacher} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-[#2E5A4C]">
                      {dayWord(nextClass.c.off, nextClass.c.date)} {nextClass.c.time}
                    </p>
                    <p className="truncate text-[18px] font-bold text-[#22201C]">{nextClass.c.name}</p>
                  </div>
                  <Badge>예약 완료</Badge>
                </div>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#EEEAE3] pt-3 text-[13px] text-[#6B665E]">
                  <span className="inline-flex items-center gap-1">
                    <UserRound size={14} aria-hidden /> {nextClass.c.teacher} 강사
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} aria-hidden /> {nextClass.c.room}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} aria-hidden /> {nextClass.c.time}~{endTime(nextClass.c.time, nextClass.c.dur)}
                  </span>
                </p>
              </div>
            ) : (
              <div className={`${card} flex items-center justify-between gap-3 p-4`}>
                <p className="text-[15px] text-[#4E4A43]">예정된 수업이 없습니다.</p>
                <button type="button" onClick={() => openKind("all")} className={`min-h-[44px] rounded-[8px] bg-[#2E5A4C] px-4 text-[14px] font-semibold text-white ${ring}`}>
                  예약하기
                </button>
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => openKind("all")} className={`${card} flex min-h-[64px] items-center gap-3 px-4 text-left hover:border-[#D6D0C6] ${ring}`}>
                <CalendarPlus size={22} className="text-[#2E5A4C]" aria-hidden />
                <span className="text-[15px] font-bold text-[#22201C]">수업 예약</span>
              </button>
              <button type="button" onClick={() => go("pass")} className={`${card} flex min-h-[64px] items-center gap-3 px-4 text-left hover:border-[#D6D0C6] ${ring}`}>
                <Ticket size={22} className="text-[#2E5A4C]" aria-hidden />
                <span>
                  <span className="block text-[15px] font-bold text-[#22201C]">회원권</span>
                  <span className="block text-[12px] text-[#6B665E]">{remaining}회 남음</span>
                </span>
              </button>
            </div>
          </section>

          <section aria-labelledby="note-title" className="px-4">
            <SectionHead id="note-title" title="지난 수업 피드백" />
            {feedbackCard}
          </section>

          <section aria-labelledby="change-title" className="px-4">
            <SectionHead id="change-title" title="나의 변화" />
            <button type="button" onClick={() => setReportOpen(true)} className={`${card} block w-full p-4 text-left hover:border-[#D6D0C6] ${ring}`}>
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#B5532F]">
                    <Flame size={14} aria-hidden /> 4주 연속 출석
                  </span>
                  <span className="mt-1 block text-[15px] text-[#4E4A43]">
                    이번 달 <strong className="text-[20px] font-bold text-[#22201C]">{thisMonth}회</strong>, 지난달 {PREV_MONTHS[4]}회
                  </span>
                </span>
                <span className="inline-flex min-h-[28px] items-center gap-0.5 text-[13px] text-[#6B665E]">
                  리포트 <ChevronRight size={15} aria-hidden />
                </span>
              </span>
              <span className="mt-3 flex h-[44px] items-end gap-1.5" aria-hidden>
                {monthValues.map((v, i) => (
                  <span key={monthLabels[i]} className={`flex-1 rounded-t-[3px] ${i === 5 ? "bg-[#2E5A4C]" : "bg-[#DCD6CC]"}`} style={{ height: `${Math.max(8, (v / 8) * 100)}%` }} />
                ))}
              </span>
            </button>
          </section>

          <section aria-labelledby="kind-title">
            <div className="px-4">
              <SectionHead id="kind-title" title="수업 종류" />
            </div>
            <ul className="flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(["reformer", "mat", "stretch", "chair"] as Kind[]).map((k) => (
                <li key={k} className="w-[148px] shrink-0 snap-start">
                  <button type="button" onClick={() => openKind(k)} className={`block w-full overflow-hidden rounded-[12px] bg-white text-left shadow-[0_1px_2px_rgba(40,32,20,0.05)] ${ring}`}>
                    <Photo src={KIND[k].photo} alt="" pos={KIND[k].pos} className="aspect-[4/5] w-full" sizes="300px" />
                    <span className="block px-3 py-2.5">
                      <span className="block text-[15px] font-bold text-[#22201C]">{KIND[k].label}</span>
                      <span className="block truncate text-[12px] text-[#6B665E]">{KIND[k].line}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {picks.length > 0 && (
            <section aria-labelledby="pick-title" className="px-4">
              <SectionHead id="pick-title" title="이번 주 추천 수업" />
              <ul className="space-y-2">{picks.map((c) => classRow(c, true))}</ul>
            </section>
          )}

          <section aria-labelledby="teacher-title">
            <div className="px-4">
              <SectionHead id="teacher-title" title="강사 소개" />
            </div>
            <ul className="grid grid-cols-3 gap-3 px-4">
              {(Object.keys(TEACHERS) as TeacherName[]).map((n) => (
                <li key={n}>
                  <button type="button" onClick={() => setTeacherOpen(n)} className={`block w-full rounded-[12px] text-left ${ring}`}>
                    <Photo src={TEACHERS[n].photo} alt={`${n} 강사`} pos={TEACHERS[n].pos} className="aspect-[3/4] w-full rounded-[12px]" sizes="240px" />
                    <span className="mt-2 block text-[15px] font-bold text-[#22201C]">{n}</span>
                    <span className="block text-[12px] text-[#6B665E]">{TEACHERS[n].role}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="notice-title" className="px-4">
            <SectionHead id="notice-title" title="공지사항" />
            <article className={`${card} overflow-hidden`}>
              <Photo src={`${IMG}/studio.jpg`} alt="리포머 세 대가 놓인 B룸 전경" pos="50% 65%" className="aspect-[2/1] w-full" />
              <div className="p-4">
                <p className="text-[12px] text-[#9A948A]">{fmtMD(daysAgo(today, 4))}</p>
                <h3 className="mt-1 text-[16px] font-bold text-[#22201C]">주말 체어 바렐 수업이 열렸습니다</h3>
                <p className="mt-1 text-[14px] leading-[1.6] text-[#4E4A43]">토요일과 일요일 12:20, B룸에서 정원 4명으로 진행합니다.</p>
                <button type="button" onClick={() => openKind("chair")} className={`mt-2 -ml-1 inline-flex min-h-[44px] items-center gap-0.5 px-1 text-[14px] font-semibold text-[#2E5A4C] ${ring}`}>
                  체어 바렐 시간표 <ChevronRight size={15} aria-hidden />
                </button>
              </div>
            </article>
            <ul className={`${card} mt-3 divide-y divide-[#EEEAE3]`}>
              {NOTICES.map((n) => (
                <li key={n.title}>
                  <details className="group">
                    <summary className={`flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden ${ring}`}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] text-[#22201C]">{n.title}</span>
                        <span className="block text-[12px] text-[#9A948A]">{fmtMD(daysAgo(today, n.ago))}</span>
                      </span>
                      <ChevronDown size={18} className="shrink-0 text-[#9A948A] transition-transform group-open:rotate-180" aria-hidden />
                    </summary>
                    <p className="px-4 pb-4 text-[14px] leading-[1.6] text-[#4E4A43]">{n.body}</p>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        </div>
      );
    }

    if (tab === "book") {
      const list = dayClasses(dayOff).filter((c) => kindFilter === "all" || c.kind === kindFilter);
      const sel = days[dayOff].date;
      const chips: { id: Kind | "all"; label: string }[] = [
        { id: "all", label: "전체" },
        { id: "reformer", label: "리포머" },
        { id: "mat", label: "매트" },
        { id: "stretch", label: "스트레칭" },
        { id: "chair", label: "체어 바렐" },
      ];
      return (
        <div className="pb-6">
          <div className="sticky top-[56px] z-10 border-b border-[#E7E2DA] bg-[#F6F4F0] px-4 pb-3 pt-1">
            <p className="mb-2 text-[13px] font-semibold text-[#6B665E]">
              {sel.getFullYear()}년 {sel.getMonth() + 1}월
            </p>
            <div role="tablist" aria-label="날짜 선택" className="grid grid-cols-7 gap-1">
              {days.map(({ off, date }) => {
                const active = off === dayOff;
                const dow = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
                const hasMine = bookings.some((b) => b.id.startsWith(`d${off}-`));
                return (
                  <button
                    key={off}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`${fmtKo(date)}${off === 0 ? ", 오늘" : ""}${hasMine ? ", 예약 있음" : ""}`}
                    onClick={() => setDayOff(off)}
                    className={`flex min-h-[64px] flex-col items-center justify-center rounded-[10px] ${ring} ${active ? "bg-[#2E5A4C] text-white" : "text-[#22201C] hover:bg-[#ECE8E1]"}`}
                  >
                    <span className={`text-[12px] ${active ? "text-[#CFE0D8]" : date.getDay() === 0 ? "text-[#93402B]" : "text-[#6B665E]"}`}>{off === 0 ? "오늘" : dow}</span>
                    <span className="text-[17px] font-bold tabular-nums">{date.getDate()}</span>
                    <span className={`mt-0.5 h-1 w-1 rounded-full ${hasMine ? (active ? "bg-white" : "bg-[#2E5A4C]") : "bg-transparent"}`} aria-hidden />
                  </button>
                );
              })}
            </div>
            <div className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="수업 종류">
              {chips.map((ch) => {
                const on = kindFilter === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setKindFilter(ch.id)}
                    className={`min-h-[44px] shrink-0 rounded-full border px-3 text-[14px] font-semibold ${ring} ${
                      on ? "border-[#22201C] bg-[#22201C] text-white" : "border-[#DAD5CC] bg-white text-[#4E4A43]"
                    }`}
                  >
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="px-4 pt-4">
            <p className="mb-3 text-[14px] text-[#6B665E]">
              {fmtKo(sel)}, 수업 {list.length}개
            </p>
            {list.length === 0 ? (
              <div className={`${card} px-5 py-8 text-center`}>
                <p className="text-[15px] text-[#4E4A43]">이 날은 {kindFilter !== "all" ? KIND[kindFilter].label : ""} 수업이 없습니다.</p>
                <button type="button" onClick={() => setKindFilter("all")} className={`mt-3 min-h-[44px] rounded-[8px] border border-[#D6D1C8] px-4 text-[14px] font-semibold text-[#4E4A43] ${ring}`}>
                  전체 수업 보기
                </button>
              </div>
            ) : (
              <ul className="space-y-2">{list.map((c) => classRow(c))}</ul>
            )}
            <p className="mt-4 text-[13px] leading-[1.6] text-[#6B665E]">예약은 7일 전부터 열리고, 수업 {CANCEL_HOURS}시간 전까지 취소할 수 있습니다. 마감된 수업은 대기 예약을 하면 빈자리가 날 때 자동으로 예약됩니다.</p>
          </div>
        </div>
      );
    }

    if (tab === "mine") {
      const pastRows = [
        ...cancelled
          .slice()
          .sort((a, z) => z.at - a.at)
          .map((x) => findClass(x.id))
          .filter((c): c is ClassItem => c !== null)
          .map((c) => ({ key: `c-${c.id}`, ago: -1, date: c.date, time: c.time, name: c.name, teacher: c.teacher, status: "취소" as const })),
        ...PAST.map((p) => ({ key: `p${p.ago}`, ago: p.ago, date: daysAgo(today, p.ago), time: p.time, name: p.name, teacher: p.teacher, status: p.status })),
      ];
      return (
        <div className="space-y-4 px-4 pb-6 pt-2">
          <Segmented
            label="예약 구분"
            value={mineView}
            onChange={setMineView}
            items={[
              { id: "upcoming", label: `예정 ${upcoming.length}` },
              { id: "past", label: "지난 수업" },
            ]}
          />
          {mineView === "upcoming" ? (
            upcoming.length === 0 ? (
              <div className={`${card} px-5 py-8 text-center`}>
                <p className="text-[15px] text-[#4E4A43]">예정된 수업이 없습니다.</p>
                <button type="button" onClick={() => openKind("all")} className={`mt-4 min-h-[44px] rounded-[8px] bg-[#2E5A4C] px-5 text-[15px] font-semibold text-white ${ring}`}>
                  수업 예약하기
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {upcoming.map(({ b, c }) => (
                  <li key={c.id} className={`${card} overflow-hidden`}>
                    <div className="flex gap-3 p-4">
                      <Photo src={KIND[c.kind].photo} alt="" pos={KIND[c.kind].pos} className="h-[72px] w-[72px] shrink-0 rounded-[8px]" sizes="144px" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[14px] font-semibold text-[#2E5A4C]">
                            {fmtKo(c.date)} {c.time}
                          </p>
                          <Badge>{b.status}</Badge>
                        </div>
                        <p className="mt-0.5 truncate text-[17px] font-bold text-[#22201C]">{c.name}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#6B665E]">
                          <Avatar name={c.teacher} size={20} /> {c.teacher} 강사, {c.room}
                        </p>
                      </div>
                    </div>
                    {b.status === "대기" && (
                      <p className="mx-4 mb-3 rounded-[8px] bg-[#F7F2E9] px-3 py-2 text-[13px] leading-[1.55] text-[#6B4A16]">
                        대기 {b.waitNo}번, 빈자리가 나면 자동으로 예약 완료되고 알림을 보내 드립니다.
                      </p>
                    )}
                    {b.fromWait && <p className="mx-4 mb-3 rounded-[8px] bg-[#EEF4F1] px-3 py-2 text-[13px] text-[#245044]">대기 중 빈자리가 나 자동으로 예약되었습니다.</p>}
                    <div className="flex items-center justify-between gap-3 border-t border-[#EEEAE3] px-4 py-2">
                      <span className="text-[12px] text-[#9A948A]">{canCancel(c) ? `${CANCEL_HOURS}시간 전까지 취소 가능` : "취소 가능 시간 지남"}</span>
                      <button type="button" onClick={() => setCancelId(c.id)} className={`min-h-[44px] rounded-[8px] px-3 text-[14px] font-semibold text-[#4E4A43] hover:bg-[#F6F4F0] ${ring}`}>
                        {b.status === "대기" ? "대기 취소" : "예약 취소"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <ul className={`${card} divide-y divide-[#EEEAE3]`}>
              {pastRows.map((r) => (
                <li key={r.key} className="px-4 py-3">
                  <div className="flex min-h-[44px] items-center gap-3">
                    <Avatar name={r.teacher} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold text-[#22201C]">{r.name}</span>
                      <span className="block text-[13px] text-[#6B665E]">
                        {fmtKo(r.date)} {r.time}, {r.teacher} 강사
                      </span>
                    </span>
                    <Badge>{r.status}</Badge>
                  </div>
                  {r.status === "출석" && FEEDBACK[r.ago] && (
                    <button
                      type="button"
                      onClick={() => openFeedback(r.ago)}
                      className={`mt-2 flex min-h-[44px] w-full items-center gap-2 rounded-[8px] bg-[#F6F4F0] px-3 text-left text-[14px] font-semibold text-[#2E5A4C] ${ring}`}
                    >
                      <MessageSquareText size={16} aria-hidden />
                      <span className="flex-1">강사 피드백 노트</span>
                      {!readFeedback.includes(r.ago) && <span className="text-[12px] font-bold text-[#B5532F]">새 노트</span>}
                      <ChevronRight size={16} aria-hidden />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    if (tab === "pass") {
      const dLeft = Math.round((passEnd.getTime() - today.getTime()) / 86400000);
      const reserved = bookings.filter((b) => b.status === "예약 완료").length;
      return (
        <div className="space-y-6 px-4 pb-6 pt-2">
          <section aria-labelledby="pass-title">
            <div className="relative aspect-[1.586/1] overflow-hidden rounded-[16px] bg-[#1F3A31] text-white shadow-[0_18px_36px_-18px_rgba(20,40,32,0.6)]">
              <Image src={`${IMG}/studio.jpg`} alt="" fill sizes="390px" className="object-cover opacity-25 mix-blend-luminosity" style={{ objectPosition: "50% 70%" }} />
              <div className="absolute inset-0 bg-[#1F3A31]/55" aria-hidden />
              <div className="absolute inset-0 flex flex-col justify-between p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-semibold tracking-[0.08em] text-[#CFE0D8]">필라테스 스튜디오 회원권</p>
                    <h2 id="pass-title" className="mt-1 text-[19px] font-bold">
                      그룹 리포머 10회권
                    </h2>
                  </div>
                  <span className="rounded-[4px] bg-white/15 px-2 py-1 text-[12px] font-semibold">D-{dLeft}</span>
                </div>
                <div>
                  <p className="text-[14px] text-white/80">
                    {TOTAL}회 중 <strong className="text-[34px] font-bold leading-none text-white">{remaining}</strong>회 남음
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20" role="progressbar" aria-label="남은 횟수" aria-valuemin={0} aria-valuemax={TOTAL} aria-valuenow={remaining}>
                    <div className="h-full rounded-full bg-white transition-[width] duration-300" style={{ width: `${(remaining / TOTAL) * 100}%` }} />
                  </div>
                  <div className="mt-3 flex items-end justify-between text-[12px] text-white/75">
                    <span>김ㅎ늘, 회원번호 20417</span>
                    <span className="tabular-nums">~ {fmtMD(passEnd)}</span>
                  </div>
                </div>
              </div>
            </div>
            <dl className={`${card} mt-3 grid grid-cols-3 gap-2 p-4 text-center`}>
              <div>
                <dt className="text-[12px] text-[#6B665E]">사용</dt>
                <dd className="text-[18px] font-bold text-[#22201C]">{used - reserved}회</dd>
              </div>
              <div className="border-x border-[#EEEAE3]">
                <dt className="text-[12px] text-[#6B665E]">예약 중</dt>
                <dd className="text-[18px] font-bold text-[#22201C]">{reserved}회</dd>
              </div>
              <div>
                <dt className="text-[12px] text-[#6B665E]">남음</dt>
                <dd className="text-[18px] font-bold text-[#2E5A4C]">{remaining}회</dd>
              </div>
            </dl>
            <p className="mt-3 text-[13px] text-[#6B665E]">
              유효기간 {fmtKo(passStart)} ~ {fmtKo(passEnd)}
            </p>
          </section>

          <section aria-labelledby="usage-title">
            <SectionHead id="usage-title" title="사용 내역" />
            <Segmented
              label="사용 내역 구분"
              value={passView}
              onChange={setPassView}
              items={[
                { id: "all", label: "전체" },
                { id: "use", label: "차감" },
                { id: "back", label: "복원" },
              ]}
            />
            {historyShown.length === 0 ? (
              <p className={`${card} mt-3 px-4 py-6 text-center text-[14px] text-[#6B665E]`}>복원된 내역이 없습니다.</p>
            ) : (
              <ul className={`${card} mt-3 divide-y divide-[#EEEAE3]`}>
                {historyShown.map((h) => (
                  <li key={h.key} className="flex min-h-[64px] items-center gap-3 px-4 py-3">
                    <span className="w-[44px] shrink-0 text-[13px] tabular-nums text-[#6B665E]">{fmtMD(h.date)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] text-[#22201C]">{h.name}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-[12px] text-[#6B665E]">
                        {h.time} 수업 <Badge>{h.status}</Badge>
                      </span>
                    </span>
                    <span className={`shrink-0 text-[15px] font-bold tabular-nums ${h.delta > 0 ? "text-[#2E5A4C]" : "text-[#22201C]"}`}>{h.delta > 0 ? "+1회" : "-1회"}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      );
    }

    return (
      <div className="space-y-6 px-4 pb-6 pt-2">
        <section className={`${card} flex items-center gap-4 p-5`}>
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#ECE8E1] text-[#6B665E]" aria-hidden>
            <UserRound size={28} />
          </span>
          <div className="min-w-0">
            <p className="text-[18px] font-bold text-[#22201C]">김ㅎ늘 회원님</p>
            <p className="text-[14px] tabular-nums text-[#6B665E]">010-****-5821</p>
            <p className="text-[13px] text-[#9A948A]">회원번호 20417, 누적 출석 {totalAttend}회</p>
          </div>
        </section>

        <section aria-labelledby="my-record">
          <SectionHead id="my-record" title="나의 기록" />
          <div className={`${card} divide-y divide-[#EEEAE3]`}>
            <button type="button" onClick={() => setReportOpen(true)} className={`flex min-h-[60px] w-full items-center gap-3 px-4 text-left ${ring}`}>
              <TrendingUp size={20} className="text-[#2E5A4C]" aria-hidden />
              <span className="flex-1">
                <span className="block text-[15px] font-semibold text-[#22201C]">나의 변화 리포트</span>
                <span className="block text-[12px] text-[#6B665E]">월별 운동 횟수, 체형 체크 기록</span>
              </span>
              <ChevronRight size={18} className="text-[#9A948A]" aria-hidden />
            </button>
            {latestFeedback && (
              <button type="button" onClick={() => openFeedback(latestFeedback.ago)} className={`flex min-h-[60px] w-full items-center gap-3 px-4 text-left ${ring}`}>
                <MessageSquareText size={20} className="text-[#2E5A4C]" aria-hidden />
                <span className="flex-1">
                  <span className="block text-[15px] font-semibold text-[#22201C]">강사 피드백 노트</span>
                  <span className="block text-[12px] text-[#6B665E]">출석한 수업마다 강사가 남깁니다</span>
                </span>
                {unread.length > 0 && <span className="text-[12px] font-bold text-[#B5532F]">새 노트 {unread.length}</span>}
                <ChevronRight size={18} className="text-[#9A948A]" aria-hidden />
              </button>
            )}
          </div>
        </section>

        <section aria-labelledby="alarm-title">
          <h2 id="alarm-title" className="mb-3 flex items-center gap-1.5 text-[17px] font-bold text-[#22201C]">
            <Bell size={17} aria-hidden /> 알림 설정
          </h2>
          <div className={`${card} divide-y divide-[#EEEAE3] overflow-hidden`}>
            <Toggle label="수업 전날 알림" on={alarmClass} onChange={setAlarmClass} />
            <Toggle label="빈자리 자동 예약 알림" sub="대기 중인 수업이 예약되면 바로 알려 드립니다" on={alarmWait} onChange={setAlarmWait} />
            <Toggle label="공지사항 알림" on={alarmNotice} onChange={setAlarmNotice} />
          </div>
        </section>

        <section aria-labelledby="studio-title">
          <SectionHead id="studio-title" title="스튜디오 정보" />
          <div className={`${card} overflow-hidden`}>
            <Photo src={`${IMG}/mat.jpg`} alt="매트와 소도구가 놓인 B룸" pos="50% 55%" className="aspect-[21/9] w-full" />
            <dl className="divide-y divide-[#EEEAE3] text-[14px]">
              <div className="flex gap-3 px-4 py-3">
                <dt className="w-[64px] shrink-0 text-[#6B665E]">운영 시간</dt>
                <dd className="text-[#22201C]">
                  평일 07:00~22:00
                  <br />
                  주말 10:00~13:10
                </dd>
              </div>
              <div className="flex gap-3 px-4 py-3">
                <dt className="w-[64px] shrink-0 text-[#6B665E]">전화</dt>
                <dd className="inline-flex items-center gap-1 tabular-nums text-[#22201C]">
                  <Phone size={14} aria-hidden /> 02-***-4182
                </dd>
              </div>
              <div className="flex gap-3 px-4 py-3">
                <dt className="w-[64px] shrink-0 text-[#6B665E]">취소 규정</dt>
                <dd className="leading-[1.6] text-[#22201C]">수업 {CANCEL_HOURS}시간 전까지 취소하면 횟수가 돌아옵니다. 이후 취소와 결석은 1회 차감됩니다.</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    );
  })();

  return (
    <div className="min-h-screen bg-[#F6F4F0] text-[#22201C] md:bg-[#E8E4DD] md:py-6">
      <div className="mx-auto md:w-fit">
        <div className="relative flex min-h-screen flex-col bg-[#F6F4F0] md:h-[min(844px,calc(100dvh-88px))] md:min-h-[640px] md:w-[390px] md:overflow-hidden md:rounded-[48px] md:border-[10px] md:border-[#1D1C1A] md:shadow-[0_24px_60px_-20px_rgba(40,32,20,0.35)]">
          {/* 상태 표시줄(PC 휴대폰 틀에서만) */}
          <div className="hidden h-[44px] shrink-0 items-center justify-between bg-[#F6F4F0] px-7 text-[14px] font-semibold md:flex" aria-hidden>
            <span className="tabular-nums">9:41</span>
            <span className="flex items-center gap-1.5">
              <Signal size={15} />
              <Wifi size={15} />
              <BatteryFull size={20} />
            </span>
          </div>

          <div ref={scrollRef} className="flex-1 pb-[76px] md:overflow-y-auto md:pb-0 md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden">
            <header className="sticky top-0 z-20 flex h-[56px] items-center bg-[#F6F4F0] px-4">
              <h1 className="text-[20px] font-bold text-[#22201C]">{title[tab]}</h1>
            </header>
            {screen}
          </div>

          <nav aria-label="주요 메뉴" className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E7E2DA] bg-white pb-[env(safe-area-inset-bottom)] md:static md:pb-0">
            <ul className="grid grid-cols-5">
              {tabs.map(({ id, label, Icon }) => {
                const active = tab === id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => go(id)}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex h-[60px] w-full flex-col items-center justify-center gap-1 text-[12px] ${ring} ${active ? "font-bold text-[#2E5A4C]" : "text-[#8A847A]"}`}
                    >
                      <Icon size={22} strokeWidth={active ? 2.4 : 1.8} aria-hidden />
                      {label}
                      {id === "my" && unread.length > 0 && <span className="absolute right-[calc(50%-16px)] top-2.5 h-2 w-2 rounded-full bg-[#B5532F]" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="hidden h-[22px] items-center justify-center md:flex" aria-hidden>
              <span className="h-[5px] w-[120px] rounded-full bg-[#1D1C1A]" />
            </div>
          </nav>

          {/* 수업 상세 */}
          <Sheet open={detail !== null} onClose={() => setDetailId(null)} labelId="detail-title" flush>
            {detail &&
              (() => {
                const mine = myBooking(detail.id);
                const full = detail.booked >= detail.cap;
                const ended = isEnded(detail);
                const t = TEACHERS[detail.teacher];
                return (
                  <div>
                    <div className="relative -mx-5">
                      <Photo src={KIND[detail.kind].photo} alt={`${detail.name} 수업 공간`} pos={KIND[detail.kind].pos} className="aspect-[16/9] w-full" />
                      <CloseOnPhoto onClose={() => setDetailId(null)} />
                    </div>
                    <p className="mt-5 text-[14px] font-semibold text-[#2E5A4C]">
                      {fmtKo(detail.date)} {detail.time}~{endTime(detail.time, detail.dur)}
                    </p>
                    <h2 id="detail-title" className="mt-1 text-[22px] font-bold text-[#22201C]">
                      {detail.name}
                    </h2>
                    <dl className="mt-4 grid grid-cols-3 gap-2 rounded-[10px] bg-[#F6F4F0] p-4 text-[14px]">
                      <div>
                        <dt className="text-[12px] text-[#6B665E]">장소</dt>
                        <dd className="font-semibold">{detail.room}</dd>
                      </div>
                      <div>
                        <dt className="text-[12px] text-[#6B665E]">난이도</dt>
                        <dd className="font-semibold">{detail.level}</dd>
                      </div>
                      <div>
                        <dt className="text-[12px] text-[#6B665E]">정원</dt>
                        <dd className="inline-flex items-center gap-1 font-semibold tabular-nums">
                          <Users size={14} aria-hidden /> {Math.min(detail.booked, detail.cap)}/{detail.cap}명
                        </dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      onClick={() => {
                        setDetailId(null);
                        setTeacherOpen(detail.teacher);
                      }}
                      className={`mt-3 flex min-h-[64px] w-full items-center gap-3 rounded-[10px] border border-[#ECE7DF] px-3 py-2 text-left ${ring}`}
                    >
                      <Avatar name={detail.teacher} size={44} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-bold text-[#22201C]">
                          {detail.teacher} <span className="text-[13px] font-medium text-[#6B665E]">{t.role}</span>
                        </span>
                        <span className="block truncate text-[13px] text-[#6B665E]">{t.career[0]}</span>
                      </span>
                      <ChevronRight size={18} className="text-[#9A948A]" aria-hidden />
                    </button>
                    <p className="mt-4 text-[15px] leading-[1.65] text-[#4E4A43]">{detail.desc}</p>
                    <p className="mt-2 text-[13px] text-[#6B665E]">준비물: 미끄럼 방지 양말, 수업 10분 전 입실</p>
                    <p className="mt-1 text-[13px] text-[#6B665E]">수업 {CANCEL_HOURS}시간 전까지 취소할 수 있습니다.</p>

                    <div className="mt-5">
                      {mine ? (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setDetailId(null)} className={`min-h-[52px] flex-1 rounded-[10px] border border-[#D6D1C8] text-[15px] font-semibold text-[#4E4A43] ${ring}`}>
                            닫기
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDetailId(null);
                              setCancelId(detail.id);
                            }}
                            className={`min-h-[52px] flex-1 rounded-[10px] bg-[#22201C] text-[15px] font-semibold text-white ${ring}`}
                          >
                            {mine.status === "대기" ? "대기 취소" : "예약 취소"}
                          </button>
                        </div>
                      ) : ended ? (
                        <button type="button" disabled className="min-h-[52px] w-full rounded-[10px] bg-[#ECE8E1] text-[15px] font-semibold text-[#9A948A]">
                          종료된 수업입니다
                        </button>
                      ) : !full && remaining <= 0 ? (
                        <button type="button" disabled className="min-h-[52px] w-full rounded-[10px] bg-[#ECE8E1] text-[15px] font-semibold text-[#9A948A]">
                          남은 횟수가 없습니다
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={bookDetail}
                            className={`min-h-[52px] w-full rounded-[10px] text-[16px] font-bold text-white ${ring} ${full ? "bg-[#7A5418] hover:bg-[#684714]" : "bg-[#2E5A4C] hover:bg-[#254a3e]"}`}
                          >
                            {full ? `대기 예약 (${detail.wait + 1}번째)` : "예약하기"}
                          </button>
                          <p className="mt-2 text-center text-[13px] text-[#6B665E]">
                            {full ? "빈자리가 나면 자동으로 예약되고 그때 1회 차감됩니다." : `예약하면 회원권 1회가 차감됩니다. 남은 횟수 ${remaining}회`}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
          </Sheet>

          {/* 예약 완료 */}
          <Sheet open={done !== null} onClose={() => setDoneId(null)} labelId="done-title">
            {done && (
              <div className="text-center">
                <CircleCheck size={44} className="mx-auto mt-2 text-[#2E5A4C]" aria-hidden />
                <h2 id="done-title" className="mt-3 text-[20px] font-bold">
                  {doneBooking?.status === "대기" ? `대기 ${doneBooking.waitNo}번으로 등록되었습니다` : "예약이 완료되었습니다"}
                </h2>
                <div className="mt-4 flex items-center gap-3 rounded-[10px] bg-[#F6F4F0] p-3 text-left text-[14px]">
                  <Photo src={KIND[done.kind].photo} alt="" pos={KIND[done.kind].pos} className="h-[60px] w-[60px] shrink-0 rounded-[8px]" sizes="120px" />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#2E5A4C]">
                      {fmtKo(done.date)} {done.time}~{endTime(done.time, done.dur)}
                    </p>
                    <p className="truncate text-[16px] font-bold">{done.name}</p>
                    <p className="text-[#6B665E]">
                      {done.teacher} 강사, {done.room}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[14px] text-[#4E4A43]">{doneBooking?.status === "대기" ? "빈자리가 나면 자동으로 예약하고 알림을 보내 드립니다." : `회원권 남은 횟수 ${remaining}회`}</p>
                <div className="mt-5 flex gap-2">
                  <button type="button" onClick={() => setDoneId(null)} className={`min-h-[52px] flex-1 rounded-[10px] border border-[#D6D1C8] text-[15px] font-semibold text-[#4E4A43] ${ring}`}>
                    닫기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDoneId(null);
                      setMineView("upcoming");
                      go("mine");
                    }}
                    className={`min-h-[52px] flex-1 rounded-[10px] bg-[#2E5A4C] text-[15px] font-semibold text-white ${ring}`}
                  >
                    내 예약 보기
                  </button>
                </div>
              </div>
            )}
          </Sheet>

          {/* 취소 확인 */}
          <Sheet open={cancelTarget !== null} onClose={() => setCancelId(null)} labelId="cancel-title">
            {cancelTarget && cancelBooking && (
              <div>
                <h2 id="cancel-title" className="text-[20px] font-bold">
                  {cancelBooking.status === "대기" ? "대기를 취소할까요?" : "예약을 취소할까요?"}
                </h2>
                <div className="mt-4 rounded-[10px] bg-[#F6F4F0] p-4 text-[14px]">
                  <p className="font-semibold text-[#2E5A4C]">
                    {fmtKo(cancelTarget.date)} {cancelTarget.time}
                  </p>
                  <p className="mt-1 text-[16px] font-bold">{cancelTarget.name}</p>
                  <p className="mt-1 text-[#6B665E]">
                    {cancelTarget.teacher} 강사, {cancelTarget.room}
                  </p>
                </div>
                <p className="mt-3 text-[14px] leading-[1.6] text-[#4E4A43]">
                  {canCancel(cancelTarget)
                    ? cancelBooking.status === "대기"
                      ? "대기 순서가 사라집니다."
                      : `수업 ${CANCEL_HOURS}시간 전까지 취소할 수 있고, 취소하면 회원권 1회가 돌아옵니다.`
                    : `수업 ${CANCEL_HOURS}시간 전이 지나 앱에서 취소할 수 없습니다. 스튜디오로 연락해 주세요.`}
                </p>
                <div className="mt-5 flex gap-2">
                  <button type="button" onClick={() => setCancelId(null)} className={`min-h-[52px] flex-1 rounded-[10px] border border-[#D6D1C8] text-[15px] font-semibold text-[#4E4A43] ${ring}`}>
                    돌아가기
                  </button>
                  <button
                    type="button"
                    disabled={!canCancel(cancelTarget)}
                    onClick={() => cancel(cancelTarget.id)}
                    className={`min-h-[52px] flex-1 rounded-[10px] bg-[#93402B] text-[15px] font-semibold text-white disabled:bg-[#ECE8E1] disabled:text-[#9A948A] ${ring}`}
                  >
                    {cancelBooking.status === "대기" ? "대기 취소" : "예약 취소"}
                  </button>
                </div>
              </div>
            )}
          </Sheet>

          {/* 강사 소개 */}
          <Sheet open={teacherOpen !== null} onClose={() => setTeacherOpen(null)} labelId="teacher-sheet-title" flush>
            {teacherOpen &&
              (() => {
                const t = TEACHERS[teacherOpen];
                const slots = [...WEEKDAY.map((s) => ({ ...s, when: "평일" })), ...WEEKEND.map((s) => ({ ...s, when: "주말" }))].filter((s) => s.teacher === teacherOpen);
                return (
                  <div>
                    <div className="relative -mx-5">
                      <Photo src={t.photo} alt={`${teacherOpen} 강사`} pos={t.pos} className="aspect-[4/3] w-full" />
                      <CloseOnPhoto onClose={() => setTeacherOpen(null)} />
                    </div>
                    <p className="mt-5 text-[13px] font-semibold text-[#2E5A4C]">{t.role}</p>
                    <h2 id="teacher-sheet-title" className="text-[22px] font-bold text-[#22201C]">
                      {teacherOpen}
                    </h2>
                    <p className="mt-2 text-[15px] leading-[1.65] text-[#4E4A43]">{t.intro}</p>
                    <h3 className="mt-5 text-[15px] font-bold text-[#22201C]">경력</h3>
                    <ul className="mt-2 space-y-1.5 text-[14px] text-[#4E4A43]">
                      {t.career.map((c) => (
                        <li key={c} className="flex gap-2">
                          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#9A948A]" aria-hidden />
                          {c}
                        </li>
                      ))}
                    </ul>
                    <h3 className="mt-5 text-[15px] font-bold text-[#22201C]">담당 수업</h3>
                    <ul className="mt-2 divide-y divide-[#EEEAE3] rounded-[10px] border border-[#ECE7DF]">
                      {slots.map((s) => (
                        <li key={`${s.when}-${s.time}`} className="flex min-h-[48px] items-center justify-between gap-3 px-3 text-[14px]">
                          <span className="font-semibold text-[#22201C]">{s.name}</span>
                          <span className="tabular-nums text-[#6B665E]">
                            {s.when} {s.time}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        const k = slots[0]?.kind ?? "all";
                        setTeacherOpen(null);
                        openKind(k);
                      }}
                      className={`mt-5 min-h-[52px] w-full rounded-[10px] bg-[#2E5A4C] text-[15px] font-bold text-white ${ring}`}
                    >
                      {teacherOpen} 강사 수업 예약하기
                    </button>
                  </div>
                );
              })()}
          </Sheet>

          {/* 강사 피드백 노트 */}
          <Sheet open={fb !== null} onClose={() => setFeedbackOpen(null)} labelId="fb-title">
            {fb && fbPast && (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={fbPast.teacher} size={52} />
                    <div>
                      <p className="text-[13px] font-semibold text-[#2E5A4C]">강사 피드백 노트</p>
                      <h2 id="fb-title" className="text-[18px] font-bold text-[#22201C]">
                        {fbPast.teacher} 강사
                      </h2>
                      <p className="text-[13px] text-[#6B665E]">
                        {fmtKo(daysAgo(today, fbPast.ago))} {fbPast.time} {fbPast.name}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setFeedbackOpen(null)} aria-label="닫기" className={`-mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#6B665E] hover:bg-[#F1EEE9] ${ring}`}>
                    <X size={22} aria-hidden />
                  </button>
                </div>
                <h3 className="mt-5 text-[15px] font-bold text-[#22201C]">오늘 자세 포인트</h3>
                <p className="mt-2 rounded-[10px] bg-[#F6F4F0] p-4 text-[15px] leading-[1.7] text-[#33302B]">{fb.point}</p>
                <h3 className="mt-5 text-[15px] font-bold text-[#22201C]">동작 체크</h3>
                <ul className="mt-2 divide-y divide-[#EEEAE3] rounded-[10px] border border-[#ECE7DF]">
                  {fb.checks.map((c) => (
                    <li key={c.label} className="flex min-h-[48px] items-center justify-between gap-3 px-3 text-[14px]">
                      <span className="text-[#22201C]">{c.label}</span>
                      <span className={`inline-flex h-6 items-center rounded-[4px] px-2 text-[12px] font-semibold ${c.good ? "bg-[#E4EEE9] text-[#245044]" : "bg-[#F4EBDC] text-[#7A5418]"}`}>
                        {c.good ? "좋음" : "연습 필요"}
                      </span>
                    </li>
                  ))}
                </ul>
                <h3 className="mt-5 text-[15px] font-bold text-[#22201C]">다음 수업 추천</h3>
                <div className="mt-2 flex items-center gap-3 rounded-[10px] border border-[#ECE7DF] p-3">
                  <Photo src={KIND[fb.next].photo} alt="" pos={KIND[fb.next].pos} className="h-[64px] w-[64px] shrink-0 rounded-[8px]" sizes="128px" />
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-[#22201C]">{fb.nextName}</p>
                    <p className="text-[13px] leading-[1.55] text-[#6B665E]">{fb.nextWhy}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackOpen(null);
                    openKind(fb.next);
                  }}
                  className={`mt-4 min-h-[52px] w-full rounded-[10px] bg-[#2E5A4C] text-[15px] font-bold text-white ${ring}`}
                >
                  {fb.nextName} 시간표 보기
                </button>
              </div>
            )}
          </Sheet>

          {/* 나의 변화 리포트 */}
          <Sheet open={reportOpen} onClose={() => setReportOpen(false)} labelId="report-title" tall>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="report-title" className="text-[21px] font-bold text-[#22201C]">
                  나의 변화 리포트
                </h2>
                <p className="text-[13px] text-[#6B665E]">
                  김ㅎ늘 회원님, {monthLabels[0]}부터 {monthLabels[5]}까지
                </p>
              </div>
              <button type="button" onClick={() => setReportOpen(false)} aria-label="닫기" className={`-mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#6B665E] hover:bg-[#F1EEE9] ${ring}`}>
                <X size={22} aria-hidden />
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2">
              {[
                { k: "누적 출석", v: `${totalAttend}회` },
                { k: "연속 출석", v: "4주" },
                { k: "이번 달", v: `${thisMonth}회` },
              ].map((s) => (
                <div key={s.k} className="rounded-[10px] bg-[#F6F4F0] px-3 py-3">
                  <dt className="text-[12px] text-[#6B665E]">{s.k}</dt>
                  <dd className="mt-0.5 text-[20px] font-bold text-[#22201C]">{s.v}</dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-6 text-[15px] font-bold text-[#22201C]">월별 운동 횟수</h3>
            <div className="mt-3 rounded-[10px] border border-[#ECE7DF] p-4">
              <MonthChart labels={monthLabels} values={monthValues} />
              <p className="mt-2 text-[12px] text-[#8A847A]">이번 달은 예약 완료된 수업까지 포함합니다.</p>
            </div>
            <h3 className="mt-6 text-[15px] font-bold text-[#22201C]">체형 체크 기록</h3>
            <ol className="mt-3">
              {BODY_CHECKS.map((b, i) => (
                <li key={b.round} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < BODY_CHECKS.length - 1 && <span className="absolute left-[7px] top-5 h-[calc(100%-12px)] w-px bg-[#DAD5CC]" aria-hidden />}
                  <span className={`relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 ${i === 0 ? "border-[#2E5A4C] bg-[#2E5A4C]" : "border-[#BDB6AA] bg-white"}`} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold text-[#22201C]">
                      {b.round}회차 체크 <span className="font-normal text-[#6B665E]">{fmtKo(daysAgo(today, b.ago))}</span>
                    </p>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {b.items.map((it) => (
                        <li key={it} className="rounded-[4px] bg-[#F1EEE9] px-2 py-1 text-[12px] text-[#4E4A43]">
                          {it}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-[#6B665E]">{b.note}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex items-start gap-3 rounded-[10px] bg-[#EEF4F1] p-4">
              <Avatar name="이ㅅ연" size={40} />
              <p className="text-[14px] leading-[1.65] text-[#245044]">
                <strong className="block text-[13px]">이ㅅ연 대표 강사</strong>
                석 달 사이 앞으로 굽히기가 9cm 좋아졌습니다. 다음 체크는 한 달 뒤에 함께 해요.
              </p>
            </div>
          </Sheet>

          {/* 푸시 알림 */}
          <AnimatePresence>
            {push && (
              <motion.div
                key={push.key}
                role="status"
                className="fixed inset-x-3 top-3 z-[70] md:absolute md:top-[50px]"
                initial={reduce ? { opacity: 0 } : { y: -96, opacity: 0 }}
                animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { y: -96, opacity: 0 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
              >
                <div className="flex items-start gap-1 rounded-[14px] bg-white/95 shadow-[0_8px_28px_-8px_rgba(30,24,16,0.35)] ring-1 ring-black/5 backdrop-blur">
                  <button
                    type="button"
                    onClick={() => {
                      setPush(null);
                      setMineView("upcoming");
                      go(push.tab);
                    }}
                    className={`flex min-h-[64px] min-w-0 flex-1 items-start gap-3 rounded-[14px] py-3 pl-3 text-left ${ring}`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-[#2E5A4C] text-white" aria-hidden>
                      <CalendarCheck size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-[12px] text-[#6B665E]">
                        필라테스 스튜디오 <span className="text-[#9A948A]">지금</span>
                      </span>
                      <span className="mt-0.5 block text-[14px] leading-snug text-[#22201C]">{push.text}</span>
                    </span>
                  </button>
                  <button type="button" aria-label="알림 닫기" onClick={() => setPush(null)} className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#9A948A] ${ring}`}>
                    <X size={18} aria-hidden />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="px-4 pb-[96px] text-center text-[#6B665E] md:pb-0">
        <DemoMakerInfo className="mt-6" />
      </div>
    </div>
  );
}
