import Link from "next/link";
import { List } from "lucide-react";
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
        { href: "/archive", label: "아카이브" },
        { href: "/archive/checklists", label: "점검표와 도구" },
        { href, label: title },
      ]}
    >
      <DocHead title={title} meta={tool ? [["분류", tool.category], ["대상", tool.for]] : undefined} lead={tool?.description} />
      <div className="mt-8">{children}</div>
      <div className="mt-14 flex justify-end border-t border-[#e6e9ee] pt-6">
        <Link
          href="/archive/checklists#tools"
          className="inline-flex h-12 items-center gap-2 rounded-md border border-[#c9cfd8] bg-white px-5 text-[16px] font-bold text-[#15171c] transition-colors hover:border-[#15171c]"
        >
          <List size={18} aria-hidden />
          목록
        </Link>
      </div>
    </ArchiveShell>
  );
}
