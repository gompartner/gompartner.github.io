"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { LeadReceivedPanel, maskName, type LeadRow } from "@/components/demos/LeadReceivedPanel";
import { daysAgo, fmtDot, fmtKo, useDemoToday } from "@/hooks/useDemoToday";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 랜딩페이지 데모(표준 패키지 예시): 가상의 곰파트너 코딩교실 겨울방학 특강 모집.
   교실 이름, 강사, 주소, 수업료, 학생 이름은 모두 가상이다.

   홈페이지 데모와 다른 점: 머리글 메뉴가 없고 목적이 특강 신청 하나다.
   첫 화면부터 신청 폼까지 한 줄로 내려가며, 휴대폰에서는 아래에 신청 버튼이 늘 떠 있다.
   모티프는 블록 코딩 조각과 모눈종이.

   상호작용
   1. 아래 고정 신청 버튼: 누르면 폼으로 내려가고, 폼이 화면에 보이면 숨는다.
   2. 4주 커리큘럼: 주차를 고르면 그 주에 쓰는 코드 블록이 쌓인다.
   3. 자주 묻는 질문 펼쳐 보기.
   4. 신청 폼: 학년을 고르면 들을 수 있는 반만 남고, 반마다 남은 자리가 보인다.
   5. 신청 완료 화면: 접수 번호와 회신 예정일, 남은 자리가 하나 줄어든다.

   사진(public/images/demo-landing-coding-camp): hero, teacher */

const IMG = "/images/demo-landing-coding-camp";

const C = {
  paper: "#f6f3ea",
  grid: "#e4dfd0",
  ink: "#16181d",
  muted: "#545a63",
  yellow: "#ffc83d",
  blue: "#2f62ff",
  green: "#1fa463",
  pink: "#ff5a8a",
  orange: "#ff8a24",
  white: "#ffffff",
};

/* 모눈종이 배경. 그라데이션이 아니라 1px 선을 반복해 그린다. */
const GRID_BG = {
  backgroundColor: C.paper,
  backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
  backgroundSize: "24px 24px",
} as const;

type ClassId = "block" | "game" | "robot";
type Grade = "초2" | "초3" | "초4" | "초5" | "초6";

interface CampClass {
  id: ClassId;
  name: string;
  grades: Grade[];
  when: string;
  fee: number;
  kit?: number;
  capacity: number;
  left: number;
  color: string;
}

const CLASSES: CampClass[] = [
  { id: "block", name: "블록 코딩반", grades: ["초2", "초3"], when: "월, 수 16:00~17:30", fee: 160_000, capacity: 8, left: 3, color: C.yellow },
  { id: "game", name: "게임 만들기반", grades: ["초4", "초5", "초6"], when: "화, 목 16:00~17:30", fee: 160_000, capacity: 8, left: 1, color: C.blue },
  { id: "robot", name: "로봇 코딩반", grades: ["초4", "초5", "초6"], when: "토 10:00~13:00", fee: 180_000, kit: 30_000, capacity: 8, left: 5, color: C.green },
];

const GRADES: Grade[] = ["초2", "초3", "초4", "초5", "초6"];

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/* ---------- 코드 블록 조각 ---------- */

function Block({ color, children, dark = false, indent = 0 }: { color: string; children: React.ReactNode; dark?: boolean; indent?: number }) {
  return (
    <div className="relative" style={{ marginLeft: indent * 22 }}>
      {/* 위 홈 */}
      <span aria-hidden className="absolute left-5 top-0 h-[7px] w-7 rounded-b-[5px]" style={{ background: C.paper }} />
      <div
        className="rounded-[8px] border-2 px-4 pb-3 pt-[13px] text-[16px] font-bold leading-snug"
        style={{ background: color, borderColor: C.ink, color: dark ? C.white : C.ink }}
      >
        {children}
      </div>
      {/* 아래 돌기 */}
      <span aria-hidden className="absolute -bottom-[7px] left-5 z-10 h-[9px] w-7 rounded-b-[5px] border-2 border-t-0" style={{ background: color, borderColor: C.ink }} />
    </div>
  );
}

function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo-bear.png" alt="" aria-hidden width={28} height={28} className="h-7 w-7 shrink-0" />
      <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-[19px] font-bold tracking-[-0.01em]">곰파트너</span>
        <span className="text-[12px] font-semibold opacity-80">코딩교실 샘플</span>
      </span>
    </span>
  );
}

