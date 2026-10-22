"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import { BookOpen, CalendarCheck, Check, Clock, FileText, MessageCircle, MessagesSquare, PenLine, RotateCcw, Wallet } from "lucide-react";
import { Gowun_Batang, Nanum_Pen_Script } from "@/lib/local-fonts";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, fmtDash, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName, maskPhone } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 독서 논술 학원 홈페이지 샘플: 가상의 곰파트너독서논술. 초등 1학년부터 중학교 3학년까지 주 1회 90분 수업.
   상호, 원장 이름, 주소, 전화번호, 손님 이름은 모두 가상이다. 책 목록은 실제로 많이 읽히는 책이다.

   국내 독서 논술 학원 사이트 공통 구성(참고): 메뉴는 학원 소개, 교육 과정, 이달의 도서(학년별 필독서),
   수업 시간표, 교습비 안내, 상담 신청, 오시는 길. 첫 화면에 "무료 상담 신청", "이달의 도서" 바로가기를 둔다.
   수업은 읽기, 토론, 쓰기 순서가 많고, 첨삭한 원고지를 사진으로 보호자에게 보내 주는 곳이 많다.
   교습비는 교육청 신고 교습비처럼 반별 "월 교습비"로 적고 교재비는 따로 적는다. 합격 실적, 학생 실명은 쓰지 않는다.

   포스터 첫 화면(ra-poster): 화면 전체가 연두 줄 원고지다. 큰 문장 "책 한 권 읽고 한 장 써요"가 원고지 칸에 맞춰
   놓이고, 칸마다 흐린 따라쓰기 글자 위로 진한 글자가 한 칸씩 채워진다. 이어 종이 위에 누워 있던 빨간 펜이
   일어나 "한 권"에 밑줄, "한 장"에 동그라미, 끝에 확인 표시를 긋고 다시 눕는다.
   스크롤하면 원고지 윗부분이 가운데 선을 따라 앞으로 접혀 내려오고, 접힌 종이가 위로 들려 나가며 본문이 이어진다.
   동작 줄이기면 글자와 표시가 다 그려진 상태로 고정하고 접힘도 없다.

   상호작용(모두 브라우저 안에서만 돈다. 실제로 보내지 않는다)
   1. 이번 달 읽는 책: 학년을 고르면 주차별 책 네 권과 쓰기 질문, 이번 달 쓰기 분량이 나온다.
   2. 수업 과정: 90분 막대에서 읽기, 토론, 쓰기를 고르면 수업에서 하는 일과 집에서 할 일이 나온다.
   3. 첨삭 예시: 원고지 글 위에 빨간 펜 첨삭이 차례로 그려진다. 고침 설명을 누르면 그 표시만 진하게 보인다.
   4. 상담 신청: 학년, 방법, 희망일, 시간, 보호자 이름, 연락처. 완료 화면에 접수 번호, 담당 창구, 회신 예정일. */

const batangF = { fontFamily: `${Gowun_Batang.style.fontFamily}, serif`, fontWeight: 700 } as const;
const penF = { fontFamily: `${Nanum_Pen_Script.style.fontFamily}, cursive` } as const;

const BRAND = "곰파트너독서논술";
const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 곰파트너";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";

/* 포스터 색: 연두 줄 원고지, 연필 글자, 빨간 펜 */
const P = {
  paper: "#f4f8e7",
  line: "#93c25e",
  guide: "#c9dbab",
  ink: "#1c2615",
  red: "#c81e32",
  back: "#e4ecd0",
  desk: "#dfe6cf",
};

/* 본문 색 */
const C = {
  bg: "#f6f8ef",
  card: "#ffffff",
  ink: "#1f2a1a",
  green: "#3f6b25",
  soft: "#e7f0d4",
  line: "#93c25e",
  red: "#c81e32",
  muted: "#55604d",
  border: "#d5ddc5",
  error: "#b42318",
};

/* 모션 상수. 시간은 초, 이징은 cubic-bezier */
const EASE = [0.22, 1, 0.36, 1] as const;
/** 원고지 줄 사이 띠 높이(칸 한 변 대비) */
const G = 0.32;
/** 첫 글자를 쓰기 시작하는 시각, 글자 사이 간격, 한 글자를 채우는 시간 */
const TYPE_START = 0.15;
const TYPE_STEP = 0.06;
const TYPE_DUR = 0.14;
/** 펜이 일어나 움직이기 시작하는 시각 */
const PEN_START = 0.6;
/** 표시와 표시 사이를 옮겨 가는 시간, 다 긋고 다시 눕는 시간 */
const PEN_MOVE = 0.12;
const PEN_BACK = 0.25;
/** 펜 각도. 누워 있을 때와 쓸 때(도) */
const REST_ROT = -16;
const WRITE_ROT = -52;
/** 포스터 스크롤 진행도 중 퇴장이 끝나는 지점, 그중 접힘이 끝나는 비율 */
const EXIT_END = 0.55;
const FOLD_END = 0.55;
/** 첨삭 예시 표시 하나를 긋는 시간과 표시 사이 간격 */
const MARK_DUR = 0.45;
const MARK_GAP = 0.55;

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2";
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* ---------- 원고지 무늬 ---------- */

