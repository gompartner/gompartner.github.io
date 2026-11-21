import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveShell, DocHead, docH2 } from "@/components/classic/archive/ArchiveShell";
import { trendDocs } from "@/data/classic/archive";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "트렌드 | 아카이브",
  description: "브라우저, 모바일, https, 플래시, 만드는 도구, 페이지 무게로 본 웹의 20년. 한국, 일본, 미국을 차트와 실제 사례로 비교합니다.",
  path: "/archive/trends",
});

export default function ArchiveTrends() {
  return (
    <ArchiveShell section="trends" active="/archive/trends" crumbs={[{ href: "/archive", label: "아카이브" }, { href: "/archive/trends", label: "트렌드" }]} toc={[{ id: "series", label: "같은 20년, 세 나라의 홈페이지" }]}>
      <DocHead title="트렌드" meta={[["문서", `${trendDocs.length}편`], ["비교", "한국, 일본, 미국"]]} lead="같은 기술이 나라마다 다른 속도로 퍼졌습니다. 그 차이가 지금 넘겨받는 사이트에 무엇을 남겼는지 차트와 와이어프레임으로 정리합니다." />
      <h2 id="series" className={docH2}>같은 20년, 세 나라의 홈페이지</h2>
      <ol className="mt-3">
        {trendDocs.map((d, i) => (
          <li key={d.href} className="border-b border-[#e6e9ee]">
            <Link href={d.href} className="group grid grid-cols-[44px_minmax(0,1fr)] gap-x-2 py-4">
              <span className="text-[13.5px] font-bold text-[#256ef4]">{i + 1}장</span>
              <span>
                <span className="block text-[17px] font-bold leading-[1.45] group-hover:text-[#256ef4] group-hover:underline underline-offset-4">{d.title}</span>
                <span className="mt-1 block text-[14px] leading-[1.55] text-[#5b6370]">{d.desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </ArchiveShell>
  );
}
