import type { Metadata } from "next";
import { SiteCheck } from "@/components/classic/tools/SiteCheck";
import { pageMeta } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

// 11-04 공유 미리보기(카톡 등)도 이 도구의 제목, 설명, 주소로 나오게 pageMeta를 쓴다
export const metadata: Metadata = pageMeta({ title: "홈페이지 진단 (접속, 보안, 휴대폰 화면, 속도, 검색 노출)", description: "홈페이지 주소를 넣으면 접속과 보안 설정, 휴대폰 화면, 속도, 검색 노출 문제를 급함, 주의, 양호로 나눠 보여 드려요.", path: "/tools/site-check" });

export default function ClassicSiteCheckPage() {
  return (
    <ToolFrame href="/tools/site-check">
      <SiteCheck />
    </ToolFrame>
  );
}
