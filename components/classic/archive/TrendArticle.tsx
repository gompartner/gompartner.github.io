import { ArchiveShell, DocHead, TakeoverBox, docH2 } from "@/components/classic/archive/ArchiveShell";
import { SourceFold } from "@/components/classic/archive/SourceFold";
import { TrendNav } from "@/components/classic/archive/TrendNav";
import { TREND_CHECKED } from "@/data/classic/trendData";

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
  /** 연표 뒤 지금 모습(요즘) */
  now?: string[];
  nowTitle?: string;
  /** 차트 앞에 두는 개념 설명(처음 보는 말을 먼저 풀 때) */
  introTitle?: string;
  intro?: React.ReactNode;
  takeSub: string;
  take: { b: string; t: string }[];
  sources: Src[];
  /** 처음 쓴 날, 고친 날(없으면 공통 값) */
  published?: string;
  updated?: string;
}) {
  const toc = [
    ...(props.intro ? [{ id: "intro", label: props.introTitle ?? "먼저 알아 둘 말" }] : []),
    { id: "chart", label: props.chartTitle },
    { id: "why", label: props.storyTitle },
    ...(props.extra ? [{ id: "wf", label: props.extraTitle ?? "그림" }] : []),
    ...(props.now ? [{ id: "now", label: props.nowTitle ?? "요즘" }] : []),
    { id: "take", label: "인수 시 확인 사항" },
    { id: "src", label: "출처" },
    { id: "rel", label: "관련 문서" },
  ];
  return (
    <ArchiveShell active={props.href} crumbs={[{ href: props.href, label: props.title }]} toc={toc} article={{ title: props.title, description: props.lead, published: props.published, modified: props.updated ?? TREND_CHECKED }}>
      <DocHead title={props.title} meta={[...props.meta, ["최종 수정일", props.updated ?? TREND_CHECKED]]} lead={props.lead} />
      {props.intro ? (
        <>
          <h2 id="intro" className={docH2}>{props.introTitle ?? "먼저 알아 둘 말"}</h2>
          {props.intro}
        </>
      ) : null}
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
      {props.now ? (
        <>
          <h2 id="now" className={docH2}>{props.nowTitle ?? "요즘"}</h2>
          {props.now.map((t, i) => (
            <p key={i} className="mt-4 max-w-[760px] text-[16.5px] leading-[1.8] text-[#2b313b]">{t}</p>
          ))}
        </>
      ) : null}
      <TakeoverBox sub={props.takeSub} items={props.take} />
      <h2 id="src" className={docH2}>출처</h2>
      <SourceFold>
        {props.sources.map((s) => (
          <li key={s.href}>
            <a href={s.href} target="_blank" rel="noopener noreferrer" className={a}>{s.label}</a>
            {s.note ? `: ${s.note}` : ""}
          </li>
        ))}
      </SourceFold>
      <TrendNav current={props.href} />
    </ArchiveShell>
  );
}
