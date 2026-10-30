import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { PageHead, SubTabs, h2, wrap } from "@/components/classic/ui";
import { SampleGrid } from "@/components/classic/works/SampleGrid";
import { catalogGroups, samplesIn, worksTabs } from "@/components/classic/works/samples";
import { industries } from "@/data/classic/industries";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...industries, ...catalogGroups].map((ind) => ({ slug: ind.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ind = industries.find((i) => i.slug === slug) ?? catalogGroups.find((g) => g.slug === slug);
  if (!ind) return {};
  return { ...pageMeta({ title: `${ind.title} 카탈로그`, description: ind.description, path: `/classic/works/${slug}` }), keywords: ind.keywords };
}

export default async function ClassicIndustryPage({ params }: Props) {
  const { slug } = await params;
  const ind = industries.find((i) => i.slug === slug) ?? catalogGroups.find((g) => g.slug === slug);
  if (!ind) notFound();
  const list = samplesIn(slug);
  const href = `/classic/works/${slug}`;
  // 아래쪽에 붙이는 다른 분류. 분류마다 4개만 보여 주고 나머지는 그 분류 페이지로
  const others = [...industries, ...catalogGroups].filter((c) => c.slug !== slug).map((c) => ({ slug: c.slug, label: c.label, items: samplesIn(c.slug) })).filter((c) => c.items.length > 0);

  return (
    <>
      <PageHead
        title={ind.label}
        trail={[
          { href: "/classic/works", label: "카탈로그" },
          { href, label: ind.label },
        ]}
      />
      <SubTabs items={worksTabs} current={href} />

      <section aria-labelledby="c-ind" className={`${wrap} grid gap-10 py-14 md:grid-cols-[minmax(0,1fr)_380px] md:gap-16 md:py-20`}>
        <div className="min-w-0">
          <h2 id="c-ind" className={`${h2} break-keep`}>
            {ind.title}
          </h2>
          <p className="mt-6 max-w-[680px] break-keep text-[17px] leading-[1.75] text-[#3d4450]">{ind.description}</p>
        </div>
        <div>
          <h3 className="border-b-2 border-[#15171c] pb-3 text-[18px] font-[800] tracking-[-0.02em]">자주 찾는 기능</h3>
          <ul role="list">
            {ind.needs.map((n) => (
              <li key={n} className="flex items-center gap-3 border-b border-[#e6e9ee] py-4 text-[16px] font-bold md:text-[17px]">
                <Check size={18} strokeWidth={2.5} aria-hidden className="shrink-0 text-[#256ef4]" />
                {n}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="c-ind-list" className="border-t border-[#e6e9ee] bg-[#f4f6f9]">
        <div className={`${wrap} py-14 md:py-20`}>
          <div className="flex items-baseline gap-3">
            <h2 id="c-ind-list" className={h2}>
              카탈로그
            </h2>
            <span className="text-[16px] font-bold tabular-nums text-[#5b6370] md:text-[18px]">{list.length}개</span>
          </div>
          <div className="mt-8 md:mt-10">
            <SampleGrid items={list} />
          </div>
        </div>
      </section>

      <section aria-labelledby="c-ind-more" className={`${wrap} py-14 md:py-20`}>
        <h2 id="c-ind-more" className={h2}>
          다른 분야 카탈로그
        </h2>
        {others.map((c) => (
          <div key={c.slug} className="mt-12 first-of-type:mt-8 md:mt-16">
            <div className="flex items-baseline justify-between gap-3 border-b-2 border-[#15171c] pb-4">
              <h3 className="text-[20px] font-[800] tracking-[-0.02em] md:text-[24px]">
                {c.label} <span className="ml-1 text-[15px] font-bold tabular-nums text-[#5b6370] md:text-[17px]">{c.items.length}개</span>
              </h3>
              <Link href={`/classic/works/${c.slug}`} className="inline-flex shrink-0 items-center gap-0.5 text-[15px] font-bold text-[#256ef4] hover:underline md:text-[16px]">
                전체 보기
                <ChevronRight size={16} strokeWidth={2.5} aria-hidden />
              </Link>
            </div>
            <div className="mt-6 md:mt-8">
              <SampleGrid items={c.items.slice(0, 4)} />
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
