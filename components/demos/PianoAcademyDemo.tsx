"use client";

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
   1. 교육과정: 바이엘, 체르니, 소나티네, 성인 취미 네 과정의 진도와 수업 구성을 목록으로 보여 준다.
   2. 수업시간표: 과정별 평일, 토요일 수업 시간 표.
   3. 체험 레슨 신청: 과정, 나이, 날짜, 시간, 이름, 연락처. 완료하면 접수 번호, 담당 창구, 회신 예정일.
   4. 연주회 소식: 다음 정기 연주회 날짜, 공지 펼쳐 보기, 과정별 연주곡.

   첫 화면(pa-poster): 메뉴 줄, 막 없는 레슨실 사진 띠, 그 아래 제목과 나이 칩 다섯 개, 고른 나이의 과정 카드.
   핵심 모션: 사진만 1.6초 동안 천천히 다가오고(scale 1.06 에서 1), 카드 내용은 0.2초 겹쳐 바뀐다. 동작 줄이기면 전부 멈춘 상태로 둔다.
   사진 출처: Pexels 사진 34767574 */

const TEL = "02-000-0000";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 2층";
const KAKAO = "카카오톡 채널 피아노 학원";
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
const POSTER_CSS = `@keyframes pa-in{from{transform:scale(1.06)}}.pa-in{animation:pa-in ${PHOTO_IN}s cubic-bezier(0.22,1,0.36,1) both}@media (prefers-reduced-motion:reduce){.pa-in{animation:none}}`;
const IMG = "/images/demo-piano-academy";

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

