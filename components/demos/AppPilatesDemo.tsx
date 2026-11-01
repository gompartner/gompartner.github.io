"use client";

// 필라테스 스튜디오 회원 앱 카탈로그(11-01). 수업 예약, 대기 예약, 예약 취소, 회원권 차감과 복원이 실제로 움직인다.
// PC에서는 휴대폰 틀 안에, 휴대폰에서는 화면 전체로 보인다.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  House,
  MapPin,
  Phone,
  Signal,
  Ticket,
  UserRound,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";
import { daysAgo, fmtKo, fmtMD, useDemoToday } from "@/hooks/useDemoToday";

type Tab = "home" | "book" | "mine" | "pass" | "my";

type Slot = { time: string; dur: number; name: string; teacher: string; room: string; level: string; cap: number; desc: string };

type ClassItem = Slot & { id: string; off: number; date: Date; booked: number; wait: number };

type Booking = { id: string; status: "예약 완료" | "대기"; waitNo?: number };

type HistoryRow = { key: string; date: Date; name: string; time: string; status: "예약 완료" | "취소" | "출석" | "결석"; delta: number };

const TOTAL = 10;
const CANCEL_HOURS = 4;

const WEEKDAY: Slot[] = [
  { time: "07:00", dur: 50, name: "그룹 리포머 초급", teacher: "이ㅅ연", room: "A룸", level: "초급", cap: 6, desc: "리포머가 처음인 분을 위한 수업입니다. 기구 사용법과 호흡부터 천천히 진행합니다." },
  { time: "10:00", dur: 50, name: "그룹 리포머", teacher: "박ㅈ우", room: "A룸", level: "초중급", cap: 6, desc: "코어와 하체 위주로 진행하는 기본 리포머 수업입니다. 스프링 강도는 개인별로 조절합니다." },
  { time: "12:20", dur: 50, name: "체어 바렐", teacher: "최ㅇ진", room: "B룸", level: "중급", cap: 4, desc: "체어와 바렐로 척추 가동성과 균형을 다룹니다. 리포머 수업 10회 이상 경험을 권장합니다." },
  { time: "19:00", dur: 50, name: "그룹 리포머", teacher: "정ㅎ린", room: "A룸", level: "초중급", cap: 6, desc: "코어와 하체 위주로 진행하는 기본 리포머 수업입니다. 스프링 강도는 개인별로 조절합니다." },
  { time: "20:10", dur: 50, name: "매트 필라테스", teacher: "이ㅅ연", room: "B룸", level: "초급", cap: 8, desc: "매트에서 진행하는 기본 동작 수업입니다. 소도구로 강도를 조절합니다." },
  { time: "21:20", dur: 40, name: "스트레칭 리포머", teacher: "박ㅈ우", room: "A룸", level: "초급", cap: 6, desc: "하루를 마무리하는 이완 위주 수업입니다. 어깨와 고관절을 중심으로 풀어 줍니다." },
];

const WEEKEND: Slot[] = [
  { time: "10:00", dur: 50, name: "그룹 리포머", teacher: "정ㅎ린", room: "A룸", level: "초중급", cap: 6, desc: "코어와 하체 위주로 진행하는 기본 리포머 수업입니다. 스프링 강도는 개인별로 조절합니다." },
  { time: "11:10", dur: 50, name: "소도구 매트", teacher: "최ㅇ진", room: "B룸", level: "초급", cap: 8, desc: "링, 볼, 밴드를 활용하는 매트 수업입니다. 처음 오시는 분도 따라 하기 쉽습니다." },
  { time: "12:20", dur: 50, name: "체어 바렐", teacher: "최ㅇ진", room: "B룸", level: "중급", cap: 4, desc: "체어와 바렐로 척추 가동성과 균형을 다룹니다. 리포머 수업 10회 이상 경험을 권장합니다." },
];

