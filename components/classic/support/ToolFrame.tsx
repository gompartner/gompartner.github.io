import Link from "next/link";
import { TrendNav } from "@/components/classic/archive/TrendNav";
import { ArchiveShell, DocHead } from "@/components/classic/archive/ArchiveShell";
import { tools } from "@/data/classic/tools";

// 무료 도구 페이지 틀(11-21 아카이브 틀로): 왼쪽 분류 트리, 제목, 도구 본체. 도구 컴포넌트 안쪽 꾸밈은 손대지 않는다.
export function ToolFrame({ href, children }: { href: string; children: React.ReactNode }) {
  const tool = tools.find((t) => t.href === href);
  const title = tool?.title ?? "무료 도구";
  return (
    <ArchiveShell
      section="checklists"
      active={href}
      crumbs={[
        { href: "/knowledge", label: "웹 지식" },
        { href: "/knowledge/checklists", label: "점검표와 도구" },
        { href, label: title },
      ]}
    >
      <DocHead title={title} meta={tool ? [["분류", tool.category], ["대상", tool.for]] : undefined} lead={tool?.description} />
      <div className="mt-8">{children}</div>
      {tool?.tags?.length ? (
        // 11-22 관련 검색어: 누르면 사이트 검색으로 같은 주제의 글과 용어를 찾는다
        <div className="mt-12 border-t border-[#e6e9ee] pt-5">
          <h2 className="text-[15px] font-bold text-[#15171c]">관련 검색어</h2>
          <ul role="list" className="mt-3 flex flex-wrap gap-2">
            {tool.tags.map((t) => (
              <li key={t}>
                <Link href={`/search?q=${encodeURIComponent(t)}`} className="inline-flex h-9 items-center rounded-md border border-[#d9dee5] px-3 text-[14px] text-[#3d4450] hover:border-[#256ef4] hover:text-[#256ef4]">
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <TrendNav current={href} />
    </ArchiveShell>
  );
}
