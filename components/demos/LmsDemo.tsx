"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Download, Lock, Pause, Play, Printer, RotateCcw, Send, X } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 사내·위탁 이러닝 LMS 데모. 구성은 국내 HRD 이러닝 사이트, 원격평생교육원, 대학 LMS를 따랐다
   (조사 자료 01_Work/03_Resource/benchmark/LMS.md).
   학습자: 나의 강의실(학습중인 과정, 학습종료 과정, 수료증 발급) > 과정 강의실(학습현황, 수료기준, 학습하기, 평가, 공지사항, 학습 Q&A) > 학습창.
   학습창에서는 실제로 재생한 구간만 진도로 친다. 차시 학습시간의 90% 이상이면 학습완료, 앞 차시를 마쳐야 다음 차시가 열린다.
   수료기준은 진도율 80% 이상 + 총점 60점 이상(진행단계평가 30%, 최종평가 70%), 과정 설문 참여 후 수료증 출력.
   관리자: 학습현황관리(검색, 학습독려 SMS, 엑셀 다운로드), 수료관리, 차시별 진도현황(이탈 구간), SMS 발송내역, 과정 목록.
   수강생은 시드 고정 난수로 만든 가상 데이터다(서버와 브라우저 결과가 같다). */

const C = {
  bg: "#f6f3ec",
  surface: "#ffffff",
  head: "#f1ede4",
  line: "#e4ded2",
  text: "#1f2421",
  muted: "#56605a",
  brand: "#1f5f46",
  brandSoft: "#e5f0ea",
  accent: "#c2410c",
  warn: "#9a3412",
  warnSoft: "#fdecdf",
  dark: "#16211c",
} as const;

const EASE = [0.23, 1, 0.32, 1] as const;
const STORAGE_KEY = "gs-demo:lms:v2";
const DONE_RATIO = 0.9;
const PASS_PROGRESS = 80;
const PASS_TOTAL = 60;
const MID_WEIGHT = 0.3;
const FINAL_WEIGHT = 0.7;
const ME = { id: "me", name: "김하늘", dept: "인사팀" };

const COURSE = {
  title: "엑셀 실무 기초",
  term: "2026년 10월 1기",
  period: "2026.09.28 ~ 2026.10.27",
  review: "2026.10.28 ~ 2027.01.27",
  dday: 20,
  teacher: "박서영",
};
const TODAY = "2026.10.07";

interface Lesson {
  title: string;
  duration: number;
  pages: string[];
}
const LESSONS: Lesson[] = [
  { title: "엑셀 화면 구성과 데이터 입력", duration: 1120, pages: ["리본 메뉴와 시트 구성", "셀 이동 단축키", "자동 채우기", "데이터 유효성 검사"] },
  { title: "셀 서식과 표시 형식", duration: 1275, pages: ["글꼴과 맞춤", "숫자 표시 형식", "날짜와 시간 형식", "사용자 지정 형식"] },
  { title: "SUM, AVERAGE 함수와 참조", duration: 1470, pages: ["함수 입력 방법", "SUM으로 합계 구하기", "AVERAGE와 ROUND", "상대참조와 절대참조"] },
  { title: "IF 함수와 조건부 서식", duration: 1565, pages: ["IF 함수 구조", "중첩 IF와 IFS", "조건부 서식 규칙", "실습: 미납자 표시"] },
  { title: "VLOOKUP으로 표 합치기", duration: 1670, pages: ["VLOOKUP 인수", "정확히 일치 찾기", "#N/A 오류 처리", "실습: 단가표 붙이기"] },
  { title: "정렬과 필터", duration: 1160, pages: ["오름차순, 내림차순 정렬", "사용자 지정 정렬", "자동 필터", "고급 필터"] },
  { title: "피벗 테이블로 요약하기", duration: 1545, pages: ["피벗 테이블 만들기", "행, 열, 값 배치", "필터와 슬라이서", "실습: 월별 매출 요약"] },
  { title: "차트 만들기와 인쇄 설정", duration: 1330, pages: ["차트 종류 고르기", "차트 요소 편집", "페이지 레이아웃", "인쇄 영역 설정"] },
];
const TOTAL_MIN = Math.round(LESSONS.reduce((s, l) => s + l.duration, 0) / 60);

interface Question {
  q: string;
  options: string[];
  answer: number;
}
const MID_QUIZ: Question[] = [
  { q: "여러 셀의 합계를 구하는 함수는?", options: ["SUM", "COUNT", "IF"], answer: 0 },
  { q: "수식을 복사해도 참조 셀이 바뀌지 않게 하는 기호는?", options: ["#", "$", "@"], answer: 1 },
  { q: '=IF(A1>=60,"합격","불합격")에서 A1이 59일 때 결과는?', options: ["합격", "불합격", "0"], answer: 1 },
];
const FINAL_QUIZ: Question[] = [
  { q: "다른 표에서 값을 찾아 가져올 때 쓰는 함수는?", options: ["VLOOKUP", "AVERAGE", "ROUND"], answer: 0 },
  { q: "VLOOKUP에서 정확히 일치하는 값을 찾을 때 마지막 인수는?", options: ["TRUE", "FALSE", "1"], answer: 1 },
  { q: "많은 데이터를 항목별로 요약할 때 쓰는 기능은?", options: ["피벗 테이블", "틀 고정", "메모"], answer: 0 },
  { q: "조건에 맞는 셀의 개수를 세는 함수는?", options: ["COUNTIF", "SUMIF", "MAX"], answer: 0 },
  { q: "필터를 적용했을 때 조건에 맞지 않는 행은?", options: ["삭제됨", "숨겨짐", "맨 아래로 이동"], answer: 1 },
];
const SURVEY = ["교육 내용에 만족한다", "교육 내용이 업무에 도움이 된다", "학습 사이트 이용이 편리하다"];
const SCALE = ["매우 그렇다", "그렇다", "보통이다", "그렇지 않다", "전혀 그렇지 않다"];

const NOTICES = [
  {
    title: "[필독] 수료기준 및 학습 유의사항",
    date: "2026.09.28",
    body: [
      "진도율 80% 이상, 총점 60점 이상 시 수료됩니다.",
      "차시별 학습시간의 90% 이상 학습해야 학습완료로 인정됩니다.",
      "진행단계평가는 진도율 50% 이상, 최종평가는 진도율 80% 이상 학습 후 응시할 수 있습니다.",
      "평가는 1회만 응시할 수 있습니다.",
      "복습기간에는 진도율에 반영되지 않습니다.",
    ],
  },
  { title: "모사답안 처리 기준 안내", date: "2026.09.28", body: ["모사답안으로 확인된 경우 0점 처리되며 미수료됩니다."] },
  { title: "학습지원센터 운영시간 안내", date: "2026.09.25", body: ["평일 09:00~18:00 (점심시간 12:00~13:00)", "주말 및 공휴일 휴무", "전화 02-000-0000"] },
];

interface Qna {
  title: string;
  writer: string;
  date: string;
  answered: boolean;
}
const QNA: Qna[] = [
  { title: "피벗 테이블 새로 고침이 안 됩니다", writer: "정도윤", date: "2026.10.06", answered: false },
  { title: "VLOOKUP 결과가 #N/A로 나옵니다", writer: "이서준", date: "2026.10.02", answered: true },
  { title: "실습 파일은 어디서 받나요?", writer: "최유나", date: "2026.09.29", answered: true },
];

/* ---------- 진도 계산 ---------- */

type Seg = [number, number];
interface Progress {
  pos: number;
  segs: Seg[];
}
interface SmsLog {
  at: string;
  kind: string;
  type: "SMS" | "LMS";
  count: number;
  text: string;
}
interface State {
  lessons: Progress[];
  mid: number | null;
  final: number | null;
  survey: boolean;
  qna: Qna[];
  sms: SmsLog[];
  confirmed: Record<string, string>;
}

const SMS_TEMPLATES = [
  {
    kind: "학습독려",
    text: "[곰파트너 아카데미] {이름}님, 엑셀 실무 기초 현재 진도율은 {진도율}입니다. 학습종료일 10월 27일까지 진도율 80% 이상 학습하셔야 수료됩니다.",
  },
  {
    kind: "평가 안내",
    text: "[곰파트너 아카데미] {이름}님, 엑셀 실무 기초 최종평가 응시가 가능합니다. 학습종료일 10월 27일까지 응시하셔야 수료됩니다.",
  },
];

const initialState: State = {
  // 1~5차시는 학습완료, 6차시는 중간까지 본 상태로 시작한다 (이어보기가 보이도록)
  lessons: LESSONS.map((l, i) => (i < 5 ? { pos: l.duration, segs: [[0, l.duration]] } : i === 5 ? { pos: 418, segs: [[0, 418]] } : { pos: 0, segs: [] })),
  mid: null,
  final: null,
  survey: false,
  qna: [],
  sms: [
    { at: "2026.10.05 10:00", kind: "학습독려", type: "LMS", count: 52, text: SMS_TEMPLATES[0].text },
    { at: "2026.09.28 09:00", kind: "개강 안내", type: "LMS", count: 143, text: "[곰파트너 아카데미] {이름}님, 엑셀 실무 기초 2026년 10월 1기 학습이 시작되었습니다. 학습기간 09.28 ~ 10.27" },
  ],
  confirmed: {},
};

