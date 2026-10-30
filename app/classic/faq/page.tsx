import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { faq } from "@/data/classic/faq";
import { fitDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: "자주 묻는 질문",
  description: fitDescription("홈페이지 제작 수정 횟수, 결제 시점, 취소·환불, 도메인·호스팅, 완료 후 유지보수, 업무 프로그램 견적에 대한 답입니다."),
  alternates: { canonical: "/classic/faq" },
};

export default function ClassicFaqPage() {
  return (
    <>
      <PageHead title="자주 묻는 질문" trail={[{ href: "/classic/faq", label: "자주 묻는 질문" }]} />
      <SupportTabs current="/classic/faq" />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <ul className="border-t-2 border-[#15171c]" role="list">
          {faq.map((f) => (
            <li key={f.q} className="border-b border-[#e6e9ee]">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-start gap-4 px-4 py-5 md:gap-6 md:px-6 md:py-6 [&::-webkit-details-marker]:hidden">
                  <span aria-hidden className="shrink-0 text-[19px] font-extrabold text-[#256ef4] md:text-[21px]">
                    Q
                  </span>
                  <span className="min-w-0 flex-1 text-[17px] font-bold leading-[1.5] tracking-[-0.02em] md:text-[19px]">{f.q}</span>
                  <ChevronDown size={22} aria-hidden className="mt-0.5 shrink-0 text-[#6b7280] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <div className="flex gap-4 bg-[#f6f7f9] px-4 py-5 md:gap-6 md:px-6 md:py-6">
                  <span aria-hidden className="shrink-0 text-[19px] font-extrabold text-[#5b6370] md:text-[21px]">
                    A
                  </span>
                  <p className="min-w-0 flex-1 text-[16px] leading-[1.75] text-[#3d4450] md:pr-12 md:text-[17px]">{f.a}</p>
                </div>
              </details>
            </li>
          ))}
        </ul>

      </div>
    </>
  );
}
