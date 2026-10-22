"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { CalendarCheck, Car, Check, ChevronDown, Clock, MapPin, MessageCircle, Music, Phone, Piano, RotateCcw } from "lucide-react";
import { Noto_Serif_KR } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 피아노 학원 홈페이지 샘플: 가상의 곰파트너피아노학원(유초등 개인 레슨과 성인 취미반).
   학원명, 주소, 전화번호, 교습비, 공연장은 모두 가상이다. 합격 실적, 콩쿠르 수상, 학생 이름은 넣지 않는다.

   국내 동네 피아노 학원 사이트 공통 구성(참고): 메뉴는 학원소개, 교육과정(바이엘, 체르니 100, 30, 40, 소나티네,
   성인반), 수업시간표, 교습비 안내, 연주회, 체험 레슨 신청, 오시는 길. 관용 문구는 "1:1 개인 레슨",
   "개인 연습실", "이론, 청음 수업", "정기 연주회", "체험 레슨", "교재비 별도", "일요일, 공휴일 휴원".
   교습비는 교육청에 신고한 월 교습비를 과정과 주 횟수별 표로 게시한다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 과정 고르기: 건반 모양 버튼 네 개(바이엘, 체르니, 소나티네, 성인 취미)를 누르면 진도가 오선 위 음표로
      이어지고, 한 번 수업 50분의 구성과 월 교습비가 바뀐다.
   2. 요일별 시간표: 유초등, 성인 시간대를 요일별로 보여 주고 남은 자리를 표시한다. 칸을 누르면 체험 레슨 날짜와 시간이 채워진다.
   3. 체험 레슨 신청: 과정, 나이, 날짜, 시간, 이름, 연락처. 완료하면 접수 번호, 담당 창구, 회신 예정일.
   4. 연주회 소식: 다음 정기 연주회 날짜와 남은 날, 공지 펼쳐 보기, 과정별 연주곡.

   포스터 첫 화면(pa-poster): 검정 바탕에 크림색 큰 문장 "체험 레슨 한 번 받아 보고 정해요" 하나만 둔다.
   아래에 큰 건반이 원근으로 놓인다(뒤쪽은 검은 래커 건반 뚜껑, 빨간 펠트 띠). 들어올 때 건반이 오른쪽에서
   미끄러져 들어오며 글리산도처럼 차례로 눌리고, 이어 8.4초 주기로 열두 개 건반이 하나씩 눌리며 음표가 떠올라 흩어진다.
   스크롤하면 건반이 왼쪽으로 길게 미끄러져 빠지고 문장은 위로 빠진다. 등장과 반복은 CSS 키프레임이라
   스크립트 없이도 건반과 문장이 보인다. 동작 줄이기면 음표가 떠 있는 완성 상태로 멈춘다. */

const serif = Noto_Serif_KR;
const serifF = { fontFamily: `${serif.style.fontFamily}, serif` } as const;

const BRAND = "곰파트너피아노학원";
const TEL = "02-000-0000";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 2층";
const KAKAO = "카카오톡 채널 곰파트너";
const SLUG = "piano-academy";

const C = {
  paper: "#f6efe0",
  paperDeep: "#ece2cc",
  card: "#fffaf0",
  ink: "#17140f",
  muted: "#5a5246",
  line: "#d9cdb3",
  felt: "#a3302a",
  feltSoft: "#f5dcd6",
  night: "#12100d",
  cream: "#f3ead7",
  creamMuted: "#c4b89f",
  error: "#b42318",
};

/* 모션 상수. 시간은 ms, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 건반이 오른쪽에서 미끄러져 들어오는 시간 */
const SLIDE_MS = 1600;
/** 글리산도: 건반 하나 눌림 시간과 건반 사이 간격. 22개라 약 1.6초에 끝난다 */
const GLISS_MS = 300;
const GLISS_GAP_MS = 60;
/** 반복 선율이 시작되는 시각과 한 음 간격. 12음이라 한 바퀴 8.4초 */
const LOOP_START_MS = 1800;
const NOTE_GAP_MS = 700;
/** 포스터 스크롤 진행도 중 퇴장이 끝나는 지점 */
const EXIT_END = 0.6;
/** 과정 바꿀 때 오선 위 선이 이어지는 시간(초) */
const STAFF_DUR = 0.7;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const p2 = (n: number) => String(n).padStart(2, "0");
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/* ---------- 과정 ---------- */

type CourseId = "beyer" | "czerny" | "sonatine" | "adult";
type Who = "kid" | "adult";
interface Course {
  id: CourseId;
  name: string;
  sub: string;
  who: Who;
  target: string;
  steps: { book: string; span: string }[];
  parts: { label: string; min: number }[];
  side: string;
}
const COURSES: Course[] = [
  {
    id: "beyer",
    name: "바이엘",
    sub: "처음 시작",
    who: "kid",
    target: "피아노가 처음인 6세~초등 저학년",
    steps: [
      { book: "계이름, 손 모양", span: "1~2개월" },
      { book: "바이엘 1~2권", span: "4~6개월" },
      { book: "바이엘 3~4권", span: "6~8개월" },
      { book: "체르니 100 준비", span: "1~2개월" },
    ],
    parts: [
      { label: "개인 레슨", min: 15 },
      { label: "연습실 연습", min: 25 },
      { label: "이론, 리듬", min: 10 },
    ],
    side: "함께 치는 책: 어린이 하농, 동요 곡집",
  },
  {
    id: "czerny",
    name: "체르니",
    sub: "100, 30번",
    who: "kid",
    target: "바이엘을 마친 초등학생",
    steps: [
      { book: "체르니 100", span: "1년 안팎" },
      { book: "체르니 30", span: "1~2년" },
      { book: "체르니 40", span: "2년 이상" },
    ],
    parts: [
      { label: "개인 레슨", min: 15 },
      { label: "연습실 연습", min: 25 },
      { label: "이론, 청음", min: 10 },
    ],
    side: "함께 치는 책: 하농, 부르크뮐러 25의 연습곡",
  },
  {
    id: "sonatine",
    name: "소나티네",
    sub: "곡 완성",
    who: "kid",
    target: "체르니 30을 치고 있는 학생",
    steps: [
      { book: "소나티네 앨범", span: "1년 안팎" },
      { book: "소나타 앨범 1권", span: "1~2년" },
      { book: "연주회 곡 준비", span: "3개월" },
    ],
    parts: [
      { label: "개인 레슨", min: 20 },
      { label: "연습실 연습", min: 20 },
      { label: "이론, 청음", min: 10 },
    ],
    side: "치는 곡: 클레멘티, 쿨라우 소나티네, 모차르트, 하이든 소나타",
  },
  {
    id: "adult",
    name: "성인 취미",
    sub: "처음도 다시도",
    who: "adult",
    target: "처음 배우는 분, 어릴 때 치다 그만둔 분",
    steps: [
      { book: "악보 읽기, 손 풀기", span: "2~3개월" },
      { book: "쉬운 가요, OST", span: "3~6개월" },
      { book: "코드 반주", span: "6개월 안팎" },
      { book: "원하는 곡 한 곡", span: "곡마다 달라요" },
    ],
    parts: [
      { label: "개인 레슨", min: 25 },
      { label: "연습실 연습", min: 25 },
    ],
    side: "치고 싶은 곡 악보를 가져오시면 수준에 맞춰 편곡해 드려요",
  },
];
const courseOf = (id: CourseId) => COURSES.find((c) => c.id === id) ?? COURSES[0];

/** 교습비 게시표. 교재비는 실비로 따로 받는다 */
const FEES: { course: string; who: Who; times: string; time: string; price: number }[] = [
  { course: "유초등 피아노", who: "kid", times: "주 5회", time: "1회 50분", price: 170000 },
  { course: "유초등 피아노", who: "kid", times: "주 3회", time: "1회 50분", price: 130000 },
  { course: "중고등 피아노", who: "kid", times: "주 2회", time: "1회 50분", price: 120000 },
  { course: "성인 취미", who: "adult", times: "주 1회", time: "1회 50분", price: 140000 },
  { course: "성인 취미", who: "adult", times: "주 2회", time: "1회 50분", price: 230000 },
];