/** 칸 테두리와 줄 사이 띠. w, h 는 한 칸과 띠를 합친 무늬 한 장 크기, cellH 는 칸 높이 */
function gridBg(w: string, h: string, cellH: string, line: string, paper: string): CSSProperties {
  const hLines = `linear-gradient(180deg, ${line} 0 1.5px, transparent 1.5px calc(${cellH} - 1.5px), ${line} calc(${cellH} - 1.5px) ${cellH}, transparent ${cellH})`;
  const band = `linear-gradient(180deg, transparent 0 ${cellH}, ${paper} ${cellH})`;
  const vLines = `linear-gradient(90deg, ${line} 0 1.5px, transparent 1.5px)`;
  return { backgroundColor: paper, backgroundImage: `${hLines}, ${band}, ${vLines}`, backgroundSize: `${w} ${h}` };
}

/* ---------- 포스터 펜 경로 ---------- */

type Pt = [number, number];
type Layout = {
  rows: string[];
  cols: number;
  marks: { pts: Pt[]; dur: number }[];
  rest: Pt;
  /** 펜 길이(칸 한 변 대비) */
  penL: number;
};

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

const R = 1 + G;

const PC: Layout = {
  rows: ["책 한 권 읽고", "한 장 써요"],
  cols: 8,
  marks: [
    { pts: [[2.05, 1.1], [3.5, 1.08], [4.95, 1.05]], dur: 0.25 },
    { pts: ellipsePts(1.5, R + 0.47, 1.72, 0.56), dur: 0.38 },
    { pts: [[6.2, R + 0.45], [6.45, R + 0.86], [7.08, R - 0.02]], dur: 0.16 },
  ],
  rest: [4.6, 2 * R + 0.55],
  penL: 3.7,
};

const MOBILE: Layout = {
  rows: ["책 한 권", "읽고", "한 장", "써요"],
  cols: 5,
  marks: [
    { pts: [[2.05, 1.1], [3.5, 1.08], [4.95, 1.05]], dur: 0.25 },
    { pts: ellipsePts(1.5, 2 * R + 0.5, 1.68, 0.66), dur: 0.38 },
    { pts: [[2.25, 3 * R + 0.45], [2.5, 3 * R + 0.86], [3.1, 3 * R - 0.02]], dur: 0.16 },
  ],
  rest: [0.3, 4 * R + 2.3],
  penL: 4.6,
};

