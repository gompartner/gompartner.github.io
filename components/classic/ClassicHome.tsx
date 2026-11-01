"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { faq, processSteps } from "@/data/classic/faq";
import { maintenanceServices } from "@/data/classic/maintenance";
import { projects } from "@/data/classic/projects";
import { PROGRAM_IDS } from "@/data/classic/programIds";
import { cn } from "@/lib/utils";
import { FlowSteps } from "@/components/classic/pricing/StepList";

// 클래식 보기의 첫 화면. 딱 보면 무엇을 하는 곳이고 어떻게 진행되는지 보이게 한다(10-30):
// 하는 일 한 줄, 서비스, 진행 절차, 카탈로그 분류, 제작 방식 비교, 자주 묻는 질문.
// 카탈로그 카드는 첫 화면에 늘어놓지 않고 분류 네 칸으로만 보여 준다.

const NAVY = "#0f1b3d";

// 11-01 홈페이지 제작과 유지보수 두 가지만. 유지보수는 세부 페이지 네 개로
const services = [
  {
    href: "/classic/homepage",
    name: "홈페이지 제작",
    what: "병원, 매장, 전문직, 기업, 학원 반응형 홈페이지",
  },
  ...maintenanceServices.map((m) => ({
    href: `/classic/maintenance/${m.id}`,
    name: m.title,
    what: m.term,
  })),
];

// 강점. 모두 진행 절차와 자주 묻는 질문에 적힌 약속이다
const strengths = [
  { name: "원본 소스 제공", what: "도메인, 호스팅 고객 명의" },
  { name: "점검 결과표", what: "PC, 태블릿, 휴대폰 화면과 웹 접근성" },
  { name: "인계 문서", what: "계정 목록과 수정 방법" },
  { name: "1개월 무상 하자보수", what: "오픈 후 1개월" },
];

// 카탈로그 분류. works/samples.ts groups 와 같은 기준으로 센다
const live = projects.filter((p) => p.demoUrl.startsWith("/demo/"));
const groupOf = (p: (typeof projects)[number]) =>
  p.category === "랜딩페이지" || p.id.startsWith("landing-")
    ? "landing"
    : p.kind === "유지보수" ||
        [
          "maintenance-dashboard",
          "maintenance-urgent-fix",
          "accessibility-review",
        ].includes(p.id)
      ? "maintenance"
      : PROGRAM_IDS.includes(p.id)
        ? "program"
        : "homepage";
const catalog = [
  {
    key: "homepage",
    href: "/classic/works",
    name: "업종별 홈페이지",
    what: "병원, 매장, 전문직, 기업, 교육 업종별 구성",
  },
  {
    key: "landing",
    href: "/classic/works/landing",
    name: "광고 랜딩페이지",
    what: "상담, 예약, 사전 등록 신청 페이지",
  },
].map((c) => ({
  ...c,
  count: live.filter((p) => groupOf(p) === c.key).length,
}));

const h2 =
  "text-[30px] font-[800] leading-[1.25] tracking-[-0.04em] md:text-[44px]";
const more =
  "inline-flex items-center gap-1 text-[15px] font-bold text-[#5b6370] hover:text-[#15171c]";

export function ClassicHome() {
  return (
    <div className="bg-white text-[#15171c]">
      <Hero />
      <Strengths />
      <Services />
      <Catalog />
      <Process />
      <Faq />
    </div>
  );
}