/* ---------- 시간표 ---------- */

const OPEN_DAYS = [1, 2, 3, 4, 5, 6];
/** 연습실이 다섯 개라 한 시간에 다섯 명까지 */
const CAP = 5;
const SLOTS: Record<Who, { weekday: string[]; sat: string[] }> = {
  kid: { weekday: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"], sat: ["10:00", "11:00"] },
  adult: { weekday: ["19:30", "20:30"], sat: ["12:00", "13:00"] },
};
const slotsFor = (dow: number, who: Who) => (dow === 0 ? [] : dow === 6 ? SLOTS[who].sat : SLOTS[who].weekday);
const timesOf = (who: Who) => [...new Set([...SLOTS[who].sat, ...SLOTS[who].weekday])].sort();

/** 요일, 시간별 이미 찬 자리. 실제로는 학원 관리 프로그램에서 읽는다 */
function taken(dow: number, time: string) {
  const t = Number(time.replace(":", ""));
  let h = (dow + 5) * 2654435761 + (t + 13) * 40503;
  h = Math.abs((h ^ (h >>> 13)) * 1274126177) % 89;
  // 하교 시간(15~17시)과 성인 저녁반이 먼저 찬다
  const busy = t >= 1500 && t <= 1700 ? 2 : t >= 1930 ? 1 : 0;
  return Math.min(CAP, (h % 4) + busy);
}
const left = (dow: number, time: string) => CAP - taken(dow, time);

/** 내일부터 문 여는 날 6일(일요일 빼고). 월~토가 한 번씩 들어간다 */
function trialDates(today: Date) {
  const out: Date[] = [];
  let d = daysAgo(today, -1);
  while (out.length < 6) {
    if (d.getDay() !== 0) out.push(d);
    d = daysAgo(d, -1);
  }
  return out;
}

/* ---------- 연주회 ---------- */

/** 6주 뒤 첫 토요일 */
function concertDate(today: Date) {
  let d = daysAgo(today, -42);
  while (d.getDay() !== 6) d = daysAgo(d, -1);
  return d;
}
const PROGRAM: { course: string; piece: string }[] = [
  { course: "바이엘반", piece: "작은 별 변주, 선생님과 연탄" },
  { course: "체르니반", piece: "부르크뮐러 25의 연습곡 중 아라베스크" },
  { course: "소나티네반", piece: "클레멘티 소나티네 Op.36 No.3 1악장" },
  { course: "성인 취미반", piece: "쇼팽 녹턴 Op.9 No.2" },
];

/* ---------- 포스터 건반 ---------- */

type Pt = [number, number];
/** viewBox 1600x640. 바닥 평면 위 건반을 소실점 하나로 투영한다 */
const KB = { cx: 900, hz: 40, front: 540, span: 2500, k: 0.9, n: 22, face: 24, lift: 22 };
const sAt = (d: number) => 1 / (1 + KB.k * d);
/** u: 건반 가로 위치(0~1), d: 깊이(0 앞, 1 뒤), lift: 위로 솟은 높이 */
function pt(u: number, d: number, lift = 0): Pt {
  const s = sAt(d);
  return [KB.cx + (u - 0.5) * KB.span * s, KB.hz + (KB.front - KB.hz) * s - lift * s];
}
const f1 = (n: number) => n.toFixed(1);
const poly = (ps: Pt[]) => `M${ps.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(" L")} Z`;
const line = (a: Pt, b: Pt) => `M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])}`;
const GAP = 0.0011;
const FACE_Y = KB.front + KB.face;
/** 검은 건반 앞쪽 끝 깊이 */
const D0 = 0.37;
/** 건반 뚜껑(래커 판) 깊이와 높이 */
const FB_D = 1.035;
const FB_H = 210;

const WHITE = Array.from({ length: KB.n }, (_, i) => {
  const u0 = i / KB.n + GAP;
  const u1 = (i + 1) / KB.n - GAP;
  const a = pt(u0, 0);
  const b = pt(u1, 0);
  return {
    i,
    top: poly([a, b, pt(u1, 1), pt(u0, 1)]),
    face: poly([a, b, [b[0], FACE_Y], [a[0], FACE_Y]]),
    edge: line(a, pt(u0, 0.985)),
    lip: line([a[0] + 2, a[1] + 1], [b[0] - 2, b[1] + 1]),
    reflect: poly([pt(u0, FB_D, 14), pt(u1, FB_D, 14), pt(u1, FB_D, 120), pt(u0, FB_D, 120)]),
  };
});

const BLACK = [0, 1, 2].flatMap((o) =>
  [1, 2, 4, 5, 6].map((off) => {
    const b = o * 7 + off;
    const uc = b / KB.n;
    const hw = 0.3 / KB.n;
    const ul = uc - hw;
    const ur = uc + hw;
    const L = KB.lift;
    // 소실점 왼쪽 건반은 오른쪽 옆면이, 오른쪽 건반은 왼쪽 옆면이 보인다
    const su = pt(uc, 0.5)[0] < KB.cx ? ur : ul;
    return {
      b,
      shadow: poly([pt(ul - 0.004, D0 - 0.07), pt(ur + 0.006, D0 - 0.07), pt(ur + 0.006, 1), pt(ul - 0.004, 1)]),
      side: poly([pt(su, D0, L), pt(su, 1, L), pt(su, 1, 0), pt(su, D0, 0)]),
      front: poly([pt(ul, D0, L), pt(ur, D0, L), pt(ur, D0, 0), pt(ul, D0, 0)]),
      top: poly([pt(ul, D0, L), pt(ur, D0, L), pt(ur, 1, L), pt(ul, 1, L)]),
      sheen: poly([pt(uc - 0.08 / KB.n, D0 + 0.03, L), pt(uc + 0.05 / KB.n, D0 + 0.03, L), pt(uc + 0.05 / KB.n, 0.97, L), pt(uc - 0.08 / KB.n, 0.97, L)]),
      lip: line(pt(ul, D0, L), pt(ur, D0, L)),
    };
  }),
);
const FELT = poly([pt(-0.06, 1, 0), pt(1.06, 1, 0), pt(1.06, 1, 11), pt(-0.06, 1, 11)]);
const FALLBOARD = poly([pt(-0.06, FB_D, 11), pt(1.06, FB_D, 11), pt(1.06, FB_D, FB_H), pt(-0.06, FB_D, FB_H)]);
const FB_TOP = line(pt(-0.06, FB_D, FB_H), pt(1.06, FB_D, FB_H));

/** 반복 선율로 눌리는 흰 건반 순서(서로 다른 건반 12개) */
const MELODY = [7, 9, 11, 14, 12, 10, 8, 13, 15, 17, 16, 6];
type Glyph = "quarter" | "eighth" | "beam";
/** 음표마다 [가로 이동, 세로 이동, 회전, 모양, 빨강 여부] */
const DRIFT: [number, number, number, Glyph, boolean][] = [
  [-80, -300, -18, "eighth", false],
  [50, -340, 20, "quarter", false],
  [-30, -380, -10, "beam", true],
  [110, -320, 26, "eighth", false],
  [-120, -280, -24, "quarter", false],
  [70, -360, 14, "beam", false],
  [-60, -330, -30, "eighth", true],
  [30, -300, 12, "quarter", false],
  [120, -370, 24, "eighth", false],
  [-90, -350, -16, "beam", false],
  [60, -290, 30, "quarter", true],
  [-40, -320, -20, "eighth", false],
];
const NOTES = MELODY.map((k, j) => {
  const [x, y] = pt((k + 0.5) / KB.n, 0.78);
  const [dx, dy, r, glyph, red] = DRIFT[j];
  return { k, j, x, y: y - 16, dx, dy, r, glyph, red };
});
/** 동작 줄이기일 때 음표마다 멈춰 있는 높이(떠오르는 거리 비율) */
const STILL_K = [0.35, 0.8, 0.55, 0.95, 0.25, 0.7, 0.45, 0.9];
const melodyIndex = (i: number) => MELODY.indexOf(i);

const P = {
  bg: "#0f0d0b",
  cream: "#f3ead7",
  sub: "#c2b6a0",
  felt: "#a3302a",
};

export function PianoAcademyDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

  const [courseId, setCourseId] = useState<CourseId>("beyer");
  const course = courseOf(courseId);

  /* 체험 레슨 신청 상태. 시간표 칸을 누르면 날짜와 시간이 채워진다 */
  const dates = useMemo(() => trialDates(today), [today]);
  const [pickDow, setPickDow] = useState<number | null>(null);
  const [pickTime, setPickTime] = useState<string | null>(null);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  const pickSlot = (dow: number, time: string) => {
    setPickDow(dow);
    setPickTime(time);
    go("pa-trial");
  };

  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.paper, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("pa-trial")} />

      <header className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-5 md:px-6">
        <h2 className="inline-flex items-center gap-2 text-[22px] font-bold leading-none" style={serifF}>
          <Piano size={24} aria-hidden style={{ color: C.felt }} />
          {BRAND}
        </h2>
        <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center">
          {[
            ["pa-course", "교육과정"],
            ["pa-timetable", "수업시간표"],
            ["pa-fees", "교습비 안내"],
            ["pa-trial", "체험 레슨"],
            ["pa-concert", "연주회"],
            ["pa-visit", "오시는 길"],
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.felt }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <CourseSection reduce={reduce} course={course} setCourseId={setCourseId} onTrial={() => go("pa-trial")} />
      <TimetableSection today={today} course={course} setCourseId={setCourseId} pickDow={pickDow} pickTime={pickTime} onPick={pickSlot} />
      <FeeSection today={today} />
      <TrialSection
        reduce={reduce}
        today={today}
        dates={dates}
        course={course}
        setCourseId={setCourseId}
        pickDow={pickDow}
        setPickDow={setPickDow}
        pickTime={pickTime}
        setPickTime={setPickTime}
      />
      <ConcertSection today={today} />
      <VisitSection />

      <footer className="mt-20 border-t px-4 pb-14 pt-8 md:px-6" style={{ borderColor: C.line, color: C.muted }}>
        <div className="mx-auto max-w-[1200px] text-[14px] leading-[1.8]">
          <p className="text-[16px] font-bold" style={{ ...serifF, color: C.ink }}>
            {BRAND}
          </p>
          <p>
            {ADDRESS}, 전화 <span className="whitespace-nowrap">{TEL}</span>
          </p>
          <DemoMakerInfo className="mt-6" />
        </div>
      </footer>
    </div>
  );
}

