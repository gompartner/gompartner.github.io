import type { Metadata } from "next";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { faq } from "@/data/classic/faq";
import { LdScript } from "@/components/seo/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "자주 묻는 질문",
  description: "홈페이지 제작 견적과 일정부터 결제, 오픈 뒤 유지보수까지 자주 묻는 질문입니다.",
  path: "/faq",
});

export default function ClassicFaqPage() {
  return (
    <>
      <LdScript data={breadcrumbLd([{ name: "자주 묻는 질문", path: "/faq" }])} />
      <PageHead en="FAQ" title="자주 묻는 질문" lead="견적과 일정부터 결제, 오픈 뒤 유지보수까지 자주 묻는 질문입니다." trail={[{ href: "/faq", label: "자주 묻는 질문" }]} />
      <SupportTabs current="/faq" />
      <div className={`${wrap} pb-20 pt-8 md:pb-28 md:pt-12`}>
        <FaqBlock items={faq} bare />
      </div>
    </>
  );
}
