import { ArchiveShell, DocHead, TakeoverBox, docH2 } from "@/components/classic/archive/ArchiveShell";
import { TrendNav } from "@/components/classic/archive/TrendNav";
import { TREND_CHECKED } from "@/data/classic/trendData";

// 트렌드 문서 공용 틀(11-21): 제목, 차트, 이야기, (그림), 인수 시 확인 사항, 출처, 이전 다음.
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
  const toc = [
    { id: "chart", label: props.chartTitle },
    { id: "why", label: props.storyTitle },
    ...(props.extra ? [{ id: "wf", label: props.extraTitle ?? "그림" }] : []),
    { id: "take", label: "인수 시 확인 사항" },
    { id: "src", label: "출처" },
  ];
  return (
    <ArchiveShell section="trends" active={props.href} crumbs={[{ href: "/archive", label: "아카이브" }, { href: "/archive/trends", label: "트렌드" }, { href: props.href, label: props.crumb }]} toc={toc}>
      <DocHead title={props.title} meta={[...props.meta, ["확인일", TREND_CHECKED]]} lead={props.lead} />
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
