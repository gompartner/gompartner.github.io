import type { Metadata } from "next";
import { StoryBoard } from "@/components/classic/story/StoryBoard";
import { LdScript } from "@/components/seo/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

// 11-26 회사소개 한 판. 대표 경력과 수상은 싣지 않고, 하는 일과 사이트 변천사(옛 /history), 일하는 방식을 한 페이지에 둔다.
export const metadata: Metadata = pageMeta({
  title: "회사소개",
  description: "곰파트너는 홈페이지와 앱을 만들고, 운영하고, 관리합니다. 2026년 7월 오픈부터 사이트와 상품을 바꿔 온 과정과 일하는 방식을 소개합니다.",
  path: "/story",
});

export default function ClassicStoryPage() {
  return (
    <>
      <LdScript data={breadcrumbLd([{ name: "회사소개", path: "/story" }])} />
      <StoryBoard />
    </>
  );
}