const NOTICES = [
  { title: "11월 정기 휴무 안내", ago: 1, body: "셋째 주 월요일은 기구 점검으로 수업이 없습니다. 해당 날짜 예약은 열리지 않습니다." },
  { title: "주말 체어 바렐 수업이 열렸습니다", ago: 4, body: "토요일과 일요일 12:20에 체어 바렐 수업을 진행합니다. 정원은 4명입니다." },
  { title: "주차 등록 방법 변경", ago: 9, body: "건물 주차는 데스크에서 차량 번호를 말씀해 주시면 2시간 무료로 등록해 드립니다." },
];

const PAST = [
  { ago: 2, time: "10:00", name: "그룹 리포머", teacher: "정ㅎ린", status: "출석" as const },
  { ago: 5, time: "10:00", name: "그룹 리포머", teacher: "박ㅈ우", status: "결석" as const },
  { ago: 8, time: "10:00", name: "그룹 리포머", teacher: "박ㅈ우", status: "출석" as const },
];

const FIRST_BOOKING = "d1-10:00";
const FIRST_WAIT = "d2-10:00";

const slotsFor = (date: Date) => (date.getDay() === 0 || date.getDay() === 6 ? WEEKEND : WEEKDAY);

// 정해진 규칙으로 예약 인원을 만든다(새로 고쳐도 같은 숫자).
const baseBooked = (off: number, idx: number, cap: number, id: string) => {
  if (id === FIRST_WAIT) return cap;
  return Math.min(cap, (off * 5 + idx * 3 + 2) % 8);
};

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

