import type { Metadata } from "next";
import { ClassicHome } from "@/components/classic/ClassicHome";
import { Webtoon } from "@/components/renewal/Webtoon";
import { homeDescription, homeTitle } from "@/data/seo";
import { fitDescription } from "@/lib/seo";

// 첫 화면은 세로 웹툰 한 편. 방문자가 자기 상황을 고르면 그 이야기와 가격·샘플로 이어진다.
export const metadata: Metadata = {
  // 루트 템플릿(`%s | 곰파트너`)이 브랜드를 또 붙이지 않도록 absolute 사용
  title: { absolute: homeTitle },
  description: fitDescription(homeDescription),
  alternates: { canonical: "/" },
};

export default function HomePage() {
  // 클래식 보기를 고르면 웹툰은 CSS로 숨기고 클래식 첫 화면을 그린다(검색에는 웹툰 첫 화면만 잡힌다)
  return (
    <>
      <div className="look-webtoon">
        <Webtoon />
      </div>
      <ClassicHome />
    </>
  );
}
