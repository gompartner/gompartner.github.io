import type { Metadata } from "next";
import { SearchPreview } from "@/components/classic/tools/SearchPreview";
import { fitDescription } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

export const metadata: Metadata = {
  title: "검색 결과 미리보기 (네이버, 구글, 무료)",
  description: fitDescription("상호와 지역, 업종을 넣으면 네이버와 구글 검색 결과에 홈페이지 제목과 설명이 어떻게 보이는지 미리 봅니다. 잘리는 길이를 점검하고 meta 태그를 복사합니다."),
  alternates: { canonical: "/tools/search-preview" },
};

export default function ClassicSearchPreviewPage() {
  return (
    <ToolFrame href="/classic/tools/search-preview">
      <SearchPreview />
    </ToolFrame>
  );
}
