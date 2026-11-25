import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHead, SubTabs, h2, more, wrap } from "@/components/classic/ui";
import { serviceTabs } from "@/components/classic/pricing/tabs";
import { CatalogShelf } from "@/components/classic/works/CatalogShelf";
import { SampleGrid } from "@/components/classic/works/SampleGrid";
import { catalogGroups, catalogProjects, homepageProjects, samplesIn, shelfItems, worksTabs } from "@/components/classic/works/samples";
import { industries } from "@/data/classic/industries";
import { pageMeta } from "@/lib/seo";
import { buildCatalogIndex } from "@/components/classic/search/index";
import { CatalogSearch } from "@/components/classic/search/CatalogSearch";

export const metadata: Metadata = pageMeta({
  title: "홈페이지 제작 포트폴리오",
  description: `병원, 매장, 전문직, 기업, 학원 업종별 홈페이지 제작 포트폴리오 ${catalogProjects.length}개. 화면 구성과 주요 기능을 직접 사용해 볼 수 있습니다.`,
  path: "/works",
  noindex: true,
});

const LIMIT = 6;

export default function ClassicWorksPage() {
  return (
    <>
      <PageHead
        title="포트폴리오"
        trail={[
          { href: "/homepage", label: "제작" },
          { href: "/works", label: "포트폴리오" },
        ]}
      />
      <SubTabs items={serviceTabs} current="/works" />
      <SubTabs items={worksTabs} current="/works" level={3} />
      <CatalogShelf items={shelfItems()} />
      <CatalogSearch index={buildCatalogIndex()}>
      {[
        // 11-22 업종 홈페이지는 업종별로 묶는다(한 목록에 50개를 섞지 않는다)
        // "전체"에는 업종마다 6개까지만 두고 나머지는 업종 탭으로 넘긴다
        ...industries.map((i) => ({ id: `c-${i.slug}`, title: i.label, items: samplesIn(i.slug), href: `/works/${i.slug}` })),
        { id: "c-etc", title: "그 밖의 업종", items: homepageProjects.filter((p) => !industries.some((i) => samplesIn(i.slug).includes(p))), href: "" },
        ...catalogGroups.map((g) => ({ id: `c-${g.slug}`, title: g.label, items: samplesIn(g.slug), href: `/works/${g.slug}` })),
      ].filter((sec) => sec.items.length > 0).map((sec, n) => (
        <section key={sec.id} aria-labelledby={sec.id} className={`${wrap} ${n === 0 ? "py-14 md:py-20" : "pb-14 md:pb-20"}`}>
          <div className="flex items-baseline justify-between gap-3 border-b-2 border-[#15171c] pb-4">
            <span className="flex items-baseline gap-3">
              <h2 id={sec.id} className={h2}>
                {sec.title}
              </h2>
              <span className="text-[16px] font-bold tabular-nums text-[#5b6370] md:text-[18px]">{sec.items.length}개</span>
            </span>
            {sec.href && sec.items.length > 4 ? (
              <Link href={sec.href} className={`${more} min-h-11 shrink-0 ${sec.items.length > LIMIT ? "" : "md:hidden"}`}>
                모두 보기 <ArrowRight size={15} strokeWidth={2.5} aria-hidden />
              </Link>
            ) : null}
          </div>
          <div className="mt-8 md:mt-10">
            <SampleGrid items={sec.items.slice(0, LIMIT)} variant="mockup" mobileMax={sec.href ? 4 : undefined} />
          </div>
          {sec.href && sec.items.length > 4 ? (
            <Link href={sec.href} className={`mt-10 flex min-h-12 w-full items-center justify-center gap-1.5 rounded-lg border border-[#d9dee5] text-[16px] font-bold hover:border-[#15171c] ${sec.items.length > LIMIT ? "" : "md:hidden"}`}>
              {sec.title} {sec.items.length}개 모두 보기 <ArrowRight size={16} strokeWidth={2.5} aria-hidden />
            </Link>
          ) : null}
        </section>
      ))}
      </CatalogSearch>
    </>
  );
}