// 첫 화면 서비스별 슬라이드(11-01): 서비스 5개, 화면 안은 서비스마다 납품하는 문서. 7초마다 넘어가고 아래 탭에 진행 막대.
// 마우스를 올리거나 포커스가 있으면 멈추고, 움직임 줄이기 설정이면 자동으로 넘기지 않는다.
const heroSlides = [
  {
    key: "make",
    tab: "제작",
    w: 1440,
    h: 900,
    title: "홈페이지 제작",
    sub: "병원, 매장, 전문직 사무실, 기업, 학원 반응형 홈페이지",
    points: [
      "업종별 법정 고지 검토",
      "원본 소스와 인계 문서",
      "1개월 무상 하자보수",
    ],
    href: "/classic/homepage",
  },
  {
    key: "fix",
    tab: "오류 수정",
    w: 1060,
    h: 752,
    title: "오류 수정",
    sub: "접속 불가, 화면 깨짐, 문의 메일 미수신",
    points: ["24시간 내 회신", "원인 확인 후 견적", "장애 처리 내역서"],
    href: "/classic/maintenance/fix",
  },
  {
    key: "takeover",
    tab: "이관",
    w: 1060,
    h: 790,
    title: "업체 이관",
    sub: "기존 업체 연락 두절 시 인수",
    points: [
      "호스팅, 도메인 계정으로 인수",
      "전체 백업과 구성 정리",
      "인수 점검 보고서",
    ],
    href: "/classic/maintenance/takeover",
  },
  {
    key: "update",
    tab: "보안",
    w: 1060,
    h: 752,
    title: "보안 업데이트",
    sub: "워드프레스, 그누보드, PHP",
    points: ["작업 전 전체 백업", "협의한 시간에 작업", "업데이트 결과서"],
    href: "/classic/maintenance/update",
  },
  {
    key: "monthly",
    tab: "월 관리",
    w: 1060,
    h: 714,
    title: "월 관리",
    sub: "문구, 사진, 공지 수정과 정기 점검",
    points: ["월 건수 단위 계약", "도메인, SSL 만료 알림", "월간 점검 보고서"],
    href: "/classic/maintenance/monthly",
  },
];
const HERO_MS = 7000;

