"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  BatteryFull,
  Check,
  ChevronLeft,
  Delete,
  GraduationCap,
  LogIn,
  LogOut,
  MessageSquareText,
  MonitorSmartphone,
  Nfc,
  QrCode,
  ScanLine,
  Send,
  Signal,
  TabletSmartphone,
  Users,
  Wifi,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";
import { fmtKo, useDemoToday } from "@/hooks/useDemoToday";

// 학원 입구 출결 키오스크 카탈로그(11-01, 2판).
// 키오스크 화면은 450x800 설계 크기로 그리고, 화면 폭에 맞춰 transform으로 줄이거나 키운다.
// 시계는 15:52에서 시작해 실제 1초마다 흐른다(첫 렌더는 항상 같은 값이라 하이드레이션 불일치 없음).
// md 이상(모션 줄이기 아님)은 학원 입구 3D 공간 안의 키오스크, 옆이나 아래에 학생증(누르면 리더기 태그)과 학부모 휴대폰 알림.
// 휴대폰 폭과 모션 줄이기는 평면 키오스크. 키오스크 화면 상태는 이 페이지 하나에만 둔다.

// 학원 입구 3D 공간(공용 장면). 브라우저에서만 그린다
const KioskScene = dynamic(() => import("@/components/demos/kiosk3d/KioskScene").then((m) => m.KioskScene), { ssr: false });

const DESIGN_W = 450;
const DESIGN_H = 800;
const START_SEC = (15 * 60 + 52) * 60;

/* ---------------- 데이터 ---------------- */

type Teacher = { name: string; img: string; alt: string; pos: string };
type ClassInfo = { id: string; name: string; start: number; end: number; room: string; teacher: Teacher };
const T_KIM: Teacher = { name: "김ㅅ연", img: "/images/demo-english-talk/teacher-korean.jpg", alt: "김ㅅ연 선생님", pos: "50% 22%" };
const T_DANIEL: Teacher = { name: "Daniel", img: "/images/demo-english-talk/teacher-native.jpg", alt: "Daniel 선생님", pos: "50% 25%" };
const T_LEE: Teacher = { name: "이ㅈ훈", img: "/images/demo-english-talk/teacher-korean-2.jpg", alt: "이ㅈ훈 선생님", pos: "50% 22%" };
const T_EMILY: Teacher = { name: "Emily", img: "/images/demo-english-talk/teacher-native-2.jpg", alt: "Emily 선생님", pos: "50% 22%" };

const CLASSES: ClassInfo[] = [
  { id: "C", name: "중등 1학년 C반", start: 14 * 60, end: 15 * 60 + 30, room: "303호", teacher: T_LEE },
  { id: "B", name: "초등 6학년 B반", start: 15 * 60 + 30, end: 17 * 60, room: "301호", teacher: T_DANIEL },
  { id: "A", name: "초등 5학년 A반", start: 16 * 60, end: 17 * 60 + 30, room: "302호", teacher: T_KIM },
  { id: "D", name: "중등 2학년 D반", start: 17 * 60, end: 18 * 60 + 30, room: "301호", teacher: T_EMILY },
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
  { no: "2051", name: "문ㅅ율", cls: "D", phone: "5803", parent: "어머니" },
  { no: "2052", name: "장ㅇ린", cls: "D", phone: "4126", parent: "아버지" },
];
const studentOf = (no: string) => STUDENTS.find((s) => s.no === no)!;

type Rec = { status: "none" | "in" | "out"; inAt?: number; outAt?: number; late?: boolean; sentAt?: number; sentKind?: string };
const sentIn = (m: number) => ({ sentAt: m, sentKind: "등원 알림 발송" });
const sentOut = (m: number) => ({ sentAt: m, sentKind: "하원 알림 발송" });
const SEED: Record<string, Rec> = {
  "1021": { status: "none" },
  "1022": { status: "in", inAt: 941, ...sentIn(941) },
  "1023": { status: "in", inAt: 947, ...sentIn(947) },
  "1024": { status: "none" },
  "1031": { status: "in", inAt: 922, ...sentIn(922) },
  "1032": { status: "in", inAt: 938, late: true, ...sentIn(938) },
  "1033": { status: "none" },
  "1034": { status: "in", inAt: 926, ...sentIn(926) },
  "2041": { status: "out", inAt: 835, outAt: 934, ...sentOut(934) },
  "2042": { status: "out", inAt: 838, outAt: 936, ...sentOut(936) },
  "2043": { status: "in", inAt: 846, late: true, ...sentIn(846) },
  "2044": { status: "none" },
  "2051": { status: "none" },
  "2052": { status: "none" },
};
// QR 찍기를 누르면 이 순서로 학생증 QR을 찍은 것으로 본다(등원 중이면 하원, 아니면 등원)
const QR_ORDER = ["2043", "1034", "1022", "1023", "1032", "1021", "1024", "1033", "2051", "2052", "2044", "1031"];
// 옆에 놓인 학생증(누르면 리더기에 태그한 것으로 처리)
const CARD_NOS = ["1021", "1024", "1033", "1031"];

// 기다리는 동안 보는 오늘의 영어 한 문장(날짜마다 바뀜)
const SENTENCES = [
  { en: "Practice makes perfect.", ko: "연습이 완벽을 만듭니다." },
  { en: "Little by little, one travels far.", ko: "조금씩 가다 보면 멀리 갑니다." },
  { en: "Mistakes help me learn.", ko: "실수는 배우는 데 도움이 됩니다." },
  { en: "Today is a good day to try.", ko: "오늘은 도전하기 좋은 날입니다." },
  { en: "Every day is a fresh start.", ko: "매일이 새로운 시작입니다." },
  { en: "Reading opens new doors.", ko: "읽기는 새로운 문을 열어 줍니다." },
  { en: "Ask, and you will learn.", ko: "물어보면 배우게 됩니다." },
];

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

