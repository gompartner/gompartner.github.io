import type { Metadata } from "next";
import Section, { SectionHeading } from "@/components/ui/Section";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";

export const metadata: Metadata = {
  title: "데모 포트폴리오",
  description: "소상공인 홈페이지, 이벤트 랜딩페이지, 예약·문의 시스템, 관리자 페이지 데모를 확인하세요.",
};

export default function PortfolioPage() {
  return (
    <Section>
      <SectionHeading
        label="Portfolio"
        title="데모 사이트"
        description="소상공인과 1인 사업자에게 필요한 홈페이지, 랜딩페이지, 예약·문의, 관리자 기능을 실제 서비스 예시로 구성했습니다."
      />
      <PortfolioGrid />
    </Section>
  );
}
