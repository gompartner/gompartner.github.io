import { ArrowDown } from "lucide-react";
import Section, { SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { painPoints } from "@/data/painpoints";

export function PainPoints() {
  return (
    <Section id="pain" aria-labelledby="pain-heading" className="py-20 md:py-28">
      <SectionHeading
        label="Problem"
        title="혹시 이런 고민이 있으신가요"
        titleId="pain-heading"
        description="많은 사장님이 같은 문제로 연락을 주십니다. 하나라도 해당된다면 상담해 볼 만합니다."
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {painPoints.map(({ icon: Icon, title, description }, i) => (
          <Reveal key={title} delay={(i % 3) * 0.08}>
            <article className="h-full rounded-3xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <Icon size={22} aria-hidden />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-secondary">
                {description}
              </p>
            </article>
          </Reveal>
        ))}

        {/* 여섯 번째 슬롯: 전환 카드 */}
        <Reveal delay={0.16}>
          <div className="flex h-full flex-col justify-center gap-4 rounded-3xl bg-gradient-to-br from-accent/12 to-accent/4 p-6">
            <p className="text-lg font-semibold leading-relaxed text-foreground">
              이런 문제를 해결해드립니다.
            </p>
            <p className="text-sm leading-relaxed text-foreground-secondary">
              새로 만들거나 고치는 것부터 검색 노출, 유지보수까지 — 하나씩 같이
              정리하면 됩니다.
            </p>
            <a
              href="#services"
              data-gtm-cta="pain_services"
              className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
            >
              해결 방법 보기
              <ArrowDown size={15} aria-hidden />
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
