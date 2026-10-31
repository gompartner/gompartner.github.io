"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { BookOpen, CalendarCheck, Check, ChevronLeft, Clock, FileText, MessageCircle, MessagesSquare, PenLine, RotateCcw, Wallet } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 독서 논술 학원 홈페이지 샘플: 가상의 독서 논술 학원 곰파트너. 초등 1학년부터 중학교 3학년까지 주 1회 90분 수업.
   상호, 원장 이름, 주소, 전화번호, 손님 이름은 모두 가상이다. 책 목록은 실제로 많이 읽히는 책이다.

   국내 독서 논술 학원 사이트 공통 구성(참고): 메뉴는 학원 소개, 교육 과정, 이달의 도서(학년별 필독서),
   수업 시간표, 교습비 안내, 상담 신청, 오시는 길. 첫 화면에 "무료 상담 신청", "이달의 도서" 바로가기를 둔다.
   수업은 읽기, 토론, 쓰기 순서가 많고, 첨삭한 원고지를 사진으로 보호자에게 보내 주는 곳이 많다.
   교습비는 교육청 신고 교습비처럼 반별 "월 교습비"로 적고 교재비는 따로 적는다. 합격 실적, 학생 실명은 쓰지 않는다.

   첫 화면(ra-poster): 상단 메뉴(휴대폰은 둥근 메뉴 줄을 옆으로 민다) 아래 왼쪽은 책 네 권을 든 사진, 오른쪽은 문장 "읽고 토론하고 쓰는 90분"과
   독서 습관 진단 카드. 학년을 고르고 읽기, 토론, 쓰기 문항 셋에 하나씩 답하면 카드가 결과로 바뀐다(추천 반, 시간, 먼저 챙길 부분, 이달의 책 두 권).
   결과의 버튼은 아래 상담 신청(학년 채움), 수업 과정(그 단계 열림), 이달의 책(그 학년 열림)으로 이어진다. 휴대폰은 결과가 나오면 하단에 체험 수업 신청 버튼을 고정한다.
   사진 출처: Pexels 사진 8762862, 책 사진 book-(id)는 AI 생성(Z-Image-Turbo)

   모션: 들어올 때 사진이 1600ms 동안 scale 1.06 -> 1 로 다가오고, 오른쪽 글은 300ms 늦게 아래 12px 에서 올라온다.
   진단 카드는 문항이 바뀔 때 200ms 옆으로 짧게 넘어간다. 본문에서 움직이는 곳은 첨삭 예시의 빨간 펜 표시 하나다. 동작 줄이기면 모두 없음.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 이번 달 읽는 책: 학년을 고르면 주차별 책 네 권과 쓰기 질문, 이번 달 쓰기 분량이 나온다.
   2. 수업 과정: 90분 막대에서 읽기, 토론, 쓰기를 고르면 수업에서 하는 일과 집에서 할 일이 나온다.
   3. 첨삭 예시: 원고지 글 위에 빨간 펜 첨삭이 차례로 그려진다. 고침 설명을 누르면 그 표시만 진하게 보인다.
   4. 상담 신청: 학년, 방법, 희망일, 시간, 보호자 이름, 연락처. 완료 화면에 접수 번호, 담당 창구, 회신 예정일. */

const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";

const IMG = "/images/demo-reading-academy";

/* 첨삭 예시 원고지 색. 빨강은 첨삭 표시에만 쓴다 */
const P = {
  paper: "#fcfcfa",
  line: "#c3ccb8",
  ink: "#111111",
  red: "#9b2c2c",
};

