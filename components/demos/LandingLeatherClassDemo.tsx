"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CalendarDays, Check, Clock, CreditCard, Landmark, MapPin, Phone, Star, Users } from "lucide-react";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";
import { daysAgo, useDemoToday } from "@/hooks/useDemoToday";
import { maskName } from "@/components/demos/LeadReceivedPanel";
import { DemoMakerInfo } from "@/components/demos/DemoMakerInfo";

/* 가죽 공방 원데이 클래스 신청 랜딩 샘플. 공방이 실제로 운영하는 수업 신청 페이지처럼 만든다.
   공방, 강사, 신청자, 계좌, 주소는 모두 가상이다. 머리글은 곰파트너와 "카탈로그"만 적는다.
   네이버폼, 통장, 카톡으로 받던 이야기는 샘플 표지(data/scenes/part3.ts)가 맡는다. 이 화면에는 웹툰 컷을 넣지 않는다.
   사진 출처(Pexels License): 5963170(손으로 가죽을 꿰매는 사진, hero), 5963183(work-tan), 4452399(work-set), 6127090(work-orange)

   국내 가죽 공방 클래스 페이지 구성: 클래스 소개, 수업 순서, 완성작, 후기, 일정과 예약(회차별 정원), 환불 규정,
   자주 묻는 질문, 오시는 길. 관용 문구는 원데이 클래스, 재료 포함, 각인 서비스, 정원 마감, 대기 신청.

   디자인: 첫 화면은 가죽을 꿰매는 손 사진 한 장. 바탕은 흰색과 옅은 회색을 번갈아 쓰고, 강조색은 차분한 가죽 갈색 하나.
   글꼴은 Pretendard 한 벌.

   핵심 모션: 들어오면 사진이 1.6초 동안 천천히 다가오고(1.06배에서 1배), 문장과 버튼은 0.3초 늦게 아래에서 올라온다
   (CSS keyframes, JS 없이도 보인다). 스크롤하면 사진만 조금 느리게 움직인다. 줄이기 설정이면 모두 멈춘다.

   상호작용(모두 브라우저 안에서만 돈다)
   1. 회차 신청: 남은 자리가 줄고, 0이 되면 그 회차는 마감되고 대기 신청으로 바뀐다.
   2. 신청서: 이름, 휴대폰, 인원, 가죽 색, 각인 이니셜.
   3. 결제: 같은 흐름 안에서 카드 또는 계좌이체. 실제 결제는 일어나지 않는다(카드 번호를 받지 않는다).
   4. 신청 완료 안내: 예약 번호와 회차, 계좌이체면 입금 계좌. */

const IMG = "/images/demo-landing-leather-class";
const EASE = [0.22, 1, 0.36, 1] as const;
const PHOTO_IN = 1.6; // 초. 사진이 다가오는 시간

const PRICE = 45_000;
const CAP = 8;
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const DOW = ["일", "월", "화", "수", "목", "금", "토"];
const md = (d: Date) => `${d.getMonth() + 1}.${d.getDate()}(${DOW[d.getDay()]})`;

const C = {
  bg: "#ffffff",
  soft: "#f7f7f5",
  ink: "#111111",
  body: "#4b4b4b",
  muted: "#767676",
  line: "#e5e5e5",
  accent: "#7a4a2e",
  accentSoft: "#f3ede7",
  error: "#9b2c2c",
};

const focusRing = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#256ef4]";
const btnMain = `inline-flex items-center justify-center gap-2 rounded-[6px] font-semibold text-white transition-[background-color,filter] duration-150 hover:brightness-110 disabled:opacity-40 motion-reduce:transition-none ${focusRing}`;
const btnLine = `inline-flex items-center justify-center gap-2 rounded-[6px] border bg-white font-semibold transition-colors hover:bg-[#f7f7f5] disabled:opacity-40 ${focusRing}`;
const field = `h-12 w-full min-w-0 rounded-[6px] border bg-white px-3 text-[16px] font-normal outline-none transition-colors focus:border-[#7a4a2e] ${focusRing}`;
const labelCls = "grid min-w-0 gap-1.5 text-[14px] font-semibold";
const panel = "relative min-w-0 rounded-[8px] border bg-white p-5 sm:p-7";

