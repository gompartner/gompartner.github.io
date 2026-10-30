import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PlanTable } from "@/components/classic/pricing/PlanTable";
import { StepList } from "@/components/classic/pricing/StepList";
import { serviceTabs } from "@/components/classic/pricing/tabs";
import { PageHead, SubTabs, btnPrimary, h2, more, wrap } from "@/components/classic/ui";
import { SampleGrid } from "@/components/classic/works/SampleGrid";
import { demoProjects } from "@/components/classic/works/samples";
import { processSteps } from "@/data/classic/faq";
import { industries } from "@/data/classic/industries";
import { plans, contactDetail, contactTitle, runningCostNote, samplesForPlan } from "@/data/classic/pricing";
import { pageMeta } from "@/lib/seo";

// 홈페이지 제작 서비스 상세. 패키지 데이터(data/classic/pricing)를 쓴다.

export const metadata: Metadata = pageMeta({
  title: "홈페이지 제작",
  description: `${plans.map((p) => p.title).join(", ")}. 병원, 전문직 사무실, 학원, 가게, 회사 홈페이지를 업종별 카탈로그를 보고 고를 수 있습니다.`,
  path: "/classic/homepage",
});

// 패키지마다 견적 기준이 된 샘플을 두 개씩
const related = plans
  .flatMap((p) => samplesForPlan(p.id).slice(0, 2))
  .map((s) => demoProjects.find((p) => p.id === s.id))
  .filter((p) => !!p);

const section = "scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-32";

export default function ClassicHomepagePage() {
  return (
    <>
      <PageHead
        title="홈페이지 제작"
        trail={[
          { href: "/classic/landing", label: "서비스" },
          { href: "/classic/homepage", label: "홈페이지 제작" },
        ]}
      />
      <SubTabs items={serviceTabs} current="/classic/homepage" />

      <section aria-labelledby="hp-lead" className={`${wrap} py-12 md:py-16`}>
        <div className="flex flex-col gap-6 border-t-2 border-[#15171c] pt-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="hp-lead" className="break-keep text-[26px] font-extrabold leading-[1.35] tracking-[-0.04em] md:text-[34px]">
              우리 가게를 검색하면 나오는 홈페이지
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/classic/contact" className={btnPrimary}>
              상담 신청
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="hp-whom" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="hp-whom" className={h2}>
            이런 곳에 맞아요
          </h2>
          <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
            {industries.map((i) => (
              <li key={i.slug} className="border-b border-[#e6e9ee]">
                <Link href={`/classic/works/${i.slug}`} className="group flex flex-col gap-1 py-5 md:flex-row md:items-center md:gap-8 md:py-6">
                  <span className="shrink-0 text-[19px] font-extrabold tracking-[-0.03em] group-hover:text-[#256ef4] md:w-[220px] md:text-[21px]">{i.label}</span>
                  <span className="min-w-0 flex-1 text-[16px] leading-[1.6] text-[#5b6370]">{i.needs.join(", ")}</span>
                  <ChevronRight size={20} aria-hidden className="hidden shrink-0 text-[#6b7280] group-hover:text-[#256ef4] md:block" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="plans" aria-labelledby="hp-plans" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="hp-plans" className={h2}>
            패키지
          </h2>
          <PlanTable plans={plans} product="홈페이지" ctaPrefix="classic_homepage_chat" />
          <p className="mt-6 text-[15px] leading-[1.65] text-[#5b6370] md:text-[16px]">{runningCostNote}</p>
        </div>
      </section>

      {related.length > 0 && (
        <section id="samples" aria-labelledby="hp-samples" className={section}>
          <div className={`${wrap} py-16 md:py-24`}>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="hp-samples" className={h2}>
                카탈로그
              </h2>
              <Link href="/classic/works" className={more}>
                전체 카탈로그 <ChevronRight size={16} aria-hidden />
              </Link>
            </div>
            <div className="mt-10">
              <SampleGrid items={related} cols={3} />
            </div>
          </div>
        </section>
      )}

      <StepList steps={processSteps} title="진행 절차" id="process" />

      <section aria-labelledby="hp-band" className="text-white" style={{ backgroundColor: "#256ef4" }}>
        <div className={`${wrap} flex flex-col gap-8 py-16 md:flex-row md:items-center md:justify-between md:py-20`}>
          <div className="max-w-[640px]">
            <h2 id="hp-band" className="text-[30px] font-extrabold leading-[1.25] tracking-[-0.04em] md:text-[40px]">
              {contactTitle}
            </h2>
            <p className="mt-3 text-[16px] leading-[1.65] text-white md:text-[17px]">{contactDetail}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/classic/contact" data-gtm-cta="classic_homepage_band_contact" className="inline-flex h-14 items-center rounded-md border border-white/60 px-7 text-[17px] font-bold hover:bg-white/10">
              상담 신청
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
