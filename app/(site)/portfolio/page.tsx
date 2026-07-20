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
        size="display"
        label="Portfolio"
        title="데모 체험"
        description="여러분 사업에 맞는 건 상담하면서 새로 만들어 드립니다."
      />
      <PortfolioGrid />
    </Section>
  );
}
