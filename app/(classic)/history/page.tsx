import type { Metadata } from "next";
import { StoryBoard } from "@/components/classic/story/StoryBoard";
import { pageMeta } from "@/lib/seo";

// 11-26 연혁은 회사소개(/story)의 사이트 변천사로 합쳤다. 이 주소는 같은 판을 보여 주고 대표 주소는 /story로 둔다(옛 주소 넘김은 따로 건다).
export const metadata: Metadata = pageMeta({
  title: "연혁",
  description: "곰파트너 사이트 변천사. 2026년 7월 오픈부터 지금까지 화면과 상품 구성을 바꿔 온 과정입니다.",
  path: "/story",
});

export default function ClassicHistoryPage() {
  return <StoryBoard />;
}
