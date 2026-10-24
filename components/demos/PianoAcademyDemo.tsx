"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { CalendarCheck, Car, Check, ChevronDown, Clock, MapPin, MessageCircle, Phone, RotateCcw } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDot, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 피아노 학원 홈페이지 샘플: 가상의 피아노 학원 곰파트너(유초등 개인 레슨과 성인 취미반).
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

   첫 화면(pa-poster): 피아노 건반 위 손 사진 한 장을 화면 가득 깔고 왼쪽 아래에 문장 "원장 선생님과 1:1 개인 레슨"를 둔다.
   핵심 모션: 들어올 때 사진이 1.6초 동안 천천히 다가오고(scale 1.06 에서 1), 문장은 0.3초 늦게 아래 12px 에서 올라온다(CSS).
   스크롤하면 사진만 조금 느리게 내려간다(y 0 에서 8%). 동작 줄이기면 전부 멈춘 상태로 둔다.
   사진 출처: Pexels 사진 34767574 */

const TEL = "02-000-0000";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 2층";
const KAKAO = "카카오톡 채널 곰파트너";
const SLUG = "piano-academy";

const TEACHERS = [
  { id: "1", name: "서ㅇ진", role: "원장", note: "피아노 전공, 독주회 2회, 지도 15년" },
  { id: "2", name: "강ㅎ린", role: "선생님", note: "피아노 전공, 바이엘, 체르니반 담당" },
  { id: "3", name: "문ㅈ호", role: "선생님", note: "작곡 전공, 성인반, 반주법 담당" },
];

const C = {
  paper: "#ffffff",
  /** 구역 구분 옅은 회색 */
  paperDeep: "#f7f7f5",
  card: "#ffffff",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#707070",
  line: "#e5e5e5",
  /** 강조색 하나: 피아노 몸통 색에 맞춘 차분한 적갈색 */
  felt: "#8a3a2c",
  feltSoft: "#f1e7e4",
  error: "#b42318",
};

/* 모션 상수. 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 첫 화면 사진이 다가오는 시간(초) */
const PHOTO_IN = 1.6;
/** 사진 위 막. 왼쪽 아래를 어둡게 해 흰 글자 대비를 맞춘다 */
const SCRIM = "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.15)), linear-gradient(to right, rgba(0,0,0,0.35), rgba(0,0,0,0) 65%)";
const POSTER_CSS = `@keyframes pa-rise{from{opacity:0;transform:translateY(12px)}}.pa-rise{animation:pa-rise .7s cubic-bezier(0.22,1,0.36,1) .3s both}@media (prefers-reduced-motion:reduce){.pa-rise{animation:none}}`;
const IMG = "/images/demo-piano-academy";
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
        <h2>
          <SampleLogo />
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
      <section id="pa-teachers" aria-labelledby="pa-teachers-title" className="mx-auto mt-20 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
        <SectionTitle id="pa-teachers-title" title="선생님" />
        <ul className="grid gap-8 sm:grid-cols-3 md:gap-6">
          {TEACHERS.map((t) => (
            <li key={t.id}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
              <img src={`${IMG}/staff-${t.id}.jpg`} alt={`${t.role} ${t.name}`} className="block aspect-[4/5] w-full rounded-[8px] object-cover" />
              <p className="mt-3 text-[18px] font-bold" style={{ color: C.ink }}>
                {t.name} <span className="text-[15px] font-semibold" style={{ color: C.muted }}>{t.role}</span>
              </p>
              <p className="mt-1 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
                {t.note}
              </p>
            </li>
          ))}
        </ul>
      </section>
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
          <p>
            <SampleLogo size={18} />
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
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  return (
    <section id="pa-poster" ref={ref} aria-labelledby="pa-poster-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: "#141414", color: "#fff" }}>
      <style>{POSTER_CSS}</style>
      <motion.div className="absolute inset-0" style={{ y: photoY }}>
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: reduce ? 0 : PHOTO_IN, ease: EASE }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
          <img
            src={`${IMG}/hero.jpg`}
            srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
            sizes="100vw"
            alt="갈색 업라이트 피아노 건반 위에 오른손을 올린 모습"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "58% center" }}
          />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0" style={{ background: SCRIM }} aria-hidden />

      {/* 로고와 핵심 행동 하나 */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 pt-4 md:px-6 md:pt-6">
        <p>
          <SampleLogo light size={18} />
        </p>
        <button
          type="button"
          onClick={onCta}
          data-gtm-cta={`${SLUG}_poster_cta`}
          className={`inline-flex h-11 flex-none items-center gap-1.5 rounded-[6px] px-4 text-[15px] font-semibold ${focusRing}`}
          style={{ background: C.felt, color: "#fff", outlineColor: "#fff" }}
        >
          <CalendarCheck size={17} aria-hidden />
          체험 레슨
        </button>
      </div>

      {/* 문장 */}
      <div className={`${reduce ? "" : "pa-rise"} relative z-10 mx-auto mt-auto w-full max-w-[1200px] px-4 pb-[12svh] md:px-6`}>
        <h1
          id="pa-poster-title"
          className="text-[36px] font-bold md:text-[clamp(40px,5vw,72px)]"
          style={{ wordBreak: "keep-all", letterSpacing: "-0.03em", lineHeight: 1.2 }}
        >
          원장 선생님과
          <br />
          1:1 개인 레슨
        </h1>
        <p className="mt-4 text-[16px] font-medium tabular-nums md:mt-6 md:text-[18px]" style={{ color: "rgba(255,255,255,0.88)" }}>
          평일 13:00~21:30, 토요일 10:00~14:00
        </p>
      </div>
    </section>
  );
}

