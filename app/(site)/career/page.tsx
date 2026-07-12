import type { Metadata } from "next";
import Section, { SectionHeading } from "@/components/ui/Section";
import { Timeline } from "@/components/career/Timeline";
import {
  CareerHighlights,
  CareerSupplements,
} from "@/components/career/CareerExtras";

export const metadata: Metadata = {
  title: "Career",
  description:
    "근무경력, 기술경력, 학력, 자격, 교육 이력을 포트폴리오 형식으로 소개합니다.",
};

export default function CareerPage() {
  return (
    <Section>
      <SectionHeading
        label="Career"
        title="경력"
        description="플랫폼 개발 리딩과 다양한 공공·기업 웹서비스 구축을 통해 쌓아온 백엔드 개발 경험입니다."
      />
      <CareerHighlights />
      <Timeline />
      <CareerSupplements />
    </Section>
  );
}
