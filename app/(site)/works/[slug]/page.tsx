import type { Metadata } from "next";
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
    title: `${ind.title} 사례`,
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
      <div className="mx-auto w-full max-w-[1248px] px-4 py-10 md:px-6 md:py-14">
        <p className="text-[15px] font-bold text-accent">
          <Link href="/works" className="underline-offset-4 hover:underline">
            제작 사례
          </Link>{" "}
          · {ind.label}
        </p>
        <h1 className="mt-1 text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">{ind.title} 사례</h1>
        <p className="mt-2 max-w-[760px] text-[17px] leading-[1.6] text-foreground-secondary">{ind.description}</p>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label={`${ind.label} 홈페이지에 많이 넣는 기능`}>
          {ind.needs.map((n) => (
            <li key={n} className="flex items-center gap-2 rounded-[10px] bg-surface px-4 py-3 text-[17px] font-bold">
              <Check size={20} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden />
              {n}
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <WorksGrid projects={list} />
        </div>
      </div>
      <PricingSection cta={`industry_${ind.slug}_chat`} />
    </>
  );
}
