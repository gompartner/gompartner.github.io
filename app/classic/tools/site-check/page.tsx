import type { Metadata } from "next";
import { SiteCheck } from "@/components/classic/tools/SiteCheck";
import { fitDescription } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

export const metadata: Metadata = {
  title: "홈페이지 진단 (접속, 보안, 휴대폰 화면, 속도, 검색 노출)",
  description: fitDescription("홈페이지 주소를 넣으면 접속과 보안 설정, 휴대폰 화면, 속도, 검색 노출 문제를 급함, 주의, 양호로 나눠 보여 드려요."),
  alternates: { canonical: "/tools/site-check" },
};

export default function ClassicSiteCheckPage() {
  return (
    <ToolFrame href="/classic/tools/site-check">
      <SiteCheck />
    </ToolFrame>
  );
}
