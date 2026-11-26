import type { Metadata } from "next";
import { ArchiveShell } from "@/components/classic/archive/ArchiveShell";
import { HistoryView } from "@/components/classic/archive/HistoryView";
import { trendDocs } from "@/data/classic/archive";
import { eras, historyEvents, historyTopics } from "@/data/classic/webHistory";
import { pageMeta } from "@/lib/seo";

// 11-22 한국 웹 연표: 그때그때 쓴 위키 문서를 시대 네 장으로 엮은 첫 읽을거리
const HREF = "/knowledge/history";
const TITLE = "한국 웹 30년: 무료 계정에서 AI 빌더까지";
const LEAD = "1990년대 무료 홈페이지 공간부터 지금의 AI 빌더까지, 한국 웹의 변천사를 시대 네 장으로 정리했습니다. 장마다 그 시대 이야기, 깊이 읽을 문서, 그때 일어난 일을 모았습니다.";

export const metadata: Metadata = pageMeta({ title: `${TITLE} | 위키`, description: LEAD, path: HREF });

const short = (t: string) => t.split(":")[0];

export default function HistoryPage() {
  const title = (href: string) => trendDocs.find((d) => d.href === href)?.title ?? href;
  const eraOf = (y: number) => eras.find((e) => y >= e.from && y <= e.to)?.id ?? eras[0].id;
  // 깊이 읽기: 그 시대에 고른 문서에, 그 시대 사건이 나온 문서를 더한다(사건 줄마다 붙던 문서 링크를 여기 한 줄로 모았다)
  const readOf = (e: (typeof eras)[number]) => [...new Set([...e.read, ...historyEvents.filter((x) => x.href && eraOf(x.year) === e.id).map((x) => x.href!)])];
  // 바깥 출처는 맨 아래 참고 자료 한 칸으로: 출처 이름에 그 사건의 때와 내용을 붙여 어느 사건의 근거인지 남긴다
  const sources = historyEvents.filter((e) => e.src).map((e) => ({ label: e.src!.label, href: e.src!.url, note: `${e.when}, ${e.text}` }));
  return (
    <ArchiveShell
      active={HREF}
      crumbs={[{ href: HREF, label: "한국 웹 30년" }]}
      toc={eras.map((e) => ({ id: e.id, label: `${e.from}~${e.to === 2026 ? "지금" : e.to} ${e.title}` }))}
      head={{ title: TITLE, meta: [["최종 수정일", "2026-11-22"]], lead: LEAD }}
      sources={sources}
      article={{ title: TITLE, description: LEAD, published: "2026-11-22", modified: "2026-11-22" }}
    >
      <HistoryView
        topics={[...historyTopics]}
        eras={eras.map((e) => ({ id: e.id, label: `${e.from}~${e.to === 2026 ? "지금" : e.to}`, title: e.title, story: [...e.story], read: readOf(e).map((h) => ({ href: h, title: short(title(h)) })) }))}
        events={historyEvents.map((e) => ({ era: eraOf(e.year), when: e.when, text: e.text, topic: e.topic, region: e.region }))}
      />
    </ArchiveShell>
  );
}
