import { ArchiveShell, TakeoverBox, docH2, type Src } from "@/components/classic/archive/ArchiveShell";
import { TREND_CHECKED } from "@/data/classic/trendData";

// 트렌드 문서 공용 틀(11-21): 제목, 차트, 이야기, (그림), 인수 시 확인 사항. 번호와 연재 없음.
// 11-26 출처(sources)와 관련 문서는 문서 틀(ArchiveShell)이 맨 아래 참고 자료 한 칸과 관련 문서 세 개로 보여 준다.
export const docP = "mt-4 text-[17px] leading-[1.8] text-[#2b313b]";

export function TrendArticle(props: {
  href: string;
  crumb: string;
  title: string;
  /** 비교 대상, 기간, 데이터 이름. 11-26부터 머리 정보 줄에는 보이지 않는다(차트 제목과 참고 자료에 같은 내용이 있다) */
  meta?: [string, string][];
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
  ];
  const updated = props.updated ?? TREND_CHECKED;
  return (
    <ArchiveShell
      active={props.href}
      crumbs={[{ href: props.href, label: props.title }]}
      toc={toc}
      head={{ title: props.title, meta: [["최종 수정일", updated]], lead: props.lead }}
      sources={props.sources}
      article={{ title: props.title, description: props.lead, published: props.published, modified: updated }}
    >
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
        <p key={i} className={docP}>{t}</p>
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
            <p key={i} className={docP}>{t}</p>
          ))}
        </>
      ) : null}
      <TakeoverBox sub={props.takeSub} items={props.take} />
    </ArchiveShell>
  );
}
