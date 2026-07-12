import type { Metadata } from "next";
import Section, { SectionHeading } from "@/components/ui/Section";
import { AboutContent } from "@/components/about/AboutContent";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "About",
  description: `${profile.name}의 소규모 웹사이트 제작, 운영, 마케팅 이벤트 페이지 관리 방향을 소개합니다.`,
};

export default function AboutPage() {
  return (
    <Section>
      <SectionHeading
        label="About Me"
        title="소개"
        description="작은 사업이 웹에서 빠르게 시작하고 꾸준히 운영될 수 있도록 돕는 방향으로 일합니다."
      />
      <AboutContent />
    </Section>
  );
}