function SectionTitle({ no, children }: { no: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-[6px] border-2 px-2 text-[15px] font-black" style={{ borderColor: C.ink, background: C.white }}>
        {no}
      </span>
      <h2 className="text-[28px] font-black leading-tight tracking-[-0.02em] md:text-[36px]">{children}</h2>
    </div>
  );
}

/* ---------- 본문 ---------- */

export function LandingCodingCampDemo() {
  const today = useDemoToday();
  const deadline = daysAgo(today, -12);
  const start = daysAgo(today, -19);
  const [seats, setSeats] = useState<Record<ClassId, number>>(() => Object.fromEntries(CLASSES.map((c) => [c.id, c.left])) as Record<ClassId, number>);
  const totalLeft = Object.values(seats).reduce((a, b) => a + b, 0);
  const totalCap = CLASSES.reduce((a, c) => a + c.capacity, 0);

  const formRef = useRef<HTMLElement>(null);
  const [formVisible, setFormVisible] = useState(false);
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const goForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen pb-40 font-sans" style={{ ...GRID_BG, color: C.ink }}>
      {/* 머리글: 로고만 둔다 */}
      <header className="mx-auto flex max-w-[1080px] items-center px-5 pt-5 md:px-8">
        <Logo />
      </header>

      <Hero deadline={deadline} start={start} totalLeft={totalLeft} totalCap={totalCap} onApply={goForm} />
      <ForWho />
      <Curriculum />
      <Showcase />
      <Teacher />
      <Schedule seats={seats} start={start} />
      <Faq />
      <ApplyForm
        ref={formRef}
        seats={seats}
        today={today}
        deadline={deadline}
        onApplied={(id) => setSeats((s) => ({ ...s, [id]: Math.max(0, s[id] - 1) }))}
      />

      <footer className="mx-auto mt-16 max-w-[1080px] border-t-2 px-5 pt-6 text-[14px] leading-[1.8] md:px-8" style={{ borderColor: C.ink, color: C.muted }}>
        <p className="font-bold" style={{ color: C.ink }}>곰파트너</p>
        <DemoMakerInfo className="mt-1" />
      </footer>

      <StickyApply hidden={formVisible} left={totalLeft} onApply={goForm} />
    </div>
  );
}

/* ---------- 1. 첫 화면 ---------- */

function Hero({ deadline, start, totalLeft, totalCap, onApply }: { deadline: Date; start: Date; totalLeft: number; totalCap: number; onApply: () => void }) {
  return (
    <section className="mx-auto grid max-w-[1080px] gap-10 px-5 pb-14 pt-10 md:grid-cols-[1.1fr_1fr] md:items-center md:px-8 md:pt-16">
      <div>
        <p className="inline-block rounded-[6px] border-2 px-3 py-1 text-[15px] font-bold" style={{ borderColor: C.ink, background: C.pink, color: C.white }}>
          겨울방학 특강 모집
        </p>
        <h1 className="mt-5 text-[44px] font-black leading-[1.12] tracking-[-0.035em] md:text-[64px]">
          4주 동안
          <br />
          <span className="relative inline-block">
            <span className="relative z-10">내 게임</span>
            <span aria-hidden className="absolute inset-x-[-4px] bottom-[6px] z-0 h-[18px] md:h-[24px]" style={{ background: C.yellow }} />
          </span>
          을
          <br />
          만들어요
        </h1>
        <p className="mt-5 max-w-[30em] text-[17px] leading-[1.7]" style={{ color: C.muted }}>
          초등 2학년부터 6학년까지. 한 반 8명이 블록을 맞춰 게임을 만들고, 마지막 날 가족 앞에서 직접 발표합니다.
        </p>

        <dl className="mt-7 grid max-w-[440px] grid-cols-2 overflow-hidden rounded-[10px] border-2" style={{ borderColor: C.ink, background: C.white }}>
          <div className="border-r-2 p-4" style={{ borderColor: C.ink }}>
            <dt className="text-[13px] font-bold" style={{ color: C.muted }}>모집 마감</dt>
            <dd className="mt-1 text-[20px] font-black">{fmtKo(deadline)}</dd>
          </div>
          <div className="p-4">
            <dt className="text-[13px] font-bold" style={{ color: C.muted }}>남은 자리</dt>
            <dd className="mt-1 text-[20px] font-black">
              <span style={{ color: C.pink }}>{totalLeft}자리</span>
              <span className="text-[14px] font-bold" style={{ color: C.muted }}> / {totalCap}자리</span>
            </dd>
          </div>
          <div className="col-span-2 border-t-2 px-4 py-3 text-[14px] font-semibold" style={{ borderColor: C.ink }}>
            개강 {fmtKo(start)}, 4주 8회, 노트북은 교실에서 빌려 드려요
          </div>
        </dl>

        <button
          type="button"
          onClick={onApply}
          className="mt-7 hidden h-14 items-center rounded-[10px] border-2 px-8 text-[18px] font-black shadow-[4px_4px_0_#16181d] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#16181d] md:inline-flex"
          style={{ borderColor: C.ink, background: C.yellow }}
        >
          특강 신청하기
        </button>
      </div>

      <div className="relative mx-auto w-full max-w-[460px]">
        <div className="relative aspect-[4/3] -rotate-2 overflow-hidden rounded-[14px] border-[3px] shadow-[8px_8px_0_#16181d]" style={{ borderColor: C.ink }}>
          <Image
            src={`${IMG}/hero.jpg`}
            alt="노트북 화면을 함께 보며 웃는 초등학생 두 명"
            fill
            priority
            sizes="(min-width: 768px) 460px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute -bottom-6 -left-3 w-[62%] rotate-[3deg] space-y-[3px] md:-left-10">
          <Block color={C.orange}>깃발을 눌렀을 때</Block>
          <Block color={C.blue} dark indent={1}>
            방향키로 움직이기
          </Block>
        </div>
      </div>
    </section>
  );
}