const FOCUS = "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f2b705] focus-visible:ring-offset-2";

type Mode = "in" | "out";
type Screen =
  | { kind: "idle" }
  | { kind: "pad"; mode: Mode }
  | { kind: "confirm"; mode: Mode; no: string }
  | { kind: "scan"; via: "qr" | "card"; no?: string; seq: number }
  | { kind: "done"; mode: Mode; no: string; at: number; late: boolean; seq: number };

type Note = { id: number; no: string; at: number | null; text: string };
const SEED_NOTES: Note[] = [{ id: 0, no: "1021", at: null, text: "[영어 학원] 김ㅎ늘 학생이 17:34에 하원했습니다. 귀가 여부를 확인해 주세요." }];

function alimText(s: Student, mode: Mode, at: number) {
  const c = classOf(s.cls);
  if (mode === "in") return `[영어 학원] ${s.name} 학생이 ${hm(at)}에 등원했습니다. 오늘 수업은 ${c.name} ${hm(c.start)}~${hm(c.end)}, ${c.room}입니다.`;
  return `[영어 학원] ${s.name} 학생이 ${hm(at)}에 하원했습니다. 귀가 여부를 확인해 주세요.`;
}

function Photo({ src, alt, className = "", pos }: { src: string; alt: string; className?: string; pos?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다
    <img src={src} alt={alt} draggable={false} className={`object-cover ${className}`} style={pos ? { objectPosition: pos } : undefined} />
  );
}

/* ---------------- 페이지 ---------------- */

/** threeD: true면 md 이상(모션 줄이기 아님)에서 학원 입구 3D 공간 안의 키오스크(/3d 경로용). 기본은 평면 키오스크 */
export function KioskAcademyDemo({ threeD = false }: { threeD?: boolean }) {
  const today = useDemoToday();
  const [view, setView] = useState<"kiosk" | "admin">("kiosk");
  const [sec, setSec] = useState(START_SEC);
  const [recs, setRecs] = useState<Record<string, Rec>>(SEED);
  const [screen, setScreen] = useState<Screen>({ kind: "idle" });
  const [notes, setNotes] = useState<Note[]>(SEED_NOTES);
  const [lastChanged, setLastChanged] = useState<string | null>(null);
  const seq = useRef(1);

  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const nowMin = Math.floor(sec / 60);

  const pushNote = useCallback((no: string, at: number, text: string) => {
    seq.current += 1;
    const id = seq.current;
    setNotes((prev) => [{ id, no, at, text }, ...prev].slice(0, 12));
  }, []);

  const apply = useCallback(
    (no: string, mode: Mode, at: number) => {
      const s = studentOf(no);
      const late = mode === "in" && at > classOf(s.cls).start;
      setRecs((prev) => {
        const r = prev[no];
        const next: Rec =
          mode === "in" ? { status: "in", inAt: at, late, ...sentIn(at) } : { ...r, status: "out", outAt: at, ...sentOut(at) };
        return { ...prev, [no]: next };
      });
      setLastChanged(no);
      pushNote(no, at, alimText(s, mode, at));
      seq.current += 1;
      setScreen({ kind: "done", mode, no, at, late, seq: seq.current });
    },
    [pushNote],
  );

  const resend = useCallback(
    (no: string, at: number, r: Rec) => {
      const s = studentOf(no);
      const kind = r.status === "none" ? "미등원 안내 발송" : `${r.status === "out" ? "하원" : "등원"} 알림 재발송`;
      setRecs((prev) => ({ ...prev, [no]: { ...prev[no], sentAt: at, sentKind: kind } }));
      const c = classOf(s.cls);
      const text =
        r.status === "none"
          ? `[영어 학원] ${s.name} 학생이 아직 등원하지 않았습니다. 오늘 수업은 ${hm(c.start)}에 시작합니다.`
          : alimText(s, r.status === "out" ? "out" : "in", r.status === "out" ? r.outAt! : r.inAt!);
      pushNote(no, at, text);
    },
    [pushNote],
  );

  // 학생증을 누르면 키오스크가 처음 화면이 아니어도 바로 리더기 태그로 넘어간다
  const tagCard = useCallback((no: string) => {
    seq.current += 1;
    setScreen({ kind: "scan", via: "card", no, seq: seq.current });
  }, []);

  // 3D 공간: 학생증을 누르면 먼저 카메라가 키오스크로 다가가고(zoomSignal), 약 0.9초 뒤 태그를 처리한다
  const [zoomSignal, setZoomSignal] = useState(0);
  const [approaching, setApproaching] = useState(false);
  const approachTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (approachTimer.current) clearTimeout(approachTimer.current);
  }, []);
  const tagCard3d = useCallback(
    (no: string) => {
      if (approachTimer.current) return;
      setZoomSignal((z) => z + 1);
      setApproaching(true);
      approachTimer.current = setTimeout(() => {
        approachTimer.current = null;
        setApproaching(false);
        tagCard(no);
      }, 900);
    },
    [tagCard],
  );

  // threeD이고 md 이상, 모션 줄이기가 아니면 3D 공간. 그 밖은 평면 키오스크(threeD일 때만 첫 렌더를 비워 둔다)
  const [layout, setLayout] = useState<"3d" | "flat" | null>(threeD ? null : "flat");
  useEffect(() => {
    if (!threeD) return;
    const wide = window.matchMedia("(min-width: 768px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    // 11-02 휴대폰에서도 3D(폭 제한 없음)
    const pick = () => setLayout(!calm.matches ? "3d" : "flat");
    const f = requestAnimationFrame(pick);
    wide.addEventListener("change", pick);
    calm.addEventListener("change", pick);
    return () => {
      cancelAnimationFrame(f);
      wide.removeEventListener("change", pick);
      calm.removeEventListener("change", pick);
    };
  }, [threeD]);

  const busy = screen.kind === "scan";
  const owner = notes[0]?.no ?? "1021";
  const ownerNotes = notes.filter((n) => n.no === owner).slice(0, 3);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#e9ecf0] text-[#142340]">
        <div className="mx-auto w-full max-w-[1240px] px-4 pb-8 pt-5 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <GraduationCap size={22} aria-hidden className="text-[#16294a]" />
              <span className="text-[17px] font-bold">영어 학원 출결</span>
            </div>
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
            {layout === null ? (
              <div className="mt-4 aspect-[9/16] w-full md:aspect-auto md:h-[min(78vh,820px)] md:min-h-[600px]" aria-hidden />
            ) : (
              <div
                className={`mt-4 grid grid-cols-1 gap-4 ${
                  layout === "3d" ? "xl:grid-cols-[264px_minmax(0,1fr)_264px]" : "xl:grid-cols-[264px_auto_264px] xl:justify-center"
                }`}
              >
                <Zone step={1} role="학생" title="학생증 태그" sub="누르면 리더기에 댄 것으로 처리" className="min-w-0">
                  <div className="-mx-4 flex gap-2.5 self-stretch overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-1">
                    {CARD_NOS.map((no) => (
                      <IdCard
                        key={no}
                        no={no}
                        rec={recs[no]}
                        disabled={busy || approaching}
                        onTag={() => (layout === "3d" ? tagCard3d(no) : tagCard(no))}
                        compact
                      />
                    ))}
                  </div>
                </Zone>
                <Zone step={2} role="학생" title="입구 키오스크" sub="번호, QR, 학생증으로 등원과 하원" className="min-w-0">
                  {layout === "3d" ? (
                    <KioskScene
                      place="academy"
                      zoomSignal={zoomSignal}
                      paused={view !== "kiosk"}
                      monitor={<AdminMonitor today={today} sec={sec} recs={recs} lastChanged={lastChanged} />}
                      phone={<ParentPhone today={today} nowMin={nowMin} notes={ownerNotes.slice(0, 2)} short />} className="h-[72svh] min-h-[460px] w-full md:h-[min(74vh,780px)] md:min-h-[560px]">
                      <div style={{ width: DESIGN_W, height: DESIGN_H }}>
                        <Kiosk today={today} sec={sec} recs={recs} screen={screen} setScreen={setScreen} apply={apply} active={view === "kiosk"} />
                      </div>
                    </KioskScene>
                  ) : (
                    <KioskStage><Kiosk today={today} sec={sec} recs={recs} screen={screen} setScreen={setScreen} apply={apply} active={view === "kiosk"} /></KioskStage>
                  )}
                </Zone>
                <Zone step={3} role="학부모" title="알림 받는 휴대폰" sub={`${studentOf(owner).name} 학생 ${studentOf(owner).parent}`}>
                  <ParentPhone today={today} nowMin={nowMin} notes={ownerNotes} />
                </Zone>
              </div>
            )}
          </div>
          {view === "admin" && (
            <Zone fill role="원장" title="출결 관리 화면" sub="키오스크 기록이 바로 반영됩니다" className="mt-4">
              <AdminPanel today={today} sec={sec} nowMin={nowMin} recs={recs} lastChanged={lastChanged} resend={resend} />
            </Zone>
          )}

          <DemoMakerInfo className="mt-6 text-center text-[#4a5568]" />
        </div>
      </div>
    </MotionConfig>
  );
}

