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
      <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
        <div className="grid items-center gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
          <div>
            <p className="text-[15px] font-bold text-accent">
              <Link href="/works" className="underline-offset-4 hover:underline">
                포트폴리오
              </Link>{" "}
              · {ind.label}
            </p>
            <h1 className="mt-1 text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">{ind.title} 포트폴리오</h1>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[10px]">
            <Image src={ind.image} alt={ind.imageAlt} fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
        <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label={`${ind.label} 홈페이지에 많이 넣는 기능`}>
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
      <PricingSection />
    </>
  );
}