function Sheet({ open, onClose, labelId, children }: { open: boolean; onClose: () => void; labelId: string; children: ReactNode }) {
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
        <div className="fixed inset-0 z-40 md:absolute">
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
            className="absolute inset-x-0 bottom-0 max-h-[88%] overflow-y-auto rounded-t-[12px] bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 outline-none"
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 40 }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#DAD5CC]" aria-hidden />
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`flex min-h-[52px] w-full items-center justify-between gap-3 px-4 text-left text-[15px] text-[#22201C] ${ring}`}
    >
      <span>{label}</span>
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
          className={`min-h-[44px] flex-1 rounded-[6px] text-[14px] font-semibold transition-colors ${ring} ${
            value === it.id ? "bg-white text-[#22201C] shadow-sm" : "text-[#6B665E]"
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

export function AppPilatesDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<Tab>("home");
  const [dayPick, setDayOff] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [seatDelta, setSeatDelta] = useState<Record<string, number>>({ [FIRST_BOOKING]: 1 });
  const [waitDelta, setWaitDelta] = useState<Record<string, number>>({ [FIRST_WAIT]: 1 });
  const [bookings, setBookings] = useState<Booking[]>([
    { id: FIRST_BOOKING, status: "예약 완료" },
    { id: FIRST_WAIT, status: "대기", waitNo: 2 },
  ]);
  const [cancelled, setCancelled] = useState<{ id: string; at: number }[]>([]);
  const [usage, setUsage] = useState<{ key: string; id: string; status: "예약 완료" | "취소"; delta: number }[]>([
    { key: "u0", id: FIRST_BOOKING, status: "예약 완료", delta: -1 },
  ]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [mineView, setMineView] = useState<"upcoming" | "past">("upcoming");
  const [passView, setPassView] = useState<"all" | "use" | "back">("all");
  const [push, setPush] = useState(false);
  const [alarmClass, setAlarmClass] = useState(true);
  const [alarmWait, setAlarmWait] = useState(true);
  const [alarmNotice, setAlarmNotice] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seq = useRef(1);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setNowMs(new Date().getTime()));
    const show = window.setTimeout(() => setPush(true), 1400);
    const hide = window.setTimeout(() => setPush(false), 7400);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

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
    return { ...s, id, off, date, booked: baseBooked(off, idx, s.cap, id) + (seatDelta[id] ?? 0), wait: (id === FIRST_WAIT ? 1 : 0) + (waitDelta[id] ?? 0) };
  };

  const dayClasses = (off: number) => {
    const date = daysAgo(today, -off);
    return slotsFor(date)
      .map((s) => findClass(`d${off}-${s.time}`))
      .filter((c): c is ClassItem => c !== null);
  };

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

  const go = (t: Tab) => {
    setTab(t);
    scrollRef.current?.scrollTo({ top: 0 });
    if (typeof window !== "undefined" && window.innerWidth < 768) window.scrollTo({ top: 0 });
  };

  const book = (c: ClassItem) => {
    if (myBooking(c.id)) return;
    const full = c.booked >= c.cap;
    if (full) {
      setWaitDelta((d) => ({ ...d, [c.id]: (d[c.id] ?? 0) + 1 }));
      setBookings((b) => [...b, { id: c.id, status: "대기", waitNo: c.wait + 1 }]);
    } else {
      if (remaining <= 0) return;
      setSeatDelta((d) => ({ ...d, [c.id]: (d[c.id] ?? 0) + 1 }));
      setBookings((b) => [...b, { id: c.id, status: "예약 완료" }]);
      setUsage((u) => [...u, { key: `u${seq.current++}`, id: c.id, status: "예약 완료", delta: -1 }]);
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
      setUsage((u) => [...u, { key: `u${seq.current++}`, id, status: "취소", delta: 1 }]);
    } else {
      setWaitDelta((d) => ({ ...d, [id]: (d[id] ?? 0) - 1 }));
    }
    setBookings((all) => all.filter((x) => x.id !== id));
    setCancelled((x) => [...x.filter((y) => y.id !== id), { id, at: seq.current++ }]);
    setCancelId(null);
  };

  const detail = detailId ? findClass(detailId) : null;
  const done = doneId ? findClass(doneId) : null;
  const doneBooking = doneId ? myBooking(doneId) : undefined;
  const cancelTarget = cancelId ? findClass(cancelId) : null;
  const cancelBooking = cancelId ? myBooking(cancelId) : undefined;
  const firstBooked = findClass(FIRST_BOOKING);

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

  const classRow = (c: ClassItem) => {
    const mine = myBooking(c.id);
    const seat = seatText(c);
    const ended = isEnded(c);
    return (
      <li key={c.id}>
        <button
          type="button"
          onClick={() => setDetailId(c.id)}
          className={`flex min-h-[76px] w-full items-center gap-4 rounded-[10px] border bg-white px-4 py-3 text-left transition-colors hover:border-[#C9C2B6] ${ring} ${
            mine ? "border-[#2E5A4C]" : "border-[#E7E2DA]"
          } ${ended ? "opacity-60" : ""}`}
        >
          <span className="w-[52px] shrink-0">
            <span className="block text-[17px] font-bold tabular-nums text-[#22201C]">{c.time}</span>
            <span className="block text-[13px] text-[#6B665E]">{c.dur}분</span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[16px] font-semibold text-[#22201C]">{c.name}</span>
            <span className="mt-0.5 block truncate text-[13px] text-[#6B665E]">
              {c.teacher} 강사, {c.room}, {c.level}
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-end gap-1">
            {mine ? <Badge>{mine.status}</Badge> : <span className={`text-[13px] font-semibold ${seat.tone}`}>{seat.text}</span>}
            <span className="text-[12px] tabular-nums text-[#9A948A]">
              {Math.min(c.booked, c.cap)}/{c.cap}명
            </span>
          </span>
        </button>
      </li>
    );
  };


  const screen = (() => {
    if (tab === "home") {
      return (
        <div className="space-y-5 px-4 pb-6 pt-2">
          <p className="text-[15px] text-[#6B665E]">
            <span className="font-semibold text-[#22201C]">김ㅎ늘</span> 회원님, 오늘도 좋은 하루 보내세요.
          </p>

          <section aria-labelledby="next-title" className="rounded-[12px] bg-[#2E5A4C] p-5 text-white">
            <h2 id="next-title" className="text-[13px] font-semibold text-[#CFE0D8]">
              다음 수업
            </h2>
            {nextClass ? (
              <>
                <p className="mt-2 text-[22px] font-bold leading-snug">
                  {dayWord(nextClass.c.off, nextClass.c.date)} {nextClass.c.time}
                </p>
                <p className="mt-1 text-[17px] font-semibold">{nextClass.c.name}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-[#DCE8E2]">
                  <span className="inline-flex items-center gap-1">
                    <UserRound size={15} aria-hidden /> {nextClass.c.teacher} 강사
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={15} aria-hidden /> {nextClass.c.room}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={15} aria-hidden /> {nextClass.c.time}~{endTime(nextClass.c.time, nextClass.c.dur)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => go("mine")}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-1 rounded-[6px] bg-white/15 px-4 text-[14px] font-semibold text-white hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  예약 내역 보기 <ChevronRight size={16} aria-hidden />
                </button>
              </>
            ) : (
              <p className="mt-2 text-[17px] font-semibold">예정된 수업이 없습니다.</p>
            )}
          </section>

          <button
            type="button"
            onClick={() => go("book")}
            className={`flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#2E5A4C] bg-white text-[16px] font-bold text-[#2E5A4C] hover:bg-[#F1F6F3] ${ring}`}
          >
            <CalendarPlus size={20} aria-hidden /> 수업 예약하기
          </button>

          <section aria-labelledby="pass-mini" className="rounded-[12px] border border-[#E7E2DA] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 id="pass-mini" className="text-[15px] font-semibold text-[#22201C]">
                그룹 리포머 10회권
              </h2>
              <button type="button" onClick={() => go("pass")} className={`-mr-2 inline-flex min-h-[44px] items-center px-2 text-[13px] text-[#6B665E] ${ring}`}>
                자세히 <ChevronRight size={15} aria-hidden />
              </button>
            </div>
            <p className="text-[24px] font-bold text-[#22201C]">
              {remaining}회 <span className="text-[15px] font-medium text-[#6B665E]">남음</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ECE8E1]" aria-hidden>
              <div className="h-full rounded-full bg-[#2E5A4C] transition-[width] duration-300" style={{ width: `${(remaining / TOTAL) * 100}%` }} />
            </div>
            <p className="mt-2 text-[13px] text-[#6B665E]">유효기간 {fmtMD(passEnd)}까지</p>
          </section>

          <section aria-labelledby="notice-title">
            <h2 id="notice-title" className="mb-2 text-[15px] font-semibold text-[#22201C]">
              공지사항
            </h2>
            <ul className="divide-y divide-[#EEEAE3] rounded-[12px] border border-[#E7E2DA] bg-white">
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
      const list = dayClasses(dayOff);
      const sel = days[dayOff].date;
      return (
        <div className="pb-6">
          <div className="sticky top-[56px] z-10 border-b border-[#E7E2DA] bg-[#F6F4F0] px-4 pb-3 pt-1">
            <p className="mb-2 text-[13px] font-semibold text-[#6B665E]">{sel.getFullYear()}년 {sel.getMonth() + 1}월</p>
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
          </div>
          <div className="px-4 pt-4">
            <p className="mb-3 text-[14px] text-[#6B665E]">
              {fmtKo(sel)}, 수업 {list.length}개
            </p>
            <ul className="space-y-2">
              {list.map((c) => classRow(c))}
            </ul>
            <p className="mt-4 text-[13px] leading-[1.6] text-[#6B665E]">예약은 7일 전부터 열리고, 수업 {CANCEL_HOURS}시간 전까지 취소할 수 있습니다.</p>
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
          .map((c) => ({ key: `c-${c.id}`, date: c.date, time: c.time, name: c.name, teacher: c.teacher, status: "취소" as const })),
        ...PAST.map((p) => ({ key: `p${p.ago}`, date: daysAgo(today, p.ago), time: p.time, name: p.name, teacher: p.teacher, status: p.status })),
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
              <div className="rounded-[12px] border border-[#E7E2DA] bg-white px-5 py-8 text-center">
                <p className="text-[15px] text-[#4E4A43]">예정된 수업이 없습니다.</p>
                <button type="button" onClick={() => go("book")} className={`mt-4 min-h-[44px] rounded-[6px] bg-[#2E5A4C] px-5 text-[15px] font-semibold text-white ${ring}`}>
                  수업 예약하기
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {upcoming.map(({ b, c }) => (
                  <li key={c.id} className="rounded-[12px] border border-[#E7E2DA] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-[#2E5A4C]">
                          {fmtKo(c.date)} {c.time}
                        </p>
                        <p className="mt-1 text-[17px] font-bold text-[#22201C]">{c.name}</p>
                        <p className="mt-1 text-[13px] text-[#6B665E]">
                          {c.teacher} 강사, {c.room}, {c.time}~{endTime(c.time, c.dur)}
                        </p>
                      </div>
                      <Badge>{b.status}</Badge>
                    </div>
                    {b.status === "대기" && <p className="mt-3 rounded-[6px] bg-[#F7F2E9] px-3 py-2 text-[13px] text-[#6B4A16]">대기 {b.waitNo}번, 자리가 나면 순서대로 예약 완료로 바뀌고 알림을 보내 드립니다.</p>}
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#EEEAE3] pt-3">
                      <span className="text-[12px] text-[#9A948A]">{canCancel(c) ? `${CANCEL_HOURS}시간 전까지 취소 가능` : "취소 가능 시간 지남"}</span>
                      <button
                        type="button"
                        onClick={() => setCancelId(c.id)}
                        className={`min-h-[44px] rounded-[6px] border border-[#D6D1C8] px-4 text-[14px] font-semibold text-[#4E4A43] hover:bg-[#F6F4F0] ${ring}`}
                      >
                        {b.status === "대기" ? "대기 취소" : "예약 취소"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <ul className="divide-y divide-[#EEEAE3] rounded-[12px] border border-[#E7E2DA] bg-white">
              {pastRows.map((r) => (
                <li key={r.key} className="flex min-h-[64px] items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-[#22201C]">{r.name}</span>
                    <span className="block text-[13px] text-[#6B665E]">
                      {fmtKo(r.date)} {r.time}, {r.teacher} 강사
                    </span>
                  </span>
                  <Badge>{r.status}</Badge>
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
        <div className="space-y-5 px-4 pb-6 pt-2">
          <section aria-labelledby="pass-title" className="rounded-[12px] border border-[#E7E2DA] bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] text-[#6B665E]">이용 중인 회원권</p>
                <h2 id="pass-title" className="mt-1 text-[18px] font-bold text-[#22201C]">
                  그룹 리포머 10회권
                </h2>
              </div>
              <span className="rounded-[4px] bg-[#E4EEE9] px-2 py-1 text-[12px] font-semibold text-[#245044]">D-{dLeft}</span>
            </div>
            <p className="mt-4 text-[15px] text-[#4E4A43]">
              {TOTAL}회 중 <strong className="text-[28px] font-bold text-[#22201C]">{remaining}회</strong> 남음
            </p>
            <div
              className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#ECE8E1]"
              role="progressbar"
              aria-label="남은 횟수"
              aria-valuemin={0}
              aria-valuemax={TOTAL}
              aria-valuenow={remaining}
            >
              <div className="h-full rounded-full bg-[#2E5A4C] transition-[width] duration-300" style={{ width: `${(remaining / TOTAL) * 100}%` }} />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-[#EEEAE3] pt-4 text-center">
              <div>
                <dt className="text-[12px] text-[#6B665E]">사용</dt>
                <dd className="text-[17px] font-bold text-[#22201C]">{used - reserved}회</dd>
              </div>
              <div>
                <dt className="text-[12px] text-[#6B665E]">예약 중</dt>
                <dd className="text-[17px] font-bold text-[#22201C]">{reserved}회</dd>
              </div>
              <div>
                <dt className="text-[12px] text-[#6B665E]">남음</dt>
                <dd className="text-[17px] font-bold text-[#2E5A4C]">{remaining}회</dd>
              </div>
            </dl>
            <p className="mt-4 rounded-[6px] bg-[#F6F4F0] px-3 py-2 text-[13px] text-[#4E4A43]">
              유효기간 {fmtKo(passStart)} ~ {fmtKo(passEnd)}
            </p>
          </section>

          <section aria-labelledby="usage-title">
            <h2 id="usage-title" className="mb-2 text-[15px] font-semibold text-[#22201C]">
              사용 내역
            </h2>
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
              <p className="mt-3 rounded-[12px] border border-[#E7E2DA] bg-white px-4 py-6 text-center text-[14px] text-[#6B665E]">복원된 내역이 없습니다.</p>
            ) : (
              <ul className="mt-3 divide-y divide-[#EEEAE3] rounded-[12px] border border-[#E7E2DA] bg-white">
                {historyShown.map((h) => (
                  <li key={h.key} className="flex min-h-[64px] items-center gap-3 px-4 py-3">
                    <span className="w-[44px] shrink-0 text-[13px] tabular-nums text-[#6B665E]">{fmtMD(h.date)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] text-[#22201C]">{h.name}</span>
                      <span className="mt-0.5 flex items-center gap-2 text-[12px] text-[#6B665E]">
                        {h.time} 수업 <Badge>{h.status}</Badge>
                      </span>
                    </span>
                    <span className={`shrink-0 text-[15px] font-bold tabular-nums ${h.delta > 0 ? "text-[#2E5A4C]" : "text-[#22201C]"}`}>
                      {h.delta > 0 ? "+1회" : "-1회"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      );
    }

    return (
      <div className="space-y-5 px-4 pb-6 pt-2">
        <section className="flex items-center gap-4 rounded-[12px] border border-[#E7E2DA] bg-white p-5">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#ECE8E1] text-[#6B665E]" aria-hidden>
            <UserRound size={28} />
          </span>
          <div className="min-w-0">
            <p className="text-[18px] font-bold text-[#22201C]">김ㅎ늘 회원님</p>
            <p className="text-[14px] tabular-nums text-[#6B665E]">010-****-5821</p>
            <p className="text-[13px] text-[#9A948A]">회원번호 20417</p>
          </div>
        </section>

        <section aria-labelledby="alarm-title">
          <h2 id="alarm-title" className="mb-2 flex items-center gap-1.5 text-[15px] font-semibold text-[#22201C]">
            <Bell size={16} aria-hidden /> 알림 설정
          </h2>
          <div className="divide-y divide-[#EEEAE3] overflow-hidden rounded-[12px] border border-[#E7E2DA] bg-white">
            <Toggle label="수업 전날 알림" on={alarmClass} onChange={setAlarmClass} />
            <Toggle label="대기 자리 알림" on={alarmWait} onChange={setAlarmWait} />
            <Toggle label="공지사항 알림" on={alarmNotice} onChange={setAlarmNotice} />
          </div>
        </section>

        <section aria-labelledby="studio-title">
          <h2 id="studio-title" className="mb-2 text-[15px] font-semibold text-[#22201C]">
            스튜디오 정보
          </h2>
          <dl className="divide-y divide-[#EEEAE3] rounded-[12px] border border-[#E7E2DA] bg-white text-[14px]">
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

          <div ref={scrollRef} className="flex-1 pb-[76px] md:overflow-y-auto md:pb-0">
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
                      className={`flex h-[60px] w-full flex-col items-center justify-center gap-1 text-[12px] ${ring} ${active ? "font-bold text-[#2E5A4C]" : "text-[#8A847A]"}`}
                    >
                      <Icon size={22} strokeWidth={active ? 2.4 : 1.8} aria-hidden />
                      {label}
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
          <Sheet open={detail !== null} onClose={() => setDetailId(null)} labelId="detail-title">
            {detail &&
              (() => {
                const mine = myBooking(detail.id);
                const full = detail.booked >= detail.cap;
                const ended = isEnded(detail);
                return (
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-semibold text-[#2E5A4C]">
                          {fmtKo(detail.date)} {detail.time}~{endTime(detail.time, detail.dur)}
                        </p>
                        <h2 id="detail-title" className="mt-1 text-[21px] font-bold text-[#22201C]">
                          {detail.name}
                        </h2>
                      </div>
                      <button type="button" onClick={() => setDetailId(null)} aria-label="닫기" className={`-mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#6B665E] hover:bg-[#F1EEE9] ${ring}`}>
                        <X size={22} aria-hidden />
                      </button>
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 rounded-[10px] bg-[#F6F4F0] p-4 text-[14px]">
                      <div>
                        <dt className="text-[12px] text-[#6B665E]">강사</dt>
                        <dd className="font-semibold">{detail.teacher}</dd>
                      </div>
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
                          <Users size={14} aria-hidden /> {Math.min(detail.booked, detail.cap)}/{detail.cap}명{full && detail.wait > 0 ? `, 대기 ${detail.wait}명` : ""}
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-4 text-[15px] leading-[1.6] text-[#4E4A43]">{detail.desc}</p>
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
                            onClick={() => book(detail)}
                            className={`min-h-[52px] w-full rounded-[10px] text-[16px] font-bold text-white ${ring} ${full ? "bg-[#7A5418] hover:bg-[#684714]" : "bg-[#2E5A4C] hover:bg-[#254a3e]"}`}
                          >
                            {full ? `대기 예약 (${detail.wait + 1}번째)` : "예약하기"}
                          </button>
                          <p className="mt-2 text-center text-[13px] text-[#6B665E]">{full ? "대기는 횟수가 차감되지 않습니다." : `예약하면 회원권 1회가 차감됩니다. 남은 횟수 ${remaining}회`}</p>
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
                <div className="mt-4 rounded-[10px] bg-[#F6F4F0] p-4 text-left text-[14px]">
                  <p className="font-semibold text-[#2E5A4C]">
                    {fmtKo(done.date)} {done.time}~{endTime(done.time, done.dur)}
                  </p>
                  <p className="mt-1 text-[16px] font-bold">{done.name}</p>
                  <p className="mt-1 text-[#6B665E]">
                    {done.teacher} 강사, {done.room}
                  </p>
                </div>
                <p className="mt-3 text-[14px] text-[#4E4A43]">
                  {doneBooking?.status === "대기" ? "자리가 나면 알림을 보내 드립니다." : `회원권 남은 횟수 ${remaining}회`}
                </p>
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

          {/* 푸시 알림(처음 한 번) */}
          <AnimatePresence>
            {push && firstBooked && myBooking(FIRST_BOOKING) && (
              <motion.div
                role="status"
                className="fixed inset-x-3 top-3 z-[70] md:absolute md:top-[50px]"
                initial={reduce ? { opacity: 0 } : { y: -96, opacity: 0 }}
                animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { y: -96, opacity: 0 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
              >
                <div className="flex items-start gap-1 rounded-[12px] bg-white/95 shadow-[0_8px_28px_-8px_rgba(30,24,16,0.35)] ring-1 ring-black/5 backdrop-blur">
                  <button
                    type="button"
                    onClick={() => {
                      setPush(false);
                      setMineView("upcoming");
                      go("mine");
                    }}
                    className={`flex min-h-[64px] min-w-0 flex-1 items-start gap-3 rounded-[12px] py-3 pl-3 text-left ${ring}`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-[#2E5A4C] text-white" aria-hidden>
                      <CalendarCheck size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-[12px] text-[#6B665E]">
                        필라테스 스튜디오 <span className="text-[#9A948A]">지금</span>
                      </span>
                      <span className="mt-0.5 block text-[14px] leading-snug text-[#22201C]">
                        [필라테스 스튜디오] {dayWord(firstBooked.off, firstBooked.date)} {firstBooked.time} {firstBooked.name} 수업이 있습니다
                      </span>
                    </span>
                  </button>
                  <button type="button" aria-label="알림 닫기" onClick={() => setPush(false)} className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#9A948A] ${ring}`}>
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
