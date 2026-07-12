import Section, { SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { processSteps } from "@/data/process";

export function ProcessTimeline() {
  return (
    <Section
      id="process"
      aria-labelledby="process-heading"
      className="bg-surface/40 py-20 md:py-28"
    >
      <SectionHeading
        label="Process"
        title="진행은 이렇게 됩니다"
        titleId="process-heading"
        description="복잡한 절차 없이 다섯 단계입니다. 각 단계에서 무엇이 결정되는지 미리 알 수 있습니다."
      />

      <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-6">
        {processSteps.map(({ step, title, description }, i) => (
          <li key={step} className="relative">
            {/* 가로 커넥터 (lg 이상) */}
            {i < processSteps.length - 1 && (
              <span
                aria-hidden
                className="absolute left-12 top-5 hidden h-px w-[calc(100%-1.5rem)] bg-border lg:block"
              />
            )}
            <Reveal delay={i * 0.08}>
              <div className="flex gap-4 lg:flex-col">
                <span className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-accent/30 bg-background text-sm font-semibold text-accent">
                  {step}
                </span>
                <div>
                  <h3 className="pt-2 font-semibold text-foreground lg:pt-3">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">
                    {description}
                  </p>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