function merge(segs: Seg[]): Seg[] {
  const s = [...segs].sort((a, b) => a[0] - b[0]);
  const out: Seg[] = [];
  for (const [a, b] of s) {
    const last = out[out.length - 1];
    if (last && a <= last[1] + 0.5) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}
const watched = (segs: Seg[]) => segs.reduce((t, [a, b]) => t + (b - a), 0);
const ratio = (p: Progress, l: Lesson) => Math.min(1, watched(p.segs) / l.duration);
const totalScore = (mid: number | null, fin: number | null) => Math.round((mid ?? 0) * MID_WEIGHT + (fin ?? 0) * FINAL_WEIGHT);
const pct = (n: number) => (Number.isInteger(n) ? `${n}%` : `${n.toFixed(1)}%`);
const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// 이름 가운데 글자를 초성으로 가린다 (김하늘 → 김ㅎ늘, 2글자는 김*)
const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
function maskName(name: string) {
  if (name.length < 3) return name[0] + "*";
  const code = name.charCodeAt(1) - 0xac00;
  return name[0] + (code >= 0 && code < 11172 ? CHO[Math.floor(code / 588)] : "*") + name.slice(2);
}
// 문자 바이트 (한글 2byte, 90byte 넘으면 LMS)
const smsBytes = (s: string) => [...s].reduce((n, ch) => n + (ch.charCodeAt(0) > 127 ? 2 : 1), 0);
const certNo = (index: number) => `2026-10-${String(index + 1).padStart(3, "0")}`;

/* ---------- 관리자 화면 가상 수강생 ---------- */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Learner {
  id: string;
  index: number;
  name: string;
  dept: string;
  done: number;
  lessonPct: number[];
  last: number | null;
  mid: number | null;
  final: number | null;
  confirmedAt: string | null;
}

const DEPTS = ["생산1팀", "생산2팀", "품질관리팀", "영업팀", "구매팀", "총무팀", "회계팀", "물류팀", "기술연구소", "고객지원팀"];
const LEARNERS: Learner[] = (() => {
  const rand = mulberry32(20260928);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  // 실제 성씨 비율에 가깝게 김, 이, 박을 여러 번 넣었다
  const sur = "김김김김김김김김김김이이이이이이이박박박박최최최정정정강강조조윤윤장장임임한오서신권황안송류홍전고문양손배백허".split("");
  const given = ["지우", "서준", "하은", "민준", "서연", "도윤", "예린", "시우", "유나", "준호", "소율", "태민", "지민", "하준", "수아", "현우", "다은", "건우", "채원", "은우", "지아", "승현", "유진", "재원", "나연", "동현", "수빈", "민재", "혜진", "성민", "가은", "우진", "보람", "정훈", "미경", "상우", "은지", "영호", "선영", "진혁"];
  const out: Learner[] = [];
  for (let i = 0; i < 142; i++) {
    const r = rand();
    const done = r < 0.11 ? 0 : r < 0.3 ? 1 + Math.floor(rand() * 2) : r < 0.55 ? 3 + Math.floor(rand() * 2) : r < 0.77 ? 5 + Math.floor(rand() * 2) : 7 + Math.floor(rand() * 2);
    const partial = done < LESSONS.length && (done > 0 || rand() < 0.4) ? 5 + Math.floor(rand() * 80) : 0;
    const lessonPct = LESSONS.map((_, k) => (k < done ? 100 : k === done ? partial : 0));
    const studied = done > 0 || partial > 0;
    const last = studied ? (done >= 7 ? Math.floor(rand() * 5) : Math.floor(rand() * 10)) : null;
    const mid = done >= 4 && rand() < 0.78 ? pick([60, 70, 70, 80, 80, 90, 100]) : null;
    const fin = done >= 7 && rand() < 0.62 ? pick([40, 50, 60, 70, 75, 80, 85, 90, 95, 100]) : null;
    const meets = (done / LESSONS.length) * 100 >= PASS_PROGRESS && fin !== null && totalScore(mid, fin) >= PASS_TOTAL;
    out.push({
      id: `u${i}`,
      index: i,
      name: pick(sur) + pick(given),
      dept: pick(DEPTS),
      done,
      lessonPct,
      last,
      mid,
      final: fin,
      confirmedAt: meets && rand() < 0.55 ? pick(["2026.10.05", "2026.10.06"]) : null,
    });
  }
  return out;
})();

// 차시별로 영상 구간(10칸)마다 남아 있던 수강생 비율 (%)
const DROPOFF = [
  [100, 98, 97, 96, 95, 94, 93, 93, 92, 91],
  [100, 97, 95, 94, 92, 91, 89, 88, 88, 87],
  [100, 96, 93, 91, 89, 86, 80, 78, 77, 76],
  [100, 97, 93, 85, 71, 67, 65, 64, 63, 62],
  [100, 95, 90, 84, 79, 74, 59, 56, 55, 53],
  [100, 98, 96, 95, 93, 92, 91, 90, 89, 89],
  [100, 96, 92, 88, 85, 83, 81, 72, 70, 69],
  [100, 97, 95, 93, 91, 89, 88, 87, 86, 85],
];

const lastDate = (d: number | null) => (d === null ? "-" : d <= 6 ? `2026.10.0${7 - d}` : `2026.09.${30 - (d - 7)}`);

/* ---------- 공통 스타일 ---------- */

const btnBase = "inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] px-3 text-[14px] font-bold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40";
const btnPrimary = { background: C.brand, color: "#fff" };
const btnLine = { border: `1px solid ${C.line}`, background: "#fff", color: C.text };
const th = "px-3 py-2.5 text-left text-[14px] font-bold whitespace-nowrap";
const td = "px-3 py-2.5 whitespace-nowrap";

function Panel({ title, id, right, children }: { title: string; id: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-md border bg-white" style={{ borderColor: C.line }}>
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3" style={{ borderColor: C.line }}>
        <h2 id={id} className="mr-auto text-[17px] font-bold">
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Bar({ value, color = C.brand }: { value: number; color?: string }) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-[2px]" style={{ background: C.head }}>
      <span className="block h-full" style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </span>
  );
}

function SideNav<T extends string>({ title, items, current, onSelect, label }: { title: string; items: [T, string][]; current: T; onSelect: (id: T) => void; label: string }) {
  return (
    <nav aria-label={label} className="rounded-md border bg-white lg:self-start" style={{ borderColor: C.line }}>
      <p className="border-b px-4 py-3 text-[16px] font-bold text-white" style={{ background: C.brand, borderColor: C.brand }}>
        {title}
      </p>
      <ul className="flex flex-wrap lg:block">
        {items.map(([id, text]) => (
          <li key={id} className="lg:border-b last:border-b-0" style={{ borderColor: C.line }}>
            <button
              type="button"
              aria-current={current === id ? "page" : undefined}
              onClick={() => onSelect(id)}
              className="w-full px-4 py-2.5 text-left text-[15px]"
              style={current === id ? { color: C.brand, fontWeight: 700, background: C.brandSoft } : { color: C.text }}
            >
              {text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------- 루트 ---------- */

export function LmsDemo() {
  const reduce = useReducedMotionSafe();
  const [state, setState, hydrated] = useLocalStorage<State>(STORAGE_KEY, initialState);
  const [view, setView] = useState<"learner" | "admin">("learner");
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const notify = useCallback((text: string) => setToast((t) => ({ id: (t?.id ?? 0) + 1, text })), []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const ratios = state.lessons.map((p, i) => ratio(p, LESSONS[i]));
  const done = ratios.map((r) => r >= DONE_RATIO);
  const doneCount = done.filter(Boolean).length;
  const progress = (doneCount / LESSONS.length) * 100;

  return (
    <div className="min-h-screen pb-24" style={{ background: C.bg, color: C.text }}>
      <header className="border-b bg-white" style={{ borderColor: C.line }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 md:px-6">
          <p className="mr-auto flex items-center gap-2" style={{ color: C.brand }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.svg" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
            <span className="sr-only">곰파트너 아카데미</span>
            <span aria-hidden className="flex items-baseline gap-1 whitespace-nowrap">
              <span className="text-[18px] font-bold">곰파트너</span>
              <span className="text-[11px] font-bold opacity-80">아카데미</span>
            </span>
          </p>
          <div role="tablist" aria-label="화면 선택" className="relative flex rounded-[4px] border p-0.5" style={{ borderColor: C.line }}>
            {(
              [
                ["learner", "나의 강의실"],
                ["admin", "관리자"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={view === id}
                onClick={() => setView(id)}
                className="relative rounded-[3px] px-3.5 py-1.5 text-[14px] font-bold"
                style={{ color: view === id ? "#fff" : C.muted }}
              >
                {view === id && (
                  <motion.span layoutId="lms-view" className="absolute inset-0 rounded-[3px]" style={{ background: C.brand }} transition={reduce ? { duration: 0 } : { duration: 0.25, ease: EASE }} />
                )}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setState(initialState);
              notify("초기화했습니다.");
            }}
            aria-label="초기화"
            className="inline-flex items-center gap-1 rounded-[4px] px-2 py-1.5 text-[14px] font-bold"
            style={{ color: C.muted }}
          >
            <RotateCcw size={14} aria-hidden />
            <span className="hidden sm:inline">초기화</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 pt-5 md:px-6" aria-busy={!hydrated}>
        {view === "learner" ? (
          <LearnerView state={state} setState={setState} ratios={ratios} done={done} progress={progress} notify={notify} />
        ) : (
          <AdminView state={state} setState={setState} myProgress={progress} myDone={done} notify={notify} />
        )}
      </main>

      <p role="status" aria-live="polite" className="sr-only">
        {toast?.text}
      </p>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4" aria-hidden>
        <AnimatePresence>
          {toast && (
            <motion.p
              key={toast.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE }}
              className="max-w-[520px] rounded-md px-5 py-3 text-[15px] font-bold text-white"
              style={{ background: C.text }}
            >
              {toast.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

type SetState = (updater: State | ((prev: State) => State)) => void;

/* ---------- 학습자: 나의 강의실 ---------- */

type LearnerPage = "ongoing" | "ended" | "cert";
type RoomTab = "study" | "exam" | "notice" | "qna";
interface CertInfo {
  no: string;
  course: string;
  period: string;
  hours: string;
  date: string;
}

function LearnerView({ state, setState, ratios, done, progress, notify }: { state: State; setState: SetState; ratios: number[]; done: boolean[]; progress: number; notify: (t: string) => void }) {
  const [page, setPage] = useState<LearnerPage>("ongoing");
  const [inRoom, setInRoom] = useState(true);
  const [tab, setTab] = useState<RoomTab>("study");
  const [player, setPlayer] = useState<number | null>(null);
  const [cert, setCert] = useState<CertInfo | null>(null);

  const total = totalScore(state.mid, state.final);
  const passed = progress >= PASS_PROGRESS && state.final !== null && total >= PASS_TOTAL;
  const myCert: CertInfo = { no: certNo(LEARNERS.length), course: COURSE.title, period: COURSE.period, hours: `${Math.floor(TOTAL_MIN / 60)}시간 ${TOTAL_MIN % 60}분`, date: "2026년 10월 7일" };
  const pastCert: CertInfo = { no: "2026-07-288", course: "직장 내 괴롭힘 예방교육", period: "2026.07.01 ~ 2026.09.30", hours: "1시간", date: "2026년 8월 12일" };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
      <SideNav<LearnerPage>
        title="나의 강의실"
        label="나의 강의실 메뉴"
        items={[
          ["ongoing", "학습중인 과정"],
          ["ended", "학습종료 과정"],
          ["cert", "수료증 발급"],
        ]}
        current={page}
        onSelect={(id) => {
          setPage(id);
          setInRoom(false);
        }}
      />

      <div className="min-w-0">
        {page === "ongoing" && !inRoom && (
          <Panel title="학습중인 과정" id="ongoing-title">
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[640px] text-[15px]">
                <thead style={{ background: C.head }}>
                  <tr>
                    <th scope="col" className={th}>과정명</th>
                    <th scope="col" className={th}>학습기간</th>
                    <th scope="col" className={th}>진도율</th>
                    <th scope="col" className={th}>총점</th>
                    <th scope="col" className={th}>수료여부</th>
                    <th scope="col" className={th}><span className="sr-only">강의실</span></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t" style={{ borderColor: C.line }}>
                    <td className={`${td} font-bold`}>{COURSE.title}</td>
                    <td className={`${td} tabular-nums`}>{COURSE.period}</td>
                    <td className={`${td} tabular-nums`}>{pct(progress)}</td>
                    <td className={`${td} tabular-nums`}>{state.final === null ? "-" : `${total}점`}</td>
                    <td className={td}>{passed ? "수료" : state.final !== null ? "미수료" : "학습중"}</td>
                    <td className={td}>
                      <button type="button" onClick={() => setInRoom(true)} className={btnBase} style={btnPrimary}>
                        강의실 입장
                      </button>
                    </td>
                  </tr>
                  <tr className="border-t" style={{ borderColor: C.line }}>
                    <td className={`${td} font-bold`}>비즈니스 문서 작성</td>
                    <td className={`${td} tabular-nums`}>2026.10.19 ~ 2026.11.17</td>
                    <td className={`${td} tabular-nums`}>0%</td>
                    <td className={td}>-</td>
                    <td className={td}>학습대기</td>
                    <td className={td}>
                      <button type="button" disabled className={btnBase} style={btnLine}>
                        강의실 입장
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {page === "ongoing" && inRoom && (
          <CourseRoom
            state={state}
            setState={setState}
            ratios={ratios}
            done={done}
            progress={progress}
            total={total}
            passed={passed}
            tab={tab}
            setTab={setTab}
            onBack={() => setInRoom(false)}
            onPlay={setPlayer}
            onCert={() => setCert(myCert)}
            notify={notify}
          />
        )}

        {page === "ended" && (
          <Panel title="학습종료 과정" id="ended-title">
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[620px] text-[15px]">
                <thead style={{ background: C.head }}>
                  <tr>
                    <th scope="col" className={th}>과정명</th>
                    <th scope="col" className={th}>학습기간</th>
                    <th scope="col" className={th}>진도율</th>
                    <th scope="col" className={th}>총점</th>
                    <th scope="col" className={th}>수료여부</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["직장 내 괴롭힘 예방교육", "2026.07.01 ~ 2026.09.30", "100%", "92점", "수료"],
                    ["개인정보보호 교육", "2026.04.01 ~ 2026.06.30", "66.7%", "-", "미수료"],
                    ["산업안전보건 교육(상반기)", "2026.01.02 ~ 2026.06.30", "100%", "85점", "수료"],
                  ].map((r) => (
                    <tr key={r[0]} className="border-t" style={{ borderColor: C.line }}>
                      <td className={`${td} font-bold`}>{r[0]}</td>
                      <td className={`${td} tabular-nums`}>{r[1]}</td>
                      <td className={`${td} tabular-nums`}>{r[2]}</td>
                      <td className={`${td} tabular-nums`}>{r[3]}</td>
                      <td className={td} style={{ color: r[4] === "미수료" ? C.warn : C.text }}>
                        {r[4]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}

        {page === "cert" && (
          <Panel title="수료증 발급" id="cert-title">
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[620px] text-[15px]">
                <thead style={{ background: C.head }}>
                  <tr>
                    <th scope="col" className={th}>과정명</th>
                    <th scope="col" className={th}>학습기간</th>
                    <th scope="col" className={th}>수료번호</th>
                    <th scope="col" className={th}>수료증</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t" style={{ borderColor: C.line }}>
                    <td className={`${td} font-bold`}>{COURSE.title}</td>
                    <td className={`${td} tabular-nums`}>{COURSE.period}</td>
                    <td className={`${td} tabular-nums`}>{passed ? myCert.no : "-"}</td>
                    <td className={td}>
                      {!passed ? (
                        <span style={{ color: C.muted }}>미수료</span>
                      ) : state.survey ? (
                        <button type="button" onClick={() => setCert(myCert)} className={btnBase} style={btnPrimary}>
                          <Printer size={15} aria-hidden />
                          출력
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setPage("ongoing");
                            setInRoom(true);
                            setTab("exam");
                          }}
                          className={btnBase}
                          style={btnLine}
                        >
                          설문 참여
                        </button>
                      )}
                    </td>
                  </tr>
                  <tr className="border-t" style={{ borderColor: C.line }}>
                    <td className={`${td} font-bold`}>{pastCert.course}</td>
                    <td className={`${td} tabular-nums`}>{pastCert.period}</td>
                    <td className={`${td} tabular-nums`}>{pastCert.no}</td>
                    <td className={td}>
                      <button type="button" onClick={() => setCert(pastCert)} className={btnBase} style={btnPrimary}>
                        <Printer size={15} aria-hidden />
                        출력
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>

      <AnimatePresence>
        {player !== null && (
          <Player key="player" index={player} state={state} setState={setState} ratios={ratios} done={done} onChange={setPlayer} onClose={() => setPlayer(null)} notify={notify} />
        )}
      </AnimatePresence>
      <AnimatePresence>{cert && <Certificate key="cert" info={cert} onClose={() => setCert(null)} />}</AnimatePresence>
    </div>
  );
}

/* ---------- 학습자: 과정 강의실 ---------- */

function CourseRoom({
  state,
  setState,
  ratios,
  done,
  progress,
  total,
  passed,
  tab,
  setTab,
  onBack,
  onPlay,
  onCert,
  notify,
}: {
  state: State;
  setState: SetState;
  ratios: number[];
  done: boolean[];
  progress: number;
  total: number;
  passed: boolean;
  tab: RoomTab;
  setTab: (t: RoomTab) => void;
  onBack: () => void;
  onPlay: (k: number) => void;
  onCert: () => void;
  notify: (t: string) => void;
}) {
  const reduce = useReducedMotionSafe();
  const resumeAt = state.lessons.findIndex((p, k) => !done[k] && p.pos > 5);
  const tabs: [RoomTab, string][] = [
    ["study", "학습하기"],
    ["exam", "평가"],
    ["notice", "공지사항"],
    ["qna", "학습 Q&A"],
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      <nav aria-label="현재 위치" className="flex items-center gap-1 text-[14px]" style={{ color: C.muted }}>
        <button type="button" onClick={onBack} className="underline-offset-2 hover:underline">
          학습중인 과정
        </button>
        <ChevronRight size={14} aria-hidden />
        <span style={{ color: C.text }}>{COURSE.title}</span>
      </nav>

      <section aria-labelledby="room-title" className="rounded-md border bg-white" style={{ borderColor: C.line }}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b px-4 py-3" style={{ borderColor: C.line }}>
          <h2 id="room-title" className="text-[20px] font-bold">
            {COURSE.title}
          </h2>
          <span className="text-[14px]" style={{ color: C.muted }}>
            {COURSE.term}
          </span>
        </div>
        <dl className="grid gap-x-6 gap-y-1.5 px-4 py-3 text-[15px] sm:grid-cols-2">
          {[
            ["학습기간", `${COURSE.period} (D-${COURSE.dday})`],
            ["복습기간", COURSE.review],
            ["강사", maskName(COURSE.teacher)],
            ["교육시간", `${LESSONS.length}차시 (${Math.floor(TOTAL_MIN / 60)}시간 ${TOTAL_MIN % 60}분)`],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <dt className="w-16 shrink-0" style={{ color: C.muted }}>
                {k}
              </dt>
              <dd className="tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="relative overflow-x-auto border-t" style={{ borderColor: C.line }}>
          <table className="w-full min-w-[600px] text-center text-[15px]">
            <caption className="sr-only">학습현황과 수료기준</caption>
            <thead style={{ background: C.head }}>
              <tr>
                <th scope="col" className="px-3 py-2 font-bold">구분</th>
                <th scope="col" className="px-3 py-2 font-bold">진도율</th>
                <th scope="col" className="px-3 py-2 font-bold">진행단계평가</th>
                <th scope="col" className="px-3 py-2 font-bold">최종평가</th>
                <th scope="col" className="px-3 py-2 font-bold">총점</th>
                <th scope="col" className="px-3 py-2 font-bold">수료여부</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              <tr className="border-t" style={{ borderColor: C.line }}>
                <th scope="row" className="px-3 py-2 font-bold" style={{ color: C.muted }}>
                  수료기준
                </th>
                <td className="px-3 py-2">{PASS_PROGRESS}% 이상</td>
                <td className="px-3 py-2">반영비율 {MID_WEIGHT * 100}%</td>
                <td className="px-3 py-2">반영비율 {FINAL_WEIGHT * 100}%</td>
                <td className="px-3 py-2">{PASS_TOTAL}점 이상</td>
                <td className="px-3 py-2">-</td>
              </tr>
              <tr className="border-t" style={{ borderColor: C.line }}>
                <th scope="row" className="px-3 py-2 font-bold" style={{ color: C.muted }}>
                  내 현황
                </th>
                <td className="px-3 py-2 font-bold" style={{ color: progress >= PASS_PROGRESS ? C.brand : C.text }}>
                  {pct(progress)}
                </td>
                <td className="px-3 py-2">{state.mid === null ? "미응시" : `${state.mid}점`}</td>
                <td className="px-3 py-2">{state.final === null ? "미응시" : `${state.final}점`}</td>
                <td className="px-3 py-2 font-bold" style={{ color: total >= PASS_TOTAL ? C.brand : C.text }}>
                  {total}점
                </td>
                <td className="px-3 py-2">
                  {passed ? (
                    <span className="inline-flex items-center gap-2">
                      <b style={{ color: C.brand }}>수료</b>
                      <button type="button" onClick={state.survey ? onCert : () => setTab("exam")} className={`${btnBase} h-8 px-2.5 text-[13px]`} style={state.survey ? btnPrimary : btnLine}>
                        {state.survey ? "수료증 출력" : "설문 참여"}
                      </button>
                    </span>
                  ) : state.final !== null ? (
                    <b style={{ color: C.warn }}>미수료</b>
                  ) : (
                    "학습중"
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-md border bg-white" style={{ borderColor: C.line }}>
        <div role="tablist" aria-label="강의실 메뉴" className="flex border-b" style={{ borderColor: C.line }}>
          {tabs.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              type="button"
              id={`room-tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`room-panel-${id}`}
              onClick={() => setTab(id)}
              className="relative flex-1 px-2 py-3 text-[15px] font-bold sm:flex-none sm:px-5"
              style={{ color: tab === id ? C.brand : C.muted }}
            >
              {label}
              {tab === id && (
                <motion.span layoutId="lms-room-tab" className="absolute inset-x-0 -bottom-px h-[3px]" style={{ background: C.brand }} transition={reduce ? { duration: 0 } : { duration: 0.22, ease: EASE }} />
              )}
            </button>
          ))}
        </div>

        {tab === "study" && (
          <section id="room-panel-study" role="tabpanel" aria-label="강의 보기">
            <div className="hidden grid-cols-[64px_minmax(0,1fr)_88px_150px_96px] border-b text-[14px] font-bold md:grid" style={{ borderColor: C.line, background: C.head }}>
              <span className="px-3 py-2.5">차시</span>
              <span className="px-3 py-2.5">차시명</span>
              <span className="px-3 py-2.5">학습시간</span>
              <span className="px-3 py-2.5">진도율</span>
              <span className="px-3 py-2.5">
                <span className="sr-only">학습</span>
              </span>
            </div>
            <ol>
              {LESSONS.map((l, k) => {
                const locked = k > 0 && !done[k - 1];
                const r = Math.round(ratios[k] * 100);
                const isResume = k === resumeAt;
                return (
                  <li key={l.title} className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center border-b last:border-b-0 md:grid-cols-[64px_minmax(0,1fr)_88px_150px_96px]" style={{ borderColor: C.line }}>
                    <span className="px-3 py-3 text-[14px] font-bold tabular-nums" style={{ color: C.muted }}>
                      {String(k + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 px-1 py-3 md:px-3">
                      <span className="flex items-center gap-1.5 text-[15px] font-bold">
                        <span className="truncate">{l.title}</span>
                        <AnimatePresence initial={false}>
                          {done[k] && (
                            <motion.span
                              key="ok"
                              initial={reduce ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 500, damping: 22 }}
                              className="shrink-0"
                              style={{ color: C.brand }}
                            >
                              <Check size={16} aria-label="학습완료" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-[13px] tabular-nums md:hidden" style={{ color: C.muted }}>
                        <span>{clock(l.duration)}</span>
                        <span>진도율 {r}%</span>
                      </span>
                    </span>
                    <span className="hidden px-3 text-[14px] tabular-nums md:block" style={{ color: C.muted }}>
                      {clock(l.duration)}
                    </span>
                    <span className="hidden items-center gap-2 px-3 md:flex">
                      <Bar value={r} />
                      <span className="w-10 shrink-0 text-right text-[14px] tabular-nums">{r}%</span>
                    </span>
                    <span className="px-3 py-2">
                      {locked ? (
                        <button type="button" disabled className={`${btnBase} w-full`} style={btnLine} aria-label={`${k + 1}차시 학습하기 (이전 차시 학습 후 가능)`}>
                          <Lock size={14} aria-hidden />
                          학습하기
                        </button>
                      ) : (
                        <button type="button" onClick={() => onPlay(k)} className={`${btnBase} w-full`} style={isResume ? { background: C.accent, color: "#fff" } : done[k] ? btnLine : btnPrimary}>
                          {isResume ? "이어보기" : done[k] ? "복습하기" : "학습하기"}
                        </button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {tab === "exam" && <ExamTab state={state} setState={setState} progress={progress} notify={notify} />}

        {tab === "notice" && <NoticeTab />}

        {tab === "qna" && <QnaTab state={state} setState={setState} notify={notify} />}
      </section>
    </div>
  );
}

/* ---------- 학습자: 평가 ---------- */

function ExamTab({ state, setState, progress, notify }: { state: State; setState: SetState; progress: number; notify: (t: string) => void }) {
  const [mode, setMode] = useState<"list" | "mid" | "final" | "survey">("list");
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  const start = (m: "mid" | "final" | "survey") => {
    setMode(m);
    setAnswers((m === "mid" ? MID_QUIZ : m === "final" ? FINAL_QUIZ : SURVEY).map(() => null));
  };

  const rows: { key: "mid" | "final" | "survey"; name: string; cond: string; weight: string; ok: boolean; score: string; taken: boolean }[] = [
    { key: "mid", name: "진행단계평가", cond: "진도율 50% 이상", weight: `${MID_WEIGHT * 100}%`, ok: progress >= 50, score: state.mid === null ? "-" : `${state.mid}점`, taken: state.mid !== null },
    { key: "final", name: "최종평가", cond: `진도율 ${PASS_PROGRESS}% 이상`, weight: `${FINAL_WEIGHT * 100}%`, ok: progress >= PASS_PROGRESS, score: state.final === null ? "-" : `${state.final}점`, taken: state.final !== null },
    { key: "survey", name: "과정 설문", cond: "최종평가 응시 후", weight: "-", ok: state.final !== null, score: state.survey ? "참여완료" : "-", taken: state.survey },
  ];

  if (mode !== "list") {
    const isSurvey = mode === "survey";
    const quiz = mode === "mid" ? MID_QUIZ : FINAL_QUIZ;
    const name = mode === "mid" ? "진행단계평가" : mode === "final" ? "최종평가" : "과정 설문";
    const submit = () => {
      if (isSurvey) {
        setState((s) => ({ ...s, survey: true }));
        const passed = progress >= PASS_PROGRESS && state.final !== null && totalScore(state.mid, state.final) >= PASS_TOTAL;
        notify(passed ? "설문을 제출했습니다. 수료증 출력이 가능합니다." : "설문을 제출했습니다.");
      } else {
        const score = Math.round((answers.filter((a, k) => a === quiz[k].answer).length / quiz.length) * 100);
        setState((s) => (mode === "mid" ? { ...s, mid: score } : { ...s, final: score }));
        notify(`${name}을 제출했습니다. 점수 ${score}점`);
      }
      setMode("list");
    };
    return (
      <div id="room-panel-exam" role="tabpanel" aria-labelledby="room-tab-exam" className="p-4">
        <div className="flex flex-wrap items-center gap-2 border-b pb-3" style={{ borderColor: C.line }}>
          <h3 className="mr-auto text-[17px] font-bold">{name}</h3>
          {!isSurvey && (
            <span className="text-[14px]" style={{ color: C.muted }}>
              {quiz.length}문항, 1회만 응시할 수 있습니다.
            </span>
          )}
        </div>
        <ol className="mt-4 grid gap-5">
          {(isSurvey ? SURVEY : quiz.map((q) => q.q)).map((q, k) => {
            const options = isSurvey ? SCALE : quiz[k].options;
            return (
              <li key={q}>
                <fieldset>
                  <legend className="text-[16px] font-bold">
                    {k + 1}. {q}
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {options.map((o, oi) => (
                      <label
                        key={o}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-[4px] border px-3 py-2 text-[15px]"
                        style={{ borderColor: answers[k] === oi ? C.brand : C.line, background: answers[k] === oi ? C.brandSoft : "#fff" }}
                      >
                        <input type="radio" name={`${mode}-${k}`} checked={answers[k] === oi} onChange={() => setAnswers((a) => a.map((x, j) => (j === k ? oi : x)))} className="accent-[#1f5f46]" />
                        {o}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </li>
            );
          })}
        </ol>
        <div className="mt-5 flex gap-2">
          <button type="button" disabled={answers.some((a) => a === null)} onClick={submit} className={`${btnBase} h-11 px-5`} style={btnPrimary}>
            제출
          </button>
          <button type="button" onClick={() => setMode("list")} className={`${btnBase} h-11 px-5`} style={btnLine}>
            목록
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="room-panel-exam" role="tabpanel" aria-labelledby="room-tab-exam" className="relative overflow-x-auto">
      <table className="w-full min-w-[620px] text-[15px]">
        <thead style={{ background: C.head }}>
          <tr>
            <th scope="col" className={th}>구분</th>
            <th scope="col" className={th}>응시조건</th>
            <th scope="col" className={th}>반영비율</th>
            <th scope="col" className={th}>응시기간</th>
            <th scope="col" className={th}>점수</th>
            <th scope="col" className={th}><span className="sr-only">응시</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t" style={{ borderColor: C.line }}>
              <td className={`${td} font-bold`}>{r.name}</td>
              <td className={td} style={{ color: r.ok ? C.text : C.muted }}>
                {r.cond}
              </td>
              <td className={`${td} tabular-nums`}>{r.weight}</td>
              <td className={`${td} tabular-nums`}>~ 2026.10.27</td>
              <td className={`${td} tabular-nums font-bold`}>{r.score}</td>
              <td className={td}>
                {r.taken ? (
                  <span className="text-[14px]" style={{ color: C.muted }}>
                    {r.key === "survey" ? "참여완료" : "응시완료"}
                  </span>
                ) : (
                  <button type="button" disabled={!r.ok} onClick={() => start(r.key)} className={btnBase} style={btnPrimary}>
                    {r.key === "survey" ? "참여하기" : "응시하기"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- 학습자: 공지사항, 학습 Q&A ---------- */

function NoticeTab() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div id="room-panel-notice" role="tabpanel" aria-labelledby="room-tab-notice">
      <ul>
        {NOTICES.map((n, k) => (
          <li key={n.title} className="border-b last:border-b-0" style={{ borderColor: C.line }}>
            <button type="button" aria-expanded={open === k} onClick={() => setOpen(open === k ? null : k)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
              <span className="w-6 shrink-0 text-[14px] tabular-nums" style={{ color: C.muted }}>
                {NOTICES.length - k}
              </span>
              <span className="min-w-0 flex-1 truncate text-[15px] font-bold">{n.title}</span>
              <span className="shrink-0 text-[14px] tabular-nums" style={{ color: C.muted }}>
                {n.date}
              </span>
            </button>
            {open === k && (
              <ul className="grid gap-1 border-t px-4 py-3 pl-[52px] text-[15px] leading-[1.6]" style={{ borderColor: C.line, background: C.bg }}>
                {n.body.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QnaTab({ state, setState, notify }: { state: State; setState: SetState; notify: (t: string) => void }) {
  const [writing, setWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const list = [...state.qna, ...QNA];

  return (
    <div id="room-panel-qna" role="tabpanel" aria-labelledby="room-tab-qna">
      {writing ? (
        <form
          className="grid gap-3 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setState((s) => ({ ...s, qna: [{ title: title.trim(), writer: ME.name, date: TODAY, answered: false }, ...s.qna] }));
            setTitle("");
            setBody("");
            setWriting(false);
            notify("질문을 등록했습니다.");
          }}
        >
          <label className="grid gap-1 text-[15px] font-bold">
            제목
            <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={60} className="h-11 rounded-[4px] border px-3 font-normal" style={{ borderColor: C.line }} />
          </label>
          <label className="grid gap-1 text-[15px] font-bold">
            내용
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="rounded-[4px] border px-3 py-2 font-normal" style={{ borderColor: C.line }} />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={!title.trim()} className={`${btnBase} h-11 px-5`} style={btnPrimary}>
              등록
            </button>
            <button type="button" onClick={() => setWriting(false)} className={`${btnBase} h-11 px-5`} style={btnLine}>
              취소
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[520px] text-[15px]">
              <thead style={{ background: C.head }}>
                <tr>
                  <th scope="col" className={`${th} w-14`}>번호</th>
                  <th scope="col" className={th}>제목</th>
                  <th scope="col" className={th}>작성자</th>
                  <th scope="col" className={th}>등록일</th>
                  <th scope="col" className={th}>상태</th>
                </tr>
              </thead>
              <tbody>
                {list.map((q, k) => (
                  <tr key={`${q.title}-${k}`} className="border-t" style={{ borderColor: C.line }}>
                    <td className={`${td} tabular-nums`} style={{ color: C.muted }}>
                      {list.length - k}
                    </td>
                    <td className={`${td} max-w-[280px] truncate`}>{q.title}</td>
                    <td className={td}>{maskName(q.writer)}</td>
                    <td className={`${td} tabular-nums`}>{q.date}</td>
                    <td className={`${td} font-bold`} style={{ color: q.answered ? C.brand : C.warn }}>
                      {q.answered ? "답변완료" : "답변대기"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end border-t p-3" style={{ borderColor: C.line }}>
            <button type="button" onClick={() => setWriting(true)} className={btnBase} style={btnPrimary}>
              질문하기
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- 학습창 ---------- */

function Player({
  index,
  state,
  setState,
  ratios,
  done,
  onChange,
  onClose,
  notify,
}: {
  index: number;
  state: State;
  setState: SetState;
  ratios: number[];
  done: boolean[];
  onChange: (k: number) => void;
  onClose: () => void;
  notify: (t: string) => void;
}) {
  const reduce = useReducedMotionSafe();
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const lesson = LESSONS[index];
  const prog = state.lessons[index];
  const [askResume, setAskResume] = useState(prog.pos > 5 && prog.pos < lesson.duration);
  const [opened, setOpened] = useState(index);
  if (opened !== index) {
    // 다른 차시로 옮기면 그 차시 기준으로 이어보기 여부를 다시 묻는다
    setOpened(index);
    setPlaying(false);
    setAskResume(state.lessons[index].pos > 5 && state.lessons[index].pos < LESSONS[index].duration);
  }

  // 타이머 안에서 최신 진도를 읽기 위해 렌더가 끝난 뒤 값을 옮겨 둔다
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
  });

  // 재생 중에는 0.25초마다 위치를 옮기고, 지나온 구간만 본 구간으로 쌓는다.
  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      const s = latest.current;
      const l = LESSONS[index];
      const p = s.lessons[index];
      const next = Math.min(l.duration, p.pos + 0.25 * speed);
      const segs = merge([...p.segs, [p.pos, next]]);
      const before = ratio(p, l) >= DONE_RATIO;
      const after = watched(segs) / l.duration >= DONE_RATIO;
      const updated = { ...s, lessons: s.lessons.map((x, j) => (j === index ? { pos: next, segs } : x)) };
      latest.current = updated;
      setState(updated);
      if (!before && after) notify(`${index + 1}차시 학습을 완료했습니다.`);
      if (next >= l.duration) setPlaying(false);
    }, 250);
    return () => window.clearInterval(t);
  }, [playing, speed, index, setState, notify]);

  const finish = useCallback(() => {
    setPlaying(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish]);

  const seek = (sec: number) => setState((s) => ({ ...s, lessons: s.lessons.map((x, k) => (k === index ? { ...x, pos: sec } : x)) }));
  const pageAt = Math.min(lesson.pages.length - 1, Math.floor((prog.pos / lesson.duration) * lesson.pages.length));
  const r = Math.round(ratios[index] * 100);
  const nextOpen = index < LESSONS.length - 1 && done[index];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 md:items-center md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-title"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.22, ease: EASE }}
        className="flex w-full max-w-[1040px] flex-col overflow-y-auto bg-white md:max-h-[92vh] md:rounded-md"
      >
        <div className="flex items-center gap-3 px-4 py-2.5 text-white" style={{ background: C.dark }}>
          <p id="player-title" className="min-w-0 flex-1 truncate text-[15px] font-bold">
            {index + 1}차시 {lesson.title}
          </p>
          <button type="button" autoFocus onClick={finish} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-[4px] border border-white/40 px-3 text-[14px] font-bold">
            학습종료
          </button>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <div className="relative aspect-video" style={{ background: C.dark }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${index}-${pageAt}`}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="absolute inset-0 flex flex-col justify-center px-6 text-white md:px-12"
                >
                  <p className="text-[14px] opacity-70">
                    {index + 1}차시 {pageAt + 1}/{lesson.pages.length}
                  </p>
                  <p className="mt-2 text-[24px] font-bold leading-[1.3] md:text-[36px]">{lesson.pages[pageAt]}</p>
                </motion.div>
              </AnimatePresence>
              {askResume && (
                <div className="absolute inset-0 grid place-items-center bg-black/55 p-4">
                  <div className="w-full max-w-[340px] rounded-md bg-white p-4 text-center md:p-5" role="alertdialog" aria-label="이어보기">
                    <p className="text-[15px] font-bold break-keep md:text-[16px]">이전에 학습한 위치부터 이어서 학습하시겠습니까?</p>
                    <p className="mt-1 text-[14px] tabular-nums" style={{ color: C.muted }}>
                      마지막 학습 위치 {clock(prog.pos)}
                    </p>
                    <div className="mt-4 flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAskResume(false);
                          setPlaying(true);
                        }}
                        className={`${btnBase} h-10 px-4`}
                        style={{ background: C.accent, color: "#fff" }}
                      >
                        이어보기
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAskResume(false);
                          seek(0);
                          setPlaying(true);
                        }}
                        className={`${btnBase} h-10 px-4`}
                        style={btnLine}
                      >
                        처음부터
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 pt-3 pb-4">
              {/* 본 구간은 진하게, 건너뛴 구간은 빗금으로 보여 준다 */}
              <div
                role="slider"
                tabIndex={0}
                aria-label="재생 위치"
                aria-valuemin={0}
                aria-valuemax={lesson.duration}
                aria-valuenow={Math.round(prog.pos)}
                aria-valuetext={`${clock(prog.pos)} / ${clock(lesson.duration)}`}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") seek(Math.min(lesson.duration, prog.pos + 10));
                  if (e.key === "ArrowLeft") seek(Math.max(0, prog.pos - 10));
                }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  seek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * lesson.duration);
                }}
                className="relative h-3 cursor-pointer rounded-[2px]"
                style={{ background: `repeating-linear-gradient(135deg, ${C.line} 0 4px, #f3efe6 4px 8px)` }}
              >
                {prog.segs.map(([a, b]) => (
                  <span key={a} className="absolute inset-y-0" style={{ left: `${(a / lesson.duration) * 100}%`, width: `${((b - a) / lesson.duration) * 100}%`, background: C.brand }} />
                ))}
                <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white" style={{ left: `${(prog.pos / lesson.duration) * 100}%`, borderColor: C.brand }} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAskResume(false);
                    if (prog.pos >= lesson.duration) seek(0);
                    setPlaying((p) => !p);
                  }}
                  aria-label={playing ? "일시정지" : "재생"}
                  className="grid size-11 place-items-center rounded-[4px] text-white"
                  style={{ background: C.brand }}
                >
                  {playing ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
                </button>
                <span className="text-[15px] tabular-nums">
                  {clock(prog.pos)} / {clock(lesson.duration)}
                </span>
                <label className="ml-auto flex items-center gap-2 text-[14px]" style={{ color: C.muted }}>
                  배속
                  <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="h-9 rounded-[4px] border bg-white px-2 text-[14px]" style={{ borderColor: C.line, color: C.text }}>
                    <option value={1}>1.0배속</option>
                    <option value={1.2}>1.2배속</option>
                    <option value={1.5}>1.5배속</option>
                    <option value={2}>2.0배속</option>
                    <option value={30}>30배속(시연용)</option>
                  </select>
                </label>
              </div>
              <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[14px]">
                <div className="flex gap-1.5">
                  <dt style={{ color: C.muted }}>차시 진도율</dt>
                  <dd className="font-bold tabular-nums" style={{ color: done[index] ? C.brand : C.text }}>
                    {r}%
                  </dd>
                </div>
                <div className="flex gap-1.5">
                  <dt style={{ color: C.muted }}>학습완료 기준</dt>
                  <dd className="tabular-nums">90% 이상</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt style={{ color: C.muted }}>학습 인정 시간</dt>
                  <dd className="tabular-nums">
                    {clock(watched(prog.segs))} / {clock(lesson.duration)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <aside aria-labelledby="toc-title" className="border-t lg:border-t-0 lg:border-l" style={{ borderColor: C.line }}>
            <h3 id="toc-title" className="border-b px-4 py-2.5 text-[15px] font-bold" style={{ borderColor: C.line, background: C.head }}>
              학습 목차
            </h3>
            <ol>
              {lesson.pages.map((p, k) => {
                const from = Math.round((lesson.duration / lesson.pages.length) * k);
                return (
                  <li key={p}>
                    <button
                      type="button"
                      aria-current={k === pageAt ? "true" : undefined}
                      onClick={() => seek(from)}
                      className="flex w-full items-center gap-2 border-b px-4 py-2.5 text-left text-[14px]"
                      style={{ borderColor: C.line, background: k === pageAt ? C.brandSoft : undefined, fontWeight: k === pageAt ? 700 : 400 }}
                    >
                      <span className="w-5 shrink-0 tabular-nums" style={{ color: C.muted }}>
                        {k + 1}
                      </span>
                      <span className="min-w-0 flex-1">{p}</span>
                      <span className="shrink-0 tabular-nums" style={{ color: C.muted }}>
                        {clock(from)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="flex gap-2 p-4">
              <button type="button" disabled={index === 0} onClick={() => onChange(index - 1)} className={`${btnBase} flex-1`} style={btnLine}>
                <ChevronLeft size={15} aria-hidden />
                이전 차시
              </button>
              <button type="button" disabled={!nextOpen} onClick={() => onChange(index + 1)} className={`${btnBase} flex-1`} style={btnLine}>
                다음 차시
                <ChevronRight size={15} aria-hidden />
              </button>
            </div>
          </aside>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- 수료증 ---------- */

function Certificate({ info, onClose }: { info: CertInfo; onClose: () => void }) {
  const reduce = useReducedMotionSafe();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center overflow-auto bg-black/50 p-4 print:static print:bg-white print:p-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="수료증"
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0 }}
        transition={{ duration: 0.28, ease: EASE }}
        className="relative w-full max-w-[560px] bg-white p-7 text-center print:max-w-none md:p-12"
        style={{ border: `6px double ${C.brand}` }}
      >
        <button type="button" aria-label="닫기" autoFocus onClick={onClose} className="absolute top-3 right-3 grid size-10 place-items-center rounded-[4px] print:hidden" style={{ color: C.muted }}>
          <X size={20} aria-hidden />
        </button>
        <p className="text-left text-[14px] tabular-nums" style={{ color: C.muted }}>
          제 {info.no} 호
        </p>
        <h2 className="mt-4 text-[34px] font-bold tracking-[0.3em]">수료증</h2>
        <dl className="mx-auto mt-8 grid w-fit gap-1.5 text-left text-[16px]">
          {[
            ["성명", maskName(ME.name)],
            ["소속", ME.dept],
            ["과정명", info.course],
            ["교육기간", info.period],
            ["교육시간", info.hours],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-4">
              <dt className="w-16 shrink-0" style={{ color: C.muted }}>
                {k}
              </dt>
              <dd className="font-bold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-[16px] leading-[1.8]">위 사람은 본 기관에서 실시한 위 과정을 수료하였으므로 이 증서를 수여합니다.</p>
        <p className="mt-8 text-[16px]">{info.date}</p>
        <div className="relative mx-auto mt-4 w-fit">
          <p className="text-[20px] font-bold">곰파트너 아카데미 원장</p>
          <motion.span
            aria-hidden
            className="absolute -top-3 -right-14 grid size-14 place-items-center rounded-full border-[3px] text-[13px] font-bold"
            style={{ borderColor: C.accent, color: C.accent }}
            initial={reduce ? false : { scale: 1.8, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 0.9, rotate: -12 }}
            transition={{ duration: 0.35, ease: EASE, delay: 0.25 }}
          >
            직인
          </motion.span>
        </div>
        <div className="mt-10 print:hidden">
          <button type="button" onClick={() => window.print()} className={`${btnBase} h-11 px-5`} style={btnPrimary}>
            <Printer size={16} aria-hidden />
            인쇄
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- 관리자 ---------- */

type AdminPage = "status" | "complete" | "lessons" | "sms" | "courses";
interface Row extends Learner {
  progress: number;
  total: number;
  meets: boolean;
  confirmed: string | null;
  live: boolean;
}
type Cond = "all" | "low" | "idle" | "noFinal" | "meets";
const CONDS: [Cond, string][] = [
  ["all", "전체"],
  ["low", "진도율 25% 미만"],
  ["idle", "7일 이상 미학습"],
  ["noFinal", "최종평가 미응시"],
  ["meets", "수료기준 충족"],
];
const PAGE_SIZE = 15;
const statusText = (r: Row) => (r.confirmed ? "수료" : r.meets ? "수료대상" : r.final !== null ? "미수료" : r.done === 0 && r.last === null ? "미학습" : "학습중");

function AdminView({ state, setState, myProgress, myDone, notify }: { state: State; setState: SetState; myProgress: number; myDone: boolean[]; notify: (t: string) => void }) {
  const [page, setPage] = useState<AdminPage>("status");

  const rows: Row[] = useMemo(() => {
    const doneCount = myDone.filter(Boolean).length;
    const me: Learner = {
      id: ME.id,
      index: LEARNERS.length,
      name: ME.name,
      dept: ME.dept,
      done: doneCount,
      lessonPct: state.lessons.map((p, k) => Math.round(ratio(p, LESSONS[k]) * 100)),
      last: 0,
      mid: state.mid,
      final: state.final,
      confirmedAt: null,
    };
    return [me, ...LEARNERS].map((l) => {
      const progress = (l.done / LESSONS.length) * 100;
      const total = totalScore(l.mid, l.final);
      const meets = progress >= PASS_PROGRESS && l.final !== null && total >= PASS_TOTAL;
      return { ...l, progress, total, meets, confirmed: l.confirmedAt ?? state.confirmed[l.id] ?? null, live: l.id === ME.id };
    });
  }, [state.lessons, state.mid, state.final, state.confirmed, myDone]);

  const avg = rows.reduce((s, r) => s + r.progress, 0) / rows.length;
  const meetsCount = rows.filter((r) => r.meets).length;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[200px_minmax(0,1fr)]">
      <SideNav<AdminPage>
        title="학습관리"
        label="관리자 메뉴"
        items={[
          ["status", "학습현황관리"],
          ["complete", "수료관리"],
          ["lessons", "차시별 진도현황"],
          ["sms", "SMS 발송내역"],
          ["courses", "과정 목록"],
        ]}
        current={page}
        onSelect={setPage}
      />
      <div className="grid min-w-0 grid-cols-1 content-start gap-4">
        {page !== "courses" && page !== "sms" && (
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-[20px] font-bold">
              {COURSE.title} <span className="text-[15px] font-normal" style={{ color: C.muted }}>{COURSE.term}</span>
            </h2>
            <dl className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] tabular-nums">
              {[
                ["학습기간", `${COURSE.period} (D-${COURSE.dday})`],
                ["수강인원", `${rows.length}명`],
                ["평균 진도율", pct(Math.round(avg * 10) / 10)],
                ["수료기준 충족", `${meetsCount}명`],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-1.5">
                  <dt style={{ color: C.muted }}>{k}</dt>
                  <dd className="font-bold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {page === "status" && <StatusPage rows={rows} setState={setState} notify={notify} myProgress={myProgress} />}
        {page === "complete" && <CompletePage rows={rows} setState={setState} notify={notify} />}
        {page === "lessons" && <LessonStatsPage rows={rows} />}
        {page === "sms" && <SmsLogPage logs={state.sms} />}
        {page === "courses" && <CoursesPage />}
      </div>
    </div>
  );
}

function StatusPage({ rows, setState, notify, myProgress }: { rows: Row[]; setState: SetState; notify: (t: string) => void; myProgress: number }) {
  const reduce = useReducedMotionSafe();
  const [draft, setDraft] = useState<{ cond: Cond; dept: string; q: string }>({ cond: "all", dept: "", q: "" });
  const [filter, setFilter] = useState(draft);
  const [pageNo, setPageNo] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [sms, setSms] = useState(false);

  const list = rows.filter((r) => {
    if (filter.dept && r.dept !== filter.dept) return false;
    if (filter.q && !r.name.includes(filter.q.trim()) && !maskName(r.name).includes(filter.q.trim())) return false;
    if (filter.cond === "low") return r.progress < 25;
    if (filter.cond === "idle") return r.last === null || r.last >= 7;
    if (filter.cond === "noFinal") return r.progress >= PASS_PROGRESS && r.final === null;
    if (filter.cond === "meets") return r.meets;
    return true;
  });
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(pageNo, pages);
  const view = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const allOnPage = view.length > 0 && view.every((r) => selected.has(r.id));
  const recipients = rows.filter((r) => selected.has(r.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const download = () => {
    const head = ["이름", "부서", "진도율", "진행단계평가", "최종평가", "총점", "최종 학습일", "수료여부"];
    const body = list.map((r) => [maskName(r.name), r.dept, pct(r.progress), r.mid ?? "", r.final ?? "", r.final === null ? "" : r.total, lastDate(r.last), statusText(r)].join(","));
    const blob = new Blob(["﻿" + [head.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "학습현황_엑셀실무기초_2026년10월1기.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <form
        aria-label="검색 조건"
        className="grid gap-3 rounded-md border bg-white p-4 sm:grid-cols-[1fr_1fr_1.4fr_auto] sm:items-end"
        style={{ borderColor: C.line }}
        onSubmit={(e) => {
          e.preventDefault();
          setFilter(draft);
          setPageNo(1);
        }}
      >
        <label className="grid gap-1 text-[14px] font-bold">
          학습상태
          <select value={draft.cond} onChange={(e) => setDraft({ ...draft, cond: e.target.value as Cond })} className="h-10 rounded-[4px] border bg-white px-2 font-normal" style={{ borderColor: C.line }}>
            {CONDS.map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-[14px] font-bold">
          부서
          <select value={draft.dept} onChange={(e) => setDraft({ ...draft, dept: e.target.value })} className="h-10 rounded-[4px] border bg-white px-2 font-normal" style={{ borderColor: C.line }}>
            <option value="">전체</option>
            {DEPTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
            <option>{ME.dept}</option>
          </select>
        </label>
        <label className="grid gap-1 text-[14px] font-bold">
          이름
          <input value={draft.q} onChange={(e) => setDraft({ ...draft, q: e.target.value })} className="h-10 rounded-[4px] border px-3 font-normal" style={{ borderColor: C.line }} />
        </label>
        <button type="submit" className={`${btnBase} h-10 px-5`} style={btnPrimary}>
          검색
        </button>
      </form>

      <section aria-labelledby="status-title" className="rounded-md border bg-white" style={{ borderColor: C.line }}>
        <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3" style={{ borderColor: C.line }}>
          <h3 id="status-title" className="mr-auto text-[16px] font-bold">
            수강생 목록 <span className="font-normal tabular-nums" style={{ color: C.muted }}>총 {list.length}명</span>
          </h3>
          <button
            type="button"
            onClick={() => {
              const target = rows.filter((r) => !r.meets && (r.progress < 25 || r.last === null || r.last >= 7));
              setSelected(new Set(target.map((r) => r.id)));
              notify(`독려 대상 ${target.length}명을 선택했습니다.`);
            }}
            className={btnBase}
            style={btnLine}
          >
            독려 대상 선택
          </button>
          <button type="button" disabled={!selected.size} onClick={() => setSms(true)} className={btnBase} style={btnPrimary}>
            <Send size={14} aria-hidden />
            SMS 발송{selected.size ? ` (${selected.size})` : ""}
          </button>
          <button type="button" onClick={download} className={btnBase} style={btnLine}>
            <Download size={14} aria-hidden />
            엑셀 다운로드
          </button>
        </div>
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[820px] text-[15px]">
            <thead style={{ background: C.head }}>
              <tr>
                <th scope="col" className={`${th} w-10`}>
                  <input
                    type="checkbox"
                    aria-label="이 페이지 전체 선택"
                    checked={allOnPage}
                    onChange={() =>
                      setSelected((prev) => {
                        const next = new Set(prev);
                        view.forEach((r) => (allOnPage ? next.delete(r.id) : next.add(r.id)));
                        return next;
                      })
                    }
                  />
                </th>
                <th scope="col" className={`${th} w-14`}>번호</th>
                <th scope="col" className={th}>이름</th>
                <th scope="col" className={th}>부서</th>
                <th scope="col" className={`${th} w-44`}>진도율</th>
                <th scope="col" className={th}>진행단계평가</th>
                <th scope="col" className={th}>최종평가</th>
                <th scope="col" className={th}>총점</th>
                <th scope="col" className={th}>최종 학습일</th>
                <th scope="col" className={th}>수료여부</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {view.map((r, k) => (
                <RowGroup key={r.id} r={r} no={list.length - ((cur - 1) * PAGE_SIZE + k)} open={open === r.id} onOpen={() => setOpen(open === r.id ? null : r.id)} checked={selected.has(r.id)} onCheck={() => toggle(r.id)} reduce={reduce} />
              ))}
              {!view.length && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center" style={{ color: C.muted }}>
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <nav aria-label="페이지" className="flex flex-wrap items-center justify-center gap-1 border-t p-3" style={{ borderColor: C.line }}>
          <button type="button" aria-label="이전 페이지" disabled={cur === 1} onClick={() => setPageNo(cur - 1)} className="grid size-9 place-items-center rounded-[4px] disabled:opacity-30">
            <ChevronLeft size={16} aria-hidden />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-current={n === cur ? "page" : undefined}
              onClick={() => setPageNo(n)}
              className="grid size-9 place-items-center rounded-[4px] text-[14px] tabular-nums"
              style={n === cur ? { background: C.brand, color: "#fff", fontWeight: 700 } : { color: C.text }}
            >
              {n}
            </button>
          ))}
          <button type="button" aria-label="다음 페이지" disabled={cur === pages} onClick={() => setPageNo(cur + 1)} className="grid size-9 place-items-center rounded-[4px] disabled:opacity-30">
            <ChevronRight size={16} aria-hidden />
          </button>
        </nav>
      </section>

      <AnimatePresence>
        {sms && (
          <SmsDialog
            key="sms"
            recipients={recipients}
            myProgress={myProgress}
            onClose={() => setSms(false)}
            onSend={(log) => {
              setState((s) => ({ ...s, sms: [log, ...s.sms] }));
              setSelected(new Set());
              setSms(false);
              notify(`${log.count}명에게 문자를 발송했습니다.`);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function RowGroup({ r, no, open, onOpen, checked, onCheck, reduce }: { r: Row; no: number; open: boolean; onOpen: () => void; checked: boolean; onCheck: () => void; reduce: boolean }) {
  const idle = r.last === null || r.last >= 7;
  return (
    <>
      <tr className="border-t" style={{ borderColor: C.line, background: r.live ? C.brandSoft : undefined }}>
        <td className={td}>
          <input type="checkbox" aria-label={`${maskName(r.name)} 선택`} checked={checked} onChange={onCheck} />
        </td>
        <td className={td} style={{ color: C.muted }}>
          {no}
        </td>
        <td className={td}>
          <button type="button" aria-expanded={open} onClick={onOpen} className="font-bold underline-offset-2 hover:underline">
            {maskName(r.name)}
          </button>
        </td>
        <td className={td}>{r.dept}</td>
        <td className={td}>
          <span className="flex items-center gap-2">
            <Bar value={r.progress} color={r.progress < 25 ? C.warn : C.brand} />
            <span className="w-12 shrink-0 text-right">{pct(r.progress)}</span>
          </span>
        </td>
        <td className={td}>{r.mid === null ? "-" : r.mid}</td>
        <td className={td}>{r.final === null ? "-" : r.final}</td>
        <td className={td}>{r.final === null ? "-" : r.total}</td>
        <td className={td} style={{ color: idle ? C.warn : C.text }}>
          {lastDate(r.last)}
        </td>
        <td className={`${td} font-bold`} style={{ color: r.confirmed ? C.brand : r.meets ? C.text : r.final !== null ? C.warn : C.muted }}>
          {statusText(r)}
        </td>
      </tr>
      {open && (
        <tr style={{ background: C.bg }}>
          <td colSpan={10} className="px-4 py-3">
            <motion.div initial={reduce ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE }}>
              <p className="text-[14px] font-bold">차시별 진도</p>
              <ol className="mt-2 grid grid-cols-4 gap-x-4 gap-y-2 sm:grid-cols-8">
                {r.lessonPct.map((v, k) => (
                  <li key={k} className="text-[13px]">
                    <span style={{ color: C.muted }}>{k + 1}차시</span>
                    <span className="mt-1 block">
                      <Bar value={v} color={v >= DONE_RATIO * 100 ? C.brand : C.warn} />
                    </span>
                    <span className="mt-0.5 block font-bold">{v}%</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          </td>
        </tr>
      )}
    </>
  );
}

function SmsDialog({ recipients, myProgress, onClose, onSend }: { recipients: Row[]; myProgress: number; onClose: () => void; onSend: (log: SmsLog) => void }) {
  const reduce = useReducedMotionSafe();
  const [tpl, setTpl] = useState(0);
  const [text, setText] = useState(SMS_TEMPLATES[0].text);
  const first = recipients[0];
  const preview = text.replaceAll("{이름}", first ? maskName(first.name) : "").replaceAll("{진도율}", first ? pct(first.live ? myProgress : first.progress) : "");
  const bytes = smsBytes(preview);
  const type = bytes > 90 ? "LMS" : "SMS";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center overflow-auto bg-black/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sms-title"
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
        transition={{ duration: 0.22, ease: EASE }}
        className="w-full max-w-[720px] rounded-md bg-white"
      >
        <div className="flex items-center border-b px-5 py-3" style={{ borderColor: C.line }}>
          <h2 id="sms-title" className="mr-auto text-[17px] font-bold">
            SMS 발송
          </h2>
          <button type="button" aria-label="닫기" autoFocus onClick={onClose} className="grid size-9 place-items-center rounded-[4px]" style={{ color: C.muted }}>
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="grid content-start gap-3 text-[15px]">
            <dl className="grid gap-1.5">
              <div className="flex gap-3">
                <dt className="w-16 shrink-0" style={{ color: C.muted }}>
                  받는 사람
                </dt>
                <dd className="font-bold">{first ? `${maskName(first.name)}${recipients.length > 1 ? ` 외 ${recipients.length - 1}명` : ""}` : "-"}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-16 shrink-0" style={{ color: C.muted }}>
                  발신번호
                </dt>
                <dd className="tabular-nums">02-000-0000</dd>
              </div>
            </dl>
            <label className="grid gap-1 font-bold">
              문구
              <select
                value={tpl}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setTpl(v);
                  setText(SMS_TEMPLATES[v].text);
                }}
                className="h-10 rounded-[4px] border bg-white px-2 font-normal"
                style={{ borderColor: C.line }}
              >
                {SMS_TEMPLATES.map((t, k) => (
                  <option key={t.kind} value={k}>
                    {t.kind}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 font-bold">
              내용
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="rounded-[4px] border px-3 py-2 text-[15px] font-normal leading-[1.6]" style={{ borderColor: C.line }} />
            </label>
            <p className="text-[13px]" style={{ color: C.muted }}>
              치환 문구 {"{이름}"} {"{진도율}"}
            </p>
          </div>
          <div>
            <p className="text-[14px] font-bold">미리보기</p>
            <div className="mt-2 rounded-md border p-3 text-[14px] leading-[1.6] break-keep" style={{ borderColor: C.line, background: C.bg }}>
              {preview}
            </div>
            <p className="mt-2 text-right text-[13px] tabular-nums" style={{ color: bytes > 90 ? C.warn : C.muted }}>
              {bytes} / {type === "SMS" ? 90 : 2000} byte {type}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t px-5 py-3" style={{ borderColor: C.line }}>
          <button type="button" onClick={onClose} className={`${btnBase} h-10 px-4`} style={btnLine}>
            취소
          </button>
          <button
            type="button"
            disabled={!recipients.length || !text.trim()}
            onClick={() => {
              const d = new Date();
              const at = `${TODAY} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
              onSend({ at, kind: SMS_TEMPLATES[tpl].kind, type, count: recipients.length, text });
            }}
            className={`${btnBase} h-10 px-4`}
            style={btnPrimary}
          >
            <Send size={14} aria-hidden />
            {recipients.length}명 발송
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CompletePage({ rows, setState, notify }: { rows: Row[]; setState: SetState; notify: (t: string) => void }) {
  const [tab, setTab] = useState<"wait" | "done">("wait");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const waiting = rows.filter((r) => r.meets && !r.confirmed);
  const confirmed = rows.filter((r) => r.confirmed).sort((a, b) => (b.confirmed ?? "").localeCompare(a.confirmed ?? ""));
  const list = tab === "wait" ? waiting : confirmed;

  return (
    <section aria-labelledby="complete-title" className="rounded-md border bg-white" style={{ borderColor: C.line }}>
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3" style={{ borderColor: C.line }}>
        <h3 id="complete-title" className="sr-only">
          수료관리
        </h3>
        <div role="tablist" aria-label="수료 구분" className="mr-auto flex gap-1">
          {(
            [
              ["wait", `수료대상 ${waiting.length}`],
              ["done", `수료확정 ${confirmed.length}`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tab === id}
              onClick={() => {
                setTab(id);
                setSelected(new Set());
              }}
              className="rounded-[4px] border px-3 py-1.5 text-[14px] font-bold tabular-nums"
              style={tab === id ? { background: C.text, borderColor: C.text, color: "#fff" } : { borderColor: C.line, color: C.muted }}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "wait" && (
          <button
            type="button"
            disabled={!selected.size}
            onClick={() => {
              setState((s) => ({ ...s, confirmed: { ...s.confirmed, ...Object.fromEntries([...selected].map((id) => [id, TODAY])) } }));
              notify(`${selected.size}명을 수료 처리했습니다.`);
              setSelected(new Set());
            }}
            className={btnBase}
            style={btnPrimary}
          >
            수료처리{selected.size ? ` (${selected.size})` : ""}
          </button>
        )}
      </div>
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[720px] text-[15px]">
          <thead style={{ background: C.head }}>
            <tr>
              {tab === "wait" && (
                <th scope="col" className={`${th} w-10`}>
                  <input type="checkbox" aria-label="전체 선택" checked={list.length > 0 && selected.size === list.length} onChange={() => setSelected(selected.size === list.length ? new Set() : new Set(list.map((r) => r.id)))} />
                </th>
              )}
              <th scope="col" className={th}>이름</th>
              <th scope="col" className={th}>부서</th>
              <th scope="col" className={th}>진도율</th>
              <th scope="col" className={th}>진행단계평가</th>
              <th scope="col" className={th}>최종평가</th>
              <th scope="col" className={th}>총점</th>
              <th scope="col" className={th}>{tab === "wait" ? "수료확정" : "수료일"}</th>
              {tab === "done" && <th scope="col" className={th}>수료번호</th>}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {list.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: C.line, background: r.live ? C.brandSoft : undefined }}>
                {tab === "wait" && (
                  <td className={td}>
                    <input
                      type="checkbox"
                      aria-label={`${maskName(r.name)} 선택`}
                      checked={selected.has(r.id)}
                      onChange={() =>
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(r.id)) next.delete(r.id);
                          else next.add(r.id);
                          return next;
                        })
                      }
                    />
                  </td>
                )}
                <td className={`${td} font-bold`}>{maskName(r.name)}</td>
                <td className={td}>{r.dept}</td>
                <td className={td}>{pct(r.progress)}</td>
                <td className={td}>{r.mid ?? "-"}</td>
                <td className={td}>{r.final ?? "-"}</td>
                <td className={`${td} font-bold`}>{r.total}</td>
                <td className={td}>{tab === "wait" ? "미확정" : r.confirmed}</td>
                {tab === "done" && <td className={td}>{certNo(r.index)}</td>}
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center" style={{ color: C.muted }}>
                  {tab === "wait" ? "수료대상이 없습니다." : "수료확정 내역이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LessonStatsPage({ rows }: { rows: Row[] }) {
  const reduce = useReducedMotionSafe();
  const [lesson, setLesson] = useState(4);
  const rates = LESSONS.map((_, k) => {
    const n = rows.filter((r) => r.done > k).length;
    return { n, rate: Math.round((n / rows.length) * 1000) / 10 };
  });
  let biggest = 1;
  for (let k = 2; k < rates.length; k++) if (rates[k - 1].rate - rates[k].rate > rates[biggest - 1].rate - rates[biggest].rate) biggest = k;

  const drop = DROPOFF[lesson];
  let worst = 1;
  for (let k = 2; k < drop.length; k++) if (drop[k - 1] - drop[k] > drop[worst - 1] - drop[worst]) worst = k;
  const seg = LESSONS[lesson].duration / 10;

  return (
    <>
      <Panel title="차시별 학습완료 현황" id="rate-title">
        <ol className="grid gap-2 p-4">
          {rates.map((x, k) => (
            <li key={k}>
              <button type="button" aria-pressed={lesson === k} onClick={() => setLesson(k)} className="grid w-full grid-cols-[48px_minmax(0,1fr)_136px] items-center gap-3 rounded-[4px] px-2 py-1.5 text-left text-[14px]" style={{ background: lesson === k ? C.brandSoft : undefined }}>
                <span className="font-bold">{k + 1}차시</span>
                <span className="block h-4" style={{ background: C.head }}>
                  <motion.span
                    className="block h-full origin-left"
                    style={{ width: `${x.rate}%`, background: k === biggest ? C.warn : C.brand }}
                    initial={reduce ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.45, ease: EASE, delay: k * 0.03 }}
                  />
                </span>
                <span className="text-right whitespace-nowrap tabular-nums">
                  {x.n}명 ({x.rate}%)
                  {k === biggest && (
                    <span className="ml-1" style={{ color: C.warn }}>
                      ▼{Math.round((rates[k - 1].rate - x.rate) * 10) / 10}%p
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel
        title="구간별 이탈 현황"
        id="drop-title"
        right={
          <select value={lesson} onChange={(e) => setLesson(Number(e.target.value))} aria-label="차시 선택" className="h-9 max-w-full rounded-[4px] border bg-white px-2 text-[14px]" style={{ borderColor: C.line }}>
            {LESSONS.map((l, k) => (
              <option key={l.title} value={k}>
                {k + 1}차시 {l.title}
              </option>
            ))}
          </select>
        }
      >
        <div className="p-4">
          <p className="text-[15px]">
            최다 이탈 구간{" "}
            <b className="tabular-nums" style={{ color: C.warn }}>
              {clock(seg * (worst - 1))}~{clock(seg * worst)}
            </b>{" "}
            <span className="tabular-nums" style={{ color: C.muted }}>
              (▼{drop[worst - 1] - drop[worst]}%p)
            </span>
          </p>
          <div className="mt-4 flex h-40 items-end gap-1.5" role="img" aria-label={`${lesson + 1}차시 구간별 시청 유지율: ${drop.join(", ")}%`}>
            {drop.map((v, k) => (
              <motion.div
                key={`${lesson}-${k}`}
                className="flex-1"
                style={{ background: k === worst ? C.warn : C.brand, opacity: k === worst ? 1 : 0.75, originY: 1, height: `${v}%` }}
                initial={reduce ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.4, ease: EASE, delay: k * 0.03 }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[13px] tabular-nums" style={{ color: C.muted }}>
            <span>00:00</span>
            <span>{clock(LESSONS[lesson].duration)}</span>
          </div>
        </div>
      </Panel>
    </>
  );
}

function SmsLogPage({ logs }: { logs: SmsLog[] }) {
  return (
    <Panel title="SMS 발송내역" id="sms-title-log">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[720px] text-[15px]">
          <thead style={{ background: C.head }}>
            <tr>
              <th scope="col" className={th}>발송일시</th>
              <th scope="col" className={th}>구분</th>
              <th scope="col" className={th}>유형</th>
              <th scope="col" className={th}>내용</th>
              <th scope="col" className={th}>수신</th>
              <th scope="col" className={th}>결과</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {logs.map((l, k) => (
              <tr key={`${l.at}-${k}`} className="border-t" style={{ borderColor: C.line }}>
                <td className={td}>{l.at}</td>
                <td className={td}>{l.kind}</td>
                <td className={td}>{l.type}</td>
                <td className={`${td} max-w-[300px] truncate`} title={l.text}>
                  {l.text}
                </td>
                <td className={td}>{l.count}명</td>
                <td className={td} style={{ color: C.brand }}>
                  성공 {l.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function CoursesPage() {
  const [open, setOpen] = useState(true);
  const courses = [
    ["엑셀 실무 기초", "2026년 10월 1기", 8, "2026.09.28 ~ 2026.10.27", 143, "-", "진행중"],
    ["비즈니스 문서 작성", "2026년 10월 2기", 10, "2026.10.19 ~ 2026.11.17", 61, "-", "수강신청중"],
    ["직장 내 괴롭힘 예방교육", "2026년 3분기", 4, "2026.07.01 ~ 2026.09.30", 412, "91.7%", "종료"],
    ["산업안전보건 교육", "2026년 3분기", 12, "2026.07.01 ~ 2026.09.30", 207, "78.3%", "종료"],
    ["엑셀 실무 기초", "2026년 9월 1기", 8, "2026.08.31 ~ 2026.09.29", 97, "69.1%", "종료"],
    ["개인정보보호 교육", "2026년 2분기", 6, "2026.04.01 ~ 2026.06.30", 389, "86.4%", "종료"],
  ] as const;

  return (
    <Panel title="과정 목록" id="courses-title">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[760px] text-[15px]">
          <thead style={{ background: C.head }}>
            <tr>
              <th scope="col" className={th}>과정명</th>
              <th scope="col" className={th}>기수</th>
              <th scope="col" className={th}>차시</th>
              <th scope="col" className={th}>학습기간</th>
              <th scope="col" className={th}>수강인원</th>
              <th scope="col" className={th}>수료율</th>
              <th scope="col" className={th}>상태</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {courses.map((c, k) => (
              <CourseRow key={`${c[0]}-${c[1]}`} c={c} first={k === 0} open={k === 0 && open} onToggle={() => setOpen(!open)} />
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function CourseRow({ c, first, open, onToggle }: { c: readonly [string, string, number, string, number, string, string]; first: boolean; open: boolean; onToggle: () => void }) {
  return (
    <>
      <tr className="border-t" style={{ borderColor: C.line }}>
        <td className={`${td} font-bold`}>{c[0]}</td>
        <td className={td}>{c[1]}</td>
        <td className={td}>
          {first ? (
            <button type="button" aria-expanded={open} onClick={onToggle} className="font-bold underline underline-offset-2" style={{ color: C.brand }}>
              {c[2]}차시
            </button>
          ) : (
            `${c[2]}차시`
          )}
        </td>
        <td className={td}>{c[3]}</td>
        <td className={td}>{c[4]}명</td>
        <td className={td}>{c[5]}</td>
        <td className={td} style={{ color: c[6] === "종료" ? C.muted : C.brand }}>
          {c[6]}
        </td>
      </tr>
      {open && (
        <tr style={{ background: C.bg }}>
          <td colSpan={7} className="px-4 py-3">
            <table className="w-full text-[14px]">
              <caption className="sr-only">차시 목록</caption>
              <thead>
                <tr style={{ color: C.muted }}>
                  <th scope="col" className="py-1.5 pr-3 text-left font-bold">차시</th>
                  <th scope="col" className="py-1.5 pr-3 text-left font-bold">차시명</th>
                  <th scope="col" className="py-1.5 pr-3 text-left font-bold">학습시간</th>
                  <th scope="col" className="py-1.5 text-left font-bold">인정시간</th>
                </tr>
              </thead>
              <tbody>
                {LESSONS.map((l, k) => (
                  <tr key={l.title} className="border-t" style={{ borderColor: C.line }}>
                    <td className="py-1.5 pr-3">{k + 1}</td>
                    <td className="py-1.5 pr-3">{l.title}</td>
                    <td className="py-1.5 pr-3">{clock(l.duration)}</td>
                    <td className="py-1.5">{clock(Math.ceil(l.duration * DONE_RATIO))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}
