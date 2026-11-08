import type { Metadata } from "next";
import Link from "next/link";
import { JaryoButtons, JaryoList, JaryoPreview } from "@/components/classic/JaryoParts";
import { PageHead, wrap } from "@/components/classic/ui";
import { jaryo } from "@/data/classic/jaryo";
import { pageMeta } from "@/lib/seo";

// 11-03 인스타 '자료' 댓글 DM으로 들어오는 페이지(짧은 주소 /go/jaryo/ 가 여기로 넘긴다).
// 메뉴, sitemap, 검색에서 뺀다. 자료 한 장짜리는 /jaryo/<id>(1쪽, 2쪽 그림과 PDF)
export const metadata: Metadata = {
  ...pageMeta({
    title: "무료 자료",
    description: "홈페이지 견적 질문지, 우리 홈페이지 점검표, 사장님 AI 부탁 문장. 휴대폰으로 보고 PDF로 받을 수 있어요.",
    path: "/jaryo",
    image: { src: "/og/jaryo.png", alt: "곰파트너 무료 자료" },
  }),
  robots: { index: false, follow: false },
};

export default function ClassicJaryoPage() {
  return (
    <>
      <PageHead title="무료 자료" trail={[{ href: "/jaryo", label: "무료 자료" }]} />

      <section aria-labelledby="jaryo-list" className="bg-[#f4f6f9]">
        <div className={`${wrap} py-12 md:py-16`}>
          <h2 id="jaryo-list" className="sr-only">
            자료 목록
          </h2>
          <ul className="grid gap-6 lg:grid-cols-3" role="list">
            {jaryo.map((it, i) => (
              <li key={it.id} className="flex flex-col overflow-hidden rounded-lg border border-[#d9dee5] bg-white">
                <Link href={`/jaryo/${it.id}`} aria-label={`${it.title} 자세히`} className="block border-b border-[#d9dee5]">
                  <JaryoPreview it={it} priority={i === 0} />
                </Link>
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  <p className="text-[14px] font-bold text-[#256ef4]">
                    {it.when}, <span className="text-[#5b6370]">PDF {it.pages ?? 2}쪽</span>
                  </p>
                  <h3 className="mt-1.5 text-[22px] font-[800] leading-[1.35] tracking-[-0.04em] md:text-[24px]">
                    <Link href={`/jaryo/${it.id}`} className="hover:text-[#256ef4]">
                      {it.title}
                    </Link>
                  </h3>
                  <div className="mt-4">
                    <JaryoList it={it} />
                  </div>
                  <div className="mt-auto pt-6">
                    <JaryoButtons it={it} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
