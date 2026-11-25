import type { Metadata } from "next";
import { ArchiveShell, DocHead } from "@/components/classic/archive/ArchiveShell";
import { HistoryView } from "@/components/classic/archive/HistoryView";
import { docUpdated, trendDocs } from "@/data/classic/archive";
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
  return (
    <ArchiveShell active={HREF} crumbs={[{ href: HREF, label: "한국 웹 30년" }]} toc={eras.map((e) => ({ id: e.id, label: `${e.from}~${e.to === 2026 ? "지금" : e.to}` }))} article={{ title: TITLE, description: LEAD, published: "2026-11-22", modified: "2026-11-22" }}>
      <DocHead title={TITLE} meta={[["범위", "한국 중심, 세계 흐름 함께"], ["사건", `${historyEvents.length}개`], ["최종 수정일", "2026-11-22"]]} lead={LEAD} />
      <HistoryView
        topics={[...historyTopics]}
        eras={eras.map((e) => ({ id: e.id, label: `${e.from}~${e.to === 2026 ? "지금" : e.to}`, title: e.title, story: [...e.story], read: e.read.map((h) => ({ href: h, title: title(h), ver: docUpdated(h) })) }))}
        events={historyEvents.map((e) => ({ era: eraOf(e.year), when: e.when, text: e.text, topic: e.topic, region: e.region, href: e.href, doc: e.href ? short(title(e.href)) : undefined, src: e.src }))}
      />
    </ArchiveShell>
  );
}
