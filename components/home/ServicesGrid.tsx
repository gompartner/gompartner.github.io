import Section, { SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { services, capabilityChips } from "@/data/services";

export function ServicesGrid() {
  return (
    <Section id="services" aria-labelledby="services-heading" className="py-20 md:py-28">
      <SectionHeading
        label="Services"
        title="필요한 것만, 제대로"
        titleId="services-heading"
        description="과한 기능을 권하지 않습니다. 지금 사업에 필요한 범위만 제안하고, 오래 쓸 수 있게 만듭니다."
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map(({ icon: Icon, title, description }, i) => (
          <Reveal key={title} delay={(i % 3) * 0.08}>
            <article className="group h-full rounded-3xl border border-border bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                <Icon size={22} aria-hidden />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-secondary">
                {description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.15}>
        <div className="mt-14 text-center">
          <p className="text-sm font-medium text-foreground-tertiary">
            이 외에도 필요한 만큼 만들 수 있습니다
          </p>
          <ul className="mt-5 flex flex-wrap justify-center gap-2.5">
            {capabilityChips.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-border bg-background px-4 py-1.5 text-sm text-foreground-secondary"
              >
                {chip}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Section>
  );
}
