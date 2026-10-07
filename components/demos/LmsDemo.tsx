"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Check, ChevronLeft, ChevronRight, Download, Lock, Pause, Play, Printer, RotateCcw, Send, X } from "lucide-react";
import { daysAgo, fmtDash, fmtDot, fmtMD, useDemoToday } from "@/hooks/useDemoToday";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 사내·위탁 이러닝 LMS 데모. 구성은 국내 HRD 이러닝 사이트, 원격평생교육원, 대학 LMS를 따랐다
   (조사 자료 01_Work/03_Resource/benchmark/LMS.md). 화면 디자인은 요즘 플랫폼(패스트캠퍼스, 클래스101, 휴넷, 인프런)처럼
   흰 바탕, 16:9 썸네일 카드, 밑줄 탭, 과정 상세 오른쪽 고정 신청 카드, 이어서 학습하기 카드, 어두운 플레이어로 했다.
   사이트: 메인(배너, 과정 분야 바로가기, 인기/신규 과정, 공지사항, 자주 묻는 질문, 학습지원센터, 수강 절차), 교육과정, 과정 상세(환급 안내, 수강신청),
   수강신청(개강 일정), 학습지원센터, 로그인(데모 계정).
   학습자: 나의 강의실(학습중인 과정, 학습종료 과정, 수료증 발급) > 과정 강의실(학습현황, 수료기준, 학습하기, 평가, 공지사항, 학습 Q&A) > 학습창.
   학습창에서는 실제로 재생한 구간만 진도로 친다. 차시 학습시간의 90% 이상이면 학습완료, 앞 차시를 마쳐야 다음 차시가 열린다.
   수료기준은 진도율 80% 이상 + 총점 60점 이상(진행단계평가 30%, 최종평가 70%), 과정 설문 참여 후 수료증 출력.
   관리자: 학습현황관리(검색, 학습독려 SMS, 엑셀 다운로드), 수료관리, 차시별 진도현황(이탈 구간), SMS 발송내역, 과정 목록.
   수강생은 시드 고정 난수로 만든 가상 데이터다(서버와 브라우저 결과가 같다). */

const C = {
  bg: "#f6f6f4",
  surface: "#ffffff",
  soft: "#f3f4f2",
  head: "#f3f4f2",
  line: "#e6e7e4",
  text: "#1b1f1d",
  muted: "#5c635f",
  brand: "#1f5f46",
  brandSoft: "#e5f0ea",
  accent: "#c2410c",
  warn: "#9a3412",
  warnSoft: "#fdecdf",
  dark: "#16211c",
} as const;

const EASE = [0.23, 1, 0.32, 1] as const;
const STORAGE_KEY = "gs-demo:lms:v4";
const DONE_RATIO = 0.9;
const PASS_PROGRESS = 80;
const PASS_TOTAL = 60;
const MID_WEIGHT = 0.3;
const FINAL_WEIGHT = 0.7;
const ME = { id: "me", name: "김하늘", dept: "인사팀" };

// 학습기간·기수·공지일은 모두 오늘 기준으로 계산한다 (아래 makeDates)
const COURSE = {
  title: "엑셀 실무 기초",
  dday: 20,
  teacher: "박서영",
};

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
    ago: 9,
    body: [
      "진도율 80% 이상, 총점 60점 이상 시 수료됩니다.",
      "차시별 학습시간의 90% 이상 학습해야 학습완료로 인정됩니다.",
      "진행단계평가는 진도율 50% 이상, 최종평가는 진도율 80% 이상 학습 후 응시할 수 있습니다.",
      "평가는 1회만 응시할 수 있습니다.",
      "복습기간에는 진도율에 반영되지 않습니다.",
    ],
  },
  { title: "모사답안 처리 기준 안내", ago: 9, body: ["모사답안으로 확인된 경우 0점 처리되며 미수료됩니다."] },
  { title: "학습지원센터 운영시간 안내", ago: 12, body: ["평일 09:00~18:00 (점심시간 12:00~13:00)", "주말 및 공휴일 휴무", "전화 02-000-0000"] },
];

interface Qna {
  title: string;
  writer: string;
  date: string;
  answered: boolean;
}
const QNA: (Omit<Qna, "date"> & { ago: number })[] = [
  { title: "피벗 테이블 새로 고침이 안 됩니다", writer: "정도윤", ago: 1, answered: false },
  { title: "VLOOKUP 결과가 #N/A로 나옵니다", writer: "이서준", ago: 5, answered: true },
  { title: "실습 파일은 어디서 받나요?", writer: "최유나", ago: 8, answered: true },
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
  loggedIn: boolean;
  applied: Applied[];
}
interface Applied {
  id: string;
  term: string;
  period: string;
}

const smsTemplates = (endKo: string) => [
  {
    kind: "학습독려",
    text: `[곰선임 아카데미] {이름}님, 엑셀 실무 기초 현재 진도율은 {진도율}입니다. 학습종료일 ${endKo}까지 진도율 80% 이상 학습하셔야 수료됩니다.`,
  },
  {
    kind: "평가 안내",
    text: `[곰선임 아카데미] {이름}님, 엑셀 실무 기초 최종평가 응시가 가능합니다. 학습종료일 ${endKo}까지 응시하셔야 수료됩니다.`,
  },
];

