import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHead, wrap } from "@/components/classic/ui";
import { buildSearchIndex } from "@/components/classic/search/index";
import { SiteSearch } from "@/components/classic/search/SiteSearch";

// 통합검색(11-01). 결과 페이지는 검색에서 뺀다(noindex, follow).
export const metadata: Metadata = {
  title: "통합검색",
  robots: { index: false, follow: true },
};

export default function ClassicSearchPage() {
  const index = buildSearchIndex();
  return (
    <>
      <PageHead title="통합검색" trail={[{ href: "/search", label: "통합검색" }]} />
      <div className={`${wrap} py-12 md:py-16`}>
        {/* 주소의 ?q= 를 읽어서(useSearchParams) 정적 내보내기에는 Suspense가 있어야 한다 */}
        <Suspense fallback={null}>
          <SiteSearch index={index} />
        </Suspense>
      </div>
    </>
  );
}