/* ---------- 포스터 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 0 : Math.min(1, v / EXIT_END)));
  // 건반은 왼쪽으로 길게 미끄러져 빠지고, 문장은 위로 빠진다
  const kbX = useTransform(p, (v) => `${-v * v * 80}%`);
  const kbO = useTransform(p, (v) => 1 - Math.max(0, v - 0.7) / 0.3);
  const textY = useTransform(p, (v) => `${-v * 34}svh`);
  const textO = useTransform(p, (v) => Math.max(0, 1 - Math.max(0, v - 0.25) / 0.55));

  return (
    <section id="pa-poster" ref={ref} aria-labelledby="pa-poster-title" className="relative" style={{ height: reduce ? undefined : "180svh", background: P.bg }}>
      <style>{`
        @keyframes pa-slide { from { transform: translateX(24%); } to { transform: translateX(0); } }
        .pa-slide { animation: pa-slide ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes pa-gliss { 0%, 100% { transform: translateY(0); } 35% { transform: translateY(6px); } }
        .pa-gliss { animation: pa-gliss ${GLISS_MS}ms ease-out both; }
        @keyframes pa-press {
          0% { transform: translateY(0); } 2% { transform: translateY(7px); } 8% { transform: translateY(7px); }
          11% { transform: translateY(0); } 100% { transform: translateY(0); }
        }
        @keyframes pa-shade { 0% { opacity: 0; } 2% { opacity: 1; } 8% { opacity: 1; } 11% { opacity: 0; } 100% { opacity: 0; } }
        .pa-press { animation: pa-press ${NOTE_GAP_MS * MELODY.length}ms linear infinite backwards; }
        .pa-shade { opacity: 0; animation: pa-shade ${NOTE_GAP_MS * MELODY.length}ms linear infinite backwards; }
        @keyframes pa-float {
          0% { opacity: 0; transform: translate(0px, 0px) rotate(0deg) scale(0.55); }
          4% { opacity: 1; }
          30% { opacity: 0.95; }
          42% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--r)) scale(1); }
          100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--r)) scale(1); }
        }
        .pa-note { transform-box: fill-box; transform-origin: center; opacity: 0; animation: pa-float ${NOTE_GAP_MS * MELODY.length}ms cubic-bezier(0.22, 1, 0.36, 1) infinite backwards; }
        .pa-still .pa-slide, .pa-still .pa-gliss, .pa-still .pa-press, .pa-still .pa-shade { animation: none; }
        .pa-still .pa-shade { opacity: 0; }
        .pa-still .pa-note { animation: none; opacity: 0.92; transform: translate(calc(var(--dx) * var(--k)), calc(var(--dy) * var(--k))) rotate(calc(var(--r) * var(--k))); }
        @media (prefers-reduced-motion: reduce) {
          .pa-slide, .pa-gliss, .pa-press, .pa-shade { animation: none; }
          .pa-note { animation: none; opacity: 0.92; transform: translate(calc(var(--dx) * var(--k)), calc(var(--dy) * var(--k))) rotate(calc(var(--r) * var(--k))); }
        }
      `}</style>
      <div
        className={`${reduce ? "pa-still relative min-h-svh" : "sticky top-0 h-svh"} overflow-hidden`}
        style={{ background: `radial-gradient(70% 55% at 56% 100%, #2b241d 0%, ${P.bg} 70%), ${P.bg}`, color: P.cream }}
      >
        {/* 건반. 휴대폰은 1000px 폭으로 그려 소실점 근처만 보이게 자른다 */}
        <motion.div className="pointer-events-none absolute bottom-0 left-1/2 w-[1000px] -translate-x-[56.25%] md:left-0 md:w-full md:translate-x-0" style={{ x: kbX, opacity: kbO }}>
          <div className="pa-slide">
            <Keyboard />
          </div>
        </motion.div>

        {/* 로고와 핵심 행동 하나 */}
        <motion.div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4 md:px-12 md:pt-7" style={{ y: textY }}>
          <p className="inline-flex items-center gap-2 text-[17px] font-bold leading-none" style={serifF}>
            <Piano size={19} aria-hidden />
            {BRAND}
          </p>
          <button
            type="button"
            onClick={onCta}
            aria-label="체험 레슨 신청"
            title="체험 레슨 신청"
            data-gtm-cta={`${SLUG}_poster_cta`}
            className={`inline-flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-150 active:scale-95 ${focusRing}`}
            style={{ background: P.cream, color: P.bg, outlineColor: P.cream }}
          >
            <CalendarCheck size={22} aria-hidden />
          </button>
        </motion.div>

        {/* 큰 문장 */}
        <motion.div className="relative z-[2] flex h-full flex-col px-4 pt-[15svh] md:px-12 md:pt-[12svh]" style={{ y: textY, opacity: textO }}>
          <h1
            id="pa-poster-title"
            className="text-[clamp(44px,13.2vw,64px)] leading-[1.2] tracking-[-0.035em] md:text-[clamp(88px,10.2vw,184px)] md:leading-[1.1]"
            style={{ ...serifF, fontWeight: 800, wordBreak: "keep-all" }}
          >
            <span className="md:hidden">
              <span className="block">체험 레슨</span>
              <span className="block">한 번 받아 보고</span>
              <span className="block">정해요</span>
            </span>
            <span className="hidden md:inline">
              <span className="block">체험 레슨 한 번</span>
              <span className="block">받아 보고 정해요</span>
            </span>
          </h1>
          <p className="mt-5 text-[16px] md:mt-7 md:text-[19px]" style={{ color: P.sub }}>
            평일 13:00~21:30, 토요일 10:00~14:00
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Keyboard() {
  return (
    <svg viewBox="0 0 1600 640" className="block h-auto w-full overflow-visible" role="img" aria-label="원근으로 놓인 피아노 건반이 차례로 눌리며 음표가 떠오르는 그림">
      <defs>
        <linearGradient id="pa-ivory" gradientUnits="userSpaceOnUse" x1="0" y1={KB.front} x2="0" y2="300">
          <stop offset="0" stopColor="#fbf6ea" />
          <stop offset="0.6" stopColor="#ece2cd" />
          <stop offset="1" stopColor="#cfc2a6" />
        </linearGradient>
        <linearGradient id="pa-ivory-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4d8bf" />
          <stop offset="1" stopColor="#a8987a" />
        </linearGradient>
        <linearGradient id="pa-ebony" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#3b3631" />
          <stop offset="0.5" stopColor="#1a1714" />
          <stop offset="1" stopColor="#0b0a09" />
        </linearGradient>
        <linearGradient id="pa-ebony-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2622" />
          <stop offset="1" stopColor="#060505" />
        </linearGradient>
        <linearGradient id="pa-lacquer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24201c" />
          <stop offset="0.12" stopColor="#0d0b0a" />
          <stop offset="1" stopColor="#050404" />
        </linearGradient>
        <linearGradient id="pa-rail" gradientUnits="userSpaceOnUse" x1="0" y1={FACE_Y} x2="0" y2="640">
          <stop offset="0" stopColor="#2c2724" />
          <stop offset="0.18" stopColor="#100e0c" />
          <stop offset="1" stopColor="#060505" />
        </linearGradient>
        <linearGradient id="pa-felt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c2453b" />
          <stop offset="1" stopColor="#6e1c17" />
        </linearGradient>
        <linearGradient id="pa-reflect" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#f3ead7" stopOpacity="0.22" />
          <stop offset="1" stopColor="#f3ead7" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="pa-vignette" gradientUnits="userSpaceOnUse" cx={KB.cx} cy="430" r="980" gradientTransform={`translate(${KB.cx} 430) scale(1 0.55) translate(${-KB.cx} -430)`}>
          <stop offset="0.45" stopColor={P.bg} stopOpacity="0" />
          <stop offset="1" stopColor={P.bg} stopOpacity="0.96" />
        </radialGradient>
        <radialGradient id="pa-floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity="0.7" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pa-note-cream" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#d9c9a8" />
        </radialGradient>
        <radialGradient id="pa-note-red" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#d8584c" />
          <stop offset="1" stopColor="#86231d" />
        </radialGradient>
      </defs>

      {/* 건반 뚜껑(래커 판)과 비친 흰 건반 */}
      <path d={FALLBOARD} fill="url(#pa-lacquer)" />
      {WHITE.map((w) => (
        <path key={w.i} d={w.reflect} fill="url(#pa-reflect)" />
      ))}
      <path d={FB_TOP} stroke="rgba(255,240,220,0.4)" strokeWidth="1.6" />
      <path d={FELT} fill="url(#pa-felt)" />

      {/* 흰 건반 */}
      {WHITE.map((w) => {
        const m = melodyIndex(w.i);
        const loopDelay = `${LOOP_START_MS + m * NOTE_GAP_MS}ms`;
        return (
          <g key={w.i} className="pa-gliss" style={{ animationDelay: `${SLIDE_MS * 0.12 + w.i * GLISS_GAP_MS}ms` }}>
            <g className={m >= 0 ? "pa-press" : undefined} style={m >= 0 ? { animationDelay: loopDelay } : undefined}>
              <path d={w.face} fill="url(#pa-ivory-face)" />
              <path d={w.top} fill="url(#pa-ivory)" />
              <path d={w.edge} stroke="rgba(255,255,255,0.75)" strokeWidth="1.4" />
              <path d={w.lip} stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" />
              {m >= 0 && <path className="pa-shade" d={w.top} fill="rgba(120,88,40,0.3)" style={{ animationDelay: loopDelay }} />}
            </g>
          </g>
        );
      })}

      {/* 검은 건반 */}
      {BLACK.map((b) => (
        <path key={`s${b.b}`} d={b.shadow} fill="rgba(40,26,10,0.28)" />
      ))}
      {BLACK.map((b) => (
        <g key={b.b}>
          <path d={b.side} fill="#050404" />
          <path d={b.front} fill="url(#pa-ebony-front)" />
          <path d={b.top} fill="url(#pa-ebony)" />
          <path d={b.sheen} fill="rgba(255,244,226,0.13)" />
          <path d={b.lip} stroke="rgba(255,244,226,0.5)" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}

      {/* 앞 레일과 바닥 그림자 */}
      <rect x="-900" y={FACE_Y} width="3800" height={612 - FACE_Y} fill="url(#pa-rail)" />
      <path d={`M-900 ${FACE_Y + 1.5} L2900 ${FACE_Y + 1.5}`} stroke="rgba(255,240,220,0.32)" strokeWidth="1.5" />
      <ellipse cx={KB.cx} cy="626" rx="980" ry="20" fill="url(#pa-floor)" />

      <rect x="-900" y="0" width="3800" height="640" fill="url(#pa-vignette)" />

      {/* 떠오르는 음표 */}
      {NOTES.map((n) => (
        <g key={n.j} transform={`translate(${f1(n.x)} ${f1(n.y)})`}>
          <g className="pa-note" style={{ "--dx": `${n.dx}px`, "--dy": `${n.dy}px`, "--r": `${n.r}deg`, "--k": STILL_K[n.j % STILL_K.length], animationDelay: `${LOOP_START_MS + n.j * NOTE_GAP_MS}ms` } as CSSProperties}>
            <NoteGlyph kind={n.glyph} fill={n.red ? "url(#pa-note-red)" : "url(#pa-note-cream)"} />
          </g>
        </g>
      ))}
    </svg>
  );
}

function NoteGlyph({ kind, fill }: { kind: Glyph; fill: string }) {
  const head = (cx: number, cy: number) => (
    <>
      <ellipse cx={cx} cy={cy} rx="13" ry="9.5" transform={`rotate(-22 ${cx} ${cy})`} fill={fill} />
      <ellipse cx={cx - 4} cy={cy - 3.5} rx="4" ry="2" transform={`rotate(-22 ${cx - 4} ${cy - 3.5})`} fill="rgba(255,255,255,0.7)" />
    </>
  );
  if (kind === "beam") {
    return (
      <g>
        <rect x="-8" y="-54" width="4.5" height="56" rx="1.5" fill={fill} />
        <rect x="31" y="-62" width="4.5" height="56" rx="1.5" fill={fill} />
        <path d="M-8 -54 L35.5 -62 L35.5 -51 L-8 -43 Z" fill={fill} />
        {head(-17, 2)}
        {head(22, -6)}
      </g>
    );
  }
  return (
    <g>
      <rect x="8" y="-58" width="4.5" height="58" rx="1.5" fill={fill} />
      {kind === "eighth" && <path d="M10 -58 C14 -42 34 -40 28 -14 C30 -30 20 -36 10 -40 Z" fill={fill} />}
      {head(0, 0)}
    </g>
  );
}

/* ---------- 공용 ---------- */

function SectionTitle({ id, title, dark = false }: { id: string; title: string; dark?: boolean }) {
  return (
    <div className="flex items-end gap-5">
      <h2 id={id} className="flex-none text-[28px] font-bold leading-tight md:text-[36px]" style={serifF}>
        {title}
      </h2>
      {/* 오선 다섯 줄 */}
      <svg aria-hidden viewBox="0 0 100 17" preserveAspectRatio="none" className="mb-2 hidden h-[17px] flex-1 sm:block">
        {[0.5, 4.5, 8.5, 12.5, 16.5].map((y) => (
          <line key={y} x1="0" x2="100" y1={y} y2={y} stroke={dark ? "rgba(243,234,215,0.35)" : "rgba(23,20,15,0.3)"} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    </div>
  );
}

/* ---------- 1. 과정 고르기 ---------- */

function CourseSection({ reduce, course, setCourseId, onTrial }: { reduce: boolean; course: Course; setCourseId: (id: CourseId) => void; onTrial: () => void }) {
  const total = course.parts.reduce((s, x) => s + x.min, 0);
  const fees = FEES.filter((f) => f.who === course.who && f.course !== "중고등 피아노");
  return (
    <section id="pa-course" aria-labelledby="pa-course-title" className="mx-auto mt-8 max-w-[1200px] scroll-mt-4 px-4 md:mt-12 md:px-6">
      <SectionTitle id="pa-course-title" title="교육과정" />

      <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
        {/* 건반 버튼 */}
        <div>
          <div role="group" aria-label="과정 고르기" className="relative flex gap-[3px] rounded-b-[8px] px-[6px] pb-[10px] pt-[10px]" style={{ background: C.night }}>
            {COURSES.map((c) => {
              const on = c.id === course.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCourseId(c.id)}
                  className={`relative flex h-[184px] flex-1 flex-col items-center justify-end rounded-b-[6px] px-1 pb-4 text-center transition-[transform,box-shadow] duration-100 md:h-[230px] ${focusRing}`}
                  style={{
                    background: on ? "linear-gradient(180deg, #e3d7bd 0%, #f3ead7 40%, #efe4cc 100%)" : "linear-gradient(180deg, #f1e8d4 0%, #fffaf0 55%, #f6efe0 100%)",
                    transform: on ? "translateY(5px)" : "translateY(0)",
                    boxShadow: on ? "inset 0 8px 12px rgba(60,40,10,0.22)" : "inset 0 -7px 0 #d6c8a8, 0 2px 0 #000",
                    outlineColor: C.felt,
                    color: C.ink,
                  }}
                >
                  <span className="text-[16px] font-bold leading-tight md:text-[18px]" style={serifF}>
                    {c.name}
                  </span>
                  <span className="mt-1 text-[12px] leading-tight md:text-[13px]" style={{ color: C.muted }}>
                    {c.sub}
                  </span>
                  {on && (
                    <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold" style={{ color: C.felt }}>
                      <Check size={13} aria-hidden />
                      선택
                    </span>
                  )}
                  {/* 누르면 음표 하나가 떠오른다 */}
                  <AnimatePresence>
                    {on && !reduce && (
                      <motion.span
                        key={`n-${c.id}`}
                        aria-hidden
                        className="pointer-events-none absolute left-1/2 top-[38%] -ml-2"
                        initial={{ y: 0, opacity: 1, rotate: 0 }}
                        animate={{ y: -70, opacity: 0, rotate: 18 }}
                        transition={{ duration: 0.9, ease: EASE }}
                        style={{ color: C.felt }}
                      >
                        <Music size={20} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
            {/* 건반 사이 검은 건반. 장식 */}
            {[25, 50, 75].map((x) => (
              <span
                key={x}
                aria-hidden
                className="pointer-events-none absolute top-[10px] h-[44%] w-[9%] -translate-x-1/2 rounded-b-[4px]"
                style={{ left: `${x}%`, background: "linear-gradient(180deg, #0b0a09 0%, #2b2622 88%, #3b3631 100%)", boxShadow: "0 3px 0 #000" }}
              />
            ))}
          </div>
          <p className="mt-4 text-[15px]" style={{ color: C.muted }}>
            모든 과정은 1:1 개인 레슨과 개인 연습실 연습으로 진행해요.
          </p>
        </div>

        {/* 고른 과정 */}
        <div>
          <p className="text-[15px] font-bold" style={{ color: C.felt }}>
            {course.target}
          </p>
          <h3 className="mt-1 text-[24px] font-bold md:text-[28px]" style={serifF}>
            {course.name} 과정 진도
          </h3>
          <Staff key={course.id} course={course} reduce={reduce} />

          <h4 className="mt-7 text-[17px] font-bold">한 번 수업 {total}분</h4>
          <div className="mt-3 flex h-12 overflow-hidden rounded-[4px] border" style={{ borderColor: C.ink }} aria-hidden>
            {course.parts.map((x, i) => (
              <span
                key={x.label}
                className="flex items-center justify-center text-[14px] font-bold tabular-nums"
                style={{
                  flexGrow: x.min,
                  flexBasis: 0,
                  background: i === 0 ? C.ink : i === 1 ? C.card : C.feltSoft,
                  color: i === 0 ? C.cream : C.ink,
                  borderLeft: i > 0 ? `1px solid ${C.ink}` : undefined,
                }}
              >
                {x.min}분
              </span>
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
            {course.parts.map((x, i) => (
              <li key={x.label} className="inline-flex items-center gap-2">
                <span aria-hidden className="h-3 w-3 rounded-[2px] border" style={{ borderColor: C.ink, background: i === 0 ? C.ink : i === 1 ? C.card : C.feltSoft }} />
                {x.label} {x.min}분
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[15px]" style={{ color: C.muted }}>
            {course.side}
          </p>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t pt-5" style={{ borderColor: C.line }}>
            <dl className="flex flex-wrap gap-x-8 gap-y-2">
              {fees.map((f) => (
                <div key={f.times}>
                  <dt className="text-[14px]" style={{ color: C.muted }}>
                    월 교습비 {f.times}
                  </dt>
                  <dd className="text-[22px] font-bold tabular-nums" style={serifF}>
                    {won(f.price)}
                  </dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={onTrial}
              data-gtm-cta={`${SLUG}_course_trial`}
              className={`inline-flex h-12 items-center gap-2 rounded-[4px] px-5 text-[16px] font-bold ${focusRing}`}
              style={{ background: C.felt, color: "#fff", outlineColor: C.ink }}
            >
              <CalendarCheck size={18} aria-hidden />
              {course.name} 체험 레슨 신청
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 진도를 오선 위 음표로. 단계가 올라갈수록 음이 높아진다 */
function Staff({ course, reduce }: { course: Course; reduce: boolean }) {
  const n = course.steps.length;
  const xs = course.steps.map((_, i) => 60 + (i * 480) / (n - 1));
  const ys = course.steps.map((_, i) => 92 - (i * 54) / (n - 1));
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x} ${ys[i]}`).join(" ");
  return (
    <div className="mt-3">
      <svg viewBox="0 0 600 120" className="block h-auto w-full" role="img" aria-label={`${course.name} 과정 진도: ${course.steps.map((s) => s.book).join(", ")}`}>
        {[38, 50, 62, 74, 86].map((y) => (
          <line key={y} x1="10" x2="590" y1={y} y2={y} stroke="rgba(23,20,15,0.35)" strokeWidth="1.2" />
        ))}
        <line x1="10" x2="10" y1="38" y2="86" stroke={C.ink} strokeWidth="2" />
        <line x1="584" x2="584" y1="38" y2="86" stroke={C.ink} strokeWidth="2" />
        <line x1="590" x2="590" y1="38" y2="86" stroke={C.ink} strokeWidth="4" />
        <motion.path
          d={d}
          fill="none"
          stroke={C.felt}
          strokeWidth="2.5"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : STAFF_DUR, ease: EASE }}
        />
        {xs.map((x, i) => (
          <motion.g
            key={i}
            initial={reduce ? false : { y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : (i * STAFF_DUR) / n, ease: EASE }}
          >
            <ellipse cx={x} cy={ys[i]} rx="11" ry="8" transform={`rotate(-22 ${x} ${ys[i]})`} fill={i === n - 1 ? C.felt : C.ink} />
            <rect x={x + 7.5} y={ys[i] - 44} width="3" height="44" fill={i === n - 1 ? C.felt : C.ink} />
          </motion.g>
        ))}
      </svg>
      <ol className="grid gap-2 text-center" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {course.steps.map((s) => (
          <li key={s.book} className="text-[14px] leading-snug md:text-[15px]">
            <span className="block font-bold">{s.book}</span>
            <span className="block" style={{ color: C.muted }}>
              {s.span}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- 2. 요일별 시간표 ---------- */

function TimetableSection({
  today,
  course,
  setCourseId,
  pickDow,
  pickTime,
  onPick,
}: {
  today: Date;
  course: Course;
  setCourseId: (id: CourseId) => void;
  pickDow: number | null;
  pickTime: string | null;
  onPick: (dow: number, time: string) => void;
}) {
  const who = course.who;
  const times = timesOf(who);
  const todayDow = today.getDay();
  const [mDow, setMDow] = useState<number | null>(null);
  const mobileDow = mDow ?? (todayDow === 0 ? 1 : todayDow);
  const setWho = (w: Who) => {
    if (w !== who) setCourseId(w === "adult" ? "adult" : "beyer");
  };
  const tab = `h-11 rounded-[4px] px-4 text-[15px] font-bold border ${focusRing}`;

  const cell = (dow: number, time: string, wide: boolean) => {
    const n = left(dow, time);
    const full = n <= 0;
    const picked = pickDow === dow && pickTime === time;
    return (
      <button
        type="button"
        disabled={full}
        onClick={() => onPick(dow, time)}
        aria-label={`${DOW[dow]}요일 ${time}, ${full ? "마감" : `남은 자리 ${n}`}${picked ? ", 고른 시간" : ""}`}
        data-gtm-cta={`${SLUG}_timetable_pick`}
        className={`${wide ? "w-full" : "min-w-[112px]"} h-11 rounded-[4px] border px-2 text-[14px] font-bold tabular-nums transition-colors ${focusRing} disabled:cursor-not-allowed`}
        style={{
          borderColor: full ? C.line : C.ink,
          background: picked ? C.ink : full ? "transparent" : C.card,
          color: picked ? C.cream : full ? C.muted : C.ink,
          outlineColor: C.felt,
          textDecoration: full ? "line-through" : undefined,
        }}
      >
        {full ? "마감" : picked ? "고른 시간" : `자리 ${n}`}
      </button>
    );
  };

  return (
    <section id="pa-timetable" aria-labelledby="pa-timetable-title" className="mx-auto mt-20 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionTitle id="pa-timetable-title" title="수업시간표" />
      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="시간대">
        {(["kid", "adult"] as Who[]).map((w) => (
          <button
            key={w}
            type="button"
            aria-pressed={who === w}
            onClick={() => setWho(w)}
            className={tab}
            style={{ borderColor: C.ink, background: who === w ? C.ink : "transparent", color: who === w ? C.cream : C.ink, outlineColor: C.felt }}
          >
            {w === "kid" ? "유초등 과정" : "성인 취미"}
          </button>
        ))}
        <p className="ml-1 text-[15px]" style={{ color: C.muted }}>
          한 시간에 {CAP}명까지, 칸을 누르면 체험 레슨 시간으로 담겨요
        </p>
      </div>

      {/* PC: 요일 x 시간 표 */}
      <div className="mt-6 hidden overflow-hidden rounded-[6px] border md:block" style={{ borderColor: C.line, background: C.card }}>
        <table className="w-full border-collapse text-[15px]">
          <caption className="sr-only">{who === "kid" ? "유초등 과정" : "성인 취미"} 요일별 수업 시간과 남은 자리</caption>
          <thead>
            <tr style={{ background: C.paperDeep }}>
              <th scope="col" className="w-[110px] px-4 py-3 text-left font-bold">
                시간
              </th>
              {OPEN_DAYS.map((d) => (
                <th key={d} scope="col" className="px-2 py-3 text-center font-bold">
                  {DOW[d]}
                  {d === todayDow && (
                    <span className="ml-1.5 rounded-[3px] px-1.5 py-0.5 text-[12px]" style={{ background: C.felt, color: "#fff" }}>
                      오늘
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((t) => (
              <tr key={t} className="border-t" style={{ borderColor: C.line }}>
                <th scope="row" className="px-4 py-2 text-left font-bold tabular-nums">
                  {t}
                </th>
                {OPEN_DAYS.map((d) => (
                  <td key={d} className="px-2 py-2 text-center" style={{ background: d === todayDow ? "rgba(163,48,42,0.05)" : undefined }}>
                    {slotsFor(d, who).includes(t) ? cell(d, t, true) : <span className="sr-only">수업 없음</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 휴대폰: 요일 고르고 목록 */}
      <div className="mt-5 md:hidden">
        <div className="grid grid-cols-6 gap-1" role="group" aria-label="요일">
          {OPEN_DAYS.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={mobileDow === d}
              onClick={() => setMDow(d)}
              className={`h-11 rounded-[4px] border text-[15px] font-bold ${focusRing}`}
              style={{ borderColor: C.ink, background: mobileDow === d ? C.ink : C.card, color: mobileDow === d ? C.cream : C.ink, outlineColor: C.felt }}
            >
              {DOW[d]}
            </button>
          ))}
        </div>
        <ul className="mt-3 divide-y rounded-[6px] border" style={{ borderColor: C.line, background: C.card }}>
          {slotsFor(mobileDow, who).map((t) => (
            <li key={t} className="flex items-center justify-between gap-3 px-4 py-2.5" style={{ borderColor: C.line }}>
              <span className="text-[16px] font-bold tabular-nums">
                {DOW[mobileDow]} {t}
              </span>
              {cell(mobileDow, t, false)}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
        일요일, 공휴일 휴원. 수업 시간은 50분이에요.
      </p>
    </section>
  );
}

/* ---------- 교습비 ---------- */

function FeeSection({ today }: { today: Date }) {
  return (
    <section id="pa-fees" aria-labelledby="pa-fees-title" className="mx-auto mt-20 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionTitle id="pa-fees-title" title="교습비 안내" />
      <div className="mt-6 overflow-x-auto rounded-[6px] border" style={{ borderColor: C.line, background: C.card }}>
        <table className="w-full min-w-[340px] border-collapse text-left text-[15px]">
          <caption className="sr-only">교습과정별 월 교습비</caption>
          <thead>
            <tr style={{ background: C.paperDeep }}>
              <th scope="col" className="px-4 py-3 font-bold">
                교습과정
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                교습시간
              </th>
              <th scope="col" className="px-4 py-3 text-right font-bold">
                월 교습비
              </th>
            </tr>
          </thead>
          <tbody>
            {FEES.map((f) => (
              <tr key={f.course + f.times} className="border-t" style={{ borderColor: C.line }}>
                <td className="px-4 py-3 font-bold">{f.course}</td>
                <td className="px-4 py-3" style={{ color: C.muted }}>
                  {f.times}, {f.time}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-bold tabular-nums">{won(f.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[14px] leading-relaxed" style={{ color: C.muted }}>
        교육지원청에 신고한 교습비예요. 교재비는 실비로 따로 받아요. 게시일 {fmtDot(daysAgo(today, 21))}.
      </p>
    </section>
  );
}

/* ---------- 3. 체험 레슨 신청 ---------- */

const AGES = ["미취학(6~7세)", "초등 1~3학년", "초등 4~6학년", "중고등", "성인"];
const EXPS = ["처음이에요", "조금 쳐 봤어요", "체르니 이상 쳐 봤어요"];

interface Done {
  no: string;
  course: string;
  when: string;
  name: string;
  phone: string;
  reply: string;
}

function TrialSection({
  reduce,
  today,
  dates,
  course,
  setCourseId,
  pickDow,
  setPickDow,
  pickTime,
  setPickTime,
}: {
  reduce: boolean;
  today: Date;
  dates: Date[];
  course: Course;
  setCourseId: (id: CourseId) => void;
  pickDow: number | null;
  setPickDow: (d: number | null) => void;
  pickTime: string | null;
  setPickTime: (t: string | null) => void;
}) {
  const [age, setAge] = useState(course.who === "adult" ? "성인" : AGES[1]);
  const [exp, setExp] = useState(EXPS[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const date = dates.find((d) => d.getDay() === pickDow) ?? null;
  const slots = date ? slotsFor(date.getDay(), course.who) : [];
  const timeOk = !!pickTime && slots.includes(pickTime) && date !== null && left(date.getDay(), pickTime) > 0;
  const digits = phone.replace(/\D/g, "");
  const errs = {
    when: !date || !timeOk ? "체험 날짜와 시간을 골라 주세요." : "",
    name: name.trim().length < 2 ? "이름을 두 글자 이상 적어 주세요." : "",
    phone: !/^01\d{8,9}$/.test(digits) ? "휴대폰 번호를 확인해 주세요." : "",
    agree: !agree ? "개인정보 수집에 동의해 주세요." : "",
  };
  const hasErr = Object.values(errs).some(Boolean);
  const adult = course.who === "adult";

  const pickCourse = (id: CourseId) => {
    const c = courseOf(id);
    setCourseId(id);
    if (c.who !== course.who) {
      setPickTime(null);
      setAge(c.who === "adult" ? "성인" : AGES[1]);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (hasErr || !date || !pickTime) return;
    let reply = daysAgo(today, -1);
    while (reply.getDay() === 0) reply = daysAgo(reply, -1);
    const seq = (Number(digits.slice(-4)) * 37) % 900 + 100;
    setDone({
      no: `PA-${String(today.getFullYear()).slice(2)}${p2(today.getMonth() + 1)}${p2(today.getDate())}-${seq}`,
      course: course.name,
      when: `${fmtKo(date)} ${pickTime}`,
      name: maskName(name),
      phone: maskPhone(digits.length === 11 ? `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}` : digits),
      reply: `${fmtKo(reply)} 오후 6시까지`,
    });
  };

  const reset = () => {
    setDone(null);
    setName("");
    setPhone("");
    setAgree(false);
    setTried(false);
    setPickTime(null);
    setPickDow(null);
  };

  const chip = `min-h-11 rounded-[4px] border px-3 text-[15px] font-bold ${focusRing}`;
  const chipStyle = (on: boolean, disabled = false): CSSProperties => ({
    borderColor: disabled ? C.line : C.ink,
    background: on ? C.ink : disabled ? "transparent" : C.card,
    color: on ? C.cream : disabled ? C.muted : C.ink,
    outlineColor: C.felt,
  });
  const label = "block text-[15px] font-bold";
  const input = `mt-2 h-12 w-full rounded-[4px] border px-3 text-[16px] ${focusRing}`;
  const errText = (m: string, id: string) =>
    tried && m ? (
      <p id={id} role="alert" className="mt-1.5 text-[14px] font-bold" style={{ color: C.error }}>
        {m}
      </p>
    ) : null;

  return (
    <section id="pa-trial" aria-labelledby="pa-trial-title" className="mt-20 scroll-mt-4 md:mt-24" style={{ background: C.paperDeep }}>
      <div className="mx-auto max-w-[1200px] px-4 py-14 md:px-6 md:py-16">
        <SectionTitle id="pa-trial-title" title="체험 레슨 신청" />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-12">
          <div className="text-[16px] leading-[1.75]">
            <p className="text-[20px] font-bold" style={serifF}>
              30분, 교습비 없이 받아 보세요
            </p>
            <ul className="mt-4 space-y-2">
              {["원장 선생님과 1:1로 손 모양과 진도를 봐요", "연습실과 수업 방식을 직접 보고 정하시면 돼요", "보호자 한 분 같이 오셔도 돼요"].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check size={18} aria-hidden className="mt-1 flex-none" style={{ color: C.felt }} />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[15px]" style={{ color: C.muted }}>
              신청하시면 {KAKAO} 또는 전화 <span className="whitespace-nowrap">{TEL}</span>로 시간을 확정해 드려요.
            </p>
          </div>

          <div className="rounded-[8px] border p-5 md:p-7" style={{ borderColor: C.line, background: C.card }}>
            <AnimatePresence mode="wait" initial={false}>
              {done ? (
                <motion.div
                  key="done"
                  initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
                  animate={{ clipPath: "inset(0 0 0% 0)" }}
                  exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }}
                  transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                  role="status"
                  aria-live="polite"
                >
                  <p className="inline-flex items-center gap-2 text-[15px] font-bold" style={{ color: C.felt }}>
                    <Check size={18} aria-hidden />
                    체험 레슨 신청 접수
                  </p>
                  <p className="mt-2 text-[26px] font-bold tabular-nums" style={serifF}>
                    {done.no}
                  </p>
                  <dl className="mt-5 grid grid-cols-[96px_minmax(0,1fr)] gap-y-2.5 text-[16px]">
                    <dt style={{ color: C.muted }}>과정</dt>
                    <dd className="font-bold">{done.course}</dd>
                    <dt style={{ color: C.muted }}>희망 일시</dt>
                    <dd className="font-bold">{done.when}</dd>
                    <dt style={{ color: C.muted }}>이름</dt>
                    <dd>{done.name}</dd>
                    <dt style={{ color: C.muted }}>연락처</dt>
                    <dd className="tabular-nums">{done.phone}</dd>
                    <dt style={{ color: C.muted }}>담당 창구</dt>
                    <dd>
                      {KAKAO}, 전화 <span className="whitespace-nowrap">{TEL}</span>
                    </dd>
                    <dt style={{ color: C.muted }}>회신 예정</dt>
                    <dd>{done.reply} 문자로 시간을 확정해 드려요</dd>
                  </dl>
                  <button
                    type="button"
                    onClick={reset}
                    className={`mt-6 inline-flex h-11 items-center gap-2 rounded-[4px] border px-4 text-[15px] font-bold ${focusRing}`}
                    style={{ borderColor: C.ink, outlineColor: C.felt }}
                  >
                    <RotateCcw size={16} aria-hidden />
                    다른 시간 신청
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" noValidate onSubmit={submit} exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.15 } }} className="space-y-6">
                  <fieldset>
                    <legend className={label}>과정</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {COURSES.map((c) => (
                        <button key={c.id} type="button" aria-pressed={c.id === course.id} onClick={() => pickCourse(c.id)} className={chip} style={chipStyle(c.id === course.id)}>
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset>
                    <legend className={label}>희망 날짜</legend>
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {dates.map((d) => {
                        const on = date !== null && d.getTime() === date.getTime();
                        return (
                          <button
                            key={d.getTime()}
                            type="button"
                            aria-pressed={on}
                            onClick={() => {
                              setPickDow(d.getDay());
                              if (pickTime && !slotsFor(d.getDay(), course.who).includes(pickTime)) setPickTime(null);
                            }}
                            className={`${chip} flex flex-col items-center justify-center py-1.5 leading-tight`}
                            style={chipStyle(on)}
                          >
                            <span className="tabular-nums">
                              {d.getMonth() + 1}.{d.getDate()}
                            </span>
                            <span className="text-[13px] font-normal">{DOW[d.getDay()]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <fieldset aria-describedby={tried && errs.when ? "pa-err-when" : undefined}>
                    <legend className={label}>시간</legend>
                    {date ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {slots.map((t) => {
                          const n = left(date.getDay(), t);
                          const on = pickTime === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              disabled={n <= 0}
                              aria-pressed={on}
                              onClick={() => setPickTime(t)}
                              className={`${chip} tabular-nums disabled:cursor-not-allowed`}
                              style={{ ...chipStyle(on, n <= 0), textDecoration: n <= 0 ? "line-through" : undefined }}
                            >
                              {t} {n <= 0 ? "마감" : `(자리 ${n})`}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-2 text-[15px]" style={{ color: C.muted }}>
                        날짜를 먼저 골라 주세요.
                      </p>
                    )}
                    {errText(errs.when, "pa-err-when")}
                  </fieldset>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="pa-age" className={label}>
                        나이
                      </label>
                      <select id="pa-age" value={age} onChange={(e) => setAge(e.target.value)} className={input} style={{ borderColor: C.ink, background: "#fff", outlineColor: C.felt }}>
                        {AGES.filter((a) => (adult ? a === "성인" || a === "중고등" : a !== "성인")).map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="pa-exp" className={label}>
                        피아노 경험
                      </label>
                      <select id="pa-exp" value={exp} onChange={(e) => setExp(e.target.value)} className={input} style={{ borderColor: C.ink, background: "#fff", outlineColor: C.felt }}>
                        {EXPS.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="pa-name" className={label}>
                        {adult ? "이름" : "학생 이름"}
                      </label>
                      <input
                        id="pa-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        aria-invalid={tried && !!errs.name}
                        aria-describedby={tried && errs.name ? "pa-err-name" : undefined}
                        className={input}
                        style={{ borderColor: tried && errs.name ? C.error : C.ink, background: "#fff", outlineColor: C.felt }}
                      />
                      {errText(errs.name, "pa-err-name")}
                    </div>
                    <div>
                      <label htmlFor="pa-phone" className={label}>
                        {adult ? "휴대폰" : "보호자 휴대폰"}
                      </label>
                      <input
                        id="pa-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="010-0000-0000"
                        aria-invalid={tried && !!errs.phone}
                        aria-describedby={tried && errs.phone ? "pa-err-phone" : undefined}
                        className={input}
                        style={{ borderColor: tried && errs.phone ? C.error : C.ink, background: "#fff", outlineColor: C.felt }}
                      />
                      {errText(errs.phone, "pa-err-phone")}
                    </div>
                  </div>

                  <div>
                    <label className="flex cursor-pointer items-start gap-3 text-[15px]">
                      <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                        aria-invalid={tried && !!errs.agree}
                        className="mt-0.5 h-5 w-5 flex-none"
                        style={{ accentColor: C.felt }}
                      />
                      <span>체험 레슨 연락을 위한 이름, 연락처 수집에 동의해요. 상담이 끝나면 3개월 안에 지워요.</span>
                    </label>
                    {errText(errs.agree, "pa-err-agree")}
                  </div>

                  <button
                    type="submit"
                    data-gtm-cta={`${SLUG}_trial_submit`}
                    className={`inline-flex h-13 w-full items-center justify-center gap-2 rounded-[4px] py-3.5 text-[17px] font-bold sm:w-auto sm:px-8 ${focusRing}`}
                    style={{ background: C.felt, color: "#fff", outlineColor: C.ink }}
                  >
                    <CalendarCheck size={19} aria-hidden />
                    체험 레슨 신청하기
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. 연주회 소식 ---------- */

function ConcertSection({ today }: { today: Date }) {
  const day = concertDate(today);
  const dd = Math.round((day.getTime() - today.getTime()) / 86400000);
  const rehearsal = daysAgo(day, 7);
  const notices = [
    {
      title: "정기 연주회 안내",
      date: daysAgo(today, 3),
      body: [
        `일시: ${fmtKo(day)} 오후 3시`,
        "장소: ㅇㅇ구민회관 소공연장",
        "참가: 재원생 중 희망하는 학생 누구나",
        "관람: 가족, 친구 누구나 무료, 예약 없이 오시면 돼요",
      ],
    },
    {
      title: "연주회 곡 정하기",
      date: daysAgo(today, 10),
      body: ["지금 치는 진도에 맞춰 선생님과 한 곡씩 정해요.", "처음 나가는 학생은 선생님과 같이 치는 연탄곡으로 해도 돼요."],
    },
    {
      title: "리허설 일정",
      date: daysAgo(today, 1),
      body: [`${fmtKo(rehearsal)} 오전 10시~12시, 학원 연주실에서 해요.`, "무대 인사와 걸어 나가는 순서까지 같이 연습해요."],
    },
    {
      title: "연주회 날 준비물",
      date: daysAgo(today, 0),
      body: ["연주복은 평소 깔끔한 옷이면 충분해요.", "시작 40분 전까지 대기실로 와 주세요. 악보는 학원에서 챙겨 가요."],
    },
  ];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="pa-concert" aria-labelledby="pa-concert-title" className="scroll-mt-4" style={{ background: C.night, color: C.cream }}>
      <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6 md:py-20">
        <SectionTitle id="pa-concert-title" title="연주회 소식" dark />
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          <div>
            <p className="text-[15px]" style={{ color: C.creamMuted }}>
              정기 연주회
            </p>
            <p className="mt-2 text-[34px] font-bold leading-tight md:text-[44px]" style={serifF}>
              {day.getMonth() + 1}월 {day.getDate()}일 {DOW[day.getDay()]}요일
            </p>
            <p className="mt-1 text-[20px]" style={serifF}>
              오후 3시, ㅇㅇ구민회관 소공연장
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-[4px] px-3 py-1.5 text-[16px] font-bold tabular-nums" style={{ background: C.felt, color: "#fff" }}>
              <Clock size={17} aria-hidden />
              {dd}일 남았어요
            </p>

            <h3 className="mt-10 text-[17px] font-bold">과정별 연주곡</h3>
            <ul className="mt-3 divide-y" style={{ borderColor: "rgba(243,234,215,0.18)" }}>
              {PROGRAM.map((x) => (
                <li key={x.course} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-4" style={{ borderColor: "rgba(243,234,215,0.18)" }}>
                  <span className="w-[100px] flex-none text-[15px]" style={{ color: C.creamMuted }}>
                    {x.course}
                  </span>
                  <span className="text-[16px]">{x.piece}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[17px] font-bold">공지사항</h3>
            <ul className="mt-3 border-t" style={{ borderColor: "rgba(243,234,215,0.3)" }}>
              {notices.map((n, i) => {
                const on = open === i;
                return (
                  <li key={n.title} className="border-b" style={{ borderColor: "rgba(243,234,215,0.3)" }}>
                    <h4>
                      <button
                        type="button"
                        aria-expanded={on}
                        aria-controls={`pa-notice-${i}`}
                        onClick={() => setOpen(on ? null : i)}
                        className={`flex w-full items-center justify-between gap-4 py-4 text-left ${focusRing}`}
                        style={{ outlineColor: C.cream }}
                      >
                        <span className="text-[17px] font-bold">{n.title}</span>
                        <span className="flex flex-none items-center gap-3 text-[14px] tabular-nums" style={{ color: C.creamMuted }}>
                          {fmtDot(n.date)}
                          <ChevronDown size={18} aria-hidden className="transition-transform duration-200" style={{ transform: on ? "rotate(180deg)" : undefined }} />
                        </span>
                      </button>
                    </h4>
                    <div id={`pa-notice-${i}`} hidden={!on} className="pb-5 text-[16px] leading-[1.75]" style={{ color: "#e4dac4" }}>
                      {n.body.map((b) => (
                        <p key={b}>{b}</p>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 오시는 길 ---------- */

function VisitSection() {
  const rows: [typeof MapPin, string, string][] = [
    [MapPin, "주소", ADDRESS],
    [Clock, "수업 시간", "평일 13:00~21:30, 토요일 10:00~14:00, 일요일, 공휴일 휴원"],
    [Car, "주차", "건물 뒤 주차 2대, 등하원 때 학원 앞 잠깐 정차 가능"],
    [Phone, "전화", TEL],
    [MessageCircle, "상담", `${KAKAO}, 평일 오후 1시부터 답해요`],
  ];
  return (
    <section id="pa-visit" aria-labelledby="pa-visit-title" className="mx-auto mt-20 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionTitle id="pa-visit-title" title="오시는 길" />
      <dl className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-2">
        {rows.map(([Icon, k, v]) => (
          <div key={k} className="flex gap-3 border-t pt-4" style={{ borderColor: C.line }}>
            <Icon size={20} aria-hidden className="mt-0.5 flex-none" style={{ color: C.felt }} />
            <div>
              <dt className="text-[14px]" style={{ color: C.muted }}>
                {k}
              </dt>
              <dd className="mt-0.5 text-[16px] font-bold">{v}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