type Pay = "card" | "bank";
type Status = "결제 완료" | "입금 대기" | "대기";

interface Session {
  id: string;
  date: Date;
  time: string;
}

interface Booking {
  no: string;
  session: string;
  qty: number;
  status: Status;
}

/** 오늘 이틀 뒤부터 2주 안의 수요일, 금요일 저녁, 토요일 오전, 오후, 일요일 오후 중 앞 8개 */
function makeSessions(today: Date): Session[] {
  const out: Session[] = [];
  for (let i = 2; i < 20 && out.length < 8; i++) {
    const d = daysAgo(today, -i);
    const times = d.getDay() === 3 || d.getDay() === 5 ? ["19:30"] : d.getDay() === 6 ? ["11:00", "14:30"] : d.getDay() === 0 ? ["14:30"] : [];
    for (const t of times) if (out.length < 8) out.push({ id: `s${out.length}`, date: d, time: t });
  }
  return out;
}

// 회차별로 이미 찬 자리. 0번과 2번 회차는 꽉 찼다.
const TAKEN = [8, 6, 8, 3, 5, 2, 7, 1];

const REFUND_RULE = [
  ["수업 5일 전까지", "전액 환불"],
  ["수업 2~4일 전", "50% 환불"],
  ["수업 전날, 당일", "환불 없음(가죽을 미리 재단해 둡니다)"],
];

const LEATHERS = [
  { id: "tan", name: "탄", color: "#b9773f" },
  { id: "brown", name: "브라운", color: "#6f3c1e" },
  { id: "olive", name: "올리브", color: "#5d6034" },
  { id: "burgundy", name: "버건디", color: "#6b2430" },
] as const;

const STEPS = [
  ["10분", "가죽 고르기", "탄, 브라운, 올리브, 버건디 중에 골라요. 베지터블 가죽이라 쓸수록 색이 짙어져요."],
  ["30분", "재단과 구멍 내기", "본을 대고 자른 뒤 목타로 바느질 구멍을 내요."],
  ["60분", "새들 스티치", "바늘 두 개로 한 땀씩 꿰매요. 처음 하는 분도 따라와요."],
  ["20분", "마감과 각인", "옆면을 다듬고 이니셜 도장을 찍어요."],
] as const;

const WORKS = [
  { img: "work-tan", title: "탄 카드지갑", note: "가장 많이 고르는 색. 석 달쯤 쓰면 꿀색으로 짙어져요.", alt: "손에 든 탄 색 가죽 카드지갑" },
  { img: "work-set", title: "카드지갑과 동전지갑", note: "두 번째 수업에서 만드는 동전지갑까지 함께 놓았어요.", alt: "가죽 위에 놓인 카드지갑과 동전지갑 여러 개" },
  { img: "work-orange", title: "오렌지 카드지갑", note: "시즌 가죽으로 만든 작품. 시즌 색은 회차마다 달라요.", alt: "검은 천 위에 놓인 오렌지색 가죽 카드지갑" },
];

const REVIEWS = [
  { name: "안ㅈ희", when: "토요일 오전반", text: "바느질이 처음이었는데 옆에서 한 땀씩 봐 주셔서 끝까지 했어요. 이니셜이 들어가니 선물하기 좋았습니다." },
  { name: "박ㅅ연", when: "금요일 저녁반", text: "퇴근하고 두 시간 집중하니 머리가 맑아졌어요. 도구가 다 있어서 빈손으로 가면 됩니다." },
  { name: "이ㅈ민", when: "일요일 오후반, 2명", text: "친구랑 둘이 들었어요. 색을 다르게 골라서 서로 바꿔 쓰고 있어요. 공방이 조용하고 밝아요." },
];

