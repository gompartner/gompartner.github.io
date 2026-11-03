import type { Metadata } from "next";
import { SearchPreview } from "@/components/classic/tools/SearchPreview";
import { pageMeta } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

// 11-04 공유 미리보기(카톡 등)도 이 도구의 제목, 설명, 주소로 나오게 pageMeta를 쓴다
export const metadata: Metadata = pageMeta({ title: "검색 결과 미리보기 (네이버, 구글, 무료)", description: "상호와 지역, 업종을 넣으면 네이버와 구글 검색 결과에 홈페이지 제목과 설명이 어떻게 보이는지 미리 봅니다. 잘리는 길이를 점검하고 meta 태그를 복사합니다.", path: "/tools/search-preview" });

export default function ClassicSearchPreviewPage() {
  return (
    <ToolFrame href="/tools/search-preview">
      <SearchPreview />
    </ToolFrame>
  );
}
