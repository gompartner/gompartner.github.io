import Link from "next/link";
import { ArchiveShell, DocHead, docH2 } from "@/components/classic/archive/ArchiveShell";
import type { TrendDoc } from "@/data/classic/archive";

// 디자인 트렌드, 기술 트렌드 목록(11-21). 번호 없이 독립 문서 목록
export function TrendIndex({ id, href, title, lead, docs }: { id: string; href: string; title: string; lead: string; docs: TrendDoc[] }) {
  return (
    <ArchiveShell section={id} active={href} crumbs={[{ href: "/archive", label: "아카이브" }, { href, label: title }]} toc={[{ id: "docs", label: "문서" }]}>
      <DocHead title={title} meta={[["문서", `${docs.length}개`], ["비교", "한국, 일본, 미국"]]} lead={lead} />
      <h2 id="docs" className={docH2}>문서</h2>
      <ul role="list" className="mt-3">
        {docs.map((d) => (
          <li key={d.href} className="border-b border-[#e6e9ee]">
            <Link href={d.href} className="group block py-4">
              <span className="block text-[17px] font-bold leading-[1.45] group-hover:text-[#256ef4] group-hover:underline underline-offset-4">{d.title}</span>
              <span className="mt-1 block text-[14px] leading-[1.55] text-[#5b6370]">{d.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </ArchiveShell>
  );
}