const ROLE_CLS: Record<string, string> = {
  학생: "bg-[#e3f3eb] text-[#0a5c40]",
  학부모: "bg-[#fdf1e2] text-[#8a4300]",
  원장: "bg-[#16294a] text-white",
};

// 화면 영역 묶음: 누가 쓰는 화면인지(역할)와 이름을 맨 위 한 줄에 둔다
function Zone({
  step,
  role,
  title,
  sub,
  className = "",
  children,
  fill,
}: {
  fill?: boolean;
  step?: number;
  role: "학생" | "학부모" | "원장";
  title: string;
  sub?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={`${role} ${title}`} className={`flex flex-col rounded-[18px] border border-[#d9dee6] bg-[#f4f6f9] p-4 ${className}`}>
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {step != null && (
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#c3cad6] bg-white text-[12px] font-bold tabular-nums text-[#4a5568]" aria-hidden>
            {step}
          </span>
        )}
        <span className={`rounded-[6px] px-2 py-0.5 text-[13px] font-bold ${ROLE_CLS[role]}`}>{role}</span>
        <h2 className="text-[16px] font-bold text-[#142340]">{title}</h2>
      </header>
      {sub && <p className="mt-1 text-[13px] text-[#5a6577]">{sub}</p>}
      <div className={`mt-4 flex flex-1 flex-col ${fill ? "" : "items-center justify-center"}`}>{children}</div>
    </section>
  );
}

