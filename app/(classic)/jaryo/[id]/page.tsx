import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { JaryoButtons, JaryoList, JaryoPreview } from "@/components/classic/JaryoParts";
import { PageHead, wrap } from "@/components/classic/ui";
import { jaryo } from "@/data/classic/jaryo";
import { pageMeta } from "@/lib/seo";

// 자료 한 장. 인스타 댓글 단어(견적, 점검, AI)로 DM을 받은 사람이 /go/jaryo/<id>/ 를 거쳐 들어온다. 검색에서 뺀다
// 자료 본문은 1쪽, 2쪽 그림으로 이 페이지에서 바로 보여 준다(11-03 노션 쓰지 않기로)
export function generateStaticParams() {
  return jaryo.map((j) => ({ id: j.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const it = jaryo.find((j) => j.id === id);
  if (!it) return {};
  return {
    ...pageMeta({
      title: it.title,
      description: `${it.title}. ${it.parts.join(", ")}. 휴대폰으로 보고 PDF로 받을 수 있어요.`,
      path: `/jaryo/${it.id}`,
      image: { src: "/og/jaryo.png", alt: "곰파트너 무료 자료" },
    }),
    robots: { index: false, follow: false },
  };
}

export default async function ClassicJaryoItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const it = jaryo.find((j) => j.id === id);
  if (!it) notFound();
  const others = jaryo.filter((j) => j.id !== it.id);

  return (
    <>
      <PageHead
        title={it.title}
        trail={[
          { href: "/jaryo", label: "무료 자료" },
          { href: `/jaryo/${it.id}`, label: it.title },
        ]}
      />

      <section aria-label={it.title} className="bg-[#f4f6f9]">
        <div className={`${wrap} py-12 md:py-16`}>
          <div className="grid overflow-hidden rounded-lg border border-[#d9dee5] bg-white lg:grid-cols-[1.1fr_1fr]">
            <div className="border-b border-[#d9dee5] lg:border-b-0 lg:border-r">
              <JaryoPreview it={it} size="lg" priority />
            </div>
            <div className="flex flex-col p-6 md:p-10">
              <p className="text-[15px] font-bold text-[#256ef4]">
                {it.when}, <span className="text-[#5b6370]">PDF 2쪽</span>
              </p>
              <h2 className="mt-2 text-[26px] font-[800] leading-[1.3] tracking-[-0.04em] md:text-[32px]">들어 있는 것</h2>
              <div className="mt-5">
                <JaryoList it={it} />
              </div>
              <div className="mt-8">
                <JaryoButtons it={it} view={false} />
              </div>
            </div>
          </div>

          <h2 className="mt-14 text-[22px] font-[800] tracking-[-0.04em] md:text-[26px]">자료 보기</h2>
          <ol className="mt-5 grid gap-6 lg:grid-cols-2" role="list">
            {[1, 2].map((n) => (
              <li key={n}>
                <p className="mb-2 text-[15px] font-bold text-[#5b6370]">{n}쪽</p>
                <Image
                  src={`/images/jaryo/${it.id}-${n}-full.jpg`}
                  alt={`${it.title} ${n}쪽`}
                  width={1240}
                  height={1754}
                  className="block h-auto w-full rounded-md border border-[#d9dee5] bg-white shadow-[0_6px_20px_rgba(15,27,61,0.08)]"
                />
              </li>
            ))}
          </ol>

          <h2 className="mt-14 text-[22px] font-[800] tracking-[-0.04em] md:text-[26px]">다른 자료</h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-2" role="list">
            {others.map((o) => (
              <li key={o.id}>
                <Link href={`/jaryo/${o.id}`} className="group flex items-center justify-between gap-4 rounded-lg border border-[#d9dee5] bg-white p-5 transition-colors hover:border-[#256ef4] md:p-6">
                  <span>
                    <span className="block text-[14px] font-bold text-[#256ef4]">{o.when}</span>
                    <span className="mt-1 block text-[18px] font-[800] tracking-[-0.03em] group-hover:text-[#256ef4] md:text-[20px]">{o.title}</span>
                  </span>
                  <ArrowRight size={22} aria-hidden className="shrink-0 text-[#6b7280] group-hover:text-[#256ef4]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