/* ---------- 2. 이런 아이에게 ---------- */

const FOR_WHO: { text: string; color: string; dark?: boolean }[] = [
  { text: "게임을 하는 것보다 만들어 보고 싶은 아이", color: C.yellow },
  { text: "레고 조립을 한참 붙잡고 있는 아이", color: C.pink, dark: true },
  { text: "방학 동안 화면만 보는 시간이 걱정되는 집", color: C.green, dark: true },
  { text: "학교 소프트웨어 수업 전에 미리 해 보고 싶은 아이", color: C.blue, dark: true },
];

function ForWho() {
  return (
    <section className="mx-auto max-w-[1080px] px-5 py-14 md:px-8">
      <SectionTitle no="01">이런 아이에게 맞아요</SectionTitle>
      <div className="mt-8 max-w-[560px] space-y-[3px]">
        {FOR_WHO.map((f, i) => (
          <Block key={f.text} color={f.color} dark={f.dark} indent={i % 2}>
            {f.text}
          </Block>
        ))}
      </div>
    </section>
  );
}

/* ---------- 3. 4주 커리큘럼 ---------- */

const WEEKS: { title: string; goal: string; blocks: { t: string; c: string; dark?: boolean; i?: number }[] }[] = [
  {
    title: "움직이기",
    goal: "캐릭터를 방향키로 움직이고 벽에 닿으면 튕기게 합니다.",
    blocks: [
      { t: "깃발을 눌렀을 때", c: C.orange },
      { t: "오른쪽 키를 누르면 10만큼 움직이기", c: C.blue, dark: true, i: 1 },
      { t: "벽에 닿으면 튕기기", c: C.blue, dark: true, i: 1 },
    ],
  },
  {
    title: "조건 걸기",
    goal: "장애물에 닿으면 처음 자리로 돌아가게 만듭니다.",
    blocks: [
      { t: "계속 반복하기", c: C.yellow },
      { t: "만약 장애물에 닿았다면", c: C.yellow, i: 1 },
      { t: "처음 자리로 가기", c: C.blue, dark: true, i: 2 },
      { t: "아니면 앞으로 달리기", c: C.blue, dark: true, i: 2 },
    ],
  },
  {
    title: "점수와 판",
    goal: "별을 모으면 점수가 오르고 10점이면 다음 판으로 넘어갑니다.",
    blocks: [
      { t: "별에 닿았을 때", c: C.orange },
      { t: "점수를 1만큼 바꾸기", c: C.pink, dark: true, i: 1 },
      { t: "만약 점수가 10이라면", c: C.yellow, i: 1 },
      { t: "다음 판 배경으로 바꾸기", c: C.green, dark: true, i: 2 },
    ],
  },
  {
    title: "발표회",
    goal: "시작 화면을 붙여 게임을 완성하고 가족 앞에서 직접 소개합니다.",
    blocks: [
      { t: "시작 버튼을 눌렀을 때", c: C.orange },
      { t: "게임 이름 말하기", c: C.green, dark: true, i: 1 },
      { t: "친구와 바꿔서 해 보기", c: C.pink, dark: true, i: 1 },
    ],
  },
];