const ptsToD = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(3)} ${p[1].toFixed(3)}`).join(" ");
const segLen = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** 펜 끝이 지나갈 점들을 시간에 맞춰 늘어놓는다. 그리는 구간은 길이에 비례해 시간을 나눈다 */
function buildPen(layout: Layout) {
  const h = layout.rows.length * R;
  const segs: { pts: Pt[]; dur: number; draw: boolean }[] = [];
  let cur = layout.rest;
  for (const m of layout.marks) {
    segs.push({ pts: [cur, m.pts[0]], dur: PEN_MOVE, draw: false });
    segs.push({ pts: m.pts, dur: m.dur, draw: true });
    cur = m.pts[m.pts.length - 1];
  }
  segs.push({ pts: [cur, layout.rest], dur: PEN_BACK, draw: false });
  const total = segs.reduce((s, x) => s + x.dur, 0);
  const pts: Pt[] = [layout.rest];
  const times = [0];
  const rot = [REST_ROT];
  const markTimes: { delay: number; dur: number }[] = [];
  let t = 0;
  segs.forEach((seg, si) => {
    const cum = [0];
    for (let j = 1; j < seg.pts.length; j++) cum.push(cum[j - 1] + segLen(seg.pts[j - 1], seg.pts[j]));
    const len = cum[cum.length - 1] || 1;
    if (seg.draw) markTimes.push({ delay: PEN_START + t, dur: seg.dur });
    for (let j = 1; j < seg.pts.length; j++) {
      pts.push(seg.pts[j]);
      times.push((t + (seg.dur * cum[j]) / len) / total);
      rot.push(si === segs.length - 1 ? REST_ROT : WRITE_ROT);
    }
    t += seg.dur;
  });
  return {
    x: pts.map((p) => `${(p[0] / layout.cols) * 100}%`),
    y: pts.map((p) => `${(p[1] / h) * 100}%`),
    rot,
    times,
    total,
    markTimes,
  };
}

const PC_PEN = buildPen(PC);
const MOBILE_PEN = buildPen(MOBILE);

/* ---------- 이번 달 읽는 책 ---------- */

type Book = { t: string; a: string; kind: string; q: string };
const GRADES: { label: string; amount: string; books: Book[] }[] = [
  {
    label: "초등 1~2학년",
    amount: "원고지 반 장(100자)",
    books: [
      { t: "강아지똥", a: "권정생 글, 정승각 그림", kind: "그림책", q: "나도 쓸모 있다고 느낀 때가 있나요?" },
      { t: "구름빵", a: "백희나", kind: "그림책", q: "구름빵을 먹으면 어디에 가고 싶나요?" },
      { t: "알사탕", a: "백희나", kind: "그림책", q: "알사탕으로 누구 마음을 듣고 싶나요?" },
      { t: "줄무늬가 생겼어요", a: "데이빗 섀논", kind: "그림책", q: "남과 달라서 걱정한 적이 있나요?" },
    ],
  },
  {
    label: "초등 3~4학년",
    amount: "원고지 한 장(200자)",
    books: [
      { t: "마당을 나온 암탉", a: "황선미", kind: "동화", q: "잎싹은 왜 마당을 나왔을까?" },
      { t: "만복이네 떡집", a: "김리리", kind: "동화", q: "말 한마디로 친구 마음이 바뀐 적 있나요?" },
      { t: "프린들 주세요", a: "앤드루 클레먼츠", kind: "동화", q: "낱말은 누가 정할까?" },
      { t: "샬롯의 거미줄", a: "E. B. 화이트", kind: "동화", q: "친구를 위해 내가 할 수 있는 일은?" },
    ],
  },
  {
    label: "초등 5~6학년",
    amount: "원고지 한 장(400자)",
    books: [
      { t: "몽실 언니", a: "권정생", kind: "소설", q: "몽실이는 왜 끝까지 동생을 업었을까?" },
      { t: "책과 노니는 집", a: "이영서", kind: "역사 동화", q: "책을 베껴 쓰는 일은 왜 위험했을까?" },
      { t: "어린 왕자", a: "생텍쥐페리", kind: "고전", q: "길들인다는 건 무슨 뜻일까?" },
      { t: "아름다운 아이", a: "R. J. 팔라시오", kind: "소설", q: "친절과 옳은 일 중 하나를 고른다면?" },
    ],
  },
  {
    label: "중학생",
    amount: "원고지 두 장(800자)",
    books: [
      { t: "아몬드", a: "손원평", kind: "소설", q: "공감은 배워서 생길까?" },
      { t: "동물농장", a: "조지 오웰", kind: "고전", q: "규칙은 누가 바꿀 수 있을까?" },
      { t: "완득이", a: "김려령", kind: "소설", q: "어른이 도와준다는 건 어떤 모습일까?" },
      { t: "나의 라임오렌지나무", a: "J. M. 바스콘셀로스", kind: "고전", q: "어른이 아이 마음을 모를 때는?" },
    ],
  },
];
/** 책 표지 색. 짙은 초록, 미색, 빨강, 먹색 차례 */
const COVERS = [
  { bg: "#3f6b25", fg: "#f4f8e7" },
  { bg: "#efe7cf", fg: "#1f2a1a" },
  { bg: "#b51b2d", fg: "#fff6f0" },
  { bg: "#26301f", fg: "#e7f0d4" },
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

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  const month = today.getMonth() + 1;
  const nextMonth = (month % 12) + 1;

  const navBtn = `rounded-[4px] px-2.5 py-1.5 text-[15px] font-semibold underline-offset-4 hover:underline ${focusRing}`;

  return (
    <div className="min-h-screen overflow-x-clip" style={{ background: C.bg, color: C.ink }}>
      <Poster reduce={reduce} onCta={() => go("ra-consult")} />

      <header className="border-b" style={{ background: C.card, borderColor: C.border }}>
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 md:px-6">
          <h2 className="inline-flex items-center gap-2 text-[22px] leading-none" style={batangF}>
            <CellMark size={24} />
            {BRAND}
          </h2>
          <nav aria-label="주요 메뉴" className="-mx-2 flex flex-wrap items-center">
            {[
              ["ra-books", "이달의 도서"],
              ["ra-course", "수업 과정"],
              ["ra-correct", "첨삭 예시"],
              ["ra-fee", "교습비"],
              ["ra-consult", "상담 신청"],
              ["ra-visit", "오시는 길"],
            ].map(([id, label]) => (
              <button key={id} type="button" onClick={() => go(id)} className={navBtn} style={{ outlineColor: C.green }}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section id="ra-books" aria-labelledby="ra-books-title" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pt-10 md:px-6 md:pt-14">
        <CellTitle id="ra-books-title" text={`${month}월 읽는 책`} />
        <Books reduce={reduce} />
      </section>

      <section id="ra-course" aria-labelledby="ra-course-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <CellTitle id="ra-course-title" text="수업 과정" />
        <Course reduce={reduce} />
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

      <footer className="mt-16 px-4 pb-28 pt-10 text-[14px] leading-[1.8] md:px-6" style={{ background: C.green, color: "#e7f0d4" }}>
        <div className="mx-auto max-w-[1200px]">
          <p className="text-[18px] text-white" style={batangF}>
            {BRAND}
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

/** 원고지 칸에 한 글자씩 넣은 구역 제목 */
function CellTitle({ id, text }: { id: string; text: string }) {
  return (
    <h2 id={id} className="flex flex-wrap" style={batangF}>
      <span className="sr-only">{text}</span>
      {[...text].map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className="-ml-[1.5px] grid h-10 w-10 place-items-center border-[1.5px] text-[23px] leading-none first:ml-0 md:h-12 md:w-12 md:text-[28px]"
          style={{ borderColor: C.line, background: C.card }}
        >
          {ch === " " ? "" : ch}
        </span>
      ))}
    </h2>
  );
}

/** 작은 상호 표시. 원고지 한 칸에 빨간 밑줄 */
function CellMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect x="1.5" y="3" width="10.5" height="12" fill={P.paper} stroke={P.line} strokeWidth="1.8" />
      <rect x="12" y="3" width="10.5" height="12" fill={P.paper} stroke={P.line} strokeWidth="1.8" />
      <path d="M2.5 19.5 Q12 17 21.5 19" stroke={P.red} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- 포스터 ---------- */

function Poster({ reduce, onCta }: { reduce: boolean; onCta: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useTransform(scrollYProgress, (v) => (reduce ? 0 : clamp01(v / EXIT_END)));
  // 윗부분이 가운데 선을 따라 앞으로 접혀 내려오고, 다 접히면 종이째 위로 들려 나간다
  const fold = useTransform(p, (v) => clamp01(v / FOLD_END));
  const lift = useTransform(p, (v) => clamp01((v - FOLD_END) / (1 - FOLD_END)));
  const flapRot = useTransform(fold, (t) => -t * 180);
  const frontShade = useTransform(fold, (t) => Math.min(0.5, t * 0.9));
  const backShade = useTransform(fold, (t) => Math.max(0, (1 - t) * 0.9));
  const underShade = useTransform(fold, (t) => Math.sin(Math.PI * t) * 0.3);
  const groupY = useTransform(lift, (l) => `${-l * 115}svh`);
  const groupRot = useTransform(lift, (l) => -l * 5);
  const barO = useTransform(fold, (t) => 1 - clamp01(t * 2.5));

  const topBar = (
    <motion.div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-4 md:px-12 md:pt-7" style={reduce ? undefined : { y: groupY, opacity: barO }}>
      <p className="inline-flex items-center gap-2 rounded-[4px] px-1.5 py-1 text-[17px] leading-none" style={{ ...batangF, background: P.paper, color: P.ink }}>
        <CellMark size={20} />
        {BRAND}
      </p>
      <button
        type="button"
        onClick={onCta}
        aria-label="상담 신청"
        title="상담 신청"
        data-gtm-cta="reading-academy_poster_cta"
        className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${focusRing}`}
        style={{ background: P.red, color: "#fff", outlineColor: P.ink, boxShadow: "inset 0 2px 0 rgba(255,255,255,0.25), 0 3px 8px rgba(80,20,20,0.25)" }}
      >
        <CalendarCheck size={22} aria-hidden />
      </button>
    </motion.div>
  );

  return (
    <section id="ra-poster" ref={ref} aria-labelledby="ra-poster-title" className="relative" style={{ height: reduce ? undefined : "165svh", background: C.bg }}>
      <div className={`${reduce ? "relative min-h-svh" : "sticky top-0 h-svh"} overflow-hidden`} style={{ perspective: "2200px", background: C.bg }}>
        {reduce ? (
          <div className="relative min-h-svh">
            <PosterSheet key="r" reduce copy={false} />
          </div>
        ) : (
          <motion.div key="m" className="absolute inset-0" style={{ y: groupY, rotate: groupRot, transformStyle: "preserve-3d" }}>
            {/* 아랫부분. 진짜 문장이 들어 있다 */}
            <div className="absolute inset-0" style={{ clipPath: "inset(50% 0 0 0)" }}>
              <PosterSheet reduce={false} copy={false} />
              <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: underShade, background: "linear-gradient(180deg, rgba(30,45,20,0.9) 50%, rgba(30,45,20,0) 85%)" }} />
            </div>
            {/* 접혀 내려오는 윗부분 */}
            <motion.div aria-hidden className="absolute inset-0" style={{ rotateX: flapRot, transformOrigin: "50% 50%", transformStyle: "preserve-3d" }}>
              <div className="absolute inset-0" style={{ clipPath: "inset(0 0 calc(50% - 1px) 0)", backfaceVisibility: "hidden" }}>
                <PosterSheet reduce={false} copy />
                <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: frontShade, background: "linear-gradient(0deg, rgba(30,45,20,0.75) 50%, rgba(30,45,20,0.2) 0%)" }} />
              </div>
              {/* 종이 뒷면 */}
              <div
                className="absolute inset-x-0 top-0 h-1/2"
                style={{
                  transform: "rotateX(180deg)",
                  backfaceVisibility: "hidden",
                  background: `linear-gradient(0deg, ${P.back} 0%, #edf2de 70%, #f2f6e6 100%)`,
                  boxShadow: "inset 0 -10px 18px rgba(60,80,40,0.12)",
                }}
              >
                <motion.div className="absolute inset-0" style={{ opacity: backShade, background: "rgba(30,45,20,0.8)" }} />
              </div>
            </motion.div>
          </motion.div>
        )}
        {topBar}
      </div>
    </section>
  );
}

