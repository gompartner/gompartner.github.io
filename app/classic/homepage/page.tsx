import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Factory, GraduationCap, Scale, Stethoscope, Store } from "lucide-react";
import { PlanTable } from "@/components/classic/pricing/PlanTable";
import { StepList } from "@/components/classic/pricing/StepList";
import { serviceTabs } from "@/components/classic/pricing/tabs";
import { PageHead, SubTabs, h2, more, wrap } from "@/components/classic/ui";
import { SampleGrid } from "@/components/classic/works/SampleGrid";
import { demoProjects } from "@/components/classic/works/samples";
import { processSteps } from "@/data/classic/faq";
import { industries } from "@/data/classic/industries";
import { plans, runningCostNote, samplesForPlan } from "@/data/classic/pricing";
import { projects } from "@/data/classic/projects";
import { pageMeta } from "@/lib/seo";

// 홈페이지 제작 서비스 상세. 패키지 데이터(data/classic/pricing)를 쓴다.

export const metadata: Metadata = pageMeta({
  title: "홈페이지 제작",
  description: "업종별 홈페이지 제작. 소개, 문의와 예약, 맞춤 기능 세 가지 구성이며 반응형 화면, 검색엔진 등록, 원본 소스를 포함합니다.",
  path: "/classic/homepage",
});

// 패키지마다 견적 기준이 된 샘플을 두 개씩
const related = plans
  .flatMap((p) => samplesForPlan(p.id).slice(0, 2))
  .map((s) => demoProjects.find((p) => p.id === s.id))
  .filter((p) => !!p);

const section = "scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-24";

// 이 페이지의 디자인 포인트(10-30): 실제 카탈로그의 PC와 휴대폰 화면 한 쌍, 업종 아이콘
const shot = projects.find((p) => p.id === "company")!;
const shotSlug = shot.demoUrl.replace("/demo/", "");
const industryIcon = { hospital: Stethoscope, store: Store, professional: Scale, company: Factory, academy: GraduationCap } as const;

export default function ClassicHomepagePage() {
  return (
    <>
      <PageHead
        title="홈페이지 제작"
        trail={[
          { href: "/classic/homepage", label: "서비스" },
          { href: "/classic/homepage", label: "홈페이지 제작" },
        ]}
      />
      <SubTabs items={serviceTabs} current="/classic/homepage" />

      <section aria-labelledby="hp-lead" className={`${wrap} py-12 md:py-16`}>
        <div className="grid items-center gap-10 border-t-2 border-[#15171c] pt-6 md:grid-cols-[1fr_1.1fr] md:gap-12">
          <div>
            <h2 id="hp-lead" className="break-keep text-[26px] font-[800] leading-[1.35] tracking-[-0.04em] md:text-[34px]">
              검색 노출과 문의 접수까지 고려한 업종별 홈페이지
            </h2>
            <p className="mt-4 break-keep text-[16px] leading-[1.7] text-[#5b6370] md:text-[17px]">PC와 휴대폰에서 같은 내용을 각 화면에 맞게 보여 주는 반응형으로 제작합니다.</p>
          </div>
          {/* PC 화면 위에 휴대폰 화면을 겹친다. 실제 카탈로그 캡처 */}
          <div aria-hidden className="relative aspect-[16/11] w-full">
            <div className="absolute left-0 top-0 w-[88%] overflow-hidden rounded-lg border border-[#e1e5eb] bg-white shadow-[0_20px_40px_rgba(21,23,28,.12)]">
              <div className="flex h-6 items-center gap-1.5 bg-[#eef0f3] px-3">
                <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
                <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
                <span className="h-2 w-2 rounded-full bg-[#c5cbd4]" />
              </div>
              <Image src={shot.imageUrl} alt="" width={1440} height={900} sizes="(min-width: 768px) 560px, 90vw" className="aspect-[16/10] w-full object-cover object-top" />
            </div>
            <div className="absolute bottom-0 right-0 w-[27%] overflow-hidden rounded-[16px] border-[4px] border-[#15171c] bg-white shadow-[0_20px_40px_rgba(21,23,28,.2)]">
              <Image src={`/images/demos/m/${shotSlug}.jpg`} alt="" width={390} height={736} sizes="160px" className="aspect-[9/17] w-full object-cover object-top" />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="hp-whom" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="hp-whom" className={h2}>
            업종별 구성
          </h2>
          <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
            {industries.map((i) => (
              <li key={i.slug} className="border-b border-[#e6e9ee]">
                <Link href={`/classic/works/${i.slug}`} className="group relative flex flex-col gap-1 py-5 pr-8 md:flex-row md:items-center md:gap-8 md:py-6 md:pr-0">
                  <span className="flex shrink-0 items-center gap-3 text-[19px] font-[800] tracking-[-0.03em] group-hover:text-[#256ef4] md:w-[260px] md:text-[21px]">
                    {(() => {
                      const Icon = industryIcon[i.slug as keyof typeof industryIcon];
                      return Icon ? (
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8efff] text-[#256ef4]">
                          <Icon size={20} aria-hidden />
                        </span>
                      ) : null;
                    })()}
                    {i.label}
                  </span>
                  <span className="min-w-0 flex-1 text-[16px] leading-[1.6] text-[#5b6370]">{i.needs.join(", ")}</span>
                  <ChevronRight size={20} aria-hidden className="absolute right-0 top-1/2 shrink-0 -translate-y-1/2 text-[#6b7280] group-hover:text-[#256ef4] md:static md:translate-y-0" />
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
          <PlanTable plans={plans} product="홈페이지" />
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

    </>
  );
}
