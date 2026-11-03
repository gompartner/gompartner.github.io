import type { Metadata } from "next";
import { FaqBlock } from "@/components/classic/FaqBlock";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { faq } from "@/data/classic/faq";
import { LdScript } from "@/components/seo/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "자주 묻는 질문",
  description: "홈페이지 제작 견적과 일정, 수정 횟수, 결제와 환불, 도메인과 호스팅, 오픈 뒤 유지보수에 대한 답변입니다.",
  path: "/faq",
});

export default function ClassicFaqPage() {
  return (
    <>
      <LdScript data={breadcrumbLd([{ name: "자주 묻는 질문", path: "/faq" }])} />
      <PageHead title="자주 묻는 질문" trail={[{ href: "/faq", label: "고객지원" }, { href: "/faq", label: "자주 묻는 질문" }]} />
      <SupportTabs current="/faq" />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <FaqBlock items={faq} bare />
      </div>
    </>
  );
}