const FAQ = [
  ["처음인데 괜찮을까요?", "수강생 대부분이 처음이에요. 한 땀씩 옆에서 봐 드려요."],
  ["준비물이 있나요?", "없어요. 앞치마와 도구는 공방에 있어요."],
  ["주차가 되나요?", "건물 뒤 공영주차장을 써 주세요. 공방 주차 자리는 없어요."],
  ["아이와 같이 들어도 되나요?", "초등학생부터 들을 수 있어요. 아이도 한 자리로 신청해 주세요."],
  ["날짜를 바꾸고 싶어요", "수업 2일 전까지 카카오톡 채널이나 전화로 알려 주세요. 한 번 바꿔 드려요."],
] as const;

/* ── 작은 조각 ─────────────────────────────── */

function SeatDots({ left }: { left: number }) {
  return (
    <span aria-hidden className="flex gap-[3px]">
      {Array.from({ length: CAP }, (_, i) => (
        <span key={i} className="h-[7px] w-[7px] rounded-full border" style={{ borderColor: C.accent, background: i < CAP - left ? C.accent : "transparent" }} />
      ))}
    </span>
  );
}

function SectionHead({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="text-[28px] font-bold leading-[1.25] tracking-[-0.02em] md:text-[34px]" style={{ color: C.ink }}>
      {title}
    </h2>
  );
}

/* ── 페이지 ─────────────────────────────── */

