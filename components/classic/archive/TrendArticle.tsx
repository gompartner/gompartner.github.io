import { ArchiveShell, DocHead, TakeoverBox, docH2 } from "@/components/classic/archive/ArchiveShell";
import { TrendNav } from "@/components/classic/archive/TrendNav";
import { designDocs } from "@/data/classic/archive";
import { TREND_CHECKED } from "@/data/classic/trendData";
import { LdScript } from "@/components/seo/JsonLd";
import { ORG_ID } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

// 트렌드 문서 공용 틀(11-21): 제목, 차트, 이야기, (그림), 인수 시 확인 사항, 출처, 같은 분류의 다른 문서. 번호와 연재 없음.
export type Src = { label: string; href: string; note?: string };
const a = "underline underline-offset-2 hover:text-[#256ef4]";

export function TrendArticle(props: {
  href: string;
  crumb: string;
  title: string;
  meta: [string, string][];
  lead: string;
  chartTitle: string;
  chart: React.ReactNode;
  storyTitle: string;
  story: string[];
  extraTitle?: string;
  extra?: React.ReactNode;
  takeSub: string;
  take: { b: string; t: string }[];
  sources: Src[];
}) {
  const sec = designDocs.some((d) => d.href === props.href) ? { id: "design", href: "/archive/design", label: "디자인 트렌드" } : { id: "tech", href: "/archive/tech", label: "기술 트렌드" };
  const toc = [
    { id: "chart", label: props.chartTitle },
    { id: "why", label: props.storyTitle },
    ...(props.extra ? [{ id: "wf", label: props.extraTitle ?? "그림" }] : []),
    { id: "take", label: "인수 시 확인 사항" },
    { id: "src", label: "출처" },
  ];
  return (
    <ArchiveShell section={sec.id} active={props.href} crumbs={[{ href: "/archive", label: "아카이브" }, { href: sec.href, label: sec.label }, { href: props.href, label: props.crumb }]} toc={toc}>
      {/* 최종 수정일을 검색엔진에도 알린다 */}
      <LdScript data={{ "@context": "https://schema.org", "@type": "Article", headline: props.title, description: props.lead, datePublished: "2026-11-21", dateModified: TREND_CHECKED, author: { "@id": ORG_ID }, publisher: { "@id": ORG_ID }, mainEntityOfPage: `${siteUrl}${props.href}`, inLanguage: "ko" }} />
      <DocHead title={props.title} meta={[...props.meta, ["최종 수정일", TREND_CHECKED]]} lead={props.lead} />
      <h2 id="chart" className={docH2}>{props.chartTitle}</h2>
      {props.chart}
      <h2 id="why" className={docH2}>{props.storyTitle}</h2>
      {props.story.map((t, i) => (
        <p key={i} className="mt-4 max-w-[760px] text-[16.5px] leading-[1.8] text-[#2b313b]">{t}</p>
      ))}
      {props.extra ? (
        <>
          <h2 id="wf" className={docH2}>{props.extraTitle}</h2>
          {props.extra}
        </>
      ) : null}
      <TakeoverBox sub={props.takeSub} items={props.take} />
      <h2 id="src" className={docH2}>출처</h2>
      <ul role="list" className="mt-3 space-y-2 text-[14.5px] leading-[1.6]">
        {props.sources.map((s) => (
          <li key={s.href}>
            <a href={s.href} target="_blank" rel="noopener noreferrer" className={a}>{s.label}</a>
            {s.note ? `: ${s.note}` : ""}
          </li>
        ))}
      </ul>
      <TrendNav current={props.href} />
    </ArchiveShell>
  );
}