const SLOTS: Record<Who, { weekday: string[]; sat: string[] }> = {
  kid: { weekday: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"], sat: ["10:00", "11:00"] },
  adult: { weekday: ["19:30", "20:30"], sat: ["12:00", "13:00"] },
};
const slotsFor = (dow: number, who: Who) => (dow === 0 ? [] : dow === 6 ? SLOTS[who].sat : SLOTS[who].weekday);

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
  /* 첫 화면 나이 칩과 체험 레슨 신청의 나이는 같은 값이다 */
  const [age, setAge] = useState(AGES[1]);
  const course = courseOf(courseId);

  /* 체험 레슨 신청 상태 */
  const dates = useMemo(() => trialDates(today), [today]);
  const [pickDow, setPickDow] = useState<number | null>(null);
  const [pickTime, setPickTime] = useState<string | null>(null);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });


  return (
    <div className="min-h-screen overflow-x-clip pb-20 md:pb-0" style={{ background: C.paper, color: C.ink }}>
      <Poster
        reduce={reduce}
        go={go}
        age={age}
        onAge={(a) => {
          setAge(a);
          setCourseId(AGE_COURSE[a]?.course ?? "beyer");
        }}
      />

      <CourseSection onTrial={() => go("pa-trial")} />
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
      <TimetableSection />
      <FeeSection today={today} />
      <TrialSection
        reduce={reduce}
        today={today}
        dates={dates}
        course={course}
        setCourseId={setCourseId}
        age={age}
        setAge={setAge}
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

/* ---------- 첫 화면 ---------- */

/* 첫 화면 구조(국내 피아노 학원, 음악교실 사이트 조사, 2026-10): 메뉴 줄 아래 레슨실 사진 가로 띠(막 없음), 띠 아래 흰 영역 왼쪽에
   제목과 나이 칩 다섯 개, 오른쪽에 고른 나이의 과정 카드 하나. 칩을 누르면 카드만 바뀌고, 아래 체험 레슨 신청의
   과정과 나이도 같이 바뀐다. 처음엔 초등 1~3학년. 휴대폰에서는 메뉴를 가로로 넘기는 한 줄로, 사진 띠는 낮게, 나이 칩은 가로 한 줄,
   카드는 칩 아래 전체 폭, 하단 고정 줄에 체험 레슨, 전화 두 버튼.
   모션: 사진만 1.06배에서 1배로 1.6초 동안 다가오고, 카드 내용은 0.2초 겹쳐 바뀐다. 동작 줄이기면 모두 끈다. */
const CARD_DUR = 0.2;

const NAV: [string, string][] = [
  ["pa-course", "교육과정"],
  ["pa-timetable", "수업시간표"],
  ["pa-fees", "교습비 안내"],
  ["pa-trial", "체험 레슨"],
  ["pa-concert", "연주회"],
  ["pa-visit", "오시는 길"],
];

/** 나이 칩마다 이어지는 과정과 교습비 게시표 줄 */
const AGE_COURSE: Record<string, { course: CourseId; fee: string }> = {
  "미취학(6~7세)": { course: "beyer", fee: "유초등 피아노" },
  "초등 1~3학년": { course: "beyer", fee: "유초등 피아노" },
  "초등 4~6학년": { course: "czerny", fee: "유초등 피아노" },
  중고등: { course: "sonatine", fee: "중고등 피아노" },
  성인: { course: "adult", fee: "성인 취미" },
};

function Poster({ reduce, go, age, onAge }: { reduce: boolean; go: (id: string) => void; age: string; onAge: (age: string) => void }) {
  const pick = AGE_COURSE[age] ?? AGE_COURSE[AGES[1]];
  const course = courseOf(pick.course);
  const fees = FEES.filter((f) => f.course === pick.fee);
  const navBtn = `inline-flex h-11 flex-none items-center rounded-[4px] px-3 text-[15px] font-semibold underline-offset-4 hover:underline ${focusRing}`;

  return (
    <section id="pa-poster" aria-labelledby="pa-poster-title" style={{ background: C.paper, color: C.ink }}>
      <style>{POSTER_CSS}</style>

      {/* 메뉴: PC 는 한 줄, 휴대폰은 로고 아래 가로로 넘기는 줄 */}
      <header className="border-b" style={{ borderColor: C.line }}>
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
          <p>
            <SampleLogo />
          </p>
          <nav aria-label="주요 메뉴" className="hidden items-center lg:flex">
            {NAV.map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.felt }}>
                {label}
              </button>
            ))}
          </nav>
          <a
            href={`tel:${TEL.replace(/-/g, "")}`}
            className={`hidden h-11 flex-none items-center gap-1.5 rounded-[6px] border px-3 text-[15px] font-semibold tabular-nums md:inline-flex ${focusRing}`}
            style={{ borderColor: C.line, color: C.ink, outlineColor: C.felt }}
          >
            <Phone size={16} aria-hidden />
            {TEL}
          </a>
        </div>
        <nav aria-label="주요 메뉴" className="-mt-1 flex overflow-x-auto px-2 pb-1 lg:hidden">
          {NAV.map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.felt }}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* 레슨실 사진 띠 */}
      <div className="relative h-[28svh] min-h-[200px] overflow-hidden md:h-[36svh] lg:h-[36svh] lg:max-h-[360px]" style={{ background: "#3a2a24" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
        <img
          src={`${IMG}/hero.jpg`}
          srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
          sizes="100vw"
          alt="갈색 업라이트 피아노 건반 위에 오른손을 올린 모습"
          fetchPriority="high"
          className={`absolute inset-0 h-full w-full object-cover ${reduce ? "" : "pa-in"}`}
          style={{ objectPosition: "55% 60%" }}
        />
      </div>

      {/* 제목, 나이 칩, 과정 카드 */}
      <div className="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-6 px-4 pb-12 pt-7 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:pb-16 lg:pt-8">
        <div>
          <h1 id="pa-poster-title" className="text-[30px] font-bold md:text-[42px]" style={{ wordBreak: "keep-all", letterSpacing: "-0.035em", lineHeight: 1.2 }}>
            원장 선생님과 1:1 개인 레슨
          </h1>
          <p className="mt-2 text-[15px] font-medium tabular-nums md:text-[16px]" style={{ color: C.muted }}>
            평일 13:00~21:30, 토요일 10:00~14:00
          </p>

          <fieldset className="mt-7 min-w-0">
            <legend className="text-[16px] font-bold">나이</legend>
            <div role="radiogroup" aria-label="나이" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
              {AGES.map((a) => {
                const on = a === age;
                return (
                  <button
                    key={a}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => onAge(a)}
                    className={`inline-flex h-11 flex-none items-center gap-1.5 rounded-full border px-4 text-[15px] font-semibold transition-colors duration-150 ${focusRing}`}
                    style={{ borderColor: on ? C.felt : C.line, background: on ? C.felt : C.paper, color: on ? "#fff" : C.ink, outlineColor: C.felt }}
                  >
                    {on && <Check size={15} aria-hidden />}
                    {a}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* 고른 나이의 과정 카드 */}
        <div className="rounded-[10px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.paperDeep }} aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={age}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -6 }}
              transition={{ duration: reduce ? 0 : CARD_DUR, ease: EASE }}
            >
              <p className="text-[14px] font-bold" style={{ color: C.felt }}>
                {age}
              </p>
              <p className="mt-1 text-[24px] font-bold tracking-[-0.02em]">
                {course.name} <span className="text-[16px] font-semibold" style={{ color: C.muted }}>{course.sub}</span>
              </p>
              <ol className="mt-4 grid gap-1.5 text-[15px]">
                {course.steps.map((st, i) => (
                  <li key={st.book} className="grid grid-cols-[1.5em_minmax(0,1fr)_auto] items-baseline gap-2">
                    <span className="text-[13px] font-bold tabular-nums" style={{ color: C.muted }}>
                      {i + 1}
                    </span>
                    <span className="font-semibold">{st.book}</span>
                    <span className="text-[14px]" style={{ color: C.muted }}>
                      {st.span}
                    </span>
                  </li>
                ))}
              </ol>
              <dl className="mt-5 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 border-t pt-4" style={{ borderColor: C.line }}>
                {fees.map((f) => (
                  <div key={f.times}>
                    <dt className="text-[14px]" style={{ color: C.muted }}>
                      {f.times}, {f.time}
                    </dt>
                    <dd className="text-[20px] font-bold tabular-nums">{won(f.price)}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 text-[14px]" style={{ color: C.muted }}>
                1:1 개인 레슨, 월 교습비, 교재비 별도
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <button
              type="button"
              onClick={() => go("pa-trial")}
              data-gtm-cta={`${SLUG}_poster_cta`}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-[6px] px-4 text-[16px] font-semibold ${focusRing}`}
              style={{ background: C.felt, color: "#fff", outlineColor: C.ink }}
            >
              <CalendarCheck size={18} aria-hidden />
              체험 레슨 신청
            </button>
            <button
              type="button"
              onClick={() => go("pa-course")}
              className={`inline-flex h-12 items-center justify-center rounded-[6px] border px-4 text-[15px] font-semibold ${focusRing}`}
              style={{ borderColor: "#c8c8c8", background: C.paper, color: C.ink, outlineColor: C.felt }}
            >
              교육과정
            </button>
          </div>
        </div>
      </div>

      {/* 휴대폰: 하단 고정 줄 두 버튼 */}
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 border-t px-4 py-3 md:hidden" style={{ background: C.paper, borderColor: C.line, paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}>
        <button
          type="button"
          onClick={() => go("pa-trial")}
          data-gtm-cta={`${SLUG}_sticky_trial`}
          className={`inline-flex h-12 items-center justify-center gap-1.5 rounded-[6px] text-[16px] font-semibold text-white ${focusRing}`}
          style={{ background: C.felt, outlineColor: C.ink }}
        >
          <CalendarCheck size={18} aria-hidden />
          체험 레슨
        </button>
        <a
          href={`tel:${TEL.replace(/-/g, "")}`}
          className={`inline-flex h-12 items-center justify-center gap-1.5 rounded-[6px] border text-[16px] font-semibold ${focusRing}`}
          style={{ borderColor: C.line, color: C.ink, outlineColor: C.felt }}
        >
          <Phone size={18} aria-hidden />
          전화
        </a>
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

/* ---------- 1. 교육과정 ---------- */

function CourseSection({ onTrial }: { onTrial: () => void }) {
  return (
    <section id="pa-course" aria-labelledby="pa-course-title" className="mx-auto mt-8 max-w-[1200px] scroll-mt-4 px-4 md:mt-12 md:px-6">
      <SectionTitle id="pa-course-title" title="교육과정" />
      <p className="mt-4 text-[16px]" style={{ color: C.muted }}>
        모든 과정은 1:1 개인 레슨과 개인 연습실 연습으로 진행해요. 한 번 수업은 50분이에요.
      </p>

      <ul className="mt-6 grid gap-5 md:grid-cols-2">
        {COURSES.map((c) => (
          <li key={c.id} className="rounded-[8px] border p-5 md:p-6" style={{ borderColor: C.line, background: C.card }}>
            <h3 className="text-[22px] font-bold tracking-[-0.02em]">
              {c.name} <span className="text-[15px] font-semibold" style={{ color: C.muted }}>{c.sub}</span>
            </h3>
            <p className="mt-1 text-[15px] font-bold" style={{ color: C.felt }}>
              {c.target}
            </p>
            <ol className="mt-4 grid gap-1.5 text-[15px]">
              {c.steps.map((st, i) => (
                <li key={st.book} className="grid grid-cols-[1.5em_minmax(0,1fr)_auto] items-baseline gap-2">
                  <span className="text-[13px] font-bold tabular-nums" style={{ color: C.muted }}>
                    {i + 1}
                  </span>
                  <span className="font-semibold">{st.book}</span>
                  <span className="text-[14px]" style={{ color: C.muted }}>
                    {st.span}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t pt-3 text-[15px]" style={{ borderColor: C.line }}>
              <span className="font-bold">수업 구성</span> {c.parts.map((x) => `${x.label} ${x.min}분`).join(", ")}
            </p>
            <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
              {c.side}
            </p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onTrial}
        data-gtm-cta={`${SLUG}_course_trial`}
        className={`mt-6 inline-flex h-12 items-center gap-2 rounded-[6px] px-5 text-[16px] font-semibold ${focusRing}`}
        style={{ background: C.felt, color: "#fff", outlineColor: C.ink }}
      >
        <CalendarCheck size={18} aria-hidden />
        체험 레슨 신청
      </button>
    </section>
  );
}

/* ---------- 2. 수업시간표 ---------- */

const HOURS: { who: string; weekday: string; sat: string }[] = [
  { who: "유초등, 중고등", weekday: "13:00~19:00", sat: "10:00~12:00" },
  { who: "성인 취미", weekday: "19:30~21:30", sat: "12:00~14:00" },
];

function TimetableSection() {
  return (
    <section id="pa-timetable" aria-labelledby="pa-timetable-title" className="mx-auto mt-20 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionTitle id="pa-timetable-title" title="수업시간표" />
      <div className="mt-6 overflow-x-auto rounded-[6px] border" style={{ borderColor: C.line, background: C.card }}>
        <table className="w-full min-w-[340px] border-collapse text-left text-[15px]">
          <caption className="sr-only">과정별 수업 시간</caption>
          <thead>
            <tr style={{ background: C.paperDeep }}>
              <th scope="col" className="px-4 py-3 font-bold">
                과정
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                평일(월~금)
              </th>
              <th scope="col" className="px-4 py-3 font-bold">
                토요일
              </th>
            </tr>
          </thead>
          <tbody>
            {HOURS.map((h) => (
              <tr key={h.who} className="border-t" style={{ borderColor: C.line }}>
                <th scope="row" className="px-4 py-3 font-bold">
                  {h.who}
                </th>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums">{h.weekday}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums">{h.sat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[14px]" style={{ color: C.muted }}>
        매시 정각에 시작하는 50분 수업이에요. 요일과 시간은 등록 상담 때 정해요. 일요일, 공휴일 휴원.
      </p>
    </section>
  );
}


/* ---------- 교습비 ---------- */

function FeeSection({ today }: { today: Date }) {
  return (
    <section id="pa-fees" aria-labelledby="pa-fees-title" className="mx-auto mt-20 max-w-[1200px] scroll-mt-4 px-4 md:mt-24 md:px-6">
      <SectionTitle id="pa-fees-title" title="교습비 안내" />
      <ul className="mt-6 divide-y rounded-[6px] border md:hidden" style={{ borderColor: C.line, background: C.card }} aria-label="교습과정별 월 교습비">
        {FEES.map((f) => (
          <li key={`m${f.course}${f.times}`} className="px-4 py-3" style={{ borderColor: C.line }}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-bold">{f.course}</span>
              <span className="whitespace-nowrap font-bold tabular-nums">{won(f.price)}</span>
            </div>
            <p className="mt-1 text-[14px]" style={{ color: C.muted }}>
              {f.times}, {f.time}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-6 hidden overflow-x-auto rounded-[6px] border md:block" style={{ borderColor: C.line, background: C.card }}>
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
  age,
  setAge,
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
  age: string;
  setAge: (age: string) => void;
  pickDow: number | null;
  setPickDow: (d: number | null) => void;
  pickTime: string | null;
  setPickTime: (t: string | null) => void;
}) {
  const [exp, setExp] = useState(EXPS[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const date = dates.find((d) => d.getDay() === pickDow) ?? null;
  const slots = date ? slotsFor(date.getDay(), course.who) : [];
  const timeOk = !!pickTime && slots.includes(pickTime) && date !== null;
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
  const chipStyle = (on: boolean): CSSProperties => ({
    borderColor: on ? C.felt : "#c8c8c8",
    background: on ? C.felt : C.card,
    color: on ? "#fff" : C.ink,
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
                          const on = pickTime === t;
                          return (
                            <button key={t} type="button" aria-pressed={on} onClick={() => setPickTime(t)} className={`${chip} tabular-nums`} style={chipStyle(on)}>
                              {t}
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
            <p className="mt-3 text-[16px]" style={{ color: C.muted }}>
              재원생 누구나 참가, 관람은 가족, 친구 누구나 무료
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
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          피아노 학원
        </span>
      </span>
    </span>
  );
}
