import Link from "next/link";
import { List } from "lucide-react";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { tools } from "@/data/classic/tools";

// 자료실 도구 페이지 틀: 클래식 배너 아래에 웹툰 쪽 도구 본체를 그대로 놓는다.
// 도구 컴포넌트 안쪽 꾸밈은 손대지 않는다.
export function ToolFrame({ href, children }: { href: string; children: React.ReactNode }) {
  const tool = tools.find((t) => t.href === href);
  const title = tool?.title ?? "자료실";
  return (
    <>
      <PageHead
        title={title}
        trail={[
          { href: "/classic/tools", label: "자료실" },
          { href, label: title },
        ]}
      />
      <SupportTabs current="/classic/tools" />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        {children}
        <div className="mt-14 flex justify-end border-t border-[#e6e9ee] pt-6">
          <Link
            href="/classic/tools"
            className="inline-flex h-12 items-center gap-2 rounded-md border border-[#c9cfd8] bg-white px-5 text-[16px] font-bold text-[#15171c] transition-colors hover:border-[#15171c]"
          >
            <List size={18} aria-hidden />
            목록
          </Link>
        </div>
      </div>
    </>
  );
}
