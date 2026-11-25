import type { Metadata } from "next";
import { CatalogBoard } from "@/components/classic/catalog/CatalogBoard";
import { buildCatalog } from "@/components/classic/catalog/items";
import { pageMeta } from "@/lib/seo";

// 11-26 카탈로그 한 판. 위에는 이야기와 함께 올린 화면 11개(data/classic/catalogStories), 아래에는 나머지 화면을 작은 그림으로 둔다.
// 데모, 샘플 주소(/demo, /sample, /work, /works/업종)는 내렸다(사용자 "이제 안 씀, 검색 오류 나도 됨"). 화면은 누르면 그 자리에서 크게 본다.
export const metadata: Metadata = pageMeta({
  title: "카탈로그",
  description: "업종마다 방문자가 찾는 것을 조사하고 그 답이 먼저 보이게 만든 홈페이지, 랜딩페이지, 업무 시스템, 앱, 키오스크, 3D 웹 화면입니다.",
  path: "/works",
});

export default function WorksPage() {
  const { stories, trends, rest, cats, total } = buildCatalog();
  return <CatalogBoard stories={stories} trends={trends} rest={rest} cats={cats} total={total} />;
}
