import type { Metadata } from "next";
import { PageHead, SubTabs, h2, wrap } from "@/components/classic/ui";
import { SampleGrid } from "@/components/classic/works/SampleGrid";
import { demoProjects, groups, homepageProjects, samplesIn, worksTabs } from "@/components/classic/works/samples";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "홈페이지 제작 카탈로그",
  description: `업종별 홈페이지, 광고 랜딩페이지, 업무 프로그램, 유지보수 카탈로그 ${demoProjects.length}개. 실제 동작하는 화면을 직접 체험할 수 있습니다.`,
  path: "/classic/works",
});

export default function ClassicWorksPage() {
  return (
    <>
      <PageHead title="카탈로그" trail={[{ href: "/classic/works", label: "카탈로그" }]} />
      <SubTabs items={worksTabs} current="/classic/works" />
      {[
        { id: "c-all", title: "업종별 홈페이지", items: homepageProjects },
        ...groups.map((g) => ({ id: `c-${g.slug}`, title: g.label, items: samplesIn(g.slug) })),
      ].map((sec, n) => (
        <section key={sec.id} aria-labelledby={sec.id} className={`${wrap} ${n === 0 ? "py-14 md:py-20" : "pb-14 md:pb-20"}`}>
          <div className="flex items-baseline gap-3 border-b-2 border-[#15171c] pb-4">
            <h2 id={sec.id} className={h2}>
              {sec.title}
            </h2>
            <span className="text-[16px] font-bold tabular-nums text-[#5b6370] md:text-[18px]">{sec.items.length}개</span>
          </div>
          <div className="mt-8 md:mt-10">
            <SampleGrid items={sec.items} />
          </div>
        </section>
      ))}
    </>
  );
}
