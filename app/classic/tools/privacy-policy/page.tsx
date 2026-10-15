import type { Metadata } from "next";
import { PrivacyPolicyGenerator } from "@/components/tools/PrivacyPolicyGenerator";
import { fitDescription } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

export const metadata: Metadata = {
  title: "개인정보처리방침 생성기 (무료)",
  description: fitDescription("쇼핑몰, 회원제 홈페이지, 예약 서비스에 필요한 개인정보처리방침을 사이트 유형과 수집 항목만 골라 바로 만듭니다. 글자·HTML 복사와 파일 내려받기를 지원합니다."),
  alternates: { canonical: "/tools/privacy-policy" },
};

export default function ClassicPrivacyPolicyPage() {
  return (
    <ToolFrame href="/classic/tools/privacy-policy">
      <PrivacyPolicyGenerator />
    </ToolFrame>
  );
}
