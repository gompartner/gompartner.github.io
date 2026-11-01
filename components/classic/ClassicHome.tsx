"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ChevronDown, ChevronRight, Plus } from "lucide-react";
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
  { href: "/classic/homepage", name: "홈페이지 제작", what: "병원, 매장, 전문직, 기업, 학원 반응형 홈페이지" },
  ...maintenanceServices.map((m) => ({ href: `/classic/maintenance/${m.id}`, name: m.title, what: m.term })),
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
    : p.kind === "유지보수" || ["maintenance-dashboard", "maintenance-urgent-fix", "accessibility-review"].includes(p.id)
      ? "maintenance"
      : PROGRAM_IDS.includes(p.id)
        ? "program"
        : "homepage";
const catalog = [
  { key: "homepage", href: "/classic/works", name: "업종별 홈페이지", what: "병원, 매장, 전문직, 기업, 교육 업종별 구성" },
  { key: "landing", href: "/classic/works/landing", name: "광고 랜딩페이지", what: "상담, 예약, 사전 등록 신청 페이지" },
].map((c) => ({ ...c, count: live.filter((p) => groupOf(p) === c.key).length }));

const h2 = "text-[30px] font-[800] leading-[1.25] tracking-[-0.04em] md:text-[44px]";
const more = "inline-flex items-center gap-1 text-[15px] font-bold text-[#5b6370] hover:text-[#15171c]";

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

// 첫 화면 서비스별 슬라이드(11-01): 홈페이지 제작, 유지보수. 6초마다 넘어가고, 마우스를 올리거나 포커스가 있으면 멈춘다.
// 움직임 줄이기 설정이면 자동으로 넘기지 않는다.
const heroSlides = [
  {
    key: "make",
    title: "홈페이지 제작",
    sub: "병원, 매장, 전문직 사무실, 기업, 학원 반응형 홈페이지",
    more: { href: "/classic/works", label: "카탈로그" },
    pc: "/images/site/hero-pc.jpg",
    m: "/images/site/hero-m.jpg",
  },
  {
    key: "care",
    title: "홈페이지 유지보수",
    sub: "오류 수정, 업체 이관, 보안 업데이트, 월 관리",
    more: { href: "/classic/maintenance", label: "유지보수 안내" },
    pc: "/images/site/hero-care-pc.jpg",
    m: "/images/site/hero-care-m.jpg",
  },
];

