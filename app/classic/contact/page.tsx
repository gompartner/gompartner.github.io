import type { Metadata } from "next";
import { Suspense } from "react";
import { Check } from "lucide-react";
import { ContactForm } from "@/components/classic/contact/ContactForm";
import { PageHead, wrap } from "@/components/classic/ui";
import { processSteps } from "@/data/classic/faq";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "상담 신청",
  description: "제작하거나 수정할 홈페이지의 업종, 필요한 기능, 희망 일정을 남겨 주시면 검토 뒤 견적서로 회신합니다.",
  path: "/classic/contact",
});

const prepare = ["로고", "사업장 또는 제품 사진", "영업시간과 주소", "참고 사이트 주소"];

export default function ClassicContactPage() {
  return (
    <>
      <PageHead title="상담 신청" trail={[{ href: "/classic/contact", label: "상담 신청" }]} />

      <div className={`${wrap} grid gap-14 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16`}>
        <section aria-label="상담 신청서" className="min-w-0">
          {/* 폼이 주소의 ?site= 를 읽어서(useSearchParams) 정적 내보내기에는 Suspense가 있어야 한다 */}
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </section>

        <aside aria-labelledby="contact-ready" className="min-w-0 lg:pt-8">
          <h2 id="contact-ready" className="text-[22px] font-[800] tracking-[-0.03em]">
            있으면 좋은 자료
          </h2>
          <ul className="mt-4 border-t-2 border-[#15171c]" role="list">
            {prepare.map((t) => (
              <li key={t} className="flex gap-2.5 border-b border-[#e6e9ee] py-3.5 text-[16px]">
                <Check size={18} strokeWidth={2.5} aria-hidden className="mt-[3px] shrink-0 text-[#256ef4]" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[15px] leading-[1.6] text-[#5b6370]">자료가 없어도 신청할 수 있습니다.</p>

          <h2 id="contact-steps" className="mt-12 text-[22px] font-[800] tracking-[-0.03em]">
            진행 절차
          </h2>
          <ol className="mt-4 border-t-2 border-[#15171c]">
            {processSteps.map((s, n) => (
              <li key={s.title} className="flex gap-4 border-b border-[#e6e9ee] py-4">
                <span className="w-6 shrink-0 text-[15px] font-bold tabular-nums text-[#256ef4]">{n + 1}</span>
                <div className="min-w-0">
                  <p className="text-[17px] font-bold">{s.title}</p>
                  <p className="mt-1 text-[15px] leading-[1.6] text-[#5b6370]">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </>
  );
}
