import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead, btnLine, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { GuideBody } from "@/components/guide/GuideBody";
import { guideBySlug, guideCategory, guides } from "@/data/classic/guides";
import { fitDescription } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  return { title: g.title, description: fitDescription(g.description), alternates: { canonical: `/classic/guide/${g.slug}` } };
}

const dot = (d: string) => d.replaceAll("-", ".");

// 운영 가이드 글. 공지사항 글과 같은 머리(분류, 제목, 날짜)와 이전 글, 다음 글, 목록 버튼.
export default async function ClassicGuideArticlePage({ params }: Props) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  const list = [...guides].sort((a, b) => b.published.localeCompare(a.published));
  const i = list.indexOf(g);
  const newer = list[i - 1];
  const older = list[i + 1];
  return (
    <>
      <PageHead
        title="운영 가이드"
        trail={[
          { href: "/classic/notice", label: "고객지원" },
          { href: "/classic/guide", label: "운영 가이드" },
          { href: `/classic/guide/${g.slug}`, label: g.title },
        ]}
      />
      <SupportTabs current="/classic/guide" />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <header className="border-y-2 border-[#15171c] border-b-[#e6e9ee] py-6 md:border-b">
          <p className="text-[15px] font-bold text-[#256ef4]">{guideCategory[g.slug] ?? "운영"}</p>
          <h2 className="mt-1 break-keep text-[24px] font-[800] leading-[1.4] tracking-[-0.03em] md:text-[30px]">{g.title}</h2>
          <time dateTime={g.published} className="mt-2 block text-[15px] tabular-nums text-[#6b7280]">
            {dot(g.published)}
          </time>
        </header>
        <div className="pt-8 text-[#15171c] md:pt-10">
          <GuideBody guide={g} look="classic" meta={false} />
        </div>
        <nav aria-label="이전 글과 다음 글" className="mt-12 border-t border-[#e6e9ee] text-[16px]">
          {[
            { label: "다음 글", item: newer },
            { label: "이전 글", item: older },
          ].map((r) => (
            <div key={r.label} className="flex gap-4 border-b border-[#e6e9ee] py-4 md:gap-8">
              <span className="w-16 shrink-0 font-bold text-[#3d4450]">{r.label}</span>
              {r.item ? (
                <Link href={`/classic/guide/${r.item.slug}`} className="min-w-0 truncate hover:text-[#256ef4] hover:underline">
                  {r.item.title}
                </Link>
              ) : (
                <span className="text-[#6b7280]">없음</span>
              )}
            </div>
          ))}
        </nav>
        <div className="mt-8 flex justify-center">
          <Link href="/classic/guide" className={btnLine}>
            목록
          </Link>
        </div>
      </div>
    </>
  );
}
