"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CalendarCheck, Check, Clock, FileText, MessageCircle, MessagesSquare, PenLine, Wallet } from "lucide-react";
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

   첫 화면(ra-poster): 상단 메뉴(휴대폰은 둥근 메뉴 줄을 옆으로 민다) 아래 왼쪽은 책 네 권을 든 사진, 오른쪽은 문장 "읽고 토론하고 쓰는 90분",
   수업 특징 세 줄, 무료 상담 신청과 이달의 책 버튼, 전화와 카카오톡 창구.
   사진 출처: Pexels 사진 8762862, 책 사진 book-(id)는 AI 생성(Z-Image-Turbo)

   모션: 들어올 때 사진이 1600ms 동안 scale 1.06 -> 1 로 다가오고, 오른쪽 글은 300ms 늦게 아래 12px 에서 올라온다. 동작 줄이기면 모두 없음.

   구성
   1. 이번 달 읽는 책: 학년을 고르면 주차별 책 네 권과 쓰기 질문, 이번 달 쓰기 분량이 나온다.
   2. 수업 과정: 읽기, 토론, 쓰기 세 단계 카드에 수업에서 하는 일과 집에서 할 일.
   3. 첨삭 수업: 첨삭 방식 네 가지와 첨삭본 받는 방법.
   4. 교습비 안내: 반별 월 교습비 게시표.
   5. 상담 신청(브라우저 안에서만 돈다. 실제로 보내지 않는다): 학년, 방법, 희망일, 시간, 보호자 이름, 연락처. 완료 화면에 접수 번호, 담당 창구, 회신 예정일. */

const TEL = "02-000-0000";
const KAKAO = "카카오톡 채널 독서 논술 학원";
const ADDRESS = "서울 ㅇㅇ구 ㅇㅇ로 00, 3층";

const IMG = "/images/demo-reading-academy";

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

/* ---------- 교습비 ---------- */

const CLASSES = [
  { name: "초등 저학년반", who: "1~2학년", time: "월, 수, 금 15:00 ~ 16:30 중 하루", fee: 140_000 },
  { name: "초등 중학년반", who: "3~4학년", time: "월, 수 16:40 / 화, 목 15:00 중 하루", fee: 150_000 },
  { name: "초등 고학년반", who: "5~6학년", time: "화, 목 16:40 / 토 10:00 중 하루", fee: 160_000 },
  { name: "중등반", who: "중1~중3", time: "화, 목 18:30 / 토 13:00 중 하루", fee: 180_000 },
];

/* ---------- 첨삭 수업 ---------- */

const CORRECT_POINTS = [
  { title: "띄어쓰기와 맞춤법", text: "틀린 칸에 표시하고 바른 글자를 위 칸에 적어요." },
  { title: "빠진 말 채우기", text: "누가, 왜가 빠진 문장은 물음을 달아 스스로 채우게 해요." },
  { title: "잘 쓴 문장", text: "글에서 가장 좋은 문장에 밑줄을 긋고 까닭을 적어요." },
  { title: "다음 글에서 챙길 점", text: "한 가지만 골라 글 끝에 한 줄로 적어요." },
];

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

export function ReadingAcademyDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();

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
      <Poster reduce={reduce} go={go} />

      <section id="ra-books" aria-labelledby="ra-books-title" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pt-10 md:px-6 md:pt-14">
        <CellTitle id="ra-books-title" text={`${month}월 읽는 책`} />
        <Books />
      </section>

      <section id="ra-course" aria-labelledby="ra-course-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <CellTitle id="ra-course-title" text="수업 과정" />
        <Course />
      </section>

      <section id="ra-correct" aria-labelledby="ra-correct-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <CellTitle id="ra-correct-title" text="첨삭 수업" />
        <Correction />
      </section>

      <section id="ra-fee" aria-labelledby="ra-fee-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <CellTitle id="ra-fee-title" text="교습비 안내" />
        <FeeTable onConsult={() => go("ra-consult")} />
      </section>

      <section id="ra-consult" aria-labelledby="ra-consult-title" className="mx-auto mt-14 max-w-[1200px] scroll-mt-4 px-4 md:mt-20 md:px-6">
        <CellTitle id="ra-consult-title" text="상담 신청" />
        <ConsultForm today={today} reduce={reduce} />
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
      <span className="flex items-baseline gap-1 whitespace-nowrap">
        <span className="font-bold tracking-[-0.03em]" style={{ fontSize: size }}>
          독서 논술 학원
        </span>
      </span>
    </span>
  );
}

/* ---------- 첫 화면: 사진 배너와 상담 버튼 ---------- */

const NAV: [string, string][] = [
  ["ra-course", "수업 안내"],
  ["ra-books", "이달의 책"],
  ["ra-correct", "첨삭 수업"],
  ["ra-fee", "교습비"],
  ["ra-consult", "상담 신청"],
  ["ra-visit", "오시는 길"],
];

const POINTS = ["학년별 선정 도서, 한 주에 한 권", "4~6명 소수 토론 수업", "매주 원고지 쓰기와 1:1 첨삭"];

