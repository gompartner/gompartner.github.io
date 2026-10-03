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
      <p className="text-[15px] font-bold text-accent">무료 도구</p>
      <h1 className="mt-1 text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">검색 결과 미리보기</h1>
      <p className="mt-2 max-w-[720px] text-[17px] leading-[1.6] text-foreground-secondary">
        네이버와 구글에서 내 홈페이지가 어떤 제목과 설명으로 나오는지 미리 봅니다. 상호와 지역, 업종을 넣으면 추천 문구도 만들어 드립니다.
      </p>
      <SearchPreview />
    </div>
  );
}
