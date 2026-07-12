import Section, { SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { differentiators } from "@/data/differentiators";

export function Differentiators() {
  return (
    <Section id="why" aria-labelledby="why-heading" className="py-20 md:py-28">
      <SectionHeading
        label="Why"
        title="AI는 도구로, 15년 경험은 기준으로"
        titleId="why-heading"
        description="AI로 제작 속도를 높이고, 15년의 운영 경험으로 완성도를 검증합니다. 둘 중 하나만으로는 부족합니다."
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {differentiators.map(({ icon: Icon, title, description }, i) => (
          <Reveal
            key={title}
            delay={(i % 3) * 0.08}
            className={i === 0 ? "md:col-span-2 lg:col-span-1" : undefined}
          >
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

        {/* 여섯 번째 슬롯: 포지셔닝 문장 카드 */}
        <Reveal delay={0.16}>
          <div className="flex h-full flex-col justify-center rounded-3xl bg-gradient-to-br from-accent/12 to-accent/4 p-6">
            <p className="text-lg font-semibold leading-relaxed text-foreground">
              &ldquo;빨리 만드는 것과 제대로 만드는 것,
              <br />
              둘 다 포기하지 않습니다.&rdquo;
            </p>
            <p className="mt-3 text-sm text-foreground-secondary">
              AI 시대의 속도와 15년차의 기준을 함께 제공합니다.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
