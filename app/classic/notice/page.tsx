import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { notices } from "@/data/classic/notices";
import { fitDescription } from "@/lib/seo";

export const metadata: Metadata = {
  title: "공지사항",
  description: fitDescription("곰파트너 서비스 운영, 정책 변경, 휴무 일정 안내입니다."),
  alternates: { canonical: "/classic/notice" },
};

const dot = (d: string) => d.replaceAll("-", ".");

export default function ClassicNoticePage() {
  return (
    <>
      <PageHead title="공지사항" trail={[{ href: "/classic/notice", label: "공지사항" }]} />
      <SupportTabs current="/classic/notice" />
      <div className={`${wrap} pb-16 pt-10 md:pb-24 md:pt-14`}>
        <p className="mb-4 text-[15px] text-[#5b6370]">
          전체 <span className="font-bold tabular-nums text-[#15171c]">{notices.length}</span>건
        </p>
        <ul className="border-t-2 border-[#15171c]" role="list">
          {notices.map((n, i) => (
            <li key={n.id} className="border-b border-[#e6e9ee]">
              <details className="group" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-5 md:gap-6 md:px-6 md:py-6 [&::-webkit-details-marker]:hidden">
                  <span className="hidden w-12 shrink-0 text-[15px] tabular-nums text-[#6b7280] md:block">{notices.length - i}</span>
                  <span className="min-w-0 flex-1 text-[17px] font-bold leading-[1.5] tracking-[-0.02em] md:text-[19px]">{n.title}</span>
                  <time dateTime={n.date} className="shrink-0 text-[15px] tabular-nums text-[#6b7280]">
                    {dot(n.date)}
                  </time>
                  <ChevronDown size={22} aria-hidden className="shrink-0 text-[#6b7280] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <div className="space-y-2 bg-[#f6f7f9] px-4 py-5 text-[16px] leading-[1.75] text-[#3d4450] md:px-6 md:py-6 md:pl-[96px] md:text-[17px]">
                  {n.body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
