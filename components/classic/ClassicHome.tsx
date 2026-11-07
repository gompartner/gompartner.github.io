"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NavLink } from "@/components/classic/NavLink";
import {
  ArrowUpRight,
  Box,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Plus,
  Megaphone,
  MonitorSmartphone,
  Workflow,
  Repeat,
  Smartphone,
  TabletSmartphone,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { PhpPromo } from "@/components/classic/PhpPromo";
import { TakeoverFreePromo } from "@/components/classic/TakeoverFreePromo";
import { PriceBand } from "@/components/classic/PriceBand";
import { faq, processSteps } from "@/data/classic/faq";
import { maintenanceServices, maintenanceSteps } from "@/data/classic/maintenance";
import { cn } from "@/lib/utils";
import { FlowSteps } from "@/components/classic/pricing/StepList";

// 클래식 보기의 첫 화면. 딱 보면 무엇을 하는 곳이고 어떻게 진행되는지 보이게 한다(10-30):
// 하는 일 한 줄, 서비스, 진행 절차, 카탈로그 분류, 제작 방식 비교, 자주 묻는 질문.
// 카탈로그 카드는 첫 화면에 늘어놓지 않고 분류 네 칸으로만 보여 준다.

const NAVY = "#0f1b3d";

// 11-01 제작(홈페이지, 랜딩, 업무 프로그램, 앱, 키오스크, 11-03 3D)과 유지보수. 유지보수는 세부 페이지 네 개로
// 서비스 목록 아이콘(홈페이지 제작 쪽 업종별 구성과 같은 모양)
const serviceIcon: Record<string, LucideIcon> = { fix: Wrench, takeover: Repeat, update: ShieldCheck, monthly: CalendarCheck };

const services = [
  {
    href: "/homepage",
    name: "홈페이지 제작",
    what: "병원, 매장, 전문직, 기업, 학원 홈페이지를 업종에 맞게 만듭니다",
    icon: MonitorSmartphone,
  },
  {
    href: "/landing-page",
    name: "랜딩페이지 제작",
    what: "광고로 들어온 고객의 상담, 예약 신청을 바로 받는 홍보용 페이지를 만듭니다",
    icon: Megaphone,
  },
  {
    href: "/program",
    name: "업무 프로그램 제작",
    what: "엑셀로 하던 주문 취합, 관리, 출력 업무를 웹 프로그램으로 만듭니다",
    icon: Workflow,
  },
  {
    href: "/app",
    name: "앱 제작",
    what: "아이폰, 안드로이드 앱과 설치형 웹앱을 업무에 맞게 만듭니다",
    icon: Smartphone,
  },
  {
    href: "/kiosk",
    name: "키오스크 화면 제작",
    what: "병원 접수, 출결, 체크인, 안내처럼 직접 누르는 화면을 만듭니다",
    icon: TabletSmartphone,
  },
  {
    href: "/3d",
    name: "3D 웹 제작",
    what: "가구, 중문, 간판 제품을 손님이 3D로 구성하고 바로 견적을 받는 화면을 만듭니다",
    icon: Box,
  },
  ...[...maintenanceServices].sort((a, b) => (b.id === "takeover" ? 1 : 0) - (a.id === "takeover" ? 1 : 0)).map((m) => ({
    href: `/maintenance/${m.id}`,
    name: m.h1,
    what: m.term,
    icon: serviceIcon[m.id] ?? Wrench,
  })),
];

// 강점. 모두 진행 절차와 자주 묻는 질문에 적힌 약속이다
const strengths = [
  { name: "원본 소스 제공", what: "도메인, 호스팅 고객 명의" },
  { name: "점검 결과표", what: "PC, 태블릿, 모바일 화면과 웹 접근성" },
  { name: "인계 문서", what: "계정 목록과 수정 방법" },
  { name: "1개월 무상 관리", what: "오픈 후 하자 보수와 월 유지보수" },
];

// 첫 화면 질문: 유지보수 2, 제작 2, 결제 1(11-06 이어받기 먼저)
const homeFaq = [
  ...faq.filter((f) => f.tag === "care").slice(0, 2),
  ...faq.filter((f) => f.tag === "make").slice(0, 2),
  ...faq.filter((f) => f.tag === "common").slice(0, 1),
];

const h2 =
  "text-[30px] font-[800] leading-[1.25] tracking-[-0.04em] md:text-[44px]";
const more =
  "inline-flex items-center gap-1 text-[15px] font-bold text-[#5b6370] hover:text-[#15171c]";

export function ClassicHome() {
  return (
    <div className="bg-white text-[#15171c]">
      <Hero />
      <TakeoverFreePromo />
      <PhpPromo />
      <Strengths />
      <Services />
      <PriceBand />
      <Process />
      <Faq />
    </div>
  );
}

// 11-06 이어받기 집중: 업체 변경 슬라이드가 처음, 제작은 맨 뒤
// 첫 화면 서비스별 슬라이드(11-01): 서비스 5개, 화면 안은 서비스마다 납품하는 문서. 7초마다 넘어가고 아래 탭에 진행 막대.
// 마우스를 올리거나 포커스가 있으면 멈추고, 움직임 줄이기 설정이면 자동으로 넘기지 않는다.
const heroSlides = [
  {
    key: "takeover",
    tab: "업체 변경",
    w: 1060,
    h: 790,
    title: "유지보수 업체 변경",
    sub: "전 업체나 개발자와 연락이 끊긴 홈페이지와 앱을 이어받아 운영합니다",
    points: [
      "호스팅, 도메인 계정으로 인수",
      "전체 백업과 구성 정리",
      "인수 점검 보고서와 인계 문서",
    ],
    href: "/maintenance/takeover",
  },
  {
    key: "fix",
    tab: "오류 수정",
    w: 1060,
    h: 752,
    title: "오류 수정",
    sub: "홈페이지가 열리지 않거나 화면이 깨질 때 원인을 찾아 고칩니다",
    points: ["영업일 24시간 이내 회신", "원인 확인 후 견적", "장애 처리 내역서"],
    href: "/maintenance/fix",
  },
  {
    key: "update",
    tab: "보안",
    w: 1060,
    h: 752,
    title: "보안 업데이트",
    sub: "워드프레스, 그누보드, PHP를 최신 버전으로 안전하게 올립니다",
    points: ["작업 전 전체 백업", "협의한 시간에 작업", "업데이트 결과서"],
    href: "/maintenance/update",
  },
  {
    key: "monthly",
    tab: "월 관리",
    w: 1060,
    h: 714,
    title: "월 관리",
    sub: "문구, 사진, 공지 수정과 정기 점검을 매달 맡습니다",
    points: ["월 건수 단위 계약", "도메인, SSL 만료 알림", "월간 점검 보고서"],
    href: "/maintenance/monthly",
  },
  {
    key: "make",
    tab: "제작",
    w: 1440,
    h: 900,
    title: "홈페이지 제작",
    sub: "병원, 매장, 전문직 사무실, 기업, 학원 홈페이지를 업종에 맞게 만듭니다",
    points: [
      "업종별 법정 고지 검토",
      "반응형, 검색엔진 등록",
      "요구에 맞춘 견적",
    ],
    href: "/homepage",
  },
];
const HERO_MS = 7000;

// 11-01 제작 슬라이드 화면은 업종(병원, 가게, 전문직, 기업, 학원)을 먼저 무작위로 고르고, 그 업종 대표 카탈로그 중 하나를 보여 준다
const MAKE_POOL: string[][] = [
  ["dental-homepage", "eye-clinic", "pediatrics"],
  ["hanok-cafe", "bakery-cafe", "korean-restaurant"],
  ["law-firm", "tax-office", "patent-office"],
  ["company", "cert-lab", "logistics"],
  ["academy", "piano-academy", "english-talk"],
];
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

function Hero() {
  const N = heroSlides.length;
  const [makeShot, setMakeShot] = useState(MAKE_POOL[0][0]);
  useEffect(() => {
    const f = requestAnimationFrame(() => setMakeShot(pick(pick(MAKE_POOL))));
    return () => cancelAnimationFrame(f);
  }, []);
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
        곰파트너 홈페이지 유지보수와 제작
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
                  {sl.key === "make" ? (
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href="/contact"
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
                  ) : (
                    // 11-01 유지보수 슬라이드: 주소를 넣고 바로 점검 요청(상담 신청서가 ?site= 를 읽어 미리 채운다)
                    <div className="mt-8">
                      <form action="/contact" method="get" className="flex max-w-[520px] overflow-hidden rounded-md bg-white">
                        <label htmlFor={`hero-site-${sl.key}`} className="sr-only">
                          홈페이지 주소
                        </label>
                        <input
                          id={`hero-site-${sl.key}`}
                          name="site"
                          type="text"
                          inputMode="url"
                          autoComplete="url"
                          placeholder="홈페이지 주소"
                          tabIndex={i === pos ? 0 : -1}
                          className="min-w-0 flex-1 px-4 text-[16px] text-[#15171c] outline-none placeholder:text-[#8a94a6]"
                        />
                        <button
                          type="submit"
                          tabIndex={i === pos ? 0 : -1}
                          data-gtm-cta={`classic_hero_check_${sl.key}`}
                          className="h-12 shrink-0 bg-[#256ef4] px-6 text-[16px] font-bold text-white transition-colors hover:bg-[#0b50d0]"
                        >
                          점검 요청
                        </button>
                      </form>
                      <Link
                        href={sl.href}
                        tabIndex={i === pos ? 0 : -1}
                        className="mt-4 inline-flex min-h-11 items-center gap-1 text-[15px] font-bold text-[#c9d3e6] hover:text-white"
                      >
                        자세히 보기 <ChevronRight size={16} aria-hidden />
                      </Link>
                    </div>
                  )}
                </div>
                {/* 브라우저 틀 없이 문서 종이를 겹쳐 놓는다. 앞장은 이 서비스에서 실제로 드리는 문서 모양 */}
                <div
                  aria-hidden
                  className="relative mx-auto w-full max-w-[640px] px-3 py-6 md:px-0"
                >
                  {sl.key === "make" ? (
                    <div className="absolute inset-x-8 bottom-3 top-1 rotate-[5deg] rounded-md bg-white/25" />
                  ) : null}
                  {sl.key === "make" ? (
                    <div className="absolute inset-x-5 bottom-4 top-3 rotate-[2.5deg] rounded-md bg-white/60 shadow-[0_10px_30px_rgba(0,0,0,.25)]" />
                  ) : null}
                  {sl.key === "make" ? (
                    <div className="relative -rotate-[1deg]">
                      <div className="overflow-hidden rounded-md bg-white shadow-[0_30px_60px_rgba(0,0,0,.45)]">
                        <div className="flex h-6 items-center gap-1.5 bg-[#eef0f3] px-3">
                          <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
                          <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
                          <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
                        </div>
                        <Image src={`/images/demos/${makeShot}.jpg`} alt={`${sl.title} PC 화면`} width={1440} height={900} priority={i === 0} sizes="(min-width: 768px) 640px, 92vw" className="aspect-[16/10] h-auto w-full object-cover object-top" />
                      </div>
                      <div className="absolute -bottom-4 -right-2 w-[24%] overflow-hidden rounded-[14px] border-[4px] border-[#15171c] bg-white shadow-[0_20px_40px_rgba(0,0,0,.45)] md:-right-6">
                        <Image src={`/images/demos/m/${makeShot}.jpg`} alt={`${sl.title} 휴대폰 화면`} width={390} height={736} sizes="160px" className="aspect-[9/17] w-full object-cover object-top" />
                      </div>
                    </div>
                  ) : (
                  // 11-01 유지보수 슬라이드: 문서 그림 대신 작업 장면 사진
                  <Image
                    src={`/images/site/scene-${sl.key}.jpg`}
                    alt={`${sl.title} 작업 장면`}
                    width={1344}
                    height={768}
                    priority={i === 0}
                    sizes="(min-width: 768px) 640px, 92vw"
                    className="relative aspect-[16/10] h-auto w-full rounded-md object-cover shadow-[0_30px_60px_rgba(0,0,0,.45)]"
                  />
                  )}
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
            role="group"
            aria-label="서비스 선택"
          >
            {heroSlides.map((sl, i) => (
              <button
                key={sl.key}
                type="button"
                aria-current={i === cur ? "true" : undefined}
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
          {/* 자동 넘김 멈춤, 재생(웹 접근성: 5초 넘게 움직이는 내용의 멈춤 수단) */}
          <div className="flex items-center pl-2 md:pl-4">
            <button
              type="button"
              onClick={() => setAuto((v) => !v)}
              aria-label={auto ? "자동 넘김 멈춤" : "자동 넘김 재생"}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/30 hover:bg-white/10"
            >
              {auto ? <Pause size={16} aria-hidden /> : <Play size={16} aria-hidden />}
            </button>
          </div>
          <div className="hidden items-center gap-2 pl-2 md:flex">
            <button
              type="button"
              onClick={() => go(cur - 1)}
              aria-label="이전 서비스"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/30 hover:bg-white/10"
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(cur + 1)}
              aria-label="다음 서비스"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/30 hover:bg-white/10"
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
        className="mx-auto grid w-full max-w-[1248px] grid-cols-2 gap-x-4 gap-y-2 px-4 py-8 md:px-6 md:py-12 lg:grid-cols-4"
        role="list"
      >
        {strengths.map((s) => (
          <li
            key={s.name}
            className="flex items-start gap-2 py-2 md:gap-3 md:py-3 lg:px-4 lg:first:pl-0"
          >
            <CheckCircle2
              aria-hidden
              className="mt-0.5 size-5 shrink-0 text-[#256ef4] md:size-6"
            />
            <span>
              <span className="block text-[16px] font-[800] leading-[1.4] tracking-[-0.03em] md:text-[19px]">
                {s.name}
              </span>
              <span className="mt-0.5 block text-[14px] leading-[1.5] text-[#5b6370] md:text-[15px]">
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
      {/* 11-01 제작과 유지보수 두 묶음으로 나눈다 */}
      <div className="mt-10 space-y-12">
        {[
          { label: "유지보수", items: services.filter((x) => x.href.startsWith("/maintenance")) },
          { label: "제작", items: services.filter((x) => !x.href.startsWith("/maintenance")) },
        ].map((g) => (
          <div key={g.label}>
            <h3 className="mb-4 text-[15px] font-bold text-[#256ef4]">{g.label}</h3>
          <ul className="border-t-2 border-[#15171c]" role="list">
            {g.items.map((s) => (
          <li key={s.name} className="border-b border-[#d9dee5]">
            <NavLink
              href={s.href}
              data-gtm-cta={`classic_service_${s.href.split("/").filter(Boolean).pop()}`}
              className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 py-6 md:grid-cols-[minmax(0,460px)_1fr_auto] md:py-7"
            >
              <h3 className="col-start-1 row-start-1 flex items-center gap-3 text-[20px] font-[800] tracking-[-0.04em] transition-colors group-hover:text-[#256ef4] md:gap-4 md:text-[26px]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8efff] text-[#256ef4] md:h-12 md:w-12">
                  <s.icon aria-hidden className="size-5 md:size-6" />
                </span>
                {s.name}
              </h3>
              <p className="col-start-1 row-start-2 pl-[52px] text-[16px] text-[#5b6370] md:col-start-2 md:row-start-1 md:pl-0 md:text-[17px]">
                {s.what}
              </p>
              <ArrowUpRight
                size={28}
                aria-hidden
                className="col-start-2 row-span-2 row-start-1 self-center text-[#6b7280] transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#256ef4] md:col-start-3 md:row-span-1"
              />
            </NavLink>
          </li>
        ))}
      </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Process() {
  const [kind, setKind] = useState<"make" | "care">("care");
  return (
    <section
      aria-labelledby="c-process"
      className="mx-auto w-full max-w-[1248px] scroll-mt-16 px-4 py-20 md:scroll-mt-[76px] md:px-6 md:py-28"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="c-process" className={h2}>
          진행 절차
        </h2>
        <div className="inline-flex rounded-md border border-[#d9dee5] p-1" role="group" aria-label="절차 선택">
          {([["care", "유지보수"], ["make", "홈페이지 제작"]] as const).map(([k, label]) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={cn("min-h-11 rounded px-4 text-[15px] font-bold transition-colors md:px-5 md:text-[16px]", kind === k ? "bg-[#15171c] text-white" : "text-[#5b6370] hover:text-[#15171c]")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <FlowSteps steps={kind === "make" ? processSteps : maintenanceSteps} />
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
          <Link href="/faq" aria-label="자주 묻는 질문 더보기" className={cn(more, "min-h-11")}>
            더보기 <Plus size={15} strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
        <div className="mt-10">
          <FaqBlock items={homeFaq} bare />
        </div>
      </div>
    </section>
  );
}
