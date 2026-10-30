import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { StepList } from "@/components/classic/pricing/StepList";
import { PageHead, h2, wrap } from "@/components/classic/ui";
import { SampleGrid } from "@/components/classic/works/SampleGrid";
import { demoProjects, isProgram, slugOf } from "@/components/classic/works/samples";
import { processSteps } from "@/data/classic/faq";
import { pageMeta } from "@/lib/seo";

// 업무 프로그램 샘플: 견적표가 없고, 유지보수와 랜딩페이지가 아닌 샘플.
const programs = demoProjects.filter(isProgram);

export const metadata: Metadata = pageMeta({
  title: "업무 프로그램 제작",
  description: "주문 취합, 쇼핑몰 관리자, 결과지 출력처럼 엑셀로 하던 반복 업무를 웹 프로그램으로 만듭니다. 견적은 범위 확인 뒤 안내합니다.",
  path: "/classic/program",
});

const section = "scroll-mt-20 border-t border-[#e6e9ee] md:scroll-mt-24";

export default function ClassicProgramPage() {
  return (
    <>
      <PageHead
        title="업무 프로그램"
        trail={[
          { href: "/classic/homepage", label: "서비스" },
          { href: "/classic/program", label: "업무 프로그램" },
        ]}
      />

      <section aria-labelledby="pg-price" className={`${wrap} py-12 md:py-16`}>
        <div className="flex flex-col gap-6 border-t-2 border-[#15171c] pt-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="pg-price" className="text-[15px] font-bold text-[#3d4450]">
              금액
            </h2>
            <p className="mt-1 text-[28px] font-[800] tracking-[-0.03em] text-[#256ef4] md:text-[34px]">별도 견적</p>
            <p className="mt-1 text-[16px] leading-[1.6] text-[#5b6370]">필요한 화면 수와 사용자 범위를 확인한 뒤 견적과 일정을 안내합니다.</p>
          </div>
        </div>
      </section>

      <section id="samples" aria-labelledby="pg-samples" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="pg-samples" className={h2}>
            카탈로그
          </h2>
          <div className="mt-10">
            <SampleGrid items={programs} cols={3} />
          </div>
        </div>
      </section>

      <section id="features" aria-labelledby="pg-features" className={section}>
        <div className={`${wrap} py-16 md:py-24`}>
          <h2 id="pg-features" className={h2}>
            구현 사례
          </h2>
          <ul className="mt-10 border-t-2 border-[#15171c]" role="list">
            {programs.map((p) => (
              <li key={p.id} className="flex flex-col gap-3 border-b border-[#e6e9ee] py-5 md:flex-row md:gap-8 md:py-6">
                <Link href={`/classic/sample/${slugOf(p.demoUrl)}`} className="group shrink-0 md:w-[260px]">
                  <span className="block text-[14px] font-bold text-[#256ef4]">{p.category}</span>
                  <span className="mt-0.5 block break-keep text-[17px] font-bold leading-[1.4] group-hover:underline">{p.title}</span>
                </Link>
                <ul className="flex min-w-0 flex-wrap gap-x-6 gap-y-2 text-[16px] md:pt-5" role="list">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <Check size={18} strokeWidth={2.5} aria-hidden className="mt-[3px] shrink-0 text-[#256ef4]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StepList steps={processSteps} title="진행 절차" id="process" />

    </>
  );
}
