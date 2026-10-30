"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { faq, processSteps } from "@/data/classic/faq";
import { projects } from "@/data/classic/projects";
import { PROGRAM_IDS } from "@/data/classic/programIds";
import { cn } from "@/lib/utils";

// 클래식 보기의 첫 화면. 딱 보면 무엇을 하는 곳이고 어떻게 진행되는지 보이게 한다(10-30):
// 하는 일 한 줄, 서비스, 진행 절차, 카탈로그 분류, 제작 방식 비교, 자주 묻는 질문.
// 카탈로그 카드는 첫 화면에 늘어놓지 않고 분류 네 칸으로만 보여 준다.

const NAVY = "#0f1b3d";

const slugOf = (demoUrl: string) => demoUrl.replace("/demo/", "");
const heroShot = projects.find((p) => p.id === "company")!;

const services = [
  { href: "/classic/homepage", name: "홈페이지 제작", what: "사업장 소개와 문의, 예약 접수를 갖춘 반응형 홈페이지" },
  { href: "/classic/landing", name: "광고 랜딩페이지", what: "광고 유입 고객의 상담 신청을 접수하고 관리하는 단일 페이지" },
  { href: "/classic/program", name: "업무 프로그램", what: "엑셀 기반 반복 업무를 웹 프로그램으로 전환" },
  { href: "/classic/maintenance", name: "유지보수", what: "정기 점검, 보안 업데이트, 장애 대응과 콘텐츠 수정" },
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

// 제작 방식 비교. 남의 서비스는 일반적인 방식만 적고 이름은 쓰지 않는다.
const compareCols = ["셀프 제작 도구", "대형 제작사", "곰파트너"];
const compareRows = [
  { label: "수행 인력", cells: ["운영자가 직접 제작", "영업, 기획, 디자인, 개발 분업", "상담부터 운영까지 한 사람이 담당"] },
  { label: "업종별 법정 고지", cells: ["운영자가 직접 확인", "업체마다 상이", "제작 전 검토 후 반영"] },
  { label: "납품물", cells: ["플랫폼 관리자 계정", "계약서에 명시된 결과물", "원본 소스, 점검 결과표, 인계 문서"] },
  { label: "사후 관리", cells: ["운영자가 직접 대응", "별도 유지보수 계약", "오픈 후 1개월 무상 하자보수"] },
];

const h2 = "text-[30px] font-[800] leading-[1.25] tracking-[-0.04em] md:text-[44px]";
const more = "inline-flex items-center gap-1 text-[15px] font-bold text-[#5b6370] hover:text-[#15171c]";

export function ClassicHome() {
  return (
    <div className="bg-white text-[#15171c]">
      <Hero />
      <Services />
      <Process />
      <Catalog />
      <Compare />
      <Faq />
    </div>
  );
}

function Hero() {
  const slug = slugOf(heroShot.demoUrl);
  return (
    <section aria-labelledby="c-hero" className="text-white" style={{ backgroundColor: NAVY }}>
      <div className="mx-auto grid w-full max-w-[1248px] items-center gap-10 px-4 pb-16 pt-12 md:min-h-[560px] md:grid-cols-[1fr_1.1fr] md:gap-12 md:px-6 md:py-20">
        <div>
          <h1 id="c-hero" className="break-keep text-[38px] font-[800] leading-[1.15] tracking-[-0.05em] md:text-[60px]">
            홈페이지 제작과
            <br />
            유지보수
          </h1>
          <p className="mt-5 max-w-[520px] break-keep text-[17px] leading-[1.7] text-[#c9d3e6] md:text-[19px]">병원, 매장, 전문직 사무실, 기업, 학원의 홈페이지와 광고 랜딩페이지, 업무 프로그램을 제작합니다. 업종별 법정 고지 검토, 화면과 웹 접근성 점검을 마치고 원본 소스와 인계 문서까지 갖춰 납품합니다.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#c-services" className="inline-flex h-12 items-center rounded-md bg-white px-6 text-[16px] font-bold text-[#15171c] transition-colors hover:bg-[#e8efff]">
              서비스 보기
            </a>
            <a href="#c-process" className="inline-flex h-12 items-center rounded-md border border-white/40 px-6 text-[16px] font-bold text-white transition-colors hover:bg-white/10">
              진행 절차
            </a>
          </div>
        </div>

        {/* PC 화면 위에 휴대폰 화면을 겹친다. 실제 카탈로그 캡처 한 장 */}
        <div aria-hidden className="relative aspect-[16/11] w-full">
          <div className="absolute left-0 top-0 w-[88%] overflow-hidden rounded-lg bg-white shadow-[0_30px_60px_rgba(0,0,0,.35)]">
            <div className="flex h-6 items-center gap-1.5 bg-[#e9ecf1] px-3">
              <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
              <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
              <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
            </div>
            <Image src={heroShot.imageUrl} alt="" width={1440} height={900} priority sizes="(min-width: 768px) 600px, 90vw" className="aspect-[16/10] w-full object-cover object-top" />
          </div>
          <div className="absolute bottom-0 right-0 w-[27%] overflow-hidden rounded-[18px] border-[5px] border-[#1c2a52] bg-white shadow-[0_24px_48px_rgba(0,0,0,.4)]">
            <Image src={`/images/demos/m/${slug}.jpg`} alt="" width={390} height={736} sizes="180px" className="aspect-[9/17] w-full object-cover object-top" />
          </div>
        </div>
      </div>
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
              <p className="col-span-2 col-start-1 row-start-2 text-[16px] text-[#5b6370] md:col-span-1 md:col-start-2 md:row-start-1 md:text-[17px]">{s.what}</p>
              <ArrowUpRight
                size={28}
                aria-hidden
                className="hidden text-[#6b7280] md:col-start-3 md:row-start-1 transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#256ef4] md:block"
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
        <p className="mt-3 text-[16px] leading-[1.65] text-[#5b6370] md:text-[17px]">분류별로 실제 동작하는 화면을 직접 체험할 수 있습니다.</p>
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
      <ol className="mt-10 grid gap-8 md:grid-cols-5 md:gap-6">
        {processSteps.map((s, n) => (
          <li key={s.title} className="border-t-2 border-[#15171c] pt-5">
            <span className="text-[15px] font-bold tabular-nums text-[#256ef4]">{n + 1}단계</span>
            <h3 className="mt-2 text-[21px] font-[800] tracking-[-0.03em]">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-[1.65] text-[#5b6370]">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Compare() {
  const th = "px-4 py-4 text-left text-[15px] font-bold md:px-5 md:text-[16px]";
  return (
    <section aria-labelledby="c-compare" className="bg-[#f4f6f9]">
      <div className="mx-auto w-full max-w-[1248px] px-4 py-20 md:px-6 md:py-28">
        <h2 id="c-compare" className={h2}>
          제작 방식 비교
        </h2>
        <div tabIndex={0} className="-mx-4 mt-10 overflow-x-auto px-4 md:mx-0 md:px-0">
          <table className="w-full min-w-[640px] border-collapse border-t-2 border-[#15171c] bg-white">
            <caption className="sr-only">셀프 제작 도구, 대형 제작사, 곰파트너 비교</caption>
            <thead>
              <tr className="border-b border-[#e6e9ee]">
                <td className="w-[150px] md:w-[200px]" />
                {compareCols.map((c, n) => (
                  <th key={c} scope="col" className={cn(th, n === compareCols.length - 1 ? "text-[#256ef4]" : "text-[#3d4450]")}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((r) => (
                <tr key={r.label} className="border-b border-[#e6e9ee]">
                  <th scope="row" className={cn(th, "text-[#3d4450]")}>
                    {r.label}
                  </th>
                  {r.cells.map((c, n) => (
                    <td key={n} className={cn("px-4 py-4 text-[16px] leading-[1.55] md:px-5 md:text-[17px]", n === r.cells.length - 1 ? "font-bold" : "text-[#5b6370]")}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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