function Curriculum() {
  const [week, setWeek] = useState(0);
  const reduce = useReducedMotionSafe();
  const w = WEEKS[week];
  return (
    <section id="curriculum" className="border-y-2 py-14" style={{ borderColor: C.ink, background: C.ink, color: C.white }}>
      <div className="mx-auto max-w-[1080px] px-5 md:px-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-[6px] border-2 px-2 text-[15px] font-black" style={{ borderColor: C.white }}>
            02
          </span>
          <h2 className="text-[28px] font-black leading-tight tracking-[-0.02em] md:text-[36px]">4주 동안 배우는 것</h2>
        </div>

        <div className="mt-8 grid grid-cols-4 gap-2" role="tablist" aria-label="주차">
          {WEEKS.map((x, i) => (
            <button
              key={x.title}
              type="button"
              role="tab"
              aria-selected={week === i}
              onClick={() => setWeek(i)}
              className="rounded-[8px] border-2 px-2 py-3 text-left transition-colors"
              style={{ borderColor: C.white, background: week === i ? C.yellow : "transparent", color: week === i ? C.ink : C.white }}
            >
              <span className="block text-[13px] font-bold opacity-80">{i + 1}주</span>
              <span className="block text-[15px] font-black md:text-[17px]">{x.title}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
          <p className="text-[18px] leading-[1.7]">{w.goal}</p>
          <div className="rounded-[12px] border-2 p-5" style={{ ...GRID_BG, borderColor: C.white, color: C.ink }} aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={week} className="space-y-[3px]">
                {w.blocks.map((b, i) => (
                  <motion.div
                    key={b.t}
                    initial={reduce ? false : { opacity: 0, y: -14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.22, delay: reduce ? 0 : i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Block color={b.c} dark={b.dark} indent={b.i ?? 0}>
                      {b.t}
                    </Block>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 4. 결과물 예시 ---------- */

function MazeArt() {
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
      <rect width="160" height="110" fill="#fff7dc" />
      {[
        "M10 10H150V100H10Z",
        "M10 40H60M90 40H150M40 70H120M40 70V100M120 10V40",
      ].map((d) => (
        <path key={d} d={d} fill="none" stroke={C.ink} strokeWidth="4" />
      ))}
      <circle cx="25" cy="25" r="8" fill={C.orange} stroke={C.ink} strokeWidth="2" />
      <rect x="128" y="78" width="14" height="14" fill={C.green} stroke={C.ink} strokeWidth="2" />
    </svg>
  );
}
function RunnerArt() {
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
      <rect width="160" height="110" fill="#dfe8ff" />
      <rect y="86" width="160" height="24" fill={C.green} />
      <rect x="22" y="60" width="18" height="26" rx="4" fill={C.pink} stroke={C.ink} strokeWidth="2" />
      <rect x="92" y="70" width="14" height="16" fill={C.ink} />
      {[60, 118, 140].map((x, i) => (
        <path key={x} d={`M${x} ${30 + i * 8}l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z`} fill={C.yellow} stroke={C.ink} strokeWidth="1.5" />
      ))}
      <text x="150" y="18" textAnchor="end" fontSize="12" fontWeight="800" fill={C.ink}>
        점수 7
      </text>
    </svg>
  );
}
function RobotArt() {
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full" aria-hidden>
      <rect width="160" height="110" fill="#e6f5ec" />
      {Array.from({ length: 6 }).map((_, i) => (
        <path key={i} d={`M${10 + i * 28} 10V100`} stroke="#c3dccd" strokeWidth="1.5" />
      ))}
      <path d="M24 88H80V40H136" fill="none" stroke={C.blue} strokeWidth="4" strokeDasharray="6 5" />
      <circle cx="24" cy="88" r="12" fill={C.white} stroke={C.ink} strokeWidth="2.5" />
      <circle cx="24" cy="84" r="3" fill={C.ink} />
      <rect x="128" y="30" width="18" height="18" fill={C.orange} stroke={C.ink} strokeWidth="2" />
    </svg>
  );
}

const WORKS = [
  { title: "고양이 미로 탈출", who: "초3 이ㅅ아", note: "방향키 4개와 벽 판정만으로 만든 첫 게임", art: <MazeArt /> },
  { title: "별 모으기 달리기", who: "초5 박ㄷ현", note: "장애물을 넘으며 별을 모아 10점이면 다음 판", art: <RunnerArt /> },
  { title: "로봇 청소기 길 찾기", who: "초6 최ㅇ준", note: "바닥 그림을 따라가다 상자를 만나면 멈추는 로봇", art: <RobotArt /> },
];

function Showcase() {
  return (
    <section className="mx-auto max-w-[1080px] px-5 py-14 md:px-8">
      <SectionTitle no="03">지난 방학에 만든 게임</SectionTitle>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {WORKS.map((w, i) => (
          <article
            key={w.title}
            className="overflow-hidden rounded-[12px] border-2"
            style={{ borderColor: C.ink, background: C.white, transform: `rotate(${[-1, 0.6, -0.4][i]}deg)` }}
          >
            <div className="aspect-[16/11] border-b-2" style={{ borderColor: C.ink }}>
              {w.art}
            </div>
            <div className="p-4">
              <h3 className="text-[19px] font-black">{w.title}</h3>
              <p className="mt-1 text-[14px] font-bold" style={{ color: C.blue }}>
                {w.who}
              </p>
              <p className="mt-2 text-[15px] leading-[1.6]" style={{ color: C.muted }}>
                {w.note}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- 5. 강사 ---------- */

function Teacher() {
  return (
    <section className="mx-auto max-w-[1080px] px-5 py-14 md:px-8">
      <SectionTitle no="04">가르치는 사람</SectionTitle>
      <div className="mt-8 grid gap-6 overflow-hidden rounded-[14px] border-2 md:grid-cols-[300px_1fr]" style={{ borderColor: C.ink, background: C.white }}>
        <div className="relative aspect-[4/3] border-b-2 md:aspect-auto md:border-b-0 md:border-r-2" style={{ borderColor: C.ink }}>
          <Image src={`${IMG}/teacher.jpg`} alt="남색 스웨터를 입은 김ㅈ우 선생님" fill sizes="(min-width: 768px) 300px, 100vw" className="object-cover object-[50%_25%]" />
        </div>
        <div className="p-6 pt-0 md:pt-6">
          <p className="text-[15px] font-bold" style={{ color: C.muted }}>
            담당 강사
          </p>
          <p className="mt-1 text-[26px] font-black">김ㅈ우 선생님</p>
          <ul className="mt-4 space-y-2 text-[16px] leading-[1.6]">
            {["초등 방과후 코딩 수업 6년", "소프트웨어 교육 지도사 자격", "한 반을 개강부터 발표회까지 혼자 맡습니다", "수업이 끝나면 그날 만든 화면을 보호자 문자로 보내 드립니다"].map((t) => (
              <li key={t} className="flex gap-2.5">
                <Check className="mt-1 h-5 w-5 shrink-0" style={{ color: C.green }} strokeWidth={3} aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 6. 일정·수업료 ---------- */

function Schedule({ seats, start }: { seats: Record<ClassId, number>; start: Date }) {
  return (
    <section className="mx-auto max-w-[1080px] px-5 py-14 md:px-8">
      <SectionTitle no="05">반과 수업료</SectionTitle>
      <p className="mt-4 text-[16px]" style={{ color: C.muted }}>
        {fmtKo(start)} 개강, 4주 동안 8회. 형제가 함께 들으면 둘째 수업료를 10% 빼 드립니다.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {CLASSES.map((c) => {
          const left = seats[c.id];
          return (
            <div key={c.id} className="rounded-[12px] border-2" style={{ borderColor: C.ink, background: C.white }}>
              <div className="rounded-t-[10px] border-b-2 px-5 py-3" style={{ background: c.color, borderColor: C.ink, color: c.id === "block" ? C.ink : C.white }}>
                <p className="text-[13px] font-bold opacity-90">{c.grades[0]}~{c.grades[c.grades.length - 1]}</p>
                <p className="text-[21px] font-black">{c.name}</p>
              </div>
              <dl className="space-y-2 px-5 py-4 text-[15px]">
                <div className="flex justify-between gap-3">
                  <dt style={{ color: C.muted }}>시간</dt>
                  <dd className="font-bold">{c.when}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt style={{ color: C.muted }}>수업료</dt>
                  <dd className="font-bold">{won(c.fee)}</dd>
                </div>
                {c.kit ? (
                  <div className="flex justify-between gap-3">
                    <dt style={{ color: C.muted }}>로봇 키트</dt>
                    <dd className="font-bold">{won(c.kit)} (가져가요)</dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <dt style={{ color: C.muted }}>남은 자리</dt>
                  <dd className="flex items-center gap-1" aria-label={`${c.capacity}자리 중 ${left}자리 남음`}>
                    {Array.from({ length: c.capacity }).map((_, i) => (
                      <span key={i} className="h-3 w-3 rounded-[3px] border-2" style={{ borderColor: C.ink, background: i < c.capacity - left ? C.ink : "transparent" }} />
                    ))}
                    <span className="ml-1.5 font-black" style={{ color: left <= 1 ? C.pink : C.ink }}>
                      {left === 0 ? "마감" : `${left}자리`}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- 7. 자주 묻는 질문 ---------- */

const FAQ = [
  { q: "코딩을 처음 해 보는데 따라갈 수 있나요?", a: "1주차 첫 시간은 마우스로 블록을 끌어 붙이는 것부터 합니다. 글자를 쳐야 하는 수업은 없습니다." },
  { q: "노트북을 가져가야 하나요?", a: "교실 노트북을 한 사람에 한 대씩 씁니다. 집에서 이어서 하고 싶으면 무료 프로그램 설치 방법을 문자로 보내 드립니다." },
  { q: "결석하면 어떻게 하나요?", a: "4주 동안 한 번 보강을 잡아 드립니다. 토요일 오전에 빈자리가 있는 반으로 들어갑니다." },
  { q: "환불은 어떻게 되나요?", a: "개강 전에는 전액 돌려 드립니다. 개강 뒤에는 학원법에 정한 교습비 반환 기준을 따릅니다." },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="mx-auto max-w-[1080px] px-5 py-14 md:px-8">
      <SectionTitle no="06">자주 묻는 질문</SectionTitle>
      <div className="mt-8 divide-y-2 overflow-hidden rounded-[12px] border-2" style={{ borderColor: C.ink, background: C.white }}>
        {FAQ.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} style={{ borderColor: C.ink }}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[17px] font-bold"
              >
                {f.q}
                <ChevronDown className="h-5 w-5 shrink-0 transition-transform" style={{ transform: isOpen ? "rotate(180deg)" : undefined }} aria-hidden />
              </button>
              {isOpen ? (
                <p className="px-5 pb-5 text-[16px] leading-[1.7]" style={{ color: C.muted }}>
                  {f.a}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- 8. 신청 폼 ---------- */

interface Applied {
  no: string;
  parent: string;
  phone: string;
  grade: Grade;
  cls: CampClass;
  reply: Date;
}

const mask = maskName;

/* 신청 완료 뒤 사장님 시트에 미리 쌓여 있는 가상 접수. */
const PAST_LEADS: LeadRow[] = [
  { at: "오늘 11:42", name: "박ㅅ연", digits: "01077315820", summary: "초4, 게임 만들기반", source: "메타 광고", status: "통화함" },
  { at: "오늘 09:16", name: "이ㅈ민", digits: "01022904417", summary: "초3, 블록 코딩반", source: "네이버 검색광고", status: "통화 전" },
  { at: "어제 21:08", name: "이ㅈ민", digits: "01022904417", summary: "초3, 블록 코딩반", source: "네이버 검색광고", status: "계약" },
  { at: "어제 15:31", name: "최ㅇ준", digits: "01050163302", summary: "초5, 로봇 코딩반", source: "블로그", status: "보류" },
];

/* 접수 다음 날이 회신일. 토·일이면 월요일로 넘긴다. */
const replyDay = (today: Date) => {
  const d = daysAgo(today, -1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d;
};

function ApplyForm({
  ref,
  seats,
  today,
  deadline,
  onApplied,
}: {
  ref: React.Ref<HTMLElement>;
  seats: Record<ClassId, number>;
  today: Date;
  deadline: Date;
  onApplied: (id: ClassId) => void;
}) {
  const [parent, setParent] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState<Grade | "">("");
  const [cls, setCls] = useState<ClassId | "">("");
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<Applied | null>(null);
  const reduce = useReducedMotionSafe();

  const options = useMemo(() => (grade ? CLASSES.filter((c) => c.grades.includes(grade)) : []), [grade]);
  const phoneOk = /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.trim());
  const errors = {
    parent: parent.trim().length < 2 ? "보호자 이름을 적어 주세요." : "",
    phone: phoneOk ? "" : "010-0000-0000 모양으로 적어 주세요.",
    grade: grade ? "" : "학년을 골라 주세요.",
    cls: cls ? "" : "반을 골라 주세요.",
    agree: agree ? "" : "개인정보 수집에 동의해야 신청할 수 있어요.",
  };
  const ok = Object.values(errors).every((e) => !e);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!ok || !grade || !cls) return;
    const c = CLASSES.find((x) => x.id === cls)!;
    const no = `CC${fmtDot(today).replace(/\./g, "").slice(2)}-${String(Math.floor(Math.random() * 900) + 100)}`;
    setDone({ no, parent, phone, grade, cls: c, reply: replyDay(today) });
    onApplied(c.id);
  };

  const reset = () => {
    setParent("");
    setPhone("");
    setGrade("");
    setCls("");
    setAgree(false);
    setTried(false);
    setDone(null);
  };

  const field = "mt-2 h-12 w-full rounded-[8px] border-2 bg-white px-3.5 text-[17px] outline-none focus-visible:ring-4 focus-visible:ring-[#2f62ff]/30";
  const err = (m: string) => (tried && m ? <p className="mt-1.5 text-[14px] font-bold" style={{ color: "#c8174f" }}>{m}</p> : null);

  return (
    <section ref={ref} id="apply" className="mx-auto max-w-[1080px] scroll-mt-6 px-5 py-14 md:px-8">
      <SectionTitle no="07">특강 신청</SectionTitle>
      <p className="mt-4 text-[16px]" style={{ color: C.muted }}>
        {fmtKo(deadline)}까지 받습니다. 신청하시면 다음 날 문자로 반 배정과 수업료 안내를 보내 드립니다.
      </p>

      <div className="mt-8 rounded-[14px] border-2 p-5 shadow-[8px_8px_0_#16181d] md:p-8" style={{ borderColor: C.ink, background: C.white }}>
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div key="done" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0 }} aria-live="polite">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2" style={{ borderColor: C.ink, background: C.green }}>
                  <Check className="h-6 w-6 text-white" strokeWidth={3} aria-hidden />
                </span>
                <p className="text-[24px] font-black">신청을 받았습니다</p>
              </div>
              <dl className="mt-6 grid gap-3 text-[16px] sm:grid-cols-2">
                {[
                  ["접수 번호", done.no],
                  ["보호자", `${mask(done.parent)} 님`],
                  ["신청한 반", `${done.grade}, ${done.cls.name} (${done.cls.when})`],
                  ["회신 예정", `${fmtKo(done.reply)} 오후 6시까지 문자`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-[8px] border-2 px-4 py-3" style={{ borderColor: C.ink }}>
                    <dt className="text-[13px] font-bold" style={{ color: C.muted }}>{k}</dt>
                    <dd className="mt-0.5 font-black">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-[15px] leading-[1.7]" style={{ color: C.muted }}>
                연락이 없으면 교실로 전화 주세요. 02-000-0000, 평일 오후 1시부터 8시까지 받습니다.
              </p>
              <button type="button" onClick={reset} className="mt-5 inline-flex items-center gap-2 text-[15px] font-bold underline underline-offset-4">
                <RotateCcw className="h-4 w-4" aria-hidden />
                다른 아이도 신청하기
              </button>
              <LeadReceivedPanel
                business="곰파트너"
                name={done.parent}
                phone={done.phone}
                summary={`${done.grade}, ${done.cls.name}`}
                lines={[
                  ["학년", done.grade],
                  ["반", `${done.cls.name} (${done.cls.when})`],
                ]}
                pastRows={PAST_LEADS}
                theme={{ accent: C.blue, accentSoft: "#fff4d1", ink: C.ink, muted: C.muted, line: C.grid, paper: C.paper }}
              />
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} noValidate initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? undefined : { opacity: 0 }} className="grid gap-5 md:grid-cols-2">
              <label className="block text-[15px] font-bold">
                보호자 이름
                <input value={parent} onChange={(e) => setParent(e.target.value)} autoComplete="name" className={field} style={{ borderColor: C.ink }} />
                {err(errors.parent)}
              </label>
              <label className="block text-[15px] font-bold">
                연락처
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" className={field} style={{ borderColor: C.ink }} />
                {err(errors.phone)}
              </label>

              <fieldset className="md:col-span-2">
                <legend className="text-[15px] font-bold">학년</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      aria-pressed={grade === g}
                      onClick={() => {
                        setGrade(g);
                        if (cls && !CLASSES.find((c) => c.id === cls)?.grades.includes(g)) setCls("");
                      }}
                      className="h-11 min-w-16 rounded-[8px] border-2 px-4 text-[16px] font-bold"
                      style={{ borderColor: C.ink, background: grade === g ? C.ink : C.white, color: grade === g ? C.white : C.ink }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {err(errors.grade)}
              </fieldset>

              <fieldset className="md:col-span-2">
                <legend className="text-[15px] font-bold">반</legend>
                {grade ? (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {options.map((c) => {
                      const left = seats[c.id];
                      const full = left === 0;
                      const on = cls === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={full}
                          aria-pressed={on}
                          onClick={() => setCls(c.id)}
                          className="flex items-center justify-between gap-3 rounded-[8px] border-2 px-4 py-3 text-left disabled:opacity-40"
                          style={{ borderColor: C.ink, background: on ? c.color : C.white, color: on && c.id !== "block" ? C.white : C.ink }}
                        >
                          <span>
                            <span className="block text-[17px] font-black">{c.name}</span>
                            <span className="block text-[14px] font-semibold opacity-80">{c.when}</span>
                          </span>
                          <span className="shrink-0 text-[15px] font-black">{full ? "마감" : `${left}자리 남음`}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-2 rounded-[8px] border-2 border-dashed px-4 py-3 text-[15px]" style={{ borderColor: C.grid, color: C.muted }}>
                    학년을 고르면 들을 수 있는 반이 나옵니다.
                  </p>
                )}
                {err(errors.cls)}
              </fieldset>

              <div className="md:col-span-2">
                <div className="rounded-[8px] px-4 py-3 text-[14px] leading-[1.7]" style={{ background: C.paper, color: C.muted }}>
                  수집 항목: 보호자 이름, 연락처, 학년, 목적: 특강 반 배정과 안내 문자, 보관: 특강 종료 후 3개월
                </div>
                <label className="mt-3 flex items-center gap-2.5 text-[16px] font-bold">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="h-5 w-5 accent-[#16181d]" />
                  개인정보 수집과 이용에 동의합니다
                </label>
                {err(errors.agree)}
              </div>

              <button
                type="submit"
                className="h-14 rounded-[10px] border-2 text-[18px] font-black shadow-[4px_4px_0_#16181d] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#16181d] md:col-span-2"
                style={{ borderColor: C.ink, background: C.yellow }}
              >
                신청하기
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------- 아래 고정 신청 버튼 ---------- */

/* 공용 데모 도크(아래쪽 40px)와 겹치지 않게 BakeryCafeDemo 장바구니 바처럼 76px 위에 띄운다. */
function StickyApply({ hidden, left, onApply }: { hidden: boolean; left: number; onApply: () => void }) {
  const reduce = useReducedMotionSafe();
  return (
    <AnimatePresence>
      {!hidden ? (
        <motion.div
          initial={reduce ? false : { y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-0 z-40 px-4 print:hidden"
          style={{ bottom: "calc(76px + env(safe-area-inset-bottom, 0px))" }}
        >
          <button
            type="button"
            onClick={onApply}
            className="mx-auto flex h-14 w-full max-w-[520px] items-center justify-between rounded-[12px] border-2 px-5 text-[17px] font-black shadow-[4px_4px_0_#16181d]"
            style={{ borderColor: C.ink, background: C.yellow, color: C.ink }}
          >
            <span>겨울방학 특강 신청하기</span>
            <span className="rounded-[6px] px-2 py-0.5 text-[14px]" style={{ background: C.ink, color: C.white }}>
              {left}자리 남음
            </span>
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
