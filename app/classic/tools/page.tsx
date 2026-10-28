import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { toolCategories, tools } from "@/data/classic/tools";
import { fitDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: "자료실",
  description: fitDescription("개인정보처리방침·이용약관 생성기, 웹접근성 점검표, QR코드, 이미지 용량 줄이기 같은 무료 도구입니다."),
  alternates: { canonical: "/tools" },
};

export default function ClassicToolsPage() {
  return (
    <>
      <PageHead title="자료실" trail={[{ href: "/classic/tools", label: "자료실" }]} />
      <SupportTabs current="/classic/tools" />
      <div className={`${wrap} space-y-14 pb-16 pt-10 md:space-y-16 md:pb-24 md:pt-14`}>
        {toolCategories.map((c) => {
          const list = tools.filter((t) => t.category === c);
          if (list.length === 0) return null;
          return (
            <section key={c} aria-labelledby={`cat-${c}`}>
              <div className="flex items-end justify-between border-b-2 border-[#15171c] pb-3">
                <h2 id={`cat-${c}`} className="text-[22px] font-extrabold tracking-[-0.03em] md:text-[26px]">
                  {c}
                </h2>
                <span className="text-[15px] tabular-nums text-[#6b7280]">{list.length}건</span>
              </div>
              <ul role="list">
                {list.map((t) => (
                  <li key={t.href} className="border-b border-[#e6e9ee]">
                    <Link href={t.href} className="group grid gap-1.5 py-5 md:grid-cols-[150px_1fr_24px] md:items-center md:gap-8 md:py-6">
                      <span className="text-[14px] font-bold text-[#256ef4] md:text-[15px]">{t.category}</span>
                      <span className="min-w-0">
                        <span className="block text-[18px] font-bold tracking-[-0.02em] group-hover:text-[#256ef4] md:text-[19px]">{t.title}</span>
                        <span className="mt-1.5 block text-[15px] leading-[1.65] text-[#5b6370] md:text-[16px]">{t.description}</span>
                      </span>
                      <ChevronRight size={20} aria-hidden className="hidden text-[#6b7280] group-hover:text-[#256ef4] md:block" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
