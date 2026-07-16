import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Section, { SectionHeading } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/motion/Reveal";
import { DemoPreview } from "@/components/home/DemoPreview";
import { projects } from "@/data/projects";

export function DemoShowcase() {
  const demos = projects.filter((p) => p.demoUrl);

  return (
    <Section
      id="showcase"
      aria-labelledby="showcase-heading"
      className="scroll-mt-16 bg-surface/40 py-20 md:py-28"
    >
      <SectionHeading
        label="Live Demos"
        title="말보다, 직접 만져보세요"
        titleId="showcase-heading"
        description="직접 클릭하고 입력해 보는 샘플 데모입니다. 실제 프로젝트는 사업에 맞춰 새로 설계합니다."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {demos.map((project, i) => (
          <Reveal key={project.id} delay={(i % 3) * 0.08}>
            <Link
              href={project.demoUrl!}
              data-gtm-cta={`demo_card_${project.id}`}
              className="group flex h-full flex-col gap-4 rounded-3xl border border-border bg-background p-5 transition-all duration-300 hover:border-accent/30 hover:shadow-xl"
            >
              <DemoPreview category={project.category} />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-accent">
                    {project.title}
                  </h3>
                  <Badge variant="subtle" size="sm" className="shrink-0 whitespace-nowrap">
                    샘플 데모
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground-secondary">
                  {project.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  직접 체험하기
                  <ArrowUpRight
                    size={15}
                    aria-hidden
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}

        {/* 마지막 행: 포트폴리오 안내 밴드 — 홀로 남는 카드 없이 행 전체를 채운다 */}
        <Reveal delay={0.16} className="md:col-span-2 lg:col-span-3">
          <Link
            href="/portfolio"
            className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border p-6 text-center transition-all duration-300 hover:border-accent/40 hover:bg-surface/60 sm:flex-row sm:gap-4"
          >
            <p className="font-medium text-foreground">
              각 데모의 기획 배경과 구현 설명이 궁금하다면
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
              포트폴리오 보기
              <ArrowRight
                size={15}
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}