function Poster({ reduce, go }: { reduce: boolean; go: (id: string) => void }) {
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

      <div className="mx-auto grid max-w-[1280px] gap-0 md:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] md:gap-8 md:px-6 md:py-8 lg:items-center">
        {/* 책 사진 */}
        <div className="relative h-[30svh] min-h-[200px] overflow-hidden md:h-full md:min-h-[480px] md:rounded-[8px]" style={{ background: "#e9e6e4" }}>
          <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : HERO_DUR, ease: EASE }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
            <img
              src={`${IMG}/hero.jpg`}
              srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
              sizes="(min-width: 768px) 55vw, 100vw"
              alt="흰 벽 앞에서 두 손으로 책 네 권을 들어 올린 모습"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "48% 40%" }}
            />
          </motion.div>
        </div>

        {/* 문장과 상담 버튼 */}
        <div className={`px-4 pb-10 pt-6 md:px-0 md:pb-0 md:pt-0 ${reduce ? "" : "ra-rise"}`}>
          <h1 id="ra-poster-title" className="text-[30px] font-bold md:text-[38px]" style={{ letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}>
            읽고 토론하고 쓰는 90분
          </h1>
          <p className="mt-2 text-[16px]" style={{ color: C.body }}>
            초등 1학년 ~ 중학교 3학년, 주 1회
          </p>
          <ul className="mt-5 grid gap-2 text-[16px]">
            {POINTS.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check size={18} aria-hidden style={{ color: C.accent }} />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => go("ra-consult")}
              data-gtm-cta="reading-academy_poster_cta"
              className={`inline-flex min-h-[48px] items-center gap-2 rounded-[6px] px-5 text-[16px] font-bold ${focusRing}`}
              style={{ background: C.accent, color: "#fff", outlineColor: C.ink }}
            >
              <CalendarCheck size={18} aria-hidden />
              무료 상담 신청
            </button>
            <button
              type="button"
              onClick={() => go("ra-books")}
              className={`inline-flex min-h-[48px] items-center gap-2 rounded-[6px] border px-5 text-[16px] font-bold ${focusRing}`}
              style={{ borderColor: C.ink, color: C.ink, outlineColor: C.accent }}
            >
              <BookOpen size={18} aria-hidden />
              이달의 책
            </button>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-[15px]" style={{ color: C.muted }}>
            <MessageCircle size={16} aria-hidden />
            전화 {TEL}, {KAKAO}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- 1. 이번 달 읽는 책 ---------- */

function Books() {
  const [g, setG] = useState(1);
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

function Course() {
  return (
    <div className="mt-6">
      <p className="text-[16px]" style={{ color: C.body }}>
        한 번 수업 {TOTAL_MIN}분, 읽기와 토론과 쓰기 순서로 진행해요.
      </p>
      <ol className="mt-4 grid gap-4 md:grid-cols-3">
        {STEPS.map((x, i) => {
          const Icon = x.icon;
          return (
            <li key={x.label} className="rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.border, background: C.card }}>
              <p className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-[19px] font-bold">
                  <Icon size={22} aria-hidden style={{ color: C.accent }} />
                  {i + 1}. {x.label}
                </span>
                <span className="text-[15px] font-semibold tabular-nums" style={{ color: C.muted }}>
                  {x.min}분
                </span>
              </p>
              <ul className="mt-4 grid gap-2 text-[16px] leading-[1.6]">
                {x.inClass.map((t) => (
                  <li key={t} className="flex gap-2">
                    <Check size={18} className="mt-[3px] flex-none" aria-hidden style={{ color: C.accent }} />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-[4px] p-4" style={{ background: C.soft }}>
                <p className="text-[15px] font-bold">집에서</p>
                <p className="mt-1 text-[15px] leading-[1.6]">{x.atHome}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------- 3. 첨삭 수업 ---------- */

function Correction() {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      <div>
        <p className="text-[16px] leading-[1.7]" style={{ color: C.body }}>
          수업 시간에 쓴 원고지는 담당 선생님이 한 장씩 읽고 빨간 펜으로 고쳐 드려요. 틀린 곳만 고치지 않고 잘 쓴 문장을 먼저 찾아 표시하고,
          다음 글에서 챙길 점을 한 가지로 정해 끝에 적어요.
        </p>
        <ul className="mt-5 grid gap-2">
          {CORRECT_POINTS.map((x, k) => (
            <li key={x.title} className="flex gap-3 rounded-[4px] border p-4" style={{ borderColor: C.border, background: C.card }}>
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full text-[14px] font-bold text-white" style={{ background: C.red }}>
                {k + 1}
              </span>
              <span>
                <span className="block text-[16px] font-bold">{x.title}</span>
                <span className="mt-0.5 block text-[15px] leading-[1.5]" style={{ color: C.muted }}>
                  {x.text}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[6px] border p-5 md:p-6" style={{ borderColor: C.border, background: C.card }}>
        <p className="text-[18px] font-bold">첨삭본 받는 방법</p>
        <dl className="mt-4 grid gap-x-5 gap-y-3 text-[16px] sm:grid-cols-[auto_1fr]">
          <dt className="font-bold">보내는 날</dt>
          <dd>수업 다음 날까지</dd>
          <dt className="font-bold">보내는 곳</dt>
          <dd>보호자 카카오톡으로 첨삭본 사진</dd>
          <dt className="font-bold">원고 보관</dt>
          <dd>학생별 글 모음철에 한 학기 동안 보관</dd>
          <dt className="font-bold">학기 상담</dt>
          <dd>학기마다 한 번, 글 모음철을 보며 보호자 상담</dd>
        </dl>
      </div>
    </div>
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

function ConsultForm({ today, reduce }: { today: Date; reduce: boolean }) {
  const [grade, setGrade] = useState<(typeof GRADE_OPTS)[number]>("초3");
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