/* ---------- 공용 ---------- */

function SectionTitle({ id, title }: { id: string; title: string }) {
  return (
    <div className="border-b pb-3" style={{ borderColor: C.line }}>
      <h2 id={id} className="text-[28px] font-bold leading-tight tracking-[-0.03em] md:text-[36px]" style={{ color: C.ink }}>
        {title}
      </h2>
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
          <div role="group" aria-label="과정 고르기" className="relative flex gap-px overflow-hidden rounded-[6px] border" style={{ background: C.line, borderColor: C.line }}>
            {COURSES.map((c) => {
              const on = c.id === course.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCourseId(c.id)}
                  className={`relative flex h-[184px] flex-1 flex-col items-center justify-end px-1 pb-4 text-center transition-colors duration-150 md:h-[220px] ${focusRing}`}
                  style={{
                    background: on ? C.paperDeep : "#ffffff",
                    boxShadow: on ? `inset 0 -3px 0 ${C.felt}` : undefined,
                    outlineColor: C.felt,
                    outlineOffset: -3,
                    color: C.ink,
                  }}
                >
                  <span className="text-[16px] font-bold leading-tight md:text-[18px]">
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
                </button>
              );
            })}
            {/* 건반 사이 검은 건반 */}
            {[25, 50, 75].map((x) => (
              <span
                key={x}
                aria-hidden
                className="pointer-events-none absolute top-0 h-[40%] w-[9%] -translate-x-1/2 rounded-b-[3px]"
                style={{ left: `${x}%`, background: "#222222" }}
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
          <h3 className="mt-1 text-[24px] font-bold md:text-[28px]">
            {course.name} 과정 진도
          </h3>
          <Staff key={course.id} course={course} reduce={reduce} />

          <h4 className="mt-7 text-[17px] font-bold">한 번 수업 {total}분</h4>
          <div className="mt-3 flex h-12 overflow-hidden rounded-[4px] border" style={{ borderColor: C.line }} aria-hidden>
            {course.parts.map((x, i) => (
              <span
                key={x.label}
                className="flex items-center justify-center text-[14px] font-bold tabular-nums"
                style={{
                  flexGrow: x.min,
                  flexBasis: 0,
                  background: i === 0 ? C.felt : i === 1 ? C.card : C.feltSoft,
                  color: i === 0 ? "#fff" : C.ink,
                  borderLeft: i > 0 ? `1px solid ${C.line}` : undefined,
                }}
              >
                {x.min}분
              </span>
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
            {course.parts.map((x, i) => (
              <li key={x.label} className="inline-flex items-center gap-2">
                <span aria-hidden className="h-3 w-3 rounded-[2px] border" style={{ borderColor: i === 0 ? C.felt : "#b5b5b5", background: i === 0 ? C.felt : i === 1 ? C.card : C.feltSoft }} />
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
                  <dd className="text-[22px] font-bold tabular-nums">
                    {won(f.price)}
                  </dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={onTrial}
              data-gtm-cta={`${SLUG}_course_trial`}
              className={`inline-flex h-12 items-center gap-2 rounded-[6px] px-5 text-[16px] font-semibold ${focusRing}`}
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
          <line key={y} x1="10" x2="590" y1={y} y2={y} stroke="#d4d4d4" strokeWidth="1.2" />
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
  const tab = `h-11 rounded-[6px] px-4 text-[15px] font-semibold border ${focusRing}`;

  const cell = (dow: number, time: string, wide: boolean) => {
    const n = left(dow, time);
    const full = n <= 0;
    const picked = pickDow === dow && pickTime === time;
    return (
      <button
        type="button"
        disabled={full}
        onClick={() => onPick(dow, time)}
        aria-label={`${DOW[dow]}요일 ${time}, ${full ? "마감" : `남은 자리 ${n}`}${picked ? ", 선택" : ""}`}
        data-gtm-cta={`${SLUG}_timetable_pick`}
        className={`${wide ? "w-full" : "min-w-[112px]"} h-11 rounded-[4px] border px-2 text-[14px] font-bold tabular-nums transition-colors ${focusRing} disabled:cursor-not-allowed`}
        style={{
          borderColor: picked ? C.felt : full ? C.line : "#c8c8c8",
          background: picked ? C.felt : full ? "transparent" : C.card,
          color: picked ? "#fff" : full ? C.muted : C.ink,
          outlineColor: C.felt,
          textDecoration: full ? "line-through" : undefined,
        }}
      >
        {full ? "마감" : picked ? "선택" : `자리 ${n}`}
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
            style={{ borderColor: who === w ? C.felt : "#c8c8c8", background: who === w ? C.felt : "transparent", color: who === w ? "#fff" : C.ink, outlineColor: C.felt }}
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
                  <td key={d} className="px-2 py-2 text-center" style={{ background: d === todayDow ? C.paperDeep : undefined }}>
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
              style={{ borderColor: mobileDow === d ? C.felt : "#c8c8c8", background: mobileDow === d ? C.felt : C.card, color: mobileDow === d ? "#fff" : C.ink, outlineColor: C.felt }}
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

  const chip = `min-h-11 rounded-[6px] border px-3 text-[15px] font-semibold ${focusRing}`;
  const chipStyle = (on: boolean, disabled = false): CSSProperties => ({
    borderColor: on ? C.felt : disabled ? C.line : "#c8c8c8",
    background: on ? C.felt : disabled ? "transparent" : C.card,
    color: on ? "#fff" : disabled ? C.muted : C.ink,
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
            <p className="text-[20px] font-bold">
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
                  <p className="mt-2 text-[26px] font-bold tabular-nums">
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
                    className={`mt-6 inline-flex h-11 items-center gap-2 rounded-[6px] border px-4 text-[15px] font-semibold ${focusRing}`}
                    style={{ borderColor: "#c8c8c8", outlineColor: C.felt }}
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
                      <select id="pa-age" value={age} onChange={(e) => setAge(e.target.value)} className={input} style={{ borderColor: "#c8c8c8", background: "#fff", outlineColor: C.felt }}>
                        {AGES.filter((a) => (adult ? a === "성인" || a === "중고등" : a !== "성인")).map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="pa-exp" className={label}>
                        피아노 경험
                      </label>
                      <select id="pa-exp" value={exp} onChange={(e) => setExp(e.target.value)} className={input} style={{ borderColor: "#c8c8c8", background: "#fff", outlineColor: C.felt }}>
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
                        style={{ borderColor: tried && errs.name ? C.error : "#c8c8c8", background: "#fff", outlineColor: C.felt }}
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
                        style={{ borderColor: tried && errs.phone ? C.error : "#c8c8c8", background: "#fff", outlineColor: C.felt }}
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
                    className={`inline-flex h-13 w-full items-center justify-center gap-2 rounded-[6px] py-3.5 text-[17px] font-semibold sm:w-auto sm:px-8 ${focusRing}`}
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
    <section id="pa-concert" aria-labelledby="pa-concert-title" className="scroll-mt-4" style={{ color: C.ink }}>
      <div className="mx-auto max-w-[1200px] px-4 pt-16 md:px-6 md:pt-20">
        <SectionTitle id="pa-concert-title" title="연주회 소식" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          <div>
            <p className="text-[15px]" style={{ color: C.muted }}>
              정기 연주회
            </p>
            <p className="mt-2 text-[34px] font-bold leading-tight md:text-[44px]">
              {day.getMonth() + 1}월 {day.getDate()}일 {DOW[day.getDay()]}요일
            </p>
            <p className="mt-1 text-[20px]">
              오후 3시, ㅇㅇ구민회관 소공연장
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-[4px] px-3 py-1.5 text-[16px] font-bold tabular-nums" style={{ background: C.felt, color: "#fff" }}>
              <Clock size={17} aria-hidden />
              {dd}일 남았어요
            </p>

            <h3 className="mt-10 text-[17px] font-bold">과정별 연주곡</h3>
            <ul className="mt-3 divide-y" style={{ borderColor: C.line }}>
              {PROGRAM.map((x) => (
                <li key={x.course} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-4" style={{ borderColor: C.line }}>
                  <span className="w-[100px] flex-none text-[15px]" style={{ color: C.muted }}>
                    {x.course}
                  </span>
                  <span className="text-[16px]">{x.piece}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[17px] font-bold">공지사항</h3>
            <ul className="mt-3 border-t" style={{ borderColor: C.line }}>
              {notices.map((n, i) => {
                const on = open === i;
                return (
                  <li key={n.title} className="border-b" style={{ borderColor: C.line }}>
                    <h4>
                      <button
                        type="button"
                        aria-expanded={on}
                        aria-controls={`pa-notice-${i}`}
                        onClick={() => setOpen(on ? null : i)}
                        className={`flex w-full items-center justify-between gap-4 py-4 text-left ${focusRing}`}
                        style={{ outlineColor: C.felt }}
                      >
                        <span className="text-[17px] font-bold">{n.title}</span>
                        <span className="flex flex-none items-center gap-3 text-[14px] tabular-nums" style={{ color: C.muted }}>
                          {fmtDot(n.date)}
                          <ChevronDown size={18} aria-hidden className="transition-transform duration-200" style={{ transform: on ? "rotate(180deg)" : undefined }} />
                        </span>
                      </button>
                    </h4>
                    <div id={`pa-notice-${i}`} hidden={!on} className="pb-5 text-[16px] leading-[1.75]" style={{ color: C.body }}>
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

/* 로고: 메인 사이트와 같은 곰 로고 + 곰파트너(크게) + 업종(작게) */
function SampleLogo({ light, size = 20 }: { light?: boolean; size?: number }) {
  const mark = size + 8;
  return (
    <span className="inline-flex items-center gap-2 leading-none" style={{ color: light ? "#fff" : "#111" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 메인 사이트와 같은 곰 로고 */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={mark} height={mark} className="shrink-0" style={{ width: mark, height: mark }} />
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          곰파트너
        </span>
        <span className="text-[12px] font-semibold opacity-75">피아노 학원 샘플</span>
      </span>
    </span>
  );
}
