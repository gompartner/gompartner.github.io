"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  Delete,
  GraduationCap,
  LogIn,
  LogOut,
  MessageSquareText,
  MonitorSmartphone,
  QrCode,
  ScanLine,
  Send,
  TabletSmartphone,
  X,
} from "lucide-react";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";
import { fmtKo, useDemoToday } from "@/hooks/useDemoToday";

// 학원 입구 출결 키오스크 카탈로그(11-01).
// 키오스크 화면은 450x800 설계 크기로 그리고, 화면 폭에 맞춰 transform으로 줄이거나 키운다.
// 시계는 15:52에서 시작해 실제 1초마다 흐른다(첫 렌더는 항상 같은 값이라 하이드레이션 불일치 없음).

const DESIGN_W = 450;
const DESIGN_H = 800;
const START_SEC = (15 * 60 + 52) * 60;

type ClassInfo = { id: string; name: string; start: number; end: number };
const CLASSES: ClassInfo[] = [
  { id: "A", name: "초등 5학년 A반", start: 16 * 60, end: 17 * 60 + 30 },
  { id: "B", name: "초등 6학년 B반", start: 15 * 60 + 30, end: 17 * 60 },
  { id: "C", name: "중등 1학년 C반", start: 14 * 60, end: 15 * 60 + 30 },
];
const classOf = (id: string) => CLASSES.find((c) => c.id === id)!;

type Student = { no: string; name: string; cls: string; phone: string; parent: string };
const STUDENTS: Student[] = [
  { no: "1021", name: "김ㅎ늘", cls: "A", phone: "3842", parent: "어머니" },
  { no: "1022", name: "이ㅈ민", cls: "A", phone: "5170", parent: "어머니" },
  { no: "1023", name: "박ㅅ우", cls: "A", phone: "2096", parent: "아버지" },
  { no: "1024", name: "최ㅇ서", cls: "A", phone: "7731", parent: "어머니" },
  { no: "1031", name: "정ㅁ준", cls: "B", phone: "4408", parent: "어머니" },
  { no: "1032", name: "강ㅎ윤", cls: "B", phone: "6612", parent: "아버지" },
  { no: "1033", name: "윤ㅅ아", cls: "B", phone: "9025", parent: "어머니" },
  { no: "1034", name: "조ㅇ진", cls: "B", phone: "1357", parent: "어머니" },
  { no: "2041", name: "한ㅈ우", cls: "C", phone: "8264", parent: "아버지" },
  { no: "2042", name: "오ㅅ빈", cls: "C", phone: "3519", parent: "어머니" },
  { no: "2043", name: "서ㅇ호", cls: "C", phone: "6087", parent: "어머니" },
  { no: "2044", name: "신ㅎ은", cls: "C", phone: "2748", parent: "어머니" },
];

type Rec = { status: "none" | "in" | "out"; inAt?: number; outAt?: number; late?: boolean; sentAt?: number; sentKind?: string };
const SEED: Record<string, Rec> = {
  "1021": { status: "none" },
  "1022": { status: "in", inAt: 15 * 60 + 41, sentAt: 15 * 60 + 41, sentKind: "등원 알림 발송" },
  "1023": { status: "in", inAt: 15 * 60 + 47, sentAt: 15 * 60 + 47, sentKind: "등원 알림 발송" },
  "1024": { status: "none" },
  "1031": { status: "in", inAt: 15 * 60 + 22, sentAt: 15 * 60 + 22, sentKind: "등원 알림 발송" },
  "1032": { status: "in", inAt: 15 * 60 + 38, late: true, sentAt: 15 * 60 + 38, sentKind: "등원 알림 발송" },
  "1033": { status: "none" },
  "1034": { status: "in", inAt: 15 * 60 + 26, sentAt: 15 * 60 + 26, sentKind: "등원 알림 발송" },
  "2041": { status: "out", inAt: 13 * 60 + 55, outAt: 15 * 60 + 34, sentAt: 15 * 60 + 34, sentKind: "하원 알림 발송" },
  "2042": { status: "out", inAt: 13 * 60 + 58, outAt: 15 * 60 + 36, sentAt: 15 * 60 + 36, sentKind: "하원 알림 발송" },
  "2043": { status: "in", inAt: 14 * 60 + 6, late: true, sentAt: 14 * 60 + 6, sentKind: "등원 알림 발송" },
  "2044": { status: "none" },
};
// QR 찍기를 누르면 이 순서로 학생증을 찍은 것으로 본다(등원 중이면 하원, 아니면 등원)
const QR_ORDER = ["2043", "1031", "1034", "1022", "1023", "1032", "1021", "1024", "1033", "2044"];

