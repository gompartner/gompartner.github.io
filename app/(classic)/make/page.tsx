import type { Metadata } from "next";
import { MakeBoard } from "@/components/classic/make/MakeBoard";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "제작",
  description: "홈페이지, 랜딩페이지, 업무 시스템, 앱, 키오스크, 3D 웹 제작. 종류를 고르면 구성과 금액, 기간을 한 화면에서 확인할 수 있습니다.",
  path: "/make",
});

export default function MakePage() {
  return <MakeBoard />;
}
