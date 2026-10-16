import { ListScrollMemory } from "@/components/landing/ListScrollMemory";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PricingSection } from "@/components/landing/PricingSection";
import { WorksGrid } from "@/components/landing/WorksGrid";
import { IndustryCost } from "@/components/works/IndustryCost";
import { industries } from "@/data/industries";
import { projects } from "@/data/projects";
import { fieldsById } from "@/data/workFilters";
import { estimateFor, manwon } from "@/data/pricing";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industries.map((ind) => ({ slug: ind.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ind = industries.find((i) => i.slug === slug);
  if (!ind) return {};
  // 검색 결과 설명에는 가격을 넣지 않는다(가격은 페이지 안과 /pricing에).
  return {
    ...pageMeta({ title: `${ind.title} 비용·샘플`, description: ind.description, path: `/works/${slug}` }),
    keywords: ind.keywords,
  };
}

export default async function IndustryWorksPage({ params }: Props) {
  const { slug } = await params;
  const ind = industries.find((i) => i.slug === slug);
  if (!ind) notFound();
  const list = projects.filter((p) => (fieldsById[p.id] ?? []).includes(ind.field));

  const totals = list.map((p) => estimateFor(p.id)?.total).filter((n): n is number => n !== undefined);

  return (
    <>
      {/* 업종 첫 컷: 업종 사진을 컷 안에 넣고, 그 업종 사장님이 홈페이지에 바라는 것을 말풍선으로 붙인다 */}
      <section className="mx-auto w-full max-w-[1248px] px-4 pt-8 md:px-6 md:pt-12">
        <Link href="/works" className="inline-block border-[3px] border-[#1d1d1f] bg-[#fff3b0] px-3 py-1 text-[15px] font-bold hover:bg-white">
          샘플 · {ind.label}
        </Link>
        <div className="mt-5 grid items-center gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
          <figure className="relative aspect-[4/3] -rotate-1 overflow-hidden border-[3px] border-[#1d1d1f] bg-white shadow-[6px_6px_0_#1d1d1f]">
            <Image src={ind.image} alt={ind.imageAlt} fill priority sizes="(min-width: 768px) 640px, 100vw" className="object-cover" />
          </figure>
          <div>
            <h1 className="text-[34px] leading-[1.2] md:text-[52px]">{ind.title} 샘플</h1>
            <p className="mt-3 text-[17px] font-bold md:text-[19px]">
              샘플 {list.length}개{totals.length > 0 && <> · <span className="text-accent">{manwon(Math.min(...totals))}부터</span></>}
            </p>
            <ul className="mt-6 flex flex-col items-start gap-3" aria-label={`${ind.label} 홈페이지에 많이 넣는 기능`}>
              {ind.needs.map((n, i) => (
                <li
                  key={n}
                  className={`flex items-center gap-2 rounded-[22px] rounded-bl-[6px] border-[3px] border-[#1d1d1f] bg-white px-4 py-2.5 text-[16px] font-bold shadow-[3px_3px_0_#1d1d1f] md:text-[18px] ${i % 2 ? "ml-6 md:ml-10" : ""}`}
                >
                  <Check size={18} strokeWidth={3} className="shrink-0 text-accent" aria-hidden />
                  {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 md:px-6 md:pb-14">
        <div className="mt-10">
          <WorksGrid projects={list} />
          <ListScrollMemory />
        </div>
        <IndustryCost industry={ind} projects={list} />
      </div>
      <PricingSection compact />
    </>
  );
}
