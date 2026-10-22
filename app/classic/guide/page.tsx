import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { guides } from "@/data/classic/guides";
import { fitDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: "홈페이지 제작 가이드",
  description: fitDescription("홈페이지 제작 업체 고르는 법, 제작 비용이 업체마다 다른 이유, 계약 전에 물어볼 것, 유지보수비 시세를 적었어요."),
  alternates: { canonical: "/guide" },
};

export default function ClassicGuidePage() {
  return (
    <>
      <PageHead title="가이드" trail={[{ href: "/classic/faq", label: "고객지원" }, { href: "/classic/guide", label: "가이드" }]} />
      <SupportTabs current="/classic/guide" />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <ul className="border-t-2 border-[#15171c]" role="list">
          {guides.map((g) => (
            <li key={g.slug} className="border-b border-[#e6e9ee]">
              <Link href={`/classic/guide/${g.slug}`} className="group flex items-center gap-4 px-4 py-5 md:px-6 md:py-6">
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-bold leading-[1.5] tracking-[-0.02em] group-hover:text-[#256ef4] md:text-[19px]">{g.title}</span>
                  <span className="mt-1 block text-[15px] leading-[1.6] text-[#5b6370] md:text-[16px]">{g.description}</span>
                </span>
                <ChevronRight size={22} aria-hidden className="shrink-0 text-[#8a929e] group-hover:text-[#256ef4]" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
