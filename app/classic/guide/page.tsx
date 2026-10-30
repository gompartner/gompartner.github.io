import type { Metadata } from "next";
import Link from "next/link";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { guideCategory, guides } from "@/data/classic/guides";
import { fitDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: "운영 가이드",
  description: fitDescription("홈페이지 계약 전 확인할 것, PHP 보안 점검, 장애 대응, 웹 접근성과 점검 결과 읽는 법을 정리했습니다."),
  alternates: { canonical: "/classic/guide" },
};

const dot = (d: string) => d.replaceAll("-", ".");

// 운영 가이드 목록. 공지사항과 같은 게시판 형식(번호, 분류, 제목, 날짜).
export default function ClassicGuidePage() {
  const list = [...guides].sort((a, b) => b.published.localeCompare(a.published));
  return (
    <>
      <PageHead title="운영 가이드" trail={[{ href: "/classic/guide", label: "운영 가이드" }]} />
      <SupportTabs current="/classic/guide" />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <p className="mb-4 text-[15px] text-[#5b6370]">
          전체 <span className="font-bold tabular-nums text-[#15171c]">{list.length}</span>건
        </p>
        <table className="w-full border-collapse border-t-2 border-[#15171c]">
          <caption className="sr-only">운영 가이드 목록</caption>
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-[#e6e9ee] bg-[#f6f7f9] text-[15px] text-[#3d4450]">
              <th scope="col" className="w-20 py-4 font-bold">
                번호
              </th>
              <th scope="col" className="w-32 py-4 font-bold">
                분류
              </th>
              <th scope="col" className="py-4 text-left font-bold">
                제목
              </th>
              <th scope="col" className="w-32 py-4 font-bold">
                날짜
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((g, i) => (
              <tr key={g.slug} className="border-b border-[#e6e9ee]">
                <td className="hidden py-5 text-center text-[15px] tabular-nums text-[#6b7280] md:table-cell">{list.length - i}</td>
                <td className="hidden py-5 text-center text-[15px] font-bold text-[#256ef4] md:table-cell">{guideCategory[g.slug] ?? "운영"}</td>
                <td className="py-5 pr-4 md:pr-6">
                  <span className="mb-1 block text-[14px] font-bold text-[#256ef4] md:hidden">{guideCategory[g.slug] ?? "운영"}</span>
                  <Link href={`/classic/guide/${g.slug}`} className="text-[17px] font-bold leading-[1.5] tracking-[-0.02em] hover:text-[#256ef4] hover:underline md:text-[18px]">
                    {g.title}
                  </Link>
                  <time dateTime={g.published} className="mt-1 block text-[14px] tabular-nums text-[#6b7280] md:hidden">
                    {dot(g.published)}
                  </time>
                </td>
                <td className="hidden py-5 text-center text-[15px] tabular-nums text-[#6b7280] md:table-cell">
                  <time dateTime={g.published}>{dot(g.published)}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
