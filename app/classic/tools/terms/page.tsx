import type { Metadata } from "next";
import { TermsGenerator } from "@/components/tools/TermsGenerator";
import { fitDescription } from "@/lib/seo";
import { ToolFrame } from "@/components/classic/support/ToolFrame";

export const metadata: Metadata = {
  title: "이용약관 생성기 (표준약관 기준, 무료)",
  description: fitDescription("홈페이지, 회원제 서비스, 쇼핑몰에 필요한 이용약관을 공정거래위원회 전자상거래 표준약관 구성에 맞춰 바로 만듭니다. 회원가입, 결제, 청약철회, 게시물 조항을 골라 넣고 글자·HTML로 복사합니다."),
  alternates: { canonical: "/tools/terms" },
};

export default function ClassicTermsPage() {
  return (
    <ToolFrame href="/classic/tools/terms">
      <TermsGenerator />
    </ToolFrame>
  );
}
