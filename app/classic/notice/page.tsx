import type { Metadata } from "next";
import Link from "next/link";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { notices } from "@/data/classic/notices";
import { fitDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: "공지사항",
  description: fitDescription("곰파트너 서비스 운영, 정책 변경, 홈페이지 개편 안내입니다."),
  alternates: { canonical: "/classic/notice" },
};

const dot = (d: string) => d.replaceAll("-", ".");

// 공지사항 목록. 일반 회사 게시판처럼 번호, 제목, 날짜를 두고 제목을 누르면 글로 간다.
export default function ClassicNoticePage() {
  return (
    <>
      <PageHead title="공지사항" trail={[{ href: "/classic/notice", label: "고객지원" }, { href: "/classic/notice", label: "공지사항" }]} />
      <SupportTabs current="/classic/notice" />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <p className="mb-4 text-[15px] text-[#5b6370]">
          전체 <span className="font-bold tabular-nums text-[#15171c]">{notices.length}</span>건
        </p>
        <table className="w-full border-collapse border-t-2 border-[#15171c]">
          <caption className="sr-only">공지사항 목록</caption>
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-[#e6e9ee] bg-[#f6f7f9] text-[15px] text-[#3d4450]">
              <th scope="col" className="w-20 py-4 font-bold">
                번호
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
            {notices.map((n, i) => (
              <tr key={n.id} className="border-b border-[#e6e9ee]">
                <td className="hidden py-5 text-center text-[15px] tabular-nums text-[#6b7280] md:table-cell">{notices.length - i}</td>
                <td className="py-5 pr-4 md:pr-6">
                  <Link href={`/classic/notice/${n.id}`} className="text-[17px] font-bold leading-[1.5] tracking-[-0.02em] hover:text-[#256ef4] hover:underline md:text-[18px]">
                    {n.title}
                  </Link>
                  <time dateTime={n.date} className="mt-1 block text-[14px] tabular-nums text-[#6b7280] md:hidden">
                    {dot(n.date)}
                  </time>
                </td>
                <td className="hidden py-5 text-center text-[15px] tabular-nums text-[#6b7280] md:table-cell">
                  <time dateTime={n.date}>{dot(n.date)}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
