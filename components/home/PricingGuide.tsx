import { CheckCircle2 } from "lucide-react";
import Section, { SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { Doodles } from "@/components/home/Doodles";
import { pricingTiers, pricingDisclaimer } from "@/data/pricing";

export function PricingGuide() {
  return (
    <Section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative overflow-hidden bg-surface/40 py-24 md:py-32 lg:py-40"
    >
      <Doodles variant={1} />
      <SectionHeading
        index="02"
        label="Pricing"
        size="display"
        title="가격 안내"
        titleId="pricing-heading"
        description="견적은 페이지 수·필요한 기능(예약·결제·관리자)·유지보수 여부로 정해집니다. 아래는 대표 구성이고, 정확한 금액은 상담에서 무료로 안내해 드립니다."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {pricingTiers.map(({ id, title, bestFor, includes }, i) => (
          <Reveal key={id} delay={(i % 4) * 0.08} className="h-full">
            <TiltCard className="h-full">
              <article className="iri-border glass flex h-full flex-col rounded-3xl p-6 transition-[box-shadow] duration-300 hover:shadow-xl">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: ["#4f5be6", "#17c3b2", "#34d17d", "#ff6b5e"][i % 4] }}
                />
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              </div>
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
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: ["#4f5be6", "#17c3b2", "#34d17d", "#ff6b5e"][i % 4] }}
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
