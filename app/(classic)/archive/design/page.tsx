import type { Metadata } from "next";
import { TrendIndex } from "@/components/classic/archive/TrendIndex";
import { designDocs } from "@/data/classic/archive";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "디자인 트렌드 | 아카이브",
  description: "휴대폰, 태블릿, 큰 모니터가 생길 때마다 웹 화면의 크기, 배치, 모양이 어떻게 바뀌었는지 한국, 일본, 미국을 차트와 와이어프레임, 실제 사례로 비교합니다.",
  path: "/archive/design",
});

export default function ArchiveDesign() {
  return <TrendIndex id="design" href="/archive/design" title="디자인 트렌드" docs={designDocs} lead="새 기기가 생길 때마다 화면을 다시 설계해야 했습니다. 모니터가 커지고, 휴대폰이 생기고, 장식이 걷히면서 바뀐 화면의 크기, 배치, 모양을 정리합니다." />;
}
