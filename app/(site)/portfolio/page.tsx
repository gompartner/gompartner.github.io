import type { Metadata } from "next";
import Section, { SectionHeading } from "@/components/ui/Section";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";

export const metadata: Metadata = {
  title: "홈페이지·랜딩페이지 포트폴리오 (직접 체험 데모)",
  description: "소상공인 홈페이지, 이벤트 랜딩페이지, 예약·문의 시스템, 관리자 페이지 데모를 확인하세요.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioPage() {
  return (
    <Section>
      <SectionHeading
        label="Portfolio"
        title="말보다, 직접 만져보세요"
        description="직접 클릭하고 입력해 보는 샘플 데모입니다. 실제 프로젝트는 사업에 맞춰 새로 설계합니다."
      />
      <PortfolioGrid />
    </Section>
  );
}
