import type { Metadata } from "next";
import Image from "next/image";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { history, historyLead } from "@/data/classic/history";
import { LdScript } from "@/components/seo/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "연혁",
  description: `곰파트너 연혁. ${historyLead}`,
  path: "/history",
});

export default function ClassicHistoryPage() {
  return (
    <>
      <LdScript data={breadcrumbLd([{ name: "연혁", path: "/history" }])} />
      <PageHead title="연혁" trail={[{ href: "/story", label: "곰파트너" }, { href: "/history", label: "연혁" }]} />
      <SupportTabs current="/history" />
      <section aria-label="연혁" className={`${wrap} py-14 md:py-20`}>
        <p className="max-w-[760px] break-keep text-[17px] leading-[1.75] text-[#3d4450] md:text-[19px]">{historyLead}</p>
        <ol className="mt-10 border-t-2 border-[#15171c]" role="list">
          {history.map((h, i) => (
            <li key={h.date} className="grid gap-5 border-b border-[#d9dee5] py-8 md:grid-cols-[200px_1fr_1.2fr] md:gap-10 md:py-10">
              <p className="text-[17px] font-[800] tabular-nums text-[#256ef4] md:text-[19px]">{h.date}</p>
              <div>
                <h2 className="break-keep text-[22px] font-[800] leading-[1.35] tracking-[-0.04em] md:text-[26px]">{h.title}</h2>
                <p className="mt-2 break-keep text-[16px] leading-[1.7] text-[#3d4450] md:text-[17px]">{h.body}</p>
              </div>
              <div className="relative aspect-[1100/725] overflow-hidden rounded-lg border border-[#d9dee5] bg-[#f4f6fa]">
                {h.video ? (
                  // 움직이는 화면: 소리 없는 반복 재생(GIF보다 가볍다). 동작 줄이기 설정이면 첫 장면 그림만 보인다
                  <video src={`/images/history/${h.img}.mp4`} poster={`/images/history/${h.img}.jpg`} aria-label={h.alt} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover object-top motion-reduce:hidden" />
                ) : null}
                <Image src={`/images/history/${h.img}.jpg`} alt={h.alt} fill priority={i === 0} sizes="(min-width: 768px) 520px, 100vw" className={`object-cover object-top ${h.video ? "motion-safe:hidden" : ""}`} />
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
