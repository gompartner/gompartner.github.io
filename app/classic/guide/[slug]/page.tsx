import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead, wrap } from "@/components/classic/ui";
import { GuideBody } from "@/components/guide/GuideBody";
import { guideBySlug, guides } from "@/data/classic/guides";
import { fitDescription } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  return { title: g.title, description: fitDescription(g.description), alternates: { canonical: `/guide/${g.slug}` } };
}

export default async function ClassicGuideArticlePage({ params }: Props) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const others = guides.filter((o) => o.slug !== g.slug).slice(0, 3);
  return (
    <>
      <PageHead title="가이드" trail={[{ href: "/classic/faq", label: "고객지원" }, { href: "/classic/guide", label: "가이드" }]} />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <h1 className="max-w-[760px] text-[28px] font-extrabold leading-[1.35] tracking-[-0.04em] md:text-[38px]">{g.title}</h1>
        <div className="mt-4 text-[#15171c]">
          <GuideBody guide={g} look="classic" />
        </div>
        <nav aria-label="다른 가이드" className="mt-14 max-w-[760px] border-t-2 border-[#15171c] pt-6">
          <ul className="space-y-3" role="list">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/classic/guide/${o.slug}`} className="text-[17px] font-bold hover:text-[#256ef4]">
                  {o.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
