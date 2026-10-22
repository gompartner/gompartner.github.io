import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideBody } from "@/components/guide/GuideBody";
import { guideBySlug, guides } from "@/data/guides";
import { pageMeta } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  return pageMeta({ title: g.title, description: g.description, path: `/guide/${g.slug}` });
}

export default async function GuideArticlePage({ params }: Props) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const others = guides.filter((o) => o.slug !== g.slug).slice(0, 3);
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-16 pt-8 md:px-6 md:pt-12">
      <Link href="/guide" className="inline-block border-[3px] border-[#1d1d1f] bg-[#fff3b0] px-3 py-1 text-[15px] font-bold hover:bg-white">
        가이드
      </Link>
      <h1 className="mt-5 max-w-[760px] text-[28px] leading-[1.35] md:text-[38px]">{g.title}</h1>
      <div className="mt-4">
        <GuideBody guide={g} look="webtoon" />
      </div>
      <nav aria-label="다른 가이드" className="mt-14 max-w-[760px] border-t-[3px] border-[#1d1d1f] pt-6">
        <ul className="space-y-3" role="list">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/guide/${o.slug}`} className="text-[17px] font-bold underline-offset-4 hover:underline">
                {o.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