/** 원고지 한 장. copy 면 접히는 윗부분에 쓰는 복사본이라 제목 태그와 id 를 두지 않는다 */
function PosterSheet({ reduce, copy }: { reduce: boolean; copy: boolean }) {
  const Tag = copy ? "div" : "h1";
  return (
    <div className="absolute inset-0 overflow-hidden [--c:min(17.5vw,76px)] md:[--c:clamp(88px,11vw,170px)]" style={{ background: P.paper }} inert={copy || undefined}>
      <div className="relative h-full px-4 pt-[15svh] md:pt-[17svh]">
        <Tag id={copy ? undefined : "ra-poster-title"} className="relative m-0">
          {!copy && <span className="sr-only">책 한 권 읽고 한 장 써요</span>}
          <div aria-hidden className="md:hidden">
            <Board layout={MOBILE} pen={MOBILE_PEN} reduce={reduce} />
          </div>
          <div aria-hidden className="hidden md:block">
            <Board layout={PC} pen={PC_PEN} reduce={reduce} />
          </div>
        </Tag>
      </div>
      {/* 종이에 비치는 빛과 가장자리 그늘 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 18% 12%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 55%), radial-gradient(140% 120% at 50% 40%, rgba(0,0,0,0) 60%, rgba(60,85,30,0.12) 100%)" }}
      />
    </div>
  );
}

/** 원고지 칸에 놓인 큰 문장, 빨간 펜 표시, 펜 */
function Board({ layout, pen, reduce }: { layout: Layout; pen: ReturnType<typeof buildPen>; reduce: boolean }) {
  const { rows, cols, marks, penL } = layout;
  const h = rows.length * R;
  /** 글자 칸마다 쓰는 차례(빈칸 제외) */
  const order = rows.map((row, r) => [...row].map((ch, c) => (ch === " " ? -1 : rows.slice(0, r).join("").replace(/ /g, "").length + row.slice(0, c).replace(/ /g, "").length)));
  return (
    <div className="relative mx-auto" style={{ width: `calc(var(--c) * ${cols})`, height: `calc(var(--c) * ${h})` }}>
      {/* 화면 전체 원고지 무늬. 이 판의 칸과 같은 자리에서 시작하도록 칸 크기의 정수배만큼 밖으로 늘린다 */}
      <div
        className="absolute"
        style={{
          left: "calc(var(--c) * -20)",
          top: `calc(var(--c) * ${-10 * R})`,
          width: "calc(var(--c) * 60)",
          height: `calc(var(--c) * ${30 * R})`,
          ...gridBg("var(--c)", `calc(var(--c) * ${R})`, "var(--c)", P.line, P.paper),
        }}
      />

      {/* 글자 칸 */}
      {rows.map((row, r) =>
        [...row].map((ch, c) => {
          if (ch === " ") return null;
          const i = order[r][c];
          const pos: CSSProperties = {
            left: `calc(var(--c) * ${c})`,
            top: `calc(var(--c) * ${r * R})`,
            width: "var(--c)",
            height: "var(--c)",
            fontSize: "calc(var(--c) * 0.8)",
            lineHeight: "var(--c)",
            ...batangF,
          };
          return (
            <span key={`${r}-${c}`} className="absolute text-center" style={pos}>
              {/* 흐린 따라쓰기 글자 */}
              <span className="absolute inset-0" style={{ color: P.guide }}>
                {ch}
              </span>
              {/* 진한 글자. 왼쪽부터 채워진다 */}
              <motion.span
                className="absolute inset-0"
                style={{ color: P.ink }}
                initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                transition={{ duration: reduce ? 0 : TYPE_DUR, delay: reduce ? 0 : TYPE_START + i * TYPE_STEP, ease: "easeOut" }}
              >
                {ch}
              </motion.span>
            </span>
          );
        }),
      )}

      {/* 문장 아래 띠에 적은 정보 한 줄 */}
      <p
        className="absolute left-0 flex items-center whitespace-nowrap text-[15px] font-semibold md:text-[19px]"
        style={{ top: `calc(var(--c) * ${h - G})`, height: `calc(var(--c) * ${G})`, color: "#3f5a2a" }}
      >
        초등 1학년 ~ 중학교 3학년, 주 1회 90분
      </p>

      {/* 빨간 펜 표시 */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${cols} ${h}`} preserveAspectRatio="none">
        {marks.map((m, k) => {
          const t = pen.markTimes[k];
          return (
            <motion.path
              key={k}
              d={ptsToD(m.pts)}
              fill="none"
              stroke={P.red}
              strokeWidth={cols > 6 ? 0.075 : 0.09}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={reduce ? { duration: 0 } : { pathLength: { delay: t.delay, duration: t.dur, ease: "linear" }, opacity: { delay: t.delay, duration: 0.01 } }}
            />
          );
        })}
      </svg>

      {/* 펜. 바깥 판은 이 판 크기만큼 움직이는 기준이고, 펜 끝이 판의 왼쪽 위 모서리에 놓인다 */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={reduce ? { x: pen.x[0], y: pen.y[0] } : { x: pen.x, y: pen.y }}
        transition={reduce ? { duration: 0 } : { duration: pen.total, delay: PEN_START, times: pen.times, ease: "linear" }}
        style={{ x: pen.x[0], y: pen.y[0] }}
      >
        <motion.div
          className="absolute left-0"
          style={{
            top: `calc(var(--c) * ${-penL * 0.04})`,
            width: `calc(var(--c) * ${penL})`,
            height: `calc(var(--c) * ${penL * 0.08})`,
            transformOrigin: "0% 50%",
            rotate: REST_ROT,
          }}
          animate={reduce ? { rotate: REST_ROT } : { rotate: pen.rot }}
          transition={reduce ? { duration: 0 } : { duration: pen.total, delay: PEN_START, times: pen.times, ease: "easeInOut" }}
        >
          <RedPen />
        </motion.div>
      </motion.div>
    </div>
  );
}

/** 빨간 펜. 펜 끝이 왼쪽 가운데(0, 24)에 있고 몸통이 오른쪽으로 뻗는다 */
function RedPen() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 600 48" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`${id}-barrel`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6e0c16" />
          <stop offset="0.16" stopColor="#b31b2c" />
          <stop offset="0.32" stopColor="#ef5a69" />
          <stop offset="0.46" stopColor="#d22a3c" />
          <stop offset="0.82" stopColor="#9c1424" />
          <stop offset="1" stopColor="#5a0911" />
        </linearGradient>
        <linearGradient id={`${id}-grip`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a0a10" />
          <stop offset="0.3" stopColor="#8c1a26" />
          <stop offset="0.45" stopColor="#c4485a" />
          <stop offset="1" stopColor="#2e070c" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdfdfd" />
          <stop offset="0.35" stopColor="#c9ccd0" />
          <stop offset="0.6" stopColor="#8d9298" />
          <stop offset="1" stopColor="#4a4e54" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-10%" y="-100%" width="120%" height="300%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      {/* 종이에 진 그림자. 펜 끝에서 모이고 몸통 쪽으로 퍼진다 */}
      <path d="M2 28 L150 44 L600 52 L600 70 L150 58 Z" fill="#1d2a10" opacity="0.22" filter={`url(#${id}-soft)`} />
      {/* 펜 끝 */}
      <path d="M2 24 L32 14 L32 34 Z" fill={`url(#${id}-metal)`} />
      <circle cx="2.5" cy="24" r="2.4" fill="#2a2a2a" />
      {/* 손잡이 */}
      <rect x="30" y="11" width="122" height="26" rx="5" fill={`url(#${id}-grip)`} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={40 + i * 11} y="12" width="2" height="24" fill="rgba(0,0,0,0.28)" />
      ))}
      <rect x="150" y="7" width="15" height="34" fill={`url(#${id}-metal)`} />
      {/* 몸통 */}
      <rect x="164" y="5" width="304" height="38" fill={`url(#${id}-barrel)`} />
      {/* 뚜껑과 클립 */}
      <rect x="462" y="3.5" width="132" height="41" rx="9" fill={`url(#${id}-barrel)`} />
      <rect x="462" y="3.5" width="8" height="41" fill={`url(#${id}-metal)`} />
      <rect x="478" y="-3" width="108" height="8" rx="3.5" fill={`url(#${id}-metal)`} />
      <circle cx="582" cy="1" r="5" fill={`url(#${id}-metal)`} />
      {/* 반짝이는 한 줄 */}
      <rect x="172" y="12" width="286" height="3" rx="1.5" fill="#fff" opacity="0.55" />
      <rect x="476" y="11" width="108" height="3" rx="1.5" fill="#fff" opacity="0.45" />
      <rect x="40" y="16" width="104" height="2" rx="1" fill="#fff" opacity="0.25" />
    </svg>
  );
}

/* ---------- 1. 이번 달 읽는 책 ---------- */

function Books({ reduce }: { reduce: boolean }) {
  const [g, setG] = useState(1);
  const [changed, setChanged] = useState(false);
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
            onClick={() => {
              setG(i);
              setChanged(true);
            }}
            className={`rounded-[4px] border-[1.5px] px-4 py-2 text-[16px] font-bold ${focusRing}`}
            style={{ borderColor: g === i ? C.green : C.border, background: g === i ? C.green : C.card, color: g === i ? "#fff" : C.ink, outlineColor: C.green }}
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
            const cv = COVERS[i % COVERS.length];
            return (
              <motion.li
                key={`${g}-${b.t}`}
                initial={reduce || !changed ? false : { rotateY: -80 }}
                animate={{ rotateY: 0 }}
                transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : i * 0.07, ease: EASE }}
                style={{ transformOrigin: "0% 50%", transformPerspective: 900 }}
              >
                {/* 표지. 왼쪽이 책등 */}
                <div
                  className="relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-[2px_6px_6px_2px] p-4 pl-6"
                  style={{ background: cv.bg, color: cv.fg, boxShadow: "0 1px 0 rgba(0,0,0,0.1), 6px 8px 0 -2px rgba(31,42,26,0.12)" }}
                >
                  <div aria-hidden className="absolute inset-y-0 left-0 w-[14%]" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.3), rgba(255,255,255,0.14) 45%, rgba(0,0,0,0.08) 70%, transparent)" }} />
                  <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.18), transparent 40%)" }} />
                  <span className="relative text-[14px] font-bold tabular-nums opacity-90">{i + 1}주</span>
                  <span className="relative text-[19px] leading-[1.3] md:text-[22px]" style={{ ...batangF, wordBreak: "keep-all" }}>
                    {b.t}
                  </span>
                  <span className="relative text-[13px] opacity-90">{b.a}</span>
                </div>
                <p className="mt-3 text-[14px] font-semibold" style={{ color: C.muted }}>
                  {b.kind}
                </p>
                <p className="mt-1 text-[16px] font-bold leading-[1.45]" style={{ wordBreak: "keep-all" }}>
                  {b.q}
                </p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ---------- 2. 수업 과정 ---------- */