const p2 = (n: number) => String(n).padStart(2, "0");
const hm = (min: number) => `${p2(Math.floor(min / 60) % 24)}:${p2(min % 60)}`;
const maskPhone = (last4: string) => `010-****-${last4}`;

type Chip = "등원" | "지각" | "하원" | "미등원";
const chipOf = (r: Rec): Chip => (r.status === "out" ? "하원" : r.status === "in" ? (r.late ? "지각" : "등원") : "미등원");
const CHIP_CLS: Record<Chip, string> = {
  등원: "bg-[#e3f3eb] text-[#0a5c40] border-[#b9e0cc]",
  지각: "bg-[#fdf1e2] text-[#8a4300] border-[#f3d2a8]",
  하원: "bg-[#e7ecf4] text-[#1b3359] border-[#c5d0e2]",
  미등원: "bg-white text-[#4a5361] border-[#cfd4dc]",
};

const HINT = "오늘 미등원 학생 번호 1021, 1024, 1033";
const FOCUS = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f2b705] focus-visible:ring-offset-2";

type Mode = "in" | "out";
type Screen =
  | { kind: "idle" }
  | { kind: "pad"; mode: Mode }
  | { kind: "confirm"; mode: Mode; no: string }
  | { kind: "scan" }
  | { kind: "done"; mode: Mode; no: string; at: number; late: boolean };

function alimText(s: Student, mode: Mode, at: number) {
  const c = classOf(s.cls);
  if (mode === "in") return `[영어 학원] ${s.name} 학생이 ${hm(at)}에 등원했습니다. 오늘 수업은 ${c.name} ${hm(c.start)}~${hm(c.end)}입니다.`;
  return `[영어 학원] ${s.name} 학생이 ${hm(at)}에 하원했습니다. 귀가 여부를 확인해 주세요.`;
}

