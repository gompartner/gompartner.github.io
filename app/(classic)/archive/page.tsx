import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArchiveShell, docH2 } from "@/components/classic/archive/ArchiveShell";
import { counts, recentLog, sections, trendDocs } from "@/data/classic/archive";
import { datasets } from "@/data/classic/trendData";
import { insights } from "@/data/classic/insights";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "아카이브",
  description: "홈페이지를 만들고 인수해 운영하며 정리한 용어, 와이어프레임, 운영 노트, 점검표입니다. 항목마다 확인한 날짜와 인수 시 확인 사항을 함께 적습니다.",
  path: "/archive",
});

const pics: Record<string, string> = {
  terms: "/images/glossary/t1.webp",
  trends: "/images/archive/trend-ie.png",
  data: "/images/archive/data-mobile.png",
  notes: insights[0]?.image.src ?? "/images/glossary/t186.webp",
  checklists: "/images/jaryo/gnuboard-handover-1.jpg",
};
const amount: Record<string, string> = {
  terms: `${counts.groups}묶음 ${counts.terms}개`,
  trends: `${trendDocs.length}편, 웹 20년 비교`,
  data: `차트 ${datasets.length}개, 원본 CSV`,
  notes: `${counts.notes}편`,
  checklists: `점검표 ${counts.sheets}종, 도구 ${counts.tools}종`,
};

export default function ArchiveHome() {
  const log = recentLog();
  return (
    <ArchiveShell section="home" active="/archive" crumbs={[{ href: "/archive", label: "아카이브" }]} toc={[{ id: "shelf", label: "분류별로 보기" }, { id: "log", label: "최근 쌓인 기록" }]}>
      <header className="border-b border-[#e6e9ee] pb-7">
        <h1 className="mt-4 text-[34px] font-[800] leading-[1.2] tracking-[-0.045em] md:text-[44px]">곰파트너 아카이브</h1>
        <p className="mt-4 max-w-[760px] text-[17px] leading-[1.7] text-[#2b313b] md:text-[18px]">
          홈페이지를 만들고 인수해 운영하며 정리한 용어, 화면, 운영 기록입니다. 항목마다 확인한 날짜와 인수 시 확인 사항을 함께 적습니다.
        </p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          {[
            [counts.terms, "용어"],
            [225, "와이어프레임"],
            [counts.notes, "운영 노트"],
            [counts.sheets, "점검표"],
          ].map(([n, l]) => (
            <div key={l} className="flex flex-col-reverse">
              <dt className="text-[14px] text-[#5b6370]">{l}</dt>
              <dd className="text-[28px] font-[800] tabular-nums tracking-[-0.03em]">{n}</dd>
            </div>
          ))}
        </dl>
      </header>

      <h2 id="shelf" className={docH2}>분류별로 보기</h2>
      <ul role="list" className="mt-5 grid gap-4 md:grid-cols-3">
        {sections.map((s) => (
          <li key={s.id}>
            <Link href={s.href} className="group block h-full overflow-hidden rounded-lg border border-[#d9dee5] bg-white transition-colors hover:border-[#256ef4]">
              <span className="block aspect-[16/10] overflow-hidden border-b border-[#e6e9ee] bg-[#f5f7fa]">
                <Image src={pics[s.id]} alt="" width={720} height={450} sizes="(min-width: 768px) 320px, 92vw" className="h-full w-full object-cover object-top" />
              </span>
              <span className="block px-4 pb-4 pt-3.5">
                <span className="block text-[18px] font-[800] tracking-[-0.03em] group-hover:text-[#256ef4]">{s.label}</span>
                <span className="mt-1 block text-[14.5px] leading-[1.55] text-[#5b6370]">{s.desc}</span>
                <span className="mt-2 block text-[13.5px] font-bold text-[#256ef4]">{amount[s.id]}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 id="log" className={docH2}>최근 쌓인 기록</h2>
      <ul role="list" className="mt-3">
        {log.map((l, i) => (
          <li key={i} className="border-b border-[#e6e9ee]">
            <Link href={l.href} className="group grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 py-3.5 text-[15px] md:grid-cols-[100px_90px_minmax(0,1fr)]">
              <time dateTime={l.date} className="text-[13.5px] tabular-nums text-[#5b6370]">{l.date}</time>
              <span className="hidden text-[13px] font-[800] text-[#256ef4] md:block">{l.kind}</span>
              <span className="font-bold leading-[1.5] group-hover:text-[#256ef4] group-hover:underline underline-offset-4">{l.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </ArchiveShell>
  );
}