export function LandingLeatherClassDemo() {
  const today = useDemoToday();
  const reduce = useReducedMotionSafe();
  const sessions = useMemo(() => makeSessions(today), [today]);
  const byId = useMemo(() => Object.fromEntries(sessions.map((s, i) => [s.id, { ...s, idx: i }])), [sessions]);
  const label = (id: string) => (byId[id] ? `${md(byId[id].date)} ${byId[id].time}` : "");

  const posterRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: posterRef, offset: ["start start", "end start"] });
  // 스크롤하면 사진만 조금 느리게 내려간다
  const photoY = useTransform(scrollYProgress, (v) => (reduce ? "0%" : `${v * 8}%`));

  const [bookings, setBookings] = useState<Booking[]>([]);
  const left = (sid: string) => CAP - (TAKEN[byId[sid]?.idx ?? 0] ?? 0) - bookings.filter((b) => b.session === sid && b.status !== "대기").reduce((s, b) => s + b.qty, 0);

  useEffect(() => {
    const f = () => window.scrollTo({ top: 0 });
    window.addEventListener("demo:go-home", f);
    return () => window.removeEventListener("demo:go-home", f);
  }, []);

  const [leatherId, setLeatherId] = useState<(typeof LEATHERS)[number]["id"]>("tan");

  /* 신청 흐름 */
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sid, setSid] = useState("s1");
  const [name, setName] = useState("안재희");
  const [phone, setPhone] = useState("010-1234-5678");
  const [qty, setQty] = useState(1);
  const [initials, setInitials] = useState("HN");
  const [pay, setPay] = useState<Pay>("card");
  const [agree, setAgree] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);
  const [err, setErr] = useState("");

  const full = left(sid) <= 0;
  const qtyOk = full || qty <= left(sid);
  const soonest = sessions.find((s) => left(s.id) > 0);

  const toStep2 = () => {
    setErr("");
    setStep(2);
  };
  const toStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, "").length < 10) return setErr("이름과 휴대폰 번호를 확인해 주세요.");
    if (!qtyOk) return setErr(`이 회차는 ${left(sid)}자리 남았어요.`);
    if (!agree) return setErr("환불 규정에 동의해 주세요.");
    setErr("");
    if (full) return finish(null);
    setStep(3);
  };
  const finish = (method: Pay | null) => {
    if (!full && qty > left(sid)) return setErr("그사이 자리가 찼어요. 다른 회차를 골라 주세요.");
    const b: Booking = {
      no: `LC-${451 + bookings.length}`,
      session: sid,
      qty: full ? 1 : qty,
      status: method === null ? "대기" : method === "card" ? "결제 완료" : "입금 대기",
    };
    setBookings((v) => [...v, b]);
    setDone(b);
    setErr("");
  };

  const wrap = "mx-auto w-full max-w-[1120px] px-4 md:px-8";

  return (
    <div className="min-h-screen overflow-x-clip pb-24 text-[16px] leading-[1.6]" style={{ background: C.bg, color: C.ink }}>
      <main id="top">
        {/* 첫 화면 */}
        <section id="lc-poster" ref={posterRef} aria-labelledby="lc-title" className="relative flex min-h-[100svh] flex-col overflow-hidden" style={{ background: "#141414", color: "#ffffff" }}>
          <style>{`@keyframes lc-rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.lc-rise{animation:lc-rise 0.7s cubic-bezier(0.22,1,0.36,1) 0.3s both}@media (prefers-reduced-motion: reduce){.lc-rise{animation:none}}`}</style>
          <motion.div className="absolute inset-x-0 top-[-10%] h-[110%]" style={{ y: photoY }}>
            <motion.div className="h-full w-full" initial={reduce ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: reduce ? 0 : PHOTO_IN, ease: EASE }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
              <img
                src={`${IMG}/hero.jpg`}
                srcSet={`${IMG}/hero-sm.jpg 960w, ${IMG}/hero.jpg 1920w`}
                sizes="100vw"
                alt="나무 집게에 가죽을 물리고 바늘 두 개로 손바느질하는 손"
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "44% 45%" }}
              />
            </motion.div>
          </motion.div>
          {/* 글자 대비를 위한 막. 아래쪽과 PC 왼쪽을 더 어둡게 */}
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.3) 55%, rgba(0,0,0,0.4))" }} />
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.5), rgba(0,0,0,0) 60%)" }} />

          <div className="relative z-[1] flex items-center justify-between gap-3 px-4 pt-4 md:px-12 md:pt-7">
            <a href="#top" className={`inline-flex min-w-0 items-center gap-2 rounded-[4px] ${focusRing}`}>
              <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-[19px] font-bold tracking-[-0.02em]">가죽 공방</span>
              </span>
            </a>
            <nav aria-label="이 페이지 차례" className="hidden items-center gap-6 text-[15px] font-semibold lg:flex">
              {[
                ["수업 소개", "lc-about"],
                ["완성작", "lc-works"],
                ["일정/신청", "lc-apply"],
              ].map(([t, id]) => (
                <a key={id} href={`#${id}`} className={`rounded-[4px] underline-offset-[6px] hover:underline ${focusRing}`}>
                  {t}
                </a>
              ))}
            </nav>
            <a href="#lc-apply" data-gtm-cta="landing-leather-class_poster_cta" className={`${btnMain} min-h-11 shrink-0 px-4 text-[15px]`} style={{ background: C.accent }}>
              신청하기
            </a>
          </div>

          <div className={`relative z-[1] mt-auto px-4 pb-12 md:px-12 md:pb-16 ${reduce ? "" : "lc-rise"}`}>
            <h1 id="lc-title" className="max-w-[12em] text-[38px] font-bold md:text-[clamp(40px,5vw,72px)]" style={{ letterSpacing: "-0.03em", lineHeight: 1.2, wordBreak: "keep-all" }}>
              카드지갑 만들기
            </h1>
            <p className="mt-4 max-w-[30em] text-[16px] leading-[1.7] md:mt-5 md:text-[18px]" style={{ color: "rgba(255,255,255,0.88)", wordBreak: "keep-all" }}>
              가죽을 자르고 손바느질로 꿰매요. 두 시간 뒤에는 이니셜을 새긴 카드지갑을 들고 가요.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#lc-apply" className={`${btnMain} min-h-12 px-6 text-[16px]`} style={{ background: C.accent }}>
                <CalendarDays size={18} aria-hidden /> 날짜 고르기
              </a>
              <a href="#lc-works" className={`inline-flex min-h-12 items-center justify-center rounded-[6px] border px-5 text-[16px] font-semibold transition-colors hover:bg-white/10 ${focusRing}`} style={{ borderColor: "rgba(255,255,255,0.7)", color: "#ffffff" }}>
                완성작 보기
              </a>
            </div>
          </div>
        </section>

        {/* 첫 화면 바로 아래 수업 정보 */}
        <section aria-label="수업 정보" className="border-b" style={{ borderColor: C.line }}>
          <div className={`${wrap} flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between md:py-7`}>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[15px] sm:grid-cols-4 md:gap-x-10">
              {(
                [
                  [CreditCard, "수강료", `${won(PRICE)}, 재료 포함`],
                  [Clock, "시간", "2시간"],
                  [Users, "정원", `회차당 ${CAP}명`],
                  [MapPin, "장소", "서울 ㅇㅇ구, 2층"],
                ] as const
              ).map(([I, k, v]) => (
                <div key={k} className="flex min-w-0 items-start gap-2">
                  <I size={17} aria-hidden className="mt-1 shrink-0" style={{ color: C.accent }} />
                  <div className="min-w-0">
                    <dt className="text-[13px]" style={{ color: C.muted }}>
                      {k}
                    </dt>
                    <dd className="font-semibold tabular-nums">{v}</dd>
                  </div>
                </div>
              ))}
            </dl>
            {soonest && (
              <p className="text-[15px] font-semibold tabular-nums" style={{ color: C.accent }}>
                가장 빠른 수업 {label(soonest.id)}, {left(soonest.id)}자리 남았어요
              </p>
            )}
          </div>
        </section>

        {/* 수업 소개 */}
        <section id="lc-about" aria-labelledby="lc-about-title" className="scroll-mt-4 py-14 md:py-20" style={{ background: C.soft }}>
          <div className={wrap}>
            <SectionHead id="lc-about-title" title="두 시간 동안 하는 일" />
            <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(([t, h, b]) => (
                <li key={h} className="min-w-0 rounded-[8px] border bg-white p-5" style={{ borderColor: C.line }}>
                  <p className="text-[15px] font-semibold tabular-nums" style={{ color: C.accent }}>
                    {t}
                  </p>
                  <h3 className="mt-1.5 text-[19px] font-bold">{h}</h3>
                  <p className="mt-1.5 text-[15px] leading-[1.65]" style={{ color: C.body }}>
                    {b}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 완성작 */}
        <section id="lc-works" aria-labelledby="lc-works-title" className="scroll-mt-4 py-14 md:py-20">
          <div className={wrap}>
            <SectionHead id="lc-works-title" title="수강생 완성작" />
            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {WORKS.map((w) => (
                <li key={w.img} className="min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element -- 정적 export 라 next/image 최적화를 쓰지 않는다 */}
                  <img src={`${IMG}/${w.img}.jpg`} alt={w.alt} loading="lazy" className="aspect-[4/5] w-full rounded-[8px] object-cover" style={{ background: C.soft }} />
                  <h3 className="mt-3 text-[18px] font-bold">{w.title}</h3>
                  <p className="mt-1 text-[15px] leading-[1.65]" style={{ color: C.body }}>
                    {w.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 후기 */}
        <section aria-labelledby="lc-review-title" className="py-14 md:py-20" style={{ background: C.soft }}>
          <div className={wrap}>
            <SectionHead id="lc-review-title" title="수강 후기" />
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {REVIEWS.map((r) => (
                <li key={r.name} className="min-w-0 rounded-[8px] border bg-white p-5" style={{ borderColor: C.line }}>
                  <p className="flex gap-0.5" style={{ color: C.accent }} aria-label="별점 5점">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={16} fill="currentColor" strokeWidth={0} aria-hidden />
                    ))}
                  </p>
                  <p className="mt-3 text-[15px] leading-[1.7]" style={{ color: C.body }}>
                    {r.text}
                  </p>
                  <p className="mt-3 text-[14px] font-semibold">
                    {r.name} 님, {r.when}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 수업 신청 */}
        <section id="lc-apply" aria-labelledby="lc-apply-title" className="scroll-mt-4 py-14 md:py-20">
          <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12`}>
            <div>
              <SectionHead id="lc-apply-title" title="수업 신청" />
              <p className="mt-4 text-[16px] leading-[1.7]" style={{ color: C.body }}>
                회차마다 {CAP}자리예요. 자리가 다 차면 대기 신청을 받고, 취소가 나오면 순서대로 문자 드려요.
              </p>
              <RefundRule />
            </div>

            <div className={panel} style={{ borderColor: C.line }}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[18px] font-bold">{done ? "신청 확인" : step === 1 ? "날짜와 시간" : step === 2 ? "신청하는 분" : "결제"}</p>
                {!done && (
                  <ol className="flex shrink-0 gap-1.5 text-[13px] font-semibold" aria-label="신청 단계">
                    {["회차", "정보", "결제"].map((s, i) => (
                      <li
                        key={s}
                        aria-current={step === i + 1 ? "step" : undefined}
                        className="rounded-full border px-2.5 py-0.5"
                        style={step === i + 1 ? { background: C.accent, borderColor: C.accent, color: "#ffffff" } : step > i + 1 ? { borderColor: C.accent, color: C.accent } : { borderColor: C.line, color: C.muted }}
                      >
                        {step > i + 1 && <Check size={12} aria-hidden className="mr-0.5 inline" />}
                        {s}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div>
                {done ? (
                  <Confirm done={done} label={label(done.session)} reduce={reduce} />
                ) : step === 1 ? (
                  <div className="mt-4">
                    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4" aria-label="회차">
                      {sessions.map((s) => {
                        const l = left(s.id);
                        const on = sid === s.id;
                        return (
                          <li key={s.id} className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setSid(s.id)}
                              aria-pressed={on}
                              className={`flex w-full min-w-0 flex-col items-start gap-1 rounded-[6px] border px-3 py-2.5 text-left transition-colors ${focusRing}`}
                              style={{ borderColor: on ? C.accent : C.line, background: on ? C.accentSoft : "#ffffff", boxShadow: on ? `inset 0 0 0 1px ${C.accent}` : undefined }}
                            >
                              <span className="text-[16px] font-bold tabular-nums">{md(s.date)}</span>
                              <span className="text-[14px] tabular-nums" style={{ color: C.muted }}>
                                {s.time}
                              </span>
                              <SeatDots left={Math.max(l, 0)} />
                              <span className="text-[13px] font-semibold" style={{ color: l <= 0 ? C.error : l <= 2 ? C.accent : C.body }}>
                                {l <= 0 ? "마감, 대기 가능" : `남은 자리 ${l}`}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: C.line }}>
                      <span className="text-[16px] font-bold tabular-nums">
                        {label(sid)} {full ? ", 마감" : `, 남은 자리 ${left(sid)}`}
                      </span>
                      {full ? (
                        <button type="button" onClick={toStep2} className={`${btnLine} h-12 px-5 text-[16px]`} style={{ borderColor: C.accent, color: C.accent }}>
                          대기 신청
                        </button>
                      ) : (
                        <button type="button" onClick={toStep2} className={`${btnMain} h-12 px-6 text-[16px]`} style={{ background: C.accent }}>
                          이 회차로
                        </button>
                      )}
                    </div>
                  </div>
                ) : step === 2 ? (
                  <form onSubmit={toStep3} className="mt-4" noValidate>
                    <p className="text-[16px] font-bold tabular-nums">
                      {label(sid)}{" "}
                      {full && (
                        <span className="ml-1 rounded-full px-2 py-0.5 text-[13px]" style={{ background: C.soft }}>
                          대기 신청
                        </span>
                      )}
                    </p>
                    <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
                      <label className={labelCls}>
                        이름
                        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={10} autoComplete="name" className={field} style={{ borderColor: C.line }} />
                      </label>
                      <label className={labelCls}>
                        휴대폰
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" maxLength={13} autoComplete="tel" className={field} style={{ borderColor: C.line }} />
                      </label>
                      {!full && (
                        <fieldset className="min-w-0">
                          <legend className="text-[14px] font-semibold">인원</legend>
                          <div className="mt-1.5 grid grid-cols-2 gap-2">
                            {[1, 2].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setQty(n)}
                                aria-pressed={qty === n}
                                disabled={n > left(sid)}
                                className={`h-12 w-full min-w-0 rounded-[6px] border text-[16px] font-semibold disabled:opacity-40 ${focusRing}`}
                                style={qty === n ? { background: C.accent, borderColor: C.accent, color: "#ffffff" } : { borderColor: C.line, background: "#ffffff" }}
                              >
                                {n}명
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      )}
                      <fieldset className="min-w-0">
                        <legend className="text-[14px] font-semibold">가죽 색</legend>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {LEATHERS.map((l) => {
                            const on = l.id === leatherId;
                            return (
                              <button
                                key={l.id}
                                type="button"
                                onClick={() => setLeatherId(l.id)}
                                aria-pressed={on}
                                className={`inline-flex h-12 items-center gap-1.5 rounded-[6px] border pl-2 pr-3 text-[14px] font-semibold transition-colors ${focusRing}`}
                                style={{ borderColor: on ? C.accent : C.line, background: on ? C.accentSoft : "#ffffff", boxShadow: on ? `inset 0 0 0 1px ${C.accent}` : undefined }}
                              >
                                <span aria-hidden className="h-5 w-5 rounded-full" style={{ background: l.color }} />
                                {l.name}
                              </button>
                            );
                          })}
                        </div>
                      </fieldset>
                      <label className={`${labelCls} sm:col-span-2`}>
                        각인 이니셜(영문 3자)
                        <input value={initials} onChange={(e) => setInitials(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3))} className={`${field} sm:max-w-[340px]`} style={{ borderColor: C.line }} />
                      </label>
                    </div>
                    <label className="mt-4 flex items-start gap-2.5 text-[15px] font-semibold">
                      <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#7a4a2e]" />
                      환불 규정을 확인했어요
                    </label>
                    {err && (
                      <p role="alert" className="mt-2 text-[14px] font-semibold" style={{ color: C.error }}>
                        {err}
                      </p>
                    )}
                    <div className="mt-5 flex gap-2">
                      <button type="button" onClick={() => setStep(1)} className={`${btnLine} h-12 px-4 text-[15px]`} style={{ borderColor: C.line }}>
                        회차 다시
                      </button>
                      <button type="submit" className={`${btnMain} h-12 flex-1 text-[16px]`} style={{ background: C.accent }}>
                        {full ? "대기 신청하기" : `결제로, ${won(PRICE * qty)}`}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-4">
                    <p className="text-[16px] font-bold tabular-nums">
                      {label(sid)}, {qty}명, {maskName(name)}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="결제 방법">
                      {(
                        [
                          ["card", CreditCard, "카드"],
                          ["bank", Landmark, "계좌이체"],
                        ] as const
                      ).map(([v, I, t]) => (
                        <button
                          key={v}
                          type="button"
                          role="radio"
                          aria-checked={pay === v}
                          onClick={() => setPay(v)}
                          className={`flex h-14 min-w-0 items-center justify-center gap-2 rounded-[6px] border text-[16px] font-semibold ${focusRing}`}
                          style={pay === v ? { borderColor: C.accent, background: C.accentSoft, boxShadow: `inset 0 0 0 1px ${C.accent}` } : { borderColor: C.line, background: "#ffffff" }}
                        >
                          <I size={19} aria-hidden /> {t}
                        </button>
                      ))}
                    </div>
                    {pay === "card" ? (
                      <div className="mt-3 rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.soft }}>
                        <p className="text-[13px]" style={{ color: C.muted }}>
                          등록한 카드
                        </p>
                        <p className="mt-2 whitespace-nowrap text-[16px] font-semibold tabular-nums tracking-[0.08em] min-[380px]:text-[18px]">0000 0000 0000 0000</p>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-[8px] border p-4" style={{ borderColor: C.line, background: C.soft }}>
                        <p className="text-[13px] font-semibold" style={{ color: C.muted }}>
                          입금 계좌
                        </p>
                        <p className="mt-1 text-[18px] font-bold tabular-nums">국민은행 000000-00-000000</p>
                        <p className="mt-1 text-[14px]" style={{ color: C.body }}>
                          입금자명은 신청하신 이름으로 적어 주세요.
                        </p>
                      </div>
                    )}
                    {err && (
                      <p role="alert" className="mt-2 text-[14px] font-semibold" style={{ color: C.error }}>
                        {err}
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => setStep(2)} className={`${btnLine} h-12 px-4 text-[15px]`} style={{ borderColor: C.line }}>
                        이전
                      </button>
                      <button type="button" onClick={() => finish(pay)} className={`${btnMain} h-12 flex-1 text-[16px]`} style={{ background: C.accent }}>
                        {pay === "card" ? `${won(PRICE * qty)} 결제` : "계좌 받고 신청"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 자주 묻는 것 */}
        <section aria-labelledby="lc-faq-title" className="py-14 md:py-16" style={{ background: C.soft }}>
          <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12`}>
            <SectionHead id="lc-faq-title" title="오기 전에" />
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {FAQ.map(([q, a]) => (
                <div key={q} className="border-b py-4" style={{ borderColor: C.line }}>
                  <dt className="text-[17px] font-bold">{q}</dt>
                  <dd className="mt-1 text-[15px] leading-[1.65]" style={{ color: C.body }}>
                    {a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

      </main>

      <footer className="border-t py-10 text-[14px] leading-[1.8]" style={{ borderColor: C.line, color: C.muted }}>
        <div className={`${wrap} grid gap-2 md:grid-cols-[1fr_auto] md:items-end`}>
          <div>
            <p className="text-[17px] font-bold" style={{ color: C.ink }}>
              가죽 공방
            </p>
            <DemoMakerInfo className="mt-1" />
          </div>
        </div>
      </footer>
    </div>
  );
}

function RefundRule() {
  return (
    <div className="mt-5 rounded-[8px] border bg-white p-4" style={{ borderColor: C.line }}>
      <p className="text-[15px] font-bold">환불 규정</p>
      <dl className="mt-2 grid gap-1 text-[14px]" style={{ color: C.body }}>
        {REFUND_RULE.map(([k, v]) => (
          <div key={k} className="flex flex-wrap justify-between gap-x-3 rounded-[4px] px-1.5 py-1">
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Confirm({ done, label, reduce }: { done: Booking; label: string; reduce: boolean }) {
  return (
    <motion.div role="status" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="mt-4 rounded-[8px] border p-5" style={{ borderColor: C.line, background: C.soft }}>
      <p className="flex items-center gap-1.5 text-[16px] font-bold">
        <Check size={18} aria-hidden style={{ color: C.accent }} /> {done.status === "대기" ? "대기 신청 완료" : "신청 완료"}
      </p>
      <p className="mt-4 text-[13px] font-semibold" style={{ color: C.muted }}>
        예약 번호
      </p>
      <p className="text-[30px] font-bold leading-none tabular-nums tracking-[0.02em]">{done.no}</p>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[15px]">
        <dt style={{ color: C.muted }}>회차</dt>
        <dd className="font-semibold tabular-nums">{label}</dd>
        <dt style={{ color: C.muted }}>인원</dt>
        <dd className="font-semibold">{done.qty}명</dd>
        <dt style={{ color: C.muted }}>상태</dt>
        <dd className="font-semibold">{done.status}</dd>
      </dl>
      {done.status === "입금 대기" && (
        <p className="mt-4 rounded-[6px] border bg-white p-3 text-[14px] tabular-nums" style={{ borderColor: C.line }}>
          국민은행 000000-00-000000, <b>{won(PRICE * done.qty)}</b>. 신청 뒤 24시간 안에 입금해 주세요.
        </p>
      )}
      {done.status === "대기" && <p className="mt-3 text-[14px]">자리가 나면 문자로 먼저 알려 드려요. 결제는 그때 해요.</p>}
      <p className="mt-3 flex items-center gap-1.5 text-[14px]" style={{ color: C.body }}>
        <Phone size={14} aria-hidden /> 같은 내용이 문자로도 가요.
      </p>
    </motion.div>
  );
}
