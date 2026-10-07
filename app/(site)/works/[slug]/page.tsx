import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PricingSection } from "@/components/landing/PricingSection";
import { WorksGrid } from "@/components/landing/WorksGrid";
import { industries } from "@/data/industries";
import { projects } from "@/data/projects";
import { fieldsById } from "@/data/workFilters";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industries.map((ind) => ({ slug: ind.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ind = industries.find((i) => i.slug === slug);
  if (!ind) return {};
  return {
    title: `${ind.title} 포트폴리오`,
    description: ind.description,
    alternates: { canonical: `/works/${slug}` },
  };
}

export default async function IndustryWorksPage({ params }: Props) {
  const { slug } = await params;
  const ind = industries.find((i) => i.slug === slug);
  if (!ind) notFound();
  const list = projects.filter((p) => (fieldsById[p.id] ?? []).includes(ind.field));

  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#1d2327]">
        <Image src={ind.image} alt={ind.imageAlt} fill priority sizes="100vw" className="-z-10 object-cover" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(17,20,23,.82)_0%,rgba(17,20,23,.45)_55%,rgba(17,20,23,.2)_100%)] md:bg-[linear-gradient(90deg,rgba(17,20,23,.78)_0%,rgba(17,20,23,.55)_45%,rgba(17,20,23,.15)_100%)]" />
        <div className="mx-auto flex min-h-[240px] w-full max-w-[1248px] flex-col justify-end px-4 pb-8 pt-20 md:min-h-[380px] md:px-6 md:pb-14">
          <p className="text-[15px] font-bold text-white/80">
            <Link href="/works" className="underline-offset-4 hover:underline">
              포트폴리오
            </Link>{" "}
            · {ind.label}
          </p>
          <h1 className="mt-1 text-[26px] font-bold leading-[1.35] tracking-[-0.01em] text-white md:text-[40px]">{ind.title} 포트폴리오</h1>
        </div>
      </section>
      <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 md:px-6 md:pb-14">
        <ul className="mt-6 grid grid-cols-2 gap-2 md:mt-8 lg:grid-cols-4" aria-label={`${ind.label} 홈페이지에 많이 넣는 기능`}>
          {ind.needs.map((n) => (
            <li key={n} className="flex items-center gap-1.5 rounded-[8px] bg-surface px-3 py-2.5 text-[14px] font-bold leading-[1.4] md:gap-2 md:rounded-[10px] md:px-4 md:py-3 md:text-[17px]">
              <Check size={18} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden />
              {n}
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <WorksGrid projects={list} />
        </div>
      </div>
      <PricingSection compact />
    </>
  );
}