function Hero() {
  const [cur, setCur] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (hold || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setCur((c) => (c + 1) % heroSlides.length), 6000);
    return () => window.clearTimeout(t);
  }, [cur, hold]);
  return (
    <section
      aria-labelledby="c-hero"
      aria-roledescription="carousel"
      className="relative text-white"
      style={{ backgroundColor: NAVY }}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
    >
      <h1 id="c-hero" className="sr-only">
        곰파트너 홈페이지 제작과 유지보수
      </h1>
      <div className="mx-auto grid w-full max-w-[1248px] px-4 pb-20 pt-12 md:min-h-[600px] md:px-6 md:pb-24 md:pt-20">
        {heroSlides.map((sl, i) => (
          <div
            key={sl.key}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${heroSlides.length}, ${sl.title}`}
            aria-hidden={i !== cur}
            className={cn("col-start-1 row-start-1 grid items-center gap-10 transition-opacity duration-500 motion-reduce:transition-none md:grid-cols-[1fr_1.1fr] md:gap-12", i === cur ? "opacity-100" : "pointer-events-none opacity-0")}
          >
            <div>
              <p className="break-keep text-[38px] font-[800] leading-[1.15] tracking-[-0.05em] md:text-[60px]">{sl.title}</p>
              <p className="mt-5 max-w-[520px] break-keep text-[17px] leading-[1.7] text-[#c9d3e6] md:text-[19px]">{sl.sub}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/classic/contact" tabIndex={i === cur ? 0 : -1} data-gtm-cta={`classic_hero_contact_${sl.key}`} className="inline-flex h-12 items-center rounded-md bg-white px-6 text-[16px] font-bold text-[#15171c] transition-colors hover:bg-[#e8efff]">
                  상담 신청
                </Link>
                <Link href={sl.more.href} tabIndex={i === cur ? 0 : -1} className="inline-flex h-12 items-center rounded-md border border-white/40 px-6 text-[16px] font-bold text-white transition-colors hover:bg-white/10">
                  {sl.more.label}
                </Link>
              </div>
            </div>
            {/* PC 화면 위에 휴대폰 화면을 겹친다. 제작은 사이트 설계 화면, 유지보수는 월간 점검 보고 화면 */}
            <div aria-hidden className="relative aspect-[16/11] w-full">
              <div className="absolute left-0 top-0 w-[88%] overflow-hidden rounded-lg bg-white shadow-[0_30px_60px_rgba(0,0,0,.35)]">
                <div className="flex h-6 items-center gap-1.5 bg-[#e9ecf1] px-3">
                  <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
                  <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
                  <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
                </div>
                <Image src={sl.pc} alt="" width={1440} height={900} priority={i === 0} sizes="(min-width: 768px) 600px, 90vw" className="aspect-[16/10] w-full object-cover object-top" />
              </div>
              <div className="absolute bottom-0 right-0 w-[27%] overflow-hidden rounded-[18px] border-[5px] border-[#1c2a52] bg-white shadow-[0_24px_48px_rgba(0,0,0,.4)]">
                <Image src={sl.m} alt="" width={780} height={1472} sizes="180px" className="aspect-[9/17] w-full object-cover object-top" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-6 md:bottom-8">
        <div className="mx-auto flex w-full max-w-[1248px] items-center gap-2 px-4 md:px-6" role="tablist" aria-label="서비스 선택">
          {heroSlides.map((sl, i) => (
            <button
              key={sl.key}
              type="button"
              role="tab"
              aria-selected={i === cur}
              onClick={() => setCur(i)}
              className={cn("h-9 rounded-full px-4 text-[14px] font-bold transition-colors", i === cur ? "bg-white text-[#15171c]" : "bg-white/10 text-white hover:bg-white/20")}
            >
              {sl.title}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Strengths() {
  return (
    <section aria-labelledby="c-strengths" className="border-b border-[#e6e9ee]">
      <h2 id="c-strengths" className="sr-only">
        곰파트너 납품 기준
      </h2>
      <ul className="mx-auto grid w-full max-w-[1248px] gap-px px-4 py-10 sm:grid-cols-2 md:px-6 md:py-12 lg:grid-cols-4" role="list">
        {strengths.map((s) => (
          <li key={s.name} className="flex items-start gap-3 py-3 lg:px-4 lg:first:pl-0">
            <CheckCircle2 size={24} aria-hidden className="mt-0.5 shrink-0 text-[#256ef4]" />
            <span>
              <span className="block text-[18px] font-[800] tracking-[-0.03em] md:text-[19px]">{s.name}</span>
              <span className="mt-0.5 block text-[15px] text-[#5b6370]">{s.what}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Services() {
  return (
    <section aria-labelledby="c-services" className="mx-auto w-full max-w-[1248px] scroll-mt-16 px-4 py-20 md:scroll-mt-[76px] md:px-6 md:py-28">
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
              <h3 className="col-start-1 row-start-1 text-[24px] font-[800] tracking-[-0.04em] transition-colors group-hover:text-[#256ef4] md:text-[34px]">{s.name}</h3>
              <p className="col-start-1 row-start-2 text-[16px] text-[#5b6370] md:col-start-2 md:row-start-1 md:text-[17px]">{s.what}</p>
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
              <Link href={c.href} className="group flex h-full flex-col rounded-md border border-[#d9dee5] bg-white p-6 transition-colors hover:border-[#256ef4]">
                <span className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[20px] font-[800] tracking-[-0.03em] group-hover:text-[#256ef4] md:text-[22px]">{c.name}</h3>
                  <span className="shrink-0 text-[15px] font-bold tabular-nums text-[#5b6370]">{c.count}개</span>
                </span>
                <span className="mt-2 flex-1 text-[15px] leading-[1.6] text-[#5b6370] md:text-[16px]">{c.what}</span>
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
    <section aria-labelledby="c-process" className="mx-auto w-full max-w-[1248px] scroll-mt-16 px-4 py-20 md:scroll-mt-[76px] md:px-6 md:py-28">
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
                  <span className="min-w-0 flex-1 text-[17px] font-bold leading-[1.5] tracking-[-0.02em] md:text-[19px]">{f.q}</span>
                  <ChevronDown size={22} aria-hidden className="mt-0.5 shrink-0 text-[#6b7280] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <p className="pb-6 text-[16px] leading-[1.75] text-[#3d4450] md:pr-12 md:text-[17px]">{f.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

