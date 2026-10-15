import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PageHead, SubTabs, h2, wrap } from "@/components/classic/ui";
import { SampleGrid } from "@/components/classic/works/SampleGrid";
import { samplesIn, worksTabs } from "@/components/classic/works/samples";
import { industries } from "@/data/classic/industries";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industries.map((ind) => ({ slug: ind.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ind = industries.find((i) => i.slug === slug);
  if (!ind) return {};
  return { title: `${ind.title} 비용과 샘플` };
}

export default async function ClassicIndustryPage({ params }: Props) {
  const { slug } = await params;
  const ind = industries.find((i) => i.slug === slug);
  if (!ind) notFound();
  const list = samplesIn(slug);
  const href = `/classic/works/${slug}`;

  return (
    <>
      <PageHead
        title={ind.label}
        trail={[
          { href: "/classic/works", label: "샘플" },
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
          <h3 className="border-b-2 border-[#15171c] pb-3 text-[18px] font-extrabold tracking-[-0.02em]">많이 넣는 기능</h3>
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
              샘플
            </h2>
            <span className="text-[16px] font-bold tabular-nums text-[#5b6370] md:text-[18px]">{list.length}개</span>
          </div>
          <div className="mt-8 md:mt-10">
            <SampleGrid items={list} />
          </div>
        </div>
      </section>
    </>
  );
}
