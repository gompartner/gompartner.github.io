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
      <TrendNav current={href} />
    </ArchiveShell>
  );
}