function IdCard({ no, rec, disabled, onTag, compact }: { no: string; rec: Rec; disabled: boolean; onTag: () => void; compact?: boolean }) {
  const s = studentOf(no);
  const c = classOf(s.cls);
  const action = rec.status === "none" ? "등원" : rec.status === "in" ? "하원" : null;
  const off = disabled || !action;
  return (
    <motion.button
      type="button"
      onClick={onTag}
      disabled={off}
      whileHover={off ? undefined : { x: compact ? 0 : 6, y: compact ? -2 : 0 }}
      whileTap={off ? undefined : { scale: 0.98 }}
      aria-label={`${s.name} 학생증 태그, ${action ? `${action} 처리` : "하원 완료"}`}
      className={`group relative block shrink-0 overflow-hidden rounded-[12px] border bg-white text-left shadow-[0_1px_2px_rgba(20,35,64,0.08)] transition-colors ${FOCUS} ${
        compact ? "w-[236px] md:w-full" : "w-full"
      } ${off ? "cursor-default border-[#dde2e9] opacity-60" : "border-[#d5dae2] hover:border-[#16294a]"}`}
    >
      <div className="flex h-7 items-center justify-between bg-[#16294a] px-3 text-[12px] font-bold text-white">
        <span>영어 학원 학생증</span>
        <Nfc size={15} aria-hidden className="text-[#9fb3d4]" />
      </div>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e7ecf4] text-[17px] font-bold text-[#16294a]" aria-hidden>
          {s.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[16px] font-bold">{s.name}</span>
            <span className="text-[13px] tabular-nums text-[#5a6577]">{s.no}</span>
          </div>
          <div className="truncate text-[13px] text-[#4a5568]">{c.name}</div>
        </div>
        <span
          className={`shrink-0 rounded-[6px] px-2 py-1 text-[12px] font-bold ${
            action === "등원" ? "bg-[#e3f3eb] text-[#0a5c40]" : action === "하원" ? "bg-[#e7ecf4] text-[#1b3359]" : "bg-[#f1f2f4] text-[#5a6577]"
          }`}
        >
          {action ? (
            <>
              {action}
              <span className={compact ? "hidden md:inline" : ""}> 태그</span>
            </>
          ) : (
            "하원 완료"
          )}
        </span>
      </div>
    </motion.button>
  );
}

/* ---------------- 학부모 휴대폰 ---------------- */

function ParentPhone({ today, nowMin, notes, short }: { today: Date; nowMin: number; notes: Note[]; short?: boolean }) {
  const DOWF = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  return (
    <div className="w-[232px]">
      <div className="rounded-[42px] bg-[#15181d] p-[9px] shadow-[0_18px_40px_-20px_rgba(20,35,64,0.6)]">
        <div className={`relative overflow-hidden rounded-[34px] ${short ? "h-[400px]" : "h-[500px]"}`}>
          <Photo src="/images/demo-academy/study.jpg" alt="" className="absolute inset-0 h-full w-full" pos="40% 50%" />
          <div className="absolute inset-0 bg-[#0b1220]/55" aria-hidden />
          <div className="relative flex h-full flex-col px-3 pt-3 text-white">
            <div className="flex items-center justify-between px-3 text-[12px] font-bold">
              <span className="tabular-nums">{hm(nowMin)}</span>
              <span className="absolute left-1/2 top-3 h-[22px] w-[78px] -translate-x-1/2 rounded-full bg-black" aria-hidden />
              <span className="flex items-center gap-1" aria-hidden>
                <Signal size={13} />
                <Wifi size={13} />
                <BatteryFull size={16} />
              </span>
            </div>
            <div className="mt-8 text-center">
              <div className="text-[15px] font-medium text-white/90">
                {today.getMonth() + 1}월 {today.getDate()}일 {DOWF[today.getDay()]}
              </div>
              <div className="mt-0.5 text-[64px] font-bold leading-none tracking-[-0.02em] tabular-nums">{hm(nowMin)}</div>
            </div>
            <div className="mt-auto space-y-2 pb-6" aria-live="polite">
              <AnimatePresence initial={false}>
                {notes.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: -14, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
                    className="rounded-[18px] bg-white/90 p-3 text-[#142340] shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-[7px] bg-[#16294a] text-white" aria-hidden>
                        <GraduationCap size={14} />
                      </span>
                      <span className="text-[13px] font-bold">영어 학원</span>
                      <span className="ml-auto text-[12px] text-[#5a6577] tabular-nums">
                        {n.at == null ? "어제" : n.at >= nowMin ? "지금" : hm(n.at)}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-3 text-[13px] leading-[1.45]">{n.text}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 키오스크 ---------------- */

function KioskStage({ children }: { children: React.ReactNode }) {
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
    <div className="flex w-full flex-col items-center md:w-auto" style={{ ["--kh" as string]: "clamp(560px, calc(100vh - 320px), 960px)" }}>
      <div className="w-full md:w-auto md:rounded-[30px] md:bg-[#1d2128] md:px-[14px] md:pb-[10px] md:pt-[14px] md:shadow-[0_18px_40px_-18px_rgba(20,35,64,0.55)]">
        <div
          ref={screenRef}
          className="relative aspect-[9/16] w-full overflow-hidden rounded-[16px] border border-[#cfd5de] bg-white md:h-[var(--kh)] md:w-[calc(var(--kh)*9/16)] md:rounded-[14px] md:border-0"
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale ?? 1})`, visibility: scale ? "visible" : "hidden" }}
          >
            {children}
          </div>
        </div>
        <div className="hidden h-[22px] items-center justify-center gap-1.5 text-[11px] font-bold text-[#8c95a3] md:flex" aria-hidden>
          <Nfc size={13} />
          학생증 리더기
        </div>
      </div>
      <div aria-hidden className="hidden h-6 w-14 bg-gradient-to-b from-[#a9b0bb] to-[#c3c9d2] md:block" />
      <div aria-hidden className="hidden h-3 w-52 rounded-full bg-[#b4bbc5] md:block" />
    </div>
  );
}

function Kiosk({
  today,
  sec,
  recs,
  screen,
  setScreen,
  apply,
  active,
}: {
  today: Date;
  sec: number;
  recs: Record<string, Rec>;
  screen: Screen;
  setScreen: (s: Screen) => void;
  apply: (no: string, mode: Mode, at: number) => void;
  active: boolean;
}) {
  const nowMin = Math.floor(sec / 60);
  const reduce = useReducedMotion();
  const recsRef = useRef(recs);
  const minRef = useRef(nowMin);
  useEffect(() => {
    recsRef.current = recs;
    minRef.current = nowMin;
  });

  // QR, 학생증: 잠시 읽는 화면을 보여 준 뒤 처리
  useEffect(() => {
    if (screen.kind !== "scan") return;
    const t = setTimeout(
      () => {
        const r = recsRef.current;
        const no =
          screen.no ?? QR_ORDER.find((n) => r[n].status === "in") ?? QR_ORDER.find((n) => r[n].status === "none");
        if (!no || r[no].status === "out") {
          setScreen({ kind: "idle" });
          return;
        }
        apply(no, r[no].status === "in" ? "out" : "in", minRef.current);
      },
      screen.via === "card" ? 800 : 1100,
    );
    return () => clearTimeout(t);
  }, [screen, apply, setScreen]);

  const fade = reduce
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };
  const key = screen.kind === "done" || screen.kind === "scan" ? `${screen.kind}-${screen.seq}` : screen.kind;

  return (
    <div className="flex h-full flex-col bg-[#f6f7f9] text-[#142340]">
      <header className="flex h-[64px] shrink-0 items-center justify-between bg-[#16294a] px-6 text-white">
        <div className="flex items-center gap-2.5">
          <GraduationCap size={24} aria-hidden />
          <span className="text-[21px] font-bold">영어 학원</span>
        </div>
        <div className="text-right leading-tight">
          <div className="text-[14px] text-[#c9d3e3]">{fmtKo(today)}</div>
          <div className="text-[19px] font-bold tabular-nums">{hm(nowMin)}</div>
        </div>
      </header>
      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={key} {...fade} transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }} className="absolute inset-0 flex flex-col">
            {screen.kind === "idle" && (
              <Idle
                sec={sec}
                today={today}
                onMode={(mode) => setScreen({ kind: "pad", mode })}
                onQr={() => setScreen({ kind: "scan", via: "qr", seq: sec })}
              />
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
                onOk={() => apply(screen.no, screen.mode, minRef.current)}
              />
            )}
            {screen.kind === "scan" && <Scan via={screen.via} onCancel={() => setScreen({ kind: "idle" })} />}
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
  const nowMin = Math.floor(sec / 60);
  const sentence = SENTENCES[today.getDate() % SENTENCES.length];
  return (
    <div className="flex h-full flex-col">
      <div className="relative h-[178px] shrink-0 overflow-hidden">
        <Photo src="/images/demo-academy/classroom.jpg" alt="영어 학원 강의실" className="absolute inset-0 h-full w-full" pos="50% 45%" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1a33]/90 via-[#0c1a33]/45 to-[#0c1a33]/10" aria-hidden />
        <div className="absolute inset-x-6 bottom-4 flex items-end justify-between text-white">
          <div>
            <div className="text-[16px] font-medium text-white/90">{fmtKo(today)}</div>
            <div className="text-[64px] font-bold leading-none tracking-[-0.02em] tabular-nums" aria-label={`현재 시각 ${h}시 ${m}분`}>
              {p2(h)}:{p2(m)}
            </div>
          </div>
          <p className="pb-1.5 text-right text-[16px] font-medium leading-snug text-white/95">
            등원 또는 하원을
            <br />
            눌러 주세요
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onMode("in")}
            className={`flex h-[128px] flex-col items-center justify-center gap-2 rounded-[16px] bg-[#0d6e4c] text-white shadow-[0_2px_0_#09523a] active:translate-y-[1px] ${FOCUS}`}
          >
            <LogIn size={38} aria-hidden />
            <span className="text-[30px] font-bold">등원</span>
          </button>
          <button
            type="button"
            onClick={() => onMode("out")}
            className={`flex h-[128px] flex-col items-center justify-center gap-2 rounded-[16px] bg-[#16294a] text-white shadow-[0_2px_0_#0d1a31] active:translate-y-[1px] ${FOCUS}`}
          >
            <LogOut size={38} aria-hidden />
            <span className="text-[30px] font-bold">하원</span>
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-[16px] border border-[#d5dae2] bg-white p-3 pl-5">
          <div className="min-w-0 flex-1">
            <div className="text-[17px] font-bold leading-snug">QR 코드를 카메라에 대 주세요</div>
            <div className="text-[14px] text-[#4a5568]">학생증은 화면 아래 리더기에</div>
          </div>
          <button
            type="button"
            onClick={onQr}
            className={`flex h-[64px] shrink-0 items-center gap-1.5 rounded-[12px] border-2 border-[#16294a] px-3.5 text-[17px] font-bold text-[#16294a] active:bg-[#eef1f6] ${FOCUS}`}
          >
            <ScanLine size={22} aria-hidden />
            QR 찍기
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[16px] font-bold">오늘 수업</h2>
            <span className="text-[13px] text-[#5a6577]">담당 선생님</span>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {CLASSES.map((c) => {
              const state = nowMin >= c.end ? "수업 끝" : nowMin >= c.start ? "수업 중" : `${hm(c.start)} 시작`;
              const live = state === "수업 중";
              return (
                <li key={c.id} className={`flex items-center gap-2.5 rounded-[12px] border bg-white p-2 ${live ? "border-[#0d6e4c]" : "border-[#e1e5eb]"}`}>
                  <Photo src={c.teacher.img} alt={c.teacher.alt} pos={c.teacher.pos} className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-bold leading-tight">{c.name}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[12px] leading-tight">
                      <span className="truncate text-[#4a5568]">{c.teacher.name}</span>
                      <span className={`shrink-0 font-bold ${live ? "text-[#0a5c40]" : state === "수업 끝" ? "text-[#8c95a3]" : "text-[#1b3359]"}`}>{state}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-auto rounded-[14px] bg-[#16294a] px-4 py-3 text-white">
          <div className="text-[12px] font-bold text-[#9fb3d4]">오늘의 영어 한 문장</div>
          <div className="mt-1 text-[18px] font-bold leading-snug">{sentence.en}</div>
          <div className="text-[14px] text-[#c9d3e3]">{sentence.ko}</div>
        </div>
      </div>
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
  const s = studentOf(no);
  const c = classOf(s.cls);
  const word = mode === "in" ? "등원" : "하원";
  return (
    <div className="flex h-full flex-col px-6 pb-6 pt-3">
      <div className="flex items-center justify-between">
        <BackButton onClick={onRetry} label="다시 입력" />
        <ModeTag mode={mode} />
      </div>
      <h2 className="mt-3 text-center text-[26px] font-bold">{word}할 학생이 맞나요?</h2>
      <div className="mt-5 rounded-[16px] border border-[#d5dae2] bg-white p-6">
        <div className="flex items-center gap-5">
          <div className="grid h-[84px] w-[84px] shrink-0 place-items-center rounded-full bg-[#e7ecf4] text-[34px] font-bold text-[#16294a]" aria-hidden>
            {s.name[0]}
          </div>
          <div className="min-w-0">
            <div className="text-[34px] font-bold leading-tight">{s.name}</div>
            <div className="mt-1 text-[19px] text-[#2b3a55]">{c.name}</div>
          </div>
        </div>
        <dl className="mt-5 grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-2.5 border-t border-[#e4e8ee] pt-5 text-[18px]">
          <dt className="text-[#5a6577]">학생 번호</dt>
          <dd className="font-bold tabular-nums">{s.no}</dd>
          <dt className="text-[#5a6577]">오늘 수업</dt>
          <dd className="font-bold tabular-nums">
            {hm(c.start)}~{hm(c.end)}, {c.room}
          </dd>
          <dt className="text-[#5a6577]">담당 선생님</dt>
          <dd className="flex items-center gap-2 font-bold">
            <Photo src={c.teacher.img} alt="" pos={c.teacher.pos} className="h-8 w-8 rounded-full" />
            {c.teacher.name} 선생님
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

function Scan({ via, onCancel }: { via: "qr" | "card"; onCancel: () => void }) {
  const reduce = useReducedMotion();
  const card = via === "card";
  return (
    <div className="flex h-full flex-col items-center px-6 pb-6 pt-10">
      <div className="relative h-[260px] w-[260px] overflow-hidden rounded-[20px] bg-[#0f1b31]">
        {!card &&
          [
            "left-4 top-4 border-l-4 border-t-4 rounded-tl-[10px]",
            "right-4 top-4 border-r-4 border-t-4 rounded-tr-[10px]",
            "left-4 bottom-4 border-l-4 border-b-4 rounded-bl-[10px]",
            "right-4 bottom-4 border-r-4 border-b-4 rounded-br-[10px]",
          ].map((c) => <span key={c} aria-hidden className={`absolute h-12 w-12 border-white ${c}`} />)}
        <div className="absolute inset-0 grid place-items-center text-[#c9d3e3]">
          {card ? <Nfc size={96} aria-hidden strokeWidth={1.5} /> : <QrCode size={96} aria-hidden strokeWidth={1.5} />}
        </div>
        {!reduce && !card && (
          <motion.span
            aria-hidden
            className="absolute left-6 right-6 h-[3px] rounded-full bg-[#3ccf8e]"
            initial={{ top: 28 }}
            animate={{ top: 228 }}
            transition={{ duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          />
        )}
        {!reduce && card && (
          <motion.span
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#3ccf8e]"
            initial={{ scale: 0.6, opacity: 0.9 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", repeat: Infinity }}
          />
        )}
      </div>
      <p className="mt-8 text-[24px] font-bold" role="status">
        {card ? "학생증을 읽고 있습니다" : "QR 코드를 읽고 있습니다"}
      </p>
      <p className="mt-2 text-[17px] text-[#4a5568]">{card ? "리더기에서 떼지 말고 잠시 기다려 주세요" : "카메라에서 떼지 말고 잠시 기다려 주세요"}</p>
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
  const s = studentOf(screen.no);
  const c = classOf(s.cls);
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
    <div className="flex h-full flex-col px-5 pb-5 pt-6">
      <div className="flex items-center gap-4 px-1">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className={`grid h-[84px] w-[84px] shrink-0 place-items-center rounded-full text-white ${green ? "bg-[#0d6e4c]" : "bg-[#16294a]"}`}
        >
          <Check size={48} strokeWidth={3} aria-hidden />
        </motion.div>
        <p className="text-[26px] font-bold leading-snug" role="status">
          {s.name} 학생
          <br />
          <span className="tabular-nums">{hm(screen.at)}</span> {word} 처리되었습니다
        </p>
      </div>
      {screen.late && <p className="mt-3 px-1 text-[16px] font-medium text-[#8a4300]">수업 시작 {hm(c.start)}보다 늦어 지각으로 기록했습니다</p>}

      <div className="mt-5 overflow-hidden rounded-[16px] border border-[#d5dae2] bg-white">
        <div className="flex items-center gap-4 p-4">
          <Photo src={c.teacher.img} alt={c.teacher.alt} pos={c.teacher.pos} className="h-[76px] w-[76px] shrink-0 rounded-[14px]" />
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-[#0a5c40]">{green ? "오늘 수업 담당 선생님" : "오늘 수업한 선생님"}</div>
            <div className="mt-0.5 text-[21px] font-bold leading-tight">{c.teacher.name} 선생님</div>
            <div className="mt-1 text-[15px] tabular-nums text-[#4a5568]">
              {c.name}, {hm(c.start)}~{hm(c.end)}, {c.room}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-[16px] border border-[#d5dae2] bg-white p-4">
        <div className="flex items-center gap-2 text-[17px] font-bold">
          <MessageSquareText size={21} aria-hidden className="text-[#0d6e4c]" />
          학부모님께 알림을 보냈습니다
        </div>
        <div className="mt-0.5 text-[14px] text-[#5a6577] tabular-nums">
          {s.parent} {maskPhone(s.phone)} 알림톡
        </div>
        <div className="mt-2.5 rounded-[12px] bg-[#f1f3f6] p-3.5 text-[16px] leading-[1.55] text-[#1f2b40]">{alimText(s, screen.mode, screen.at)}</div>
      </div>
      <div className="mt-auto">
        <p className="mb-3 text-center text-[16px] text-[#4a5568]" aria-live="polite">
          <span className="font-bold tabular-nums text-[#142340]">{left}초</span> 뒤 처음 화면으로 돌아갑니다
        </p>
        <button
          type="button"
          onClick={onHome}
          className={`h-[76px] w-full rounded-[14px] bg-[#16294a] text-[22px] font-bold text-white active:translate-y-[1px] ${FOCUS}`}
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
  resend: (no: string, at: number, r: Rec) => void;
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
      let inn = 0,
        out = 0,
        none = 0;
      list.forEach((s) => {
        const r = recs[s.no];
        if (r.status === "in") inn++;
        else if (r.status === "out") out++;
        else none++;
      });
      return { inn, out, none, total: list.length };
    };
    return {
      all: by(STUDENTS),
      ...Object.fromEntries(CLASSES.map((c) => [c.id, by(STUDENTS.filter((s) => s.cls === c.id))])),
    } as Record<string, { inn: number; out: number; none: number; total: number }>;
  }, [recs]);

  const rows = STUDENTS.filter((s) => filter === "all" || s.cls === filter);

  const onResend = (s: Student) => {
    const r = recs[s.no];
    resend(s.no, nowMin, r);
    toastSeq.current += 1;
    setToast({
      id: toastSeq.current,
      text: r.status === "none" ? `${s.name} 학생 학부모님께 미등원 안내를 보냈습니다` : `${s.name} 학생 학부모님께 알림을 다시 보냈습니다`,
    });
  };

  const all = counts.all;

  return (
    <section className="overflow-hidden rounded-[14px] border border-[#cfd5de] bg-white shadow-[0_12px_30px_-18px_rgba(20,35,64,0.4)]" aria-label="관리자 화면">
      <div className="flex h-10 items-center gap-2 border-b border-[#e1e5eb] bg-[#f3f5f8] px-4">
        <span aria-hidden className="h-3 w-3 rounded-full bg-[#d4d8de]" />
        <span aria-hidden className="h-3 w-3 rounded-full bg-[#d4d8de]" />
        <span aria-hidden className="h-3 w-3 rounded-full bg-[#d4d8de]" />
        <span className="ml-2 truncate text-[13px] text-[#5a6577]">영어 학원 출결 관리</span>
      </div>

      <div className="relative overflow-hidden">
        <Photo src="/images/demo-academy/hero.jpg" alt="영어 학원 강의실" className="absolute inset-0 h-full w-full" pos="50% 40%" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1a33]/92 via-[#0c1a33]/75 to-[#0c1a33]/35" aria-hidden />
        <div className="relative flex flex-col gap-5 px-5 py-6 text-white md:flex-row md:items-end md:justify-between md:px-7 md:py-8">
          <div>
            <div className="text-[14px] font-medium text-[#c9d3e3]">영어 학원</div>
            <h2 className="mt-1 text-[28px] font-bold leading-tight">오늘 출결</h2>
            <p className="mt-1 text-[15px] text-white/90">
              {fmtKo(today)}{" "}
              <span className="tabular-nums">
                {hm(nowMin)}:{p2(sec % 60)}
              </span>{" "}
              기준, 전체 {all.total}명
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-2 md:w-[360px]">
            {(
              [
                ["등원", all.inn],
                ["하원", all.out],
                ["미등원", all.none],
              ] as const
            ).map(([label, n]) => (
              <div key={label} className="rounded-[10px] border border-white/20 bg-white/10 px-3 py-2.5">
                <dt className="text-[13px] text-[#c9d3e3]">{label}</dt>
                <dd className="text-[26px] font-bold leading-tight tabular-nums">{n}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="text-[14px] font-bold text-[#2b3a55]">선생님별 보기</div>
        <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5" role="group" aria-label="반 선택">
          <FilterButton wide on={filter === "all"} onClick={() => setFilter("all")} title="전체" sub={`${all.total}명`} c={all}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e7ecf4] text-[#16294a]" aria-hidden>
              <Users size={20} />
            </span>
          </FilterButton>
          {CLASSES.map((c) => (
            <FilterButton
              key={c.id}
              on={filter === c.id}
              onClick={() => setFilter(c.id)}
              title={`${c.teacher.name} 선생님`}
              sub={`${c.name} ${hm(c.start)}`}
              c={counts[c.id]}
            >
              <Photo src={c.teacher.img} alt="" pos={c.teacher.pos} className="h-11 w-11 shrink-0 rounded-full" />
            </FilterButton>
          ))}
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
                const c = classOf(s.cls);
                return (
                  <tr key={s.no} className={`border-t border-[#e8ebf0] ${lastChanged === s.no ? "bg-[#f6fbf8]" : ""}`}>
                    <td className="px-4 py-3 tabular-nums text-[#4a5568]">{s.no}</td>
                    <td className="px-4 py-3 font-bold">
                      {s.name}
                      {lastChanged === s.no && <span className="ml-2 text-[12px] font-medium text-[#0a5c40]">방금 처리</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <Photo src={c.teacher.img} alt="" pos={c.teacher.pos} className="h-6 w-6 shrink-0 rounded-full" />
                        {c.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{r.inAt != null ? hm(r.inAt) : "-"}</td>
                    <td className="px-4 py-3 tabular-nums">{r.outAt != null ? hm(r.outAt) : "-"}</td>
                    <td className="px-4 py-3">
                      <StatusChip chip={chipOf(r)} />
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
            const c = classOf(s.cls);
            return (
              <li key={s.no} className={`rounded-[12px] border border-[#dde2e9] p-4 ${lastChanged === s.no ? "bg-[#f6fbf8]" : "bg-white"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[17px] font-bold">
                      {s.name} <span className="text-[14px] font-medium text-[#5a6577] tabular-nums">{s.no}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[14px] text-[#4a5568]">
                      <Photo src={c.teacher.img} alt="" pos={c.teacher.pos} className="h-5 w-5 shrink-0 rounded-full" />
                      {c.name}
                    </div>
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

// 3D 원장실 책상 모니터용 관리자 화면(1280x720 고정, 보기 전용). 같은 출결 상태를 그대로 보여 준다
function AdminMonitor({ today, sec, recs, lastChanged }: { today: Date; sec: number; recs: Record<string, Rec>; lastChanged: string | null }) {
  const nowMin = Math.floor(sec / 60);
  const count = (list: Student[]) => {
    let inn = 0,
      out = 0,
      none = 0;
    list.forEach((s) => {
      const st = recs[s.no].status;
      if (st === "in") inn++;
      else if (st === "out") out++;
      else none++;
    });
    return { inn, out, none };
  };
  const all = count(STUDENTS);
  const half = Math.ceil(STUDENTS.length / 2);
  const cols = [STUDENTS.slice(0, half), STUDENTS.slice(half)];
  return (
    <div className="flex flex-col bg-white text-[#142340]" style={{ width: 1280, height: 720 }}>
      <div className="flex h-[96px] shrink-0 items-center justify-between bg-[#16294a] px-10 text-white">
        <div>
          <div className="text-[16px] text-[#c9d3e3]">영어 학원 출결 관리</div>
          <div className="text-[34px] font-bold leading-tight">
            오늘 출결 <span className="ml-3 text-[20px] font-medium tabular-nums text-[#c9d3e3]">{fmtKo(today)} {hm(nowMin)}:{p2(sec % 60)} 기준</span>
          </div>
        </div>
        <div className="flex gap-3">
          {(
            [
              ["등원", all.inn, "text-[#8ee0b8]"],
              ["하원", all.out, "text-white"],
              ["미등원", all.none, "text-[#f8c98f]"],
            ] as const
          ).map(([label, n, cls]) => (
            <div key={label} className="w-[120px] rounded-[10px] border border-white/20 bg-white/10 px-4 py-2">
              <div className="text-[15px] text-[#c9d3e3]">{label}</div>
              <div className={`text-[32px] font-bold leading-tight tabular-nums ${cls}`}>{n}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid shrink-0 grid-cols-4 gap-3 px-10 pt-5">
        {CLASSES.map((c) => {
          const n = count(STUDENTS.filter((s) => s.cls === c.id));
          return (
            <div key={c.id} className="flex items-center gap-3 rounded-[12px] border border-[#dde2e9] px-4 py-3">
              <Photo src={c.teacher.img} alt="" pos={c.teacher.pos} className="h-12 w-12 shrink-0 rounded-full" />
              <div className="min-w-0">
                <div className="text-[18px] font-bold leading-tight">{c.name}</div>
                <div className="mt-1 text-[15px] tabular-nums text-[#4a5568]">
                  등원 <b className="text-[#0a5c40]">{n.inn}</b> 하원 <b>{n.out}</b> 미등원 <b>{n.none}</b>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-6 px-10 pb-6 pt-5">
        {cols.map((list, i) => (
          <table key={i} className="w-full self-start text-left text-[19px]">
            <thead className="text-[15px] text-[#5a6577]">
              <tr className="border-b border-[#dde2e9]">
                <th className="py-2 font-medium">이름</th>
                <th className="py-2 font-medium">반</th>
                <th className="py-2 font-medium">등원</th>
                <th className="py-2 font-medium">하원</th>
                <th className="py-2 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const r = recs[s.no];
                return (
                  <tr key={s.no} className={`border-b border-[#eef0f4] ${lastChanged === s.no ? "bg-[#eef8f2]" : ""}`}>
                    <td className="py-[14px] font-bold">{s.name}</td>
                    <td className="py-[14px] text-[#2b3a55]">{classOf(s.cls).name}</td>
                    <td className="py-[14px] tabular-nums">{r.inAt != null ? hm(r.inAt) : "-"}</td>
                    <td className="py-[14px] tabular-nums">{r.outAt != null ? hm(r.outAt) : "-"}</td>
                    <td className="py-[14px]">
                      <StatusChip chip={chipOf(r)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ))}
      </div>
    </div>
  );
}

function FilterButton({
  on,
  onClick,
  title,
  sub,
  c,
  children,
  wide,
}: {
  wide?: boolean;
  on: boolean;
  onClick: () => void;
  title: string;
  sub: string;
  c: { inn: number; out: number; none: number };
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-w-0 rounded-[12px] border p-3 text-left transition-colors ${wide ? "col-span-2 sm:col-span-1" : ""} ${FOCUS} ${
        on ? "border-[#16294a] bg-[#f3f6fb] ring-1 ring-[#16294a]" : "border-[#dde2e9] bg-white hover:border-[#9aa6b8]"
      }`}
    >
      <div className={`flex gap-2.5 ${wide ? "items-center" : "flex-col items-start sm:flex-row sm:items-center"}`}>
        {children}
        <div className="min-w-0">
          <div className="truncate text-[15px] font-bold">{title}</div>
          <div className="truncate text-[13px] tabular-nums text-[#5a6577]">{sub}</div>
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[13px] tabular-nums text-[#4a5568]">
        <span>
          등원 <b className="text-[#0a5c40]">{c.inn}</b>
        </span>
        <span>
          하원 <b className="text-[#1b3359]">{c.out}</b>
        </span>
        <span>
          미등원 <b className="text-[#142340]">{c.none}</b>
        </span>
      </div>
    </button>
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