export function KioskAcademyDemo() {
  const today = useDemoToday();
  const [view, setView] = useState<"kiosk" | "admin">("kiosk");
  const [sec, setSec] = useState(START_SEC);
  const [recs, setRecs] = useState<Record<string, Rec>>(SEED);
  const [lastChanged, setLastChanged] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const nowMin = Math.floor(sec / 60);

  const apply = useCallback((no: string, mode: Mode, at: number) => {
    const s = STUDENTS.find((x) => x.no === no)!;
    const late = at > classOf(s.cls).start;
    setRecs((prev) => {
      const r = prev[no];
      const next: Rec =
        mode === "in"
          ? { status: "in", inAt: at, late, sentAt: at, sentKind: "등원 알림 발송" }
          : { ...r, status: "out", outAt: at, sentAt: at, sentKind: "하원 알림 발송" };
      return { ...prev, [no]: next };
    });
    setLastChanged(no);
    return late;
  }, []);

  const resend = useCallback((no: string, at: number) => {
    setRecs((prev) => {
      const r = prev[no];
      const kind = r.status === "none" ? "미등원 안내 발송" : `${r.status === "out" ? "하원" : "등원"} 알림 재발송`;
      return { ...prev, [no]: { ...r, sentAt: at, sentKind: kind } };
    });
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#e9ecf0] text-[#142340]">
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-8 pt-5 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <GraduationCap size={22} aria-hidden className="text-[#16294a]" />
              <span className="text-[17px] font-bold">영어 학원 출결</span>
            </div>
            {view === "kiosk" && <p className="hidden text-[14px] text-[#4a5568] md:block">{HINT}</p>}
            <div role="tablist" aria-label="화면 선택" className="inline-flex rounded-[10px] border border-[#cfd5de] bg-[#dfe3e9] p-1">
              {(
                [
                  ["kiosk", "키오스크 화면", TabletSmartphone],
                  ["admin", "관리자 화면", MonitorSmartphone],
                ] as const
              ).map(([id, label, Icon]) => {
                const on = view === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setView(id)}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-[8px] px-3.5 text-[15px] font-bold transition-colors ${FOCUS} ${
                      on ? "bg-white text-[#16294a] shadow-[0_1px_2px_rgba(20,35,64,0.18)]" : "text-[#4a5568] hover:text-[#16294a]"
                    }`}
                  >
                    <Icon size={17} aria-hidden />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={view === "kiosk" ? "" : "hidden"}>
            <KioskStage today={today} sec={sec} recs={recs} apply={apply} active={view === "kiosk"} />
          </div>
          {view === "admin" && <AdminPanel today={today} sec={sec} nowMin={nowMin} recs={recs} lastChanged={lastChanged} resend={resend} />}

          <DemoMakerInfo className="mt-6 text-center text-[#4a5568]" />
        </div>
      </div>
    </MotionConfig>
  );
}

/* ---------------- 키오스크 ---------------- */

function KioskStage(props: {
  today: Date;
  sec: number;
  recs: Record<string, Rec>;
  apply: (no: string, mode: Mode, at: number) => boolean;
  active: boolean;
}) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / DESIGN_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="mt-4 flex flex-col items-center md:mt-3">
      <p className="mb-3 text-center text-[14px] text-[#4a5568] md:hidden">{HINT}</p>
      <div
        className="flex w-full flex-col items-center md:w-auto"
        style={{ ["--kh" as string]: "clamp(600px, calc(100vh - 220px), 1000px)" }}
      >
        <div className="w-full md:w-auto md:rounded-[30px] md:bg-[#1d2128] md:p-[14px] md:shadow-[0_18px_40px_-18px_rgba(20,35,64,0.55)]">
          <div
            ref={screenRef}
            className="relative aspect-[9/16] w-full overflow-hidden rounded-[16px] border border-[#cfd5de] bg-white md:h-[var(--kh)] md:w-[calc(var(--kh)*9/16)] md:rounded-[14px] md:border-0"
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale ?? 1})`, visibility: scale ? "visible" : "hidden" }}
            >
              <Kiosk {...props} />
            </div>
          </div>
        </div>
        <div aria-hidden className="hidden h-7 w-14 bg-gradient-to-b from-[#a9b0bb] to-[#c3c9d2] md:block" />
        <div aria-hidden className="hidden h-3 w-52 rounded-full bg-[#b4bbc5] md:block" />
      </div>
    </div>
  );
}

function Kiosk({ today, sec, recs, apply, active }: { today: Date; sec: number; recs: Record<string, Rec>; apply: (no: string, mode: Mode, at: number) => boolean; active: boolean }) {
  const [screen, setScreen] = useState<Screen>({ kind: "idle" });
  const nowMin = Math.floor(sec / 60);
  const reduce = useReducedMotion();
  const recsRef = useRef(recs);
  const minRef = useRef(nowMin);
  useEffect(() => {
    recsRef.current = recs;
    minRef.current = nowMin;
  });

  const finish = useCallback(
    (no: string, mode: Mode) => {
      const at = minRef.current;
      const late = apply(no, mode, at);
      setScreen({ kind: "done", mode, no, at, late: mode === "in" && late });
    },
    [apply],
  );

  // QR: 찍는 순서대로 학생을 정하고, 1초 동안 읽는 화면을 보여 준 뒤 처리
  useEffect(() => {
    if (screen.kind !== "scan") return;
    const t = setTimeout(() => {
      const r = recsRef.current;
      const no = QR_ORDER.find((n) => r[n].status === "in") ?? QR_ORDER.find((n) => r[n].status === "none");
      if (!no) {
        setScreen({ kind: "idle" });
        return;
      }
      finish(no, r[no].status === "in" ? "out" : "in");
    }, 1100);
    return () => clearTimeout(t);
  }, [screen, finish]);

  const fade = reduce
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

  return (
    <div className="flex h-full flex-col bg-[#f6f7f9] text-[#142340]">
      <header className="flex h-[72px] shrink-0 items-center justify-between bg-[#16294a] px-6 text-white">
        <div className="flex items-center gap-2.5">
          <GraduationCap size={26} aria-hidden />
          <span className="text-[22px] font-bold">영어 학원</span>
        </div>
        <div className="text-right leading-tight">
          <div className="text-[15px] text-[#c9d3e3]">{fmtKo(today)}</div>
          <div className="text-[20px] font-bold tabular-nums">{hm(nowMin)}</div>
        </div>
      </header>
      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={screen.kind} {...fade} transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }} className="absolute inset-0 flex flex-col">
            {screen.kind === "idle" && (
              <Idle sec={sec} today={today} onMode={(mode) => setScreen({ kind: "pad", mode })} onQr={() => setScreen({ kind: "scan" })} />
            )}
            {screen.kind === "pad" && (
              <Pad
                mode={screen.mode}
                recs={recs}
                active={active}
                onBack={() => setScreen({ kind: "idle" })}
                onMatch={(no) => setScreen({ kind: "confirm", mode: screen.mode, no })}
              />
            )}
            {screen.kind === "confirm" && (
              <Confirm
                mode={screen.mode}
                no={screen.no}
                onRetry={() => setScreen({ kind: "pad", mode: screen.mode })}
                onOk={() => finish(screen.no, screen.mode)}
              />
            )}
            {screen.kind === "scan" && <Scan onCancel={() => setScreen({ kind: "idle" })} />}
            {screen.kind === "done" && <Done screen={screen} onHome={() => setScreen({ kind: "idle" })} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Idle({ sec, today, onMode, onQr }: { sec: number; today: Date; onMode: (m: Mode) => void; onQr: () => void }) {
  const h = Math.floor(sec / 3600) % 24;
  const m = Math.floor(sec / 60) % 60;
  return (
    <div className="flex h-full flex-col px-6 pb-6 pt-10">
      <div className="text-center">
        <div className="text-[19px] font-medium text-[#4a5568]">{fmtKo(today)}</div>
        <div className="mt-1 text-[84px] font-bold leading-none tracking-[-0.02em] tabular-nums" aria-label={`현재 시각 ${h}시 ${m}분`}>
          {p2(h)}:{p2(m)}
        </div>
        <p className="mt-4 text-[19px] text-[#2b3a55]">등원 또는 하원을 눌러 주세요</p>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onMode("in")}
          className={`flex h-[176px] flex-col items-center justify-center gap-3 rounded-[16px] bg-[#0d6e4c] text-white shadow-[0_2px_0_#09523a] active:translate-y-[1px] ${FOCUS}`}
        >
          <LogIn size={44} aria-hidden />
          <span className="text-[34px] font-bold">등원</span>
        </button>
        <button
          type="button"
          onClick={() => onMode("out")}
          className={`flex h-[176px] flex-col items-center justify-center gap-3 rounded-[16px] bg-[#16294a] text-white shadow-[0_2px_0_#0d1a31] active:translate-y-[1px] ${FOCUS}`}
        >
          <LogOut size={44} aria-hidden />
          <span className="text-[34px] font-bold">하원</span>
        </button>
      </div>
      <div className="mt-5 flex flex-col rounded-[16px] border border-[#d5dae2] bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-[12px] border-2 border-dashed border-[#9aa6b8] text-[#16294a]">
            <QrCode size={40} aria-hidden />
          </div>
          <div>
            <div className="text-[21px] font-bold">QR 코드를 카메라에 대 주세요</div>
            <div className="mt-1 text-[16px] text-[#4a5568]">학생증이나 학부모 앱의 QR 코드</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onQr}
          className={`mt-5 flex h-[72px] w-full items-center justify-center gap-2 rounded-[12px] border-2 border-[#16294a] text-[21px] font-bold text-[#16294a] active:bg-[#eef1f6] ${FOCUS}`}
        >
          <ScanLine size={26} aria-hidden />
          QR 찍기
        </button>
      </div>
      <p className="mt-auto text-center text-[15px] text-[#5a6577]">번호를 모르면 데스크 선생님께 말씀해 주세요</p>
    </div>
  );
}

