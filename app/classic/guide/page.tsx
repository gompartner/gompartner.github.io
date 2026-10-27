import type { Metadata } from "next";
import { toSearchItems } from "@/data/guides";
import { GuideList } from "@/components/guide/GuideList";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { guides } from "@/data/classic/guides";
import { fitDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: "홈페이지 제작 가이드",
  description: fitDescription("홈페이지 업체 고르는 법과 비용, PHP 취약점과 배포 오류 대응까지 사장님이 직접 확인할 순서를 적었어요."),
  alternates: { canonical: "/guide" },
};


export default function ClassicGuidePage() {
  return (
    <>
      <PageHead title="가이드" trail={[{ href: "/classic/faq", label: "고객지원" }, { href: "/classic/guide", label: "가이드" }]} />
      <SupportTabs current="/classic/guide" />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <GuideList items={toSearchItems(guides)} look="classic" />
      </div>
    </>
  );
}
