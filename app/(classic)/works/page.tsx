import type { Metadata } from "next";
import { PageHead, SubTabs, h2, wrap } from "@/components/classic/ui";
import { SampleGrid } from "@/components/classic/works/SampleGrid";
import { catalogGroups, catalogProjects, homepageProjects, samplesIn, worksTabs } from "@/components/classic/works/samples";
import { industries } from "@/data/classic/industries";
import { pageMeta } from "@/lib/seo";
import { buildCatalogIndex } from "@/components/classic/search/index";
import { CatalogSearch } from "@/components/classic/search/CatalogSearch";

export const metadata: Metadata = pageMeta({
  title: "홈페이지 제작 카탈로그",
  description: `병원, 매장, 전문직, 기업, 학원 업종별 홈페이지 제작 카탈로그 ${catalogProjects.length}개. 화면 구성과 주요 기능을 직접 사용해 볼 수 있습니다.`,
  path: "/works",
  noindex: true,
});

export default function ClassicWorksPage() {
  return (
    <>
      <PageHead title="카탈로그" trail={[{ href: "/works", label: "카탈로그" }]} />
      <SubTabs items={worksTabs} current="/works" />
      <CatalogSearch index={buildCatalogIndex()}>
      {[
        // 11-22 업종 홈페이지는 업종별로 묶는다(한 목록에 50개를 섞지 않는다)
        ...industries.map((i) => ({ id: `c-${i.slug}`, title: i.label, items: samplesIn(i.slug) })),
        { id: "c-etc", title: "그 밖의 업종", items: homepageProjects.filter((p) => !industries.some((i) => samplesIn(i.slug).includes(p))) },
        ...catalogGroups.map((g) => ({ id: `c-${g.slug}`, title: g.label, items: samplesIn(g.slug) })),
      ].filter((sec) => sec.items.length > 0).map((sec, n) => (
        <section key={sec.id} aria-labelledby={sec.id} className={`${wrap} ${n === 0 ? "py-14 md:py-20" : "pb-14 md:pb-20"}`}>
          <div className="flex items-baseline gap-3 border-b-2 border-[#15171c] pb-4">
            <h2 id={sec.id} className={h2}>
              {sec.title}
            </h2>
            <span className="text-[16px] font-bold tabular-nums text-[#5b6370] md:text-[18px]">{sec.items.length}개</span>
          </div>
          <div className="mt-8 md:mt-10">
            <SampleGrid items={sec.items} variant="mockup" />
          </div>
        </section>
      ))}
      </CatalogSearch>
    </>
  );
}
