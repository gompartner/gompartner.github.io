import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveScreen } from "@/components/classic/catalog/LiveScreen";
import { catalogTrends } from "@/data/classic/catalogStories";
import { demoProjects } from "@/components/classic/works/samples";

// 11-26 카탈로그의 "그 해의 연출로 만든 화면" 다섯 장을 실제로 만져 볼 수 있게 여는 주소(사용자 "영상 플레이가 아닌 효과도 할 수 있나", "살려").
// 데모, 샘플 주소(/work, /demo, /sample)는 내린 그대로이고, 이 다섯 화면만 카탈로그의 크게 보기 안에서(iframe) 또는 새 창으로 연다.
// 검색에는 올리지 않는다(noindex, 사이트맵에 없음). 화면에 사이트 머리글과 바닥글을 붙이지 않는다(납품 화면 그대로 보여 준다).
export const dynamicParams = false;
export function generateStaticParams() {
  return catalogTrends.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const t = catalogTrends.find((x) => x.id === id);
  const base = demoProjects.find((p) => p.id === t?.of);
  return { title: t && base ? `${base.title} ${t.tag}` : "곰파트너", robots: { index: false, follow: false } };
}

export default async function LivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!catalogTrends.some((t) => t.id === id)) notFound();
  return (
    <>
      {/* 화면 공통 스타일을 거는 틀(display: contents) */}
      <div className="demo-root">
        <LiveScreen id={id} />
      </div>
      <div className="bg-[#0b0b0c] py-4 text-center text-[12px] tracking-[0.01em] text-[#8b9099]">Copyright © 곰파트너. All rights reserved.</div>
    </>
  );
}