/* 색: 바탕 흰색과 옅은 회색, 강조색은 짙은 초록 하나 */
const C = {
  bg: "#f7f7f5",
  card: "#ffffff",
  ink: "#111111",
  body: "#4b4b4b",
  accent: "#3d5a2e",
  soft: "#eef1ea",
  red: "#9b2c2c",
  muted: "#767676",
  border: "#e5e5e5",
  dark: "#1c1c1c",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 첫 화면 사진이 다가오는 시간 */
const HERO_DUR = 1.6;
/** 문장 등장 시간과 늦춤(ms) */
const RISE_MS = 700;
const RISE_DELAY_MS = 300;
/** 첨삭 예시 표시 하나를 긋는 시간과 표시 사이 간격 */
const MARK_DUR = 0.45;
const MARK_GAP = 0.55;

const HERO_CSS = `
@keyframes ra-rise {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}
.ra-rise { animation: ra-rise ${RISE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) ${RISE_DELAY_MS}ms both; }
@media (prefers-reduced-motion: reduce) {
  .ra-rise { animation: none; }
}
`;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/* ---------- 원고지 무늬 ---------- */

/** 칸 테두리와 줄 사이 띠. w, h 는 한 칸과 띠를 합친 무늬 한 장 크기, cellH 는 칸 높이 */
function gridBg(w: string, h: string, cellH: string, line: string, paper: string): CSSProperties {
  const hLines = `linear-gradient(180deg, ${line} 0 1.5px, transparent 1.5px calc(${cellH} - 1.5px), ${line} calc(${cellH} - 1.5px) ${cellH}, transparent ${cellH})`;
  const band = `linear-gradient(180deg, transparent 0 ${cellH}, ${paper} ${cellH})`;
  const vLines = `linear-gradient(90deg, ${line} 0 1.5px, transparent 1.5px)`;
  return { backgroundColor: paper, backgroundImage: `${hLines}, ${band}, ${vLines}`, backgroundSize: `${w} ${h}` };
}

/* ---------- 첨삭 표시 도형 ---------- */

type Pt = [number, number];

function ellipsePts(cx: number, cy: number, rx: number, ry: number): Pt[] {
  const out: Pt[] = [];
  const n = 28;
  const start = -2.75;
  const sweep = Math.PI * 2 + 0.55;
  for (let i = 0; i <= n; i++) {
    const a = start + (sweep * i) / n;
    const k = 1 + 0.05 * Math.sin(a * 3) + (i / n) * 0.06;
    out.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return out;
}

const ptsToD = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(3)} ${p[1].toFixed(3)}`).join(" ");

/* ---------- 이번 달 읽는 책 ---------- */

type Book = { id: string; t: string; a: string; kind: string; q: string };
const GRADES: { label: string; amount: string; books: Book[] }[] = [
  {
    label: "초등 1~2학년",
    amount: "원고지 반 장(100자)",
    books: [
      { id: "gangaji", t: "강아지똥", a: "권정생 글, 정승각 그림", kind: "그림책", q: "나도 쓸모 있다고 느낀 때가 있나요?" },
      { id: "gureumppang", t: "구름빵", a: "백희나", kind: "그림책", q: "구름빵을 먹으면 어디에 가고 싶나요?" },
      { id: "alsatang", t: "알사탕", a: "백희나", kind: "그림책", q: "알사탕으로 누구 마음을 듣고 싶나요?" },
      { id: "stripes", t: "줄무늬가 생겼어요", a: "데이빗 섀논", kind: "그림책", q: "남과 달라서 걱정한 적이 있나요?" },
    ],
  },
  {
    label: "초등 3~4학년",
    amount: "원고지 한 장(200자)",
    books: [
      { id: "hen", t: "마당을 나온 암탉", a: "황선미", kind: "동화", q: "잎싹은 왜 마당을 나왔을까?" },
      { id: "tteokjip", t: "만복이네 떡집", a: "김리리", kind: "동화", q: "말 한마디로 친구 마음이 바뀐 적 있나요?" },
      { id: "frindle", t: "프린들 주세요", a: "앤드루 클레먼츠", kind: "동화", q: "낱말은 누가 정할까?" },
      { id: "charlotte", t: "샬롯의 거미줄", a: "E. B. 화이트", kind: "동화", q: "친구를 위해 내가 할 수 있는 일은?" },
    ],
  },
  {
    label: "초등 5~6학년",
    amount: "원고지 한 장(400자)",
    books: [
      { id: "mongsil", t: "몽실 언니", a: "권정생", kind: "소설", q: "몽실이는 왜 끝까지 동생을 업었을까?" },
      { id: "bookhouse", t: "책과 노니는 집", a: "이영서", kind: "역사 동화", q: "책을 베껴 쓰는 일은 왜 위험했을까?" },
      { id: "prince", t: "어린 왕자", a: "생텍쥐페리", kind: "고전", q: "길들인다는 건 무슨 뜻일까?" },
      { id: "wonder", t: "아름다운 아이", a: "R. J. 팔라시오", kind: "소설", q: "친절과 옳은 일 중 하나를 고른다면?" },
    ],
  },
  {
    label: "중학생",
    amount: "원고지 두 장(800자)",
    books: [
      { id: "almond", t: "아몬드", a: "손원평", kind: "소설", q: "공감은 배워서 생길까?" },
      { id: "animalfarm", t: "동물농장", a: "조지 오웰", kind: "고전", q: "규칙은 누가 바꿀 수 있을까?" },
      { id: "wandeuk", t: "완득이", a: "김려령", kind: "소설", q: "어른이 도와준다는 건 어떤 모습일까?" },
      { id: "orange", t: "나의 라임오렌지나무", a: "J. M. 바스콘셀로스", kind: "고전", q: "어른이 아이 마음을 모를 때는?" },
    ],
  },
];

/* ---------- 수업 과정 ---------- */

const STEPS = [
  {
    label: "읽기",
    min: 20,
    icon: BookOpen,
    inClass: ["이번 주 책에서 한 장면을 골라 소리 내어 읽어요.", "모르는 낱말은 낱말 공책에 적고 뜻을 짐작해 봐요."],
    atHome: "책은 집에서 한 주 동안 읽어 와요. 하루 20~30쪽이면 돼요.",
  },
  {
    label: "토론",
    min: 30,
    icon: MessagesSquare,
    inClass: ["질문 하나로 4~6명이 이야기해요.", "내 생각과 까닭을 말하고 친구 생각에 되물어요."],
    atHome: "수업 날 저녁에 그 질문을 가족과 한 번 더 이야기해 보세요.",
  },
  {
    label: "쓰기",
    min: 40,
    icon: PenLine,
    inClass: ["토론한 질문으로 원고지 한 장을 써요.", "다 쓰면 소리 내어 읽고 스스로 한 번 고쳐요."],
    atHome: "다음 수업 전에 빨간 펜 첨삭본 사진을 카카오톡으로 보내 드려요.",
  },
];
const TOTAL_MIN = STEPS.reduce((s, x) => s + x.min, 0);
/** 각 단계가 시작하는 분 */
const STEP_FROM = STEPS.map((_, i) => STEPS.slice(0, i).reduce((s, x) => s + x.min, 0));

/* ---------- 교습비 ---------- */

const CLASSES = [
  { name: "초등 저학년반", who: "1~2학년", time: "월, 수, 금 15:00 ~ 16:30 중 하루", fee: 140_000 },
  { name: "초등 중학년반", who: "3~4학년", time: "월, 수 16:40 / 화, 목 15:00 중 하루", fee: 150_000 },
  { name: "초등 고학년반", who: "5~6학년", time: "화, 목 16:40 / 토 10:00 중 하루", fee: 160_000 },
  { name: "중등반", who: "중1~중3", time: "화, 목 18:30 / 토 13:00 중 하루", fee: 180_000 },
];

/* ---------- 첨삭 예시 ---------- */

const ESSAY_TITLE = "잎싹이 나온 까닭";
const ESSAY_GRADE = "4학년";
const ESSAY =
  "잎싹은 알을 품고 싶어서 마당을 나왔다. 양계장 안에서는 알을 낳아도 품을수 없었기 때문이다. 나는 처음에 잎싹이 바보 같다고 생각했다. 마당에 있으면 밥도 주고 안전하기 때문이다. 그런데 끝까지 읽고 생각이 바뀌게 됬다. 잎싹은 하고 싶은 일을 위해 위험을 참았다.";
/** 첨삭 원고지 줄 사이 띠 높이(칸 한 변 대비) */
const GE = 0.48;
const NOTES = [
  { title: "띄어쓰기", text: "품을 수, 이렇게 띄어 써요." },
  { title: "맞춤법", text: "되었다를 줄이면 됐다예요." },
  { title: "누가 주나요?", text: "밥을 주는 사람을 넣어 봐요. 주인이 밥을 주고, 처럼요." },
  { title: "좋은 문장", text: "이 문장으로 글을 시작해도 좋아요." },
];
const FINAL_NOTE = "까닭을 두 가지나 찾았어요. 다음엔 내가 잎싹이라면 어떻게 했을지 한 줄 더 써 봐요.";

/* ---------- 상담 ---------- */

const GRADE_OPTS = ["초1", "초2", "초3", "초4", "초5", "초6", "중1", "중2", "중3"] as const;
const METHODS = ["방문 상담", "전화 상담"] as const;
const SLOTS = ["오후 3시", "오후 5시", "오후 7시"] as const;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];

const HOURS = [
  { label: "평일", time: "13:00 ~ 21:00" },
  { label: "토요일", time: "10:00 ~ 15:00" },
  { label: "일요일, 공휴일", time: "휴원" },
];

/** 다음 날부터 일요일을 뺀 n일 */
function nextOpenDays(from: Date, n: number) {
  const out: Date[] = [];
  let d = from;
  while (out.length < n) {
    d = daysAgo(d, -1);
    if (d.getDay() !== 0) out.push(d);
  }
  return out;
}

const subscribeWide = (cb: () => void) => {
  const m = window.matchMedia("(min-width: 768px)");
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
function useWide() {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true,
  );
}

export function ReadingAcademyDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const [grade, setGrade] = useState<(typeof GRADE_OPTS)[number]>("초3");
  const [bookGrade, setBookGrade] = useState(1);
  const [courseStep, setCourseStep] = useState(0);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const month = today.getMonth() + 1;
  const nextMonth = (month % 12) + 1;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.ink }}>
      <Poster
        reduce={reduce}
        go={go}
        onConsult={(g) => {
          setGrade(g);
          go("ra-consult");
        }}
        onBooks={(gi) => {
          setBookGrade(gi);
          go("ra-books");
        }}
        onStep={(si) => {
          setCourseStep(si);
          go("ra-course");
        }}
      />

      <section id="ra-books" aria-labelledby="ra-books-title" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pt-10 md:px-6 md:pt-14">
        <CellTitle id="ra-books-title" text={`${month}월 읽는 책`} />
        <Books g={bookGrade} setG={setBookGrade} />
      </section>

      <section id="ra-course" aria-labelledby="ra-course-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <CellTitle id="ra-course-title" text="수업 과정" />
        <Course reduce={reduce} s={courseStep} setS={setCourseStep} />
      </section>

      <section id="ra-correct" aria-labelledby="ra-correct-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <CellTitle id="ra-correct-title" text="첨삭 예시" />
        <Correction reduce={reduce} />
      </section>

      <section id="ra-fee" aria-labelledby="ra-fee-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <CellTitle id="ra-fee-title" text="교습비 안내" />
        <FeeTable onConsult={() => go("ra-consult")} />
      </section>

      <section id="ra-consult" aria-labelledby="ra-consult-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <CellTitle id="ra-consult-title" text="상담 신청" />
        <ConsultForm today={today} reduce={reduce} grade={grade} setGrade={setGrade} />
      </section>

      <div className="mx-auto mt-14 grid max-w-[1200px] gap-10 px-4 md:mt-20 md:grid-cols-[1.2fr_1fr] md:px-6">
        <section id="ra-visit" aria-labelledby="ra-visit-title" className="scroll-mt-4">
          <CellTitle id="ra-visit-title" text="오시는 길" />
          <dl className="mt-5 grid gap-x-6 gap-y-3 text-[16px] sm:grid-cols-[auto_1fr]">
            <dt className="font-bold">주소</dt>
            <dd>{ADDRESS}</dd>
            <dt className="font-bold">지하철</dt>
            <dd>ㅇㅇ역 2번 출구에서 걸어서 4분</dd>
            <dt className="font-bold">주차</dt>
            <dd>건물 뒤 2대, 상담 오실 때만 가능</dd>
            <dt className="font-bold">운영 시간</dt>
            <dd>
              <ul>
                {HOURS.map((h) => (
                  <li key={h.label}>
                    <span className="inline-block w-[7.5em] font-semibold">{h.label}</span>
                    {h.time}
                  </li>
                ))}
              </ul>
            </dd>
          </dl>
        </section>
        <section aria-labelledby="ra-notice-title">
          <CellTitle id="ra-notice-title" text="공지사항" />
          <ul className="mt-5 border-t" style={{ borderColor: C.ink }}>
            {[
              { d: 2, t: `${nextMonth}월 읽는 책 목록 안내` },
              { d: 9, t: "토요반 수업 시간 변경 안내" },
              { d: 20, t: "겨울방학 고전 읽기 특강 신청 안내" },
            ].map((n) => (
              <li key={n.t} className="flex items-baseline justify-between gap-4 border-b py-3 text-[16px]" style={{ borderColor: C.border }}>
                <span className="min-w-0">{n.t}</span>
                <span className="flex-none text-[14px] tabular-nums" style={{ color: C.muted }}>
                  {fmtDash(daysAgo(today, n.d))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="mt-16 px-4 pb-28 pt-10 text-[14px] leading-[1.8] md:px-6" style={{ background: C.dark, color: "#c8c8c8" }}>
        <div className="mx-auto max-w-[1200px]">
          <p>
            <SampleLogo light size={18} />
          </p>
          <p>
            {ADDRESS} / 전화 {TEL} / {KAKAO}
          </p>
          <DemoMakerInfo className="mt-6 text-white" />
        </div>
      </footer>
    </div>
  );
}

/* ---------- 공용 조각 ---------- */

/** 구역 제목 */
function CellTitle({ id, text }: { id: string; text: string }) {
  return (
    <h2 id={id} className="text-[26px] font-bold leading-tight md:text-[32px]" style={{ letterSpacing: "-0.02em" }}>
      {text}
    </h2>
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
        <span className="text-[12px] font-semibold opacity-75">카탈로그</span>
      </span>
    </span>
  );
}

/* ---------- 첫 화면: 세 문항 진단 카드 ---------- */

const NAV: [string, string][] = [
  ["ra-course", "수업 안내"],
  ["ra-books", "이달의 책"],
  ["ra-correct", "첨삭 예시"],
  ["ra-fee", "교습비"],
  ["ra-consult", "상담 신청"],
  ["ra-visit", "오시는 길"],
];
/** 진단 학년 묶음. 순서는 GRADES, CLASSES 와 같다 */
const DX_GRADES = [
  { label: "초1~2", consult: "초1" },
  { label: "초3~4", consult: "초3" },
  { label: "초5~6", consult: "초5" },
  { label: "중등", consult: "중1" },
] as const;
/** 문항 하나가 수업 단계 하나(읽기, 토론, 쓰기)에 맞춰진다 */
const DX_QUESTIONS = ["책 한 권을 끝까지 혼자 읽나요?", "읽은 책 줄거리를 말로 설명하나요?", "생각을 원고지 반 장 넘게 쓰나요?"];
const DX_ANSWERS = ["잘해요", "가끔", "어려워요"];

function Poster({
  reduce,
  go,
  onConsult,
  onBooks,
  onStep,
}: {
  reduce: boolean;
  go: (id: string) => void;
  onConsult: (g: (typeof GRADE_OPTS)[number]) => void;
  onBooks: (gi: number) => void;
  onStep: (si: number) => void;
}) {
  const [gi, setGi] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const step = gi === null ? 0 : answers.length + 1; // 0 학년, 1~3 문항, 4 결과
  const done = step === 4;
  // 가장 어렵다고 고른 단계. 같으면 뒤쪽(쓰기)을 먼저 챙긴다
  const weak = done ? answers.reduce((w, a, i) => (a >= answers[w] ? i : w), 0) : 0;
  const cls = gi === null ? null : CLASSES[gi];
  const reset = () => {
    setGi(null);
    setAnswers([]);
  };
  const back = () => (answers.length ? setAnswers((a) => a.slice(0, -1)) : setGi(null));
  const slide = reduce ? {} : { initial: { opacity: 0, x: 16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 }, transition: { duration: 0.2, ease: EASE } };
  const answerBtn = `flex min-h-[52px] w-full items-center justify-center rounded-[6px] border text-[17px] font-bold ${focusRing}`;

  return (
    <section id="ra-poster" aria-labelledby="ra-poster-title" style={{ background: C.bg, color: C.ink }}>
      <style>{HERO_CSS}</style>

      {/* 상단 메뉴. 휴대폰은 둥근 메뉴 줄을 옆으로 민다 */}
      <header className="border-b" style={{ background: C.card, borderColor: C.border }}>
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 md:px-6">
          <p>
            <SampleLogo size={18} />
          </p>
          <nav aria-label="주요 메뉴" className="hidden items-center lg:flex">
            {NAV.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                className={`min-h-[44px] rounded-[4px] px-3 text-[16px] font-semibold underline-offset-4 hover:underline ${focusRing}`}
                style={{ outlineColor: C.accent }}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <nav aria-label="주요 메뉴" className="overflow-x-auto pb-3 lg:hidden">
          <ul className="flex w-max gap-2 px-4 md:px-6">
            {NAV.map(([id, label]) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => go(id)}
                  className={`min-h-[44px] whitespace-nowrap rounded-full border px-4 text-[15px] font-semibold ${focusRing}`}
                  style={{ borderColor: C.border, outlineColor: C.accent }}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-0 md:grid-cols-[minmax(0,9fr)_minmax(0,11fr)] md:gap-8 md:px-6 md:py-8 lg:min-h-[calc(100svh-64px)] lg:items-center">
        {/* 책 사진 */}
        <div className="relative h-[24svh] min-h-[160px] overflow-hidden md:h-full md:min-h-[560px] md:rounded-[8px]" style={{ background: "#e9e6e4" }}>
          <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : HERO_DUR, ease: EASE }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
            <img
              src={`${IMG}/hero.jpg`}
              srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
              sizes="(min-width: 768px) 45vw, 100vw"
              alt="흰 벽 앞에서 두 손으로 책 네 권을 들어 올린 모습"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "48% 40%" }}
            />
          </motion.div>
        </div>

        {/* 진단 카드 */}
        <div className={`px-4 pb-10 pt-6 md:px-0 md:pb-0 md:pt-0 ${reduce ? "" : "ra-rise"}`}>
          <h1 id="ra-poster-title" className="text-[30px] font-bold md:text-[38px]" style={{ letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}>
            읽고 토론하고 쓰는 90분
          </h1>
          <p className="mt-2 text-[16px]" style={{ color: C.body }}>
            초등 1학년 ~ 중학교 3학년, 주 1회
          </p>

          <div className="mt-6 overflow-hidden rounded-[8px] border" style={{ borderColor: C.border, background: C.card }}>
            <div className="flex items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: C.border }}>
              <h2 className="text-[17px] font-bold">독서 습관 진단</h2>
              <div className="flex items-center gap-1.5" role="img" aria-label={done ? "진단 결과" : `4단계 중 ${step + 1}단계`}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} aria-hidden className="h-2 w-6 rounded-full" style={{ background: i < step || done ? C.accent : i === step ? C.ink : C.border }} />
                ))}
              </div>
            </div>

            <div className="min-h-[300px] p-5 md:p-6" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {step === 0 && (
                  <motion.div key="grade" {...slide}>
                    <p className="text-[18px] font-bold">학년</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {DX_GRADES.map((g, i) => (
                        <button key={g.label} type="button" onClick={() => setGi(i)} className={answerBtn} style={{ borderColor: C.border, outlineColor: C.accent }}>
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step >= 1 && step <= 3 && (
                  <motion.div key={`q${step}`} {...slide}>
                    <p className="text-[14px] font-bold" style={{ color: C.accent }}>
                      {DX_GRADES[gi ?? 0].label}, {STEPS[step - 1].label} {step} / 3
                    </p>
                    <p className="mt-2 text-[20px] font-bold leading-[1.4] md:text-[22px]" style={{ wordBreak: "keep-all" }}>
                      {DX_QUESTIONS[step - 1]}
                    </p>
                    <div className="mt-5 grid gap-2 md:grid-cols-3">
                      {DX_ANSWERS.map((a, i) => (
                        <button key={a} type="button" onClick={() => setAnswers((x) => [...x, i])} className={answerBtn} style={{ borderColor: C.border, outlineColor: C.accent }}>
                          {a}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={back} className={`mt-4 inline-flex min-h-[44px] items-center gap-1 rounded-[4px] px-1 text-[15px] font-semibold ${focusRing}`} style={{ color: C.body, outlineColor: C.accent }}>
                      <ChevronLeft size={18} aria-hidden />
                      이전
                    </button>
                  </motion.div>
                )}

                {done && cls && gi !== null && (
                  <motion.div key="result" {...slide}>
                    <p className="text-[14px] font-bold" style={{ color: C.accent }}>
                      추천 반
                    </p>
                    <p className="mt-1 text-[24px] font-bold leading-tight">
                      {cls.name} <span className="text-[16px] font-semibold" style={{ color: C.muted }}>{cls.who}</span>
                    </p>
                    <p className="mt-1 text-[15px]" style={{ color: C.body }}>
                      {cls.time}, 월 {won(cls.fee)}
                    </p>
                    <button
                      type="button"
                      onClick={() => onStep(weak)}
                      className={`mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-[6px] px-3 text-[15px] font-semibold ${focusRing}`}
                      style={{ background: C.soft, color: C.accent, outlineColor: C.accent }}
                    >
                      <PenLine size={16} aria-hidden />
                      먼저 챙길 부분: {STEPS[weak].label}
                    </button>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {GRADES[gi].books.slice(0, 2).map((b) => (
                        <button key={b.id} type="button" onClick={() => onBooks(gi)} className={`flex items-center gap-3 rounded-[6px] border p-2 text-left ${focusRing}`} style={{ borderColor: C.border, outlineColor: C.accent }}>
                          {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                          <img src={`${IMG}/book-${b.id}.jpg`} alt="" className="h-16 w-12 flex-none rounded-[4px] object-cover" />
                          <span className="min-w-0">
                            <span className="block text-[13px] font-semibold" style={{ color: C.muted }}>
                              이달의 책
                            </span>
                            <span className="block text-[15px] font-bold leading-snug" style={{ wordBreak: "keep-all" }}>
                              {b.t}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onConsult(DX_GRADES[gi].consult)}
                        data-gtm-cta="reading-academy_poster_cta"
                        className={`inline-flex min-h-[48px] items-center gap-2 rounded-[6px] px-5 text-[16px] font-bold ${focusRing}`}
                        style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}
                      >
                        <CalendarCheck size={18} aria-hidden />
                        무료 체험 수업 신청
                      </button>
                      <button type="button" onClick={reset} className={`inline-flex min-h-[48px] items-center gap-1.5 rounded-[6px] px-3 text-[15px] font-semibold ${focusRing}`} style={{ color: C.body, outlineColor: C.accent }}>
                        <RotateCcw size={16} aria-hidden />
                        다시 하기
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <button type="button" onClick={() => go("ra-fee")} className={`mt-3 inline-flex min-h-[44px] items-center rounded-[4px] px-1 text-[15px] font-semibold underline underline-offset-4 ${focusRing}`} style={{ color: C.body, outlineColor: C.accent }}>
            반 목록 바로 보기
          </button>
        </div>
      </div>

      {/* 휴대폰: 결과가 나오면 하단 고정 버튼 */}
      {done && gi !== null && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t p-2 md:hidden" style={{ background: C.card, borderColor: C.border, paddingBottom: "calc(8px + env(safe-area-inset-bottom))" }}>
          <button
            type="button"
            onClick={() => onConsult(DX_GRADES[gi].consult)}
            className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[6px] text-[16px] font-bold ${focusRing}`}
            style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}
          >
            <CalendarCheck size={18} aria-hidden />
            체험 수업 신청
          </button>
        </div>
      )}
    </section>
  );
}