function Course({ reduce }: { reduce: boolean }) {
  const [s, setS] = useState(0);
  const step = STEPS[s];
  const Icon = step.icon;
  return (
    <div className="mt-6 rounded-[6px] border p-5 md:p-8" style={{ borderColor: C.border, background: C.card }}>
      <p className="text-[16px] font-bold">한 번 수업 {TOTAL_MIN}분</p>
      <div className="mt-3 flex overflow-hidden rounded-[4px] border-[1.5px]" style={{ borderColor: C.ink }}>
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
              style={{ flexGrow: x.min, flexBasis: 0, borderLeft: i ? `1.5px solid ${C.ink}` : undefined, outlineColor: C.green, outlineOffset: -4 }}
            >
              {on && <motion.span layoutId="ra-step-on" aria-hidden className="absolute inset-0" style={{ background: C.red }} transition={{ duration: reduce ? 0 : 0.35, ease: EASE }} />}
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
              <Icon size={22} aria-hidden style={{ color: C.green }} />
              수업에서
            </p>
            <ul className="mt-3 grid gap-2 text-[16px] leading-[1.6]">
              {step.inClass.map((t) => (
                <li key={t} className="flex gap-2">
                  <Check size={18} className="mt-[3px] flex-none" aria-hidden style={{ color: C.green }} />
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
  const m1 = { d: ptsToD([[x1 - 0.22, t1 - 0.36], [x1, t1 + 0.06], [x1 + 0.22, t1 - 0.36]]), badge: [badgeX(x1 + 0.5), t1 - 0.24] as Pt };

  // 2. "됬"에 사선을 긋고 위 띠에 "됐"
  const dw = cellAt(at("됬"));
  const t2 = top(dw);
  const m2 = {
    d: ptsToD([[dw.c + 0.12, t2 + 0.88], [dw.c + 0.88, t2 + 0.12]]),
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
        <div ref={ref} className="relative mt-3 rounded-[4px] p-3 md:p-5" style={{ background: P.paper, boxShadow: "0 1px 0 rgba(0,0,0,0.06), 0 10px 24px -14px rgba(40,60,20,0.45)" }}>
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
            {[...ESSAY_TITLE].map((ch, k) =>
              ch === " " ? null : <Glyph key={`t${k}`} ch={ch} r={0} c={titleStart + k} n={n} rows={rows} style={fs} />,
            )}
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
                        <text x={m.fix.x} y={m.fix.y} textAnchor="middle" fontSize={0.5} fill={P.red} style={penF}>
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
            className="mt-4 text-[22px] leading-[1.35] md:text-[26px]"
            style={{ ...penF, color: P.red }}
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
            className={`inline-flex items-center gap-1.5 rounded-[4px] border-[1.5px] px-3 py-2 text-[15px] font-bold ${focusRing}`}
            style={{ borderColor: C.ink, outlineColor: C.green }}
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
                  className={`flex w-full gap-3 rounded-[4px] border-[1.5px] p-3 text-left ${focusRing}`}
                  style={{ borderColor: on ? C.red : C.border, background: on ? "#fff4f4" : C.card, outlineColor: C.green }}
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
      <ul className="border-t-[1.5px]" style={{ borderColor: C.ink }}>
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
          <Wallet size={17} aria-hidden />
          주 1회 90분, 교재비 월 15,000원 별도, 교육청 신고 교습비
        </p>
        <button
          type="button"
          onClick={onConsult}
          className={`inline-flex items-center gap-2 rounded-[4px] border-[1.5px] px-4 py-2.5 text-[15px] font-bold ${focusRing}`}
          style={{ borderColor: C.green, color: C.green, outlineColor: C.green }}
        >
          <MessageCircle size={18} aria-hidden />
          반 배정 상담
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

  const chip = `rounded-[4px] border-[1.5px] px-3.5 py-2 text-[15px] font-semibold ${focusRing}`;
  const chipStyle = (on: boolean) => ({ borderColor: on ? C.green : C.border, background: on ? C.green : C.card, color: on ? "#fff" : C.ink, outlineColor: C.green });
  const field = `mt-2 block h-12 w-full rounded-[4px] border-[1.5px] px-3 text-[17px] ${focusRing}`;

  return (
    <div className="mt-6 rounded-[6px] border p-5 md:p-8" style={{ borderColor: C.border, background: C.card }}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div key="done" initial={reduce ? false : { opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.3, ease: EASE }} role="status">
            <p className="inline-flex items-center gap-2 text-[22px]" style={batangF}>
              <span className="grid h-9 w-9 place-items-center rounded-full" style={{ background: C.red, color: "#fff" }}>
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
              className={`mt-6 rounded-[4px] border-[1.5px] px-4 py-2.5 text-[15px] font-bold ${focusRing}`}
              style={{ borderColor: C.ink, outlineColor: C.green }}
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
                  <button key={d.getTime()} type="button" aria-pressed={day === i} onClick={() => setDay(i)} className={`rounded-[4px] border-[1.5px] py-2.5 text-center ${focusRing}`} style={chipStyle(day === i)}>
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
              <input id={nameId} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} style={{ borderColor: tried && !nameOk ? C.error : C.border, outlineColor: C.green }} aria-invalid={tried && !nameOk} />
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
              <input id={phoneId} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={`${field} tabular-nums`} style={{ borderColor: tried && !phoneOk ? C.error : C.border, outlineColor: C.green }} aria-invalid={tried && !phoneOk} />
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
              <textarea id={memoId} value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} className={`mt-2 block w-full rounded-[4px] border-[1.5px] px-3 py-2.5 text-[16px] ${focusRing}`} style={{ borderColor: C.border, outlineColor: C.green }} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-2">
              <label htmlFor={agreeId} className="inline-flex cursor-pointer flex-wrap items-center gap-2 text-[15px]">
                <input id={agreeId} type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className={`h-5 w-5 ${focusRing}`} style={{ accentColor: C.green, outlineColor: C.green }} />
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
                style={{ background: C.red, color: "#fff", outlineColor: C.ink }}
              >
                <CalendarCheck size={20} aria-hidden />
                상담 신청
              </button>
            </div>
            <p className="inline-flex items-center gap-2 text-[14px] md:col-span-2" style={{ color: C.muted }}>
              <FileText size={16} aria-hidden />
              첫 상담 때 짧은 글쓰기 진단을 같이 해요. 20분 걸려요.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

