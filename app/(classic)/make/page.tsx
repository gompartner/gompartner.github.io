import type { Metadata } from "next";
import { MakeBoard } from "@/components/classic/make/MakeBoard";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "홈페이지, 랜딩페이지, 앱 제작",
  description: "홈페이지, 랜딩페이지, 업무 시스템, 앱, 키오스크, 3D 웹을 제작합니다. 종류별 만든 화면과 패키지 금액, 제작 기간을 안내합니다.",
  alt: "곰파트너 홈페이지, 앱 제작. 종류별 화면과 패키지 금액",
  path: "/make",
});

export default function MakePage() {
  return <MakeBoard />;
}