/* ---------- 1. 이번 달 읽는 책 ---------- */

function Books({ g, setG }: { g: number; setG: (i: number) => void }) {
  const tabsId = useId();
  const grade = GRADES[g];

  return (
    <div className="mt-6">
      <div role="tablist" aria-label="학년" className="flex flex-wrap gap-2">
        {GRADES.map((x, i) => (
          <button
            key={x.label}
            type="button"
            role="tab"
            id={`${tabsId}-tab-${i}`}
            aria-selected={g === i}
            aria-controls={`${tabsId}-panel`}
            onClick={() => setG(i)}
            className={`rounded-[4px] border px-4 py-2 text-[16px] font-bold ${focusRing}`}
            style={{ borderColor: g === i ? C.accent : C.border, background: g === i ? C.accent : C.card, color: g === i ? "#fff" : C.ink, outlineColor: C.accent }}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div id={`${tabsId}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-tab-${g}`} className="mt-6">
        <p className="text-[16px]">
          이번 달 쓰기 <strong>{grade.amount}</strong>, 한 주에 한 권
        </p>
        <ol className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
          {grade.books.map((b, i) => {
            return (
              <li key={`${g}-${b.t}`}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[6px]" style={{ background: "#efeeea" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                  <img src={`${IMG}/book-${b.id}.jpg`} alt={`책상 위에 놓인 ${b.t} 책`} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2 rounded-[4px] bg-white/90 px-2 py-0.5 text-[13px] font-semibold tabular-nums" style={{ color: C.ink }}>
                    {i + 1}주
                  </span>
                </div>
                <p className="mt-3 text-[18px] font-bold leading-[1.3]" style={{ wordBreak: "keep-all" }}>
                  {b.t}
                </p>
                <p className="mt-0.5 text-[13px]" style={{ color: C.body }}>
                  {b.a}
                </p>
                <p className="mt-2 text-[14px] font-semibold" style={{ color: C.muted }}>
                  {b.kind}
                </p>
                <p className="mt-1 text-[16px] font-bold leading-[1.45]" style={{ wordBreak: "keep-all" }}>
                  {b.q}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ---------- 2. 수업 과정 ---------- */

function Course({ reduce, s, setS }: { reduce: boolean; s: number; setS: (i: number) => void }) {
  const step = STEPS[s];
  const Icon = step.icon;
  return (
    <div className="mt-6 rounded-[6px] border p-5 md:p-8" style={{ borderColor: C.border, background: C.card }}>
      <p className="text-[16px] font-bold">한 번 수업 {TOTAL_MIN}분</p>
      <div className="mt-3 flex overflow-hidden rounded-[6px] border" style={{ borderColor: C.border }}>
        {STEPS.map((x, i) => {
          const on = s === i;
          const from = STEP_FROM[i];
          return (
            <button
              key={x.label}
              type="button"
              aria-pressed={on}
              onClick={() => setS(i)}
              className={`relative flex min-w-0 flex-col items-start px-3 py-3 text-left md:px-4 ${focusRing}`}
              style={{ flexGrow: x.min, flexBasis: 0, borderLeft: i ? `1px solid ${C.border}` : undefined, outlineColor: C.accent, outlineOffset: -4 }}
            >
              {on && <motion.span layoutId="ra-step-on" aria-hidden className="absolute inset-0" style={{ background: C.accent }} transition={{ duration: reduce ? 0 : 0.35, ease: EASE }} />}
              <span className="relative text-[17px] font-bold md:text-[19px]" style={{ color: on ? "#fff" : C.ink }}>
                {x.label}
              </span>
              <span className="relative text-[13px] font-semibold tabular-nums md:text-[14px]" style={{ color: on ? "#fff" : C.muted }}>
                {x.min}분
                <span className="hidden md:inline">
                  {" "}
                  ({from}~{from + x.min})
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={s}
          initial={reduce ? false : { x: 16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={reduce ? { opacity: 1 } : { x: -16, opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.22, ease: EASE }}
          className="mt-6 grid gap-6 md:grid-cols-2 md:gap-10"
        >
          <div>
            <p className="inline-flex items-center gap-2 text-[18px] font-bold">
              <Icon size={22} aria-hidden style={{ color: C.accent }} />
              수업에서
            </p>
            <ul className="mt-3 grid gap-2 text-[16px] leading-[1.6]">
              {step.inClass.map((t) => (
                <li key={t} className="flex gap-2">
                  <Check size={18} className="mt-[3px] flex-none" aria-hidden style={{ color: C.accent }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[4px] p-4 md:p-5" style={{ background: C.soft }}>
            <p className="text-[16px] font-bold">집에서</p>
            <p className="mt-2 text-[16px] leading-[1.6]">{step.atHome}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------- 3. 첨삭 예시 ---------- */

type ECell = { ch: string; r: number; c: number; i: number; tail?: string };

/** 원고지 쓰는 법대로 칸에 앉힌다. 첫 줄 제목, 둘째 줄 학년, 본문은 한 칸 들여 쓰고 줄 첫 칸과 마침표 뒤는 비우지 않는다 */
function layoutEssay(n: number) {
  const cells: ECell[] = [];
  let row = 2;
  let col = 1;
  for (let i = 0; i < ESSAY.length; i++) {
    const ch = ESSAY[i];
    if (ch === " ") {
      if (col === 0 || ESSAY[i - 1] === ".") continue;
      col++;
      if (col >= n) {
        row++;
        col = 0;
      }
      continue;
    }
    if (col >= n) {
      if (".,?".includes(ch) && cells.length) {
        cells[cells.length - 1].tail = ch;
        continue;
      }
      row++;
      col = 0;
    }
    cells.push({ ch, r: row, c: col, i });
    col++;
  }
  return { cells, rows: row + 1 };
}

type EMark = { d: string; badge: Pt; fix?: { x: number; y: number; ch: string } };

function buildMarks(cells: ECell[], n: number): EMark[] {
  const at = (s: string, off = 0) => ESSAY.indexOf(s) + off;
  const cellAt = (i: number) => cells.find((x) => x.i === i) ?? cells[0];
  const top = (c: ECell) => c.r * (1 + GE);
  const badgeX = (x: number) => Math.min(n - 0.15, Math.max(0.25, x));

  // 1. 띄움표: "을"과 "수" 사이 위쪽
  const su = cellAt(at("품을수", 2));
  const x1 = su.c === 0 ? 0.05 : su.c;
  const t1 = top(su);
  const m1 = {
    d: ptsToD([
      [x1 - 0.22, t1 - 0.36],
      [x1, t1 + 0.06],
      [x1 + 0.22, t1 - 0.36],
    ]),
    badge: [badgeX(x1 + 0.5), t1 - 0.24] as Pt,
  };

  // 2. "됬"에 사선을 긋고 위 띠에 "됐"
  const dw = cellAt(at("됬"));
  const t2 = top(dw);
  const m2 = {
    d: ptsToD([
      [dw.c + 0.12, t2 + 0.88],
      [dw.c + 0.88, t2 + 0.12],
    ]),
    badge: [badgeX(dw.c + 1.25), t2 - 0.24] as Pt,
    fix: { x: dw.c + 0.5, y: t2 - 0.06, ch: "됐" },
  };

  // 3. "주고"에 동그라미
  const j1 = cellAt(at("밥도 주고", 3));
  const j2 = cellAt(at("밥도 주고", 4));
  const span = j2.r === j1.r ? 2 : 1;
  const cx = j1.c + span / 2;
  const t3 = top(j1);
  const m3 = { d: ptsToD(ellipsePts(cx, t3 + 0.5, span / 2 + 0.3, 0.64)), badge: [badgeX(cx + span / 2 + 0.55), t3 - 0.16] as Pt };

  // 4. 마지막 문장에 물결 밑줄. 줄마다 따로 긋는다
  const from = at("잎싹은 하고");
  const to = ESSAY.length - 1;
  const segs = new Map<number, { a: number; b: number }>();
  cells.forEach((c) => {
    if (c.i < from || c.i >= to) return;
    const s = segs.get(c.r);
    if (s) {
      s.a = Math.min(s.a, c.c);
      s.b = Math.max(s.b, c.c + 1);
    } else segs.set(c.r, { a: c.c, b: c.c + 1 });
  });
  const waves: string[] = [];
  let last: Pt = [0, 0];
  segs.forEach((s, r) => {
    const y = r * (1 + GE) + 1.08;
    const pts: Pt[] = [];
    for (let x = s.a + 0.05; x <= s.b - 0.05; x += 0.125) pts.push([x, y + Math.sin(((x - s.a) / 0.5) * Math.PI * 2) * 0.07]);
    waves.push(ptsToD(pts));
    last = [s.b, y];
  });
  const m4 = { d: waves.join(" "), badge: [badgeX(last[0] + 0.3), last[1] + 0.02] as Pt };

  return [m1, m2, m3, m4];
}

function Correction({ reduce }: { reduce: boolean }) {
  const wide = useWide();
  const n = wide ? 20 : 12;
  const { cells, rows } = layoutEssay(n);
  const marks = buildMarks(cells, n);
  const h = rows * (1 + GE);
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const [play, setPlay] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const run = reduce || seen;
  const titleStart = Math.max(0, Math.floor((n - ESSAY_TITLE.length) / 2));

  const fs: CSSProperties = { fontSize: `calc(100cqw / ${n} * 0.62)`, lineHeight: 1 };
  const finalDelay = 0.3 + NOTES.length * MARK_GAP;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:gap-10">
      <div>
        <p className="text-[15px] font-semibold" style={{ color: C.muted }}>
          초등 3~4학년반, 마당을 나온 암탉 쓰기 질문
        </p>
        <div ref={ref} className="relative mt-3 rounded-[4px] p-3 md:p-5" style={{ background: P.paper, border: `1px solid ${C.border}` }}>
          <div
            className="relative w-full"
            style={{
              aspectRatio: `${n} / ${h}`,
              containerType: "inline-size",
              ...gridBg(`calc(100% / ${n})`, `calc(100% / ${rows})`, `${(100 / (1 + GE)).toFixed(3)}%`, P.line, P.paper),
              boxShadow: `inset -1.5px 0 0 ${P.line}`,
            }}
            role="img"
            aria-label={`원고지에 쓴 글. 제목 ${ESSAY_TITLE}. ${ESSAY} 빨간 펜으로 띄어쓰기, 맞춤법, 빠진 주어를 고치고 마지막 문장에 물결 밑줄을 그었다.`}
          >
            {[...ESSAY_TITLE].map((ch, k) => (ch === " " ? null : <Glyph key={`t${k}`} ch={ch} r={0} c={titleStart + k} n={n} rows={rows} style={fs} />))}
            {[...ESSAY_GRADE].map((ch, k) => (
              <Glyph key={`g${k}`} ch={ch} r={1} c={n - 1 - ESSAY_GRADE.length + k} n={n} rows={rows} style={fs} />
            ))}
            {cells.map((x) => (
              <Glyph key={x.i} ch={x.ch + (x.tail ?? "")} r={x.r} c={x.c} n={n} rows={rows} style={fs} />
            ))}

            <svg key={play} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${n} ${h}`} preserveAspectRatio="none" aria-hidden>
              {marks.map((m, k) => {
                const dim = active !== null && active !== k;
                const delay = 0.3 + k * MARK_GAP;
                const tr = reduce ? { duration: 0 } : { delay, duration: MARK_DUR, ease: "easeInOut" as const };
                return (
                  <g key={k} style={{ opacity: dim ? 0.18 : 1, transition: "opacity 200ms" }}>
                    <motion.path
                      d={m.d}
                      fill="none"
                      stroke={P.red}
                      strokeWidth={0.07}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                      animate={run ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                      transition={reduce ? { duration: 0 } : { pathLength: tr, opacity: { delay, duration: 0.01 } }}
                    />
                    <motion.g initial={reduce ? false : { opacity: 0 }} animate={{ opacity: run ? 1 : 0 }} transition={reduce ? { duration: 0 } : { delay: delay + MARK_DUR, duration: 0.2 }}>
                      <circle cx={m.badge[0]} cy={m.badge[1]} r={0.22} fill={P.red} />
                      <text x={m.badge[0]} y={m.badge[1] + 0.1} textAnchor="middle" fontSize={0.3} fontWeight={700} fill="#fff">
                        {k + 1}
                      </text>
                      {m.fix && (
                        <text x={m.fix.x} y={m.fix.y} textAnchor="middle" fontSize={0.5} fill={P.red} fontWeight={700}>
                          {m.fix.ch}
                        </text>
                      )}
                    </motion.g>
                  </g>
                );
              })}
            </svg>
          </div>
          <motion.p
            key={`f${play}`}
            className="mt-4 text-[16px] font-semibold leading-[1.5] md:text-[17px]"
            style={{ color: P.red }}
            initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: run ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
            transition={reduce ? { duration: 0 } : { delay: finalDelay, duration: 1.1, ease: "linear" }}
          >
            {FINAL_NOTE}
          </motion.p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[18px] font-bold">고친 곳</p>
          <button
            type="button"
            onClick={() => {
              setActive(null);
              setPlay((x) => x + 1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-[4px] border px-3 py-2 text-[15px] font-bold ${focusRing}`}
            style={{ borderColor: C.ink, outlineColor: C.accent }}
          >
            <RotateCcw size={16} aria-hidden />
            다시 그리기
          </button>
        </div>
        <ul className="mt-3 grid gap-2">
          {NOTES.map((x, k) => {
            const on = active === k;
            return (
              <li key={x.title}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(on ? null : k)}
                  className={`flex w-full gap-3 rounded-[4px] border p-3 text-left ${focusRing}`}
                  style={{ borderColor: on ? C.red : C.border, background: on ? "#f8f1f0" : C.card, outlineColor: C.accent }}
                >
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-full text-[14px] font-bold text-white" style={{ background: P.red }}>
                    {k + 1}
                  </span>
                  <span>
                    <span className="block text-[16px] font-bold">{x.title}</span>
                    <span className="mt-0.5 block text-[15px] leading-[1.5]" style={{ color: C.muted }}>
                      {x.text}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
          첨삭본은 사진으로 찍어 수업 다음 날까지 카카오톡으로 보내 드려요.
        </p>
      </div>
    </div>
  );
}

function Glyph({ ch, r, c, n, rows, style }: { ch: string; r: number; c: number; n: number; rows: number; style: CSSProperties }) {
  const rowH = 100 / rows;
  return (
    <span
      aria-hidden
      className="absolute grid place-items-center"
      style={{ left: `${(c / n) * 100}%`, top: `${r * rowH}%`, width: `${100 / n}%`, height: `${rowH / (1 + GE)}%`, color: P.ink, ...style }}
    >
      {ch}
    </span>
  );
}

/* ---------- 교습비 ---------- */

function FeeTable({ onConsult }: { onConsult: () => void }) {
  return (
    <div className="mt-6">
      <ul className="border-t" style={{ borderColor: C.ink }}>
        <li className="hidden grid-cols-[1.1fr_0.7fr_2fr_1fr] gap-4 border-b py-3 text-[14px] font-bold md:grid" style={{ borderColor: C.border, color: C.muted }}>
          <span>반</span>
          <span>대상</span>
          <span>수업 요일과 시간</span>
          <span className="text-right">월 교습비</span>
        </li>
        {CLASSES.map((x) => (
          <li key={x.name} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-b py-4 md:grid-cols-[1.1fr_0.7fr_2fr_1fr] md:items-center" style={{ borderColor: C.border }}>
            <span className="text-[17px] font-bold">
              {x.name}
              <span className="ml-2 text-[15px] font-semibold md:hidden" style={{ color: C.muted }}>
                {x.who}
              </span>
            </span>
            <span className="hidden text-[16px] md:block">{x.who}</span>
            <span className="col-span-2 row-start-2 text-[15px] md:col-span-1 md:row-start-auto md:text-[16px]" style={{ color: C.muted }}>
              <Clock size={15} className="mr-1.5 inline-block align-[-2px]" aria-hidden />
              {x.time}
            </span>
            <span className="text-right text-[18px] font-bold tabular-nums">{won(x.fee)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p className="inline-flex items-center gap-2 text-[15px]" style={{ color: C.muted }}>
          <Wallet size={17} aria-hidden />주 1회 90분, 교재비 월 15,000원 별도, 교육청 신고 교습비
        </p>
        <button
          type="button"
          onClick={onConsult}
          className={`inline-flex items-center gap-2 rounded-[4px] border px-4 py-2.5 text-[15px] font-bold ${focusRing}`}
          style={{ borderColor: C.accent, color: C.accent, outlineColor: C.accent }}
        >
          <MessageCircle size={18} aria-hidden />반 배정 상담
        </button>
      </div>
    </div>
  );
}

/* ---------- 4. 상담 신청 ---------- */

type Done = { no: string; name: string; phone: string; grade: string; method: string; date: Date; slot: string; reply: Date };

function ConsultForm({ today, reduce, grade, setGrade }: { today: Date; reduce: boolean; grade: (typeof GRADE_OPTS)[number]; setGrade: (g: (typeof GRADE_OPTS)[number]) => void }) {
  const days = nextOpenDays(today, 6);
  const [method, setMethod] = useState<(typeof METHODS)[number]>("방문 상담");
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<(typeof SLOTS)[number]>(SLOTS[0]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [memo, setMemo] = useState("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const nameId = useId();
  const phoneId = useId();
  const memoId = useId();
  const agreeId = useId();

  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  const nameOk = name.trim().length >= 2;
  const ok = phoneOk && nameOk && agree;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok) return;
    const seq = 100 + ((name.length * 37 + phone.length * 11) % 900);
    setDone({
      no: `RA-${fmtDash(today).replace(/-/g, "").slice(2)}-${seq}`,
      name: maskName(name),
      phone: maskPhone(phone),
      grade,
      method,
      date: days[day],
      slot,
      reply: nextOpenDays(today, 1)[0],
    });
  };

  const chip = `rounded-[4px] border px-3.5 py-2 text-[15px] font-semibold ${focusRing}`;
  const chipStyle = (on: boolean) => ({ borderColor: on ? C.accent : C.border, background: on ? C.accent : C.card, color: on ? "#fff" : C.ink, outlineColor: C.accent });
  const field = `mt-2 block h-12 w-full rounded-[4px] border px-3 text-[17px] ${focusRing}`;

  return (
    <div className="mt-6 rounded-[6px] border p-5 md:p-8" style={{ borderColor: C.border, background: C.card }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={reduce ? false : { opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
            role="status"
          >
            <p className="inline-flex items-center gap-2 text-[22px] font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: C.accent, color: "#fff" }}>
                <Check size={20} aria-hidden />
              </span>
              상담 신청이 접수됐어요
            </p>
            <dl className="mt-5 grid gap-x-6 gap-y-2.5 text-[16px] sm:grid-cols-[auto_1fr]">
              <dt className="font-bold">접수 번호</dt>
              <dd className="tabular-nums">{done.no}</dd>
              <dt className="font-bold">보호자</dt>
              <dd>
                {done.name} / <span className="tabular-nums">{done.phone}</span>
              </dd>
              <dt className="font-bold">상담 내용</dt>
              <dd>
                {done.grade} 학생, {done.method}
              </dd>
              <dt className="font-bold">희망 일시</dt>
              <dd>
                {fmtKo(done.date)} {done.slot}
              </dd>
              <dt className="font-bold">담당 창구</dt>
              <dd>
                {KAKAO} 또는 전화 <span className="whitespace-nowrap tabular-nums">{TEL}</span>
              </dd>
              <dt className="font-bold">회신 예정</dt>
              <dd>{fmtKo(done.reply)} 오후에 원장이 전화드려요</dd>
            </dl>
            <p className="mt-4 text-[15px]" style={{ color: C.muted }}>
              상담 날 아이가 최근에 읽은 책 한 권을 같이 가져오세요.
            </p>
            <button
              type="button"
              onClick={() => {
                setDone(null);
                setTried(false);
              }}
              className={`mt-6 rounded-[4px] border px-4 py-2.5 text-[15px] font-bold ${focusRing}`}
              style={{ borderColor: C.ink, outlineColor: C.accent }}
            >
              새로 신청하기
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} noValidate initial={false} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }} className="grid gap-6 md:grid-cols-2 md:gap-x-10">
            <fieldset className="md:col-span-2">
              <legend className="text-[16px] font-bold">학년</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {GRADE_OPTS.map((g) => (
                  <button key={g} type="button" aria-pressed={grade === g} onClick={() => setGrade(g)} className={chip} style={chipStyle(grade === g)}>
                    {g}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-[16px] font-bold">상담 방법</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {METHODS.map((m) => (
                  <button key={m} type="button" aria-pressed={method === m} onClick={() => setMethod(m)} className={chip} style={chipStyle(method === m)}>
                    {m}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-[16px] font-bold">시간</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {SLOTS.map((x) => (
                  <button key={x} type="button" aria-pressed={slot === x} onClick={() => setSlot(x)} className={chip} style={chipStyle(slot === x)}>
                    {x}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="md:col-span-2">
              <legend className="text-[16px] font-bold">희망일</legend>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {days.map((d, i) => (
                  <button
                    key={d.getTime()}
                    type="button"
                    aria-pressed={day === i}
                    onClick={() => setDay(i)}
                    className={`rounded-[4px] border py-2.5 text-center ${focusRing}`}
                    style={chipStyle(day === i)}
                  >
                    <span className="block text-[13px] font-semibold">{DOW[d.getDay()]}</span>
                    <span className="block text-[17px] font-bold tabular-nums">
                      {d.getMonth() + 1}.{d.getDate()}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor={nameId} className="text-[16px] font-bold">
                보호자 이름
              </label>
              <input
                id={nameId}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={field}
                style={{ borderColor: tried && !nameOk ? C.error : C.border, outlineColor: C.accent }}
                aria-invalid={tried && !nameOk}
              />
              {tried && !nameOk && (
                <p className="mt-1 text-[14px] font-semibold" style={{ color: C.error }}>
                  이름을 두 글자 이상 넣어 주세요.
                </p>
              )}
            </div>
            <div>
              <label htmlFor={phoneId} className="text-[16px] font-bold">
                연락처
              </label>
              <input
                id={phoneId}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                autoComplete="tel"
                placeholder="010-0000-0000"
                className={`${field} tabular-nums`}
                style={{ borderColor: tried && !phoneOk ? C.error : C.border, outlineColor: C.accent }}
                aria-invalid={tried && !phoneOk}
              />
              {tried && !phoneOk && (
                <p className="mt-1 text-[14px] font-semibold" style={{ color: C.error }}>
                  휴대폰 번호를 확인해 주세요.
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label htmlFor={memoId} className="text-[16px] font-bold">
                아이가 좋아하는 책(선택)
              </label>
              <textarea
                id={memoId}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={2}
                className={`mt-2 block w-full rounded-[4px] border px-3 py-2.5 text-[16px] ${focusRing}`}
                style={{ borderColor: C.border, outlineColor: C.accent }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-2">
              <label htmlFor={agreeId} className="inline-flex cursor-pointer flex-wrap items-center gap-2 text-[15px]">
                <input
                  id={agreeId}
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className={`h-5 w-5 ${focusRing}`}
                  style={{ accentColor: C.accent, outlineColor: C.accent }}
                />
                개인정보 수집 및 이용 동의(필수)
                {tried && !agree && (
                  <span className="font-semibold" style={{ color: C.error }}>
                    동의가 필요해요
                  </span>
                )}
              </label>
              <button
                type="submit"
                data-gtm-cta="reading-academy_consult_submit"
                className={`inline-flex items-center gap-2 rounded-[4px] px-6 py-3 text-[17px] font-bold ${focusRing}`}
                style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}
              >
                <CalendarCheck size={20} aria-hidden />
                상담 신청
              </button>
            </div>
            <p className="inline-flex items-center gap-2 text-[14px] md:col-span-2" style={{ color: C.muted }}>
              <FileText size={16} aria-hidden />첫 상담 때 짧은 글쓰기 진단을 같이 해요. 20분 걸려요.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
