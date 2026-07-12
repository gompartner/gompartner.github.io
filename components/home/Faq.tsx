import { ChevronDown } from "lucide-react";
import Section, { SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { faqItems } from "@/data/faq";

export function Faq() {
  return (
    <Section id="faq" aria-labelledby="faq-heading" className="py-20 md:py-28">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading
          label="FAQ"
          title="자주 묻는 질문"
          titleId="faq-heading"
          description="상담 전에 가장 많이 물어보시는 것들입니다. 더 궁금한 점은 편하게 문의해 주세요."
          className="mb-0"
        />

        <Reveal>
          <div className="divide-y divide-border rounded-3xl border border-border bg-surface px-6">
            {faqItems.map(({ question, answer }) => (
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
        </Reveal>
      </div>
    </Section>
  );
}
