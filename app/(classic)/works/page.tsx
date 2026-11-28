import type { Metadata } from "next";
import { WorksBoard } from "@/components/classic/works/WorksBoard";
import { LdScript } from "@/components/seo/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

// 11-26 작업 판. 가상 브랜드 카탈로그(components/classic/catalog)를 내리고 직접 만들어 운영하는 작업 네 개만 둔다(data/classic/workCases.ts).
export const metadata: Metadata = pageMeta({
  title: "작업 사례",
  description: "곰파트너가 만들어 운영하는 홈페이지와 랜딩페이지, 업무 시스템 등입니다. 문제와 만든 것, 지금 쓰는 모습을 실제 화면으로 보여 드립니다.",
  path: "/works",
  alt: "곰파트너 작업 사례. 곰파트너 사이트와 거래장부, 사이트 지킴이, 3D 견적 화면",
});

export default function WorksPage() {
  return (
    <>
      <LdScript data={[breadcrumbLd([{ name: "작업 사례", path: "/works" }])]} />
      <WorksBoard />
    </>
  );
}
