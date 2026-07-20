import { ChevronDown } from "lucide-react";
import Section, { SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Doodles } from "@/components/home/Doodles";
import { faqItems } from "@/data/faq";
import type { FaqItem } from "@/data/faq";

function FaqColumn({ items }: { items: FaqItem[] }) {
  return (
    <div className="iri-border glass h-fit divide-y divide-border rounded-3xl px-6">
      {items.map(({ question, answer }) => (
        <details key={question} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground [&::-webkit-details-marker]:hidden">
            {question}
            <ChevronDown
              size={18}
              aria-hidden
              className="flex-shrink-0 text-foreground-tertiary transition-transform duration-300 group-open:rotate-180"
            />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-foreground-secondary">
            {answer}
          </p>
        </details>
      ))}
    </div>
  );
}

export function Faq() {
  // 좌우 2단으로 나눠 한쪽으로 쏠리지 않게 배치
  const half = Math.ceil(faqItems.length / 2);
  const left = faqItems.slice(0, half);
  const right = faqItems.slice(half);

  return (
    <Section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative overflow-hidden py-24 md:py-32 lg:py-40"
    >
      <Doodles variant={2} />
      <SectionHeading
        index="03"
        label="FAQ"
        size="display"
        title="자주 묻는 질문"
        titleId="faq-heading"
        description="상담 전에 가장 많이 물어보시는 것들입니다. 더 궁금한 점은 편하게 문의해 주세요."
      />

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <Reveal>
          <FaqColumn items={left} />
        </Reveal>
        <Reveal delay={0.08}>
          <FaqColumn items={right} />
        </Reveal>
      </div>
    </Section>
  );
}
