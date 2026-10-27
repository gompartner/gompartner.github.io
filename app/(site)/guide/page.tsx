import type { Metadata } from "next";
import { guides, toSearchItems } from "@/data/guides";
import { GuideList } from "@/components/guide/GuideList";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({
    title: "홈페이지 제작 가이드",
    description: "홈페이지 업체 고르는 법과 비용, PHP 취약점과 배포 오류 대응까지 사장님이 직접 확인할 순서를 적었어요.",
    path: "/guide",
  }),
};


export default function GuidePage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-16 pt-10 md:px-6 md:pt-14">
      <h1 className="text-[32px] leading-[1.25] md:text-[44px]">홈페이지 제작 가이드</h1>
      <GuideList items={toSearchItems(guides)} look="webtoon" />
    </div>
  );
}