const initialState: State = {
  // 1~5차시는 학습완료, 6차시는 중간까지 본 상태로 시작한다 (이어보기가 보이도록)
  lessons: LESSONS.map((l, i) => (i < 5 ? { pos: l.duration, segs: [[0, l.duration]] } : i === 5 ? { pos: 418, segs: [[0, 418]] } : { pos: 0, segs: [] })),
  mid: null,
  final: null,
  survey: false,
  qna: [],
  // 관리자가 보낸 문자만 저장한다. 기존 발송내역은 makeDates에서 오늘 기준으로 만든다.
  sms: [],
  confirmed: {},
  loggedIn: false,
  applied: [],
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
const certNo = (prefix: string, index: number) => `${prefix}-${String(index + 1).padStart(3, "0")}`;

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
  confirmedAt: number | null;
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
      confirmedAt: meets && rand() < 0.55 ? pick([2, 1]) : null,
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


/* ---------- 공통 스타일 ---------- */

const btnBase = "inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-[14px] font-bold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40";
const btnPrimary = { background: C.brand, color: "#fff" };
const btnLine = { border: `1px solid ${C.line}`, background: "#fff", color: C.text };
const th = "px-3 py-2.5 text-left text-[14px] font-bold whitespace-nowrap";
const td = "px-3 py-2.5 whitespace-nowrap";

function Panel({ title, id, right, children }: { title: string; id: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-[10px] border bg-white" style={{ borderColor: C.line }}>
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
    <nav aria-label={label} className="lg:self-start">
      <p className="px-3 pb-2 text-[13px] font-bold" style={{ color: C.muted }}>
        {title}
      </p>
      <ul className="flex flex-wrap gap-1 lg:flex-col">
        {items.map(([id, text]) => (
          <li key={id}>
            <button
              type="button"
              aria-current={current === id ? "page" : undefined}
              onClick={() => onSelect(id)}
              className="w-full rounded-md px-3 py-2.5 text-left text-[15px]"
              style={current === id ? { color: C.text, fontWeight: 700, background: "#fff", boxShadow: `inset 0 0 0 1px ${C.line}` } : { color: C.muted }}
            >
              {text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------- 사이트 (공개 화면) ---------- */

type Category = "법정의무교육" | "직무" | "산업안전" | "리더십";
interface CourseInfo {
  id: string;
  title: string;
  cat: Category;
  lessons: string[];
  hours: string;
  period: string;
  fee: number;
  refund: boolean;
  img: string;
  imgAlt: string;
  terms: "month" | "quarter";
}


const COURSES: CourseInfo[] = [
  {
    id: "excel",
    title: "엑셀 실무 기초",
    cat: "직무",
    lessons: LESSONS.map((l) => l.title),
    hours: `${Math.floor(TOTAL_MIN / 60)}시간 ${TOTAL_MIN % 60}분`,
    period: "1개월",
    fee: 120000,
    refund: true,
    img: "/images/demo-lms/course-excel.jpg",
    imgAlt: "서류와 계산기, 노트북이 놓인 사무실 책상",
    terms: "month",
  },
  {
    id: "harass",
    title: "직장 내 괴롭힘 예방교육",
    cat: "법정의무교육",
    lessons: ["직장 내 괴롭힘의 개념", "괴롭힘 판단 기준과 사례", "발생 시 조치 절차", "존중하는 조직문화"],
    hours: "1시간",
    period: "3개월",
    fee: 25000,
    refund: false,
    img: "/images/demo-lms/course-harassment.jpg",
    imgAlt: "원탁과 의자가 놓인 회의실",
    terms: "quarter",
  },
  {
    id: "safety",
    title: "산업안전보건 교육(사무직)",
    cat: "산업안전",
    lessons: ["산업안전보건법 개요", "사무실 안전 수칙", "근골격계 질환 예방", "화재 예방과 대피", "응급처치 기초", "직무 스트레스 관리"],
    hours: "3시간",
    period: "3개월",
    fee: 40000,
    refund: false,
    img: "/images/demo-lms/course-safety.jpg",
    imgAlt: "가공 장비가 늘어선 공장 내부",
    terms: "quarter",
  },
  {
    id: "privacy",
    title: "개인정보보호 교육",
    cat: "법정의무교육",
    lessons: ["개인정보보호법 개요", "개인정보 수집과 이용", "안전성 확보 조치", "유출 사고 대응", "업무별 처리 사례"],
    hours: "2시간",
    period: "3개월",
    fee: 25000,
    refund: false,
    img: "/images/demo-lms/course-privacy.jpg",
    imgAlt: "노트북으로 일하는 직원",
    terms: "quarter",
  },
  {
    id: "biz-doc",
    title: "비즈니스 문서 작성",
    cat: "직무",
    lessons: ["업무 문서의 기본 구조", "보고서 작성 순서", "핵심 요약 쓰기", "기획서 작성", "회의록 작성", "이메일 작성 예절", "표와 그래프 활용", "맞춤법과 띄어쓰기", "공문서 작성 기준", "실습: 주간 업무 보고서"],
    hours: "5시간",
    period: "1개월",
    fee: 150000,
    refund: true,
    img: "/images/demo-lms/course-docs.jpg",
    imgAlt: "책상 위에 놓인 서류와 만년필",
    terms: "month",
  },
  {
    id: "quality",
    title: "품질관리 실무",
    cat: "직무",
    lessons: ["품질관리 개요", "QC 7가지 도구", "관리도 작성", "공정능력 분석", "불량 원인 분석", "8D 보고서 작성", "측정시스템 분석", "실습: 개선 사례"],
    hours: "8시간",
    period: "1개월",
    fee: 210000,
    refund: true,
    img: "/images/demo-lms/course-quality.jpg",
    imgAlt: "시험 장비가 놓인 실험실",
    terms: "month",
  },
  {
    id: "leader",
    title: "신임 팀장 리더십",
    cat: "리더십",
    lessons: ["팀장의 역할", "목표 설정과 업무 분배", "성과 면담", "피드백 방법", "갈등 관리", "팀 회의 운영"],
    hours: "3시간",
    period: "1개월",
    fee: 90000,
    refund: true,
    img: "/images/demo-lms/course-leader.jpg",
    imgAlt: "노트북 화면을 함께 보는 직원들",
    terms: "month",
  },
];
const POPULAR = ["excel", "harass", "safety", "privacy"];
const NEWEST = ["biz-doc", "quality", "leader"];
const CATS: Category[] = ["법정의무교육", "직무", "산업안전", "리더십"];
const won = (n: number) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원`;
// 우선지원대상기업 90%, 1,000인 미만 80%, 1,000인 이상 40%
const REFUND_RATES: [string, number][] = [
  ["우선지원대상기업", 0.9],
  ["1,000인 미만 기업", 0.8],
  ["1,000인 이상 기업", 0.4],
];

/* ---------- 날짜 (오늘 기준) ---------- */

interface Term {
  term: string;
  period: string;
  close: string;
}
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const ymdKo = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
const mdKo = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
// 월 과정 기수: 개강 일주일 뒤가 속한 달, 그 날이 15일 이전이면 1기
const monthTerm = (start: Date) => {
  const m = addDays(start, 7);
  return `${m.getFullYear()}년 ${m.getMonth() + 1}월 ${m.getDate() <= 15 ? 1 : 2}기`;
};
// n분기 전(0이면 이번 분기)
const quarterOf = (today: Date, n: number) => {
  const first = Math.floor(today.getMonth() / 3) * 3 - n * 3;
  const start = new Date(today.getFullYear(), first, 1);
  const end = new Date(today.getFullYear(), first + 3, 0);
  return { start, end, label: `${start.getFullYear()}년 ${Math.floor(start.getMonth() / 3) + 1}분기`, period: `${fmtDot(start)} ~ ${fmtDot(end)}` };
};

function makeDates(today: Date) {
  const at = (n: number) => daysAgo(today, n);
  const dot = (n: number) => fmtDot(at(n));
  const range = (a: number, b: number) => `${dot(a)} ~ ${dot(b)}`;
  const start = at(9);
  const end = at(-20);
  const q0 = quarterOf(today, 0);
  const q1 = quarterOf(today, 1);
  const q2 = quarterOf(today, 2);
  const y = today.getFullYear();
  const half = today.getMonth() < 6 ? { label: "하반기", period: `${y - 1}.07.01 ~ ${y - 1}.12.31` } : { label: "상반기", period: `${y}.01.02 ~ ${y}.06.30` };
  const course = { term: monthTerm(start), period: range(9, -20), review: range(-21, -112), end: dot(-20), endKo: mdKo(end) };
  const termsMonth: Term[] = [
    { term: monthTerm(at(-12)), period: range(-12, -41), close: dot(-8) },
    { term: monthTerm(at(-26)), period: range(-26, -55), close: dot(-22) },
  ];
  const termsQuarter: Term[] = [{ term: q0.label, period: q0.period, close: fmtDot(addDays(q0.end, -16)) }];
  const templates = smsTemplates(course.endKo);
  const smsSeed: SmsLog[] = [
    { at: `${dot(2)} 10:00`, kind: "학습독려", type: "LMS", count: 52, text: templates[0].text },
    { at: `${dot(9)} 09:00`, kind: "개강 안내", type: "LMS", count: 143, text: `[곰선임 아카데미] {이름}님, 엑셀 실무 기초 ${course.term} 학습이 시작되었습니다. 학습기간 ${fmtMD(start)} ~ ${fmtMD(end)}` },
  ];
  const notices = NOTICES.map(({ ago, ...n }) => ({ ...n, date: dot(ago) }));
  return {
    today: fmtDot(today),
    dot,
    course,
    termsMonth,
    terms: (k: CourseInfo["terms"]) => (k === "month" ? termsMonth : termsQuarter),
    certPrefix: fmtDash(today).slice(0, 7),
    myCertDate: ymdKo(today),
    pastCert: { no: `${fmtDash(q1.start).slice(0, 7)}-288`, period: q1.period, date: ymdKo(addDays(q1.start, 42)) },
    history: [
      ["직장 내 괴롭힘 예방교육", q1.period, "100%", "92점", "수료"],
      ["개인정보보호 교육", q2.period, "66.7%", "-", "미수료"],
      [`산업안전보건 교육(${half.label})`, half.period, "100%", "85점", "수료"],
    ],
    adminCourses: [
      ["엑셀 실무 기초", course.term, 8, course.period, 143, "-", "진행중"],
      ["비즈니스 문서 작성", termsMonth[0].term, 10, termsMonth[0].period, 61, "-", "수강신청중"],
      ["직장 내 괴롭힘 예방교육", q1.label, 4, q1.period, 412, "91.7%", "종료"],
      ["산업안전보건 교육", q1.label, 12, q1.period, 207, "78.3%", "종료"],
      ["엑셀 실무 기초", monthTerm(at(37)), 8, range(37, 8), 97, "69.1%", "종료"],
      ["개인정보보호 교육", q2.label, 6, q2.period, 389, "86.4%", "종료"],
    ] as const,
    templates,
    smsSeed,
    notices,
    qna: QNA.map(({ ago, ...q }) => ({ ...q, date: dot(ago) })),
    siteNotices: [
      { title: `${termsMonth[0].term} 수강신청 안내`, date: dot(6), body: [`신청기간 ${range(6, -8)}`, `학습기간 ${termsMonth[0].period}`] },
      notices[0],
      { title: "명절 연휴 학습지원센터 운영 안내", date: dot(15), body: [`${range(13, 9)} 학습지원센터 휴무`, "휴무 기간 문의는 1:1 문의로 남겨 주시면 순차적으로 답변드립니다."] },
      ...notices.slice(1, 3),
    ],
  };
}
type Dates = ReturnType<typeof makeDates>;
const DatesCtx = createContext<Dates>(makeDates(new Date(2026, 9, 7)));
const useDates = () => useContext(DatesCtx);
const FAQ = [
  { q: "수료기준은 어떻게 되나요?", a: "진도율 80% 이상, 총점 60점 이상 시 수료됩니다. 과정별 수료기준은 과정 상세에서 확인할 수 있습니다." },
  { q: "진도율이 올라가지 않습니다.", a: "차시별 학습시간의 90% 이상 학습해야 학습완료로 인정됩니다. [학습종료] 버튼이 아닌 창 닫기로 종료하면 진도가 저장되지 않을 수 있습니다." },
  { q: "수료증은 어디서 발급받나요?", a: "[나의 강의실 > 수료증 발급]에서 출력할 수 있습니다. 과정 설문 참여 후 출력이 가능합니다." },
  { q: "복습기간에도 진도율이 반영되나요?", a: "복습기간에는 진도율에 반영되지 않습니다." },
  { q: "환급은 어떻게 받나요?", a: "수료 후 직업훈련포털(HRD-Net)에 등록된 회사 계좌로 한국산업인력공단에서 환급금을 지급합니다." },
];
const STEPS = ["회원가입", "수강신청", "수강승인", "학습", "수료"];

type SupportTab = "notice" | "faq" | "ask";
type Route =
  | { name: "home" }
  | { name: "courses"; cat: Category | "전체" }
  | { name: "course"; id: string }
  | { name: "apply" }
  | { name: "support"; tab: SupportTab }
  | { name: "login"; next: Route }
  | { name: "my" };

const wrap = "mx-auto max-w-[1200px] px-4 md:px-6";
const Sep = () => (
  <span aria-hidden className="mx-1.5 opacity-40">
    |
  </span>
);

function UnderlineTabs<T extends string>({ items, current, onSelect, label, size = "md", idPrefix }: { items: [T, string][]; current: T; onSelect: (id: T) => void; label: string; size?: "md" | "lg"; idPrefix?: string }) {
  return (
    <div role="tablist" aria-label={label} className="relative flex gap-6 overflow-x-auto border-b md:gap-8" style={{ borderColor: C.line }}>
      {items.map(([id, text]) => (
        <button
          key={id}
          role="tab"
          type="button"
          id={idPrefix ? `${idPrefix}-${id}` : undefined}
          aria-selected={current === id}
          onClick={() => onSelect(id)}
          className={`relative shrink-0 pb-3 font-bold whitespace-nowrap ${size === "lg" ? "text-[17px]" : "text-[15px]"}`}
          style={{ color: current === id ? C.text : C.muted }}
        >
          {text}
          {current === id && <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: C.text }} />}
        </button>
      ))}
    </div>
  );
}

function SiteHeader({ route, loggedIn, go, onMy, onLogout, onAdmin, onReset }: { route: Route; loggedIn: boolean; go: (r: Route) => void; onMy: () => void; onLogout: () => void; onAdmin: () => void; onReset: () => void }) {
  const menu: [string, string, () => void, boolean][] = [
    ["lms-gnb-courses", "교육과정", () => go({ name: "courses", cat: "전체" }), route.name === "courses" || route.name === "course"],
    ["lms-gnb-apply", "수강신청", () => go({ name: "apply" }), route.name === "apply"],
    ["lms-gnb-my", "나의 강의실", onMy, route.name === "my"],
    ["lms-gnb-support", "학습지원센터", () => go({ name: "support", tab: "notice" }), route.name === "support"],
  ];
  return (
    <header className="border-b bg-white" style={{ borderColor: C.line }}>
      <div className={`${wrap} flex flex-wrap items-center gap-x-10`}>
        <button type="button" onClick={() => go({ name: "home" })} className="flex h-16 items-center gap-2" style={{ color: C.brand }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.svg" alt="" aria-hidden width={30} height={30} className="h-[30px] w-[30px] shrink-0" />
          <span className="sr-only">곰선임 아카데미</span>
          <span aria-hidden className="flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-[20px] font-bold">곰선임</span>
            <span className="text-[12px] font-bold opacity-80">아카데미</span>
          </span>
        </button>
        <div className="order-2 ml-auto flex items-center gap-1 md:order-3">
          <button type="button" id="lms-admin" onClick={onAdmin} className="px-2 py-1.5 text-[14px]" style={{ color: C.muted }}>
            관리자
          </button>
          <button type="button" onClick={onReset} aria-label="초기화" className="grid size-9 place-items-center rounded-md" style={{ color: C.muted }}>
            <RotateCcw size={15} aria-hidden />
          </button>
          {loggedIn ? (
            <>
              <span className="hidden px-2 text-[14px] sm:inline">
                <b>{maskName(ME.name)}</b>님
              </span>
              <button type="button" onClick={onLogout} className="h-9 rounded-md px-3 text-[14px] font-bold" style={{ background: C.soft }}>
                로그아웃
              </button>
            </>
          ) : (
            <button type="button" onClick={() => go({ name: "login", next: { name: "my" } })} className="h-9 rounded-md px-4 text-[14px] font-bold text-white" style={{ background: C.text }}>
              로그인
            </button>
          )}
        </div>
        <nav aria-label="주 메뉴" className="order-3 w-full md:order-2 md:w-auto">
          <ul className="flex justify-between md:justify-start md:gap-8">
            {menu.map(([id, label, onClick, active]) => (
              <li key={id}>
                <button type="button" id={id} aria-current={active ? "page" : undefined} onClick={onClick} className="relative block py-3 text-[15px] font-bold whitespace-nowrap md:py-5 md:text-[16px]" style={{ color: active ? C.text : C.muted }}>
                  {label}
                  {active && <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: C.text }} />}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-24 border-t text-[13px] leading-[1.8]" style={{ background: C.soft, borderColor: C.line, color: C.muted }}>
      <div className={`${wrap} pt-10 pb-28`}>
        <p className="flex flex-wrap gap-x-5 font-bold" style={{ color: C.text }}>
          <span>이용약관</span>
          <span>개인정보처리방침</span>
          <span>학습유의사항</span>
          <span>환불규정</span>
        </p>
        <p className="mt-4">
          ㄱㅍ아카데미 <Sep /> 대표 김ㅈ우 <Sep /> 사업자등록번호 000-00-00000
        </p>
        <p>
          서울특별시 중구 세종대로 000 <Sep /> 학습지원센터 02-000-0000
        </p>
        <p className="mt-3">Copyright © ㄱㅍ아카데미. All rights reserved.</p>
      </div>
    </footer>
  );
}

function CourseCard({ c, onOpen }: { c: CourseInfo; onOpen: () => void }) {
  return (
    <li className="min-w-0">
      <button type="button" onClick={onOpen} className="group block w-full text-left">
        <span className="relative block aspect-video overflow-hidden rounded-lg" style={{ background: C.soft }}>
          <Image src={c.img} alt={c.imgAlt} fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 100vw" className="object-cover" />
        </span>
        <span className="mt-3 block text-[13px] tabular-nums" style={{ color: C.muted }}>
          {c.cat} <Sep /> {c.lessons.length}차시 <Sep /> {c.hours}
        </span>
        <span className="mt-1 block text-[17px] leading-[1.4] font-bold group-hover:underline group-hover:underline-offset-4">{c.title}</span>
        <span className="mt-2 flex flex-wrap items-baseline gap-x-2 tabular-nums">
          <span className="text-[16px] font-bold">{won(c.fee)}</span>
          {c.refund ? (
            <span className="text-[13px] font-bold" style={{ color: C.brand }}>
              환급 {won(Math.round(c.fee * 0.9))}
            </span>
          ) : (
            <span className="text-[13px]" style={{ color: C.muted }}>
              비환급
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

function Steps() {
  return (
    <ol className="grid grid-cols-5 gap-2">
      {STEPS.map((s, k) => (
        <li key={s} className="relative">
          <span aria-hidden className="block h-[3px] rounded-full" style={{ background: k === STEPS.length - 1 ? C.brand : C.line }} />
          <span className="mt-3 block text-[13px] tabular-nums" style={{ color: C.muted }}>
            {k + 1}단계
          </span>
          <span className="block text-[15px] font-bold md:text-[17px]">{s}</span>
        </li>
      ))}
    </ol>
  );
}

type HomeTab = "popular" | "new" | Category;

function Home({ go }: { go: (r: Route) => void }) {
  const D = useDates();
  const [tab, setTab] = useState<HomeTab>("popular");
  const list = tab === "popular" ? POPULAR.map((id) => COURSES.find((c) => c.id === id)!) : tab === "new" ? NEWEST.map((id) => COURSES.find((c) => c.id === id)!) : COURSES.filter((c) => c.cat === tab);

  return (
    <>
      <section aria-labelledby="banner-title" className={`${wrap} grid items-center gap-8 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-12 md:pt-14`}>
        <div>
          <h1 id="banner-title" className="text-[30px] leading-[1.3] font-bold break-keep md:text-[44px]">
            사업주 직업능력개발훈련
            <br />
            환급과정
          </h1>
          <p className="mt-4 text-[17px] md:text-[19px]" style={{ color: C.muted }}>
            우선지원대상기업 교육비 최대 90% 환급
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <button type="button" onClick={() => go({ name: "courses", cat: "전체" })} className="h-12 rounded-md px-6 text-[16px] font-bold text-white" style={{ background: C.brand }}>
              과정 보기
            </button>
            <button type="button" onClick={() => go({ name: "apply" })} className="h-12 rounded-md px-6 text-[16px] font-bold" style={{ background: C.soft }}>
              수강신청 안내
            </button>
          </div>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[12px]" style={{ background: C.soft }}>
          <Image src="/images/demo-lms/hero.jpg" alt="회의 탁자에서 노트북으로 공부하는 직원들" fill priority sizes="(min-width: 768px) 620px, 100vw" className="object-cover" />
        </div>
      </section>

      <section id="lms-courses" aria-labelledby="courses-home-title" className={`${wrap} mt-20`}>
        <div className="flex items-end gap-4">
          <h2 id="courses-home-title" className="mr-auto text-[24px] font-bold">
            교육과정
          </h2>
          <button type="button" onClick={() => go({ name: "courses", cat: "전체" })} className="inline-flex items-center pb-1 text-[14px]" style={{ color: C.muted }}>
            전체 과정
            <ChevronRight size={15} aria-hidden />
          </button>
        </div>
        <div className="mt-5">
          <UnderlineTabs<HomeTab>
            label="과정 구분"
            items={[
              ["popular", "인기 과정"],
              ["new", "신규 과정"],
              ...CATS.map((k) => [k, k] as [HomeTab, string]),
            ]}
            current={tab}
            onSelect={setTab}
          />
        </div>
        <ul key={tab} className="soft-in mt-7 grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((c) => (
            <CourseCard key={c.id} c={c} onOpen={() => go({ name: "course", id: c.id })} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="refund-home" className={`${wrap} mt-20`}>
        <div className="rounded-[12px] px-6 py-8 md:px-10" style={{ background: C.brandSoft }}>
          <h2 id="refund-home" className="text-[20px] font-bold md:text-[22px]">
            기업 규모별 환급률
          </h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-3">
            {REFUND_RATES.map(([k, r]) => (
              <div key={k}>
                <dt className="text-[15px]" style={{ color: C.muted }}>
                  {k}
                </dt>
                <dd className="mt-1 text-[34px] font-bold tabular-nums" style={{ color: C.brand }}>
                  {r * 100}%
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="home-steps" className={`${wrap} mt-20`}>
        <h2 id="home-steps" className="text-[24px] font-bold">
          수강 절차
        </h2>
        <div className="mt-6">
          <Steps />
        </div>
      </section>

      <div className={`${wrap} mt-20 grid grid-cols-1 gap-12 md:grid-cols-2`}>
        {(
          [
            ["home-notice", "공지사항", "notice", D.siteNotices.slice(0, 4).map((n) => [n.title, n.date])],
            ["home-faq", "자주 묻는 질문", "faq", FAQ.slice(0, 4).map((f) => [f.q, ""])],
          ] as const
        ).map(([id, title, tabId, rows]) => (
          <section key={id} aria-labelledby={id}>
            <div className="flex items-center">
              <h2 id={id} className="mr-auto text-[20px] font-bold">
                {title}
              </h2>
              <button type="button" onClick={() => go({ name: "support", tab: tabId })} className="inline-flex items-center text-[14px]" style={{ color: C.muted }}>
                더보기
                <ChevronRight size={15} aria-hidden />
              </button>
            </div>
            <ul className="mt-3">
              {rows.map(([head, date]) => (
                <li key={head} className="border-b" style={{ borderColor: C.line }}>
                  <button type="button" onClick={() => go({ name: "support", tab: tabId })} className="flex w-full gap-3 py-3.5 text-left text-[15px]">
                    <span className="min-w-0 flex-1 truncate">{head}</span>
                    {date && (
                      <span className="shrink-0 text-[14px] tabular-nums" style={{ color: C.muted }}>
                        {date}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section aria-labelledby="home-cs" className={`${wrap} mt-12`}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[12px] px-6 py-5" style={{ background: C.soft }}>
          <h2 id="home-cs" className="text-[16px] font-bold">
            학습지원센터
          </h2>
          <p className="text-[20px] font-bold tabular-nums">02-000-0000</p>
          <p className="text-[14px]" style={{ color: C.muted }}>
            평일 09:00~18:00 (점심시간 12:00~13:00), 주말 및 공휴일 휴무
          </p>
          <button type="button" onClick={() => go({ name: "support", tab: "ask" })} className="h-10 rounded-md bg-white px-4 text-[14px] font-bold sm:ml-auto">
            1:1 문의
          </button>
        </div>
      </section>
    </>
  );
}

function SiteCoursesPage({ cat, go }: { cat: Category | "전체"; go: (r: Route) => void }) {
  const list = COURSES.filter((c) => cat === "전체" || c.cat === cat);
  return (
    <div className={`${wrap} pt-10`}>
      <h1 className="text-[28px] font-bold">교육과정</h1>
      <div className="mt-6">
        <UnderlineTabs<Category | "전체"> label="과정 분야" items={(["전체", ...CATS] as const).map((k) => [k, k] as [Category | "전체", string])} current={cat} onSelect={(k) => go({ name: "courses", cat: k })} />
      </div>
      <p className="mt-6 text-[15px] tabular-nums" style={{ color: C.muted }}>
        총 <b style={{ color: C.text }}>{list.length}</b>개 과정
      </p>
      <ul key={cat} className="soft-in mt-4 grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
        {list.map((c) => (
          <CourseCard key={c.id} c={c} onOpen={() => go({ name: "course", id: c.id })} />
        ))}
      </ul>
    </div>
  );
}

function CourseDetail({ id, state, setState, go, notify }: { id: string; state: State; setState: SetState; go: (r: Route) => void; notify: (t: string) => void }) {
  const D = useDates();
  const c = COURSES.find((x) => x.id === id) ?? COURSES[0];
  const [term, setTerm] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [allLessons, setAllLessons] = useState(false);
  const applied = state.applied.find((a) => a.id === c.id);
  const status = !state.loggedIn ? null : c.id === "excel" ? "수강중인 과정입니다." : c.id === "biz-doc" ? "신청완료 (학습대기)" : applied ? "신청완료 (승인대기)" : null;
  const terms = D.terms(c.terms);
  const t = terms[Math.min(term, terms.length - 1)];
  const shown = allLessons ? c.lessons : c.lessons.slice(0, 5);

  return (
    <div className={`${wrap} pt-6`}>
      <nav aria-label="현재 위치" className="flex items-center gap-1 text-[14px]" style={{ color: C.muted }}>
        <button type="button" onClick={() => go({ name: "courses", cat: "전체" })} className="hover:underline">
          교육과정
        </button>
        <ChevronRight size={14} aria-hidden />
        <button type="button" onClick={() => go({ name: "courses", cat: c.cat })} className="hover:underline">
          {c.cat}
        </button>
      </nav>

      <div className="mt-5 grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <p className="text-[14px]" style={{ color: C.muted }}>
            {c.cat} <Sep /> {c.refund ? "환급과정" : "비환급과정"}
          </p>
          <h1 className="mt-1.5 text-[28px] leading-[1.3] font-bold break-keep md:text-[32px]">{c.title}</h1>
          <p className="mt-3 text-[15px] tabular-nums" style={{ color: C.muted }}>
            {c.lessons.length}차시 <Sep /> {c.hours} <Sep /> 학습기간 {c.period}
          </p>
          <div className="relative mt-6 aspect-video overflow-hidden rounded-[12px]" style={{ background: C.soft }}>
            <Image src={c.img} alt={c.imgAlt} fill priority sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
          </div>
        </div>

        <aside aria-label="수강신청" className="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="rounded-[12px] border p-6" style={{ borderColor: C.line }}>
            <p className="text-[14px]" style={{ color: C.muted }}>
              교육비
            </p>
            <p className="mt-0.5 text-[28px] font-bold tabular-nums">{won(c.fee)}</p>
            {c.refund ? (
              <p className="mt-1 text-[15px] tabular-nums">
                <b style={{ color: C.brand }}>환급 {won(Math.round(c.fee * 0.9))}</b>
                <span style={{ color: C.muted }}> (우선지원대상기업)</span>
                <br />
                <span style={{ color: C.muted }}>자부담 {won(c.fee - Math.round(c.fee * 0.9))}</span>
              </p>
            ) : (
              <p className="mt-1 text-[15px]" style={{ color: C.muted }}>
                비환급과정
              </p>
            )}
            <dl className="mt-5 grid gap-2.5 border-t pt-5 text-[15px]" style={{ borderColor: C.line }}>
              <div className="grid gap-1.5">
                <dt>
                  <label htmlFor="term-select" style={{ color: C.muted }}>
                    기수
                  </label>
                </dt>
                <dd>
                  <select id="term-select" value={term} onChange={(e) => setTerm(Number(e.target.value))} disabled={!!status} className="h-11 w-full rounded-md border bg-white px-3 text-[15px]" style={{ borderColor: C.line }}>
                    {terms.map((x, k) => (
                      <option key={x.term} value={k}>
                        {x.term}
                      </option>
                    ))}
                  </select>
                </dd>
              </div>
              {[
                ["학습기간", t.period],
                ["신청마감", t.close],
                ["수료증", "수료 시 발급"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt style={{ color: C.muted }}>{k}</dt>
                  <dd className="text-right tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>

            {status ? (
              <div className="mt-6">
                <p className="text-[15px] font-bold" style={{ color: C.brand }}>
                  {status}
                </p>
                {c.id === "excel" && (
                  <button type="button" onClick={() => go({ name: "my" })} className="mt-3 h-12 w-full rounded-md text-[16px] font-bold text-white" style={{ background: C.brand }}>
                    강의실 입장
                  </button>
                )}
              </div>
            ) : confirm ? (
              <div className="mt-6 rounded-lg p-4" style={{ background: C.soft }}>
                <p className="text-[15px] font-bold">신청확인</p>
                <p className="mt-1 text-[14px] leading-[1.6] tabular-nums" style={{ color: C.muted }}>
                  {c.title}
                  <br />
                  {t.term} ({t.period})
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setConfirm(false)} className="h-11 rounded-md bg-white text-[15px] font-bold">
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setState((s) => ({ ...s, applied: [...s.applied, { id: c.id, term: t.term, period: t.period }] }));
                      setConfirm(false);
                      notify("수강신청이 완료되었습니다. 수강승인 후 학습할 수 있습니다.");
                    }}
                    className="h-11 rounded-md text-[15px] font-bold text-white"
                    style={{ background: C.brand }}
                  >
                    신청하기
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => (state.loggedIn ? setConfirm(true) : go({ name: "login", next: { name: "course", id: c.id } }))} className="mt-6 h-12 w-full rounded-md text-[16px] font-bold text-white" style={{ background: C.brand }}>
                수강신청
              </button>
            )}
          </div>
        </aside>

        <div className="min-w-0 lg:col-start-1">
          <section aria-labelledby="lessons-title">
            <div className="flex items-baseline gap-3">
              <h2 id="lessons-title" className="text-[20px] font-bold">
                커리큘럼
              </h2>
              <span className="text-[14px] tabular-nums" style={{ color: C.muted }}>
                {c.lessons.length}차시 <Sep /> {c.hours}
              </span>
            </div>
            <ol className="mt-4 overflow-hidden rounded-[12px] border" style={{ borderColor: C.line }}>
              {shown.map((l, k) => (
                <li key={l} className="flex items-center gap-4 border-b px-5 py-3.5 text-[15px] last:border-b-0" style={{ borderColor: C.line }}>
                  <Play size={14} aria-hidden style={{ color: C.muted }} />
                  <span className="min-w-0 flex-1">
                    {k + 1}. {l}
                  </span>
                  {c.id === "excel" && (
                    <span className="shrink-0 text-[14px] tabular-nums" style={{ color: C.muted }}>
                      {clock(LESSONS[k].duration)}
                    </span>
                  )}
                </li>
              ))}
            </ol>
            {c.lessons.length > 5 && (
              <button type="button" aria-expanded={allLessons} onClick={() => setAllLessons(!allLessons)} className="mt-3 h-11 w-full rounded-md text-[15px] font-bold" style={{ background: C.soft }}>
                {allLessons ? "접기" : `전체 ${c.lessons.length}차시 보기`}
              </button>
            )}
          </section>

          <section aria-labelledby="pass-title" className="mt-12">
            <h2 id="pass-title" className="text-[20px] font-bold">
              수료기준
            </h2>
            <ul className="mt-4 grid gap-2 text-[15px]">
              {["진도율 80% 이상", "총점 60점 이상 (진행단계평가 30%, 최종평가 70%)", "과정 설문 참여 후 수료증 출력"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <Check size={16} aria-hidden style={{ color: C.brand }} />
                  {x}
                </li>
              ))}
            </ul>
          </section>

          {c.refund && (
            <section aria-labelledby="refund-title" className="mt-12">
              <h2 id="refund-title" className="text-[20px] font-bold">
                환급 안내
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {REFUND_RATES.map(([k, r]) => (
                  <li key={k} className="rounded-[12px] border p-5 tabular-nums" style={{ borderColor: C.line }}>
                    <p className="text-[14px]" style={{ color: C.muted }}>
                      {k} ({r * 100}%)
                    </p>
                    <p className="mt-1 text-[20px] font-bold" style={{ color: C.brand }}>
                      {won(Math.round(c.fee * r))}
                    </p>
                    <p className="text-[14px]" style={{ color: C.muted }}>
                      자부담 {won(c.fee - Math.round(c.fee * r))}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function ApplyPage({ go }: { go: (r: Route) => void }) {
  const D = useDates();
  return (
    <div className={`${wrap} pt-10`}>
      <h1 className="text-[28px] font-bold">수강신청</h1>
      <section aria-labelledby="apply-steps" className="mt-8">
        <h2 id="apply-steps" className="sr-only">
          수강 절차
        </h2>
        <Steps />
      </section>
      <section aria-labelledby="schedule-title" className="mt-14">
        <h2 id="schedule-title" className="text-[20px] font-bold">
          개강 일정
        </h2>
        <ul className="mt-4 border-t" style={{ borderColor: C.line }}>
          {COURSES.map((c) => {
            const t = D.terms(c.terms)[0];
            return (
              <li key={c.id} className="flex items-center gap-4 border-b py-4" style={{ borderColor: C.line }}>
                <span className="relative hidden aspect-video w-28 shrink-0 overflow-hidden rounded-md sm:block" style={{ background: C.soft }}>
                  <Image src={c.img} alt="" fill sizes="112px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-bold">{c.title}</span>
                  <span className="mt-0.5 block text-[14px] tabular-nums" style={{ color: C.muted }}>
                    {t.term} <Sep /> {t.period} <Sep /> 신청마감 {t.close}
                  </span>
                </span>
                <button type="button" onClick={() => go({ name: "course", id: c.id })} className="h-10 shrink-0 rounded-md px-4 text-[14px] font-bold" style={{ background: C.soft }}>
                  신청
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function SupportPage({ tab, go, loggedIn, notify }: { tab: SupportTab; go: (r: Route) => void; loggedIn: boolean; notify: (t: string) => void }) {
  const D = useDates();
  const [open, setOpen] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  return (
    <div className={`${wrap} pt-10`}>
      <h1 className="text-[28px] font-bold">학습지원센터</h1>
      <div className="mt-6">
        <UnderlineTabs<SupportTab>
          label="학습지원센터 메뉴"
          items={[
            ["notice", "공지사항"],
            ["faq", "자주 묻는 질문"],
            ["ask", "1:1 문의"],
          ]}
          current={tab}
          onSelect={(id) => {
            setOpen(null);
            go({ name: "support", tab: id });
          }}
        />
      </div>

      {tab !== "ask" && (
        <ul key={tab} className="soft-in mt-2">
          {(tab === "notice" ? D.siteNotices.map((n) => ({ head: n.title, sub: n.date, body: n.body })) : FAQ.map((f) => ({ head: f.q, sub: "", body: [f.a] }))).map((n, k) => (
            <li key={n.head} className="border-b" style={{ borderColor: C.line }}>
              <button type="button" aria-expanded={open === k} onClick={() => setOpen(open === k ? null : k)} className="flex w-full items-center gap-3 py-4 text-left">
                {tab === "faq" && (
                  <span className="shrink-0 text-[15px] font-bold" style={{ color: C.brand }}>
                    Q
                  </span>
                )}
                <span className="min-w-0 flex-1 text-[16px] font-bold">{n.head}</span>
                {n.sub && (
                  <span className="shrink-0 text-[14px] tabular-nums" style={{ color: C.muted }}>
                    {n.sub}
                  </span>
                )}
                <ChevronRight size={16} aria-hidden className={`shrink-0 transition-transform ${open === k ? "rotate-90" : ""}`} style={{ color: C.muted }} />
              </button>
              {open === k && (
                <ul className="mb-4 grid gap-1 rounded-lg px-5 py-4 text-[15px] leading-[1.7]" style={{ background: C.soft }}>
                  {n.body.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {tab === "ask" &&
        (loggedIn ? (
          <form
            className="soft-in mt-8 grid max-w-[720px] gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setTitle("");
              setBody("");
              notify("문의가 등록되었습니다.");
            }}
          >
            <label className="grid gap-1.5 text-[15px] font-bold">
              제목
              <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={60} className="h-12 rounded-md border bg-white px-3 font-normal" style={{ borderColor: C.line }} />
            </label>
            <label className="grid gap-1.5 text-[15px] font-bold">
              내용
              <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={6} className="rounded-md border bg-white px-3 py-2.5 font-normal" style={{ borderColor: C.line }} />
            </label>
            <div>
              <button type="submit" disabled={!title.trim() || !body.trim()} className="h-12 rounded-md px-8 text-[15px] font-bold text-white disabled:opacity-40" style={{ background: C.brand }}>
                등록
              </button>
            </div>
          </form>
        ) : (
          <div className="soft-in mt-12 text-center">
            <p className="text-[16px]">로그인 후 이용할 수 있습니다.</p>
            <button type="button" onClick={() => go({ name: "login", next: { name: "support", tab: "ask" } })} className="mt-4 h-12 rounded-md px-8 text-[15px] font-bold text-white" style={{ background: C.text }}>
              로그인
            </button>
          </div>
        ))}
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const input = "h-12 rounded-md border px-3 text-[15px] font-normal";
  return (
    <div className="mx-auto max-w-[400px] px-4 pt-16">
      <h1 className="text-center text-[28px] font-bold">로그인</h1>
      <form
        className="mt-8 grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onLogin();
        }}
      >
        <label className="grid gap-1.5 text-[14px] font-bold">
          아이디
          <input value={id} onChange={(e) => setId(e.target.value)} required autoComplete="username" className={input} style={{ borderColor: C.line }} />
        </label>
        <label className="grid gap-1.5 text-[14px] font-bold">
          비밀번호
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required autoComplete="current-password" className={input} style={{ borderColor: C.line }} />
        </label>
        <button type="submit" className="mt-3 h-12 rounded-md text-[16px] font-bold text-white" style={{ background: C.text }}>
          로그인
        </button>
        <button
          type="button"
          onClick={() => {
            setId("student01");
            setPw("demo1234");
            onLogin();
          }}
          className="h-12 rounded-md text-[16px] font-bold"
          style={{ background: C.soft }}
        >
          데모 계정으로 로그인
        </button>
        <p className="mt-2 flex justify-center gap-4 text-[14px]" style={{ color: C.muted }}>
          <span>아이디 찾기</span>
          <span>비밀번호 찾기</span>
          <span>회원가입</span>
        </p>
      </form>
    </div>
  );
}

/* ---------- 루트 ---------- */

export function LmsDemo() {
  const reduce = useReducedMotionSafe();
  const [state, setState, hydrated] = useLocalStorage<State>(STORAGE_KEY, initialState);
  const today = useDemoToday();
  const dates = useMemo(() => makeDates(today), [today]);
  const [view, setView] = useState<"site" | "admin">("site");
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const notify = useCallback((text: string) => setToast((t) => ({ id: (t?.id ?? 0) + 1, text })), []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  // 같은 메뉴를 다시 눌러도 첫 화면으로 돌아가도록 이동할 때마다 키를 바꾼다
  const [navKey, setNavKey] = useState(0);
  const go = useCallback((r: Route) => {
    setView("site");
    setRoute(r);
    setNavKey((k) => k + 1);
    window.scrollTo({ top: 0 });
  }, []);

  // 사용법 가이드: 관리자·로그인·강의실(플레이어 등)을 모두 닫고 공개 메인으로
  useEffect(() => {
    const f = () => {
      setView("site");
      setRoute({ name: "home" });
      setNavKey((k) => k + 1);
    };
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const ratios = state.lessons.map((p, i) => ratio(p, LESSONS[i]));
  const done = ratios.map((r) => r >= DONE_RATIO);
  const doneCount = done.filter(Boolean).length;
  const progress = (doneCount / LESSONS.length) * 100;
  const reset = () => {
    setState(initialState);
    setRoute({ name: "home" });
    setView("site");
    notify("초기화했습니다.");
  };

  return (
    <DatesCtx.Provider value={dates}>
    <div className={`min-h-screen ${view === "admin" ? "pb-24" : ""}`} style={{ background: view === "site" ? "#fff" : C.bg, color: C.text }} aria-busy={!hydrated}>
      {view === "site" ? (
        <>
          <SiteHeader
            route={route}
            loggedIn={state.loggedIn}
            go={go}
            onMy={() => go(state.loggedIn ? { name: "my" } : { name: "login", next: { name: "my" } })}
            onLogout={() => {
              setState((s) => ({ ...s, loggedIn: false }));
              go({ name: "home" });
            }}
            onAdmin={() => {
              setView("admin");
              window.scrollTo({ top: 0 });
            }}
            onReset={reset}
          />
          <main key={route.name === "course" ? `course:${route.id}` : route.name} className="soft-in">
            {route.name === "home" && <Home go={go} />}
            {route.name === "courses" && <SiteCoursesPage cat={route.cat} go={go} />}
            {route.name === "course" && <CourseDetail key={route.id} id={route.id} state={state} setState={setState} go={go} notify={notify} />}
            {route.name === "apply" && <ApplyPage go={go} />}
            {route.name === "support" && <SupportPage tab={route.tab} go={go} loggedIn={state.loggedIn} notify={notify} />}
            {route.name === "login" && (
              <LoginPage
                onLogin={() => {
                  setState((s) => ({ ...s, loggedIn: true }));
                  go(route.next);
                }}
              />
            )}
            {route.name === "my" && (
              <div className="mx-auto max-w-[1200px] px-4 pt-10 md:px-6">
                <LearnerView key={navKey} state={state} setState={setState} ratios={ratios} done={done} progress={progress} notify={notify} />
              </div>
            )}
          </main>
          <SiteFooter />
        </>
      ) : (
        <>
          <header className="border-b bg-white" style={{ borderColor: C.line }}>
            <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 md:px-6">
              <p className="mr-auto flex items-center gap-2" style={{ color: C.brand }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo.svg" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
                <span className="sr-only">곰선임 아카데미 관리자</span>
                <span aria-hidden className="flex items-baseline gap-1 whitespace-nowrap">
                  <span className="text-[18px] font-bold">곰선임</span>
                  <span className="text-[11px] font-bold opacity-80">아카데미</span>
                  <span className="ml-1.5 text-[14px] font-bold" style={{ color: C.text }}>
                    관리자
                  </span>
                </span>
              </p>
              <button type="button" onClick={() => go(route)} className={btnBase} style={btnLine}>
                사이트 보기
              </button>
              <button type="button" onClick={reset} aria-label="초기화" className="grid size-9 place-items-center rounded-[4px]" style={{ color: C.muted }}>
                <RotateCcw size={15} aria-hidden />
              </button>
            </div>
          </header>
          <main className="soft-in mx-auto max-w-[1200px] px-4 pt-5 md:px-6">
            <AdminView state={state} setState={setState} myProgress={progress} myDone={done} notify={notify} />
          </main>
        </>
      )}

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
    </DatesCtx.Provider>
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
  const D = useDates();
  const [page, setPage] = useState<LearnerPage>("ongoing");
  const [inRoom, setInRoom] = useState(false);
  const [tab, setTab] = useState<RoomTab>("study");
  const [player, setPlayer] = useState<number | null>(null);
  const [cert, setCert] = useState<CertInfo | null>(null);

  const total = totalScore(state.mid, state.final);
  const passed = progress >= PASS_PROGRESS && state.final !== null && total >= PASS_TOTAL;
  const myCert: CertInfo = { no: certNo(D.certPrefix, LEARNERS.length), course: COURSE.title, period: D.course.period, hours: `${Math.floor(TOTAL_MIN / 60)}시간 ${TOTAL_MIN % 60}분`, date: D.myCertDate };
  const pastCert: CertInfo = { no: D.pastCert.no, course: "직장 내 괴롭힘 예방교육", period: D.pastCert.period, hours: "1시간", date: D.pastCert.date };
  const doneCount = done.filter(Boolean).length;
  // 이어서 학습할 차시: 보다 만 차시, 없으면 아직 안 끝난 첫 차시
  const partial = state.lessons.findIndex((p, k) => !done[k] && p.pos > 5);
  const nextIdx = partial >= 0 ? partial : done.findIndex((d) => !d);
  const excel = COURSES[0];
  const waiting = [{ id: "biz-doc", period: D.termsMonth[0].period, status: "학습대기" }, ...state.applied.map((a) => ({ id: a.id, period: a.period, status: "승인대기" }))];

  const rowCls = "flex flex-wrap items-center gap-x-4 gap-y-2 border-b py-4";

  return (
    <div>
      {!inRoom && (
        <>
          <h1 className="text-[28px] font-bold">나의 강의실</h1>
          <div className="mt-6">
            <UnderlineTabs<LearnerPage>
              label="나의 강의실 메뉴"
              items={[
                ["ongoing", "학습중인 과정"],
                ["ended", "학습종료 과정"],
                ["cert", "수료증 발급"],
              ]}
              current={page}
              onSelect={setPage}
            />
          </div>
        </>
      )}

      {page === "ongoing" && !inRoom && (
        <div className="soft-in mt-8">
          <section aria-labelledby="resume-title" className="grid gap-6 rounded-[12px] border p-4 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:p-5" style={{ borderColor: C.line }}>
            <div className="relative aspect-video overflow-hidden rounded-lg" style={{ background: C.soft }}>
              <Image src={excel.img} alt={excel.imgAlt} fill sizes="(min-width: 768px) 340px, 100vw" className="object-cover" />
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="text-[14px] tabular-nums" style={{ color: C.muted }}>
                {D.course.term} <Sep /> D-{COURSE.dday}
              </p>
              <h2 id="resume-title" className="mt-1 text-[22px] font-bold">
                {COURSE.title}
              </h2>
              <p className="mt-1 text-[14px] tabular-nums" style={{ color: C.muted }}>
                학습기간 {D.course.period}
              </p>
              <div className="mt-5">
                <div className="flex items-baseline justify-between text-[14px] tabular-nums">
                  <span>
                    진도율 <b className="text-[18px]">{pct(progress)}</b>
                  </span>
                  <span style={{ color: C.muted }}>
                    {doneCount}/{LESSONS.length}차시 완료
                  </span>
                </div>
                <span className="mt-2 block h-2 overflow-hidden rounded-full" style={{ background: C.soft }}>
                  <span className="block h-full rounded-full" style={{ width: `${progress}%`, background: C.brand }} />
                </span>
              </div>
              {nextIdx >= 0 && (
                <p className="mt-4 text-[15px]">
                  <span style={{ color: C.muted }}>다음 학습</span> <b>{nextIdx + 1}차시 {LESSONS[nextIdx].title}</b>
                  {state.lessons[nextIdx].pos > 5 && (
                    <span className="tabular-nums" style={{ color: C.muted }}>
                      {" "}
                      ({clock(state.lessons[nextIdx].pos)}부터)
                    </span>
                  )}
                </p>
              )}
              <div className="mt-5 flex flex-wrap gap-2 md:mt-auto md:pt-5">
                {nextIdx >= 0 && (
                  <button type="button" onClick={() => setPlayer(nextIdx)} className="inline-flex h-12 items-center gap-2 rounded-md px-6 text-[16px] font-bold text-white" style={{ background: C.brand }}>
                    <Play size={16} aria-hidden />
                    이어서 학습하기
                  </button>
                )}
                <button type="button" onClick={() => setInRoom(true)} className="h-12 rounded-md px-6 text-[16px] font-bold" style={{ background: C.soft }}>
                  강의실 입장
                </button>
              </div>
            </div>
          </section>

          <section aria-labelledby="waiting-title" className="mt-12">
            <h2 id="waiting-title" className="text-[18px] font-bold">
              신청한 과정
            </h2>
            <ul className="mt-2">
              {waiting.map((w) => {
                const c = COURSES.find((x) => x.id === w.id)!;
                return (
                  <li key={w.id} className={rowCls} style={{ borderColor: C.line }}>
                    <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-md" style={{ background: C.soft }}>
                      <Image src={c.img} alt="" fill sizes="96px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-bold">{c.title}</span>
                      <span className="block text-[14px] tabular-nums" style={{ color: C.muted }}>
                        학습기간 {w.period}
                      </span>
                    </span>
                    <span className="text-[14px] font-bold" style={{ color: C.muted }}>
                      {w.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
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
        <ul className="soft-in mt-4">
          {D.history.map((r) => (
            <li key={r[0]} className={rowCls} style={{ borderColor: C.line }}>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-bold">{r[0]}</span>
                <span className="block text-[14px] tabular-nums" style={{ color: C.muted }}>
                  {r[1]} <Sep /> 진도율 {r[2]} <Sep /> 총점 {r[3]}
                </span>
              </span>
              <span className="text-[15px] font-bold" style={{ color: r[4] === "미수료" ? C.warn : C.brand }}>
                {r[4]}
              </span>
            </li>
          ))}
        </ul>
      )}

      {page === "cert" && (
        <ul className="soft-in mt-4">
          <li className={rowCls} style={{ borderColor: C.line }}>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-bold">{COURSE.title}</span>
              <span className="block text-[14px] tabular-nums" style={{ color: C.muted }}>
                {D.course.period}
                {passed && (
                  <>
                    {" "}
                    <Sep /> 수료번호 {myCert.no}
                  </>
                )}
              </span>
            </span>
            {!passed ? (
              <span className="text-[15px]" style={{ color: C.muted }}>
                미수료
              </span>
            ) : state.survey ? (
              <button type="button" onClick={() => setCert(myCert)} className="inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-[14px] font-bold text-white" style={{ background: C.brand }}>
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
                className="h-10 rounded-md px-4 text-[14px] font-bold"
                style={{ background: C.soft }}
              >
                설문 참여
              </button>
            )}
          </li>
          <li className={rowCls} style={{ borderColor: C.line }}>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-bold">{pastCert.course}</span>
              <span className="block text-[14px] tabular-nums" style={{ color: C.muted }}>
                {pastCert.period} <Sep /> 수료번호 {pastCert.no}
              </span>
            </span>
            <button type="button" onClick={() => setCert(pastCert)} className="inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-[14px] font-bold text-white" style={{ background: C.brand }}>
              <Printer size={15} aria-hidden />
              출력
            </button>
          </li>
        </ul>
      )}

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
  const D = useDates();
  const reduce = useReducedMotionSafe();
  const [openLesson, setOpenLesson] = useState<number | null>(null);
  const resumeAt = state.lessons.findIndex((p, k) => !done[k] && p.pos > 5);
  const stats: [string, React.ReactNode, string, boolean][] = [
    ["진도율", pct(progress), `기준 ${PASS_PROGRESS}% 이상`, progress >= PASS_PROGRESS],
    ["진행단계평가", state.mid === null ? "미응시" : `${state.mid}점`, `반영비율 ${MID_WEIGHT * 100}%`, state.mid !== null],
    ["최종평가", state.final === null ? "미응시" : `${state.final}점`, `반영비율 ${FINAL_WEIGHT * 100}%`, state.final !== null],
    ["총점", `${total}점`, `기준 ${PASS_TOTAL}점 이상`, total >= PASS_TOTAL],
  ];

  return (
    <div className="soft-in grid grid-cols-1">
      <nav aria-label="현재 위치" className="flex items-center gap-1 text-[14px]" style={{ color: C.muted }}>
        <button type="button" onClick={onBack} className="underline-offset-2 hover:underline">
          나의 강의실
        </button>
        <ChevronRight size={14} aria-hidden />
        <span style={{ color: C.text }}>{COURSE.title}</span>
      </nav>

      <section aria-labelledby="room-title" className="mt-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 id="room-title" className="text-[26px] font-bold">
            {COURSE.title}
          </h2>
          <span className="text-[15px]" style={{ color: C.muted }}>
            {D.course.term}
          </span>
        </div>
        <p className="mt-2 text-[14px] leading-[1.7] tabular-nums" style={{ color: C.muted }}>
          학습기간 {D.course.period} (D-{COURSE.dday}) <Sep /> 복습기간 {D.course.review} <Sep /> 강사 {maskName(COURSE.teacher)}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border md:grid-cols-5" style={{ borderColor: C.line, background: C.line }}>
          {stats.map(([k, v, sub, ok]) => (
            <div key={k} className="bg-white px-5 py-4">
              <dt className="text-[14px]" style={{ color: C.muted }}>
                {k}
              </dt>
              <dd className="mt-1 text-[22px] font-bold tabular-nums" style={{ color: ok && (k === "진도율" || k === "총점") ? C.brand : C.text }}>
                {v}
              </dd>
              <dd className="text-[13px]" style={{ color: C.muted }}>
                {sub}
              </dd>
            </div>
          ))}
          <div className="col-span-2 bg-white px-5 py-4 md:col-span-1">
            <dt className="text-[14px]" style={{ color: C.muted }}>
              수료여부
            </dt>
            <dd className="mt-1 text-[22px] font-bold" style={{ color: passed ? C.brand : state.final !== null ? C.warn : C.text }}>
              {passed ? "수료" : state.final !== null ? "미수료" : "학습중"}
            </dd>
            {passed && (
              <dd className="mt-1">
                <button type="button" onClick={state.survey ? onCert : () => setTab("exam")} className="h-9 rounded-md px-3 text-[14px] font-bold" style={state.survey ? { background: C.brand, color: "#fff" } : { background: C.soft }}>
                  {state.survey ? "수료증 출력" : "설문 참여"}
                </button>
              </dd>
            )}
          </div>
        </dl>
      </section>

      <div className="mt-10">
        <UnderlineTabs<RoomTab>
          label="강의실 메뉴"
          size="lg"
          idPrefix="room-tab"
          items={[
            ["study", "학습하기"],
            ["exam", "평가"],
            ["notice", "공지사항"],
            ["qna", "학습 Q&A"],
          ]}
          current={tab}
          onSelect={setTab}
        />
      </div>

      <div key={tab} className="soft-in mt-6">
        {tab === "study" && (
          <section id="room-panel-study" role="tabpanel" aria-label="강의 보기">
            <ol className="overflow-hidden rounded-[12px] border" style={{ borderColor: C.line }}>
              {LESSONS.map((l, k) => {
                const locked = k > 0 && !done[k - 1];
                const r = Math.round(ratios[k] * 100);
                const isResume = k === resumeAt;
                const open = openLesson === k;
                return (
                  <li key={l.title} className="border-b last:border-b-0" style={{ borderColor: C.line }}>
                    <div className="flex items-center gap-3 px-4 py-4 md:gap-4 md:px-5">
                      <span
                        className="grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold tabular-nums"
                        style={done[k] ? { background: C.brand, color: "#fff" } : { background: C.soft, color: C.muted }}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={done[k] ? "ok" : "no"}
                            initial={reduce ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 500, damping: 22 }}
                          >
                            {done[k] ? <Check size={15} aria-label="학습완료" /> : k + 1}
                          </motion.span>
                        </AnimatePresence>
                      </span>
                      <button type="button" aria-expanded={open} onClick={() => setOpenLesson(open ? null : k)} className="min-w-0 flex-1 text-left">
                        <span className="flex items-center gap-1.5 text-[16px] font-bold">
                          <span className="truncate">{l.title}</span>
                          <ChevronRight size={15} aria-hidden className={`shrink-0 transition-transform ${open ? "rotate-90" : ""}`} style={{ color: C.muted }} />
                        </span>
                        <span className="mt-1.5 flex items-center gap-3 text-[13px] tabular-nums" style={{ color: C.muted }}>
                          <span>{clock(l.duration)}</span>
                          <span className="block h-1 w-20 overflow-hidden rounded-full md:w-32" style={{ background: C.soft }}>
                            <span className="block h-full rounded-full" style={{ width: `${r}%`, background: C.brand }} />
                          </span>
                          <span>{r}%</span>
                        </span>
                      </button>
                      {locked ? (
                        <button type="button" disabled className="inline-flex h-10 shrink-0 items-center gap-1 rounded-md px-3 text-[14px] font-bold opacity-40" style={{ background: C.soft }} aria-label={`${k + 1}차시 학습하기 (이전 차시 학습 후 가능)`}>
                          <Lock size={14} aria-hidden />
                          학습하기
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onPlay(k)}
                          className="h-10 shrink-0 rounded-md px-4 text-[14px] font-bold"
                          style={isResume ? { background: C.accent, color: "#fff" } : done[k] ? { background: C.soft } : { background: C.brand, color: "#fff" }}
                        >
                          {isResume ? "이어보기" : done[k] ? "복습하기" : "학습하기"}
                        </button>
                      )}
                    </div>
                    {open && (
                      <ol className="grid gap-1 px-4 pb-4 pl-[60px] text-[14px] md:pl-[68px]" style={{ color: C.muted }}>
                        {l.pages.map((p, j) => (
                          <li key={p} className="flex gap-3 tabular-nums">
                            <span className="w-11 shrink-0">{clock(Math.round((l.duration / l.pages.length) * j))}</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {tab !== "study" && (
          <div className="overflow-hidden rounded-[12px] border" style={{ borderColor: C.line }}>
            {tab === "exam" && <ExamTab state={state} setState={setState} progress={progress} notify={notify} />}
            {tab === "notice" && <NoticeTab />}
            {tab === "qna" && <QnaTab state={state} setState={setState} notify={notify} />}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 학습자: 평가 ---------- */

function ExamTab({ state, setState, progress, notify }: { state: State; setState: SetState; progress: number; notify: (t: string) => void }) {
  const D = useDates();
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
      <div key={mode} id="room-panel-exam" role="tabpanel" aria-labelledby="room-tab-exam" className="soft-in p-4">
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
    <div key="list" id="room-panel-exam" role="tabpanel" aria-labelledby="room-tab-exam" className="soft-in relative overflow-x-auto">
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
              <td className={`${td} tabular-nums`}>~ {D.course.end}</td>
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
  const D = useDates();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div id="room-panel-notice" role="tabpanel" aria-labelledby="room-tab-notice">
      <ul>
        {D.notices.map((n, k) => (
          <li key={n.title} className="border-b last:border-b-0" style={{ borderColor: C.line }}>
            <button type="button" aria-expanded={open === k} onClick={() => setOpen(open === k ? null : k)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
              <span className="w-6 shrink-0 text-[14px] tabular-nums" style={{ color: C.muted }}>
                {D.notices.length - k}
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
  const D = useDates();
  const [writing, setWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const list = [...state.qna, ...D.qna];

  return (
    <div id="room-panel-qna" role="tabpanel" aria-labelledby="room-tab-qna">
      {writing ? (
        <form
          className="grid gap-3 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            setState((s) => ({ ...s, qna: [{ title: title.trim(), writer: ME.name, date: D.today, answered: false }, ...s.qna] }));
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

  const dim = "rgba(255,255,255,.62)";
  const edge = "rgba(255,255,255,.12)";
  const darkBtn = "inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-md border text-[14px] font-bold disabled:opacity-30";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/70 md:items-center md:p-6"
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
        className="flex w-full max-w-[1120px] flex-col overflow-y-auto text-white md:max-h-[92vh] md:rounded-[12px]"
        style={{ background: "#0f1512" }}
      >
        <div className="flex items-center gap-3 border-b px-4 py-3 md:px-5" style={{ borderColor: edge }}>
          <p id="player-title" className="min-w-0 flex-1 truncate text-[15px] font-bold">
            <span style={{ color: dim }}>{COURSE.title}</span> <Sep /> {index + 1}차시 {lesson.title}
          </p>
          <button type="button" autoFocus onClick={finish} className="inline-flex h-9 shrink-0 items-center rounded-md px-3 text-[14px] font-bold" style={{ background: "rgba(255,255,255,.1)" }}>
            학습종료
          </button>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="relative aspect-video" style={{ background: "#000" }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${index}-${pageAt}`}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="absolute inset-0 flex flex-col justify-center px-6 md:px-12"
                >
                  <p className="text-[14px]" style={{ color: dim }}>
                    {index + 1}차시 {pageAt + 1}/{lesson.pages.length}
                  </p>
                  <p className="mt-2 text-[24px] leading-[1.3] font-bold md:text-[38px]">{lesson.pages[pageAt]}</p>
                </motion.div>
              </AnimatePresence>
              {askResume && (
                <div className="absolute inset-0 grid place-items-center bg-black/60 p-4">
                  <div className="w-full max-w-[340px] rounded-[12px] bg-white p-4 text-center md:p-5" role="alertdialog" aria-label="이어보기" style={{ color: C.text }}>
                    <p className="text-[15px] font-bold break-keep md:text-[16px]">이전에 학습한 위치부터 이어서 학습하시겠습니까?</p>
                    <p className="mt-1 text-[14px] tabular-nums" style={{ color: C.muted }}>
                      마지막 학습 위치 {clock(prog.pos)}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAskResume(false);
                          seek(0);
                          setPlaying(true);
                        }}
                        className="h-10 rounded-md text-[14px] font-bold"
                        style={{ background: C.soft }}
                      >
                        처음부터
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAskResume(false);
                          setPlaying(true);
                        }}
                        className="h-10 rounded-md text-[14px] font-bold text-white"
                        style={{ background: C.accent }}
                      >
                        이어보기
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 pt-4 pb-5 md:px-5">
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
                className="relative h-2 cursor-pointer rounded-full"
                style={{ background: "repeating-linear-gradient(135deg, rgba(255,255,255,.22) 0 4px, rgba(255,255,255,.08) 4px 8px)" }}
              >
                {prog.segs.map(([a, b]) => (
                  <span key={a} className="absolute inset-y-0 rounded-full" style={{ left: `${(a / lesson.duration) * 100}%`, width: `${((b - a) / lesson.duration) * 100}%`, background: "#4fae84" }} />
                ))}
                <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ left: `${(prog.pos / lesson.duration) * 100}%` }} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAskResume(false);
                    if (prog.pos >= lesson.duration) seek(0);
                    setPlaying((p) => !p);
                  }}
                  aria-label={playing ? "일시정지" : "재생"}
                  className="grid size-11 place-items-center rounded-full bg-white"
                  style={{ color: "#0f1512" }}
                >
                  {playing ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
                </button>
                <span className="text-[15px] tabular-nums">
                  {clock(prog.pos)} <span style={{ color: dim }}>/ {clock(lesson.duration)}</span>
                </span>
                <label className="ml-auto flex items-center gap-2 text-[14px]" style={{ color: dim }}>
                  배속
                  <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="h-9 rounded-md border bg-transparent px-2 text-[14px] text-white" style={{ borderColor: edge, colorScheme: "dark" }}>
                    <option value={1}>1.0배속</option>
                    <option value={1.2}>1.2배속</option>
                    <option value={1.5}>1.5배속</option>
                    <option value={2}>2.0배속</option>
                    <option value={30}>30배속(시연용)</option>
                  </select>
                </label>
              </div>
              <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[14px]">
                <div className="flex gap-1.5">
                  <dt style={{ color: dim }}>차시 진도율</dt>
                  <dd className="font-bold tabular-nums" style={{ color: done[index] ? "#7fd1a8" : "#fff" }}>
                    {r}%
                  </dd>
                </div>
                <div className="flex gap-1.5">
                  <dt style={{ color: dim }}>학습완료 기준</dt>
                  <dd className="tabular-nums">90% 이상</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt style={{ color: dim }}>학습 인정 시간</dt>
                  <dd className="tabular-nums">
                    {clock(watched(prog.segs))} / {clock(lesson.duration)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <aside aria-labelledby="toc-title" className="flex flex-col border-t lg:border-t-0 lg:border-l" style={{ borderColor: edge }}>
            <h3 id="toc-title" className="px-4 pt-4 pb-2 text-[15px] font-bold md:px-5">
              커리큘럼
            </h3>
            <ol className="flex-1 overflow-y-auto px-2 lg:max-h-[56vh]">
              {LESSONS.map((l, k) => {
                const locked = k > 0 && !done[k - 1];
                const cur = k === index;
                return (
                  <li key={l.title}>
                    <button
                      type="button"
                      disabled={locked}
                      aria-current={cur ? "true" : undefined}
                      onClick={() => onChange(k)}
                      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2.5 text-left text-[14px] disabled:opacity-40"
                      style={{ background: cur ? "rgba(255,255,255,.1)" : undefined, fontWeight: cur ? 700 : 400 }}
                    >
                      <span className="w-5 shrink-0 tabular-nums" style={{ color: done[k] ? "#7fd1a8" : dim }}>
                        {done[k] ? <Check size={15} aria-label="학습완료" /> : locked ? <Lock size={13} aria-label="잠김" /> : k + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{l.title}</span>
                      <span className="shrink-0 tabular-nums" style={{ color: dim }}>
                        {Math.round(ratios[k] * 100)}%
                      </span>
                    </button>
                    {cur && (
                      <ol className="mb-1 pl-9">
                        {lesson.pages.map((p, j) => {
                          const from = Math.round((lesson.duration / lesson.pages.length) * j);
                          return (
                            <li key={p}>
                              <button type="button" aria-current={j === pageAt ? "true" : undefined} onClick={() => seek(from)} className="flex w-full gap-2 py-1.5 pr-2 text-left text-[13px]" style={{ color: j === pageAt ? "#fff" : dim }}>
                                <span className="w-10 shrink-0 tabular-nums">{clock(from)}</span>
                                <span className="min-w-0 flex-1">{p}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </li>
                );
              })}
            </ol>
            <div className="flex gap-2 p-4">
              <button type="button" disabled={index === 0} onClick={() => onChange(index - 1)} className={darkBtn} style={{ borderColor: edge }}>
                <ChevronLeft size={15} aria-hidden />
                이전 차시
              </button>
              <button type="button" disabled={!nextOpen} onClick={() => onChange(index + 1)} className={darkBtn} style={{ borderColor: edge }}>
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
          <p className="text-[20px] font-bold">곰선임 아카데미 원장</p>
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
  const D = useDates();
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
      return { ...l, progress, total, meets, confirmed: (l.confirmedAt === null ? null : D.dot(l.confirmedAt)) ?? state.confirmed[l.id] ?? null, live: l.id === ME.id };
    });
  }, [state.lessons, state.mid, state.final, state.confirmed, myDone, D]);

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
      <div key={page} className="soft-in grid min-w-0 grid-cols-1 content-start gap-4">
        {page !== "courses" && page !== "sms" && (
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-[20px] font-bold">
              {COURSE.title} <span className="text-[15px] font-normal" style={{ color: C.muted }}>{D.course.term}</span>
            </h2>
            <dl className="flex flex-wrap gap-x-4 gap-y-1 text-[14px] tabular-nums">
              {[
                ["학습기간", `${D.course.period} (D-${COURSE.dday})`],
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
        {page === "sms" && <SmsLogPage logs={[...state.sms, ...D.smsSeed]} />}
        {page === "courses" && <CoursesPage />}
      </div>
    </div>
  );
}

function StatusPage({ rows, setState, notify, myProgress }: { rows: Row[]; setState: SetState; notify: (t: string) => void; myProgress: number }) {
  const D = useDates();
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
    const body = list.map((r) => [maskName(r.name), r.dept, pct(r.progress), r.mid ?? "", r.final ?? "", r.final === null ? "" : r.total, (r.last === null ? "-" : D.dot(r.last)), statusText(r)].join(","));
    const blob = new Blob(["﻿" + [head.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `학습현황_엑셀실무기초_${D.course.term.replace(/ /g, "")}.csv`;
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

      <section aria-labelledby="status-title" className="rounded-[10px] border bg-white" style={{ borderColor: C.line }}>
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
            <tbody key={`${filter.cond}-${filter.dept}-${filter.q}-${cur}`} className="soft-in tabular-nums">
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
  const D = useDates();
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
          {(r.last === null ? "-" : D.dot(r.last))}
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
  const D = useDates();
  const reduce = useReducedMotionSafe();
  const [tpl, setTpl] = useState(0);
  const [text, setText] = useState(D.templates[0].text);
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
                  setText(D.templates[v].text);
                }}
                className="h-10 rounded-[4px] border bg-white px-2 font-normal"
                style={{ borderColor: C.line }}
              >
                {D.templates.map((t, k) => (
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
              const at = `${D.today} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
              onSend({ at, kind: D.templates[tpl].kind, type, count: recipients.length, text });
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
  const D = useDates();
  const [tab, setTab] = useState<"wait" | "done">("wait");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const waiting = rows.filter((r) => r.meets && !r.confirmed);
  const confirmed = rows.filter((r) => r.confirmed).sort((a, b) => (b.confirmed ?? "").localeCompare(a.confirmed ?? ""));
  const list = tab === "wait" ? waiting : confirmed;

  return (
    <section aria-labelledby="complete-title" className="rounded-[10px] border bg-white" style={{ borderColor: C.line }}>
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
              setState((s) => ({ ...s, confirmed: { ...s.confirmed, ...Object.fromEntries([...selected].map((id) => [id, D.today])) } }));
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
          <tbody key={tab} className="soft-in tabular-nums">
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
                {tab === "done" && <td className={td}>{certNo(D.certPrefix, r.index)}</td>}
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
  const D = useDates();
  const [open, setOpen] = useState(true);
  const courses = D.adminCourses;

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
