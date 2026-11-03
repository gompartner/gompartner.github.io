import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { insights, readMinutes } from "@/data/classic/insights";
import { naverPosts } from "@/data/classic/naverPosts";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "인사이트",
  description:
    "홈페이지 인수, 운영 관리, 장애 대응을 실제로 해 온 순서대로 정리한 글입니다.",
  path: "/insight",
});

// 인사이트 목록. 토스, 요즘IT 글 목록처럼 왼쪽에 묶음 이름, 제목, 요약, 읽는 시간, 오른쪽에 대표 이미지(11-02). 날짜는 화면에 두지 않는다(11-02, 오래 읽는 글이라 편 순서로만). date는 사이트맵과 메타에만 쓴다.
export default function ClassicInsightPage() {
  return (
    <>
      <PageHead
        title="인사이트"
        trail={[{ href: "/notice", label: "고객지원" }, { href: "/insight", label: "인사이트" }]}
      />
      <SupportTabs current="/insight" />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <p className="mb-4 text-[15px] text-[#5b6370]">
          전체{" "}
          <span className="font-bold tabular-nums text-[#15171c]">
            {insights.length}
          </span>
          건
        </p>
        <ul className="border-t-2 border-[#15171c]" role="list">
          {insights.map((n) => (
            <li key={n.slug} className="border-b border-[#e6e9ee]">
              <Link
                href={`/insight/${n.slug}`}
                className="group flex items-start gap-4 py-6 md:gap-10 md:py-8"
              >
                <div className="min-w-0 flex-1">
                  <span className="inline-flex h-7 items-center rounded bg-[#eef4ff] px-2.5 text-[13px] font-bold text-[#1d5fd6]">
                    {n.series} {n.no}편
                  </span>
                  <span className="mt-2.5 block text-[18px] font-[800] leading-[1.45] tracking-[-0.02em] group-hover:text-[#256ef4] group-hover:underline md:text-[22px]">
                    {n.title}
                  </span>
                  <span className="mt-2 hidden text-[16px] leading-[1.6] text-[#5b6370] md:block">
                    {n.summary}
                  </span>
                  <span className="mt-2 block text-[14px] tabular-nums text-[#6b7280]">
                    읽는 시간 {readMinutes(n)}분
                  </span>
                </div>
                <Image
                  src={n.image.src}
                  alt={n.title}
                  width={1200}
                  height={675}
                  sizes="(min-width: 768px) 280px, 120px"
                  className="mt-1 w-[120px] shrink-0 rounded-md border border-[#e6e9ee] md:w-[280px]"
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* 11-04 네이버 블로그 글 목록. 구글이 blog.naver.com 글을 찾도록 각 글 주소를 그대로 건다(ops/naver-posts.mjs로 갱신) */}
        <section aria-labelledby="naver-posts" className="mt-16 md:mt-24">
          <h2 id="naver-posts" className="text-[22px] font-[800] tracking-[-0.02em] md:text-[26px]">
            네이버 블로그
          </h2>
          <p className="mt-2 text-[15px] text-[#5b6370]">
            전체{" "}
            <span className="font-bold tabular-nums text-[#15171c]">{naverPosts.length}</span>
            건
          </p>
          <ul className="mt-4 border-t-2 border-[#15171c]" role="list">
            {naverPosts.map((p) => (
              <li key={p.logNo} className="border-b border-[#e6e9ee]">
                <a
                  href={`https://blog.naver.com/gompartner/${p.logNo}`}
                  className="block py-4 text-[16px] font-bold leading-[1.5] hover:text-[#256ef4] hover:underline md:text-[17px]"
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
