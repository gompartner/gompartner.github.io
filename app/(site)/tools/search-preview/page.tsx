import type { Metadata } from "next";
import { SearchPreview } from "@/components/tools/SearchPreview";

export const metadata: Metadata = {
  title: "검색 결과 미리보기 (네이버, 구글, 무료)",
  description:
    "상호와 지역, 업종을 넣으면 네이버와 구글 검색 결과에 홈페이지 제목과 설명이 어떻게 보이는지 미리 봅니다. 잘리는 길이를 점검하고 meta 태그를 복사합니다.",
  alternates: { canonical: "/tools/search-preview" },
};

export default function SearchPreviewPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">검색 결과 미리보기</h1>
      <SearchPreview />
    </div>
  );
}
