import type { Metadata } from "next";
import { TrendIndex } from "@/components/classic/archive/TrendIndex";
import { techDocs } from "@/data/classic/archive";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "기술 트렌드 | 아카이브",
  description: "브라우저, https, 플래시와 jQuery, 만드는 도구, 페이지 무게, 앱 OS, PHP 버전. 화면 뒤의 웹 기술이 한국, 일본, 미국에서 어떻게 바뀌었는지 차트와 출처로 정리했습니다.",
  path: "/archive/tech",
});

export default function ArchiveTech() {
  return <TrendIndex id="tech" href="/archive/tech" title="기술 트렌드" docs={techDocs} lead="새 기기와 새 규칙이 생길 때마다 화면 뒤의 기술도 바뀌었습니다. 브라우저, 보안, 언어, 만드는 도구가 나라마다 다른 속도로 바뀐 흐름과, 그 흔적이 지금 인수하는 사이트에 무엇을 남겼는지 정리합니다." />;
}
