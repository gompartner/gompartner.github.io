import type { Metadata } from "next";
import Image from "next/image";
import { PageHead, wrap } from "@/components/classic/ui";
import { SupportTabs } from "@/components/classic/support/SupportTabs";
import { ChevronDown } from "lucide-react";
import { history, historyLead, type HistoryItem } from "@/data/classic/history";
import { LdScript } from "@/components/seo/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "연혁",
  description: `곰파트너 연혁. ${historyLead}`,
  path: "/history",
});

// 11-25 달 단위로 묶는다(날짜마다 한 줄이면 자주 바뀌는 사이트로만 보임). 큰 일만 보이고 날짜별 내역은 접어 둔다
const months = Array.from(new Set(history.map((h) => h.date.slice(0, 7)))).map((ym) => {
  const items = history.filter((h) => h.date.startsWith(ym));
  // 그 달의 대표 화면은 그 달 마지막 개편(목록 맨 위) 화면
  return { ym, items, cover: items[0] };
});

function Shot({ h, priority = false, small = false }: { h: HistoryItem; priority?: boolean; small?: boolean }) {
  return (
    <div className="relative aspect-[1100/725] overflow-hidden rounded-lg border border-[#d9dee5] bg-[#f4f6fa]">
      <Image src={`/images/history/${h.img}.jpg`} alt={h.alt} fill priority={priority} sizes={small ? "220px" : "(min-width: 768px) 520px, 100vw"} className="object-cover object-top" />
    </div>
  );
}

export default function ClassicHistoryPage() {
  return (
    <>
      <LdScript data={breadcrumbLd([{ name: "연혁", path: "/history" }])} />
      <PageHead title="연혁" trail={[{ href: "/story", label: "곰파트너" }, { href: "/history", label: "연혁" }]} />
      <SupportTabs current="/history" />
      <section aria-label="연혁" className={`${wrap} py-14 md:py-20`}>
        <p className="max-w-[760px] break-keep text-[17px] leading-[1.75] text-[#3d4450] md:text-[19px]">{historyLead}</p>
        <ol className="mt-10 border-t-2 border-[#15171c]" role="list">
          {months.map((m, i) => (
            <li key={m.ym} className="border-b border-[#d9dee5] py-8 md:py-10">
              <div className="grid gap-5 md:grid-cols-[200px_1fr_1.2fr] md:gap-10">
                <p className="text-[19px] font-[800] tabular-nums text-[#256ef4] md:text-[22px]">{m.ym}</p>
                <ul className="grid content-start gap-1.5" role="list">
                  {m.items.map((h) => (
                    <li key={h.date} className="break-keep text-[20px] font-[800] leading-[1.4] tracking-[-0.04em] md:text-[24px]">{h.title}</li>
                  ))}
                </ul>
                <Shot h={m.cover} priority={i === 0} />
              </div>
              {m.items.length > 1 ? (
                <details className="group mt-6 md:ml-[240px]">
                  <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-[15px] font-bold text-[#256ef4] [&::-webkit-details-marker]:hidden">
                    세부 내역 {m.items.length}건
                    <ChevronDown size={17} aria-hidden className="transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                  </summary>
                  <ul className="mt-2 border-t border-[#d9dee5]" role="list">
                    {m.items.map((h) => (
                      <li key={h.date} className="grid gap-3 border-b border-[#e6e9ee] py-5 md:grid-cols-[110px_1fr_220px] md:gap-6">
                        <p className="text-[15px] font-bold tabular-nums text-[#5b6370]">{h.date}</p>
                        <div>
                          <h3 className="break-keep text-[17px] font-[800] tracking-[-0.03em] md:text-[18px]">{h.title}</h3>
                          <p className="mt-1 break-keep text-[15.5px] leading-[1.7] text-[#3d4450]">{h.body}</p>
                        </div>
                        <Shot h={h} small />
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <p className="mt-3 break-keep text-[16px] leading-[1.7] text-[#3d4450] md:ml-[240px] md:text-[17px]">{m.items[0].body}</p>
              )}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