function ModeTag({ mode }: { mode: Mode }) {
  return (
    <span
      className={`inline-flex h-9 items-center gap-1.5 rounded-[8px] px-3 text-[17px] font-bold text-white ${mode === "in" ? "bg-[#0d6e4c]" : "bg-[#16294a]"}`}
    >
      {mode === "in" ? <LogIn size={18} aria-hidden /> : <LogOut size={18} aria-hidden />}
      {mode === "in" ? "등원" : "하원"}
    </span>
  );
}

function BackButton({ onClick, label = "처음으로" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-16 items-center gap-1 rounded-[12px] pl-2 pr-4 text-[19px] font-bold text-[#2b3a55] active:bg-[#e7ebf1] ${FOCUS}`}
    >
      <ChevronLeft size={26} aria-hidden />
      {label}
    </button>
  );
}

function Pad({ mode, recs, active, onBack, onMatch }: { mode: Mode; recs: Record<string, Rec>; active: boolean; onBack: () => void; onMatch: (no: string) => void }) {
  const [digits, setDigits] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);

  const press = useCallback(
    (d: string) => {
      setError(null);
      if (digits.length >= 4) return;
      const next = digits + d;
      if (next.length < 4) {
        setDigits(next);
        return;
      }
      const s = STUDENTS.find((x) => x.no === next || x.phone === next);
      const r = s ? recs[s.no] : undefined;
      let msg: string | null = null;
      if (!s || !r) msg = "일치하는 학생이 없습니다. 번호를 다시 확인해 주세요.";
      else if (mode === "in" && r.status === "in") msg = `${s.name} 학생은 ${hm(r.inAt!)}에 이미 등원했습니다.`;
      else if (r.status === "out") msg = `${s.name} 학생은 ${hm(r.outAt!)}에 이미 하원했습니다.`;
      else if (mode === "out" && r.status === "none") msg = `${s.name} 학생은 오늘 등원 기록이 없습니다. 선생님께 말씀해 주세요.`;
      if (msg || !s) {
        setDigits("");
        setError(msg);
        setShake((k) => k + 1);
        return;
      }
      setDigits(next);
      onMatch(s.no);
    },
    [digits, mode, recs, onMatch],
  );
  const back = useCallback(() => {
    setError(null);
    setDigits((c) => c.slice(0, -1));
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, back, active]);

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];

  return (
    <div className="flex h-full flex-col px-6 pb-6 pt-3">
      <div className="flex items-center justify-between">
        <BackButton onClick={onBack} />
        <ModeTag mode={mode} />
      </div>
      <div className="mt-2 text-center">
        <h2 className="text-[26px] font-bold">학생 번호 4자리를 눌러 주세요</h2>
        <p className="mt-1 text-[17px] text-[#4a5568]">학부모 휴대폰 뒷자리 4자리도 됩니다</p>
      </div>
      <motion.div
        key={shake}
        animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : undefined}
        transition={{ duration: 0.36 }}
        className="mt-5 flex justify-center gap-3"
        aria-label={`입력한 번호 ${digits.length}자리`}
        role="status"
      >
        {[0, 1, 2, 3].map((i) => {
          const filled = i < digits.length;
          const current = i === digits.length;
          return (
            <div
              key={i}
              className={`grid h-[72px] w-[64px] place-items-center rounded-[12px] border-2 bg-white text-[36px] font-bold tabular-nums ${
                error ? "border-[#c2410c]" : current ? "border-[#16294a]" : filled ? "border-[#8e9bb0]" : "border-[#d5dae2]"
              }`}
            >
              {digits[i] ?? ""}
            </div>
          );
        })}
      </motion.div>
      <div className="mt-2 flex min-h-[52px] items-center justify-center px-2 text-center" aria-live="assertive">
        {error && <p className="text-[17px] font-medium leading-snug text-[#b23a0c]">{error}</p>}
      </div>
      <div className="mt-auto grid grid-cols-3 gap-2.5">
        {keys.map((k) => {
          if (k === "clear")
            return (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setDigits("");
                  setError(null);
                }}
                aria-label="전체 지우기"
                className={`h-[84px] rounded-[12px] bg-[#e4e8ee] text-[19px] font-bold text-[#2b3a55] active:bg-[#d3d9e2] ${FOCUS}`}
              >
                전체 지우기
              </button>
            );
          if (k === "back")
            return (
              <button
                key={k}
                type="button"
                onClick={back}
                aria-label="한 자리 지우기"
                className={`grid h-[84px] place-items-center rounded-[12px] bg-[#e4e8ee] text-[#2b3a55] active:bg-[#d3d9e2] ${FOCUS}`}
              >
                <Delete size={30} aria-hidden />
              </button>
            );
          return (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className={`h-[84px] rounded-[12px] border border-[#d5dae2] bg-white text-[34px] font-bold tabular-nums shadow-[0_1px_0_#cfd5de] active:bg-[#eef1f6] ${FOCUS}`}
            >
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Confirm({ mode, no, onRetry, onOk }: { mode: Mode; no: string; onRetry: () => void; onOk: () => void }) {
  const s = STUDENTS.find((x) => x.no === no)!;
  const c = classOf(s.cls);
  const word = mode === "in" ? "등원" : "하원";
  return (
    <div className="flex h-full flex-col px-6 pb-6 pt-3">
      <div className="flex items-center justify-between">
        <BackButton onClick={onRetry} label="다시 입력" />
        <ModeTag mode={mode} />
      </div>
      <h2 className="mt-4 text-center text-[26px] font-bold">{word}할 학생이 맞나요?</h2>
      <div className="mt-6 rounded-[16px] border border-[#d5dae2] bg-white p-6">
        <div className="flex items-center gap-5">
          <div className="grid h-[88px] w-[88px] shrink-0 place-items-center rounded-full bg-[#e7ecf4] text-[36px] font-bold text-[#16294a]" aria-hidden>
            {s.name[0]}
          </div>
          <div className="min-w-0">
            <div className="text-[34px] font-bold leading-tight">{s.name}</div>
            <div className="mt-1 text-[19px] text-[#2b3a55]">{c.name}</div>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 border-t border-[#e4e8ee] pt-5 text-[18px]">
          <dt className="text-[#5a6577]">학생 번호</dt>
          <dd className="font-bold tabular-nums">{s.no}</dd>
          <dt className="text-[#5a6577]">오늘 수업</dt>
          <dd className="font-bold tabular-nums">
            {hm(c.start)}~{hm(c.end)}
          </dd>
          <dt className="text-[#5a6577]">알림 받는 분</dt>
          <dd className="font-bold tabular-nums">
            {s.parent} {maskPhone(s.phone)}
          </dd>
        </dl>
      </div>
      <div className="mt-auto grid grid-cols-[1fr_1.4fr] gap-3">
        <button
          type="button"
          onClick={onRetry}
          className={`h-[84px] rounded-[14px] border-2 border-[#c3cad6] bg-white text-[21px] font-bold text-[#2b3a55] active:bg-[#eef1f6] ${FOCUS}`}
        >
          아니요
        </button>
        <button
          type="button"
          onClick={onOk}
          className={`h-[84px] rounded-[14px] text-[23px] font-bold text-white active:translate-y-[1px] ${mode === "in" ? "bg-[#0d6e4c]" : "bg-[#16294a]"} ${FOCUS}`}
        >
          네, {word}할게요
        </button>
      </div>
    </div>
  );
}

function Scan({ onCancel }: { onCancel: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-full flex-col items-center px-6 pb-6 pt-10">
      <div className="relative h-[260px] w-[260px] overflow-hidden rounded-[20px] bg-[#0f1b31]">
        {[
          "left-4 top-4 border-l-4 border-t-4 rounded-tl-[10px]",
          "right-4 top-4 border-r-4 border-t-4 rounded-tr-[10px]",
          "left-4 bottom-4 border-l-4 border-b-4 rounded-bl-[10px]",
          "right-4 bottom-4 border-r-4 border-b-4 rounded-br-[10px]",
        ].map((c) => (
          <span key={c} aria-hidden className={`absolute h-12 w-12 border-white ${c}`} />
        ))}
        <div className="absolute inset-0 grid place-items-center text-[#c9d3e3]">
          <QrCode size={96} aria-hidden strokeWidth={1.5} />
        </div>
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute left-6 right-6 h-[3px] rounded-full bg-[#3ccf8e]"
            initial={{ top: 28 }}
            animate={{ top: 228 }}
            transition={{ duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          />
        )}
      </div>
      <p className="mt-8 text-[24px] font-bold" role="status">
        QR 코드를 읽고 있습니다
      </p>
      <p className="mt-2 text-[17px] text-[#4a5568]">카메라에서 떼지 말고 잠시 기다려 주세요</p>
      <button
        type="button"
        onClick={onCancel}
        className={`mt-auto flex h-[72px] w-full items-center justify-center gap-2 rounded-[14px] border-2 border-[#c3cad6] bg-white text-[21px] font-bold text-[#2b3a55] ${FOCUS}`}
      >
        <X size={24} aria-hidden />
        취소
      </button>
    </div>
  );
}

function Done({ screen, onHome }: { screen: Extract<Screen, { kind: "done" }>; onHome: () => void }) {
  const s = STUDENTS.find((x) => x.no === screen.no)!;
  const [left, setLeft] = useState(5);
  const homeRef = useRef(onHome);
  useEffect(() => {
    homeRef.current = onHome;
  });
  useEffect(() => {
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(t);
          queueMicrotask(() => homeRef.current());
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const word = screen.mode === "in" ? "등원" : "하원";
  const green = screen.mode === "in";
  return (
    <div className="flex h-full flex-col px-6 pb-6 pt-8">
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className={`grid h-[112px] w-[112px] place-items-center rounded-full text-white ${green ? "bg-[#0d6e4c]" : "bg-[#16294a]"}`}
        >
          <Check size={64} strokeWidth={3} aria-hidden />
        </motion.div>
        <p className="mt-6 text-[30px] font-bold leading-snug" role="status">
          {s.name} 학생
          <br />
          <span className="tabular-nums">{hm(screen.at)}</span> {word} 처리되었습니다
        </p>
        {screen.late && (
          <p className="mt-2 text-[17px] font-medium text-[#8a4300]">수업 시작 {hm(classOf(s.cls).start)}보다 늦어 지각으로 기록했습니다</p>
        )}
      </div>
      <div className="mt-6 rounded-[16px] border border-[#d5dae2] bg-white p-5">
        <div className="flex items-center gap-2 text-[18px] font-bold">
          <MessageSquareText size={22} aria-hidden className="text-[#0d6e4c]" />
          학부모님께 알림을 보냈습니다
        </div>
        <div className="mt-1 text-[15px] text-[#5a6577] tabular-nums">
          {s.parent} {maskPhone(s.phone)} 알림톡
        </div>
        <div className="mt-3 rounded-[12px] bg-[#f1f3f6] p-4 text-[17px] leading-[1.55] text-[#1f2b40]">{alimText(s, screen.mode, screen.at)}</div>
      </div>
      <div className="mt-auto">
        <p className="mb-3 text-center text-[17px] text-[#4a5568]" aria-live="polite">
          <span className="font-bold tabular-nums text-[#142340]">{left}초</span> 뒤 처음 화면으로 돌아갑니다
        </p>
        <button
          type="button"
          onClick={onHome}
          className={`h-[80px] w-full rounded-[14px] bg-[#16294a] text-[23px] font-bold text-white active:translate-y-[1px] ${FOCUS}`}
        >
          처음으로
        </button>
      </div>
    </div>
  );
}

/* ---------------- 관리자 ---------------- */

function AdminPanel({
  today,
  sec,
  nowMin,
  recs,
  lastChanged,
  resend,
}: {
  today: Date;
  sec: number;
  nowMin: number;
  recs: Record<string, Rec>;
  lastChanged: string | null;
  resend: (no: string, at: number) => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const toastSeq = useRef(0);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const counts = useMemo(() => {
    const by = (list: Student[]) => {
      let inn = 0, out = 0, none = 0, late = 0;
      list.forEach((s) => {
        const r = recs[s.no];
        if (r.status === "in") inn++;
        else if (r.status === "out") out++;
        else none++;
        if (r.late) late++;
      });
      return { inn, out, none, late, total: list.length };
    };
    return {
      all: by(STUDENTS),
      ...Object.fromEntries(CLASSES.map((c) => [c.id, by(STUDENTS.filter((s) => s.cls === c.id))])),
    } as Record<string, { inn: number; out: number; none: number; late: number; total: number }>;
  }, [recs]);

  const rows = STUDENTS.filter((s) => filter === "all" || s.cls === filter);

  const onResend = (s: Student) => {
    resend(s.no, nowMin);
    const r = recs[s.no];
    toastSeq.current += 1;
    setToast({ id: toastSeq.current, text: r.status === "none" ? `${s.name} 학생 학부모님께 미등원 안내를 보냈습니다` : `${s.name} 학생 학부모님께 알림을 다시 보냈습니다` });
  };

  const tabs = [{ id: "all", name: "전체" }, ...CLASSES.map((c) => ({ id: c.id, name: c.name }))];

  return (
    <section className="mt-4 overflow-hidden rounded-[14px] border border-[#cfd5de] bg-white shadow-[0_12px_30px_-18px_rgba(20,35,64,0.4)]" aria-label="관리자 화면">
      <div className="flex h-10 items-center gap-2 border-b border-[#e1e5eb] bg-[#f3f5f8] px-4">
        <span aria-hidden className="h-3 w-3 rounded-full bg-[#d4d8de]" />
        <span aria-hidden className="h-3 w-3 rounded-full bg-[#d4d8de]" />
        <span aria-hidden className="h-3 w-3 rounded-full bg-[#d4d8de]" />
        <span className="ml-2 truncate text-[13px] text-[#5a6577]">영어 학원 출결 관리</span>
      </div>
      <div className="p-4 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-[22px] font-bold">오늘 출결</h2>
            <p className="mt-0.5 text-[15px] text-[#4a5568]">
              {fmtKo(today)} <span className="tabular-nums">{hm(nowMin)}:{p2(sec % 60)}</span> 기준
            </p>
          </div>
          <p className="text-[15px] text-[#2b3a55]">
            전체 {counts.all.total}명 중 <b className="text-[#0a5c40]">등원 {counts.all.inn}</b>, 하원 {counts.all.out}, 미등원 {counts.all.none}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" role="group" aria-label="반 선택">
          {tabs.map((t) => {
            const c = counts[t.id];
            const on = filter === t.id;
            const info = CLASSES.find((x) => x.id === t.id);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(t.id)}
                className={`rounded-[12px] border p-4 text-left transition-colors ${FOCUS} ${
                  on ? "border-[#16294a] bg-[#f3f6fb] ring-1 ring-[#16294a]" : "border-[#dde2e9] bg-white hover:border-[#9aa6b8]"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[16px] font-bold">{t.name}</span>
                  <span className="text-[13px] text-[#5a6577] tabular-nums">{info ? `${hm(info.start)}~${hm(info.end)}` : `${c.total}명`}</span>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {(
                    [
                      ["등원", c.inn, "text-[#0a5c40]"],
                      ["하원", c.out, "text-[#1b3359]"],
                      ["미등원", c.none, "text-[#4a5361]"],
                    ] as const
                  ).map(([label, n, cls]) => (
                    <div key={label} className="rounded-[8px] bg-[#f5f7fa] py-2">
                      <dt className="text-[13px] text-[#5a6577]">{label}</dt>
                      <dd className={`text-[20px] font-bold tabular-nums ${cls}`}>{n}</dd>
                    </div>
                  ))}
                </dl>
              </button>
            );
          })}
        </div>

        {/* PC: 표 */}
        <div className="mt-5 hidden overflow-hidden rounded-[12px] border border-[#dde2e9] md:block">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-[#f5f7fa] text-[14px] text-[#4a5568]">
              <tr>
                <th className="px-4 py-3 font-medium">번호</th>
                <th className="px-4 py-3 font-medium">이름</th>
                <th className="px-4 py-3 font-medium">반</th>
                <th className="px-4 py-3 font-medium">등원 시간</th>
                <th className="px-4 py-3 font-medium">하원 시간</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">학부모 알림</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const r = recs[s.no];
                const chip = chipOf(r);
                return (
                  <tr key={s.no} className={`border-t border-[#e8ebf0] ${lastChanged === s.no ? "bg-[#f6fbf8]" : ""}`}>
                    <td className="px-4 py-3 tabular-nums text-[#4a5568]">{s.no}</td>
                    <td className="px-4 py-3 font-bold">
                      {s.name}
                      {lastChanged === s.no && <span className="ml-2 text-[12px] font-medium text-[#0a5c40]">방금 처리</span>}
                    </td>
                    <td className="px-4 py-3">{classOf(s.cls).name}</td>
                    <td className="px-4 py-3 tabular-nums">{r.inAt != null ? hm(r.inAt) : "-"}</td>
                    <td className="px-4 py-3 tabular-nums">{r.outAt != null ? hm(r.outAt) : "-"}</td>
                    <td className="px-4 py-3">
                      <StatusChip chip={chip} />
                    </td>
                    <td className="px-4 py-3">
                      <ResendCell r={r} onClick={() => onResend(s)} name={s.name} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 휴대폰: 카드 목록 */}
        <ul className="mt-5 space-y-2.5 md:hidden">
          {rows.map((s) => {
            const r = recs[s.no];
            return (
              <li key={s.no} className={`rounded-[12px] border border-[#dde2e9] p-4 ${lastChanged === s.no ? "bg-[#f6fbf8]" : "bg-white"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[17px] font-bold">
                      {s.name} <span className="text-[14px] font-medium text-[#5a6577] tabular-nums">{s.no}</span>
                    </div>
                    <div className="mt-0.5 text-[14px] text-[#4a5568]">{classOf(s.cls).name}</div>
                  </div>
                  <StatusChip chip={chipOf(r)} />
                </div>
                <div className="mt-2 flex gap-4 text-[14px] tabular-nums text-[#2b3a55]">
                  <span>등원 {r.inAt != null ? hm(r.inAt) : "-"}</span>
                  <span>하원 {r.outAt != null ? hm(r.outAt) : "-"}</span>
                </div>
                <div className="mt-3 border-t border-[#eef0f4] pt-3">
                  <ResendCell r={r} onClick={() => onResend(s)} name={s.name} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              role="status"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="flex max-w-full items-center gap-2 rounded-[12px] bg-[#16294a] px-4 py-3 text-[15px] font-medium text-white shadow-lg"
            >
              <Check size={18} aria-hidden className="shrink-0" />
              <span>{toast.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function StatusChip({ chip }: { chip: Chip }) {
  return <span className={`inline-flex h-7 shrink-0 items-center rounded-[6px] border px-2.5 text-[14px] font-bold ${CHIP_CLS[chip]}`}>{chip}</span>;
}

function ResendCell({ r, onClick, name }: { r: Rec; onClick: () => void; name: string }) {
  const none = r.status === "none";
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <button
        type="button"
        onClick={onClick}
        aria-label={`${name} 학생 ${none ? "미등원 안내 보내기" : "알림 다시 보내기"}`}
        className={`inline-flex h-9 items-center gap-1.5 rounded-[8px] border px-3 text-[14px] font-bold ${FOCUS} ${
          none ? "border-[#e9c9a3] bg-[#fffaf3] text-[#8a4300] hover:bg-[#fdf1e2]" : "border-[#c5ccd8] bg-white text-[#16294a] hover:bg-[#f3f6fb]"
        }`}
      >
        <Send size={15} aria-hidden />
        {none ? "미등원 안내" : "다시 보내기"}
      </button>
      {r.sentAt != null && (
        <span className="text-[13px] text-[#5a6577] tabular-nums">
          {hm(r.sentAt)} {r.sentKind}
        </span>
      )}
    </div>
  );
}
