import type { Metadata } from "next";
import { faq } from "@/data/faq";

export const metadata: Metadata = {
  title: "자주 묻는 질문",
  description: "홈페이지 제작 수정 횟수, 결제 시점, 취소·환불, 도메인·호스팅, 완료 후 유지보수, 업무 프로그램 견적에 대한 답입니다.",
  alternates: { canonical: "/faq" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-[1248px] px-4 pb-10 pt-14 md:px-6 md:py-14">
      <h1 className="text-[28px] font-bold leading-[1.4] tracking-[-0.01em] md:text-[36px]">자주 묻는 질문</h1>
      <dl className="mt-8 divide-y divide-border border-y border-border">
        {faq.map((f) => (
          <div key={f.q} className="grid gap-2 py-6 md:grid-cols-[320px_1fr] md:gap-10">
            <dt className="flex gap-3 text-[17px] font-bold md:text-[19px]">
              <span aria-hidden className="shrink-0 text-accent">
                Q
              </span>
              {f.q}
            </dt>
            <dd className="flex gap-3 text-[17px] leading-[1.7] text-foreground-secondary">
              <span aria-hidden className="shrink-0 font-bold text-foreground-tertiary">
                A
              </span>
              {f.a}
            </dd>
          </div>
        ))}
      </dl>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
