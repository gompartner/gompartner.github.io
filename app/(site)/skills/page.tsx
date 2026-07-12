import type { Metadata } from "next";
import Section, { SectionHeading } from "@/components/ui/Section";
import { SkillCategory } from "@/components/skills/SkillCategory";
import { skillCategories } from "@/data/skills";

export const metadata: Metadata = {
  title: "Skills",
  description: "백엔드, 데이터베이스, 운영개발을 중심으로 보유 기술 스택과 숙련도를 확인하세요.",
};

export default function SkillsPage() {
  return (
    <Section>
      <SectionHeading
        label="Skills"
        title="기술 스택"
        description="Java/Spring 기반 백엔드 개발과 데이터베이스, 운영개발 경험을 중심으로 서비스 안정성과 확장성을 만들어 왔습니다."
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {skillCategories.map((cat, i) => (
          <SkillCategory key={cat.id} category={cat} index={i} />
        ))}
      </div>
    </Section>
  );
}
