import { CheckCircle2 } from "lucide-react";
import Section, { SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { pricingTiers, pricingDisclaimer } from "@/data/pricing";

export function PricingGuide() {
  return (
    <Section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="bg-surface/40 py-20 md:py-28"
    >
      <SectionHeading
        label="Pricing"
        title="가격 안내"
        titleId="pricing-heading"
        description="규모와 기능에 따라 견적이 달라집니다. 지금 상황을 알려주시면 무료로 견적을 안내해 드립니다."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {pricingTiers.map(({ id, title, bestFor, includes }, i) => (
          <Reveal key={id} delay={(i % 4) * 0.08} className="h-full">
            <TiltCard className="h-full">
              <article className="flex h-full flex-col rounded-3xl border border-border bg-background p-6 transition-[border-color,box-shadow] duration-300 hover:border-accent/30 hover:shadow-xl">
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">
                {bestFor}
              </p>
              <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
                {includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-foreground-secondary"
                  >
                    <CheckCircle2
                      size={15}
                      className="mt-0.5 flex-shrink-0 text-accent"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
              </article>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <Button href="/contact" data-gtm-cta="pricing_contact">
            상담 후 무료 견적 받기
          </Button>
          <p className="text-sm text-foreground-tertiary">{pricingDisclaimer}</p>
        </div>
      </Reveal>
    </Section>
  );
}
