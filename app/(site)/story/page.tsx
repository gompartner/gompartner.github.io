import type { Metadata } from "next";
import { Webtoon } from "@/components/renewal/Webtoon";
import { RememberWebtoon } from "@/components/layout/RememberWebtoon";

// 곰파트너 이야기: 세로 웹툰 한 편. 방문자가 자기 상황을 고르면 그 이야기와 가격·샘플로 이어진다.
// 10-22부터 첫 화면은 클래식(/)이고 웹툰은 이 주소로 옮겼다. 첫 화면과 겹쳐 검색에는 내보내지 않는다.
export const metadata: Metadata = {
  title: "곰파트너 이야기",
  alternates: { canonical: "/story" },
  robots: { index: false, follow: true },
};

export default function StoryPage() {
  return (
    <>
      <RememberWebtoon />
      <Webtoon />
    </>
  );
}