function Hero() {
  const N = heroSlides.length;
  // pos는 트랙 위치. N은 맨 끝에 붙인 첫 슬라이드 복제본이라, 마지막에서 다음으로 가면 이어서 들어온 뒤 처음으로 조용히 옮긴다
  const [pos, setPos] = useState(0);
  const [anim, setAnim] = useState(true);
  // 자동 넘김은 한 바퀴만. 직접 고르면 그때부터 멈춘다
  const [auto, setAuto] = useState(true);
  const cur = pos % N;
  const [hold, setHold] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const f = requestAnimationFrame(() =>
      setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches),
    );
    return () => cancelAnimationFrame(f);
  }, []);
  useEffect(() => {
    if (!auto || hold || reduced) return;
    const t = window.setTimeout(() => {
      if (pos >= N - 1) {
        setPos(N);
        setAuto(false);
      } else setPos(pos + 1);
    }, HERO_MS);
    return () => window.clearTimeout(t);
  }, [pos, auto, hold, reduced, N]);
  const go = (n: number) => {
    setAuto(false);
    setAnim(true);
    if (n === N) setPos(N);
    else setPos((n + N) % N);
  };
  const settle = () => {
    if (pos !== N) return;
    setAnim(false);
    setPos(0);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)));
  };
  const touchX = useRef(0);
  return (
    <section
      aria-labelledby="c-hero"
      aria-roledescription="carousel"
      className="relative overflow-hidden text-white"
      style={{ backgroundColor: NAVY }}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
    >
      <h1 id="c-hero" className="sr-only">
        곰파트너 홈페이지 제작과 유지보수
      </h1>
      {/* 옅은 모눈 배경 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* 좌우로 미는 슬라이드. 휴대폰은 손가락으로 밀어 넘긴다 */}
      <div
        className="relative overflow-hidden"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
        }}
      >
        <div
          className={cn(
            "flex",
            anim &&
              "transition-transform duration-700 ease-[cubic-bezier(.22,.61,.36,1)] motion-reduce:transition-none",
          )}
          style={{ transform: `translateX(-${pos * 100}%)` }}
          onTransitionEnd={settle}
        >
          {[...heroSlides, heroSlides[0]].map((sl, i) => (
            <div
              key={i === N ? "clone" : sl.key}
              role={i === N ? undefined : "group"}
              aria-roledescription={i === N ? undefined : "slide"}
              aria-label={i === N ? undefined : `${i + 1} / ${N}, ${sl.title}`}
              aria-hidden={i !== pos}
              className="w-full shrink-0"
            >
              <div className="mx-auto grid w-full max-w-[1248px] items-center gap-10 px-4 pb-8 pt-12 md:min-h-[620px] md:grid-cols-[1fr_1.15fr] md:gap-14 md:px-6 md:pb-10 md:pt-16">
                <div>
                  <p className="break-keep text-[40px] font-[800] leading-[1.12] tracking-[-0.05em] md:text-[64px]">
                    {sl.title}
                  </p>
                  <p className="mt-4 max-w-[520px] break-keep text-[17px] leading-[1.7] text-[#c9d3e6] md:text-[19px]">
                    {sl.sub}
                  </p>
                  <ul className="mt-6 space-y-2.5" role="list">
                    {sl.points.map((pt) => (
                      <li
                        key={pt}
                        className="flex items-center gap-2.5 text-[16px] font-bold md:text-[17px]"
                      >
                        <CheckCircle2
                          size={20}
                          aria-hidden
                          className="shrink-0 text-[#8fb4ff]"
                        />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href="/classic/contact"
                      tabIndex={i === pos ? 0 : -1}
                      data-gtm-cta={`classic_hero_contact_${sl.key}`}
                      className="inline-flex h-12 items-center rounded-md bg-[#256ef4] px-6 text-[16px] font-bold text-white transition-colors hover:bg-[#0b50d0]"
                    >
                      상담 신청
                    </Link>
                    <Link
                      href={sl.href}
                      tabIndex={i === pos ? 0 : -1}
                      className="inline-flex h-12 items-center gap-1 rounded-md border border-white/40 px-6 text-[16px] font-bold text-white transition-colors hover:bg-white/10"
                    >
                      자세히 보기 <ChevronRight size={16} aria-hidden />
                    </Link>
                  </div>
                </div>
                {/* 브라우저 틀 없이 문서 종이를 겹쳐 놓는다. 앞장은 이 서비스에서 실제로 드리는 문서 모양 */}
                <div
                  aria-hidden
                  className="relative mx-auto w-full max-w-[640px] px-3 py-6 md:px-0"
                >
                  <div className="absolute inset-x-8 bottom-3 top-1 rotate-[5deg] rounded-md bg-white/25" />
                  <div className="absolute inset-x-5 bottom-4 top-3 rotate-[2.5deg] rounded-md bg-white/60 shadow-[0_10px_30px_rgba(0,0,0,.25)]" />
                  <Image
                    src={`/images/site/hero-${sl.key}-doc.jpg`}
                    alt=""
                    width={sl.w}
                    height={sl.h}
                    priority={i === 0}
                    sizes="(min-width: 768px) 640px, 92vw"
                    className="relative h-auto w-full -rotate-[1deg] rounded-md shadow-[0_30px_60px_rgba(0,0,0,.45)]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 서비스 탭: 진행 막대가 차오르면 다음 서비스로 */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1248px] items-stretch px-4 md:px-6">
          <div
            className="grid min-w-0 flex-1 grid-cols-5 md:flex"
            role="tablist"
            aria-label="서비스 선택"
          >
            {heroSlides.map((sl, i) => (
              <button
                key={sl.key}
                type="button"
                role="tab"
                aria-selected={i === cur}
                onClick={() => go(i)}
                className={cn(
                  "relative whitespace-nowrap px-1 py-4 text-center text-[13px] font-bold transition-colors md:flex-1 md:px-5 md:py-5 md:text-left md:text-[16px]",
                  i === cur ? "text-white" : "text-white/55 hover:text-white",
                )}
              >
                <span className="md:hidden">{sl.tab}</span>
                <span className="hidden md:inline">{sl.title}</span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[3px] bg-white/10"
                >
                  {i === cur && (
                    <span
                      key={`${cur}-${hold}-${auto}`}
                      className="block h-full bg-[#8fb4ff]"
                      style={
                        reduced || hold || !auto
                          ? { width: "100%" }
                          : {
                              animation: `hero-progress ${HERO_MS}ms linear forwards`,
                            }
                      }
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="hidden items-center gap-2 pl-4 md:flex">
            <button
              type="button"
              onClick={() => go(cur - 1)}
              aria-label="이전 서비스"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/30 hover:bg-white/10"
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(cur + 1)}
              aria-label="다음 서비스"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/30 hover:bg-white/10"
            >
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Strengths() {
  return (
    <section
      aria-labelledby="c-strengths"
      className="border-b border-[#e6e9ee]"
    >
      <h2 id="c-strengths" className="sr-only">
        곰파트너 납품 기준
      </h2>
      <ul
        className="mx-auto grid w-full max-w-[1248px] gap-px px-4 py-10 sm:grid-cols-2 md:px-6 md:py-12 lg:grid-cols-4"
        role="list"
      >
        {strengths.map((s) => (
          <li
            key={s.name}
            className="flex items-start gap-3 py-3 lg:px-4 lg:first:pl-0"
          >
            <CheckCircle2
              size={24}
              aria-hidden
              className="mt-0.5 shrink-0 text-[#256ef4]"
            />
            <span>
              <span className="block text-[18px] font-[800] tracking-[-0.03em] md:text-[19px]">
                {s.name}
              </span>
              <span className="mt-0.5 block text-[15px] text-[#5b6370]">
                {s.what}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Services() {
  return (
    <section
      aria-labelledby="c-services"
      className="mx-auto w-full max-w-[1248px] scroll-mt-16 px-4 py-20 md:scroll-mt-[76px] md:px-6 md:py-28"
    >
      <h2 id="c-services" className={h2}>
        서비스
      </h2>
      <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
        {services.map((s) => (
          <li key={s.name} className="border-b border-[#d9dee5]">
            <Link
              href={s.href}
              data-gtm-cta={`classic_service_${s.href.split("/").pop()}`}
              className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-6 md:grid-cols-[minmax(0,360px)_1fr_auto] md:py-8"
            >
              <h3 className="col-start-1 row-start-1 text-[24px] font-[800] tracking-[-0.04em] transition-colors group-hover:text-[#256ef4] md:text-[34px]">
                {s.name}
              </h3>
              <p className="col-start-1 row-start-2 text-[16px] text-[#5b6370] md:col-start-2 md:row-start-1 md:text-[17px]">
                {s.what}
              </p>
              <ArrowUpRight
                size={28}
                aria-hidden
                className="col-start-2 row-span-2 row-start-1 self-center text-[#6b7280] transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#256ef4] md:col-start-3 md:row-span-1"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Catalog() {
  return (
    <section aria-labelledby="c-catalog" className="bg-[#f4f6f9]">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-20 md:px-6 md:py-28">
        <h2 id="c-catalog" className={h2}>
          카탈로그
        </h2>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 md:gap-4" role="list">
          {catalog.map((c) => (
            <li key={c.key}>
              <Link
                href={c.href}
                className="group flex h-full flex-col rounded-md border border-[#d9dee5] bg-white p-6 transition-colors hover:border-[#256ef4]"
              >
                <span className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[20px] font-[800] tracking-[-0.03em] group-hover:text-[#256ef4] md:text-[22px]">
                    {c.name}
                  </h3>
                  <span className="shrink-0 text-[15px] font-bold tabular-nums text-[#5b6370]">
                    {c.count}개
                  </span>
                </span>
                <span className="mt-2 flex-1 text-[15px] leading-[1.6] text-[#5b6370] md:text-[16px]">
                  {c.what}
                </span>
                <span className="mt-5 inline-flex items-center gap-1 text-[15px] font-bold text-[#256ef4]">
                  보기 <ChevronRight size={16} aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section
      aria-labelledby="c-process"
      className="mx-auto w-full max-w-[1248px] scroll-mt-16 px-4 py-20 md:scroll-mt-[76px] md:px-6 md:py-28"
    >
      <h2 id="c-process" className={h2}>
        진행 절차
      </h2>
      <FlowSteps steps={processSteps} />
    </section>
  );
}

function Faq() {
  return (
    <section aria-labelledby="c-faq" className="border-t border-[#e6e9ee]">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-20 md:px-6 md:py-24">
        <div className="flex items-end justify-between gap-4">
          <h2 id="c-faq" className={h2}>
            자주 묻는 질문
          </h2>
          <Link href="/classic/faq" className={more}>
            더보기 <Plus size={15} strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
        <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
          {faq.slice(0, 5).map((f) => (
            <li key={f.q} className="border-b border-[#e6e9ee]">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-start gap-4 py-5 md:py-6 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1 text-[17px] font-bold leading-[1.5] tracking-[-0.02em] md:text-[19px]">
                    {f.q}
                  </span>
                  <ChevronDown
                    size={22}
                    aria-hidden
                    className="mt-0.5 shrink-0 text-[#6b7280] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                <p className="pb-6 text-[16px] leading-[1.75] text-[#3d4450] md:pr-12 md:text-[17px]">
                  {f.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
