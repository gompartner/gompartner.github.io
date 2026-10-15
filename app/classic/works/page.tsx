import type { Metadata } from "next";
import { PageHead, SubTabs, h2, wrap } from "@/components/classic/ui";
import { SampleGrid } from "@/components/classic/works/SampleGrid";
import { demoProjects, worksTabs } from "@/components/classic/works/samples";

export const metadata: Metadata = {
  title: "홈페이지 제작 샘플",
};

export default function ClassicWorksPage() {
  return (
    <>
      <PageHead title="샘플" trail={[{ href: "/classic/works", label: "샘플" }]} />
      <SubTabs items={worksTabs} current="/classic/works" />
      <section aria-labelledby="c-all" className={`${wrap} py-14 md:py-20`}>
        <div className="flex items-baseline gap-3 border-b-2 border-[#15171c] pb-4">
          <h2 id="c-all" className={h2}>
            전체 샘플
          </h2>
          <span className="text-[16px] font-bold tabular-nums text-[#5b6370] md:text-[18px]">{demoProjects.length}개</span>
        </div>
        <div className="mt-8 md:mt-10">
          <SampleGrid items={demoProjects} />
        </div>
      </section>
    </>
  );
}
