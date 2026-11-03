import type { Metadata } from "next";
import { PrivacyPolicyGenerator } from "@/components/classic/tools/PrivacyPolicyGenerator";
import { pageMeta } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

// 11-04 공유 미리보기(카톡 등)도 이 도구의 제목, 설명, 주소로 나오게 pageMeta를 쓴다
export const metadata: Metadata = pageMeta({ title: "개인정보처리방침 생성기 (무료)", description: "쇼핑몰, 회원제 홈페이지, 예약 서비스에 필요한 개인정보처리방침을 사이트 유형과 수집 항목만 골라 바로 만듭니다. 글자·HTML 복사와 파일 내려받기를 지원합니다.", path: "/tools/privacy-policy" });

export default function ClassicPrivacyPolicyPage() {
  return (
    <ToolFrame href="/tools/privacy-policy">
      <PrivacyPolicyGenerator />
    </ToolFrame>
  );
}
